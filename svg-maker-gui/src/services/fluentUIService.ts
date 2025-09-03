export interface FluentUIIcon {
  name: string;
  svgFiles: File[];
  metadata?: {
    name: string;
    size: number[];
    style: string[];
    keyword: string;
    description: string;
    metaphor: string[];
  };
  sizes: number[];
  variants: string[];
  svgContent?: { [key: string]: string }; // key: "size_variant" (e.g., "24_regular")
}

export class FluentUIService {
  private readonly LOCAL_REPO_PATH = '/home/mateim/DevApps/fluentui-system-icons/assets';
  private iconsCache: Map<string, FluentUIIcon> = new Map();

  // Check if we're running in browser and can't access file system directly
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Get available icons from the local repository
  async getAvailableIcons(): Promise<FluentUIIcon[]> {
    if (this.isBrowser()) {
      throw new Error('FluentUI service requires server-side access to local files');
    }

    // In a real implementation, this would use Node.js fs module
    // For now, return a mock list of common FluentUI icons
    return this.getMockFluentUIIcons();
  }

  // Get specific icon with all variants and sizes
  async getIcon(iconName: string): Promise<FluentUIIcon | null> {
    if (this.iconsCache.has(iconName)) {
      return this.iconsCache.get(iconName)!;
    }

    if (this.isBrowser()) {
      // In browser, we'll need to request from a backend or use pre-loaded data
      return this.getMockIcon(iconName);
    }

    // Server-side implementation would read from filesystem
    return this.getMockIcon(iconName);
  }

  // Get icon by specific size and variant
  async getIconSvg(iconName: string, size: number, variant: 'regular' | 'filled' | 'light'): Promise<string | null> {
    const icon = await this.getIcon(iconName);
    if (!icon) return null;

    const key = `${size}_${variant}`;
    return icon.svgContent?.[key] || null;
  }

  // Convert FluentUI icon to themed SVG with specified style
  convertToThemedSvg(
    svgContent: string, 
    style: 'neumorphism' | 'glassmorphism' | 'flat-design' | 'fluentui',
    config: {
      width: number;
      height: number;
      cornerRadius: number;
      padding: number;
      iconColor: string;
      gradient?: { angle: number; startColor: string; stopColor: string; } | null;
    }
  ): string {
    // Extract the path data from the FluentUI SVG
    const pathMatch = svgContent.match(/<path[^>]*d="([^"]*)"[^>]*>/);
    if (!pathMatch) {
      throw new Error('Invalid FluentUI SVG: no path found');
    }

    const pathData = pathMatch[1];
    const originalViewBox = this.extractViewBox(svgContent) || { width: 24, height: 24 };

    // Calculate scaling factor
    const iconSize = Math.min(config.width - config.padding * 2, config.height - config.padding * 2);
    const scale = iconSize / Math.max(originalViewBox.width, originalViewBox.height);

    // Create themed SVG based on style
    switch (style) {
      case 'fluentui':
        return this.createFluentUIThemedSvg(pathData, config, scale, originalViewBox);
      case 'neumorphism':
        return this.createNeumorphicSvg(pathData, config, scale, originalViewBox);
      case 'glassmorphism':
        return this.createGlassmorphicSvg(pathData, config, scale, originalViewBox);
      case 'flat-design':
        return this.createFlatDesignSvg(pathData, config, scale, originalViewBox);
      default:
        return this.createFluentUIThemedSvg(pathData, config, scale, originalViewBox);
    }
  }

  private extractViewBox(svgContent: string): { width: number; height: number } | null {
    const viewBoxMatch = svgContent.match(/viewBox="0 0 (\d+) (\d+)"/);
    if (viewBoxMatch) {
      return { width: parseInt(viewBoxMatch[1]), height: parseInt(viewBoxMatch[2]) };
    }

    const widthMatch = svgContent.match(/width="(\d+)"/);
    const heightMatch = svgContent.match(/height="(\d+)"/);
    if (widthMatch && heightMatch) {
      return { width: parseInt(widthMatch[1]), height: parseInt(heightMatch[1]) };
    }

    return null;
  }

  private createFluentUIThemedSvg(
    pathData: string, 
    config: any, 
    scale: number, 
    originalViewBox: { width: number; height: number }
  ): string {
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const offsetX = centerX - (originalViewBox.width * scale) / 2;
    const offsetY = centerY - (originalViewBox.height * scale) / 2;

    return `
<svg width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fluentBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0078d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#106ebe;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="fluentHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${config.width}" height="${config.height}" rx="${config.cornerRadius}" fill="url(#fluentBg)"/>
  
  <!-- Highlight overlay -->
  <rect x="1" y="1" width="${config.width-2}" height="${config.height-2}" rx="${config.cornerRadius-1}" fill="url(#fluentHighlight)"/>
  
  <!-- Icon -->
  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">
    <path d="${pathData}" fill="white" opacity="0.95"/>
  </g>
</svg>`.trim();
  }

  private createNeumorphicSvg(pathData: string, config: any, scale: number, originalViewBox: { width: number; height: number }): string {
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const offsetX = centerX - (originalViewBox.width * scale) / 2;
    const offsetY = centerY - (originalViewBox.height * scale) / 2;

    return `
<svg width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="neumorph" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="4" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.3)"/>
      <feDropShadow dx="-4" dy="-4" stdDeviation="6" flood-color="rgba(255,255,255,0.8)"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${config.width}" height="${config.height}" rx="${config.cornerRadius}" fill="#e0e0e0" filter="url(#neumorph)"/>
  
  <!-- Icon -->
  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">
    <path d="${pathData}" fill="${config.iconColor}"/>
  </g>
</svg>`.trim();
  }

  private createGlassmorphicSvg(pathData: string, config: any, scale: number, originalViewBox: { width: number; height: number }): string {
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const offsetX = centerX - (originalViewBox.width * scale) / 2;
    const offsetY = centerY - (originalViewBox.height * scale) / 2;

    return `
<svg width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glass" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
      <feOffset dx="0" dy="2" result="offset"/>
      <feFlood flood-color="rgba(0,0,0,0.1)"/>
      <feComposite in2="offset" operator="in"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${config.width}" height="${config.height}" rx="${config.cornerRadius}" 
        fill="rgba(255,255,255,0.2)" 
        stroke="rgba(255,255,255,0.3)" 
        stroke-width="1"
        filter="url(#glass)"/>
  
  <!-- Icon -->
  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">
    <path d="${pathData}" fill="${config.iconColor}" opacity="0.8"/>
  </g>
</svg>`.trim();
  }

  private createFlatDesignSvg(pathData: string, config: any, scale: number, originalViewBox: { width: number; height: number }): string {
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const offsetX = centerX - (originalViewBox.width * scale) / 2;
    const offsetY = centerY - (originalViewBox.height * scale) / 2;

    return `
<svg width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${config.width}" height="${config.height}" rx="${config.cornerRadius}" fill="#f8fafc" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
  
  <!-- Icon -->
  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">
    <path d="${pathData}" fill="${config.iconColor}"/>
  </g>
</svg>`.trim();
  }

  // Create mock File objects from SVG content
  private createMockSvgFile(name: string, content: string): File {
    const blob = new Blob([content], { type: 'image/svg+xml' });
    const file = new File([blob], name, { type: 'image/svg+xml' });
    // Add webkitRelativePath for consistency with FluentUI structure
    Object.defineProperty(file, 'webkitRelativePath', {
      value: `assets/MockIcon/SVG/${name}`,
      writable: false
    });
    return file;
  }

  // Mock data for development (replace with real file system access)
  private getMockFluentUIIcons(): FluentUIIcon[] {
    const addSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3.25C12.4142 3.25 12.75 3.58579 12.75 4V11.25H20C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75H12.75V20C12.75 20.4142 12.4142 20.75 12 20.75C11.5858 20.75 11.25 20.4142 11.25 20V12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H11.25V4C11.25 3.58579 11.5858 3.25 12 3.25Z" fill="#212121"/></svg>';
    const searchSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#212121"/></svg>';

    return [
      {
        name: 'Add',
        svgFiles: [this.createMockSvgFile('ic_fluent_add_24_regular.svg', addSvg)],
        sizes: [12, 16, 20, 24, 28, 32, 48],
        variants: ['regular', 'filled'],
        metadata: {
          name: 'Add',
          size: [12, 16, 20, 24, 28, 32, 48],
          style: ['Regular', 'Filled'],
          keyword: 'fluent-icon',
          description: 'Used for adding actions.',
          metaphor: ['plus', 'addition', 'new']
        },
        svgContent: {
          '24_regular': addSvg
        }
      },
      {
        name: 'Search',
        svgFiles: [this.createMockSvgFile('ic_fluent_search_24_regular.svg', searchSvg)],
        sizes: [12, 16, 20, 24, 28, 32, 48],
        variants: ['regular', 'filled'],
        metadata: {
          name: 'Search',
          size: [12, 16, 20, 24, 28, 32, 48],
          style: ['Regular', 'Filled'],
          keyword: 'fluent-icon',
          description: 'Used for search actions.',
          metaphor: ['find', 'lookup', 'magnifying glass']
        },
        svgContent: {
          '24_regular': searchSvg
        }
      }
    ];
  }

  private getMockIcon(iconName: string): FluentUIIcon | null {
    const icons = this.getMockFluentUIIcons();
    return icons.find(icon => icon.name.toLowerCase() === iconName.toLowerCase()) || null;
  }
}

export const fluentUIService = new FluentUIService();