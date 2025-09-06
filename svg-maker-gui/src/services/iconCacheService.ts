// Icon Cache Service - Pre-loads and caches SVG content for instant preview
import { ParsedIcon } from './iconRepositoryParsers';
import { ICON_REPOSITORIES } from '../data/icon-repositories';

interface CachedIcon {
  id: string;
  svgContent: string;
  lastUpdated: number;
  size: number;
  repository: string;
}

interface CacheStats {
  totalIcons: number;
  cachedIcons: number;
  cacheHitRate: number;
  totalCacheSize: number; // in bytes
}

interface PreloadProgress {
  repository: string;
  progress: number; // 0-100
  loaded: number;
  total: number;
  isComplete: boolean;
}

class IconCacheService {
  private cache = new Map<string, CachedIcon>();
  private loadingPromises = new Map<string, Promise<string>>();
  private preloadProgress = new Map<string, PreloadProgress>();
  private batchQueue: ParsedIcon[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly CACHE_VERSION = '1.0.0';
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly BATCH_SIZE = 10; // Process 10 icons per batch
  private readonly BATCH_DELAY = 100; // 100ms debounce delay
  private readonly MAX_CONCURRENT = 5; // Max concurrent requests
  private db: IDBDatabase | null = null;
  
  constructor() {
    this.initializeIndexedDB();
    this.loadCacheFromStorage();
  }

  /**
   * Initialize IndexedDB for persistent caching
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('IconCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for cached icons
        if (!db.objectStoreNames.contains('icons')) {
          const store = db.createObjectStore('icons', { keyPath: 'id' });
          store.createIndex('repository', 'repository', { unique: false });
          store.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
      };
    });
  }

  /**
   * Load existing cache from IndexedDB
   */
  private async loadCacheFromStorage(): Promise<void> {
    if (!this.db) {
      await this.initializeIndexedDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction(['icons'], 'readonly');
      const store = transaction.objectStore('icons');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const cachedIcons = request.result as CachedIcon[];
        const now = Date.now();
        
        // Filter out expired cache entries
        cachedIcons.forEach(cached => {
          if (now - cached.lastUpdated < this.CACHE_EXPIRY) {
            this.cache.set(cached.id, cached);
          }
        });
        
        console.log(`Loaded ${this.cache.size} cached icons from storage`);
        resolve();
      };
      
      request.onerror = () => {
        console.warn('Failed to load cache from storage:', request.error);
        resolve(); // Continue without cached data
      };
    });
  }

  /**
   * Save cached icon to IndexedDB
   */
  private async saveCacheToStorage(cached: CachedIcon): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['icons'], 'readwrite');
      const store = transaction.objectStore('icons');
      
      const request = store.put(cached);
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.warn('Failed to save cache entry:', request.error);
        resolve(); // Continue without saving
      };
    });
  }

  /**
   * Get SVG content from cache or load it
   */
  async getSvgContent(icon: ParsedIcon): Promise<string> {
    const cacheKey = `${icon.repository}-${icon.id}`;
    
    // Check memory cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.svgContent;
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(cacheKey);
    if (existingPromise) {
      return existingPromise;
    }

    // Load and cache the SVG
    const loadPromise = this.loadAndCacheSvg(icon);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const svgContent = await loadPromise;
      return svgContent;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Get multiple SVG contents with batched loading for optimal performance
   */
  async getSvgContentBatch(icons: ParsedIcon[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    const toLoad: ParsedIcon[] = [];

    // Check cache for each icon first
    for (const icon of icons) {
      const cacheKey = `${icon.repository}-${icon.id}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached)) {
        results.set(cacheKey, cached.svgContent);
      } else {
        toLoad.push(icon);
      }
    }

    // If we have icons to load, process them in batches
    if (toLoad.length > 0) {
      const loadedResults = await this.loadSvgBatch(toLoad);
      loadedResults.forEach((value, key) => {
        results.set(key, value);
      });
    }

    return results;
  }

  /**
   * Add icons to batch loading queue
   */
  queueForBatchLoad(icons: ParsedIcon[]): void {
    this.batchQueue.push(...icons);
    
    // Clear existing timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Set new timer to process batch
    this.batchTimer = setTimeout(() => {
      this.processBatchQueue();
    }, this.BATCH_DELAY);
  }

  /**
   * Process the batch queue
   */
  private async processBatchQueue(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    // Take items from queue
    const toProcess = this.batchQueue.splice(0, this.BATCH_SIZE);
    
    try {
      await this.loadSvgBatch(toProcess);
    } catch (error) {
      console.error('Batch processing failed:', error);
    }

    // Continue processing if more items in queue
    if (this.batchQueue.length > 0) {
      setTimeout(() => this.processBatchQueue(), 50);
    }
  }

  /**
   * Load multiple SVGs in parallel with concurrency control
   */
  private async loadSvgBatch(icons: ParsedIcon[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    const promises: Promise<void>[] = [];
    let activeRequests = 0;

    for (const icon of icons) {
      const promise = new Promise<void>((resolve) => {
        const processIcon = async (): Promise<void> => {
          if (activeRequests >= this.MAX_CONCURRENT) {
            // Wait for an active request to complete
            await new Promise(r => setTimeout(r, 10));
            return processIcon();
          }

          activeRequests++;
          try {
            const cacheKey = `${icon.repository}-${icon.id}`;
            const svgContent = await this.loadAndCacheSvg(icon);
            results.set(cacheKey, svgContent);
          } catch (error) {
            console.warn(`Failed to load ${icon.id}:`, error);
          } finally {
            activeRequests--;
            resolve();
          }
        };

        processIcon();
      });

      promises.push(promise);
    }

    await Promise.all(promises);
    return results;
  }

  /**
   * Load SVG content and store in cache
   */
  private async loadAndCacheSvg(icon: ParsedIcon): Promise<string> {
    if (!icon.downloadUrl) {
      throw new Error('No download URL available');
    }

    try {
      const response = await fetch(icon.downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const svgContent = await response.text();
      
      // Create cache entry
      const cached: CachedIcon = {
        id: `${icon.repository}-${icon.id}`,
        svgContent,
        lastUpdated: Date.now(),
        size: new Blob([svgContent]).size,
        repository: icon.repository
      };
      
      // Check cache size limits
      if (await this.canAddToCache(cached.size)) {
        this.cache.set(cached.id, cached);
        await this.saveCacheToStorage(cached);
      }
      
      return svgContent;
    } catch (error) {
      console.error('Failed to load SVG content:', error);
      throw error;
    }
  }

  /**
   * Pre-load all icons for built-in repositories
   */
  async preloadBuiltInRepositories(
    onProgress?: (progress: PreloadProgress) => void
  ): Promise<void> {
    console.log('Starting icon cache pre-loading for built-in repositories...');
    
    // Import services dynamically to avoid circular dependencies
    const { iconRepositoryService } = await import('./iconRepositoryService');
    
    const preloadPromises = ICON_REPOSITORIES.map(async (repo) => {
      const progress: PreloadProgress = {
        repository: repo.name,
        progress: 0,
        loaded: 0,
        total: 0,
        isComplete: false
      };
      
      this.preloadProgress.set(repo.id, progress);
      onProgress?.(progress);
      
      try {
        // Load repository icons
        const result = await iconRepositoryService.loadRepositoryIcons(repo.id);
        
        progress.total = result.icons.length;
        onProgress?.(progress);
        
        // Pre-load SVG content in smaller batches for large repositories
        const batchSize = result.icons.length > 100 ? 5 : 10; // Smaller batches for large repos
        const batches = this.createBatches(result.icons, batchSize);
        
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          const batchPromises = batch.map(async (icon) => {
            try {
              await this.getSvgContent(icon);
              progress.loaded++;
              progress.progress = Math.round((progress.loaded / progress.total) * 100);
              onProgress?.(progress);
            } catch (error) {
              console.warn(`Failed to preload icon ${icon.name}:`, error);
              // Continue with other icons
            }
          });
          
          await Promise.all(batchPromises);
          
          // Longer pause between batches for large repositories to respect API limits
          const delay = result.icons.length > 100 ? 500 : 100; // 500ms for large repos
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        progress.isComplete = true;
        progress.progress = 100;
        onProgress?.(progress);
        
        console.log(`Completed pre-loading ${repo.name}: ${progress.loaded}/${progress.total} icons cached`);
        
      } catch (error) {
        console.error(`Failed to preload repository ${repo.name}:`, error);
        progress.isComplete = true;
        onProgress?.(progress);
      }
    });
    
    await Promise.all(preloadPromises);
    console.log('Icon cache pre-loading completed for all repositories');
  }

  /**
   * Create batches from array
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(cached: CachedIcon): boolean {
    const age = Date.now() - cached.lastUpdated;
    return age < this.CACHE_EXPIRY;
  }

  /**
   * Check if we can add item to cache without exceeding limits
   */
  private async canAddToCache(itemSize: number): Promise<boolean> {
    const currentSize = this.getCurrentCacheSize();
    
    if (currentSize + itemSize > this.MAX_CACHE_SIZE) {
      // Clean up oldest entries to make space
      await this.cleanupOldestEntries(itemSize);
      return this.getCurrentCacheSize() + itemSize <= this.MAX_CACHE_SIZE;
    }
    
    return true;
  }

  /**
   * Get current cache size in bytes
   */
  private getCurrentCacheSize(): number {
    return Array.from(this.cache.values())
      .reduce((total, cached) => total + cached.size, 0);
  }

  /**
   * Clean up oldest cache entries to make space
   */
  private async cleanupOldestEntries(spaceNeeded: number): Promise<void> {
    const entries = Array.from(this.cache.entries());
    entries.sort(([,a], [,b]) => a.lastUpdated - b.lastUpdated);
    
    let spaceFreed = 0;
    const toRemove: string[] = [];
    
    for (const [key, cached] of entries) {
      toRemove.push(key);
      spaceFreed += cached.size;
      
      if (spaceFreed >= spaceNeeded) break;
    }
    
    // Remove from memory cache
    toRemove.forEach(key => this.cache.delete(key));
    
    // Remove from IndexedDB
    if (this.db && toRemove.length > 0) {
      const transaction = this.db.transaction(['icons'], 'readwrite');
      const store = transaction.objectStore('icons');
      
      toRemove.forEach(key => {
        store.delete(key);
      });
    }
    
    console.log(`Cleaned up ${toRemove.length} cache entries, freed ${spaceFreed} bytes`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const cachedIcons = this.cache.size;
    const totalCacheSize = this.getCurrentCacheSize();
    
    return {
      totalIcons: cachedIcons,
      cachedIcons,
      cacheHitRate: 0, // Would need request tracking to calculate
      totalCacheSize
    };
  }

  /**
   * Get pre-load progress for all repositories
   */
  getPreloadProgress(): Map<string, PreloadProgress> {
    return new Map(this.preloadProgress);
  }

  /**
   * Check if icon is cached
   */
  isCached(icon: ParsedIcon): boolean {
    const cacheKey = `${icon.repository}-${icon.id}`;
    const cached = this.cache.get(cacheKey);
    return cached ? this.isCacheValid(cached) : false;
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    
    if (this.db) {
      const transaction = this.db.transaction(['icons'], 'readwrite');
      const store = transaction.objectStore('icons');
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    console.log('Icon cache cleared');
  }

  /**
   * Get formatted cache size string
   */
  getFormattedCacheSize(): string {
    const sizeInBytes = this.getCurrentCacheSize();
    
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

// Export singleton instance
export const iconCacheService = new IconCacheService();
export default iconCacheService;