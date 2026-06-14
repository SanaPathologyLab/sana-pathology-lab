import React, { createContext, useState, useContext, useEffect } from 'react';

// Basic translations for the public site
const translations = {
  en: {
    // Header & Navigation
    logoTitle: "Sana Pathology",
    logoSub: "Diagnostic Center",
    whyUs: "Why Us",
    packages: "Packages",
    testFinder: "Test Finder",
    bookOnline: "Book Online",
    faq: "FAQ",
    contact: "Contact",
    staffLogin: "Staff Login",

    // Hero Section
    welcome: "Accurate Diagnostics, Trusted by Thousands",
    welcomeSub: "Advanced pathology lab equipped with automated analyzers and expert pathologists for precise, timely results.",
    bookHomeCollection: "Book Home Collection",
    trackReports: "Track Your Reports",
    isoCertified: "ISO 9001:2015 Certified",
    pts15k: "15,000+ Patients",
    tat612: "6-12hr Turnaround",
    freeHomeCollection: "Free Home Collection",
    nablAccredited: "NABL Accredited",

    // Live Ticker & Health Tip
    livePrices: "Live Prices",
    healthTip: "Health Tip",
    
    // Stats Section
    byTheNumbers: "By the Numbers",
    trustedByThousands: "Trusted by Thousands",
    statsSub: "Real numbers that reflect our commitment to quality diagnostics",
    patientsServed: "Patients Served",
    testsAvailable: "Tests Available",
    yearsOfService: "Years of Service",
    reportsDelivered: "Reports Delivered",
    iso15189: "ISO 15189 Certified",
    tat612hr: "6-12 Hr TAT",
    compassionateCare: "Compassionate Care",
    digitalReports: "Digital Reports",

    // Search Section
    checkReportsBookings: "Check Reports & Track Bookings",
    searchDesc: "Enter your details to download report pdfs or track sample collection request status",
    mobileNo: "Mobile No",
    reportNo: "Report No",
    trackRequest: "Track Request",
    placeholderMobile: "Enter Mobile Number to check Reports...",
    placeholderReport: "e.g. RPT-000001",
    placeholderTrack: "Enter Mobile Number to track collection requests...",
    findReport: "Find Report",
    foundRequests: "Found {count} Collection Request(s)",
    pendingConfirmation: "Pending Confirmation",
    confirmedScheduled: "Confirmed / Scheduled",
    sampleCollected: "Sample Collected",
    cancelled: "Cancelled",
    contactLab: "Contact Lab",

    // Glance Section
    atAGlance: "Sana Pathology at a Glance",
    glanceSub: "Committed to clinical excellence, patient care, and accurate reporting standards.",
    glancePts: "Happy Patients Served",
    glanceTests: "Comprehensive Lab Tests",
    glanceDelivery: "Average Report Delivery",
    glanceAccurate: "Accurate & NABL Standard",

    // Process Section
    process: "Process",
    howItWorks: "How It Works",
    processSub: "Get tested in 5 simple, secure steps without leaving your home.",
    step1Title: "Select Tests",
    step1Desc: "Choose tests or wellness packages below.",
    step2Title: "Schedule Collection",
    step2Desc: "Provide date, time, and address.",
    step3Title: "Sample Collection",
    step3Desc: "Certified phlebotomist collects at your doorstep.",
    step4Title: "Lab Processing",
    step4Desc: "High-tech processing with barcoded safety.",
    step5Title: "Digital Reports",
    step5Desc: "Get reports on WhatsApp & download online.",

    // Health Tips
    healthTip0: "Drink 8 glasses of water daily to keep your kidneys healthy and toxins flushed out.",
    healthTip1: "Get a CBC test annually to monitor your blood count and catch anemia or infections early.",
    healthTip2: "Eating a balanced diet with fruits and vegetables can lower your cholesterol naturally.",
    healthTip3: "Just 30 minutes of walking a day reduces risk of heart disease by up to 35%.",
    healthTip4: "7-9 hours of quality sleep boosts immune function and reduces disease risk.",
    healthTip5: "Regular health checkups catch silent diseases like diabetes and hypertension early.",
    healthTip6: "Quitting smoking improves lung function within just 2 weeks of stopping.",
    healthTip7: "Managing stress through meditation or yoga can significantly lower blood pressure.",

    // Packages Section
    sanaCare: "Sana Care",
    popularPackages: "Popular Health Packages",
    packagesSub: "Complete medical profile checks at highly subsidized rates. Free home collection included.",
    selectPackage: "Select Package",
    packageSelected: "Package Selected",
    includesTests: "Includes {count} tests:",
    offPercent: "{percent}% OFF",

    // Explorer Section
    catalog: "Catalog",
    testExplorer: "Interactive Test Explorer",
    explorerSub: "Search and filter our complete pathology catalog. Select multiple tests to build your custom appointment.",
    searchExplorerPlaceholder: "Search for blood test, sugar, thyroid, widal, CBC...",
    filter: "Filter:",
    filterAll: "All",
    filterBiochemistry: "Biochemistry",
    filterHematology: "Hematology",
    filterClinical: "Clinical Pathology",
    filterImmunology: "Immunology",
    filterEndocrinology: "Endocrinology",
    filterSerology: "Serology",
    yourBooking: "Your Booking",
    noTestsSelected: "No tests selected yet.",
    clickToSelect: "Click on any package or test in the list to select it for your booking.",

    // Booking Section
    oneMinBooking: "1-Minute Booking",
    bookHomeSample: "Book Home Sample Collection",
    fillDetails: "Fill in the details below. We collect samples safely from your home or office.",
    selectedTestsCount: "Selected Tests / Packages ({count})",
    noSelectedTestsWarning: "No tests selected. Scroll to the Test Explorer catalog above to select tests first.",
    patientName: "Patient Name *",
    enterName: "Enter full name",
    mobileNumber: "Mobile Number *",
    enterMobile: "10-digit mobile number",
    genderLabel: "Gender *",
    male: "Male",
    female: "Female",
    other: "Other",
    preferredDate: "Preferred Date *",
    preferredTime: "Preferred Time *",
    collectionMode: "Sample Collection Mode",
    homeCollectionFree: "Home Collection (Free)",
    visitLab: "Visit Our Laboratory",
    fullAddress: "Full Address (with Landmark) *",
    addressPlaceholder: "House Number, Sector/Colony, Landmark, City, Pin Code",
    requestBookingBtn: "Request Collection Booking",
    submittingBooking: "Submitting request...",

    // Quality Section
    clinicalQuality: "Clinical Quality",
    verifiedPathologists: "Verified by Certified Medical Pathologists",
    qualitySub: "Every single report generated at Sana Pathology undergoes multi-level verification checkups. Our laboratory operates with strict internal and external quality control guidelines.",
    certifiedSignatures: "Certified Signatures",
    signaturesDesc: "All reports are digitally signed by a registered M.D. Pathologist.",
    nablAudits: "NABL Quality Audits",
    auditsDesc: "We adhere to global standards in accuracy, hygiene, and machinery.",
    barcodedSpecimen: "Barcoded Specimen",
    specimenDesc: "No sample mix-ups. Safe barcoding processes from the collection phase.",
    automatedAnalyzers: "Automated Analyzers",
    analyzersDesc: "Minimal human error through high-fidelity diagnostic machinery.",
    chiefPathologist: "Chief Pathologist & Director",
    regNo: "Reg No. UP-1029384",
    verification: "Verification:",
    activeVerified: "Active & Verified",
    specialization: "Specialization:",
    specDetails: "Hematology & Cytopathology",
    experience: "Lab Experience:",
    expDetails: "15+ Years Trust",
    glanceFooter: "Patients can securely search their reports on our home page. All reports contain a verified QR Code pointing directly to our secure cloud server database.",

    // Testimonials
    patientTestimonials: "Patient Testimonials",
    testimonial1Text: '"Very professional staff and timely reports. The home collection was seamless and painless."',
    testimonial2Text: '"Highly accurate results. My doctor specifically recommended Sana Pathology for the thyroid tests."',
    testimonial3Text: '"Excellent service. Received my reports on WhatsApp within 6 hours as promised. Very convenient!"',

    // FAQ Section
    faqTitle: "Frequently Asked Questions",
    faq_q_0: "Do I need to fast before a blood test?",
    faq_a_0: "It depends on the test. Tests like Fasting Blood Sugar and Lipid Profile require 8-12 hours of fasting. Please check with our lab when booking.",
    faq_q_1: "Do you offer home sample collection?",
    faq_a_1: "Yes, we provide free home sample collection within city limits for bookings above ₹500.",
    faq_q_2: "How will I receive my reports?",
    faq_a_2: "You will receive a digital copy of your report via WhatsApp and Email within the promised turnaround time. You can also log into our website to download past reports.",
    faq_q_3: "What are the payment options?",
    faq_a_3: "We accept Cash, UPI (Google Pay, PhonePe, Paytm), and major Credit/Debit cards at our lab and during home collection.",
    faq_q_4: "What is your turnaround time for reports?",
    faq_a_4: "Most routine tests (like CBC, Sugar) are delivered within 6-12 hours. Specialized tests may take 24 hours.",

    // Contact Section
    locationContact: "Location & Contact",
    contactDesc: "Visit our state-of-the-art laboratory for a comfortable and hygienic testing experience, or give us a call to book a home collection.",
    address: "Address",
    openingHours: "Opening Hours",
    contactNumber: "Contact Number",
    monSatHours: "Monday - Saturday: 7:00 AM - 8:00 PM",
    sunHours: "Sunday: 8:00 AM - 1:00 PM",

    // Footer
    footerDesc: "Providing high-quality diagnostic services with unparalleled accuracy and fast turnaround times.",
    quickLinks: "Quick Links",
    contactInfo: "Contact Info",
    certifications: "Certifications",
    copyright: "© 2026 Sana Pathology Lab. All rights reserved.",

    // Dynamic Packages
    "PKG-FIT_name": "Sana Fit Active (Basic Health)",
    "PKG-FIT_desc": "Ideal for routine wellness screening and baseline tracking.",
    "PKG-WOMEN_name": "Sana Women Premium (Special Care)",
    "PKG-WOMEN_desc": "Comprehensive checkup tailored specifically for women health.",
    "PKG-SENIOR_name": "Sana Senior Citizen (Elderly Care)",
    "PKG-SENIOR_desc": "Recommended for annual evaluation for people aged 60+.",
    "PKG-HEART_name": "Sana Heart Health (Cardiac Profile)",
    "PKG-HEART_desc": "Comprehensive risk assessment for cardiovascular diseases.",

    // Dynamic Default Tests
    "CBC": "Complete Blood Count (CBC)",
    "FBS": "Fasting Blood Sugar (FBS)",
    "LIPID": "Lipid Profile",
    "THYROID": "Thyroid Profile (T3, T4, TSH)",
    "URINE": "Urine Routine Examination",
    "LFT": "Liver Function Test (LFT)",
    "KFT": "Kidney Function Test (KFT)",
    "VITD": "Vitamin D (25-OH)",
    "WIDAL": "WIDAL Test (Typhoid)",
    "HB": "Hemoglobin (Hb) Only",
    "BGRP": "Blood Grouping & Rh Typing",
    "URIC": "Uric Acid",
    "HBA1C": "HbA1c (Glycated Hemoglobin)",
    "CA": "Calcium Serum",
    "DENGUENS1": "Dengue NS1 Antigen",
    "ESR": "ESR (Erythrocyte Sedimentation Rate)",
    
    // Additional keys for full translation
    searchingRequests: "Searching collection requests...",
    noTestsMatchingDesc: "We couldn't find tests matching \"{query}\". Try searching for standard terms like CBC, Sugar, or Liver.",
    resetFilter: "Reset Filter",
    code: "Code",
    sample: "Sample",
    totalTests: "Total Tests",
    estimatedCost: "Estimated Cost",
    requestSubmitted: "Request Submitted Successfully!",
    thankYouDesc: "Thank you, {name}. We have received your booking request. To ensure priority processing, please alert our lab coordinator on WhatsApp immediately.",
    trackingRefId: "Your Tracking Reference ID",
    trackInstruction: "Use this ID to track your request status using the Track Request option in the search card at the top of the page.",
    alertWhatsApp: "Alert via WhatsApp",
    bookAnother: "Book Another Test",
    totalPrice: "Total Price (Pay at time of Collection)",
    nablTicker: "NABL Standard",
    patientPortal: "Patient Portal",
    bookTestFloating: "Book Test",
    "filterUrine Analysis": "Urine Analysis",
    "filterUrineAnalysis": "Urine Analysis",
    "filterClinical Pathology": "Clinical Pathology",
    "filterClinicalPathology": "Clinical Pathology",
    "filterOther": "Other",
  },
  hi: {
    // Header & Navigation
    logoTitle: "सना पैथोलॉजी",
    logoSub: "डायग्नोस्टिक सेंटर",
    whyUs: "हम क्यों",
    packages: "पैकेज",
    testFinder: "टेस्ट खोजें",
    bookOnline: "ऑनलाइन बुक करें",
    faq: "सामान्य प्रश्न",
    contact: "संपर्क करें",
    staffLogin: "स्टाफ लॉगिन",

    // Hero Section
    welcome: "सटीक निदान, हजारों का भरोसा",
    welcomeSub: "सटीक, समय पर परिणाम के लिए स्वचालित विश्लेषक और विशेषज्ञ पैथोलॉजिस्ट से सुसज्जित उन्नत पैथोलॉजी लैब।",
    bookHomeCollection: "होम कलेक्शन बुक करें",
    trackReports: "अपनी रिपोर्ट ट्रैक करें",
    isoCertified: "आईएसओ 9001:2015 प्रमाणित",
    pts15k: "15,000+ मरीज",
    tat612: "6-12 घंटे में रिपोर्ट",
    freeHomeCollection: "मुफ़्त होम कलेक्शन",
    nablAccredited: "एनएबीएल मान्यता प्राप्त",

    // Live Ticker & Health Tip
    livePrices: "लाइव कीमतें",
    healthTip: "स्वास्थ्य टिप",

    // Stats Section
    byTheNumbers: "आंकड़ों में",
    trustedByThousands: "हजारों का भरोसा",
    statsSub: "सच्चे आंकड़े जो गुणवत्तापूर्ण निदान के प्रति हमारी प्रतिबद्धता को दर्शाते हैं",
    patientsServed: "मरीजों की सेवा की",
    testsAvailable: "उपलब्ध टेस्ट",
    yearsOfService: "सेवा के वर्ष",
    reportsDelivered: "रिपोर्ट्स वितरित कीं",
    iso15189: "आईएसओ 15189 प्रमाणित",
    tat612hr: "6-12 घंटे टर्नअराउंड समय",
    compassionateCare: "सहानुभूतिपूर्ण देखभाल",
    digitalReports: "डिजिटल रिपोर्ट्स",

    // Search Section
    checkReportsBookings: "रिपोर्ट्स जांचें और बुकिंग ट्रैक करें",
    searchDesc: "रिपोर्ट पीडीएफ डाउनलोड करने या सैंपल कलेक्शन की स्थिति को ट्रैक करने के लिए अपना विवरण दर्ज करें",
    mobileNo: "मोबाइल नंबर",
    reportNo: "रिपोर्ट नंबर",
    trackRequest: "अनुरोध ट्रैक करें",
    placeholderMobile: "रिपोर्ट देखने के लिए 10 अंकों का मोबाइल नंबर दर्ज करें...",
    placeholderReport: "जैसे: RPT-000001",
    placeholderTrack: "कलेक्शन ट्रैक करने के लिए मोबाइल नंबर दर्ज करें...",
    findReport: "रिपोर्ट खोजें",
    foundRequests: "पाए गए {count} कलेक्शन अनुरोध",
    pendingConfirmation: "पुष्टि लंबित है",
    confirmedScheduled: "पुष्टि की गई / शेड्यूल किया गया",
    sampleCollected: "सैंपल एकत्र किया गया",
    cancelled: "रद्द किया गया",
    contactLab: "लैब से संपर्क करें",

    // Glance Section
    atAGlance: "सना पैथोलॉजी एक नज़र में",
    glanceSub: "चिकित्सीय उत्कृष्टता, रोगी की देखभाल और सटीक रिपोर्टिंग मानकों के प्रति प्रतिबद्ध।",
    glancePts: "संतुष्ट मरीजों की सेवा की",
    glanceTests: "व्यापक लैब टेस्ट",
    glanceDelivery: "औसत रिपोर्ट वितरण",
    glanceAccurate: "सटीक और एनएबीएल मानक",

    // Process Section
    process: "प्रक्रिया",
    howItWorks: "यह कैसे काम करता है",
    processSub: "अपने घर से बाहर निकले बिना 5 सरल, सुरक्षित चरणों में टेस्ट करवाएं।",
    step1Title: "टेस्ट चुनें",
    // Process Section
    process: "प्रक्रिया",
    howItWorks: "यह कैसे काम करता है",
    processSub: "अपने घर से बाहर निकले बिना 5 सरल, सुरक्षित चरणों में टेस्ट करवाएं।",
    step1Title: "टेस्ट चुनें",
    step1Desc: "नीचे दिए गए टेस्ट या वेलनेस पैकेज चुनें।",
    step2Title: "कलेक्शन शेड्यूल करें",
    step2Desc: "तिथि, समय और पता प्रदान करें।",
    step3Title: "सैंपल कलेक्शन",
    step3Desc: "प्रमाणित फ्लेबोटोमिस्ट आपके घर से सैंपल एकत्र करता है।",
    step4Title: "लैब प्रोसेसिंग",
    step4Desc: "बारकोडेड सुरक्षा के साथ हाई-टेक लैब प्रोसेसिंग।",
    step5Title: "डिजिटल रिपोर्ट्स",
    step5Desc: "व्हाट्सएप पर रिपोर्ट प्राप्त करें और ऑनलाइन डाउनलोड करें।",

    // Health Tips
    healthTip0: "गुर्दे को स्वस्थ रखने और विषाक्त पदार्थों को बाहर निकालने के लिए रोजाना 8 गिलास पानी पिएं।",
    healthTip1: "अपने रक्त प्रवाह की निगरानी करने और एनीमिया या संक्रमण का जल्दी पता लगाने के लिए सालाना सीबीसी परीक्षण कराएं।",
    healthTip2: "फलों और सब्जियों से भरपूर संतुलित आहार खाने से आपका कोलेस्ट्रॉल प्राकृतिक रूप से कम हो सकता है।",
    healthTip3: "दिन में केवल 30 मिनट टहलने से हृदय रोग का खतरा 35% तक कम हो जाता है।",
    healthTip4: "7-9 घंटे की गुणवत्तापूर्ण नींद प्रतिरक्षा प्रणाली को बढ़ावा देती है और बीमारी के खतरे को कम करती है।",
    healthTip5: "नियमित स्वास्थ्य जांच मधुमेह और उच्च रक्तचाप जैसी मूक बीमारियों को जल्दी पकड़ लेती है।",
    healthTip6: "धूम्रपान छोड़ने से छोड़ने के केवल 2 सप्ताह के भीतर फेफड़ों की कार्यप्रणाली में सुधार होता है।",
    healthTip7: "ध्यान या योग के माध्यम से तनाव का प्रबंधन करने से रक्तचाप में काफी कमी आ सकती है।",

    // Packages Section
    sanaCare: "सना केयर",
    popularPackages: "लोकप्रिय स्वास्थ्य पैकेज",
    packagesSub: "अत्यधिक रियायती दरों पर पूर्ण स्वास्थ्य प्रोफाइल जांच। मुफ्त होम कलेक्शन शामिल है।",
    selectPackage: "पैकेज चुनें",
    packageSelected: "पैकेज चुना गया",
    includesTests: "इसमें {count} टेस्ट शामिल हैं:",
    offPercent: "{percent}% छूट",

    // Explorer Section
    catalog: "कैटलॉग",
    testExplorer: "इंटरैक्टिव टेस्ट एक्सप्लोरर",
    explorerSub: "हमारे संपूर्ण पैथोलॉजी कैटलॉग को खोजें और फ़िल्टर करें। अपनी पसंद के टेस्ट चुनकर बुकिंग करें।",
    searchExplorerPlaceholder: "ब्लड टेस्ट, शुगर, थायराइड, विडाल, सीबीसी खोजें...",
    filter: "फ़िल्टर:",
    filterAll: "सभी",
    filterBiochemistry: "बायोकेमिस्ट्री",
    filterHematology: "हेमेटोलॉजी",
    filterClinical: "क्लिनिकल पैथोलॉजी",
    filterImmunology: "इम्यूनोलॉजी",
    filterEndocrinology: "एंडोक्रिनोलॉजी",
    filterSerology: "सेरोलॉजी",
    yourBooking: "आपकी बुकिंग",
    noTestsSelected: "अभी तक कोई टेस्ट नहीं चुना गया।",
    clickToSelect: "अपनी बुकिंग के लिए टेस्ट या पैकेज चुनने हेतु सूची में उन पर क्लिक करें।",

    // Booking Section
    oneMinBooking: "1-मिनट बुकिंग",
    bookHomeSample: "होम सैंपल कलेक्शन बुक करें",
    fillDetails: "नीचे विवरण भरें। हम आपके घर या कार्यालय से सुरक्षित रूप से सैंपल एकत्र करते हैं।",
    selectedTestsCount: "चयनित टेस्ट / पैकेज ({count})",
    noSelectedTestsWarning: "कोई टेस्ट नहीं चुना गया। टेस्ट चुनने के लिए ऊपर टेस्ट एक्सप्लोरर पर जाएं।",
    patientName: "मरीज का नाम *",
    enterName: "पूरा नाम दर्ज करें",
    mobileNumber: "मोबाइल नंबर *",
    enterMobile: "10-अंकीय मोबाइल नंबर",
    genderLabel: "लिंग *",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    preferredDate: "पसंदीदा तिथि *",
    preferredTime: "पसंदीदा समय *",
    collectionMode: "सैंपल कलेक्शन मोड",
    homeCollectionFree: "होम कलेक्शन (मुफ़्त)",
    visitLab: "हमारी प्रयोगशाला में आएं",
    fullAddress: "पूरा पता (लैंडमार्क के साथ) *",
    addressPlaceholder: "मकान नंबर, सेक्टर/कॉलोनी, लैंडमार्क, शहर, पिन कोड",
    requestBookingBtn: "कलेक्शन बुकिंग का अनुरोध करें",
    submittingBooking: "अनुरोध सबमिट किया जा रहा है...",

    // Quality Section
    clinicalQuality: "क्लिनिकल गुणवत्ता",
    verifiedPathologists: "प्रमाणित चिकित्सा रोगविज्ञानी द्वारा सत्यापित",
    qualitySub: "सना पैथोलॉजी में उत्पन्न होने वाली हर एक रिपोर्ट बहु-स्तरीय सत्यापन जांच से गुजरती है। हमारी प्रयोगशाला सख्त आंतरिक और बाहरी गुणवत्ता नियंत्रण दिशानिर्देशों के साथ काम करती है।",
    certifiedSignatures: "प्रमाणित हस्ताक्षर",
    signaturesDesc: "सभी रिपोर्टों पर एक पंजीकृत एम.डी. पैथोलॉजिस्ट द्वारा डिजिटल रूप से हस्ताक्षर किए जाते हैं।",
    nablAudits: "एनएबीएल गुणवत्ता ऑडिट",
    auditsDesc: "हम सटीकता, स्वच्छता और मशीनरी में वैश्विक मानकों का पालन करते हैं।",
    barcodedSpecimen: "बारकोडेड सैंपल",
    specimenDesc: "नमूनों का कोई मिश्रण नहीं। कलेक्शन चरण से ही सुरक्षित बारकोडिंग प्रक्रिया।",
    automatedAnalyzers: "स्वचालित विश्लेषक",
    analyzersDesc: "उच्च-सटीकता वाली नैदानिक मशीनरी के माध्यम से न्यूनतम मानवीय त्रुटि।",
    chiefPathologist: "मुख्य पैथोलॉजिस्ट और निदेशक",
    regNo: "पंजीकरण संख्या UP-1029384",
    verification: "सत्यापन:",
    activeVerified: "सक्रिय और सत्यापित",
    specialization: "विशेषज्ञता:",
    specDetails: "हेमेटोलॉजी और साइटोपैथोलॉजी",
    experience: "लैब अनुभव:",
    expDetails: "15+ वर्ष का विश्वास",
    glanceFooter: "मरीज हमारे होम पेज पर सुरक्षित रूप से अपनी रिपोर्ट खोज सकते हैं। सभी रिपोर्टों में हमारे सुरक्षित क्लाउड सर्वर डेटाबेस की ओर इशारा करते हुए एक सत्यापित क्यूआर कोड होता।",

    // Testimonials
    patientTestimonials: "मरीजों के अनुभव",
    testimonial1Text: '"बहुत ही पेशेवर स्टाफ और समय पर रिपोर्ट। होम कलेक्शन बिल्कुल आसान और दर्दरहित था।"',
    testimonial2Text: '"अत्यधिक सटीक परिणाम। मेरे डॉक्टर ने विशेष रूप से थायराइड परीक्षणों के लिए सना पैथोलॉजी की सिफारिश की थी।"',
    testimonial3Text: '"उत्कृष्ट सेवा। वादे के अनुसार 6 घंटे के भीतर व्हाट्सएप पर मेरी रिपोर्ट मिल गई। बहुत सुविधाजनक!"',

    // FAQ Section
    faqTitle: "अक्सर पूछे जाने वाले प्रश्न",
    faq_q_0: "क्या मुझे ब्लड टेस्ट से पहले उपवास (Fasting) करने की आवश्यकता है?",
    faq_a_0: "यह टेस्ट पर निर्भर करता है। फास्टिंग ब्लड शुगर और लिपिड प्रोफाइल जैसे टेस्ट के लिए 8-12 घंटे के उपवास की आवश्यकता होती है। कृपया बुकिंग के समय हमारी लैब से पुष्टि करें।",
    faq_q_1: "क्या आप घर से सैंपल कलेक्शन की सुविधा प्रदान करते हैं?",
    faq_a_1: "हां, हम ₹500 से अधिक की बुकिंग के लिए शहर की सीमा के भीतर मुफ्त होम सैंपल कलेक्शन प्रदान करते हैं।",
    faq_q_2: "मुझे मेरी रिपोर्ट कैसे प्राप्त होगी?",
    faq_a_2: "आपको वादा किए गए समय के भीतर व्हाट्सएप और ईमेल के माध्यम से अपनी रिपोर्ट की डिजिटल कॉपी प्राप्त होगी। आप पिछली रिपोर्ट डाउनलोड करने के लिए हमारी वेबसाइट पर भी लॉग इन कर सकते हैं।",
    faq_q_3: "भुगतान के क्या विकल्प हैं?",
    faq_a_3: "हम अपनी लैब में और होम कलेक्शन के दौरान नकद (Cash), यूपीआई (Google Pay, PhonePe, Paytm) और प्रमुख क्रेडिट/डेबिट कार्ड स्वीकार करते हैं।",
    faq_q_4: "रिपोर्ट के लिए आपका टर्नअराउंड समय क्या है?",
    faq_a_4: "अधिकांश नियमित परीक्षण (जैसे सीबीसी, शुगर) 6-12 घंटों के भीतर वितरित किए जाते हैं। विशेष परीक्षणों में 24 घंटे लग सकते हैं।",

    // Contact Section
    locationContact: "स्थान और संपर्क",
    contactDesc: "एक आरामदायक और स्वच्छ परीक्षण अनुभव के लिए हमारी अत्याधुनिक प्रयोगशाला में आएं, या होम कलेक्शन बुक करने के लिए हमें कॉल करें।",
    address: "पता",
    openingHours: "खुलने का समय",
    contactNumber: "संपर्क नंबर",
    monSatHours: "सोमवार - शनिवार: सुबह 7:00 बजे - रात 8:00 बजे",
    sunHours: "रविवार: सुबह 8:00 बजे - दोपहर 1:00 बजे",

    // Footer
    footerDesc: "अद्वितीय सटीकता और त्वरित रिपोर्टिंग समय के साथ उच्च गुणवत्ता वाली नैदानिक सेवाएं प्रदान करना।",
    quickLinks: "त्वरित लिंक्स",
    contactInfo: "संपर्क जानकारी",
    certifications: "प्रमाणपत्र",
    copyright: "© 2026 सना पैथोलॉजी लैब। सर्वाधिकार सुरक्षित।",

    // Dynamic Packages
    "PKG-FIT_name": "सना फिट एक्टिव (बेसिक हेल्थ)",
    "PKG-FIT_desc": "नियमित वेलनेस स्क्रीनिंग और बेसलाइन ट्रैकिंग के लिए आदर्श।",
    "PKG-WOMEN_name": "सना वुमन प्रीमियम (विशेष देखभाल)",
    "PKG-WOMEN_desc": "विशेष रूप से महिलाओं के स्वास्थ्य के लिए तैयार व्यापक जांच।",
    "PKG-SENIOR_name": "सना सीनियर सिटीजन (बुजुर्गों की देखभाल)",
    "PKG-SENIOR_desc": "60 वर्ष से अधिक उम्र के लोगों के लिए वार्षिक मूल्यांकन की सिफारिश।",
    "PKG-HEART_name": "सना हार्ट हेल्थ (कार्डियक प्रोफाइल)",
    "PKG-HEART_desc": "हृदय रोगों के लिए व्यापक जोखिम मूल्यांकन।",

    // Dynamic Default Tests
    "CBC": "सीबीसी (Complete Blood Count)",
    "FBS": "खाली पेट शुगर (Fasting Sugar)",
    "LIPID": "लिपिड प्रोफाइल (Lipid Profile)",
    "THYROID": "थायाराइड प्रोफाइल (T3, T4, TSH)",
    "URINE": "पेशाब की सामान्य जांच (Urine Routine)",
    "LFT": "लिवर फंक्शन टेस्ट (LFT)",
    "KFT": "किडनी फंक्शन टेस्ट (KFT)",
    "VITD": "विटामिन डी (Vitamin D)",
    "WIDAL": "विडाल टेस्ट (Typhoid Widal)",
    "HB": "केवल हीमोग्लोबिन (Hb)",
    "BGRP": "ब्लड ग्रुप जांच (Blood Group)",
    "URIC": "यूरिक एसिड (Uric Acid)",
    "HBA1C": "एचबीए1सी (HbA1c Sugar)",
    "CA": "कैल्शियम (Calcium Serum)",
    "DENGUENS1": "डेंगू एनएस1 एंटीजन (Dengue NS1)",
    "ESR": "ईएसआर (ESR)",
    
    // Additional keys for full translation
    searchingRequests: "कलेक्शन अनुरोधों की खोज की जा रही है...",
    noTestsMatchingDesc: "हमें \"{query}\" से मेल खाने वाले परीक्षण नहीं मिले। कृपया सीबीसी, शुगर या लिवर जैसे मानक शब्दों को खोजने का प्रयास करें।",
    resetFilter: "फ़िल्टर रीसेट करें",
    code: "कोड",
    sample: "सैंपल",
    totalTests: "कुल टेस्ट",
    estimatedCost: "अनुमानित लागत",
    requestSubmitted: "अनुरोध सफलतापूर्वक सबमिट किया गया!",
    thankYouDesc: "धन्यवाद, {name}। हमें आपका बुकिंग अनुरोध प्राप्त हो गया है। प्राथमिकता प्रोसेसिंग सुनिश्चित करने के लिए, कृपया हमारे लैब समन्वयक को तुरंत व्हाट्सएप पर सूचित करें।",
    trackingRefId: "आपका ट्रैकिंग संदर्भ आईडी",
    trackInstruction: "इस पृष्ठ के शीर्ष पर सर्च कार्ड में अनुरोध ट्रैक करें विकल्प का उपयोग करके अपनी स्थिति ट्रैक करने के लिए इस आईडी का उपयोग करें।",
    alertWhatsApp: "व्हाट्सएप द्वारा सूचित करें",
    bookAnother: "दूसरा टेस्ट बुक करें",
    totalPrice: "कुल मूल्य (कलेक्शन के समय भुगतान करें)",
    nablTicker: "एनएबीएल मानक",
    patientPortal: "रोगी पोर्टल",
    bookTestFloating: "टेस्ट बुक करें",
    "filterUrine Analysis": "पेशाब की जांच",
    "filterUrineAnalysis": "पेशाब की जांच",
    "filterClinical Pathology": "क्लिनिकल पैथोलॉजी",
    "filterClinicalPathology": "क्लिनिकल पैथोलॉजी",
    "filterOther": "अन्य",
    
    // Health Packages test names translations
    "Complete Blood Count (CBC)": "सीबीसी (रक्त जांच)",
    "Fasting Blood Sugar": "खाली पेट ब्लड शुगर",
    "Lipid Profile": "लिपिड प्रोफाइल (वसा जांच)",
    "Urine Routine": "यूरिन रूटीन (पेशाब जांच)",
    "CBC": "सीबीसी (CBC)",
    "Thyroid Profile": "थायराइड प्रोफाइल",
    "LFT": "लिवर फंक्शन टेस्ट (LFT)",
    "KFT": "किडनी फंक्शन टेस्ट (KFT)",
    "Vitamin D": "विटामिन डी",
    "Vitamin B12": "विटामिन बी12",
    "Fasting Sugar": "Fasting शुगर",
    "Blood Sugar Fasting": "खाली पेट ब्लड शुगर",
    "HbA1c": "एचबीए1सी (HbA1c)",
    "Blood Sugar": "ब्लड शुगर",
    "Uric Acid": "यूरिक एसिड",
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
    return translations[language]?.[key] || translations['en']?.[key] || key;
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

