import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  CheckCircle2, 
  Circle, 
  Grid3X3, 
  List,
  Filter,
  Download
} from 'lucide-react';
import { GitHubFile } from '../services/githubService';
import { ParsedIcon } from '../services/iconRepositoryParsers';
import { iconCacheService } from '../services/iconCacheService';
import './IconSelectionGrid.css';

interface IconSelectionGridProps {
  icons: GitHubFile[];
  selectedIcons: Set<string>;
  onIconToggle: (iconPath: string, selected: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onExportSelected: () => void;
  isLoading?: boolean;
}

interface IconPreviewProps {
  icon: GitHubFile;
  isSelected: boolean;
  onToggle: (selected: boolean) => void;
}

// Individual Icon Preview Component with memoization
const IconPreview: React.FC<IconPreviewProps> = React.memo(({ icon, isSelected, onToggle }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    const loadSvgContent = async () => {
      if (!icon.download_url) {
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
          id: icon.sha || icon.path,
          repository: 'github-file', // Generic repository identifier
          downloadUrl: icon.download_url || '',
          name: icon.name,
          displayName: icon.name.replace('.svg', ''),
          category: 'Icons',
          tags: [] as string[],
          fileName: icon.name,
          path: icon.path,
          size: icon.size || 0,
          svgContent: '' // Required by ParsedIcon interface
        };
        
        // Try to get from cache first, fall back to direct download
        let rawSvg: string;
        try {
          rawSvg = await iconCacheService.getSvgContent(iconForCache);
        } catch {
          // Fallback to direct fetch if cache fails
          const response = await fetch(icon.download_url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          rawSvg = await response.text();
        }
        
        // Clean and resize the SVG for grid display (32x32 size)
        const cleanedSvg = rawSvg
          .replace(/width="[^"]*"/gi, '')
          .replace(/height="[^"]*"/gi, '')
          .replace(/<svg([^>]*)>/i, '<svg$1 width="32" height="32">');
        
        setSvgContent(cleanedSvg);
      } catch (err) {
        console.error('Failed to load SVG content for', icon.name, ':', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadSvgContent();
  }, [icon.download_url]);

  const handleClick = () => {
    onToggle(!isSelected);
  };

  // Extract clean icon name from FluentUI filename
  const getIconDisplayName = (fileName: string): string => {
    const match = fileName.match(/ic_fluent_(.+)_(\d+)_(regular|filled|light)\.svg$/);
    if (match) {
      const [, iconName, size, variant] = match;
      return iconName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return fileName.replace('.svg', '');
  };

  const getIconVariant = (fileName: string): string => {
    const match = fileName.match(/ic_fluent_(.+)_(\d+)_(regular|filled|light)\.svg$/);
    return match ? match[3] : 'regular';
  };

  const getIconSize = (fileName: string): string => {
    const match = fileName.match(/ic_fluent_(.+)_(\d+)_(regular|filled|light)\.svg$/);
    return match ? `${match[2]}px` : '24px';
  };

  return (
    <motion.div
      className={`icon-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="icon-preview-container">
        {isLoading && (
          <div className="icon-loading">
            <div className="loading-spinner" />
          </div>
        )}
        {error && (
          <div className="icon-error">
            <Grid3X3 size={32} />
          </div>
        )}
        {!isLoading && !error && svgContent && (
          <div 
            className="icon-svg-display"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
      
      <div className="icon-info">
        <div className="icon-name">{getIconDisplayName(icon.name)}</div>
        <div className="icon-metadata">
          <span className={`variant-badge ${getIconVariant(icon.name)}`}>
            {getIconVariant(icon.name)}
          </span>
          <span className="size-badge">{getIconSize(icon.name)}</span>
        </div>
      </div>
      
      <div className="selection-indicator">
        {isSelected ? (
          <CheckCircle2 size={20} className="selected-icon" />
        ) : (
          <Circle size={20} className="unselected-icon" />
        )}
      </div>
    </motion.div>
  );
});

const IconSelectionGrid: React.FC<IconSelectionGridProps> = ({
  icons,
  selectedIcons,
  onIconToggle,
  onSelectAll,
  onDeselectAll,
  onExportSelected,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [variantFilter, setVariantFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Cache lowercase search term to avoid repeated toLowerCase calls
  const normalizedSearchTerm = useMemo(() => searchTerm.toLowerCase(), [searchTerm]);

  // Pre-compute icon metadata for better performance
  const iconsWithMetadata = useMemo(() => {
    return icons.map(icon => {
      const variantMatch = icon.name.match(/_(regular|filled|light)\.svg$/);
      const sizeMatch = icon.name.match(/_(\d+)_/);
      
      return {
        ...icon,
        normalizedName: icon.name.toLowerCase(),
        variant: variantMatch ? variantMatch[1] : 'regular',
        extractedSize: sizeMatch ? sizeMatch[1] : '24' // Use different name to avoid conflict
      };
    });
  }, [icons]);

  // Filter and search icons with pre-computed metadata
  const filteredIcons = useMemo(() => {
    if (!normalizedSearchTerm && variantFilter === 'all' && sizeFilter === 'all') {
      // Return original icons if no filters applied
      return icons;
    }

    return iconsWithMetadata.filter(icon => {
      // Search filter with pre-computed normalized name
      const matchesSearch = !normalizedSearchTerm || icon.normalizedName.includes(normalizedSearchTerm);
      
      // Variant filter with pre-computed variant
      const matchesVariant = variantFilter === 'all' || icon.variant === variantFilter;
      
      // Size filter with pre-computed size
      const matchesSize = sizeFilter === 'all' || icon.extractedSize === sizeFilter;
      
      return matchesSearch && matchesVariant && matchesSize;
    }).map((icon): GitHubFile => ({
      name: icon.name,
      path: icon.path,
      type: icon.type,
      download_url: icon.download_url,
      size: icon.size, // Keep original size property (number | undefined)
      sha: icon.sha
    }));
  }, [iconsWithMetadata, normalizedSearchTerm, variantFilter, sizeFilter, icons]);

  // Get unique variants and sizes from pre-computed metadata
  const availableVariants = useMemo(() => {
    const variants = new Set<string>();
    iconsWithMetadata.forEach(icon => {
      if (icon.variant) variants.add(icon.variant);
    });
    return Array.from(variants).sort();
  }, [iconsWithMetadata]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    iconsWithMetadata.forEach(icon => {
      if (icon.extractedSize) sizes.add(icon.extractedSize);
    });
    return Array.from(sizes).sort((a, b) => parseInt(a) - parseInt(b));
  }, [iconsWithMetadata]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleSelectAll = () => {
    if (filteredIcons.length === 0) return;
    onSelectAll();
  };

  const handleDeselectAll = () => {
    onDeselectAll();
  };

  if (isLoading) {
    return (
      <div className="icon-selection-loading">
        <div className="loading-spinner" />
        <p>Loading icons...</p>
      </div>
    );
  }

  return (
    <div className="icon-selection-grid">
      {/* Header Controls */}
      <div className="selection-header">
        <div className="search-and-filters">
          {/* Search */}
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="clear-search">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="filters-container">
            <select
              value={variantFilter}
              onChange={(e) => setVariantFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Variants</option>
              {availableVariants.map(variant => (
                <option key={variant} value={variant}>
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Sizes</option>
              {availableSizes.map(size => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="selection-actions">
          <div className="selection-count">
            {selectedIcons.size} of {filteredIcons.length} selected
          </div>
          <button onClick={handleSelectAll} className="action-btn secondary">
            Select All
          </button>
          <button onClick={handleDeselectAll} className="action-btn secondary">
            Clear Selection
          </button>
          <button 
            onClick={onExportSelected} 
            className="action-btn primary"
            disabled={selectedIcons.size === 0}
          >
            <Download size={16} />
            Export Selected ({selectedIcons.size})
          </button>
        </div>
      </div>

      {/* Icons Grid */}
      <div className={`icons-container ${viewMode}`}>
        <AnimatePresence>
          {filteredIcons.length > 200 ? (
            // For large datasets, limit initial render and add lazy loading
            filteredIcons.slice(0, 200).map(icon => (
              <IconPreview
                key={icon.path}
                icon={icon}
                isSelected={selectedIcons.has(icon.path)}
                onToggle={(selected) => onIconToggle(icon.path, selected)}
              />
            ))
          ) : (
            // For smaller datasets, render all
            filteredIcons.map(icon => (
              <IconPreview
                key={icon.path}
                icon={icon}
                isSelected={selectedIcons.has(icon.path)}
                onToggle={(selected) => onIconToggle(icon.path, selected)}
              />
            ))
          )}
        </AnimatePresence>
        
        {filteredIcons.length > 200 && (
          <div className="large-dataset-notice">
            Showing first 200 of {filteredIcons.length} icons. Use search/filters to narrow results.
          </div>
        )}
      </div>

      {filteredIcons.length === 0 && (
        <div className="no-results">
          <Filter size={48} />
          <h3>No icons found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};

export default IconSelectionGrid;