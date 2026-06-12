import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const DoctorsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const data = await api.get('/doctors');
      if (Array.isArray(data)) setDoctors(data);
    } catch (err) { console.error(err); }
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Doctors</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('DoctorAnalytics')}>
          <Text style={styles.addBtnText}>Analytics</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search doctors..." value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item: d }) => (
          <View style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>Dr</Text></View>
              <View style={styles.info}>
                <Text style={styles.name}>Dr. {d.name}</Text>
                <Text style={styles.specialization}>{d.specialization || 'General'}</Text>
              </View>
            </View>
            <View style={styles.details}>
              <Text style={styles.detail}>📞 {d.mobileNumber}</Text>
              <Text style={styles.detail}>🏥 {d.clinicName || 'Independent'}</Text>
              <Text style={styles.detail}>💵 Commission: {d.commissionRate || 0}%</Text>
            </View>
            {!d.isApproved && (
              <TouchableOpacity style={styles.approveBtn} onPress={async () => { await api.put(`/doctors/${d.id}`, { isApproved: true }); fetchDoctors(); }}>
                <Text style={styles.approveBtnText}>APPROVE</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No doctors found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#00488d' },
  addBtn: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  searchBar: { padding: 12 },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14 },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#00488d', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#ffb800', fontSize: 14, fontWeight: '800' },
  info: { marginLeft: 12, flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  specialization: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  details: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  detail: { fontSize: 13, color: '#4b5563', marginBottom: 4 },
  approveBtn: { backgroundColor: '#f59e0b', marginTop: 12, padding: 10, borderRadius: 8, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40 },
});

export default DoctorsScreen;
