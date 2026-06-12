import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import Loader from '../components/Loader';

const DoctorAnalyticsScreen = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchAnalytics(); }, [month, year]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/doctors/analytics/referrals?month=${month}&year=${year}`);
      data.sort((a, b) => b.totalSamples - a.totalSamples);
      setAnalytics(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Doctor Referrals</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity onPress={() => setMonth(month === 1 ? 12 : month - 1)}><Text style={styles.navBtn}>◀</Text></TouchableOpacity>
          <Text style={styles.filterText}>{new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</Text>
          <TouchableOpacity onPress={() => setMonth(month === 12 ? 1 : month + 1)}><Text style={styles.navBtn}>▶</Text></TouchableOpacity>
        </View>
      </View>

      {analytics.map((doc, idx) => (
        <View key={doc.id} style={styles.card}>
          <View style={styles.rank}>
            <Text style={styles.rankText}>#{idx + 1}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.docName}>Dr. {doc.name}</Text>
            <Text style={styles.docMeta}>{doc.clinicName} · {doc.doctorId}</Text>
            <Text style={styles.samples}>{doc.totalSamples} Samples</Text>
          </View>
        </View>
      ))}
      {analytics.length === 0 && <Text style={styles.empty}>No referrals this month</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#00488d' },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 16 },
  navBtn: { fontSize: 20, color: '#00488d', padding: 8 },
  filterText: { fontSize: 16, fontWeight: '700', color: '#374151' },
  card: { flexDirection: 'row', backgroundColor: '#fff', margin: 10, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  rank: { width: 40, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 18, fontWeight: '900', color: '#00488d' },
  cardContent: { flex: 1 },
  docName: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  docMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  samples: { fontSize: 24, fontWeight: '900', color: '#00488d', marginTop: 6 },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40 },
});

export default DoctorAnalyticsScreen;
