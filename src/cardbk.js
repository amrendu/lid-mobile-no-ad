import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getItem, setItem } from '../utils/storage';
import { refreshStats } from '../utils/statsManager';

const { width } = Dimensions.get('window');

// Helper to generate a unique id for a question
function getQuestionId(q) {
  const raw = `${q.question}::${(q.options || []).join('|')}::${q.answer || ''}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) + raw.charCodeAt(i);
  }
  return 'q_' + (hash >>> 0).toString(36);
}

// Function to save incorrect answers to AsyncStorage
async function saveIncorrectAnswer(question) {
  try {
    const INCORRECT_KEY = 'incorrect_questions_v2';
    const incorrectIds = await getItem(INCORRECT_KEY, []);
    const questionId = getQuestionId(question);

    // Only add if not already in the list
    if (!incorrectIds.includes(questionId)) {
      const updatedIds = [...incorrectIds, questionId];
      await setItem(INCORRECT_KEY, updatedIds);
      console.log('Saved incorrect answer:', questionId);

      // Update stats across the app
      refreshStats();
    }
  } catch (error) {
    console.error('Error saving incorrect answer:', error);
  }
}

export default function QuestionCard({ 
  question, 
  index, 
  lang = 'EN', 
  isBookmarked = false, 
  onToggleBookmark, 
  onToggleLang = null,
  selectedAnswer = null,
  onAnswer = null,
  onAnswerSelected = null,
  isTestMode = false,
  showResultsImmediately = false
}) {
  const [selected, setSelected] = useState(selectedAnswer !== null ? question.options.indexOf(selectedAnswer) : null);
  const [showResult, setShowResult] = useState(
    showResultsImmediately || (selectedAnswer !== null && !isTestMode)
  );
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  // Track translation state locally for this question only
  const [showTranslation, setShowTranslation] = useState(false);
  const qTextDE = question.question;
  const qTextEN = question.question_en || '';
  const optionsDE = question.options;
  const optionsEN = question.options_en || [];
  const answerDE = question.answer;
  const answerEN = question.answer_en || '';
  
  // For options, show both if translation is enabled
  const isCorrect = selected !== null && (optionsDE[selected] === answerDE || (showTranslation && optionsEN[selected] === answerEN));

  // Card entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Update selected state when selectedAnswer prop changes
  useEffect(() => {
    if (selectedAnswer !== null) {
      const answerIndex = question.options.indexOf(selectedAnswer);
      setSelected(answerIndex >= 0 ? answerIndex : null);
      setShowResult(showResultsImmediately || !isTestMode); // Show result based on props
    } else {
      setSelected(null);
      setShowResult(showResultsImmediately); // Show result only if explicitly requested
    }
  }, [selectedAnswer, question.options, isTestMode, showResultsImmediately]);

  const handleSelect = (idx) => {
    if (showResult && !isTestMode) return;
    
    // Add pulse animation for selection feedback
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    setSelected(idx);
    
    // Determine if answer is correct
    const isCorrectAnswer = question.options[idx] === question.answer;

    if (isTestMode && onAnswer) {
      // In test mode, call the onAnswer callback with the selected option text
      onAnswer(question.options[idx]);

      // Even in test mode, track incorrect answers (just don't show results yet)
      if (!isCorrectAnswer) {
        saveIncorrectAnswer(question);
      }
    } else {
      // In practice mode, show result immediately
      setShowResult(true);

      // Track incorrect answers
      if (!isCorrectAnswer) {
        saveIncorrectAnswer(question);
      }
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
    
    // Call onAnswerSelected if provided (for tracking answered questions)
    if (onAnswerSelected) {
      onAnswerSelected();
    }
  };

  // Get correct answer index for highlighting
  const getCorrectIndex = () => {
    return optionsDE.findIndex(opt => opt === answerDE);
  };

  return (
    <Animated.View style={[
      styles.cardContainer,
      { 
        transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
        opacity: fadeAnim
      }
    ]}>
      <LinearGradient
        colors={['#ffffff', '#f8faff', '#f0f7ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.questionMeta}>
              {question.question_number ? (
                <View style={styles.questionNumberBadge}>
                  <Text style={styles.questionNumberText}>#{question.question_number}</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={['#3b82f6', '#6366f1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.indexContainer}
                >
                  <Text style={styles.index}>{index + 1}</Text>
                </LinearGradient>
              )}
            </View>
            
            {/* Bookmark and Translate buttons */}
            <View style={styles.actionRow}>
              {onToggleBookmark && (
                <TouchableOpacity
                  onPress={() => {
                    // Call the provided toggle function
                    onToggleBookmark();
                    // Also refresh stats to ensure counters are in sync
                    setTimeout(() => refreshStats(), 100);
                  }}
                  style={[styles.actionBtn, isBookmarked && styles.actionBtnActive]}
                  accessibilityLabel={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.icon, isBookmarked ? styles.iconActive : styles.iconInactive]}>
                    {isBookmarked ? '★' : '☆'}
                  </Text>
                  <Text style={[styles.actionLabel, isBookmarked && styles.actionLabelActive]}>
                    {isBookmarked ? 'Saved' : 'Save'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Translation toggle button that works independently of app language */}
              <TouchableOpacity
                onPress={() => setShowTranslation(prev => !prev)}
                style={[styles.actionBtn, showTranslation && styles.actionBtnTranslateActive]}
                accessibilityLabel="Translate Question"
                activeOpacity={0.7}
              >
                <Text style={[styles.icon, styles.iconTranslate]}>🌐</Text>
                <Text style={[styles.actionLabel, showTranslation && styles.actionLabelTranslateActive]}>
                  {showTranslation ? 'Hide' : 'Translate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Show image if present */}
          {question.image_paths && question.image_paths.length > 0 && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: question.image_paths[0] }}
                style={styles.questionImage}
                resizeMode="contain"
              />
            </View>
          )}
          
          <View style={styles.questionContainer}>
            <View style={styles.questionIconContainer}>
              <Text style={styles.questionIcon}>💭</Text>
            </View>
            <View style={styles.questionTextContainer}>
              <Text style={styles.text}>{qTextDE}</Text>
              {showTranslation && qTextEN && (
                <View style={styles.translationContainer}>
                  <Text style={styles.translationIcon}>🌐</Text>
                  <Text style={styles.textTranslation}>{qTextEN}</Text>
                </View>
              )}
            </View>
          </View>
        
          <View style={styles.optionsWrap}>
            {optionsDE.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrectAnswer = opt === answerDE;
              
              let optionStyle = [styles.optionBtn];
              let optionIconStyle = null;
              let optionIcon = null;
              let optionGradientColors = ['#f8faff', '#ffffff'];
              
              if (showResult && !isTestMode) {
                if (isCorrectAnswer) {
                  optionStyle.push(styles.optionCorrect);
                  optionIconStyle = styles.optionIconCorrect;
                  optionIcon = '✓';
                  optionGradientColors = ['#ecfdf5', '#f0fdf4'];
                } else if (isSelected) {
                  optionStyle.push(styles.optionWrong);
                  optionIconStyle = styles.optionIconWrong;
                  optionIcon = '✗';
                  optionGradientColors = ['#fef2f2', '#fef7f7'];
                }
              } else if (isSelected) {
                optionStyle.push(styles.optionSelected);
                optionGradientColors = ['#dbeafe', '#eff6ff'];
              }
              
              // Use a unique key: question_number + option index
              const optionKey = `${question.question_number || index}-${idx}`;
              
              return (
                <TouchableOpacity
                  key={optionKey}
                  onPress={() => handleSelect(idx)}
                  disabled={showResult && !isTestMode}
                  activeOpacity={0.8}
                  style={styles.optionTouchable}
                >
                  <LinearGradient
                    colors={optionGradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.optionGradient, optionStyle]}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionIndicator}>
                        <Text style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</Text>
                      </View>
                      
                      <View style={styles.optionTextContainer}>
                        <Text style={[
                          styles.optionText, 
                          isSelected && (!showResult || isTestMode) ? styles.optionTextSelected : null,
                          showResult && !isTestMode && isCorrectAnswer ? styles.optionTextCorrect : null,
                          showResult && !isTestMode && isSelected && !isCorrectAnswer ? styles.optionTextWrong : null
                        ]}>
                          {opt}
                        </Text>
                        
                        {showTranslation && optionsEN[idx] && (
                          <View style={styles.translationContainer}>
                            <Text style={styles.translationIcon}>🌐</Text>
                            <Text style={styles.optionTextTranslation}>{optionsEN[idx]}</Text>
                          </View>
                        )}
                      </View>
                      
                      {optionIcon && (
                        <View style={[styles.optionIconContainer, optionIconStyle]}>
                          <Text style={styles.optionIconText}>{optionIcon}</Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {showResult && !isTestMode && (
            <Animated.View 
              style={[
                styles.resultContainer, 
                { opacity: fadeAnim }
              ]}
            >
              <LinearGradient
                colors={isCorrect ? ['#ecfdf5', '#f0fdf4'] : ['#fef2f2', '#fef7f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.resultGradient,
                  isCorrect ? styles.resultContainerCorrect : styles.resultContainerWrong
                ]}
              >
                <View style={styles.resultContent}>
                  <Text style={styles.resultIcon}>
                    {isCorrect ? '🎉' : '💡'}
                  </Text>
                  <Text style={isCorrect ? styles.correctText : styles.wrongText}>
                    {isCorrect 
                      ? (lang === 'DE' ? 'Richtig!' : 'Correct!') 
                      : (lang === 'DE' ? 'Falsch' : 'Incorrect')}
                  </Text>
                  
                  {!isCorrect && (
                    <Text style={styles.correctAnswerText}>
                      {lang === 'DE' ? 'Richtige Antwort: ' : 'Correct answer: '}
                      <Text style={styles.correctAnswerValue}>
                        {optionsDE[getCorrectIndex()]}
                      </Text>
                    </Text>
                  )}
                </View>
              </LinearGradient>
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 2, // Minimal margin for maximum content
    marginHorizontal: 8, // Reduced side margins
  },
  cardGradient: {
    borderRadius: 16,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  card: {
    padding: 12, // Minimal padding for maximum content visibility
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indexContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  index: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#ffffff',
  },
  questionNumberBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  questionNumberText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(248, 250, 255, 0.8)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  questionImage: {
    width: width * 0.6,
    height: 100,
    borderRadius: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 255, 0.8)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    minHeight: 32,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  actionBtnActive: {
    backgroundColor: 'rgba(255, 249, 230, 0.9)',
    borderColor: '#f7b500',
  },
  actionBtnTranslateActive: {
    backgroundColor: 'rgba(219, 234, 254, 0.9)',
    borderColor: '#3b82f6',
  },
  icon: {
    fontSize: 16,
    marginRight: 4,
  },
  iconActive: {
    color: '#f7b500',
  },
  iconInactive: {
    color: '#9ca3af',
  },
  iconTranslate: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  actionLabelActive: {
    color: '#f7b500',
  },
  actionLabelTranslateActive: {
    color: '#3b82f6',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    backgroundColor: 'rgba(248, 250, 255, 0.5)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  questionIconContainer: {
    marginRight: 8,
    marginTop: 1,
  },
  questionIcon: {
    fontSize: 18,
  },
  questionTextContainer: {
    flex: 1,
  },
  text: {
    fontSize: 15, // Compact sizing for more content visibility
    color: '#1f2937',
    lineHeight: 22, // Tighter line height
    fontWeight: '600',
  },
  translationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(219, 234, 254, 0.5)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  translationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  textTranslation: {
    fontSize: 15,
    color: '#3b82f6',
    lineHeight: 22,
    fontWeight: '500',
    flex: 1,
  },
  optionsWrap: {
    marginBottom: 12,
    gap: 8,
  },
  optionTouchable: {
    borderRadius: 16,
  },
  optionGradient: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(229, 231, 235, 0.8)',
  },
  optionBtn: {
    paddingVertical: 12, // More compact for space efficiency
    paddingHorizontal: 14, // Reduced horizontal padding
    minHeight: 48, // Smaller but still accessible
  },
  optionSelected: {
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  optionCorrect: {
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  optionWrong: {
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 22,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#10b981',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#ef4444',
    fontWeight: '600',
  },
  optionTextTranslation: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 6,
    fontWeight: '500',
  },
  optionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconCorrect: {
    backgroundColor: '#10b981',
  },
  optionIconWrong: {
    backgroundColor: '#ef4444',
  },
  optionIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 12,
  },
  resultGradient: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
  },
  resultContainerCorrect: {
    borderColor: '#10b981',
  },
  resultContainerWrong: {
    borderColor: '#ef4444',
  },
  resultContent: {
    alignItems: 'center',
  },
  resultIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  correctText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  wrongText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  correctAnswerValue: {
    fontWeight: '600',
    color: '#10b981',
  },
});
