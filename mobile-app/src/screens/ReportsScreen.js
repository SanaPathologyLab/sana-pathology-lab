import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const ReportsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const data = await api.get('/reports');
      if (Array.isArray(data)) setReports(data);
    } catch (err) { console.error(err); }
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

  const filtered = reports.filter(r =>
    r.reportNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.patient?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports ({reports.length})</Text>
        {user?.userType === 'STAFF' && (
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateReport')}>
            <Text style={styles.addBtnText}>+ New</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search..." value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item: r }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.reportNo}>{r.reportNumber}</Text>
              <Text style={[styles.status, r.status === 'COMPLETED' ? styles.completed : styles.pending]}>
                {r.status}
              </Text>
            </View>
            <Text style={styles.patientName}>{r.patient?.fullName} · {r.patient?.patientId}</Text>
            <Text style={styles.date}>{new Date(r.reportDate).toLocaleDateString('en-IN')} · Dr. {r.doctor?.name || 'Self'}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('PrintReport', { reportId: r.id })}>
                <Text style={styles.actionText}>View</Text>
              </TouchableOpacity>
              {user?.userType === 'STAFF' && (
                <>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: r.status === 'COMPLETED' ? '#10b981' : '#f59e0b' }]} onPress={() => handleMarkComplete(r)}>
                    <Text style={styles.actionText}>{r.status === 'COMPLETED' ? 'Undo' : 'Complete'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={() => handleDelete(r.id)}>
                    <Text style={styles.actionText}>Delete</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No reports found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#00488d' },
  addBtn: { backgroundColor: '#00488d', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  searchBar: { padding: 12 },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14 },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reportNo: { fontSize: 14, fontWeight: '800', color: '#00488d' },
  status: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  completed: { backgroundColor: '#d1fae5', color: '#065f46' },
  pending: { backgroundColor: '#fef3c7', color: '#92400e' },
  patientName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { flex: 1, padding: 8, borderRadius: 8, backgroundColor: '#00488d', alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40 },
});

export default ReportsScreen;
