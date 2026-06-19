import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import {
  User, FileText, Calendar, Activity, Phone, MessageCircle,
  Shield, Heart, ChevronRight, Download, Clock, CheckCircle2,
  AlertCircle, Lock, ArrowRight, Users, Stethoscope, Sparkles,
  Upload, Calculator, TrendingUp, Eye, Loader2, LogOut, Plus
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ─── OTP LOGIN SCREEN ─── */
const OTPLogin = ({ onVerified }) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('mobile'); // mobile | otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [devOtp, setDevOtp] = useState(''); // for dev display

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/public/reports/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setMaskedMobile(data.maskedMobile || '');
      if (data.otp) setDevOtp(data.otp); // Dev-mode only
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/public/reports/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      // Store session
      sessionStorage.setItem('pd_token', data.token);
      sessionStorage.setItem('pd_mobile', mobile);
      onVerified(mobile, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0F6E56] to-[#1D9E75] rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-500/25">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-black text-slate-900 mb-2">My Health Account</h1>
          <p className="text-slate-500 text-sm">Access your reports, appointments, and health history securely.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/8 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#063b30] to-[#1D9E75] px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <Lock className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                {step === 'mobile' ? 'Step 1: Enter Mobile' : 'Step 2: Verify OTP'}
              </p>
              <p className="text-white/60 text-xs">Secure OTP verification</p>
            </div>
          </div>

          <div className="p-6">
            {step === 'mobile' ? (
              <form onSubmit={sendOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit mobile"
                      maxLength={10}
                      className="w-full pl-14 pr-4 py-4 border-2 border-gray-100 rounded-2xl text-base font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 bg-gray-50/50 transition-all"
                      autoFocus
                    />
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2">
                    <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700 font-semibold">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || mobile.length !== 10}
                  className="w-full py-4 bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Sending OTP...</>
                  ) : (
                    <><Phone size={18} /> Send OTP</>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-5">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-emerald-700 font-semibold">
                    OTP sent to <strong>{maskedMobile || `+91 ${mobile}`}</strong>
                  </p>
                  {devOtp && (
                    <p className="text-xs text-amber-600 font-bold mt-1">
                      Dev Mode OTP: <span className="font-mono tracking-widest">{devOtp}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    maxLength={6}
                    className="w-full px-4 py-4 border-2 border-gray-100 rounded-2xl text-2xl font-black text-center tracking-[0.5em] focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 bg-gray-50/50 transition-all"
                    autoFocus
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2">
                    <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700 font-semibold">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                  ) : (
                    <><Shield size={18} /> Verify & Login</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('mobile'); setOtp(''); setError(''); setDevOtp(''); }}
                  className="w-full py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ← Change Number
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Shield size={11} /> 256-bit Secure</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Lock size={11} /> OTP Verified</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Heart size={11} /> NABL Accredited</span>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN DASHBOARD ─── */
const DashboardView = ({ mobile, token, onLogout }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [trends, setTrends] = useState([]);
  const [selectedTrend, setSelectedTrend] = useState('');
  // Family management
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [familyForm, setFamilyForm] = useState({ name: '', relation: '', mobile: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reportsRes, appointmentsRes] = await Promise.all([
        fetch(`${API}/public/report-lookup?mobile=${mobile}`),
        fetch(`${API}/public/appointment-lookup?mobile=${mobile}`),
      ]);

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data);
        if (data.length > 0) {
          setPatientInfo(data[0].patient);
          // Compute trends
          computeTrends(data);
        }
      }

      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        setAppointments(Array.isArray(data) ? data : []);
      }

      // Load family members from localStorage
      const saved = localStorage.getItem(`spl_family_${mobile}`);
      if (saved) setFamilyMembers(JSON.parse(saved));
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [mobile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const computeTrends = (reportsList) => {
    const parameterMap = {};
    const sorted = [...reportsList]
      .filter(r => r.status === 'COMPLETED')
      .sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate));

    sorted.forEach(r => {
      const dateStr = new Date(r.reportDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' });
      (r.results || []).forEach(res => {
        const val = parseFloat(res.resultValue);
        if (res.parameterName && !isNaN(val)) {
          const name = res.parameterName.trim();
          if (!parameterMap[name]) {
            parameterMap[name] = { parameterName: name, unit: res.unit || '', referenceRange: res.referenceRange || '', history: [] };
          }
          parameterMap[name].history.push({ date: dateStr, value: val, flag: res.flag || 'NORMAL' });
        }
      });
    });

    const computed = Object.values(parameterMap).filter(p => p.history.length >= 2);
    setTrends(computed);
    if (computed.length > 0) setSelectedTrend(computed[0].parameterName);
  };

  const activeTrend = trends.find(t => t.parameterName === selectedTrend);
  const trendData = activeTrend ? {
    labels: activeTrend.history.map(h => h.date),
    datasets: [{
      label: `${activeTrend.parameterName} (${activeTrend.unit})`,
      data: activeTrend.history.map(h => h.value),
      borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,0.1)',
      fill: true, tension: 0.3, pointBackgroundColor: '#1D9E75', pointRadius: 5, pointHoverRadius: 7,
    }]
  } : null;

  const completedReports = reports.filter(r => r.status === 'COMPLETED');
  const pendingReports = reports.filter(r => r.status !== 'COMPLETED');
  const upcomingAppointments = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED');

  // Count abnormal results across all reports
  const totalAbnormal = reports.reduce((sum, r) => {
    return sum + (r.results || []).filter(res => res.flag === 'HIGH' || res.flag === 'LOW').length;
  }, 0);

  const addFamilyMember = () => {
    if (!familyForm.name.trim()) return;
    const updated = [...familyMembers, { ...familyForm, id: Date.now() }];
    setFamilyMembers(updated);
    localStorage.setItem(`spl_family_${mobile}`, JSON.stringify(updated));
    setFamilyForm({ name: '', relation: '', mobile: '' });
    setShowAddFamily(false);
  };

  const removeFamilyMember = (id) => {
    const updated = familyMembers.filter(m => m.id !== id);
    setFamilyMembers(updated);
    localStorage.setItem(`spl_family_${mobile}`, JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <Activity size={15} /> },
    { id: 'reports', label: `Reports (${reports.length})`, icon: <FileText size={15} /> },
    { id: 'appointments', label: `Appointments`, icon: <Calendar size={15} /> },
    { id: 'trends', label: 'Health Trends', icon: <TrendingUp size={15} /> },
    { id: 'family', label: 'My Family', icon: <Users size={15} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header card */}
      <div className="bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0d7a60] rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center text-4xl border border-white/20 shadow-lg">
              👤
            </div>
            <div>
              <h2 className="text-2xl font-black">
                {patientInfo?.fullName ? `Welcome, ${patientInfo.fullName}` : 'My Health Account'}
              </h2>
              <p className="text-white/60 text-sm flex items-center gap-2">
                <Phone size={12} /> +91 {mobile}
                {patientInfo?.age && <> • {patientInfo.age} yrs</>}
                {patientInfo?.gender && <> • {patientInfo.gender}</>}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Reports', value: reports.length, icon: <FileText size={20} />, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
          { label: 'Pending', value: pendingReports.length, icon: <Clock size={20} />, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
          { label: 'Abnormal Flags', value: totalAbnormal, icon: <AlertCircle size={20} />, color: 'from-red-500 to-rose-600', bg: 'bg-red-50' },
          { label: 'Appointments', value: appointments.length, icon: <Calendar size={20} />, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all`}>
            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap mb-8 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Book Test', icon: <Plus size={18} />, to: '/book-appointment', color: 'from-[#0F6E56] to-[#1D9E75]' },
              { label: 'Upload Rx', icon: <Upload size={18} />, to: '/upload-prescription', color: 'from-purple-500 to-indigo-600' },
              { label: 'Health Calc', icon: <Calculator size={18} />, to: '/health-calculators', color: 'from-amber-500 to-orange-500' },
              { label: 'Download Report', icon: <Download size={18} />, to: '/report-lookup', color: 'from-blue-500 to-cyan-500' },
            ].map(action => (
              <Link
                key={action.label}
                to={action.to}
                className={`flex flex-col items-center gap-2 bg-gradient-to-br ${action.color} text-white rounded-2xl p-5 font-bold text-sm shadow-md hover:-translate-y-1 hover:shadow-lg transition-all`}
              >
                {action.icon}
                {action.label}
              </Link>
            ))}
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <FileText size={16} className="text-[#1D9E75]" /> Recent Reports
              </h3>
              <button onClick={() => setActiveTab('reports')} className="text-xs font-bold text-[#1D9E75] hover:underline flex items-center gap-1">
                View All <ChevronRight size={12} />
              </button>
            </div>
            {reports.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                <p className="font-semibold">No reports yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {reports.slice(0, 5).map(report => (
                  <div key={report.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        report.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{report.reportNumber}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {new Date(report.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {report.doctor && ` • Dr. ${report.doctor.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                        report.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {report.status === 'COMPLETED' ? '✓ Ready' : '⏳ Processing'}
                      </span>
                      {report.status === 'COMPLETED' && (
                        <Link to={`/public-print/${report.reportNumber}`} className="text-[#1D9E75] hover:bg-emerald-50 p-1.5 rounded-lg transition-colors">
                          <Eye size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" /> Upcoming Appointments
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {upcomingAppointments.map(apt => (
                  <div key={apt.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {apt.time && ` at ${apt.time}`}
                        </p>
                        <p className="text-xs text-slate-400">
                          {apt.type === 'HOME_COLLECTION' ? '🏠 Home Collection' : '🏥 Lab Visit'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                      apt.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {apt.status === 'CONFIRMED' ? '✓ Confirmed' : '⏳ Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ REPORTS TAB ═══ */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
              <FileText size={48} className="mx-auto mb-4 text-slate-200" />
              <h3 className="text-xl font-black text-slate-700 mb-2">No Reports Yet</h3>
              <p className="text-slate-400 text-sm mb-6">Once you get tested at Sana Pathology, your reports will appear here.</p>
              <Link to="/book-appointment" className="inline-flex items-center gap-2 bg-[#1D9E75] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:-translate-y-0.5 transition-all shadow-md">
                <Plus size={16} /> Book Your First Test
              </Link>
            </div>
          ) : (
            reports.map(report => {
              const abnormals = (report.results || []).filter(r => r.flag === 'HIGH' || r.flag === 'LOW');
              return (
                <div key={report.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        report.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <FileText size={22} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{report.reportNumber}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 font-semibold mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(report.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {report.doctor && (
                            <span className="flex items-center gap-1">
                              <Stethoscope size={11} /> Dr. {report.doctor.name}
                            </span>
                          )}
                          <span>
                            {(report.results || []).length} parameters
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      {abnormals.length > 0 && (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                          {abnormals.length} Abnormal
                        </span>
                      )}
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                        report.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {report.status === 'COMPLETED' ? '✓ Ready' : '⏳ Processing'}
                      </span>
                      {report.status === 'COMPLETED' && (
                        <Link
                          to={`/public-print/${report.reportNumber}`}
                          className="flex items-center gap-1.5 bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-3 py-2 rounded-xl font-bold text-xs transition-all shadow-sm"
                        >
                          <Eye size={13} /> View & Print
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ APPOINTMENTS TAB ═══ */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-black text-slate-900">Your Appointments</h3>
            <Link to="/book-appointment" className="flex items-center gap-1.5 bg-[#1D9E75] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:-translate-y-0.5 transition-all">
              <Plus size={14} /> Book New
            </Link>
          </div>
          {appointments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-slate-200" />
              <h3 className="text-xl font-black text-slate-700 mb-2">No Appointments</h3>
              <p className="text-slate-400 text-sm mb-6">Book a test or home collection to get started.</p>
              <Link to="/book-appointment" className="inline-flex items-center gap-2 bg-[#1D9E75] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md">
                <Plus size={16} /> Book Appointment
              </Link>
            </div>
          ) : (
            appointments.map(apt => {
              const refId = `SPL-APT-${String(apt.id).padStart(6, '0')}`;
              const statusConfig = {
                SCHEDULED: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: '⏳ Pending' },
                CONFIRMED: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: '✓ Confirmed' },
                COMPLETED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: '✓ Done' },
                CANCELLED: { color: 'bg-red-50 text-red-700 border-red-200', label: '✕ Cancelled' },
              }[apt.status] || { color: 'bg-slate-50 text-slate-700', label: apt.status };
              return (
                <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Calendar size={22} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{refId}</p>
                        <p className="text-xs text-slate-500 font-semibold">
                          {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          {apt.time && ` • ${apt.time}`}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {apt.type === 'HOME_COLLECTION' ? '🏠 Home Collection' : '🏥 Lab Visit'}
                          {apt.notes && ` • ${apt.notes}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ HEALTH TRENDS TAB ═══ */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {trends.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
              <TrendingUp size={48} className="mx-auto mb-4 text-slate-200" />
              <h3 className="text-xl font-black text-slate-700 mb-2">Not Enough Data Yet</h3>
              <p className="text-slate-400 text-sm mb-2">Health trends require at least 2 completed reports with the same parameter to plot a trend line.</p>
              <p className="text-xs text-slate-300">Get tested regularly to track your health over time!</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-lg text-[#1D9E75]"><TrendingUp size={18} /></div>
                    <div>
                      <h3 className="font-black text-slate-900">🧬 Health History Tracker</h3>
                      <p className="text-xs text-slate-400">Track how your parameters change over time</p>
                    </div>
                  </div>
                  <select
                    className="bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] cursor-pointer"
                    value={selectedTrend}
                    onChange={e => setSelectedTrend(e.target.value)}
                  >
                    {trends.map(t => (
                      <option key={t.parameterName} value={t.parameterName}>{t.parameterName}</option>
                    ))}
                  </select>
                </div>
                <div className="h-72">
                  {trendData && <Line data={trendData} options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: false, grid: { color: '#f1f5f9' }, title: { display: true, text: activeTrend?.unit || '' } },
                      x: { grid: { display: false } }
                    }
                  }} />}
                </div>
                {activeTrend && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-600 border border-slate-100">
                    <span>Reference Range:</span>
                    <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-100 font-mono">
                      {activeTrend.referenceRange} {activeTrend.unit}
                    </span>
                  </div>
                )}
              </div>
              {/* Parameters list */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Activity size={15} className="text-[#1D9E75]" /> Tracked Parameters ({trends.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {trends.map(t => {
                    const latest = t.history[t.history.length - 1];
                    const isAbn = latest?.flag === 'HIGH' || latest?.flag === 'LOW';
                    return (
                      <button
                        key={t.parameterName}
                        onClick={() => setSelectedTrend(t.parameterName)}
                        className={`p-3 rounded-xl text-left border transition-all text-sm ${
                          selectedTrend === t.parameterName
                            ? 'border-[#1D9E75] bg-emerald-50 shadow-sm'
                            : isAbn ? 'border-red-200 bg-red-50/50 hover:bg-red-50' : 'border-gray-100 hover:bg-slate-50'
                        }`}
                      >
                        <p className="font-black text-slate-800 text-xs truncate">{t.parameterName}</p>
                        <p className={`font-black text-base ${isAbn ? 'text-red-600' : 'text-[#0F6E56]'}`}>
                          {latest?.value} <span className="text-[10px] font-bold text-slate-400">{t.unit}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">{t.history.length} readings</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ FAMILY TAB ═══ */}
      {activeTab === 'family' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-[#1D9E75]" /> My Family Members
            </h3>
            <button
              onClick={() => setShowAddFamily(!showAddFamily)}
              className="flex items-center gap-1.5 bg-[#1D9E75] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:-translate-y-0.5 transition-all"
            >
              <Plus size={14} /> Add Member
            </button>
          </div>

          {showAddFamily && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input
                    value={familyForm.name}
                    onChange={e => setFamilyForm({...familyForm, name: e.target.value})}
                    placeholder="e.g. Aisha Khan"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Relation</label>
                  <select
                    value={familyForm.relation}
                    onChange={e => setFamilyForm({...familyForm, relation: e.target.value})}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 bg-gray-50/50"
                  >
                    <option value="">Select relation</option>
                    {['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandparent', 'Other'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Mobile Number</label>
                  <input
                    value={familyForm.mobile}
                    onChange={e => setFamilyForm({...familyForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    placeholder="10-digit mobile"
                    maxLength={10}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 bg-gray-50/50"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addFamilyMember}
                  disabled={!familyForm.name.trim()}
                  className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-md"
                >
                  Add Member
                </button>
                <button
                  onClick={() => { setShowAddFamily(false); setFamilyForm({ name: '', relation: '', mobile: '' }); }}
                  className="bg-gray-100 hover:bg-gray-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Primary patient card */}
          <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0F6E56] to-[#1D9E75] rounded-2xl flex items-center justify-center text-white text-2xl shadow-md">
                👤
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-black text-slate-900">{patientInfo?.fullName || 'Primary Patient'}</p>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">You</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold">
                  +91 {mobile}
                  {patientInfo?.age && ` • ${patientInfo.age} yrs`}
                  {patientInfo?.gender && ` • ${patientInfo.gender}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-[#0F6E56]">{reports.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Reports</p>
              </div>
            </div>
          </div>

          {/* Family member cards */}
          {familyMembers.length === 0 && !showAddFamily && (
            <div className="bg-slate-50 rounded-2xl border border-gray-100 p-8 text-center">
              <Users size={40} className="mx-auto mb-3 text-slate-200" />
              <p className="font-bold text-slate-500 mb-1">No family members added yet</p>
              <p className="text-xs text-slate-400">Add your family members to track their health reports together.</p>
            </div>
          )}

          {familyMembers.map(member => (
            <div key={member.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md">
                  {member.relation === 'Son' || member.relation === 'Father' || member.relation === 'Brother' || member.relation === 'Grandparent' ? '👨' : '👩'}
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500 font-semibold">
                    {member.relation && <span className="text-indigo-600">{member.relation} • </span>}
                    {member.mobile ? `+91 ${member.mobile}` : 'No mobile added'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {member.mobile && (
                    <a
                      href={`https://wa.me/91${member.mobile}?text=Hi%2C%20check%20your%20Sana%20Pathology%20reports%20at%20sanapathology.com`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[#25D366] hover:bg-green-50 p-2 rounded-lg transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => removeFamilyMember(member.id)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Family Health Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
            <Sparkles size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 font-semibold leading-relaxed">
              <strong>Tip:</strong> Family members registered with their own mobile numbers at Sana Pathology can access their individual reports using the same My Health Account feature. Share this link with them!
            </p>
          </div>
        </div>
      )}

      {/* Quick Help */}
      <div className="mt-10 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-black text-slate-800">Need Help?</h4>
          <p className="text-sm text-slate-500">Our support team is available 24×7.</p>
        </div>
        <div className="flex gap-3">
          <a href="tel:+916396786939" className="flex items-center gap-2 bg-[#1D9E75] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all">
            <Phone size={14} /> Call Us
          </a>
          <a href="https://wa.me/916396786939" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN PAGE COMPONENT ─── */
const PatientDashboard = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [mobile, setMobile] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    // Restore session from sessionStorage
    const savedToken = sessionStorage.getItem('pd_token');
    const savedMobile = sessionStorage.getItem('pd_mobile');
    if (savedToken && savedMobile) {
      setToken(savedToken);
      setMobile(savedMobile);
      setIsVerified(true);
    }
  }, []);

  const handleVerified = (mob, tok) => {
    setMobile(mob);
    setToken(tok);
    setIsVerified(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pd_token');
    sessionStorage.removeItem('pd_mobile');
    setIsVerified(false);
    setMobile('');
    setToken('');
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F6] via-emerald-50/20 to-amber-50/10">
        {isVerified ? (
          <DashboardView mobile={mobile} token={token} onLogout={handleLogout} />
        ) : (
          <OTPLogin onVerified={handleVerified} />
        )}
      </div>
    </PublicLayout>
  );
};

export default PatientDashboard;
