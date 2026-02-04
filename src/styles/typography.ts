// Typography system
export const typography = {
  // Font families
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Text styles
  textStyles: {
    h1: {
      fontSize: 30,
      fontFamily: 'Inter_700Bold',
    },
    h2: {
      fontSize: 24,
      fontFamily: 'Inter_600SemiBold',
    },
    h3: {
      fontSize: 20,
      fontFamily: 'Inter_600SemiBold',
    },
    h4: {
      fontSize: 18,
      fontFamily: 'Inter_500Medium',
    },
    h5: {
      fontSize: 16,
      fontFamily: 'Inter_500Medium',
    },  
    h6: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
    },  
    body: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
    },
    bodySmall: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
    },
    caption: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
    },
    button: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
  },
} as const;