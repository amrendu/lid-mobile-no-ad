import React, { useState, useEffect } from 'react';
import { getItem, setItem } from '../../src/utils/storage';
import { TouchableOpacity, StyleSheet, View, Text, ScrollView, Platform, Alert, Clipboard, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';

export default function SupportScreen() {
  const { colors, theme } = useTheme();
  const translation = useTranslation();
  const t = (translation as any).t || {};
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('kofi');
  const [selectedAmount, setSelectedAmount] = useState('10');
  const [copiedField, setCopiedField] = useState('');

  const supportOptions = [
    {
      id: 'coffee',
      name: t.buy_me_coffee,
      amount: '5',
      emoji: '☕',
      color: '#f59e0b',
      description: t.coffee_desc,
      paypalLink: 'https://www.paypal.com/donate/?hosted_button_id=8U2QTGMTNYMXU',
      benefits: [t.coffee_desc, t.bug_fixes, t.quick_responses]
    },
    {
      id: 'maintenance',
      name: t.help_maintain_website,
      amount: '10',
      emoji: '🔧',
      color: '#3b82f6',
      description: t.maintenance_desc,
      paypalLink: 'https://www.paypal.com/donate/?hosted_button_id=9ZC8JAF69TEAC',
      benefits: [t.maintenance_desc, t.regular_updates, t.new_features, t.priority_support],
      popular: true
    },
    {
      id: 'party',
      name: t.beer_party,
      amount: '20',
      emoji: '🎉',
      color: '#10b981',
      description: t.party_desc,
      paypalLink: 'https://www.paypal.com/donate/?hosted_button_id=BSV4UZUJXR2QS',
      benefits: [t.party_desc, t.major_improvements, t.long_term_sustainability, t.special_thanks]
    }
  ];

  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', emoji: '💳', desc: t.international, popular: false },
    { id: 'kofi', name: t.kofi, emoji: '☕', desc: t.kofi_desc, popular: true },
    { id: 'crypto', name: t.cryptocurrency, emoji: '₿', desc: t.btc_eth, popular: false }
  ];

  const amounts = [
    { value: '5', label: '€5', desc: t.coffee_desc },
    { value: '10', label: '€10', desc: t.maintenance_desc, popular: true },
    { value: '20', label: '€20', desc: t.party_desc },
    { value: '50', label: '€50', desc: t.premium }
  ];

  // Bank details (replace with actual details)
  const bankDetails = {
    accountHolder: 'Your Full Name',
    iban: 'DE89 3704 0044 0532 0130 00',
    bic: 'COBADEFFXXX',
    bankName: 'Your Bank Name',
    reference: `LiD-App-Support-${new Date().getFullYear()}`
  };

  const handleDonate = (paypalLink: string, optionId: string, amount: string) => {
    setSelectedAmount(optionId);
    Linking.openURL(paypalLink);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    Clipboard.setString(text);
    setCopiedField(fieldName);
    Alert.alert(t.copied || 'Copied', `${fieldName} ${t.copied_to_clipboard || 'copied to clipboard'}`);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const generateReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `LiD-${selectedAmount}EUR-${timestamp}`;
  };

  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background 
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    desc: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 8,
    },
    setupCard: {
      backgroundColor: colors.card,
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
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    paymentMethodButton: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      position: 'relative',
    },
    paymentMethodButtonSelected: {
      borderColor: '#ec4899',
      backgroundColor: theme === 'dark' ? 'rgba(236, 72, 153, 0.1)' : '#fdf2f8',
    },
    paymentMethodName: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 2,
      textAlign: 'center',
    },
    paymentMethodDesc: {
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    bankSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    amountLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    amountButton: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 6,
      padding: 10,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      position: 'relative',
    },
    amountButtonSelected: {
      borderColor: '#ec4899',
      backgroundColor: theme === 'dark' ? 'rgba(236, 72, 153, 0.1)' : '#fdf2f8',
    },
    amountButtonLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
    },
    amountButtonDesc: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    bankDetailsTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
    },
    bankDetailLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    bankDetailValue: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundSecondary,
      padding: 10,
      borderRadius: 6,
    },
    bankDetailText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '600',
      flex: 1,
    },
    cryptoLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
    },
    cryptoAddressText: {
      fontSize: 10,
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      flex: 1,
    },
    cryptoNote: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: 8,
    },
    whySupportItem: {
      backgroundColor: colors.infoBackground,
      borderRadius: 8,
      padding: 12,
      gap: 6,
    },
    whySupportTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
    },
    whySupportDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    thankYouTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    thankYouDesc: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['left', 'right', 'bottom']}>
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
            <Text style={dynamicStyles.title}>{t.support_me}</Text>
            <Text style={dynamicStyles.desc}>{t.support_desc}</Text>
          </View>

          {/* Payment Method Selection */}
          <View style={dynamicStyles.setupCard}>
            <Text style={dynamicStyles.sectionTitle}>{t.payment_methods}</Text>
            
            <View style={styles.paymentMethodGrid}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                  style={[
                    dynamicStyles.paymentMethodButton,
                    selectedPaymentMethod === method.id && dynamicStyles.paymentMethodButtonSelected
                  ]}
                  activeOpacity={0.7}
                >
                  {method.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>{t.popular}</Text>
                    </View>
                  )}
                  <Text style={styles.paymentMethodEmoji}>{method.emoji}</Text>
                  <Text style={dynamicStyles.paymentMethodName}>{method.name}</Text>
                  <Text style={dynamicStyles.paymentMethodDesc}>{method.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* PayPal Options */}
          {selectedPaymentMethod === 'paypal' && (
            <View style={dynamicStyles.setupCard}>
              <Text style={dynamicStyles.sectionTitle}>{t.paypal_support_options || 'PayPal Support Options'}</Text>
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

          {/* Ko-fi Support */}
          {selectedPaymentMethod === 'kofi' && (
            <View style={dynamicStyles.setupCard}>
              <View style={styles.kofiHeader}>
                <Text style={styles.kofiEmoji}>☕</Text>
                <Text style={dynamicStyles.sectionTitle}>{t.kofi_support || 'Ko-fi Support'}</Text>
                <Text style={dynamicStyles.bankSubtitle}>Support creators with Ko-fi - Simple and secure</Text>
              </View>
              
              <TouchableOpacity
                onPress={() => Linking.openURL('https://ko-fi.com/amrendu')}
                style={[styles.kofiButton]}
                activeOpacity={0.8}
              >
                <Text style={styles.kofiButtonEmoji}>☕</Text>
                <Text style={styles.kofiButtonText}>{t.support_on_kofi || 'Support on Ko-fi'}</Text>
                <Text style={styles.externalLinkIcon}>🔗</Text>
              </TouchableOpacity>
              
                <Text style={dynamicStyles.cryptoNote}>{t.kofi_note || 'Ko-fi is a simple way to support creators. Choose any amount you would like to contribute.'}</Text>
            </View>
          )}

          {/* Bank Transfer */}
          {selectedPaymentMethod === 'bank' && (
            <View style={dynamicStyles.setupCard}>
              <View style={styles.bankHeader}>
                <Text style={styles.bankEmoji}>🏦</Text>
                <Text style={dynamicStyles.sectionTitle}>{t.bank_transfer}</Text>
                <Text style={dynamicStyles.bankSubtitle}>{t.sepa_no_fees}</Text>
              </View>

              {/* Amount Selection */}
              <View style={styles.amountSection}>
                <Text style={dynamicStyles.amountLabel}>{t.choose_support_amount || 'Choose Support Amount:'}</Text>
                <View style={styles.amountGrid}>
                  {amounts.map((amt) => (
                    <TouchableOpacity
                      key={amt.value}
                      onPress={() => setSelectedAmount(amt.value)}
                      style={[
                        dynamicStyles.amountButton,
                        selectedAmount === amt.value && dynamicStyles.amountButtonSelected
                      ]}
                      activeOpacity={0.7}
                    >
                      {amt.popular && (
                        <View style={styles.popularBadgeSmall}>
                          <Text style={styles.popularBadgeTextSmall}>{t.popular}</Text>
                        </View>
                      )}
                      <Text style={dynamicStyles.amountButtonLabel}>{amt.label}</Text>
                      <Text style={dynamicStyles.amountButtonDesc}>{amt.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Bank Details */}
              <View style={styles.bankDetails}>
                <Text style={dynamicStyles.bankDetailsTitle}>{t.bank_transfer_details || '💳 Bank Transfer Details'}</Text>
                
                <View style={styles.bankDetailItem}>
                  <Text style={dynamicStyles.bankDetailLabel}>{t.account_holder || 'Account Holder:'}</Text>
                  <View style={dynamicStyles.bankDetailValue}>
                    <Text style={dynamicStyles.bankDetailText}>{bankDetails.accountHolder}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(bankDetails.accountHolder, 'Account Holder')}>
                      <Text style={styles.copyButton}>{copiedField === 'Account Holder' ? '✅' : '📋'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.bankDetailItem}>
                  <Text style={dynamicStyles.bankDetailLabel}>{t.iban || 'IBAN:'}</Text>
                  <View style={dynamicStyles.bankDetailValue}>
                    <Text style={dynamicStyles.bankDetailText}>{bankDetails.iban}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(bankDetails.iban.replace(/\s/g, ''), 'IBAN')}>
                      <Text style={styles.copyButton}>{copiedField === 'IBAN' ? '✅' : '📋'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.bankDetailItem}>
                  <Text style={dynamicStyles.bankDetailLabel}>{t.reference || 'Reference:'}</Text>
                  <View style={dynamicStyles.bankDetailValue}>
                    <Text style={dynamicStyles.bankDetailText}>{generateReference()}</Text>
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
            <View style={dynamicStyles.setupCard}>
              <View style={styles.cryptoHeader}>
                <Text style={styles.cryptoEmoji}>₿</Text>
                <Text style={dynamicStyles.sectionTitle}>{t.cryptocurrency_payment || 'Cryptocurrency Payment'}</Text>
              </View>
              
              <View style={styles.cryptoAddress}>
                <Text style={dynamicStyles.cryptoLabel}>{t.bitcoin_label || 'Bitcoin (BTC)'}</Text>
                <View style={dynamicStyles.bankDetailValue}>
                  <Text style={dynamicStyles.cryptoAddressText}>bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</Text>
                  <TouchableOpacity onPress={() => copyToClipboard('bc1qvusvryndlgz2ufgmqn0qwh3nnevusrrnut4r8g', 'Bitcoin Address')}>
                    <Text style={styles.copyButton}>{copiedField === 'Bitcoin Address' ? '✅' : '📋'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cryptoAddress}>
                <Text style={dynamicStyles.cryptoLabel}>{t.ethereum_label || 'Ethereum (ETH)'}</Text>
                <View style={dynamicStyles.bankDetailValue}>
                  <Text style={dynamicStyles.cryptoAddressText}>0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e</Text>
                  <TouchableOpacity onPress={() => copyToClipboard('0x0FDdC4F256EF4e9E62f4fBf662907aB24F696a36', 'Ethereum Address')}>
                    <Text style={styles.copyButton}>{copiedField === 'Ethereum Address' ? '✅' : '📋'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={dynamicStyles.cryptoNote}>{t.crypto_note || 'Send any amount equivalent to your desired support level'}</Text>
            </View>
          )}

          {/* Why Support Section */}
          <View style={dynamicStyles.setupCard}>
            <Text style={dynamicStyles.sectionTitle}>{t.why_support_matters || '🎯 Why Your Support Matters'}</Text>
            
            <View style={styles.whySupportGrid}>
              <View style={dynamicStyles.whySupportItem}>
                <Text style={styles.whySupportEmoji}>🛡️</Text>
                <Text style={dynamicStyles.whySupportTitle}>{t.keep_it_free || 'Keep It Free'}</Text>
                <Text style={dynamicStyles.whySupportDesc}>{t.keep_it_free_desc || 'Your support ensures this remains a free resource for all learners'}</Text>
              </View>
              
              <View style={dynamicStyles.whySupportItem}>
                <Text style={styles.whySupportEmoji}>⏰</Text>
                <Text style={dynamicStyles.whySupportTitle}>{t.regular_updates || 'Regular Updates'}</Text>
                <Text style={dynamicStyles.whySupportDesc}>{t.regular_updates_desc || 'Continuous improvements and new features based on user feedback'}</Text>
              </View>
              
              <View style={dynamicStyles.whySupportItem}>
                <Text style={styles.whySupportEmoji}>🎯</Text>
                <Text style={dynamicStyles.whySupportTitle}>{t.better_experience || 'Better Experience'}</Text>
                <Text style={dynamicStyles.whySupportDesc}>{t.better_experience_desc || 'Enhanced user interface and faster performance improvements'}</Text>
              </View>
            </View>
          </View>

          {/* Thank You Section */}
          <View style={dynamicStyles.setupCard}>
            <Text style={dynamicStyles.thankYouTitle}>{t.thank_you_title || 'Thank You! 🙏'}</Text>
            <Text style={dynamicStyles.thankYouDesc}>{t.thank_you_desc || 'Every contribution, no matter the size, helps keep this app running and improving. Your support makes a real difference in helping people achieve their German citizenship dreams.'}</Text>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  questionScrollView: {
    flex: 1,
  },
  questionScrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
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
  paymentMethodGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
  bankHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bankEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  amountSection: {
    marginBottom: 16,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
  bankDetails: {
    gap: 10,
  },
  bankDetailItem: {
    gap: 4,
  },
  copyButton: {
    fontSize: 14,
    marginLeft: 6,
  },
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
  whySupportGrid: {
    gap: 12,
  },
  whySupportEmoji: {
    fontSize: 20,
  },
  kofiHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  kofiEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  kofiButton: {
    backgroundColor: '#ff5f5f',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  kofiButtonEmoji: {
    fontSize: 20,
    color: '#fff',
  },
  kofiButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
});