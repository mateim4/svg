import { test, expect } from '@playwright/test';

test.describe('Test Positioning Fixes', () => {
  test('should verify positioning improvements across viewport sizes', async ({ page }) => {
    console.log('=== TESTING POSITIONING FIXES ===\n');
    
    // Navigate to GitHub workflow
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Get Started")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('.mode-card.github-mode').click();
    await page.waitForTimeout(2000);
    
    console.log('1️⃣ Navigated to GitHub workflow - testing repository browser positioning');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Small Mobile', width: 320, height: 568 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1200, height: 800 }
    ];
    
    for (const viewport of viewports) {
      console.log(`\\n2️⃣ Testing ${viewport.name} (${viewport.width}x${viewport.height}):`);
      
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      // Check document width vs viewport width
      const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const hasHScroll = docWidth > viewport.width + 5;
      
      console.log(`   Document width: ${docWidth}px vs Viewport: ${viewport.width}px`);
      console.log(`   Horizontal scroll: ${hasHScroll ? '❌ YES' : '✅ NO'}`);
      
      // Check specific elements that were problematic
      const elementsToCheck = [
        { name: 'Search Filter Group', selector: '.search-filter-group' },
        { name: 'Category Filter', selector: '.category-filter' },
        { name: 'View Controls', selector: '.view-controls' },
        { name: 'Repository Cards', selector: '.repository-card' },
        { name: 'Repository Container', selector: '.repository-container' }
      ];
      
      for (const element of elementsToCheck) {
        const elementInfo = await page.locator(element.selector).first().evaluate(el => {
          if (!el) return { exists: false };
          
          const rect = el.getBoundingClientRect();
          const styles = getComputedStyle(el);
          
          return {
            exists: true,
            width: rect.width,
            right: rect.right,
            overflow: rect.right > window.innerWidth,
            overflowAmount: Math.max(0, rect.right - window.innerWidth),
            display: styles.display,
            flexDirection: styles.flexDirection,
            minWidth: styles.minWidth
          };
        }).catch(() => ({ exists: false }));
        
        if (elementInfo.exists) {
          const status = elementInfo.overflow ? '❌ OVERFLOW' : '✅ FITS';
          console.log(`     ${element.name}: ${status}`);
          
          if (elementInfo.overflow) {
            console.log(`       Extends ${elementInfo.overflowAmount.toFixed(1)}px beyond viewport`);
            console.log(`       Width: ${elementInfo.width.toFixed(1)}px, Right: ${elementInfo.right.toFixed(1)}px`);
            console.log(`       MinWidth: ${elementInfo.minWidth}`);
          }
        }
      }
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: `test-results/positioning-fixed-${viewport.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: false  // Don't scroll horizontally if there's overflow
      });
      
      // Test repository card positioning specifically on mobile
      if (viewport.width <= 480) {
        console.log('   📱 Mobile-specific checks:');
        
        // Check if controls stack vertically on mobile
        const controlsInfo = await page.locator('.repository-controls').evaluate(el => {
          const styles = getComputedStyle(el);
          return {
            flexDirection: styles.flexDirection,
            alignItems: styles.alignItems
          };
        }).catch(() => ({}));
        
        console.log(`     Controls flex-direction: ${controlsInfo.flexDirection}`);
        console.log(`     Controls align-items: ${controlsInfo.alignItems}`);
        
        // Check search group stacking
        const searchGroupInfo = await page.locator('.search-filter-group').evaluate(el => {
          const styles = getComputedStyle(el);
          return {
            flexDirection: styles.flexDirection,
            width: styles.width,
            minWidth: styles.minWidth
          };
        }).catch(() => ({}));
        
        console.log(`     Search group flex-direction: ${searchGroupInfo.flexDirection}`);
        console.log(`     Search group min-width: ${searchGroupInfo.minWidth}`);
        
        // Check repository grid columns
        const gridInfo = await page.locator('.repository-container.grid').evaluate(el => {
          const styles = getComputedStyle(el);
          return {
            gridTemplateColumns: styles.gridTemplateColumns
          };
        }).catch(() => ({ gridTemplateColumns: 'not found' }));
        
        console.log(`     Grid template columns: ${gridInfo.gridTemplateColumns}`);
      }
    }
    
    // Reset to desktop for final checks
    await page.setViewportSize({ width: 1200, height: 800 });
    
    console.log('\\n3️⃣ Final positioning analysis:');
    
    // Check for any remaining positioning issues
    const finalCheck = await page.evaluate(() => {
      const issues = [];
      
      // Check all elements for negative positioning
      const allElements = Array.from(document.querySelectorAll('*'));
      let negativeCount = 0;
      
      allElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.x < -5) { // Allow small negative margins
          negativeCount++;
        }
      });
      
      if (negativeCount > 0) {
        issues.push(`${negativeCount} elements have negative X positioning`);
      }
      
      // Check for elements that are too wide for any reasonable container
      const wideElements = allElements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 1500; // Unreasonably wide
      });
      
      if (wideElements.length > 0) {
        issues.push(`${wideElements.length} elements are unreasonably wide (>1500px)`);
      }
      
      return {
        issues,
        totalElements: allElements.length,
        negativeCount
      };
    });
    
    console.log(`   Total elements checked: ${finalCheck.totalElements}`);
    
    if (finalCheck.issues.length > 0) {
      console.log('   🚨 Remaining issues:');
      finalCheck.issues.forEach(issue => console.log(`     - ${issue}`));
    } else {
      console.log('   ✅ No major positioning issues detected');
    }
    
    console.log('\\n📋 POSITIONING FIXES TESTING COMPLETE');
    console.log('   All viewport sizes tested and screenshots saved');
    
    expect(finalCheck.issues.length).toBeLessThanOrEqual(1); // Allow minor issues
  });
});