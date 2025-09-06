/**
 * Scale the original SVG to match the processed SVG dimensions
 * This ensures both original and processed icons appear at the same size
 */
export function scaleOriginalSvg(originalSvg: string, targetWidth: number, targetHeight: number, padding: number = 16): string {
  try {
    // Parse the original SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(originalSvg, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    
    if (!svgElement) {
      return originalSvg;
    }

    // Get original viewBox or dimensions
    let viewBox = svgElement.getAttribute('viewBox');
    if (!viewBox) {
      const width = svgElement.getAttribute('width') || '24';
      const height = svgElement.getAttribute('height') || '24';
      viewBox = `0 0 ${width} ${height}`;
    }

    // Parse viewBox values
    const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);
    
    // Calculate scale to fit icon in target dimensions (with same padding as processed)
    const paddingReduction = padding * 0.5; // Match the padding logic from processSvgStyle
    const availableWidth = targetWidth - (paddingReduction * 2);
    const availableHeight = targetHeight - (paddingReduction * 2);
    const scaleX = availableWidth / vbWidth;
    const scaleY = availableHeight / vbHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Calculate centered position
    const scaledWidth = vbWidth * scale;
    const scaledHeight = vbHeight * scale;
    const offsetX = (targetWidth - scaledWidth) / 2;
    const offsetY = (targetHeight - scaledHeight) / 2;

    // Clone the SVG element to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Get the inner content
    const innerContent = clonedSvg.innerHTML;
    
    // Preserve important attributes from the original SVG
    const preserveAttributes = ['stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill', 'fill-rule'];
    const attributesStr = preserveAttributes
      .map(attr => {
        const value = svgElement.getAttribute(attr);
        return value ? `${attr}="${value}"` : '';
      })
      .filter(attr => attr !== '')
      .join(' ');

    // Build scaled SVG with same dimensions as processed, preserving attributes
    const scaledSvg = `<svg width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${targetWidth} ${targetHeight}" xmlns="http://www.w3.org/2000/svg" ${attributesStr}>
  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">
    ${innerContent}
  </g>
</svg>`;

    return scaledSvg;
  } catch (error) {
    console.error('Error scaling original SVG:', error);
    return originalSvg;
  }
}