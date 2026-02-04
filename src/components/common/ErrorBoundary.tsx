import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { logError } from '../../utils/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: undefined,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError('Unhandled error boundary exception', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={[typography.textStyles.h3, styles.title]}>Something went wrong</Text>
        <Text style={[typography.textStyles.body, styles.subtitle]}>
          Please try again. If the issue persists, restart the app.
        </Text>
        {__DEV__ && this.state.error?.message ? (
          <Text style={[typography.textStyles.caption, styles.errorMessage]}>
            {this.state.error.message}
          </Text>
        ) : null}
        <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.white,
  },
  title: {
    color: colors.gray[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.gray[600],
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontFamily: 'Figtree_600SemiBold',
  },
});
