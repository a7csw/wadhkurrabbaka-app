/**
 * Duas Detail Screen
 * Shows individual Duas with Arabic text, translation, and reference
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
  addFavoriteDua,
  removeFavoriteDua,
  getFavoriteDuas,
} from '../utils/storage';

const DuasDetailScreen = ({ route }) => {
  const { category } = route.params;
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const favs = await getFavoriteDuas();
    setFavorites(favs);
  };

  const isFavorite = (duaId) => {
    return favorites.includes(duaId);
  };

  const toggleFavorite = async (duaId) => {
    if (isFavorite(duaId)) {
      await removeFavoriteDua(duaId);
      setFavorites(favorites.filter((id) => id !== duaId));
      Alert.alert('تم', 'تم إزالة من المفضلة');
    } else {
      await addFavoriteDua(duaId);
      setFavorites([...favorites, duaId]);
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

        {category.duas.map((dua, index) => (
          <View key={dua.id} style={styles.duaCard}>
            <LinearGradient
              colors={['#ffffff', '#fafafa']}
              style={styles.cardGradient}
            >
              {/* Dua Number */}
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>

              {/* Arabic Text */}
              <View style={styles.arabicContainer}>
                <Text style={styles.arabicText}>{dua.arabic}</Text>
              </View>

              {/* Translation */}
              <View style={styles.translationContainer}>
                <Text style={styles.translationLabel}>Translation:</Text>
                <Text style={styles.translationText}>{dua.translation}</Text>
              </View>

              {/* Reference */}
              <View style={styles.referenceContainer}>
                <Text style={styles.referenceLabel}>Reference:</Text>
                <Text style={styles.referenceText}>{dua.reference}</Text>
              </View>

              {/* Occasion */}
              {dua.occasion && (
                <View style={styles.occasionContainer}>
                  <Text style={styles.occasionLabel}>⏰ Occasion:</Text>
                  <Text style={styles.occasionText}>{dua.occasion}</Text>
                </View>
              )}

              {/* Reward */}
              {dua.reward && (
                <View style={styles.rewardContainer}>
                  <Text style={styles.rewardLabel}>🌟 Reward:</Text>
                  <Text style={styles.rewardText}>{dua.reward}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    isFavorite(dua.id) && styles.favoriteActive,
                  ]}
                  onPress={() => toggleFavorite(dua.id)}
                >
                  <Text style={styles.actionIcon}>
                    {isFavorite(dua.id) ? '❤️' : '🤍'}
                  </Text>
                  <Text style={styles.actionText}>
                    {isFavorite(dua.id) ? 'Favorited' : 'Favorite'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    copyToClipboard(`${dua.arabic}\n\n${dua.translation}`)
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
            "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ"
          </Text>
          <Text style={styles.footerTextEn}>
            "And when My servants ask you concerning Me, indeed I am near"
          </Text>
          <Text style={styles.footerReference}>- Surah Al-Baqarah (2:186)</Text>
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
  duaCard: {
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
  occasionContainer: {
    backgroundColor: colors.secondary + '10',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  occasionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  occasionText: {
    fontSize: 13,
    color: colors.text,
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

export default DuasDetailScreen;





