import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  Linking,
  Dimensions
} from 'react-native';
import { api } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HEALTH_PACKAGES = [
  { id: 'PKG-FIT', name: 'Sana Fit Active', price: 699, originalPrice: 999 },
  { id: 'PKG-WOMEN', name: 'Sana Women Premium', price: 1899, originalPrice: 2999 },
  { id: 'PKG-SENIOR', name: 'Sana Senior Citizen', price: 1399, originalPrice: 2299 },
];

const DEFAULT_TESTS = [
  { testName: 'SGOT-SGPT', price: 250, category: 'Biochemistry' },
  { testName: '(C.B.C.) COMPLETE BLOOD COUNT', price: 200, category: 'Hematology' },
  { testName: '(CRP) C-REACTIVE PROTEIN', price: 250, category: 'Clinical Pathology' },
  { testName: '(K.F.T.) KIDNEY FUNCTION TEST', price: 500, category: 'Biochemistry' },
];

const HEALTH_TIPS = [
  { title: 'Stay Hydrated', desc: 'Drink 8-10 glasses of water daily for accurate blood test results.' },
  { title: 'Fasting Matters', desc: 'Most blood tests require 8-12 hrs fasting. Only plain water is allowed.' },
  { title: 'Avoid Heat', desc: 'Keep sample cool. High temperatures can alter certain test parameters.' },
  { title: 'Deep Breathe', desc: 'Stress can elevate cortisol & BP. Stay relaxed before sample collection.' },
  { title: 'Medication Alert', desc: 'Inform your doctor about all medications before tests — some affect results.' },
  { title: 'Timing is Key', desc: 'Morning samples are preferred for accurate hormonal and metabolic profiles.' },
];

const FAQS = [
  { q: 'How long does it take to get reports?', a: 'Most routine tests take 6-12 hours.' },
  { q: 'Can I get a printed copy of my report?', a: 'Yes, physical copies are available at our lab.' },
  { q: 'What should I bring for sample collection?', a: 'Bring a valid ID and doctor prescription if available.' },
  { q: 'Are the reports verified?', a: 'Yes, all reports are digitally signed by a registered MD Pathologist.' },
  { q: 'How is my data protected?', a: 'We use secure servers and encryption to keep your medical records safe.' },
  { q: 'Can I get samples collected at home?', a: 'Yes, we offer free home collection.' },
];

const ReportLookupScreen = ({ route, navigation }) => {
  const initialSearchVal = route?.params?.searchVal || '';
  const initialSearchType = route?.params?.searchType || 'mobile';

  const [searchTab, setSearchTab] = useState(initialSearchType);
  const [mobile, setMobile] = useState(initialSearchType === 'mobile' ? initialSearchVal : '');
  const [reportNo, setReportNo] = useState(initialSearchType === 'report' ? initialSearchVal : '');
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (initialSearchVal) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (searchTab === 'mobile' && !mobile) {
      Alert.alert('Error', 'Enter Mobile number');
      return;
    }
    if (searchTab === 'report' && !reportNo) {
      Alert.alert('Error', 'Enter Report number');
      return;
    }
    
    setLoading(true);
    setSearched(true);
    setReports([]);

    try {
      let data;
      if (searchTab === 'report') {
        data = await api.get(`/public/report-lookup?reportNumber=${encodeURIComponent(reportNo.trim())}`);
      } else {
        data = await api.get(`/public/report-lookup?mobile=${encodeURIComponent(mobile.trim())}`);
      }
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Search Error:', err);
      setReports([]);
    }
    setLoading(false);
  };

  const groupByCategory = (results) => {
    const groups = {};
    if (!results) return groups;
    results.forEach(r => {
      const cat = r.test?.category?.name || r.test?.testName || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(r);
    });
    return groups;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitles}>
          <Text style={styles.brandTitle}>SANA PATHOLOGY</Text>
          <Text style={styles.brandSub}>Patient Report Portal</Text>
        </View>
      </View>

      {/* ── SEARCH CARD ── */}
      <View style={styles.searchSection}>
        <View style={styles.searchCard}>
          <View style={styles.searchCardHeader}>
            <Text style={styles.searchCardIcon}>📄</Text>
            <View>
              <Text style={styles.searchCardTitle}>Check Your Test Report</Text>
              <Text style={styles.searchCardSub}>Enter your registered mobile number or report number to instantly access NABL verified laboratory reports.</Text>
            </View>
          </View>

          <View style={styles.tabsRow}>
            <TouchableOpacity style={[styles.tab, searchTab === 'mobile' && styles.tabActive]} onPress={() => {setSearchTab('mobile'); setReportNo('');}}>
              <Text style={[styles.tabText, searchTab === 'mobile' && styles.tabTextActive]}>📱 Mobile Number</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, searchTab === 'report' && styles.tabActive]} onPress={() => {setSearchTab('report'); setMobile('');}}>
              <Text style={[styles.tabText, searchTab === 'report' && styles.tabTextActive]}>🔢 Report Number</Text>
            </TouchableOpacity>
          </View>

          <TextInput 
            style={styles.input} 
            placeholder={searchTab === 'mobile' ? 'Enter 10-digit number' : 'e.g. SPL-0001'}
            placeholderTextColor="#94a3b8"
            keyboardType={searchTab === 'mobile' ? 'phone-pad' : 'default'}
            value={searchTab === 'mobile' ? mobile : reportNo}
            onChangeText={v => searchTab === 'mobile' ? setMobile(v) : setReportNo(v)}
          />

          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>Search Report</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── HEALTH TIPS SCROLLER ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipsScroll} contentContainerStyle={styles.tipsContent}>
        {HEALTH_TIPS.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 {tip.title}</Text>
            <Text style={styles.tipDesc}>{tip.desc}</Text>
          </View>
        ))}
      </ScrollView>

      {/* ── RESULTS AREA ── */}
      {searched && !loading && reports.length === 0 && (
        <View style={styles.noResultsBox}>
          <Text style={styles.noResultsIcon}>📄</Text>
          <Text style={styles.noResultsTitle}>No Reports Found</Text>
          <Text style={styles.noResultsSub}>Please verify the mobile number or report ID and try again.</Text>
        </View>
      )}

      {reports.length > 0 && (
        <View style={styles.resultsArea}>
          <View style={styles.verifiedBadgeRow}>
            <Text style={styles.verifiedCheck}>✓</Text>
            <Text style={styles.verifiedText}>{reports.length} Verified Lab Report{reports.length > 1 ? 's' : ''} Found</Text>
          </View>

          {reports.map((report) => {
            const groups = groupByCategory(report.results);
            const isReady = report.status === 'COMPLETED' || report.status === 'DELIVERED';
            
            return (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportCardTop}>
                  <Text style={styles.reportIdBig}>{report.reportNumber || report.reportId || `RPT-${report.id}`}</Text>
                  <View style={[styles.statusPill, isReady ? styles.statusPillReady : styles.statusPillPending]}>
                    <Text style={[styles.statusPillText, isReady ? styles.statusTextReady : styles.statusTextPending]}>
                      {isReady ? 'Ready' : 'Processing'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.reportMetaLine}>
                  👤 {report.patient?.fullName || report.patientName || 'Unknown Patient'}  •  📅 {new Date(report.createdAt || report.reportDate || Date.now()).toLocaleDateString('en-IN')}  •  🩺 Dr. {report.doctor?.name || 'Self Referral'}
                </Text>

                {isReady && (
                  <View style={styles.reportDetailsBody}>
                    <View style={styles.patientGrid}>
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Patient Name</Text>
                        <Text style={styles.gridVal}>{report.patient?.fullName || report.patientName}</Text>
                      </View>
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Age / Gender</Text>
                        <Text style={styles.gridVal}>{report.patient?.age || '--'} {report.patient?.ageType || 'Years'} / {report.patient?.gender || '--'}</Text>
                      </View>
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Report Date</Text>
                        <Text style={styles.gridVal}>{new Date(report.createdAt || report.reportDate || Date.now()).toLocaleDateString('en-IN')}</Text>
                      </View>
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Referred By</Text>
                        <Text style={styles.gridVal}>Dr. {report.doctor?.name || 'Self Referral'}</Text>
                      </View>
                    </View>

                    {Object.entries(groups).map(([cat, resultsArr]) => (
                      <View key={cat} style={styles.catGroup}>
                        <Text style={styles.catTitle}>{cat}</Text>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.th, { flex: 2 }]}>Investigation</Text>
                          <Text style={[styles.th, { flex: 1.5 }]}>Observed</Text>
                          <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Ind</Text>
                          <Text style={[styles.th, { flex: 1 }]}>Unit</Text>
                          <Text style={[styles.th, { flex: 1.5 }]}>Ref. Int.</Text>
                        </View>
                        {resultsArr.map((res, ridx) => {
                          const isHigh = res.indicator === 'HIGH';
                          const isLow = res.indicator === 'LOW';
                          const isAbnormal = isHigh || isLow || res.isAbnormal;
                          
                          return (
                            <View key={ridx} style={styles.tr}>
                              <Text style={[styles.td, { flex: 2, fontWeight: '700', color: '#1e293b' }]}>{res.test?.testName || res.parameterName || res.testName}</Text>
                              <Text style={[styles.td, { flex: 1.5, fontWeight: isAbnormal ? '900' : '600', color: isAbnormal ? (isHigh ? '#dc2626' : '#2563eb') : '#334155' }]}>
                                {res.observedValue || res.resultValue}
                              </Text>
                              <View style={{ flex: 1, alignItems: 'center' }}>
                                {res.indicator ? (
                                  <View style={[styles.indBadge, isHigh ? styles.indHigh : (isLow ? styles.indLow : styles.indNormal)]}>
                                    <Text style={[styles.indText, isHigh ? styles.indTextHigh : (isLow ? styles.indTextLow : styles.indTextNormal)]}>{res.indicator}</Text>
                                  </View>
                                ) : <Text style={styles.td}>-</Text>}
                              </View>
                              <Text style={[styles.td, { flex: 1, fontSize: 10 }]}>{res.unit || '-'}</Text>
                              <Text style={[styles.td, { flex: 1.5, fontSize: 10 }]}>{res.referenceInterval || res.normalRange || '-'}</Text>
                            </View>
                          );
                        })}
                      </View>
                    ))}

                    <View style={styles.verifiedFooter}>
                      <Text style={styles.verifiedFooterTitle}>Verified Result</Text>
                      <Text style={styles.verifiedFooterSub}>Signed & approved by registered Pathologist under NABL guidelines.</Text>
                    </View>

                    <TouchableOpacity style={styles.printBtn} onPress={() => navigation.navigate('PublicPrint', { reportData: report })}>
                      <Text style={styles.printBtnText}>📄 Print Verified Report</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* ── TRUST & STATS ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitleCenter}>Trusted by Thousands</Text>
        <Text style={styles.sectionSubCenter}>Our commitment to quality and accuracy</Text>
        <View style={styles.statsGrid}>
          {[
            { val: '15,234+', lbl: 'Tests Processed' },
            { val: '8,920+', lbl: 'Happy Patients' },
            { val: '12+', lbl: 'Years Experience' },
            { val: '3', lbl: 'NABL Accreditations' },
          ].map((s, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── POPULAR PACKAGES & TESTS ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Popular Health Packages</Text>
            <Text style={styles.sectionSub}>Comprehensive screening at affordable prices</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('PublicWelcome')}><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.packagesScroll} contentContainerStyle={styles.packagesContent}>
          {HEALTH_PACKAGES.map((pkg, i) => (
            <View key={i} style={styles.pkgCard}>
              <View style={styles.pkgBadge}><Text style={styles.pkgBadgeText}>PACKAGE</Text></View>
              <Text style={styles.pkgName}>{pkg.name}</Text>
              <View style={styles.pkgPriceRow}>
                <Text style={styles.pkgPrice}>₹{pkg.price}</Text>
                <Text style={styles.pkgOrigPrice}>₹{pkg.originalPrice}</Text>
              </View>
              <TouchableOpacity style={styles.pkgBtn} onPress={() => navigation.navigate('PublicWelcome')}><Text style={styles.pkgBtnText}>Book Now</Text></TouchableOpacity>
            </View>
          ))}
          {DEFAULT_TESTS.map((test, i) => (
            <View key={`test-${i}`} style={styles.pkgCard}>
              <Text style={styles.testCatText}>{test.category}</Text>
              <Text style={styles.pkgName} numberOfLines={2}>{test.testName}</Text>
              <View style={styles.pkgPriceRow}>
                <Text style={styles.pkgPrice}>₹{test.price}</Text>
              </View>
              <TouchableOpacity style={styles.pkgBtn} onPress={() => navigation.navigate('PublicWelcome')}><Text style={styles.pkgBtnText}>Book Now</Text></TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── ACCREDITATIONS ── */}
      <View style={styles.sectionAlt}>
        <Text style={styles.sectionTitleCenter}>Our Accreditations & Certifications</Text>
        <Text style={styles.sectionSubCenter}>We maintain the highest standards of quality and accuracy</Text>
        <View style={styles.certList}>
          {[
            { t: 'NABL Accredited', d: 'National Accreditation Board for Testing and Calibration Laboratories' },
            { t: 'ISO 15189:2022', d: 'Medical laboratories — Requirements for quality and competence' },
            { t: 'Certified Pathologists', d: 'All reports verified by experienced medical professionals' },
            { t: 'Patient Confidentiality', d: 'Your data is encrypted, secure, and fully confidential' }
          ].map((c, i) => (
            <View key={i} style={styles.certItem}>
              <Text style={styles.certCheck}>✓</Text>
              <View>
                <Text style={styles.certTitle}>{c.t}</Text>
                <Text style={styles.certDesc}>{c.d}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── BOOK CTA ── */}
      <View style={styles.ctaBox}>
        <Text style={styles.ctaTitle}>Need a Health Checkup?</Text>
        <Text style={styles.ctaSub}>Book your appointment online — free home collection available.</Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('PublicWelcome')}>
          <Text style={styles.ctaBtnText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>

      {/* ── FAQ ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitleCenter}>Frequently Asked Questions</Text>
        <Text style={styles.sectionSubCenter}>Everything you need to know about your lab reports</Text>
        <View style={styles.faqContainer}>
          {FAQS.map((f, i) => (
            <View key={i} style={styles.faqItem}>
              <TouchableOpacity style={styles.faqHead} onPress={() => setOpenFaq(openFaq === i ? null : i)}>
                <Text style={styles.faqQ}>{f.q}</Text>
                <Text style={styles.faqArrow}>{openFaq === i ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {openFaq === i && (
                <View style={styles.faqBody}>
                  <Text style={styles.faqA}>{f.a}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* ── FOOTER ── */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>Sana Pathology</Text>
        <Text style={styles.footerDesc}>NABL accredited diagnostic laboratory providing accurate and reliable pathology services since 2014.</Text>
        
        <Text style={styles.footerHead}>Quick Links</Text>
        <View style={styles.footerLinksRow}>
          <Text style={styles.footerLink} onPress={() => navigation.navigate('PublicWelcome')}>Home</Text>
          <Text style={styles.footerLink} onPress={() => navigation.navigate('PublicWelcome')}>Book Appointment</Text>
          <Text style={styles.footerLink} onPress={() => Linking.openURL('https://wa.me/916396786939')}>WhatsApp</Text>
        </View>

        <Text style={styles.footerHead}>Contact</Text>
        <Text style={styles.footerText}>📞 6396786939</Text>
        <Text style={styles.footerText}>✉️ support@sanapathology.com</Text>
        <Text style={styles.footerText}>📍 Hayat Nagar, Sambhal</Text>

        <Text style={styles.footerHead}>Working Hours</Text>
        <Text style={styles.footerText}>Mon – Sat: 7:00 AM – 8:00 PM</Text>
        <Text style={styles.footerText}>Sun: 8:00 AM – 2:00 PM</Text>
        <View style={styles.openBadge}><Text style={styles.openBadgeText}>Open Today</Text></View>

        <Text style={styles.copyright}>© 2026 Sana Pathology Lab. All rights reserved.</Text>
      </View>

    </ScrollView>
  );
};

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const TEAL = '#085041';
const GOLD = '#F1C40F';
const WHITE = '#ffffff';
const SLATE_50 = '#f8fafc';
const SLATE_100 = '#f1f5f9';
const SLATE_200 = '#e2e8f0';
const SLATE_300 = '#cbd5e1';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const SLATE_700 = '#334155';
const SLATE_800 = '#1e293b';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SLATE_50 },
  content: { paddingBottom: 0 },
  
  // Header
  header: { backgroundColor: TEAL, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', marginBottom: 20 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backBtnText: { color: WHITE, fontSize: 12, fontWeight: '700' },
  headerTitles: { alignItems: 'flex-start' },
  brandTitle: { fontSize: 24, fontWeight: '900', color: WHITE },
  brandSub: { fontSize: 11, color: GOLD, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 },

  // Search Card
  searchSection: { paddingHorizontal: 16, marginTop: -40, marginBottom: 24, zIndex: 10 },
  searchCard: { backgroundColor: WHITE, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6, borderWidth: 1, borderColor: SLATE_100 },
  searchCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  searchCardIcon: { fontSize: 28, backgroundColor: '#ecfdf5', padding: 8, borderRadius: 12 },
  searchCardTitle: { fontSize: 18, fontWeight: '900', color: SLATE_800 },
  searchCardSub: { fontSize: 11, color: SLATE_500, marginTop: 2, paddingRight: 40, lineHeight: 16 },
  tabsRow: { flexDirection: 'row', backgroundColor: SLATE_100, borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: WHITE, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 12, fontWeight: '700', color: SLATE_500 },
  tabTextActive: { color: TEAL },
  input: { borderWidth: 1.5, borderColor: SLATE_200, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontWeight: '600', color: SLATE_800, marginBottom: 16, backgroundColor: SLATE_50 },
  searchBtn: { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  searchBtnText: { color: WHITE, fontSize: 16, fontWeight: '800' },

  // Tips Scroller
  tipsScroll: { marginBottom: 30 },
  tipsContent: { paddingHorizontal: 16, gap: 12 },
  tipCard: { width: 220, backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fef3c7', borderRadius: 16, padding: 14 },
  tipTitle: { fontSize: 13, fontWeight: '800', color: '#92400e', marginBottom: 4 },
  tipDesc: { fontSize: 11, color: '#b45309', lineHeight: 16 },

  // Results Area
  resultsArea: { paddingHorizontal: 16, marginBottom: 30 },
  verifiedBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ecfdf5', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#d1fae5', marginBottom: 16 },
  verifiedCheck: { color: '#10b981', fontSize: 14, fontWeight: '900' },
  verifiedText: { fontSize: 13, fontWeight: '800', color: '#065f46' },
  reportCard: { backgroundColor: WHITE, borderRadius: 24, borderWidth: 1, borderColor: SLATE_200, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  reportCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderLeftWidth: 4, borderLeftColor: TEAL },
  reportIdBig: { fontSize: 18, fontWeight: '900', color: SLATE_800 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  statusPillReady: { backgroundColor: '#d1fae5', borderColor: '#a7f3d0' },
  statusPillPending: { backgroundColor: '#fef3c7', borderColor: '#fde68a' },
  statusPillText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  statusTextReady: { color: '#065f46' },
  statusTextPending: { color: '#92400e' },
  reportMetaLine: { fontSize: 11, color: SLATE_500, fontWeight: '600', paddingHorizontal: 20, paddingBottom: 16 },
  reportDetailsBody: { borderTopWidth: 1, borderTopColor: SLATE_100 },
  patientGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#f0fdf4', padding: 16, borderBottomWidth: 1, borderBottomColor: SLATE_100 },
  gridItem: { width: '50%', marginBottom: 12 },
  gridLabel: { fontSize: 9, fontWeight: '800', color: SLATE_400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  gridVal: { fontSize: 13, fontWeight: '700', color: SLATE_700 },
  catGroup: { padding: 16, borderBottomWidth: 1, borderBottomColor: SLATE_100 },
  catTitle: { fontSize: 12, fontWeight: '900', color: TEAL, textTransform: 'uppercase', marginBottom: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: SLATE_50, padding: 8, borderRadius: 8, marginBottom: 8 },
  th: { fontSize: 10, fontWeight: '800', color: SLATE_500, textTransform: 'uppercase' },
  tr: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: SLATE_50, alignItems: 'center' },
  td: { fontSize: 12, color: SLATE_700 },
  indBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  indHigh: { backgroundColor: '#fee2e2' },
  indLow: { backgroundColor: '#dbeafe' },
  indNormal: { backgroundColor: 'transparent' },
  indText: { fontSize: 9, fontWeight: '800' },
  indTextHigh: { color: '#dc2626' },
  indTextLow: { color: '#2563eb' },
  indTextNormal: { color: SLATE_400 },
  verifiedFooter: { padding: 16, backgroundColor: '#f8fafc', alignItems: 'center' },
  verifiedFooterTitle: { fontSize: 13, fontWeight: '800', color: TEAL, marginBottom: 2 },
  verifiedFooterSub: { fontSize: 10, color: SLATE_500, textAlign: 'center' },
  printBtn: { backgroundColor: TEAL, margin: 16, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  printBtnText: { color: WHITE, fontSize: 14, fontWeight: '800' },

  noResultsBox: { alignItems: 'center', backgroundColor: WHITE, padding: 30, borderRadius: 20, marginHorizontal: 16, borderWidth: 1, borderColor: SLATE_200, marginBottom: 30 },
  noResultsIcon: { fontSize: 36, marginBottom: 10 },
  noResultsTitle: { fontSize: 16, fontWeight: '800', color: SLATE_800, marginBottom: 4 },
  noResultsSub: { fontSize: 12, color: SLATE_500, textAlign: 'center' },

  // Sections
  section: { paddingHorizontal: 16, paddingVertical: 30, backgroundColor: WHITE },
  sectionAlt: { paddingHorizontal: 16, paddingVertical: 30, backgroundColor: SLATE_50 },
  sectionTitleCenter: { fontSize: 24, fontWeight: '900', color: TEAL, textAlign: 'center', marginBottom: 4 },
  sectionSubCenter: { fontSize: 13, color: SLATE_500, textAlign: 'center', marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: SLATE_800 },
  sectionSub: { fontSize: 12, color: SLATE_500, marginTop: 2 },
  viewAllText: { fontSize: 13, fontWeight: '700', color: TEAL },

  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statBox: { width: (SCREEN_WIDTH - 44) / 2, backgroundColor: SLATE_50, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: SLATE_100, alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '900', color: TEAL, marginBottom: 2 },
  statLbl: { fontSize: 11, fontWeight: '600', color: SLATE_500 },

  // Packages Scroller
  packagesScroll: { marginHorizontal: -16 },
  packagesContent: { paddingHorizontal: 16, gap: 12 },
  pkgCard: { width: 220, backgroundColor: SLATE_50, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: SLATE_200 },
  pkgBadge: { alignSelf: 'flex-start', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  pkgBadgeText: { fontSize: 9, fontWeight: '800', color: '#166534' },
  testCatText: { fontSize: 10, fontWeight: '800', color: TEAL, marginBottom: 6, textTransform: 'uppercase' },
  pkgName: { fontSize: 14, fontWeight: '800', color: SLATE_800, marginBottom: 12, minHeight: 40 },
  pkgPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 16 },
  pkgPrice: { fontSize: 20, fontWeight: '900', color: TEAL },
  pkgOrigPrice: { fontSize: 12, color: SLATE_400, textDecorationLine: 'line-through' },
  pkgBtn: { backgroundColor: WHITE, borderWidth: 1.5, borderColor: TEAL, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  pkgBtnText: { color: TEAL, fontSize: 13, fontWeight: '800' },

  // Certifications
  certList: { gap: 12 },
  certItem: { flexDirection: 'row', gap: 12, backgroundColor: WHITE, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: SLATE_200 },
  certCheck: { fontSize: 16, color: '#10b981', fontWeight: '900' },
  certTitle: { fontSize: 14, fontWeight: '800', color: SLATE_800, marginBottom: 2 },
  certDesc: { fontSize: 11, color: SLATE_500, lineHeight: 16, paddingRight: 20 },

  // CTA
  ctaBox: { backgroundColor: '#fef3c7', padding: 24, marginHorizontal: 16, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  ctaTitle: { fontSize: 20, fontWeight: '900', color: '#92400e', marginBottom: 4 },
  ctaSub: { fontSize: 12, color: '#b45309', textAlign: 'center', marginBottom: 16 },
  ctaBtn: { backgroundColor: '#d97706', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  ctaBtnText: { color: WHITE, fontSize: 14, fontWeight: '800' },

  // FAQ
  faqContainer: { gap: 8 },
  faqItem: { backgroundColor: SLATE_50, borderRadius: 12, borderWidth: 1, borderColor: SLATE_200, overflow: 'hidden' },
  faqHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  faqQ: { fontSize: 13, fontWeight: '700', color: SLATE_800, flex: 1, paddingRight: 10 },
  faqArrow: { fontSize: 10, color: SLATE_400 },
  faqBody: { padding: 16, paddingTop: 0 },
  faqA: { fontSize: 12, color: SLATE_500, lineHeight: 18 },

  // Footer
  footer: { backgroundColor: '#1e293b', padding: 24, paddingTop: 40 },
  footerBrand: { fontSize: 20, fontWeight: '900', color: WHITE, marginBottom: 6 },
  footerDesc: { fontSize: 12, color: '#94a3b8', lineHeight: 18, marginBottom: 24 },
  footerHead: { fontSize: 13, fontWeight: '800', color: WHITE, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 10 },
  footerLinksRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  footerLink: { fontSize: 13, color: '#cbd5e1', fontWeight: '600' },
  footerText: { fontSize: 13, color: '#cbd5e1', marginBottom: 6 },
  openBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(16,185,129,0.2)', borderWidth: 1, borderColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 8, marginBottom: 24 },
  openBadgeText: { fontSize: 10, fontWeight: '800', color: '#34d399' },
  copyright: { fontSize: 11, color: '#64748b', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 16, marginTop: 10, textAlign: 'center' },
});

export default ReportLookupScreen;
