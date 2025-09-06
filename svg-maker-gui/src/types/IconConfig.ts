export type StylePreset = 'neumorphism' | 'glassmorphism' | 'pixel-art';

export interface Gradient {
  angle: number;
  startColor: string;
  stopColor: string;
}

export interface IconConfig {
  style: StylePreset;
  width: number;
  height: number;
  cornerRadius: number;
  padding: number;
  iconColor: string;
  gradient: Gradient | null;
  // Drop shadow properties
  dropShadowEnabled?: boolean;
  dropShadowX?: number; // -20 to 20
  dropShadowY?: number; // -20 to 20
  dropShadowBlur?: number; // 0-30
  dropShadowOpacity?: number; // 0-1
  dropShadowColor?: string;
  // Edge/Outline properties
  outlineEnabled?: boolean;
  outlineWidth?: number; // 0-10
  outlineColor?: string;
  outlineOpacity?: number; // 0-1
  // Glassmorphism specific properties
  glassBackgroundTransparency?: number; // 0-1
  glassIconTransparency?: number; // 0-1
  glassIconBlur?: number; // 0-20
  // Pixel art specific properties
  pixelSize?: number; // 1-16 (size of each pixel)
}