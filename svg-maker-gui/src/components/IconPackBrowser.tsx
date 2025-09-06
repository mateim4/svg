import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Download, Palette } from 'lucide-react';
import IconGrid from './IconGrid';
import IconRenderer from './IconRenderer';
import './IconPackBrowser.css';

interface IconPackBrowserProps {
  iconPack: 'lucide' | 'heroicons' | 'feather' | 'phosphor' | 'tabler' | 'fluent';
  onBack: () => void;
  onIconSelect?: (iconName: string, svgContent: string) => void;
}

export const IconPackBrowser: React.FC<IconPackBrowserProps> = ({
  iconPack,
  onBack,
  onIconSelect
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedSvg, setSelectedSvg] = useState<string>('');
  const [currentVariant, setCurrentVariant] = useState<string>('');
  const [currentSize, setCurrentSize] = useState(24);
  const [showSettings, setShowSettings] = useState(false);

  // Get icon pack metadata
  const getIconPackInfo = () => {
    switch (iconPack) {
      case 'lucide':
        return {
          name: 'Lucide Icons',
          description: 'Beautiful & consistent icon toolkit made by the community',
          website: 'https://lucide.dev',
          defaultVariant: '',
          variants: [],
          supportsStrokeWidth: true,
          defaultStrokeWidth: 2
        };
      case 'heroicons':
        return {
          name: 'Heroicons',
          description: 'Beautiful hand-crafted SVG icons by the makers of Tailwind CSS',
          website: 'https://heroicons.com',
          defaultVariant: 'outline',
          variants: ['outline', 'solid', 'mini'],
          supportsStrokeWidth: true,
          defaultStrokeWidth: 1.5
        };
      case 'feather':
        return {
          name: 'Feather Icons',
          description: 'Simply beautiful open source icons',
          website: 'https://feathericons.com',
          defaultVariant: '',
          variants: [],
          supportsStrokeWidth: true,
          defaultStrokeWidth: 2
        };
      case 'phosphor':
        return {
          name: 'Phosphor Icons',
          description: 'A flexible icon family for interfaces, diagrams, presentations',
          website: 'https://phosphoricons.com',
          defaultVariant: 'regular',
          variants: ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'],
          supportsStrokeWidth: false,
          defaultStrokeWidth: 2
        };
      case 'tabler':
        return {
          name: 'Tabler Icons',
          description: 'Over 5800 free MIT-licensed high-quality SVG icons',
          website: 'https://tabler-icons.io',
          defaultVariant: 'outline',
          variants: ['outline', 'filled'],
          supportsStrokeWidth: true,
          defaultStrokeWidth: 2
        };
      case 'fluent':
        return {
          name: 'Fluent UI Icons',
          description: 'Microsoft\'s Fluent Design System icons',
          website: 'https://developer.microsoft.com/fluentui',
          defaultVariant: 'regular',
          variants: ['regular', 'filled', 'light'],
          supportsStrokeWidth: false,
          defaultStrokeWidth: 2
        };
      default:
        return {
          name: 'Unknown',
          description: '',
          website: '',
          defaultVariant: '',
          variants: [],
          supportsStrokeWidth: false,
          defaultStrokeWidth: 2
        };
    }
  };

  const iconPackInfo = getIconPackInfo();

  useEffect(() => {
    if (!currentVariant && iconPackInfo.defaultVariant) {
      setCurrentVariant(iconPackInfo.defaultVariant);
    }
  }, [iconPack, iconPackInfo.defaultVariant]);

  const handleIconSelect = (iconName: string, svgContent: string) => {
    setSelectedIcon(iconName);
    setSelectedSvg(svgContent);
    if (onIconSelect) {
      onIconSelect(iconName, svgContent);
    }
  };

  const handleDownloadIcon = () => {
    if (!selectedIcon || !selectedSvg) return;
    
    const blob = new Blob([selectedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedIcon}-${iconPack}${currentVariant ? `-${currentVariant}` : ''}-${currentSize}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="icon-pack-browser">
      {/* Header */}
      <div className="browser-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="pack-info">
            <h1>{iconPackInfo.name}</h1>
            <p>{iconPackInfo.description}</p>
          </div>
        </div>
        
        <div className="header-right">
          <button
            className={`settings-button ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          className="settings-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="settings-content">
            <div className="setting-group">
              <label>Icon Size</label>
              <input
                type="range"
                min="16"
                max="64"
                step="4"
                value={currentSize}
                onChange={(e) => setCurrentSize(parseInt(e.target.value))}
              />
              <span>{currentSize}px</span>
            </div>

            {iconPackInfo.variants.length > 0 && (
              <div className="setting-group">
                <label>Variant</label>
                <select
                  value={currentVariant}
                  onChange={(e) => setCurrentVariant(e.target.value)}
                >
                  {iconPackInfo.variants.map(variant => (
                    <option key={variant} value={variant}>
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="setting-group">
              <label>Website</label>
              <a
                href={iconPackInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="website-link"
              >
                {iconPackInfo.website}
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected Icon Preview */}
      {selectedIcon && (
        <motion.div
          className="selected-icon-preview"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="preview-content">
            <div className="preview-icon">
              <IconRenderer
                iconPack={iconPack}
                iconName={selectedIcon}
                size={48}
                variant={currentVariant}
                onLoad={setSelectedSvg}
              />
            </div>
            <div className="preview-info">
              <h3>{selectedIcon.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
              <p>{iconPack} • {currentVariant || 'default'} • {currentSize}px</p>
            </div>
            <div className="preview-actions">
              <button onClick={handleDownloadIcon} className="action-button">
                <Download size={16} />
                Download
              </button>
              <button
                onClick={() => {
                  if (onIconSelect && selectedSvg) {
                    onIconSelect(selectedIcon, selectedSvg);
                  }
                }}
                className="action-button primary"
              >
                <Palette size={16} />
                Style Icon
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Icon Grid */}
      <div className="browser-content">
        <IconGrid
          iconPack={iconPack}
          onIconSelect={handleIconSelect}
          showVariants={true}
          defaultSize={currentSize}
        />
      </div>
    </div>
  );
};

export default IconPackBrowser;