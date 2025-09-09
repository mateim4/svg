import { test, expect } from '@playwright/test';

test.describe('Theme Persistence', () => {
  test('should maintain theme when navigating from landing to repositories', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 'light';
    });
    console.log(`Initial theme: ${initialTheme}`);
    
    // If in light mode, switch to dark mode first
    if (initialTheme === 'light') {
      const themeToggle = page.locator('.theme-toggle');
      await expect(themeToggle).toBeVisible();
      await themeToggle.click();
      await page.waitForTimeout(300);
      
      const darkTheme = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-theme');
      });
      console.log(`After switching to dark: ${darkTheme}`);
      expect(darkTheme).toBe('dark');
    }
    
    // Navigate to icon repositories
    const ctaButton = page.locator('.cta-button');
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check theme after navigation
    const themeAfterNavigation = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`Theme after navigation: ${themeAfterNavigation}`);
    
    // Theme should still be dark
    expect(themeAfterNavigation).toBe('dark');
    
    // Verify we're on the repositories page
    const repositoryBrowser = page.locator('.repository-browser');
    await expect(repositoryBrowser).toBeVisible();
    
    console.log('✅ Theme persistence test complete');
  });

  test('should persist theme preference across page loads', async ({ page }) => {
    // First visit - set to dark mode
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const themeToggle = page.locator('.theme-toggle');
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await page.waitForTimeout(300);
    
    const darkMode = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    expect(darkMode).toBe('dark');
    console.log('Set theme to dark mode');
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if theme persisted
    const persistedTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`Theme after reload: ${persistedTheme}`);
    
    // Should still be dark
    expect(persistedTheme).toBe('dark');
    
    console.log('✅ Theme persistence across reloads test complete');
  });

  test('should initialize theme from localStorage', async ({ page }) => {
    // Set dark theme in localStorage before page load
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Theme should be initialized from localStorage
    const initializedTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`Theme initialized from localStorage: ${initializedTheme}`);
    
    expect(initializedTheme).toBe('dark');
    
    console.log('✅ Theme initialization from localStorage test complete');
  });
});