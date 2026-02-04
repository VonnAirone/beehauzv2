import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '../../../styles/typography';

export const BookingRequestsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={[typography.textStyles.h2, styles.title]}>Booking Requests</Text>
      <Text style={[typography.textStyles.body, styles.subtitle]}>Review tenant applications</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70, // Added extra top padding for status bar
    backgroundColor: '#F7F8FA',
  },
  title: {
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
});