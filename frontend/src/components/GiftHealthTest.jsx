import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import WhatsAppIcon from './WhatsAppIcon';
import { Gift, Heart, User, Phone, MessageCircle, CheckCircle2, ArrowRight, Copy } from 'lucide-react';

const GIFT_TESTS = [
  { code: 'PKG-FIT', name: 'Full Body Checkup', nameHi: 'पूर्ण शारीरिक जांच', price: 999 },
  { code: 'CBC', name: 'Complete Blood Count', nameHi: 'सीबीसी (रक्त जांच)', price: 200 },
  { code: 'VITD', name: 'Vitamin D Test', nameHi: 'विटामिन डी टेस्ट', price: 800 },
  { code: 'THYROID', name: 'Thyroid Profile', nameHi: 'थायराइड प्रोफाइल', price: 500 },
  { code: 'PKG-SENIOR', name: 'Senior Citizen Package', nameHi: 'सीनियर सिटीजन पैकेज', price: 1499 },
  { code: 'PKG-WOMEN', name: 'Women Health Package', nameHi: 'महिला स्वास्थ्य पैकेज', price: 1799 },
];

const STEPS = ['Select Test', 'Recipient Details', 'Message', 'Preview'];

const GiftHealthTest = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [step, setStep] = useState(0);
  const [selectedTest, setSelectedTest] = useState(null);
  const [recipient, setRecipient] = useState({ name: '', mobile: '', email: '' });
  const [message, setMessage] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [voucher, setVoucher] = useState(null);
  const [copied, setCopied] = useState(false);
  const [animDir, setAnimDir] = useState(1);
  const containerRef = useRef(null);

  const getTestName = (test) => (isEn ? test.name : test.nameHi);

  const generateVoucherCode = () => {
    const num = String(Math.floor(100000 + Math.random() * 900000));
    return `GIFT-${num}`;
  };

  const handleBuy = () => {
    const code = generateVoucherCode();
    const entry = {
      code,
      testName: selectedTest.name,
      testCode: selectedTest.code,
      price: selectedTest.price,
      buyerName,
      recipientName: recipient.name,
      recipientMobile: recipient.mobile,
      message,
      date: new Date().toISOString().slice(0, 10),
      redeemed: false,
    };
    const existing = JSON.parse(localStorage.getItem('sana_gift_vouchers') || '[]');
    existing.push(entry);
    localStorage.setItem('sana_gift_vouchers', JSON.stringify(existing));
    setVoucher(entry);
  };

  const handleCopyCode = async () => {
    if (!voucher) return;
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = voucher.code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    if (!voucher) return;
    const shareMsg = isEn
      ? `🎁 *Gift Alert!*\n\nYou've received a health test gift from *${voucher.buyerName}*!\n\n🧪 *Test*: ${voucher.testName}\n🎟️ *Gift Code*: ${voucher.code}\n💬 *Message*: ${voucher.message}\n\n*How to Redeem:*\n1. Visit sana-pathology.com/book\n2. Enter gift code ${voucher.code}\n3. Schedule your free home collection\n\nStay healthy! 💪`
      : `🎁 *उपहार अलर्ट!*\n\nआपको *${voucher.buyerName}* से एक स्वास्थ्य परीक्षण उपहार मिला है!\n\n🧪 *टेस्ट*: ${voucher.testName}\n🎟️ *गिफ्ट कोड*: ${voucher.code}\n💬 *संदेश*: ${voucher.message}\n\n*कैसे रिडीम करें:*\n1. sana-pathology.com/book पर जाएं\n2. गिफ्ट कोड ${voucher.code} दर्ज करें\n3. अपना मुफ्त होम कलेक्शन बुक करें\n\nस्वस्थ रहें! 💪`;

    const encoded = encodeURIComponent(shareMsg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) {
      setAnimDir(1);
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setAnimDir(-1);
      setStep((s) => s - 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 0: return selectedTest !== null;
      case 1: return recipient.name.trim().length >= 2 && recipient.mobile.trim().length >= 10;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  if (voucher) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-5 text-center">
          <Gift className="w-10 h-10 text-white mx-auto mb-2" />
          <h2 className="text-white text-xl font-black">
            {isEn ? 'Gift Purchased Successfully! 🎉' : 'उपहार सफलतापूर्वक खरीदा गया! 🎉'}
          </h2>
        </div>
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-purple-50 border-2 border-dashed border-purple-300 rounded-2xl px-6 py-5 w-full text-center">
            <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-1">
              {isEn ? 'Gift Voucher Code' : 'गिफ्ट वाउचर कोड'}
            </p>
            <p className="text-3xl font-black text-purple-700 tracking-wider select-all">{voucher.code}</p>
          </div>

          <div className="w-full space-y-2 text-sm">
            <div className="flex justify-between px-2">
              <span className="text-gray-500 font-medium">{isEn ? 'Test' : 'टेस्ट'}</span>
              <span className="font-bold text-gray-800">{getTestName({ name: voucher.testName, nameHi: '' })}</span>
            </div>
            <div className="flex justify-between px-2">
              <span className="text-gray-500 font-medium">{isEn ? 'From' : 'उपहार देने वाले'}</span>
              <span className="font-bold text-gray-800">{voucher.buyerName}</span>
            </div>
            <div className="flex justify-between px-2">
              <span className="text-gray-500 font-medium">{isEn ? 'For' : 'प्राप्तकर्ता'}</span>
              <span className="font-bold text-gray-800">{voucher.recipientName}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 w-full mt-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
            >
              <Copy className="w-4 h-4" />
              {copied
                ? (isEn ? 'Copied!' : 'कॉपी हो गया!')
                : (isEn ? 'Copy Code' : 'कोड कॉपी करें')}
            </button>
            <button
              onClick={shareOnWhatsApp}
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-md shadow-green-500/30"
            >
              <WhatsAppIcon className="w-5 h-5" />
              {isEn ? 'Share on WhatsApp' : 'व्हाट्सएप पर शेयर करें'}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-1">
            {isEn
              ? 'The recipient can redeem this code on the booking page.'
              : 'प्राप्तकर्ता इस कोड को बुकिंग पेज पर रिडीम कर सकता है।'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-5 flex items-center gap-3">
        <div className="bg-white/20 rounded-full p-2">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-white text-xl font-black">🎁 {isEn ? 'Gift a Health Test' : 'हेल्थ टेस्ट गिफ्ट करें'}</h2>
          <p className="text-purple-100 text-xs font-medium">
            {isEn ? 'Bless a loved one with the gift of health' : 'अपने प्रियजन को स्वास्थ्य का उपहार दें'}
          </p>
        </div>
      </div>

      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    i < step
                      ? 'bg-purple-600 text-white'
                      : i === step
                      ? 'bg-purple-600 text-white ring-4 ring-purple-200'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] font-bold mt-1 text-center leading-tight ${i <= step ? 'text-purple-700' : 'text-gray-400'}`}>
                  {isEn ? label : ['टेस्ट चुनें', 'विवरण', 'संदेश', 'पूर्वावलोकन'][i]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full ${i < step ? 'bg-purple-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="px-6 py-4 min-h-[280px]">
        <div
          key={step}
          style={{ animation: `slideIn 0.3s ease-out` }}
        >
          <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(${animDir * 20}px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>

          {step === 0 && (
            <div className="space-y-2.5">
              <p className="text-sm font-bold text-gray-700 mb-3">
                {isEn ? 'Choose a test or package to gift:' : 'गिफ्ट करने के लिए टेस्ट या पैकेज चुनें:'}
              </p>
              {GIFT_TESTS.map((test) => (
                <button
                  key={test.code}
                  onClick={() => setSelectedTest(test)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    selectedTest?.code === test.code
                      ? 'border-purple-500 bg-purple-50 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedTest?.code === test.code ? 'bg-purple-600' : 'bg-purple-100'
                  }`}>
                    <Heart className={`w-5 h-5 ${selectedTest?.code === test.code ? 'text-white' : 'text-purple-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">
                      {isEn ? test.name : (test.nameHi || test.name)}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">{test.code}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-sm ${selectedTest?.code === test.code ? 'text-purple-700' : 'text-gray-700'}`}>
                      ₹{test.price}
                    </p>
                    <p className="text-[10px] font-bold text-green-600">
                      {isEn ? 'Giftable' : 'गिफ्ट करें'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">
                  {isEn ? 'Your Name (Buyer) *' : 'आपका नाम (खरीदार) *'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder={isEn ? 'e.g. Rahul' : 'जैसे: राहुल'}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">
                  {isEn ? "Recipient's Name *" : 'प्राप्तकर्ता का नाम *'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={recipient.name}
                    onChange={(e) => setRecipient((p) => ({ ...p, name: e.target.value }))}
                    placeholder={isEn ? 'e.g. Priya' : 'जैसे: प्रिया'}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">
                  {isEn ? "Recipient's Mobile *" : 'प्राप्तकर्ता का मोबाइल *'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={recipient.mobile}
                    onChange={(e) => setRecipient((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="9876543210"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">
                  {isEn ? "Recipient's Email" : 'प्राप्तकर्ता का ईमेल'}
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={recipient.email}
                    onChange={(e) => setRecipient((p) => ({ ...p, email: e.target.value }))}
                    placeholder={isEn ? 'priya@example.com' : 'priya@example.com'}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5">
              <div className="bg-purple-50 rounded-xl p-4 flex items-start gap-3">
                <Heart className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-purple-800">
                  {isEn
                    ? 'Write a heartfelt message that will accompany the gift voucher.'
                    : 'एक हार्दिक संदेश लिखें जो गिफ्ट वाउचर के साथ जाएगा।'}
                </p>
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={200}
                  placeholder={isEn
                    ? 'Stay healthy, dear! Get yourself tested soon. 💛'
                    : 'स्वस्थ रहो, प्रिय! जल्द ही अपनी जांच करवाओ। 💛'}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-500 transition-all resize-none"
                />
              </div>
              <p className="text-xs text-gray-400 text-right font-medium">{message.length}/200</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3.5">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-600 rounded-full p-2">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-gray-800">
                      {isEn ? 'Gift Summary' : 'उपहार सारांश'}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {isEn ? 'Please review before purchase' : 'कृपया खरीदने से पहले समीक्षा करें'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{isEn ? 'Test' : 'टेस्ट'}</span>
                    <span className="font-bold text-gray-800 text-right">{getTestName(selectedTest)}</span>
                  </div>
                  <div className="h-px bg-purple-100" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{isEn ? 'Price' : 'कीमत'}</span>
                    <span className="font-black text-purple-700">₹{selectedTest.price}</span>
                  </div>
                  <div className="h-px bg-purple-100" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{isEn ? 'Gifted By' : 'उपहार देने वाले'}</span>
                    <span className="font-bold text-gray-800">{buyerName || '—'}</span>
                  </div>
                  <div className="h-px bg-purple-100" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{isEn ? 'Recipient' : 'प्राप्तकर्ता'}</span>
                    <span className="font-bold text-gray-800">{recipient.name}</span>
                  </div>
                  <div className="h-px bg-purple-100" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{isEn ? 'Mobile' : 'मोबाइल'}</span>
                    <span className="font-bold text-gray-800">{recipient.mobile}</span>
                  </div>
                  {recipient.email && (
                    <>
                      <div className="h-px bg-purple-100" />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Email</span>
                        <span className="font-bold text-gray-800">{recipient.email}</span>
                      </div>
                    </>
                  )}
                  {message && (
                    <>
                      <div className="h-px bg-purple-100" />
                      <div>
                        <span className="text-gray-500 font-medium block mb-1">
                          {isEn ? 'Message' : 'संदेश'}
                        </span>
                        <p className="font-semibold text-gray-700 italic bg-white/80 rounded-lg px-3 py-2 text-sm">"{message}"</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-5 pt-2 flex items-center justify-between gap-3 border-t border-gray-100">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            step === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {isEn ? 'Back' : 'पीछे'}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-600/20"
          >
            {isEn ? 'Next' : 'अगला'}
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleBuy}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-bold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-600/30"
          >
            <Gift className="w-4 h-4" />
            {isEn ? 'Buy as Gift' : 'उपहार के रूप में खरीदें'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GiftHealthTest;
