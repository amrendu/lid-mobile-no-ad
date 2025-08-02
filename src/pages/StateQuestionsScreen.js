import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useTranslation } from '../hooks/useTranslation';
import { questionsData } from '../data/questions';
import QuestionCard from '../components/QuestionCard';

// Extract unique Bundesländer from questions
const bundeslaender = [
  ...new Set(questionsData.map(q => q.bundesland).filter(b => b && b !== 'General'))
].sort();

export default function StateQuestionsScreen() {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const flatListRef = useRef(null);

  const filteredQuestions = selectedState ? questionsData.filter(q => q.bundesland === selectedState) : [];


  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentQuestionIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Reset current question index when state changes
  const handleStateChange = (value) => {
    setSelectedState(value || '');
    setCurrentQuestionIndex(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.state_questions_title}</Text>
      <Text style={styles.desc}>{t.state_questions_desc}</Text>
      <View style={styles.pickerContainer}>
        <RNPickerSelect
          value={selectedState}
          onValueChange={handleStateChange}
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
            label: t.select_a_state || 'Select a state...',
            value: '',
            color: '#9EA0A4',
          }}
          useNativeAndroidPickerStyle={false}
          Icon={() => {
            return <Text style={styles.pickerIcon}>▼</Text>;
          }}
        />
      </View>
      <FlatList
        ref={flatListRef}
        data={filteredQuestions}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <QuestionCard
            question={item}
            index={index}
          />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={<Text style={styles.empty}>{t.no_questions_match || 'No questions for this state.'}</Text>}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: 200, // Approximate item height
          offset: 200 * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  title: { fontSize: 24, fontWeight: 'bold', margin: 16, color: '#222' },
  desc: { fontSize: 16, marginHorizontal: 16, marginBottom: 8, color: '#555' },
  pickerContainer: { 
    marginHorizontal: 16, 
    marginBottom: 8, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  pickerInputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#222',
    paddingRight: 40,
    backgroundColor: 'transparent',
    height: 44,
  },
  pickerInputAndroid: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#222',
    paddingRight: 40,
    backgroundColor: 'transparent',
    height: 44,
  },
  pickerIconContainer: {
    top: Platform.OS === 'ios' ? 12 : 16,
    right: 15,
  },
  pickerIcon: {
    fontSize: 12,
    color: '#666',
  },
  pickerPlaceholder: {
    color: '#9EA0A4',
    fontSize: 16,
  },
  empty: { textAlign: 'center', color: '#888', marginTop: 32 },
});
