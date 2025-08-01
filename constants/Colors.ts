/**
 * Modern color system for the Leben in Deutschland app
 * Designed for accessibility, elegance, and modern mobile UI standards
 */

const tintColorLight = '#2563eb'; // Modern blue
const tintColorDark = '#60a5fa'; // Lighter blue for dark mode

export const Colors = {
  light: {
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    backgroundTertiary: '#f1f5f9',
    tint: tintColorLight,
    tintSecondary: '#3b82f6',
    icon: '#64748b',
    iconSecondary: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    border: '#e2e8f0',
    borderSecondary: '#cbd5e1',
    success: '#059669',
    successBackground: '#ecfdf5',
    successBorder: '#a7f3d0',
    error: '#dc2626',
    errorBackground: '#fef2f2',
    errorBorder: '#fca5a5',
    warning: '#d97706',
    warningBackground: '#fffbeb',
    warningBorder: '#fed7aa',
    info: '#0284c7',
    infoBackground: '#f0f9ff',
    infoBorder: '#7dd3fc',
    card: '#ffffff',
    cardShadow: 'rgba(0, 0, 0, 0.04)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundTertiary: '#334155',
    tint: tintColorDark,
    tintSecondary: '#3b82f6',
    icon: '#94a3b8',
    iconSecondary: '#64748b',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
    border: '#334155',
    borderSecondary: '#475569',
    success: '#10b981',
    successBackground: '#064e3b',
    successBorder: '#065f46',
    error: '#ef4444',
    errorBackground: '#7f1d1d',
    errorBorder: '#991b1b',
    warning: '#f59e0b',
    warningBackground: '#78350f',
    warningBorder: '#92400e',
    info: '#06b6d4',
    infoBackground: '#164e63',
    infoBorder: '#0891b2',
    card: '#1e293b',
    cardShadow: 'rgba(0, 0, 0, 0.2)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

// Semantic color mappings for specific use cases
export const SemanticColors = {
  primary: Colors.light.tint,
  secondary: Colors.light.tintSecondary,
  success: Colors.light.success,
  error: Colors.light.error,
  warning: Colors.light.warning,
  info: Colors.light.info,
};

// Gradient definitions for modern UI elements
export const Gradients = {
  primary: ['#2563eb', '#3b82f6'],
  success: ['#059669', '#10b981'],
  error: ['#dc2626', '#ef4444'],
  warning: ['#d97706', '#f59e0b'],
  info: ['#0284c7', '#06b6d4'],
  neutral: ['#64748b', '#94a3b8'],
  background: ['#f8fafc', '#ffffff'],
};

// Shadow definitions for consistent elevation
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
};

// Border radius values for consistent design
export const BorderRadius = {
  small: 6,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 50,
};

// Spacing system
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};