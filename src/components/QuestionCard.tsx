import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { getItem, setItem } from '../utils/storage';
import { refreshStats, saveCorrectAnswer } from '../utils/statsManager';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../utils/languageContext';
import { useTranslation } from '../hooks/useTranslation';
import { BorderRadius, Spacing, Shadows } from '../../constants/Colors';
import { LanguageIcon } from '../../constants/Icons';

const { width } = Dimensions.get('window');

// Helper to generate a unique id for a question
function getQuestionId(q: any) {
  const raw = `${q.question}::${(q.options || []).join('|')}::${q.answer || ''}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) + raw.charCodeAt(i);
  }
  return 'q_' + (hash >>> 0).toString(36);
}

// Function to save incorrect answers to AsyncStorage
async function saveIncorrectAnswer(question: any) {
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

interface QuestionCardProps {
  question: any;
  index: number;
  lang?: string;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onToggleLang?: () => void;
  selectedAnswer?: string | null;
  onAnswer?: ((answer: string) => void) | null;
  onAnswerSelected?: ((isCorrect?: boolean) => void) | null;
  isTestMode?: boolean;
  showResultsImmediately?: boolean;
}

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
}: QuestionCardProps) {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
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

  const handleSelect = (idx: number) => {
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
    const questionId = getQuestionId(question);

    if (isTestMode && onAnswer) {
      // In test mode, call the onAnswer callback with the selected option text
      onAnswer(question.options[idx]);

      // Track both correct and incorrect answers in test mode
      if (isCorrectAnswer) {
        saveCorrectAnswer(questionId);
      } else {
        saveIncorrectAnswer(question);
      }
    } else {
      // In practice mode, show result immediately
      setShowResult(true);

      // Track both correct and incorrect answers
      if (isCorrectAnswer) {
        saveCorrectAnswer(questionId);
      } else {
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
      onAnswerSelected(isCorrectAnswer);
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

  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.large,
      padding: Spacing.lg,
      shadowColor: colors.cardShadow,
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    indexContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.infoBackground,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.tint,
    },
    index: {
      fontWeight: 'bold',
      fontSize: 14,
      color: colors.tint,
    },
    questionNumberBadge: {
      backgroundColor: colors.infoBackground,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: BorderRadius.large,
      borderWidth: 1,
      borderColor: colors.tint,
    },
    questionNumberText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.tint,
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 12,
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    translateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: colors.tint,
      shadowColor: colors.cardShadow,
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    translateBtnActive: {
      backgroundColor: colors.warningBackground,
      borderColor: colors.warning,
    },
    translateIcon: {
      fontSize: 16,
      color: colors.tint,
    },
    translateIconActive: {
      color: colors.warning,
    },
    translateLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.tint,
    },
    translateLabelActive: {
      color: colors.warning,
    },
    bookmarkBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: colors.tint,
      shadowColor: colors.cardShadow,
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    bookmarkBtnActive: {
      backgroundColor: colors.warningBackground,
      borderColor: colors.warning,
    },
    bookmarkIcon: {
      fontSize: 16,
      color: colors.tint,
    },
    bookmarkIconActive: {
      color: colors.warning,
    },
    bookmarkLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.tint,
    },
    bookmarkLabelActive: {
      color: colors.warning,
    },
    questionContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
    },
    text: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      fontWeight: '600',
    },
    translationContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.borderSecondary,
      gap: 6,
    },
    translationText: {
      fontSize: 14,
      color: colors.info,
      lineHeight: 20,
      fontWeight: '500',
      fontStyle: 'italic',
      flex: 1,
    },
    optionContainer: {
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 12,
      minHeight: 48,
    },
    optionSelected: {
      borderColor: colors.tint,
      backgroundColor: colors.infoBackground,
    },
    optionCorrect: {
      borderColor: colors.success,
      backgroundColor: colors.successBackground,
    },
    optionWrong: {
      borderColor: colors.error,
      backgroundColor: colors.errorBackground,
    },
    optionIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderSecondary,
    },
    optionLetter: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.textMuted,
    },
    optionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      fontWeight: '500',
    },
    optionTextSelected: {
      color: colors.tint,
      fontWeight: '600',
    },
    optionTextCorrect: {
      color: colors.success,
      fontWeight: '600',
    },
    optionTextWrong: {
      color: colors.error,
      fontWeight: '600',
    },
    optionTranslationContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 6,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: colors.borderSecondary,
      gap: 4,
    },
    optionTranslationText: {
      fontSize: 12,
      color: colors.info,
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
      backgroundColor: colors.success,
    },
    optionIconWrong: {
      backgroundColor: colors.error,
    },
    optionIconText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    resultContainerCorrect: {
      backgroundColor: colors.successBackground,
      borderColor: colors.success,
    },
    resultContainerWrong: {
      backgroundColor: colors.errorBackground,
      borderColor: colors.error,
    },
    correctText: {
      color: colors.success,
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 4,
    },
    wrongText: {
      color: colors.error,
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 4,
    },
    correctAnswerText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    correctAnswerValue: {
      fontWeight: '600',
      color: colors.success,
    },
  });

  return (
    <Animated.View style={[
      styles.cardContainer,
      {
        transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
        opacity: fadeAnim
      }
    ]}>
      <View style={dynamicStyles.card}>
        <View style={styles.headerRow}>
          <View style={styles.questionMeta}>
            <View style={dynamicStyles.questionNumberBadge}>
              <Text style={dynamicStyles.questionNumberText}>
                #{question.bundesland && question.bundesland !== 'General' 
                  ? `${question.bundesland.toLowerCase()}-${question.question_number || index + 1}` 
                  : `general-${question.question_number || index + 1}`}
              </Text>
            </View>
          </View>

          {/* Bookmark and Translate buttons */}
          <View style={styles.actionRow}>
            {qTextEN && (
              <TouchableOpacity
                onPress={handleTranslationToggle}
                style={[dynamicStyles.translateBtn, showTranslation && dynamicStyles.translateBtnActive]}
                accessibilityLabel={showTranslation ? t.hide : t.translate}
                activeOpacity={0.7}
              >
                <LanguageIcon 
                  size={16} 
                  color={showTranslation ? colors.warning : colors.tint} 
                />
                <Text style={[dynamicStyles.translateLabel, showTranslation && dynamicStyles.translateLabelActive]}>
                  {showTranslation ? t.hide : t.translate}
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
                style={[dynamicStyles.bookmarkBtn, isBookmarked && dynamicStyles.bookmarkBtnActive]}
                accessibilityLabel={isBookmarked ? t.remove_bookmark : t.bookmark}
                activeOpacity={0.7}
              >
                <Text style={[dynamicStyles.bookmarkIcon, isBookmarked && dynamicStyles.bookmarkIconActive]}>
                  {isBookmarked ? '★' : '☆'}
                </Text>
                <Text style={[dynamicStyles.bookmarkLabel, isBookmarked && dynamicStyles.bookmarkLabelActive]}>
                  {isBookmarked ? t.bookmarked : t.bookmark}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Show image if present */}
        {question.image_paths && question.image_paths.length > 0 && (
          <View style={dynamicStyles.imageContainer}>
            <Image
              source={{ uri: question.image_paths[0] }}
              style={styles.questionImage}
              resizeMode="contain"
            />
          </View>
        )}

        <View style={dynamicStyles.questionContainer}>
          <View style={styles.questionIconContainer}>
            <Text style={styles.questionIcon}>💭</Text>
          </View>
          <View style={styles.questionTextContainer}>
            <Text style={dynamicStyles.text}>
              {qTextDE}
            </Text>
            {showTranslation && qTextEN && (
              <View style={dynamicStyles.translationContainer}>
                <LanguageIcon size={14} color={colors.info} />
                <Text style={dynamicStyles.translationText}>
                  {qTextEN}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.optionsWrap}>
          {optionsDE.map((opt: string, idx: number) => {
            const isSelected = selected === idx;
            const isCorrectAnswer = optionsDE[idx] === answerDE;

            let optionStyle = [dynamicStyles.optionContainer];
            let optionIconStyle = null;
            let optionIcon = null;

            if (showResult && !isTestMode) {
              if (isCorrectAnswer) {
                optionStyle.push(dynamicStyles.optionCorrect);
                optionIconStyle = dynamicStyles.optionIconCorrect;
                optionIcon = '✓';
              } else if (isSelected) {
                optionStyle.push(dynamicStyles.optionWrong);
                optionIconStyle = dynamicStyles.optionIconWrong;
                optionIcon = '✗';
              }
            } else if (isSelected) {
              optionStyle.push(dynamicStyles.optionSelected);
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
                <View style={optionStyle}>
                  <View style={styles.optionContent}>
                    <View style={dynamicStyles.optionIndicator}>
                      <Text style={dynamicStyles.optionLetter}>{String.fromCharCode(65 + idx)}</Text>
                    </View>

                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        dynamicStyles.optionText,
                        isSelected && (!showResult || isTestMode) ? dynamicStyles.optionTextSelected : null,
                        showResult && !isTestMode && isCorrectAnswer ? dynamicStyles.optionTextCorrect : null,
                        showResult && !isTestMode && isSelected && !isCorrectAnswer ? dynamicStyles.optionTextWrong : null
                      ]}>
                        {opt}
                      </Text>
                      {showTranslation && optionsEN.length > 0 && optionsEN[idx] && (
                        <View style={dynamicStyles.optionTranslationContainer}>
                          <LanguageIcon size={12} color={colors.info} />
                          <Text style={dynamicStyles.optionTranslationText}>
                            {optionsEN[idx]}
                          </Text>
                        </View>
                      )}
                    </View>

                    {optionIcon && (
                      <View style={[dynamicStyles.optionIconContainer, optionIconStyle]}>
                        <Text style={dynamicStyles.optionIconText}>{optionIcon}</Text>
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
              isCorrect ? dynamicStyles.resultContainerCorrect : dynamicStyles.resultContainerWrong
            ]}>
              <Text style={styles.resultIcon}>
                {isCorrect ? '🎉' : '💡'}
              </Text>
              <Text style={isCorrect ? dynamicStyles.correctText : dynamicStyles.wrongText}>
                {isCorrect ? t.correct_result : t.incorrect_result}
              </Text>

              {!isCorrect && (
                <Text style={dynamicStyles.correctAnswerText}>
                  {t.correct_answer}
                  <Text style={dynamicStyles.correctAnswerValue}>
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
  translationIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  optionsWrap: {
    marginBottom: 12,
    gap: 8,
  },
  optionTouchable: {
    borderRadius: 10,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTranslationIcon: {
    fontSize: 12,
    marginTop: 1,
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
  resultIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
});