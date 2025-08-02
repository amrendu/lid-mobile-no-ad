import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, View, Text, ScrollView, Platform, StatusBar, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams } from 'expo-router';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import { questionsData } from '../../src/data/questions';
import QuestionCard from '../../src/components/QuestionCard';
import { getItem, setItem } from '../../src/utils/storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useLanguage } from '../../src/utils/languageContext';
import { GridIcon } from '../../constants/Icons';

const { height: screenHeight } = Dimensions.get('window');

// Helper to generate a unique id for a question (robust, hash-based)
function getQuestionId(q: { question: string; options: string[]; answer?: string }): string {
  const raw = `${q.question}::${(q.options || []).join('|')}::${q.answer || ''}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) + raw.charCodeAt(i);
  }
  return 'q_' + (hash >>> 0).toString(36);
}

const BOOKMARKS_KEY = 'bookmarked_questions_v2';
const ANSWERED_KEY = 'answered_questions_v2';
const CORRECT_KEY = 'correct_questions_v2';
const INCORRECT_KEY = 'incorrect_questions_v2';

export default function AllQuestionsScreen() {
  const { colors, theme } = useTheme();
  const { overview } = useLocalSearchParams();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [correctQuestions, setCorrectQuestions] = useState<string[]>([]);
  const [incorrectQuestions, setIncorrectQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Limit to first 300 questions for "All 300 Questions" page
  // This limits the displayed questions from the full dataset (460) to the standard 300 questions
  const MAX_QUESTIONS = 300;
  const limitedQuestions = questionsData.slice(0, MAX_QUESTIONS);
  const [showQuestionOverview, setShowQuestionOverview] = useState(false);
  const [overviewScrollY] = useState(new Animated.Value(0));
  const overviewScrollRef = useRef<ScrollView>(null);

  // Load bookmarks and answered questions from storage
  useEffect(() => {
    const loadData = async () => {
      const bookmarksData = await getItem(BOOKMARKS_KEY, []);
      const answeredData = await getItem(ANSWERED_KEY, []);
      const correctData = await getItem(CORRECT_KEY, []);
      const incorrectData = await getItem(INCORRECT_KEY, []);
      setBookmarked(bookmarksData ?? []);
      setAnsweredQuestions(answeredData ?? []);
      setCorrectQuestions(correctData ?? []);
      setIncorrectQuestions(incorrectData ?? []);
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

  // Check for overview parameter and automatically open overview
  useEffect(() => {
    if (overview === 'true') {
      setShowQuestionOverview(true);
    }
  }, [overview]);

  // Mark question as answered
  const markQuestionAnswered = async (question) => {
    const id = getQuestionId(question);
    if (!answeredQuestions.includes(id)) {
      const updated = [...answeredQuestions, id];
      setAnsweredQuestions(updated);
      await setItem(ANSWERED_KEY, updated);
    }
  };

  // Add/remove bookmark handler
  const toggleBookmark = async (question) => {
    const id = getQuestionId(question);
    let updated;
    if (bookmarked.includes(id)) {
      updated = bookmarked.filter(q => q !== id);
    } else {
      updated = [...bookmarked, id];
    }
    setBookmarked(updated);

    // Use statsManager to update bookmarks and refresh stats across the app
    const { updateBookmarks } = require('../../src/utils/statsManager');
    await updateBookmarks(updated);
  };

  // Navigation handlers
  const goToNextQuestion = () => {
    if (currentQuestionIndex < limitedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    // Ensure we don't go beyond our limited questions
    if (index >= 0 && index < limitedQuestions.length) {
      setCurrentQuestionIndex(index);
      setShowQuestionOverview(false);
    }
  };


  // Reload correct/incorrect status from storage
  const reloadAnswerStatus = async () => {
    const correctData = await getItem(CORRECT_KEY, []);
    const incorrectData = await getItem(INCORRECT_KEY, []);
    setCorrectQuestions(correctData ?? []);
    setIncorrectQuestions(incorrectData ?? []);
  };

  // Toggle question overview
  const toggleQuestionOverview = async () => {
    setShowQuestionOverview(prev => {
      const newValue = !prev;
      
      // If opening overview, reload answer status and scroll to current question after a short delay
      if (newValue) {
        // Reload the correct/incorrect status from storage
        reloadAnswerStatus();
        
        setTimeout(() => {
          const questionsPerRow = 8; // Approximate
          const currentRow = Math.floor(currentQuestionIndex / questionsPerRow);
          const estimatedOffset = currentRow * 50; // Approximate row height
          
          overviewScrollRef.current?.scrollTo({
            y: Math.max(0, estimatedOffset - 100), // Scroll with some padding
            animated: true
          });
        }, 100);
      }
      
      return newValue;
    });
  };

  const goBack = () => {
    if (showQuestionOverview) {
      // If overview is open, close it instead of navigating back
      setShowQuestionOverview(false);
    } else {
      // If overview is closed, navigate back to previous screen
      router.back();
    }
  };

  const currentQuestion = limitedQuestions[currentQuestionIndex];

  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background 
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
      backgroundColor: colors.tint,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 16,
      minHeight: 32,
      minWidth: 32,
      alignItems: 'center',
      justifyContent: 'center',
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
    correctQuestion: {
      backgroundColor: colors.successBackground,
      borderColor: colors.success,
    },
    incorrectQuestion: {
      backgroundColor: colors.errorBackground,
      borderColor: colors.error,
    },
    currentQuestion: {
      backgroundColor: colors.tint,
      borderColor: colors.tintSecondary,
    },
    questionNumberText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    correctQuestionText: {
      color: colors.success,
    },
    incorrectQuestionText: {
      color: colors.error,
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
    correctColor: {
      backgroundColor: colors.successBackground,
      borderColor: colors.success,
    },
    incorrectColor: {
      backgroundColor: colors.errorBackground,
      borderColor: colors.error,
    },
    currentColor: {
      backgroundColor: colors.tint,
      borderColor: colors.tintSecondary,
    },
    navigationControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    navButton: {
      flex: 1,
      backgroundColor: colors.tint,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginHorizontal: 6,
      minHeight: 40,
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
  });

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END && !showQuestionOverview) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Use both translation distance and velocity for better detection
      const swipeThreshold = 50;
      const velocityThreshold = 500;
      
      if ((translationX < -swipeThreshold || velocityX < -velocityThreshold) && currentQuestionIndex < limitedQuestions.length - 1) {
        goToNextQuestion();
      } else if ((translationX > swipeThreshold || velocityX > velocityThreshold) && currentQuestionIndex > 0) {
        goToPreviousQuestion();
      }
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={90} style={styles.blurView} tint={theme === 'dark' ? 'dark' : 'light'} />
        ) : (
          <View style={dynamicStyles.headerBackground} />
        )}
      </View>
      
      {/* Compact App Bar with Integrated Counter */}
      <View style={styles.appBar}>
        <View style={styles.appBarContent}>
          <TouchableOpacity 
            style={dynamicStyles.backButton}
            onPress={goBack}
            accessibilityLabel={t.go_back}
            activeOpacity={0.7}
          >
            <Text style={dynamicStyles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={dynamicStyles.appBarTitle} numberOfLines={1} ellipsizeMode="tail">
              {t.all_questions_title}
            </Text>
            <Text style={dynamicStyles.counterText}>
              Q{currentQuestionIndex + 1}/{limitedQuestions.length}
            </Text>
          </View>
          <View style={styles.rightActions}>
            <TouchableOpacity 
              style={dynamicStyles.overviewButton}
              onPress={toggleQuestionOverview}
              activeOpacity={0.7}
            >
              <GridIcon size={16} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.placeholderButton} />
          </View>
        </View>
      </View>

      {/* Main Content with Pan Gesture Handler */}
      <PanGestureHandler 
        onHandlerStateChange={onHandlerStateChange}
        minPointers={1}
        maxPointers={1}
        avgTouches
      >
        <View style={styles.mainContent}>
          {!showQuestionOverview ? (
            // Single Question View
            <ScrollView 
              style={styles.questionScrollView}
              contentContainerStyle={styles.questionScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {currentQuestion ? (
                <QuestionCard
                  question={currentQuestion}
                  index={currentQuestionIndex}
                  lang={language}
                  isBookmarked={bookmarked.includes(getQuestionId(currentQuestion))}
                  onToggleBookmark={() => toggleBookmark(currentQuestion)}
                  onAnswerSelected={() => markQuestionAnswered(currentQuestion)}
                />
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.text }}>Loading question...</Text>
                </View>
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
                <Text style={dynamicStyles.overviewTitle}>{t.all_300_questions}</Text>
                <View style={styles.questionsGrid}>
                  {limitedQuestions.map((_, index) => {
                    const questionId = getQuestionId(limitedQuestions[index]);
                    const isCorrect = correctQuestions.includes(questionId);
                    const isIncorrect = incorrectQuestions.includes(questionId);
                    const isCurrent = index === currentQuestionIndex;
                    
                    // Determine the status and styling
                    let statusStyle = dynamicStyles.questionNumberButton;
                    let textStyle = dynamicStyles.questionNumberText;
                    let statusLabel = '';
                    
                    if (isCurrent) {
                      statusStyle = [dynamicStyles.questionNumberButton, dynamicStyles.currentQuestion];
                      textStyle = [dynamicStyles.questionNumberText, dynamicStyles.currentQuestionText];
                      statusLabel = ` (${t.current})`;
                    } else if (isCorrect) {
                      statusStyle = [dynamicStyles.questionNumberButton, dynamicStyles.correctQuestion];
                      textStyle = [dynamicStyles.questionNumberText, dynamicStyles.correctQuestionText];
                      statusLabel = ` (${t.correct})`;
                    } else if (isIncorrect) {
                      statusStyle = [dynamicStyles.questionNumberButton, dynamicStyles.incorrectQuestion];
                      textStyle = [dynamicStyles.questionNumberText, dynamicStyles.incorrectQuestionText];
                      statusLabel = ` (${t.incorrect})`;
                    }
                    
                    return (
                      <TouchableOpacity
                        key={`question-${index}`}
                        style={statusStyle}
                        onPress={() => goToQuestion(index)}
                        activeOpacity={0.7}
                        accessibilityLabel={`Question ${index + 1}${statusLabel}`}
                        accessibilityRole="button"
                      >
                        <Text style={textStyle}>
                          {index + 1}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                
                {/* Legend */}
                <View style={[dynamicStyles.legend, { flexWrap: 'wrap', gap: 8 }]}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, dynamicStyles.unansweredColor]} />
                    <Text style={dynamicStyles.legendText}>{t.unanswered}</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, dynamicStyles.correctColor]} />
                    <Text style={dynamicStyles.legendText}>{t.correct}</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, dynamicStyles.incorrectColor]} />
                    <Text style={dynamicStyles.legendText}>{t.incorrect}</Text>
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
      {!showQuestionOverview && (
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
          
          <TouchableOpacity 
            style={[dynamicStyles.navButton, currentQuestionIndex === limitedQuestions.length - 1 && dynamicStyles.disabledButton]}
            onPress={goToNextQuestion}
            disabled={currentQuestionIndex === limitedQuestions.length - 1}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.navButtonText, currentQuestionIndex === limitedQuestions.length - 1 && dynamicStyles.disabledButtonText]}>
              {t.next}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fc' 
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 70 : 60,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  appBar: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingHorizontal: 12,
    paddingBottom: 6,
    zIndex: 20,
  },
  appBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: 2,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f2ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0a7ea4',
    shadowColor: '#0a7ea4',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  backButtonText: {
    fontSize: 18,
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a7ea4',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  placeholderButton: {
    minHeight: 36,
    minWidth: 36,
  },
  
  // Compact Counter Text (now in header)
  counterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  overviewButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    minHeight: 32,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewButtonText: {
    fontSize: 14,
  },

  // Main Content
  mainContent: {
    flex: 1,
    marginTop: 2,
  },
  questionScrollView: {
    flex: 1,
  },
  questionScrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 10,
  },

  // Question Overview
  overviewContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  overviewScroll: {
    flex: 1,
  },
  overviewContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#11181c',
    marginBottom: 16,
    textAlign: 'center',
  },
  questionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 30,
    paddingHorizontal: 2,
  },
  questionNumberButton: {
    width: '11%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    marginHorizontal: '0.5%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 36,
  },
  answeredQuestion: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  currentQuestion: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  questionNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  answeredQuestionText: {
    color: '#16a34a',
  },
  currentQuestionText: {
    color: '#ffffff',
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
  unansweredColor: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  answeredColor: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  currentColor: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Navigation Controls
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 6,
    minHeight: 40,
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  navButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
});