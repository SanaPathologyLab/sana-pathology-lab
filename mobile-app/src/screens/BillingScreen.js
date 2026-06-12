import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const BillingScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [payModal, setPayModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Edit Invoice states
  const [editModal, setEditModal] = useState(null);
  const [editFinalAmount, setEditFinalAmount] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('UNPAID');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const data = await api.get('/invoices');
      if (Array.isArray(data)) {
        setInvoices(data);
        setSelectedIds([]);
      }
    } catch (err) { console.error(err); }
  };

  const totalCollected = invoices.filter(i => i.paymentStatus === 'PAID').reduce((a, b) => a + b.finalAmount, 0);
  const totalDues = invoices.filter(i => i.paymentStatus !== 'PAID').reduce((a, b) => a + b.finalAmount, 0);

  const filtered = invoices.filter(inv =>
    inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    inv.patient?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePay = async () => {
    if (!payModal) return;
    try {
      await api.post(`/invoices/${payModal.id}/pay`, { amount: payModal.finalAmount, paymentMethod });
      setPayModal(null);
      fetchInvoices();
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const handleStartEdit = (inv) => {
    setEditModal(inv);
    setEditFinalAmount(String(inv.finalAmount));
    setEditDiscount(String(inv.discount));
    setEditPaymentStatus(inv.paymentStatus || 'UNPAID');
    setEditPaymentMethod(inv.paymentMethod || '');
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    try {
      await api.put(`/invoices/${editModal.id}`, {
        finalAmount: parseFloat(editFinalAmount) || 0,
        discount: parseFloat(editDiscount) || 0,
        paymentStatus: editPaymentStatus,
        paymentMethod: editPaymentMethod || null
      });
      setEditModal(null);
      fetchInvoices();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update invoice');
    }
  };

  const handleDelete = async (inv) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete invoice ${inv.invoiceNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/invoices/${inv.id}`);
              fetchInvoices();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete invoice');
            }
          }
        }
      ]
    );
  };

  const handleSelectInvoice = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filtered.map(inv => inv.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      'Confirm Bulk Delete',
      `Are you sure you want to delete ${selectedIds.length} selected invoices?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/invoices/bulk-delete', { ids: selectedIds });
              setSelectedIds([]);
              fetchInvoices();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete selected invoices');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Billing</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#059669' }]}>
          <Text style={styles.summaryValue}>₹{totalCollected.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Collected</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#dc2626' }]}>
          <Text style={styles.summaryValue}>₹{totalDues.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search invoices..." value={search} onChangeText={setSearch} />
      </View>

      {user?.userType === 'STAFF' && (
        <View style={styles.bulkHeader}>
          <TouchableOpacity style={styles.bulkBtn} onPress={handleSelectAll}>
            <Text style={styles.bulkBtnText}>
              {filtered.length > 0 && filtered.every(inv => selectedIds.includes(inv.id))
                ? '☑️ Deselect All'
                : '⬜ Select All'}
            </Text>
          </TouchableOpacity>
          {selectedIds.length > 0 && (
            <TouchableOpacity style={[styles.bulkBtn, { backgroundColor: '#dc2626' }]} onPress={handleBulkDelete}>
              <Text style={[styles.bulkBtnText, { color: '#fff' }]}>
                🗑️ Delete Selected ({selectedIds.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item: inv }) => (
          <View style={styles.cardContainer}>
            {user?.userType === 'STAFF' && (
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => handleSelectInvoice(inv.id)}>
                <Text style={styles.checkboxText}>
                  {selectedIds.includes(inv.id) ? '☑️' : '⬜'}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.cardContent}>
              <View style={styles.cardRow}>
                <Text style={styles.invoiceNo}>{inv.invoiceNumber}</Text>
                <Text style={[styles.paymentStatus, { color: inv.paymentStatus === 'PAID' ? '#059669' : '#dc2626' }]}>{inv.paymentStatus}</Text>
              </View>
              <Text style={styles.patientName}>{inv.patient?.fullName}</Text>
              <Text style={styles.amount}>₹{inv.finalAmount.toLocaleString()}</Text>
              
              <View style={styles.cardActions}>
                {inv.paymentStatus !== 'PAID' && (
                  <TouchableOpacity style={styles.payBtn} onPress={() => setPayModal(inv)}>
                    <Text style={styles.payBtnText}>Collect</Text>
                  </TouchableOpacity>
                )}
                {user?.userType === 'STAFF' && (
                  <>
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleStartEdit(inv)}>
                      <Text style={styles.editBtnText}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(inv)}>
                      <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No invoices</Text>}
      />

      {payModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Process Payment</Text>
            <Text style={styles.modalAmount}>₹{payModal.finalAmount}</Text>
            <Text style={styles.modalPatient}>{payModal.patient?.fullName}</Text>
            <View style={styles.paymentOptions}>
              {['CASH', 'UPI'].map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.paymentOpt, paymentMethod === m && styles.selectedPayment]}
                  onPress={() => setPaymentMethod(m)}
                >
                  <Text style={[styles.paymentOptText, paymentMethod === m && styles.selectedPaymentText]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPayModal(null)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handlePay}><Text style={styles.confirmText}>Mark Paid</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {editModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Invoice</Text>
            <Text style={styles.modalSubTitle}>{editModal.invoiceNumber} - {editModal.patient?.fullName}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Discount (₹)</Text>
              <TextInput
                style={styles.input}
                value={editDiscount}
                onChangeText={(text) => {
                  setEditDiscount(text);
                  const disc = parseFloat(text) || 0;
                  setEditFinalAmount(String(Math.max(0, editModal.totalAmount - disc)));
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Final Amount (₹)</Text>
              <TextInput
                style={styles.input}
                value={editFinalAmount}
                onChangeText={setEditFinalAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Status</Text>
              <View style={styles.pickerContainer}>
                {['UNPAID', 'PARTIAL', 'PAID'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.pickerOpt, editPaymentStatus === status && styles.selectedPickerOpt]}
                    onPress={() => setEditPaymentStatus(status)}
                  >
                    <Text style={[styles.pickerOptText, editPaymentStatus === status && styles.selectedPickerOptText]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.pickerContainer}>
                {['CASH', 'UPI', 'CARD'].map(method => (
                  <TouchableOpacity
                    key={method}
                    style={[styles.pickerOpt, editPaymentMethod === method && styles.selectedPickerOpt]}
                    onPress={() => setEditPaymentMethod(method)}
                  >
                    <Text style={[styles.pickerOptText, editPaymentMethod === method && styles.selectedPickerOptText]}>{method}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveEdit}>
                <Text style={styles.confirmText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
  summaryRow: { flexDirection: 'row', gap: 12, padding: 12 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 12 },
  summaryValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', marginTop: 4 },
  searchBar: { padding: 12 },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14 },
  cardContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  checkboxContainer: { paddingRight: 12 },
  checkboxText: { fontSize: 20 },
  cardContent: { flex: 1 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  invoiceNo: { fontSize: 13, fontWeight: '700', color: '#2563eb', fontFamily: 'monospace' },
  paymentStatus: { fontSize: 11, fontWeight: '800' },
  patientName: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginTop: 4 },
  amount: { fontSize: 20, fontWeight: '900', color: '#1f2937', marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  payBtn: { backgroundColor: '#2563eb', flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  payBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  editBtn: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  editBtnText: { color: '#334155', fontWeight: '800', fontSize: 13 },
  deleteBtn: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5', flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  deleteBtnText: { color: '#b91c1c', fontWeight: '800', fontSize: 13 },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24, zIndex: 100 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1f2937', textAlign: 'center' },
  modalAmount: { fontSize: 36, fontWeight: '900', color: '#1f2937', textAlign: 'center', marginVertical: 12 },
  modalPatient: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  paymentOptions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  paymentOpt: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 2, borderColor: '#e5e7eb', alignItems: 'center' },
  selectedPayment: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  paymentOptText: { fontWeight: '700', color: '#6b7280' },
  selectedPaymentText: { color: '#2563eb' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#6b7280' },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#059669', alignItems: 'center' },
  confirmText: { fontWeight: '700', color: '#fff' },
  modalSubTitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 12 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#4b5563', marginBottom: 4 },
  input: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, fontSize: 14, fontWeight: '600', color: '#1f2937' },
  pickerContainer: { flexDirection: 'row', gap: 6 },
  pickerOpt: { flex: 1, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', backgroundColor: '#f9fafb' },
  selectedPickerOpt: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  pickerOptText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  selectedPickerOptText: { color: '#2563eb' },
  bulkHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8, gap: 10 },
  bulkBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#e2e8f0', alignItems: 'center' },
  bulkBtnText: { fontSize: 13, fontWeight: '700', color: '#334155' },
});

export default BillingScreen;
