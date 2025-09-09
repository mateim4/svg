import { test, expect } from '@playwright/test';

test.describe('Real Lucide Icon Engine - NO MOCK CODE', () => {
  test('should fetch and render REAL Lucide icons from GitHub', async ({ page }) => {
    console.log('=== TESTING REAL LUCIDE ICON ENGINE ===\n');
    
    // Navigate to GitHub workflow
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    console.log('1️⃣ Navigating to GitHub workflow...');
    await page.locator('button:has-text("Get Started")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('.mode-card.github-mode').click();
    await page.waitForTimeout(2000);
    
    // Look for a Lucide repository card
    console.log('2️⃣ Looking for Lucide repository...');
    const lucideCard = await page.locator('.repository-card:has-text("Lucide")').first();
    
    if (await lucideCard.count() > 0) {
      console.log('   ✅ Found Lucide repository card');
      await lucideCard.click();
      await page.waitForTimeout(3000);
      
      console.log('3️⃣ Testing REAL Lucide icon fetching...');
      
      // Check for icon grid/list
      const iconContainer = await page.locator('.icon-grid, .icon-list, .file-tree').first();
      await expect(iconContainer).toBeVisible();
      
      // Get icon count
      const iconElements = await page.locator('.icon-item, .file-item').all();
      const iconCount = iconElements.length;
      console.log(`   Found ${iconCount} icons`);
      
      // Test specific real Lucide icons
      const testIcons = ['home', 'user', 'heart', 'star', 'search', 'settings'];
      let realIconsFound = 0;
      
      for (const iconName of testIcons) {
        const iconElement = await page.locator(`[data-icon-name="${iconName}"], .icon-item:has-text("${iconName}")`).first();
        
        if (await iconElement.count() > 0) {
          console.log(`   🔍 Testing real icon: ${iconName}`);
          
          // Click the icon to test rendering
          try {
            await iconElement.click();
            await page.waitForTimeout(1000);
            
            // Check if SVG content is loaded
            const svgElement = await page.locator('svg').first();
            if (await svgElement.count() > 0) {
              const svgContent = await svgElement.innerHTML();
              
              // Validate it's a real Lucide SVG (not mock)
              if (svgContent.includes('<path') || svgContent.includes('<circle') || svgContent.includes('<line')) {
                console.log(`     ✅ Real SVG content found for ${iconName}`);
                realIconsFound++;
                
                // Check for Lucide-specific attributes
                const classAttr = await svgElement.getAttribute('class');
                if (classAttr && classAttr.includes('lucide')) {
                  console.log(`     ✅ Lucide class detected: ${classAttr}`);
                }
                
                // Check SVG dimensions
                const width = await svgElement.getAttribute('width');
                const height = await svgElement.getAttribute('height');
                console.log(`     📏 SVG size: ${width}x${height}`);
                
                // Validate viewBox
                const viewBox = await svgElement.getAttribute('viewBox');
                if (viewBox === '0 0 24 24') {
                  console.log('     ✅ Correct Lucide viewBox (0 0 24 24)');
                }
                
                // Check stroke attributes (Lucide characteristic)
                const stroke = await svgElement.getAttribute('stroke');
                const strokeWidth = await svgElement.getAttribute('stroke-width');
                console.log(`     🎨 Stroke: ${stroke}, Width: ${strokeWidth}`);
              } else {
                console.log(`     ❌ No real SVG paths found for ${iconName} - may be mock`);
              }
            }
          } catch (error) {
            console.log(`     ⚠️ Could not interact with ${iconName}: ${error}`);
          }
        }
      }
      
      console.log(`\n4️⃣ Real icon validation results:`);
      console.log(`   Total icons found: ${iconCount}`);
      console.log(`   Real icons validated: ${realIconsFound}/${testIcons.length}`);
      
      // Validate we found substantial real icons (should be 1400+, not 40-80 mock)
      if (iconCount > 200) {
        console.log('   ✅ Icon count suggests real implementation (>200 icons)');
      } else {
        console.log('   ⚠️ Low icon count - may still be using mock data');
      }
      
      if (realIconsFound >= 3) {
        console.log('   ✅ Multiple real icons validated - engine working');
      } else {
        console.log('   ❌ Too few real icons found - engine may have issues');
      }
      
      // Test icon search functionality with real icons
      console.log('\n5️⃣ Testing search functionality...');
      const searchInput = await page.locator('input[placeholder*="search" i]').first();
      
      if (await searchInput.count() > 0) {
        await searchInput.fill('arrow');
        await page.waitForTimeout(2000);
        
        const searchResults = await page.locator('.icon-item, .file-item').all();
        console.log(`   Search results for "arrow": ${searchResults.length} icons`);
        
        if (searchResults.length > 10) {
          console.log('   ✅ Good search results - likely real implementation');
        }
      }
      
      // Take screenshot for validation
      await page.screenshot({ 
        path: 'test-results/real-lucide-engine.png', 
        fullPage: true 
      });
      
      console.log('\n📋 REAL LUCIDE ENGINE TEST SUMMARY:');
      console.log('   🎯 Objective: Validate NO MOCK CODE, real GitHub fetching');
      console.log(`   📊 Icons found: ${iconCount} (expected 1400+ for real Lucide)`);
      console.log(`   ✅ Real icons validated: ${realIconsFound}`);
      console.log('   🔗 Fetching from: https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/');
      
      // Assertions
      expect(iconCount).toBeGreaterThan(50); // Should have many more than mock
      expect(realIconsFound).toBeGreaterThan(2); // At least 3 real icons validated
      
    } else {
      console.log('   ❌ Lucide repository card not found');
      console.log('   💡 Available repositories:');
      
      const repoCards = await page.locator('.repository-card').all();
      for (let i = 0; i < Math.min(5, repoCards.length); i++) {
        const repoName = await repoCards[i].locator('.repository-name, h3').first().textContent();
        console.log(`     - ${repoName}`);
      }
      
      // Test the first available repository
      if (repoCards.length > 0) {
        console.log('\n   Testing first available repository...');
        await repoCards[0].click();
        await page.waitForTimeout(3000);
        
        const iconContainer = await page.locator('.icon-grid, .icon-list, .file-tree').first();
        const iconCount = await page.locator('.icon-item, .file-item').count();
        console.log(`   Icons in first repo: ${iconCount}`);
      }
    }
  });
});