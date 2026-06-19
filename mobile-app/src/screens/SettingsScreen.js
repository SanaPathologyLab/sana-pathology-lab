import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const SettingsScreen = () => {
  const { user } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    labName: 'Sana Pathology Lab',
    labRegNo: '',
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
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (err) { Alert.alert('Error', err.message); }
    setSaving(false);
  };

  const Field = ({ label, field, multiline = false, keyboardType = 'default' }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={form[field] || ''}
        onChangeText={v => setForm(prev => ({ ...prev, [field]: v }))}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Configure your laboratory information</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'SAVING...' : 'SAVE SETTINGS'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🏢</Text>
              <Text style={styles.sectionTitle}>Lab Information</Text>
            </View>
            <View style={styles.sectionBody}>
              <Field label="Lab Name" field="labName" />
              <Field label="Registration No." field="labRegNo" />
              <Field label="Address" field="labAddress" multiline />
              <Field label="City" field="labCity" />
              <Field label="GST Number" field="labGST" />
              <View style={styles.row}>
                <View style={{flex: 1}}><Field label="Phone 1" field="labPhone" keyboardType="phone-pad" /></View>
                <View style={{width: 12}} />
                <View style={{flex: 1}}><Field label="Phone 2" field="labPhone2" keyboardType="phone-pad" /></View>
              </View>
              <Field label="Email" field="labEmail" keyboardType="email-address" />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>👨‍⚕️</Text>
              <Text style={styles.sectionTitle}>Report Signatories</Text>
            </View>
            <View style={styles.sectionBody}>
              <Field label="Pathologist Name" field="pathologistName" />
              <Field label="Pathologist Qualification" field="pathologistQual" />
              <Field label="Technician Name" field="technicianName" />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📄</Text>
              <Text style={styles.sectionTitle}>Report Configuration</Text>
            </View>
            <View style={styles.sectionBody}>
              <Field label="Report Footer Text" field="reportFooter" multiline />
            </View>
          </View>

          <Text style={styles.footerText}>© 2026 Sana Pathology Lab. All Rights Reserved.</Text>
          <View style={{height: 40}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  header: { backgroundColor: '#0f172a', padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4, zIndex: 10 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4, marginBottom: 16 },
  saveBtn: { backgroundColor: '#0ea5e9', paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },

  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  
  section: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  sectionIcon: { fontSize: 18, marginRight: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionBody: { padding: 16 },

  field: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, fontSize: 15, color: '#0f172a', backgroundColor: '#f8fafc' },
  row: { flexDirection: 'row' },

  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 10, marginBottom: 20 },
});

export default SettingsScreen;
