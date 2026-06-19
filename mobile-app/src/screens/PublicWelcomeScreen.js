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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { publicApi } from '../services/api';
import { QUESTION_FLOW, TEST_RECOMMENDATIONS } from '../utils/aiFlowData';

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
  const chatScrollRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // AI Consultation States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiStep, setAiStep] = useState('welcome'); // 'welcome' | 'register' | 'question' | 'results' | 'chat'
  const [modalLanguage, setModalLanguage] = useState('en'); // 'en' | 'hi'
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male'); // 'Male' | 'Female' | 'Other'
  const [aiNodeId, setAiNodeId] = useState('start');
  const [aiHistory, setAiHistory] = useState([]);
  const [currentResultKey, setCurrentResultKey] = useState('');
  const [selectedAiTests, setSelectedAiTests] = useState({}); // { [testCode]: boolean }
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);

  useEffect(() => {
    fetchTests();

    // Start pulsing animation for the AI button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
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

  // Helper to resolve test info with fallbacks (Mobile Version)
  const getTestInfo = (testCode) => {
    const pkg = HEALTH_PACKAGES.find(p => p.code === testCode);
    if (pkg) return { name: pkg.name, testCode: pkg.code, price: pkg.price, sampleType: 'Package', category: { name: 'Health Package' }, isPackage: true };

    const apiTest = (tests || []).find(t => t.testCode === testCode);
    if (apiTest) return { ...apiTest, isPackage: false };

    const defTest = DEFAULT_TESTS.find(t => t.testCode === testCode);
    if (defTest) return { ...defTest, isPackage: false };

    const catalogue = {
      "TFT": { "testName": "Thyroid Function Test (T3, T4, TSH)", "testCode": "TFT", "price": 450, "sampleType": "Serum", "category": { "name": "Immunology" } },
      "TFT-01": { "testName": "Thyroid Profile (T3, T4, TSH)", "testCode": "TFT-01", "price": 500, "sampleType": "Serum", "category": { "name": "Endocrinology" } },
      "HBA1C": { "testName": "HbA1c (Glycosylated Haemoglobin)", "testCode": "HBA1C", "price": 400, "sampleType": "EDTA Blood", "category": { "name": "Biochemistry" } },
      "GLU-01": { "testName": "Random Blood Sugar (RBS)", "testCode": "GLU-01", "price": 100, "sampleType": "Fluoride Plasma", "category": { "name": "Biochemistry" } },
      "CBC": { "testName": "Complete Blood Count (CBC)", "testCode": "CBC", "price": 200, "sampleType": "Blood", "category": { "name": "Hematology" } },
      "HB-01": { "testName": "Hemoglobin (Hb)", "testCode": "HB-01", "price": 100, "sampleType": "EDTA Blood", "category": { "name": "Hematology" } },
      "ESR-01": { "testName": "ESR (Erythrocyte Sedimentation Rate)", "testCode": "ESR-01", "price": 150, "sampleType": "Blood", "category": { "name": "Hematology" } },
      "PT-01": { "testName": "Prothrombin Time (PT)", "testCode": "PT-01", "price": 250, "sampleType": "Citrated Plasma", "category": { "name": "Hematology" } },
      "016": { "testName": "TLC (Total Leucocytes Count)", "testCode": "016", "price": 50, "sampleType": "Blood", "category": { "name": "Hematology" } },
      "015": { "testName": "Platelets Count", "testCode": "015", "price": 100, "sampleType": "Blood", "category": { "name": "Hematology" } },
      "BG": { "testName": "Blood Group ABO & Rh Factor Typing", "testCode": "BG", "price": 50, "sampleType": "Blood", "category": { "name": "Hematology" } },
      "LFT": { "testName": "Liver Function Test (LFT)", "testCode": "LFT", "price": 500, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "SGOT": { "testName": "SGOT (AST)", "testCode": "SGOT", "price": 100, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "SGPT": { "testName": "SGPT (ALT)", "testCode": "SGPT", "price": 100, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "SGOT-SGPT": { "testName": "SGOT + SGPT (Combined)", "testCode": "SGOT-SGPT", "price": 250, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "BILIRUBIN-TOTAL-01": { "testName": "Total Bilirubin", "testCode": "BILIRUBIN-TOTAL-01", "price": 150, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "KFT": { "testName": "Kidney Function Test (KFT)", "testCode": "KFT", "price": 500, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "CREAT-01": { "testName": "Serum Creatinine", "testCode": "CREAT-01", "price": 150, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "UREA-01": { "testName": "Blood Urea", "testCode": "UREA-01", "price": 150, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "URIC_ACID": { "testName": "Serum Uric Acid", "testCode": "URIC_ACID", "price": 100, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "CALCIUM-01": { "testName": "Serum Calcium", "testCode": "CALCIUM-01", "price": 200, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "LIPID": { "testName": "Lipid Profile", "testCode": "LIPID", "price": 650, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "CRP-QUANT-01": { "testName": "CRP – C-Reactive Protein (Quantitative)", "testCode": "CRP-QUANT-01", "price": 350, "sampleType": "Serum", "category": { "name": "Biochemistry" } },
      "CRP-01": { "testName": "CRP – C-Reactive Protein", "testCode": "CRP-01", "price": 250, "sampleType": "Serum", "category": { "name": "Clinical Pathology" } },
      "URINE": { "testName": "Urine Examination (Routine & Microscopy)", "testCode": "URINE", "price": 150, "sampleType": "Urine", "category": { "name": "Clinical Pathology" } },
      "RF": { "testName": "Rheumatoid Factor (RF)", "testCode": "RF", "price": 350, "sampleType": "Serum", "category": { "name": "Clinical Pathology" } },
      "SEMEN-01": { "testName": "Semen Analysis", "testCode": "SEMEN-01", "price": 350, "sampleType": "Semen", "category": { "name": "Clinical Pathology" } },
      "ANC-01": { "testName": "Ante-Natal Care (ANC) Profile", "testCode": "ANC-01", "price": 1200, "sampleType": "Blood", "category": { "name": "Clinical Pathology" } },
      "MP": { "testName": "Malaria (MP) ELISA", "testCode": "MP", "price": 100, "sampleType": "Serum", "category": { "name": "Immunology" } },
      "MP-MICRO": { "testName": "Malaria Parasite Identification (Microscopy)", "testCode": "MP-MICRO", "price": 150, "sampleType": "Blood", "category": { "name": "Immunology" } },
      "DENGUE-01": { "testName": "Dengue Profile (IgG, IgM & NS1)", "testCode": "DENGUE-01", "price": 1200, "sampleType": "Serum", "category": { "name": "Clinical Pathology" } },
      "WIDAL1": { "testName": "Widal Test", "testCode": "WIDAL1", "price": 50, "sampleType": "Blood", "category": { "name": "Serology" } },
      "WIDAL": { "testName": "Widal Test (Rapid Slide Method)", "testCode": "WIDAL", "price": 50, "sampleType": "Blood", "category": { "name": "Serology" } },
      "TYPHIDOT-01": { "testName": "Typhidot (IgG & IgM)", "testCode": "TYPHIDOT-01", "price": 100, "sampleType": "Serum", "category": { "name": "Clinical Pathology" } },
      "MANTOUX-01": { "testName": "Mantoux Test (Tuberculin Skin Test)", "testCode": "MANTOUX-01", "price": 250, "sampleType": "Skin", "category": { "name": "Clinical Pathology" } }
    };

    const matched = catalogue[testCode];
    if (matched) return { name: matched.testName, testCode: matched.testCode, price: matched.price, sampleType: matched.sampleType, category: matched.category, isPackage: false };

    return { name: testCode, testCode: testCode, price: 150, sampleType: 'Serum', category: { name: 'General' }, isPackage: false };
  };

  const handleSelectOption = (option) => {
    const nextNode = option.next_node;
    setAiHistory(prev => [...prev, aiNodeId]);
    if (nextNode === 'result') {
      setCurrentResultKey(option.result_key);
      setAiStep('results');
      
      const recommendations = TEST_RECOMMENDATIONS[option.result_key];
      if (recommendations) {
        const initialSelection = {};
        (recommendations.must_do || []).forEach(t => {
          initialSelection[t.test_code] = true;
        });
        (recommendations.recommended || []).forEach(t => {
          initialSelection[t.test_code] = true;
        });
        (recommendations.optional || []).forEach(t => {
          initialSelection[t.test_code] = false;
        });
        setSelectedAiTests(initialSelection);
      }
    } else {
      setAiNodeId(nextNode);
    }
  };

  const handleAiBack = () => {
    if (aiHistory.length > 0) {
      const prevHistory = [...aiHistory];
      const prevNode = prevHistory.pop();
      setAiHistory(prevHistory);
      setAiNodeId(prevNode);
    } else {
      setAiStep('register');
    }
  };

  const handleApplyRecommendedTests = () => {
    const selectedCodes = Object.keys(selectedAiTests).filter(code => selectedAiTests[code]);
    if (selectedCodes.length === 0) {
      Alert.alert(
        modalLanguage === 'hi' ? 'चयन आवश्यक' : 'Selection Required',
        modalLanguage === 'hi' ? 'कृपया कम से कम एक टेस्ट चुनें।' : 'Please select at least one test.'
      );
      return;
    }

    setSelectedItems(prev => {
      const currentKeys = new Set(prev.map(p => p.key));
      const newSelections = selectedCodes
        .filter(code => !currentKeys.has(code))
        .map(code => {
          const info = getTestInfo(code);
          return {
            key: info.testCode || info.code,
            name: info.name || info.testName,
            price: info.price,
            isPackage: !!info.isPackage
          };
        });
      return [...prev, ...newSelections];
    });

    if (patientName.trim()) {
      setBookingForm(prev => ({
        ...prev,
        name: patientName.trim(),
        gender: patientGender === 'Male' ? 'MALE' : (patientGender === 'Female' ? 'FEMALE' : 'OTHER')
      }));
    }

    Alert.alert(
      modalLanguage === 'hi' ? 'सफलता' : 'Success',
      modalLanguage === 'hi' ? 'चुने गए टेस्ट सफलतापूर्वक कार्ट में जोड़े गए!' : 'Selected tests added to cart successfully!'
    );
    handleResetAIAssessment();
    setIsAiModalOpen(false);
  };

  const handleResetAIAssessment = () => {
    setAiStep('welcome');
    setPatientName('');
    setPatientAge('');
    setPatientGender('Male');
    setAiNodeId('start');
    setAiHistory([]);
    setCurrentResultKey('');
    setSelectedAiTests({});
    setChatMessages([]);
    setChatInput('');
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || aiChatLoading) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setAiChatLoading(true);

    // ── STATUS / TRACK LOOKUP (intercept before AI) ──
    const hasRefId = /\bSPL-APT-\d{6}\b/i.test(userMsg);
    const hasReportNum = /\bRPT-\d{6}\b/i.test(userMsg);
    const isStatusIntent = /\b(status|stetus|track|progress|haal sthiti|स्थिति|ट्रैक|स्टेटस|स्टेट्स)\b/i.test(userMsg);

    if (hasRefId || hasReportNum || isStatusIntent) {
      try {
        let statusText = '';

        if (hasRefId) {
          const refMatch = userMsg.match(/\bSPL-APT-\d{6}\b/i)[0].toUpperCase();
          const res = await fetch(`${API_BASE}/public/appointment-status?refId=${encodeURIComponent(refMatch)}`);
          const data = res.ok ? await res.json() : null;
          const apt = data?.appointments?.[0];
          if (apt) {
            statusText = modalLanguage === 'hi'
              ? `📋 *अपॉइंटमेंट स्थिति*\n\n📌 सन्दर्भ ID: ${apt.refId}\n👤 मरीज: ${apt.patientName}\n📞 मोबाइल: ${apt.mobile}\n📅 तारीख: ${new Date(apt.date).toLocaleDateString()} ${apt.time}\n📍 स्थिति: ${apt.statusLabel}`
              : `📋 *Appointment Status*\n\n📌 Ref ID: ${apt.refId}\n👤 Patient: ${apt.patientName}\n📞 Mobile: ${apt.mobile}\n📅 Date: ${new Date(apt.date).toLocaleDateString()} ${apt.time}\n📍 Status: ${apt.statusLabel}`;
          } else {
            statusText = modalLanguage === 'hi'
              ? '❌ इस सन्दर्भ ID के साथ कोई अपॉइंटमेंट नहीं मिला।'
              : '❌ No appointment found with this reference ID.';
          }
        } else if (hasReportNum) {
          const rptMatch = userMsg.match(/\bRPT-\d{6}\b/i)[0].toUpperCase();
          const res = await fetch(`${API_BASE}/public/report-status?reportNumber=${encodeURIComponent(rptMatch)}`);
          const data = res.ok ? await res.json() : null;
          const rpt = data?.reports?.[0];
          if (rpt) {
            statusText = modalLanguage === 'hi'
              ? `📄 *रिपोर्ट स्थिति*\n\n🔖 रिपोर्ट #: ${rpt.reportNumber}\n👤 मरीज: ${rpt.patientName}\n📅 तारीख: ${new Date(rpt.reportDate).toLocaleDateString()}\n📋 स्थिति: ${rpt.statusLabel}`
              : `📄 *Report Status*\n\n🔖 Report #: ${rpt.reportNumber}\n👤 Patient: ${rpt.patientName}\n📅 Date: ${new Date(rpt.reportDate).toLocaleDateString()}\n📋 Status: ${rpt.statusLabel}`;
          } else {
            statusText = modalLanguage === 'hi'
              ? '❌ इस रिपोर्ट नंबर के साथ कोई रिपोर्ट नहीं मिली।'
              : '❌ No report found with this report number.';
          }
        } else {
          const mobileMatch = userMsg.match(/\b(\d{10})\b/);
          if (mobileMatch) {
            const mobile = mobileMatch[1];
            const res = await fetch(`${API_BASE}/public/appointment-status?mobile=${encodeURIComponent(mobile)}`);
            const data = res.ok ? await res.json() : null;
            if (data?.appointments?.length > 0) {
              const items = data.appointments.map((apt, i) =>
                `${i + 1}. 📌 ${apt.refId} | 📅 ${new Date(apt.date).toLocaleDateString()} ${apt.time} | ${apt.statusLabel}`
              ).join('\n');
              statusText = modalLanguage === 'hi'
                ? `📋 *${mobile} के लिए अपॉइंटमेंट स्थिति*\n\n${data.appointments.length} अपॉइंटमेंट मिले:\n\n${items}`
                : `📋 *Appointment Status for ${mobile}*\n\nFound ${data.appointments.length} appointment(s):\n\n${items}`;
            } else {
              const res2 = await fetch(`${API_BASE}/public/report-status?mobile=${encodeURIComponent(mobile)}`);
              const data2 = res2.ok ? await res2.json() : null;
              if (data2?.reports?.length > 0) {
                const items = data2.reports.map((r, i) =>
                  `${i + 1}. 🔖 ${r.reportNumber} | 📅 ${new Date(r.reportDate).toLocaleDateString()} | ${r.statusLabel}`
                ).join('\n');
                statusText = modalLanguage === 'hi'
                  ? `📄 *${mobile} के लिए रिपोर्ट स्थिति*\n\n${data2.reports.length} रिपोर्ट मिली:\n\n${items}`
                  : `📄 *Report Status for ${mobile}*\n\nFound ${data2.reports.length} report(s):\n\n${items}`;
              } else {
                statusText = modalLanguage === 'hi'
                  ? '❌ इस मोबाइल नंबर के साथ कोई रिकॉर्ड नहीं मिला।'
                  : '❌ No records found with this mobile number.';
              }
            }
          } else {
            statusText = modalLanguage === 'hi'
              ? `मैं आपके अपॉइंटमेंट या रिपोर्ट की स्थिति जांचने में मदद कर सकता हूँ। कृपया अपना सन्दर्भ ID (जैसे: SPL-APT-XXXXXX) या रजिस्टर्ड मोबाइल नंबर दें।`
              : `I can check your appointment or report status. Please provide your reference ID (e.g., SPL-APT-XXXXXX) or registered mobile number.`;
          }
        }

        setAiChatLoading(false);
        setChatMessages(prev => [...prev, { role: 'assistant', text: statusText }]);
        return;
      } catch (err) {
        console.error('Status lookup error:', err);
        // Fall through to AI if API fails
      }
    }

    try {
      const lang = modalLanguage === 'hi' ? 'Hindi (हिंदी)' : 'English';
      const prompt = `You are Sana AI, a helpful lab assistant for Sana Pathology Lab. Answer the following question in ${lang}. Be friendly, concise, and informative.

If the question is about lab tests, provide relevant information about what the test is, how to prepare, sample type, and what it checks. If it's a general health or medical question, provide accurate helpful information.
If the user asks about appointment status or report status, ask them to provide their reference ID (e.g., SPL-APT-XXXXXX) or registered mobile number so the system can check.
You can help with bookings, test info, home collection, lab timings, payment options, and report explanations.
If you are asked about something outside of lab tests and health, politely redirect to lab-related topics.

Question: ${userMsg}`;

      const response = await fetch(`${API_BASE}/public/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      setChatMessages(prev => [...prev, { role: 'assistant', text: text }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: modalLanguage === 'hi'
            ? 'क्षमा करें, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।'
            : 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setAiChatLoading(false);
    }
  };

  const handleStartChat = () => {
    setAiStep('chat');
    setChatMessages([{
      role: 'assistant',
      text: modalLanguage === 'hi'
        ? 'नमस्ते! मैं सना एआई हूँ। आप कोई भी प्रश्न पूछ सकते हैं - टेस्ट के बारे में, स्वास्थ्य संबंधी जानकारी, अपॉइंटमेंट या रिपोर्ट की स्थिति, या हमारी लैब सेवाओं के बारे में।'
        : 'Hello! I am Sana AI. You can ask me any question — about lab tests, health information, appointment or report status, or our lab services.'
    }]);
  };

  // Rendering Helper Methods for Modal Steps
  const renderWelcomeStep = () => {
    return (
      <View style={S.welcomeStep}>
        <View style={S.welcomeIconWrap}>
          <Text style={S.welcomeIconText}>✨</Text>
        </View>
        
        <Text style={S.welcomeTitle}>
          {modalLanguage === 'hi' ? 'स्मार्ट हेल्थ डायग्नोस्टिक असिस्टेंट' : 'Smart Health Diagnostic Assistant'}
        </Text>
        <Text style={S.welcomeDesc}>
          {modalLanguage === 'hi' 
            ? 'अपने लक्षणों के आधार पर केवल २ मिनट में सटीक, डॉक्टर-अनुमोदित टेस्ट सिफारिशें प्राप्त करें।' 
            : 'Discover precise, doctor-approved blood tests matching your symptoms in under 2 minutes.'}
        </Text>

        <View style={S.benefitsGrid}>
          {/* Benefit 1 */}
          <View style={S.benefitCard}>
            <Text style={S.benefitIcon}>🩺</Text>
            <View style={S.benefitTextContainer}>
              <Text style={S.benefitTitle}>
                {modalLanguage === 'hi' ? 'आवश्यक और सटीक' : 'Essential Only'}
              </Text>
              <Text style={S.benefitDesc}>
                {modalLanguage === 'hi' 
                  ? 'केवल वही टेस्ट जो जरूरी हों।' 
                  : 'Recommends only the minimum required tests.'}
              </Text>
            </View>
          </View>

          {/* Benefit 2 */}
          <View style={S.benefitCard}>
            <Text style={S.benefitIcon}>🤖</Text>
            <View style={S.benefitTextContainer}>
              <Text style={S.benefitTitle}>
                {modalLanguage === 'hi' ? '100% विश्वसनीय' : '100% Rule-Based'}
              </Text>
              <Text style={S.benefitDesc}>
                {modalLanguage === 'hi' 
                  ? 'असिस्टेंट आधिकारिक लैब नियमों पर आधारित है।' 
                  : 'Fully local state-machine ensures accurate mapping.'}
              </Text>
            </View>
          </View>

          {/* Benefit 3 */}
          <View style={S.benefitCard}>
            <Text style={S.benefitIcon}>💬</Text>
            <View style={S.benefitTextContainer}>
              <Text style={S.benefitTitle}>
                {modalLanguage === 'hi' ? 'द्विभाषी (Bilingual)' : 'Fully Bilingual'}
              </Text>
              <Text style={S.benefitDesc}>
                {modalLanguage === 'hi' 
                  ? 'हिंदी और इंग्लिश में परामर्श लें।' 
                  : 'Consult in English or हिंदी seamlessly.'}
              </Text>
            </View>
          </View>

          {/* Benefit 4 */}
          <View style={S.benefitCard}>
            <Text style={S.benefitIcon}>⚡</Text>
            <View style={S.benefitTextContainer}>
              <Text style={S.benefitTitle}>
                {modalLanguage === 'hi' ? 'त्वरित बुकिंग' : 'Instant Booking'}
              </Text>
              <Text style={S.benefitDesc}>
                {modalLanguage === 'hi' 
                  ? 'टेस्ट सीधे कार्ट में जोड़ें।' 
                  : 'Add recommended tests to your cart instantly.'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={S.consultStartBtn} onPress={() => setAiStep('register')}>
          <Text style={S.consultStartBtnText}>
            {modalLanguage === 'hi' ? 'मुफ़्त स्वास्थ्य परामर्श शुरू करें' : 'Start My Free Health Consult'} →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={S.chatStartBtn} onPress={handleStartChat}>
          <Text style={S.chatStartBtnText}>
            💬 {modalLanguage === 'hi' ? 'एआई से सामान्य प्रश्न पूछें' : 'Ask AI a General Question'} →
          </Text>
        </TouchableOpacity>

        <View style={S.welcomeFooter}>
          <Text style={S.welcomeFooterText}>
            🛡️ {modalLanguage === 'hi' ? 'सुरक्षित एवं 100% गोपनीय' : 'Secure & 100% Confidential Assessment'}
          </Text>
        </View>
      </View>
    );
  };

  const renderRegisterStep = () => {
    const isNextDisabled = !patientName.trim() || !patientAge || !patientGender;
    return (
      <View style={S.registerStep}>
        <View style={S.infoBanner}>
          <Text style={S.infoBannerText}>
            {modalLanguage === 'hi' 
              ? 'ℹ️ सटीक सिफारिशें देने के लिए कृपया मरीज का नाम, उम्र और लिंग दर्ज करें।' 
              : 'ℹ️ Please provide the patient\'s basic details to start matching symptoms and recommending relevant tests.'}
          </Text>
        </View>

        <Text style={S.fieldLabel}>
          {modalLanguage === 'hi' ? 'मरीज का नाम' : 'Patient Name'} *
        </Text>
        <TextInput
          style={S.modalInput}
          placeholder={modalLanguage === 'hi' ? 'उदा. राहुल कुमार' : 'e.g. Rahul Kumar'}
          placeholderTextColor="#94a3b8"
          value={patientName}
          onChangeText={setPatientName}
        />

        <Text style={S.fieldLabel}>
          {modalLanguage === 'hi' ? 'उम्र (वर्ष)' : 'Age (in Years)'} *
        </Text>
        <TextInput
          style={S.modalInput}
          placeholder={modalLanguage === 'hi' ? 'उदा. २८' : 'e.g. 28'}
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={patientAge}
          onChangeText={setPatientAge}
        />

        <Text style={S.fieldLabel}>
          {modalLanguage === 'hi' ? 'लिंग' : 'Gender'} *
        </Text>
        <View style={S.genderSelectRow}>
          {[
            { id: 'Male', labelEn: '👨 Male', labelHi: '👨 पुरुष' },
            { id: 'Female', labelEn: '👩 Female', labelHi: '👩 महिला' },
            { id: 'Other', labelEn: '🧑 Other', labelHi: '🧑 अन्य' },
          ].map(g => {
            const isSelected = patientGender === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                style={[
                  S.modalGenderBtn,
                  isSelected && S.modalGenderBtnActive,
                  isSelected && g.id === 'Male' && S.modalGenderBtnMale,
                  isSelected && g.id === 'Female' && S.modalGenderBtnFemale,
                  isSelected && g.id === 'Other' && S.modalGenderBtnOther,
                ]}
                onPress={() => setPatientGender(g.id)}
              >
                <Text style={[S.modalGenderBtnText, isSelected && S.modalGenderBtnTextActive]}>
                  {modalLanguage === 'hi' ? g.labelHi : g.labelEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={S.modalActionsRow}>
          <TouchableOpacity style={S.modalBackBtn} onPress={() => setAiStep('welcome')}>
            <Text style={S.modalBackBtnText}>
              {modalLanguage === 'hi' ? 'पीछे' : 'Back'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[S.modalProceedBtn, isNextDisabled && S.modalBtnDisabled]}
            disabled={isNextDisabled}
            onPress={() => {
              setAiStep('question');
              setAiNodeId('start');
              setAiHistory([]);
            }}
          >
            <Text style={S.modalProceedBtnText}>
              {modalLanguage === 'hi' ? 'लक्षण सर्वेक्षण शुरू करें' : 'Begin Diagnosis'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderQuestionStep = () => {
    const currentNode = QUESTION_FLOW[aiNodeId];
    if (!currentNode) return null;

    const questionText = currentNode.question[modalLanguage] || currentNode.question.en;
    const hintText = currentNode.question_hint ? (currentNode.question_hint[modalLanguage] || currentNode.question_hint.en) : null;
    const options = currentNode.options || [];

    const genderLabel = patientGender === 'Male' ? (modalLanguage === 'hi' ? 'पुरुष' : 'Male') : (patientGender === 'Female' ? (modalLanguage === 'hi' ? 'महिला' : 'Female') : (modalLanguage === 'hi' ? 'अन्य' : 'Other'));

    return (
      <View style={S.questionStep}>
        {/* Progress header info */}
        <View style={S.questionProgressBox}>
          <View style={S.questionProgressRow}>
            <View style={S.pulseDot} />
            <Text style={S.questionProgressInfo}>
              {patientName} • {patientAge}Y • {genderLabel}
            </Text>
          </View>
          <Text style={S.questionProgressCount}>
            {modalLanguage === 'hi' ? `प्रश्न ${aiHistory.length + 1}` : `Question ${aiHistory.length + 1}`}
          </Text>
          <View style={S.progressTrack}>
            <View style={[S.progressBar, { width: `${Math.min((aiHistory.length + 1) * 20, 100)}%` }]} />
          </View>
        </View>

        {/* Question content */}
        <View style={S.questionTextWrap}>
          <Text style={S.questionText}>{questionText}</Text>
          {hintText && (
            <Text style={S.questionHint}>💡 {hintText}</Text>
          )}
        </View>

        {/* Options list */}
        <View style={S.questionOptionsWrap}>
          {options.map((option, idx) => {
            const labelText = option.label[modalLanguage] || option.label.en;
            return (
              <TouchableOpacity
                key={idx}
                style={S.questionOptionBtn}
                onPress={() => handleSelectOption(option)}
              >
                <Text style={S.questionOptionText}>{labelText}</Text>
                <Text style={S.questionOptionArrow}>➔</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* General query button */}
        <TouchableOpacity
          style={S.inlineChatBtn}
          onPress={handleStartChat}
        >
          <Text style={S.inlineChatEmoji}>💬</Text>
          <View style={{ flex: 1 }}>
            <Text style={S.inlineChatTitle}>
              {modalLanguage === 'hi' ? 'कोई सामान्य प्रश्न पूछें' : 'Ask a General Question'}
            </Text>
            <Text style={S.inlineChatSub}>
              {modalLanguage === 'hi' ? 'टेस्ट, स्वास्थ्य या लैब के बारे में पूछें' : 'Ask about tests, health, or our lab'}
            </Text>
          </View>
          <Text style={S.inlineChatArrow}>➔</Text>
        </TouchableOpacity>

        {/* Back and Reset Actions */}
        <View style={S.modalActionsRow}>
          <TouchableOpacity style={S.modalHalfBtn} onPress={handleAiBack}>
            <Text style={S.modalHalfBtnText}>
              {modalLanguage === 'hi' ? 'पीछे' : 'Back'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.modalHalfBtn, S.modalHalfBtnReset]} onPress={handleResetAIAssessment}>
            <Text style={[S.modalHalfBtnText, S.modalHalfBtnTextReset]}>
              {modalLanguage === 'hi' ? 'रीसेट करें' : 'Reset'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderResultsStep = () => {
    const recs = TEST_RECOMMENDATIONS[currentResultKey];
    const totalSelectedPrice = Object.keys(selectedAiTests)
      .filter(code => selectedAiTests[code])
      .reduce((sum, code) => sum + getTestInfo(code).price, 0);
    const selectedCount = Object.keys(selectedAiTests).filter(code => selectedAiTests[code]).length;

    const genderLabel = patientGender === 'Male' ? (modalLanguage === 'hi' ? 'पुरुष' : 'Male') : (patientGender === 'Female' ? (modalLanguage === 'hi' ? 'महिला' : 'Female') : (modalLanguage === 'hi' ? 'अन्य' : 'Other'));

    const renderTestCard = (testCode, reasonText, urgencyType) => {
      const info = getTestInfo(testCode);
      const isChecked = !!selectedAiTests[testCode];
      
      let borderStyle = S.testCardNormal;
      let checkAccent = '#64748b';
      if (isChecked) {
        if (urgencyType === 'must_do') { borderStyle = S.testCardMustActive; checkAccent = '#ef4444'; }
        else if (urgencyType === 'recommended') { borderStyle = S.testCardRecActive; checkAccent = '#10b981'; }
        else if (urgencyType === 'optional') { borderStyle = S.testCardOptActive; checkAccent = '#f59e0b'; }
      }

      return (
        <TouchableOpacity
          key={testCode}
          style={[S.recTestCard, borderStyle]}
          onPress={() => setSelectedAiTests(prev => ({ ...prev, [testCode]: !prev[testCode] }))}
        >
          <View style={[S.recCheckbox, isChecked && { backgroundColor: checkAccent, borderColor: checkAccent }]}>
            {isChecked && <Text style={S.recCheckboxMark}>✓</Text>}
          </View>
          
          <View style={{ flex: 1 }}>
            <View style={S.recTestHeader}>
              <Text style={S.recTestName}>{info.name || info.testName}</Text>
              <Text style={[S.recTestPrice, { color: checkAccent }]}>₹{info.price}</Text>
            </View>
            <View style={S.recTestBadges}>
              <Text style={S.recBadgeText}>{info.category?.name || 'Pathology'}</Text>
              <Text style={S.recBadgeText}>{info.sampleType || 'Serum'}</Text>
            </View>
            <Text style={S.recTestReason}>
              {reasonText[modalLanguage] || reasonText.en}
            </Text>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <View style={S.resultsStep}>
        {/* Patient header summary */}
        <View style={S.resultsSummaryBox}>
          <Text style={S.resultsSummaryTitle}>
            {modalLanguage === 'hi' ? 'परामर्श सारांश' : 'Consultation Summary'}
          </Text>
          <Text style={S.resultsSummaryName}>
            {patientName} • {patientAge}Y • {genderLabel}
          </Text>
          {recs && (
            <View style={S.resultsSummaryLabelBg}>
              <Text style={S.resultsSummaryLabelText}>
                {recs.label[modalLanguage] || recs.label.en}
              </Text>
            </View>
          )}
        </View>

        {/* Pricing & Selection summary */}
        <View style={S.pricingCard}>
          <View>
            <Text style={S.pricingCardLabel}>
              {modalLanguage === 'hi' ? 'चयनित टेस्ट की कुल कीमत' : 'Total Price of Selected Tests'}
            </Text>
            <Text style={S.pricingCardVal}>₹{totalSelectedPrice}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={S.pricingCardLabel}>
              {modalLanguage === 'hi' ? 'कुल चुने गए टेस्ट' : 'Selected Tests Count'}
            </Text>
            <Text style={S.pricingCardCount}>
              {selectedCount} {modalLanguage === 'hi' ? 'टेस्ट' : 'Tests'}
            </Text>
          </View>
        </View>

        {recs ? (
          <View style={S.resultsList}>
            {/* Summary Advisory Banner */}
            <View style={S.summaryAdvisoryBanner}>
              <Text style={S.summaryAdvisoryText}>
                💡 {recs.summary[modalLanguage] || recs.summary.en}
              </Text>
            </View>

            {/* Must-Do Group */}
            {recs.must_do && recs.must_do.length > 0 && (
              <View style={S.recGroup}>
                <View style={S.recGroupHeader}>
                  <View style={[S.groupPulseDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={[S.recGroupTitle, { color: '#ef4444' }]}>
                    {modalLanguage === 'hi' ? 'आवश्यक टेस्ट (Must-Do)' : 'Must-Do Tests'}
                  </Text>
                </View>
                {recs.must_do.map(item => renderTestCard(item.test_code, item.reason, 'must_do'))}
              </View>
            )}

            {/* Recommended Group */}
            {recs.recommended && recs.recommended.length > 0 && (
              <View style={S.recGroup}>
                <View style={S.recGroupHeader}>
                  <View style={[S.groupPulseDot, { backgroundColor: '#10b981' }]} />
                  <Text style={[S.recGroupTitle, { color: '#10b981' }]}>
                    {modalLanguage === 'hi' ? 'अनुशंसित टेस्ट' : 'Recommended Tests'}
                  </Text>
                </View>
                {recs.recommended.map(item => renderTestCard(item.test_code, item.reason, 'recommended'))}
              </View>
            )}

            {/* Optional Group */}
            {recs.optional && recs.optional.length > 0 && (
              <View style={S.recGroup}>
                <View style={S.recGroupHeader}>
                  <View style={[S.groupPulseDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={[S.recGroupTitle, { color: '#f59e0b' }]}>
                    {modalLanguage === 'hi' ? 'वैकल्पिक टेस्ट' : 'Optional Tests'}
                  </Text>
                </View>
                {recs.optional.map(item => renderTestCard(item.test_code, item.reason, 'optional'))}
              </View>
            )}

            {/* AI Note Advisory */}
            {recs.ai_note && (
              <View style={S.aiNoteBox}>
                <Text style={S.aiNoteHeader}>
                  ℹ️ {modalLanguage === 'hi' ? 'विशेष एआई टिप्पणी:' : 'Special AI Advisory Note:'}
                </Text>
                <Text style={S.aiNoteText}>
                  {recs.ai_note[modalLanguage] || recs.ai_note.en}
                </Text>
              </View>
            )}

            {/* Upsell Packages */}
            <View style={[S.recGroup, { borderTopWidth: 1, borderTopColor: SLATE_200, paddingTop: 14 }]}>
              <View style={S.recGroupHeader}>
                <View style={[S.groupPulseDot, { backgroundColor: '#3b82f6' }]} />
                <Text style={[S.recGroupTitle, { color: '#3b82f6' }]}>
                  {modalLanguage === 'hi' ? 'विशेष स्वास्थ्य पैकेज' : 'Suggested Health Packages'}
                </Text>
              </View>
              {HEALTH_PACKAGES.slice(0, 2).map((pkg) => {
                const isChecked = !!selectedAiTests[pkg.code];
                return (
                  <TouchableOpacity
                    key={pkg.code}
                    style={[S.recTestCard, isChecked ? S.testCardPkgActive : S.testCardNormal]}
                    onPress={() => setSelectedAiTests(prev => ({ ...prev, [pkg.code]: !prev[pkg.code] }))}
                  >
                    <View style={[S.recCheckbox, isChecked && { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }]}>
                      {isChecked && <Text style={S.recCheckboxMark}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={S.recTestHeader}>
                        <Text style={S.recTestName}>{pkg.name}</Text>
                        <Text style={[S.recTestPrice, { color: '#3b82f6' }]}>₹{pkg.price}</Text>
                      </View>
                      <View style={S.recTestBadges}>
                        <Text style={S.recBadgeText}>Package</Text>
                        <Text style={[S.recBadgeText, { color: '#2563eb', backgroundColor: '#dbeafe' }]}>{pkg.badge}</Text>
                      </View>
                      <Text style={S.recTestReason}>{pkg.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Contact lab for discounts banner */}
            <View style={S.discountCallout}>
              <Text style={S.discountCalloutText}>
                ℹ️ {modalLanguage === 'hi' ? 'विशेष छूट और ऑफर्स के लिए सीधे लैब से संपर्क करें' : 'Contact the lab directly for special discounts and offers'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={S.noRecsBox}>
            <Text style={S.noRecsText}>
              {modalLanguage === 'hi' ? 'कोई सिफारिश नहीं मिली।' : 'No recommendations found.'}
            </Text>
          </View>
        )}

        {/* Results Actions Footer */}
        <View style={S.resultsActionsRow}>
          <TouchableOpacity style={S.resultsNewBtn} onPress={handleResetAIAssessment}>
            <Text style={S.resultsNewBtnText}>
              {modalLanguage === 'hi' ? 'नया परामर्श' : 'New Consult'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.resultsBookBtn} onPress={handleApplyRecommendedTests}>
            <Text style={S.resultsBookBtnText}>
              {modalLanguage === 'hi' ? 'चयनित टेस्ट बुक करें' : 'Book Selected Tests'} {totalSelectedPrice > 0 && ` (₹${totalSelectedPrice})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderChatStep = () => {
    return (
      <View style={S.chatStepContainer}>
        {/* Chat info header */}
        <View style={S.chatHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={S.chatHeaderTitle}>
              {modalLanguage === 'hi' ? 'सना एआई चैट' : 'Sana AI Chat'}
            </Text>
            <Text style={S.chatHeaderSub}>
              {modalLanguage === 'hi' ? 'कोई भी प्रश्न पूछें' : 'Ask me anything'}
            </Text>
          </View>
          <TouchableOpacity
            style={S.chatHeaderBackBtn}
            onPress={() => setAiStep('question')}
          >
            <Text style={S.chatHeaderBackBtnText}>
              {modalLanguage === 'hi' ? 'लक्षण सर्वेक्षण' : 'Back to Symptoms'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Message bubbles list */}
        <ScrollView 
          style={S.chatMessagesScroll} 
          contentContainerStyle={S.chatMessagesContent}
          ref={chatScrollRef}
          onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
        >
          {chatMessages.length === 0 ? (
            <View style={S.chatEmptyWrap}>
              <Text style={S.chatEmptyIcon}>💬</Text>
              <Text style={S.chatEmptyText}>
                {modalLanguage === 'hi' ? 'कोई भी प्रश्न पूछें, मैं मदद के लिए तैयार हूँ!' : "Ask any question, I'm here to help!"}
              </Text>
            </View>
          ) : (
            chatMessages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <View key={idx} style={[S.chatBubbleWrap, isUser ? S.bubbleWrapUser : S.bubbleWrapAssistant]}>
                  <View style={[S.chatBubble, isUser ? S.bubbleUser : S.bubbleAssistant]}>
                    {!isUser && (
                      <Text style={S.bubbleRoleText}>Sana AI</Text>
                    )}
                    <Text style={[S.bubbleText, isUser ? S.bubbleTextUser : S.bubbleTextAssistant]}>
                      {msg.text}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
          
          {aiChatLoading && (
            <View style={[S.chatBubbleWrap, S.bubbleWrapAssistant]}>
              <View style={[S.chatBubble, S.bubbleAssistant]}>
                <View style={S.loadingRow}>
                  <ActivityIndicator size="small" color="#4f46e5" />
                  <Text style={[S.bubbleText, S.bubbleTextAssistant, { marginLeft: 8 }]}>
                    {modalLanguage === 'hi' ? 'सोच रहा हूँ...' : 'Thinking...'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={S.chatInputBar}>
            <TextInput
              style={S.chatTextInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder={modalLanguage === 'hi' ? 'अपना प्रश्न टाइप करें...' : 'Type your question...'}
              placeholderTextColor="#94a3b8"
              onSubmitEditing={handleSendChatMessage}
            />
            <TouchableOpacity
              style={[S.chatSendBtn, !chatInput.trim() && S.chatSendBtnDisabled]}
              disabled={!chatInput.trim() || aiChatLoading}
              onPress={handleSendChatMessage}
            >
              <Text style={S.chatSendBtnText}>➔</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
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

      {/* Floating AI Consultation Button */}
      <Animated.View style={{
        position: 'absolute',
        bottom: 24,
        left: 20,
        zIndex: 999,
        transform: [{ scale: pulseAnim }],
      }}>
        <TouchableOpacity
          style={S.aiFloatingBtn}
          activeOpacity={0.85}
          onPress={() => {
            handleResetAIAssessment();
            setIsAiModalOpen(true);
          }}
        >
          <Text style={S.aiFloatingBtnEmoji}>🤖</Text>
          <Text style={S.aiFloatingBtnText}>Sana AI Assistant</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* AI Assistant Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAiModalOpen}
        onRequestClose={() => setIsAiModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={S.modalOverlay}
        >
          <View style={S.modalContainer}>
            {/* HEADER */}
            <View style={S.modalHeader}>
              <View style={S.modalHeaderTitleRow}>
                <Text style={S.modalHeaderEmoji}>🤖</Text>
                <View>
                  <Text style={S.modalHeaderTitle}>
                    {modalLanguage === 'hi' ? 'सना पैथोलॉजी एआई' : 'Sana Pathology AI'}
                  </Text>
                  <Text style={S.modalHeaderSubtitle}>
                    {aiStep === 'welcome' && (modalLanguage === 'hi' ? 'स्वागत' : 'Welcome')}
                    {aiStep === 'register' && (modalLanguage === 'hi' ? 'मरीज का विवरण (१/३)' : 'Patient Details (1/3)')}
                    {aiStep === 'question' && (modalLanguage === 'hi' ? 'लक्षण सर्वेक्षण (२/३)' : 'Symptoms Survey (2/3)')}
                    {aiStep === 'chat' && (modalLanguage === 'hi' ? 'एआई चैट' : 'AI Chat')}
                    {aiStep === 'results' && (modalLanguage === 'hi' ? 'सिफारिशें (३/३)' : 'Recommendations (3/3)')}
                  </Text>
                </View>
              </View>
              
              {/* Language Toggle and Close Button */}
              <View style={S.modalHeaderRight}>
                <TouchableOpacity
                  style={S.langToggleBtn}
                  onPress={() => setModalLanguage(prev => prev === 'en' ? 'hi' : 'en')}
                >
                  <Text style={S.langToggleText}>
                    {modalLanguage === 'en' ? 'हिंदी' : 'EN'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={S.modalCloseBtn}
                  onPress={() => setIsAiModalOpen(false)}
                >
                  <Text style={S.modalCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* CONTENT STEP */}
            {aiStep === 'chat' ? (
              <View style={{ flex: 1 }}>
                {renderChatStep()}
              </View>
            ) : (
              <ScrollView contentContainerStyle={S.modalScrollContent} keyboardShouldPersistTaps="handled">
                {aiStep === 'welcome' && renderWelcomeStep()}
                {aiStep === 'register' && renderRegisterStep()}
                {aiStep === 'question' && renderQuestionStep()}
                {aiStep === 'results' && renderResultsStep()}
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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

  // ── AI CONSULTATION FLOATING BUTTON & MODAL STYLES
  aiFloatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEAL,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: GOLD,
  },
  aiFloatingBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 6,
  },
  aiFloatingBtnEmoji: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_100,
    backgroundColor: SLATE_50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalHeaderEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: TEAL,
  },
  modalHeaderSubtitle: {
    fontSize: 11,
    color: SLATE_500,
    fontWeight: '700',
    marginTop: 2,
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  langToggleBtn: {
    backgroundColor: 'rgba(8,80,65,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(8,80,65,0.15)',
  },
  langToggleText: {
    color: TEAL,
    fontSize: 11,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: SLATE_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    color: SLATE_700,
    fontSize: 13,
    fontWeight: '800',
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeStep: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  welcomeIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(8,80,65,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(8,80,65,0.15)',
  },
  welcomeIconText: {
    fontSize: 32,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: SLATE_800,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  welcomeDesc: {
    fontSize: 12,
    color: SLATE_500,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  benefitsGrid: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: SLATE_50,
    borderWidth: 1,
    borderColor: SLATE_100,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    fontSize: 22,
    width: 36,
    height: 36,
    backgroundColor: WHITE,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 36,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: SLATE_800,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  benefitDesc: {
    fontSize: 11,
    color: SLATE_500,
    marginTop: 2,
    lineHeight: 15,
  },
  consultStartBtn: {
    width: '100%',
    backgroundColor: TEAL,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
  },
  consultStartBtnText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },
  chatStartBtn: {
    width: '100%',
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  chatStartBtnText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },
  welcomeFooter: {
    alignItems: 'center',
  },
  welcomeFooterText: {
    fontSize: 11,
    color: SLATE_400,
    fontWeight: '700',
  },
  registerStep: {
    width: '100%',
  },
  infoBanner: {
    backgroundColor: 'rgba(8,80,65,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(8,80,65,0.12)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  infoBannerText: {
    fontSize: 12,
    color: TEAL,
    lineHeight: 17,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: SLATE_500,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: SLATE_50,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: SLATE_800,
    marginBottom: 16,
  },
  genderSelectRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  modalGenderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    alignItems: 'center',
    backgroundColor: SLATE_50,
  },
  modalGenderBtnActive: {
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  modalGenderBtnMale: {
    backgroundColor: '#3b82f6',
  },
  modalGenderBtnFemale: {
    backgroundColor: '#ec4899',
  },
  modalGenderBtnOther: {
    backgroundColor: TEAL,
  },
  modalGenderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: SLATE_500,
  },
  modalGenderBtnTextActive: {
    color: WHITE,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalBackBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: SLATE_300,
    alignItems: 'center',
    backgroundColor: WHITE,
  },
  modalBackBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: SLATE_600,
  },
  modalProceedBtn: {
    flex: 2,
    backgroundColor: TEAL,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalProceedBtnText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },
  modalBtnDisabled: {
    opacity: 0.5,
  },
  questionStep: {
    width: '100%',
  },
  questionProgressBox: {
    backgroundColor: SLATE_50,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SLATE_200,
    marginBottom: 20,
  },
  questionProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  questionProgressInfo: {
    fontSize: 11,
    fontWeight: '800',
    color: SLATE_500,
  },
  questionProgressCount: {
    fontSize: 12,
    fontWeight: '900',
    color: SLATE_800,
    alignSelf: 'flex-end',
    marginTop: -16,
  },
  progressTrack: {
    height: 6,
    backgroundColor: SLATE_200,
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: TEAL,
    borderRadius: 3,
  },
  questionTextWrap: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '900',
    color: SLATE_800,
    lineHeight: 22,
    marginBottom: 6,
  },
  questionHint: {
    fontSize: 11,
    color: SLATE_400,
    fontWeight: '700',
  },
  questionOptionsWrap: {
    gap: 10,
    marginBottom: 20,
  },
  questionOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: SLATE_100,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  questionOptionText: {
    fontSize: 13,
    fontWeight: '800',
    color: SLATE_700,
    flex: 1,
    paddingRight: 12,
  },
  questionOptionArrow: {
    fontSize: 12,
    color: SLATE_400,
  },
  inlineChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79,70,229,0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(79,70,229,0.15)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
  },
  inlineChatEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  inlineChatTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4338ca',
  },
  inlineChatSub: {
    fontSize: 10,
    color: '#4f46e5',
    marginTop: 2,
    fontWeight: '600',
  },
  inlineChatArrow: {
    fontSize: 12,
    color: '#4f46e5',
    marginLeft: 8,
  },
  modalHalfBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: SLATE_300,
    alignItems: 'center',
  },
  modalHalfBtnReset: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  modalHalfBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: SLATE_600,
  },
  modalHalfBtnTextReset: {
    color: '#dc2626',
  },
  resultsStep: {
    width: '100%',
  },
  resultsSummaryBox: {
    backgroundColor: SLATE_50,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SLATE_200,
    marginBottom: 12,
  },
  resultsSummaryTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: SLATE_400,
    textTransform: 'uppercase',
    letterSpacing: 1.0,
    marginBottom: 4,
  },
  resultsSummaryName: {
    fontSize: 13,
    fontWeight: '800',
    color: SLATE_800,
    marginBottom: 8,
  },
  resultsSummaryLabelBg: {
    backgroundColor: 'rgba(8,80,65,0.06)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(8,80,65,0.1)',
  },
  resultsSummaryLabelText: {
    fontSize: 11,
    color: TEAL,
    fontWeight: '900',
  },
  pricingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: SLATE_800,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: SLATE_700,
  },
  pricingCardLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: SLATE_400,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  pricingCardVal: {
    fontSize: 18,
    fontWeight: '900',
    color: GOLD,
  },
  pricingCardCount: {
    fontSize: 13,
    fontWeight: '800',
    color: WHITE,
  },
  resultsList: {
    gap: 14,
  },
  summaryAdvisoryBanner: {
    backgroundColor: 'rgba(16,185,129,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.15)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  summaryAdvisoryText: {
    fontSize: 11,
    color: SLATE_600,
    lineHeight: 16,
    fontWeight: '600',
  },
  recGroup: {
    marginBottom: 4,
  },
  recGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  recGroupTitle: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  recTestCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: WHITE,
    marginBottom: 8,
  },
  testCardNormal: {
    borderColor: SLATE_100,
  },
  testCardMustActive: {
    borderColor: '#fca5a5',
    backgroundColor: '#fffdfd',
  },
  testCardRecActive: {
    borderColor: '#6ee7b7',
    backgroundColor: '#fdfdfd',
  },
  testCardOptActive: {
    borderColor: '#fde68a',
    backgroundColor: '#fffdfb',
  },
  testCardPkgActive: {
    borderColor: '#93c5fd',
    backgroundColor: '#fdfdff',
  },
  recCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: SLATE_300,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  recCheckboxMark: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '900',
  },
  recTestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  recTestName: {
    fontSize: 13,
    fontWeight: '900',
    color: SLATE_800,
    flex: 1,
    paddingRight: 8,
  },
  recTestPrice: {
    fontSize: 13,
    fontWeight: '900',
  },
  recTestBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  recBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    backgroundColor: SLATE_100,
    color: SLATE_500,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  recTestReason: {
    fontSize: 11,
    color: SLATE_500,
    lineHeight: 15,
    backgroundColor: SLATE_50,
    borderWidth: 1,
    borderColor: SLATE_100,
    padding: 8,
    borderRadius: 10,
    fontWeight: '600',
  },
  aiNoteBox: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
  },
  aiNoteHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#78350f',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  aiNoteText: {
    fontSize: 11,
    color: '#92400e',
    lineHeight: 16,
    fontWeight: '600',
  },
  discountCallout: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  discountCalloutText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '700',
    textAlign: 'center',
  },
  noRecsBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noRecsText: {
    fontSize: 12,
    color: SLATE_500,
    fontStyle: 'italic',
  },
  resultsActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resultsNewBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: SLATE_300,
    alignItems: 'center',
    backgroundColor: WHITE,
  },
  resultsNewBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: SLATE_600,
  },
  resultsBookBtn: {
    flex: 2,
    backgroundColor: TEAL,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  resultsBookBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '800',
  },
  chatStepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: SLATE_100,
    paddingBottom: 10,
    marginBottom: 10,
  },
  chatHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: SLATE_800,
  },
  chatHeaderSub: {
    fontSize: 10,
    color: SLATE_400,
    fontWeight: '700',
    marginTop: 1,
  },
  chatHeaderBackBtn: {
    backgroundColor: 'rgba(79,70,229,0.06)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  chatHeaderBackBtnText: {
    fontSize: 11,
    color: '#4f46e5',
    fontWeight: '800',
  },
  chatMessagesScroll: {
    flex: 1,
    marginBottom: 10,
  },
  chatMessagesContent: {
    gap: 12,
    paddingBottom: 10,
  },
  chatEmptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  chatEmptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  chatEmptyText: {
    fontSize: 12,
    color: SLATE_400,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  chatBubbleWrap: {
    flexDirection: 'row',
    width: '100%',
  },
  bubbleWrapUser: {
    justifyContent: 'flex-end',
  },
  bubbleWrapAssistant: {
    justifyContent: 'flex-start',
  },
  chatBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#4f46e5',
  },
  bubbleAssistant: {
    backgroundColor: SLATE_100,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  bubbleRoleText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bubbleText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  bubbleTextUser: {
    color: WHITE,
  },
  bubbleTextAssistant: {
    color: SLATE_700,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInputBar: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
    paddingTop: 10,
    alignItems: 'center',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: SLATE_50,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: SLATE_800,
    fontWeight: '600',
  },
  chatSendBtn: {
    backgroundColor: '#4f46e5',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendBtnDisabled: {
    opacity: 0.5,
  },
  chatSendBtnText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '900',
  },
});

export default PublicWelcomeScreen;
