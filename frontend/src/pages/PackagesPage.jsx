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
import PackageCard from '../components/PackageCard';
import PackageDetailsModal from '../components/PackageDetailsModal';

const PackagesPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedPackageDetails, setSelectedPackageDetails] = useState(null);
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sana_cart')) || []; } catch { return []; }
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const getTestDetails = (testCode) => {
    const found = TESTS_DATA.find(t => t.code === testCode || t.testCode === testCode);
    return found || { testName: testCode, price: 0, category: { name: 'General' } };
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

  const handleBookNow = (pkg) => {
    if (pkg) {
      const exists = cartItems.some(item => item.testCode === pkg.code);
      if (!exists) {
        const newCart = [...cartItems, {
          name: pkg.name, price: pkg.price, testCode: pkg.code, isPackage: true
        }];
        setCartItems(newCart);
        localStorage.setItem('sana_cart', JSON.stringify(newCart));
      }
    }
    navigate('/book-online');
    window.scrollTo(0, 0);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HEALTH_PACKAGES_DATA.map((pkg) => (
              <PackageCard 
                key={pkg.code} 
                pkg={pkg} 
                isAdded={cartItems.some(item => item.testCode === pkg.code)}
                onAdd={handleAddToCart}
                onKnowMore={(p) => setSelectedPackageDetails(p)}
                onBookNow={handleBookNow}
                onWhatsApp={(msg) => window.open(`https://wa.me/916396786939?text=${encodeURIComponent(msg)}`, '_blank')}
              />
            ))}
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
      
      <PackageDetailsModal 
        pkg={selectedPackageDetails}
        onClose={() => setSelectedPackageDetails(null)}
        onBookNow={(p) => {
          setSelectedPackageDetails(null);
          handleBookNow(p);
        }}
        isAdded={selectedPackageDetails ? cartItems.some(item => item.testCode === selectedPackageDetails.code) : false}
      />
    </div>
  );
};

export default PackagesPage;
