import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const DoctorAnalyticsScreen = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchAnalytics(); }, [month, year]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/doctors/analytics/referrals?month=${month}&year=${year}`);
      data.sort((a, b) => b.totalSamples - a.totalSamples);
      setAnalytics(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Doctor Referrals Analytics</Text>
      <Text style={styles.headerSubtitle}>Track monthly samples and export to Excel</Text>

      <View style={styles.filterRow}>
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.navBtn} onPress={() => setMonth(month === 1 ? 12 : month - 1)}>
            <Text style={styles.navIcon}>◀</Text>
          </TouchableOpacity>
          <View style={styles.dateLabelBox}>
            <Text style={styles.monthText}>{new Date(year, month - 1).toLocaleString('default', { month: 'long' })}</Text>
            <Text style={styles.divider}>|</Text>
            <Text style={styles.yearText}>{year}</Text>
          </View>
          <TouchableOpacity style={styles.navBtn} onPress={() => setMonth(month === 12 ? 1 : month + 1)}>
            <Text style={styles.navIcon}>▶</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>Export Excel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item: doc, index }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.docInfoCol}>
          <Text style={styles.docName}>Dr. {doc.name}</Text>
          <Text style={styles.docMeta}>{doc.clinicName || 'N/A'} • {doc.doctorId || 'ID N/A'}</Text>
        </View>
        <View style={styles.samplesCol}>
          <Text style={styles.samplesNumber}>{doc.totalSamples}</Text>
          <Text style={styles.samplesLabel}>Samples</Text>
        </View>
        <View style={styles.statusCol}>
          <View style={[styles.statusBadge, { backgroundColor: doc.isApproved !== false ? '#dcfce7' : '#fef3c7', borderColor: doc.isApproved !== false ? '#bbf7d0' : '#fde68a' }]}>
            <Text style={[styles.statusText, { color: doc.isApproved !== false ? '#166534' : '#92400e' }]}>{doc.isApproved !== false ? 'Active' : 'Pending'}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <FlatList
        data={analytics}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchAnalytics}
        ListEmptyComponent={<Text style={styles.empty}>No referrals found for this month.</Text>}
        ListFooterComponent={<Text style={styles.footerText}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  header: { backgroundColor: '#0f172a', padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, zIndex: 10 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4, marginBottom: 20 },
  
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  navBtn: { padding: 12 },
  navIcon: { color: '#94a3b8', fontSize: 16, fontWeight: '800' },
  dateLabelBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  monthText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  divider: { color: '#475569', fontSize: 14 },
  yearText: { fontSize: 14, fontWeight: '500', color: '#94a3b8' },

  exportBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  exportBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  listContent: { padding: 16, paddingBottom: 40, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  
  docInfoCol: { flex: 2 },
  docName: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  docMeta: { fontSize: 12, color: '#64748b', fontWeight: '500' },

  samplesCol: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f1f5f9', paddingHorizontal: 10 },
  samplesNumber: { fontSize: 20, fontWeight: '900', color: '#0ea5e9' },
  samplesLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 },

  statusCol: { flex: 1, alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  empty: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 14 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 20 },
});

export default DoctorAnalyticsScreen;
