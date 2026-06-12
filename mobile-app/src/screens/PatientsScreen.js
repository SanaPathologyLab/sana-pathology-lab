import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const PatientsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', age: '', ageType: 'Years', gender: 'Male', mobileNumber: '', city: '', bloodGroup: 'Unknown' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await api.get('/patients');
      if (Array.isArray(data)) setPatients(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const filtered = patients.filter(p =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(search.toLowerCase()) ||
    p.mobileNumber?.includes(search)
  );

  const handleSubmit = async () => {
    if (!form.fullName || !form.mobileNumber) {
      Alert.alert('Error', 'Full Name and Mobile Number are required.');
      return;
    }
    try {
      const url = editingId ? `/patients/${editingId}` : '/patients';
      const method = editingId ? 'PUT' : 'POST';
      await (method === 'PUT' ? api.put(url, form) : api.post(url, form));
      setShowModal(false);
      setEditingId(null);
      fetchPatients();
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Patient Management</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>Export CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => { setEditingId(null); setForm({ fullName: '', age: '', ageType: 'Years', gender: 'Male', mobileNumber: '', city: '', bloodGroup: 'Unknown' }); setShowModal(true); }}
        >
          <Text style={styles.addBtnText}>+ ADD PATIENT</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search by name, ID or mobile..." 
          placeholderTextColor="#94a3b8"
          value={search} 
          onChangeText={setSearch} 
        />
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}><Text style={styles.badgeText}>{item.patientId}</Text></View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.editAction} 
            onPress={() => { setEditingId(item.id); setForm(item); setShowModal(true); }}
          >
            <Text style={styles.actionIcon}>✎</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('PatientProfile', { patientId: item.id })}>
        <View style={styles.cardBody}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(item.fullName)}</Text></View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.fullName}</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.demographicText}>{item.age ? `${item.age} ${item.ageType || 'Years'}` : 'Unknown'} | {item.gender?.toUpperCase() || 'UNKNOWN'}</Text>
              <Text style={styles.bgBadge}>BG: {item.bloodGroup || 'Unknown'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Text style={styles.contactText}>📞 {item.mobileNumber}</Text>
              {item.city && <Text style={styles.contactText}>📍 {item.city}</Text>}
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
        onRefresh={fetchPatients}
        ListEmptyComponent={<Text style={styles.empty}>No patients found matching your search.</Text>}
        ListFooterComponent={<Text style={styles.footerText}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>}
      />

      {showModal && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalKeyboard}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingId ? 'Edit Patient Details' : 'Register New Patient'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput style={styles.input} placeholder="Patient Full Name" value={form.fullName} onChangeText={v => setForm({...form, fullName: v})} />
                
                <View style={styles.row}>
                  <View style={{flex: 1}}>
                    <Text style={styles.inputLabel}>Age</Text>
                    <TextInput style={styles.input} placeholder="e.g. 35" value={form.age?.toString()} onChangeText={v => setForm({...form, age: v})} keyboardType="numeric" />
                  </View>
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={styles.inputLabel}>Mobile Number *</Text>
                    <TextInput style={styles.input} placeholder="10-digit number" value={form.mobileNumber} onChangeText={v => setForm({...form, mobileNumber: v})} keyboardType="phone-pad" />
                  </View>
                </View>
                
                <View style={styles.row}>
                  <View style={{flex: 1}}>
                    <Text style={styles.inputLabel}>City / Location</Text>
                    <TextInput style={styles.input} placeholder="e.g. Sambhal" value={form.city} onChangeText={v => setForm({...form, city: v})} />
                  </View>
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={styles.inputLabel}>Blood Group</Text>
                    <TextInput style={styles.input} placeholder="e.g. O+, A-" value={form.bloodGroup} onChangeText={v => setForm({...form, bloodGroup: v})} />
                  </View>
                </View>
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}><Text style={styles.saveText}>Save Patient</Text></TouchableOpacity>
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
  headerActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  exportBtn: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  exportBtnText: { color: '#e2e8f0', fontSize: 12, fontWeight: '700' },
  addBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  searchContainer: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { color: '#fff', fontSize: 14, fontWeight: '500' },

  listContent: { padding: 16, paddingBottom: 40, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  badge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  badgeText: { color: '#1d4ed8', fontSize: 11, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 12 },
  editAction: { padding: 4 },
  actionIcon: { fontSize: 16, color: '#64748b' },
  cardBody: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#64748b' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  demographicText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  bgBadge: { fontSize: 10, fontWeight: '800', color: '#ef4444', backgroundColor: '#fef2f2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#fecaca' },
  contactRow: { flexDirection: 'row', gap: 12 },
  contactText: { fontSize: 12, color: '#475569', fontWeight: '500' },

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

export default PatientsScreen;
