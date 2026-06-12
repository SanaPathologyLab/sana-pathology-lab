import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const CATEGORIES = ['Test Tubes', 'Reagents', 'Chemicals', 'Kits', 'Consumables', 'Equipment', 'PPE', 'Other'];

const InventoryScreen = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [filterCat, setFilterCat] = useState('ALL');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const data = await api.get('/inventory');
      if (Array.isArray(data)) setItems(data);
    } catch (err) { console.error(err); }
  };

  let filtered = filterCat === 'ALL' ? items : items.filter(i => i.category === filterCat);
  if (showLowOnly) filtered = filtered.filter(i => i.currentStock <= i.lowStockAlert);

  const getStatus = (item) => {
    if (item.currentStock <= 0) return { label: 'OUT', color: '#ef4444' };
    if (item.currentStock <= item.lowStockAlert) return { label: 'LOW', color: '#f59e0b' };
    return { label: 'OK', color: '#10b981' };
  };

  const lowStockItems = items.filter(i => i.currentStock <= i.lowStockAlert);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <Text style={styles.count}>{items.length} items</Text>
      </View>

      {lowStockItems.length > 0 && (
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>⚠ {lowStockItems.length} Low Stock Alert{lowStockItems.length > 1 ? 's' : ''}</Text>
          <Text style={styles.alertText}>{lowStockItems.map(i => i.itemName).join(', ')}</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={
          <View style={styles.filterRow}>
            <FlatList horizontal showsHorizontalScrollIndicator={false} data={['ALL', ...CATEGORIES, '⚠ LOW']} keyExtractor={c => c} renderItem={({ item: cat }) => (
              <TouchableOpacity
                style={[styles.filterBtn, (cat === '⚠ LOW' ? showLowOnly : filterCat === cat) && styles.activeFilter]}
                onPress={() => { if (cat === '⚠ LOW') { setShowLowOnly(true); setFilterCat('ALL'); } else { setFilterCat(cat); setShowLowOnly(false); }}}
              >
                <Text style={[styles.filterText, (cat === '⚠ LOW' ? showLowOnly : filterCat === cat) && styles.activeFilterText]}>{cat}</Text>
              </TouchableOpacity>
            )} />
          </View>
        }
        renderItem={({ item }) => {
          const status = getStatus(item);
          return (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <Text style={[styles.statusBadge, { color: status.color }]}>{status.label}</Text>
              </View>
              <Text style={styles.meta}>{item.category} · Stock: {item.currentStock}/{item.lowStockAlert}</Text>
              {item.expiryDate && <Text style={styles.meta}>Expires: {new Date(item.expiryDate).toLocaleDateString('en-IN')}</Text>}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No items found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#00488d' },
  count: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  alertCard: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', margin: 12, padding: 12, borderRadius: 10 },
  alertTitle: { fontSize: 13, fontWeight: '800', color: '#c2410c' },
  alertText: { fontSize: 11, color: '#9a3412', marginTop: 4 },
  filterRow: { padding: 12 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', marginRight: 6 },
  activeFilter: { backgroundColor: '#00488d', borderColor: '#00488d' },
  filterText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  activeFilterText: { color: '#fff' },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  statusBadge: { fontSize: 12, fontWeight: '800' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40 },
});

export default InventoryScreen;
