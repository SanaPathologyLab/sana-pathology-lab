import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const DoctorsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', specialization: 'General', mobileNumber: '', clinicName: 'Independent Practice', clinicAddress: '', commissionRate: '0' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await api.get('/doctors');
      if (Array.isArray(data)) setDoctors(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    d.clinicName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.name || !form.mobileNumber) {
      Alert.alert('Error', 'Doctor Name and Mobile Number are required.');
      return;
    }
    try {
      const url = editingId ? `/doctors/${editingId}` : '/doctors';
      const method = editingId ? 'PUT' : 'POST';
      const payload = { ...form, commissionRate: parseFloat(form.commissionRate) || 0 };
      await (method === 'PUT' ? api.put(url, payload) : api.post(url, payload));
      setShowModal(false);
      setEditingId(null);
      fetchDoctors();
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'DR';

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Referring Doctors</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setEditingId(null); setForm({ name: '', specialization: 'General', mobileNumber: '', clinicName: 'Independent Practice', clinicAddress: '', commissionRate: '0' }); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+ ADD DOCTOR</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search by name, specialization, or clinic..." 
          placeholderTextColor="#94a3b8"
          value={search} 
          onChangeText={setSearch} 
        />
      </View>
    </View>
  );

  const renderItem = ({ item: d }) => (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(d.name)}</Text></View>
        <View style={styles.info}>
          <Text style={styles.name}>{d.name}</Text>
          <Text style={styles.specialization}>{d.specialization || 'General'}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.contactText}>📞 {d.mobileNumber}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.clinicText}>🏥 {d.clinicName || 'Independent Practice'}</Text>
          </View>
        </View>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => { setEditingId(d.id); setForm({ ...d, commissionRate: d.commissionRate?.toString() || '0' }); setShowModal(true); }}>
            <Text style={styles.actionIcon}>✎</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerCol}>
          <Text style={styles.footerLabel}>COMMISSION</Text>
          <Text style={styles.footerValue}>{d.commissionRate || 0}%</Text>
        </View>
        <View style={[styles.footerCol, { borderLeftWidth: 1, borderLeftColor: '#f1f5f9' }]}>
          <Text style={styles.footerLabel}>STATUS</Text>
          {d.isApproved ? (
            <Text style={[styles.footerValue, { color: '#10b981' }]}>Active</Text>
          ) : (
            <TouchableOpacity onPress={async () => { await api.put(`/doctors/${d.id}`, { isApproved: true }); fetchDoctors(); }}>
              <Text style={[styles.footerValue, { color: '#f59e0b', textDecorationLine: 'underline' }]}>Approve</Text>
            </TouchableOpacity>
          )}
        </View>
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
        onRefresh={fetchDoctors}
        ListEmptyComponent={<Text style={styles.empty}>No doctors found matching your search.</Text>}
        ListFooterComponent={<Text style={styles.footerText}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>}
      />

      {showModal && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalKeyboard}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingId ? 'Edit Doctor Details' : 'Register New Doctor'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.inputLabel}>Doctor Name *</Text>
                <TextInput style={styles.input} placeholder="Dr. Full Name" value={form.name} onChangeText={v => setForm({...form, name: v})} />
                
                <View style={styles.row}>
                  <View style={{flex: 1}}>
                    <Text style={styles.inputLabel}>Specialization</Text>
                    <TextInput style={styles.input} placeholder="e.g. General, Cardiologist" value={form.specialization} onChangeText={v => setForm({...form, specialization: v})} />
                  </View>
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={styles.inputLabel}>Mobile Number *</Text>
                    <TextInput style={styles.input} placeholder="10-digit number" value={form.mobileNumber} onChangeText={v => setForm({...form, mobileNumber: v})} keyboardType="phone-pad" />
                  </View>
                </View>
                
                <Text style={styles.inputLabel}>Clinic / Hospital Name</Text>
                <TextInput style={styles.input} placeholder="e.g. Independent Practice" value={form.clinicName} onChangeText={v => setForm({...form, clinicName: v})} />

                <Text style={styles.inputLabel}>Commission Rate (%)</Text>
                <TextInput style={styles.input} placeholder="e.g. 15" value={form.commissionRate} onChangeText={v => setForm({...form, commissionRate: v})} keyboardType="numeric" />
                
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}><Text style={styles.saveText}>Save Doctor</Text></TouchableOpacity>
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
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 16 },
  headerActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  addBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  searchContainer: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { color: '#fff', fontSize: 14, fontWeight: '500' },

  listContent: { padding: 16, paddingBottom: 40, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, overflow: 'hidden' },
  cardBody: { flexDirection: 'row', padding: 16 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fde68a', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#d97706' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  specialization: { fontSize: 13, fontWeight: '600', color: '#0ea5e9', marginBottom: 8 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  contactText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  clinicText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  
  rightActions: { justifyContent: 'flex-start' },
  editBtn: { padding: 8 },
  actionIcon: { fontSize: 18, color: '#94a3b8' },

  cardFooter: { flexDirection: 'row', backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  footerCol: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  footerLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase' },
  footerValue: { fontSize: 13, fontWeight: '800', color: '#1e293b' },

  empty: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 14 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 20 },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  closeIcon: { fontSize: 24, color: '#94a3b8', fontWeight: 'bold' },
  modalBody: { paddingBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a', marginBottom: 16 },
  row: { flexDirection: 'row' },
  modalFooter: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelText: { color: '#475569', fontWeight: '800', fontSize: 14 },
  saveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#0ea5e9', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 14 }
});

export default DoctorsScreen;
