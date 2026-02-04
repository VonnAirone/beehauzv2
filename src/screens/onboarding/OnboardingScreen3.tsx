import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MessageCircle, Calendar, CreditCard, Users } from 'lucide-react-native';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';

const { width } = Dimensions.get('window');

export const OnboardingScreen3: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <View style={styles.servicesGrid}>
          <View style={[styles.serviceCard, styles.card1]}>
            <MessageCircle size={32} color={colors.primary} />
            <Text style={styles.serviceText}>Chat</Text>
          </View>
          
          <View style={[styles.serviceCard, styles.card2]}>
            <Calendar size={32} color={colors.secondary} />
            <Text style={styles.serviceText}>Book</Text>
          </View>
          
          <View style={[styles.serviceCard, styles.card3]}>
            <CreditCard size={32} color={colors.success} />
            <Text style={styles.serviceText}>Pay</Text>
          </View>
          
          <View style={[styles.serviceCard, styles.card4]}>
            <Users size={32} color={colors.info} />
            <Text style={styles.serviceText}>Connect</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[typography.textStyles.h1, styles.title]}>
          Your Complete{'\n'}Student Experience
        </Text>
        
        <Text style={[typography.textStyles.body, styles.description]}>
          From finding the perfect room to booking and payment - everything you need 
          is in one place. Connect with property owners, manage your bookings, 
          and join a community of students just like you.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    position: 'relative',
  },
  servicesGrid: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  serviceCard: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: colors.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gray[400],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  card1: {
    top: 0,
    left: 0,
  },
  card2: {
    top: 0,
    right: 0,
  },
  card3: {
    bottom: 0,
    left: 0,
  },
  card4: {
    bottom: 0,
    right: 0,
  },
  serviceText: {
    ...typography.textStyles.caption,
    color: colors.gray[700],
    fontFamily: 'Figtree_500Medium',
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 80,
  },
  title: {
    textAlign: 'center',
    color: colors.gray[900],
    marginBottom: 24,
    fontFamily: 'Figtree_700Bold',
    lineHeight: 42,
  },
  description: {
    textAlign: 'center',
    color: colors.gray[600],
    lineHeight: 24,
    paddingHorizontal: 8,
    fontFamily: 'Figtree_400Regular',
  },
});