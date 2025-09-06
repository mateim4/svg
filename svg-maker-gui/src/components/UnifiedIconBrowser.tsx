import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  Grid2X2, 
  List,
  Download,
  Eye,
  Palette,
  Package,
  Zap,
  CheckCircle
} from 'lucide-react';
import { unifiedIconService, UnifiedIcon, IconProvider, ProviderInfo, UnifiedIconResult } from '../services/unifiedIconService';
import { IconConfig } from '../types/IconConfig';
import './UnifiedIconBrowser.css';

interface UnifiedIconBrowserProps {
  config: IconConfig;
  onIconSelect?: (icon: UnifiedIconResult) => void;
  onBulkSelect?: (icons: UnifiedIconResult[]) => void;
  selectedProvider?: IconProvider;
  maxIcons?: number;
}

type ViewMode = 'grid-large' | 'grid-small' | 'list';
type SortMode = 'name' | 'provider' | 'category';

const UnifiedIconBrowser: React.FC<UnifiedIconBrowserProps> = ({
  config,
  onIconSelect,
  onBulkSelect,
  selectedProvider,
  maxIcons = 100
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<Set<IconProvider>>(
    selectedProvider ? new Set([selectedProvider]) : new Set()
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('grid-large');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());
  const [previewIcon, setPreviewIcon] = useState<UnifiedIconResult | null>(null);
  
  // Data
  const [allIcons, setAllIcons] = useState<UnifiedIcon[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [iconResults, setIconResults] = useState<Map<string, UnifiedIconResult>>(new Map());

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Get provider information
        const providerInfo = unifiedIconService.getAvailableProviders();
        setProviders(providerInfo);

        // Load popular icons from all providers
        const popularIcons = await unifiedIconService.getPopularIcons();
        setAllIcons(popularIcons);
      } catch (error) {
        console.error('Error loading initial icon data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Search and filter logic
  const filteredIcons = useMemo(() => {
    let filtered = allIcons;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(icon =>
        icon.name.toLowerCase().includes(query) ||
        icon.displayName.toLowerCase().includes(query) ||
        icon.tags.some(tag => tag.toLowerCase().includes(query)) ||
        icon.categories.some(cat => cat.toLowerCase().includes(query))
      );
    }

    // Filter by providers
    if (selectedProviders.size > 0) {
      filtered = filtered.filter(icon => selectedProviders.has(icon.provider));
    }

    // Filter by categories
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(icon => 
        icon.categories.some(cat => selectedCategories.has(cat))
      );
    }

    // Sort icons
    filtered.sort((a, b) => {
      switch (sortMode) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'provider':
          return a.provider.localeCompare(b.provider);
        case 'category':
          return (a.categories[0] || '').localeCompare(b.categories[0] || '');
        default:
          return 0;
      }
    });

    return filtered.slice(0, maxIcons);
  }, [allIcons, searchQuery, selectedProviders, selectedCategories, sortMode, maxIcons]);

  // Get all unique categories
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    allIcons.forEach(icon => {
      icon.categories.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  }, [allIcons]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsLoading(true);
      try {
        const searchResults = await unifiedIconService.searchAllProviders(query);
        setAllIcons(searchResults.slice(0, maxIcons * 2)); // Get more for better filtering
      } catch (error) {
        console.error('Error searching icons:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Load icon SVG on demand
  const loadIconSvg = async (icon: UnifiedIcon, variant?: string) => {
    const key = `${icon.provider}-${icon.name}-${config.width}-${variant || 'default'}`;
    
    if (iconResults.has(key)) {
      return iconResults.get(key)!;
    }

    try {
      const result = await unifiedIconService.getIconSvg(
        icon.provider,
        icon.name,
        Math.min(config.width, 48), // Use smaller size for preview
        variant || icon.variants?.[0]
      );

      if (result) {
        setIconResults(prev => new Map(prev.set(key, result)));
        return result;
      }
    } catch (error) {
      console.error(`Error loading icon ${icon.name}:`, error);
    }
    return null;
  };

  // Handle icon selection
  const handleIconClick = async (icon: UnifiedIcon) => {
    const result = await loadIconSvg(icon);
    if (result && onIconSelect) {
      onIconSelect(result);
    }
  };

  // Handle bulk selection
  const toggleIconSelection = (iconKey: string) => {
    const newSelected = new Set(selectedIcons);
    if (newSelected.has(iconKey)) {
      newSelected.delete(iconKey);
    } else {
      newSelected.add(iconKey);
    }
    setSelectedIcons(newSelected);
  };

  // Handle bulk download
  const handleBulkDownload = async () => {
    if (selectedIcons.size === 0 || !onBulkSelect) return;

    const selectedIconData = filteredIcons
      .filter(icon => selectedIcons.has(`${icon.provider}-${icon.name}`))
      .slice(0, 20); // Limit bulk operations

    const results: UnifiedIconResult[] = [];
    for (const icon of selectedIconData) {
      const result = await loadIconSvg(icon);
      if (result) {
        results.push(result);
      }
    }

    onBulkSelect(results);
  };

  // Handle preview
  const handlePreview = async (icon: UnifiedIcon) => {
    const result = await loadIconSvg(icon);
    if (result) {
      setPreviewIcon(result);
    }
  };

  return (
    <div className="unified-icon-browser">
      {/* Header */}
      <div className="browser-header">
        <div className="header-title">
          <Package size={24} />
          <h2>Icon Library Browser</h2>
          <span className="icon-count">
            {isLoading ? 'Loading...' : `${filteredIcons.length} icons`}
          </span>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search icons by name, category, or tags..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="clear-search"
            >
              ×
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="browser-controls">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`control-btn ${showFilters ? 'active' : ''}`}
            title="Toggle filters"
          >
            <Filter size={18} />
          </button>

          <div className="view-mode-controls">
            <button
              onClick={() => setViewMode('grid-large')}
              className={`control-btn ${viewMode === 'grid-large' ? 'active' : ''}`}
            >
              <Grid2X2 size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid-small')}
              className={`control-btn ${viewMode === 'grid-small' ? 'active' : ''}`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`control-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List size={18} />
            </button>
          </div>

          {selectedIcons.size > 0 && (
            <button
              onClick={handleBulkDownload}
              className="bulk-download-btn"
              title={`Download ${selectedIcons.size} selected icons`}
            >
              <Download size={18} />
              <span>{selectedIcons.size}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="filters-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Provider Filter */}
            <div className="filter-group">
              <h4>Icon Libraries</h4>
              <div className="filter-options">
                {providers.map(provider => (
                  <label key={provider.id} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedProviders.has(provider.id)}
                      onChange={(e) => {
                        const newProviders = new Set(selectedProviders);
                        if (e.target.checked) {
                          newProviders.add(provider.id);
                        } else {
                          newProviders.delete(provider.id);
                        }
                        setSelectedProviders(newProviders);
                      }}
                    />
                    <span className="provider-name">{provider.name}</span>
                    <span className="provider-count">({provider.totalIcons})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h4>Categories</h4>
              <div className="filter-options">
                {availableCategories.slice(0, 10).map(category => (
                  <label key={category} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category)}
                      onChange={(e) => {
                        const newCategories = new Set(selectedCategories);
                        if (e.target.checked) {
                          newCategories.add(category);
                        } else {
                          newCategories.delete(category);
                        }
                        setSelectedCategories(newCategories);
                      }}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="filter-group">
              <h4>Sort by</h4>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="sort-select"
              >
                <option value="name">Name</option>
                <option value="provider">Library</option>
                <option value="category">Category</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon Grid */}
      <div className={`icon-grid view-${viewMode}`}>
        {isLoading ? (
          <div className="loading-state">
            <Zap size={32} className="loading-icon" />
            <p>Loading icons...</p>
          </div>
        ) : filteredIcons.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No icons found</h3>
            <p>Try adjusting your search query or filters</p>
          </div>
        ) : (
          filteredIcons.map(icon => {
            const iconKey = `${icon.provider}-${icon.name}`;
            const isSelected = selectedIcons.has(iconKey);
            
            return (
              <motion.div
                key={iconKey}
                className={`icon-card ${isSelected ? 'selected' : ''}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="icon-header">
                  <span className="provider-badge">{icon.provider}</span>
                  {onBulkSelect && (
                    <button
                      onClick={() => toggleIconSelection(iconKey)}
                      className={`select-checkbox ${isSelected ? 'selected' : ''}`}
                    >
                      {isSelected && <CheckCircle size={16} />}
                    </button>
                  )}
                </div>

                <div className="icon-preview-container">
                  <IconPreview 
                    icon={icon} 
                    onLoad={loadIconSvg}
                    onClick={() => handleIconClick(icon)}
                  />
                </div>

                <div className="icon-info">
                  <h4 className="icon-name">{icon.displayName}</h4>
                  <p className="icon-details">
                    {icon.categories.slice(0, 2).join(', ')}
                    {icon.variants && icon.variants.length > 1 && (
                      <span className="variant-count">
                        +{icon.variants.length} variants
                      </span>
                    )}
                  </p>
                </div>

                <div className="icon-actions">
                  <button
                    onClick={() => handlePreview(icon)}
                    className="action-btn preview-btn"
                    title="Preview"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleIconClick(icon)}
                    className="action-btn select-btn"
                    title="Use this icon"
                  >
                    <Palette size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewIcon && (
          <motion.div
            className="preview-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewIcon(null)}
          >
            <motion.div
              className="preview-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="preview-header">
                <h3>{previewIcon.name}</h3>
                <span className="preview-provider">{previewIcon.provider}</span>
                <button
                  onClick={() => setPreviewIcon(null)}
                  className="close-preview"
                >
                  ×
                </button>
              </div>
              <div className="preview-content">
                <div 
                  className="preview-svg"
                  dangerouslySetInnerHTML={{ __html: previewIcon.content }}
                />
                <div className="preview-info">
                  <p>Size: {previewIcon.size}px</p>
                  {previewIcon.variant && <p>Variant: {previewIcon.variant}</p>}
                </div>
              </div>
              <div className="preview-actions">
                <button
                  onClick={() => {
                    onIconSelect?.(previewIcon);
                    setPreviewIcon(null);
                  }}
                  className="use-icon-btn"
                >
                  Use This Icon
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Icon Preview Component with lazy loading
const IconPreview: React.FC<{
  icon: UnifiedIcon;
  onLoad: (icon: UnifiedIcon, variant?: string) => Promise<UnifiedIconResult | null>;
  onClick: () => void;
}> = ({ icon, onLoad, onClick }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadSvg = async () => {
      setIsLoading(true);
      try {
        const result = await onLoad(icon);
        if (result && isMounted) {
          setSvgContent(result.content);
        }
      } catch (error) {
        console.error('Error loading icon preview:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSvg();

    return () => {
      isMounted = false;
    };
  }, [icon, onLoad]);

  return (
    <div className="icon-preview" onClick={onClick}>
      {isLoading ? (
        <div className="preview-loading">
          <div className="loading-spinner" />
        </div>
      ) : svgContent ? (
        <div 
          className="preview-svg"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <div className="preview-error">
          <span>?</span>
        </div>
      )}
    </div>
  );
};

export default UnifiedIconBrowser;