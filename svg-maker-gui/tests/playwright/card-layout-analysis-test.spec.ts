import { test, expect } from '@playwright/test';

test.describe('Card Layout and Theming Analysis', () => {
  test('should analyze card structure and theming in both views', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('=== LANDING PAGE ANALYSIS ===');
    
    // Landing page - check hero card theming
    const heroCard = page.locator('.hero-card');
    if (await heroCard.count() > 0) {
      const heroCardBg = await heroCard.evaluate(el => {
        return window.getComputedStyle(el).background;
      });
      const heroCardBgColor = await heroCard.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log(`Landing Hero Card Background: ${heroCardBg}`);
      console.log(`Landing Hero Card BG Color: ${heroCardBgColor}`);
      
      const heroTitle = heroCard.locator('h1');
      if (await heroTitle.count() > 0) {
        const heroTitleColor = await heroTitle.evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        console.log(`Landing Hero Title Color: ${heroTitleColor}`);
      }
    }
    
    // Landing page - check preview showcase card theming
    const previewCard = page.locator('.preview-showcase-card');
    if (await previewCard.count() > 0) {
      const previewCardBg = await previewCard.evaluate(el => {
        return window.getComputedStyle(el).background;
      });
      const previewCardBgColor = await previewCard.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log(`Landing Preview Card Background: ${previewCardBg}`);
      console.log(`Landing Preview Card BG Color: ${previewCardBgColor}`);
    }
    
    // Check app background on landing page
    const landingAppBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Landing Page App Background: ${landingAppBg}`);
    
    // Navigate to icon repositories
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\\n=== ICON REPOSITORY VIEW ANALYSIS ===');
    
    // Check app background on repo page
    const repoAppBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Repo Page App Background: ${repoAppBg}`);
    
    // Analyze card structure
    const repositoryBrowser = page.locator('.repository-browser');
    if (await repositoryBrowser.count() > 0) {
      console.log('Repository Browser found');
      
      // Check for large container card
      const largeContainerCard = page.locator('.large-container-card');
      const largeContainerCount = await largeContainerCard.count();
      console.log(`Large Container Cards found: ${largeContainerCount}`);
      
      if (largeContainerCount > 0) {
        const largeCardBg = await largeContainerCard.evaluate(el => {
          return window.getComputedStyle(el).backgroundColor;
        });
        const largeCardBackground = await largeContainerCard.evaluate(el => {
          return window.getComputedStyle(el).background;
        });
        console.log(`Large Container Card Background: ${largeCardBackground}`);
        console.log(`Large Container Card BG Color: ${largeCardBg}`);
      }
      
      // Check for repository overview card
      const overviewCard = page.locator('.repository-overview-card');
      const overviewCount = await overviewCard.count();
      console.log(`Repository Overview Cards found: ${overviewCount}`);
      
      if (overviewCount > 0) {
        const overviewCardBg = await overviewCard.evaluate(el => {
          return window.getComputedStyle(el).backgroundColor;
        });
        const overviewCardBackground = await overviewCard.evaluate(el => {
          return window.getComputedStyle(el).background;
        });
        console.log(`Overview Card Background: ${overviewCardBackground}`);
        console.log(`Overview Card BG Color: ${overviewCardBg}`);
        
        // Check text color in overview card
        const overviewTitle = overviewCard.locator('h3').first();
        if (await overviewTitle.count() > 0) {
          const overviewTitleColor = await overviewTitle.evaluate(el => {
            return window.getComputedStyle(el).color;
          });
          console.log(`Overview Card Title Color: ${overviewTitleColor}`);
        }
      }
      
      // Check individual repository cards
      const repoCards = page.locator('.repository-card-outline');
      const repoCardCount = await repoCards.count();
      console.log(`Individual Repository Cards found: ${repoCardCount}`);
      
      if (repoCardCount > 0) {
        const firstRepoCard = repoCards.first();
        const repoCardBg = await firstRepoCard.evaluate(el => {
          return window.getComputedStyle(el).backgroundColor;
        });
        const repoCardBackground = await firstRepoCard.evaluate(el => {
          return window.getComputedStyle(el).background;
        });
        console.log(`Individual Repo Card Background: ${repoCardBackground}`);
        console.log(`Individual Repo Card BG Color: ${repoCardBg}`);
        
        // Check text color in repo card
        const repoCardTitle = firstRepoCard.locator('.repository-name').first();
        if (await repoCardTitle.count() > 0) {
          const repoCardTitleColor = await repoCardTitle.evaluate(el => {
            return window.getComputedStyle(el).color;
          });
          console.log(`Repo Card Title Color: ${repoCardTitleColor}`);
        }
      }
    }
    
    console.log('\\n=== CARD NESTING ANALYSIS ===');
    
    // Check if cards are nested properly
    const nestedStructure = await page.evaluate(() => {
      const browser = document.querySelector('.repository-browser');
      if (!browser) return 'No repository browser found';
      
      const structure = {
        repositoryBrowser: !!browser,
        largeContainer: !!browser.querySelector('.large-container-card'),
        overviewCard: !!browser.querySelector('.repository-overview-card'),
        individualCards: browser.querySelectorAll('.repository-card-outline').length,
        nestedLevels: []
      };
      
      // Check nesting levels
      const largeContainer = browser.querySelector('.large-container-card');
      if (largeContainer) {
        const overviewInLarge = largeContainer.querySelector('.repository-overview-card');
        const individualInLarge = largeContainer.querySelectorAll('.repository-card-outline').length;
        structure.nestedLevels.push(`Large container contains: overview=${!!overviewInLarge}, individual cards=${individualInLarge}`);
        
        if (overviewInLarge) {
          const individualInOverview = overviewInLarge.querySelectorAll('.repository-card-outline').length;
          structure.nestedLevels.push(`Overview card contains: individual cards=${individualInOverview}`);
        }
      }
      
      return structure;
    });
    
    console.log('Card Structure:', JSON.stringify(nestedStructure, null, 2));
    
    console.log('\\n✅ Card layout and theming analysis complete');
  });

  test('should compare theming between light and dark modes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test in light mode first
    console.log('=== LIGHT MODE THEMING ===');
    
    await page.locator('.cta-button').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const lightModeAppBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Light Mode App BG: ${lightModeAppBg}`);
    
    const lightModeCards = await page.evaluate(() => {
      const large = document.querySelector('.large-container-card');
      const overview = document.querySelector('.repository-overview-card');
      const individual = document.querySelector('.repository-card-outline');
      
      return {
        largeContainer: large ? window.getComputedStyle(large).backgroundColor : 'not found',
        overviewCard: overview ? window.getComputedStyle(overview).backgroundColor : 'not found',
        individualCard: individual ? window.getComputedStyle(individual).backgroundColor : 'not found'
      };
    });
    console.log('Light Mode Cards:', JSON.stringify(lightModeCards, null, 2));
    
    // Switch to dark mode
    console.log('\\n=== DARK MODE THEMING ===');
    
    const themeToggle = page.locator('.theme-toggle');
    await themeToggle.click();
    await page.waitForTimeout(1000);
    
    const darkModeAppBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Dark Mode App BG: ${darkModeAppBg}`);
    
    const darkModeCards = await page.evaluate(() => {
      const large = document.querySelector('.large-container-card');
      const overview = document.querySelector('.repository-overview-card');
      const individual = document.querySelector('.repository-card-outline');
      
      return {
        largeContainer: large ? window.getComputedStyle(large).backgroundColor : 'not found',
        overviewCard: overview ? window.getComputedStyle(overview).backgroundColor : 'not found',
        individualCard: individual ? window.getComputedStyle(individual).backgroundColor : 'not found'
      };
    });
    console.log('Dark Mode Cards:', JSON.stringify(darkModeCards, null, 2));
    
    console.log('\\n✅ Theme comparison complete');
  });
});