import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';

export default function SupportScreen() {
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t.support_me}</Text>
      <Text style={styles.desc}>{t.support_desc}</Text>

      <View style={styles.supportOption}>
        <Text style={styles.optionTitle}>{t.buy_me_coffee}</Text>
        <Text style={styles.optionDesc}>{t.coffee_desc}</Text>
        <TouchableOpacity style={styles.button} onPress={() => Linking.openURL('https://www.buymeacoffee.com/')}> 
          <Text style={styles.buttonText}>{t.buy_me_coffee}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.supportOption}>
        <Text style={styles.optionTitle}>{t.help_maintain_website}</Text>
        <Text style={styles.optionDesc}>{t.maintenance_desc}</Text>
      </View>

      <View style={styles.supportOption}>
        <Text style={styles.optionTitle}>{t.beer_party}</Text>
        <Text style={styles.optionDesc}>{t.party_desc}</Text>
      </View>

      <Text style={styles.powered}>{t.powered_by_paypal}</Text>

      <View style={styles.paymentMethods}>
        <Text style={styles.paymentTitle}>{t.payment_methods}</Text>
        <Text style={styles.paymentItem}>{t.bank_transfer}</Text>
        <Text style={styles.paymentItem}>{t.credit_card}</Text>
        <Text style={styles.paymentItem}>{t.cryptocurrency}</Text>
        <Text style={styles.paymentItem}>{t.sepa_no_fees}</Text>
        <Text style={styles.paymentItem}>{t.visa_mastercard}</Text>
        <Text style={styles.paymentItem}>{t.btc_eth}</Text>
        <Text style={styles.paymentItem}>{t.popular_method}</Text>
        <Text style={styles.paymentItem}>{t.secure_payment}</Text>
        <Text style={styles.paymentItem}>{t.no_fees}</Text>
        <Text style={styles.paymentItem}>{t.instant_germany}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f5f6fa', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#222' },
  desc: { fontSize: 16, marginBottom: 16, color: '#555' },
  supportOption: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  optionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#007AFF' },
  optionDesc: { fontSize: 15, marginBottom: 8, color: '#555' },
  button: { backgroundColor: '#FFDD00', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, alignSelf: 'flex-start' },
  buttonText: { color: '#222', fontWeight: 'bold', fontSize: 16 },
  powered: { textAlign: 'center', color: '#888', marginVertical: 16 },
  paymentMethods: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16 },
  paymentTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#222' },
  paymentItem: { fontSize: 15, color: '#555', marginBottom: 2 },
});
