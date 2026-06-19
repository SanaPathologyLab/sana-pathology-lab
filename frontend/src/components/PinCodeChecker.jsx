import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, CheckCircle2, XCircle, Phone } from 'lucide-react';

const SERVICEABLE_PINCODES = [
  '244303', '244302', '244304', '244301', '244312',
  '202410', '202411', '202412', '202414', '202415',
  '202416', '202417', '202418', '202419', '202420',
  '202421', '202422', '202423', '202424', '202425',
  '202426', '243701', '243702', '243703', '243704',
  '243705', '243706', '243707', '243708', '243709',
  '243710', '244001', '244002', '244003', '244004',
  '244101', '244102', '244103', '244104', '244105',
  '244201', '244202', '244203', '244204', '244205',
  '244206', '244221', '244222', '244223', '244224',
  '244225', '244236', '244241', '244255', '244301',
  '244302', '244303', '244304', '244305', '244306',
  '244307', '244308',
];

const PinCodeChecker = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [expanded, setExpanded] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [checked, setChecked] = useState(false);
  const [isServiceable, setIsServiceable] = useState(false);
  const inputRef = useRef(null);
  const [animKey, setAnimKey] = useState(0);

  const handleCheck = () => {
    if (pinCode.length !== 6) return;
    setIsServiceable(SERVICEABLE_PINCODES.includes(pinCode));
    setChecked(true);
    setAnimKey((k) => k + 1);
  };

  const collapse = () => {
    setExpanded(false);
    setPinCode('');
    setChecked(false);
  };

  if (!expanded) {
    return (
      <button
        onClick={() => {
          setExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-lg shadow-[#1D9E75]/30 transition-all duration-200 hover:scale-105"
      >
        <MapPin className="w-4 h-4" />
        <span>{isEn ? 'Free Home Collection' : 'मुफ्त होम कलेक्शन'}</span>
      </button>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
      <div className="bg-gradient-to-r from-[#1D9E75] to-[#1D9E75]/90 px-5 py-3.5 flex items-start gap-3">
        <MapPin className="w-5 h-5 text-white mt-0.5 shrink-0" />
        <p className="text-white text-sm font-bold leading-snug flex-1">
          {isEn
            ? 'We offer FREE home collection in your area. Enter your PIN code to confirm.'
            : 'हम आपके क्षेत्र में मुफ्त होम कलेक्शन प्रदान करते हैं। अपना पिन कोड दर्ज करें।'}
        </p>
        <button
          onClick={collapse}
          className="text-white/80 hover:text-white transition-colors p-0.5 -mr-1 -mt-0.5"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 pt-4">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pinCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setPinCode(val);
              if (checked) setChecked(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && pinCode.length === 6) handleCheck();
            }}
            placeholder={isEn ? 'Enter 6-digit PIN code' : '6 अंकों का पिन कोड दर्ज करें'}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40 focus:border-[#1D9E75] transition-all"
          />
          <button
            onClick={handleCheck}
            disabled={pinCode.length !== 6}
            className="px-5 py-2.5 bg-[#1D9E75] text-white text-sm font-bold rounded-lg hover:bg-[#1D9E75]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-[#1D9E75]/20"
          >
            {isEn ? 'Check' : 'जांचें'}
          </button>
        </div>

        {checked && (
          <div
            key={animKey}
            className="mt-4 transition-all duration-300 animate-fade-in"
          >
            {isServiceable ? (
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-emerald-800 font-bold text-sm">
                    {isEn ? '✅ We collect in your area!' : '✅ हम आपके क्षेत्र में कलेक्शन करते हैं!'}
                  </p>
                  <p className="text-emerald-600 text-xs font-semibold mt-0.5">
                    {isEn ? 'Free home collection available' : 'मुफ्त होम कलेक्शन उपलब्ध'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-red-700 font-bold text-sm">
                    {isEn
                      ? "❌ Sorry, we don't currently serve this PIN code"
                      : '❌ क्षमा करें, हम इस पिन कोड पर सेवा नहीं देते'}
                  </p>
                  <a
                    href="tel:+916396786939"
                    className="inline-flex items-center gap-1.5 mt-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isEn ? '📞 Call us to check availability' : '📞 हमें कॉल करें'}</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PinCodeChecker;
