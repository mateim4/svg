import { test, expect } from '@playwright/test';

test.describe('Theme and Button Color Testing', () => {
  test('should have proper button colors in both light and dark themes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to repository browser
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Test Light Theme (default)
    console.log('🎨 Testing Light Theme...');
    
    // Check that Browse Icons buttons exist
    const browseButtons = page.locator('.action-button.ds-button-primary');
    const buttonCount = await browseButtons.count();
    console.log(`Found ${buttonCount} Browse Icons buttons`);
    expect(buttonCount).toBeGreaterThan(0);
    
    if (buttonCount > 0) {
      const firstButton = browseButtons.first();
      
      // Get button colors in light theme
      const lightBgColor = await firstButton.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      const lightTextColor = await firstButton.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      
      console.log(`Light theme - Button background: ${lightBgColor}`);
      console.log(`Light theme - Button text: ${lightTextColor}`);
      
      // Should be salmon pink background (RGB values around 255, 141, 153)
      expect(lightBgColor).toMatch(/rgb\(255,\s*141,\s*153\)|#FF8D99/i);
    }
    
    // Switch to Dark Theme
    console.log('🌙 Switching to Dark Theme...');
    const themeToggle = page.locator('.theme-toggle');
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await page.waitForTimeout(500); // Wait for theme transition
    
    // Verify dark theme is active
    const htmlDataTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`Theme attribute: ${htmlDataTheme}`);
    expect(htmlDataTheme).toBe('dark');
    
    if (buttonCount > 0) {
      const firstButton = browseButtons.first();
      
      // Get button colors in dark theme
      const darkBgColor = await firstButton.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      const darkTextColor = await firstButton.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      
      console.log(`Dark theme - Button background: ${darkBgColor}`);
      console.log(`Dark theme - Button text: ${darkTextColor}`);
      
      // Should be coral pink light background (RGB values around 255, 179, 189)
      expect(darkBgColor).toMatch(/rgb\(255,\s*179,\s*189\)|#ffb3bd/i);
      
      // Text should be dark (night color)
      expect(darkTextColor).toMatch(/rgb\(18,\s*17,\s*19\)|#121113/i);
    }
    
    // Switch back to Light Theme
    console.log('☀️ Switching back to Light Theme...');
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    const finalTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`Final theme attribute: ${finalTheme}`);
    expect(finalTheme).toBe('light');
    
    console.log('✅ Theme switching and button colors working correctly!');
  });

  test('should have consistent background colors across themes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check light theme background
    const lightBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Light theme body background: ${lightBg}`);
    
    // Should be rose-quartz (RGB values around 173, 168, 179)
    expect(lightBg).toMatch(/rgb\(173,\s*168,\s*179\)|#ADA8B3/i);
    
    // Switch to dark theme
    const themeToggle = page.locator('.theme-toggle');
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    const darkBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Dark theme body background: ${darkBg}`);
    
    // Should be night (RGB values around 18, 17, 19)
    expect(darkBg).toMatch(/rgb\(18,\s*17,\s*19\)|#121113/i);
    
    console.log('✅ Background colors are properly themed!');
  });
});