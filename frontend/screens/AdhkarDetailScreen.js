/**
 * Adhkar Detail Screen
 * Shows individual Adhkar with Arabic text, translation, and reference
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, shadows } from '../utils/theme';
import {
  addFavoriteAdhkar,
  removeFavoriteAdhkar,
  getFavoriteAdhkar,
} from '../utils/storage';

const AdhkarDetailScreen = ({ route }) => {
  const { category } = route.params;
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const favs = await getFavoriteAdhkar();
    setFavorites(favs);
  };

  const isFavorite = (adhkarId) => {
    return favorites.includes(adhkarId);
  };

  const toggleFavorite = async (adhkarId) => {
    if (isFavorite(adhkarId)) {
      await removeFavoriteAdhkar(adhkarId);
      setFavorites(favorites.filter((id) => id !== adhkarId));
      Alert.alert('تم', 'تم إزالة من المفضلة');
    } else {
      await addFavoriteAdhkar(adhkarId);
      setFavorites([...favorites, adhkarId]);
      Alert.alert('تم', 'تمت الإضافة إلى المفضلة');
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('تم النسخ', 'تم نسخ النص إلى الحافظة');
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
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{category.icon}</Text>
          <Text style={styles.headerTitle}>{category.title}</Text>
          <Text style={styles.headerSubtitle}>{category.titleEn}</Text>
          <Text style={styles.headerDescription}>{category.description}</Text>
        </View>

        {category.adhkar.map((adhkar, index) => (
          <View key={adhkar.id} style={styles.adhkarCard}>
            <LinearGradient
              colors={['#ffffff', '#fafafa']}
              style={styles.cardGradient}
            >
              {/* Adhkar Number */}
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>

              {/* Arabic Text */}
              <View style={styles.arabicContainer}>
                <Text style={styles.arabicText}>{adhkar.arabic}</Text>
              </View>

              {/* Translation */}
              <View style={styles.translationContainer}>
                <Text style={styles.translationLabel}>Translation:</Text>
                <Text style={styles.translationText}>{adhkar.translation}</Text>
              </View>

              {/* Reference */}
              <View style={styles.referenceContainer}>
                <Text style={styles.referenceLabel}>Reference:</Text>
                <Text style={styles.referenceText}>{adhkar.reference}</Text>
              </View>

              {/* Count Badge */}
              {adhkar.count && adhkar.count > 1 && (
                <View style={styles.countContainer}>
                  <Text style={styles.countLabel}>Repeat:</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{adhkar.count}x</Text>
                  </View>
                </View>
              )}

              {/* Reward */}
              {adhkar.reward && (
                <View style={styles.rewardContainer}>
                  <Text style={styles.rewardLabel}>🌟 Reward:</Text>
                  <Text style={styles.rewardText}>{adhkar.reward}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    isFavorite(adhkar.id) && styles.favoriteActive,
                  ]}
                  onPress={() => toggleFavorite(adhkar.id)}
                >
                  <Text style={styles.actionIcon}>
                    {isFavorite(adhkar.id) ? '❤️' : '🤍'}
                  </Text>
                  <Text style={styles.actionText}>
                    {isFavorite(adhkar.id) ? 'Favorited' : 'Favorite'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    copyToClipboard(`${adhkar.arabic}\n\n${adhkar.translation}`)
                  }
                >
                  <Text style={styles.actionIcon}>📋</Text>
                  <Text style={styles.actionText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا"
          </Text>
          <Text style={styles.footerTextEn}>
            "Remember Allah with much remembrance"
          </Text>
          <Text style={styles.footerReference}>- Surah Al-Ahzab (33:41)</Text>
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
    padding: spacing.lg,
    backgroundColor: colors.primary + '10',
    borderRadius: 16,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  headerDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  adhkarCard: {
    borderRadius: 16,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  cardGradient: {
    padding: spacing.md,
  },
  numberBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  numberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  arabicContainer: {
    backgroundColor: colors.primary + '08',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderRightWidth: 4,
    borderRightColor: colors.secondary,
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 40,
    color: colors.primary,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  translationContainer: {
    marginBottom: spacing.md,
  },
  translationLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  translationText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    fontStyle: 'italic',
  },
  referenceContainer: {
    marginBottom: spacing.sm,
  },
  referenceLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  referenceText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  countLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  countBadge: {
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  rewardContainer: {
    backgroundColor: colors.secondary + '10',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  rewardLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  rewardText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    ...shadows.small,
  },
  favoriteActive: {
    backgroundColor: colors.secondary + '20',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
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

export default AdhkarDetailScreen;

