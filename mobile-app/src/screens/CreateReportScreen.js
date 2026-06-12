import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const CreateReportScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, t] = await Promise.all([api.get('/patients'), api.get('/tests')]);
        if (Array.isArray(p)) setPatients(p);
        if (Array.isArray(t)) setTests(t);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const filteredPatients = patients.filter(p =>
    p.fullName?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.mobileNumber?.includes(patientSearch)
  );

  const toggleTest = (test) => {
    setSelectedTests(prev =>
      prev.find(t => t.id === test.id) ? prev.filter(t => t.id !== test.id) : [...prev, test]
    );
  };

  const goToStep2 = () => {
    if (!selectedPatient) { Alert.alert('Error', 'Select a patient'); return; }
    if (selectedTests.length === 0) { Alert.alert('Error', 'Select at least one test'); return; }
    const initialResults = [];
    selectedTests.forEach(test => {
      (test.parameters || []).forEach(p => {
        initialResults.push({
          key: `${test.id}_${p.parameterName}`,
          testId: test.id,
          parentTestName: test.testName,
          parameterName: p.parameterName,
          referenceRange: p.referenceRange,
          unit: p.unit,
          groupName: p.groupName,
          resultValue: '',
          flag: '',
        });
      });
    });
    setResults(initialResults);
    setStep(2);
  };

  const updateResult = (key, field, value) => {
    setResults(prev => prev.map(r => r.key === key ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        patientId: selectedPatient.id,
        results: results.map(r => ({
          testId: r.testId, parameterName: r.parameterName,
          resultValue: r.resultValue, flag: r.flag,
          referenceRange: r.referenceRange, unit: r.unit, groupName: r.groupName,
        })),
      };
      const res = await api.post('/reports', payload);
      navigation.navigate('PrintReport', { reportId: res.id });
    } catch (err) { Alert.alert('Error', err.message); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Report</Text>
        <View style={styles.steps}>
          <Text style={[styles.step, step === 1 && styles.activeStep]}>1. Patient & Tests</Text>
          <Text style={[styles.step, step === 2 && styles.activeStep]}>2. Results</Text>
        </View>
      </View>

      {step === 1 ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Patient</Text>
            <TextInput style={styles.input} placeholder="Search by name, ID, mobile..." value={patientSearch} onChangeText={setPatientSearch} />
            {filteredPatients.slice(0, 10).map(p => (
              <TouchableOpacity key={p.id} style={[styles.option, selectedPatient?.id === p.id && styles.selectedOption]} onPress={() => setSelectedPatient(p)}>
                <Text style={styles.optionText}>{p.fullName} ({p.patientId})</Text>
                <Text style={styles.optionSub}>{p.mobileNumber}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Tests</Text>
            {tests.map(t => (
              <TouchableOpacity key={t.id} style={[styles.option, selectedTests.find(st => st.id === t.id) && styles.selectedOption]} onPress={() => toggleTest(t)}>
                <Text style={styles.optionText}>{t.testName}</Text>
                <Text style={styles.optionSub}>₹{t.price} · {t.sampleType}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={goToStep2}>
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            {results.map((r, idx) => (
              <View key={r.key} style={styles.resultRow}>
                <Text style={styles.paramName}>{r.parameterName}</Text>
                <View style={styles.resultInputs}>
                  <TextInput style={styles.resultInput} placeholder="Value" value={r.resultValue} onChangeText={v => updateResult(r.key, 'resultValue', v)} />
                  <TextInput style={[styles.resultInput, { flex: 0.5 }]} placeholder="Flag" value={r.flag} onChangeText={v => updateResult(r.key, 'flag', v)} />
                </View>
                <Text style={styles.refRange}>{r.referenceRange} {r.unit}</Text>
              </View>
            ))}
          </View>

          <View style={styles.stepButtons}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}><Text style={styles.submitBtnText}>Save & Preview</Text></TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#00488d' },
  steps: { flexDirection: 'row', gap: 16, marginTop: 12 },
  step: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },
  activeStep: { color: '#00488d' },
  section: { backgroundColor: '#fff', margin: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#00488d', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#f9fafb', marginBottom: 10 },
  option: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  selectedOption: { backgroundColor: '#eff6ff', borderRadius: 8 },
  optionText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  optionSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  nextBtn: { backgroundColor: '#00488d', margin: 12, padding: 16, borderRadius: 12, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  resultRow: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  paramName: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 4 },
  resultInputs: { flexDirection: 'row', gap: 8 },
  resultInput: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 13, backgroundColor: '#f9fafb' },
  refRange: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  stepButtons: { flexDirection: 'row', gap: 12, margin: 12 },
  backBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  backBtnText: { color: '#6b7280', fontWeight: '700' },
  submitBtn: { flex: 2, padding: 16, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '800' },
});

export default CreateReportScreen;
