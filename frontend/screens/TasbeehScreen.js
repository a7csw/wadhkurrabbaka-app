/**
 * Tasbeeh Counter Screen - التسبيح
 * Full-screen tap interface with haptic feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  Alert,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, shadows } from '../utils/theme';
import {
  getTasbeehCount,
  saveTasbeehCount,
  resetTasbeehCount,
  getTasbeehText,
  saveTasbeehText,
  getGardenTrees,
  saveGardenTrees,
} from '../utils/storage';

const { width, height } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TasbeehScreen = ({ navigation }) => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [dhikrText, setDhikrText] = useState('لَا إِلٰهَ إِلَّا اللَّهُ');
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDhikrText, setTempDhikrText] = useState('');
  const [completedCycles, setCompletedCycles] = useState(0);
  const [gardenTrees, setGardenTrees] = useState(0);
  const [touchCount, setTouchCount] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Refs for gesture detection
  const longPressTimer = useRef(null);
  const lastTapTime = useRef(0);

  useEffect(() => {
    loadData();
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    saveTasbeehCount(count);
    const cycles = Math.floor(count / target);
    setCompletedCycles(cycles);
    
    // Animate progress
    const progress = (count % target) / target;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [count, target]);

  const loadData = async () => {
    const savedCount = await getTasbeehCount();
    const savedText = await getTasbeehText();
    const trees = await getGardenTrees();
    setCount(savedCount);
    setDhikrText(savedText);
    setGardenTrees(trees);
    setCompletedCycles(Math.floor(savedCount / target));
    
    // Set initial progress
    const progress = (savedCount % target) / target;
    progressAnim.setValue(progress);
  };

  const showRipple = () => {
    rippleAnim.setValue(0);
    rippleOpacity.setValue(1);
    
    Animated.parallel([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const performIncrement = async (incrementValue = 1) => {
    const newCount = Math.max(0, count + incrementValue);
    setCount(newCount);
    
    // Haptic feedback
    if (incrementValue > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    // Show ripple animation
    showRipple();
    
    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if cycle completed
    if (incrementValue > 0 && newCount % target === 0 && newCount > 0) {
      const newTrees = gardenTrees + 1;
      setGardenTrees(newTrees);
      await saveGardenTrees(newTrees);
      
      // Stronger haptic for completion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Celebrate cycle completion
      Alert.alert(
        '🌳 مبارك!',
        `أكملت ${Math.floor(newCount / target)} دورة من التسبيح!\nزُرِعَت شجرة جديدة في حديقتك 🌿`,
        [
          { text: 'شاهد الحديقة', onPress: () => navigation.navigate('Garden') },
          { text: 'استمر', style: 'cancel' },
        ]
      );
    }
  };

  const handlePressIn = (event) => {
    const touches = event.nativeEvent.touches || [];
    setTouchCount(touches.length);
    
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      performIncrement(5); // Long press adds 5
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 500);
  };

  const handlePressOut = () => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Check if it was a quick tap
    const now = Date.now();
    if (now - lastTapTime.current < 500) {
      // Quick tap
      if (touchCount === 2) {
        // Two finger tap - decrement
        performIncrement(-1);
      } else if (touchCount === 1) {
        // Single tap - increment
        performIncrement(1);
      }
    }
    lastTapTime.current = now;
    setTouchCount(0);
  };

  const handleReset = () => {
    Alert.alert(
      'إعادة تعيين العداد',
      'هل تريد إعادة تعيين العداد إلى الصفر؟\n(ستبقى الأشجار في حديقتك)',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: async () => {
            await resetTasbeehCount();
            setCount(0);
            setCompletedCycles(0);
            progressAnim.setValue(0);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const handleChangeDhikr = () => {
    setTempDhikrText(dhikrText);
    setModalVisible(true);
  };

  const saveDhikr = async () => {
    if (tempDhikrText.trim()) {
      setDhikrText(tempDhikrText);
      await saveTasbeehText(tempDhikrText);
      setModalVisible(false);
    }
  };

  const currentCycle = count % target;
  const circumference = 2 * Math.PI * 90;

  const commonDhikr = [
    { text: 'سُبْحَانَ اللَّهِ', translation: 'Glory be to Allah' },
    { text: 'الْحَمْدُ لِلَّهِ', translation: 'All praise is due to Allah' },
    { text: 'اللَّهُ أَكْبَرُ', translation: 'Allah is the Greatest' },
    { text: 'لَا إِلٰهَ إِلَّا اللَّهُ', translation: 'There is no god but Allah' },
    { text: 'أَسْتَغْفِرُ اللَّهَ', translation: 'I seek forgiveness from Allah' },
    { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translation: 'No power except with Allah' },
    { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translation: 'Glory be to Allah and praise Him' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B3D2E', '#145A32', '#1E6F50']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Full Screen Pressable Area */}
      <Pressable
        style={styles.fullScreenPressable}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_disableSound={true}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Tasbeeh counter"
        accessibilityHint="Double-tap to increment tasbeeh. Long press to add 5. Two-finger tap to undo."
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Dhikr Text Card */}
          <TouchableOpacity
            style={styles.dhikrCard}
            onPress={handleChangeDhikr}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.08)']}
              style={styles.dhikrGradient}
            >
              <Text style={styles.dhikrText}>{dhikrText}</Text>
              <View style={styles.changeTextContainer}>
                <MaterialCommunityIcons name="pencil" size={14} color="#FFD700" />
                <Text style={styles.changeText}>اضغط للتغيير</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Main Counter with Progress Ring */}
          <View style={styles.counterSection}>
            {/* Ripple Effect */}
            <Animated.View
              style={[
                styles.ripple,
                {
                  opacity: rippleOpacity,
                  transform: [
                    {
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 2],
                      }),
                    },
                  ],
                },
              ]}
            />
            
            {/* Progress SVG Ring */}
            <Svg width={240} height={240} style={styles.progressSvg}>
              <Circle
                cx={120}
                cy={120}
                r={90}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={8}
                fill="none"
              />
              <AnimatedCircle
                cx={120}
                cy={120}
                r={90}
                stroke="#FFD700"
                strokeWidth={8}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [circumference, 0],
                })}
                strokeLinecap="round"
                transform="rotate(-90 120 120)"
              />
            </Svg>

            {/* Counter circle */}
            <Animated.View 
              style={[
                styles.counterCircle,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.counterGradient}
              >
                <Text style={styles.counterText}>{count}</Text>
                <Text style={styles.counterLabel}>تسبيحة</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Cycle Info Cards */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>الدورة الحالية</Text>
              <Text style={styles.infoValue}>{currentCycle} / {target}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>الدورات المكتملة</Text>
              <Text style={styles.infoValue}>{completedCycles}</Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              اضغط في أي مكان للتسبيح • اضغط مطولاً لإضافة 5 • لمسة بإصبعين للتراجع
            </Text>
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.resetText}>إعادة تعيين</Text>
          </TouchableOpacity>

          {/* Motivational Hadith */}
          <Animated.View style={[styles.hadithCard, { opacity: fadeAnim }]}>
            <Text style={styles.hadithText}>
              "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ"
            </Text>
            <Text style={styles.hadithTranslation}>
              "Two words that are light on the tongue, heavy on the Scale"
            </Text>
            <Text style={styles.hadithReference}>— Sahih Bukhari</Text>
          </Animated.View>
        </Animated.View>
      </Pressable>

      {/* Floating Garden Button */}
      <TouchableOpacity
        style={styles.gardenButton}
        onPress={() => navigation.navigate('Garden')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#34A853', '#0F9D58']}
          style={styles.gardenGradient}
        >
          <MaterialCommunityIcons name="tree" size={24} color="#fff" />
          <Text style={styles.gardenButtonText}>حديقتك</Text>
          {gardenTrees > 0 && (
            <View style={styles.treeBadge}>
              <Text style={styles.treeBadgeText}>{gardenTrees}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Dhikr Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>اختر الذكر</Text>
            <Text style={styles.modalSubtitle}>Choose Your Dhikr</Text>
            
            {/* Common Dhikr */}
            {commonDhikr.map((dhikr, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dhikrOption}
                onPress={() => {
                  setTempDhikrText(dhikr.text);
                  setDhikrText(dhikr.text);
                  saveTasbeehText(dhikr.text);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.dhikrOptionText}>{dhikr.text}</Text>
                <Text style={styles.dhikrOptionTranslation}>{dhikr.translation}</Text>
              </TouchableOpacity>
            ))}

            {/* Custom Input */}
            <View style={styles.customInputContainer}>
              <Text style={styles.customLabel}>أو اكتب ذكراً آخر:</Text>
              <TextInput
                style={styles.customInput}
                value={tempDhikrText}
                onChangeText={setTempDhikrText}
                placeholder="اكتب هنا..."
                placeholderTextColor="#999"
                textAlign="right"
              />
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveDhikr}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                  حفظ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreenPressable: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl * 2,
    paddingBottom: 100, // Space for garden button
  },
  
  // Dhikr Card
  dhikrCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.large,
  },
  dhikrGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  dhikrText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  changeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeText: {
    fontSize: 13,
    color: '#FFD700',
    fontStyle: 'italic',
  },

  // Counter Section
  counterSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
    height: 280,
  },
  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFD700',
  },
  progressSvg: {
    position: 'absolute',
  },
  counterCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    ...shadows.large,
  },
  counterGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 68,
    fontWeight: 'bold',
    color: '#fff',
  },
  counterLabel: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: spacing.xs,
  },

  // Info Cards
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.medium,
  },
  infoLabel: {
    fontSize: 12,
    color: '#FFD700',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Instructions
  instructions: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  instructionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Reset Button
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // Hadith Card
  hadithCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  hadithText: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  hadithTranslation: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  hadithReference: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },

  // Floating Garden Button
  gardenButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    borderRadius: 30,
    overflow: 'hidden',
    ...shadows.large,
    elevation: 8,
  },
  gardenGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  gardenButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  treeBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: spacing.xs,
  },
  treeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#34A853',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#E8F5E9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0B3D2E',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dhikrOption: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
    ...shadows.small,
  },
  dhikrOptionText: {
    fontSize: 18,
    color: '#0B3D2E',
    textAlign: 'right',
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  dhikrOptionTranslation: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  customInputContainer: {
    marginTop: spacing.md,
  },
  customLabel: {
    fontSize: 14,
    color: '#0B3D2E',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  customInput: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 12,
    fontSize: 16,
    color: '#0B3D2E',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    borderRadius: 16,
    ...shadows.small,
  },
  saveButton: {
    backgroundColor: '#0B3D2E',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#0B3D2E',
    textAlign: 'center',
    fontWeight: '700',
  },
  saveButtonText: {
    color: '#fff',
  },
});

export default TasbeehScreen;