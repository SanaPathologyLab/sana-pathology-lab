import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search, Activity, Heart, Check, Plus, ArrowRight, Stethoscope } from 'lucide-react';
import { TESTS_DATA } from '../data/testsData';

const SYMPTOMS = [
  { id: 'fever', label: '🤒 Fever / बुखार', tests: ['CBC', 'MP', 'DENGUE-01', 'WIDAL1'] },
  { id: 'fatigue', label: '😴 Fatigue / थकान', tests: ['CBC', 'TFT', 'VITD', 'HB-01', 'FBS'] },
  { id: 'frequent-urination', label: '🚽 Frequent Urination / बार-बार पेशाब', tests: ['FBS', 'HBA1C', 'KFT', 'URINE'] },
  { id: 'hair-loss', label: '💇 Hair Loss / बाल झड़ना', tests: ['TFT', 'VITD', 'CBC', 'HB-01'] },
  { id: 'weight-loss', label: '⚖️ Weight Loss / वजन कम होना', tests: ['TFT', 'FBS', 'CBC', 'LFT', 'HBA1C'] },
  { id: 'weight-gain', label: '📈 Weight Gain / वजन बढ़ना', tests: ['TFT', 'FBS', 'LIPID'] },
  { id: 'joint-pain', label: '🦴 Joint Pain / जोड़ों का दर्द', tests: ['URIC_ACID', 'RF', 'CRP-QUANT-01', 'VITD', 'ESR-01'] },
  { id: 'chest-pain', label: '💔 Chest Pain / सीने में दर्द', tests: ['LIPID', 'CBC', 'SGOT', 'LFT', 'FBS'] },
  { id: 'abdominal-pain', label: '🤰 Abdominal Pain / पेट दर्द', tests: ['LFT', 'KFT', 'URINE', 'CBC', 'LIPID'] },
  { id: 'skin-rash', label: '🔴 Skin Rash / त्वचा पर चकत्ते', tests: ['DENGUE-01', 'CBC', 'CRP-01'] },
  { id: 'cough', label: '🤧 Cough / खांसी', tests: ['CBC', 'MANTOUX-01', 'ESR-01', 'CRP-QUANT-01'] },
  { id: 'headache', label: '🤕 Headache / सिरदर्द', tests: ['CBC', 'FBS', 'LIPID', 'TFT'] },
  { id: 'nausea', label: '🤢 Nausea / मिचली', tests: ['LFT', 'CBC', 'KFT', 'FBS'] },
  { id: 'vision-problems', label: '👁️ Vision Issues / आँखों की समस्या', tests: ['FBS', 'HBA1C', 'TFT', 'LIPID'] },
  { id: 'sleep-problems', label: '🛏️ Sleep Issues / नींद की समस्या', tests: ['TFT', 'FBS', 'CBC', 'VITD'] },
  { id: 'menstrual-issues', label: '🩸 Irregular Periods / अनियमित मासिक धर्म', tests: ['TFT', 'CBC', 'HB-01', 'FBS'] },
  { id: 'swelling', label: '🦶 Swelling (Feet/Face) / सूजन', tests: ['KFT', 'URINE', 'TFT', 'CBC'] },
  { id: 'back-pain', label: '💪 Back Pain / पीठ दर्द', tests: ['ESR-01', 'CRP-QUANT-01', 'CBC', 'CALCIUM-01'] },
  { id: 'anxiety', label: '😰 Anxiety / घबराहट', tests: ['TFT', 'FBS', 'CBC', 'LIPID'] },
  { id: 'dry-skin', label: '🧴 Dry Skin / सूखी त्वचा', tests: ['TFT', 'CBC', 'VITD'] },
];

const EXPLANATIONS = {
  CBC: {
    en: 'Complete blood count helps detect infections, anemia, and blood disorders.',
    hi: 'पूर्ण रक्त गणना संक्रमण, एनीमिया और रक्त विकारों का पता लगाने में मदद करती है।',
  },
  MP: {
    en: 'Malaria parasite test checks for malaria infection.',
    hi: 'मलेरिया परजीवी परीक्षण मलेरिया संक्रमण की जांच करता है।',
  },
  'DENGUE-01': {
    en: 'Dengue profile screens for dengue virus infection (NS1, IgM, IgG).',
    hi: 'डेंगू प्रोफाइल डेंगू वायरस संक्रमण की जांच करता है (NS1, IgM, IgG)।',
  },
  WIDAL1: {
    en: 'Widal test detects typhoid fever caused by Salmonella bacteria.',
    hi: 'विडाल टेस्ट साल्मोनेला बैक्टीरिया से होने वाले टाइफाइड बुखार का पता लगाता है।',
  },
  TFT: {
    en: 'Thyroid function test evaluates thyroid gland activity, often linked to fatigue and weight changes.',
    hi: 'थायराइड फंक्शन टेस्ट थायराइड ग्रंथि गतिविधि का मूल्यांकन करता है, जो थकान और वजन परिवर्तन से जुड़ा है।',
  },
  VITD: {
    en: 'Vitamin D test checks for deficiency that can cause bone pain, fatigue, and hair loss.',
    hi: 'विटामिन डी परीक्षण कमी की जांच करता है जो हड्डियों में दर्द, थकान और बाल झड़ने का कारण बन सकती है।',
  },
  'HB-01': {
    en: 'Hemoglobin test measures oxygen-carrying capacity; low levels cause fatigue.',
    hi: 'हीमोग्लोबिन परीक्षण रक्त की ऑक्सीजन वहन क्षमता मापता है; निम्न स्तर थकान का कारण बनता है।',
  },
  FBS: {
    en: 'Fasting blood sugar measures glucose levels to screen for diabetes.',
    hi: 'उपवास रक्त शर्करा मधुमेह की जांच के लिए ग्लूकोज स्तर को मापता है।',
  },
  HBA1C: {
    en: 'HbA1c reflects average blood sugar control over the past 3 months.',
    hi: 'HbA1c पिछले 3 महीनों में औसत रक्त शर्करा नियंत्रण को दर्शाता है।',
  },
  KFT: {
    en: 'Kidney function test evaluates how well your kidneys are working.',
    hi: 'किडनी फंक्शन टेस्ट मूल्यांकन करता है कि आपकी किडनी कितनी अच्छी तरह काम कर रही है।',
  },
  URINE: {
    en: 'Urine examination screens for urinary tract infections and kidney issues.',
    hi: 'मूत्र परीक्षण मूत्र पथ के संक्रमण और किडनी की समस्याओं की जांच करता है।',
  },
  LFT: {
    en: 'Liver function test checks liver health and detects liver damage.',
    hi: 'लिवर फंक्शन टेस्ट लिवर की सेहत की जांच करता है और लिवर क्षति का पता लगाता है।',
  },
  URIC_ACID: {
    en: 'Uric acid test helps diagnose gout and monitor kidney function.',
    hi: 'यूरिक एसिड परीक्षण गाउट का निदान करने और किडनी कार्य की निगरानी में मदद करता है।',
  },
  RF: {
    en: 'Rheumatoid factor test helps diagnose rheumatoid arthritis causing joint pain.',
    hi: 'रूमेटॉइड फैक्टर टेस्ट जोड़ों के दर्द का कारण बनने वाले रूमेटॉइड आर्थराइटिस का निदान करने में मदद करता है।',
  },
  'CRP-QUANT-01': {
    en: 'CRP quantitative measures inflammation levels linked to joint pain and swelling.',
    hi: 'सीआरपी क्वांटिटेटिव जोड़ों के दर्द और सूजन से जुड़े सूजन स्तर को मापता है।',
  },
  LIPID: {
    en: 'Lipid profile measures cholesterol levels to assess heart disease risk.',
    hi: 'लिपिड प्रोफाइल हृदय रोग के जोखिम का आकलन करने के लिए कोलेस्ट्रॉल स्तर को मापता है।',
  },
  SGOT: {
    en: 'SGOT (AST) is an enzyme that helps detect liver or heart muscle damage.',
    hi: 'SGOT (AST) एक एंजाइम है जो लिवर या हृदय की मांसपेशियों की क्षति का पता लगाने में मदद करता है।',
  },
  'CRP-01': {
    en: 'CRP test detects inflammation that may indicate infection or autoimmune disease.',
    hi: 'सीआरपी परीक्षण सूजन का पता लगाता है जो संक्रमण या ऑटोइम्यून बीमारी का संकेत हो सकता है।',
  },
  'ESR-01': {
    en: 'ESR measures inflammation and is useful for monitoring infections and inflammatory conditions.',
    hi: 'ईएसआर सूजन को मापता है और संक्रमण तथा सूजन संबंधी स्थितियों की निगरानी के लिए उपयोगी है।',
  },
  'CALCIUM-01': {
    en: 'Calcium test evaluates bone health, muscle function, and nerve transmission.',
    hi: 'कैल्शियम परीक्षण हड्डी के स्वास्थ्य, मांसपेशी कार्य और तंत्रिका संचरण का मूल्यांकन करता है।',
  },
};

const getExplanation = (code, isEn) => {
  if (EXPLANATIONS[code]) {
    return isEn ? EXPLANATIONS[code].en : EXPLANATIONS[code].hi;
  }
  return isEn
    ? 'This test helps evaluate your health condition.'
    : 'यह परीक्षण आपकी स्वास्थ्य स्थिति का मूल्यांकन करने में मदद करता है।';
};

const getEmoji = (label) => label.split(' ')[0];

const getLabelEn = (label) => {
  const rest = label.replace(/^[^\s]+\s/, '');
  return rest.split(' /')[0];
};

const getLabelHi = (label) => {
  const rest = label.replace(/^[^\s]+\s/, '');
  return rest.split('/ ')[1] || rest.split(' /')[0];
};

const SymptomFinder = ({ onAddTest }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [addedTests, setAddedTests] = useState({});

  const toggleSymptom = (id) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    if (showResults) setShowResults(false);
  };

  const handleFindTests = () => {
    if (selectedSymptoms.length > 0) setShowResults(true);
  };

  const recommendedTests = useMemo(() => {
    if (!showResults) return [];

    const testCodeCount = {};
    const selectedSymptomData = SYMPTOMS.filter((s) =>
      selectedSymptoms.includes(s.id)
    );

    selectedSymptomData.forEach((symptom) => {
      symptom.tests.forEach((code) => {
        testCodeCount[code] = (testCodeCount[code] || 0) + 1;
      });
    });

    const uniqueCodes = Object.keys(testCodeCount);

    return uniqueCodes
      .map((code) => {
        const testData = TESTS_DATA.find((t) => t.code === code);
        if (!testData) return null;
        const symptomCount = testCodeCount[code];
        const coveredSymptomLabels = selectedSymptomData
          .filter((s) => s.tests.includes(code))
          .map((s) => s.label);
        return {
          ...testData,
          symptomCount,
          coveredSymptomLabels,
          explanation: getExplanation(code, isEn),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.symptomCount - a.symptomCount);
  }, [selectedSymptoms, showResults, isEn]);

  const handleAddTest = (test) => {
    setAddedTests((prev) => ({ ...prev, [test.code]: true }));
    if (onAddTest) onAddTest(test);
  };

  const totalPrice = recommendedTests.reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#1D9E75] to-[#1D9E75]/90 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2.5">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white text-lg font-bold leading-tight">
              {isEn ? "Not sure which test to take? Tell us your symptoms." : "कौन सा टेस्ट लेना है यकीन नहीं है? अपने लक्षण बताएं।"}
            </h2>
            <p className="text-white/80 text-sm mt-0.5">
              {isEn ? "Select your symptoms below and we'll recommend relevant tests." : "नीचे अपने लक्षण चुनें और हम प्रासंगिक टेस्ट सुझाएंगे।"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SYMPTOMS.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            return (
              <button
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-[#1D9E75] bg-[#1D9E75]/5 shadow-md shadow-[#1D9E75]/10'
                    : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-100/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-[#1D9E75] rounded-full p-0.5">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <span className="text-2xl">{getEmoji(symptom.label)}</span>
                <span className="text-xs font-semibold text-center text-gray-700 leading-tight">
                  {isEn ? getLabelEn(symptom.label) : getLabelHi(symptom.label)}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleFindTests}
          disabled={selectedSymptoms.length === 0}
          className={`mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
            selectedSymptoms.length > 0
              ? 'bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/30 hover:bg-[#1D9E75]/90 hover:shadow-xl hover:shadow-[#1D9E75]/40'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span>
            {isEn
              ? `Find Tests (${selectedSymptoms.length} symptom${selectedSymptoms.length !== 1 ? 's' : ''} selected)`
              : `टेस्ट खोजें (${selectedSymptoms.length} लक्षण चुने गए)`}
          </span>
        </button>

        {selectedSymptoms.length > 0 && !showResults && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedSymptoms.map((id) => {
              const symptom = SYMPTOMS.find((s) => s.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-bold px-3 py-1.5 rounded-full"
                >
                  {getEmoji(symptom.label)}
                  <span>{isEn ? getLabelEn(symptom.label) : getLabelHi(symptom.label)}</span>
                </span>
              );
            })}
          </div>
        )}

        {showResults && recommendedTests.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#1D9E75]" />
                <h3 className="text-lg font-bold text-gray-800">
                  {isEn ? 'Recommended Tests' : 'अनुशंसित टेस्ट'}
                </h3>
              </div>
              <span className="text-sm font-bold text-gray-500">
                {isEn
                  ? `${recommendedTests.length} test${recommendedTests.length !== 1 ? 's' : ''} found`
                  : `${recommendedTests.length} टेस्ट मिले`}
              </span>
            </div>

            <div className="space-y-3">
              {recommendedTests.map((test) => {
                const isMultiSymptom = test.symptomCount > 1;
                const isAdded = addedTests[test.code];
                return (
                  <div
                    key={test.code}
                    className={`relative rounded-xl border-2 transition-all duration-200 ${
                      isMultiSymptom
                        ? 'border-amber-300 bg-amber-50/50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {isMultiSymptom && (
                      <div className="absolute -top-3 left-4 bg-amber-400 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                        {isEn
                          ? `Covers ${test.symptomCount} symptoms`
                          : `${test.symptomCount} लक्षणों को कवर करता है`}
                      </div>
                    )}

                    <div className="p-4 pt-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm">
                            {test.testName}
                          </h4>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">
                            {test.code}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-[#1D9E75] shrink-0">
                          ₹{test.price}
                        </span>
                      </div>

                      {test.symptomCount > 1 && test.coveredSymptomLabels && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {test.coveredSymptomLabels.map((label, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                            {isEn ? 'Sample' : 'सैंपल'}
                          </p>
                          <p className="text-xs font-bold text-gray-700">
                            {test.sampleType}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                            {isEn ? 'Category' : 'श्रेणी'}
                          </p>
                          <p className="text-xs font-bold text-gray-700">
                            {test.category?.name || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 bg-blue-50/80 rounded-lg px-3 py-2">
                        <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide">
                          {isEn ? 'Preparation' : 'तैयारी'}
                        </p>
                        <p className="text-xs font-medium text-blue-700">
                          {test.preparation}
                        </p>
                      </div>

                      <div className="mt-2 bg-purple-50/80 rounded-lg px-3 py-2">
                        <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wide">
                          {isEn ? 'Why this test?' : 'यह टेस्ट क्यों?'}
                        </p>
                        <p className="text-xs font-medium text-purple-700">
                          {test.explanation}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddTest({ ...test })}
                        disabled={isAdded}
                        className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                          isAdded
                            ? 'bg-green-100 text-green-600 cursor-default'
                            : 'bg-[#1D9E75] text-white hover:bg-[#1D9E75]/90 shadow-sm'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{isEn ? 'Added to Booking' : 'बुकिंग में जोड़ा गया'}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>{isEn ? 'Add to Booking' : 'बुकिंग में जोड़ें'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between bg-gray-100 rounded-xl px-5 py-3">
              <span className="text-sm font-bold text-gray-600">
                {isEn ? 'Total Estimated Cost' : 'कुल अनुमानित लागत'}
              </span>
              <span className="text-xl font-bold text-[#1D9E75]">₹{totalPrice}</span>
            </div>

            <button
              onClick={() => {
                recommendedTests.forEach((test) => {
                  if (!addedTests[test.code]) handleAddTest({ ...test });
                });
              }}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1D9E75]/10 text-[#1D9E75] font-bold text-sm hover:bg-[#1D9E75]/20 transition-all duration-200 border-2 border-[#1D9E75]/20"
            >
              <ArrowRight className="w-4 h-4" />
              <span>
                {isEn
                  ? 'Add All Recommended Tests to Booking'
                  : 'सभी अनुशंसित टेस्ट बुकिंग में जोड़ें'}
              </span>
            </button>
          </div>
        )}

        {showResults && recommendedTests.length === 0 && (
          <div className="mt-8 text-center py-10">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">
              {isEn
                ? 'No matching tests found for selected symptoms.'
                : 'चयनित लक्षणों के लिए कोई टेस्ट नहीं मिला।'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomFinder;
