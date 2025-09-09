import { test, expect } from '@playwright/test';

test.describe('Icon Colors and Titles Testing', () => {
  test('should have white icon titles and salmon base icons in light mode', async ({ page }) => {
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
    
    // Check the main header icon title
    const headerTitle = page.locator('.overview-header h3');
    await expect(headerTitle).toBeVisible();
    
    const headerTitleColor = await headerTitle.evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    console.log(`Header title color: ${headerTitleColor}`);
    expect(headerTitleColor).toMatch(/rgb\(255,\s*255,\s*255\)|white|#ffffff/i);
    
    // Check the main header icon (Package icon)
    const headerIcon = page.locator('.header-icon svg');
    if (await headerIcon.count() > 0) {
      const headerIconStroke = await headerIcon.evaluate(el => {
        return window.getComputedStyle(el).stroke;
      });
      
      const headerIconFill = await headerIcon.evaluate(el => {
        return window.getComputedStyle(el).fill;
      });
      
      console.log(`Header icon stroke: ${headerIconStroke}`);
      console.log(`Header icon fill: ${headerIconFill}`);
      
      // Should be salmon pink #FF8D99 which is rgb(255, 141, 153)
      const isSalmonColor = (color: string) => {
        return color.includes('255, 141, 153') || 
               color.match(/rgb\(255,\s*141,\s*153\)|#FF8D99/i) || 
               color === 'var(--salmon-pink)';
      };
      
      const hasSalmon = isSalmonColor(headerIconStroke) || isSalmonColor(headerIconFill);
      console.log(`Is salmon colored: ${hasSalmon}`);
      expect(hasSalmon).toBe(true);
    }
    
    // Check repository card titles
    const repoCards = page.locator('.repository-card-outline');
    const cardCount = await repoCards.count();
    console.log(`Found ${cardCount} repository cards`);
    
    if (cardCount > 0) {
      const firstCard = repoCards.first();
      
      // Check repository name (title) color
      const repoName = firstCard.locator('.repository-name');
      const repoNameColor = await repoName.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      console.log(`Repository name color: ${repoNameColor}`);
      expect(repoNameColor).toMatch(/rgb\(255,\s*255,\s*255\)|white|#ffffff/i);
      
      // Check star icons in meta
      const starIcon = firstCard.locator('.meta-item svg').first();
      if (await starIcon.count() > 0) {
        const starStroke = await starIcon.evaluate(el => {
          return window.getComputedStyle(el).stroke;
        });
        
        console.log(`Star icon stroke: ${starStroke}`);
        
        const isSalmonColor = (color: string) => {
          return color.includes('255, 141, 153') || 
                 color.match(/rgb\(255,\s*141,\s*153\)|#FF8D99/i) || 
                 color === 'var(--salmon-pink)';
        };
        
        const hasSalmon = isSalmonColor(starStroke);
        console.log(`Star icon is salmon: ${hasSalmon}`);
        expect(hasSalmon).toBe(true);
      }
      
      // Check that Browse Icons button icons are still white (not salmon)
      const browseButton = firstCard.locator('.action-button');
      const buttonIcon = browseButton.locator('svg').first();
      
      if (await buttonIcon.count() > 0) {
        const buttonIconStroke = await buttonIcon.evaluate(el => {
          return window.getComputedStyle(el).stroke;
        });
        
        console.log(`Button icon stroke: ${buttonIconStroke}`);
        expect(buttonIconStroke).toMatch(/rgb\(255,\s*255,\s*255\)|white|#ffffff/i);
      }
    }
    
    console.log('✅ Icon colors and titles test complete');
  });

  test('should maintain salmon color for all base icons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
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
    
    // Get all SVG icons (excluding button icons)
    const allIcons = page.locator('.repository-overview-card svg, .repository-card-outline svg');
    const iconCount = await allIcons.count();
    console.log(`Found ${iconCount} total icons`);
    
    // Check a sample of icons to ensure they're salmon colored
    const sampleSize = Math.min(5, iconCount);
    
    for (let i = 0; i < sampleSize; i++) {
      const icon = allIcons.nth(i);
      
      // Skip if it's inside an action button
      const isInButton = await icon.evaluate(el => {
        return !!el.closest('.action-button');
      });
      
      if (!isInButton) {
        const iconStroke = await icon.evaluate(el => {
          return window.getComputedStyle(el).stroke;
        });
        
        const iconColor = await icon.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        
        console.log(`Icon ${i + 1} - stroke: ${iconStroke}, color: ${iconColor}`);
        
        const isSalmonColor = (color: string) => {
          return color.includes('255, 141, 153') || 
                 color.match(/rgb\(255,\s*141,\s*153\)|#FF8D99/i) || 
                 color === 'var(--salmon-pink)' ||
                 color.includes('salmon');
        };
        
        // At least one of stroke or color should be salmon
        const hasSalmon = isSalmonColor(iconStroke) || isSalmonColor(iconColor);
        console.log(`Icon ${i + 1} is salmon: ${hasSalmon}`);
        expect(hasSalmon).toBe(true);
      }
    }
    
    console.log('✅ Base icons salmon color test complete');
  });
});