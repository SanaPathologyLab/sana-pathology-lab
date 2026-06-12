import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

const autoCalculateFlag = (valueStr, rangeStr) => {
  if (!valueStr || !rangeStr) return '';
  const val = parseFloat(valueStr.toString().replace(/,/g, ''));
  if (isNaN(val)) return '';
  const range = rangeStr.toString().trim().replace(/,/g, '');
  const rangePattern = /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/g;
  const matches = [...range.matchAll(rangePattern)];
  if (matches.length === 1) {
    const min = parseFloat(matches[0][1]);
    const max = parseFloat(matches[0][2]);
    if (val < min) return 'LOW';
    if (val > max) return 'HIGH';
    return '';
  }
  const lessMatch = range.match(/<\s*(\d+\.?\d*)/);
  if (lessMatch && val >= parseFloat(lessMatch[1])) return 'HIGH';
  const greaterMatch = range.match(/>\s*(\d+\.?\d*)/);
  if (greaterMatch && val <= parseFloat(greaterMatch[1])) return 'LOW';
  return '';
};

const CreateReportScreen = ({ route, navigation }) => {
  const editReportId = route.params?.editReportId;
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tests, setTests] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [testSearch, setTestSearch] = useState('');
  const [results, setResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, d, t] = await Promise.all([api.get('/patients'), api.get('/doctors'), api.get('/tests')]);
        if (Array.isArray(p)) setPatients(p);
        if (Array.isArray(d)) setDoctors(d);
        if (Array.isArray(t)) setTests(t);

        if (editReportId) {
          const report = await api.get(`/reports/${editReportId}`);
          if (report) {
            setSelectedPatient(report.patient);
            setSelectedDoctor(report.doctor);
            const initialResults = (report.results || []).map(r => ({
              key: r.id || `${r.testId}_${r.parameterName}`,
              testId: r.testId,
              parentTestName: r.test?.testName || 'Test Results',
              parameterName: r.parameterName,
              referenceRange: r.referenceRange || '',
              unit: r.unit || '',
              groupName: r.groupName || '',
              isQualitative: r.test?.parameters?.find(p => p.parameterName === r.parameterName)?.isQualitative || false,
              resultValue: r.resultValue || '',
              flag: r.flag || '',
            }));
            setResults(initialResults);
            setStep(2);
          }
        }
      } catch (err) { console.error(err); }
    })();
  }, [editReportId]);

  const filteredPatients = patients.filter(p =>
    p.fullName?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.mobileNumber?.includes(patientSearch)
  ).slice(0, 8);

  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(doctorSearch.toLowerCase())
  ).slice(0, 5);

  const filteredTests = tests.filter(t =>
    t.testName?.toLowerCase().includes(testSearch.toLowerCase()) ||
    t.testCode?.toLowerCase().includes(testSearch.toLowerCase())
  );

  const toggleTest = (test) => {
    setSelectedTests(prev =>
      prev.find(t => t.id === test.id) ? prev.filter(t => t.id !== test.id) : [...prev, test]
    );
  };

  const goToStep2 = () => {
    if (!selectedPatient) { Alert.alert('Error', 'Please select a patient.'); return; }
    if (selectedTests.length === 0) { Alert.alert('Error', 'Please select at least one test.'); return; }
    const initialResults = [];
    selectedTests.forEach(test => {
      (test.parameters || []).forEach(p => {
        const initialValue = p.isQualitative ? 'NON-REACTIVE' : '';
        initialResults.push({
          key: `${test.id}_${p.parameterName}`,
          testId: test.id,
          parentTestName: test.testName,
          parameterName: p.parameterName,
          referenceRange: p.referenceRange || '',
          unit: p.unit || '',
          groupName: p.groupName || '',
          isQualitative: p.isQualitative || false,
          resultValue: initialValue,
          flag: '',
        });
      });
    });
    setResults(initialResults);
    setStep(2);
  };

  const updateResult = (key, field, value) => {
    setResults(prev => prev.map(r => {
      if (r.key !== key) return r;
      const updated = { ...r, [field]: value };
      if (field === 'resultValue') {
        const autoFlag = autoCalculateFlag(value, r.referenceRange);
        if (autoFlag || value === '') updated.flag = autoFlag;
      }
      return updated;
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        patientId: selectedPatient.id,
        results: results.map(r => ({
          testId: r.testId, parameterName: r.parameterName,
          resultValue: r.resultValue, flag: r.flag,
          referenceRange: r.referenceRange, unit: r.unit, groupName: r.groupName,
        })),
      };
      if (selectedDoctor) payload.doctorId = selectedDoctor.id;
      
      let res;
      if (editReportId) {
        res = await api.put(`/reports/${editReportId}`, payload);
      } else {
        res = await api.post('/reports', payload);
      }
      navigation.navigate('PrintReport', { reportId: res.id || editReportId });
    } catch (err) { Alert.alert('Error', err.message); }
    setSubmitting(false);
  };

  // Group results by test name for display
  const grouped = {};
  results.forEach(r => {
    if (!grouped[r.parentTestName]) grouped[r.parentTestName] = [];
    grouped[r.parentTestName].push(r);
  });

  const renderQualitativeOptions = (r) => {
    const options = ['NON-REACTIVE', 'REACTIVE', 'POSITIVE', 'NEGATIVE', 'NOT-SEEN', 'SEEN'];
    return (
      <View style={styles.qualRow}>
        {options.slice(0, 4).map(opt => (
          <TouchableOpacity key={opt} style={[styles.qualBtn, r.resultValue === opt && styles.qualBtnActive]} onPress={() => updateResult(r.key, 'resultValue', opt)}>
            <Text style={[styles.qualText, r.resultValue === opt && styles.qualTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate New Report</Text>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, step >= 1 && styles.stepDotTextActive]}>1</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, step >= 2 && styles.stepDotTextActive]}>2</Text>
          </View>
        </View>
        <Text style={styles.stepLabel}>{step === 1 ? 'Patient & Tests' : 'Enter Results'}</Text>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <>
            {/* Patient Search */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Patient *</Text>
              <TextInput style={styles.input} placeholder="Search by name, ID or mobile..." value={patientSearch} onChangeText={setPatientSearch} />
              {selectedPatient && (
                <View style={styles.selectedCard}>
                  <Text style={styles.selectedName}>✓ {selectedPatient.fullName}</Text>
                  <Text style={styles.selectedSub}>{selectedPatient.patientId} · {selectedPatient.mobileNumber}</Text>
                  <TouchableOpacity onPress={() => { setSelectedPatient(null); setPatientSearch(''); }}>
                    <Text style={styles.clearBtn}>✕ Clear</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!selectedPatient && filteredPatients.map(p => (
                <TouchableOpacity key={p.id} style={styles.option} onPress={() => { setSelectedPatient(p); setPatientSearch(''); }}>
                  <Text style={styles.optionText}>{p.fullName} ({p.patientId})</Text>
                  <Text style={styles.optionSub}>{p.mobileNumber} · {p.age}Y/{p.gender?.charAt(0)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Doctor Search */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Referring Doctor (Optional)</Text>
              <TextInput style={styles.input} placeholder="Search doctor name..." value={doctorSearch} onChangeText={setDoctorSearch} />
              {selectedDoctor && (
                <View style={styles.selectedCard}>
                  <Text style={styles.selectedName}>✓ Dr. {selectedDoctor.name}</Text>
                  <Text style={styles.selectedSub}>{selectedDoctor.specialization}</Text>
                  <TouchableOpacity onPress={() => { setSelectedDoctor(null); setDoctorSearch(''); }}>
                    <Text style={styles.clearBtn}>✕ Clear</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!selectedDoctor && doctorSearch.length > 0 && filteredDoctors.map(d => (
                <TouchableOpacity key={d.id} style={styles.option} onPress={() => { setSelectedDoctor(d); setDoctorSearch(''); }}>
                  <Text style={styles.optionText}>Dr. {d.name}</Text>
                  <Text style={styles.optionSub}>{d.specialization} · {d.mobileNumber}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Test Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Test Panels *</Text>
              
              {selectedTests.length > 0 && (
                <View style={styles.selectedTestsContainer}>
                  <Text style={styles.selectedLabel}>Selected Tests ({selectedTests.length}):</Text>
                  <View style={styles.chipsRow}>
                    {selectedTests.map(t => (
                      <TouchableOpacity key={t.id} style={styles.chip} onPress={() => toggleTest(t)}>
                        <Text style={styles.chipText}>{t.testName} ✕</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TextInput 
                style={styles.input} 
                placeholder="Search test panel by name or code..." 
                value={testSearch} 
                onChangeText={setTestSearch} 
              />

              {filteredTests.map(t => {
                const isSelected = selectedTests.some(st => st.id === t.id);
                return (
                  <TouchableOpacity key={t.id} style={[styles.testOption, isSelected && styles.selectedTestOption]} onPress={() => toggleTest(t)}>
                    <View style={styles.testOptionBody}>
                      <Text style={styles.testOptionName}>{isSelected ? '✓ ' : ''}{t.testName}</Text>
                      <Text style={styles.testOptionSub}>{t.testCode} · {t.parameters?.length || 0} params · {t.sampleType}</Text>
                    </View>
                    <Text style={styles.testOptionPrice}>₹{t.price}</Text>
                  </TouchableOpacity>
                );
              })}
              {filteredTests.length === 0 && (
                <Text style={{ textAlign: 'center', color: '#64748b', marginVertical: 12, fontStyle: 'italic' }}>No matching tests found</Text>
              )}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={goToStep2}>
              <Text style={styles.primaryBtnText}>NEXT STEP →</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <View style={styles.infoBar}>
              <Text style={styles.infoBarText}>Patient: {selectedPatient?.fullName} · Dr. {selectedDoctor?.name || 'Self'}</Text>
            </View>

            {Object.keys(grouped).map(testName => (
              <View key={testName} style={styles.sectionReport}>
                <View style={styles.testGroupHeader}>
                  <Text style={styles.testGroupTitle}>{testName}</Text>
                </View>

                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCol, { flex: 1.5 }]}>PARAMETER</Text>
                  <Text style={[styles.tableHeaderCol, { flex: 1.2, textAlign: 'center' }]}>OBSERVED VALUE</Text>
                  <Text style={[styles.tableHeaderCol, { flex: 1, textAlign: 'center' }]}>FLAG</Text>
                  <Text style={[styles.tableHeaderCol, { flex: 1.2, textAlign: 'right' }]}>REFERENCE RANGE</Text>
                </View>

                {grouped[testName].map((r, idx) => (
                  <View key={r.key} style={styles.paramRow}>
                    {r.groupName && (idx === 0 || grouped[testName][idx - 1].groupName !== r.groupName) && (
                      <View style={styles.groupHeaderContainer}>
                        <Text style={styles.groupHeaderText}>{r.groupName}</Text>
                      </View>
                    )}
                    
                    <View style={styles.paramRowCols}>
                      <View style={styles.paramColName}>
                        <Text style={styles.paramNameText}>{r.parameterName}</Text>
                      </View>
                      
                      {r.isQualitative ? (
                        <View style={styles.paramColQual}>
                          {renderQualitativeOptions(r)}
                        </View>
                      ) : (
                        <>
                          <View style={styles.paramColVal}>
                            <TextInput
                              style={styles.resultInput}
                              placeholder="Value"
                              value={r.resultValue}
                              onChangeText={v => updateResult(r.key, 'resultValue', v)}
                              keyboardType="numeric"
                            />
                          </View>
                          <View style={styles.paramColFlag}>
                            <TouchableOpacity 
                              style={styles.flagDropdownBtn} 
                              onPress={() => {
                                const nextFlag = r.flag === '' ? 'HIGH' : r.flag === 'HIGH' ? 'LOW' : '';
                                updateResult(r.key, 'flag', nextFlag);
                              }}
                            >
                              <Text style={[
                                styles.flagDropdownText,
                                r.flag === 'HIGH' && styles.flagHigh,
                                r.flag === 'LOW' && styles.flagLow
                              ]}>
                                {r.flag === 'HIGH' ? 'High' : r.flag === 'LOW' ? 'Low' : 'Normal'}
                              </Text>
                              <Text style={styles.flagDropdownArrow}>▼</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                      
                      <View style={styles.paramColRange}>
                        <Text style={styles.refRangeText}>{r.referenceRange || '—'}</Text>
                        {r.unit ? <Text style={styles.refUnitText}>{r.unit}</Text> : null}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.stepButtons}>
              <TouchableOpacity style={styles.backBtn} onPress={() => editReportId ? navigation.goBack() : setStep(1)}>
                <Text style={styles.backBtnText}>← {editReportId ? 'Cancel' : 'Back'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitting}>
                <Text style={styles.submitBtnText}>{submitting ? 'SAVING...' : editReportId ? 'UPDATE REPORT' : 'SAVE & PREVIEW'}</Text>
              </TouchableOpacity>
            </View>

            <View style={{height: 40}} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0f172a', padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4, marginBottom: 0 },
  backText: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 20 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: '#0ea5e9' },
  stepDotText: { color: '#64748b', fontSize: 13, fontWeight: '800' },
  stepDotTextActive: { color: '#fff' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#334155', marginHorizontal: 8 },
  stepLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },

  body: { flex: 1 },
  infoBar: { backgroundColor: '#eff6ff', borderBottomWidth: 1, borderBottomColor: '#bfdbfe', padding: 12 },
  infoBarText: { color: '#1d4ed8', fontSize: 13, fontWeight: '700' },

  section: { backgroundColor: '#fff', margin: 16, marginBottom: 0, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a', marginBottom: 12 },

  selectedCard: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 10, padding: 12, marginBottom: 8 },
  selectedName: { fontSize: 14, fontWeight: '800', color: '#166534' },
  selectedSub: { fontSize: 12, color: '#16a34a', marginTop: 2 },
  clearBtn: { fontSize: 12, color: '#dc2626', fontWeight: '700', marginTop: 6 },

  option: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  optionText: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  optionSub: { fontSize: 12, color: '#64748b', marginTop: 2 },

  testOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  selectedTestOption: { backgroundColor: '#eff6ff', borderRadius: 10, borderBottomWidth: 0, marginBottom: 4 },
  testOptionBody: { flex: 1 },
  testOptionName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  testOptionSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  testOptionPrice: { fontSize: 15, fontWeight: '900', color: '#059669' },

  primaryBtn: { backgroundColor: '#0ea5e9', margin: 16, padding: 18, borderRadius: 14, alignItems: 'center', elevation: 2, shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  testGroupHeader: {
    backgroundColor: '#00488d',
    padding: 14,
    width: '100%',
  },
  testGroupTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  sectionReport: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    overflow: 'hidden',
  },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderCol: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  paramRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  paramRowCols: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paramColName: {
    flex: 1.5,
    paddingRight: 6,
  },
  paramNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  paramColVal: {
    flex: 1.2,
    paddingHorizontal: 4,
  },
  resultInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  paramColFlag: {
    flex: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  flagDropdownBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 70,
  },
  flagDropdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  flagDropdownArrow: {
    fontSize: 8,
    color: '#64748b',
    marginLeft: 2,
  },
  flagHigh: {
    color: '#dc2626',
  },
  flagLow: {
    color: '#2563eb',
  },
  paramColRange: {
    flex: 1.2,
    paddingLeft: 6,
    alignItems: 'flex-end',
  },
  refRangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'right',
  },
  refUnitText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 2,
  },
  paramColQual: {
    flex: 2.2,
    paddingHorizontal: 4,
  },
  groupHeaderContainer: {
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: -12,
    marginRight: -12,
    marginBottom: 8,
  },
  groupHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  qualRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qualBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  qualBtnActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  qualText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  qualTextActive: { color: '#fff' },

  stepButtons: { flexDirection: 'row', gap: 12, margin: 16, marginTop: 24 },
  backBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  backBtnText: { color: '#475569', fontWeight: '800', fontSize: 14 },
  submitBtn: { flex: 2, padding: 16, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#94a3b8' },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  selectedTestsContainer: { marginBottom: 12 },
  selectedLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#0ea5e9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

export default CreateReportScreen;
