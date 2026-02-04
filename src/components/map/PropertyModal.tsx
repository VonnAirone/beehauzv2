import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  MapPin,
  Star,
  Bed,
  Wifi,
  Car,
  Shield,
  Users,
  Eye,
} from 'lucide-react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { BoardingHouse } from '../../types/tenant';

const { width, height } = Dimensions.get('window');

interface PropertyModalProps {
  visible: boolean;
  onClose: () => void;
  property: BoardingHouse | null;
  university?: any;
  modalType?: 'property' | 'university';
  onViewDetails: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  visible,
  onClose,
  property,
  university,
  modalType = 'property',
  onViewDetails,
}) => {
  if (!property && !university) return null;
  
  // Use university data when modal type is university
  const isUniversityModal = modalType === 'university';
  const displayData = isUniversityModal ? university : property;

  const getDistanceText = (distance: number | undefined) => {
    if (!distance) return 'Distance unknown';
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m to UA`;
    return `${distance.toFixed(1)}km to UA`;
  };

  const getAmenityIcon = (amenity: string) => {
    const iconProps = { size: 16, color: colors.primary };
    
    if (amenity.toLowerCase().includes('wifi')) return <Wifi {...iconProps} />;
    if (amenity.toLowerCase().includes('parking')) return <Car {...iconProps} />;
    if (amenity.toLowerCase().includes('security')) return <Shield {...iconProps} />;
    return <Star {...iconProps} />;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
          <Text style={styles.headerTitle}>{isUniversityModal ? 'University Details' : 'Property Details'}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X color={colors.text.secondary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isUniversityModal ? (
            // University Details
            <View style={styles.infoContainer}>
              <Text style={styles.propertyName}>🏫 {displayData.name}</Text>
              
              <View style={styles.locationRow}>
                <MapPin color={colors.text.secondary} size={16} />
                <Text style={styles.locationText}>{displayData.location}</Text>
              </View>

              {/* University Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Star color={colors.warning} size={16} fill={colors.warning} />
                  <Text style={styles.statText}>University</Text>
                  <Text style={styles.statSubtext}>Campus</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Users color={colors.info} size={16} />
                  <Text style={styles.statText}>Public</Text>
                  <Text style={styles.statSubtext}>institution</Text>
                </View>
              </View>

              {/* University Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About This University</Text>
                <Text style={styles.description}>
                  {displayData.description || `${displayData.name} is a prestigious educational institution in ${displayData.location}. This campus serves as a major academic hub for students seeking quality higher education in the region.`}
                </Text>
              </View>

              {/* University Facilities */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Campus Facilities</Text>
                <View style={styles.amenitiesGrid}>
                  <View style={styles.amenityItem}>
                    <Star color={colors.primary} size={16} />
                    <Text style={styles.amenityText}>Library</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <Wifi color={colors.primary} size={16} />
                    <Text style={styles.amenityText}>WiFi Campus</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <Users color={colors.primary} size={16} />
                    <Text style={styles.amenityText}>Student Center</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <Car color={colors.primary} size={16} />
                    <Text style={styles.amenityText}>Parking</Text>
                  </View>
                </View>
              </View>

              {/* Nearby Boarding Houses Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nearby Accommodations</Text>
                <Text style={styles.description}>
                  Looking for boarding houses near {displayData.name}? Check out the available properties on the map. Most boarding houses are within walking distance of the campus.
                </Text>
              </View>
            </View>
          ) : (
            // Property Details (existing logic)
            <>
              {/* Property Images */}
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.imageContainer}
              >
                {property?.images.map((image: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.propertyImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>

              {/* Property Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.propertyName}>{property?.name}</Text>
                
                <View style={styles.locationRow}>
                  <MapPin color={colors.text.secondary} size={16} />
                  <Text style={styles.locationText}>{property?.location}</Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Star color={colors.warning} size={16} fill={colors.warning} />
                    <Text style={styles.statText}>{property?.rating}</Text>
                    <Text style={styles.statSubtext}>({property?.reviewCount} reviews)</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Bed color={colors.primary} size={16} />
                    <Text style={styles.statText}>{property?.availableBeds}</Text>
                    <Text style={styles.statSubtext}>available</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Users color={colors.info} size={16} />
                    <Text style={styles.statText}>{property?.capacity}</Text>
                    <Text style={styles.statSubtext}>capacity</Text>
                  </View>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>₱{property?.ratePerMonth.toLocaleString()}</Text>
                  <Text style={styles.priceUnit}>/month</Text>
                </View>

                <Text style={styles.distance}>
                  {getDistanceText(property?.distance)}
                </Text>

                {/* Description */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.description}>{property?.description}</Text>
                </View>

                {/* Payment Terms */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Payment Terms</Text>
                  <View style={styles.paymentGrid}>
                    <View style={styles.paymentItem}>
                      <Text style={styles.paymentLabel}>Advance Payment</Text>
                      <Text style={styles.paymentValue}>{property?.paymentTerms.advancePayment} month(s)</Text>
                    </View>
                    <View style={styles.paymentItem}>
                      <Text style={styles.paymentLabel}>Deposit</Text>
                      <Text style={styles.paymentValue}>₱{property?.paymentTerms.deposit.toLocaleString()}</Text>
                    </View>
                    <View style={styles.paymentItem}>
                      <Text style={styles.paymentLabel}>Electricity</Text>
                      <Text style={styles.paymentValue}>
                        {property?.paymentTerms.electricityIncluded ? 'Included' : 'Separate'}
                      </Text>
                    </View>
                    <View style={styles.paymentItem}>
                      <Text style={styles.paymentLabel}>Water</Text>
                      <Text style={styles.paymentValue}>
                        {property?.paymentTerms.waterIncluded ? 'Included' : 'Separate'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Amenities */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Amenities</Text>
                  <View style={styles.amenitiesGrid}>
                    {property?.amenities.map((amenity: string, index: number) => (
                      <View key={index} style={styles.amenityItem}>
                        {getAmenityIcon(amenity)}
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Owner Info */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Property Owner</Text>
                  <View style={styles.ownerRow}>
                    <Image
                      source={{ uri: property?.owner.profileImage }}
                      style={styles.ownerImage}
                    />
                    <Text style={styles.ownerName}>{property?.owner.name}</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Action Button - Only show for property modals */}
        {!isUniversityModal && property && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={onViewDetails}
            >
              <Eye color={colors.white} size={20} />
              <Text style={styles.viewDetailsText}>View Full Details</Text>
            </TouchableOpacity>
          </View>
        )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    paddingTop: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  headerTitle: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing[1],
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 200,
  },
  propertyImage: {
    width: width,
    height: 200,
  },
  infoContainer: {
    padding: spacing[4],
  },
  propertyName: {
    ...typography.textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  locationText: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    marginLeft: spacing[1],
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.gray[50],
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    marginTop: spacing[1],
  },
  statSubtext: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing[1],
  },
  price: {
    ...typography.textStyles.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  priceUnit: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    marginLeft: spacing[1],
  },
  distance: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  description: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paymentItem: {
    width: '50%',
    marginBottom: spacing[2],
  },
  paymentLabel: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  paymentValue: {
    ...typography.textStyles.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: spacing[2],
  },
  amenityText: {
    ...typography.textStyles.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing[3],
  },
  ownerName: {
    ...typography.textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  actionContainer: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  viewDetailsButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: 12,
  },
  viewDetailsText: {
    ...typography.textStyles.button,
    color: colors.white,
    marginLeft: spacing[2],
  },
});