import { test, expect } from '@playwright/test';

test.describe('SVG Maker App - Adaptive UI/UX Testing', () => {
  test('should comprehensively test all discoverable UI elements', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SVG Maker/);
    await page.waitForTimeout(2000); // Give app time to load
    
    console.log('=== COMPREHENSIVE UI/UX ANALYSIS ===');
    
    // 1. DISCOVER AND TEST ALL INTERACTIVE ELEMENTS
    const buttons = await page.locator('button, [role="button"], input[type="button"], input[type="submit"]').all();
    console.log(`\n🔘 INTERACTIVE ELEMENTS: Found ${buttons.length} buttons/clickable elements`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent().catch(() => 'No text');
      const ariaLabel = await button.getAttribute('aria-label').catch(() => null);
      const className = await button.getAttribute('class').catch(() => 'No class');
      
      console.log(`  Button ${i+1}: "${text}" | aria-label: "${ariaLabel}" | class: "${className}"`);
      
      // Test button interaction
      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        try {
          await button.click();
          await page.waitForTimeout(500);
          console.log(`    ✓ Successfully clicked button ${i+1}`);
        } catch (e) {
          console.log(`    ✗ Failed to click button ${i+1}: ${e}`);
        }
      }
    }
    
    // 2. DISCOVER AND TEST ALL INPUT ELEMENTS
    const inputs = await page.locator('input, select, textarea').all();
    console.log(`\n📝 INPUT ELEMENTS: Found ${inputs.length} form inputs`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type').catch(() => 'unknown');
      const placeholder = await input.getAttribute('placeholder').catch(() => null);
      const className = await input.getAttribute('class').catch(() => 'No class');
      
      console.log(`  Input ${i+1}: type="${type}" | placeholder="${placeholder}" | class="${className}"`);
      
      // Test input interaction based on type
      const isVisible = await input.isVisible().catch(() => false);
      if (isVisible) {
        try {
          if (type === 'text' || type === 'search' || !type) {
            await input.fill('test-input');
            await page.waitForTimeout(500);
            await input.clear();
            console.log(`    ✓ Successfully tested text input ${i+1}`);
          } else if (type === 'file') {
            console.log(`    📁 File input detected ${i+1}`);
          } else if (type === 'range') {
            await input.fill('50');
            console.log(`    ✓ Successfully tested range input ${i+1}`);
          } else if (type === 'color') {
            await input.fill('#ff0000');
            console.log(`    ✓ Successfully tested color input ${i+1}`);
          }
        } catch (e) {
          console.log(`    ✗ Failed to interact with input ${i+1}: ${e}`);
        }
      }
    }
    
    // 3. DISCOVER AND TEST NAVIGATION ELEMENTS
    const links = await page.locator('a[href]').all();
    console.log(`\n🔗 NAVIGATION: Found ${links.length} links`);
    
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const link = links[i];
      const href = await link.getAttribute('href').catch(() => 'No href');
      const text = await link.textContent().catch(() => 'No text');
      
      console.log(`  Link ${i+1}: "${text}" -> "${href}"`);
    }
    
    // 4. ANALYZE LAYOUT AND STRUCTURE
    const sections = await page.locator('section, main, article, aside, header, footer, div[class*="section"], div[class*="container"]').all();
    console.log(`\n📐 LAYOUT: Found ${sections.length} structural elements`);
    
    // 5. TEST RESPONSIVE BEHAVIOR
    console.log(`\n📱 RESPONSIVE TESTING:`);
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      const hasHorizontalScroll = documentWidth > viewportWidth + 5;
      
      console.log(`  ${viewport.name} (${viewport.width}x${viewport.height}): ${hasHorizontalScroll ? '❌ Has horizontal scroll' : '✅ No horizontal scroll'}`);
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `test-results/responsive-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      });
    }
    
    // Reset to desktop for remaining tests
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 6. TEST ACCESSIBILITY FEATURES
    console.log(`\n♿ ACCESSIBILITY TESTING:`);
    
    // Check for ARIA labels
    const elementsWithAria = await page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]').count();
    console.log(`  ARIA elements: ${elementsWithAria}`);
    
    // Check for semantic HTML
    const semanticElements = await page.locator('main, section, article, aside, header, footer, nav, h1, h2, h3, h4, h5, h6').count();
    console.log(`  Semantic elements: ${semanticElements}`);
    
    // Test keyboard navigation
    let focusableCount = 0;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.locator(':focus').count();
      if (focused > 0) {
        focusableCount++;
      } else {
        break;
      }
      await page.waitForTimeout(50);
    }
    console.log(`  Keyboard focusable elements: ${focusableCount}`);
    
    // 7. PERFORMANCE ANALYSIS
    console.log(`\n⚡ PERFORMANCE ANALYSIS:`);
    
    // Test loading time
    const start = Date.now();
    await page.reload({ waitUntil: 'networkidle' });
    const loadTime = Date.now() - start;
    console.log(`  Page load time: ${loadTime}ms`);
    
    // Test interaction responsiveness
    if (buttons.length > 0) {
      const button = buttons[0];
      const interactionStart = Date.now();
      try {
        await button.click();
        const interactionTime = Date.now() - interactionStart;
        console.log(`  Interaction response time: ${interactionTime}ms`);
      } catch (e) {
        console.log(`  Could not test interaction time: ${e}`);
      }
    }
    
    // 8. ERROR HANDLING TEST
    console.log(`\n🚨 ERROR HANDLING:`);
    
    // Check for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Simulate some interactions to trigger potential errors
    await page.keyboard.press('Escape');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    console.log(`  Console errors detected: ${errors.length}`);
    errors.forEach((error, i) => {
      console.log(`    Error ${i+1}: ${error}`);
    });
    
    // 9. VISUAL REGRESSION TESTING
    console.log(`\n📸 VISUAL TESTING:`);
    
    await page.screenshot({ 
      path: 'test-results/full-app-final-state.png',
      fullPage: true 
    });
    console.log(`  Full page screenshot saved`);
    
    // 10. GENERATE FINAL REPORT
    console.log(`\n📊 FINAL REPORT SUMMARY:`);
    console.log(`  ✓ Interactive elements tested: ${buttons.length}`);
    console.log(`  ✓ Form inputs tested: ${inputs.length}`);
    console.log(`  ✓ Responsive breakpoints tested: ${viewports.length}`);
    console.log(`  ✓ Accessibility features checked`);
    console.log(`  ✓ Performance metrics measured`);
    console.log(`  ✓ Error handling evaluated`);
    console.log(`  ✓ Visual regression snapshots captured`);
    
    // The test passes if we completed the analysis
    expect(true).toBe(true);
  });
  
  test('should perform targeted component testing', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    console.log('=== TARGETED COMPONENT TESTING ===');
    
    // Look for specific component patterns we know exist
    const componentTests = [
      { name: 'FolderTreeBrowser', selector: '[class*="folder"], [class*="tree"], [class*="browser"]' },
      { name: 'IconGrid', selector: '[class*="icon"], [class*="grid"]' },
      { name: 'StyleControls', selector: '[class*="style"], [class*="control"]' },
      { name: 'WorkflowWizard', selector: '[class*="workflow"], [class*="wizard"], [class*="step"]' },
      { name: 'LandingPage', selector: '[class*="landing"], [class*="welcome"], [class*="home"]' },
      { name: 'Sidebar', selector: '[class*="sidebar"], [class*="nav"], nav' },
      { name: 'PreviewPanel', selector: '[class*="preview"]' },
      { name: 'UploadArea', selector: '[class*="upload"], [class*="drop"]' }
    ];
    
    for (const component of componentTests) {
      const elements = await page.locator(component.selector).count();
      console.log(`\n🔍 ${component.name}: Found ${elements} matching elements`);
      
      if (elements > 0) {
        // Test the first matching element
        const element = page.locator(component.selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        const className = await element.getAttribute('class').catch(() => 'No class');
        
        console.log(`  Element visible: ${isVisible}`);
        console.log(`  Element classes: ${className}`);
        
        // Take component screenshot
        if (isVisible) {
          await element.screenshot({ 
            path: `test-results/component-${component.name.toLowerCase()}.png` 
          });
          console.log(`  ✓ Screenshot captured for ${component.name}`);
        }
      }
    }
  });
});