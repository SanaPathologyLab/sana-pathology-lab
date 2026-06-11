import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, FileText, Printer, Trash2, CheckCircle, Clock, X, Pencil, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

const API = '/api';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const headers = { 'Authorization': `Bearer ${user?.accessToken}`, 'Content-Type': 'application/json' };

  const [reports, setReports] = useState([]);
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [editReport, setEditReport] = useState(null); // report being edited
  const [showEditModal, setShowEditModal] = useState(false);
  const [editResults, setEditResults] = useState([]);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchTests();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API}/reports`, { headers });
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch (err) { console.error(err); }
  };

  const fetchTests = async () => {
    try {
      const res = await fetch(`${API}/tests`, { headers });
      const data = await res.json();
      if (Array.isArray(data)) setTests(data);
    } catch (err) { console.error(err); }
  };

  const openEdit = async (r) => {
    // Fetch full report with results
    const res = await fetch(`${API}/reports/${r.id}`, { headers });
    const full = await res.json();
    setEditReport(full);

    // Enrich results with parameter metadata for rendering (e.g. Widal titerValues)
    const enrichedResults = (full.results || []).map(r => {
      // Find the test definition from our already-fetched `tests` state
      const testDef = tests.find(t => t.id === r.testId);
      const paramDef = testDef?.parameters?.find(p => p.parameterName === r.parameterName);
      return {
        ...r,
        parentTestName: testDef?.testName || 'Test Results',
        isQualitative: paramDef?.isQualitative || false,
        titerValues: paramDef?.titerValues || '',
      };
    });

    // Inject missing overall results for Titer Matrix tests
    const finalResults = [...enrichedResults];
    const testsInReport = [...new Set(finalResults.map(r => r.testId))];
    testsInReport.forEach(tid => {
      const testResults = finalResults.filter(r => r.testId === tid);
      const hasTiter = testResults.some(r => r.titerValues);
      const hasOverall = testResults.some(r => r.groupName?.startsWith('__OVERALL__'));

      if (hasTiter && !hasOverall) {
        const testDef = tests.find(t => t.id === tid);
        if (testDef) {
          finalResults.push({
            testId: tid,
            parameterName: '',
            resultValue: 'NEGATIVE', // default
            flag: '',
            referenceRange: '',
            unit: '',
            groupName: `__OVERALL__${testDef.testName}`,
            parentTestName: testDef.testName,
            isQualitative: false,
            titerValues: ''
          });
        }
      }
    });

    setEditResults(finalResults);
    setEditStatus(full.status);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    await fetch(`${API}/reports/${editReport.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: editStatus, results: editResults }),
    });
    setSaving(false);
    setShowEditModal(false);
    fetchReports();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this report permanently? This cannot be undone.')) return;
    await fetch(`${API}/reports/${id}`, { method: 'DELETE', headers });
    fetchReports();
  };

  const handleMarkComplete = async (r) => {
    await fetch(`${API}/reports/${r.id}`, {
      method: 'PUT', headers,
      body: JSON.stringify({ status: r.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }),
    });
    fetchReports();
  };

  const autoCalculateFlag = (valueStr, rangeStr) => {
    if (!valueStr || !rangeStr) return '';
    const val = parseFloat(valueStr.toString().replace(/,/g, ''));
    if (isNaN(val)) return '';

    const range = rangeStr.toString().trim().replace(/,/g, '');
    const rangePattern = /(?:^|[^\d\.])([\d\.]+)\s*-\s*([\d\.]+)(?:[^\d\.]|$)/g;
    const matches = [...range.matchAll(rangePattern)];
    if (matches.length === 1) {
      const min = parseFloat(matches[0][1]);
      const max = parseFloat(matches[0][2]);
      if (val < min) return 'LOW';
      if (val > max) return 'HIGH';
      return '';
    }

    const lessMatch = range.match(/<\s*([\d\.]+)/);
    if (lessMatch && val > parseFloat(lessMatch[1])) return 'HIGH';

    const greaterMatch = range.match(/>\s*([\d\.]+)/);
    if (greaterMatch && val < parseFloat(greaterMatch[1])) return 'LOW';

    return '';
  };

  const updateResult = (idx, field, value) => {
    setEditResults(prev => prev.map((r, i) => {
      if (i === idx) {
        const updated = { ...r, [field]: value };
        if (field === 'resultValue') {
          const autoFlag = autoCalculateFlag(value, r.referenceRange);
          if (autoFlag || value === '') updated.flag = autoFlag;
        }
        return updated;
      }
      return r;
    }));
  };

  const handleRemoveResult = (idx) => {
    if (!confirm('Remove this parameter from the report?')) return;
    setEditResults(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddTest = (selectedOption) => {
    if (!selectedOption) return;
    const test = tests.find(t => t.id === selectedOption.value);
    if (!test || !test.parameters) return;

    const newResults = test.parameters.map(p => ({
      testId: test.id,
      parameterName: p.parameterName,
      referenceRange: p.referenceRange,
      unit: p.unit,
      groupName: p.groupName,
      resultValue: '',
      flag: ''
    }));

    setEditResults(prev => {
      const existingParams = new Set(prev.map(r => r.parameterName));
      const uniqueNewResults = newResults.filter(r => !existingParams.has(r.parameterName));
      return [...prev, ...uniqueNewResults];
    });
  };

  const testOptions = tests.map(t => ({
    value: t.id,
    label: `${t.testCode} - ${t.testName}`
  }));

  const filtered = reports.filter(r => {
    const matchSearch = r.reportNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patient?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patient?.patientId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>add
          <h2 className="text-2xl font-bold text-[#00488d] uppercase tracking-wide">Reports</h2>
          <p className="text-sm text-gray-500 mt-1">{reports.length} total · {reports.filter(r => r.status === 'PENDING').length} pending</p>
        </div>
        {user?.userType === 'STAFF' && (
          <button
            onClick={() => navigate('/reports/new')}
            className="bg-[#00488d] hover:bg-[#003875] text-white px-6 py-2 rounded text-sm font-bold tracking-wide transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> NEW REPORT
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative w-full max-w-sm bg-white border border-gray-300 rounded flex items-center px-3 py-2 focus-within:border-[#00488d]">
            <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by report no / patient name / ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-sm focus:outline-none"
            />
          </div>
          <div className="flex bg-white rounded border border-gray-300 text-sm overflow-hidden">
            {['ALL', 'PENDING', 'COMPLETED'].map(s => (
              <button key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 font-bold border-r border-gray-300 last:border-0 transition-colors ${filterStatus === s ? 'bg-[#00488d] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                {['Report No', 'Patient', 'Doctor', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-[#00488d]">{r.reportNumber}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-gray-900">{r.patient?.fullName}</p>
                    <p className="text-xs text-gray-400">{r.patient?.patientId} · {r.patient?.age}Y/{r.patient?.gender?.charAt(0)}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{r.doctor?.name || 'Self'}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{new Date(r.reportDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-4">
                    {user?.userType === 'STAFF' ? (
                      <button onClick={() => handleMarkComplete(r)}
                        className={`px-3 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${r.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'}`}>
                        {r.status === 'COMPLETED' ? '✓ COMPLETED' : '⏳ PENDING'}
                      </button>
                    ) : (
                      <span className={`inline-block px-3 py-1 rounded text-xs font-bold border ${r.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
                        {r.status === 'COMPLETED' ? '✓ COMPLETED' : '⏳ PENDING'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(r)} title={user?.userType === 'STAFF' ? "Edit Results" : "View Details"}
                        className="p-1.5 rounded text-[#00488d] hover:bg-blue-100 transition-colors">
                        {user?.userType === 'STAFF' ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => navigate(`/print/${r.id}`)} title="Print Report"
                        className="p-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors">
                        <Printer className="w-4 h-4" />
                      </button>
                      {user?.userType === 'STAFF' && (
                        <button onClick={() => handleDelete(r.id)} title="Delete Report"
                          className="p-1.5 rounded text-red-400 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    No reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#00488d]">Edit Report — {editReport.reportNumber}</h2>
                <p className="text-sm text-gray-500">{editReport.patient?.fullName} · {editReport.patient?.patientId}</p>
              </div>
              <button onClick={() => setShowEditModal(false)}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {/* Status */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-bold text-gray-600">Report Status:</span>
                <button
                  onClick={() => user?.userType === 'STAFF' && setEditStatus('PENDING')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-bold transition-colors ${editStatus === 'PENDING' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} ${user?.userType !== 'STAFF' ? 'cursor-default opacity-80' : ''}`}>
                  <Clock className="w-3.5 h-3.5" /> PENDING
                </button>
                <button
                  onClick={() => user?.userType === 'STAFF' && setEditStatus('COMPLETED')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-bold transition-colors ${editStatus === 'COMPLETED' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} ${user?.userType !== 'STAFF' ? 'cursor-default opacity-80' : ''}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> COMPLETED
                </button>
              </div>

              {/* Add New Test Section */}
              {user?.userType === 'STAFF' && (
                <div className="mb-6 p-4 border border-blue-100 bg-blue-50/30 rounded-lg">
                  <label className="block text-sm font-bold text-[#00488d] mb-2">Add Additional Tests to this Report:</label>
                  <Select
                    options={testOptions}
                    onChange={handleAddTest}
                    placeholder="Search and select a test to add..."
                    isClearable
                    value={null} // Always reset after selection
                  />
                </div>
              )}

              {/* Results Table */}
              {/* Results Rendering */}
              {(() => {
                const groupedByTest = {};
                editResults.forEach((tr, idx) => {
                  const tName = tr.parentTestName || 'Test Results';
                  if (!groupedByTest[tName]) groupedByTest[tName] = [];
                  groupedByTest[tName].push({ ...tr, originalIndex: idx });
                });

                return Object.keys(groupedByTest).map(testName => {
                  const params = groupedByTest[testName];
                  const titerValueSet = [...new Set(params.filter(p => p.isQualitative && p.titerValues).map(p => p.titerValues))];
                  const isTiterMatrix = titerValueSet.length === 1 && titerValueSet[0];
                  const titerList = isTiterMatrix ? titerValueSet[0].split(',') : [];

                  return (
                    <div key={testName} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                      <h3 className="bg-[#00488d] text-white px-4 py-2 font-bold uppercase flex justify-between items-center">
                        {testName}
                      </h3>
                      {isTiterMatrix ? (
                        <div className="bg-white">
                          <table className="w-full text-left border-collapse text-black text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 font-bold uppercase">&nbsp;</th>
                                {titerList.map((t, i) => (
                                  <th key={i} className="px-2 py-3 font-bold text-center">{t.trim()}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {params.filter(p => !p.groupName?.startsWith('__OVERALL__')).map(tr => {
                                const currentResults = tr.resultValue ? tr.resultValue.split('||').map(entry => {
                                  const [t, v] = entry.split('|');
                                  return { titer: t, value: v || '--' };
                                }) : titerList.map(t => ({ titer: t.trim(), value: '--' }));

                                const updateCell = (titer, val) => {
                                  const updated = currentResults.map(r => {
                                    if (r.titer.trim() === titer.trim()) {
                                      return { ...r, value: val };
                                    }
                                    return r;
                                  }).map(r => `${r.titer}|${r.value}`).join('||');
                                  updateResult(tr.originalIndex, 'resultValue', updated);
                                };

                                return (
                                  <tr key={tr.parameterName} className="border-b border-gray-200 last:border-0">
                                    <td className="px-4 py-3 font-bold text-gray-700">{tr.parameterName}</td>
                                    {titerList.map(titer => {
                                      const val = currentResults.find(r => r.titer.trim() === titer.trim())?.value || '--';
                                      const isPos = val === '+';
                                      return (
                                        <td key={titer} className="px-2 py-3 text-center">
                                          <button
                                            type="button"
                                            disabled={user?.userType !== 'STAFF'}
                                            onClick={() => updateCell(titer, isPos ? '--' : '+')}
                                            className={`font-mono text-sm font-bold w-full max-w-[60px] h-8 rounded border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isPos ? 'bg-green-100 text-green-700 border-green-300' : 'bg-transparent text-gray-500 border-gray-300 hover:border-gray-400'}`}
                                          >
                                            {val}
                                          </button>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {/* Overall result for Titer Matrix */}
                          {(() => {
                            const overall = params.find(p => p.groupName?.startsWith('__OVERALL__'));
                            if (!overall) return null;
                            return (
                              <div className="flex items-center justify-center gap-4 py-4 bg-gray-50 border-t border-gray-200">
                                <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Overall Result:</span>
                                {['POSITIVE', 'NEGATIVE'].map(opt => (
                                  <button
                                    key={opt}
                                    type="button"
                                    disabled={user?.userType !== 'STAFF'}
                                    onClick={() => updateResult(overall.originalIndex, 'resultValue', opt)}
                                    className={`px-6 py-2 text-sm font-bold uppercase tracking-wide border-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${overall.resultValue === opt
                                        ? 'border-black bg-black text-white'
                                        : 'border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 bg-white'
                                      }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Parameter</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Result</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Flag</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ref. Range</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Unit</th>
                                {user?.userType === 'STAFF' && <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Action</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {params.map((res, idx) => (
                                <tr key={res.id || res.originalIndex} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                  <td className="px-4 py-2 font-semibold text-gray-700 text-xs">{res.parameterName}</td>
                                  <td className="px-4 py-2">
                                    {(res.referenceRange?.toUpperCase().includes('NEGATIVE') ||
                                      res.referenceRange?.toUpperCase().includes('POSITIVE') ||
                                      res.referenceRange?.toUpperCase().includes('REACTIVE')) ? (
                                      <select
                                        value={res.resultValue || ''}
                                        onChange={e => updateResult(res.originalIndex, 'resultValue', e.target.value)}
                                        disabled={user?.userType !== 'STAFF'}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#00488d] font-bold disabled:bg-transparent disabled:border-transparent disabled:appearance-none"
                                      >
                                        <option value="">- Select Result -</option>
                                        {res.referenceRange?.toUpperCase().includes('REACTIVE') && !res.referenceRange?.toUpperCase().includes('NEGATIVE') ? (
                                          <>
                                            <option value="NON-REACTIVE">NON-REACTIVE</option>
                                            <option value="REACTIVE">REACTIVE</option>
                                          </>
                                        ) : (
                                          <>
                                            <option value="NEGATIVE">NEGATIVE</option>
                                            <option value="POSITIVE">POSITIVE</option>
                                          </>
                                        )}
                                      </select>
                                    ) : (
                                      <input
                                        type="text"
                                        value={res.resultValue || ''}
                                        onChange={e => updateResult(res.originalIndex, 'resultValue', e.target.value)}
                                        disabled={user?.userType !== 'STAFF'}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#00488d] font-bold disabled:bg-transparent disabled:border-transparent"
                                      />
                                    )}
                                  </td>
                                  <td className="px-4 py-2">
                                    <select value={res.flag || 'NORMAL'}
                                      onChange={e => updateResult(res.originalIndex, 'flag', e.target.value === 'NORMAL' ? null : e.target.value)}
                                      disabled={user?.userType !== 'STAFF'}
                                      className={`border rounded px-2 py-1 text-xs font-bold focus:outline-none disabled:appearance-none ${res.flag === 'HIGH' ? 'bg-red-50 border-red-300 text-red-700' : res.flag === 'LOW' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
                                      <option value="NORMAL">Normal</option>
                                      <option value="HIGH">High ↑</option>
                                      <option value="LOW">Low ↓</option>
                                    </select>
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-500">{res.referenceRange}</td>
                                  <td className="px-4 py-2 text-xs text-gray-500">{res.unit}</td>
                                  {user?.userType === 'STAFF' && (
                                    <td className="px-4 py-2 text-center">
                                      <button
                                        onClick={() => handleRemoveResult(res.originalIndex)}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Remove Parameter"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <button onClick={() => setShowEditModal(false)} className="px-6 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-50">Close</button>
              {user?.userType === 'STAFF' && (
                <button onClick={handleSaveEdit} disabled={saving}
                  className="px-6 py-2 bg-[#00488d] text-white rounded text-sm font-bold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2">
                  {saving ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>Saving...</> : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Reports;
