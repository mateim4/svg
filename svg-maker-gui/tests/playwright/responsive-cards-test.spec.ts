import { test, expect } from '@playwright/test';

test.describe('Repository Cards Responsive Testing', () => {
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Small Mobile', width: 320, height: 568 }
  ];

  viewports.forEach(viewport => {
    test(`should display cards properly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      // Set viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Navigate to the app
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Click Get Started to go to repository browser
      await page.locator('.cta-button').click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Check that the overview card is visible and properly sized
      const overviewCard = page.locator('.repository-overview-card');
      await expect(overviewCard).toBeVisible();
      
      // Get the card dimensions
      const cardBox = await overviewCard.boundingBox();
      console.log(`${viewport.name} - Overview card width: ${cardBox?.width}px`);
      
      // Verify card doesn't overflow viewport
      if (cardBox) {
        expect(cardBox.width).toBeLessThanOrEqual(viewport.width);
        console.log(`✅ ${viewport.name}: Overview card fits within viewport`);
      }
      
      // Check repository cards
      const repoCards = page.locator('.repository-card-outline');
      const cardCount = await repoCards.count();
      console.log(`${viewport.name} - Found ${cardCount} repository cards`);
      
      // Check first card dimensions
      if (cardCount > 0) {
        const firstCard = repoCards.first();
        const firstCardBox = await firstCard.boundingBox();
        
        if (firstCardBox) {
          console.log(`${viewport.name} - First card width: ${firstCardBox.width}px`);
          expect(firstCardBox.width).toBeLessThanOrEqual(viewport.width);
          
          // Check that card has proper padding
          expect(firstCardBox.width).toBeGreaterThan(100);
        }
      }
      
      // Check that cards are arranged properly
      const gridContainer = page.locator('.overview-repositories');
      const gridStyle = await gridContainer.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          gridTemplateColumns: computed.gridTemplateColumns,
          gap: computed.gap
        };
      });
      
      console.log(`${viewport.name} - Grid style:`, gridStyle);
      
      // Verify grid is working
      expect(gridStyle.display).toBe('grid');
      
      // Check for horizontal scroll (should not exist)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalScroll) {
        console.log(`⚠️ ${viewport.name}: Horizontal scroll detected!`);
      } else {
        console.log(`✅ ${viewport.name}: No horizontal scroll`);
      }
      expect(hasHorizontalScroll).toBe(false);
      
      // Check button responsiveness
      const browseButtons = page.locator('.action-button');
      const buttonCount = await browseButtons.count();
      
      if (buttonCount > 0) {
        const firstButton = browseButtons.first();
        const buttonBox = await firstButton.boundingBox();
        
        if (buttonBox) {
          console.log(`${viewport.name} - Button width: ${buttonBox.width}px`);
          // Button should not overflow its container
          expect(buttonBox.width).toBeLessThanOrEqual(viewport.width - 40); // Account for padding
        }
      }
      
      // Check text wrapping
      const longTexts = page.locator('.art-direction-text');
      const textCount = await longTexts.count();
      
      if (textCount > 0) {
        const firstText = longTexts.first();
        const textOverflow = await firstText.evaluate(el => {
          return el.scrollWidth > el.clientWidth;
        });
        
        if (textOverflow) {
          console.log(`⚠️ ${viewport.name}: Text overflow detected`);
        } else {
          console.log(`✅ ${viewport.name}: Text wrapping properly`);
        }
      }
      
      console.log(`✅ ${viewport.name} responsive test complete\n`);
    });
  });

  test('should handle dynamic content resize', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    
    // Start with desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    // Gradually resize to mobile
    const sizes = [1366, 1024, 768, 480, 375, 320];
    
    for (const width of sizes) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(300);
      
      // Check for horizontal scroll at each size
      const hasScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      console.log(`Width ${width}px: ${hasScroll ? '❌ Has horizontal scroll' : '✅ No horizontal scroll'}`);
      expect(hasScroll).toBe(false);
    }
    
    console.log('✅ Dynamic resize test complete');
  });
});