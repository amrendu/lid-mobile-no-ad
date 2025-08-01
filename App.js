import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AllQuestionsScreen from './src/pages/AllQuestionsScreen';
import StateQuestionsScreen from './src/pages/StateQuestionsScreen';
import TestSimulatorScreen from './src/pages/TestSimulatorScreen';
import BookmarkedScreen from './src/pages/BookmarkedScreen';
import IncorrectScreen from './src/pages/IncorrectScreen';
import SupportScreen from './src/pages/SupportScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="AllQuestions"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'AllQuestions') iconName = 'list';
            else if (route.name === 'StateQuestions') iconName = 'map';
            else if (route.name === 'TestSimulator') iconName = 'rocket';
            else if (route.name === 'Bookmarked') iconName = 'bookmark';
            else if (route.name === 'Incorrect') iconName = 'close-circle';
            else if (route.name === 'Support') iconName = 'heart';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="AllQuestions" component={AllQuestionsScreen} options={{ title: 'All' }} />
        <Tab.Screen name="StateQuestions" component={StateQuestionsScreen} options={{ title: 'State' }} />
        <Tab.Screen name="TestSimulator" component={TestSimulatorScreen} options={{ title: 'Test' }} />
        <Tab.Screen name="Bookmarked" component={BookmarkedScreen} options={{ title: 'Bookmarked' }} />
        <Tab.Screen name="Incorrect" component={IncorrectScreen} options={{ title: 'Incorrect' }} />
        <Tab.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
