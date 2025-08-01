import React, { useState, useEffect } from 'react';
import { getItem, setItem } from '../../src/utils/storage';
import { TouchableOpacity, StyleSheet, View, Text, ScrollView, Platform, StatusBar, Alert, Clipboard, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { translations } from '../../src/data/translations-new';

export default function SupportScreen() {
  const [lang, setLang] = useState<'EN' | 'DE'>('EN');
  const t = translations[lang];
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal');
  const [selectedAmount, setSelectedAmount] = useState('10');
  const [copiedField, setCopiedField] = useState('');

  // Load app language from storage
  useEffect(() => {
    const loadAppLanguage = async () => {
      try {
        const storedLanguage = await getItem('app_language', 'EN');
        if (storedLanguage && (storedLanguage === 'EN' || storedLanguage === 'DE')) {
          setLang(storedLanguage);
        }
      } catch (error) {
        console.error('Error loading app language:', error);
      }
    };

    loadAppLanguage();
  }, []);

  const supportOptions = [
    {
      id: 'coffee',
      name: 'Buy me a coffee',
      amount: '5',
      emoji: '☕',
      color: '#f59e0b',
      description: 'Support daily motivation',
      paypalLink: 'https://www.paypal.com/donate/?hosted_button_id=8U2QTGMTNYMXU',
      benefits: ['Daily motivation', 'Bug fixes', 'Quick responses']
    },
    {
      id: 'maintenance',
      name: 'Help maintain app',
      amount: '10',
      emoji: '🔧',
      color: '#3b82f6',
      description: 'Cover server costs',
      paypalLink: 'https://www.paypal.com/donate/?hosted_button_id=8U2QTGMTNYMXU',
      benefits: ['Server costs covered', 'Regular updates', 'New features', 'Priority support'],
      popular: true
    },
    {
      id: 'party',
      name: 'Celebration fund',
      amount: '20',
      emoji: '🎉',
      color: '#10b981',
      description: 'Major improvements',
      paypalLink: 'https://www.paypal.com/donate/?hosted_button_id=8U2QTGMTNYMXU',
      benefits: ['Celebration fund', 'Major improvements', 'Long-term sustainability', 'Special thanks']
    }
  ];

  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', emoji: '💳', desc: 'International', popular: false },
    { id: 'bank', name: 'Bank Transfer', emoji: '🏦', desc: 'SEPA - No fees', popular: true },
    { id: 'crypto', name: 'Cryptocurrency', emoji: '₿', desc: 'BTC, ETH', popular: false }
  ];

  const amounts = [
    { value: '5', label: '€5', desc: 'Coffee' },
    { value: '10', label: '€10', desc: 'Maintenance', popular: true },
    { value: '20', label: '€20', desc: 'Party' },
    { value: '50', label: '€50', desc: 'Premium' }
  ];

  // Bank details (replace with actual details)
  const bankDetails = {
    accountHolder: 'Your Full Name',
    iban: 'DE89 3704 0044 0532 0130 00',
    bic: 'COBADEFFXXX',
    bankName: 'Your Bank Name',
    reference: `LiD-App-Support-${new Date().getFullYear()}`
  };

  const handleDonate = (paypalLink, optionId, amount) => {
    setSelectedAmount(optionId);
    Linking.openURL(paypalLink);
  };

  const copyToClipboard = (text, fieldName) => {
    Clipboard.setString(text);
    setCopiedField(fieldName);
    Alert.alert('Copied!', `${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const generateReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `LiD-${selectedAmount}EUR-${timestamp}`;
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={90} style={styles.blurView} tint="light" />
        ) : (
          <View style={styles.headerBackground} />
        )}
      </View>
      
      {/* Compact App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={goBack}
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.appBarTitle} numberOfLines={1} ellipsizeMode="tail">
              Support
            </Text>
          </View>
          <View style={styles.rightActions}>
            <View style={styles.placeholderButton} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView 
          style={styles.questionScrollView}
          contentContainerStyle={styles.questionScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.heartContainer}>
              <Text style={styles.heartEmoji}>💝</Text>
              <Text style={styles.sparkles}>✨</Text>
            </View>
            <Text style={styles.title}>Support This App</Text>
            <Text style={styles.desc}>
              Your contribution helps keep this educational resource free and accessible to everyone preparing for their German citizenship test.
            </Text>
          </View>

          {/* Payment Method Selection */}
          <View style={styles.setupCard}>
            <Text style={styles.sectionTitle}>Choose Payment Method</Text>
            
            <View style={styles.paymentMethodGrid}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                  style={[
                    styles.paymentMethodButton,
                    selectedPaymentMethod === method.id && styles.paymentMethodButtonSelected
                  ]}
                  activeOpacity={0.7}
                >
                  {method.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>Popular</Text>
                    </View>
                  )}
                  <Text style={styles.paymentMethodEmoji}>{method.emoji}</Text>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  <Text style={styles.paymentMethodDesc}>{method.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* PayPal Options */}
          {selectedPaymentMethod === 'paypal' && (
            <View style={styles.setupCard}>
              <Text style={styles.sectionTitle}>PayPal Support Options</Text>
              <View style={styles.supportOptionsGrid}>
                {supportOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleDonate(option.paypalLink, option.id, option.amount)}
                    style={[styles.supportOptionButton, { backgroundColor: option.color }]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.supportOptionEmoji}>{option.emoji}</Text>
                    <Text style={styles.supportOptionName}>{option.name}</Text>
                    <Text style={styles.supportOptionAmount}>€{option.amount}</Text>
                    <Text style={styles.externalLinkIcon}>🔗</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Bank Transfer */}
          {selectedPaymentMethod === 'bank' && (
            <View style={styles.setupCard}>
              <View style={styles.bankHeader}>
                <Text style={styles.bankEmoji}>🏦</Text>
                <Text style={styles.sectionTitle}>Bank Transfer (SEPA)</Text>
                <Text style={styles.bankSubtitle}>Direct bank transfer - No fees, instant in Germany</Text>
              </View>

              {/* Amount Selection */}
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Choose Support Amount:</Text>
                <View style={styles.amountGrid}>
                  {amounts.map((amt) => (
                    <TouchableOpacity
                      key={amt.value}
                      onPress={() => setSelectedAmount(amt.value)}
                      style={[
                        styles.amountButton,
                        selectedAmount === amt.value && styles.amountButtonSelected
                      ]}
                      activeOpacity={0.7}
                    >
                      {amt.popular && (
                        <View style={styles.popularBadgeSmall}>
                          <Text style={styles.popularBadgeTextSmall}>Popular</Text>
                        </View>
                      )}
                      <Text style={styles.amountButtonLabel}>{amt.label}</Text>
                      <Text style={styles.amountButtonDesc}>{amt.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Bank Details */}
              <View style={styles.bankDetails}>
                <Text style={styles.bankDetailsTitle}>💳 Bank Transfer Details</Text>
                
                <View style={styles.bankDetailItem}>
                  <Text style={styles.bankDetailLabel}>Account Holder:</Text>
                  <View style={styles.bankDetailValue}>
                    <Text style={styles.bankDetailText}>{bankDetails.accountHolder}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(bankDetails.accountHolder, 'Account Holder')}>
                      <Text style={styles.copyButton}>{copiedField === 'Account Holder' ? '✅' : '📋'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.bankDetailItem}>
                  <Text style={styles.bankDetailLabel}>IBAN:</Text>
                  <View style={styles.bankDetailValue}>
                    <Text style={styles.bankDetailText}>{bankDetails.iban}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(bankDetails.iban.replace(/\s/g, ''), 'IBAN')}>
                      <Text style={styles.copyButton}>{copiedField === 'IBAN' ? '✅' : '📋'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.bankDetailItem}>
                  <Text style={styles.bankDetailLabel}>Reference:</Text>
                  <View style={styles.bankDetailValue}>
                    <Text style={styles.bankDetailText}>{generateReference()}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(generateReference(), 'Reference')}>
                      <Text style={styles.copyButton}>{copiedField === 'Reference' ? '✅' : '📋'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Cryptocurrency */}
          {selectedPaymentMethod === 'crypto' && (
            <View style={styles.setupCard}>
              <View style={styles.cryptoHeader}>
                <Text style={styles.cryptoEmoji}>₿</Text>
                <Text style={styles.sectionTitle}>Cryptocurrency Payment</Text>
              </View>
              
              <View style={styles.cryptoAddress}>
                <Text style={styles.cryptoLabel}>Bitcoin (BTC)</Text>
                <View style={styles.bankDetailValue}>
                  <Text style={styles.cryptoAddressText}>bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</Text>
                  <TouchableOpacity onPress={() => copyToClipboard('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'Bitcoin Address')}>
                    <Text style={styles.copyButton}>{copiedField === 'Bitcoin Address' ? '✅' : '📋'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cryptoAddress}>
                <Text style={styles.cryptoLabel}>Ethereum (ETH)</Text>
                <View style={styles.bankDetailValue}>
                  <Text style={styles.cryptoAddressText}>0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e</Text>
                  <TouchableOpacity onPress={() => copyToClipboard('0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e', 'Ethereum Address')}>
                    <Text style={styles.copyButton}>{copiedField === 'Ethereum Address' ? '✅' : '📋'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.cryptoNote}>
                Send any amount equivalent to your desired support level
              </Text>
            </View>
          )}

          {/* Why Support Section */}
          <View style={styles.setupCard}>
            <Text style={styles.sectionTitle}>🎯 Why Your Support Matters</Text>
            
            <View style={styles.whySupportGrid}>
              <View style={styles.whySupportItem}>
                <Text style={styles.whySupportEmoji}>🛡️</Text>
                <Text style={styles.whySupportTitle}>Keep It Free</Text>
                <Text style={styles.whySupportDesc}>Your support ensures this remains a free resource for all learners</Text>
              </View>
              
              <View style={styles.whySupportItem}>
                <Text style={styles.whySupportEmoji}>⏰</Text>
                <Text style={styles.whySupportTitle}>Regular Updates</Text>
                <Text style={styles.whySupportDesc}>Continuous improvements and new features based on user feedback</Text>
              </View>
              
              <View style={styles.whySupportItem}>
                <Text style={styles.whySupportEmoji}>🎯</Text>
                <Text style={styles.whySupportTitle}>Better Experience</Text>
                <Text style={styles.whySupportDesc}>Enhanced user interface and faster performance improvements</Text>
              </View>
            </View>
          </View>

          {/* Thank You Section */}
          <View style={styles.setupCard}>
            <Text style={styles.thankYouTitle}>Thank You! 🙏</Text>
            <Text style={styles.thankYouDesc}>
              Every contribution, no matter the size, helps keep this app running and improving. 
              Your support makes a real difference in helping people achieve their German citizenship dreams.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fc' 
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 70 : 60,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  appBar: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingHorizontal: 12,
    paddingBottom: 6,
    zIndex: 20,
  },
  appBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: 2,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f2ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0a7ea4',
    shadowColor: '#0a7ea4',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  backButtonText: {
    fontSize: 18,
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a7ea4',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  placeholderButton: {
    minHeight: 36,
    minWidth: 36,
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
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  heartContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  heartEmoji: {
    fontSize: 48,
  },
  sparkles: {
    position: 'absolute',
    top: -6,
    right: -6,
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#11181c',
    marginBottom: 6,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  
  // Setup Card (consistent with other pages)
  setupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#11181c',
    marginBottom: 12,
  },
  
  // Payment Method Section
  paymentMethodGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  paymentMethodButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e1e8ed',
    position: 'relative',
  },
  paymentMethodButtonSelected: {
    borderColor: '#ec4899',
    backgroundColor: '#fdf2f8',
  },
  popularBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  paymentMethodEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  paymentMethodName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#11181c',
    marginBottom: 2,
    textAlign: 'center',
  },
  paymentMethodDesc: {
    fontSize: 10,
    color: '#687076',
    textAlign: 'center',
  },
  
  // PayPal Section
  supportOptionsGrid: {
    gap: 8,
  },
  supportOptionButton: {
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supportOptionEmoji: {
    fontSize: 20,
    color: '#fff',
  },
  supportOptionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft: 10,
  },
  supportOptionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 6,
  },
  externalLinkIcon: {
    fontSize: 14,
    color: '#fff',
  },
  
  // Bank Section
  bankHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bankEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  bankSubtitle: {
    fontSize: 12,
    color: '#687076',
    textAlign: 'center',
  },
  amountSection: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181c',
    marginBottom: 8,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amountButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e1e8ed',
    position: 'relative',
  },
  amountButtonSelected: {
    borderColor: '#ec4899',
    backgroundColor: '#fdf2f8',
  },
  popularBadgeSmall: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10b981',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  popularBadgeTextSmall: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 'bold',
  },
  amountButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#11181c',
  },
  amountButtonDesc: {
    fontSize: 10,
    color: '#687076',
  },
  bankDetails: {
    gap: 10,
  },
  bankDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#11181c',
    marginBottom: 6,
  },
  bankDetailItem: {
    gap: 4,
  },
  bankDetailLabel: {
    fontSize: 12,
    color: '#687076',
    fontWeight: '500',
  },
  bankDetailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
  },
  bankDetailText: {
    fontSize: 12,
    color: '#11181c',
    fontWeight: '600',
    flex: 1,
  },
  copyButton: {
    fontSize: 14,
    marginLeft: 6,
  },
  
  // Crypto Section
  cryptoHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cryptoEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  cryptoAddress: {
    marginBottom: 12,
  },
  cryptoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#11181c',
    marginBottom: 6,
  },
  cryptoAddressText: {
    fontSize: 10,
    color: '#687076',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
  },
  cryptoNote: {
    fontSize: 12,
    color: '#687076',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  
  // Why Support Section
  whySupportGrid: {
    gap: 12,
  },
  whySupportItem: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  whySupportEmoji: {
    fontSize: 20,
  },
  whySupportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#11181c',
  },
  whySupportDesc: {
    fontSize: 12,
    color: '#687076',
    lineHeight: 16,
  },
  
  // Thank You Section
  thankYouTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#11181c',
    marginBottom: 8,
    textAlign: 'center',
  },
  thankYouDesc: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    lineHeight: 20,
  },
});