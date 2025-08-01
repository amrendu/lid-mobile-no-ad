import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function AppHeader({ 
  title, 
  subtitle, 
  showBack = true, 
  showLanguageToggle = true, 
  language = 'EN', 
  onLanguageToggle,
  fadeAnim 
}) {
  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, fadeAnim && { opacity: fadeAnim }]} edges={['top']}>
      <Animated.View style={styles.header}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 255, 0.95)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            {/* Top Row: Back Button, App Icon + Title, Language Button */}
            <View style={styles.topRow}>
              {showBack ? (
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.spacer} />
              )}
              
              <View style={styles.titleRow}>
                <View style={styles.appIcon}>
                  <Text style={styles.appIconText}>🇩🇪</Text>
                </View>
                <Text style={styles.headerTitle}>{title}</Text>
              </View>
              
              {showLanguageToggle && onLanguageToggle ? (
                <TouchableOpacity onPress={onLanguageToggle} style={styles.langButton}>
                  <LinearGradient
                    colors={['#e6f2ff', '#f0f7ff']}
                    style={styles.langButtonGradient}
                  >
                    <Text style={styles.langButtonText}>
                      {language === 'EN' ? 'DE' : language === 'DE' ? 'TR' : 'EN'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.spacer} />
              )}
            </View>
            
            {/* Bottom Row: Subtitle */}
            {subtitle && (
              <View style={styles.subtitleRow}>
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
  },
  header: {
    backgroundColor: 'transparent',
    marginTop: Platform.OS === 'android' ? 8 : 12,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingTop: Platform.OS === 'android' ? 12 : 16,
  },
  headerContent: {
    flexDirection: 'column',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  appIconText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flexShrink: 1,
  },
  subtitleRow: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 44, // Align with the title content
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  backButtonText: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  spacer: {
    width: 44,
  },
  langButton: {
    borderRadius: 20,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  langButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  langButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 16,
  },
});