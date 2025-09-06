import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Zap, 
  Package, 
  CheckCircle, 
  ArrowRight,
  Download 
} from 'lucide-react';
import { unifiedIconService, UnifiedIconResult, ProviderInfo } from '../services/unifiedIconService';
import { IconConfig } from '../types/IconConfig';
import { processSvgWithStyle } from '../utils/processSvgStyle';

interface IconPackDemoProps {
  config: IconConfig;
  onIconsGenerated?: (results: { original: string, processed: string, name: string }[]) => void;
}

const IconPackDemo: React.FC<IconPackDemoProps> = ({ config, onIconsGenerated }) => {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [demoIcons, setDemoIcons] = useState<Map<string, UnifiedIconResult>>(new Map());
  const [processedIcons, setProcessedIcons] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  // Sample icon names that exist across most providers
  const sampleIconNames = [
    'home', 'user', 'heart', 'star', 'search', 'settings',
    'mail', 'phone', 'calendar', 'camera', 'download', 'upload'
  ];

  useEffect(() => {
    const loadProviders = async () => {
      const providerInfo = unifiedIconService.getAvailableProviders();
      setProviders(providerInfo);
      if (providerInfo.length > 0 && !selectedProvider) {
        setSelectedProvider(providerInfo[0].id);
      }
    };
    loadProviders();
  }, [selectedProvider]);

  useEffect(() => {
    if (selectedProvider) {
      loadDemoIcons();
    }
  }, [selectedProvider, config]);

  const loadDemoIcons = async () => {
    if (!selectedProvider) return;

    setIsLoading(true);
    const newDemoIcons = new Map<string, UnifiedIconResult>();
    const newProcessedIcons = new Map<string, string>();

    try {
      // Load sample icons from the selected provider
      for (const iconName of sampleIconNames.slice(0, 6)) { // Limit to 6 for demo
        try {
          const iconResult = await unifiedIconService.getIconSvg(
            selectedProvider as any, 
            iconName, 
            48, 
            undefined
          );

          if (iconResult) {
            newDemoIcons.set(iconName, iconResult);
            
            // Process the icon with current style
            const processedSvg = processSvgWithStyle(iconResult.content, {
              ...config,
              width: 64,
              height: 64
            });
            newProcessedIcons.set(iconName, processedSvg);
          }
        } catch (error) {
          console.warn(`Could not load icon ${iconName} from ${selectedProvider}:`, error);
        }
      }

      setDemoIcons(newDemoIcons);
      setProcessedIcons(newProcessedIcons);

      // Notify parent component
      if (onIconsGenerated && newDemoIcons.size > 0) {
        const results = Array.from(newDemoIcons.entries()).map(([name, icon]) => ({
          original: icon.content,
          processed: newProcessedIcons.get(name) || icon.content,
          name
        }));
        onIconsGenerated(results);
      }

    } catch (error) {
      console.error('Error loading demo icons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleGenerateAll = () => {
    loadDemoIcons();
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'lucide': return '✨';
      case 'heroicons': return '🦸';
      case 'feather': return '🪶';
      case 'phosphor': return '💫';
      case 'tabler': return '📋';
      case 'fluentui': return '💎';
      default: return '📦';
    }
  };

  const getProviderColor = (providerId: string) => {
    const colors = {
      'lucide': '#f97316',
      'heroicons': '#8b5cf6', 
      'feather': '#06b6d4',
      'phosphor': '#eab308',
      'tabler': '#10b981',
      'fluentui': '#3b82f6'
    };
    return colors[providerId as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="icon-pack-demo">
      <div className="demo-header">
        <div className="demo-title">
          <Package size={24} />
          <h3>Icon Pack Showcase</h3>
          <span className="beta-badge">All Libraries</span>
        </div>

        <div className="provider-selector">
          <label>Choose Library:</label>
          <select 
            value={selectedProvider} 
            onChange={(e) => handleProviderChange(e.target.value)}
            disabled={isLoading}
          >
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {getProviderIcon(provider.id)} {provider.name} ({provider.totalIcons} icons)
              </option>
            ))}
          </select>
          
          <button
            onClick={handleGenerateAll}
            disabled={isLoading || !selectedProvider}
            className="generate-btn"
          >
            {isLoading ? (
              <>
                <Zap size={16} className="spinning" />
                Generating...
              </>
            ) : (
              <>
                <Palette size={16} />
                Generate Demo
              </>
            )}
          </button>
        </div>
      </div>

      {selectedProvider && (
        <div className="provider-info">
          <div className="provider-details">
            <div 
              className="provider-indicator"
              style={{ backgroundColor: getProviderColor(selectedProvider) }}
            >
              {getProviderIcon(selectedProvider)}
            </div>
            <div>
              <h4>{providers.find(p => p.id === selectedProvider)?.name}</h4>
              <p>{providers.find(p => p.id === selectedProvider)?.description}</p>
            </div>
          </div>
          
          <div className="provider-stats">
            <div className="stat">
              <span className="stat-value">{providers.find(p => p.id === selectedProvider)?.totalIcons}</span>
              <span className="stat-label">Icons</span>
            </div>
            <div className="stat">
              <span className="stat-value">{providers.find(p => p.id === selectedProvider)?.variants.length}</span>
              <span className="stat-label">Variants</span>
            </div>
            <div className="stat">
              <span className="stat-value">{providers.find(p => p.id === selectedProvider)?.strokeBased ? 'Stroke' : 'Fill'}</span>
              <span className="stat-label">Type</span>
            </div>
          </div>
        </div>
      )}

      <div className="demo-content">
        {demoIcons.size === 0 && !isLoading ? (
          <div className="demo-placeholder">
            <Package size={48} />
            <h4>Ready to Showcase</h4>
            <p>Select a library and click "Generate Demo" to see icons processed with your current style settings.</p>
          </div>
        ) : (
          <div className="demo-grid">
            {Array.from(demoIcons.entries()).map(([iconName, iconResult]) => {
              const processedSvg = processedIcons.get(iconName);
              return (
                <motion.div
                  key={`${selectedProvider}-${iconName}`}
                  className="demo-card"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: Math.random() * 0.2 }}
                >
                  <div className="demo-card-header">
                    <h5>{iconName}</h5>
                    <span className="icon-size">{iconResult.size}px</span>
                  </div>
                  
                  <div className="icon-comparison">
                    <div className="icon-before">
                      <div 
                        className="icon-preview original"
                        dangerouslySetInnerHTML={{ __html: iconResult.content }}
                        title="Original icon"
                      />
                      <span>Original</span>
                    </div>
                    
                    <ArrowRight size={16} className="arrow" />
                    
                    <div className="icon-after">
                      <div 
                        className={`icon-preview processed ${config.style}`}
                        dangerouslySetInnerHTML={{ __html: processedSvg || iconResult.content }}
                        title={`${config.style} style`}
                      />
                      <span>{config.style}</span>
                    </div>
                  </div>

                  <div className="demo-card-footer">
                    <span className="provider-tag">
                      {getProviderIcon(selectedProvider)} {selectedProvider}
                    </span>
                    <CheckCircle size={14} className="success-icon" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <Zap size={32} className="spinning" />
              <p>Generating styled icons from {providers.find(p => p.id === selectedProvider)?.name}...</p>
            </div>
          </div>
        )}
      </div>

      {demoIcons.size > 0 && (
        <div className="demo-actions">
          <div className="demo-summary">
            <CheckCircle size={16} />
            <span>
              Generated {demoIcons.size} icons from {providers.find(p => p.id === selectedProvider)?.name} 
              with {config.style} style
            </span>
          </div>
          
          <button className="view-all-btn">
            <Download size={16} />
            Export All Styles
          </button>
        </div>
      )}
    </div>
  );
};

export default IconPackDemo;