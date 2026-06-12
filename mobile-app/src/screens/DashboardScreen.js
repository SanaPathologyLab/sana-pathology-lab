import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import Loader from '../components/Loader';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.get('/dashboard/stats');
      setStats(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const menuItems = [
    { name: 'Patients', screen: 'Patients' },
    { name: 'Doctors', screen: 'Doctors' },
    { name: 'Dr. Analytics', screen: 'DoctorAnalytics' },
    { name: 'Tests', screen: 'Tests' },
    { name: 'Reports', screen: 'Reports' },
    { name: 'Billing', screen: 'Billing' },
    { name: 'Appointments', screen: 'Appointments' },
    { name: 'Inventory', screen: 'Inventory' },
    { name: 'Staff', screen: 'Staff' },
    { name: 'Settings', screen: 'Settings' },
    { name: 'Widal Test', screen: 'WidalTest' },
  ];

  if (loading) return <Loader />;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome, {user?.name}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#00488d' }]}>
          <Text style={styles.statValue}>{stats.todayPatients || 0}</Text>
          <Text style={styles.statLabel}>Today's Patients</Text>
          <Text style={styles.statSub}>{stats.totalPatients || 0} total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
          <Text style={styles.statValue}>{stats.pendingReports || 0}</Text>
          <Text style={styles.statLabel}>Pending Reports</Text>
          <Text style={styles.statSub}>{stats.completedReports || 0} completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <Text style={styles.statValue}>₹{(stats.todayRevenue || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Today's Revenue</Text>
          <Text style={styles.statSub}>₹{(stats.monthRevenue || 0).toLocaleString()} month</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Access</Text>
      <View style={styles.menuGrid}>
        {menuItems.map(item => (
          <TouchableOpacity key={item.name} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)}>
            <Text style={styles.menuItemText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#00488d', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  welcome: { color: '#fff', fontSize: 22, fontWeight: '800' },
  date: { color: '#bfdbfe', fontSize: 12, marginTop: 4 },
  logoutBtn: { backgroundColor: '#ffb800', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#1f2937', fontWeight: '800', fontSize: 13 },
  statsRow: { padding: 16, flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 14 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  statSub: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1f2937', paddingHorizontal: 16, marginBottom: 12 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  menuItem: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '47%', borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  menuItemText: { color: '#00488d', fontWeight: '800', fontSize: 14, textAlign: 'center' },
});

export default DashboardScreen;
