import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const TestsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTests(); }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const data = await api.get('/tests');
      if (Array.isArray(data)) setTests(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const filtered = tests.filter(t =>
    t.testName?.toLowerCase().includes(search.toLowerCase()) ||
    t.testCode?.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Test Directory (Panels)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('WidalTest')}>
          <Text style={styles.quickActionText}>CREATE WIDAL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Text style={styles.quickActionText}>CREATE MANTOUX</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Text style={styles.quickActionText}>CREATE MALARIA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickActionBtn, { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' }]}>
          <Text style={[styles.quickActionText, { color: '#fff' }]}>+ ADD TEST PANEL</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search by test name or code..." 
          placeholderTextColor="#94a3b8"
          value={search} 
          onChangeText={setSearch} 
        />
      </View>
    </View>
  );

  const renderItem = ({ item: t }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.testName}>{t.testName}</Text>
        <Text style={styles.price}>₹{t.price}</Text>
      </View>
      <Text style={styles.testCode}>{t.testCode} • {t.parameters?.length || 0} Params</Text>
      
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t.category?.name || 'Uncategorized'}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
          <Text style={[styles.badgeText, { color: '#d97706' }]}>{t.sampleType || 'SERUM'}</Text>
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
        onRefresh={fetchTests}
        ListEmptyComponent={<Text style={styles.empty}>No tests found matching your search.</Text>}
        ListFooterComponent={<Text style={styles.footerText}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  header: { backgroundColor: '#0f172a', padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, zIndex: 10 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 16 },
  
  quickActionsScroll: { marginBottom: 16 },
  quickActionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155', backgroundColor: '#1e293b' },
  quickActionText: { color: '#e2e8f0', fontSize: 11, fontWeight: '800' },
  
  searchContainer: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { color: '#fff', fontSize: 14, fontWeight: '500' },

  listContent: { padding: 16, paddingBottom: 40, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  testName: { fontSize: 15, fontWeight: '800', color: '#0f172a', flex: 1, marginRight: 12 },
  price: { fontSize: 16, fontWeight: '900', color: '#059669' },
  testCode: { fontSize: 12, color: '#64748b', fontWeight: '600', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#1d4ed8', textTransform: 'uppercase' },

  empty: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 14 },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 20 },
});

export default TestsScreen;
