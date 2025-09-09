import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  FolderOpen, 
  FileImage, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Circle,
  Download,
  Search,
  X
} from 'lucide-react';
import { FolderTree, GitHubFile } from '../services/githubService';
import { ParsedIcon } from '../services/iconRepositoryParsers';
import { iconCacheService } from '../services/iconCacheService';
import { useDebouncedSearch } from '../hooks/useDebounce';
import './FolderTreeBrowser.css';

interface FolderTreeBrowserProps {
  tree: FolderTree[];
  svgFiles: GitHubFile[];
  selectedFiles: Set<string>;
  onFileSelect: (path: string, selected: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onPreviewFile: (file: GitHubFile) => void;
  onExportSelected?: () => void;
  isLoading?: boolean;
  repositoryName?: string;
  repositoryType?: string;
  repositoryDescription?: string;
}

interface TreeItemProps {
  item: FolderTree;
  level: number;
  svgFiles: GitHubFile[];
  selectedFiles: Set<string>;
  onFileSelect: (path: string, selected: boolean) => void;
  onPreviewFile: (file: GitHubFile) => void;
}

// Enhanced Priority loading queue with batch processing
class PriorityLoadQueue {
  private static instance: PriorityLoadQueue;
  private queue: Array<{ load: () => Promise<void>, priority: number, id: string }> = [];
  private loading = new Set<string>();
  private maxConcurrent = 5; // Increased for better performance
  private batchTimer: NodeJS.Timeout | null = null;

  static getInstance() {
    if (!PriorityLoadQueue.instance) {
      PriorityLoadQueue.instance = new PriorityLoadQueue();
    }
    return PriorityLoadQueue.instance;
  }

  addToQueue(id: string, loadFn: () => Promise<void>, priority: number) {
    if (this.loading.has(id)) return;
    
    // Remove existing entry for this id if any
    this.queue = this.queue.filter(item => item.id !== id);
    
    // Add new entry
    this.queue.push({ load: loadFn, priority, id });
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
    
    // Batch process with requestIdleCallback for better performance
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.batchTimer = null;
        this.processBatch();
      }, 16); // Process at ~60fps
    }
  }

  private async processBatch() {
    const batchSize = Math.min(this.maxConcurrent - this.loading.size, this.queue.length);
    if (batchSize <= 0) return;

    const batch = this.queue.splice(0, batchSize);
    
    await Promise.all(batch.map(async (item) => {
      this.loading.add(item.id);
      try {
        await item.load();
      } catch (error) {
        console.warn(`Failed to load icon ${item.id}:`, error);
      } finally {
        this.loading.delete(item.id);
      }
    }));
    
    // Continue processing if more items
    if (this.queue.length > 0) {
      requestAnimationFrame(() => this.processBatch());
    }
  }
}

// Shared IntersectionObserver instance for better performance
let sharedObserver: IntersectionObserver | null = null;
const observerCallbacks = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();

const getSharedObserver = () => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const callback = observerCallbacks.get(entry.target);
          if (callback) callback(entry);
        });
      },
      { 
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
        rootMargin: '100px'
      }
    );
  }
  return sharedObserver;
};

// SVG Icon Preview Component - Optimized with shared observer
const IconPreview = React.memo<{ file: GitHubFile }>(({ file }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [priority, setPriority] = useState(0);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const loadQueue = React.useMemo(() => PriorityLoadQueue.getInstance(), []);

  // Use shared Intersection Observer for better performance
  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = getSharedObserver();
    const callback = (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        const visibilityRatio = entry.intersectionRatio;
        const newPriority = Math.floor(visibilityRatio * 100);
        setPriority(newPriority);
        setShouldLoad(true);
      } else {
        setPriority(0);
      }
    };

    observerCallbacks.set(element, callback);
    observer.observe(element);

    return () => {
      observerCallbacks.delete(element);
      observer.unobserve(element);
    };
  }, []);

  React.useEffect(() => {
    if (!shouldLoad) return;
    
    let isMounted = true; // Track if component is mounted
    const abortController = new AbortController(); // For cancelling fetch
    const iconId = file.sha || file.path;
    
    const loadSvgContent = async () => {
      if (!file.download_url) {
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setError(false);
        }
        
        // Create a ParsedIcon-like object from GitHubFile
        const iconForCache: ParsedIcon = {
          id: iconId,
          repository: 'github-file',
          downloadUrl: file.download_url || '',
          name: file.name,
          displayName: file.name.replace('.svg', ''),
          category: 'Icons',
          tags: [] as string[],
          fileName: file.name,
          path: file.path,
          size: file.size || 0,
          svgContent: ''
        };
        
        // Try to get from cache first, fall back to direct download
        let rawSvg: string;
        try {
          rawSvg = await iconCacheService.getSvgContent(iconForCache);
        } catch {
          // Fallback to direct fetch if cache fails
          const response = await fetch(file.download_url, {
            signal: abortController.signal,
            // Add cache headers for better performance
            headers: {
              'Cache-Control': 'max-age=3600',
            },
            // Use cache when available
            cache: 'default',
            // Lower priority for background loading
            priority: priority > 50 ? 'high' : 'low',
          } as RequestInit);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          rawSvg = await response.text();
        }
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Clean and resize the SVG for preview (20x20 size)
          const cleanedSvg = rawSvg
            .replace(/width="[^"]*"/gi, '')
            .replace(/height="[^"]*"/gi, '')
            .replace(/<svg([^>]*)>/i, '<svg$1 width="20" height="20">');
          
          setSvgContent(cleanedSvg);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          console.error('Failed to load SVG content:', err);
          setError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Add to priority queue instead of loading immediately
    loadQueue.addToQueue(iconId, loadSvgContent, priority);
    
    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoad, file.download_url, priority, loadQueue]);

  if (!shouldLoad || isLoading) {
    return (
      <div ref={elementRef} className="icon-preview icon-preview-loading">
        {shouldLoad ? <div className="loading-spinner" /> : <FileImage size={20} className="icon-preview-placeholder" />}
      </div>
    );
  }

  if (error || !svgContent) {
    return (
      <div 
        ref={elementRef} 
        className="icon-preview icon-preview-error" 
        title={`Failed to load ${file.name}`}
      >
        <FileImage size={20} className="icon-preview-fallback" />
      </div>
    );
  }

  return (
    <div 
      ref={elementRef}
      className="icon-preview" 
      dangerouslySetInnerHTML={{ __html: svgContent }}
      title={file.name}
    />
  );
});

const TreeItem = React.memo<TreeItemProps>(({
  item,
  level,
  svgFiles,
  selectedFiles,
  onFileSelect,
  onPreviewFile,
}) => {
  // Use lazy initial state for better performance
  const [isExpanded, setIsExpanded] = useState(() => level < 2);
  
  // Memoize computations
  const isSvgFile = React.useMemo(
    () => item.type === 'file' && item.name.toLowerCase().endsWith('.svg'),
    [item.type, item.name]
  );
  const isSelected = selectedFiles.has(item.path);
  const svgFile = React.useMemo(
    () => svgFiles.find(f => f.path === item.path),
    [svgFiles, item.path]
  );
  
  const handleToggle = React.useCallback(() => {
    if (item.type === 'dir') {
      setIsExpanded(prev => !prev);
    } else if (isSvgFile) {
      // For SVG files, clicking anywhere selects/deselects them
      onFileSelect(item.path, !isSelected);
    }
  }, [item.type, item.path, isSvgFile, isSelected, onFileSelect]);


  const hasChildren = item.children && item.children.length > 0;
  const svgFilesInFolder = item.children ? 
    item.children.filter(child => child.type === 'file' && child.name.toLowerCase().endsWith('.svg')).length :
    0;
  const totalFilesInFolder = item.children ? 
    item.children.filter(child => child.type === 'file').length :
    0;

  return (
    <div className="tree-item">
      <motion.div
        className={`tree-node ${
          item.type === 'dir' ? 'directory' : isSvgFile ? 'svg-file' : 'other-file'
        } ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        tabIndex={isSvgFile ? 0 : -1}
        role={isSvgFile ? 'checkbox' : item.type === 'dir' ? 'button' : undefined}
        aria-checked={isSvgFile ? isSelected : undefined}
        aria-label={isSvgFile ? `${isSelected ? 'Deselect' : 'Select'} ${item.name}` : item.name}
        data-svg-item={isSvgFile ? 'true' : 'false'}
        data-path={item.path}
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        whileFocus={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', outline: '2px solid var(--brand-primary)' }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.05 }}
      >
        <div className="tree-node-content">
          {item.type === 'dir' && (
            <div className={`expand-icon ${hasChildren ? 'has-children' : ''}`}>
              {hasChildren ? (
                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              ) : null}
            </div>
          )}

          <div className="item-icon">
            {item.type === 'dir' ? (
              isExpanded ? <FolderOpen size={18} /> : <Folder size={18} />
            ) : isSvgFile && svgFile ? (
              <IconPreview file={svgFile} />
            ) : isSvgFile ? (
              <FileImage size={18} />
            ) : (
              <div className="file-dot" />
            )}
          </div>

          <div className="item-info">
            <span className="item-name">{item.name}</span>
            {item.type === 'dir' && svgFilesInFolder > 0 && (
              <span className="file-count">
                {svgFilesInFolder} SVG{svgFilesInFolder !== 1 ? 's' : ''}
                {totalFilesInFolder > svgFilesInFolder && (
                  <span className="other-files">
                    , {totalFilesInFolder - svgFilesInFolder} other
                  </span>
                )}
              </span>
            )}
            {isSvgFile && item.size && (
              <span className="file-size">
                {(item.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          {isSvgFile && (
            <div className="selection-indicator">
              {isSelected ? (
                <CheckCircle2 size={18} className="selected-icon" />
              ) : (
                <Circle size={18} className="unselected-icon" />
              )}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {item.type === 'dir' && isExpanded && item.children && (
          <motion.div
            className="tree-children"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.children.map((child, index) => (
              <TreeItem
                key={child.path}
                item={child}
                level={level + 1}
                svgFiles={svgFiles}
                selectedFiles={selectedFiles}
                onFileSelect={onFileSelect}
                onPreviewFile={onPreviewFile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const FolderTreeBrowser = React.memo<FolderTreeBrowserProps>(({
  tree,
  svgFiles,
  selectedFiles,
  onFileSelect,
  onSelectAll,
  onDeselectAll,
  onPreviewFile,
  onExportSelected,
  isLoading = false,
  repositoryName,
  repositoryType = "Standard SVG Repository",
  repositoryDescription,
}) => {
  const { displayValue: searchQuery, searchValue: debouncedSearchQuery, setDisplayValue: setSearchQuery } = useDebouncedSearch('', 300);
  
  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Optimized keyboard navigation with debouncing
  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    // Only handle if not in input field
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    if (!containerRef.current) return;
    
    const svgItems = Array.from(containerRef.current.querySelectorAll('[data-svg-item="true"]'));
    if (!svgItems.length) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, svgItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case ' ':
      case 'Enter':
        if (focusedIndex >= 0 && svgItems[focusedIndex]) {
          e.preventDefault();
          const item = svgItems[focusedIndex] as HTMLElement;
          const path = item.dataset.path;
          if (path) {
            onFileSelect(path, !selectedFiles.has(path));
          }
        }
        break;
      case 'a':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onSelectAll();
        }
        break;
      case 'd':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onDeselectAll();
        }
        break;
    }
  }, [focusedIndex, selectedFiles, onFileSelect, onSelectAll, onDeselectAll]);
  
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Search cache for better performance
  const searchCache = React.useRef(new Map<string, GitHubFile[]>());
  
  // Enhanced search with caching and pattern matching
  const filteredSvgFiles = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return svgFiles;
    
    // Check cache first
    const cacheKey = `${debouncedSearchQuery}_${svgFiles.length}`;
    if (searchCache.current.has(cacheKey)) {
      return searchCache.current.get(cacheKey)!;
    }
    
    const query = debouncedSearchQuery.trim();
    let result: GitHubFile[] = [];
    
    // Regex search: /pattern/flags with better error handling
    if (query.startsWith('/') && query.lastIndexOf('/') > 0) {
      try {
        const lastSlash = query.lastIndexOf('/');
        const pattern = query.slice(1, lastSlash);
        const flags = query.slice(lastSlash + 1) || 'i'; // Default to case-insensitive
        
        // Validate regex flags
        if (!/^[gimsuvy]*$/.test(flags)) {
          throw new Error('Invalid regex flags');
        }
        
        const regex = new RegExp(pattern, flags);
        
        result = svgFiles.filter(file => 
          regex.test(file.name) || regex.test(file.path)
        );
      } catch (e) {
        // Invalid regex, fall back to literal search
        console.warn('Invalid regex pattern:', e);
      }
    }
    
    // Only continue if no regex results
    if (result.length === 0) {
      const lowerQuery = query.toLowerCase();
      
      // Wildcard search: convert * to regex
      if (lowerQuery.includes('*')) {
        try {
          const regexPattern = lowerQuery
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars except *
            .replace(/\*/g, '.*'); // Convert * to .*
          const regex = new RegExp(regexPattern);
          
          result = svgFiles.filter(file => 
            regex.test(file.name.toLowerCase()) || 
            regex.test(file.path.toLowerCase())
          );
        } catch (e) {
          // Invalid pattern, fall back to literal search
        }
      }
      
      // Standard fuzzy search if no wildcard results
      if (result.length === 0) {
        result = svgFiles.filter(file => {
          const fileName = file.name.toLowerCase();
          const filePath = file.path.toLowerCase();
          const fileBaseName = fileName.replace('.svg', '');
          
          // Direct matching
          if (fileName.includes(lowerQuery) ||
              filePath.includes(lowerQuery) ||
              fileBaseName.includes(lowerQuery)) {
            return true;
          }
          
          // Fuzzy matching: check if query chars appear in order
          // Using Array.from() for ES5 compatibility
          const queryChars = Array.from(lowerQuery);
          let lastIndex = -1;
          for (const char of queryChars) {
            const index = fileName.indexOf(char, lastIndex + 1);
            if (index === -1) return false;
            lastIndex = index;
          }
          return true;
        });
      }
    }
    
    // Cache the result (limit cache size to prevent memory issues)
    if (searchCache.current.size > 50) {
      const firstKey = searchCache.current.keys().next().value;
      searchCache.current.delete(firstKey);
    }
    searchCache.current.set(cacheKey, result);
    
    return result;
  }, [svgFiles, debouncedSearchQuery]);
  
  // Memoized calculations for better performance
  const totalSvgFiles = React.useMemo(() => filteredSvgFiles.length, [filteredSvgFiles]);
  const selectedCount = React.useMemo(() => selectedFiles.size, [selectedFiles]);
  
  // Clear search with memoization
  const clearSearch = React.useCallback(() => {
    setSearchQuery('');
    setFocusedIndex(-1);
  }, [setSearchQuery]);
  
  // Enhanced performance-optimized tree filtering
  const filteredTree = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      // For large datasets, implement progressive loading
      if (tree.length === 1 && tree[0].children && tree[0].children.length > 150) {
        const rootFolder = tree[0];
        const visibleLimit = 150;
        const remainingCount = rootFolder.children!.length - visibleLimit;
        
        return [{
          ...rootFolder,
          children: rootFolder.children!.slice(0, visibleLimit).concat([{
            name: `⚡ Load ${remainingCount} more files (${remainingCount} remaining)`,
            path: '__load_more__',
            type: 'file' as const,
            sha: '__load_more__',
            size: 0
          }])
        }];
      }
      return tree;
    }
    
    // Enhanced search with better performance and pagination
    const searchResults = filteredSvgFiles.slice(0, 300);
    const hasMore = filteredSvgFiles.length > 300;
    
    const searchTree = [{
      name: `🔍 Search Results (${searchResults.length}${hasMore ? ` of ${filteredSvgFiles.length}` : ''})`,
      path: 'search-results',
      type: 'dir' as const,
      children: searchResults,
      sha: 'search-results'
    }];

    if (hasMore) {
      searchTree[0].children = searchResults.concat([{
        name: `📄 ${filteredSvgFiles.length - 300} more results (refine search to see all)`,
        path: '__search_more__',
        type: 'file' as const,
        sha: '__search_more__',
        size: 0
      }]);
    }

    return searchTree;
  }, [tree, filteredSvgFiles, debouncedSearchQuery]);

  if (isLoading) {
    return (
      <div className="folder-tree-browser loading">
        <div className="loading-content">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="loading-text">
            <h3>Loading repository structure...</h3>
            <p>Analyzing SVG files and building file tree</p>
          </div>
          
          {/* Skeleton Loading */}
          <div className="skeleton-container">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="skeleton-icon"></div>
                <div className="skeleton-text">
                  <div className="skeleton-name" style={{ width: `${60 + Math.random() * 40}%` }}></div>
                  <div className="skeleton-meta" style={{ width: `${30 + Math.random() * 30}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!tree.length) {
    return (
      <div className="folder-tree-browser empty">
        <div className="empty-content">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "backOut" }}
          >
            <Folder size={64} />
          </motion.div>
          <div className="empty-text">
            <h3>No Repository Loaded</h3>
            <p>Enter a GitHub repository URL above to browse and select SVG files</p>
            <div className="empty-features">
              <div className="feature-item">🔍 Advanced search with wildcards</div>
              <div className="feature-item">⌨️ Keyboard navigation support</div>
              <div className="feature-item">🎯 Bulk selection tools</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="folder-tree-browser" ref={containerRef}>
      {/* Repository Header */}
      <motion.div
        className="repo-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="repo-info">
          <div className="repo-title">
            <h3>Repository Files</h3>
            <div className="repo-name">{repositoryName || "Bootstrap Icons"}</div>
          </div>
          <div className="repo-badge">{repositoryType}</div>
        </div>
        
        <div className="file-counter">
          <div className="counter-item">
            <span className="counter-number">{totalSvgFiles}</span>
            <span className="counter-label">SVG files found</span>
          </div>
          <div className="counter-item selected">
            <span className="counter-number">{selectedCount}</span>
            <span className="counter-label">selected</span>
          </div>
        </div>
        
        <div className="action-buttons">
          <motion.button
            className="btn-secondary"
            onClick={onSelectAll}
            disabled={selectedCount === totalSvgFiles}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Select all visible SVG files (Ctrl+A)"
          >
            <CheckCircle2 size={16} />
            Select All
          </motion.button>
          
          <motion.button
            className="btn-secondary"
            onClick={onDeselectAll}
            disabled={selectedCount === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Deselect all selected files (Ctrl+D)"
          >
            <Circle size={16} />
            Clear
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Search Bar */}
      <motion.div
        className="search-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search icons... (try: arrow*, home, *icon, /regex/)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                clearSearch();
              }
            }}
            className="search-field"
            autoComplete="off"
            spellCheck="false"
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="clear-btn"
              title="Clear search (Esc)"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {searchQuery && (
          <div className="search-stats">
            {filteredSvgFiles.length} of {svgFiles.length} files match your search
            {debouncedSearchQuery !== searchQuery && (
              <span className="search-loading"> • Searching...</span>
            )}
          </div>
        )}
        
        {/* Keyboard Shortcuts Help */}
        {!searchQuery && totalSvgFiles > 0 && (
          <div className="keyboard-help">
            <span className="help-text">💡 Use ↑↓ arrow keys to navigate • Space/Enter to select • Esc to clear search</span>
          </div>
        )}
      </motion.div>

      {/* Files List with Virtual Scrolling Support */}
      <motion.div
        className="files-list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        onScroll={(e) => {
          const target = e.currentTarget;
          const scrollPercentage = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
          
          // Load more items when user scrolls near the bottom
          if (scrollPercentage > 80 && filteredTree.length > 0) {
            const firstItem = filteredTree[0];
            if (firstItem?.children?.some((child: any) => child.path === '__load_more__')) {
              // Trigger load more logic here if needed
              console.log('Near bottom, ready to load more');
            }
          }
        }}
      >
        {filteredTree.map((item, index) => (
          <TreeItem
            key={item.path}
            item={item}
            level={0}
            svgFiles={svgFiles}
            selectedFiles={selectedFiles}
            onFileSelect={onFileSelect}
            onPreviewFile={onPreviewFile}
          />
        ))}
      </motion.div>

      {selectedCount > 0 && (
        <motion.div
          className="selection-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="summary-info">
            <CheckCircle2 size={18} />
            <span>
              <strong>{selectedCount}</strong> file{selectedCount !== 1 ? 's' : ''} selected
              {selectedCount > 0 && filteredSvgFiles.length > selectedCount && (
                <span className="selection-percentage">
                  {' '}({Math.round((selectedCount / filteredSvgFiles.length) * 100)}%)
                </span>
              )}
            </span>
          </div>
          
          {onExportSelected && (
            <motion.button
              className="export-selected-btn"
              onClick={onExportSelected}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={`Export ${selectedCount} selected SVG files`}
            >
              <Download size={16} />
              Export Selected ({selectedCount})
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
});

export default FolderTreeBrowser;