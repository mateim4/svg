import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3X3, List, Download, Filter, Eye, Info } from 'lucide-react';
import './FluentUIIconBrowser.css';
import { styleSvg } from '../utils/svgStyler';

interface FluentUIIcon {
  name: string;
  svgFiles: File[];
  metadata?: any;
  sizes: number[];
  variants: string[];
}

interface FluentUIIconBrowserProps {
  icons: FluentUIIcon[];
  config?: import('../types/IconConfig').IconConfig;
  onIconSelect?: (icon: FluentUIIcon, selectedFiles: File[]) => void;
  onBulkSelect?: (selectedFiles: File[]) => void;
}

const FluentUIIconBrowser: React.FC<FluentUIIconBrowserProps> = ({
  icons,
  config,
  onIconSelect,
  onBulkSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());
  const [previewIcon, setPreviewIcon] = useState<FluentUIIcon | null>(null);

  // Get all available variants and sizes across icons
  const { allVariants, allSizes } = useMemo(() => {
    const variants = new Set<string>();
    const sizes = new Set<number>();
    
    icons.forEach(icon => {
      icon.variants.forEach(v => variants.add(v));
      icon.sizes.forEach(s => sizes.add(s));
    });
    
    return {
      allVariants: Array.from(variants).sort(),
      allSizes: Array.from(sizes).sort((a, b) => a - b)
    };
  }, [icons]);

  // Filter icons based on search and filters
  const filteredIcons = useMemo(() => {
    return icons.filter(icon => {
      const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (icon.metadata?.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesVariant = selectedVariant === 'all' || icon.variants.includes(selectedVariant);
      const matchesSize = selectedSize === 'all' || icon.sizes.includes(selectedSize as number);
      
      return matchesSearch && matchesVariant && matchesSize;
    });
  }, [icons, searchTerm, selectedVariant, selectedSize]);

  const toggleIconSelection = (iconName: string) => {
    const newSelected = new Set(selectedIcons);
    if (newSelected.has(iconName)) {
      newSelected.delete(iconName);
    } else {
      newSelected.add(iconName);
    }
    setSelectedIcons(newSelected);
  };

  const handleBulkDownload = () => {
    if (onBulkSelect) {
      const selectedFiles: File[] = [];
      filteredIcons.forEach(icon => {
        if (selectedIcons.has(icon.name)) {
          selectedFiles.push(...icon.svgFiles);
        }
      });
      onBulkSelect(selectedFiles);
    }
  };

  const getIconPreview = async (icon: FluentUIIcon): Promise<string | null> => {
    // Try to get a regular 24px icon first, fallback to any available
    let targetFile = icon.svgFiles.find(f => 
      f.name.includes('_24_regular') || f.name.includes('_20_regular')
    );
    if (!targetFile) {
      targetFile = icon.svgFiles[0];
    }
    
    if (targetFile) {
      try {
        const raw = await targetFile.text();
        // Apply styling if config provided
        return config ? styleSvg(raw, config) : raw;
      } catch (e) {
        console.warn('Failed to read SVG for preview:', e);
      }
    }
    return null;
  };

  return (
    <div className="fluentui-icon-browser">
      <div className="browser-header">
        <div className="header-info">
          <h3>
            <Grid3X3 size={20} />
            FluentUI Icons ({filteredIcons.length})
          </h3>
          <p>Select icons to process individually or in bulk</p>
        </div>
        
        <div className="header-actions">
          {selectedIcons.size > 0 && (
            <motion.button
              className="bulk-action-btn"
              onClick={handleBulkDownload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={16} />
              Process Selected ({selectedIcons.size})
            </motion.button>
          )}
        </div>
      </div>

      <div className="browser-controls">
        <div className="search-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filters">
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
            >
              <option value="all">All Variants</option>
              {allVariants.map(variant => (
                <option key={variant} value={variant}>
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            >
              <option value="all">All Sizes</option>
              {allSizes.map(size => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="view-controls">
          <button
            className={`view-mode ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            className={`view-mode ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <div className={`icons-container ${viewMode}`}>
        {filteredIcons.map((icon, index) => (
            <FluentIconCard
              key={icon.name}
              icon={icon}
              config={config}
              isSelected={selectedIcons.has(icon.name)}
              onSelect={() => toggleIconSelection(icon.name)}
              onPreview={() => setPreviewIcon(icon)}
              onProcess={() => onIconSelect && onIconSelect(icon, icon.svgFiles)}
              viewMode={viewMode}
              index={index}
            />
          ))}
      </div>

      {filteredIcons.length === 0 && (
        <div className="empty-state">
          <Filter size={48} />
          <h4>No icons found</h4>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

// Memoized icon card component
const FluentIconCard = React.memo<{
  icon: FluentUIIcon;
  config?: import('../types/IconConfig').IconConfig;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onProcess: () => void;
  viewMode: 'grid' | 'list';
  index: number;
}>(({ icon, config, isSelected, onSelect, onPreview, onProcess, viewMode, index }) => {
  const [previewSvg, setPreviewSvg] = useState<string | null>(null);

  React.useEffect(() => {
    // Load preview SVG and re-style when `icon` or `config` changes
    const loadPreview = async () => {
      let targetFile = icon.svgFiles.find(f => 
        f.name.includes('_24_regular') || f.name.includes('_20_regular')
      );
      if (!targetFile) {
        targetFile = icon.svgFiles[0];
      }
      
      if (targetFile) {
        try {
          const raw = await targetFile.text();
          setPreviewSvg(config ? styleSvg(raw, config) : raw);
        } catch (e) {
          console.warn('Failed to load SVG preview:', e);
        }
      }
    };
    
    loadPreview();
  }, [icon, config]);

  return (
    <motion.div
      className={`icon-card ${viewMode} ${isSelected ? 'selected' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.5) }}
      layout={false}
    >
      <div className="icon-preview" onClick={onPreview}>
        {previewSvg ? (
          <div dangerouslySetInnerHTML={{ __html: previewSvg }} />
        ) : (
          <div className="loading-preview">⏳</div>
        )}
      </div>
      
      <div className="icon-info">
        <h4 className="icon-name">{icon.name}</h4>
        <div className="icon-details">
          <span className="variants">
            {icon.variants.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')}
          </span>
          <span className="sizes">
            {icon.sizes.join('px, ')}px
          </span>
          <span className="file-count">
            {icon.svgFiles.length} files
          </span>
        </div>
        {icon.metadata?.description && (
          <p className="icon-description">{icon.metadata.description}</p>
        )}
      </div>
      
      <div className="icon-actions">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="icon-checkbox"
        />
        <button className="process-btn" onClick={onProcess}>
          <Eye size={16} />
          Process
        </button>
      </div>
    </motion.div>
  );
});

export default FluentUIIconBrowser;