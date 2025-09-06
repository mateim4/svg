// Real Fluent UI Icon Demo Component
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { fluentUIService } from '../services/fluentUIService';
import { processSvgWithStyle } from '../utils/processSvgStyle';
import { IconConfig } from '../types/IconConfig';

const FluentUIIconDemo: React.FC = () => {
  const [originalIcon, setOriginalIcon] = useState<string>('');
  const [glassmorphismIcon, setGlassmorphismIcon] = useState<string>('');
  const [neumorphismIcon, setNeumorphismIcon] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRealFluentIcons = async () => {
      try {
        // Get a real icon from Fluent UI service
        const realIconSvg = await fluentUIService.getIconSvg('Play', 24, 'filled');
        
        if (realIconSvg) {
          // Original icon with light color
          const original = realIconSvg.replace('fill="currentColor"', 'fill="#94a3b8"');
          setOriginalIcon(original);
          
          // Glassmorphism version with dark icon on teal/lime gradient
          const glassmorphismConfig: IconConfig = {
            style: 'glassmorphism',
            width: 64,
            height: 64,
            cornerRadius: 20,
            padding: 12,
            iconColor: '#1a1a1a', // Dark icon
            gradient: {
              angle: 135,
              startColor: '#00e5ff', // Teal
              stopColor: '#84fab0'   // Lime
            },
            glassBackgroundTransparency: 0.15,
            glassIconTransparency: 0.95,
            glassIconBlur: 0,
            dropShadowEnabled: true,
            dropShadowX: 0,
            dropShadowY: 4,
            dropShadowBlur: 12,
            dropShadowOpacity: 0.25,
            dropShadowColor: '#00e5ff'
          };
          const glassIcon = processSvgWithStyle(realIconSvg, glassmorphismConfig);
          setGlassmorphismIcon(glassIcon);
          
          // Neumorphism version with dark icon on teal/lime gradient
          const neumorphismConfig: IconConfig = {
            style: 'neumorphism',
            width: 64,
            height: 64,
            cornerRadius: 20,
            padding: 12,
            iconColor: '#1a1a1a', // Dark icon
            gradient: {
              angle: 135,
              startColor: '#00e5ff', // Teal
              stopColor: '#84fab0'   // Lime
            },
            dropShadowEnabled: true,
            dropShadowX: 8,
            dropShadowY: 8,
            dropShadowBlur: 16,
            dropShadowOpacity: 0.4,
            dropShadowColor: '#94a3b8'
          };
          const neuIcon = processSvgWithStyle(realIconSvg, neumorphismConfig);
          setNeumorphismIcon(neuIcon);
        }
      } catch (error) {
        console.error('Error loading real Fluent UI icons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRealFluentIcons();
  }, []);

  if (isLoading) {
    return (
      <div className="preview-showcase-card">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.8)' }}>
          Loading real Fluent UI icons...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Glassmorphism Row */}
      <div className="preview-row">
        <div className="preview-before">
          <div 
            className="styled-icon original"
            dangerouslySetInnerHTML={{ __html: originalIcon }}
          />
          <span>Original</span>
        </div>
        <ArrowRight size={20} />
        <div className="preview-after">
          <div 
            className="styled-icon glassmorphism-style"
            dangerouslySetInnerHTML={{ __html: glassmorphismIcon }}
          />
          <span>Glassmorphism</span>
        </div>
      </div>

      {/* Neumorphism Row */}
      <div className="preview-row">
        <div className="preview-before">
          <div 
            className="styled-icon original"
            dangerouslySetInnerHTML={{ __html: originalIcon }}
          />
          <span>Original</span>
        </div>
        <ArrowRight size={20} />
        <div className="preview-after">
          <div 
            className="styled-icon neumorphism-style"
            dangerouslySetInnerHTML={{ __html: neumorphismIcon }}
          />
          <span>Neumorphism</span>
        </div>
      </div>
    </>
  );
};

export default FluentUIIconDemo;