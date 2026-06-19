import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { TESTS_DATA, HEALTH_PACKAGES_DATA } from '../data/testsData';
import { Search, Info, Plus, Check, ShoppingCart } from 'lucide-react';

const TestsCatalog = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sana_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sana_cart', JSON.stringify(cart));
  }, [cart]);

  // Extract unique categories
  const categories = ['All', ...new Set(TESTS_DATA.map(t => t.category?.name || 'Other'))];

  // Filter tests
  const filteredTests = TESTS_DATA.filter(t => {
    const matchesSearch = t.testName.toLowerCase().includes(search.toLowerCase()) || 
                          t.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || (t.category?.name === activeCategory);
    return matchesSearch && matchesCategory;
  });

  const toggleCartItem = (test, isPackage = false) => {
    const itemKey = isPackage ? test.code : test.code;
    const exists = cart.some(item => item.testCode === itemKey);
    
    if (exists) {
      setCart(prev => prev.filter(item => item.testCode !== itemKey));
    } else {
      const newItem = {
        id: test.id || Date.now(),
        testCode: itemKey,
        name: test.testName || test.name,
        price: test.price,
        sampleType: test.sampleType || 'Blood',
        category: isPackage ? 'Package' : 'Catalog'
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  const isInCart = (code) => {
    return cart.some(item => item.testCode === code);
  };

  return (
    <PublicLayout>
      <div className="bg-[#F5F7F6] min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
            <span className="bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-black uppercase px-4 py-1.5 rounded-full border border-[#1D9E75]/20 tracking-wider inline-block">
              NABL Standard Pathology Tests
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-heading text-[#085041] tracking-tight leading-none">
              Interactive Test Directory
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Browse our complete catalog of pathology tests and wellness packages. Select the tests you need to configure your home collection booking.
            </p>
          </div>

          {/* Search and Category Filters */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl mb-8 space-y-6">
            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1D9E75]/20 to-emerald-300/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <input
                type="text"
                placeholder="Search for blood tests, sugar, lipid, thyroid, packages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="relative w-full pl-12 pr-5 py-4 border-2 border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#1D9E75] transition-all bg-white/80"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4.5" />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                    activeCategory === cat
                      ? 'bg-[#1D9E75] text-white shadow-md'
                      : 'bg-[#F5F7F6] text-slate-500 hover:bg-slate-200/60 hover:text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Health Packages section (to attract people) */}
          <div className="mb-12">
            <h2 className="text-2xl font-black text-[#085041] mb-6 font-heading">Suggested Health Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HEALTH_PACKAGES_DATA.map(pkg => {
                const selected = isInCart(pkg.code);
                return (
                  <div 
                    key={pkg.code} 
                    className={`bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                      selected 
                        ? 'border-[#1D9E75] shadow-[#1D9E75]/10 shadow-xl scale-[1.01]' 
                        : 'border-slate-100 shadow-md hover:shadow-xl hover:scale-[1.01]'
                    }`}
                  >
                    <div className="space-y-3">
                      {pkg.badge && (
                        <span className="bg-[#BA7517]/10 text-[#BA7517] text-[10px] font-black uppercase px-2.5 py-1 rounded border border-[#BA7517]/20">
                          {pkg.badge}
                        </span>
                      )}
                      <h3 className="text-xl font-black text-slate-800">{pkg.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{pkg.desc}</p>
                      <div className="flex items-baseline gap-2 pt-2">
                        <span className="text-2xl font-black text-[#1D9E75]">₹{pkg.price}</span>
                        <span className="text-xs text-slate-400 line-through">₹{pkg.originalPrice}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleCartItem(pkg, true)}
                      className={`w-full mt-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        selected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#1D9E75] text-white hover:bg-[#1D9E75]/95 shadow-md shadow-[#1D9E75]/10'
                      }`}
                    >
                      {selected ? <Check size={14} /> : <Plus size={14} />}
                      {selected ? 'Added to Cart' : 'Select Package'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test List Section */}
          <div>
            <h2 className="text-2xl font-black text-[#085041] mb-6 font-heading">Pathology Test Catalog ({filteredTests.length})</h2>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Test Detail</th>
                      <th className="py-4 px-6">Prep / Instruction</th>
                      <th className="py-4 px-6">Sample</th>
                      <th className="py-4 px-6 text-right">Price</th>
                      <th className="py-4 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTests.map(t => {
                      const selected = isInCart(t.code);
                      return (
                        <tr key={t.code} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-extrabold text-slate-800 text-sm">{t.testName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Code: {t.code} | {t.category?.name}</p>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500">
                            <span className="flex items-start gap-1">
                              <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                              <span>{t.preparation || 'No special preparation needed.'}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs font-bold text-slate-600">{t.sampleType}</td>
                          <td className="py-4 px-6 text-right font-black text-base text-[#1D9E75]">₹{t.price}</td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => toggleCartItem(t, false)}
                              className={`p-2.5 rounded-xl transition-all ${
                                selected
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-[#1D9E75]/10 text-[#1D9E75] hover:bg-[#1D9E75]/20'
                              }`}
                              title={selected ? 'Remove from Booking' : 'Add to Booking'}
                            >
                              {selected ? <Check size={16} /> : <Plus size={16} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Floating Cart Button */}
          {cart.length > 0 && (
            <div className="fixed bottom-6 right-24 z-50">
              <button
                onClick={() => navigate('/#booking')}
                className="flex items-center gap-2 bg-[#BA7517] hover:bg-[#9E6312] text-white px-6 py-4 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 font-extrabold text-sm"
              >
                <ShoppingCart size={18} />
                <span>Book Selected ({cart.length})</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
};

export default TestsCatalog;
