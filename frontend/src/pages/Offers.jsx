import React, { useState, useEffect, useCallback } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Tag, Clock, Copy, Check, Share2, Gift, Sparkles, ArrowRight, Phone, MessageCircle, ChevronDown } from 'lucide-react';

const OFFERS = [
  {
    id: 1,
    title: 'Monsoon Special — Fever Package',
    desc: 'CBC + Dengue NS1 + Malaria — sirf ₹399 (was ₹1500)',
    originalPrice: 1500,
    price: 399,
    coupon: 'MONSOON25',
    expires: '2026-08-31',
    badge: '🔥 Hot Deal',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 2,
    title: 'Full Body Checkup',
    desc: '80+ parameters — CBC, LFT, KFT, Lipid, Thyroid, Sugar — sab ek saath',
    originalPrice: 2499,
    price: 899,
    coupon: 'FULLBODY',
    expires: '2026-12-31',
    badge: '⭐ Best Seller',
    color: 'from-[#1D9E75] to-[#085041]'
  },
  {
    id: 3,
    title: 'Women Health Package',
    desc: 'ANC profile, Thyroid, Vitamin D, Iron studies — comprehensive women checkup',
    originalPrice: 2200,
    price: 1399,
    coupon: 'WOMEN20',
    expires: '2026-09-30',
    badge: '👩 Women Special',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 4,
    title: 'Senior Citizen Package',
    desc: 'Designed for 60+ — CBC, KFT, LFT, Lipid, Sugar, Calcium, Urine',
    originalPrice: 2200,
    price: 1299,
    coupon: 'SENIOR20',
    expires: '2026-12-31',
    badge: '👴 Senior Care',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 5,
    title: 'Diabetes Care Combo',
    desc: 'HbA1c + FBS + KFT + Lipid Profile — full diabetes monitoring',
    originalPrice: 1550,
    price: 999,
    coupon: 'DIABETES30',
    expires: '2026-10-31',
    badge: '🍬 Diabetes',
    color: 'from-purple-500 to-purple-700'
  },
  {
    id: 6,
    title: 'Free Home Collection',
    desc: 'Koi bhi test book karein, ghar se sample collection FREE!',
    originalPrice: 200,
    price: 0,
    coupon: 'FREEHOME',
    expires: null,
    badge: '🏠 Free Service',
    color: 'from-teal-500 to-emerald-600'
  }
];

const FAQS = [
  {
    q: 'Offers kaise use karein?',
    a: 'Apni pasandeeda offer select karein, "Book Now" button par click karein. WhatsApp par aapko coupon code ke saath booking link milega. Ya coupon code copy karke booking ke time paste karein.'
  },
  {
    q: 'Kya coupon code multiple baar use ho sakta hai?',
    a: 'Har coupon code limited hai aur ek baar use kiya ja sakta hai, jab tak offer ki validity period mein hai. Terms & Conditions apply.'
  },
  {
    q: 'Kya home sample collection bhi free hai?',
    a: 'Haan! Hamare Free Home Collection offer ke saath koi bhi test book karein, ghar se sample collection bilkul FREE hai. Koi minimum order nahi.'
  },
  {
    q: 'Expired offers dobara aayenge?',
    a: 'Hum naye offers aur discounts regularly launch karte rehte hain. Aap hamein WhatsApp ya call karke bhi current offers ke baare mein puch sakte hain.'
  },
  {
    q: 'Full payment pehle karna hoga ya discount kaise milega?',
    a: 'Aap booking ke time coupon code apply karein ya WhatsApp par "Book Now" click karke offer price par booking confirm karein. Payment home collection ke time ya lab par cash/UPI se kar sakte hain.'
  }
];

const CountdownTimer = ({ expires }) => {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!expires) return;

    const calculate = () => {
      const now = new Date();
      const end = new Date(expires + 'T23:59:59');
      const diff = end - now;

      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, expired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setRemaining({ days, hours, expired: false });
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [expires]);

  if (!remaining || remaining.expired) {
    return (
      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
      <Clock size={10} />
      {remaining.days > 0 && `${remaining.days}d `}{remaining.hours}h left
    </span>
  );
};

const Offers = () => {
  const [copiedId, setCopiedId] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [referralName, setReferralName] = useState('');

  const trackGtag = useCallback((event, params = {}) => {
    if (window.gtag) {
      window.gtag('event', event, params);
    }
  }, []);

  const handleCopyCoupon = async (offer) => {
    try {
      await navigator.clipboard.writeText(offer.coupon);
      setCopiedId(offer.id);
      trackGtag('offer_coupon_copied', {
        coupon_code: offer.coupon,
        offer_title: offer.title,
        offer_price: offer.price
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = offer.coupon;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(offer.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleBookNow = (offer) => {
    trackGtag('offer_book_now', {
      coupon_code: offer.coupon,
      offer_title: offer.title,
      offer_price: offer.price
    });

    const message = `Hi Sana Pathology! I want to book "${offer.title}" at ₹${offer.price}. My coupon code is ${offer.coupon}. Please help me with home collection.`;
    window.open(
      `https://wa.me/916396786939?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const handleShareReferral = () => {
    const name = referralName.trim() || 'Friend';
    const message = `I was referred by ${name}`;
    window.open(
      `https://wa.me/916396786939?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const handleCopyReferralLink = () => {
    const name = referralName.trim() || 'Friend';
    const link = `https://wa.me/916396786939?text=${encodeURIComponent(`I was referred by ${name}`)}`;

    navigator.clipboard.writeText(link).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  return (
    <PublicLayout>
      <div className="bg-[#F5F7F6] min-h-screen">

        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-[#085041] to-[#0F6E56] py-12 md:py-20 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent)]"></div>
          <div className="absolute top-1/4 -left-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 -right-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-[#F1C40F] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-white/20 mb-4 md:mb-6">
              <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
              Seasonal &bull; Limited Time
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-tight mb-3 md:mb-4 drop-shadow-lg">
              Offers & Discounts
            </h1>
            <p className="text-base md:text-lg text-emerald-100/90 font-medium">
              Sambhal ki Sabse Sasti Lab
            </p>
            <p className="text-sm md:text-base text-emerald-200/70 mt-1 md:mt-2 max-w-2xl mx-auto">
              Ghar baithe sample collection, FREE home delivery, aur bhi offers!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 md:mt-8">
              <a
                href="https://wa.me/916396786939?text=Hi%2C%20I%27m%20interested%20in%20the%20offer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#085041] text-sm font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <MessageCircle size={16} />
                Enquire on WhatsApp
              </a>
              <a
                href="tel:+916396786939"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-white/20 transition-all"
              >
                <Phone size={16} />
                Call Now
              </a>
            </div>
          </div>
        </section>

        {/* Offers Grid */}
        <section className="py-10 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 font-heading">
              Active Offers
            </h2>
            <p className="text-sm md:text-base text-slate-500 mt-1">
              Limited time deals — jaldi karo, bachat karo!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {OFFERS.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {/* Gradient top border */}
                <div className={`h-1.5 bg-gradient-to-r ${offer.color}`}></div>

                <div className="p-4 md:p-5 flex flex-col flex-1">
                  {/* Badge + Timer */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r ${offer.color} px-2.5 py-1 rounded-full`}>
                      {offer.badge}
                    </span>
                    {offer.expires && <CountdownTimer expires={offer.expires} />}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm md:text-base font-black text-slate-800 mb-1 leading-snug">
                    {offer.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-slate-500 mb-3 leading-relaxed flex-1">
                    {offer.desc}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-3">
                    {offer.originalPrice > 0 && (
                      <span className="text-xs md:text-sm text-slate-400 line-through">
                        ₹{offer.originalPrice}
                      </span>
                    )}
                    <span className="text-lg md:text-2xl font-black text-[#1D9E75]">
                      {offer.price === 0 ? 'FREE' : `₹${offer.price}`}
                    </span>
                  </div>

                  {/* Coupon Code */}
                  <div className="bg-[#F5F7F6] rounded-xl p-2.5 md:p-3 flex items-center justify-between mb-3 border border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-[#1D9E75]" />
                      <span className="text-xs md:text-sm font-bold text-slate-700 tracking-wider font-mono">
                        {offer.coupon}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCoupon(offer)}
                      className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-[#1D9E75] hover:text-[#085041] transition-colors bg-white px-2.5 py-1.5 rounded-lg border border-[#1D9E75]/20 hover:border-[#1D9E75]/40"
                    >
                      {copiedId === offer.id ? (
                        <><Check size={12} /> Copied!</>
                      ) : (
                        <><Copy size={12} /> Copy</>
                      )}
                    </button>
                  </div>

                  {/* Book Now Button */}
                  <button
                    onClick={() => handleBookNow(offer)}
                    className="w-full flex items-center justify-center gap-2 bg-[#1D9E75] hover:bg-[#085041] text-white text-xs md:text-sm font-bold py-2.5 md:py-3 rounded-xl transition-all active:scale-[0.98]"
                  >
                    <MessageCircle size={14} className="md:w-4 md:h-4" />
                    Book Now
                    <ArrowRight size={14} className="md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Referral Section */}
        <section className="bg-gradient-to-br from-[#F5F7F6] to-white py-10 md:py-16 px-4 sm:px-6 border-t border-slate-200/60">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#1D9E75]/10 rounded-full mb-4">
              <Gift size={24} className="md:w-7 md:h-7 text-[#1D9E75]" />
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-800 font-heading mb-2">
              Friends ko bulao, rewards kamao!
            </h2>
            <p className="text-sm md:text-base text-slate-500 mb-6 max-w-lg mx-auto">
              Har successful referral par ₹100 cashback. Unlimited referrals!
            </p>

            <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm max-w-md mx-auto">
              <label className="block text-left text-xs font-bold text-slate-600 mb-1.5">
                Apna name daalein
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Aapka naam"
                  value={referralName}
                  onChange={(e) => setReferralName(e.target.value)}
                  className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-all"
                />
                <button
                  onClick={handleShareReferral}
                  className="flex items-center gap-1.5 bg-[#1D9E75] hover:bg-[#085041] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap"
                >
                  <Share2 size={14} />
                  Share
                </button>
              </div>
              <button
                onClick={handleCopyReferralLink}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#1D9E75] bg-[#1D9E75]/5 hover:bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-xl py-2.5 transition-all"
              >
                <Copy size={13} />
                Copy Referral Link
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-10 md:py-16 px-4 sm:px-6 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-sm md:text-base text-slate-500 mt-1">
              Offers, coupons, aur discounts ke baare mein jaane
            </p>
          </div>

          <div className="space-y-2 md:space-y-3">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-3 md:p-5 text-left transition-colors hover:bg-[#F5F7F6]/50"
                >
                  <span className="text-xs md:text-sm font-bold text-slate-700 pr-2">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-3 md:px-5 pb-3 md:pb-5">
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Strip */}
        <section className="bg-gradient-to-r from-[#085041] to-[#0F6E56] py-10 md:py-14 px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg md:text-2xl font-black text-white font-heading mb-2">
              Koi aur sawaal?
            </h2>
            <p className="text-sm md:text-base text-emerald-100/80 mb-5">
              Humein WhatsApp ya call karein — hum madad karne mein khushi mehsoos karte hain!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/916396786939?text=Hi%2C%20I%20have%20a%20question%20about%20offers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <a
                href="tel:+916396786939"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-white/20 transition-all"
              >
                <Phone size={16} />
                +91 6396786939
              </a>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default Offers;
