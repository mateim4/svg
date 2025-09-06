// Real Icon Repository Parsers - No more mocks, uses actual GitHub data

import { IconRepository } from '../data/icon-repositories';
import { githubApiService, GitHubFile } from './githubApiService';
import { lucideService } from './lucideService';
import { heroiconsService } from './heroiconsService';
import { featherService } from './featherService';
import { phosphorService } from './phosphorService';

export interface ParsedIcon {
  id: string;
  name: string;
  displayName: string;
  category: string;
  tags: string[];
  repository: string;
  svgContent: string;
  fileName: string;
  path: string;
  size: number;
  downloadUrl: string;
}

export interface RepositoryParseResult {
  icons: ParsedIcon[];
  totalCount: number;
  repository: IconRepository;
  sourceUrl: string;
}

export interface RepositoryParser {
  parse(repository: IconRepository, githubUrl: string): Promise<RepositoryParseResult>;
}

// Real GitHub SVG Parser - fetches actual SVG files from GitHub
export class GitHubSvgParser implements RepositoryParser {
  async parse(repository: IconRepository, githubUrl: string): Promise<RepositoryParseResult> {
    try {
      console.log(`Parsing real GitHub repository: ${githubUrl}`);
      
      // Parse GitHub URL
      const { owner, repo, ref } = githubApiService.parseGitHubUrl(githubUrl);
      
      // Fetch all SVG files from the repository
      const svgFiles = await githubApiService.getAllSvgFiles(owner, repo, ref);
      
      if (svgFiles.length === 0) {
        throw new Error('No SVG files found in repository');
      }

      console.log(`Found ${svgFiles.length} SVG files in ${owner}/${repo}`);
      
      // Convert GitHub files to parsed icons
      const icons: ParsedIcon[] = [];
      
      for (const file of svgFiles) {
        try {
          const icon: ParsedIcon = {
            id: `${repository.id}-${file.sha}`,
            name: this.extractIconName(file.name),
            displayName: this.formatDisplayName(file.name),
            category: this.determineCategory(file.path, repository.categories),
            tags: this.generateTags(file.name, file.path, repository.tags),
            repository: repository.id,
            svgContent: '', // Will be loaded on demand
            fileName: file.name,
            path: file.path,
            size: file.size,
            downloadUrl: file.download_url || ''
          };
          
          icons.push(icon);
        } catch (error) {
          console.warn(`Failed to process file ${file.name}:`, error);
        }
      }

      return {
        icons,
        totalCount: icons.length,
        repository,
        sourceUrl: githubUrl
      };
    } catch (error) {
      console.error('Error parsing GitHub repository:', error);
      throw error;
    }
  }

  private extractIconName(fileName: string): string {
    // Remove .svg extension and clean up name
    return fileName.replace(/\.svg$/i, '').toLowerCase();
  }

  private formatDisplayName(fileName: string): string {
    const name = this.extractIconName(fileName);
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private determineCategory(filePath: string, availableCategories: string[]): string {
    const pathLower = filePath.toLowerCase();
    
    // Try to determine category from file path
    for (const category of availableCategories) {
      if (pathLower.includes(category.toLowerCase())) {
        return category;
      }
    }
    
    // Default to first available category
    return availableCategories[0] || 'General';
  }

  private generateTags(fileName: string, filePath: string, baseTags: string[]): string[] {
    const tags = [...baseTags];
    
    // Add tags based on filename
    const name = this.extractIconName(fileName);
    tags.push(name);
    
    // Add tags based on path segments
    const pathSegments = filePath.split('/').filter(segment => 
      segment && segment !== fileName && !segment.includes('.')
    );
    tags.push(...pathSegments);
    
    return Array.from(new Set(tags)); // Remove duplicates
  }
}

// FluentUI System Icons Parser - handles Microsoft's specific structure
export class FluentSystemIconsParser extends GitHubSvgParser implements RepositoryParser {
  async parse(repository: IconRepository, githubUrl: string): Promise<RepositoryParseResult> {
    try {
      console.log('Parsing real FluentUI System Icons repository...');
      
      const result = await super.parse(repository, githubUrl);
      
      // Filter and categorize FluentUI icons based on their actual naming convention
      const fluentIcons = result.icons.map(icon => ({
        ...icon,
        category: this.categorizeFluentIcon(icon.fileName),
        tags: this.generateFluentTags(icon.fileName, icon.path)
      }));

      console.log(`Processed ${fluentIcons.length} FluentUI icons`);

      return {
        ...result,
        icons: fluentIcons
      };
    } catch (error) {
      console.error('Error parsing FluentUI repository:', error);
      throw error;
    }
  }

  private categorizeFluentIcon(fileName: string): string {
    const name = fileName.toLowerCase();
    
    // Categorize based on FluentUI icon patterns
    if (name.includes('arrow') || name.includes('chevron')) return 'Navigation';
    if (name.includes('person') || name.includes('people') || name.includes('contact')) return 'People';
    if (name.includes('document') || name.includes('file') || name.includes('folder')) return 'Files';
    if (name.includes('calendar') || name.includes('clock') || name.includes('time')) return 'Time';
    if (name.includes('mail') || name.includes('chat') || name.includes('call')) return 'Communication';
    if (name.includes('settings') || name.includes('gear') || name.includes('options')) return 'Settings';
    if (name.includes('home') || name.includes('building') || name.includes('location')) return 'Places';
    if (name.includes('star') || name.includes('heart') || name.includes('bookmark')) return 'Favorites';
    
    return 'General';
  }

  private generateFluentTags(fileName: string, filePath: string): string[] {
    const tags = ['fluent', 'microsoft', 'system'];
    const name = fileName.toLowerCase().replace(/\.svg$/i, '');
    
    // Parse FluentUI naming convention: ic_fluent_[name]_[size]_[variant]
    const fluentMatch = name.match(/^ic_fluent_(.+)_(\d+)_(regular|filled|light)$/);
    if (fluentMatch) {
      const [, iconName, size, variant] = fluentMatch;
      tags.push(iconName, variant, `size-${size}`);
      
      // Add semantic tags based on icon name
      const semanticTags = iconName.split('_');
      tags.push(...semanticTags);
    } else {
      // Fallback for non-standard names
      const parts = name.split(/[-_]/);
      tags.push(...parts);
    }
    
    return Array.from(new Set(tags));
  }
}

// Tabler Icons Parser - handles specific structure
export class TablerIconsParser extends GitHubSvgParser implements RepositoryParser {
  async parse(repository: IconRepository, githubUrl: string): Promise<RepositoryParseResult> {
    const result = await super.parse(repository, githubUrl);
    
    // Filter to only icons from the icons/ directory
    const tablerIcons = result.icons.filter(icon => 
      icon.path.startsWith('icons/') && icon.path.endsWith('.svg')
    );

    return {
      ...result,
      icons: tablerIcons,
      totalCount: tablerIcons.length
    };
  }
}

// Heroicons Parser - Uses Official Heroicons Service  
export class HeroiconsParser implements RepositoryParser {
  async parse(repository: IconRepository, githubUrl: string): Promise<RepositoryParseResult> {
    try {
      console.log('Parsing Heroicons using official service...');
      
      // Get icons from our dedicated Heroicons service
      const heroiconsIcons = heroiconsService.getAvailableIcons();
      
      // Convert Heroicons to ParsedIcon format
      const icons: ParsedIcon[] = [];
      
      for (const heroIcon of heroiconsIcons) {
        // Create variants for each icon (outline, solid, mini)
        for (const variant of heroIcon.variants) {
          for (const size of heroIcon.sizes) {
            try {
              const icon: ParsedIcon = {
                id: `heroicons-${heroIcon.name}-${variant}-${size}`,
                name: `${heroIcon.name}-${variant}`,
                displayName: `${heroIcon.displayName} (${variant})`,
                category: heroIcon.categories[0] || 'General',
                tags: [...heroIcon.tags, variant, `size-${size}`],
                repository: repository.id,
                svgContent: '', // Will be loaded on demand via heroiconsService
                fileName: `${heroIcon.name}-${variant}-${size}.svg`,
                path: `optimized/${size}/${variant}/${heroIcon.name}.svg`,
                size: 0, // SVG size not applicable for generated icons
                downloadUrl: '' // Generated icons don't have download URLs
              };
              
              icons.push(icon);
            } catch (error) {
              console.warn(`Failed to process Heroicons ${heroIcon.name} variant ${variant}:`, error);
            }
          }
        }
      }

      console.log(`Generated ${icons.length} Heroicons variants using official service`);

      return {
        icons,
        totalCount: icons.length,
        repository,
        sourceUrl: githubUrl
      };
    } catch (error) {
      console.error('Error parsing Heroicons repository with official service:', error);
      throw error;
    }
  }
}

// Feather Icons Parser - Uses Official Feather Service  
export class FeatherIconsParser implements RepositoryParser {
  async parse(repository: IconRepository, githubUrl: string): Promise<RepositoryParseResult> {
    try {
      console.log('Parsing Feather icons using official service...');
      
      // Get icons from our dedicated Feather service
      const featherIcons = featherService.getAvailableIcons();
      
      // Convert Feather icons to ParsedIcon format
      const icons: ParsedIcon[] = [];
      
      for (const featherIcon of featherIcons) {
        try {
          const icon: ParsedIcon = {
            id: `feather-${featherIcon.name}`,
            name: featherIcon.name,
            displayName: featherIcon.displayName,
            category: featherIcon.categories[0] || 'General',
            tags: featherIcon.tags,
            repository: repository.id,
            svgContent: '', // Will be loaded on demand via featherService
            fileName: `${featherIcon.name}.svg`,
            path: `icons/${featherIcon.name}.svg`,
            size: 0, // SVG size not applicable for generated icons
            downloadUrl: '' // Generated icons don't have download URLs
          };
          
          icons.push(icon);
        } catch (error) {
          console.warn(`Failed to process Feather icon ${featherIcon.name}:`, error);
        }
      }

      console.log(`Generated ${icons.length} Feather icons using official service`);

      return {
        icons,
        totalCount: icons.length,
        repository,
        sourceUrl: githubUrl
      };
    } catch (error) {
      console.error('Error parsing Feather repository with official service:', error);
      throw error;
    }
  }
}

// Phosphor Icons Parser - Uses Official Phosphor Service  
export class PhosphorIconsParser implements RepositoryParser {
  async parse(repository: IconRepository, githubUrl: string): Promise<RepositoryParseResult> {
    try {
      console.log('Parsing Phosphor icons using official service...');
      
      // Get icons from our dedicated Phosphor service
      const phosphorIcons = phosphorService.getAvailableIcons();
      
      // Convert Phosphor icons to ParsedIcon format
      const icons: ParsedIcon[] = [];
      
      for (const phosphorIcon of phosphorIcons) {
        // Create variants for each icon weight
        for (const weight of phosphorIcon.weights) {
          try {
            const icon: ParsedIcon = {
              id: `phosphor-${phosphorIcon.name}-${weight}`,
              name: `${phosphorIcon.name}-${weight}`,
              displayName: `${phosphorIcon.displayName} (${weight})`,
              category: phosphorIcon.categories[0] || 'General',
              tags: [...phosphorIcon.tags, weight],
              repository: repository.id,
              svgContent: '', // Will be loaded on demand via phosphorService
              fileName: `${phosphorIcon.name}-${weight}.svg`,
              path: `assets/${weight}/${phosphorIcon.name}-${weight}.svg`,
              size: 0, // SVG size not applicable for generated icons
              downloadUrl: '' // Generated icons don't have download URLs
            };
            
            icons.push(icon);
          } catch (error) {
            console.warn(`Failed to process Phosphor icon ${phosphorIcon.name} weight ${weight}:`, error);
          }
        }
      }

      console.log(`Generated ${icons.length} Phosphor icon variants using official service`);

      return {
        icons,
        totalCount: icons.length,
        repository,
        sourceUrl: githubUrl
      };
    } catch (error) {
      console.error('Error parsing Phosphor repository with official service:', error);
      throw error;
    }
  }
}

// Lucide Icons Parser - Uses Official Lucide Service
export class LucideIconsParser implements RepositoryParser {
  async parse(repository: IconRepository, githubUrl: string): Promise<RepositoryParseResult> {
    try {
      console.log('Parsing Lucide icons using official service...');
      
      // Get icons from our dedicated Lucide service
      const lucideIcons = lucideService.getAvailableIcons();
      
      // Convert Lucide icons to ParsedIcon format
      const icons: ParsedIcon[] = [];
      
      for (const lucideIcon of lucideIcons) {
        try {
          const icon: ParsedIcon = {
            id: `lucide-${lucideIcon.name}`,
            name: lucideIcon.name,
            displayName: lucideIcon.displayName,
            category: lucideIcon.categories[0] || 'General',
            tags: lucideIcon.tags,
            repository: repository.id,
            svgContent: '', // Will be loaded on demand via lucideService
            fileName: `${lucideIcon.name}.svg`,
            path: `icons/${lucideIcon.name}.svg`,
            size: 0, // SVG size not applicable for generated icons
            downloadUrl: '' // Generated icons don't have download URLs
          };
          
          icons.push(icon);
        } catch (error) {
          console.warn(`Failed to process Lucide icon ${lucideIcon.name}:`, error);
        }
      }

      console.log(`Generated ${icons.length} Lucide icons using official service`);

      return {
        icons,
        totalCount: icons.length,
        repository,
        sourceUrl: githubUrl
      };
    } catch (error) {
      console.error('Error parsing Lucide repository with official service:', error);
      throw error;
    }
  }
}

// Parser Factory
export class RepositoryParserFactory {
  static createParser(repository: IconRepository): RepositoryParser {
    switch (repository.id) {
      case 'fluent-system-icons':
        return new FluentSystemIconsParser();
      case 'tabler-icons':
        return new TablerIconsParser();
      case 'lucide':
        return new LucideIconsParser();
      case 'heroicons':
        return new HeroiconsParser();
      case 'feather':
        return new FeatherIconsParser();
      case 'phosphor':
        return new PhosphorIconsParser();
      default:
        return new GitHubSvgParser();
    }
  }
}