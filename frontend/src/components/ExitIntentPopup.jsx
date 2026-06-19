import React, { useState, useEffect } from 'react';
import { Gift, X, Phone, CheckCircle2, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import WhatsAppIcon from './WhatsAppIcon';

const ExitIntentPopup = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [showPopup, setShowPopup] = useState(false);
  const [mobile, setMobile] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('exitPopupShown') === 'true') return;

    let visitStart = Date.now();
    let entered = false;

    const handleMouseMove = (e) => {
      if (entered) return;
      if (e.clientY > 10) return;

      const elapsed = (Date.now() - visitStart) / 1000;
      if (elapsed < 10) return;

      entered = true;
      sessionStorage.setItem('exitPopupShown', 'true');
      setShowPopup(true);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const validateMobile = (num) => /^[6-9]\d{9}$/.test(num);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateMobile(mobile)) {
      setError(isHi ? 'कृपया एक वैध 10 अंकों का मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    const leads = JSON.parse(localStorage.getItem('sana_exit_leads') || '[]');
    leads.push({ mobile, timestamp: new Date().toISOString(), source: 'exit_intent' });
    localStorage.setItem('sana_exit_leads', JSON.stringify(leads));

    const message = `Hi Sana Pathology, I want my ₹100 discount coupon. My mobile is ${mobile}. Please send me the offer details.`;
    window.open(`https://wa.me/916396786939?text=${encodeURIComponent(message)}`, '_blank');

    setSubmitted(true);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md mx-4 animate-slide-up">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="relative bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] px-6 pt-8 pb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">
              {isHi ? 'जाने से पहले' : 'Before you go'} —{' '}
              <span className="text-yellow-300">{isHi ? '₹100 की छूट' : 'Get ₹100 off'}</span>{' '}
              {isHi ? 'पाएं!' : 'your first test!'}
            </h2>
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-6">
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="w-12 h-12 text-[#0F6E56]" />
                <p className="text-green-700 font-semibold text-center text-base">
                  {isHi
                    ? '✅ कूपन WhatsApp पर भेज दिया गया! अपने मैसेज चेक करें।'
                    : '✅ Coupon sent on WhatsApp! Check your messages.'}
                </p>
                <p className="text-sm text-gray-500 text-center">
                  {isHi
                    ? 'हमने अभी आपके व्हाट्सएप पर एक कूपन भेज दिया है। कृपया जांचें।'
                    : 'We have sent a coupon to your WhatsApp. Please check.'}
                </p>
                <button
                  onClick={handleClose}
                  className="mt-2 px-6 py-2.5 bg-[#0F6E56] hover:bg-[#1D9E75] text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {isHi ? 'बंद करें' : 'Close'}
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-center text-sm leading-relaxed mb-5">
                  {isHi
                    ? 'अपना मोबाइल नंबर दर्ज करें और हम आपको WhatsApp पर कूपन भेजेंगे।'
                    : 'Enter your mobile and we\'ll send you a coupon on WhatsApp.'}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder={isHi ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                      className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm outline-none transition-all ${
                        error ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-[#0F6E56]/20'
                      } focus:ring-2 focus:border-[#0F6E56]`}
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs text-center">{error}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] hover:from-[#1D9E75] hover:to-[#0F6E56] text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-[#0F6E56]/20"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    {isHi ? 'WhatsApp पर कूपन पाएं' : 'Get Coupon on WhatsApp'}
                  </button>
                </form>
                <p className="text-[10px] text-gray-400 text-center mt-4">
                  {isHi
                    ? 'हम आपका नंबर केवल कूपन भेजने के लिए उपयोग करेंगे।'
                    : 'We\'ll use your number only to send the coupon.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
