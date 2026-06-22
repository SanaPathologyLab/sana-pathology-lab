import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { HEALTH_PACKAGES_DATA, TESTS_DATA } from '../data/testsData';
import {
  Package, CheckCircle2, Clock, ShieldCheck, Award, Heart,
  ArrowRight, Info, Sparkles, TrendingUp, BadgePercent
} from 'lucide-react';
import PublicHomeHeader from '../components/PublicHomeHeader';
import EmergencyWidget from '../components/EmergencyWidget';
import LiveChatWidget from '../components/LiveChatWidget';

const PackagesPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sana_cart')) || []; } catch { return []; }
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const getTestDetails = (testCode) => {
    const found = TESTS_DATA.find(t => t.code === testCode || t.testCode === testCode);
    return found || { testName: testCode, price: 0, category: { name: 'General' } };
  };

  const handleSelectPackage = (pkg) => {
    if (selectedPackage?.code === pkg.code) {
      setSelectedPackage(null);
    } else {
      setSelectedPackage(pkg);
    }
  };

  const handleAddToCart = (pkg) => {
    const exists = cartItems.some(item => item.testCode === pkg.code);
    let newCart;
    if (exists) {
      newCart = cartItems.filter(item => item.testCode !== pkg.code);
    } else {
      newCart = [...cartItems, {
        name: pkg.name, price: pkg.price, testCode: pkg.code, isPackage: true
      }];
    }
    setCartItems(newCart);
    localStorage.setItem('sana_cart', JSON.stringify(newCart));
  };

  const handleBookNow = () => {
    navigate('/book-online');
  };

  return (
    <div className="min-h-screen bg-bg font-sans text-slate-800">
      <PublicHomeHeader cartCount={cartItems.length} />

      {/* Hero */}
      <section className="relative pt-24 pb-28 overflow-hidden bg-gradient-to-br from-[#063b30] via-[#085041] to-[#0b6b55]">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md border border-white/20">
            <Sparkles size={14} className="text-[#F1C40F]" />
            Curated Wellness
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-white leading-tight mb-4">
            {t('popularPackages')}
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/80 max-w-2xl mx-auto font-medium">
            {t('packagesSub')}
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HEALTH_PACKAGES_DATA.map((pkg, index) => {
              const isSelected = selectedPackage?.code === pkg.code;
              const inCart = cartItems.some(item => item.testCode === pkg.code);
              const savings = pkg.originalPrice - pkg.price;
              const savingsPercent = Math.round((savings / pkg.originalPrice) * 100);
              const testDetails = pkg.tests.map(code => getTestDetails(code));

              return (
                <div
                  key={pkg.code}
                  className={`relative bg-white rounded-3xl border-2 transition-all duration-300 overflow-hidden group ${
                    isSelected ? 'border-primary shadow-2xl shadow-primary/10 scale-[1.02]' : 'border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${
                        pkg.badge === 'Popular' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        pkg.badge === 'Best Value' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {pkg.badge === 'Popular' ? '🔥 Popular' : pkg.badge === 'Best Value' ? '⭐ Best Value' : '✓ Recommended'}
                      </span>
                    </div>
                  )}

                  {/* Header Gradient */}
                  <div className={`h-2 w-full bg-gradient-to-r ${
                    pkg.badge === 'Popular' ? 'from-amber-400 to-orange-500' :
                    pkg.badge === 'Best Value' ? 'from-emerald-400 to-teal-500' :
                    'from-blue-400 to-indigo-500'
                  }`}></div>

                  <div className="p-6 md:p-8">
                    {/* Package Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                      pkg.badge === 'Popular' ? 'bg-amber-50 text-amber-600' :
                      pkg.badge === 'Best Value' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      <Package className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-black text-slate-800 mb-2">{pkg.name}</h3>
                    <p className="text-sm text-slate-500 font-semibold mb-4 leading-relaxed">{pkg.desc}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-5">
                      <span className="text-3xl font-black text-slate-800">₹{pkg.price}</span>
                      <span className="text-sm line-through text-slate-400 font-bold">₹{pkg.originalPrice}</span>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        Save {savingsPercent}%
                      </span>
                    </div>

                    {/* Tests Included */}
                    <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-primary" />
                        {pkg.tests.length} Tests Included
                      </h4>
                      <div className="space-y-2">
                        {testDetails.map((test, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-700">{test.testName}</span>
                            <span className="text-xs font-bold text-slate-400">₹{test.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-600">Total Value</span>
                        <span className="font-black text-slate-800">₹{testDetails.reduce((sum, t) => sum + t.price, 0)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleAddToCart(pkg)}
                        className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                          inCart
                            ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98]'
                        }`}
                      >
                        {inCart ? (
                          <><CheckCircle2 size={18} /> Added to Cart</>
                        ) : (
                          <><Heart size={18} /> Add to Cart</>
                        )}
                      </button>
                      <button
                        onClick={() => handleSelectPackage(pkg)}
                        className="w-full py-3 border-2 border-slate-200 hover:border-primary/30 rounded-2xl text-xs font-bold text-slate-500 hover:text-primary transition-all"
                      >
                        {isSelected ? 'Show Less' : 'View Full Details'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          {cartItems.length > 0 && (
            <div className="mt-12 bg-white rounded-3xl border border-slate-100 shadow-lg p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Your Selection</h3>
                  <p className="text-sm text-slate-500 font-semibold">
                    {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in cart
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold">Total</p>
                    <p className="text-2xl font-black text-primary">
                      ₹{cartItems.reduce((sum, item) => sum + item.price, 0)}
                    </p>
                  </div>
                  <button
                    onClick={handleBookNow}
                    className="bg-gradient-to-r from-primary to-primary-light text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Book Now <ArrowRight size={16} className="inline ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Benefit Strip */}
      <section className="py-16 bg-primary-pale/30 border-y border-emerald-100/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, label: 'NABL Accredited Lab', sub: 'ISO 15189 Standards' },
              { icon: Clock, label: '6-12 Hour TAT', sub: 'Fast Report Delivery' },
              { icon: Heart, label: 'Free Home Collection', sub: 'Within City Limits' },
              { icon: TrendingUp, label: 'Certified Pathologists', sub: 'MD, DNB Qualified' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="text-center p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{item.label}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">{item.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#085041] pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-primary-pale">
        <div className="max-w-7xl mx-auto text-center border-t border-white/10 pt-8 text-sm opacity-60">
          {t('copyright')}
        </div>
      </footer>

      <EmergencyWidget />
      <LiveChatWidget />
    </div>
  );
};

export default PackagesPage;
