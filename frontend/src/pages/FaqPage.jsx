import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  MessageCircle, ChevronDown, ChevronUp, Search, HelpCircle,
  Phone, Mail, MapPin
} from 'lucide-react';
import PublicHomeHeader from '../components/PublicHomeHeader';
import EmergencyWidget from '../components/EmergencyWidget';
import LiveChatWidget from '../components/LiveChatWidget';

const FaqPage = () => {
  const { t, language } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const faqs = [
    { q: "Do I need to fast before a blood test?", a: "It depends on the test. Tests like Fasting Blood Sugar and Lipid Profile require 8-12 hours of fasting. Please check with our lab when booking." },
    { q: "Do you offer home sample collection?", a: "Yes, we provide free home sample collection within city limits for bookings above ₹500." },
    { q: "How will I receive my reports?", a: "You will receive a digital copy of your report via WhatsApp and Email within the promised turnaround time. You can also log into our website to download past reports." },
    { q: "What are the payment options?", a: "We accept Cash, UPI (Google Pay, PhonePe, Paytm), and major Credit/Debit cards at our lab and during home collection." },
    { q: "What is your turnaround time for reports?", a: "Most routine tests (like CBC, Sugar) are delivered within 6-12 hours. Specialized tests may take 24 hours." },
    { q: "Is my report digitally signed?", a: "Yes! Every report is digitally signed by our registered M.D. Pathologist with a unique QR code for verification." },
    { q: "Can I get a refund if I cancel my booking?", a: "Yes, cancellations made before sample collection are eligible for a full refund. Contact our support team." },
    { q: "Do I need a doctor's prescription for tests?", a: "While some tests require a doctor's referral, many routine screenings can be done without one. Contact us to confirm." },
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const categories = [
    { name: 'Booking & Collection', icon: '📋', count: 3 },
    { name: 'Reports & TAT', icon: '📄', count: 2 },
    { name: 'Payments & Cancellation', icon: '💳', count: 2 },
    { name: 'General', icon: '🔬', count: 1 },
  ];

  return (
    <div className="min-h-screen bg-bg font-sans text-slate-800">
      <PublicHomeHeader />

      {/* Hero */}
      <section className="relative pt-24 pb-28 overflow-hidden bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0b6b55]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md border border-white/20">
            <HelpCircle size={14} className="text-[#F1C40F]" />
            Help Center
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-white leading-tight mb-4">
            {t('faqTitle')}
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/80 max-w-2xl mx-auto font-medium mb-8">
            Find answers to common questions about our lab services, booking, reports, and more.
          </p>

          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your question..."
              className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 font-semibold text-sm focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {categories.map((cat) => (
              <div key={cat.name} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <h4 className="text-xs font-bold text-slate-700">{cat.name}</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{cat.count} questions</p>
              </div>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">No matching questions found.</p>
                <p className="text-sm text-slate-400 mt-1">Try different keywords or contact us directly.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 hover:shadow-md">
                    <button
                      onClick={() => toggleFaq(i)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-slate-800 hover:bg-slate-50/50 transition-colors"
                    >
                      <span className="text-sm md:text-base leading-snug">{faq.q}</span>
                      <div className={`w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-primary/10 border-primary/20 rotate-180' : ''}`}>
                        {isOpen ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-4 animate-fade-in-up">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Still have questions CTA */}
          <div className="mt-12 bg-gradient-to-r from-primary to-primary-light rounded-3xl p-8 md:p-10 text-white text-center shadow-xl">
            <h3 className="text-2xl md:text-3xl font-black mb-3">Still Have Questions?</h3>
            <p className="text-emerald-100 font-medium mb-6 max-w-lg mx-auto">
              Our team is ready to help you. Reach out via phone, WhatsApp, or visit our lab directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+916396786939"
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                <Phone size={18} /> +91 63967 86939
              </a>
              <a href="https://wa.me/916396786939" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <EmergencyWidget />
      <LiveChatWidget />
    </div>
  );
};

export default FaqPage;
