import { test, expect } from '@playwright/test';

test.describe('FolderTreeBrowser - Performance Metrics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SVG Maker/);
  });

  test.describe('Core Web Vitals', () => {
    test('should meet Largest Contentful Paint (LCP) benchmarks', async ({ page }) => {
      // Navigate and wait for LCP
      await page.goto('/', { waitUntil: 'networkidle' });

      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });

      // LCP should be under 2.5s (good), definitely under 4s (needs improvement)
      expect(lcp as number).toBeLessThan(4000);
      if (lcp as number > 2500) {
        console.warn(`LCP is ${lcp}ms - consider optimization`);
      }
    });

    test('should meet First Input Delay (FID) benchmarks', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Simulate user interaction
      const start = Date.now();
      await page.locator('input[placeholder*="repository"]').click();
      const end = Date.now();
      
      const inputDelay = end - start;
      
      // FID should be under 100ms (good), definitely under 300ms (needs improvement)
      expect(inputDelay).toBeLessThan(300);
      if (inputDelay > 100) {
        console.warn(`Input delay is ${inputDelay}ms - consider optimization`);
      }
    });

    test('should meet Cumulative Layout Shift (CLS) benchmarks', async ({ page }) => {
      // Monitor layout shifts
      await page.addInitScript(() => {
        (window as any).layoutShifts = [];
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              (window as any).layoutShifts.push((entry as any).value);
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });
      });

      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Wait for potential layout shifts
      await page.waitForTimeout(3000);

      const cls = await page.evaluate(() => {
        return (window as any).layoutShifts.reduce((sum: number, shift: number) => sum + shift, 0);
      });

      // CLS should be under 0.1 (good), definitely under 0.25 (needs improvement)
      expect(cls).toBeLessThan(0.25);
      if (cls > 0.1) {
        console.warn(`CLS is ${cls} - consider optimization`);
      }
    });
  });

  test.describe('Loading Performance', () => {
    test('should load initial page quickly', async ({ page }) => {
      const start = Date.now();
      await page.goto('/');
      await expect(page.locator('.folder-tree-browser')).toBeVisible();
      const end = Date.now();

      const loadTime = end - start;
      
      // Initial page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should load repository data efficiently', async ({ page }) => {
      // Mock large repository
      await page.route('**/api/github/**', async (route) => {
        const start = Date.now();
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            tree: [{
              name: 'icons',
              type: 'dir',
              children: Array.from({ length: 1000 }, (_, i) => ({
                name: `icon-${i}.svg`,
                type: 'file',
                path: `icons/icon-${i}.svg`,
                size: 1024
              }))
            }],
            svgFiles: Array.from({ length: 1000 }, (_, i) => ({
              name: `icon-${i}.svg`,
              path: `icons/icon-${i}.svg`,
              download_url: `https://example.com/icon-${i}.svg`
            }))
          })
        });
        
        const processingTime = Date.now() - start;
        console.log(`Repository data processing time: ${processingTime}ms`);
      });

      const repoInput = page.locator('input[placeholder*="repository"]');
      if (await repoInput.isVisible()) {
        const start = Date.now();
        
        await repoInput.fill('bootstrap/bootstrap-icons');
        await repoInput.press('Enter');
        
        // Wait for repository to load
        await expect(page.locator('.repo-header')).toBeVisible();
        
        const loadTime = Date.now() - start;
        
        // Large repository should load within 10 seconds
        expect(loadTime).toBeLessThan(10000);
      }
    });

    test('should handle concurrent icon loading efficiently', async ({ page }) => {
      // Mock SVG responses with delays
      await page.route('**/*.svg', async (route) => {
        await page.waitForTimeout(Math.random() * 100); // Random delay 0-100ms
        await route.fulfill({
          status: 200,
          contentType: 'image/svg+xml',
          body: '<svg><rect width="20" height="20" fill="currentColor"/></svg>'
        });
      });

      await page.route('**/api/github/**', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            tree: [{ name: 'icons', type: 'dir', children: Array.from({ length: 50 }, (_, i) => ({ name: `icon-${i}.svg`, type: 'file' })) }],
            svgFiles: Array.from({ length: 50 }, (_, i) => ({ name: `icon-${i}.svg`, path: `icon-${i}.svg`, download_url: `https://example.com/icon-${i}.svg` }))
          })
        });
      });

      const start = Date.now();
      
      // Scroll to load icons
      const filesList = page.locator('.files-list');
      await filesList.scrollIntoView();
      
      // Wait for icons to load
      await expect(page.locator('.icon-preview')).toHaveCountGreaterThan(10);
      
      const loadTime = Date.now() - start;
      
      // Icon loading should be efficient
      expect(loadTime).toBeLessThan(5000);
    });
  });

  test.describe('Memory Performance', () => {
    test('should not have significant memory leaks', async ({ page }) => {
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);

      // Perform memory-intensive operations
      for (let i = 0; i < 5; i++) {
        await page.locator('.search-field').fill(`test-${i}`);
        await page.locator('.search-field').fill('');
        await page.waitForTimeout(100);
      }

      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });

      const finalMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = ((finalMemory - initialMemory) / initialMemory) * 100;
        
        // Memory should not grow by more than 50% after operations
        expect(memoryGrowth).toBeLessThan(50);
      }
    });

    test('should clean up event listeners properly', async ({ page }) => {
      // Monitor event listener count
      const getEventListenerCount = () => page.evaluate(() => {
        let count = 0;
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
          const listeners = (el as any)._listeners;
          if (listeners) {
            count += Object.keys(listeners).length;
          }
        });
        return count;
      });

      const initialCount = await getEventListenerCount();

      // Perform operations that add/remove listeners
      await page.locator('.search-field').fill('test');
      await page.locator('.search-field').fill('');

      // Trigger component re-renders
      await page.reload();
      await expect(page.locator('.folder-tree-browser')).toBeVisible();

      const finalCount = await getEventListenerCount();
      
      // Event listener count should not grow significantly
      const growth = finalCount - initialCount;
      expect(growth).toBeLessThan(100);
    });
  });

  test.describe('Rendering Performance', () => {
    test('should maintain 60fps during scrolling', async ({ page }) => {
      // Mock large dataset
      await page.route('**/api/github/**', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            tree: [{ name: 'icons', type: 'dir', children: Array.from({ length: 200 }, (_, i) => ({ name: `icon-${i}.svg`, type: 'file' })) }],
            svgFiles: Array.from({ length: 200 }, (_, i) => ({ name: `icon-${i}.svg`, path: `icon-${i}.svg`, download_url: `https://example.com/icon-${i}.svg` }))
          })
        });
      });

      const filesList = page.locator('.files-list');
      await filesList.scrollIntoView();

      // Measure frame rate during scrolling
      const frameRates = await page.evaluate(() => {
        return new Promise((resolve) => {
          const frameRates: number[] = [];
          let lastFrameTime = performance.now();
          let frameCount = 0;
          
          const measureFrameRate = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastFrameTime;
            const fps = 1000 / deltaTime;
            
            frameRates.push(fps);
            lastFrameTime = currentTime;
            frameCount++;
            
            if (frameCount < 60) {
              requestAnimationFrame(measureFrameRate);
            } else {
              resolve(frameRates);
            }
          };
          
          // Start measuring during scroll
          const scrollContainer = document.querySelector('.files-list');
          if (scrollContainer) {
            let scrollPos = 0;
            const scrollInterval = setInterval(() => {
              scrollContainer.scrollTop = scrollPos;
              scrollPos += 10;
              
              if (scrollPos > 1000) {
                clearInterval(scrollInterval);
              }
            }, 16); // ~60fps scroll
          }
          
          requestAnimationFrame(measureFrameRate);
        });
      });

      const avgFrameRate = (frameRates as number[]).reduce((a, b) => a + b, 0) / (frameRates as number[]).length;
      
      // Should maintain at least 45fps (75% of 60fps)
      expect(avgFrameRate).toBeGreaterThan(45);
    });

    test('should handle rapid DOM updates efficiently', async ({ page }) => {
      const filesList = page.locator('.files-list');
      
      // Measure time for rapid search updates
      const start = Date.now();
      
      const searchTerms = ['a', 'ab', 'abc', 'abcd', 'abcde', 'abcd', 'abc', 'ab', 'a', ''];
      for (const term of searchTerms) {
        await page.locator('.search-field').fill(term);
        await page.waitForTimeout(10);
      }
      
      const updateTime = Date.now() - start;
      
      // Should handle rapid updates efficiently
      expect(updateTime).toBeLessThan(1000);
    });
  });

  test.describe('Network Performance', () => {
    test('should efficiently batch network requests', async ({ page }) => {
      let requestCount = 0;
      
      // Count network requests
      page.on('request', (request) => {
        if (request.url().includes('.svg')) {
          requestCount++;
        }
      });

      await page.route('**/api/github/**', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            tree: [{ name: 'icons', type: 'dir', children: Array.from({ length: 50 }, (_, i) => ({ name: `icon-${i}.svg`, type: 'file' })) }],
            svgFiles: Array.from({ length: 50 }, (_, i) => ({ name: `icon-${i}.svg`, path: `icon-${i}.svg`, download_url: `https://example.com/icon-${i}.svg` }))
          })
        });
      });

      await page.route('**/*.svg', async (route) => {
        await route.fulfill({
          status: 200,
          body: '<svg><rect width="20" height="20" fill="currentColor"/></svg>'
        });
      });

      // Scroll to trigger icon loading
      const filesList = page.locator('.files-list');
      await filesList.scrollIntoView();
      
      // Wait for initial load
      await page.waitForTimeout(2000);
      
      // Should not make excessive requests due to batching/throttling
      expect(requestCount).toBeLessThan(20); // Much less than 50 icons due to viewport culling
    });

    test('should handle network failures gracefully', async ({ page }) => {
      let failedRequests = 0;
      
      // Mock intermittent failures
      await page.route('**/*.svg', async (route) => {
        failedRequests++;
        if (failedRequests % 3 === 0) {
          await route.abort('connectionfailed');
        } else {
          await route.fulfill({
            status: 200,
            body: '<svg><rect width="20" height="20" fill="currentColor"/></svg>'
          });
        }
      });

      await page.route('**/api/github/**', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            tree: [{ name: 'icons', type: 'dir', children: Array.from({ length: 20 }, (_, i) => ({ name: `icon-${i}.svg`, type: 'file' })) }],
            svgFiles: Array.from({ length: 20 }, (_, i) => ({ name: `icon-${i}.svg`, path: `icon-${i}.svg`, download_url: `https://example.com/icon-${i}.svg` }))
          })
        });
      });

      const filesList = page.locator('.files-list');
      await filesList.scrollIntoView();
      
      // Should show fallback icons for failed loads
      await expect(page.locator('.icon-preview-fallback')).toHaveCountGreaterThan(0);
      
      // App should remain responsive despite failures
      const searchField = page.locator('.search-field');
      const start = Date.now();
      await searchField.fill('test');
      const responseTime = Date.now() - start;
      
      expect(responseTime).toBeLessThan(500);
    });
  });

  test.describe('CSS Performance', () => {
    test('should use hardware acceleration appropriately', async ({ page }) => {
      await page.goto('/');
      
      // Check for hardware acceleration on animated elements
      const animatedElements = await page.locator('.tree-node, .icon-preview').evaluateAll(elements => 
        elements.filter(el => {
          const style = getComputedStyle(el);
          return style.transform !== 'none' || 
                 style.willChange !== 'auto' ||
                 style.backfaceVisibility === 'hidden';
        }).length
      );

      // Should have some hardware-accelerated elements
      expect(animatedElements).toBeGreaterThan(0);
    });

    test('should minimize style recalculations', async ({ page }) => {
      await page.goto('/');
      
      // Measure style calculation time
      const start = await page.evaluate(() => performance.now());
      
      // Trigger style recalculations
      await page.locator('.search-field').fill('test');
      await page.locator('.search-field').fill('');
      
      const end = await page.evaluate(() => performance.now());
      const calculationTime = end - start;
      
      // Style calculations should be fast
      expect(calculationTime).toBeLessThan(100);
    });
  });

  test.describe('Bundle Performance', () => {
    test('should have reasonable bundle sizes', async ({ page }) => {
      // Intercept resource loads to measure sizes
      const resourceSizes: { [key: string]: number } = {};
      
      page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('.js') || url.includes('.css')) {
          try {
            const size = (await response.body()).length;
            const filename = url.split('/').pop() || url;
            resourceSizes[filename] = size;
          } catch (error) {
            // Some responses might not be accessible
          }
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check individual file sizes
      Object.entries(resourceSizes).forEach(([filename, size]) => {
        console.log(`${filename}: ${(size / 1024).toFixed(1)}KB`);
        
        // Main bundle should be reasonable (under 1MB)
        if (filename.includes('main') || filename.includes('bundle')) {
          expect(size).toBeLessThan(1024 * 1024);
        }
      });
    });
  });
});