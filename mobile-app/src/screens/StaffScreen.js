import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const ROLES = ['TECHNICIAN', 'RECEPTIONIST', 'HELPER', 'ACCOUNTANT', 'MANAGER', 'CLEANER', 'OTHER'];

const StaffScreen = () => {
  const { user } = useContext(AuthContext);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ACTIVE');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', role: 'TECHNICIAN', mobile: '', email: '', salary: '' });

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await api.get('/staff');
      if (Array.isArray(data)) setStaff(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.mobile) {
        Alert.alert('Error', 'Name and Mobile are required.');
        return;
      }
      if (editItem) await api.put(`/staff/${editItem.id}`, form);
      else await api.post('/staff', form);
      setShowModal(false);
      fetchStaff();
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const handleToggleActive = async (s) => {
    try {
      await api.put(`/staff/${s.id}`, { isActive: !s.isActive });
      fetchStaff();
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const activeStaff = staff.filter(s => s.isActive);
  const inactiveStaff = staff.filter(s => !s.isActive);
  const filtered = filterStatus === 'ACTIVE' ? activeStaff : inactiveStaff;

  const formatDate = (d) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Staff Management</Text>
      <Text style={styles.headerSubtitle}>{activeStaff.length} active staff members</Text>
      
      <View style={styles.headerActions}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <TouchableOpacity style={styles.actionBtnSecondary}>
            <Text style={styles.actionBtnSecondaryText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnSecondary}>
            <Text style={styles.actionBtnSecondaryText}>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => { setEditItem(null); setForm({ name: '', role: 'TECHNICIAN', mobile: '', email: '', salary: '' }); setShowModal(true); }}>
            <Text style={styles.actionBtnPrimaryText}>Add Staff</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
        {['ACTIVE', 'INACTIVE'].map(s => {
          const count = s === 'ACTIVE' ? activeStaff.length : inactiveStaff.length;
          return (
            <TouchableOpacity key={s} style={[styles.tabBtn, filterStatus === s && styles.tabBtnActive]} onPress={() => setFilterStatus(s)}>
              <Text style={[styles.tabText, filterStatus === s && styles.tabTextActive]}>{s} ({count})</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item: s }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{flex: 1}}>
          <Text style={styles.name}>{s.name}</Text>
          <Text style={styles.staffId}>{s.staffId || 'STF-N/A'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: s.isActive ? '#dcfce7' : '#f3f4f6', borderColor: s.isActive ? '#bbf7d0' : '#e5e7eb' }]}>
          <Text style={[styles.statusText, { color: s.isActive ? '#166534' : '#6b7280' }]}>{s.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
        <TouchableOpacity style={styles.editAction} onPress={() => { setEditItem(s); setForm({ name: s.name, role: s.role, mobile: s.mobile||'', email: s.email||'', salary: s.salary?.toString()||'' }); setShowModal(true); }}>
          <Text style={styles.actionIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <Text style={styles.gridLabel}>Role:</Text>
          <Text style={styles.gridValue}>{s.role}</Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.gridLabel}>Mobile:</Text>
          <Text style={styles.gridValue}>{s.mobile || 'N/A'}</Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.gridLabel}>Salary:</Text>
          <Text style={styles.gridValue}>₹{s.salary ? parseFloat(s.salary).toLocaleString() : '0'}/mo</Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.gridLabel}>Joined:</Text>
          <Text style={styles.gridValue}>{formatDate(s.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={[styles.toggleBtn, { backgroundColor: s.isActive ? '#fef2f2' : '#f0fdf4' }]} onPress={() => handleToggleActive(s)}>
          <Text style={[styles.toggleBtnText, { color: s.isActive ? '#dc2626' : '#16a34a' }]}>{s.isActive ? 'Deactivate' : 'Activate'}</Text>
        </TouchableOpacity>
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
        onRefresh={fetchStaff}
        ListEmptyComponent={<Text style={styles.empty}>No {filterStatus.toLowerCase()} staff found.</Text>}
        ListFooterComponent={<Text style={styles.footerText}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>}
      />

      {showModal && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalKeyboard}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editItem ? 'Edit Staff Details' : 'Add New Staff'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput style={styles.input} placeholder="e.g. Mohd Altamash" value={form.name} onChangeText={v => setForm({...form, name: v})} />

                <Text style={styles.inputLabel}>Role</Text>
                <View style={styles.rolesGrid}>
                  {ROLES.map(r => (
                    <TouchableOpacity key={r} style={[styles.roleBtn, form.role === r && styles.roleBtnActive]} onPress={() => setForm({...form, role: r})}>
                      <Text style={[styles.roleText, form.role === r && styles.roleTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.row}>
                  <View style={{flex: 1}}>
                    <Text style={styles.inputLabel}>Mobile *</Text>
                    <TextInput style={styles.input} placeholder="10-digit number" value={form.mobile} onChangeText={v => setForm({...form, mobile: v})} keyboardType="phone-pad" />
                  </View>
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={styles.inputLabel}>Salary (/mo)</Text>
                    <TextInput style={styles.input} placeholder="e.g. 25000" value={form.salary} onChangeText={v => setForm({...form, salary: v})} keyboardType="numeric" />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Email (Optional)</Text>
                <TextInput style={styles.input} placeholder="staff@example.com" value={form.email} onChangeText={v => setForm({...form, email: v})} autoCapitalize="none" />

              </ScrollView>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}><Text style={styles.saveText}>Save Staff</Text></TouchableOpacity>
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
  
  headerActions: { flexDirection: 'row', marginBottom: 20 },
  actionBtnSecondary: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  actionBtnSecondaryText: { color: '#e2e8f0', fontSize: 12, fontWeight: '700' },
  actionBtnPrimary: { backgroundColor: '#0ea5e9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  actionBtnPrimaryText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  tabsScroll: { marginBottom: -10, paddingBottom: 10 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  tabBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  tabTextActive: { color: '#0f172a' },

  listContent: { padding: 16, paddingBottom: 40, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  name: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  staffId: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, marginRight: 12 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  editAction: { padding: 4 },
  actionIcon: { fontSize: 18, color: '#94a3b8' },

  gridContainer: { marginBottom: 16 },
  gridRow: { flexDirection: 'row', marginBottom: 8 },
  gridLabel: { width: 60, fontSize: 13, fontWeight: '600', color: '#64748b' },
  gridValue: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1e293b' },

  cardFooter: { flexDirection: 'row' },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  toggleBtnText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },

  empty: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 14 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 20 },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  closeIcon: { fontSize: 24, color: '#94a3b8', fontWeight: 'bold' },
  
  modalBody: { paddingBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a', marginBottom: 16 },
  row: { flexDirection: 'row' },
  
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  roleBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  roleBtnActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  roleText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  roleTextActive: { color: '#1d4ed8' },

  modalFooter: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelText: { color: '#475569', fontWeight: '800', fontSize: 14 },
  saveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#0ea5e9', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 14 }
});

export default StaffScreen;
