import React, { useMemo } from 'react';
import { Lightbulb, Plus, IndianRupee, BadgePercent, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const UPSELL_RULES = {
  'CBC': [
    { testCode: 'VITD', name: 'Vitamin D', nameHi: 'विटामिन डी', price: 800, reason: 'Patients who booked CBC also checked their Vitamin D levels', reasonHi: 'जिन मरीजों ने CBC बुक किया उन्होंने विटामिन डी भी जांचा', comboPrice: 950, comboDiscount: 150 },
    { testCode: 'HB-01', name: 'Iron Studies (Hb)', nameHi: 'आयरन स्टडीज', price: 100, reason: 'Anemia screening pairs well with CBC', reasonHi: 'एनीमिया जांच CBC के साथ अच्छी जोड़ी है', comboPrice: 280, comboDiscount: 20 },
  ],
  'LFT': [
    { testCode: 'LIPID', name: 'Lipid Profile', nameHi: 'लिपिड प्रोफाइल', price: 650, reason: 'Liver & Heart health check - complete combo', reasonHi: 'लिवर और हृदय स्वास्थ्य जांच', comboPrice: 950, comboDiscount: 200 },
    { testCode: 'KFT', name: 'Kidney Function Test', nameHi: 'किडनी फंक्शन टेस्ट', price: 500, reason: 'Complete organ function screening', reasonHi: 'पूर्ण अंग कार्य जांच', comboPrice: 900, comboDiscount: 100 },
  ],
  'KFT': [
    { testCode: 'LFT', name: 'Liver Function Test', nameHi: 'लिवर फंक्शन टेस्ट', price: 500, reason: 'Complete metabolic panel', reasonHi: 'पूर्ण मेटाबोलिक पैनल', comboPrice: 900, comboDiscount: 100 },
    { testCode: 'URINE', name: 'Urine Routine', nameHi: 'यूरिन रूटीन', price: 150, reason: 'Kidney + Urine combo for complete renal check', reasonHi: 'किडनी + यूरिन पूर्ण जांच', comboPrice: 600, comboDiscount: 50 },
  ],
  'FBS': [
    { testCode: 'HBA1C', name: 'HbA1c', nameHi: 'एचबीए1सी', price: 400, reason: '3-month sugar monitoring adds context to fasting sugar', reasonHi: '3 महीने का शुगर कंट्रोल', comboPrice: 450, comboDiscount: 50 },
    { testCode: 'LIPID', name: 'Lipid Profile', nameHi: 'लिपिड प्रोफाइल', price: 650, reason: 'Diabetic patients should monitor cholesterol too', reasonHi: 'मधुमेह रोगियों को कोलेस्ट्रॉल भी जांचना चाहिए', comboPrice: 700, comboDiscount: 50 },
  ],
  'THYROID': [
    { testCode: 'VITD', name: 'Vitamin D', nameHi: 'विटामिन डी', price: 800, reason: 'Thyroid and Vitamin D deficiency often go together', reasonHi: 'थायराइड और विटामिन डी की कमी अक्सर साथ होती है', comboPrice: 1100, comboDiscount: 200 },
  ],
  'LIPID': [
    { testCode: 'FBS', name: 'Fasting Blood Sugar', nameHi: 'खाली पेट शुगर', price: 100, reason: 'Cholesterol & Sugar - complete cardiac risk screening', reasonHi: 'कोलेस्ट्रॉल और शुगर - पूर्ण हृदय जांच', comboPrice: 700, comboDiscount: 50 },
  ],
};

const UpsellRecommendations = ({ selectedTests, onAddTest, className }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const selectedCodes = useMemo(
    () => new Set(selectedTests.map(t => t.testCode || t.code)),
    [selectedTests]
  );

  const recommendations = useMemo(() => {
    const seen = new Set();
    const results = [];

    for (const test of selectedTests) {
      const code = test.testCode || test.code;
      const rules = UPSELL_RULES[code];
      if (!rules) continue;

      for (const rec of rules) {
        if (selectedCodes.has(rec.testCode) || seen.has(rec.testCode)) continue;
        seen.add(rec.testCode);
        results.push(rec);
        if (results.length >= 3) break;
      }
      if (results.length >= 3) break;
    }

    return results.slice(0, 3);
  }, [selectedTests, selectedCodes]);

  if (!selectedTests.length || !recommendations.length) return null;

  return (
    <div className={className}>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .upsell-card {
          animation: slideInRight 0.4s ease-out both;
        }
      `}</style>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-lg">
            <Lightbulb size={16} className="text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            {isEn ? 'You may also need' : 'ये भी जांच सकते हैं'}
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={rec.testCode}
              className="upsell-card bg-white dark:bg-gray-800 rounded-lg border border-amber-100 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {isEn ? rec.name : rec.nameHi}
                    </h4>
                    {rec.comboDiscount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded-full">
                        <BadgePercent size={10} />
                        {isEn ? `Save ₹${rec.comboDiscount}` : `₹${rec.comboDiscount} बचत`}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                    {isEn ? rec.reason : rec.reasonHi}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-xs">
                      <IndianRupee size={10} className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {rec.price}
                      </span>
                      {rec.comboPrice && (
                        <span className="text-[11px] text-gray-400 line-through ml-1">
                          ₹{rec.price}
                        </span>
                      )}
                    </div>
                    {rec.comboPrice && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          {isEn ? 'Combo' : 'कॉम्बो'} ₹{rec.comboPrice}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => onAddTest(rec)}
                    className="flex items-center gap-1 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={12} />
                    {isEn ? 'Add +' : 'जोड़ें +'}
                  </button>
                  {rec.comboPrice && (
                    <button
                      onClick={() => {
                        onAddTest({ ...rec, _combo: true, _comboPrice: rec.comboPrice, _comboDiscount: rec.comboDiscount });
                      }}
                      className="flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-700 transition-colors"
                    >
                      {isEn ? 'Add Both' : 'दोनों जोड़ें'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpsellRecommendations;
