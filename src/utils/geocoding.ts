/**
 * Geocoding utilities using OpenStreetMap Nominatim API
 * Free service, no API key required
 * Rate limit: 1 request per second
 * Documentation: https://nominatim.org/release-docs/latest/api/Search/
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Geocode an address to get latitude and longitude
 * Uses OpenStreetMap's Nominatim API
 *
 * Note: Nominatim has CORS restrictions for browser requests.
 * For production, consider using:
 * 1. Mapbox Geocoding API (requires API key)
 * 2. Backend proxy server
 * 3. Pre-geocoded coordinates in database
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim() === '') {
    return null;
  }

  try {
    // Add a small delay to respect rate limiting (1 request per second)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const encodedAddress = encodeURIComponent(address);

    // Try using a CORS proxy for development (not for production!)
    // In production, use a backend proxy or service with proper CORS support
    const useProxy = true; // Set to false to try direct connection
    const baseUrl = useProxy
      ? `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
      : `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

    const response = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'BeeHauz-App/1.0',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      console.warn(`Geocoding HTTP error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
      };
    }

    console.warn(`No geocoding results for: ${address}`);
    return null;
  } catch (error) {
    // CORS errors are common with Nominatim from browsers
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn(`CORS error geocoding "${address}". Consider using a backend proxy or pre-geocoded coordinates.`);
    } else {
      console.error('Geocoding error:', error);
    }
    return null;
  }
}

/**
 * Geocode multiple addresses with rate limiting
 * Processes addresses sequentially to respect API limits
 */
export async function geocodeAddresses(
  addresses: string[]
): Promise<Map<string, GeocodingResult>> {
  const results = new Map<string, GeocodingResult>();

  for (const address of addresses) {
    if (address && address.trim() !== '') {
      const result = await geocodeAddress(address);
      if (result) {
        results.set(address, result);
      }
    }
  }

  return results;
}

/**
 * Fallback coordinates for Philippines (Manila) if geocoding fails
 */
export const DEFAULT_COORDINATES = {
  latitude: 14.5995,
  longitude: 120.9842,
};

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined
): boolean {
  return (
    lat !== null &&
    lat !== undefined &&
    lng !== null &&
    lng !== undefined &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
