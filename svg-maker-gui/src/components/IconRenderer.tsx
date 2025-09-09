import React, { useState, useEffect } from 'react';

interface IconRendererProps {
  iconPack: 'lucide' | 'heroicons' | 'feather' | 'phosphor' | 'tabler' | 'fluent' | 'bootstrap' | 'material' | 'ionicons';
  iconName: string;
  size?: number;
  variant?: string;  // For Heroicons (outline/solid/mini), Phosphor (thin/light/regular/bold/fill/duotone), Material (outlined/rounded/sharp), Ionicons (outline/filled/sharp), etc.
  strokeWidth?: number;  // For stroke-based icons
  color?: string;
  className?: string;
  onLoad?: (svgContent: string) => void;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  iconPack,
  iconName,
  size = 24,
  variant,
  strokeWidth = 2,
  color = 'currentColor',
  className = '',
  onLoad
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadIcon();
  }, [iconPack, iconName, size, variant, strokeWidth, color]);

  const loadIcon = async () => {
    setLoading(true);
    setError('');
    
    try {
      let iconService: any;
      let svg: string | null = '';
      
      switch (iconPack) {
        case 'lucide':
          const { lucideService } = await import('../services/lucideService');
          iconService = lucideService;
          svg = await iconService.getIconSvg(iconName, size, strokeWidth, color);
          break;
          
        case 'heroicons':
          const { heroiconsService } = await import('../services/heroiconsService');
          iconService = heroiconsService;
          svg = await iconService.getIconSvg(
            iconName, 
            size, 
            variant as 'outline' | 'solid' | 'mini' || 'outline', 
            strokeWidth
          );
          break;
          
        case 'feather':
          const { featherService } = await import('../services/featherService');
          iconService = featherService;
          svg = await iconService.getIconSvg(iconName, size, strokeWidth, color);
          break;
          
        case 'phosphor':
          const { phosphorService } = await import('../services/phosphorService');
          iconService = phosphorService;
          svg = await iconService.getIconSvg(
            iconName, 
            size,
            variant as 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone' || 'regular',
            color
          );
          break;
          
        case 'tabler':
          const { tablerService } = await import('../services/tablerService');
          iconService = tablerService;
          svg = await iconService.getIconSvg(
            iconName, 
            size, 
            variant as 'outline' | 'filled' || 'outline',
            strokeWidth,
            color
          );
          break;
          
        case 'fluent':
          const { fluentUIService } = await import('../services/fluentUIService');
          iconService = fluentUIService;
          svg = await iconService.getIconSvg(
            iconName, 
            size, 
            variant as 'regular' | 'filled' | 'light' || 'regular'
          );
          break;
          
        case 'bootstrap':
          const { bootstrapService } = await import('../services/bootstrapService');
          iconService = bootstrapService;
          svg = await iconService.getIconSvg(iconName, size);
          break;
          
        case 'material':
          const { materialService } = await import('../services/materialService');
          iconService = materialService;
          svg = await iconService.getIconSvg(
            iconName, 
            size,
            variant as 'outlined' | 'rounded' | 'sharp' || 'outlined',
            color
          );
          break;
          
        case 'ionicons':
          const { ioniconsService } = await import('../services/ioniconsService');
          iconService = ioniconsService;
          svg = await iconService.getIconSvg(
            iconName, 
            size,
            variant as 'outline' | 'filled' | 'sharp' || 'outline'
          );
          break;
          
        default:
          throw new Error(`Unknown icon pack: ${iconPack}`);
      }

      if (svg) {
        setSvgContent(svg);
        if (onLoad) {
          onLoad(svg);
        }
      } else {
        setError(`Icon "${iconName}" not found in ${iconPack}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load icon';
      setError(errorMessage);
      console.error('Error loading icon:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div 
        className={`icon-renderer loading ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" opacity="0.3"/>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`icon-renderer error ${className}`}
        style={{ width: size, height: size }}
        title={error}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 8l8 8M16 8l-8 8"/>
        </svg>
      </div>
    );
  }

  return (
    <div 
      className={`icon-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
};

export default IconRenderer;