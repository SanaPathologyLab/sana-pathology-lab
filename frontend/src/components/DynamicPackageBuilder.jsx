import React, { useState, useMemo } from 'react';
import { Package, Gift, Check, Plus, IndianRupee, BadgePercent } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const POPULAR_TESTS = [
  { code: 'CBC', name: 'Complete Blood Count', nameHi: 'सीबीसी (रक्त जांच)', price: 200 },
  { code: 'FBS', name: 'Fasting Blood Sugar', nameHi: 'खाली पेट शुगर', price: 100 },
  { code: 'LFT', name: 'Liver Function Test', nameHi: 'लिवर फंक्शन टेस्ट', price: 500 },
  { code: 'KFT', name: 'Kidney Function Test', nameHi: 'किडनी फंक्शन टेस्ट', price: 500 },
  { code: 'LIPID', name: 'Lipid Profile', nameHi: 'लिपिड प्रोफाइल', price: 650 },
  { code: 'THYROID', name: 'Thyroid Profile (T3, T4, TSH)', nameHi: 'थायराइड प्रोफाइल', price: 500 },
  { code: 'VITD', name: 'Vitamin D (25-OH)', nameHi: 'विटामिन डी', price: 800 },
  { code: 'HBA1C', name: 'HbA1c (Glycated Hemoglobin)', nameHi: 'एचबीए1सी', price: 400 },
  { code: 'URINE', name: 'Urine Routine', nameHi: 'यूरिन रूटीन', price: 150 },
  { code: 'ESR', name: 'ESR', nameHi: 'ईएसआर', price: 150 },
  { code: 'URIC', name: 'Uric Acid', nameHi: 'यूरिक एसिड', price: 100 },
  { code: 'CA', name: 'Calcium Serum', nameHi: 'कैल्शियम', price: 200 },
];

const DynamicPackageBuilder = ({ onAddToCart }) => {
  const { language, t } = useLanguage();
  const [selected, setSelected] = useState(new Set());
  const [showSummary, setShowSummary] = useState(false);

  const toggleTest = (code) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      setShowSummary(next.size > 0);
      return next;
    });
  };

  const selectedTests = useMemo(
    () => POPULAR_TESTS.filter((t) => selected.has(t.code)),
    [selected]
  );

  const individualTotal = useMemo(
    () => selectedTests.reduce((sum, t) => sum + t.price, 0),
    [selectedTests]
  );

  const discountPercent = useMemo(() => {
    const count = selectedTests.length;
    if (count >= 5) return 15;
    if (count >= 3) return 10;
    return 0;
  }, [selectedTests.length]);

  const discountAmount = useMemo(
    () => Math.round(individualTotal * (discountPercent / 100)),
    [individualTotal, discountPercent]
  );

  const finalPrice = useMemo(
    () => individualTotal - discountAmount,
    [individualTotal, discountAmount]
  );

  const savings = individualTotal - finalPrice;

  const handleAddToCart = () => {
    if (onAddToCart && selectedTests.length > 0) {
      onAddToCart(selectedTests);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-emerald-100 rounded-xl">
          <Package className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'hi' ? 'अपना कस्टम पैकेज बनाएं' : 'Build Your Custom Package'}
          </h2>
          <p className="text-sm text-gray-500">
            {language === 'hi'
              ? 'नीचे दिए गए टेस्ट में से चुनें और बचत करें'
              : 'Select from popular tests below and save'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {POPULAR_TESTS.map((test) => {
          const isSelected = selected.has(test.code);
          return (
            <button
              key={test.code}
              type="button"
              onClick={() => toggleTest(test.code)}
              className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100/50 scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm'
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-500 scale-110'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </div>

              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {test.code}
                </span>
                <span className="block text-sm font-semibold text-gray-800 leading-tight mt-0.5">
                  {language === 'hi' ? test.nameHi : test.name}
                </span>
                {language === 'hi' && (
                  <span className="block text-xs text-gray-400 mt-0.5">{test.name}</span>
                )}
                <div className="flex items-center gap-1 mt-1.5 text-emerald-700 font-bold text-sm">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{test.price}</span>
                </div>
              </div>

              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md animate-bounce-in">
                  <Plus className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showSummary && (
        <div className="mt-6 transition-all duration-300 ease-out">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <Gift className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="font-bold text-gray-800">
                    {language === 'hi'
                      ? `चयनित टेस्ट (${selectedTests.length})`
                      : `Selected Tests (${selectedTests.length})`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(new Set());
                    setShowSummary(false);
                  }}
                  className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                >
                  {language === 'hi' ? 'सभी हटाएं' : 'Clear All'}
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {selectedTests.map((test) => (
                  <div
                    key={test.code}
                    className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTest(test.code)}
                        className="w-4 h-4 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center shrink-0 transition-colors"
                      >
                        <svg className="w-2.5 h-2.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {language === 'hi' ? test.nameHi : test.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-800 shrink-0 ml-2">
                      ₹{test.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {language === 'hi' ? 'व्यक्तिगत कुल' : 'Individual Total'}
                  </span>
                  <span className="font-semibold text-gray-800">₹{individualTotal}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <BadgePercent className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 font-semibold">
                        {language === 'hi'
                          ? `बंडल छूट (${discountPercent}% ऑफ)`
                          : `Bundle Discount (${discountPercent}% OFF)`}
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-600">-₹{discountAmount}</span>
                  </div>
                )}

                {discountPercent === 0 && selectedTests.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-gray-400 bg-amber-50 rounded-lg px-3 py-2">
                    <span>
                      {language === 'hi'
                        ? `${3 - selectedTests.length} और टेस्ट चुनें और 10% छूट पाएं`
                        : `Add ${3 - selectedTests.length} more test(s) to get 10% off`}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-base font-bold border-t border-gray-100 pt-2.5">
                  <span className="text-gray-900">
                    {language === 'hi' ? 'अंतिम मूल्य' : 'Final Price'}
                  </span>
                  <span className="text-emerald-700 text-lg">₹{finalPrice}</span>
                </div>

                {savings > 0 && (
                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl py-2.5 px-4 animate-fade-in">
                    <Gift className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-extrabold text-emerald-700">
                      {language === 'hi'
                        ? `आप बचा रहे हैं ₹${savings}`
                        : `You save ₹${savings}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 transition-colors flex items-center justify-center gap-2 text-base"
            >
              <Plus className="w-5 h-5" />
              {language === 'hi'
                ? 'बुकिंग में जोड़ें'
                : 'Add to Booking'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DynamicPackageBuilder;
