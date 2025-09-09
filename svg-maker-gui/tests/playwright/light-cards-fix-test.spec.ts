import { test, expect } from '@playwright/test';

test.describe('Light Mode Cards Fix', () => {
  test('should have light cards with dark text in light mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('=== LANDING PAGE BACKGROUND ANALYSIS ===');
    
    // Check landing page background
    const landingPageBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Landing Page Background: ${landingPageBg}`);
    
    // Navigate to icon repositories
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\\n=== REPO PAGE BACKGROUND ANALYSIS ===');
    
    // Check repo page background
    const repoPageBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Repo Page Background: ${repoPageBg}`);
    
    // Compare backgrounds
    const backgroundsMatch = landingPageBg === repoPageBg;
    console.log(`Backgrounds match: ${backgroundsMatch}`);
    
    console.log('\\n=== LIGHT MODE CARD ANALYSIS ===');
    
    // Ensure we're in light mode
    const theme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 'light';
    });
    console.log(`Current theme: ${theme}`);
    
    // If in dark mode, switch to light mode
    if (theme === 'dark') {
      await page.locator('.theme-toggle').click();
      await page.waitForTimeout(500);
    }
    
    // Test individual repository cards
    const repoCards = page.locator('.repository-card-outline');
    const cardCount = await repoCards.count();
    console.log(`Individual repository cards found: ${cardCount}`);
    
    if (cardCount > 0) {
      const firstCard = repoCards.first();
      
      // Check card background
      const cardBg = await firstCard.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log(`Individual card background: ${cardBg}`);
      
      // Should be light like landing page
      const isLightBackground = cardBg.includes('229, 231, 235') || 
                               cardBg.match(/rgba\(229,\s*231,\s*235/i);
      console.log(`Card has light background: ${isLightBackground}`);
      expect(isLightBackground).toBe(true);
      
      // Check repository name text color
      const repoName = firstCard.locator('.repository-name');
      if (await repoName.count() > 0) {
        const nameColor = await repoName.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        console.log(`Repository name color: ${nameColor}`);
        
        // Should be dark text
        const isDarkText = nameColor.includes('13, 24, 33') ||
                          nameColor.match(/rgb\\(13,\\s*24,\\s*33\\)|#0D1821/i);
        console.log(`Repository name has dark text: ${isDarkText}`);
        expect(isDarkText).toBe(true);
      }
      
      // Check meta item text color
      const metaItem = firstCard.locator('.meta-item span').first();
      if (await metaItem.count() > 0) {
        const metaColor = await metaItem.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        console.log(`Meta item color: ${metaColor}`);
        
        // Should be dark text
        const isDarkMeta = metaColor.includes('13, 24, 33') ||
                          metaColor.match(/rgb\\(13,\\s*24,\\s*33\\)|#0D1821/i);
        console.log(`Meta item has dark text: ${isDarkMeta}`);
        expect(isDarkMeta).toBe(true);
      }
      
      // Check tags text color
      const tag = firstCard.locator('.tag').first();
      if (await tag.count() > 0) {
        const tagColor = await tag.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        console.log(`Tag color: ${tagColor}`);
        
        // Should be teal text (#007991)
        const isTealTag = tagColor.includes('0, 121, 145') ||
                         tagColor.match(/rgb\(0,\s*121,\s*145\)|#007991/i);
        console.log(`Tag has teal text: ${isTealTag}`);
        expect(isTealTag).toBe(true);
      }
      
      // Check license badge text color
      const licenseBadge = firstCard.locator('.license-badge').first();
      if (await licenseBadge.count() > 0) {
        const badgeColor = await licenseBadge.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        console.log(`License badge color: ${badgeColor}`);
        
        // Should be teal text (#007991)
        const isTealBadge = badgeColor.includes('0, 121, 145') ||
                           badgeColor.match(/rgb\(0,\s*121,\s*145\)|#007991/i);
        console.log(`License badge has teal text: ${isTealBadge}`);
        expect(isTealBadge).toBe(true);
      }
    }
    
    console.log('\\n✅ Light mode cards fix test complete');
  });

  test('should maintain proper theming in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to repo page and switch to dark mode
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Switch to dark mode
    const themeToggle = page.locator('.theme-toggle');
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    console.log('\\n=== DARK MODE VERIFICATION ===');
    
    // Test individual repository cards in dark mode
    const repoCards = page.locator('.repository-card-outline');
    const cardCount = await repoCards.count();
    
    if (cardCount > 0) {
      const firstCard = repoCards.first();
      
      // Check card background in dark mode
      const cardBg = await firstCard.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log(`Dark mode card background: ${cardBg}`);
      
      // Should be dark background
      const isDarkBackground = cardBg.includes('83, 77, 86') || 
                              cardBg.includes('13, 24, 33') ||
                              cardBg.match(/rgb\\(83,\\s*77,\\s*86\\)|rgb\\(13,\\s*24,\\s*33\\)/i);
      console.log(`Card has dark background in dark mode: ${isDarkBackground}`);
      expect(isDarkBackground).toBe(true);
      
      // Check text color in dark mode
      const repoName = firstCard.locator('.repository-name');
      if (await repoName.count() > 0) {
        const nameColor = await repoName.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        console.log(`Dark mode repository name color: ${nameColor}`);
        
        // Should be white/light text
        const isLightText = nameColor.includes('255, 255, 255') ||
                           nameColor.match(/rgb\\(255,\\s*255,\\s*255\\)|white/i);
        console.log(`Repository name has light text in dark mode: ${isLightText}`);
        expect(isLightText).toBe(true);
      }
    }
    
    console.log('\\n✅ Dark mode verification complete');
  });
});