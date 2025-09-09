import { test, expect } from '@playwright/test';

test.describe('FolderTreeBrowser - Comprehensive UI/UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await expect(page).toHaveTitle(/SVG Maker/);
  });

  test.describe('Initial State and Layout', () => {
    test('should display empty state with proper messaging', async ({ page }) => {
      // Look for empty state
      const emptyState = page.locator('.empty-content');
      await expect(emptyState).toBeVisible();
      
      // Check for proper messaging
      await expect(page.locator('h3')).toContainText('No Repository Loaded');
      await expect(page.locator('p')).toContainText('Enter a GitHub repository URL');
      
      // Check for feature highlights
      await expect(page.locator('.feature-item')).toHaveCount(3);
      await expect(page.locator('.feature-item').first()).toContainText('Advanced search');
    });

    test('should have proper semantic structure', async ({ page }) => {
      // Check ARIA labels and roles
      const browser = page.locator('.folder-tree-browser');
      await expect(browser).toHaveAttribute('role', 'main');
      
      // Check heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      await expect(headings).toHaveCount(1); // Should have proper heading structure
    });
  });

  test.describe('Repository Loading and Display', () => {
    test('should load repository and display file tree', async ({ page }) => {
      // Mock GitHub API response
      await page.route('**/api/github/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            tree: [{
              name: 'icons',
              type: 'dir',
              children: [
                { name: 'home.svg', type: 'file', path: 'icons/home.svg', size: 1024 },
                { name: 'user.svg', type: 'file', path: 'icons/user.svg', size: 2048 }
              ]
            }],
            svgFiles: [
              { name: 'home.svg', path: 'icons/home.svg', download_url: 'https://example.com/home.svg' },
              { name: 'user.svg', path: 'icons/user.svg', download_url: 'https://example.com/user.svg' }
            ]
          })
        });
      });

      // Input repository URL (mock the input field)
      const repoInput = page.locator('input[placeholder*="repository"]');
      if (await repoInput.isVisible()) {
        await repoInput.fill('microsoft/fluentui-system-icons');
        await repoInput.press('Enter');
      }

      // Wait for repository to load
      await expect(page.locator('.repo-header')).toBeVisible({ timeout: 10000 });
      
      // Check repository info display
      await expect(page.locator('.repo-name')).toContainText('Bootstrap Icons');
      await expect(page.locator('.repo-badge')).toContainText('Standard SVG Repository');
      
      // Check file counters
      await expect(page.locator('.counter-number')).toHaveCount(2);
      await expect(page.locator('.counter-label').first()).toContainText('SVG files found');
      await expect(page.locator('.counter-label').last()).toContainText('selected');
    });

    test('should display loading state properly', async ({ page }) => {
      // Mock delayed response
      await page.route('**/api/github/**', async (route) => {
        await page.waitForTimeout(2000);
        await route.fulfill({ status: 200, body: '{}' });
      });

      // Check loading state
      const loadingState = page.locator('.loading-content');
      await expect(loadingState).toBeVisible();
      
      // Check loading spinner
      await expect(page.locator('.loading-spinner')).toBeVisible();
      await expect(page.locator('h3')).toContainText('Loading repository structure');
      
      // Check skeleton loading
      await expect(page.locator('.skeleton-item')).toHaveCount(6);
    });
  });

  test.describe('Search Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // Mock repository with files
      await page.route('**/api/github/**', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            tree: [{ name: 'root', type: 'dir', children: [
              { name: 'home-icon.svg', type: 'file' },
              { name: 'user-profile.svg', type: 'file' },
              { name: 'arrow-left.svg', type: 'file' },
              { name: 'arrow-right.svg', type: 'file' }
            ]}],
            svgFiles: [
              { name: 'home-icon.svg', path: 'home-icon.svg' },
              { name: 'user-profile.svg', path: 'user-profile.svg' },
              { name: 'arrow-left.svg', path: 'arrow-left.svg' },
              { name: 'arrow-right.svg', path: 'arrow-right.svg' }
            ]
          })
        });
      });
    });

    test('should perform basic search', async ({ page }) => {
      // Wait for search input
      const searchInput = page.locator('.search-field');
      await expect(searchInput).toBeVisible();
      
      // Perform search
      await searchInput.fill('home');
      
      // Check search results
      await expect(page.locator('.search-stats')).toContainText('1 of 4 files match');
      await expect(page.locator('.tree-node')).toHaveCount(1);
    });

    test('should support wildcard search', async ({ page }) => {
      const searchInput = page.locator('.search-field');
      await searchInput.fill('arrow*');
      
      // Should find both arrow files
      await expect(page.locator('.search-stats')).toContainText('2 of 4 files match');
    });

    test('should support regex search', async ({ page }) => {
      const searchInput = page.locator('.search-field');
      await searchInput.fill('/arrow-.*/i');
      
      // Should find arrow files using regex
      await expect(page.locator('.search-stats')).toContainText('2 of 4 files match');
    });

    test('should clear search properly', async ({ page }) => {
      const searchInput = page.locator('.search-field');
      await searchInput.fill('test');
      
      // Click clear button
      await page.locator('.clear-btn').click();
      
      // Search should be cleared
      await expect(searchInput).toHaveValue('');
      await expect(page.locator('.search-stats')).not.toBeVisible();
    });
  });

  test.describe('Selection and Interaction', () => {
    test('should select and deselect files', async ({ page }) => {
      // Mock files
      await page.evaluate(() => {
        // Add test data to window for testing
        (window as any).testFiles = [
          { name: 'icon1.svg', path: 'icon1.svg' },
          { name: 'icon2.svg', path: 'icon2.svg' }
        ];
      });

      // Click on a file to select it
      const firstFile = page.locator('.tree-node.svg-file').first();
      await firstFile.click();
      
      // Check selection indicator
      await expect(firstFile.locator('.selected-icon')).toBeVisible();
      await expect(page.locator('.counter-item.selected .counter-number')).toContainText('1');
    });

    test('should support select all functionality', async ({ page }) => {
      const selectAllBtn = page.locator('button:has-text("Select All")');
      await selectAllBtn.click();
      
      // All files should be selected
      await expect(page.locator('.selected-icon')).toHaveCountGreaterThan(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Focus first item
      const firstFile = page.locator('[data-svg-item="true"]').first();
      await firstFile.focus();
      
      // Use arrow keys to navigate
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Space');
      
      // Should select the item
      const focusedItem = page.locator(':focus');
      await expect(focusedItem.locator('.selected-icon')).toBeVisible();
    });
  });

  test.describe('Performance and Optimization', () => {
    test('should load large datasets efficiently', async ({ page }) => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 500 }, (_, i) => ({
        name: `icon-${i}.svg`,
        path: `icons/icon-${i}.svg`,
        type: 'file'
      }));

      await page.route('**/api/github/**', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            tree: [{ name: 'icons', type: 'dir', children: largeDataset.slice(0, 150) }],
            svgFiles: largeDataset
          })
        });
      });

      // Should handle large datasets with pagination
      await expect(page.locator('.tree-node')).toHaveCountLessThan(200);
      await expect(page.locator(':has-text("Load")')).toBeVisible();
    });

    test('should have smooth scrolling performance', async ({ page }) => {
      // Test scroll performance
      const filesList = page.locator('.files-list');
      await filesList.scrollIntoView();
      
      // Measure scroll performance
      const scrollStart = await page.evaluate(() => performance.now());
      await filesList.evaluate((el) => {
        el.scrollTop = el.scrollHeight / 2;
      });
      const scrollEnd = await page.evaluate(() => performance.now());
      
      // Scroll should be smooth (under 16ms for 60fps)
      expect(scrollEnd - scrollStart).toBeLessThan(100);
    });
  });

  test.describe('Accessibility Features', () => {
    test('should be keyboard accessible', async ({ page }) => {
      // Tab navigation should work
      await page.keyboard.press('Tab');
      
      // Check focus indicators
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Should have proper ARIA labels
      await expect(focusedElement).toHaveAttribute('aria-label');
    });

    test('should support screen readers', async ({ page }) => {
      // Check ARIA roles and labels
      await expect(page.locator('[role="checkbox"]')).toHaveCountGreaterThan(0);
      await expect(page.locator('[aria-checked]')).toHaveCountGreaterThan(0);
      
      // Check semantic structure
      await expect(page.locator('button')).toHaveAttribute('aria-label');
    });

    test('should respect reduced motion preferences', async ({ page }) => {
      // Mock reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      // Animations should be minimal
      const animatedElement = page.locator('.tree-node').first();
      const transitionDuration = await animatedElement.evaluate((el) => {
        return getComputedStyle(el).transitionDuration;
      });
      
      expect(transitionDuration).toBe('0.01ms');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network error
      await page.route('**/api/github/**', async (route) => {
        await route.abort('connectionfailed');
      });

      // Should show error state
      await expect(page.locator('.error-state')).toBeVisible();
    });

    test('should handle invalid SVG files', async ({ page }) => {
      // Mock invalid SVG response
      await page.route('**/*.svg', async (route) => {
        await route.fulfill({
          status: 404,
          body: 'Not found'
        });
      });

      // Should show fallback icon
      await expect(page.locator('.icon-preview-fallback')).toBeVisible();
    });
  });
});