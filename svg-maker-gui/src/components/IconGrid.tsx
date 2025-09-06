import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download } from 'lucide-react';
import IconRenderer from './IconRenderer';
import './IconGrid.css';

interface IconGridProps {
  iconPack: 'lucide' | 'heroicons' | 'feather' | 'phosphor' | 'tabler' | 'fluent';
  onIconSelect?: (iconName: string, svgContent: string) => void;
  showVariants?: boolean;
  defaultSize?: number;
}

interface GridIcon {
  name: string;
  displayName: string;
  categories: string[];
  tags: string[];
  variants?: string[];
  weights?: string[];
  sizes?: number[];
}

export const IconGrid: React.FC<IconGridProps> = ({
  iconPack,
  onIconSelect,
  showVariants = true,
  defaultSize = 24
}) => {
  const [icons, setIcons] = useState<GridIcon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  // Load icons based on icon pack
  useEffect(() => {
    loadIcons();
  }, [iconPack]);

  const loadIcons = async () => {
    setLoading(true);
    try {
      let iconService;
      
      switch (iconPack) {
        case 'lucide':
          const { lucideService } = await import('../services/lucideService');
          iconService = lucideService;
          break;
        case 'heroicons':
          const { heroiconsService } = await import('../services/heroiconsService');
          iconService = heroiconsService;
          break;
        case 'feather':
          const { featherService } = await import('../services/featherService');
          iconService = featherService;
          break;
        case 'phosphor':
          const { phosphorService } = await import('../services/phosphorService');
          iconService = phosphorService;
          break;
        case 'tabler':
          const { tablerService } = await import('../services/tablerService');
          iconService = tablerService;
          break;
        case 'fluent':
          const { fluentUIService } = await import('../services/fluentUIService');
          iconService = fluentUIService;
          break;
        default:
          throw new Error(`Unknown icon pack: ${iconPack}`);
      }

      const availableIcons = await iconService.getAvailableIcons();
      
      // Convert service response to GridIcon format
      const convertedIcons: GridIcon[] = availableIcons.map((icon: any) => ({
        name: icon.name,
        displayName: icon.displayName || icon.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        categories: icon.categories || ['general'],
        tags: icon.tags || [],
        variants: icon.variants || [],
        weights: icon.weights || [],
        sizes: icon.sizes || [24]
      }));
      
      setIcons(convertedIcons);

      // Set default variant for different icon packs
      if (!selectedVariant) {
        switch (iconPack) {
          case 'heroicons':
            setSelectedVariant('outline');
            break;
          case 'phosphor':
            setSelectedVariant('regular');
            break;
          case 'tabler':
            setSelectedVariant('outline');
            break;
          case 'fluent':
            setSelectedVariant('regular');
            break;
          default:
            setSelectedVariant('');
        }
      }
    } catch (error) {
      console.error('Error loading icons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter icons based on search and category
  const filteredIcons = useMemo(() => {
    let filtered = icons;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(icon =>
        icon.name.toLowerCase().includes(query) ||
        icon.displayName.toLowerCase().includes(query) ||
        icon.tags.some(tag => tag.toLowerCase().includes(query)) ||
        icon.categories.some(category => category.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(icon =>
        icon.categories.includes(selectedCategory)
      );
    }

    return filtered;
  }, [icons, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    icons.forEach(icon => {
      icon.categories.forEach(category => cats.add(category));
    });
    return ['all', ...Array.from(cats)];
  }, [icons]);

  // Get available variants for current icon pack
  const availableVariants = useMemo(() => {
    if (!icons.length) return [];
    
    switch (iconPack) {
      case 'heroicons':
        return ['outline', 'solid', 'mini'];
      case 'phosphor':
        return ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'];
      case 'tabler':
        return ['outline', 'filled'];
      case 'fluent':
        return ['regular', 'filled'];
      default:
        return [];
    }
  }, [iconPack, icons]);

  const handleIconClick = async (iconName: string) => {
    if (onIconSelect) {
      // Get SVG content using the IconRenderer's logic
      try {
        // This will be handled by the IconRenderer component
        onIconSelect(iconName, ''); // Will be filled by the renderer
      } catch (error) {
        console.error('Error getting icon SVG:', error);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.01
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="icon-grid-loading">
        <div className="loading-spinner">Loading {iconPack} icons...</div>
      </div>
    );
  }

  return (
    <div className="icon-grid-container">
      {/* Search and Filter Controls */}
      <div className="icon-grid-controls">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder={`Search ${iconPack} icons...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="category-filter">
            <Filter size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {showVariants && availableVariants.length > 0 && (
            <div className="variant-filter">
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="variant-select"
              >
                {availableVariants.map(variant => (
                  <option key={variant} value={variant}>
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="results-count">
        {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} found
      </div>

      {/* Icon Grid */}
      <motion.div
        className="icon-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredIcons.map((icon) => (
          <motion.div
            key={icon.name}
            className={`icon-grid-item ${hoveredIcon === icon.name ? 'hovered' : ''}`}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleIconClick(icon.name)}
            onHoverStart={() => setHoveredIcon(icon.name)}
            onHoverEnd={() => setHoveredIcon(null)}
          >
            <div className="icon-container">
              <IconRenderer
                iconPack={iconPack}
                iconName={icon.name}
                size={defaultSize}
                variant={selectedVariant}
                className="grid-icon"
              />
            </div>
            <div className="icon-info">
              <span className="icon-name">{icon.displayName}</span>
              <span className="icon-categories">
                {icon.categories.join(', ')}
              </span>
            </div>
            
            {hoveredIcon === icon.name && (
              <motion.div
                className="icon-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <button
                  className="action-btn download-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle download
                  }}
                >
                  <Download size={14} />
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {filteredIcons.length === 0 && !loading && (
        <div className="no-results">
          <p>No icons found matching your search criteria.</p>
          <p>Try adjusting your search term or category filter.</p>
        </div>
      )}
    </div>
  );
};

export default IconGrid;