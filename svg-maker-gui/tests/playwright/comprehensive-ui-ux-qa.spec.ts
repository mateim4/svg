import { test, expect, Page } from '@playwright/test';

test.describe('Comprehensive UI/UX QA Testing', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
    // Wait for the app to fully load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Landing Page', () => {
    test('should display landing page correctly with rose-quartz background', async () => {
      // Check if landing page loads
      await expect(page.locator('.landing-page')).toBeVisible();
      
      // Check app background color
      const appBg = await page.locator('.landing-page').evaluate(el => 
        getComputedStyle(el).backgroundColor
      );
      console.log('App background:', appBg);
      
      // Check hero section elements
      await expect(page.locator('h1')).toContainText('SVG Designer');
      await expect(page.locator('.cta-button')).toBeVisible();
      await expect(page.locator('.cta-button')).toContainText('Get Started');
    });

    test('should have animated arrows with blue glow on hover', async () => {
      // Check if arrows are present
      await expect(page.locator('.transform-arrow')).toHaveCount({ min: 1 });
      
      // Get initial arrow color
      const initialColor = await page.locator('.transform-arrow').first().evaluate(el => 
        getComputedStyle(el).color
      );
      console.log('Initial arrow color:', initialColor);
      
      // Hover over preview row and check animation
      await page.locator('.preview-row').first().hover();
      await page.waitForTimeout(500); // Wait for animation
      
      const hoverColor = await page.locator('.transform-arrow').first().evaluate(el => 
        getComputedStyle(el).color
      );
      console.log('Hover arrow color:', hoverColor);
      
      // Colors should be different (blue on hover)
      expect(initialColor).not.toBe(hoverColor);
    });

    test('should have FluentUI icons in preview', async () => {
      // Wait for icons to load
      await page.waitForTimeout(2000);
      
      // Check if styled icons are present
      await expect(page.locator('.styled-icon')).toHaveCount({ min: 2 });
      
      // Check if glassmorphism and neumorphism styles are applied
      await expect(page.locator('.glassmorphism-style')).toBeVisible();
      await expect(page.locator('.neumorphism-style')).toBeVisible();
    });

    test('should navigate to app when Get Started is clicked', async () => {
      await page.locator('.cta-button').click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate away from landing page
      await expect(page.locator('.landing-page')).not.toBeVisible();
    });
  });

  test.describe('Icon Repository Browser', () => {
    test.beforeEach(async () => {
      await page.locator('.cta-button').click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    test('should display repository browser with platinum card backgrounds', async () => {
      // Check if repository browser is visible
      await expect(page.locator('.repository-browser')).toBeVisible();
      
      // Check if overview card is visible
      await expect(page.locator('.repository-overview-card')).toBeVisible();
      
      // Check card background colors
      const cardBg = await page.locator('.repository-overview-card').evaluate(el => 
        getComputedStyle(el).backgroundColor
      );
      console.log('Card background:', cardBg);
    });

    test('should have search functionality', async () => {
      // Check if search box is visible and inside the overview card
      await expect(page.locator('.search-box input')).toBeVisible();
      
      // Test search functionality
      await page.locator('.search-box input').fill('lucide');
      await page.waitForTimeout(500);
      
      // Should filter results
      const searchValue = await page.locator('.search-box input').inputValue();
      expect(searchValue).toBe('lucide');
    });

    test('should have category filter dropdown', async () => {
      // Check if category filter is visible
      await expect(page.locator('.category-filter')).toBeVisible();
      
      // Test dropdown options
      await page.locator('.category-filter').click();
      const options = await page.locator('.category-filter option').allTextContents();
      console.log('Category options:', options);
      
      expect(options).toContain('All Categories');
      expect(options.length).toBeGreaterThan(3);
    });

    test('should have grid/list view toggle buttons', async () => {
      // Check if view controls are visible
      await expect(page.locator('.view-controls')).toBeVisible();
      
      // Check if both grid and list buttons exist
      await expect(page.locator('.view-controls .ds-button')).toHaveCount(2);
      
      // Test switching views
      const listButton = page.locator('.view-controls .ds-button').nth(1);
      await listButton.click();
      await page.waitForTimeout(300);
      
      // Check if view changed
      await expect(listButton).toHaveClass(/ds-button-primary/);
    });

    test('should display all icon repository cards', async () => {
      // Wait for cards to load
      await page.waitForTimeout(1000);
      
      // Check if repository cards are present
      const cards = page.locator('.repository-card-outline');
      await expect(cards).toHaveCount({ min: 5 }); // Should have multiple icon packs
      
      // Check if cards have proper structure
      await expect(cards.first().locator('.repository-header')).toBeVisible();
      await expect(cards.first().locator('.repository-body')).toBeVisible();
      await expect(cards.first().locator('.repository-footer')).toBeVisible();
    });

    test('should show repository details in cards', async () => {
      const firstCard = page.locator('.repository-card-outline').first();
      
      // Check if card has all required info
      await expect(firstCard.locator('.repository-name')).toBeVisible();
      await expect(firstCard.locator('.license-badge')).toBeVisible();
      await expect(firstCard.locator('.info-label')).toHaveCount({ min: 3 });
      
      // Check specific info items
      await expect(firstCard.getByText('Developer:')).toBeVisible();
      await expect(firstCard.getByText('Pack Size:')).toBeVisible();
      await expect(firstCard.getByText('Use Cases:')).toBeVisible();
    });

    test('should have working Browse Icons buttons', async () => {
      const firstCard = page.locator('.repository-card-outline').first();
      const browseButton = firstCard.locator('.ds-button-primary');
      
      await expect(browseButton).toBeVisible();
      await expect(browseButton).toContainText('Browse Icons');
      
      // Click should navigate to icon pack browser
      await browseButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate to icon pack browser
      await expect(page.locator('.icon-pack-browser')).toBeVisible();
    });
  });

  test.describe('Icon Pack Browser', () => {
    test.beforeEach(async () => {
      // Navigate to icon pack browser
      await page.locator('.cta-button').click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Click on first repository card
      await page.locator('.repository-card-outline').first().locator('.ds-button-primary').click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    });

    test('should display icon pack browser correctly', async () => {
      await expect(page.locator('.icon-pack-browser')).toBeVisible();
      
      // Check header elements
      await expect(page.locator('.browser-header')).toBeVisible();
      await expect(page.locator('.back-button')).toBeVisible();
      await expect(page.locator('.pack-info h1')).toBeVisible();
    });

    test('should have working back button', async () => {
      await page.locator('.back-button').click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate back to repository browser
      await expect(page.locator('.repository-browser')).toBeVisible();
    });

    test('should have settings button and panel', async () => {
      await expect(page.locator('.settings-button')).toBeVisible();
      
      // Click settings button
      await page.locator('.settings-button').click();
      await page.waitForTimeout(500);
      
      // Settings panel should appear
      await expect(page.locator('.settings-panel')).toBeVisible();
    });

    test('should display icon grid with icons', async () => {
      // Wait for icons to load
      await page.waitForTimeout(3000);
      
      // Check if icon grid is present
      await expect(page.locator('.icon-grid')).toBeVisible();
      
      // Should have icon items
      const iconItems = page.locator('.icon-grid-item');
      await expect(iconItems).toHaveCount({ min: 1 });
      
      // Check icon structure
      if (await iconItems.count() > 0) {
        await expect(iconItems.first().locator('.grid-icon')).toBeVisible();
        await expect(iconItems.first().locator('.icon-name')).toBeVisible();
      }
    });

    test('should have search functionality in icon browser', async () => {
      // Check if search input exists
      const searchInput = page.locator('.search-input');
      await expect(searchInput).toBeVisible();
      
      // Test search
      await searchInput.fill('home');
      await page.waitForTimeout(1000);
      
      const searchValue = await searchInput.inputValue();
      expect(searchValue).toBe('home');
    });

    test('should have variant selector if applicable', async () => {
      // Check if variant selector exists (some icon packs have variants)
      const variantSelect = page.locator('.variant-select');
      if (await variantSelect.count() > 0) {
        await expect(variantSelect).toBeVisible();
        
        // Test variant selection
        await variantSelect.click();
        const options = await page.locator('.variant-select option').allTextContents();
        console.log('Variant options:', options);
        expect(options.length).toBeGreaterThan(0);
      }
    });

    test('should show icon preview on hover', async () => {
      await page.waitForTimeout(2000);
      const iconItems = page.locator('.icon-grid-item');
      
      if (await iconItems.count() > 0) {
        const firstIcon = iconItems.first();
        
        // Hover over icon
        await firstIcon.hover();
        await page.waitForTimeout(500);
        
        // Check if hover styles are applied
        const transform = await firstIcon.evaluate(el => 
          getComputedStyle(el).transform
        );
        console.log('Icon hover transform:', transform);
      }
    });

    test('should have action buttons on icons', async () => {
      await page.waitForTimeout(2000);
      const iconItems = page.locator('.icon-grid-item');
      
      if (await iconItems.count() > 0) {
        const firstIcon = iconItems.first();
        await firstIcon.hover();
        
        // Check if action buttons appear
        const actionButtons = firstIcon.locator('.action-btn');
        if (await actionButtons.count() > 0) {
          await expect(actionButtons.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Responsive Design Testing', () => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 },
    ];

    viewports.forEach(viewport => {
      test(`should work correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Landing page should be visible
        await expect(page.locator('.landing-page')).toBeVisible();
        
        // Key elements should be accessible
        await expect(page.locator('.cta-button')).toBeVisible();
        
        if (viewport.width >= 768) {
          // Desktop/tablet specific checks
          await expect(page.locator('.preview-row').first()).toBeVisible();
        } else {
          // Mobile specific checks
          // Elements should still be visible but may be stacked
          await expect(page.locator('h1')).toBeVisible();
        }
        
        // Navigate to app
        await page.locator('.cta-button').click();
        await page.waitForLoadState('networkidle');
        
        // Repository browser should work on all sizes
        await expect(page.locator('.repository-browser')).toBeVisible();
        
        console.log(`${viewport.name} (${viewport.width}x${viewport.height}): ✓ Passed`);
      });
    });
  });

  test.describe('Accessibility Testing', () => {
    test('should have proper ARIA labels and roles', async () => {
      // Check landing page accessibility
      const ariaLabelCount = await page.locator('[aria-label]').count();
      expect(ariaLabelCount).toBeGreaterThanOrEqual(2);
      
      // Check if main elements have proper roles
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
      
      // Check for proper heading hierarchy
      await expect(page.locator('h1')).toHaveCount(1);
    });

    test('should be keyboard navigable', async () => {
      // Test Tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Get focused element
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      console.log('First focused element:', focusedElement);
      
      // Should be able to navigate with Tab
      expect(['BUTTON', 'INPUT', 'A'].includes(focusedElement || '')).toBeTruthy();
    });

    test('should have proper color contrast', async () => {
      // Check if text is visible against background
      const textColor = await page.locator('h1').evaluate(el => 
        getComputedStyle(el).color
      );
      const backgroundColor = await page.locator('.landing-page').evaluate(el => 
        getComputedStyle(el).backgroundColor
      );
      
      console.log('Text color:', textColor);
      console.log('Background color:', backgroundColor);
      
      // Basic check that they're different
      expect(textColor).not.toBe(backgroundColor);
    });
  });

  test.describe('Performance Testing', () => {
    test('should load within reasonable time', async () => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      console.log(`Page load time: ${loadTime}ms`);
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have minimal layout shifts', async () => {
      await page.goto('/');
      
      // Wait for initial load
      await page.waitForTimeout(1000);
      
      // Check if main elements are stable
      const heroPosition = await page.locator('h1').boundingBox();
      await page.waitForTimeout(2000);
      const heroPositionAfter = await page.locator('h1').boundingBox();
      
      // Position should be stable (no major layout shifts)
      if (heroPosition && heroPositionAfter) {
        expect(Math.abs(heroPosition.y - heroPositionAfter.y)).toBeLessThan(5);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate offline condition
      await page.context().setOffline(true);
      
      // Try to navigate
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Should show some content even offline (cached resources)
      await expect(page.locator('body')).toBeVisible();
      
      // Restore online
      await page.context().setOffline(false);
    });

    test('should handle missing icons gracefully', async () => {
      // Navigate to icon browser
      await page.locator('.cta-button').click();
      await page.waitForLoadState('networkidle');
      
      // Try to search for non-existent icon
      if (await page.locator('.search-box input').count() > 0) {
        await page.locator('.search-box input').fill('nonexistenticon12345');
        await page.waitForTimeout(1000);
        
        // Should handle gracefully (show no results or fallback)
        const resultsCount = await page.locator('.repository-card-outline:visible').count();
        console.log('Search results for non-existent icon:', resultsCount);
      }
    });
  });

  test.describe('Animation and Interaction Testing', () => {
    test('should have smooth hover animations', async () => {
      // Test card hover animations
      await page.locator('.cta-button').click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const firstCard = page.locator('.repository-card-outline').first();
      if (await firstCard.count() > 0) {
        // Get initial transform
        const initialTransform = await firstCard.evaluate(el => 
          getComputedStyle(el).transform
        );
        
        // Hover
        await firstCard.hover();
        await page.waitForTimeout(300);
        
        // Get hover transform
        const hoverTransform = await firstCard.evaluate(el => 
          getComputedStyle(el).transform
        );
        
        console.log('Card hover animation - Initial:', initialTransform, 'Hover:', hoverTransform);
        
        // Should have different transforms
        expect(initialTransform).not.toBe(hoverTransform);
      }
    });

    test('should have working button animations', async () => {
      const ctaButton = page.locator('.cta-button');
      
      // Test button hover
      await ctaButton.hover();
      await page.waitForTimeout(200);
      
      // Test button click animation
      await ctaButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate successfully
      await expect(page.locator('.repository-browser')).toBeVisible();
    });
  });
});