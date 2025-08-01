import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, ScrollView, Platform, StatusBar, Dimensions, BackHandler, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';

import { useTranslation } from '../../src/hooks/useTranslation';
import { questionsData } from '../../src/data/questions';
import QuestionCard from '../../src/components/QuestionCard';
import { getItem, setItem } from '../../src/utils/storage';
import { refreshStats } from '../../src/utils/statsManager';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../src/utils/languageContext';

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

const INCORRECT_KEY = 'incorrect_questions_v2';
const BOOKMARKS_KEY = 'bookmarked_questions_v2';
const ANSWERED_KEY = 'answered_questions_v2';

export default function IncorrectScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [incorrect, setIncorrect] = useState<string[]>([]);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [incorrectQuestions, setIncorrectQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionOverview, setShowQuestionOverview] = useState(false);
  const [correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions] = useState<Set<string>>(new Set());
  const overviewScrollRef = useRef<ScrollView>(null);


  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      const incorrectIds = await getItem(INCORRECT_KEY, undefined);
      const bookmarksData = await getItem(BOOKMARKS_KEY, undefined);
      const answeredData = await getItem(ANSWERED_KEY, undefined);
      
      setIncorrect(incorrectIds || []);
      setBookmarked(bookmarksData ?? []);
      setAnsweredQuestions(answeredData ?? []);

      // Filter questions that were answered incorrectly
      const filtered = questionsData.filter(q => 
        incorrectIds?.includes(getQuestionId(q))
      );
      setIncorrectQuestions(filtered);
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

  // Mark question as answered and track if answered correctly (but don't remove immediately)
  const markQuestionAnswered = async (question: any, isCorrect: boolean = false) => {
    const id = getQuestionId(question);
    if (!answeredQuestions.includes(id)) {
      const updated = [...answeredQuestions, id];
      setAnsweredQuestions(updated);
      await setItem(ANSWERED_KEY, updated);
    }

    // If the question was answered correctly, track it for later removal
    if (isCorrect && incorrect.includes(id)) {
      setCorrectlyAnsweredQuestions(prev => new Set([...prev, id]));
    }
  };

  // Function to process correctly answered questions and remove them from incorrect list
  const processCorrectlyAnsweredQuestions = async () => {
    if (correctlyAnsweredQuestions.size > 0) {
      const updatedIncorrect = incorrect.filter(incorrectId => !correctlyAnsweredQuestions.has(incorrectId));
      setIncorrect(updatedIncorrect);
      await setItem(INCORRECT_KEY, updatedIncorrect);
      
      // Update the filtered questions list
      const filtered = questionsData.filter(q => 
        updatedIncorrect.includes(getQuestionId(q))
      );
      setIncorrectQuestions(filtered);
      
      // Clear the correctly answered questions set
      setCorrectlyAnsweredQuestions(new Set());
      
      // Adjust current question index if needed
      if (currentQuestionIndex >= filtered.length && filtered.length > 0) {
        setCurrentQuestionIndex(filtered.length - 1);
      } else if (filtered.length === 0) {
        setCurrentQuestionIndex(0);
      }
      
      // Refresh stats
      refreshStats();
    }
  };

  // Add/remove bookmark handler
  const toggleBookmark = async (question: any) => {
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
  const goToNextQuestion = async () => {
    // Process correctly answered questions before navigating
    await processCorrectlyAnsweredQuestions();
    
    if (currentQuestionIndex < incorrectQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = async () => {
    // Process correctly answered questions before navigating
    await processCorrectlyAnsweredQuestions();
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = async (index: number) => {
    // Process correctly answered questions before navigating
    await processCorrectlyAnsweredQuestions();
    
    if (index >= 0 && index < incorrectQuestions.length) {
      setCurrentQuestionIndex(index);
      setShowQuestionOverview(false);
    }
  };

  // Toggle question overview
  const toggleQuestionOverview = () => {
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
  };

  // Clear all incorrect answers
  const clearIncorrect = () => {
    Alert.alert(
      'Clear Incorrect Answers',
      'Are you sure you want to clear all incorrect answers? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            setIncorrect([]);
            setIncorrectQuestions([]);
            await setItem(INCORRECT_KEY, []);
            // Update stats across the app
            refreshStats();
          }
        }
      ]
    );
  };

  const goBack = async () => {
    // Process correctly answered questions before leaving the screen
    await processCorrectlyAnsweredQuestions();
    router.back();
  };

  const currentQuestion = incorrectQuestions[currentQuestionIndex];

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
      backgroundColor: colors.error,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 16,
      minHeight: 32,
      minWidth: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearButton: {
      backgroundColor: colors.errorBackground,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 16,
      minHeight: 32,
      minWidth: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.error,
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
      backgroundColor: colors.error,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
      shadowColor: colors.error,
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
      backgroundColor: colors.error,
      borderColor: colors.errorBorder,
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
      backgroundColor: colors.error,
      borderColor: colors.errorBorder,
    },
    navigationControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 20 : 16,
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
  });

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
              {t.nav_incorrect || 'Incorrect'}
            </Text>
            {incorrectQuestions.length > 0 && (
              <Text style={dynamicStyles.counterText}>
                {showQuestionOverview ? `${incorrectQuestions.length} ${t.questions}` : `Q${currentQuestionIndex + 1}/${incorrectQuestions.length}`}
              </Text>
            )}
          </View>
          <View style={styles.rightActions}>
            <View style={styles.placeholderButton} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {incorrectQuestions.length === 0 ? (
          // Empty State
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={dynamicStyles.emptyTitle}>{t.incorrect_empty_title}</Text>
            <Text style={dynamicStyles.emptyDesc}>
              {t.incorrect_empty_desc}
            </Text>
            <TouchableOpacity 
              style={dynamicStyles.exploreButton}
              onPress={() => router.push('/pages/all-questions')}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.exploreButtonText}>📚 {t.practice_questions}</Text>
            </TouchableOpacity>
          </View>
        ) : !showQuestionOverview ? (
          // Single Question View
          <ScrollView 
            style={styles.questionScrollView}
            contentContainerStyle={styles.questionScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <QuestionCard
              question={currentQuestion}
              index={currentQuestionIndex}
              lang={language}
              isBookmarked={bookmarked.includes(getQuestionId(currentQuestion))}
              onToggleBookmark={() => toggleBookmark(currentQuestion)}
              onAnswerSelected={(isCorrect) => markQuestionAnswered(currentQuestion, isCorrect)}
            />
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
              <Text style={dynamicStyles.overviewTitle}>{t.incorrect_title}</Text>
              <View style={styles.questionsGrid}>
                {incorrectQuestions.map((_, index) => {
                  const questionId = getQuestionId(incorrectQuestions[index]);
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
                      accessibilityLabel={`Question ${index + 1}${isAnswered ? ' (answered)' : ''}${isCurrent ? ' (current)' : ''}`}
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
                  <Text style={dynamicStyles.legendText}>{t.not_reviewed}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, dynamicStyles.answeredColor]} />
                  <Text style={dynamicStyles.legendText}>{t.reviewed}</Text>
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

      {/* Navigation Controls */}
      {incorrectQuestions.length > 0 && !showQuestionOverview && (
        <View style={dynamicStyles.navigationControls}>
          <TouchableOpacity 
            style={[dynamicStyles.navButton, currentQuestionIndex === 0 && dynamicStyles.disabledButton]}
            onPress={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.navButtonText, currentQuestionIndex === 0 && dynamicStyles.disabledButtonText]}>
              ← {t.previous}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[dynamicStyles.navButton, currentQuestionIndex === incorrectQuestions.length - 1 && dynamicStyles.disabledButton]}
            onPress={goToNextQuestion}
            disabled={currentQuestionIndex === incorrectQuestions.length - 1}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.navButtonText, currentQuestionIndex === incorrectQuestions.length - 1 && dynamicStyles.disabledButtonText]}>
              {t.next} →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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