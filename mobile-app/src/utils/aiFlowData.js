export const QUESTION_FLOW = {
  start: {
    id: "start",
    question: {
      en: "Hello! I am your lab assistant. What is your main problem today?",
      hi: "नमस्ते! मैं आपका लैब सहायक हूँ। आज आपकी मुख्य समस्या क्या है?"
    },
    question_hint: {
      en: "Select the option that best describes your complaint",
      hi: "अपनी समस्या का वर्णन करने वाला विकल्प चुनें"
    },
    options: [
      { label: { en: "Fever", hi: "बुखार" }, next_node: "fever_duration" },
      { label: { en: "Weakness or tiredness", hi: "कमजोरी या थकान" }, next_node: "weakness_detail" },
      { label: { en: "Joint pain or swelling", hi: "जोड़ों में दर्द या सूजन" }, next_node: "joint_type" },
      { label: { en: "Stomach or liver problem", hi: "पेट या लीवर की समस्या" }, next_node: "liver_type" },
      { label: { en: "Urinary problem", hi: "पेशाब की समस्या" }, next_node: "urine_type" },
      { label: { en: "Thyroid or weight change", hi: "थायराइड या वजन में बदलाव" }, next_node: "thyroid_type" },
      { label: { en: "Diabetes checkup", hi: "मधुमेह (शुगर) की जांच" }, next_node: "diabetes_type" },
      { label: { en: "Heart or chest pain", hi: "हृदय या छाती में दर्द" }, next_node: "heart_type" },
      { label: { en: "Cough for weeks or TB concern", hi: "हफ़्तों से खाँसी या टीबी की चिंता" }, next_node: "tb_detail" },
      { label: { en: "Pregnancy or antenatal checkup", hi: "गर्भावस्था या प्रसव पूर्व जाँच" }, next_node: "pregnancy_detail" },
      { label: { en: "Male fertility concern", hi: "पुरुष प्रजनन क्षमता की चिंता" }, next_node: "fertility_detail" },
      { label: { en: "Skin or allergy problem", hi: "त्वचा या एलर्जी की समस्या" }, next_node: "skin_type" },
      { label: { en: "Routine full body checkup", hi: "नियमित फुल बॉडी चेकअप" }, next_node: "checkup_age" },
      { label: { en: "Bone or calcium problem", hi: "हड्डी या कैल्शियम की समस्या" }, next_node: "bone_type" },
      { label: { en: "High blood pressure (BP)", hi: "उच्च रक्तचाप (बीपी)" }, next_node: "bp_detail" }
    ]
  },

  fever_duration: {
    id: "fever_duration",
    question: {
      en: "How long have you had the fever?",
      hi: "आपको बुखार कितने दिनों से है?"
    },
    options: [
      { label: { en: "Less than 3 days", hi: "3 दिन से कम" }, next_node: "fever_symptom_early" },
      { label: { en: "3 to 7 days", hi: "3 से 7 दिन" }, next_node: "fever_symptom_mid" },
      { label: { en: "More than 7 days", hi: "7 दिन से अधिक" }, next_node: "fever_symptom_long" }
    ]
  },

  fever_symptom_early: {
    id: "fever_symptom_early",
    question: {
      en: "Along with fever do you have any of these symptoms?",
      hi: "बुखार के साथ क्या आपको इनमें से कोई लक्षण है?"
    },
    options: [
      { label: { en: "Chills and shivering", hi: "ठंड लगना और कंपकंपी" }, next_node: "fever_travel" },
      { label: { en: "Body rash or red spots", hi: "शरीर पर लाल चकत्ते या धब्बे" }, next_node: "result", result_key: "fever_joint_rash" },
      { label: { en: "Severe headache and eye pain", hi: "तेज सिरदर्द और आँखों में दर्द" }, next_node: "result", result_key: "fever_dengue_early" },
      { label: { en: "Just high fever, no other symptom", hi: "केवल तेज बुखार, कोई अन्य लक्षण नहीं" }, next_node: "result", result_key: "fever_short" }
    ]
  },

  fever_symptom_mid: {
    id: "fever_symptom_mid",
    question: {
      en: "Which symptoms do you have with the fever?",
      hi: "बुखार के साथ आपको कौन से लक्षण हैं?"
    },
    options: [
      { label: { en: "Joint pain and rash", hi: "जोड़ों का दर्द और चकत्ते" }, next_node: "result", result_key: "fever_joint_rash" },
      { label: { en: "Chills and shivering", hi: "ठंड लगना और कंपकंपी" }, next_node: "fever_travel" },
      { label: { en: "Loose stools or stomach pain", hi: "दस्त या पेट में दर्द" }, next_node: "result", result_key: "fever_typhoid_early" },
      { label: { en: "No specific other symptom", hi: "कोई अन्य विशिष्ट लक्षण नहीं" }, next_node: "result", result_key: "fever_short" }
    ]
  },

  fever_symptom_long: {
    id: "fever_symptom_long",
    question: {
      en: "With prolonged fever, what other symptoms are present?",
      hi: "लंबे समय से बुखार के साथ, कौन से अन्य लक्षण मौजूद हैं?"
    },
    options: [
      { label: { en: "Stomach pain, loose stools, weakness", hi: "पेट में दर्द, दस्त, कमजोरी" }, next_node: "result", result_key: "fever_typhoid_confirmed" },
      { label: { en: "Night sweats and weight loss", hi: "रात में पसीना आना और वजन कम होना" }, next_node: "result", result_key: "fever_tb_suspicion" },
      { label: { en: "Yellow eyes or dark urine", hi: "पीली आँखें या गहरा पेशाब" }, next_node: "result", result_key: "fever_liver_involvement" },
      { label: { en: "General weakness, no specific symptom", hi: "सामान्य कमजोरी, कोई विशिष्ट लक्षण नहीं" }, next_node: "result", result_key: "fever_long" }
    ]
  },

  fever_travel: {
    id: "fever_travel",
    question: {
      en: "Have you recently travelled to a different area or village?",
      hi: "क्या आपने हाल ही में किसी अन्य क्षेत्र या गाँव की यात्रा की है?"
    },
    options: [
      { label: { en: "Yes, recently travelled", hi: "हाँ, हाल ही में यात्रा की है" }, next_node: "result", result_key: "fever_malaria_travel" },
      { label: { en: "No, stayed at home", hi: "नहीं, घर पर ही थे" }, next_node: "result", result_key: "fever_chills_local" }
    ]
  },

  weakness_detail: {
    id: "weakness_detail",
    question: {
      en: "What kind of weakness do you feel?",
      hi: "आप किस तरह की कमजोरी महसूस करते हैं?"
    },
    options: [
      { label: { en: "Pale skin, breathlessness, dizziness", hi: "पीली त्वचा, सांस फूलना, चक्कर आना" }, next_node: "weakness_gender" },
      { label: { en: "Fatigue with weight gain or cold feeling", hi: "वजन बढ़ने या ठंड लगने के साथ थकान" }, next_node: "result", result_key: "weakness_thyroid" },
      { label: { en: "General tiredness with no energy", hi: "ऊर्जा की कमी के साथ सामान्य थकान" }, next_node: "weakness_history" },
      { label: { en: "Weakness with frequent urination or thirst", hi: "बार-बार पेशाब आने या प्यास लगने के साथ कमजोरी" }, next_node: "result", result_key: "weakness_diabetes" }
    ]
  },

  weakness_gender: {
    id: "weakness_gender",
    question: {
      en: "What is the patient's gender?",
      hi: "मरीज का लिंग क्या है?"
    },
    options: [
      { label: { en: "Female", hi: "महिला" }, next_node: "weakness_female_age" },
      { label: { en: "Male", hi: "पुरुष" }, next_node: "result", result_key: "anemia_general" }
    ]
  },

  weakness_female_age: {
    id: "weakness_female_age",
    question: {
      en: "What is the patient's age?",
      hi: "मरीज की उम्र क्या है?"
    },
    options: [
      { label: { en: "Below 45 years (reproductive age)", hi: "45 वर्ष से कम (प्रजनन आयु)" }, next_node: "result", result_key: "anemia_female" },
      { label: { en: "45 years or above", hi: "45 वर्ष या उससे अधिक" }, next_node: "result", result_key: "anemia_general" }
    ]
  },

  weakness_history: {
    id: "weakness_history",
    question: {
      en: "Do you have any known medical condition?",
      hi: "क्या आपको पहले से कोई बीमारी है?"
    },
    options: [
      { label: { en: "Diabetes", hi: "मधुमेह (शुगर)" }, next_node: "result", result_key: "weakness_diabetic" },
      { label: { en: "Kidney disease", hi: "गुर्दे (किडनी) की बीमारी" }, next_node: "result", result_key: "weakness_kidney" },
      { label: { en: "No known condition", hi: "कोई बीमारी नहीं है" }, next_node: "result", result_key: "anemia_general" }
    ]
  },

  joint_type: {
    id: "joint_type",
    question: {
      en: "Which joints are affected and how does the pain feel?",
      hi: "कौन से जोड़ प्रभावित हैं और दर्द कैसा महसूस होता है?"
    },
    options: [
      { label: { en: "Small joints (fingers, wrists) — stiff in morning", hi: "छोटे जोड़ (उंगलियां, कलाई) — सुबह में अकड़न" }, next_node: "joint_ra_confirm" },
      { label: { en: "Big toe or ankle — sudden severe pain", hi: "पैर का अंगूठा या टखना — अचानक तेज दर्द" }, next_node: "result", result_key: "joint_gout" },
      { label: { en: "Knee or hip — pain with movement", hi: "घुटना या कूल्हा — हिलने-डुलने पर दर्द" }, next_node: "joint_knee_age" },
      { label: { en: "Many joints with fever", hi: "बुखार के साथ कई जोड़ों में दर्द" }, next_node: "result", result_key: "joint_fever_viral" },
      { label: { en: "Back pain or spine stiffness", hi: "पीठ दर्द या रीढ़ की हड्डी में अकड़न" }, next_node: "result", result_key: "joint_back_pain" }
    ]
  },

  joint_ra_confirm: {
    id: "joint_ra_confirm",
    question: {
      en: "How long has the morning stiffness been going on?",
      hi: "सुबह की अकड़न कितने समय से चल रही है?"
    },
    options: [
      { label: { en: "More than 6 weeks", hi: "6 सप्ताह से अधिक" }, next_node: "result", result_key: "joint_ra_confirmed" },
      { label: { en: "Less than 6 weeks", hi: "6 सप्ताह से कम" }, next_node: "result", result_key: "joint_ra_early" }
    ]
  },

  joint_knee_age: {
    id: "joint_knee_age",
    question: {
      en: "What is the patient's age?",
      hi: "मरीज की उम्र क्या है?"
    },
    options: [
      { label: { en: "Below 40 years", hi: "40 वर्ष से कम" }, next_node: "result", result_key: "joint_young_knee" },
      { label: { en: "40 years or above", hi: "40 वर्ष या उससे अधिक" }, next_node: "result", result_key: "joint_osteo" }
    ]
  },

  liver_type: {
    id: "liver_type",
    question: {
      en: "What is your main liver or stomach symptom?",
      hi: "आपका मुख्य लीवर या पेट का लक्षण क्या है?"
    },
    options: [
      { label: { en: "Yellow eyes or yellow skin (jaundice)", hi: "पीली आँखें या पीली त्वचा (पीलिया)" }, next_node: "jaundice_duration" },
      { label: { en: "Right side stomach pain", hi: "पेट के दाहिनी ओर दर्द" }, next_node: "result", result_key: "liver_pain" },
      { label: { en: "Nausea, vomiting, loss of appetite", hi: "मतली, उल्टी, भूख न लगना" }, next_node: "result", result_key: "liver_nausea" },
      { label: { en: "Alcohol use, fatty liver concern", hi: "शराब का सेवन, फैटी लीवर की चिंता" }, next_node: "result", result_key: "fatty_liver" },
      { label: { en: "Swollen abdomen or fluid in belly", hi: "पेट में सूजन या पेट में पानी भरना (जलोदर)" }, next_node: "result", result_key: "liver_ascites" }
    ]
  },

  jaundice_duration: {
    id: "jaundice_duration",
    question: {
      en: "How long have the yellow eyes been present?",
      hi: "पीली आँखें कब से हैं?"
    },
    options: [
      { label: { en: "Just started (less than 5 days)", hi: "अभी शुरू हुआ है (5 दिन से कम)" }, next_node: "result", result_key: "jaundice_acute" },
      { label: { en: "More than a week", hi: "एक सप्ताह से अधिक" }, next_node: "jaundice_fever" }
    ]
  },

  jaundice_fever: {
    id: "jaundice_fever",
    question: {
      en: "Is there fever along with jaundice?",
      hi: "क्या पीलिया के साथ बुखार भी है?"
    },
    options: [
      { label: { en: "Yes, fever is also present", hi: "हाँ, बुखार भी है" }, next_node: "result", result_key: "jaundice_with_fever" },
      { label: { en: "No fever", hi: "बुखार नहीं है" }, next_node: "result", result_key: "jaundice_no_fever" }
    ]
  },

  urine_type: {
    id: "urine_type",
    question: {
      en: "What is your urinary complaint?",
      hi: "आपकी पेशाब से संबंधित क्या शिकायत है?"
    },
    options: [
      { label: { en: "Burning or pain while urinating", hi: "पेशाब के दौरान जलन या दर्द" }, next_node: "uti_gender" },
      { label: { en: "Swelling in face, hands or feet", hi: "चेहरे, हाथों या पैरों में सूजन" }, next_node: "result", result_key: "kidney_edema" },
      { label: { en: "Decreased urine output", hi: "पेशाब की मात्रा में कमी" }, next_node: "result", result_key: "kidney_failure" },
      { label: { en: "Frequent urination, especially at night", hi: "बार-बार पेशाब आना, खासकर रात में" }, next_node: "urine_freq_detail" },
      { label: { en: "Blood in urine", hi: "पेशाब में खून आना" }, next_node: "result", result_key: "hematuria" },
      { label: { en: "Foamy or frothy urine", hi: "पेशाब में झाग आना" }, next_node: "result", result_key: "proteinuria" }
    ]
  },

  uti_gender: {
    id: "uti_gender",
    question: {
      en: "What is the patient's gender?",
      hi: "मरीज का लिंग क्या है?"
    },
    options: [
      { label: { en: "Female", hi: "महिला" }, next_node: "uti_pregnancy" },
      { label: { en: "Male", hi: "पुरुष" }, next_node: "result", result_key: "uti_male" }
    ]
  },

  uti_pregnancy: {
    id: "uti_pregnancy",
    question: {
      en: "Is the patient pregnant?",
      hi: "क्या मरीज गर्भवती हैं?"
    },
    options: [
      { label: { en: "Yes, pregnant", hi: "हाँ, गर्भवती हैं" }, next_node: "result", result_key: "uti_pregnant" },
      { label: { en: "No", hi: "नहीं" }, next_node: "result", result_key: "uti_female" }
    ]
  },

  urine_freq_detail: {
    id: "urine_freq_detail",
    question: {
      en: "Do you also have increased thirst or unexplained weight loss?",
      hi: "क्या आपको बहुत अधिक प्यास लगना या अचानक वजन कम होना भी है?"
    },
    options: [
      { label: { en: "Yes, very thirsty and frequent urination", hi: "हाँ, बहुत प्यास और बार-बार पेशाब" }, next_node: "result", result_key: "diabetes_new" },
      { label: { en: "No, just frequent urination", hi: "नहीं, केवल बार-बार पेशाब आना" }, next_node: "result", result_key: "uti_female" }
    ]
  },

  thyroid_type: {
    id: "thyroid_type",
    question: {
      en: "Which symptoms do you have?",
      hi: "आपको कौन से लक्षण हैं?"
    },
    options: [
      { label: { en: "Weight gain, fatigue, feeling cold, dry skin", hi: "वजन बढ़ना, थकान, ठंड लगना, सूखी त्वचा" }, next_node: "thyroid_hypo_gender" },
      { label: { en: "Weight loss, anxiety, palpitations, sweating", hi: "वजन कम होना, घबराहट, दिल धड़कना, पसीना आना" }, next_node: "result", result_key: "thyroid_hyper" },
      { label: { en: "Swelling or lump in neck", hi: "गर्दन में सूजन या गांठ" }, next_node: "result", result_key: "thyroid_goiter" },
      { label: { en: "Irregular periods or hair fall (female)", hi: "अनियमित मासिक धर्म या बालों का झड़ना (महिला)" }, next_node: "result", result_key: "thyroid_female" },
      { label: { en: "Already on thyroid medicine — monitoring", hi: "पहले से थायराइड की दवा पर हैं — निगरानी के लिए" }, next_node: "result", result_key: "thyroid_monitor" }
    ]
  },

  thyroid_hypo_gender: {
    id: "thyroid_hypo_gender",
    question: {
      en: "What is the patient's gender?",
      hi: "मरीज का लिंग क्या है?"
    },
    options: [
      { label: { en: "Female", hi: "महिला" }, next_node: "thyroid_hypo_female_age" },
      { label: { en: "Male", hi: "पुरुष" }, next_node: "result", result_key: "thyroid_hypo" }
    ]
  },

  thyroid_hypo_female_age: {
    id: "thyroid_hypo_female_age",
    question: {
      en: "What is the patient's age?",
      hi: "मरीज की उम्र क्या है?"
    },
    options: [
      { label: { en: "Reproductive age (15–45 years)", hi: "प्रजनन आयु (15-45 वर्ष)" }, next_node: "result", result_key: "thyroid_hypo_female_repro" },
      { label: { en: "Above 45 years", hi: "45 वर्ष से अधिक" }, next_node: "result", result_key: "thyroid_hypo" }
    ]
  },

  diabetes_type: {
    id: "diabetes_type",
    question: {
      en: "Are you already diagnosed with diabetes?",
      hi: "क्या आपको पहले से ही मधुमेह (शुगर) है?"
    },
    options: [
      { label: { en: "No — I want to check for the first time", hi: "नहीं — मैं पहली बार जांच करना चाहता हूँ" }, next_node: "diabetes_symptom" },
      { label: { en: "Yes — routine monitoring", hi: "हाँ — नियमित निगरानी के लिए" }, next_node: "diabetes_complication" },
      { label: { en: "Yes — I have a new complaint", hi: "हाँ — मुझे एक नई शिकायत है" }, next_node: "diabetes_new_complaint" }
    ]
  },

  diabetes_symptom: {
    id: "diabetes_symptom",
    question: {
      en: "Do you have any of these symptoms?",
      hi: "क्या आपको इनमें से कोई लक्षण हैं?"
    },
    options: [
      { label: { en: "Excessive thirst, frequent urination, weight loss", hi: "अत्यधिक प्यास, बार-बार पेशाब, वजन कम होना" }, next_node: "result", result_key: "diabetes_new_symptomatic" },
      { label: { en: "No symptoms — family history or screening", hi: "कोई लक्षण नहीं — पारिवारिक इतिहास या सामान्य स्क्रीनिंग" }, next_node: "result", result_key: "diabetes_screening" }
    ]
  },

  diabetes_complication: {
    id: "diabetes_complication",
    question: {
      en: "Any specific concern during monitoring?",
      hi: "निगरानी के दौरान कोई विशिष्ट चिंता?"
    },
    options: [
      { label: { en: "Routine 3-month checkup", hi: "नियमित 3-महीने की जांच" }, next_node: "result", result_key: "diabetes_monitor" },
      { label: { en: "Leg swelling or decreased urine", hi: "पैरों में सूजन या पेशाब कम आना" }, next_node: "result", result_key: "diabetes_kidney" },
      { label: { en: "Eye problem or numbness in feet", hi: "आँखों की समस्या या पैरों में सुन्नता" }, next_node: "result", result_key: "diabetes_neuropathy" },
      { label: { en: "Chest pain or breathlessness", hi: "छाती में दर्द या सांस फूलना" }, next_node: "result", result_key: "diabetes_cardiac" }
    ]
  },

  diabetes_new_complaint: {
    id: "diabetes_new_complaint",
    question: {
      en: "What new complaint do you have?",
      hi: "आपको क्या नई शिकायत है?"
    },
    options: [
      { label: { en: "Wound not healing / foot infection", hi: "घाव का न भरना / पैर का संक्रमण" }, next_node: "result", result_key: "diabetes_wound" },
      { label: { en: "Fever or infection", hi: "बुखार या संक्रमण" }, next_node: "result", result_key: "diabetes_fever" },
      { label: { en: "Weakness or dizziness", hi: "कमजोरी या चक्कर आना" }, next_node: "result", result_key: "diabetes_weakness" }
    ]
  },

  heart_type: {
    id: "heart_type",
    question: {
      en: "What is your main heart or chest symptom?",
      hi: "आपकी मुख्य हृदय या छाती से संबंधित समस्या क्या है?"
    },
    options: [
      { label: { en: "Chest pain or tightness", hi: "छाती में दर्द या भारीपन" }, next_node: "chest_pain_detail" },
      { label: { en: "Breathlessness on mild activity", hi: "हल्की गतिविधि पर सांस फूलना" }, next_node: "result", result_key: "heart_failure_screen" },
      { label: { en: "High cholesterol, no symptoms", hi: "उच्च कोलेस्ट्रॉल, कोई लक्षण नहीं" }, next_node: "result", result_key: "lipid_screening" },
      { label: { en: "Palpitations or irregular heartbeat", hi: "दिल की धड़कन तेज होना या अनियमित होना" }, next_node: "result", result_key: "palpitation_screen" },
      { label: { en: "Family history of heart attack — prevention", hi: "दिल के दौरे का पारिवारिक इतिहास — रोकथाम" }, next_node: "result", result_key: "cardiac_prevention" }
    ]
  },

  chest_pain_detail: {
    id: "chest_pain_detail",
    question: {
      en: "How is the chest pain?",
      hi: "छाती का दर्द कैसा है?"
    },
    options: [
      { label: { en: "Severe, spreading to arm or jaw — urgent", hi: "तेज दर्द, हाथ या जबड़े तक फैलना — आपातकालीन" }, next_node: "result", result_key: "heart_attack_urgent" },
      { label: { en: "Mild to moderate, comes and goes", hi: "हल्का से मध्यम दर्द, आता और जाता रहता है" }, next_node: "result", result_key: "heart_angina" }
    ]
  },

  tb_detail: {
    id: "tb_detail",
    question: {
      en: "Which symptoms do you have?",
      hi: "आपको कौन से लक्षण हैं?"
    },
    options: [
      { label: { en: "Cough for more than 2 weeks", hi: "2 सप्ताह से अधिक समय से खाँसी" }, next_node: "tb_blood_cough" },
      { label: { en: "Night sweats and unexplained weight loss", hi: "रात में पसीना आना और अचानक वजन कम होना" }, next_node: "result", result_key: "tb_high_suspicion" },
      { label: { en: "Close contact with a TB patient", hi: "किसी टीबी रोगी के करीबी संपर्क में होना" }, next_node: "result", result_key: "tb_contact" },
      { label: { en: "All of the above", hi: "उपरोक्त सभी" }, next_node: "result", result_key: "tb_high_suspicion" }
    ]
  },

  tb_blood_cough: {
    id: "tb_blood_cough",
    question: {
      en: "Is there blood in the cough or sputum?",
      hi: "क्या खाँसी या बलगम में खून आता है?"
    },
    options: [
      { label: { en: "Yes, blood in cough", hi: "हाँ, खाँसी में खून आता है" }, next_node: "result", result_key: "tb_hemoptysis" },
      { label: { en: "No blood", hi: "कोई खून नहीं" }, next_node: "result", result_key: "tb_screen" }
    ]
  },

  pregnancy_detail: {
    id: "pregnancy_detail",
    question: {
      en: "How many months pregnant are you?",
      hi: "आप कितने महीने की गर्भवती हैं?"
    },
    options: [
      { label: { en: "First trimester (1–3 months)", hi: "पहली तिमाही (1-3 महीने)" }, next_node: "result", result_key: "pregnancy_first_trimester" },
      { label: { en: "Second trimester (4–6 months)", hi: "दूसरी तिमाही (4-6 महीने)" }, next_node: "result", result_key: "pregnancy_second_trimester" },
      { label: { en: "Third trimester (7–9 months)", hi: "तीसरी तिमाही (7-9 महीने)" }, next_node: "result", result_key: "pregnancy_third_trimester" },
      { label: { en: "Just confirmed pregnancy", hi: "अभी-अभी गर्भावस्था की पुष्टि हुई है" }, next_node: "result", result_key: "pregnancy_first_trimester" }
    ]
  },

  fertility_detail: {
    id: "fertility_detail",
    question: {
      en: "How long have you been trying to conceive?",
      hi: "आप कब से गर्भधारण का प्रयास कर रहे हैं?"
    },
    options: [
      { label: { en: "Less than 1 year", hi: "1 वर्ष से कम" }, next_node: "result", result_key: "fertility_basic" },
      { label: { en: "More than 1 year", hi: "1 वर्ष से अधिक" }, next_node: "result", result_key: "fertility_detailed" }
    ]
  },

  skin_type: {
    id: "skin_type",
    question: {
      en: "What is your skin problem?",
      hi: "आपकी त्वचा की क्या समस्या है?"
    },
    options: [
      { label: { en: "Itching all over body", hi: "पूरे शरीर पर खुजली" }, next_node: "result", result_key: "skin_allergy" },
      { label: { en: "Rash with fever", hi: "बुखार के साथ चकत्ते" }, next_node: "result", result_key: "fever_joint_rash" },
      { label: { en: "Dry and rough skin, hair fall", hi: "सूखी और खुरदरी त्वचा, बाल झड़ना" }, next_node: "result", result_key: "skin_thyroid" },
      { label: { en: "Yellowing of skin", hi: "त्वचा का पीला पड़ना" }, next_node: "result", result_key: "jaundice_acute" }
    ]
  },

  checkup_age: {
    id: "checkup_age",
    question: {
      en: "What is the patient's age group?",
      hi: "मरीज का आयु वर्ग क्या है?"
    },
    options: [
      { label: { en: "Below 30 years", hi: "30 वर्ष से कम" }, next_node: "result", result_key: "checkup_young" },
      { label: { en: "30 to 45 years", hi: "30 से 45 वर्ष" }, next_node: "checkup_gender" },
      { label: { en: "45 to 60 years", hi: "45 से 60 वर्ष" }, next_node: "result", result_key: "checkup_middle_age" },
      { label: { en: "Above 60 years", hi: "60 वर्ष से अधिक" }, next_node: "result", result_key: "checkup_senior" }
    ]
  },

  checkup_gender: {
    id: "checkup_gender",
    question: {
      en: "What is the patient's gender?",
      hi: "मरीज का लिंग क्या है?"
    },
    options: [
      { label: { en: "Female", hi: "महिला" }, next_node: "result", result_key: "checkup_female_30_45" },
      { label: { en: "Male", hi: "पुरुष" }, next_node: "result", result_key: "checkup_male_30_45" }
    ]
  },

  bone_type: {
    id: "bone_type",
    question: {
      en: "What is your bone or calcium concern?",
      hi: "आपकी हड्डी या कैल्शियम से संबंधित क्या चिंता है?"
    },
    options: [
      { label: { en: "Bone pain or fracture risk", hi: "हड्डियों में दर्द या फ्रैक्चर का खतरा" }, next_node: "result", result_key: "bone_pain" },
      { label: { en: "Muscle cramps or weakness", hi: "मांसपेशियों में ऐंठन या कमजोरी" }, next_node: "result", result_key: "calcium_deficiency" },
      { label: { en: "Numbness or tingling in hands/feet", hi: "हाथ/पैर में सुन्नता या झुनझुनी" }, next_node: "result", result_key: "calcium_neuro" }
    ]
  },

  bp_detail: {
    id: "bp_detail",
    question: {
      en: "Is the high blood pressure already diagnosed?",
      hi: "क्या उच्च रक्तचाप (बीपी) की बीमारी पहले से ही है?"
    },
    options: [
      { label: { en: "Yes — monitoring and checkup", hi: "हाँ — निगरानी और जांच" }, next_node: "result", result_key: "bp_monitor" },
      { label: { en: "No — first check, headache and dizziness", hi: "नहीं — पहली बार जांच, सिरदर्द और चक्कर" }, next_node: "result", result_key: "bp_new" }
    ]
  }
};

export const TEST_RECOMMENDATIONS = {
  fever_short: {
    label: { en: "Fever — less than 3 days", hi: "बुखार — 3 दिन से कम" },
    summary: {
      en: "Early fever screening. Recommended to rule out dengue, malaria, and bacterial infections.",
      hi: "प्रारंभिक बुखार की स्क्रीनिंग। डेंगू, मलेरिया और जीवाणु संक्रमण को खारिज करने की सिफारिश की जाती है।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Detects infection type, checks platelet drop", hi: "संक्रमण के प्रकार का पता लगाता है, प्लेटलेट काउंट की जाँच करता है" } },
      { test_code: "MP-MICRO", reason: { en: "Quick malaria rule-out by microscopy", hi: "माइक्रोस्कोपी द्वारा त्वरित मलेरिया की जाँच" } },
      { test_code: "MP", reason: { en: "Malaria antigen ELISA confirmation", hi: "मलेरिया एंटीजन एलिसा पुष्टि" } },
      { test_code: "DENGUE-01", reason: { en: "NS1 antigen is highly active in the first 5 days", hi: "NS1 एंटीजन पहले 5 दिनों में अत्यधिक सक्रिय होता है" } }
    ],
    recommended: [
      { test_code: "CRP-QUANT-01", reason: { en: "Measures severity of bacterial infection", hi: "जीवाणु संक्रमण की गंभीरता को मापता है" } }
    ],
    optional: [
      { test_code: "ESR-01", reason: { en: "General inflammation marker", hi: "सामान्य सूजन का संकेतक" } }
    ],
    ai_note: {
      en: "NS1 in dengue is most useful in the first 5 days. If fever continues beyond 7 days, typhoid tests should be added.",
      hi: "डेंगू में NS1 पहले 5 दिनों में सबसे उपयोगी है। यदि बुखार 7 दिनों से अधिक समय तक रहता है, तो टाइफाइड परीक्षण जोड़े जाने चाहिए।"
    }
  },

  fever_dengue_early: {
    label: { en: "Fever with severe headache and eye pain — Dengue suspected", hi: "तेज सिरदर्द और आँखों में दर्द के साथ बुखार — डेंगू का संदेह" },
    summary: {
      en: "Classic dengue presentation with retro-orbital pain and headache.",
      hi: "आँखों के पीछे दर्द और सिरदर्द के साथ क्लासिक डेंगू के लक्षण।"
    },
    must_do: [
      { test_code: "DENGUE-01", reason: { en: "Dengue profile (NS1 + IgM + IgG)", hi: "डेंगू प्रोफाइल (NS1 + IgM + IgG)" } },
      { test_code: "CBC", reason: { en: "Monitor platelet and WBC count daily in suspected dengue", hi: "संदिग्ध डेंगू में रोजाना प्लेटलेट और डब्ल्यूबीसी की निगरानी करें" } },
      { test_code: "015", reason: { en: "Platelet count — critical monitoring", hi: "प्लेटलेट काउंट — महत्वपूर्ण निगरानी" } }
    ],
    recommended: [
      { test_code: "CRP-QUANT-01", reason: { en: "Inflammation severity marker", hi: "सूजन की गंभीरता का संकेतक" } }
    ],
    optional: [
      { test_code: "MP-MICRO", reason: { en: "Rule out co-infection with malaria", hi: "मलेरिया के सह-संक्रमण को खारिज करने के लिए" } }
    ],
    ai_note: {
      en: "Platelets must be monitored daily if dengue is confirmed. Below 50,000 is considered a danger level.",
      hi: "डेंगू की पुष्टि होने पर प्लेटलेट्स की रोजाना निगरानी की जानी चाहिए। 50,000 से नीचे खतरे का स्तर माना जाता है।"
    }
  },

  fever_joint_rash: {
    label: { en: "Fever with joint pain and rash", hi: "बुखार के साथ जोड़ों में दर्द और चकत्ते" },
    summary: {
      en: "Highly suggestive of dengue or viral arthritis. NS1 is key in the early stage.",
      hi: "डेंगू या वायरल गठिया का अत्यधिक संकेत। शुरुआती चरण में NS1 महत्वपूर्ण है।"
    },
    must_do: [
      { test_code: "DENGUE-01", reason: { en: "Fever, rash, joint pain profile", hi: "बुखार, चकत्ते, जोड़ों के दर्द की प्रोफाइल" } },
      { test_code: "CBC", reason: { en: "Check WBC and platelet drop in dengue", hi: "डेंगू में डब्ल्यूबीसी और प्लेटलेट में गिरावट की जाँच" } },
      { test_code: "015", reason: { en: "Platelet monitoring", hi: "प्लेटलेट की निगरानी" } }
    ],
    recommended: [
      { test_code: "CRP-QUANT-01", reason: { en: "Inflammation marker", hi: "सूजन का संकेतक" } },
      { test_code: "MP-MICRO", reason: { en: "Rule out malaria", hi: "मलेरिया को खारिज करने के लिए" } }
    ],
    optional: [
      { test_code: "WIDAL1", reason: { en: "If fever exceeds 7 days, check for typhoid", hi: "यदि बुखार 7 दिनों से अधिक हो, तो टाइफाइड की जाँच करें" } }
    ],
    ai_note: {
      en: "Do not recommend Widal if fever is under 7 days — it will be falsely negative.",
      hi: "यदि बुखार 7 दिन से कम का हो तो विडाल की सिफारिश न करें — यह गलत तरीके से नकारात्मक आएगा।"
    }
  },

  fever_malaria_travel: {
    label: { en: "Fever with chills after recent travel — Malaria suspected", hi: "हाल की यात्रा के बाद ठंड के साथ बुखार — मलेरिया का संदेह" },
    summary: {
      en: "Travel history + chills = high malaria probability. Test immediately.",
      hi: "यात्रा का इतिहास + ठंड लगना = मलेरिया की उच्च संभावना। तुरंत परीक्षण करें।"
    },
    must_do: [
      { test_code: "MP-MICRO", reason: { en: "Microscopy is the gold standard for malaria detection", hi: "मलेरिया का पता लगाने के लिए माइक्रोस्कोपी सबसे उत्तम माध्यम है" } },
      { test_code: "MP", reason: { en: "Rapid antigen test for confirmation", hi: "पुष्टि के लिए रैपिड एंटीजन परीक्षण" } },
      { test_code: "CBC", reason: { en: "Check WBC and platelet counts", hi: "डब्ल्यूबीसी और प्लेटलेट काउंट की जाँच करें" } }
    ],
    recommended: [
      { test_code: "LFT", reason: { en: "Malaria can cause liver damage or dysfunction", hi: "मलेरिया लीवर की क्षति या शिथिलता का कारण बन सकता है" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Assess severity of infection", hi: "संक्रमण की गंभीरता का आकलन करें" } }
    ],
    optional: [
      { test_code: "KFT", reason: { en: "Severe malaria can affect kidney function", hi: "गंभीर मलेरिया गुर्दे के कार्य को प्रभावित कर सकता है" } },
      { test_code: "BILIRUBIN-TOTAL-01", reason: { en: "Check for hemolytic jaundice from malaria", hi: "मलेरिया से होने वाले हेमोलिटिक पीलिया की जाँच करें" } }
    ],
    ai_note: {
      en: "If the patient has recently visited a malaria-endemic area, malaria testing is the first priority.",
      hi: "यदि मरीज ने हाल ही में मलेरिया-स्थानिक क्षेत्र का दौरा किया है, तो मलेरिया परीक्षण पहली प्राथमिकता है।"
    }
  },

  fever_chills_local: {
    label: { en: "Fever with chills — No travel history", hi: "ठंड के साथ बुखार — कोई यात्रा इतिहास नहीं" },
    summary: {
      en: "Rule out malaria and bacterial sepsis even without travel history.",
      hi: "बिना यात्रा इतिहास के भी मलेरिया और जीवाणु सेप्सिस को खारिज करने की जांच।"
    },
    must_do: [
      { test_code: "MP-MICRO", reason: { en: "Malaria can occur locally", hi: "मलेरिया स्थानीय स्तर पर भी हो सकता है" } },
      { test_code: "MP", reason: { en: "Antigen confirmation test", hi: "एंटीजन पुष्टि परीक्षण" } },
      { test_code: "CBC", reason: { en: "Differentiate viral vs bacterial infection", hi: "वायरल बनाम बैक्टीरियल संक्रमण में अंतर करने के लिए" } }
    ],
    recommended: [
      { test_code: "CRP-QUANT-01", reason: { en: "Bacterial infection severity", hi: "जीवाणु संक्रमण की गंभीरता" } },
      { test_code: "LFT", reason: { en: "Liver involvement check", hi: "लीवर की संलिप्तता की जाँच" } }
    ],
    optional: [
      { test_code: "DENGUE-01", reason: { en: "Rule out dengue", hi: "डेंगू को खारिज करने के लिए" } }
    ]
  },

  fever_typhoid_early: {
    label: { en: "Fever 3-7 days with stomach symptoms — Early Typhoid", hi: "पेट के लक्षणों के साथ 3-7 दिनों का बुखार — शुरुआती टाइफाइड" },
    summary: {
      en: "Typhoid antibodies rise after 5-7 days. Typhidot is more sensitive than Widal in early stages.",
      hi: "टाइफाइड एंटीबॉडी 5-7 दिनों के बाद बढ़ते हैं। शुरुआती चरणों में टाइफाइड विडाल की तुलना में अधिक संवेदनशील है।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Low WBC (leucopenia) is a classic sign of typhoid", hi: "कम डब्ल्यूबीसी (ल्यूकोपेनिया) टाइफाइड का एक क्लासिक संकेत है" } },
      { test_code: "TYPHIDOT-01", reason: { en: "More sensitive than Widal in early typhoid", hi: "शुरुआती टाइफाइड में विडाल की तुलना में अधिक संवेदनशील" } },
      { test_code: "MP-MICRO", reason: { en: "Rule out malaria", hi: "मलेरिया को खारिज करने के लिए" } }
    ],
    recommended: [
      { test_code: "LFT", reason: { en: "Typhoid can cause mild liver involvement", hi: "टाइफाइड हल्के लीवर संलिप्तता का कारण बन सकता है" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Infection severity", hi: "संक्रमण की गंभीरता" } }
    ],
    optional: [
      { test_code: "WIDAL1", reason: { en: "Can be done but may be early negative", hi: "किया जा सकता है लेकिन शुरू में नकारात्मक आ सकता है" } },
      { test_code: "URINE", reason: { en: "Rule out UTI", hi: "यूटीआई को खारिज करने के लिए" } }
    ],
    ai_note: {
      en: "Widal is only reliable after 7-10 days. Prefer Typhidot for early diagnosis.",
      hi: "विडाल 7-10 दिनों के बाद ही विश्वसनीय होता है। शुरुआती निदान के लिए टाइफीडॉट को प्राथमिकता दें।"
    }
  },

  fever_typhoid_confirmed: {
    label: { en: "Prolonged fever with stomach pain — Typhoid suspected", hi: "पेट दर्द के साथ लंबे समय तक बुखार — टाइफाइड का संदेह" },
    summary: {
      en: "After 7 days, typhoid antibodies are detectable. Both Widal and Typhidot are useful.",
      hi: "7 दिनों के बाद, टाइफाइड एंटीबॉडी का पता लगाया जा सकता है। विडाल और टाइफीडॉट दोनों उपयोगी हैं।"
    },
    must_do: [
      { test_code: "TYPHIDOT-01", reason: { en: "IgM positive indicates active typhoid", hi: "IgM पॉजिटिव सक्रिय टाइफाइड को इंगित करता है" } },
      { test_code: "WIDAL1", reason: { en: "Antibody titre rises after 7-10 days", hi: "7-10 दिनों के बाद एंटीबॉडी का स्तर बढ़ता है" } },
      { test_code: "CBC", reason: { en: "Low WBC count is typical in typhoid", hi: "कम डब्ल्यूबीसी काउंट टाइफाइड में सामान्य है" } },
      { test_code: "LFT", reason: { en: "Check for typhoid liver involvement", hi: "लीवर पर टाइफाइड के प्रभाव की जाँच" } }
    ],
    recommended: [
      { test_code: "CRP-QUANT-01", reason: { en: "Severity marker", hi: "गंभीरता का सूचक" } },
      { test_code: "URINE", reason: { en: "Typhoid can cause secondary UTI", hi: "टाइफाइड माध्यमिक यूटीआई का कारण बन सकता है" } }
    ],
    optional: [
      { test_code: "MP-MICRO", reason: { en: "Co-infection with malaria check", hi: "मलेरिया के साथ सह-संक्रमण की जाँच" } }
    ],
    ai_note: {
      en: "Widal titre of 1:80 or above is significant for typhoid diagnosis.",
      hi: "टाइफाइड के निदान के लिए विडाल का स्तर 1:80 या उससे अधिक होना महत्वपूर्ण है।"
    }
  },

  fever_long: {
    label: { en: "Prolonged fever over 7 days — General workup", hi: "7 दिनों से अधिक लंबा बुखार — सामान्य जाँच" },
    summary: {
      en: "Comprehensive panel to identify the cause of long-standing fever.",
      hi: "लंबे समय से चले आ रहे बुखार के कारण की पहचान करने के लिए व्यापक पैनल।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Complete blood picture", hi: "पूर्ण रक्त चित्र" } },
      { test_code: "TYPHIDOT-01", reason: { en: "Typhoid screening", hi: "टाइफाइड स्क्रीनिंग" } },
      { test_code: "WIDAL1", reason: { en: "Typhoid antibody titre", hi: "टाइफाइड एंटीबॉडी स्तर" } },
      { test_code: "MP", reason: { en: "Malaria antigen screen", hi: "मलेरिया एंटीजन स्क्रीन" } }
    ],
    recommended: [
      { test_code: "LFT", reason: { en: "Liver check", hi: "लीवर की जाँच" } },
      { test_code: "DENGUE-01", reason: { en: "IgM antibody check (positive from day 5 onwards)", hi: "IgM एंटीबॉडी की जाँच (दिन 5 के बाद पॉजिटिव)" } },
      { test_code: "URINE", reason: { en: "Rule out urinary tract infection", hi: "पेशाब नली के संक्रमण को खारिज करने के लिए" } },
      { test_code: "ESR-01", reason: { en: "Elevated in prolonged infections", hi: "लंबे समय तक रहने वाले संक्रमणों में बढ़ा हुआ" } }
    ],
    optional: [
      { test_code: "MANTOUX-01", reason: { en: "If TB suspected with prolonged fever", hi: "यदि लंबे बुखार के साथ टीबी का संदेह हो" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Active infection marker", hi: "सक्रिय संक्रमण संकेतक" } }
    ],
    ai_note: {
      en: "If all common infections are ruled out, consider TB as a cause of prolonged fever.",
      hi: "यदि सभी सामान्य संक्रमणों को खारिज कर दिया जाता है, तो लंबे बुखार के कारण के रूप में टीबी पर विचार करें।"
    }
  },

  fever_tb_suspicion: {
    label: { en: "Prolonged fever with night sweats — TB suspected", hi: "रात में पसीने के साथ लंबा बुखार — टीबी का संदेह" },
    summary: {
      en: "Classic Tuberculosis presentation. Mantoux and ESR are first-line screenings.",
      hi: "क्लासिक तपेदिक (टीबी) के लक्षण। मंटौक्स और ईएसआर पहली प्राथमिकता की जांच हैं।"
    },
    must_do: [
      { test_code: "MANTOUX-01", reason: { en: "TB skin test — key screening tool", hi: "टीबी त्वचा परीक्षण — मुख्य स्क्रीनिंग टूल" } },
      { test_code: "ESR-01", reason: { en: "Typically very elevated in tuberculosis", hi: "आमतौर पर टीबी में बहुत अधिक बढ़ा हुआ" } },
      { test_code: "CBC", reason: { en: "Lymphocytosis is common in TB", hi: "टीबी में लिम्फोसाइटोसिस सामान्य है" } }
    ],
    recommended: [
      { test_code: "LFT", reason: { en: "Baseline liver function before starting TB medications", hi: "टीबी की दवाएं शुरू करने से पहले आधारभूत लीवर फंक्शन" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Measures active inflammation", hi: "सक्रिय सूजन को मापता है" } }
    ],
    optional: [
      { test_code: "TYPHIDOT-01", reason: { en: "Rule out typhoid", hi: "टाइफाइड को खारिज करने के लिए" } },
      { test_code: "MP-MICRO", reason: { en: "Rule out malaria", hi: "मलेरिया को खारिज करने के लिए" } }
    ],
    ai_note: {
      en: "Mantoux positive (>10mm) strongly suggests TB exposure. LFT must be done before starting hepatotoxic anti-TB drugs.",
      hi: "मंटौक्स पॉजिटिव (>10mm) टीबी के संपर्क को दर्शाता है। एंटी-टीबी दवाएं शुरू करने से पहले एलएफटी किया जाना आवश्यक है।"
    }
  },

  fever_liver_involvement: {
    label: { en: "Prolonged fever with yellow eyes or dark urine", hi: "पीली आँखों या गहरे पेशाब के साथ लंबा बुखार" },
    summary: {
      en: "Systemic infection with liver involvement. Could be hepatitis, malaria, or typhoid.",
      hi: "लीवर की भागीदारी के साथ प्रणालीगत संक्रमण। हेपेटाइटिस, मलेरिया या टाइफाइड हो सकता है।"
    },
    must_do: [
      { test_code: "LFT", reason: { en: "Full liver panel is critical", hi: "पूर्ण लीवर पैनल बहुत महत्वपूर्ण है" } },
      { test_code: "BILIRUBIN-TOTAL-01", reason: { en: "Measure jaundice severity", hi: "पीलिया की गंभीरता को मापें" } },
      { test_code: "SGOT-SGPT", reason: { en: "Liver cell damage markers", hi: "लीवर कोशिकाओं की क्षति के संकेतक" } },
      { test_code: "CBC", reason: { en: "Complete blood count", hi: "रक्त गणना (सीबीसी)" } }
    ],
    recommended: [
      { test_code: "MP-MICRO", reason: { en: "Malaria can cause hemolytic jaundice", hi: "मलेरिया हेमोलिटिक पीलिया का कारण बन सकता है" } },
      { test_code: "TYPHIDOT-01", reason: { en: "Assess typhoid liver involvement", hi: "टाइफाइड लीवर संलिप्तता का आकलन करें" } },
      { test_code: "PT-01", reason: { en: "Check liver synthetic function (clotting time)", hi: "लीवर के सिंथेटिक कार्य (थक्के जमने के समय) की जाँच करें" } }
    ],
    optional: [
      { test_code: "URINE", reason: { en: "Bilirubin in urine check", hi: "पेशाब में बिलीरुबिन की जाँच" } },
      { test_code: "WIDAL1", reason: { en: "Rule out typhoid", hi: "टाइफाइड को खारिज करने के लिए" } }
    ],
    ai_note: {
      en: "If bilirubin is very high and PT is prolonged, the patient needs urgent medical attention.",
      hi: "यदि बिलीरुबिन बहुत अधिक है और पीटी (PT) बढ़ा हुआ है, तो रोगी को तत्काल चिकित्सा की आवश्यकता है।"
    }
  },

  anemia_general: {
    label: { en: "Anemia / General Weakness", hi: "एनीमिया / सामान्य कमजोरी" },
    summary: {
      en: "Basic anemia and general tiredness screening.",
      hi: "बुनियादी एनीमिया और सामान्य थकान स्क्रीनिंग।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "RBC indices indicate the type of anemia", hi: "आरबीसी सूचकांक एनीमिया के प्रकार को इंगित करते हैं" } },
      { test_code: "HB-01", reason: { en: "Direct hemoglobin measurement", hi: "सीधे हीमोग्लोबिन का मापन" } }
    ],
    recommended: [
      { test_code: "ESR-01", reason: { en: "Rule out chronic disease or infection", hi: "पुरानी बीमारी या संक्रमण को खारिज करने के लिए" } },
      { test_code: "TFT", reason: { en: "Hypothyroidism is a common cause of fatigue/anemia", hi: "हाइपोथायरायडिज्म थकान/एनीमिया का एक सामान्य कारण है" } }
    ],
    optional: [
      { test_code: "GLU-01", reason: { en: "Screen for diabetes-related fatigue", hi: "मधुमेह से संबंधित थकान की जाँच करें" } },
      { test_code: "CALCIUM-01", reason: { en: "Calcium deficiency causes muscle fatigue", hi: "कैल्शियम की कमी से मांसपेशियों में थकान होती है" } }
    ],
    ai_note: {
      en: "If Hemoglobin (Hb) is below 8 g/dL, consult a doctor immediately.",
      hi: "यदि हीमोग्लोबिन (Hb) 8 g/dL से कम है, तो तुरंत डॉक्टर से परामर्श लें।"
    }
  },

  anemia_female: {
    label: { en: "Anemia in Female (Reproductive Age) — Weakness", hi: "प्रजनन आयु की महिला में एनीमिया — कमजोरी" },
    summary: {
      en: "Iron deficiency anemia is highly prevalent in reproductive-age females.",
      hi: "प्रजनन आयु की महिलाओं में आयरन की कमी से होने वाला एनीमिया अत्यधिक प्रचलित है।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Hb, MCV levels assess microcytic iron deficiency pattern", hi: "Hb, MCV स्तर माइक्रोसाइटिक आयरन की कमी के पैटर्न का आकलन करते हैं" } },
      { test_code: "HB-01", reason: { en: "Direct hemoglobin levels", hi: "सीधे हीमोग्लोबिन का स्तर" } }
    ],
    recommended: [
      { test_code: "TFT", reason: { en: "Thyroid issues are very common in women and cause fatigue", hi: "महिलाओं में थायराइड की समस्या बहुत आम है और थकान का कारण बनती है" } },
      { test_code: "ESR-01", reason: { en: "Assess for hidden chronic inflammation", hi: "छिपी हुई पुरानी सूजन का आकलन करें" } }
    ],
    optional: [
      { test_code: "URINE", reason: { en: "Chronic UTI can cause persistent weakness", hi: "पुरानी यूटीआई लगातार कमजोरी का कारण बन सकती है" } },
      { test_code: "GLU-01", reason: { en: "Rule out diabetes", hi: "मधुमेह को खारिज करने के लिए" } }
    ],
    ai_note: {
      en: "Heavy menstrual bleeding is the most common cause of iron deficiency anemia in young women.",
      hi: "युवा महिलाओं में आयरन की कमी से होने वाले एनीमिया का सबसे आम कारण भारी मासिक धर्म है।"
    }
  },

  weakness_thyroid: {
    label: { en: "Weakness with weight gain or cold intolerance", hi: "वजन बढ़ने या ठंड न झेल पाने के साथ कमजोरी" },
    summary: {
      en: "Hypothyroidism causes slow metabolism, fatigue, and weight gain.",
      hi: "हाइपोथायरायडिज्म धीमे चयापचय, थकान और वजन बढ़ने का कारण बनता है।"
    },
    must_do: [
      { test_code: "TFT", reason: { en: "TSH is elevated in hypothyroidism", hi: "हाइपोथायरायडिज्म में टीएसएच बढ़ा हुआ होता है" } },
      { test_code: "CBC", reason: { en: "Assess for associated anemia", hi: "संबंधित एनीमिया का आकलन करें" } }
    ],
    recommended: [
      { test_code: "LIPID", reason: { en: "Thyroid hormone deficiency raises cholesterol", hi: "थायराइड हार्मोन की कमी से कोलेस्ट्रॉल बढ़ता है" } }
    ],
    optional: [
      { test_code: "CALCIUM-01", reason: { en: "Thyroid disorders can impact calcium levels", hi: "थायराइड विकार कैल्शियम के स्तर को प्रभावित कर सकते हैं" } }
    ],
    ai_note: {
      en: "TSH is the single best screening test for thyroid dysfunction. High TSH indicates hypothyroidism.",
      hi: "थायराइड की शिथिलता के लिए टीएसएच सबसे अच्छा एकल स्क्रीनिंग परीक्षण है। उच्च टीएसएच हाइपोथायरायडिज्म को दर्शाता है।"
    }
  },

  weakness_diabetes: {
    label: { en: "Weakness with thirst and frequent urination", hi: "प्यास और बार-बार पेशाब आने के साथ कमजोरी" },
    summary: {
      en: "Classic signs of high blood sugar. Test for diabetes immediately.",
      hi: "उच्च रक्त शर्करा के क्लासिक लक्षण। मधुमेह के लिए तुरंत परीक्षण करें।"
    },
    must_do: [
      { test_code: "GLU-01", reason: { en: "Random Blood Sugar gives instant glucose level", hi: "रैंडम ब्लड शुगर तत्काल ग्लूकोज का स्तर देता है" } },
      { test_code: "HBA1C", reason: { en: "3-month average blood sugar confirms diabetes status", hi: "3 महीने का औसत ब्लड शुगर मधुमेह की स्थिति की पुष्टि करता है" } }
    ],
    recommended: [
      { test_code: "URINE", reason: { en: "Check for sugar (glucosuria) and protein in urine", hi: "पेशाब में शुगर (ग्लूकोसुरिया) और प्रोटीन की जाँच करें" } },
      { test_code: "CBC", reason: { en: "General blood picture", hi: "सामान्य रक्त चित्र" } }
    ],
    optional: [
      { test_code: "KFT", reason: { en: "Early kidney screening for diabetics", hi: "मधुमेह रोगियों के लिए प्रारंभिक किडनी स्क्रीनिंग" } }
    ],
    ai_note: {
      en: "HbA1c >= 6.5% confirms diabetes. Between 5.7% and 6.4% is pre-diabetic.",
      hi: "HbA1c >= 6.5% मधुमेह की पुष्टि करता है। 5.7% और 6.4% के बीच प्री-डायबिटिक है।"
    }
  },

  weakness_diabetic: {
    label: { en: "Weakness in known diabetic patient", hi: "ज्ञात मधुमेह (शुगर) रोगी में कमजोरी" },
    summary: {
      en: "Evaluate for hypoglycemia, poor glycemic control, anemia, or kidney disease.",
      hi: "हाइपोग्लाइसीमिया, खराब ग्लूकोज नियंत्रण, एनीमिया या गुर्दे की बीमारी का आकलन करें।"
    },
    must_do: [
      { test_code: "GLU-01", reason: { en: "Assess current sugar to rule out hypoglycemia", hi: "हाइपोग्लाइसीमिया को खारिज करने के लिए वर्तमान शर्करा का स्तर मापें" } },
      { test_code: "HBA1C", reason: { en: "Evaluate overall long-term control", hi: "दीर्घकालिक नियंत्रण का मूल्यांकन करें" } },
      { test_code: "CBC", reason: { en: "Anemia is prevalent in long-standing diabetics", hi: "लंबे समय से मधुमेह से पीड़ित रोगियों में एनीमिया आम है" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Diabetic nephropathy causes significant weakness", hi: "डायबिटिक नेफ्रोपैथी गंभीर कमजोरी का कारण बनती है" } },
      { test_code: "URINE", reason: { en: "Proteinuria indicates diabetic kidney damage", hi: "पेशाब में प्रोटीन गुर्दे की क्षति को दर्शाता है" } }
    ],
    optional: [
      { test_code: "TFT", reason: { en: "Thyroid disorders are common comorbidities", hi: "थायराइड विकार आम सह-रुग्णताएं हैं" } }
    ],
    ai_note: {
      en: "Always rule out low blood sugar (hypoglycemia) first in a diabetic feeling weak or dizzy.",
      hi: "कमजोरी या चक्कर महसूस होने पर मधुमेह रोगी में हमेशा सबसे पहले लो ब्लड शुगर को खारिज करें।"
    }
  },

  weakness_kidney: {
    label: { en: "Weakness with known Kidney Disease", hi: "ज्ञात गुर्दा (किडनी) रोग के साथ कमजोरी" },
    summary: {
      en: "Kidney dysfunction leads to decreased red blood cell production (anemia) and electrolyte imbalance.",
      hi: "गुर्दे की शिथिलता से लाल रक्त कोशिकाओं का उत्पादन कम हो जाता है (एनीमिया) और इलेक्ट्रोलाइट असंतुलन होता है।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Kidneys produce erythropoietin; damage causes anemia", hi: "किडनी एरिथ्रोपोइटिन बनाती है; क्षति से एनीमिया होता है" } },
      { test_code: "KFT", reason: { en: "Assess current renal parameters", hi: "वर्तमान रीनल (किडनी) मापदंडों का आकलन करें" } },
      { test_code: "CREAT-01", reason: { en: "Key marker of glomerular filtration rate", hi: "ग्लोमेरुलर निस्पंदन दर का मुख्य संकेतक" } }
    ],
    recommended: [
      { test_code: "URINE", reason: { en: "Assess protein loss and cellular casts", hi: "प्रोटीन के नुकसान और कोशिकीय तत्वों का आकलन करें" } },
      { test_code: "CALCIUM-01", reason: { en: "Kidney failure alters calcium-phosphate balance", hi: "किडनी फेलियर कैल्शियम-फॉस्फेट संतुलन को बदल देता है" } }
    ],
    optional: [
      { test_code: "HBA1C", reason: { en: "Assess diabetes, the leading cause of kidney disease", hi: "मधुमेह का आकलन करें, जो गुर्दे की बीमारी का प्रमुख कारण है" } }
    ],
    ai_note: {
      en: "Creatinine > 1.5 mg/dL in females and > 2.0 in males indicates moderate to severe kidney dysfunction.",
      hi: "क्रिएटिनिन महिलाओं में > 1.5 और पुरुषों में > 2.0 मध्यम से गंभीर किडनी खराबी को दर्शाता है।"
    }
  },

  joint_ra_confirmed: {
    label: { en: "Rheumatoid Arthritis — Established (> 6 weeks)", hi: "रूमेटोइड आर्थराइटिस — स्थापित (> 6 सप्ताह)" },
    summary: {
      en: "Morning stiffness and small joint involvement point to Rheumatoid Arthritis.",
      hi: "सुबह की अकड़न और छोटे जोड़ों में दर्द रूमेटोइड आर्थराइटिस की ओर इशारा करते हैं।"
    },
    must_do: [
      { test_code: "RF", reason: { en: "Rheumatoid Factor — positive in 70-80% of RA cases", hi: "रूमेटोइड फैक्टर — आरए के 70-80% मामलों में सकारात्मक" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Measures active systemic inflammation", hi: "सक्रिय प्रणालीगत सूजन को maapta hai" } },
      { test_code: "ESR-01", reason: { en: "Reflects disease activity over time", hi: "समय के साथ बीमारी की सक्रियता को दर्शाता है" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "RA often causes anemia of chronic disease", hi: "आरए अक्सर पुरानी बीमारी से होने वाले एनीमिया का कारण बनता है" } },
      { test_code: "CALCIUM-01", reason: { en: "Bone mineral density status", hi: "हड्डी खनिज घनत्व की स्थिति" } }
    ],
    optional: [
      { test_code: "URIC_ACID", reason: { en: "Rule out gout overlap", hi: "गठिया (गाउट) के प्रभाव को खारिज करने के लिए" } },
      { test_code: "LFT", reason: { en: "Baseline liver status before DMARD treatment", hi: "डीएमएआरडी उपचार शुरू करने से पहले आधारभूत लीवर स्थिति" } }
    ],
    ai_note: {
      en: "Seronegative RA exists; a negative RF does not fully rule out Rheumatoid Arthritis.",
      hi: "सेरोनेगेटिव आरए भी होता है; एक नकारात्मक आरएफ पूरी तरह से रूमेटोइड आर्थराइटिस को खारिज नहीं करता है।"
    }
  },

  joint_ra_early: {
    label: { en: "Early joint pain — Possible RA (< 6 weeks)", hi: "शुरुआती जोड़ों में दर्द — संभावित आरए (< 6 सप्ताह)" },
    summary: {
      en: "Early joint inflammation can be viral or early onset Rheumatoid Arthritis.",
      hi: "शुरुआती जोड़ों की सूजन वायरल या प्रारंभिक रूमेटोइड आर्थराइटिस हो सकती है।"
    },
    must_do: [
      { test_code: "RF", reason: { en: "Rheumatoid factor screen", hi: "रूमेटोइड फैक्टर स्क्रीन" } },
      { test_code: "ESR-01", reason: { en: "General inflammation screening", hi: "सामान्य सूजन स्क्रीनिंग" } },
      { test_code: "CBC", reason: { en: "Rule out systemic viral infection", hi: "प्रणालीगत वायरल संक्रमण को खारिज करने के लिए" } }
    ],
    recommended: [
      { test_code: "CRP-QUANT-01", reason: { en: "Active inflammation marker", hi: "सक्रिय सूजन का सूचक" } },
      { test_code: "URIC_ACID", reason: { en: "Rule out gout", hi: "गाउट (गठिया) को खारिज करने के लिए" } }
    ],
    optional: [
      { test_code: "WIDAL1", reason: { en: "Reactive arthritis after typhoid exposure", hi: "टाइफाइड के संपर्क में आने के बाद प्रतिक्रियाशील गठिया" } }
    ]
  },

  joint_gout: {
    label: { en: "Gout — Sudden big toe or ankle pain", hi: "गाउट — पैर के अंगूठे या टखने में अचानक दर्द" },
    summary: {
      en: "Hyperuricemia causes painful uric acid crystal deposition in joints, typically the big toe.",
      hi: "हाइपरयुरिसीमिया जोड़ों में दर्दनाक यूरिक एसिड क्रिस्टल के जमाव का कारण बनता है, विशेष रूप से पैर के अंगूठे में।"
    },
    must_do: [
      { test_code: "URIC_ACID", reason: { en: "Measures uric acid level in blood", hi: "रक्त में यूरिक एसिड के स्तर को मापता है" } },
      { test_code: "KFT", reason: { en: "Kidneys excrete uric acid; check renal status", hi: "किडनी यूरिक एसिड उत्सर्जित करती है; गुर्दे की स्थिति की जाँच करें" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "Rule out joint infection (septic arthritis)", hi: "जोड़ों के संक्रमण (सेप्टिक आर्थराइटिस) को खारिज करने के लिए" } }
    ],
    optional: [
      { test_code: "RF", reason: { en: "Rule out Rheumatoid Arthritis", hi: "रूमेटोइड आर्थराइटिस को खारिज करने के लिए" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Measures inflammatory response in acute gout flare", hi: "तीव्र गाउट भड़कने में भड़काऊ प्रतिक्रिया को मापता है" } }
    ],
    ai_note: {
      en: "Uric acid levels > 7.0 mg/dL in males and > 6.0 in females indicate hyperuricemia.",
      hi: "पुरुषों में यूरिक एसिड का स्तर > 7.0 और महिलाओं में > 6.0 हाइपरयुरिसीमिया को दर्शाता है।"
    }
  },

  joint_fever_viral: {
    label: { en: "Joint pain with fever — Viral Arthritis suspected", hi: "बुखार के साथ जोड़ों में दर्द — वायरल गठिया का संदेह" },
    summary: {
      en: "Fever combined with multiple joint pain is a classic sign of Dengue or Chikungunya.",
      hi: "बुखार के साथ कई जोड़ों में दर्द होना डेंगू या चिकनगुनिया का एक क्लासिक संकेत है।"
    },
    must_do: [
      { test_code: "DENGUE-01", reason: { en: "Dengue causes severe body and joint pains ('breakbone fever')", hi: "डेंगू गंभीर शरीर और जोड़ों के दर्द का कारण बनता है" } },
      { test_code: "CBC", reason: { en: "Monitor platelet and WBC drops", hi: "प्लेटलेट और डब्ल्यूबीसी की गिरावट की निगरानी करें" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Assess inflammatory response", hi: "भड़काऊ प्रतिक्रिया का आकलन करें" } }
    ],
    recommended: [
      { test_code: "MP-MICRO", reason: { en: "Rule out malaria", hi: "मलेरिया को खारिज करने के लिए" } },
      { test_code: "ESR-01", reason: { en: "General inflammation", hi: "सामान्य सूजन" } }
    ],
    optional: [
      { test_code: "RF", reason: { en: "Rule out early Rheumatoid Arthritis", hi: "शुरुआती रूमेटोइड आर्थराइटिस को खारिज करने के लिए" } },
      { test_code: "WIDAL1", reason: { en: "Rule out post-typhoid reactive arthritis", hi: "पोस्ट-टाइफाइड प्रतिक्रियाशील गठिया को खारिज करने के लिए" } }
    ]
  },

  joint_back_pain: {
    label: { en: "Back pain or spine stiffness", hi: "पीठ दर्द या रीढ़ की हड्डी में अकड़न" },
    summary: {
      en: "Chronic back stiffness improving with movement suggests inflammatory spine disease.",
      hi: "हिलने-डुलने पर ठीक होने वाली पुरानी पीठ की अकड़न रीढ़ की सूजन संबंधी बीमारी का संकेत देती है।"
    },
    must_do: [
      { test_code: "ESR-01", reason: { en: "Elevated in inflammatory back conditions", hi: "पीठ की सूजन संबंधी स्थितियों में बढ़ा हुआ" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Assess systemic inflammation", hi: "प्रणालीगत सूजन का आकलन करें" } },
      { test_code: "CBC", reason: { en: "General hematology screen", hi: "सामान्य हेमेटोलॉजी स्क्रीन" } }
    ],
    recommended: [
      { test_code: "RF", reason: { en: "Rule out RA", hi: "आरए को खारिज करने के लिए" } },
      { test_code: "CALCIUM-01", reason: { en: "Bone mineral health status", hi: "हड्डी खनिज स्वास्थ्य की स्थिति" } }
    ],
    optional: [
      { test_code: "URIC_ACID", reason: { en: "Rule out gouty involvement", hi: "गाउट की भागीदारी को खारिज करने के लिए" } }
    ]
  },

  joint_young_knee: {
    label: { en: "Knee pain in young patient (< 40)", hi: "युवा मरीज में घुटने का दर्द (< 40)" },
    summary: {
      en: "Assess for injury, inflammatory arthritis, or post-infectious reactive arthritis.",
      hi: "चोट, सूजन वाले गठिया, या संक्रमण के बाद होने वाले प्रतिक्रियाशील गठिया का आकलन करें।"
    },
    must_do: [
      { test_code: "ESR-01", reason: { en: "Screen for joint inflammation", hi: "जोड़ों की सूजन की जाँच करें" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Check for active inflammation", hi: "सक्रिय सूजन की जाँच करें" } }
    ],
    recommended: [
      { test_code: "RF", reason: { en: "Rule out early onset RA", hi: "शुरुआती आरए को खारिज करने के लिए" } },
      { test_code: "URIC_ACID", reason: { en: "Gout is less common in youth but possible", hi: "युवाओं में गाउट कम आम है लेकिन संभव है" } }
    ],
    optional: [
      { test_code: "CBC", reason: { en: "General health profile", hi: "सामान्य स्वास्थ्य प्रोफाइल" } }
    ]
  },

  joint_osteo: {
    label: { en: "Knee or hip pain — Age >= 40 (Osteoarthritis pattern)", hi: "घुटने या कूल्हे का दर्द — उम्र >= 40 (ऑस्टियोआर्थराइटिस पैटर्न)" },
    summary: {
      en: "Degenerative joint disease common with age. Rule out inflammatory joint conditions.",
      hi: "उम्र के साथ जोड़ों का घिसना आम है। जोड़ों की सूजन संबंधी स्थितियों को खारिज करें।"
    },
    must_do: [
      { test_code: "CALCIUM-01", reason: { en: "Assess bone density support", hi: "हड्डी के घनत्व के समर्थन का आकलन करें" } },
      { test_code: "ESR-01", reason: { en: "Determine if there is an active inflammatory component", hi: "निर्धारित करें कि क्या कोई सक्रिय सूजन घटक है" } }
    ],
    recommended: [
      { test_code: "RF", reason: { en: "Rule out Rheumatoid Arthritis", hi: "रूमेटोइड आर्थराइटिस को खारिज करने के लिए" } },
      { test_code: "URIC_ACID", reason: { en: "Rule out gout", hi: "गाउट को खारिज करने के लिए" } },
      { test_code: "CBC", reason: { en: "General baseline health", hi: "सामान्य बुनियादी स्वास्थ्य" } }
    ],
    optional: [
      { test_code: "CRP-QUANT-01", reason: { en: "Inflammation check", hi: "सूजन की जाँच" } }
    ]
  },

  jaundice_acute: {
    label: { en: "Acute Jaundice — Yellow eyes recently started", hi: "तीव्र पीलिया — हाल ही में आँखें पीली होना शुरू हुई हैं" },
    summary: {
      en: "Newly developed jaundice requires immediate liver evaluation to identify hepatitis or obstruction.",
      hi: "हाल ही में विकसित पीलिया में हेपेटाइटिस या रुकावट की पहचान के लिए तुरंत लीवर मूल्यांकन की आवश्यकता होती।"
    },
    must_do: [
      { test_code: "LFT", reason: { en: "Full liver function tests are critical", hi: "पूर्ण लीवर फंक्शन परीक्षण बहुत महत्वपूर्ण हैं" } },
      { test_code: "BILIRUBIN-TOTAL-01", reason: { en: "Quantify direct vs indirect jaundice levels", hi: "सीधे बनाम अप्रत्यक्ष पीलिया के स्तर को मापें" } },
      { test_code: "SGOT-SGPT", reason: { en: "Assess acute liver cell damage", hi: "तीव्र लीवर कोशिका क्षति का आकलन करें" } },
      { test_code: "CBC", reason: { en: "Rule out hemolytic anemia as a cause of jaundice", hi: "पीलिया के कारण के रूप में हेमोलिटिक एनीमिया को खारिज करें" } }
    ],
    recommended: [
      { test_code: "PT-01", reason: { en: "Liver produces clotting factors; prolonged PT indicates severe dysfunction", hi: "लीवर थक्के जमने वाले कारक बनाता है; बढ़ा हुआ पीटी गंभीर खराबी दर्शाता है" } },
      { test_code: "URINE", reason: { en: "Bilirubin and bile salts in urine confirm hepatic involvement", hi: "पेशाब में बिलीरुबिन और पित्त लवण लीवर की भागीदारी की पुष्टि करते हैं" } }
    ],
    optional: [
      { test_code: "MP-MICRO", reason: { en: "Malaria can cause hemolytic jaundice", hi: "मलेरिया हेमोलिटिक पीलिया का कारण बन सकता है" } }
    ]
  },

  jaundice_with_fever: {
    label: { en: "Jaundice with Fever — Infectious Liver Disease", hi: "बुखार के साथ पीलिया — संक्रामक लीवर रोग" },
    summary: {
      en: "Fever + Jaundice suggests malaria, typhoid, or acute viral hepatitis.",
      hi: "बुखार + पीलिया मलेरिया, टाइफाइड या तीव्र वायरल हेपेटाइटिस का संकेत देता है।"
    },
    must_do: [
      { test_code: "LFT", reason: { en: "Assess liver damage profile", hi: "लीवर की क्षति प्रोफाइल का आकलन करें" } },
      { test_code: "BILIRUBIN-TOTAL-01", reason: { en: "Quantify jaundice levels", hi: "पीलिया के स्तर को मापें" } },
      { test_code: "MP-MICRO", reason: { en: "Malaria causes hemolytic jaundice with fever", hi: "मलेरिया बुखार के साथ हेमोलिटिक पीलिया का कारण बनता है" } },
      { test_code: "SGOT-SGPT", reason: { en: "Assess liver enzyme elevation", hi: "लीवर एंजाइम वृद्धि का आकलन करें" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "Assess infection markers", hi: "संक्रमण के संकेतकों का आकलन करें" } },
      { test_code: "TYPHIDOT-01", reason: { en: "Typhoid hepatitis screening", hi: "टाइफाइड हेपेटाइटिस स्क्रीनिंग" } },
      { test_code: "PT-01", reason: { en: "Assess liver synthetic status", hi: "लीवर की सिंथेटिक स्थिति का आकलन करें" } }
    ],
    optional: [
      { test_code: "CRP-QUANT-01", reason: { en: "Infection severity", hi: "संक्रमण की गंभीरता" } }
    ]
  },

  jaundice_no_fever: {
    label: { en: "Jaundice without Fever — Obstructive / Chronic", hi: "बिना बुखार के पीलिया — रुकावट / पुरानी बीमारी" },
    summary: {
      en: "Jaundice without fever suggests gallstone obstruction or chronic liver conditions.",
      hi: "बिना बुखार के पीलिया पित्त की पथरी के कारण रुकावट या पुरानी लीवर स्थितियों का संकेत देता है।"
    },
    must_do: [
      { test_code: "LFT", reason: { en: "Full liver enzyme and protein panel", hi: "पूर्ण लीवर एंजाइम और प्रोटीन पैनल" } },
      { test_code: "BILIRUBIN-TOTAL-01", reason: { en: "Direct vs indirect bilirubin pattern identifies blockage", hi: "सीधे बनाम अप्रत्यक्ष बिलीरुबिन का पैटर्न रुकावट की पहचान करता है" } },
      { test_code: "SGOT-SGPT", reason: { en: "Liver cell damage pattern", hi: "लीवर कोशिकाओं की क्षति का पैटर्न" } },
      { test_code: "PT-01", reason: { en: "Assess liver synthetic capabilities", hi: "लीवर की सिंथेटिक क्षमताओं का आकलन करें" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "Anemia check in chronic liver disease", hi: "पुरानी लीवर बीमारी में एनीमिया की जाँच" } },
      { test_code: "URINE", reason: { en: "Bile salts and pigments in urine", hi: "पेशाब में पित्त लवण और वर्णक" } }
    ],
    optional: [
      { test_code: "URIC_ACID", reason: { en: "Can be elevated in liver disorders", hi: "लीवर विकारों में बढ़ सकता है" } }
    ]
  },

  liver_pain: {
    label: { en: "Right-side abdominal pain — Liver concern", hi: "पेट के दाहिनी ओर दर्द — लीवर की चिंता" },
    summary: {
      en: "Pain in the right upper abdomen typically originates from the liver or gallbladder.",
      hi: "पेट के दाहिने ऊपरी हिस्से में दर्द आमतौर पर लीवर या पित्ताशय से उत्पन्न होता है।"
    },
    must_do: [
      { test_code: "LFT", reason: { en: "Assess liver enzymes", hi: "लीवर एंजाइमों का आकलन करें" } },
      { test_code: "SGOT-SGPT", reason: { en: "Check for liver cell damage", hi: "लीवर कोशिकाओं की क्षति की जाँच करें" } },
      { test_code: "CBC", reason: { en: "Rule out infection/inflammation (cholecystitis)", hi: "संक्रमण/सूजन (पित्ताशय की सूजन) को खारिज करें" } }
    ],
    recommended: [
      { test_code: "BILIRUBIN-TOTAL-01", reason: { en: "Check for early subclinical jaundice", hi: "शुरुआती उप-नैदानिक पीलिया की जाँच करें" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Assess inflammation severity", hi: "सूजन की गंभीरता का आकलन करें" } }
    ],
    optional: [
      { test_code: "URINE", reason: { en: "Rule out right kidney stone pain", hi: "दाहिनी किडनी की पथरी के दर्द को खारिज करें" } }
    ]
  },

  liver_nausea: {
    label: { en: "Nausea, vomiting, and loss of appetite — Hepatitis suspected", hi: "मतली, उल्टी और भूख न लगना — हेपेटाइटिस का संदेह" },
    summary: {
      en: "Hepatitis presentation. Liver enzymes are critical for assessment.",
      hi: "हेपेटाइटिस के लक्षण। लीवर एंजाइम मूल्यांकन के लिए बहुत महत्वपूर्ण हैं।"
    },
    must_do: [
      { test_code: "SGOT-SGPT", reason: { en: "Typically highly elevated in viral hepatitis", hi: "वायरल हेपेटाइटिस में आमतौर पर बहुत अधिक बढ़े हुए" } },
      { test_code: "LFT", reason: { en: "Full liver function panel", hi: "पूर्ण लीवर फंक्शन पैनल" } },
      { test_code: "CBC", reason: { en: "General health screening", hi: "सामान्य स्वास्थ्य स्क्रीनिंग" } }
    ],
    recommended: [
      { test_code: "BILIRUBIN-TOTAL-01", reason: { en: "Screen for early jaundice", hi: "शुरुआती पीलिया के लिए स्क्रीन करें" } }
    ],
    optional: [
      { test_code: "MP-MICRO", reason: { en: "Malaria can present with acute nausea", hi: "मलेरिया तीव्र मतली के साथ प्रस्तुत हो सकता है" } },
      { test_code: "TYPHIDOT-01", reason: { en: "Typhoid can present with nausea and vomiting", hi: "टाइफाइड मतली और उल्टी के साथ प्रस्तुत हो सकता है" } }
    ],
    ai_note: {
      en: "ALT (SGPT) > 200 IU/L strongly suggests acute hepatitis.",
      hi: "ALT (SGPT) > 200 IU/L तीव्र हेपेटाइटिस का दृढ़ता से संकेत देता है।"
    }
  },

  fatty_liver: {
    label: { en: "Fatty Liver / Alcohol Liver concern", hi: "फैटी लीवर / शराबी लीवर की चिंता" },
    summary: {
      en: "SGPT and Lipid Profile are critical for fatty liver evaluation.",
      hi: "फैटी लीवर के मूल्यांकन के लिए एसजीपीटी और लिपिड प्रोफाइल महत्वपूर्ण हैं।"
    },
    must_do: [
      { test_code: "SGOT-SGPT", reason: { en: "SGPT is highly sensitive to fatty infiltration", hi: "एसजीपीटी फैटी जमाव के प्रति अत्यधिक संवेदनशील है" } },
      { test_code: "LFT", reason: { en: "Full liver panel", hi: "पूर्ण लीवर पैनल" } },
      { test_code: "LIPID", reason: { en: "Lipid levels assess hyperlipidemia, linked to fatty liver", hi: "लिपिड स्तर हाइपरलिपिडिमिया का आकलन करते हैं, जो फैटी लीवर से जुड़ा है" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "Check overall blood indices", hi: "रक्त सूचकांकों की जाँच करें" } },
      { test_code: "GLU-01", reason: { en: "Diabetes screening, highly linked to fatty liver", hi: "मधुमेह स्क्रीनिंग, जो फैटी लीवर से निकटता से जुड़ी है" } }
    ],
    optional: [
      { test_code: "URIC_ACID", reason: { en: "Uric acid can be elevated in metabolic syndrome", hi: "मेटाबॉलिक सिंड्रोम में यूरिक एसिड बढ़ सकता है" } }
    ],
    ai_note: {
      en: "Fatty liver is highly linked to high cholesterol and insulin resistance.",
      hi: "फैटी लीवर उच्च कोलेस्ट्रॉल और इंसुलिन प्रतिरोध से निकटता से जुड़ा हुआ है।"
    }
  },

  liver_ascites: {
    label: { en: "Swollen abdomen / Fluid in belly (Ascites)", hi: "पेट में सूजन / पेट में पानी भरना (जलोदर)" },
    summary: {
      en: "Evaluate liver and kidney function to find the cause of fluid accumulation.",
      hi: "तरल पदार्थ जमा होने के कारण का पता लगाने के लिए लीवर और किडनी के कार्य का मूल्यांकन करें।"
    },
    must_do: [
      { test_code: "LFT", reason: { en: "Check for portal hypertension and albumin levels", hi: "पोर्टल हाइपरटेंशन और एल्ब्यूमिन के स्तर की जाँच करें" } },
      { test_code: "KFT", reason: { en: "Assess kidney participation in fluid balance", hi: "तरल संतुलन में गुर्दे की भागीदारी का आकलन करें" } },
      { test_code: "PT-01", reason: { en: "Assess liver protein synthesis capacity", hi: "लीवर प्रोटीन संश्लेषण क्षमता का आकलन करें" } },
      { test_code: "BILIRUBIN-TOTAL-01", reason: { en: "Jaundice level quantification", hi: "पीलिया के स्तर का मापन" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "Infection and anemia check", hi: "संक्रमण और एनीमिया की जाँच" } },
      { test_code: "URINE", reason: { en: "Check renal protein filtration", hi: "किडनी प्रोटीन छानने की जाँच करें" } }
    ],
    optional: [
      { test_code: "LIPID", reason: { en: "Atherosclerosis markers", hi: "एथेरोस्क्लेरोसिस संकेतक" } }
    ]
  },

  kidney_edema: {
    label: { en: "Swelling in face, hands, or feet (Edema)", hi: "चेहरे, हाथों या पैरों में सूजन (एडिमा)" },
    summary: {
      en: "Kidney dysfunction leads to fluid retention. KFT and Urine analysis are key.",
      hi: "गुर्दे की शिथिलता से शरीर में पानी जमा होता है। केएफटी और मूत्र विश्लेषण मुख्य हैं।"
    },
    must_do: [
      { test_code: "KFT", reason: { en: "Full Kidney Function Test", hi: "पूर्ण किडनी फंक्शन टेस्ट" } },
      { test_code: "CREAT-01", reason: { en: "Renal clearance efficiency", hi: "किडनी की सफाई की दक्षता" } },
      { test_code: "URINE", reason: { en: "Rule out proteinuria (leaking protein)", hi: "पेशाब में प्रोटीन लीक होने को खारिज करें" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "Check for anemia of chronic kidney disease", hi: "किडनी की पुरानी बीमारी से होने वाले एनीमिया की जाँच करें" } },
      { test_code: "LIPID", reason: { en: "Hyperlipidemia check (associated with nephrotic syndrome)", hi: "हाइपरलिपिडिमिया की जाँच (नेफ्रोटिक सिंड्रोम से संबंधित)" } }
    ],
    optional: [
      { test_code: "GLU-01", reason: { en: "Screen for diabetes, the leading cause of renal damage", hi: "किडनी की क्षति के मुख्य कारण मधुमेह की जाँच करें" } }
    ]
  },

  kidney_failure: {
    label: { en: "Decreased urine output — Kidney Failure concern", hi: "पेशाब कम आना — किडनी फेलियर की चिंता" },
    summary: {
      en: "Assess kidney function immediately to rule out acute or chronic kidney injury.",
      hi: "तीव्र या पुरानी किडनी की क्षति को खारिज करने के लिए तुरंत किडनी के कार्य का आकलन करें।"
    },
    must_do: [
      { test_code: "KFT", reason: { en: "Full Kidney Function Test panel", hi: "पूर्ण किडनी फंक्शन test panel" } },
      { test_code: "CREAT-01", reason: { en: "Primary marker for acute kidney injury", hi: "तीव्र किडनी की चोट का प्राथमिक सूचक" } },
      { test_code: "UREA-01", reason: { en: "Accumulation of toxic nitrogenous waste", hi: "जहरीले नाइट्रोजन कचरे का संचय" } },
      { test_code: "URINE", reason: { en: "Urine Routine & Microscopy for cellular casts", hi: "कोशिकीय तत्वों के लिए मूत्र दिनचर्या और माइक्रोस्कोपी" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "Check general hematology status", hi: "सामान्य हेमेटोलॉजी स्थिति की जाँच करें" } },
      { test_code: "CALCIUM-01", reason: { en: "Kidney failure affects calcium metabolism", hi: "किडनी फेलियर calcium चयापचय को प्रभावित करता है" } }
    ],
    optional: [
      { test_code: "GLU-01", reason: { en: "Diabetes control check", hi: "मधुमेह नियंत्रण की जाँच" } }
    ]
  },

  hematuria: {
    label: { en: "Blood in urine (Hematuria)", hi: "पेशाब में खून आना (हेमटुरिया)" },
    summary: {
      en: "Rule out urinary tract infection, kidney stones, or clotting issues.",
      hi: "पेशाब नली के संक्रमण, गुर्दे की पथरी या थक्के जमने की समस्या को खारिज करें।"
    },
    must_do: [
      { test_code: "URINE", reason: { en: "Confirm presence of RBCs and rule out infection", hi: "आरबीसी की उपस्थिति की पुष्टि करें और संक्रमण को खारिज करें" } },
      { test_code: "CBC", reason: { en: "Rule out systemic infection or anemia from blood loss", hi: "रक्त की कमी से होने वाले संक्रमण या एनीमिया को खारिज करें" } },
      { test_code: "KFT", reason: { en: "Check for glomerular damage", hi: "ग्लोमेरुलर क्षति की जाँच करें" } }
    ],
    recommended: [
      { test_code: "PT-01", reason: { en: "Rule out coagulation/bleeding disorders", hi: "जमाव/रक्तस्राव विकारों को खारिज करने के लिए" } },
      { test_code: "CREAT-01", reason: { en: "Assess basic kidney function", hi: "मूल किडनी कार्य का आकलन करें" } }
    ],
    optional: [
      { test_code: "GLU-01", reason: { en: "General health screen", hi: "सामान्य स्वास्थ्य स्क्रीनिंग" } }
    ]
  },

  proteinuria: {
    label: { en: "Foamy or frothy urine (Proteinuria)", hi: "झागदार पेशाब (प्रोटीनुरिया)" },
    summary: {
      en: "Protein loss in urine is an early indicator of kidney filtration damage.",
      hi: "पेशाब में प्रोटीन का निकलना किडनी के फिल्टर होने की क्षति का प्रारंभिक संकेतक है।"
    },
    must_do: [
      { test_code: "URINE", reason: { en: "Detects protein levels (albuminuria)", hi: "प्रोटीन के स्तर (एल्ब्यूमिनुरिया) का पता लगाता है" } },
      { test_code: "KFT", reason: { en: "Evaluate overall kidney function", hi: "समग्र किडनी कार्य का मूल्यांकन करें" } },
      { test_code: "CREAT-01", reason: { en: "Renal clearance assessment", hi: "किडनी की कार्यक्षमता का आकलन" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "General health indices", hi: "सामान्य स्वास्थ्य सूचकांक" } },
      { test_code: "GLU-01", reason: { en: "Diabetes screening (diabetic nephropathy is common)", hi: "मधुमेह स्क्रीनिंग (डायबिटिक नेफ्रोपैथी आम है)" } }
    ],
    optional: [
      { test_code: "LIPID", reason: { en: "High cholesterol is associated with nephrotic protein loss", hi: "उच्च कोलेस्ट्रॉल नेफ्रोटिक प्रोटीन के नुकसान से जुड़ा है" } }
    ]
  },

  uti_male: {
    label: { en: "Urinary burning/pain in Male", hi: "पुरुष में पेशाब में जलन/दर्द" },
    summary: {
      en: "UTI in males is less common and considered complicated. Requires complete evaluation.",
      hi: "पुरुषों में यूटीआई कम आम है और इसे जटिल माना जाता है। पूर्ण मूल्यांकन की आवश्यकता है।"
    },
    must_do: [
      { test_code: "URINE", reason: { en: "Urine examination detects WBCs, bacteria, and nitrites", hi: "मूत्र परीक्षण डब्ल्यूबीसी, बैक्टीरिया और नाइट्राइट का पता लगाता है" } },
      { test_code: "CBC", reason: { en: "Assess systemic infection severity", hi: "प्रणालीगत संक्रमण की गंभीरता का आकलन करें" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Rule out upper urinary tract/kidney involvement", hi: "ऊपरी मूत्र पथ/किडनी की भागीदारी को खारिज करें" } },
      { test_code: "CRP-01", reason: { en: "Inflammatory marker check", hi: "सूजन संबंधी संकेतक की जाँच" } }
    ],
    optional: [
      { test_code: "GLU-01", reason: { en: "Uncontrolled diabetes increases male UTI risk", hi: "अनियंत्रित मधुमेह पुरुषों में यूटीआई का खतरा बढ़ाता है" } }
    ]
  },

  uti_female: {
    label: { en: "Urinary burning/pain in Female", hi: "महिला में पेशाब में जलन/दर्द" },
    summary: {
      en: "Common urinary tract infection. Urine routine is the key diagnostic tool.",
      hi: "सामान्य मूत्र पथ का संक्रमण। मूत्र दिनचर्या मुख्य नैदानिक उपकरण है।"
    },
    must_do: [
      { test_code: "URINE", reason: { en: "Key diagnostic test to detect infection and pus cells", hi: "संक्रमण और मवाद कोशिकाओं का पता लगाने के लिए मुख्य परीक्षण" } },
      { test_code: "CBC", reason: { en: "Check for elevated WBCs", hi: "बढ़े हुए डब्ल्यूबीसी की जाँच करें" } }
    ],
    recommended: [
      { test_code: "CRP-01", reason: { en: "Infection severity marker", hi: "संक्रमण की गंभीरता का सूचक" } }
    ],
    optional: [
      { test_code: "GLU-01", reason: { en: "Rule out diabetes, which predisposes to recurrent UTIs", hi: "मधुमेह को खारिज करें, जो बार-बार यूटीआई का कारण बनता है" } }
    ]
  },

  uti_pregnant: {
    label: { en: "Urinary burning/pain during Pregnancy", hi: "गर्भावस्था के दौरान पेशाब में जलन/दर्द" },
    summary: {
      en: "UTI during pregnancy requires careful screening to avoid maternal and fetal complications.",
      hi: "मातृ और भ्रूण की जटिलताओं से बचने के लिए गर्भावस्था के दौरान यूटीआई की सावधानीपूर्वक स्क्रीनिंग की आवश्यकता है।"
    },
    must_do: [
      { test_code: "URINE", reason: { en: "Rule out asymptomatic bacteriuria, highly common in pregnancy", hi: "लक्षण रहित बैक्टीरिया की उपस्थिति को खारिज करें, जो गर्भावस्था में आम है" } },
      { test_code: "CBC", reason: { en: "Monitor maternal infection status", hi: "मां के संक्रमण की स्थिति की निगरानी करें" } }
    ],
    recommended: [
      { test_code: "CRP-QUANT-01", reason: { en: "Quantitative inflammation severity", hi: "मात्रात्मक सूजन की गंभीरता" } }
    ],
    optional: [
      { test_code: "KFT", reason: { en: "Check kidney function before prescribing medications", hi: "दवाएं लिखने से पहले किडनी के कार्य की जाँच करें" } }
    ]
  },

  diabetes_new: {
    label: { en: "Diabetes Suspected — Thirst & Urination", hi: "मधुमेह का संदेह — प्यास और पेशाब" },
    summary: {
      en: "Assess for new onset diabetes mellitus.",
      hi: "नए मधुमेह (शुगर) के शुरुआत की जाँच करें।"
    },
    must_do: [
      { test_code: "GLU-01", reason: { en: "Random blood sugar screening", hi: "रैंडम ब्लड शुगर screening" } },
      { test_code: "HBA1C", reason: { en: "Determines 3-month sugar average", hi: "3 महीने के औसत शुगर को निर्धारित करता है" } },
      { test_code: "URINE", reason: { en: "Rule out glucose leaking in urine", hi: "पेशाब में ग्लूकोज लीक होने को खारिज करें" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "General hematology parameters", hi: "सामान्य हेमेटोलॉजी मापदंड" } },
      { test_code: "LIPID", reason: { en: "Diabetes is highly correlated with lipid disorders", hi: "मधुमेह लिपिड विकारों के साथ अत्यधिक सह-संबंधित है" } }
    ],
    optional: [
      { test_code: "KFT", reason: { en: "Baseline renal function check", hi: "आधारभूत किडनी कार्य की जाँच" } }
    ]
  },

  thyroid_hyper: {
    label: { en: "Hyperthyroidism Suspected", hi: "हाइपरथायरायडिज्म का संदेह" },
    summary: {
      en: "Evaluate for overactive thyroid gland (weight loss, anxiety, palpitations).",
      hi: "अति-सक्रिय थायराइड ग्रंथि (वजन कम होना, घबराहट, धड़कन) के लिए मूल्यांकन करें।"
    },
    must_do: [
      { test_code: "TFT", reason: { en: "TSH is suppressed; T3 and T4 are elevated", hi: "टीएसएच दबा हुआ होता है; टी3 और टी4 बढ़े हुए होते हैं" } },
      { test_code: "CBC", reason: { en: "Check for associated anemia or infection markers", hi: "संबंधित एनीमिया या संक्रमण के संकेतों की जाँच करें" } }
    ],
    recommended: [
      { test_code: "LIPID", reason: { en: "Hyperthyroidism can lower lipid levels abnormally", hi: "हाइपरथायरायडिज्म लिपिड के स्तर को असामान्य रूप से कम कर सकता है" } }
    ],
    optional: [
      { test_code: "CALCIUM-01", reason: { en: "Thyroid excess can cause bone calcium depletion", hi: "थायराइड की अधिकता से हड्डियों से कैल्शियम की कमी हो सकती है" } }
    ]
  },

  thyroid_goiter: {
    label: { en: "Neck swelling / Goiter screen", hi: "गर्दन में सूजन / घेंघा (ग्वाइटर) स्क्रीन" },
    summary: {
      en: "Thyroid function panel is essential to check if neck swelling is functional.",
      hi: "गर्दन की सूजन कार्यात्मक है या नहीं, यह जाँचने के लिए थायराइड फंक्शन पैनल आवश्यक है।"
    },
    must_do: [
      { test_code: "TFT", reason: { en: "Evaluate functional status of the thyroid gland", hi: "थायराइड ग्रंथि की कार्यात्मक स्थिति का मूल्यांकन करें" } },
      { test_code: "CBC", reason: { en: "General blood assessment", hi: "सामान्य रक्त मूल्यांकन" } }
    ],
    recommended: [
      { test_code: "CRP-01", reason: { en: "Rule out thyroiditis (inflammation of thyroid)", hi: "थायराइडाइटिस (थायराइड की सूजन) को खारिज करें" } }
    ],
    optional: [
      { test_code: "CALCIUM-01", reason: { en: "Assess overall calcium status", hi: "समग्र कैल्शियम स्थिति का आकलन करें" } }
    ]
  },

  thyroid_female: {
    label: { en: "Thyroid panel for irregular periods / hair fall", hi: "अनियमित मासिक धर्म / बालों के झड़ने के लिए थायराइड पैनल" },
    summary: {
      en: "Thyroid dysfunction is a highly prevalent cause of menstrual issues in females.",
      hi: "महिलाओं में मासिक धर्म की समस्याओं का थायराइड विकार एक अत्यधिक प्रचलित कारण है।"
    },
    must_do: [
      { test_code: "TFT", reason: { en: "Screen for subclinical hypothyroidism", hi: "उप-नैदानिक हाइपोथायरायडिज्म के लिए स्क्रीन करें" } },
      { test_code: "CBC", reason: { en: "Assess for anemia, a common co-cause of hair loss", hi: "एनीमिया की जांच करें, जो बालों के झड़ने का एक आम सह-कारण है" } }
    ],
    recommended: [
      { test_code: "HB-01", reason: { en: "Hemoglobin level check", hi: "हीमोग्लोबिन स्तर की जाँच" } }
    ],
    optional: [
      { test_code: "LIPID", reason: { en: "Check for associated hypercholesterolemia", hi: "संबंधित हाइपरकोलेस्ट्रोलेमिया की जाँच करें" } }
    ]
  },

  thyroid_monitor: {
    label: { en: "Thyroid medication monitoring", hi: "थायराइड दवा की निगरानी" },
    summary: {
      en: "Routine tracking for patients on levothyroxine or antithyroid medications.",
      hi: "लेवोथायरोक्सिन या एंटीथायराइड दवाओं पर रोगियों के लिए नियमित ट्रैकिंग।"
    },
    must_do: [
      { test_code: "TFT", reason: { en: "Check TSH to adjust hormone dosage", hi: "हार्मोन की खुराक को समायोजित करने के लिए टीएसएच की जाँच करें" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "General health tracking", hi: "सामान्य स्वास्थ्य ट्रैकिंग" } }
    ],
    optional: [
      { test_code: "LIPID", reason: { en: "Thyroid control affects lipids", hi: "थायराइड नियंत्रण लिपिड को प्रभावित करता है" } }
    ]
  },

  thyroid_hypo: {
    label: { en: "Hypothyroidism Suspected", hi: "हाइपोथायरायडिज्म का संदेह" },
    summary: {
      en: "Check for underactive thyroid (weight gain, fatigue, dry skin).",
      hi: "धीमे थायराइड (वजन बढ़ना, थकान, शुष्क त्वचा) के लिए जाँच करें।"
    },
    must_do: [
      { test_code: "TFT", reason: { en: "Elevated TSH indicates hypothyroidism", hi: "बढ़ा हुआ टीएसएच हाइपोथायरायडिज्म को दर्शाता है" } },
      { test_code: "CBC", reason: { en: "Anemia is highly associated with hypothyroidism", hi: "एनीमिया हाइपोथायरायडिज्म से अत्यधिक जुड़ा हुआ है" } }
    ],
    recommended: [
      { test_code: "LIPID", reason: { en: "Hypothyroidism elevates LDL cholesterol", hi: "हाइपोथायरायडिज्म एलडीएल कोलेस्ट्रॉल को बढ़ाता है" } }
    ],
    optional: [
      { test_code: "CALCIUM-01", reason: { en: "Assess mineral levels", hi: "खनिज स्तर का आकलन करें" } }
    ]
  },

  thyroid_hypo_female_repro: {
    label: { en: "Hypothyroidism suspected in reproductive age Female", hi: "प्रजनन आयु की महिला में संभावित हाइपोथायरायडिज्म" },
    summary: {
      en: "Optimal thyroid function is critical for ovulation and early pregnancy health.",
      hi: "अंडे बनने (ओव्यूलेशन) और प्रारंभिक गर्भावस्था के स्वास्थ्य के लिए इष्टतम थायराइड कार्य महत्वपूर्ण है।"
    },
    must_do: [
      { test_code: "TFT", reason: { en: "Crucial to screen before pregnancy planning", hi: "गर्भावस्था की योजना बनाने से पहले स्क्रीनिंग आवश्यक है" } },
      { test_code: "CBC", reason: { en: "Evaluate for iron deficiency anemia", hi: "आयरन की कमी से होने वाले एनीमिया की जाँच करें" } },
      { test_code: "HB-01", reason: { en: "Direct hemoglobin evaluation", hi: "सीधे हीमोग्लोबिन का मूल्यांकन" } }
    ],
    recommended: [
      { test_code: "LIPID", reason: { en: "Thyroid deficiency alters fat metabolism", hi: "थायराइड की कमी से वसा चयापचय बदल जाता है" } }
    ],
    optional: [
      { test_code: "URINE", reason: { en: "General health screen", hi: "सामान्य स्वास्थ्य स्क्रीन" } }
    ]
  },

  diabetes_new_symptomatic: {
    label: { en: "Diabetes suspected (Symptomatic)", hi: "मधुमेह का संदेह (लक्षणों के साथ)" },
    summary: {
      en: "Symptomatic presentation. Immediate blood glucose testing is required.",
      hi: "लक्षणों के साथ प्रस्तुति। तत्काल रक्त ग्लूकोज परीक्षण आवश्यक है।"
    },
    must_do: [
      { test_code: "GLU-01", reason: { en: "Confirm acute blood sugar status", hi: "तीव्र रक्त शर्करा की स्थिति की पुष्टि करें" } },
      { test_code: "HBA1C", reason: { en: "Average glucose control over 90 days", hi: "90 दिनों में औसत ग्लूकोज नियंत्रण" } }
    ],
    recommended: [
      { test_code: "URINE", reason: { en: "Check for diabetic ketoacidosis risk markers", hi: "मधुमेह केटोएसिडोसिस जोखिम संकेतकों की जाँच करें" } },
      { test_code: "CBC", reason: { en: "Complete blood count", hi: "पूर्ण रक्त गणना (सीबीसी)" } }
    ],
    optional: [
      { test_code: "LIPID", reason: { en: "Lipid profile check", hi: "लिपिड प्रोफाइल की जाँच" } }
    ]
  },

  diabetes_screening: {
    label: { en: "Diabetes screening (Asymptomatic)", hi: "मधुमेह स्क्रीनिंग (बिना लक्षणों के)" },
    summary: {
      en: "Asymptomatic screening based on age, weight, or family history.",
      hi: "उम्र, वजन या पारिवारिक इतिहास के आधार पर बिना लक्षणों की स्क्रीनिंग।"
    },
    must_do: [
      { test_code: "GLU-01", reason: { en: "Fasting or random blood sugar check", hi: "खाली पेट या रैंडम ब्लड शुगर की जाँच" } },
      { test_code: "HBA1C", reason: { en: "Detect pre-diabetes or early silent diabetes", hi: "प्री-डायबिटीज या शुरुआती मूक मधुमेह का पता लगाएं" } }
    ],
    recommended: [
      { test_code: "URINE", reason: { en: "Check for microalbuminuria", hi: "माइक्रोएल्ब्यूमिनुरिया की जाँच करें" } }
    ],
    optional: [
      { test_code: "LIPID", reason: { en: "General metabolic health profiling", hi: "सामान्य चयापचय स्वास्थ्य प्रोफाइलिंग" } }
    ]
  },

  diabetes_monitor: {
    label: { en: "Routine Diabetes monitoring", hi: "नियमित मधुमेह (शुगर) की निगरानी" },
    summary: {
      en: "Routine quarterly tracking to assess therapy effectiveness and prevent complications.",
      hi: "चिकित्सा की प्रभावशीलता का आकलन करने और जटिलताओं को रोकने के लिए नियमित तिमाही ट्रैकिंग।"
    },
    must_do: [
      { test_code: "HBA1C", reason: { en: "Golden standard to track glycemic control progress", hi: "रक्त शर्करा नियंत्रण की प्रगति को ट्रैक करने का सबसे उत्तम परीक्षण" } },
      { test_code: "GLU-01", reason: { en: "Daily/instant blood glucose check", hi: "दैनिक/तत्काल रक्त ग्लूकोज जाँच" } }
    ],
    recommended: [
      { test_code: "URINE", reason: { en: "Early monitoring for renal protein leakage", hi: "गुर्दे में प्रोटीन रिसाव की शुरुआती निगरानी" } },
      { test_code: "CBC", reason: { en: "Check for associated chronic anemia", hi: "संबंधित पुरानी एनीमिया की जाँच करें" } }
    ],
    optional: [
      { test_code: "KFT", reason: { en: "Check creatinine filtration", hi: "क्रिएटिनिन निस्पंदन की जाँच करें" } },
      { test_code: "LIPID", reason: { en: "Assess cardiovascular risk factors", hi: "हृदय संबंधी जोखिम कारकों का आकलन करें" } }
    ]
  },

  diabetes_kidney: {
    label: { en: "Diabetic Kidney Disease concern", hi: "मधुमेह के कारण गुर्दे की बीमारी की चिंता" },
    summary: {
      en: "Evaluate for early signs of diabetic nephropathy.",
      hi: "डायबिटिक नेफ्रोपैथी के शुरुआती लक्षणों का मूल्यांकन करें।"
    },
    must_do: [
      { test_code: "KFT", reason: { en: "Check glomerular filtration rate", hi: "ग्लोमेरुलर निस्पंदन दर की जाँच करें" } },
      { test_code: "CREAT-01", reason: { en: "Creatinine clearance evaluation", hi: "क्रिएटिनिन क्लीयरेंस का मूल्यांकन" } },
      { test_code: "URINE", reason: { en: "Protein leakage is a major nephropathy sign", hi: "प्रोटीन का रिसाव एक बड़ा नेफ्रोपैथी संकेत है" } },
      { test_code: "HBA1C", reason: { en: "Assess glycemic control, which drives kidney damage", hi: "ग्लूकोज नियंत्रण का आकलन करें, जो किडनी की क्षति को बढ़ाता है" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "Renal damage leads to anemia", hi: "किडनी की क्षति से एनीमिया होता है" } },
      { test_code: "GLU-01", reason: { en: "Instant glucose status", hi: "तत्काल ग्लूकोज की स्थिति" } }
    ],
    optional: [
      { test_code: "LIPID", reason: { en: "Comorbidity lipid check", hi: "लिपिड की सह-रुग्णता जाँच" } }
    ]
  },

  diabetes_neuropathy: {
    label: { en: "Diabetic Neuropathy concern", hi: "मधुमेह के कारण तंत्रिका की क्षति (न्यूरोपैथी) की चिंता" },
    summary: {
      en: "Numbness or tingling in the feet of a diabetic. Evaluate control and metabolic markers.",
      hi: "मधुमेह रोगी के पैरों में सुन्नता या झुनझुनी। नियंत्रण और चयापचय संकेतकों का मूल्यांकन करें।"
    },
    must_do: [
      { test_code: "HBA1C", reason: { en: "High sugar damages nerves over time", hi: "उच्च शर्करा समय के साथ नसों को नुकसान पहुंचाती है" } },
      { test_code: "GLU-01", reason: { en: "Check current glycemic status", hi: "वर्तमान ग्लूकोज स्थिति की जाँच करें" } },
      { test_code: "CBC", reason: { en: "Anemia worsens peripheral nerve oxygenation", hi: "एनीमिया परिधीय नसों की ऑक्सीजन की कमी को बढ़ाता है" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Uremic toxins can also cause neuropathy", hi: "यूरैमिक टॉक्सिन्स भी न्यूरोपैथी का कारण बन सकते हैं" } },
      { test_code: "CALCIUM-01", reason: { en: "Calcium levels affect nerve signal transmission", hi: "कैल्शियम का स्तर तंत्रिका संकेतों के संचरण को प्रभावित करता है" } }
    ],
    optional: [
      { test_code: "LIPID", reason: { en: "Assess overall cardiovascular risk", hi: "समग्र हृदय जोखिम का आकलन करें" } }
    ]
  },

  diabetes_cardiac: {
    label: { en: "Diabetic Cardiac Risk concern", hi: "मधुमेह रोगियों में हृदय रोग का जोखिम" },
    summary: {
      en: "Diabetic patients have a 2-4x higher risk of cardiovascular events.",
      hi: "मधुमेह रोगियों में हृदय रोगों का जोखिम 2-4 गुना अधिक होता है।"
    },
    must_do: [
      { test_code: "LIPID", reason: { en: "Diabetic dyslipidemia is a major risk factor", hi: "मधुमेह जनित डिस्लिपिडेमिया एक बड़ा जोखिम कारक है" } },
      { test_code: "HBA1C", reason: { en: "Poor glycemic control accelerates atherosclerosis", hi: "खराब ग्लूकोज नियंत्रण धमनियों के सख्त होने को तेज करता है" } },
      { test_code: "GLU-01", reason: { en: "Assess current glucose levels", hi: "वर्तमान ग्लूकोज स्तर का आकलन करें" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "Assess hematology factors", hi: "हेमेटोलॉजी कारकों का आकलन करें" } },
      { test_code: "KFT", reason: { en: "Kidney damage worsens cardiac outcomes", hi: "किडनी की क्षति हृदय संबंधी परिणामों को खराब करती है" } }
    ],
    optional: [
      { test_code: "SGOT-SGPT", reason: { en: "Assess for hepatic fatty deposition", hi: "लीवर में फैटी जमाव का आकलन करें" } }
    ]
  },

  diabetes_wound: {
    label: { en: "Diabetic Wound / Foot Infection", hi: "मधुमेह रोगी के घाव / पैर का संक्रमण" },
    summary: {
      en: "High blood sugar impairs immune function and delays healing. Monitor closely.",
      hi: "उच्च रक्त शर्करा प्रतिरक्षा प्रणाली को कमजोर करती है और घाव भरने में देरी करती है। बारीकी से निगरानी करें।"
    },
    must_do: [
      { test_code: "GLU-01", reason: { en: "Urgent check to control glucose for wound healing", hi: "घाव भरने के लिए ग्लूकोज को नियंत्रित करने की तत्काल जाँच" } },
      { test_code: "HBA1C", reason: { en: "Assess recent long-term control", hi: "हाल के दीर्घकालिक नियंत्रण का आकलन करें" } },
      { test_code: "CBC", reason: { en: "High WBC count indicates active infection severity", hi: "उच्च डब्ल्यूबीसी काउंट सक्रिय संक्रमण की गंभीरता को दर्शाता है" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Measures severity of inflammatory response", hi: "सूजन संबंधी प्रतिक्रिया की गंभीरता को मापता है" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Evaluate renal filtration before prescribing antibiotics", hi: "एंटीबायोटिक्स लिखने से पहले किडनी के कार्य का मूल्यांकन करें" } },
      { test_code: "URINE", reason: { en: "General health screen", hi: "सामान्य स्वास्थ्य स्क्रीन" } }
    ],
    optional: [
      { test_code: "ESR-01", reason: { en: "Sub-acute tissue infection indicator", hi: "ऊतकों के संक्रमण का उप-तीव्र सूचक" } }
    ]
  },

  diabetes_fever: {
    label: { en: "Diabetic patient with Fever", hi: "मधुमेह रोगी में बुखार" },
    summary: {
      en: "Diabetic patients are prone to severe infections. Monitor glucose and infection markers.",
      hi: "मधुमेह के रोगियों में गंभीर संक्रमण होने की संभावना अधिक होती है। ग्लूकोज और संक्रमण के संकेतकों की निगरानी करें।"
    },
    must_do: [
      { test_code: "GLU-01", reason: { en: "Fever increases cortisol and raises blood sugar", hi: "बुखार कोर्टिसोल को बढ़ाता है और ब्लड शुगर को बढ़ा देता है" } },
      { test_code: "CBC", reason: { en: "WBC differential counts help identify infection type", hi: "डब्ल्यूबीसी डिफरेंशियल काउंट संक्रमण के प्रकार की पहचान में मदद करते हैं" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Highly responsive bacterial infection marker", hi: "बैक्टीरियल संक्रमण के लिए अत्यधिक संवेदनशील संकेतक" } },
      { test_code: "URINE", reason: { en: "Rule out UTI, a common cause of fever in diabetics", hi: "यूटीआई को खारिज करें, जो मधुमेह रोगियों में बुखार का एक आम कारण है" } }
    ],
    recommended: [
      { test_code: "HBA1C", reason: { en: "Assess baseline glycemic status", hi: "आधारभूत ग्लूकोज स्थिति का आकलन करें" } },
      { test_code: "KFT", reason: { en: "Evaluate kidney filtration under infection stress", hi: "संक्रमण के तनाव में किडनी के कार्य का मूल्यांकन करें" } }
    ],
    optional: [
      { test_code: "ESR-01", reason: { en: "General inflammation status", hi: "सामान्य सूजन की स्थिति" } }
    ]
  },

  diabetes_weakness: {
    label: { en: "Diabetic patient with general weakness", hi: "मधुमेह रोगी में सामान्य कमजोरी" },
    summary: {
      en: "Check for hypoglycemia (low sugar), anemia, or kidney issues.",
      hi: "हाइपोग्लाइसीमिया (कम शुगर), एनीमिया या गुर्दे की समस्याओं की जाँच करें।"
    },
    must_do: [
      { test_code: "GLU-01", reason: { en: "Assess current blood sugar (low sugar is a medical emergency)", hi: "वर्तमान ब्लड शुगर का आकलन करें (लो शुगर एक मेडिकल इमरजेंसी है)" } },
      { test_code: "CBC", reason: { en: "Check for associated chronic anemia", hi: "संबंधित पुरानी एनीमिया की जाँच करें" } },
      { test_code: "HBA1C", reason: { en: "Check long-term glucose trend", hi: "दीर्घकालिक ग्लूकोज प्रवृत्ति की जाँच करें" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Evaluate kidney filtration efficiency", hi: "किडनी निस्पंदन दक्षता का मूल्यांकन करें" } },
      { test_code: "URINE", reason: { en: "Evaluate kidney protein leakage", hi: "किडनी प्रोटीन रिसाव का मूल्यांकन करें" } }
    ],
    optional: [
      { test_code: "TFT", reason: { en: "Comorbid thyroid screening", hi: "सह-रुग्णता थायराइड स्क्रीनिंग" } }
    ]
  },

  heart_failure_screen: {
    label: { en: "Breathlessness / Heart Failure screen", hi: "सांस फूलना / हार्ट फेलियर स्क्रीन" },
    summary: {
      en: "Screening to rule out anemia, kidney disease, or cardiovascular risk factors as a cause of breathlessness.",
      hi: "सांस फूलने के कारण के रूप में एनीमिया, गुर्दे की बीमारी या हृदय संबंधी जोखिम कारकों को खारिज करने के लिए स्क्रीनिंग।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Rule out severe anemia as a cause of breathlessness", hi: "सांस फूलने के कारण के रूप में गंभीर एनीमिया को खारिज करें" } },
      { test_code: "LIPID", reason: { en: "Evaluate cardiovascular cholesterol risk factors", hi: "हृदय संबंधी कोलेस्ट्रॉल जोखिम कारकों का मूल्यांकन करें" } },
      { test_code: "KFT", reason: { en: "Rule out fluid overload from renal dysfunction", hi: "गुर्दे की खराबी के कारण शरीर में पानी के संचय को खारिज करें" } }
    ],
    recommended: [
      { test_code: "LFT", reason: { en: "Congestive heart failure can cause liver congestion", hi: "कंजेस्टिव हार्ट फेलियर लीवर में रक्त के संचय का कारण बन सकता है" } },
      { test_code: "GLU-01", reason: { en: "Screen for diabetes, a major heart disease driver", hi: "हृदय रोग के प्रमुख कारण मधुमेह की जांच करें" } }
    ],
    optional: [
      { test_code: "URINE", reason: { en: "General health screening", hi: "सामान्य स्वास्थ्य स्क्रीनिंग" } }
    ]
  },

  lipid_screening: {
    label: { en: "Lipid / Cholesterol screening", hi: "लिपिड / कोलेस्ट्रॉल स्क्रीनिंग" },
    summary: {
      en: "Screening for hyperlipidemia and cardiovascular risk factors.",
      hi: "हाइपरलिपिडिमिया और हृदय संबंधी जोखिम कारकों के लिए स्क्रीनिंग।"
    },
    must_do: [
      { test_code: "LIPID", reason: { en: "Complete lipid panel measures cholesterol, triglycerides, LDL, HDL", hi: "पूर्ण लिपिड पैनल कोलेस्ट्रॉल, ट्राइग्लिसराइड्स, एलडीएल, एचडीएल को मापता है" } }
    ],
    recommended: [
      { test_code: "GLU-01", reason: { en: "Diabetes screening", hi: "मधुमेह स्क्रीनिंग" } },
      { test_code: "CBC", reason: { en: "General health baseline", hi: "सामान्य स्वास्थ्य आधारभूत स्तर" } }
    ],
    optional: [
      { test_code: "LFT", reason: { en: "Liver processes cholesterol; check hepatic baseline", hi: "लीवर कोलेस्ट्रॉल को संसाधित करता है; लीवर के आधारभूत स्तर की जाँच करें" } }
    ]
  },

  palpitation_screen: {
    label: { en: "Palpitations screen", hi: "दिल की धड़कन तेज होना (घबराहट) स्क्रीन" },
    summary: {
      en: "Assess common systemic causes of palpitations such as thyroid excess or anemia.",
      hi: "तेज धड़कन के सामान्य प्रणालीगत कारणों जैसे थायराइड की अधिकता या एनीमिया का आकलन करें।"
    },
    must_do: [
      { test_code: "TFT", reason: { en: "Hyperthyroidism is a highly common cause of palpitations", hi: "हाइपरथायरायडिज्म तेज धड़कन का एक बहुत ही आम कारण है" } },
      { test_code: "CBC", reason: { en: "Severe anemia causes compensatory tachycardia (fast heart rate)", hi: "गंभीर एनीमिया के कारण दिल की धड़कन तेज हो जाती है" } },
      { test_code: "LIPID", reason: { en: "Assess cardiovascular risk status", hi: "हृदय जोखिम स्थिति का आकलन करें" } }
    ],
    recommended: [
      { test_code: "GLU-01", reason: { en: "Rule out glycemic imbalance", hi: "ग्लूकोज के असंतुलन को खारिज करें" } },
      { test_code: "KFT", reason: { en: "Electrolyte/renal assessment", hi: "इलेक्ट्रोलाइट/किडनी मूल्यांकन" } }
    ],
    optional: [
      { test_code: "CALCIUM-01", reason: { en: "Calcium levels affect cardiac rhythm", hi: "कैल्शियम का स्तर हृदय की लय को प्रभावित करता है" } }
    ]
  },

  cardiac_prevention: {
    label: { en: "Cardiac prevention screening", hi: "हृदय रोग रोकथाम स्क्रीनिंग" },
    summary: {
      en: "Preventive metabolic screening for individuals with a family history of heart disease.",
      hi: "हृदय रोग के पारिवारिक इतिहास वाले व्यक्तियों के लिए निवारक चयापचय स्क्रीनिंग।"
    },
    must_do: [
      { test_code: "LIPID", reason: { en: "Assess atherogenic lipid particles", hi: "धमनियों में रुकावट पैदा करने वाले वसा कणों का आकलन करें" } },
      { test_code: "GLU-01", reason: { en: "Diabetes screening", hi: "मधुमेह स्क्रीनिंग" } },
      { test_code: "CBC", reason: { en: "Baseline blood count check", hi: "आधारभूत रक्त गणना की जाँच" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Kidney status check", hi: "किडनी की स्थिति की जाँच" } },
      { test_code: "CRP-QUANT-01", reason: { en: "hs-CRP serves as a major independent cardiovascular risk marker", hi: "hs-CRP एक प्रमुख स्वतंत्र हृदय जोखिम सूचक के रूप में कार्य करता है" } }
    ],
    optional: [
      { test_code: "LFT", reason: { en: "Liver baseline health", hi: "लीवर का आधारभूत स्वास्थ्य" } }
    ]
  },

  heart_attack_urgent: {
    label: { en: "Severe chest pain — Urgent Medical Attention Required", hi: "छाती में तेज दर्द — तत्काल चिकित्सा सहायता की आवश्यकता" },
    summary: {
      en: "🚨 Emergency warning. Please go to the nearest emergency hospital immediately! Recommended baseline enzyme tests.",
      hi: "🚨 आपातकालीन चेतावनी। कृपया तुरंत निकटतम आपातकालीन अस्पताल जाएं! आधारभूत एंजाइम परीक्षणों की सिफारिश की जाती है।"
    },
    must_do: [
      { test_code: "SGOT-SGPT", reason: { en: "AST (SGOT) is historically elevated in acute myocardial damage", hi: "तीव्र हृदय क्षति में एएसटी (एसजीओटी) बढ़ा हुआ होता है" } },
      { test_code: "CBC", reason: { en: "General blood picture", hi: "सामान्य रक्त चित्र" } },
      { test_code: "LIPID", reason: { en: "Evaluate baseline lipid markers", hi: "आधारभूत लिपिड संकेतकों का मूल्यांकन करें" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Renal clearance parameters", hi: "किडनी की कार्यक्षमता के मापदंड" } },
      { test_code: "CRP-QUANT-01", reason: { en: "Assess acute systemic inflammatory response", hi: "तीव्र प्रणालीगत सूजन प्रतिक्रिया का आकलन करें" } }
    ],
    optional: [
      { test_code: "GLU-01", reason: { en: "Screen glucose status", hi: "ग्लूकोज स्थिति की जाँच करें" } }
    ],
    ai_note: {
      en: "Do not wait for lab reports. Call an ambulance or visit the nearest ER immediately if chest pain is crushing or radiates to the left arm.",
      hi: "लैब रिपोर्ट का इंतजार न करें। यदि छाती में तेज दर्द हो या यह बाएं हाथ तक फैले, तो तुरंत एम्बुलेंस बुलाएं या आपातकालीन कक्ष में जाएं।"
    }
  },

  heart_angina: {
    label: { en: "Angina suspected — Recurrent chest pain", hi: "एनजाइना का संदेह — बार-बार छाती में दर्द" },
    summary: {
      en: "Assess cardiovascular risk factors in patients with recurrent, non-acute chest pain.",
      hi: "बार-बार होने वाले, गैर-तीव्र छाती के दर्द वाले रोगियों में हृदय जोखिम कारकों का आकलन करें।"
    },
    must_do: [
      { test_code: "LIPID", reason: { en: "Assess cholesterol accumulation risk", hi: "कोलेस्ट्रॉल जमा होने के जोखिम का आकलन करें" } },
      { test_code: "CBC", reason: { en: "Check for severe anemia as a cause of cardiac ischemia/pain", hi: "हृदय में रक्त की कमी/दर्द के कारण के रूप में गंभीर एनीमिया की जाँच करें" } },
      { test_code: "GLU-01", reason: { en: "Diabetes screening", hi: "मधुमेह स्क्रीनिंग" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Renal health check", hi: "किडनी के स्वास्थ्य की जाँच" } },
      { test_code: "SGOT", reason: { en: "Check baseline myocardial enzymes", hi: "आधारभूत हृदय एंजाइमों की जाँच करें" } }
    ],
    optional: [
      { test_code: "URINE", reason: { en: "General health status check", hi: "सामान्य स्वास्थ्य स्थिति की जाँच" } }
    ]
  },

  tb_high_suspicion: {
    label: { en: "Tuberculosis suspected — Night sweats & Weight loss", hi: "टीबी का संदेह — रात में पसीना और वजन कम होना" },
    summary: {
      en: "High clinical suspicion of active Tuberculosis. Screen immediately.",
      hi: "सक्रिय टीबी का उच्च संदेह। तुरंत स्क्रीनिंग करें।"
    },
    must_do: [
      { test_code: "MANTOUX-01", reason: { en: "Tuberculin Skin Test is the primary screening tool", hi: "ट्यूबरकुलिन स्किन टेस्ट प्राथमिक स्क्रीनिंग टूल है" } },
      { test_code: "ESR-01", reason: { en: "Typically highly elevated (>50 mm/hr) in active TB", hi: "सक्रिय टीबी में आमतौर पर बहुत अधिक बढ़ा हुआ (>50 mm/hr)" } },
      { test_code: "CBC", reason: { en: "Lymphocytosis is a typical TB blood finding", hi: "लिम्फोसाइटोसिस एक विशिष्ट टीबी रक्त खोज है" } }
    ],
    recommended: [
      { test_code: "CRP-QUANT-01", reason: { en: "Assess active inflammatory load", hi: "सक्रिय सूजन के प्रभाव का आकलन करें" } },
      { test_code: "LFT", reason: { en: "Check liver health before initiating hepatotoxic anti-TB therapy", hi: "लीवर के लिए हानिकारक टीबी रोधी चिकित्सा शुरू करने से पहले लीवर के स्वास्थ्य की जाँच करें" } }
    ],
    optional: [
      { test_code: "URINE", reason: { en: "General health screening", hi: "सामान्य स्वास्थ्य स्क्रीनिंग" } }
    ]
  },

  tb_contact: {
    label: { en: "Tuberculosis Contact screening", hi: "टीबी संपर्क स्क्रीनिंग" },
    summary: {
      en: "Screening for individuals with close exposure to a confirmed Tuberculosis patient.",
      hi: "एक पुष्ट टीबी रोगी के निकट संपर्क में रहने वाले व्यक्तियों के लिए स्क्रीनिंग।"
    },
    must_do: [
      { test_code: "MANTOUX-01", reason: { en: "Tuberculin skin test checks for latent TB exposure", hi: "ट्यूबरकुलिन स्किन टेस्ट गुप्त टीबी के संपर्क की जाँच करता है" } },
      { test_code: "CBC", reason: { en: "Check general blood parameters", hi: "सामान्य रक्त मापदंडों की जाँच करें" } }
    ],
    recommended: [
      { test_code: "ESR-01", reason: { en: "Screen for subclinical inflammation", hi: "उप-नैदानिक सूजन के लिए स्क्रीन करें" } }
    ],
    optional: [
      { test_code: "CRP-01", reason: { en: "General inflammatory check", hi: "सामान्य सूजन की जाँच" } }
    ]
  },

  tb_hemoptysis: {
    label: { en: "Cough with Blood — Tuberculosis suspected", hi: "खाँसी में खून — टीबी का संदेह" },
    summary: {
      en: "🚨 Hemoptysis is a critical warning sign. Screen for tuberculosis and consult a pulmonologist immediately.",
      hi: "🚨 थूक में खून आना एक गंभीर चेतावनी संकेत है। टीबी की जांच करें और तुरंत फेफड़ों के रोग विशेषज्ञ से संपर्क करें।"
    },
    must_do: [
      { test_code: "MANTOUX-01", reason: { en: "Screen for TB exposure", hi: "टीबी के संपर्क के लिए स्क्रीन करें" } },
      { test_code: "ESR-01", reason: { en: "High ESR points to active pulmonary infection", hi: "उच्च ईएसआर सक्रिय फेफड़ों के संक्रमण को इंगित करता है" } },
      { test_code: "CBC", reason: { en: "WBC count and hematology indices check", hi: "डब्ल्यूबीसी काउंट और हेमेटोलॉजी सूचकांकों की जाँच" } },
      { test_code: "HB-01", reason: { en: "Evaluate anemia from hemoptysis/blood loss", hi: "खाँसी में खून आने/रक्त की हानि से होने वाले एनीमिया का मूल्यांकन करें" } }
    ],
    recommended: [
      { test_code: "CRP-QUANT-01", reason: { en: "Assess acute tissue damage and inflammation", hi: "तीव्र ऊतक क्षति और सूजन का आकलन करें" } },
      { test_code: "LFT", reason: { en: "Baseline liver panel", hi: "आधारभूत लीवर पैनल" } }
    ],
    optional: [
      { test_code: "PT-01", reason: { en: "Rule out coagulation bleeding disorders", hi: "रक्त के थक्के न जमने के विकार को खारिज करने के लिए" } }
    ]
  },

  tb_screen: {
    label: { en: "Prolonged Cough — TB screen", hi: "लंबे समय से खाँसी — टीबी स्क्रीन" },
    summary: {
      en: "Screening for individuals with a persistent cough lasting more than 2 weeks.",
      hi: "2 सप्ताह से अधिक समय तक लगातार रहने वाली खाँसी वाले व्यक्तियों के लिए स्क्रीनिंग।"
    },
    must_do: [
      { test_code: "MANTOUX-01", reason: { en: "Screen for Mycobacterium tuberculosis infection", hi: "माइकोबैक्टीरियम ट्यूबरकुलोसिस संक्रमण के लिए स्क्रीन करें" } },
      { test_code: "ESR-01", reason: { en: "Inflammatory indicator check", hi: "सूजन संकेतक की जाँच" } },
      { test_code: "CBC", reason: { en: "Check for bacterial leucocytosis or viral lymphopenia", hi: "बैक्टीरियल ल्यूकोसाइटोसिस या वायरल लिम्फोपेनिया की जाँच करें" } }
    ],
    recommended: [
      { test_code: "CRP-QUANT-01", reason: { en: "Inflammatory response evaluation", hi: "सूजन संबंधी प्रतिक्रिया का मूल्यांकन" } }
    ],
    optional: [
      { test_code: "URINE", reason: { en: "General health check", hi: "सामान्य स्वास्थ्य जाँच" } }
    ]
  },

  pregnancy_first_trimester: {
    label: { en: "Pregnancy first trimester / Newly confirmed", hi: "गर्भावस्था की पहली तिमाही / हाल ही में पुष्टि हुई" },
    summary: {
      en: "Early pregnancy antenatal care (ANC) panel is essential to check maternal baseline health.",
      hi: "मां के शुरुआती स्वास्थ्य की जाँच के लिए प्रारंभिक गर्भावस्था प्रसव पूर्व देखभाल (ANC) पैनल आवश्यक है।"
    },
    must_do: [
      { test_code: "ANC-01", reason: { en: "Comprehensive Ante-Natal Care profile", hi: "व्यापक प्रसव पूर्व देखभाल प्रोफाइल" } },
      { test_code: "CBC", reason: { en: "Check baseline maternal hemoglobin levels", hi: "मां के आधारभूत हीमोग्लोबिन स्तर की जाँच करें" } },
      { test_code: "BG", reason: { en: "Confirm blood group ABO and Rh status to prevent incompatibility", hi: "आरएच असंगति से बचने के लिए रक्त समूह एबीओ और आरएच स्थिति की पुष्टि करें" } },
      { test_code: "URINE", reason: { en: "Screen for asymptomatic bacteriuria to prevent early miscarriage", hi: "शुरुआती गर्भपात को रोकने के लिए लक्षण रहित बैक्टीरिया की जांच करें" } }
    ],
    recommended: [
      { test_code: "TFT", reason: { en: "Thyroid hormone is critical for fetal brain development in the 1st trimester", hi: "पहली तिमाही में भ्रूण के मस्तिष्क के विकास के लिए थायराइड हार्मोन महत्वपूर्ण है" } },
      { test_code: "GLU-01", reason: { en: "Screen for pre-existing or early gestational diabetes", hi: "पहले से मौजूद या शुरुआती गर्भकालीन मधुमेह की जांच करें" } }
    ],
    optional: [
      { test_code: "HB-01", reason: { en: "Direct hemoglobin tracking", hi: "सीधे हीमोग्लोबिन की निगरानी" } }
    ]
  },

  pregnancy_second_trimester: {
    label: { en: "Pregnancy second trimester (4-6 months)", hi: "गर्भावस्था की दूसरी तिमाही (4-6 महीने)" },
    summary: {
      en: "Routine mid-pregnancy tracking to screen for gestational diabetes and gestational hypertension.",
      hi: "गर्भकालीन मधुमेह और उच्च रक्तचाप की जांच के लिए गर्भावस्था के मध्य में नियमित ट्रैकिंग।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Monitor maternal physiological anemia", hi: "गर्भावस्था के दौरान होने वाले एनीमिया की निगरानी करें" } },
      { test_code: "URINE", reason: { en: "Screen for gestational proteinuria (pre-eclampsia marker)", hi: "गर्भकालीन प्रोटीनुरिया (प्री-एकलम्पसिया संकेतक) की जांच करें" } },
      { test_code: "GLU-01", reason: { en: "Screen for gestational diabetes mellitus", hi: "गर्भकालीन मधुमेह की जांच करें" } }
    ],
    recommended: [
      { test_code: "TFT", reason: { en: "Monitor maternal thyroid control", hi: "मां के थायराइड नियंत्रण की निगरानी करें" } },
      { test_code: "HB-01", reason: { en: "Monitor direct hemoglobin level", hi: "सीधे हीमोग्लोबिन स्तर की निगरानी करें" } }
    ],
    optional: [
      { test_code: "CALCIUM-01", reason: { en: "Fetal bone growth depletes maternal calcium", hi: "भ्रूण की हड्डियों के विकास से मां में कैल्शियम की कमी होती है" } }
    ]
  },

  pregnancy_third_trimester: {
    label: { en: "Pregnancy third trimester (7-9 months)", hi: "गर्भावस्था की तीसरी तिमाही (7-9 महीने)" },
    summary: {
      en: "Pre-delivery health checks to ensure safe delivery parameters.",
      hi: "सुरक्षित प्रसव सुनिश्चित करने के लिए प्रसव पूर्व स्वास्थ्य जाँच।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Final pre-delivery maternal blood check", hi: "प्रसव से पहले मां के रक्त की अंतिम जाँच" } },
      { test_code: "URINE", reason: { en: "Check for active UTI or pre-eclampsia signs", hi: "सक्रिय यूटीआई या प्री-एकलम्पसिया के संकेतों की जाँच करें" } },
      { test_code: "HB-01", reason: { en: "Final hemoglobin status before labor blood loss", hi: "प्रसव के दौरान खून की कमी से पहले हीमोग्लोबिन की अंतिम स्थिति" } },
      { test_code: "PT-01", reason: { en: "Evaluate coagulation profile before delivery", hi: "प्रसव से पहले थक्के जमने की प्रोफाइल का मूल्यांकन करें" } }
    ],
    recommended: [
      { test_code: "GLU-01", reason: { en: "Screen blood glucose status", hi: "रक्त ग्लूकोज स्थिति की जांच करें" } },
      { test_code: "TFT", reason: { en: "Ensure normal maternal thyroid levels", hi: "मां के थायराइड का सामान्य स्तर सुनिश्चित करें" } }
    ],
    optional: [
      { test_code: "CALCIUM-01", reason: { en: "Monitor calcium levels", hi: "कैल्शियम के स्तर की निगरानी करें" } }
    ]
  },

  fertility_basic: {
    label: { en: "Male fertility concern (Basic)", hi: "पुरुष प्रजनन क्षमता की चिंता (बेसिक)" },
    summary: {
      en: "Initial basic semen parameters check.",
      hi: "प्रारंभिक मूल वीर्य मापदंडों की जाँच।"
    },
    must_do: [
      { test_code: "SEMEN-01", reason: { en: "Semen analysis assesses count, motility, and morphology of sperm", hi: "वीर्य विश्लेषण शुक्राणुओं की संख्या, गतिशीलता और आकार का आकलन करता है" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "General blood health screening", hi: "सामान्य रक्त स्वास्थ्य स्क्रीनिंग" } }
    ],
    optional: [
      { test_code: "BG", reason: { en: "General medical baseline", hi: "सामान्य चिकित्सा आधारभूत स्तर" } }
    ]
  },

  fertility_detailed: {
    label: { en: "Male fertility concern (Detailed)", hi: "पुरुष प्रजनन क्षमता की चिंता (विस्तृत)" },
    summary: {
      en: "Detailed assessment of male fertility factors.",
      hi: "पुरुष प्रजनन क्षमता के कारकों का विस्तृत मूल्यांकन।"
    },
    must_do: [
      { test_code: "SEMEN-01", reason: { en: "Comprehensive semen parameters check", hi: "व्यापक वीर्य मापदंडों की जाँच" } },
      { test_code: "CBC", reason: { en: "Screen for general systemic infections", hi: "सामान्य प्रणालीगत संक्रमणों के लिए स्क्रीन करें" } }
    ],
    recommended: [
      { test_code: "TFT", reason: { en: "Thyroid hormones directly impact spermatogenesis (sperm production)", hi: "थायराइड हार्मोन सीधे स्पर्मेटोजेनेसिस (शुक्राणु उत्पादन) को प्रभावित करते हैं" } },
      { test_code: "GLU-01", reason: { en: "Diabetes can cause erectile/ejaculatory issues", hi: "मधुमेह नपुंसकता/स्खलन संबंधी समस्याओं का कारण बन सकता है" } }
    ],
    optional: [
      { test_code: "KFT", reason: { en: "General baseline health status check", hi: "सामान्य बुनियादी स्वास्थ्य स्थिति की जाँच" } }
    ]
  },

  skin_allergy: {
    label: { en: "Skin itching / Allergy", hi: "त्वचा में खुजली / एलर्जी" },
    summary: {
      en: "Evaluate for allergic reactions or systemic inflammation.",
      hi: "एलर्जी प्रतिक्रियाओं या प्रणालीगत सूजन के लिए मूल्यांकन करें।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Check eosinophil count (raised in allergies)", hi: "इओसिनोफिल काउंट की जाँच करें (एलर्जी में बढ़ा हुआ)" } },
      { test_code: "CRP-01", reason: { en: "Assess for systemic acute inflammation", hi: "प्रणालीगत तीव्र सूजन का आकलन करें" } }
    ],
    recommended: [
      { test_code: "LFT", reason: { en: "Pruritus (itching) can be caused by accumulated liver bile salts", hi: "लीवर के पित्त लवण जमा होने से भी त्वचा में खुजली हो सकती है" } },
      { test_code: "KFT", reason: { en: "Uremic pruritus is a sign of severe kidney waste buildup", hi: "यूरैमिक खुजली गुर्दे के कचरे के गंभीर संचय का संकेत है" } }
    ],
    optional: [
      { test_code: "URINE", reason: { en: "General systemic check", hi: "सामान्य प्रणालीगत जाँच" } }
    ]
  },

  skin_thyroid: {
    label: { en: "Dry skin and hair fall — Thyroid suspected", hi: "सूखी त्वचा और बाल झड़ना — थायराइड का संदेह" },
    summary: {
      en: "Hypothyroidism is a major, common cause of dry, rough skin and diffuse hair loss.",
      hi: "सूखी, खुरदरी त्वचा और बालों के झड़ने का हाइपोथायरायडिज्म एक प्रमुख कारण है।"
    },
    must_do: [
      { test_code: "TFT", reason: { en: "TSH checks thyroid hormone levels", hi: "टीएसएच थायराइड हार्मोन के स्तर की जाँच करता है" } },
      { test_code: "CBC", reason: { en: "Screen for anemia, another major cause of hair loss", hi: "एनीमिया की जांच करें, जो बालों के झड़ने का एक अन्य मुख्य कारण है" } },
      { test_code: "HB-01", reason: { en: "Direct hemoglobin measurement", hi: "सीधे हीमोग्लोबिन का मापन" } }
    ],
    recommended: [
      { test_code: "LIPID", reason: { en: "Hypothyroidism affects fat metabolism", hi: "हाइपोथायरायडिज्म वसा चयापचय को प्रभावित करता है" } },
      { test_code: "CALCIUM-01", reason: { en: "Assess bone and hair mineral health", hi: "हड्डी और बालों के खनिज स्वास्थ्य का आकलन करें" } }
    ],
    optional: [
      { test_code: "URINE", reason: { en: "General health screen", hi: "सामान्य स्वास्थ्य स्क्रीन" } }
    ]
  },

  checkup_young: {
    label: { en: "Routine Full Body Checkup (Young)", hi: "नियमित फुल बॉडी चेकअप (युवा)" },
    summary: {
      en: "Baseline health screening panel for young adults under 30.",
      hi: "30 वर्ष से कम उम्र के युवाओं के लिए आधारभूत स्वास्थ्य स्क्रीनिंग पैनल।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "General blood health status", hi: "सामान्य रक्त स्वास्थ्य स्थिति" } },
      { test_code: "GLU-01", reason: { en: "Glucose screening for early diabetes", hi: "शुरुआती मधुमेह के लिए ग्लूकोज स्क्रीनिंग" } },
      { test_code: "URINE", reason: { en: "Screen for silent kidney or urinary disorders", hi: "छिपे हुए गुर्दे या मूत्र विकारों के लिए स्क्रीन करें" } }
    ],
    recommended: [
      { test_code: "LFT", reason: { en: "Baseline liver function screening", hi: "आधारभूत लीवर फंक्शन स्क्रीनिंग" } },
      { test_code: "KFT", reason: { en: "Baseline kidney function screening", hi: "आधारभूत किडनी फंक्शन स्क्रीनिंग" } }
    ],
    optional: [
      { test_code: "LIPID", reason: { en: "Assess baseline cholesterol levels", hi: "आधारभूत कोलेस्ट्रॉल स्तर का आकलन करें" } }
    ]
  },

  checkup_middle_age: {
    label: { en: "Routine Checkup (45 to 60 years)", hi: "नियमित चेकअप (45 से 60 वर्ष)" },
    summary: {
      en: "Comprehensive health check to screen for chronic lifestyle diseases.",
      hi: "पुरानी जीवनशैली जनित बीमारियों की जांच के लिए व्यापक स्वास्थ्य जाँच।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Complete hematology screening", hi: "पूर्ण हेमेटोलॉजी स्क्रीनिंग" } },
      { test_code: "GLU-01", reason: { en: "Diabetes screening", hi: "मधुमेह स्क्रीनिंग" } },
      { test_code: "LIPID", reason: { en: "Cardiovascular risk check (lipid profile)", hi: "हृदय जोखिम की जाँच (लिपिड प्रोफाइल)" } },
      { test_code: "KFT", reason: { en: "Assess kidney function", hi: "किडनी के कार्य का आकलन करें" } },
      { test_code: "URINE", reason: { en: "Urine examination check", hi: "मूत्र परीक्षण की जाँच" } }
    ],
    recommended: [
      { test_code: "LFT", reason: { en: "Check liver health", hi: "लीवर के स्वास्थ्य की जाँच करें" } },
      { test_code: "TFT", reason: { en: "Thyroid function screen", hi: "थायराइड फंक्शन स्क्रीन" } }
    ],
    optional: [
      { test_code: "CALCIUM-01", reason: { en: "Assess bone density support", hi: "हड्डी के घनत्व के समर्थन का आकलन करें" } }
    ]
  },

  checkup_senior: {
    label: { en: "Routine Checkup (Above 60 years)", hi: "नियमित चेकअप (60 वर्ष से अधिक)" },
    summary: {
      en: "Detailed health screening panel for senior citizens.",
      hi: "वरिष्ठ नागरिकों के लिए विस्तृत स्वास्थ्य स्क्रीनिंग पैनल।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Screen for geriatric anemia or infections", hi: "वृद्धावस्था में होने वाले एनीमिया या संक्रमण की जांच करें" } },
      { test_code: "GLU-01", reason: { en: "Monitor blood sugar control", hi: "ब्लड शुगर नियंत्रण की निगरानी करें" } },
      { test_code: "LIPID", reason: { en: "Cardiovascular risk tracking", hi: "हृदय रोग के जोखिम की ट्रैकिंग" } },
      { test_code: "KFT", reason: { en: "Geriatric kidney function monitoring", hi: "वृद्धावस्था में किडनी के कार्य की निगरानी" } },
      { test_code: "LFT", reason: { en: "Assess liver metabolic function", hi: "लीवर के चयापचय कार्य का आकलन करें" } },
      { test_code: "URINE", reason: { en: "Screen for urinary issues or renal protein loss", hi: "मूत्र समस्याओं या गुर्दे से प्रोटीन के नुकसान की जांच करें" } }
    ],
    recommended: [
      { test_code: "TFT", reason: { en: "Thyroid function screen", hi: "थायराइड फंक्शन स्क्रीन" } },
      { test_code: "CALCIUM-01", reason: { en: "Screen for osteoporosis/calcium depletion risk", hi: "ऑस्टियोपोरोसिस/कैल्शियम की कमी के जोखिम की जांच करें" } }
    ],
    optional: [
      { test_code: "CRP-01", reason: { en: "Check chronic subclinical inflammation levels", hi: "पुरानी उप-नैदानिक सूजन के स्तर की जाँच करें" } }
    ]
  },

  checkup_female_30_45: {
    label: { en: "Routine checkup Female (30 to 45 years)", hi: "महिला नियमित चेकअप (30 से 45 वर्ष)" },
    summary: {
      en: "General metabolic and hormonal check tailored for women in this age group.",
      hi: "इस आयु वर्ग की महिलाओं के लिए विशेष चयापचय और हार्मोनल जाँच।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Screen for anemia, highly common in females", hi: "महिलाओं में बहुत आम एनीमिया की जांच करें" } },
      { test_code: "HB-01", reason: { en: "Hemoglobin levels check", hi: "हीमोग्लोबिन के स्तर की जाँच" } },
      { test_code: "GLU-01", reason: { en: "Blood glucose status check", hi: "ब्लड शुगर की स्थिति की जाँच" } },
      { test_code: "TFT", reason: { en: "Hormonal screening (thyroid is common in females)", hi: "हार्मोनल स्क्रीनिंग (महिलाओं में थायराइड की समस्या आम है)" } },
      { test_code: "URINE", reason: { en: "Screen for urinary tract infection", hi: "पेशाब नली के संक्रमण की जांच करें" } }
    ],
    recommended: [
      { test_code: "LIPID", reason: { en: "Cardiovascular baseline lipid screen", hi: "हृदय संबंधी आधारभूत लिपिड स्क्रीन" } },
      { test_code: "KFT", reason: { en: "Kidney parameters screen", hi: "किडनी के मापदंडों की स्क्रीन" } }
    ],
    optional: [
      { test_code: "CALCIUM-01", reason: { en: "Assess bone mineral support", hi: "हड्डी के खनिज समर्थन का आकलन करें" } }
    ]
  },

  checkup_male_30_45: {
    label: { en: "Routine checkup Male (30 to 45 years)", hi: "पुरुष नियमित चेकअप (30 से 45 वर्ष)" },
    summary: {
      en: "Cardiovascular and metabolic screening tailored for men in this age group.",
      hi: "इस आयु वर्ग के पुरुषों के लिए विशेष हृदय और चयापचय स्क्रीनिंग।"
    },
    must_do: [
      { test_code: "CBC", reason: { en: "Baseline blood health check", hi: "आधारभूत रक्त स्वास्थ्य की जाँच" } },
      { test_code: "GLU-01", reason: { en: "Assess blood glucose", hi: "ब्लड शुगर का आकलन करें" } },
      { test_code: "LIPID", reason: { en: "Screen for lipid buildup/cardiac risk factors", hi: "वसा के जमाव/हृदय जोखिम कारकों के लिए स्क्रीन करें" } },
      { test_code: "URINE", reason: { en: "General health screen", hi: "सामान्य स्वास्थ्य स्क्रीन" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Renal parameters screening", hi: "गुर्दे के मापदंडों की स्क्रीनिंग" } },
      { test_code: "LFT", reason: { en: "Liver health screening (fatty liver risk)", hi: "लीवर स्वास्थ्य screening (फैटी लीवर का जोखिम)" } }
    ],
    optional: [
      { test_code: "CALCIUM-01", reason: { en: "General health screen", hi: "सामान्य स्वास्थ्य स्क्रीन" } }
    ]
  },

  bone_pain: {
    label: { en: "Bone pain or fracture risk", hi: "हड्डियों में दर्द या फ्रैक्चर का खतरा" },
    summary: {
      en: "Assess bone density support parameters and minerals.",
      hi: "हड्डी के घनत्व के सहायक मापदंडों और खनिजों का आकलन करें।"
    },
    must_do: [
      { test_code: "CALCIUM-01", reason: { en: "Serum calcium is critical for bone mineralization", hi: "हड्डियों के खनिजीकरण के लिए सीरम कैल्शियम महत्वपूर्ण है" } },
      { test_code: "CBC", reason: { en: "General baseline health indices check", hi: "सामान्य आधारभूत स्वास्थ्य सूचकांकों की जाँच" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Kidneys regulate calcium excretion; check renal function", hi: "किडनी कैल्शियम उत्सर्जन को नियंत्रित करती है; किडनी के कार्य की जाँच करें" } },
      { test_code: "URIC_ACID", reason: { en: "Uric acid deposits can cause joint/bone pains", hi: "यूरिक एसिड का जमाव जोड़ों/हड्डियों में दर्द का कारण बन सकता है" } }
    ],
    optional: [
      { test_code: "RF", reason: { en: "Rule out Rheumatoid Arthritis as a cause of skeletal pain", hi: "कंकाल के दर्द के कारण के रूप में रूमेटोइड आर्थराइटिस को खारिज करें" } }
    ]
  },

  calcium_deficiency: {
    label: { en: "Muscle cramps / weakness", hi: "मांसपेशियों में ऐंठन / कमजोरी" },
    summary: {
      en: "Calcium ions are essential for muscle contraction. Assess serum calcium levels.",
      hi: "मांसपेशियों के संकुचन के लिए कैल्शियम आयन आवश्यक हैं। सीरम कैल्शियम के स्तर का आकलन करें।"
    },
    must_do: [
      { test_code: "CALCIUM-01", reason: { en: "Low calcium causes muscle tetany/cramps", hi: "कैल्शियम की कमी से मांसपेशियों में ऐंठन/जकड़न होती है" } },
      { test_code: "CBC", reason: { en: "General hematology indices check", hi: "सामान्य हेमेटोलॉजी सूचकांकों की जाँच" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Evaluate kidney electrolyte regulation", hi: "किडनी इलेक्ट्रोलाइट नियमन का मूल्यांकन करें" } }
    ],
    optional: [
      { test_code: "GLU-01", reason: { en: "Rule out diabetic-related cramps", hi: "मधुमेह से संबंधित ऐंठन को खारिज करें" } }
    ]
  },

  calcium_neuro: {
    label: { en: "Numbness or tingling in hands/feet", hi: "हाथों/पैरों में सुन्नता या झुनझुनी" },
    summary: {
      en: "Peripheral nerve symptoms. Assess calcium, glucose, and thyroid factors.",
      hi: "परिधीय तंत्रिका के लक्षण। कैल्शियम, ग्लूकोज और थायराइड कारकों का आकलन करें।"
    },
    must_do: [
      { test_code: "CALCIUM-01", reason: { en: "Hypocalcemia causes paresthesia (numbness/tingling)", hi: "हाइपोकैल्सीमिया पेरेस्टेसिया (सुन्नता/झुनझुनी) का कारण बनता है" } },
      { test_code: "CBC", reason: { en: "Check for megaloblastic anemia (B12 deficiency sign)", hi: "मेगालोब्लास्टिक एनीमिया (B12 की कमी का संकेत) की जाँच करें" } },
      { test_code: "GLU-01", reason: { en: "Rule out diabetic neuropathy", hi: "डायबिटिक न्यूरोपैथी को खारिज करने के लिए" } }
    ],
    recommended: [
      { test_code: "KFT", reason: { en: "Assess uremic toxin status", hi: "यूरैमिक टॉक्सिन स्थिति का आकलन करें" } },
      { test_code: "TFT", reason: { en: "Hypothyroidism can cause nerve entrapment syndromes", hi: "हाइपोथायरायडिज्म नसों के दबने के लक्षणों का कारण बन सकता है" } }
    ],
    optional: [
      { test_code: "LIPID", reason: { en: "General metabolic screen", hi: "सामान्य चयापचय स्क्रीन" } }
    ]
  },

  bp_monitor: {
    label: { en: "High BP monitoring", hi: "उच्च बीपी (रक्तचाप) की निगरानी" },
    summary: {
      en: "Regular metabolic screening for hypertensive patients to prevent cardiovascular and kidney damage.",
      hi: "हृदय और गुर्दे की क्षति को रोकने के लिए उच्च रक्तचाप के रोगियों के लिए नियमित चयापचय स्क्रीनिंग।"
    },
    must_do: [
      { test_code: "LIPID", reason: { en: "Hypertension + high lipids dramatically increase stroke/cardiac risks", hi: "उच्च रक्तचाप + उच्च वसा स्ट्रोक/हृदय जोखिम को नाटकीय रूप से बढ़ाते हैं" } },
      { test_code: "KFT", reason: { en: "Monitor hypertensive nephropathy (kidney damage)", hi: "उच्च रक्तचाप जनित नेफ्रोपैथी (किडनी की क्षति) की निगरानी करें" } },
      { test_code: "URINE", reason: { en: "Screen for early microalbuminuria", hi: "शुरुआती माइक्रोएल्ब्यूमिनुरिया की जांच करें" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "Baseline blood count monitoring", hi: "आधारभूत रक्त गणना की निगरानी" } },
      { test_code: "GLU-01", reason: { en: "Screen for co-existing diabetes risk", hi: "सह-मौजूद मधुमेह के जोखिम की जांच करें" } }
    ],
    optional: [
      { test_code: "CREAT-01", reason: { en: "Evaluate glomerular filtration rate", hi: "ग्लोमेरुलर निस्पंदन दर का मूल्यांकन करें" } }
    ]
  },

  bp_new: {
    label: { en: "High BP suspected (New onset)", hi: "उच्च बीपी का संदेह (नया शुरुआत)" },
    summary: {
      en: "Initial screening for newly discovered high blood pressure to check for secondary causes and cardiovascular baseline.",
      hi: "माध्यमिक कारणों और हृदय आधारभूत स्तर की जाँच के लिए नए खोजे गए उच्च रक्तचाप की प्रारंभिक स्क्रीनिंग।"
    },
    must_do: [
      { test_code: "LIPID", reason: { en: "Assess baseline lipids", hi: "आधारभूत लिपिड का आकलन करें" } },
      { test_code: "KFT", reason: { en: "Rule out renal disease as a secondary cause of hypertension", hi: "उच्च रक्तचाप के माध्यमिक कारण के रूप में किडनी रोग को खारिज करें" } },
      { test_code: "GLU-01", reason: { en: "Diabetes screening", hi: "मधुमेह screening" } },
      { test_code: "URINE", reason: { en: "Screen for renal protein leakage", hi: "गुर्दे से प्रोटीन रिसाव की जांच करें" } }
    ],
    recommended: [
      { test_code: "CBC", reason: { en: "General health screening baseline", hi: "सामान्य स्वास्थ्य स्क्रीनिंग आधारभूत स्तर" } }
    ],
    optional: [
      { test_code: "TFT", reason: { en: "Hyperthyroidism can cause high systolic BP", hi: "हाइपरथायरायडिज्म उच्च सिस्टोलिक बीपी का कारण बन सकता है" } }
    ]
  }
};
