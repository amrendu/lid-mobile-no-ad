import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, View, Text, ScrollView, Platform, StatusBar, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import RNPickerSelect from 'react-native-picker-select';

import { useTranslation } from '../../src/hooks/useTranslation';
import { questionsData } from '../../src/data/questions';
import QuestionCard from '../../src/components/QuestionCard';
import { getItem, setItem } from '../../src/utils/storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../src/utils/languageContext';
import { GridIcon } from '../../constants/Icons';

const { height: screenHeight } = Dimensions.get('window');

// Extract unique Bundesländer from questions
const bundeslaender = [
  ...new Set(questionsData.map(q => q.bundesland).filter(b => b && b !== 'General'))
].sort();

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
const SELECTED_STATE_KEY = 'selected_state_v1';

export default function StateQuestionsScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedState, setSelectedState] = useState('');
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionOverview, setShowQuestionOverview] = useState(false);
  const [overviewScrollY] = useState(new Animated.Value(0));
  const overviewScrollRef = useRef<ScrollView>(null);

  // Filter questions by selected state
  const stateQuestions = selectedState ? questionsData.filter(q => q.bundesland === selectedState) : [];

  // Load bookmarks, answered questions, and selected state from storage
  useEffect(() => {
    const loadData = async () => {
      const bookmarksData = await getItem(BOOKMARKS_KEY, null);
      const answeredData = await getItem(ANSWERED_KEY, null);
      const savedState = await getItem(SELECTED_STATE_KEY, null);
      
      setBookmarked(bookmarksData || []);
      setAnsweredQuestions(answeredData || []);
      
      // Only set the saved state if it's valid and exists in the bundeslaender list
      if (savedState && bundeslaender.includes(savedState)) {
        setSelectedState(savedState);
      }
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

  // Reset current question index when state changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setShowQuestionOverview(false);
  }, [selectedState]);

  // Mark question as answered
  const markQuestionAnswered = async (question: any) => {
    const id = getQuestionId(question);
    if (!answeredQuestions.includes(id)) {
      const updated = [...answeredQuestions, id];
      setAnsweredQuestions(updated);
      await setItem(ANSWERED_KEY, updated);
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
  const goToNextQuestion = () => {
    if (currentQuestionIndex < stateQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < stateQuestions.length) {
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
            animated: true
          });
        }, 100);
      }
      
      return newValue;
    });
  };

  // Handle state selection change and save to storage
  const handleStateChange = async (itemValue: string) => {
    setSelectedState(itemValue);
    // Save the selected state to storage
    if (itemValue) {
      await setItem(SELECTED_STATE_KEY, itemValue);
    }
  };

  const goBack = () => {
    router.back();
  };

  // Swipe gesture handler
  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END && !showQuestionOverview && stateQuestions.length > 0) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Use both translation distance and velocity for better detection
      const swipeThreshold = 50;
      const velocityThreshold = 500;
      
      if ((translationX < -swipeThreshold || velocityX < -velocityThreshold) && currentQuestionIndex < stateQuestions.length - 1) {
        goToNextQuestion();
      } else if ((translationX > swipeThreshold || velocityX > velocityThreshold) && currentQuestionIndex > 0) {
        goToPreviousQuestion();
      }
    }
  };

  const currentQuestion = stateQuestions[currentQuestionIndex];

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
    stateButton: {
      backgroundColor: colors.success,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 16,
      minHeight: 32,
      minWidth: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compactSelectorContainer: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    selectorLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    pickerContainer: { 
      backgroundColor: colors.card, 
      borderRadius: 10, 
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
      position: 'relative',
    },
    picker: { 
      height: Platform.OS === 'android' ? 50 : 44, 
      width: '100%',
      color: colors.text,
    },
    pickerDisplayText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    pickerArrow: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 8,
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
      backgroundColor: colors.tint,
      borderColor: colors.tintSecondary,
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
              {t.nav_state || 'State Questions'}
            </Text>
            <Text style={dynamicStyles.counterText}>
              {stateQuestions.length > 0 ? `Q${currentQuestionIndex + 1}/${stateQuestions.length} • ${selectedState}` : `${selectedState || t.select_state}`}
            </Text>
          </View>
          <View style={styles.rightActions}>
            {stateQuestions.length > 0 && (
              <TouchableOpacity 
                style={dynamicStyles.overviewButton}
                onPress={toggleQuestionOverview}
                accessibilityLabel={showQuestionOverview ? t.hide : t.show_overview}
                activeOpacity={0.7}
              >
                <GridIcon size={16} color="#ffffff" />
              </TouchableOpacity>
            )}
            <View style={styles.placeholderButton} />
          </View>
        </View>
        
        {/* Compact State Selector - always visible */}
        <View style={dynamicStyles.compactSelectorContainer}>
          <Text style={dynamicStyles.selectorLabel}>{t.select_bundesland}:</Text>
          <View style={dynamicStyles.pickerContainer}>
            <RNPickerSelect
              value={selectedState}
              onValueChange={(value) => handleStateChange(value || '')}
              items={bundeslaender.map(state => ({
                label: state,
                value: state,
                key: state
              }))}
              style={{
                inputIOS: {
                  fontSize: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  color: colors.text,
                  paddingRight: 40,
                  backgroundColor: 'transparent',
                  height: 44,
                },
                inputAndroid: {
                  fontSize: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  color: colors.text,
                  paddingRight: 40,
                  backgroundColor: 'transparent',
                  height: 44,
                },
                iconContainer: {
                  top: Platform.OS === 'ios' ? 12 : 16,
                  right: 15,
                },
                placeholder: {
                  color: colors.textSecondary,
                  fontSize: 16,
                },
              }}
              placeholder={{
                label: t.select_state || 'Select a state...',
                value: '',
                color: colors.textSecondary,
              }}
              useNativeAndroidPickerStyle={false}
              Icon={() => {
                return <Text style={{ fontSize: 12, color: colors.textSecondary }}>▼</Text>;
              }}
            />
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
          {stateQuestions.length === 0 ? (
            // Empty State
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📍</Text>
              <Text style={dynamicStyles.emptyTitle}>
                {selectedState ? t.no_questions_available : t.select_state}
              </Text>
              <Text style={dynamicStyles.emptyDesc}>
                {selectedState 
                  ? `${t.no_questions_found} ${selectedState}. ${t.try_different_state}`
                  : t.please_select_bundesland
                }
              </Text>
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
                onAnswerSelected={() => markQuestionAnswered(currentQuestion)}
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
                <Text style={dynamicStyles.overviewTitle}>{selectedState} {t.questions}</Text>
                <View style={styles.questionsGrid}>
                  {stateQuestions.map((_, index) => {
                    const questionId = getQuestionId(stateQuestions[index]);
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
                        accessibilityLabel={`${t.question} ${index + 1}${isAnswered ? ` (${t.answered})` : ''}${isCurrent ? ` (${t.current})` : ''}`}
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
      {stateQuestions.length > 0 && !showQuestionOverview && (
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
            style={[dynamicStyles.navButton, currentQuestionIndex === stateQuestions.length - 1 && dynamicStyles.disabledButton]}
            onPress={goToNextQuestion}
            disabled={currentQuestionIndex === stateQuestions.length - 1}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.navButtonText, currentQuestionIndex === stateQuestions.length - 1 && dynamicStyles.disabledButtonText]}>
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
  overviewButtonText: {
    fontSize: 14,
  },
  stateButtonText: {
    fontSize: 14,
  },
  pickerItemIOS: {
    fontSize: 16,
    color: '#000',
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