import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, Modal, Image, Platform, ImageStyle, useWindowDimensions, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { Heart, Filter, Search, X, BookOpen, MapPin, ArrowLeftRight, GraduationCap } from 'lucide-react-native';
import { Marquee } from '@animatereactnative/marquee';
import { TenantStackParamList, TenantTabParamList } from '../../../navigation/types';
import { BoardingHouseCard, ServiceSurveyModal, SearchFilterChips, CompareModal } from '../../../components/tenant';
import { DEFAULT_PRICE_RANGES } from '../../../components/tenant/SearchFilterChips';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';
import { supabase } from '../../../services/supabase';
import { sampleBlogPosts } from '../../../data/sampleBlogPosts';
import { BoardingHouse } from '../../../types/tenant';
import { useFavorites } from '../../../context/FavoritesContext';
import { useAuthContext } from '../../../context/AuthContext';
import { useGuestTracking } from '../../../context/GuestTrackingContext';
import { useUserType } from '../../../context/UserTypeContext';
import { GuestViewProgressBanner, AuthPromptModal } from '../../../components/common';
import { FeatureType, BETA_TESTING_MODE } from '../../../utils/guestAccess';
import { POPULAR_SCHOOLS } from '../../../utils/constants';
import { calculateDistance } from '../../../data/universities';
import { useServiceSurvey } from '../../../hooks/tenant/useServiceSurvey';
import { useAppRating } from '../../../context/AppRatingContext';

type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TenantTabParamList, 'Search'>,
  StackNavigationProp<TenantStackParamList>
>;

export const SearchScreen: React.FC = () => {
  const isWeb = Platform.OS === 'web';
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { hasUnviewedFavorites } = useFavorites();
  const { isAuthenticated } = useAuthContext();
  const { hasReachedViewLimit } = useGuestTracking();
  const { clearUserType } = useUserType();
  const { incrementTrigger } = useAppRating();
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 0, max: 10000});
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [authPromptVisible, setAuthPromptVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<FeatureType>('view_all_properties');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<BoardingHouse[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [properties, setProperties] = useState<BoardingHouse[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const disclaimerText =
    'All information displayed is based on publicly available sources. Details may not reflect current availability, pricing, or conditions. Property owners may request updates or removal at any time.';
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

  const handleToggleCompare = (boardingHouse: BoardingHouse) => {
    setSelectedForCompare(prev => {
      const isAlreadySelected = prev.some(p => p.id === boardingHouse.id);
      if (isAlreadySelected) {
        return prev.filter(p => p.id !== boardingHouse.id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, boardingHouse];
    });
  };

  const handleExitCompareMode = () => {
    setCompareMode(false);
    setSelectedForCompare([]);
  };

  React.useEffect(() => {
    let isMounted = true;
    const loadProperties = async () => {
      setIsLoadingProperties(true);
      setPropertiesError(null);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, owner_id, name, address, description, latitude, longitude, is_accredited, created_at, owner:profiles(full_name, email)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!isMounted) return;

        const mapped = (data ?? []).map((row: any) => {
          const ownerName = row.owner?.full_name || row.owner?.email || 'Property Owner';
          return {
            id: row.id,
            name: row.name,
            location: row.address || 'Address not provided',
            availableBeds: 0,
            rating: 0,
            ratePerMonth: 0,
            description: row.description,
            paymentTerms: {
              advancePayment: 1,
              deposit: 0,
              electricityIncluded: false,
              waterIncluded: false,
            },
            amenities: [],
            images: [],
            ownerId: row.owner_id,
            owner: {
              id: row.owner_id,
              name: ownerName,
            },
            reviewCount: 0,
            isAvailable: true,
            createdAt: row.created_at,
            updatedAt: row.created_at,
            latitude: row.latitude ? Number(row.latitude) : null,
            longitude: row.longitude ? Number(row.longitude) : null,
            isAccredited: row.is_accredited === true,
          } as BoardingHouse;
        });

        setProperties(mapped);
      } catch (err) {
        if (!isMounted) return;
        setPropertiesError(err instanceof Error ? err.message : 'Failed to load properties.');
      } finally {
        if (isMounted) setIsLoadingProperties(false);
      }
    };

    loadProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  const filterProperties = (properties: BoardingHouse[]) => {
    return properties.filter(property => {
      // Price filter
      const meetsPriceRange = property.ratePerMonth >= priceRange.min && 
                              property.ratePerMonth <= priceRange.max;
      
      // Search text filter
      const meetsSearchCriteria = searchText === '' || 
                                  property.name.toLowerCase().includes(searchText.toLowerCase()) ||
                                  property.location.toLowerCase().includes(searchText.toLowerCase()) ||
                                  property.description.toLowerCase().includes(searchText.toLowerCase());
      
      // School/Location filter — 10km radius from selected school
      let meetsSchoolCriteria = true;
      if (selectedSchool !== '') {
        const school = POPULAR_SCHOOLS.find(s => s.shortName === selectedSchool);
        const propLat = (property as any).latitude;
        const propLng = (property as any).longitude;
        if (school && propLat != null && propLng != null) {
          const distance = calculateDistance(
            [school.coordinates.latitude, school.coordinates.longitude],
            [propLat, propLng]
          );
          meetsSchoolCriteria = distance <= 10;
        } else {
          meetsSchoolCriteria = false;
        }
      }
      
      return meetsPriceRange && meetsSearchCriteria && meetsSchoolCriteria;
    });
  };

  const isFilterActive = () => {
    return searchText !== '' || priceRange.min !== 0 || priceRange.max !== 10000 || selectedSchool !== '';
  };

  const activeFilterCount = () => {
    let count = 0;
    if (selectedSchool !== '') count += 1;
    if (priceRange.min !== 0 || priceRange.max !== 10000) count += 1;
    return count;
  };

  const clearAllFilters = () => {
    setSearchText('');
    setPriceRange({ min: 0, max: 10000 });
    setSelectedSchool('');
  };

  const handleSelectSchool = (value: string) => {
    const nextValue = value === selectedSchool ? '' : value;
    setSelectedSchool(nextValue);
  };

  const handleSelectPriceRange = (range: { min: number; max: number }) => {
    const isSameRange = priceRange.min === range.min && priceRange.max === range.max;
    setPriceRange(isSameRange ? { min: 0, max: 10000 } : range);
  };

  const filteredProperties = filterProperties(properties);
  const shouldShowResultsCount =
    (searchText.trim() !== '' || activeFilterCount() > 0) && filteredProperties.length > 0;

  const renderHorizontalList = (items: BoardingHouse[]) => {
    if (isWeb) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContainer}
          nestedScrollEnabled
        >
          {items.map((item) => (
            <View key={item.id} style={styles.horizontalCardWrapper}>
              <BoardingHouseCard
                boardingHouse={item}
                onPress={() => handlePropertyPress(item)}
                compareMode={compareMode}
                isSelectedForCompare={selectedForCompare.some(p => p.id === item.id)}
                onCompareToggle={handleToggleCompare}
              />
            </View>
          ))}
        </ScrollView>
      );
    }
    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.horizontalCardWrapper}>
            <BoardingHouseCard
              boardingHouse={item}
              onPress={() => handlePropertyPress(item)}
              compareMode={compareMode}
              isSelectedForCompare={selectedForCompare.some(p => p.id === item.id)}
              onCompareToggle={handleToggleCompare}
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
    );
  };

  const renderPropertiesSection = () => {
    const allFilteredProperties = filteredProperties;

    const displayedProperties = isAuthenticated || hasReachedViewLimit || BETA_TESTING_MODE
      ? allFilteredProperties
      : allFilteredProperties.slice(0, 7);

    const accreditedProperties = displayedProperties.filter(p => p.isAccredited);
    const otherProperties = displayedProperties.filter(p => !p.isAccredited);

    return (
      <View>
        {/* Guest View Progress Banner */}
        <GuestViewProgressBanner />

        {isLoadingProperties ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsTitle}>Loading properties...</Text>
          </View>
        ) : propertiesError ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsTitle}>Unable to load properties</Text>
            <Text style={styles.noResultsText}>{propertiesError}</Text>
          </View>
        ) : allFilteredProperties.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsTitle}>No Properties Found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your search terms or price range to see more results.
            </Text>
          </View>
        ) : isMobile ? (
          <View>
            {accreditedProperties.length > 0 && (
              <View style={styles.propertySectionGroup}>
                <View style={styles.propertySectionHeader}>
                  <GraduationCap size={18} color={colors.success} />
                  <Text style={styles.propertySectionTitle}>Accredited</Text>
                  <View style={styles.propertySectionDivider} />
                </View>
                {renderHorizontalList(accreditedProperties)}
              </View>
            )}
            {otherProperties.length > 0 && (
              <View style={styles.propertySectionGroup}>
                <View style={styles.propertySectionHeader}>
                  <Text style={styles.propertySectionTitle}>Other Properties</Text>
                  <View style={styles.propertySectionDivider} />
                </View>
                {renderHorizontalList(otherProperties)}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.webGrid}>
            {displayedProperties.map((item) => (
              <View key={item.id} style={[styles.webCardWrapper,
                { minWidth: isTablet ? '50%' : '25%'}
              ]}>
                <BoardingHouseCard
                  boardingHouse={item}
                  onPress={() => handlePropertyPress(item)}
                  compareMode={compareMode}
                  isSelectedForCompare={selectedForCompare.some(p => p.id === item.id)}
                  onCompareToggle={handleToggleCompare}
                />
              </View>
            ))}
          </View>
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



  return (
    <View style={styles.container}>
      <View style={styles.marqueeContainer}>
        <Marquee speed={.5} spacing={50} direction="horizontal" withGesture={false} style={styles.marquee}>
          <Text style={styles.marqueeText} numberOfLines={1}>
            {disclaimerText}
          </Text>
        </Marquee>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={isMobile}
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
              <Text style={[typography.textStyles.bodySmall, styles.subtitle]}>
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

            {isMobile ? (
              <View style={styles.mapButton}>
                <TouchableOpacity
                  onPress={() => setShowFilters(true)}
                  activeOpacity={0.7}
                  style={styles.mobileFilterButton}
                >
                  <Filter size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => navigation.navigate('MapView')}
                activeOpacity={0.7}
              >
                <MapPin size={32} color={colors.primary} />
              </TouchableOpacity>
            )}

          </View>

          <View style={styles.filterChipsRow}>
            {!isMobile ? (
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
            ) : (
              <View style={styles.mobileFilterSpacer} />
            )}

            <View style={styles.clearFilterContainer}>
              {searchText.trim() !== '' || activeFilterCount() > 0 ? (
                filteredProperties.length > 0 ? (
                  <Text style={styles.resultsCountText}>
                    ({filteredProperties.length}) results found
                  </Text>
                ) : (
                  <Text style={styles.resultsCountText}>No Results Found</Text>
                )
              ) : null}

              {activeFilterCount() > 0 && (
                <TouchableOpacity
                  onPress={clearAllFilters}
                  activeOpacity={0.7}
                  style={styles.activeFiltersBadge}
                >
                  <Text style={styles.activeFiltersText}>
                    {activeFilterCount()} filter{activeFilterCount() > 1 ? 's' : ''} active ×
                  </Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
        </View>

        
        <View style={styles.contentContainer}>
          {renderProperties()}
        </View>

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            All listed properties are sourced from the official directory of accredited boarding houses for University of Antique students in Sibalom.
          </Text>
          <Text
            style={styles.disclaimerLink}
            onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=61580989200280')}
          >
            Visit the official page
          </Text>
        </View>
      </ScrollView>

      {/* Floating compare button / bar */}
      {!compareMode ? (
        <TouchableOpacity
          onPress={() => setCompareMode(true)}
          activeOpacity={0.7}
          style={styles.compareFloatingButton}
        >
          <ArrowLeftRight size={18} color={colors.white} />
          <Text style={styles.compareFloatingButtonText}>Compare</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.compareFloatingBar}>
          <TouchableOpacity onPress={handleExitCompareMode} activeOpacity={0.7}>
            <Text style={styles.compareCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.compareFloatingText}>
            {selectedForCompare.length} of 3 selected
          </Text>
          <TouchableOpacity
            onPress={() => setShowCompareModal(true)}
            disabled={selectedForCompare.length < 2}
            activeOpacity={0.7}
            style={[
              styles.compareButton,
              selectedForCompare.length < 2 && styles.compareButtonDisabled,
            ]}
          >
            <Text style={styles.compareButtonText}>Compare</Text>
          </TouchableOpacity>
        </View>
      )}

      <CompareModal
        visible={showCompareModal}
        properties={selectedForCompare}
        onClose={() => setShowCompareModal(false)}
      />

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowFilters(false)}
          />
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={[typography.textStyles.h3, styles.filterTitle]}>Filters</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFilters(false)}
              >
                <X size={20} color={colors.gray[700]} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Location</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.schoolOptionsContainer}
              >
                <TouchableOpacity
                  style={[
                    styles.schoolOptionChip,
                    styles.allLocationsChip,
                    selectedSchool === '' && styles.selectedSchoolOptionChip,
                  ]}
                  onPress={() => handleSelectSchool('')}
                >
                  <Text
                    style={[
                      styles.schoolOptionChipText,
                      selectedSchool === '' && styles.selectedSchoolOptionChipText,
                    ]}
                  >
                    All Locations
                  </Text>
                </TouchableOpacity>
                {POPULAR_SCHOOLS.map((school) => (
                  <TouchableOpacity
                    key={school.id}
                    style={[
                      styles.schoolOptionChip,
                      selectedSchool === school.shortName && styles.selectedSchoolOptionChip,
                    ]}
                    onPress={() => handleSelectSchool(school.shortName)}
                  >
                    <Text
                      style={[
                        styles.schoolOptionChipText,
                        selectedSchool === school.shortName &&
                          styles.selectedSchoolOptionChipText,
                      ]}
                    >
                      {school.shortName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {selectedSchool !== '' && (
                <Text style={styles.selectedSchoolInfo}>
                  Showing near {selectedSchool}
                </Text>
              )}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceOptions}>
                {DEFAULT_PRICE_RANGES.map((range, index) => {
                  const isSelected =
                    priceRange.min === range.min && priceRange.max === range.max;
                  return (
                    <TouchableOpacity
                      key={`${range.label}-${index}`}
                      style={[styles.priceOption, isSelected && styles.selectedPriceOption]}
                      onPress={() =>
                        handleSelectPriceRange({ min: range.min, max: range.max })
                      }
                    >
                      <Text
                        style={[
                          styles.priceOptionText,
                          isSelected && styles.selectedPriceOptionText,
                        ]}
                      >
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </Modal>

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
    width: '100%',
    margin: 'auto',
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
    marginBottom: 10,
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
  propertySectionGroup: {
    marginBottom: 8,
  },
  propertySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  propertySectionTitle: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[800],
  },
  propertySectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
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
    paddingBottom: 10
  },
  horizontalCardWrapper: {
    width: 280,
    marginHorizontal: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    gap: 12,
    marginTop: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
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
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    color: colors.white,
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
  contentContainer: {
    paddingHorizontal: 5,
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  mobileFilterSpacer: {
    flexGrow: 1,
  },
  clearFilterContainer: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  mobileFilterButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFiltersBadge: {
    width: 'auto',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  activeFiltersText: {
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.primary,
  },
  resultsCountText: {
    fontSize: 12,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[600],
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
  modalBackdrop: {
    flex: 1,
  },
  filterModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
    maxHeight: '85%',
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
  disclaimerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 6,
  },
  disclaimerLink: {
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  compareFloatingButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  compareFloatingButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
  },
  compareFloatingBar: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#160909',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  compareCancelText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: 'Figtree_500Medium',
    textDecorationLine: 'underline',
  },
  compareFloatingText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
  },
  compareButton: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  compareButtonDisabled: {
    opacity: 0.5,
  },
  compareButtonText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
  },
});