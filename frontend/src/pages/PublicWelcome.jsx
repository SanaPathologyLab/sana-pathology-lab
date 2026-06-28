import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Phone, MapPin, Clock, CheckCircle2, Activity, Microscope, 
  UserCircle, Star, ChevronDown, ChevronUp, MessageCircle, ShieldCheck,
  Search, FileText, Heart, Filter, Sparkles, Check, Info, Trash2, Calendar,
  ArrowRight, Award, ShieldAlert, BadgePercent, TrendingUp, Zap, FlaskConical,
  ChevronLeft, ChevronRight, MessageSquare, Loader2, Send,
  Baby, Droplets, Calculator, AlertCircle, Package, ShoppingCart
} from 'lucide-react';
import Logo from '../components/Logo';
import Loader from '../components/Loader';
import PublicHomeHeader from '../components/PublicHomeHeader';
import { useLanguage } from '../context/LanguageContext';
import { generateAI, searchTests } from '../utils/ai';
import { QUESTION_FLOW, TEST_RECOMMENDATIONS } from '../utils/aiFlowData';
import { AI_KNOWLEDGE_BASE, CATALOGUE_MAP } from '../utils/aiKnowledge';
import { TESTS_DATA, HEALTH_PACKAGES_DATA as HEALTH_PACKAGES } from '../data/testsData';

import GoogleBusinessSchema from '../components/GoogleBusinessSchema';
import OfferBanner from '../components/OfferBanner';
import LiveAvailabilityIndicator from '../components/LiveAvailabilityIndicator';
import SocialProofTicker from '../components/SocialProofTicker';
import ExitIntentPopup from '../components/ExitIntentPopup';
import PinCodeChecker from '../components/PinCodeChecker';
import SymptomFinder from '../components/SymptomFinder';
import DynamicPackageBuilder from '../components/DynamicPackageBuilder';
import PackageCard from '../components/PackageCard';
import PackageDetailsModal from '../components/PackageDetailsModal';

import WhatsAppIcon from '../components/WhatsAppIcon';
import SubscriptionPlans from '../components/SubscriptionPlans';
import TestimonialVideoSection from '../components/TestimonialVideoSection';
import LiveChatWidget from '../components/LiveChatWidget';
import CouponSystem from '../components/CouponSystem';
import UpsellRecommendations from '../components/UpsellRecommendations';
import BloodTube3D from '../components/BloodTube3D';
import EmergencyWidget from '../components/EmergencyWidget';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import BookingModal from '../components/BookingModal';
import BookingWizard from '../components/BookingWizard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Hero Slides
const slides = [
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=60&w=1200",
  "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=60&w=1200",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=60&w=1200"
];

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
  const [selectedPackageDetails, setSelectedPackageDetails] = useState(null);
  const [selectedTests, setSelectedTests] = useState(() => {
    try {
      const saved = localStorage.getItem('sana_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingModalStep, setBookingModalStep] = useState(0);

  useEffect(() => {
    localStorage.setItem('sana_cart', JSON.stringify(selectedTests));
    // Dispatch a cart updated event so other page headers stay in sync
    window.dispatchEvent(new Event('cart-updated'));
  }, [selectedTests]);

  useEffect(() => {
    const handleOpenModal = (e) => {
      setBookingModalStep(e.detail?.step || 0);
      setBookingModalOpen(true);
    };
    window.addEventListener('open-booking-modal', handleOpenModal);
    return () => window.removeEventListener('open-booking-modal', handleOpenModal);
  }, []);

  // Handle hash scrolling on load
  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        const id = window.location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300);
    }
  }, []);

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

  // Package Handlers
  const isInCart = (code) => selectedTests.some(t => (t.testCode || t.code) === code);
  
  const handlePackageToggle = (pkg) => {
    setSelectedTests(prev => {
      if (isInCart(pkg.code)) return prev.filter(p => (p.testCode || p.code) !== pkg.code);
      return [...prev, { name: pkg.name, testCode: pkg.code, price: pkg.price, isPackage: true }];
    });
  };

  const handleBookNow = (pkg) => {
    if (!isInCart(pkg.code)) handlePackageToggle(pkg);
    window.dispatchEvent(new CustomEvent('open-booking-modal', { detail: { step: 1 } }));
  };

  const handleWhatsAppPkg = (msg) => {
    const labPhone = "916396786939"; 
    window.open(`https://wa.me/${labPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

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
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-booking-modal', { detail: { step: 1 } }));
    }, 100);
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

  const handleSendChatMessage = async (quickMsg) => {
    const userMsg = (quickMsg || chatInput || '').trim();
    if (!userMsg || aiChatLoading) return;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setAiChatLoading(true);
    try {
      const lang = language === 'hi' ? 'Hindi (हिंदी)' : 'English';

      const recentHistory = chatMessages.slice(-6).map(m =>
        `${m.role === 'user' ? 'Patient' : 'Sana AI'}: ${m.text}`
      ).join('\n');

      const conversationBlock = recentHistory ? `\n## CONVERSATION HISTORY:\n${recentHistory}\n` : '';

      const foundTests = searchTests(userMsg);
      let searchBlock = '';
      if (foundTests.length > 0) {
        searchBlock = '\n## MATCHING TESTS FOUND:\n' + foundTests.map(t =>
          `- ${t.name} [Code: ${t.code}, Price: ₹${t.price}]`
        ).join('\n');
      }

      const prompt = `${AI_KNOWLEDGE_BASE}
${conversationBlock}
${searchBlock}

## INSTRUCTION:
You are Sana AI, a helpful lab assistant for Sana Pathology Lab. Answer the following question in ${lang}. Be friendly, concise, and informative.

Use the knowledge base above to answer accurately. If the user asks about test prices, symptoms, preparation, or lab services, refer to the data provided.

If you cannot find the answer in the knowledge base, say: "Iske baare mein mujhe accurate jaankari nahi hai. Aap directly humse baat kar sakte hain: WhatsApp: wa.me/916396786939, Call: +91 6396786939"

Question: ${userMsg}

(Answer in ${lang} only. Keep response under 150 words. End with a relevant follow-up question or offer to help book the test.)`;

      const response = await generateAI(prompt);
      setChatMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: language === 'hi' ? 'क्षमा करें, कोई त्रुटि हुई। कृपया पुनः प्रयास करें या हमें कॉल करें: +91 6396786939' : 'Sorry, I encountered an error. Please try again or call us: +91 6396786939' }]);
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

      <PublicHomeHeader cartCount={selectedTests.length} />

      <OfferBanner />

      {/* Lal PathLabs Style Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-28 bg-[#f8fafc]">
        {/* Banner Images */}
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={slide} alt="Lab background" className="w-full h-full object-cover object-right-top" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
          </div>
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
          
          <div className="w-full lg:w-[55%] pt-10 pb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#eef5fc] text-[#00488d] text-xs font-bold tracking-wider mb-4 border border-[#00488d]/10">
              <ShieldCheck size={16} className="text-[#00488d]" />
              {t('nablAccredited')}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0f172a] leading-[1.15] mb-5 tracking-tight">
              Trust in every test, <br />
              <span className="text-[#f15a22]">accuracy in every result.</span>
            </h1>
            
            <p className="text-lg text-slate-600 font-medium mb-8 max-w-lg leading-relaxed">
              India's leading diagnostic network now in your neighborhood. Get free home sample collection and verified pathologist reports.
            </p>

            {/* Quick Search Bar within Hero (Lal style) with Live Autocomplete */}
            <div className="bg-white p-3 rounded-2xl shadow-[0_15px_40px_rgba(0,72,141,0.12)] border border-slate-100 flex flex-col sm:flex-row gap-3 max-w-xl relative">
               <div className="relative flex-1">
                 <input 
                   type="text" 
                   placeholder="Search for Test or Health Package..." 
                   className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:border-[#00488d] focus:ring-2 focus:ring-[#00488d]/10 outline-none text-slate-800 font-bold"
                   value={searchQueryTest}
                   onChange={(e) => setSearchQueryTest(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') scrollToSection('search-section');
                   }}
                   onFocus={() => setSearchQueryTest(prev => prev)}
                   autoComplete="off"
                 />
                 {/* Live Autocomplete Dropdown */}
                 {searchQueryTest.trim().length >= 2 && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden max-h-72 overflow-y-auto">
                     {/* Matching tests */}
                     {TESTS_DATA.filter(t => 
                       t.testName.toLowerCase().includes(searchQueryTest.toLowerCase()) ||
                       t.testCode.toLowerCase().includes(searchQueryTest.toLowerCase())
                     ).slice(0, 6).map((test, idx) => (
                       <div 
                         key={idx}
                         className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 group"
                         onClick={() => {
                           scrollToSection('booking');
                           setSearchQueryTest('');
                         }}
                       >
                         <div>
                           <p className="text-sm font-bold text-slate-800 group-hover:text-[#00488d]">{test.testName}</p>
                           <p className="text-[10px] text-slate-400 font-medium">{test.category?.name} • {test.sampleType}</p>
                         </div>
                         <div className="flex items-center gap-2 shrink-0 ml-3">
                           <span className="text-sm font-black text-[#00488d]">₹{test.price}</span>
                           <span className="text-[10px] bg-[#00488d] text-white px-2 py-0.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">Book</span>
                         </div>
                       </div>
                     ))}
                     {/* Matching packages */}
                     {HEALTH_PACKAGES.filter(p =>
                       p.name.toLowerCase().includes(searchQueryTest.toLowerCase())
                     ).slice(0, 3).map((pkg, idx) => (
                       <div 
                         key={`pkg-${idx}`}
                         className="flex items-center justify-between px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-0 group"
                         onClick={() => {
                           scrollToSection('packages');
                           setSearchQueryTest('');
                         }}
                       >
                         <div>
                           <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700">📦 {pkg.name}</p>
                           <p className="text-[10px] text-slate-400 font-medium">{pkg.parameterCount} parameters • Health Package</p>
                         </div>
                         <div className="flex items-center gap-2 shrink-0 ml-3">
                           <span className="text-sm font-black text-emerald-600">₹{pkg.price}</span>
                           <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">View</span>
                         </div>
                       </div>
                     ))}
                     {TESTS_DATA.filter(t => t.testName.toLowerCase().includes(searchQueryTest.toLowerCase())).length === 0 &&
                      HEALTH_PACKAGES.filter(p => p.name.toLowerCase().includes(searchQueryTest.toLowerCase())).length === 0 && (
                       <div className="px-4 py-6 text-center text-sm text-slate-400">
                         No results for "<strong>{searchQueryTest}</strong>". Try another name.
                       </div>
                     )}
                   </div>
                 )}
               </div>
               <button 
                 onClick={() => { scrollToSection('search-section'); }}
                 className="bg-[#f15a22] hover:bg-[#e04c1a] text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-md shadow-[#f15a22]/20"
               >
                 <Search size={18} /> Search Test
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lal PathLabs Style Quick Actions Banner */}
      <div className="relative z-20 -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: <Activity className="text-[#f15a22]" size={28} />, title: 'Book a Test', desc: 'Home Collection', action: () => scrollToSection('booking') },
            { icon: <FileText className="text-[#00488d]" size={28} />, title: 'Download Report', desc: 'View online', action: () => scrollToSection('search-section') },
            { icon: <Phone className="text-[#00488d]" size={28} />, title: 'Call to Book', desc: '+91 6396786939', action: () => window.location.href='tel:+916396786939' },
            { icon: <MapPin className="text-[#f15a22]" size={28} />, title: 'Find a Lab', desc: 'Nearest center', action: () => navigate('/contact') },
          ].map((item, idx) => (
            <div key={idx} onClick={item.action} className="bg-white rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,72,141,0.1)] hover:-translate-y-1 transition-all cursor-pointer border border-slate-100 flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-[#f8fafc] flex items-center justify-center mb-3 group-hover:bg-[#eef5fc] transition-colors border border-slate-100 group-hover:border-[#00488d]/10">
                {item.icon}
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">{item.title}</h3>
              <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <SocialProofTicker />

      {/* Test Price Ticker */}
      <div className="bg-[#00488d] text-white py-2.5 overflow-hidden border-b border-[#003870]">
        <div className="flex items-center">
          <div className="shrink-0 bg-[#f15a22] text-white text-xs font-black px-4 py-1.5 uppercase tracking-wider z-10 mr-4 rounded-r-full shadow-md">LIVE PRICES</div>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee">
              {[...TICKER_TESTS, ...TICKER_TESTS].map((tItem, i) => (
                <span key={i} className="inline-flex items-center gap-2 mr-10 text-sm font-semibold whitespace-nowrap">
                  <FlaskConical className="w-3.5 h-3.5 text-blue-200" />
                  {t(tItem.name) === tItem.name ? tItem.name : t(tItem.name)}
                  <span className="text-[#fca5a5] font-black">₹{tItem.price}</span>
                  <span className="text-blue-500 mx-2">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Health Tips Strip */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="shrink-0 bg-[#eef5fc] text-[#00488d] border border-[#00488d]/10 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">{t('healthTip')}</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-700 truncate">
              {HEALTH_TIPS[currentTip].emoji} {t(HEALTH_TIPS[currentTip].tipKey) === HEALTH_TIPS[currentTip].tipKey ? HEALTH_TIPS[currentTip].tip : t(HEALTH_TIPS[currentTip].tipKey)}
            </p>
          </div>
          <div className="shrink-0 flex gap-1">
            {HEALTH_TIPS.map((_, i) => (
              <button key={i} onClick={() => setCurrentTip(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentTip ? 'bg-[#f15a22] w-4' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animated Stats Section */}
      <section ref={statsRef} id="stats" className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-[#f15a22] uppercase tracking-widest bg-[#f15a22]/10 px-4 py-1.5 rounded-full border border-[#f15a22]/20">{t('byTheNumbers')}</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#00488d] mt-4 mb-2">{t('trustedByThousands')}</h2>
            <p className="text-slate-600 font-semibold">{t('statsSub')}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: t('patientsServed'), value: counterValues.patients.toLocaleString() + '+', icon: <UserCircle className="w-6 h-6" />, color: 'text-[#00488d]', bg: 'bg-[#eef5fc]' },
              { label: t('testsAvailable'), value: counterValues.tests + '+', icon: <FlaskConical className="w-6 h-6" />, color: 'text-[#f15a22]', bg: 'bg-[#fff0eb]' },
              { label: t('yearsOfService'), value: counterValues.years + '+', icon: <Award className="w-6 h-6" />, color: 'text-[#00488d]', bg: 'bg-[#eef5fc]' },
              { label: t('reportsDelivered'), value: counterValues.reports.toLocaleString() + '+', icon: <FileText className="w-6 h-6" />, color: 'text-[#f15a22]', bg: 'bg-[#fff0eb]' },
            ].map((s, i) => (
              <div key={i} className={`bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`${s.bg} ${s.color} w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-current opacity-80`}>{s.icon}</div>
                <p className={`text-3xl font-black text-slate-800 animate-count-up`}>{s.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, label: t('nablAccredited') },
              { icon: <Award className="w-4 h-4" />, label: t('iso15189') },
              { icon: <Clock className="w-4 h-4" />, label: t('tat612hr') },
              { icon: <Heart className="w-4 h-4" />, label: t('compassionateCare') },
              { icon: <Zap className="w-4 h-4" />, label: t('digitalReports') },
              { icon: <Phone className="w-4 h-4" />, label: t('freeHomeCollection') },
            ].map((badge, i) => (
              <div key={i} className={`inline-flex items-center gap-2 border border-slate-200 bg-white px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 transition-all hover:border-[#00488d] hover:text-[#00488d] shadow-sm`}>
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
                onClick={() => { setSearchType('report'); setAppointmentResults([]); setSearchError(''); setSearchQuery(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all ${
                  searchType === 'report' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-primary'
                }`}
              >
                Report Number + Name
              </button>
              <button
                type="button"
                onClick={() => { setSearchType('mobile'); setAppointmentResults([]); setSearchError(''); setSearchQuery(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all ${
                  searchType === 'mobile' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-primary'
                }`}
              >
                Mobile Number
              </button>
              <button
                type="button"
                onClick={() => { setSearchType('appointment'); setAppointmentResults([]); setSearchError(''); setSearchQuery(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all ${
                  searchType === 'appointment' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-primary'
                }`}
              >
                Track Request
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-5 max-w-2xl mx-auto">
            {searchType === 'report' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 tracking-widest uppercase ml-2 block">Report Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SPL-0001"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-5 py-4 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-full outline-none text-sm font-bold text-slate-800 bg-white shadow-inner transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 tracking-widest uppercase ml-2 block">Patient Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-5 py-4 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-full outline-none text-sm font-bold text-slate-800 bg-white shadow-inner transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {searchType === 'mobile' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 tracking-widest uppercase ml-2 block">Registered Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-4 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-full outline-none text-sm font-bold text-slate-800 bg-white shadow-inner transition-all"
                  required
                />
              </div>
            )}

            {searchType === 'appointment' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 tracking-widest uppercase ml-2 block">Mobile Number Used for Booking</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-4 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-full outline-none text-sm font-bold text-slate-800 bg-white shadow-inner transition-all"
                  required
                />
              </div>
            )}

            {/* Helper Text */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
              <span className="text-xl">💡</span>
              <p className="text-xs text-blue-800 font-semibold leading-relaxed">
                {searchType === 'report' && "Enter the report ID and patient's name exactly as written on your receipt to access reports without logging in."}
                {searchType === 'mobile' && "Enter your registered mobile number to search and view all diagnostic reports assigned to you."}
                {searchType === 'appointment' && "Track your home collection appointment status and phlebotomist assignment state in real-time."}
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00488d] to-[#00366b] hover:from-[#00366b] hover:to-[#00254c] text-white font-black py-4.5 rounded-full text-base transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,72,141,0.3)] hover:shadow-[0_12px_25px_rgba(0,72,141,0.4)] hover:-translate-y-0.5 active:scale-[0.99] mt-2"
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
      <section className="py-20 bg-white border-y border-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black tracking-widest text-[#00488d] uppercase bg-[#eef5fc] px-4 py-1.5 rounded-full border border-[#00488d]/10">{t('process')}</span>
            <h2 className="text-3xl md:text-4xl font-heading text-slate-800 font-black mt-4">{t('howItWorks')}</h2>
            <p className="text-slate-500 mt-2 font-semibold">{t('processSub')}</p>
            <div className="w-16 h-1 bg-[#f15a22] mx-auto mt-4 rounded-full"></div>
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
                <div className="w-16 h-16 rounded-full bg-white border-2 border-[#00488d]/20 flex items-center justify-center text-[#00488d] font-bold text-xl shadow-[0_10px_25px_rgba(0,72,141,0.08)] group-hover:bg-[#00488d] group-hover:text-white group-hover:border-[#00488d] group-hover:shadow-[0_15px_30px_rgba(0,72,141,0.2)] transition-all duration-300 z-10 relative overflow-hidden group-hover:-translate-y-1">
                  {item.step}
                </div>
                <h3 className="font-extrabold text-slate-800 mt-5 mb-2 text-lg group-hover:text-[#f15a22] transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm max-w-[200px] leading-relaxed font-semibold">{item.desc}</p>
                {index < 4 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#00488d]/20 to-[#00488d]/5 z-0 group-hover:from-[#f15a22]/50 group-hover:to-[#f15a22]/10 transition-all duration-500"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Health & Wellness Packages */}
      <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black tracking-widest text-[#1D9E75] uppercase bg-emerald-50 px-4 py-1.5 rounded-full">
              {language === 'hi' ? 'हेल्थ पैकेजेस' : 'Health Packages'}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-4 mb-2">
              {language === 'hi' ? 'अपना हेल्थ पैकेज चुनें' : 'Choose Your Health Package'}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {language === 'hi' ? 'अपनी जरूरत के अनुसार हमारे विशेष हेल्थ पैकेज चुनें' : 'Select from our curated health packages designed for every need'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HEALTH_PACKAGES.slice(0, 4).map((pkg) => (
              <PackageCard 
                key={pkg.code} 
                pkg={pkg} 
                isAdded={isInCart(pkg.code)}
                onAdd={handlePackageToggle}
                onKnowMore={(p) => setSelectedPackageDetails(p)}
                onBookNow={handleBookNow}
                onWhatsApp={(msg) => handleWhatsAppPkg(msg)}
              />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/packages" className="inline-flex items-center gap-2 bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors px-8 py-3.5 rounded-2xl font-bold shadow-sm">
              View All Packages <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Package Details Modal */}
      {selectedPackageDetails && (
        <PackageDetailsModal 
          pkg={selectedPackageDetails} 
          onClose={() => setSelectedPackageDetails(null)} 
        />
      )}
      <section id="symptom-finder" className="py-20 bg-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SymptomFinder />
        </div>
      </section>

      {/* Direct Online Booking Form */}
      {/* Booking Wizard Section */}
      <div id="booking">
        <BookingWizard 
          existingCart={selectedTests} 
          onCartUpdate={setSelectedTests} 
          scrollToSection={scrollToSection} 
        />
      </div>

      {/* Pathologists Panel & Trust Panel Removed as per request */}



      {/* Testimonials Carousel */}
      <TestimonialsCarousel language={language} />



      <section id="subscription-plans" className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SubscriptionPlans />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#f8fafc] border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-[#00488d]">{t('faqTitle')}</h2>
            <div className="w-16 h-1 bg-[#f15a22] mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  {t('faq_q_' + i) === 'faq_q_' + i ? faq.q : t('faq_q_' + i)}
                  {openFaq === i ? <ChevronUp className="text-[#f15a22] flex-shrink-0" /> : <ChevronDown className="text-[#00488d] flex-shrink-0" />}
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

      {/* Final Conversion CTA & Local Trust Strip */}
      <section className="bg-gradient-to-r from-[#00488d] to-[#002b54] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <span className="text-xs font-black tracking-widest text-[#f15a22] uppercase bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
            Trusted Local Diagnostics
          </span>
          <h2 className="text-3xl md:text-5xl font-black font-heading leading-tight max-w-3xl mx-auto">
            Accurate Reports. Trusted Pathologist Oversight. Right at Your Doorstep.
          </h2>
          <p className="text-sm md:text-base text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed">
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
              className="bg-[#f15a22] hover:bg-[#d94f1c] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
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

      {/* ══ LAB TOUR PREVIEW STRIP (HIGHLIGHTED) ══ */}
      <section className="py-24 bg-[#f8fafc] border-y border-slate-200 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-14">
            <div>
              <span className="inline-block mb-4 text-xs font-black text-[#00488d] uppercase tracking-widest bg-[#eef5fc] border border-[#00488d]/10 px-4 py-1.5 rounded-full">
                ✨ Virtual Lab Tour
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-800 tracking-tight">
                Inside Sana Pathology
              </h2>
              <p className="text-slate-600 mt-4 max-w-2xl font-medium text-sm md:text-base leading-relaxed">
                Step inside Sambhal's state-of-the-art diagnostic facility. Take a 3D-guided look at our equipment, clinical workflows, and biosafe environments.
              </p>
            </div>
            <Link to="/lab-tour" className="shrink-0 flex items-center gap-2 bg-white text-[#00488d] border border-[#00488d] hover:bg-[#eef5fc] px-8 py-4 rounded-2xl font-black text-sm shadow-sm transition-all duration-300 hover:-translate-y-1">
              Launch Full Lab Tour <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {[
              { icon: UserCircle, name: 'Welcome Reception', color: 'from-blue-500 to-indigo-600', textClass: 'text-[#00488d]', bgClass: 'bg-white border-slate-200', desc: 'Digital check-in & comfortable waiting space' },
              { icon: Activity, name: 'Sample Collection', color: 'from-emerald-500 to-teal-600', textClass: 'text-[#f15a22]', bgClass: 'bg-white border-slate-200', desc: 'Sterile private cubicles & vacuum blood draw' },
              { icon: Heart, name: 'Hematology Section', color: 'from-red-500 to-rose-600', textClass: 'text-[#00488d]', bgClass: 'bg-white border-slate-200', desc: '5-part cell counter for cell calculations' },
              { icon: FlaskConical, name: 'Biochemistry', color: 'from-amber-500 to-orange-600', textClass: 'text-[#f15a22]', bgClass: 'bg-white border-slate-200', desc: 'Automated liver, kidney & sugar panels' },
              { icon: ShieldCheck, name: 'Serology & Immunology', color: 'from-purple-500 to-violet-600', textClass: 'text-[#00488d]', bgClass: 'bg-white border-slate-200', desc: 'Sensitive ELISA tests & infection screening' },
              { icon: Microscope, name: 'Microscopy Room', color: 'from-cyan-500 to-sky-600', textClass: 'text-[#f15a22]', bgClass: 'bg-white border-slate-200', desc: 'High-powered manual review & smear analysis' },
            ].map(sec => {
              const IconComponent = sec.icon;
              return (
                <Link 
                  key={sec.name} 
                  to="/lab-tour" 
                  className="bg-white border border-slate-200 hover:border-[#00488d]/50 rounded-[2rem] p-6 text-left transition-all duration-500 group hover:-translate-y-3 flex flex-col justify-between shadow-sm hover:shadow-[0_20px_50px_rgba(0,72,141,0.1)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[#eef5fc] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-white group-hover:border-[#00488d]/10 transition-all duration-500 shadow-sm`}>
                      <IconComponent className={`w-7 h-7 ${sec.textClass} transition-colors duration-300`} />
                    </div>
                    <h3 className="text-slate-800 font-black text-sm mb-2 group-hover:text-[#00488d] transition-colors duration-300">{sec.name}</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">{sec.desc}</p>
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-[10px] font-black text-[#f15a22] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 relative z-10">
                    Explore <ArrowRight size={12} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ HEALTH CALCULATORS CTA ══ */}
      <section className="py-20 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12">
          {/* Left Column: Heading Block */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#f15a22] uppercase tracking-widest bg-[#f15a22]/10 px-4 py-1.5 rounded-full border border-[#f15a22]/20">
              <Calculator size={13} /> Free Health Tools
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-[#00488d] leading-tight">
              Interactive Health Risk Assessment
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto lg:mx-0 font-medium text-sm leading-relaxed">
              Knowledge is prevention. Assess your risk profiles instantly with our clinically aligned calculators, and get direct test recommendations based on your scores.
            </p>
            <div className="pt-2">
              <Link to="/health-calculators" className="inline-flex items-center gap-2 bg-[#f15a22] hover:bg-[#d94f1c] text-white px-8 py-4 rounded-2xl font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all hover:-translate-y-0.5 text-sm">
                Try Free Health Calculators <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Column: 5 Mini Cards Grid + 1 filler */}
          <div className="flex-[1.2] w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'bmi', icon: Activity, label: 'BMI Calc', desc: 'Check body mass index and find metabolic screening needs.', textClass: 'text-[#00488d]', bgClass: 'bg-[#eef5fc] border-[#00488d]/10' },
              { id: 'diabetes', icon: AlertCircle, label: 'Diabetes Risk', desc: 'Assess Type 2 diabetes risks based on lifestyle indicators.', textClass: 'text-[#f15a22]', bgClass: 'bg-[#fff0eb] border-[#f15a22]/10' },
              { id: 'heart', icon: Heart, label: 'Heart Risk', desc: 'Evaluate cardiovascular risk markers & recommended tests.', textClass: 'text-[#00488d]', bgClass: 'bg-[#eef5fc] border-[#00488d]/10' },
              { id: 'duedate', icon: Baby, label: 'Pregnancy Due Date', desc: 'Track expected delivery date & crucial ANC test intervals.', textClass: 'text-[#f15a22]', bgClass: 'bg-[#fff0eb] border-[#f15a22]/10' },
              { id: 'water', icon: Droplets, label: 'Water Intake', desc: 'Estimate ideal daily hydration targets based on weight.', textClass: 'text-[#00488d]', bgClass: 'bg-[#eef5fc] border-[#00488d]/10' },
            ].map(calc => {
              const IconComponent = calc.icon;
              return (
                <Link
                  key={calc.id}
                  to={`/health-calculators`}
                  className={`bg-white border border-slate-200 rounded-2xl p-5 text-left transition-all duration-500 group hover:-translate-y-2 hover:shadow-xl hover:border-[#00488d]/30 relative`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${calc.bgClass} flex items-center justify-center group-hover:scale-125 transition-all duration-500 shadow-sm border`}>
                      <IconComponent className={`w-5 h-5 ${calc.textClass}`} />
                    </div>
                    <span className="text-[10px] font-black text-[#f15a22] uppercase tracking-widest transition-colors duration-300">Start →</span>
                  </div>
                  <h4 className="text-slate-800 font-extrabold text-sm mb-1.5">{calc.label}</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">{calc.desc}</p>
                </Link>
              );
            })}

            {/* View All Card filler */}
            <Link
              to="/health-calculators"
              className="bg-[#00488d] border border-[#00366b] hover:bg-[#00366b] rounded-2xl p-5 text-left transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#f15a22] uppercase tracking-widest">Interactive Tools</span>
                <span className="text-white font-black text-sm">🧮</span>
              </div>
              <div>
                <h4 className="text-white font-extrabold text-sm mt-4 mb-1">Explore All Tools</h4>
                <p className="text-blue-200 text-[11px] font-semibold leading-relaxed">Access the full clinical wellness suite of free tools.</p>
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
              <li><Link to="/why-us" className="hover:text-white transition-colors">{t('whyUs')}</Link></li>
              <li><Link to="/packages" className="hover:text-white transition-colors">{t('packages')}</Link></li>
              <li><Link to="/test-finder" className="hover:text-white transition-colors">{t('testFinder')}</Link></li>
              <li><Link to="/book-online" className="hover:text-white transition-colors">{t('bookOnline')}</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">{t('faq')}</Link></li>
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
                    {chatMessages.map((msg, idx) => {
                      const detectedTests = msg.role === 'assistant' && !aiChatLoading
                        ? (() => {
                            const text = msg.text;
                            const found = [];
                            for (const [code, item] of Object.entries(CATALOGUE_MAP)) {
                              const regex = new RegExp(`\\b${code}\\b`, 'i');
                              if (regex.test(text) && !found.some(f => f.testCode === code)) {
                                found.push(item);
                                if (found.length >= 3) break;
                              }
                            }
                            return found;
                          })()
                        : [];
                      return (
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
                          {detectedTests.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-200/60">
                              {detectedTests.map(test => {
                                const alreadyInCart = selectedTests.some(t => t.testCode === test.testCode);
                                return (
                                  <button
                                    key={test.testCode}
                                    onClick={() => {
                                      if (!alreadyInCart) {
                                        setSelectedTests(prev => [...prev, {
                                          name: test.name,
                                          price: test.price,
                                          testCode: test.testCode,
                                          isPackage: test.isPackage || false
                                        }]);
                                      } else {
                                        setSelectedTests(prev => prev.filter(t => t.testCode !== test.testCode));
                                      }
                                    }}
                                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                                      alreadyInCart
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200'
                                    }`}
                                  >
                                    <ShoppingCart className="w-3 h-3" />
                                    {alreadyInCart
                                      ? (language === 'hi' ? '✓ जुड़ गया' : '✓ Added')
                                      : `${test.name} (₹${test.price})`}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      );
                    })}
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

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap gap-1.5 pb-2">
                    {[
                      { labelEn: '💰 Test Prices', labelHi: '💰 टेस्ट के दाम', msg: 'What are your test prices?' },
                      { labelEn: '🏠 Home Collection', labelHi: '🏠 होम कलेक्शन', msg: 'Tell me about home collection' },
                      { labelEn: '🕐 Timings', labelHi: '🕐 समय', msg: 'What are your lab timings?' },
                      { labelEn: '🩸 CBC Test', labelHi: '🩸 CBC टेस्ट', msg: 'Tell me about CBC test' },
                      { labelEn: '📦 Packages', labelHi: '📦 पैकेज', msg: 'What health packages do you offer?' },
                      { labelEn: '🍽️ Fasting Rules', labelHi: '🍽️ उपवास नियम', msg: 'Which tests need fasting?' },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendChatMessage(btn.msg)}
                        disabled={aiChatLoading}
                        className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-slate-600 transition-all whitespace-nowrap disabled:opacity-50"
                      >
                        {language === 'hi' ? btn.labelHi : btn.labelEn}
                      </button>
                    ))}
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
                      onClick={() => handleSendChatMessage()}
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

      {/* Global Booking Modal overlay */}
      <BookingModal 
        isOpen={bookingModalOpen} 
        onClose={() => setBookingModalOpen(false)} 
        initialStep={bookingModalStep} 
      />
    </div>
  );
};

export default PublicWelcome;
