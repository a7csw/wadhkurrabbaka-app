import axios from 'axios';

interface MosqueData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  vicinity: string;
  distanceMeters?: number;
}

interface PlacesResponse {
  results: Array<{
    place_id: string;
    name: string;
    vicinity: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  next_page_token?: string;
  status: string;
  error_message?: string;
}

const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

/**
 * Fetch nearby mosques from Google Places API
 */
export async function fetchNearbyMosques({
  lat,
  lon,
  apiKey,
}: {
  lat: number;
  lon: number;
  apiKey: string;
}): Promise<MosqueData[]> {
  const isDemoKey = !apiKey || apiKey.includes('your_') || apiKey === 'AIzaSyDummy_Key_Replace_With_Real_Key';

  if (isDemoKey) {
    if (__DEV__) {
      console.warn('🔴 [GooglePlaces] API key missing or invalid - Using demo mode');
      console.warn('💡 Add EXPO_PUBLIC_GOOGLE_API_KEY to your .env file');
    }
    return getDemoMosques(lat, lon);
  }

  try {
    const mosques: MosqueData[] = [];
    let nextPageToken: string | undefined;
    
    // First request
    const params: any = {
      location: `${lat},${lon}`,
      radius: 5000,
      type: 'mosque',
      language: 'ar',
      key: apiKey,
    };

    const response = await axios.get<PlacesResponse>(GOOGLE_PLACES_URL, {
      params,
      timeout: 10000,
    });

    if (response.data.status !== 'OK') {
      // Try alternative search with place_of_worship + mosque keyword
      if (response.data.status === 'ZERO_RESULTS' || response.data.status === 'REQUEST_DENIED') {
        console.warn(`⚠️ [GooglePlaces] Type 'mosque' failed (${response.data.status}), trying alternative search`);
        
        const altParams = {
          ...params,
          type: 'place_of_worship',
          keyword: 'mosque',
        };
        
        const altResponse = await axios.get<PlacesResponse>(GOOGLE_PLACES_URL, {
          params: altParams,
          timeout: 10000,
        });

        if (altResponse.data.status !== 'OK') {
          throw new Error(`Places API error: ${altResponse.data.status} - ${altResponse.data.error_message || 'Unknown error'}`);
        }

        response.data = altResponse.data;
      } else {
        throw new Error(`Places API error: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
      }
    }

    // Process results
    response.data.results.forEach((place) => {
      const mosque: MosqueData = {
        id: place.place_id,
        name: place.name,
        lat: place.geometry.location.lat,
        lon: place.geometry.location.lng,
        vicinity: place.vicinity,
        distanceMeters: calculateDistance(lat, lon, place.geometry.location.lat, place.geometry.location.lng),
      };
      mosques.push(mosque);
    });

    nextPageToken = response.data.next_page_token;

    // Handle pagination if there are more results
    if (nextPageToken) {
      // Google requires a short delay before using next_page_token
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const nextResponse = await axios.get<PlacesResponse>(GOOGLE_PLACES_URL, {
          params: {
            pagetoken: nextPageToken,
            key: apiKey,
          },
          timeout: 10000,
        });

        if (nextResponse.data.status === 'OK') {
          nextResponse.data.results.forEach((place) => {
            const mosque: MosqueData = {
              id: place.place_id,
              name: place.name,
              lat: place.geometry.location.lat,
              lon: place.geometry.location.lng,
              vicinity: place.vicinity,
              distanceMeters: calculateDistance(lat, lon, place.geometry.location.lat, place.geometry.location.lng),
            };
            mosques.push(mosque);
          });
        }
      } catch (error) {
        console.warn('⚠️ [GooglePlaces] Failed to fetch next page:', error);
      }
    }

    // Deduplicate by place_id
    const uniqueMosques = Array.from(
      new Map(mosques.map(m => [m.id, m])).values()
    );

    // Sort by distance
    uniqueMosques.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));

    console.log(`✅ [GooglePlaces] Found ${uniqueMosques.length} mosques`);
    return uniqueMosques;

  } catch (error) {
    console.error('❌ [GooglePlaces] Error fetching mosques:', error);
    
    // Return demo data as fallback
    if (__DEV__) {
      console.warn('🔴 [GooglePlaces] Falling back to demo mode');
    }
    return getDemoMosques(lat, lon);
  }
}

/**
 * Calculate distance between two points in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Get demo mosques for testing/fallback
 * These are real mosque locations near major city centers
 */
function getDemoMosques(lat: number, lon: number): MosqueData[] {
  const demoMosques: Record<string, MosqueData[]> = {
    // Istanbul area
    istanbul: [
      {
        id: 'demo_sultanahmet',
        name: 'Sultan Ahmed Mosque (Blue Mosque) - Demo',
        lat: 41.0054,
        lon: 28.9768,
        vicinity: 'Sultanahmet, Istanbul',
      },
      {
        id: 'demo_suleymaniye',
        name: 'Süleymaniye Mosque - Demo',
        lat: 41.0161,
        lon: 28.9642,
        vicinity: 'Eminönü, Istanbul',
      },
      {
        id: 'demo_fatih',
        name: 'Fatih Mosque - Demo',
        lat: 41.0198,
        lon: 28.9496,
        vicinity: 'Fatih, Istanbul',
      },
    ],
    // Mecca area
    mecca: [
      {
        id: 'demo_masjidalharam',
        name: 'Masjid al-Haram - Demo',
        lat: 21.4225,
        lon: 39.8262,
        vicinity: 'Mecca, Saudi Arabia',
      },
      {
        id: 'demo_masjidaisha',
        name: 'Masjid Aisha - Demo',
        lat: 21.4576,
        lon: 39.8003,
        vicinity: 'At-Tan\'im, Mecca',
      },
    ],
    // Default/Other locations
    default: [
      {
        id: 'demo_1',
        name: 'Central Mosque - Demo',
        lat: lat + 0.01,
        lon: lon + 0.01,
        vicinity: 'Demo Location 1',
      },
      {
        id: 'demo_2',
        name: 'Community Mosque - Demo',
        lat: lat - 0.008,
        lon: lon + 0.012,
        vicinity: 'Demo Location 2',
      },
      {
        id: 'demo_3',
        name: 'Islamic Center - Demo',
        lat: lat + 0.015,
        lon: lon - 0.009,
        vicinity: 'Demo Location 3',
      },
    ],
  };

  // Select appropriate demo set based on location
  let selectedMosques: MosqueData[];
  
  if (Math.abs(lat - 41.01) < 0.5 && Math.abs(lon - 28.96) < 0.5) {
    selectedMosques = demoMosques.istanbul;
  } else if (Math.abs(lat - 21.42) < 0.5 && Math.abs(lon - 39.82) < 0.5) {
    selectedMosques = demoMosques.mecca;
  } else {
    selectedMosques = demoMosques.default;
  }

  // Calculate distances and sort
  const mosquesWithDistance = selectedMosques.map(mosque => ({
    ...mosque,
    distanceMeters: calculateDistance(lat, lon, mosque.lat, mosque.lon),
  }));

  mosquesWithDistance.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));

  return mosquesWithDistance;
}



