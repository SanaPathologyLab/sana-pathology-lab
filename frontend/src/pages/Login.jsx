import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Stethoscope, HeartPulse, ShieldCheck, Clock, Award, 
  Phone, Mail, Key, Eye, EyeOff, ArrowLeft, MessageCircle, 
  Info, HelpCircle, ChevronDown, ChevronUp, Sun, Moon, Zap, 
  Sparkles, Activity 
} from 'lucide-react';
import Loader from '../components/Loader';
import Logo from '../components/Logo';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Login = () => {
  const [activeTab, setActiveTab] = useState('PATIENT'); // STAFF, DOCTOR, PATIENT
  const [isRegisteringDoctor, setIsRegisteringDoctor] = useState(false);
  const [isRegisteringStaff, setIsRegisteringStaff] = useState(false);
  const [isRecoveringId, setIsRecoveringId] = useState(false);
  
  // Custom premium features states
  const [darkMode, setDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showDemoAccess, setShowDemoAccess] = useState(false);
  const [showIdHelper, setShowIdHelper] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [greeting, setGreeting] = useState('Welcome back');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  
  const [docName, setDocName] = useState('');
  const [docClinic, setDocClinic] = useState('');
  const [recoverFullName, setRecoverFullName] = useState('');
  const [recoveredId, setRecoveredId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Remember Me: Load saved credentials from localStorage
  useEffect(() => {
    setError('');
    setSuccess('');
    
    if (activeTab === 'STAFF') {
      const savedEmail = localStorage.getItem('sana_remember_staff_email');
      if (savedEmail) {
        setEmail(savedEmail);
      } else {
        setEmail('');
      }
    } else if (activeTab === 'PATIENT') {
      const savedPatientId = localStorage.getItem('sana_remember_patient_id');
      const savedPatientMobile = localStorage.getItem('sana_remember_patient_mobile');
      if (savedPatientId && savedPatientMobile) {
        setPatientId(savedPatientId);
        setMobileNumber(savedPatientMobile);
      } else {
        setPatientId('');
        setMobileNumber('');
      }
    } else if (activeTab === 'DOCTOR') {
      const savedDoctorId = localStorage.getItem('sana_remember_doctor_id');
      const savedDoctorMobile = localStorage.getItem('sana_remember_doctor_mobile');
      if (savedDoctorId && savedDoctorMobile) {
        setDoctorId(savedDoctorId);
        setMobileNumber(savedDoctorMobile);
      } else {
        setDoctorId('');
        setMobileNumber('');
      }
    }
  }, [activeTab]);

  // Handle Demo Fill action
  const handleFillDemo = (type) => {
    setError('');
    setSuccess('Demo credentials pre-filled. Press Secure Sign In to enter!');
    
    if (type === 'PATIENT') {
      setActiveTab('PATIENT');
      setPatientId('SPL-0038');
      setMobileNumber('9876543210');
    } else if (type === 'DOCTOR') {
      setActiveTab('DOCTOR');
      setDoctorId('DOC-0001');
      setMobileNumber('6396889713');
    } else if (type === 'STAFF') {
      setActiveTab('STAFF');
      setEmail('admin@sanapathology.com');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setRecoveredId('');
    setLoading(true);
    try {
      if (isRegisteringStaff) {
        const response = await fetch(API_BASE + '/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: regName, phone: regPhone, role: 'ADMIN' })
        });
        const data = await response.json();
        if (response.ok) {
          setSuccess('Staff account created! Please sign in with your credentials.');
          setIsRegisteringStaff(false);
          setRegName('');
          setRegPhone('');
        } else {
          setError(data.message);
        }
        setLoading(false);
        return;
      }

      if (isRegisteringDoctor) {
        const response = await fetch(API_BASE + '/api/auth/register/doctor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: docName, mobileNumber, clinicName: docClinic })
        });
        const data = await response.json();
        if (response.ok) {
          setSuccess(data.message + ` Your ID is: ${data.doctorId}`);
          setIsRegisteringDoctor(false);
          setMobileNumber('');
          setDocName('');
          setDocClinic('');
        } else {
          setError(data.message);
        }
        setLoading(false);
        return;
      }

      if (isRecoveringId) {
        if (activeTab === 'STAFF') {
          setError('Please contact the Lab Admin to reset your staff password.');
          setLoading(false);
          return;
        }

        const endpoint = activeTab === 'PATIENT' ? '/api/auth/recover/patient' : '/api/auth/recover/doctor';
        const response = await fetch(API_BASE + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobileNumber, fullName: recoverFullName })
        });
        const data = await response.json();
        if (response.ok) {
          setRecoveredId(data.id);
          setSuccess('ID found successfully!');
        } else {
          setError(data.message);
        }
        setLoading(false);
        return;
      }

      let endpoint = '';
      let bodyData = {};

      if (activeTab === 'STAFF') {
        endpoint = '/api/auth/login';
        bodyData = { email, password };
      } else if (activeTab === 'PATIENT') {
        endpoint = '/api/auth/login/patient';
        bodyData = { mobileNumber, patientId };
      } else if (activeTab === 'DOCTOR') {
        endpoint = '/api/auth/login/doctor';
        bodyData = { mobileNumber, doctorId };
      }

      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await response.json();
      if (response.ok) {
        // Remember Me logic: Save or clear credentials on login success
        if (rememberMe) {
          if (activeTab === 'STAFF') {
            localStorage.setItem('sana_remember_staff_email', email);
          } else if (activeTab === 'PATIENT') {
            localStorage.setItem('sana_remember_patient_id', patientId);
            localStorage.setItem('sana_remember_patient_mobile', mobileNumber);
          } else if (activeTab === 'DOCTOR') {
            localStorage.setItem('sana_remember_doctor_id', doctorId);
            localStorage.setItem('sana_remember_doctor_mobile', mobileNumber);
          }
        } else {
          if (activeTab === 'STAFF') {
            localStorage.removeItem('sana_remember_staff_email');
          } else if (activeTab === 'PATIENT') {
            localStorage.removeItem('sana_remember_patient_id');
            localStorage.removeItem('sana_remember_patient_mobile');
          } else if (activeTab === 'DOCTOR') {
            localStorage.removeItem('sana_remember_doctor_id');
            localStorage.removeItem('sana_remember_doctor_mobile');
          }
        }

        login(data);
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'PATIENT', label: 'Patient Portal', icon: HeartPulse },
    { id: 'DOCTOR', label: 'Doctor Portal', icon: Stethoscope },
    { id: 'STAFF', label: 'Staff / Admin', icon: User },
  ];

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row font-sans relative overflow-hidden transition-colors duration-500 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* BACKGROUND FLOATING DECORATIONS */}
      <div className={`absolute top-10 right-10 w-96 h-96 rounded-full blur-3xl -z-10 animate-pulse transition-colors duration-500 ${
        darkMode ? 'bg-emerald-500/5' : 'bg-primary-light/5'
      }`}></div>
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-accent/5 rounded-full blur-2xl -z-10"></div>
      
      {/* LEFT SECTION: BRANDING, DECORATIVE FLOATING CELLS & TRUST ELEMENTS (HIDDEN ON MOBILE) */}
      <div className="hidden md:flex md:w-5/12 bg-[#085041] relative flex-col justify-between p-12 text-white overflow-hidden shadow-2xl">
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-800/40 via-[#085041] to-black/30 opacity-90 mix-blend-multiply"></div>
        
        {/* Floating Biology Cells (CSS Animations) */}
        <div className="absolute top-1/4 left-10 w-8 h-8 rounded-full bg-white/10 border border-white/20 animate-float"></div>
        <div className="absolute bottom-1/4 right-20 w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 animate-float-slow" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-1/3 right-10 w-6 h-6 rounded-full bg-[#F1C40F]/10 border border-[#F1C40F]/20 animate-float-delayed" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-emerald-400/5 border border-emerald-400/10 animate-float-slow"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Logo className="w-12 h-12 md:w-14 md:h-14 drop-shadow-lg p-1 bg-white/10 rounded-2xl" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight leading-none text-white animate-fade-in-down">Sana Pathology</h1>
              <p className="text-[10px] text-yellow-400 font-extrabold tracking-widest uppercase mt-1">Diagnostic Portal</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-auto py-8 space-y-8">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider border border-white/15">
              <ShieldCheck size={12} /> NABL ACCREDITED
            </span>
            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Clinical Quality <br />
              <span className="text-yellow-400">At Your Fingertips</span>
            </h2>
            <p className="text-sm md:text-base text-emerald-100 font-light leading-relaxed max-w-md">
              Securely login to download certified laboratory reports, manage patient test histories, and track sample collection status in real-time.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-1 text-yellow-400">
                <Award size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Accredited</span>
              </div>
              <p className="text-2xl font-black">100%</p>
              <p className="text-[10px] text-emerald-200 mt-0.5">NABL Quality Standards</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-1 text-yellow-400">
                <Clock size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">TAT Speed</span>
              </div>
              <p className="text-2xl font-black">6-12 Hrs</p>
              <p className="text-[10px] text-emerald-200 mt-0.5">Report turnaround time</p>
            </div>
          </div>

          {/* Features check points */}
          <div className="space-y-3 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3 text-sm text-emerald-100 font-medium">
              <ShieldCheck className="text-yellow-400 shrink-0" size={18} />
              <span>Multi-level pathologist verification checks</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-100 font-medium">
              <ShieldCheck className="text-yellow-400 shrink-0" size={18} />
              <span>Full confidentiality and secure report archiving</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 border-t border-white/10 pt-4 flex justify-between items-center text-xs text-emerald-200">
          <span>&copy; {new Date().getFullYear()} Sana Pathology</span>
          <span className="bg-white/10 px-2.5 py-1 rounded font-semibold text-[10px]">UP, INDIA</span>
        </div>
      </div>

      {/* RIGHT SECTION: LOGIN FORM & DYNAMIC CARD */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative">
        
        {/* MOBILE TOP BRANDING BANNER (VISIBLE ON MOBILE ONLY) */}
        <div className="md:hidden flex flex-col items-center mb-6 text-center">
          <Logo className="w-14 h-14 drop-shadow-md p-1 bg-[#085041]/10 rounded-2xl mb-2" />
          <h1 className="text-2xl font-black text-[#085041] leading-none">Sana Pathology</h1>
          <p className="text-[10px] text-primary-light font-bold tracking-widest uppercase mt-1">Diagnostic Center</p>
        </div>

        {/* LIVE LAB STATUS TICKER */}
        <div className={`w-full max-w-lg mb-4 border rounded-2xl p-3 flex items-center justify-between shadow-sm text-xs font-semibold ${
          darkMode 
            ? 'bg-slate-900/60 border-slate-800 text-slate-300' 
            : 'bg-emerald-50/70 border-emerald-100 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            <Activity className="text-emerald-500 animate-pulse shrink-0" size={16} />
            <span>Lab Status: <span className="text-emerald-500 font-extrabold uppercase">Open & Processing</span></span>
          </div>
          <span className="opacity-75">• TAT: Normal (6-12h)</span>
        </div>

        {/* PREMIUM CARD CONTAINER */}
        <div className={`w-full max-w-lg p-8 md:p-10 rounded-[2.5rem] shadow-2xl border transition-all duration-500 relative ${
          darkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-100 text-slate-800'
        }`}>
          
          {/* THEME TOGGLE BUTTON */}
          <button 
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`absolute top-6 right-6 p-2 rounded-xl border transition-colors ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* CARD HEADER */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {isRecoveringId 
                ? 'Recover Your ID' 
                : isRegisteringDoctor 
                  ? 'Doctor Registration' 
                  : isRegisteringStaff 
                    ? 'Staff Account Registration' 
                    : `${greeting}`}
            </h2>
            <p className={`text-xs md:text-sm mt-1.5 font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isRecoveringId 
                ? 'Retrieve patient or doctor credentials'
                : isRegisteringDoctor
                  ? 'Join our provider referral network'
                  : isRegisteringStaff
                    ? 'Create an administrative lab account'
                    : 'Access your diagnostic report dashboard'}
            </p>
          </div>

          {/* TAB SELECTORS (HIDDEN IN REGISTRATION/RECOVERY) */}
          {!isRegisteringDoctor && !isRegisteringStaff && !isRecoveringId && (
            <div className={`flex p-1 rounded-2xl mb-6 border ${
              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200/50'
            }`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { 
                      setActiveTab(tab.id); 
                      setError(''); 
                      setSuccess(''); 
                      setRecoveredId(''); 
                      setIsRecoveringId(false); 
                    }}
                    className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
                      isActive 
                        ? (darkMode 
                          ? 'bg-slate-800 text-white shadow-md' 
                          : 'bg-white text-[#085041] shadow-md shadow-[#085041]/5 scale-[1.02]')
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon size={16} className={isActive ? (darkMode ? 'text-emerald-400' : 'text-[#085041]') : 'text-slate-400'} />
                    <span className="text-[10px] font-black tracking-wide mt-1.5 uppercase">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* BANNERS */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-100 flex items-start gap-2 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl text-xs font-bold flex items-start gap-2 animate-bounce-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* FORM ELEMENT */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. RECOVERY PANEL */}
            {isRecoveringId && (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border text-center text-xs font-bold leading-relaxed ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
                }`}>
                  {activeTab === 'STAFF' 
                    ? 'Staff accounts require manual verification. Online password self-service is not permitted.' 
                    : `Enter your exact full name and registered phone number to securely search our database for your ${activeTab.toLowerCase()} ID.`}
                </div>
                
                {activeTab !== 'STAFF' ? (
                  <>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Registered Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User size={16} />
                        </div>
                        <input 
                          type="text" 
                          value={recoverFullName} 
                          onChange={(e) => setRecoverFullName(e.target.value)} 
                          required
                          placeholder="e.g. John Doe"
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                            darkMode 
                              ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                              : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                          }`} 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Mobile Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone size={16} />
                        </div>
                        <input 
                          type="tel" 
                          value={mobileNumber} 
                          onChange={(e) => setMobileNumber(e.target.value)} 
                          required
                          placeholder="Registered 10-digit number"
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                            darkMode 
                              ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                              : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                          }`} 
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl text-xs text-center font-bold">
                    🔑 Security Warning: Please contact Chief Pathologist / Administrator to request a staff password reset.
                  </div>
                )}

                {recoveredId && (
                  <div className="mt-4 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center shadow-inner animate-fade-in-up">
                    <p className="text-xs text-emerald-500 font-extrabold uppercase tracking-wider mb-1">Retrieval Successful</p>
                    <p className="text-xs opacity-75">Your credentials ID is:</p>
                    <p className="text-3xl font-black text-emerald-500 mt-1 select-all tracking-wider">{recoveredId}</p>
                    <p className="text-[10px] opacity-60 mt-2">Click or double tap on the ID above to copy it to login.</p>
                  </div>
                )}
                
                <div className="text-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setIsRecoveringId(false); setRecoveredId(''); setError(''); setSuccess(''); }} 
                    className="text-xs text-[#085041] hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold flex items-center justify-center gap-1 mx-auto hover:underline"
                  >
                    <ArrowLeft size={12} /> Back to Sign In
                  </button>
                </div>
              </div>
            )}

            {/* 2. STAFF REGISTRATION */}
            {activeTab === 'STAFF' && isRegisteringStaff && !isRecoveringId && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={regName} 
                      onChange={(e) => setRegName(e.target.value)} 
                      required
                      placeholder="Enter full name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required
                      placeholder="e.g. staff@sanapathology.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Key size={16} />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                      placeholder="Create secure password"
                      className={`w-full pl-10 pr-10 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input 
                      type="tel" 
                      value={regPhone} 
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="Mobile contact"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                  </div>
                </div>

                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => setIsRegisteringStaff(false)} 
                    className="text-xs text-[#085041] hover:text-emerald-500 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </div>
            )}

            {/* 3. STAFF LOGIN */}
            {activeTab === 'STAFF' && !isRegisteringDoctor && !isRegisteringStaff && !isRecoveringId && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Login ID / Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required
                      placeholder="Enter registered email / Staff ID"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Key size={16} />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                      placeholder="Enter password"
                      className={`w-full pl-10 pr-10 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => { setIsRegisteringStaff(true); setError(''); setSuccess(''); }} 
                    className="text-xs text-[#085041] hover:text-emerald-500 dark:text-emerald-400 font-bold hover:underline"
                  >
                    First time? Register new account
                  </button>
                </div>
              </div>
            )}

            {/* 4. PATIENT LOGIN */}
            {activeTab === 'PATIENT' && !isRegisteringDoctor && !isRecoveringId && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Patient ID (e.g. SPL-0001)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={patientId} 
                      onChange={(e) => setPatientId(e.target.value.toUpperCase())} 
                      required
                      placeholder="e.g. SPL-0001"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input 
                      type="tel" 
                      value={mobileNumber} 
                      onChange={(e) => setMobileNumber(e.target.value)} 
                      required
                      placeholder="Enter 10-digit number"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. DOCTOR LOGIN */}
            {activeTab === 'DOCTOR' && !isRegisteringDoctor && !isRecoveringId && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Doctor ID (e.g. DOC-0001)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Stethoscope size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={doctorId} 
                      onChange={(e) => setDoctorId(e.target.value.toUpperCase())} 
                      required
                      placeholder="e.g. DOC-0001"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input 
                      type="tel" 
                      value={mobileNumber} 
                      onChange={(e) => setMobileNumber(e.target.value)} 
                      required
                      placeholder="Registered mobile number"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                  </div>
                </div>

                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => setIsRegisteringDoctor(true)} 
                    className="text-xs text-[#085041] hover:text-emerald-500 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Don't have an ID? Register here.
                  </button>
                </div>
              </div>
            )}

            {/* 6. DOCTOR REGISTRATION */}
            {isRegisteringDoctor && !isRecoveringId && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Full Name (with Dr.)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={docName} 
                      onChange={(e) => setDocName(e.target.value)} 
                      required
                      placeholder="e.g. Dr. Jane Doe"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input 
                      type="tel" 
                      value={mobileNumber} 
                      onChange={(e) => setMobileNumber(e.target.value)} 
                      required
                      placeholder="10-digit primary contact"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">Clinic / Hospital Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Stethoscope size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={docClinic} 
                      onChange={(e) => setDocClinic(e.target.value)}
                      placeholder="e.g. Heart Care Clinic"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl outline-none transition-all text-sm font-medium ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 focus:bg-slate-900 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#085041] text-slate-800'
                      }`} 
                    />
                  </div>
                </div>

                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => setIsRegisteringDoctor(false)} 
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold hover:underline"
                  >
                    Back to Doctor Sign In
                  </button>
                </div>
              </div>
            )}

            {/* REMEMBER ME CHECKBOX */}
            {!isRecoveringId && !isRegisteringDoctor && !isRegisteringStaff && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#085041] focus:ring-[#085041] w-4 h-4 border-slate-300 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold opacity-75">Remember my credentials</span>
                </label>
              </div>
            )}

            {/* ACTION SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={loading || (isRecoveringId && activeTab === 'STAFF')}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#085041] to-[#128362] hover:from-[#0a5d4c] hover:to-[#0f7154] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#085041] shadow-lg shadow-emerald-950/20 active:scale-[0.98] transition-all mt-6 disabled:opacity-50"
            >
              {loading ? (
                <Loader type="button" className="text-white" />
              ) : (
                isRecoveringId ? 'Find My ID' : (isRegisteringDoctor || isRegisteringStaff ? 'Register Account' : 'Secure Sign In')
              )}
            </button>
          </form>

          {/* QUICK DEMO ACCESS PANEL */}
          {!isRecoveringId && !isRegisteringDoctor && !isRegisteringStaff && (
            <div className={`mt-5 border rounded-2xl overflow-hidden ${
              darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-amber-100 bg-amber-50/20'
            }`}>
              <button
                type="button"
                onClick={() => setShowDemoAccess(!showDemoAccess)}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold transition-colors ${
                  darkMode 
                    ? 'text-emerald-400 hover:bg-slate-800' 
                    : 'text-amber-700 hover:bg-amber-50/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Zap size={14} className="fill-current animate-bounce" />
                  Quick Demo Access (Test Drive)
                </span>
                {showDemoAccess ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {showDemoAccess && (
                <div className={`p-4 border-t text-xs space-y-3 animate-fade-in-down ${
                  darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-amber-100 bg-white'
                }`}>
                  <p className="text-[11px] opacity-75 leading-relaxed font-semibold">
                    Test the system portals with one click! Select a dashboard to auto-fill credentials:
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFillDemo('PATIENT')}
                      className={`py-2 px-1 text-center font-bold text-[10px] rounded-lg border transition-all ${
                        darkMode 
                          ? 'border-slate-800 hover:border-emerald-500 bg-slate-900 text-white' 
                          : 'border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                      }`}
                    >
                      Patient (Inayat)
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleFillDemo('DOCTOR')}
                      className={`py-2 px-1 text-center font-bold text-[10px] rounded-lg border transition-all ${
                        darkMode 
                          ? 'border-slate-800 hover:border-emerald-500 bg-slate-900 text-white' 
                          : 'border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                      }`}
                    >
                      Doctor (Sameer)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFillDemo('STAFF')}
                      className={`py-2 px-1 text-center font-bold text-[10px] rounded-lg border transition-all ${
                        darkMode 
                          ? 'border-slate-800 hover:border-emerald-500 bg-slate-900 text-white' 
                          : 'border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                      }`}
                    >
                      Admin (Sana)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FORGOT ID ACCORDION HELPER */}
          {!isRecoveringId && !isRegisteringDoctor && !isRegisteringStaff && (
            <div className="mt-4 space-y-3">
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => { setIsRecoveringId(true); setError(''); setSuccess(''); }} 
                  className={`text-xs font-bold hover:underline ${
                    darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#085041] hover:text-emerald-700'
                  }`}
                >
                  Forgot ID / Password?
                </button>
              </div>

              {/* Collapsible How-To Card */}
              {activeTab !== 'STAFF' && (
                <div className={`border rounded-2xl overflow-hidden mt-2 ${
                  darkMode ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <button
                    type="button"
                    onClick={() => setShowIdHelper(!showIdHelper)}
                    className={`w-full flex items-center justify-between p-3 text-[11px] font-bold transition-colors ${
                      darkMode ? 'bg-slate-900 text-slate-300 hover:bg-slate-850' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle size={14} className={darkMode ? 'text-emerald-400' : 'text-[#085041]'} />
                      How do I get my {activeTab.toLowerCase()} ID?
                    </span>
                    {showIdHelper ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {showIdHelper && (
                    <div className={`p-3.5 border-t text-[11px] leading-relaxed space-y-1.5 animate-fade-in-down ${
                      darkMode ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'
                    }`}>
                      <p>
                        <b>Patients:</b> Your unique ID (e.g. <code>SPL-0012</code>) is printed on your lab registration invoice, receipt, or sample collection tracking slip.
                      </p>
                      <p>
                        <b>Doctors:</b> Your ID (e.g. <code>DOC-0045</code>) was sent to your registered mobile number upon registration. 
                      </p>
                      <p className={darkMode ? 'text-emerald-400 font-semibold' : 'text-[#085041] font-semibold'}>
                        💡 Tip: You can retrieve it online using the "Forgot ID / Password?" link above.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* NAVIGATION FOOTER */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link 
              to="/" 
              className={`text-xs font-bold flex items-center gap-1.5 hover:underline ${
                darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-[#085041]'
              }`}
            >
              <ArrowLeft size={14} /> Back to Public Lab Site
            </Link>

            {/* Helpline Contact link */}
            <a 
              href="https://wa.me/916396786939?text=Hi%20Sana%20Pathology,%20I%20am%20having%20trouble%20logging%20into%20my%20portal%20account" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs font-bold text-[#25D366] hover:text-[#128C7E] flex items-center gap-1.5"
            >
              <MessageCircle size={14} /> Portal Helpline Support
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
