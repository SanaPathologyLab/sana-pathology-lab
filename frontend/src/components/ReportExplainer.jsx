import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Activity, AlertTriangle, CheckCircle2, XCircle, Info, Stethoscope } from 'lucide-react';

const TEST_RANGES = {
  'Hemoglobin': { unit: 'g/dL', male: { low: 13.5, high: 17.5 }, female: { low: 12.0, high: 15.5 }, description: 'Measures oxygen-carrying protein in red blood cells', descriptionHi: 'लाल रक्त कोशिकाओं में ऑक्सीजन वहन करने वाले प्रोटीन को मापता है' },
  'TSH': { unit: 'mIU/L', low: 0.4, high: 4.0, description: 'Thyroid Stimulating Hormone - checks thyroid function', descriptionHi: 'थायराइड उत्तेजक हार्मोन - थायराइड कार्य की जांच करता है' },
  'T3': { unit: 'ng/dL', low: 80, high: 200, description: 'Triiodothyronine - active thyroid hormone', descriptionHi: 'ट्राइआयोडोथायरोनिन - सक्रिय थायराइड हार्मोन' },
  'T4': { unit: 'μg/dL', low: 5.0, high: 12.0, description: 'Thyroxine - main thyroid hormone', descriptionHi: 'थायरोक्सिन - मुख्य थायराइड हार्मोन' },
  'Fasting Blood Sugar': { unit: 'mg/dL', low: 70, high: 110, description: 'Blood glucose level after fasting', descriptionHi: 'उपवास के बाद रक्त शर्करा स्तर' },
  'Random Blood Sugar': { unit: 'mg/dL', low: 70, high: 140, description: 'Random blood glucose level', descriptionHi: 'यादृच्छिक रक्त शर्करा स्तर' },
  'HbA1c': { unit: '%', low: 4.0, high: 5.6, description: 'Average blood sugar over 3 months', descriptionHi: '3 महीनों में औसत रक्त शर्करा' },
  'Total Cholesterol': { unit: 'mg/dL', low: 125, high: 200, description: 'Total cholesterol in blood', descriptionHi: 'रक्त में कुल कोलेस्ट्रॉल' },
  'HDL': { unit: 'mg/dL', low: 40, high: 60, description: 'Good cholesterol', descriptionHi: 'अच्छा कोलेस्ट्रॉल' },
  'LDL': { unit: 'mg/dL', low: 0, high: 130, description: 'Bad cholesterol', descriptionHi: 'खराब कोलेस्ट्रॉल' },
  'Triglycerides': { unit: 'mg/dL', low: 0, high: 150, description: 'Blood fat levels', descriptionHi: 'रक्त वसा स्तर' },
  'Uric Acid': { unit: 'mg/dL', male: { low: 3.4, high: 7.0 }, female: { low: 2.4, high: 6.0 }, description: 'Waste product from purine metabolism', descriptionHi: 'प्यूरीन चयापचय से अपशिष्ट उत्पाद' },
  'Creatinine': { unit: 'mg/dL', male: { low: 0.7, high: 1.3 }, female: { low: 0.6, high: 1.1 }, description: 'Waste product from muscle metabolism, checks kidney function', descriptionHi: 'गुर्दे के कार्य की जांच' },
  'Vitamin D': { unit: 'ng/mL', low: 20, high: 100, description: 'Important for bone health and immunity', descriptionHi: 'हड्डियों के स्वास्थ्य और प्रतिरक्षा के लिए महत्वपूर्ण' },
};

const getRangeForGender = (test, gender) => {
  if (test.male && test.female) {
    return gender === 'female' ? test.female : test.male;
  }
  return { low: test.low, high: test.high };
};

const evaluateResult = (value, low, high, test) => {
  const borderlineLow = low * 0.95;
  const borderlineHigh = high * 1.05;
  if (value < low) {
    if (value >= borderlineLow) return { status: 'borderline-low', labelEn: 'Borderline Low', labelHi: 'सीमा रेखा कम', color: 'amber' };
    return { status: 'low', labelEn: 'Low', labelHi: 'कम', color: 'red' };
  }
  if (value > high) {
    if (value <= borderlineHigh) return { status: 'borderline-high', labelEn: 'Borderline High', labelHi: 'सीमा रेखा अधिक', color: 'amber' };
    return { status: 'high', labelEn: 'High', labelHi: 'अधिक', color: 'red' };
  }
  return { status: 'normal', labelEn: 'Normal', labelHi: 'सामान्य', color: 'green' };
};

const StatusBadge = ({ result, lang }) => {
  const colorMap = {
    green: 'bg-green-100 text-green-700 border-green-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };
  const IconMap = {
    green: CheckCircle2,
    amber: AlertTriangle,
    red: XCircle,
  };
  const Icon = IconMap[result.color] || Info;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${colorMap[result.color]}`}>
      <Icon className="w-3.5 h-3.5" />
      {lang === 'en' ? result.labelEn : result.labelHi}
    </span>
  );
};

const RangeBar = ({ value, low, high }) => {
  const clampedValue = Math.min(Math.max(value, low * 0.7), high * 1.3);
  const min = low * 0.7;
  const max = high * 1.3;
  const pct = ((clampedValue - min) / (max - min)) * 100;
  const normalStart = ((low - min) / (max - min)) * 100;
  const normalEnd = ((high - min) / (max - min)) * 100;

  return (
    <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden mt-1">
      <div
        className="absolute h-full bg-green-300"
        style={{ left: `${normalStart}%`, width: `${normalEnd - normalStart}%` }}
      />
      <div
        className="absolute top-0 w-3 h-3 rounded-full border-2 border-white shadow-md transition-all duration-500"
        style={{
          left: `calc(${pct}% - 6px)`,
          backgroundColor: pct < normalStart || pct > normalEnd ? '#ef4444' : '#22c55e',
        }}
      />
    </div>
  );
};

const ReportExplainer = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState('');
  const [resultValue, setResultValue] = useState('');
  const [gender, setGender] = useState('male');
  const [resultList, setResultList] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);

  const testNames = Object.keys(TEST_RANGES);

  const handleAnalyze = () => {
    if (!selectedTest || resultValue === '') return;
    const test = TEST_RANGES[selectedTest];
    const val = parseFloat(resultValue);
    if (isNaN(val)) return;
    const range = getRangeForGender(test, gender);
    const result = evaluateResult(val, range.low, range.high, test);
    const entry = {
      testName: selectedTest,
      value: val,
      unit: test.unit,
      range,
      result,
      gender,
      timestamp: Date.now(),
    };
    setCurrentResult(entry);
    setResultList(prev => [entry, ...prev]);
  };

  const clearForm = () => {
    setSelectedTest('');
    setResultValue('');
    setGender('male');
    setCurrentResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#1D9E75] to-[#1D9E75]/90 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2.5">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white text-lg font-bold leading-tight">
              {isEn ? "Understand your test results" : "अपने टेस्ट परिणाम समझें"}
            </h2>
            <p className="text-white/80 text-sm mt-0.5">
              {isEn ? "Enter your lab values to see what they mean" : "अपने लैब मान दर्ज करें और जानें उनका अर्थ"}
            </p>
          </div>
        </div>
      </div>

      {!isOpen && (
        <div className="p-6 text-center">
          <Activity className="w-14 h-14 text-[#1D9E75]/30 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-5">
            {isEn
              ? "Downloaded your report but unsure what the numbers mean? We'll help you understand."
              : "अपनी रिपोर्ट डाउनलोड की लेकिन नंबरों का मतलब समझ नहीं आया? हम आपकी मदद करेंगे।"}
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 bg-[#1D9E75] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#1D9E75]/30 hover:bg-[#1D9E75]/90 hover:shadow-xl hover:shadow-[#1D9E75]/40 transition-all duration-200"
          >
            <Info className="w-5 h-5" />
            {isEn ? "Understand your report" : "अपनी रिपोर्ट समझें"}
          </button>
        </div>
      )}

      {isOpen && (
        <div className="p-6">
          {resultList.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-[#1D9E75]" />
                <span className="text-sm font-bold text-gray-600">
                  {isEn ? `Results checked (${resultList.length})` : `जांचे गए परिणाम (${resultList.length})`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {resultList.map((item, idx) => (
                  <button
                    key={item.timestamp}
                    onClick={() => setCurrentResult(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      currentResult?.timestamp === item.timestamp
                        ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {item.testName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                {isEn ? 'Test Parameter' : 'टेस्ट पैरामीटर'}
              </label>
              <select
                value={selectedTest}
                onChange={e => { setSelectedTest(e.target.value); setCurrentResult(null); }}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:border-[#1D9E75] focus:outline-none transition-all"
              >
                <option value="">{isEn ? 'Select a test...' : 'एक टेस्ट चुनें...'}</option>
                {testNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                {isEn ? 'Your Value' : 'आपका मान'}
              </label>
              <input
                type="number"
                step="any"
                value={resultValue}
                onChange={e => { setResultValue(e.target.value); setCurrentResult(null); }}
                placeholder={isEn ? 'Enter your result...' : 'अपना परिणाम दर्ज करें...'}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:border-[#1D9E75] focus:outline-none transition-all"
              />
            </div>
          </div>

          {selectedTest && TEST_RANGES[selectedTest]?.male && TEST_RANGES[selectedTest]?.female && (
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                {isEn ? 'Gender' : 'लिंग'}
              </label>
              <div className="flex gap-2">
                {['male', 'female'].map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                      gender === g
                        ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {isEn ? (g === 'male' ? 'Male' : 'Female') : (g === 'male' ? 'पुरुष' : 'महिला')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!selectedTest || resultValue === ''}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                selectedTest && resultValue !== ''
                  ? 'bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/30 hover:bg-[#1D9E75]/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Activity className="w-4 h-4" />
              {isEn ? 'Analyze Result' : 'परिणाम विश्लेषण करें'}
            </button>
            {currentResult && (
              <button
                onClick={clearForm}
                className="px-5 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all"
              >
                {isEn ? 'Clear' : 'साफ़ करें'}
              </button>
            )}
          </div>

          {currentResult && (
            <div className="mt-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{currentResult.testName}</h3>
                    <p className="text-xs text-gray-400">
                      {isEn ? `Gender: ${currentResult.gender === 'male' ? 'Male' : 'Female'}` : `लिंग: ${currentResult.gender === 'male' ? 'पुरुष' : 'महिला'}`}
                    </p>
                  </div>
                  <StatusBadge result={currentResult.result} lang={language} />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">
                      {isEn ? 'Your Value' : 'आपका मान'}
                    </p>
                    <p className="text-xl font-bold text-gray-800">{currentResult.value} <span className="text-xs font-medium text-gray-400">{currentResult.unit}</span></p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">
                      {isEn ? 'Normal Range' : 'सामान्य सीमा'}
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {currentResult.range.low} – {currentResult.range.high} <span className="text-xs font-medium text-gray-400">{currentResult.unit}</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">
                      {isEn ? 'Difference' : 'अंतर'}
                    </p>
                    <p className={`text-xl font-bold ${
                      currentResult.result.color === 'green' ? 'text-green-600' :
                      currentResult.result.color === 'amber' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {currentResult.result.color === 'green' ? '✓' : currentResult.value > currentResult.range.high ? `+${(currentResult.value - currentResult.range.high).toFixed(1)}` : (currentResult.value - currentResult.range.low).toFixed(1)}
                    </p>
                  </div>
                </div>

                <RangeBar value={currentResult.value} low={currentResult.range.low} high={currentResult.range.high} />

                <div className="mt-5 bg-blue-50/80 rounded-xl px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-blue-700 leading-relaxed">
                      {isEn ? TEST_RANGES[currentResult.testName]?.description : TEST_RANGES[currentResult.testName]?.descriptionHi}
                    </p>
                  </div>
                </div>

                {currentResult.result.color !== 'green' && (
                  <div className="mt-3 bg-red-50/80 rounded-xl px-4 py-3 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs font-bold text-red-700 leading-relaxed">
                        {isEn
                          ? 'Your result is out of the normal range. Please consult your doctor for medical advice.'
                          : 'आपका परिणाम सामान्य सीमा से बाहर है। कृपया चिकित्सीय सलाह के लिए अपने डॉक्टर से परामर्श करें।'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`mt-6 ${resultList.length > 0 ? 'border-t border-gray-100 pt-5' : ''}`}>
            {resultList.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-600 mb-3">
                  {isEn ? `All Results (${resultList.length})` : `सभी परिणाम (${resultList.length})`}
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {resultList.map((item, idx) => (
                    <button
                      key={item.timestamp}
                      onClick={() => setCurrentResult(item)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
                        currentResult?.timestamp === item.timestamp
                          ? 'border-[#1D9E75] bg-[#1D9E75]/5'
                          : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400">{idx + 1}.</span>
                        <span className="text-sm font-bold text-gray-700">{item.testName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-500">
                          {item.value} {item.unit}
                        </span>
                        <StatusBadge result={item.result} lang={language} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs font-medium text-amber-700 leading-relaxed">
                  {isEn
                    ? 'This is for educational purposes only, not medical advice. Always consult your doctor.'
                    : 'यह केवल शैक्षिक उद्देश्यों के लिए है, चिकित्सा सलाह नहीं। हमेशा अपने डॉक्टर से परामर्श करें।'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportExplainer;
