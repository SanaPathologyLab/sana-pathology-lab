import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';

const API_BASE = 'https://sana-pathology-backend.onrender.com/api';
const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('PATIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  
  const [rememberMe, setRememberMe] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const fillDemo = (type) => {
    if (type === 'STAFF') {
      setActiveTab('STAFF');
      setEmail('admin@sanapathology.com');
      setPassword('admin123');
    } else if (type === 'DOCTOR') {
      setActiveTab('DOCTOR');
      setDoctorId('DOC-0001');
      setMobileNumber('9876543210');
    } else {
      setActiveTab('PATIENT');
      setPatientId('SPL-0001');
      setMobileNumber('9876543210');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let endpoint, bodyData;
      if (activeTab === 'STAFF') {
        if (!email || !password) {
          Alert.alert('Required', 'Please enter email and password');
          setLoading(false);
          return;
        }
        endpoint = '/auth/login';
        bodyData = { email, password };
      } else if (activeTab === 'PATIENT') {
        if (!patientId || !mobileNumber) {
          Alert.alert('Required', 'Please enter Patient ID and Mobile Number');
          setLoading(false);
          return;
        }
        endpoint = '/auth/login/patient';
        bodyData = { mobileNumber, patientId };
      } else {
        if (!doctorId || !mobileNumber) {
          Alert.alert('Required', 'Please enter Doctor ID and Mobile Number');
          setLoading(false);
          return;
        }
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── TOP DARK BRANDING SECTION ── */}
        <View style={styles.darkSection}>
          <View style={styles.headerRow}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoEmoji}>🔬</Text>
            </View>
            <View>
              <Text style={styles.brandName}>Sana Pathology</Text>
              <Text style={styles.brandSub}>DIAGNOSTIC PORTAL</Text>
            </View>
          </View>

          <View style={styles.nablBadge}>
            <Text style={styles.nablIcon}>✓</Text>
            <Text style={styles.nablText}>NABL ACCREDITED</Text>
          </View>

          <Text style={styles.heroTitle}>
            Clinical Quality{'\n'}
            <Text style={styles.heroTitleAccent}>At Your Fingertips</Text>
          </Text>

          <Text style={styles.heroDesc}>
            Securely login to download certified laboratory reports, manage patient test histories, and track sample collection status in real-time.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconRow}>
                <Text style={styles.statIcon}>🏅</Text>
                <Text style={styles.statTitle}>ACCREDITED</Text>
              </View>
              <Text style={styles.statVal}>100%</Text>
              <Text style={styles.statSub}>NABL Quality Standards</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconRow}>
                <Text style={styles.statIcon}>⏱</Text>
                <Text style={styles.statTitle}>TAT SPEED</Text>
              </View>
              <Text style={styles.statVal}>6-12 Hrs</Text>
              <Text style={styles.statSub}>Report turnaround time</Text>
            </View>
          </View>

          <View style={styles.checkList}>
            <View style={styles.checkItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.checkText}>Multi-level pathologist verification checks</Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.checkText}>Full confidentiality and secure report archiving</Text>
            </View>
          </View>
        </View>

        {/* ── BOTTOM LIGHT LOGIN SECTION ── */}
        <View style={styles.lightSection}>
          
          <View style={styles.labStatusRow}>
            <View style={styles.statusLeft}>
              <Text style={styles.statusPulse}>⚡</Text>
              <Text style={styles.statusTextLeft}>Lab Status: <Text style={styles.statusBold}>OPEN & PROCESSING</Text></Text>
            </View>
            <Text style={styles.statusTextRight}>• TAT: Normal (6-12h)</Text>
          </View>

          <View style={styles.loginCard}>
            <View style={styles.greetingHeader}>
              <Text style={styles.greetingTitle}>{greeting}</Text>
              <Text style={styles.greetingSub}>Access your diagnostic report dashboard</Text>
            </View>

            {/* Segmented Tabs */}
            <View style={styles.tabsContainer}>
              {[
                { id: 'PATIENT', label: 'PATIENT', icon: '👤' },
                { id: 'DOCTOR', label: 'DOCTOR', icon: '🩺' },
                { id: 'STAFF', label: 'STAFF', icon: '🏢' }
              ].map(tab => (
                <TouchableOpacity 
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.tabIcon, activeTab === tab.id && styles.tabIconActive]}>{tab.icon}</Text>
                  <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Forms */}
            {activeTab === 'STAFF' ? (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>STAFF EMAIL / ID</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputPrefix}>✉</Text>
                  <TextInput style={styles.input} placeholder="admin@sanapathology.com" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} autoCapitalize="none" />
                </View>
                
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputPrefix}>🔑</Text>
                  <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor="#94a3b8" value={password} onChangeText={setPassword} secureTextEntry />
                </View>
              </View>
            ) : activeTab === 'PATIENT' ? (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>PATIENT ID (E.G. SPL-0001)</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputPrefix}>👤</Text>
                  <TextInput style={styles.input} placeholder="e.g. SPL-0001" placeholderTextColor="#94a3b8" value={patientId} onChangeText={setPatientId} autoCapitalize="characters" />
                </View>

                <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputPrefix}>📞</Text>
                  <TextInput style={styles.input} placeholder="Enter 10-digit number" placeholderTextColor="#94a3b8" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
                </View>
              </View>
            ) : (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>DOCTOR ID (E.G. DOC-0001)</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputPrefix}>🩺</Text>
                  <TextInput style={styles.input} placeholder="e.g. DOC-0001" placeholderTextColor="#94a3b8" value={doctorId} onChangeText={setDoctorId} autoCapitalize="characters" />
                </View>

                <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputPrefix}>📞</Text>
                  <TextInput style={styles.input} placeholder="Enter 10-digit number" placeholderTextColor="#94a3b8" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
                </View>
              </View>
            )}

            {/* Remember Me */}
            <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Remember my credentials</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Secure Sign In</Text>}
            </TouchableOpacity>

            {/* Quick Demo */}
            <View style={styles.demoContainer}>
              <TouchableOpacity style={styles.demoHeader} onPress={() => setShowDemo(!showDemo)}>
                <Text style={styles.demoIcon}>⚡</Text>
                <Text style={styles.demoTitle}>Quick Demo Access (Test Drive)</Text>
                <Text style={styles.demoCaret}>{showDemo ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showDemo && (
                <View style={styles.demoBody}>
                  <TouchableOpacity style={styles.demoBtn} onPress={() => fillDemo('PATIENT')}><Text style={styles.demoBtnText}>Fill Patient Demo</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.demoBtn} onPress={() => fillDemo('DOCTOR')}><Text style={styles.demoBtnText}>Fill Doctor Demo</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.demoBtn} onPress={() => fillDemo('STAFF')}><Text style={styles.demoBtnText}>Fill Staff Demo</Text></TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot ID / Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            {activeTab === 'PATIENT' && (
              <TouchableOpacity style={styles.footerLinkWrap}>
                <Text style={styles.footerLink}>How do I get my patient ID?</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.footerLinkWrap} onPress={() => navigation.navigate('PublicWelcome')}>
              <Text style={styles.footerLink}>← Back to Public Lab Site</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkWrap}>
              <Text style={styles.footerLink}>Portal Helpline Support</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const TEAL_DARK = '#083F34';
const TEAL = '#085041';
const GOLD = '#F1C40F';
const WHITE = '#ffffff';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4fbf8' },
  scrollContent: { paddingBottom: 40 },
  
  /* ── DARK SECTION ── */
  darkSection: {
    backgroundColor: TEAL_DARK,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  logoWrap: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 22 },
  brandName: { fontSize: 20, fontWeight: '900', color: WHITE },
  brandSub: { fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 1.5, marginTop: 2 },
  
  nablBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  nablIcon: { color: GOLD, fontSize: 12, fontWeight: '900' },
  nablText: { color: GOLD, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  
  heroTitle: { fontSize: 32, fontWeight: '900', color: WHITE, lineHeight: 40, marginBottom: 12 },
  heroTitleAccent: { color: GOLD },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20, marginBottom: 24 },
  
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  statIcon: { fontSize: 14 },
  statTitle: { fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 0.5 },
  statVal: { fontSize: 24, fontWeight: '900', color: WHITE, marginBottom: 2 },
  statSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  
  checkList: { gap: 8 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkIcon: { color: GOLD, fontSize: 12, fontWeight: '900' },
  checkText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', flex: 1 },

  /* ── LIGHT SECTION ── */
  lightSection: {
    paddingHorizontal: 16,
    marginTop: -20,
  },
  
  labStatusRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#ecfdf5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, 
    marginBottom: 16, borderWidth: 1, borderColor: '#d1fae5' 
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusPulse: { fontSize: 14, color: '#10b981' },
  statusTextLeft: { fontSize: 11, color: '#065f46' },
  statusBold: { fontWeight: '800' },
  statusTextRight: { fontSize: 10, color: '#047857', fontWeight: '600' },

  loginCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 5,
    borderWidth: 1, borderColor: '#f1f5f9',
    marginBottom: 24,
  },
  
  greetingHeader: { alignItems: 'center', marginBottom: 24 },
  greetingTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b', marginBottom: 4 },
  greetingSub: { fontSize: 13, color: '#64748b' },

  tabsContainer: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 16, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive: { backgroundColor: WHITE, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabIcon: { fontSize: 14, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabText: { fontSize: 11, fontWeight: '800', color: '#94a3b8' },
  tabTextActive: { color: TEAL },

  formGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: '#64748b', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, marginBottom: 16 },
  inputPrefix: { fontSize: 16, color: '#94a3b8', marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 14, color: '#1e293b', fontWeight: '600' },

  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24, marginLeft: 4 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE },
  checkboxActive: { backgroundColor: TEAL, borderColor: TEAL },
  checkboxTick: { color: WHITE, fontSize: 11, fontWeight: '900' },
  rememberText: { fontSize: 13, color: '#475569', fontWeight: '500' },

  submitBtn: { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  submitBtnText: { color: WHITE, fontSize: 16, fontWeight: '800' },

  demoContainer: { backgroundColor: '#fffbeb', borderRadius: 14, borderWidth: 1, borderColor: '#fde68a', overflow: 'hidden', marginBottom: 20 },
  demoHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  demoIcon: { fontSize: 16, marginRight: 8 },
  demoTitle: { flex: 1, fontSize: 13, fontWeight: '800', color: '#92400e' },
  demoCaret: { fontSize: 10, color: '#b45309' },
  demoBody: { padding: 14, borderTopWidth: 1, borderTopColor: '#fde68a', gap: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  demoBtn: { backgroundColor: 'rgba(180,83,9,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  demoBtnText: { fontSize: 11, fontWeight: '700', color: '#92400e' },

  forgotBtn: { alignItems: 'center', paddingVertical: 8 },
  forgotText: { fontSize: 13, fontWeight: '700', color: TEAL },

  footerLinks: { alignItems: 'center', gap: 16, marginBottom: 20 },
  footerLinkWrap: {},
  footerLink: { fontSize: 13, fontWeight: '600', color: TEAL_DARK, textDecorationLine: 'underline' },
});

export default LoginScreen;
