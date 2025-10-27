/**
 * Dua Screen
 * 
 * Displays Islamic supplications from Quran and Sunnah
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, SearchBar } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { duaService } from '../services/api';

const DuaScreen = ({ navigation }) => {
  const { colors, styles } = useTheme();
  const [duas, setDuas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDuas();
  }, []);

  const loadDuas = async () => {
    try {
      const [duasResponse, categoriesResponse] = await Promise.all([
        duaService.getAllDuas({ limit: 20 }),
        duaService.getCategories(),
      ]);

      if (duasResponse.success) setDuas(duasResponse.data);
      if (categoriesResponse.success) setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error loading duas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container]}>
      <SearchBar placeholder="البحث في الأدعية..." style={localStyles.searchBar} />
      
      <ScrollView style={localStyles.container}>
        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={localStyles.categories}>
          {categories.map((category) => (
            <Chip key={category.category} style={localStyles.categoryChip}>
              {category.name} ({category.count})
            </Chip>
          ))}
        </ScrollView>

        {/* Duas List */}
        {duas.map((dua) => (
          <Card key={dua._id} style={localStyles.duaCard}>
            <Card.Content>
              <Title style={localStyles.duaTitle}>{dua.title}</Title>
              <Paragraph style={localStyles.arabicText}>{dua.arabicText}</Paragraph>
              <Paragraph style={localStyles.transliteration}>{dua.transliteration}</Paragraph>
              <Paragraph style={localStyles.translation}>{dua.translation}</Paragraph>
              <View style={localStyles.actions}>
                <Button mode="outlined">إضافة للمفضلة</Button>
                <Button mode="text">مشاركة</Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: 16 },
  categories: { paddingHorizontal: 16, marginBottom: 16 },
  categoryChip: { marginRight: 8 },
  duaCard: { margin: 16, borderRadius: 12 },
  duaTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  arabicText: { fontSize: 18, textAlign: 'right', fontWeight: 'bold', color: '#2E8B57', marginBottom: 8 },
  transliteration: { fontSize: 14, fontStyle: 'italic', marginBottom: 8 },
  translation: { fontSize: 14, marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default DuaScreen;
