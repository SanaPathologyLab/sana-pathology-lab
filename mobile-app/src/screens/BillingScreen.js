import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const BillingScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals state
  const [payModal, setPayModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await api.get('/invoices');
      if (Array.isArray(data)) setInvoices(data);
    } catch (err) { console.error(err); }
    setLoading(false);
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
      Alert.alert('Success', 'Payment collected successfully!');
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Billing & Payments</Text>
      <Text style={styles.headerSubtitle}>Manage pending payments and generate receipts</Text>
      
      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
          <Text style={[styles.summaryLabel, { color: '#166534' }]}>Total Collected</Text>
          <Text style={[styles.summaryValue, { color: '#15803d' }]}>₹{totalCollected}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
          <Text style={[styles.summaryLabel, { color: '#991b1b' }]}>Pending Dues</Text>
          <Text style={[styles.summaryValue, { color: '#b91c1c' }]}>₹{totalDues}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search invoices by ID or Patient Name..." 
          placeholderTextColor="#94a3b8"
          value={search} 
          onChangeText={setSearch} 
        />
      </View>
    </View>
  );

  const renderItem = ({ item: inv }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.invoiceNo}>{inv.invoiceNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: inv.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7', borderColor: inv.paymentStatus === 'PAID' ? '#bbf7d0' : '#fde68a' }]}>
          <Text style={[styles.statusText, { color: inv.paymentStatus === 'PAID' ? '#166534' : '#92400e' }]}>
            {inv.paymentStatus === 'PAID' ? 'PAID' : 'PENDING'}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.patientCol}>
          <Text style={styles.patientName}>{inv.patient?.fullName || 'Unknown'}</Text>
          <Text style={styles.patientMeta}>{inv.patient?.mobileNumber || 'N/A'}</Text>
        </View>
        <View style={styles.amountCol}>
          <Text style={styles.amountText}>₹{inv.finalAmount}</Text>
          {inv.discount > 0 && <Text style={styles.discountText}>-₹{inv.discount} discount</Text>}
        </View>
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateText}>📅 {formatDate(inv.createdAt)}</Text>
      </View>

      <View style={styles.actionsRow}>
        {inv.paymentStatus !== 'PAID' && (
          <TouchableOpacity style={styles.collectBtn} onPress={() => setPayModal(inv)}>
            <Text style={styles.collectBtnText}>Collect Payment</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.receiptBtn} onPress={() => navigation.navigate('PrintReport', { invoiceId: inv.id })}>
          <Text style={styles.receiptBtnText}>Receipt</Text>
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
        onRefresh={fetchInvoices}
        ListEmptyComponent={<Text style={styles.empty}>No invoices found matching your search.</Text>}
        ListFooterComponent={<Text style={styles.footerText}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>}
      />

      {payModal && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalKeyboard}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Collect Payment</Text>
                <TouchableOpacity onPress={() => setPayModal(null)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.payDetailsText}>Invoice: <Text style={{fontWeight:'800'}}>{payModal.invoiceNumber}</Text></Text>
                <Text style={styles.payDetailsText}>Patient: <Text style={{fontWeight:'800'}}>{payModal.patient?.fullName}</Text></Text>
                
                <View style={styles.amountBigBox}>
                  <Text style={styles.amountBigLabel}>AMOUNT TO PAY</Text>
                  <Text style={styles.amountBigValue}>₹{payModal.finalAmount}</Text>
                </View>

                <Text style={styles.inputLabel}>Payment Method</Text>
                <View style={styles.methodRow}>
                  {['CASH', 'UPI', 'CARD'].map(m => (
                    <TouchableOpacity key={m} style={[styles.methodBtn, paymentMethod === m && styles.methodBtnActive]} onPress={() => setPaymentMethod(m)}>
                      <Text style={[styles.methodText, paymentMethod === m && styles.methodTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setPayModal(null)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handlePay}><Text style={styles.saveText}>Confirm Payment</Text></TouchableOpacity>
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
  
  summaryCards: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1 },
  summaryLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: '900' },

  searchContainer: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 },
  searchInput: { color: '#fff', fontSize: 14, fontWeight: '500' },

  listContent: { padding: 16, paddingBottom: 40, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  invoiceNo: { fontSize: 15, fontWeight: '900', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '800' },

  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  patientCol: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  patientMeta: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  amountCol: { alignItems: 'flex-end' },
  amountText: { fontSize: 18, fontWeight: '900', color: '#0ea5e9' },
  discountText: { fontSize: 11, color: '#ef4444', fontWeight: '600', marginTop: 2 },

  dateRow: { marginBottom: 16 },
  dateText: { fontSize: 12, color: '#64748b', fontWeight: '600' },

  actionsRow: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  collectBtn: { flex: 2, backgroundColor: '#0ea5e9', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  collectBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  receiptBtn: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  receiptBtnText: { color: '#475569', fontSize: 13, fontWeight: '800' },

  empty: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 14 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 20 },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  closeIcon: { fontSize: 24, color: '#94a3b8', fontWeight: 'bold' },
  
  modalBody: { paddingBottom: 20 },
  payDetailsText: { fontSize: 14, color: '#475569', marginBottom: 6 },
  amountBigBox: { backgroundColor: '#f0fdf4', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0', alignItems: 'center', marginVertical: 20 },
  amountBigLabel: { fontSize: 12, fontWeight: '800', color: '#166534', marginBottom: 4 },
  amountBigValue: { fontSize: 32, fontWeight: '900', color: '#15803d' },

  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8, textTransform: 'uppercase' },
  methodRow: { flexDirection: 'row', gap: 8 },
  methodBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  methodBtnActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  methodText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  methodTextActive: { color: '#1d4ed8' },

  modalFooter: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelText: { color: '#475569', fontWeight: '800', fontSize: 14 },
  saveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 14 }
});

export default BillingScreen;
