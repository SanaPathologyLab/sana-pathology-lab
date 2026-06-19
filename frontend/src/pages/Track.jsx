import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, FileText, Calendar, Phone, MapPin, User, Clock,
  ArrowRight, ChevronRight, ExternalLink, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const API = '/api';

const STATUS_BADGES = {
  COMPLETED: { label: 'Ready', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  PROCESSING: { label: 'Processing', class: 'bg-amber-100 text-amber-700 border-amber-200' },
  PENDING: { label: 'Pending', class: 'bg-slate-100 text-slate-600 border-slate-200' },
  CONFIRMED: { label: 'Confirmed', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  CANCELLED: { label: 'Cancelled', class: 'bg-red-100 text-red-600 border-red-200' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_BADGES[status] || { label: status || 'Unknown', class: 'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border whitespace-nowrap ${s.class}`}>
      {s.label}
    </span>
  );
};

const initialState = {
  query: '',
  results: null,
  error: '',
  loading: false,
};

const Track = () => {
  const [activeTab, setActiveTab] = useState('report');
  const [searchMethod, setSearchMethod] = useState('mobile');

  const [report, setReport] = useState({ ...initialState });
  const [booking, setBooking] = useState({ ...initialState });

  const trackGA4 = (action, label) => {
    if (window.gtag) {
      window.gtag('event', action, { event_label: label });
    }
  };

  const handleReportSearch = async (e) => {
    e.preventDefault();
    if (!report.query.trim()) return;

    setReport(prev => ({ ...prev, loading: true, error: '', results: null }));
    trackGA4('search', `report_${searchMethod}`);

    try {
      const param = searchMethod === 'mobile' ? 'mobile' : 'reportNumber';
      const res = await fetch(`${API}/public/report-lookup?${param}=${encodeURIComponent(report.query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setReport(prev => ({ ...prev, error: data.message || 'No reports found.', loading: false }));
      } else {
        setReport(prev => ({ ...prev, results: Array.isArray(data) ? data : [data], loading: false }));
      }
    } catch {
      setReport(prev => ({ ...prev, error: 'Failed to connect. Please try again.', loading: false }));
    }
  };

  const handleBookingSearch = async (e) => {
    e.preventDefault();
    if (!booking.query.trim()) return;

    setBooking(prev => ({ ...prev, loading: true, error: '', results: null }));
    trackGA4('search', 'booking_mobile');

    try {
      const res = await fetch(`${API}/public/appointment-lookup?mobile=${encodeURIComponent(booking.query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setBooking(prev => ({ ...prev, error: data.message || 'No bookings found.', loading: false }));
      } else {
        setBooking(prev => ({ ...prev, results: Array.isArray(data) ? data : [data], loading: false }));
      }
    } catch {
      setBooking(prev => ({ ...prev, error: 'Failed to connect. Please try again.', loading: false }));
    }
  };

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#085041] to-[#0F6E56] text-white py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4 leading-tight">
            Track Your Report or Booking
          </h1>
          <p className="text-sm md:text-base text-[#A7D8CB] max-w-xl mx-auto mb-6 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0" />
            Apna report yahan check karein. Ya apni booking ka status dekhein.
          </p>
          <span className="inline-block bg-white/10 text-[#A7D8CB] text-xs font-bold px-4 py-2 rounded-full border border-white/20">
            Fast &bull; Secure &bull; 24/7 Access
          </span>
        </div>
      </section>

      {/* Card with Tabs */}
      <section className="max-w-4xl mx-auto px-4 -mt-8 pb-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => { setActiveTab('report'); setReport({ ...initialState }); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
                activeTab === 'report'
                  ? 'text-[#1D9E75] border-b-2 border-[#1D9E75] bg-[#E1F5EE]/30'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              &#x1F52C; Track Report
            </button>
            <button
              onClick={() => { setActiveTab('booking'); setBooking({ ...initialState }); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
                activeTab === 'booking'
                  ? 'text-[#1D9E75] border-b-2 border-[#1D9E75] bg-[#E1F5EE]/30'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              &#x1F4CB; Track Booking
            </button>
          </div>

          <div className="p-5 md:p-8">

            {/* ─── TAB 1: TRACK REPORT ─── */}
            {activeTab === 'report' && (
              <div>
                {/* Radio Options */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {['mobile', 'reportNumber'].map((m) => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="searchMethod"
                        checked={searchMethod === m}
                        onChange={() => { setSearchMethod(m); setReport({ ...initialState }); }}
                        className="w-4 h-4 text-[#1D9E75] focus:ring-[#1D9E75]"
                      />
                      <span className="text-sm font-semibold text-slate-700">
                        By {m === 'mobile' ? 'Mobile Number' : 'Report Number'}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Search Form */}
                <form onSubmit={handleReportSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="flex-1 relative">
                    {searchMethod === 'mobile' ? (
                      <input
                        type="tel"
                        value={report.query}
                        onChange={e => setReport(prev => ({ ...prev, query: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10 transition-all"
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        inputMode="numeric"
                      />
                    ) : (
                      <input
                        type="text"
                        value={report.query}
                        onChange={e => setReport(prev => ({ ...prev, query: e.target.value }))}
                        placeholder="Enter report number (e.g. SPL-001)"
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10 transition-all"
                        required
                      />
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={report.loading}
                    className="bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#1D9E75]/20"
                  >
                    {report.loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    {report.loading ? 'Searching...' : 'Search'}
                  </button>
                </form>

                {/* Error State */}
                {report.error && (
                  <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl px-5 py-4 mb-6 animate-fade-in-up">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-semibold">{report.error}</p>
                  </div>
                )}

                {/* Results */}
                {report.results && report.results.length > 0 && (
                  <div className="space-y-3 animate-fade-in-up">
                    <p className="text-sm font-bold text-slate-500 mb-3">
                      {report.results.length} report{report.results.length > 1 ? 's' : ''} found
                    </p>
                    {report.results.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
                        style={{ animationDelay: `${idx * 0.08}s` }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-800 text-sm mb-1">
                              {item.testName || item.patient?.fullName || 'Lab Report'}
                            </h4>
                            {item.reportDate && (
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(item.reportDate).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                          <StatusBadge status={item.status} />
                        </div>
                        {item.status === 'COMPLETED' && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <Link
                              to={`/report-lookup#?reportNumber=${encodeURIComponent(item.reportNumber || '')}&patientName=${encodeURIComponent(item.patient?.fullName || '')}`}
                              className="inline-flex items-center gap-1.5 text-[#1D9E75] text-xs font-bold hover:underline group"
                            >
                              View Report
                              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty Results */}
                {report.results && report.results.length === 0 && !report.error && (
                  <div className="text-center py-12 animate-fade-in-up">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold">No reports found</p>
                    <p className="text-xs text-slate-400 mt-1">Try a different search method or check your details.</p>
                  </div>
                )}

                {/* Initial Prompt */}
                {!report.results && !report.error && !report.loading && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Enter your mobile number or report number to search</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: TRACK BOOKING ─── */}
            {activeTab === 'booking' && (
              <div>
                <form onSubmit={handleBookingSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={booking.query}
                      onChange={e => setBooking(prev => ({ ...prev, query: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="Enter registered mobile number"
                      className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10 transition-all"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      inputMode="numeric"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={booking.loading}
                    className="bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#1D9E75]/20"
                  >
                    {booking.loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    {booking.loading ? 'Searching...' : 'Search'}
                  </button>
                </form>

                {/* Error */}
                {booking.error && (
                  <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl px-5 py-4 mb-6 animate-fade-in-up">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-semibold">{booking.error}</p>
                  </div>
                )}

                {/* Booking Results */}
                {booking.results && booking.results.length > 0 && (
                  <div className="space-y-4 animate-fade-in-up">
                    <p className="text-sm font-bold text-slate-500 mb-3">
                      {booking.results.length} booking{booking.results.length > 1 ? 's' : ''} found
                    </p>
                    {booking.results.map((b, idx) => (
                      <div
                        key={b.id || idx}
                        className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
                        style={{ animationDelay: `${idx * 0.08}s` }}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
                              <User className="w-4 h-4 text-[#1D9E75] shrink-0" />
                              {b.patientName || b.name || 'Patient'}
                            </h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                              {b.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {new Date(b.date).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                  })}
                                </span>
                              )}
                              {b.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {b.time}
                                </span>
                              )}
                            </div>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>

                        {b.address && (
                          <p className="flex items-start gap-1.5 text-xs text-slate-500 mb-3">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            {b.address}
                          </p>
                        )}

                        {b.tests && b.tests.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-bold text-slate-600 mb-1.5">Tests:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {b.tests.map((test, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium"
                                >
                                  {test.name || test}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-3 border-t border-slate-100">
                          <Link
                            to={`/track/${b.id}`}
                            className="inline-flex items-center gap-1 text-[#1D9E75] text-xs font-bold hover:underline group"
                          >
                            Track Phlebotomist
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty */}
                {booking.results && booking.results.length === 0 && !booking.error && (
                  <div className="text-center py-12 animate-fade-in-up">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold">No bookings found</p>
                    <p className="text-xs text-slate-400 mt-1">Enter the mobile number used at the time of booking.</p>
                  </div>
                )}

                {/* Initial */}
                {!booking.results && !booking.error && !booking.loading && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Enter your mobile number to check booking status</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Need Help */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-5">Need Help?</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <a
              href="https://wa.me/916396786939?text=Hi%2C%20I%20need%20help%20tracking%20my%20report"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-200 w-full sm:w-auto"
            >
              <Phone className="w-4 h-4" />
              Contact via WhatsApp
            </a>
            <a
              href="tel:+916396786939"
              className="flex items-center justify-center gap-2 bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#1D9E75]/20 w-full sm:w-auto"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </a>
          </div>
          <p className="text-xs text-slate-400">
            Lab Hours: Mon-Sat 7AM-8PM, Sun 8AM-1PM
          </p>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Track;
