import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../utils/languageContext';
import { questionsData } from '../data/questions';
import QuestionCard from '../components/QuestionCard';
import { getItem, setItem, removeItem } from '../utils/storage';

const INCORRECT_KEY = 'incorrect_questions_v2';

export default function IncorrectScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [incorrect, setIncorrect] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadIncorrectQuestions = async () => {
    try {
      setLoading(true);
      const incorrectIds = await getItem(INCORRECT_KEY, []);
      setIncorrect(incorrectIds || []);
    } catch (error) {
      console.error('Error loading incorrect questions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIncorrectQuestions();
  }, []);

  const toggleLanguage = () => {
    const nextLanguage = language === 'EN' ? 'DE' : language === 'DE' ? 'TR' : 'EN';
    setLanguage(nextLanguage);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadIncorrectQuestions();
  };

  const clearAll = () => {
    Alert.alert(
      t.clear_all || 'Clear All', 
      t.confirm_clear_incorrect || 'Are you sure you want to clear all incorrect answers? This cannot be undone.', 
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        { text: t.ok || 'OK', style: 'destructive', onPress: async () => {
          setLoading(true);
          try {
            await removeItem(INCORRECT_KEY);
            setIncorrect([]);
          } catch (error) {
            console.error('Error clearing incorrect answers:', error);
          } finally {
            setLoading(false);
          }
        }}
      ]
    );
  };

  const incorrectQuestions = questionsData.filter(q => incorrect.includes(q.question_number));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.incorrect_answers_title}</Text>
      <Text style={styles.desc}>{t.incorrect_answers_desc}</Text>
      <Button title={t.clear_all} onPress={clearAll} disabled={!incorrect.length} />
      {loading ? <Text style={styles.loading}>{t.loading_incorrect}</Text> : (
        <FlatList
          data={incorrectQuestions}
          keyExtractor={q => q.question_number.toString()}
          renderItem={({ item, index }) => (
            <QuestionCard question={item} index={index} />
          )}
          ListEmptyComponent={<Text style={styles.empty}>{t.no_incorrect_desc}</Text>}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  );
}

// Error boundary for the component
IncorrectScreen.ErrorBoundary = ({ error }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#dc3545' }}>
        Something went wrong
      </Text>
      <Text style={{ color: '#687076', textAlign: 'center' }}>
        We couldn&apos;t load your incorrect answers. Please try again later.
      </Text>
      <TouchableOpacity 
        style={{
          marginTop: 20,
          backgroundColor: '#0a7ea4',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 12
        }}
        onPress={() => window.location.reload()}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f6fa',
    paddingTop: 16 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#0a7ea4',
    flex: 1
  },
  desc: { 
    fontSize: 16, 
    marginHorizontal: 16, 
    marginBottom: 16, 
    color: '#687076',
    lineHeight: 22
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  loading: { 
    textAlign: 'center', 
    marginTop: 12,
    color: '#687076',
    fontSize: 16 
  },
  listContent: { 
    paddingHorizontal: 16,
    paddingBottom: 40 
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  empty: { 
    textAlign: 'center', 
    color: '#11181c', 
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#687076',
    fontSize: 16,
    lineHeight: 22
  },
  languageButton: {
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  languageButtonText: {
    color: '#0a7ea4',
    fontWeight: 'bold',
    fontSize: 14
  },
  clearButton: {
    backgroundColor: '#fdf1f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dc3545',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  clearButtonText: {
    color: '#dc3545',
    fontWeight: 'bold',
    fontSize: 14
  },
  buttonDisabled: {
    backgroundColor: '#f2f2f2',
    borderColor: '#cccccc'
  },
  buttonTextDisabled: {
    color: '#aaaaaa'
  }
});
