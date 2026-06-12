import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Linking,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { publicApi } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE = 'https://sana-pathology-backend.onrender.com/api';

const HEALTH_PACKAGES = [
  {
    id: 'PKG-FIT',
    code: 'PKG-FIT',
    name: 'Sana Fit Active',
    subtitle: 'Basic Health',
    price: 699,
    originalPrice: 999,
    tests: ['Complete Blood Count (CBC)', 'Fasting Blood Sugar', 'Lipid Profile', 'Urine Routine'],
    badge: 'Popular',
    badgeColor: '#1d4ed8',
    badgeBg: '#eff6ff',
    desc: 'Ideal for routine wellness screening and baseline tracking.',
  },
  {
    id: 'PKG-WOMEN',
    code: 'PKG-WOMEN',
    name: 'Sana Women Premium',
    subtitle: 'Special Care',
    price: 1899,
    originalPrice: 2999,
    tests: ['CBC', 'Thyroid Profile', 'LFT', 'KFT', 'Vitamin D', 'Vitamin B12', 'Fasting Sugar'],
    badge: 'Best Value',
    badgeColor: '#9d174d',
    badgeBg: '#fdf2f8',
    desc: 'Comprehensive checkup tailored specifically for women health.',
  },
  {
    id: 'PKG-SENIOR',
    code: 'PKG-SENIOR',
    name: 'Sana Senior Citizen',
    subtitle: 'Elderly Care',
    price: 1399,
    originalPrice: 2299,
    tests: ['CBC', 'Blood Sugar Fasting', 'HbA1c', 'LFT', 'KFT', 'Lipid Profile', 'Urine Routine'],
    badge: 'Elderly Care',
    badgeColor: '#065f46',
    badgeBg: '#ecfdf5',
    desc: 'Recommended for annual evaluation for people aged 60+.',
  },
  {
    id: 'PKG-HEART',
    code: 'PKG-HEART',
    name: 'Sana Heart Health',
    subtitle: 'Cardiac Profile',
    price: 1199,
    originalPrice: 1799,
    tests: ['Lipid Profile', 'HbA1c', 'CBC', 'Blood Sugar', 'Uric Acid'],
    badge: 'Advanced',
    badgeColor: '#7c2d12',
    badgeBg: '#fff7ed',
    desc: 'Comprehensive risk assessment for cardiovascular diseases.',
  },
];

const DEFAULT_TESTS = [
  { id: 1, testCode: 'CBC', testName: '(C.B.C.) COMPLETE BLOOD COUNT', price: 200, sampleType: 'BLOOD', category: { name: 'Hematology' } },
  { id: 40, testCode: 'SGOT-SGPT', testName: 'SGOT-SGPT', price: 250, sampleType: 'Serum', category: { name: 'Biochemistry' } },
  { id: 30, testCode: 'CRP-01', testName: '(CRP) C-REACTIVE PROTEIN', price: 250, sampleType: 'Serum', category: { name: 'Clinical Pathology' } },
  { id: 11, testCode: 'KFT', testName: '(K.F.T.) KIDNEY FUNCTION TEST', price: 500, sampleType: 'SERUM', category: { name: 'Biochemistry' } },
  { id: 22, testCode: 'ANC-01', testName: 'ANTE-NATAL CARE (ANC) PROFILE', price: 1200, sampleType: 'Blood', category: { name: 'Clinical Pathology' } },
  { id: 23, testCode: 'BG', testName: 'BLOOD GROUP ABO & RH FACTOR', price: 50, sampleType: 'Blood', category: { name: 'Hematology' } },
  { id: 36, testCode: 'DENGUE-01', testName: 'DENGUE PROFILE (IgG & IgM & NS1)', price: 1200, sampleType: 'Serum', category: { name: 'Clinical Pathology' } },
  { id: 25, testCode: 'ESR-01', testName: 'ESR (Erythrocyte Sedimentation Rate)', price: 150, sampleType: 'Blood', category: { name: 'Hematology' } },
  { id: 7, testCode: 'HBA1C', testName: 'HbA1c (GLYCOSYLATED HAEMOGLOBIN)', price: 400, sampleType: 'EDTA BLOOD', category: { name: 'Biochemistry' } },
  { id: 18, testCode: 'HB-01', testName: 'Hemoglobin (Hb)', price: 100, sampleType: 'EDTA Blood', category: { name: 'Hematology' } },
  { id: 38, testCode: 'LIPID', testName: 'LIPID PROFILE', price: 650, sampleType: 'Serum', category: { name: 'Biochemistry' } },
  { id: 2, testCode: 'LFT', testName: 'LIVER FUNCTION TEST (LFT)', price: 500, sampleType: 'SERUM', category: { name: 'Biochemistry' } },
  { id: 26, testCode: 'MP', testName: 'MALARIA (MP) ELISA', price: 100, sampleType: 'Serum', category: { name: 'Immunology' } },
  { id: 44, testCode: 'URINE', testName: 'URINE EXAMINATION (ROUTINE & MICROSCOPY)', price: 150, sampleType: 'Urine', category: { name: 'Clinical Pathology' } },
  { id: 54, testCode: 'WIDAL', testName: 'WIDAL TEST', price: 50, sampleType: 'Blood', category: { name: 'Serology' } },
];

const FAQS = [
  { q: 'Do I need to fast before a blood test?', a: 'It depends on the test. Tests like Fasting Blood Sugar and Lipid Profile require 8-12 hours of fasting. Please check with our lab when booking.' },
  { q: 'Do you offer home sample collection?', a: 'Yes, we provide free home sample collection within city limits for bookings above ₹500. Our certified phlebotomists will visit at your preferred time.' },
  { q: 'How will I receive my reports?', a: 'You will receive a digital copy of your report via WhatsApp within the promised turnaround time. You can also use this app to download past reports.' },
  { q: 'What are the payment options?', a: 'We accept Cash, UPI (Google Pay, PhonePe, Paytm), and major Credit/Debit cards at our lab and during home collection.' },
  { q: 'What is your turnaround time for reports?', a: 'Most routine tests (CBC, Sugar, LFT, KFT) are delivered within 6-12 hours. Specialized tests may take up to 24 hours.' },
];

const TESTIMONIALS = [
  { name: 'Rahul Sharma', text: 'Very professional staff and timely reports. The home collection was seamless and painless.', initial: 'R', color: '#0ea5e9' },
  { name: 'Priya Patel', text: 'Highly accurate results. My doctor specifically recommended Sana Pathology for thyroid tests.', initial: 'P', color: '#ec4899' },
  { name: 'Amit Kumar', text: 'Excellent service. Received my reports on WhatsApp within 6 hours as promised. Very convenient!', initial: 'A', color: '#8b5cf6' },
];

const STATUS_MAP = {
  SCHEDULED: { label: '⏳ Pending Confirmation', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  CONFIRMED: { label: '✓ Confirmed', bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  COMPLETED: { label: '✓ Sample Collected', bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  CANCELLED: { label: '❌ Cancelled', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
};

const PublicWelcomeScreen = ({ navigation }) => {
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);

  // Search card (3-tab: mobile, report, track)
  const [searchTab, setSearchTab] = useState('mobile');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [trackResults, setTrackResults] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Test explorer
  const [testSearch, setTestSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Selection (tests + packages combined)
  const [selectedItems, setSelectedItems] = useState([]);

  // Booking form
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    mobile: '',
    gender: 'MALE',
    address: 'Lab Visit',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: '08:00',
    notes: '',
    isHomeCollection: false,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // FAQ
  const [openFaq, setOpenFaq] = useState(null);

  // Header nav scroll
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoadingTests(true);
    try {
      const data = await publicApi.get('/public/tests');
      if (Array.isArray(data) && data.length > 0) {
        setTests(data);
      } else {
        setTests(DEFAULT_TESTS);
      }
    } catch {
      setTests(DEFAULT_TESTS);
    }
    setLoadingTests(false);
  };

  const categories = ['All', ...new Set(tests.map(t => t.category?.name).filter(Boolean))];

  const filteredTests = tests.filter(t => {
    const matchesSearch =
      t.testName?.toLowerCase().includes(testSearch.toLowerCase()) ||
      t.testCode?.toLowerCase().includes(testSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getItemKey = (item, isPackage) => (isPackage ? item.code || item.id : item.testCode || item.id);

  const isItemSelected = (item, isPackage) => {
    const key = getItemKey(item, isPackage);
    return selectedItems.some(x => x.key === key);
  };

  const handleToggleItem = (item, isPackage = false) => {
    const key = getItemKey(item, isPackage);
    if (selectedItems.some(x => x.key === key)) {
      setSelectedItems(prev => prev.filter(x => x.key !== key));
    } else {
      setSelectedItems(prev => [
        ...prev,
        {
          key,
          name: item.testName || item.name,
          price: item.price,
          isPackage,
        },
      ]);
    }
  };

  const removeItem = key => setSelectedItems(prev => prev.filter(x => x.key !== key));
  const clearSelection = () => { setSelectedItems([]); setShowBookingForm(false); setBookingSuccessData(null); };

  const totalCost = selectedItems.reduce((s, i) => s + i.price, 0);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Required', 'Please enter a mobile number or report number.');
      return;
    }
    setSearchLoading(true);
    setTrackResults(null);
    setSearchError('');

    try {
      if (searchTab === 'mobile') {
        navigation.navigate('ReportLookup', { searchVal: searchQuery.trim(), searchType: 'mobile' });
      } else if (searchTab === 'report') {
        navigation.navigate('ReportLookup', { searchVal: searchQuery.trim(), searchType: 'report' });
      } else {
        // Track appointment
        const res = await fetch(
          `${API_BASE}/public/appointment-lookup?mobile=${encodeURIComponent(searchQuery.trim())}`
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTrackResults(data);
        } else {
          setSearchError('No collection requests found for this mobile number.');
        }
      }
    } catch {
      setSearchError('Failed to retrieve data. Please try again.');
    }
    setSearchLoading(false);
  };

  const handleBookingSubmit = async () => {
    if (!bookingForm.name || !bookingForm.mobile || !bookingForm.preferredDate) {
      Alert.alert('Required', 'Please fill in Name, Mobile, and Date.');
      return;
    }
    if (selectedItems.length === 0) {
      Alert.alert('No Tests Selected', 'Please select at least one test or health package first.');
      return;
    }

    setBookingLoading(true);
    try {
      const testListStr = selectedItems.map(x => `${x.name} (₹${x.price})`).join(', ');
      const body = {
        name: bookingForm.name,
        mobile: bookingForm.mobile,
        gender: bookingForm.gender,
        address: bookingForm.isHomeCollection ? bookingForm.address : 'Lab Visit',
        preferredDate: bookingForm.preferredDate,
        preferredTime: bookingForm.preferredTime,
        notes: `Requested via Mobile App. Tests/Packages: ${testListStr}. Mode: ${bookingForm.isHomeCollection ? 'Home Collection' : 'Lab Visit'}. ${bookingForm.notes}`,
      };

      const res = await publicApi.post('/public/book-appointment', body);
      if (res && res.appointment) {
        setBookingSuccessData(res.appointment);
        // Auto-trigger WhatsApp
        const msg = `*New Appointment Request (App)*\n\n*Name:* ${bookingForm.name}\n*Mobile:* ${bookingForm.mobile}\n*Date:* ${bookingForm.preferredDate} ${bookingForm.preferredTime}\n*Mode:* ${bookingForm.isHomeCollection ? 'Home Collection' : 'Lab Visit'}\n\n*Selected Tests/Packages:*\n${selectedItems.map(x => `- ${x.name} (₹${x.price})`).join('\n')}\n\n*Total Amount:* ₹${totalCost}`;
        Linking.openURL(`https://wa.me/916396786939?text=${encodeURIComponent(msg)}`);
      } else {
        Alert.alert('Error', 'Unable to process booking. Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Server error during booking.');
    }
    setBookingLoading(false);
  };

  const handleContactLabWhatsApp = (apt, testDetails, refId) => {
    const msg = `*Inquiry about Booking ${refId}*\n\n*Patient:* ${apt.patient?.fullName || bookingForm.name}\n*Date/Time:* ${new Date(apt.date).toLocaleDateString()} ${apt.time}\n*Status:* Pending Confirmation\n\n*Tests Requested:*\n${testDetails}`;
    Linking.openURL(`https://wa.me/916396786939?text=${encodeURIComponent(msg)}`);
  };

  const QUICK_LINKS = ['Packages', 'Find Test', 'Book', 'Reports', 'FAQ', 'Contact'];

  return (
    <ScrollView
      ref={scrollRef}
      style={S.root}
      contentContainerStyle={S.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor="#085041" />

      {/* ── TOP HEADER BAR ──────────────────────── */}
      <View style={S.topHeader}>
        <TouchableOpacity style={S.topLoginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={S.topLoginIcon}>🔐</Text>
          <View>
            <Text style={S.topLoginLabel}>Staff Login</Text>
            <Text style={S.topLoginSub}>Portal Access</Text>
          </View>
        </TouchableOpacity>
        <View style={S.topBrand}>
          <Text style={S.topBrandName}>Sana Pathology</Text>
          <Text style={S.topBrandSub}>🏥 Diagnostic Center</Text>
        </View>
      </View>

      {/* ── HERO ───────────────────────────────── */}
      <View style={S.hero}>
        {/* Decorative blobs */}
        <View style={S.blob1} />
        <View style={S.blob2} />

        <View style={S.heroInner}>
          <View style={S.heroBadge}>
            <Text style={S.heroBadgeStar}>✦</Text>
            <Text style={S.heroBadgeText}>NABL Standards • 100% Quality Assured</Text>
          </View>

          <Text style={S.heroTitle}>
            Trusted Pathology Lab{'\n'}
            <Text style={S.heroTitleAccent}>in Your City</Text>
          </Text>

          <Text style={S.heroSub}>
            Providing high-precision diagnostics, blood tests, and health packages with
            free home collection at your convenience.
          </Text>

          <View style={S.heroPills}>
            {[
              { icon: '✓', text: '15,000+ Patients' },
              { icon: '⏱', text: '6-12hr Turnaround' },
              { icon: '🏠', text: 'Free Home Collection' },
              { icon: '🏅', text: 'NABL Accredited' },
            ].map((p, i) => (
              <View key={i} style={S.heroPill}>
                <Text style={S.heroPillIcon}>{p.icon}</Text>
                <Text style={S.heroPillText}>{p.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── NAV QUICK LINKS ─────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={S.navBar}
        contentContainerStyle={S.navBarContent}
      >
        {QUICK_LINKS.map((lbl, i) => (
          <TouchableOpacity key={i} style={S.navChip}>
            <Text style={S.navChipText}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── SEARCH CARD ─────────────────────────── */}
      <View style={S.searchCard}>
        <View style={S.searchCardHeaderRow}>
          <View style={S.searchCardIcon}><Text style={S.searchCardIconText}>📄</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={S.searchCardTitle}>Check Reports & Track Bookings</Text>
            <Text style={S.searchCardSub}>Download PDFs or track your collection request status</Text>
          </View>
        </View>

        {/* 3 tabs */}
        <View style={S.tabRow}>
          {[
            { id: 'mobile', label: '📱 Mobile No' },
            { id: 'report', label: '📋 Report No' },
            { id: 'track', label: '📅 Track Request' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[S.tab, searchTab === tab.id && S.tabActive]}
              onPress={() => { setSearchTab(tab.id); setSearchQuery(''); setTrackResults(null); setSearchError(''); }}
            >
              <Text style={[S.tabText, searchTab === tab.id && S.tabTextActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={S.searchInput}
          placeholder={
            searchTab === 'mobile'
              ? 'Enter Mobile Number to check Reports...'
              : searchTab === 'report'
              ? 'e.g. RPT-000001'
              : 'Enter Mobile Number to track collection...'
          }
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardType={searchTab === 'report' ? 'default' : 'phone-pad'}
        />

        <TouchableOpacity style={S.searchBtn} onPress={handleSearch} disabled={searchLoading}>
          {searchLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={S.searchBtnText}>
              {searchTab === 'track' ? 'Track Status' : 'Find Report'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Error */}
        {searchError !== '' && (
          <View style={S.searchErrorBox}>
            <Text style={S.searchErrorText}>⚠ {searchError}</Text>
          </View>
        )}

        {/* Track results */}
        {trackResults && (
          <View style={S.trackResultsContainer}>
            <Text style={S.trackResultsHeader}>
              Found {trackResults.length} Collection Request{trackResults.length > 1 ? 's' : ''}
            </Text>
            {trackResults.map((apt, idx) => {
              let testDetails = 'Routine checkup';
              if (apt.notes) {
                const match = apt.notes.match(/Tests\/Packages:\s*(.*)\.\s*Mode:/) ||
                  apt.notes.match(/Selected tests:\s*(.*)\.\s*Mode:/);
                if (match && match[1]) testDetails = match[1];
                else testDetails = apt.notes;
              }
              const refId = `SPL-APT-${String(apt.id).padStart(6, '0')}`;
              const isHome = !apt.notes || !apt.notes.includes('Mode: Lab Visit');
              const statusInfo = STATUS_MAP[apt.status] || { label: apt.status, bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

              return (
                <View key={idx} style={S.trackItem}>
                  <View style={S.trackItemTop}>
                    <Text style={S.trackItemRef}>{refId}</Text>
                    <View style={[S.statusBadge, { backgroundColor: statusInfo.bg, borderColor: statusInfo.border }]}>
                      <Text style={[S.statusBadgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                  </View>
                  <Text style={S.trackItemTests} numberOfLines={2}>{testDetails}</Text>
                  <View style={S.trackItemMeta}>
                    <Text style={S.trackItemMetaText}>📅 {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                    <Text style={S.trackItemMetaDot}>•</Text>
                    <Text style={S.trackItemMetaText}>⏱ {apt.time}</Text>
                    <Text style={S.trackItemMetaDot}>•</Text>
                    <Text style={S.trackItemMetaText}>{isHome ? '🏠 Home' : '🏥 Lab Visit'}</Text>
                  </View>
                  {apt.status === 'SCHEDULED' && (
                    <TouchableOpacity
                      style={S.contactLabBtn}
                      onPress={() => handleContactLabWhatsApp(apt, testDetails, refId)}
                    >
                      <Text style={S.contactLabBtnText}>💬 Contact Lab</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* ── STATS AT A GLANCE ───────────────────── */}
      <View style={S.section}>
        <Text style={S.sectionChip}>AT A GLANCE</Text>
        <Text style={S.sectionTitle}>Sana Pathology at a Glance</Text>
        <Text style={S.sectionSub}>Committed to clinical excellence, patient care, and accurate reporting standards.</Text>
        <View style={S.statsGrid}>
          {[
            { val: '15,000+', lbl: 'Happy Patients Served', color: '#10b981', icon: '👥' },
            { val: '250+', lbl: 'Comprehensive Lab Tests', color: '#3b82f6', icon: '🔬' },
            { val: '6 Hours', lbl: 'Average Report Delivery', color: '#f59e0b', icon: '⚡' },
            { val: '100%', lbl: 'Accurate & NABL Standard', color: '#ef4444', icon: '🏅' },
          ].map((stat, i) => (
            <View key={i} style={[S.statCard, { borderBottomColor: stat.color }]}>
              <Text style={S.statIcon}>{stat.icon}</Text>
              <Text style={[S.statVal, { color: stat.color }]}>{stat.val}</Text>
              <Text style={S.statLbl}>{stat.lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── HOW IT WORKS ────────────────────────── */}
      <View style={[S.section, S.sectionGreen]}>
        <Text style={S.sectionChipGreen}>PROCESS</Text>
        <Text style={S.sectionTitleDark}>How It Works</Text>
        <Text style={S.sectionSubDark}>Get tested in 5 simple, secure steps without leaving your home.</Text>
        <View style={S.stepsContainer}>
          {[
            { num: '01', title: 'Select Tests', desc: 'Choose tests or wellness packages below.' },
            { num: '02', title: 'Schedule Collection', desc: 'Provide date, time, and address details.' },
            { num: '03', title: 'Sample Collection', desc: 'Certified phlebotomist collects at your doorstep.' },
            { num: '04', title: 'Lab Processing', desc: 'High-tech processing with barcoded sample safety.' },
            { num: '05', title: 'Digital Reports', desc: 'Get reports on WhatsApp & download online.' },
          ].map((step, i, arr) => (
            <View key={i} style={S.stepRow}>
              <View style={S.stepLeft}>
                <View style={S.stepCircle}>
                  <Text style={S.stepNum}>{step.num}</Text>
                </View>
                {i < arr.length - 1 && <View style={S.stepLine} />}
              </View>
              <View style={S.stepBody}>
                <Text style={S.stepTitle}>{step.title}</Text>
                <Text style={S.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── HEALTH PACKAGES ─────────────────────── */}
      <View style={S.section}>
        <Text style={S.sectionChip}>SANA CARE</Text>
        <Text style={S.sectionTitle}>Popular Health Packages</Text>
        <Text style={S.sectionSub}>Complete medical profile checks at subsidized rates. Free home collection included.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.pkgScroll} contentContainerStyle={S.pkgScrollContent}>
          {HEALTH_PACKAGES.map((pkg) => {
            const selected = isItemSelected(pkg, true);
            const discount = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);
            return (
              <View key={pkg.id} style={S.pkgCard}>
                <View style={S.pkgCardTop}>
                  <View style={S.pkgBadgeRow}>
                    <View style={[S.pkgBadge, { backgroundColor: pkg.badgeBg }]}>
                      <Text style={[S.pkgBadgeText, { color: pkg.badgeColor }]}>{pkg.badge}</Text>
                    </View>
                    <Text style={S.pkgType}>PACKAGE</Text>
                  </View>
                  <Text style={S.pkgName}>{pkg.name}</Text>
                  <Text style={S.pkgSubtitle}>{pkg.subtitle}</Text>
                  <Text style={S.pkgDesc} numberOfLines={2}>{pkg.desc}</Text>
                </View>

                <View style={S.pkgIncludesSection}>
                  <Text style={S.pkgIncludesLabel}>✦ Includes {pkg.tests.length} tests:</Text>
                  {pkg.tests.map((t, ti) => (
                    <View key={ti} style={S.pkgTestRow}>
                      <Text style={S.pkgTestCheck}>✓</Text>
                      <Text style={S.pkgTestName} numberOfLines={1}>{t}</Text>
                    </View>
                  ))}
                </View>

                <View style={S.pkgPricingArea}>
                  <View style={S.pkgPriceRow}>
                    <Text style={S.pkgPrice}>₹{pkg.price}</Text>
                    <Text style={S.pkgOrigPrice}>₹{pkg.originalPrice}</Text>
                    <View style={S.pkgDiscountBadge}>
                      <Text style={S.pkgDiscountText}>{discount}% OFF</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[S.pkgSelectBtn, selected && S.pkgSelectBtnActive]}
                    onPress={() => handleToggleItem(pkg, true)}
                  >
                    <Text style={S.pkgSelectBtnText}>
                      {selected ? '✓ Selected' : 'Select Package'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* ── TEST EXPLORER ───────────────────────── */}
      <View style={[S.section, S.sectionLight]}>
        <Text style={S.sectionChip}>CATALOG</Text>
        <Text style={S.sectionTitle}>Interactive Test Explorer</Text>
        <Text style={S.sectionSub}>Search and filter our complete pathology catalog. Select tests to build your booking.</Text>

        <View style={S.explorerCard}>
          <View style={S.explorerSearchRow}>
            <Text style={S.explorerSearchIcon}>🔍</Text>
            <TextInput
              style={S.explorerSearchInput}
              placeholder="Search blood test, sugar, thyroid, CBC..."
              placeholderTextColor="#94a3b8"
              value={testSearch}
              onChangeText={setTestSearch}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.catsScroll} contentContainerStyle={S.catsContent}>
            {categories.map((cat, i) => (
              <TouchableOpacity
                key={i}
                style={[S.catChip, selectedCategory === cat && S.catChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[S.catChipText, selectedCategory === cat && S.catChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loadingTests ? (
            <View style={S.loaderWrap}>
              <ActivityIndicator size="large" color="#085041" />
              <Text style={S.loaderText}>Loading clinical test catalog...</Text>
            </View>
          ) : filteredTests.length === 0 ? (
            <View style={S.noResultsWrap}>
              <Text style={S.noResultsIcon}>🔬</Text>
              <Text style={S.noResultsTitle}>No Tests Found</Text>
              <Text style={S.noResultsSub}>Try searching standard terms like CBC, Sugar, or Liver.</Text>
              <TouchableOpacity style={S.resetBtn} onPress={() => { setTestSearch(''); setSelectedCategory('All'); }}>
                <Text style={S.resetBtnText}>Reset Filter</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredTests.map((test, i) => {
              const selected = isItemSelected(test, false);
              return (
                <TouchableOpacity
                  key={test.id || i}
                  style={[S.testItem, selected && S.testItemActive]}
                  onPress={() => handleToggleItem(test, false)}
                >
                  <View style={S.testItemLeft}>
                    <View style={S.testItemBadgeRow}>
                      <Text style={S.testItemCategory}>{test.category?.name?.toUpperCase() || 'TEST'}</Text>
                      <Text style={S.testItemCode}>Code: {test.testCode}</Text>
                    </View>
                    <Text style={S.testItemName}>{test.testName}</Text>
                    <View style={S.testItemMetaRow}>
                      <Text style={S.testItemPrice}>₹{test.price}</Text>
                      <Text style={S.testItemDot}>•</Text>
                      <Text style={S.testItemSample}>{test.sampleType || 'Blood'} Sample</Text>
                    </View>
                  </View>
                  <View style={[S.testItemCheck, selected && S.testItemCheckActive]}>
                    <Text style={[S.testItemCheckIcon, selected && S.testItemCheckIconActive]}>
                      {selected ? '✓' : '+'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>

      {/* ── BOOKING CART ────────────────────────── */}
      {selectedItems.length > 0 && (
        <View style={S.section}>
          <View style={S.cartCard}>
            <View style={S.cartHeader}>
              <Text style={S.cartTitle}>❤ Your Booking</Text>
              <TouchableOpacity onPress={clearSelection}>
                <Text style={S.cartClearText}>🗑 Clear All</Text>
              </TouchableOpacity>
            </View>

            {selectedItems.map((item) => (
              <View key={item.key} style={S.cartRow}>
                <View style={S.cartRowLeft}>
                  <Text style={S.cartItemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={S.cartItemType}>₹{item.price} • {item.isPackage ? 'Package' : 'Test'}</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.key)} style={S.cartRemoveBtn}>
                  <Text style={S.cartRemoveIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={S.cartDivider} />

            <View style={S.cartTotalsRow}>
              <View>
                <Text style={S.cartTotalLabel}>Total Tests: {selectedItems.length}</Text>
                <Text style={S.cartTotalPrice}>Estimated: ₹{totalCost}</Text>
              </View>
              {!showBookingForm && !bookingSuccessData && (
                <TouchableOpacity style={S.proceedBtn} onPress={() => setShowBookingForm(true)}>
                  <Text style={S.proceedBtnText}>Proceed to Booking →</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── BOOKING FORM ── */}
            {showBookingForm && !bookingSuccessData && (
              <View style={S.bookingForm}>
                <View style={S.bookingFormHeader}>
                  <Text style={S.bookingFormTitle}>Book Home Sample Collection</Text>
                  <Text style={S.bookingFormSub}>Fill in the details below. We collect samples from your home or office.</Text>
                </View>

                <TextInput style={S.formInput} placeholder="Full Name *" placeholderTextColor="#94a3b8" value={bookingForm.name} onChangeText={v => setBookingForm({ ...bookingForm, name: v })} />
                <TextInput style={S.formInput} placeholder="Mobile Number *" placeholderTextColor="#94a3b8" keyboardType="phone-pad" value={bookingForm.mobile} onChangeText={v => setBookingForm({ ...bookingForm, mobile: v })} />

                <View style={S.genderRow}>
                  {['MALE', 'FEMALE'].map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[S.genderBtn, bookingForm.gender === g && S.genderBtnActive]}
                      onPress={() => setBookingForm({ ...bookingForm, gender: g })}
                    >
                      <Text style={[S.genderBtnText, bookingForm.gender === g && S.genderBtnTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Home collection toggle */}
                <TouchableOpacity
                  style={S.homeCollToggle}
                  onPress={() => setBookingForm({ ...bookingForm, isHomeCollection: !bookingForm.isHomeCollection })}
                >
                  <View style={[S.homeCollCheckbox, bookingForm.isHomeCollection && S.homeCollCheckboxActive]}>
                    {bookingForm.isHomeCollection && <Text style={S.homeCollCheckmark}>✓</Text>}
                  </View>
                  <Text style={S.homeCollLabel}>Home Collection (phlebotomist visits you)</Text>
                </TouchableOpacity>

                {bookingForm.isHomeCollection && (
                  <TextInput
                    style={[S.formInput, { height: 64 }]}
                    placeholder="Your home address *"
                    placeholderTextColor="#94a3b8"
                    multiline
                    value={bookingForm.address === 'Lab Visit' ? '' : bookingForm.address}
                    onChangeText={v => setBookingForm({ ...bookingForm, address: v })}
                  />
                )}

                <View style={S.dateTimeRow}>
                  <TextInput style={[S.formInput, { flex: 1, marginRight: 8 }]} placeholder="Date (YYYY-MM-DD) *" placeholderTextColor="#94a3b8" value={bookingForm.preferredDate} onChangeText={v => setBookingForm({ ...bookingForm, preferredDate: v })} />
                  <TextInput style={[S.formInput, { flex: 1 }]} placeholder="Time (HH:MM)" placeholderTextColor="#94a3b8" value={bookingForm.preferredTime} onChangeText={v => setBookingForm({ ...bookingForm, preferredTime: v })} />
                </View>

                <TextInput style={[S.formInput, { height: 64 }]} placeholder="Additional notes / medical history" placeholderTextColor="#94a3b8" multiline value={bookingForm.notes} onChangeText={v => setBookingForm({ ...bookingForm, notes: v })} />

                <TouchableOpacity style={S.submitBtn} onPress={handleBookingSubmit} disabled={bookingLoading}>
                  {bookingLoading ? <ActivityIndicator color="#fff" /> : <Text style={S.submitBtnText}>Book Appointment</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* ── BOOKING SUCCESS ── */}
            {bookingSuccessData && (
              <View style={S.successContainer}>
                <View style={S.successIconWrap}>
                  <Text style={S.successIconText}>✓</Text>
                </View>
                <Text style={S.successTitle}>Request Submitted Successfully!</Text>
                <Text style={S.successSub}>
                  Thank you, {bookingForm.name}. We have received your booking. Please confirm via WhatsApp for priority processing.
                </Text>

                <View style={S.refBox}>
                  <Text style={S.refBoxLabel}>YOUR TRACKING REFERENCE ID</Text>
                  <Text style={S.refBoxId}>SPL-APT-{String(bookingSuccessData.id).padStart(6, '0')}</Text>
                  <Text style={S.refBoxHelper}>Use this ID in the "Track Request" tab above to check status.</Text>
                </View>

                <TouchableOpacity
                  style={S.waBtn}
                  onPress={() => {
                    const msg = `*New Appointment Request (App)*\n\n*Name:* ${bookingForm.name}\n*Mobile:* ${bookingForm.mobile}\n*Ref:* SPL-APT-${String(bookingSuccessData.id).padStart(6, '0')}\n\n*Selected Tests/Packages:*\n${selectedItems.map(x => `- ${x.name} (₹${x.price})`).join('\n')}\n\n*Total Amount:* ₹${totalCost}`;
                    Linking.openURL(`https://wa.me/916396786939?text=${encodeURIComponent(msg)}`);
                  }}
                >
                  <Text style={S.waBtnText}>💬 Alert via WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity style={S.bookAnotherBtn} onPress={clearSelection}>
                  <Text style={S.bookAnotherText}>Book Another Test</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* ── CLINICAL QUALITY ───────────────────── */}
      <View style={[S.section, S.sectionGreen]}>
        <Text style={S.sectionChipGreen}>QUALITY</Text>
        <Text style={S.sectionTitleDark}>Medical & Clinical Quality</Text>
        <Text style={S.sectionSubDark}>Every single report undergoes multi-level verification checkups.</Text>
        <View style={S.qualityList}>
          {[
            { icon: '📜', title: 'Certified Signatures', desc: 'All reports are digitally signed by a registered M.D. Pathologist.' },
            { icon: '🔬', title: 'NABL Quality Audits', desc: 'We adhere to global standards in accuracy, hygiene, and machinery.' },
            { icon: '🏷️', title: 'Barcoded Specimens', desc: 'No sample mix-ups. Safe barcoding from the collection phase.' },
            { icon: '⚙️', title: 'Automated Analyzers', desc: 'Minimal human error through high-fidelity diagnostic machinery.' },
          ].map((q, i) => (
            <View key={i} style={S.qualityItem}>
              <Text style={S.qualityItemIcon}>{q.icon}</Text>
              <View style={S.qualityItemBody}>
                <Text style={S.qualityItemTitle}>{q.title}</Text>
                <Text style={S.qualityItemDesc}>{q.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── PATHOLOGIST CARD ────────────────────── */}
      <View style={S.section}>
        <View style={S.pathCard}>
          <View style={S.pathTop}>
            <View style={S.pathAvatar}><Text style={S.pathAvatarText}>DR</Text></View>
            <View style={S.pathInfo}>
              <Text style={S.pathName}>Dr. Sana (M.D.)</Text>
              <Text style={S.pathRole}>Chief Pathologist & Director</Text>
              <Text style={S.pathReg}>Reg No. UP-1029384</Text>
            </View>
          </View>
          <View style={S.pathStatsRow}>
            {[
              { label: 'Verification', val: '✓ Active & Verified' },
              { label: 'Specialization', val: 'Hematology' },
              { label: 'Experience', val: '15+ Years' },
            ].map((s, i) => (
              <View key={i} style={S.pathStat}>
                <Text style={S.pathStatLabel}>{s.label}</Text>
                <Text style={S.pathStatVal}>{s.val}</Text>
              </View>
            ))}
          </View>
          <Text style={S.pathFooter}>
            Patients can securely search their reports on our home page. All reports contain a verified QR Code pointing directly to our secure cloud database.
          </Text>
        </View>
      </View>

      {/* ── TESTIMONIALS ────────────────────────── */}
      <View style={S.section}>
        <Text style={S.sectionChip}>PATIENTS SAY</Text>
        <Text style={S.sectionTitle}>Patient Testimonials</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.pkgScroll} contentContainerStyle={S.pkgScrollContent}>
          {TESTIMONIALS.map((t, i) => (
            <View key={i} style={S.testimonialCard}>
              <View style={[S.testimonialAvatar, { backgroundColor: t.color }]}>
                <Text style={S.testimonialAvatarText}>{t.initial}</Text>
              </View>
              <View style={S.testimonialStars}>
                {[1,2,3,4,5].map(s => <Text key={s} style={S.star}>★</Text>)}
              </View>
              <Text style={S.testimonialText}>"{t.text}"</Text>
              <Text style={S.testimonialName}>{t.name}</Text>
              <Text style={S.testimonialVerify}>✓ Verified Patient</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── FAQ ─────────────────────────────────── */}
      <View style={S.section}>
        <Text style={S.sectionChip}>HELP</Text>
        <Text style={S.sectionTitle}>Frequently Asked Questions</Text>
        <View style={S.faqList}>
          {FAQS.map((faq, i) => (
            <View key={i} style={S.faqItem}>
              <TouchableOpacity style={S.faqHeader} onPress={() => setOpenFaq(openFaq === i ? null : i)}>
                <Text style={S.faqQuestion}>{faq.q}</Text>
                <Text style={S.faqToggle}>{openFaq === i ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {openFaq === i && (
                <View style={S.faqBody}>
                  <Text style={S.faqAnswer}>{faq.a}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* ── CONTACT FOOTER ──────────────────────── */}
      <View style={S.section}>
        <View style={S.contactCard}>
          <Text style={S.contactTitle}>Location & Contact</Text>
          {[
            { icon: '📍', label: 'ADDRESS', val: 'Datawali Road, Near Aara Machine,\nHayat Nagar, Distt. Sambhal-244303 (U.P)' },
            { icon: '⏰', label: 'OPENING HOURS', val: 'Mon – Sat: 7:00 AM – 8:00 PM\nSunday: 8:00 AM – 1:00 PM' },
            { icon: '📞', label: 'CONTACT', val: '+91 6396786939' },
            { icon: '✉', label: 'EMAIL', val: 'support@sanapathology.com' },
          ].map((c, i) => (
            <View key={i} style={S.contactField}>
              <Text style={S.contactFieldLabel}>{c.icon} {c.label}</Text>
              <Text style={S.contactFieldVal}>{c.val}</Text>
            </View>
          ))}
          <Text style={S.copyright}>© 2026 Sana Pathology Lab. All rights reserved.</Text>
        </View>
      </View>

      {/* ── STAFF LOGIN ─────────────────────────── */}
      <View style={S.section}>
        <TouchableOpacity style={S.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={S.loginBtnText}>🔐 Staff / Doctor Login</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const TEAL = '#085041';
const TEAL_LIGHT = '#0A5D4C';
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

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: SLATE_50 },
  content: { paddingBottom: 40 },

  // ── TOP HEADER BAR
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TEAL,
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  topLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(241,196,15,0.15)',
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  topLoginIcon: { fontSize: 18 },
  topLoginLabel: { fontSize: 13, fontWeight: '800', color: GOLD },
  topLoginSub: { fontSize: 9, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: 1 },
  topBrand: { alignItems: 'flex-end' },
  topBrandName: { fontSize: 14, fontWeight: '900', color: WHITE },
  topBrandSub: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1 },

  // ── HERO
  hero: {
    backgroundColor: TEAL,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    top: -40,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  blob2: {
    position: 'absolute',
    bottom: -30,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(241,196,15,0.08)',
  },
  heroInner: { zIndex: 1 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    gap: 6,
  },
  heroBadgeStar: { color: GOLD, fontSize: 12 },
  heroBadgeText: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  heroTitle: { fontSize: 30, fontWeight: '900', color: WHITE, marginBottom: 12, lineHeight: 38 },
  heroTitleAccent: { color: GOLD },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginBottom: 20 },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  heroPillIcon: { fontSize: 13 },
  heroPillText: { color: WHITE, fontSize: 11, fontWeight: '600' },

  // ── NAV BAR
  navBar: { backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: SLATE_100 },
  navBarContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  navChip: {
    backgroundColor: SLATE_100,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  navChipText: { fontSize: 12, fontWeight: '700', color: SLATE_700 },

  // ── SECTIONS
  section: { paddingHorizontal: 16, paddingTop: 28, paddingBottom: 8 },
  sectionGreen: { backgroundColor: 'rgba(8,80,65,0.04)', paddingVertical: 28 },
  sectionLight: { backgroundColor: SLATE_50, paddingVertical: 28 },
  sectionChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(8,80,65,0.08)',
    color: TEAL,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
    overflow: 'hidden',
  },
  sectionChipGreen: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(8,80,65,0.1)',
    color: TEAL,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
    overflow: 'hidden',
  },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: SLATE_800, marginBottom: 6 },
  sectionSub: { fontSize: 13, color: SLATE_500, marginBottom: 18, lineHeight: 18 },
  sectionTitleDark: { fontSize: 22, fontWeight: '900', color: TEAL, marginBottom: 6 },
  sectionSubDark: { fontSize: 13, color: SLATE_500, marginBottom: 18, lineHeight: 18 },

  // ── SEARCH CARD
  searchCard: {
    marginHorizontal: 16,
    marginTop: -1,
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 8,
  },
  searchCardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  searchCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(8,80,65,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCardIconText: { fontSize: 22 },
  searchCardTitle: { fontSize: 16, fontWeight: '800', color: SLATE_800, marginBottom: 2 },
  searchCardSub: { fontSize: 11, color: SLATE_500, lineHeight: 15 },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: SLATE_100,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  tabActive: {
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: { fontSize: 11, fontWeight: '700', color: SLATE_500 },
  tabTextActive: { color: TEAL },
  searchInput: {
    backgroundColor: SLATE_50,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: SLATE_800,
    marginBottom: 12,
  },
  searchBtn: {
    backgroundColor: TEAL,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchBtnText: { color: WHITE, fontWeight: '800', fontSize: 14 },
  searchErrorBox: {
    marginTop: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
  },
  searchErrorText: { fontSize: 12, fontWeight: '700', color: '#b91c1c' },

  // ── TRACK RESULTS
  trackResultsContainer: { marginTop: 16, borderTopWidth: 1, borderTopColor: SLATE_100, paddingTop: 16 },
  trackResultsHeader: { fontSize: 12, fontWeight: '800', color: SLATE_800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  trackItem: {
    backgroundColor: SLATE_50,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  trackItemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  trackItemRef: { fontSize: 13, fontWeight: '800', color: SLATE_800 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  trackItemTests: { fontSize: 11, color: SLATE_700, fontWeight: '600', marginBottom: 8 },
  trackItemMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trackItemMetaText: { fontSize: 10, color: SLATE_500 },
  trackItemMetaDot: { fontSize: 10, color: SLATE_400 },
  contactLabBtn: {
    marginTop: 10,
    backgroundColor: '#25D366',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  contactLabBtnText: { color: WHITE, fontWeight: '800', fontSize: 12 },

  // ── STATS
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statVal: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLbl: { fontSize: 11, color: SLATE_500, textAlign: 'center', fontWeight: '600' },

  // ── HOW IT WORKS
  stepsContainer: { marginTop: 8 },
  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepLeft: { alignItems: 'center', width: 44, marginRight: 14 },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepNum: { fontSize: 13, fontWeight: '900', color: TEAL },
  stepLine: { width: 2, flex: 1, backgroundColor: 'rgba(8,80,65,0.2)', marginVertical: 2, minHeight: 20 },
  stepBody: { flex: 1, paddingBottom: 20, paddingTop: 8 },
  stepTitle: { fontSize: 14, fontWeight: '800', color: TEAL, marginBottom: 3 },
  stepDesc: { fontSize: 12, color: SLATE_500, lineHeight: 16 },

  // ── PACKAGES
  pkgScroll: { marginHorizontal: -16, marginBottom: 8 },
  pkgScrollContent: { paddingHorizontal: 16, gap: 12 },
  pkgCard: {
    width: 270,
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: SLATE_100,
  },
  pkgCardTop: { marginBottom: 12 },
  pkgBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  pkgBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  pkgBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  pkgType: { fontSize: 9, fontWeight: '700', color: SLATE_400, textTransform: 'uppercase', letterSpacing: 0.5 },
  pkgName: { fontSize: 16, fontWeight: '800', color: SLATE_800, marginBottom: 2 },
  pkgSubtitle: { fontSize: 11, color: TEAL, fontWeight: '700', marginBottom: 6 },
  pkgDesc: { fontSize: 11, color: SLATE_500, lineHeight: 15 },
  pkgIncludesSection: { borderTopWidth: 1, borderTopColor: SLATE_100, paddingTop: 12, marginBottom: 14 },
  pkgIncludesLabel: { fontSize: 10, fontWeight: '800', color: SLATE_700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  pkgTestRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  pkgTestCheck: { fontSize: 11, color: TEAL, fontWeight: '800' },
  pkgTestName: { fontSize: 11, color: SLATE_700, fontWeight: '500', flex: 1 },
  pkgPricingArea: { borderTopWidth: 1, borderTopColor: SLATE_50, paddingTop: 12 },
  pkgPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 },
  pkgPrice: { fontSize: 22, fontWeight: '900', color: TEAL },
  pkgOrigPrice: { fontSize: 13, color: SLATE_400, textDecorationLine: 'line-through' },
  pkgDiscountBadge: { backgroundColor: '#dcfce7', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  pkgDiscountText: { fontSize: 11, fontWeight: '800', color: '#15803d' },
  pkgSelectBtn: {
    backgroundColor: 'rgba(8,80,65,0.08)',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  pkgSelectBtnActive: { backgroundColor: '#16a34a' },
  pkgSelectBtnText: { color: TEAL, fontWeight: '800', fontSize: 13 },

  // ── TEST EXPLORER
  explorerCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  explorerSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SLATE_100,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  explorerSearchIcon: { fontSize: 16, marginRight: 8 },
  explorerSearchInput: { flex: 1, paddingVertical: 12, fontSize: 13, color: SLATE_800, fontWeight: '600' },
  catsScroll: { marginBottom: 14, marginHorizontal: -16 },
  catsContent: { paddingHorizontal: 16, gap: 8 },
  catChip: {
    backgroundColor: SLATE_100,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  catChipActive: { backgroundColor: TEAL, borderColor: TEAL },
  catChipText: { fontSize: 12, fontWeight: '700', color: SLATE_500 },
  catChipTextActive: { color: WHITE },
  loaderWrap: { alignItems: 'center', paddingVertical: 36 },
  loaderText: { color: SLATE_500, fontSize: 13, marginTop: 12, fontWeight: '600' },
  noResultsWrap: { alignItems: 'center', paddingVertical: 36 },
  noResultsIcon: { fontSize: 36, marginBottom: 10 },
  noResultsTitle: { fontSize: 16, fontWeight: '800', color: SLATE_700, marginBottom: 4 },
  noResultsSub: { fontSize: 12, color: SLATE_500, textAlign: 'center', lineHeight: 16, marginBottom: 14 },
  resetBtn: { backgroundColor: TEAL, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 10 },
  resetBtnText: { color: WHITE, fontWeight: '800', fontSize: 12 },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    backgroundColor: SLATE_50,
  },
  testItemActive: { borderColor: TEAL, backgroundColor: 'rgba(8,80,65,0.04)' },
  testItemLeft: { flex: 1, paddingRight: 12 },
  testItemBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 3 },
  testItemCategory: { fontSize: 9, fontWeight: '800', color: TEAL, textTransform: 'uppercase', letterSpacing: 0.5 },
  testItemCode: { fontSize: 9, color: SLATE_400, fontWeight: '600' },
  testItemName: { fontSize: 13, fontWeight: '800', color: SLATE_800, marginBottom: 4 },
  testItemMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  testItemPrice: { fontSize: 13, fontWeight: '800', color: '#b45309' },
  testItemDot: { fontSize: 10, color: SLATE_300 },
  testItemSample: { fontSize: 11, color: SLATE_500 },
  testItemCheck: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: SLATE_300,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testItemCheckActive: { backgroundColor: TEAL, borderColor: TEAL },
  testItemCheckIcon: { fontSize: 14, fontWeight: '900', color: SLATE_400 },
  testItemCheckIconActive: { color: WHITE },

  // ── CART
  cartCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 5,
    borderLeftColor: GOLD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cartTitle: { fontSize: 16, fontWeight: '900', color: SLATE_800 },
  cartClearText: { fontSize: 12, fontWeight: '700', color: '#dc2626' },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SLATE_50,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: SLATE_100,
  },
  cartRowLeft: { flex: 1, paddingRight: 8 },
  cartItemName: { fontSize: 12, fontWeight: '700', color: SLATE_800 },
  cartItemType: { fontSize: 10, color: SLATE_500, marginTop: 1 },
  cartRemoveBtn: { padding: 4 },
  cartRemoveIcon: { fontSize: 13, color: SLATE_400, fontWeight: '700' },
  cartDivider: { height: 1, backgroundColor: SLATE_200, marginVertical: 12 },
  cartTotalsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartTotalLabel: { fontSize: 11, color: SLATE_500 },
  cartTotalPrice: { fontSize: 15, fontWeight: '800', color: SLATE_800, marginTop: 3 },
  proceedBtn: {
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  proceedBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },

  // ── BOOKING FORM
  bookingForm: { marginTop: 20, borderTopWidth: 1, borderTopColor: SLATE_200, paddingTop: 20 },
  bookingFormHeader: {
    backgroundColor: TEAL,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  bookingFormTitle: { color: WHITE, fontSize: 16, fontWeight: '800', marginBottom: 3 },
  bookingFormSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, lineHeight: 15 },
  formInput: {
    backgroundColor: SLATE_50,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: SLATE_800,
    marginBottom: 10,
  },
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  genderBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    alignItems: 'center',
    backgroundColor: SLATE_50,
  },
  genderBtnActive: { backgroundColor: TEAL, borderColor: TEAL },
  genderBtnText: { fontSize: 12, fontWeight: '700', color: SLATE_500 },
  genderBtnTextActive: { color: WHITE },
  homeCollToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  homeCollCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: SLATE_300,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeCollCheckboxActive: { backgroundColor: TEAL, borderColor: TEAL },
  homeCollCheckmark: { color: WHITE, fontSize: 12, fontWeight: '900' },
  homeCollLabel: { fontSize: 13, color: SLATE_700, fontWeight: '600', flex: 1 },
  dateTimeRow: { flexDirection: 'row', marginBottom: 0 },
  submitBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: { color: WHITE, fontWeight: '800', fontSize: 15 },

  // ── SUCCESS
  successContainer: { marginTop: 20, borderTopWidth: 1, borderTopColor: SLATE_100, paddingTop: 20, alignItems: 'center' },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successIconText: { fontSize: 28, color: '#10b981', fontWeight: '900' },
  successTitle: { fontSize: 17, fontWeight: '800', color: '#10b981', textAlign: 'center', marginBottom: 8 },
  successSub: { fontSize: 12, color: SLATE_500, textAlign: 'center', lineHeight: 17, marginBottom: 16 },
  refBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  refBoxLabel: { fontSize: 9, fontWeight: '900', color: '#065f46', letterSpacing: 1.5, textTransform: 'uppercase' },
  refBoxId: { fontSize: 20, fontWeight: '900', color: '#065f46', marginTop: 4 },
  refBoxHelper: { fontSize: 10, color: '#047857', textAlign: 'center', marginTop: 6, lineHeight: 14 },
  waBtn: {
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  waBtnText: { color: WHITE, fontWeight: '800', fontSize: 14 },
  bookAnotherBtn: { paddingVertical: 10 },
  bookAnotherText: { color: TEAL, fontWeight: '800', fontSize: 13 },

  // ── QUALITY
  qualityList: { gap: 14 },
  qualityItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  qualityItemIcon: { fontSize: 22 },
  qualityItemBody: { flex: 1 },
  qualityItemTitle: { fontSize: 14, fontWeight: '800', color: TEAL, marginBottom: 3 },
  qualityItemDesc: { fontSize: 12, color: SLATE_500, lineHeight: 16 },

  // ── PATHOLOGIST
  pathCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: SLATE_100,
  },
  pathTop: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 16 },
  pathAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathAvatarText: { color: '#000', fontSize: 14, fontWeight: '900' },
  pathInfo: { flex: 1 },
  pathName: { fontSize: 16, fontWeight: '800', color: SLATE_800 },
  pathRole: { fontSize: 12, color: SLATE_500, marginTop: 1 },
  pathReg: { fontSize: 11, color: SLATE_400, fontStyle: 'italic', marginTop: 1 },
  pathStatsRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: SLATE_100, paddingVertical: 12, marginBottom: 12 },
  pathStat: { flex: 1, alignItems: 'center' },
  pathStatLabel: { fontSize: 9, color: SLATE_400, textTransform: 'uppercase', letterSpacing: 0.5 },
  pathStatVal: { fontSize: 11, fontWeight: '700', color: SLATE_800, marginTop: 3, textAlign: 'center' },
  pathFooter: { fontSize: 11, color: SLATE_500, fontStyle: 'italic', lineHeight: 15, textAlign: 'center' },

  // ── TESTIMONIALS
  testimonialCard: {
    width: 240,
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: SLATE_100,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  testimonialAvatarText: { color: WHITE, fontSize: 16, fontWeight: '900' },
  testimonialStars: { flexDirection: 'row', marginBottom: 8 },
  star: { color: GOLD, fontSize: 12 },
  testimonialText: { fontSize: 11, color: SLATE_700, fontStyle: 'italic', textAlign: 'center', lineHeight: 16, marginBottom: 10 },
  testimonialName: { fontSize: 13, fontWeight: '800', color: SLATE_800 },
  testimonialVerify: { fontSize: 10, color: '#10b981', marginTop: 2 },

  // ── FAQ
  faqList: { gap: 8 },
  faqItem: {
    backgroundColor: WHITE,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: SLATE_100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  faqQuestion: { fontSize: 13, fontWeight: '700', color: SLATE_800, flex: 1, paddingRight: 10, lineHeight: 18 },
  faqToggle: { fontSize: 11, color: SLATE_500 },
  faqBody: { padding: 16, borderTopWidth: 1, borderTopColor: SLATE_100, backgroundColor: SLATE_50 },
  faqAnswer: { fontSize: 12, color: SLATE_500, lineHeight: 17 },

  // ── CONTACT
  contactCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: SLATE_100,
  },
  contactTitle: { fontSize: 18, fontWeight: '800', color: SLATE_800, marginBottom: 16 },
  contactField: { marginBottom: 14 },
  contactFieldLabel: { fontSize: 10, fontWeight: '800', color: TEAL, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  contactFieldVal: { fontSize: 13, color: SLATE_700, lineHeight: 18 },
  copyright: { fontSize: 10, color: SLATE_400, textAlign: 'center', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: SLATE_100 },

  // ── STAFF LOGIN
  loginBtn: {
    borderWidth: 2,
    borderColor: TEAL,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(8,80,65,0.04)',
  },
  loginBtnText: { color: TEAL, fontWeight: '800', fontSize: 15 },

});

export default PublicWelcomeScreen;
