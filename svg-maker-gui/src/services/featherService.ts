export interface FeatherIcon {
  name: string;
  displayName: string;
  categories: string[];
  tags: string[];
  sizes: number[];
  svgContent?: string;
}

export interface FeatherServiceIcon {
  name: string;
  content: string;
  size: number;
  strokeWidth: number;
}

interface FeatherIconData {
  name: string;
  svgPath: string;
  category: string;
}

const featherIconsData: FeatherIconData[] = [
  // General & Navigation
  {
    name: 'home',
    svgPath: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    category: 'general'
  },
  {
    name: 'menu',
    svgPath: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    category: 'general'
  },
  {
    name: 'x',
    svgPath: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    category: 'general'
  },
  {
    name: 'search',
    svgPath: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
    category: 'general'
  },
  {
    name: 'settings',
    svgPath: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    category: 'general'
  },
  {
    name: 'arrow-right',
    svgPath: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    category: 'arrows'
  },
  {
    name: 'arrow-left',
    svgPath: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    category: 'arrows'
  },
  {
    name: 'arrow-up',
    svgPath: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
    category: 'arrows'
  },
  {
    name: 'arrow-down',
    svgPath: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
    category: 'arrows'
  },
  {
    name: 'chevron-right',
    svgPath: '<polyline points="9 18 15 12 9 6"/>',
    category: 'arrows'
  },
  {
    name: 'chevron-left',
    svgPath: '<polyline points="15 18 9 12 15 6"/>',
    category: 'arrows'
  },
  {
    name: 'chevron-up',
    svgPath: '<polyline points="18 15 12 9 6 15"/>',
    category: 'arrows'
  },
  {
    name: 'chevron-down',
    svgPath: '<polyline points="6 9 12 15 18 9"/>',
    category: 'arrows'
  },

  // Social & Communication
  {
    name: 'heart',
    svgPath: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    category: 'social'
  },
  {
    name: 'star',
    svgPath: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    category: 'social'
  },
  {
    name: 'thumbs-up',
    svgPath: '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
    category: 'social'
  },
  {
    name: 'thumbs-down',
    svgPath: '<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H6.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>',
    category: 'social'
  },
  {
    name: 'mail',
    svgPath: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/>',
    category: 'social'
  },
  {
    name: 'message-circle',
    svgPath: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    category: 'social'
  },

  // File & Storage
  {
    name: 'file',
    svgPath: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>',
    category: 'files'
  },
  {
    name: 'folder',
    svgPath: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    category: 'files'
  },
  {
    name: 'download',
    svgPath: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    category: 'files'
  },
  {
    name: 'upload',
    svgPath: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    category: 'files'
  },
  {
    name: 'save',
    svgPath: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    category: 'files'
  },

  // Media & UI
  {
    name: 'play',
    svgPath: '<polygon points="5 3 19 12 5 21 5 3"/>',
    category: 'media'
  },
  {
    name: 'pause',
    svgPath: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
    category: 'media'
  },
  {
    name: 'stop',
    svgPath: '<rect x="6" y="6" width="12" height="12"/>',
    category: 'media'
  },
  {
    name: 'volume-2',
    svgPath: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    category: 'media'
  },
  {
    name: 'image',
    svgPath: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    category: 'media'
  },

  // Tools & Actions
  {
    name: 'edit',
    svgPath: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    category: 'tools'
  },
  {
    name: 'trash',
    svgPath: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    category: 'tools'
  },
  {
    name: 'plus',
    svgPath: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    category: 'tools'
  },
  {
    name: 'minus',
    svgPath: '<line x1="5" y1="12" x2="19" y2="12"/>',
    category: 'tools'
  },
  {
    name: 'check',
    svgPath: '<polyline points="20 6 9 17 4 12"/>',
    category: 'tools'
  },
  {
    name: 'copy',
    svgPath: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    category: 'tools'
  },

  // User & Profile
  {
    name: 'user',
    svgPath: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    category: 'user'
  },
  {
    name: 'users',
    svgPath: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    category: 'user'
  },
  {
    name: 'lock',
    svgPath: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    category: 'user'
  },
  {
    name: 'unlock',
    svgPath: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    category: 'user'
  },

  // Business & Finance
  {
    name: 'shopping-cart',
    svgPath: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    category: 'business'
  },
  {
    name: 'credit-card',
    svgPath: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    category: 'business'
  },
  {
    name: 'dollar-sign',
    svgPath: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    category: 'business'
  },

  // Technology
  {
    name: 'smartphone',
    svgPath: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    category: 'technology'
  },
  {
    name: 'wifi',
    svgPath: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
    category: 'technology'
  },
  {
    name: 'monitor',
    svgPath: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    category: 'technology'
  }
];

export class FeatherIconService {
  name = 'Feather Icons';
  id = 'feather';
  description = 'Beautiful open-source icons designed with simplicity and consistency';
  
  private iconMap = new Map<string, FeatherIconData>();
  private iconList: FeatherIcon[] = [];
  private iconCache: Map<string, string> = new Map();

  constructor() {
    featherIconsData.forEach(icon => {
      this.iconMap.set(icon.name, icon);
    });
    this.initializeIconList();
  }

  private initializeIconList(): void {
    this.iconList = featherIconsData.map(icon => ({
      name: icon.name,
      displayName: this.formatDisplayName(icon.name),
      categories: [icon.category],
      tags: this.generateTags(icon.name),
      sizes: [16, 20, 24, 28, 32, 48] // Standard Feather icon sizes
    }));
  }

  getAvailableIcons(): FeatherIcon[] {
    return this.iconList;
  }

  // Get a specific icon's SVG content following Feather Icons specifications  
  async getIconSvg(iconName: string, size: number = 24, strokeWidth: number = 2, color: string = 'currentColor'): Promise<string | null> {
    try {
      const cacheKey = `${iconName}_${size}_${strokeWidth}_${color}`;

      // Check cache first
      if (this.iconCache.has(cacheKey)) {
        return this.iconCache.get(cacheKey)!;
      }

      // Fetch real SVG from Feather Icons GitHub repository
      const iconUrl = `https://raw.githubusercontent.com/feathericons/feather/master/icons/${iconName}.svg`;
      console.log(`Fetching REAL Feather icon: ${iconName} from ${iconUrl}`);
      
      const response = await fetch(iconUrl);
      if (!response.ok) {
        console.warn(`Failed to fetch Feather ${iconName}: HTTP ${response.status}`);
        // Try fallback with hardcoded paths for common icons
        const iconData = this.iconMap.get(iconName);
        if (iconData) {
          const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="feather feather-${iconName}">${iconData.svgPath}</svg>`;
          this.iconCache.set(cacheKey, fallbackSvg);
          return fallbackSvg;
        }
        return this.getFallbackIcon(size, strokeWidth, color);
      }

      let svgContent = await response.text();
      
      // Validate SVG content
      if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
        throw new Error(`Invalid SVG content received for Feather icon: ${iconName}`);
      }

      console.log(`✅ Successfully fetched Feather icon: ${iconName}`);

      // Customize SVG with user parameters
      if (size !== 24) {
        svgContent = svgContent.replace(/width="[^"]*"/, `width="${size}"`);
        svgContent = svgContent.replace(/height="[^"]*"/, `height="${size}"`);
      }

      if (strokeWidth !== 2) {
        svgContent = svgContent.replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`);
      }

      if (color !== 'currentColor') {
        svgContent = svgContent.replace(/stroke="[^"]*"/, `stroke="${color}"`);
      }
      
      this.iconCache.set(cacheKey, svgContent);
      return svgContent;
    } catch (error) {
      console.error(`Error getting Feather icon ${iconName}:`, error);
      return this.getFallbackIcon(size, strokeWidth, color);
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
      'home': ['house', 'main', 'start'],
      'user': ['person', 'profile', 'account'],
      'heart': ['love', 'like', 'favorite'],
      'star': ['favorite', 'rating', 'bookmark'],
      'search': ['find', 'lookup', 'query'],
      'settings': ['config', 'preferences', 'options'],
      'mail': ['email', 'message', 'send'],
      'edit': ['modify', 'change', 'pencil'],
      'trash': ['delete', 'remove', 'bin'],
      'download': ['save', 'export', 'get'],
      'upload': ['import', 'send', 'put'],
      'play': ['start', 'begin', 'run'],
      'pause': ['stop', 'halt', 'break'],
      'volume-2': ['sound', 'audio', 'speaker'],
      'wifi': ['internet', 'network', 'connection'],
      'smartphone': ['phone', 'mobile', 'cell'],
      'shopping-cart': ['cart', 'buy', 'purchase']
    };

    if (tagMap[name]) {
      baseTags.push(...tagMap[name]);
    }

    return baseTags;
  }

  // Get fallback icon when requested icon is not found
  private getFallbackIcon(size: number, strokeWidth: number, color: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="feather feather-help-circle">
  <circle cx="12" cy="12" r="10"/>
  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
  <line x1="12" y1="17" x2="12.01" y2="17"/>
</svg>`;
  }

  // Search icons by name and tags
  searchIcons(query: string): FeatherIcon[] {
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
  getIconInfo(iconName: string): FeatherIcon | null {
    return this.getAvailableIcons().find(icon => icon.name === iconName) || null;
  }

  // Get popular/commonly used icons
  getPopularIcons(): FeatherIcon[] {
    return this.getAvailableIcons().slice(0, 20);
  }

  // Get available stroke widths for Feather icons
  getAvailableStrokeWidths(): number[] {
    return [1, 1.5, 2, 2.5, 3];
  }

  // Get available sizes
  getAvailableSizes(): number[] {
    return [16, 20, 24, 28, 32, 48];
  }

  // Get available variants (Feather Icons only have one variant) (FluentUI pattern)
  getAvailableVariants(): string[] {
    return ['outline'];
  }

  // Get Feather styled icon with proper processing
  async getFeatherStyledIcon(iconName: string, size: number = 24, strokeWidth: number = 2, color: string = 'currentColor'): Promise<string | null> {
    return this.getIconSvg(iconName, size, strokeWidth, color);
  }

  // Get a properly formatted Feather icon for the preview system
  async getIconForPreview(iconName: string, size: number = 24, strokeWidth: number = 2): Promise<FeatherServiceIcon | null> {
    const svgContent = await this.getIconSvg(iconName, size, strokeWidth);
    if (!svgContent) return null;

    return {
      name: iconName,
      content: svgContent,
      size: size,
      strokeWidth: strokeWidth
    };
  }

  // Convert Feather icon to a file-like object for the preview system
  async getIconAsFile(iconName: string, size: number = 24, strokeWidth: number = 2): Promise<{name: string, content: string, relativePath: string} | null> {
    const svgContent = await this.getIconSvg(iconName, size, strokeWidth);
    if (!svgContent) return null;

    return {
      name: `${iconName}-${size}-stroke${strokeWidth}.svg`,
      content: svgContent,
      relativePath: `feather/${size}/${iconName}.svg`
    };
  }

  // Batch generate multiple Feather icons
  async batchGenerateIcons(iconNames: string[], size: number = 24, strokeWidth: number = 2): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    const promises = iconNames.map(async (iconName) => {
      const svg = await this.getIconSvg(iconName, size, strokeWidth);
      if (svg) {
        results.set(iconName, svg);
      }
    });
    
    await Promise.all(promises);
    return results;
  }
}

// Export singleton instance
export const featherService = new FeatherIconService();