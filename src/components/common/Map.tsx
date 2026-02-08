import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface MapMarker {
  id: string;
  position: [number, number]; // [latitude, longitude]
  title?: string;
  description?: string;
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: number | string;
  width?: number | string;
  onMarkerClick?: (marker: MapMarker) => void;
}

export const Map: React.FC<MapProps> = ({
  center = [14.5995, 120.9842], // Manila, Philippines default
  zoom = 13,
  markers = [],
  height = 400,
  width = '100%',
  onMarkerClick,
}) => {
  return (
    <View style={[styles.container, { height, width }]}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            eventHandlers={{
              click: () => onMarkerClick?.(marker),
            }}
          >
            {(marker.title || marker.description) && (
              <Popup>
                {marker.title && <strong>{marker.title}</strong>}
                {marker.description && <p>{marker.description}</p>}
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 8,
  },
});
