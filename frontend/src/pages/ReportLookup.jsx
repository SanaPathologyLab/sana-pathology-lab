import React, { useState, useEffect } from 'react';
import { Search, FileText, User, Calendar, Phone, Stethoscope, ChevronDown, ChevronUp, CheckCircle, AlertCircle, ArrowLeft, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const API = '/api';

const FLAG_STYLES = {
  HIGH:   { label: 'H', cls: 'bg-red-100 text-red-700 font-bold' },
  LOW:    { label: 'L', cls: 'bg-blue-100 text-blue-700 font-bold' },
  NORMAL: { label: '✓', cls: 'bg-green-100 text-green-700' },
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
    const params = new URLSearchParams(window.location.search);
    const reportParam = params.get('reportNumber');
    const mobileParam = params.get('mobile');
    
    if (reportParam) {
      setSearchType('report');
      setQuery(reportParam);
      // We can't pass 'e' here, so we call a helper
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
        setError(data.message || 'Not found.');
      } else {
        setReports(data);
        if (data.length === 1) setExpandedId(data[0].id);
      }
    } catch {
      setError('Could not connect to server. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-sans">
      {/* Header */}
      <header className="bg-[#00488d] text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">SANA PATHOLOGY LAB</h1>
              <p className="text-blue-200 text-xs">Patient Report Portal</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Staff Login
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
              <Search className="w-8 h-8 text-[#00488d]" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Check Your Report</h2>
            <p className="text-gray-500 mt-2 text-sm">Enter your mobile number or report number to view your test results</p>
          </div>

          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6 max-w-sm mx-auto">
            <button
              onClick={() => { setSearchType('mobile'); setQuery(''); setReports([]); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                searchType === 'mobile' ? 'bg-white text-[#00488d] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📱 Mobile Number
            </button>
            <button
              onClick={() => { setSearchType('report'); setQuery(''); setReports([]); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                searchType === 'report' ? 'bg-white text-[#00488d] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔢 Report Number
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <input
                type={searchType === 'mobile' ? 'tel' : 'text'}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={searchType === 'mobile' ? 'Enter your mobile number...' : 'e.g. RPT-000001'}
                className="w-full pl-4 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#00488d] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#00488d] hover:bg-blue-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center gap-2 whitespace-nowrap shadow-md shadow-blue-200"
            >
              {loading ? (
                <Loader type="button" className="text-white" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchType === 'report' && (
            <p className="text-xs text-center mt-4 text-gray-500 font-medium">
              Forgot your report number? Simply switch to <span className="font-bold text-[#00488d] cursor-pointer" onClick={() => setSearchType('mobile')}>Mobile Number</span> search!
            </p>
          )}

          {error && (
            <div className="mt-5 flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 max-w-xl mx-auto">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {reports.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              {reports.length} Report{reports.length > 1 ? 's' : ''} Found
            </h3>

            {reports.map(report => {
              const isExpanded = expandedId === report.id;
              const groups = groupByCategory(report.results || []);

              return (
                <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Report Header */}
                  <button
                    className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="bg-[#00488d]/10 p-3 rounded-xl">
                        <FileText className="w-5 h-5 text-[#00488d]" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">{report.reportNumber}</p>
                        <div className="flex flex-wrap gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="w-3.5 h-3.5" /> {report.patient?.fullName}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" /> {new Date(report.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {report.doctor && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Stethoscope className="w-3.5 h-3.5" /> Dr. {report.doctor.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                        report.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.status === 'COMPLETED' ? '✓ Ready' : '⏳ Pending'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded Results */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {report.status !== 'COMPLETED' ? (
                        <div className="px-6 py-8 text-center">
                          <div className="inline-flex flex-col items-center gap-2 text-yellow-600">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-2xl">⏳</div>
                            <p className="font-bold text-base">Report is being processed</p>
                            <p className="text-sm text-gray-500">Your results will be available once the lab completes the testing. Please check again later.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Patient Info Bar */}
                          <div className="bg-blue-50 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Patient Name</p>
                              <p className="font-bold text-gray-800">{report.patient?.fullName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Age / Gender</p>
                              <p className="font-bold text-gray-800">{report.patient?.age}Y / {report.patient?.gender}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Report Date</p>
                              <p className="font-bold text-gray-800">{new Date(report.reportDate).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Referred By</p>
                              <p className="font-bold text-gray-800">{report.doctor ? `Dr. ${report.doctor.name}` : 'Self'}</p>
                            </div>
                          </div>

                          {/* Test Results by Category */}
                          <div className="px-6 py-5 space-y-6">
                            {Object.entries(groups).map(([cat, results]) => (
                              <div key={cat}>
                                <h4 className="text-sm font-extrabold text-[#00488d] uppercase tracking-wider mb-3 pb-2 border-b border-blue-100">
                                  {cat}
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-xs text-gray-400 font-bold uppercase">
                                        <th className="text-left py-1.5 pr-4">Test / Parameter</th>
                                        <th className="text-right py-1.5 pr-4">Result</th>
                                        <th className="text-center py-1.5 pr-4">Flag</th>
                                        <th className="text-left py-1.5 pr-4">Unit</th>
                                        <th className="text-left py-1.5">Reference Range</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {results.map(r => {
                                        const f = FLAG_STYLES[r.flag] || { label: '-', cls: 'text-gray-400' };
                                        return (
                                          <tr key={r.id} className={`${r.flag === 'HIGH' || r.flag === 'LOW' ? 'bg-red-50/40' : ''}`}>
                                            <td className="py-2.5 pr-4 font-medium text-gray-800">{r.parameterName}</td>
                                            <td className={`py-2.5 pr-4 text-right font-bold text-base ${r.flag === 'HIGH' ? 'text-red-600' : r.flag === 'LOW' ? 'text-blue-600' : 'text-gray-900'}`}>
                                              {r.resultValue}
                                            </td>
                                            <td className="py-2.5 pr-4 text-center">
                                              <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${f.cls}`}>{f.label}</span>
                                            </td>
                                            <td className="py-2.5 pr-4 text-gray-500 text-xs">{r.unit || '-'}</td>
                                            <td className="py-2.5 text-gray-500 text-xs">{r.referenceRange || '-'}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="px-6 pb-5 flex justify-between items-center border-t border-gray-100 pt-4">
                            <p className="text-xs text-gray-400 italic">This report is not valid for medico-legal purposes.</p>
                            <button
                              onClick={() => window.open(`${window.location.origin}/public-print/${report.reportNumber}`, '_blank')}
                              className="flex items-center gap-2 bg-[#00488d] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" /> Print Report
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
        <p className="text-center text-xs text-gray-400 mt-10">
          Sana Pathology Lab • Datawali Road, Near Aara Machine, Hayat Nagar • 6396786939
        </p>
      </div>
    </div>
  );
};

export default ReportLookup;
