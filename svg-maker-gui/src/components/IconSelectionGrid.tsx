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

// Individual Icon Preview Component
const IconPreview: React.FC<IconPreviewProps> = ({ icon, isSelected, onToggle }) => {
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
        
        const response = await fetch(icon.download_url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let rawSvg = await response.text();
        
        // Clean and resize the SVG for grid display (32x32 size)
        rawSvg = rawSvg
          .replace(/width="[^"]*"/gi, '')
          .replace(/height="[^"]*"/gi, '')
          .replace(/<svg([^>]*)>/i, '<svg$1 width="32" height="32">');
        
        setSvgContent(rawSvg);
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
};

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

  // Filter and search icons
  const filteredIcons = useMemo(() => {
    return icons.filter(icon => {
      // Search filter
      const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Variant filter
      const variantMatch = icon.name.match(/_(regular|filled|light)\.svg$/);
      const iconVariant = variantMatch ? variantMatch[1] : 'regular';
      const matchesVariant = variantFilter === 'all' || iconVariant === variantFilter;
      
      // Size filter
      const sizeMatch = icon.name.match(/_(\d+)_/);
      const iconSize = sizeMatch ? sizeMatch[1] : '24';
      const matchesSize = sizeFilter === 'all' || iconSize === sizeFilter;
      
      return matchesSearch && matchesVariant && matchesSize;
    });
  }, [icons, searchTerm, variantFilter, sizeFilter]);

  // Get unique variants and sizes for filters
  const availableVariants = useMemo(() => {
    const variants = new Set<string>();
    icons.forEach(icon => {
      const match = icon.name.match(/_(regular|filled|light)\.svg$/);
      if (match) variants.add(match[1]);
    });
    return Array.from(variants).sort();
  }, [icons]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    icons.forEach(icon => {
      const match = icon.name.match(/_(\d+)_/);
      if (match) sizes.add(match[1]);
    });
    return Array.from(sizes).sort((a, b) => parseInt(a) - parseInt(b));
  }, [icons]);

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
          {filteredIcons.map(icon => (
            <IconPreview
              key={icon.path}
              icon={icon}
              isSelected={selectedIcons.has(icon.path)}
              onToggle={(selected) => onIconToggle(icon.path, selected)}
            />
          ))}
        </AnimatePresence>
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