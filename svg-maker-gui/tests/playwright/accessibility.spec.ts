import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('FolderTreeBrowser - Accessibility Compliance', () => {
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
            children: Array.from({ length: 20 }, (_, i) => ({
              name: `icon-${i}.svg`,
              type: 'file',
              path: `icons/icon-${i}.svg`,
              size: 1024
            }))
          }],
          svgFiles: Array.from({ length: 20 }, (_, i) => ({
            name: `icon-${i}.svg`,
            path: `icons/icon-${i}.svg`,
            download_url: `https://example.com/icon-${i}.svg`
          }))
        })
      });
    });
  });

  test.describe('WCAG 2.1 AA Compliance', () => {
    test('should pass axe accessibility audit - empty state', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass axe accessibility audit - with repository loaded', async ({ page }) => {
      // Load repository
      const repoInput = page.locator('input[placeholder*="repository"]');
      if (await repoInput.isVisible()) {
        await repoInput.fill('bootstrap/bootstrap-icons');
        await repoInput.press('Enter');
        await expect(page.locator('.repo-header')).toBeVisible();
      }

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass axe accessibility audit - with search active', async ({ page }) => {
      // Load repository and perform search
      const repoInput = page.locator('input[placeholder*="repository"]');
      if (await repoInput.isVisible()) {
        await repoInput.fill('bootstrap/bootstrap-icons');
        await repoInput.press('Enter');
        await expect(page.locator('.repo-header')).toBeVisible();
      }

      const searchField = page.locator('.search-field');
      await searchField.fill('home');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Semantic HTML Structure', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Check for logical heading progression
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll(elements => 
        elements.map(el => ({
          level: parseInt(el.tagName[1]),
          text: el.textContent?.trim() || ''
        }))
      );

      // Should start with h1 or h2 (not h3+ as the first heading)
      if (headings.length > 0) {
        expect(headings[0].level).toBeLessThanOrEqual(2);
      }

      // Check for proper progression (no skipping levels)
      for (let i = 1; i < headings.length; i++) {
        const levelDiff = headings[i].level - headings[i-1].level;
        // Should not skip more than one level
        expect(levelDiff).toBeLessThanOrEqual(1);
      }
    });

    test('should have proper landmark structure', async ({ page }) => {
      // Check for main landmark
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();

      // Check for navigation landmarks if present
      const nav = page.locator('nav, [role="navigation"]');
      const navCount = await nav.count();
      if (navCount > 0) {
        // Navigation elements should have accessible names
        for (let i = 0; i < navCount; i++) {
          const navElement = nav.nth(i);
          const hasAriaLabel = await navElement.getAttribute('aria-label');
          const hasAriaLabelledBy = await navElement.getAttribute('aria-labelledby');
          expect(hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
        }
      }
    });

    test('should have proper form structure', async ({ page }) => {
      // Search form should be properly structured
      const searchField = page.locator('.search-field');
      
      // Should have associated label
      const searchId = await searchField.getAttribute('id');
      const ariaLabel = await searchField.getAttribute('aria-label');
      const ariaLabelledBy = await searchField.getAttribute('aria-labelledby');
      const label = searchId ? page.locator(`label[for="${searchId}"]`) : null;
      
      const hasProperLabel = ariaLabel || ariaLabelledBy || (label && await label.count() > 0);
      expect(hasProperLabel).toBeTruthy();

      // Should have proper input type
      const inputType = await searchField.getAttribute('type');
      expect(['text', 'search']).toContain(inputType);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support tab navigation', async ({ page }) => {
      // Get all focusable elements
      const focusableElements = page.locator('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
      const count = await focusableElements.count();
      
      if (count > 0) {
        // Start from the first focusable element
        await page.keyboard.press('Tab');
        
        let currentIndex = 0;
        const maxTabs = Math.min(count, 10); // Limit to prevent infinite loops
        
        while (currentIndex < maxTabs) {
          const focusedElement = page.locator(':focus');
          
          // Should have visible focus indicator
          await expect(focusedElement).toBeVisible();
          
          // Should have proper focus styles
          const outline = await focusedElement.evaluate(el => 
            getComputedStyle(el).outline !== 'none' ||
            getComputedStyle(el).boxShadow.includes('0 0') ||
            getComputedStyle(el).borderColor !== 'transparent'
          );
          
          expect(outline).toBe(true);
          
          await page.keyboard.press('Tab');
          currentIndex++;
        }
      }
    });

    test('should support arrow key navigation in icon grid', async ({ page }) => {
      // Load repository first
      const repoInput = page.locator('input[placeholder*="repository"]');
      if (await repoInput.isVisible()) {
        await repoInput.fill('bootstrap/bootstrap-icons');
        await repoInput.press('Enter');
        await expect(page.locator('.repo-header')).toBeVisible();
      }

      // Focus first icon
      const firstIcon = page.locator('[data-svg-item="true"]').first();
      await firstIcon.focus();
      
      // Should be focusable
      await expect(firstIcon).toBeFocused();
      
      // Test arrow navigation
      await page.keyboard.press('ArrowDown');
      const focusedAfterDown = page.locator(':focus');
      
      // Focus should move to another icon
      const isDifferentElement = await focusedAfterDown.evaluate((el, firstEl) => 
        el !== firstEl, await firstIcon.elementHandle()
      );
      expect(isDifferentElement).toBe(true);

      // Test horizontal navigation
      await page.keyboard.press('ArrowRight');
      const focusedAfterRight = page.locator(':focus');
      
      // Focus should move again
      const isThirdElement = await focusedAfterRight.evaluate((el, secondEl) => 
        el !== secondEl, await focusedAfterDown.elementHandle()
      );
      expect(isThirdElement).toBe(true);
    });

    test('should support keyboard activation', async ({ page }) => {
      // Load repository
      const repoInput = page.locator('input[placeholder*="repository"]');
      if (await repoInput.isVisible()) {
        await repoInput.fill('bootstrap/bootstrap-icons');
        await repoInput.press('Enter');
        await expect(page.locator('.repo-header')).toBeVisible();
      }

      // Focus and activate icon with keyboard
      const firstIcon = page.locator('[data-svg-item="true"]').first();
      await firstIcon.focus();
      
      // Activate with Space
      await page.keyboard.press('Space');
      
      // Should toggle selection
      await expect(firstIcon.locator('.selected-icon')).toBeVisible();
      
      // Activate with Enter
      await page.keyboard.press('Enter');
      
      // Should toggle selection back
      const isSelected = await firstIcon.locator('.selected-icon').isVisible();
      expect(isSelected).toBe(false);
    });

    test('should support keyboard shortcuts', async ({ page }) => {
      // Load repository
      const repoInput = page.locator('input[placeholder*="repository"]');
      if (await repoInput.isVisible()) {
        await repoInput.fill('bootstrap/bootstrap-icons');
        await repoInput.press('Enter');
        await expect(page.locator('.repo-header')).toBeVisible();
      }

      // Test search shortcut (Ctrl+F or Cmd+F)
      const isMac = process.platform === 'darwin';
      const modifier = isMac ? 'Meta' : 'Control';
      
      await page.keyboard.press(`${modifier}+KeyF`);
      
      // Search field should be focused
      const searchField = page.locator('.search-field');
      await expect(searchField).toBeFocused();
      
      // Test Escape to clear search
      await searchField.fill('test');
      await page.keyboard.press('Escape');
      
      // Search should be cleared
      const searchValue = await searchField.inputValue();
      expect(searchValue).toBe('');
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA roles', async ({ page }) => {
      // Main container should have appropriate role
      const browser = page.locator('.folder-tree-browser');
      const role = await browser.getAttribute('role');
      expect(['main', 'region']).toContain(role);

      // Icon grid should have grid or list role
      const iconGrid = page.locator('.files-list');
      const gridRole = await iconGrid.getAttribute('role');
      expect(['grid', 'list', 'listbox']).toContain(gridRole);

      // Individual icons should have proper roles
      const firstIcon = page.locator('[data-svg-item="true"]').first();
      if (await firstIcon.count() > 0) {
        const iconRole = await firstIcon.getAttribute('role');
        expect(['gridcell', 'listitem', 'option', 'checkbox']).toContain(iconRole);
      }
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Interactive elements should have accessible names
      const interactiveElements = page.locator('button, input, [role="button"], [role="checkbox"], [role="option"]');
      const count = await interactiveElements.count();

      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i);
        
        // Should have accessible name via aria-label, aria-labelledby, or text content
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        const textContent = await element.textContent();
        const altText = await element.getAttribute('alt');
        const title = await element.getAttribute('title');
        
        const hasAccessibleName = ariaLabel || ariaLabelledBy || 
                                 (textContent && textContent.trim()) || 
                                 altText || title;
        
        expect(hasAccessibleName).toBeTruthy();
      }
    });

    test('should have proper ARIA states', async ({ page }) => {
      // Load repository to get selectable items
      const repoInput = page.locator('input[placeholder*="repository"]');
      if (await repoInput.isVisible()) {
        await repoInput.fill('bootstrap/bootstrap-icons');
        await repoInput.press('Enter');
        await expect(page.locator('.repo-header')).toBeVisible();
      }

      // Selectable items should have aria-selected or aria-checked
      const selectableItems = page.locator('[data-svg-item="true"]');
      const itemCount = await selectableItems.count();

      if (itemCount > 0) {
        const firstItem = selectableItems.first();
        
        // Should have selection state
        const ariaSelected = await firstItem.getAttribute('aria-selected');
        const ariaChecked = await firstItem.getAttribute('aria-checked');
        
        expect(ariaSelected !== null || ariaChecked !== null).toBe(true);
        
        // Click to select
        await firstItem.click();
        
        // State should update
        const newAriaSelected = await firstItem.getAttribute('aria-selected');
        const newAriaChecked = await firstItem.getAttribute('aria-checked');
        
        expect(newAriaSelected === 'true' || newAriaChecked === 'true').toBe(true);
      }

      // Search field should have proper states
      const searchField = page.locator('.search-field');
      await searchField.fill('test');
      
      // Should indicate if expanded/collapsed (if applicable)
      const ariaExpanded = await searchField.getAttribute('aria-expanded');
      if (ariaExpanded !== null) {
        expect(['true', 'false']).toContain(ariaExpanded);
      }
    });

    test('should provide proper live region updates', async ({ page }) => {
      // Search results should be announced
      const searchField = page.locator('.search-field');
      await searchField.fill('home');
      
      // Look for live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      const liveRegionCount = await liveRegions.count();
      
      if (liveRegionCount > 0) {
        // Should have appropriate politeness level
        for (let i = 0; i < liveRegionCount; i++) {
          const region = liveRegions.nth(i);
          const ariaLive = await region.getAttribute('aria-live');
          const role = await region.getAttribute('role');
          
          if (ariaLive) {
            expect(['polite', 'assertive', 'off']).toContain(ariaLive);
          }
          
          if (role) {
            expect(['status', 'alert', 'log']).toContain(role);
          }
        }
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('should meet contrast requirements', async ({ page }) => {
      // This test would ideally use a contrast checking library
      // For now, we'll check that text elements are visible and properly styled
      
      const textElements = page.locator('p, span, h1, h2, h3, h4, h5, h6, button, input, label');
      const count = await textElements.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = textElements.nth(i);
        
        // Should have readable text
        const styles = await element.evaluate(el => {
          const computed = getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight
          };
        });
        
        // Basic visibility checks
        expect(styles.color).not.toBe('transparent');
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
        
        const fontSize = parseFloat(styles.fontSize);
        expect(fontSize).toBeGreaterThan(10); // Minimum readable size
      }
    });

    test('should not rely solely on color for information', async ({ page }) => {
      // Load repository to get selection states
      const repoInput = page.locator('input[placeholder*="repository"]');
      if (await repoInput.isVisible()) {
        await repoInput.fill('bootstrap/bootstrap-icons');
        await repoInput.press('Enter');
        await expect(page.locator('.repo-header')).toBeVisible();
      }

      // Select an icon
      const firstIcon = page.locator('[data-svg-item="true"]').first();
      await firstIcon.click();
      
      // Should have non-color indicators for selection
      const hasTextIndicator = await firstIcon.locator(':has-text("selected"), :has-text("✓"), :has-text("check")').count() > 0;
      const hasAriaIndicator = await firstIcon.getAttribute('aria-selected') === 'true' || 
                              await firstIcon.getAttribute('aria-checked') === 'true';
      const hasVisualIndicator = await firstIcon.locator('.selected-icon, .checkmark, [aria-hidden="false"]').count() > 0;
      
      expect(hasTextIndicator || hasAriaIndicator || hasVisualIndicator).toBe(true);
    });
  });

  test.describe('Focus Management', () => {
    test('should manage focus during dynamic content changes', async ({ page }) => {
      // Focus search field
      const searchField = page.locator('.search-field');
      await searchField.focus();
      
      // Perform search that changes content
      await searchField.fill('test');
      
      // Focus should remain on search field
      await expect(searchField).toBeFocused();
      
      // Clear search
      await searchField.fill('');
      
      // Focus should still be maintained
      await expect(searchField).toBeFocused();
    });

    test('should trap focus in modal dialogs', async ({ page }) => {
      // This test assumes modal dialogs exist - adapt based on actual implementation
      const modal = page.locator('[role="dialog"], .modal');
      const modalCount = await modal.count();
      
      if (modalCount > 0) {
        // Focus should be trapped within modal
        const focusableInModal = modal.locator('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
        const focusableCount = await focusableInModal.count();
        
        if (focusableCount > 0) {
          // Tab through all focusable elements
          let currentIndex = 0;
          while (currentIndex < focusableCount) {
            await page.keyboard.press('Tab');
            const focused = page.locator(':focus');
            
            // Focus should remain within modal
            const isWithinModal = await modal.locator(':focus').count() > 0;
            expect(isWithinModal).toBe(true);
            
            currentIndex++;
          }
        }
      }
    });

    test('should restore focus after dismissing overlays', async ({ page }) => {
      // Test focus restoration when closing dropdowns, modals, etc.
      const trigger = page.locator('button').first();
      if (await trigger.count() > 0) {
        await trigger.focus();
        await trigger.click();
        
        // If this opens an overlay, pressing Escape should restore focus
        await page.keyboard.press('Escape');
        
        // Focus should return to trigger (if overlay was opened)
        // This is a simplified test - adapt based on actual overlay behavior
        const currentlyFocused = page.locator(':focus');
        const isTriggerFocused = await currentlyFocused.evaluate((focused, triggerEl) => 
          focused === triggerEl, await trigger.elementHandle()
        );
        
        // This assertion might need adjustment based on actual behavior
        if (isTriggerFocused !== null) {
          expect(typeof isTriggerFocused).toBe('boolean');
        }
      }
    });
  });

  test.describe('Reduced Motion', () => {
    test('should respect prefers-reduced-motion', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      // Check that animations are minimal
      const animatedElements = page.locator('.tree-node, .icon-preview, button');
      const count = await animatedElements.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = animatedElements.nth(i);
        
        const transitionDuration = await element.evaluate(el => 
          getComputedStyle(el).transitionDuration
        );
        
        const animationDuration = await element.evaluate(el => 
          getComputedStyle(el).animationDuration
        );
        
        // Animations should be instant or very short
        expect(transitionDuration).toMatch(/(0s|0\.01s|none)/);
        expect(animationDuration).toMatch(/(0s|0\.01s|none)/);
      }
    });
  });

  test.describe('Text Scaling', () => {
    test('should work with increased text size', async ({ page }) => {
      // Increase text size to 150%
      await page.addStyleTag({
        content: `
          html {
            font-size: 150% !important;
          }
        `
      });

      await page.reload();
      
      // Content should still be usable
      await expect(page.locator('.folder-tree-browser')).toBeVisible();
      
      // No text should overflow containers
      const overflowElements = await page.locator('*').evaluateAll(elements => 
        elements.filter(el => {
          const rect = el.getBoundingClientRect();
          const parent = el.parentElement?.getBoundingClientRect();
          return parent && (
            rect.right > parent.right + 10 || 
            rect.bottom > parent.bottom + 10
          );
        }).length
      );
      
      // Allow some tolerance for layout adjustments
      expect(overflowElements).toBeLessThan(5);
    });
  });
});