import { test, expect } from '@playwright/test';

test.describe('Debug List Item Positioning', () => {
  test('should analyze list item positioning issues', async ({ page }) => {
    console.log('=== DEBUG LIST ITEM POSITIONING ===\n');
    
    // Navigate to GitHub workflow
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Get Started")').click();
    await page.waitForTimeout(1000);
    
    await page.locator('.mode-card.github-mode').click();
    await page.waitForTimeout(2000);
    
    console.log('1️⃣ Navigated to GitHub workflow');
    
    // Take screenshot of repository list
    await page.screenshot({ path: 'test-results/positioning-repo-list.png', fullPage: true });
    
    // Check repository card positioning
    console.log('2️⃣ Analyzing repository card positioning...');
    const repositoryCards = await page.locator('.repository-card').all();
    
    for (let i = 0; i < Math.min(3, repositoryCards.length); i++) {
      const card = repositoryCards[i];
      const cardInfo = await card.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const styles = getComputedStyle(el);
        return {
          position: styles.position,
          top: styles.top,
          left: styles.left,
          margin: styles.margin,
          padding: styles.padding,
          display: styles.display,
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y,
          className: el.className
        };
      });
      
      console.log(`   Card ${i+1}:`);
      console.log(`     Position: ${cardInfo.position}`);
      console.log(`     Top/Left: ${cardInfo.top}/${cardInfo.left}`);
      console.log(`     Margin: ${cardInfo.margin}`);
      console.log(`     Padding: ${cardInfo.padding}`);
      console.log(`     Display: ${cardInfo.display}`);
      console.log(`     Bounds: ${cardInfo.width}x${cardInfo.height} at (${cardInfo.x}, ${cardInfo.y})`);
      console.log(`     Classes: ${cardInfo.className}`);
      console.log('');
    }
    
    // Click first repo to get to file selection where tree items appear
    if (repositoryCards.length > 0) {
      console.log('3️⃣ Clicking first repository to check tree item positioning...');
      
      // Add temporary GitHub token to bypass rate limiting for testing
      await page.addInitScript(() => {
        // Mock the GitHub service to avoid rate limiting for testing
        window.localStorage.setItem('mock-github-data', 'true');
      });
      
      await repositoryCards[0].click();
      await page.waitForTimeout(5000);
      
      // Take screenshot after repo loading
      await page.screenshot({ path: 'test-results/positioning-after-repo-load.png', fullPage: true });
      
      // Check if we got to file selection and analyze tree item positioning
      const currentStep = await page.locator('.sidebar-step.active .step-title').textContent();
      console.log(`   Current step: ${currentStep}`);
      
      if (currentStep === 'File Selection') {
        console.log('4️⃣ Analyzing tree item positioning in file selection...');
        
        const treeNodes = await page.locator('.tree-node').all();
        console.log(`   Found ${treeNodes.length} tree nodes`);
        
        for (let i = 0; i < Math.min(5, treeNodes.length); i++) {
          const node = treeNodes[i];
          const nodeInfo = await node.evaluate(el => {
            const rect = el.getBoundingClientRect();
            const styles = getComputedStyle(el);
            return {
              position: styles.position,
              top: styles.top,
              left: styles.left,
              paddingLeft: styles.paddingLeft,
              margin: styles.margin,
              display: styles.display,
              alignItems: styles.alignItems,
              justifyContent: styles.justifyContent,
              width: rect.width,
              height: rect.height,
              x: rect.x,
              y: rect.y,
              textContent: el.textContent?.substring(0, 30) || '',
              className: el.className
            };
          });
          
          console.log(`   Tree Node ${i+1}: "${nodeInfo.textContent}"`);
          console.log(`     Position: ${nodeInfo.position}`);
          console.log(`     Top/Left: ${nodeInfo.top}/${nodeInfo.left}`);
          console.log(`     Padding Left: ${nodeInfo.paddingLeft}`);
          console.log(`     Margin: ${nodeInfo.margin}`);
          console.log(`     Display: ${nodeInfo.display}`);
          console.log(`     Align/Justify: ${nodeInfo.alignItems}/${nodeInfo.justifyContent}`);
          console.log(`     Bounds: ${nodeInfo.width}x${nodeInfo.height} at (${nodeInfo.x}, ${nodeInfo.y})`);
          console.log(`     Classes: ${nodeInfo.className}`);
          console.log('');
        }
        
        // Check for overlap or positioning issues
        console.log('5️⃣ Checking for positioning problems...');
        
        const positioningIssues = await page.evaluate(() => {
          const issues = [];
          const nodes = Array.from(document.querySelectorAll('.tree-node'));
          
          nodes.forEach((node, i) => {
            const rect = node.getBoundingClientRect();
            const styles = getComputedStyle(node);
            
            // Check if node extends beyond container
            const container = node.closest('.folder-tree-browser');
            if (container) {
              const containerRect = container.getBoundingClientRect();
              if (rect.right > containerRect.right) {
                issues.push(`Node ${i+1}: extends beyond container right edge`);
              }
              if (rect.left < containerRect.left) {
                issues.push(`Node ${i+1}: extends beyond container left edge`);
              }
            }
            
            // Check for negative positioning
            if (rect.x < 0) {
              issues.push(`Node ${i+1}: negative X position (${rect.x})`);
            }
            if (rect.y < 0) {
              issues.push(`Node ${i+1}: negative Y position (${rect.y})`);
            }
            
            // Check for zero height/width
            if (rect.height === 0) {
              issues.push(`Node ${i+1}: zero height`);
            }
            if (rect.width === 0) {
              issues.push(`Node ${i+1}: zero width`);
            }
            
            // Check for overlapping with next node
            if (i < nodes.length - 1) {
              const nextRect = nodes[i + 1].getBoundingClientRect();
              if (rect.bottom > nextRect.top) {
                issues.push(`Node ${i+1}: overlaps with next node`);
              }
            }
            
            // Check for improper text alignment
            const textElements = node.querySelectorAll('span, .file-name, .folder-name');
            textElements.forEach((textEl, j) => {
              const textRect = textEl.getBoundingClientRect();
              if (textRect.left < rect.left || textRect.right > rect.right) {
                issues.push(`Node ${i+1}: text element ${j+1} extends beyond node bounds`);
              }
            });
          });
          
          return issues;
        });
        
        if (positioningIssues.length > 0) {
          console.log('   🚨 Positioning issues found:');
          positioningIssues.forEach((issue, i) => {
            console.log(`     ${i+1}. ${issue}`);
          });
        } else {
          console.log('   ✅ No major positioning issues detected');
        }
        
      } else {
        console.log('   ⚠️  Still on repository selection - checking repository card positioning issues');
        
        // Analyze repository card internal positioning
        const cardPositioningIssues = await page.evaluate(() => {
          const issues = [];
          const cards = Array.from(document.querySelectorAll('.repository-card'));
          
          cards.forEach((card, i) => {
            const cardRect = card.getBoundingClientRect();
            
            // Check card header positioning
            const header = card.querySelector('.repository-header');
            if (header) {
              const headerRect = header.getBoundingClientRect();
              if (headerRect.left < cardRect.left || headerRect.right > cardRect.right) {
                issues.push(`Card ${i+1}: header extends beyond card bounds`);
              }
            }
            
            // Check card body positioning
            const body = card.querySelector('.repository-body');
            if (body) {
              const bodyRect = body.getBoundingClientRect();
              if (bodyRect.left < cardRect.left || bodyRect.right > cardRect.right) {
                issues.push(`Card ${i+1}: body extends beyond card bounds`);
              }
            }
            
            // Check card footer positioning
            const footer = card.querySelector('.repository-footer');
            if (footer) {
              const footerRect = footer.getBoundingClientRect();
              if (footerRect.left < cardRect.left || footerRect.right > cardRect.right) {
                issues.push(`Card ${i+1}: footer extends beyond card bounds`);
              }
            }
            
            // Check for text overflow
            const textElements = card.querySelectorAll('.repository-name, .repository-description, .meta-item');
            textElements.forEach((textEl, j) => {
              const textRect = textEl.getBoundingClientRect();
              if (textRect.right > cardRect.right - 16) { // Account for padding
                issues.push(`Card ${i+1}: text element ${j+1} near/beyond right edge`);
              }
            });
          });
          
          return issues;
        });
        
        if (cardPositioningIssues.length > 0) {
          console.log('   🚨 Card positioning issues found:');
          cardPositioningIssues.forEach((issue, i) => {
            console.log(`     ${i+1}. ${issue}`);
          });
        } else {
          console.log('   ✅ No major card positioning issues detected');
        }
      }
    }
    
    // Test different viewport sizes
    console.log('6️⃣ Testing positioning across different viewport sizes...');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1400, height: 900 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      console.log(`   ${viewport.name} (${viewport.width}x${viewport.height}):`);
      
      // Check for horizontal overflow
      const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const vpWidth = viewport.width;
      const hasHScroll = docWidth > vpWidth + 5;
      
      console.log(`     Document width: ${docWidth}px, Viewport: ${vpWidth}px`);
      console.log(`     Horizontal scroll: ${hasHScroll ? '❌ YES' : '✅ NO'}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/positioning-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      });
      
      // Check for elements that extend beyond viewport
      const overflowElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const issues = [];
        
        elements.forEach((el, i) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth + 10) { // 10px tolerance
            const tagName = el.tagName;
            const className = el.className || '';
            issues.push(`${tagName}.${className} extends ${rect.right - window.innerWidth}px beyond right edge`);
          }
        });
        
        return issues.slice(0, 5); // Limit to first 5 issues
      });
      
      if (overflowElements.length > 0) {
        console.log(`     🚨 Elements extending beyond viewport:`);
        overflowElements.forEach(issue => {
          console.log(`       - ${issue}`);
        });
      }
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    
    console.log('\\n📋 POSITIONING ANALYSIS COMPLETE');
    console.log('   Screenshots saved for detailed visual inspection');
    
    expect(true).toBe(true);
  });
});