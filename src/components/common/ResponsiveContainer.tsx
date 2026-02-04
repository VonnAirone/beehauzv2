import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  noPadding?: boolean;
}

const maxWidthValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  full: undefined,
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'xl',
  centered = true,
  noPadding = false,
}) => {
  const { isDesktop, width } = useResponsive();

  return (
    <View
      style={[
        styles.container,
        isDesktop && styles.desktopContainer,
        maxWidth !== 'full' && {
          maxWidth: maxWidthValues[maxWidth],
        },
        centered && styles.centered,
        !noPadding && styles.padding,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  desktopContainer: {
    alignSelf: 'center',
  },
  centered: {
    marginHorizontal: 'auto',
  },
  padding: {
    paddingHorizontal: 16,
    ...(Platform.OS === 'web' && {
      paddingHorizontal: 24,
    }),
  },
});
