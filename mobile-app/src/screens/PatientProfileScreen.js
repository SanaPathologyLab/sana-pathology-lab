import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import Loader from '../components/Loader';

const PatientProfileScreen = ({ route, navigation }) => {
  const { patientId } = route.params;
  const { user } = useContext(AuthContext);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await api.get(`/patients/${patientId}`);
        setPatient(p);
      } catch (err) { console.error(err); }
      setLoading(false);
    })();
  }, [patientId]);

  if (loading) return <Loader />;
  if (!patient) return <View style={styles.centered}><Text>Patient not found</Text></View>;

  const InfoRow = ({ label, value }) => value ? (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  ) : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{patient.fullName?.charAt(0)}</Text></View>
        <Text style={styles.name}>{patient.fullName}</Text>
        <Text style={styles.meta}>{patient.patientId} · {patient.gender} · {patient.age}Y</Text>
        <Text style={styles.meta}>{patient.mobileNumber}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <InfoRow label="Blood Group" value={patient.bloodGroup} />
        <InfoRow label="City" value={patient.city} />
        <InfoRow label="Father/Husband" value={patient.fatherHusband} />
        <InfoRow label="Email" value={patient.email} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical History</Text>
        <InfoRow label="Diabetes" value={patient.diabetes ? 'Yes' : 'No'} />
        <InfoRow label="Hypertension" value={patient.hypertension ? 'Yes' : 'No'} />
        {patient.allergies && <InfoRow label="Allergies" value={patient.allergies} />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard: { backgroundColor: '#00488d', padding: 24, paddingTop: 50, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  name: { color: '#fff', fontSize: 22, fontWeight: '800' },
  meta: { color: '#bfdbfe', fontSize: 13, marginTop: 2 },
  section: { backgroundColor: '#fff', margin: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#00488d', marginBottom: 12, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, color: '#1f2937', fontWeight: '600' },
});

export default PatientProfileScreen;
