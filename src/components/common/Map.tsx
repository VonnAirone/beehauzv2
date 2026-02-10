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
  imageUrl?: string;
  price?: string;
  isUserLocation?: boolean;
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: number | string;
  width?: number | string;
  onMarkerClick?: (marker: MapMarker) => void;
}

// Create custom marker icon for properties
const createPropertyIcon = (imageUrl?: string, title?: string, price?: string) => {
  const iconHtml = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    ">
      <div style="
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        overflow: hidden;
        border: 3px solid #FF8B00;
        width: 80px;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        ${imageUrl ? `
          <img src="${imageUrl}" style="
            width: 80px;
            height: 60px;
            object-fit: cover;
            display: block;
          " />
        ` : `
          <div style="
            width: 80px;
            height: 60px;
            background: linear-gradient(135deg, #FFE5CC 0%, #FFB366 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF8B00" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        `}
        ${price ? `
          <div style="
            background: #FF8B00;
            color: white;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 8px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">${price}</div>
        ` : ''}
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #FF8B00;
        margin-top: -1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [80, 85],
    iconAnchor: [40, 85],
    popupAnchor: [0, -85],
  });
};

// Create user location marker icon
const createUserLocationIcon = () => {
  const iconHtml = `
    <div style="
      width: 20px;
      height: 20px;
      background: #4A90E2;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'user-location-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

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

        {markers.map((marker) => {
          const customIcon = marker.isUserLocation
            ? createUserLocationIcon()
            : createPropertyIcon(marker.imageUrl, marker.title, marker.price);

          return (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={customIcon}
              eventHandlers={{
                click: () => onMarkerClick?.(marker),
              }}
            >
              {(marker.title || marker.description) && (
                <Popup>
                  {marker.imageUrl && (
                    <img
                      src={marker.imageUrl}
                      alt={marker.title}
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                    />
                  )}
                  {marker.title && <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{marker.title}</strong>}
                  {marker.price && <p style={{ color: '#FF8B00', fontWeight: '600', margin: '4px 0' }}>{marker.price}</p>}
                  {marker.description && <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>{marker.description}</p>}
                </Popup>
              )}
            </Marker>
          );
        })}
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
