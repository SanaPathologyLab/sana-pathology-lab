import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Phone, MapPin, Menu, X, User, Download, ChevronDown,
  Clock, MessageCircle, Upload, Stethoscope, FlaskConical,
  Heart, Building2, BookOpen, Calculator, Home
} from 'lucide-react';
import Logo from './Logo';
import WhatsAppIcon from './WhatsAppIcon';
import EmergencyWidget from './EmergencyWidget';

/* ─────────────────────────────────────────────────
   TOP UTILITY BAR
───────────────────────────────────────────────── */
const UtilityBar = () => {
  const navigate = useNavigate();
  return (
    <div className="hidden md:block bg-[#063b30] text-white text-xs border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
        {/* Left items */}
        <div className="flex items-center divide-x divide-white/20">
          <a
            href="tel:+916396786939"
            className="flex items-center gap-1.5 pr-4 hover:text-emerald-300 transition-colors"
          >
            <Phone size={11} />
            <span className="font-semibold">24×7 Support: +91 63967 86939</span>
          </a>
          <div className="flex items-center gap-1.5 px-4 text-emerald-300 font-semibold">
            <Clock size={11} />
            <span>Same Day Collection Available</span>
          </div>
          <div className="flex items-center gap-1.5 pl-4 text-white/70">
            <MapPin size={11} />
            <span>Serving: Sambhal · Chandausi · Bahjoi · Sirsi</span>
          </div>
        </div>
        {/* Right items */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/report-lookup')}
            className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors font-semibold"
          >
            <Download size={11} />
            Download Report
          </button>
          <span className="text-white/20">|</span>
          <a
            href="https://wa.me/916396786939?text=Hi%20Sana%20Pathology%2C%20I%20need%20support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors font-semibold"
          >
            <MessageCircle size={11} />
            WhatsApp Support
          </a>
          <span className="text-white/20">|</span>
          <button
            onClick={() => navigate('/upload-prescription')}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white px-3 py-1 rounded-full transition-colors font-bold text-[11px]"
          >
            <Upload size={10} />
            Upload Rx
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   DROPDOWN COMPONENT
───────────────────────────────────────────────── */
const NavDropdown = ({ label, items }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-[#1D9E75] transition-colors py-2">
        {label}
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-52 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-gray-100 py-2 z-50 animate-fade-in-up">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => { setOpen(false); item.external ? window.open(item.href, '_blank') : navigate(item.href); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-[#E1F5EE] hover:text-[#0F6E56] transition-colors flex items-center gap-2.5 font-semibold"
            >
              {item.icon && <span className="text-[#1D9E75]">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────
   PUBLIC LAYOUT
───────────────────────────────────────────────── */
const PublicLayout = ({ children }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Inject Google Analytics
  useEffect(() => {
    if (!window.gtag) {
      const scriptId = 'ga-gtag';
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-MOCKID123';
        document.head.appendChild(script);
        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-MOCKID123');
        `;
        document.head.appendChild(inlineScript);
      }
    }
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  // Navigation items
  const servicesItems = [
    { label: 'Symptom Checker', href: '/symptom-checker', icon: <Stethoscope size={14} /> },
    { label: 'Health Calculators', href: '/health-calculators', icon: <Calculator size={14} /> },
    { label: 'Tests Catalog', href: '/tests-catalog', icon: <FlaskConical size={14} /> },
    { label: 'Upload Prescription', href: '/upload-prescription', icon: <Upload size={14} /> },
  ];
  const cityItems = [
    { label: 'Blood Test Sambhal', href: '/blood-test-sambhal', icon: <MapPin size={14} /> },
    { label: 'Blood Test Chandausi', href: '/blood-test-chandausi', icon: <MapPin size={14} /> },
    { label: 'Blood Test Bahjoi', href: '/blood-test-bahjoi', icon: <MapPin size={14} /> },
    { label: 'Home Collection Sambhal', href: '/home-collection-sambhal', icon: <Home size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7F6] relative font-sans text-slate-800 flex flex-col justify-between">

      {/* Top Utility Bar */}
      <UtilityBar />

      {/* Public Header */}
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
            : 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer shrink-0">
            <Logo className="w-11 h-11 drop-shadow-md" />
            <div>
              <h1 className="text-xl font-heading text-[#1D9E75] tracking-tight leading-none">
                {t('logoTitle')}
              </h1>
              <p className="text-[10px] text-[#1D9E75]/80 font-bold tracking-wide uppercase mt-0.5">
                {t('logoSub')}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5 mr-2">
            <NavDropdown label="Services" items={servicesItems} />
            <Link to="/health-packages" className="text-sm font-bold text-slate-600 hover:text-[#1D9E75] transition-colors">
              Packages
            </Link>
            <Link to="/our-doctors" className="text-sm font-bold text-slate-600 hover:text-[#1D9E75] transition-colors">
              Our Experts
            </Link>
            <Link to="/lab-tour" className="text-sm font-bold text-slate-600 hover:text-[#1D9E75] transition-colors">
              Lab Tour
            </Link>
            <Link to="/offers" className="text-sm font-bold text-slate-600 hover:text-[#1D9E75] transition-colors">
              Offers
            </Link>
            <NavDropdown label="City Pages" items={cityItems} />
            <Link to="/about" className="text-sm font-bold text-slate-600 hover:text-[#1D9E75] transition-colors">
              About
            </Link>
            <Link to="/blog" className="text-sm font-bold text-slate-600 hover:text-[#1D9E75] transition-colors">
              Blog
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="hidden md:flex items-center justify-center font-bold text-slate-600 bg-gray-100 hover:bg-gray-200 transition-colors w-9 h-9 rounded-full shadow-inner text-xs"
              title="Switch Language"
            >
              {language === 'en' ? 'HI' : 'EN'}
            </button>

            {/* Track Report */}
            <button
              onClick={() => navigate('/report-lookup')}
              className="hidden sm:flex items-center gap-1.5 bg-[#1D9E75]/10 hover:bg-[#1D9E75]/20 text-[#1D9E75] text-xs font-bold px-3.5 py-2 rounded-full transition-all border border-[#1D9E75]/20 whitespace-nowrap"
            >
              <Download size={13} />
              My Report
            </button>

            {/* Upload Prescription */}
            <button
              onClick={() => navigate('/upload-prescription')}
              className="hidden md:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-md shadow-amber-500/25 whitespace-nowrap"
            >
              <Upload size={13} />
              Upload Rx
            </button>

            {/* Staff Login */}
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1D9E75] hover:bg-[#0F6E56] transition-all px-4 py-2.5 rounded-full shadow-lg shadow-[#1D9E75]/30 whitespace-nowrap"
            >
              <User size={14} />
              {t('staffLogin')}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-slate-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 absolute top-[68px] left-0 w-full z-40 shadow-xl px-4 py-5 flex flex-col gap-1 animate-fade-in-up max-h-[80vh] overflow-y-auto">
            {/* Utility links on mobile */}
            <div className="flex flex-wrap gap-2 pb-3 mb-2 border-b border-gray-100">
              <a href="tel:+916396786939" className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Phone size={11} /> Call Lab
              </a>
              <a href="https://wa.me/916396786939" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <MessageCircle size={11} /> WhatsApp
              </a>
              <button onClick={() => { setMobileMenuOpen(false); navigate('/upload-prescription'); }} className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Upload size={11} /> Upload Rx
              </button>
            </div>
            {[
              { label: '🏥 Home', route: '/' },
              { label: '📦 Health Packages', route: '/health-packages' },
              { label: '🔬 Tests Catalog', route: '/tests-catalog' },
              { label: '🩺 Our Experts', route: '/our-doctors' },
              { label: '🏛️ Lab Tour', route: '/lab-tour' },
              { label: '🧮 Health Calculators', route: '/health-calculators' },
              { label: '🤒 Symptom Checker', route: '/symptom-checker' },
              { label: '🎁 Offers', route: '/offers' },
              { label: '🏢 Corporate', route: '/corporate' },
              { label: 'ℹ️ About Us', route: '/about' },
              { label: '📝 Health Blog', route: '/blog' },
              { label: '📍 Blood Test Sambhal', route: '/blood-test-sambhal' },
              { label: '📍 Blood Test Chandausi', route: '/blood-test-chandausi' },
              { label: '📄 My Report', route: '/report-lookup' },
            ].map((item) => (
              <button
                key={item.route}
                onClick={() => { setMobileMenuOpen(false); navigate(item.route); }}
                className="text-left font-semibold text-slate-700 py-2.5 hover:text-[#1D9E75] px-2 rounded-lg hover:bg-emerald-50 transition-colors text-sm"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* ─── PREMIUM FOOTER ─── */}
      <footer className="bg-[#063b30] pt-16 pb-0 text-[#A7D8CB]">
        {/* Top strip: certifications */}
        <div className="border-b border-white/10 pb-10 mb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              {[
                { badge: '🏅', label: 'NABL Accredited', sub: 'ISO 15189:2012' },
                { badge: '🛡️', label: 'Govt. Registered', sub: 'Reg. No. UP-XXXX' },
                { badge: '⚕️', label: 'Qualified Pathologists', sub: 'MD, DNB Certified' },
                { badge: '📋', label: 'Digital Reports', sub: 'WhatsApp & Email' },
                { badge: '🚑', label: 'Home Collection', sub: 'Same Day Available' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="text-2xl">{c.badge}</span>
                  <div>
                    <p className="text-white font-bold text-sm leading-none">{c.label}</p>
                    <p className="text-white/50 text-xs mt-0.5">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-heading text-white mb-2">{t('logoTitle')}</h3>
            <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-4">ISO Certified Diagnostic Centre</p>
            <p className="text-sm opacity-75 leading-relaxed mb-6">
              Providing high-quality diagnostic services with precision accuracy, modern equipment, and registered pathologists. Trusted by 15,000+ patients across Sambhal, Chandausi, Bahjoi and Sirsi.
            </p>
            <div className="flex items-center gap-3">
              <a href="tel:+916396786939" className="flex items-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all">
                <Phone size={14} /> +91 63967 86939
              </a>
              <a
                href="https://wa.me/916396786939?text=Hi%20Sana%20Pathology"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-sm opacity-75">
              {[
                { label: 'Book Home Collection', route: '/book-appointment' },
                { label: 'Health Packages', route: '/health-packages' },
                { label: 'Symptom Checker', route: '/symptom-checker' },
                { label: 'Upload Prescription', route: '/upload-prescription' },
                { label: 'Track Report', route: '/track' },
                { label: 'Our Experts', route: '/our-doctors' },
                { label: 'Lab Tour', route: '/lab-tour' },
                { label: 'Health Calculators', route: '/health-calculators' },
              ].map(l => (
                <li key={l.route}>
                  <Link to={l.route} className="hover:text-white transition-colors hover:pl-1 duration-200 flex items-center gap-1">
                    → {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services & City */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">City Services</h4>
            <ul className="space-y-2 text-sm opacity-75">
              {[
                { label: 'Blood Test Sambhal', route: '/blood-test-sambhal' },
                { label: 'Blood Test Chandausi', route: '/blood-test-chandausi' },
                { label: 'Blood Test Bahjoi', route: '/blood-test-bahjoi' },
                { label: 'Home Collection Sambhal', route: '/home-collection-sambhal' },
                { label: 'Corporate Wellness', route: '/corporate' },
                { label: 'About Us', route: '/about' },
                { label: 'Privacy Policy', route: '/privacy-policy' },
                { label: 'Terms of Service', route: '/terms' },
              ].map(l => (
                <li key={l.route}>
                  <Link to={l.route} className="hover:text-white transition-colors hover:pl-1 duration-200 flex items-center gap-1">
                    → {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Hours */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">{t('contactInfo')}</h4>
            <ul className="space-y-3 text-sm opacity-75">
              <li className="flex items-start gap-2">
                <Phone size={13} className="mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-white font-semibold">+91 6396786939</p>
                  <p>+91 6397240575</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={13} className="mt-0.5 shrink-0 text-emerald-400" />
                <span>Datawali Road, Hayat Nagar, Sambhal, UP – 244303</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={13} className="mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-white font-semibold">Lab Timings</p>
                  <p>Mon–Sat: 7:00 AM – 8:00 PM</p>
                  <p>Sunday: 8:00 AM – 1:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
            <p>© {new Date().getFullYear()} Sana Pathology Lab. All rights reserved. | ISO 15189 Certified</p>
            <p>
              Made with ❤️ for better healthcare in Sambhal &nbsp;·&nbsp;
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
              &nbsp;·&nbsp;
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Emergency Floating Widget (replaces old phone+whatsapp buttons) */}
      <EmergencyWidget />
    </div>
  );
};

export default PublicLayout;
