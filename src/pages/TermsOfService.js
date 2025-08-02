import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { router } from 'expo-router';
import { 
  BackIcon, 
  InfoIcon, 
  CheckIcon,
  StudyIcon,
  CertificateIcon,
  WarningIcon,
  EditIcon,
  ContactIcon,
  CalendarIcon,
  BookIcon,
  SupportIcon,
  SettingsIcon,
  HelpIcon
} from '../../constants/Icons';
import { Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

const { width } = Dimensions.get('window');

const TermsOfService = () => {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeSection, setActiveSection] = useState(0);

  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.lg,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...Shadows.medium,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.large,
      backgroundColor: colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.small,
    },
    headerTitle: {
      ...Typography.heading.h3,
      color: colors.text,
      flex: 1,
      textAlign: 'center',
      fontWeight: '600',
    },
    headerIconContainer: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.large,
      backgroundColor: colors.tint + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 3,
      backgroundColor: colors.tint,
      borderRadius: 2,
    },
    scrollContainer: {
      padding: Spacing.lg,
      paddingBottom: Spacing.xl * 2,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
      padding: Spacing.xl,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xlarge,
      ...Shadows.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.tint + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
      ...Shadows.small,
    },
    title: {
      ...Typography.heading.h1,
      color: colors.text,
      textAlign: 'center',
      fontWeight: '700',
    },
    subtitle: {
      ...Typography.body.large,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.sm,
      lineHeight: 24,
    },
    lastUpdatedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.md,
      padding: Spacing.sm,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: BorderRadius.medium,
    },
    updated: {
      ...Typography.caption.medium,
      color: colors.textMuted,
      marginLeft: Spacing.xs,
    },
    section: {
      marginBottom: Spacing.lg,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xlarge,
      padding: Spacing.xl,
      ...Shadows.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    sectionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.large,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
      ...Shadows.small,
    },
    sectionTitle: {
      ...Typography.heading.h4,
      color: colors.text,
      flex: 1,
      fontWeight: '600',
    },
    sectionNumber: {
      ...Typography.caption.small,
      color: colors.textMuted,
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.small,
      overflow: 'hidden',
    },
    paragraph: {
      ...Typography.body.medium,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: Spacing.sm,
    },
    bulletList: {
      paddingLeft: Spacing.sm,
    },
    bulletItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    bulletIcon: {
      marginRight: Spacing.sm,
      marginTop: 2,
    },
    bulletText: {
      ...Typography.body.medium,
      color: colors.textSecondary,
      lineHeight: 22,
      flex: 1,
    },
    importantNote: {
      backgroundColor: colors.warningBackground,
      padding: Spacing.lg,
      borderRadius: BorderRadius.large,
      borderLeftWidth: 4,
      borderLeftColor: colors.warning,
      marginTop: Spacing.md,
      ...Shadows.small,
    },
    importantNoteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    importantNoteText: {
      ...Typography.body.medium,
      color: colors.warning,
      fontWeight: '600',
      marginLeft: Spacing.sm,
    },
    disclaimer: {
      backgroundColor: colors.backgroundSecondary,
      padding: Spacing.lg,
      borderRadius: BorderRadius.large,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...Shadows.small,
    },
    disclaimerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    disclaimerTitle: {
      ...Typography.heading.h6,
      color: colors.text,
      marginLeft: Spacing.sm,
      flex: 1,
    },
    contactInfo: {
      backgroundColor: colors.successBackground,
      padding: Spacing.lg,
      borderRadius: BorderRadius.large,
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
      ...Shadows.small,
    },
    contactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    contactText: {
      ...Typography.body.medium,
      color: colors.success,
      fontWeight: '600',
      marginLeft: Spacing.sm,
    },
    floatingButton: {
      position: 'absolute',
      bottom: Spacing.xl,
      right: Spacing.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.large,
    },
    quickNavContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.card,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.large,
      marginBottom: Spacing.lg,
      ...Shadows.card,
    },
    quickNavItem: {
      alignItems: 'center',
      flex: 1,
    },
    quickNavIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xs,
    },
    quickNavText: {
      ...Typography.caption.small,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });

  const Section = ({ title, children, icon: IconComponent, iconColor, sectionNumber }) => (
    <View style={dynamicStyles.section}>
      <View style={dynamicStyles.sectionHeader}>
        <View style={[
          dynamicStyles.sectionIconContainer,
          { backgroundColor: iconColor + '20' }
        ]}>
          <IconComponent size={24} color={iconColor} />
        </View>
        <Text style={dynamicStyles.sectionTitle}>{title}</Text>
        <Text style={dynamicStyles.sectionNumber}>{sectionNumber}</Text>
      </View>
      {children}
    </View>
  );

  const Paragraph = ({ children }) => (
    <Text style={dynamicStyles.paragraph}>{children}</Text>
  );

  const BulletList = ({ items }) => (
    <View style={dynamicStyles.bulletList}>
      {items.map((item, index) => (
        <View key={index} style={dynamicStyles.bulletItem}>
          <View style={dynamicStyles.bulletIcon}>
            <CheckIcon size={16} color={colors.success} />
          </View>
          <Text style={dynamicStyles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const ImportantNote = ({ children }) => (
    <View style={dynamicStyles.importantNote}>
      <View style={dynamicStyles.importantNoteHeader}>
        <WarningIcon size={20} color={colors.warning} />
        <Text style={dynamicStyles.importantNoteText}>Important: {children}</Text>
      </View>
    </View>
  );

  const Disclaimer = ({ title, children }) => (
    <View style={dynamicStyles.disclaimer}>
      <View style={dynamicStyles.disclaimerHeader}>
        <InfoIcon size={20} color={colors.info} />
        <Text style={dynamicStyles.disclaimerTitle}>{title}</Text>
      </View>
      <Text style={dynamicStyles.paragraph}>{children}</Text>
    </View>
  );

  const ContactInfo = ({ email }) => (
    <View style={dynamicStyles.contactInfo}>
      <View style={dynamicStyles.contactHeader}>
        <ContactIcon size={20} color={colors.success} />
        <Text style={dynamicStyles.contactText}>Email: {email}</Text>
      </View>
    </View>
  );

  const QuickNavigation = () => (
    <View style={dynamicStyles.quickNavContainer}>
      <TouchableOpacity style={dynamicStyles.quickNavItem}>
        <View style={dynamicStyles.quickNavIcon}>
          <BookIcon size={16} color={colors.tint} />
        </View>
        <Text style={dynamicStyles.quickNavText}>Overview</Text>
      </TouchableOpacity>
      <TouchableOpacity style={dynamicStyles.quickNavItem}>
        <View style={dynamicStyles.quickNavIcon}>
          <HelpIcon size={16} color={colors.warning} />
        </View>
        <Text style={dynamicStyles.quickNavText}>Privacy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={dynamicStyles.quickNavItem}>
        <View style={dynamicStyles.quickNavIcon}>
          <ContactIcon size={16} color={colors.success} />
        </View>
        <Text style={dynamicStyles.quickNavText}>Contact</Text>
      </TouchableOpacity>
    </View>
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Enhanced Header */}
      <View style={dynamicStyles.headerContainer}>
        <TouchableOpacity 
          style={dynamicStyles.backButton}
          onPress={() => router.back()}
        >
          <BackIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Terms of Service</Text>
        <View style={dynamicStyles.headerIconContainer}>
          <BookIcon size={20} color={colors.tint} />
        </View>
        <Animated.View 
          style={[
            dynamicStyles.progressBar,
            {
              width: scrollY.interpolate({
                inputRange: [0, 1000],
                outputRange: [0, width],
                extrapolate: 'clamp',
              }),
            }
          ]}
        />
      </View>
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={dynamicStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={dynamicStyles.titleContainer}>
          <View style={dynamicStyles.heroIconContainer}>
            <BookIcon size={40} color={colors.tint} />
          </View>
          <Text style={dynamicStyles.title}>Terms of Service</Text>
          <Text style={dynamicStyles.subtitle}>
            Please read these terms carefully before using our citizenship test preparation service
          </Text>
          <View style={dynamicStyles.lastUpdatedContainer}>
            <CalendarIcon size={14} color={colors.textMuted} />
            <Text style={dynamicStyles.updated}>Last updated: December 2024</Text>
          </View>
        </View>

        {/* Quick Navigation */}
        <QuickNavigation />

        <Section 
          title="Acceptance of Terms" 
          icon={CheckIcon} 
          iconColor={colors.success}
          sectionNumber="01"
        >
          <Paragraph>
            By using this website, you agree to these terms of service. If you disagree, please do not use the website.
          </Paragraph>
        </Section>

        <Section 
          title="Service Description" 
          icon={StudyIcon} 
          iconColor={colors.tint}
          sectionNumber="02"
        >
          <Paragraph>
            Our website provides free preparation for the German citizenship test with the following features:
          </Paragraph>
          <BulletList items={[
            'All 300 official BAMF questions',
            'Test simulator with realistic conditions',
            'State-specific questions',
            'Progress tracking and bookmarks',
            'Multi-language support'
          ]} />
        </Section>

        <Section 
          title="Intellectual Property" 
          icon={CertificateIcon} 
          iconColor={colors.info}
          sectionNumber="03"
        >
          <Paragraph>
            All content on this website is protected by copyright. BAMF questions are publicly available and used for educational purposes.
          </Paragraph>
          <ImportantNote>
            Questions are from the official BAMF question catalog and used solely for educational purposes.
          </ImportantNote>
        </Section>

        <Section 
          title="Disclaimers" 
          icon={WarningIcon} 
          iconColor={colors.warning}
          sectionNumber="04"
        >
          <Disclaimer title="Educational Purpose">
            This website is for educational purposes only and is not officially affiliated with BAMF.
          </Disclaimer>
          <Disclaimer title="No Success Guarantee">
            We do not guarantee that using this website will result in passing the official test.
          </Disclaimer>
          <Disclaimer title="Content Accuracy">
            While we strive to provide accurate information, we cannot guarantee completeness or accuracy.
          </Disclaimer>
        </Section>

        <Section 
          title="Limitation of Liability" 
          icon={HelpIcon} 
          iconColor={colors.error}
          sectionNumber="05"
        >
          <Paragraph>
            We are not liable for direct, indirect, or consequential damages arising from the use of this website.
          </Paragraph>
        </Section>

        <Section 
          title="Changes to Terms" 
          icon={EditIcon} 
          iconColor={colors.tint}
          sectionNumber="06"
        >
          <Paragraph>
            We reserve the right to modify these terms of service at any time. Changes will be posted on this page.
          </Paragraph>
        </Section>

        <Section 
          title="Contact Us" 
          icon={SupportIcon} 
          iconColor={colors.success}
          sectionNumber="07"
        >
          <Paragraph>
            For questions about these terms of service, contact us:
          </Paragraph>
          <ContactInfo email="support@einbuergerungstest-fragen24.de" />
        </Section>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={dynamicStyles.floatingButton}
        onPress={() => {
          // Handle quick contact action
        }}
      >
        <ContactIcon size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default TermsOfService;
