import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Animated } from 'react-native';
import { questionsData } from '../data/questions';
import QuestionCard from '../components/QuestionCard';
import ScreenWrapper from '../components/ScreenWrapper';
import AppHeader from '../components/AppHeader';
import { useTranslation } from '../hooks/useTranslation';

export default function AllQuestionsScreen() {
  const { t, language } = useTranslation();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'EN' ? 'DE' : 'EN');
  };

  return (
    <ScreenWrapper>
      <AppHeader
        title={t.all_questions_title}
        subtitle={`${questionsData.length} ${t.questions_available}`}
        language={language}
        onLanguageToggle={toggleLanguage}
        fadeAnim={fadeAnim}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <FlatList
          data={questionsData}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <QuestionCard 
              question={item} 
              index={index}
              lang={language}
              onToggleLang={toggleLanguage}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
});
