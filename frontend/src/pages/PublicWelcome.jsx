import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, MapPin, Clock, CheckCircle2, Activity, Microscope, 
  UserCircle, Star, ChevronDown, ChevronUp, MessageCircle, ShieldCheck,
  Search, FileText, Heart, Filter, Sparkles, Check, Info, Trash2, Calendar,
  ArrowRight, Award, ShieldAlert, BadgePercent, TrendingUp, Zap, FlaskConical,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Logo from '../components/Logo';
import Loader from '../components/Loader';

import BloodTube3D from '../components/BloodTube3D';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_TESTS = [
  { testName: 'Complete Blood Count (CBC)', testCode: 'CBC', price: 300, sampleType: 'Blood', category: { name: 'Hematology' } },
  { testName: 'Fasting Blood Sugar (FBS)', testCode: 'FBS', price: 150, sampleType: 'Blood', category: { name: 'Biochemistry' } },
  { testName: 'Lipid Profile', testCode: 'LIPID', price: 400, sampleType: 'Blood', category: { name: 'Biochemistry' } },
  { testName: 'Thyroid Profile (T3, T4, TSH)', testCode: 'THYROID', price: 550, sampleType: 'Blood', category: { name: 'Immunology' } },
  { testName: 'Urine Routine Examination', testCode: 'URINE', price: 200, sampleType: 'Urine', category: { name: 'Urine Analysis' } },
  { testName: 'Liver Function Test (LFT)', testCode: 'LFT', price: 600, sampleType: 'Blood', category: { name: 'Biochemistry' } },
  { testName: 'Kidney Function Test (KFT)', testCode: 'KFT', price: 600, sampleType: 'Blood', category: { name: 'Biochemistry' } },
  { testName: 'Vitamin D (25-OH)', testCode: 'VITD', price: 800, sampleType: 'Blood', category: { name: 'Immunology' } },
  { testName: 'WIDAL Test (Typhoid)', testCode: 'WIDAL', price: 200, sampleType: 'Blood', category: { name: 'Immunology' } },
  { testName: 'Hemoglobin (Hb) Only', testCode: 'HB', price: 100, sampleType: 'Blood', category: { name: 'Hematology' } },
  { testName: 'Blood Grouping & Rh Typing', testCode: 'BGRP', price: 150, sampleType: 'Blood', category: { name: 'Hematology' } },
  { testName: 'Uric Acid', testCode: 'URIC', price: 180, sampleType: 'Blood', category: { name: 'Biochemistry' } },
  { testName: 'HbA1c (Glycated Hemoglobin)', testCode: 'HBA1C', price: 350, sampleType: 'Blood', category: { name: 'Biochemistry' } },
  { testName: 'Calcium Serum', testCode: 'CA', price: 220, sampleType: 'Blood', category: { name: 'Biochemistry' } },
  { testName: 'Dengue NS1 Antigen', testCode: 'DENGUENS1', price: 600, sampleType: 'Blood', category: { name: 'Immunology' } },
  { testName: 'ESR (Erythrocyte Sedimentation Rate)', testCode: 'ESR', price: 100, sampleType: 'Blood', category: { name: 'Hematology' } },
];

const HEALTH_PACKAGES = [
  {
    name: 'Sana Fit Active (Basic Health)',
    code: 'PKG-FIT',
    price: 699,
    originalPrice: 999,
    tests: ['Complete Blood Count (CBC)', 'Fasting Blood Sugar', 'Lipid Profile', 'Urine Routine'],
    badge: 'Popular',
    desc: 'Ideal for routine wellness screening and baseline tracking.'
  },
  {
    name: 'Sana Women Premium (Special Care)',
    code: 'PKG-WOMEN',
    price: 1899,
    originalPrice: 2999,
    tests: ['CBC', 'Thyroid Profile', 'LFT', 'KFT', 'Vitamin D', 'Vitamin B12', 'Fasting Sugar'],
    badge: 'Best Value',
    desc: 'Comprehensive checkup tailored specifically for women health.'
  },
  {
    name: 'Sana Senior Citizen (Elderly Care)',
    code: 'PKG-SENIOR',
    price: 1399,
    originalPrice: 2299,
    tests: ['CBC', 'Blood Sugar Fasting', 'HbA1c', 'LFT', 'KFT', 'Lipid Profile', 'Urine Routine'],
    badge: 'Elderly Care',
    desc: 'Recommended for annual evaluation for people aged 60+.'
  },
  {
    name: 'Sana Heart Health (Cardiac Profile)',
    code: 'PKG-HEART',
    price: 1199,
    originalPrice: 1799,
    tests: ['Lipid Profile', 'HbA1c', 'Complete Blood Count (CBC)', 'Blood Sugar', 'Uric Acid'],
    badge: 'Advanced',
    desc: 'Comprehensive risk assessment for cardiovascular diseases.'
  }
];

// Health Tips Data
const HEALTH_TIPS = [
  { emoji: '💧', tip: 'Drink 8 glasses of water daily to keep your kidneys healthy and toxins flushed out.' },
  { emoji: '🩸', tip: 'Get a CBC test annually to monitor your blood count and catch anemia or infections early.' },
  { emoji: '🍎', tip: 'Eating a balanced diet with fruits and vegetables can lower your cholesterol naturally.' },
  { emoji: '🏃', tip: 'Just 30 minutes of walking a day reduces risk of heart disease by up to 35%.' },
  { emoji: '😴', tip: '7-9 hours of quality sleep boosts immune function and reduces disease risk.' },
  { emoji: '🩺', tip: 'Regular health checkups catch silent diseases like diabetes and hypertension early.' },
  { emoji: '🚭', tip: 'Quitting smoking improves lung function within just 2 weeks of stopping.' },
  { emoji: '🧘', tip: 'Managing stress through meditation or yoga can significantly lower blood pressure.' },
];

// Test Ticker Items
const TICKER_TESTS = [
  { name: 'CBC', price: 300 }, { name: 'Blood Sugar', price: 80 }, { name: 'Lipid Profile', price: 400 },
  { name: 'Thyroid (T3/T4/TSH)', price: 550 }, { name: 'Liver Function (LFT)', price: 600 },
  { name: 'Kidney Function (KFT)', price: 600 }, { name: 'Vitamin D', price: 800 },
  { name: 'HbA1c', price: 350 }, { name: 'Urine Routine', price: 200 }, { name: 'Dengue NS1', price: 600 },
  { name: 'WIDAL Test', price: 200 }, { name: 'Vitamin B12', price: 700 }, { name: 'ESR', price: 100 },
  { name: 'Haemoglobin (Hb)', price: 100 }, { name: 'Blood Group', price: 150 }, { name: 'Uric Acid', price: 180 },
];

const PublicWelcome = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [searchType, setSearchType] = useState('mobile');
  const [searchQuery, setSearchQuery] = useState('');
  const [countersVisible, setCountersVisible] = useState(false);
  const [counterValues, setCounterValues] = useState({ patients: 0, tests: 0, years: 0, reports: 0 });
  const statsRef = useRef(null);
  
  // Dynamic Test Explorer States
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQueryTest, setSearchQueryTest] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
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

  const [appointmentResults, setAppointmentResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

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
        navigate(`/report-lookup?reportNumber=${encodeURIComponent(searchQuery.trim())}`);
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
    const targets = { patients: 15000, tests: 80, years: 12, reports: 50000 };
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countersVisible) {
        setCountersVisible(true);
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
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
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
      
      {/* Header */}
      <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo className="w-12 h-12 md:w-14 md:h-14 drop-shadow-md" />
            <div>
              <h1 className="text-2xl font-heading text-primary tracking-tight leading-none">
                Sana Pathology
              </h1>
              <p className="text-xs text-primary-light font-bold tracking-wide uppercase mt-1">Diagnostic Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-8 mr-4">
              <a href="#stats" onClick={(e) => { e.preventDefault(); scrollToSection('stats'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Why Us</a>
              <a href="#packages" onClick={(e) => { e.preventDefault(); scrollToSection('packages'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Packages</a>
              <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Test Finder</a>
              <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Book Online</a>
              <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">FAQ</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Contact</a>
            </div>
            
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-primary hover:bg-primary-light transition-all px-4 py-2 md:px-6 md:py-2.5 rounded-full shadow-lg shadow-primary/30 ring-2 ring-primary/40 ring-offset-2 ring-offset-white"
            >
              <UserCircle size={18} className="hidden sm:block" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden bg-[#085041]">
        {/* Sliding Background Images */}
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-25 scale-105' : 'opacity-0 scale-100'}`}
          >
            <img src={slide} alt="Lab background" className="w-full h-full object-cover" />
          </div>
        ))}
        {/* Dark Teal Gradient Overlay - adjusted opacity for visibility and contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#085041]/90 via-[#0A5D4C]/75 to-[#128362]/40"></div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"></div>

        {/* Decorative Blobs */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary-light/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            
            {/* Left Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-primary-pale text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-md border border-white/20">
                <Sparkles size={14} className="text-[#F1C40F]" />
                <span>NABL Standards • 100% Quality Assured</span>
              </div>

              <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading text-white mb-6 leading-tight drop-shadow-sm">
                Trusted Pathology Lab <span className="text-[#F1C40F]">in Your City</span>
              </h2>
              
              <p className="text-lg md:text-xl text-primary-pale mb-10 font-light max-w-2xl mx-auto lg:mx-0">
                Providing high-precision diagnostics, blood tests, and health packages with free home collection at your convenience.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <a 
                  href="#packages"
                  onClick={(e) => { e.preventDefault(); scrollToSection('packages'); }}
                  className="w-full sm:w-auto min-h-[44px] bg-[#F1C40F] hover:bg-yellow-400 text-[#085041] px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-[#F1C40F]/30 hover:-translate-y-1 text-center cursor-pointer"
                >
                  Explore Packages
                </a>
                <a 
                  href="#services"
                  onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}
                  className="w-full sm:w-auto min-h-[44px] bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg transition-all text-center cursor-pointer"
                >
                  Find a Test
                </a>
              </div>
            </div>

            {/* Right Content - 3D CSS Model */}
            <div className="w-full lg:w-1/2 h-[350px] sm:h-[450px] lg:h-[600px] relative mt-8 lg:mt-0 flex justify-center items-center">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl -z-10 animate-blob"></div>
              {/* Laboratory Blood Tube 3D Model */}
              <BloodTube3D />
            </div>

          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-12 text-white">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm"><CheckCircle2 className="text-[#F1C40F]" size={20} /><span className="font-medium">15,000+ Patients</span></div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm"><Clock className="text-[#F1C40F]" size={20} /><span className="font-medium">6-12hr Turnaround</span></div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm"><Phone className="text-[#F1C40F]" size={20} /><span className="font-medium">Free Home Collection</span></div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm"><ShieldCheck className="text-[#F1C40F]" size={20} /><span className="font-medium">NABL Accredited</span></div>
          </div>
        </div>
      </section>

      {/* Test Price Ticker */}
      <div className="bg-[#085041] text-white py-2.5 overflow-hidden border-b border-emerald-800">
        <div className="flex items-center">
          <div className="shrink-0 bg-[#F1C40F] text-[#085041] text-xs font-black px-4 py-1.5 uppercase tracking-wider z-10 mr-4 rounded-r-full">Live Prices</div>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee">
              {[...TICKER_TESTS, ...TICKER_TESTS].map((t, i) => (
                <span key={i} className="inline-flex items-center gap-2 mr-10 text-sm font-semibold whitespace-nowrap">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
                  {t.name}
                  <span className="text-[#F1C40F] font-black">₹{t.price}</span>
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
          <div className="shrink-0 bg-[#085041] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">Health Tip</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-700 truncate">
              {HEALTH_TIPS[currentTip].emoji} {HEALTH_TIPS[currentTip].tip}
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
      <section ref={statsRef} id="stats" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-black text-[#085041] uppercase tracking-widest bg-[#085041]/10 px-4 py-1.5 rounded-full">By the Numbers</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mt-4 mb-2">Trusted by Thousands</h2>
            <p className="text-slate-500">Real numbers that reflect our commitment to quality diagnostics</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Patients Served', value: counterValues.patients.toLocaleString() + '+', icon: <UserCircle className="w-6 h-6" />, color: 'text-[#085041]', bg: 'bg-[#085041]/5' },
              { label: 'Tests Available', value: counterValues.tests + '+', icon: <FlaskConical className="w-6 h-6" />, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Years of Service', value: counterValues.years + '+', icon: <Award className="w-6 h-6" />, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Reports Delivered', value: counterValues.reports.toLocaleString() + '+', icon: <FileText className="w-6 h-6" />, color: 'text-purple-700', bg: 'bg-purple-50' },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow animate-fade-in-up stagger-${i+1}`}>
                <div className={`${s.bg} ${s.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>{s.icon}</div>
                <p className={`text-3xl font-black ${s.color} animate-count-up`}>{s.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, label: 'NABL Accredited', color: 'text-green-700 bg-green-50 border-green-200' },
              { icon: <Award className="w-4 h-4" />, label: 'ISO 15189 Certified', color: 'text-blue-700 bg-blue-50 border-blue-200' },
              { icon: <Clock className="w-4 h-4" />, label: '6-12 Hr TAT', color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { icon: <Heart className="w-4 h-4" />, label: 'Compassionate Care', color: 'text-red-600 bg-red-50 border-red-200' },
              { icon: <Zap className="w-4 h-4" />, label: 'Digital Reports', color: 'text-purple-700 bg-purple-50 border-purple-200' },
              { icon: <Phone className="w-4 h-4" />, label: 'Free Home Collection', color: 'text-teal-700 bg-teal-50 border-teal-200' },
            ].map((badge, i) => (
              <div key={i} className={`inline-flex items-center gap-2 border px-4 py-2 rounded-full text-xs font-bold ${badge.color}`}>
                {badge.icon} {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lab Result Search Card */}
      <section id="search-section" className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-pale p-3 rounded-xl text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Check Reports & Track Bookings</h3>
              <p className="text-slate-500 text-sm mt-1">Enter your details to download report pdfs or track sample collection request status</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl md:w-80 shrink-0">
              <button
                type="button"
                onClick={() => { setSearchType('mobile'); setAppointmentResults([]); setSearchError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                  searchType === 'mobile' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Mobile No
              </button>
              <button
                type="button"
                onClick={() => { setSearchType('report'); setAppointmentResults([]); setSearchError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                  searchType === 'report' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Report No
              </button>
              <button
                type="button"
                onClick={() => { setSearchType('appointment'); setAppointmentResults([]); setSearchError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                  searchType === 'appointment' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Track Request
              </button>
            </div>
            <div className="relative flex-1">
              <input
                type={searchType === 'report' ? 'text' : 'tel'}
                placeholder={
                  searchType === 'mobile'
                    ? 'Enter Mobile Number to check Reports...'
                    : searchType === 'report'
                      ? 'e.g. RPT-000001'
                      : 'Enter Mobile Number to track collection requests...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full min-h-[48px] pl-4 pr-4 border-2 border-slate-200 rounded-xl focus:border-primary focus:ring-0 outline-none transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              <Search className="w-5 h-5" />
              {searchType === 'appointment' ? 'Track Request' : 'Find Report'}
            </button>
          </form>

          {/* Appointment Tracking Results */}
          {searchType === 'appointment' && (searchLoading || appointmentResults.length > 0 || searchError) && (
            <div className="mt-6 border-t border-slate-100 pt-6 animate-fade-in-up">
              {searchLoading && (
                <div className="flex items-center justify-center py-6 gap-2 text-slate-500 font-semibold text-sm">
                  <Loader type="button" className="text-primary" />
                  <span>Searching collection requests...</span>
                </div>
              )}
              
              {searchError && (
                <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <ShieldAlert size={16} className="text-red-600 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {appointmentResults.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                    Found {appointmentResults.length} Collection Request{appointmentResults.length > 1 ? 's' : ''}
                  </h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {appointmentResults.map((apt) => {
                      let testDetails = 'Routine checkup';
                      if (apt.notes) {
                        const match = apt.notes.match(/Tests\/Packages:\s*(.*)\.\s*Mode:/) || apt.notes.match(/Selected tests:\s*(.*)\.\s*Mode:/);
                        if (match && match[1]) {
                          testDetails = match[1];
                        } else {
                          testDetails = apt.notes;
                        }
                      }
                      
                      const refId = `SPL-APT-${apt.id.toString().padStart(6, '0')}`;
                      const isHome = !apt.notes || !apt.notes.includes('Mode: Lab Visit');
                      
                      const statusMap = {
                        SCHEDULED: { text: '⏳ Pending Confirmation', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
                        CONFIRMED: { text: '✓ Confirmed / Scheduled', cls: 'bg-blue-50 text-blue-800 border-blue-200' },
                        COMPLETED: { text: '✓ Sample Collected', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                        CANCELLED: { text: '❌ Cancelled', cls: 'bg-red-50 text-red-800 border-red-200' }
                      };
                      
                      const statusInfo = statusMap[apt.status] || { text: apt.status, cls: 'bg-slate-50 text-slate-800 border-slate-200' };

                      return (
                        <div key={apt.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary-light transition-colors animate-fade-in-up">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 text-sm">{refId}</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${statusInfo.cls}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-semibold">{testDetails}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} /> {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {apt.time}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {isHome ? 'Home Collection' : 'Lab Visit'}
                              </span>
                            </div>
                          </div>
                          
                          {apt.status === 'SCHEDULED' && (
                            <button
                              onClick={() => {
                                const msg = `*Inquiry about Booking ${refId}*\n\n*Patient:* ${apt.patient?.fullName}\n*Date/Time:* ${new Date(apt.date).toLocaleDateString()} ${apt.time}\n*Status:* Pending Confirmation\n\n*Tests Requested:*\n${testDetails}`;
                                window.open(`https://wa.me/916396786939?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              className="text-xs font-bold text-white bg-[#25D366] hover:bg-[#128C7E] px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <MessageCircle size={14} /> Contact Lab
                            </button>
                          )}
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

      {/* Dynamic Lab Statistics Grid */}
      <section id="stats" className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-primary">Sana Pathology at a Glance</h2>
            <p className="text-slate-500 mt-2 max-w-xl mx-auto">Committed to clinical excellence, patient care, and accurate reporting standards.</p>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { title: '15,000+', desc: 'Happy Patients Served', color: 'border-emerald-500', icon: <UserCircle className="w-8 h-8 text-emerald-600" /> },
              { title: '250+', desc: 'Comprehensive Lab Tests', color: 'border-blue-500', icon: <Microscope className="w-8 h-8 text-blue-600" /> },
              { title: '6 Hours', desc: 'Average Report Delivery', color: 'border-amber-500', icon: <Clock className="w-8 h-8 text-amber-600" /> },
              { title: '100%', desc: 'Accurate & NABL Standard', color: 'border-red-500', icon: <Award className="w-8 h-8 text-red-600" /> },
            ].map((item, i) => (
              <div key={i} className={`bg-white p-6 md:p-8 rounded-2xl shadow-sm border-b-4 ${item.color} flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="p-3 bg-slate-50 rounded-2xl mb-4">{item.icon}</div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">{item.title}</h3>
                <p className="text-slate-500 mt-2 text-sm font-semibold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pathology Testing Journey (Interactive Visual Stepper) */}
      <section className="py-20 bg-primary-pale/30 px-4 sm:px-6 lg:px-8 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary-pale px-3 py-1 rounded-full">Process</span>
            <h2 className="text-4xl font-heading text-primary mt-2">How It Works</h2>
            <p className="text-slate-500 mt-2">Get tested in 5 simple, secure steps without leaving your home.</p>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {[
              { step: '01', title: 'Select Tests', desc: 'Choose tests or wellness packages below.' },
              { step: '02', title: 'Schedule Collection', desc: 'Provide date, time, and address.' },
              { step: '03', title: 'Sample Collection', desc: 'Certified phlebotomist collects at your doorstep.' },
              { step: '04', title: 'Lab Processing', desc: 'High-tech processing with barcoded safety.' },
              { step: '05', title: 'Digital Reports', desc: 'Get reports on WhatsApp & download online.' }
            ].map((item, index) => (
              <div key={index} className="relative flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-primary-light flex items-center justify-center text-primary font-bold text-xl shadow-md group-hover:bg-primary group-hover:text-white transition-all duration-300 z-10">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-800 mt-4 mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-500 text-sm max-w-[200px] leading-relaxed">{item.desc}</p>
                {index < 4 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-slate-200 z-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Health & Wellness Packages */}
      <section id="packages" className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest text-[#BA7517] uppercase bg-accent-pale px-3 py-1 rounded-full">Sana Care</span>
            <h2 className="text-4xl font-heading text-primary mt-2">Popular Health Packages</h2>
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto">Complete medical profile checks at highly subsidized rates. Free home collection included.</p>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HEALTH_PACKAGES.map((pkg, i) => {
              const isSelected = selectedTests.some(t => t.testCode === pkg.code);
              return (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
                  {/* Top highlights */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-extrabold text-[#BA7517] bg-accent-pale px-2.5 py-1 rounded-full uppercase">
                        {pkg.badge}
                      </span>
                      <span className="text-xs text-slate-400 font-bold uppercase">Package</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{pkg.name}</h3>
                    <p className="text-slate-500 text-xs mb-4 leading-relaxed">{pkg.desc}</p>

                    {/* Includes list */}
                    <div className="border-t border-slate-100 pt-4 mb-6">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <BadgePercent size={14} className="text-primary" /> Includes {pkg.tests.length} tests:
                      </p>
                      <ul className="space-y-1.5">
                        {pkg.tests.map((t, idx) => (
                          <li key={idx} className="text-slate-600 text-xs flex items-center gap-1.5 font-medium">
                            <Check size={12} className="text-primary-light shrink-0" />
                            <span className="truncate">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-extrabold text-primary">₹{pkg.price}</span>
                      <span className="text-slate-400 line-through text-xs">₹{pkg.originalPrice}</span>
                      <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-1.5 py-0.5 rounded">
                        {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}% OFF
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => toggleTestSelection(pkg, true)}
                        className={`flex-1 min-h-[44px] rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                          isSelected 
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                            : 'bg-primary-pale text-primary hover:bg-primary hover:text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check size={16} />
                            <span>Selected</span>
                          </>
                        ) : (
                          <span>Select Package</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Test Catalog & Interactive Explorer */}
      <section id="services" className="py-20 bg-primary-pale/25 px-4 sm:px-6 lg:px-8 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary-pale px-3 py-1 rounded-full">Catalog</span>
            <h2 className="text-4xl font-heading text-primary mt-2">Interactive Test Explorer</h2>
            <p className="text-slate-500 mt-2 max-w-xl mx-auto">Search and filter our complete pathology catalog. Select multiple tests to build your custom appointment.</p>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Catalog Main Panel */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Search & Categories Bar */}
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search for blood test, sugar, thyroid, widal, CBC..."
                      value={searchQueryTest}
                      onChange={(e) => setSearchQueryTest(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Categories Pills */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase mr-2 flex items-center gap-1">
                    <Filter size={12} /> Filter:
                  </span>
                  {categories.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test List Grid */}
              {loadingTests ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
                  <Loader type="page" size="md" />
                  <p className="text-slate-500 text-sm font-medium mt-4">Loading clinical test catalog...</p>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">No Tests Found</h3>
                  <p className="text-slate-500 text-sm mt-1">We couldn't find tests matching "{searchQueryTest}". Try searching for standard terms like CBC, Sugar, or Liver.</p>
                  <button 
                    onClick={() => { setSearchQueryTest(''); setSelectedCategory('All'); }}
                    className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-light transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredTests.map((test, index) => {
                    const isSelected = selectedTests.some(t => t.testCode === test.testCode);
                    return (
                      <div 
                        key={index} 
                        onClick={() => toggleTestSelection(test, false)}
                        className={`bg-white rounded-2xl p-4 border transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-slate-100 hover:border-primary-light hover:shadow-sm'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-primary bg-primary-pale px-2 py-0.5 rounded uppercase tracking-wider">
                              {test.category?.name || 'Test'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                              Code: {test.testCode}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                            {test.testName}
                          </h4>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-[#BA7517]">
                              ₹{test.price}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <span>{test.sampleType || 'Blood'} Sample</span>
                          </div>
                        </div>
                        
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                          isSelected 
                            ? 'bg-primary border-primary text-white' 
                            : 'border-slate-200 bg-white group-hover:border-primary group-hover:bg-primary-pale text-transparent'
                        }`}>
                          <Check size={16} className={isSelected ? 'text-white' : 'text-primary group-hover:text-primary'} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Test Selection Sidebar (Booking Cart) */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 sticky top-24 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                  <Heart className="text-red-500 fill-red-500 w-5 h-5" />
                  <span>Your Booking</span>
                </h3>
                {selectedTests.length > 0 && (
                  <button 
                    onClick={clearSelection}
                    className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </div>

              {selectedTests.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Check size={20} />
                  </div>
                  <p className="text-xs font-semibold">No tests selected yet.</p>
                  <p className="text-[11px] mt-1">Click on any package or test in the list to select it for your booking.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {selectedTests.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 relative group">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{t.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">₹{t.price} • {t.isPackage ? 'Package' : 'Test'}</p>
                        </div>
                        <button 
                          onClick={() => removeSelectedTest(t.testCode)}
                          className="text-slate-400 hover:text-red-500 shrink-0 self-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold">Total Tests:</span>
                      <span className="font-extrabold text-slate-800">{selectedTests.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-base">
                      <span className="text-primary font-bold">Estimated Cost:</span>
                      <span className="font-extrabold text-slate-800 text-lg">₹{totalPrice}</span>
                    </div>

                    <a 
                      href="#booking"
                      onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }}
                      className="w-full min-h-[44px] bg-accent hover:bg-amber-600 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-accent/20 hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed to Booking</span>
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Direct Online Booking Form */}
      <section id="booking" className="py-20 bg-bg px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-primary p-6 md:p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F1C40F] bg-white/10 px-3 py-1 rounded-full border border-white/10">
                1-Minute Booking
              </span>
              <h2 className="text-2xl md:text-3xl font-heading mt-3">Book Home Sample Collection</h2>
              <p className="text-primary-pale text-xs md:text-sm mt-1 leading-relaxed">
                Fill in the details below. We collect samples safely from your home or office.
              </p>
            </div>

            <div className="p-6 md:p-8">
              
              {bookingSuccess ? (
                <div className="text-center py-8 animate-fade-in-up">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted Successfully!</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto text-sm">
                    Thank you, {bookingForm.name}. We have received your booking request. To ensure priority processing, please alert our lab coordinator on WhatsApp immediately.
                  </p>
                  
                  {createdAppointment && (
                    <div className="mb-8 bg-primary-pale/50 border border-primary/15 rounded-2xl p-4 max-w-md mx-auto">
                      <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Your Tracking Reference ID</p>
                      <p className="text-2xl font-black text-primary mt-1">SPL-APT-{createdAppointment.id.toString().padStart(6, '0')}</p>
                      <p className="text-[11px] text-slate-500 mt-2 font-medium">Use this ID to track your request status using the <b>Track Request</b> option in the search card at the top of the page.</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleAlertWhatsApp}
                      className="bg-[#25D366] text-white hover:bg-[#128C7E] px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      <span>Alert via WhatsApp</span>
                    </button>
                    <button
                      onClick={async () => {
                        setSearchType('appointment');
                        setSearchQuery(bookingForm.mobile);
                        scrollToSection('search-section');
                        setSearchLoading(true);
                        setSearchError('');
                        try {
                          const res = await fetch(`/api/public/appointment-lookup?mobile=${encodeURIComponent(bookingForm.mobile.trim())}`);
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
                      }}
                      className="bg-primary text-white hover:bg-primary-light px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Activity size={20} />
                      <span>Track Status</span>
                    </button>
                    <button
                      onClick={() => {
                        setBookingSuccess(false);
                        clearSelection();
                      }}
                      className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-3.5 rounded-xl font-bold text-base transition-colors"
                    >
                      Book Another Test
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleHomepageBookSubmit} className="space-y-6">
                  
                  {/* Selection Display */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Selected Tests / Packages ({selectedTests.length})
                    </label>
                    
                    {selectedTests.length === 0 ? (
                      <div className="text-sm text-slate-500 py-1.5 flex items-center gap-1.5">
                        <ShieldAlert size={16} className="text-amber-500 shrink-0" />
                        <span>No tests selected. Scroll to the <b>Test Explorer</b> catalog above to select tests first.</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                        {selectedTests.map((t, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-primary-pale text-primary text-xs font-bold px-3 py-1.5 rounded-lg border border-primary/10">
                            {t.name} (₹{t.price})
                            <button 
                              type="button" 
                              onClick={() => removeSelectedTest(t.testCode)}
                              className="text-primary-light hover:text-red-600 font-extrabold ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {selectedTests.length > 0 && (
                      <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 text-sm">
                        <span className="text-slate-500 font-semibold">Total Price (Pay at time of Collection):</span>
                        <span className="font-extrabold text-primary text-base">₹{totalPrice}</span>
                      </div>
                    )}
                  </div>

                  {bookingError && (
                    <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-r-lg text-sm font-semibold">
                      {bookingError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Patient Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={bookingForm.name}
                        onChange={handleBookingChange}
                        placeholder="Enter full name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                      />
                    </div>

                    {/* Mobile */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        required
                        maxLength="10"
                        pattern="[0-9]{10}"
                        value={bookingForm.mobile}
                        onChange={handleBookingChange}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Gender */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={bookingForm.gender}
                        onChange={handleBookingChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-bold bg-white"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {/* Preferred Date */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingForm.preferredDate}
                        onChange={handleBookingChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                      />
                    </div>

                    {/* Preferred Time */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Preferred Time *
                      </label>
                      <input
                        type="time"
                        name="preferredTime"
                        required
                        value={bookingForm.preferredTime}
                        onChange={handleBookingChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Visit Mode Toggle */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Sample Collection Mode
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setBookingForm(prev => ({ ...prev, isHomeCollection: true }))}
                        className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                          bookingForm.isHomeCollection
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <MapPin size={16} />
                        <span>Home Collection (Free)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingForm(prev => ({ ...prev, isHomeCollection: false }))}
                        className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
                          !bookingForm.isHomeCollection
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Microscope size={16} />
                        <span>Visit Our Laboratory</span>
                      </button>
                    </div>
                  </div>

                  {/* Address (conditional) */}
                  {bookingForm.isHomeCollection && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Full Address (with Landmark) *
                      </label>
                      <textarea
                        name="address"
                        required
                        rows="3"
                        value={bookingForm.address}
                        onChange={handleBookingChange}
                        placeholder="House Number, Sector/Colony, Landmark, City, Pin Code"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium resize-none"
                      ></textarea>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full min-h-[48px] bg-primary hover:bg-primary-light text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <Loader type="button" className="text-white" />
                    ) : (
                      'Request Collection Booking'
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Pathologists Panel & Trust Panel */}
      <section className="py-20 bg-primary-pale/20 px-4 sm:px-6 lg:px-8 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          
          <div className="flex-1 space-y-6">
            <span className="text-xs font-bold tracking-widest text-[#BA7517] uppercase bg-accent-pale px-3 py-1 rounded-full">
              Clinical Quality
            </span>
            <h2 className="text-4xl font-heading text-primary leading-tight">
              Verified by Certified Medical Pathologists
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Every single report generated at Sana Pathology undergoes multi-level verification checkups. Our laboratory operates with strict internal and external quality control guidelines.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Certified Signatures</h4>
                  <p className="text-slate-500 text-xs mt-0.5">All reports are digitally signed by a registered M.D. Pathologist.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">NABL Quality Audits</h4>
                  <p className="text-slate-500 text-xs mt-0.5">We adhere to global standards in accuracy, hygiene, and machinery.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Barcoded Specimen</h4>
                  <p className="text-slate-500 text-xs mt-0.5">No sample mix-ups. Safe barcoding processes from the collection phase.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Automated Analyzers</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Minimal human error through high-fidelity diagnostic machinery.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm border border-emerald-50 max-w-md w-full relative">
            <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              NABL Standard
            </div>
            
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-heading text-2xl font-bold">
                DR
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Dr. Sana (M.D.)</h4>
                <p className="text-slate-500 text-xs font-semibold">Chief Pathologist & Director</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Reg No. UP-1029384</p>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Verification:</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Active & Verified</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Specialization:</span>
                <span className="text-slate-700 font-bold">Hematology & Cytopathology</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Lab Experience:</span>
                <span className="text-slate-700 font-bold">15+ Years Trust</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-[11px] text-slate-500 leading-relaxed border border-slate-100 flex items-center gap-2">
              <Info size={16} className="text-primary shrink-0" />
              <span>Patients can securely search their reports on our home page. All reports contain a verified QR Code pointing directly to our secure cloud server database.</span>
            </div>
          </div>

        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-primary">Patient Testimonials</h2>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rahul Sharma', review: 'Very professional staff and timely reports. The home collection was seamless and painless.' },
              { name: 'Priya Patel', review: 'Highly accurate results. My doctor specifically recommended Sana Pathology for the thyroid tests.' },
              { name: 'Amit Kumar', review: 'Excellent service. Received my reports on WhatsApp within 6 hours as promised. Very convenient!' },
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-accent text-accent" />)}
                </div>
                <p className="text-slate-600 mb-6 italic">"{t.review}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-heading text-xl">
                    {t.name[0]}
                  </div>
                  <h4 className="font-bold text-slate-800">{t.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-primary-pale/35 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading text-primary">Frequently Asked Questions</h2>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="text-primary flex-shrink-0" /> : <ChevronDown className="text-primary flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-slate-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section id="contact" className="py-20 bg-bg px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-heading text-primary mb-6">Location & Contact</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">Visit our state-of-the-art laboratory for a comfortable and hygienic testing experience, or give us a call to book a home collection.</p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-pale rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Address</h4>
                  <p className="text-slate-600">Datawali Road, Near Aara Machine,<br/>Hayat Nagar, Distt. Sambhal-244303 (U.P)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-pale rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Opening Hours</h4>
                  <p className="text-slate-600">Monday - Saturday: 7:00 AM - 8:00 PM<br/>Sunday: 8:00 AM - 1:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-pale rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Contact Number</h4>
                  <p className="text-slate-600">+91 6396786939</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] bg-slate-200 rounded-3xl overflow-hidden shadow-sm border border-slate-300 relative flex items-center justify-center">
            <iframe 
              title="Sana Pathology Lab Location"
              src="https://www.google.com/maps?q=28.5466795,78.5773542&z=16&output=embed"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#085041] pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-primary-pale">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-heading text-white mb-4">Sana Pathology</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-6">Providing high-quality diagnostic services with unparalleled accuracy and fast turnaround times.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#stats" onClick={(e) => { e.preventDefault(); scrollToSection('stats'); }} className="hover:text-white transition-colors">Why Us</a></li>
              <li><a href="#packages" onClick={(e) => { e.preventDefault(); scrollToSection('packages'); }} className="hover:text-white transition-colors">Packages</a></li>
              <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-white transition-colors">Test Finder</a></li>
              <li><a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }} className="hover:text-white transition-colors">Book Online</a></li>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }} className="hover:text-white transition-colors">FAQ</a></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Patient Portal</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>+91 6396786939</li>
              <li>support@sanapathology.com</li>
              <li>Datawali Road, Sambhal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Certifications</h4>
            <div className="inline-block bg-white/10 px-4 py-2 rounded-lg border border-white/20">
              <span className="font-bold tracking-widest text-white text-xs">NABL ACCREDITED</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center border-t border-white/10 pt-8 text-sm opacity-60">
          &copy; {new Date().getFullYear()} Sana Pathology Lab. All rights reserved.
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a 
          href="tel:+916396786939"
          className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-xl shadow-primary/30 hover:scale-110 transition-transform"
          aria-label="Call Us"
        >
          <Phone className="w-6 h-6" />
        </a>
        <a 
          href="https://wa.me/916396786939?text=Hi,%20I%20want%20to%20book%20a%20test%20at%20Sana%20Pathology%20Lab"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#25D366] text-white px-5 h-14 rounded-full shadow-xl shadow-green-900/20 hover:scale-105 transition-transform group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold whitespace-nowrap hidden group-hover:block transition-all text-sm">Book Test</span>
        </a>
      </div>

    </div>
  );
};

export default PublicWelcome;
