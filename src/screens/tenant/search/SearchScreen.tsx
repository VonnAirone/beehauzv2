import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, ScrollView, Modal, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { Heart, Home, Shirt, ShoppingBag, Filter, Search, X, BookOpen } from 'lucide-react-native';
import { TenantStackParamList, TenantTabParamList } from '../../../navigation/types';
import { BoardingHouseCard } from '../../../components/tenant';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { sampleBoardingHouses } from '../../../data/sampleBoardingHouses';
import { sampleBlogPosts } from '../../../data/sampleBlogPosts';
import { useFavorites } from '../../../context/FavoritesContext';
import { useAuth } from '../../../hooks/useAuth';
import { useGuestTracking } from '../../../context/GuestTrackingContext';
import { useUserType } from '../../../context/UserTypeContext';
import { GuestViewProgressBanner, AuthPromptModal } from '../../../components/common';
import { FeatureType, BETA_TESTING_MODE } from '../../../utils/guestAccess';
import { POPULAR_SCHOOLS } from '../../../utils/constants';
import { surveyService, SurveySubmissionData } from '../../../services/surveyService';
import { useAppRating } from '../../../context/AppRatingContext';

type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TenantTabParamList, 'Search'>,
  StackNavigationProp<TenantStackParamList>
>;

type ServiceTab = 'properties' | 'laundry' | 'delivery';

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { hasUnviewedFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { hasReachedViewLimit } = useGuestTracking();
  const { clearUserType } = useUserType();
  const { incrementTrigger } = useAppRating();
  const [activeTab, setActiveTab] = useState<ServiceTab>('properties');
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 0, max: 10000});
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyType, setSurveyType] = useState<'laundry' | 'delivery'>('laundry');
  const [authPromptVisible, setAuthPromptVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<FeatureType>('view_all_properties');
  const [anonymousEmail, setAnonymousEmail] = useState('');

  const tabs = [
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'laundry', label: 'Palaba', icon: Shirt },
    { id: 'delivery', label: 'Pabakal', icon: ShoppingBag },
  ];

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

  const handleGuestSignUp = () => {
    setCurrentFeature('view_all_properties');
    setAuthPromptVisible(true);
  };

  const handlePropertyPress = (boardingHouse: any) => {
    // Track property view for rating system
    incrementTrigger('properties_viewed');
    
    // Navigate to property detail
    navigation.navigate('BoardingHouseDetail', { boardingHouse });
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    
    // Track search if user typed something meaningful
    if (text.trim().length >= 2) {
      incrementTrigger('search_performed');
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => setActiveTab(tab.id as ServiceTab)}
          >
            <IconComponent size={20} color={isActive ? colors.white : colors.gray[500]} />
            <Text style={[
              styles.tabText,
              isActive ? styles.activeTabText : styles.inactiveTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const filterProperties = (properties: typeof sampleBoardingHouses) => {
    return properties.filter(property => {
      // Price filter
      const meetsPriceRange = property.ratePerMonth >= priceRange.min && 
                              property.ratePerMonth <= priceRange.max;
      
      // Search text filter
      const meetsSearchCriteria = searchText === '' || 
                                  property.name.toLowerCase().includes(searchText.toLowerCase()) ||
                                  property.location.toLowerCase().includes(searchText.toLowerCase()) ||
                                  property.description.toLowerCase().includes(searchText.toLowerCase());
      
      // School/Location filter
      const meetsSchoolCriteria = selectedSchool === '' || 
                                  property.location.toLowerCase().includes(selectedSchool.toLowerCase()) ||
                                  property.nearbyLandmarks?.some(landmark => 
                                    landmark.toLowerCase().includes(selectedSchool.toLowerCase())
                                  );
      
      return meetsPriceRange && meetsSearchCriteria && meetsSchoolCriteria;
    });
  };

  const isFilterActive = () => {
    return searchText !== '' || priceRange.min !== 0 || priceRange.max !== 10000 || selectedSchool !== '';
  };

  const clearAllFilters = () => {
    setSearchText('');
    setPriceRange({ min: 0, max: 10000 });
    setSelectedSchool('');
  };

  const renderPropertiesSection = () => {
    // Apply filters to all properties first
    const allFilteredProperties = filterProperties(sampleBoardingHouses);
    
    // Limit properties for guest users - show first 7 properties only (disabled during beta testing)
    const displayedProperties = isAuthenticated || hasReachedViewLimit || BETA_TESTING_MODE
      ? allFilteredProperties 
      : allFilteredProperties.slice(0, 7);
    
    return (
      <View>
        <View style={styles.sectionHeaderWithFilter}>
          <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
            {isFilterActive() ? `Results (${allFilteredProperties.length})` : 'Recommended Properties'}
          </Text>
          {isFilterActive() && (
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Guest View Progress Banner */}
        <GuestViewProgressBanner />
        
        {allFilteredProperties.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsTitle}>No Properties Found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your search terms or price range to see more results.
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayedProperties}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.horizontalCardWrapper}>
                <BoardingHouseCard
                  boardingHouse={item}
                  onPress={() => handlePropertyPress(item)}
                />
              </View>
            )}
            horizontal
            pagingEnabled
            snapToInterval={310} // Card width (280) + margins (30)
            decelerationRate="fast"
            snapToAlignment="center"
            contentContainerStyle={styles.horizontalListContainer}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    );
  };

  const renderBlogSection = () => (
    <View style={styles.blogSection}>
      <View style={styles.sectionHeaderWithFilter}>
        <Text style={[typography.textStyles.h3, styles.sectionTitle]}>
          Beehauz Blog
        </Text>
      </View>
      <FlatList
        data={sampleBlogPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.blogCard} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BlogDetail', { blog: item })}
          >
            <Image source={{ uri: item.image }} style={styles.blogImage} />
            <View style={styles.blogContent}>
              <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.blogExcerpt} numberOfLines={3}>{item.excerpt}</Text>
              <View style={styles.blogMeta}>
                <View style={styles.blogMetaItem}>
                  <BookOpen size={14} color={colors.gray[500]} />
                  <Text style={styles.blogMetaText}>{item.readTime}</Text>
                </View>
                <Text style={styles.blogDate}>{item.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.blogListContainer}
      />
    </View>
  );

  const renderProperties = () => (
    <View>
      {renderPropertiesSection()}
      {renderBlogSection()}
    </View>
  );

  const renderLaundry = () => (
    <View style={styles.comingSoonContainer}>
      <Shirt size={64} color={colors.gray[400]} />
      <Text style={styles.comingSoonTitle}>Palaba Services</Text>
      <Text style={styles.comingSoonText}>
        Laundry and dry cleaning services coming soon! 
        We're partnering with local laundry shops to bring you convenient pickup and delivery.
      </Text>
      <TouchableOpacity 
        style={styles.surveyButton}
        onPress={() => openSurvey('laundry')}
      >
        <Text style={styles.surveyButtonText}>I'm Interested - Take Survey</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDelivery = () => (
    <View style={styles.comingSoonContainer}>
      <ShoppingBag size={64} color={colors.gray[400]} />
      <Text style={styles.comingSoonTitle}>Pabakal Services</Text>
      <Text style={styles.comingSoonText}>
        Food and grocery delivery services coming soon! 
        Order from local restaurants and stores with convenient delivery to your boarding house.
      </Text>
      <TouchableOpacity 
        style={styles.surveyButton}
        onPress={() => openSurvey('delivery')}
      >
        <Text style={styles.surveyButtonText}>I'm Interested - Take Survey</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'properties':
        return renderProperties();
      case 'laundry':
        return renderLaundry();
      case 'delivery':
        return renderDelivery();
      default:
        return renderProperties();
    }
  };

  const priceRanges = [
    { label: 'Under ₱2,000', min: 0, max: 2000 },
    { label: '₱2,000 - ₱3,000', min: 2000, max: 3000 },
    { label: '₱3,000 - ₱4,000', min: 3000, max: 4000 },
    { label: '₱4,000 - ₱5,000', min: 4000, max: 5000 },
    { label: 'Above ₱5,000', min: 5000, max: 10000 },
  ];

  const handleSurveyResponse = async (response: 'not-interested' | 'maybe' | 'very-interested') => {
    // For anonymous users, validate email before submitting
    if (!isAuthenticated && !anonymousEmail.trim()) {
      Alert.alert(
        'Email Required',
        'Please provide your email address to submit the survey.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Store email before clearing it
    const emailForSubmission = !isAuthenticated ? anonymousEmail.trim() : undefined;
    
    setShowSurveyModal(false);
    setAnonymousEmail(''); // Clear email after storing it
    
    const serviceType = surveyType === 'laundry' ? 'laundry services' : 'food and grocery delivery services';
    
    // For anonymous users, check for duplicates before submitting
    if (!isAuthenticated && emailForSubmission) {
      try {
        const duplicateCheck = await surveyService.hasUserRespondedToService(surveyType, emailForSubmission);
        if (duplicateCheck.success && duplicateCheck.hasResponded) {
          const serviceTypeDisplay = surveyType === 'laundry' ? 'laundry services' : 'delivery services';
          Alert.alert(
            'Already Submitted',
            `Thank you! We've already received your feedback about ${serviceTypeDisplay} from this email address.`,
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }
      } catch (error) {
        if (__DEV__) console.warn('Error checking duplicate survey:', error);
        // Continue with submission even if duplicate check fails
      }
    }

    // Save survey response to database
    try {
      const surveyData: SurveySubmissionData = {
        service_type: surveyType,
        response_level: response,
        user_email: emailForSubmission, // Use stored email
      };
      
      const result = await surveyService.submitSurveyResponse(surveyData);
      
      if (result.success) {
        // Survey response saved successfully
      } else {
        if (__DEV__) console.warn('Failed to save survey response:', result.error);
        // Still show user feedback even if save fails
      }
    } catch (error) {
      if (__DEV__) console.error('Error saving survey response:', error);
      // Continue with user feedback even if save fails
    }
    
    setTimeout(() => {
      if (response === 'not-interested') {
        Alert.alert(
          'Thanks for your feedback!',
          'We appreciate your honesty. We\'ll focus on other features that better serve your needs.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (response === 'maybe') {
        Alert.alert(
          'Thanks!',
          `We'll consider your feedback as we develop ${serviceType}. We'll make sure to create something that truly adds value.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Fantastic!',
          `We'll prioritize ${serviceType} and notify you when it's available. Your enthusiasm helps us build better features!`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    }, 300);
  };

  const openSurvey = async (type: 'laundry' | 'delivery') => {
    // Check if user has already responded to this service survey
    try {
      const checkResult = await surveyService.hasUserRespondedToService(type);
      
      if (checkResult.success && checkResult.hasResponded) {
        const serviceTypeDisplay = type === 'laundry' ? 'laundry services' : 'delivery services';
        Alert.alert(
          'Already Submitted',
          `Thank you! We've already received your feedback about ${serviceTypeDisplay}. We appreciate your interest!`,
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
    } catch (error) {
      if (__DEV__) console.warn('Error checking previous survey response:', error);
      // Continue with survey even if check fails
    }
    
    setSurveyType(type);
    setShowSurveyModal(true);
  };

  const renderFilters = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.filterModal} showsVerticalScrollIndicator={false}>
          <View style={styles.filterHeader}>
            <Text style={[typography.textStyles.h3, styles.filterTitle]}>Filters</Text>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          {/* School/Location Filter */}
          <View style={styles.filterSection}>
            <Text style={[typography.textStyles.h4, styles.filterSectionTitle]}>Near School/University</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.schoolOptionsContainer}
            >
              <TouchableOpacity
                style={[
                  styles.schoolOptionChip,
                  styles.allLocationsChip,
                  selectedSchool === '' && styles.selectedSchoolOptionChip
                ]}
                onPress={() => setSelectedSchool('')}
              >
                <Text style={[
                  styles.schoolOptionChipText,
                  selectedSchool === '' && styles.selectedSchoolOptionChipText
                ]}>
                  All Locations
                </Text>
              </TouchableOpacity>
              {POPULAR_SCHOOLS.map((school) => (
                <TouchableOpacity
                  key={school.id}
                  style={[
                    styles.schoolOptionChip,
                    selectedSchool === school.shortName && styles.selectedSchoolOptionChip
                  ]}
                  onPress={() => setSelectedSchool(school.shortName)}
                >
                  <Text style={[
                    styles.schoolOptionChipText,
                    selectedSchool === school.shortName && styles.selectedSchoolOptionChipText
                  ]}>
                    {school.shortName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {selectedSchool !== '' && (
              <Text style={styles.selectedSchoolInfo}>
                {POPULAR_SCHOOLS.find(s => s.shortName === selectedSchool)?.name} - {POPULAR_SCHOOLS.find(s => s.shortName === selectedSchool)?.location}
              </Text>
            )}
          </View>

          {/* Price Range Filter */}
          <View style={styles.filterSection}>
            <Text style={[typography.textStyles.h4, styles.filterSectionTitle]}>Price Range</Text>
            <View style={styles.priceOptions}>
              {priceRanges.map((range, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.priceOption,
                    priceRange.min === range.min && priceRange.max === range.max && styles.selectedPriceOption
                  ]}
                  onPress={() => setPriceRange({ min: range.min, max: range.max })}
                >
                  <Text style={[
                    styles.priceOptionText,
                    priceRange.min === range.min && priceRange.max === range.max && styles.selectedPriceOptionText
                  ]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setPriceRange({ min: 0, max: 10000 });
                setSelectedSchool('');
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderSurveyModal = () => {
    const serviceTitle = surveyType === 'laundry' ? 'Palaba Services' : 'Pabakal Services';
    const serviceDescription = surveyType === 'laundry' 
      ? 'laundry and dry cleaning services' 
      : 'food and grocery delivery services';

    return (
      <Modal
        visible={showSurveyModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSurveyModal(false)}
      >
        <View style={styles.surveyModalOverlay}>
          <View style={styles.surveyModalContainer}>
            <View style={styles.surveyModalHeader}>
              <Text style={styles.surveyModalTitle}>Interest Survey</Text>
              <TouchableOpacity
                onPress={() => setShowSurveyModal(false)}
                style={styles.surveyCloseButton}
              >
                <X size={24} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.surveyModalContent}>
              <Text style={styles.surveyQuestion}>
                Would you be interested in using {serviceDescription} through Beehauz?
              </Text>
              
              {/* Email input for anonymous users */}
              {!isAuthenticated && (
                <View style={styles.emailInputContainer}>
                  <Text style={styles.emailInputLabel}>Email (required for anonymous feedback)</Text>
                  <TextInput
                    style={styles.emailInput}
                    placeholder="Enter your email address"
                    placeholderTextColor={colors.text.tertiary}
                    value={anonymousEmail}
                    onChangeText={setAnonymousEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}
              
              <View style={styles.surveyOptions}>
                <TouchableOpacity
                  style={[styles.surveyOption, styles.surveyOptionNotInterested]}
                  onPress={() => handleSurveyResponse('not-interested')}
                >
                  <Text style={styles.surveyOptionTextNotInterested}>Not Really</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.surveyOption, styles.surveyOptionMaybe]}
                  onPress={() => handleSurveyResponse('maybe')}
                >
                  <Text style={styles.surveyOptionTextMaybe}>Maybe</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.surveyOption, styles.surveyOptionInterested]}
                  onPress={() => handleSurveyResponse('very-interested')}
                >
                  <Text style={styles.surveyOptionTextInterested}>Yes, Definitely!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {renderFilters()}
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={[typography.textStyles.h2, styles.title]}>
                Beehauz
              </Text>
              <Text style={[typography.textStyles.body, styles.subtitle]}>
                Your one-stop student services app
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.likeHeaderButton}
                onPress={() => {
                  if (isAuthenticated) {
                    // Navigate to FavoritesList screen for authenticated users
                    navigation.navigate('FavoritesList');
                  } else {
                    // Show auth modal for guest users
                    setCurrentFeature('save_favorites');
                    setAuthPromptVisible(true);
                  }
                }}
              >
                <Heart size={24} color={colors.primary} fill={colors.primary} />
                {hasUnviewedFavorites && (
                  <View style={styles.likeBadge}>
                    <Text style={styles.likeBadgeText}>!</Text>
                  </View>
                )}
              </TouchableOpacity>
               {/* <TouchableOpacity 
                style={styles.filterHeaderButton}
                onPress={() => {
                  setShowFilters(!showFilters);
                  // TODO: Implement filter modal/screen
                  Alert.alert('Filters', 'Filter functionality coming soon!');
                }}
              >
                <Filter size={24} color={colors.primary} />
              </TouchableOpacity> */}
            </View>
          </View>
        </View>

        {renderTabBar()}
        
        {/* Search Bar with Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.gray[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab === 'properties' ? 'boarding houses' : activeTab === 'laundry' ? 'laundry services' : 'food delivery'}...`}
              value={searchText}
              onChangeText={handleSearch}
              placeholderTextColor={colors.gray[500]}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </ScrollView>
      {renderSurveyModal()}
      
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
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingTop: 30,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  title: {
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    color: '#666',
    textAlign: 'left',
  },
  filterHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  likeHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  likeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  likeBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'Figtree_700Bold',
  },

  // New tab styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
  },
  activeTabText: {
    color: colors.white,
  },
  inactiveTabText: {
    color: colors.gray[500],
  },


  horizontalListContainer: {
    paddingBottom: 20,
    paddingRight: 20,
  },
  horizontalCardWrapper: {
    width: 280,
    marginHorizontal: 5,
  },

  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    height: 400,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontFamily: 'Figtree_700Bold',
    color: colors.gray[700],
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  surveyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  surveyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
    textAlign: 'center',
  },
  // Survey Modal Styles
  surveyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  surveyModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: 350,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  surveyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  surveyModalTitle: {
    fontSize: 18,
    fontFamily: 'Figtree_700Bold',
    color: colors.primary,
  },
  surveyCloseButton: {
    padding: 4,
  },
  surveyModalContent: {
    paddingBottom: 8,
  },
  surveyQuestion: {
    fontSize: 16,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: 20,
  },
  emailInputContainer: {
    marginBottom: 20,
  },
  emailInputLabel: {
    fontSize: 14,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[600],
    marginBottom: 8,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Figtree_400Regular',
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
  },
  surveyOptions: {
    gap: 12,
  },
  surveyOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  surveyOptionNotInterested: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  surveyOptionMaybe: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  surveyOptionInterested: {
    backgroundColor: colors.primary,
  },
  surveyOptionTextNotInterested: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: '#6c757d',
  },
  surveyOptionTextMaybe: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: '#856404',
  },
  surveyOptionTextInterested: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.white,
  },
  
  // Search bar styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Figtree_400Regular',
    color: colors.text.primary,
    paddingVertical: 0, // Remove default padding for better alignment
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    color: colors.gray[800],
    fontFamily: 'Figtree_600SemiBold',
  },
  
  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
    maxHeight: '70%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterTitle: {
    color: colors.gray[900],
    fontFamily: 'Figtree_600SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  filterSection: {
    marginBottom: 20
  },
  filterSectionTitle: {
    color: colors.gray[800],
    fontFamily: 'Figtree_600SemiBold',
    marginBottom: 16,
  },
  schoolOptionsContainer: {
    paddingRight: 20,
    gap: 8,
  },
  schoolOptionChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    minWidth: 80,
    alignItems: 'center',
  },
  allLocationsChip: {
    minWidth: 100,
    borderColor: colors.gray[400],
  },
  selectedSchoolOptionChip: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  schoolOptionChipText: {
    fontSize: 13,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[700],
  },
  selectedSchoolOptionChipText: {
    color: colors.white,
    fontFamily: 'Figtree_600SemiBold',
  },
  selectedSchoolInfo: {
    fontSize: 12,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[600],
    marginTop: 8,
    paddingLeft: 4,
  },
  priceOptions: {
    gap: 12,
  },
  priceOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  selectedPriceOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  priceOptionText: {
    fontSize: 16,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[700],
    textAlign: 'center',
  },
  selectedPriceOptionText: {
    color: colors.primary,
    fontFamily: 'Figtree_600SemiBold',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    gap: 12,
    marginBottom: 80,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  clearButtonText: {
    color: colors.gray[600],
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    textAlign: 'center',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    textAlign: 'center',
  },
  
  // No Results Styles
  noResultsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
    marginBottom: 20,
  },
  noResultsTitle: {
    fontSize: 20,
    fontFamily: 'Figtree_700Bold',
    color: colors.gray[700],
    marginBottom: 12,
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Clear Filter Styles
  sectionHeaderWithFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  clearFilterText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: 'Figtree_600SemiBold',
    textDecorationLine: 'underline',
  },
  
  // Blog Section Styles
  blogSection: {
    marginTop: 10,
  },
  blogListContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingRight: 20,
  },
  blogCard: {
    width: 280,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 5,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  blogImage: {
    width: '100%',
    height: 140,
    backgroundColor: colors.gray[200],
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 16,
    fontFamily: 'Figtree_700Bold',
    color: colors.gray[900],
    lineHeight: 22,
    marginBottom: 8,
  },
  blogExcerpt: {
    fontSize: 14,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: 12,
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blogMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  blogMetaText: {
    fontSize: 12,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[500],
  },
  blogDate: {
    fontSize: 12,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[500],
  },
});