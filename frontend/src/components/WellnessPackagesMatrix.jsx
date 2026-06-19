import React, { useState, useRef, useEffect } from 'react';
import { Check, ArrowRight, Star, Award, TrendingUp, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const PACKAGES = [
  {
    tier: 'Sana Essential',
    tagline: 'Essential Checkup',
    badge: 'Most Popular',
    badgeColor: 'bg-secondary text-white',
    params: '40+ Parameters',
    originalPrice: 1500,
    price: 999,
    savings: '33%',
    tests: [
      'Complete Blood Count (CBC)',
      'Liver Function Test (LFT)',
      'Kidney Function Test (KFT)',
      'Fasting Blood Sugar (FBS)',
      'Lipid Profile',
      'Urine Examination (Routine & Microscopy)',
    ],
    highlights: ['Perfect for annual checkup', 'Covers all vital organs', '12 hr digital report'],
    icon: <Shield className="w-6 h-6" />,
  },
  {
    tier: 'Sana Advance',
    tagline: 'Full Body Screening',
    badge: 'Best Value',
    badgeColor: 'bg-cta text-white',
    params: '60+ Parameters',
    originalPrice: 3000,
    price: 1999,
    savings: '34%',
    tests: [
      'Complete Blood Count (CBC)',
      'Liver Function Test (LFT)',
      'Kidney Function Test (KFT)',
      'Fasting Blood Sugar (FBS)',
      'Lipid Profile',
      'Thyroid Profile (T3, T4, TSH)',
      'Vitamin D',
      'HbA1c (Glycosylated Haemoglobin)',
    ],
    highlights: ['Advanced health screening', 'Includes thyroid & Vitamin D', '24 hr detailed report'],
    icon: <Award className="w-6 h-6" />,
  },
  {
    tier: 'Sana Platinum',
    tagline: 'Comprehensive Wellness',
    badge: 'Ultimate',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900',
    params: '80+ Parameters',
    originalPrice: 5500,
    price: 3499,
    savings: '36%',
    tests: [
      'Complete Blood Count (CBC)',
      'Liver Function Test (LFT)',
      'Kidney Function Test (KFT)',
      'Fasting Blood Sugar (FBS)',
      'Lipid Profile',
      'Thyroid Profile (T3, T4, TSH)',
      'Vitamin D',
      'HbA1c (Glycosylated Haemoglobin)',
      'Serum Calcium',
      'CRP – C-Reactive Protein (Quantitative)',
      'Rheumatoid Factor',
      'Iron Studies',
    ],
    highlights: ['Most comprehensive panel', 'Includes cardiac & bone markers', 'Priority 12 hr reporting'],
    icon: <Star className="w-6 h-6" />,
  },
];

const WellnessPackagesMatrix = ({ scrollToSection, t, language }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const scrollTo = (index) => {
    setActiveIndex(index);
    if (scrollRef.current) {
      const card = scrollRef.current.children[index];
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  return (
    <section id="packages-matrix" className="py-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cta/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <span className="text-xs font-black tracking-widest text-emerald-400 uppercase bg-emerald-400/10 px-4 py-1.5 rounded-full border border-emerald-400/20">Sana Care Packages</span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-white mt-4">Choose Your Health Plan</h2>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto font-medium">Curated diagnostic packages designed by our pathologists for complete peace of mind</p>
          <div className="w-16 h-1 bg-cta mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Desktop: Side-by-Side Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-6 xl:gap-8">
          {PACKAGES.map((pkg, i) => (
            <div key={i} className={`relative bg-white/95 backdrop-blur-sm rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-2 ${i === 1 ? 'border-cta/30 shadow-xl shadow-cta/10 scale-105 ring-2 ring-cta/20' : 'border-slate-200/60 shadow-lg hover:shadow-xl'}`}>
              {i === 1 && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-cta to-cta-light text-white text-xs font-black text-center py-2 uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Star size={14} className="fill-white" />
                  <span>Recommended</span>
                  <Star size={14} className="fill-white" />
                </div>
              )}

              <div className={`p-7 ${i === 1 ? 'pt-12' : ''}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${i === 0 ? 'bg-secondary-pale text-secondary' : i === 1 ? 'bg-cta-pale text-cta' : 'bg-primary-pale text-primary'}`}>
                  {pkg.icon}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-black text-slate-800">{pkg.tier}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pkg.badgeColor}`}>{pkg.badge}</span>
                </div>
                <p className="text-sm text-slate-500 font-semibold mb-4">{pkg.params} • {pkg.tagline}</p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-black text-primary">₹{pkg.price}</span>
                  <span className="text-slate-400 line-through text-base font-bold">₹{pkg.originalPrice}</span>
                  <span className="text-emerald-600 font-extrabold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">Save {pkg.savings}</span>
                </div>

                {/* Tests List */}
                <div className="space-y-2 mb-6">
                  {pkg.tests.map((test, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-secondary-pale flex items-center justify-center shrink-0">
                        <Check size={12} className="text-secondary" />
                      </div>
                      <span className="text-sm text-slate-600 font-medium">{test}</span>
                    </div>
                  ))}
                </div>

                {/* Highlights */}
                <div className="border-t border-slate-100 pt-4 mb-6 space-y-2">
                  {pkg.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <TrendingUp size={14} className={i === 1 ? 'text-cta' : 'text-secondary'} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => scrollToSection('booking')} className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg ${i === 1 ? 'bg-gradient-to-r from-cta to-cta-light text-white shadow-cta/20 hover:-translate-y-0.5' : 'bg-primary text-white hover:bg-primary-light hover:-translate-y-0.5'}`}>
                  <span>Book Now</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Swipeable Carousel */}
        <div className="lg:hidden">
          <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {PACKAGES.map((pkg, i) => (
              <div key={i} className="snap-center shrink-0 w-[85vw] max-w-sm">
                <div className={`bg-white/95 backdrop-blur-sm rounded-3xl border overflow-hidden ${i === 1 ? 'border-cta/30 shadow-xl ring-2 ring-cta/20' : 'border-slate-200/60 shadow-lg'}`}>
                  {i === 1 && (
                    <div className="bg-gradient-to-r from-cta to-cta-light text-white text-xs font-black text-center py-2 uppercase tracking-widest">Recommended</div>
                  )}
                  <div className={`p-6 ${i === 1 ? 'pt-5' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${i === 0 ? 'bg-secondary-pale text-secondary' : i === 1 ? 'bg-cta-pale text-cta' : 'bg-primary-pale text-primary'}`}>{pkg.icon}</div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-black text-slate-800">{pkg.tier}</h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pkg.badgeColor}`}>{pkg.badge}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mb-3">{pkg.params} • {pkg.tagline}</p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-black text-primary">₹{pkg.price}</span>
                      <span className="text-slate-400 line-through text-sm font-bold">₹{pkg.originalPrice}</span>
                      <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded-full">Save {pkg.savings}</span>
                    </div>
                    <div className="space-y-1.5 mb-4">
                      {pkg.tests.slice(0, 6).map((test, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check size={11} className="text-secondary shrink-0" />
                          <span className="text-xs text-slate-600 font-medium">{test}</span>
                        </div>
                      ))}
                      {pkg.tests.length > 6 && <p className="text-xs text-secondary font-bold">+{pkg.tests.length - 6} more tests</p>}
                    </div>
                    <button onClick={() => scrollToSection('booking')} className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md ${i === 1 ? 'bg-gradient-to-r from-cta to-cta-light text-white' : 'bg-primary text-white'}`}>
                      Book Now - ₹{pkg.price}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {PACKAGES.map((_, i) => (
              <button key={i} onClick={() => scrollTo(i)} className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-8 bg-secondary' : 'w-2 bg-slate-600/30'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WellnessPackagesMatrix;
