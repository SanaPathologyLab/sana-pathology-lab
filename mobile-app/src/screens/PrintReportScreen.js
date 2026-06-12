import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import Loader from '../components/Loader';

const PrintReportScreen = ({ route }) => {
  const { reportId } = route.params;
  const { user } = useContext(AuthContext);
  const [report, setReport] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/reports/${reportId}`);
        setReport(data);
      } catch (err) { console.error(err); }
    })();
  }, [reportId]);

  if (!report) return <Loader />;

  const patient = report.patient || {};
  const results = report.results || [];

  const groupedTests = {};
  results.forEach(r => {
    const testName = r.test?.testName || 'Test Results';
    if (!groupedTests[testName]) groupedTests[testName] = [];
    groupedTests[testName].push(r);
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.labName}>SANA PATHOLOGY LAB</Text>
        <Text style={styles.labInfo}>Datawali Road, Near Aara Machine, Hayat Nagar</Text>
        <Text style={styles.labInfo}>M.: 6396786939</Text>
      </View>

      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>Patient: {patient.fullName}</Text>
        <Text style={styles.meta}>ID: {patient.patientId} · Age/Sex: {patient.age}Y/{patient.gender}</Text>
        <Text style={styles.meta}>Ref By: Dr. {report.doctor?.name || 'Self'}</Text>
        <Text style={styles.meta}>Date: {new Date(report.reportDate).toLocaleDateString('en-GB')}</Text>
        <Text style={styles.meta}>Report No: {report.reportNumber}</Text>
      </View>

      {Object.entries(groupedTests).map(([testName, rows]) => (
        <View key={testName} style={styles.testSection}>
          <Text style={styles.testName}>{testName}</Text>
          {rows.map((res, idx) => (
            <View key={idx} style={styles.resultRow}>
              <Text style={styles.paramName}>{res.parameterName}</Text>
              <Text style={[styles.resultValue, res.flag === 'HIGH' && { color: '#ef4444' }, res.flag === 'LOW' && { color: '#3b82f6' }]}>
                {res.resultValue}
              </Text>
              <Text style={styles.refValue}>{res.referenceRange} {res.unit}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>This Report is not Valid for medico legal Purpose.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 40, borderBottomWidth: 2, borderBottomColor: '#000', alignItems: 'center' },
  labName: { fontSize: 24, fontWeight: '900', color: '#000' },
  labInfo: { fontSize: 12, color: '#374151', marginTop: 2 },
  patientInfo: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  patientName: { fontSize: 16, fontWeight: '800', color: '#000' },
  meta: { fontSize: 13, color: '#374151', marginTop: 2 },
  testSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  testName: { fontSize: 15, fontWeight: '800', color: '#00488d', marginBottom: 8, textTransform: 'uppercase' },
  resultRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  paramName: { flex: 2, fontSize: 13, fontWeight: '600', color: '#374151' },
  resultValue: { flex: 1, fontSize: 13, fontWeight: '800', color: '#000', textAlign: 'center' },
  refValue: { flex: 1.5, fontSize: 11, color: '#6b7280', textAlign: 'right' },
  footer: { padding: 16, alignItems: 'center', marginTop: 20 },
  footerText: { fontSize: 11, color: '#6b7280', textAlign: 'center', fontStyle: 'italic' },
});

export default PrintReportScreen;
