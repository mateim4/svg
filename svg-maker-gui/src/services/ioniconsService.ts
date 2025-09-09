// Ionicons Service
// Premium designed icons for use in web, iOS, Android, and desktop apps

export interface IonIcon {
  name: string;
  displayName: string;
  categories: string[];
  tags: string[];
  variants: string[];
}

class IoniconsService {
  private icons: IonIcon[] = [];
  private iconCache: Map<string, string> = new Map();
  private readonly CDN_BASE = 'https://unpkg.com/ionicons@7.1.0/dist/svg';

  constructor() {
    this.initializeIcons();
  }

  private initializeIcons(): void {
    // Common Ionicons - includes outline, filled, and sharp variants
    const iconNames = [
      'accessibility', 'add', 'airplane', 'alarm', 'albums', 'alert', 'american-football',
      'analytics', 'aperture', 'apps', 'archive', 'arrow-back', 'arrow-down', 'arrow-forward',
      'arrow-up', 'at', 'attach', 'backspace', 'bag', 'bandage', 'bar-chart', 'barbell',
      'barcode', 'baseball', 'basket', 'basketball', 'battery', 'beaker', 'bed', 'beer',
      'bicycle', 'bluetooth', 'boat', 'body', 'bonfire', 'book', 'bookmark', 'briefcase',
      'browsers', 'brush', 'bug', 'build', 'bulb', 'bus', 'business', 'cafe', 'calculator',
      'calendar', 'call', 'camera', 'car', 'card', 'cart', 'cash', 'cellular', 'chatbox',
      'chatbubble', 'checkbox', 'checkmark', 'chevron-back', 'chevron-down', 'chevron-forward',
      'chevron-up', 'clipboard', 'close', 'cloud', 'cloudy', 'code', 'cog', 'color-palette',
      'compass', 'construct', 'contract', 'contrast', 'copy', 'create', 'crop', 'cube',
      'cut', 'desktop', 'diamond', 'dice', 'disc', 'document', 'download', 'duplicate',
      'ear', 'earth', 'easel', 'egg', 'ellipse', 'enter', 'exit', 'expand', 'eye',
      'eyedrop', 'fast-food', 'female', 'file-tray', 'film', 'filter', 'finger-print',
      'fish', 'fitness', 'flag', 'flame', 'flash', 'flashlight', 'flask', 'flower',
      'folder', 'football', 'footsteps', 'funnel', 'game-controller', 'gift', 'git-branch',
      'git-commit', 'git-merge', 'git-network', 'git-pull-request', 'glasses', 'globe',
      'golf', 'grid', 'hammer', 'hand', 'happy', 'hardware-chip', 'headset', 'heart',
      'help', 'home', 'hourglass', 'ice-cream', 'image', 'images', 'infinite', 'information',
      'journal', 'key', 'keypad', 'language', 'laptop', 'layers', 'leaf', 'library',
      'link', 'list', 'location', 'lock-closed', 'lock-open', 'log-in', 'log-out',
      'logo-android', 'logo-angular', 'logo-apple', 'logo-bitcoin', 'logo-chrome',
      'logo-css3', 'logo-facebook', 'logo-firebase', 'logo-github', 'logo-google',
      'logo-html5', 'logo-instagram', 'logo-ionic', 'logo-javascript', 'logo-linkedin',
      'logo-nodejs', 'logo-npm', 'logo-python', 'logo-react', 'logo-reddit', 'logo-sass',
      'logo-skype', 'logo-slack', 'logo-snapchat', 'logo-stackoverflow', 'logo-twitter',
      'logo-vue', 'logo-web-component', 'logo-whatsapp', 'logo-windows', 'logo-wordpress',
      'logo-xbox', 'logo-youtube', 'magnet', 'mail', 'male', 'man', 'map', 'medal',
      'medical', 'medkit', 'megaphone', 'menu', 'mic', 'moon', 'move', 'musical-note',
      'musical-notes', 'navigate', 'newspaper', 'notifications', 'nuclear', 'nutrition',
      'open', 'options', 'paper-plane', 'partly-sunny', 'pause', 'paw', 'pencil', 'people',
      'person', 'phone-landscape', 'phone-portrait', 'pie-chart', 'pin', 'pizza', 'planet',
      'play', 'podium', 'power', 'pricetag', 'print', 'prism', 'pulse', 'push', 'qr-code',
      'radio', 'rainy', 'reader', 'receipt', 'recording', 'refresh', 'reload', 'remove',
      'reorder', 'repeat', 'resize', 'restaurant', 'return', 'ribbon', 'rocket', 'rose',
      'sad', 'save', 'scan', 'school', 'search', 'send', 'server', 'settings', 'shapes',
      'share', 'shield', 'shirt', 'shuffle', 'skull', 'snow', 'speedometer', 'square',
      'star', 'stats-chart', 'stop', 'stopwatch', 'storefront', 'subway', 'sunny',
      'swap', 'sync', 'tablet', 'telescope', 'terminal', 'text', 'thermometer', 'thumbs-down',
      'thumbs-up', 'thunderstorm', 'ticket', 'time', 'timer', 'today', 'toggle', 'trail-sign',
      'train', 'transgender', 'trash', 'trending-down', 'trending-up', 'triangle', 'trophy',
      'tv', 'umbrella', 'unlink', 'videocam', 'volume-high', 'volume-low', 'volume-medium',
      'volume-mute', 'walk', 'wallet', 'warning', 'watch', 'water', 'wifi', 'wine', 'woman'
    ];

    this.icons = iconNames.map(name => ({
      name,
      displayName: name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      categories: this.getCategoriesForIcon(name),
      tags: this.getTagsForIcon(name),
      variants: ['outline', 'filled', 'sharp']
    }));
  }

  private getCategoriesForIcon(name: string): string[] {
    const categoryMap: Record<string, string[]> = {
      'logos': name.startsWith('logo-') ? [name] : [],
      'devices': ['phone-portrait', 'phone-landscape', 'tablet', 'laptop', 'desktop', 'watch', 'hardware-chip', 'tv'],
      'commerce': ['cart', 'bag', 'basket', 'cash', 'card', 'wallet', 'pricetag', 'receipt', 'storefront'],
      'communication': ['chatbox', 'chatbubble', 'mail', 'send', 'paper-plane', 'call', 'videocam', 'mic'],
      'media': ['camera', 'image', 'images', 'musical-note', 'musical-notes', 'play', 'pause', 'stop', 'volume-high'],
      'files': ['document', 'folder', 'file-tray', 'archive', 'download', 'cloud', 'duplicate', 'copy'],
      'charts': ['bar-chart', 'pie-chart', 'stats-chart', 'analytics', 'trending-up', 'trending-down'],
      'ui': ['checkmark', 'close', 'add', 'remove', 'menu', 'options', 'settings', 'search', 'filter'],
      'arrows': ['arrow-back', 'arrow-down', 'arrow-forward', 'arrow-up', 'chevron-back', 'chevron-down', 'chevron-forward', 'chevron-up'],
      'time': ['time', 'timer', 'alarm', 'calendar', 'today', 'stopwatch', 'hourglass'],
      'sports': ['basketball', 'football', 'american-football', 'baseball', 'golf', 'fitness', 'barbell', 'bicycle'],
      'weather': ['sunny', 'partly-sunny', 'cloudy', 'rainy', 'thunderstorm', 'snow', 'thermometer']
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
    // Add common synonyms and related terms
    const synonymMap: Record<string, string[]> = {
      'settings': ['config', 'configuration', 'preferences', 'options'],
      'mail': ['email', 'message', 'envelope'],
      'trash': ['delete', 'remove', 'bin'],
      'person': ['user', 'profile', 'account', 'avatar'],
      'people': ['users', 'group', 'team', 'community'],
      'home': ['house', 'dashboard', 'main'],
      'cart': ['shopping', 'ecommerce', 'buy', 'store'],
      'heart': ['love', 'favorite', 'like'],
      'star': ['favorite', 'bookmark', 'rating'],
      'search': ['find', 'lookup', 'discover']
    };
    
    if (synonymMap[name]) {
      tags.push(...synonymMap[name]);
    }
    
    return tags;
  }

  getAvailableIcons(): IonIcon[] {
    return this.icons;
  }

  async getIconSvg(iconName: string, size: number = 24, variant: string = 'outline'): Promise<string> {
    const cacheKey = `${iconName}-${size}-${variant}`;
    
    if (this.iconCache.has(cacheKey)) {
      return this.iconCache.get(cacheKey)!;
    }

    // Ionicons use different suffixes for variants
    let fileName = iconName;
    if (variant === 'outline') {
      fileName = `${iconName}-outline`;
    } else if (variant === 'sharp') {
      fileName = `${iconName}-sharp`;
    }
    // 'filled' variant typically has no suffix

    try {
      // Try to fetch from CDN
      const response = await fetch(`${this.CDN_BASE}/${fileName}.svg`);
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
        
        // Ensure viewBox is set correctly (Ionicons are typically 512x512)
        if (!svgContent.includes('viewBox')) {
          svgContent = svgContent.replace(
            '<svg',
            '<svg viewBox="0 0 512 512"'
          );
        }
        
        this.iconCache.set(cacheKey, svgContent);
        return svgContent;
      }
    } catch (error) {
      console.warn(`Failed to fetch Ionicon ${fileName} from CDN:`, error);
    }

    // Return fallback SVG
    return this.generateIoniconSvg(iconName, size, variant);
  }

  private generateIoniconSvg(iconName: string, size: number, variant: string): string {
    // Generate a simple placeholder SVG in Ionicons style
    const strokeWidth = variant === 'outline' ? '32' : '0';
    const fill = variant === 'outline' ? 'none' : 'currentColor';
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <path d="${this.getPathForIcon(iconName, variant)}" fill="${fill}" stroke="currentColor" stroke-width="${strokeWidth}"/>
</svg>`;
  }

  private getPathForIcon(iconName: string, variant: string): string {
    // Sample paths for common icons
    const paths: Record<string, string> = {
      'checkmark': 'M416 128L192 384l-96-96',
      'close': 'M368 368L144 144M368 144L144 368',
      'add': 'M256 112v288M400 256H112',
      'home': variant === 'outline' 
        ? 'M80 212v236a16 16 0 0016 16h96V328a24 24 0 0124-24h80a24 24 0 0124 24v136h96a16 16 0 0016-16V212M480 256L266.89 52c-5-5.28-16.69-5.34-21.78 0L32 256'
        : 'M261.56 101.28a8 8 0 00-11.06 0L66.4 277.15a8 8 0 00-2.47 5.79L63.9 448a32 32 0 0032 32H192a16 16 0 0016-16V328a8 8 0 018-8h80a8 8 0 018 8v136a16 16 0 0016 16h96.06a32 32 0 0032-32V282.94a8 8 0 00-2.47-5.79z',
      'heart': variant === 'outline'
        ? 'M352.92 80C288 80 256 144 256 144s-32-64-96.92-64c-52.76 0-94.54 44.14-95.08 96.81-1.1 109.33 86.73 187.08 183 252.42a16 16 0 0018 0c96.26-65.34 184.09-143.09 183-252.42-.54-52.67-42.32-96.81-95.08-96.81z'
        : 'M256 448a32 32 0 01-18-5.57c-78.59-53.35-112.62-89.93-131.39-112.8-40-48.75-59.15-98.8-58.61-153C48.63 114.52 98.46 64 159.08 64c44.08 0 74.61 24.83 92.39 45.51a6 6 0 009.06 0C278.31 88.81 308.84 64 352.92 64c60.62 0 110.45 50.52 111.08 112.64.54 54.21-18.63 104.26-58.61 153-18.77 22.87-52.8 59.45-131.39 112.8a32 32 0 01-18 5.56z'
    };

    return paths[iconName] || 'M256 256m-128 0a128 128 0 1 0 256 0 128 128 0 1 0-256 0';
  }

  searchIcons(query: string): IonIcon[] {
    const searchTerm = query.toLowerCase();
    return this.icons.filter(icon => 
      icon.name.toLowerCase().includes(searchTerm) ||
      icon.displayName.toLowerCase().includes(searchTerm) ||
      icon.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      icon.categories.some(cat => cat.toLowerCase().includes(searchTerm))
    );
  }

  getIconsByCategory(category: string): IonIcon[] {
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
    return this.generateIoniconSvg('help-circle', 24, 'outline');
  }
}

export const ioniconsService = new IoniconsService();
export default ioniconsService;