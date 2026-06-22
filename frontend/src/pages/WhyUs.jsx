import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  UserCircle, FlaskConical, Award, FileText, ShieldCheck, Clock, Heart, Zap, Phone,
  CheckCircle2, Activity, Microscope, ArrowRight, Package, Search, Calendar, MessageCircle, MapPin
} from 'lucide-react';
import PublicHomeHeader from '../components/PublicHomeHeader';
import SocialProofTicker from '../components/SocialProofTicker';
import LiveAvailabilityIndicator from '../components/LiveAvailabilityIndicator';
import EmergencyWidget from '../components/EmergencyWidget';
import LiveChatWidget from '../components/LiveChatWidget';

const WhyUs = () => {
  const { t, language } = useLanguage();
  const [countersVisible, setCountersVisible] = useState(false);
  const [counterValues, setCounterValues] = useState({ patients: 0, tests: 0, years: 0, reports: 0 });
  const statsRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = ['slide1.png', 'slide2.png', 'slide3.png'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countersVisible) setCountersVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [countersVisible]);

  useEffect(() => {
    if (countersVisible) {
      const targets = { patients: 15000, tests: 80, years: 12, reports: 50000 };
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounterValues({
          patients: Math.round(targets.patients * eased),
          tests: Math.round(targets.tests * eased),
          years: Math.round(targets.years * eased),
          reports: Math.round(targets.reports * eased),
        });
        if (step >= steps) clearInterval(timer);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [countersVisible]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-bg font-sans text-slate-800">
      <PublicHomeHeader />

      {/* Hero Mini Section */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0b6b55]">
        {slides.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-[0.1] scale-105' : 'opacity-0 scale-100'}`}>
            <img src={slide} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-[#063b30]/95 via-[#085041]/85 to-[#0b6b55]/40"></div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/40 to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md border border-white/20">
            <ShieldCheck size={16} className="text-[#F1C40F]" />
            {t('isoCertified')}
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-white leading-tight mb-4">
            {t('whyUs')}
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/80 max-w-2xl mx-auto font-medium">
            Discover what makes Sana Pathology the most trusted diagnostic center in Sambhal — precision, care, and compassion.
          </p>
          <LiveAvailabilityIndicator />
        </div>
      </section>

      <SocialProofTicker />

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-white relative overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[400px] h-[400px] bg-primary-pale/25 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary-pale px-4 py-1.5 rounded-full">{t('byTheNumbers')}</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mt-4 mb-2">{t('trustedByThousands')}</h2>
            <p className="text-slate-500 font-semibold">{t('statsSub')}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: t('patientsServed'), value: counterValues.patients.toLocaleString() + '+', icon: <UserCircle className="w-6 h-6" />, color: 'text-primary', bg: 'bg-primary/5' },
              { label: t('testsAvailable'), value: counterValues.tests + '+', icon: <FlaskConical className="w-6 h-6" />, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: t('yearsOfService'), value: counterValues.years + '+', icon: <Award className="w-6 h-6" />, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: t('reportsDelivered'), value: counterValues.reports.toLocaleString() + '+', icon: <FileText className="w-6 h-6" />, color: 'text-purple-700', bg: 'bg-purple-50' },
            ].map((s, i) => (
              <div key={i} className="bg-white/50 backdrop-blur-md rounded-3xl border border-slate-100 p-8 text-center shadow hover:shadow-lg hover:border-primary-light/25 transition-all duration-300 hover:-translate-y-1">
                <div className={`${s.bg} ${s.color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner`}>{s.icon}</div>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, label: t('nablAccredited'), color: 'text-primary bg-primary-pale/40 border-emerald-200/50' },
              { icon: <Award className="w-4 h-4" />, label: t('iso15189'), color: 'text-blue-700 bg-blue-50/40 border-blue-200/50' },
              { icon: <Clock className="w-4 h-4" />, label: t('tat612hr'), color: 'text-accent bg-accent-pale/40 border-amber-200/50' },
              { icon: <Heart className="w-4 h-4" />, label: t('compassionateCare'), color: 'text-rose-600 bg-rose-50/40 border-rose-200/50' },
              { icon: <Zap className="w-4 h-4" />, label: t('digitalReports'), color: 'text-purple-700 bg-purple-50/40 border-purple-200/50' },
              { icon: <Phone className="w-4 h-4" />, label: t('freeHomeCollection'), color: 'text-teal-700 bg-teal-50/40 border-teal-200/50' },
            ].map((badge, i) => (
              <div key={i} className={`inline-flex items-center gap-2 border px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 ${badge.color}`}>
                {badge.icon} {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-b from-primary-pale/30 via-white to-bg px-4 sm:px-6 lg:px-8 border-y border-emerald-100/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black tracking-widest text-primary uppercase bg-primary-pale px-4 py-1.5 rounded-full">{t('process')}</span>
            <h2 className="text-4xl font-heading text-primary font-black mt-4">{t('howItWorks')}</h2>
            <p className="text-slate-500 mt-2 font-semibold">{t('processSub')}</p>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {[
              { step: '01', title: t('step1Title'), desc: t('step1Desc') },
              { step: '02', title: t('step2Title'), desc: t('step2Desc') },
              { step: '03', title: t('step3Title'), desc: t('step3Desc') },
              { step: '04', title: t('step4Title'), desc: t('step4Desc') },
              { step: '05', title: t('step5Title'), desc: t('step5Desc') }
            ].map((item, index) => (
              <div key={index} className="relative flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-primary-light flex items-center justify-center text-primary font-bold text-xl shadow group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-light group-hover:text-white group-hover:border-transparent group-hover:shadow-lg transition-all duration-300 z-10 group-hover:-translate-y-1">
                  {item.step}
                </div>
                <h3 className="font-extrabold text-slate-800 mt-5 mb-2 text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm max-w-[200px] leading-relaxed font-semibold">{item.desc}</p>
                {index < 4 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[3px] bg-gradient-to-r from-primary-light/30 to-primary-light/10 z-0 group-hover:from-primary group-hover:to-primary-light/30 transition-all duration-500"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links to Other Pages */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center text-slate-800 mb-10">Explore More</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: t('packages'), path: '/packages', color: 'from-emerald-500 to-teal-600' },
              { icon: Search, label: t('testFinder'), path: '/test-finder', color: 'from-blue-500 to-indigo-600' },
              { icon: Calendar, label: t('bookOnline'), path: '/book-online', color: 'from-amber-500 to-orange-600' },
              { icon: MessageCircle, label: t('faq'), path: '/faq', color: 'from-purple-500 to-pink-600' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}
                  className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-90`}></div>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <Icon className="w-8 h-8 mb-3 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-bold text-lg">{item.label}</h3>
                    <p className="text-white/70 text-sm mt-1 group-hover:text-white transition-colors">Learn more →</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#085041] pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-primary-pale">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-heading text-white mb-4">{t('logoTitle')}</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-6">{t('footerDesc')}</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/why-us" className="hover:text-white transition-colors">{t('whyUs')}</Link></li>
              <li><Link to="/packages" className="hover:text-white transition-colors">{t('packages')}</Link></li>
              <li><Link to="/test-finder" className="hover:text-white transition-colors">{t('testFinder')}</Link></li>
              <li><Link to="/book-online" className="hover:text-white transition-colors">{t('bookOnline')}</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">{t('faq')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#F1C40F] mb-4">Location & Hours</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><strong>Address:</strong> Datawali Road, Near Aara Machine, Hayat Nagar, Sambhal-244303</li>
              <li><strong>Hours:</strong> Mon-Sat: 7:00 AM - 8:00 PM | Sun: 8:00 AM - 1:00 PM</li>
              <li><strong>Support:</strong> +91 6396786939</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">{t('certifications')}</h4>
            <div className="inline-block bg-white/10 px-4 py-2 rounded-lg border border-white/20">
              <span className="font-bold tracking-widest text-white text-xs">{t('nablAccredited')}</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center border-t border-white/10 pt-8 text-sm opacity-60">
          {t('copyright')}
        </div>
      </footer>

      <EmergencyWidget />
      <LiveChatWidget />
    </div>
  );
};

export default WhyUs;
