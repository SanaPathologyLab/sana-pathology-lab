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
          initialResults.push(existing || {
            key,
            testId: t.value,
            parentTestName: t.testName,
            parameterName: p.parameterName,
            referenceRange: p.referenceRange,
            unit: p.unit,
            groupName: p.groupName,
            resultValue: '',
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
    
    // Find exactly one numeric range "min - max"
    const rangePattern = /(?<![\d\.])([\d\.]+)\s*-\s*([\d\.]+)(?![\d\.])/g;
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

    return Object.keys(groupedByTest).map(testName => (
      <div key={testName} className="mb-8">
        <h3 className="bg-[#00488d] text-white px-4 py-2 font-bold uppercase">{testName}</h3>
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
            {groupedByTest[testName].map((tr, index) => {
              // Check if we need to show groupName row
              const showGroup = tr.groupName && (index === 0 || groupedByTest[testName][index-1].groupName !== tr.groupName);
              return (
                <React.Fragment key={tr.key}>
                  {showGroup && (
                    <tr className="bg-blue-50">
                      <td colSpan="4" className="px-4 py-2 text-xs font-bold text-[#00488d] uppercase tracking-wide">
                        {tr.groupName}
                      </td>
                    </tr>
                  )}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-bold text-gray-800 pl-6">
                      {tr.parameterName}
                    </td>
                    <td className="px-4 py-4">
                      <input 
                        type="text" 
                        value={tr.resultValue}
                        onChange={(e) => handleResultChange(tr.key, 'resultValue', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-2 text-sm font-bold focus:outline-none focus:border-[#00488d]"
                      />
                    </td>
                    <td className="px-4 py-4 w-32">
                      <select 
                        value={tr.flag}
                        onChange={(e) => handleResultChange(tr.key, 'flag', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-[#00488d]"
                      >
                        <option value="">Normal</option>
                        <option value="HIGH">HIGH</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{tr.referenceRange}</p>
                      <p className="text-xs text-gray-400">{tr.unit}</p>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    ));
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
