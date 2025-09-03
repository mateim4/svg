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
  Eye,
  Download,
  Search,
  X
} from 'lucide-react';
import { FolderTree, GitHubFile } from '../services/githubService';
import { ParsedIcon } from '../services/iconRepositoryParsers';
import { iconCacheService } from '../services/iconCacheService';
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
}

interface TreeItemProps {
  item: FolderTree;
  level: number;
  svgFiles: GitHubFile[];
  selectedFiles: Set<string>;
  onFileSelect: (path: string, selected: boolean) => void;
  onPreviewFile: (file: GitHubFile) => void;
}

// SVG Icon Preview Component - Uses cache service for instant loading
const IconPreview: React.FC<{ file: GitHubFile }> = ({ file }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    const loadSvgContent = async () => {
      if (!file.download_url) {
        setError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(false);
        
        // Use the imported cache service
        
        // Create a ParsedIcon-like object from GitHubFile
        const iconForCache: ParsedIcon = {
          id: file.sha || file.path,
          repository: 'github-file', // Generic repository identifier
          downloadUrl: file.download_url || '',
          name: file.name,
          displayName: file.name.replace('.svg', ''),
          category: 'Icons',
          tags: [] as string[],
          fileName: file.name,
          path: file.path,
          size: file.size || 0,
          svgContent: '' // Required by ParsedIcon interface
        };
        
        // Try to get from cache first, fall back to direct download
        let rawSvg: string;
        try {
          rawSvg = await iconCacheService.getSvgContent(iconForCache);
        } catch {
          // Fallback to direct fetch if cache fails
          const response = await fetch(file.download_url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          rawSvg = await response.text();
        }
        
        // Clean and resize the SVG for preview (20x20 size)
        // Remove any existing width/height attributes and set preview size
        const cleanedSvg = rawSvg
          .replace(/width="[^"]*"/gi, '')
          .replace(/height="[^"]*"/gi, '')
          .replace(/<svg([^>]*)>/i, '<svg$1 width="20" height="20">');
        
        setSvgContent(cleanedSvg);
      } catch (err) {
        console.error('Failed to load SVG content:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadSvgContent();
  }, [file.download_url]);

  if (isLoading) {
    return (
      <div className="icon-preview icon-preview-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error || !svgContent) {
    return <FileImage size={20} className="icon-preview-fallback" />;
  }

  return (
    <div 
      className="icon-preview" 
      dangerouslySetInnerHTML={{ __html: svgContent }}
      title={file.name}
    />
  );
};

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  level,
  svgFiles,
  selectedFiles,
  onFileSelect,
  onPreviewFile,
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const isSvgFile = item.type === 'file' && item.name.toLowerCase().endsWith('.svg');
  const isSelected = selectedFiles.has(item.path);
  const svgFile = svgFiles.find(f => f.path === item.path);
  
  const handleToggle = () => {
    if (item.type === 'dir') {
      setIsExpanded(!isExpanded);
    }
  };

  const handleFileSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSvgFile) {
      onFileSelect(item.path, !isSelected);
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (svgFile) {
      onPreviewFile(svgFile);
    }
  };

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
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
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
            <div className="item-actions" onClick={(e) => e.stopPropagation()}>
              <motion.button
                className="action-button preview-button"
                onClick={handlePreview}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Preview"
              >
                <Eye size={14} />
              </motion.button>
              
              <motion.button
                className={`action-button select-button ${isSelected ? 'selected' : ''}`}
                onClick={handleFileSelect}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isSelected ? 'Deselect' : 'Select'}
              >
                {isSelected ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </motion.button>
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
};

const FolderTreeBrowser: React.FC<FolderTreeBrowserProps> = ({
  tree,
  svgFiles,
  selectedFiles,
  onFileSelect,
  onSelectAll,
  onDeselectAll,
  onPreviewFile,
  onExportSelected,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter SVG files based on search query
  const filteredSvgFiles = useMemo(() => {
    if (!searchQuery.trim()) return svgFiles;
    
    const query = searchQuery.toLowerCase().trim();
    return svgFiles.filter(file => 
      file.name.toLowerCase().includes(query) ||
      file.path.toLowerCase().includes(query)
    );
  }, [svgFiles, searchQuery]);
  
  const totalSvgFiles = filteredSvgFiles.length;
  const selectedCount = selectedFiles.size;
  
  // Clear search
  const clearSearch = () => setSearchQuery('');
  
  // Create filtered tree with search results
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;
    
    // For search results, create a flat list of matching files
    return [{
      name: 'Search Results',
      path: 'search-results',
      type: 'dir' as const,
      children: filteredSvgFiles,
      sha: 'search-results'
    }];
  }, [tree, filteredSvgFiles, searchQuery]);

  if (isLoading) {
    return (
      <div className="folder-tree-browser loading">
        <div className="loading-content">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading repository structure...</p>
        </div>
      </div>
    );
  }

  if (!tree.length) {
    return (
      <div className="folder-tree-browser empty">
        <div className="empty-content">
          <Folder size={48} />
          <h3>No Repository Loaded</h3>
          <p>Enter a GitHub repository URL to browse SVG files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="folder-tree-browser">
      <motion.div
        className="tree-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-info">
          <h3>Repository Files</h3>
          <div className="file-stats">
            <span className="total-files">{totalSvgFiles} SVG files found</span>
            <span className="selected-files">{selectedCount} selected</span>
          </div>
        </div>
        
        <div className="header-actions">
          <motion.button
            className="action-btn select-all"
            onClick={onSelectAll}
            disabled={selectedCount === totalSvgFiles}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle2 size={16} />
            Select All
          </motion.button>
          
          <motion.button
            className="action-btn deselect-all"
            onClick={onDeselectAll}
            disabled={selectedCount === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Circle size={16} />
            Deselect All
          </motion.button>
        </div>
      </motion.div>

      {/* Search Input - Right above the icon list */}
      <motion.div
        className="search-container"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="clear-search"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </motion.div>

      <motion.div
        className="tree-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
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
        >
          <div className="summary-info">
            <CheckCircle2 size={18} />
            <span>
              {selectedCount} file{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          {onExportSelected && (
            <motion.button
              className="export-selected-btn"
              onClick={onExportSelected}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={16} />
              Export Selected ({selectedCount})
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FolderTreeBrowser;