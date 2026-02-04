import React from 'react';
import { View, StyleSheet, Text, Image, Dimensions } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const { width } = Dimensions.get('window');

interface CustomMarkerProps {
  imageUri?: string;
  title: string;
  isUniversity?: boolean;
  isSelected?: boolean;
  price?: string;
}

export const CustomMarker: React.FC<CustomMarkerProps> = ({
  imageUri,
  title,
  isUniversity = false,
  isSelected = false,
  price,
}) => {
  const markerSize = isSelected ? 70 : 60;
  const pinSize = isSelected ? 24 : 20;

  return (
    <View style={styles.container}>
      {/* Property Image Marker */}
      <View style={[
        styles.imageMarker,
        {
          width: markerSize,
          height: markerSize,
          borderColor: isUniversity ? colors.success : (isSelected ? colors.primaryDark : colors.primary),
          borderWidth: isSelected ? 3 : 2,
        }
      ]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.markerImage, { borderRadius: markerSize / 2 - 2 }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { borderRadius: markerSize / 2 - 2 }]}>
            <MapPin
              color={isUniversity ? colors.success : colors.primary}
              size={pinSize}
            />
          </View>
        )}
      </View>

      {/* Pin Point */}
      <View style={[
        styles.pinPoint,
        {
          backgroundColor: isUniversity ? colors.success : (isSelected ? colors.primaryDark : colors.primary),
        }
      ]} />

      {/* Property Info Callout */}
      {!isUniversity && (
        <View style={[
          styles.callout,
          isSelected && styles.selectedCallout
        ]}>
          <Text style={styles.calloutTitle} numberOfLines={1}>
            {title}
          </Text>
          {price && (
            <Text style={styles.calloutPrice}>
              {price}
            </Text>
          )}
        </View>
      )}

      {/* University Label */}
      {isUniversity && (
        <View style={styles.universityCallout}>
          <Text style={styles.universityTitle}>
            {title}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 120, // Reasonable width for marker + callout
    minHeight: 100, // Ensure enough height for marker + callout
  },
  imageMarker: {
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  callout: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 8,
    marginTop: spacing[1],
    minWidth: 80,
    maxWidth: 110,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  selectedCallout: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  calloutTitle: {
    ...typography.textStyles.caption,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  calloutPrice: {
    ...typography.textStyles.caption,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 2,
  },
  universityCallout: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 12,
    marginTop: spacing[1],
    borderWidth: 1,
    borderColor: colors.success,
  },
  universityTitle: {
    ...typography.textStyles.caption,
    color: colors.success,
    textAlign: 'center',
    fontWeight: '700',
  },
});