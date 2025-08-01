import { Platform } from 'react-native';

// Font families for different platforms
const fontFamilies = {
  ios: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    mono: 'Menlo',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto_medium',
    semiBold: 'Roboto_medium',
    bold: 'Roboto_bold',
    mono: 'monospace',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    mono: 'monospace',
  },
};

const currentFontFamily = Platform.select({
  ios: fontFamilies.ios,
  android: fontFamilies.android,
  default: fontFamilies.default,
});

// Typography scale following modern design principles
export const Typography = {
  // Display styles for large headings
  display: {
    large: {
      fontFamily: currentFontFamily.bold,
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    medium: {
      fontFamily: currentFontFamily.bold,
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700' as const,
      letterSpacing: -0.25,
    },
    small: {
      fontFamily: currentFontFamily.bold,
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
  },

  // Heading styles
  heading: {
    h1: {
      fontFamily: currentFontFamily.bold,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h2: {
      fontFamily: currentFontFamily.semiBold,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h3: {
      fontFamily: currentFontFamily.semiBold,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h4: {
      fontFamily: currentFontFamily.semiBold,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h5: {
      fontFamily: currentFontFamily.medium,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
      letterSpacing: 0,
    },
    h6: {
      fontFamily: currentFontFamily.medium,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500' as const,
      letterSpacing: 0.5,
    },
  },

  // Body text styles
  body: {
    large: {
      fontFamily: currentFontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    medium: {
      fontFamily: currentFontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    small: {
      fontFamily: currentFontFamily.regular,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
  },

  // Label styles for UI elements
  label: {
    large: {
      fontFamily: currentFontFamily.medium,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
      letterSpacing: 0,
    },
    medium: {
      fontFamily: currentFontFamily.medium,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500' as const,
      letterSpacing: 0.25,
    },
    small: {
      fontFamily: currentFontFamily.medium,
      fontSize: 10,
      lineHeight: 16,
      fontWeight: '500' as const,
      letterSpacing: 0.5,
    },
  },

  // Button text styles
  button: {
    large: {
      fontFamily: currentFontFamily.semiBold,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    medium: {
      fontFamily: currentFontFamily.semiBold,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    small: {
      fontFamily: currentFontFamily.semiBold,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '600' as const,
      letterSpacing: 0.25,
    },
  },

  // Caption and helper text
  caption: {
    large: {
      fontFamily: currentFontFamily.regular,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '400' as const,
      letterSpacing: 0.25,
    },
    medium: {
      fontFamily: currentFontFamily.regular,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '400' as const,
      letterSpacing: 0.25,
    },
    small: {
      fontFamily: currentFontFamily.regular,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '400' as const,
      letterSpacing: 0.5,
    },
  },

  // Monospace for code or special content
  mono: {
    large: {
      fontFamily: currentFontFamily.mono,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    medium: {
      fontFamily: currentFontFamily.mono,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    small: {
      fontFamily: currentFontFamily.mono,
      fontSize: 10,
      lineHeight: 16,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
  },
};

// Font weights for easy access
export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

// Line heights for consistent spacing
export const LineHeights = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

// Letter spacing values
export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
};