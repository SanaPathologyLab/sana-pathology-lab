import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const GENDERS = ['Male', 'Female', 'Other'];
const STATUS_COLORS = { SCHEDULED: '#3b82f6', COMPLETED: '#10b981', CANCELLED: '#ef4444' };

const AppointmentsScreen = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [patientMode, setPatientMode] = useState('new');
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], time: '09:00', doctorId: '', notes: '', status: 'SCHEDULED' });
  const [newPatient, setNewPatient] = useState({ fullName: '', age: '', gender: 'Male', mobileNumber: '', city: '' });
  const [patientSearch, setPatientSearch] = useState('');
  const [existingPatientId, setExistingPatientId] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, p, d] = await Promise.all([api.get('/appointments'), api.get('/patients'), api.get('/doctors')]);
      setAppointments(Array.isArray(a) ? a : []);
      setPatients(Array.isArray(p) ? p : []);
      setDoctors(Array.isArray(d) ? d : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const filtered = filterStatus === 'ALL' ? appointments : appointments.filter(a => a.status === filterStatus);

  const filteredPatients = patients.filter(p =>
    p.fullName?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.mobileNumber?.includes(patientSearch)
  );

  const handleSubmit = async () => {
    try {
      let patientId = existingPatientId ? parseInt(existingPatientId) : null;
      if (!editItem && patientMode === 'new') {
        const created = await api.post('/patients', newPatient);
        patientId = created.id;
      }
      if (!patientId) { Alert.alert('Error', 'Select a patient'); return; }
      const payload = { patientId, ...form, doctorId: form.doctorId ? parseInt(form.doctorId) : null };
      if (editItem) await api.put(`/appointments/${editItem.id}`, payload);
      else await api.post('/appointments', payload);
      setShowModal(false);
      fetchAll();
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete', 'Delete this appointment?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.delete(`/appointments/${id}`); fetchAll(); }},
    ]);
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/appointments/${id}`, { status });
    fetchAll();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setEditItem(null); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+ Book</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(s => (
          <TouchableOpacity key={s} style={[styles.filterBtn, filterStatus === s && styles.activeFilter]} onPress={() => setFilterStatus(s)}>
            <Text style={[styles.filterText, filterStatus === s && styles.activeFilterText]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item: a }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.status, { color: STATUS_COLORS[a.status] }]}>{a.status}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => { setEditItem(a); setForm({ date: a.date.split('T')[0], time: a.time, doctorId: String(a.doctorId || ''), notes: a.notes || '', status: a.status }); setExistingPatientId(String(a.patientId)); setPatientMode('existing'); setShowModal(true); }}>
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(a.id)}><Text style={styles.deleteIcon}>🗑</Text></TouchableOpacity>
              </View>
            </View>
            <Text style={styles.patientName}>{a.patient?.fullName}</Text>
            <Text style={styles.meta}>{a.patient?.patientId} · {a.patient?.mobileNumber}</Text>
            <Text style={styles.meta}>Dr. {a.doctor?.name || 'Walk-in'} · {new Date(a.date).toLocaleDateString('en-IN')} at {a.time}</Text>
            {a.status === 'SCHEDULED' && (
              <View style={styles.statusActions}>
                <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#10b981' }]} onPress={() => handleStatusChange(a.id, 'COMPLETED')}>
                  <Text style={styles.statusBtnText}>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#ef4444' }]} onPress={() => handleStatusChange(a.id, 'CANCELLED')}>
                  <Text style={styles.statusBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No appointments</Text>}
      />

      {showModal && (
        <ScrollView style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editItem ? 'Edit' : 'Book'} Appointment</Text>
            {!editItem && (
              <View style={styles.patientToggle}>
                <TouchableOpacity style={[styles.toggleBtn, patientMode === 'new' && styles.activeToggle]} onPress={() => setPatientMode('new')}>
                  <Text style={[styles.toggleText, patientMode === 'new' && styles.activeToggleText]}>New Patient</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleBtn, patientMode === 'existing' && styles.activeToggle]} onPress={() => setPatientMode('existing')}>
                  <Text style={[styles.toggleText, patientMode === 'existing' && styles.activeToggleText]}>Existing</Text>
                </TouchableOpacity>
              </View>
            )}
            {patientMode === 'new' && !editItem ? (
              <>
                <TextInput style={styles.input} placeholder="Full Name *" value={newPatient.fullName} onChangeText={v => setNewPatient({...newPatient, fullName: v})} />
                <TextInput style={styles.input} placeholder="Mobile *" value={newPatient.mobileNumber} onChangeText={v => setNewPatient({...newPatient, mobileNumber: v})} keyboardType="phone-pad" />
              </>
            ) : (
              <>
                <TextInput style={styles.input} placeholder="Search patient..." value={patientSearch} onChangeText={setPatientSearch} />
                {filteredPatients.slice(0, 5).map(p => (
                  <TouchableOpacity key={p.id} style={[styles.patientOpt, existingPatientId === String(p.id) && styles.selectedPatient]} onPress={() => setExistingPatientId(String(p.id))}>
                    <Text style={styles.patientOptText}>{p.fullName} ({p.patientId})</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Date" value={form.date} onChangeText={v => setForm({...form, date: v})} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Time" value={form.time} onChangeText={v => setForm({...form, time: v})} />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}><Text style={styles.saveText}>{editItem ? 'Update' : 'Book'}</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  filterRow: { flexDirection: 'row', gap: 8, padding: 12 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  activeFilter: { backgroundColor: '#00488d', borderColor: '#00488d' },
  filterText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  activeFilterText: { color: '#fff' },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  status: { fontSize: 11, fontWeight: '800' },
  cardActions: { flexDirection: 'row', gap: 8 },
  editIcon: { fontSize: 16 },
  deleteIcon: { fontSize: 16 },
  patientName: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statusActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  statusBtn: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center' },
  statusBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginTop: 60 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#00488d', marginBottom: 16 },
  patientToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 8, padding: 3, marginBottom: 12 },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  activeToggle: { backgroundColor: '#fff' },
  toggleText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  activeToggleText: { color: '#00488d' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 10, backgroundColor: '#f9fafb' },
  row: { flexDirection: 'row', gap: 10 },
  patientOpt: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  selectedPatient: { backgroundColor: '#eff6ff', borderRadius: 8 },
  patientOptText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#6b7280' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#00488d', alignItems: 'center' },
  saveText: { fontWeight: '700', color: '#fff' },
});

export default AppointmentsScreen;
