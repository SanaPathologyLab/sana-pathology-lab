import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const TITERS = ['1/20', '1/40', '1/80', '1/160', '1/320'];
const ANTIGENS = ['S. TYPHI O', 'S. TYPHI H', 'S. PARA TYPHI A (H)', 'S. PARA TYPHI B (H)'];

const WidalTestScreen = () => {
  const [cells, setCells] = useState(() => {
    const initial = {};
    ANTIGENS.forEach(a => TITERS.forEach(t => { initial[`${a}|${t}`] = '--'; }));
    return initial;
  });
  const [overallResult, setOverallResult] = useState('NEGATIVE');
  const [report, setReport] = useState(null);

  const toggleCell = (antigen, titer) => {
    const key = `${antigen}|${titer}`;
    setCells(prev => ({ ...prev, [key]: prev[key] === '+' ? '--' : '+' }));
  };

  const resetAll = () => {
    const cleared = {};
    ANTIGENS.forEach(a => TITERS.forEach(t => { cleared[`${a}|${t}`] = '--'; }));
    setCells(cleared);
    setReport(null);
  };

  const generateReport = () => {
    const rows = ANTIGENS.map(antigen => {
      const titerResults = TITERS.map(titer => ({ titer, value: cells[`${antigen}|${titer}`] }));
      return { antigen, titerResults, reactive: titerResults.some(r => r.value === '+') };
    });
    setReport(rows);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>WIDAL TEST (Rapid Slid Method)</Text>

      <View style={styles.resultToggle}>
        <Text style={styles.resultLabel}>Result:</Text>
        {['POSITIVE', 'NEGATIVE'].map(opt => (
          <TouchableOpacity key={opt} style={[styles.resultBtn, overallResult === opt && styles.activeResult]} onPress={() => setOverallResult(opt)}>
            <Text style={[styles.resultBtnText, overallResult === opt && styles.activeResultText]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}></Text>
          {TITERS.map(t => <Text key={t} style={[styles.cell, styles.headerCell, { flex: 1 }]}>{t}</Text>)}
        </View>
        {ANTIGENS.map(antigen => (
          <View key={antigen} style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 1.5, fontWeight: '700' }]}>{antigen}</Text>
            {TITERS.map(titer => {
              const val = cells[`${antigen}|${titer}`];
              const isPos = val === '+';
              return (
                <TouchableOpacity key={titer} style={[styles.cell, styles.titerCell, { flex: 1 }]} onPress={() => toggleCell(antigen, titer)}>
                  <Text style={[styles.titerValue, isPos && { color: '#059669', fontWeight: '800' }]}>{val}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.resetBtn} onPress={resetAll}><Text style={styles.resetBtnText}>Reset All</Text></TouchableOpacity>
        <TouchableOpacity style={styles.generateBtn} onPress={generateReport}><Text style={styles.generateBtnText}>Generate Report</Text></TouchableOpacity>
      </View>

      {report && (
        <View style={styles.reportSection}>
          <Text style={styles.reportTitle}>WIDAL Test Interpretation</Text>
          {report.map(row => (
            <View key={row.antigen} style={styles.reportRow}>
              <Text style={styles.reportAntigen}>{row.antigen}</Text>
              <Text style={[styles.reportStatus, row.reactive ? { color: '#059669' } : { color: '#6b7280' }]}>
                {row.reactive ? 'REACTIVE' : 'NON-REACTIVE'}
              </Text>
            </View>
          ))}
          <Text style={styles.overall}>Overall Result: {overallResult}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16, paddingTop: 50 },
  title: { fontSize: 18, fontWeight: '800', color: '#000', textAlign: 'center', marginBottom: 20, textTransform: 'uppercase' },
  resultToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  resultLabel: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  resultBtn: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 8, borderWidth: 2, borderColor: '#d1d5db' },
  activeResult: { borderColor: '#000', backgroundColor: '#000' },
  resultBtnText: { fontSize: 13, fontWeight: '700', color: '#9ca3af' },
  activeResultText: { color: '#fff' },
  table: { borderWidth: 1, borderColor: '#000', borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  cell: { padding: 12, justifyContent: 'center', alignItems: 'center' },
  headerCell: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  titerCell: { borderLeftWidth: 1, borderLeftColor: '#e5e7eb' },
  titerValue: { fontSize: 14, color: '#374151' },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  resetBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 2, borderColor: '#9ca3af', alignItems: 'center' },
  resetBtnText: { fontWeight: '700', color: '#6b7280' },
  generateBtn: { flex: 2, padding: 14, borderRadius: 10, backgroundColor: '#000', alignItems: 'center' },
  generateBtnText: { fontWeight: '800', color: '#fff' },
  reportSection: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  reportTitle: { fontSize: 15, fontWeight: '800', color: '#000', marginBottom: 12 },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  reportAntigen: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  reportStatus: { fontSize: 13, fontWeight: '800' },
  overall: { fontSize: 15, fontWeight: '800', color: '#000', marginTop: 12, textAlign: 'center' },
});

export default WidalTestScreen;
