// Major universities and schools in Metro Manila
export interface University {
  id: string;
  name: string;
  shortName: string;
  coordinates: [number, number]; // [latitude, longitude]
  address: string;
}

export const UNIVERSITIES: University[] = [
  // University Belt Area
  {
    id: 'ua',
    name: 'University of Antique',
    shortName: 'University of Antique',
    coordinates: [10.7915, 122.0083],
    address: 'Sibalom, Antique',
  },

  // Add more universities as needed
];

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const R = 6371; // Earth's radius in kilometers
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Returns distance in kilometers
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

// Find nearest university to a given coordinate
export const findNearestUniversity = (
  coordinates: [number, number]
): { university: University; distance: number } => {
  let nearest: University = UNIVERSITIES[0];
  let minDistance = calculateDistance(coordinates, UNIVERSITIES[0].coordinates);

  for (const university of UNIVERSITIES) {
    const distance = calculateDistance(coordinates, university.coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = university;
    }
  }

  return { university: nearest, distance: minDistance };
};

// Calculate estimated walking time (assuming average speed of 5 km/h)
export const calculateWalkingTime = (distanceKm: number): string => {
  const walkingSpeedKmh = 5; // Average walking speed
  const hours = distanceKm / walkingSpeedKmh;
  const minutes = Math.round(hours * 60);

  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
  }
};

// Format distance for display
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  } else {
    return `${distanceKm.toFixed(1)} km`;
  }
};
