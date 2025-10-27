/**
 * Duas Screen - دعاء
 * Islamic supplications and prayers
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { View as MotiView } from 'react-native';
import { colors, spacing, shadows } from '../utils/theme';
import { duasCategories } from '../data/duasData';

const DuasScreen = ({ navigation }) => {
  const handleCategoryPress = (category) => {
    navigation.navigate('DuasDetail', { category });
  };

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
        <Text style={styles.headerText}>الأدعية المأثورة</Text>
        <Text style={styles.subtitleText}>
          Authentic Duas from Quran & Sunnah
        </Text>

        {duasCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.8}
          >
            <MotiView style={styles.categoryCard}>
              <LinearGradient
                colors={['#ffffff', '#f8f8f8']}
                style={styles.cardGradient}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>{category.icon}</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.arabicText}>{category.title}</Text>
                  <Text style={styles.englishText}>{category.titleEn}</Text>
                  <Text style={styles.descriptionText}>
                    {category.description}
                  </Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {category.duas.length} دعاء
                    </Text>
                  </View>
                </View>
                <View style={styles.chevronContainer}>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </LinearGradient>
            </MotiView>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "ادْعُونِي أَسْتَجِبْ لَكُمْ"
          </Text>
          <Text style={styles.footerTextEn}>
            "Call upon Me; I will respond to you"
          </Text>
          <Text style={styles.footerReference}>- Surah Ghafir (40:60)</Text>
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
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  subtitleText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  categoryCard: {
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 36,
  },
  textContainer: {
    flex: 1,
  },
  arabicText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'right',
  },
  englishText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  countBadge: {
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  countText: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  chevronContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  footerText: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  footerTextEn: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  footerReference: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default DuasScreen;
