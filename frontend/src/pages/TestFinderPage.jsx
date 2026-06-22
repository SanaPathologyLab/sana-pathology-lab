import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { TESTS_DATA } from '../data/testsData';
import {
  Search, FlaskConical, Filter, Heart, X, ShoppingCart, ArrowRight,
  CheckCircle2, Sparkles, Info, AlertCircle
} from 'lucide-react';
import PublicHomeHeader from '../components/PublicHomeHeader';
import EmergencyWidget from '../components/EmergencyWidget';
import LiveChatWidget from '../components/LiveChatWidget';

const DEFAULT_TESTS = TESTS_DATA;

const TestFinderPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sana_cart')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('sana_cart', JSON.stringify(selectedTests));
  }, [selectedTests]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/public/tests');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setTests(data);
            const cats = new Set(data.map(t => t.category?.name || 'Other'));
            setCategories(['All', ...Array.from(cats)]);
          } else { setTests(DEFAULT_TESTS); setCategories(['All', ...new Set(DEFAULT_TESTS.map(t => t.category?.name || 'Other'))]); }
        } else { setTests(DEFAULT_TESTS); setCategories(['All', ...new Set(DEFAULT_TESTS.map(t => t.category?.name || 'Other'))]); }
      } catch { setTests(DEFAULT_TESTS); setCategories(['All', ...new Set(DEFAULT_TESTS.map(t => t.category?.name || 'Other'))]); }
      finally { setLoading(false); }
    };
    fetchTests();
  }, []);

  const activeTests = tests.length > 0 ? tests : DEFAULT_TESTS;
  const filteredTests = activeTests.filter(t => {
    const matchesCategory = selectedCategory === 'All' || (t.category?.name || 'Other') === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = t.testName?.toLowerCase().includes(query) ||
                          t.testCode?.toLowerCase().includes(query) ||
                          (t.category?.name || '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const toggleTest = (test) => {
    const key = test.testCode || test.code;
    const exists = selectedTests.some(t => t.testCode === key);
    if (exists) {
      setSelectedTests(prev => prev.filter(t => t.testCode !== key));
    } else {
      setSelectedTests(prev => [...prev, {
        name: test.testName,
        price: test.price,
        testCode: key,
        isPackage: false
      }]);
    }
  };

  const removeTest = (code) => {
    setSelectedTests(prev => prev.filter(t => t.testCode !== code));
  };

  const totalPrice = selectedTests.reduce((acc, t) => acc + t.price, 0);

  return (
    <div className="min-h-screen bg-bg font-sans text-slate-800">
      <PublicHomeHeader cartCount={selectedTests.length} />

      {/* Hero */}
      <section className="relative pt-28 pb-32 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md border border-white/20">
            <FlaskConical size={14} className="text-[#F1C40F]" />
            {t('catalog')}
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-white leading-tight mb-4">
            {t('testExplorer')}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium mb-8">
            {t('explorerSub')}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchExplorerPlaceholder')}
              className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 font-semibold text-sm focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test List */}
          <div className="lg:col-span-2">
            {/* Category Filters */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 mb-6 overflow-x-auto">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400 shrink-0" />
                <span className="text-xs font-bold text-slate-500 uppercase mr-2 shrink-0">{t('filter')}</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`shrink-0 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                      }`}
                    >
                      {cat === 'All' ? t('filterAll') : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12 text-slate-400 font-semibold">Loading tests...</div>
              ) : filteredTests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No tests found matching your search.</p>
                  <p className="text-sm text-slate-400 mt-1">Try searching for CBC, Sugar, Thyroid, etc.</p>
                </div>
              ) : (
                filteredTests.map((test) => {
                  const key = test.testCode || test.code;
                  const isSelected = selectedTests.some(t => t.testCode === key);
                  return (
                    <div
                      key={key}
                      onClick={() => toggleTest(test)}
                      className={`bg-white rounded-2xl border-2 p-4 md:p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? 'border-primary shadow-lg shadow-primary/5 bg-primary-pale/20'
                          : 'border-slate-100 hover:border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isSelected ? 'bg-primary border-primary' : 'border-slate-300'
                        }`}>
                          {isSelected && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{test.testName}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{key}</span>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{test.sampleType || 'Blood'}</span>
                                {test.category?.name && (
                                  <span className="text-[10px] font-bold text-primary bg-primary-pale/50 px-2 py-0.5 rounded-md">{test.category.name}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`text-lg font-black ${isSelected ? 'text-primary' : 'text-slate-800'}`}>₹{test.price}</span>
                            </div>
                          </div>
                          {test.preparation && (
                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                              <Info size={12} className="shrink-0" /> {test.preparation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky top-28">
              <div className="flex items-center gap-2 mb-5">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h3 className="font-black text-slate-800 text-lg">{t('yourBooking')}</h3>
                {selectedTests.length > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
                    {selectedTests.length}
                  </span>
                )}
              </div>

              {selectedTests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-semibold text-sm">{t('noTestsSelected')}</p>
                  <p className="text-xs text-slate-400 mt-1">{t('clickToSelect')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {selectedTests.map((item) => (
                      <div key={item.testCode} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 group hover:bg-slate-100 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                          <p className="text-xs font-black text-primary mt-0.5">₹{item.price}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeTest(item.testCode); }}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={14} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-slate-600">{t('totalPrice')}</span>
                      <span className="text-xl font-black text-primary">₹{totalPrice}</span>
                    </div>
                    <button
                      onClick={() => navigate('/book-online')}
                      className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {t('bookOnline')} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <EmergencyWidget />
      <LiveChatWidget />
    </div>
  );
};

export default TestFinderPage;
