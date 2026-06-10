import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, FileText, User, Calendar, Stethoscope, 
  ChevronDown, ChevronUp, CheckCircle, AlertCircle, ArrowLeft, 
  Printer, Award, Heart, ShieldCheck,
  Microscope, FlaskConical, Clock, Mail, MapPin,
  Syringe, Pill, Activity, Users, BadgeCheck,
  ChevronRight, BookOpen, Lightbulb,
  Thermometer, Droplets, Wind, HeartPulse, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const API = '/api';

const FLAG_STYLES = {
  HIGH:   { label: 'HIGH', cls: 'bg-red-100 text-red-700 font-extrabold border-red-200' },
  LOW:    { label: 'LOW', cls: 'bg-blue-100 text-blue-700 font-extrabold border-blue-200' },
  NORMAL: { label: '✓ NORMAL', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const STATS_DATA = [
  { icon: Microscope, value: 15234, suffix: '+', label: 'Tests Processed', color: 'from-emerald-500 to-teal-600' },
  { icon: Users, value: 8920, suffix: '+', label: 'Happy Patients', color: 'from-blue-500 to-cyan-600' },
  { icon: Award, value: 12, suffix: '+', label: 'Years Experience', color: 'from-amber-500 to-orange-600' },
  { icon: BadgeCheck, value: 3, suffix: '', label: 'NABL Accreditations', color: 'from-primary to-emerald-700' },
];

const HEALTH_TIPS = [
  { icon: Droplets, title: 'Stay Hydrated', tip: 'Drink 8-10 glasses of water daily for accurate blood test results.' },
  { icon: HeartPulse, title: 'Fasting Matters', tip: 'Most blood tests require 8-12 hrs fasting. Only plain water is allowed.' },
  { icon: Thermometer, title: 'Avoid Heat', tip: 'Keep sample cool. High temperatures can alter certain test parameters.' },
  { icon: Wind, title: 'Deep Breathe', tip: 'Stress can elevate cortisol & BP. Stay relaxed before sample collection.' },
  { icon: Activity, title: 'Medication Alert', tip: 'Inform your doctor about all medications before tests — some affect results.' },
  { icon: Pill, title: 'Timing is Key', tip: 'Morning samples are preferred for accurate hormonal and metabolic profiles.' },
];

const FAQS = [
  { q: 'How long does it take to get reports?', a: 'Most routine reports are ready within 24-48 hours. Specialized tests may take 3-5 days. You will receive an SMS notification once your report is ready.' },
  { q: 'Can I get a printed copy of my report?', a: 'Yes. You can view and print your report directly from this portal using the "Print Verified Report" button. You can also visit our lab to collect a physical copy.' },
  { q: 'What should I bring for sample collection?', a: 'Please bring your prescription/referral and any previous reports. If you are fasting, avoid eating 8-12 hours before the test.' },
  { q: 'Are the reports verified?', a: 'All reports are signed and approved by registered Pathologists under NABL guidelines, ensuring accuracy and reliability.' },
  { q: 'How is my data protected?', a: 'Your medical data is encrypted and stored securely. Access is restricted to authorized personnel only.' },
  { q: 'Can I get samples collected at home?', a: 'Yes, we offer free home collection services. Call us at 6396786939 or book through our website.' },
];

const Counter = ({ value, suffix, label, icon: Icon, color, isVisible }) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;
    let start = 0;
    const duration = 2000;
    const step = Math.max(1, Math.floor(value / 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, duration / 60);
    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-100/50 shadow-md transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-black text-slate-800 tracking-tight">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
};

const ReportLookup = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const statsRef = useRef(null);
  const [searchType, setSearchType] = useState('mobile');
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [tests, setTests] = useState([]);
  const [currentTip, setCurrentTip] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    const params = new URLSearchParams(qIndex !== -1 ? hash.substring(qIndex) : '');
    const reportParam = params.get('reportNumber');
    const mobileParam = params.get('mobile');
    
    if (reportParam) {
      setSearchType('report');
      setQuery(reportParam);
      executeSearch('report', reportParam);
    } else if (mobileParam) {
      setSearchType('mobile');
      setQuery(mobileParam);
      executeSearch('mobile', mobileParam);
    }

    fetch(`${API}/public/tests`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTests(data.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.2 }
    );
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % HEALTH_TIPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const executeSearch = async (type, val) => {
    if (!val.trim()) return;
    setLoading(true);
    setError('');
    setReports([]);
    try {
      const param = type === 'mobile' ? `mobile=${encodeURIComponent(val.trim())}` : `reportNumber=${encodeURIComponent(val.trim())}`;
      const res = await fetch(`${API}/public/report-lookup?${param}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'No reports found matching criteria.');
      } else {
        setReports(data);
        if (data.length === 1) setExpandedId(data[0].id);
      }
    } catch {
      setError('Could not establish connection to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch(searchType, query);
  };

  const groupByCategory = (results) => {
    const groups = {};
    results.forEach(r => {
      const cat = r.test?.category?.name || r.test?.testName || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(r);
    });
    return groups;
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? `₹${price}` : price || '—';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E1F5EE]/30 via-[#F5F7F6] to-[#FAEEDA]/30 font-sans relative overflow-hidden">
      
      {/* ─── 3D Animated Background Layer ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[8%] w-[25rem] h-[25rem] rounded-full bg-gradient-to-br from-emerald-400/15 to-emerald-600/5 blur-3xl animate-blob"></div>
        <div className="absolute bottom-[10%] left-[5%] w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-amber-300/15 to-amber-600/5 blur-3xl animate-blob-2" style={{animationDelay: '-3s'}}></div>
        <div className="absolute top-[40%] left-[50%] w-[20rem] h-[20rem] rounded-full bg-gradient-to-bl from-primary/10 to-cyan-400/5 blur-3xl animate-blob" style={{animationDelay: '-5s'}}></div>
        <div className="absolute top-[15%] left-[10%] w-40 h-40 rounded-full border border-emerald-400/10 animate-spin-slow opacity-50"></div>
        <div className="absolute bottom-[20%] right-[15%] w-32 h-32 rounded-full border border-amber-400/10 animate-spin-slower opacity-40"></div>
        <svg className="absolute top-[18%] left-[4%] w-16 h-16 text-emerald-500/10 animate-float-slow" viewBox="0 0 100 100">
          <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" fill="currentColor"/>
        </svg>
        <svg className="absolute bottom-[25%] right-[6%] w-20 h-20 text-amber-500/10 animate-float-delayed" viewBox="0 0 100 100">
          <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" fill="currentColor"/>
        </svg>
        <svg className="absolute top-[55%] right-[3%] w-24 h-24 text-primary/5 animate-dna-float" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M30,10 C45,25 55,10 70,25 M30,40 C45,55 55,40 70,55 M30,70 C45,85 55,70 70,85 M30,90 C45,75 55,90 70,75" opacity="0.8"/>
          <path d="M30,10 L30,90 M70,25 L70,75" opacity="0.6"/>
          <circle cx="30" cy="10" r="3" fill="currentColor"/>
          <circle cx="70" cy="25" r="3" fill="currentColor"/>
          <circle cx="30" cy="40" r="3" fill="currentColor"/>
          <circle cx="70" cy="55" r="3" fill="currentColor"/>
          <circle cx="30" cy="70" r="3" fill="currentColor"/>
          <circle cx="70" cy="85" r="3" fill="currentColor"/>
        </svg>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400/20"
            style={{
              top: `${8 + (i * 13) % 84}%`,
              left: `${4 + (i * 19) % 92}%`,
              animation: `float ${6 + i * 1.5}s ease-in-out ${i * 1.2}s infinite`
            }}
          />
        ))}
      </div>

      {/* ─── Header ─── */}
      <header className="bg-primary/95 backdrop-blur-md text-white shadow-lg sticky top-0 z-30 border-b border-primary-light/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <FileText className="w-6 h-6 text-[#F1C40F]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight font-heading">SANA PATHOLOGY</h1>
              <p className="text-primary-pale text-xs font-bold uppercase tracking-wider">Patient Report Portal</p>
            </div>
          </div>
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-black text-primary-pale hover:text-white bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/20 transition-all shadow-sm hover:shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 relative z-10">
        
        {/* ════════════════════════════════════════════════ */}
        {/* HERO SEARCH SECTION */}
        {/* ════════════════════════════════════════════════ */}
        <div
          ref={cardRef}
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-10 mb-10 border border-white/50 shadow-[0_20px_50px_rgba(15,110,86,0.1)] transition-all duration-500 hover:shadow-[0_30px_70px_rgba(15,110,86,0.18)] animate-slide-up relative overflow-hidden"
          style={{ perspective: '1000px' }}
          onMouseMove={(e) => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            cardRef.current.style.transform = `rotateY(${((e.clientX - rect.left) / rect.width - 0.5) * 3}deg) rotateX(${-((e.clientY - rect.top) / rect.height - 0.5) * 3}deg)`;
          }}
          onMouseLeave={() => { if (cardRef.current) cardRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)'; }}
        >
          {/* Decorative corner accents */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-400/5 rounded-full blur-3xl"></div>

          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-pale to-emerald-50 rounded-2xl mb-4 border border-[#0F6E56]/10 shadow-lg shadow-primary/5 animate-tilt-glow">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight font-heading">
              Check Your Test Report
            </h2>
            <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto">
              Enter your registered <span className="font-bold text-primary">mobile number</span> or 
              <span className="font-bold text-primary"> report number</span> to instantly access NABL verified laboratory reports.
            </p>
          </div>

          <div className="flex bg-slate-100/80 rounded-2xl p-1.5 mb-6 max-w-sm mx-auto border border-slate-200/50 backdrop-blur-sm">
            <button onClick={() => { setSearchType('mobile'); setQuery(''); setReports([]); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                searchType === 'mobile' ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            ><span>📱 Mobile Number</span></button>
            <button onClick={() => { setSearchType('report'); setQuery(''); setReports([]); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                searchType === 'report' ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            ><span>🔢 Report Number</span></button>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-300/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <input type={searchType === 'mobile' ? 'tel' : 'text'} value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={searchType === 'mobile' ? 'Enter registered mobile number...' : 'e.g. RPT-000001'}
                className="relative w-full pl-5 pr-5 py-4 border-2 border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary focus:ring-0 transition-all shadow-inner bg-white/80 backdrop-blur-sm"
                required
              />
            </div>
            <button type="submit" disabled={loading}
              className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              {loading ? <Loader type="button" className="text-white" /> : <Search className="w-4 h-4 animate-pulse-soft" />}
              {loading ? 'Searching Record...' : 'Search Report'}
            </button>
          </form>

          {searchType === 'report' && (
            <p className="text-xs text-center mt-4 text-slate-400 font-semibold animate-fade-in-up">
              Forgot report number? Switch to <span className="text-primary hover:underline cursor-pointer font-extrabold" onClick={() => setSearchType('mobile')}>Mobile Number</span> tracking!
            </p>
          )}

          {error && (
            <div className="mt-6 flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border border-red-200/50 rounded-2xl px-5 py-4 max-w-xl mx-auto animate-slide-up shadow-sm">
              <div className="relative">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 animate-bounce" />
                <div className="absolute inset-0 w-5 h-5 bg-red-400/20 rounded-full blur animate-ping"></div>
              </div>
              <p className="text-xs sm:text-sm font-semibold">{error}</p>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* LIVING HEALTH TIPS TICKER */}
        {/* ════════════════════════════════════════════════ */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-slate-100/50 shadow-sm animate-slide-up">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0 relative h-8 overflow-hidden">
              {HEALTH_TIPS.map((tip, i) => (
                <div key={i}
                  className={`absolute inset-0 flex items-center gap-3 transition-all duration-500 ${
                    i === currentTip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  {React.createElement(tip.icon, { className: 'w-4 h-4 text-primary shrink-0' })}
                  <div className="truncate">
                    <span className="text-xs font-extrabold text-primary mr-2">{tip.title}:</span>
                    <span className="text-xs text-slate-600">{tip.tip}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1 shrink-0">
              {HEALTH_TIPS.map((_, i) => (
                <button key={i} onClick={() => setCurrentTip(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentTip ? 'bg-primary w-4' : 'bg-slate-300'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* REPORTS RESULTS */}
        {/* ════════════════════════════════════════════════ */}
        {reports.length > 0 && (
          <div className="space-y-6 animate-slide-up mb-10">
            <div className="flex items-center gap-3 animate-fade-in-left mb-2">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-xl px-4 py-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-black text-slate-800">
                  {reports.length} Verified Lab Report{reports.length > 1 ? 's' : ''} Found
                </h3>
              </div>
            </div>

            {reports.map((report, idx) => {
              const isExpanded = expandedId === report.id;
              const groups = groupByCategory(report.results || []);
              return (
                <div key={report.id}
                  className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-100/50 overflow-hidden shadow-[0_10px_35px_rgba(15,110,86,0.03)] transition-all duration-500 hover:shadow-[0_25px_55px_rgba(15,110,86,0.1)] animate-slide-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <button onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="w-full flex items-center justify-between px-6 py-5 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-white transition-all duration-300 border-l-4 border-primary group"
                  >
                    <div className="flex items-center gap-4 text-left min-w-0 flex-1">
                      <div className="bg-gradient-to-br from-primary-pale to-emerald-50 p-3 rounded-2xl text-primary border border-[#0F6E56]/10 shadow-inner shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight">{report.reportNumber}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-400 font-semibold">
                          <span className="flex items-center gap-1 text-slate-500"><User className="w-3.5 h-3.5 text-primary-light" /> {report.patient?.fullName}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary-light" /> {new Date(report.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {report.doctor && (<><span className="hidden sm:inline">•</span><span className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5 text-primary-light" /> Dr. {report.doctor.name}</span></>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-2 shrink-0">
                      <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 border ${
                        report.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        <span className="relative">
                          <span className={`w-1.5 h-1.5 rounded-full inline-block ${report.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
                          <span className={`absolute inset-0 w-1.5 h-1.5 rounded-full ${report.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping opacity-40`}></span>
                        </span>
                        <span>{report.status === 'COMPLETED' ? 'Ready' : 'Processing'}</span>
                      </span>
                      <div className={`p-1 rounded-lg transition-all duration-300 ${isExpanded ? 'bg-primary/10 rotate-180' : 'group-hover:bg-slate-100'}`}>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 animate-fade-in-up">
                      {report.status !== 'COMPLETED' ? (
                        <div className="px-6 py-10 text-center">
                          <div className="inline-flex flex-col items-center gap-3 text-amber-600 max-w-sm mx-auto">
                            <div className="relative">
                              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-3xl">⏳</div>
                              <div className="absolute inset-0 w-16 h-16 rounded-full bg-amber-400/10 blur animate-ping"></div>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-lg">Sample Under Analysis</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Your collection request has been processed. The medical laboratory is running validation assays. Results will appear instantly once finalized.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="bg-gradient-to-r from-[#E1F5EE]/50 via-[#E1F5EE]/20 to-transparent px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm border-b border-slate-100 border-dashed">
                            <div className="space-y-0.5 animate-fade-in-up" style={{animationDelay: '0.05s'}}>
                              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Patient Name</p>
                              <p className="font-bold text-slate-700">{report.patient?.fullName}</p>
                            </div>
                            <div className="space-y-0.5" style={{animationDelay: '0.1s'}}>
                              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Age / Gender</p>
                              <p className="font-bold text-slate-700">{report.patient?.age} {report.patient?.ageType || 'Years'} / {report.patient?.gender}</p>
                            </div>
                            <div className="space-y-0.5" style={{animationDelay: '0.15s'}}>
                              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Report Date</p>
                              <p className="font-bold text-slate-700">{new Date(report.reportDate).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="space-y-0.5" style={{animationDelay: '0.2s'}}>
                              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Referred By</p>
                              <p className="font-bold text-slate-700">{report.doctor ? `Dr. ${report.doctor.name}` : 'Self Referral'}</p>
                            </div>
                          </div>

                          <div className="px-6 py-6 space-y-6">
                            {Object.entries(groups).map(([cat, results], gIdx) => (
                              <div key={cat} className="border border-slate-100/80 rounded-2xl p-4 bg-gradient-to-br from-slate-50/80 to-white shadow-inner hover:shadow-md transition-shadow duration-300">
                                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4 pb-2 border-b border-primary-light/10 flex items-center gap-1.5">
                                  <Heart size={14} className="text-[#BA7517] fill-[#BA7517]" /> <span>{cat}</span>
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs sm:text-sm">
                                    <thead>
                                      <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                                        <th className="text-left py-2 pr-4 font-extrabold">Investigation</th>
                                        <th className="text-right py-2 pr-6 font-extrabold">Observed Value</th>
                                        <th className="text-center py-2 pr-4 font-extrabold">Indicator</th>
                                        <th className="text-left py-2 pr-4 font-extrabold">Unit</th>
                                        <th className="text-left py-2 font-extrabold">Reference Interval</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100/50">
                                      {results.map(r => {
                                        const isAbnormal = r.flag === 'HIGH' || r.flag === 'LOW';
                                        const f = FLAG_STYLES[r.flag] || { label: 'NORMAL', cls: 'text-slate-400' };
                                        return (
                                          <tr key={r.id} className={`transition-all duration-200 hover:bg-white/80 ${isAbnormal ? 'bg-red-50/30' : ''}`}>
                                            <td className="py-3 pr-4 font-bold text-slate-800">{r.parameterName}</td>
                                            <td className={`py-3 pr-6 text-right font-black text-base ${
                                              r.flag === 'HIGH' ? 'text-red-600' : r.flag === 'LOW' ? 'text-blue-600' : 'text-slate-700'
                                            }`}>{r.resultValue}</td>
                                            <td className="py-3 pr-4 text-center">
                                              <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded border tracking-wider ${
                                                r.flag === 'HIGH' ? 'bg-red-50 text-red-600 border-red-200' : r.flag === 'LOW' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                              }`}>{f.label}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-slate-400 font-semibold text-xs">{r.unit || '-'}</td>
                                            <td className="py-3 text-slate-500 font-medium text-xs">{r.referenceRange || '-'}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100/50 rounded-xl flex items-center justify-center text-primary shrink-0">
                                <Award className="w-5 h-5 text-primary-light" />
                              </div>
                              <div className="text-left">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Verified Result</p>
                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Signed & approved by registered Pathologist under NABL guidelines.</p>
                              </div>
                            </div>
                            <button onClick={() => {
                              const printUrl = `${window.location.origin}${import.meta.env.BASE_URL}#/public-print/${report.reportNumber}`;
                              window.open(printUrl, '_blank');
                            }}
                              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white text-xs font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-md shadow-primary/20 active:scale-[0.97] w-full sm:w-auto hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
                            ><Printer className="w-4 h-4" /> Print Verified Report</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/* STATS COUNTERS */}
        {/* ════════════════════════════════════════════════ */}
        <div ref={statsRef} className="mb-10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-slate-800 font-heading">Trusted by Thousands</h3>
            <p className="text-sm text-slate-500 mt-1">Our commitment to quality and accuracy</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS_DATA.map((stat, i) => (
              <div key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                <Counter {...stat} isVisible={statsVisible} />
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* POPULAR HEALTH PACKAGES */}
        {/* ════════════════════════════════════════════════ */}
        {tests.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-2xl font-black text-slate-800 font-heading">Popular Health Packages</h3>
                <p className="text-sm text-slate-500 mt-0.5">Comprehensive screening at affordable prices</p>
              </div>
              <button onClick={() => navigate('/')}
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-light transition-colors"
              >View All <ChevronRight className="w-3 h-3" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.filter(t => !t.is_qualitative).slice(0, 6).map((test, i) => (
                <div key={test.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up group cursor-pointer"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => navigate('/')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-pale to-emerald-50 border border-[#0F6E56]/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-primary bg-primary-pale/50 px-3 py-1 rounded-full border border-primary/10">
                      {test.category?.name || 'Health Check'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm mb-1 leading-tight">{test.name}</h4>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-1">{test.testName || test.description || 'Comprehensive health screening package'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-primary">{formatPrice(test.price)}</span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Book Now</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/* TRUST BADGES */}
        {/* ════════════════════════════════════════════════ */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 mb-10 border border-slate-100/50 shadow-sm animate-slide-up">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-slate-800 font-heading">Our Accreditations & Certifications</h3>
            <p className="text-sm text-slate-500 mt-1">We maintain the highest standards of quality and accuracy</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Award, title: 'NABL Accredited', desc: 'National Accreditation Board for Testing and Calibration Laboratories', color: 'from-blue-500 to-blue-600' },
              { icon: ShieldCheck, title: 'ISO 15189:2022', desc: 'Medical laboratories — Requirements for quality and competence', color: 'from-emerald-500 to-emerald-600' },
              { icon: BadgeCheck, title: 'Certified Pathologists', desc: 'All reports verified by experienced medical professionals', color: 'from-primary to-emerald-700' },
              { icon: Heart, title: 'Patient Confidentiality', desc: 'Your data is encrypted, secure, and fully confidential', color: 'from-rose-500 to-pink-600' },
            ].map((badge, i) => (
              <div key={i} className="text-center p-4 rounded-2xl hover:bg-slate-50/50 transition-all duration-300 group">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${badge.color} text-white shadow-md mb-3 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                  {React.createElement(badge.icon, { className: 'w-5 h-5' })}
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">{badge.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* APPOINTMENT CTA */}
        {/* ════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-primary via-primary-light to-primary rounded-3xl p-6 md:p-8 mb-10 shadow-xl animate-slide-up relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white text-center sm:text-left">
              <div className="flex items-center gap-2 mb-1">
                <Syringe className="w-5 h-5 text-[#F1C40F]" />
                <h3 className="text-xl font-black font-heading">Need a Health Checkup?</h3>
              </div>
              <p className="text-primary-pale text-sm">Book your appointment online — free home collection available.</p>
            </div>
            <button onClick={() => navigate('/book-appointment')}
              className="bg-white text-primary hover:bg-primary-pale font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg active:scale-[0.97] hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2"
            ><Calendar className="w-4 h-4" /> Book Appointment</button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* FAQ SECTION */}
        {/* ════════════════════════════════════════════════ */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-slate-800 font-heading">Frequently Asked Questions</h3>
            <p className="text-sm text-slate-500 mt-1">Everything you need to know about your lab reports</p>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100/50 overflow-hidden transition-all duration-300 hover:shadow-md animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left group"
                >
                  <span className="font-extrabold text-slate-800 text-sm pr-4 group-hover:text-primary transition-colors">{faq.q}</span>
                  <div className={`p-1 rounded-lg shrink-0 transition-all duration-300 ${openFaq === i ? 'bg-primary/10 rotate-180' : 'group-hover:bg-slate-100'}`}>
                    <ChevronDown className={`w-4 h-4 transition-colors ${openFaq === i ? 'text-primary' : 'text-slate-400'}`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* LAB INFO FOOTER */}
        {/* ════════════════════════════════════════════════ */}
        <footer className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-slate-100/50 shadow-sm animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary p-1.5 rounded-lg">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-extrabold text-slate-800 font-heading">Sana Pathology</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">NABL accredited diagnostic laboratory providing accurate and reliable pathology services since 2014.</p>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-3">Quick Links</h4>
              <div className="space-y-2 text-xs">
                <button onClick={() => navigate('/')} className="block text-slate-500 hover:text-primary transition-colors font-semibold">Home</button>
                <button onClick={() => navigate('/book-appointment')} className="block text-slate-500 hover:text-primary transition-colors font-semibold">Book Appointment</button>
                <button onClick={() => window.open('https://wa.me/916396786939', '_blank')} className="block text-slate-500 hover:text-primary transition-colors font-semibold">WhatsApp</button>
              </div>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-3">Contact</h4>
              <div className="space-y-2 text-xs">
                <p className="flex items-center gap-2 text-slate-500 font-semibold"><Phone className="w-3.5 h-3.5 text-primary" /> 6396786939</p>
                <p className="flex items-center gap-2 text-slate-500 font-semibold"><Mail className="w-3.5 h-3.5 text-primary" /> support@sanapathology.com</p>
                <p className="flex items-center gap-2 text-slate-500 font-semibold"><MapPin className="w-3.5 h-3.5 text-primary" /> Hayat Nagar, Sambhal</p>
              </div>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-3">Working Hours</h4>
              <div className="space-y-2 text-xs">
                <p className="flex items-center gap-2 text-slate-500 font-semibold"><Clock className="w-3.5 h-3.5 text-primary" /> Mon – Sat: 7:00 AM – 8:00 PM</p>
                <p className="flex items-center gap-2 text-slate-500 font-semibold"><Clock className="w-3.5 h-3.5 text-primary" /> Sun: 8:00 AM – 2:00 PM</p>
                <p className="flex items-center gap-2 text-emerald-600 font-bold mt-1"><Activity className="w-3.5 h-3.5" /> Open Today</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck size={12} className="text-primary-light" />
              © 2026 Sana Pathology Lab. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <Microscope className="w-4 h-4 text-primary/40 animate-float-slow" />
              <FlaskConical className="w-4 h-4 text-primary/40 animate-float-delayed" />
              <HeartPulse className="w-4 h-4 text-primary/40 animate-pulse-soft" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReportLookup;
