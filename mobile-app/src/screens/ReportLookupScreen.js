import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { api } from '../services/api';

const ReportLookupScreen = ({ navigation }) => {
  const [patientId, setPatientId] = useState('');
  const [mobile, setMobile] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!patientId && !mobile) {
      Alert.alert('Error', 'Enter Patient ID or Mobile number');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      let data;
      if (patientId) {
        data = await api.get(`/public/patient-reports/${patientId}`);
      } else {
        data = await api.get(`/public/patient-reports-by-mobile/${mobile}`);
      }
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setReports([]);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Report Lookup</Text>
      <Text style={styles.subtitle}>View your test reports online</Text>

      <View style={styles.searchCard}>
        <Text style={styles.label}>Patient ID</Text>
        <TextInput style={styles.input} placeholder="Enter Patient ID" value={patientId} onChangeText={setPatientId} />

        <View style={styles.dividerRow}><View style={styles.line} /><Text style={styles.or}>OR</Text><View style={styles.line} /></View>

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput style={styles.input} placeholder="Enter Registered Mobile" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />

        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
          <Text style={styles.searchBtnText}>{loading ? 'Searching...' : 'Search Reports'}</Text>
        </TouchableOpacity>
      </View>

      {searched && !loading && reports.length === 0 && (
        <Text style={styles.noResults}>No reports found for the given details</Text>
      )}

      {reports.map((report, idx) => (
        <View key={report.id || idx} style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportId}>Report #{report.reportId || report.id}</Text>
            <Text style={[styles.reportStatus, (report.status === 'COMPLETED' || report.status === 'DELIVERED') ? styles.completed : styles.pending]}>
              {report.status}
            </Text>
          </View>
          <Text style={styles.reportDate}>{new Date(report.createdAt).toLocaleDateString('en-IN')}</Text>
          {report.testName && <Text style={styles.testName}>{report.testName}</Text>}
          <TouchableOpacity style={styles.viewBtn} onPress={() => navigation.navigate('Public Print', { reportId: report.id || report.reportId })}>
            <Text style={styles.viewBtnText}>View Report</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: '800', color: '#00488d', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  searchCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 16, backgroundColor: '#f9fafb' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  line: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  or: { marginHorizontal: 12, fontSize: 12, fontWeight: '800', color: '#9ca3af' },
  searchBtn: { backgroundColor: '#00488d', padding: 14, borderRadius: 10, alignItems: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  noResults: { textAlign: 'center', color: '#6b7280', padding: 40, fontSize: 14 },
  reportCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reportId: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  reportStatus: { fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  completed: { backgroundColor: '#d1fae5', color: '#065f46' },
  pending: { backgroundColor: '#fef3c7', color: '#92400e' },
  reportDate: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  testName: { fontSize: 13, color: '#4b5563', marginTop: 4 },
  viewBtn: { marginTop: 10, backgroundColor: '#00488d', padding: 10, borderRadius: 8, alignItems: 'center' },
  viewBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});

export default ReportLookupScreen;
