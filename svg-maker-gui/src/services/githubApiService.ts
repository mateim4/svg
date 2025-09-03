// Real GitHub API Service - No more mocks
export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  default_branch: string;
  description: string;
  html_url: string;
}

class GitHubApiService {
  private baseUrl = 'https://api.github.com';
  private cache = new Map<string, any>();
  
  // Rate limiting
  private rateLimitRemaining = 60;
  private rateLimitReset = 0;

  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    const cacheKey = `${url}${JSON.stringify(options?.headers || {})}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      // Cache for 5 minutes
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    // Check rate limiting
    if (this.rateLimitRemaining <= 1 && Date.now() < this.rateLimitReset * 1000) {
      throw new Error(`GitHub API rate limit exceeded. Resets at ${new Date(this.rateLimitReset * 1000)}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SVGMaker-App',
          ...options?.headers,
        },
      });

      // Update rate limiting info
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const reset = response.headers.get('X-RateLimit-Reset');
      if (remaining) this.rateLimitRemaining = parseInt(remaining);
      if (reset) this.rateLimitReset = parseInt(reset);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or not accessible');
        }
        if (response.status === 403) {
          const resetTime = new Date(this.rateLimitReset * 1000);
          throw new Error(`GitHub API rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}`);
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('GitHub API request failed:', error);
      throw error;
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    return this.makeRequest<GitHubRepo>(`${this.baseUrl}/repos/${owner}/${repo}`);
  }

  async getRepositoryTree(owner: string, repo: string, sha: string = 'HEAD', recursive: boolean = true): Promise<GitHubTreeResponse> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/git/trees/${sha}`;
    return this.makeRequest<GitHubTreeResponse>(`${url}?recursive=${recursive ? '1' : '0'}`);
  }

  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
    const queryParams = ref ? `?ref=${ref}` : '';
    
    const response = await this.makeRequest<any>(`${url}${queryParams}`);
    
    if (response.type !== 'file') {
      throw new Error('Path is not a file');
    }
    
    if (response.encoding === 'base64') {
      return atob(response.content.replace(/\n/g, ''));
    }
    
    return response.content;
  }

  async getDirectoryContents(owner: string, repo: string, path: string = '', ref?: string): Promise<GitHubFile[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
    const queryParams = ref ? `?ref=${ref}` : '';
    
    return this.makeRequest<GitHubFile[]>(`${url}${queryParams}`);
  }

  // Get all SVG files in a repository
  async getAllSvgFiles(owner: string, repo: string, ref?: string): Promise<GitHubFile[]> {
    try {
      const tree = await this.getRepositoryTree(owner, repo, ref || 'HEAD', true);
      
      const svgFiles: GitHubFile[] = tree.tree
        .filter(item => item.type === 'blob' && item.path.toLowerCase().endsWith('.svg'))
        .map(item => ({
          name: item.path.split('/').pop() || item.path,
          path: item.path,
          sha: item.sha,
          size: item.size || 0,
          url: item.url,
          html_url: `https://github.com/${owner}/${repo}/blob/${ref || 'HEAD'}/${item.path}`,
          git_url: item.url,
          download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${ref || 'HEAD'}/${item.path}`,
          type: 'file' as const,
          _links: {
            self: item.url,
            git: item.url,
            html: `https://github.com/${owner}/${repo}/blob/${ref || 'HEAD'}/${item.path}`
          }
        }));

      console.log(`Found ${svgFiles.length} SVG files in ${owner}/${repo}`);
      return svgFiles;
    } catch (error) {
      console.error('Error fetching SVG files:', error);
      throw error;
    }
  }

  // Download SVG content from GitHub
  async downloadSvgContent(downloadUrl: string): Promise<string> {
    if (!downloadUrl) {
      throw new Error('No download URL provided');
    }

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to download SVG: ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error downloading SVG content:', error);
      throw error;
    }
  }

  // Parse GitHub URL to extract owner and repo
  parseGitHubUrl(url: string): { owner: string; repo: string; ref?: string } {
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname !== 'github.com') {
        throw new Error('URL must be a GitHub repository URL');
      }

      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      
      if (pathParts.length < 2) {
        throw new Error('Invalid GitHub repository URL format');
      }

      const owner = pathParts[0];
      const repo = pathParts[1].replace('.git', '');
      
      // Extract branch/ref if present in URL
      let ref: string | undefined;
      if (pathParts.length > 3 && pathParts[2] === 'tree') {
        ref = pathParts[3];
      }

      return { owner, repo, ref };
    } catch (error) {
      throw new Error(`Invalid GitHub URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get rate limit status
  getRateLimitStatus(): { remaining: number; reset: Date } {
    return {
      remaining: this.rateLimitRemaining,
      reset: new Date(this.rateLimitReset * 1000)
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

export const githubApiService = new GitHubApiService();
export default githubApiService;