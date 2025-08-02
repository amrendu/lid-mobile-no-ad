import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTranslation } from '../../src/hooks/useTranslation';
import { questionsData } from '../../src/data/questions';
import QuestionCard from '../../src/components/QuestionCard';
import RNPickerSelect from 'react-native-picker-select';
import { getItem, setItem } from '../../src/utils/storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../src/utils/languageContext';

// Extract unique Bundesländer from questions
const bundeslaender = [
  ...new Set(questionsData.map(q => q.bundesland).filter(b => b && b !== 'General'))
].sort();

function getRandomTestQuestions(selectedState: string) {
  const general = questionsData.filter(q => q.bundesland === 'General');
  const state = questionsData.filter(q => q.bundesland === selectedState);
  // 30 general + 3 state
  const shuffledGeneral = general.sort(() => 0.5 - Math.random()).slice(0, 30);
  const shuffledState = state.sort(() => 0.5 - Math.random()).slice(0, 3);
  return [...shuffledGeneral, ...shuffledState].sort(() => 0.5 - Math.random());
}

// Helper to generate a unique id for a question (robust, hash-based)
function getQuestionId(q: { question: string; options: string[]; answer?: string }): string {
  const raw = `${q.question}::${(q.options || []).join('|')}::${q.answer || ''}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) + raw.charCodeAt(i);
  }
  return 'q_' + (hash >>> 0).toString(36);
}

export default function TestSimulatorScreen() {
  const { colors, theme } = useTheme();
  const translation = useTranslation();
  const t = (translation as any).t || {};
  const { language } = useLanguage();
  const navigation = useNavigation();
  const [selectedState, setSelectedState] = useState(bundeslaender[0] || '');
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  // Load bookmarks from storage
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const bookmarksData = await getItem('bookmarked_questions_v2', null);
        setBookmarked(bookmarksData || []);
      } catch (error) {
        console.error('Error loading app data:', error);
      }
    };

    loadAppData();
  }, []);

  // Timer effect
  useEffect(() => {
    let timer: any;
    if (testStarted && !testCompleted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTestCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, testCompleted, timeLeft]);

  const handleGenerateTest = () => {
    if (!selectedState) return;
    
    setLoading(true);
    
    try {
      const questions = getRandomTestQuestions(selectedState);
      
      if (!questions || questions.length === 0) {
        Alert.alert(t.error, t.no_questions_generated);
        return;
      }
      
      if (questions.length !== 33) {
        Alert.alert(t.error, `${t.expected} 33 ${t.questions}, ${t.but_received} ${questions.length}`);
        return;
      }
      
      setTestQuestions(questions);
      setTestStarted(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(3600);
      setTestCompleted(false);
    } catch (err) {
      Alert.alert(t.error, t.failed_to_generate_test);
      setTestStarted(false);
      setTestQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, selectedOption: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitTest = () => {
    setTestCompleted(true);
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setTestQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(3600);
  };

  const calculateResults = () => {
    let correct = 0;
    let generalCorrect = 0;
    let stateCorrect = 0;
    
    testQuestions.forEach(question => {
      const userAnswer = answers[getQuestionId(question)];
      if (userAnswer === question.answer) {
        correct++;
        if (question.bundesland === 'General') {
          generalCorrect++;
        } else {
          stateCorrect++;
        }
      }
    });

    const totalQuestions = testQuestions.length;
    const passed = correct >= 17;
    const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    return {
      correct,
      total: totalQuestions,
      generalCorrect,
      stateCorrect,
      passed,
      percentage,
      answeredQuestions: Object.keys(answers).length,
    };
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

    // Save to storage and update stats
    await setItem('bookmarked_questions_v2', updated);
    const { updateBookmarks } = require('../../src/utils/statsManager');
    await updateBookmarks(updated);
  };

  const goBack = () => {
    router.back();
  };

  // Swipe gesture handler
  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END && testStarted && !testCompleted) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Use both translation distance and velocity for better detection
      const swipeThreshold = 50;
      const velocityThreshold = 500;
      
      if ((translationX < -swipeThreshold || velocityX < -velocityThreshold) && currentQuestionIndex < testQuestions.length - 1) {
        nextQuestion();
      } else if ((translationX > swipeThreshold || velocityX > velocityThreshold) && currentQuestionIndex > 0) {
        prevQuestion();
      }
    }
  };

  const currentQuestion = testQuestions[currentQuestionIndex];
  const results = testCompleted ? calculateResults() : null;

  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: colors.background,
    },
    setupTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    setupDesc: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 8,
    },
    setupCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.infoBackground,
      padding: 10,
      borderRadius: 8,
      gap: 10,
    },
    infoText: {
      fontSize: 14,
      color: colors.info,
      flex: 1,
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
      marginBottom: 16,
    },
    picker: {
      height: 44, 
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
    startButton: {
      backgroundColor: colors.tint,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    startButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    disabledButton: {
      backgroundColor: colors.backgroundTertiary,
    },
    statItem: {
      width: '48%',
      backgroundColor: colors.infoBackground,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.info,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    testProgressCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 8,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    progressValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.info,
    },
    timerWarning: {
      color: colors.error,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 4,
      overflow: 'hidden',
    },
    questionCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginHorizontal: 8,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    questionHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    questionStatusText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    questionBundesland: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    questionGridCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 8,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    questionGridItem: {
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
      minHeight: 32,
    },
    questionGridItemCurrent: {
      backgroundColor: colors.tint,
      borderColor: colors.tintSecondary,
    },
    questionGridItemAnswered: {
      backgroundColor: colors.successBackground,
      borderColor: colors.success,
    },
    questionGridItemUnanswered: {
      backgroundColor: colors.backgroundTertiary,
      borderColor: colors.border,
    },
    questionGridItemText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    questionGridItemTextCurrent: {
      color: '#ffffff',
    },
    questionGridItemTextAnswered: {
      color: colors.success,
    },
    questionGridItemTextUnanswered: {
      color: colors.textSecondary,
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
    legendText: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '500',
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
    submitButton: {
      backgroundColor: colors.success,
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
    <SafeAreaView style={dynamicStyles.container} edges={['left', 'right', 'bottom']}>

      {/* Main Content with Pan Gesture Handler */}
      <PanGestureHandler 
        onHandlerStateChange={onHandlerStateChange}
        minPointers={1}
        maxPointers={1}
        avgTouches
      >
        <View style={styles.mainContent}>
          {!testStarted ? (
          // Test Setup Screen
          <ScrollView 
            style={styles.questionScrollView}
            contentContainerStyle={styles.questionScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.setupSection}>
              {/* Header Section */}
              <View style={styles.setupHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconEmoji}>🇩🇪</Text>
                </View>
                <Text style={dynamicStyles.setupTitle}>{t.test_simulator_title}</Text>
                <Text style={dynamicStyles.setupDesc}>{t.test_simulator_desc}</Text>
              </View>

              {/* Test Information */}
              <View style={dynamicStyles.setupCard}>
                <Text style={dynamicStyles.sectionTitle}>📋 {t.test_information}</Text>
                
                <View style={styles.infoGrid}>
                  <View style={dynamicStyles.infoItem}>
                    <Text style={styles.infoEmoji}>🎯</Text>
                    <Text style={dynamicStyles.infoText}>{t.test_33_questions}</Text>
                  </View>
                  <View style={dynamicStyles.infoItem}>
                    <Text style={styles.infoEmoji}>✅</Text>
                    <Text style={dynamicStyles.infoText}>{t.test_17_correct}</Text>
                  </View>
                  <View style={dynamicStyles.infoItem}>
                    <Text style={styles.infoEmoji}>⏰</Text>
                    <Text style={dynamicStyles.infoText}>{t.test_60_minutes}</Text>
                  </View>
                </View>
              </View>

              {/* State Selection */}
              <View style={dynamicStyles.setupCard}>
                <Text style={dynamicStyles.sectionTitle}>📍 {t.select_bundesland}</Text>
                
                <View style={dynamicStyles.pickerContainer}>
                  <RNPickerSelect
                    value={selectedState}
                    onValueChange={(value) => {
                      if (value) {
                        setSelectedState(value);
                      }
                    }}
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
                        height: 50,
                      },
                      inputAndroid: {
                        fontSize: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        color: colors.text,
                        paddingRight: 40,
                        backgroundColor: 'transparent',
                        height: 50,
                      },
                      iconContainer: {
                        top: 15,
                        right: 15,
                      },
                      placeholder: {
                        color: '#9EA0A4',
                        fontSize: 16,
                      },
                    }}
                    placeholder={{
                      label: t.select_bundesland || 'Select your Bundesland...',
                      value: null,
                      color: '#9EA0A4',
                    }}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => {
                      return <Text style={{ fontSize: 14, color: colors.textSecondary }}>▼</Text>;
                    }}
                  />
                </View>
                
                <TouchableOpacity 
                  style={[dynamicStyles.startButton, loading && dynamicStyles.disabledButton]} 
                  onPress={handleGenerateTest}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={dynamicStyles.startButtonText}>
                    {loading ? `⏳ ${t.generating_test}` : `🚀 ${t.start_test}`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : testCompleted ? (
          // Test Results Screen
          <ScrollView 
            style={styles.questionScrollView}
            contentContainerStyle={styles.questionScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.resultsSection}>
              {/* Results Header */}
              <View style={styles.setupHeader}>
                <View style={[styles.iconContainer, { backgroundColor: results?.passed ? '#10b981' : '#ef4444' }]}>
                  <Text style={styles.iconEmoji}>{results?.passed ? '🏆' : '❌'}</Text>
                </View>
                <Text style={dynamicStyles.setupTitle}>
                  {results?.passed ? t.congratulations : t.test_not_passed}
                </Text>
                <Text style={dynamicStyles.setupDesc}>
                  {results?.passed ? t.test_passed_success : t.test_pass_requirement}
                </Text>
              </View>

              {/* Results Stats */}
              <View style={dynamicStyles.setupCard}>
                <Text style={dynamicStyles.sectionTitle}>📊 {t.test_results}</Text>
                
                <View style={styles.statsGrid}>
                  <View style={dynamicStyles.statItem}>
                    <Text style={dynamicStyles.statValue}>{results?.correct}/{results?.total}</Text>
                    <Text style={dynamicStyles.statLabel}>{t.correct_answers}</Text>
                  </View>
                  <View style={dynamicStyles.statItem}>
                    <Text style={dynamicStyles.statValue}>{results?.percentage}%</Text>
                    <Text style={dynamicStyles.statLabel}>{t.score}</Text>
                  </View>
                  <View style={dynamicStyles.statItem}>
                    <Text style={dynamicStyles.statValue}>{results?.generalCorrect}</Text>
                    <Text style={dynamicStyles.statLabel}>{t.general_questions}</Text>
                  </View>
                  <View style={dynamicStyles.statItem}>
                    <Text style={dynamicStyles.statValue}>{results?.stateCorrect}</Text>
                    <Text style={dynamicStyles.statLabel}>{selectedState}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={dynamicStyles.startButton}
                  onPress={resetTest}
                  activeOpacity={0.8}
                >
                  <Text style={dynamicStyles.startButtonText}>🔄 {t.take_another_test}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : (
          // Test In Progress
          <ScrollView 
            style={styles.questionScrollView}
            contentContainerStyle={styles.questionScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Test Progress Info */}
            <View style={dynamicStyles.testProgressCard}>
              <View style={styles.progressInfo}>
                <View style={styles.progressItem}>
                  <Text style={dynamicStyles.progressLabel}>{t.progress}</Text>
                  <Text style={dynamicStyles.progressValue}>
                    {Object.keys(answers).length}/{testQuestions.length}
                  </Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={dynamicStyles.progressLabel}>{t.time_left}</Text>
                  <Text style={[dynamicStyles.progressValue, timeLeft < 300 && dynamicStyles.timerWarning]}>
                    {formatTime(timeLeft)}
                  </Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={dynamicStyles.progressLabel}>{t.state}</Text>
                  <Text style={dynamicStyles.progressValue}>{selectedState}</Text>
                </View>
              </View>
              
              {/* Progress Bar */}
              <View style={dynamicStyles.progressBarContainer}>
                <View 
                  style={[styles.progressBarFill, { 
                    width: `${(Object.keys(answers).length / testQuestions.length) * 100}%` 
                  }]} 
                />
              </View>
            </View>

            {/* Current Question */}
            {currentQuestion && (
              <View style={dynamicStyles.questionCard}>
                <View style={dynamicStyles.questionHeader}>
                  <View style={styles.questionStatus}>
                    <View style={[styles.questionStatusDot, 
                      answers[getQuestionId(currentQuestion)] ? styles.questionStatusDotAnswered : styles.questionStatusDotUnanswered
                    ]} />
                    <Text style={dynamicStyles.questionStatusText}>
                      {t.question} {currentQuestionIndex + 1} {t.of} {testQuestions.length}
                      {answers[getQuestionId(currentQuestion)] ? ` (${t.answered})` : ''}
                    </Text>
                  </View>
                  <Text style={dynamicStyles.questionBundesland}>{currentQuestion.bundesland}</Text>
                </View>
                
                <QuestionCard 
                  question={currentQuestion} 
                  index={currentQuestionIndex}
                  selectedAnswer={answers[getQuestionId(currentQuestion)]}
                  onAnswer={(answer: string) => handleAnswer(getQuestionId(currentQuestion), answer)}
                  isTestMode={true}
                  isBookmarked={bookmarked.includes(getQuestionId(currentQuestion))}
                  onToggleBookmark={() => toggleBookmark(currentQuestion)}
                />
              </View>
            )}

            {/* Question Grid */}
            <View style={dynamicStyles.questionGridCard}>
              <Text style={dynamicStyles.sectionTitle}>{t.question_progress}</Text>
              
              <View style={styles.questionGridContainer}>
                {testQuestions.map((question, index) => {
                  const questionId = getQuestionId(question);
                  const isAnswered = answers[questionId] !== undefined;
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCurrentQuestionIndex(index)}
                      style={[dynamicStyles.questionGridItem,
                        isCurrent ? dynamicStyles.questionGridItemCurrent :
                        isAnswered ? dynamicStyles.questionGridItemAnswered : dynamicStyles.questionGridItemUnanswered
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[dynamicStyles.questionGridItemText,
                        isCurrent ? dynamicStyles.questionGridItemTextCurrent :
                        isAnswered ? dynamicStyles.questionGridItemTextAnswered : dynamicStyles.questionGridItemTextUnanswered
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
                  <View style={[styles.legendColor, dynamicStyles.currentColor]} />
                  <Text style={dynamicStyles.legendText}>{t.current}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, dynamicStyles.answeredColor]} />
                  <Text style={dynamicStyles.legendText}>{t.answered}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, dynamicStyles.unansweredColor]} />
                  <Text style={dynamicStyles.legendText}>{t.not_answered}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
          )}
        </View>
      </PanGestureHandler>

      {/* Navigation Controls */}
      {testStarted && !testCompleted && (
        <View style={dynamicStyles.navigationControls}>
          <TouchableOpacity 
            style={[dynamicStyles.navButton, currentQuestionIndex === 0 && dynamicStyles.disabledButton]}
            onPress={prevQuestion}
            disabled={currentQuestionIndex === 0}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.navButtonText, currentQuestionIndex === 0 && dynamicStyles.disabledButtonText]}>
              ← {t.previous}
            </Text>
          </TouchableOpacity>
          
          {currentQuestionIndex === testQuestions.length - 1 ? (
            <TouchableOpacity 
              style={[dynamicStyles.navButton, dynamicStyles.submitButton]}
              onPress={submitTest}
              activeOpacity={0.7}
            >
              <Text style={dynamicStyles.navButtonText}>
                🏁 {t.submit_test}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={dynamicStyles.navButton}
              onPress={nextQuestion}
              activeOpacity={0.7}
            >
              <Text style={dynamicStyles.navButtonText}>{t.next} →</Text>
            </TouchableOpacity>
          )}
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
  setupSection: {
    paddingHorizontal: 8,
  },
  setupHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 30,
  },
  infoGrid: {
    gap: 8,
  },
  infoEmoji: {
    fontSize: 16,
  },
  pickerIOS: {
    opacity: 0,
  },
  pickerItemIOS: {
    fontSize: 16,
    color: '#000',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  resultsSection: {
    paddingHorizontal: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  questionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  questionStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  questionStatusDotAnswered: {
    backgroundColor: '#10b981',
  },
  questionStatusDotUnanswered: {
    backgroundColor: '#0a7ea4',
  },
  questionGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
  },
});