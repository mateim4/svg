import { test, expect } from '@playwright/test';

test.describe('New Color Scheme Testing', () => {
  test('should have new color scheme: bright red icons, light gray background, dark cards', async ({ page }) => {
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
    
    // Test 1: App background should be #E1E6E1 (light gray)
    const appBackground = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`App background: ${appBackground}`);
    
    // Should be #E1E6E1 which is rgb(225, 230, 225)
    expect(appBackground).toMatch(/rgb\(225,\s*230,\s*225\)|#E1E6E1/i);
    
    // Test 2: Card background should be #121113 (very dark)
    const overviewCard = page.locator('.repository-overview-card');
    await expect(overviewCard).toBeVisible();
    
    const cardBgColor = await overviewCard.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log(`Card background: ${cardBgColor}`);
    
    // Should be #121113 which is rgb(18, 17, 19)
    expect(cardBgColor).toMatch(/rgb\(18,\s*17,\s*19\)|#121113/i);
    
    // Test 3: Icons should be #FF4B4B (bright red)
    const headerIcon = page.locator('.header-icon svg').first();
    if (await headerIcon.count() > 0) {
      const iconStroke = await headerIcon.evaluate(el => {
        return window.getComputedStyle(el).stroke;
      });
      
      const iconColor = await headerIcon.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      
      console.log(`Header icon stroke: ${iconStroke}`);
      console.log(`Header icon color: ${iconColor}`);
      
      // Should be #FF4B4B which is rgb(255, 75, 75)
      const isBrightRed = (color: string) => {
        return color.includes('255, 75, 75') || 
               color.match(/rgb\(255,\s*75,\s*75\)|#FF4B4B/i) || 
               color === '#FF4B4B';
      };
      
      const hasRed = isBrightRed(iconStroke) || isBrightRed(iconColor);
      console.log(`Header icon is bright red: ${hasRed}`);
      expect(hasRed).toBe(true);
    }
    
    // Test 4: Repository card icons should be bright red
    const repoCards = page.locator('.repository-card-outline');
    const cardCount = await repoCards.count();
    console.log(`Found ${cardCount} repository cards`);
    
    if (cardCount > 0) {
      const firstCard = repoCards.first();
      
      // Check star icon
      const starIcon = firstCard.locator('.meta-item svg').first();
      if (await starIcon.count() > 0) {
        const starStroke = await starIcon.evaluate(el => {
          return window.getComputedStyle(el).stroke;
        });
        
        console.log(`Star icon stroke: ${starStroke}`);
        
        const isBrightRed = (color: string) => {
          return color.includes('255, 75, 75') || 
                 color.match(/rgb\(255,\s*75,\s*75\)|#FF4B4B/i) || 
                 color === '#FF4B4B';
        };
        
        const hasRedStar = isBrightRed(starStroke);
        console.log(`Star icon is bright red: ${hasRedStar}`);
        expect(hasRedStar).toBe(true);
      }
      
      // Text should still be white
      const repoName = firstCard.locator('.repository-name');
      const nameColor = await repoName.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      console.log(`Repository name color: ${nameColor}`);
      expect(nameColor).toMatch(/rgb\(255,\s*255,\s*255\)|white|#ffffff/i);
    }
    
    console.log('✅ New color scheme test complete');
  });

  test('should have good contrast with new color scheme', async ({ page }) => {
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
    
    // Test contrast between card background (#121113) and white text
    const overviewCard = page.locator('.repository-overview-card');
    
    const bgColor = await overviewCard.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    const textElement = page.locator('.overview-header h3').first();
    const textColor = await textElement.evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    console.log(`Card Background: ${bgColor}, Text: ${textColor}`);
    
    // Parse RGB values for contrast calculation
    const bgMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const textMatch = textColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    
    if (bgMatch && textMatch) {
      const bgLuminance = getLuminance(parseInt(bgMatch[1]), parseInt(bgMatch[2]), parseInt(bgMatch[3]));
      const textLuminance = getLuminance(parseInt(textMatch[1]), parseInt(textMatch[2]), parseInt(textMatch[3]));
      
      const contrast = (Math.max(bgLuminance, textLuminance) + 0.05) / (Math.min(bgLuminance, textLuminance) + 0.05);
      
      console.log(`Contrast ratio: ${contrast.toFixed(2)}`);
      
      // WCAG AA requires minimum 4.5:1 for normal text
      expect(contrast).toBeGreaterThanOrEqual(4.5);
      console.log('✅ Contrast meets WCAG AA standards');
    }
    
    console.log('✅ Contrast test complete');
  });
});

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}