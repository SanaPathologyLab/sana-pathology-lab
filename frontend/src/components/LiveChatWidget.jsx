import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, User, Phone, MapPin, Clock, CreditCard, Calendar, FlaskConical, Heart, Activity, Search } from 'lucide-react';
import AssistantAvatar from './AssistantAvatar';
import { useLanguage } from '../context/LanguageContext';
import { generateAI, searchTests } from '../utils/ai';
import { AI_KNOWLEDGE_BASE, CATALOGUE_MAP } from '../utils/aiKnowledge';

const GENERAL_RESPONSES = {
  greeting: {
    en: '👋 Haan ji! Sana Pathology mein aapka swagat hai! Main Sana AI hoon. Kaise madad kar sakta hoon aapki?\n\nMain ye sab bata sakta hoon:\n📋 Test prices & details\n📅 Book an appointment\n🔍 Track reports & appointments\n🏠 Free home collection\n🩺 Health & symptom advice',
    hi: '👋 हाँ जी! सना पैथोलॉजी में आपका स्वागत है! मैं सना AI हूँ। कैसे मदद कर सकता हूँ आपकी?\n\nमैं ये सब बता सकता हूँ:\n📋 टेस्ट की कीमतें और जानकारी\n📅 अपॉइंटमेंट बुक करना\n🔍 रिपोर्ट और अपॉइंटमेंट ट्रैक करना\n🏠 फ्री होम कलेक्शन\n🩺 स्वास्थ्य और लक्षण सलाह'
  },
  greetingMorning: {
    en: '🌅 Good Morning! Sana Pathology mein aapka swagat hai. Kaise madad kar sakta hoon?',
    hi: '🌅 सुप्रभात! सना पैथोलॉजी में आपका स्वागत है। कैसे मदद कर सकता हूँ?'
  },
  greetingAfternoon: {
    en: '☀️ Good Afternoon! Sana Pathology mein aapka swagat hai. Batayein kya chahiye?',
    hi: '☀️ नमस्ते! सना पैथोलॉजी में आपका स्वागत है। बताएं क्या चाहिए?'
  },
  greetingEvening: {
    en: '🌆 Good Evening! Sana Pathology mein aapka swagat hai. Aaj kaunsa test karwana hai?',
    hi: '🌆 शुभ संध्या! सना पैथोलॉजी में आपका स्वागत है। आज कौनसा टेस्ट करवाना है?'
  },
  howAreYou: {
    en: 'Main bilkul theek hoon, shukriya! Aap sunao, aaj kaunsa test karwana hai ya koi aur sawaal hai? 😊',
    hi: 'मैं बिल्कुल ठीक हूँ, शुक्रिया! आप सुनाओ, आज कौनसा टेस्ट करवाना है या कोई और सवाल है? 😊'
  },
  thanks: {
    en: 'Bahut shukriya! Sana Pathology mein aapka swagat hai hamesha. Koi aur sawaal ho toh zaroor poochhen. 🙏',
    hi: 'बहुत शुक्रिया! सना पैथोलॉजी में आपका स्वागत है हमेशा। कोई और सवाल हो तो ज़रूर पूछिए। 🙏'
  },
  bye: {
    en: 'Khuda hafiz! Apna khayal rakhein. Kisi bhi test ke liye Sana Pathology yaad rakhein. 😊',
    hi: 'खुदा हाफ़िज़! अपना ख्याल रखिए। किसी भी टेस्ट के लिए सना पैथोलॉजी याद रखिए। 😊'
  },
  whoAreYou: {
    en: '🤖 Main Sana AI hoon, Sana Pathology Diagnostic Center, Sambhal ka official smart assistant. Pathologist Dr. Sana (M.D.) ne mujhe banaya hai taaki aapko lab tests, bookings, reports, aur health advice mein help kar sakoon. Batao kya chahiye?',
    hi: '🤖 मैं सना AI हूँ, सना पैथोलॉजी डायग्नोस्टिक सेंटर, संभल का ऑफिशियल स्मार्ट असिस्टेंट। पैथोलॉजिस्ट डॉ. सना (M.D.) ने मुझे बनाया है ताकि आपको लैब टेस्ट, बुकिंग, रिपोर्ट्स, और हेल्थ एडवाइस में हेल्प कर सकूँ। बताओ क्या चाहिए?'
  },
  capabilities: {
    en: 'Main ye sab kar sakta hoon:\n\n📋 *Test Prices* — 50+ tests ki prices bata sakta hoon\n📅 *Book Test* — Appointment book karne mein help karta hoon\n🔍 *Track Reports* — Report aur appointment status check kar sakta hoon\n🩺 *Symptom Advice* — Symptoms se related tests suggest karta hoon\n🏠 *Home Collection* — Free home collection info de sakta hoon\n💰 *Payment* — Payment options bata sakta hoon\n\nBatao kya chahiye!',
    hi: 'मैं ये सब कर सकता हूँ:\n\n📋 *टेस्ट की कीमतें* — 50+ टेस्ट की कीमतें बता सकता हूँ\n📅 *टेस्ट बुक करें* — अपॉइंटमेंट बुक करने में मदद करता हूँ\n🔍 *रिपोर्ट ट्रैक करें* — रिपोर्ट और अपॉइंटमेंट स्टेटस चेक कर सकता हूँ\n🩺 *लक्षण सलाह* — लक्षणों से related टेस्ट सुझाता हूँ\n🏠 *होम कलेक्शन* — फ्री होम कलेक्शन की जानकारी दे सकता हूँ\n💰 *भुगतान* — पेमेंट ऑप्शन बता सकता हूँ\n\nबताओ क्या चाहिए!'
  },
  default: {
    en: 'Iske baare mein main 100% sure nahi hoon. Aap directly humse baat kar sakte hain:\n📱 WhatsApp: wa.me/916396786939\n📞 Call: +91 6396786939\n\nHamari team aapki poori madad karegi! 😊',
    hi: 'इसके बारे में मैं 100% sure नहीं हूँ। आप सीधे हमसे बात कर सकते हैं:\n📱 WhatsApp: wa.me/916396786939\n📞 Call: +91 6396786939\n\nहमारी टीम आपकी पूरी मदद करेगी! 😊'
  },
  complaint: {
    en: 'Yeh sunkar achha nahi laga. Main aapki madad kar sakta hoon. Kripya apni problem ke baare mein bataayein — main sahi test suggest karoonga ya aapko booking mein help karoonga.',
    hi: 'यह सुनकर अच्छा नहीं लगा। मैं आपकी मदद कर सकता हूँ। कृपया अपनी problem के बारे में बताइए — मैं सही test suggest करूँगा या आपको booking में help करूँगा।'
  },
  great: {
    en: 'Bahut achha! Koi aur sawaal ho toh zaroor poochhiye. Aapke liye kya kar sakta hoon? 😊',
    hi: 'बहुत अच्छा! कोई और सवाल हो तो ज़रूर पूछिए। आपके लिए क्या कर सकता हूँ? 😊'
  }
};

const FAQ_RESPONSES = {
  price: 'Yahan hamare popular tests ki prices hain:\n\n🩸 CBC – ₹200\n🍬 Blood Sugar (Fasting) – ₹80\n❤️ Lipid Profile – ₹650\n🦋 Thyroid (T3/T4/TSH) – ₹450\n🫀 Liver Function (LFT) – ₹500\n🫘 Kidney Function (KFT) – ₹500\n☀️ Vitamin D – ₹800\n📊 HbA1c – ₹400\n🧪 Urine Routine – ₹150\n🦟 Dengue NS1 – ₹600\n🧫 Widal Test – ₹50\n💊 Vitamin B12 – ₹700\n\n💼 Popular Packages bhi available hain — koi specific test ya package chahiye?',
  priceHi: 'यहाँ हमारे popular tests की prices हैं:\n\n🩸 CBC – ₹200\n🍬 Blood Sugar (Fasting) – ₹80\n❤️ Lipid Profile – ₹650\n🦋 Thyroid (T3/T4/TSH) – ₹450\n🫀 Liver Function (LFT) – ₹500\n🫘 Kidney Function (KFT) – ₹500\n☀️ Vitamin D – ₹800\n📊 HbA1c – ₹400\n🧪 Urine Routine – ₹150\n🦟 Dengue NS1 – ₹600\n🧫 Widal Test – ₹50\n💊 Vitamin B12 – ₹700\n\n💼 Popular Packages bhi available hain — koi specific test ya package chahiye?',
  timing: '🕐 Timings:\nMon–Sat: 7:00 AM – 8:00 PM\nSunday: 8:00 AM – 1:00 PM\n\nReports: Routine tests ki report 6–12 ghante mein WhatsApp par mil jaati hai.',
  timingHi: '🕐 समय:\nसोम–शनि: सुबह 7:00 – रात 8:00\nरविवार: सुबह 8:00 – दोपहर 1:00\n\nरिपोर्ट: Routine tests की report 6–12 घंटे में WhatsApp पर मिल जाती है।',
  preparation: '🥤 Fasting requirement:\n• FBS (Blood Sugar Fasting) – 8–10 hrs\n• Lipid Profile – 10–12 hrs\n• Thyroid Profile – No fasting needed (morning sample preferred)\n• Full Body Packages – As per components\n\n✅ All other tests (CBC, LFT, KFT, Dengue, Widal, Urine, Vitamin D, HbA1c) – NO fasting needed.\nWater is allowed during fasting.',
  preparationHi: '🥤 उपवास की ज़रूरत:\n• FBS (Blood Sugar Fasting) – 8–10 घंटे\n• Lipid Profile – 10–12 घंटे\n• Thyroid Profile – उपवास ज़रूरी नहीं (सुबह का sample बेहतर)\n• Full Body Packages – कंपोनेंट्स के अनुसार\n\n✅ बाकी सब tests (CBC, LFT, KFT, Dengue, Widal, Urine, Vitamin D, HbA1c) – उपवास नहीं चाहिए।\nपानी पी सकते हैं।',
  home_collection: '🏠 *Free Home Collection — Bilkul FREE!*\n\n• Entire Sambhal district mein free home collection\n• Certified phlebotomist aapke ghar aayega\n• Sample barcoded — no mix-ups\n• Report WhatsApp par 6–12 hours mein\n\n⏰ Timings: 7 AM – 8 PM Mon–Sat, 8 AM – 1 PM Sunday\n\n⚡ Urgent collection extra ₹100 mein 1 hour mein available!',
  homeCollectionHi: '🏠 *फ्री होम कलेक्शन — बिल्कुल FREE!*\n\n• पूरे संभल जिले में फ्री होम कलेक्शन\n• Certified phlebotomist आपके घर आएगा\n• Sample barcoded — कोई mix-up नहीं\n• Report WhatsApp पर 6–12 घंटे में\n\n⏰ समय: सुबह 7 – रात 8 Mon–Sat, सुबह 8 – दोपहर 1 Sunday\n\n⚡ Urgent collection extra ₹100 में 1 घंटे में available!',
  payment: '💳 Payment Options:\n\n• Cash\n• UPI: GPay, PhonePe, Paytm\n• Credit / Debit Cards\n\n*Home Collection:* 50% advance at booking, balance at collection\n*Lab Visit:* Full payment at counter',
  paymentHi: '💳 भुगतान के तरीके:\n\n• नकद\n• UPI: GPay, PhonePe, Paytm\n• क्रेडिट / डेबिट कार्ड\n\n*होम कलेक्शन:* बुकिंग पर 50% एडवांस, बाकी collection के समय\n*लैब विज़िट:* काउंटर पर पूरा भुगतान',
  address: '📍 Sana Pathology Diagnostic Center\nDatawali Road, Near Aara Machine, Hayat Nagar\nDistt. Sambhal-244303 (Uttar Pradesh)\n\n📞 +91 6396786939 | +91 6397240575\n📧 support@sanapathology.com\n🌐 sanapathologylab.github.io\n\nGoogle Maps par "Sana Pathology Sambhal" search karein',
  addressHi: '📍 सना पैथोलॉजी डायग्नोस्टिक सेंटर\nडाटावाली रोड, आरा मशीन के पास, हयात नगर\nजिला संभल-244303 (उत्तर प्रदेश)\n\n📞 +91 6396786939 | +91 6397240575\n📧 support@sanapathology.com\n🌐 sanapathologylab.github.io\n\nगूगल मैप्स पर "Sana Pathology Sambhal" search करें',
  about: '🏥 *Sana Pathology Diagnostic Center* — NABL Accredited & ISO 9001:2015 Certified\n\n• Chief Pathologist: Dr. Sana (M.D., Hematology & Cytopathology, 15+ years exp.)\n• 15,000+ patients served\n• 500+ tests available\n• Free home collection across Sambhal district\n• Reports in 6–12 hours on WhatsApp\n• All reports digitally signed with QR code verification\n\n📍 Datawali Road, Near Aara Machine, Hayat Nagar, Sambhal-244303',
  aboutHi: '🏥 *सना पैथोलॉजी डायग्नोस्टिक सेंटर* — NABL मान्यता प्राप्त & ISO 9001:2015 प्रमाणित\n\n• मुख्य पैथोलॉजिस्ट: डॉ. सना (M.D., Hematology & Cytopathology, 15+ वर्ष अनुभव)\n• 15,000+ मरीज सेवा ले चुके\n• 500+ टेस्ट उपलब्ध\n• पूरे संभल जिले में फ्री होम कलेक्शन\n• 6–12 घंटे में WhatsApp पर रिपोर्ट\n• सभी रिपोर्ट digitally signed with QR code verification\n\n📍 डाटावाली रोड, आरा मशीन के पास, हयात नगर, संभल-244303',
  hl: '🚑 Health emergency? Kripya turant apne nearest hospital jayen. Sana Pathology ek diagnostic lab hai, emergency care facility nahi. Emergency ke liye 108 ya 102 par call karein.',
  hlHi: '🚑 स्वास्थ्य आपात स्थिति? कृपया तुरंत अपने निकटतम हॉस्पिटल जाएं। सना पैथोलॉजी एक diagnostic lab है, emergency care facility नहीं। आपात स्थिति के लिए 108 या 102 पर कॉल करें।',
};

const WELCOME_MESSAGE = {
  en: '👋 Haan ji! *Sana Pathology Diagnostic Center* mein aapka swagat hai! Main *Sana AI* hoon — aapka smart assistant.\n\nMain ye sab kar sakta hoon:\n📋 Test Prices batana\n📅 Appointment book karna\n🔍 Reports track karna\n🩺 Symptoms ke hisaab se test suggest karna\n🏠 Free home collection ki info dena\n\nBatao aaj main aapki kya help kar sakta hoon? 😊',
  hi: '👋 हाँ जी! *सना पैथोलॉजी डायग्नोस्टिक सेंटर* में आपका स्वागत है! मैं *सना AI* हूँ — आपका स्मार्ट असिस्टेंट।\n\nमैं ये सब कर सकता हूँ:\n📋 Test Prices बताना\n📅 Appointment book करना\n🔍 Reports track करना\n🩺 Symptoms के हिसाब से test suggest करना\n🏠 Free home collection की info देना\n\nबताओ आज मैं आपकी क्या help कर सकता हूँ? 😊',
};

const QUICK_ACTIONS = [
  { key: 'price', icon: FlaskConical, labelEn: 'Test Prices', labelHi: '📋 कीमतें' },
  { key: 'book', icon: Calendar, labelEn: 'Book Test', labelHi: '📅 बुक करें' },
  { key: 'track', icon: Search, labelEn: 'Track Report', labelHi: '🔍 रिपोर्ट ट्रैक' },
  { key: 'contact', icon: Phone, labelEn: 'Contact Lab', labelHi: '📞 संपर्क करें' },
  { key: 'health', icon: Heart, labelEn: 'Health Advice', labelHi: '🩺 स्वास्थ्य सलाह' },
];

const extractMobile = (str) => {
  const digits = str.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  const match = str.match(/\b(\d{10})\b/);
  return match ? match[1] : null;
};

const detectTestName = (lower) => {
  const testMap = {
    cbc: 'CBC (Complete Blood Count)',
    'complete blood': 'CBC (Complete Blood Count)',
    hba1c: 'HbA1c (Glycosylated Haemoglobin)',
    'blood sugar': 'Blood Sugar (FBS/RBS)',
    sugar: 'Blood Sugar (FBS/RBS)',
    fbs: 'Fasting Blood Sugar',
    thyroid: 'Thyroid Profile',
    'lipid profile': 'Lipid Profile',
    cholesterol: 'Lipid Profile',
    liver: 'Liver Function Test (LFT)',
    lft: 'Liver Function Test (LFT)',
    kidney: 'Kidney Function Test (KFT)',
    kft: 'Kidney Function Test (KFT)',
    dengue: 'Dengue Profile',
    malaria: 'Malaria Test',
    widal: 'Widal Test',
    typhoid: 'Typhoid Test (Typhidot)',
    urine: 'Urine Examination',
    'uric acid': 'Serum Uric Acid',
    vitamin: 'Vitamin D',
    calcium: 'Serum Calcium',
    hemoglobin: 'Hemoglobin (Hb)',
    platelet: 'Platelets Count',
    esr: 'ESR',
    crp: 'C-Reactive Protein (CRP)',
    rf: 'Rheumatoid Factor (RF)',
    rheumatoid: 'Rheumatoid Factor (RF)',
    semen: 'Semen Analysis',
    anc: 'ANC Profile',
    'blood group': 'Blood Group',
    'full body': 'Full Body Checkup Package',
    mantoux: 'Mantoux Test (TB)',
    tb: 'Mantoux Test (TB)',
    tuberculosis: 'Mantoux Test (TB)',
  };
  for (const [key, name] of Object.entries(testMap)) {
    if (lower.includes(key)) return name;
  }
  return '';
};

const DAILY_TIPS = [
  '💧 Roz 8 gilaas paani pina kidney ko healthy rakhta hai.',
  '🩸 Saal mein ek baar CBC karwana zaroor chahiye.',
  '🍬 Khali pet blood sugar test sabse accurate hota hai.',
  '☀️ Dhoop mein 20 minute roz Vitamin D deficiency se bachata hai.',
  '🦋 Thyroid test har 6 mahine mein karwayein agar symptoms hain.',
  '❤️ Cholesterol check karwana 30 ke baad har saal zaroori hai.',
  '🤰 Pregnancy mein ANC profile zaroor karwayein pehle trimester mein.',
  '🦟 Monsoon mein dengue aur malaria test quickly karwayein agar bukhar ho.',
  '😴 Zyada thakan feel ho toh Vitamin B12 aur D zaroor check karwayein.',
  '🫀 Diabetes patients ko har 3 mahine HbA1c test karwana chahiye.',
];

const HEALTH_TIPS = {
  en: [
    '💧 Drink at least 8 glasses of water daily for proper kidney function and blood circulation.',
    '🥗 Include green leafy vegetables and fruits in your diet for essential vitamins and minerals.',
    '🏃 Walk for 30 minutes daily to maintain heart health and normal blood sugar.',
    '😴 Get 7-8 hours of sleep for proper hormone regulation and immune function.',
    '🧘 Practice stress management through meditation or deep breathing exercises.',
    '☀️ Get 15-20 minutes of morning sunlight for natural Vitamin D.',
    '🥛 Include calcium-rich foods (milk, curd, cheese) for strong bones and teeth.',
    '🚭 Avoid smoking and limit alcohol consumption for better overall health.',
    '🩸 Get regular health checkups annually even if you feel healthy.',
    '⚖️ Maintain a healthy weight to reduce risk of diabetes, heart disease, and joint problems.',
    '🍬 If diabetic: Regular exercise, portion control, avoid sugary drinks, monitor HbA1c every 3 months.',
    '🫀 For heart health: Low salt diet, reduce saturated fats, walk 30 min daily, manage stress.',
    '🦋 For thyroid: Take medication on empty stomach, avoid calcium/iron within 4 hours, regular TSH check.',
    '🦴 For bone health: Calcium-rich foods, Vitamin D from sunlight, weight-bearing exercises like walking.',
    '🫘 For kidney health: Limit salt, stay hydrated, avoid painkillers without doctor advice.',
  ],
  hi: [
    '💧 किडनी के सही कार्य और रक्त संचार के लिए रोजाना कम से कम 8 गिलास पानी पिएं।',
    '🥗 आवश्यक विटामिन और खनिजों के लिए अपने आहार में हरी पत्तेदार सब्जियां और फल शामिल करें।',
    '🏃 हृदय स्वास्थ्य और सामान्य रक्त शर्करा बनाए रखने के लिए रोजाना 30 मिनट टहलें।',
    '😴 हार्मोन नियमन और प्रतिरक्षा कार्य के लिए 7-8 घंटे की नींद लें।',
    '🧘 ध्यान या गहरी सांस लेने के व्यायाम के माध्यम से तनाव प्रबंधन का अभ्यास करें।',
    '☀️ प्राकृतिक विटामिन डी के लिए 15-20 मिनट सुबह की धूप लें।',
    '🥛 मजबूत हड्डियों और दांतों के लिए कैल्शियम युक्त खाद्य पदार्थ (दूध, दही, पनीर) शामिल करें।',
    '🚭 बेहतर समग्र स्वास्थ्य के लिए धूम्रपान से बचें और शराब का सेवन सीमित करें।',
    '🩸 स्वस्थ महसूस करने पर भी नियमित रूप से वार्षिक स्वास्थ्य जांच करवाएं।',
    '⚖️ मधुमेह, हृदय रोग और जोड़ों की समस्याओं के जोखिम को कम करने के लिए स्वस्थ वजन बनाए रखें।',
    '🍬 डायबिटीज में: नियमित व्यायाम, कम शक्कर, हर 3 महीने में HbA1c जाँच कराएं।',
    '🫀 दिल के लिए: कम नमक, कम तला-भुना, रोज 30 मिनट टहलना, तनाव से बचना।',
    '🦋 थायराइड में: खाली पेट दवा लें, 4 घंटे तक कैल्शियम/आयरन से परहेज।',
    '🦴 हड्डियों के लिए: कैल्शियम युक्त भोजन, धूप में विटामिन डी, टहलना।',
    '🫘 किडनी के लिए: कम नमक, पर्याप्त पानी, बिना डॉक्टर के दर्द की दवा न लें।',
  ],
};

const SYMPTOM_TEST_MAP = [
  {
    pattern: /\b(thakan|weakness|fatigue|low energy|kamjori|energee|energi|थकान|कमज़ोरी)\b/i,
    tests: ['CBC', 'HB-01', 'VITD', 'VITB12', 'TFT', 'FBS'],
    desc: 'Thakan / Weakness / Fatigue'
  },
  {
    pattern: /\b(fever|bukhar|bukh|temperature|taip|jwar|bhuKhar|बुखार|ताप|ज्वर)\b/i,
    tests: ['CBC', 'WIDAL1', 'TYPHIDOT-01', 'DENGUE-01', 'MP', 'CRP-QUANT-01'],
    desc: 'Bukhar (Fever) 3+ days'
  },
  {
    pattern: /\b(baar baar peshab|pyaas|thirst|frequent urination|bahut pyaas|peshab zyada|baar baar mutra|uria|jada peshab|अधिक प्यास|बार बार पेशाब)\b/i,
    tests: ['FBS', 'HBA1C', 'KFT', 'URINE'],
    desc: 'Diabetes symptoms (frequent urine / thirst)'
  },
  {
    pattern: /\b(sugar|diabetes|diabetic|shakar|shugar|meetha|शुगर|डायबिटीज|मीठा|मधुमेह)\b/i,
    tests: ['FBS', 'HBA1C', 'KFT', 'LIPID'],
    desc: 'Sugar / Diabetes'
  },
  {
    pattern: /\b(baal jharna|bal jhad|hair fall|hair loss|baal girna|gir rahe|बाल झड़ना|बाल गिरना)\b/i,
    tests: ['TFT', 'VITD', 'VITB12', 'HB-01', 'CALCIUM-01'],
    desc: 'Baal jharna (Hair fall)'
  },
  {
    pattern: /\b(joint pain|joint dard|jod dard|gathiya|gathiva|jodon mein dard|गठिया|जोड़ दर्द)\b/i,
    tests: ['URIC_ACID', 'RF', 'CRP-QUANT-01', 'ESR-01'],
    desc: 'Joint pain / Gathiya'
  },
  {
    pattern: /\b(aankh|aankhen|skin|peela|peeliya|pilia|jaundice|yellow|आँख|आँखें|पीला|पीलिया)\b/i,
    tests: ['LFT', 'BILIRUBIN-TOTAL-01', 'SGOT', 'SGPT', 'URINE'],
    desc: 'Jaundice (yellow eyes/skin)'
  },
  {
    pattern: /\b(chest pain|seena dard|dil dard|sine mein dard|heart pain|cardiac|सीने में दर्द|दिल दर्द|हार्ट)\b/i,
    tests: ['LIPID', 'FBS', 'HBA1C', 'CBC'],
    desc: 'Chest pain / Heart concern'
  },
  {
    pattern: /\b(pregnancy|pregnant|garbh|gravid|preshnancy|garbhavastha|प्रेगनेंसी|गर्भावस्था)\b/i,
    tests: ['ANC-01', 'BG', 'URINE', 'TFT'],
    desc: 'Pregnancy checkup'
  },
  {
    pattern: /\b(general checkup|annual checkup|full body checkup|health checkup|puri jaanch|janch karana|routine checkup|पूरी जाँच|स्वास्थ्य जाँच)\b/i,
    tests: ['PKG-01', 'PKG-02', 'PKG-03', 'PKG-04'],
    desc: 'General annual checkup'
  },
  {
    pattern: /\b(women|woman|mahila|stree|औरत|महिला)\b/i,
    tests: ['PKG-03', 'TFT', 'CBC', 'VITD', 'VITB12'],
    desc: "Women's health"
  },
  {
    pattern: /\b(senior|buzurg|old age|umr|बुज़ुर्ग|वृद्ध)\b/i,
    tests: ['PKG-04', 'CBC', 'FBS', 'HBA1C', 'LFT', 'KFT', 'LIPID', 'URINE'],
    desc: 'Senior citizen annual'
  },
  {
    pattern: /\b(dengue|deng|मलेरिया|डेंगू)\b/i,
    tests: ['DENGUE-01', 'CBC', '015'],
    desc: 'Dengue suspected'
  },
  {
    pattern: /\b(malaria|maleriya|मलेरिया)\b/i,
    tests: ['MP', 'MP-MICRO', 'CBC'],
    desc: 'Malaria suspected'
  },
  {
    pattern: /\b(weight gain|weightgain|mota|vajan badhna|badh raha|वज़न बढ़ना|मोटापा)\b/i,
    tests: ['TFT', 'FBS', 'LIPID'],
    desc: 'Weight gain / Thyroid concern'
  },
  {
    pattern: /\b(weight loss|weightloss|vajan kam|patla|vajan ghatna|घट रहा|वज़न कम)\b/i,
    tests: ['TFT', 'FBS', 'CBC'],
    desc: 'Weight loss'
  },
  {
    pattern: /\b(thyroid|gala|thyro|थायराइड|गला|गले)\b/i,
    tests: ['TFT'],
    desc: 'Thyroid issues'
  },
  {
    pattern: /\b(kidney|gurda|gurde|gurda fail|gurda kharab|गुर्दा|किडनी)\b/i,
    tests: ['KFT', 'CREAT-01', 'URINE', 'UREA-01'],
    desc: 'Kidney concern'
  },
  {
    pattern: /\b(liver|jaigar|kaleja|लिवर|लीवर|जिगर|कलेजा)\b/i,
    tests: ['LFT', 'SGOT', 'SGPT', 'BILIRUBIN-TOTAL-01'],
    desc: 'Liver concern'
  },
  {
    pattern: /\b(headache|sir dard|sir me dard|sardard|migraine|सिरदर्द|सिर दर्द|माइग्रेन)\b/i,
    tests: ['CBC', 'FBS'],
    desc: 'Headache / Sir dard'
  },
  {
    pattern: /\b(cough|khansi|khasi|khaansi|khas|khaas|खांसी|खाँसी)\b/i,
    tests: ['CBC', 'CRP-QUANT-01'],
    desc: 'Cough / Khansi'
  },
  {
    pattern: /\b(chills|cold|cold|colds|sardi|thand|lagsi|kampi|सर्दी|कंपकपी|ठंड)\b/i,
    tests: ['MP', 'CBC'],
    desc: 'Chills / Cold'
  },
  {
    pattern: /\b(vomit|vomiting|ultii|ulti|matli|mati|ulati|उल्टी|मतली)\b/i,
    tests: ['LFT', 'CBC'],
    desc: 'Vomiting / Nausea'
  },
  {
    pattern: /\b(diarrhoea|diarrhea|dast|pichis|pet kharab|पेचिश|दस्त|पेट खराब)\b/i,
    tests: ['CBC', 'TFT'],
    desc: 'Diarrhea / Dast'
  },
  {
    pattern: /\b(urine|burning urination|peshab|pissab|jalan peshab|pesab|मूत्र|पेशाब|जलन)\b/i,
    tests: ['URINE', 'CBC', 'KFT'],
    desc: 'Urinary issues'
  },
  {
    pattern: /\b(swelling|sujan|footan|suj gaya|सूजन|सूज गया)\b/i,
    tests: ['KFT', 'URINE', 'URIC_ACID'],
    desc: 'Swelling / Sujan'
  },
  {
    pattern: /\b(anemia|khoon ki kami|khun ki kami|lahe ki kami|lahe|खून की कमी|एनीमिया|लहू की कमी)\b/i,
    tests: ['CBC', 'HB-01', 'VITB12'],
    desc: 'Anemia / Khoon ki kami'
  },
  {
    pattern: /\b(skin|rash|itching|kharish|daag|dhabba|chaki|खुजली|दाग|त्वचा)\b/i,
    tests: ['CBC', 'LFT'],
    desc: 'Skin problems / rash'
  },
  {
    pattern: /\b(typhoid|typh|miyadi bukhar|टाइफाइड|मियादी बुखार)\b/i,
    tests: ['TYPHIDOT-01', 'WIDAL1', 'CBC'],
    desc: 'Typhoid suspected'
  },
  {
    pattern: /\b(bone pain|haddi dard|had dard|हड्डी दर्द|हड्डियों में दर्द)\b/i,
    tests: ['CALCIUM-01', 'VITD'],
    desc: 'Bone pain'
  },
  {
    pattern: /\b(muscle cramp|cramp|machli dard|aant ka dard|aant|मांसपेशियों में दर्द|ऐंठन)\b/i,
    tests: ['CALCIUM-01', 'KFT'],
    desc: 'Muscle cramps'
  },
  {
    pattern: /\b(palpit|heart beat|dhadkan|dil|dil ki dhadkan|घबराहट|दिल|धड़कन)\b/i,
    tests: ['TFT', 'CBC', 'FBS'],
    desc: 'Palpitations / Dhadkan'
  },
  {
    pattern: /\b(period|menstrual|masik|menses|mastru|mahawari|पीरियड|मासिक|महावारी)\b/i,
    tests: ['CBC', 'HB-01', 'TFT'],
    desc: 'Menstrual / Period issues'
  },
  {
    pattern: /\b(pcod|pcos|पीसीओडी|पीसीओएस)\b/i,
    tests: ['FBS', 'LIPID', 'TFT'],
    desc: 'PCOS/PCOD suspected'
  },
  {
    pattern: /\b(sleep|anidra|neend|neend nahi|नींद|अनिद्रा|नींद नहीं)\b/i,
    tests: ['TFT', 'FBS', 'CBC'],
    desc: 'Sleep problems'
  },
  {
    pattern: /\b(stress|anxiety|tension|chinta|ghabrahat|parishan|तनाव|चिंता|घबराहट|परेशान)\b/i,
    tests: ['TFT', 'FBS'],
    desc: 'Stress / Anxiety'
  },
  {
    pattern: /\b(tb|tuberculosis|tubercol|tapdil|tapar|tivi|टीबी|तपेदिक|तपदिल)\b/i,
    tests: ['MANTOUX-01', 'CBC', 'ESR-01'],
    desc: 'TB / Tuberculosis'
  },
  {
    pattern: /\b(back pain|kamar dard|kamar|पीठ दर्द|कमर दर्द|रीढ़)\b/i,
    tests: ['CBC', 'URINE', 'CRP-QUANT-01'],
    desc: 'Back pain'
  },
  {
    pattern: /\b(heart|liver|kidney|cancer|cardiac|हार्ट|लिवर|किडनी|कैंसर)\b/i,
    tests: [],
    desc: 'General organ concern — please consult doctor'
  },
];

const formatMessage = (text) => {
  if (!text) return '';
  let formatted = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
  return formatted;
};

function LiveChatWidget() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('sanaChatHistory');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(m => m && typeof m === 'object').map(m => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
      }));
    } catch { return []; }
  });
  const [inputValue, setInputValue] = useState('');
  const [hasUnread, setHasUnread] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatPanelRef = useRef(null);
  const tipShownRef = useRef(false);

  const [bookingData, setBookingData] = useState(null);
  const [statusCheckState, setStatusCheckState] = useState(null);
  const [symptomState, setSymptomState] = useState(null);

  const [sessionState, setSessionState] = useState({
    patientName: null,
    mobile: null,
    selectedTests: [],
    bookingDate: null,
    bookingTime: null,
    collectionMode: null,
    address: null,
    language: 'auto',
    symptomsDiscussed: []
  });
  const [familyBooking, setFamilyBooking] = useState(null);

  const isHindi = language === 'hi';

  const handleStatusCheck = useCallback(async (text) => {
    const lower = text.toLowerCase();
    const hasRefId = /\bSPL-APT-\d{6}\b/i.test(text);
    const hasReportNum = /\bRPT-\d{6}\b/i.test(text);
    const isStatusIntent = /\b(status|stetus|track|progress|haal sthiti|स्थिति|ट्रैक|स्टेटस|kahan hai|कहाँ है|check)\b/i.test(lower);
    const mobile = extractMobile(text);
    const isCancel = /\b(cancel|exit|stop|close|radd|रद्द|बंद|बाहर|nhi|nahi)\b/i.test(lower);

    const shouldHandle = hasRefId || hasReportNum || isStatusIntent || mobile || (statusCheckState === 'awaiting_input' && (isCancel || mobile));

    if (!shouldHandle) {
      if (statusCheckState === 'awaiting_input') {
        setStatusCheckState(null);
      }
      return false;
    }

    if (statusCheckState === 'awaiting_input' && isCancel && !hasReportNum && !hasRefId && !mobile) {
      setStatusCheckState(null);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: isHindi ? 'स्थिति जांच रद्द कर दी गई है। मैं आपकी और क्या मदद कर सकता हूँ?' : 'Status check cancelled. How else can I assist you today?',
        sender: 'bot',
        timestamp: new Date()
      }]);
      return true;
    }

    setIsTyping(true);
    try {
      let statusText = '';

      if (hasRefId) {
        const refMatch = text.match(/\bSPL-APT-\d{6}\b/i)[0].toUpperCase();
        const res = await fetch(`/api/public/appointment-status?refId=${encodeURIComponent(refMatch)}`);
        const data = res.ok ? await res.json() : null;
        const apt = data?.appointments?.[0];
        if (apt) {
          statusText = isHindi
            ? `📋 *अपॉइंटमेंट स्थिति*\n📌 सन्दर्भ ID: ${apt.refId}\n👤 मरीज: ${apt.patientName}\n📞 मोबाइल: ${apt.mobile}\n📅 तारीख: ${new Date(apt.date).toLocaleDateString()} ${apt.time}\n📍 स्थिति: ${apt.statusLabel}`
            : `📋 *Appointment Status*\n📌 Ref ID: ${apt.refId}\n👤 Patient: ${apt.patientName}\n📞 Mobile: ${apt.mobile}\n📅 Date: ${new Date(apt.date).toLocaleDateString()} ${apt.time}\n📍 Status: ${apt.statusLabel}`;
        } else {
          statusText = isHindi ? '❌ इस सन्दर्भ ID के साथ कोई अपॉइंटमेंट नहीं मिला।' : '❌ No appointment found with this reference ID.';
        }
        setStatusCheckState(null);
      } else if (hasReportNum) {
        const rptMatch = text.match(/\bRPT-\d{6}\b/i)[0].toUpperCase();
        const res = await fetch(`/api/public/report-status?reportNumber=${encodeURIComponent(rptMatch)}`);
        const data = res.ok ? await res.json() : null;
        const rpt = data?.reports?.[0];
        if (rpt) {
          statusText = isHindi
            ? `📄 *रिपोर्ट स्थिति*\n🔖 रिपोर्ट #: ${rpt.reportNumber}\n👤 मरीज: ${rpt.patientName}\n📅 तारीख: ${new Date(rpt.reportDate).toLocaleDateString()}\n📋 स्थिति: ${rpt.statusLabel}`
            : `📄 *Report Status*\n🔖 Report #: ${rpt.reportNumber}\n👤 Patient: ${rpt.patientName}\n📅 Date: ${new Date(rpt.reportDate).toLocaleDateString()}\n📋 Status: ${rpt.statusLabel}`;
        } else {
          statusText = isHindi ? '❌ इस रिपोर्ट नंबर के साथ कोई रिपोर्ट नहीं मिली।' : '❌ No report found with this report number.';
        }
        setStatusCheckState(null);
      } else {
        if (mobile) {
          const res = await fetch(`/api/public/appointment-status?mobile=${encodeURIComponent(mobile)}`);
          const data = res.ok ? await res.json() : null;
          if (data?.appointments?.length > 0) {
            const items = data.appointments.map((apt, i) =>
              `${i + 1}. 📌 ${apt.refId} | 📅 ${new Date(apt.date).toLocaleDateString()} ${apt.time} | ${apt.statusLabel}`
            ).join('\n');
            statusText = isHindi
              ? `📋 *${mobile} के लिए अपॉइंटमेंट*\n\n${data.appointments.length} अपॉइंटमेंट:\n${items}`
              : `📋 *Appointments for ${mobile}*\n\n${data.appointments.length} appointment(s):\n${items}`;
          } else {
            const res2 = await fetch(`/api/public/report-status?mobile=${encodeURIComponent(mobile)}`);
            const data2 = res2.ok ? await res2.json() : null;
            if (data2?.reports?.length > 0) {
              const items = data2.reports.map((r, i) =>
                `${i + 1}. 🔖 ${r.reportNumber} | 📅 ${new Date(r.reportDate).toLocaleDateString()} | ${r.statusLabel}`
              ).join('\n');
              statusText = isHindi
                ? `📄 *${mobile} के लिए रिपोर्ट*\n\n${data2.reports.length} रिपोर्ट:\n${items}`
                : `📄 *Reports for ${mobile}*\n\nFound ${data2.reports.length} report(s):\n${items}`;
            } else {
              statusText = isHindi
                ? '❌ इस मोबाइल नंबर के साथ कोई रिकॉर्ड नहीं मिला।\n💡 Tip: आप Reference ID (जैसे: SPL-APT-XXXXXX) से भी खोज सकते हैं।'
                : '❌ No records found with this mobile number.\n💡 Tip: You can also search by Reference ID (e.g., SPL-APT-XXXXXX).';
            }
          }
          setStatusCheckState(null);
        } else {
          statusText = isHindi
            ? `आपकी स्थिति जांचने में मैं मदद कर सकता हूँ। कृपया दें:\n1️⃣ सन्दर्भ ID (SPL-APT-XXXXXX)\n2️⃣ रिपोर्ट नंबर (RPT-XXXXXX)\n3️⃣ रजिस्टर्ड मोबाइल नंबर`
            : `I can check status for you. Please provide:\n1️⃣ Reference ID (SPL-APT-XXXXXX)\n2️⃣ Report Number (RPT-XXXXXX)\n3️⃣ Registered Mobile Number`;
          setStatusCheckState('awaiting_input');
        }
      }

      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: statusText,
        sender: 'bot',
        timestamp: new Date()
      }]);
      return true;
    } catch (err) {
      console.error('Status lookup error:', err);
      setIsTyping(false);
      return false;
    }
  }, [isHindi, statusCheckState, setStatusCheckState]);

  const startBookingFlow = useCallback((initialTest = '') => {
    setStatusCheckState(null);
    setSymptomState(null);
    setBookingData({
      step: initialTest ? 'name' : 'test',
      test: initialTest,
      name: '',
      mobile: '',
      gender: '',
      preferredDate: '',
      preferredTime: '',
      address: ''
    });

    const botMessage = initialTest
      ? (isHindi
          ? `Bilkul! Main "${initialTest}" book karne mein help karunga.\n\n📌 *Step 1:* Patient ka poora naam batayein?`
          : `Sure! I'll help you book "${initialTest}".\n\n📌 *Step 1:* Please tell me the patient's full name?`)
      : (isHindi
          ? `Bilkul! Main aapki booking karne mein help karunga.\n\n📌 *Step 1:* Kaun sa test ya package chahiye? (Jaise: CBC, Lipid Profile, Thyroid, Full Body Checkup)`
          : `Sure! I'll help you book an appointment.\n\n📌 *Step 1:* Which test or package do you need? (e.g., CBC, Lipid Profile, Thyroid, Full Body Checkup)`);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: botMessage,
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, [isHindi, setStatusCheckState]);

  const handleBookingStep = useCallback(async (text) => {
    if (!bookingData) return;

    // Check for interrupt queries (price, timing, address, etc.) during booking flow
    const lower = text.toLowerCase().trim();
    const isPriceQuery = /\b(price|cost|rate|keemat|kitna|₹|rs|kiimat|mulya|daam)\b/i.test(lower) && /\b(test|check|report|cbc|sugar|thyroid|liver|kidney|lipid|vitamin|hb|hba1c|esr|crp|dengue|malaria|typhoid|widal|urine)\b/i.test(lower);
    const isTimingQuery = /\b(timing|time|hour|open|samay|khula|kab|schedule|timeing)\b/i.test(lower);
    const isAddressQuery = /\b(address|location|map|pata|kahan hai|jagah|reach|directions)\b/i.test(lower);
    const isAboutQuery = /\b(about|accredit|certified|nabl|iso|history|profile|kya hai|ke baare mein)\b/i.test(lower);
    const isCancelRequest = /\b(cancel|radd|cancel karna|exit|stop|nahi chahiye|band)\b/i.test(lower) && bookingData.step !== 'confirm';

    if (isCancelRequest) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        text: isHindi
          ? 'बुकिंग रद्द कर दी गई है। आप और क्या जानना चाहेंगे?'
          : 'Booking cancelled. How else can I help you?',
        sender: 'bot',
        timestamp: new Date()
      }]);
      setBookingData(null);
      return;
    }

    if (isPriceQuery) {
      const matched = detectTestName(lower) || detectTestName(text);
      if (matched) {
        const testInfo = searchTests(text);
        if (testInfo.length > 0) {
          setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            text: isHindi
              ? `💰 *${testInfo[0].name}* की कीमत: ₹${testInfo[0].price}`
              : `💰 *${testInfo[0].name}* price: ₹${testInfo[0].price}`,
            sender: 'bot',
            timestamp: new Date()
          }]);
          // Don't advance booking step — let user continue booking if they want
          return;
        }
      }
    }

    if (isTimingQuery) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        text: isHindi ? FAQ_RESPONSES.timingHi : FAQ_RESPONSES.timing,
        sender: 'bot',
        timestamp: new Date()
      }]);
      return;
    }

    if (isAddressQuery) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        text: isHindi ? FAQ_RESPONSES.addressHi : FAQ_RESPONSES.address,
        sender: 'bot',
        timestamp: new Date()
      }]);
      return;
    }

    if (isAboutQuery) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        text: isHindi ? FAQ_RESPONSES.aboutHi : FAQ_RESPONSES.about,
        sender: 'bot',
        timestamp: new Date()
      }]);
      return;
    }

    const nextData = { ...bookingData };
    let botReply = '';
    let isFinished = false;

    switch (bookingData.step) {
      case 'test':
        nextData.test = text.trim();
        nextData.step = 'name';
        botReply = isHindi
          ? `📌 *Step 2:* Patient ka poora naam batayein? (Report is number par WhatsApp hogi)`
          : `📌 *Step 2:* Please tell me the patient's full name? (Report will be sent on this mobile)`;
        break;

      case 'name':
        nextData.name = text.trim();
        nextData.step = 'mobile';
        botReply = isHindi
          ? `📌 *Step 3:* Mobile number? (10 digit) — Report is number par WhatsApp hogi 📱`
          : `📌 *Step 3:* Mobile number? (10 digits) — Report will be sent here via WhatsApp 📱`;
        break;

      case 'mobile':
        const cleanMobile = text.replace(/\D/g, '');
        if (cleanMobile.length !== 10) {
          botReply = isHindi
            ? `❌ Invalid mobile number. Kripya 10 digits ka valid mobile number daalein:`
            : `❌ Invalid mobile number. Please enter a valid 10-digit mobile number:`;
          break;
        }
        nextData.mobile = cleanMobile;
        nextData.step = 'gender';
        botReply = isHindi
          ? `📌 *Step 4:* Patient ka gender?`
          : `📌 *Step 4:* Patient's gender?`;
        break;

      case 'gender':
        const g = text.toUpperCase().trim();
        let genderVal = '';
        if (g === 'MALE' || g === 'M' || g === 'पुरुष' || g === 'मेल') {
          genderVal = 'MALE';
        } else if (g === 'FEMALE' || g === 'F' || g === 'महिला' || g === 'फीमेल') {
          genderVal = 'FEMALE';
        } else if (g === 'OTHER' || g === 'O' || g === 'अन्य' || g === 'अदर') {
          genderVal = 'OTHER';
        } else {
          botReply = isHindi
            ? `Kripya ek valid gender choose karein (Male, Female, ya Other):`
            : `Please select a valid gender (Male, Female, or Other):`;
          break;
        }
        nextData.gender = genderVal;
        nextData.step = 'date';
        botReply = isHindi
          ? `📌 *Step 5:* Kab collection chahiye? Date aur preferred time batayein.\n(YYYY-MM-DD format ya "Today"/"Tomorrow")`
          : `📌 *Step 5:* When do you need collection? Tell me date and preferred time.\n(YYYY-MM-DD format or "Today"/"Tomorrow")`;
        break;

      case 'date':
        let dateStr = text.trim().toLowerCase();
        let parsedDate = null;
        if (dateStr === 'today' || dateStr === 'आज') {
          parsedDate = new Date();
        } else if (dateStr === 'tomorrow' || dateStr === 'कल') {
          parsedDate = new Date();
          parsedDate.setDate(parsedDate.getDate() + 1);
        } else {
          const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (match) {
            parsedDate = new Date(dateStr);
          }
        }

        if (!parsedDate || isNaN(parsedDate.getTime())) {
          botReply = isHindi
            ? `❌ Invalid date format. YYYY-MM-DD use karein (jaise: 2026-06-17) ya "Today"/"Tomorrow" choose karein:`
            : `❌ Invalid date format. Use YYYY-MM-DD (e.g., 2026-06-17) or choose "Today"/"Tomorrow":`;
          break;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const selectedStr = parsedDate.toISOString().split('T')[0];
        if (selectedStr < todayStr) {
          botReply = isHindi
            ? `❌ Yeh date guzar chuki hai. Aaj ya future ki date daalein:`
            : `❌ This date has passed. Please enter today or a future date:`;
          break;
        }

        nextData.preferredDate = selectedStr;
        nextData.step = 'time';
        botReply = isHindi
          ? `📌 *Step 6:* Preferred time batayein (jaise: 9:00 AM, 2:30 PM):`
          : `📌 *Step 6:* Please tell me preferred time (e.g., 9:00 AM, 2:30 PM):`;
        break;

      case 'time':
        nextData.preferredTime = text.trim();
        nextData.step = 'address';
        botReply = isHindi
          ? `📌 *Step 7:* Ghar se collection chahiye ya seedha lab aayenge?\n🏠 Ghar se -> Address daalein (gali, mohalla, landmark ke saath)\n🏫 Lab visit -> "Lab Visit" likhein`
          : `📌 *Step 7:* Home collection or lab visit?\n🏠 Home -> Enter your address (street, area, landmark)\n🏫 Lab visit -> Type "Lab Visit"`;
        break;

      case 'address':
        nextData.address = text.trim();
        nextData.step = 'confirm';
        const mode = /lab visit|lab|direct/i.test(text.trim()) ? (isHindi ? '🏫 Lab Visit' : '🏫 Lab Visit') : (isHindi ? '🏠 Home Collection' : '🏠 Home Collection');
        botReply = isHindi
          ? `✅ *Booking Details:*\n🧪 Test: ${nextData.test}\n👤 Naam: ${nextData.name}\n📞 Mobile: ${nextData.mobile}\n🚻 Gender: ${nextData.gender === 'MALE' ? 'पुरुष' : nextData.gender === 'FEMALE' ? 'महिला' : 'अन्य'}\n📅 Date/Time: ${nextData.preferredDate} ${nextData.preferredTime}\n📍 Mode: ${mode}\n${nextData.address && !/lab visit|lab|direct/i.test(text.trim()) ? `\🏠 Address: ${nextData.address}` : ''}\n\nHamari team aapko 30 minute pehle call karegi. Report 6–12 ghante mein WhatsApp par milegi. 📱\n\nKya yeh sab sahi hai? (Haan / Nahi)`
          : `✅ *Booking Summary:*\n🧪 Test: ${nextData.test}\n👤 Name: ${nextData.name}\n📞 Mobile: ${nextData.mobile}\n🚻 Gender: ${nextData.gender}\n📅 Date/Time: ${nextData.preferredDate} ${nextData.preferredTime}\n📍 Mode: ${mode}\n${nextData.address && !/lab visit|lab|direct/i.test(text.trim()) ? `🏠 Address: ${nextData.address}` : ''}\n\nOur team will call you 30 minutes before. Report will be on WhatsApp in 6–12 hours. 📱\n\nIs everything correct? (Yes / No)`;
        break;

      case 'confirm':
        const ans = text.toLowerCase().trim();
        const isYes = ans === 'yes' || ans === 'y' || ans === 'confirm' || ans === 'हाँ' || ans === 'ha' || ans === 'सही' || ans === 'haan' || ans === 'yes confirm';
        const isNo = ans === 'no' || ans === 'n' || ans === 'नहीं' || ans === 'nahi' || ans === 'no cancel' || ans === 'न';

        if (isYes) {
          setIsTyping(true);
          try {
            const response = await fetch('/api/public/book-appointment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: nextData.name,
                mobile: nextData.mobile,
                gender: nextData.gender,
                address: nextData.address,
                preferredDate: nextData.preferredDate,
                preferredTime: nextData.preferredTime,
                notes: `Booked via Sana AI Assistant. Test: ${nextData.test}`
              })
            });

            setIsTyping(false);
            if (response.ok) {
              const resData = await response.json();
              const apptId = resData.appointment?.id || '';
              const refId = apptId ? `SPL-APT-${apptId.toString().padStart(6, '0')}` : 'Requested';
              botReply = isHindi
                ? `✅ *🎉 Booking Confirmed!*\n📌 Reference ID: ${refId}\n\nHamari team aapko 30 minute pehle call karegi. Report 6–12 ghante mein WhatsApp par milegi. 📱\n\nYa direct WhatsApp par bhej dein: wa.me/916396786939\n\nDhanyavaad! Sana Pathology aapke saath hai. 🙏`
                : `✅ *🎉 Booking Confirmed!*\n📌 Reference ID: ${refId}\n\nOur team will call you 30 minutes before. Report will be on WhatsApp in 6–12 hours. 📱\n\nOr send directly on WhatsApp: wa.me/916396786939\n\nThank you! Sana Pathology is with you. 🙏`;
              isFinished = true;
              // After booking success, ask for feedback
              const feedbackMsg = isHindi
                ? 'Ek kaam aur — aapka experience kaisa raha? 1 se 5 star dijiye:\n⭐ 1 — Bahut bura\n⭐⭐ 2 — Theek nahi tha\n⭐⭐⭐ 3 — Average\n⭐⭐⭐⭐ 4 — Accha tha\n⭐⭐⭐⭐⭐ 5 — Excellent!'
                : 'One more thing — how was your experience? Rate 1 to 5 stars:\n⭐ 1 — Very poor\n⭐⭐ 2 — Not good\n⭐⭐⭐ 3 — Average\n⭐⭐⭐⭐ 4 — Good\n⭐⭐⭐⭐⭐ 5 — Excellent!';
              setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now().toString(), text: feedbackMsg, sender: 'bot', timestamp: new Date() }]);
              }, 1000);
              // After booking confirmation, show preparation checklist
              const prepTest = (nextData.test || '').toLowerCase();
              let prepMsg = '';
              if (prepTest.includes('lipid')) {
                prepMsg = '🥤 10-12 ghante ka fasting zaruri hai. Paani pi sakte hain. Subah 7-9 AM best time hai.';
              } else if (prepTest.includes('sugar') || prepTest.includes('fbs') || prepTest.includes('fasting')) {
                prepMsg = '🍽️ 8-10 ghante ka fasting. Dawai ke baare mein apne doctor se poochhen.';
              } else if (prepTest.includes('thyroid') || prepTest.includes('tft')) {
                prepMsg = '🌅 Koi fasting nahi, par subah ka sample prefer kiya jata hai.';
              } else if (prepTest.includes('cbc') || prepTest.includes('hemoglobin')) {
                prepMsg = '✅ Koi preparation nahi chahiye.';
              } else {
                prepMsg = '✅ Koi khaas preparation nahi chahiye. Normal routine follow karein.';
              }
              setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now().toString(), text: prepMsg, sender: 'bot', timestamp: new Date() }]);
              }, 1500);
            } else {
              const errData = await response.json();
              botReply = isHindi
                ? `❌ अपॉइंटमेंट बुक करने में विफलता: ${errData.message || 'कृपया बाद में प्रयास करें'}`
                : `❌ Failed to book: ${errData.message || 'Please try again later'}`;
              isFinished = true;
            }
          } catch (err) {
            setIsTyping(false);
            botReply = isHindi
              ? `❌ नेटवर्क त्रुटि। कृपया बाद में प्रयास करें या फ़ोन करें: +91 6396786939`
              : `❌ Network error. Please try again later or call: +91 6396786939`;
            isFinished = true;
          }
        } else if (isNo) {
          botReply = isHindi
            ? `कोई बात नहीं। बुकिंग रद्द कर दी गई है। आप कौन सा टेस्ट बुक करना चाहते हैं?`
            : `No problem. Booking cancelled. What test would you like to book?`;
          nextData.step = 'test';
          nextData.test = '';
          nextData.name = '';
          nextData.mobile = '';
          nextData.gender = '';
          nextData.preferredDate = '';
          nextData.preferredTime = '';
          nextData.address = '';
        } else {
          botReply = isHindi
            ? `कृपया *हाँ* या *नहीं* चुनें:`
            : `Please choose *Yes* or *No*:`;
        }
        break;

      default:
        isFinished = true;
        break;
    }

    if (isFinished) {
      setBookingData(null);
    } else {
      setBookingData(nextData);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: botReply,
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, [bookingData, isHindi]);

  const handleSelectOption = useCallback(async (optionText) => {
    const userMsg = {
      id: Date.now().toString(),
      text: optionText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    await handleBookingStep(optionText);
  }, [handleBookingStep]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const msgs = [
        {
          id: 'welcome',
          text: isHindi ? WELCOME_MESSAGE.hi : WELCOME_MESSAGE.en,
          sender: 'bot',
          timestamp: new Date(),
        },
      ];
      if (!tipShownRef.current) {
        tipShownRef.current = true;
        const dailyTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
        msgs.push({
          id: 'tip-' + Date.now().toString(),
          text: '💡 ' + dailyTip,
          sender: 'bot',
          timestamp: new Date(),
        });
      }
      setMessages(msgs);
      setHasUnread(false);
    }
  }, [isOpen, messages.length, isHindi]);

  useEffect(() => {
    try { localStorage.setItem('sanaChatHistory', JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => {
    if (isOpen && hasUnread) {
      setHasUnread(false);
    }
  }, [isOpen, hasUnread]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const getBotReply = useCallback(
    (userMessage) => {
      const lower = userMessage.toLowerCase().trim();

      // ——— GREETINGS ———
      if (/^(hi|hello|hey|hii|hlo|हेलो|हाय|नमस्ते|नमस्कार)$/i.test(lower) || /^(hi|hello|hey)(\s|$)/i.test(lower)) {
        return isHindi ? GENERAL_RESPONSES.greeting.hi : GENERAL_RESPONSES.greeting.en;
      }
      if (/\b(good morning|suprabhat|subh prabhat|gm)\b/i.test(lower)) {
        return isHindi ? GENERAL_RESPONSES.greetingMorning.hi : GENERAL_RESPONSES.greetingMorning.en;
      }
      if (/\b(good afternoon|namaste|namaskar)\b/i.test(lower)) {
        return isHindi ? GENERAL_RESPONSES.greetingAfternoon.hi : GENERAL_RESPONSES.greetingAfternoon.en;
      }
      if (/\b(good evening|shubh sandhya|subh sandhya)\b/i.test(lower)) {
        return isHindi ? GENERAL_RESPONSES.greetingEvening.hi : GENERAL_RESPONSES.greetingEvening.en;
      }

      // ——— HOW ARE YOU ———
      if (/\b(how are you|kaise ho|kaisa hai|kya haal|how do|how r u|how ru)\b/i.test(lower)) {
        return isHindi ? GENERAL_RESPONSES.howAreYou.hi : GENERAL_RESPONSES.howAreYou.en;
      }

      // ——— GRATITUDE ———
      if (/\b(thank|thanks|dhanyavad|dhanyavaad|shukriya|thankyou|thank u|thnks)\b/i.test(lower)) {
        return isHindi ? GENERAL_RESPONSES.thanks.hi : GENERAL_RESPONSES.thanks.en;
      }

      // ——— FAREWELL ———
      if (/\b(bye|goodbye|ok bye|byee|tata|alvida|phir milenge|see you|see ya)\b/i.test(lower)) {
        return isHindi ? GENERAL_RESPONSES.bye.hi : GENERAL_RESPONSES.bye.en;
      }

      // ——— WHO / WHAT ARE YOU ———
      if (/\b(who are you|what are you|aap kaun|tum kaun|kaun ho)\b/i.test(lower)) {
        return isHindi ? GENERAL_RESPONSES.whoAreYou.hi : GENERAL_RESPONSES.whoAreYou.en;
      }

      // ——— CAPABILITIES / WHAT CAN YOU DO ———
      if (/\b(what can you do|what do you do|aap kya kar|kya kar sakte|help me|features|capabilities|aap kya kr)\b/i.test(lower) && !lower.includes('test') && !lower.includes('book')) {
        return isHindi ? GENERAL_RESPONSES.capabilities.hi : GENERAL_RESPONSES.capabilities.en;
      }

      // ——— COMPLAINT SYMPATHY ———
      if (/\b(i am not well|i am sick|mujhe problem|mujhe takleef|i am feeling|bimari|bimaar)\b/i.test(lower) && !/\b(test|book|price|fever|cough|pain|sugar|thyroid)\b/i.test(lower)) {
        return isHindi ? GENERAL_RESPONSES.complaint.hi : GENERAL_RESPONSES.complaint.en;
      }

      // ——— POSITIVE FEEDBACK ———
      if (/\b(great|awesome|amazing|wonderful|fantastic|excellent|very good|bahut accha|bahut badhiya)\b/i.test(lower) && lower.length < 30) {
        return isHindi ? GENERAL_RESPONSES.great.hi : GENERAL_RESPONSES.great.en;
      }

      // ===== EXISTING FAQ CHECKS (unchanged) =====
      if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('keemat') || lower.includes('kitna') || lower.includes('₹') || lower.includes('rs') || lower.includes('kiimat')) {
        return isHindi ? FAQ_RESPONSES.priceHi : FAQ_RESPONSES.price;
      }
      if (lower.includes('timing') || lower.includes('time') || lower.includes('hour') || lower.includes('open') || lower.includes('samay') || lower.includes('khula') || lower.includes('kab') || lower.includes('schedule')) {
        return isHindi ? FAQ_RESPONSES.timingHi : FAQ_RESPONSES.timing;
      }
      if (lower.includes('preparation') || lower.includes('fast') || lower.includes('empty') || lower.includes('upwas') || lower.includes('tyari') || lower.includes('prepare') || lower.includes('taiyari') || lower.includes('roza')) {
        return isHindi ? FAQ_RESPONSES.preparationHi : FAQ_RESPONSES.preparation;
      }
      if (lower.includes('home') || lower.includes('collection') || lower.includes('doorstep') || lower.includes('ghar') || lower.includes('khat') || lower.includes('delivery') || lower.includes('pickup') || lower.includes('house') || lower.includes('ghar par') || lower.includes('sample')) {
        return isHindi ? FAQ_RESPONSES.homeCollectionHi : FAQ_RESPONSES.home_collection;
      }
      if (lower.includes('payment') || lower.includes('pay') || lower.includes('cash') || lower.includes('card') || lower.includes('upi') || lower.includes('bhugtan') || lower.includes('credit') || lower.includes('debit') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm') || lower.includes('fee') || lower.includes('charge')) {
        return isHindi ? FAQ_RESPONSES.paymentHi : FAQ_RESPONSES.payment;
      }
      if (lower.includes('address') || lower.includes('location') || lower.includes('map') || lower.includes('pata') || lower.includes('kahan hai') || lower.includes('jagah') || lower.includes('reach') || lower.includes('directions')) {
        return isHindi ? FAQ_RESPONSES.addressHi : FAQ_RESPONSES.address;
      }
      if (lower.includes('about') || lower.includes('accredit') || lower.includes('certified') || lower.includes('nabl') || lower.includes('iso') || lower.includes('history') || lower.includes('profile')) {
        return isHindi ? FAQ_RESPONSES.aboutHi : FAQ_RESPONSES.about;
      }
      if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('ambulance') || lower.includes('accident') || lower.includes('aapda') || lower.includes('aapatkal') || lower.includes('serious') || lower.includes('critical')) {
        return isHindi ? FAQ_RESPONSES.hlHi : FAQ_RESPONSES.hl;
      }

      return null;
    },
    [isHindi]
  );

  const explainValue = (testName, value, unit, normalRange, status, explanation) => {
    const icon = status === 'normal' ? '✅' : status === 'borderline' ? '⚠️' : '🔴';
    const statusText = status === 'normal' ? 'Normal' : status === 'borderline' ? 'Borderline' : status === 'high' ? 'High' : 'Low';
    return `${icon} *${testName}*: ${value} ${unit}\n📊 *Status*: ${statusText}\n📖 *Matlab*: ${explanation}`;
  };

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text) return;
    const userMsg = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    if (bookingData) {
      await handleBookingStep(text);
      return;
    }

    const lower = text.toLowerCase();

    const isHealthTip = /\b(tip|health|suggest|advice|recommend|salah|suggestion|tips|healthy)\b/i.test(lower) && !lower.includes('test') && !lower.includes('book');
    if (isHealthTip) {
      const tips = isHindi ? HEALTH_TIPS.hi : HEALTH_TIPS.en;
      const randomTips = tips.sort(() => 0.5 - Math.random()).slice(0, 3);
      const botMsg = {
        id: Date.now().toString(),
        text: isHindi
          ? `💡 *स्वास्थ्य सुझाव:*\n\n${randomTips.join('\n\n')}\n\n---\nऔर टिप्स के लिए पूछें या कोई प्रश्न पूछें!`
          : `💡 *Health Tips:*\n\n${randomTips.join('\n\n')}\n\n---\nAsk for more tips or ask me any question!`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    // Check for test information requests
    const testInfoKeywords = /\b(tell|about|info|information|kya hai|what is|explain|batao|detail)\b/i.test(lower);
    if (testInfoKeywords) {
      const testName = detectTestName(lower);
      if (testName) {
        const matchedTests = searchTests(lower);
        if (matchedTests.length > 0) {
          const test = matchedTests[0];
          const isFasting = test.code === 'FBS' || test.code === 'LIPID' || test.code === 'TFT' || test.code === 'PKG-01';
          const fastingNote = isFasting
            ? (isHindi ? '⚠️ 8-12 घंटे उपवास आवश्यक' : '⚠️ 8-12 hrs fasting required')
            : (isHindi ? '✅ उपवास की आवश्यकता नहीं' : '✅ No fasting required');
          const botMsg = {
            id: Date.now().toString(),
            text: isHindi
              ? `📋 *${test.name}*\n💰 कीमत: ₹${test.price}\n${fastingNote}\n\nबुक करने के लिए "Book ${test.name}" टाइप करें।`
              : `📋 *${test.name}*\n💰 Price: ₹${test.price}\n${fastingNote}\n\nTo book, type "Book ${test.name}"`,
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMsg]);
          return;
        }
      }
    }

    const isBookingRequest = lower.includes('book') || lower.includes('booking') || lower.includes('appointment') || lower.includes('apointment') || lower.includes('बुक') || lower.includes('बुकिंग') || lower.includes('अपॉइंटमेंट') || lower.includes('टेस्ट कराना') || lower.includes('test karana') || lower.includes('karana hai') || lower.includes('schedule') || lower.includes('reserve') || lower.includes('register');

    if (isBookingRequest) {
      const testName = detectTestName(lower);
      startBookingFlow(testName);
      return;
    }

    const statusHandled = await handleStatusCheck(text);
    if (statusHandled) return;

    const localReply = getBotReply(text);
    if (localReply) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const botMsg = {
          id: Date.now().toString(),
          text: localReply,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 600);
      return;
    }

    // ——— GENERAL CONVERSATION (handled locally, no API call needed) ———

    // Greetings
    if (/^(hi|hello|hey|hii|hlo|helo|हेलो|हाय|नमस्ते|नमस्कार|good morning|suprabhat|good afternoon|good evening|shubh sandhya|gm)$/i.test(lower) ||
        /^(hi|hello|hey)\s/i.test(lower)) {
      const now = new Date().getHours();
      let greeting;
      if (/good morning|suprabhat|gm/i.test(lower)) greeting = GENERAL_RESPONSES.greetingMorning;
      else if (/good afternoon|namaste/i.test(lower) && now < 17) greeting = GENERAL_RESPONSES.greetingAfternoon;
      else if (/good evening|shubh sandhya/i.test(lower) || now >= 17) greeting = GENERAL_RESPONSES.greetingEvening;
      else greeting = GENERAL_RESPONSES.greeting;
      const botMsg = { id: Date.now().toString(), text: isHindi ? greeting.hi : greeting.en, sender: 'bot', timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    // How are you
    if (/\b(how are you|kaise ho|kaisa hai|kya haal|how do|how r u|how ru)\b/i.test(lower)) {
      const msg = isHindi ? GENERAL_RESPONSES.howAreYou.hi : GENERAL_RESPONSES.howAreYou.en;
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // Thanks
    if (/\b(thank|thanks|dhanyavad|shukriya|thankyou|thank u|thnks)\b/i.test(lower)) {
      const msg = isHindi ? GENERAL_RESPONSES.thanks.hi : GENERAL_RESPONSES.thanks.en;
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // Bye / Farewell
    if (/\b(bye|goodbye|byee|tata|alvida|phir milenge|see you)\b/i.test(lower)) {
      const msg = isHindi ? GENERAL_RESPONSES.bye.hi : GENERAL_RESPONSES.bye.en;
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // Who are you
    if (/\b(who are you|what are you|aap kaun|tum kaun|kaun ho)\b/i.test(lower)) {
      const msg = isHindi ? GENERAL_RESPONSES.whoAreYou.hi : GENERAL_RESPONSES.whoAreYou.en;
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // What can you do
    if (/\b(kya kar sakte|what can you do|what do you do|help me|features)\b/i.test(lower) && !/\b(test|book|fever|cough|pain)\b/i.test(lower)) {
      const msg = isHindi ? GENERAL_RESPONSES.capabilities.hi : GENERAL_RESPONSES.capabilities.en;
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // User says unwell / feeling sick
    if (/\b(i am not|i am sick|mujhe problem|mujhe takleef|i am feeling|bimari|bimaar|i feel)\b/i.test(lower) && !/\b(test|book|price|fever|cough|pain|sugar|thyroid|symptom)\b/i.test(lower)) {
      const msg = isHindi ? GENERAL_RESPONSES.complaint.hi : GENERAL_RESPONSES.complaint.en;
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // Positive feedback
    if (/\b(great|awesome|amazing|wonderful|fantastic|excellent|very good|bahut accha)\b/i.test(lower) && lower.split(/\s+/).length <= 4) {
      const msg = isHindi ? GENERAL_RESPONSES.great.hi : GENERAL_RESPONSES.great.en;
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // ——— LOCAL SYMPTOM DETECTION (no API call) ———
    const matchedSymptom = SYMPTOM_TEST_MAP.find(s => s.pattern.test(lower));
    if (matchedSymptom && matchedSymptom.tests.length > 0) {
      const testDetails = matchedSymptom.tests.map(code => {
        const t = searchTests(code);
        return t.length > 0 ? `• ${t[0].name} — ₹${t[0].price}` : '';
      }).filter(Boolean).join('\n');
      const msg = isHindi
        ? `🔍 *आपके लक्षणों के आधार पर, ये टेस्ट उपयुक्त हो सकते हैं:*\n\n${testDetails}\n\n📅 बुक करने के लिए "Book [Test Name]" टाइप करें\n\n⚠️ Yeh general suggestion hai. Sahi diagnosis ke liye apne doctor se zaroor milein. 🙏`
        : `🔍 *Based on your symptoms, these tests may be suitable:*\n\n${testDetails}\n\n📅 To book, type "Book [Test Name]"\n\n⚠️ This is general guidance. Please consult your doctor for proper diagnosis. 🙏`;
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // ===== UPGRADE 1: Session State Memory =====
    const nameMatch = lower.match(/(?:mera naam|my name is|main|i am|i'm)\s+(\w+)/i) || lower.match(/mera naam\s+(\w+)\s+hai/i);
    if (nameMatch && !bookingData) {
      setSessionState(prev => ({ ...prev, patientName: nameMatch[1] }));
    }
    const mobileDigits = extractMobile(text);
    if (mobileDigits) {
      setSessionState(prev => ({ ...prev, mobile: mobileDigits }));
    }

    // ===== UPGRADE 12: Appointment Reschedule/Cancel =====
    if (/\b(cancel|radd|रद्द|cancel karna|cancel karwana)\b/i.test(lower) && !bookingData && /\b(booking|appointment|test|apointment|अपॉइंटमेंट)\b/i.test(lower)) {
      const msg = isHindi
        ? 'Cancel karne ke liye apna reference ID (SPL-APT-XXXXXX) ya registered mobile number batayein:'
        : 'To cancel, please provide your reference ID (SPL-APT-XXXXXX) or registered mobile number:';
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }
    if (/\b(reschedule|date change|time change|reshchedule|reshed|date badlo|समय बदलो|तारीख बदलो)\b/i.test(lower) && !/\b(cancel|radd|रद्द)\b/i.test(lower)) {
      const msg = isHindi
        ? 'Date/time change karne ke liye apna reference ID (SPL-APT-XXXXXX) ya registered mobile number batayein:'
        : 'To reschedule, please provide your reference ID (SPL-APT-XXXXXX) or registered mobile number:';
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // ===== UPGRADE 15: Multi-Patient Family Booking =====
    if (/\b(family|parivar|pariwar|ghar mein sab|family ke liye|pure parivar|परिवार|फैमिली|घर में सब)\b/i.test(lower) && /\b(test|book|checkup|janch|जाँच)\b/i.test(lower)) {
      const msg = isHindi
        ? '👨‍👩‍👧‍👦 *Family Booking*\n\nSirf aap ke liye hai ya family mein kisi aur ke liye bhi?\n\nBatao kitne members ke liye booking karni hai aur unke naam aur tests.'
        : '👨‍👩‍👧‍👦 *Family Booking*\n\nIs it only for you or for other family members too?\n\nTell me how many members and their names and required tests.';
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // ===== UPGRADE 3: Emergency / Urgent Handler =====
    if (/\b(urgent|emergency|abhi chahiye|jaldi|turant|immediately|immediate|jald|jldi|तुरंत|अभी चाहिए|जल्दी|आपात)\b/i.test(lower)) {
      const msg = isHindi
        ? `🚨 Urgent collection available hai!\n\nSirf ₹100 extra urgent charge ke saath:\n✅ 1 ghante ke andar phlebotomist aayega\n✅ Priority processing\n✅ Report 4-6 ghante mein\n\nAbhi WhatsApp karein: wa.me/916396786939\nYa call karein: +91 6396786939\n\nNaam aur address batao, abhi arrange karte hain!`
        : `🚨 Urgent collection available!\n\nJust ₹100 extra urgent charge:\n✅ Phlebotomist within 1 hour\n✅ Priority processing\n✅ Report in 4-6 hours\n\nWhatsApp now: wa.me/916396786939\nOr call: +91 6396786939\n\nTell me your name and address, I'll arrange immediately!`;
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // ===== UPGRADE 4: Festive Offer Announcer =====
    const currentMonth = new Date().getMonth() + 1;
    const isOfferQuery = /\b(offer|discount|sasta|deal|coupon|scheme|सस्ता|ऑफर|डिस्काउंट)\b/i.test(lower);
    if (isOfferQuery) {
      let offerMsg;
      if (currentMonth >= 1 && currentMonth <= 3) {
        offerMsg = isHindi ? '💐 New Year Health Resolution — Sana Fit Active Package sirf ₹599 (was ₹699)!' : '💐 New Year Health Resolution — Sana Fit Active Package only ₹599 (was ₹699)!';
      } else if (currentMonth >= 4 && currentMonth <= 5) {
        offerMsg = isHindi ? '☀️ Summer Health Camp — Free Vitamin D test with any package above ₹1000!' : '☀️ Summer Health Camp — Free Vitamin D test with any package above ₹1000!';
      } else if (currentMonth >= 6 && currentMonth <= 8) {
        offerMsg = isHindi ? '🌧️ Monsoon Special — Dengue + Typhoid + Malaria combo ₹399!' : '🌧️ Monsoon Special — Dengue + Typhoid + Malaria combo ₹399!';
      } else if (currentMonth >= 9 && currentMonth <= 10) {
        offerMsg = isHindi ? '🌙 Navratri Offer — Women Premium Package ₹1699 (was ₹1899)!' : '🌙 Navratri Offer — Women Premium Package ₹1699 (was ₹1899)!';
      } else if (currentMonth === 11) {
        offerMsg = isHindi ? '🕯️ Diwali Dhamaka — Full Body Checkup ₹899!' : '🕯️ Diwali Dhamaka — Full Body Checkup ₹899!';
      } else {
        offerMsg = isHindi ? '❄️ Year-End Health Check — Senior Package ₹1199 (was ₹1399)!' : '❄️ Year-End Health Check — Senior Package ₹1199 (was ₹1399)!';
      }
      const msg = isHindi ? `🎉 *Aaj ka Special Offer!*\n\n${offerMsg}\n\nAur bhi offers ke liye poochhen!` : `🎉 *Today's Special Offer!*\n\n${offerMsg}\n\nAsk for more offers!`;
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // ===== UPGRADE 5: Competitor Comparison Handler =====
    if (/\b(dr\.? lal|lal path|labs?|pathkind|srl|metropolis|thyrocare|डॉ\.? लाल|लाल पैथ)\b/i.test(lower) && /\b(compar|sasta|better|accha|best|difference|मुकाबला|सस्ता|बेहतर)\b/i.test(lower)) {
      const msg = isHindi
        ? `Bilkul! Yahan comparison hai:\n\n| Feature | Sana Pathology | Dr. Lal / SRL |\n|---|---|---|\n| CBC Price | ₹200 | ₹350-450 |\n| Home Collection | FREE | ₹100-200 charge |\n| Report Time | 6-12 hrs | 12-24 hrs |\n| Location | Sambhal (local) | Distant centers |\n| NABL Accredited | ✅ Yes | ✅ Yes |\n| Doctor Signed | ✅ M.D. Pathologist | ✅ Yes |\n| Personal Service | ✅ Direct contact | ❌ Call center |\n\nSana Pathology mein aapko local lab ka personal touch milta hai, national chain ki quality ke saath — aur price bhi kam! 😊`
        : `Sure! Here's a comparison:\n\n| Feature | Sana Pathology | Dr. Lal / SRL |\n|---|---|---|\n| CBC Price | ₹200 | ₹350-450 |\n| Home Collection | FREE | ₹100-200 charge |\n| Report Time | 6-12 hrs | 12-24 hrs |\n| Location | Sambhal (local) | Distant centers |\n| NABL Accredited | ✅ Yes | ✅ Yes |\n| Doctor Signed | ✅ M.D. Pathologist | ✅ Yes |\n| Personal Service | ✅ Direct contact | ❌ Call center |\n\nAt Sana Pathology you get local lab personal touch with national chain quality — at a lower price! 😊`;
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // ===== UPGRADE 6: Budget Filter =====
    const budgetMatch = lower.match(/\b(?:sirf|only|budget|just|around|under|within|keval|केवल|सिर्फ|बजट)\s*₹?\s*(\d+)\b/i);
    if (budgetMatch && (/\b(budget|test|karwa|batao|dikh|sasta|under|within)\b/i.test(lower) || budgetMatch)) {
      const budget = parseInt(budgetMatch[1]);
      const affordable = Object.values({
        CBC: { name: 'CBC', price: 200 },
        'FBS': { name: 'Blood Sugar (Fasting)', price: 80 },
        'TFT': { name: 'Thyroid Profile', price: 450 },
        'LIPID': { name: 'Lipid Profile', price: 650 },
        'LFT': { name: 'Liver Function Test', price: 500 },
        'KFT': { name: 'Kidney Function Test', price: 500 },
        'URIC_ACID': { name: 'Serum Uric Acid', price: 100 },
        'URINE': { name: 'Urine Routine', price: 150 },
        'HB-01': { name: 'Hemoglobin', price: 100 },
        'VITD': { name: 'Vitamin D', price: 800 },
        'VITB12': { name: 'Vitamin B12', price: 700 },
        '015': { name: 'Platelets Count', price: 100 },
        'BG': { name: 'Blood Group', price: 50 },
        'WIDAL1': { name: 'Widal Test', price: 50 },
        'ESR-01': { name: 'ESR', price: 150 },
        'CRP-QUANT-01': { name: 'CRP Quantitative', price: 350 },
        '016': { name: 'TLC', price: 50 },
        'HBA1C': { name: 'HbA1c', price: 400 },
        'CALCIUM-01': { name: 'Serum Calcium', price: 200 },
      }).filter(t => t.price <= budget).sort((a, b) => a.price - b.price);
      if (affordable.length > 0) {
        const list = affordable.map(t => `• ${t.name} — ₹${t.price}`).join('\n');
        const best = affordable[0];
        const msg = isHindi
          ? `✅ *₹${budget} budget mein yeh tests karwa sakte hain:*\n\n${list}\n\n💡 Sabse affordable: ${best.name} sirf ₹${best.price} mein!\n\nKis test mein interest hai?`
          : `✅ *Tests within ₹${budget} budget:*\n\n${list}\n\n💡 Most affordable: ${best.name} at just ₹${best.price}!\n\nWhich test interests you?`;
        setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
        return;
      }
    }

    // ===== UPGRADE 7: Pregnancy / Women's Health Mode =====
    if (/\b(pregnant|pregnancy|garbh|garbhavastha|baby|delivery|प्रेगनेंट|प्रेगनेंसी|गर्भावस्था|बेबी|डिलीवरी|एएनसी|anc)\b/i.test(lower) && !/\b(test|book|price|कीमत)\b/i.test(lower)) {
      const msg = isHindi
        ? `🤰 *Pregnancy mein sahi tests bahut zaroori hain!*\n\nHamara *ANC Profile ₹1200* mein include hai:\n\n✅ CBC (Blood Count)\n✅ Blood Group & Rh Factor\n✅ Blood Sugar\n✅ HIV Test\n✅ HBsAg (Hepatitis B)\n✅ VDRL (Syphilis)\n✅ Urine Routine\n✅ Thyroid (TSH)\n\nYeh sab ek hi baar mein ho jayenge, ghar se FREE collection ke saath. Konsa trimester chal raha hai aapka?`
        : `🤰 *Proper tests during pregnancy are very important!*\n\nOur *ANC Profile ₹1200* includes:\n\n✅ CBC (Blood Count)\n✅ Blood Group & Rh Factor\n✅ Blood Sugar\n✅ HIV Test\n✅ HBsAg (Hepatitis B)\n✅ VDRL (Syphilis)\n✅ Urine Routine\n✅ Thyroid (TSH)\n\nAll done in one visit with FREE home collection. Which trimester are you in?`;
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // ===== UPGRADE 8: Diabetes Management Assistant =====
    if (/\b(diabetes|diabetic|sugar|shugar|shakar|insulin|metformin|मधुमेह|डायबिटीज|शुगर|इंसुलिन)\b/i.test(lower) && !/\b(book|price|कीमत|बुक)\b/i.test(lower)) {
      const msg = isHindi
        ? `🍬 *Diabetes monitoring ke liye Sana Pathology mein yeh tests available hain:*\n\n📊 HbA1c (3-monthly) — ₹400\n🍬 Fasting Blood Sugar — ₹80\n🍬 Post-Meal Sugar (PP) — ₹80\n🫘 Kidney Function (KFT) — ₹500\n👁️ Urine Routine — ₹150 (protein check)\n❤️ Lipid Profile — ₹650 (heart risk)\n\n🎯 Diabetes Combo (HbA1c + FBS + KFT + Lipid) — ₹1500 approx. Ek saath book karein aur ₹200 bachayein!\n\nKya aap book karna chahenge?`
        : `🍬 *Tests available for diabetes monitoring at Sana Pathology:*\n\n📊 HbA1c (3-monthly) — ₹400\n🍬 Fasting Blood Sugar — ₹80\n🍬 Post-Meal Sugar (PP) — ₹80\n🫘 Kidney Function (KFT) — ₹500\n👁️ Urine Routine — ₹150 (protein check)\n❤️ Lipid Profile — ₹650 (heart risk)\n\n🎯 Diabetes Combo (HbA1c + FBS + KFT + Lipid) — ₹1500 approx. Book together and save ₹200!\n\nWould you like to book?`;
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // ===== UPGRADE 9: Senior Citizen Special =====
    if (/\b(buzurg|dadaji|nanaji|naniji|dadima|dadi|nana|nani|old age|senior|budhape|60|बुज़ुर्ग|बुढ़ापा|सीनियर|दादा|दादी|नाना|नानी)\b/i.test(lower) && !/\b(test|book|price)\b/i.test(lower)) {
      const msg = isHindi
        ? `👴👵 *Senior Citizens ke liye hamara special package!*\n\n🏆 *Sana Senior Citizen Package — sirf ₹1399*\n✅ CBC + Sugar + HbA1c + LFT + KFT + Lipid Profile + Urine Routine\n\n*Extra benefits for seniors:*\n🏠 Priority home collection — ghar se hi hoga\n📞 Dedicated helpline: +91 6396786939\n📱 Report ghar tak WhatsApp par\n👨‍⚕️ Dr. Sana personally signs all reports\n\nKya aap unke liye booking karwana chahenge?`
        : `👴👵 *Special package for Senior Citizens!*\n\n🏆 *Sana Senior Citizen Package — only ₹1399*\n✅ CBC + Sugar + HbA1c + LFT + KFT + Lipid Profile + Urine Routine\n\n*Extra benefits for seniors:*\n🏠 Priority home collection\n📞 Dedicated helpline: +91 6396786939\n📱 Report on WhatsApp\n👨‍⚕️ Dr. Sana personally signs all reports\n\nWould you like to book for them?`;
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // ===== UPGRADE 10: Doctor Referral Mode =====
    if (/\b(main doctor|i am a doctor|doctor hoon|doctor portal|referring doctor|डॉक्टर हूँ|डॉक्टर पोर्टल)\b/i.test(lower)) {
      const msg = isHindi
        ? `🩺 *Doctor Portal mein aapka swagat hai!*\n\nSana Pathology mein referring doctors ke liye:\n✅ Priority report delivery\n✅ Digital reports directly on WhatsApp\n✅ Monthly referral summary\n✅ Dedicated contact line\n✅ Commission structure available\n\nDoctor portal access ke liye:\n📞 Call: +91 6396786939\n📧 Email: support@sanapathology.com\n\nAapka naam aur clinic/hospital batayein, hamara coordinator aapse contact karega.`
        : `🩺 *Welcome to Doctor Portal!*\n\nFor referring doctors at Sana Pathology:\n✅ Priority report delivery\n✅ Digital reports directly on WhatsApp\n✅ Monthly referral summary\n✅ Dedicated contact line\n✅ Commission structure available\n\nFor doctor portal access:\n📞 Call: +91 6396786939\n📧 Email: support@sanapathology.com\n\nTell us your name and clinic/hospital, our coordinator will contact you.`;
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // ===== UPGRADE 11: Feedback Collector =====
    const starRating = lower.match(/^(\d)\s*star/i);
    if (starRating || /\b(1 star|2 star|3 star|4 star|5 star|⭐|bahut bura|excellent)\b/i.test(lower)) {
      let rating = 0;
      if (starRating) rating = parseInt(starRating[1]);
      else if (/\b(5 star|excellent)\b/i.test(lower)) rating = 5;
      else if (/\b(4 star|bahut accha)\b/i.test(lower)) rating = 4;
      else if (/\b(3 star|average|theek)\b/i.test(lower)) rating = 3;
      else if (/\b(2 star|theek nahi)\b/i.test(lower)) rating = 2;
      else if (/\b(1 star|bahut bura)\b/i.test(lower)) rating = 1;
      if (rating >= 4) {
        const msg = isHindi ? 'Shukriya! 🙏 Ek Google review de dijiye, bahut helpful hoga. [Link]' : 'Thank you! 🙏 Please give us a Google review, it helps a lot. [Link]';
        setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      } else if (rating >= 1) {
        const msg = isHindi ? 'Maafi chahte hain. Hamara manager aapse baat karega — mobile number confirm karein please.' : 'We apologize. Our manager will speak with you — please confirm your mobile number.';
        setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      }
      return;
    }

    // ===== UPGRADE 14: Report Explanation Mode =====
    const reportMatch = lower.match(/\b(meri report|report samjhao|values|result|samajh|explain|report explain|my report|my results|values batao)\b/i);
    if (reportMatch && /\b(\d+[\.\d]*)\b.*\b(mg\/dl|ng\/ml|mcg\/dl|g\/dl|mIU\/L|cells\/mcL|pg\/mL|\[\/mcL)\b/i.test(lower)) {
      const msg = isHindi
        ? '📊 *Report Explanation Mode*\n\nKripya apne test values is format mein bataayein:\n"Hemoglobin 14 g/dL"\n"TSH 2.5 mIU/L"\nYa "mera sugar 110 hai"\n\nMain normal range se compare karke samjha doonga.\n\n⚠️ Yeh sirf educational information hai. Doctor se zaroor milein.'
        : '📊 *Report Explanation Mode*\n\nPlease share your test values in this format:\n"Hemoglobin 14 g/dL"\n"TSH 2.5 mIU/L"\nOr "my sugar is 110"\n\nI will compare with normal ranges and explain.\n\n⚠️ This is only educational information. Please consult your doctor.';
      setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    // Unrecognised → try AI API
    setIsTyping(true);
    try {
      const langPrompt = isHindi ? "Hindi (हिंदी)" : "English";
      const prompt = `You are Sana AI, a helpful, professional laboratory assistant for Sana Pathology Lab.

IMPORTANT RULES:
1. Answer concisely and accurately in ${langPrompt}.
2. If the user describes symptoms, recommend relevant tests with [Code: TEST_CODE] format and prices.
3. Be bilingual - respond in the same language the user used.
4. Always be friendly, professional, and helpful.
5. If unsure, direct to WhatsApp or phone.

KNOWLEDGE BASE:
${AI_KNOWLEDGE_BASE}

User Query: ${text}`;
      const aiResponse = await generateAI(prompt);
      setIsTyping(false);
      const botMsg = {
        id: Date.now().toString(),
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setIsTyping(false);
      const defaultMsg = isHindi ? GENERAL_RESPONSES.default.hi : GENERAL_RESPONSES.default.en;
      const botMsg = {
        id: Date.now().toString(),
        text: defaultMsg,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }
  }, [inputValue, getBotReply, isHindi, bookingData, handleBookingStep, startBookingFlow, handleStatusCheck, generateAI]);


  const actionReplies = {
    price: {
      en: 'Yahan hamare popular tests ki prices hain:\n\n🩸 CBC – ₹200\n🍬 Blood Sugar (Fasting) – ₹80\n❤️ Lipid Profile – ₹650\n🦋 Thyroid (T3/T4/TSH) – ₹450\n🫀 Liver Function (LFT) – ₹500\n🫘 Kidney Function (KFT) – ₹500\n☀️ Vitamin D – ₹800\n📊 HbA1c – ₹400\n🧪 Urine Routine – ₹150\n🦟 Dengue NS1 – ₹600\n🧫 Widal Test – ₹50\n💊 Vitamin B12 – ₹700\n\n💼 Popular Packages bhi available hain — koi specific test ya package chahiye?',
      hi: 'यहाँ हमारे popular tests की prices हैं:\n\n🩸 CBC – ₹200\n🍬 Blood Sugar (Fasting) – ₹80\n❤️ Lipid Profile – ₹650\n🦋 Thyroid (T3/T4/TSH) – ₹450\n🫀 Liver Function (LFT) – ₹500\n🫘 Kidney Function (KFT) – ₹500\n☀️ Vitamin D – ₹800\n📊 HbA1c – ₹400\n🧪 Urine Routine – ₹150\n🦟 Dengue NS1 – ₹600\n🧫 Widal Test – ₹50\n💊 Vitamin B12 – ₹700\n\n💼 Popular Packages bhi available hain — koi specific test ya package chahiye?'
    },
    track: {
      en: 'Apni report track karne ke 3 tarike hain:\n\n🌐 Website: sanapathologylab.github.io\n→ "Track Reports" section mein mobile number daalo\n\n📱 WhatsApp: wa.me/916396786939\n→ Apna Report Number bhejo\n\n📞 Call: +91 6396786939\n\nAapka report number ya registered mobile number kya hai?',
      hi: 'अपनी report track करने के 3 तरीके हैं:\n\n🌐 Website: sanapathologylab.github.io\n→ "Track Reports" section में mobile number डालो\n\n📱 WhatsApp: wa.me/916396786939\n→ अपना Report Number भेजो\n\n📞 Call: +91 6396786939\n\nआपका report number या registered mobile number क्या है?'
    },
    contact: {
      en: 'Hum se contact karein:\n\n📞 Call/WhatsApp: +91 6396786939\n📞 Alternate: +91 6397240575\n📧 Email: support@sanapathology.com\n📍 Address: Datawali Road, Near Aara Machine, Hayat Nagar, Sambhal-244303\n\n🕐 Timings:\nMon–Sat: 7:00 AM – 8:00 PM\nSunday: 8:00 AM – 1:00 PM\n\nAbhi WhatsApp par baat karein 👉 wa.me/916396786939',
      hi: 'हमसे contact करें:\n\n📞 Call/WhatsApp: +91 6396786939\n📞 Alternate: +91 6397240575\n📧 Email: support@sanapathology.com\n📍 Address: Datawali Road, Near Aara Machine, Hayat Nagar, Sambhal-244303\n\n🕐 Timings:\nMon–Sat: 7:00 AM – 8:00 PM\nSunday: 8:00 AM – 1:00 PM\n\nअभी WhatsApp पर बात करें 👉 wa.me/916396786939'
    },
    health: {
      en: 'Main aapko symptom ke hisaab se sahi test suggest kar sakta hoon.\n\nBatayein aapko kya problem ho rahi hai? Jaise:\n😴 Thakan / weakness\n🌡️ Bukhar (fever)\n💧 Baar baar peshab aana\n🦱 Baal jharna\n🦴 Joint pain\n💛 Aankhon ya skin ka peela hona\n❤️ Chest pain\n🤰 Pregnancy checkup\n📋 General health checkup\n\nAapki problem batayein, main sahi test suggest karoonga.',
      hi: 'मैं आपको symptom के हिसाब से सही test suggest कर सकता हूँ।\n\nबताइए आपको क्या problem हो रही है? जैसे:\n😴 थकान / weakness\n🌡️ बुखार (fever)\n💧 बार बार पेशाब आना\n🦱 बाल झड़ना\n🦴 Joint pain\n💛 आँखों या skin का पीला होना\n❤️ Chest pain\n🤰 Pregnancy checkup\n📋 General health checkup\n\nआपकी problem बताइए, main सही test suggest करूंगा।'
    }
  };

  const handleQuickAction = useCallback(
    async (key) => {
      if (key === 'book') {
        const userMsg = { id: Date.now().toString(), text: isHindi ? '📅 टेस्ट बुक करें' : '📅 Book Test', sender: 'user', timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        const reply = isHindi
          ? 'Bilkul! Booking ke liye yeh details chahiye:\n\n1️⃣ Patient ka naam\n2️⃣ Mobile number\n3️⃣ Kaun sa test chahiye?\n4️⃣ Date aur time (preferred)\n5️⃣ Ghar se collection chahiye ya lab visit?\n\nGhar se collection bilkul FREE hai! 🏠\nBataiye, main aapki booking confirm karta hoon.'
          : 'Bilkul! Booking ke liye yeh details chahiye:\n\n1️⃣ Patient ka naam\n2️⃣ Mobile number\n3️⃣ Kaun sa test chahiye?\n4️⃣ Date aur time (preferred)\n5️⃣ Ghar se collection chahiye ya lab visit?\n\nGhar se collection bilkul FREE hai! 🏠\nBataiye, main aapki booking confirm karta hoon.';
        setMessages((prev) => [...prev, { id: Date.now().toString(), text: reply, sender: 'bot', timestamp: new Date() }]);
        return;
      }
      const actionReply = actionReplies[key];
      if (actionReply) {
        const label = { price: '📋 Test Prices', track: '🔍 Track Report', contact: '📞 Contact Lab', health: '🩺 Health Advice' };
        const userMsg = { id: Date.now().toString(), text: isHindi ? 'स्वास्थ्य सलाह' : label[key] || 'Action', sender: 'user', timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setTimeout(() => {
          setMessages((prev) => [...prev, { id: Date.now().toString(), text: isHindi ? actionReply.hi : actionReply.en, sender: 'bot', timestamp: new Date() }]);
        }, 400);
      }
    },
    [isHindi]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    if (!isOpen) {
      setHasUnread(false);
    }
    setIsOpen((prev) => !prev);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const shouldShowQuickActions = messages.length === 1 && !bookingData;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      {isOpen && (
        <div
          ref={chatPanelRef}
          className="chat-panel-3d mb-4 w-[360px] sm:w-[400px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '600px', height: 'calc(100vh - 180px)' }}
        >
          <div className="bg-gradient-to-r from-[#00488d] to-[#0066b3] text-white px-5 py-3 flex items-center justify-between flex-shrink-0 relative overflow-hidden shadow-lg shadow-[#00488d]/20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="p-1 rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 avatar-3d-float" style={{ transformStyle: 'preserve-3d' }}>
                  <AssistantAvatar size={44} isSpeaking={isTyping} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#00488d] animate-pulse"></div>
                <div className="absolute inset-0 rounded-full avatar-pulse-ring border border-white/20"></div>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">
                  {isHindi ? 'सना एआई सहायक' : 'Sana AI Assistant'}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-white/80 font-medium">
                    {isHindi ? 'ऑनलाइन' : 'Online'}
                  </span>
                  <span className="w-0.5 h-0.5 bg-white/40 rounded-full"></span>
                  <span className="text-[10px] text-white/60">
                    {isTyping
                      ? (isHindi ? 'टाइप कर रहा है...' : 'Typing...')
                      : (isHindi ? 'तुरंत उत्तर दें' : 'Instant replies')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  onClick={() => {
                    setMessages([]);
                    localStorage.removeItem('sanaChatHistory');
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white text-xs"
                  title={isHindi ? 'चैट साफ़ करें' : 'Clear chat'}
                >
                  🗑️
                </button>
              )}
              <button
                onClick={closeChat}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50/90 to-gray-50/70" style={{ scrollBehavior: 'smooth' }}>
            {messages.filter(Boolean).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                style={{ animationDuration: '0.3s' }}
              >
                <div
                  className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-[#00488d] to-[#005da8] text-white rounded-br-md shadow-md shadow-[#00488d]/20'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-md border border-gray-100/80'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.sender === 'bot' && (
                      <div className="flex-shrink-0 mt-0.5">
                        <AssistantAvatar size={20} />
                      </div>
                    )}
                    <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
                    {msg.sender === 'user' && (
                      <User className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/70" />
                    )}
                  </div>
                  <div
                    className={`text-[10px] mt-1 ${
                      msg.sender === 'user' ? 'text-white/60 text-right' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm bg-white text-gray-500 rounded-bl-md shadow-sm border border-gray-100 flex items-center gap-2">
                  <div className="flex-shrink-0"><AssistantAvatar size={18} /></div>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {bookingData && (
            <div className="px-4 py-3 bg-white border-t border-gray-100 flex flex-wrap gap-2 animate-fade-in flex-shrink-0">
              {bookingData.step === 'gender' && (
                <>
                  <button onClick={() => handleSelectOption('Male')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs font-bold transition-all">👨 {isHindi ? 'पुरुष' : 'Male'}</button>
                  <button onClick={() => handleSelectOption('Female')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-full text-xs font-bold transition-all">👩 {isHindi ? 'महिला' : 'Female'}</button>
                  <button onClick={() => handleSelectOption('Other')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-all">{isHindi ? 'अन्य' : 'Other'}</button>
                </>
              )}
              {bookingData.step === 'date' && (
                <>
                  <button onClick={() => handleSelectOption('Today')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00488d]/10 hover:bg-[#00488d]/20 text-[#00488d] rounded-full text-xs font-bold transition-all">📅 {isHindi ? 'आज' : 'Today'}</button>
                  <button onClick={() => handleSelectOption('Tomorrow')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00488d]/10 hover:bg-[#00488d]/20 text-[#00488d] rounded-full text-xs font-bold transition-all">📅 {isHindi ? 'कल' : 'Tomorrow'}</button>
                </>
              )}
              {bookingData.step === 'address' && (
                <button onClick={() => handleSelectOption('Lab Visit')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-full text-xs font-bold transition-all">🏫 {isHindi ? 'लैब विजिट' : 'Lab Visit'}</button>
              )}
              {bookingData.step === 'confirm' && (
                <>
                  <button onClick={() => handleSelectOption('Yes')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-green-500/20">✔️ {isHindi ? 'हाँ, पुष्टि करें' : 'Yes, Confirm'}</button>
                  <button onClick={() => handleSelectOption('No')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/20">❌ {isHindi ? 'नहीं, रद्द करें' : 'No, Cancel'}</button>
                </>
              )}
            </div>
          )}

          {shouldShowQuickActions && (
            <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
              <p className="text-[11px] text-gray-500 font-medium mb-2">
                {isHindi ? '➡️ त्वरित कार्रवाई' : '➡️ Quick Actions'}
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.key}
                      onClick={() => handleQuickAction(action.key)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {isHindi ? action.labelHi : action.labelEn}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                {isHindi ? 'या नीचे अपना प्रश्न लिखें' : 'Or type your question below'}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isHindi ? 'अपना संदेश यहाँ लिखें...' : 'Type your message here...'}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#00488d]/30 focus:bg-white transition-all placeholder:text-gray-400 pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-lg">💬</span>
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-2.5 bg-gradient-to-br from-[#00488d] to-[#0066b3] hover:from-[#003366] hover:to-[#005299] disabled:from-gray-300 disabled:to-gray-300 text-white rounded-full transition-all disabled:cursor-not-allowed flex-shrink-0 shadow-md shadow-[#00488d]/20 hover:shadow-lg hover:shadow-[#00488d]/30 active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={toggleChat}
        className="relative group text-white p-0 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center chat-toggle-glow"
        style={{ filter: 'drop-shadow(0 8px 32px rgba(0,72,141,0.35))' }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00488d] to-[#0066b3] rounded-full opacity-90 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
        {isOpen ? (
          <div className="relative z-10 p-3.5">
            <X className="w-6 h-6" />
          </div>
        ) : (
          <div className="relative z-10 p-1.5" style={{ transformStyle: 'preserve-3d' }}>
            <div className="transition-transform duration-500 group-hover:scale-110" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(0deg) translateZ(8px)' }}>
              <AssistantAvatar size={52} />
            </div>
          </div>
        )}
        {!isOpen && hasUnread && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse flex items-center justify-center text-[10px] font-bold">1</span>
        )}
      </button>
    </div>
  );
}

export default LiveChatWidget;
