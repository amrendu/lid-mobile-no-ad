import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { LanguageProvider } from '../src/utils/languageContext';
import { Colors } from '../constants/Colors';

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
  const { theme } = useTheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <NavigationThemeProvider value={theme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="pages/all-questions" options={{ headerShown: false }} />
        <Stack.Screen name="pages/test-simulator" options={{ headerShown: false }} />
        <Stack.Screen name="pages/bookmarked" options={{ headerShown: false }} />
        <Stack.Screen name="pages/state-questions" options={{ headerShown: false }} />
        <Stack.Screen name="pages/incorrect" options={{ headerShown: false }} />
        <Stack.Screen name="pages/support" options={{ headerShown: false }} />
        <Stack.Screen name="pages/settings" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)/settings" options={{ headerShown: false }} />
        <Stack.Screen 
          name="pages/TermsOfService" 
          options={{ 
            title: 'Terms of Service',
            headerBackTitle: 'Back'
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
