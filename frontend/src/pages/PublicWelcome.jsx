import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Phone, MapPin, Clock, CheckCircle2, Activity, Microscope, 
  UserCircle, Star, ChevronDown, ChevronUp, MessageCircle, ShieldCheck,
  Search, FileText, Heart, Filter, Sparkles, Check, Info, Trash2, Calendar,
  ArrowRight, Award, ShieldAlert, BadgePercent, TrendingUp, Zap, FlaskConical,
  ChevronLeft, ChevronRight, MessageSquare, Loader2, Send,
  Baby, Droplets, Calculator, AlertCircle
} from 'lucide-react';
import Logo from '../components/Logo';
import Loader from '../components/Loader';
import { useLanguage } from '../context/LanguageContext';
import { generateAI } from '../utils/ai';
import { QUESTION_FLOW, TEST_RECOMMENDATIONS } from '../utils/aiFlowData';
import { TESTS_DATA, HEALTH_PACKAGES_DATA as HEALTH_PACKAGES } from '../data/testsData';

import GoogleBusinessSchema from '../components/GoogleBusinessSchema';
import OfferBanner from '../components/OfferBanner';
import LiveAvailabilityIndicator from '../components/LiveAvailabilityIndicator';
import SocialProofTicker from '../components/SocialProofTicker';
import ExitIntentPopup from '../components/ExitIntentPopup';
import PinCodeChecker from '../components/PinCodeChecker';
import SymptomFinder from '../components/SymptomFinder';
import DynamicPackageBuilder from '../components/DynamicPackageBuilder';
import GiftHealthTest from '../components/GiftHealthTest';
import WhatsAppIcon from '../components/WhatsAppIcon';
import SubscriptionPlans from '../components/SubscriptionPlans';
import TestimonialVideoSection from '../components/TestimonialVideoSection';
import LiveChatWidget from '../components/LiveChatWidget';
import CouponSystem from '../components/CouponSystem';
import UpsellRecommendations from '../components/UpsellRecommendations';
import BloodTube3D from '../components/BloodTube3D';
import BookingWizard from '../components/BookingWizard';
import EmergencyWidget from '../components/EmergencyWidget';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AI_KNOWLEDGE_BASE = `
# Laboratory Patient Test Recommendation Guidelines

## AVAILABLE TESTS CATALOGUE:
- Thyroid Function Test (T3, T4, TSH) [Code: TFT, Price: ₹450]
- Thyroid Profile (T3, T4, TSH) [Code: TFT-01, Price: ₹500]
- HbA1c (Glycosylated Haemoglobin) [Code: HBA1C, Price: ₹400]
- Random Blood Sugar (RBS) [Code: GLU-01, Price: ₹100]
- Complete Blood Count (CBC) [Code: CBC, Price: ₹200]
- Hemoglobin (Hb) [Code: HB-01, Price: ₹100]
- ESR (Erythrocyte Sedimentation Rate) [Code: ESR-01, Price: ₹150]
- Prothrombin Time (PT) [Code: PT-01, Price: ₹250]
- TLC (Total Leucocytes Count) [Code: 016, Price: ₹50]
- Platelets Count [Code: 015, Price: ₹100]
- Blood Group ABO & Rh Factor [Code: BG, Price: ₹50]
- Liver Function Test (LFT) [Code: LFT, Price: ₹500]
- SGOT (AST) [Code: SGOT, Price: ₹100]
- SGPT (ALT) [Code: SGPT, Price: ₹100]
- SGOT-SGPT (Combined) [Code: SGOT-SGPT, Price: ₹250]
- Total Bilirubin [Code: BILIRUBIN-TOTAL-01, Price: ₹150]
- Kidney Function Test (KFT) [Code: KFT, Price: ₹500]
- Serum Creatinine [Code: CREAT-01, Price: ₹150]
- Blood Urea [Code: UREA-01, Price: ₹150]
- Serum Uric Acid [Code: URIC_ACID, Price: ₹100]
- Serum Calcium [Code: CALCIUM-01, Price: ₹200]
- Lipid Profile [Code: LIPID, Price: ₹650]
- CRP – C-Reactive Protein (Quantitative) [Code: CRP-QUANT-01, Price: ₹350]
- CRP – C-Reactive Protein [Code: CRP-01, Price: ₹250]
- Urine Examination (Routine & Microscopy) [Code: URINE, Price: ₹150]
- Rheumatoid Factor [Code: RF, Price: ₹350]
- Semen Analysis [Code: SEMEN-01, Price: ₹350]
- Ante-Natal Care (ANC) Profile [Code: ANC-01, Price: ₹1200]
- Malaria (MP) ELISA [Code: MP, Price: ₹100]
- Malaria Parasite Identification (Microscopy) [Code: MP-MICRO, Price: ₹150]
- Dengue Profile (IgG, IgM, NS1) [Code: DENGUE-01, Price: ₹1200]
- Widal Test [Code: WIDAL1, Price: ₹50]
- Widal Test (Rapid Slide Method) [Code: WIDAL, Price: ₹50]
- Typhidot (IgG & IgM) [Code: TYPHIDOT-01, Price: ₹100]
- Mantoux Test (Tuberculin Skin Test) [Code: MANTOUX-01, Price: ₹250]

## DECISION RULES & MAPPING:
1. **Fever**:
   - Always include Complete Blood Count (CBC) (₹200) as the base test for any fever.
   - If fever < 3 days: recommend CBC, Malaria Parasite (Microscopy) [MP-MICRO] or Malaria ELISA [MP], Dengue Profile [DENGUE-01].
   - If fever > 7 days: recommend CBC, Widal Test [WIDAL1], Typhidot [TYPHIDOT-01], Malaria (MP ELISA + Microscopy) [MP + MP-MICRO].
   - Fever with joint pain & rash: recommend Dengue Profile [DENGUE-01], CBC, Platelets Count [015].
   - Fever with chills & shivering: recommend Malaria Microscopy [MP-MICRO], Malaria ELISA [MP], CBC.
2. **Diabetes**:
   - If screening: Random Blood Sugar (RBS) [GLU-01], HbA1c [HBA1C].
   - If diabetic monitoring: HbA1c [HBA1C], RBS [GLU-01], Urine Examination [URINE] (check protein).
   - If diabetic with leg pain/swelling/wound: HbA1c [HBA1C], KFT, CBC.
3. **Thyroid**:
   - If suspected hypothyroidism (weight gain, fatigue, cold): Thyroid Function Test [TFT].
   - If suspected hyperthyroidism (weight loss, anxiety, palpitations): Thyroid Profile [TFT-01].
   - Monitoring: TFT [TFT].
4. **Heart / BP**:
   - Risk Screening: Lipid Profile [LIPID], RBS [GLU-01].
   - Chest pain concern: CBC, SGOT (AST) [SGOT], LFT, Lipid Profile [LIPID].
5. **Liver Problems**:
   - Jaundice suspected: LFT, Total Bilirubin [BILIRUBIN-TOTAL-01], SGOT-SGPT [SGOT-SGPT], CBC.
   - Fatty Liver/Alcohol: SGOT-SGPT [SGOT-SGPT], LFT, Lipid Profile [LIPID].
6. **Kidney Problems**:
   - UTI/burning urination: Urine Examination [URINE], CBC.
   - Kidney check/CKD: KFT, Serum Creatinine [CREAT-01], Blood Urea [UREA-01], Urine Examination [URINE] (protein).
7. **Joint Pain / Arthritis**:
   - Rheumatoid Arthritis: Rheumatoid Factor (RF) [RF], CRP Quantitative [CRP-QUANT-01], ESR [ESR-01].
   - Gout: Uric Acid [URIC_ACID], KFT, CBC.
8. **Pregnancy / Antenatal**:
   - Pregnant checkup: ANC Profile [ANC-01] (covers 13 parameters, ₹1200), Blood Group [BG], Hemoglobin [HB-01], Urine Examination [URINE], RBS/HbA1c.
9. **Weakness / Anemia**:
   - CBC, Hemoglobin [HB-01].
10. **Tuberculosis (TB) Suspected**:
    - Cough >2-3 weeks: Mantoux Test [MANTOUX-01], CBC, ESR [ESR-01]. Order LFT [LFT] as baseline before starting TB medication.
11. **Male Infertility**:
    - Semen Analysis [SEMEN-01].

## CRITICAL RULES FOR RECOMENDATION:
- If patient has ANY fever, always include CBC [CBC] as base test.
- Fever < 5 days -> Dengue Profile [DENGUE-01].
- Do NOT recommend Widal [WIDAL1] if fever is < 7 days. Recommend Typhidot [TYPHIDOT-01] instead.
- For Diabetes, always pair RBS [GLU-01] with HbA1c [HBA1C].
- For pregnant women, always suggest ANC Profile [ANC-01].
- Joint Pain: big toe/sudden = Gout (Uric Acid [URIC_ACID] first). Finger joints/morning stiffness = RA (RF [RF] first).
- Unexplained weight change, fatigue, hair loss, or irregular periods -> include TFT [TFT].
- Suspected TB: order LFT [LFT] as baseline first.
- Do NOT recommend sub-tests separately if parent panel (e.g. LFT, KFT, CBC, TFT, Lipid Profile, ANC Profile) is recommended.
`;

const DEFAULT_TESTS = TESTS_DATA;

// Health Tips Data
const HEALTH_TIPS = [
  { emoji: '💧', tipKey: 'healthTip0', tip: 'Drink 8 glasses of water daily to keep your kidneys healthy and toxins flushed out.' },
  { emoji: '🩸', tipKey: 'healthTip1', tip: 'Get a CBC test annually to monitor your blood count and catch anemia or infections early.' },
  { emoji: '🍎', tipKey: 'healthTip2', tip: 'Eating a balanced diet with fruits and vegetables can lower your cholesterol naturally.' },
  { emoji: '🏃', tipKey: 'healthTip3', tip: 'Just 30 minutes of walking a day reduces risk of heart disease by up to 35%.' },
  { emoji: '😴', tipKey: 'healthTip4', tip: '7-9 hours of quality sleep boosts immune function and reduces disease risk.' },
  { emoji: '🩺', tipKey: 'healthTip5', tip: 'Regular health checkups catch silent diseases like diabetes and hypertension early.' },
  { emoji: '🚭', tipKey: 'healthTip6', tip: 'Quitting smoking improves lung function within just 2 weeks of stopping.' },
  { emoji: '🧘', tipKey: 'healthTip7', tip: 'Managing stress through meditation or yoga can significantly lower blood pressure.' },
];

// Test Ticker Items
const TICKER_TESTS = TESTS_DATA.slice(0, 20).map(t => ({ name: t.testCode || t.testName, price: t.price }));

const PublicWelcome = () => {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [searchType, setSearchType] = useState('mobile');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientName, setPatientName] = useState('');
  const [countersVisible, setCountersVisible] = useState(false);
  const [counterValues, setCounterValues] = useState({ patients: 0, tests: 0, years: 0, reports: 0 });
  const statsRef = useRef(null);
  
  // Dynamic Test Explorer States
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQueryTest, setSearchQueryTest] = useState('');
  const [selectedTests, setSelectedTests] = useState(() => {
    try {
      const saved = localStorage.getItem('sana_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sana_cart', JSON.stringify(selectedTests));
  }, [selectedTests]);

  const [loadingTests, setLoadingTests] = useState(true);

  // Booking Form States
  const [bookingForm, setBookingForm] = useState({
    name: '',
    mobile: '',
    gender: 'MALE',
    address: '',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    preferredTime: '08:00',
    isHomeCollection: true
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // UPI payment state
  const [upiUtr, setUpiUtr] = useState('');
  const [upiSubmitted, setUpiSubmitted] = useState(false);
  const [upiLoading, setUpiLoading] = useState(false);
  const [upiError, setUpiError] = useState('');

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    if (!upiUtr || upiUtr.trim().length < 8) {
      setUpiError('Please enter a valid Transaction UTR / Reference ID.');
      return;
    }
    setUpiLoading(true);
    setUpiError('');
    try {
      const response = await fetch(`/api/public/appointments/${createdAppointment.id}/pay-upi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: upiUtr.trim() })
      });
      if (response.ok) {
        setUpiSubmitted(true);
      } else {
        const data = await response.json();
        setUpiError(data.message || 'Failed to submit payment reference. Please try again.');
      }
    } catch (err) {
      setUpiError('Network error. Failed to connect to server.');
    } finally {
      setUpiLoading(false);
    }
  };

  const [appointmentResults, setAppointmentResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // AI Symptom Assistant States (Bilingual & Structured)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiStep, setAiStep] = useState('welcome'); // 'welcome' | 'register' | 'question' | 'results' | 'chat'
  const [aiPatientName, setAiPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState(''); // 'Male' | 'Female' | 'Other'
  const [aiNodeId, setAiNodeId] = useState('start');
  const [aiHistory, setAiHistory] = useState([]);
  const [currentResultKey, setCurrentResultKey] = useState('');
  const [selectedAiTests, setSelectedAiTests] = useState({}); // { [testCode]: boolean }

  // General AI Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);

  // Helper to resolve test info with fallbacks
  const getTestInfo = (testCode) => {
    const pkg = HEALTH_PACKAGES.find(p => p.code === testCode);
    if (pkg) return { testName: pkg.name, testCode: pkg.code, price: pkg.price, sampleType: 'Package', category: { name: 'Health Package' }, isPackage: true };

    const apiTest = (tests || []).find(t => t.testCode === testCode);
    if (apiTest) return { ...apiTest, isPackage: false };

    const defTest = DEFAULT_TESTS.find(t => t.testCode === testCode);
    if (defTest) return defTest;

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

    return catalogue[testCode] || { testName: testCode, testCode: testCode, price: 150, sampleType: 'Serum', category: { name: 'General' } };
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
      alert(language === 'hi' ? 'कृपया कम से कम एक टेस्ट चुनें।' : 'Please select at least one test.');
      return;
    }

    setSelectedTests(prev => {
      const currentIds = new Set(prev.map(p => p.testCode));
      const newSelections = selectedCodes
        .filter(code => !currentIds.has(code))
        .map(code => {
          const info = getTestInfo(code);
          return {
            name: info.testName,
            price: info.price,
            testCode: info.testCode,
            isPackage: !!info.isPackage
          };
        });
      return [...prev, ...newSelections];
    });

    setBookingForm(prev => ({
      ...prev,
      name: aiPatientName || prev.name,
      gender: patientGender === 'Male' ? 'MALE' : (patientGender === 'Female' ? 'FEMALE' : 'OTHER')
    }));

    alert(language === 'hi' ? 'चुने गए टेस्ट सफलतापूर्वक कार्ट में जोड़े गए!' : 'Selected tests added to cart successfully!');
    handleResetAIAssessment();
    setIsAiModalOpen(false);
    setTimeout(() => scrollToSection('booking'), 100);
  };

  const handleResetAIAssessment = () => {
    setAiStep('welcome');
    setAiPatientName('');
    setPatientAge('');
    setPatientGender('');
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
    try {
      const lang = language === 'hi' ? 'Hindi (हिंदी)' : 'English';
      const prompt = `You are Sana AI, a helpful lab assistant for Sana Pathology Lab. Answer the following question in ${lang}. Be friendly, concise, and informative.

If the question is about lab tests, provide relevant information about what the test is, how to prepare, sample type, and what it checks. If it's a general health or medical question, provide accurate helpful information. If you are asked about something outside of lab tests and health, politely redirect to lab-related topics.

Question: ${userMsg}`;

      const response = await generateAI(prompt);
      setChatMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: language === 'hi' ? 'क्षमा करें, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  const handleStartChat = () => {
    setAiStep('chat');
    setChatMessages([{
      role: 'assistant',
      text: language === 'hi'
        ? 'नमस्ते! मैं सना एआई हूँ। आप कोई भी प्रश्न पूछ सकते हैं - टेस्ट के बारे में, स्वास्थ्य संबंधी जानकारी, या हमारी लैब सेवाओं के बारे में।'
        : 'Hello! I am Sana AI. You can ask me any question — about lab tests, health information, or our lab services.'
    }]);
  };

  const slides = ['slide1.png', 'slide2.png', 'slide3.png'];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchError('');
    setAppointmentResults([]);

    if (searchType === 'appointment') {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/public/appointment-lookup?mobile=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (res.ok) {
          setAppointmentResults(data);
          if (data.length === 0) {
            setSearchError('No collection requests found for this mobile number.');
          }
        } else {
          setSearchError(data.message || 'No collection requests found.');
        }
      } catch (err) {
        setSearchError('Failed to fetch tracking data. Please try again.');
      } finally {
        setSearchLoading(false);
      }
    } else {
      if (searchType === 'mobile') {
        navigate(`/report-lookup?mobile=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`/report-lookup?reportNumber=${encodeURIComponent(searchQuery.trim())}&patientName=${encodeURIComponent(patientName.trim())}`);
      }
    }
  };

  // Background slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Health tips auto-rotate
  useEffect(() => {
    const timer = setInterval(() => setCurrentTip(prev => (prev + 1) % HEALTH_TIPS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  // Animated counters via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countersVisible) {
        setCountersVisible(true);
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [countersVisible]);

  useEffect(() => {
    if (countersVisible) {
      const targets = { patients: 15000, tests: 80, years: 12, reports: 50000 };
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounterValues({
          patients: Math.round(targets.patients * eased),
          tests: Math.round(targets.tests * eased),
          years: Math.round(targets.years * eased),
          reports: Math.round(targets.reports * eased),
        });
        if (step >= steps) clearInterval(timer);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [countersVisible]);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load tests from API
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/public/tests');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setTests(data);
            const cats = new Set(data.map(t => t.category?.name || 'Other'));
            setCategories(['All', ...Array.from(cats)]);
          } else {
            setTests(DEFAULT_TESTS);
            const cats = new Set(DEFAULT_TESTS.map(t => t.category?.name || 'Other'));
            setCategories(['All', ...Array.from(cats)]);
          }
        } else {
          setTests(DEFAULT_TESTS);
          const cats = new Set(DEFAULT_TESTS.map(t => t.category?.name || 'Other'));
          setCategories(['All', ...Array.from(cats)]);
        }
      } catch (err) {
        console.error('Failed to fetch tests', err);
        setTests(DEFAULT_TESTS);
        const cats = new Set(DEFAULT_TESTS.map(t => t.category?.name || 'Other'));
        setCategories(['All', ...Array.from(cats)]);
      } finally {
        setLoadingTests(false);
      }
    };
    fetchTests();
  }, []);

  const toggleFaq = (index) => {
    if (openFaq === index) setOpenFaq(null);
    else setOpenFaq(index);
  };

  // Dynamic test selection logic
  const toggleTestSelection = (testItem, isPkg = false) => {
    const key = isPkg ? testItem.code : testItem.testCode;
    const isSelected = selectedTests.some(t => t.testCode === key);
    
    if (isSelected) {
      setSelectedTests(prev => prev.filter(t => t.testCode !== key));
    } else {
      setSelectedTests(prev => [...prev, {
        name: isPkg ? testItem.name : testItem.testName,
        price: testItem.price,
        testCode: key,
        isPackage: isPkg
      }]);
    }
  };

  const removeSelectedTest = (code) => {
    setSelectedTests(prev => prev.filter(t => t.testCode !== code));
  };

  const clearSelection = () => {
    setSelectedTests([]);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleHomepageBookSubmit = async (e) => {
    e.preventDefault();
    if (selectedTests.length === 0) {
      setBookingError('Please select at least one test or health package above to submit booking.');
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(false);

    const testListStr = selectedTests.map(t => `${t.name} (₹${t.price})`).join(', ');
    const notesContent = `Requested via Home Page. Tests/Packages: ${testListStr}. Mode: ${bookingForm.isHomeCollection ? 'Home Collection' : 'Lab Visit'}`;

    try {
      const response = await fetch('/api/public/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingForm.name,
          mobile: bookingForm.mobile,
          gender: bookingForm.gender,
          address: bookingForm.isHomeCollection ? bookingForm.address : 'Lab Visit',
          preferredDate: bookingForm.preferredDate,
          preferredTime: bookingForm.preferredTime,
          notes: notesContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedAppointment(data.appointment);
        setBookingSuccess(true);

        // Automatically trigger WhatsApp redirect
        const testListStr = selectedTests.map(t => `- ${t.name} (₹${t.price})`).join('\n');
        const msg = `*New Appointment Request (Home Page)*\n\n*Name:* ${bookingForm.name}\n*Mobile:* ${bookingForm.mobile}\n*Gender:* ${bookingForm.gender}\n*Date:* ${bookingForm.preferredDate} ${bookingForm.preferredTime}\n*Mode:* ${bookingForm.isHomeCollection ? 'Home Collection' : 'Clinic Visit'}\n*Address:* ${bookingForm.isHomeCollection ? bookingForm.address : 'N/A'}\n\n*Selected Tests/Packages:*\n${testListStr}\n\n*Total Amount:* ₹${selectedTests.reduce((acc, t) => acc + t.price, 0)}`;
        const labPhone = "916396786939"; 
        window.open(`https://wa.me/${labPhone}?text=${encodeURIComponent(msg)}`, '_blank');
      } else {
        const data = await response.json();
        setBookingError(data.message || 'Failed to submit appointment. Please try again.');
      }
    } catch (err) {
      setBookingError('Network error. Failed to connect to diagnostic server.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAlertWhatsApp = () => {
    const testListStr = selectedTests.map(t => `- ${t.name} (₹${t.price})`).join('\n');
    const msg = `*New Appointment Request (Home Page)*\n\n*Name:* ${bookingForm.name}\n*Mobile:* ${bookingForm.mobile}\n*Gender:* ${bookingForm.gender}\n*Date:* ${bookingForm.preferredDate} ${bookingForm.preferredTime}\n*Mode:* ${bookingForm.isHomeCollection ? 'Home Collection' : 'Clinic Visit'}\n*Address:* ${bookingForm.isHomeCollection ? bookingForm.address : 'N/A'}\n\n*Selected Tests/Packages:*\n${testListStr}\n\n*Total Amount:* ₹${selectedTests.reduce((acc, t) => acc + t.price, 0)}`;
    const labPhone = "916396786939"; 
    window.open(`https://wa.me/${labPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Filter tests matching criteria
  const activeTests = tests.length > 0 ? tests : DEFAULT_TESTS;
  const filteredTests = activeTests.filter(t => {
    const matchesCategory = selectedCategory === 'All' || (t.category?.name || 'Other') === selectedCategory;
    const matchesSearch = t.testName.toLowerCase().includes(searchQueryTest.toLowerCase()) || 
                          t.testCode.toLowerCase().includes(searchQueryTest.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPrice = selectedTests.reduce((acc, t) => acc + t.price, 0);

  const faqs = [
    { q: "Do I need to fast before a blood test?", a: "It depends on the test. Tests like Fasting Blood Sugar and Lipid Profile require 8-12 hours of fasting. Please check with our lab when booking." },
    { q: "Do you offer home sample collection?", a: "Yes, we provide free home sample collection within city limits for bookings above ₹500." },
    { q: "How will I receive my reports?", a: "You will receive a digital copy of your report via WhatsApp and Email within the promised turnaround time. You can also log into our website to download past reports." },
    { q: "What are the payment options?", a: "We accept Cash, UPI (Google Pay, PhonePe, Paytm), and major Credit/Debit cards at our lab and during home collection." },
    { q: "What is your turnaround time for reports?", a: "Most routine tests (like CBC, Sugar) are delivered within 6-12 hours. Specialized tests may take 24 hours." },
  ];

  return (
    <div className="min-h-screen bg-bg relative font-sans text-slate-800 scroll-smooth">
      <GoogleBusinessSchema />

      {/* Header */}
      <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo className="w-12 h-12 md:w-14 md:h-14 drop-shadow-md" />
            <div>
              <h1 className="text-2xl font-heading text-primary tracking-tight leading-none">
                {t('logoTitle')}
              </h1>
              <p className="text-xs text-primary-light font-bold tracking-wide uppercase mt-1">{t('logoSub')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-8 mr-4">
              <a href="#stats" onClick={(e) => { e.preventDefault(); scrollToSection('stats'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">{t('whyUs')}</a>
              <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">{t('packages')}</a>
              <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">{t('testFinder')}</a>
              <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">{t('bookOnline')}</a>
              <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">{t('faq')}</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">{t('contact')}</a>
            </div>
            
            <button 
              onClick={toggleLanguage}
              className="hidden md:flex items-center justify-center font-bold text-slate-600 bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-2 rounded-full shadow-inner"
              title="Switch Language"
            >
              {language === 'en' ? 'HI' : 'EN'}
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }}
              className="relative flex items-center justify-center p-2 text-slate-600 hover:text-primary transition-colors hover:bg-slate-100 rounded-full"
              title="Your Booking Cart"
            >
              <Heart className="w-6 h-6 text-red-500 fill-red-50" />
              {selectedTests.length > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  {selectedTests.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-primary hover:bg-primary-light transition-all px-4 py-2 md:px-6 md:py-2.5 rounded-full shadow-lg shadow-primary/30 ring-2 ring-primary/40 ring-offset-2 ring-offset-white"
            >
              <UserCircle size={18} className="hidden sm:block" />
              {t('staffLogin')}
            </button>
          </div>
        </div>
      </header>

      <OfferBanner />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden bg-[#063b30]">
        {/* Sliding Background Images */}
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-[0.18] scale-105' : 'opacity-0 scale-100'}`}
          >
            <img src={slide} alt="Lab background" className="w-full h-full object-cover" />
          </div>
        ))}
        {/* Dark Teal Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#063b30]/95 via-[#085041]/85 to-[#0b6b55]/40"></div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"></div>

        {/* Floating Background Particles */}
        <div className="absolute top-[15%] left-[8%] w-3.5 h-3.5 bg-emerald-400/25 rounded-full blur-[1px] animate-float-p1 pointer-events-none"></div>
        <div className="absolute top-[40%] left-[25%] w-4 h-4 bg-teal-300/15 rounded-full blur-[2px] animate-float-p2 pointer-events-none"></div>
        <div className="absolute bottom-[20%] left-[12%] w-2.5 h-2.5 bg-yellow-300/20 rounded-full blur-[1px] animate-float-p1 pointer-events-none"></div>
        <div className="absolute top-[25%] right-[15%] w-5 h-5 bg-emerald-400/15 rounded-full blur-[3px] animate-float-p2 pointer-events-none"></div>
        <div className="absolute bottom-[35%] right-[28%] w-3 h-3 bg-teal-300/25 rounded-full blur-[1px] animate-float-p1 pointer-events-none"></div>
        <div className="absolute top-[60%] right-[8%] w-4 h-4 bg-yellow-300/20 rounded-full blur-[2px] animate-float-p2 pointer-events-none"></div>

        {/* Decorative Blobs */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary-light/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 mb-12">
            
            {/* Left Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-primary-pale text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md border border-white/20 animate-pulse-glow-teal">
                <CheckCircle2 size={16} className="text-[#F1C40F]" />
                {t('isoCertified')}
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black text-white leading-[1.1] mb-6 drop-shadow-lg">
                {t('welcome')}
              </h2>
              <p className="text-lg md:text-xl text-blue-100/90 mb-8 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed drop-shadow-md">
                {t('welcomeSub')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => scrollToSection('booking')} 
                  className="w-full sm:w-auto bg-gradient-to-r from-[#BA7517] to-[#d68f23] hover:from-[#c97f1a] hover:to-[#e39c2f] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-[#BA7517]/30 hover:-translate-y-1 animate-pulse-glow-gold active:scale-[0.98] relative overflow-hidden group"
                >
                  <Calendar size={20} className="group-hover:rotate-12 transition-transform duration-350" />
                  {t('bookHomeCollection')}
                </button>
                <button 
                  onClick={() => scrollToSection('services')} 
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 active:scale-[0.98] shimmer-btn"
                >
                  <FileText size={20} />
                  {t('trackReports')}
                </button>
              </div>
            </div>

            {/* Right Content - 3D CSS Model */}
            <div className="w-full lg:w-1/2 h-[350px] sm:h-[450px] lg:h-[600px] relative mt-8 lg:mt-0 flex justify-center items-center">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl -z-10 animate-blob"></div>
              {/* Laboratory Blood Tube 3D Model */}
              <BloodTube3D />
            </div>

          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-white">
            <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-2xl border border-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"><CheckCircle2 className="text-[#F1C40F] animate-pulse" size={20} /><span className="font-semibold text-sm tracking-wide">{t('pts15k')}</span></div>
            <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-2xl border border-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"><Clock className="text-[#F1C40F] animate-pulse" size={20} /><span className="font-semibold text-sm tracking-wide">{t('tat612')}</span></div>
            <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-2xl border border-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"><Phone className="text-[#F1C40F] animate-pulse" size={20} /><span className="font-semibold text-sm tracking-wide">{t('freeHomeCollection')}</span></div>
            <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-2xl border border-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"><ShieldCheck className="text-[#F1C40F] animate-pulse" size={20} /><span className="font-semibold text-sm tracking-wide">{t('nablAccredited')}</span></div>
          </div>
          <LiveAvailabilityIndicator />
        </div>
      </section>

      <SocialProofTicker />

      {/* Test Price Ticker */}
      <div className="bg-[#085041] text-white py-2.5 overflow-hidden border-b border-emerald-800">
        <div className="flex items-center">
          <div className="shrink-0 bg-[#F1C40F] text-[#085041] text-xs font-black px-4 py-1.5 uppercase tracking-wider z-10 mr-4 rounded-r-full">{t('livePrices')}</div>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee">
              {[...TICKER_TESTS, ...TICKER_TESTS].map((tItem, i) => (
                <span key={i} className="inline-flex items-center gap-2 mr-10 text-sm font-semibold whitespace-nowrap">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
                  {t(tItem.name) === tItem.name ? tItem.name : t(tItem.name)}
                  <span className="text-[#F1C40F] font-black">₹{tItem.price}</span>
                  <span className="text-emerald-600 mx-2">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Health Tips Strip */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-b border-teal-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="shrink-0 bg-[#085041] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">{t('healthTip')}</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-700 truncate">
              {HEALTH_TIPS[currentTip].emoji} {t(HEALTH_TIPS[currentTip].tipKey) === HEALTH_TIPS[currentTip].tipKey ? HEALTH_TIPS[currentTip].tip : t(HEALTH_TIPS[currentTip].tipKey)}
            </p>
          </div>
          <div className="shrink-0 flex gap-1">
            {HEALTH_TIPS.map((_, i) => (
              <button key={i} onClick={() => setCurrentTip(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentTip ? 'bg-[#085041] w-4' : 'bg-slate-300'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animated Stats Section */}
      <section ref={statsRef} id="stats" className="py-20 bg-white relative overflow-hidden">
        {/* Subtle background blob */}
        <div className="absolute -top-[10%] -left-[10%] w-[400px] h-[400px] bg-primary-pale/25 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-[#085041] uppercase tracking-widest bg-[#085041]/10 px-4 py-1.5 rounded-full">{t('byTheNumbers')}</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mt-4 mb-2">{t('trustedByThousands')}</h2>
            <p className="text-slate-500 font-semibold">{t('statsSub')}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: t('patientsServed'), value: counterValues.patients.toLocaleString() + '+', icon: <UserCircle className="w-6 h-6 animate-pulse" />, color: 'text-[#085041]', bg: 'bg-[#085041]/5' },
              { label: t('testsAvailable'), value: counterValues.tests + '+', icon: <FlaskConical className="w-6 h-6 animate-pulse" />, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: t('yearsOfService'), value: counterValues.years + '+', icon: <Award className="w-6 h-6 animate-pulse" />, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: t('reportsDelivered'), value: counterValues.reports.toLocaleString() + '+', icon: <FileText className="w-6 h-6 animate-pulse" />, color: 'text-purple-700', bg: 'bg-purple-50' },
            ].map((s, i) => (
              <div key={i} className={`bg-white/50 backdrop-blur-md rounded-3xl border border-slate-100 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_45px_rgba(15,110,86,0.06)] hover:border-primary-light/25 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up stagger-${i+1}`}>
                <div className={`${s.bg} ${s.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`}>{s.icon}</div>
                <p className={`text-3xl font-black ${s.color} animate-count-up`}>{s.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, label: t('nablAccredited'), color: 'text-[#085041] bg-[#E1F5EE]/40 border-emerald-200/50 hover:bg-[#E1F5EE]/60' },
              { icon: <Award className="w-4 h-4" />, label: t('iso15189'), color: 'text-blue-700 bg-blue-50/40 border-blue-200/50 hover:bg-blue-50/60' },
              { icon: <Clock className="w-4 h-4" />, label: t('tat612hr'), color: 'text-[#BA7517] bg-[#FAEEDA]/40 border-amber-200/50 hover:bg-[#FAEEDA]/60' },
              { icon: <Heart className="w-4 h-4" />, label: t('compassionateCare'), color: 'text-rose-600 bg-rose-50/40 border-rose-200/50 hover:bg-rose-50/60' },
              { icon: <Zap className="w-4 h-4" />, label: t('digitalReports'), color: 'text-purple-700 bg-purple-50/40 border-purple-200/50 hover:bg-purple-50/60' },
              { icon: <Phone className="w-4 h-4" />, label: t('freeHomeCollection'), color: 'text-teal-700 bg-teal-50/40 border-teal-200/50 hover:bg-teal-50/60' },
            ].map((badge, i) => (
              <div key={i} className={`inline-flex items-center gap-2 border px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 ${badge.color}`}>
                {badge.icon} {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lab Result Search Card */}
      {/* Lab Result Search Card */}
      <section id="search-section" className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
        {/* Soft glowing background element for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-light/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-[0_20px_50px_rgba(15,110,86,0.08)] border border-white/60 p-6 md:p-8 relative z-10 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(15,110,86,0.12)]">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="bg-gradient-to-br from-primary-pale to-white p-3.5 rounded-2xl text-primary border border-primary-light/10 shadow-inner">
              <FileText className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Access Your Diagnostics Portal</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Download reports or track home collection requests without signing in.</p>
            </div>
          </div>
          
          {/* Tab Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex w-full max-w-lg border border-slate-200">
              <button
                type="button"
                onClick={() => { setSearchType('report'); setAppointmentResults([]); setSearchError(''); setQuery(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all ${
                  searchType === 'report' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-primary'
                }`}
              >
                Report Number + Name
              </button>
              <button
                type="button"
                onClick={() => { setSearchType('mobile'); setAppointmentResults([]); setSearchError(''); setQuery(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all ${
                  searchType === 'mobile' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-primary'
                }`}
              >
                Mobile Number
              </button>
              <button
                type="button"
                onClick={() => { setSearchType('appointment'); setAppointmentResults([]); setSearchError(''); setQuery(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all ${
                  searchType === 'appointment' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-primary'
                }`}
              >
                Track Request
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4 max-w-2xl mx-auto">
            {searchType === 'report' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Report Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SPL-0001"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl outline-none text-sm font-semibold text-slate-700 bg-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Patient Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl outline-none text-sm font-semibold text-slate-700 bg-white"
                    required
                  />
                </div>
              </div>
            )}

            {searchType === 'mobile' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Registered Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl outline-none text-sm font-semibold text-slate-700 bg-white"
                  required
                />
              </div>
            )}

            {searchType === 'appointment' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Mobile Number Used for Booking</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl outline-none text-sm font-semibold text-slate-700 bg-white"
                  required
                />
              </div>
            )}

            {/* Helper Text */}
            <p className="text-xs text-slate-400 font-medium">
              {searchType === 'report' && "💡 Enter the report ID and patient's name exactly as written on your receipt to access reports without logging in."}
              {searchType === 'mobile' && "💡 Enter your registered mobile number to search and view all diagnostic reports assigned to you."}
              {searchType === 'appointment' && "💡 Track your home collection appointment status and phlebotomist assignment state in real-time."}
            </p>

            <button
              type="submit"
              className="w-full bg-[#00488d] hover:bg-blue-800 text-white font-black py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
            >
              <Search className="w-5 h-5" />
              {searchType === 'appointment' ? 'Track Collection Request' : 'Find Verified Report'}
            </button>
          </form>

          {/* Appointment Tracking Results */}
          {searchType === 'appointment' && (searchLoading || appointmentResults.length > 0 || searchError) && (
            <div className="mt-8 border-t border-slate-100 pt-6 animate-fade-in-up">
              {searchLoading && (
                <div className="flex items-center justify-center py-6 gap-2 text-slate-500 font-semibold text-sm">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span>Searching collection requests...</span>
                </div>
              )}
              
              {searchError && (
                <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <ShieldAlert size={16} className="text-red-600 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}
              
              {appointmentResults.length > 0 && (
                <div className="space-y-6">
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                    Found {appointmentResults.length} collection request(s)
                  </h4>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {appointmentResults.map((apt) => {
                      let testDetails = 'Routine checkup';
                      if (apt.notes) {
                        const match = apt.notes.match(/Tests\/Packages:\s*(.*)\.\s*Mode:/) || apt.notes.match(/Selected tests:\s*(.*)\.\s*Mode:/) || apt.notes.match(/Tests:\s*(.*)\.\s*Total:/);
                        if (match && match[1]) {
                          testDetails = match[1];
                        } else {
                          testDetails = apt.notes;
                        }
                      }
                      
                      const refId = `SPL-APT-${apt.id.toString().padStart(6, '0')}`;
                      const isHome = !apt.notes || !apt.notes.includes('Mode: Lab Visit') || apt.address !== 'Lab Visit';
                      
                      // Map status to 5 progress states
                      const steps = [
                        { label: 'Sample Booked', completed: true },
                        { label: 'Sample Collected', completed: apt.status === 'COMPLETED' },
                        { label: 'In Process', completed: apt.status === 'COMPLETED' }, // If completed, sample is in lab process
                        { label: 'Verified', completed: false },
                        { label: 'Ready to Download', completed: false }
                      ];

                      return (
                        <div key={apt.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-primary-light transition-colors space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div>
                              <span className="font-black text-slate-800 text-sm">{refId}</span>
                              <p className="text-xs text-slate-600 font-bold mt-0.5">{testDetails}</p>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border self-start sm:self-center uppercase ${
                              apt.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              apt.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              apt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              'bg-red-50 text-red-800 border-red-200'
                            }`}>
                              {apt.status === 'SCHEDULED' && 'Pending Confirmation'}
                              {apt.status === 'CONFIRMED' && 'Scheduled'}
                              {apt.status === 'COMPLETED' && 'Sample Collected'}
                              {apt.status === 'CANCELLED' && 'Cancelled'}
                            </span>
                          </div>

                          {/* Visual Stepper */}
                          {apt.status !== 'CANCELLED' && (
                            <div className="w-full py-4 px-2 bg-white rounded-xl border border-slate-100">
                              <div className="flex flex-col sm:flex-row justify-between gap-3 text-left sm:text-center">
                                {steps.map((st, sidx) => (
                                  <div key={sidx} className="flex items-center sm:flex-col gap-2.5 sm:flex-1 relative">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border-2 z-10 transition-all ${
                                      st.completed 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : (sidx === 1 && apt.status === 'CONFIRMED')
                                          ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                                          : 'bg-white border-slate-200 text-slate-400'
                                    }`}>
                                      {st.completed ? '✓' : sidx + 1}
                                    </div>
                                    <span className={`text-[10px] font-bold ${st.completed ? 'text-slate-800' : 'text-slate-400'}`}>{st.label}</span>
                                    {sidx < steps.length - 1 && (
                                      <div className={`hidden sm:block absolute top-3 left-[60%] w-[80%] h-[2px] -z-0 ${
                                        steps[sidx+1].completed ? 'bg-emerald-500' : 'bg-slate-200'
                                      }`} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {apt.time}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><MapPin size={12} /> {isHome ? 'Home Collection' : 'Lab Visit'}</span>
                            </div>
                            
                            {apt.status === 'SCHEDULED' && (
                              <button
                                onClick={() => {
                                  const msg = `*Inquiry about Booking ${refId}*\n\n*Patient:* ${apt.patient?.fullName || apt.name || 'N/A'}\n*Date/Time:* ${new Date(apt.date).toLocaleDateString()} ${apt.time}\n*Status:* Pending Confirmation\n\n*Tests Requested:*\n${testDetails}`;
                                  window.open(`https://wa.me/916396786939?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="text-[10px] font-bold text-white bg-[#25D366] hover:bg-[#128C7E] px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <WhatsAppIcon size={12} /> Contact Lab
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>



      {/* Pathology Testing Journey (Interactive Visual Stepper) */}
      <section className="py-20 bg-gradient-to-b from-primary-pale/30 via-white to-bg px-4 sm:px-6 lg:px-8 border-y border-emerald-100/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black tracking-widest text-primary uppercase bg-primary-pale px-4 py-1.5 rounded-full">{t('process')}</span>
            <h2 className="text-4xl font-heading text-primary font-black mt-4">{t('howItWorks')}</h2>
            <p className="text-slate-500 mt-2 font-semibold">{t('processSub')}</p>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {[
              { step: '01', title: t('step1Title'), desc: t('step1Desc') },
              { step: '02', title: t('step2Title'), desc: t('step2Desc') },
              { step: '03', title: t('step3Title'), desc: t('step3Desc') },
              { step: '04', title: t('step4Title'), desc: t('step4Desc') },
              { step: '05', title: t('step5Title'), desc: t('step5Desc') }
            ].map((item, index) => (
              <div key={index} className="relative flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-primary-light flex items-center justify-center text-primary font-bold text-xl shadow-[0_10px_25px_rgba(29,158,117,0.12)] group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-light group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_15px_30px_rgba(15,110,86,0.25)] transition-all duration-300 z-10 relative overflow-hidden group-hover:-translate-y-1">
                  {item.step}
                </div>
                <h3 className="font-extrabold text-slate-800 mt-5 mb-2 text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm max-w-[200px] leading-relaxed font-semibold">{item.desc}</p>
                {index < 4 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[3px] bg-gradient-to-r from-primary-light/30 to-primary-light/10 z-0 group-hover:from-primary group-hover:to-primary-light/30 transition-all duration-500"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Health & Wellness Packages */}


      <section id="symptom-finder" className="py-20 bg-primary-pale/25 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SymptomFinder />
        </div>
      </section>

      {/* Direct Online Booking Form */}
      {/* Booking Wizard Section */}
      <BookingWizard 
        existingCart={selectedTests} 
        onCartUpdate={setSelectedTests} 
        scrollToSection={scrollToSection} 
      />

      {/* Pathologists Panel & Trust Panel Removed as per request */}



      <section id="testimonial-video" className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <TestimonialVideoSection />
        </div>
      </section>

      <section id="gift-health-test" className="py-20 bg-primary-pale/25 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <GiftHealthTest />
        </div>
      </section>

      <section id="subscription-plans" className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SubscriptionPlans />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-primary-pale/35 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading text-primary">{t('faqTitle')}</h2>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  {t('faq_q_' + i) === 'faq_q_' + i ? faq.q : t('faq_q_' + i)}
                  {openFaq === i ? <ChevronUp className="text-primary flex-shrink-0" /> : <ChevronDown className="text-primary flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-slate-600">
                    {t('faq_a_' + i) === 'faq_a_' + i ? faq.a : t('faq_a_' + i)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      {/* Final Conversion CTA & Local Trust Strip */}
      <section className="bg-gradient-to-r from-[#063b30] via-[#085041] to-[#0b6b55] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <span className="text-xs font-black tracking-widest text-[#F1C40F] uppercase bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
            Trusted Local Diagnostics
          </span>
          <h2 className="text-3xl md:text-5xl font-black font-heading leading-tight max-w-3xl mx-auto">
            Accurate Reports. Trusted Pathologist Oversight. Right at Your Doorstep.
          </h2>
          <p className="text-sm md:text-base text-emerald-100 max-w-2xl mx-auto font-medium leading-relaxed">
            Sana Pathology Lab is Sambhal's dedicated diagnostic service. We provide fast home sample collection, certified pathologist signatures on every report, and direct human support whenever you need it.
          </p>
          <div className="flex flex-wrap gap-4 justify-center items-center pt-4">
            <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
              ✓ Fast Home Collection
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
              ✓ Verified Pathologist signatures
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
              ✓ Direct Call Support
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button 
              onClick={() => scrollToSection('booking')}
              className="bg-[#BA7517] hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Book Test in 1 Minute
            </button>
            <a 
              href="tel:+916396786939"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Phone size={18} /> Call Lab Support
            </a>
          </div>
        </div>
      </section>

      {/* ══ LAB TOUR PREVIEW STRIP ══ */}
      <section className="py-20 bg-gradient-to-b from-[#F5F7F6] to-white border-y border-slate-200/50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-black text-[#0F6E56] uppercase tracking-widest bg-emerald-50 border border-emerald-200/60 px-3.5 py-1.5 rounded-full">
                Virtual Lab Tour
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-[#085041] mt-4">
                Inside Sana Pathology
              </h2>
              <p className="text-slate-500 mt-2 max-w-xl font-medium text-sm leading-relaxed">
                Step inside Sambhal's state-of-the-art diagnostic facility. Take a 3D-guided look at our equipment, clinical workflows, and biosafe environments.
              </p>
            </div>
            <Link to="/lab-tour" className="shrink-0 flex items-center gap-2 bg-[#0F6E56] hover:bg-[#085041] text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-700/20 transition-all hover:-translate-y-0.5">
              Launch Full Lab Tour <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { icon: UserCircle, name: 'Welcome Reception', color: 'from-blue-500 to-indigo-600', textClass: 'text-blue-600', bgClass: 'bg-blue-50 border border-blue-100', desc: 'Digital check-in & comfortable waiting space' },
              { icon: Activity, name: 'Sample Collection', color: 'from-emerald-500 to-teal-600', textClass: 'text-emerald-600', bgClass: 'bg-emerald-50 border border-emerald-100', desc: 'Sterile private cubicles & vacuum blood draw' },
              { icon: Heart, name: 'Hematology Section', color: 'from-red-500 to-rose-600', textClass: 'text-rose-600', bgClass: 'bg-red-50 border border-red-100', desc: '5-part cell counter for cell calculations' },
              { icon: FlaskConical, name: 'Biochemistry', color: 'from-amber-500 to-orange-600', textClass: 'text-amber-600', bgClass: 'bg-amber-50 border border-amber-100', desc: 'Automated liver, kidney & sugar panels' },
              { icon: ShieldCheck, name: 'Serology & Immunology', color: 'from-purple-500 to-violet-600', textClass: 'text-purple-600', bgClass: 'bg-purple-50 border border-purple-100', desc: 'Sensitive ELISA tests & infection screening' },
              { icon: Microscope, name: 'Microscopy Room', color: 'from-cyan-500 to-sky-600', textClass: 'text-cyan-600', bgClass: 'bg-cyan-50 border border-cyan-100', desc: 'High-powered manual review & smear analysis' },
            ].map(sec => {
              const IconComponent = sec.icon;
              return (
                <Link 
                  key={sec.name} 
                  to="/lab-tour" 
                  className="bg-white hover:bg-slate-50 border border-slate-100 hover:border-emerald-500/20 rounded-3xl p-6 text-left transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl ${sec.bgClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-6 h-6 ${sec.textClass}`} />
                    </div>
                    <h3 className="text-slate-800 font-extrabold text-sm mb-1.5 group-hover:text-[#0F6E56] transition-colors">{sec.name}</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">{sec.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight size={10} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ HEALTH CALCULATORS CTA ══ */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-[-30%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-30%] right-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12">
          {/* Left Column: Heading Block */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#F1C40F] uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
              <Calculator size={13} /> Free Health Tools
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent leading-tight animate-pulse" style={{ animationDuration: '4s' }}>
              Interactive Health Risk Assessment
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto lg:mx-0 font-medium text-sm leading-relaxed">
              Knowledge is prevention. Assess your risk profiles instantly with our clinically aligned calculators, and get direct test recommendations based on your scores.
            </p>
            <div className="pt-2">
              <Link to="/health-calculators" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#BA7517] to-[#d48924] hover:from-amber-600 hover:to-amber-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-amber-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all hover:-translate-y-0.5 text-sm">
                Try Free Health Calculators <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Column: 5 Mini Cards Grid + 1 filler */}
          <div className="flex-[1.2] w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'bmi', icon: Activity, label: 'BMI Calc', desc: 'Check body mass index and find metabolic screening needs.', color: 'emerald', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5' },
              { id: 'diabetes', icon: AlertCircle, label: 'Diabetes Risk', desc: 'Assess Type 2 diabetes risks based on lifestyle indicators.', color: 'amber', textClass: 'text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/5' },
              { id: 'heart', icon: Heart, label: 'Heart Risk', desc: 'Evaluate cardiovascular risk markers & recommended tests.', color: 'red', textClass: 'text-red-400', bgClass: 'bg-red-500/10 border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/5' },
              { id: 'duedate', icon: Baby, label: 'Pregnancy Due Date', desc: 'Track expected delivery date & crucial ANC test intervals.', color: 'pink', textClass: 'text-pink-400', bgClass: 'bg-pink-500/10 border-pink-500/20 hover:border-pink-500/40 hover:shadow-pink-500/5' },
              { id: 'water', icon: Droplets, label: 'Water Intake', desc: 'Estimate ideal daily hydration targets based on weight.', color: 'blue', textClass: 'text-blue-400', bgClass: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40 hover:shadow-blue-500/5' },
            ].map(calc => {
              const IconComponent = calc.icon;
              return (
                <Link
                  key={calc.id}
                  to={`/health-calculators`}
                  className={`bg-white/5 border border-white/5 backdrop-blur-md rounded-2xl p-5 text-left transition-all duration-300 group hover:-translate-y-1 ${calc.bgClass}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${calc.bgClass.split(' ')[0]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-5 h-5 ${calc.textClass}`} />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest transition-colors">Start →</span>
                  </div>
                  <h4 className="text-white font-extrabold text-sm mb-1.5">{calc.label}</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed font-semibold">{calc.desc}</p>
                </Link>
              );
            })}

            {/* View All Card filler */}
            <Link
              to="/health-calculators"
              className="bg-white/5 border border-white/5 hover:border-white/10 backdrop-blur-md rounded-2xl p-5 text-left transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Interactive Tools</span>
                <span className="text-white font-black text-sm">🧮</span>
              </div>
              <div>
                <h4 className="text-white font-extrabold text-sm mt-4 mb-1">Explore All Tools</h4>
                <p className="text-slate-400 text-[11px] font-semibold leading-relaxed">Access the full clinical wellness suite of free tools.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CITY SEO SECTION ══ */}
      <section className="py-12 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-heading font-black text-slate-900 mb-2">🗺️ We Serve All of Sambhal District</h3>
            <p className="text-slate-500 text-sm">Home blood collection in Sambhal, Chandausi, Bahjoi, Sirsi and nearby areas.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { label: 'Blood Test Sambhal', emoji: '📍', route: '/blood-test-sambhal' },
              { label: 'Blood Test Chandausi', emoji: '📍', route: '/blood-test-chandausi' },
              { label: 'Blood Test Bahjoi', emoji: '📍', route: '/blood-test-bahjoi' },
              { label: 'Blood Test Sirsi', emoji: '📍', route: '/blood-test-sirsi' },
              { label: 'Home Collection Sambhal', emoji: '🚑', route: '/home-collection-sambhal' },
            ].map(city => (
              <Link key={city.route} to={city.route} className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 rounded-2xl px-4 py-4 font-bold text-sm text-slate-700 hover:text-[#0F6E56] transition-all group">
                <span>{city.emoji}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">{city.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#085041] pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-primary-pale">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-heading text-white mb-4">{t('logoTitle')}</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-6">{t('footerDesc')}</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#stats" onClick={(e) => { e.preventDefault(); scrollToSection('stats'); }} className="hover:text-white transition-colors">{t('whyUs')}</a></li>
              <li><a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }} className="hover:text-white transition-colors">{t('packages')}</a></li>
              <li><a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }} className="hover:text-white transition-colors">{t('testFinder')}</a></li>
              <li><a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }} className="hover:text-white transition-colors">{t('bookOnline')}</a></li>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }} className="hover:text-white transition-colors">{t('faq')}</a></li>
              <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">{t('patientPortal')}</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#F1C40F] mb-4">Location & Hours</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><strong>Address:</strong> Datawali Road, Near Aara Machine, Hayat Nagar, Sambhal-244303</li>
              <li><strong>Hours:</strong> Mon-Sat: 7:00 AM - 8:00 PM | Sun: 8:00 AM - 1:00 PM</li>
              <li><strong>Support:</strong> +91 6396786939</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">{t('certifications')}</h4>
            <div className="inline-block bg-white/10 px-4 py-2 rounded-lg border border-white/20">
              <span className="font-bold tracking-widest text-white text-xs">{t('nablAccredited')}</span>
            </div>
            <div className="mt-4">
              {/* Embed small static map card */}
              <div className="w-full h-24 rounded-lg overflow-hidden border border-white/10 relative">
                <iframe 
                  title="Footer map"
                  src="https://www.google.com/maps?q=28.5466795,78.5773542&z=14&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center border-t border-white/10 pt-8 text-sm opacity-60">
          {t('copyright')}
        </div>
      </footer>

      {/* Emergency Floating Widget — replaces old call+whatsapp buttons */}
      <EmergencyWidget />

      <LiveChatWidget />



      {/* Glassmorphic AI Consultation Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md transition-all duration-300 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_25px_60px_rgba(6,59,48,0.25)] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-scale-in relative">
            
            {/* Soft glowing ambient spots inside modal */}
            <div className="absolute top-[-20%] left-[-20%] w-[250px] h-[250px] bg-emerald-400/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[250px] h-[250px] bg-cyan-400/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#063b30] via-[#085041] to-[#0b6b55] text-white px-6 py-5 flex items-center justify-between relative shadow-[0_4px_25px_rgba(6,59,48,0.15)] z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/25 shadow-inner">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                    {t('aiAssistantTitle')}
                  </h3>
                  <p className="text-[11px] text-emerald-200/80 font-bold tracking-wide">
                    {language === 'hi' ? 'सटीक, न्यूनतम टेस्ट सिफारिशें' : 'Smart, minimal recommendations'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Embedded Language Toggle inside the Modal */}
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-1.5 text-xs font-black bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-xl text-white transition-all duration-200"
                >
                  {language === 'hi' ? 'ENGLISH' : 'हिंदी'}
                </button>
                <button 
                  onClick={() => {
                    setIsAiModalOpen(false);
                    handleResetAIAssessment();
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:rotate-90 text-white font-black text-sm"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
              
              {/* Step Tracking Info */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-100 pb-3">
                <span>{language === 'hi' ? 'मूल्यांकन चरण' : 'Assessment Phase'}</span>
                  <span className="text-emerald-700 font-extrabold uppercase tracking-wider">
                    {aiStep === 'welcome' && (language === 'hi' ? 'स्वागत' : 'Welcome')}
                    {aiStep === 'register' && (language === 'hi' ? 'मरीज का विवरण (१/३)' : 'Patient Details (1/3)')}
                    {aiStep === 'question' && (language === 'hi' ? 'लक्षण सर्वेक्षण (२/३)' : 'Symptoms Survey (2/3)')}
                    {aiStep === 'chat' && (language === 'hi' ? 'एआई चैट' : 'AI Chat')}
                    {aiStep === 'results' && (language === 'hi' ? 'सिफारिशें (३/३)' : 'Recommendations (3/3)')}
                  </span>
              </div>

              {/* Step 0: Welcome Screen */}
              {aiStep === 'welcome' && (
                <div className="space-y-6 text-center py-2 animate-fade-in">
                  <div className="relative w-24 h-24 mx-auto mb-2 flex items-center justify-center">
                    {/* Glowing highlight animation */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 opacity-30 blur-md animate-pulse"></div>
                    <div className="absolute -inset-2 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '4s' }}></div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 flex items-center justify-center border border-white/20 shadow-xl shadow-emerald-500/40 relative z-10">
                      <Sparkles className="w-8 h-8 text-yellow-300 animate-bounce" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h4 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                      <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        {language === 'hi' ? 'स्मार्ट हेल्थ डायग्नोस्टिक असिस्टेंट' : 'Smart Health Diagnostic Assistant'}
                      </span>
                    </h4>
                    <p className="text-sm text-slate-500 font-semibold max-w-sm mx-auto">
                      {language === 'hi' 
                        ? 'अपने लक्षणों के आधार पर केवल २ मिनट में सटीक, डॉक्टर-अनुमोदित टेस्ट सिफारिशें प्राप्त करें।' 
                        : 'Discover precise, doctor-approved blood tests matching your symptoms in under 2 minutes.'}
                    </p>
                  </div>

                  {/* Attractive Things (Pathfinder benefits grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-md mx-auto pt-2">
                    <div className="p-3.5 bg-slate-50/50 hover:bg-emerald-50/20 border border-slate-100 hover:border-emerald-200/50 rounded-2xl text-left transition-all duration-300 hover:scale-[1.01] flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 text-base shrink-0">
                        🩺
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                          {language === 'hi' ? 'आवश्यक और सटीक' : 'Essential Only'}
                        </h5>
                        <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5">
                          {language === 'hi' 
                            ? 'कोई फालतू टेस्ट नहीं। केवल वही टेस्ट जो जरूरी हों।' 
                            : 'No extra test bloat. Recommends only the minimum required tests.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50/50 hover:bg-cyan-50/20 border border-slate-100 hover:border-cyan-200/50 rounded-2xl text-left transition-all duration-300 hover:scale-[1.01] flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-800 text-base shrink-0">
                        🤖
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                          {language === 'hi' ? '100% विश्वसनीय' : '100% Rule-Based'}
                        </h5>
                        <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5">
                          {language === 'hi' 
                            ? 'असिस्टेंट आधिकारिक लैब नियमों के आधार पर काम करता है।' 
                            : 'Fully local state-machine ensures accurate diagnostic mapping.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50/50 hover:bg-amber-50/20 border border-slate-100 hover:border-amber-200/50 rounded-2xl text-left transition-all duration-300 hover:scale-[1.01] flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 text-base shrink-0">
                        💬
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                          {language === 'hi' ? 'द्विभाषी (Bilingual)' : 'Fully Bilingual'}
                        </h5>
                        <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5">
                          {language === 'hi' 
                            ? 'आसानी से हिंदी और इंग्लिश में परामर्श लें।' 
                            : 'Consult in English or हिंदी seamlessly at any point.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50/50 hover:bg-indigo-50/20 border border-slate-100 hover:border-indigo-200/50 rounded-2xl text-left transition-all duration-300 hover:scale-[1.01] flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-800 text-base shrink-0">
                        ⚡
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                          {language === 'hi' ? 'त्वरित बुकिंग' : 'Instant Booking'}
                        </h5>
                        <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5">
                          {language === 'hi' 
                            ? 'टेस्ट चुनें और सीधे अपने होम स्क्रीन कार्ट में जोड़ें।' 
                            : 'Select recommended tests and add them to your cart instantly.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 max-w-md mx-auto space-y-2.5">
                    <button 
                      onClick={() => setAiStep('register')}
                      className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-2xl text-base font-bold shadow-xl shadow-emerald-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shimmer-btn"
                    >
                      <span>{language === 'hi' ? 'मुफ़्त स्वास्थ्य परामर्श शुरू करें' : 'Start My Free Health Consult'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleStartChat}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shimmer-btn"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>{language === 'hi' ? 'एआई से सामान्य प्रश्न पूछें' : 'Ask AI a General Question'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className="text-[11px] text-slate-400 font-bold mt-2 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'hi' ? 'सुरक्षित एवं 100% गोपनीय' : 'Secure & 100% Confidential Assessment'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Registration Intake Form */}
              {aiStep === 'register' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-emerald-900 flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                      {language === 'hi' 
                        ? 'सटीक सिफारिशें देने के लिए कृपया मरीज का नाम, उम्र और लिंग दर्ज करें।' 
                        : 'Please provide the patient\'s basic details to start matching symptoms and recommending relevant tests.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Patient Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                        {language === 'hi' ? 'मरीज का नाम' : 'Patient Name'} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text"
                          value={aiPatientName}
                          onChange={(e) => setAiPatientName(e.target.value)}
                          placeholder={language === 'hi' ? 'उदा. राहुल कुमार' : 'e.g. Rahul Kumar'}
                          className="w-full border-2 border-slate-100 hover:border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white shadow-inner bg-slate-50/30 transition-all"
                        />
                      </div>
                    </div>

                    {/* Patient Age & Gender Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                          {language === 'hi' ? 'उम्र (वर्ष)' : 'Age (in Years)'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input 
                            type="number"
                            min="1"
                            max="120"
                            value={patientAge}
                            onChange={(e) => setPatientAge(e.target.value)}
                            placeholder={language === 'hi' ? 'उदा. २८' : 'e.g. 28'}
                            className="w-full border-2 border-slate-100 hover:border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white shadow-inner bg-slate-50/30 transition-all"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                          {language === 'hi' ? 'लिंग' : 'Gender'} <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Male', 'Female', 'Other'].map((g) => {
                            const isSelected = patientGender === g;
                            const displayGender = {
                              'Male': { en: '👨 Male', hi: '👨 पुरुष' },
                              'Female': { en: '👩 Female', hi: '👩 महिला' },
                              'Other': { en: '🧑 Other', hi: '🧑 अन्य' }
                            };
                            
                            // Gender-specific highlights
                            let activeClass = 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white';
                            if (g === 'Male') activeClass = 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/20';
                            if (g === 'Female') activeClass = 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md shadow-pink-500/20';
                            if (g === 'Other') activeClass = 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent shadow-md shadow-teal-500/20';

                            return (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setPatientGender(g)}
                                className={`py-3.5 text-xs font-bold rounded-2xl border transition-all ${
                                  isSelected 
                                    ? activeClass 
                                    : 'bg-slate-50/50 hover:bg-slate-100/50 text-slate-600 border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                {displayGender[g][language] || displayGender[g].en}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setAiStep('welcome')}
                      className="flex-1 py-3.5 border-2 border-slate-150 hover:border-slate-250 text-slate-600 font-bold rounded-2xl text-sm transition-all"
                    >
                      {language === 'hi' ? 'पीछे' : 'Back'}
                    </button>
                    <button 
                      onClick={() => {
                        if (aiPatientName.trim() && patientAge && patientGender) {
                          setAiStep('question');
                          setAiNodeId('start');
                          setAiHistory([]);
                        } else {
                          alert(language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill in all required fields.');
                        }
                      }}
                      disabled={!aiPatientName.trim() || !patientAge || !patientGender}
                      className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
                    >
                      {language === 'hi' ? 'लक्षण सर्वेक्षण शुरू करें' : 'Begin Diagnosis'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Interactive State Machine Question Flow */}
              {aiStep === 'question' && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Progress Indicator */}
                  <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-black uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {aiPatientName} • {patientAge}Y • {{ 'Male': language === 'hi' ? 'पुरुष' : 'Male', 'Female': language === 'hi' ? 'महिला' : 'Female', 'Other': language === 'hi' ? 'अन्य' : 'Other' }[patientGender]}
                      </span>
                      <span>{language === 'hi' ? `प्रश्न ${aiHistory.length + 1}` : `Question ${aiHistory.length + 1}`}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((aiHistory.length + 1) * 20, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Current Node Question */}
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {QUESTION_FLOW[aiNodeId]?.question[language] || QUESTION_FLOW[aiNodeId]?.question.en}
                    </h3>
                    {QUESTION_FLOW[aiNodeId]?.question_hint && (
                      <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                        <span>💡</span>
                        <span>{QUESTION_FLOW[aiNodeId]?.question_hint[language] || QUESTION_FLOW[aiNodeId]?.question_hint.en}</span>
                      </p>
                    )}
                  </div>

                  {/* Options Selection */}
                  <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
                    {(QUESTION_FLOW[aiNodeId]?.options || []).map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(option)}
                        className="w-full text-left p-4 bg-white hover:bg-gradient-to-r hover:from-emerald-50/40 hover:to-cyan-50/20 border-2 border-slate-100 hover:border-emerald-400/60 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_rgba(16,185,129,0.08)] hover:scale-[1.01] group"
                      >
                        <span className="text-sm font-black text-slate-700 group-hover:text-slate-900 leading-tight pr-4">
                          {option.label[language] || option.label.en}
                        </span>
                        <div className="w-7 h-7 rounded-xl bg-slate-50 group-hover:bg-emerald-500/10 flex items-center justify-center transition-all duration-300 shrink-0">
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Ask a General Question */}
                  <div className="pt-2">
                    <button
                      onClick={handleStartChat}
                      className="w-full text-left p-3.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200/50 hover:border-indigo-300/60 rounded-2xl flex items-center gap-3 transition-all duration-300 group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-black text-indigo-800 group-hover:text-indigo-900">
                          {language === 'hi' ? 'कोई सामान्य प्रश्न पूछें' : 'Ask a General Question'}
                        </span>
                        <p className="text-[11px] text-indigo-500 font-semibold mt-0.5">
                          {language === 'hi' ? 'टेस्ट, स्वास्थ्य या लैब के बारे में पूछें' : 'Ask about tests, health, or our lab'}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  </div>

                  {/* Back and Reset Footer */}
                  <div className="flex gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={handleAiBack}
                      className="flex-1 py-3 border-2 border-slate-150 hover:border-slate-255 text-slate-600 font-bold rounded-2xl text-sm transition-all"
                    >
                      {language === 'hi' ? 'पीछे' : 'Back'}
                    </button>
                    <button
                      onClick={handleResetAIAssessment}
                      className="flex-1 py-3 border-2 border-red-100 hover:border-red-200 text-red-500 hover:bg-red-50/30 font-bold rounded-2xl text-sm transition-all"
                    >
                      {language === 'hi' ? 'रीसेट करें' : 'Reset'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Free-text AI Chat */}
              {aiStep === 'chat' && (
                <div className="flex flex-col h-[65vh] sm:h-[60vh] animate-fade-in">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">
                          {language === 'hi' ? 'सना एआई चैट' : 'Sana AI Chat'}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {language === 'hi' ? 'कोई भी प्रश्न पूछें' : 'Ask me anything'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAiStep('question')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all"
                    >
                      {language === 'hi' ? 'लक्षण सर्वेक्षण पर वापस' : 'Back to Symptoms'}
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar mb-3">
                    {chatMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                        <MessageSquare className="w-10 h-10 mb-2 text-slate-300" />
                        <p className="text-sm font-bold">
                          {language === 'hi' ? 'कोई भी प्रश्न पूछें, मैं मदद के लिए तैयार हूँ!' : 'Ask any question, I\'m here to help!'}
                        </p>
                      </div>
                    )}
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 shadow-sm'
                        }`}>
                          {msg.role === 'assistant' && (
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block mb-1">
                              Sana AI
                            </span>
                          )}
                          <p className="font-semibold whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {aiChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                            <span className="text-xs font-bold text-slate-400">
                              {language === 'hi' ? 'सोच रहा हूँ...' : 'Thinking...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                      placeholder={language === 'hi' ? 'अपना प्रश्न टाइप करें...' : 'Type your question...'}
                      className="flex-1 border-2 border-slate-100 hover:border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-slate-50/30 transition-all"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      disabled={!chatInput.trim() || aiChatLoading}
                      className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Diagnostic Results & Test Recommendations */}
              {aiStep === 'results' && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Patient Summary Header */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                        {language === 'hi' ? 'परामर्श सारांश' : 'Consultation Summary'}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                        <UserCircle className="w-4.5 h-4.5 text-slate-500" />
                        {aiPatientName} • {patientAge}Y • {{ 'Male': language === 'hi' ? 'पुरुष' : 'Male', 'Female': language === 'hi' ? 'महिला' : 'Female', 'Other': language === 'hi' ? 'अन्य' : 'Other' }[patientGender]}
                      </h4>
                    </div>
                    
                    {currentResultKey && TEST_RECOMMENDATIONS[currentResultKey] && (
                      <span className="px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/50 rounded-full text-xs font-black self-start sm:self-center shadow-sm">
                        {TEST_RECOMMENDATIONS[currentResultKey].label[language] || TEST_RECOMMENDATIONS[currentResultKey].label.en}
                      </span>
                    )}
                  </div>

                  {/* Pricing Summary Card */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 flex justify-between items-center border border-slate-700 shadow-md">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                        {language === 'hi' ? 'चयनित टेस्ट की कुल कीमत' : 'Total Price of Selected Tests'}
                      </span>
                      <h4 className="text-xl font-black text-emerald-400">
                        ₹{Object.keys(selectedAiTests).filter(code => selectedAiTests[code]).reduce((sum, code) => sum + getTestInfo(code).price, 0)}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                        {language === 'hi' ? 'कुल चुने गए टेस्ट' : 'Selected Tests Count'}
                      </span>
                      <h4 className="text-sm font-black text-white">
                        {Object.keys(selectedAiTests).filter(code => selectedAiTests[code]).length} {language === 'hi' ? 'टेस्ट' : 'Tests'}
                      </h4>
                    </div>
                  </div>

                  {/* Results List */}
                  <div className="space-y-4 max-h-[42vh] overflow-y-auto pr-1 custom-scrollbar">
                    {currentResultKey && TEST_RECOMMENDATIONS[currentResultKey] ? (
                      <>
                        <div className="bg-emerald-50/20 p-3 rounded-xl border border-emerald-100/30 flex gap-2 items-start">
                          <Info className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-500 font-bold leading-relaxed">
                            {TEST_RECOMMENDATIONS[currentResultKey].summary[language] || TEST_RECOMMENDATIONS[currentResultKey].summary.en}
                          </p>
                        </div>

                        {/* Must Do (आवश्यक) */}
                        {TEST_RECOMMENDATIONS[currentResultKey].must_do && TEST_RECOMMENDATIONS[currentResultKey].must_do.length > 0 && (
                          <div className="space-y-2.5">
                            <h5 className="text-xs font-black text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                              {language === 'hi' ? 'आवश्यक टेस्ट (Must-Do)' : 'Must-Do Tests'}
                            </h5>
                            {TEST_RECOMMENDATIONS[currentResultKey].must_do.map((recTest) => {
                              const info = getTestInfo(recTest.test_code);
                              const isChecked = !!selectedAiTests[recTest.test_code];
                              return (
                                <div 
                                  key={recTest.test_code} 
                                  className={`p-4 rounded-2xl border-2 transition-all duration-300 flex gap-3.5 items-start cursor-pointer ${
                                    isChecked 
                                      ? 'bg-red-50/5 border-red-300 shadow-[0_4px_15px_rgba(239,68,68,0.05)]' 
                                      : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
                                  }`} 
                                  onClick={() => setSelectedAiTests(prev => ({ ...prev, [recTest.test_code]: !prev[recTest.test_code] }))}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked} 
                                    onChange={() => {}} 
                                    className="mt-1.5 accent-red-600 w-4 h-4 cursor-pointer rounded-lg" 
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <span className="text-sm font-extrabold text-slate-800 leading-tight">{info.testName}</span>
                                      <span className="text-sm font-black text-red-600 whitespace-nowrap ml-2">₹{info.price}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 flex gap-2 font-bold uppercase tracking-wider">
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-[9px] font-black">{info.category?.name || 'Pathology'}</span>
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-[9px] font-black">{info.sampleType || 'Serum'}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2.5 font-semibold bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                                      {recTest.reason[language] || recTest.reason.en}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Recommended (अनुशंसित) */}
                        {TEST_RECOMMENDATIONS[currentResultKey].recommended && TEST_RECOMMENDATIONS[currentResultKey].recommended.length > 0 && (
                          <div className="space-y-2.5 pt-1">
                            <h5 className="text-xs font-black text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                              {language === 'hi' ? 'अनुशंसित टेस्ट' : 'Recommended Tests'}
                            </h5>
                            {TEST_RECOMMENDATIONS[currentResultKey].recommended.map((recTest) => {
                              const info = getTestInfo(recTest.test_code);
                              const isChecked = !!selectedAiTests[recTest.test_code];
                              return (
                                <div 
                                  key={recTest.test_code} 
                                  className={`p-4 rounded-2xl border-2 transition-all duration-300 flex gap-3.5 items-start cursor-pointer ${
                                    isChecked 
                                      ? 'bg-emerald-50/5 border-emerald-300 shadow-[0_4px_15px_rgba(16,185,129,0.05)]' 
                                      : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
                                  }`} 
                                  onClick={() => setSelectedAiTests(prev => ({ ...prev, [recTest.test_code]: !prev[recTest.test_code] }))}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked} 
                                    onChange={() => {}} 
                                    className="mt-1.5 accent-emerald-600 w-4 h-4 cursor-pointer rounded-lg" 
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <span className="text-sm font-extrabold text-slate-800 leading-tight">{info.testName}</span>
                                      <span className="text-sm font-black text-emerald-700 whitespace-nowrap ml-2">₹{info.price}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 flex gap-2 font-bold uppercase tracking-wider">
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-[9px] font-black">{info.category?.name || 'Pathology'}</span>
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-[9px] font-black">{info.sampleType || 'Serum'}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2.5 font-semibold bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                                      {recTest.reason[language] || recTest.reason.en}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Optional (वैकल्पिक) */}
                        {TEST_RECOMMENDATIONS[currentResultKey].optional && TEST_RECOMMENDATIONS[currentResultKey].optional.length > 0 && (
                          <div className="space-y-2.5 pt-1">
                            <h5 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              {language === 'hi' ? 'वैकल्पिक टेस्ट' : 'Optional Tests'}
                            </h5>
                            {TEST_RECOMMENDATIONS[currentResultKey].optional.map((recTest) => {
                              const info = getTestInfo(recTest.test_code);
                              const isChecked = !!selectedAiTests[recTest.test_code];
                              return (
                                <div 
                                  key={recTest.test_code} 
                                  className={`p-4 rounded-2xl border-2 transition-all duration-300 flex gap-3.5 items-start cursor-pointer ${
                                    isChecked 
                                      ? 'bg-amber-50/5 border-amber-300 shadow-[0_4px_15px_rgba(245,158,11,0.05)]' 
                                      : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
                                  }`} 
                                  onClick={() => setSelectedAiTests(prev => ({ ...prev, [recTest.test_code]: !prev[recTest.test_code] }))}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked} 
                                    onChange={() => {}} 
                                    className="mt-1.5 accent-amber-500 w-4 h-4 cursor-pointer rounded-lg" 
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <span className="text-sm font-extrabold text-slate-800 leading-tight">{info.testName}</span>
                                      <span className="text-sm font-black text-amber-700 whitespace-nowrap ml-2">₹{info.price}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 flex gap-2 font-bold uppercase tracking-wider">
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-[9px] font-black">{info.category?.name || 'Pathology'}</span>
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-[9px] font-black">{info.sampleType || 'Serum'}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2.5 font-semibold bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                                      {recTest.reason[language] || recTest.reason.en}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* AI Note (विशेष टिप्पणी) */}
                        {TEST_RECOMMENDATIONS[currentResultKey].ai_note && (
                          <div className="bg-amber-50/60 border border-amber-150 rounded-2xl p-4 text-xs sm:text-sm">
                            <strong className="text-amber-950 block mb-1.5 flex items-center gap-1.5 font-black uppercase tracking-wide text-[10px]">
                              <Info size={14} className="text-amber-600 shrink-0" />
                              {language === 'hi' ? 'विशेष एआई टिप्पणी:' : 'Special AI Advisory Note:'}
                            </strong>
                            <p className="text-amber-800 leading-relaxed font-semibold mt-1">
                              {TEST_RECOMMENDATIONS[currentResultKey].ai_note[language] || TEST_RECOMMENDATIONS[currentResultKey].ai_note.en}
                            </p>
                          </div>
                        )}
                        {/* Suggested Packages (Upsell) */}
                        <div className="space-y-2.5 pt-4 border-t border-slate-100 mt-4">
                          <h5 className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {language === 'hi' ? 'विशेष स्वास्थ्य पैकेज' : 'Suggested Health Packages'}
                          </h5>
                          {HEALTH_PACKAGES.slice(0, 2).map((pkg) => {
                            const isChecked = !!selectedAiTests[pkg.code];
                            return (
                              <div 
                                key={pkg.code} 
                                className={`p-4 rounded-2xl border-2 transition-all duration-300 flex gap-3.5 items-start cursor-pointer ${
                                  isChecked 
                                    ? 'bg-blue-50/10 border-blue-300 shadow-[0_4px_15px_rgba(59,130,246,0.05)]' 
                                    : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
                                }`} 
                                onClick={() => setSelectedAiTests(prev => ({ ...prev, [pkg.code]: !prev[pkg.code] }))}
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={() => {}} 
                                  className="mt-1.5 accent-blue-600 w-4 h-4 cursor-pointer rounded-lg" 
                                />
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm font-extrabold text-slate-800 leading-tight">{pkg.name}</span>
                                    <span className="text-sm font-black text-blue-700 whitespace-nowrap ml-2">₹{pkg.price}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1 flex gap-2 font-bold uppercase tracking-wider">
                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-[9px] font-black">Package</span>
                                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md text-[9px] font-black">{pkg.badge}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-2.5 font-semibold bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                                    {pkg.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[12px] font-bold text-amber-900 flex items-center justify-center gap-2 mt-4 mb-2 shadow-sm text-center">
                            <Info size={16} className="shrink-0 text-amber-600" />
                            <span>{language === 'hi' ? 'विशेष छूट और ऑफर्स के लिए सीधे लैब से संपर्क करें' : 'Contact the lab directly for special discounts and offers'}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-slate-500 italic p-6 bg-slate-50 rounded-2xl">
                        {language === 'hi' ? 'कोई सिफारिश नहीं मिली।' : 'No recommendations found.'}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleResetAIAssessment}
                      className="flex-1 py-3.5 border-2 border-slate-150 hover:border-slate-250 text-slate-600 font-bold rounded-2xl text-sm transition-all"
                    >
                      {language === 'hi' ? 'नया परामर्श शुरू करें' : 'Start New Consult'}
                    </button>
                    <button
                      onClick={handleApplyRecommendedTests}
                      className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>
                        {language === 'hi' ? 'चयनित टेस्ट बुक करें' : 'Book Selected Tests'} 
                        {Object.keys(selectedAiTests).filter(code => selectedAiTests[code]).reduce((sum, code) => sum + getTestInfo(code).price, 0) > 0 && 
                          ` (₹${Object.keys(selectedAiTests).filter(code => selectedAiTests[code]).reduce((sum, code) => sum + getTestInfo(code).price, 0)})`
                        }
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <ExitIntentPopup />
    </div>
  );
};

export default PublicWelcome;
