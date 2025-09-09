import { test, expect } from '@playwright/test';

test.describe('Coolors Palette Integration Testing', () => {
  test('should use new color palette correctly in light mode', async ({ page }) => {
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
    
    // Test 1: App background should be sage green (#E1E6E1)
    const appBackground = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`App background: ${appBackground}`);
    
    // Should be #E1E6E1 which is rgb(225, 230, 225)
    expect(appBackground).toMatch(/rgb\(225,\s*230,\s*225\)|#E1E6E1/i);
    
    // Test 2: Card background should be navy dark (#0D1821)
    const overviewCard = page.locator('.repository-overview-card');
    await expect(overviewCard).toBeVisible();
    
    const cardBgColor = await overviewCard.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log(`Card background: ${cardBgColor}`);
    
    // Should be #0D1821 which is rgb(13, 24, 33)
    expect(cardBgColor).toMatch(/rgb\(13,\s*24,\s*33\)|#0D1821/i);
    
    // Test 3: Icons should be crimson (#DB4357) - accent color
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
      
      // Should be #DB4357 which is rgb(219, 67, 87)
      const isCrimson = (color: string) => {
        return color.includes('219, 67, 87') || 
               color.match(/rgb\(219,\s*67,\s*87\)|#DB4357/i) || 
               color === '#DB4357';
      };
      
      const hasCrimson = isCrimson(iconStroke) || isCrimson(iconColor);
      console.log(`Header icon is crimson: ${hasCrimson}`);
      expect(hasCrimson).toBe(true);
    }
    
    // Test 4: Text on dark cards should be cream (#FFFCF9)
    const repoCards = page.locator('.repository-card-outline');
    const cardCount = await repoCards.count();
    console.log(`Found ${cardCount} repository cards`);
    
    if (cardCount > 0) {
      const firstCard = repoCards.first();
      
      // Check repository name text
      const repoName = firstCard.locator('.repository-name');
      const nameColor = await repoName.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      console.log(`Repository name color: ${nameColor}`);
      
      // Should be #FFFCF9 which is rgb(255, 252, 249) or white
      expect(nameColor).toMatch(/rgb\(255,\s*252,\s*249\)|rgb\(255,\s*255,\s*255\)|white|#FFFCF9|#ffffff/i);
    }
    
    console.log('✅ Coolors palette integration test complete');
  });

  test('should use new color palette correctly in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to repository browser
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Switch to dark mode
    const themeToggle = page.locator('.theme-toggle');
    if (await themeToggle.count() > 0) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Verify we're in dark mode
    const theme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`Current theme: ${theme}`);
    expect(theme).toBe('dark');
    
    // Test 1: App background should be navy dark (#0D1821)
    const appBackground = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Dark mode app background: ${appBackground}`);
    
    // Should be #0D1821 which is rgb(13, 24, 33)
    expect(appBackground).toMatch(/rgb\(13,\s*24,\s*33\)|#0D1821/i);
    
    // Test 2: Card backgrounds should be charcoal (#534D56)
    const overviewCard = page.locator('.repository-overview-card');
    if (await overviewCard.count() > 0) {
      const cardBgColor = await overviewCard.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log(`Dark mode card background: ${cardBgColor}`);
      
      // Should be charcoal or related color
      const isCharcoalish = cardBgColor.includes('83, 77, 86') || 
                           cardBgColor.includes('103, 95, 106') ||
                           cardBgColor.match(/rgb\(83,\s*77,\s*86\)|#534D56/i);
      console.log(`Card has charcoal-ish color: ${isCharcoalish}`);
      expect(isCharcoalish).toBe(true);
    }
    
    // Test 3: Text should be cream/light in dark mode
    const repoCards = page.locator('.repository-card-outline');
    if (await repoCards.count() > 0) {
      const firstCard = repoCards.first();
      const repoName = firstCard.locator('.repository-name');
      
      if (await repoName.count() > 0) {
        const nameColor = await repoName.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        console.log(`Dark mode repository name color: ${nameColor}`);
        
        // Should be light colored (cream, light gray, white, etc.)
        const isLightText = nameColor.match(/rgb\(255,\s*252,\s*249\)|rgb\(255,\s*255,\s*255\)|rgb\(196,\s*191,\s*198\)|white|#FFFCF9|#ffffff|#C4BFC6/i);
        console.log(`Text is light colored: ${!!isLightText}`);
        expect(isLightText).toBeTruthy();
      }
    }
    
    console.log('✅ Dark mode color palette test complete');
  });

  test('should have proper contrast ratios with new palette', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    
    // Test in light mode
    const theme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 'light';
    });
    
    if (theme === 'dark') {
      await page.locator('.theme-toggle').click();
      await page.waitForTimeout(500);
    }
    
    // Test contrast between navy cards and cream text
    const overviewCard = page.locator('.repository-overview-card');
    
    if (await overviewCard.count() > 0) {
      const bgColor = await overviewCard.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      const textElement = page.locator('.overview-header h3').first();
      if (await textElement.count() > 0) {
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
      }
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