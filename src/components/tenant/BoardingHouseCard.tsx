import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, MapPin, Bed, Zap, Droplets, Users } from 'lucide-react-native';
import { BoardingHouse } from '../../types/tenant';
import { Card } from '../common/Card';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';

interface BoardingHouseCardProps {
  boardingHouse: BoardingHouse;
  onPress?: (boardingHouse: BoardingHouse) => void;
}

export const BoardingHouseCard: React.FC<BoardingHouseCardProps> = ({
  boardingHouse,
  onPress,
}) => {
  const {
    name,
    location,
    availableBeds,
    rating,
    ratePerMonth,
    description,
    paymentTerms,
    amenities,
    images,
    reviewCount,
  } = boardingHouse;

  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString()}`;
  };

  const renderRating = () => (
    <View style={styles.ratingContainer}>
      <Star size={16} color={colors.warning} fill={colors.warning} />
      <Text style={[typography.textStyles.bodySmall, styles.ratingText]}>
        {rating.toFixed(1)} ({reviewCount})
      </Text>
    </View>
  );

  const renderAmenityIcons = () => (
    <View style={styles.amenityContainer}>
      {paymentTerms.electricityIncluded && (
        <View style={styles.amenityItem}>
          <Zap size={14} color={colors.success} />
          <Text style={[typography.textStyles.caption, styles.amenityText]}>Electricity</Text>
        </View>
      )}
      {paymentTerms.waterIncluded && (
        <View style={styles.amenityItem}>
          <Droplets size={14} color={colors.info} />
          <Text style={[typography.textStyles.caption, styles.amenityText]}>Water</Text>
        </View>
      )}
    </View>
  );

  const renderPaymentTerms = () => (
    <View style={styles.paymentContainer}>
      <Text style={[typography.textStyles.caption, styles.paymentLabel]}>Payment Terms:</Text>
      <Text style={[typography.textStyles.caption, styles.paymentText]}>
        {paymentTerms.advancePayment} month advance, ₱{paymentTerms.deposit.toLocaleString()} deposit
      </Text>
    </View>
  );

  return (
    <TouchableOpacity onPress={() => onPress?.(boardingHouse)} activeOpacity={0.7}>
      <Card style={styles.card}>
        {/* Image Section */}
        {images.length > 0 && (
          <Image source={{ uri: images[0] }} style={styles.image} resizeMode="cover" />
        )}
        
        <View style={styles.content}>
          {/* Header with Name and Rating */}
          <View style={styles.header}>
            <Text style={[typography.textStyles.h4, styles.name]} numberOfLines={1}>
              {name}
            </Text>
            {renderRating()}
          </View>

          {/* Location */}
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.gray[500]} />
            <Text style={[typography.textStyles.bodySmall, styles.location]} numberOfLines={1}>
              {location}
            </Text>
          </View>

          {/* Room Types */}
          <View style={styles.roomTypesContainer}>
            {boardingHouse.roomTypes && boardingHouse.roomTypes.length > 0 ? (
              boardingHouse.roomTypes.map((roomType, index) => (
                <View key={index} style={styles.roomTypeChip}>
                  <Users size={12} color={colors.primary} />
                  <Text style={[typography.textStyles.caption, styles.roomTypeText]}>
                    {roomType.type}
                  </Text>
                  <Text style={[typography.textStyles.caption, styles.roomTypePrice]}>
                    ₱{roomType.pricePerMonth.toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.roomTypeChip}>
                <Users size={12} color={colors.primary} />
                <Text style={[typography.textStyles.caption, styles.roomTypeText]}>
                  6-person
                </Text>
                <Text style={[typography.textStyles.caption, styles.roomTypePrice]}>
                  ₱{ratePerMonth.toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {/* Available Beds and Price */}
          <View style={styles.bedsAndPrice}>
            <View style={styles.bedsContainer}>
              <Bed size={16} color={colors.primary} />
              <Text style={[typography.textStyles.bodySmall, styles.bedsText]}>
                {availableBeds} beds available
              </Text>
            </View>
            <Text style={[typography.textStyles.h4, styles.price]}>
              {formatPrice(ratePerMonth)}/month
            </Text>
          </View>

          
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    paddingVertical: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    marginRight: 12,
    color: colors.gray[900],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    color: colors.gray[600],
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    marginLeft: 6,
    color: colors.gray[600],
    flex: 1,
  },
  bedsAndPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bedsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bedsText: {
    marginLeft: 6,
    color: colors.gray[700],
  },
  price: {
    color: colors.primary,
    fontFamily: 'Figtree_600SemiBold',
  },
  description: {
    color: colors.gray[600],
    marginBottom: 12,
    lineHeight: 20,
  },
  paymentContainer: {
    marginBottom: 8,
  },
  paymentLabel: {
    color: colors.gray[500],
    marginBottom: 2,
  },
  paymentText: {
    color: colors.gray[700],
  },
  amenityContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  amenityText: {
    marginLeft: 4,
    color: colors.gray[600],
  },
  amenitiesContainer: {
    marginTop: 4,
  },
  amenitiesLabel: {
    color: colors.gray[500],
    marginBottom: 2,
  },
  amenitiesList: {
    color: colors.gray[700],
  },
  roomTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  roomTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    gap: 4,
  },
  roomTypeText: {
    color: colors.primary,
    fontFamily: 'Figtree_500Medium',
    fontSize: 11,
  },
  roomTypePrice: {
    color: colors.gray[600],
    fontFamily: 'Figtree_400Regular',
    fontSize: 10,
  },
});