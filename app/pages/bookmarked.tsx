import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, ScrollView, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import { useTranslation } from '../../src/hooks/useTranslation';
import { questionsData } from '../../src/data/questions';
import QuestionCard from '../../src/components/QuestionCard';
import { getItem, setItem } from '../../src/utils/storage';
import { useTheme } from '../../contexts/ThemeContext';

const { height: screenHeight } = Dimensions.get('window');

// Helper to generate a unique id for a question (robust, hash-based)
function getQuestionId(q: { question: string; options: string[]; answer?: string }): string {
  if (!q || !q.question) return '';
  const raw = `${q.question}::${(q.options || []).join('|')}::${q.answer || ''}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) + raw.charCodeAt(i);
  }
  return 'q_' + (hash >>> 0).toString(36);
}

const BOOKMARKS_KEY = 'bookmarked_questions_v2';
const ANSWERED_KEY = 'answered_questions_v2';

export default function BookmarkedScreen() {
  const { colors, theme } = useTheme();
  const translation = useTranslation();
  const t = (translation as any).t || {};
  const navigation = useNavigation();
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionOverview, setShowQuestionOverview] = useState(false);
  const overviewScrollRef = useRef<ScrollView>(null);

  // Load bookmarks and answered questions from storage
  useEffect(() => {
    const loadData = async () => {
      const bookmarksData = await getItem(BOOKMARKS_KEY, null);
      const answeredData = await getItem(ANSWERED_KEY, null);
      setBookmarked(bookmarksData || []);
      setAnsweredQuestions(answeredData || []);

      // Filter questions that are bookmarked
      const filtered = questionsData.filter(q => 
        bookmarksData?.includes(getQuestionId(q))
      );
      setBookmarkedQuestions(filtered);
    };
    loadData();
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (showQuestionOverview) {
        setShowQuestionOverview(false);
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [showQuestionOverview]);

  // Reset current question index when bookmarked questions change
  useEffect(() => {
    if (bookmarkedQuestions.length === 0) {
      setCurrentQuestionIndex(0);
    } else if (currentQuestionIndex >= bookmarkedQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, bookmarkedQuestions.length - 1));
    }
  }, [bookmarkedQuestions.length, currentQuestionIndex]);

  // Mark question as answered
  const markQuestionAnswered = async (question: any) => {
    if (!question) return;
    const id = getQuestionId(question);
    if (!answeredQuestions.includes(id)) {
      const updated = [...answeredQuestions, id];
      setAnsweredQuestions(updated);
      await setItem(ANSWERED_KEY, updated);
    }
  };

  // Add/remove bookmark handler
  const toggleBookmark = async (question: any) => {
    if (!question) return;
    const id = getQuestionId(question);
    let updated;
    if (bookmarked.includes(id)) {
      updated = bookmarked.filter(q => q !== id);
      setBookmarkedQuestions(prev => prev.filter(q => getQuestionId(q) !== id));
    } else {
      updated = [...bookmarked, id];
      setBookmarkedQuestions(prev => [...prev, question]);
    }
    setBookmarked(updated);

    // Use statsManager to update bookmarks and refresh stats across the app
    const { updateBookmarks } = require('../../src/utils/statsManager');
    await updateBookmarks(updated);
  };

  // Navigation handlers
  const goToNextQuestion = () => {
    if (currentQuestionIndex < bookmarkedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < bookmarkedQuestions.length) {
      setCurrentQuestionIndex(index);
      setShowQuestionOverview(false);
    }
  };

  // Toggle question overview
  const toggleQuestionOverview = useCallback(() => {
    setShowQuestionOverview(prev => {
      const newValue = !prev;
      
      // If opening overview, scroll to current question after a short delay
      if (newValue) {
        setTimeout(() => {
          const questionsPerRow = 8; // Approximate
          const currentRow = Math.floor(currentQuestionIndex / questionsPerRow);
          const estimatedOffset = currentRow * 50; // Approximate row height
          
          overviewScrollRef.current?.scrollTo({
            y: Math.max(0, estimatedOffset - 100), // Scroll with some padding
            animated: true,
          });
        }, 100);
      }
      
      return newValue;
    });
  }, [currentQuestionIndex]);

  // Set up navigation params to communicate with header button
  useEffect(() => {
    if (bookmarkedQuestions.length > 0) {
      (navigation as any).setParams({ toggleOverview: toggleQuestionOverview });
    }
  }, [navigation, toggleQuestionOverview, bookmarkedQuestions.length]);

  const goBack = () => {
    router.back();
  };

  // Swipe gesture handler
  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END && !showQuestionOverview && bookmarkedQuestions.length > 0) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Use both translation distance and velocity for better detection
      const swipeThreshold = 50;
      const velocityThreshold = 500;
      
      if ((translationX < -swipeThreshold || velocityX < -velocityThreshold) && currentQuestionIndex < bookmarkedQuestions.length - 1) {
        goToNextQuestion();
      } else if ((translationX > swipeThreshold || velocityX > velocityThreshold) && currentQuestionIndex > 0) {
        goToPreviousQuestion();
      }
    }
  };

  const currentQuestion = bookmarkedQuestions[currentQuestionIndex];

  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: colors.background,
    },
    headerBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.infoBackground,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.tint,
      shadowColor: colors.tint,
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    backButtonText: {
      fontSize: 18,
      color: colors.tint,
      fontWeight: 'bold',
    },
    appBarTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: 0.1,
    },
    counterText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
    overviewButton: {
      backgroundColor: '#8b5cf6', // Keep purple for bookmarks
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 16,
      minHeight: 32,
      minWidth: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptyDesc: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    exploreButton: {
      backgroundColor: '#8b5cf6',
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
      shadowColor: '#8b5cf6',
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    exploreButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    overviewContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    overviewTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    questionNumberButton: {
      width: '11%',
      aspectRatio: 1,
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
      marginHorizontal: '0.5%',
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 36,
    },
    answeredQuestion: {
      backgroundColor: colors.successBackground,
      borderColor: colors.success,
    },
    currentQuestion: {
      backgroundColor: '#8b5cf6',
      borderColor: '#7c3aed',
    },
    questionNumberText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    answeredQuestionText: {
      color: colors.success,
    },
    currentQuestionText: {
      color: '#ffffff',
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    legendText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    unansweredColor: {
      backgroundColor: colors.backgroundTertiary,
      borderColor: colors.border,
    },
    answeredColor: {
      backgroundColor: colors.successBackground,
      borderColor: colors.success,
    },
    currentColor: {
      backgroundColor: '#8b5cf6',
      borderColor: '#7c3aed',
    },
    navigationControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: -2 },
      elevation: 8,
    },
    navButton: {
      flex: 1,
      backgroundColor: colors.tint,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 6,
      minHeight: 44,
      justifyContent: 'center',
      shadowColor: colors.tint,
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    disabledButton: {
      backgroundColor: colors.backgroundTertiary,
      shadowOpacity: 0,
      elevation: 0,
    },
    navButtonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    disabledButtonText: {
      color: colors.textMuted,
    },
    progressContainer: {
      flex: 0.5,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    progressText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['left', 'right', 'bottom']}>

      {/* Main Content with Pan Gesture Handler */}
      <PanGestureHandler 
        onHandlerStateChange={onHandlerStateChange}
        minPointers={1}
        maxPointers={1}
        avgTouches
      >
        <View style={styles.mainContent}>
          {bookmarkedQuestions.length === 0 ? (
          // Empty State
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={dynamicStyles.emptyTitle}>{t.no_bookmarked_questions_title}</Text>
            <Text style={dynamicStyles.emptyDesc}>
              {t.no_bookmarked_questions_desc}
            </Text>
            <TouchableOpacity 
              style={dynamicStyles.exploreButton}
              onPress={() => router.push('/pages/all-questions')}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.exploreButtonText}>{t.explore_questions}</Text>
            </TouchableOpacity>
          </View>
        ) : !showQuestionOverview ? (
          // Single Question View
          <ScrollView 
            style={styles.questionScrollView}
            contentContainerStyle={styles.questionScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              index={currentQuestionIndex}
              isBookmarked={currentQuestion ? bookmarked.includes(getQuestionId(currentQuestion)) : false}
              onToggleBookmark={() => currentQuestion && toggleBookmark(currentQuestion)}
              onAnswerSelected={() => currentQuestion && markQuestionAnswered(currentQuestion)}
            />
            )}
          </ScrollView>
        ) : (
          // Question Overview Grid
          <View style={dynamicStyles.overviewContainer}>
            <ScrollView 
              ref={overviewScrollRef}
              style={styles.overviewScroll}
              contentContainerStyle={styles.overviewContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={dynamicStyles.overviewTitle}>{t.bookmarked_questions}</Text>
              <View style={styles.questionsGrid}>
                {bookmarkedQuestions.map((_, index) => {
                  const questionId = getQuestionId(bookmarkedQuestions[index]);
                  const isAnswered = answeredQuestions.includes(questionId);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <TouchableOpacity
                      key={`question-${index}`}
                      style={[
                        dynamicStyles.questionNumberButton,
                        isAnswered && dynamicStyles.answeredQuestion,
                        isCurrent && dynamicStyles.currentQuestion
                      ]}
                      onPress={() => goToQuestion(index)}
                      activeOpacity={0.7}
                      accessibilityLabel={`${t.question || 'Question'} ${index + 1}${isAnswered ? ` (${t.answered})` : ''}${isCurrent ? ` (${t.current})` : ''}`}
                      accessibilityRole="button"
                    >
                      <Text style={[
                        dynamicStyles.questionNumberText,
                        isAnswered && dynamicStyles.answeredQuestionText,
                        isCurrent && dynamicStyles.currentQuestionText
                      ]}>
                        {index + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {/* Legend */}
              <View style={dynamicStyles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, dynamicStyles.unansweredColor]} />
                  <Text style={dynamicStyles.legendText}>{t.unanswered}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, dynamicStyles.answeredColor]} />
                  <Text style={dynamicStyles.legendText}>{t.answered}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, dynamicStyles.currentColor]} />
                  <Text style={dynamicStyles.legendText}>{t.current}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
        </View>
      </PanGestureHandler>

      {/* Navigation Controls */}
      {bookmarkedQuestions.length > 0 && !showQuestionOverview && (
        <View style={dynamicStyles.navigationControls}>
          <TouchableOpacity 
            style={[dynamicStyles.navButton, currentQuestionIndex === 0 && dynamicStyles.disabledButton]}
            onPress={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.navButtonText, currentQuestionIndex === 0 && dynamicStyles.disabledButtonText]}>
              {t.previous}
            </Text>
          </TouchableOpacity>
          
          {/* Progress Indicator */}
          <View style={dynamicStyles.progressContainer}>
            <Text style={dynamicStyles.progressText}>
              {currentQuestionIndex + 1}/{bookmarkedQuestions.length}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[dynamicStyles.navButton, currentQuestionIndex === bookmarkedQuestions.length - 1 && dynamicStyles.disabledButton]}
            onPress={goToNextQuestion}
            disabled={currentQuestionIndex === bookmarkedQuestions.length - 1}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.navButtonText, currentQuestionIndex === bookmarkedQuestions.length - 1 && dynamicStyles.disabledButtonText]}>
              {t.next}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
  },
  questionScrollView: {
    flex: 1,
  },
  questionScrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  overviewScroll: {
    flex: 1,
  },
  overviewContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },
  questionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 30,
    paddingHorizontal: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
  },
});