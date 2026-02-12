import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal, useWindowDimensions, Linking, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, MapPin, Star, Wifi, Car, Utensils, Shield, Heart, MessageCircle, Users, Phone, Info, X, Edit3, House, Check, GraduationCap } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { Button, AuthPromptModal } from '../../../components/common';
import { BoardingHouse } from '../../../types/tenant';
import { useFavorites } from '../../../context/FavoritesContext';
import { useAuthContext } from '../../../context/AuthContext';
import { useGuestTracking } from '../../../context/GuestTrackingContext';
import { useUserType } from '../../../context/UserTypeContext';
import { canAccessFeature, FeatureType, BETA_TESTING_MODE } from '../../../utils/guestAccess';
import { useAppRating } from '../../../context/AppRatingContext';
import { TenantStackParamList } from '../../../navigation/types';
import { Marquee } from '@animatereactnative/marquee';
import { supabase } from '../../../services/supabase';

type BoardingHouseDetailRouteProp = RouteProp<{
  BoardingHouseDetail: { boardingHouse: BoardingHouse };
}, 'BoardingHouseDetail'>;

export const BoardingHouseDetailScreen: React.FC = () => {
  const route = useRoute<BoardingHouseDetailRouteProp>();
  const navigation = useNavigation<StackNavigationProp<TenantStackParamList>>();
  const { boardingHouse } = route.params;
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { isAuthenticated, user } = useAuthContext();
  const { trackPropertyView, shouldShowAuthPrompt } = useGuestTracking();
  const { clearUserType } = useUserType();
  const { incrementTrigger } = useAppRating();
  const [roomInfoModalVisible, setRoomInfoModalVisible] = React.useState(false);
  const [bookingModalVisible, setBookingModalVisible] = React.useState(false);
  const [authPromptVisible, setAuthPromptVisible] = React.useState(false);
  const [currentFeature, setCurrentFeature] = React.useState<FeatureType>('save_favorites');
  const [bookingStartDate, setBookingStartDate] = React.useState('');
  const [bookingEndDate, setBookingEndDate] = React.useState('');
  const [bookingHeads, setBookingHeads] = React.useState('');
  const [startDateValue, setStartDateValue] = React.useState<Date | null>(null);
  const [endDateValue, setEndDateValue] = React.useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = React.useState(false);
  const [showEndPicker, setShowEndPicker] = React.useState(false);
  const [bookingAccepted, setBookingAccepted] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = React.useState(false);
  const [pendingBooking, setPendingBooking] = React.useState<{ propertyName: string } | null>(null);
  const [activeTenancy, setActiveTenancy] = React.useState<{ propertyName: string } | null>(null);
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 768;
  const isWeb = Platform.OS === 'web';
  const disclaimerText =
    'All information displayed is based on publicly available sources. Details may not reflect current availability, pricing, or conditions. Property owners may request updates or removal at any time.';

  const formatCurrency = (value?: number) => {
    if (!value || value <= 0) {
      return '₱0.00';
    }

    return `₱${value.toLocaleString()}`;
  };

  const checkPendingBooking = React.useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setPendingBooking(null);
      return;
    }

    const { data } = await supabase
      .from('booking_requests')
      .select('id, properties:property_id(name)')
      .eq('requester_id', user.id)
      .eq('status', 'new')
      .limit(1)
      .maybeSingle();

    if (data) {
      const propertyName = (data.properties as any)?.name || 'a property';
      setPendingBooking({ propertyName });
    } else {
      setPendingBooking(null);
    }
  }, [isAuthenticated, user?.id]);

  const checkActiveTenancy = React.useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setActiveTenancy(null);
      return;
    }

    const { data } = await supabase
      .from('tenants')
      .select('id, properties:property_id(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('date_left', null)
      .limit(1)
      .maybeSingle();

    if (data) {
      const propertyName = (data.properties as any)?.name || 'a property';
      setActiveTenancy({ propertyName });
    } else {
      setActiveTenancy(null);
    }
  }, [isAuthenticated, user?.id]);

  React.useEffect(() => {
    checkPendingBooking();
    checkActiveTenancy();
  }, [checkPendingBooking, checkActiveTenancy]);

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

    setBookingModalVisible(true);
  };

  const handleBookingSubmit = async () => {
    console.log('Booking submit triggered');
    console.log('Boarding house payload:', {
      property_id: (boardingHouse as any).property_id,
      id: boardingHouse.id,
      name: boardingHouse.name,
      location: boardingHouse.location,
    });

    if (!bookingStartDate.trim()) {
      setBookingError('Start date is required.');
      return;
    }

    if (!bookingHeads.trim()) {
      setBookingError('Number of heads is required.');
      return;
    }

    if (!bookingAccepted) {
      setBookingError('You must accept responsibility to proceed.');
      return;
    }

    if (!user?.id) {
      setBookingError('You must be logged in to book.');
      return;
    }

    setIsSubmittingBooking(true);
    setBookingError(null);

    try {
      const propertyId = (boardingHouse as any).property_id || null;
      console.log('Looking up property in Supabase', { propertyId });

      let property: { id: string; owner_id: string } | null = null;
      let propertyError: any = null;

      if (propertyId) {
        const result = await supabase
          .from('properties')
          .select('id, owner_id')
          .eq('id', propertyId)
          .maybeSingle();
        property = result.data as any;
        propertyError = result.error;
      } else {
        const result = await supabase
          .from('properties')
          .select('id, owner_id')
          .eq('name', boardingHouse.name)
          .eq('address', boardingHouse.location)
          .maybeSingle();
        property = result.data as any;
        propertyError = result.error;
      }

      console.log('Supabase property lookup result:', { property, propertyError });

      if (propertyError || !property) {
        setBookingError('Unable to find this property. Please try again later.');
        return;
      }

      const { error: bookingError } = await supabase
        .from('booking_requests')
        .insert({
          property_id: property.id,
          requester_id: user.id,
          requester_name: user.fullName || user.email || 'Guest',
          start_date: bookingStartDate,
          end_date: bookingEndDate || null,
          heads_count: Number(bookingHeads),
          status: 'new',
        });

      if (bookingError) {
        console.log('Booking request insert error:', bookingError);
        setBookingError(bookingError.message || 'Unable to submit booking request. Please try again.');
        return;
      }

      setBookingModalVisible(false);
      setBookingStartDate('');
      setBookingEndDate('');
      setBookingHeads('');
      setBookingAccepted(false);
      checkPendingBooking();
      Alert.alert(
        'Booking Request Sent',
        'Your booking request has been submitted. The property owner will contact you soon.'
      );
    } finally {
      setIsSubmittingBooking(false);
    }
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

  const handleCallOwner = async () => {
    if (!canAccessFeature('contact_owner', isAuthenticated)) {
      showAuthPrompt('contact_owner');
      return;
    }

    const phone = boardingHouse.owner?.phone?.trim();

    if (!phone) {
      Alert.alert('No phone number', 'No contact number is available for this boarding house.');
      return;
    }

    const telUrl = `tel:${phone}`;
    const canOpen = await Linking.canOpenURL(telUrl);

    if (!canOpen) {
      Alert.alert('Unable to call', 'Your device cannot place calls from this app.');
      return;
    }

    Linking.openURL(telUrl);
  };


  const handleMessageOwner = async () => {
    if (!canAccessFeature('contact_owner', isAuthenticated)) {
      showAuthPrompt('contact_owner');
      return;
    }

    const facebookUrl = boardingHouse.owner?.facebook_url?.trim();

    if (!facebookUrl) {
      Alert.alert('No Facebook Connected', 'This owner has not connected their Facebook profile yet.');
      return;
    }

    const canOpen = await Linking.canOpenURL(facebookUrl);

    if (!canOpen) {
      Alert.alert('Unable to Open', 'Your device cannot open this link.');
      return;
    }

    Linking.openURL(facebookUrl);
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

  const formatDate = (value: Date | null) => {
    if (!value) return '';
    return value.toLocaleDateString('en-CA');
  };

  const displayedReviews: Array<{
    id: number;
    reviewer: { name: string; initials: string };
    rating: number;
    date: string;
    text: string;
  }> = [];

  const gridImages = Array.from({ length: 2 }, (_, index) => boardingHouse.images?.[index] ?? null);
  const hasImages = (boardingHouse.images ?? []).some((image) => Boolean(image));

  return (
    <View style={styles.screen}>
      <View style={styles.marqueeContainer}>
        <Marquee speed={.5} spacing={50} direction="horizontal" withGesture={false} style={styles.marquee}>
          <Text style={styles.marqueeText} numberOfLines={1}>
            {disclaimerText}
          </Text>
        </Marquee>
      </View>
      <SafeAreaView style={[styles.container, {
        width: isSmallScreen ? '95%' : '70%'
      }]} edges={['top']}>
      {/* Header */}
            
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('TenantTabs', { screen: 'Search' })}
        >
          <ArrowLeft size={22} color={colors.gray[700]} />
        </TouchableOpacity>

        <Text style={[typography.textStyles.h3, styles.headerTitle]}>Property Details</Text>
        
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Heart 
            size={24} 
            color={colors.primary} 
            fill={isFavorite(boardingHouse.id) ? colors.primary : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hasImages ? (
          <View style={styles.imageGrid}>
            {gridImages.map((uri, index) => (
              <View key={`grid-${index}`} style={styles.imageCell}>
                {uri ? (
                  <Image source={{ uri }} style={styles.imageFill} />
                ) : (
                  <View style={styles.imagePlaceholder} />
                )}
              </View>
            ))}
            <View style={styles.ratingBadge}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{boardingHouse.rating}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.imageEmpty}>
            <Text style={styles.imageEmptyText}>No photos added</Text>
          </View>
        )}

        <View style={styles.amenitiesChipSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.amenitiesChipRow}
          >
            {boardingHouse.amenities.map((amenity, index) => (
              <View key={`${amenity}-${index}`} style={styles.amenityChip}>
                <Check size={14} color={colors.primary} />
                <Text style={styles.amenityChipText}>{amenity}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Basic Info */}
        <View style={styles.infoSection}>
          <View>
              {boardingHouse.isAccredited && (
              <View style={styles.accreditedBadge}>
                <GraduationCap size={14} color={colors.white} />
                <Text style={styles.accreditedBadgeText}>University Accredited</Text>
              </View>
            )}
            <Text style={[typography.textStyles.h2, styles.propertyName]}>{boardingHouse.name}</Text>

            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => {
                const propertyId = (boardingHouse as any).property_id || boardingHouse.id;
                navigation.navigate('MapView', {
                  focusedPropertyId: propertyId,
                  focusedPropertyName: boardingHouse.name,
                  focusedPropertyAddress: boardingHouse.location,
                });
              }}
              activeOpacity={0.7}
            >
              <MapPin size={16} color={colors.primary} />
              <Text style={[typography.textStyles.body, styles.location, styles.locationLink]}>
                {boardingHouse.location}
              </Text>
            </TouchableOpacity>
          </View>


          <Text style={[typography.textStyles.bodySmall, styles.description]}>
            {boardingHouse.description}
          </Text>
        </View>

        <View style={[styles.roomPaymentRow, isSmallScreen && styles.roomPaymentColumn]}>
          {/* Room Types */}
          {boardingHouse.roomTypes && boardingHouse.roomTypes.length > 0 ? (
            <View
              style={[
                styles.section,
                styles.roomPaymentSection,
                !isSmallScreen && styles.roomPaymentSectionWide,
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Available Room Types</Text>
                <Text style={styles.sectionSubtitle}>Swipe to see all</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.roomTypeScroll}
              >
                {boardingHouse.roomTypes.map((roomType, index) => (
                  <View key={index} style={styles.roomTypeTile}>
                    <View style={styles.roomTypeTileHeader}>
                      <View style={styles.roomTypeBadge}>
                        <Users size={14} color={colors.primary} />
                        <Text style={styles.roomTypeBadgeText}>
                          {roomType.type.replace('-', ' ').toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.roomTypePriceBlock}>
                        <Text style={styles.roomTypePriceValue}>
                          {formatCurrency(roomType.pricePerMonth)}
                        </Text>
                        <Text style={styles.roomTypePriceUnit}>/month</Text>
                      </View>
                    </View>
                    <View style={styles.roomTypeTileBody}>
                      <View style={styles.roomTypeMetric}>
                        <Text style={styles.roomTypeMetricLabel}>Availability</Text>
                        <Text style={styles.roomTypeMetricValue}>
                          {roomType.available} bed{roomType.available !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={styles.roomTypeMetricDivider} />
                      <View style={styles.roomTypeMetric}>
                        <Text style={styles.roomTypeMetricLabel}>Deposit</Text>
                        <Text style={styles.roomTypeMetricValue}>1 month</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View
              style={[
                styles.section,
                styles.roomPaymentSection,
                !isSmallScreen && styles.roomPaymentSectionWide,
              ]}
            >
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
                      STANDARD ROOM
                    </Text>
                  </View>
                  <Text style={[typography.textStyles.h3, styles.roomTypePrice]}>
                    {formatCurrency(boardingHouse.ratePerMonth)}
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

          <View
            style={[
              styles.section,
              styles.roomPaymentSection,
              !isSmallScreen && styles.roomPaymentSectionWide,
            ]}
          >
            <Text style={[typography.textStyles.h4, styles.sectionTitle, {marginBottom: 16}]}>Payment Terms</Text>
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
        </View>

        {/* Property Owner */}
        <View style={styles.section}>
          <Text style={[typography.textStyles.h4, styles.sectionTitle, {marginBottom: 16}]}>Property Owner</Text>
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
                    <Text style={styles.ownerRatingText}>
                      {boardingHouse.rating}
                    </Text>
                  </View>
                </View>
                <Text style={[typography.textStyles.bodySmall, styles.ownerJoined]}>
                  Joined {new Date(boardingHouse.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
              </View>
            </View>
            <View style={styles.ownerActions}>
              <TouchableOpacity 
                style={styles.ownerActionButton} 
                onPress={handleCallOwner}
              >
                <Phone size={20} color={colors.primary} />
                <Text style={styles.ownerActionButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.ownerActionButton} 
                onPress={handleMessageOwner}
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
            <Text style={[typography.textStyles.h4, styles.sectionTitle, {marginBottom: 16}]}>Reviews</Text>
            <View style={styles.reviewsSummary}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.reviewsRating}>{boardingHouse.rating}</Text>
              <Text style={styles.reviewsCount}>({boardingHouse.reviewCount} reviews)</Text>
            </View>
          </View>
          
          <View style={styles.reviewsList}>
            {displayedReviews.length === 0 ? (
              <Text style={styles.noReviewsText}>No reviews yet.</Text>
            ) : (
              displayedReviews.map((review) => (
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
              ))
            )}
          </View>
          
          <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
            <Edit3 size={20} color={colors.primary} />
            <Text style={styles.writeReviewText}>Write a Review</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      </SafeAreaView>

      {/* Fixed Book Now Button */}
      <SafeAreaView edges={['bottom']} style={styles.bookingContainer}>
        {activeTenancy ? (
          <View style={styles.pendingBookingBar}>
            <Info size={16} color={colors.gray[600]} />
            <Text style={styles.pendingBookingText}>
              You are currently staying in a boarding house.
            </Text>
          </View>
        ) : pendingBooking ? (
          <View style={styles.pendingBookingBar}>
            <Info size={16} color={colors.gray[600]} />
            <Text style={styles.pendingBookingText}>
              You have a pending booking request for {pendingBooking.propertyName}.
            </Text>
          </View>
        ) : (
          <View style={styles.bookingContent}>
            <View style={styles.priceContainer}>
              <Text style={styles.bookingPrice}>{formatCurrency(boardingHouse.ratePerMonth)}</Text>
              <Text style={styles.bookingPeriod}>/month</Text>
            </View>
            <Button
              title="Book Now"
              onPress={handleBookNow}
              style={styles.bookButton}
            />
          </View>
        )}
      </SafeAreaView>

      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setBookingModalVisible(false)}
          />
          <View style={styles.bookingModal}>
            <View style={styles.bookingModalHeader}>
              <Text style={[typography.textStyles.h3, styles.bookingModalTitle]}>Reserve Request</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setBookingModalVisible(false)}
              >
                <X size={22} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <Text style={styles.bookingHelperText}>
              Provide your intended stay dates so the owner can confirm availability.
            </Text>

            <View style={styles.bookingField}>
              <Text style={styles.bookingLabel}>Start date</Text>
              {isWeb ? (
                <TextInput
                  value={bookingStartDate}
                  placeholder='Ex. February 12, 2026'
                  onChange={(event) =>
                    setBookingStartDate((event.nativeEvent as any)?.target?.value ?? '')
                  }
                  style={styles.bookingInput}
                  placeholderTextColor={colors.gray[400]}
                  {...({ type: 'date' } as any)}
                />
              ) : (
                <TouchableOpacity
                  style={styles.bookingInputButton}
                  onPress={() => setShowStartPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={bookingStartDate ? styles.bookingInputText : styles.bookingInputPlaceholder}>
                    {bookingStartDate || 'Select start date'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.bookingField}>
              <Text style={styles.bookingLabel}>End date (optional)</Text>
              {isWeb ? (
                <TextInput
                  value={bookingEndDate}
                  placeholder='Ex. February 12, 2026'
                  onChange={(event) =>
                    setBookingEndDate((event.nativeEvent as any)?.target?.value ?? '')
                  }
                  style={styles.bookingInput}
                  placeholderTextColor={colors.gray[400]}
                  {...({ type: 'date' } as any)}
                />
              ) : (
                <TouchableOpacity
                  style={styles.bookingInputButton}
                  onPress={() => setShowEndPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={bookingEndDate ? styles.bookingInputText : styles.bookingInputPlaceholder}>
                    {bookingEndDate || 'Select end date'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.bookingField}>
              <Text style={styles.bookingLabel}>Number of heads</Text>
              <TextInput
                placeholder="e.g. 2"
                value={bookingHeads}
                onChangeText={setBookingHeads}
                style={styles.bookingInput}
                placeholderTextColor={colors.gray[400]}
                keyboardType="number-pad"
              />
            </View>

            {bookingStartDate.trim() && bookingHeads.trim() && (
              <View style={styles.bookingPriceRow}>
                <Text style={styles.bookingPriceLabel}>Estimated monthly total</Text>
                <Text style={styles.bookingPriceValue}>
                  {formatCurrency((Number(bookingHeads) || 0) * (boardingHouse.ratePerMonth || 0))}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.bookingCheckboxRow}
              onPress={() => setBookingAccepted((prev) => !prev)}
            >
              <View style={[styles.bookingCheckbox, bookingAccepted && styles.bookingCheckboxChecked]}>
                {bookingAccepted && <Check size={14} color={colors.white} />}
              </View>
              <Text style={styles.bookingCheckboxText}>
                I have read and agreed to the{' '}
                <Text style={styles.bookingLinkText} onPress={() => { setBookingModalVisible(false); navigation.navigate('TermsAndConditions'); }}>Terms and Conditions</Text>, and{' '}
                <Text style={styles.bookingLinkText} onPress={() => { setBookingModalVisible(false); navigation.navigate('PrivacyPolicy'); }}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>

            {bookingError && <Text style={styles.bookingError}>{bookingError}</Text>}

            <Button
              title="Submit Request"
              onPress={handleBookingSubmit}
              style={styles.submitBookingButton}
              loading={isSubmittingBooking}
              loadingText="Submitting..."
            />
          </View>
        </View>
      </Modal>

      {!isWeb && showStartPicker && (
        <DateTimePicker
          value={startDateValue ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setStartDateValue(selectedDate);
              setBookingStartDate(formatDate(selectedDate));
            }
          }}
        />
      )}

      {!isWeb && showEndPicker && (
        <DateTimePicker
          value={endDateValue ?? (startDateValue ?? new Date())}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              setEndDateValue(selectedDate);
              setBookingEndDate(formatDate(selectedDate));
            }
          }}
          minimumDate={startDateValue ?? undefined}
        />
      )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
  },
  marqueeContainer: {
    height: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  marquee: {
    width: '100%',
    height: '100%',
  },
  marqueeText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'Figtree_500Medium',
    padding: 8,
  },
  container: {
    flex: 1,
    margin: 'auto',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center', 
    gap: 10
  },
  headerTitle: {
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  likeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  amenitiesChipSection: {
    paddingTop: 20,
  },
  amenitiesChipRow: {
    gap: 8,
    paddingBottom: 6,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gray[50],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  amenityChipText: {
    color: colors.gray[700],
    fontSize: 12,
    fontFamily: 'Figtree_500Medium',
  },
  imageGrid: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 5,
  },
  imageCell: {
    width: '49%',
    aspectRatio: 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
  },
  imageFill: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  imageEmpty: {
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  imageEmptyText: {
    color: colors.gray[500],
    fontSize: 14,
    fontFamily: 'Figtree_500Medium',
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  propertyName: {
    color: colors.gray[900],
    marginBottom: 8,
  },
  accreditedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#16a34a',
    marginBottom: 10,
  },
  accreditedBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: colors.gray[600],
  },
  locationLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  price: {
    color: colors.primary,
    fontWeight: '700',
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
  },
  roomPaymentRow: {
    flexDirection: 'row',
    gap: 16,
  },
  roomPaymentColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  roomPaymentSection: {
    width: '100%',
    minWidth: 0,
    flexShrink: 1,
  },
  roomPaymentSectionWide: {
    flex: 1,
    width: 'auto',
    minWidth: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: colors.gray[500],
    fontSize: 12,
    fontFamily: 'Figtree_500Medium',
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
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
  roomTypeScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  roomTypeTile: {
    width: 240,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  roomTypeTileHeader: {
    gap: 10,
  },
  roomTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primary + '12',
  },
  roomTypeBadgeText: {
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.primary,
  },
  roomTypePriceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  roomTypePriceValue: {
    fontSize: 20,
    fontFamily: 'Figtree_700Bold',
    color: colors.gray[900],
  },
  roomTypePriceUnit: {
    fontSize: 12,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[500],
  },
  roomTypeTileBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  roomTypeMetric: {
    flex: 1,
  },
  roomTypeMetricLabel: {
    fontSize: 11,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[500],
    marginBottom: 4,
  },
  roomTypeMetricValue: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[800],
  },
  roomTypeMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.gray[200],
    marginHorizontal: 10,
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
  noReviewsText: {
    fontSize: 14,
    color: colors.gray[500],
    fontFamily: 'Figtree_400Regular',
    textAlign: 'center',
    paddingVertical: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  bookingModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  bookingModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookingModalTitle: {
    color: colors.gray[900],
  },
  bookingHelperText: {
    color: colors.gray[600],
    fontSize: 13,
    marginBottom: 16,
  },
  bookingField: {
    marginBottom: 14,
  },
  bookingLabel: {
    color: colors.gray[700],
    fontSize: 13,
    marginBottom: 6,
  },
  bookingInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.gray[800],
    backgroundColor: colors.white,
  },
  bookingInputButton: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  bookingInputText: {
    color: colors.gray[800],
    fontSize: 14,
  },
  bookingInputPlaceholder: {
    color: colors.gray[400],
    fontSize: 14,
  },
  bookingCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 6,
    marginBottom: 12,
  },
  bookingCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bookingCheckboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bookingCheckboxText: {
    flex: 1,
    fontSize: 12,
    color: colors.gray[600],
    lineHeight: 18,
  },
  bookingLinkText: {
    color: colors.primary,
    fontFamily: 'Figtree_600SemiBold',
    textDecorationLine: 'underline',
  },
  bookingError: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 12,
  },
  bookingPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 10,
  },
  bookingPriceLabel: {
    color: colors.gray[700],
    fontSize: 12,
  },
  bookingPriceValue: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
  },
  submitBookingButton: {
    marginTop: 4,
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
  pendingBookingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  pendingBookingText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[600],
  },
});