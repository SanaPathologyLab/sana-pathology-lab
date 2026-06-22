import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Award, Package, Search, Calendar, MessageCircle, MapPin,
  UserCircle, ShoppingCart, Menu, X
} from 'lucide-react';
import Logo from './Logo';

const NAV_TABS = [
  { id: 'why-us', labelKey: 'whyUs', icon: Award, path: '/why-us' },
  { id: 'packages', labelKey: 'packages', icon: Package, path: '/packages' },
  { id: 'test-finder', labelKey: 'testFinder', icon: Search, path: '/test-finder' },
  { id: 'book-online', labelKey: 'bookOnline', icon: Calendar, path: '/book-online' },
  { id: 'faq', labelKey: 'faq', icon: MessageCircle, path: '/faq' },
  { id: 'contact', labelKey: 'contact', icon: MapPin, path: '/contact' },
];

const PublicHomeHeader = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, toggleLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const activeTab = NAV_TABS.find(tab => location.pathname === tab.path)?.id || (location.pathname === '/' ? 'why-us' : null);

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-100'
          : 'bg-white/70 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <div className="relative">
            <Logo className="w-11 h-11 md:w-13 md:h-13 drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute -inset-1 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-heading text-primary tracking-tight leading-none">
              {t('logoTitle')}
            </h1>
            <p className="text-[10px] md:text-xs text-primary-light font-bold tracking-wide uppercase mt-0.5">{t('logoSub')}</p>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:flex items-center">
          <div className="relative flex items-center bg-slate-100/60 p-1 rounded-2xl border border-slate-200/50 shadow-inner">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { navigate(tab.path); window.scrollTo(0, 0); }}
                  className={`relative px-4 py-2.5 text-xs font-black rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'text-white shadow-lg scale-105'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/40'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light rounded-xl shadow-lg shadow-primary/25 animate-fade-in"></span>
                  )}
                  <Icon className={`relative z-10 w-4 h-4 ${isActive ? 'animate-bounce-subtle' : ''}`} />
                  <span className="relative z-10">{tab.labelKey === 'whyUs' ? t('whyUs') : t(tab.labelKey)}</span>
                </button>
              );
            })}
            {/* Glowing active indicator */}
            {activeTab && (
              <span
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full shadow-lg shadow-primary/40 animate-fade-in"
              />
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="hidden sm:flex items-center justify-center font-black text-white bg-gradient-to-br from-primary via-primary-light to-emerald-400 hover:from-emerald-500 hover:via-primary-light hover:to-primary transition-all duration-300 w-12 h-12 rounded-2xl text-base border-2 border-white/30 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 active:scale-90 animate-pulse-glow-teal relative overflow-hidden group"
            title="Switch Language"
          >
            <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            <span className="relative z-10 text-[10px] font-black">{language === 'en' ? 'हिंदी' : 'ENGLISH'}</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate('/book-online')}
            className="relative flex items-center justify-center w-12 h-12 text-rose-500 bg-gradient-to-br from-rose-100 via-pink-100 to-rose-50 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 transition-all duration-300 rounded-2xl border-2 border-rose-200 hover:border-rose-400 shadow-lg shadow-rose-200/40 hover:shadow-xl hover:shadow-rose-300/50 active:scale-90 group"
            title="Your Booking Cart"
          >
            <ShoppingCart className="w-6 h-6 text-rose-400 group-hover:text-white transition-all duration-300 group-hover:scale-110 drop-shadow-sm" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full border-2 border-white min-w-[22px] text-center leading-tight shadow-lg shadow-rose-400/50 animate-bounce-subtle">
                {cartCount}
              </span>
            )}
          </button>

          {/* Staff Login */}
          <button
            onClick={() => navigate('/login')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-light transition-all px-4 py-2.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
          >
            <UserCircle size={16} />
            {t('staffLogin')}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl animate-fade-in-up">
          <div className="px-4 py-4 flex flex-col gap-1.5">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { navigate(tab.path); window.scrollTo(0, 0); setMobileOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 to-primary-light/10 text-primary border border-primary/20'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className="flex-1">{t(tab.labelKey)}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                </button>
              );
            })}

            <div className="h-px bg-slate-100 my-2"></div>

            <button
              onClick={() => { navigate('/login'); setMobileOpen(false); }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-primary-light"
            >
              <UserCircle size={18} />
              {t('staffLogin')}
            </button>

            <button
              onClick={() => { toggleLanguage(); setMobileOpen(false); }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 border border-slate-100"
            >
              <span className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-black">
                {language === 'en' ? 'हि' : 'EN'}
              </span>
              Switch to {language === 'en' ? 'Hindi' : 'English'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHomeHeader;
