import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import { Magnetometer, DeviceMotion } from 'expo-sensors';
import { Platform } from 'react-native';
import { bearingToKaaba, distanceToKaaba, smooth, normalizeRotation } from '../utils/qibla';

interface CompassData {
  qiblaDirection: number | null;  // Bearing to Kaaba from current location
  deviceHeading: number | null;   // Device compass heading
  pointerRotation: number | null; // Rotation angle for the pointer
  distance: number | null;        // Distance to Kaaba in km
  location: { lat: number; lon: number } | null;
  error: string | null;
  needsCalibration: boolean;
}

const THROTTLE_MS = 100; // Update rate ~10Hz
const CALIBRATION_THRESHOLD = 25; // Degrees variance
const CALIBRATION_WINDOW = 2000; // 2 seconds

export function useCompass(): CompassData {
  const [data, setData] = useState<CompassData>({
    qiblaDirection: null,
    deviceHeading: null,
    pointerRotation: null,
    distance: null,
    location: null,
    error: null,
    needsCalibration: false,
  });

  const smoothedHeading = useRef<number | null>(null);
  const headingHistory = useRef<number[]>([]);
  const lastUpdate = useRef<number>(0);
  const magnetometerSub = useRef<any>(null);
  const deviceMotionSub = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const checkCalibration = () => {
      if (headingHistory.current.length < 10) return false;
      
      const recent = headingHistory.current.slice(-10);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const variance = Math.max(...recent.map(h => Math.abs(h - avg)));
      
      return variance > CALIBRATION_THRESHOLD;
    };

    const updateHeading = (heading: number) => {
      const now = Date.now();
      if (now - lastUpdate.current < THROTTLE_MS) return;
      lastUpdate.current = now;

      smoothedHeading.current = smooth(smoothedHeading.current, heading, 0.15);
      headingHistory.current.push(heading);
      if (headingHistory.current.length > 20) {
        headingHistory.current.shift();
      }

      if (mounted && data.location) {
        const qiblaDir = bearingToKaaba(data.location.lat, data.location.lon);
        const rotation = normalizeRotation(qiblaDir - smoothedHeading.current);
        
        setData(prev => ({
          ...prev,
          deviceHeading: smoothedHeading.current,
          qiblaDirection: qiblaDir,
          pointerRotation: rotation,
          needsCalibration: checkCalibration(),
        }));
      }
    };

    const setupLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setData(prev => ({ ...prev, error: 'Location permission required' }));
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude: lat, longitude: lon } = location.coords;
        const distance = distanceToKaaba(lat, lon);
        const qiblaDir = bearingToKaaba(lat, lon);

        if (mounted) {
          setData(prev => ({
            ...prev,
            location: { lat, lon },
            distance,
            qiblaDirection: qiblaDir,
            error: null,
          }));
        }
      } catch (error) {
        if (mounted) {
          setData(prev => ({ ...prev, error: 'Failed to get location' }));
        }
      }
    };

    const setupSensors = async () => {
      try {
        // Check sensor availability
        const magnetometerAvailable = await Magnetometer.isAvailableAsync();
        const deviceMotionAvailable = await DeviceMotion.isAvailableAsync();

        if (!magnetometerAvailable && !deviceMotionAvailable) {
          setData(prev => ({ ...prev, error: 'Compass not available on this device' }));
          return;
        }

        // Prefer DeviceMotion on iOS for true heading
        if (Platform.OS === 'ios' && deviceMotionAvailable) {
          DeviceMotion.setUpdateInterval(THROTTLE_MS);
          
          deviceMotionSub.current = DeviceMotion.addListener((motion) => {
            if (motion.orientation) {
              // DeviceMotion provides heading in radians, convert to degrees
              const heading = motion.orientation.gamma ? 
                (motion.orientation.gamma * 180 / Math.PI + 360) % 360 : 0;
              updateHeading(heading);
            }
          });
        } else if (magnetometerAvailable) {
          // Fallback to magnetometer
          Magnetometer.setUpdateInterval(THROTTLE_MS);
          
          magnetometerSub.current = Magnetometer.addListener((magnetometer) => {
            const { x, y } = magnetometer;
            // Calculate magnetic heading
            let heading = Math.atan2(-x, y) * 180 / Math.PI;
            heading = (heading + 360) % 360;
            updateHeading(heading);
          });
        }
      } catch (error) {
        if (mounted) {
          setData(prev => ({ ...prev, error: 'Failed to access compass sensors' }));
        }
      }
    };

    setupLocation();
    setupSensors();

    return () => {
      mounted = false;
      magnetometerSub.current?.remove();
      deviceMotionSub.current?.remove();
    };
  }, []);

  return data;
}



