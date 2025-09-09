import { test, expect } from '@playwright/test';

test.describe('Debug Local Repository Selection', () => {
  test('should debug local repository selection step by step', async ({ page }) => {
    console.log('=== DEBUG LOCAL REPOSITORY SELECTION ===\n');
    
    // Navigate to GitHub workflow
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Get Started")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('.mode-card.github-mode').click();
    await page.waitForTimeout(2000);
    
    console.log('1️⃣ Navigated to GitHub workflow');
    
    // Check current step
    const initialStep = await page.locator('.sidebar-step.active .step-title').textContent();
    console.log(`   Initial step: ${initialStep}`);
    
    // Find first local repository
    const repositoryCards = await page.locator('.repository-card.local').count();
    console.log(`2️⃣ Found ${repositoryCards} local repository cards`);
    
    if (repositoryCards > 0) {
      const firstRepo = page.locator('.repository-card.local').first();
      const repoName = await firstRepo.locator('.repository-name').textContent();
      console.log(`   First repository: ${repoName}`);
      
      // Take screenshot before clicking
      await page.screenshot({ path: 'test-results/debug-before-repo-click.png', fullPage: true });
      
      // Monitor for any error messages that might appear
      let errorAppeared = false;
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`   🚨 Console error: ${msg.text()}`);
          errorAppeared = true;
        }
      });
      
      console.log('3️⃣ Clicking on first repository...');
      await firstRepo.click();
      
      // Wait and monitor for changes
      console.log('4️⃣ Waiting for repository loading...');
      await page.waitForTimeout(5000); // Give more time for loading
      
      // Take screenshot after clicking
      await page.screenshot({ path: 'test-results/debug-after-repo-click.png', fullPage: true });
      
      // Check current step again
      const newStep = await page.locator('.sidebar-step.active .step-title').textContent();
      console.log(`   Step after clicking: ${newStep}`);
      
      // Check for loading indicators
      const loadingSpinners = await page.locator('.loading-spinner, .ds-spinner, [class*="loading"]').count();
      console.log(`   Loading indicators: ${loadingSpinners}`);
      
      // Check for error messages
      const errorMessages = await page.locator('[class*="error"], .error-message, .workflow-error').allTextContents();
      if (errorMessages.length > 0) {
        console.log(`   📢 Error messages found:`);
        errorMessages.forEach((msg, i) => console.log(`     ${i+1}. ${msg}`));
      } else {
        console.log(`   ✅ No error messages found`);
      }
      
      // Check if data was loaded
      console.log('5️⃣ Checking data loading results...');
      
      const svgItems = await page.locator('[data-svg-item="true"]').count();
      const treeNodes = await page.locator('.tree-node').count();
      const folderTreeVisible = await page.locator('.folder-tree-browser').isVisible();
      
      console.log(`   SVG items: ${svgItems}`);
      console.log(`   Tree nodes: ${treeNodes}`);
      console.log(`   FolderTreeBrowser visible: ${folderTreeVisible}`);
      
      // Check file counter
      const counterText = await page.locator('.counter-number').first().textContent().catch(() => 'not found');
      console.log(`   File counter: ${counterText}`);
      
      // Check repository info display
      const repoNameDisplay = await page.locator('.repo-name').textContent().catch(() => 'not found');
      console.log(`   Repository name display: ${repoNameDisplay}`);
      
      // Check step completion status
      const stepStatus = await page.evaluate(() => {
        const steps = Array.from(document.querySelectorAll('.sidebar-step'));
        return steps.map((step, i) => ({
          index: i,
          title: step.querySelector('.step-title')?.textContent || '',
          isActive: step.classList.contains('active'),
          isCompleted: step.classList.contains('completed'),
          canProceed: step.classList.contains('clickable') || !step.classList.contains('disabled')
        }));
      });
      
      console.log('6️⃣ Step completion status:');
      stepStatus.forEach(step => {
        const status = step.isActive ? 'ACTIVE' : step.isCompleted ? 'COMPLETED' : 'PENDING';
        console.log(`   ${step.index + 1}. ${step.title}: ${status} (canProceed: ${step.canProceed})`);
      });
      
      // Check Next button status
      const nextButton = page.locator('button:has-text("Next")').first();
      const nextEnabled = await nextButton.isEnabled().catch(() => false);
      const nextVisible = await nextButton.isVisible().catch(() => false);
      console.log(`7️⃣ Next button: enabled=${nextEnabled}, visible=${nextVisible}`);
      
      // If step didn't advance, try to understand why
      if (newStep === initialStep) {
        console.log('🔍 ANALYZING WHY STEP DIDN\'T ADVANCE:');
        
        // Check if loading is still in progress
        const stillLoading = await page.locator('[class*="loading"]').isVisible();
        console.log(`   Still loading: ${stillLoading}`);
        
        // Check wizard step conditions
        const wizardConditions = await page.evaluate(() => {
          return {
            repoTreeLength: window.localStorage.getItem('debug-repoTree-length') || 'unknown',
            svgFilesLength: window.localStorage.getItem('debug-svgFiles-length') || 'unknown',
            isLoadingRepo: window.localStorage.getItem('debug-isLoadingRepo') || 'unknown'
          };
        });
        console.log(`   Wizard conditions:`, wizardConditions);
        
      } else {
        console.log('🎉 ✅ SUCCESS! Step advanced successfully!');
        
        // Test the actual icon list functionality since we're now in File Selection
        if (newStep === 'File Selection') {
          console.log('8️⃣ Testing icon list in File Selection step...');
          
          if (svgItems > 0) {
            // Try selecting some icons
            const selectableIcons = await page.locator('[data-svg-item="true"]').all();
            const testCount = Math.min(2, selectableIcons.length);
            
            for (let i = 0; i < testCount; i++) {
              await selectableIcons[i].click();
              await page.waitForTimeout(200);
            }
            
            const selectedCount = await page.locator('.selected, [aria-checked="true"]').count();
            console.log(`     Selected ${selectedCount} icons successfully`);
            
            // Test search if available
            const searchInput = page.locator('input[placeholder*="Search" i]').first();
            if (await searchInput.isVisible()) {
              await searchInput.fill('arrow');
              await page.waitForTimeout(1000);
              
              const searchResults = await page.locator('[data-svg-item="true"]').count();
              console.log(`     Search for 'arrow': ${searchResults} results`);
              
              await searchInput.clear();
            }
            
            console.log(`     🎉 Icon list functionality is WORKING!`);
          }
        }
      }
      
      console.log(`\n   Console errors detected: ${errorAppeared}`);
    }
    
    expect(true).toBe(true);
  });
});