import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bell, BellOff } from 'lucide-react-native';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';

export const NotificationsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.textStyles.h2, styles.title]}>Notifications</Text>
      </View>
      
      <View style={styles.emptyContainer}>
        <View style={styles.iconContainer}>
          <BellOff size={64} color={colors.gray[400]} />
        </View>
        <Text style={[typography.textStyles.h3, styles.emptyTitle]}>No Notifications Yet</Text>
        <Text style={[typography.textStyles.body, styles.emptyText]}>
          We'll notify you about booking updates, new properties, and important announcements here.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    color: colors.gray[900],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    color: colors.gray[700],
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
});