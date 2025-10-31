/**
 * Zikr (Adhkar) Screen
 * 
 * Displays Islamic remembrance texts organized by categories
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  SearchBar,
  List,
  Avatar,
  Badge,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// Import contexts and services
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { zikrService } from '../services/api';

const ZikrScreen = ({ navigation }) => {
  const { colors, styles } = useTheme();
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [adhkar, setAdhkar] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadAdhkarByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await zikrService.getCategories();
      if (response.success) {
        setCategories(response.data);
        // Auto-select first category
        if (response.data.length > 0) {
          setSelectedCategory(response.data[0].category);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdhkarByCategory = async (category) => {
    try {
      const response = await zikrService.getZikrByCategory(category);
      if (response.success) {
        setAdhkar(response.data);
      }
    } catch (error) {
      console.error('Error loading adhkar:', error);
      setAdhkar([]);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      try {
        const response = await zikrService.searchZikr(query);
        if (response.success) {
          setAdhkar(response.data);
          setSelectedCategory(null);
        }
      } catch (error) {
        console.error('Error searching adhkar:', error);
      }
    } else if (selectedCategory) {
      loadAdhkarByCategory(selectedCategory);
    }
  };

  const markAsRecited = async (zikrId) => {
    if (!isAuthenticated) return;
    
    try {
      await zikrService.markAsRecited(zikrId, user.token);
      // You might want to show a success message or update local state
    } catch (error) {
      console.error('Error marking as recited:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      morning: 'weather-sunny',
      evening: 'weather-sunset',
      afterPrayer: 'hands-pray',
      beforeSleep: 'sleep',
      afterWaking: 'alarm',
      beforeEating: 'silverware-fork-knife',
      afterEating: 'food-apple',
      traveling: 'airplane',
      rain: 'weather-rainy',
      general: 'book-open-variant',
      ramadan: 'moon-waning-crescent',
      hajj: 'kaaba',
      difficulty: 'heart',
      gratitude: 'thumb-up',
      seeking_forgiveness: 'account-heart',
    };
    return iconMap[category] || 'book-open-variant';
  };

  const ZikrCard = ({ zikr }) => (
    <Card style={localStyles.zikrCard}>
      <Card.Content>
        {/* Arabic Text */}
        <Paragraph style={localStyles.arabicText}>
          {zikr.arabicText}
        </Paragraph>
        
        {/* Transliteration */}
        <Paragraph style={localStyles.transliteration}>
          {zikr.transliteration}
        </Paragraph>
        
        {/* Translation */}
        <Paragraph style={localStyles.translation}>
          {zikr.translation}
        </Paragraph>

        {/* Repetitions */}
        {zikr.repetitions > 1 && (
          <Chip 
            icon="repeat" 
            style={localStyles.repetitionChip}
            textStyle={localStyles.chipText}
          >
            {zikr.repetitions}x
          </Chip>
        )}

        {/* Source */}
        <View style={localStyles.sourceContainer}>
          <Chip 
            icon="book" 
            style={localStyles.sourceChip}
            textStyle={localStyles.chipText}
          >
            {zikr.source.reference}
          </Chip>
          <Badge 
            style={[
              localStyles.gradeBadge,
              { backgroundColor: getGradeColor(zikr.source.grade) }
            ]}
          >
            {zikr.source.grade}
          </Badge>
        </View>

        {/* Action Buttons */}
        <View style={localStyles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => markAsRecited(zikr._id)}
            style={localStyles.actionButton}
            disabled={!isAuthenticated}
          >
            تم القراءة
          </Button>
          <Button
            mode="text"
            onPress={() => {/* Share functionality */}}
            style={localStyles.actionButton}
          >
            مشاركة
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const getGradeColor = (grade) => {
    const gradeColors = {
      sahih: colors.success,
      hasan: colors.info,
      daif: colors.warning,
      quran: colors.primary,
    };
    return gradeColors[grade] || colors.textSecondary;
  };

  return (
    <View style={[styles.container]}>
      {/* Search Bar */}
      <SearchBar
        placeholder="البحث في الأذكار..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={localStyles.searchBar}
      />

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={localStyles.categoriesContainer}
        contentContainerStyle={localStyles.categoriesContent}
      >
        {categories.map((category) => (
          <Chip
            key={category.category}
            selected={selectedCategory === category.category}
            onPress={() => setSelectedCategory(category.category)}
            style={localStyles.categoryChip}
            avatar={
              <Avatar.Icon
                size={24}
                icon={getCategoryIcon(category.category)}
              />
            }
          >
            {category.name} ({category.count})
          </Chip>
        ))}
      </ScrollView>

      {/* Adhkar List */}
      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedCategory && (
          <View style={localStyles.categoryHeader}>
            <Title style={localStyles.categoryTitle}>
              {categories.find(c => c.category === selectedCategory)?.name}
            </Title>
            <Paragraph style={localStyles.categorySubtitle}>
              {adhkar.length} من الأذكار
            </Paragraph>
          </View>
        )}

        {adhkar.map((zikr, index) => (
          <ZikrCard key={zikr._id || index} zikr={zikr} />
        ))}

        {adhkar.length === 0 && !loading && (
          <Card style={localStyles.emptyCard}>
            <Card.Content style={localStyles.emptyContent}>
              <MaterialIcons 
                name="search" 
                size={64} 
                color={colors.textSecondary} 
              />
              <Title style={localStyles.emptyTitle}>
                لا توجد أذكار
              </Title>
              <Paragraph style={localStyles.emptyText}>
                جرب البحث بكلمات مختلفة أو اختر فئة أخرى
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        <View style={localStyles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  categoriesContainer: {
    maxHeight: 60,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  scrollContent: {
    padding: 16,
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categorySubtitle: {
    opacity: 0.7,
  },
  zikrCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  arabicText: {
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'right',
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E8B57',
  },
  transliteration: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
    opacity: 0.8,
  },
  translation: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  repetitionChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sourceChip: {
    flex: 1,
    marginRight: 8,
  },
  gradeBadge: {
    paddingHorizontal: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  bottomSpace: {
    height: 32,
  },
});

export default ZikrScreen;




