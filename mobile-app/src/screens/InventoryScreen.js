import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const CATEGORIES = ['Test Tubes', 'Reagents', 'Chemicals', 'Kits', 'Consumables', 'Equipment', 'PPE', 'Other'];

const InventoryScreen = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [filterCat, setFilterCat] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    itemName: '', category: 'Reagents', currentStock: '', lowStockAlert: '10',
    expiryDate: '', supplierName: '', supplierPhone: '', unitPrice: '', unit: '',
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.get('/inventory');
      if (Array.isArray(data)) setItems(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const openAdd = () => {
    setForm({ itemName: '', category: 'Reagents', currentStock: '', lowStockAlert: '10', expiryDate: '', supplierName: '', supplierPhone: '', unitPrice: '', unit: '' });
    setEditItem(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({
      itemName: item.itemName, category: item.category,
      currentStock: String(item.currentStock), lowStockAlert: String(item.lowStockAlert),
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      supplierName: item.supplierName || '', supplierPhone: item.supplierPhone || '',
      unitPrice: item.unitPrice ? String(item.unitPrice) : '', unit: item.unit || '',
    });
    setEditItem(item);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.itemName || !form.currentStock) {
      Alert.alert('Error', 'Item name and current stock are required.');
      return;
    }
    try {
      const payload = {
        ...form,
        currentStock: parseFloat(form.currentStock) || 0,
        lowStockAlert: parseFloat(form.lowStockAlert) || 10,
        unitPrice: form.unitPrice ? parseFloat(form.unitPrice) : null,
      };
      if (editItem) await api.put(`/inventory/${editItem.id}`, payload);
      else await api.post('/inventory', payload);
      setShowModal(false);
      fetchItems();
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/inventory/${id}`); fetchItems(); } catch (err) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  let filtered = filterCat === 'ALL' ? items : items.filter(i => i.category === filterCat);
  if (showLowOnly) filtered = filtered.filter(i => i.currentStock <= i.lowStockAlert);

  const getStatus = (item) => {
    if (item.currentStock <= 0) return { label: 'OUT', bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' };
    if (item.currentStock <= item.lowStockAlert) return { label: 'LOW', bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' };
    return { label: 'OK', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' };
  };

  const lowStockItems = items.filter(i => i.currentStock <= i.lowStockAlert);
  const expiringItems = items.filter(i => {
    if (!i.expiryDate) return false;
    const days = (new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 30 && days >= 0;
  });

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Inventory</Text>
      <Text style={styles.headerSubtitle}>{items.length} items tracked</Text>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>Export CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersWrapper}>
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <View style={styles.alertCards}>
          {lowStockItems.length > 0 && (
            <View style={styles.alertCard}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <View style={{flex:1}}>
                <Text style={styles.alertTitle}>{lowStockItems.length} Low Stock Alert{lowStockItems.length > 1 ? 's' : ''}</Text>
                <Text style={styles.alertText} numberOfLines={1}>{lowStockItems.map(i => i.itemName).join(', ')}</Text>
              </View>
            </View>
          )}
          {expiringItems.length > 0 && (
            <View style={[styles.alertCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
              <Text style={styles.alertIcon}>📅</Text>
              <View style={{flex:1}}>
                <Text style={[styles.alertTitle, { color: '#b91c1c' }]}>{expiringItems.length} Expiring Within 30 Days</Text>
                <Text style={[styles.alertText, { color: '#b91c1c' }]} numberOfLines={1}>{expiringItems.map(i => i.itemName).join(', ')}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
        {['ALL', ...CATEGORIES].map(c => (
          <TouchableOpacity key={c} style={[styles.filterBtn, filterCat === c && !showLowOnly && styles.filterBtnActive]} onPress={() => { setFilterCat(c); setShowLowOnly(false); }}>
            <Text style={[styles.filterText, filterCat === c && !showLowOnly && styles.filterTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.filterBtn, showLowOnly && { backgroundColor: '#f97316', borderColor: '#f97316' }]} onPress={() => { setShowLowOnly(!showLowOnly); setFilterCat('ALL'); }}>
          <Text style={[styles.filterText, showLowOnly && { color: '#fff' }]}>⚠ Low Stock</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => {
    const status = getStatus(item);
    const isExpiring = item.expiryDate && (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flex:1}}>
            <Text style={styles.itemName}>{item.itemName}{item.unit ? <Text style={styles.unit}> /{item.unit}</Text> : ''}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.stockRow}>
          <View style={styles.stockCol}>
            <Text style={styles.stockLabel}>STOCK</Text>
            <Text style={styles.stockValue}>{item.currentStock}</Text>
          </View>
          <View style={styles.stockCol}>
            <Text style={styles.stockLabel}>ALERT AT</Text>
            <Text style={styles.stockValue}>{item.lowStockAlert}</Text>
          </View>
          <View style={styles.stockCol}>
            <Text style={styles.stockLabel}>EXPIRY</Text>
            <Text style={[styles.stockValue, isExpiring && { color: '#ef4444' }]}>{formatDate(item.expiryDate)}{isExpiring ? ' ⚠' : ''}</Text>
          </View>
          {item.supplierName && (
            <View style={styles.stockCol}>
              <Text style={styles.stockLabel}>SUPPLIER</Text>
              <Text style={styles.stockValue} numberOfLines={1}>{item.supplierName}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editActionBtn} onPress={() => openEdit(item)}>
            <Text style={styles.editActionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteActionBtn} onPress={() => handleDelete(item.id)}>
            <Text style={styles.deleteActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderFilters}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchItems}
        ListEmptyComponent={<Text style={styles.empty}>No items found. Add your first inventory item!</Text>}
        ListFooterComponent={<Text style={styles.footerText}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>}
      />

      {showModal && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editItem ? 'Edit Item' : 'Add Inventory Item'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.inputLabel}>Item Name *</Text>
                <TextInput style={styles.input} placeholder="e.g. CBC Kit" value={form.itemName} onChangeText={v => setForm({...form, itemName: v})} />

                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
                  {CATEGORIES.map(c => (
                    <TouchableOpacity key={c} style={[styles.catBtn, form.category === c && styles.catBtnActive]} onPress={() => setForm({...form, category: c})}>
                      <Text style={[styles.catText, form.category === c && styles.catTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.row}>
                  <View style={{flex:1}}>
                    <Text style={styles.inputLabel}>Current Stock *</Text>
                    <TextInput style={styles.input} placeholder="0" value={form.currentStock} onChangeText={v => setForm({...form, currentStock: v})} keyboardType="numeric" />
                  </View>
                  <View style={{flex:1, marginLeft: 10}}>
                    <Text style={styles.inputLabel}>Low Stock Alert</Text>
                    <TextInput style={styles.input} placeholder="10" value={form.lowStockAlert} onChangeText={v => setForm({...form, lowStockAlert: v})} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={{flex:1}}>
                    <Text style={styles.inputLabel}>Unit (Box/Vial)</Text>
                    <TextInput style={styles.input} placeholder="e.g. Box" value={form.unit} onChangeText={v => setForm({...form, unit: v})} />
                  </View>
                  <View style={{flex:1, marginLeft: 10}}>
                    <Text style={styles.inputLabel}>Unit Price (₹)</Text>
                    <TextInput style={styles.input} placeholder="0" value={form.unitPrice} onChangeText={v => setForm({...form, unitPrice: v})} keyboardType="numeric" />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Expiry Date (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} placeholder="2026-12-31" value={form.expiryDate} onChangeText={v => setForm({...form, expiryDate: v})} />

                <Text style={styles.inputLabel}>Supplier Name</Text>
                <TextInput style={styles.input} placeholder="Supplier company name" value={form.supplierName} onChangeText={v => setForm({...form, supplierName: v})} />

                <Text style={styles.inputLabel}>Supplier Phone</Text>
                <TextInput style={styles.input} placeholder="Supplier phone number" value={form.supplierPhone} onChangeText={v => setForm({...form, supplierPhone: v})} keyboardType="phone-pad" />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}><Text style={styles.saveText}>{editItem ? 'Update Item' : 'Add Item'}</Text></TouchableOpacity>
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
  headerActions: { flexDirection: 'row', gap: 12 },
  exportBtn: { flex: 1, backgroundColor: '#1e293b', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  exportBtnText: { color: '#e2e8f0', fontSize: 13, fontWeight: '800' },
  addBtn: { flex: 1, backgroundColor: '#0ea5e9', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  filtersWrapper: { backgroundColor: '#f8fafc' },
  alertCards: { padding: 16, gap: 10 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', padding: 14, borderRadius: 12 },
  alertIcon: { fontSize: 22 },
  alertTitle: { fontSize: 13, fontWeight: '800', color: '#c2410c' },
  alertText: { fontSize: 11, color: '#9a3412', marginTop: 2 },

  filterScroll: {},
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  filterText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  filterTextActive: { color: '#fff' },

  listContent: { paddingHorizontal: 16, paddingBottom: 40, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  itemName: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  unit: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  itemCategory: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  stockRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  stockCol: { flex: 1 },
  stockLabel: { fontSize: 9, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 },
  stockValue: { fontSize: 13, fontWeight: '700', color: '#1e293b' },

  cardActions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  editActionBtn: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  editActionText: { color: '#475569', fontSize: 13, fontWeight: '800' },
  deleteActionBtn: { flex: 1, backgroundColor: '#fef2f2', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  deleteActionText: { color: '#ef4444', fontSize: 13, fontWeight: '800' },

  empty: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 14 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 20 },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  closeIcon: { fontSize: 24, color: '#94a3b8', fontWeight: 'bold' },
  modalBody: { paddingBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a', marginBottom: 16 },
  row: { flexDirection: 'row' },
  catBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  catBtnActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  catText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  catTextActive: { color: '#1d4ed8' },
  modalFooter: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelText: { color: '#475569', fontWeight: '800', fontSize: 14 },
  saveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#0ea5e9', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});

export default InventoryScreen;
