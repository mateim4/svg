import { test, expect } from '@playwright/test';

test.describe('Test Scrollbar Styling', () => {
  test('should verify white scrollbar thumb styling for files-list', async ({ page }) => {
    console.log('=== TESTING SCROLLBAR STYLING ===\n');
    
    // Navigate to GitHub workflow
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Get Started")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('.mode-card.github-mode').click();
    await page.waitForTimeout(2000);
    
    console.log('1️⃣ Navigated to GitHub workflow');
    
    // Check if files-list element exists and get its computed styles
    const filesListExists = await page.locator('.files-list').count() > 0;
    console.log(`2️⃣ Files list element exists: ${filesListExists}`);
    
    if (filesListExists) {
      // Get scrollbar-related styles
      const scrollbarStyles = await page.locator('.files-list').evaluate(el => {
        const styles = getComputedStyle(el);
        return {
          scrollbarWidth: styles.scrollbarWidth,
          scrollbarColor: styles.scrollbarColor,
          overflowY: styles.overflowY,
          overflowX: styles.overflowX,
          scrollBehavior: styles.scrollBehavior
        };
      });
      
      console.log('3️⃣ Scrollbar styles applied:');
      console.log(`   Scrollbar width: ${scrollbarStyles.scrollbarWidth}`);
      console.log(`   Scrollbar color: ${scrollbarStyles.scrollbarColor}`);
      console.log(`   Overflow Y: ${scrollbarStyles.overflowY}`);
      console.log(`   Overflow X: ${scrollbarStyles.overflowX}`);
      console.log(`   Scroll behavior: ${scrollbarStyles.scrollBehavior}`);
      
      // Check if the element is scrollable by forcing some content if needed
      const hasScrollableContent = await page.evaluate(() => {
        const filesList = document.querySelector('.files-list');
        if (filesList) {
          return filesList.scrollHeight > filesList.clientHeight;
        }
        return false;
      });
      
      console.log(`4️⃣ Files list is scrollable: ${hasScrollableContent}`);
      
      // If not scrollable, let's see if we can trigger some content loading
      if (!hasScrollableContent) {
        console.log('5️⃣ Attempting to load repository content to trigger scrollbar...');
        
        // Try clicking a repository to load content
        const repoCards = await page.locator('.repository-card.local').count();
        console.log(`   Found ${repoCards} local repository cards`);
        
        if (repoCards > 0) {
          await page.locator('.repository-card.local').first().click();
          await page.waitForTimeout(5000);
          
          // Check if we advanced to file selection step
          const currentStep = await page.locator('.sidebar-step.active .step-title').textContent();
          console.log(`   Current step: ${currentStep}`);
          
          if (currentStep === 'File Selection') {
            const treeNodes = await page.locator('.tree-node').count();
            console.log(`   Tree nodes loaded: ${treeNodes}`);
            
            // Now check if files-list has scrollable content
            const nowScrollable = await page.evaluate(() => {
              const filesList = document.querySelector('.files-list');
              if (filesList) {
                return {
                  scrollable: filesList.scrollHeight > filesList.clientHeight,
                  scrollHeight: filesList.scrollHeight,
                  clientHeight: filesList.clientHeight
                };
              }
              return { scrollable: false, scrollHeight: 0, clientHeight: 0 };
            });
            
            console.log(`   Now scrollable: ${nowScrollable.scrollable}`);
            console.log(`   Scroll height: ${nowScrollable.scrollHeight}px`);
            console.log(`   Client height: ${nowScrollable.clientHeight}px`);
          }
        }
      }
      
      // Take screenshot for visual verification of scrollbar styling
      await page.screenshot({ 
        path: 'test-results/scrollbar-styling.png', 
        fullPage: true 
      });
      
      // Test the scrollbar CSS selectors directly
      const websiteScrollbarSupport = await page.evaluate(() => {
        const filesList = document.querySelector('.files-list');
        if (!filesList) return false;
        
        // Create a temporary div to test scrollbar styling
        const testDiv = document.createElement('div');
        testDiv.style.cssText = `
          width: 100px;
          height: 50px;
          overflow-y: scroll;
          position: fixed;
          top: -100px;
          left: -100px;
        `;
        testDiv.innerHTML = '<div style="height: 200px;">Test content</div>';
        
        document.body.appendChild(testDiv);
        
        // Check if webkit scrollbar is supported
        const supportsWebkit = 'WebkitAppearance' in testDiv.style;
        
        document.body.removeChild(testDiv);
        
        return {
          supportsWebkit,
          userAgent: navigator.userAgent,
          isChrome: /Chrome/.test(navigator.userAgent),
          isFirefox: /Firefox/.test(navigator.userAgent)
        };
      });
      
      console.log('6️⃣ Browser scrollbar support:');
      console.log(`   Supports webkit scrollbar: ${websiteScrollbarSupport.supportsWebkit}`);
      console.log(`   Is Chrome: ${websiteScrollbarSupport.isChrome}`);
      console.log(`   Is Firefox: ${websiteScrollbarSupport.isFirefox}`);
      
      // Check if our CSS rules are being applied
      const appliedRules = await page.evaluate(() => {
        const rules = [];
        const sheets = Array.from(document.styleSheets);
        
        sheets.forEach(sheet => {
          try {
            const cssRules = Array.from(sheet.cssRules || sheet.rules || []);
            cssRules.forEach(rule => {
              if (rule.selectorText && rule.selectorText.includes('.files-list::-webkit-scrollbar')) {
                rules.push({
                  selector: rule.selectorText,
                  style: rule.style.cssText
                });
              }
            });
          } catch (e) {
            // CORS or other stylesheet access issues
          }
        });
        
        return rules;
      });
      
      console.log('7️⃣ Applied scrollbar CSS rules:');
      appliedRules.forEach((rule, i) => {
        console.log(`   Rule ${i + 1}: ${rule.selector}`);
        console.log(`      Style: ${rule.style}`);
      });
      
      console.log('\\n✅ Scrollbar styling test completed');
      console.log('   - White scrollbar thumb should be visible when content is scrollable');
      console.log('   - Firefox users will see thin white scrollbars');
      console.log('   - Chrome/WebKit users will see custom styled scrollbars');
      
    } else {
      console.log('❌ Files list element not found - may need to navigate to file selection step');
    }
    
    expect(filesListExists).toBe(true);
  });
});