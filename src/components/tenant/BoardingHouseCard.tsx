import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Star, MapPin, Bed, Zap, Droplets, Users, Info, GraduationCap } from 'lucide-react-native';
import { BoardingHouse } from '../../types/tenant';
import { Card } from '../common/Card';
import { typography } from '../../styles/typography';
import { colors } from '../../styles/colors';
import { useResponsive } from '../../hooks/useResponsive';

interface BoardingHouseCardProps {
  boardingHouse: BoardingHouse;
  onPress?: (boardingHouse: BoardingHouse) => void;
}

export const BoardingHouseCard: React.FC<BoardingHouseCardProps> = ({
  boardingHouse,
  onPress,
}) => {
  const { isDesktop, isTablet } = useResponsive();
  const [showTooltip, setShowTooltip] = React.useState(false);
  
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
    if (!price || price <= 0) {
      return '₱0.00';
    }

    return `₱${price.toLocaleString()}`;
  };

  const isRateConfirmed = ratePerMonth > 0;

  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 768;

  const handleRateInfoPress = (event?: any) => {
    if (event?.stopPropagation) {
      event.stopPropagation();
    }

    setShowTooltip(!showTooltip);
    
    // Auto-hide tooltip after 3 seconds
    if (!showTooltip) {
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  const renderRating = () => (
    <View>
      <Star size={16} color={colors.warning} fill={colors.warning} />
      <Text style={[typography.textStyles.bodySmall]}>
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
    <TouchableOpacity 
      onPress={() => onPress?.(boardingHouse)} 
      activeOpacity={0.7}
      style={[
        styles.cardWrapper,
        (isDesktop || isTablet) && styles.cardWrapperDesktop,
      ]}
    >
      <Card style={[
        styles.card,
        Platform.OS === 'web' && styles.cardWeb,
      ]}>
        {/* Image Section */}
        {images.length > 0 ? (
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: images[0] }} 
              style={[
                styles.image,
                (isDesktop || isTablet) && styles.imageDesktop,
              ]} 
              resizeMode="cover" 
            />
            {boardingHouse.isAccredited && (
              <View style={styles.accreditedBadge}>
                <GraduationCap size={12} color={colors.white} />
                <Text style={styles.accreditedBadgeText}>Accredited</Text>
              </View>
            )}
            <View style={styles.ratingBadge}>
              <Star size={14} color={colors.warning} fill={colors.warning} />
              <Text style={styles.ratingBadgeText}>{rating.toFixed(1)}</Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.imageEmpty,
              (isDesktop || isTablet) && styles.imageEmptyDesktop,
            ]}
          >
            <ImageBackground
              source={require('../../assets/placeholder.jpeg')}
              style={styles.placeholderImage}
              imageStyle={styles.placeholderImageInner}
              resizeMode="cover"
            >
              {boardingHouse.isAccredited && (
                <View style={[styles.accreditedBadge, { position: 'absolute', top: 12, left: 12 }]}>
                  <GraduationCap size={12} color={colors.white} />
                  <Text style={styles.accreditedBadgeText}>Accredited</Text>
                </View>
              )}
              <View style={{
                backgroundColor: colors.white,
                padding: 10,
                borderRadius: 5
                }}>
                <Text style={styles.imageEmptyText}>No photos added</Text>
              </View>

            </ImageBackground>
          </View>
        )}
        
        <View style={styles.content}>
          {/* Header with Name and Rating */}
          <View style={styles.header}>
            <Text style={[typography.textStyles.h4, styles.name]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[typography.textStyles.caption, styles.reviewCount]}>
              {reviewCount} reviews
            </Text>
          </View>

          {/* Location */}
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.gray[500]} />
            <Text style={[typography.textStyles.caption, styles.location]} numberOfLines={1}>
              {location}
            </Text>
          </View>

          <View style={[styles.bedsAndPrice
          ]}>
            <View style={styles.priceRow}>
              <Text style={[typography.textStyles.h4, styles.price]}>
                {formatPrice(ratePerMonth)}/month
              </Text>
              {!isRateConfirmed && (
                <View style={styles.tooltipContainer}>
                  <TouchableOpacity
                    style={styles.rateInfoButton}
                    onPress={handleRateInfoPress}
                    {...(Platform.OS === 'web'
                      ? {
                          onMouseEnter: () => setShowTooltip(true),
                          onMouseLeave: () => setShowTooltip(false),
                        }
                      : {})}
                  >
                    <Info size={14} color={colors.gray[500]} />
                  </TouchableOpacity>
                  {showTooltip && (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipText}>Rate has not been confirmed yet.</Text>
                      <View style={styles.tooltipArrow} />
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.bedsContainer}>
              <Bed size={16} color={colors.primary} />
              <Text style={[typography.textStyles.caption, styles.bedsText]}>
                {availableBeds} beds available
              </Text>
            </View>
          </View>


         

          
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '95%',
  },
  cardWrapperDesktop: {
    marginBottom: 0,
  },
  card: {
    overflow: 'hidden',
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 16,
  },
  cardWeb: {
    cursor: 'pointer' as any,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 170,
  },
  imageDesktop: {
    height: 220,
  },
  imageEmpty: {
    height: 170,
    borderRadius: 0,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  imageEmptyDesktop: {
    height: 220,
  },
  imageEmptyText: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: 'Figtree_500Medium',
  },
  placeholderImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImageInner: {
    width: '100%',
    height: '100%',
    opacity: 0.5
  },
  accreditedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#16a34a',
  },
  accreditedBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontFamily: 'Figtree_600SemiBold',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  ratingBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
  },
  content: {
    paddingVertical: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    marginRight: 12,
    color: colors.gray[900],
  },
  reviewCount: {
    color: colors.gray[500],
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
    marginTop: 8
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tooltipContainer: {
    position: 'relative',
  },
  rateInfoButton: {
    padding: 4,
    borderRadius: 999,
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: [{ translateX: -80 }],
    backgroundColor: colors.gray[800],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    width: 160,
    zIndex: 1000,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      },
    }),
  },
  tooltipText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'Figtree_500Medium',
    textAlign: 'center',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.gray[800],
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