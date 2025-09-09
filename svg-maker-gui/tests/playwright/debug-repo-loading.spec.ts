import { test, expect } from '@playwright/test';

test.describe('Debug Repository Loading', () => {
  test('should debug repository loading step by step', async ({ page }) => {
    console.log('=== DEBUG REPOSITORY LOADING ===\n');
    
    // Navigate and get to GitHub workflow
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Get Started")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('.mode-card.github-mode').click();
    await page.waitForTimeout(2000);
    
    console.log('1️⃣ Navigated to GitHub workflow');
    
    // Find and fill repository input
    const repoInput = page.locator('input[placeholder*="github" i]').first();
    await expect(repoInput).toBeVisible();
    console.log('2️⃣ Repository input found and visible');
    
    // Fill with bootstrap/bootstrap-icons
    await repoInput.fill('bootstrap/bootstrap-icons');
    console.log('3️⃣ Filled repository input with bootstrap/bootstrap-icons');
    
    // Take screenshot before pressing Enter
    await page.screenshot({ path: 'test-results/debug-before-enter.png', fullPage: true });
    
    // Press Enter to trigger loading
    await repoInput.press('Enter');
    console.log('4️⃣ Pressed Enter to trigger repository loading');
    
    // Wait for loading to start and finish
    await page.waitForTimeout(3000);
    
    // Take screenshot during loading
    await page.screenshot({ path: 'test-results/debug-during-loading.png', fullPage: true });
    
    // Check for loading states
    const loadingSpinners = await page.locator('.loading-spinner, .ds-spinner, [class*="loading"]').count();
    console.log(`5️⃣ Loading spinners found: ${loadingSpinners}`);
    
    // Wait longer for loading to complete
    await page.waitForTimeout(8000);
    
    // Take screenshot after loading
    await page.screenshot({ path: 'test-results/debug-after-loading.png', fullPage: true });
    
    // Check repository loading results
    console.log('6️⃣ Checking repository loading results:');
    
    const errorMessages = await page.locator('[class*="error"], .error-message, .workflow-error').all();
    console.log(`   Error messages: ${errorMessages.length} found`);
    
    if (errorMessages.length > 0) {
      for (let i = 0; i < errorMessages.length; i++) {
        const errorText = await errorMessages[i].textContent();
        console.log(`   Error ${i+1}: ${errorText}`);
      }
    }
    
    // Check if Next button is enabled (indicates successful loading)
    const nextButton = page.locator('button:has-text("Next")').first();
    const isNextButtonEnabled = await nextButton.isEnabled().catch(() => false);
    console.log(`   Next button enabled: ${isNextButtonEnabled}`);
    
    // Check for success indicators
    const successIndicators = await page.locator('[class*="success"], [class*="completed"], .check').count();
    console.log(`   Success indicators: ${successIndicators}`);
    
    // Check if FolderTreeBrowser has content
    const svgItems = await page.locator('[data-svg-item="true"]').count();
    const treeNodes = await page.locator('.tree-node').count();
    console.log(`   SVG items in tree: ${svgItems}`);
    console.log(`   Tree nodes total: ${treeNodes}`);
    
    // Check counter display
    const counterNumbers = await page.locator('.counter-number').allTextContents();
    console.log(`   File counters: ${counterNumbers.join(', ')}`);
    
    // Check if repository name is displayed
    const repoName = await page.locator('.repo-name').textContent().catch(() => 'not found');
    console.log(`   Repository name displayed: ${repoName}`);
    
    // Check for any visible file names
    const fileNames = await page.locator('.tree-node .file-name, [data-svg-item] .file-name').allTextContents();
    console.log(`   Visible file names: ${fileNames.length} files`);
    if (fileNames.length > 0) {
      console.log(`   First few files: ${fileNames.slice(0, 5).join(', ')}`);
    }
    
    // Try to click Next if enabled
    if (isNextButtonEnabled) {
      console.log('7️⃣ Next button is enabled - trying to proceed to file selection');
      await nextButton.click();
      await page.waitForTimeout(3000);
      
      // Take screenshot of file selection step
      await page.screenshot({ path: 'test-results/debug-file-selection.png', fullPage: true });
      
      // Check file selection step
      const fileSelectionSvgItems = await page.locator('[data-svg-item="true"]').count();
      console.log(`   SVG items in file selection: ${fileSelectionSvgItems}`);
    } else {
      console.log('7️⃣ Next button is disabled - repository loading likely failed');
    }
    
    // Summary
    console.log('\n📋 REPOSITORY LOADING SUMMARY:');
    console.log(`   ✓ Navigation to workflow: SUCCESS`);
    console.log(`   ✓ Repository input filled: SUCCESS`);
    console.log(`   ✓ Loading triggered: SUCCESS`);
    console.log(`   ? Repository loaded successfully: ${isNextButtonEnabled ? 'YES' : 'NO'}`);
    console.log(`   ? SVG files available: ${svgItems > 0 ? 'YES' : 'NO'}`);
    console.log(`   ? Ready for file selection: ${isNextButtonEnabled && svgItems > 0 ? 'YES' : 'NO'}`);
    
    expect(true).toBe(true); // Always pass - this is a debug test
  });
});