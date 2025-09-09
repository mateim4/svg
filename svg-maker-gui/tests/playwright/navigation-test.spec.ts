import { test, expect } from '@playwright/test';

test.describe('Navigation QA Fix Test', () => {
  test('should navigate from landing page to icon repository browser', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check landing page loads
    await expect(page.locator('.landing-page')).toBeVisible();
    await expect(page.locator('.cta-button')).toBeVisible();
    
    // Click Get Started
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Should now see repository browser (not dashboard)
    await expect(page.locator('.repository-browser')).toBeVisible();
    await expect(page.locator('.repository-overview-card')).toBeVisible();
    
    console.log('✅ Navigation fix successful!');
  });

  test('should have search and filter functionality', async ({ page }) => {
    await page.goto('/');
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check search box exists inside the overview card
    await expect(page.locator('.search-box input')).toBeVisible();
    
    // Check category filter exists
    await expect(page.locator('.category-filter')).toBeVisible();
    
    // Check view toggle buttons exist
    await expect(page.locator('.view-controls .ds-button')).toHaveCount(2);
    
    console.log('✅ Controls are accessible!');
  });

  test('should display repository cards with proper structure', async ({ page }) => {
    await page.goto('/');
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if repository cards are present
    const cards = page.locator('.repository-card-outline');
    const cardCount = await cards.count();
    
    console.log(`Found ${cardCount} repository cards`);
    expect(cardCount).toBeGreaterThan(0);
    
    if (cardCount > 0) {
      const firstCard = cards.first();
      
      // Check card structure
      await expect(firstCard.locator('.repository-header')).toBeVisible();
      await expect(firstCard.locator('.repository-body')).toBeVisible();
      await expect(firstCard.locator('.repository-footer')).toBeVisible();
      
      // Check browse button
      await expect(firstCard.locator('.ds-button')).toBeVisible();
      
      console.log('✅ Repository cards have proper structure!');
    }
  });

  test('should navigate to icon pack browser when clicking Browse Icons', async ({ page }) => {
    await page.goto('/');
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const cards = page.locator('.repository-card-outline');
    if (await cards.count() > 0) {
      // Click on first repository's browse button
      await cards.first().locator('.ds-button').click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Should navigate to icon pack browser
      await expect(page.locator('.icon-pack-browser')).toBeVisible();
      
      // Should have back button
      await expect(page.locator('.back-button')).toBeVisible();
      
      console.log('✅ Icon pack browser navigation works!');
    } else {
      console.log('⚠️ No repository cards found to test navigation');
    }
  });
});