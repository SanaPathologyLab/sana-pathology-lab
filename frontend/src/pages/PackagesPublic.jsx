import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { HEALTH_PACKAGES_DATA, TESTS_DATA } from '../data/testsData';
import {
  Package, Check, ShoppingCart, Plus, Info,
  TrendingDown, Award, Sparkles,
  ChevronDown, ChevronUp, MessageCircle, ArrowRight
} from 'lucide-react';
import PackageCard from '../components/PackageCard';
import PackageDetailsModal from '../components/PackageDetailsModal';

const PHONE = '916396786939';

const getTestName = (code) => {
  const test = TESTS_DATA.find(t => t.code === code);
  return test ? test.testName : code;
};

const PackagesPublic = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sana_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [openFaq, setOpenFaq] = useState(null);
  const [customTests, setCustomTests] = useState({});
  const [selectedPackageDetails, setSelectedPackageDetails] = useState(null);

  useEffect(() => {
    localStorage.setItem('sana_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    try {
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: 'Health Packages',
          page_location: window.location.href,
          page_path: '/packages-public'
        });
      }
    } catch {}
  }, []);

  const fireGA = useCallback((action, label) => {
    try {
      if (window.gtag) {
        window.gtag('event', action, { event_label: label });
      }
    } catch {}
  }, []);

  const addToCart = useCallback((item) => {
    setCart(prev => [...prev, item]);
    fireGA('add_to_cart', item.name);
  }, [fireGA]);

  const isInCart = useCallback((testCode) => {
    return cart.some(item => item.testCode === testCode);
  }, [cart]);

  const handlePackageToggle = (pkg) => {
    if (isInCart(pkg.code)) {
      setCart(prev => prev.filter(item => item.testCode !== pkg.code));
      fireGA('remove_from_cart', pkg.name);
    } else {
      addToCart({
        name: pkg.name,
        price: pkg.price,
        testCode: pkg.code,
        isPackage: true
      });
    }
  };

  const handleBookNow = (pkg) => {
    if (!isInCart(pkg.code)) {
      addToCart({
        name: pkg.name,
        price: pkg.price,
        testCode: pkg.code,
        isPackage: true
      });
    }
    window.dispatchEvent(new CustomEvent('open-booking-modal', { detail: { step: 1 } }));
  };

  const toggleCustomTest = (code) => {
    setCustomTests(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const addCustomToCart = () => {
    const selected = TESTS_DATA.filter(t => customTests[t.code]);
    if (selected.length === 0) return;
    const items = selected.map(t => ({
      name: t.testName,
      price: t.price,
      testCode: t.code,
      isPackage: false
    }));
    setCart(prev => [...prev, ...items]);
    fireGA('add_custom_package', `${items.length} tests`);
    setCustomTests({});
  };

  const customTotal = useMemo(() => {
    return TESTS_DATA.filter(t => customTests[t.code]).reduce((sum, t) => sum + t.price, 0);
  }, [customTests]);

  const customCount = useMemo(() => {
    return Object.values(customTests).filter(Boolean).length;
  }, [customTests]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  }, [cart]);

  const displayTests = useMemo(() => TESTS_DATA.slice(0, 18), []);

  const handleWhatsApp = (msg) => {
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
    fireGA('whatsapp_click', msg.slice(0, 50));
  };

  const faqs = [
    {
      q: 'Health packages mein kya kya tests included hain?',
      a: 'Har package ki apni test list hoti hai. Basic Care Package mein CBC, LFT, KFT, FBS aur Lipid Profile shamil hain. Aap neeche diye cards mein poori list dekh sakte hain.'
    },
    {
      q: 'Kya mujhe test se pehle fasting (upwas) karna hoga?',
      a: 'Ye test par nirbhar karta hai. FBS aur Lipid Profile jaise tests ke liye 8-12 ghante fasting aavashyak hai. Kuch tests (jaise CBC, HbA1c) ke liye fasting nahi chahiye. Booking ke waqt hum aapko guide karenge.'
    },
    {
      q: 'Ghar se sample collection kaise hota hai?',
      a: 'Booking confirm hone ke baad, humara certified phlebotomist aapke door step par aata hai aur safe tarike se sample collect karta hai. Home collection ₹500 se upar ki booking par bilkul free hai.'
    },
    {
      q: 'Kya main apna custom package bana sakta hoon?',
      a: 'Bilkul! "Custom Package Banao" section mein jayein, neeche diye gaye tests mein se apni need ke tests select karein, aur "Add to Cart" par click karein. Aap utne tests select kar sakte hain jitne chaahein.'
    },
    {
      q: 'Payment ke kya options hain?',
      a: 'Aap Cash, UPI (Google Pay, PhonePe, Paytm), ya Credit/Debit card se payment kar sakte hain. Payment collection ke time par hoti hai ya aap online bhi advance payment kar sakte hain.'
    }
  ];

  const badgeStyle = (badge) => {
    const map = {
      'Popular': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Best Value': 'bg-amber-100 text-amber-800 border-amber-200',
      'Recommended': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return map[badge] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const badgeIcon = (badge) => {
    const map = {
      'Popular': <TrendingDown className="w-3.5 h-3.5" />,
      'Best Value': <Award className="w-3.5 h-3.5" />,
      'Recommended': <Sparkles className="w-3.5 h-3.5" />
    };
    return map[badge] || <Info className="w-3.5 h-3.5" />;
  };

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#085041] to-[#0F6E56] px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-emerald-300/30 rounded-full blur-[2px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-300/20 rounded-full blur-[1px] animate-pulse pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Save Up to 60%
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow-lg">
            Health Packages — Complete Body Checkup at Best Price
          </h1>
          <p className="text-base md:text-lg text-emerald-100/90 max-w-2xl mx-auto mb-8 font-medium drop-shadow-md">
            Sambhal ka sabse affordable health package. Ghar baithe free collection.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <a
              href="#packages"
              className="inline-flex items-center gap-2 bg-white text-[#085041] hover:bg-emerald-50 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <Package className="w-5 h-5" />
              View Packages
            </a>
            <button
              onClick={() => handleWhatsApp('Hi Sana Pathology, I want to know about your health packages. Please share details.')}
              className="inline-flex items-center gap-2 bg-[#25D366] text-white hover:bg-[#128C7E] px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp to Book
            </button>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section id="packages" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black tracking-widest text-[#1D9E75] uppercase bg-emerald-50 px-4 py-1.5 rounded-full">
              Health Packages
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-4 mb-2">
              Choose Your Health Package
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Select from our curated health packages designed for every need
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HEALTH_PACKAGES_DATA.map((pkg) => (
              <PackageCard 
                key={pkg.code} 
                pkg={pkg} 
                isAdded={isInCart(pkg.code)}
                onAdd={handlePackageToggle}
                onKnowMore={(p) => setSelectedPackageDetails(p)}
                onBookNow={handleBookNow}
                onWhatsApp={(msg) => handleWhatsApp(msg)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Custom Package Builder */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black tracking-widest text-[#1D9E75] uppercase bg-emerald-50 px-4 py-1.5 rounded-full">
              Custom Package
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-4 mb-2">
              Custom Package Banao — Sirf apne liye
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Apni need ke tests select karein aur apna khud ka package banayein
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {displayTests.map((test) => {
                const selected = !!customTests[test.code];
                return (
                  <button
                    key={test.code}
                    onClick={() => toggleCustomTest(test.code)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                      selected
                        ? 'border-[#1D9E75] bg-emerald-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      selected
                        ? 'bg-[#1D9E75] border-[#1D9E75]'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {selected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{test.code}</span>
                      <span className="block text-sm font-semibold text-gray-800 truncate">{test.testName}</span>
                      <span className="text-xs font-bold text-[#1D9E75]">₹{test.price}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {customCount > 0 && (
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#1D9E75]" />
                    <span className="font-bold text-gray-800">
                      Selected Tests: {customCount}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#1D9E75]">
                    ₹{customTotal}
                  </span>
                </div>
                <button
                  onClick={addCustomToCart}
                  className="w-full bg-[#1D9E75] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#187a5a] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  Add to Cart — ₹{customTotal}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black tracking-widest text-[#1D9E75] uppercase bg-emerald-50 px-4 py-1.5 rounded-full">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-4 mb-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm">
                <button
                  onClick={() => {
                    setOpenFaq(openFaq === idx ? null : idx);
                    fireGA('faq_toggle', faq.q.slice(0, 50));
                  }}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm md:text-base pr-4">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-[#1D9E75] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Cart Bottom Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 md:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-[#1D9E75]" />
                <span className="absolute -top-2 -right-2 bg-[#1D9E75] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{cart.length} Item{cart.length !== 1 ? 's' : ''}</p>
                <p className="text-sm font-black text-gray-900">₹{cartTotal}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleWhatsApp(`Hi Sana Pathology, I want to book the following:\n${cart.map(i => `- ${i.name} (₹${i.price})`).join('\n')}\nTotal: ₹${cartTotal}`)}
                className="inline-flex items-center gap-1.5 bg-[#25D366] text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-[#128C7E] transition-all active:scale-[0.97]"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              <button
                onClick={() => {
                  window.location.href = '/#booking';
                  fireGA('book_now_click', `Cart total: ₹${cartTotal}`);
                }}
                className="inline-flex items-center gap-1.5 bg-[#1D9E75] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#187a5a] transition-all shadow-lg shadow-emerald-200 active:scale-[0.97]"
              >
                Book Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for sticky bar */}
      {cart.length > 0 && <div className="h-20 md:h-24"></div>}
      <PackageDetailsModal 
        pkg={selectedPackageDetails}
        onClose={() => setSelectedPackageDetails(null)}
        onBookNow={(p) => {
          setSelectedPackageDetails(null);
          handleBookNow(p);
        }}
        isAdded={selectedPackageDetails ? isInCart(selectedPackageDetails.code) : false}
      />
    </PublicLayout>
  );
};

export default PackagesPublic;
