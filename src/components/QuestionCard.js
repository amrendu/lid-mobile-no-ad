import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { getItem, setItem } from '../utils/storage';
import { refreshStats } from '../utils/statsManager';
import { getImageSource } from '../utils/imageMapper';

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

/**
 * @param {Object} props
 * @param {Object} props.question
 * @param {number} props.index
 * @param {string} [props.lang]
 * @param {boolean} [props.isBookmarked]
 * @param {function} [props.onToggleBookmark]
 * @param {function} [props.onToggleLang]
 * @param {string|null} [props.selectedAnswer]
 * @param {function|null} [props.onAnswer]
 * @param {function|null} [props.onAnswerSelected]  // Allow a function or null
 * @param {boolean} [props.isTestMode]
 * @param {boolean} [props.showResultsImmediately]
 */
export default function QuestionCard({
  question,
  index,
  lang = 'EN',
  isBookmarked = false,
  onToggleBookmark,
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

  // Track translation state - now toggles between languages instead of showing both
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

  // Toggle translation with visual feedback
  const handleTranslationToggle = () => {
    setShowTranslation(prev => !prev);
  };

  return (
    <Animated.View style={[
      styles.cardContainer,
      {
        transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
        opacity: fadeAnim
      }
    ]}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.questionMeta}>
            {question.question_number ? (
              <View style={styles.questionNumberBadge}>
                <Text style={styles.questionNumberText}>#{question.question_number}</Text>
              </View>
            ) : (
              <View style={styles.indexContainer}>
                <Text style={styles.index}>{index + 1}</Text>
              </View>
            )}
          </View>

          {/* Bookmark and Translate buttons */}
          <View style={styles.actionRow}>
            {qTextEN && (
              <TouchableOpacity
                onPress={handleTranslationToggle}
                style={[styles.translateBtn, showTranslation && styles.translateBtnActive]}
                accessibilityLabel={showTranslation ? 'Hide' : 'Translate'}
                activeOpacity={0.7}
              >
                <Text style={[styles.translateIcon, showTranslation && styles.translateIconActive]}>
                  🌐
                </Text>
                <Text style={[styles.translateLabel, showTranslation && styles.translateLabelActive]}>
                  {showTranslation ? 'Hide' : 'Translate'}
                </Text>
              </TouchableOpacity>
            )}

            {onToggleBookmark && (
              <TouchableOpacity
                onPress={() => {
                  // Call the provided toggle function
                  onToggleBookmark();
                  // Also refresh stats to ensure counters are in sync
                  setTimeout(() => refreshStats(), 100);
                }}
                style={[styles.bookmarkBtn, isBookmarked && styles.bookmarkBtnActive]}
                accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                activeOpacity={0.7}
              >
                <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkIconActive]}>
                  {isBookmarked ? '★' : '☆'}
                </Text>
                <Text style={[styles.bookmarkLabel, isBookmarked && styles.bookmarkLabelActive]}>
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Show image if present */}
        {question.image_paths && question.image_paths.length > 0 && (() => {
          const imageSource = getImageSource(question.image_paths[0]);
          return imageSource ? (
            <View style={styles.imageContainer}>
              <Image
                source={imageSource}
                style={styles.questionImage}
                resizeMode="contain"
              />
            </View>
          ) : null;
        })()}

        <View style={styles.questionContainer}>
          <View style={styles.questionIconContainer}>
            <Text style={styles.questionIcon}>💭</Text>
          </View>
          <View style={styles.questionTextContainer}>
            <Text style={styles.text}>
              {qTextDE}
            </Text>
            {showTranslation && qTextEN && (
              <View style={styles.translationContainer}>
                <Text style={styles.translationIcon}>🌐</Text>
                <Text style={styles.translationText}>
                  {qTextEN}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.optionsWrap}>
          {optionsDE.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrectAnswer = optionsDE[idx] === answerDE;

            let optionStyle = [styles.optionBtn];
            let optionIconStyle = null;
            let optionIcon = null;

            if (showResult && !isTestMode) {
              if (isCorrectAnswer) {
                optionStyle.push(styles.optionCorrect);
                optionIconStyle = styles.optionIconCorrect;
                optionIcon = '✓';
              } else if (isSelected) {
                optionStyle.push(styles.optionWrong);
                optionIconStyle = styles.optionIconWrong;
                optionIcon = '✗';
              }
            } else if (isSelected) {
              optionStyle.push(styles.optionSelected);
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
                <View style={[styles.optionContainer, optionStyle]}>
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
                      {showTranslation && optionsEN.length > 0 && optionsEN[idx] && (
                        <View style={styles.optionTranslationContainer}>
                          <Text style={styles.optionTranslationIcon}>🌐</Text>
                          <Text style={styles.optionTranslationText}>
                            {optionsEN[idx]}
                          </Text>
                        </View>
                      )}
                    </View>

                    {optionIcon && (
                      <View style={[styles.optionIconContainer, optionIconStyle]}>
                        <Text style={styles.optionIconText}>{optionIcon}</Text>
                      </View>
                    )}
                  </View>
                </View>
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
            <View style={[
              styles.resultContent,
              isCorrect ? styles.resultContainerCorrect : styles.resultContainerWrong
            ]}>
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
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 2,
    marginHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    backgroundColor: '#e6f2ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  index: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0a7ea4',
  },
  questionNumberBadge: {
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  questionNumberText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  questionImage: {
    width: width * 0.6,
    height: 100,
    borderRadius: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  translateBtnActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  translateIcon: {
    fontSize: 16,
    color: '#1d4ed8',
  },
  translateIconActive: {
    color: '#d97706',
  },
  translateLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1e40af',
  },
  translateLabelActive: {
    color: '#92400e',
  },
  bookmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  bookmarkBtnActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  bookmarkIcon: {
    fontSize: 16,
    color: '#1d4ed8',
  },
  bookmarkIconActive: {
    color: '#d97706',
  },
  bookmarkLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1e40af',
  },
  bookmarkLabelActive: {
    color: '#92400e',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8eaed',
    position: 'relative',
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
    position: 'relative',
  },
  text: {
    fontSize: 15,
    color: '#11181c',
    lineHeight: 22,
    fontWeight: '600',
  },
  translationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e7ff',
    gap: 6,
  },
  translationIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  translationText: {
    fontSize: 14,
    color: '#4338ca',
    lineHeight: 20,
    fontWeight: '500',
    fontStyle: 'italic',
    flex: 1,
  },
  optionsWrap: {
    marginBottom: 12,
    gap: 8,
  },
  optionTouchable: {
    borderRadius: 10,
  },
  optionContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e8eaed',
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  optionSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#e6f2ff',
  },
  optionCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e8eaed',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 14,
    color: '#11181c',
    lineHeight: 20,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#0a7ea4',
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
  optionTranslationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e0e7ff',
    gap: 4,
  },
  optionTranslationIcon: {
    fontSize: 12,
    marginTop: 1,
  },
  optionTranslationText: {
    fontSize: 12,
    color: '#4338ca',
    lineHeight: 16,
    fontWeight: '500',
    fontStyle: 'italic',
    flex: 1,
  },
  optionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 12,
  },
  resultContent: {
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
  },
  resultContainerCorrect: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  resultContainerWrong: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
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