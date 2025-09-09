import { test, expect } from '@playwright/test';

test.describe('Light Mode Color Changes', () => {
  test('should have dark card backgrounds with white text in light mode', async ({ page }) => {
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
    
    // Check the main overview card background
    const overviewCard = page.locator('.repository-overview-card');
    await expect(overviewCard).toBeVisible();
    
    const cardBgColor = await overviewCard.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    console.log(`Overview card background: ${cardBgColor}`);
    
    // Should be #534d56 which is rgb(83, 77, 86)
    expect(cardBgColor).toMatch(/rgb\(83,\s*77,\s*86\)|#534d56/i);
    
    // Check that text is white
    const headerText = page.locator('.overview-header h3').first();
    const textColor = await headerText.evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    console.log(`Header text color: ${textColor}`);
    
    // Should be white
    expect(textColor).toMatch(/rgb\(255,\s*255,\s*255\)|white|#ffffff/i);
    
    // Check repository card text colors
    const repoCards = page.locator('.repository-card-outline');
    const cardCount = await repoCards.count();
    
    if (cardCount > 0) {
      const firstCard = repoCards.first();
      const cardBg = await firstCard.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log(`Repository card background: ${cardBg}`);
      
      // Check repository name text color
      const repoName = firstCard.locator('.repository-name');
      const nameColor = await repoName.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      console.log(`Repository name color: ${nameColor}`);
      
      // Check info text color
      const infoText = firstCard.locator('.info-value').first();
      const infoColor = await infoText.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      console.log(`Info text color: ${infoColor}`);
      
      // Check tags
      const tags = firstCard.locator('.tag').first();
      if (await tags.count() > 0) {
        const tagColor = await tags.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        const tagBg = await tags.evaluate(el => {
          return window.getComputedStyle(el).backgroundColor;
        });
        console.log(`Tag text color: ${tagColor}`);
        console.log(`Tag background: ${tagBg}`);
      }
    }
    
    console.log('✅ Light mode color test complete');
  });

  test('should maintain proper contrast in light mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    
    // Check that the contrast between dark background and white text is sufficient
    const overviewCard = page.locator('.repository-overview-card');
    
    // Get background and text colors
    const bgColor = await overviewCard.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    const textElement = page.locator('.overview-header h3').first();
    const textColor = await textElement.evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    console.log(`Background: ${bgColor}, Text: ${textColor}`);
    
    // Parse RGB values
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
  });
});

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}