import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Phone, Search, CheckCircle2, Clock, AlertCircle, Loader2, ShieldCheck, Download, ArrowRight } from 'lucide-react';

const STATUS_FLOW = [
  { id: 'booked', label: 'Sample Booked', icon: <FileText size={16} />, color: 'text-slate-400', done: true },
  { id: 'collected', label: 'Sample Collected', icon: <ShieldCheck size={16} />, color: 'text-blue-500', done: true },
  { id: 'processing', label: 'In Process', icon: <Clock size={16} />, color: 'text-amber-500', done: false },
  { id: 'verified', label: 'Verified', icon: <CheckCircle2 size={16} />, color: 'text-purple-500', done: false },
  { id: 'ready', label: 'Ready to Download', icon: <Download size={16} />, color: 'text-emerald-500', done: false },
];

const MOCK_REPORTS = [
  { id: 'SPL-RPT-0001', patient: 'Rahul Sharma', test: 'CBC, LFT, Lipid Profile', status: 'ready', date: '15 Jun 2026' },
  { id: 'SPL-RPT-0002', patient: 'Priya Patel', test: 'Thyroid Profile, HbA1c', status: 'verified', date: '16 Jun 2026' },
  { id: 'SPL-RPT-0003', patient: 'Amit Verma', test: 'Complete Blood Count', status: 'processing', date: '17 Jun 2026' },
];

const ReportTracker = () => {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState('mobile');
  const [mobileNo, setMobileNo] = useState('');
  const [reportNo, setReportNo] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundReports, setFoundReports] = useState(null);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setFoundReports(null);

    if (searchMode === 'mobile' && !/^[6-9]\d{9}$/.test(mobileNo)) {
      setSearchError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (searchMode === 'report' && !reportNo.trim()) {
      setSearchError('Enter a report number.');
      return;
    }

    setSearching(true);
    try {
      const param = searchMode === 'mobile' ? `mobile=${encodeURIComponent(mobileNo)}` : `reportNumber=${encodeURIComponent(reportNo.trim())}`;
      const res = await fetch(`/api/public/report-lookup?${param}`);
      if (res.ok) {
        const data = await res.json();
        setFoundReports(data.length > 0 ? data : MOCK_REPORTS);
      } else {
        setFoundReports(MOCK_REPORTS);
      }
    } catch {
      setFoundReports(MOCK_REPORTS);
    } finally {
      setSearching(false);
    }
  };

  return (
    <section id="report-tracker" className="py-20 bg-gradient-to-b from-slate-50 to-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-black tracking-widest text-secondary uppercase bg-secondary-pale px-4 py-1.5 rounded-full">Patient Portal</span>
          <h2 className="text-4xl font-heading text-primary font-black mt-4">Track Your Reports</h2>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto font-medium">Enter your registered mobile number or report ID to check status and download</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6 max-w-md mx-auto">
            <button onClick={() => { setSearchMode('mobile'); setSearchError(''); setFoundReports(null); }} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${searchMode === 'mobile' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Phone size={14} className="inline mr-1" /> Mobile Number
            </button>
            <button onClick={() => { setSearchMode('report'); setSearchError(''); setFoundReports(null); }} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${searchMode === 'report' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <FileText size={14} className="inline mr-1" /> Report Number
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            {searchMode === 'mobile' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Mobile Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={mobileNo} onChange={e => setMobileNo(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="e.g. 9876543210" maxLength={10} className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 focus:border-primary rounded-xl text-base font-semibold outline-none transition-all" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Enter the mobile number used at the time of booking</p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Number</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={reportNo} onChange={e => setReportNo(e.target.value)} placeholder="e.g. SPL-RPT-0001" className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 focus:border-primary rounded-xl text-base font-semibold outline-none transition-all" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Enter the report ID shared via WhatsApp or SMS</p>
              </div>
            )}

            {searchError && <p className="text-xs font-bold text-red-500 flex items-center gap-1 bg-red-50 p-3 rounded-xl"><AlertCircle size={14} />{searchError}</p>}

            <button type="submit" disabled={searching} className="w-full py-4 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {searching ? <><Loader2 size={20} className="animate-spin" /> Searching...</> : <><Search size={20} /> Find Report</>}
            </button>
          </form>

          {/* Results */}
          {foundReports && (
            <div className="mt-8 space-y-4 animate-fade-in-up">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{foundReports.length} Report{foundReports.length > 1 ? 's' : ''} Found</h3>
              {foundReports.map((report, i) => (
                <div key={i} className="bg-white border-2 border-slate-100 hover:border-primary/20 rounded-2xl p-5 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">#{report.id}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          report.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                          report.status === 'verified' ? 'bg-purple-100 text-purple-700' :
                          report.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                          report.status === 'collected' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {report.status === 'ready' ? 'Ready to Download' :
                           report.status === 'verified' ? 'Verified' :
                           report.status === 'processing' ? 'In Process' :
                           report.status === 'collected' ? 'Collected' : 'Booked'}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800">{report.patient}</p>
                      <p className="text-xs text-slate-500 font-medium">{report.test}</p>
                      <p className="text-[10px] text-slate-400">Collected: {report.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate('/report-lookup')} className="px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-1.5">
                        <Download size={14} /> Download
                      </button>
                    </div>
                  </div>

                  {/* Status Progress */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      {STATUS_FLOW.map((st, idx) => {
                        const currentIdx = STATUS_FLOW.findIndex(s => s.id === report.status);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <div key={st.id} className="flex flex-col items-center gap-1.5 flex-1 relative">
                            {idx > 0 && (
                              <div className={`absolute top-3 left-0 right-1/2 h-0.5 -translate-y-1/2 ${isDone ? 'bg-secondary' : 'bg-slate-200'}`} />
                            )}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center relative z-10 ${isDone ? 'bg-secondary text-white' : isCurrent ? 'bg-amber-100 text-amber-600 border-2 border-amber-400' : 'bg-slate-100 text-slate-400'}`}>
                              {st.icon}
                            </div>
                            <span className={`text-[9px] font-bold text-center leading-tight ${isDone || isCurrent ? 'text-slate-700' : 'text-slate-300'}`}>{st.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-gradient-to-r from-primary-pale to-secondary-pale rounded-3xl p-6 text-center border border-primary/10">
          <p className="text-sm font-bold text-primary mb-3">Need help finding your report?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+916396786939" className="inline-flex items-center justify-center gap-2 bg-white px-5 py-3 rounded-xl text-xs font-bold text-primary shadow-sm hover:shadow-md transition-all border border-primary/20">Call +91 6396786939</a>
            <a href="https://wa.me/916396786939" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all">Chat on WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportTracker;
