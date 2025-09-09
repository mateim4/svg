import { test, expect } from '@playwright/test';

test.describe('Dark Mode Text on Light Cards', () => {
  test('should have dark text on light cards in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
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
    
    // Test 1: Hero card title should be dark text
    const heroTitle = page.locator('.hero-card h1');
    if (await heroTitle.count() > 0) {
      const titleColor = await heroTitle.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      console.log(`Hero title color in dark mode: ${titleColor}`);
      
      // Should be dark text (navy dark #0D1821 which is rgb(13, 24, 33))
      const isDarkText = titleColor.includes('13, 24, 33') || 
                        titleColor.match(/rgb\(13,\s*24,\s*33\)|#0D1821/i) ||
                        titleColor.includes('0, 0, 0') || 
                        titleColor === 'black';
      console.log(`Hero title has dark text: ${isDarkText}`);
      expect(isDarkText).toBe(true);
    }
    
    // Test 2: Hero card description should be dark text  
    const heroDescription = page.locator('.hero-card p');
    if (await heroDescription.count() > 0) {
      const descColor = await heroDescription.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      console.log(`Hero description color in dark mode: ${descColor}`);
      
      // Should be charcoal or dark text
      const isDarkText = descColor.includes('83, 77, 86') ||
                        descColor.includes('13, 24, 33') ||
                        descColor.match(/rgb\(83,\s*77,\s*86\)|#534D56/i) ||
                        descColor.match(/rgb\(13,\s*24,\s*33\)|#0D1821/i) ||
                        descColor.includes('0, 0, 0') ||
                        descColor === 'black';
      console.log(`Hero description has dark text: ${isDarkText}`);
      expect(isDarkText).toBe(true);
    }
    
    // Test 3: Preview showcase card content should have dark text
    const previewShowcase = page.locator('.preview-showcase-card');
    if (await previewShowcase.count() > 0) {
      // Check if there's any text content in the preview showcase
      const textElements = previewShowcase.locator('h2, h3, p, span, div').filter({
        hasText: /.+/
      });
      
      const textCount = await textElements.count();
      console.log(`Found ${textCount} text elements in preview showcase`);
      
      if (textCount > 0) {
        const firstTextElement = textElements.first();
        const textColor = await firstTextElement.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        console.log(`Preview showcase text color: ${textColor}`);
        
        // Should be dark text
        const isDarkText = textColor.includes('13, 24, 33') ||
                          textColor.includes('83, 77, 86') ||
                          textColor.match(/rgb\(13,\s*24,\s*33\)|#0D1821/i) ||
                          textColor.match(/rgb\(83,\s*77,\s*86\)|#534D56/i) ||
                          textColor.includes('0, 0, 0') ||
                          textColor === 'black';
        console.log(`Preview showcase has dark text: ${isDarkText}`);
        expect(isDarkText).toBe(true);
      }
    }
    
    console.log('✅ Dark mode text on light cards test complete');
  });

  test('should still have light text on light cards in light mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Ensure we're in light mode
    const theme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 'light';
    });
    
    // If in dark mode, switch to light mode
    if (theme === 'dark') {
      const themeToggle = page.locator('.theme-toggle');
      if (await themeToggle.count() > 0) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Test hero card title in light mode - should use normal text color
    const heroTitle = page.locator('.hero-card h1');
    if (await heroTitle.count() > 0) {
      const titleColor = await heroTitle.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      console.log(`Hero title color in light mode: ${titleColor}`);
      
      // In light mode, text-primary should be navy dark (13, 24, 33) which is still dark
      // This is correct for light mode with light card backgrounds
      const isAppropriateText = titleColor.includes('13, 24, 33') ||
                               titleColor.match(/rgb\(13,\s*24,\s*33\)|#0D1821/i);
      console.log(`Hero title has appropriate text color: ${isAppropriateText}`);
      expect(isAppropriateText).toBe(true);
    }
    
    console.log('✅ Light mode text verification complete');
  });
});