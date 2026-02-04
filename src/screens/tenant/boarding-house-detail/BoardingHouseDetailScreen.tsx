import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Star, Wifi, Car, Utensils, Shield, Heart, MessageCircle, Users, Phone, Info, X, Edit3 } from 'lucide-react-native';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { Button, AuthPromptModal } from '../../../components/common';
import { BoardingHouse } from '../../../types/tenant';
import { useFavorites } from '../../../context/FavoritesContext';
import { useAuth } from '../../../hooks/useAuth';
import { useGuestTracking } from '../../../context/GuestTrackingContext';
import { useUserType } from '../../../context/UserTypeContext';
import { canAccessFeature, FeatureType, GUEST_LIMITS, BETA_TESTING_MODE } from '../../../utils/guestAccess';
import { useAppRating } from '../../../context/AppRatingContext';

type BoardingHouseDetailRouteProp = RouteProp<{
  BoardingHouseDetail: { boardingHouse: BoardingHouse };
}, 'BoardingHouseDetail'>;

export const BoardingHouseDetailScreen: React.FC = () => {
  const route = useRoute<BoardingHouseDetailRouteProp>();
  const navigation = useNavigation();
  const { boardingHouse } = route.params;
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { trackPropertyView, shouldShowAuthPrompt } = useGuestTracking();
  const { clearUserType } = useUserType();
  const { incrementTrigger } = useAppRating();
  const [roomInfoModalVisible, setRoomInfoModalVisible] = React.useState(false);
  const [authPromptVisible, setAuthPromptVisible] = React.useState(false);
  const [currentFeature, setCurrentFeature] = React.useState<FeatureType>('save_favorites');

  // Track property view for guests (disabled during beta testing) and rating system
  React.useEffect(() => {
    // Track for app rating system (for all users) - only once per property
    incrementTrigger('properties_viewed');
    
    if (!isAuthenticated && !BETA_TESTING_MODE) {
      trackPropertyView(boardingHouse.id);
      
      // Show auth prompt after viewing limit reached
      if (shouldShowAuthPrompt()) {
        setTimeout(() => {
          showAuthPrompt('view_all_properties');
        }, 2000); // Show after 2 seconds to let user see the property first
      }
    }
  }, [boardingHouse.id]); // Removed other dependencies to prevent infinite loops

  const amenityIcons: { [key: string]: any } = {
    'Wi-Fi': Wifi,
    'Parking': Car,
    'Kitchen Access': Utensils,
    'Security': Shield,
  };

  const showAuthPrompt = (feature: FeatureType) => {
    setCurrentFeature(feature);
    setAuthPromptVisible(true);
  };

  const handleBookNow = () => {
    if (!canAccessFeature('make_booking', isAuthenticated)) {
      showAuthPrompt('make_booking');
      return;
    }

    Alert.alert(
      'Coming Soon! 🚀',
      `The booking feature will be available soon!\n\nWe're working hard to bring you a seamless booking experience. Stay tuned for updates!`,
      [
        { text: 'Got it!', style: 'default' }
      ]
    );
  };

  const handleContact = () => {
    if (!canAccessFeature('contact_owner', isAuthenticated)) {
      showAuthPrompt('contact_owner');
      return;
    }

    Alert.alert(
      'Contact Owner',
      `Contact the owner of ${boardingHouse.name}?\n\nThis would open a chat or call option.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Message', onPress: () => {/* TODO: Open chat */} },
        { text: 'Call', onPress: () => {/* TODO: Make call */} }
      ]
    );
  };

  const handleLike = () => {
    if (!canAccessFeature('save_favorites', isAuthenticated)) {
      showAuthPrompt('save_favorites');
      return;
    }

    const isCurrentlyFavorite = isFavorite(boardingHouse.id);
    
    if (isCurrentlyFavorite) {
      removeFromFavorites(boardingHouse.id);
      Alert.alert('Removed from Favorites', `${boardingHouse.name} has been removed from your favorites.`);
    } else {
      addToFavorites(boardingHouse, () => {
        // Track favorite added for rating system
        incrementTrigger('favorites_added');
      });
      Alert.alert('Added to Favorites', `${boardingHouse.name} has been added to your favorites!`);
    }
  };

  const handleWriteReview = () => {
    if (!canAccessFeature('write_review', isAuthenticated)) {
      showAuthPrompt('write_review');
      return;
    }

    Alert.alert(
      'Write a Review',
      'Only active or former tenants of this boarding house can write reviews. This helps ensure authentic and reliable feedback for future tenants.\n\nTo write a review, you must have stayed at this property.',
      [
        { text: 'I Understand', style: 'default' },
        { 
          text: 'I\'m a Tenant', 
          style: 'default',
          onPress: () => {
            Alert.alert(
              'Review Feature Coming Soon!',
              'The review writing feature will be available in the next update. Thank you for your patience!'
            );
          }
        }
      ]
    );
  };

  const handleAuthPromptSignUp = () => {
    setAuthPromptVisible(false);
    // Clear user type to trigger auth flow, user will land on login screen by default
    clearUserType();
  };

  const handleAuthPromptLogin = () => {
    setAuthPromptVisible(false);
    // Clear user type to trigger auth flow, user will land on login screen by default
    clearUserType();
  };

  // Mock reviews data - in a real app, this would come from the boardingHouse object
  const allReviews = [
    {
      id: 1,
      reviewer: { name: 'Maria Santos', initials: 'MJ' },
      rating: 5,
      date: '2 weeks ago',
      text: 'Great place to stay! The room is clean and comfortable. The owner is very accommodating and responsive. Location is perfect for students, just a few minutes walk to the university.'
    },
    {
      id: 2,
      reviewer: { name: 'John Cruz', initials: 'JC' },
      rating: 4,
      date: '1 month ago',
      text: 'Good value for money. WiFi is stable and the common areas are well-maintained. The only minor issue is the limited parking space, but overall satisfied with my stay.'
    },
    {
      id: 3,
      reviewer: { name: 'Anna Reyes', initials: 'AS' },
      rating: 5,
      date: '2 months ago',
      text: 'Excellent boarding house! Very clean, safe, and the facilities are modern. The owner is friendly and helpful. Highly recommend for students and young professionals.'
    },
    // Additional reviews that guests won't see
    {
      id: 4,
      reviewer: { name: 'Carlos Rivera', initials: 'CR' },
      rating: 4,
      date: '3 months ago',
      text: 'Nice place with good amenities. The internet is fast and the location is convenient. Would recommend to fellow students.'
    },
    {
      id: 5,
      reviewer: { name: 'Lisa Garcia', initials: 'LG' },
      rating: 5,
      date: '4 months ago',
      text: 'One of the best boarding houses in the area. Clean, safe, and well-managed. The owner is very responsive to any concerns.'
    }
  ];

  // Limit reviews for guest users
  const displayedReviews = isAuthenticated 
    ? allReviews 
    : allReviews.slice(0, GUEST_LIMITS.MAX_REVIEWS_VIEW);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={[typography.textStyles.h4, styles.headerTitle]}>Property Details</Text>
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Heart 
            size={24} 
            color={colors.white} 
            fill={isFavorite(boardingHouse.id) ? colors.white : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: boardingHouse.images[0] }} style={styles.mainImage} />
          <View style={styles.ratingBadge}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{boardingHouse.rating}</Text>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.infoSection}>
          <Text style={[typography.textStyles.h2, styles.propertyName]}>{boardingHouse.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.gray[600]} />
            <Text style={[typography.textStyles.body, styles.location]}>{boardingHouse.location}</Text>
          </View>
          {boardingHouse.roomTypes && boardingHouse.roomTypes.length > 1 ? (
            <Text style={[typography.textStyles.body, styles.multipleRoomsText]}>
              Multiple room types available
            </Text>
          ) : (
            <Text style={[typography.textStyles.h3, styles.price]}>
              ₱{boardingHouse.ratePerMonth.toLocaleString()}/month
            </Text>
          )}
        </View>

        {/* Room Types */}
        {boardingHouse.roomTypes && boardingHouse.roomTypes.length > 0 ? (
          <View style={styles.section}>
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Available Room Types</Text>
            <View style={styles.roomTypesContainer}>
              {boardingHouse.roomTypes.map((roomType, index) => (
                <View key={index} style={styles.roomTypeCard}>
                  <View style={styles.roomTypeHeader}>
                    <View style={styles.roomTypeIconContainer}>
                      <Users size={20} color={colors.primary} />
                      <Text style={[typography.textStyles.h4, styles.roomTypeName]}>
                        {roomType.type.replace('-', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[typography.textStyles.h3, styles.roomTypePrice]}>
                      ₱{roomType.pricePerMonth.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.roomTypeInfo}>
                    <Text style={[typography.textStyles.body, styles.roomTypeAvailability]}>
                      {roomType.available} bed{roomType.available !== 1 ? 's' : ''} available
                    </Text>
                    <Text style={[typography.textStyles.bodySmall, styles.roomTypePeriod]}>
                      per month
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionTitleWithInfo}>
              <Text style={[typography.textStyles.h4]}>Room Information</Text>
              <TouchableOpacity 
                style={styles.infoButton}
                onPress={() => setRoomInfoModalVisible(true)}
              >
                <Info size={15} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.roomTypeCard}>
              <View style={styles.roomTypeHeader}>
                <View style={styles.roomTypeIconContainer}>
                  <Users size={14} color={colors.primary} />
                  <Text style={[typography.textStyles.h6, styles.roomTypeName]}>
                    STANDARD ROOM (4-Person)
                  </Text>
                </View>
                <Text style={[typography.textStyles.h3, styles.roomTypePrice]}>
                  ₱{boardingHouse.ratePerMonth.toLocaleString()}
                </Text>
              </View>
              <View style={styles.roomTypeInfo}>
                <Text style={[typography.textStyles.body, styles.roomTypeAvailability]}>
                  {boardingHouse.availableBeds} bed{boardingHouse.availableBeds !== 1 ? 's' : ''} available
                </Text>
                <Text style={[typography.textStyles.bodySmall, styles.roomTypePeriod]}>
                  per month
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Description</Text>
          <Text style={[typography.textStyles.body, styles.description]}>
            {boardingHouse.description || `Experience comfortable living at ${boardingHouse.name}. This well-maintained boarding house offers excellent facilities and a convenient location perfect for students and professionals. Enjoy a safe and friendly environment with all the amenities you need for a comfortable stay.`}
          </Text>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {boardingHouse.amenities.map((amenity, index) => {
              const IconComponent = amenityIcons[amenity] || Wifi;
              return (
                <View key={index} style={styles.amenityItem}>
                  <IconComponent size={20} color={colors.primary} />
                  <Text style={[typography.textStyles.body, styles.amenityText]}>{amenity}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Payment Terms */}
        <View style={styles.section}>
          <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Payment Terms</Text>
          <View style={styles.paymentGrid}>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Advance Payment</Text>
              <Text style={styles.paymentValue}>{boardingHouse.paymentTerms.advancePayment} month(s)</Text>
            </View>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Deposit</Text>
              <Text style={styles.paymentValue}>₱{boardingHouse.paymentTerms.deposit.toLocaleString()}</Text>
            </View>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Electricity</Text>
              <Text style={styles.paymentValue}>
                {boardingHouse.paymentTerms.electricityIncluded ? 'Included' : 'Separate'}
              </Text>
            </View>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Water</Text>
              <Text style={styles.paymentValue}>
                {boardingHouse.paymentTerms.waterIncluded ? 'Included' : 'Separate'}
              </Text>
            </View>
          </View>
        </View>

        {/* Property Owner */}
        <View style={styles.section}>
          <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Property Owner</Text>
          <View style={styles.ownerCard}>
            <View style={styles.ownerInfo}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerInitials}>
                  {boardingHouse.owner?.name ? 
                    boardingHouse.owner.name.split(' ').map(n => n[0]).join('').toUpperCase() :
                    'JD'
                  }
                </Text>
              </View>
              <View style={styles.ownerDetails}>
                <View style={styles.ownerNameRow}>
                  <Text style={[typography.textStyles.h4, styles.ownerName]}>
                    {boardingHouse.owner?.name || 'John Doe'}
                  </Text>
                  <View style={styles.ownerRating}>
                    <Star size={14} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.ownerRatingText}>4.8</Text>
                  </View>
                </View>
                <Text style={[typography.textStyles.bodySmall, styles.ownerJoined]}>
                  Joined March 2023
                </Text>
              </View>
            </View>
            <View style={styles.ownerActions}>
              <TouchableOpacity 
                style={styles.ownerActionButton} 
                onPress={() => Alert.alert('Call Owner', 'Calling feature coming soon!')}
              >
                <Phone size={20} color={colors.primary} />
                <Text style={styles.ownerActionButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.ownerActionButton} 
                onPress={() => Alert.alert('Message Owner', 'Messaging feature coming soon!')}
              >
                <MessageCircle size={20} color={colors.primary} />
                <Text style={styles.ownerActionButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Reviews</Text>
            <View style={styles.reviewsSummary}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.reviewsRating}>{boardingHouse.rating}</Text>
              <Text style={styles.reviewsCount}>({boardingHouse.reviewCount} reviews)</Text>
            </View>
          </View>
          
          <View style={styles.reviewsList}>
            {displayedReviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerInitials}>{review.reviewer.initials}</Text>
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.reviewer.name}</Text>
                    <View style={styles.reviewRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={12} 
                          color={star <= review.rating ? "#FFD700" : "#E5E5E5"} 
                          fill={star <= review.rating ? "#FFD700" : "#E5E5E5"} 
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            ))}
            
            {/* Guest limitation notice */}
            {!isAuthenticated && allReviews.length > GUEST_LIMITS.MAX_REVIEWS_VIEW && (
              <TouchableOpacity 
                style={styles.moreReviewsButton} 
                onPress={() => showAuthPrompt('read_reviews')}
              >
                <Text style={styles.moreReviewsText}>
                  +{allReviews.length - GUEST_LIMITS.MAX_REVIEWS_VIEW} more reviews
                </Text>
                <Text style={styles.moreReviewsSubtext}>Sign up to read all reviews</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Write Review Button */}
          <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
            <Edit3 size={20} color={colors.primary} />
            <Text style={styles.writeReviewText}>Write a Review</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding for book button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Book Now Button */}
      <SafeAreaView edges={['bottom']} style={styles.bookingContainer}>
        <View style={styles.bookingContent}>
          <View style={styles.priceContainer}>
            <Text style={styles.bookingPrice}>₱{boardingHouse.ratePerMonth.toLocaleString()}</Text>
            <Text style={styles.bookingPeriod}>/month</Text>
          </View>
          <Button
            title="Book Now"
            onPress={handleBookNow}
            style={styles.bookButton}
          />
        </View>
      </SafeAreaView>

      {/* Room Types Info Modal */}
      <Modal
        visible={roomInfoModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setRoomInfoModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={[typography.textStyles.h3, styles.modalTitle]}>Room Types Guide</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setRoomInfoModalVisible(false)}
            >
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.roomTypeGuide}>
              <View style={styles.guideItem}>
                <Text style={styles.guideTitle}>🛏️ 1-Person Room</Text>
                <Text style={styles.guideDescription}>
                  Private room for one person with personal bed, study table, and storage space. Perfect for students who prefer privacy and quiet study environment. Most expensive option but offers maximum privacy.
                </Text>
              </View>
              
              <View style={styles.guideItem}>
                <Text style={styles.guideTitle}>👥 4-Person Room</Text>
                <Text style={styles.guideDescription}>
                  Room shared with 3 other tenants (4 people total). Each person has their own bed and storage space. Good balance between affordability and personal space. Great for making friends.
                </Text>
              </View>
              
              <View style={styles.guideItem}>
                <Text style={styles.guideTitle}>🏠 6-Person Room</Text>
                <Text style={styles.guideDescription}>
                  Room accommodating 6 people with individual beds and shared storage areas. More affordable option with a lively social environment. Usually features bunk beds to maximize space.
                </Text>
              </View>
              
              <View style={styles.guideItem}>
                <Text style={styles.guideTitle}>🛏️ 8-Person Room</Text>
                <Text style={styles.guideDescription}>
                  Largest capacity room for 8 people, typically using bunk beds. Most budget-friendly option perfect for students prioritizing cost savings. Very social environment with shared amenities.
                </Text>
              </View>
              
              <View style={styles.noteSection}>
                <Text style={styles.noteTitle}>📋 What's Usually Included:</Text>
                <Text style={styles.noteText}>
                  • Bed with mattress and linens{"\n"}
                  • Study table and chair{"\n"}
                  • Storage cabinet or wardrobe{"\n"}
                  • Shared bathroom facilities{"\n"}
                  • Common kitchen access{"\n"}
                  • WiFi internet connection{"\n"}
                  • Utilities (water, electricity)*{"\n\n"}
                  *Some utilities may be charged separately depending on the boarding house policy.
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        visible={authPromptVisible}
        feature={currentFeature}
        onClose={() => setAuthPromptVisible(false)}
        onSignUp={handleAuthPromptSignUp}
        onLogin={handleAuthPromptLogin}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  likeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  propertyName: {
    color: colors.gray[900],
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  location: {
    color: colors.gray[600],
  },
  price: {
    color: colors.primary,
    fontWeight: '700',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  sectionTitle: {
    color: colors.gray[900],
    marginBottom: 16,
  },
  description: {
    color: colors.gray[700],
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: '45%',
    gap: 8,
  },
  amenityText: {
    color: colors.gray[700],
    fontSize: 14,
  },
  paymentInfo: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  paymentLabel: {
    ...typography.textStyles.bodySmall,
    color: colors.gray[600],
    marginBottom: 4,
  },
  paymentValue: {
    ...typography.textStyles.body,
    color: colors.gray[900],
    fontWeight: '600',
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paymentItem: {
    width: '50%',
    marginBottom: 12,
  },
  actionSection: {
    padding: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  contactButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
  bookingContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bookingPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  bookingPeriod: {
    fontSize: 16,
    color: colors.gray[600],
    marginLeft: 4,
  },
  bookButton: {
    minWidth: 120,
  },
  multipleRoomsText: {
    color: colors.gray[600],
    fontStyle: 'italic',
  },
  roomTypesContainer: {
    gap: 12,
  },
  roomTypeCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  roomTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomTypeIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomTypeName: {
    color: colors.gray[900],
    fontWeight: '600',
  },
  roomTypePrice: {
    color: colors.primary,
    fontWeight: '700',
  },
  roomTypeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTypeAvailability: {
    color: colors.gray[600],
  },
  roomTypePeriod: {
    color: colors.gray[500],
  },
  ownerCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ownerInitials: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 18,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerName: {
    color: colors.gray[900],
    fontWeight: '600',
  },
  ownerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ownerRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
  },
  ownerJoined: {
    color: colors.gray[600],
    marginTop: 2,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  ownerActionButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ownerActionButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewsRating: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  reviewsCount: {
    fontSize: 14,
    color: colors.gray[600],
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewerInitials: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.gray[500],
  },
  reviewText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  sectionTitleWithInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 16,
  },
  infoButton: {
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    color: colors.gray[900],
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  roomTypeGuide: {
    paddingVertical: 20,
  },
  guideItem: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
  },
  guideDescription: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  noteSection: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 8,
  },
  writeReviewText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  moreReviewsButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  moreReviewsText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  moreReviewsSubtext: {
    color: colors.text.secondary,
    fontSize: 14,
  },
});