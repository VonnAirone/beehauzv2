import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Locate, Navigation, X } from 'lucide-react-native';
import { Map, MapMarker, RouteInfo } from '../../../components/common';
import { supabase } from '../../../services/supabase';
import { colors } from '../../../styles/colors';
import { isValidCoordinates, DEFAULT_COORDINATES } from '../../../utils/geocoding';
import { useResponsive } from '../../../hooks/useResponsive';
import { TenantStackParamList } from '../../../navigation/types';
import {
  findNearestUniversity,
  formatDistance,
  calculateWalkingTime,
} from '../../../data/universities';

interface PropertyLocation {
  id: string;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  price?: number | null;
}

type MapViewRouteProp = RouteProp<TenantStackParamList, 'MapView'>;

export const MapViewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<MapViewRouteProp>();
  const { focusedPropertyId, focusedPropertyName, focusedPropertyAddress } = route.params || {};
  const { isMobile } = useResponsive();
  const [properties, setProperties] = useState<PropertyLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]);
  const [mapZoom, setMapZoom] = useState(13);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  useEffect(() => {
    loadProperties();
    requestLocationPermission();
  }, []);

  // Auto-focus on property if focusedPropertyId is provided
  useEffect(() => {
    if (focusedPropertyId && properties.length > 0) {
      const focusedProperty = properties.find(p => p.id === focusedPropertyId);
      if (focusedProperty && isValidCoordinates(focusedProperty.latitude, focusedProperty.longitude)) {
        setMapCenter([focusedProperty.latitude!, focusedProperty.longitude!]);
        setMapZoom(400);
        setMapKey(prev => prev + 1);
      }
    }
  }, [focusedPropertyId, properties]);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, use browser geolocation API
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords: [number, number] = [
                position.coords.latitude,
                position.coords.longitude,
              ];
              setUserLocation(coords);
              setMapCenter(coords);
              setMapZoom(15);
              setMapKey(prev => prev + 1);
            },
            (error) => {
              console.warn('Initial geolocation error:', error.message, error.code);
              // Silently fail on initial load - user can use the button to try again
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
          );
        }
      }
    } catch (error) {
      console.warn('Location permission error:', error);
    }
  };

  const centerOnUserLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords: [number, number] = [
                position.coords.latitude,
                position.coords.longitude,
              ];
              setUserLocation(coords);
              setMapCenter(coords);
              setMapZoom(16);
              setMapKey(prev => prev + 1);
              setIsLoadingLocation(false);
            },
            (error) => {
              console.warn('Geolocation error:', error.message, error.code);
              let errorMessage = 'Unable to get your current location.';

              if (error.code === 1) {
                errorMessage = 'Location access was denied. Please enable location permissions in your browser settings.';
              } else if (error.code === 2) {
                errorMessage = 'Location information is unavailable. Please check your device settings.';
              } else if (error.code === 3) {
                errorMessage = 'Location request timed out. Please try again.';
              }

              Alert.alert('Location Error', errorMessage);
              setIsLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
          );
        } else {
          Alert.alert('Location Not Available', 'Geolocation is not supported by your browser.');
          setIsLoadingLocation(false);
        }
      } else {
        setIsLoadingLocation(false);
      }
    } catch (error) {
      Alert.alert('Location Error', 'Failed to get your location.');
      console.error('Location error:', error);
      setIsLoadingLocation(false);
    }
  };

  const loadProperties = async () => {
    try {
      setIsLoading(true);

      // Fetch properties with coordinates, images, and prices
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, address, latitude, longitude, image_url, price')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const properties = data ?? [];

      // Separate properties that need geocoding
      const propertiesNeedingGeocoding = properties.filter(
        (p) => !isValidCoordinates(p.latitude, p.longitude) && p.address
      );

      // For properties without coordinates, use default location
      // Note: Browser-based geocoding has CORS restrictions
      // For production, pre-geocode addresses or use a backend service
      if (propertiesNeedingGeocoding.length > 0) {
        console.log(`${propertiesNeedingGeocoding.length} properties need coordinates. Using default location.`);

        // Assign default coordinates to properties without them
        // This allows the map to display while coordinates are added manually
        propertiesNeedingGeocoding.forEach((property) => {
          property.latitude = DEFAULT_COORDINATES.latitude + (Math.random() * 0.01 - 0.005);
          property.longitude = DEFAULT_COORDINATES.longitude + (Math.random() * 0.01 - 0.005);
        });

        // Optionally: Try to geocode in background (may fail due to CORS)
        // Uncomment if you have a backend proxy or CORS-enabled geocoding service
        /*
        for (let i = 0; i < propertiesNeedingGeocoding.length; i++) {
          const property = propertiesNeedingGeocoding[i];

          try {
            const result = await geocodeAddress(property.address);

            if (result) {
              property.latitude = result.latitude;
              property.longitude = result.longitude;

              await supabase
                .from('properties')
                .update({
                  latitude: result.latitude,
                  longitude: result.longitude,
                  geocoded_at: new Date().toISOString(),
                })
                .eq('id', property.id);
            }
          } catch (error) {
            console.warn(`Geocoding failed for: ${property.name}`);
          }
        }
        */
      }

      setProperties(properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerClick = (marker: MapMarker) => {
    // Don't show route for user location marker
    if (marker.isUserLocation) {
      return;
    }

    // Find nearest university and calculate route
    const { university, distance } = findNearestUniversity(marker.position);
    const walkingTime = calculateWalkingTime(distance);
    const formattedDistance = formatDistance(distance);

    setRouteInfo({
      from: marker.position,
      to: university.coordinates,
      schoolName: university.shortName,
      distance: formattedDistance,
      walkingTime: walkingTime,
    });
  };

  const handleClearRoute = () => {
    setRouteInfo(null);
  };

  const markers: MapMarker[] = [
    ...properties
      .filter((p) => isValidCoordinates(p.latitude, p.longitude))
      .map((property) => ({
        id: property.id,
        position: [property.latitude!, property.longitude!] as [number, number],
        title: property.name,
        description: property.address || 'Address not provided',
        imageUrl: property.image_url || undefined,
        price: property.price ? `₱${property.price.toLocaleString()}/mo` : undefined,
        isUserLocation: false,
      })),
    ...(userLocation
      ? [{
          id: 'user-location',
          position: userLocation,
          title: 'Your Location',
          description: 'You are here',
          isUserLocation: true,
        }]
      : []),
  ];

  if (isLoading) {
    return (
      <View style={styles.container}>
        {!isMobile && (
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Map View</Text>
            <View style={styles.backButton} />
          </View>
        )}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Loading properties...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {!isMobile && (
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Map View</Text>
            <View style={styles.backButton} />
          </View>
        )}
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load map</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isMobile && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Map View</Text>
          <View style={styles.backButton} />
        </View>
      )}

      <View style={styles.mapContainer}>
        <Map
          key={mapKey}
          center={mapCenter}
          zoom={mapZoom}
          markers={markers}
          height="100%"
          width="100%"
          onMarkerClick={handleMarkerClick}
          routeInfo={routeInfo}
        />

        {/* Route info card */}
        {routeInfo && (
          <View style={styles.routeCard}>
            <View style={styles.routeCardHeader}>
              <Text style={styles.routeCardTitle}>Walking Route</Text>
              <TouchableOpacity onPress={handleClearRoute} style={styles.clearRouteButton}>
                <X size={20} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>
            <View style={styles.routeCardBody}>
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeInfoLabel}>To</Text>
                <Text style={styles.routeInfoValue}>{routeInfo.schoolName}</Text>
              </View>
              <View style={styles.routeInfoDivider} />
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeInfoLabel}>Distance</Text>
                <Text style={styles.routeInfoValue}>{routeInfo.distance}</Text>
              </View>
              <View style={styles.routeInfoDivider} />
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeInfoLabel}>Walking Time</Text>
                <Text style={styles.routeInfoValue}>{routeInfo.walkingTime}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Location button */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={centerOnUserLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Locate size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {properties.length > 0 && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Showing {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </Text>
        </View>
      )}
    </View>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  locationButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[700],
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    textAlign: 'center',
  },
  routeCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 80,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  routeCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  clearRouteButton: {
    padding: 4,
  },
  routeCardBody: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  routeInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  routeInfoLabel: {
    fontSize: 11,
    color: colors.gray[600],
    marginBottom: 4,
  },
  routeInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  routeInfoDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: 12,
  },
});
