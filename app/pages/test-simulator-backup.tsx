import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform, 
  StatusBar,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { translations } from '../../src/data/translations-new';
import { questionsData } from '../../src/data/questions';
import QuestionCard from '../../src/components/QuestionCard';
import { Picker } from '@react-native-picker/picker';
import { getItem } from '../../src/utils/storage';

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

function getQuestionId(question: any) {
  return `${question.id || question.question.slice(0, 50)}`;
}

export default function TestSimulatorScreen() {
  const [lang, setLang] = useState<'EN' | 'DE'>('EN');
  const t = translations[lang];
  const [selectedState, setSelectedState] = useState(bundeslaender[0] || '');
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [loading, setLoading] = useState(false);

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

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
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
        Alert.alert('Error', 'No questions generated');
        return;
      }
      
      if (questions.length !== 33) {
        Alert.alert('Error', `Expected 33 questions, but received ${questions.length}`);
        return;
      }
      
      setTestQuestions(questions);
      setTestStarted(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(3600);
      setTestCompleted(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to generate test');
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

  const goBack = () => {
    router.back();
  };

  const currentQuestion = testQuestions[currentQuestionIndex];
  const results = testCompleted ? calculateResults() : null;

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
      
      {/* App Bar */}
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
              {t.test_simulator_title}
            </Text>
            {testStarted && (
              <Text style={styles.counterText}>
                {testCompleted ? 'Test Completed' : `Q${currentQuestionIndex + 1}/${testQuestions.length} • ${formatTime(timeLeft)}`}
              </Text>
            )}
          </View>
          <View style={styles.rightActions}>
            {testStarted && (
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetTest}
                accessibilityLabel="Reset test"
                activeOpacity={0.7}
              >
                <Text style={styles.resetButtonText}>🔄</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Main Content */}
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
                  <Text style={styles.iconEmoji}>🎯</Text>
                </View>
                <Text style={styles.setupTitle}>{t.test_simulator_title}</Text>
                <Text style={styles.setupDesc}>{t.test_simulator_desc}</Text>
              </View>

              {/* Test Information */}
              <View style={styles.setupCard}>
                <Text style={styles.sectionTitle}>📋 Test Information</Text>
                
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoEmoji}>🎯</Text>
                    <Text style={styles.infoText}>33 Questions Total</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoEmoji}>✅</Text>
                    <Text style={styles.infoText}>17+ Correct to Pass</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoEmoji}>⏰</Text>
                    <Text style={styles.infoText}>60 Minutes Time Limit</Text>
                  </View>
                </View>
              </View>

              {/* State Selection */}
              <View style={styles.setupCard}>
                <Text style={styles.sectionTitle}>📍 Select Bundesland</Text>
                
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedState}
                    style={[styles.picker, Platform.OS === 'ios' && styles.pickerIOS]}
                    onValueChange={(itemValue: string) => setSelectedState(itemValue)}
                    itemStyle={Platform.OS === 'ios' ? styles.pickerItemIOS : undefined}
                    mode={Platform.OS === 'android' ? 'dropdown' : undefined}
                  >
                    {bundeslaender.map(state => (
                      <Picker.Item 
                        label={state} 
                        value={state} 
                        key={state}
                        color={Platform.OS === 'ios' ? '#000' : '#333'}
                      />
                    ))}
                  </Picker>
                  {Platform.OS === 'ios' && (
                    <View style={styles.pickerOverlay} pointerEvents="none">
                      <Text style={styles.pickerDisplayText} numberOfLines={1}>
                        {selectedState}
                      </Text>
                      <Text style={styles.pickerArrow}>▼</Text>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity 
                  style={[styles.startButton, loading && styles.disabledButton]} 
                  onPress={handleGenerateTest}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startButtonText}>
                    {loading ? '⏳ Generating Test...' : '🚀 Start Test'}
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
                <Text style={styles.setupTitle}>
                  {results?.passed ? 'Congratulations!' : 'Test Not Passed'}
                </Text>
                <Text style={styles.setupDesc}>
                  {results?.passed ? 'You have successfully passed the test!' : 'You need at least 17 correct answers to pass.'}
                </Text>
              </View>

              {/* Results Stats */}
              <View style={styles.setupCard}>
                <Text style={styles.sectionTitle}>📊 Test Results</Text>
                
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{results?.correct}/{results?.total}</Text>
                    <Text style={styles.statLabel}>Correct Answers</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{results?.percentage}%</Text>
                    <Text style={styles.statLabel}>Score</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{results?.generalCorrect}</Text>
                    <Text style={styles.statLabel}>General Questions</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{results?.stateCorrect}</Text>
                    <Text style={styles.statLabel}>{selectedState}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={resetTest}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startButtonText}>🔄 Take Another Test</Text>
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
            <View style={styles.testProgressCard}>
              <View style={styles.progressInfo}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>
                    {Object.keys(answers).length}/{testQuestions.length}
                  </Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>Time Left</Text>
                  <Text style={[styles.progressValue, timeLeft < 300 && styles.timerWarning]}>
                    {formatTime(timeLeft)}
                  </Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>State</Text>
                  <Text style={styles.progressValue}>{selectedState}</Text>
                </View>
              </View>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View 
                  style={[styles.progressBarFill, { 
                    width: `${(Object.keys(answers).length / testQuestions.length) * 100}%` 
                  }]} 
                />
              </View>
            </View>

            {/* Current Question */}
            {currentQuestion && (
              <View style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.questionStatus}>
                    <View style={[styles.questionStatusDot, 
                      answers[getQuestionId(currentQuestion)] ? styles.questionStatusDotAnswered : styles.questionStatusDotUnanswered
                    ]} />
                    <Text style={styles.questionStatusText}>
                      Question {currentQuestionIndex + 1} of {testQuestions.length}
                      {answers[getQuestionId(currentQuestion)] ? ' (Answered)' : ''}
                    </Text>
                  </View>
                  <Text style={styles.questionBundesland}>{currentQuestion.bundesland}</Text>
                </View>
                
                <QuestionCard 
                  question={currentQuestion} 
                  index={currentQuestionIndex}
                  selectedAnswer={answers[getQuestionId(currentQuestion)]}
                  onAnswer={(answer: string) => handleAnswer(getQuestionId(currentQuestion), answer)}
                  isTestMode={true}
                />
              </View>
            )}

            {/* Question Grid */}
            <View style={styles.questionGridCard}>
              <Text style={styles.sectionTitle}>Question Progress</Text>
              
              <View style={styles.questionGridContainer}>
                {testQuestions.map((question, index) => {
                  const questionId = getQuestionId(question);
                  const isAnswered = answers[questionId] !== undefined;
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCurrentQuestionIndex(index)}
                      style={[styles.questionGridItem,
                        isCurrent ? styles.questionGridItemCurrent :
                        isAnswered ? styles.questionGridItemAnswered : styles.questionGridItemUnanswered
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.questionGridItemText,
                        isCurrent ? styles.questionGridItemTextCurrent :
                        isAnswered ? styles.questionGridItemTextAnswered : styles.questionGridItemTextUnanswered
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
                  <View style={[styles.legendColor, styles.currentColor]} />
                  <Text style={styles.legendText}>Current</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.answeredColor]} />
                  <Text style={styles.legendText}>Answered</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, styles.unansweredColor]} />
                  <Text style={styles.legendText}>Not Answered</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Navigation Controls */}
      {testStarted && !testCompleted && (
        <View style={styles.navigationControls}>
          <TouchableOpacity 
            style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
            onPress={prevQuestion}
            disabled={currentQuestionIndex === 0}
            activeOpacity={0.7}
          >
            <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.disabledButtonText]}>
              ← Previous
            </Text>
          </TouchableOpacity>
          
          {currentQuestionIndex === testQuestions.length - 1 ? (
            <TouchableOpacity 
              style={[styles.navButton, styles.submitButton]}
              onPress={submitTest}
              activeOpacity={0.7}
            >
              <Text style={styles.navButtonText}>
                🏁 Submit Test
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.navButton}
              onPress={nextQuestion}
              activeOpacity={0.7}
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </TouchableOpacity>
          )}
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
  counterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resetButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    minHeight: 32,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
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
  
  // Setup Screen Styles
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
  setupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#11181c',
    marginBottom: 6,
    textAlign: 'center',
  },
  setupDesc: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  setupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#11181c',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  infoEmoji: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#0a7ea4',
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#fff', 
    borderRadius: 10, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8eaed',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    position: 'relative',
    marginBottom: 16,
  },
  picker: {
    height: Platform.OS === 'android' ? 50 : 44, 
    width: '100%',
    color: Platform.OS === 'android' ? '#333' : 'transparent',
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
  pickerDisplayText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  pickerArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: '#0a7ea4',
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
    backgroundColor: '#e8eaed',
  },
  
  // Results Screen Styles
  resultsSection: {
    paddingHorizontal: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#687076',
    textAlign: 'center',
  },
  
  // Test In Progress Styles
  testProgressCard: {
    backgroundColor: '#fff',
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
    borderColor: '#e8eaed',
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
  progressLabel: {
    fontSize: 10,
    color: '#687076',
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  timerWarning: {
    color: '#dc2626',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e8eaed',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  
  // Question Card Styles
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8eaed',
    overflow: 'hidden',
  },
  questionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  questionStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#11181c',
  },
  questionBundesland: {
    fontSize: 10,
    color: '#687076',
  },
  
  // Question Grid
  questionGridCard: {
    backgroundColor: '#fff',
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
    borderColor: '#e8eaed',
  },
  questionGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  questionGridItem: {
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
    minHeight: 32,
  },
  questionGridItemCurrent: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  questionGridItemAnswered: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  questionGridItemUnanswered: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  questionGridItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  questionGridItemTextCurrent: {
    color: '#ffffff',
  },
  questionGridItemTextAnswered: {
    color: '#16a34a',
  },
  questionGridItemTextUnanswered: {
    color: '#6b7280',
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
    fontSize: 10,
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
  submitButton: {
    backgroundColor: '#10b981',
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