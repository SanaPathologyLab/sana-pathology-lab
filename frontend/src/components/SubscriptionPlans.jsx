import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Crown, Check, Zap, Sparkles, Shield, Star, TrendingUp, AlertCircle, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PLANS = [
  {
    id: 'basic',
    name: 'Sana Health Pass - Basic',
    nameHi: 'सना हेल्थ पास - बेसिक',
    price: 299,
    period: 'month',
    testsIncluded: 2,
    features: [
      { text: '2 routine tests/month', textHi: '2 नियमित टेस्ट/महीना', included: true },
      { text: 'Digital reports on WhatsApp', textHi: 'व्हाट्सएप पर डिजिटल रिपोर्ट', included: true },
      { text: '10% off additional tests', textHi: 'अतिरिक्त टेस्ट पर 10% छूट', included: true },
      { text: 'Free home collection', textHi: 'मुफ्त होम कलेक्शन', included: false },
      { text: 'Priority 4hr reporting', textHi: 'प्राथमिकता 4 घंटे रिपोर्ट', included: false },
    ],
    popular: false,
    icon: Shield,
    color: 'from-slate-600 to-slate-700'
  },
  {
    id: 'standard',
    name: 'Sana Health Pass - Standard',
    nameHi: 'सना हेल्थ पास - स्टैंडर्ड',
    price: 499,
    period: 'month',
    testsIncluded: 4,
    features: [
      { text: '4 routine tests/month', textHi: '4 नियमित टेस्ट/महीना', included: true },
      { text: 'Digital reports on WhatsApp', textHi: 'व्हाट्सएप पर डिजिटल रिपोर्ट', included: true },
      { text: '15% off additional tests', textHi: 'अतिरिक्त टेस्ट पर 15% छूट', included: true },
      { text: 'Free home collection', textHi: 'मुफ्त होम कलेक्शन', included: true },
      { text: 'Priority 4hr reporting', textHi: 'प्राथमिकता 4 घंटे रिपोर्ट', included: true },
    ],
    popular: true,
    icon: Zap,
    color: 'from-primary to-primary-light'
  },
  {
    id: 'premium',
    name: 'Sana Health Pass - Premium',
    nameHi: 'सना हेल्थ पास - प्रीमियम',
    price: 999,
    period: 'month',
    testsIncluded: 'Unlimited',
    features: [
      { text: 'Unlimited routine tests', textHi: 'असीमित नियमित टेस्ट', included: true },
      { text: 'Digital reports on WhatsApp', textHi: 'व्हाट्सएप पर डिजिटल रिपोर्ट', included: true },
      { text: '25% off specialized tests', textHi: 'विशेष टेस्ट पर 25% छूट', included: true },
      { text: 'Free home collection', textHi: 'मुफ्त होम कलेक्शन', included: true },
      { text: 'Priority 4hr reporting', textHi: 'प्राथमिकता 4 घंटे रिपोर्ट', included: true },
      { text: 'Dedicated phlebotomist', textHi: 'समर्पित फ्लेबोटोमिस्ट', included: true },
    ],
    popular: false,
    icon: Crown,
    color: 'from-amber-600 to-orange-700'
  }
];

const COMPARISON_FEATURES = [
  {
    key: 'tests',
    label: 'Routine tests/month',
    labelHi: 'नियमित टेस्ट/महीना',
    values: { basic: '2', standard: '4', premium: 'Unlimited' }
  },
  {
    key: 'reports',
    label: 'Digital reports on WhatsApp',
    labelHi: 'व्हाट्सएप पर डिजिटल रिपोर्ट',
    values: { basic: true, standard: true, premium: true }
  },
  {
    key: 'discount',
    label: 'Discount on additional tests',
    labelHi: 'अतिरिक्त टेस्ट पर छूट',
    values: { basic: '10% off', standard: '15% off', premium: '25% off specialized' }
  },
  {
    key: 'homeCollection',
    label: 'Free home collection',
    labelHi: 'मुफ्त होम कलेक्शन',
    values: { basic: false, standard: true, premium: true }
  },
  {
    key: 'priority',
    label: 'Priority 4hr reporting',
    labelHi: 'प्राथमिकता 4 घंटे रिपोर्ट',
    values: { basic: false, standard: true, premium: true }
  },
  {
    key: 'phlebotomist',
    label: 'Dedicated phlebotomist',
    labelHi: 'समर्पित फ्लेबोटोमिस्ट',
    values: { basic: false, standard: false, premium: true }
  }
];

const BILLING_OPTIONS = [
  { id: 'monthly', label: 'Monthly', labelHi: 'मासिक', multiplier: 1, discount: 0 },
  { id: 'quarterly', label: 'Quarterly', labelHi: 'त्रैमासिक', multiplier: 3, discount: 10 },
  { id: 'yearly', label: 'Yearly', labelHi: 'वार्षिक', multiplier: 12, discount: 20 },
];

const getPriceForPeriod = (basePrice, option) => {
  if (option.discount === 0) return basePrice * option.multiplier;
  return Math.round(basePrice * option.multiplier * (1 - option.discount / 100));
};

const getEffectiveMonthly = (basePrice, option) => {
  return Math.round(getPriceForPeriod(basePrice, option) / option.multiplier);
};

const planIcons = [Shield, Zap, Crown];

const SubscriptionPlans = () => {
  const { language } = useLanguage();
  const isHindi = language === 'hi';
  const [subscription, setSubscription] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [processing, setProcessing] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [successPlan, setSuccessPlan] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('sana_subscription');
    if (saved) {
      try {
        setSubscription(JSON.parse(saved));
      } catch {
        localStorage.removeItem('sana_subscription');
      }
    }
  }, []);

  const currentBilling = useMemo(
    () => BILLING_OPTIONS.find((b) => b.id === billingPeriod) || BILLING_OPTIONS[0],
    [billingPeriod]
  );

  const handleSubscribe = useCallback(
    async (planId) => {
      const plan = PLANS.find((p) => p.id === planId);
      if (!plan) return;

      setProcessing(planId);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const subData = {
        planId: plan.id,
        planName: plan.name,
        planNameHi: plan.nameHi,
        price: plan.price,
        billingPeriod: currentBilling.id,
        amountPaid: getPriceForPeriod(plan.price, currentBilling),
        subscribedAt: new Date().toISOString(),
        status: 'active',
      };

      localStorage.setItem('sana_subscription', JSON.stringify(subData));
      setSubscription(subData);
      setProcessing(null);
      setSuccessPlan(planId);
      setTimeout(() => setSuccessPlan(null), 3000);
    },
    [currentBilling]
  );

  const handleCancel = useCallback(() => {
    localStorage.removeItem('sana_subscription');
    setSubscription(null);
  }, []);

  const isSubscribed = (planId) => subscription?.planId === planId;
  const hasSubscription = !!subscription;

  const BillingToggle = () => (
    <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg shadow-black/5 border border-gray-100">
      {BILLING_OPTIONS.map((opt) => {
        const active = billingPeriod === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setBillingPeriod(opt.id)}
            className={`relative px-4 sm:px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
              active
                ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
            }`}
          >
            <span>{isHindi ? opt.labelHi : opt.label}</span>
            {opt.discount > 0 && (
              <span className={`absolute -top-2 -right-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                active ? 'bg-white text-primary' : 'bg-green-100 text-green-700'
              }`}>
                {opt.discount}% OFF
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const PlanCard = ({ plan, index }) => {
    const PlanIcon = plan.icon;
    const subscribed = isSubscribed(plan.id);
    const price = getPriceForPeriod(plan.price, currentBilling);
    const monthlyEff = getEffectiveMonthly(plan.price, currentBilling);
    const processingThis = processing === plan.id;
    const successThis = successPlan === plan.id;

    return (
      <div
        className={`relative group flex flex-col rounded-3xl transition-all duration-500 ${
          plan.popular
            ? 'scale-100 sm:scale-105 z-10'
            : 'scale-100'
        } ${
          subscribed
            ? 'ring-2 ring-primary ring-offset-2 shadow-2xl shadow-primary/20'
            : 'hover:shadow-2xl hover:-translate-y-1'
        } bg-white shadow-xl shadow-black/5 border border-gray-100`}
      >
        {plan.popular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="relative">
              <div className="bg-gradient-to-r from-primary to-primary-light text-white text-xs font-extrabold px-5 py-1.5 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1.5 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-white" />
                {isHindi ? 'सबसे लोकप्रिय' : 'Most Popular'}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-primary-light" />
            </div>
          </div>
        )}

        {subscribed && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-extrabold px-5 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 whitespace-nowrap">
              <Check className="w-3.5 h-3.5" />
              {isHindi ? 'आपकी योजना' : 'Your Plan'}
            </div>
          </div>
        )}

        <div className={`relative overflow-hidden rounded-t-3xl p-6 sm:p-7 bg-gradient-to-br ${plan.color}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_70%)]" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl">
              <PlanIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">
                {isHindi ? plan.nameHi : plan.name}
              </h3>
              <p className="text-white/60 text-xs mt-0.5">
                {isHindi
                  ? `${plan.testsIncluded === 'Unlimited' ? 'असीमित' : plan.testsIncluded} टेस्ट शामिल`
                  : `${plan.testsIncluded} test${plan.testsIncluded === 1 ? '' : 's'} included`
                }
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-4 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">₹{price.toLocaleString('en-IN')}</span>
            <span className="text-white/70 text-sm font-medium">
              /{currentBilling.id === 'monthly' ? (isHindi ? 'महीना' : 'mo') : currentBilling.id === 'quarterly' ? (isHindi ? 'तिमाही' : 'qtr') : (isHindi ? 'साल' : 'yr')}
            </span>
          </div>

          {currentBilling.id !== 'monthly' && (
            <p className="relative z-10 text-white/50 text-xs mt-1">
              {isHindi ? `केवल ₹${monthlyEff}/महीना प्रभावी` : `₹${monthlyEff}/mo effective`}
            </p>
          )}

          {currentBilling.discount > 0 && (
            <div className="relative z-10 mt-2 inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              {isHindi
                ? `सामान्य दर से ${currentBilling.discount}% सस्ता`
                : `Save ${currentBilling.discount}% vs monthly`
              }
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col p-6 sm:p-7 pt-5">
          <ul className="space-y-3 flex-1">
            {plan.features.map((feat, i) => (
              <li key={i} className={`flex items-start gap-3 text-sm ${
                feat.included ? 'text-gray-700' : 'text-gray-400'
              }`}>
                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 ${
                  feat.included
                    ? subscribed
                      ? 'bg-emerald-100 text-emerald-600'
                      : plan.popular
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-500'
                    : 'bg-gray-50 text-gray-300'
                }`}>
                  {feat.included ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </span>
                <span className={feat.included ? '' : 'line-through'}>
                  {isHindi ? feat.textHi : feat.text}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {processingThis ? (
              <button
                disabled
                className="w-full py-3.5 rounded-2xl bg-gray-100 text-gray-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                {isHindi ? 'प्रोसेसिंग...' : 'Processing...'}
              </button>
            ) : subscribed ? (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3.5 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center gap-2 border-2 border-emerald-200 cursor-default"
                >
                  <Check className="w-4 h-4" />
                  {isHindi ? 'सक्रिय सदस्यता' : 'Active Subscription'}
                </button>
                <div className="flex gap-2">
                  {PLANS.filter((p) => p.id !== subscription.planId).map((p) => {
                    const loading = processing === `switch-${p.id}`;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSubscribe(p.id)}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 font-semibold text-xs transition-all disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                        ) : isHindi ? (
                          `${p.id === 'standard' ? 'स्टैंडर्ड' : p.id === 'basic' ? 'बेसिक' : 'प्रीमियम'} पर स्विच`
                        ) : (
                          `Switch to ${p.id.charAt(0).toUpperCase() + p.id.slice(1)}`
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleCancel}
                  className="w-full py-2 text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                >
                  {isHindi ? 'सदस्यता रद्द करें' : 'Cancel Subscription'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5'
                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/10 hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {successThis ? (
                  <>
                    <Check className="w-4 h-4" />
                    {isHindi ? 'सफल!' : 'Success!'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {isHindi ? 'अभी सब्सक्राइब करें' : 'Subscribe Now'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ComparisonTable = () => (
    <div className="mt-16 sm:mt-20">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isHindi ? 'सभी योजनाओं की तुलना' : 'Compare All Plans'}
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          {isHindi
            ? 'विस्तृत सुविधाओं की तुलना देखें'
            : 'Detailed feature comparison across all plans'
          }
        </p>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg shadow-black/5">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-5 text-left text-sm font-bold text-gray-700 w-[180px] sm:w-[220px]">
                    {isHindi ? 'सुविधाएं' : 'Features'}
                  </th>
                  {PLANS.map((plan) => (
                    <th key={plan.id} className={`py-4 px-4 text-center text-sm font-bold ${
                      isSubscribed(plan.id) ? 'text-primary' : 'text-gray-700'
                    }`}>
                      <div className="flex flex-col items-center gap-1">
                        {isHindi ? plan.nameHi : plan.name}
                        {isSubscribed(plan.id) && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full">
                            {isHindi ? 'आपकी योजना' : 'Your Plan'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPARISON_FEATURES.map((feature) => (
                  <tr key={feature.key} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-5 text-sm text-gray-600 font-medium">
                      {isHindi ? feature.labelHi : feature.label}
                    </td>
                    {PLANS.map((plan) => {
                      const val = feature.values[plan.id];
                      return (
                        <td key={plan.id} className="py-3.5 px-4 text-center">
                          {typeof val === 'boolean' ? (
                            val ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-600">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-300">
                                <X className="w-4 h-4" />
                              </span>
                            )
                          ) : (
                            <span className="text-sm font-semibold text-gray-800">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-gray-50/50">
                  <td className="py-4 px-5 text-sm font-bold text-gray-700">
                    {isHindi ? 'कीमत' : 'Price'}
                  </td>
                  {PLANS.map((plan) => {
                    const price = getPriceForPeriod(plan.price, currentBilling);
                    return (
                      <td key={plan.id} className="py-4 px-4 text-center">
                        <span className="text-base font-extrabold text-gray-900">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                          /{currentBilling.id === 'monthly' ? (isHindi ? 'माह' : 'mo') : currentBilling.id === 'quarterly' ? (isHindi ? 'तिमाही' : 'qtr') : (isHindi ? 'साल' : 'yr')}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/5 text-primary text-xs font-extrabold px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {isHindi ? 'सदस्यता योजनाएं' : 'Subscription Plans'}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {isHindi ? 'सना हेल्थ पास' : 'Sana Health Pass'}
          </h1>
          <p className="text-gray-500 mt-3 text-sm sm:text-base max-w-xl mx-auto">
            {isHindi
              ? 'अपनी ज़रूरत के अनुसार योजना चुनें और हर महीने स्वास्थ्य जांच पर बचत करें'
              : 'Choose a plan that fits your needs and save on health checkups every month'
            }
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <BillingToggle />
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:gap-8 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start max-w-5xl mx-auto">
          {PLANS.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>

        {hasSubscription && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-5 py-3 rounded-2xl border border-blue-100">
              <AlertCircle className="w-4 h-4" />
              {isHindi
                ? `आप वर्तमान में "${subscription.planNameHi}" योजना पर हैं। ऊपर से अपग्रेड या डाउनग्रेड करें।`
                : `You are on the "${subscription.planName}" plan. Upgrade or downgrade above.`
              }
            </div>
          </div>
        )}

        <ComparisonTable />
      </div>
    </section>
  );
};

export default SubscriptionPlans;
