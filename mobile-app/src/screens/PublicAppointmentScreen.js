import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { api } from '../services/api';

const PublicAppointmentScreen = ({ navigation }) => {
  const [mode, setMode] = useState('new');
  const [form, setForm] = useState({
    patientName: '',
    patientId: '',
    patientMobile: '',
    patientAddress: '',
    doctorName: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    testNames: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.patientName || !form.patientMobile || !form.appointmentDate) {
      Alert.alert('Error', 'Name, Mobile & Date are required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/public/appointment', form);
      Alert.alert('Success', 'Appointment booked! We will contact you shortly.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    }
    setSaving(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Book an Appointment</Text>
      <Text style={styles.subtitle}>Fill the form below to schedule your visit</Text>

      <View style={styles.modeToggle}>
        {['new', 'existing'].map(m => (
          <TouchableOpacity key={m} style={[styles.modeBtn, mode === m && styles.activeMode]} onPress={() => setMode(m)}>
            <Text style={[styles.modeText, mode === m && styles.activeModeText]}>{m === 'new' ? 'New Patient' : 'Existing'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Patient Information</Text>
      <TextInput style={styles.input} placeholder="Full Name *" value={form.patientName} onChangeText={v => setForm({...form, patientName: v})} />
      {mode === 'existing' && (
        <TextInput style={styles.input} placeholder="Patient ID" value={form.patientId} onChangeText={v => setForm({...form, patientId: v})} />
      )}
      <TextInput style={styles.input} placeholder="Mobile Number *" value={form.patientMobile} onChangeText={v => setForm({...form, patientMobile: v})} keyboardType="phone-pad" />
      <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} placeholder="Address" value={form.patientAddress} onChangeText={v => setForm({...form, patientAddress: v})} multiline />

      <Text style={styles.sectionTitle}>Appointment Details</Text>
      <TextInput style={styles.input} placeholder="Date (DD/MM/YYYY) *" value={form.appointmentDate} onChangeText={v => setForm({...form, appointmentDate: v})} />
      <TextInput style={styles.input} placeholder="Time (HH:MM AM/PM)" value={form.appointmentTime} onChangeText={v => setForm({...form, appointmentTime: v})} />
      <TextInput style={styles.input} placeholder="Tests Required (comma separated)" value={form.testNames} onChangeText={v => setForm({...form, testNames: v})} />

      <Text style={styles.sectionTitle}>Doctor Reference (optional)</Text>
      <TextInput style={styles.input} placeholder="Doctor Name" value={form.doctorName} onChangeText={v => setForm({...form, doctorName: v})} />
      <TextInput style={styles.input} placeholder="Doctor ID (if known)" value={form.doctorId} onChangeText={v => setForm({...form, doctorId: v})} />

      <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Additional Notes" value={form.notes} onChangeText={v => setForm({...form, notes: v})} multiline />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.submitText}>{saving ? 'Booking...' : 'Book Appointment'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: '800', color: '#00488d', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  modeToggle: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 10, padding: 3, marginBottom: 20 },
  modeBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  activeMode: { backgroundColor: '#00488d' },
  modeText: { fontWeight: '700', color: '#6b7280', fontSize: 13 },
  activeModeText: { color: '#fff' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#00488d', textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 12, backgroundColor: '#fff' },
  submitBtn: { backgroundColor: '#00488d', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default PublicAppointmentScreen;
