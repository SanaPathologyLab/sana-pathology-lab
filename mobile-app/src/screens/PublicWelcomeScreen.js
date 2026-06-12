import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';

const PublicWelcomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor="#00488d" />

      <View style={styles.brandSection}>
        <Text style={styles.logo}>🏥</Text>
        <Text style={styles.labName}>Sana Pathology Lab</Text>
        <Text style={styles.tagline}>Accurate Diagnostics, Trusted Care</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📍 Datawali Road, Near Aara Machine</Text>
        <Text style={styles.infoText}>Hayat Nagar, Lucknow</Text>
        <Text style={styles.infoText}>📞 6396786939 / 6397240575</Text>
        <Text style={styles.infoText}>✉ sana.pathology@gmail.com</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Public Appointment')}>
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionLabel}>Book Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Report Lookup')}>
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionLabel}>Check Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timingsCard}>
        <Text style={styles.timingsTitle}>⏰ Working Hours</Text>
        <Text style={styles.timingText}>Mon - Sat: 7:00 AM - 9:00 PM</Text>
        <Text style={styles.timingText}>Sun: 7:00 AM - 1:00 PM</Text>
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginBtnText}>Staff / Doctor Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00488d' },
  content: { alignItems: 'center', padding: 24, paddingTop: 60 },
  brandSection: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 56, marginBottom: 12 },
  labName: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center' },
  tagline: { fontSize: 14, color: '#93c5fd', marginTop: 4 },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#bfdbfe', marginTop: 2 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 24, width: '100%' },
  actionBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: 12, fontWeight: '800', color: '#00488d', marginTop: 8, textAlign: 'center' },
  timingsCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 },
  timingsTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 8 },
  timingText: { fontSize: 13, color: '#bfdbfe', marginTop: 2 },
  loginBtn: { borderWidth: 2, borderColor: '#fff', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

export default PublicWelcomeScreen;
