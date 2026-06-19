import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generatePrintHTML } from '../utils/pdfGenerator';

const PublicPrintScreen = ({ route, navigation }) => {
  const reportData = route?.params?.reportData;
  const [report] = useState(reportData || null);
  
  const [settings] = useState({
    labName: 'Sana Pathology Lab',
    labAddress: 'Datawali Road, Near Aara Machine, Hayat Nagar, Distt. Sambhal-244303 (U.P)',
    labPhone: '6396786939',
    labPhone2: '6397240575',
    reportFooter: 'This Report is not Valid for medico legal Purpose.',
    pathologistName: 'Mohd. Altamash',
    pathologistQual: 'D.M.L.T.',
    technicianName: 'Technician'
  });

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Report not found</Text>
      </View>
    );
  }

  const patient = report.patient || {};

  const handleDownloadPdf = async () => {
    try {
      const html = generatePrintHTML(report, settings, true); // public user wants the full letterhead
      const { uri } = await Print.printToFileAsync({ html, height: 1123, width: 794 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `Download Report ${report.reportNumber}` });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
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
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPdf}>
            <Text style={styles.downloadBtnText}>📥 Download PDF</Text>
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8edf4' },
  loading: { fontSize: 16, fontWeight: '700', color: '#64748b' },

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
  topBarRight: { flexDirection: 'row', alignItems: 'center' },
  downloadBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1e3a8a', borderRadius: 4 },
  downloadBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  webViewContainer: { flex: 1, backgroundColor: '#e8edf4' },
  webView: { flex: 1, backgroundColor: 'transparent' },
});

export default PublicPrintScreen;
