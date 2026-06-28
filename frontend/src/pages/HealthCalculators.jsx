import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { HEALTH_PACKAGES_DATA } from '../data/testsData';
import { 
  Calculator, Heart, Baby, Droplets, Activity, ArrowRight, 
  CheckCircle2, AlertCircle, Info, ShoppingCart, Check, ShieldAlert 
} from 'lucide-react';

/* ─── HELPER ─── */
const getRiskColor = (risk) => {
  if (risk === 'Low' || risk === 'Normal') return 'text-green-700 bg-green-50/50 border-green-200';
  if (risk === 'Moderate' || risk === 'Overweight' || risk === 'Pre-diabetic' || risk === 'Borderline') return 'text-amber-700 bg-amber-50/50 border-amber-200';
  return 'text-red-700 bg-red-50/50 border-red-200';
};

/* ─── REUSABLE PACKAGE RECOMMENDATION CARD ─── */
const RecommendedPackageCard = ({ pkgCode, cartItems, onToggleCart }) => {
  const navigate = useNavigate();
  const pkg = HEALTH_PACKAGES_DATA.find(p => p.code === pkgCode);
  if (!pkg) return null;

  const isAdded = cartItems.some(item => item.testCode === pkg.code);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#085041] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            Recommended Package
          </span>
          {pkg.badge && (
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              {pkg.badge}
            </span>
          )}
        </div>
        <h4 className="text-sm font-black text-slate-800 mt-1 uppercase tracking-tight">{pkg.name}</h4>
        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">{pkg.desc}</p>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-bold">
          <span>Parameters: <strong className="text-slate-600">{pkg.parameterCount}</strong></span>
          <span>•</span>
          <span>Sample: <strong className="text-slate-600">{pkg.sample || 'Blood'}</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-between border-t border-slate-50 pt-3 md:border-t-0 md:pt-0 shrink-0">
        <div className="text-left md:text-right">
          <span className="text-[10px] font-bold text-slate-400 line-through">₹{pkg.originalPrice}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-[#085041]">₹{pkg.price}</span>
            <span className="text-[9px] font-bold text-emerald-600">{pkg.discount.split(' ')[0]} Off</span>
          </div>
        </div>

        <button
          onClick={() => onToggleCart(pkg.code)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 shadow-sm ${
            isAdded
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-black text-white hover:bg-slate-800'
          }`}
        >
          {isAdded ? (
            <>
              <Check size={12} /> Added
            </>
          ) : (
            <>
              <ShoppingCart size={12} /> Book Now
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/* ─── BMI CALCULATOR ─── */
const BMICalc = ({ cartItems, onToggleCart }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);

  const calc = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h || h <= 0) return;
    const bmi = (w / (h * h)).toFixed(1);
    let category, risk, recommendedPkg;
    if (bmi < 18.5) { 
      category = 'Underweight'; 
      risk = 'Moderate'; 
      recommendedPkg = 'PKG-HK-07'; // Lite
    } else if (bmi < 25) { 
      category = 'Normal'; 
      risk = 'Normal'; 
      recommendedPkg = 'PKG-HK-08'; // Active
    } else if (bmi < 30) { 
      category = 'Overweight'; 
      risk = 'Moderate'; 
      recommendedPkg = 'PKG-HK-08'; // Active
    } else { 
      category = 'Obese'; 
      risk = 'High'; 
      recommendedPkg = 'PKG-HK-02'; // Total
    }
    setResult({ bmi, category, risk, recommendedPkg });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 70" min="20" max="200"
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 bg-gray-50" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Height (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 170" min="100" max="230"
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 bg-gray-50" />
        </div>
      </div>
      <button onClick={calc} className="w-full py-3.5 bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all">
        Calculate BMI
      </button>
      {result && (
        <div className={`border-2 rounded-2xl p-5 space-y-4 ${getRiskColor(result.risk)}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-black">{result.bmi}</p>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">BMI Score</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-black text-sm border ${getRiskColor(result.risk)}`}>
              {result.category}
            </div>
          </div>
          
          <RecommendedPackageCard pkgCode={result.recommendedPkg} cartItems={cartItems} onToggleCart={onToggleCart} />
        </div>
      )}
    </div>
  );
};

/* ─── DIABETES RISK ─── */
const DiabetesRisk = ({ cartItems, onToggleCart }) => {
  const [f, setF] = useState({ age: '', bmi: '', family: false, exercise: false, hyper: false });
  const [result, setResult] = useState(null);

  const calc = () => {
    let score = 0;
    const age = parseInt(f.age);
    const bmi = parseFloat(f.bmi);
    if (age >= 45) score += 2;
    else if (age >= 35) score += 1;
    if (bmi >= 30) score += 2;
    else if (bmi >= 25) score += 1;
    if (f.family) score += 2;
    if (!f.exercise) score += 1;
    if (f.hyper) score += 1;
    
    let risk, recommendedPkg;
    if (score <= 2) { 
      risk = 'Low'; 
      recommendedPkg = 'PKG-HK-08'; // Active
    } else if (score <= 4) { 
      risk = 'Moderate'; 
      recommendedPkg = 'PKG-HK-08'; // Active
    } else { 
      risk = 'High'; 
      recommendedPkg = 'PKG-HK-09'; // Diabetic Care
    }
    setResult({ score, risk, recommendedPkg });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Age (years)</label>
          <input type="number" value={f.age} onChange={e => setF({...f, age: e.target.value})} placeholder="e.g. 42" min="18" max="100"
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 bg-gray-50" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">BMI (if known)</label>
          <input type="number" value={f.bmi} onChange={e => setF({...f, bmi: e.target.value})} placeholder="e.g. 28" min="15" max="50"
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-500/10 bg-gray-50" />
        </div>
      </div>
      {[
        { key: 'family', label: 'Family history of diabetes (parent/sibling)' },
        { key: 'exercise', label: 'Exercise less than 3 days/week' },
        { key: 'hyper', label: 'Diagnosed with high blood pressure' },
      ].map(item => (
        <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-100 rounded-xl hover:border-emerald-200 transition-colors bg-gray-50">
          <input type="checkbox" checked={f[item.key]} onChange={e => setF({...f, [item.key]: e.target.checked})} className="accent-[#1D9E75] w-4 h-4" />
          <span className="text-sm font-semibold text-slate-700">{item.label}</span>
        </label>
      ))}
      <button onClick={calc} className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-2xl shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 transition-all">
        Assess My Diabetes Risk
      </button>
      {result && (
        <div className={`border-2 rounded-2xl p-5 space-y-4 ${getRiskColor(result.risk)}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-black">{result.score}/8</p>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">Risk Score</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-black text-sm border ${getRiskColor(result.risk)}`}>
              {result.risk} Risk
            </div>
          </div>
          
          <RecommendedPackageCard pkgCode={result.recommendedPkg} cartItems={cartItems} onToggleCart={onToggleCart} />
        </div>
      )}
    </div>
  );
};

/* ─── HEART RISK ─── */
const HeartRisk = ({ cartItems, onToggleCart }) => {
  const [f, setF] = useState({ age: '', cholesterol: false, smoking: false, bp: false, diabetes: false, family: false });
  const [result, setResult] = useState(null);

  const calc = () => {
    let score = 0;
    const age = parseInt(f.age);
    if (age >= 60) score += 3;
    else if (age >= 45) score += 2;
    else if (age >= 35) score += 1;
    if (f.cholesterol) score += 2;
    if (f.smoking) score += 2;
    if (f.bp) score += 2;
    if (f.diabetes) score += 1;
    if (f.family) score += 2;
    
    let risk, recommendedPkg;
    if (score <= 3) { 
      risk = 'Low'; 
      recommendedPkg = 'PKG-HK-08'; // Active
    } else if (score <= 6) { 
      risk = 'Moderate'; 
      recommendedPkg = 'PKG-HK-08'; // Active
    } else { 
      risk = 'High'; 
      recommendedPkg = 'PKG-HK-11'; // Cardiac Risk
    }
    setResult({ score, risk, recommendedPkg });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Age (years)</label>
        <input type="number" value={f.age} onChange={e => setF({...f, age: e.target.value})} placeholder="e.g. 52" min="18" max="100"
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-200 bg-gray-50" />
      </div>
      {[
        { key: 'cholesterol', label: 'High cholesterol or on cholesterol medication' },
        { key: 'smoking', label: 'Current or recent smoker (within 5 years)' },
        { key: 'bp', label: 'High blood pressure (hypertension)' },
        { key: 'diabetes', label: 'Diagnosed with diabetes' },
        { key: 'family', label: 'Family history of heart disease (parent/sibling)' },
      ].map(item => (
        <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-100 rounded-xl hover:border-red-200 transition-colors bg-gray-50">
          <input type="checkbox" checked={f[item.key]} onChange={e => setF({...f, [item.key]: e.target.checked})} className="accent-red-500 w-4 h-4" />
          <span className="text-sm font-semibold text-slate-700">{item.label}</span>
        </label>
      ))}
      <button onClick={calc} className="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/25 hover:-translate-y-0.5 transition-all">
        Check My Heart Risk
      </button>
      {result && (
        <div className={`border-2 rounded-2xl p-5 space-y-4 ${getRiskColor(result.risk)}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-black">{result.score}/12</p>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">Risk Score</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-black text-sm border ${getRiskColor(result.risk)}`}>
              {result.risk} Risk
            </div>
          </div>
          
          <RecommendedPackageCard pkgCode={result.recommendedPkg} cartItems={cartItems} onToggleCart={onToggleCart} />
        </div>
      )}
    </div>
  );
};

/* ─── KIDNEY RISK ─── */
const KidneyRisk = ({ cartItems, onToggleCart }) => {
  const [f, setF] = useState({ age: '', bp: false, diabetes: false, swelling: false, urineChange: false, family: false });
  const [result, setResult] = useState(null);

  const calc = () => {
    let score = 0;
    const age = parseInt(f.age);
    if (age >= 60) score += 2;
    else if (age >= 45) score += 1;
    if (f.bp) score += 3;
    if (f.diabetes) score += 3;
    if (f.swelling) score += 2;
    if (f.urineChange) score += 2;
    if (f.family) score += 1;

    let risk, recommendedPkg;
    if (score <= 2) {
      risk = 'Low';
      recommendedPkg = 'PKG-HK-08'; // Active
    } else if (score <= 5) {
      risk = 'Borderline';
      recommendedPkg = 'PKG-HK-02'; // Total
    } else {
      risk = 'High';
      recommendedPkg = 'PKG-HK-01'; // Total Plus (comprehensive check)
    }
    setResult({ score, risk, recommendedPkg });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Age (years)</label>
        <input type="number" value={f.age} onChange={e => setF({...f, age: e.target.value})} placeholder="e.g. 50" min="18" max="100"
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200 bg-gray-50" />
      </div>
      {[
        { key: 'bp', label: 'High blood pressure (Hypertension)' },
        { key: 'diabetes', label: 'Diabetes / High blood sugar levels' },
        { key: 'swelling', label: 'Frequent swelling in ankles, feet, or puffiness around eyes' },
        { key: 'urineChange', label: 'Changes in urination frequency (increased at night) or foaming' },
        { key: 'family', label: 'Family history of kidney disease or failure' },
      ].map(item => (
        <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-100 rounded-xl hover:border-indigo-200 transition-colors bg-gray-50">
          <input type="checkbox" checked={f[item.key]} onChange={e => setF({...f, [item.key]: e.target.checked})} className="accent-indigo-500 w-4 h-4" />
          <span className="text-sm font-semibold text-slate-700">{item.label}</span>
        </label>
      ))}
      <button onClick={calc} className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all">
        Check My Kidney Risk
      </button>
      {result && (
        <div className={`border-2 rounded-2xl p-5 space-y-4 ${getRiskColor(result.risk)}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-black">{result.score}/13</p>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">Kidney Strain Score</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-black text-sm border ${getRiskColor(result.risk)}`}>
              {result.risk} Risk
            </div>
          </div>
          
          <RecommendedPackageCard pkgCode={result.recommendedPkg} cartItems={cartItems} onToggleCart={onToggleCart} />
        </div>
      )}
    </div>
  );
};

/* ─── DUE DATE CALC ─── */
const DueDateCalc = () => {
  const [lmp, setLmp] = useState('');
  const [result, setResult] = useState(null);

  const calc = () => {
    if (!lmp) return;
    const lmpDate = new Date(lmp);
    const edd = new Date(lmpDate);
    edd.setDate(edd.getDate() + 280);
    const today = new Date();
    const weeksPregnant = Math.floor((today - lmpDate) / (7 * 24 * 60 * 60 * 1000));
    setResult({
      edd: edd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      weeks: Math.max(0, weeksPregnant),
      tests: ['ANC Profile (₹1200)', 'Blood Group & Rh Factor', 'Hemoglobin (Hb)', 'Urine Routine', 'RBS / HbA1c (Gestational Diabetes Screen)']
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">First Day of Last Menstrual Period (LMP)</label>
        <input type="date" value={lmp} onChange={e => setLmp(e.target.value)} max={new Date().toISOString().split('T')[0]}
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-200 bg-gray-50" />
      </div>
      <button onClick={calc} className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black rounded-2xl shadow-lg shadow-pink-500/25 hover:-translate-y-0.5 transition-all">
        Calculate Due Date
      </button>
      {result && (
        <div className="border-2 border-pink-200 bg-pink-50 text-pink-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">Expected Delivery Date</p>
              <p className="text-2xl font-black">{result.edd}</p>
            </div>
            <div className="bg-pink-100 border border-pink-200 px-3 py-2 rounded-xl text-center">
              <p className="text-xl font-black">{result.weeks}w</p>
              <p className="text-[10px] font-bold opacity-70">Pregnant</p>
            </div>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-xs font-black uppercase tracking-wide mb-2 opacity-70">ANC Tests Recommended:</p>
            {result.tests.map(t => (
              <div key={t} className="flex items-center gap-2 py-1">
                <Baby size={13} /> <span className="text-sm font-bold">{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── WATER INTAKE ─── */
const WaterCalc = () => {
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('sedentary');
  const [result, setResult] = useState(null);

  const calc = () => {
    const w = parseFloat(weight);
    if (!w) return;
    let base = w * 0.033;
    if (activity === 'active') base += 0.5;
    else if (activity === 'very_active') base += 1.0;
    setResult({ litres: base.toFixed(1), glasses: Math.round(base * 4) });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Body Weight (kg)</label>
        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 65" min="30" max="200"
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-200 bg-gray-50" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Activity Level</label>
        {[
          { value: 'sedentary', label: '🪑 Sedentary (desk job / minimal movement)' },
          { value: 'active', label: '🚶 Active (moderate exercise 3-4x/week)' },
          { value: 'very_active', label: '🏃 Very Active (daily intense exercise)' },
        ].map(opt => (
          <label key={opt.value} className={`flex items-center gap-3 cursor-pointer p-3 border-2 rounded-xl mb-2 transition-colors ${activity === opt.value ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-blue-200'}`}>
            <input type="radio" value={opt.value} checked={activity === opt.value} onChange={() => setActivity(opt.value)} className="accent-blue-500 w-4 h-4" />
            <span className="text-sm font-semibold text-slate-700">{opt.label}</span>
          </label>
        ))}
      </div>
      <button onClick={calc} className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all">
        Calculate Daily Water Need
      </button>
      {result && (
        <div className="border-2 border-blue-200 bg-blue-50 text-blue-800 rounded-2xl p-5 text-center">
          <p className="text-5xl font-black">{result.litres}L</p>
          <p className="text-sm font-bold opacity-70 mb-2">or approximately {result.glasses} glasses of water per day</p>
          <div className="bg-white/60 rounded-xl p-3 mt-3 text-left">
            <p className="text-xs font-black uppercase opacity-70 mb-1">💡 Tip:</p>
            <p className="text-xs font-semibold">If you have kidney issues, consult your doctor — fluid intake may need adjustment. A KFT test can check your kidney health.</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── MAIN PAGE ─── */
const HealthCalculators = () => {
  const [activeTab, setActiveTab] = useState('bmi');
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
    window.addEventListener('cart-updated', loadCart);
    return () => window.removeEventListener('cart-updated', loadCart);
  }, []);

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('sana_cart')) || [];
      setCartItems(cart);
    } catch (e) {
      setCartItems([]);
    }
  };

  const handleToggleCart = (pkgCode) => {
    const recPkg = HEALTH_PACKAGES_DATA.find(p => p.code === pkgCode);
    if (!recPkg) return;
    const isAdded = cartItems.some(item => item.testCode === recPkg.code);
    let newCart;
    if (isAdded) {
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

  const TABS = [
    { id: 'bmi', label: 'BMI', icon: <Activity size={16} />, color: 'from-[#0F6E56] to-[#1D9E75]', component: <BMICalc cartItems={cartItems} onToggleCart={handleToggleCart} /> },
    { id: 'diabetes', label: 'Diabetes Risk', icon: <AlertCircle size={16} />, color: 'from-amber-500 to-orange-500', component: <DiabetesRisk cartItems={cartItems} onToggleCart={handleToggleCart} /> },
    { id: 'heart', label: 'Heart Risk', icon: <Heart size={16} />, color: 'from-red-500 to-rose-600', component: <HeartRisk cartItems={cartItems} onToggleCart={handleToggleCart} /> },
    { id: 'kidney', label: 'Kidney Risk', icon: <ShieldAlert size={16} />, color: 'from-indigo-500 to-purple-600', component: <KidneyRisk cartItems={cartItems} onToggleCart={handleToggleCart} /> },
    { id: 'duedate', label: 'Due Date', icon: <Baby size={16} />, color: 'from-pink-500 to-rose-400', component: <DueDateCalc /> },
    { id: 'water', label: 'Water Intake', icon: <Droplets size={16} />, color: 'from-blue-500 to-cyan-500', component: <WaterCalc /> },
  ];

  const activeConfig = TABS.find(t => t.id === activeTab);

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0d7a60] py-20 px-4 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            <Calculator size={13} /> Free Health Tools
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
            Health <span className="text-[#F1C40F]">Risk Calculators</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto font-medium">
            Interactive self-check tools. Know your risk and dynamically book the recommended health packages instantly.
          </p>
        </div>
      </section>

      <div className="bg-[#F5F7F6] min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Tab bar */}
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-gray-100 shadow-sm'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Calculator card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-br ${activeConfig.color} px-8 py-6`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  {activeConfig.icon}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{activeConfig.label} Calculator</h2>
                  <p className="text-white/70 text-xs">Get personalized test recommendations</p>
                </div>
              </div>
            </div>
            <div className="p-8 font-sans">
              {activeConfig.component}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-semibold leading-relaxed">
              <strong>Medical Disclaimer:</strong> These calculators provide general health guidance only and are not a substitute for professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default HealthCalculators;
