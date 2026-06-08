import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ArrowRight, Save, ArrowLeft, Beaker } from 'lucide-react';

const CreateReport = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Raw Data
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tests, setTests] = useState([]);

  // Selections
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);

  // Result Values (Step 2)
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [pRes, dRes, tRes] = await Promise.all([
        fetch('/api/patients', { headers: { 'Authorization': `Bearer ${user.accessToken}` } }),
        fetch('/api/doctors', { headers: { 'Authorization': `Bearer ${user.accessToken}` } }),
        fetch('/api/tests', { headers: { 'Authorization': `Bearer ${user.accessToken}` } })
      ]);
      const pData = await pRes.json();
      const dData = await dRes.json();
      const tData = await tRes.json();
      
      if (Array.isArray(pData)) setPatients(pData);
      if (Array.isArray(dData)) setDoctors(dData);
      if (Array.isArray(tData)) setTests(tData);
    } catch (err) {
      console.error(err);
    }
  };

  const patientOptions = patients.map(p => ({ value: p.id, label: `${p.patientId} - ${p.fullName}` }));
  const doctorOptions = doctors.map(d => ({ value: d.id, label: `${d.doctorId} - ${d.name}` }));
  const testOptions = tests.map(t => ({ 
    value: t.id, 
    label: `${t.testCode} - ${t.testName}`,
    testName: t.testName,
    parameters: t.parameters || []
  }));

  const handleNextStep = () => {
    if (!selectedPatient) return alert("Please select a Patient.");
    if (selectedTests.length === 0) return alert("Please select at least one Test.");

    // Flat map all parameters from the selected tests
    const initialResults = [];
    selectedTests.forEach(t => {
      if (t.parameters && t.parameters.length > 0) {
        t.parameters.forEach(p => {
          // Unique key for tracking inputs (testId + parameterName)
          const key = `${t.value}_${p.parameterName}`;
          const existing = testResults.find(tr => tr.key === key);
          const initialValue = p.isQualitative && p.titerValues
            ? p.titerValues.split(',').map(v => `${v.trim()}|`).join('||')
            : '';
          initialResults.push(existing || {
            key,
            testId: t.value,
            parentTestName: t.testName,
            parameterName: p.parameterName,
            referenceRange: p.referenceRange,
            unit: p.unit,
            groupName: p.groupName,
            isQualitative: p.isQualitative || false,
            titerValues: p.titerValues || '',
            resultValue: initialValue,
            flag: ''
          });
        });
      }
    });

    setTestResults(initialResults);
    setStep(2);
  };

  const autoCalculateFlag = (valueStr, rangeStr) => {
    if (!valueStr || !rangeStr) return '';
    const val = parseFloat(valueStr.toString().replace(/,/g, ''));
    if (isNaN(val)) return '';

    const range = rangeStr.toString().trim().replace(/,/g, '');
    
    // Find exactly one numeric range "min - max" safely without lookbehinds
    const rangePattern = /(?:^|[^\d\.])([\d\.]+)\s*-\s*([\d\.]+)(?:[^\d\.]|$)/g;
    const matches = [...range.matchAll(rangePattern)];
    
    if (matches.length === 1) {
      const min = parseFloat(matches[0][1]);
      const max = parseFloat(matches[0][2]);
      if (val < min) return 'LOW';
      if (val > max) return 'HIGH';
      return '';
    }

    // Less than
    const lessMatch = range.match(/<\s*([\d\.]+)/);
    if (lessMatch && val > parseFloat(lessMatch[1])) return 'HIGH';

    // Greater than
    const greaterMatch = range.match(/>\s*([\d\.]+)/);
    if (greaterMatch && val < parseFloat(greaterMatch[1])) return 'LOW';

    return '';
  };

  const handleResultChange = (key, field, value) => {
    setTestResults(prev => prev.map(tr => {
      if (tr.key === key) {
        const updated = { ...tr, [field]: value };
        // Auto-calculate flag if the user changes the resultValue
        if (field === 'resultValue') {
          const autoFlag = autoCalculateFlag(value, tr.referenceRange);
          // Only override if autoFlag found something, or if the user cleared the value
          if (autoFlag || value === '') updated.flag = autoFlag;
        }
        return updated;
      }
      return tr;
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        patientId: selectedPatient.value,
        results: testResults.map(r => ({ 
          testId: r.testId, 
          parameterName: r.parameterName,
          resultValue: r.resultValue, 
          flag: r.flag,
          referenceRange: r.referenceRange,
          unit: r.unit,
          groupName: r.groupName
        }))
      };
      if (selectedDoctor) payload.doctorId = selectedDoctor.value;

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        navigate(`/print/${data.id}`);
      } else {
        alert('Failed to save report');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group results for UI rendering
  const renderGroupedResults = () => {
    // Group by test
    const groupedByTest = {};
    testResults.forEach(tr => {
      if (!groupedByTest[tr.parentTestName]) groupedByTest[tr.parentTestName] = [];
      groupedByTest[tr.parentTestName].push(tr);
    });

    return Object.keys(groupedByTest).map(testName => {
      const params = groupedByTest[testName];
      // Check if all params share the same titerValues (e.g., Widal matrix)
      const titerValueSet = [...new Set(params.filter(p => p.isQualitative && p.titerValues).map(p => p.titerValues))];
      const isTiterMatrix = titerValueSet.length === 1 && titerValueSet[0];
      const titerList = isTiterMatrix ? titerValueSet[0].split(',') : [];

      return (
        <div key={testName} className="mb-8">
          <h3 className="bg-[#00488d] text-white px-4 py-2 font-bold uppercase flex items-center justify-between">
            <span>{testName}</span>
            {isTiterMatrix && (
              <span className="flex items-center gap-2">
                <span className="bg-yellow-300 text-[#00488d] text-[11px] px-3 py-0.5 rounded-full font-bold">Agglutinin Titer</span>
                {(() => {
                  const anyPos = params.some(tr => {
                    const cells = tr.resultValue ? tr.resultValue.split('||').map(e => e.split('|')[1]) : [];
                    return cells.some(v => v === '+');
                  });
                  const allEmpty = params.every(tr => {
                    const cells = tr.resultValue ? tr.resultValue.split('||').map(e => e.split('|')[1]) : [];
                    return cells.every(v => v === '');
                  });
                  return (
                    <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${anyPos ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {anyPos ? 'POSITIVE' : 'NEGATIVE'}
                    </span>
                  );
                })()}
              </span>
            )}
          </h3>

          {isTiterMatrix ? (
            /* Titer Matrix Layout (Widal-style) */
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase w-[30%]">Organism</th>
                    {titerList.map((t, i) => (
                      <th key={i} className="px-2 py-3 text-xs font-bold text-gray-700 text-center">{t.trim()}</th>
                    ))}
                    <th className="px-2 py-3 text-xs font-bold text-gray-700 text-center w-[12%]">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {params.map((tr) => {
                    const currentResults = tr.resultValue ? tr.resultValue.split('||').map(entry => {
                      const [t, v] = entry.split('|');
                      return { titer: t, value: v || '' };
                    }) : [];
                    const allPos = currentResults.length > 0 && currentResults.every(r => r.value === '+');
                    const allNeg = currentResults.length > 0 && currentResults.every(r => r.value === '');
                    const updateCell = (titer, val) => {
                      const others = currentResults.filter(r => r.titer.trim() !== titer.trim());
                      const updated = [...others, { titer: titer.trim(), value: val }]
                        .map(r => `${r.titer}|${r.value}`).join('||');
                      handleResultChange(tr.key, 'resultValue', updated);
                    };
                    return (
                      <tr key={tr.key} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">{tr.parameterName}</td>
                        {titerList.map((titer, ti) => {
                          const val = currentResults.find(r => r.titer.trim() === titer.trim())?.value || '';
                          return (
                            <td key={ti} className="px-1 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button type="button" onClick={() => updateCell(titer, val === '+' ? '' : '+')} className={`w-8 h-8 text-sm font-bold rounded border ${val === '+' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-300 border-gray-200 hover:border-green-400'}`}>+</button>
                                <button type="button" onClick={() => updateCell(titer, val === '-' ? '' : '-')} className={`w-8 h-8 text-sm font-bold rounded border ${val === '-' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-300 border-gray-200 hover:border-red-400'}`}>−</button>
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-2 py-3 text-center">
                          <span className={`text-sm font-bold ${allPos ? 'text-green-700' : allNeg ? 'text-gray-400' : 'text-orange-600'}`}>
                            {allPos ? 'POSITIVE' : allNeg ? 'NEGATIVE' : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Standard Table Layout */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Parameter</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Observed Value</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Flag</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Reference Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {params.map((tr, index) => {
                  const showGroup = tr.groupName && (index === 0 || params[index-1].groupName !== tr.groupName);
                  return (
                    <React.Fragment key={tr.key}>
                      {showGroup && (
                        <tr className="bg-blue-50">
                          <td colSpan="4" className="px-4 py-2 text-xs font-bold text-[#00488d] uppercase tracking-wide">{tr.groupName}</td>
                        </tr>
                      )}
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-bold text-gray-800 pl-6">{tr.parameterName}</td>
                        <td className="px-4 py-4">
                          {tr.isQualitative ? (
                            <div className="flex gap-1">
                              <button type="button" onClick={() => handleResultChange(tr.key, 'resultValue', tr.resultValue === '+' ? '' : '+')} className={`px-4 py-2 text-sm font-bold rounded border ${tr.resultValue === '+' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-400 border-gray-300 hover:border-green-400'}`}>POSITIVE</button>
                              <button type="button" onClick={() => handleResultChange(tr.key, 'resultValue', tr.resultValue === '-' ? '' : '-')} className={`px-4 py-2 text-sm font-bold rounded border ${tr.resultValue === '-' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-400 border-gray-300 hover:border-red-400'}`}>NEGATIVE</button>
                            </div>
                          ) : (
                            <input type="text" value={tr.resultValue} onChange={(e) => handleResultChange(tr.key, 'resultValue', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 text-sm font-bold focus:outline-none focus:border-[#00488d]" />
                          )}
                        </td>
                        <td className="px-4 py-4 w-32">
                          {tr.isQualitative ? (
                            <span className="text-xs text-gray-400">N/A</span>
                          ) : (
                            <select value={tr.flag} onChange={(e) => handleResultChange(tr.key, 'flag', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-[#00488d]">
                              <option value="">Normal</option>
                              <option value="HIGH">HIGH</option>
                              <option value="LOW">LOW</option>
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {tr.isQualitative ? (
                            <span className="text-xs text-gray-400">—</span>
                          ) : (
                            <><p className="text-sm text-gray-600">{tr.referenceRange}</p><p className="text-xs text-gray-400">{tr.unit}</p></>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      );
    });
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#00488d] uppercase tracking-wide">Generate New Report</h2>
        <button onClick={() => navigate('/reports')} className="text-gray-500 hover:text-gray-700 font-bold text-sm">
          Cancel & Return
        </button>
      </div>

      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center">
          <div className={`flex items-center font-bold text-sm ${step === 1 ? 'text-[#00488d]' : 'text-gray-400'}`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${step === 1 ? 'bg-[#00488d] text-white' : 'bg-gray-300 text-white'}`}>1</span>
            Patient & Tests
          </div>
          <div className="w-16 h-px bg-gray-300 mx-4"></div>
          <div className={`flex items-center font-bold text-sm ${step === 2 ? 'text-[#00488d]' : 'text-gray-400'}`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${step === 2 ? 'bg-[#00488d] text-white' : 'bg-gray-300 text-white'}`}>2</span>
            Enter Results
          </div>
        </div>

        {step === 1 && (
          <div className="p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Patient *</label>
                  <Select options={patientOptions} value={selectedPatient} onChange={setSelectedPatient} isClearable />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Referring Doctor</label>
                  <Select options={doctorOptions} value={selectedDoctor} onChange={setSelectedDoctor} isClearable />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Test Panels *</label>
                <Select options={testOptions} value={selectedTests} onChange={setSelectedTests} isMulti isSearchable />
              </div>
              <div className="pt-6 flex justify-end">
                <button onClick={handleNextStep} className="bg-[#00488d] hover:bg-[#003875] text-white px-8 py-3 rounded text-sm font-bold">NEXT STEP <ArrowRight className="w-4 h-4 ml-2 inline" /></button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-0">
            <div className="p-6 bg-white min-h-[50vh]">
              {renderGroupedResults()}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <button onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 rounded text-gray-700 font-bold hover:bg-gray-100 flex items-center text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
              <button disabled={isSubmitting} onClick={handleSubmit} className={`px-8 py-3 rounded text-sm font-bold tracking-wide transition-colors flex items-center ${isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                {isSubmitting ? 'SAVING...' : 'SAVE & PREVIEW'} {!isSubmitting && <Save className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CreateReport;
