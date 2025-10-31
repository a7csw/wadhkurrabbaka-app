/**
 * Garden Screen - حديقة الذكر
 * Gamified visualization of Tasbeeh progress
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../utils/theme';
import { getGardenTrees, getTasbeehCount } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const Tree = ({ index, animDelay }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));
  const [swayAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.delay(animDelay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous sway animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 2000 + (index % 3) * 500,
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 2000 + (index % 3) * 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = swayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

  // Random positioning
  const positions = [
    { left: '10%', top: '15%' },
    { left: '30%', top: '25%' },
    { left: '70%', top: '18%' },
    { left: '15%', top: '45%' },
    { left: '55%', top: '40%' },
    { left: '80%', top: '35%' },
    { left: '25%', top: '65%' },
    { left: '65%', top: '60%' },
    { left: '45%', top: '55%' },
    { left: '85%', top: '65%' },
  ];

  const position = positions[index % positions.length];

  return (
    <Animated.View
      style={[
        styles.treeContainer,
        {
          ...position,
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { rotate },
          ],
        },
      ]}
    >
      <Text style={styles.treeIcon}>🌳</Text>
    </Animated.View>
  );
};

const FloatingParticle = ({ delay }) => {
  const [floatAnim] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, -100],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          opacity,
          transform: [{ translateY }],
          left: `${Math.random() * 90}%`,
        },
      ]}
    >
      <Text style={styles.particleText}>🌸</Text>
    </Animated.View>
  );
};

const GardenScreen = ({ navigation }) => {
  const [trees, setTrees] = useState(0);
  const [totalTasbeeh, setTotalTasbeeh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadGardenData();
  }, []);

  const loadGardenData = async () => {
    try {
      const gardenTrees = await getGardenTrees();
      const count = await getTasbeehCount();
      setTrees(gardenTrees);
      setTotalTasbeeh(count);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading garden data:', error);
      setLoading(false);
    }
  };

  const renderGarden = () => {
    if (trees === 0) {
      return (
        <Animated.View style={[styles.emptyGarden, { opacity: fadeAnim }]}>
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyTitle}>حديقتك في انتظار ذكرك</Text>
          <Text style={styles.emptyTitleEn}>Your garden awaits your dhikr</Text>
          <Text style={styles.emptyMessage}>
            ابدأ التسبيح لزراعة أشجارك 🌸
          </Text>
          <Text style={styles.emptyMessageEn}>
            Start Tasbeeh to grow your trees
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.goBack()}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.startGradient}
            >
              <Text style={styles.startButtonText}>ابدأ التسبيح</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <View style={styles.gardenContainer}>
        {/* Render trees */}
        {Array.from({ length: Math.min(trees, 30) }).map((_, index) => (
          <Tree key={index} index={index} animDelay={index * 100} />
        ))}
        
        {/* Floating particles */}
        {Array.from({ length: 5 }).map((_, index) => (
          <FloatingParticle key={`particle-${index}`} delay={index * 1000} />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sky gradient */}
      <LinearGradient
        colors={['#87CEEB', '#B0E0E6', '#E8F5E9']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Stats Header */}
      <LinearGradient
        colors={['rgba(11,61,46,0.9)', 'rgba(20,90,50,0.8)']}
        style={styles.statsHeader}
      >
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="tree" size={28} color="#FFD700" />
          <Text style={styles.statValue}>{trees}</Text>
          <Text style={styles.statLabel}>شجرة</Text>
          <Text style={styles.statLabelEn}>Trees</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="counter" size={28} color="#FFD700" />
          <Text style={styles.statValue}>{totalTasbeeh}</Text>
          <Text style={styles.statLabel}>تسبيحة</Text>
          <Text style={styles.statLabelEn}>Total Tasbeeh</Text>
        </View>
      </LinearGradient>

      {/* Garden View */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🌱 Loading your garden...</Text>
          </View>
        ) : (
          renderGarden()
        )}
      </ScrollView>

      {/* Ground layer */}
      <View style={styles.ground}>
        <LinearGradient
          colors={['rgba(139,90,43,0.3)', 'rgba(101,67,33,0.5)']}
          style={styles.groundGradient}
        />
        <View style={styles.grassLine}>
          <Text style={styles.grass}>🌿</Text>
          <Text style={styles.grass}>🌿</Text>
          <Text style={styles.grass}>🌾</Text>
          <Text style={styles.grass}>🌿</Text>
          <Text style={styles.grass}>🌿</Text>
          <Text style={styles.grass}>🌾</Text>
          <Text style={styles.grass}>🌿</Text>
        </View>
      </View>

      {/* Achievement badges */}
      {trees >= 10 && (
        <View style={styles.achievementBadge}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.badgeGradient}
          >
            <MaterialCommunityIcons name="trophy" size={20} color="#fff" />
            <Text style={styles.badgeText}>حديقة مُزهِرة!</Text>
          </LinearGradient>
        </View>
      )}

      {trees >= 50 && (
        <View style={[styles.achievementBadge, { top: 130 }]}>
          <LinearGradient
            colors={['#34A853', '#0F9D58']}
            style={styles.badgeGradient}
          >
            <MaterialCommunityIcons name="star" size={20} color="#fff" />
            <Text style={styles.badgeText}>غابة مباركة!</Text>
          </LinearGradient>
        </View>
      )}

      {/* Bottom message */}
      <View style={styles.bottomMessage}>
        <Text style={styles.bottomMessageText}>
          كل شجرة = 33 تسبيحة مكتملة ✨
        </Text>
        <Text style={styles.bottomMessageTextEn}>
          Each tree = 33 completed Tasbeeh
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Stats Header
  statsHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...shadows.large,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  statLabelEn: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 2,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.md,
  },

  // Garden Container
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gardenContainer: {
    flex: 1,
    position: 'relative',
    minHeight: height - 250,
  },

  // Tree
  treeContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  treeIcon: {
    fontSize: 48,
  },

  // Floating Particles
  particle: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  particleText: {
    fontSize: 20,
  },

  // Empty State
  emptyGarden: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: height * 0.1,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0B3D2E',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitleEn: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  emptyMessage: {
    fontSize: 18,
    color: '#34A853',
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  emptyMessageEn: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: spacing.lg,
    ...shadows.large,
  },
  startGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl * 2,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Ground
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  groundGradient: {
    flex: 1,
  },
  grassLine: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  grass: {
    fontSize: 24,
  },

  // Achievement Badges
  achievementBadge: {
    position: 'absolute',
    top: 100,
    right: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.large,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Bottom Message
  bottomMessage: {
    position: 'absolute',
    bottom: 90,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.medium,
  },
  bottomMessageText: {
    fontSize: 14,
    color: '#0B3D2E',
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomMessageTextEn: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.3,
  },
  loadingText: {
    fontSize: 18,
    color: '#0B3D2E',
    fontWeight: '600',
  },
});

export default GardenScreen;

