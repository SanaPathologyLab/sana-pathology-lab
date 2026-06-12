import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const PatientsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', age: '', ageType: 'Years', gender: 'Male', mobileNumber: '', city: '', bloodGroup: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const data = await api.get('/patients');
      if (Array.isArray(data)) setPatients(data);
    } catch (err) { console.error(err); }
  };

  const filtered = patients.filter(p =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(search.toLowerCase()) ||
    p.mobileNumber?.includes(search)
  );

  const handleSubmit = async () => {
    try {
      const url = editingId ? `/patients/${editingId}` : '/patients';
      const method = editingId ? 'PUT' : 'POST';
      const res = await (method === 'PUT' ? api.put(url, form) : api.post(url, form));
      setShowModal(false);
      setEditingId(null);
      fetchPatients();
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setEditingId(null); setForm({ fullName: '', age: '', ageType: 'Years', gender: 'Male', mobileNumber: '', city: '', bloodGroup: '' }); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search name, ID, mobile..." value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.patientCard} onPress={() => navigation.navigate('PatientProfile', { patientId: item.id })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.fullName?.charAt(0)}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{item.fullName}</Text>
              <Text style={styles.patientMeta}>{item.patientId} · {item.age}Y/{item.gender?.charAt(0)} · {item.mobileNumber}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={styles.deleteIcon}>🗑</Text></TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No patients found</Text>}
      />

      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'New'} Patient</Text>
            <TextInput style={styles.input} placeholder="Full Name *" value={form.fullName} onChangeText={v => setForm({...form, fullName: v})} />
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Age" value={form.age} onChangeText={v => setForm({...form, age: v})} keyboardType="numeric" />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Mobile *" value={form.mobileNumber} onChangeText={v => setForm({...form, mobileNumber: v})} keyboardType="phone-pad" />
            </View>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="City" value={form.city} onChangeText={v => setForm({...form, city: v})} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Blood Group" value={form.bloodGroup} onChangeText={v => setForm({...form, bloodGroup: v})} />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  patientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#00488d', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  patientInfo: { flex: 1, marginLeft: 12 },
  patientName: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  patientMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  deleteIcon: { fontSize: 18, padding: 4 },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40, fontSize: 14 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#00488d', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 10, backgroundColor: '#f9fafb' },
  row: { flexDirection: 'row', gap: 10 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#6b7280' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#00488d', alignItems: 'center' },
  saveText: { fontWeight: '700', color: '#fff' },
});

export default PatientsScreen;
