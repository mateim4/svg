// Real Fluent UI Service using official Microsoft @fluentui/svg-icons package
import { RealFluentUIService, RealFluentUIIcon } from './realFluentUIService';

export interface FluentUIIcon {
  name: string;
  sizes: number[];
  variants: ('regular' | 'filled' | 'light')[];
  category?: string;
}

export interface FluentUIServiceIcon {
  name: string;
  content: string;
  size: number;
  variant: 'regular' | 'filled' | 'light';
}

export class FluentUIService {
  private realService: RealFluentUIService;

  constructor() {
    this.realService = new RealFluentUIService();
  }

  // Get all available icons from the real Fluent UI package
  async getAvailableIcons(): Promise<FluentUIIcon[]> {
    const realIcons = this.realService.getAvailableIcons();
    return realIcons.map(icon => ({
      name: icon.name,
      sizes: icon.sizes,
      variants: icon.variants,
      category: icon.category
    }));
  }

  // Get specific icon with all variants and sizes
  async getIcon(iconName: string): Promise<FluentUIIcon | null> {
    const realIcon = this.realService.getIconInfo(iconName);
    if (!realIcon) return null;

    return {
      name: realIcon.name,
      sizes: realIcon.sizes,
      variants: realIcon.variants,
      category: realIcon.category
    };
  }

  // Get icon SVG content by specific size and variant
  async getIconSvg(iconName: string, size: number = 24, variant: 'regular' | 'filled' | 'light' = 'regular'): Promise<string | null> {
    return this.realService.getIconSvg(iconName, size, variant);
  }

  // Search icons by name
  async searchIcons(query: string): Promise<FluentUIIcon[]> {
    const searchResults = this.realService.searchIcons(query);
    return searchResults.map(icon => ({
      name: icon.name,
      sizes: icon.sizes,
      variants: icon.variants,
      category: icon.category
    }));
  }

  // Get popular icons for quick access
  async getPopularIcons(): Promise<FluentUIIcon[]> {
    const popularIcons = this.realService.getPopularIcons();
    return popularIcons.map(icon => ({
      name: icon.name,
      sizes: icon.sizes,
      variants: icon.variants,
      category: icon.category
    }));
  }

  // Get a properly formatted FluentUI icon for the preview system
  async getIconForPreview(iconName: string, size: number = 24, variant: 'regular' | 'filled' | 'light' = 'regular'): Promise<FluentUIServiceIcon | null> {
    const svgContent = await this.getIconSvg(iconName, size, variant);
    if (!svgContent) return null;

    return {
      name: iconName,
      content: svgContent,
      size: size,
      variant: variant
    };
  }

  // Convert FluentUI icon to a file-like object for the preview system
  async getIconAsFile(iconName: string, size: number = 24, variant: 'regular' | 'filled' | 'light' = 'regular'): Promise<{name: string, content: string, relativePath: string} | null> {
    const svgContent = await this.getIconSvg(iconName, size, variant);
    if (!svgContent) return null;

    return {
      name: `${iconName.toLowerCase().replace(/\s+/g, '-')}-${size}-${variant}.svg`,
      content: svgContent,
      relativePath: `fluent-icons/${iconName.toLowerCase().replace(/\s+/g, '-')}-${size}-${variant}.svg`
    };
  }

  // Get available sizes for Fluent icons
  getAvailableSizes(): number[] {
    return [16, 20, 24, 28, 32, 48];
  }

  // Get available variants
  getAvailableVariants(): ('regular' | 'filled' | 'light')[] {
    return ['regular', 'filled', 'light'];
  }
}

export const fluentUIService = new FluentUIService();