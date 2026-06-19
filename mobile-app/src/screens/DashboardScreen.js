import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Dimensions, SafeAreaView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import Loader from '../components/Loader';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPatients: 0, todayPatients: 0, pendingReports: 0, completedReports: 0,
    totalRevenue: 0, todayRevenue: 0, monthRevenue: 0, topDoctors: []
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [pendingReportsList, setPendingReportsList] = useState([]);
  const [testsCount, setTestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsData, patientsData, reportsData, testsData] = await Promise.all([
        api.get('/dashboard/stats').catch(() => ({})),
        api.get('/patients/recent?limit=6').catch(() => []),
        api.get('/reports?status=PENDING&limit=3').catch(() => []),
        api.get('/tests').catch(() => [])
      ]);
      setStats(statsData || {});
      setRecentPatients(Array.isArray(patientsData) ? patientsData : []);
      setPendingReportsList(Array.isArray(reportsData) ? reportsData : []);
      setTestsCount(Array.isArray(testsData) ? testsData.length : 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} />}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcome}>Welcome, {user?.name || 'Admin'} 👋</Text>
              <Text style={styles.date}>Sana Pathology Lab Management System · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAccessScroll} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
            {['Patients', 'Doctors', 'Tests', 'Billing', 'Appointments', 'Inventory', 'Staff', 'Settings'].map(item => (
              <TouchableOpacity key={item} style={styles.quickChip} onPress={() => {
                if (['Patients', 'Billing'].includes(item)) navigation.navigate(`${item}Tab`);
                else navigation.navigate(item);
              }}>
                <Text style={styles.quickChipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* STAT CARDS */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
            <View style={[styles.iconBox, { backgroundColor: '#dbeafe' }]}><Text style={{fontSize:18}}>👥</Text></View>
            <Text style={[styles.statValue, { color: '#1e3a8a' }]}>{stats.todayPatients || 0}</Text>
            <Text style={styles.statLabel}>Today's Patients</Text>
            <Text style={styles.statSub}>{stats.totalPatients || 0} total</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
            <View style={[styles.iconBox, { backgroundColor: '#fef08a' }]}><Text style={{fontSize:18}}>⏳</Text></View>
            <Text style={[styles.statValue, { color: '#92400e' }]}>{stats.pendingReports || 0}</Text>
            <Text style={styles.statLabel}>Pending Reports</Text>
            <Text style={styles.statSub}>{stats.completedReports || 0} completed</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
            <View style={[styles.iconBox, { backgroundColor: '#d1fae5' }]}><Text style={{fontSize:18}}>₹</Text></View>
            <Text style={[styles.statValue, { color: '#065f46' }]}>₹{(stats.todayRevenue || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Today's Revenue</Text>
            <Text style={styles.statSub}>₹{(stats.monthRevenue || 0).toLocaleString()} this month</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#f3e8ff', borderColor: '#e9d5ff' }]}>
            <View style={[styles.iconBox, { backgroundColor: '#e9d5ff' }]}><Text style={{fontSize:18}}>🧪</Text></View>
            <Text style={[styles.statValue, { color: '#5b21b6' }]}>{testsCount}</Text>
            <Text style={styles.statLabel}>Tests Available</Text>
            <Text style={styles.statSub}>in test catalogue</Text>
          </View>
        </View>

        {/* TOP DOCTORS */}
        {stats.topDoctors && stats.topDoctors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Referring Doctors</Text>
            <View style={styles.card}>
              {stats.topDoctors.slice(0, 5).map((doc, i) => (
                <View key={i} style={[styles.docRow, i !== stats.topDoctors.length - 1 && styles.borderBottom]}>
                  <View style={styles.docLeft}>
                    <Text style={styles.docRank}>#{i + 1}</Text>
                    <Text style={styles.docName}>{doc.doctorName}</Text>
                  </View>
                  <Text style={styles.docCount}>{doc._count?.doctorName || 0}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* MONTH SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Month Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
              <Text style={styles.summaryValue}>₹{(stats.monthRevenue || 0).toLocaleString()}</Text>
              <Text style={styles.summarySub}>This Month</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Patients</Text>
              <Text style={styles.summaryValue}>{stats.totalPatients || 0}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Completed Reports</Text>
              <Text style={styles.summaryValue}>{stats.completedReports || 0}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Pending Reports</Text>
              <Text style={styles.summaryValue}>{stats.pendingReports || 0}</Text>
            </View>
          </View>
        </View>

        {/* RECENT PATIENTS */}
        {recentPatients.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Patients</Text>
              <TouchableOpacity onPress={() => navigation.navigate('PatientsTab')}>
                <Text style={styles.viewAll}>VIEW ALL →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {recentPatients.map((p, i) => (
                <View key={p.id} style={[styles.listRow, i !== recentPatients.length - 1 && styles.borderBottom]}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(p.name)}</Text></View>
                  <View style={styles.listInfo}>
                    <Text style={styles.listTitle}>{p.name}</Text>
                    <Text style={styles.listSub}>{p.patientId} · {p.mobile}</Text>
                  </View>
                  <Text style={styles.listDate}>{formatDate(p.createdAt)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* PENDING REPORTS */}
        {pendingReportsList.length > 0 && (
          <View style={[styles.section, { marginBottom: 40 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Reports</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ReportsTab')}>
                <Text style={styles.viewAll}>VIEW ALL →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {pendingReportsList.map((r, i) => (
                <View key={r.id} style={[styles.listRow, i !== pendingReportsList.length - 1 && styles.borderBottom]}>
                  <View style={styles.listInfo}>
                    <Text style={styles.listTitle}>{r.reportId || `RPT-${r.id}`}</Text>
                    <Text style={styles.listSub}>{r.patient?.name || 'Unknown'} · {formatDate(r.createdAt)}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{r.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.copyright}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    backgroundColor: '#0f172a', 
    padding: 24, 
    paddingTop: 30, 
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcome: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  date: { color: '#94a3b8', fontSize: 11, marginTop: 4, fontWeight: '500' },
  logoutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  quickAccessScroll: { marginTop: 20 },
  quickChip: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  quickChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: -20, gap: 12 },
  statCard: { width: (width - 44) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 },
  statSub: { fontSize: 11, color: '#64748b' },
  
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
  viewAll: { fontSize: 11, fontWeight: '800', color: '#0ea5e9', marginBottom: 12 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  
  docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  docLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docRank: { fontSize: 14, fontWeight: '800', color: '#94a3b8', width: 24 },
  docName: { fontSize: 14, fontWeight: '700', color: '#334155' },
  docCount: { fontSize: 16, fontWeight: '900', color: '#0f172a', backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryBox: { width: (width - 44) / 2, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  summaryLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', marginBottom: 6 },
  summaryValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  summarySub: { fontSize: 11, color: '#10b981', fontWeight: '700', marginTop: 4 },

  listRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#64748b' },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  listSub: { fontSize: 12, color: '#64748b' },
  listDate: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  
  statusBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#fde68a' },
  statusText: { fontSize: 10, fontWeight: '800', color: '#b45309' },

  copyright: { textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 20, marginBottom: 40 }
});

export default DashboardScreen;
