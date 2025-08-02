import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Switch,
  Linking,
  Platform,
  Modal,
  FlatList,
  Pressable,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../utils/languageContext';
import { resetAllData, getStats } from '../utils/statsManager';
import { getItem, setItem, removeItem } from '../utils/storage';
import { useTheme } from '../../contexts/ThemeContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguage();
  const [stats, setStats] = useState({ bookmarkedCount: 0, incorrectCount: 0, correctCount: 0 });
  const { colors, theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Language options with enhanced display
  const languageOptions = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'TR', name: 'Türkçe', flag: '🇹🇷' },
  ];

  useEffect(() => {
    loadSettings();
    setStats(getStats());
  }, []);

  const loadSettings = async () => {
    try {
      const notifications = await getItem('notifications_enabled', true);
      setNotificationsEnabled(notifications);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handleThemeToggle = async () => {
    toggleTheme();
    // You can implement theme switching logic here
  };

  const handleNotificationsToggle = async (value) => {
    setNotificationsEnabled(value);
    await setItem('notifications_enabled', value);
  };

  const handleClearBookmarks = async () => {
    Alert.alert(
      'Clear Bookmarks',
      'Are you sure you want to clear all bookmarked questions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeItem('bookmarked_questions_v2');
              setStats(prev => ({ ...prev, bookmarkedCount: 0 }));
              Alert.alert('Success', 'All bookmarks cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear bookmarks.');
            }
          },
        },
      ]
    );
  };

  const handleClearIncorrect = async () => {
    Alert.alert(
      'Clear Incorrect Answers',
      'Are you sure you want to clear all incorrectly answered questions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeItem('incorrect_questions_v2');
              setStats(prev => ({ ...prev, incorrectCount: 0 }));
              Alert.alert('Success', 'Incorrect answers cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear incorrect answers.');
            }
          },
        },
      ]
    );
  };

  const handleClearProgress = async () => {
    Alert.alert(
      'Clear All Progress',
      'Are you sure you want to clear all your progress including correct answers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeItem('correct_questions_v2');
              await removeItem('answered_questions_v2');
              setStats(prev => ({ ...prev, correctCount: 0 }));
              Alert.alert('Success', 'All progress cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear progress.');
            }
          },
        },
      ]
    );
  };

  const handleResetAll = async () => {
    Alert.alert(
      'Reset All Data',
      'This will clear ALL data including bookmarks, answers, progress, and settings. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            const success = await resetAllData();
            if (success) {
              setStats({ bookmarkedCount: 0, incorrectCount: 0, correctCount: 0 });
              Alert.alert('Success', 'All app data has been reset successfully!');
            } else {
              Alert.alert('Error', 'Failed to reset app data.');
            }
          },
        },
      ]
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={dynamicStyles.section}>
      <Text style={dynamicStyles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity style={dynamicStyles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={dynamicStyles.settingLeft}>
        <Ionicons name={icon} size={24} color={colors.tint} style={dynamicStyles.settingIcon} />
        <View style={dynamicStyles.settingText}>
          <Text style={dynamicStyles.settingTitle}>{title}</Text>
          {subtitle && <Text style={dynamicStyles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={dynamicStyles.settingRight}>
        {rightComponent}
        {showArrow && onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.iconSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const StatItem = ({ label, value, color = colors.tint, icon }) => (
    <View style={dynamicStyles.statItem}>
      <View style={[dynamicStyles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[dynamicStyles.statValue, { color }]}>{value}</Text>
      <Text style={dynamicStyles.statLabel}>{label}</Text>
    </View>
  );

  // Language picker handler - uses modal on Android, Alert on iOS
  const handleLanguagePress = () => {
    if (Platform.OS === 'android') {
      setLanguageModalVisible(true);
    } else {
      Alert.alert(
        'Select Language',
        'Choose your preferred language',
        [
          { text: 'Cancel', style: 'cancel' },
          ...languageOptions.map(lang => ({
            text: `${lang.flag} ${lang.name}`,
            onPress: () => handleLanguageChange(lang.code)
          }))
        ]
      );
    }
  };

  // Language modal item component
  const LanguageItem = ({ item }) => {
    const isSelected = language === item.code;
    return (
      <TouchableOpacity
        style={[
          dynamicStyles.languageItem,
          isSelected && { backgroundColor: colors.tint + '20' }
        ]}
        onPress={() => {
          handleLanguageChange(item.code);
          setLanguageModalVisible(false);
        }}
      >
        <Text style={dynamicStyles.languageFlag}>{item.flag}</Text>
        <Text style={[dynamicStyles.languageName, isSelected && { color: colors.tint }]}>
          {item.name}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color={colors.tint} />
        )}
      </TouchableOpacity>
    );
  };

  // Get current language display info
  const getCurrentLanguage = () => {
    const current = languageOptions.find(lang => lang.code === language) || languageOptions[0];
    return `${current.flag} ${current.name}`;
  };

// Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      marginHorizontal: 16,
      marginTop: 8,
    },
    settingItem: {
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      marginRight: 12,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    settingSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    settingRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statsContainer: {
      backgroundColor: colors.card,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 20,
      marginBottom: 1,
    },
    statItem: {
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    developerWarning: {
      backgroundColor: colors.warningBackground,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 1,
    },
    warningText: {
      fontSize: 14,
      color: colors.warning,
      marginLeft: 8,
      fontWeight: '500',
    },
    appInfo: {
      alignItems: 'center',
      paddingVertical: 24,
      paddingBottom: 40,
    },
    appVersion: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    appCopyright: {
      fontSize: 12,
      color: colors.textMuted,
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
    },
    languageFlag: {
      fontSize: 24,
      marginRight: 10,
    },
    languageName: {
      fontSize: 16,
      flex: 1,
      color: colors.text,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 10,
      width: 300,
      maxHeight: 400,
    },
    modalCloseButton: {
      marginTop: 10,
      paddingVertical: 10,
      alignItems: 'center',
    },
    modalCloseButtonText: {
      color: colors.tint,
      fontSize: 16,
    },
  });

const windowHeight = Dimensions.get('window').height; // For responsive sizing

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView style={dynamicStyles.container}>
      {/* Preferences Section */}
      <SettingSection title={t.preferences}>
        <SettingItem
          icon="language"
          title={t.language}
          subtitle={getCurrentLanguage()}
          onPress={handleLanguagePress}
        />
        
        <SettingItem
          icon="moon"
          title={t.dark_mode}
          subtitle={t.dark_mode_desc}
          rightComponent={
            <Switch
              value={theme === 'dark'}
              onValueChange={handleThemeToggle}
              trackColor={{ false: '#767577', true: '#007AFF' }}
            />
          }
          showArrow={false}
        />
        
        <SettingItem
          icon="notifications"
          title={t.notifications}
          subtitle={t.notifications_desc}
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#767577', true: '#007AFF' }}
            />
          }
          showArrow={false}
        />
      </SettingSection>

      {/* Statistics Section */}
      <SettingSection title={t.statistics}>
        <View style={dynamicStyles.statsContainer}>
          <StatItem 
            label={t.bookmarked_questions} 
            value={stats.bookmarkedCount} 
            color="#FF9500" 
            icon="bookmark"
          />
          <StatItem 
            label={t.incorrect_answers} 
            value={stats.incorrectCount} 
            color="#FF3B30" 
            icon="close-circle"
          />
          <StatItem 
            label={t.correct_answers} 
            value={stats.correctCount} 
            color="#34C759" 
            icon="checkmark-circle"
          />
        </View>
        
        <SettingItem
          icon="bookmark-outline"
          title={t.clear_bookmarks}
          subtitle={t.clear_bookmarks_desc}
          onPress={handleClearBookmarks}
        />
        
        <SettingItem
          icon="close-circle-outline"
          title={t.clear_incorrect_answers}
          subtitle={t.clear_incorrect_answers_desc}
          onPress={handleClearIncorrect}
        />
        
        <SettingItem
          icon="refresh-outline"
          title={t.clear_correct_answers}
          subtitle={t.clear_correct_answers_desc}
          onPress={handleClearProgress}
        />
      </SettingSection>

      {/* Privacy Section */}
      <SettingSection title={t.privacy}>
        <SettingItem
          icon="shield-checkmark"
          title={t.privacy_policy}
          subtitle={t.privacy_policy_desc}
          onPress={() => {
            // Replace with your actual privacy policy URL
            Linking.openURL('https://your-privacy-policy-url.com');
          }}
        />
        
        <SettingItem
          icon="document-text"
          title={t.terms_of_service}
          subtitle={t.terms_of_service_desc}
          onPress={() => {
            router.push('/pages/TermsOfService');
          }}
        />
      </SettingSection>

      {/* Support & Donate Section */}
      <SettingSection title={t.support_donate}>
        <SettingItem
          icon="cafe"
          title={t.buy_me_coffee}
          subtitle={t.buy_me_coffee_desc}
          onPress={() => Linking.openURL('https://ko-fi.com/amrendu')}
        />
        
        <SettingItem
          icon="heart"
          title={t.rate_app}
          subtitle={t.rate_app_desc}
          onPress={() => {
            // Replace with your app store URL
            Alert.alert(t.rate_app, 'This feature will be available when the app is published on app stores.');
          }}
        />
        
        <SettingItem
          icon="mail"
          title={t.contact_support}
          subtitle={t.contact_support_desc}
          onPress={() => {
            Linking.openURL('mailto:support@einbuergerungstest-fragen24.de?subject=App Support');
          }}
        />
      </SettingSection>

      {/* Developer Section */}
      <SettingSection title={t.developer_tools}>
        <View style={dynamicStyles.developerWarning}>
          <Ionicons name="warning" size={20} color={colors.warning} />
          <Text style={dynamicStyles.warningText}>{t.developer_warning}</Text>
        </View>
        
        <SettingItem
          icon="trash"
          title={t.reset_all_data}
          subtitle={t.reset_all_data_desc}
          onPress={handleResetAll}
        />
      </SettingSection>

      {/* Language Picker Modal for Android */}
      {Platform.OS === 'android' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={languageModalVisible}
          onRequestClose={() => setLanguageModalVisible(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContainer}>
              <FlatList
                data={languageOptions}
                keyExtractor={(item) => item.code}
                renderItem={LanguageItem}
              />
              <Pressable onPress={() => setLanguageModalVisible(false)} style={dynamicStyles.modalCloseButton}>
                <Text style={dynamicStyles.modalCloseButtonText}>{t.close}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* App Info */}
      <View style={dynamicStyles.appInfo}>
        <Text style={dynamicStyles.appVersion}>Einbuergerungstest/LiD 2025 v1.0.0</Text>
        <Text style={dynamicStyles.appCopyright}>2025 @ einbuergerungstest-fragen24.de</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

