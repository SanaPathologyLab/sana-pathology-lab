import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { api } from '../services/api';

const PublicPrintScreen = ({ route }) => {
  const reportId = route?.params?.reportId;
  const [report, setReport] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, s] = await Promise.all([
          api.get(`/reports/${reportId}`),
          api.get('/settings'),
        ]);
        if (r && !r.error) setReport(r);
        if (s && !s.error) setSettings(s);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    if (reportId) fetchData();
    else setLoading(false);
  }, [reportId]);

  if (loading) return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;
  if (!report) return <View style={styles.container}><Text style={styles.loading}>Report not found</Text></View>;

  const lab = settings;
  const patient = report.patient || {};
  const results = report.results || [];

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.labName}>{lab.labName || 'Sana Pathology Lab'}</Text>
        {lab.reportHeader && <Text style={styles.headerText}>{lab.reportHeader}</Text>}
      </View>

      <View style={styles.addressSection}>
        <Text style={styles.address}>{lab.labAddress || 'Datawali Road, Near Aara Machine, Hayat Nagar'}</Text>
        <Text style={styles.address}>{lab.labCity || 'Lucknow'}</Text>
        <Text style={styles.contact}>📞 {lab.labPhone || '6396786939'}{lab.labPhone2 ? ` / ${lab.labPhone2}` : ''}</Text>
        {lab.labEmail && <Text style={styles.contact}>✉ {lab.labEmail}</Text>}
        {lab.labGST && <Text style={styles.contact}>GST: {lab.labGST}</Text>}
      </View>

      <View style={styles.divider} />

      {/* Report Info */}
      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <Text style={styles.infoLabel}>Report ID</Text>
          <Text style={styles.infoValue}>{report.reportId || report.id}</Text>
        </View>
        <View style={styles.infoRight}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{formatDate(report.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Patient Info */}
      <Text style={styles.sectionTitle}>Patient Information</Text>
      <View style={styles.patientGrid}>
        <View style={styles.field}><Text style={styles.fieldLabel}>Name</Text><Text style={styles.fieldValue}>{patient.name || patient.patientName || 'N/A'}</Text></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Patient ID</Text><Text style={styles.fieldValue}>{patient.patientId || 'N/A'}</Text></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Age/Gender</Text><Text style={styles.fieldValue}>{patient.age ? `${patient.age} Y` : ''}{patient.gender ? ` / ${patient.gender}` : ''}</Text></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Mobile</Text><Text style={styles.fieldValue}>{patient.mobile || patient.phone || 'N/A'}</Text></View>
        {patient.address && <View style={[styles.field, { width: '100%' }]}><Text style={styles.fieldLabel}>Address</Text><Text style={styles.fieldValue}>{patient.address}</Text></View>}
      </View>

      <View style={styles.divider} />

      {/* Test Details */}
      <Text style={styles.sectionTitle}>Test Report</Text>
      <Text style={styles.testName}>{report.testName || report.test?.name || 'Test'}</Text>
      {report.referredBy && <Text style={styles.referred}>Referred by: {report.referredBy}</Text>}

      {results.length > 0 && (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.th, { flex: 2 }]}>Parameter</Text>
            <Text style={[styles.tableCell, styles.th, { flex: 1 }]}>Result</Text>
            <Text style={[styles.tableCell, styles.th, { flex: 1 }]}>Ref. Range</Text>
            <Text style={[styles.tableCell, styles.th, { flex: 0.5 }]}>Unit</Text>
          </View>
          {results.map((r, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.even]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{r.parameterName || r.parameter}</Text>
              <Text style={[styles.tableCell, { flex: 1, fontWeight: '800' }]}>{r.value}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{r.referenceRange || r.normalRange || '-'}</Text>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{r.unit || '-'}</Text>
            </View>
          ))}
        </View>
      )}

      {report.remarks && (
        <View style={styles.remarks}>
          <Text style={styles.fieldLabel}>Remarks</Text>
          <Text style={styles.remarksText}>{report.remarks}</Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Signatories */}
      <View style={styles.signatures}>
        <View style={styles.signCol}>
          <Text style={styles.signLabel}>Pathologist</Text>
          <Text style={styles.signValue}>{lab.pathologistName || 'Dr. Pathologist'}</Text>
          <Text style={styles.signSub}>{lab.pathologistQual || 'MD Pathology'}</Text>
        </View>
        <View style={styles.signCol}>
          <Text style={styles.signLabel}>Technician</Text>
          <Text style={styles.signValue}>{lab.technicianName || 'Lab Technician'}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{lab.reportFooter || 'This report is electronically generated.'}</Text>
        <Text style={styles.generatedAt}>Generated on: {new Date().toLocaleString('en-IN')}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  page: { padding: 24, paddingTop: 40 },
  loading: { textAlign: 'center', padding: 60, fontSize: 16, color: '#6b7280' },
  header: { alignItems: 'center', marginBottom: 16 },
  labName: { fontSize: 22, fontWeight: '900', color: '#00488d', textAlign: 'center' },
  headerText: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  addressSection: { alignItems: 'center' },
  address: { fontSize: 12, color: '#374151' },
  contact: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLeft: {},
  infoRight: { alignItems: 'flex-end' },
  infoLabel: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase' },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#00488d', marginBottom: 8, textTransform: 'uppercase' },
  patientGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  field: { width: '48%', marginBottom: 8, marginRight: '2%' },
  fieldLabel: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase' },
  fieldValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  testName: { fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 4 },
  referred: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
  table: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomWidth: 1, borderBottomColor: '#d1d5db' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  even: { backgroundColor: '#fafafa' },
  tableCell: { padding: 10, fontSize: 12, color: '#1f2937' },
  th: { fontWeight: '800', fontSize: 11, textTransform: 'uppercase', color: '#6b7280' },
  remarks: { marginTop: 16, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8 },
  remarksText: { fontSize: 13, color: '#374151', marginTop: 4 },
  signatures: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  signCol: { alignItems: 'center', flex: 1 },
  signLabel: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase' },
  signValue: { fontSize: 14, fontWeight: '700', color: '#1f2937', marginTop: 4 },
  signSub: { fontSize: 11, color: '#6b7280' },
  footer: { alignItems: 'center', marginTop: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 16 },
  footerText: { fontSize: 11, color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' },
  generatedAt: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
});

export default PublicPrintScreen;
