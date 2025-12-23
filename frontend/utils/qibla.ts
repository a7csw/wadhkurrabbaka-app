export const KAABA = { lat: 21.422487, lon: 39.826206 };

/**
 * Calculate initial bearing from point A to B (degrees 0..360)
 * Uses the forward azimuth formula
 */
export function bearingToKaaba(lat: number, lon: number): number {
  const φ1 = lat * Math.PI / 180;
  const φ2 = KAABA.lat * Math.PI / 180;
  const Δλ = (KAABA.lon - lon) * Math.PI / 180;
  
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x) * 180 / Math.PI;
  
  return (θ + 360) % 360;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function distanceToKaaba(lat: number, lon: number): number {
  const R = 6371; // Earth's radius in km
  const φ1 = lat * Math.PI / 180;
  const φ2 = KAABA.lat * Math.PI / 180;
  const Δφ = (KAABA.lat - lat) * Math.PI / 180;
  const Δλ = (KAABA.lon - lon) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Low-pass filter for smoothing compass readings
 * @param prev Previous value (null for first reading)
 * @param next New value
 * @param a Smoothing factor (0-1, lower = smoother)
 */
export const smooth = (prev: number | null, next: number, a = 0.1): number => 
  prev == null ? next : prev + (next - prev) * a;

/**
 * Normalize angle to -180..180 range for rotation
 */
export function normalizeRotation(angle: number): number {
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  return angle;
}



