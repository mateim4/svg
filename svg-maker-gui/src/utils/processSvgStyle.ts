import { IconConfig } from '../types/IconConfig';

/**
 * Process an SVG string with the specified style configuration
 */
export function processSvgWithStyle(
  originalSvg: string,
  config: IconConfig
): string {
  try {
    // Parse the original SVG to extract paths and shapes
    const parser = new DOMParser();
    const doc = parser.parseFromString(originalSvg, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    
    if (!svgElement) {
      throw new Error('Invalid SVG content');
    }

    // Extract viewBox or create one from width/height
    let viewBox = svgElement.getAttribute('viewBox');
    if (!viewBox) {
      const width = svgElement.getAttribute('width') || '24';
      const height = svgElement.getAttribute('height') || '24';
      viewBox = `0 0 ${width} ${height}`;
    }

    // Preserve the complete original SVG content exactly as is
    // Clone the SVG element to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Store original defs separately to merge with our defs
    const existingDefs = clonedSvg.querySelector('defs');
    const originalDefs = existingDefs ? existingDefs.innerHTML : '';
    if (existingDefs) {
      existingDefs.remove();
    }
    
    // Extract stroke-related attributes from the root SVG element
    const strokeAttributes: string[] = [];
    const strokeAttrs = ['stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset'];
    const isStrokeBased = clonedSvg.getAttribute('stroke') === 'currentColor' || clonedSvg.hasAttribute('stroke-width');
    
    if (isStrokeBased) {
      strokeAttrs.forEach(attr => {
        const value = clonedSvg.getAttribute(attr);
        if (value) {
          strokeAttributes.push(`${attr}="${value}"`);
        }
      });
    }
    
    // Get the cleaned inner content
    const originalContent = clonedSvg.innerHTML;
    
    // Check if the icon uses currentColor or has no fill/stroke (needs color inheritance)
    const needsColorInheritance = originalContent.includes('currentColor') || 
                                 clonedSvg.getAttribute('stroke') === 'currentColor' ||
                                 !originalContent.match(/fill="(?!none)[^"]*"|stroke="(?!none)[^"]*"/);
    
    // Determine how to apply icon color based on whether it's stroke-based or fill-based
    let iconColorStyle = '';
    if (isStrokeBased) {
      // For stroke-based icons, apply color to stroke and preserve other stroke attributes
      const strokeColor = config.iconColor || '#333333';
      const preservedStrokes = strokeAttributes
        .filter(attr => !attr.startsWith('stroke="'))
        .join(' ');
      // Also preserve fill="none" for stroke-based icons to prevent unwanted fill
      const originalFill = clonedSvg.getAttribute('fill');
      const fillAttr = originalFill ? `fill="${originalFill}"` : 'fill="none"';
      iconColorStyle = `stroke="${strokeColor}" ${preservedStrokes} ${fillAttr}`;
    } else if (needsColorInheritance) {
      iconColorStyle = `fill="${config.iconColor || '#333333'}"`;
    } else {
      iconColorStyle = `style="color: ${config.iconColor || '#333333'};"`;
    }

    // Calculate the scale to fit the icon within the canvas
    const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
    // Use less aggressive padding reduction to maintain icon size closer to original
    const paddingReduction = config.padding * 0.5; // Only use half the padding for scaling
    const availableWidth = config.width - (paddingReduction * 2);
    const availableHeight = config.height - (paddingReduction * 2);
    const scaleX = availableWidth / vbWidth;
    const scaleY = availableHeight / vbHeight;
    const scale = Math.min(scaleX, scaleY);

    // Center the icon
    const scaledWidth = vbWidth * scale;
    const scaledHeight = vbHeight * scale;
    // Center based on the full canvas size, not the reduced available space
    let offsetX = (config.width - scaledWidth) / 2;
    let offsetY = (config.height - scaledHeight) / 2;
    let finalScale = scale;

    // Generate style-specific effects
    let defs = '';
    let backgroundStyle = '';
    let wrapperStyle = '';
    let additionalElements = '';
    
    // Add drop shadow if enabled
    let dropShadowDef = '';
    if (config.dropShadowEnabled) {
      const shadowX = config.dropShadowX || 4;
      const shadowY = config.dropShadowY || 4;
      const shadowBlur = config.dropShadowBlur || 8;
      const shadowOpacity = config.dropShadowOpacity || 0.3;
      const shadowColor = config.dropShadowColor || '#000000';
      
      dropShadowDef = `
    <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="${shadowX}" dy="${shadowY}" stdDeviation="${shadowBlur}" flood-color="${shadowColor}" flood-opacity="${shadowOpacity}"/>
    </filter>`;
    }


    // Add user gradient if enabled (for all styles)
    let gradientDef = '';
    if (config.gradient) {
      // Calculate proper gradient coordinates based on angle
      const angleRad = (config.gradient.angle * Math.PI) / 180;
      const x1 = 50 - 50 * Math.cos(angleRad);
      const y1 = 50 - 50 * Math.sin(angleRad);
      const x2 = 50 + 50 * Math.cos(angleRad);
      const y2 = 50 + 50 * Math.sin(angleRad);
      
      gradientDef = `
    <linearGradient id="user-gradient" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" style="stop-color:${config.gradient.startColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${config.gradient.stopColor};stop-opacity:1" />
    </linearGradient>`;
    }

    switch (config.style) {
      case 'neumorphism':
        defs = `
    <filter id="neumorphism-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="3" dy="3" stdDeviation="4" flood-color="rgba(0, 0, 0, 0.2)"/>
      <feDropShadow dx="-2" dy="-2" stdDeviation="3" flood-color="rgba(255, 255, 255, 0.8)"/>
    </filter>${dropShadowDef}`;
        
        if (config.gradient) {
          defs += gradientDef;
          const filters = ['url(#neumorphism-shadow)'];
          if (config.dropShadowEnabled) filters.push('url(#drop-shadow)');
          backgroundStyle = `fill="url(#user-gradient)" filter="${filters.join(' ')}"`;
        } else {
          defs += `
    <linearGradient id="neumorphism-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
    </linearGradient>`;
          const filters = ['url(#neumorphism-shadow)'];
          if (config.dropShadowEnabled) filters.push('url(#drop-shadow)');
          backgroundStyle = `fill="url(#neumorphism-gradient)" filter="${filters.join(' ')}"`;
        }
        wrapperStyle = '';
        break;

      case 'glassmorphism':
        const glassBackgroundTransparency = config.glassBackgroundTransparency || 0.3;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const glassIconTransparency = config.glassIconTransparency || 0.8; // Used in template literal below
        const glassIconBlur = config.glassIconBlur || 0;
        
        // Proper glassmorphism with clean surface effect
        defs = `
    <filter id="glass-surface" x="0%" y="0%" width="100%" height="100%">
      <feFlood flood-color="rgba(255, 255, 255, 0.1)" result="highlight"/>
      <feComposite in="highlight" in2="SourceGraphic" operator="over" result="highlighted"/>
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0, 0, 0, 0.1)" result="with-shadow"/>
    </filter>
    <filter id="glass-icon-blur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${glassIconBlur}"/>
    </filter>
    <clipPath id="glass-clip">
      <rect x="${0}" y="${0}" width="${config.width}" height="${config.height}" rx="${config.cornerRadius}"/>
    </clipPath>${dropShadowDef}`;
        
        if (config.gradient) {
          defs += gradientDef;
          backgroundStyle = `fill="url(#user-gradient)" opacity="${glassBackgroundTransparency}" filter="url(#glass-surface)" clip-path="url(#glass-clip)"${config.dropShadowEnabled ? ' filter="url(#drop-shadow)"' : ''}`;
        } else {
          defs += `
    <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,${glassBackgroundTransparency + 0.1});stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,${glassBackgroundTransparency - 0.05});stop-opacity:1" />
    </linearGradient>`;
          backgroundStyle = `fill="url(#glass-gradient)" opacity="${glassBackgroundTransparency}" filter="url(#glass-surface)" clip-path="url(#glass-clip)"${config.dropShadowEnabled ? ' filter="url(#drop-shadow)"' : ''}`;
        }
        
        // Glass edge highlight - constrained to shape bounds
        additionalElements = 'glass-edge';
        
        wrapperStyle = '';
        break;

      case 'pixel-art':
        const pixelSize = config.pixelSize || 4;
        const pixelatedWidth = Math.floor(availableWidth / pixelSize) * pixelSize;
        const pixelatedHeight = Math.floor(availableHeight / pixelSize) * pixelSize;
        const pixelScaleX = pixelatedWidth / vbWidth;
        const pixelScaleY = pixelatedHeight / vbHeight;
        const pixelScale = Math.min(pixelScaleX, pixelScaleY);
        
        // Recalculate offset for pixelated icon
        const finalPixelWidth = vbWidth * pixelScale;
        const finalPixelHeight = vbHeight * pixelScale;
        const pixelOffsetX = (config.width - finalPixelWidth) / 2;
        const pixelOffsetY = (config.height - finalPixelHeight) / 2;
        
        defs = `
    <filter id="pixel-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="2" dy="2" stdDeviation="0" flood-color="rgba(0, 0, 0, 0.4)"/>
    </filter>
    <pattern id="pixel-pattern" patternUnits="userSpaceOnUse" width="${pixelSize * 2}" height="${pixelSize * 2}">
      <rect width="${pixelSize}" height="${pixelSize}" fill="#ff6b6b"/>
      <rect x="${pixelSize}" y="0" width="${pixelSize}" height="${pixelSize}" fill="#4ecdc4"/>
      <rect x="0" y="${pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="#4ecdc4"/>
      <rect x="${pixelSize}" y="${pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="#ff6b6b"/>
    </pattern>${dropShadowDef}`;
        
        if (config.gradient) {
          defs += gradientDef;
          const filters = ['url(#pixel-shadow)'];
          if (config.dropShadowEnabled) filters.push('url(#drop-shadow)');
          backgroundStyle = `fill="url(#user-gradient)" filter="${filters.join(' ')}" style="image-rendering: pixelated;"`;
        } else {
          const filters = ['url(#pixel-shadow)'];
          if (config.dropShadowEnabled) filters.push('url(#drop-shadow)');
          backgroundStyle = `fill="url(#pixel-pattern)" filter="${filters.join(' ')}" style="image-rendering: pixelated;"`;
        }
        
        // Override the scale and offset for pixel art
        offsetX = pixelOffsetX;
        offsetY = pixelOffsetY;
        finalScale = pixelScale;
        
        wrapperStyle = `style="image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;"`;
        
        // Note: Additional elements positioning will be adjusted after viewBox calculation
        additionalElements = `pixel-border:${pixelSize}`;
        break;

      default:
        defs = dropShadowDef;
        if (config.gradient) {
          defs += gradientDef;
          const filters = [];
          if (config.dropShadowEnabled) filters.push('url(#drop-shadow)');
          backgroundStyle = `fill="url(#user-gradient)"${filters.length > 0 ? ` filter="${filters.join(' ')}"` : ''}`;
        } else {
          const filters = [];
          if (config.dropShadowEnabled) filters.push('url(#drop-shadow)');
          backgroundStyle = `fill="#f0f0f0"${filters.length > 0 ? ` filter="${filters.join(' ')}"` : ''}`;
        }
        wrapperStyle = '';
    }

    // Add outline to background if enabled
    let outlineElement = '';
    if (config.outlineEnabled) {
      const outlineWidth = config.outlineWidth || 2;
      const outlineColor = config.outlineColor || '#000000';
      const outlineOpacity = config.outlineOpacity || 1;
      
      outlineElement = `
  <!-- Outline -->
  <rect x="${outlineWidth/2}" y="${outlineWidth/2}" 
        width="${config.width - outlineWidth}" 
        height="${config.height - outlineWidth}" 
        rx="${Math.max(0, config.cornerRadius - outlineWidth/2)}" 
        fill="none" 
        stroke="${outlineColor}" 
        stroke-width="${outlineWidth}" 
        opacity="${outlineOpacity}"/>`;
    }

    // Calculate expanded SVG dimensions to accommodate all filter effects
    let svgWidth = config.width;
    let svgHeight = config.height;
    let viewBoxX = 0;
    let viewBoxY = 0;
    let viewBoxWidth = config.width;
    let viewBoxHeight = config.height;
    let filterExpansion = 0;
    
    // Store original icon centering (relative to original background)
    const originalIconOffsetX = offsetX;
    const originalIconOffsetY = offsetY;
    
    // Initialize background position variables
    let backgroundX = 0;
    let backgroundY = 0;
    
    // Calculate expansion needed for various effects
    let expansionNeeded = 0;
    
    // Drop shadow expansion
    if (config.dropShadowEnabled) {
      const shadowX = Math.abs(config.dropShadowX || 4);
      const shadowY = Math.abs(config.dropShadowY || 4);
      const shadowBlur = config.dropShadowBlur || 8;
      expansionNeeded = Math.max(expansionNeeded, shadowBlur + Math.max(shadowX, shadowY));
    }
    
    // Glassmorphism blur expansion - disabled for new constrained implementation
    if (config.style === 'glassmorphism') {
      // New glassmorphism uses constrained surface blur with 100% filter bounds
      // No canvas expansion needed as all effects are contained within original bounds
      expansionNeeded = Math.max(expansionNeeded, 0); // No expansion for glassmorphism
    }
    
    // Neumorphism shadow expansion
    if (config.style === 'neumorphism') {
      expansionNeeded = Math.max(expansionNeeded, 12); // Account for neumorphism shadows
    }
    
    // Apply expansion if needed
    if (expansionNeeded > 0) {
      filterExpansion = expansionNeeded;
      
      // Expand SVG canvas to accommodate all effects
      svgWidth = config.width + (filterExpansion * 2);
      svgHeight = config.height + (filterExpansion * 2);
      viewBoxWidth = svgWidth;
      viewBoxHeight = svgHeight;
      
      // Center the background within the expanded canvas
      backgroundX = filterExpansion;
      backgroundY = filterExpansion;
      
      // Position icon relative to the centered background (maintain original relative position)
      offsetX = backgroundX + originalIconOffsetX;
      offsetY = backgroundY + originalIconOffsetY;
    }
    
    // Adjust additional elements and outline for expanded canvas
    let processedAdditionalElements = additionalElements;
    let processedOutlineElement = outlineElement;
    
    if (filterExpansion > 0) {
      // Update additional elements positioning
      if (additionalElements === 'glass-edge') {
        processedAdditionalElements = `
    <!-- Glass edge highlight -->
    <rect x="${backgroundX + 1}" y="${backgroundY + 1}" 
          width="${config.width - 2}" 
          height="${config.height - 2}" 
          rx="${Math.max(0, config.cornerRadius - 1)}" 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.4)" 
          stroke-width="1"/>`;
      } else if (additionalElements.startsWith('pixel-border:')) {
        const pixelSize = parseInt(additionalElements.split(':')[1]);
        processedAdditionalElements = `
    <rect x="${backgroundX + pixelSize}" y="${backgroundY + pixelSize}" 
          width="${config.width - pixelSize * 2}" 
          height="${config.height - pixelSize * 2}" 
          rx="${pixelSize}" 
          fill="none" 
          stroke="#333" 
          stroke-width="${pixelSize}" 
          style="image-rendering: pixelated;"/>`;
      }
      
      // Update outline positioning
      if (outlineElement) {
        const outlineWidth = config.outlineWidth || 2;
        const outlineColor = config.outlineColor || '#000000';
        const outlineOpacity = config.outlineOpacity || 1;
        
        processedOutlineElement = `
  <!-- Outline -->
  <rect x="${backgroundX + outlineWidth/2}" y="${backgroundY + outlineWidth/2}" 
        width="${config.width - outlineWidth}" 
        height="${config.height - outlineWidth}" 
        rx="${Math.max(0, config.cornerRadius - outlineWidth/2)}" 
        fill="none" 
        stroke="${outlineColor}" 
        stroke-width="${outlineWidth}" 
        opacity="${outlineOpacity}"/>`;
      }
    } else {
      // Handle additional elements when drop shadow is not enabled
      if (additionalElements === 'glass-edge') {
        processedAdditionalElements = `
    <!-- Glass edge highlight -->
    <rect x="1" y="1" 
          width="${config.width - 2}" 
          height="${config.height - 2}" 
          rx="${Math.max(0, config.cornerRadius - 1)}" 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.4)" 
          stroke-width="1"/>`;
      }
    }

    // Debug SVG content preservation
    console.log('=== SVG CONTENT DEBUG ===');
    console.log('Original SVG length:', originalSvg.length);
    console.log('Original content length:', originalContent.length); 
    console.log('ViewBox:', viewBox, '-> dimensions:', vbWidth, 'x', vbHeight);
    console.log('Original defs length:', originalDefs.length);
    console.log('Is stroke-based icon:', isStrokeBased);
    console.log('Stroke attributes found:', strokeAttributes);
    console.log('Original fill attribute:', clonedSvg.getAttribute('fill'));
    console.log('Needs color inheritance:', needsColorInheritance);
    console.log('Icon color style:', iconColorStyle);
    console.log('Original SVG preview:');
    console.log(originalSvg.substring(0, 400));
    console.log('Extracted content preview:');
    console.log(originalContent.substring(0, 400));
    console.log('=========================');

    // Debug positioning values
    if (filterExpansion > 0) {
      console.log('SVG Positioning Debug (Filter Expansion):', {
        svgWidth, svgHeight,
        configWidth: config.width, configHeight: config.height,
        filterExpansion,
        expansionNeeded,
        backgroundX, backgroundY,
        offsetX, offsetY,
        originalIconOffsetX, originalIconOffsetY,
        'Icon relative to background': {
          relativeX: offsetX - backgroundX,
          relativeY: offsetY - backgroundY
        }
      });
    }

    // Build the processed SVG with proper layer order  
    const processedSvg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>${originalDefs}${defs}</defs>
  
  <!-- Layer 1: Background Canvas Grid (no rounded corners) -->
  <!-- This is just the viewport/canvas, no visible element needed -->
  
  <!-- Layer 2: Icon Drop Shadow (applied to the background shape) -->
  <!-- Handled by filters on the background -->
  
  <!-- Layer 3: Icon Generated Background (with rounded corners) -->
  <rect x="${backgroundX}" y="${backgroundY}" width="${config.width}" height="${config.height}" rx="${config.cornerRadius}" ${backgroundStyle}/>
  ${processedAdditionalElements}${processedOutlineElement}
  
  <!-- Layer 4: Base Icon (on top) -->
  <g transform="translate(${offsetX}, ${offsetY}) scale(${finalScale})" ${wrapperStyle}>
    <g opacity="${config.style === 'glassmorphism' ? config.glassIconTransparency || 0.8 : 1}" ${config.style === 'glassmorphism' && (config.glassIconBlur || 0) > 0 ? `filter="url(#glass-icon-blur)"` : ''} ${iconColorStyle}>
      ${originalContent}
    </g>
  </g>
</svg>`;

    return processedSvg;
  } catch (error) {
    console.error('Error processing SVG:', error);
    // Return a fallback SVG if processing fails
    return `<svg width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${config.width}" height="${config.height}" rx="${config.cornerRadius}" fill="#e0e0e0"/>
  <text x="${config.width/2}" y="${config.height/2}" text-anchor="middle" dominant-baseline="middle" fill="#666" font-size="12">
    Error processing SVG
  </text>
</svg>`;
  }
}