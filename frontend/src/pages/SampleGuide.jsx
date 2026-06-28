import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import EmergencyWidget from '../components/EmergencyWidget';
import LiveChatWidget from '../components/LiveChatWidget';
import { 
  ShieldCheck, HelpCircle, Activity, Droplets, BookOpen, 
  ArrowRight, Info, AlertTriangle, CheckCircle 
} from 'lucide-react';

const TUBES_DATA = [
  {
    id: 'lavender',
    colorName: 'Lavender / Purple',
    capColor: 'bg-purple-500 shadow-purple-500/30',
    bloodGradient: 'from-purple-900 to-red-950',
    additive: 'EDTA (Ethylenediaminetetraacetic Acid)',
    mechanism: 'Strong anticoagulant that binds calcium ions in blood, preventing coagulation and preserving blood cells for size and structure.',
    tests: ['Complete Blood Count (CBC)', 'HbA1c (Glycosylated Hemoglobin)', 'ESR (Erythrocyte Sedimentation Rate)', 'Blood Grouping & Typing'],
    department: 'Hematology & Immunodiagnostics',
    NABLGuideline: 'Must be gently inverted 8-10 times immediately after collection to mix EDTA with blood. Never shake the tube as it causes hemolysis (rupturing of red blood cells).'
  },
  {
    id: 'red-yellow',
    colorName: 'Red / Gold (SST)',
    capColor: 'bg-red-600 shadow-red-600/30',
    bloodGradient: 'from-amber-200/60 to-red-900', // yellow gel serum separator + blood clot
    isSST: true,
    additive: 'Clot Activator & Polymer Gel (Serum Separator)',
    mechanism: 'Silica particles activate clotting within 30 minutes, and centrifugation separates serum (liquid) from the clotted cells using a barrier gel.',
    tests: ['Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Lipid Profile (Cholesterol)', 'Thyroid Profile (T3, T4, TSH)', 'Vitamin D & B12', 'Immunology & Hormones'],
    department: 'Clinical Biochemistry & Serology',
    NABLGuideline: 'Allow the blood to clot vertically for 30 minutes before centrifuge. Centrifuge at 3000 RPM for 10 minutes to obtain clear serum for analysis.'
  },
  {
    id: 'grey',
    colorName: 'Grey',
    capColor: 'bg-slate-400 shadow-slate-400/30',
    bloodGradient: 'from-red-950 to-red-900',
    additive: 'Sodium Fluoride & Potassium Oxalate',
    mechanism: 'Sodium fluoride acts as a glycolysis inhibitor, stopping blood cells from digesting glucose, while potassium oxalate prevents clotting.',
    tests: ['Fasting Blood Sugar (FBS)', 'Post-Prandial Blood Sugar (PPBS)', 'Random Blood Sugar (RBS)', 'Oral Glucose Tolerance Test (OGTT)'],
    department: 'Biochemistry (Glucose Analysis)',
    NABLGuideline: 'Essential for accurate sugar checks. If blood is collected in other tubes, glucose levels drop by ~10% per hour due to cellular glycolysis.'
  },
  {
    id: 'blue',
    colorName: 'Light Blue',
    capColor: 'bg-sky-400 shadow-sky-400/30',
    bloodGradient: 'from-red-800 to-red-950',
    additive: '3.2% Sodium Citrate (1:9 ratio)',
    mechanism: 'Reversible anticoagulant that binds calcium. Keeps blood in a stable state for clotting time evaluations.',
    tests: ['Prothrombin Time (PT / INR)', 'Activated Partial Thromboplastin Time (APTT)', 'D-Dimer'],
    department: 'Coagulation studies',
    NABLGuideline: 'Tubes must be filled precisely up to the fill mark (arrow) to maintain the exact 1:9 ratio of anticoagulant to blood. Under-filling invalidates results.'
  }
];

const SampleGuide = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('lavender');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const activeTube = TUBES_DATA.find(t => t.id === selectedId) || TUBES_DATA[0];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0d7a60] py-16 px-4 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full mb-5 border border-white/20">
            <BookOpen size={13} /> Educational Patient Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
            Blood Collection <span className="text-[#F1C40F]">Tube Guide</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Learn how samples are preserved in different vacutainers to guarantee 100% NABL-compliant test accuracy.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-[#F5F7F6] py-16 px-4 min-h-screen">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tubes Selector List (3D Visuals) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">
              Select Collection Tube
            </h3>
            
            <div className="space-y-3">
              {TUBES_DATA.map((t) => {
                const isSelected = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full p-4 rounded-3xl text-left border-2 flex items-center gap-5 transition-all ${
                      isSelected
                        ? 'border-[#085041] bg-white shadow-md'
                        : 'border-slate-100/80 bg-white/50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* CSS 3D Tube Render */}
                    <div className="w-12 h-20 shrink-0 flex justify-center items-start pt-1 relative">
                      {/* Cap */}
                      <div className={`w-6 h-5 rounded-t-md border-b border-black/10 z-10 transition-transform ${t.capColor} ${isSelected ? 'scale-105' : ''}`} />
                      
                      {/* Tube Body */}
                      <div className="absolute top-5 w-[20px] h-12 bg-white/30 border border-slate-300 rounded-b-full flex flex-col justify-end overflow-hidden backdrop-blur-[1px] shadow-inner">
                        {/* Liquid inside */}
                        {t.isSST ? (
                          <>
                            {/* Serum */}
                            <div className="h-[25px] bg-yellow-200/80 w-full border-b border-white/20"></div>
                            {/* Separator Gel */}
                            <div className="h-[5px] bg-slate-300 w-full"></div>
                            {/* Clotted Red Cells */}
                            <div className="h-[15px] bg-red-950 w-full"></div>
                          </>
                        ) : (
                          <div className={`w-full h-[32px] bg-gradient-to-t ${t.bloodGradient}`} />
                        )}
                        {/* Label */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-800 text-base">{t.colorName} Top</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{t.department}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tube Detail Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-lg border border-slate-100/50 p-6 md:p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="border-b border-slate-100 pb-5">
              <span className="text-[10px] font-black tracking-widest text-[#085041] uppercase bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                {activeTube.department}
              </span>
              <h2 className="text-2xl font-black text-slate-800 mt-3">{activeTube.colorName} Top Tube</h2>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Additive / Preservative</span>
                <p className="text-xs font-bold text-slate-700 leading-snug">{activeTube.additive}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Preservation Mechanism</span>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed">{activeTube.mechanism}</p>
              </div>
            </div>

            {/* Tests list */}
            <div className="space-y-3 font-sans">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Droplets size={16} className="text-red-500" />
                Common Tests Run From This Tube:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeTube.tests.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-xl border border-slate-50 bg-slate-50/30">
                    <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NABL Quality Guidelines Box */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-2 font-sans">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>NABL Quality Assurance Guideline</span>
              </div>
              <p className="text-xs text-emerald-700 font-semibold leading-relaxed">
                {activeTube.NABLGuideline}
              </p>
            </div>

            {/* Book Now Redirect */}
            <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Info size={16} className="text-[#085041]" />
                <p className="text-xs text-slate-500 font-semibold leading-snug">
                  Want to book a test matching this tube? Free home collection is included.
                </p>
              </div>
              <button
                onClick={() => navigate('/test-finder')}
                className="w-full sm:w-auto bg-[#085041] hover:bg-[#063b30] text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/10 transition-colors"
              >
                Find Tests <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>
      </section>

      <EmergencyWidget />
      <LiveChatWidget />
    </PublicLayout>
  );
};

export default SampleGuide;
