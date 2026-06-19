import React, { useState, useEffect, useMemo } from 'react';
import { Tag, Check, X, BadgePercent, Gift } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const COUPONS = {
  'FIRST50': { discount: 50, type: 'flat', minOrder: 0, description: '₹50 off your first booking', descriptionHi: 'पहली बुकिंग पर ₹50 की छूट', usageLimit: 100, used: 0, expiryDate: '2026-12-31' },
  'WOMEN37': { discount: 37, type: 'percent', minOrder: 1000, description: "37% off Women's Package", descriptionHi: 'महिला पैकेज पर 37% छूट', usageLimit: 50, used: 0, expiryDate: '2026-12-31' },
  'SENIOR39': { discount: 39, type: 'percent', minOrder: 800, description: '39% off Senior Package', descriptionHi: 'सीनियर पैकेज पर 39% छूट', usageLimit: 50, used: 0, expiryDate: '2026-12-31' },
  'DOCTOR10': { discount: 10, type: 'percent', minOrder: 500, description: '10% off for doctor referrals', descriptionHi: 'डॉक्टर रेफरल पर 10% छूट', usageLimit: 100, used: 0, expiryDate: '2026-12-31' },
  'FAMILY20': { discount: 20, type: 'percent', minOrder: 2000, description: '20% off Family Package', descriptionHi: 'फैमिली पैकेज पर 20% छूट', usageLimit: 30, used: 0, expiryDate: '2026-12-31' },
  'HEALTH100': { discount: 100, type: 'flat', minOrder: 1500, description: '₹100 off Full Body Checkup', descriptionHi: 'पूर्ण शारीरिक जांच पर ₹100 छूट', usageLimit: 50, used: 0, expiryDate: '2026-12-31' },
};

const USAGE_STORAGE_KEY = 'sana_coupon_usage';

const getCouponUsage = () => {
  try {
    return JSON.parse(localStorage.getItem(USAGE_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const setCouponUsage = (code) => {
  const usage = getCouponUsage();
  usage[code] = (usage[code] || 0) + 1;
  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
  return usage;
};

const CouponSystem = ({ totalAmount, onCouponApplied, onCouponRemoved }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    if (appliedCoupon && totalAmount < appliedCoupon.minOrder) {
      handleRemove();
    }
  }, [totalAmount]);

  const validateCoupon = (couponCode) => {
    const upperCode = couponCode.toUpperCase().trim();

    if (!COUPONS[upperCode]) {
      return { valid: false, message: isEn ? 'Invalid coupon code' : 'अमान्य कूपन कोड' };
    }

    const coupon = COUPONS[upperCode];
    const expiry = new Date(coupon.expiryDate);

    if (expiry < now) {
      return { valid: false, message: isEn ? 'This coupon has expired' : 'यह कूपन समाप्त हो चुका है' };
    }

    if (totalAmount < coupon.minOrder) {
      return {
        valid: false,
        message: isEn
          ? `Minimum order of ₹${coupon.minOrder} required for this coupon`
          : `इस कूपन के लिए न्यूनतम ऑर्डर ₹${coupon.minOrder} आवश्यक है`,
      };
    }

    const usage = getCouponUsage();
    const currentUsage = usage[upperCode] || 0;
    if (currentUsage >= coupon.usageLimit) {
      return { valid: false, message: isEn ? 'This coupon has reached its usage limit' : 'यह कूपन अपनी उपयोग सीमा तक पहुंच गया है' };
    }

    let discountAmount = 0;
    if (coupon.type === 'flat') {
      discountAmount = coupon.discount;
    } else {
      discountAmount = Math.round((totalAmount * coupon.discount) / 100);
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    return {
      valid: true,
      coupon: { ...coupon, code: upperCode },
      discountAmount,
      finalAmount,
    };
  };

  const handleApply = () => {
    setError('');
    setChecking(true);

    const trimmed = code.trim();
    if (!trimmed) {
      setError(isEn ? 'Please enter a coupon code' : 'कृपया कूपन कोड दर्ज करें');
      setChecking(false);
      return;
    }

    const result = validateCoupon(trimmed);

    if (!result.valid) {
      setError(result.message);
      setChecking(false);
      return;
    }

    setCouponUsage(result.coupon.code);
    setAppliedCoupon(result.coupon);
    setError('');
    setChecking(false);

    if (onCouponApplied) {
      onCouponApplied(result.discountAmount, result.coupon.code);
    }
  };

  const handleRemove = () => {
    const removedCode = appliedCoupon?.code;
    setAppliedCoupon(null);
    setCode('');
    setError('');

    if (onCouponRemoved && removedCode) {
      onCouponRemoved(removedCode);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'flat') return appliedCoupon.discount;
    return Math.round((totalAmount * appliedCoupon.discount) / 100);
  }, [appliedCoupon, totalAmount]);

  if (!expanded && !appliedCoupon) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 text-[#1D9E75] hover:text-[#1D9E75]/80 text-sm font-bold transition-all duration-200"
      >
        <Tag className="w-4 h-4" />
        <span>{isEn ? 'Have a coupon code?' : 'कूपन कोड है?'}</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-[#1D9E75]" />
            <span className="text-sm font-bold text-slate-800">
              {appliedCoupon
                ? (isEn ? 'Coupon Applied' : 'कूपन लागू')
                : (isEn ? 'Have a coupon code?' : 'कूपन कोड है?')}
            </span>
          </div>
          {!appliedCoupon && (
            <button
              onClick={() => { setExpanded(false); setError(''); setCode(''); }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {appliedCoupon ? (
          <div className="mt-3 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-emerald-800 font-bold text-sm">
                  {isEn ? 'Coupon applied!' : 'कूपन लागू हो गया!'}
                </p>
                <p className="text-emerald-700 text-xs font-semibold mt-0.5">
                  {appliedCoupon.code} — {isEn ? appliedCoupon.description : appliedCoupon.descriptionHi}
                </p>
                <p className="text-emerald-600 text-xs font-bold mt-1">
                  {isEn
                    ? `Discount: -₹${discountAmount.toLocaleString('en-IN')}`
                    : `छूट: -₹${discountAmount.toLocaleString('en-IN')}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-1.5 hover:bg-emerald-100 rounded-full transition-colors shrink-0"
              aria-label={isEn ? 'Remove coupon' : 'कूपन हटाएं'}
            >
              <X className="w-4 h-4 text-emerald-500" />
            </button>
          </div>
        ) : (
          <>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder={isEn ? 'Enter coupon code' : 'कूपन कोड दर्ज करें'}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-gray-400 uppercase focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40 focus:border-[#1D9E75] transition-all"
              />
              <button
                onClick={handleApply}
                disabled={!code.trim() || checking}
                className="px-5 py-2.5 bg-[#1D9E75] text-white text-sm font-bold rounded-lg hover:bg-[#1D9E75]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-[#1D9E75]/20"
              >
                {checking
                  ? (isEn ? 'Checking...' : 'जांच रहे हैं...')
                  : (isEn ? 'Apply' : 'लागू करें')}
              </button>
            </div>

            {error && (
              <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-xs font-semibold">{error}</p>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Gift className="w-3.5 h-3.5 text-[#BA7517]" />
                <span className="text-xs font-bold text-slate-600">
                  {isEn ? 'Available Coupons' : 'उपलब्ध कूपन'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(COUPONS).map(([key, coupon]) => (
                  <div
                    key={key}
                    className="flex items-start gap-2 bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-200 rounded-lg px-3 py-2 cursor-pointer hover:from-amber-100 hover:to-amber-100/50 transition-colors"
                    onClick={() => { setCode(key); setError(''); }}
                  >
                    <BadgePercent className="w-3.5 h-3.5 text-[#BA7517] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-extrabold text-[#BA7517]">{key}</span>
                        <span className="text-[10px] font-bold text-[#BA7517]/70 bg-[#BA7517]/10 px-1.5 py-0.5 rounded-full">
                          {coupon.type === 'flat' ? `₹${coupon.discount}` : `${coupon.discount}%`}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 mt-0.5 leading-tight">
                        {isEn ? coupon.description : coupon.descriptionHi}
                      </p>
                      {coupon.minOrder > 0 && (
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {isEn ? `Min. order: ₹${coupon.minOrder}` : `न्यूनतम ऑर्डर: ₹${coupon.minOrder}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CouponSystem;
