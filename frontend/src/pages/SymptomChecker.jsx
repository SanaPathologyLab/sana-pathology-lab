import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Utensils, Bone, Eye, Activity, Search, Check, ChevronRight, ChevronLeft, AlertCircle, Info, ShoppingCart, ArrowRight, Sparkles, MessageCircle, Loader2 } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const BODY_PARTS = [
  { id: 'head', label: 'Head / Neck', icon: Brain, symptoms: ['headache', 'dizziness', 'eye issues', 'hair loss', 'swelling in neck'] },
  { id: 'chest', label: 'Chest', icon: Heart, symptoms: ['cough', 'chest pain', 'palpitations', 'shortness of breath'] },
  { id: 'abdomen', label: 'Abdomen', icon: Utensils, symptoms: ['stomach pain', 'nausea', 'jaundice', 'burning urination', 'diarrhea'] },
  { id: 'joints', label: 'Joints', icon: Bone, symptoms: ['joint pain', 'morning stiffness', 'swelling', 'back pain'] },
  { id: 'skin', label: 'Skin', icon: Eye, symptoms: ['rash', 'itching', 'bruising', 'yellowing'] },
  { id: 'general', label: 'General', icon: Activity, symptoms: ['fever', 'fatigue', 'weight loss', 'weight gain', 'weakness'] },
];

const SYMPTOM_OPTIONS = {
  head: ['headache', 'dizziness', 'eye issues', 'hair loss', 'swelling in neck'],
  chest: ['cough', 'chest pain', 'palpitations', 'shortness of breath'],
  abdomen: ['stomach pain', 'nausea', 'jaundice', 'burning urination', 'diarrhea'],
  joints: ['joint pain', 'morning stiffness', 'swelling', 'back pain'],
  skin: ['rash', 'itching', 'bruising', 'yellowing'],
  general: ['fever', 'fatigue', 'weight loss', 'weight gain', 'weakness'],
};

const DURATION_OPTIONS = [
  { value: 'less-than-3', label: 'Less than 3 days / 3 din se kam' },
  { value: '3-7', label: '3-7 days / 3-7 din' },
  { value: '1-2-weeks', label: '1-2 weeks / 1-2 hafte' },
  { value: '2-4-weeks', label: '2-4 weeks / 2-4 hafte' },
  { value: 'more-than-1-month', label: 'More than 1 month / 1 mahine se zyada' },
];

const SYMPTOM_MAP = {
  fever: { tests: ['CBC', 'MP', 'DENGUE-01'], desc: 'Bukhar hai toh CBC aur infection tests recommend kiye hain.' },
  'chest pain': { tests: ['CBC', 'SGOT', 'LFT', 'LIPID'], desc: 'Chest pain mein heart aur liver tests recommend kiye hain.' },
  cough: { tests: ['CBC', 'MANTOUX-01', 'ESR-01'], desc: 'Cough ke liye CBC aur TB screening.' },
  headache: { tests: ['CBC', 'TFT'], desc: 'Sir dard ke liye basic tests.' },
  fatigue: { tests: ['CBC', 'HB-01', 'VITD', 'VITB12', 'TFT'], desc: 'Thakan ke liye anemia aur vitamin tests.' },
  'weight loss': { tests: ['TFT', 'FBS', 'HBA1C'], desc: 'Weight loss mein thyroid aur sugar check karein.' },
  'weight gain': { tests: ['TFT', 'FBS', 'LIPID'], desc: 'Weight gain mein thyroid aur lipid profile.' },
  'joint pain': { tests: ['URIC_ACID', 'RF', 'CRP-QUANT-01', 'ESR-01'], desc: 'Joint pain mein gout aur arthritis tests.' },
  'stomach pain': { tests: ['LFT', 'URINE', 'CBC'], desc: 'Pet dard mein liver aur urine tests.' },
  jaundice: { tests: ['LFT', 'BILIRUBIN-TOTAL-01', 'SGOT-SGPT', 'CBC'], desc: 'Piliya (jaundice) ke liye liver function tests.' },
  'burning urination': { tests: ['URINE', 'CBC', 'KFT'], desc: 'Jalan ke liye urine aur kidney tests.' },
  rash: { tests: ['CBC', 'DENGUE-01'], desc: 'Daane ke liye CBC aur dengue test.' },
  dizziness: { tests: ['CBC', 'HB-01', 'FBS'], desc: 'Chakkar ke liye anemia aur sugar test.' },
  palpitations: { tests: ['TFT', 'CBC', 'HB-01'], desc: 'Dhadkan tez hone par thyroid check.' },
  'hair loss': { tests: ['TFT', 'VITD', 'VITB12'], desc: 'Baal jhadne par thyroid aur vitamin tests.' },
  'swelling in neck': { tests: ['TFT'], desc: 'Gale mein swelling — thyroid test karein.' },
  'morning stiffness': { tests: ['RF', 'CRP-QUANT-01', 'ESR-01'], desc: 'Subah akhrepan ke liye arthritis tests.' },
  nausea: { tests: ['LFT', 'CBC'], desc: 'Jee michaane ke liye liver tests.' },
  diarrhea: { tests: ['CBC', 'URINE', 'KFT'], desc: 'Dast ke liye basic tests.' },
  'back pain': { tests: ['KFT', 'URINE', 'CALCIUM-01'], desc: 'Kam dard ke liye kidney tests.' },
  itching: { tests: ['LFT', 'CBC'], desc: 'Khujli ke liye liver tests.' },
  bruising: { tests: ['CBC', '015', 'PT-01'], desc: 'Khoon ke liye CBC aur clotting tests.' },
  'yellowing': { tests: ['LFT', 'BILIRUBIN-TOTAL-01'], desc: 'Peela pan — liver tests karein.' },
  'eye issues': { tests: ['FBS', 'HBA1C', 'TFT'], desc: 'Ankhon ki samasya ke liye sugar aur thyroid tests.' },
  'shortness of breath': { tests: ['CBC', 'TFT', 'LIPID'], desc: 'Saans phoolne par heart aur thyroid tests.' },
  weakness: { tests: ['CBC', 'HB-01', 'VITD', 'VITB12'], desc: 'Kamzori ke liye anemia aur vitamin tests.' },
  swelling: { tests: ['KFT', 'URINE', 'TFT'], desc: 'Sujan ke liye kidney aur thyroid tests.' },
};

const TEST_CATALOGUE = {
  TFT: { testName: 'Thyroid Function Test (T3, T4, TSH)', price: 450, preparation: 'No fasting required, morning sample preferred' },
  TFT01: { testName: 'Thyroid Profile (T3, T4, TSH)', price: 500, preparation: 'No fasting required, morning sample preferred' },
  HBA1C: { testName: 'HbA1c (Glycosylated Haemoglobin)', price: 400, preparation: 'No fasting required' },
  FBS: { testName: 'Fasting Blood Sugar (FBS)', price: 100, preparation: 'Fast for 8-10 hours, water allowed' },
  CBC: { testName: 'Complete Blood Count (CBC)', price: 200, preparation: 'No fasting required' },
  'HB-01': { testName: 'Hemoglobin (Hb)', price: 100, preparation: 'No fasting required' },
  'ESR-01': { testName: 'ESR (Erythrocyte Sedimentation Rate)', price: 150, preparation: 'No fasting required' },
  'PT-01': { testName: 'Prothrombin Time (PT)', price: 250, preparation: 'No fasting required' },
  '015': { testName: 'Platelets Count', price: 100, preparation: 'No fasting required' },
  LFT: { testName: 'Liver Function Test (LFT)', price: 500, preparation: 'No fasting required' },
  SGOT: { testName: 'SGOT (AST)', price: 100, preparation: 'No fasting required' },
  'SGOT-SGPT': { testName: 'SGOT-SGPT (Combined)', price: 250, preparation: 'No fasting required' },
  'BILIRUBIN-TOTAL-01': { testName: 'Total Bilirubin', price: 150, preparation: 'No fasting required' },
  KFT: { testName: 'Kidney Function Test (KFT)', price: 500, preparation: 'No fasting required' },
  URIC_ACID: { testName: 'Serum Uric Acid', price: 100, preparation: 'No fasting required' },
  'CALCIUM-01': { testName: 'Serum Calcium', price: 200, preparation: 'No fasting required' },
  LIPID: { testName: 'Lipid Profile', price: 650, preparation: 'Fast for 10-12 hours' },
  'CRP-QUANT-01': { testName: 'CRP - C-Reactive Protein (Quantitative)', price: 350, preparation: 'No fasting required' },
  URINE: { testName: 'Urine Examination (Routine & Microscopy)', price: 150, preparation: 'Morning sample preferred' },
  RF: { testName: 'Rheumatoid Factor', price: 350, preparation: 'No fasting required' },
  MP: { testName: 'Malaria (MP) ELISA', price: 100, preparation: 'No fasting required' },
  'DENGUE-01': { testName: 'Dengue Profile (IgG, IgM, NS1)', price: 1200, preparation: 'No fasting required' },
  'MANTOUX-01': { testName: 'Mantoux Test (Tuberculin Skin Test)', price: 250, preparation: 'No fasting required' },
  VITD: { testName: 'Vitamin D (25-OH)', price: 800, preparation: 'No fasting required' },
  VITB12: { testName: 'Vitamin B12', price: 600, preparation: 'No fasting required' },
};

const getTestInfo = (code) => {
  return TEST_CATALOGUE[code] || { testName: code, price: 150, preparation: 'Consult lab for preparation instructions' };
};

const SYMPTOM_LABELS = {
  fever: '🤒 Fever / Bukhar',
  'chest pain': '💔 Chest Pain / Seene mein dard',
  cough: '🤧 Cough / Khansi',
  headache: '🤕 Headache / Sir dard',
  fatigue: '😴 Fatigue / Thakan',
  'weight loss': '⚖️ Weight Loss / Vajan kam hona',
  'weight gain': '📈 Weight Gain / Vajan badhna',
  'joint pain': '🦴 Joint Pain / Jodon ka dard',
  'stomach pain': '🤰 Stomach Pain / Pet dard',
  jaundice: '🟡 Jaundice / Piliya',
  'burning urination': '🔥 Burning Urination / Jalan',
  rash: '🔴 Rash / Daane',
  dizziness: '😵 Dizziness / Chakkar',
  palpitations: '💓 Palpitations / Dhadkan',
  'hair loss': '💇 Hair Loss / Baal jhadna',
  'swelling in neck': '🦒 Swelling in Neck / Gale mein sujan',
  'morning stiffness': '🌅 Morning Stiffness / Subah akhrepan',
  nausea: '🤢 Nausea / Jee michaana',
  diarrhea: '🚽 Diarrhea / Dast',
  'back pain': '💪 Back Pain / Kam dard',
  itching: '😖 Itching / Khujli',
  bruising: '🩸 Bruising / Khoon',
  'yellowing': '🟡 Yellowing / Peela pan',
  'eye issues': '👁️ Eye Issues / Ankhon ki samasya',
  'shortness of breath': '🫁 Shortness of Breath / Saans phoolna',
  weakness: '😩 Weakness / Kamzori',
  swelling: '🦶 Swelling / Sujan',
};

const WHATSAPP_NUMBER = '916396786939';
const WHATSAPP_MESSAGE = 'Hi%20Sana%20Pathology%2C%20I%20need%20help%20with%20the%20Symptom%20Checker.';

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [duration, setDuration] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sana_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [addedTests, setAddedTests] = useState({});

  useEffect(() => {
    localStorage.setItem('sana_cart', JSON.stringify(cart));
  }, [cart]);

  const handleBodyPartSelect = (id) => {
    setSelectedBodyPart(id);
    setSelectedSymptoms([]);
    setShowResults(false);
    setStep(2);
    if (window.gtag) {
      window.gtag('event', 'symptom_checker_body_part', { body_part: id });
    }
  };

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleNextStep = () => {
    if (step === 2 && selectedSymptoms.length === 0) return;
    setStep((prev) => Math.min(prev + 1, 4));
    if (window.gtag) {
      window.gtag('event', 'symptom_checker_step', { step: step + 1 });
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCheckTests = () => {
    if (!age || !gender) return;
    setShowResults(true);
    setStep(5);
    if (window.gtag) {
      window.gtag('event', 'symptom_checker_results', {
        symptoms: selectedSymptoms.join(','),
        duration,
        age,
        gender,
      });
    }
  };

  const recommendedTests = useMemo(() => {
    if (!showResults || selectedSymptoms.length === 0) return { tests: [], description: '' };

    const testCodeCount = {};
    const descriptions = [];

    selectedSymptoms.forEach((symptom) => {
      const mapping = SYMPTOM_MAP[symptom];
      if (mapping) {
        descriptions.push(mapping.desc);
        mapping.tests.forEach((code) => {
          testCodeCount[code] = (testCodeCount[code] || 0) + 1;
        });
      }
    });

    const uniqueCodes = Object.keys(testCodeCount);
    const tests = uniqueCodes
      .map((code) => {
        const info = getTestInfo(code);
        const symptomCount = testCodeCount[code];
        return {
          code,
          testName: info.testName,
          price: info.price,
          preparation: info.preparation,
          symptomCount,
        };
      })
      .sort((a, b) => b.symptomCount - a.symptomCount);

    return {
      tests,
      description: [...new Set(descriptions)].join(' '),
    };
  }, [selectedSymptoms, showResults]);

  const addToCart = (test) => {
    const exists = cart.some((item) => item.testCode === test.code);
    if (exists) return;
    const newItem = {
      name: test.testName,
      price: test.price,
      testCode: test.code,
      isPackage: false,
    };
    setCart((prev) => [...prev, newItem]);
    setAddedTests((prev) => ({ ...prev, [test.code]: true }));
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: test.price,
        items: [{ item_id: test.code, item_name: test.testName, price: test.price }],
      });
    }
  };

  const addAllToCart = () => {
    recommendedTests.tests.forEach((test) => {
      if (!addedTests[test.code]) {
        addToCart(test);
      }
    });
  };

  const totalPrice = recommendedTests.tests.reduce((sum, t) => sum + t.price, 0);

  const handleWhatsAppHelp = () => {
    const symptomText = selectedSymptoms.map((s) => SYMPTOM_LABELS[s] || s).join(', ');
    const msg = `Hi%20Sana%20Pathology%2C%20I%20used%20your%20Symptom%20Checker%20and%20got%20these%20recommendations.%20I%20need%20help%20with%20booking.%0A%0ASymptoms%3A%20${encodeURIComponent(symptomText)}%0AAge%3A%20${age}%0AGender%3A%20${gender}%0ADuration%3A${duration ? `%20${encodeURIComponent(DURATION_OPTIONS.find((d) => d.value === duration)?.label || duration)}` : ''}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    if (window.gtag) {
      window.gtag('event', 'whatsapp_help', { page: 'symptom_checker' });
    }
  };

  const currentSymptoms = selectedBodyPart ? SYMPTOM_OPTIONS[selectedBodyPart] || [] : [];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step === s
                ? 'bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/30 scale-110'
                : step > s
                  ? 'bg-[#1D9E75]/20 text-[#1D9E75]'
                  : 'bg-gray-100 text-gray-400'
            }`}
          >
            {step > s ? <Check className="w-4 h-4" /> : s}
          </div>
          {s < 4 && (
            <div
              className={`w-8 h-0.5 rounded-full transition-colors duration-300 ${
                step > s ? 'bg-[#1D9E75]' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderHero = () => (
    <div className="bg-gradient-to-br from-[#085041] to-[#0F6E56] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/20 mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered &bull; Free Tool
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
          Symptom Checker &mdash; Know Which Test You Need
        </h1>
        <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
          Apne symptoms ke basis par recommended tests jaaniye. Yeh general suggestion hai, doctor se zaroor milein.
        </p>
      </div>
    </div>
  );

  const renderBodyMap = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Step 1: Select Your Body Area</h2>
      <p className="text-sm text-gray-500 mb-6">Jis body part mein problem hai, usse chunein.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {BODY_PARTS.map((part) => {
          const Icon = part.icon;
          const isSelected = selectedBodyPart === part.id;
          return (
            <button
              key={part.id}
              onClick={() => handleBodyPartSelect(part.id)}
              className={`flex flex-col items-center gap-3 p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-[#1D9E75] bg-[#1D9E75]/5 shadow-md shadow-[#1D9E75]/10'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div
                className={`p-3 rounded-full transition-colors ${
                  isSelected ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-gray-50 text-gray-500'
                }`}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{part.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSymptomSelection = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800">Step 2: Select Your Symptoms</h2>
        <button
          onClick={() => setStep(1)}
          className="text-xs font-semibold text-[#1D9E75] hover:underline"
        >
          Change Body Area
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-5">Apne symptoms chunein (ek ya zyada).</p>

      {selectedSymptoms.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedSymptoms.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-bold px-3 py-1.5 rounded-full"
            >
              {SYMPTOM_LABELS[s]?.split(' ')[0] || '•'} {SYMPTOM_LABELS[s]?.split('/')[0].replace(/^[^\s]+\s/, '') || s}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        {currentSymptoms.map((symptom) => {
          const isSelected = selectedSymptoms.includes(symptom);
          return (
            <button
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75] shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5" />}
              {SYMPTOM_LABELS[symptom]?.split('/')[0] || symptom}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderDurationSelector = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Step 3: Symptoms Duration</h2>
      <p className="text-sm text-gray-500 mb-5">Yeh symptoms kab se hain?</p>
      <select
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-full sm:w-80 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.25rem',
        }}
      >
        <option value="">Select duration / Samay chunein</option>
        {DURATION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderAgeGender = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Step 4: Your Details</h2>
      <p className="text-sm text-gray-500 mb-5">Kripya apni umar aur ling bataein.</p>

      <div className="max-w-xs mb-6">
        <label className="block text-sm font-semibold text-gray-600 mb-2">Age / Umar</label>
        <input
          type="number"
          min="1"
          max="120"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Enter your age"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-sm focus:border-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-3">Gender / Ling</label>
        <div className="flex flex-wrap gap-3">
          {['Male', 'Female', 'Other'].map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`px-6 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                gender === g
                  ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75] shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleCheckTests}
        disabled={!age || !gender}
        className={`mt-8 w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
          age && gender
            ? 'bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/30 hover:bg-[#1D9E75]/90 hover:shadow-xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Search className="w-5 h-5" />
        Check Recommended Tests
      </button>
    </div>
  );

  const renderResults = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800">Your Recommended Tests</h2>
        <button
          onClick={() => {
            setShowResults(false);
            setStep(1);
          }}
          className="text-xs font-semibold text-[#1D9E75] hover:underline"
        >
          Start Over
        </button>
      </div>

      {recommendedTests.description && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700 font-medium">{recommendedTests.description}</p>
          </div>
        </div>
      )}

      {selectedSymptoms.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {selectedSymptoms.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full"
            >
              {SYMPTOM_LABELS[s]?.split(' ')[0] || '•'} {SYMPTOM_LABELS[s]?.split('/')[0].replace(/^[^\s]+\s/, '') || s}
            </span>
          ))}
        </div>
      )}

      {recommendedTests.tests.length > 0 ? (
        <div className="space-y-3 mb-6">
          {recommendedTests.tests.map((test) => {
            const isAdded = addedTests[test.code];
            return (
              <div
                key={test.code}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm">{test.testName}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{test.code}</p>
                  </div>
                  <span className="text-lg font-bold text-[#1D9E75] shrink-0">₹{test.price}</span>
                </div>

                <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Preparation / Taiyari</p>
                  <p className="text-xs font-medium text-gray-700">{test.preparation}</p>
                </div>

                <button
                  onClick={() => addToCart(test)}
                  disabled={isAdded}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    isAdded
                      ? 'bg-green-100 text-green-600 cursor-default'
                      : 'bg-[#1D9E75] text-white hover:bg-[#1D9E75]/90 shadow-sm'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart &mdash; ₹{test.price}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-200 mb-6">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No matching tests found for selected symptoms.</p>
          <button
            onClick={() => {
              setShowResults(false);
              setStep(2);
            }}
            className="mt-4 text-sm font-bold text-[#1D9E75] hover:underline"
          >
            Select different symptoms
          </button>
        </div>
      )}

      {recommendedTests.tests.length > 0 && (
        <>
          <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-600">Total Estimated Cost</span>
              <span className="text-xl font-bold text-[#1D9E75]">₹{totalPrice}</span>
            </div>
          </div>

          <button
            onClick={addAllToCart}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1D9E75]/10 text-[#1D9E75] font-bold text-sm hover:bg-[#1D9E75]/20 transition-all duration-200 border-2 border-[#1D9E75]/20 mb-6"
          >
            <ArrowRight className="w-4 h-4" />
            Add All Recommended Tests to Cart
          </button>
        </>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-amber-800 text-sm mb-1">Need help? / Madad chahiye?</p>
            <p className="text-xs text-amber-700 mb-2">
              Our team can help you book these tests or answer your questions.
            </p>
            <button
              onClick={handleWhatsAppHelp}
              className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#25D366]/90 transition-all shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat on WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Disclaimer:</strong> Yeh general suggestion hai. Sahi diagnosis ke liye apne doctor se zaroor milein. 🙏
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/book-appointment')}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1D9E75] text-white font-bold text-sm hover:bg-[#1D9E75]/90 transition-all shadow-lg shadow-[#1D9E75]/20"
      >
        <ShoppingCart className="w-4 h-4" />
        Proceed to Book Appointment ({cart.length} test{cart.length !== 1 ? 's' : ''} in cart)
      </button>
    </div>
  );

  return (
    <PublicLayout>
      {renderHero()}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
          {step < 5 && renderStepIndicator()}

          {step === 1 && renderBodyMap()}
          {step === 2 && renderSymptomSelection()}
          {step === 3 && renderDurationSelector()}
          {step === 4 && renderAgeGender()}
          {step === 5 && renderResults()}
        </div>

        {step > 1 && step < 5 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < 4 && (
              <button
                onClick={handleNextStep}
                disabled={step === 2 && selectedSymptoms.length === 0}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  (step === 2 && selectedSymptoms.length === 0)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#1D9E75] text-white hover:bg-[#1D9E75]/90 shadow-lg shadow-[#1D9E75]/20'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default SymptomChecker;
