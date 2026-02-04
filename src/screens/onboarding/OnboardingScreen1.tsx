import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Home, Search, Heart } from 'lucide-react-native';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';

const { width } = Dimensions.get('window');

export const OnboardingScreen1: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <View style={styles.iconGroup}>
          <View style={[styles.iconWrapper, styles.primaryIcon]}>
            <Home size={48} color={colors.white} />
          </View>
          <View style={[styles.iconWrapper, styles.secondaryIcon, styles.topRight]}>
            <Search size={32} color={colors.primary} />
          </View>
          <View style={[styles.iconWrapper, styles.secondaryIcon, styles.bottomLeft]}>
            <Heart size={28} color={colors.secondary} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[typography.textStyles.h1, styles.title]}>
          Find Your Perfect{'\n'}Student Home
        </Text>
        
        <Text style={[typography.textStyles.body, styles.description]}>
          Discover comfortable and affordable boarding houses near your university. 
          Browse through verified listings with detailed photos, amenities, and reviews 
          from fellow students.
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
  iconGroup: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryIcon: {
    width: 120,
    height: 120,
    backgroundColor: colors.primary,
    position: 'absolute',
  },
  secondaryIcon: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[200],
    position: 'absolute',
  },
  topRight: {
    width: 64,
    height: 64,
    top: -10,
    right: -10,
  },
  bottomLeft: {
    width: 56,
    height: 56,
    bottom: 10,
    left: -20,
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