import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const SettingsScreen = () => {
  const { user } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    labName: 'Sana Pathology Lab',
    labAddress: 'Datawali Road, Near Aara Machine, Hayat Nagar',
    labCity: 'Hayat Nagar',
    labPhone: '6396786939',
    labPhone2: '6397240575',
    labEmail: 'sana.pathology@gmail.com',
    labGST: '',
    pathologistName: 'Dr. Pathologist',
    pathologistQual: 'MD Pathology',
    technicianName: 'Lab Technician',
    reportFooter: 'This report is electronically generated.',
  });

  useEffect(() => {
    api.get('/settings').then(data => {
      if (data && !data.error) setForm(prev => ({ ...prev, ...data }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', form);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const Field = ({ label, field, multiline = false }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={form[field] || ''}
        onChangeText={v => setForm(prev => ({ ...prev, [field]: v }))}
        multiline={multiline}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lab Information</Text>
        <Field label="Lab Name" field="labName" />
        <Field label="Address" field="labAddress" multiline />
        <Field label="City" field="labCity" />
        <Field label="Phone 1" field="labPhone" />
        <Field label="Phone 2" field="labPhone2" />
        <Field label="Email" field="labEmail" />
        <Field label="GST" field="labGST" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Signatories</Text>
        <Field label="Pathologist Name" field="pathologistName" />
        <Field label="Pathologist Qualification" field="pathologistQual" />
        <Field label="Technician Name" field="technicianName" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Configuration</Text>
        <Field label="Footer Text" field="reportFooter" multiline />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#00488d' },
  saveBtn: { backgroundColor: '#00488d', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  section: { backgroundColor: '#fff', margin: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#00488d', marginBottom: 16, textTransform: 'uppercase' },
  field: { marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, fontSize: 14, backgroundColor: '#f9fafb' },
});

export default SettingsScreen;
