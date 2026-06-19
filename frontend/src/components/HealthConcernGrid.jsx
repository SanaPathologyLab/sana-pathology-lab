import React, { useState } from 'react';
import { Search, Heart, Brain, Dna, Activity, User, Shield, Droplets, Flame, ArrowRight } from 'lucide-react';

const HEALTH_CONCERNS = [
  { icon: <Flame className="w-7 h-7" />, label: 'Diabetes', desc: 'Blood sugar & HbA1c', color: 'from-red-500 to-orange-500', bg: 'bg-red-50', text: 'text-red-600' },
  { icon: <Heart className="w-7 h-7" />, label: 'Heart Health', desc: 'Lipid profile & cardiac risk', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-600' },
  { icon: <Brain className="w-7 h-7" />, label: 'Thyroid Care', desc: 'T3, T4, TSH function', color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50', text: 'text-purple-600' },
  { icon: <Dna className="w-7 h-7" />, label: 'Kidney Function', desc: 'KFT, creatinine, urea', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-600' },
  { icon: <Activity className="w-7 h-7" />, label: 'Liver Care', desc: 'LFT, bilirubin, enzymes', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { icon: <User className="w-7 h-7" />, label: 'Senior Citizen', desc: 'Full body screening 60+', color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50', text: 'text-amber-600' },
  { icon: <Shield className="w-7 h-7" />, label: 'Women Wellness', desc: 'ANC profile & hormones', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', text: 'text-pink-600' },
  { icon: <Droplets className="w-7 h-7" />, label: 'Routine Checkup', desc: 'CBC, urine, baseline', color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50', text: 'text-sky-600' },
];

const PREDICTIVE_TESTS = [
  { name: 'Complete Blood Count (CBC)', code: 'CBC', price: 200, category: 'Hematology' },
  { name: 'Thyroid Function Test (T3, T4, TSH)', code: 'TFT', price: 450, category: 'Immunology' },
  { name: 'Lipid Profile', code: 'LIPID', price: 650, category: 'Biochemistry' },
  { name: 'Liver Function Test (LFT)', code: 'LFT', price: 500, category: 'Biochemistry' },
  { name: 'Kidney Function Test (KFT)', code: 'KFT', price: 500, category: 'Biochemistry' },
  { name: 'HbA1c (Glycosylated Haemoglobin)', code: 'HBA1C', price: 400, category: 'Biochemistry' },
];

const HealthConcernGrid = ({ scrollToSection, t, language }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredPredictions = PREDICTIVE_TESTS.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="health-concerns">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary-pale/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="text-xs font-black tracking-widest text-secondary uppercase bg-secondary-pale px-4 py-1.5 rounded-full">Smart Discovery</span>
          <h2 className="text-4xl font-heading text-primary font-black mt-4">Find the Right Test for You</h2>
          <p className="text-slate-500 mt-2 max-w-2xl mx-auto font-medium">Search from 250+ diagnostic tests or browse by health concern</p>
          <div className="w-16 h-1 bg-cta mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Predictive Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 relative">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search tests, panels, or health conditions..."
              className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-200 focus:border-secondary rounded-2xl text-base font-semibold outline-none transition-all shadow-lg shadow-slate-100/50"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-secondary to-secondary-light text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all">Search</button>
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && searchQuery && filteredPredictions.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-slide-down">
              {filteredPredictions.map((test, i) => (
                <button key={i} onMouseDown={() => { setSearchQuery(test.name); scrollToSection('services'); }} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary-pale/30 transition-colors text-left border-b border-slate-50 last:border-0">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{test.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{test.category} • {test.code}</p>
                  </div>
                  <span className="text-secondary font-black text-sm">₹{test.price}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Health Concern Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {HEALTH_CONCERNS.map((concern, i) => (
            <button
              key={i}
              onClick={() => scrollToSection('services')}
              className="group bg-white rounded-2xl p-5 md:p-6 border border-slate-100 hover:border-secondary/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 text-center relative overflow-hidden"
            >
              <div className={`w-14 h-14 rounded-2xl ${concern.bg} flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 transition-transform duration-300 ${concern.text}`}>
                {concern.icon}
              </div>
              <h3 className="font-black text-slate-800 text-sm md:text-base mb-1">{concern.label}</h3>
              <p className="text-xs text-slate-500 font-medium">{concern.desc}</p>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${concern.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
            </button>
          ))}
        </div>

        <div className="text-center mt-10">
          <button onClick={() => scrollToSection('services')} className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-secondary-light transition-colors">
            <span>View all 250+ tests</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HealthConcernGrid;
