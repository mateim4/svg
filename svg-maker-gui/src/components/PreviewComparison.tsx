import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Download,
  Eye,
  EyeOff,
  Layers,
  Grid,
  Maximize2
} from 'lucide-react';
import { IconConfig } from '../types/IconConfig';
import './PreviewComparison.css';

interface PreviewItem {
  id: string;
  name: string;
  originalSvg: string;
  processedSvg?: string;
}

interface PreviewComparisonProps {
  items: PreviewItem[];
  config: IconConfig;
  onConfigChange?: (config: IconConfig) => void;
  selectedItem?: PreviewItem | null;
  onItemSelect?: (item: PreviewItem) => void;
}

const PreviewComparison: React.FC<PreviewComparisonProps> = ({
  items,
  config,
  onConfigChange,
  selectedItem,
  onItemSelect
}) => {
  const [viewMode, setViewMode] = useState<'comparison' | 'gallery' | 'fullscreen'>('comparison');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showProcessed, setShowProcessed] = useState(true);
  const [backgroundPattern, setBackgroundPattern] = useState<'transparent' | 'light' | 'dark' | 'grid'>('grid');
  const currentItem = selectedItem || items[0];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownload = (svg: string, filename: string) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getBackgroundClass = () => {
    switch (backgroundPattern) {
      case 'transparent': return 'bg-transparent';
      case 'light': return 'bg-light';
      case 'dark': return 'bg-dark';
      case 'grid': return 'bg-grid';
      default: return 'bg-grid';
    }
  };

  const renderSvgPreview = (svg: string, label: string, type: 'original' | 'processed') => (
    <motion.div 
      className={`preview-panel ${type}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="preview-header">
        <h4>{label}</h4>
        <div className="preview-actions">
          <button
            onClick={() => type === 'original' ? setShowOriginal(!showOriginal) : setShowProcessed(!showProcessed)}
            className="toggle-visibility"
            title={`Toggle ${label.toLowerCase()} visibility`}
          >
            {(type === 'original' ? showOriginal : showProcessed) ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            onClick={() => handleDownload(svg, `${currentItem?.name}-${type}.svg`)}
            className="download-button"
            title={`Download ${label.toLowerCase()}`}
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      
      <div className={`svg-container ${getBackgroundClass()}`}>
        <div 
          className="svg-wrapper"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: svg }}
            className="svg-content"
          />
        </div>
      </div>

    </motion.div>
  );

  return (
    <div className="preview-comparison">
      {/* Controls Header */}
      <div className="preview-controls">
        <div className="view-controls">
          <div className="control-group">
            <label>View Mode:</label>
            <div className="button-group">
              <button 
                className={viewMode === 'comparison' ? 'active' : ''}
                onClick={() => setViewMode('comparison')}
              >
                <Layers size={16} />
                Comparison
              </button>
              <button 
                className={viewMode === 'gallery' ? 'active' : ''}
                onClick={() => setViewMode('gallery')}
              >
                <Grid size={16} />
                Gallery
              </button>
              <button 
                className={viewMode === 'fullscreen' ? 'active' : ''}
                onClick={() => setViewMode('fullscreen')}
              >
                <Maximize2 size={16} />
                Fullscreen
              </button>
            </div>
          </div>

          <div className="control-group">
            <label>Background:</label>
            <select 
              value={backgroundPattern}
              onChange={(e) => setBackgroundPattern(e.target.value as any)}
            >
              <option value="grid">Grid</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>
        </div>

        <div className="zoom-controls">
          <button onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
            <ZoomOut size={16} />
          </button>
          <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
          <button onClick={handleZoomIn} disabled={zoomLevel >= 3}>
            <ZoomIn size={16} />
          </button>
          <button onClick={handleResetZoom} className="reset-zoom">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Item Selector (for gallery mode) */}
      {items.length > 1 && (
        <div className="item-selector">
          <div className="item-thumbnails">
            {items.map((item) => (
              <motion.button
                key={item.id}
                className={`thumbnail ${selectedItem?.id === item.id ? 'selected' : ''}`}
                onClick={() => onItemSelect?.(item)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className="thumbnail-svg"
                  dangerouslySetInnerHTML={{ __html: item.originalSvg }}
                />
                <span className="thumbnail-name">{item.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Main Preview Area */}
      <div className={`preview-area view-${viewMode}`}>
        {viewMode === 'comparison' && currentItem && (
          <div className="comparison-view">
            <div className="comparison-panels">
              {showOriginal && renderSvgPreview(currentItem.originalSvg, 'Original', 'original')}
              {showProcessed && currentItem.processedSvg && renderSvgPreview(currentItem.processedSvg, `${config.style} Style`, 'processed')}
            </div>
          </div>
        )}

        {viewMode === 'gallery' && (
          <div className="gallery-view">
            <div className="gallery-grid">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  className="gallery-item"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="gallery-item-header">
                    <h5>{item.name}</h5>
                    <button
                      onClick={() => item.processedSvg && handleDownload(item.processedSvg, `${item.name}-${config.style}.svg`)}
                      className="download-button"
                      disabled={!item.processedSvg}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                  
                  <div className="gallery-comparison">
                    <div className="gallery-original">
                      <div 
                        className={`svg-container ${getBackgroundClass()}`}
                        dangerouslySetInnerHTML={{ __html: item.originalSvg }}
                      />
                      <span>Original</span>
                    </div>
                    
                    {item.processedSvg && (
                      <div className="gallery-processed">
                        <div 
                          className={`svg-container ${getBackgroundClass()}`}
                          dangerouslySetInnerHTML={{ __html: item.processedSvg }}
                        />
                        <span>Processed</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'fullscreen' && currentItem && (
          <div className="fullscreen-view">
            <div className="fullscreen-content">
              <div 
                className={`fullscreen-svg ${getBackgroundClass()}`}
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <div
                  dangerouslySetInnerHTML={{ 
                    __html: (showProcessed && currentItem.processedSvg) ? currentItem.processedSvg : currentItem.originalSvg 
                  }}
                />
              </div>
            </div>
            
            <div className="fullscreen-info">
              <h4>{currentItem.name}</h4>
              <p>{showProcessed && currentItem.processedSvg ? `${config.style} Style` : 'Original'}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default PreviewComparison;