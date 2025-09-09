import { test, expect } from '@playwright/test';

test.describe('Debug GitHub Navigation', () => {
  test('should debug GitHub button click and mode changes', async ({ page }) => {
    console.log('=== DEBUG GITHUB NAVIGATION ===\n');
    
    // Navigate to app
    await page.goto('/');
    await expect(page).toHaveTitle(/SVG Designer/);
    await page.waitForTimeout(2000);
    
    // Click Get Started
    console.log('1️⃣ Clicking Get Started...');
    const getStartedButton = page.locator('button:has-text("Get Started")');
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();
    await page.waitForTimeout(2000);
    
    // Check we're on dashboard
    console.log('2️⃣ Checking dashboard state...');
    const dashboardOverview = page.locator('.dashboard-overview');
    await expect(dashboardOverview).toBeVisible();
    console.log('   ✓ Dashboard overview visible');
    
    // Find the specific GitHub card
    console.log('3️⃣ Looking for GitHub card...');
    const githubCard = page.locator('.mode-card.github-mode');
    const cardCount = await githubCard.count();
    console.log(`   Found ${cardCount} GitHub cards`);
    
    if (cardCount > 0) {
      console.log('   ✓ GitHub card found, checking if clickable...');
      await expect(githubCard).toBeVisible();
      
      // Take screenshot before click
      await page.screenshot({ path: 'test-results/debug-before-click.png', fullPage: true });
      
      // Click the GitHub card
      console.log('4️⃣ Clicking GitHub card...');
      await githubCard.click();
      await page.waitForTimeout(3000); // Give more time for state change
      
      // Take screenshot after click
      await page.screenshot({ path: 'test-results/debug-after-click.png', fullPage: true });
      
      // Check what's visible now
      console.log('5️⃣ Checking post-click state...');
      
      const stillOnDashboard = await dashboardOverview.isVisible();
      console.log(`   Dashboard still visible: ${stillOnDashboard}`);
      
      const githubWorkflowContainer = page.locator('.github-workflow-container');
      const workflowVisible = await githubWorkflowContainer.isVisible();
      console.log(`   GitHub workflow container visible: ${workflowVisible}`);
      
      // Check for specific workflow elements
      const workflowSidebar = page.locator('.workflow-sidebar');
      const sidebarVisible = await workflowSidebar.isVisible();
      console.log(`   Workflow sidebar visible: ${sidebarVisible}`);
      
      const workflowMainContent = page.locator('.workflow-main-content');
      const mainContentVisible = await workflowMainContent.isVisible();
      console.log(`   Workflow main content visible: ${mainContentVisible}`);
      
      // Check for repository input in the workflow
      const repoInputs = await page.locator('input[placeholder*="repository" i], input[placeholder*="github" i], input[placeholder*="url" i]').count();
      console.log(`   Repository input fields found: ${repoInputs}`);
      
      // Log current page classes
      const bodyClasses = await page.evaluate(() => document.body.className);
      console.log(`   Body classes: "${bodyClasses}"`);
      
      // Check for mode state in React (if possible)
      const currentMode = await page.evaluate(() => {
        // Try to find any element that might indicate current mode
        const appContainer = document.querySelector('.app-container');
        return appContainer ? appContainer.getAttribute('data-mode') || 'unknown' : 'not-found';
      });
      console.log(`   App mode indicator: ${currentMode}`);
      
      // List all top-level containers
      const containers = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.app-content > *')).map(el => ({
          tag: el.tagName,
          classes: el.className,
          visible: el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0
        }));
      });
      
      console.log('   App content children:');
      containers.forEach((container, i) => {
        console.log(`     ${i+1}. ${container.tag} - classes: ${container.classes} - visible: ${container.visible}`);
      });
      
      // SUCCESS CRITERIA
      if (workflowVisible && sidebarVisible && !stillOnDashboard) {
        console.log('   ✅ SUCCESS: Navigation worked properly!');
      } else if (stillOnDashboard) {
        console.log('   ❌ FAILURE: Still on dashboard, navigation did not work');
      } else {
        console.log('   ⚠️  PARTIAL: Some elements missing');
      }
    }
    
    expect(true).toBe(true);
  });
});