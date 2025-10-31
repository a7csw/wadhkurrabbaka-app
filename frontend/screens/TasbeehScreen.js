/**
 * Tasbeeh Counter Screen - التسبيح
 * Refined elegant UI with Garden gamification
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

const { width } = Dimensions.get('window');

const TasbeehScreen = ({ navigation }) => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [dhikrText, setDhikrText] = useState('لَا إِلٰهَ إِلَّا اللَّهُ');
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDhikrText, setTempDhikrText] = useState('');
  const [completedCycles, setCompletedCycles] = useState(0);
  const [gardenTrees, setGardenTrees] = useState(0);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

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
  }, [count, target]);

  const loadData = async () => {
    const savedCount = await getTasbeehCount();
    const savedText = await getTasbeehText();
    const trees = await getGardenTrees();
    setCount(savedCount);
    setDhikrText(savedText);
    setGardenTrees(trees);
    setCompletedCycles(Math.floor(savedCount / target));
  };

  const handleIncrement = async () => {
    const newCount = count + 1;
    setCount(newCount);
    
    // Pulse animation on tap
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
    if (newCount % target === 0 && newCount > 0) {
      const newTrees = gardenTrees + 1;
      setGardenTrees(newTrees);
      await saveGardenTrees(newTrees);
      
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

  const progress = (count % target) / target;
  const currentCycle = count % target;

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

        {/* Main Counter with Glowing Ring */}
        <View style={styles.counterSection}>
          {/* Glowing outer ring */}
          <View style={[styles.glowRing, { opacity: 0.3 }]} />
          <View style={[styles.glowRing, { opacity: 0.2, transform: [{ scale: 1.1 }] }]} />
          
          {/* Progress ring */}
          <Animated.View 
            style={[
              styles.progressRing,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${progress * 100}%`,
                  }
                ]} 
              />
            </View>
          </Animated.View>

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

        {/* Main Tasbeeh Button */}
        <TouchableOpacity
          style={styles.tasbeehButton}
          onPress={handleIncrement}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            style={styles.tasbeehGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="hand-pointing-up" size={32} color="#fff" />
            <Text style={styles.tasbeehText}>اضغط للتسبيح</Text>
            <Text style={styles.tasbeehSubtext}>Press to Tasbeeh</Text>
          </LinearGradient>
        </TouchableOpacity>

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
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
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
  glowRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  progressRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
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
    marginBottom: spacing.xl,
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

  // Tasbeeh Button
  tasbeehButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.large,
  },
  tasbeehGradient: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tasbeehText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  tasbeehSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },

  // Reset Button
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: spacing.md,
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
