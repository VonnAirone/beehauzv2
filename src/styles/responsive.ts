import { Dimensions, Platform } from 'react-native';

// Breakpoints for responsive design
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

// Get current window dimensions
export const getWindowDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Check if current platform is web
export const isWeb = Platform.OS === 'web';

// Get current breakpoint
export const getCurrentBreakpoint = () => {
  const { width } = getWindowDimensions();
  
  if (width >= breakpoints.wide) return 'wide';
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
};

// Responsive hooks
export const useResponsive = () => {
  const { width, height } = getWindowDimensions();
  const breakpoint = getCurrentBreakpoint();
  
  return {
    width,
    height,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'wide',
    isWide: breakpoint === 'wide',
    isWeb,
  };
};

// Responsive value helper - returns different values based on breakpoint
export const responsive = <T,>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
  default: T;
}): T => {
  const breakpoint = getCurrentBreakpoint();
  return values[breakpoint] ?? values.default;
};

// Scale values based on screen size (useful for fonts, spacing)
export const scale = (size: number, factor = 1) => {
  const { width } = getWindowDimensions();
  const baseWidth = 375; // iPhone SE width as base
  return (width / baseWidth) * size * factor;
};

// Responsive spacing
export const responsiveSpacing = {
  xs: responsive({ mobile: 4, tablet: 6, desktop: 8, default: 4 }),
  sm: responsive({ mobile: 8, tablet: 12, desktop: 16, default: 8 }),
  md: responsive({ mobile: 16, tablet: 20, desktop: 24, default: 16 }),
  lg: responsive({ mobile: 24, tablet: 32, desktop: 40, default: 24 }),
  xl: responsive({ mobile: 32, tablet: 48, desktop: 64, default: 32 }),
  xxl: responsive({ mobile: 48, tablet: 64, desktop: 96, default: 48 }),
};

// Max width for content on larger screens
export const maxContentWidth = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  full: '100%',
} as const;

// Responsive container helper
export const containerStyle = (maxWidth: keyof typeof maxContentWidth = 'xl') => ({
  width: '100%',
  maxWidth: maxContentWidth[maxWidth],
  marginHorizontal: 'auto' as const,
  paddingHorizontal: responsiveSpacing.md,
});

// Grid columns helper
export const getGridColumns = () => {
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'wide':
      return 4;
    case 'desktop':
      return 3;
    case 'tablet':
      return 2;
    default:
      return 1;
  }
};

// Card width based on columns
export const getCardWidth = (columns?: number) => {
  const { width } = getWindowDimensions();
  const cols = columns ?? getGridColumns();
  const spacing = responsiveSpacing.md;
  const containerPadding = spacing * 2;
  const gapTotal = spacing * (cols - 1);
  
  return (width - containerPadding - gapTotal) / cols;
};

// Layout orientation
export const isLandscape = () => {
  const { width, height } = getWindowDimensions();
  return width > height;
};

// Safe area for web
export const getWebSafeArea = () => {
  if (!isWeb) return { top: 0, bottom: 0, left: 0, right: 0 };
  
  // For web, we typically don't need safe area, but can add padding for better UX
  return { top: 0, bottom: 0, left: 0, right: 0 };
};
