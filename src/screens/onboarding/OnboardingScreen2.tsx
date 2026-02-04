import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MapPin, Star, Shield, Wifi } from 'lucide-react-native';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';

const { width } = Dimensions.get('window');

export const OnboardingScreen2: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <View style={styles.mapContainer}>
          <View style={styles.mapBackground}>
            <View style={[styles.mapPin, styles.pin1]}>
              <MapPin size={24} color={colors.primary} />
            </View>
            <View style={[styles.mapPin, styles.pin2]}>
              <MapPin size={20} color={colors.secondary} />
            </View>
            <View style={[styles.mapPin, styles.pin3]}>
              <MapPin size={18} color={colors.primary} />
            </View>
          </View>
          
          <View style={styles.featureIcons}>
            <View style={[styles.featureIcon, styles.feature1]}>
              <Star size={20} color={colors.secondary} />
            </View>
            <View style={[styles.featureIcon, styles.feature2]}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View style={[styles.featureIcon, styles.feature3]}>
              <Wifi size={20} color={colors.success} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[typography.textStyles.h1, styles.title]}>
          Explore with{'\n'}Confidence
        </Text>
        
        <Text style={[typography.textStyles.body, styles.description]}>
          Use our interactive map to find boarding houses near your campus. 
          View ratings, amenities, and safety features to make informed decisions. 
          Every listing is verified for your peace of mind.
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
  },
  mapContainer: {
    position: 'relative',
    width: 240,
    height: 180,
  },
  mapBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    position: 'relative',
    shadowColor: colors.gray[400],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapPin: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: 100,
    padding: 8,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pin1: {
    top: 30,
    left: 60,
  },
  pin2: {
    top: 80,
    right: 40,
  },
  pin3: {
    bottom: 40,
    left: 40,
  },
  featureIcons: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  featureIcon: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: 100,
    padding: 6,
    shadowColor: colors.gray[400],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  feature1: {
    top: 20,
    right: 20,
  },
  feature2: {
    bottom: 20,
    right: 60,
  },
  feature3: {
    top: 60,
    left: 20,
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