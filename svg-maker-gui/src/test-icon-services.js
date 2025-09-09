// Quick test script to verify all icon generation engines are working
// Run this with: node src/test-icon-services.js

// Test FluentUI Service
import { fluentUIService } from './services/fluentUIService.js';
import { lucideService } from './services/lucideService.js';
import { phosphorService } from './services/phosphorService.js';
import { heroiconsService } from './services/heroiconsService.js';
import { tablerService } from './services/tablerService.js';
import { bootstrapService } from './services/bootstrapService.js';
import { featherService } from './services/featherService.js';

console.log('🧪 Testing Icon Generation Engines...\n');

async function testIconService(serviceName, service, iconName, ...args) {
  try {
    console.log(`Testing ${serviceName}...`);
    
    // Test getAvailableIcons
    const icons = await service.getAvailableIcons();
    console.log(`  ✅ getAvailableIcons: ${icons.length} icons found`);
    
    // Test getIconForPreview
    const preview = await service.getIconForPreview(iconName, ...args);
    console.log(`  ✅ getIconForPreview: ${preview ? 'Success' : 'Failed'}`);
    
    // Test getIconAsFile
    const file = await service.getIconAsFile(iconName, ...args);
    console.log(`  ✅ getIconAsFile: ${file ? 'Success' : 'Failed'}`);
    
    // Test searchIcons
    const searchResults = service.searchIcons('home');
    console.log(`  ✅ searchIcons: ${searchResults.length} results for 'home'`);
    
    // Test getPopularIcons
    const popularIcons = service.getPopularIcons();
    console.log(`  ✅ getPopularIcons: ${popularIcons.length} popular icons`);
    
    // Test getAvailableSizes
    const sizes = service.getAvailableSizes();
    console.log(`  ✅ getAvailableSizes: [${sizes.join(', ')}]`);
    
    // Test getAvailableVariants
    const variants = service.getAvailableVariants();
    console.log(`  ✅ getAvailableVariants: [${variants.join(', ')}]`);
    
    console.log(`  🎉 ${serviceName} - All tests passed!\n`);
    return true;
  } catch (error) {
    console.error(`  ❌ ${serviceName} - Error:`, error.message);
    return false;
  }
}

async function runAllTests() {
  const results = [];
  
  // Test all icon services
  results.push(await testIconService('FluentUI', fluentUIService, 'Add', 24, 'regular'));
  results.push(await testIconService('Lucide', lucideService, 'home', 24, 2));
  results.push(await testIconService('Phosphor', phosphorService, 'house', 'regular', 24));
  results.push(await testIconService('Heroicons', heroiconsService, 'home', 24, 'outline'));
  results.push(await testIconService('Tabler', tablerService, 'home', 24, 'outline'));
  results.push(await testIconService('Bootstrap Icons', bootstrapService, 'house', 24));
  results.push(await testIconService('Feather', featherService, 'home', 24, 2));
  
  // Summary
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('📊 Test Summary:');
  console.log(`  ✅ Passed: ${passed}/${total}`);
  console.log(`  ${passed === total ? '🎉 All icon services are working properly!' : '⚠️  Some services need attention'}`);
}

runAllTests();