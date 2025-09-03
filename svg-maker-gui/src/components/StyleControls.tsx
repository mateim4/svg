import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Settings, Layers, Download } from 'lucide-react';
import { IconConfig, StylePreset, Gradient } from '../types/IconConfig';
import './StyleControls.css';

interface StyleControlsProps {
  config: IconConfig;
  onConfigChange: (config: IconConfig) => void;
}

const StyleControls: React.FC<StyleControlsProps> = ({ config, onConfigChange }) => {
  const [showPaletteImport, setShowPaletteImport] = useState(false);
  const [paletteInput, setPaletteInput] = useState('');
  const [paletteError, setPaletteError] = useState('');

  const updateConfig = (updates: Partial<IconConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const updateGradient = (gradientUpdates: Partial<Gradient>) => {
    if (!config.gradient) {
      updateConfig({
        gradient: {
          angle: 90,
          startColor: '#ff0000',
          stopColor: '#00ff00',
          ...gradientUpdates,
        },
      });
    } else {
      updateConfig({
        gradient: { ...config.gradient, ...gradientUpdates },
      });
    }
  };

  const importColorPalette = () => {
    setPaletteError('');
    
    if (!paletteInput.trim()) {
      setPaletteError('Please enter a coolors.co URL or color palette');
      return;
    }

    try {
      let colors: string[] = [];
      
      // Parse coolors.co URL
      const coolorsMatch = paletteInput.match(/coolors\.co\/([a-fA-F0-9-]+)/);
      if (coolorsMatch && coolorsMatch[1]) {
        colors = coolorsMatch[1].split('-').map(c => `#${c}`);
      } else {
        // Parse comma/space separated colors
        colors = paletteInput
          .split(/[,\s]+/)
          .map(c => c.trim())
          .filter(c => c.length > 0)
          .map(c => c.startsWith('#') ? c : `#${c}`);
      }

      // Validate colors
      const validColors = colors.filter(c => /^#[0-9a-fA-F]{6}$/i.test(c));
      
      if (validColors.length < 2) {
        setPaletteError('Please provide at least 2 valid hex colors');
        return;
      }
      
      if (validColors.length > 12) {
        validColors.splice(12); // Limit to 12 colors
      }

      // Apply colors to configuration
      updateConfig({ iconColor: validColors[0] });
      
      if (validColors.length >= 2) {
        updateGradient({
          startColor: validColors[1],
          stopColor: validColors[2] || validColors[1],
          angle: 45
        });
      }

      setShowPaletteImport(false);
      setPaletteInput('');
      
    } catch (error) {
      setPaletteError('Invalid color palette format');
    }
  };

  return (
    <div className="style-controls">
      <motion.div
        className="control-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="section-header">
          <Layers size={20} />
          <h3>Style Preset</h3>
        </div>
        
        <div className="preset-buttons">
          {(['neumorphism', 'glassmorphism', 'flat-design', 'fluentui'] as StylePreset[]).map((preset) => (
            <motion.button
              key={preset}
              className={`preset-button ${config.style === preset ? 'active' : ''}`}
              onClick={() => updateConfig({ style: preset })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`preset-preview ${preset}`}></div>
              {preset.charAt(0).toUpperCase() + preset.slice(1).replace(/[-]/g, ' ')}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="control-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="section-header">
          <Settings size={20} />
          <h3>Dimensions</h3>
        </div>
        
        <div className="control-grid">
          <div className="control-item">
            <label>Width</label>
            <input
              type="number"
              value={config.width}
              onChange={(e) => updateConfig({ width: parseInt(e.target.value) || 128 })}
              min="32"
              max="512"
            />
          </div>
          
          <div className="control-item">
            <label>Height</label>
            <input
              type="number"
              value={config.height}
              onChange={(e) => updateConfig({ height: parseInt(e.target.value) || 128 })}
              min="32"
              max="512"
            />
          </div>
          
          <div className="control-item">
            <label>Corner Radius</label>
            <input
              type="number"
              value={config.cornerRadius}
              onChange={(e) => updateConfig({ cornerRadius: parseFloat(e.target.value) || 25 })}
              min="0"
              max="50"
              step="0.5"
            />
          </div>
          
          <div className="control-item">
            <label>Padding</label>
            <input
              type="number"
              value={config.padding}
              onChange={(e) => updateConfig({ padding: parseInt(e.target.value) || 16 })}
              min="0"
              max="50"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="control-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Palette size={20} />
            <h3>Colors</h3>
          </div>
          <motion.button
            className="palette-import-btn"
            onClick={() => setShowPaletteImport(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Import colors from coolors.co or paste hex colors"
          >
            <Download size={16} />
            Import Palette
          </motion.button>
        </div>
        
        <div className="color-controls">
          <div className="control-item">
            <label>Icon Color</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={config.iconColor}
                onChange={(e) => updateConfig({ iconColor: e.target.value })}
              />
              <input
                type="text"
                value={config.iconColor}
                onChange={(e) => updateConfig({ iconColor: e.target.value })}
                placeholder="#333333"
              />
            </div>
          </div>
          
          <div className="gradient-section">
            <div className="gradient-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={config.gradient !== null}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateGradient({});
                    } else {
                      updateConfig({ gradient: null });
                    }
                  }}
                />
                Use Gradient
              </label>
            </div>
            
            {config.gradient && (
              <motion.div
                className="gradient-controls"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="control-item">
                  <label>Angle</label>
                  <input
                    type="range"
                    value={config.gradient.angle}
                    onChange={(e) => updateGradient({ angle: parseInt(e.target.value) })}
                    min="0"
                    max="360"
                  />
                  <span>{config.gradient.angle}°</span>
                </div>
                
                <div className="control-item">
                  <label>Start Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={config.gradient.startColor}
                      onChange={(e) => updateGradient({ startColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={config.gradient.startColor}
                      onChange={(e) => updateGradient({ startColor: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="control-item">
                  <label>Stop Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={config.gradient.stopColor}
                      onChange={(e) => updateGradient({ stopColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={config.gradient.stopColor}
                      onChange={(e) => updateGradient({ stopColor: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Palette Import Modal */}
          {showPaletteImport && (
            <motion.div
              className="palette-import-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="modal-content">
                <h4>Import Color Palette</h4>
                <p>Paste a coolors.co URL or comma-separated hex colors (2-12 colors)</p>
                
                <div className="import-input-group">
                  <input
                    type="text"
                    value={paletteInput}
                    onChange={(e) => setPaletteInput(e.target.value)}
                    placeholder="https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51 or #264653, #2a9d8f, #e9c46a"
                    className={paletteError ? 'error' : ''}
                  />
                  
                  {paletteError && (
                    <div className="import-error">
                      {paletteError}
                    </div>
                  )}
                </div>
                
                <div className="modal-actions">
                  <motion.button
                    className="import-btn"
                    onClick={importColorPalette}
                    disabled={!paletteInput.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Import Colors
                  </motion.button>
                  
                  <motion.button
                    className="cancel-btn"
                    onClick={() => {
                      setShowPaletteImport(false);
                      setPaletteInput('');
                      setPaletteError('');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
                
                <div className="palette-examples">
                  <p>Examples:</p>
                  <div className="example-links">
                    {[
                      { name: 'Warm Sunset', url: 'https://coolors.co/ff6b35-f7931e-ffd23f-06ffa5-118ab2' },
                      { name: 'Cool Ocean', url: 'https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51' },
                      { name: 'Purple Dream', url: 'https://coolors.co/480ca8-7209b7-a663cc-4c956c-eae4e9' },
                    ].map((example, index) => (
                      <motion.button
                        key={index}
                        className="example-btn"
                        onClick={() => setPaletteInput(example.url)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {example.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StyleControls;