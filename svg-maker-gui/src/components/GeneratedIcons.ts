// Landing Page Showcase Icons - Using REAL Fluent UI service
import { processSvgWithStyle } from '../utils/processSvgStyle';
import { IconConfig } from '../types/IconConfig';
import { fluentUIService } from '../services/fluentUIService';

let originalIcon: string = '';
let glassmorphismIcon: string = '';  
let neumorphismIcon: string = '';

// Initialize icons from real Fluent UI service
const initializeIcons = async () => {
  try {
    // Get a real icon from Fluent UI service - using Star since Diamond doesn't exist
    const realIconSvg = await fluentUIService.getIconSvg('Play', 24, 'filled');
    
    if (realIconSvg) {
      // Original icon with light color
      originalIcon = realIconSvg.replace('fill="currentColor"', 'fill="#94a3b8"');
      
      // Glassmorphism version with dark icon on teal/lime gradient
      const glassmorphismConfig: IconConfig = {
        style: 'glassmorphism',
        width: 64,
        height: 64,
        cornerRadius: 20,
        padding: 12,
        iconColor: '#1a1a1a', // Dark icon
        gradient: {
          angle: 135,
          startColor: '#00e5ff', // Teal
          stopColor: '#84fab0'   // Lime
        },
        glassBackgroundTransparency: 0.15,
        glassIconTransparency: 0.95,
        glassIconBlur: 0,
        dropShadowEnabled: true,
        dropShadowX: 0,
        dropShadowY: 4,
        dropShadowBlur: 12,
        dropShadowOpacity: 0.25,
        dropShadowColor: '#00e5ff'
      };
      glassmorphismIcon = processSvgWithStyle(realIconSvg, glassmorphismConfig);
      
      // Neumorphism version with dark icon on teal/lime gradient
      const neumorphismConfig: IconConfig = {
        style: 'neumorphism',
        width: 64,
        height: 64,
        cornerRadius: 20,
        padding: 12,
        iconColor: '#1a1a1a', // Dark icon
        gradient: {
          angle: 135,
          startColor: '#00e5ff', // Teal
          stopColor: '#84fab0'   // Lime
        },
        dropShadowEnabled: true,
        dropShadowX: 8,
        dropShadowY: 8,
        dropShadowBlur: 16,
        dropShadowOpacity: 0.4,
        dropShadowColor: '#94a3b8'
      };
      neumorphismIcon = processSvgWithStyle(realIconSvg, neumorphismConfig);
    }
  } catch (error) {
    console.error('Error loading real Fluent UI icons:', error);
    // Fallback to a simple placeholder if service fails
    const fallback = '<svg width="64" height="64" viewBox="0 0 24 24" fill="#94a3b8"><circle cx="12" cy="12" r="8"/></svg>';
    originalIcon = fallback;
    glassmorphismIcon = fallback;
    neumorphismIcon = fallback;
  }
};

// Initialize on module load
initializeIcons();

// Getter functions that return the initialized values
export const getOriginalIcon = () => originalIcon;
export const getGlassmorphismIcon = () => glassmorphismIcon; 
export const getNeumorphismIcon = () => neumorphismIcon;

// Legacy exports for compatibility (these will be empty initially until async load completes)
export const originalDiamondIcon = originalIcon;
export const glassmorphismSquareIcon = glassmorphismIcon;
export const neumorphismSquareIcon = neumorphismIcon;