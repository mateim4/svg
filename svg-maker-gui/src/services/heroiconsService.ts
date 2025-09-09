// Heroicons Service - Official Implementation
// Following Heroicons specifications from https://github.com/tailwindlabs/heroicons

export interface HeroiconsIcon {
  name: string;
  displayName: string;
  categories: string[];
  tags: string[];
  variants: ('outline' | 'solid' | 'mini')[];
  sizes: number[];
  svgContent?: string;
}

export interface HeroiconsServiceIcon {
  name: string;
  content: string;
  size: number;
  variant: 'outline' | 'solid' | 'mini';
}

export class HeroiconsService {
  private iconCache: Map<string, string> = new Map();
  private iconList: HeroiconsIcon[] = [];

  constructor() {
    this.initializePopularIcons();
  }

  private initializePopularIcons(): void {
    // Popular Heroicons based on common UI patterns
    const popularIcons = [
      { name: 'academic-cap', displayName: 'Academic Cap', categories: ['education'], tags: ['graduation', 'education', 'school', 'university'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'adjustments-horizontal', displayName: 'Adjustments Horizontal', categories: ['interface'], tags: ['settings', 'controls', 'sliders'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'archive-box', displayName: 'Archive Box', categories: ['files'], tags: ['box', 'storage', 'archive', 'backup'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'arrow-down', displayName: 'Arrow Down', categories: ['arrows'], tags: ['direction', 'down', 'south'], variants: ['outline', 'solid', 'mini'], sizes: [16, 20, 24] },
      { name: 'arrow-left', displayName: 'Arrow Left', categories: ['arrows'], tags: ['direction', 'left', 'west', 'back'], variants: ['outline', 'solid', 'mini'], sizes: [16, 20, 24] },
      { name: 'arrow-right', displayName: 'Arrow Right', categories: ['arrows'], tags: ['direction', 'right', 'east', 'forward'], variants: ['outline', 'solid', 'mini'], sizes: [16, 20, 24] },
      { name: 'arrow-up', displayName: 'Arrow Up', categories: ['arrows'], tags: ['direction', 'up', 'north'], variants: ['outline', 'solid', 'mini'], sizes: [16, 20, 24] },
      { name: 'bell', displayName: 'Bell', categories: ['notifications'], tags: ['notification', 'alert', 'sound'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'bookmark', displayName: 'Bookmark', categories: ['files'], tags: ['save', 'favorite', 'mark'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'calendar', displayName: 'Calendar', categories: ['time'], tags: ['date', 'schedule', 'month'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'camera', displayName: 'Camera', categories: ['photography'], tags: ['photo', 'picture', 'capture'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'check', displayName: 'Check', categories: ['interface'], tags: ['done', 'complete', 'success'], variants: ['outline', 'solid', 'mini'], sizes: [16, 20, 24] },
      { name: 'check-circle', displayName: 'Check Circle', categories: ['interface'], tags: ['done', 'complete', 'success'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'chevron-down', displayName: 'Chevron Down', categories: ['arrows'], tags: ['expand', 'dropdown', 'down'], variants: ['outline', 'solid', 'mini'], sizes: [16, 20, 24] },
      { name: 'chevron-left', displayName: 'Chevron Left', categories: ['arrows'], tags: ['back', 'previous', 'left'], variants: ['outline', 'solid', 'mini'], sizes: [16, 20, 24] },
      { name: 'chevron-right', displayName: 'Chevron Right', categories: ['arrows'], tags: ['next', 'forward', 'right'], variants: ['outline', 'solid', 'mini'], sizes: [16, 20, 24] },
      { name: 'chevron-up', displayName: 'Chevron Up', categories: ['arrows'], tags: ['collapse', 'up', 'close'], variants: ['outline', 'solid', 'mini'], sizes: [16, 20, 24] },
      { name: 'clock', displayName: 'Clock', categories: ['time'], tags: ['time', 'watch', 'schedule'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'cloud', displayName: 'Cloud', categories: ['weather'], tags: ['weather', 'sky', 'storage'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'cog-6-tooth', displayName: 'Cog 6 Tooth', categories: ['interface'], tags: ['settings', 'gear', 'preferences'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'document', displayName: 'Document', categories: ['files'], tags: ['file', 'page', 'paper'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'envelope', displayName: 'Envelope', categories: ['communication'], tags: ['mail', 'email', 'message'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'exclamation-circle', displayName: 'Exclamation Circle', categories: ['notifications'], tags: ['warning', 'alert', 'error'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'exclamation-triangle', displayName: 'Exclamation Triangle', categories: ['notifications'], tags: ['warning', 'caution', 'danger'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'eye', displayName: 'Eye', categories: ['interface'], tags: ['view', 'see', 'look', 'visible'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'eye-slash', displayName: 'Eye Slash', categories: ['interface'], tags: ['hide', 'invisible', 'hidden'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'folder', displayName: 'Folder', categories: ['files'], tags: ['directory', 'storage', 'organize'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'heart', displayName: 'Heart', categories: ['interface'], tags: ['love', 'like', 'favorite'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'home', displayName: 'Home', categories: ['interface'], tags: ['house', 'main', 'start'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'information-circle', displayName: 'Information Circle', categories: ['interface'], tags: ['info', 'about', 'help'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'link', displayName: 'Link', categories: ['interface'], tags: ['url', 'chain', 'connect'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'lock-closed', displayName: 'Lock Closed', categories: ['security'], tags: ['secure', 'private', 'protected'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'magnifying-glass', displayName: 'Magnifying Glass', categories: ['interface'], tags: ['search', 'find', 'look'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'phone', displayName: 'Phone', categories: ['communication'], tags: ['call', 'telephone', 'mobile'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'play', displayName: 'Play', categories: ['media'], tags: ['start', 'video', 'music'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'plus', displayName: 'Plus', categories: ['interface'], tags: ['add', 'new', 'create'], variants: ['outline', 'solid', 'mini'], sizes: [16, 20, 24] },
      { name: 'share', displayName: 'Share', categories: ['interface'], tags: ['send', 'export', 'distribute'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'star', displayName: 'Star', categories: ['interface'], tags: ['favorite', 'rating', 'bookmark'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'trash', displayName: 'Trash', categories: ['interface'], tags: ['delete', 'remove', 'bin'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'user', displayName: 'User', categories: ['users'], tags: ['person', 'profile', 'account'], variants: ['outline', 'solid'], sizes: [16, 20, 24] },
      { name: 'x-mark', displayName: 'X Mark', categories: ['interface'], tags: ['close', 'cancel', 'remove'], variants: ['outline', 'solid'], sizes: [16, 20, 24] }
    ];

    this.iconList = popularIcons.map(icon => ({
      name: icon.name,
      displayName: icon.displayName,
      categories: icon.categories,
      tags: icon.tags,
      variants: icon.variants as ('outline' | 'solid' | 'mini')[],
      sizes: icon.sizes
    }));
  }

  // Get all available icons
  getAvailableIcons(): HeroiconsIcon[] {
    return this.iconList;
  }

  // Get a specific icon's SVG content according to Heroicons specifications
  async getIconSvg(iconName: string, size: number = 24, variant: 'outline' | 'solid' | 'mini' = 'outline', strokeWidth: number = 1.5): Promise<string | null> {
    try {
      const cacheKey = `${iconName}_${size}_${variant}_${strokeWidth}`;

      // Check cache first
      if (this.iconCache.has(cacheKey)) {
        return this.iconCache.get(cacheKey)!;
      }

      // Fetch real SVG from GitHub Heroicons repository
      const baseUrl = 'https://raw.githubusercontent.com/tailwindlabs/heroicons/master/src';
      let iconUrl: string;
      
      // Map variant to correct folder structure
      if (variant === 'mini') {
        iconUrl = `${baseUrl}/20/solid/${iconName}.svg`;
      } else if (variant === 'solid') {
        iconUrl = `${baseUrl}/24/solid/${iconName}.svg`;
      } else {
        iconUrl = `${baseUrl}/24/outline/${iconName}.svg`;
      }

      console.log(`Fetching REAL Heroicons icon: ${iconName} (${variant}) from ${iconUrl}`);
      
      const response = await fetch(iconUrl);
      if (!response.ok) {
        console.warn(`Failed to fetch Heroicons ${iconName} (${variant}): HTTP ${response.status}`);
        // Try fallback with hardcoded paths for common icons
        const fallbackSvg = this.generateHeroiconsSvg(iconName, size, variant, strokeWidth);
        this.iconCache.set(cacheKey, fallbackSvg);
        return fallbackSvg;
      }

      let svgContent = await response.text();
      
      // Validate SVG content
      if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
        throw new Error(`Invalid SVG content received for Heroicons icon: ${iconName}`);
      }

      console.log(`✅ Successfully fetched Heroicons icon: ${iconName} (${variant})`);

      // Customize SVG with user parameters
      if (size !== 24) {
        svgContent = svgContent.replace(/width="[^"]*"/, `width="${size}"`);
        svgContent = svgContent.replace(/height="[^"]*"/, `height="${size}"`);
      }

      // Apply custom stroke-width for outline variants
      if (variant === 'outline' && strokeWidth !== 1.5) {
        svgContent = svgContent.replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`);
      }

      this.iconCache.set(cacheKey, svgContent);
      return svgContent;
    } catch (error) {
      console.error(`Error getting Heroicons icon ${iconName}:`, error);
      return this.getFallbackIcon(size, variant, strokeWidth);
    }
  }

  // Generate SVG following official Heroicons specifications
  private generateHeroiconsSvg(iconName: string, size: number, variant: 'outline' | 'solid' | 'mini', strokeWidth: number): string {
    const pathData = this.getIconPath(iconName, size, variant);
    
    // Set proper viewBox for different variants
    let viewBoxSize = '24';
    if (variant === 'mini') {
      viewBoxSize = '20';
    }
    
    if (variant === 'outline') {
      // Outline variant: stroke-based with no fill, customizable stroke-width
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" stroke-width="${strokeWidth}" stroke="currentColor" aria-hidden="true" data-slot="icon">
  ${pathData}
</svg>`;
    } else {
      // Solid/Mini variant: fill-based
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" fill="currentColor" aria-hidden="true" data-slot="icon">
  ${pathData}
</svg>`;
    }
  }

  // Get icon path data based on Heroicons' actual icon designs
  private getIconPath(iconName: string, size: number, variant: 'outline' | 'solid' | 'mini'): string {
    switch (iconName) {
      case 'home':
        if (variant === 'outline') {
          return '<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>';
        } else {
          return '<path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"/><path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"/>';
        }
      case 'user':
        if (variant === 'outline') {
          return '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>';
        } else {
          return '<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd"/>';
        }
      case 'heart':
        if (variant === 'outline') {
          return '<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/>';
        } else {
          return '<path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"/>';
        }
      case 'star':
        if (variant === 'outline') {
          return '<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>';
        } else {
          return '<path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd"/>';
        }
      case 'bell':
        if (variant === 'outline') {
          return '<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>';
        } else {
          return '<path fill-rule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clip-rule="evenodd"/>';
        }
      case 'magnifying-glass':
        if (variant === 'outline') {
          return '<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>';
        } else {
          return '<path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd"/>';
        }
      case 'cog-6-tooth':
        if (variant === 'outline') {
          return '<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>';
        } else {
          return '<path fill-rule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.570.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clip-rule="evenodd"/>';
        }
      case 'plus':
        if (variant === 'outline') {
          return '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>';
        } else {
          return '<path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"/>';
        }
      case 'x-mark':
        if (variant === 'outline') {
          return '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>';
        } else {
          return '<path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>';
        }
      default:
        // Default fallback icon
        if (variant === 'outline') {
          return '<path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"/>';
        } else {
          return '<path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd"/>';
        }
    }
  }

  private getFallbackIcon(size: number, variant: 'outline' | 'solid' | 'mini', strokeWidth: number): string {
    const viewBoxSize = variant === 'mini' ? '20' : '24';
    
    if (variant === 'outline') {
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" stroke-width="${strokeWidth}" stroke="currentColor" aria-hidden="true" data-slot="icon">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"/>
</svg>`;
    } else {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" fill="currentColor" aria-hidden="true" data-slot="icon">
  <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd"/>
</svg>`;
    }
  }

  // Search icons by name
  searchIcons(query: string): HeroiconsIcon[] {
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
  getIconInfo(iconName: string): HeroiconsIcon | null {
    return this.getAvailableIcons().find(icon => icon.name === iconName) || null;
  }

  // Get popular/commonly used icons
  getPopularIcons(): HeroiconsIcon[] {
    return this.getAvailableIcons().slice(0, 20);
  }

  // Get available variants
  getAvailableVariants(): ('outline' | 'solid' | 'mini')[] {
    return ['outline', 'solid', 'mini'];
  }

  // Get available sizes
  getAvailableSizes(): number[] {
    return [16, 20, 24];
  }

  // Get a properly formatted Heroicons icon for the preview system
  async getIconForPreview(iconName: string, size: number = 24, variant: 'outline' | 'solid' | 'mini' = 'outline', strokeWidth: number = 1.5): Promise<HeroiconsServiceIcon | null> {
    const svgContent = await this.getIconSvg(iconName, size, variant, strokeWidth);
    if (!svgContent) return null;

    return {
      name: iconName,
      content: svgContent,
      size: size,
      variant: variant
    };
  }

  // Get Heroicons styled icon with proper processing
  async getHeroiconsStyledIcon(iconName: string, size: number = 24, variant: 'outline' | 'solid' | 'mini' = 'outline', strokeWidth: number = 1.5, color: string = 'currentColor'): Promise<string | null> {
    const baseSvg = await this.getIconSvg(iconName, size, variant, strokeWidth);
    if (!baseSvg) return null;

    // Apply custom color while preserving Heroicons structure
    return baseSvg.replace('currentColor', color);
  }

  // Get all variants of a specific icon
  async getIconVariants(iconName: string, size: number = 24, strokeWidth: number = 1.5): Promise<{outline?: string, solid?: string, mini?: string}> {
    const variants: {outline?: string, solid?: string, mini?: string} = {};
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

  // Batch generate multiple Heroicons
  async batchGenerateIcons(iconNames: string[], size: number = 24, variant: 'outline' | 'solid' | 'mini' = 'outline', strokeWidth: number = 1.5): Promise<Map<string, string>> {
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

  // Convert Heroicons icon to a file-like object for the preview system
  async getIconAsFile(iconName: string, size: number = 24, variant: 'outline' | 'solid' | 'mini' = 'outline'): Promise<{name: string, content: string, relativePath: string} | null> {
    const svgContent = await this.getIconSvg(iconName, size, variant);
    if (!svgContent) return null;

    return {
      name: `${iconName}-${variant}-${size}.svg`,
      content: svgContent,
      relativePath: `heroicons/${variant}/${size}/${iconName}.svg`
    };
  }
}

export const heroiconsService = new HeroiconsService();