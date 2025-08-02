import React from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { router } from 'expo-router';
import { BackIcon, InfoIcon } from '../../constants/Icons';
import { Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

const TermsOfService = () => {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

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
      padding: Spacing.md,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...Shadows.small,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.large,
      backgroundColor: colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.small,
    },
    headerTitle: {
      ...Typography.heading.h4,
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    headerIcon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContainer: {
      padding: Spacing.lg,
      paddingBottom: Spacing.xl * 2,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
      padding: Spacing.lg,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.large,
      ...Shadows.card,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.tint + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    title: {
      ...Typography.heading.h2,
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      ...Typography.body.medium,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.xs,
    },
    updated: {
      ...Typography.caption.small,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: Spacing.sm,
    },
    section: {
      marginBottom: Spacing.xl,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.large,
      padding: Spacing.lg,
      ...Shadows.card,
    },
    sectionTitle: {
      ...Typography.heading.h5,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    paragraph: {
      ...Typography.body.medium,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: Spacing.sm,
    },
    bulletList: {
      paddingLeft: Spacing.md,
    },
    bulletItem: {
      ...Typography.body.medium,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: Spacing.xs,
    },
    importantNote: {
      backgroundColor: colors.warningBackground,
      padding: Spacing.md,
      borderRadius: BorderRadius.medium,
      borderLeftWidth: 4,
      borderLeftColor: colors.warning,
      marginTop: Spacing.sm,
    },
    importantNoteText: {
      ...Typography.body.medium,
      color: colors.warning,
      fontWeight: '600',
    },
    disclaimer: {
      backgroundColor: colors.backgroundSecondary,
      padding: Spacing.md,
      borderRadius: BorderRadius.medium,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    disclaimerTitle: {
      ...Typography.heading.h6,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    contactInfo: {
      backgroundColor: colors.successBackground,
      padding: Spacing.md,
      borderRadius: BorderRadius.medium,
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
    },
    contactText: {
      ...Typography.body.medium,
      color: colors.success,
      fontWeight: '600',
    },
  });

  const Section = ({ title, children }) => (
    <View style={dynamicStyles.section}>
      <Text style={dynamicStyles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const Paragraph = ({ children }) => (
    <Text style={dynamicStyles.paragraph}>{children}</Text>
  );

  const BulletList = ({ items }) => (
    <View style={dynamicStyles.bulletList}>
      {items.map((item, index) => (
        <Text key={index} style={dynamicStyles.bulletItem}>• {item}</Text>
      ))}
    </View>
  );

  const ImportantNote = ({ children }) => (
    <View style={dynamicStyles.importantNote}>
      <Text style={dynamicStyles.importantNoteText}>Important: {children}</Text>
    </View>
  );

  const Disclaimer = ({ title, children }) => (
    <View style={dynamicStyles.disclaimer}>
      <Text style={dynamicStyles.disclaimerTitle}>{title}</Text>
      <Text style={dynamicStyles.paragraph}>{children}</Text>
    </View>
  );

  const ContactInfo = ({ email }) => (
    <View style={dynamicStyles.contactInfo}>
      <Text style={dynamicStyles.contactText}>Email: {email}</Text>
    </View>
  );

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={dynamicStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

        <Section title="Acceptance of Terms">
          <Paragraph>
            By using this website, you agree to these terms of service. If you disagree, please do not use the website.
          </Paragraph>
        </Section>

        <Section title="Service Description">
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

        <Section title="User Responsibilities">
          <BulletList items={[
            'Use the website only for legal purposes',
            'Not engage in harmful or disruptive activities',
            'Respect the rights of other users',
            'Provide accurate information when required'
          ]} />
        </Section>

        <Section title="Intellectual Property">
          <Paragraph>
            All content on this website is protected by copyright. BAMF questions are publicly available and used for educational purposes.
          </Paragraph>
          <ImportantNote>
            Questions are from the official BAMF question catalog and used solely for educational purposes.
          </ImportantNote>
        </Section>

        <Section title="Disclaimers">
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

        <Section title="Limitation of Liability">
          <Paragraph>
            We are not liable for direct, indirect, or consequential damages arising from the use of this website.
          </Paragraph>
        </Section>

        <Section title="Changes to Terms">
          <Paragraph>
            We reserve the right to modify these terms of service at any time. Changes will be posted on this page.
          </Paragraph>
        </Section>

        <Section title="Contact Us">
          <Paragraph>
            For questions about these terms of service, contact us:
          </Paragraph>
          <ContactInfo email="support@einbuergerungstest-fragen24.de" />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfService;
