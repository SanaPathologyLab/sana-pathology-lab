import React, { useState, useEffect } from 'react';
import { 
  Search, FileText, User, Calendar, Phone, Stethoscope, 
  ChevronDown, ChevronUp, CheckCircle, AlertCircle, ArrowLeft, 
  Printer, Award, Heart, ShieldCheck, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const API = '/api';

const FLAG_STYLES = {
  HIGH:   { label: 'HIGH', cls: 'bg-red-100 text-red-700 font-extrabold border-red-200' },
  LOW:    { label: 'LOW', cls: 'bg-blue-100 text-blue-700 font-extrabold border-blue-200' },
  NORMAL: { label: '✓ NORMAL', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const ReportLookup = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('mobile'); // 'mobile' | 'report'
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    // Under HashRouter, URL parameters are inside the hash (e.g. #/report-lookup?mobile=9045786939)
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

  // Group results by test category
  const groupByCategory = (results) => {
    const groups = {};
    results.forEach(r => {
      const cat = r.test?.category?.name || r.test?.testName || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(r);
    });
    return groups;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E1F5EE]/30 via-[#F5F7F6] to-[#FAEEDA]/30 font-sans relative overflow-hidden pb-16">
      
      {/* 3D Floating Blur Blobs */}
      <div className="absolute top-12 right-12 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-24 left-12 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-[#1D9E75]/5 blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="bg-primary/95 backdrop-blur-md text-white shadow-lg sticky top-0 z-30 border-b border-primary-light/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20 shadow-inner">
              <FileText className="w-6 h-6 text-[#F1C40F]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight font-heading">SANA PATHOLOGY</h1>
              <p className="text-primary-pale text-xs font-bold uppercase tracking-wider">Patient Report Portal</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-black text-primary-pale hover:text-white bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 relative z-10">
        
        {/* Search Card with 3D shadow lift */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 mb-8 border border-white shadow-[0_20px_50px_rgba(15,110,86,0.1)] transition-all duration-300 hover:shadow-[0_30px_60px_rgba(15,110,86,0.15)] hover:-translate-y-1">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-pale rounded-2xl mb-4 border border-[#0F6E56]/10 shadow-sm animate-pulse">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Check Your Test Report</h2>
            <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">Enter your mobile number or report number to fetch NABL verified laboratory reports.</p>
          </div>

          {/* Toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-6 max-w-sm mx-auto border border-slate-200">
            <button
              onClick={() => { setSearchType('mobile'); setQuery(''); setReports([]); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                searchType === 'mobile' 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>📱 Mobile Number</span>
            </button>
            <button
              onClick={() => { setSearchType('report'); setQuery(''); setReports([]); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                searchType === 'report' 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>🔢 Report Number</span>
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <input
                type={searchType === 'mobile' ? 'tel' : 'text'}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={searchType === 'mobile' ? 'Enter registered mobile number...' : 'e.g. RPT-000001'}
                className="w-full pl-5 pr-5 py-4 border-2 border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary focus:ring-0 transition-colors shadow-inner"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-primary/20"
            >
              {loading ? (
                <Loader type="button" className="text-white animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? 'Searching Record...' : 'Search Report'}
            </button>
          </form>

          {searchType === 'report' && (
            <p className="text-xs text-center mt-4 text-slate-400 font-semibold">
              Forgot report number? Simply switch to <span className="text-primary hover:underline cursor-pointer" onClick={() => setSearchType('mobile')}>Mobile Number</span> tracking!
            </p>
          )}

          {error && (
            <div className="mt-6 flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl px-5 py-4 max-w-xl mx-auto animate-fade-in-up">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 animate-bounce" />
              <p className="text-xs sm:text-sm font-semibold">{error}</p>
            </div>
          )}
        </div>

        {/* Results list */}
        {reports.length > 0 && (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              {reports.length} Verified Lab Report{reports.length > 1 ? 's' : ''} Found
            </h3>

            {reports.map(report => {
              const isExpanded = expandedId === report.id;
              const groups = groupByCategory(report.results || []);

              return (
                <div 
                  key={report.id} 
                  className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_10px_35px_rgba(15,110,86,0.03)] transition-all duration-300 hover:shadow-[0_20px_45px_rgba(15,110,86,0.08)] hover:-translate-y-0.5"
                >
                  {/* Report Folder Header */}
                  <button
                    className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50/50 transition-colors border-l-4 border-primary"
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  >
                    <div className="flex items-center gap-4 text-left min-w-0 flex-1">
                      <div className="bg-primary-pale p-3 rounded-2xl text-primary border border-[#0F6E56]/10 shadow-inner shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight">{report.reportNumber}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-400 font-semibold">
                          <span className="flex items-center gap-1 text-slate-500">
                            <User className="w-3.5 h-3.5 text-primary-light" /> {report.patient?.fullName}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary-light" /> {new Date(report.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {report.doctor && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="flex items-center gap-1">
                                <Stethoscope className="w-3.5 h-3.5 text-primary-light" /> Dr. {report.doctor.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-2 shrink-0">
                      <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 border ${
                        report.status === 'COMPLETED' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${report.status === 'COMPLETED' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
                        <span>{report.status === 'COMPLETED' ? 'Ready' : 'Processing'}</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </button>

                  {/* Expanded Medical sheet */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 animate-fade-in-up">
                      {report.status !== 'COMPLETED' ? (
                        <div className="px-6 py-10 text-center">
                          <div className="inline-flex flex-col items-center gap-3 text-amber-600 max-w-sm mx-auto">
                            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-3xl animate-bounce">⏳</div>
                            <h4 className="font-extrabold text-slate-800 text-lg">Sample Under Analysis</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Your collection request has been processed. The medical laboratory is running validation assays. Results will appear instantly once finalized.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Patient Folder details card */}
                          <div className="bg-[#E1F5EE]/30 px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm border-b border-slate-100 border-dashed">
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Patient Name</p>
                              <p className="font-bold text-slate-700">{report.patient?.fullName}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Age / Gender</p>
                              <p className="font-bold text-slate-700">{report.patient?.age} {report.patient?.ageType || 'Years'} / {report.patient?.gender}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Report Date</p>
                              <p className="font-bold text-slate-700">{new Date(report.reportDate).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Referred By</p>
                              <p className="font-bold text-slate-700">{report.doctor ? `Dr. ${report.doctor.name}` : 'Self Referral'}</p>
                            </div>
                          </div>

                          {/* Test parameters list */}
                          <div className="px-6 py-6 space-y-6">
                            {Object.entries(groups).map(([cat, results]) => (
                              <div key={cat} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 shadow-inner">
                                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4 pb-2 border-b border-primary-light/10 flex items-center gap-1.5">
                                  <Heart size={14} className="text-[#BA7517] fill-[#BA7517]" />
                                  <span>{cat}</span>
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
                                    <tbody className="divide-y divide-slate-100">
                                      {results.map(r => {
                                        const isAbnormal = r.flag === 'HIGH' || r.flag === 'LOW';
                                        const f = FLAG_STYLES[r.flag] || { label: 'NORMAL', cls: 'text-slate-400' };
                                        
                                        return (
                                          <tr key={r.id} className={`transition-colors hover:bg-white/50 ${isAbnormal ? 'bg-red-50/20' : ''}`}>
                                            <td className="py-3 pr-4 font-bold text-slate-800">{r.parameterName}</td>
                                            
                                            <td className={`py-3 pr-6 text-right font-black text-base ${
                                              r.flag === 'HIGH' 
                                                ? 'text-red-600' 
                                                : r.flag === 'LOW' 
                                                  ? 'text-blue-600' 
                                                  : 'text-slate-700'
                                            }`}>
                                              {r.resultValue}
                                            </td>
                                            
                                            <td className="py-3 pr-4 text-center">
                                              <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded border tracking-wider ${
                                                r.flag === 'HIGH' 
                                                  ? 'bg-red-50 text-red-600 border-red-200' 
                                                  : r.flag === 'LOW' 
                                                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                              }`}>
                                                {f.label}
                                              </span>
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

                          {/* Stamp and Print panel */}
                          <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-primary shrink-0">
                                <Award className="w-5 h-5 text-primary-light animate-pulse" />
                              </div>
                              <div className="text-left">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Verified Result</p>
                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Signed & approved by registered Pathologist under NABL guidelines.</p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => window.open(`${window.location.origin}/public-print/${report.reportNumber}`, '_blank')}
                              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-primary/20 active:scale-[0.98] w-full sm:w-auto hover:-translate-y-0.5"
                            >
                              <Printer className="w-4 h-4" /> Print Verified Report
                            </button>
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

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-12 font-semibold flex items-center justify-center gap-1">
          <ShieldCheck size={14} className="text-primary-light" />
          <span>Sana Pathology Lab • Hayat Nagar, Sambhal • support@sanapathology.com</span>
        </p>
      </div>
    </div>
  );
};

export default ReportLookup;
