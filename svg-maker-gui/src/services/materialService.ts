// Material Symbols Service - Basic Implementation
// Fetches icons from Google Material Symbols

export interface MaterialIcon {
  name: string;
  displayName: string;
  categories: string[];
  tags: string[];
  variants: MaterialVariant[];
  sizes: number[];
}

export interface MaterialServiceIcon {
  name: string;
  content: string;
  size: number;
  variant: MaterialVariant;
}

export type MaterialVariant = 'outlined' | 'rounded' | 'sharp';

// Common Material Symbols icon names
const MATERIAL_ICON_NAMES = [
  'home', 'person', 'settings', 'search', 'favorite', 'star', 'menu', 'close',
  'add', 'remove', 'edit', 'delete', 'check', 'arrow_back', 'arrow_forward',
  'arrow_upward', 'arrow_downward', 'refresh', 'more_vert', 'more_horiz',
  'notification', 'mail', 'phone', 'location_on', 'calendar_today', 'schedule',
  'info', 'warning', 'error', 'help', 'visibility', 'visibility_off',
  'lock', 'lock_open', 'account_circle', 'bookmark', 'share', 'download',
  'upload', 'photo', 'video_call', 'music_note', 'folder', 'file_download',
  'print', 'save', 'copy', 'cut', 'paste', 'undo', 'redo', 'zoom_in', 'zoom_out'
];

class MaterialService {
  private readonly BASE_URL = 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbols';
  private iconCache = new Map<string, string>();

  getAvailableIcons(): MaterialIcon[] {
    return MATERIAL_ICON_NAMES.map(name => ({
      name,
      displayName: this.formatDisplayName(name),
      categories: ['Material Design'],
      tags: ['material', 'google', 'symbols'],
      variants: ['outlined', 'rounded', 'sharp'],
      sizes: [20, 24, 40, 48]
    }));
  }

  private formatDisplayName(name: string): string {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  async getIconSvg(
    iconName: string,
    size: number = 24,
    variant: MaterialVariant = 'outlined',
    color: string = 'currentColor'
  ): Promise<string | null> {
    if (!MATERIAL_ICON_NAMES.includes(iconName)) {
      console.warn(`Material icon '${iconName}' not found in collection`);
      return null;
    }

    const cacheKey = `${iconName}_${variant}_${size}_${color}`;
    
    if (this.iconCache.has(cacheKey)) {
      return this.iconCache.get(cacheKey)!;
    }

    try {
      // Create a simple SVG icon with Material Design styling
      // Note: This is a fallback implementation since the actual Material Symbols
      // are distributed as fonts, not individual SVGs
      const svgContent = this.generateFallbackIcon(iconName, size, color);
      
      this.iconCache.set(cacheKey, svgContent);
      return svgContent;
      
    } catch (error) {
      console.error(`Failed to fetch Material icon '${iconName}':`, error);
      return this.getFallbackIcon(size, color);
    }
  }

  private generateFallbackIcon(name: string, size: number, color: string): string {
    // Generate a simple placeholder SVG for Material icons
    // This is a basic implementation - in production you'd fetch actual Material Symbols
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
  <circle cx="12" cy="12" r="10" fill="none" stroke="${color}" stroke-width="2"/>
  <text x="12" y="16" text-anchor="middle" font-size="8" fill="${color}">${name.charAt(0).toUpperCase()}</text>
</svg>`;
  }

  private getFallbackIcon(size: number, color: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
  <circle cx="12" cy="12" r="10"/>
  <path d="M8 8l8 8M16 8l-8 8"/>
</svg>`;
  }

  // Additional methods to match the pattern of other services
  async getIcon(iconName: string, variant: MaterialVariant = 'outlined', size: number = 24): Promise<MaterialServiceIcon | null> {
    const content = await this.getIconSvg(iconName, size, variant);
    if (!content) return null;
    
    return {
      name: iconName,
      content,
      size,
      variant
    };
  }

  searchIcons(query: string): MaterialIcon[] {
    if (!query) return this.getAvailableIcons();
    
    return this.getAvailableIcons().filter(icon =>
      icon.name.includes(query.toLowerCase()) ||
      icon.displayName.toLowerCase().includes(query.toLowerCase())
    );
  }

  getIconInfo(iconName: string): MaterialIcon | null {
    return this.getAvailableIcons().find(icon => icon.name === iconName) || null;
  }

  getFeaturedIcons(): MaterialIcon[] {
    return this.getAvailableIcons().slice(0, 20);
  }

  getAvailableVariants(): MaterialVariant[] {
    return ['outlined', 'rounded', 'sharp'];
  }

  async getIconAsFile(iconName: string, variant: MaterialVariant = 'outlined', size: number = 24): Promise<{name: string, content: string, relativePath: string} | null> {
    const svgContent = await this.getIconSvg(iconName, size, variant);
    if (!svgContent) return null;

    return {
      name: `${iconName.replace(/_/g, '-')}-${variant}-${size}.svg`,
      content: svgContent,
      relativePath: `material-symbols/${iconName.replace(/_/g, '-')}-${variant}-${size}.svg`
    };
  }
}

export const materialService = new MaterialService();