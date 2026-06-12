import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const TestsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchTests(); }, []);

  const fetchTests = async () => {
    try {
      const data = await api.get('/tests');
      if (Array.isArray(data)) setTests(data);
    } catch (err) { console.error(err); }
  };

  const filtered = tests.filter(t =>
    t.testName.toLowerCase().includes(search.toLowerCase()) ||
    t.testCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tests ({tests.length})</Text>
      </View>

      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search tests..." value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item: t }) => (
          <View style={styles.card}>
            <Text style={styles.testName}>{t.testName}</Text>
            <Text style={styles.testCode}>{t.testCode} · {t.parameters?.length || 0} params</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}><Text style={styles.badgeText}>{t.category?.name || 'Uncategorized'}</Text></View>
              <View style={styles.badge}><Text style={styles.badgeText}>{t.sampleType}</Text></View>
              <Text style={styles.price}>₹{t.price}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tests found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#00488d' },
  searchBar: { padding: 12 },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14 },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  testName: { fontSize: 15, fontWeight: '700', color: '#00488d' },
  testCode: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  badge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#00488d' },
  price: { marginLeft: 'auto', fontSize: 16, fontWeight: '800', color: '#059669' },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40 },
});

export default TestsScreen;
