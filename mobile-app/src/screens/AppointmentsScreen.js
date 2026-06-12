import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const STATUS_COLORS = { SCHEDULED: '#0ea5e9', COMPLETED: '#10b981', CANCELLED: '#94a3b8' };

const AppointmentsScreen = ({ navigation }) => {
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
      const [a, p, d] = await Promise.all([api.get('/appointments').catch(()=>[]), api.get('/patients').catch(()=>[]), api.get('/doctors').catch(()=>[])]);
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
        if (!newPatient.fullName || !newPatient.mobileNumber) {
          Alert.alert('Error', 'Full Name and Mobile are required for a new patient.');
          return;
        }
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

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchAll();
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Appointments</Text>
      <Text style={styles.headerSubtitle}>{appointments.length} total appointments</Text>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>Export</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => { setEditItem(null); setPatientMode('new'); setForm({ date: new Date().toISOString().split('T')[0], time: '09:00', doctorId: '', notes: '', status: 'SCHEDULED' }); setShowModal(true); }}
        >
          <Text style={styles.addBtnText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(s => (
          <TouchableOpacity key={s} style={[styles.tabBtn, filterStatus === s && styles.tabBtnActive]} onPress={() => setFilterStatus(s)}>
            <Text style={[styles.tabText, filterStatus === s && styles.tabTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item: a }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[a.status] + '20', borderColor: STATUS_COLORS[a.status] + '40' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[a.status] }]}>{a.status}</Text>
        </View>
        <TouchableOpacity style={styles.editAction} onPress={() => { setEditItem(a); setForm({ date: a.date?.split('T')[0], time: a.time, doctorId: String(a.doctorId || ''), notes: a.notes || '', status: a.status }); setExistingPatientId(String(a.patientId)); setPatientMode('existing'); setShowModal(true); }}>
          <Text style={styles.actionIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.patientName}>{a.patient?.fullName || 'Unknown'}</Text>
        <Text style={styles.patientId}>({a.patient?.patientId || 'N/A'})</Text>
        <Text style={styles.dateTime}>{formatDate(a.date)}  ·  {a.time}</Text>
        
        {a.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>"{a.notes}"</Text>
          </View>
        ) : null}
      </View>

      {a.status === 'SCHEDULED' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10b981' }]} onPress={() => handleStatusChange(a.id, 'COMPLETED')}>
            <Text style={styles.actionBtnText}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f1f5f9' }]} onPress={() => handleStatusChange(a.id, 'CANCELLED')}>
            <Text style={[styles.actionBtnText, { color: '#64748b' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
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
        onRefresh={fetchAll}
        ListEmptyComponent={<Text style={styles.empty}>No appointments found.</Text>}
        ListFooterComponent={<Text style={styles.footerText}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>}
      />

      {showModal && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalKeyboard}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editItem ? 'Edit Appointment' : 'Book Appointment'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
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
                    <TextInput style={styles.input} placeholder="Search existing patient..." value={patientSearch} onChangeText={setPatientSearch} />
                    {filteredPatients.slice(0, 5).map(p => (
                      <TouchableOpacity key={p.id} style={[styles.patientOpt, existingPatientId === String(p.id) && styles.selectedPatient]} onPress={() => setExistingPatientId(String(p.id))}>
                        <Text style={styles.patientOptText}>{p.fullName} ({p.patientId})</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                <View style={styles.row}>
                  <View style={{flex: 1}}>
                    <Text style={styles.inputLabel}>Date</Text>
                    <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={form.date} onChangeText={v => setForm({...form, date: v})} />
                  </View>
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={styles.inputLabel}>Time</Text>
                    <TextInput style={styles.input} placeholder="HH:MM" value={form.time} onChangeText={v => setForm({...form, time: v})} />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Appointment notes..." value={form.notes} onChangeText={v => setForm({...form, notes: v})} multiline />

              </ScrollView>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}><Text style={styles.saveText}>{editItem ? 'Update' : 'Book'}</Text></TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  header: { backgroundColor: '#0f172a', padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, zIndex: 10 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4, marginBottom: 16 },
  
  headerActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  exportBtn: { flex: 1, backgroundColor: '#1e293b', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  exportBtnText: { color: '#e2e8f0', fontSize: 13, fontWeight: '800' },
  addBtn: { flex: 2, backgroundColor: '#0ea5e9', paddingVertical: 12, borderRadius: 10, shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  tabsScroll: { marginBottom: -10, paddingBottom: 10 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  tabBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  tabTextActive: { color: '#0f172a' },

  listContent: { padding: 16, paddingBottom: 40, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  editAction: { padding: 4 },
  actionIcon: { fontSize: 16, color: '#94a3b8' },

  cardBody: { marginBottom: 12 },
  patientName: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  patientId: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  dateTime: { fontSize: 13, fontWeight: '600', color: '#0ea5e9', marginTop: 4 },
  
  notesBox: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 8, marginTop: 12, borderLeftWidth: 3, borderLeftColor: '#cbd5e1' },
  notesText: { fontSize: 13, color: '#475569', fontStyle: 'italic' },

  actionButtons: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  empty: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 14 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 20 },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  closeIcon: { fontSize: 24, color: '#94a3b8', fontWeight: 'bold' },
  modalBody: { paddingBottom: 20 },
  
  patientToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 16 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  activeToggle: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  toggleText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  activeToggleText: { color: '#0f172a' },

  patientOpt: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  selectedPatient: { backgroundColor: '#eff6ff', borderRadius: 8 },
  patientOptText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },

  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a', marginBottom: 16 },
  row: { flexDirection: 'row' },
  
  modalFooter: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelText: { color: '#475569', fontWeight: '800', fontSize: 14 },
  saveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#0ea5e9', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 14 }
});

export default AppointmentsScreen;
