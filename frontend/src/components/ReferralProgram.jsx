import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, Share2, Users, IndianRupee, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import WhatsAppIcon from './WhatsAppIcon';

const ReferralProgram = ({ patientId, patientName }) => {
  const { language } = useLanguage();
  const [referralCode] = useState(() => {
    const stored = localStorage.getItem('sana_referral_code');
    if (stored) return stored;
    const code = `REF-${patientId || 'SPL' + Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    localStorage.setItem('sana_referral_code', code);
    return code;
  });
  const [referrals, setReferrals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sana_referrals') || '[]');
    } catch { return []; }
  });
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', mobile: '' });
  const [submitted, setSubmitted] = useState(false);

  const isHi = language === 'hi';

  const copyToClipboard = () => {
    const link = `${window.location.origin}/?ref=${referralCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareOnWhatsApp = () => {
    const msg = isHi
      ? `नमस्ते! सना पैथोलॉजी पर अपना टेस्ट बुक करें और ₹50 की छूट पाएं! मेरे रेफरल कोड का उपयोग करें: ${referralCode}. वेबसाइट पर जाएं: ${window.location.origin}`
      : `Hi! Book your health test at Sana Pathology Lab and get ₹50 off! Use my referral code: ${referralCode}. Visit: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSubmitReferral = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.match(/^[6-9]\d{9}$/)) return;

    const newReferral = {
      code: referralCode,
      referrerName: patientName || 'You',
      referrerPatientId: patientId || 'Guest',
      referredName: formData.name.trim(),
      referredMobile: formData.mobile.trim(),
      date: new Date().toISOString().split('T')[0],
      discountApplied: false,
      status: 'pending'
    };

    const updated = [...referrals, newReferral];
    setReferrals(updated);
    localStorage.setItem('sana_referrals', JSON.stringify(updated));
    setSubmitted(true);
    setShowForm(false);
    setFormData({ name: '', mobile: '' });
  };

  const earnedAmount = referrals.filter(r => r.status === 'booked' || r.discountApplied).length * 50;

  if (submitted) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {isHi ? 'रेफरल सफलतापूर्वक सबमिट किया गया!' : 'Referral Submitted Successfully!'}
        </h3>
        <p className="text-slate-600 mb-4">
          {isHi
            ? `${formData.name} को आपका रेफरल कोड भेज दिया गया है। जब वे बुक करेंगे तो आपको ₹50 मिलेंगे।`
            : `Your referral code has been shared with ${formData.name}. You'll get ₹50 when they book.`}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={shareOnWhatsApp} className="bg-[#25D366] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <WhatsAppIcon size={16} /> {isHi ? 'WhatsApp पर शेयर करें' : 'Share on WhatsApp'}
          </button>
          <button onClick={() => setSubmitted(false)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold">
            {isHi ? 'और रेफर करें' : 'Refer More'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
            <Gift size={28} className="text-yellow-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{isHi ? 'रेफर अ फ्रेंड' : 'Refer a Friend'}</h3>
            <p className="text-sm text-emerald-100">{isHi ? '₹50 छूट पाएं' : 'Get ₹50 off your next test'}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {isHi ? 'आपका रेफरल कोड' : 'Your Referral Code'}
          </p>
          <p className="text-2xl font-black text-primary tracking-widest font-mono">{referralCode}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all">
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            {copied ? (isHi ? 'कॉपी हो गया!' : 'Copied!') : (isHi ? 'कॉपी करें' : 'Copy Link')}
          </button>
          <button onClick={shareOnWhatsApp} className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-bold text-sm transition-all">
            <WhatsAppIcon size={16} /> {isHi ? 'शेयर करें' : 'Share'}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-emerald-600" />
            <span className="font-bold text-slate-700">{isHi ? 'रेफरल्स' : 'Referrals'}: {referrals.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <IndianRupee size={14} className="text-emerald-600" />
            <span className="font-bold text-emerald-700">{isHi ? 'कमाए' : 'Earned'}: ₹{earnedAmount}</span>
          </div>
        </div>

        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="w-full bg-primary hover:bg-primary-light text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
            <Gift size={16} /> {isHi ? 'किसी को रेफर करें' : 'Refer Someone'}
          </button>
        ) : (
          <form onSubmit={handleSubmitReferral} className="space-y-3 animate-fade-in">
            <input
              type="text"
              placeholder={isHi ? 'मित्र का नाम' : "Friend's name"}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
            <input
              type="tel"
              placeholder={isHi ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
              value={formData.mobile}
              onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              pattern="[6-9]\d{9}"
              required
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold">
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button type="submit" className="flex-[2] bg-primary hover:bg-primary-light text-white py-3 rounded-xl text-sm font-bold transition-all">
                {isHi ? 'रेफरल भेजें' : 'Send Referral'}
              </button>
            </div>
          </form>
        )}

        {referrals.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {isHi ? 'रेफरल हिस्ट्री' : 'Referral History'}
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {referrals.map((ref, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{ref.referredName}</p>
                    <p className="text-[10px] text-slate-400">{ref.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ref.status === 'booked' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {ref.status === 'booked' ? (isHi ? 'बुक किया' : 'Booked') : (isHi ? 'लंबित' : 'Pending')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralProgram;
