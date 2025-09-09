import { test, expect } from '@playwright/test';

test.describe('Icon Grid Colors Testing', () => {
  test('should have white text for icon grid items in light mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to repository browser
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Ensure we're in light mode
    const theme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 'light';
    });
    console.log(`Current theme: ${theme}`);
    
    // If not in light mode, switch to light mode
    if (theme === 'dark') {
      await page.locator('.theme-toggle').click();
      await page.waitForTimeout(500);
    }
    
    // Click on the first "Browse Icons" button to go to icon grid
    const browseButtons = page.locator('.action-button.ds-button-primary');
    const buttonCount = await browseButtons.count();
    console.log(`Found ${buttonCount} Browse Icons buttons`);
    
    if (buttonCount > 0) {
      await browseButtons.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Wait for icons to load
      
      // Check for icon grid items
      const iconGridItems = page.locator('.icon-grid-item');
      const gridItemCount = await iconGridItems.count();
      console.log(`Found ${gridItemCount} icon grid items`);
      
      if (gridItemCount > 0) {
        // Test the first few icon grid items
        const testCount = Math.min(5, gridItemCount);
        
        for (let i = 0; i < testCount; i++) {
          const iconItem = iconGridItems.nth(i);
          
          // Check icon name color
          const iconName = iconItem.locator('.icon-name');
          if (await iconName.count() > 0) {
            const nameColor = await iconName.evaluate(el => {
              return window.getComputedStyle(el).color;
            });
            console.log(`Icon ${i + 1} name color: ${nameColor}`);
            expect(nameColor).toMatch(/rgb\(255,\s*255,\s*255\)|white|#ffffff/i);
          }
          
          // Check icon categories color
          const iconCategories = iconItem.locator('.icon-categories');
          if (await iconCategories.count() > 0) {
            const categoriesColor = await iconCategories.evaluate(el => {
              return window.getComputedStyle(el).color;
            });
            console.log(`Icon ${i + 1} categories color: ${categoriesColor}`);
            expect(categoriesColor).toMatch(/rgb\(255,\s*255,\s*255\)|white|#ffffff/i);
          }
          
          // Check that the icon itself is salmon colored
          const iconSvg = iconItem.locator('svg').first();
          if (await iconSvg.count() > 0) {
            const iconStroke = await iconSvg.evaluate(el => {
              return window.getComputedStyle(el).stroke;
            });
            
            const iconColor = await iconSvg.evaluate(el => {
              return window.getComputedStyle(el).color;
            });
            
            console.log(`Icon ${i + 1} SVG - stroke: ${iconStroke}, color: ${iconColor}`);
            
            const isSalmonColor = (color: string) => {
              return color.includes('255, 141, 153') || 
                     color.match(/rgb\(255,\s*141,\s*153\)|#FF8D99/i) || 
                     color === 'var(--salmon-pink)';
            };
            
            // Icon should be salmon colored
            const hasSalmon = isSalmonColor(iconStroke) || isSalmonColor(iconColor);
            console.log(`Icon ${i + 1} SVG is salmon: ${hasSalmon}`);
            expect(hasSalmon).toBe(true);
          }
        }
        
        console.log('✅ Icon grid text and icon colors test complete');
      } else {
        console.log('⚠️ No icon grid items found - may need more time to load');
        
        // Try waiting a bit more and check again
        await page.waitForTimeout(3000);
        const retryCount = await iconGridItems.count();
        console.log(`Retry count: ${retryCount} icon grid items`);
        
        if (retryCount > 0) {
          // Test first item
          const firstIcon = iconGridItems.first();
          const iconName = firstIcon.locator('.icon-name');
          
          if (await iconName.count() > 0) {
            const nameColor = await iconName.evaluate(el => {
              return window.getComputedStyle(el).color;
            });
            console.log(`First icon name color: ${nameColor}`);
            expect(nameColor).toMatch(/rgb\(255,\s*255,\s*255\)|white|#ffffff/i);
          }
        }
      }
    } else {
      console.log('⚠️ No Browse Icons buttons found');
    }
  });

  test('should maintain white text when hovering over icon grid items', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to icon grid
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    
    // Ensure light mode
    const theme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 'light';
    });
    
    if (theme === 'dark') {
      await page.locator('.theme-toggle').click();
      await page.waitForTimeout(500);
    }
    
    // Click Browse Icons
    const browseButtons = page.locator('.action-button.ds-button-primary');
    if (await browseButtons.count() > 0) {
      await browseButtons.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const iconGridItems = page.locator('.icon-grid-item');
      const gridItemCount = await iconGridItems.count();
      
      if (gridItemCount > 0) {
        const firstIcon = iconGridItems.first();
        
        // Hover over the first icon
        await firstIcon.hover();
        await page.waitForTimeout(300);
        
        // Check text color after hover
        const iconName = firstIcon.locator('.icon-name');
        if (await iconName.count() > 0) {
          const hoverColor = await iconName.evaluate(el => {
            return window.getComputedStyle(el).color;
          });
          console.log(`Icon name color on hover: ${hoverColor}`);
          expect(hoverColor).toMatch(/rgb\(255,\s*255,\s*255\)|white|#ffffff/i);
        }
        
        console.log('✅ Hover state maintains white text');
      }
    }
  });
});