import { test, expect } from '@playwright/test';

test.describe('Cards Fill Consistency', () => {
  test('repository cards should have same fill styling as landing page cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('=== LANDING PAGE CARD ANALYSIS ===');
    
    // Get landing page card styling
    const landingCard = page.locator('.hero-card, .preview-showcase-card').first();
    const landingBg = await landingCard.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    const landingBackdrop = await landingCard.evaluate(el => {
      return window.getComputedStyle(el).backdropFilter;
    });
    
    const landingBorder = await landingCard.evaluate(el => {
      return window.getComputedStyle(el).border;
    });
    
    console.log(`Landing card background: ${landingBg}`);
    console.log(`Landing card backdrop-filter: ${landingBackdrop}`);
    console.log(`Landing card border: ${landingBorder}`);
    
    // Navigate to icon repositories
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== REPOSITORY CARDS ANALYSIS ===');
    
    // Test individual repository cards
    const repoCards = page.locator('.repository-card-outline');
    const cardCount = await repoCards.count();
    console.log(`Individual repository cards found: ${cardCount}`);
    
    if (cardCount > 0) {
      const firstRepoCard = repoCards.first();
      
      const repoBg = await firstRepoCard.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      const repoBackdrop = await firstRepoCard.evaluate(el => {
        return window.getComputedStyle(el).backdropFilter;
      });
      
      const repoBorder = await firstRepoCard.evaluate(el => {
        return window.getComputedStyle(el).border;
      });
      
      console.log(`Repo card background: ${repoBg}`);
      console.log(`Repo card backdrop-filter: ${repoBackdrop}`);
      console.log(`Repo card border: ${repoBorder}`);
      
      // Check if backgrounds match the expected glassmorphic style
      const hasGlassBg = repoBg.includes('229, 231, 235') || 
                        repoBg.match(/rgba\(229,\s*231,\s*235/i);
      console.log(`Repo card has glass background (229,231,235): ${hasGlassBg}`);
      expect(hasGlassBg).toBe(true);
      
      // Check backdrop filter
      const hasBlur = repoBackdrop.includes('blur(30px)');
      console.log(`Repo card has blur(30px): ${hasBlur}`);
      expect(hasBlur).toBe(true);
      
      // Check for translucent white border
      const hasGlassBorder = repoBorder.includes('rgba(255, 255, 255') ||
                            repoBorder.includes('rgb(255, 255, 255');
      console.log(`Repo card has glass border: ${hasGlassBorder}`);
      expect(hasGlassBorder).toBe(true);
    }
    
    // Test overview card styling
    const overviewCard = page.locator('.repository-overview-card');
    if (await overviewCard.count() > 0) {
      const overviewBg = await overviewCard.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      const overviewBackdrop = await overviewCard.evaluate(el => {
        return window.getComputedStyle(el).backdropFilter;
      });
      
      console.log(`Overview card background: ${overviewBg}`);
      console.log(`Overview card backdrop-filter: ${overviewBackdrop}`);
      
      const hasOverviewGlass = overviewBg.includes('229, 231, 235') ||
                              overviewBg.match(/rgba\(229,\s*231,\s*235/i);
      console.log(`Overview card has glass background: ${hasOverviewGlass}`);
      expect(hasOverviewGlass).toBe(true);
    }
    
    console.log('\n✅ Cards fill consistency test complete');
  });
});