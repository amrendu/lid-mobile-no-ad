import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../utils/languageContext';
import { questionsData } from '../data/questions';
import QuestionCard from '../components/QuestionCard';
import ScreenWrapper from '../components/ScreenWrapper';

// Extract unique Bundesländer from questions
const bundeslaender = [
  ...new Set(questionsData.map(q => q.bundesland).filter(b => b && b !== 'General'))
].sort();

function getRandomTestQuestions(selectedState) {
  const general = questionsData.filter(q => q.bundesland === 'General');
  const state = questionsData.filter(q => q.bundesland === selectedState);
  // 30 general + 3 state
  const shuffledGeneral = general.sort(() => 0.5 - Math.random()).slice(0, 30);
  const shuffledState = state.sort(() => 0.5 - Math.random()).slice(0, 3);
  return [...shuffledGeneral, ...shuffledState].sort(() => 0.5 - Math.random());
}

export default function TestSimulatorScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedState, setSelectedState] = useState(bundeslaender[0] || '');
  const [testQuestions, setTestQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const startTest = () => {
    setTestQuestions(getRandomTestQuestions(selectedState));
    setCurrent(0);
    setStarted(true);
  };

  const next = () => setCurrent(c => Math.min(c + 1, testQuestions.length - 1));
  const prev = () => setCurrent(c => Math.max(c - 1, 0));

  return (
    <ScreenWrapper>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {!started ? (
          <ScrollView contentContainerStyle={styles.setupContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 255, 0.8)']}
              style={styles.setupCard}
            >
              <Text style={styles.setupIcon}>🎯</Text>
              <Text style={styles.setupTitle}>{t.test_simulator_title}</Text>
              <Text style={styles.setupDesc}>{t.test_simulator_desc}</Text>
              
              <View style={styles.stateSelection}>
                <Text style={styles.stateLabel}>{t.select_state}</Text>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.9)', 'rgba(219, 234, 254, 0.3)']}
                  style={styles.pickerContainer}
                >
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
                      inputIOS: styles.pickerInputIOS,
                      inputAndroid: styles.pickerInputAndroid,
                      iconContainer: styles.pickerIconContainer,
                      placeholder: styles.pickerPlaceholder,
                    }}
                    placeholder={{
                      label: t.select_bundesland || 'Select your Bundesland...',
                      value: null,
                      color: '#9EA0A4',
                    }}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => {
                      return <Text style={styles.pickerIcon}>▼</Text>;
                    }}
                  />
                </LinearGradient>
              </View>

              <TouchableOpacity onPress={startTest} style={styles.startButton}>
                <LinearGradient
                  colors={['#3b82f6', '#6366f1']}
                  style={styles.startButtonGradient}
                >
                  <Text style={styles.startButtonText}>🚀 {t.test_sim_start_button}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </ScrollView>
        ) : (
          <View style={styles.testContainer}>
            <View style={styles.progressContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'rgba(219, 234, 254, 0.3)']}
                style={styles.progressCard}
              >
                <Text style={styles.progressText}>
                  {t.question} {current + 1} {t.of} {testQuestions.length}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${((current + 1) / testQuestions.length) * 100}%` }
                    ]} 
                  />
                </View>
              </LinearGradient>
            </View>

            <ScrollView style={styles.questionContainer}>
              {testQuestions[current] && (
                <QuestionCard 
                  question={testQuestions[current]} 
                  index={current}
                  lang={language}
                  isTestMode={true}
                />
              )}
            </ScrollView>

            <View style={styles.navRow}>
              <TouchableOpacity 
                onPress={prev} 
                disabled={current === 0} 
                style={[styles.navBtn, current === 0 && styles.disabledBtn]}
              >
                <LinearGradient
                  colors={current === 0 ? ['#9ca3af', '#9ca3af'] : ['#6b7280', '#4b5563']}
                  style={styles.navBtnGradient}
                >
                  <Text style={styles.navBtnText}>← {t.previous}</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={next} 
                disabled={current === testQuestions.length - 1} 
                style={[styles.navBtn, current === testQuestions.length - 1 && styles.disabledBtn]}
              >
                <LinearGradient
                  colors={current === testQuestions.length - 1 ? ['#9ca3af', '#9ca3af'] : ['#3b82f6', '#6366f1']}
                  style={styles.navBtnGradient}
                >
                  <Text style={styles.navBtnText}>{t.next} →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  setupContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  setupCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  setupIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  setupTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  setupDesc: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  stateSelection: {
    width: '100%',
    marginBottom: 32,
  },
  stateLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    overflow: 'hidden',
  },
  pickerInputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#1f2937',
    paddingRight: 40, // to ensure the text is never behind the icon
    backgroundColor: 'transparent',
    height: 50,
  },
  pickerInputAndroid: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#1f2937',
    paddingRight: 40, // to ensure the text is never behind the icon
    backgroundColor: 'transparent',
    height: 50,
  },
  pickerIconContainer: {
    top: Platform.OS === 'ios' ? 15 : 20,
    right: 15,
  },
  pickerIcon: {
    fontSize: 14,
    color: '#6b7280',
  },
  pickerPlaceholder: {
    color: '#9EA0A4',
    fontSize: 16,
  },
  startButton: {
    borderRadius: 16,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  startButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testContainer: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  questionContainer: {
    flex: 1,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  navBtn: {
    flex: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  navBtnGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  navBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
