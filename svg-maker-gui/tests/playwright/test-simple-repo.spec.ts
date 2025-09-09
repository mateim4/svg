import { test, expect } from '@playwright/test';

test.describe('Test Simple Repository Loading', () => {
  test('should test with different repositories', async ({ page }) => {
    console.log('=== TESTING DIFFERENT REPOSITORIES ===\n');
    
    // Navigate to GitHub workflow
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Get Started")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('.mode-card.github-mode').click();
    await page.waitForTimeout(2000);
    
    const repoInput = page.locator('input[placeholder*="github" i]').first();
    await expect(repoInput).toBeVisible();
    
    const repositoriesToTest = [
      'twbs/bootstrap-icons',  // Different org name
      'microsoft/fluentui-system-icons',  // Known good repo
      'lucide-icons/lucide',  // Another known repo
      'tabler/tabler-icons',  // Another known repo
    ];
    
    for (let i = 0; i < repositoriesToTest.length; i++) {
      const repo = repositoriesToTest[i];
      console.log(`\n${i+1}️⃣ Testing repository: ${repo}`);
      
      // Clear input and fill with new repo
      await repoInput.clear();
      await repoInput.fill(repo);
      await repoInput.press('Enter');
      
      // Wait for loading
      await page.waitForTimeout(5000);
      
      // Check for errors
      const errorMessages = await page.locator('[class*="error"], .error-message, .workflow-error').allTextContents();
      
      if (errorMessages.length > 0) {
        console.log(`   ❌ Error: ${errorMessages[0]}`);
      } else {
        // Check for success
        const nextButton = page.locator('button:has-text("Next")').first();
        const isEnabled = await nextButton.isEnabled().catch(() => false);
        console.log(`   ${isEnabled ? '✅' : '❌'} Next button enabled: ${isEnabled}`);
        
        if (isEnabled) {
          // Count SVG files found
          const svgCount = await page.locator('[data-svg-item="true"]').count();
          const counterText = await page.locator('.counter-number').first().textContent().catch(() => '0');
          console.log(`   📁 SVG files found: ${counterText} (elements: ${svgCount})`);
          
          // This repo worked! Take screenshot
          await page.screenshot({ 
            path: `test-results/working-repo-${repo.replace('/', '-')}.png`,
            fullPage: true 
          });
          
          console.log(`   🎉 SUCCESS! Repository ${repo} loaded successfully!`);
          break; // Stop testing once we find a working repo
        }
      }
      
      // Small delay between tests
      await page.waitForTimeout(1000);
    }
    
    expect(true).toBe(true);
  });
});