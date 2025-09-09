import { test, expect } from '@playwright/test';

test.describe('FolderTreeBrowser - Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SVG Maker/);
    
    // Mock repository data for consistency
    await page.route('**/api/github/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tree: [{
            name: 'icons',
            type: 'dir',
            children: Array.from({ length: 50 }, (_, i) => ({
              name: `icon-${i}.svg`,
              type: 'file',
              path: `icons/icon-${i}.svg`,
              size: 1024 + i * 100
            }))
          }],
          svgFiles: Array.from({ length: 50 }, (_, i) => ({
            name: `icon-${i}.svg`,
            path: `icons/icon-${i}.svg`,
            download_url: `https://example.com/icon-${i}.svg`
          }))
        })
      });
    });
  });

  test.describe('Mobile Portrait (375x667)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should adapt layout for mobile portrait', async ({ page }) => {
      // Check mobile-first layout
      const browser = page.locator('.folder-tree-browser');
      await expect(browser).toBeVisible();
      
      // Repository header should stack vertically
      const repoHeader = page.locator('.repo-header');
      await expect(repoHeader).toHaveCSS('flex-direction', 'column');
      
      // Search should be full width
      const searchField = page.locator('.search-field');
      await expect(searchField).toHaveCSS('width', /100%|375px/);
      
      // Action buttons should wrap or stack
      const actionButtons = page.locator('.action-buttons');
      await expect(actionButtons).toHaveCSS('flex-wrap', 'wrap');
    });

    test('should handle touch interactions', async ({ page }) => {
      // Load repository
      const repoInput = page.locator('input[placeholder*="repository"]');
      if (await repoInput.isVisible()) {
        await repoInput.tap();
        await repoInput.fill('bootstrap/bootstrap-icons');
        await page.keyboard.press('Enter');
      }

      // Wait for content to load
      await expect(page.locator('.tree-node')).toHaveCountGreaterThan(0);
      
      // Test touch selection
      const firstIcon = page.locator('[data-svg-item="true"]').first();
      await firstIcon.tap();
      
      // Check selection indicator
      await expect(firstIcon.locator('.selected-icon')).toBeVisible();
      
      // Test touch scrolling
      const filesList = page.locator('.files-list');
      await filesList.scrollIntoView();
      
      // Perform touch scroll
      await filesList.hover();
      await page.mouse.wheel(0, 200);
      
      // Should maintain smooth scrolling
      const scrollTop = await filesList.evaluate(el => el.scrollTop);
      expect(scrollTop).toBeGreaterThan(0);
    });

    test('should prevent horizontal scrolling', async ({ page }) => {
      // Check document width
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 5); // Allow 5px tolerance
      
      // Check for overflow elements
      const overflowElements = await page.locator('*').evaluateAll(elements => 
        elements.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.right > window.innerWidth;
        }).length
      );
      
      expect(overflowElements).toBe(0);
    });
  });

  test.describe('Mobile Landscape (667x375)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 });
    });

    test('should optimize for landscape orientation', async ({ page }) => {
      // Header should use horizontal layout
      const repoHeader = page.locator('.repo-header');
      await expect(repoHeader).toHaveCSS('flex-direction', 'row');
      
      // Files list should use more vertical space
      const filesList = page.locator('.files-list');
      const height = await filesList.boundingBox();
      expect(height?.height).toBeGreaterThan(200);
      
      // Search and actions should be in same row
      const searchSection = page.locator('.search-section');
      await expect(searchSection).toHaveCSS('flex-direction', 'row');
    });
  });

  test.describe('Tablet (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('should use tablet-optimized layout', async ({ page }) => {
      // Should show more icons per row
      const iconGrid = page.locator('.files-list');
      const gridCols = await iconGrid.evaluate(el => 
        getComputedStyle(el).getPropertyValue('grid-template-columns')
      );
      
      // Should have at least 4 columns on tablet
      const columnCount = gridCols.split(' ').length;
      expect(columnCount).toBeGreaterThanOrEqual(4);
      
      // Repository card should have medium padding
      const repoHeader = page.locator('.repo-header');
      const padding = await repoHeader.evaluate(el => 
        getComputedStyle(el).getPropertyValue('padding')
      );
      expect(padding).toContain('24px'); // Medium padding
    });

    test('should handle medium-density content', async ({ page }) => {
      // Icon previews should be visible and properly sized
      await expect(page.locator('.icon-preview')).toHaveCountGreaterThan(0);
      
      const iconPreview = page.locator('.icon-preview').first();
      const size = await iconPreview.boundingBox();
      
      // Icons should be appropriately sized for tablet
      expect(size?.width).toBeGreaterThan(20);
      expect(size?.width).toBeLessThan(48);
    });
  });

  test.describe('Desktop (1920x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('should use full desktop layout', async ({ page }) => {
      // Should show maximum icons per row
      const iconGrid = page.locator('.files-list');
      const gridCols = await iconGrid.evaluate(el => 
        getComputedStyle(el).getPropertyValue('grid-template-columns')
      );
      
      // Should have at least 8 columns on desktop
      const columnCount = gridCols.split(' ').length;
      expect(columnCount).toBeGreaterThanOrEqual(8);
      
      // Repository card should have full padding
      const repoHeader = page.locator('.repo-header');
      const padding = await repoHeader.evaluate(el => 
        getComputedStyle(el).getPropertyValue('padding')
      );
      expect(padding).toContain('32px'); // Full padding
    });

    test('should optimize for mouse interactions', async ({ page }) => {
      // Hover states should be visible
      const firstIcon = page.locator('[data-svg-item="true"]').first();
      await firstIcon.hover();
      
      // Should have hover effect
      await expect(firstIcon).toHaveCSS('transform', /scale/);
      
      // Tooltips should appear on hover
      await expect(page.locator('[role="tooltip"]')).toBeVisible();
    });
  });

  test.describe('Ultra-wide (2560x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 2560, height: 1080 });
    });

    test('should handle ultra-wide displays', async ({ page }) => {
      // Content should not stretch too wide
      const browser = page.locator('.folder-tree-browser');
      const width = await browser.boundingBox();
      
      // Should have maximum width constraint
      expect(width?.width).toBeLessThan(1800);
      
      // Should be centered
      const marginLeft = await browser.evaluate(el => 
        getComputedStyle(el).getPropertyValue('margin-left')
      );
      expect(marginLeft).toBe('auto');
    });
  });

  test.describe('Dynamic Viewport Changes', () => {
    test('should adapt to viewport size changes', async ({ page }) => {
      // Start with mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      const iconGrid = page.locator('.files-list');
      const initialCols = await iconGrid.evaluate(el => 
        getComputedStyle(el).getPropertyValue('grid-template-columns').split(' ').length
      );
      
      // Resize to desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(100); // Allow for CSS transitions
      
      const newCols = await iconGrid.evaluate(el => 
        getComputedStyle(el).getPropertyValue('grid-template-columns').split(' ').length
      );
      
      // Should have more columns on desktop
      expect(newCols).toBeGreaterThan(initialCols);
    });

    test('should maintain scroll position during resize', async ({ page }) => {
      // Start with desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Scroll down
      const filesList = page.locator('.files-list');
      await filesList.evaluate(el => { el.scrollTop = 500; });
      
      const initialScrollTop = await filesList.evaluate(el => el.scrollTop);
      
      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(100);
      
      // Should maintain relative scroll position
      const newScrollTop = await filesList.evaluate(el => el.scrollTop);
      expect(newScrollTop).toBeGreaterThan(initialScrollTop * 0.5);
    });
  });

  test.describe('Content Density Adaptation', () => {
    test('should adjust icon density based on viewport', async ({ page }) => {
      const testSizes = [
        { width: 375, height: 667, expectedMin: 2, expectedMax: 4 },
        { width: 768, height: 1024, expectedMin: 4, expectedMax: 6 },
        { width: 1920, height: 1080, expectedMin: 8, expectedMax: 12 }
      ];

      for (const size of testSizes) {
        await page.setViewportSize(size);
        await page.waitForTimeout(100);
        
        const iconGrid = page.locator('.files-list');
        const gridCols = await iconGrid.evaluate(el => 
          getComputedStyle(el).getPropertyValue('grid-template-columns')
        );
        
        const columnCount = gridCols.split(' ').length;
        expect(columnCount).toBeGreaterThanOrEqual(size.expectedMin);
        expect(columnCount).toBeLessThanOrEqual(size.expectedMax);
      }
    });

    test('should scale typography appropriately', async ({ page }) => {
      const testSizes = [375, 768, 1920];
      const fontSizes: number[] = [];

      for (const width of testSizes) {
        await page.setViewportSize({ width, height: 1080 });
        await page.waitForTimeout(100);
        
        const repoName = page.locator('.repo-name');
        const fontSize = await repoName.evaluate(el => 
          parseFloat(getComputedStyle(el).fontSize)
        );
        
        fontSizes.push(fontSize);
      }

      // Font sizes should increase with viewport size
      expect(fontSizes[1]).toBeGreaterThan(fontSizes[0]); // tablet > mobile
      expect(fontSizes[2]).toBeGreaterThanOrEqual(fontSizes[1]); // desktop >= tablet
    });
  });

  test.describe('Performance on Different Viewports', () => {
    test('should maintain performance across viewports', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 1920, height: 1080 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        
        // Measure rendering performance
        const renderStart = await page.evaluate(() => performance.now());
        
        // Trigger re-render
        await page.locator('.search-field').fill('test');
        await page.locator('.search-field').fill('');
        
        const renderEnd = await page.evaluate(() => performance.now());
        const renderTime = renderEnd - renderStart;
        
        // Should render quickly on all viewports
        expect(renderTime).toBeLessThan(500);
      }
    });
  });
});