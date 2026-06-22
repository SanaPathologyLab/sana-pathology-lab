import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar, UserCircle, Phone, MapPin, Clock, Heart, CheckCircle2,
  Loader2, ArrowRight, X, Info, ShieldCheck, Trash2
} from 'lucide-react';
import PublicHomeHeader from '../components/PublicHomeHeader';
import EmergencyWidget from '../components/EmergencyWidget';
import LiveChatWidget from '../components/LiveChatWidget';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BookOnlinePage = () => {
  const { t, language } = useLanguage();

  const [selectedTests, setSelectedTests] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sana_cart')) || []; } catch { return []; }
  });

  const [form, setForm] = useState({
    name: '', mobile: '', gender: 'MALE', address: '',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: '08:00', isHomeCollection: true
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const totalPrice = selectedTests.reduce((acc, t) => acc + t.price, 0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const removeTest = (code) => {
    const updated = selectedTests.filter(t => t.testCode !== code);
    setSelectedTests(updated);
    localStorage.setItem('sana_cart', JSON.stringify(updated));
  };

  const clearCart = () => {
    setSelectedTests([]);
    localStorage.setItem('sana_cart', JSON.stringify([]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTests.length === 0) {
      setError('Please select at least one test or health package.');
      return;
    }
    setLoading(true);
    setError('');
    const testListStr = selectedTests.map(t => `${t.name} (₹${t.price})`).join(', ');
    const notesContent = `Requested via Book Online Page. Tests/Packages: ${testListStr}. Mode: ${form.isHomeCollection ? 'Home Collection' : 'Lab Visit'}`;
    try {
      const response = await fetch('/api/public/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, mobile: form.mobile, gender: form.gender,
          address: form.isHomeCollection ? form.address : 'Lab Visit',
          preferredDate: form.preferredDate, preferredTime: form.preferredTime,
          notes: notesContent
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAppointment(data.appointment);
        setSuccess(true);
        const msg = `*New Appointment Request (Online)*\n\n*Name:* ${form.name}\n*Mobile:* ${form.mobile}\n*Gender:* ${form.gender}\n*Date:* ${form.preferredDate} ${form.preferredTime}\n*Mode:* ${form.isHomeCollection ? 'Home Collection' : 'Clinic Visit'}\n\n*Tests:*\n${testListStr}\n\n*Total:* ₹${totalPrice}`;
        window.open(`https://wa.me/916396786939?text=${encodeURIComponent(msg)}`, '_blank');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit. Please try again.');
      }
    } catch {
      setError('Network error. Failed to connect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-sans text-slate-800">
      <PublicHomeHeader cartCount={selectedTests.length} />

      {/* Hero */}
      <section className="relative pt-24 pb-28 overflow-hidden bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0b6b55]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md border border-white/20">
            <Calendar size={14} className="text-[#F1C40F]" />
            {t('oneMinBooking')}
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-white leading-tight mb-4">
            {t('bookHomeSample')}
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/80 max-w-2xl mx-auto font-medium">
            {t('fillDetails')}
          </p>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8">
              {success && appointment ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">{t('requestSubmitted')}</h3>
                  <p className="text-slate-500 font-semibold mb-6">
                    {language === 'hi'
                      ? `धन्यवाद, ${form.name}। आपका अनुरोध प्राप्त हो गया है।`
                      : `Thank you, ${form.name}. Your request has been received.`}
                  </p>
                  <div className="bg-primary-pale rounded-2xl p-5 border border-primary/20 mb-6">
                    <p className="text-xs font-black text-primary uppercase tracking-wider mb-1">{t('trackingRefId')}</p>
                    <p className="text-2xl font-black text-slate-800 font-mono">SPL-APT-{String(appointment.id).padStart(6, '0')}</p>
                  </div>
                  <button
                    onClick={() => { setSuccess(false); setForm({
                      name: '', mobile: '', gender: 'MALE', address: '',
                      preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                      preferredTime: '08:00', isHomeCollection: true
                    }); }}
                    className="bg-primary text-white px-8 py-3.5 rounded-2xl font-bold text-sm"
                  >
                    {t('bookAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Selected Tests Summary */}
                  {selectedTests.length > 0 && (
                    <div className="bg-primary-pale/30 rounded-2xl p-4 border border-primary/10 mb-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <Heart size={14} className="text-red-400" />
                          {t('selectedTestsCount').replace('{count}', selectedTests.length)}
                        </h4>
                        <button type="button" onClick={clearCart} className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
                          <Trash2 size={12} /> Clear
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {selectedTests.map(item => (
                          <div key={item.testCode} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-primary/5">
                            <span className="text-xs font-bold text-slate-700">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-primary">₹{item.price}</span>
                              <button type="button" onClick={() => removeTest(item.testCode)} className="text-slate-300 hover:text-red-400 transition-colors">
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-primary/10">
                        <span className="text-xs font-bold text-slate-500">{t('totalPrice')}</span>
                        <span className="text-lg font-black text-primary">₹{totalPrice}</span>
                      </div>
                    </div>
                  )}

                  {selectedTests.length === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center mb-2">
                      <Info className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-amber-800">{t('noSelectedTestsWarning')}</p>
                      <button
                        type="button"
                        onClick={() => window.location.href = '/test-finder'}
                        className="mt-3 text-sm font-bold text-primary hover:text-primary-light underline"
                      >
                        Browse Tests →
                      </button>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">{t('patientName')}</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange}
                      placeholder={t('enterName')}
                      className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white transition-all" required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">{t('mobileNumber')}</label>
                      <input type="tel" name="mobile" value={form.mobile} onChange={handleChange}
                        placeholder={t('enterMobile')} maxLength={10}
                        className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white transition-all" required />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">{t('genderLabel')}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['MALE', 'FEMALE', 'OTHER'].map(g => (
                          <button key={g} type="button" onClick={() => setForm(prev => ({ ...prev, gender: g }))}
                            className={`py-3 text-xs font-bold rounded-2xl border-2 transition-all ${
                              form.gender === g
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-200'
                            }`}>
                            {g === 'MALE' ? (language === 'hi' ? 'पुरुष' : 'Male') : g === 'FEMALE' ? (language === 'hi' ? 'महिला' : 'Female') : (language === 'hi' ? 'अन्य' : 'Other')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">{t('preferredDate')}</label>
                      <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange}
                        className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white transition-all" required />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">{t('preferredTime')}</label>
                      <input type="time" name="preferredTime" value={form.preferredTime} onChange={handleChange}
                        className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white transition-all" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">{t('collectionMode')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, isHomeCollection: true }))}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          form.isHomeCollection ? 'bg-primary-pale/30 border-primary' : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.isHomeCollection ? 'border-primary' : 'border-slate-300'}`}>
                            {form.isHomeCollection && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{t('homeCollectionFree')}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 ml-7 font-semibold">Free within city limits</p>
                      </button>
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, isHomeCollection: false, address: '' }))}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          !form.isHomeCollection ? 'bg-primary-pale/30 border-primary' : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!form.isHomeCollection ? 'border-primary' : 'border-slate-300'}`}>
                            {!form.isHomeCollection && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{t('visitLab')}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 ml-7 font-semibold">Visit our facility</p>
                      </button>
                    </div>
                  </div>

                  {form.isHomeCollection && (
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">{t('fullAddress')}</label>
                      <textarea name="address" value={form.address} onChange={handleChange}
                        placeholder={t('addressPlaceholder')} rows={3}
                        className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white transition-all resize-none" required={form.isHomeCollection} />
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm font-semibold text-red-700 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-red-500 shrink-0" />
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading || selectedTests.length === 0}
                    className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('submittingBooking')}</> : <><Calendar size={20} /> {t('requestBookingBtn')}</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8 sticky top-28">
              <h3 className="font-black text-slate-800 text-lg mb-4">Why Book With Us?</h3>
              <div className="space-y-4">
                {[
                  { icon: ShieldCheck, label: 'NABL Accredited Lab', sub: 'Quality assured reports' },
                  { icon: Clock, label: '6-12 Hour Turnaround', sub: 'Fast digital delivery' },
                  { icon: Heart, label: 'Free Home Collection', sub: 'Convenient & safe' },
                  { icon: Phone, label: 'Direct Lab Support', sub: '+91 6396786939' },
                  { icon: MapPin, label: 'Serving Sambhal Region', sub: 'Chandausi, Bahjoi, Sirsi' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{item.label}</h4>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 bg-gradient-to-r from-primary to-primary-light rounded-2xl p-5 text-white text-center">
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">Have Questions?</p>
                <a href="tel:+916396786939" className="text-lg font-black mt-1 block hover:opacity-90 transition-opacity">
                  +91 63967 86939
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EmergencyWidget />
      <LiveChatWidget />
    </div>
  );
};

export default BookOnlinePage;
