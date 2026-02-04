import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
// import { WebView } from 'react-native-webview'; // Removed - not available in current build
import { MapPin, Navigation, Star, Locate } from 'lucide-react-native';
import { colors } from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';
import { BoardingHouse } from '../../../types/tenant';
import { sampleBoardingHouses } from '../../../data/sampleBoardingHouses';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TenantStackParamList } from '../../../navigation/types';
import * as Location from 'expo-location';
import { PropertyModal, CustomMarker } from '../../../components/map';

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

export const MapScreenFallback: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<BoardingHouse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);

  // University of Antique coordinates (Sibalom, Antique)
  const universityCoords = {
    latitude: 10.7913526,
    longitude: 122.0089137,
  };

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

    // Convert boarding houses to map markers with realistic coordinates around Sibalom, Antique
    const realCoordinates = [
      { lat: 10.79020, lng: 122.00820 }, // Near UA Main Gate
      { lat: 10.79350, lng: 122.00450 }, // Near Public Market
      { lat: 10.79420, lng: 122.00980 }, // Barangay Poblacion
      { lat: 10.78980, lng: 122.00380 }, // Budget area
      { lat: 10.79580, lng: 122.01180 }, // Premium area with meals
      { lat: 10.79320, lng: 122.01320 }, // Highway location
      { lat: 10.78820, lng: 122.00220 }, // Rural area
      { lat: 10.79680, lng: 122.00880 }, // Near river/creek
      { lat: 10.79250, lng: 122.01480 }, // Commercial area
      { lat: 10.78880, lng: 122.00680 }, // Near terminal
    ];

    const markers: MapMarker[] = sampleBoardingHouses.map((house, index) => ({
      id: house.id,
      latitude: realCoordinates[index]?.lat || universityCoords.latitude,
      longitude: realCoordinates[index]?.lng || universityCoords.longitude,
      title: house.name,
      subtitle: `₱${house.ratePerMonth.toLocaleString()}/month`,
      boardingHouse: house,
    }));
    setMapMarkers(markers);
  }, []);

  const handleMarkerPress = (marker: MapMarker) => {
    setSelectedMarker(marker);
    setSelectedProperty(marker.boardingHouse);
    setModalVisible(true);
  };

  const handleViewDetails = () => {
    if (selectedMarker) {
      navigation.navigate('BoardingHouseDetail', { 
        boardingHouse: selectedMarker.boardingHouse 
      });
    }
  };

  const getDistanceText = (distance: number | undefined) => {
    if (!distance) return 'Distance unknown';
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m to UA`;
    return `${distance.toFixed(1)}km to UA`;
  };

  const showMapNotice = () => {
    setShowInteractiveMap(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProperty(null);
    setSelectedMarker(null);
  };

  const handleViewProperty = (property: BoardingHouse) => {
    setModalVisible(false);
    navigation.navigate('BoardingHouseDetail', { boardingHouse: property });
  };

  return (
    <View style={styles.container}>
      {/* Clean Map Preview Section */}
      <View style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <View style={styles.locationInfo}>
            <MapPin color={colors.primary} size={24} />
            <View style={styles.locationText}>
              <Text style={styles.areaTitle}>University of Antique Area</Text>
              <Text style={styles.areaSubtitle}>Sibalom, Antique</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mapButton} onPress={showMapNotice}>
            <Navigation color={colors.primary} size={18} />
            <Text style={styles.mapButtonText}>View Location Details</Text>
          </TouchableOpacity>
        </View>

        {/* Clean Visual Map Representation with Emoji Markers */}
        <View style={styles.mapVisual}>
          <View style={styles.universityPin}>
            <Text style={styles.universityEmoji}>🏫</Text>
            <Text style={styles.universityLabel}>University of Antique</Text>
          </View>
          
          <View style={styles.propertiesMarkers}>
            <View style={styles.markersRow}>
              <Text style={styles.propertyEmoji}>🏠</Text>
              <Text style={styles.propertyEmoji}>🏠</Text>
              <Text style={styles.propertyEmoji}>🏠</Text>
            </View>
            <View style={styles.markersRow}>
              <Text style={styles.propertyEmoji}>🏠</Text>
              <Text style={styles.propertyEmoji}>🏠</Text>
            </View>
          </View>
          
          <View style={styles.propertiesOverview}>
            <Text style={styles.propertiesCount}>
              {mapMarkers.length} Boarding Houses Nearby
            </Text>
            <Text style={styles.distanceRange}>
              Within 0.5km - 2.1km from campus
            </Text>
          </View>
        </View>
      </View>

      {/* Clean Properties List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Available Properties</Text>
          <Text style={styles.listSubtitle}>Sorted by distance from UA</Text>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {mapMarkers.map((marker, index) => (
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
                    {getDistanceText(marker.boardingHouse.distance)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.propertyIndicator}>
                <View style={[styles.propertyDot, { backgroundColor: selectedMarker?.id === marker.id ? colors.primary : colors.gray[300] }]} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Enhanced Map Info Modal */}
      {showInteractiveMap && (
        <View style={styles.mapModal}>
          <View style={styles.mapModalHeader}>
            <Text style={styles.mapModalTitle}>Location Details</Text>
            <TouchableOpacity 
              style={styles.mapModalClose}
              onPress={() => setShowInteractiveMap(false)}
            >
              <Text style={styles.mapModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.mapInfoContent}>
            <View style={styles.locationCard}>
              <Text style={styles.locationCardTitle}>🏫 University of Antique</Text>
              <Text style={styles.locationCardAddress}>Sibalom, Antique, Philippines</Text>
              <Text style={styles.locationCardCoords}>
                📍 {universityCoords.latitude.toFixed(6)}, {universityCoords.longitude.toFixed(6)}
              </Text>
            </View>
            
            <Text style={styles.propertiesListTitle}>📍 Nearby Boarding Houses</Text>
            {mapMarkers.map((marker, index) => (
              <TouchableOpacity
                key={marker.id}
                style={styles.locationPropertyCard}
                onPress={() => {
                  setShowInteractiveMap(false);
                  handleMarkerPress(marker);
                }}
              >
                <View style={styles.locationPropertyInfo}>
                  <Text style={styles.locationPropertyName}>{marker.boardingHouse.name}</Text>
                  <Text style={styles.locationPropertyAddress}>{marker.boardingHouse.location}</Text>
                  <Text style={styles.locationPropertyCoords}>
                    📍 {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
                  </Text>
                  <View style={styles.locationPropertyFooter}>
                    <Text style={styles.locationPropertyPrice}>
                      ₱{marker.boardingHouse.ratePerMonth.toLocaleString()}/month
                    </Text>
                    <Text style={styles.locationPropertyDistance}>
                      {getDistanceText(marker.boardingHouse.distance)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Property Modal */}
      <PropertyModal
        visible={modalVisible}
        property={selectedProperty}
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
    backgroundColor: colors.white,
  },
  // Clean Header Styles
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: spacing[3],
  },
  areaTitle: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    marginBottom: 2,
  },
  areaSubtitle: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.gray[100],
    borderRadius: 25,
  },
  mapButtonText: {
    ...typography.textStyles.caption,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing[1],
  },
  // Clean Map Visual
  mapVisual: {
    flex: 1,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  universityPin: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  universityDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  universityLabel: {
    ...typography.textStyles.caption,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing[2],
    textAlign: 'center',
  },
  universityEmoji: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  propertiesMarkers: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  markersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  propertyEmoji: {
    fontSize: 20,
    marginHorizontal: spacing[2],
    opacity: 0.8,
  },
  propertiesOverview: {
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  propertiesCount: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  distanceRange: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // Clean List Styles
  listContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing[5],
    maxHeight: height * 0.5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  listHeader: {
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
    marginRight: spacing[3],
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
  // Interactive Map Modal Styles
  mapModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    zIndex: 1000,
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  mapModalTitle: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    flex: 1,
  },
  mapModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapModalCloseText: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
  // Static Map Styles (WebView alternative)
  staticMapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.gray[100],
  },
  staticMapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  universityMarkerOverlay: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing[4],
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  mapMarkerText: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  mapMarkerLabel: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  mapInfo: {
    ...typography.textStyles.caption,
    color: colors.white,
    backgroundColor: colors.black + '80',
    padding: spacing[3],
    borderRadius: 8,
    textAlign: 'center',
    position: 'absolute',
    bottom: spacing[6],
    marginHorizontal: spacing[4],
  },
  // Location Details Modal Styles
  mapInfoContent: {
    flex: 1,
    padding: spacing[4],
  },
  locationCard: {
    backgroundColor: colors.gray[50],
    padding: spacing[4],
    borderRadius: 16,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  locationCardTitle: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  locationCardAddress: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  locationCardCoords: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
  propertiesListTitle: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  locationPropertyCard: {
    backgroundColor: colors.white,
    padding: spacing[4],
    borderRadius: 12,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  locationPropertyInfo: {
    flex: 1,
  },
  locationPropertyName: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  locationPropertyAddress: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  locationPropertyCoords: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
    fontSize: 10,
    marginBottom: spacing[2],
  },
  locationPropertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationPropertyPrice: {
    ...typography.textStyles.h4,
    color: colors.primary,
    fontWeight: '700',
  },
  locationPropertyDistance: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
  },
});