export interface TablerIcon {
  name: string;
  displayName: string;
  categories: string[];
  tags: string[];
  variants: TablerVariant[];
  sizes: number[];
  svgContent?: string;
}

export interface TablerServiceIcon {
  name: string;
  content: string;
  size: number;
  variant: TablerVariant;
  strokeWidth: number;
}

export type TablerVariant = 'outline' | 'filled';

interface TablerIconData {
  name: string;
  svgPaths: Record<TablerVariant, string>;
  category: string;
}

const tablerIconsData: TablerIconData[] = [
  // Navigation & General
  {
    name: 'home',
    svgPaths: {
      outline: '<path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />',
      filled: '<path d="M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-4v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v8h-4a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0z" />'
    },
    category: 'general'
  },
  {
    name: 'heart',
    svgPaths: {
      outline: '<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />',
      filled: '<path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" />'
    },
    category: 'social'
  },
  {
    name: 'star',
    svgPaths: {
      outline: '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />',
      filled: '<path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />'
    },
    category: 'social'
  },
  {
    name: 'search',
    svgPaths: {
      outline: '<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" />',
      filled: '<path d="M14.618 9.382a3 3 0 0 1 -4.944 3.618c-.25 -.25 -.618 -.618 -.618 -.618l-2.518 -2.518a3 3 0 0 1 4.944 -3.618l2.518 2.518s.368 .368 .618 .618z" /><path d="M16.32 14.9a7 7 0 1 1 1.41 -1.41l2.3 2.3a1 1 0 0 1 -1.42 1.42l-2.29 -2.31z" />'
    },
    category: 'general'
  },
  {
    name: 'settings',
    svgPaths: {
      outline: '<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />',
      filled: '<path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 7.919a3 3 0 1 1 0 -6a3 3 0 0 1 0 6z" />'
    },
    category: 'tools'
  },
  {
    name: 'user',
    svgPaths: {
      outline: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />',
      filled: '<path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" /><path d="M14 14a4 4 0 0 1 4 4v1a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-1a4 4 0 0 1 4 -4h4z" />'
    },
    category: 'user'
  },
  {
    name: 'mail',
    svgPaths: {
      outline: '<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" /><path d="M3 7l9 6l9 -6" />',
      filled: '<path d="M22 7.535v9.465a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-9.465l9.445 6.297l.116 .066a1 1 0 0 0 .878 0l.116 -.066l9.445 -6.297z" /><path d="M19 4c1.08 0 2.027 .57 2.555 1.427l-9.555 6.37l-9.555 -6.37a2.999 2.999 0 0 1 2.354 -1.42l.201 -.007h14z" />'
    },
    category: 'communication'
  },
  {
    name: 'file',
    svgPaths: {
      outline: '<path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />',
      filled: '<path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005h5z" /><path d="M19 7h-4l-.001 -4.001z" />'
    },
    category: 'files'
  },
  {
    name: 'folder',
    svgPaths: {
      outline: '<path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />',
      filled: '<path d="M9 3a1 1 0 0 1 .608 .206l.1 .087l2.706 2.707h6.586a3 3 0 0 1 2.995 2.824l.005 .176v8a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-11a3 3 0 0 1 2.824 -2.995l.176 -.005h4z" />'
    },
    category: 'files'
  },
  {
    name: 'calendar',
    svgPaths: {
      outline: '<path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" />',
      filled: '<path d="M16 2a1 1 0 0 1 .993 .883l.007 .117v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 1.993 -.117l.007 .117v1h6v-1a1 1 0 0 1 1 -1zm3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16v-9.625z" /><path d="M12 12h4v4h-4z" />'
    },
    category: 'time'
  },
  {
    name: 'download',
    svgPaths: {
      outline: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" />',
      filled: '<path d="M4 14a1 1 0 0 1 .993 .883l.007 .117v2a1 1 0 0 0 .883 .993l.117 .007h12a1 1 0 0 0 .993 -.883l.007 -.117v-2a1 1 0 0 1 2 0v2a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-2a1 1 0 0 1 1 -1z" /><path d="M12 2a1 1 0 0 1 .993 .883l.007 .117v9.585l3.293 -3.292a1 1 0 0 1 1.497 1.32l-.083 .094l-5 5a1 1 0 0 1 -.112 .097l-.11 .071l-.114 .054l-.105 .035l-.149 .030l-.117 .006l-.075 -.003l-.126 -.017l-.111 -.03l-.111 -.044l-.098 -.052l-.096 -.067l-.09 -.08l-5 -5a1 1 0 0 1 1.32 -1.497l.094 .083l3.293 3.292v-9.585a1 1 0 0 1 1 -1z" />'
    },
    category: 'files'
  },
  {
    name: 'plus',
    svgPaths: {
      outline: '<path d="M12 5l0 14" /><path d="M5 12l14 0" />',
      filled: '<path d="M12 2a1 1 0 0 1 .993 .883l.007 .117v5h5a1 1 0 0 1 .117 1.993l-.117 .007h-5v5a1 1 0 0 1 -1.993 .117l-.007 -.117v-5h-5a1 1 0 0 1 -.117 -1.993l.117 -.007h5v-5a1 1 0 0 1 1 -1z" />'
    },
    category: 'tools'
  },
  {
    name: 'x',
    svgPaths: {
      outline: '<path d="M18 6l-12 12" /><path d="M6 6l12 12" />',
      filled: '<path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-6.489 5.8a1 1 0 0 0 -1.218 1.567l1.292 1.293l-1.292 1.293l-.083 .094a1 1 0 0 0 1.497 1.32l1.293 -1.292l1.293 1.292l.094 .083a1 1 0 0 0 1.32 -1.497l-1.292 -1.293l1.292 -1.293l.083 -.094a1 1 0 0 0 -1.497 -1.32l-1.293 1.292l-1.293 -1.292l-.094 -.083z" />'
    },
    category: 'general'
  }
];

export class TablerIconService {
  name = 'Tabler Icons';
  id = 'tabler';
  description = 'Over 5800 free MIT-licensed high-quality SVG icons designed on 24x24 grid';
  
  private iconMap = new Map<string, TablerIconData>();
  private iconList: TablerIcon[] = [];
  private iconCache: Map<string, string> = new Map();
  private availableVariants: TablerVariant[] = ['outline', 'filled'];

  constructor() {
    tablerIconsData.forEach(icon => {
      this.iconMap.set(icon.name, icon);
    });
    this.initializeIconList();
  }

  private initializeIconList(): void {
    this.iconList = tablerIconsData.map(icon => ({
      name: icon.name,
      displayName: this.formatDisplayName(icon.name),
      categories: [icon.category],
      tags: this.generateTags(icon.name),
      variants: this.availableVariants,
      sizes: [16, 20, 24, 28, 32, 48] // Standard Tabler icon sizes
    }));
  }

  getAvailableIcons(): TablerIcon[] {
    return this.iconList;
  }

  getAvailableVariants(): TablerVariant[] {
    return [...this.availableVariants];
  }

  // Get a specific icon's SVG content following Tabler Icons specifications  
  async getIconSvg(iconName: string, size: number = 24, variant: TablerVariant = 'outline', strokeWidth: number = 2, color: string = 'currentColor'): Promise<string | null> {
    try {
      const cacheKey = `${iconName}_${size}_${variant}_${strokeWidth}_${color}`;

      // Check cache first
      if (this.iconCache.has(cacheKey)) {
        return this.iconCache.get(cacheKey)!;
      }

      const iconData = this.iconMap.get(iconName);
      if (!iconData) {
        console.warn(`Tabler icon "${iconName}" not found`);
        return this.getFallbackIcon(size, variant, strokeWidth, color);
      }

      const pathData = iconData.svgPaths[variant];
      if (!pathData) {
        console.warn(`Variant "${variant}" not found for Tabler icon "${iconName}"`);
        return this.getFallbackIcon(size, variant, strokeWidth, color);
      }

      // Generate Tabler-compliant SVG following official specifications
      const svg = variant === 'filled'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" class="icon icon-tabler icons-tabler-filled icon-tabler-${iconName}">${pathData}</svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-${iconName}">${pathData}</svg>`;
      
      this.iconCache.set(cacheKey, svg);
      return svg;
    } catch (error) {
      console.error(`Error getting Tabler icon ${iconName}:`, error);
      return this.getFallbackIcon(size, variant, strokeWidth, color);
    }
  }

  private formatDisplayName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private generateTags(name: string): string[] {
    const baseTags = [name];
    
    // Add common synonyms and related terms
    const tagMap: Record<string, string[]> = {
      'home': ['house', 'building', 'main', 'start'],
      'heart': ['love', 'like', 'favorite'],
      'star': ['favorite', 'rating', 'bookmark'],
      'search': ['find', 'lookup', 'magnify'],
      'settings': ['config', 'preferences', 'gear', 'cog'],
      'user': ['person', 'profile', 'account'],
      'mail': ['email', 'message', 'envelope'],
      'file': ['document', 'text', 'paper'],
      'folder': ['directory', 'collection'],
      'calendar': ['date', 'schedule', 'time'],
      'download': ['save', 'get', 'arrow-down'],
      'plus': ['add', 'create', 'new'],
      'x': ['close', 'cancel', 'delete']
    };

    if (tagMap[name]) {
      baseTags.push(...tagMap[name]);
    }

    // Add variant-related tags
    baseTags.push(...this.availableVariants);
    baseTags.push('outline', 'stroke', 'line', 'rounded');

    return baseTags;
  }

  // Get fallback icon when requested icon is not found
  private getFallbackIcon(size: number, variant: TablerVariant, strokeWidth: number, color: string): string {
    const questionPath = variant === 'filled'
      ? '<path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm0 13a1 1 0 0 0 -.993 .883l-.007 .117l.007 .127a1 1 0 0 0 1.986 0l.007 -.117l-.007 -.127a1 1 0 0 0 -.993 -.883zm1.368 -6.673a2.98 2.98 0 0 0 -3.631 .728a1 1 0 0 0 1.44 1.383l.171 -.18a.98 .98 0 0 1 1.11 -.15a1 1 0 0 1 -.34 1.886l-.232 .012A1 1 0 0 0 11.997 14a3 3 0 0 0 1.371 -2.673z" />'
      : '<path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z" /><path d="M12 17v.01" /><path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />';

    return variant === 'filled'
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" class="icon icon-tabler icons-tabler-filled icon-tabler-help">${questionPath}</svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-help">${questionPath}</svg>`;
  }

  // Search icons by name and tags
  searchIcons(query: string): TablerIcon[] {
    if (!query) return this.getAvailableIcons();
    
    const lowercaseQuery = query.toLowerCase();
    return this.getAvailableIcons().filter(icon =>
      icon.name.toLowerCase().includes(lowercaseQuery) ||
      icon.displayName.toLowerCase().includes(lowercaseQuery) ||
      icon.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      icon.categories.some(category => category.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get icon metadata
  getIconInfo(iconName: string): TablerIcon | null {
    return this.getAvailableIcons().find(icon => icon.name === iconName) || null;
  }

  // Get popular/commonly used icons
  getPopularIcons(): TablerIcon[] {
    return this.getAvailableIcons().slice(0, 20);
  }

  // Get available stroke widths for Tabler icons
  getAvailableStrokeWidths(): number[] {
    return [1, 1.25, 1.5, 2, 2.5, 3];
  }

  // Get available sizes
  getAvailableSizes(): number[] {
    return [16, 20, 24, 28, 32, 48];
  }

  // Get Tabler styled icon with proper processing
  async getTablerStyledIcon(iconName: string, size: number = 24, variant: TablerVariant = 'outline', strokeWidth: number = 2, color: string = 'currentColor'): Promise<string | null> {
    return this.getIconSvg(iconName, size, variant, strokeWidth, color);
  }

  // Get all variants of a specific icon
  async getIconVariants(iconName: string, size: number = 24, strokeWidth: number = 2): Promise<{outline?: string, filled?: string}> {
    const variants: {outline?: string, filled?: string} = {};
    const iconInfo = this.getIconInfo(iconName);
    
    if (iconInfo) {
      for (const variant of iconInfo.variants) {
        const svg = await this.getIconSvg(iconName, size, variant, strokeWidth);
        if (svg) {
          variants[variant] = svg;
        }
      }
    }
    
    return variants;
  }

  // Get a properly formatted Tabler icon for the preview system
  async getIconForPreview(iconName: string, size: number = 24, variant: TablerVariant = 'outline', strokeWidth: number = 2): Promise<TablerServiceIcon | null> {
    const svgContent = await this.getIconSvg(iconName, size, variant, strokeWidth);
    if (!svgContent) return null;

    return {
      name: iconName,
      content: svgContent,
      size: size,
      variant: variant,
      strokeWidth: strokeWidth
    };
  }

  // Convert Tabler icon to a file-like object for the preview system
  async getIconAsFile(iconName: string, size: number = 24, variant: TablerVariant = 'outline', strokeWidth: number = 2): Promise<{name: string, content: string, relativePath: string} | null> {
    const svgContent = await this.getIconSvg(iconName, size, variant, strokeWidth);
    if (!svgContent) return null;

    return {
      name: `${iconName}-${variant}-${size}-stroke${strokeWidth}.svg`,
      content: svgContent,
      relativePath: `tabler/${variant}/${size}/${iconName}.svg`
    };
  }

  // Batch generate multiple Tabler icons
  async batchGenerateIcons(iconNames: string[], size: number = 24, variant: TablerVariant = 'outline', strokeWidth: number = 2): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    const promises = iconNames.map(async (iconName) => {
      const svg = await this.getIconSvg(iconName, size, variant, strokeWidth);
      if (svg) {
        results.set(iconName, svg);
      }
    });
    
    await Promise.all(promises);
    return results;
  }
}

// Export singleton instance
export const tablerService = new TablerIconService();