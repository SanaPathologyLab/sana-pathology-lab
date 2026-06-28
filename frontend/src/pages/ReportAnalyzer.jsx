import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import PublicHomeHeader from '../components/PublicHomeHeader';
import EmergencyWidget from '../components/EmergencyWidget';
import LiveChatWidget from '../components/LiveChatWidget';
import { HEALTH_PACKAGES_DATA } from '../data/testsData';
import { 
  Activity, ArrowRight, ShieldCheck, Heart, AlertCircle, 
  Info, HelpCircle, Check, ShoppingCart, RefreshCw, Languages 
} from 'lucide-react';

const BIOMARKERS = {
  hba1c: {
    name: 'HbA1c (Glycosylated Hemoglobin)',
    nameHindi: 'एचबीए1सी (ग्लाइकोसिलेटेड हीमोग्लोबिन)',
    unit: '%',
    min: 3,
    max: 15,
    step: 0.1,
    defaultVal: 5.4,
    ranges: [
      { max: 5.6, status: 'Normal', statusHindi: 'सामान्य', color: 'bg-green-500 text-green-500 border-green-200 bg-green-55', 
        desc: 'Your blood sugar control is excellent. Keep maintaining a balanced diet and regular exercise.',
        descHindi: 'आपका ब्लड शुगर नियंत्रण बेहतरीन है। संतुलित आहार और नियमित व्यायाम बनाए रखें।' },
      { min: 5.7, max: 6.4, status: 'Pre-diabetic', statusHindi: 'प्री-डायबिटिक', color: 'bg-amber-500 text-amber-600 border-amber-200 bg-amber-55', 
        desc: 'Your levels are slightly elevated. This indicates pre-diabetes. Lifestyle changes can reverse this.',
        descHindi: 'आपका स्तर थोड़ा बढ़ा हुआ है। यह प्री-डायबिटीज का संकेत है। जीवनशैली में बदलाव इसे ठीक कर सकते हैं।' },
      { min: 6.5, status: 'Diabetic', statusHindi: 'डायबिटिक', color: 'bg-red-500 text-red-600 border-red-200 bg-red-55', 
        desc: 'Your levels suggest diabetes. Please consult a doctor immediately. Regular monitoring of HbA1c is highly recommended.',
        descHindi: 'आपका स्तर डायबिटीज का संकेत देता है। कृपया तुरंत डॉक्टर से संपर्क करें। नियमित जांच की सलाह दी जाती है।' }
    ],
    recommendedPkg: 'PKG-HK-09', // Diabetic Care
    tips: [
      { en: 'Reduce refined carbohydrate and sugar intake.', hi: 'रिफाइंड कार्बोहाइड्रेट और चीनी का सेवन कम करें।' },
      { en: 'Engage in at least 30 minutes of aerobic exercise daily.', hi: 'रोजाना कम से कम 30 मिनट एरोबिक व्यायाम करें।' },
      { en: 'Include fiber-rich foods like whole grains, vegetables, and legumes.', hi: 'साबुत अनाज, सब्जियां और दालें जैसे फाइबर युक्त खाद्य पदार्थ शामिल करें।' }
    ]
  },
  fbs: {
    name: 'Fasting Blood Sugar (FBS)',
    nameHindi: 'फास्टिंग ब्लड शुगर (खाली पेट)',
    unit: 'mg/dL',
    min: 40,
    max: 300,
    step: 1,
    defaultVal: 90,
    ranges: [
      { max: 99, status: 'Normal', statusHindi: 'सामान्य', color: 'bg-green-500 text-green-500 border-green-200 bg-green-55', 
        desc: 'Normal fasting blood glucose. Ideal range.',
        descHindi: 'सामान्य फास्टिंग ब्लड ग्लूकोज। आदर्श स्तर।' },
      { min: 100, max: 125, status: 'Pre-diabetic', statusHindi: 'प्री-डायबिटिक', color: 'bg-amber-500 text-amber-600 border-amber-200 bg-amber-55', 
        desc: 'Indicates impaired fasting glucose (pre-diabetes). Focus on diet modifications.',
        descHindi: 'यह बिगड़ा हुआ फास्टिंग ग्लूकोज (प्री-डायबिटीज) दर्शाता है। आहार में सुधार पर ध्यान दें।' },
      { min: 126, status: 'Diabetic', statusHindi: 'डायबिटिक', color: 'bg-red-500 text-red-600 border-red-200 bg-red-55', 
        desc: 'High blood sugar level consistent with diabetes. Prompt medical evaluation is required.',
        descHindi: 'हाई ब्लड शुगर स्तर डायबिटीज के अनुकूल है। शीघ्र चिकित्सीय मूल्यांकन की आवश्यकता है।' }
    ],
    recommendedPkg: 'PKG-HK-09', // Diabetic Care
    tips: [
      { en: 'Ensure a fast of 8-10 hours before blood collection.', hi: 'रक्त संग्रह से पहले 8-10 घंटे का उपवास सुनिश्चित करें।' },
      { en: 'Stay hydrated with plain water during fasting.', hi: 'उपवास के दौरान सादे पानी से हाइड्रेटेड रहें।' }
    ]
  },
  hemoglobin: {
    name: 'Hemoglobin (Hb)',
    nameHindi: 'हीमोग्लोबिन',
    unit: 'g/dL',
    min: 5,
    max: 20,
    step: 0.1,
    defaultVal: 13.5,
    ranges: [
      { max: 11.9, status: 'Low (Anemic)', statusHindi: 'कम (एनीमिया)', color: 'bg-red-500 text-red-600 border-red-200 bg-red-55', 
        desc: 'Low hemoglobin indicates anemia. It may cause fatigue or weakness. Iron rich diet or supplements might be needed.',
        descHindi: 'कम हीमोग्लोबिन एनीमिया का संकेत है। इससे थकान या कमजोरी हो सकती है। आयरन युक्त आहार की आवश्यकता हो सकती है।' },
      { min: 12.0, max: 17.5, status: 'Normal', statusHindi: 'सामान्य', color: 'bg-green-500 text-green-500 border-green-200 bg-green-55', 
        desc: 'Healthy hemoglobin level. Good oxygen carrying capacity.',
        descHindi: 'स्वस्थ हीमोग्लोबिन स्तर। अच्छी ऑक्सीजन वहन क्षमता।' },
      { min: 17.6, status: 'High', statusHindi: 'उच्च', color: 'bg-amber-500 text-amber-600 border-amber-200 bg-amber-55', 
        desc: 'Slightly elevated. Can be due to dehydration, smoking, or living in high altitude.',
        descHindi: 'थोड़ा बढ़ा हुआ। निर्जलीकरण, धूम्रपान या अधिक ऊंचाई पर रहने के कारण हो सकता है।' }
    ],
    recommendedPkg: 'PKG-HK-01', // Total Plus
    tips: [
      { en: 'Consume iron-rich foods: spinach, beetroot, pomegranate, and red meat.', hi: 'आयरन से भरपूर खाद्य पदार्थ खाएं: पालक, चुकंदर, अनार और रेड मीट।' },
      { en: 'Pair iron foods with Vitamin C (citrus fruits) to boost absorption.', hi: 'अवशोषण बढ़ाने के लिए आयरन खाद्य पदार्थों को विटामिन सी (खट्टे फल) के साथ लें।' }
    ]
  },
  cholesterol: {
    name: 'Total Cholesterol',
    nameHindi: 'टोटल कोलेस्ट्रॉल',
    unit: 'mg/dL',
    min: 100,
    max: 400,
    step: 1,
    defaultVal: 180,
    ranges: [
      { max: 199, status: 'Desirable', statusHindi: 'वांछनीय (उत्तम)', color: 'bg-green-500 text-green-500 border-green-200 bg-green-55', 
        desc: 'Excellent cholesterol level. Supports good cardiovascular health.',
        descHindi: 'उत्कृष्ट कोलेस्ट्रॉल स्तर। अच्छे हृदय स्वास्थ्य का समर्थन करता है।' },
      { min: 200, max: 239, status: 'Borderline High', statusHindi: 'सीमा रेखा पर उच्च', color: 'bg-amber-500 text-amber-600 border-amber-200 bg-amber-55', 
        desc: 'Your cholesterol is borderline high. Monitor fat intake and increase exercise.',
        descHindi: 'आपका कोलेस्ट्रॉल सीमा रेखा पर उच्च है। वसा के सेवन की निगरानी करें और व्यायाम बढ़ाएं।' },
      { min: 240, status: 'High Risk', statusHindi: 'उच्च जोखिम', color: 'bg-red-500 text-red-600 border-red-200 bg-red-55', 
        desc: 'High cholesterol levels increase the risk of heart disease. Consult a doctor for a Lipid Profile and lifestyle advice.',
        descHindi: 'हाई कोलेस्ट्रॉल स्तर से हृदय रोग का खतरा बढ़ जाता है। लिपिड प्रोफाइल और डॉक्टर की सलाह लें।' }
    ],
    recommendedPkg: 'PKG-HK-11', // Cardiac Risk
    tips: [
      { en: 'Avoid trans fats, deep-fried foods, and processed snacks.', hi: 'ट्रांस फैट, डीप-फ्राइड फूड्स और प्रोसेस्ड स्नैक्स से बचें।' },
      { en: 'Include healthy fats from almonds, walnuts, olive oil, and seeds.', hi: 'बादाम, अखरोट, जैतून का तेल और बीजों से स्वस्थ वसा शामिल करें।' }
    ]
  },
  creatinine: {
    name: 'Serum Creatinine',
    nameHindi: 'सीरम क्रिएटिनिन (किडनी)',
    unit: 'mg/dL',
    min: 0.3,
    max: 8.0,
    step: 0.1,
    defaultVal: 0.9,
    ranges: [
      { max: 1.2, status: 'Normal', statusHindi: 'सामान्य', color: 'bg-green-500 text-green-500 border-green-200 bg-green-55', 
        desc: 'Healthy kidney filtration rate. Creatinine removal is optimal.',
        descHindi: 'स्वस्थ गुर्दा निस्पंदन (फिल्टर) दर। क्रिएटिनिन निष्कासन इष्टतम है।' },
      { min: 1.3, max: 2.0, status: 'Elevated', statusHindi: 'बढ़ा हुआ', color: 'bg-amber-500 text-amber-600 border-amber-200 bg-amber-55', 
        desc: 'Slight kidney stress. Keep blood pressure controlled and consult a nephrologist.',
        descHindi: 'गुर्दे पर थोड़ा तनाव। रक्तचाप को नियंत्रित रखें और गुर्दा रोग विशेषज्ञ से सलाह लें।' },
      { min: 2.1, status: 'Critical / High', statusHindi: 'गंभीर / उच्च', color: 'bg-red-500 text-red-600 border-red-200 bg-red-55', 
        desc: 'Highly elevated creatinine indicating severe kidney strain. Urgent doctor visit is recommended.',
        descHindi: 'क्रिएटिनिन का अत्यधिक बढ़ा होना गुर्दे के गंभीर तनाव को दर्शाता है। तुरंत डॉक्टर से मिलें।' }
    ],
    recommendedPkg: 'PKG-HK-02', // Total
    tips: [
      { en: 'Stay hydrated; consume at least 2.5 to 3 liters of water daily.', hi: 'हाइड्रेटेड रहें; रोजाना कम से कम 2.5 से 3 लीटर पानी का सेवन करें।' },
      { en: 'Avoid self-medication, especially pain killers (NSAIDs) which harm kidneys.', hi: 'स्व-दवा से बचें, विशेष रूप से दर्द निवारक दवाएं जो गुर्दे को नुकसान पहुंचाती हैं।' }
    ]
  }
};

const ReportAnalyzer = () => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState('hba1c');
  const [val, setVal] = useState(5.4);
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  const [cartItems, setCartItems] = useState([]);
  
  const biomarker = BIOMARKERS[selectedKey];

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCart();
  }, []);

  useEffect(() => {
    setVal(biomarker.defaultVal);
  }, [selectedKey]);

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('sana_cart')) || [];
      setCartItems(cart);
    } catch (e) {
      setCartItems([]);
    }
  };

  const currentRange = biomarker.ranges.find(r => {
    const minOk = r.min === undefined || val >= r.min;
    const maxOk = r.max === undefined || val <= r.max;
    return minOk && maxOk;
  }) || biomarker.ranges[0];

  const recPkg = HEALTH_PACKAGES_DATA.find(p => p.code === biomarker.recommendedPkg);
  const isPkgInCart = recPkg ? cartItems.some(item => item.testCode === recPkg.code) : false;

  const handleToggleCart = () => {
    if (!recPkg) return;
    let newCart;
    if (isPkgInCart) {
      newCart = cartItems.filter(item => item.testCode !== recPkg.code);
    } else {
      newCart = [...cartItems, {
        name: recPkg.name,
        price: recPkg.price,
        testCode: recPkg.code,
        isPackage: true
      }];
    }
    localStorage.setItem('sana_cart', JSON.stringify(newCart));
    setCartItems(newCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  // Calculate percentage of value for visual slider placement
  const percent = Math.min(100, Math.max(0, ((val - biomarker.min) / (biomarker.max - biomarker.min)) * 100));

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0d7a60] py-16 px-4 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            <Activity size={13} /> AI Smart Health Assistant
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
            {lang === 'en' ? 'AI Health' : 'एआई हेल्थ'} <span className="text-[#F1C40F]">{lang === 'en' ? 'Report Analyzer' : 'रिपोर्ट विश्लेषक'}</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto font-medium">
            {lang === 'en' 
              ? 'Input your lab report levels to understand what your numbers mean in simple words.'
              : 'सरल शब्दों में अपने नंबरों का अर्थ समझने के लिए अपनी लैब रिपोर्ट के स्तर दर्ज करें।'}
          </p>
        </div>
      </section>

      <div className="bg-[#F5F7F6] min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Selector & Sliders */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Lang and Selector Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  {lang === 'en' ? 'Select Biomarker' : 'बायोमार्कर चुनें'}
                </h3>
                <button 
                  onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                >
                  <Languages size={14} className="text-[#085041]" />
                  {lang === 'en' ? 'हिन्दी में देखें' : 'Switch to English'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(BIOMARKERS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={`px-4 py-3 rounded-2xl font-bold text-xs text-left transition-all border ${
                      selectedKey === key
                        ? 'border-[#085041] bg-emerald-50/50 text-[#085041] shadow-sm'
                        : 'border-slate-100 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {lang === 'en' ? item.name : item.nameHindi}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider / Value Input Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-800">
                    {lang === 'en' ? biomarker.name : biomarker.nameHindi}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {lang === 'en' ? 'Adjust value to match your report' : 'अपनी रिपोर्ट के अनुसार मूल्य बदलें'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-[#085041]">{val}</span>
                  <span className="text-sm font-bold text-slate-400 ml-1">{biomarker.unit}</span>
                </div>
              </div>

              {/* Dynamic visual slider */}
              <div className="space-y-3 pt-4">
                <input
                  type="range"
                  min={biomarker.min}
                  max={biomarker.max}
                  step={biomarker.step}
                  value={val}
                  onChange={(e) => setVal(parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#085041]"
                />
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>{biomarker.min} {biomarker.unit}</span>
                  <span>{biomarker.max} {biomarker.unit}</span>
                </div>
              </div>

              {/* Visual Scale Indicator Bar */}
              <div className="relative pt-6">
                <div className="h-4 bg-slate-100 rounded-full flex overflow-hidden border border-slate-200">
                  {biomarker.ranges.map((r, i) => {
                    return (
                      <div 
                        key={i} 
                        className={`h-full ${r.color.split(' ')[0]} opacity-70 flex items-center justify-center text-[9px] text-white font-black`}
                        style={{ width: i === 0 ? '40%' : i === 1 ? '30%' : '30%' }}
                      >
                        {lang === 'en' ? r.status : r.statusHindi}
                      </div>
                    );
                  })}
                </div>
                {/* Pointer indicator */}
                <div 
                  className="absolute top-2 flex flex-col items-center transition-all duration-150"
                  style={{ left: `calc(${percent}% - 8px)` }}
                >
                  <div className="w-4 h-4 bg-slate-800 rounded-full border-2 border-white shadow flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Diagnostics Box */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border-2 flex items-center justify-center ${currentRange.color.split(' ').slice(1).join(' ')}`}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    {lang === 'en' ? 'AI Diagnostic Status' : 'एआई नैदानिक स्थिति'}
                  </span>
                  <h3 className="text-lg font-black text-slate-800">
                    {lang === 'en' ? currentRange.status : currentRange.statusHindi}
                  </h3>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <p className="text-sm font-semibold text-slate-700 leading-relaxed font-sans">
                  {lang === 'en' ? currentRange.desc : currentRange.descHindi}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#085041]" />
                  {lang === 'en' ? 'Recommended Actionable Tips:' : 'अनुशंसित क्रियाशील सुझाव:'}
                </h4>
                <ul className="space-y-2">
                  {biomarker.tips.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#085041] mt-1.5 shrink-0" />
                      <span>{lang === 'en' ? t.en : t.hi}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Recommmended Package Card */}
          <div className="space-y-6">
            {recPkg && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col sticky top-24">
                <div className="p-6 bg-gradient-to-br from-[#063b30] to-[#085041] text-white">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md border border-white/10">
                    {lang === 'en' ? 'Recommended Screening' : 'अनुशंसित जांच'}
                  </span>
                  <h3 className="text-lg font-black mt-3 leading-tight">{recPkg.name}</h3>
                  <p className="text-white/70 text-xs mt-1 font-semibold leading-relaxed">{recPkg.desc}</p>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#085041] shrink-0" />
                      <span>Includes <strong>{recPkg.parameterCount}</strong> parameters</span>
                    </div>
                    {recPkg.sample && (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#085041] shrink-0" />
                        <span>Sample: <strong>{recPkg.sample}</strong></span>
                      </div>
                    )}
                    {recPkg.fasting && (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#085041] shrink-0" />
                        <span>Preparation: <strong>{recPkg.fasting}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 line-through">₹{recPkg.originalPrice}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#085041]">₹{recPkg.price}</span>
                        <span className="text-[10px] font-bold text-emerald-600">Save {recPkg.discount.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => navigate('/packages')}
                      className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-all text-center"
                    >
                      {lang === 'en' ? 'More Packages' : 'अन्य पैकेज'}
                    </button>
                    <button
                      onClick={handleToggleCart}
                      className={`py-3 rounded-2xl font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 ${
                        isPkgInCart
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/10'
                          : 'bg-black text-white hover:bg-slate-800 shadow-md shadow-black/10'
                      }`}
                    >
                      {isPkgInCart ? (
                        <>
                          <Check size={14} /> {lang === 'en' ? 'Added' : 'शामिल किया'}
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} /> {lang === 'en' ? 'Book Now' : 'बुक करें'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* General Advice Note */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <Info size={14} />
                <span>{lang === 'en' ? 'Disclaimer' : 'अस्वीकरण'}</span>
              </div>
              <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                {lang === 'en' 
                  ? 'This tool is for educational purposes only. Do not make health or medication decisions based on this without consulting an MD pathologist or your doctor.'
                  : 'यह उपकरण केवल शैक्षिक उद्देश्यों के लिए है। बिना किसी डॉक्टर या एमडी रोगविज्ञानी से परामर्श के इसके आधार पर स्वास्थ्य या दवा संबंधी निर्णय न लें।'}
              </p>
            </div>
          </div>

        </div>
      </div>
      
      <EmergencyWidget />
      <LiveChatWidget />
    </PublicLayout>
  );
};

export default ReportAnalyzer;
