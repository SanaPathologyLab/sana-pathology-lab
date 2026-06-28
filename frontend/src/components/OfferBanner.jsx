import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_OFFERS = [
  {
    id: 'eid-special',
    text: 'Eid Special — Full Body Checkup at \u20B9999',
    discountPercent: 33,
    expiryDate: '2026-12-31',
    applicableTests: ['CBC', 'LFT', 'KFT', 'FBS', 'LIPID'],
    bgGradient: 'from-emerald-600 to-teal-700',
    badge: '\uD83C\uDF89 Eid Special',
  },
  {
    id: 'monsoon-alert',
    text: 'Monsoon Alert — Dengue + Typhoid combo \u20B9499',
    discountPercent: 50,
    expiryDate: '2026-09-30',
    applicableTests: ['DENGUE-01', 'WIDAL1', 'TYPHIDOT-01'],
    bgGradient: 'from-blue-600 to-indigo-700',
    badge: '\uD83C\uDF27\uFE0F Monsoon Alert',
  },
  {
    id: 'women-day',
    text: "Women's Health Package — \u20B9799 only (Save 40%)",
    discountPercent: 40,
    expiryDate: '2026-07-31',
    applicableTests: ['CBC', 'TFT', 'VITD', 'URINE'],
    bgGradient: 'from-pink-500 to-rose-600',
    badge: '\uD83D\uDC69 Women\'s Care',
  },
];

const OfferBanner = ({ offers = DEFAULT_OFFERS }) => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const activeOffer = useMemo(() => {
    const now = new Date();
    return offers.find((o) => new Date(o.expiryDate) > now && !localStorage.getItem(`dismissedBanner_${o.id}`));
  }, [offers]);

  useEffect(() => {
    if (activeOffer) {
      const timer = setTimeout(() => setMounted(true), 100);
      setVisible(true);
      return () => clearTimeout(timer);
    }
    setVisible(false);
    setMounted(false);
  }, [activeOffer]);

  const handleDismiss = () => {
    if (activeOffer) {
      localStorage.setItem(`dismissedBanner_${activeOffer.id}`, 'true');
    }
    setVisible(false);
    setTimeout(() => setMounted(false), 300);
  };

  const handleBookNow = () => {
    window.dispatchEvent(new CustomEvent('open-booking-modal', { detail: { step: 0 } }));
  };

  const formatExpiry = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (!mounted || !activeOffer) return null;

  const gradient = activeOffer.bgGradient || activeOffer.bgColor || 'from-[#0F6E56] to-[#1D9E75]';
  const textColor = activeOffer.textColor || 'text-white';

  return (
    <div
      className={`relative overflow-hidden transition-all duration-500 ease-out ${
        visible ? 'max-h-32 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'
      }`}
    >
      <div className={`bg-gradient-to-r ${gradient} ${textColor} shadow-lg rounded-none sm:rounded-b-2xl mx-0 sm:mx-4 lg:mx-8`}>
        <div className="relative flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Sparkles className="hidden sm:block w-5 h-5 shrink-0 opacity-80" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {activeOffer.badge && (
                  <span className="text-xs font-bold bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-inner">
                    {activeOffer.badge}
                  </span>
                )}
                {activeOffer.discountPercent > 0 && (
                  <span className="text-xs font-extrabold bg-[#BA7517] text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                    {activeOffer.discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold mt-1 truncate leading-tight">{activeOffer.text}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 opacity-70" />
                <span className="text-xs opacity-70">Valid till {formatExpiry(activeOffer.expiryDate)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleBookNow}
              className="hidden sm:inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-extrabold px-4 py-2 rounded-full transition-all border border-white/20 shadow-md whitespace-nowrap"
            >
              {t('bookHomeCollection')}
            </button>
            <button
              onClick={handleDismiss}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={handleBookNow}
          className="sm:hidden w-full bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs font-extrabold py-2.5 transition-all border-t border-white/10 text-center"
        >
          {t('bookHomeCollection')}
        </button>
      </div>
    </div>
  );
};

export default OfferBanner;
