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
    sourceInfo: {
      backgroundColor: colors.infoBackground,
      padding: Spacing.lg,
      borderRadius: BorderRadius.large,
      borderLeftWidth: 4,
      borderLeftColor: colors.info,
      marginTop: Spacing.md,
      ...Shadows.small,
    },
    sourceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    sourceIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.info + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.sm,
    },
    sourceTitle: {
      ...Typography.heading.h6,
      color: colors.info,
      fontWeight: '600',
    },
    sourceUrl: {
      ...Typography.body.small,
      color: colors.info,
      fontFamily: 'monospace',
      backgroundColor: colors.backgroundSecondary,
      padding: Spacing.sm,
      borderRadius: BorderRadius.small,
      marginTop: Spacing.xs,
    },
    updateInfo: {
      backgroundColor: colors.successBackground,
      padding: Spacing.md,
      borderRadius: BorderRadius.medium,
      marginTop: Spacing.md,
      borderWidth: 1,
      borderColor: colors.success + '30',
    },
    updateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    updateIconContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.success + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.sm,
    },
    updateTitle: {
      ...Typography.body.medium,
      color: colors.success,
      fontWeight: '600',
    },
    updateText: {
      ...Typography.body.small,
      color: colors.success,
      lineHeight: 20,
    },
    versionInfo: {
      backgroundColor: colors.backgroundSecondary,
      padding: Spacing.md,
      borderRadius: BorderRadius.medium,
      marginTop: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    versionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    versionTitle: {
      ...Typography.body.small,
      color: colors.textMuted,
      fontWeight: '500',
      marginLeft: Spacing.xs,
    },
    versionDate: {
      ...Typography.body.medium,
      color: colors.text,
      fontWeight: '600',
      fontFamily: 'monospace',
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
        <Text style={dynamicStyles.quickNavText}>{t.terms_quick_nav_overview}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={dynamicStyles.quickNavItem}>
        <View style={dynamicStyles.quickNavIcon}>
          <HelpIcon size={16} color={colors.warning} />
        </View>
        <Text style={dynamicStyles.quickNavText}>{t.terms_quick_nav_privacy}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={dynamicStyles.quickNavItem}>
        <View style={dynamicStyles.quickNavIcon}>
          <ContactIcon size={16} color={colors.success} />
        </View>
        <Text style={dynamicStyles.quickNavText}>{t.terms_quick_nav_contact}</Text>
      </TouchableOpacity>
    </View>
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
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
          <Text style={dynamicStyles.title}>{t.terms_of_service_title}</Text>
          <Text style={dynamicStyles.subtitle}>
            {t.terms_of_service_subtitle}
          </Text>
          <View style={dynamicStyles.lastUpdatedContainer}>
            <CalendarIcon size={14} color={colors.textMuted} />
            <Text style={dynamicStyles.updated}>{t.terms_last_updated}</Text>
          </View>
        </View>

        {/* Quick Navigation */}
        <QuickNavigation />

        <Section 
          title={t.terms_acceptance_title} 
          icon={CheckIcon} 
          iconColor={colors.success}
          sectionNumber="01"
        >
          <Paragraph>
            {t.terms_acceptance_content}
          </Paragraph>
        </Section>

        <Section 
          title={t.terms_service_title} 
          icon={StudyIcon} 
          iconColor={colors.tint}
          sectionNumber="02"
        >
          <Paragraph>
            {t.terms_service_content}
          </Paragraph>
          <BulletList items={t.terms_service_features} />
          <Paragraph>
            {t.terms_service_source}
          </Paragraph>
          
          <View style={dynamicStyles.sourceInfo}>
            <View style={dynamicStyles.sourceHeader}>
              <View style={dynamicStyles.sourceIconContainer}>
                <BookIcon size={20} color={colors.info} />
              </View>
              <Text style={dynamicStyles.sourceTitle}>{t.terms_bamf_catalog_title}</Text>
            </View>
            <Text style={dynamicStyles.sourceUrl}>
              {t.terms_bamf_catalog_url}
            </Text>
          </View>

          <View style={dynamicStyles.updateInfo}>
            <View style={dynamicStyles.updateHeader}>
              <View style={dynamicStyles.updateIconContainer}>
                <CheckIcon size={16} color={colors.success} />
              </View>
              <Text style={dynamicStyles.updateTitle}>{t.terms_regular_updates_title}</Text>
            </View>
            <Text style={dynamicStyles.updateText}>
              {t.terms_regular_updates_content}
            </Text>
          </View>

          <View style={dynamicStyles.versionInfo}>
            <View style={dynamicStyles.versionHeader}>
              <CalendarIcon size={16} color={colors.textMuted} />
              <Text style={dynamicStyles.versionTitle}>{t.terms_source_pdf_title}</Text>
            </View>
            <Text style={dynamicStyles.versionDate}>{t.terms_source_pdf_date}</Text>
          </View>
        </Section>


        <Section 
          title={t.terms_disclaimers_title} 
          icon={WarningIcon} 
          iconColor={colors.warning}
          sectionNumber="03"
        >
          <Disclaimer title={t.terms_disclaimer_educational_title}>
            {t.terms_disclaimer_educational_content}
          </Disclaimer>
          <Disclaimer title={t.terms_disclaimer_guarantee_title}>
            {t.terms_disclaimer_guarantee_content}
          </Disclaimer>
          <Disclaimer title={t.terms_disclaimer_accuracy_title}>
            {t.terms_disclaimer_accuracy_content}
          </Disclaimer>
        </Section>

        <Section 
          title={t.terms_liability_title} 
          icon={HelpIcon} 
          iconColor={colors.error}
          sectionNumber="04"
        >
          <Paragraph>
            {t.terms_liability_content}
          </Paragraph>
        </Section>

        <Section 
          title={t.terms_changes_title} 
          icon={EditIcon} 
          iconColor={colors.tint}
          sectionNumber="05"
        >
          <Paragraph>
            {t.terms_changes_content}
          </Paragraph>
        </Section>

        <Section 
          title={t.terms_contact_title} 
          icon={SupportIcon} 
          iconColor={colors.success}
          sectionNumber="06"
        >
          <Paragraph>
            {t.terms_contact_content}
          </Paragraph>
          <ContactInfo email={t.terms_contact_email} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfService;
