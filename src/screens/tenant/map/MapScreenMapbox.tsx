import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { MapPin, Navigation, Star } from 'lucide-react-native';
import { colors } from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';
import { BoardingHouse } from '../../../types/tenant';
import { sampleBoardingHouses } from '../../../data/sampleBoardingHouses';
import { POPULAR_SCHOOLS } from '../../../utils/constants';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TenantStackParamList } from '../../../navigation/types';
import { PropertyModal, PropertyMarker } from '../../../components/map';
import { 
  getCachedRoute, 
  cacheRoute, 
  getMockRoute, 
  formatRouteInfo, 
  USE_MOCK_ROUTES 
} from '../../../utils/routeCache';

import { MapScreenFallback } from './MapScreenFallback';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<TenantStackParamList>;

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle: string;
  boardingHouse: BoardingHouse;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Note: universityCoords is now computed from selectedSchool inside the component

// Initialize Mapbox
const MAPBOX_ACCESS_TOKEN = Constants.expoConfig?.extra?.mapboxAccessToken;

if (MAPBOX_ACCESS_TOKEN && MAPBOX_ACCESS_TOKEN !== 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
}

export const MapScreenMapbox: React.FC = () => {
  // Check if Mapbox is properly configured
  if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
    console.log('Mapbox access token not configured, using fallback');
    return <MapScreenFallback />;
  }

  const navigation = useNavigation<NavigationProp>();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<BoardingHouse | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'property' | 'university'>('property');
  const [walkingDistance, setWalkingDistance] = useState<string>('');
  const [walkingDuration, setWalkingDuration] = useState<string>('');
  const [routeCoordinates, setRouteCoordinates] = useState<number[][]>([]);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(POPULAR_SCHOOLS[0]); // Default to UA Main Campus

  // Compute university coordinates from selected school
  const universityCoords = useMemo(() => ({
    latitude: selectedSchool.coordinates.latitude,
    longitude: selectedSchool.coordinates.longitude
  }), [selectedSchool]);

  // Realistic coordinates for boarding houses near University of Antique - Sibalom Campus
  const realCoordinates = useMemo(() => [
    { lat: 10.7908, lng: 122.0098 }, // UA Student Lodge - 200m from Main Gate
    { lat: 10.7922, lng: 122.0076 }, // Kuya Jun's - Near Sibalom Public Market  
    { lat: 10.7925, lng: 122.0105 }, // Casa Verde - Barangay Poblacion Center
    { lat: 10.7890, lng: 122.0082 }, // Sunshine Dormitory - Budget area, South of campus
    { lat: 10.7935, lng: 122.0115 }, // Premier Student Inn - Premium area with restaurants
    { lat: 10.7940, lng: 122.0068 }, // Highway Lodge - Along main road, near transportation
    { lat: 10.7875, lng: 122.0095 }, // Peaceful Haven - Quiet residential area
    { lat: 10.7950, lng: 122.0088 }, // Riverside Boarding - Near Sibalom River
    { lat: 10.7918, lng: 122.0125 }, // Town Center Lodge - Commercial district
    { lat: 10.7885, lng: 122.0078 }, // Terminal View - Near jeepney terminal
  ], []);

  // Filter markers based on selected school - properties are only near UA (Sibalom)
  const memoizedMarkers = useMemo(() => {
    // All our sample boarding houses are located in Sibalom, near UA Main Campus
    // Only show them when UA is selected, otherwise show empty list
    if (selectedSchool.id === 'ua' || selectedSchool.id === 'wrighttech') {
      // UA and Wright Tech are both in Sibalom, so show properties
      return sampleBoardingHouses.map((house, index) => ({
        id: house.id,
        latitude: realCoordinates[index]?.lat || universityCoords.latitude,
        longitude: realCoordinates[index]?.lng || universityCoords.longitude,
        title: house.name,
        subtitle: `₱${house.ratePerMonth.toLocaleString()}/month`,
        boardingHouse: house,
      }));
    } else {
      // Other schools are in different cities, so no properties available
      console.log(`No properties available near ${selectedSchool.shortName} (${selectedSchool.location})`);
      return [];
    }
  }, [realCoordinates, universityCoords, selectedSchool]);

  useEffect(() => {
    // Request location permissions and get user location
    const getLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation(location);
        }
      } catch (error) {
        console.log('Error getting location permission:', error);
      }
    };

    getLocationPermission();
    setMapMarkers(memoizedMarkers);
  }, [memoizedMarkers]);

  const handleMarkerPress = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker);
    setSelectedProperty(marker.boardingHouse);
    setModalVisible(true);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (selectedMarker) {
      navigation.navigate('BoardingHouseDetail', { 
        boardingHouse: selectedMarker.boardingHouse 
      });
    }
  }, [selectedMarker, navigation]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedProperty(null);
    setSelectedUniversity(null);
    setSelectedMarker(null);
  }, []);

  const handleViewProperty = useCallback((property: BoardingHouse) => {
    setModalVisible(false);
    navigation.navigate('BoardingHouseDetail', { boardingHouse: property });
  }, [navigation]);

  // Function to fetch route from property to university
  const fetchRoute = useCallback(async (fromLng: number, fromLat: number) => {
    if (!MAPBOX_ACCESS_TOKEN) return;
    
    setIsLoadingRoute(true);
    
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${fromLng},${fromLat};${universityCoords.longitude},${universityCoords.latitude}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Extract route coordinates
        const coordinates = route.geometry.coordinates;
        setRouteCoordinates(coordinates);
        
        // Calculate distance and duration
        const distanceKm = route.distance / 1000;
        const durationMin = Math.ceil(route.duration / 60);
        
        setRouteInfo({
          distance: distanceKm < 1 ? `${Math.round(route.distance)}m` : `${distanceKm.toFixed(2)}km`,
          duration: durationMin < 60 ? `${durationMin} min walk` : `${Math.floor(durationMin / 60)}h ${durationMin % 60}m walk`
        });
        
        // Debug: Log route details
        console.log('Route calculated:', {
          distance: route.distance,
          duration: route.duration,
          coordinateCount: coordinates.length,
          startPoint: coordinates[0],
          endPoint: coordinates[coordinates.length - 1]
        });
      }
    } catch (error) {
      console.log('Error fetching route:', error);
      Alert.alert('Route Error', 'Could not calculate walking route');
    } finally {
      setIsLoadingRoute(false);
    }
  }, [MAPBOX_ACCESS_TOKEN]);

  // Clear route function
  const clearRoute = useCallback(() => {
    setRouteCoordinates([]);
    setRouteInfo(null);
  }, []);

  // Handle school selection and map recentering
  const handleSchoolSelection = useCallback((school: any) => {
    setSelectedSchool(school);
    clearRoute(); // Clear any existing routes when switching schools
    setModalVisible(false); // Close any open modals
  }, [clearRoute]);

  // Handle university marker press (different from boarding house markers)
  const handleUniversityMarkerPress = useCallback(() => {
    setSelectedUniversity(selectedSchool);
    setModalType('university');
    setModalVisible(true);
    clearRoute(); // Clear any existing routes
  }, [selectedSchool, clearRoute]);

  // Enhanced marker press handler with route calculation
  const handleMarkerPressWithRoute = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker);
    setSelectedProperty(marker.boardingHouse);
    setModalType('property');
    setModalVisible(true);
    
    // Calculate route to university for boarding house properties
    if (marker.boardingHouse && marker.id !== 'university') {
      fetchRoute(marker.longitude, marker.latitude);
    } else {
      // If it's the university, clear any existing route
      clearRoute();
    }
  }, [fetchRoute, clearRoute]);

  return (
    <View style={styles.container}>
      {/* Route Info Display */}
      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.routeInfoText}>
            🚶‍♂️ {routeInfo.distance} • {routeInfo.duration}
          </Text>
          {isLoadingRoute && (
            <Text style={styles.loadingText}>Calculating route...</Text>
          )}
          <TouchableOpacity onPress={clearRoute} style={styles.clearRouteButton}>
            <Text style={styles.clearRouteText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Mapbox Map View */}
      <View style={styles.mapContainer}>
        <Mapbox.MapView 
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Mapbox.Camera
            key={selectedSchool.id} // Force re-render when school changes
            centerCoordinate={[universityCoords.longitude, universityCoords.latitude]}
            zoomLevel={17}
            animationDuration={1500} // Smooth transition
          />

          {/* University Marker */}
          <Mapbox.PointAnnotation
            id="university"
            coordinate={[universityCoords.longitude, universityCoords.latitude]}
            onSelected={handleUniversityMarkerPress}
          >
            <PropertyMarker 
              property={{ name: selectedSchool.name } as any}
              isUniversity={true}
            />
            <Mapbox.Callout title={selectedSchool.name} />
          </Mapbox.PointAnnotation>

          {/* Route Display */}
          {routeCoordinates.length > 0 && (
            <Mapbox.ShapeSource id="routeSource" shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates
              }
            }}>
              <Mapbox.LineLayer
                id="routeLayer"
                style={{
                  lineColor: colors.primary,
                  lineWidth: 6,
                  lineOpacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            </Mapbox.ShapeSource>
          )}

          {/* Boarding House Markers */}
          {mapMarkers.map((marker) => (
            <Mapbox.PointAnnotation
              key={marker.id}
              id={marker.id}
              coordinate={[marker.longitude, marker.latitude]}
              onSelected={() => handleMarkerPressWithRoute(marker)}
            >
              <PropertyMarker 
                property={marker.boardingHouse}
                isSelected={selectedMarker?.id === marker.id}
              />
              <Mapbox.Callout title={marker.title} />
            </Mapbox.PointAnnotation>
          ))}

          {/* User Location */}
          {userLocation && (
            <Mapbox.PointAnnotation
              id="userLocation"
              coordinate={[userLocation.coords.longitude, userLocation.coords.latitude]}
            >
              <PropertyMarker 
                property={{ name: 'Your Location', images: [] } as any}
              />
              <Mapbox.Callout title="Your Location" />
            </Mapbox.PointAnnotation>
          )}
        </Mapbox.MapView>
      </View>

      {/* Boarding Houses List - Matching Fallback Design */}
      <View style={styles.listContainer}>
        {/* School Selector */}
        <View style={styles.schoolSelectorContainer}>
          <Text style={styles.schoolSelectorTitle}>🏫 Select University/School</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.schoolSelector}
          >
            {POPULAR_SCHOOLS.map((school) => (
              <TouchableOpacity
                key={school.id}
                style={[
                  styles.schoolChip,
                  selectedSchool.id === school.id && styles.schoolChipSelected
                ]}
                onPress={() => handleSchoolSelection(school)}
              >
                <Text style={[
                  styles.schoolChipText,
                  selectedSchool.id === school.id && styles.schoolChipTextSelected
                ]}>
                  {school.shortName}
                </Text>
                <Text style={[
                  styles.schoolChipSubtext,
                  selectedSchool.id === school.id && styles.schoolChipSubtextSelected
                ]}>
                  {school.location}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Available Properties</Text>
          <Text style={styles.listSubtitle}>Near {selectedSchool.shortName}</Text>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {mapMarkers.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsTitle}>No Properties Found</Text>
              <Text style={styles.noResultsSubtitle}>
                No boarding houses available near {selectedSchool.shortName} at this time.
              </Text>
              <Text style={styles.noResultsHint}>
                Try selecting University of Antique - Main Campus for available options.
              </Text>
            </View>
          ) : (
            mapMarkers.map((marker, index) => (
              <TouchableOpacity
                key={marker.id}
                style={[
                  styles.propertyCard,
                  selectedMarker?.id === marker.id && styles.selectedPropertyCard
                ]}
                onPress={() => handleMarkerPress(marker)}
              >
              <View style={styles.propertyInfo}>
                <View style={styles.propertyHeader}>
                  <Text style={styles.propertyName} numberOfLines={1}>
                    {marker.boardingHouse.name}
                  </Text>
                  <Text style={styles.propertyPrice}>
                    ₱{marker.boardingHouse.ratePerMonth.toLocaleString()}
                  </Text>
                </View>
                
                <Text style={styles.propertyLocation} numberOfLines={1}>
                  {marker.boardingHouse.location}
                </Text>
                
                <View style={styles.propertyFooter}>
                  <View style={styles.ratingContainer}>
                    <Star color={colors.warning} size={14} fill={colors.warning} />
                    <Text style={styles.rating}>{marker.boardingHouse.rating}</Text>
                  </View>
                  <Text style={styles.distance}>
                    {marker.boardingHouse.distance 
                      ? marker.boardingHouse.distance < 1 
                        ? `${Math.round(marker.boardingHouse.distance * 1000)}m to UA`
                        : `${marker.boardingHouse.distance.toFixed(1)}km to UA`
                      : 'Distance unknown'
                    }
                  </Text>
                </View>
              </View>
              
              <View style={styles.propertyIndicator}>
                <View style={[styles.propertyDot, { backgroundColor: selectedMarker?.id === marker.id ? colors.primary : colors.gray[300] }]} />
              </View>
            </TouchableOpacity>
          ))
          )}
        </ScrollView>
      </View>

      {/* Property Modal */}
      <PropertyModal
        visible={modalVisible}
        property={selectedProperty}
        university={selectedUniversity}
        modalType={modalType}
        onClose={handleCloseModal}
        onViewDetails={() => selectedProperty && handleViewProperty(selectedProperty)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },

  // List Styles - Matching Fallback Design
  listContainer: {
    backgroundColor: colors.white,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.50,
  },
  listHeader: {
    marginTop: spacing[3],
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  listTitle: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  listSubtitle: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
  },
  // Clean Property Card Styles
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPropertyCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[1],
  },
  propertyName: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing[2],
  },
  propertyPrice: {
    ...typography.textStyles.h4,
    color: colors.primary,
    fontWeight: '700',
  },
  propertyLocation: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    marginLeft: spacing[1],
    fontWeight: '500',
  },
  distance: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  propertyIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Route Info Styles
  routeInfoContainer: {
    position: 'absolute',
    top: 50,
    left: spacing[4],
    right: spacing[4],
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  routeInfoText: {
    ...typography.textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  loadingText: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginLeft: spacing[2],
  },
  clearRouteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  clearRouteText: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  
  // School Selector Styles
  schoolSelectorContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  schoolSelectorTitle: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  schoolSelector: {
    paddingVertical: spacing[2],
  },
  schoolChip: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    borderWidth: 1,
    borderColor: colors.gray[200],
    minWidth: 80,
    alignItems: 'center',
  },
  schoolChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  schoolChipText: {
    ...typography.textStyles.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  schoolChipTextSelected: {
    color: colors.white,
  },
  schoolChipSubtext: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  schoolChipSubtextSelected: {
    color: colors.white,
  },

  // No Results Styles
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
  },
  noResultsTitle: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  noResultsSubtitle: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  noResultsHint: {
    ...typography.textStyles.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});