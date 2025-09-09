import { test, expect } from '@playwright/test';

test.describe('SVG Maker App - Discovery and Structure Analysis', () => {
  test('should identify app structure and components', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await expect(page).toHaveTitle(/SVG Maker/);
    
    // Discover main app structure
    const bodyClasses = await page.locator('body').getAttribute('class');
    console.log('Body classes:', bodyClasses);
    
    // Find main containers
    const mainContainers = await page.locator('div[class*="app"], div[class*="main"], main').all();
    console.log(`Found ${mainContainers.length} main containers`);
    
    for (let i = 0; i < mainContainers.length; i++) {
      const className = await mainContainers[i].getAttribute('class');
      console.log(`Container ${i}:`, className);
    }
    
    // Discover navigation/routing structure
    const navElements = await page.locator('nav, [role="navigation"], a[href]').all();
    console.log(`Found ${navElements.length} navigation elements`);
    
    // Discover major page sections
    const sections = await page.locator('section, [class*="page"], [class*="view"], [class*="component"]').all();
    console.log(`Found ${sections.length} major sections`);
    
    // Identify forms and interactive elements
    const forms = await page.locator('form').count();
    const inputs = await page.locator('input').count();
    const buttons = await page.locator('button').count();
    const selects = await page.locator('select').count();
    
    console.log(`Interactive elements - Forms: ${forms}, Inputs: ${inputs}, Buttons: ${buttons}, Selects: ${selects}`);
    
    // Identify data display elements
    const lists = await page.locator('ul, ol, [class*="list"]').count();
    const grids = await page.locator('[class*="grid"], [class*="table"]').count();
    const cards = await page.locator('[class*="card"]').count();
    
    console.log(`Data display - Lists: ${lists}, Grids: ${grids}, Cards: ${cards}`);
    
    // Take screenshot for visual reference
    await page.screenshot({ path: 'test-results/app-structure.png', fullPage: true });
    
    // This test should always pass - it's for discovery
    expect(true).toBe(true);
  });

  test('should identify all pages and routes', async ({ page }) => {
    await page.goto('/');
    
    // Find all internal links
    const links = await page.locator('a[href^="/"], a[href^="./"], a[href^="../"]').all();
    const routes = new Set<string>();
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href) {
        routes.add(href);
      }
    }
    
    console.log('Discovered routes:', Array.from(routes));
    
    // Test each route
    for (const route of routes) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        const title = await page.title();
        const heading = await page.locator('h1, h2, h3').first().textContent().catch(() => 'No heading');
        
        console.log(`Route ${route}: Title="${title}", Heading="${heading}"`);
        
        // Take screenshot of each page
        const safePath = route.replace(/[^a-zA-Z0-9]/g, '_');
        await page.screenshot({ path: `test-results/page-${safePath}.png` });
        
      } catch (error) {
        console.log(`Error loading route ${route}:`, error);
      }
    }
    
    expect(routes.size).toBeGreaterThan(0);
  });

  test('should analyze component architecture', async ({ page }) => {
    await page.goto('/');
    
    // Look for React component patterns
    const reactComponents = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const components = new Set<string>();
      
      elements.forEach(el => {
        // Look for component class patterns
        const classes = el.className?.toString().split(' ') || [];
        classes.forEach(cls => {
          if (cls.match(/^[A-Z][a-zA-Z]*$/) || cls.includes('component') || cls.includes('Component')) {
            components.add(cls);
          }
        });
        
        // Look for data attributes that might indicate components
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('data-') && attr.name.includes('component')) {
            components.add(attr.value);
          }
        });
      });
      
      return Array.from(components);
    });
    
    console.log('Discovered React components:', reactComponents);
    
    // Look for UI library patterns (Material-UI, Ant Design, etc.)
    const uiLibraryClasses = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const libraries = new Set<string>();
      
      elements.forEach(el => {
        const classes = el.className?.toString() || '';
        
        // Common UI library patterns
        if (classes.includes('MuiButton') || classes.includes('mui-')) libraries.add('Material-UI');
        if (classes.includes('ant-')) libraries.add('Ant Design');
        if (classes.includes('bp3-') || classes.includes('bp4-')) libraries.add('Blueprint');
        if (classes.includes('ms-')) libraries.add('Fluent UI');
        if (classes.includes('chakra-')) libraries.add('Chakra UI');
      });
      
      return Array.from(libraries);
    });
    
    console.log('UI Libraries detected:', uiLibraryClasses);
    
    expect(true).toBe(true);
  });

  test('should identify current state and functionality', async ({ page }) => {
    await page.goto('/');
    
    // Check for loading states
    const loadingElements = await page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]').count();
    console.log(`Loading indicators: ${loadingElements}`);
    
    // Check for error states
    const errorElements = await page.locator('[class*="error"], [class*="alert"], [role="alert"]').count();
    console.log(`Error indicators: ${errorElements}`);
    
    // Check for empty states
    const emptyElements = await page.locator('[class*="empty"], [class*="no-data"], [class*="placeholder"]').count();
    console.log(`Empty state indicators: ${emptyElements}`);
    
    // Check for interactive elements
    const clickableElements = await page.locator('button, [role="button"], [onclick], [class*="clickable"]').count();
    console.log(`Clickable elements: ${clickableElements}`);
    
    // Check for form elements
    const formElements = await page.locator('input, select, textarea').count();
    console.log(`Form elements: ${formElements}`);
    
    // Check for modal/dialog elements
    const modalElements = await page.locator('[role="dialog"], [class*="modal"], [class*="dialog"]').count();
    console.log(`Modal/dialog elements: ${modalElements}`);
    
    // Check for tooltip elements
    const tooltipElements = await page.locator('[role="tooltip"], [class*="tooltip"]').count();
    console.log(`Tooltip elements: ${tooltipElements}`);
    
    expect(true).toBe(true);
  });
});