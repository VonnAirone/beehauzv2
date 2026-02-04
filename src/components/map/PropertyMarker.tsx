import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { BoardingHouse } from '../../types/tenant';

interface PropertyMarkerProps {
  property: BoardingHouse;
  isSelected?: boolean;
  isUniversity?: boolean;
}

export const PropertyMarker: React.FC<PropertyMarkerProps> = ({
  property,
  isSelected = false,
  isUniversity = false,
}) => {
  if (isUniversity) {
    return (
      <View style={styles.container}>
        <View style={[styles.callout, { backgroundColor: colors.success }]}>
          <Text style={styles.calloutText}>University of Antique</Text>
        </View>
        <View style={styles.imageContainer}>
          <View style={[styles.universityPin, { backgroundColor: colors.success }]}>
            <MapPin color={colors.white} size={20} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Property Image */}
      <View style={styles.imageContainer}>
        <View style={[
          styles.propertyImage, 
          styles.fallbackContainer,
          isSelected && { borderColor: colors.primaryDark, borderWidth: 4 }
        ]}>
          <Text style={styles.fallbackText}>🏠</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,  // Add extra width to prevent clipping
    height: 60, // Add extra height to prevent clipping
    padding: 6, // Add padding around the image
  },
  callout: {
    backgroundColor: '#444',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  calloutText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
    textAlign: 'center',
  },
  imageContainer: {
    height: 48,
    width: 48,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  propertyImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.white,
  },
  universityPin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fallbackContainer: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 24,
    color: colors.white,
  },
  debugInfo: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});