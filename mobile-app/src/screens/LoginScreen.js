import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';

const API_BASE = 'https://sana-pathology-backend.onrender.com/api';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('PATIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let endpoint, bodyData;
      if (activeTab === 'STAFF') {
        endpoint = '/auth/login';
        bodyData = { email, password };
      } else if (activeTab === 'PATIENT') {
        endpoint = '/auth/login/patient';
        bodyData = { mobileNumber, patientId };
      } else {
        endpoint = '/auth/login/doctor';
        bodyData = { mobileNumber, doctorId };
      }
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      if (res.ok) {
        await login(data);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.brandSection}>
        <Logo size={80} />
        <Text style={styles.brandTitle}>Sana Pathology</Text>
        <Text style={styles.brandSubtitle}>Diagnostic Portal</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.greeting}>
          {activeTab === 'PATIENT' ? 'Patient Login' : activeTab === 'DOCTOR' ? 'Doctor Login' : 'Staff Login'}
        </Text>

        <View style={styles.tabRow}>
          {['PATIENT', 'DOCTOR', 'STAFF'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'PATIENT' ? 'Patient' : tab === 'DOCTOR' ? 'Doctor' : 'Staff'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'STAFF' ? (
          <>
            <TextInput style={styles.input} placeholder="Email / Staff ID" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          </>
        ) : activeTab === 'PATIENT' ? (
          <>
            <TextInput style={styles.input} placeholder="Patient ID (e.g. SPL-0001)" value={patientId} onChangeText={setPatientId} autoCapitalize="characters" />
            <TextInput style={styles.input} placeholder="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
          </>
        ) : (
          <>
            <TextInput style={styles.input} placeholder="Doctor ID (e.g. DOC-0001)" value={doctorId} onChangeText={setDoctorId} autoCapitalize="characters" />
            <TextInput style={styles.input} placeholder="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.footerLinks}>
        <TouchableOpacity onPress={() => navigation.navigate('PublicWelcome')}>
          <Text style={styles.link}>← Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ReportLookup')}>
          <Text style={styles.link}>Report Lookup</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  content: { padding: 24, paddingTop: 60 },
  brandSection: { alignItems: 'center', marginBottom: 32 },
  brandTitle: { fontSize: 28, fontWeight: '900', color: '#085041', marginTop: 8 },
  brandSubtitle: { fontSize: 11, fontWeight: '800', color: '#085041', letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#085041', textAlign: 'center', marginBottom: 20 },
  tabRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 3, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  tabText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  activeTabText: { color: '#085041' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 14, fontWeight: '500', marginBottom: 12, backgroundColor: '#f8fafc' },
  button: { backgroundColor: '#085041', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  footerLinks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  link: { fontSize: 13, fontWeight: '700', color: '#085041' },
});

export default LoginScreen;
