import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
  AppState
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from '../src/hooks/useTranslation';
import { questionsData } from '../src/data/questions';
import { getItem } from '../src/utils/storage';
import { refreshStats, subscribeToStats } from '../src/utils/statsManager';
import { Shadows, BorderRadius, Spacing } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../src/utils/languageContext';
import { 
  LibraryIcon, 
  LocationIcon, 
  TestIcon, 
  BookmarkIcon, 
  ErrorIcon, 
  SupportIcon,
  AppIcon,
  LanguageIcon,
  StatsIcon,
  TrophyIcon,
  TargetIcon,
  InfoIcon,
  CheckIcon,
  GermanyIcon,
  SettingsIcon,
  GridIcon
} from '../constants/Icons';

const { width } = Dimensions.get('window');

// Helper to generate a unique id for a question
function getQuestionId(q: { question: string; options: string[]; answer?: string }): string {
  const raw = `${q.question}::${(q.options || []).join('|')}::${q.answer || ''}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) + raw.charCodeAt(i);
  }
  return 'q_' + (hash >>> 0).toString(36);
}

const BOOKMARKS_KEY = 'bookmarked_questions_v2';
const INCORRECT_KEY = 'incorrect_questions_v2';

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useTheme();
const { t, language, getLanguageInfo } = useTranslation();
  const { setLanguage } = useLanguage();
  const [bookmarkedCount, setBookmarkedCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [totalQuestions] = useState(300);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [correctCount, setCorrectCount] = useState(0);

  // Load stats and animate entrance
  useEffect(() => {
    const loadData = async () => {
      // Load stats
      const bookmarked = await getItem(BOOKMARKS_KEY, []);
      const incorrect = await getItem(INCORRECT_KEY, []);
      setBookmarkedCount(bookmarked?.length || 0);
      setIncorrectCount(incorrect?.length || 0);
    };
    loadData();
    
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

// Refresh stats when the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      // Refresh stats when returning to the overview
      refreshStats().then(stats => {
        setBookmarkedCount(stats.bookmarkedCount);
        setIncorrectCount(stats.incorrectCount);
        setCorrectCount(stats.correctCount);
      });
    }, [])
  );

  // Use statsManager to keep counters updated
  useEffect(() => {
    // Initial load
    refreshStats().then(stats => {
      setBookmarkedCount(stats.bookmarkedCount);
      setIncorrectCount(stats.incorrectCount);
      setCorrectCount(stats.correctCount);    });

    // Subscribe to future updates
    const unsubscribe = subscribeToStats(stats => {
      setBookmarkedCount(stats.bookmarkedCount);
      setIncorrectCount(stats.incorrectCount);
      setCorrectCount(stats.correctCount);    });

    // Set up AppState listener to refresh stats when app becomes active
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Force refresh from storage when returning to the app
        refreshStats().then(stats => {
          setBookmarkedCount(stats.bookmarkedCount);
          setIncorrectCount(stats.incorrectCount);
          setCorrectCount(stats.correctCount);
        });
      }
    });

    // Set up a periodic refresh every 3 seconds when app is active
    const interval = setInterval(() => {
      refreshStats();
    }, 3000);

    return () => {
      unsubscribe();
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  const navigationItems = [
    {
      id: 'all',
      title: t.nav_all,
      description: t.all_questions_desc,
      IconComponent: LibraryIcon,
      color: colors.tint,
      route: '/pages/all-questions',
      stats: `${totalQuestions} ${t.questions}`
    },
    {
      id: 'state',
      title: t.nav_state,
      description: t.state_questions_desc,
      IconComponent: LocationIcon,
      color: colors.success,
      route: '/pages/state-questions',
      stats: t.state_questions_title
    },
    {
      id: 'test',
      title: t.nav_test,
      description: t.test_sim_desc,
      IconComponent: TestIcon,
      color: colors.warning,
      route: '/pages/test-simulator',
      stats: t.test_60_minutes
    },
    {
      id: 'bookmarked',
      title: t.nav_marked,
      description: t.marked_desc,
      IconComponent: BookmarkIcon,
      color: '#8b5cf6',
      route: '/pages/bookmarked',
      stats: `${bookmarkedCount} ${t.bookmarked}`
    },
    {
      id: 'incorrect',
      title: t.nav_incorrect,
      description: t.incorrect_desc,
      IconComponent: ErrorIcon,
      color: colors.error,
      route: '/pages/incorrect',
      stats: `${incorrectCount} ${t.to_review}`
    },
    {
      id: 'support',
      title: t.nav_support,
      description: t.support_desc || t.support_title,
      IconComponent: SupportIcon,
      color: '#ec4899',
      route: '/pages/support',
      stats: t.support_me
    }
  ];

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const toggleLanguage = () => {
const availableLanguages = ['EN', 'DE', 'TR'];
    const currentIndex = availableLanguages.indexOf(language);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    const newLang = availableLanguages[nextIndex];
    setLanguage(newLang);
  };

  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.backgroundSecondary,
    },
    headerBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
    },
    appBarContainer: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      ...Shadows.small,
    },
    appIcon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.large,
      backgroundColor: colors.infoBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
      borderWidth: 1,
      borderColor: colors.tint,
      ...Shadows.small,
    },
    appTitle: {
      ...Typography.heading.h4,
      color: colors.tint,
    },
    langButton: {
      backgroundColor: colors.infoBackground,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.xlarge,
      borderWidth: 1,
      borderColor: colors.tint,
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: Spacing.xs,
      ...Shadows.small,
    },
    langButtonText: {
      ...Typography.button.small,
      color: colors.tint,
    },
    themeButton: {
      backgroundColor: colors.infoBackground,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.xlarge,
      borderWidth: 1,
      borderColor: colors.tint,
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: Spacing.xs,
      ...Shadows.small,
    },
    themeButtonText: {
      fontSize: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.large,
      padding: Spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 80,
      ...Shadows.card,
    },
    statNumber: {
      ...Typography.heading.h3,
      color: colors.tint,
      marginBottom: 2,
    },
    statLabel: {
      ...Typography.caption.small,
      color: colors.textMuted,
      textAlign: 'center',
    },
    sectionTitle: {
      ...Typography.heading.h2,
      color: colors.text,
      marginBottom: Spacing.md,
      textAlign: 'center',
    },
    navCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: BorderRadius.large,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 76,
      ...Shadows.card,
    },
    navCardTitle: {
      ...Typography.heading.h5,
      color: colors.text,
      marginBottom: 3,
    },
    navCardDesc: {
      ...Typography.body.small,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    tipCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.large,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...Shadows.card,
    },
    tipTitle: {
      ...Typography.heading.h6,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    tipDesc: {
      ...Typography.body.small,
      color: colors.textSecondary,
    },
    welcomeCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.large,
      padding: Spacing.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      ...Shadows.card,
    },
    welcomeTitle: {
      ...Typography.heading.h4,
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    welcomeDesc: {
      ...Typography.body.medium,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    welcomeFlag: {
      fontSize: 32,
      textAlign: 'center',
    },
    overviewCard: {
      marginTop: Spacing.sm,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={90} style={styles.blurView} tint={theme === 'dark' ? 'dark' : 'light'} />
        ) : (
          <View style={dynamicStyles.headerBackground} />
        )}
      </View>
      
      {/* App Bar */}
      <Animated.View 
        style={[
          styles.appBar,
          { opacity: fadeAnim }
        ]}
      >
        <View style={dynamicStyles.appBarContainer}>
          <View style={styles.appBarContent}>
            <View style={styles.appBarLeft}>
              <View style={dynamicStyles.appIcon}>
                <Text style={styles.appIconFlag}>🇩🇪</Text>
              </View>
              <View style={styles.titleContainer}>
                <Text style={dynamicStyles.appTitle}>Einbuergerungstest/LiD 2025</Text>
              </View>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={dynamicStyles.themeButton}
                onPress={() => handleNavigation('/pages/settings')}
                accessibilityLabel="Open Settings"
                activeOpacity={0.7}
              >
                <SettingsIcon size={16} color={colors.tint} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={dynamicStyles.themeButton}
                onPress={toggleTheme}
                accessibilityLabel={t.toggle_theme}
                activeOpacity={0.7}
              >
                <Text style={dynamicStyles.themeButtonText}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView 
          style={styles.questionScrollView}
          contentContainerStyle={styles.questionScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Navigation Grid */}
          <Animated.View 
            style={[
              styles.navigationSection,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={dynamicStyles.sectionTitle}>{t.study_options}</Text>
            
            <View style={styles.navigationGrid}>
              {navigationItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    onPress={() => handleNavigation(item.route)}
                    activeOpacity={0.8}
                    style={dynamicStyles.navCard}
                  >
                    <View style={[styles.navCardIcon, { backgroundColor: item.color }]}>
                      <item.IconComponent size={24} color="#ffffff" />
                    </View>
                    
                    <View style={styles.navCardContent}>
                      <Text style={dynamicStyles.navCardTitle}>{item.title}</Text>
                      <Text style={dynamicStyles.navCardDesc}>{item.description}</Text>
                      <View style={[styles.navCardStatsContainer, { backgroundColor: item.color + '20' }]}>
                        <Text style={[styles.navCardStats, { color: item.color }]}>{item.stats}</Text>
                      </View>
                    </View>
                    
                    <View style={[styles.navCardArrow, { backgroundColor: item.color + '20' }]}>
                      <Text style={[styles.navCardArrowText, { color: item.color }]}>→</Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Add overview row after "All Questions" */}
                  {item.id === 'all' && (
                    <TouchableOpacity
                      onPress={() => handleNavigation('/pages/all-questions?overview=true')}
                      activeOpacity={0.8}
                      style={[dynamicStyles.navCard, dynamicStyles.overviewCard]}
                    >
                      <View style={[styles.navCardIcon, { backgroundColor: '#6366f1' }]}>
                        <GridIcon size={24} color="#ffffff" />
                      </View>
                      
                      <View style={styles.navCardContent}>
                        <Text style={dynamicStyles.navCardTitle}>{t.questions_overview || 'Questions Overview'}</Text>
                        <Text style={dynamicStyles.navCardDesc}>{t.overview_desc || 'Visual grid showing all 300 questions with color-coded progress. See which questions you have answered correctly.'}</Text>
                        <View style={[styles.navCardStatsContainer, { backgroundColor: '#6366f1' + '20' }]}>
                          <Text style={[styles.navCardStats, { color: '#6366f1' }]}>{correctCount}/{totalQuestions} {t.correct || 'correct'}</Text>
                        </View>
                      </View>
                      
                      <View style={[styles.navCardArrow, { backgroundColor: '#6366f1' + '20' }]}>
                        <Text style={[styles.navCardArrowText, { color: '#6366f1' }]}>→</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </React.Fragment>
              ))}
            </View>
          </Animated.View>

          {/* Statistics Section */}
          <Animated.View 
            style={[
              styles.statsSection,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={dynamicStyles.sectionTitle}>{t.statistics}</Text>
            
            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={dynamicStyles.statCard}
                onPress={() => handleNavigation('/pages/all-questions?overview=true')}
                activeOpacity={0.8}
                accessibilityLabel={t.view_questions_overview}
              >
                <View style={styles.statIconContainer}>
                  <LibraryIcon size={20} color={colors.tint} />
                </View>
                <Text style={dynamicStyles.statNumber}>{correctCount}/{totalQuestions}</Text>
                <Text style={dynamicStyles.statLabel}>{t.questions_done}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={dynamicStyles.statCard}
                onPress={() => handleNavigation('/pages/bookmarked')}
                activeOpacity={0.8}
                accessibilityLabel={t.view_bookmarked_questions}
              >
                <View style={styles.statIconContainer}>
                  <BookmarkIcon size={20} color={colors.warning} />
                </View>
                <Text style={dynamicStyles.statNumber}>{bookmarkedCount}</Text>
                <Text style={dynamicStyles.statLabel}>{t.bookmarked}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={dynamicStyles.statCard}
                onPress={() => handleNavigation('/pages/incorrect')}
                activeOpacity={0.8}
                accessibilityLabel={t.view_questions_to_review}
              >
                <View style={styles.statIconContainer}>
                  <TargetIcon size={20} color={colors.error} />
                </View>
                <Text style={dynamicStyles.statNumber}>{incorrectCount}</Text>
                <Text style={dynamicStyles.statLabel}>{t.to_review}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Study Tips Section */}
          <Animated.View 
            style={[
              styles.tipsSection,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={dynamicStyles.sectionTitle}>{t.study_tips}</Text>
            
            <View style={styles.tipsContainer}>
              <View style={dynamicStyles.tipCard}>
                <View style={styles.tipHeaderRow}>
                  <View style={styles.tipIconContainer}>
                    <InfoIcon size={20} color={colors.info} />
                  </View>
                  <Text style={dynamicStyles.tipTitle}>{t.start_with_all_questions}</Text>
                </View>
                <Text style={dynamicStyles.tipDesc}>{t.start_with_all_questions_desc}</Text>
              </View>
              
              <View style={dynamicStyles.tipCard}>
                <View style={styles.tipHeaderRow}>
                  <View style={styles.tipIconContainer}>
                    <BookmarkIcon size={20} color={colors.warning} />
                  </View>
                  <Text style={dynamicStyles.tipTitle}>{t.bookmark_difficult_ones}</Text>
                </View>
                <Text style={dynamicStyles.tipDesc}>{t.bookmark_difficult_ones_desc}</Text>
              </View>
              
              <View style={dynamicStyles.tipCard}>
                <View style={styles.tipHeaderRow}>
                  <View style={styles.tipIconContainer}>
                    <TargetIcon size={20} color={colors.success} />
                  </View>
                  <Text style={dynamicStyles.tipTitle}>{t.take_practice_tests}</Text>
                </View>
                <Text style={dynamicStyles.tipDesc}>{t.take_practice_tests_desc}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Welcome Message */}
          <Animated.View 
            style={[
              styles.welcomeSection,
              { opacity: fadeAnim }
            ]}
          >
            <View style={dynamicStyles.welcomeCard}>
              <View style={styles.welcomeIconContainer}>
                <Text style={dynamicStyles.welcomeFlag}>🇩🇪</Text>
              </View>
              <Text style={dynamicStyles.welcomeTitle}>{t.good_luck_message}</Text>
              <Text style={dynamicStyles.welcomeDesc}>{t.you_got_this}</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 70 : 60,
    zIndex: 10,
    ...Shadows.medium,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  appBar: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    zIndex: 20,
  },
  appBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Main Content
  mainContent: {
    flex: 1,
    marginTop: 2,
  },
  questionScrollView: {
    flex: 1,
  },
  questionScrollContent: {
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  
  // Stats Section
  statsSection: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statIconContainer: {
    marginBottom: Spacing.xs,
  },
  
  // Navigation Section
  navigationSection: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  navigationGrid: {
    gap: Spacing.md,
  },
  navCardIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    ...Shadows.small,
  },
  navCardContent: {
    flex: 1,
  },
  navCardStatsContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.small,
    alignSelf: 'flex-start',
  },
  navCardStats: {
    ...Typography.caption.medium,
    fontWeight: '700',
  },
  navCardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  navCardArrowText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Tips Section
  tipsSection: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tipsContainer: {
    gap: Spacing.md,
  },
  tipIconContainer: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  
  // Welcome Section
  welcomeSection: {
    paddingHorizontal: Spacing.sm,
  },
  welcomeIconContainer: {
    marginBottom: Spacing.md,
  },
  appIconFlag: {
    fontSize: 20,
    textAlign: 'center',
  },
});
