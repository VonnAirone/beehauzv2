// Typography system
export const typography = {
  // Font families
  fontFamily: {
    regular: 'Figtree_400Regular',
    medium: 'Figtree_500Medium',
    semiBold: 'Figtree_600SemiBold',
    bold: 'Figtree_700Bold',
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
      fontFamily: 'Figtree_700Bold',
    },
    h2: {
      fontSize: 24,
      fontFamily: 'Figtree_600SemiBold',
    },
    h3: {
      fontSize: 20,
      fontFamily: 'Figtree_600SemiBold',
    },
    h4: {
      fontSize: 18,
      fontFamily: 'Figtree_500Medium',
    },
    h5: {
      fontSize: 16,
      fontFamily: 'Figtree_500Medium',
    },  
    h6: {
      fontSize: 14,
      fontFamily: 'Figtree_500Medium',
    },  
    body: {
      fontSize: 16,
      fontFamily: 'Figtree_400Regular',
    },
    bodySmall: {
      fontSize: 14,
      fontFamily: 'Figtree_400Regular',
    },
    caption: {
      fontSize: 12,
      fontFamily: 'Figtree_400Regular',
    },
    button: {
      fontSize: 16,
      fontFamily: 'Figtree_600SemiBold',
    },
  },
} as const;