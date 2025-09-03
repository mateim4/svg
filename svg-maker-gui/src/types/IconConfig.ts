export type StylePreset = 'neumorphism' | 'glassmorphism' | 'flat-design' | 'fluentui';

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
}