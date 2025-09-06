// Icon Repository Service - Uses Real GitHub API Integration
import { IconRepository, ICON_REPOSITORIES } from '../data/icon-repositories';
import { ParsedIcon, RepositoryParserFactory } from './iconRepositoryParsers';

export interface RepositorySource {
  id: string;
  type: 'local' | 'external';
  repository: IconRepository;
  isAvailableOffline: boolean;
  lastUpdated?: Date;
  downloadSize?: string;
  status: 'ready' | 'loading' | 'error';
}

export interface IconSearchResult {
  icons: ParsedIcon[];
  totalCount: number;
  repository: RepositorySource;
}

class IconRepositoryService {
  private repositories: Map<string, RepositorySource> = new Map();
  private cachedIcons: Map<string, ParsedIcon[]> = new Map();

  constructor() {
    this.initializeRepositories();
  }

  /**
   * Initialize available repositories (built-in GitHub repositories)
   */
  private initializeRepositories() {
    ICON_REPOSITORIES.forEach(repo => {
      const source: RepositorySource = {
        id: repo.id,
        type: 'local', // Built-in repositories (even though they use GitHub API)
        repository: repo,
        isAvailableOffline: false, // They require internet for GitHub API
        downloadSize: this.estimateDownloadSize(repo.iconCount),
        status: 'ready'
      };
      
      this.repositories.set(repo.id, source);
    });
  }

  /**
   * Get all available repository sources
   */
  async getAvailableRepositories(): Promise<RepositorySource[]> {
    const sources = Array.from(this.repositories.values());
    
    // Sort by name
    return sources.sort((a, b) => 
      a.repository.name.localeCompare(b.repository.name)
    );
  }

  /**
   * Get repository by ID
   */
  getRepository(id: string): RepositorySource | undefined {
    return this.repositories.get(id);
  }

  /**
   * Load icons from a repository using real GitHub API
   */
  async loadRepositoryIcons(repositoryId: string): Promise<IconSearchResult> {
    const source = this.repositories.get(repositoryId);
    
    if (!source) {
      throw new Error(`Repository ${repositoryId} not found`);
    }

    // Check cache first
    if (this.cachedIcons.has(repositoryId)) {
      return {
        icons: this.cachedIcons.get(repositoryId)!,
        totalCount: this.cachedIcons.get(repositoryId)!.length,
        repository: source
      };
    }

    source.status = 'loading';

    try {
      // Use real GitHub API to load icons
      const parser = RepositoryParserFactory.createParser(source.repository);
      const result = await parser.parse(source.repository, source.repository.githubUrl);
      
      // Only limit external repositories, not built-in icon packs
      const isBuiltInRepository = ICON_REPOSITORIES.some(repo => repo.id === repositoryId);
      const maxIcons = isBuiltInRepository ? Infinity : 200; // No limit for built-in packs
      const limitedIcons = result.totalCount > maxIcons 
        ? result.icons.slice(0, maxIcons)
        : result.icons;
      
      // Cache the results (limited set only for external repos)
      this.cachedIcons.set(repositoryId, limitedIcons);
      source.status = 'ready';
      source.lastUpdated = new Date();

      // Update the repository's icon count with real data but note if limited
      source.repository.iconCount = result.totalCount;

      return {
        icons: limitedIcons,
        totalCount: result.totalCount,
        repository: source
      };

    } catch (error) {
      source.status = 'error';
      console.error(`Failed to load repository ${repositoryId}:`, error);
      throw error;
    }
  }

  /**
   * Search icons across repositories
   */
  async searchIcons(query: string, repositoryIds?: string[]): Promise<IconSearchResult[]> {
    const repositories = repositoryIds 
      ? repositoryIds.map(id => this.repositories.get(id)).filter(Boolean) as RepositorySource[]
      : Array.from(this.repositories.values());

    const results: IconSearchResult[] = [];

    for (const repository of repositories) {
      try {
        const { icons } = await this.loadRepositoryIcons(repository.id);
        const filteredIcons = icons.filter(icon => 
          icon.name.includes(query.toLowerCase()) ||
          icon.displayName.toLowerCase().includes(query.toLowerCase()) ||
          icon.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        if (filteredIcons.length > 0) {
          results.push({
            icons: filteredIcons,
            totalCount: filteredIcons.length,
            repository
          });
        }
      } catch (error) {
        console.warn(`Failed to search in repository ${repository.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Add external repository from GitHub URL
   */
  async addExternalRepository(githubUrl: string): Promise<RepositorySource> {
    // Parse GitHub URL
    const repoInfo = this.parseGitHubUrl(githubUrl);
    
    // Create external repository source
    const externalRepo: IconRepository = {
      id: `external-${repoInfo.owner}-${repoInfo.repo}`,
      name: `${repoInfo.owner}/${repoInfo.repo}`,
      description: 'External GitHub repository',
      githubUrl,
      license: 'Unknown',
      iconCount: 0, // Will be determined after analysis
      categories: ['External'],
      parserType: 'direct-svg',
      structure: {
        iconPath: '',
        pattern: '*.svg'
      },
      tags: ['external'],
      preview: []
    };

    const source: RepositorySource = {
      id: externalRepo.id,
      type: 'external',
      repository: externalRepo,
      isAvailableOffline: false,
      status: 'loading'
    };

    this.repositories.set(externalRepo.id, source);
    
    // Try to analyze the repository structure
    try {
      await this.loadRepositoryIcons(source.id);
    } catch (error) {
      console.warn('Failed to analyze external repository:', error);
      source.status = 'error';
    }
    
    return source;
  }

  /**
   * Get SVG content for a specific icon (loads on demand)
   */
  async getIconSvgContent(repositoryId: string, iconId: string): Promise<string> {
    const source = this.repositories.get(repositoryId);
    if (!source) {
      throw new Error(`Repository ${repositoryId} not found`);
    }

    // Get the icon from cache or load repository
    let icons = this.cachedIcons.get(repositoryId);
    if (!icons) {
      const result = await this.loadRepositoryIcons(repositoryId);
      icons = result.icons;
    }

    const icon = icons.find(i => i.id === iconId);
    if (!icon) {
      throw new Error(`Icon ${iconId} not found in repository ${repositoryId}`);
    }

    // If SVG content is already loaded, return it
    if (icon.svgContent) {
      return icon.svgContent;
    }

    // Handle icons from dedicated services (like Lucide and Heroicons)
    if (repositoryId === 'lucide' && !icon.downloadUrl) {
      try {
        const { lucideService } = await import('./lucideService');
        const svgContent = await lucideService.getIconSvg(icon.name, 24);
        
        if (svgContent) {
          // Cache the content
          icon.svgContent = svgContent;
          return svgContent;
        }
      } catch (error) {
        console.error(`Failed to load Lucide icon ${iconId}:`, error);
      }
    }

    if (repositoryId === 'heroicons' && !icon.downloadUrl) {
      try {
        const { heroiconsService } = await import('./heroiconsService');
        
        // Parse Heroicons name format: icon-name-variant
        const parts = icon.name.split('-');
        const variant = parts.pop() as 'outline' | 'solid' | 'mini'; // Last part is variant
        const iconName = parts.join('-'); // Rejoin remaining parts as icon name
        
        const svgContent = await heroiconsService.getIconSvg(iconName, 24, variant);
        
        if (svgContent) {
          // Cache the content
          icon.svgContent = svgContent;
          return svgContent;
        }
      } catch (error) {
        console.error(`Failed to load Heroicons icon ${iconId}:`, error);
      }
    }

    if (repositoryId === 'feather' && !icon.downloadUrl) {
      try {
        const { featherService } = await import('./featherService');
        
        const svgContent = await featherService.getIconSvg(icon.name, 24);
        
        if (svgContent) {
          // Cache the content
          icon.svgContent = svgContent;
          return svgContent;
        }
      } catch (error) {
        console.error(`Failed to load Feather icon ${iconId}:`, error);
      }
    }

    if (repositoryId === 'phosphor' && !icon.downloadUrl) {
      try {
        const { phosphorService } = await import('./phosphorService');
        
        // Parse Phosphor name format: icon-name-weight
        const parts = icon.name.split('-');
        const weight = parts.pop() as 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'; // Last part is weight
        const iconName = parts.join('-'); // Rejoin remaining parts as icon name
        
        const svgContent = await phosphorService.getIconSvg(iconName, 32, weight);
        
        if (svgContent) {
          // Cache the content
          icon.svgContent = svgContent;
          return svgContent;
        }
      } catch (error) {
        console.error(`Failed to load Phosphor icon ${iconId}:`, error);
      }
    }

    // Load SVG content from GitHub
    if (icon.downloadUrl) {
      try {
        const response = await fetch(icon.downloadUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.statusText}`);
        }
        const svgContent = await response.text();
        
        // Cache the content
        icon.svgContent = svgContent;
        
        return svgContent;
      } catch (error) {
        console.error(`Failed to load SVG content for ${iconId}:`, error);
        throw error;
      }
    }

    throw new Error(`No download URL or service available for icon ${iconId}`);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cachedIcons.clear();
    // Reset all repository statuses
    this.repositories.forEach(source => {
      if (source.status !== 'error') {
        source.status = 'ready';
      }
    });
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    
    return {
      owner: match[1],
      repo: match[2].replace('.git', '')
    };
  }

  private estimateDownloadSize(iconCount: number): string {
    // Rough estimate: average 2KB per SVG icon
    const sizeKB = iconCount * 2;
    if (sizeKB < 1024) {
      return `${sizeKB}KB`;
    }
    return `${(sizeKB / 1024).toFixed(1)}MB`;
  }
}

// Export singleton instance
export const iconRepositoryService = new IconRepositoryService();
export default iconRepositoryService;