import { test, expect } from '@playwright/test';

test.describe('Dark Mode Accent Colors', () => {
  test('should have correct accent colors in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to icon repositories
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Switch to dark mode
    const themeToggle = page.locator('.theme-toggle');
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    console.log('=== DARK MODE ACCENT COLORS TEST ===');
    
    // Test individual repository cards
    const repoCards = page.locator('.repository-card-outline');
    const cardCount = await repoCards.count();
    console.log(`Individual repository cards found: ${cardCount}`);
    
    if (cardCount > 0) {
      const firstCard = repoCards.first();
      
      // Check tags color (should be mint green #CBFF8C)
      const tag = firstCard.locator('.tag').first();
      if (await tag.count() > 0) {
        const tagColor = await tag.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        console.log(`Dark mode tag color: ${tagColor}`);
        
        // Should be mint green (#CBFF8C which is rgb(203, 255, 140))
        const isMintGreen = tagColor.includes('203, 255, 140') ||
                           tagColor.match(/rgb\\(203,\\s*255,\\s*140\\)|#CBFF8C/i);
        console.log(`Tag has mint green color: ${isMintGreen}`);
        expect(isMintGreen).toBe(true);
      }
      
      // Check license badge color (should be teal #007991)
      const licenseBadge = firstCard.locator('.license-badge').first();
      if (await licenseBadge.count() > 0) {
        const badgeColor = await licenseBadge.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        console.log(`Dark mode license badge color: ${badgeColor}`);
        
        // Should be teal (#007991 which is rgb(0, 121, 145))
        const isTeal = badgeColor.includes('0, 121, 145') ||
                      badgeColor.match(/rgb\\(0,\\s*121,\\s*145\\)|#007991/i);
        console.log(`License badge has teal color: ${isTeal}`);
        expect(isTeal).toBe(true);
      }
      
      // Check icons color (should be mint green from design system)
      const iconSvg = firstCard.locator('svg').first();
      if (await iconSvg.count() > 0) {
        const iconStroke = await iconSvg.evaluate(el => {
          return window.getComputedStyle(el).stroke;
        });
        
        const iconColor = await iconSvg.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        
        console.log(`Dark mode icon stroke: ${iconStroke}`);
        console.log(`Dark mode icon color: ${iconColor}`);
        
        // Should be mint green (#CBFF8C)
        const isMintIcon = (color: string) => {
          return color.includes('203, 255, 140') ||
                 color.match(/rgb\\(203,\\s*255,\\s*140\\)|#CBFF8C/i);
        };
        
        const hasMintIcon = isMintIcon(iconStroke) || isMintIcon(iconColor);
        console.log(`Icon has mint green color: ${hasMintIcon}`);
        expect(hasMintIcon).toBe(true);
      }
    }
    
    console.log('\\n✅ Dark mode accent colors test complete');
  });
});