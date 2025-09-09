// Bootstrap Icons Service
// Official open source SVG icon library for Bootstrap with 2,000+ icons

export interface BootstrapIcon {
  name: string;
  displayName: string;
  categories: string[];
  tags: string[];
  sizes: number[];
}

export interface BootstrapServiceIcon {
  name: string;
  content: string;
  size: number;
}

class BootstrapIconService {
  private icons: BootstrapIcon[] = [];
  private iconCache: Map<string, string> = new Map();
  private readonly CDN_BASE = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/icons';

  constructor() {
    this.initializeIcons();
  }

  private initializeIcons(): void {
    // Common Bootstrap icons - we'll expand this with the full list
    const iconNames = [
      'alarm', 'archive', 'arrow-down', 'arrow-left', 'arrow-right', 'arrow-up',
      'bag', 'bank', 'bar-chart', 'basket', 'bell', 'book', 'bookmark', 'box',
      'briefcase', 'browser', 'brush', 'bucket', 'bug', 'building',
      'calculator', 'calendar', 'camera', 'cart', 'cash', 'chat', 'check', 'clock',
      'cloud', 'code', 'coin', 'collection', 'command', 'compass', 'cpu', 'credit-card',
      'database', 'device', 'diagram', 'dice', 'disc', 'display', 'download', 'droplet',
      'envelope', 'eye', 'file', 'filter', 'flag', 'folder', 'gear', 'gift',
      'globe', 'graph', 'grid', 'hammer', 'hand', 'hash', 'headphones', 'heart',
      'house', 'image', 'inbox', 'info', 'journal', 'key', 'laptop', 'layers',
      'lightbulb', 'link', 'list', 'lock', 'map', 'megaphone', 'mic', 'moon',
      'mouse', 'music', 'newspaper', 'palette', 'paperclip', 'patch', 'pause', 'pen',
      'pencil', 'people', 'person', 'phone', 'pie-chart', 'pin', 'play', 'plug',
      'plus', 'power', 'printer', 'puzzle', 'question', 'receipt', 'record', 'reply',
      'rocket', 'rss', 'rulers', 'save', 'scissors', 'search', 'send', 'server',
      'share', 'shield', 'shop', 'shuffle', 'signal', 'slash', 'sliders', 'speedometer',
      'star', 'stop', 'sun', 'tag', 'telephone', 'terminal', 'thermometer', 'tools',
      'trash', 'tree', 'trophy', 'truck', 'tv', 'umbrella', 'upload', 'wallet',
      'watch', 'wifi', 'window', 'wrench', 'x', 'zoom-in', 'zoom-out'
    ];

    this.icons = iconNames.map(name => ({
      name,
      displayName: name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      categories: this.getCategoriesForIcon(name),
      tags: this.getTagsForIcon(name),
      sizes: [16, 20, 24, 28, 32, 48, 64] // Standard Bootstrap icon sizes
    }));
  }

  private getCategoriesForIcon(name: string): string[] {
    const categoryMap: Record<string, string[]> = {
      'devices': ['laptop', 'phone', 'tablet', 'tv', 'display', 'mouse', 'keyboard', 'cpu', 'device'],
      'commerce': ['cart', 'bag', 'basket', 'cash', 'coin', 'credit-card', 'shop', 'receipt', 'wallet'],
      'communication': ['chat', 'envelope', 'inbox', 'send', 'reply', 'telephone', 'mic'],
      'media': ['camera', 'image', 'music', 'play', 'pause', 'stop', 'record', 'headphones'],
      'files': ['file', 'folder', 'archive', 'download', 'upload', 'save', 'paperclip'],
      'charts': ['bar-chart', 'pie-chart', 'graph', 'diagram'],
      'ui': ['check', 'x', 'plus', 'info', 'question', 'slash', 'search', 'filter', 'list', 'grid'],
      'arrows': ['arrow-down', 'arrow-left', 'arrow-right', 'arrow-up'],
      'time': ['clock', 'calendar', 'alarm', 'watch'],
      'tools': ['gear', 'wrench', 'hammer', 'brush', 'pen', 'pencil', 'scissors', 'rulers', 'tools']
    };

    const categories: string[] = ['general'];
    for (const [category, iconList] of Object.entries(categoryMap)) {
      if (iconList.includes(name)) {
        categories.push(category);
      }
    }
    return categories;
  }

  private getTagsForIcon(name: string): string[] {
    const tags = name.split('-');
    // Add common synonyms
    const synonymMap: Record<string, string[]> = {
      'gear': ['settings', 'config', 'configuration'],
      'envelope': ['mail', 'email', 'message'],
      'trash': ['delete', 'remove', 'bin'],
      'person': ['user', 'profile', 'account'],
      'people': ['users', 'group', 'team'],
      'house': ['home', 'dashboard'],
      'cart': ['shopping', 'ecommerce', 'buy'],
      'heart': ['love', 'favorite', 'like']
    };
    
    if (synonymMap[name]) {
      tags.push(...synonymMap[name]);
    }
    
    return tags;
  }

  async getAvailableIcons(): Promise<BootstrapIcon[]> {
    return this.icons;
  }

  async getIconSvg(iconName: string, size: number = 24): Promise<string> {
    const cacheKey = `${iconName}-${size}`;
    
    if (this.iconCache.has(cacheKey)) {
      return this.iconCache.get(cacheKey)!;
    }

    try {
      // Try to fetch from CDN
      const response = await fetch(`${this.CDN_BASE}/${iconName}.svg`);
      if (response.ok) {
        let svgContent = await response.text();
        
        // Scale the SVG to the requested size
        svgContent = svgContent.replace(
          /width="[^"]*"/,
          `width="${size}"`
        ).replace(
          /height="[^"]*"/,
          `height="${size}"`
        );
        
        // Ensure viewBox is set correctly (Bootstrap icons are typically 16x16)
        if (!svgContent.includes('viewBox')) {
          svgContent = svgContent.replace(
            '<svg',
            '<svg viewBox="0 0 16 16"'
          );
        }
        
        this.iconCache.set(cacheKey, svgContent);
        return svgContent;
      }
    } catch (error) {
      console.warn(`Failed to fetch Bootstrap icon ${iconName} from CDN:`, error);
    }

    // Return fallback SVG
    return this.generateBootstrapSvg(iconName, size);
  }

  private generateBootstrapSvg(iconName: string, size: number): string {
    // Generate a simple placeholder SVG in Bootstrap style
    const paths = this.getPathForIcon(iconName);
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="currentColor" class="bi bi-${iconName}" viewBox="0 0 16 16">
  ${paths}
</svg>`;
  }

  private getPathForIcon(iconName: string): string {
    // Common Bootstrap icon paths
    const iconPaths: Record<string, string> = {
      'check': '<path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>',
      'x': '<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>',
      'plus': '<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>',
      'house': '<path fill-rule="evenodd" d="M2 13.5V7.41l6-4.5 6 4.5v6.09a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5zm6.5-.5a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1z"/>',
      'gear': '<path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>',
      'heart': '<path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>',
      'search': '<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>'
    };

    return iconPaths[iconName] || '<circle cx="8" cy="8" r="3"/>';
  }

  searchIcons(query: string): BootstrapIcon[] {
    const searchTerm = query.toLowerCase();
    return this.icons.filter(icon => 
      icon.name.toLowerCase().includes(searchTerm) ||
      icon.displayName.toLowerCase().includes(searchTerm) ||
      icon.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      icon.categories.some(cat => cat.toLowerCase().includes(searchTerm))
    );
  }

  getIconsByCategory(category: string): BootstrapIcon[] {
    return this.icons.filter(icon => 
      icon.categories.includes(category.toLowerCase())
    );
  }

  getCategories(): string[] {
    const categories = new Set<string>();
    this.icons.forEach(icon => {
      icon.categories.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  }

  getFallbackIcon(): string {
    return this.generateBootstrapSvg('question-circle', 24);
  }

  // Get a properly formatted Bootstrap icon for the preview system (FluentUI pattern)
  async getIconForPreview(iconName: string, size: number = 24): Promise<BootstrapServiceIcon | null> {
    const svgContent = await this.getIconSvg(iconName, size);
    if (!svgContent) return null;

    return {
      name: iconName,
      content: svgContent,
      size: size
    };
  }

  // Convert Bootstrap icon to a file-like object for the preview system (FluentUI pattern)
  async getIconAsFile(iconName: string, size: number = 24): Promise<{name: string, content: string, relativePath: string} | null> {
    const svgContent = await this.getIconSvg(iconName, size);
    if (!svgContent) return null;

    return {
      name: `${iconName.toLowerCase().replace(/\s+/g, '-')}-${size}.svg`,
      content: svgContent,
      relativePath: `bootstrap-icons/${iconName.toLowerCase().replace(/\s+/g, '-')}-${size}.svg`
    };
  }

  // Get available sizes (FluentUI pattern)
  getAvailableSizes(): number[] {
    return [16, 20, 24, 28, 32, 48, 64];
  }

  // Get available variants (Bootstrap Icons only have one variant) (FluentUI pattern)
  getAvailableVariants(): string[] {
    return ['default'];
  }

  // Get popular icons for quick access (FluentUI pattern)
  async getPopularIcons(): Promise<BootstrapIcon[]> {
    const popularNames = [
      'house', 'person', 'heart', 'star', 'envelope', 'phone', 'search',
      'gear', 'bell', 'calendar', 'clock', 'download', 'upload', 'check',
      'x', 'plus', 'trash', 'eye', 'lock', 'camera'
    ];
    
    const icons = await this.getAvailableIcons();
    return icons.filter(icon => popularNames.includes(icon.name));
  }

  // Get icon metadata (FluentUI pattern)
  async getIconInfo(iconName: string): Promise<BootstrapIcon | null> {
    const icons = await this.getAvailableIcons();
    return icons.find(icon => icon.name === iconName) || null;
  }

  // Batch generate multiple Bootstrap icons (FluentUI pattern)
  async batchGenerateIcons(iconNames: string[], size: number = 24): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    const promises = iconNames.map(async (iconName) => {
      const svg = await this.getIconSvg(iconName, size);
      if (svg) {
        results.set(iconName, svg);
      }
    });
    
    await Promise.all(promises);
    return results;
  }
}

export const bootstrapService = new BootstrapIconService();
export default bootstrapService;