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
        let realIconSvg: string;
        
        try {
          const iconResult = await fluentUIService.getIconSvg('Play', 24, 'filled');
          realIconSvg = iconResult || '';
        } catch (serviceError) {
          console.warn('FluentUI service failed, using fallback:', serviceError);
          realIconSvg = '';
        }
        
        // Always use fallback SVG to ensure demo works
        if (!realIconSvg) {
          realIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82Z"/>
          </svg>`;
        }
        
        if (realIconSvg) {
          // Original icon with white color for dark mode
          const original = realIconSvg.replace('fill="currentColor"', 'fill="rgba(255, 255, 255, 0.9)"');
          setOriginalIcon(original);
          
          // Glassmorphism version with dark icon on teal/lime gradient
          const glassmorphismConfig: IconConfig = {
            style: 'glassmorphism',
            width: 64,
            height: 64,
            cornerRadius: 20,
            padding: 12,
            iconColor: 'var(--text-primary)', // Dark icon
            gradient: {
              angle: 135,
              startColor: 'var(--brand-primary)', // Teal
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
          try {
            const glassIcon = await processSvgWithStyle(realIconSvg, glassmorphismConfig);
            setGlassmorphismIcon(glassIcon);
          } catch (styleError) {
            console.warn('Glassmorphism processing failed:', styleError);
            setGlassmorphismIcon(realIconSvg);
          }
          
          // Neumorphism version with dark icon on teal/lime gradient
          const neumorphismConfig: IconConfig = {
            style: 'neumorphism',
            width: 64,
            height: 64,
            cornerRadius: 20,
            padding: 12,
            iconColor: 'var(--text-primary)', // Dark icon
            gradient: {
              angle: 135,
              startColor: 'var(--brand-primary)', // Teal
              stopColor: '#84fab0'   // Lime
            },
            dropShadowEnabled: true,
            dropShadowX: 8,
            dropShadowY: 8,
            dropShadowBlur: 16,
            dropShadowOpacity: 0.4,
            dropShadowColor: '#94a3b8'
          };
          
          try {
            const neuIcon = await processSvgWithStyle(realIconSvg, neumorphismConfig);
            setNeumorphismIcon(neuIcon);
          } catch (styleError) {
            console.warn('Neumorphism processing failed:', styleError);
            setNeumorphismIcon(realIconSvg);
          }
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
      <div className="preview-showcase-card" role="status" aria-live="polite">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.8)' }}>
          <span aria-label="Loading real Fluent UI icons, please wait">
            Loading real Fluent UI icons...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div role="region" aria-labelledby="icon-comparison-heading">
      <h3 id="icon-comparison-heading" className="sr-only">Icon Style Comparisons</h3>
      
      {/* Glassmorphism Row */}
      <div className="preview-row" role="group" aria-labelledby="glassmorphism-comparison">
        <div className="preview-before">
          <div 
            className="styled-icon original"
            dangerouslySetInnerHTML={{ __html: originalIcon }}
            role="img"
            aria-label="Original play icon in basic style"
          />
          <span id="glassmorphism-comparison-before">Original</span>
        </div>
        <ArrowRight size={20} aria-hidden="true" className="transform-arrow" />
        <div className="preview-after">
          <div 
            className="styled-icon glassmorphism-style"
            dangerouslySetInnerHTML={{ __html: glassmorphismIcon }}
            role="img"
            aria-label="Play icon transformed with glassmorphism style - translucent background with blur effect"
          />
          <span id="glassmorphism-comparison">Glassmorphism</span>
        </div>
      </div>

      {/* Neumorphism Row */}
      <div className="preview-row" role="group" aria-labelledby="neumorphism-comparison">
        <div className="preview-before">
          <div 
            className="styled-icon original"
            dangerouslySetInnerHTML={{ __html: originalIcon }}
            role="img"
            aria-label="Original play icon in basic style"
          />
          <span id="neumorphism-comparison-before">Original</span>
        </div>
        <ArrowRight size={20} aria-hidden="true" className="transform-arrow" />
        <div className="preview-after">
          <div 
            className="styled-icon neumorphism-style"
            dangerouslySetInnerHTML={{ __html: neumorphismIcon }}
            role="img"
            aria-label="Play icon transformed with neumorphism style - soft pressed effect with subtle shadows"
          />
          <span id="neumorphism-comparison">Neumorphism</span>
        </div>
      </div>
    </div>
  );
};

export default FluentUIIconDemo;