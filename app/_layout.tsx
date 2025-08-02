import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { LanguageProvider } from '../src/utils/languageContext';
import { useTranslation } from '../src/hooks/useTranslation';
import { Colors } from '../constants/Colors';
import HeaderBackButton from '../components/navigation/HeaderBackButton';
import HeaderOverviewButton from '../components/navigation/HeaderOverviewButton';

// Custom navigation themes that match our color system
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.error,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.error,
  },
};

function RootLayoutContent() {
  const { theme, colors } = useTheme();
  const translation = useTranslation();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const defaultScreenOptions = {
    headerStyle: {
      backgroundColor: colors.background,
      shadowColor: colors.tint,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 4,
    },
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colors.text,
    },
    headerTintColor: colors.tint,
    headerLeft: () => (
      <HeaderBackButton onPress={router.back} />
    ),
  };

  return (
    <NavigationThemeProvider value={theme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
      <Stack screenOptions={defaultScreenOptions}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen 
          name="pages/all-questions" 
          options={({ route }) => ({ 
            title: (translation as any).t?.all_questions_title || 'All Questions',
            headerShown: true,
            headerRight: () => (
              <HeaderOverviewButton onPress={() => {
                // This will be handled by the screen component
                const params = route.params as any;
                if (params?.toggleOverview) {
                  params.toggleOverview();
                }
              }} />
            ),
          })} 
        />
        <Stack.Screen 
          name="pages/test-simulator" 
          options={{ 
            title: (translation as any).t?.test_simulator_title || 'Test Simulator',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="pages/bookmarked" 
          options={({ route }) => ({ 
            title: (translation as any).t?.bookmarked_questions || 'Bookmarked',
            headerShown: true,
            headerRight: () => (
              <HeaderOverviewButton onPress={() => {
                // This will be handled by the screen component
                const params = route.params as any;
                if (params?.toggleOverview) {
                  params.toggleOverview();
                }
              }} />
            ),
          })} 
        />
        <Stack.Screen 
          name="pages/state-questions" 
          options={({ route }) => {
            const params = route.params as any;
            const selectedState = params?.selectedState;
            const title = selectedState 
              ? `${selectedState} ${(translation as any).t?.questions || 'Questions'}`
              : (translation as any).t?.state_questions || 'State Questions';
            
            return {
              title: title,
              headerShown: true,
              headerRight: () => (
                <HeaderOverviewButton onPress={() => {
                  // This will be handled by the screen component
                  if (params?.toggleOverview) {
                    params.toggleOverview();
                  }
                }} />
              ),
            };
          }} 
        />
        <Stack.Screen 
          name="pages/incorrect" 
          options={({ route }) => ({ 
            title: (translation as any).t?.incorrect_answers || 'Incorrect Answers',
            headerShown: true,
            headerRight: () => (
              <HeaderOverviewButton onPress={() => {
                // This will be handled by the screen component
                const params = route.params as any;
                if (params?.toggleOverview) {
                  params.toggleOverview();
                }
              }} />
            ),
          })} 
        />
        <Stack.Screen 
          name="pages/support" 
          options={{ 
            title: (translation as any).t?.support_title || 'Support',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="pages/settings" 
          options={{ 
            title: (translation as any).t?.settings || 'Settings',
            headerShown: true,
          }} 
        />
        <Stack.Screen name="(tabs)/settings" options={{ headerShown: false }} />
        <Stack.Screen 
          name="pages/TermsOfService" 
          options={{ 
            title: (translation as any).t?.terms_of_service_title || 'Terms of Service',
            headerBackTitle: (translation as any).t?.go_back || 'Back',
            headerRight: undefined, // No language toggle for terms of service
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LanguageProvider>
          <RootLayoutContent />
        </LanguageProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
