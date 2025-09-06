import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Download } from 'lucide-react';
import { IconConfig, StylePreset, Gradient } from '../types/IconConfig';
import './StyleControls.css';

interface StyleControlsProps {
  config: IconConfig;
  onConfigChange: (config: IconConfig) => void;
}

const StyleControls = React.memo<StyleControlsProps>(({ config, onConfigChange }) => {
  const [showPaletteImport, setShowPaletteImport] = useState(false);
  const [paletteInput, setPaletteInput] = useState('');
  const [paletteError, setPaletteError] = useState('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced config update to prevent excessive re-renders
  const debouncedConfigChange = useCallback((updates: Partial<IconConfig>) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onConfigChange({ ...config, ...updates });
    }, 150); // 150ms debounce delay
  }, [config, onConfigChange]);

  // Immediate update for non-performance-critical changes like style presets
  const updateConfig = useCallback((updates: Partial<IconConfig>) => {
    onConfigChange({ ...config, ...updates });
  }, [config, onConfigChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Gradient caching
  const cacheGradient = (gradient: Gradient) => {
    localStorage.setItem('lastUsedGradient', JSON.stringify(gradient));
  };

  const getLastUsedGradient = (): Gradient => {
    try {
      const cached = localStorage.getItem('lastUsedGradient');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to load cached gradient:', error);
    }
    // Default gradient
    return {
      angle: 45,
      startColor: '#667eea',
      stopColor: '#764ba2'
    };
  };

  const updateGradient = (gradientUpdates: Partial<Gradient>) => {
    let newGradient: Gradient;
    
    if (!config.gradient) {
      // Use cached gradient as base, or default
      const baseGradient = getLastUsedGradient();
      newGradient = {
        ...baseGradient,
        ...gradientUpdates,
      };
    } else {
      newGradient = { ...config.gradient, ...gradientUpdates };
    }
    
    // Cache the new gradient
    cacheGradient(newGradient);
    
    updateConfig({
      gradient: newGradient,
    });
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
        className="control-section merged-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Palette size={20} />
            <h3>Style & Options</h3>
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
        
        <div className="merged-content">
          {/* Style Presets */}
          <div className="preset-row">
            <label>Style:</label>
            <div className="preset-buttons-horizontal">
              {(['neumorphism', 'glassmorphism', 'pixel-art'] as StylePreset[]).map((preset) => (
                <motion.button
                  key={preset}
                  className={`preset-button-mini ${config.style === preset ? 'active' : ''}`}
                  onClick={() => updateConfig({ style: preset })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={preset.charAt(0).toUpperCase() + preset.slice(1).replace(/[-]/g, ' ')}
                >
                  <div className={`preset-preview-mini ${preset}`}></div>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Compact Controls Grid */}
          <div className="compact-controls">
            <div className="control-row">
              <div className="control-item-mini">
                <label>Size</label>
                <div className="size-inputs">
                  <input
                    type="number"
                    value={config.width}
                    onChange={(e) => debouncedConfigChange({ width: parseInt(e.target.value) || 128 })}
                    min="32"
                    max="512"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={config.height}
                    onChange={(e) => debouncedConfigChange({ height: parseInt(e.target.value) || 128 })}
                    min="32"
                    max="512"
                  />
                </div>
              </div>
              
              <div className="control-item-mini">
                <label>Radius</label>
                <input
                  type="number"
                  value={config.cornerRadius}
                  onChange={(e) => debouncedConfigChange({ cornerRadius: parseFloat(e.target.value) || 25 })}
                  min="0"
                  max="50"
                  step="0.5"
                />
              </div>
              
              <div className="control-item-mini">
                <label>Padding</label>
                <input
                  type="number"
                  value={config.padding}
                  onChange={(e) => debouncedConfigChange({ padding: parseInt(e.target.value) || 16 })}
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </div>
          
          {/* Five Column Settings Layout */}
          <div className="five-column-settings">
            {/* Column 1: Background Controls (Glassmorphism) */}
            {config.style === 'glassmorphism' ? (
              <div className="glass-background-section">
                <div className="gradient-toggle">
                  <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#6b46c1' }}>Background</h5>
                </div>
                <div className="control-item-mini">
                  <label>Transparency</label>
                  <div className="range-input">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={config.glassBackgroundTransparency || 0.3}
                      onChange={(e) => updateConfig({ glassBackgroundTransparency: parseFloat(e.target.value) })}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round((config.glassBackgroundTransparency || 0.3) * 100)}
                      onChange={(e) => updateConfig({ glassBackgroundTransparency: (parseInt(e.target.value) || 0) / 100 })}
                      className="range-text-input"
                    />
                    <span>%</span>
                  </div>
                </div>
                
              </div>
            ) : <div></div>}

            {/* Column 2: Icon Controls (Glassmorphism) */}
            {config.style === 'glassmorphism' ? (
              <div className="glass-icon-section">
                <div className="gradient-toggle">
                  <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#6b46c1' }}>Icon</h5>
                </div>
                <div className="control-item-mini">
                  <label>Transparency</label>
                  <div className="range-input">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={config.glassIconTransparency || 0.8}
                      onChange={(e) => updateConfig({ glassIconTransparency: parseFloat(e.target.value) })}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round((config.glassIconTransparency || 0.8) * 100)}
                      onChange={(e) => updateConfig({ glassIconTransparency: (parseInt(e.target.value) || 0) / 100 })}
                      className="range-text-input"
                    />
                    <span>%</span>
                  </div>
                </div>
                
                <div className="control-item-mini">
                  <label>Blur</label>
                  <div className="range-input">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={config.glassIconBlur || 0}
                      onChange={(e) => updateConfig({ glassIconBlur: parseFloat(e.target.value) })}
                    />
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={config.glassIconBlur || 0}
                      onChange={(e) => updateConfig({ glassIconBlur: parseFloat(e.target.value) || 0 })}
                      className="range-text-input"
                    />
                    <span>px</span>
                  </div>
                </div>
              </div>
            ) : <div></div>}

            {/* Column 3: Drop Shadow Controls */}
            <div className="drop-shadow-section">
            <div className="gradient-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={config.dropShadowEnabled || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateConfig({ 
                        dropShadowEnabled: true,
                        dropShadowX: config.dropShadowX || 4,
                        dropShadowY: config.dropShadowY || 4,
                        dropShadowBlur: config.dropShadowBlur || 8,
                        dropShadowOpacity: config.dropShadowOpacity || 0.3,
                        dropShadowColor: config.dropShadowColor || '#000000'
                      });
                    } else {
                      updateConfig({ dropShadowEnabled: false });
                    }
                  }}
                />
                Drop Shadow
              </label>
            </div>
            
            {config.dropShadowEnabled && (
              <motion.div
                className="drop-shadow-controls"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="shadow-position-row">
                  <div className="control-item-mini">
                    <label>X Offset</label>
                    <div className="range-input">
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={config.dropShadowX || 4}
                        onChange={(e) => updateConfig({ dropShadowX: parseInt(e.target.value) })}
                      />
                      <input
                        type="number"
                        min="-20"
                        max="20"
                        value={config.dropShadowX || 4}
                        onChange={(e) => updateConfig({ dropShadowX: parseInt(e.target.value) || 0 })}
                        className="range-text-input"
                      />
                      <span>px</span>
                    </div>
                  </div>
                  
                  <div className="control-item-mini">
                    <label>Y Offset</label>
                    <div className="range-input">
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={config.dropShadowY || 4}
                        onChange={(e) => updateConfig({ dropShadowY: parseInt(e.target.value) })}
                      />
                      <input
                        type="number"
                        min="-20"
                        max="20"
                        value={config.dropShadowY || 4}
                        onChange={(e) => updateConfig({ dropShadowY: parseInt(e.target.value) || 0 })}
                        className="range-text-input"
                      />
                      <span>px</span>
                    </div>
                  </div>
                </div>
                
                <div className="shadow-settings-row">
                  <div className="control-item-mini">
                    <label>Blur</label>
                    <div className="range-input">
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={config.dropShadowBlur || 8}
                        onChange={(e) => updateConfig({ dropShadowBlur: parseInt(e.target.value) })}
                      />
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={config.dropShadowBlur || 8}
                        onChange={(e) => updateConfig({ dropShadowBlur: parseInt(e.target.value) || 0 })}
                        className="range-text-input"
                      />
                      <span>px</span>
                    </div>
                  </div>
                  
                  <div className="control-item-mini">
                    <label>Opacity</label>
                    <div className="range-input">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.dropShadowOpacity || 0.3}
                        onChange={(e) => updateConfig({ dropShadowOpacity: parseFloat(e.target.value) })}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round((config.dropShadowOpacity || 0.3) * 100)}
                        onChange={(e) => updateConfig({ dropShadowOpacity: (parseInt(e.target.value) || 0) / 100 })}
                        className="range-text-input"
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
                
                <div className="shadow-color-row">
                  <div className="control-item">
                    <label>Shadow Color</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={config.dropShadowColor || '#000000'}
                        onChange={(e) => updateConfig({ dropShadowColor: e.target.value })}
                      />
                      <input
                        type="text"
                        value={config.dropShadowColor || '#000000'}
                        onChange={(e) => updateConfig({ dropShadowColor: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  
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
                </div>
              </motion.div>
            )}
          </div>

          {/* Outline Controls */}
          <div className="outline-section">
            <div className="gradient-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={config.outlineEnabled || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateConfig({ 
                        outlineEnabled: true,
                        outlineWidth: config.outlineWidth || 2,
                        outlineColor: config.outlineColor || '#000000',
                        outlineOpacity: config.outlineOpacity || 1
                      });
                    } else {
                      updateConfig({ outlineEnabled: false });
                    }
                  }}
                />
                Outline
              </label>
            </div>
            
            {config.outlineEnabled && (
              <motion.div
                className="outline-controls"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="outline-settings-row">
                  <div className="control-item-mini">
                    <label>Width</label>
                    <div className="range-input">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={config.outlineWidth || 2}
                        onChange={(e) => updateConfig({ outlineWidth: parseFloat(e.target.value) })}
                      />
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={config.outlineWidth || 2}
                        onChange={(e) => updateConfig({ outlineWidth: parseFloat(e.target.value) || 0 })}
                        className="range-text-input"
                      />
                      <span>px</span>
                    </div>
                  </div>
                  
                  <div className="control-item-mini">
                    <label>Opacity</label>
                    <div className="range-input">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.outlineOpacity || 1}
                        onChange={(e) => updateConfig({ outlineOpacity: parseFloat(e.target.value) })}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round((config.outlineOpacity || 1) * 100)}
                        onChange={(e) => updateConfig({ outlineOpacity: (parseInt(e.target.value) || 0) / 100 })}
                        className="range-text-input"
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
                
                <div className="control-item">
                  <label>Outline Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={config.outlineColor || '#000000'}
                      onChange={(e) => updateConfig({ outlineColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={config.outlineColor || '#000000'}
                      onChange={(e) => updateConfig({ outlineColor: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>


          {/* Color Controls */}
          <div className="color-controls">
          
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
                  <div className="range-input">
                    <input
                      type="range"
                      value={config.gradient.angle}
                      onChange={(e) => updateGradient({ angle: parseInt(e.target.value) })}
                      min="0"
                      max="360"
                    />
                    <input
                      type="number"
                      value={config.gradient.angle}
                      onChange={(e) => updateGradient({ angle: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="360"
                      className="range-text-input"
                    />
                    <span>°</span>
                  </div>
                </div>
                
                <div className="gradient-colors-row">
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
                </div>
              </motion.div>
            )}
          </div>
          
          </div>
          
          {/* Pixel Art Controls */}
          {config.style === 'pixel-art' && (
            <div className="pixel-controls">
              <div className="control-item-mini">
                <label>Pixel Size</label>
                <div className="range-input">
                  <input
                    type="range"
                    min="1"
                    max="16"
                    step="1"
                    value={config.pixelSize || 4}
                    onChange={(e) => updateConfig({ pixelSize: parseInt(e.target.value) })}
                  />
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={config.pixelSize || 4}
                    onChange={(e) => updateConfig({ pixelSize: parseInt(e.target.value) || 1 })}
                    className="range-text-input"
                  />
                  <span>px</span>
                </div>
              </div>
            </div>
          )}
          
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
        </div>
      </motion.div>
    </div>
  );
});

export default StyleControls;