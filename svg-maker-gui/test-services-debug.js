// Quick test to debug icon services
async function testServices() {
  try {
    console.log('=== Testing Lucide Service ===');
    const { lucideService } = await import('./src/services/lucideService.js');
    const lucideIcons = lucideService.getAvailableIcons();
    console.log(`Lucide icons available: ${lucideIcons.length}`);
    console.log('First 5 lucide icons:', lucideIcons.slice(0, 5));
    
    console.log('Testing lucide icon fetch...');
    const lucideIcon = await lucideService.getIconSvg('home', 24, 2, 'currentColor');
    console.log('Lucide home icon result:', lucideIcon ? 'SUCCESS' : 'FAILED');
    if (!lucideIcon) {
      console.error('Failed to get lucide home icon');
    }

    console.log('=== Testing Heroicons Service ===');
    const { heroiconsService } = await import('./src/services/heroiconsService.js');
    const heroIcons = heroiconsService.getAvailableIcons();
    console.log(`Heroicons available: ${heroIcons.length}`);
    console.log('First 5 heroicons:', heroIcons.slice(0, 5));
    
    const heroIcon = await heroiconsService.getIconSvg('home', 24, 'outline', 1.5);
    console.log('Heroicons home icon result:', heroIcon ? 'SUCCESS' : 'FAILED');
    
    console.log('=== Testing Feather Service ===');
    const { featherService } = await import('./src/services/featherService.js');
    const featherIcons = featherService.getAvailableIcons();
    console.log(`Feather icons available: ${featherIcons.length}`);
    console.log('First 5 feather icons:', featherIcons.slice(0, 5));
    
    const featherIcon = await featherService.getIconSvg('home', 24, 2, 'currentColor');
    console.log('Feather home icon result:', featherIcon ? 'SUCCESS' : 'FAILED');

    console.log('=== Testing Phosphor Service ===');
    const { phosphorService } = await import('./src/services/phosphorService.js');
    const phosphorIcons = phosphorService.getAvailableIcons();
    console.log(`Phosphor icons available: ${phosphorIcons.length}`);
    console.log('First 5 phosphor icons:', phosphorIcons.slice(0, 5));
    
    const phosphorIcon = await phosphorService.getIconSvg('house', 24, 'regular', 'currentColor');
    console.log('Phosphor house icon result:', phosphorIcon ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('Error testing services:', error);
  }
}

testServices();