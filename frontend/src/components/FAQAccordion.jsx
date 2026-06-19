import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react';

const FAQ_DATA = [
  {
    q: 'Is fasting mandatory before a complete blood checkup?',
    a: 'Fasting is required for certain tests like Fasting Blood Sugar (8-10 hrs) and Lipid Profile (10-12 hrs). For most other tests like CBC, Thyroid, and LFT, fasting is not mandatory. Our team will advise you on the specific preparation needed when you book.',
  },
  {
    q: 'How safe is the home sample collection process?',
    a: 'Your safety is our top priority. Our certified phlebotomists use 100% sterile, single-use vacuum collection tubes and follow strict sanitization protocols. All equipment is sealed in front of you, and our staff wears full PPE during every collection.',
  },
  {
    q: 'How will I receive my diagnostic report?',
    a: 'Reports are delivered digitally via WhatsApp and email within 12-24 hours of sample collection. You can also access your complete report history anytime through our patient portal at sanapathologylab.github.io/sana-pathology-lab.',
  },
  {
    q: 'Are there any hidden logistical or home collection charges?',
    a: 'Absolutely not. Home sample collection is completely free within city limits for bookings above ₹500. There are no hidden charges for the phlebotomist visit, transportation, or report delivery. The price you see is the final price.',
  },
  {
    q: 'Can I modify or cancel my home collection appointment?',
    a: 'Yes, you can reschedule or cancel your appointment up to 2 hours before the scheduled slot. Simply contact us at +91 6396786939 or reply to your confirmation message, and our team will assist you.',
  },
  {
    q: 'What is the validity of stored samples for retesting?',
    a: 'Most blood samples are viable for 24-48 hours when stored at proper temperatures. For any retesting needs, we recommend contacting us within 24 hours of collection. Certain tests like CBC should ideally be processed within 6-8 hours for optimal accuracy.',
  },
];

const FAQAccordion = ({ t, language }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const displayedFaqs = showAll ? FAQ_DATA : FAQ_DATA.slice(0, 4);

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-white to-slate-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-pale/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="text-xs font-black tracking-widest text-secondary uppercase bg-secondary-pale px-4 py-1.5 rounded-full">Patient Guide</span>
          <h2 className="text-4xl font-heading text-primary font-black mt-4">Frequently Asked Questions</h2>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto font-medium">Everything you need to know about our diagnostic services</p>
          <div className="w-16 h-1 bg-cta mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-3">
          {displayedFaqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-slate-800 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle size={18} className="text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base leading-snug">{faq.q}</span>
                </div>
                <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 transition-all duration-300 ${openFaq === i ? 'bg-secondary-pale rotate-180' : ''}`}>
                  {openFaq === i ? <ChevronUp size={16} className="text-secondary" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 pl-14 animate-fade-in-up">
                  <div className="w-10 h-0.5 bg-secondary rounded-full mb-3"></div>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {FAQ_DATA.length > 4 && (
          <div className="text-center mt-8">
            <button onClick={() => setShowAll(!showAll)} className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-secondary-light transition-colors px-6 py-3 border-2 border-secondary/20 hover:border-secondary/40 rounded-xl">
              {showAll ? 'Show Less' : `View All ${FAQ_DATA.length} FAQs`}
              {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        )}

        <div className="mt-10 bg-gradient-to-r from-primary to-primary-light rounded-3xl p-8 text-white text-center shadow-xl">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 text-secondary-light" />
          <h3 className="text-xl font-black mb-2">Still have questions?</h3>
          <p className="text-white/80 text-sm mb-5 font-medium">Our team is available 7:00 AM - 8:00 PM, Mon-Sat</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+916396786939" className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 px-6 py-3 rounded-xl font-bold text-sm transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Call +91 6396786939
            </a>
            <a href="https://wa.me/916396786939" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] px-6 py-3 rounded-xl font-bold text-sm transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;
