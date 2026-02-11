import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { X, Check, Minus, GraduationCap, Zap, Droplets } from 'lucide-react-native';
import { BoardingHouse } from '../../types/tenant';
import { colors } from '../../styles/colors';
import { calculateDistance, formatDistance, calculateWalkingTime } from '../../data/universities';
import { POPULAR_SCHOOLS } from '../../utils/constants';

interface CompareModalProps {
  visible: boolean;
  properties: BoardingHouse[];
  onClose: () => void;
}

const getNearestSchool = (property: BoardingHouse) => {
  const lat = (property as any).latitude;
  const lng = (property as any).longitude;
  if (lat == null || lng == null) return null;

  let nearest = POPULAR_SCHOOLS[0];
  let minDist = calculateDistance(
    [nearest.coordinates.latitude, nearest.coordinates.longitude],
    [lat, lng]
  );

  for (const school of POPULAR_SCHOOLS) {
    const d = calculateDistance(
      [school.coordinates.latitude, school.coordinates.longitude],
      [lat, lng]
    );
    if (d < minDist) {
      minDist = d;
      nearest = school;
    }
  }

  return { school: nearest, distance: minDist };
};

export const CompareModal: React.FC<CompareModalProps> = ({
  visible,
  properties,
  onClose,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 768;
  const colCount = properties.length;

  // Pre-compute nearest schools
  const schoolData = properties.map(getNearestSchool);
  const distances = schoolData.map(s => s?.distance ?? Infinity);
  const prices = properties.map(p => p.ratePerMonth);
  const beds = properties.map(p => p.availableBeds);

  // Find best values for highlighting
  const confirmedPrices = prices.filter(p => p > 0);
  const minPrice = confirmedPrices.length > 0 ? Math.min(...confirmedPrices) : 0;
  const finiteDistances = distances.filter(d => d !== Infinity);
  const minDistance = finiteDistances.length > 0 ? Math.min(...finiteDistances) : Infinity;
  const maxBeds = Math.max(...beds);

  // Get union of all amenities
  const allAmenities = Array.from(
    new Set(properties.flatMap(p => p.amenities))
  ).sort();

  const renderRow = (label: string, values: React.ReactNode[], borderTop?: boolean) => (
    <View style={[styles.row, borderTop && styles.rowBorderTop]}>
      <View style={styles.rowLabel}>
        <Text style={styles.rowLabelText}>{label}</Text>
      </View>
      {values.map((val, i) => (
        <View key={i} style={[styles.rowValue, i < colCount - 1 && styles.rowValueBorder]}>
          {typeof val === 'string' ? <Text style={styles.rowValueText}>{val}</Text> : val}
        </View>
      ))}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.container, !isSmallScreen && styles.containerDesktop]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Compare Properties</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.gray[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={isSmallScreen} bounces={true}>
            {/* Property headers */}
            <View style={styles.row}>
              <View style={styles.rowLabel} />
              {properties.map((p, i) => (
                <View key={p.id} style={[styles.rowValue, styles.propertyHeader, i < colCount - 1 && styles.rowValueBorder]}>
                  {p.images.length > 0 ? (
                    <Image source={{ uri: p.images[0] }} style={styles.thumbnail} resizeMode="cover" />
                  ) : (
                    <ImageBackground
                      source={require('../../assets/placeholder.jpeg')}
                      style={styles.thumbnail}
                      imageStyle={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={styles.propertyName} numberOfLines={2}>{p.name}</Text>
                </View>
              ))}
            </View>

            {/* Accreditation */}
            {renderRow('Accredited', properties.map(p => (
              p.isAccredited ? (
                <View style={styles.accreditedBadge}>
                  <GraduationCap size={12} color={colors.white} />
                  <Text style={styles.accreditedText}>Yes</Text>
                </View>
              ) : (
                <Text style={styles.rowValueTextMuted}>No</Text>
              )
            )), true)}

            {/* Price */}
            {renderRow('Price', properties.map(p => (
              <Text style={[
                styles.rowValueText,
                styles.rowValueBold,
                p.ratePerMonth > 0 && p.ratePerMonth === minPrice && styles.highlightGreen,
              ]}>
                {p.ratePerMonth > 0 ? `₱${p.ratePerMonth.toLocaleString()}/mo` : 'Not confirmed'}
              </Text>
            )), true)}

            {/* Distance to nearest school */}
            {renderRow('Nearest to School', properties.map((_, i) => {
              const data = schoolData[i];
              if (!data) return <Text style={styles.rowValueTextMuted}>N/A</Text>;
              const isBest = data.distance === minDistance && minDistance !== Infinity;
              return (
                <View>
                  <Text style={[styles.rowValueText, isBest && styles.highlightGreen]}>
                    {formatDistance(data.distance)}
                  </Text>
                  <Text style={styles.rowValueTextSmall}>{data.school.shortName}</Text>
                  <Text style={styles.rowValueTextSmall}>{calculateWalkingTime(data.distance)} walk</Text>
                </View>
              );
            }), true)}

            {/* Available beds */}
            {renderRow('Beds', properties.map(p => (
              <Text style={[
                styles.rowValueText,
                styles.rowValueBold,
                p.availableBeds > 0 && p.availableBeds === maxBeds && styles.highlightGreen,
              ]}>
                {p.availableBeds > 0 ? `${p.availableBeds}` : 'N/A'}
              </Text>
            )), true)}

            {/* Advance payment */}
            {renderRow('Advance', properties.map(p => (
              `${p.paymentTerms.advancePayment} month${p.paymentTerms.advancePayment !== 1 ? 's' : ''}`
            )), true)}

            {/* Deposit */}
            {renderRow('Deposit', properties.map(p => (
              p.paymentTerms.deposit > 0 ? `₱${p.paymentTerms.deposit.toLocaleString()}` : 'None'
            )), true)}

            {/* Electricity */}
            {renderRow('Electricity', properties.map(p => (
              p.paymentTerms.electricityIncluded ? (
                <View style={styles.utilityIncluded}>
                  <Zap size={14} color={colors.success} />
                  <Text style={[styles.rowValueTextSmall, { color: colors.success }]}>Included</Text>
                </View>
              ) : (
                <View style={styles.utilityNotIncluded}>
                  <Minus size={14} color={colors.gray[400]} />
                  <Text style={styles.rowValueTextSmall}>Separate</Text>
                </View>
              )
            )), true)}

            {/* Water */}
            {renderRow('Water', properties.map(p => (
              p.paymentTerms.waterIncluded ? (
                <View style={styles.utilityIncluded}>
                  <Droplets size={14} color={colors.success} />
                  <Text style={[styles.rowValueTextSmall, { color: colors.success }]}>Included</Text>
                </View>
              ) : (
                <View style={styles.utilityNotIncluded}>
                  <Minus size={14} color={colors.gray[400]} />
                  <Text style={styles.rowValueTextSmall}>Separate</Text>
                </View>
              )
            )), true)}

            {/* Amenities */}
            {allAmenities.length > 0 && (
              <>
                <View style={[styles.row, styles.rowBorderTop]}>
                  <View style={styles.rowLabel}>
                    <Text style={styles.rowLabelText}>Amenities</Text>
                  </View>
                  {properties.map((p, i) => (
                    <View key={p.id} style={[styles.rowValue, i < colCount - 1 && styles.rowValueBorder]}>
                      {allAmenities.map(amenity => (
                        <View key={amenity} style={styles.amenityRow}>
                          {p.amenities.includes(amenity) ? (
                            <Check size={14} color={colors.success} />
                          ) : (
                            <Minus size={14} color={colors.gray[300]} />
                          )}
                          <Text style={[
                            styles.amenityText,
                            !p.amenities.includes(amenity) && styles.amenityTextMuted,
                          ]}>
                            {amenity}
                          </Text>
                        </View>
                      ))}
                      {p.amenities.length === 0 && allAmenities.length === 0 && (
                        <Text style={styles.rowValueTextMuted}>None listed</Text>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}

            {allAmenities.length === 0 && renderRow('Amenities', properties.map(() => (
              <Text style={styles.rowValueTextMuted}>None listed</Text>
            )), true)}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  containerDesktop: {
    maxWidth: 900,
    maxHeight: '80%',
    alignSelf: 'center',
    width: '100%',
    borderRadius: 20,
    marginBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 18,
    fontFamily: 'Figtree_700Bold',
    color: colors.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    minHeight: 48,
  },
  rowBorderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  rowLabel: {
    width: 90,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
  },
  rowLabelText: {
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[600],
  },
  rowValue: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowValueBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.gray[100],
  },
  rowValueText: {
    fontSize: 13,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[800],
    textAlign: 'center',
  },
  rowValueBold: {
    fontFamily: 'Figtree_700Bold',
  },
  rowValueTextMuted: {
    fontSize: 13,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[400],
    textAlign: 'center',
  },
  rowValueTextSmall: {
    fontSize: 11,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 2,
  },
  highlightGreen: {
    color: colors.success,
  },
  propertyHeader: {
    paddingVertical: 16,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 45,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
    overflow: 'hidden',
  },
  thumbnailImage: {
    borderRadius: 8,
    opacity: 0.6,
  },
  propertyName: {
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[900],
    textAlign: 'center',
  },
  accreditedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#16a34a',
  },
  accreditedText: {
    color: colors.white,
    fontSize: 11,
    fontFamily: 'Figtree_600SemiBold',
  },
  utilityIncluded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  utilityNotIncluded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
  },
  amenityText: {
    fontSize: 11,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[700],
  },
  amenityTextMuted: {
    color: colors.gray[300],
  },
});
