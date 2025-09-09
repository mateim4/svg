// Test script to verify icon services are working
import { lucideService } from './src/services/lucideService.js';
import { phosphorService } from './src/services/phosphorService.js';

async function testServices() {
  console.log('Testing Lucide Service...');
  try {
    const lucideSvg = await lucideService.getIconSvg('activity', 24);
    console.log('Lucide activity icon:', lucideSvg ? '✓ Loaded' : '✗ Failed');
    if (lucideSvg) {
      console.log('SVG preview:', lucideSvg.substring(0, 100) + '...');
    }
  } catch (error) {
    console.error('Lucide error:', error.message);
  }

  console.log('\nTesting Phosphor Service...');
  try {
    const phosphorResult = await phosphorService.getIcon('house', 'regular', 24);
    console.log('Phosphor house icon:', phosphorResult?.content ? '✓ Loaded' : '✗ Failed');
    if (phosphorResult?.content) {
      console.log('SVG preview:', phosphorResult.content.substring(0, 100) + '...');
    }
  } catch (error) {
    console.error('Phosphor error:', error.message);
  }
}

testServices();