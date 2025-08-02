import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Animated } from 'react-native';
import { questionsData } from '../data/questions';
import QuestionCard from '../components/QuestionCard';
import ScreenWrapper from '../components/ScreenWrapper';
import AppHeader from '../components/AppHeader';
import { useTranslation } from '../hooks/useTranslation';

export default function AllQuestionsScreen() {
  const { t, language } = useTranslation();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const flatListRef = useRef(null);

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


  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentQuestionIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

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
          ref={flatListRef}
          data={questionsData}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <QuestionCard
              question={item}
              index={index}
              lang={language}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(data, index) => ({
            length: 200, // Approximate item height
            offset: 200 * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
            });
          }}
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
