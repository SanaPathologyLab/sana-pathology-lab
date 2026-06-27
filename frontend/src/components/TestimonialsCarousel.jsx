import React, { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sunita Sharma',
    city: 'Sambhal',
    rating: 5,
    avatar: 'SS',
    color: 'from-rose-400 to-pink-500',
    review: 'Bahut hi acchi service hai. Phlebotomist samay par aaya aur report WhatsApp par 6 ghante mein aa gayi. Bilkul sahi results. Highly recommended!',
    reviewEn: 'Excellent service! The phlebotomist arrived on time and the report came on WhatsApp in just 6 hours. Accurate results. Highly recommended!',
    test: 'Complete Blood Count + Lipid Profile',
    date: 'June 2025',
  },
  {
    name: 'Mohammad Rizwan',
    city: 'Chandausi',
    rating: 5,
    avatar: 'MR',
    color: 'from-blue-400 to-indigo-500',
    review: 'Main bahut khush hoon. Prices bilkul affordable hain aur quality top-notch hai. Diabetes checkup ke liye ye lab best hai Sambhal mein.',
    reviewEn: 'Very happy with this lab! Prices are very affordable and the quality is top-notch. Best lab in Sambhal for diabetes checkup.',
    test: 'HbA1c + Fasting Blood Sugar',
    date: 'May 2025',
  },
  {
    name: 'Priya Agarwal',
    city: 'Bahjoi',
    rating: 5,
    avatar: 'PA',
    color: 'from-emerald-400 to-teal-500',
    review: 'Family health package lia tha. Sab tests ek saath ho gaye aur report bilkul clear aur samajhne mein aasaan thi. Staff bhi bahut cooperative tha.',
    reviewEn: 'Took the Family Health Package. All tests done together, report was very clear and easy to understand. Staff was extremely cooperative.',
    test: 'Family Health Package (4 Members)',
    date: 'June 2025',
  },
  {
    name: 'Rahul Verma',
    city: 'Sirsi',
    rating: 5,
    avatar: 'RV',
    color: 'from-amber-400 to-orange-500',
    review: 'Online booking bahut easy tha. Ghar par collection free mili. Report same day mili aur doctor ne bhi confirm kiya ki results accurate hain.',
    reviewEn: 'Online booking was very easy. Free home collection was provided. Got same-day reports and my doctor confirmed the results were accurate.',
    test: 'Thyroid Profile (T3, T4, TSH)',
    date: 'July 2025',
  },
  {
    name: 'Aisha Khan',
    city: 'Sambhal',
    rating: 5,
    avatar: 'AK',
    color: 'from-violet-400 to-purple-500',
    review: 'Vitamin D aur B12 test karvaya. Report detail mein thi aur normal range bhi clearly show hui. Price bhi bahut reasonable hai. Thank you Sana Lab!',
    reviewEn: 'Got Vitamin D and B12 tested. Report was detailed with normal ranges clearly shown. Very reasonable price. Thank you Sana Lab!',
    test: 'Vitamin D + B12 Panel',
    date: 'June 2025',
  },
  {
    name: 'Suresh Gupta',
    city: 'Asmoli',
    rating: 5,
    avatar: 'SG',
    color: 'from-cyan-400 to-blue-500',
    review: 'Mere pite ke liye Liver Function Test karvaya. Bahut sahi service, report PDF format mein mili. Lab ka support team bhi bahut helpful hai.',
    reviewEn: 'Got Liver Function Test done for my father. Excellent service, received PDF report. Lab support team is very helpful and responsive.',
    test: 'Liver Function Test (LFT)',
    date: 'May 2025',
  },
];

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star
        key={i}
        size={14}
        className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
      />
    ))}
  </div>
);

const TestimonialsCarousel = ({ language = 'en' }) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback((idx) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(idx);
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating]);

  const prev = () => goTo((current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = useCallback(() => goTo((current + 1) % TESTIMONIALS.length), [current, goTo]);

  // Auto-advance every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const t = TESTIMONIALS[current];
  const prevIdx = (current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
  const nextIdx = (current + 1) % TESTIMONIALS.length;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-[#063b30] to-slate-900 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-black tracking-widest text-emerald-400 uppercase bg-emerald-400/10 px-4 py-1.5 rounded-full border border-emerald-400/20">
            Patient Reviews
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-4 mb-2">
            Trusted by Thousands in Sambhal
          </h2>
          <p className="text-slate-400 font-medium">
            Real feedback from our patients — unedited, authentic
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}
            </div>
            <span className="text-white font-black">4.9/5</span>
            <span className="text-slate-400 text-sm">from 500+ reviews</span>
          </div>
        </div>

        {/* Main carousel */}
        <div className="relative flex items-center gap-4">
          {/* Prev button */}
          <button
            onClick={prev}
            className="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[280px]">
            {/* Side card (prev) */}
            <div className="hidden md:block opacity-40 scale-95 transition-all duration-400">
              <ReviewCard t={TESTIMONIALS[prevIdx]} language={language} />
            </div>

            {/* Center card */}
            <div className={`transition-all duration-400 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <ReviewCard t={t} language={language} featured />
            </div>

            {/* Side card (next) */}
            <div className="hidden md:block opacity-40 scale-95 transition-all duration-400">
              <ReviewCard t={TESTIMONIALS[nextIdx]} language={language} />
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={next}
            className="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-2 bg-emerald-400' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const ReviewCard = ({ t, language, featured }) => (
  <div className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-6 flex flex-col h-full transition-all ${
    featured ? 'border-emerald-400/30 shadow-2xl shadow-emerald-900/20' : 'border-white/10'
  }`}>
    <Quote size={24} className="text-emerald-400/50 mb-3 shrink-0" />
    <p className="text-white/80 text-sm leading-relaxed flex-1 font-medium line-clamp-4">
      "{language === 'hi' ? t.review : t.reviewEn}"
    </p>
    <div className="mt-4 pt-4 border-t border-white/10">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-sm shrink-0`}>
          {t.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm truncate">{t.name}</p>
          <p className="text-slate-400 text-xs">{t.city} · {t.date}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <StarRating rating={t.rating} />
        <span className="text-[10px] text-slate-400 font-medium truncate ml-2">{t.test}</span>
      </div>
    </div>
  </div>
);

export default TestimonialsCarousel;
