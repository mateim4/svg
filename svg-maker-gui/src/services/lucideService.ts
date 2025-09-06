// Lucide Icons Service - Official Implementation
// Following Lucide specifications from https://github.com/lucide-icons/lucide

export interface LucideIcon {
  name: string;
  displayName: string;
  categories: string[];
  tags: string[];
  contributors: string[];
  svgContent?: string;
}

export interface LucideServiceIcon {
  name: string;
  content: string;
  size: number;
}

export class LucideService {
  private iconCache: Map<string, string> = new Map();
  private iconList: LucideIcon[] = [];

  constructor() {
    this.initializePopularIcons();
  }

  private initializePopularIcons(): void {
    // Popular Lucide icons based on common usage patterns
    const popularIcons = [
      { name: 'activity', displayName: 'Activity', categories: ['charts'], tags: ['pulse', 'heartbeat', 'graph'] },
      { name: 'airplay', displayName: 'Airplay', categories: ['connectivity'], tags: ['stream', 'cast', 'wireless'] },
      { name: 'alert-circle', displayName: 'Alert Circle', categories: ['notifications'], tags: ['warning', 'error', 'info'] },
      { name: 'alert-triangle', displayName: 'Alert Triangle', categories: ['notifications'], tags: ['warning', 'caution', 'danger'] },
      { name: 'archive', displayName: 'Archive', categories: ['files'], tags: ['box', 'storage', 'backup'] },
      { name: 'arrow-down', displayName: 'Arrow Down', categories: ['arrows'], tags: ['direction', 'down', 'south'] },
      { name: 'arrow-left', displayName: 'Arrow Left', categories: ['arrows'], tags: ['direction', 'left', 'west', 'back'] },
      { name: 'arrow-right', displayName: 'Arrow Right', categories: ['arrows'], tags: ['direction', 'right', 'east', 'forward'] },
      { name: 'arrow-up', displayName: 'Arrow Up', categories: ['arrows'], tags: ['direction', 'up', 'north'] },
      { name: 'bell', displayName: 'Bell', categories: ['notifications'], tags: ['notification', 'alert', 'sound'] },
      { name: 'bookmark', displayName: 'Bookmark', categories: ['files'], tags: ['save', 'favorite', 'mark'] },
      { name: 'calendar', displayName: 'Calendar', categories: ['time'], tags: ['date', 'schedule', 'month'] },
      { name: 'camera', displayName: 'Camera', categories: ['photography'], tags: ['photo', 'picture', 'capture'] },
      { name: 'check', displayName: 'Check', categories: ['general'], tags: ['done', 'complete', 'success'] },
      { name: 'check-circle', displayName: 'Check Circle', categories: ['general'], tags: ['done', 'complete', 'success'] },
      { name: 'chevron-down', displayName: 'Chevron Down', categories: ['arrows'], tags: ['expand', 'dropdown', 'down'] },
      { name: 'chevron-left', displayName: 'Chevron Left', categories: ['arrows'], tags: ['back', 'previous', 'left'] },
      { name: 'chevron-right', displayName: 'Chevron Right', categories: ['arrows'], tags: ['next', 'forward', 'right'] },
      { name: 'chevron-up', displayName: 'Chevron Up', categories: ['arrows'], tags: ['collapse', 'up', 'close'] },
      { name: 'circle', displayName: 'Circle', categories: ['shapes'], tags: ['round', 'dot', 'point'] },
      { name: 'clock', displayName: 'Clock', categories: ['time'], tags: ['time', 'watch', 'schedule'] },
      { name: 'cloud', displayName: 'Cloud', categories: ['weather'], tags: ['weather', 'sky', 'storage'] },
      { name: 'copy', displayName: 'Copy', categories: ['files'], tags: ['duplicate', 'clone', 'clipboard'] },
      { name: 'download', displayName: 'Download', categories: ['arrows'], tags: ['save', 'export', 'get'] },
      { name: 'edit', displayName: 'Edit', categories: ['text'], tags: ['pencil', 'modify', 'write'] },
      { name: 'external-link', displayName: 'External Link', categories: ['arrows'], tags: ['open', 'new tab', 'redirect'] },
      { name: 'eye', displayName: 'Eye', categories: ['general'], tags: ['view', 'see', 'look', 'visible'] },
      { name: 'eye-off', displayName: 'Eye Off', categories: ['general'], tags: ['hide', 'invisible', 'hidden'] },
      { name: 'file', displayName: 'File', categories: ['files'], tags: ['document', 'page', 'paper'] },
      { name: 'folder', displayName: 'Folder', categories: ['files'], tags: ['directory', 'storage', 'organize'] },
      { name: 'heart', displayName: 'Heart', categories: ['general'], tags: ['love', 'like', 'favorite'] },
      { name: 'home', displayName: 'Home', categories: ['general'], tags: ['house', 'main', 'start'] },
      { name: 'info', displayName: 'Info', categories: ['general'], tags: ['information', 'about', 'help'] },
      { name: 'lock', displayName: 'Lock', categories: ['security'], tags: ['secure', 'private', 'protected'] },
      { name: 'mail', displayName: 'Mail', categories: ['communication'], tags: ['email', 'message', 'letter'] },
      { name: 'menu', displayName: 'Menu', categories: ['layout'], tags: ['hamburger', 'navigation', 'options'] },
      { name: 'more-horizontal', displayName: 'More Horizontal', categories: ['layout'], tags: ['dots', 'options', 'menu'] },
      { name: 'phone', displayName: 'Phone', categories: ['communication'], tags: ['call', 'telephone', 'mobile'] },
      { name: 'play', displayName: 'Play', categories: ['media'], tags: ['start', 'video', 'music'] },
      { name: 'plus', displayName: 'Plus', categories: ['general'], tags: ['add', 'new', 'create'] },
      { name: 'search', displayName: 'Search', categories: ['general'], tags: ['find', 'magnify', 'look'] },
      { name: 'settings', displayName: 'Settings', categories: ['general'], tags: ['gear', 'preferences', 'config'] },
      { name: 'share', displayName: 'Share', categories: ['general'], tags: ['send', 'export', 'distribute'] },
      { name: 'star', displayName: 'Star', categories: ['general'], tags: ['favorite', 'rating', 'bookmark'] },
      { name: 'trash', displayName: 'Trash', categories: ['general'], tags: ['delete', 'remove', 'bin'] },
      { name: 'unlock', displayName: 'Unlock', categories: ['security'], tags: ['open', 'accessible', 'unprotected'] },
      { name: 'upload', displayName: 'Upload', categories: ['arrows'], tags: ['send', 'import', 'put'] },
      { name: 'user', displayName: 'User', categories: ['users'], tags: ['person', 'profile', 'account'] },
      { name: 'x', displayName: 'X', categories: ['general'], tags: ['close', 'cancel', 'remove'] }
    ];

    this.iconList = popularIcons.map(icon => ({
      name: icon.name,
      displayName: icon.displayName,
      categories: icon.categories,
      tags: icon.tags,
      contributors: []
    }));
  }

  // Get all available icons
  getAvailableIcons(): LucideIcon[] {
    return this.iconList;
  }

  // Get a specific icon's SVG content according to Lucide specifications
  async getIconSvg(iconName: string, size: number = 24, strokeWidth: number = 2, color: string = 'currentColor'): Promise<string | null> {
    try {
      const cacheKey = `${iconName}_${size}_${strokeWidth}_${color}`;

      // Check cache first
      if (this.iconCache.has(cacheKey)) {
        return this.iconCache.get(cacheKey)!;
      }

      // Generate Lucide-compliant SVG based on official specifications
      const svg = this.generateLucideSvg(iconName, size, strokeWidth, color);
      this.iconCache.set(cacheKey, svg);
      return svg;
    } catch (error) {
      console.error(`Error getting Lucide icon ${iconName}:`, error);
      return this.getFallbackIcon(size, strokeWidth, color);
    }
  }

  // Generate SVG following official Lucide specifications
  private generateLucideSvg(iconName: string, size: number, strokeWidth: number = 2, color: string = 'currentColor'): string {
    // Official Lucide SVG structure from their repository
    const pathData = this.getIconPath(iconName, size);
    
    // Lucide standard: 24x24 viewBox, stroke-based, currentColor, stroke-width="2"
    // Following official Lucide design system specifications
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconName}">
  ${pathData}
</svg>`;
  }

  // Get icon path data based on Lucide's actual icon designs
  private getIconPath(iconName: string, size: number): string {
    switch (iconName) {
      case 'activity':
        return '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />';
      case 'airplay':
        return '<path d="m5 17 6-6 6 6" /><path d="m12 3 0 14" />';
      case 'alert-circle':
        return '<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />';
      case 'alert-triangle':
        return '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />';
      case 'archive':
        return '<rect x="2" y="3" width="20" height="5" rx="1" /><path d="m4 8 0 11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="m10 12 4 0" />';
      case 'arrow-down':
        return '<path d="M12 5v14" /><path d="m19 12-7 7-7-7" />';
      case 'arrow-left':
        return '<path d="M19 12H5" /><path d="m12 19-7-7 7-7" />';
      case 'arrow-right':
        return '<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />';
      case 'arrow-up':
        return '<path d="M12 19V5" /><path d="m5 12 7-7 7 7" />';
      case 'bell':
        return '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />';
      case 'bookmark':
        return '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />';
      case 'calendar':
        return '<path d="M8 2v4" /><path d="M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" />';
      case 'camera':
        return '<path d="m14.5 4-1 0-1-1h-2.5l-1 1H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.5Z" /><circle cx="12" cy="12" r="3" />';
      case 'check':
        return '<path d="m9 12 2 2 4-4" />';
      case 'check-circle':
        return '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />';
      case 'chevron-down':
        return '<path d="m6 9 6 6 6-6" />';
      case 'chevron-left':
        return '<path d="m15 18-6-6 6-6" />';
      case 'chevron-right':
        return '<path d="m9 18 6-6-6-6" />';
      case 'chevron-up':
        return '<path d="m18 15-6-6-6 6" />';
      case 'circle':
        return '<circle cx="12" cy="12" r="10" />';
      case 'clock':
        return '<circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />';
      case 'cloud':
        return '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />';
      case 'copy':
        return '<rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />';
      case 'download':
        return '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" />';
      case 'edit':
        return '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />';
      case 'external-link':
        return '<path d="M15 3h6v6" /><path d="m10 14 9-9" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />';
      case 'eye':
        return '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />';
      case 'eye-off':
        return '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" />';
      case 'file':
        return '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" />';
      case 'folder':
        return '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />';
      case 'heart':
        return '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />';
      case 'home':
        return '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" />';
      case 'info':
        return '<circle cx="12" cy="12" r="10" /><path d="m12 16 0-4" /><path d="m12 8 0 0" />';
      case 'lock':
        return '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="m7 11V7a5 5 0 0 1 10 0v4" />';
      case 'mail':
        return '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />';
      case 'menu':
        return '<line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />';
      case 'more-horizontal':
        return '<circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />';
      case 'phone':
        return '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />';
      case 'play':
        return '<polygon points="6,3 20,12 6,21 6,3" />';
      case 'plus':
        return '<path d="M5 12h14" /><path d="M12 5v14" />';
      case 'search':
        return '<circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />';
      case 'settings':
        return '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z" /><circle cx="12" cy="12" r="3" />';
      case 'share':
        return '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16,6 12,2 8,6" /><line x1="12" y1="2" x2="12" y2="15" />';
      case 'star':
        return '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />';
      case 'trash':
        return '<path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />';
      case 'unlock':
        return '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="m7 11V7a5 5 0 0 1 9.9-1" />';
      case 'upload':
        return '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" />';
      case 'user':
        return '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />';
      case 'x':
        return '<path d="m18 6-12 12" /><path d="m6 6 12 12" />';
      default:
        // Default icon - simple circle for unknown icons
        return '<circle cx="12" cy="12" r="8" />';
    }
  }

  private getFallbackIcon(size: number, strokeWidth: number = 2, color: string = 'currentColor'): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-help-circle">
  <circle cx="12" cy="12" r="10" />
  <path d="m9 9a3 3 0 0 1 5.12-2.12A3 3 0 0 1 15 9c0 1.5-1 2.5-2.5 2.5V12" />
  <path d="M12 17h.01" />
</svg>`;
  }

  // Search icons by name
  searchIcons(query: string): LucideIcon[] {
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
  getIconInfo(iconName: string): LucideIcon | null {
    return this.getAvailableIcons().find(icon => icon.name === iconName) || null;
  }

  // Get popular/commonly used icons
  getPopularIcons(): LucideIcon[] {
    return this.getAvailableIcons().slice(0, 20);
  }

  // Get a properly formatted Lucide icon for the preview system
  async getIconForPreview(iconName: string, size: number = 24, strokeWidth: number = 2): Promise<LucideServiceIcon | null> {
    const svgContent = await this.getIconSvg(iconName, size, strokeWidth);
    if (!svgContent) return null;

    return {
      name: iconName,
      content: svgContent,
      size: size
    };
  }

  // Convert Lucide icon to a file-like object for the preview system
  async getIconAsFile(iconName: string, size: number = 24, strokeWidth: number = 2): Promise<{name: string, content: string, relativePath: string} | null> {
    const svgContent = await this.getIconSvg(iconName, size, strokeWidth);
    if (!svgContent) return null;

    return {
      name: `${iconName}-${size}.svg`,
      content: svgContent,
      relativePath: `lucide-icons/${iconName}-${size}.svg`
    };
  }

  // Get available sizes (Lucide is scalable, but common sizes)
  getAvailableSizes(): number[] {
    return [16, 20, 24, 28, 32, 48, 64];
  }

  // Get available stroke widths following Lucide specifications
  getAvailableStrokeWidths(): number[] {
    return [0.5, 1, 1.5, 2, 2.5, 3];
  }

  // Generate customized Lucide icon following their design system
  async getLucideStyledIcon(
    iconName: string,
    options: {
      size?: number;
      strokeWidth?: number;
      color?: string;
      className?: string;
    } = {}
  ): Promise<string | null> {
    const {
      size = 24,
      strokeWidth = 2,
      color = 'currentColor',
      className = ''
    } = options;

    try {
      const pathData = this.getIconPath(iconName, size);
      const classes = `lucide lucide-${iconName} ${className}`.trim();
      
      // Follow Lucide's official SVG structure with enhanced customization
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="${classes}">
  ${pathData}
</svg>`;
    } catch (error) {
      console.error(`Error generating styled Lucide icon ${iconName}:`, error);
      return this.getFallbackIcon(size, strokeWidth, color);
    }
  }

  // Generate icon variants following Lucide design principles
  async getIconVariants(iconName: string, baseSize: number = 24): Promise<{
    sizes: { size: number; svg: string }[];
    strokeWidths: { width: number; svg: string }[];
  } | null> {
    try {
      const sizes = this.getAvailableSizes().map(size => ({
        size,
        svg: this.generateLucideSvg(iconName, size)
      }));

      const strokeWidths = this.getAvailableStrokeWidths().map(width => ({
        width,
        svg: this.generateLucideSvg(iconName, baseSize, width)
      }));

      return { sizes, strokeWidths };
    } catch (error) {
      console.error(`Error generating variants for ${iconName}:`, error);
      return null;
    }
  }

  // Batch generate icons with consistent styling (following Lucide design system)
  async batchGenerateIcons(
    iconNames: string[],
    options: {
      size?: number;
      strokeWidth?: number;
      color?: string;
    } = {}
  ): Promise<{ name: string; svg: string | null }[]> {
    const { size = 24, strokeWidth = 2, color = 'currentColor' } = options;
    
    return Promise.all(
      iconNames.map(async (name) => ({
        name,
        svg: await this.getIconSvg(name, size, strokeWidth, color)
      }))
    );
  }
}

export const lucideService = new LucideService();