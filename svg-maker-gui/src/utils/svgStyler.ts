import { IconConfig } from '../types/IconConfig';

// Style a raw SVG string according to the provided IconConfig.
// This runs in the browser and uses DOMParser to safely extract inner content.
export function styleSvg(rawSvg: string, config: IconConfig): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    const inner = svgEl ? svgEl.innerHTML : rawSvg;

    const width = config.width || 128;
    const height = config.height || 128;
    const rx = config.cornerRadius ?? 0;
    const padding = config.padding ?? 0;

    const gradientId = config.gradient ? `g-${Math.abs(JSON.stringify(config.gradient).split('').reduce((a,b)=>a+b.charCodeAt(0),0))}` : null;
    const filterId = `f-${config.style}-${rx}-${padding}`.replace(/[^a-z0-9-]/gi, '');

    const defsParts: string[] = [];
    if (config.gradient && gradientId) {
      defsParts.push(`<linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${config.gradient.angle || 0})"><stop offset="0%" stop-color="${config.gradient.startColor}"/><stop offset="100%" stop-color="${config.gradient.stopColor}"/></linearGradient>`);
    }

    // simple shadow/blur filters for neumorphism/glass styles
    if (config.style === 'neumorphism') {
      defsParts.push(`<filter id="${filterId}"><feDropShadow dx="4" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.14)"/></filter>`);
    } else if (config.style === 'glassmorphism') {
      defsParts.push(`<filter id="${filterId}"><feGaussianBlur stdDeviation="4"/></filter>`);
    }

    const defs = defsParts.length ? `<defs>${defsParts.join('')}</defs>` : '';

    const rectFill = config.gradient && gradientId ? `fill="url(#${gradientId})"` : `fill="${config.iconColor || '#ffffff'}"`;
    const rectAttrs = `${rectFill} rx="${rx}"` + (config.style ? ` filter="url(#${filterId})"` : '');

    // place the original SVG content centered inside padding
    const contentTransform = `translate(${padding}, ${padding})`;

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${defs}
  <rect width="${width}" height="${height}" ${rectAttrs} />
  <g transform="${contentTransform}">${inner}</g>
</svg>`;
  } catch (e) {
    // Fallback to original
    return rawSvg;
  }
}
