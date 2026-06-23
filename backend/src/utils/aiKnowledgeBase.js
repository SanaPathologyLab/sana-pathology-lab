const KNOWLEDGE_BASE = {
  lab: {
    name: 'Sana Pathology Lab',
    address: {
      en: 'Near Jain Temple, Mohalla Shahjahanabad, Main Road, Hasanpur, Amroha, Uttar Pradesh 244241',
      hi: 'जैन मंदिर के पास, मोहल्ला शाहजहानाबाद, मेन रोड, हसनपुर, अमरोहा, उत्तर प्रदेश 244241'
    },
    timings: {
      en: 'Monday to Saturday: 7:00 AM – 8:00 PM, Sunday: 7:00 AM – 2:00 PM',
      hi: 'सोमवार से शनिवार: सुबह 7:00 – रात 8:00 बजे, रविवार: सुबह 7:00 – दोपहर 2:00 बजे'
    },
    phone: '+91 6396786939',
    phoneDisplay: '+91-6396786939',
    whatsapp: 'https://wa.me/916396786939',
    email: 'sanapathologylab@gmail.com',
    website: 'https://sanapathologylab.github.io',
    nabl: {
      en: 'Sana Pathology is a NABL-accredited lab ensuring highest quality standards for all tests.',
      hi: 'साना पैथोलॉजी एक NABL-मान्यता प्राप्त लैब है जो सभी परीक्षणों के लिए उच्चतम गुणवत्ता मानकों को सुनिश्चित करती है।'
    },
    accreditations: [
      'NABL Accredited',
      'ISO 9001:2015 Certified',
      'Registered with Indian Medical Association'
    ],
    homeCollection: {
      en: 'Free home sample collection available. No extra charges within the area.',
      hi: 'मुफ्त घर पर सैंपल कलेक्शन उपलब्ध है। क्षेत्र के भीतर कोई अतिरिक्त शुल्क नहीं।'
    },
    payment: {
      en: 'We accept Cash, UPI (GPay, PhonePe, Paytm), and major Credit/Debit cards.',
      hi: 'हम नकद, UPI (GPay, PhonePe, Paytm), और प्रमुख क्रेडिट/डेबिट कार्ड स्वीकार करते हैं।'
    },
    reportDelivery: {
      en: 'Reports are delivered via WhatsApp within 24-48 hours. Urgent reports can be expedited.',
      hi: 'रिपोर्ट्स 24-48 घंटों के भीतर WhatsApp पर भेज दी जाती हैं। तत्काल रिपोर्ट्स जल्दी उपलब्ध कराई जा सकती हैं।'
    }
  },

  tests: {
    'CBC': { name: 'Complete Blood Count (CBC)', price: 200, sampleType: 'Blood', fasting: false, prep: { en: 'No fasting required', hi: 'खाली पेट रहने की जरूरत नहीं' }, category: 'Hematology', homeCollection: true, aliases: ['cbc', 'complete blood count', 'complete blood', 'blood count'] },
    'CBC-01': { name: 'Complete Blood Count (CBC)', price: 350, sampleType: 'EDTA Blood', fasting: false, prep: { en: 'No fasting required', hi: 'खाली पेट रहने की जरूरत नहीं' }, category: 'Hematology', homeCollection: true, aliases: [] },
    'HB-01': { name: 'Hemoglobin (Hb)', price: 100, sampleType: 'Blood', fasting: false, prep: { en: 'No fasting required', hi: 'खाली पेट रहने की जरूरत नहीं' }, category: 'Hematology', homeCollection: true, aliases: ['hb', 'hemoglobin', 'haemoglobin'] },
    'TLC01': { name: 'Total Leukocyte Count (TLC)', price: 150, sampleType: 'Blood', fasting: false, prep: { en: 'No fasting required', hi: 'खाली पेट रहने की जरूरत नहीं' }, category: 'Hematology', homeCollection: true, aliases: ['tlc', 'total leukocyte', 'wbc'] },
    'PLT01': { name: 'Platelet Count', price: 100, sampleType: 'Blood', fasting: false, prep: { en: 'No fasting required', hi: 'खाली पेट रहने की जरूरत नहीं' }, category: 'Hematology', homeCollection: true, aliases: ['platelet', 'platelets', 'platelet count'] },
    '015': { name: 'Platelet Count', price: 100, sampleType: 'Blood', fasting: false, prep: { en: 'No fasting required', hi: 'खाली पेट रहने की जरूरत नहीं' }, category: 'Hematology', homeCollection: true, aliases: [] },
    'ESR': { name: 'ESR (Erythrocyte Sedimentation Rate)', price: 80, sampleType: 'EDTA Blood', fasting: false, prep: { en: 'No fasting required', hi: 'खाली पेट रहने की जरूरत नहीं' }, category: 'Hematology', homeCollection: true, aliases: ['esr'] },
    'ESR-01': { name: 'ESR', price: 150, sampleType: 'Blood', fasting: false, prep: { en: 'No fasting required', hi: 'खाली पेट रहने की जरूरत नहीं' }, category: 'Hematology', homeCollection: true, aliases: [] },
    'BSF': { name: 'Blood Sugar Fasting (BSF)', price: 80, sampleType: 'Serum/Plasma', fasting: true, prep: { en: '8-10 hours fasting required. Only water allowed.', hi: '8-10 घंटे खाली पेट रहना जरूरी। केवल पानी ले सकते हैं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['bsf', 'fasting sugar', 'fbs', 'blood sugar fasting'] },
    'GLU-01': { name: 'Fasting Blood Sugar (FBS)', price: 80, sampleType: 'Fluoride Plasma', fasting: true, prep: { en: '8-10 hours fasting required. Only water allowed.', hi: '8-10 घंटे खाली पेट रहना जरूरी। केवल पानी ले सकते हैं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['fbs', 'blood sugar', 'sugar'] },
    'BSRBS': { name: 'Blood Sugar Random (BSRBS)', price: 80, sampleType: 'Serum/Plasma', fasting: false, prep: { en: 'No fasting required. Can be done anytime.', hi: 'खाली पेट रहने की जरूरत नहीं। कभी भी कर सकते हैं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['rbs', 'random sugar'] },
    'BSPP': { name: 'Blood Sugar Post Prandial (BSPP)', price: 80, sampleType: 'Serum/Plasma', fasting: false, prep: { en: 'Take your meal, then take the test exactly 2 hours after eating.', hi: 'खाना खाएं, फिर खाने के ठीक 2 घंटे बाद परीक्षण कराएं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['ppbs', 'post prandial'] },
    'HBA1C': { name: 'HbA1c (Glycosylated Haemoglobin)', price: 400, sampleType: 'EDTA Blood', fasting: false, prep: { en: 'No fasting required. Can be done anytime.', hi: 'खाली पेट रहने की जरूरत नहीं। कभी भी कर सकते हैं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['hba1c', 'a1c', 'glycosylated hemoglobin'] },
    'LFT': { name: 'Liver Function Test (LFT)', price: 500, sampleType: 'Serum', fasting: false, prep: { en: 'No strict fasting required. Empty stomach preferred for best results.', hi: 'सख्त खाली पेट रहने की जरूरत नहीं। बेहतर परिणाम के लिए खाली पेट रहना अच्छा है।' }, category: 'Biochemistry', homeCollection: true, aliases: ['lft', 'liver function', 'liver'] },
    'LFT-01': { name: 'Liver Function Test (LFT)', price: 600, sampleType: 'Serum', fasting: false, prep: { en: 'No strict fasting required.', hi: 'सख्त खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: [] },
    'KFT': { name: 'Kidney Function Test (KFT)', price: 500, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['kft', 'kidney function', 'kidney', 'renal'] },
    'KFT-01': { name: 'Kidney Function Test (KFT)', price: 600, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: [] },
    'LIPID': { name: 'Lipid Profile', price: 600, sampleType: 'Serum', fasting: true, prep: { en: '10-12 hours fasting required. Only water allowed.', hi: '10-12 घंटे खाली पेट रहना जरूरी। केवल पानी ले सकते हैं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['lipid', 'lipid profile', 'cholesterol', 'lipid test'] },
    'LIPID-01': { name: 'Lipid Profile', price: 650, sampleType: 'Serum', fasting: true, prep: { en: '10-12 hours fasting required.', hi: '10-12 घंटे खाली पेट रहना जरूरी।' }, category: 'Biochemistry', homeCollection: true, aliases: [] },
    'TFT': { name: 'Thyroid Function Test (T3, T4, TSH)', price: 450, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required. Avoid taking thyroid medication before the test.', hi: 'खाली पेट रहने की जरूरत नहीं। परीक्षण से पहले थायराइड की दवा न लें।' }, category: 'Hormone Tests', homeCollection: true, aliases: ['thyroid', 'tft', 'tsh', 't3', 't4', 'thyroid profile'] },
    'WIDAL': { name: 'Widal Test', price: 150, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Serology', homeCollection: true, aliases: ['widal'] },
    'WIDAL1': { name: 'Widal Test', price: 50, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Serology', homeCollection: true, aliases: [] },
    'TYPHIDOT-01': { name: 'Typhidot (IgG & IgM)', price: 350, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Serology', homeCollection: true, aliases: ['typhidot', 'typhoid'] },
    'DENGUE': { name: 'Dengue NS1 Ag + IgG/IgM (Combo)', price: 500, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required. Best done within first 5 days of fever.', hi: 'खाली पेट रहने की जरूरत नहीं। बुखार के पहले 5 दिनों में कराना सबसे अच्छा है।' }, category: 'Serology', homeCollection: true, aliases: ['dengue'] },
    'DENGUE-01': { name: 'Dengue Profile (IgG & IgM & NS1)', price: 1200, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required. Best done within first 5 days of fever.', hi: 'खाली पेट रहने की जरूरत नहीं। बुखार के पहले 5 दिनों में कराना सबसे अच्छा है।' }, category: 'Serology', homeCollection: true, aliases: ['dengue profile', 'dengue full'] },
    'MP': { name: 'Malaria Parasite (MP) Antigen', price: 100, sampleType: 'EDTA Blood', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Microbiology', homeCollection: true, aliases: ['malaria', 'mp'] },
    'MP-MICRO': { name: 'Malaria Parasite Identification (Microscopy)', price: 150, sampleType: 'Blood', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Microbiology', homeCollection: true, aliases: ['malaria microscopy', 'mp micro'] },
    'CRP': { name: 'C-Reactive Protein (CRP)', price: 150, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Serology', homeCollection: true, aliases: ['crp', 'c reactive protein'] },
    'CRP-QUANT-01': { name: 'CRP Quantitative', price: 350, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['crp quantitative'] },
    'SGOT-SGPT': { name: 'SGOT & SGPT (Liver Enzymes)', price: 250, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['sgot sgpt', 'sgot+sgpt', 'liver enzymes'] },
    'SGPT-01': { name: 'SGPT (ALT)', price: 150, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['sgpt', 'alt'] },
    'SGOT-01': { name: 'SGOT (AST)', price: 150, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['sgot', 'ast'] },
    'CREAT-01': { name: 'Serum Creatinine', price: 150, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['creatinine', 'creat'] },
    'UREA-01': { name: 'Blood Urea', price: 150, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['urea', 'blood urea'] },
    'URIC_ACID': { name: 'Uric Acid', price: 100, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['uric acid', 'ua'] },
    'CALCIUM-01': { name: 'Serum Calcium', price: 200, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['calcium', 'serum calcium'] },
    'BILIRUBIN-TOTAL-01': { name: 'Total Bilirubin', price: 150, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Biochemistry', homeCollection: true, aliases: ['bilirubin', 'total bilirubin'] },
    'URINE': { name: 'Urine Routine Examination', price: 100, sampleType: 'Urine', fasting: false, prep: { en: 'Early morning sample is best. Collect mid-stream urine in a clean container.', hi: 'सुबह का पहला नमूना सबसे अच्छा है। साफ बर्तन में बीच की धार का पेशाब लें।' }, category: 'Clinical Pathology', homeCollection: true, aliases: ['urine', 'urine routine', 'urinalysis'] },
    'URINE-01': { name: 'Urine Examination (Routine & Microscopy)', price: 150, sampleType: 'Urine', fasting: false, prep: { en: 'Early morning sample is best.', hi: 'सुबह का नमूना सबसे अच्छा है।' }, category: 'Clinical Pathology', homeCollection: true, aliases: [] },
    'SEMEN-01': { name: 'Semen Analysis', price: 350, sampleType: 'Semen', fasting: false, prep: { en: '3-5 days of abstinence required before collection.', hi: 'सैंपल लेने से पहले 3-5 दिन का संयम आवश्यक है।' }, category: 'Clinical Pathology', homeCollection: true, aliases: ['semen', 'semen analysis'] },
    'BG': { name: 'Blood Group (ABO & Rh)', price: 100, sampleType: 'Blood', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Hematology', homeCollection: true, aliases: ['blood group', 'blood type', 'abo'] },
    'BLOOD-GROUP': { name: 'ABO Blood Group & Rh Factor', price: 100, sampleType: 'EDTA Blood', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Hematology', homeCollection: true, aliases: [] },
    'HIV': { name: 'HIV I & II (Rapid)', price: 150, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Serology', homeCollection: true, aliases: ['hiv'] },
    'HBSAG': { name: 'HBsAg (Hepatitis B Surface Antigen)', price: 150, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Serology', homeCollection: true, aliases: ['hbsag', 'hepatitis b'] },
    'HCV': { name: 'HCV (Hepatitis C Antibody)', price: 150, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Serology', homeCollection: true, aliases: ['hcv', 'hepatitis c'] },
    'VDRL': { name: 'VDRL / RPR (Syphilis Test)', price: 100, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Serology', homeCollection: true, aliases: ['vdrl', 'syphilis'] },
    'RF': { name: 'Rheumatoid Factor (RA Factor)', price: 150, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Serology', homeCollection: true, aliases: ['rf', 'rheumatoid', 'ra factor'] },
    'UPT': { name: 'Urine Pregnancy Test (UPT)', price: 50, sampleType: 'Urine', fasting: false, prep: { en: 'Early morning sample is best for accurate result.', hi: 'सटीक परिणाम के लिए सुबह का पहला पेशाब सबसे अच्छा है।' }, category: 'Clinical Pathology', homeCollection: true, aliases: ['upt', 'pregnancy test'] },
    'BHCG': { name: 'Beta-hCG (Serum Quantitative)', price: 400, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Hormone Tests', homeCollection: true, aliases: ['bhcg', 'beta hcg'] },
    'IRON': { name: 'Iron Studies (Serum Iron + TIBC)', price: 400, sampleType: 'Serum', fasting: false, prep: { en: 'Early morning sample preferred.', hi: 'सुबह का सैंपल बेहतर है।' }, category: 'Biochemistry', homeCollection: true, aliases: ['iron', 'iron studies', 'tibc'] },
    'VIT-D': { name: 'Vitamin D (25-OH) Total', price: 800, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Hormone Tests', homeCollection: true, aliases: ['vitamin d', 'vit d', 'vit d3'] },
    'VIT-B12': { name: 'Vitamin B12 (Cyanocobalamin)', price: 700, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Hormone Tests', homeCollection: true, aliases: ['vitamin b12', 'b12', 'vit b12'] },
    'COVID-AG': { name: 'COVID-19 Antigen Rapid Test', price: 300, sampleType: 'Nasal Swab', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Microbiology', homeCollection: true, aliases: ['covid', 'covid test'] },
    'ANC-01': { name: 'Ante-Natal Care (ANC) Profile', price: 1200, sampleType: 'Blood', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Clinical Pathology', homeCollection: true, aliases: ['anc', 'antenatal', 'pregnancy profile', 'pregnancy'] },
    'FEVER-01': { name: 'Fever Profile (Widal, MP, SGOT/SGPT)', price: 800, sampleType: 'Serum', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Clinical Pathology', homeCollection: true, aliases: ['fever profile', 'fever panel'] },
    'MANTOUX-01': { name: 'Mantoux Test (Tuberculin Skin Test)', price: 250, sampleType: 'Skin', fasting: false, prep: { en: 'No fasting required. Results read after 48-72 hours.', hi: 'खाली पेट रहने की जरूरत नहीं। परिणाम 48-72 घंटे बाद पढ़ा जाता है।' }, category: 'Clinical Pathology', homeCollection: false, aliases: ['mantoux', 'tb test', 'tuberculin'] },
    'PT-01': { name: 'Prothrombin Time (PT)', price: 250, sampleType: 'Blood', fasting: false, prep: { en: 'No fasting required.', hi: 'खाली पेट रहने की जरूरत नहीं।' }, category: 'Hematology', homeCollection: true, aliases: ['pt', 'prothrombin time'] }
  },

  packages: [
    { name: 'Full Body Checkup', code: 'FULL-BODY', price: 1800, savings: 'Save ₹800', tests: ['CBC', 'LFT', 'KFT', 'LIPID', 'TFT', 'GLU-01', 'URINE'], description: { en: 'Complete health screening — 7 essential tests', hi: 'पूर्ण स्वास्थ्य जांच — 7 आवश्यक परीक्षण' } },
    { name: 'Fever Profile', code: 'FEVER-PACK', price: 800, savings: 'Save ₹200', tests: ['CBC', 'MP-MICRO', 'TYPHIDOT-01', 'CRP'], description: { en: 'Complete fever screening panel', hi: 'पूर्ण बुखार जांच पैनल' } },
    { name: 'Diabetes Care Package', code: 'DIABETES-PACK', price: 900, savings: 'Save ₹300', tests: ['GLU-01', 'HBA1C', 'LIPID', 'KFT', 'URINE'], description: { en: 'Comprehensive diabetes monitoring', hi: 'व्यापक मधुमेह निगरानी' } },
    { name: 'Thyroid Package', code: 'THYROID-PACK', price: 450, savings: '', tests: ['TFT'], description: { en: 'Complete thyroid function check', hi: 'पूर्ण थायराइड कार्य जांच' } },
    { name: 'Heart Care Package', code: 'HEART-PACK', price: 1400, savings: 'Save ₹500', tests: ['LIPID', 'KFT', 'GLU-01', 'CBC', 'SGOT-SGPT'], description: { en: 'Cardiovascular risk assessment', hi: 'हृदय रोग जोखिम मूल्यांकन' } },
    { name: 'Anemia Package', code: 'ANEMIA-PACK', price: 500, savings: 'Save ₹100', tests: ['CBC', 'IRON', 'HB-01'], description: { en: 'Complete anemia screening', hi: 'पूर्ण एनीमिया जांच' } },
    { name: 'Vitamin Deficiency Package', code: 'VITAMIN-PACK', price: 1500, savings: 'Save ₹500', tests: ['VIT-D', 'VIT-B12', 'CALCIUM-01', 'CBC'], description: { en: 'Complete vitamin and mineral check', hi: 'पूर्ण विटामिन और खनिज जांच' } },
    { name: 'Women Wellness Package', code: 'WOMEN-PACK', price: 1500, savings: 'Save ₹500', tests: ['CBC', 'TFT', 'GLU-01', 'URINE', 'HB-01'], description: { en: 'Essential health checks for women', hi: 'महिलाओं के लिए आवश्यक स्वास्थ्य जाँच' } },
    { name: 'Senior Citizen Checkup', code: 'SENIOR-PACK', price: 2000, savings: 'Save ₹700', tests: ['CBC', 'LFT', 'KFT', 'LIPID', 'TFT', 'GLU-01', 'URINE', 'CALCIUM-01'], description: { en: 'Comprehensive health check for seniors', hi: 'वरिष्ठ नागरिकों के लिए व्यापक स्वास्थ्य जांच' } }
  ],

  coupons: {
    'FIRST50': { discount: 50, type: 'flat', minOrder: 0, description: { en: '₹50 off your first booking', hi: 'पहली बुकिंग पर ₹50 की छूट' } },
    'WOMEN37': { discount: 37, type: 'percent', minOrder: 1000, description: { en: '37% off Women\'s Package', hi: 'महिला पैकेज पर 37% छूट' } },
    'SENIOR39': { discount: 39, type: 'percent', minOrder: 800, description: { en: '39% off Senior Package', hi: 'वरिष्ठ पैकेज पर 39% छूट' } },
    'DOCTOR10': { discount: 10, type: 'percent', minOrder: 500, description: { en: '10% off for doctor referrals', hi: 'डॉक्टर रेफरल पर 10% छूट' } },
    'FAMILY20': { discount: 20, type: 'percent', minOrder: 2000, description: { en: '20% off Family Package', hi: 'परिवार पैकेज पर 20% छूट' } },
    'HEALTH100': { discount: 100, type: 'flat', minOrder: 1500, description: { en: '₹100 off Full Body Checkup', hi: 'फुल बॉडी चेकअप पर ₹100 छूट' } }
  },

  normalRanges: {
    'HB': { min: { m: 13.5, f: 11.5 }, max: { m: 17.5, f: 15.5 }, unit: 'g/dL' },
    'TLC': { min: 4000, max: 11000, unit: '/μL' },
    'PLATELET': { min: 150000, max: 450000, unit: '/μL' },
    'TSH': { min: 0.5, max: 5.5, unit: 'mIU/L' },
    'T3': { min: 80, max: 220, unit: 'ng/dL' },
    'T4': { min: 5, max: 12, unit: 'μg/dL' },
    'FASTING_SUGAR': { min: 70, max: 110, unit: 'mg/dL' },
    'RANDOM_SUGAR': { min: 70, max: 140, unit: 'mg/dL' },
    'HBA1C': { min: 4.5, max: 5.7, unit: '%' },
    'TOTAL_CHOLESTEROL': { min: 120, max: 200, unit: 'mg/dL' },
    'TRIGLYCERIDES': { min: 0, max: 150, unit: 'mg/dL' },
    'HDL': { min: 40, max: 60, unit: 'mg/dL' },
    'LDL': { min: 0, max: 100, unit: 'mg/dL' },
    'UREA': { min: 7, max: 20, unit: 'mg/dL' },
    'CREATININE': { min: 0.6, max: 1.2, unit: 'mg/dL' },
    'URIC_ACID': { min: { m: 3.4, f: 2.4 }, max: { m: 7.0, f: 6.0 }, unit: 'mg/dL' },
    'CALCIUM': { min: 8.1, max: 10.4, unit: 'mg/dL' },
    'BILIRUBIN_TOTAL': { min: 0.2, max: 1.0, unit: 'mg/dL' },
    'SGOT': { min: 5, max: 40, unit: 'IU/L' },
    'SGPT': { min: 5, max: 40, unit: 'IU/L' },
    'CRP': { min: 0, max: 5, unit: 'mg/dL' },
    'VITAMIN_D': { min: 30, max: 100, unit: 'ng/mL' },
    'VITAMIN_B12': { min: 200, max: 900, unit: 'pg/mL' },
    'IRON': { min: 60, max: 170, unit: 'μg/dL' },
    'ESR': { min: { m: 0, f: 0 }, max: { m: 9, f: 20 }, unit: 'mm/hr' }
  },

  doctors: [
    { name: 'Dr. R.K. Gupta', qualification: 'MBBS, MD (Pathology)', specialization: 'Pathology', consultationFee: 'Free with tests' },
    { name: 'Dr. S. Sharma', qualification: 'MBBS, MD (Medicine)', specialization: 'General Medicine', consultationFee: '₹200' },
    { name: 'Dr. P. Verma', qualification: 'MBBS, MD (Gynecology)', specialization: 'Gynecology', consultationFee: '₹300' }
  ],

  symptomToTests: {
    'fever': { tests: ['CBC', 'CRP', 'MP-MICRO', 'DENGUE-01', 'TYPHIDOT-01', 'WIDAL'], note: 'Bukhar ke liye CBC, CRP, Malaria, Dengue aur Typhoid test karein.' },
    'thakan': { tests: ['CBC', 'HB-01', 'VIT-B12', 'VIT-D', 'TFT', 'GLU-01'], note: 'Thakan/weakness ke liye CBC, Hb, Vitamin B12, Vitamin D, Thyroid aur Sugar check karein.' },
    'weakness': { tests: ['CBC', 'HB-01', 'VIT-B12', 'VIT-D', 'TFT', 'GLU-01'], note: 'Thakan/weakness ke liye CBC, Hb, Vitamin B12, Vitamin D, Thyroid aur Sugar check karein.' },
    'kamjori': { tests: ['CBC', 'HB-01', 'VIT-B12', 'VIT-D', 'TFT', 'GLU-01'], note: 'Kamjori ke liye CBC, Hb, Vitamin B12, Vitamin D, Thyroid aur Sugar test karein.' },
    'weight gain': { tests: ['TFT', 'GLU-01', 'LIPID'], note: 'Weight gain ke liye Thyroid, Sugar aur Lipid profile check karein.' },
    'weight loss': { tests: ['TFT', 'GLU-01', 'HBA1C'], note: 'Weight loss ke liye Thyroid aur Sugar check karein.' },
    'hair fall': { tests: ['TFT', 'VIT-D', 'VIT-B12', 'HB-01', 'CALCIUM-01'], note: 'Baal jhadne ke liye Thyroid, Vitamin D, Vitamin B12, Hb aur Calcium check karein.' },
    'bal jhadna': { tests: ['TFT', 'VIT-D', 'VIT-B12', 'HB-01', 'CALCIUM-01'], note: 'Baal jhadne ke liye Thyroid, Vitamin D, Vitamin B12, Hb aur Calcium check karein.' },
    'joint pain': { tests: ['URIC_ACID', 'RF', 'CRP', 'ESR', 'CALCIUM-01'], note: 'Jodon mein dard ke liye Uric Acid, RA Factor, CRP aur ESR test karein.' },
    'gathiya': { tests: ['URIC_ACID', 'RF', 'CRP', 'ESR'], note: 'Gathiya/jodon ke dard ke liye Uric acid, RA Factor, CRP aur ESR test karein.' },
    'jaundice': { tests: ['LFT', 'BILIRUBIN-TOTAL-01', 'SGOT-SGPT', 'URINE'], note: 'Piliya ke liye LFT, Bilirubin, SGOT/SGPT aur Urine test karein.' },
    'piliya': { tests: ['LFT', 'BILIRUBIN-TOTAL-01', 'SGOT-SGPT', 'URINE'], note: 'Piliya ke liye LFT, Bilirubin, SGOT/SGPT aur Urine test karein.' },
    'diabetes': { tests: ['GLU-01', 'HBA1C', 'KFT', 'LIPID', 'URINE'], note: 'Sugar/diabetes ke liye FBS, HbA1c, KFT, Lipid aur Urine test karein.' },
    'sugar': { tests: ['GLU-01', 'HBA1C', 'KFT', 'LIPID', 'URINE'], note: 'Sugar/diabetes ke liye FBS, HbA1c, KFT, Lipid aur Urine test karein.' },
    'cough': { tests: ['CBC', 'ESR', 'MANTOUX-01'], note: 'Khansi ke liye CBC, ESR aur Mantoux test karein. 2 hafte se zyada khansi ho to zaroor karein.' },
    'khansi': { tests: ['CBC', 'ESR', 'MANTOUX-01'], note: 'Khansi ke liye CBC, ESR aur Mantoux test karein. 2 hafte se zyada khansi ho to zaroor karein.' },
    'chest pain': { tests: ['LIPID', 'GLU-01', 'HBA1C', 'CBC'], note: 'Seene mein dard ke liye Lipid Profile, Sugar aur HbA1c check karein. ECG ke liye doctor se milein.' },
    'pregnancy': { tests: ['ANC-01', 'UPT'], note: 'Garbhavastha ke liye ANC Profile aur UPT test karein.' },
    'burning urine': { tests: ['URINE', 'KFT', 'GLU-01'], note: 'Peshab mein jalan ke liye Urine Routine, KFT aur Sugar test karein.' },
    'uti': { tests: ['URINE', 'KFT'], note: 'UTI/mutra marg sankraman ke liye Urine aur KFT test karein.' },
    'anemia': { tests: ['CBC', 'HB-01', 'IRON', 'VIT-B12'], note: 'Khoon ki kami/anemia ke liye CBC, Hb, Iron aur Vitamin B12 test karein.' },
    'thyroid': { tests: ['TFT'], note: 'Thyroid ke liye T3, T4, TSH test karein.' },
    'pcos': { tests: ['TFT', 'GLU-01', 'LIPID'], note: 'PCOS ke liye Thyroid, Sugar aur Lipid profile check karein.' },
    'swelling': { tests: ['KFT', 'URINE', 'LFT'], note: 'Sujan ke liye KFT, Urine aur LFT test karein.' },
    'bp': { tests: ['KFT', 'LIPID', 'GLU-01'], note: 'High BP ke liye KFT, Lipid aur Sugar check karein.' },
    'heart': { tests: ['LIPID', 'GLU-01', 'HBA1C', 'CBC'], note: 'Dil se related Lipids, Sugar aur CBC zaroor check karein.' },
    'stomach pain': { tests: ['LFT', 'SGOT-SGPT', 'URINE'], note: 'Pet dard ke liye LFT, SGOT/SGPT aur Urine test karein.' },
    'skin': { tests: ['CBC', 'TFT', 'VIT-D'], note: 'Skin problem ke liye CBC, Thyroid aur Vitamin D check karein.' },
    'weight management': { tests: ['TFT', 'GLU-01', 'LIPID'], note: 'Vajan management ke liye Thyroid, Sugar aur Lipid test karein.' },
    'digestive': { tests: ['LFT', 'SGOT-SGPT', 'URINE'], note: 'Pachan se related LFT aur SGOT/SGPT test karein.' },
    'sleep': { tests: ['TFT', 'VIT-D', 'VIT-B12'], note: 'Neend ki samasya ke liye Thyroid, Vitamin D aur B12 check karein.' },
    'stress': { tests: ['TFT', 'VIT-D', 'VIT-B12'], note: 'Tanav ke liye Thyroid aur Vitamins check karein.' },
    'anxiety': { tests: ['TFT', 'VIT-D', 'VIT-B12'], note: 'Ghabrahat ke liye Thyroid aur Vitamins check karein.' },
    'men health': { tests: ['CBC', 'LIPID', 'GLU-01', 'TFT', 'KFT'], note: 'Purush swasthya ke liye CBC, Lipid, Sugar, Thyroid aur KFT test karein.' },
    'women health': { tests: ['CBC', 'TFT', 'GLU-01', 'VIT-D', 'VIT-B12', 'HB-01'], note: 'Mahila swasthya ke liye CBC, Thyroid, Sugar, Vitamin D aur B12 test karein.' },
    'senior': { tests: ['CBC', 'LFT', 'KFT', 'LIPID', 'TFT', 'GLU-01', 'CALCIUM-01'], note: 'Vrishth nagrik ke liye poori body checkup karein.' },
    'child': { tests: ['CBC', 'URINE', 'HB-01'], note: 'Bachchon ke liye CBC aur Urine test karein.' }
  },

  faq: {
    'timings': {
      en: 'Sana Pathology is open Mon-Sat 7:00 AM-8:00 PM, Sun 7:00 AM-2:00 PM. Located near Jain Temple, Mohalla Shahjahanabad, Main Road, Hasanpur, Amroha, UP.',
      hi: 'साना पैथोलॉजी सोम-शनि सुबह 7:00-रात 8:00, रविवार सुबह 7:00-दोपहर 2:00 बजे खुली रहती है।'
    },
    'address': {
      en: 'Near Jain Temple, Mohalla Shahjahanabad, Main Road, Hasanpur, Amroha, Uttar Pradesh 244241',
      hi: 'जैन मंदिर के पास, मोहल्ला शाहजहानाबाद, मेन रोड, हसनपुर, अमरोहा, उत्तर प्रदेश 244241'
    },
    'home collection': {
      en: 'Yes! Free home sample collection is available. A technician will visit your home to collect the sample.',
      hi: 'हाँ! मुफ्त घर पर सैंपल कलेक्शन उपलब्ध है। एक तकनीशियन आपके घर आकर सैंपल लेगा।'
    },
    'report': {
      en: 'Reports are delivered via WhatsApp within 24-48 hours. You can also visit the lab to collect physically.',
      hi: 'रिपोर्ट्स 24-48 घंटों के भीतर WhatsApp पर भेज दी जाती हैं। आप लैब आकर भी ले सकते हैं।'
    },
    'payment': {
      en: 'We accept Cash, UPI (GPay, PhonePe, Paytm), and major Credit/Debit cards.',
      hi: 'हम नकद, UPI (GPay, PhonePe, Paytm), और प्रमुख क्रेडिट/डेबिट कार्ड स्वीकार करते हैं।'
    },
    'booking': {
      en: 'To book a test, you can call us at +91-6396786939, WhatsApp us, or book directly through this app.',
      hi: 'टेस्ट बुक करने के लिए, आप हमें +91-6396786939 पर कॉल कर सकते हैं, WhatsApp कर सकते हैं, या सीधे इस ऐप के माध्यम से बुक कर सकते हैं।'
    },
    'nabl': {
      en: 'Yes, Sana Pathology is a NABL-accredited lab ensuring the highest quality standards.',
      hi: 'हाँ, साना पैथोलॉजी एक NABL-मान्यता प्राप्त लैब है जो उच्चतम गुणवत्ता मानकों को सुनिश्चित करती है।'
    },
    'discount': {
      en: 'We have regular discounts and packages. Use coupon code FIRST50 for ₹50 off your first booking.',
      hi: 'हमारे पास नियमित छूट और पैकेज हैं। पहली बुकिंग पर ₹50 छूट के लिए coupon code FIRST50 का उपयोग करें।'
    }
  }
};

module.exports = { KNOWLEDGE_BASE };
