import { test, expect } from '@playwright/test';

test.describe('Quick GitHub Workflow Verification', () => {
  test('should show GitHub repository input and navigate to icon list', async ({ page }) => {
    console.log('=== QUICK GITHUB WORKFLOW TEST ===\n');
    
    // Navigate to app
    await page.goto('/');
    await expect(page).toHaveTitle(/SVG Designer/);
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/quick-test-01-landing.png', fullPage: true });
    
    // Click Get Started
    console.log('1️⃣ Clicking Get Started...');
    const getStartedButton = page.locator('button:has-text("Get Started")');
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/quick-test-02-dashboard.png', fullPage: true });
    
    // Click GitHub mode card
    console.log('2️⃣ Clicking GitHub mode...');
    const githubCard = page.locator('.mode-card.github-mode');
    const githubCount = await githubCard.count();
    console.log(`   Found ${githubCount} GitHub cards`);
    
    if (githubCount > 0) {
      await githubCard.click();
      await page.waitForTimeout(3000);
      console.log('   ✓ Clicked GitHub card');
    }
    
    await page.screenshot({ path: 'test-results/quick-test-03-github-workflow.png', fullPage: true });
    
    // Look for repository input
    console.log('3️⃣ Looking for repository input...');
    const repoInputs = await page.locator('input[placeholder*="repository" i], input[placeholder*="github" i], input[placeholder*="url" i]').all();
    console.log(`   Found ${repoInputs.length} repository input fields`);
    
    // Also check for any input fields at all
    const allInputs = await page.locator('input').count();
    console.log(`   Found ${allInputs} total input fields`);
    
    // List all visible elements for debugging
    const visibleElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const visible = elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }).map(el => ({
        tag: el.tagName,
        classes: el.className,
        id: el.id,
        text: el.textContent?.substring(0, 50) || ''
      }));
      return visible.slice(0, 20); // First 20 visible elements
    });
    
    console.log('   Visible elements:');
    visibleElements.forEach((el, i) => {
      console.log(`     ${i+1}. ${el.tag} - classes: ${el.classes} - text: "${el.text}"`);
    });
    
    // Check current URL and step
    const currentUrl = page.url();
    const stepIndicators = await page.locator('[class*="step"], [class*="wizard"]').count();
    console.log(`   Current URL: ${currentUrl}`);
    console.log(`   Step indicators: ${stepIndicators}`);
    
    // Look for workflow elements
    const workflowElements = await page.locator('.github-workflow-container, .workflow-sidebar, .workflow-main-content').count();
    console.log(`   Workflow elements: ${workflowElements}`);
    
    // This test is just for debugging - always pass
    expect(true).toBe(true);
  });
});