import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, Search, ChevronRight, ChevronLeft, AlertCircle, Shield, CheckCircle2, User, Phone, ArrowRight, ShieldCheck, Heart, Trash2, ArrowLeft, Loader2, Sparkles, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { useLanguage } from '../context/LanguageContext';
import { TESTS_DATA, HEALTH_PACKAGES_DATA } from '../data/testsData';

const STEPS = [
  { id: 'tests', label: 'Tests', icon: <Heart className="w-4 h-4" /> },
  { id: 'patient', label: 'Patient', icon: <User className="w-4 h-4" /> },
  { id: 'datetime', label: 'Date & Time', icon: <Calendar className="w-4 h-4" /> },
  { id: 'address', label: 'Address', icon: <MapPin className="w-4 h-4" /> },
  { id: 'coupon', label: 'Coupon', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'confirm', label: 'Confirm', icon: <Check className="w-4 h-4" /> },
];

const SAMPLE_TESTS = TESTS_DATA.map(t => ({
  name: t.testName,
  code: t.code,
  price: t.price,
  category: t.category?.name || 'General',
  sample: t.sampleType || 'Blood',
  tat: t.code === 'CBC' || t.code === 'FBS' || t.code === 'HBA1C' ? '6 hrs' : t.code === 'VITD' || t.code === 'DENGUE-01' ? '24 hrs' : '12 hrs'
}));

const PACKAGES = HEALTH_PACKAGES_DATA.map(p => ({
  name: p.name,
  code: p.code,
  price: p.price,
  originalPrice: p.originalPrice || p.price + 500,
  desc: p.desc || 'Comprehensive health checkup.',
  badge: p.badge || 'Popular'
}));

const CATEGORIES = ['All', ...new Set(TESTS_DATA.map(t => t.category?.name || 'Other'))];

const BookingWizard = ({ existingCart, onCartUpdate, scrollToSection }) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [selectedTests, setSelectedTests] = useState(() => {
    if (!existingCart) return [];
    return existingCart.map(item => ({
      name: item.name,
      code: item.code || item.testCode,
      testCode: item.testCode || item.code,
      price: item.price,
      isPackage: item.isPackage
    }));
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [patient, setPatient] = useState({ name: '', mobile: '', gender: '' });
  const [dateTime, setDateTime] = useState({ date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '08:00', isHomeCollection: true });
  const [address, setAddress] = useState('');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [errors, setErrors] = useState({});

  const [createdAppointment, setCreatedAppointment] = useState(null);

  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [upiUtr, setUpiUtr] = useState('');
  const [upiSubmitted, setUpiSubmitted] = useState(false);
  const [upiError, setUpiError] = useState('');

  const [compareExpanded, setCompareExpanded] = useState(false);
  const [sampleFilter, setSampleFilter] = useState('All');
  const [fastingFilter, setFastingFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');

  const totalPrice = useMemo(() => selectedTests.reduce((s, t) => s + t.price, 0), [selectedTests]);
  const discountAmount = couponApplied ? Math.round(totalPrice * 0.1) : 0;
  const finalPrice = totalPrice - discountAmount;

  useEffect(() => {
    if (existingCart) {
      const currentCodes = selectedTests.map(t => t.code || t.testCode);
      const incomingCodes = existingCart.map(t => t.code || t.testCode);
      const isSame = currentCodes.length === incomingCodes.length && currentCodes.every(c => incomingCodes.includes(c));
      if (!isSame) {
        setSelectedTests(existingCart.map(item => ({
          name: item.name,
          code: item.code || item.testCode,
          testCode: item.testCode || item.code,
          price: item.price,
          isPackage: item.isPackage
        })));
      }
    }
  }, [existingCart]);

  useEffect(() => {
    if (onCartUpdate) onCartUpdate(selectedTests);
    try { localStorage.setItem('sana_cart', JSON.stringify(selectedTests)); } catch {}
  }, [selectedTests, onCartUpdate]);

  useEffect(() => {
    let intervalId;
    if (verifyingPayment && createdAppointment) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/public/payment-status/${createdAppointment.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.paymentStatus === 'PAID') {
              setVerifyingPayment(false);
              setVerificationSuccess(true);
            }
          }
        } catch (err) {
          console.error('Polling payment status error:', err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [verifyingPayment, createdAppointment]);

  const filteredTests = useMemo(() => {
    return SAMPLE_TESTS.filter(t => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
      const matchesSample = sampleFilter === 'All' || t.sample.toLowerCase().includes(sampleFilter.toLowerCase());
      const matchesFasting = fastingFilter === 'All' || (fastingFilter === 'Yes' && t.name.toLowerCase().includes('fasting')) || (fastingFilter === 'No' && !t.name.toLowerCase().includes('fasting'));
      const matchesPrice = priceFilter === 'All' || (priceFilter === 'under200' && t.price < 200) || (priceFilter === '200to500' && t.price >= 200 && t.price <= 500) || (priceFilter === 'above500' && t.price > 500);

      return matchesSearch && matchesCategory && matchesSample && matchesFasting && matchesPrice;
    });
  }, [searchQuery, activeCategory, sampleFilter, fastingFilter, priceFilter]);

  const toggleTest = (test) => {
    setSelectedTests(prev => prev.some(t => t.code === test.code || t.testCode === test.code)
      ? prev.filter(t => t.code !== test.code && t.testCode !== test.code)
      : [...prev, { name: test.name, code: test.code, testCode: test.code, price: test.price, isPackage: false }]
    );
  };

  const togglePackage = (pkg) => {
    setSelectedTests(prev => prev.some(t => t.code === pkg.code || t.testCode === pkg.code)
      ? prev.filter(t => t.code !== pkg.code && t.testCode !== pkg.code)
      : [...prev, { name: pkg.name, code: pkg.code, testCode: pkg.code, price: pkg.price, isPackage: true }]
    );
  };

  const removeItem = (code) => setSelectedTests(prev => prev.filter(t => t.code !== code && t.testCode !== code));

  const validateStep = (idx) => {
    const e = {};
    if (idx === 0 && selectedTests.length === 0) e.tests = 'Please select at least one test or package.';
    if (idx === 1) {
      if (!patient.name.trim()) e.name = 'Patient name is required.';
      if (!/^[6-9]\d{9}$/.test(patient.mobile)) e.mobile = 'Enter a valid 10-digit mobile number.';
      if (!patient.gender) e.gender = 'Please select gender.';
    }
    if (idx === 2) {
      if (!dateTime.date) e.date = 'Select a date.';
      if (!dateTime.time) e.time = 'Select a time.';
    }
    if (idx === 3 && dateTime.isHomeCollection && !address.trim()) e.address = 'Address is required for home collection.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep(step)) setStep(prev => Math.min(prev + 1, 5)); };
  const handleBack = () => setStep(prev => Math.max(prev - 1, 0));

  const handleBook = async () => {
    if (selectedTests.length === 0) { setBookingError('Select at least one test.'); return; }
    setBookingLoading(true);
    setBookingError('');
    try {
      const testListStr = selectedTests.map(t => `${t.name} (₹${t.price})`).join(', ');
      const response = await fetch('/api/public/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: patient.name,
          mobile: patient.mobile,
          gender: patient.gender.toUpperCase(),
          address: dateTime.isHomeCollection ? address : 'Lab Visit',
          preferredDate: dateTime.date,
          preferredTime: dateTime.time,
          notes: `Requested via Booking Wizard. Tests: ${testListStr}. Total: ₹${finalPrice}${couponApplied ? ` (Coupon applied, saved ₹${discountAmount})` : ''}`
        })
      });
      if (response.ok) {
        const data = await response.json();
        setCreatedAppointment(data.appointment);
        setBookingSuccess(true);
        setVerifyingPayment(true);
      } else {
        const data = await response.json();
        setBookingError(data.message || 'Booking failed. Try again.');
      }
    } catch (err) {
      setBookingError('Network error. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const stepIndicator = (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center shrink-0">
          <button onClick={() => i <= step && setStep(i)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${i === step ? 'bg-[#00488d] text-white shadow-md' : i < step ? 'bg-blue-50 text-[#00488d]' : 'bg-slate-100 text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center ${i === step ? 'bg-white/20' : i < step ? 'bg-[#00488d] text-white' : 'bg-slate-200 text-slate-400'}`}>
              {i < step ? <Check size={10} /> : i + 1}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
          {i < 5 && <div className={`w-6 h-0.5 mx-1 ${i < step ? 'bg-[#00488d]' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  );

  if (bookingSuccess) {
    return (
      <section id="booking" className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in-up">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Booking Submitted!</h2>
          <p className="text-slate-500 mb-6 font-medium">Thank you, {patient.name}. We'll confirm your slot shortly.</p>
          
          {createdAppointment && (
            <div className="mb-8 max-w-sm mx-auto bg-white rounded-2xl border border-slate-100 shadow-md p-5 text-left">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <span>💳 Pay Online via UPI</span>
              </h4>
              
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 mb-2">
                  <QRCodeSVG value={`upi://pay?pa=6396786939@okbizaxis&pn=Sana%20Pathology%20Lab&am=${finalPrice}&cu=INR`} size={144} level="H" includeMargin={true} />
                </div>
              </div>

              {verificationSuccess ? (
                <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-4 text-center space-y-2 animate-fade-in-up">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} className="text-emerald-600" />
                  </div>
                  <h5 className="text-xs font-black text-emerald-800 uppercase tracking-wider">Payment Verified!</h5>
                  <p className="text-[10px] text-emerald-600 font-medium">Payment automatically fetched & confirmed. Slot booked successfully!</p>
                </div>
              ) : (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-center space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00488d] to-transparent animate-[shimmer_2s_infinite]"></div>
                  
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-100 z-10 relative">
                        <Loader2 className="w-6 h-6 text-[#00488d] animate-spin" />
                      </div>
                      <div className="absolute inset-0 bg-[#00488d] rounded-full animate-ping opacity-20"></div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Awaiting Payment</h5>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Please scan the QR code to pay using any UPI app.<br />
                        Our system will <strong className="text-[#00488d]">auto-fetch</strong> your payment status instantly.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100/50">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">For Demo Purposes Only</p>
                    <button
                      type="button"
                      onClick={() => setVerificationSuccess(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 text-[10px] font-black uppercase tracking-wider shadow transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Simulate Successful Scan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
 
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <button
              onClick={handleAlertWhatsApp}
              className="bg-[#25D366] text-white hover:bg-[#128C7E] px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>WhatsApp Alert</span>
            </button>
            <button 
              onClick={() => { 
                setStep(0); 
                setBookingSuccess(false); 
                setSelectedTests([]); 
                setPatient({ name: '', mobile: '', gender: '' }); 
                setCreatedAppointment(null); 
                setUpiUtr(''); 
                setUpiSubmitted(false); 
                setUpiError(''); 
                setVerifyingPayment(false);
                setVerificationSuccess(false);
              }}
              className="bg-primary hover:bg-primary-light text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
            >
              Book Another
            </button>
          </div>
        </div>
      </section>
    );
  }

  const summarySidebar = (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-24">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Search size={18}/> Booking Summary</h3>
      {selectedTests.length === 0 ? (
        <p className="text-slate-500 text-sm">No tests selected yet. Add some tests to proceed.</p>
      ) : (
        <>
          <ul className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
            {selectedTests.map((t, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium truncate pr-2">{t.name}</span>
                <span className="text-slate-800 font-bold shrink-0">₹{t.price}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-500 font-medium"><span>Subtotal</span><span>₹{totalPrice}</span></div>
            {couponApplied && <div className="flex justify-between text-sm text-emerald-600 font-bold"><span>Discount (10%)</span><span>-₹{discountAmount}</span></div>}
            <div className="flex justify-between text-lg text-primary font-black pt-2 border-t border-slate-100 mt-2"><span>Total</span><span>₹{finalPrice}</span></div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-slate-50 to-white px-4 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-black tracking-widest text-secondary uppercase bg-secondary-pale px-4 py-1.5 rounded-full">Book in 1 Minute</span>
          <h2 className="text-4xl font-heading text-primary font-black mt-4">Schedule Your Health Checkup</h2>
          <p className="text-slate-500 mt-2 font-medium">Choose your tests, pick a slot, and get tested from the comfort of your home</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Form */}
          <div className="flex-1 w-full bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8">
            {stepIndicator}

            {/* Step 0: Select Tests */}
            {step === 0 && (
              <div className="animate-fade-in-up space-y-6">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-black tracking-widest text-[#00488d] uppercase bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">Step 1 of 6</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">Select Packages & Tests</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Explore our central diagnostics offerings. Select packages or individual tests.</p>
                </div>

                {/* Premium Package Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {PACKAGES.map((pkg, i) => {
                    const sel = selectedTests.some(t => t.code === pkg.code || t.testCode === pkg.code);
                    const savings = pkg.originalPrice - pkg.price;
                    const isRecommended = pkg.badge === 'Recommended';
                    const isBestValue = pkg.badge === 'Best Value';
                    const isPopular = pkg.badge === 'Popular';
                    
                    return (
                      <div 
                        key={i} 
                        className={`relative rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden shadow-sm bg-white ${
                          sel ? 'border-[#00488d] ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-300 hover:shadow-md'
                        }`}
                      >
                        {pkg.badge && (
                          <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-bl-xl text-white ${
                            isRecommended ? 'bg-indigo-600' : isBestValue ? 'bg-amber-500' : 'bg-rose-500'
                          }`}>
                            {pkg.badge}
                          </div>
                        )}
                        <div className="p-5 pb-4">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Premium Package</p>
                          <h4 className="text-base font-black text-slate-800 mt-1 mb-2 leading-tight">{pkg.name}</h4>
                          <p className="text-xs text-slate-500 mb-4 h-10 overflow-hidden line-clamp-2">{pkg.desc}</p>
                          
                          {/* Details */}
                          <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00488d] shrink-0" />
                              <span>Includes <strong>{pkg.code.includes('BASIC') ? '40+' : pkg.code.includes('COMP') ? '60+' : '50+'}</strong> Parameters</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00488d] shrink-0" />
                              <span>Sample: <strong>Blood, Urine</strong></span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price & Select CTA */}
                        <div className="p-5 pt-0 mt-auto bg-slate-50 border-t border-slate-100/50 flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 line-through">₹{pkg.originalPrice}</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-black text-[#00488d]">₹{pkg.price}</span>
                              <span className="text-[10px] font-bold text-emerald-600">Save ₹{savings}</span>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => togglePackage(pkg)} 
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                              sel ? 'bg-secondary text-white hover:bg-secondary/90 shadow' : 'bg-[#00488d] hover:bg-blue-800 text-white shadow-sm'
                            }`}
                          >
                            {sel ? 'Added ✓' : 'Add Package'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Package Comparison Table (Accordion style) */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                  <button 
                    type="button"
                    onClick={() => setCompareExpanded(!compareExpanded)}
                    className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100/70 transition-colors flex justify-between items-center text-left"
                  >
                    <span className="text-xs font-black uppercase tracking-wider text-[#00488d] flex items-center gap-1.5">
                      📊 Compare Premium Packages
                    </span>
                    <span className="text-xs font-bold text-slate-500">{compareExpanded ? 'Hide Details ▲' : 'Show Details ▼'}</span>
                  </button>
                  {compareExpanded && (
                    <div className="overflow-x-auto p-4 border-t border-slate-100">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400">
                            <th className="py-2.5 px-4 font-bold">Parameters / Tests</th>
                            <th className="py-2.5 px-4 font-bold text-center">Basic Care (₹999)</th>
                            <th className="py-2.5 px-4 font-bold text-center">Comprehensive (₹1999)</th>
                            <th className="py-2.5 px-4 font-bold text-center">Senior Citizen (₹1499)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700">
                          <tr>
                            <td className="py-2 px-4 font-semibold">Complete Blood Count (CBC)</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 font-semibold">Liver Function Test (LFT)</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 font-semibold">Kidney Function Test (KFT)</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 font-semibold">Lipid Profile</td>
                            <td className="py-2 px-4 text-center text-slate-300">—</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 font-semibold">Thyroid Profile (TFT)</td>
                            <td className="py-2 px-4 text-center text-slate-300">—</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                            <td className="py-2 px-4 text-center text-slate-300">—</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 font-semibold">Vitamin D</td>
                            <td className="py-2 px-4 text-center text-slate-300">—</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                            <td className="py-2 px-4 text-center text-slate-300">—</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 font-semibold">Urine Routine</td>
                            <td className="py-2 px-4 text-center text-slate-300">—</td>
                            <td className="py-2 px-4 text-center text-slate-300">—</td>
                            <td className="py-2 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                          </tr>
                          <tr className="bg-slate-50/50">
                            <td className="py-2.5 px-4 font-bold">Total Parameters</td>
                            <td className="py-2.5 px-4 text-center font-black text-[#00488d]">40+ Params</td>
                            <td className="py-2.5 px-4 text-center font-black text-[#00488d]">60+ Params</td>
                            <td className="py-2.5 px-4 text-center font-black text-[#00488d]">50+ Params</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Central Test Explorer & Finder */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5">
                    🔍 Smart Test Finder
                  </h4>
                  
                  {/* Frequently Searched Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 mr-1.5">Frequent:</span>
                    {['CBC', 'FBS', 'HbA1c', 'LFT', 'KFT', 'Thyroid', 'Lipid Profile', 'Vitamin D'].map(chip => (
                      <button 
                        key={chip} 
                        type="button" 
                        onClick={() => {
                          setSearchQuery(chip);
                          setActiveCategory('All');
                        }}
                        className="text-[10px] font-bold bg-slate-100 hover:bg-[#00488d] hover:text-white px-2.5 py-1 rounded-full transition-colors text-slate-600"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Autocomplete Input & Dropdown */}
                  <div className="relative mb-4">
                    <input 
                      type="text" 
                      value={searchQuery} 
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        setShowAutocomplete(true);
                      }} 
                      onFocus={() => setShowAutocomplete(true)}
                      placeholder="Search tests by name or short code (e.g. CBC, TFT)..." 
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00488d] focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    
                    {/* Autocomplete suggestions dropdown */}
                    {showAutocomplete && searchQuery.trim() && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-30 max-h-52 overflow-y-auto divide-y divide-slate-50">
                        {filteredTests.slice(0, 5).map((t, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              toggleTest(t);
                              setShowAutocomplete(false);
                            }}
                            className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-800">{t.name}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5">({t.code})</span>
                            </div>
                            <span className="font-black text-[#00488d]">₹{t.price}</span>
                          </div>
                        ))}
                        {filteredTests.length === 0 && (
                          <div className="p-3 text-center text-xs text-slate-400">No matching tests found</div>
                        )}
                        <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50">Click to toggle test</div>
                      </div>
                    )}
                  </div>

                  {/* Multifactor Filters */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {/* Category Filter */}
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Category</span>
                      <select 
                        value={activeCategory} 
                        onChange={e => setActiveCategory(e.target.value)}
                        className="text-xs font-bold border border-slate-200 rounded-lg p-1.5 bg-white text-slate-700 focus:outline-none"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    {/* Sample Type Filter */}
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Sample Type</span>
                      <select 
                        value={sampleFilter} 
                        onChange={e => setSampleFilter(e.target.value)}
                        className="text-xs font-bold border border-slate-200 rounded-lg p-1.5 bg-white text-slate-700 focus:outline-none"
                      >
                        <option value="All">All Samples</option>
                        <option value="Blood">EDTA Blood</option>
                        <option value="Serum">Serum</option>
                        <option value="Plasma">Fluoride Plasma</option>
                        <option value="Urine">Urine</option>
                        <option value="Semen">Semen</option>
                      </select>
                    </div>

                    {/* Fasting Requirement Filter */}
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Fasting</span>
                      <select 
                        value={fastingFilter} 
                        onChange={e => setFastingFilter(e.target.value)}
                        className="text-xs font-bold border border-slate-200 rounded-lg p-1.5 bg-white text-slate-700 focus:outline-none"
                      >
                        <option value="All">All Requirements</option>
                        <option value="Yes">Fasting Required</option>
                        <option value="No">No Fasting Required</option>
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Price Range</span>
                      <select 
                        value={priceFilter} 
                        onChange={e => setPriceFilter(e.target.value)}
                        className="text-xs font-bold border border-slate-200 rounded-lg p-1.5 bg-white text-slate-700 focus:outline-none"
                      >
                        <option value="All">All Prices</option>
                        <option value="under200">Under ₹200</option>
                        <option value="200to500">₹200 - ₹500</option>
                        <option value="above500">Above ₹500</option>
                      </select>
                    </div>
                  </div>

                  {/* Filtered Test Grid Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {filteredTests.map((test, i) => {
                      const sel = selectedTests.some(t => t.code === test.code || t.testCode === test.code);
                      return (
                        <div 
                          key={i} 
                          onClick={() => toggleTest(test)} 
                          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                            sel ? 'border-[#00488d] bg-blue-50/50 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                              sel ? 'bg-[#00488d] border-[#00488d]' : 'border-slate-300'
                            }`}>
                              {sel && <Check size={8} className="text-white" />}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">{test.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                {test.category} • {test.code} • {test.sample} • TAT: {test.tat}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-[#00488d] shrink-0 ml-2">₹{test.price}</span>
                        </div>
                      );
                    })}
                    {filteredTests.length === 0 && (
                      <p className="text-xs text-slate-400 py-8 text-center col-span-2">No tests match your filter settings.</p>
                    )}
                  </div>
                </div>

                {errors.tests && <p className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.tests}</p>}
                
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button onClick={handleNext} className="bg-[#00488d] hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all">
                    Continue to Patient <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Patient Details */}
            {step === 1 && (
              <div className="animate-fade-in-up space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">2. Patient Details</h3>
                  <p className="text-sm text-slate-500">Who is this test for?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={patient.name} onChange={e => setPatient({ ...patient, name: e.target.value })} placeholder="Enter patient name" className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold outline-none transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10'}`} />
                    {errors.name && <p className="text-[11px] font-bold text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mobile Number <span className="text-red-500">*</span></label>
                    <input type="tel" value={patient.mobile} onChange={e => setPatient({ ...patient, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile" maxLength={10} className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold outline-none transition-all ${errors.mobile ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10'}`} />
                    {errors.mobile ? <p className="text-[11px] font-bold text-red-500">{errors.mobile}</p> : <p className="text-[10px] text-slate-400 font-medium">We'll send confirmation and reports here</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Gender <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      {['Male', 'Female', 'Other'].map(g => (
                        <button key={g} onClick={() => setPatient({ ...patient, gender: g })} className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${patient.gender === g ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>{g}</button>
                      ))}
                    </div>
                    {errors.gender && <p className="text-[11px] font-bold text-red-500">{errors.gender}</p>}
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button onClick={handleBack} className="px-5 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"><ChevronLeft size={16} /> Back</button>
                  <button onClick={handleNext} className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all">Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="animate-fade-in-up space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">3. Date & Time</h3>
                  <p className="text-sm text-slate-500">When should we visit?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Preferred Date <span className="text-red-500">*</span></label>
                    <input type="date" value={dateTime.date} min={new Date().toISOString().split('T')[0]} onChange={e => setDateTime({ ...dateTime, date: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                    {errors.date && <p className="text-[11px] font-bold text-red-500">{errors.date}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Preferred Time <span className="text-red-500">*</span></label>
                    <input type="time" value={dateTime.time} onChange={e => setDateTime({ ...dateTime, time: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                    {errors.time && <p className="text-[11px] font-bold text-red-500">{errors.time}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Collection Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setDateTime({ ...dateTime, isHomeCollection: true })} className={`py-4 px-5 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${dateTime.isHomeCollection ? 'border-secondary bg-secondary-pale/30 text-secondary' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}><MapPin size={18} /> Free Home Collection</button>
                    <button onClick={() => setDateTime({ ...dateTime, isHomeCollection: false })} className={`py-4 px-5 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${!dateTime.isHomeCollection ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>Visit Lab</button>
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button onClick={handleBack} className="px-5 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"><ChevronLeft size={16} /> Back</button>
                  <button onClick={handleNext} className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all">Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {step === 3 && (
              <div className="animate-fade-in-up space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">4. Address</h3>
                  <p className="text-sm text-slate-500">Where should we send our phlebotomist?</p>
                </div>
                {dateTime.isHomeCollection ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Complete Address <span className="text-red-500">*</span></label>
                    <textarea value={address} onChange={e => setAddress(e.target.value)} rows={4} placeholder="House/flat no., street/colony, landmark, city..." className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold outline-none transition-all resize-none ${errors.address ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10'}`} />
                    {errors.address && <p className="text-[11px] font-bold text-red-500">{errors.address}</p>}
                    <p className="text-[10px] text-slate-400 font-medium">Our phlebotomist will arrive at your doorstep at the scheduled time</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                    <MapPin size={32} className="text-primary mx-auto mb-2" />
                    <p className="font-bold text-slate-700">Visit Our Lab</p>
                    <p className="text-sm text-slate-500">Datawali Road, Near Aara Machine, Hayat Nagar, Distt. Sambhal-244303 (U.P)</p>
                    <p className="text-xs text-slate-400 mt-1">Mon-Sat: 7:00 AM - 8:00 PM | Sun: 8:00 AM - 1:00 PM</p>
                  </div>
                )}
                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button onClick={handleBack} className="px-5 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"><ChevronLeft size={16} /> Back</button>
                  <button onClick={handleNext} className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all">Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            )}

            {/* Step 4: Coupon */}
            {step === 4 && (
              <div className="animate-fade-in-up space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">5. Coupon Code</h3>
                  <p className="text-sm text-slate-500">Have a coupon? Enter it below for a discount.</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex gap-3">
                    <input type="text" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all uppercase" />
                    <button onClick={() => { if (coupon === 'SANA10') { setCouponApplied(true); setCouponError(''); } else { setCouponApplied(false); setCouponError('Invalid coupon code.'); } }} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-light transition-all">Apply</button>
                  </div>
                  {couponApplied && <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 size={12} /> Coupon applied! You saved ₹{discountAmount}.</p>}
                  {couponError && <p className="text-xs font-bold text-red-500 mt-2">{couponError}</p>}
                  <p className="text-[10px] text-slate-400 font-medium mt-3">Try code <span className="font-bold text-primary">SANA10</span> for 10% off</p>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button onClick={handleBack} className="px-5 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"><ChevronLeft size={16} /> Back</button>
                  <button onClick={handleNext} className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all">Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <div className="animate-fade-in-up space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">6. Confirmation</h3>
                  <p className="text-sm text-slate-500">Review your booking before submitting</p>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patient</p>
                    <p className="font-bold text-slate-800">{patient.name} | {patient.mobile} | {patient.gender}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Schedule</p>
                    <p className="font-bold text-slate-800">{dateTime.date} at {dateTime.time} | {dateTime.isHomeCollection ? 'Home Collection' : 'Visit Lab'}</p>
                  </div>
                  {dateTime.isHomeCollection && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address</p>
                      <p className="font-bold text-slate-800">{address}</p>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tests ({selectedTests.length})</p>
                    <ul className="space-y-1">
                      {selectedTests.map((t, i) => <li key={i} className="text-sm font-semibold text-slate-700 flex justify-between"><span>{t.name}</span><span>₹{t.price}</span></li>)}
                    </ul>
                    {couponApplied && <div className="flex justify-between text-sm font-semibold text-emerald-600 border-t border-slate-200 mt-2 pt-2"><span>Discount (10%)</span><span>-₹{discountAmount}</span></div>}
                    <div className="flex justify-between text-base font-black text-primary border-t border-slate-200 mt-2 pt-2"><span>Total</span><span>₹{finalPrice}</span></div>
                  </div>
                </div>
                {bookingError && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl flex items-center gap-1"><AlertCircle size={14} />{bookingError}</p>}
                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button onClick={handleBack} className="px-5 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"><ChevronLeft size={16} /> Back</button>
                  <button onClick={handleBook} disabled={bookingLoading} className="bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary text-white px-10 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-secondary/20 disabled:opacity-50 transition-all flex items-center gap-2">
                    {bookingLoading ? <><Loader2 size={18} className="animate-spin" /> Booking...</> : <><Shield size={18} /> Confirm Booking - ₹{finalPrice}</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="w-full lg:w-80 shrink-0 hidden lg:block">
            {summarySidebar}
            <div className="mt-4 bg-secondary-pale rounded-2xl p-4 border border-secondary/20">
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Why choose us?</p>
              <ul className="space-y-1.5">
                <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 size={12} className="text-secondary shrink-0" />Free home collection above ₹500</li>
                <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 size={12} className="text-secondary shrink-0" />Reports in 12-24 hours</li>
                <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 size={12} className="text-secondary shrink-0" />NABL accredited lab</li>
                <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 size={12} className="text-secondary shrink-0" />Certified phlebotomists</li>
                <li className="text-xs text-slate-600 flex items-center gap-2"><CheckCircle2 size={12} className="text-secondary shrink-0" />Pay at time of collection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingWizard;
