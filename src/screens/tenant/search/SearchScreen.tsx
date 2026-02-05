import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, Modal, Image, Platform, ImageStyle, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { Heart, Filter, Search, X, BookOpen, MapPin } from 'lucide-react-native';
import { TenantStackParamList, TenantTabParamList } from '../../../navigation/types';
import { BoardingHouseCard, ServiceSurveyModal, SearchFilterChips } from '../../../components/tenant';
import { DEFAULT_PRICE_RANGES } from '../../../components/tenant/SearchFilterChips';
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
import { useServiceSurvey } from '../../../hooks/tenant/useServiceSurvey';
import { useAppRating } from '../../../context/AppRatingContext';

type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TenantTabParamList, 'Search'>,
  StackNavigationProp<TenantStackParamList>
>;

export const SearchScreen: React.FC = () => {
  const isWeb = Platform.OS === 'web';
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 768;
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { hasUnviewedFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { hasReachedViewLimit } = useGuestTracking();
  const { clearUserType } = useUserType();
  const { incrementTrigger } = useAppRating();
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 0, max: 10000});
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [authPromptVisible, setAuthPromptVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<FeatureType>('view_all_properties');
  const {
    showSurveyModal,
    surveyType,
    anonymousEmail,
    setAnonymousEmail,
    closeSurvey,
    submitSurveyResponse,
  } = useServiceSurvey(isAuthenticated);


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
    const allFilteredProperties = filterProperties(sampleBoardingHouses);

    const displayedProperties = isAuthenticated || hasReachedViewLimit || BETA_TESTING_MODE
      ? allFilteredProperties 
      : allFilteredProperties.slice(0, 7);
    
    return (
      <View>
        {/* Guest View Progress Banner */}
        <GuestViewProgressBanner />
        
        {allFilteredProperties.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsTitle}>No Properties Found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your search terms or price range to see more results.
            </Text>
          </View>
        ) : isWeb ? (
          <View style={styles.webGrid}>
            {displayedProperties.map((item) => (
              <View key={item.id} style={[styles.webCardWrapper,
                { minWidth: isSmallScreen ? '50%' : '25%'}
              ]}>
                <BoardingHouseCard
                  boardingHouse={item}
                  onPress={() => handlePropertyPress(item)}
                />
              </View>
            ))}
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
            snapToInterval={310}
            decelerationRate="fast"
            snapToAlignment="center"
            contentContainerStyle={styles.horizontalListContainer}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={styles.horizontalList}
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
            <Image source={{ uri: item.image }} style={styles.blogImage as ImageStyle} />
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
    </View>
  );


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
              {DEFAULT_PRICE_RANGES.map((range, index) => (
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


  return (
    <View style={styles.container}>
      {renderFilters()}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        nestedScrollEnabled
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={[typography.textStyles.h2, styles.title]}>
                Find suitable boarding houses with Beehauz
              </Text>
              <Text style={[typography.textStyles.body, styles.subtitle]}>
                Search by location, price, or school. Explore verified listings near your campus.
              </Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={colors.gray[500]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search boarding houses..."
                value={searchText}
                onChangeText={handleSearch}
                placeholderTextColor={colors.gray[500]}
              />
            </View>

            <View style={styles.mapButton}>
              <MapPin size={32} color={colors.white} />
            </View>
          </View>

          <SearchFilterChips
            initialSelectedSchool={selectedSchool}
            initialPriceRange={priceRange}
            schools={POPULAR_SCHOOLS}
            onChange={({ selectedSchool: nextSchool, priceRange: nextRange }) => {
              setSelectedSchool(nextSchool);
              setPriceRange(nextRange);
            }}
            onMoreFilters={() => setShowFilters(true)}
          />
        </View>

        
        <View style={styles.contentContainer}>
          {renderProperties()}
        </View>
      </ScrollView>

      <ServiceSurveyModal
        visible={showSurveyModal}
        surveyType={surveyType}
        isAuthenticated={isAuthenticated}
        anonymousEmail={anonymousEmail}
        onChangeEmail={setAnonymousEmail}
        onClose={closeSurvey}
        onSubmit={submitSurveyResponse}
      />
      
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
    width: '95%',
    margin: 'auto',
    paddingTop: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 720,
    alignSelf: 'center',
  },
  title: {
    color: colors.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
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
  horizontalListContainer: {
    paddingBottom: 20,
    paddingRight: 20,
  },
  horizontalList: {
    flexGrow: 0,
  },
  webGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  webCardWrapper: {
    width: '25%',
    paddingBottom: 16
  },
  horizontalCardWrapper: {
    width: 280,
    marginHorizontal: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: "100%",
    gap: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.primary,
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
  mapButton: {
    flex: 1,
    maxWidth: 50,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 100,
    height: 48,
    padding: 12,
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
    color: colors.primary,
    fontFamily: 'Figtree_600SemiBold',
  },
  sectionTitleDivider: {
    flex: 1,
    height: 2,
    marginLeft: 12,
    backgroundColor: colors.primary,
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