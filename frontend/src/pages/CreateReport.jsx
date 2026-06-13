import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ArrowRight, Save, ArrowLeft, Beaker, Camera, Loader2, FileText, CheckCircle2, MessageSquare, Sparkles, QrCode } from 'lucide-react';
import Tesseract from 'tesseract.js';
import QRScanner from '../components/QRScanner';

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
  const [overallResults, setOverallResults] = useState({});
  const [testSummaries, setTestSummaries] = useState({});

  // OCR State
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [ocrError, setOcrError] = useState('');
  const [showOcrText, setShowOcrText] = useState(false);

  // AI Suggester State
  const [symptoms, setSymptoms] = useState('');
  const [suggestingTests, setSuggestingTests] = useState(false);
  const [suggestedText, setSuggestedText] = useState('');

  // QR Scanner State
  const [showQRScanner, setShowQRScanner] = useState(false);

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
    parameters: t.parameters || [],
    summary: t.summary || ''
  }));

  const handleNextStep = () => {
    if (!selectedPatient) return alert("Please select a Patient.");
    if (selectedTests.length === 0) return alert("Please select at least one Test.");

    // Flat map all parameters from the selected tests
    const initialSummaries = {};
    const initialResults = [];

    selectedTests.forEach(t => {
      initialSummaries[t.value] = t.summary || '';
      if (t.parameters && t.parameters.length > 0) {
        t.parameters.forEach(p => {
          // Unique key for tracking inputs (testId + parameterName)
          const key = `${t.value}_${p.parameterName}`;
          const existing = testResults.find(tr => tr.key === key);
          const initialValue = p.isQualitative && p.titerValues
            ? p.titerValues.split(',').map(v => `${v.trim()}|--`).join('||')
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

    setTestSummaries(initialSummaries);
    setTestResults(initialResults);
    setStep(2);
  };

  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrError('');
    setOcrText('');
    setShowOcrText(true);

    try {
      const worker = await Tesseract.createWorker('eng');
      const ret = await worker.recognize(file);
      const text = ret.data.text;
      setOcrText(text);
      await worker.terminate();

      // Simple keyword matching against available tests to auto-select
      const textUpper = text.toUpperCase();
      const matchedTests = testOptions.filter(t => {
        // match testName or testCode
        const nameMatch = textUpper.includes(t.testName.toUpperCase());
        const codeMatch = textUpper.includes(t.label.split(' - ')[0].toUpperCase());
        return nameMatch || codeMatch;
      });

      if (matchedTests.length > 0) {
        // Merge with currently selected without duplicating
        setSelectedTests(prev => {
          const currentIds = new Set(prev.map(p => p.value));
          const newSelections = matchedTests.filter(m => !currentIds.has(m.value));
          return [...prev, ...newSelections];
        });
      }

    } catch (err) {
      console.error('OCR Error:', err);
      setOcrError('Failed to read image. Please try again or enter manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSuggestTests = async () => {
    if (!symptoms.trim() || suggestingTests) return;
    setSuggestingTests(true);
    setSuggestedText('');
    
    try {
      const testNames = testOptions.map(t => t.testName).join(', ');
      const prompt = `A patient has the following symptoms: "${symptoms}". Based on these symptoms, which of the following lab tests would you recommend? Available tests: [${testNames}]. Return ONLY a comma-separated list of the test names you recommend from the available list. No extra text, no explanations.`;
      
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      const text = await response.text();
      setSuggestedText(text);

      // Auto-select tests
      const suggestedArray = text.split(',').map(s => s.trim().toUpperCase());
      const matchedTests = testOptions.filter(t => 
        suggestedArray.some(sa => sa.includes(t.testName.toUpperCase()) || t.testName.toUpperCase().includes(sa))
      );

      if (matchedTests.length > 0) {
        setSelectedTests(prev => {
          const currentIds = new Set(prev.map(p => p.value));
          const newSelections = matchedTests.filter(m => !currentIds.has(m.value));
          return [...prev, ...newSelections];
        });
      }
    } catch (err) {
      console.error('AI Suggestion Error:', err);
      setSuggestedText('Failed to get suggestions. Please check your connection.');
    } finally {
      setSuggestingTests(false);
    }
  };

  const handleQRScan = (decodedText) => {
    setShowQRScanner(false);
    // The decodedText is the patientId (e.g., P001 or id)
    const match = patientOptions.find(opt => 
      opt.label.includes(decodedText) || String(opt.value) === String(decodedText)
    );
    if (match) {
      setSelectedPatient(match);
    } else {
      alert(`Patient ID "${decodedText}" not found.`);
    }
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
    setTestResults(prev => {
      let newResults = prev.map(tr => {
        if (tr.key === key) {
          const updated = { ...tr, [field]: value };
          if (field === 'resultValue') {
            const autoFlag = autoCalculateFlag(value, tr.referenceRange);
            if (autoFlag || value === '') updated.flag = autoFlag;
          }
          return updated;
        }
        return tr;
      });

      // Auto-calculate CBC Parameters based on photo formulas
      const modifiedRow = newResults.find(tr => tr.key === key);
      if (modifiedRow && field === 'resultValue') {
        const paramName = modifiedRow.parameterName;
        if (paramName === 'HAEMOGLOBIN' || paramName === 'H.C.T.' || paramName === 'R.B.C. COUNT') {
          const hbRow = newResults.find(tr => tr.testId === modifiedRow.testId && tr.parameterName === 'HAEMOGLOBIN');
          let hb = hbRow && hbRow.resultValue ? parseFloat(hbRow.resultValue) : NaN;
          
          let hct = NaN, rbc = NaN;

          // If HB was just updated, auto-derive HCT and RBC
          if (paramName === 'HAEMOGLOBIN' && !isNaN(hb)) {
            hct = hb * 3;
            rbc = hb / 3;
          } else {
            const hctRow = newResults.find(tr => tr.testId === modifiedRow.testId && tr.parameterName === 'H.C.T.');
            const rbcRow = newResults.find(tr => tr.testId === modifiedRow.testId && tr.parameterName === 'R.B.C. COUNT');
            hct = hctRow && hctRow.resultValue ? parseFloat(hctRow.resultValue) : NaN;
            rbc = rbcRow && rbcRow.resultValue ? parseFloat(rbcRow.resultValue) : NaN;
          }

          // If we have all three base values, calculate the indices
          if (!isNaN(hb) && !isNaN(hct) && !isNaN(rbc) && rbc > 0 && hct > 0) {
            const mcv = (hct * 10) / rbc;
            const mch = (hb * 10) / rbc;
            const mchc = (hb * 100) / hct;

            newResults = newResults.map(tr => {
              if (tr.testId === modifiedRow.testId) {
                let updatedVal = null;
                // Only overwrite HCT and RBC if HB was the one modified
                if (paramName === 'HAEMOGLOBIN') {
                  if (tr.parameterName === 'H.C.T.') updatedVal = hct.toFixed(1);
                  if (tr.parameterName === 'R.B.C. COUNT') updatedVal = rbc.toFixed(2);
                }
                if (tr.parameterName === 'M.C.V.') updatedVal = mcv.toFixed(1);
                if (tr.parameterName === 'M.C.H.') updatedVal = mch.toFixed(1);
                if (tr.parameterName === 'M.C.H.C.') updatedVal = mchc.toFixed(1);

                if (updatedVal !== null) {
                  const autoFlag = autoCalculateFlag(updatedVal, tr.referenceRange);
                  return { ...tr, resultValue: updatedVal, flag: autoFlag || tr.flag || '' };
                }
              }
              return tr;
            });
          }
        }
      }
      
      return newResults;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Build results array
      const savedResults = testResults.map(r => ({ 
        testId: r.testId, 
        parameterName: r.parameterName,
        resultValue: r.resultValue, 
        flag: r.flag,
        referenceRange: r.referenceRange,
        unit: r.unit,
        groupName: r.groupName
      }));
      // Add overall result for titer matrix tests
      Object.keys(overallResults).forEach(testName => {
        const ti = testResults.find(r => r.parentTestName === testName)?.testId;
        if (ti) {
          savedResults.push({
            testId: ti,
            parameterName: '',
            resultValue: overallResults[testName],
            flag: '',
            referenceRange: '',
            unit: '',
            groupName: `__OVERALL__${testName}`
          });
        }
      });
      // Add custom summaries
      Object.keys(testSummaries).forEach(tid => {
        if (testSummaries[tid]) {
          savedResults.push({
            testId: parseInt(tid),
            parameterName: '__SUMMARY__',
            resultValue: testSummaries[tid],
            flag: '',
            referenceRange: '',
            unit: '',
            groupName: '__SUMMARY__'
          });
        }
      });
      const payload = {
        patientId: selectedPatient.value,
        results: savedResults
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

  const renderImmunologySection = () => {
    const immunologyParams = testResults.filter(
      tr => tr.groupName === 'IMMUNOLOGY & SEROLOGY TEST'
    );
    if (immunologyParams.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="border border-black">
          <h4 className="font-black text-[15px] underline uppercase tracking-wider text-black px-4 py-2 border-b border-black" style={{ fontFamily: 'Georgia, serif' }}>
            IMMUNOLOGY &amp; SEROLOGY TEST
          </h4>
          <div className="divide-y divide-black">
            {immunologyParams.map(tr => (
              <div key={tr.key} className="flex items-center px-4 py-3">
                <span className="font-bold text-sm whitespace-nowrap" style={{ fontFamily: 'Georgia, serif' }}>
                  {tr.parameterName}
                </span>
                <div className="flex-1 mx-3 self-center" style={{
                  borderBottom: '1px dotted #999',
                  minWidth: '20px',
                  height: '1px'
                }}></div>
                <select
                  value={tr.resultValue || 'NON-REACTIVE'}
                  onChange={e => handleResultChange(tr.key, 'resultValue', e.target.value)}
                  className="font-bold text-sm border-0 bg-transparent focus:outline-none cursor-pointer text-right appearance-none"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  <option value="NON-REACTIVE">NON-REACTIVE</option>
                  <option value="REACTIVE">REACTIVE</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Group results for UI rendering
  const renderGroupedResults = () => {
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
      const isMantoux = params[0]?.test?.testCode === 'MANTOUX-01' || testName.toUpperCase().includes('MANTOUX');
      const isMalaria = params[0]?.test?.testCode === 'MP-MICRO' || testName.toUpperCase().includes('MALARIA MICRO');

      return (
        <div key={testName} className="mb-8">
          <h3 className="bg-[#00488d] text-white px-4 py-2 font-bold uppercase flex items-center justify-between">
            <span>{testName}</span>
          </h3>

          {isMantoux ? (
            <div className="p-6 border border-gray-300 rounded-b-lg bg-gray-50 max-w-2xl mx-auto mt-4 shadow-sm" style={{ fontFamily: 'Georgia, serif' }}>
              <div className="text-center mb-6">
                <h4 className="text-lg font-black underline uppercase text-black">{testName}</h4>
                <p className="text-sm font-semibold text-gray-700 mt-1">(Interdermal Skin Test)</p>
              </div>

              {/* Top Data Table */}
              <div className="border border-black mb-6 bg-white">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-1/2 p-3 font-bold border-r border-black text-black">Tuberculin Dose</td>
                      <td className="w-1/2 p-2">
                        <input 
                          type="text" 
                          value={(() => {
                            const p = params.find(p => p.parameterName.includes('Dose')) || params[0];
                            if (p && !p.resultValue) p.resultValue = '0.1 mL of TU PPD';
                            return p?.resultValue || '0.1 mL of TU PPD';
                          })()} 
                          onChange={e => {
                            const p = params.find(p => p.parameterName.includes('Dose')) || params[0];
                            if (p) handleResultChange(p.key, 'resultValue', e.target.value);
                          }} 
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-bold text-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="w-1/2 p-3 font-bold border-r border-black text-black">Induration (mm)</td>
                      <td className="w-1/2 p-2">
                        <input 
                          type="text" 
                          placeholder="e.g. 02X02"
                          value={(() => {
                            const p = params.find(p => p.parameterName.includes('Induration')) || params[1];
                            return p?.resultValue || '';
                          })()} 
                          onChange={e => {
                            const p = params.find(p => p.parameterName.includes('Induration')) || params[1];
                            if (p) handleResultChange(p.key, 'resultValue', e.target.value);
                          }} 
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-bold text-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="w-1/2 p-3 font-bold border-r border-black text-black">Result after 48 hours</td>
                      <td className="w-1/2 p-2">
                        <select 
                          value={(() => {
                            const p = params.find(p => p.parameterName.includes('Result')) || params[2];
                            return p?.resultValue || '';
                          })()} 
                          onChange={e => {
                            const p = params.find(p => p.parameterName.includes('Result')) || params[2];
                            if (p) handleResultChange(p.key, 'resultValue', e.target.value);
                          }} 
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-bold text-black focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                        >
                          <option value="">-- Select --</option>
                          <option value="NEGATIVE">NEGATIVE</option>
                          <option value="POSITIVE">POSITIVE</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Interpretation Section */}
              <div className="mb-6 text-black text-sm leading-relaxed">
                <p className="font-bold mb-1">Interpretation:</p>
                <p className="text-gray-800">
                  Induration measuring 10 mm more is considered positive which shows hypersensitivity to <span className="italic underline">tuberculoprotein</span>. It indicates past or present infection with <span className="italic underline">Mycobacterium</span> tuberculosis.
                </p>
              </div>

              {/* Induration Size Reference Table */}
              <div className="border border-black bg-white">
                <table className="w-full border-collapse text-left text-xs text-black">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black font-bold">
                      <th className="p-2 border-r border-black w-1/3">Induration Size</th>
                      <th className="p-2 w-2/3">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    <tr>
                      <td className="p-2 border-r border-black font-semibold">&lt; 5 mm</td>
                      <td className="p-2">A negative result, indicating no exposure to TB</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-black font-semibold">5–9 mm</td>
                      <td className="p-2">Usually considered positive for people who are immunocompromised or have other risk factors for TB</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-black font-semibold">10–14 mm</td>
                      <td className="p-2">Usually considered positive for people with medical risk factors for TB, recent immigrants from areas with high TB prevalence, or close contacts with people with TB</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-black font-semibold">&gt; 15 mm</td>
                      <td className="p-2">Usually considered positive for people with no known risk factors for TB</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : isMalaria ? (
            <div className="p-6 border border-gray-300 rounded-b-lg bg-gray-50 max-w-2xl mx-auto mt-4 shadow-sm" style={{ fontFamily: 'Georgia, serif' }}>
              <div className="mb-6 text-center">
                <h3 className="text-lg font-black underline uppercase text-black">IMMUNOLOGY & SEROLOGY TEST</h3>
              </div>
              
              <div className="border border-black bg-white mb-6 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-bold text-[15px] text-black">MALARIA PARASITE IDENTIFICATION</span>
                    <span className="text-[12px] font-bold text-center mt-1 text-gray-800">(MICROSCOPY)</span>
                  </div>
                  <select 
                    value={(() => {
                      const p = params[0];
                      if (p && !p.resultValue) p.resultValue = 'NOT-SEEN';
                      return p?.resultValue || 'NOT-SEEN';
                    })()}
                    onChange={e => {
                      if (params[0]) handleResultChange(params[0].key, 'resultValue', e.target.value);
                    }} 
                    className="border border-gray-300 rounded px-3 py-2 text-[15px] font-bold text-black focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-sm min-w-[120px]"
                  >
                    <option value="NOT-SEEN">NOT-SEEN</option>
                    <option value="SEEN">SEEN</option>
                  </select>
                </div>
              </div>

              <div className="text-black text-[13px] leading-relaxed">
                <p className="font-bold mb-2">NOTE:</p>
                <div className="space-y-1.5">
                  <p className="flex items-start"><span className="mr-2">➤</span> A Single negative smear does not rule out malaria</p>
                  <p className="flex items-start"><span className="mr-2">➤</span> Test conducted on whole blood.</p>
                </div>
              </div>
            </div>
          ) : isTiterMatrix ? (
            <React.Fragment>
              <div className="border border-black">
                <table className="w-full text-left border-collapse text-black">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="px-4 py-3 text-sm font-bold uppercase">&nbsp;</th>
                      {titerList.map((t, i) => (
                        <th key={i} className="px-2 py-3 text-sm font-bold text-center">{t.trim()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((tr) => {
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
                        handleResultChange(tr.key, 'resultValue', updated);
                      };
                      return (
                        <tr key={tr.key} className="border-b border-gray-200 last:border-b-0">
                          <td className="px-4 py-3 text-sm font-bold">{tr.parameterName}</td>
                          {titerList.map((titer) => {
                            const val = currentResults.find(r => r.titer.trim() === titer.trim())?.value || '--';
                            const isPos = val === '+';
                            return (
                              <td key={titer} className="px-2 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => updateCell(titer, isPos ? '--' : '+')}
                                  className="font-mono text-sm font-bold text-black cursor-pointer hover:text-gray-600 bg-transparent border-0 outline-none w-full"
                                >
                                  {isPos ? '+' : '--'}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Overall Result:</span>
                {['POSITIVE', 'NEGATIVE'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setOverallResults(prev => ({ ...prev, [testName]: opt }))}
                    className={`px-6 py-2 text-sm font-bold uppercase tracking-wide border-2 rounded transition-colors ${
                      (overallResults[testName] || 'NEGATIVE') === opt
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </React.Fragment>
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
                          {(tr.parameterName?.toUpperCase().includes('TYPHI') || tr.parameterName?.toUpperCase().includes('WIDAL')) ? (
                            <select
                              value={tr.resultValue || ''}
                              onChange={(e) => handleResultChange(tr.key, 'resultValue', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#00488d]"
                            >
                              <option value="">-- Select --</option>
                              <option value="NEGATIVE">NEGATIVE</option>
                              <option value="POSITIVE">POSITIVE</option>
                              <option value="1:20">1:20</option>
                              <option value="1:40">1:40</option>
                              <option value="1:80">1:80</option>
                              <option value="1:160">1:160</option>
                              <option value="1:320">1:320</option>
                            </select>
                          ) : tr.isQualitative ? (
                            <select
                              value={tr.resultValue === '+' ? 'POSITIVE' : tr.resultValue === '-' ? 'NEGATIVE' : ''}
                              onChange={(e) => handleResultChange(tr.key, 'resultValue', e.target.value === 'POSITIVE' ? '+' : e.target.value === 'NEGATIVE' ? '-' : '')}
                              className="border border-gray-300 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#00488d]"
                            >
                              <option value="">-- Select --</option>
                              <option value="POSITIVE">POSITIVE</option>
                              <option value="NEGATIVE">NEGATIVE</option>
                            </select>
                          ) : (
                            <input type="text" value={tr.resultValue || ''} onChange={(e) => handleResultChange(tr.key, 'resultValue', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 text-sm font-bold focus:outline-none focus:border-[#00488d]" />
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
          
          {/* Summary Textarea for this test */}
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Test Summary / Clinical Notes</label>
            <textarea
              value={testSummaries[params[0]?.testId] || ''}
              onChange={(e) => setTestSummaries(prev => ({ ...prev, [params[0].testId]: e.target.value }))}
              rows="3"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00488d]"
              placeholder="Optional: Add clinical notes, interpretations, or references to display on the report..."
            />
          </div>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">Select Patient *</label>
                    <button 
                      onClick={() => setShowQRScanner(true)}
                      className="text-xs font-bold text-[#00488d] flex items-center gap-1 hover:underline"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Scan ID Card
                    </button>
                  </div>
                  <Select options={patientOptions} value={selectedPatient} onChange={setSelectedPatient} isClearable />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Referring Doctor</label>
                  <Select options={doctorOptions} value={selectedDoctor} onChange={setSelectedDoctor} isClearable />
                </div>
              </div>

              {/* OCR Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Camera className="w-24 h-24 text-blue-900" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-5">
                  <div className="flex-1">
                    <h3 className="text-base font-extrabold text-[#00488d] flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Smart Referral Scanner (OCR)
                    </h3>
                    <p className="text-xs text-blue-800/70 mt-1 mb-4 font-medium max-w-md">
                      Upload a photo of the doctor's referral slip. The system will extract text and automatically select matching tests below.
                    </p>
                    
                    <div>
                      <input 
                        type="file" 
                        id="ocr-upload" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleOcrUpload}
                        disabled={ocrLoading}
                      />
                      <label 
                        htmlFor="ocr-upload" 
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all cursor-pointer ${
                          ocrLoading 
                            ? 'bg-blue-200 text-blue-600 cursor-not-allowed' 
                            : 'bg-white text-[#00488d] border border-blue-300 hover:bg-blue-50 hover:border-blue-400'
                        }`}
                      >
                        {ocrLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Image...</>
                        ) : (
                          <><Camera className="w-4 h-4" /> Upload Referral Photo</>
                        )}
                      </label>
                    </div>

                    {ocrError && <p className="text-xs font-bold text-red-600 mt-3">{ocrError}</p>}
                    
                    {showOcrText && ocrText && !ocrLoading && (
                      <div className="mt-4 bg-white/60 border border-blue-200 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider">Extracted Text</span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Auto-selection complete
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                          {ocrText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Symptom Suggester */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Sparkles className="w-24 h-24 text-indigo-900" />
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-indigo-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" /> AI Symptom-to-Test Suggester
                    </h3>
                    <p className="text-xs text-indigo-800/70 mt-1 mb-2 font-medium">
                      Enter patient symptoms (e.g., "fever, joint pain, fatigue"). The AI will suggest relevant tests and auto-select them.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Enter symptoms here..."
                      className="flex-1 border border-indigo-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleSuggestTests()}
                    />
                    <button 
                      onClick={handleSuggestTests}
                      disabled={suggestingTests || !symptoms.trim()}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {suggestingTests ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Suggest Tests</>
                      )}
                    </button>
                  </div>

                  {suggestedText && !suggestingTests && (
                    <div className="mt-2 bg-white/80 border border-indigo-200 rounded p-3 text-sm">
                      <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider block mb-1">AI Recommendation:</span>
                      <p className="text-slate-700 font-semibold">{suggestedText}</p>
                    </div>
                  )}
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

        {showQRScanner && (
          <QRScanner 
            onScan={handleQRScan} 
            onClose={() => setShowQRScanner(false)} 
          />
        )}
      </div>
    </Layout>
  );
};

export default CreateReport;
