import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { MapPin } from 'lucide-react-native';

// Orange pin marker for selected location
const createPinIcon = () =>
  L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          background:#FF8B00;border-radius:50% 50% 50% 0;
          width:36px;height:36px;transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);border:3px solid white;
        ">
          <div style="transform:rotate(45deg);color:white;font-size:16px;line-height:1;">📍</div>
        </div>
      </div>
    `,
    className: 'location-picker-icon',
    iconSize: [36, 42],
    iconAnchor: [18, 42],
  });

// Component to handle map click events
function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to recenter the map when position changes externally
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  React.useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: number;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  onLocationSelect,
  height = 280,
}) => {
  const defaultCenter: [number, number] = [10.8009, 122.0119]; // Sibalom, Antique
  const center: [number, number] = latitude && longitude ? [latitude, longitude] : defaultCenter;
  const hasPin = latitude !== null && longitude !== null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <MapPin size={14} color={colors.text.secondary} />
        <Text style={[typography.textStyles.body, styles.label]}>Pin Location</Text>
      </View>
      <Text style={[typography.textStyles.caption, styles.hint]}>
        Tap on the map to set the exact location of your property.
      </Text>
      <View style={[styles.mapContainer, { height }]}>
        <MapContainer
          center={center}
          zoom={16}
          style={{ height: '100%', width: '100%', borderRadius: 10 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onLocationSelect={onLocationSelect} />
          {hasPin && (
            <>
              <Marker position={[latitude!, longitude!]} icon={createPinIcon()} />
              <RecenterMap lat={latitude!} lng={longitude!} />
            </>
          )}
        </MapContainer>
      </View>
      {hasPin && (
        <Text style={[typography.textStyles.caption, styles.coords]}>
          {latitude!.toFixed(6)}, {longitude!.toFixed(6)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  label: {
    color: colors.text.primary,
  },
  hint: {
    color: colors.text.tertiary,
    marginBottom: 8,
  },
  mapContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  coords: {
    color: colors.text.secondary,
    marginTop: 6,
    textAlign: 'right',
  },
});
