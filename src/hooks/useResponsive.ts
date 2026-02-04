import { useState, useEffect } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface ResponsiveValues {
  width: number;
  height: number;
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isWeb: boolean;
  isLandscape: boolean;
}

const breakpoints: ResponsiveBreakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

const getBreakpoint = (width: number): ResponsiveValues['breakpoint'] => {
  if (width >= breakpoints.wide) return 'wide';
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
};

const getResponsiveValues = (dimensions: ScaledSize): ResponsiveValues => {
  const breakpoint = getBreakpoint(dimensions.width);
  const isLandscape = dimensions.width > dimensions.height;
  
  return {
    width: dimensions.width,
    height: dimensions.height,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'wide',
    isWide: breakpoint === 'wide',
    isWeb: Platform.OS === 'web',
    isLandscape,
  };
};

export const useResponsive = (): ResponsiveValues => {
  const [dimensions, setDimensions] = useState(() => 
    getResponsiveValues(Dimensions.get('window'))
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(getResponsiveValues(window));
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

// Helper to get responsive value based on breakpoint
export const useResponsiveValue = <T,>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
  default: T;
}): T => {
  const { breakpoint } = useResponsive();
  return values[breakpoint] ?? values.default;
};

// Helper for grid columns
export const useGridColumns = () => {
  const { breakpoint } = useResponsive();
  
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
