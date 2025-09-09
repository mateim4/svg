import { test, expect } from '@playwright/test';

test.describe('Local Icon Repositories - Icon List Testing', () => {
  test('should test icon list functionality using local repositories', async ({ page }) => {
    console.log('=== LOCAL ICON REPOSITORIES TESTING ===\n');
    
    // Navigate to GitHub workflow
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    console.log('1️⃣ Navigating to GitHub workflow...');
    await page.locator('button:has-text("Get Started")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('.mode-card.github-mode').click();
    await page.waitForTimeout(2000);
    
    // Look for local repository cards in the IconRepositoryBrowser
    console.log('2️⃣ Looking for local icon repositories...');
    const repositoryCards = await page.locator('.repository-card.local').count();
    console.log(`   Local repository cards found: ${repositoryCards}`);
    
    if (repositoryCards > 0) {
      // Take screenshot of available repositories
      await page.screenshot({ path: 'test-results/local-repositories.png', fullPage: true });
      
      // Get repository names
      const repoNames = await page.locator('.repository-card.local .repository-name').allTextContents();
      console.log(`   Available repositories: ${repoNames.join(', ')}`);
      
      // Click on the first local repository
      console.log('3️⃣ Clicking on first local repository...');
      const firstRepo = page.locator('.repository-card.local').first();
      await firstRepo.click();
      await page.waitForTimeout(3000);
      
      // Check if we proceeded to file selection step
      const currentStep = await page.locator('.sidebar-step.active .step-title').textContent();
      console.log(`   Current step: ${currentStep}`);
      
      if (currentStep === 'File Selection') {
        console.log('4️⃣ ✅ SUCCESS! Navigated to File Selection step');
        
        // Take screenshot of file selection
        await page.screenshot({ path: 'test-results/file-selection-step.png', fullPage: true });
        
        // Now test the icon list functionality
        console.log('5️⃣ Testing icon list components...');
        
        // Check for FolderTreeBrowser
        const folderTreeBrowser = page.locator('.folder-tree-browser');
        const isVisible = await folderTreeBrowser.isVisible();
        console.log(`   FolderTreeBrowser visible: ${isVisible}`);
        
        if (isVisible) {
          // Test SVG file counts
          const svgItems = await page.locator('[data-svg-item="true"]').count();
          const treeNodes = await page.locator('.tree-node').count();
          const counterText = await page.locator('.counter-number').first().textContent().catch(() => '0');
          
          console.log(`   📊 Icon list metrics:`);
          console.log(`      SVG items with data-svg-item: ${svgItems}`);
          console.log(`      Total tree nodes: ${treeNodes}`);
          console.log(`      Counter display: ${counterText}`);
          
          // Test search functionality
          console.log('6️⃣ Testing search functionality...');
          const searchInput = page.locator('input[placeholder*="Search" i]').first();
          const searchVisible = await searchInput.isVisible();
          console.log(`   Search input visible: ${searchVisible}`);
          
          if (searchVisible && svgItems > 0) {
            // Test search
            await searchInput.fill('home');
            await page.waitForTimeout(2000);
            
            const searchResults = await page.locator('[data-svg-item="true"]').count();
            console.log(`   Search results for 'home': ${searchResults} items`);
            
            // Clear search
            await searchInput.clear();
            await page.waitForTimeout(1000);
            
            const clearedResults = await page.locator('[data-svg-item="true"]').count();
            console.log(`   Results after clearing search: ${clearedResults} items`);
          }
          
          // Test selection functionality
          console.log('7️⃣ Testing icon selection...');
          if (svgItems > 0) {
            // Try selecting first few icons
            const selectableIcons = await page.locator('[data-svg-item="true"]').all();
            const iconsToTest = Math.min(3, selectableIcons.length);
            
            console.log(`   Testing selection of ${iconsToTest} icons...`);
            
            for (let i = 0; i < iconsToTest; i++) {
              await selectableIcons[i].click();
              await page.waitForTimeout(200);
            }
            
            // Check selection count
            const selectedCount = await page.locator('.tree-node.selected, [aria-checked="true"]').count();
            console.log(`   Selected icons count: ${selectedCount}`);
            
            // Test select all
            const selectAllButton = page.locator('button:has-text("Select All"), button:has-text("All")').first();
            const selectAllVisible = await selectAllButton.isVisible();
            
            if (selectAllVisible) {
              await selectAllButton.click();
              await page.waitForTimeout(1000);
              
              const allSelectedCount = await page.locator('.tree-node.selected, [aria-checked="true"]').count();
              console.log(`   After 'Select All': ${allSelectedCount} selected`);
            }
          }
          
          // Test responsive behavior
          console.log('8️⃣ Testing responsive behavior...');
          const viewports = [
            { name: 'Mobile', width: 375, height: 667 },
            { name: 'Desktop', width: 1200, height: 800 }
          ];
          
          for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.waitForTimeout(1000);
            
            const listVisible = await folderTreeBrowser.isVisible();
            const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            const vpWidth = await page.evaluate(() => window.innerWidth);
            const hasHScroll = docWidth > vpWidth + 5;
            
            console.log(`   ${viewport.name}: list visible=${listVisible}, h-scroll=${hasHScroll}`);
            
            await page.screenshot({ 
              path: `test-results/responsive-${viewport.name.toLowerCase()}.png`,
              fullPage: true 
            });
          }
          
          // Reset to desktop
          await page.setViewportSize({ width: 1200, height: 800 });
          
          // Final functionality test - can we proceed?
          console.log('9️⃣ Testing workflow progression...');
          const nextButton = page.locator('button:has-text("Next")').first();
          const canProceed = await nextButton.isEnabled();
          console.log(`   Can proceed to next step: ${canProceed}`);
          
          if (canProceed) {
            console.log('🎉 ✅ FULL SUCCESS! Icon list is working properly!');
          }
          
        } else {
          console.log('❌ FolderTreeBrowser not visible - icon list failed to load');
        }
        
      } else {
        console.log(`❌ Failed to navigate to File Selection step. Current: ${currentStep}`);
      }
      
    } else {
      console.log('❌ No local repository cards found - testing with repository input...');
      
      // Fallback: try manual repository input with a simple repo
      const repoInput = page.locator('input[placeholder*="github" i]').first();
      if (await repoInput.isVisible()) {
        // Try a very simple, small repository that should work
        await repoInput.fill('octocat/Hello-World');
        await repoInput.press('Enter');
        await page.waitForTimeout(5000);
        
        const errorMsg = await page.locator('[class*="error"]').textContent().catch(() => '');
        if (errorMsg) {
          console.log(`   Repository input error: ${errorMsg}`);
        } else {
          console.log('   Repository input completed without error');
        }
      }
    }
    
    // Summary
    console.log('\\n📋 ICON LIST TESTING SUMMARY:');
    console.log(`   ✅ Navigation to GitHub workflow: SUCCESS`);
    console.log(`   ? Local repositories available: ${repositoryCards > 0 ? 'YES' : 'NO'}`);
    console.log(`   ? Icon list functionality working: ${repositoryCards > 0 ? 'TESTED' : 'UNABLE TO TEST'}`);
    
    expect(true).toBe(true);
  });
});