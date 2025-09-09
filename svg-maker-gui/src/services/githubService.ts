import { Octokit } from '@octokit/rest';

export interface RepoInfo {
  owner: string;
  repo: string;
  branch: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
  size?: number;
  sha: string;
}

export interface FolderTree {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FolderTree[];
  download_url?: string;
  size?: number;
  sha: string;
}

export interface SVGFile {
  name: string;
  path: string;
  content: string;
  download_url: string;
  size: number;
  relativePath: string; // Path relative to repo root
}

class GitHubService {
  private octokit: Octokit;

  constructor() {
    // Initialize with optional auth for better rate limits
    // Check for GitHub token in environment variables
    const githubToken = process.env.REACT_APP_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    
    this.octokit = new Octokit({
      auth: githubToken, // Use token if available for higher rate limits (5000/hour vs 60/hour)
    });
    
    if (!githubToken) {
      console.warn('🚨 GitHub Service: No auth token found. Rate limited to 60 requests/hour. Add REACT_APP_GITHUB_TOKEN to .env.local for 5000 requests/hour.');
    } else {
      console.log('✅ GitHub Service: Authenticated with token for higher rate limits.');
    }
  }

  /**
   * Get repository contents recursively to build a folder tree
   */
  async getRepoTree(repoInfo: RepoInfo): Promise<FolderTree[]> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        path: '',
        ref: repoInfo.branch,
      });

      if (!Array.isArray(data)) {
        throw new Error('Repository root is not a directory');
      }

      const tree = await this.buildFolderTree(repoInfo, data as any[], '');
      return tree;
    } catch (error) {
      throw this.handleGitHubError(error);
    }
  }

  /**
   * Recursively build folder tree structure
   */
  private async buildFolderTree(
    repoInfo: RepoInfo,
    items: any[],
    basePath: string
  ): Promise<FolderTree[]> {
    const tree: FolderTree[] = [];

    for (const item of items) {
      if (item.type === 'file' || item.type === 'dir') {
        const treeItem: FolderTree = {
          name: item.name,
          path: item.path,
          type: item.type,
          download_url: item.download_url,
          size: item.size,
          sha: item.sha,
        };

        if (item.type === 'dir') {
          // Recursively get folder contents
          try {
            const { data: folderContents } = await this.octokit.rest.repos.getContent({
              owner: repoInfo.owner,
              repo: repoInfo.repo,
              path: item.path,
              ref: repoInfo.branch,
            });

            if (Array.isArray(folderContents)) {
              treeItem.children = await this.buildFolderTree(
                repoInfo,
                folderContents as any[],
                item.path
              );
            }
          } catch (error) {
            console.warn(`Failed to load folder: ${item.path}`, error);
            treeItem.children = [];
          }
        }

        tree.push(treeItem);
      }
    }

    return tree;
  }

  /**
   * Find all SVG files in the repository tree
   */
  findSvgFiles(tree: FolderTree[]): GitHubFile[] {
    const svgFiles: GitHubFile[] = [];

    const traverse = (items: FolderTree[]) => {
      for (const item of items) {
        if (item.type === 'file' && item.name.toLowerCase().endsWith('.svg')) {
          svgFiles.push({
            name: item.name,
            path: item.path,
            type: 'file',
            download_url: item.download_url,
            size: item.size,
            sha: item.sha,
          });
        } else if (item.type === 'dir' && item.children) {
          traverse(item.children);
        }
      }
    };

    traverse(tree);
    return svgFiles;
  }

  /**
   * Find all potential icon files (including non-SVG formats like JSON, XML, etc.)
   */
  findIconFiles(tree: FolderTree[]): GitHubFile[] {
    const iconFiles: GitHubFile[] = [];
    
    // Common icon file extensions and patterns
    const iconExtensions = ['.svg', '.json', '.xml', '.ai', '.eps', '.pdf'];
    const iconPatterns = [
      /icons?/i,
      /fluent/i,
      /fluentui/i,
      /system/i,
      /assets/i,
      /packages\/svg-icons/i,
      /packages\/[^/]*icons/i,
      /src\/icons/i,
      /svg/i
    ];

    const traverse = (items: FolderTree[]) => {
      for (const item of items) {
        if (item.type === 'file') {
          const fileName = item.name.toLowerCase();
          const isIconExtension = iconExtensions.some(ext => fileName.endsWith(ext));
          const isInIconPath = iconPatterns.some(pattern => item.path.toLowerCase().match(pattern));
          
          if (isIconExtension || isInIconPath) {
            iconFiles.push({
              name: item.name,
              path: item.path,
              type: 'file',
              download_url: item.download_url,
              size: item.size,
              sha: item.sha,
            });
          }
        } else if (item.type === 'dir' && item.children) {
          traverse(item.children);
        }
      }
    };

    traverse(tree);
    return iconFiles;
  }

  /**
   * Analyze repository structure to detect icon format
   */
  analyzeIconStructure(tree: FolderTree[]): {
    hasDirectSvgs: boolean;
    hasPackageJsons: boolean;
    hasAssetsFolders: boolean;
    hasIconManifests: boolean;
    suggestedFormat: 'svg' | 'fluent-package' | 'assets-based' | 'unknown';
    iconFiles: GitHubFile[];
  } {
    const svgFiles = this.findSvgFiles(tree);
    const iconFiles = this.findIconFiles(tree);
    
    let hasPackageJsons = false;
    let hasAssetsFolders = false;
    let hasIconManifests = false;
    let hasFluentStructure = false;
    
    const traverse = (items: FolderTree[]) => {
      for (const item of items) {
        if (item.type === 'file') {
          if (item.name === 'package.json') hasPackageJsons = true;
          if (item.name.includes('manifest') || item.name.includes('metadata')) hasIconManifests = true;
          // Check for Fluent UI specific files
          if (item.name.includes('fluent') || item.name.includes('fluentui')) hasFluentStructure = true;
        } else if (item.type === 'dir') {
          if (item.name.toLowerCase().includes('asset')) hasAssetsFolders = true;
          // Check for Fluent UI specific directories
          if (item.name.toLowerCase().includes('fluent') || 
              item.name.toLowerCase().includes('svg-icons') || 
              item.name.toLowerCase().includes('system-icons')) {
            hasFluentStructure = true;
          }
          if (item.children) traverse(item.children);
        }
      }
    };
    
    traverse(tree);
    
    let suggestedFormat: 'svg' | 'fluent-package' | 'assets-based' | 'unknown' = 'unknown';
    
    if (svgFiles.length > 0) {
      suggestedFormat = 'svg';
    } else if ((hasPackageJsons && hasIconManifests) || hasFluentStructure || iconFiles.some(f => f.path.toLowerCase().includes('fluent'))) {
      suggestedFormat = 'fluent-package';
    } else if (hasAssetsFolders) {
      suggestedFormat = 'assets-based';
    }
    
    return {
      hasDirectSvgs: svgFiles.length > 0,
      hasPackageJsons,
      hasAssetsFolders,
      hasIconManifests,
      suggestedFormat,
      iconFiles
    };
  }

  /**
   * Download SVG file content
   */
  async downloadSvgContent(file: GitHubFile): Promise<string> {
    if (!file.download_url) {
      throw new Error(`No download URL for file: ${file.name}`);
    }

    try {
      const response = await fetch(file.download_url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to download ${file.name}: ${error}`);
    }
  }

  /**
   * Try to extract SVG content from various file formats
   */
  async extractSvgContent(file: GitHubFile): Promise<string | null> {
    if (!file.download_url) {
      return null;
    }

    try {
      const response = await fetch(file.download_url);
      if (!response.ok) {
        return null;
      }

      const content = await response.text();
      const fileName = file.name.toLowerCase();

      // Direct SVG file
      if (fileName.endsWith('.svg')) {
        return content;
      }

      // Try to extract SVG from JSON (common in icon libraries)
      if (fileName.endsWith('.json')) {
        try {
          const jsonData = JSON.parse(content);
          
          // Check for common SVG properties in JSON
          if (typeof jsonData === 'object') {
            // FluentUI format: { "svg": "<svg>...</svg>" }
            if (jsonData.svg && typeof jsonData.svg === 'string') {
              return jsonData.svg;
            }
            
            // FluentUI filled/regular format: { "16": { "filled": "<svg>...</svg>" } }
            if (typeof jsonData === 'object') {
              for (const [, value] of Object.entries(jsonData)) {
                if (typeof value === 'object' && value !== null) {
                  const sizeObj = value as any;
                  if (sizeObj.filled && typeof sizeObj.filled === 'string' && sizeObj.filled.includes('<svg')) {
                    return sizeObj.filled;
                  }
                  if (sizeObj.regular && typeof sizeObj.regular === 'string' && sizeObj.regular.includes('<svg')) {
                    return sizeObj.regular;
                  }
                }
              }
            }
            
            // Icon data format: { "data": "<path d='...'>" }
            if (jsonData.data && typeof jsonData.data === 'string') {
              // Wrap path data in SVG
              return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="${jsonData.data}" />
</svg>`;
            }
            
            // Path format: { "path": "M12 2l3.09..." }
            if (jsonData.path && typeof jsonData.path === 'string') {
              return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="${jsonData.path}" />
</svg>`;
            }
          }
        } catch (jsonError) {
          // Not valid JSON, continue
        }
      }

      // Try to extract SVG from XML
      if (fileName.endsWith('.xml')) {
        // Check if it contains SVG content
        if (content.includes('<svg') || content.includes('<path')) {
          return content;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get enhanced file list including potential SVG extractions
   */
  async getEnhancedIconFiles(tree: FolderTree[], analysis: ReturnType<typeof this.analyzeIconStructure>): Promise<GitHubFile[]> {
    const enhancedFiles: GitHubFile[] = [];
    
    // First add direct SVG files
    const svgFiles = this.findSvgFiles(tree);
    enhancedFiles.push(...svgFiles);
    
    // If no direct SVGs found but we have icon files, try to extract SVG content
    if (svgFiles.length === 0 && analysis.iconFiles.length > 0) {
      console.log('No direct SVG files found, attempting to extract from other formats...');
      
      for (const iconFile of analysis.iconFiles.slice(0, 20)) { // Limit to avoid rate limits
        try {
          const extractedSvg = await this.extractSvgContent(iconFile);
          if (extractedSvg) {
            // Create a virtual SVG file
            enhancedFiles.push({
              ...iconFile,
              name: iconFile.name.replace(/\.(json|xml)$/, '.svg'),
              path: iconFile.path.replace(/\.(json|xml)$/, '.svg')
            });
          }
        } catch (error) {
          console.warn(`Failed to extract SVG from ${iconFile.name}:`, error);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return enhancedFiles;
  }

  /**
   * Download multiple SVG files with progress tracking
   */
  async downloadSvgFiles(
    files: GitHubFile[],
    onProgress?: (completed: number, total: number, currentFile: string) => void
  ): Promise<SVGFile[]> {
    const svgFiles: SVGFile[] = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        onProgress?.(i, total, file.name);
        
        // Try to get content (either direct SVG or extracted)
        let content: string;
        
        if (file.name.toLowerCase().endsWith('.svg')) {
          content = await this.downloadSvgContent(file);
        } else {
          // Try to extract SVG content from other formats
          const extracted = await this.extractSvgContent(file);
          if (extracted) {
            content = extracted;
          } else {
            console.warn(`Could not extract SVG content from ${file.name}`);
            continue;
          }
        }
        
        svgFiles.push({
          name: file.name,
          path: file.path,
          content,
          download_url: file.download_url!,
          size: file.size || 0,
          relativePath: file.path,
        });
        
        // Small delay to avoid rate limiting
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn(`Failed to download ${file.name}:`, error);
        // Continue with other files instead of failing completely
      }
    }

    onProgress?.(total, total, 'Complete');
    return svgFiles;
  }

  /**
   * Get repository information
   */
  async getRepoInfo(repoInfo: RepoInfo) {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
      });
      
      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        stars: data.stargazers_count,
        language: data.language,
        url: data.html_url,
        defaultBranch: data.default_branch,
      };
    } catch (error) {
      throw this.handleGitHubError(error);
    }
  }

  /**
   * Check if a branch exists in the repository
   */
  async checkBranch(repoInfo: RepoInfo): Promise<boolean> {
    try {
      await this.octokit.rest.repos.getBranch({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        branch: repoInfo.branch,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available branches for the repository
   */
  async getBranches(repoInfo: RepoInfo): Promise<string[]> {
    try {
      const { data } = await this.octokit.rest.repos.listBranches({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
      });
      
      return data.map(branch => branch.name);
    } catch (error) {
      throw this.handleGitHubError(error);
    }
  }

  /**
   * Handle GitHub API errors with user-friendly messages
   */
  private handleGitHubError(error: any): Error {
    if (error.status === 404) {
      return new Error('Repository not found. Please check the owner/repo name and ensure it\'s public.');
    }
    if (error.status === 403) {
      // Check if it's rate limiting or access issue
      if (error.message?.includes('rate limit') || error.headers?.['x-ratelimit-remaining'] === '0') {
        return new Error('GitHub API rate limit exceeded. Please wait a few minutes before trying again, or add a GitHub token for higher limits.');
      }
      return new Error('Access denied. The repository may be private, or you need authentication for higher API limits.');
    }
    if (error.status === 422) {
      return new Error('Invalid repository or branch name.');
    }
    if (error.status === 401) {
      return new Error('Authentication required. The repository may be private.');
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new Error('Network error. Please check your internet connection.');
    }
    
    return new Error(error.message || 'Failed to access GitHub repository. Please try again later.');
  }
}

export default new GitHubService();