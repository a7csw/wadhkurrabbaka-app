/**
 * Tasbeeh Counter Screen - التسبيح
 * Digital Tasbeeh counter with AsyncStorage persistence
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, shadows } from '../utils/theme';
import {
  getTasbeehCount,
  saveTasbeehCount,
  resetTasbeehCount,
  getTasbeehText,
  saveTasbeehText,
} from '../utils/storage';

const TasbeehScreen = () => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [dhikrText, setDhikrText] = useState('سُبْحَانَ اللهِ');
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDhikrText, setTempDhikrText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveTasbeehCount(count);
  }, [count]);

  const loadData = async () => {
    const savedCount = await getTasbeehCount();
    const savedText = await getTasbeehText();
    setCount(savedCount);
    setDhikrText(savedText);
  };

  const handleIncrement = () => {
    setCount(count + 1);
  };

  const handleReset = () => {
    Alert.alert(
      'إعادة تعيين',
      'هل تريد إعادة تعيين العداد إلى الصفر؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: async () => {
            await resetTasbeehCount();
            setCount(0);
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

  const commonDhikr = [
    'سُبْحَانَ اللهِ',
    'الْحَمْدُ للهِ',
    'اللهُ أَكْبَرُ',
    'لاَ إِلَهَ إِلاَّ اللهُ',
    'أَسْتَغْفِرُ اللهَ',
    'لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ',
    'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>تسبيح</Text>
          <Text style={styles.headerSubtitle}>Digital Tasbeeh Counter</Text>
        </View>

        {/* Dhikr Text */}
        <TouchableOpacity
          style={styles.dhikrContainer}
          onPress={handleChangeDhikr}
          activeOpacity={0.8}
        >
          <Text style={styles.dhikrText}>{dhikrText}</Text>
          <Text style={styles.changeText}>اضغط للتغيير</Text>
        </TouchableOpacity>

        {/* Counter Display */}
        <View style={styles.counterContainer}>
          <View style={styles.counterCircle}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.counterGradient}
            >
              <Text style={styles.counterText}>{count}</Text>
              <Text style={styles.counterLabel}>times</Text>
            </LinearGradient>
          </View>

          {/* Progress Ring */}
          <View style={styles.progressRing}>
            <View
              style={[
                styles.progressFill,
                {
                  transform: [{ rotate: `${progress * 360}deg` }],
                },
              ]}
            />
          </View>
        </View>

        {/* Target Display */}
        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>Current Cycle:</Text>
          <Text style={styles.targetText}>
            {count % target} / {target}
          </Text>
          <Text style={styles.cycleText}>
            Completed Cycles: {Math.floor(count / target)}
          </Text>
        </View>

        {/* Increment Button */}
        <TouchableOpacity
          style={styles.incrementButton}
          onPress={handleIncrement}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.secondary, colors.secondaryDark || colors.secondary]}
            style={styles.incrementGradient}
          >
            <Text style={styles.incrementText}>+</Text>
            <Text style={styles.incrementLabel}>اضغط للتسبيح</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={styles.resetIcon}>🔄</Text>
          <Text style={styles.resetText}>إعادة تعيين</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "وَاذْكُرِ اسْمَ رَبِّكَ وَتَبَتَّلْ إِلَيْهِ تَبْتِيلًا"
          </Text>
          <Text style={styles.footerTextEn}>
            "And remember the name of your Lord"
          </Text>
        </View>
      </View>

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
            
            {/* Common Dhikr */}
            {commonDhikr.map((dhikr, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dhikrOption}
                onPress={() => {
                  setTempDhikrText(dhikr);
                  setDhikrText(dhikr);
                  saveTasbeehText(dhikr);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.dhikrOptionText}>{dhikr}</Text>
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
                placeholderTextColor={colors.textSecondary}
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
    justifyContent: 'space-around',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.secondary,
  },
  dhikrContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.medium,
  },
  dhikrText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  changeText: {
    fontSize: 12,
    color: colors.secondary,
    fontStyle: 'italic',
  },
  counterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
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
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  counterLabel: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  progressRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    width: '50%',
    height: '100%',
    backgroundColor: colors.secondary,
  },
  targetContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  targetText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.sm,
  },
  cycleText: {
    fontSize: 13,
    color: '#ffffff',
  },
  incrementButton: {
    borderRadius: 80,
    overflow: 'hidden',
    ...shadows.large,
  },
  incrementGradient: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  incrementLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: spacing.xs,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: spacing.md,
    borderRadius: 12,
  },
  resetIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  resetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  footerTextEn: {
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dhikrOption: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  dhikrOptionText: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  customInputContainer: {
    marginTop: spacing.md,
  },
  customLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  customInput: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginHorizontal: spacing.xs,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#ffffff',
  },
});

export default TasbeehScreen;
