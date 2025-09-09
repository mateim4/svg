// Direct test of real Lucide service
const fetch = require('node-fetch');

async function testRealLucideService() {
  console.log('=== TESTING REAL LUCIDE SERVICE DIRECTLY ===\n');
  
  const BASE_URL = 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons';
  
  // Test icons to fetch
  const testIcons = ['home', 'user', 'heart', 'star', 'search'];
  
  console.log('🔍 Testing direct GitHub API access for Lucide icons...\n');
  
  for (const iconName of testIcons) {
    try {
      const iconUrl = `${BASE_URL}/${iconName}.svg`;
      console.log(`Fetching: ${iconName} from ${iconUrl}`);
      
      const response = await fetch(iconUrl);
      
      if (response.ok) {
        const svgContent = await response.text();
        
        // Validate SVG structure
        const isValidSvg = svgContent.includes('<svg') && svgContent.includes('</svg>');
        const hasLucideStructure = svgContent.includes('stroke="currentColor"') && 
                                  svgContent.includes('stroke-width="2"') &&
                                  svgContent.includes('viewBox="0 0 24 24"');
        
        console.log(`  ✅ ${iconName}: ${response.status} - ${svgContent.length} bytes`);
        console.log(`  📋 Valid SVG: ${isValidSvg}`);
        console.log(`  🎨 Lucide Structure: ${hasLucideStructure}`);
        
        if (hasLucideStructure) {
          console.log(`  🎯 REAL Lucide icon confirmed!\n`);
        } else {
          console.log(`  ⚠️ Unexpected SVG structure\n`);
        }
        
      } else {
        console.log(`  ❌ ${iconName}: ${response.status} ${response.statusText}\n`);
      }
      
    } catch (error) {
      console.log(`  💥 ${iconName}: Error - ${error.message}\n`);
    }
  }
  
  console.log('📊 SUMMARY:');
  console.log('- Testing real GitHub API access for Lucide icons');
  console.log('- No mock code, no hardcoded paths');  
  console.log('- Direct fetching from: https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/');
  console.log('- Validating real SVG structure and Lucide specifications');
}

testRealLucideService().catch(console.error);