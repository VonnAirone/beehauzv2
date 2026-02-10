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
    id: 'ust',
    name: 'University of Santo Tomas',
    shortName: 'UST',
    coordinates: [14.6091, 120.9894],
    address: 'España Boulevard, Sampaloc, Manila',
  },
  {
    id: 'feu',
    name: 'Far Eastern University',
    shortName: 'FEU',
    coordinates: [14.6042, 120.9881],
    address: 'Nicanor Reyes St, Sampaloc, Manila',
  },
  {
    id: 'ue',
    name: 'University of the East',
    shortName: 'UE',
    coordinates: [14.6019, 120.9918],
    address: 'Claro M. Recto Avenue, Sampaloc, Manila',
  },
  {
    id: 'plm',
    name: 'Pamantasan ng Lungsod ng Maynila',
    shortName: 'PLM',
    coordinates: [14.5875, 120.9844],
    address: 'General Luna St, Intramuros, Manila',
  },

  // Diliman Area
  {
    id: 'up-diliman',
    name: 'University of the Philippines Diliman',
    shortName: 'UP Diliman',
    coordinates: [14.6537, 121.0685],
    address: 'Diliman, Quezon City',
  },
  {
    id: 'ateneo',
    name: 'Ateneo de Manila University',
    shortName: 'ADMU',
    coordinates: [14.6395, 121.0777],
    address: 'Katipunan Avenue, Loyola Heights, Quezon City',
  },
  {
    id: 'miriam',
    name: 'Miriam College',
    shortName: 'MC',
    coordinates: [14.6390, 121.0742],
    address: 'Katipunan Avenue, Loyola Heights, Quezon City',
  },

  // Taft Area
  {
    id: 'dlsu',
    name: 'De La Salle University',
    shortName: 'DLSU',
    coordinates: [14.5648, 120.9932],
    address: 'Taft Avenue, Malate, Manila',
  },
  {
    id: 'ceu',
    name: 'Centro Escolar University',
    shortName: 'CEU',
    coordinates: [14.6047, 120.9950],
    address: 'Mendiola St, San Miguel, Manila',
  },

  // QC Area
  {
    id: 'pup',
    name: 'Polytechnic University of the Philippines',
    shortName: 'PUP',
    coordinates: [14.5995, 120.9842],
    address: 'Anonas St, Sta. Mesa, Manila',
  },
  {
    id: 'adamson',
    name: 'Adamson University',
    shortName: 'AdU',
    coordinates: [14.5893, 120.9847],
    address: 'San Marcelino St, Ermita, Manila',
  },

  // Makati/BGC Area
  {
    id: 'aim',
    name: 'Asian Institute of Management',
    shortName: 'AIM',
    coordinates: [14.5547, 121.0244],
    address: 'Joseph R. Puno St, Makati',
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
