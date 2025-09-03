// Real Icon Repository Parsers - No more mocks, uses actual GitHub data

import { IconRepository } from '../data/icon-repositories';
import { githubApiService, GitHubFile } from './githubApiService';

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

// Lucide Icons Parser
export class LucideIconsParser extends GitHubSvgParser implements RepositoryParser {
  async parse(repository: IconRepository, githubUrl: string): Promise<RepositoryParseResult> {
    const result = await super.parse(repository, githubUrl);
    
    // Filter to only icons from the icons/ directory
    const lucideIcons = result.icons.filter(icon => 
      icon.path.startsWith('icons/') && icon.path.endsWith('.svg')
    );

    return {
      ...result,
      icons: lucideIcons,
      totalCount: lucideIcons.length
    };
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
      default:
        return new GitHubSvgParser();
    }
  }
}