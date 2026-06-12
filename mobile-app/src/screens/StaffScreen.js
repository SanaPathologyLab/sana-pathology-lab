import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const ROLES = ['TECHNICIAN', 'RECEPTIONIST', 'HELPER', 'ACCOUNTANT', 'MANAGER', 'CLEANER', 'OTHER'];

const StaffScreen = () => {
  const { user } = useContext(AuthContext);
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', role: 'TECHNICIAN', mobile: '', email: '', salary: '' });

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const data = await api.get('/staff');
      if (Array.isArray(data)) setStaff(data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    try {
      if (editItem) await api.put(`/staff/${editItem.id}`, form);
      else await api.post('/staff', form);
      setShowModal(false);
      fetchStaff();
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const handleToggleActive = async (s) => {
    await api.put(`/staff/${s.id}`, { isActive: !s.isActive });
    fetchStaff();
  };

  const activeStaff = staff.filter(s => s.isActive);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Staff</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setEditItem(null); setForm({ name: '', role: 'TECHNICIAN', mobile: '', email: '', salary: '' }); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.count}>{activeStaff.length} active staff</Text>

      <FlatList
        data={staff}
        keyExtractor={item => String(item.id)}
        renderItem={({ item: s }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{s.name}</Text>
              <Text style={[styles.activeBadge, s.isActive ? styles.active : styles.inactive]}>
                {s.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <Text style={styles.meta}>{s.role} · {s.staffId}</Text>
            {s.mobile && <Text style={styles.meta}>📞 {s.mobile}</Text>}
            {s.salary && <Text style={styles.meta}>₹{parseFloat(s.salary).toLocaleString()}/mo</Text>}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleActive(s)}>
                <Text style={styles.actionText}>{s.isActive ? 'Deactivate' : 'Activate'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No staff found</Text>}
      />

      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editItem ? 'Edit' : 'Add'} Staff</Text>
            <TextInput style={styles.input} placeholder="Full Name *" value={form.name} onChangeText={v => setForm({...form, name: v})} />
            <TextInput style={styles.input} placeholder="Mobile" value={form.mobile} onChangeText={v => setForm({...form, mobile: v})} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={v => setForm({...form, email: v})} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Salary" value={form.salary} onChangeText={v => setForm({...form, salary: v})} keyboardType="numeric" />
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
  count: { fontSize: 12, color: '#6b7280', fontWeight: '600', paddingHorizontal: 16, paddingVertical: 8 },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  activeBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  active: { backgroundColor: '#d1fae5', color: '#065f46' },
  inactive: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  meta: { fontSize: 13, color: '#4b5563', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { flex: 1, padding: 8, borderRadius: 8, backgroundColor: '#f59e0b', alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#00488d', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 10, backgroundColor: '#f9fafb' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#6b7280' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#00488d', alignItems: 'center' },
  saveText: { fontWeight: '700', color: '#fff' },
});

export default StaffScreen;
