import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const ReportsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.get('/reports');
      if (Array.isArray(data)) setReports(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleMarkComplete = async (r) => {
    try {
      await api.put(`/reports/${r.id}`, { status: r.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' });
      fetchReports();
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete', 'Delete this report permanently?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.delete(`/reports/${id}`); fetchReports(); }},
    ]);
  };

  const searched = reports.filter(r =>
    r.reportNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.patient?.patientId?.toLowerCase().includes(search.toLowerCase())
  );

  const filtered = filterStatus === 'ALL' ? searched : searched.filter(r => r.status === filterStatus);

  const pendingCount = reports.filter(r => r.status === 'PENDING').length;

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Reports</Text>
      <Text style={styles.headerSubtitle}>{reports.length} total · {pendingCount} pending</Text>
      
      <View style={styles.headerActions}>
        {user?.userType === 'STAFF' && (
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateReport')}>
            <Text style={styles.addBtnText}>+ NEW REPORT</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search by report no / patient name / ID..." 
          placeholderTextColor="#94a3b8"
          value={search} 
          onChangeText={setSearch} 
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
        {['ALL', 'PENDING', 'COMPLETED'].map(s => (
          <TouchableOpacity key={s} style={[styles.tabBtn, filterStatus === s && styles.tabBtnActive]} onPress={() => setFilterStatus(s)}>
            <Text style={[styles.tabText, filterStatus === s && styles.tabTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item: r }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.reportNo}>{r.reportNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: r.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7', borderColor: r.status === 'COMPLETED' ? '#bbf7d0' : '#fde68a' }]}>
          <Text style={[styles.statusText, { color: r.status === 'COMPLETED' ? '#166534' : '#92400e' }]}>
            {r.status === 'COMPLETED' ? '✓ COMPLETED' : '⏳ PENDING'}
          </Text>
        </View>
      </View>

      <View style={styles.patientInfoRow}>
        <View style={styles.patientInfoCol}>
          <Text style={styles.patientName}>{r.patient?.fullName || 'Unknown'}</Text>
          <Text style={styles.metaText}>{r.patient?.patientId || 'N/A'} · {r.patient?.age || ''}{r.patient?.ageType?.charAt(0) || 'Y'}/{r.patient?.gender?.charAt(0) || 'U'}</Text>
        </View>
      </View>

      <View style={styles.doctorInfoRow}>
        <View style={{flex: 1}}>
          <Text style={styles.label}>DOCTOR</Text>
          <Text style={styles.value}>{r.doctor?.name || 'Self'}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.label}>DATE</Text>
          <Text style={styles.value}>{formatDate(r.reportDate)}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('PrintReport', { reportId: r.id })}>
          <Text style={styles.actionText}>View Report</Text>
        </TouchableOpacity>
        
        {user?.userType === 'STAFF' && (
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('CreateReport', { editReportId: r.id })}>
            <Text style={{fontSize: 16}}>✏️</Text>
          </TouchableOpacity>
        )}
        
        {user?.userType === 'STAFF' && (
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleMarkComplete(r)}>
            <Text style={{fontSize: 16}}>{r.status === 'COMPLETED' ? '↩️' : '✅'}</Text>
          </TouchableOpacity>
        )}
        {user?.userType === 'STAFF' && (
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(r.id)}>
            <Text style={{fontSize: 16}}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchReports}
        ListEmptyComponent={<Text style={styles.empty}>No reports found.</Text>}
        ListFooterComponent={<Text style={styles.footerText}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  header: { backgroundColor: '#0f172a', padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, zIndex: 10 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4, marginBottom: 16 },
  
  headerActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  addBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  searchContainer: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 },
  searchInput: { color: '#fff', fontSize: 14, fontWeight: '500' },

  tabsScroll: { marginBottom: -10, paddingBottom: 10 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  tabBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  tabTextActive: { color: '#0f172a' },

  listContent: { padding: 16, paddingBottom: 40, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  reportNo: { fontSize: 15, fontWeight: '900', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '800' },

  patientInfoRow: { flexDirection: 'row', marginBottom: 12 },
  patientInfoCol: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  metaText: { fontSize: 13, color: '#64748b', fontWeight: '500' },

  doctorInfoRow: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase' },
  value: { fontSize: 13, fontWeight: '700', color: '#334155' },

  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, backgroundColor: '#0ea5e9', paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  iconBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  empty: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 14 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 20 },
});

export default ReportsScreen;
