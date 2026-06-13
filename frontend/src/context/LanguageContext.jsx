import React, { createContext, useState, useContext, useEffect } from 'react';

// Basic translations for the public site
const translations = {
  en: {
    welcome: "Accurate Diagnostics, Trusted by Thousands",
    welcomeSub: "Advanced pathology lab equipped with automated analyzers and expert pathologists for precise, timely results.",
    trackReports: "Track Your Reports",
    searchMobile: "Mobile Number",
    searchReportNo: "Report Number",
    searchPlaceholderMobile: "Enter 10-digit mobile number",
    searchPlaceholderReport: "Enter Report ID (e.g. RPT-1001)",
    searchBtn: "Track Now",
    bookHomeCollection: "Book Home Collection",
    tests: "Available Tests",
    healthPackages: "Health Packages",
    callUs: "Call Us Now",
    location: "Locate Us",
    workingHours: "Working Hours",
    whyChooseUs: "Why Choose Sana Pathology?",
    fastResults: "Fast & Accurate Results",
    expertPathologists: "Expert Pathologists",
    homeCollection: "Free Home Collection",
    affordablePrices: "Affordable Prices",
    aboutUsTitle: "About Our Lab",
    aboutUsText: "Sana Pathology Lab is a premier diagnostic center committed to providing high-quality testing with rapid turnaround times. We prioritize patient care and accuracy above all.",
  },
  hi: {
    welcome: "सटीक निदान, हजारों का भरोसा",
    welcomeSub: "सटीक, समय पर परिणाम के लिए स्वचालित विश्लेषक और विशेषज्ञ पैथोलॉजिस्ट से सुसज्जित उन्नत पैथोलॉजी लैब।",
    trackReports: "अपनी रिपोर्ट ट्रैक करें",
    searchMobile: "मोबाइल नंबर",
    searchReportNo: "रिपोर्ट नंबर",
    searchPlaceholderMobile: "10 अंकों का मोबाइल नंबर दर्ज करें",
    searchPlaceholderReport: "रिपोर्ट आईडी दर्ज करें (उदा. RPT-1001)",
    searchBtn: "अभी ट्रैक करें",
    bookHomeCollection: "होम कलेक्शन बुक करें",
    tests: "उपलब्ध टेस्ट",
    healthPackages: "स्वास्थ्य पैकेज",
    callUs: "हमें कॉल करें",
    location: "हमारा पता",
    workingHours: "काम करने का समय",
    whyChooseUs: "सना पैथोलॉजी क्यों चुनें?",
    fastResults: "तेज और सटीक परिणाम",
    expertPathologists: "विशेषज्ञ पैथोलॉजिस्ट",
    homeCollection: "मुफ्त होम कलेक्शन",
    affordablePrices: "किफायती मूल्य",
    aboutUsTitle: "हमारी लैब के बारे में",
    aboutUsText: "सना पैथोलॉजी लैब एक प्रमुख डायग्नोस्टिक सेंटर है जो तेजी से और उच्च गुणवत्ता वाले परीक्षण प्रदान करने के लिए प्रतिबद्ध है। हम सबसे ऊपर रोगी की देखभाल और सटीकता को प्राथमिकता देते हैं।",
  }
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sana_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('sana_lang', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
