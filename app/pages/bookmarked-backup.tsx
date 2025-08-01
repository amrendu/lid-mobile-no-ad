import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, View, Text, ScrollView, Platform, StatusBar, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';

import { translations } from '../../src/data/translations-new';
import { questionsData } from '../../src/data/questions';
import QuestionCard from '../../src/components/QuestionCard';
import { getItem, setItem } from '../../src/utils/storage';

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

export default function BookmarkedScreen() {
  const [lang, setLang] = useState<'EN' | 'DE'>('EN');
  const t = translations[lang];
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionOverview, setShowQuestionOverview] = useState(false);
  const [overviewScrollY] = useState(new Animated.Value(0));
  const overviewScrollRef = useRef<ScrollView>(null);

  // Load app language from storage
  useEffect(() => {
    const loadAppLanguage = async () => {
      try {
        const storedLanguage = await getItem('app_language', 'EN');
        if (storedLanguage && (storedLanguage === 'EN' || storedLanguage === 'DE')) {
          setLang(storedLanguage);
        }
      } catch (error) {
        console.error('Error loading app language:', error);
      }
    };

    loadAppLanguage();
  }, []);

  // Load bookmarks and answered questions from storage
  useEffect(() => {
    const loadData = async () => {
      const bookmarksData = await getItem(BOOKMARKS_KEY, []);
      const answeredData = await getItem(ANSWERED_KEY, []);
      setBookmarked(bookmarksData ?? []);
      setAnsweredQuestions(answeredData ?? []);

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

  const goBack = () => {
    router.back();
  };

  const currentQuestion = bookmarkedQuestions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={90} style={styles.blurView} tint="light" />
        ) : (
          <View style={styles.headerBackground} />
        )}
      </View>
      
      {/* Compact App Bar with Integrated Counter */}
      <View style={styles.appBar}>
        <View style={styles.appBarContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={goBack}
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.appBarTitle} numberOfLines={1} ellipsizeMode="tail">
              {t.nav_marked || 'Bookmarked'}
            </Text>
            {bookmarkedQuestions.length > 0 && (
              <Text style={styles.counterText}>
                {showQuestionOverview ? `${bookmarkedQuestions.length} questions` : `Q${currentQuestionIndex + 1}/${bookmarkedQuestions.length}`}
              </Text>
            )}
          </View>
          <View style={styles.rightActions}>
            {bookmarkedQuestions.length > 0 && (
              <TouchableOpacity 
                style={styles.overviewButton}
                onPress={toggleQuestionOverview}
                activeOpacity={0.7}
              >
                <Text style={styles.overviewButtonText}>
                  {showQuestionOverview ? '📋' : '🔍'}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.placeholderButton} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {bookmarkedQuestions.length === 0 ? (
          // Empty State
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyTitle}>No Bookmarked Questions</Text>
            <Text style={styles.emptyDesc}>
              Start bookmarking questions you want to review later by tapping the star icon on any question.
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/pages/all-questions')}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreButtonText}>📚 Explore Questions</Text>
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
              lang={lang}
              isBookmarked={bookmarked.includes(getQuestionId(currentQuestion))}
              onToggleBookmark={() => toggleBookmark(currentQuestion)}
              onAnswerSelected={() => markQuestionAnswered(currentQuestion)}
            />
          </ScrollView>
        ) : (
          // Question Overview Grid
          <View style={styles.overviewContainer}>
            <ScrollView 
              ref={overviewScrollRef}
              style={styles.overviewScroll}
              contentContainerStyle={styles.overviewContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.overviewTitle}>Bookmarked Questions</Text>
              <View style={styles.questionsGrid}>
                {bookmarkedQuestions.map((_, index) => {
                  const questionId = getQuestionId(bookmarkedQuestions[index]);
                  const isAnswered = answeredQuestions.includes(questionId);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <TouchableOpacity
                      key={`question-${index}`}
                      style={[
                        styles.questionNumberButton,
                        isAnswered && styles.answeredQuestion,
                        isCurrent && styles.currentQuestion
                      ]}
                      onPress={() => goToQuestion(index)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Question ${index + 1}${isAnswered ? ' (answered)' : ''}${isCurrent ? ' (current)' : ''}`}
                      accessibilityRole="button"
                    >
                      <Text style={[
                        styles.questionNumberText,
                        isAnswered && styles.answeredQuestionText,
                        isCurrent && styles.currentQuestionText
                      ]}>
                        {index + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {/* Legend */}
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.unansweredColor]} />
                  <Text style={styles.legendText}>Unanswered</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.answeredColor]} />
                  <Text style={styles.legendText}>Answered</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.currentColor]} />
                  <Text style={styles.legendText}>Current</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Navigation Controls */}
      {bookmarkedQuestions.length > 0 && !showQuestionOverview && (
        <View style={styles.navigationControls}>
          <TouchableOpacity 
            style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
            onPress={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            activeOpacity={0.7}
          >
            <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.disabledButtonText]}>
              ← Previous
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, currentQuestionIndex === bookmarkedQuestions.length - 1 && styles.disabledButton]}
            onPress={goToNextQuestion}
            disabled={currentQuestionIndex === bookmarkedQuestions.length - 1}
            activeOpacity={0.7}
          >
            <Text style={[styles.navButtonText, currentQuestionIndex === bookmarkedQuestions.length - 1 && styles.disabledButtonText]}>
              Next →
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
    backgroundColor: '#f8f9fc',
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
    backgroundColor: '#8b5cf6',
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

  // Empty State
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#11181c',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#687076',
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
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
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
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    minHeight: 44,
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