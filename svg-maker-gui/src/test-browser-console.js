// Browser Console Test for Icon Generation Engines
// Copy and paste this into the browser console to test all services

console.log('🧪 Testing Icon Generation Engines in Browser...\n');

// Test function that works in browser
async function testService(serviceName, getService, iconName, ...args) {
  try {
    console.log(`Testing ${serviceName}...`);
    
    const service = getService();
    
    // Test getAvailableIcons
    const icons = await service.getAvailableIcons();
    console.log(`  ✅ getAvailableIcons: ${icons.length} icons found`);
    
    // Test getIconForPreview if available
    if (service.getIconForPreview) {
      const preview = await service.getIconForPreview(iconName, ...args);
      console.log(`  ✅ getIconForPreview: ${preview ? 'Success' : 'Failed'}`);
    }
    
    // Test getIconAsFile if available
    if (service.getIconAsFile) {
      const file = await service.getIconAsFile(iconName, ...args);
      console.log(`  ✅ getIconAsFile: ${file ? 'Success' : 'Failed'}`);
    }
    
    // Test searchIcons
    const searchResults = service.searchIcons('home');
    console.log(`  ✅ searchIcons: ${searchResults.length} results for 'home'`);
    
    // Test getPopularIcons if available
    if (service.getPopularIcons) {
      const popularIcons = service.getPopularIcons();
      console.log(`  ✅ getPopularIcons: ${popularIcons.length} popular icons`);
    }
    
    // Test getAvailableSizes if available
    if (service.getAvailableSizes) {
      const sizes = service.getAvailableSizes();
      console.log(`  ✅ getAvailableSizes: [${sizes.join(', ')}]`);
    }
    
    // Test getAvailableVariants if available
    if (service.getAvailableVariants) {
      const variants = service.getAvailableVariants();
      console.log(`  ✅ getAvailableVariants: [${variants.join(', ')}]`);
    }
    
    console.log(`  🎉 ${serviceName} - All tests passed!\n`);
    return true;
  } catch (error) {
    console.error(`  ❌ ${serviceName} - Error:`, error.message);
    console.error(error);
    return false;
  }
}

// Run tests (paste this into browser console)
async function runBrowserTests() {
  const results = [];
  
  // Test services that should be available globally
  try {
    // Import services dynamically
    const { fluentUIService } = await import('./services/fluentUIService.js');
    const { lucideService } = await import('./services/lucideService.js');
    const { phosphorService } = await import('./services/phosphorService.js');
    const { heroiconsService } = await import('./services/heroiconsService.js');
    const { tablerService } = await import('./services/tablerService.js');
    const { bootstrapService } = await import('./services/bootstrapService.js');
    const { featherService } = await import('./services/featherService.js');
    
    results.push(await testService('FluentUI', () => fluentUIService, 'Add', 24, 'regular'));
    results.push(await testService('Lucide', () => lucideService, 'home', 24, 2));
    results.push(await testService('Phosphor', () => phosphorService, 'house', 'regular', 24));
    results.push(await testService('Heroicons', () => heroiconsService, 'home', 24, 'outline'));
    results.push(await testService('Tabler', () => tablerService, 'home', 24, 'outline'));
    results.push(await testService('Bootstrap Icons', () => bootstrapService, 'house', 24));
    results.push(await testService('Feather', () => featherService, 'home', 24, 2));
    
  } catch (error) {
    console.error('Error importing services:', error);
  }
  
  // Summary
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('📊 Test Summary:');
  console.log(`  ✅ Passed: ${passed}/${total}`);
  console.log(`  ${passed === total ? '🎉 All icon services are working properly!' : '⚠️  Some services need attention'}`);
}

// Auto-run the tests
runBrowserTests();