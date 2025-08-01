import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import { questionsData } from '../data/questions';
import QuestionCard from '../components/QuestionCard';
import { getItem, setItem, removeItem } from '../utils/storage';
import { useTranslation } from '../hooks/useTranslation';

const BOOKMARKS_KEY = 'bookmarked_questions';

export default function BookmarkedScreen() {
  const { t } = useTranslation();
  const [bookmarked, setBookmarked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getItem(BOOKMARKS_KEY, []).then(setBookmarked).finally(() => setLoading(false));
  }, []);

  const clearAll = () => {
    Alert.alert(t.clear_all_bookmarks, t.confirm_clear_bookmarks, [
      { text: t.cancel || 'Cancel', style: 'cancel' },
      { text: t.ok || 'OK', onPress: async () => {
        await removeItem(BOOKMARKS_KEY);
        setBookmarked([]);
      }}
    ]);
  };

  const bookmarkedQuestions = questionsData.filter(q => bookmarked.includes(q.question_number));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.bookmarked_questions_title}</Text>
      <Text style={styles.desc}>{t.bookmarked_questions_desc}</Text>
      <Button title={t.clear_all_bookmarks} onPress={clearAll} disabled={!bookmarked.length} />
      {loading ? <Text style={styles.loading}>{t.loading_bookmarked}</Text> : (
        <FlatList
          data={bookmarkedQuestions}
          keyExtractor={q => q.question_number.toString()}
          renderItem={({ item, index }) => (
            <QuestionCard question={item} index={index} />
          )}
          ListEmptyComponent={<Text style={styles.empty}>{t.no_bookmarked_questions}</Text>}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  title: { fontSize: 24, fontWeight: 'bold', margin: 16, color: '#222' },
  desc: { fontSize: 16, marginHorizontal: 16, marginBottom: 8, color: '#555' },
  loading: { textAlign: 'center', marginTop: 32 },
  empty: { textAlign: 'center', color: '#888', marginTop: 32 },
});
