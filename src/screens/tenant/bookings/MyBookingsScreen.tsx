import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';

export const MyBookingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={[typography.textStyles.h2, styles.title]}>My Bookings</Text>
        <Text style={[typography.textStyles.body, styles.subtitle]}>View your reservation history</Text>
      </View> */}

      <View style={styles.comingSoonContainer}>
        <View style={styles.iconContainer}>
          <Calendar size={64} color={colors.gray[300]} />
        </View>
        
        <Text style={[typography.textStyles.h2, styles.comingSoonTitle]}>
          Coming Soon! 🚀
        </Text>
        
        <Text style={[typography.textStyles.body, styles.comingSoonMessage]}>
          We're working hard to bring you a comprehensive booking management system.
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.featureText}>Track booking status</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.featureText}>Manage reservations</Text>
          </View>
        </View>
        
        <Text style={[typography.textStyles.caption, styles.stayTuned]}>
          Stay tuned for updates! 📱
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    padding: 20,
    paddingTop: 70,
  },
  title: {
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.gray[600],
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  comingSoonTitle: {
    color: colors.gray[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonMessage: {
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featuresContainer: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  featureText: {
    color: colors.gray[700],
    fontSize: 14,
    fontFamily: 'Figtree_500Medium',
  },
  stayTuned: {
    color: colors.gray[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});