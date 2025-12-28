import axios from 'axios';

interface MosqueData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  vicinity: string;
  distanceMeters?: number;
}

interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  types?: string[];
  business_status?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface PlacesResponse {
  results: PlaceResult[];
  next_page_token?: string;
  status: string;
  error_message?: string;
}

const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const GOOGLE_TEXTSEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

/**
 * Scoring function to determine if a place is actually a mosque
 * Returns { ok: boolean, reason: string } for debugging
 */
function isLikelyMosque(place: PlaceResult): { ok: boolean; reason: string } {
  const name = (place.name || '').toLowerCase();
  const vicinity = (place.vicinity || '').toLowerCase();
  const types = place.types || [];
  const combinedText = `${name} ${vicinity}`;

  // HARD REJECT: Non-religious venues
  const excludedTypes = [
    'restaurant', 'cafe', 'store', 'shopping_mall', 'gym', 'school',
    'university', 'hospital', 'pharmacy', 'gas_station', 'bank', 'atm',
    'supermarket', 'bakery', 'bar', 'night_club', 'lodging', 'parking'
  ];
  
  for (const excludedType of excludedTypes) {
    if (types.includes(excludedType)) {
      return { ok: false, reason: `excluded_type: ${excludedType}` };
    }
  }

  // HARD REJECT: Other religions
  const otherReligionKeywords = [
    'church', 'cathedral', 'chapel', 'basilica', 'synagogue', 'temple',
    'buddhist', 'hindu', 'shrine', 'pagoda', 'vihara', 'gurdwara'
  ];
  
  for (const keyword of otherReligionKeywords) {
    if (combinedText.includes(keyword)) {
      return { ok: false, reason: `other_religion: ${keyword}` };
    }
  }

  // STRONG ACCEPT: Explicit mosque type
  if (types.includes('mosque')) {
    return { ok: true, reason: 'type=mosque' };
  }

  // ACCEPT: Islamic keywords in name/vicinity
  const islamicKeywords = [
    'mosque', 'masjid', 'musalla', 'mussalla', 'islamic center',
    'jami', 'jamia', 'masjed', 'masjed-e', 'مسجد', 'جامع', 'مصلى', 'جماعة'
  ];

  for (const keyword of islamicKeywords) {
    if (combinedText.includes(keyword)) {
      // If it's a place_of_worship with islamic keyword, accept
      if (types.includes('place_of_worship')) {
        return { ok: true, reason: `place_of_worship + keyword: ${keyword}` };
      }
      // Or if it just has the keyword prominently
      if (name.includes(keyword)) {
        return { ok: true, reason: `name_keyword: ${keyword}` };
      }
    }
  }

  // REJECT: place_of_worship without clear islamic keyword (could be church/etc)
  if (types.includes('place_of_worship')) {
    return { ok: false, reason: 'place_of_worship without islamic keyword' };
  }

  // DEFAULT REJECT: Unknown place type
  return { ok: false, reason: 'no mosque indicators' };
}

/**
 * Multi-pass mosque search strategy
 */
async function fetchMosquesMultiPass(
  lat: number,
  lon: number,
  apiKey: string
): Promise<PlaceResult[]> {
  const allPlaces: PlaceResult[] = [];
  const seenIds = new Set<string>();

  // PASS 1: Clean mosque search (most accurate)
  try {
    if (__DEV__) {
      console.log('🔍 [GooglePlaces] Pass 1: type=mosque');
    }

    const response = await axios.get<PlacesResponse>(GOOGLE_PLACES_URL, {
      params: {
        location: `${lat},${lon}`,
        radius: 5000,
        type: 'mosque',
        language: 'en', // Use 'en' for consistent type filtering
        key: apiKey,
      },
      timeout: 10000,
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      response.data.results.forEach(place => {
        if (!seenIds.has(place.place_id)) {
          allPlaces.push(place);
          seenIds.add(place.place_id);
        }
      });

      if (__DEV__) {
        console.log(`✅ [GooglePlaces] Pass 1 found ${response.data.results.length} results`);
      }

      // If we got good results, try pagination
      if (response.data.next_page_token) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const nextResponse = await axios.get<PlacesResponse>(GOOGLE_PLACES_URL, {
            params: {
              pagetoken: response.data.next_page_token,
              key: apiKey,
            },
            timeout: 10000,
          });

          if (nextResponse.data.status === 'OK') {
            nextResponse.data.results.forEach(place => {
              if (!seenIds.has(place.place_id)) {
                allPlaces.push(place);
                seenIds.add(place.place_id);
              }
            });
            if (__DEV__) {
              console.log(`✅ [GooglePlaces] Pass 1 page 2: ${nextResponse.data.results.length} more results`);
            }
          }
        } catch (err) {
          if (__DEV__) console.warn('⚠️ Pass 1 pagination failed');
        }
      }
    } else if (__DEV__) {
      console.warn(`⚠️ [GooglePlaces] Pass 1 returned ${response.data.status}`);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('⚠️ [GooglePlaces] Pass 1 failed:', error);
    }
  }

  // PASS 2: Fallback with place_of_worship + individual keywords
  if (allPlaces.length < 3) {
    const keywords = ['mosque', 'masjid', 'islamic center', 'musalla'];

    for (const keyword of keywords) {
      try {
        if (__DEV__) {
          console.log(`🔍 [GooglePlaces] Pass 2: place_of_worship + keyword="${keyword}"`);
        }

        const response = await axios.get<PlacesResponse>(GOOGLE_PLACES_URL, {
          params: {
            location: `${lat},${lon}`,
            radius: 5000,
            type: 'place_of_worship',
            keyword: keyword,
            language: 'en',
            key: apiKey,
          },
          timeout: 10000,
        });

        if (response.data.status === 'OK') {
          let newCount = 0;
          response.data.results.forEach(place => {
            if (!seenIds.has(place.place_id)) {
              allPlaces.push(place);
              seenIds.add(place.place_id);
              newCount++;
            }
          });

          if (__DEV__ && newCount > 0) {
            console.log(`✅ [GooglePlaces] Pass 2 "${keyword}": +${newCount} new results`);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.warn(`⚠️ [GooglePlaces] Pass 2 "${keyword}" failed`);
        }
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  // PASS 3: Text search fallback (if still low results)
  if (allPlaces.length < 5) {
    const textQueries = ['mosque', 'masjid', 'islamic center'];

    for (const query of textQueries) {
      try {
        if (__DEV__) {
          console.log(`🔍 [GooglePlaces] Pass 3: textsearch="${query}"`);
        }

        const response = await axios.get<PlacesResponse>(GOOGLE_TEXTSEARCH_URL, {
          params: {
            query: query,
            location: `${lat},${lon}`,
            radius: 5000,
            key: apiKey,
          },
          timeout: 10000,
        });

        if (response.data.status === 'OK') {
          let newCount = 0;
          response.data.results.forEach(place => {
            if (!seenIds.has(place.place_id)) {
              allPlaces.push(place);
              seenIds.add(place.place_id);
              newCount++;
            }
          });

          if (__DEV__ && newCount > 0) {
            console.log(`✅ [GooglePlaces] Pass 3 "${query}": +${newCount} new results`);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.warn(`⚠️ [GooglePlaces] Pass 3 "${query}" failed`);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return allPlaces;
}

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
    // Fetch using multi-pass strategy
    const allPlaces = await fetchMosquesMultiPass(lat, lon, apiKey);

    if (__DEV__) {
      console.log(`\n📊 [GooglePlaces] Raw results: ${allPlaces.length}`);
    }

    // Filter and convert to MosqueData
    const mosques: MosqueData[] = [];
    const accepted: Array<{ name: string; types: string[]; reason: string }> = [];
    const rejected: Array<{ name: string; types: string[]; reason: string }> = [];

    allPlaces.forEach((place) => {
      const result = isLikelyMosque(place);

      if (result.ok) {
        const mosque: MosqueData = {
          id: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat,
          lon: place.geometry.location.lng,
          vicinity: place.vicinity,
          distanceMeters: calculateDistance(lat, lon, place.geometry.location.lat, place.geometry.location.lng),
        };
        mosques.push(mosque);
        accepted.push({ name: place.name, types: place.types || [], reason: result.reason });
      } else {
        rejected.push({ name: place.name, types: place.types || [], reason: result.reason });
      }
    });

    // Sort by distance
    mosques.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));

    // Dev logging
    if (__DEV__) {
      console.log(`\n✅ [GooglePlaces] Accepted: ${accepted.length}`);
      accepted.forEach(({ name, types, reason }) => {
        console.log(`  ✓ ${name} [${types.join(', ')}] → ${reason}`);
      });

      console.log(`\n❌ [GooglePlaces] Rejected: ${rejected.length}`);
      // Show first 5 rejections only
      rejected.slice(0, 5).forEach(({ name, types, reason }) => {
        console.log(`  ✗ ${name} [${types.join(', ')}] → ${reason}`);
      });
      if (rejected.length > 5) {
        console.log(`  ... and ${rejected.length - 5} more rejected`);
      }

      console.log(`\n🏁 [GooglePlaces] Final: ${mosques.length} verified mosques\n`);

      if (mosques.length === 0) {
        console.warn('⚠️ [GooglePlaces] Zero mosques after filtering. This may indicate:');
        console.warn('   - No mosques in this area');
        console.warn('   - API restrictions on your key');
        console.warn('   - Try increasing search radius');
      }
    }

    return mosques;

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
