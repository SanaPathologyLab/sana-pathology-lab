import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const PatientProfileScreen = ({ route, navigation }) => {
  const { patientId } = route.params;
  const { user } = useContext(AuthContext);
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, r, i] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get('/reports').catch(() => []),
        api.get('/invoices').catch(() => []),
      ]);
      setPatient(p);
      setReports((Array.isArray(r) ? r : []).filter(rep => rep.patientId === parseInt(patientId)));
      setInvoices((Array.isArray(i) ? i : []).filter(inv => inv.patientId === parseInt(patientId)));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading patient profile...</Text>
    </View>
  );
  if (!patient) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Patient not found</Text>
    </View>
  );

  const totalPaid = invoices.filter(i => i.paymentStatus === 'PAID').reduce((a, i) => a + i.finalAmount, 0);
  const totalDue = invoices.filter(i => i.paymentStatus !== 'PAID').reduce((a, i) => a + i.finalAmount, 0);

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN');
  };

  const InfoRow = ({ label, value }) => value ? (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerCard}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back to Patients</Text>
        </TouchableOpacity>
        <View style={styles.headerBody}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{patient.fullName?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{patient.fullName}</Text>
            <Text style={styles.meta}>{patient.patientId} · {patient.gender} · Age {patient.age}{patient.ageType ? ' ' + patient.ageType : ' Yrs'}</Text>
            <Text style={styles.meta}>{patient.mobileNumber}</Text>
          </View>
        </View>
        
        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{reports.length}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{invoices.length}</Text>
            <Text style={styles.statLabel}>Invoices</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.statValue}>₹{totalPaid}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={[styles.statValue, { color: '#fca5a5' }]}>₹{totalDue}</Text>
            <Text style={styles.statLabel}>Due</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[['info', 'Information'], ['reports', `Reports (${reports.length})`], ['billing', `Billing (${invoices.length})`]].map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, activeTab === key && styles.tabActive]} onPress={() => setActiveTab(key)}>
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body}>
        {/* INFO TAB */}
        {activeTab === 'info' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <InfoRow label="Blood Group" value={patient.bloodGroup} />
              <InfoRow label="City" value={patient.city} />
              <InfoRow label="Father/Husband" value={patient.fatherHusband} />
              <InfoRow label="Email" value={patient.email} />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical History</Text>
              <InfoRow label="Diabetes" value={patient.diabetes ? 'Yes' : 'No'} />
              <InfoRow label="Hypertension" value={patient.hypertension ? 'Yes' : 'No'} />
              {patient.allergies && <InfoRow label="Allergies" value={patient.allergies} />}
            </View>
          </>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lab Reports</Text>
            {reports.length === 0 ? (
              <Text style={styles.empty}>No reports found for this patient.</Text>
            ) : (
              reports.map(r => (
                <TouchableOpacity key={r.id} style={styles.listCard} onPress={() => navigation.navigate('PrintReport', { reportId: r.id })}>
                  <View style={styles.listCardRow}>
                    <Text style={styles.listCardId}>{r.reportNumber}</Text>
                    <View style={[styles.smallBadge, { backgroundColor: r.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7', borderColor: r.status === 'COMPLETED' ? '#bbf7d0' : '#fde68a' }]}>
                      <Text style={[styles.smallBadgeText, { color: r.status === 'COMPLETED' ? '#166534' : '#92400e' }]}>{r.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.listCardSub}>Dr. {r.doctor?.name || 'Self'} · {formatDate(r.reportDate)}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoices</Text>
            {invoices.length === 0 ? (
              <Text style={styles.empty}>No invoices found for this patient.</Text>
            ) : (
              invoices.map(inv => (
                <View key={inv.id} style={styles.listCard}>
                  <View style={styles.listCardRow}>
                    <Text style={styles.listCardId}>{inv.invoiceNumber}</Text>
                    <View style={[styles.smallBadge, { backgroundColor: inv.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7', borderColor: inv.paymentStatus === 'PAID' ? '#bbf7d0' : '#fde68a' }]}>
                      <Text style={[styles.smallBadgeText, { color: inv.paymentStatus === 'PAID' ? '#166534' : '#92400e' }]}>{inv.paymentStatus}</Text>
                    </View>
                  </View>
                  <View style={styles.listCardRow}>
                    <Text style={styles.listCardSub}>{formatDate(inv.createdAt)}</Text>
                    <Text style={styles.invoiceAmount}>₹{inv.finalAmount}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        
        <Text style={styles.footerText}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  loadingText: { fontSize: 16, color: '#64748b', fontWeight: '600' },

  headerCard: { backgroundColor: '#0f172a', padding: 20, paddingTop: 10 },
  backBtn: { marginBottom: 16 },
  backBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
  headerBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '900' },
  headerInfo: { flex: 1 },
  name: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  meta: { color: '#94a3b8', fontSize: 13, marginTop: 2 },

  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '700', marginTop: 2, textTransform: 'uppercase' },

  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#0ea5e9' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  tabTextActive: { color: '#0ea5e9' },

  body: { flex: 1 },
  section: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', flex: 1 },
  infoValue: { fontSize: 13, color: '#1f2937', fontWeight: '600', flex: 2, textAlign: 'right' },

  listCard: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  listCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  listCardId: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  listCardSub: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  smallBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  smallBadgeText: { fontSize: 10, fontWeight: '800' },
  invoiceAmount: { fontSize: 16, fontWeight: '900', color: '#0ea5e9' },

  empty: { textAlign: 'center', color: '#64748b', padding: 20, fontSize: 14 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 11, margin: 20 },
});

export default PatientProfileScreen;
