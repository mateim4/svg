// Unified Icon Service - Single interface to access all icon pack services
// Provides consistent API across all supported icon libraries

import { lucideService } from './lucideService';
import { heroiconsService } from './heroiconsService';
import { featherService } from './featherService';
import { phosphorService } from './phosphorService';
import { tablerService } from './tablerService';
import { fluentUIService } from './fluentUIService';

export type IconProvider = 'lucide' | 'heroicons' | 'feather' | 'phosphor' | 'tabler' | 'fluentui';

export interface UnifiedIcon {
  provider: IconProvider;
  name: string;
  displayName: string;
  categories: string[];
  tags: string[];
  variants?: string[];
  sizes?: number[];
}

export interface UnifiedIconResult {
  provider: IconProvider;
  name: string;
  content: string;
  size: number;
  variant?: string;
}

export interface ProviderInfo {
  id: IconProvider;
  name: string;
  description: string;
  totalIcons: number;
  variants: string[];
  defaultSizes: number[];
  strokeBased: boolean;
}

export class UnifiedIconService {
  private providers: Map<IconProvider, any> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    this.providers.set('lucide', lucideService);
    this.providers.set('heroicons', heroiconsService);
    this.providers.set('feather', featherService);
    this.providers.set('phosphor', phosphorService);
    this.providers.set('tabler', tablerService);
    this.providers.set('fluentui', fluentUIService);
  }

  // Get all available providers with their information
  getAvailableProviders(): ProviderInfo[] {
    return [
      {
        id: 'lucide',
        name: 'Lucide',
        description: 'Beautiful & consistent stroke-based icons',
        totalIcons: lucideService.getAvailableIcons().length,
        variants: ['regular'],
        defaultSizes: [16, 20, 24, 28, 32],
        strokeBased: true
      },
      {
        id: 'heroicons',
        name: 'Heroicons',
        description: 'Beautiful hand-crafted SVG icons by Tailwind team',
        totalIcons: heroiconsService.getAvailableIcons().length,
        variants: ['outline', 'solid', 'mini'],
        defaultSizes: [16, 20, 24],
        strokeBased: true
      },
      {
        id: 'feather',
        name: 'Feather',
        description: 'Simple, beautiful open-source icons',
        totalIcons: featherService.getAvailableIcons().length,
        variants: ['regular'],
        defaultSizes: [16, 20, 24, 32],
        strokeBased: true
      },
      {
        id: 'phosphor',
        name: 'Phosphor',
        description: 'Flexible icon family with multiple weights',
        totalIcons: phosphorService.getAvailableIcons().length,
        variants: ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'],
        defaultSizes: [16, 24, 32, 48],
        strokeBased: true
      },
      {
        id: 'tabler',
        name: 'Tabler',
        description: 'Over 4000+ pixel-perfect icons',
        totalIcons: tablerService.getAvailableIcons().length,
        variants: ['outline', 'filled'],
        defaultSizes: [16, 20, 24, 32],
        strokeBased: true
      },
      {
        id: 'fluentui',
        name: 'Fluent UI',
        description: 'Microsoft\'s design system icons',
        totalIcons: 2000, // Fallback value since fluentUIService.getAvailableIcons() is async
        variants: ['regular', 'filled', 'light'],
        defaultSizes: [16, 20, 24, 28, 32],
        strokeBased: false
      }
    ];
  }

  // Get all icons from a specific provider
  async getIconsByProvider(provider: IconProvider): Promise<UnifiedIcon[]> {
    const service = this.providers.get(provider);
    if (!service) {
      throw new Error(`Provider ${provider} not found`);
    }

    const icons = service.getAvailableIcons();
    return icons.map((icon: any) => ({
      provider,
      name: icon.name,
      displayName: icon.displayName || this.formatDisplayName(icon.name),
      categories: icon.categories || [],
      tags: icon.tags || [],
      variants: icon.variants || ['regular'],
      sizes: icon.sizes || [24]
    }));
  }

  // Search icons across all providers
  async searchAllProviders(query: string): Promise<UnifiedIcon[]> {
    const results: UnifiedIcon[] = [];
    
    const providerEntries = Array.from(this.providers.entries());
    
    for (const [provider, service] of providerEntries) {
      try {
        const icons = service.searchIcons ? 
          service.searchIcons(query) : 
          service.getAvailableIcons().filter((icon: any) => 
            icon.name.toLowerCase().includes(query.toLowerCase()) ||
            icon.displayName?.toLowerCase().includes(query.toLowerCase())
          );

        const unifiedIcons = icons.map((icon: any) => ({
          provider: provider as IconProvider,
          name: icon.name,
          displayName: icon.displayName || this.formatDisplayName(icon.name),
          categories: icon.categories || [],
          tags: icon.tags || [],
          variants: icon.variants || ['regular'],
          sizes: icon.sizes || [24]
        }));

        results.push(...unifiedIcons);
      } catch (error) {
        console.warn(`Error searching ${provider}:`, error);
      }
    }

    return results;
  }

  // Get SVG content for a specific icon
  async getIconSvg(
    provider: IconProvider, 
    iconName: string, 
    size: number = 24, 
    variant?: string
  ): Promise<UnifiedIconResult | null> {
    const service = this.providers.get(provider);
    if (!service) {
      throw new Error(`Provider ${provider} not found`);
    }

    try {
      let svgContent: string | null = null;

      // Call the appropriate method based on the service
      switch (provider) {
        case 'lucide':
          svgContent = await service.getIconSvg(iconName, size);
          break;
        case 'heroicons':
          svgContent = await service.getIconSvg(iconName, size, variant || 'outline');
          break;
        case 'feather':
          svgContent = await service.getIconSvg(iconName, size);
          break;
        case 'phosphor':
          const phosphorResult = await service.getIcon(iconName, variant || 'regular', size);
          svgContent = phosphorResult?.content || null;
          break;
        case 'tabler':
          svgContent = await service.getIconSvg(iconName, size, variant || 'outline');
          break;
        case 'fluentui':
          svgContent = await service.getIconSvg(iconName, size, variant || 'regular');
          break;
      }

      if (!svgContent) {
        return null;
      }

      return {
        provider,
        name: iconName,
        content: svgContent,
        size,
        variant
      };
    } catch (error) {
      console.error(`Error getting icon ${iconName} from ${provider}:`, error);
      return null;
    }
  }

  // Get icon as file object for processing
  async getIconAsFile(
    provider: IconProvider,
    iconName: string,
    size: number = 24,
    variant?: string
  ): Promise<{name: string, content: string, relativePath: string} | null> {
    const iconResult = await this.getIconSvg(provider, iconName, size, variant);
    if (!iconResult) {
      return null;
    }

    const fileName = variant ? 
      `${iconName}-${variant}-${size}.svg` : 
      `${iconName}-${size}.svg`;

    const relativePath = variant ?
      `${provider}/${variant}/${iconName}-${size}.svg` :
      `${provider}/${iconName}-${size}.svg`;

    return {
      name: fileName,
      content: iconResult.content,
      relativePath
    };
  }

  // Get popular icons from all providers
  async getPopularIcons(): Promise<UnifiedIcon[]> {
    const popularIcons: UnifiedIcon[] = [];

    const providerEntries = Array.from(this.providers.entries());

    for (const [provider, service] of providerEntries) {
      try {
        const icons = service.getPopularIcons ? 
          service.getPopularIcons() : 
          service.getAvailableIcons().slice(0, 10);

        const unifiedIcons = icons.map((icon: any) => ({
          provider: provider as IconProvider,
          name: icon.name,
          displayName: icon.displayName || this.formatDisplayName(icon.name),
          categories: icon.categories || [],
          tags: icon.tags || [],
          variants: icon.variants || ['regular'],
          sizes: icon.sizes || [24]
        }));

        popularIcons.push(...unifiedIcons.slice(0, 5)); // Top 5 from each
      } catch (error) {
        console.warn(`Error getting popular icons from ${provider}:`, error);
      }
    }

    return popularIcons;
  }

  // Get recommended icons for specific categories
  async getIconsByCategory(category: string): Promise<UnifiedIcon[]> {
    const categoryIcons: UnifiedIcon[] = [];

    const providerEntries = Array.from(this.providers.entries());

    for (const [provider, service] of providerEntries) {
      try {
        const icons = service.getAvailableIcons().filter((icon: any) => 
          icon.categories?.some((cat: string) => 
            cat.toLowerCase().includes(category.toLowerCase())
          ) || 
          icon.tags?.some((tag: string) => 
            tag.toLowerCase().includes(category.toLowerCase())
          )
        );

        const unifiedIcons = icons.map((icon: any) => ({
          provider: provider as IconProvider,
          name: icon.name,
          displayName: icon.displayName || this.formatDisplayName(icon.name),
          categories: icon.categories || [],
          tags: icon.tags || [],
          variants: icon.variants || ['regular'],
          sizes: icon.sizes || [24]
        }));

        categoryIcons.push(...unifiedIcons);
      } catch (error) {
        console.warn(`Error getting ${category} icons from ${provider}:`, error);
      }
    }

    return categoryIcons;
  }

  // Batch process multiple icons
  async batchGetIcons(
    requests: Array<{
      provider: IconProvider;
      iconName: string;
      size?: number;
      variant?: string;
    }>
  ): Promise<UnifiedIconResult[]> {
    const results: UnifiedIconResult[] = [];

    for (const request of requests) {
      try {
        const result = await this.getIconSvg(
          request.provider,
          request.iconName,
          request.size || 24,
          request.variant
        );
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.warn(`Failed to get icon ${request.iconName} from ${request.provider}:`, error);
      }
    }

    return results;
  }

  // Utility methods
  private formatDisplayName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Get provider-specific information
  getProviderInfo(provider: IconProvider): ProviderInfo | null {
    return this.getAvailableProviders().find(p => p.id === provider) || null;
  }

  // Check if provider supports specific variant
  supportsVariant(provider: IconProvider, variant: string): boolean {
    const info = this.getProviderInfo(provider);
    return info?.variants.includes(variant) || false;
  }
}

// Export singleton instance
export const unifiedIconService = new UnifiedIconService();