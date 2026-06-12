import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, StatusBar, ActivityIndicator, FlatList } from 'react-native';
import { publicApi } from '../services/api';

const HEALTH_PACKAGES = [
  {
    name: 'Sana Fit Active (Basic Health)',
    price: 699,
    originalPrice: 999,
    tests: ['Complete Blood Count (CBC)', 'Fasting Blood Sugar', 'Lipid Profile', 'Urine Routine'],
    badge: 'Popular',
    desc: 'Ideal for routine wellness screening and baseline tracking.'
  },
  {
    name: 'Sana Women Premium (Special Care)',
    price: 1899,
    originalPrice: 2999,
    tests: ['CBC', 'Thyroid Profile', 'LFT', 'KFT', 'Vitamin D', 'Vitamin B12', 'Fasting Sugar'],
    badge: 'Best Value',
    desc: 'Comprehensive checkup tailored specifically for women.'
  },
  {
    name: 'Sana Senior Citizen (Elderly Care)',
    price: 1399,
    originalPrice: 2299,
    tests: ['CBC', 'Blood Sugar Fasting', 'HbA1c', 'LFT', 'KFT', 'Lipid Profile', 'Urine Routine'],
    badge: 'Elderly Care',
    desc: 'Recommended for annual evaluation for people aged 60+.'
  },
  {
    name: 'Sana Heart Health (Cardiac Profile)',
    price: 1199,
    originalPrice: 1799,
    tests: ['Lipid Profile', 'HbA1c', 'Complete Blood Count (CBC)', 'Blood Sugar', 'Uric Acid'],
    badge: 'Advanced',
    desc: 'Comprehensive risk assessment for cardiovascular diseases.'
  }
];

const DEFAULT_TESTS = [
  { testName: 'Complete Blood Count (CBC)', testCode: 'CBC', price: 300, sampleType: 'Blood', category: { name: 'Hematology' } },
  { testName: 'Fasting Blood Sugar (FBS)', testCode: 'FBS', price: 150, sampleType: 'Blood', category: { name: 'Biochemistry' } },
  { testName: 'Lipid Profile', testCode: 'LIPID', price: 400, sampleType: 'Blood', category: { name: 'Biochemistry' } },
  { testName: 'Thyroid Profile (T3, T4, TSH)', testCode: 'THYROID', price: 550, sampleType: 'Blood', category: { name: 'Immunology' } },
  { testName: 'Urine Routine Examination', testCode: 'URINE', price: 200, sampleType: 'Urine', category: { name: 'Urine Analysis' } },
  { testName: 'Liver Function Test (LFT)', testCode: 'LFT', price: 600, sampleType: 'Blood', category: { name: 'Biochemistry' } },
  { testName: 'Kidney Function Test (KFT)', testCode: 'KFT', price: 600, sampleType: 'Blood', category: { name: 'Biochemistry' } },
  { testName: 'WIDAL Test (Typhoid)', testCode: 'WIDAL', price: 200, sampleType: 'Blood', category: { name: 'Immunology' } }
];

const PublicWelcomeScreen = ({ navigation }) => {
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const data = await publicApi.get('/public/tests');
      if (Array.isArray(data) && data.length > 0) {
        setTests(data);
      } else {
        setTests(DEFAULT_TESTS);
      }
    } catch (err) {
      console.log('Failed to fetch tests:', err.message);
      setTests(DEFAULT_TESTS);
    }
    setLoading(false);
  };

  const filteredTests = tests.filter(t =>
    t.testName?.toLowerCase().includes(search.toLowerCase()) ||
    t.testCode?.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor="#00488d" />

      {/* Brand Section */}
      <View style={styles.brandSection}>
        <Text style={styles.logo}>🏥</Text>
        <Text style={styles.labName}>Sana Pathology Lab</Text>
        <Text style={styles.tagline}>Accurate Diagnostics, Trusted Care</Text>
      </View>

      {/* Contact Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📍 Datawali Road, Near Aara Machine</Text>
        <Text style={styles.infoText}>Hayat Nagar, Lucknow</Text>
        <Text style={styles.infoText}>📞 6396786939 / 6397240575</Text>
        <Text style={styles.infoText}>✉ sana.pathology@gmail.com</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('PublicAppointment')}>
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionLabel}>Book Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ReportLookup')}>
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionLabel}>Check Report</Text>
        </TouchableOpacity>
      </View>

      {/* Health Packages Section */}
      <Text style={styles.sectionTitle}>✨ Preventive Health Packages</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pkgScroll} contentContainerStyle={styles.pkgScrollContent}>
        {HEALTH_PACKAGES.map((pkg, index) => (
          <View key={index} style={styles.pkgCard}>
            <View style={styles.pkgHeader}>
              <Text style={styles.pkgBadge}>{pkg.badge}</Text>
              <Text style={styles.pkgName}>{pkg.name}</Text>
            </View>
            <Text style={styles.pkgDesc} numberOfLines={2}>{pkg.desc}</Text>
            <View style={styles.pkgPriceRow}>
              <Text style={styles.pkgPrice}>₹{pkg.price}</Text>
              <Text style={styles.pkgOrigPrice}>₹{pkg.originalPrice}</Text>
              <Text style={styles.pkgDiscount}>{Math.round((1 - pkg.price / pkg.originalPrice) * 100)}% OFF</Text>
            </View>
            <Text style={styles.pkgLabel}>Includes tests:</Text>
            <Text style={styles.pkgTests} numberOfLines={2}>{pkg.tests.join(' · ')}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Test & Price Explorer */}
      <Text style={styles.sectionTitle}>🔍 Browse Tests & Prices</Text>
      <View style={styles.explorerCard}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Complete Blood Count, LFT, etc."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />

        {loading ? (
          <ActivityIndicator size="small" color="#00488d" style={styles.loader} />
        ) : (
          <View style={styles.testList}>
            {filteredTests.slice(0, 5).map((test, index) => (
              <View key={test.id || index} style={styles.testItem}>
                <View style={styles.testDetails}>
                  <Text style={styles.testNameText}>{test.testName}</Text>
                  <Text style={styles.testMetaText}>
                    {test.sampleType || 'Blood'} · {test.category?.name || 'Diagnostic'}
                  </Text>
                </View>
                <Text style={styles.testPriceText}>₹{test.price}</Text>
              </View>
            ))}
            {filteredTests.length === 0 && (
              <Text style={styles.noTestsText}>No tests match your search query</Text>
            )}
            {filteredTests.length > 5 && (
              <Text style={styles.moreTestsText}>+ {filteredTests.length - 5} more tests found</Text>
            )}
          </View>
        )}
      </View>

      {/* Timings Card */}
      <View style={styles.timingsCard}>
        <Text style={styles.timingsTitle}>⏰ Working Hours</Text>
        <Text style={styles.timingText}>Mon - Sat: 7:00 AM - 9:00 PM</Text>
        <Text style={styles.timingText}>Sun: 7:00 AM - 1:00 PM</Text>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginBtnText}>Staff / Doctor Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00488d' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  brandSection: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 56, marginBottom: 12 },
  labName: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center' },
  tagline: { fontSize: 14, color: '#93c5fd', marginTop: 4 },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#bfdbfe', marginTop: 2 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 24, width: '100%' },
  actionBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: 12, fontWeight: '800', color: '#00488d', marginTop: 8, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 12, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  pkgScroll: { marginBottom: 24, marginHorizontal: -24 },
  pkgScrollContent: { paddingHorizontal: 24, gap: 12 },
  pkgCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, width: 280, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  pkgHeader: { marginBottom: 8 },
  pkgBadge: { backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: 10, fontWeight: '800', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, textTransform: 'uppercase', marginBottom: 6 },
  pkgName: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
  pkgDesc: { fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 16 },
  pkgPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 },
  pkgPrice: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  pkgOrigPrice: { fontSize: 13, color: '#94a3b8', textDecorationLine: 'line-through' },
  pkgDiscount: { fontSize: 12, fontWeight: '800', color: '#16a34a' },
  pkgLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  pkgTests: { fontSize: 11, color: '#475569', lineHeight: 15 },
  explorerCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, width: '100%', marginBottom: 24 },
  searchInput: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 14 },
  loader: { marginVertical: 20 },
  testList: { gap: 10 },
  testItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  testDetails: { flex: 1, paddingRight: 12 },
  testNameText: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  testMetaText: { fontSize: 11, color: '#64748b', marginTop: 2 },
  testPriceText: { fontSize: 15, fontWeight: '800', color: '#00488d' },
  noTestsText: { textAlign: 'center', color: '#64748b', paddingVertical: 14, fontSize: 13 },
  moreTestsText: { fontSize: 12, color: '#00488d', fontWeight: '800', textAlign: 'center', marginTop: 6 },
  timingsCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 },
  timingsTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 8 },
  timingText: { fontSize: 13, color: '#bfdbfe', marginTop: 2 },
  loginBtn: { borderWidth: 2, borderColor: '#fff', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

export default PublicWelcomeScreen;
