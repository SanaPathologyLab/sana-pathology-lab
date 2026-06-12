import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import Loader from '../components/Loader';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generatePrintHTML } from '../utils/pdfGenerator';

const PrintReportScreen = ({ route, navigation }) => {
  const { reportId } = route.params;
  const { user } = useContext(AuthContext);
  const [report, setReport] = useState(null);

  const [settings, setSettings] = useState({
    labName: 'Sana Pathology Lab',
    labAddress: 'Datawali Road, Near Aara Machine, Hayat Nagar, Distt. Sambhal-244303 (U.P)',
    labPhone: '6396786939',
    labPhone2: '6397240575',
    reportFooter: 'This Report is not Valid for medico legal Purpose.',
    pathologistName: 'Mohd. Altamash',
    pathologistQual: 'D.M.L.T.',
    technicianName: 'Technician'
  });

  useEffect(() => {
    (async () => {
      try {
        const [reportData, settingsData] = await Promise.all([
          api.get(`/reports/${reportId}`),
          api.get('/settings').catch(() => ({}))
        ]);
        setReport(reportData);
        if (settingsData && !settingsData.error) {
          setSettings(prev => ({ ...prev, ...settingsData }));
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [reportId]);

  if (!report) return <Loader />;

  const patient = report.patient || {};

  const handleWhatsApp = async () => {
    try {
      const html = generatePrintHTML(report, settings, true); // true = include letterhead for digital share
      const { uri } = await Print.printToFileAsync({ html, height: 1123, width: 794 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `Share Report ${report.reportNumber}` });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  const handlePrint = async () => {
    try {
      const html = generatePrintHTML(report, settings, false); // false = NO letterhead for physical print (print in blank)
      await Print.printAsync({ html });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.root}>
      {/* ── TOP ACTION BAR (Matches Web Grey Bar) ── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {report.reportNumber} — {patient.fullName?.toUpperCase() || patient.name?.toUpperCase()}
          </Text>
        </View>
        <View style={styles.topBarRight}>
          {user?.userType === 'STAFF' && (
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('CreateReport', { editReportId: report.id })}>
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
            <Text style={styles.waBtnText}>WhatsApp Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.printBtnTop} onPress={handlePrint}>
            <Text style={styles.printBtnTopText}>🖨️ Print</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── WEBVIEW PREVIEW CONTAINER ── */}
      <View style={styles.webViewContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: generatePrintHTML(report, settings, true) }}
          style={styles.webView}
          scalesPageToFit={true}
          useWebKit={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#e8edf4' },

  // Web-like Top Action Bar
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    elevation: 2, 
    zIndex: 10 
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 4, marginRight: 12 },
  backBtnText: { fontSize: 12, fontWeight: '700', color: '#4b5563' },
  topBarTitle: { fontSize: 13, fontWeight: '800', color: '#00488d', flexShrink: 1 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  editBtn: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#f59e0b', borderRadius: 4 },
  editBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  waBtn: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#22c55e', borderRadius: 4 },
  waBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  printBtnTop: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#1e3a8a', borderRadius: 4 },
  printBtnTopText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  webViewContainer: { flex: 1, backgroundColor: '#e8edf4' },
  webView: { flex: 1, backgroundColor: 'transparent' },
});

export default PrintReportScreen;
