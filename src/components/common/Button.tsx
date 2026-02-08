import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator, View } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary', 
  loading = false,
  loadingText,
  style, 
  ...props 
}) => {
  const isDisabled = props.disabled || loading;
  const displayTitle = loading && loadingText ? loadingText : title;

  return (
    <TouchableOpacity 
      style={[styles.button, styles[variant], style, isDisabled && styles.disabled]}
      disabled={isDisabled}
      {...props}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' ? colors.primary : colors.white}
            style={styles.loader}
          />
        )}
        <Text style={[typography.textStyles.button, styles.text, styles[`${variant}Text`]]}>
          {displayTitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loader: {
    marginRight: 4,
  },
  disabled: {
    opacity: 0.7,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.gray[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    // Typography styles are now handled by typography.textStyles.button
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
});