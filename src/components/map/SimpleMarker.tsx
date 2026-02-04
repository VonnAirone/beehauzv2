import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors } from '../../styles/colors';

interface SimpleMarkerProps {
  title: string;
  price?: string;
  isUniversity?: boolean;
  isSelected?: boolean;
}

export const SimpleMarker: React.FC<SimpleMarkerProps> = ({
  title,
  price,
  isUniversity = false,
  isSelected = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Main Marker Circle */}
      <View style={[
        styles.marker,
        {
          backgroundColor: isUniversity ? colors.success : (isSelected ? colors.primaryDark : colors.primary),
        }
      ]}>
        <MapPin color={colors.white} size={16} />
      </View>

      {/* Simple Callout */}
      {!isUniversity && price && (
        <View style={styles.callout}>
          <Text style={styles.calloutText}>{price}</Text>
        </View>
      )}

      {/* University Label */}
      {isUniversity && (
        <View style={styles.universityCallout}>
          <Text style={styles.universityText}>UA</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  callout: {
    backgroundColor: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  calloutText: {
    fontSize: 10,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.primary,
  },
  universityCallout: {
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  universityText: {
    fontSize: 10,
    fontFamily: 'Figtree_700Bold',
    color: colors.white,
  },
});