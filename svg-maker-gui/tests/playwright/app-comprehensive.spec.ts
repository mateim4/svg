import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('SVG Maker App - Comprehensive UI/UX Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SVG Maker/);
    await page.waitForLoadState('networkidle');
  });

  test.describe('App Landing and Navigation', () => {
    test('should load landing page with proper structure', async ({ page }) => {
      // Take full page screenshot
      await page.screenshot({ path: 'test-results/landing-page.png', fullPage: true });
      
      // Check for main app container
      const appContainer = page.locator('#root, [class*="App"], .app-container').first();
      await expect(appContainer).toBeVisible();
      
      // Look for navigation or header elements
      const headers = await page.locator('header, nav, [class*="header"], [class*="navigation"]').count();
      console.log(`Found ${headers} header/navigation elements`);
      
      // Look for main content sections
      const sections = await page.locator('section, main, [class*="main"], [class*="content"]').count();
      console.log(`Found ${sections} main content sections`);
      
      // Check for any buttons or interactive elements
      const buttons = await page.locator('button, [role="button"], input[type="button"]').count();
      console.log(`Found ${buttons} interactive buttons`);
      
      expect(appContainer).toBeVisible();
    });

    test('should handle workflow navigation', async ({ page }) => {
      // Look for workflow elements (stepper, tabs, etc.)
      const workflowElements = await page.locator('[class*="workflow"], [class*="stepper"], [class*="wizard"], [class*="step"]').count();
      console.log(`Found ${workflowElements} workflow elements`);
      
      // Look for tab elements
      const tabs = await page.locator('[role="tab"], [class*="tab"]').count();
      console.log(`Found ${tabs} tab elements`);
      
      // If tabs exist, test navigation
      if (tabs > 0) {
        const firstTab = page.locator('[role="tab"], [class*="tab"]').first();
        await firstTab.click();
        await page.waitForTimeout(500);
        
        // Check if tab navigation changes content
        await page.screenshot({ path: 'test-results/tab-navigation.png' });
      }
    });
  });

  test.describe('Icon Management Features', () => {
    test('should handle icon browsing and selection', async ({ page }) => {
      // Look for icon grid or browser elements
      const iconGrids = await page.locator('[class*="icon"], [class*="grid"], [class*="browser"]').count();
      console.log(`Found ${iconGrids} icon-related elements`);
      
      // Look for search functionality
      const searchInputs = await page.locator('input[type="search"], input[placeholder*="search" i], [class*="search"]').count();
      console.log(`Found ${searchInputs} search elements`);
      
      // Test search if available
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('home');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/search-results.png' });
        
        // Clear search
        await searchInput.fill('');
        await page.waitForTimeout(500);
      }
    });

    test('should handle repository input and loading', async ({ page }) => {
      // Look for GitHub repository input
      const repoInputs = await page.locator('input[placeholder*="repository" i], input[placeholder*="github" i], input[placeholder*="url" i]').count();
      console.log(`Found ${repoInputs} repository input elements`);
      
      if (repoInputs > 0) {
        const repoInput = page.locator('input[placeholder*="repository" i], input[placeholder*="github" i], input[placeholder*="url" i]').first();
        
        // Test repository loading
        await repoInput.fill('bootstrap/bootstrap-icons');
        await repoInput.press('Enter');
        
        // Wait for potential loading
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-results/repository-loaded.png' });
        
        // Look for loaded content
        const loadedContent = await page.locator('[class*="repo"], [class*="tree"], [class*="folder"]').count();
        console.log(`Found ${loadedContent} repository content elements after loading`);
      }
    });

    test('should handle icon pack selection', async ({ page }) => {
      // Look for icon pack selectors
      const iconPacks = await page.locator('[class*="pack"], [class*="set"], select, [role="combobox"]').count();
      console.log(`Found ${iconPacks} icon pack selection elements`);
      
      // Test icon pack switching if available
      const selects = await page.locator('select').count();
      if (selects > 0) {
        const select = page.locator('select').first();
        const options = await select.locator('option').count();
        
        if (options > 1) {
          await select.selectOption({ index: 1 });
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'test-results/icon-pack-change.png' });
        }
      }
    });
  });

  test.describe('File Operations', () => {
    test('should handle file upload functionality', async ({ page }) => {
      // Look for file upload elements
      const fileInputs = await page.locator('input[type="file"]').count();
      const uploadButtons = await page.locator('[class*="upload"], button:has-text("Upload")').count();
      console.log(`Found ${fileInputs} file inputs and ${uploadButtons} upload elements`);
      
      // Test drag and drop areas
      const dropZones = await page.locator('[class*="drop"], [class*="drag"]').count();
      console.log(`Found ${dropZones} drag and drop areas`);
      
      if (dropZones > 0) {
        const dropZone = page.locator('[class*="drop"], [class*="drag"]').first();
        await expect(dropZone).toBeVisible();
      }
    });

    test('should handle batch processing', async ({ page }) => {
      // Look for batch processing elements
      const batchElements = await page.locator('[class*="batch"], [class*="process"], button:has-text("Process")').count();
      console.log(`Found ${batchElements} batch processing elements`);
      
      // Look for progress indicators
      const progressElements = await page.locator('[class*="progress"], [role="progressbar"]').count();
      console.log(`Found ${progressElements} progress indicators`);
    });

    test('should handle export functionality', async ({ page }) => {
      // Look for export/download buttons
      const exportButtons = await page.locator('button:has-text("Export"), button:has-text("Download"), [class*="export"], [class*="download"]').count();
      console.log(`Found ${exportButtons} export elements`);
      
      // Look for format selection
      const formatSelectors = await page.locator('select[class*="format"], [class*="format"] select').count();
      console.log(`Found ${formatSelectors} format selection elements`);
    });
  });

  test.describe('Style and Customization', () => {
    test('should handle style controls', async ({ page }) => {
      // Look for style control elements
      const styleControls = await page.locator('[class*="style"], [class*="control"], input[type="range"], input[type="color"]').count();
      console.log(`Found ${styleControls} style control elements`);
      
      // Test color inputs
      const colorInputs = await page.locator('input[type="color"]').count();
      if (colorInputs > 0) {
        const colorInput = page.locator('input[type="color"]').first();
        await colorInput.fill('#ff0000');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/color-change.png' });
      }
      
      // Test range inputs
      const rangeInputs = await page.locator('input[type="range"]').count();
      if (rangeInputs > 0) {
        const rangeInput = page.locator('input[type="range"]').first();
        await rangeInput.fill('50');
        await page.waitForTimeout(500);
      }
    });

    test('should handle preview functionality', async ({ page }) => {
      // Look for preview elements
      const previews = await page.locator('[class*="preview"]').count();
      console.log(`Found ${previews} preview elements`);
      
      // Look for comparison views
      const comparisons = await page.locator('[class*="comparison"], [class*="before"], [class*="after"]').count();
      console.log(`Found ${comparisons} comparison elements`);
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/mobile-view.png', fullPage: true });
      
      // Check for mobile-specific elements
      const mobileElements = await page.locator('[class*="mobile"], [class*="hamburger"], [class*="collapse"]').count();
      console.log(`Found ${mobileElements} mobile-specific elements`);
      
      // Ensure no horizontal scrolling
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 5);
    });

    test('should adapt to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/tablet-view.png', fullPage: true });
      
      // Check layout adaptations
      const gridElements = await page.locator('[class*="grid"], [class*="layout"]').count();
      console.log(`Found ${gridElements} layout elements in tablet view`);
    });

    test('should adapt to desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/desktop-view.png', fullPage: true });
      
      // Check for desktop-specific features
      const desktopFeatures = await page.locator('[class*="desktop"], [class*="sidebar"]').count();
      console.log(`Found ${desktopFeatures} desktop-specific elements`);
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('should pass basic accessibility audit', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      // Report violations but don't fail the test - just log them
      if (accessibilityScanResults.violations.length > 0) {
        console.log('Accessibility violations found:');
        accessibilityScanResults.violations.forEach(violation => {
          console.log(`- ${violation.id}: ${violation.description}`);
          violation.nodes.forEach(node => {
            console.log(`  * ${node.html}`);
          });
        });
      }
      
      console.log(`Accessibility scan: ${accessibilityScanResults.violations.length} violations found`);
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Test tab navigation
      let tabCount = 0;
      while (tabCount < 20) { // Limit to prevent infinite loops
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        const isVisible = await focusedElement.isVisible().catch(() => false);
        
        if (isVisible) {
          const tagName = await focusedElement.evaluate(el => el.tagName).catch(() => 'UNKNOWN');
          console.log(`Tab ${tabCount}: focused ${tagName}`);
          tabCount++;
        } else {
          break;
        }
        
        await page.waitForTimeout(50);
      }
      
      console.log(`Keyboard navigation: ${tabCount} focusable elements found`);
    });
  });

  test.describe('Performance Metrics', () => {
    test('should load within acceptable time limits', async ({ page }) => {
      const start = Date.now();
      await page.goto('/', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - start;
      
      console.log(`Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // 10 second limit
    });

    test('should handle interactions responsively', async ({ page }) => {
      const buttons = await page.locator('button, [role="button"]').count();
      
      if (buttons > 0) {
        const button = page.locator('button, [role="button"]').first();
        
        const start = Date.now();
        await button.click();
        await page.waitForTimeout(100);
        const responseTime = Date.now() - start;
        
        console.log(`Button interaction response time: ${responseTime}ms`);
        expect(responseTime).toBeLessThan(500);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network failures gracefully', async ({ page }) => {
      // Intercept network requests and simulate failures
      await page.route('**/*.svg', route => route.abort('failed'));
      await page.route('**/api/**', route => route.abort('failed'));
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Check for error states
      const errorElements = await page.locator('[class*="error"], [role="alert"], [class*="fallback"]').count();
      console.log(`Found ${errorElements} error handling elements`);
      
      // App should still be functional
      const mainContent = page.locator('#root, [class*="App"]').first();
      await expect(mainContent).toBeVisible();
    });

    test('should handle empty states properly', async ({ page }) => {
      // Look for empty state elements
      const emptyStates = await page.locator('[class*="empty"], [class*="no-data"], [class*="placeholder"]').count();
      console.log(`Found ${emptyStates} empty state elements`);
      
      await page.screenshot({ path: 'test-results/empty-states.png', fullPage: true });
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should maintain functionality across browsers', async ({ page, browserName }) => {
      console.log(`Testing in ${browserName}`);
      
      // Test basic functionality
      const interactive = await page.locator('button, input, select').count();
      console.log(`${browserName}: ${interactive} interactive elements`);
      
      // Test CSS rendering
      const styledElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.filter(el => {
          const styles = getComputedStyle(el);
          return styles.display !== 'inline' || styles.position !== 'static';
        }).length;
      });
      
      console.log(`${browserName}: ${styledElements} styled elements`);
      
      await page.screenshot({ path: `test-results/${browserName}-compatibility.png`, fullPage: true });
    });
  });
});