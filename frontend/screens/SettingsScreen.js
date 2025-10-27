/**
 * Settings Screen - الإعدادات
 * App settings and preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, shadows } from '../utils/theme';
import {
  getNotificationsEnabled,
  saveNotificationsEnabled,
  getLocationEnabled,
  saveLocationEnabled,
  resetTasbeehCount,
  getPrayerCalculationMethod,
  savePrayerCalculationMethod,
} from '../utils/storage';
import {
  scheduleAllAdhkarNotifications,
  cancelAllNotifications,
} from '../utils/notificationsUtils';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [calculationMethod, setCalculationMethod] = useState('2');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const notifications = await getNotificationsEnabled();
    const location = await getLocationEnabled();
    const method = await getPrayerCalculationMethod();
    
    setNotificationsEnabled(notifications);
    setLocationEnabled(location);
    setCalculationMethod(method);
  };

  const handleNotificationsToggle = async (value) => {
    setNotificationsEnabled(value);
    await saveNotificationsEnabled(value);

    if (value) {
      await scheduleAllAdhkarNotifications();
      Alert.alert('تم', 'تم تفعيل التنبيهات بنجاح');
    } else {
      await cancelAllNotifications();
      Alert.alert('تم', 'تم إيقاف التنبيهات');
    }
  };

  const handleLocationToggle = async (value) => {
    setLocationEnabled(value);
    await saveLocationEnabled(value);
    Alert.alert(
      value ? 'تم' : 'تنبيه',
      value
        ? 'تم تفعيل خدمات الموقع'
        : 'لن يتمكن التطبيق من عرض أوقات الصلاة واتجاه القبلة'
    );
  };

  const handleResetTasbeeh = () => {
    Alert.alert(
      'إعادة تعيين',
      'هل تريد إعادة تعيين عداد التسبيح؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: async () => {
            await resetTasbeehCount();
            Alert.alert('تم', 'تم إعادة تعيين عداد التسبيح');
          },
        },
      ]
    );
  };

  const calculationMethods = [
    { id: '1', name: 'Muslim World League (MWL)' },
    { id: '2', name: 'Islamic Society of North America (ISNA)' },
    { id: '3', name: 'Egyptian General Authority' },
    { id: '4', name: 'Umm Al-Qura University, Makkah' },
    { id: '5', name: 'University of Islamic Sciences, Karachi' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundLight, colors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الإعدادات</Text>
          <Text style={styles.headerSubtitle}>Settings & Preferences</Text>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 التنبيهات</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>تفعيل التنبيهات</Text>
              <Text style={styles.settingDescription}>
                تنبيهات لأوقات الأذكار والصلاة
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.textSecondary, true: colors.primary }}
              thumbColor={'#ffffff'}
            />
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 الموقع</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>السماح بالوصول للموقع</Text>
              <Text style={styles.settingDescription}>
                لعرض أوقات الصلاة واتجاه القبلة
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: colors.textSecondary, true: colors.primary }}
              thumbColor={'#ffffff'}
            />
          </View>
        </View>

        {/* Prayer Calculation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕌 حساب أوقات الصلاة</Text>
          
          <View style={styles.methodsList}>
            {calculationMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodItem,
                  calculationMethod === method.id && styles.methodItemActive,
                ]}
                onPress={async () => {
                  setCalculationMethod(method.id);
                  await savePrayerCalculationMethod(method.id);
                  Alert.alert('تم', 'تم تغيير طريقة الحساب');
                }}
              >
                <View
                  style={[
                    styles.radio,
                    calculationMethod === method.id && styles.radioActive,
                  ]}
                >
                  {calculationMethod === method.id && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.methodText,
                    calculationMethod === method.id && styles.methodTextActive,
                  ]}
                >
                  {method.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tasbeeh Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📿 التسبيح</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleResetTasbeeh}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonIcon}>🔄</Text>
            <Text style={styles.actionButtonText}>إعادة تعيين العداد</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ معلومات التطبيق</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>اسم التطبيق:</Text>
              <Text style={styles.infoValue}>وَاذْكُر رَبَّكَ</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الإصدار:</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>المطور:</Text>
              <Text style={styles.infoValue}>Wadhkurrabbaka Team</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "وَاذْكُر رَّبَّكَ فِي نَفْسِكَ تَضَرُّعًا وَخِيفَةً"
          </Text>
          <Text style={styles.footerTextEn}>
            "And remember your Lord within yourself in humility and in fear"
          </Text>
          <Text style={styles.footerReference}>- Surah Al-A'raf (7:205)</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  methodsList: {
    marginTop: spacing.sm,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  methodItemActive: {
    backgroundColor: colors.primary + '15',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  methodText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  methodTextActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    ...shadows.small,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  footerText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    lineHeight: 26,
  },
  footerTextEn: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  footerReference: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default SettingsScreen;
