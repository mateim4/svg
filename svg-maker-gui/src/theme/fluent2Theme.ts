import {
  createLightTheme,
  createDarkTheme,
  BrandVariants,
  Theme,
} from '@fluentui/react-components';
import { tokens } from '@fluentui/tokens';

// Custom brand colors for SVG Icon Maker
const svgMakerBrand: BrandVariants = {
  10: "#020305",
  20: "#111318",
  30: "#16202D",
  40: "#193042",
  50: "#1B4057",
  60: "#1E506E",
  70: "#206186",
  80: "#23729E",
  90: "#2584B7",
  100: "#2796D0",
  110: "#29A9EA",
  120: "#3DB5F0",
  130: "#51C1F5",
  140: "#65CDFA",
  150: "#79D9FF",
  160: "#8DE5FF",
};

// Create custom themes
export const lightTheme: Theme = createLightTheme(svgMakerBrand);
export const darkTheme: Theme = createDarkTheme(svgMakerBrand);

// Extended design tokens for our app
export const appTokens = {
  // Layout tokens
  layout: {
    navBarHeight: '56px',
    sidebarWidth: '320px',
    panelGap: tokens.spacingHorizontalL,
    contentPadding: tokens.spacingHorizontalXL,
    sectionPadding: tokens.spacingVerticalL,
  },
  
  // Elevation tokens (Fluent 2 style)
  elevation: {
    card: tokens.shadow4,
    popup: tokens.shadow8,
    dialog: tokens.shadow16,
    tooltip: tokens.shadow2,
  },
  
  // Border radius tokens
  borderRadius: {
    small: tokens.borderRadiusSmall,
    medium: tokens.borderRadiusMedium,
    large: tokens.borderRadiusLarge,
    xlarge: tokens.borderRadiusXLarge,
  },
  
  // Typography hierarchy
  typography: {
    appTitle: {
      fontSize: tokens.fontSizeHero900,
      fontWeight: tokens.fontWeightBold,
      lineHeight: tokens.lineHeightHero900,
    },
    sectionTitle: {
      fontSize: tokens.fontSizeBase600,
      fontWeight: tokens.fontWeightSemibold,
      lineHeight: tokens.lineHeightBase600,
    },
    cardTitle: {
      fontSize: tokens.fontSizeBase500,
      fontWeight: tokens.fontWeightSemibold,
      lineHeight: tokens.lineHeightBase500,
    },
    body: {
      fontSize: tokens.fontSizeBase300,
      fontWeight: tokens.fontWeightRegular,
      lineHeight: tokens.lineHeightBase300,
    },
    caption: {
      fontSize: tokens.fontSizeBase200,
      fontWeight: tokens.fontWeightRegular,
      lineHeight: tokens.lineHeightBase200,
    },
  },
  
  // Animation tokens
  animation: {
    durationUltraFast: tokens.durationUltraFast,
    durationFaster: tokens.durationFaster,
    durationFast: tokens.durationFast,
    durationNormal: tokens.durationNormal,
    durationGentle: tokens.durationGentle,
    durationSlow: tokens.durationSlow,
    
    curveAccelerateMax: tokens.curveAccelerateMax,
    curveAccelerateMid: tokens.curveAccelerateMid,
    curveAccelerateMin: tokens.curveAccelerateMin,
    curveDecelerateMax: tokens.curveDecelerateMax,
    curveDecelerateMid: tokens.curveDecelerateMid,
    curveDecelerateMin: tokens.curveDecelerateMin,
    curveEasyEase: tokens.curveEasyEase,
    curveLinear: tokens.curveLinear,
  },
};

// Theme utilities
export const useThemeMode = () => {
  // This can be extended with actual theme switching logic
  return {
    theme: lightTheme,
    toggleTheme: () => {},
    isDark: false,
  };
};
