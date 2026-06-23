const { KNOWLEDGE_BASE } = require('./aiKnowledgeBase');

const LANG_HINDI_WORDS = /[क-ह]/;
const HINGLISH_MARKERS = /(hai|ho|ka|ki|ke|kya|nahi|hain|hoga|kar|karo|karein|raha|rahi|wala|wali|kaun|kahan|kab|kyu|kyon|acha|theek|chahiye|sakta|sakti|sakte|batayein|bolo|sunao|aap|tum|mujhe|mera|meri|apna|apni|aana|jana|dena|lena|book|test|report|price|kitna|kitne|bahut|kam|zyada|thoda|sab|dikh|dekh|ho|aur|bhi|toh|to|abhi|kal|aaj|subah)|\b(hello|hi|thanks|okay|ok|fine|good|great|yes|no|please|sorry)\b/i;

function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  const t = text.trim();
  if (!t) return 'en';
  if (LANG_HINDI_WORDS.test(t) || /[ीुूोैेॉंँ]/.test(t)) return 'hi';
  if (HINGLISH_MARKERS.test(t) && t.split(/\s+/).some(w => /[क-ह]/.test(w) || /^(hai|ho|kya|nahi|hain|hoga|karo|karein|chahiye|sakta|mera|aap|mujhe|kaun|kahan|kab|kitna|kitne|theek|acha|bahut|thoda|kal|aaj|abhi|aur|bhi|sab|dikh|dekh|bolo|sunao|wala|raha)$/i.test(w))) return 'hi';
  if (t.split(/\s+/).some(w => /^(hai|ho|kya|nahi|hain|hoga|karo|karein|chahiye|sakta|mera|aap|mujhe|kaun|kahan|kab|kitna|kitne|theek|acha|bahut|thoda|kal|aaj|abhi|aur|bhi|sab)$/i.test(w))) return 'hi';
  return 'en';
}

function detectIntent(text, lang) {
  const t = text.toLowerCase().trim();

  const patterns = {
    price: /(kitna|kitne|price|cost|rate|price\s*ka|daam|mulya|cost\s*ka|charge|kitne\s*rupaye|kitne\s*hai|kitna\s*hai|price\s*kya|cost\s*kya|rate\s*kya|price\s*batayein|cost\s*batayein|mrp)/i,
    booking: /(book|booking|appointment|date|time|slot|bulao|bulaye|aana|aayein|ghar\s*chalein|ghar\s*collection|home\s*collection|book\s*karao|book\s*kar\w*|appointment\s*lena|sample\s*lena|test\s*kar\w*|scheduled|schedule\s*test|slot\s*chahiye)/i,
    symptom: /(fever|bukhar|bukh|thand|cough|khansi|sard|cold|weakness|kamjori|kamzor|thakan|pain|drd|dard|headache|sir\s*drd|sir\s*dard|body\s*pain|joint\s*pain|joodo|jodo\s*dard|vomiting|ulti|diarrhea|dast|loose\s*motion|typhoid|dengue|malaria|infection|bimari|bemaar|bim|ill|itching|khujli|rash|swelling|sujan|numb|sun\s*|jhalan|jallan|burning|problem|complaint|disease)/i,
    report: /(report|result|outcome|lab\s*result|test\s*result|report\s*status|report\s*kab|report\s*kahan|report\s*kaise|report\s*dekh\w*|report\s*mil\w*|report\s*aay\w*|report\s*download|kya\s*report|update|report\s*ready|report\s*check)/i,
    preparation: /(fasting|fast|upwas|khali\s*pait|preparation|prep|taiyari|kaise\s*taiyar|kya\s*khayein|kya\s*khana|kya\s*karein|kya\s*na\s*karein|kya\s*le\s*kar\s*jayein|bina\s*khaye|empty\s*stomach|before\s*test|test\s*se\s*pahle|test\s*se\s*pehle|guidelines|instructions|kya\s*karna|kya\s*karni|kaise\s*lena|kaise\s*le|kaise\s*khaye|kaise\s*karu|kaise\s*kare)/i,
    urgent: /(urgent|emergency|immediately|turant|jaldi|jaldi\s*se|abhi\s*chahiye|abhi|fast|fast\s*service|emergency\s*mein|critical|bahut\s*zaroori|immediate|right\s*now|asap|at\s*once)/i,
    reportExplain: /(my\s*report|meri\s*report|report\s*aaya|result\s*aaya|value|normal|abnormal|high|low|range|reference|samjhao|samjhaye|explain|meaning\s*of|mtlb|matlab|ka\s*mtlb|ka\s*matlab|interpret|interpretation|level|TSH|sugar|Hb|hemoglobin|platelet|CBC\s*report|lipid\s*report|thyroid\s*report)/i,
    casual: /(hello|hi|hey|ji|namaste|namaskar|pranam|\bsana\b|kais[ae]\s*ho|kais[ae]\s*hain|kese\s*ho|kese\s*hain|kya\s*haal|kiya\s*haal|kya\s*hal|hal\s*hai|how\s*are\s*you|how\s*r\s*u|how\s*are\s*u|sup|was\s*su|good\s*morning|good\s*evening|good\s*night|thank|thanks|dhanyawad|shukriya|ok|okay|okkk|bye|goodbye|alvida|achha|theek\s*hai|fine|nice|great|welcome|swagat|yes|no|nahi|haan|haa|hmm|nope|yep|yup|huh|haan\s*ji)/i,
    discount: /(discount|coupon|offer|deal|saving|save\s*|cheap|sasta|sasti|saste|mrp|price\s*mein\s*chhut|price\s*mein\s*kya|special\s*offer|promo|promocode|coupon\s*code|coupon\s*lagao|chhoot|chhut)/i,
    package: /(package|pack|bundle|combo|full\s*body|complete\s*checkup|health\s*package|saara|all\s*test|sab\s*test|sabhi\s*test|poore\s*test|full\s*checkup|body\s*checkup|poora\s*checkup)/i,
    contact: /(address|pata|location|phone|mobile|call\s*kare|contact|phone\s*number|mobile\s*number|timing|time|kab\s*khulti|open|close|kahan\s*hai|directions|map|reach|aaye\s*kaise|phone\s*karo|call)/i,
    labInfo: /(lab|laboratory|NABL|accreditation|certified|certificate|quality|standard|testing\s*center|pathology)/i,
    privacy: /(data|privacy|private|secret|confidential|personal\s*info|personal\s*information|patient\s*data|patient\s*info|SPL[-\s]?\d+|SPL[-\s]?APT)/i,
    name: /(mera\s*naam|my\s*name|main\s*[a-zA-Z\s]+hoon|i\s*am\s*[a-zA-Z\s]+)/i
  };

  for (const [intent, pattern] of Object.entries(patterns)) {
    if (pattern.test(t)) return intent;
  }

  return 'general';
}

function findTestByQuery(query) {
  const q = query.toLowerCase().trim();
  const kb = KNOWLEDGE_BASE;
  let matches = [];

  const qWords = q.split(/\s+/).filter(w => w.length > 2);
  const exactMatch = Object.entries(kb.tests).find(
    ([code, test]) => test.name.toLowerCase() === q || code.toLowerCase() === q
  );
  if (exactMatch) return [{ code: exactMatch[0], ...exactMatch[1] }];

  for (const [code, test] of Object.entries(kb.tests)) {
    const name = test.name.toLowerCase();
    const aliases = (test.aliases || []).map(a => a.toLowerCase());
    if (name === q || code.toLowerCase() === q || aliases.some(a => a === q)) {
      return [{ code, ...test }];
    }
  }

  for (const [code, test] of Object.entries(kb.tests)) {
    const name = test.name.toLowerCase();
    const aliases = (test.aliases || []).map(a => a.toLowerCase());
    const codeLower = code.toLowerCase();
    if (q.includes(codeLower) || q.includes(name)) {
      matches.push({ code, ...test });
    }
  }

  if (matches.length === 0) {
    for (const [code, test] of Object.entries(kb.tests)) {
      const name = test.name.toLowerCase();
      const aliases = (test.aliases || []).map(a => a.toLowerCase());
      const codeLower = code.toLowerCase();
      if (qWords.some(w => w.length > 2 && (name.includes(w) || codeLower.includes(w) || aliases.some(a => a.includes(w))))) {
        matches.push({ code, ...test });
      }
    }
  }

  if (matches.length === 0) {
    for (const [code, test] of Object.entries(kb.tests)) {
      const name = test.name.toLowerCase();
      const codeLower = code.toLowerCase();
      if (name.includes(q) || codeLower.includes(q)) {
        matches.push({ code, ...test });
      }
    }
  }

  return matches.slice(0, 5);
}

function findPackageByQuery(query) {
  const q = query.toLowerCase().trim();
  return KNOWLEDGE_BASE.packages.filter(pkg =>
    pkg.name.toLowerCase().includes(q) ||
    pkg.code.toLowerCase().includes(q) ||
    pkg.description.en.toLowerCase().includes(q) ||
    pkg.description.hi.toLowerCase().includes(q)
  );
}

function findSymptomMatch(query) {
  const q = query.toLowerCase().trim();
  const sm = KNOWLEDGE_BASE.symptomToTests;
  for (const [key, data] of Object.entries(sm)) {
    if (q.includes(key)) return data;
  }
  return null;
}

function buildSystemPrompt(lang, session) {
  const kb = KNOWLEDGE_BASE;
  const l = lang === 'hi' ? 'hi' : 'en';
  const o = lang === 'hi' ? 'en' : 'hi';

  let allTests = '';
  for (const [code, test] of Object.entries(kb.tests)) {
    const fastingStr = test.fasting ? 'Fasting: REQUIRED' : 'Fasting: NOT required';
    allTests += `- ${test.name} (Code: ${code}): ₹${test.price}, ${test.sampleType}, ${fastingStr}, Home collection: ${test.homeCollection ? 'Yes' : 'No'}\n`;
  }

  let allPackages = '';
  for (const pkg of kb.packages) {
    allPackages += `- ${pkg.name} (${pkg.code}): ₹${pkg.price} ${pkg.savings}\n  Tests: ${pkg.tests.join(', ')}\n  Description: ${pkg.description[l]}\n`;
  }

  let allCoupons = '';
  for (const [code, c] of Object.entries(kb.coupons)) {
    allCoupons += `- ${code}: ${c.description[l]} (Type: ${c.type}, Discount: ${c.discount}, Min order: ₹${c.minOrder})\n`;
  }

  let allRanges = '';
  for (const [key, r] of Object.entries(kb.normalRanges)) {
    let minStr = typeof r.min === 'object' ? `Male: ${r.min.m}, Female: ${r.min.f}` : r.min;
    let maxStr = typeof r.max === 'object' ? `Male: ${r.max.m}, Female: ${r.max.f}` : r.max;
    allRanges += `- ${key}: ${minStr} – ${maxStr} ${r.unit}\n`;
  }

  let symptomMappings = '';
  for (const [symptom, data] of Object.entries(kb.symptomToTests)) {
    symptomMappings += `- "${symptom}" → Tests: ${data.tests.join(', ')}\n`;
  }

  let sessionContext = '';
  if (session) {
    const s = session;
    const parts = [];
    if (s.patientName) parts.push(`Patient Name: ${s.patientName}`);
    if (s.patientMobile) parts.push(`Mobile: ${s.patientMobile}`);
    if (s.patientAge) parts.push(`Age: ${s.patientAge}`);
    if (s.patientGender) parts.push(`Gender: ${s.patientGender}`);
    if (s.selectedTests && s.selectedTests.length > 0) parts.push(`Selected Tests: ${s.selectedTests.join(', ')}`);
    if (s.lastIntent) parts.push(`Last Intent: ${s.lastIntent}`);
    if (parts.length > 0) sessionContext = `\n\nSESSION STATE:\n${parts.join('\n')}`;
  }

  return `You are Sana AI, the official AI assistant for Sana Pathology Lab. You work at a pathology lab in India and help patients with test information, booking, and health guidance.

## YOUR PERSONALITY
- Warm, friendly, and professional — like a helpful lab receptionist
- Mirror the user's language exactly: Hindi in → Hindi out, English in → English out, Hinglish in → Hinglish out
- Be concise and direct. Maximum 3-4 sentences per response.
- NEVER repeat the menu of options unless the user explicitly asks what you can do
- Respond naturally to what was actually said

## GOLDEN RULES
1. NEVER guess a price — ONLY use the test prices listed below. If a test isn't in the list, say "Iske baare mein call karein: +91 6396786939"
2. NEVER diagnose the patient. Always end symptom/test suggestions with "Yeh sirf guidance hai, doctor se zaroor milein."
3. NEVER share another patient's data. If someone asks for another person's report, ask them to confirm their own mobile number first.
4. NEVER say "I don't know" — always fallback to WhatsApp: "wa.me/916396786939 par message karein"
5. EVERY response must have a next step — "Kya book karein?", "Aur kuch batayein?", "WhatsApp karein?"
6. Remember everything from the conversation. Don't ask for name/mobile again if already provided.

## LAB INFO
- Name: ${kb.lab.name}
- Address: ${kb.lab.address[l]}
- Timings: ${kb.lab.timings[l]}
- Phone: ${kb.lab.phone}
- WhatsApp: ${kb.lab.whatsapp}
- Email: ${kb.lab.email}
- Home Collection: ${kb.lab.homeCollection[l]}
- ${kb.lab.nabl[l]}

## ALL TESTS AND PRICES (USE ONLY THESE PRICES)
${allTests}

## HEALTH PACKAGES
${allPackages}

## COUPONS / DISCOUNTS
${allCoupons}

## NORMAL REFERENCE RANGES (for explaining reports only)
${allRanges}

## SYMPTOM → TEST RECOMMENDATIONS (use only as guidance)
${symptomMappings}

## DOCTORS
${kb.doctors.map(d => `- ${d.name}, ${d.qualification}, ${d.specialization}, Fee: ${d.consultationFee}`).join('\n')}

## FAQ
- Timings: ${kb.faq.timings[l]}
- Home Collection: ${kb.faq['home collection'][l]}
- Reports: ${kb.faq.report[l]}
- Payment: ${kb.faq.payment[l]}
- Booking: ${kb.faq.booking[l]}
- NABL: ${kb.faq.nabl[l]}${sessionContext}`;
}

function generatePriceResponse(testQuery, lang) {
  const matches = findTestByQuery(testQuery);
  if (matches.length === 0) return null;

  if (lang === 'hi') {
    let resp = matches.map(t => {
      let info = `${t.name} — ₹${t.price}`;
      if (t.fasting) info += ' — खाली पेट रहना जरूरी';
      return `• ${info}`;
    }).join('\n');
    resp += '\n\nघर पर मुफ्त सैंपल कलेक्शन उपलब्ध है। क्या आप बुक करना चाहेंगे?';
    return resp;
  }

  let resp = matches.map(t => {
    let info = `${t.name} — ₹${t.price}`;
    if (t.fasting) info += ' — Fasting required';
    return `• ${info}`;
  }).join('\n');
  resp += '\n\nFree home sample collection available. Would you like to book?';
  return resp;
}

function generatePrepResponse(testQuery, lang) {
  const matches = findTestByQuery(testQuery);
  if (matches.length === 0) return null;

  if (lang === 'hi') {
    return matches.map(t =>
      `${t.name}:\n${t.prep.hi}\nकीमत: ₹${t.price}\nनमूना: ${t.sampleType}`
    ).join('\n\n');
  }

  return matches.map(t =>
    `${t.name}:\n${t.prep.en}\nPrice: ₹${t.price}\nSample: ${t.sampleType}`
  ).join('\n\n');
}

function generatePackageResponse(query, lang) {
  const matches = findPackageByQuery(query);
  const all = matches.length > 0 ? matches : KNOWLEDGE_BASE.packages;

  if (lang === 'hi') {
    let resp = 'हमारे पैकेज:\n';
    all.forEach(p => {
      resp += `\n• ${p.name} — ₹${p.price}`;
      if (p.savings) resp += ` (${p.savings})`;
      resp += `\n  ${p.description.hi}`;
    });
    resp += '\n\nबुक करने के लिए "book" लिखें या +91 6396786939 पर WhatsApp करें।';
    return resp;
  }

  let resp = 'Our Packages:\n';
  all.forEach(p => {
    resp += `\n• ${p.name} — ₹${p.price}`;
    if (p.savings) resp += ` (${p.savings})`;
    resp += `\n  ${p.description.en}`;
  });
  resp += '\n\nTo book, type "book" or WhatsApp +91 6396786939.';
  return resp;
}

function generateLabInfoResponse(query, lang) {
  const lab = KNOWLEDGE_BASE.lab;
  if (lang === 'hi') {
    return `${lab.name}\n\nपता: ${lab.address.hi}\n\nसमय: ${lab.timings.hi}\n\nफोन: ${lab.phone}\nईमेल: ${lab.email}\n\n${lab.homeCollection.hi}\n\n${lab.nabl.hi}\n\nव्हाट्सएप: wa.me/916396786939`;
  }
  return `${lab.name}\n\nAddress: ${lab.address.en}\n\nTimings: ${lab.timings.en}\n\nPhone: ${lab.phone}\nEmail: ${lab.email}\n\n${lab.homeCollection.en}\n\n${lab.nabl.en}\n\nWhatsApp: wa.me/916396786939`;
}

function generateUrgentResponse(lang) {
  if (lang === 'hi') {
    return 'तुरंत कार्रवाई के लिए:\n1. तुरंत WhatsApp करें: wa.me/916396786939\n2. या कॉल करें: +91 6396786939\n\nहम जल्द से जल्द व्यवस्था करेंगे।';
  }
  return 'For immediate action:\n1. WhatsApp us now: wa.me/916396786939\n2. Or call: +91 6396786939\n\nWe will arrange ASAP.';
}

function generateCasualResponse(text, lang) {
  const t = text.toLowerCase().trim();
  if (lang === 'hi') {
    if (/namaste|namaskar|pranam/.test(t)) return 'नमस्ते! मैं साना एआई हूँ। बताइए, कौन सा टेस्ट करवाना है या कोई सवाल है?';
    if (/kais[ae]\s*ho|kais[ae]\s*hain|kese\s*ho|kese\s*hain|kya\s*haal|kiya\s*haal|kya\s*hal|hal\s*hai|how\s*are\s*you/.test(t)) return 'Main bilkul theek hoon, shukriya! Aap sunao — kaunsa test karwana hai ya koi sawaal hai?';
    if (/thank|shukriya|dhanyawad/.test(t)) return 'Aapka swagat hai! Kya aur kuch madad chahiye?';
    if (/bye|goodbye|alvida/.test(t)) return 'Alvida! Swasth rahein. Kabhi bhi zaroorat ho, hum yahan hain.';
    if (/^sana/i.test(t)) return 'Haan ji! Main Sana AI hoon. Bataayein — test price, booking, report ya koi aur madad?';
    if (/^ji$|^haan$|^haa$|^hmm$|^acha$/.test(t)) return 'Haan ji! Bataayein — test price, booking, report ya koi aur madad?';
    if (/^nahi$|^na$|^no$/.test(t)) return 'Theek hai! Koi aur sawaal ho to bataayein. Test price, booking, report — jo bhi chahiye.';
    return 'Namaste! Main Sana AI hoon. Bataayein — test ke baare mein jaankari, booking, ya report?';
  }
  if (/how are you/.test(t) || /how are/.test(t) || /how r u/.test(t) || /how r/.test(t) || /kya haal/.test(t) || /kiya haal/.test(t)) return "Main bilkul theek hoon, shukriya! Aap sunao — kaunsa test karwana hai ya koi sawaal hai?";
  if (/thank/.test(t)) return "You're welcome! Is there anything else I can help with?";
  if (/hi|hello|hey/.test(t)) return "Hello! I'm Sana AI, your lab assistant. How can I help you today?";
  if (/^sana/i.test(t)) return "That's me! Sana AI at your service. How can I help — test prices, booking, or reports?";
  if (/^ji$|yes|yep|yup|yeah|haan|hmm/.test(t)) return "How can I help you today? Test prices, booking, or reports?";
  if (/^no$|^nahi$|^na$|nope/.test(t)) return "Alright! Let me know if you need anything — test prices, booking, health advice.";
  if (/good morning/.test(t)) return "Good morning! How can I assist you with your health checkup today?";
  if (/good evening/.test(t)) return "Good evening! How can I help you today?";
  if (/good night/.test(t)) return "Good night! Take care. We're here whenever you need us.";
  if (/bye|goodbye/.test(t)) return "Goodbye! Stay healthy. Feel free to reach out anytime.";
  return "Hello! I'm Sana AI. Tell me — looking for test prices, booking, reports, or something else?";
}

function generateBookingResponse(lang) {
  if (lang === 'hi') {
    return 'Booking ke liye yeh jaankari chahiye:\n\n1. Aapka naam?\n2. Mobile number?\n3. Kaunsa test?\n4. Kab (date aur time)?\n5. Ghar aana hai ya lab?\n\nYa seedha WhatsApp karein: wa.me/916396786939';
  }
  return 'To book, I need:\n\n1. Your name?\n2. Mobile number?\n3. Which test(s)?\n4. Preferred date and time?\n5. Home collection or lab visit?\n\nOr WhatsApp directly: wa.me/916396786939';
}

function generateGeneralResponse(text, query, lang) {
  const t = text.toLowerCase().trim();
  const lab = KNOWLEDGE_BASE.lab;

  if (/price|kitna|kitne|cost|rate|daam/.test(t)) {
    const r = generatePriceResponse(t, lang);
    if (r) return r;
  }

  if (/discount|coupon|offer|chhoot/.test(t)) {
    if (lang === 'hi') {
      let resp = 'Coupon codes:\n';
      for (const [code, c] of Object.entries(KNOWLEDGE_BASE.coupons)) {
        resp += `\n• ${code}: ${c.description.hi}`;
      }
      resp += '\n\nBooking ke time apply karein.';
      return resp;
    }
    let resp = 'Available Coupons:\n';
    for (const [code, c] of Object.entries(KNOWLEDGE_BASE.coupons)) {
      resp += `\n• ${code}: ${c.description.en}`;
    }
    resp += '\n\nApply at booking.';
    return resp;
  }

  if (/package|pack|full\s*body|checkup/.test(t)) {
    return generatePackageResponse(t, lang);
  }

  if (/address|pata|location|kahan|directions/.test(t)) {
    return generateLabInfoResponse(t, lang);
  }

  if (/timing|time|kab\s*khulti|open|close/.test(t)) {
    if (lang === 'hi') return `Timings: ${lab.timings.hi}\n\nAddress: ${lab.address.hi}\n\nPhone: ${lab.phone}`;
    return `Timings: ${lab.timings.en}\n\nAddress: ${lab.address.en}\n\nPhone: ${lab.phone}`;
  }

  if (/whatsapp|wa\.me|chat|message/.test(t)) {
    if (lang === 'hi') return `WhatsApp karein: wa.me/916396786939`;
    return `WhatsApp us: wa.me/916396786939`;
  }

  if (/doctor|consult|specialist/.test(t)) {
    if (lang === 'hi') {
      let resp = 'Hamare doctors:\n';
      KNOWLEDGE_BASE.doctors.forEach(d => {
        resp += `\n• ${d.name}, ${d.qualification}\n  ${d.specialization} — Fee: ${d.consultationFee}`;
      });
      resp += '\n\nYeh sirf guidance hai, doctor se zaroor milein.';
      return resp;
    }
    let resp = 'Our Doctors:\n';
    KNOWLEDGE_BASE.doctors.forEach(d => {
      resp += `\n• ${d.name}, ${d.qualification}\n  ${d.specialization} — Fee: ${d.consultationFee}`;
    });
    return resp;
  }

  if (/fasting|prep|taiyari|test\s*se\s*pahle|kya\s*khayein/.test(t)) {
    const r = generatePrepResponse(t, lang);
    if (r) return r;
  }

  if (/book|appointment|bulao|bulaye/.test(t)) {
    return generateBookingResponse(lang);
  }

  if (/nabl|accredit|certif|quality/.test(t)) {
    if (lang === 'hi') return `${lab.nabl.hi}\n\nHum ISO 9001:2015 certified bhi hain.`;
    return `${lab.nabl.en}\n\nWe are also ISO 9001:2015 certified.`;
  }

  const casualMatch = detectIntent(text, lang);
  if (casualMatch === 'casual') {
    return generateCasualResponse(text, lang);
  }

  if (lang === 'hi') {
    return 'Main samajh gaya aapka sawaal, lekin iske baare mein mujhe specific jaankari nahi hai. Main ye sab madad kar sakta hoon:\n\n📋 Test prices & details\n📅 Appointment booking\n🔍 Report tracking\n🩺 Health & symptom advice\n🏠 Free home collection info\n💰 Discounts & coupons\n\nBataayein, kaunsi category mein madad chahiye?';
  }
  return 'I understand your question, but I don\'t have specific information about that. Here\'s what I can help with:\n\n📋 Test prices & details\n📅 Appointment booking\n🔍 Report tracking\n🩺 Health & symptom advice\n🏠 Free home collection info\n💰 Discounts & coupons\n\nWhich of these can I assist you with?';
}

function generateResponse(text, lang, intent, session) {
  const t = text.toLowerCase().trim();

  const disclaimer = lang === 'hi'
    ? '\n\n⚠️ Yeh sirf guidance hai, doctor se zaroor milein.'
    : '\n\n⚠️ This is for guidance only, please consult your doctor.';

  const whatsappFallback = lang === 'hi'
    ? '\n\nIske baare mein WhatsApp karein: wa.me/916396786939'
    : '\n\nWhatsApp us for details: wa.me/916396786939';

  const nextStep = lang === 'hi'
    ? '\n\nKya book karein? Ya aur kuch batayein?'
    : '\n\nWould you like to book? Or anything else?';

  switch (intent) {
    case 'price': {
      const r = generatePriceResponse(t, lang);
      if (r) return r + disclaimer + nextStep;
      return (lang === 'hi'
        ? 'Is test ke baare mein call karein: +91 6396786939'
        : 'Please call +91 6396786939 about this test.')
        + whatsappFallback;
    }

    case 'booking':
      return generateBookingResponse(lang);

    case 'symptom': {
      const sm = findSymptomMatch(t);
      if (sm) {
        const testDetails = sm.tests.map(code => {
          const test = KNOWLEDGE_BASE.tests[code];
          return test ? `${test.name} (₹${test.price})` : code;
        }).join(', ');
        if (lang === 'hi') {
          return `Aapke symptoms ke liye yeh test sujhaaye gaye hain:\n\n${testDetails}\n\n${sm.note}\n\nTotal price ka pata karne ke liye bataayein kaun se test karwane hain.` + disclaimer;
        }
        return `Based on your symptoms, these tests are recommended:\n\n${testDetails}\n\nPlease let me know which tests you'd like to book.` + disclaimer;
      }
      if (lang === 'hi') {
        return 'Kripya apne symptoms ke baare mein bataayein — bukhar, thakan, jodon mein dard, ya koi aur problem? Main appropriate test sujha sakta hoon.' + disclaimer;
      }
      return 'Please tell me about your symptoms — fever, weakness, joint pain, or any other concern? I can suggest appropriate tests.' + disclaimer;
    }

    case 'report':
      if (lang === 'hi') {
        return 'Report track karne ke liye:\n\n1. Apna mobile number bhejein — main check karunga\n2. Report number bhejein (jaise RPT-XXXXXX)\n3. WhatsApp karein: wa.me/916396786939\n\nMobile ya report number bataayein.';
      }
      return 'To track your report:\n\n1. Send your mobile number\n2. Send report number (e.g. RPT-XXXXXX)\n3. WhatsApp: wa.me/916396786939\n\nShare your mobile or report number.';

    case 'preparation': {
      const r = generatePrepResponse(t, lang);
      if (r) return r + disclaimer + nextStep;
      return (lang === 'hi'
        ? 'Kripya woh test bataayein jiski taiyari ke baare mein jaanna chahte hain.'
        : 'Please tell me which test you need preparation info for.')
        + nextStep;
    }

    case 'urgent':
      return generateUrgentResponse(lang);

    case 'reportExplain':
      if (lang === 'hi') {
        return 'Apni report ki value bataayein (jaise "TSH 6.2") aur main normal range se compare kar ke samjhaunga.' + disclaimer;
      }
      return 'Share your report values (e.g. "TSH is 6.2") and I\'ll compare against normal ranges.' + disclaimer;

    case 'casual':
      return generateCasualResponse(text, lang);

    case 'discount':
      return generateGeneralResponse(text, '', lang) || (lang === 'hi'
        ? 'Coupons: FIRST50 (₹50 off), FAMILY20 (20% off), HEALTH100 (₹100 off). Booking ke time apply karein.'
        : 'Coupons: FIRST50 (₹50 off), FAMILY20 (20% off), HEALTH100 (₹100 off). Apply at booking.')
        + nextStep;

    case 'contact':
      return generateLabInfoResponse(text, lang) + nextStep;

    case 'privacy':
      if (lang === 'hi') {
        return 'Patient data privacy humari priority hai. Kisi aur ki report share nahi kar sakte. Kripya apna mobile number confirm karein taaki main aapki report check kar sakun.';
      }
      return 'Patient data privacy is our priority. I cannot share another person\'s report. Please confirm your own mobile number so I can check your report.';

    case 'general':
    default: {
      const r = generateGeneralResponse(text, '', lang);
      if (r) return r + disclaimer + nextStep;
      const sm = findSymptomMatch(t);
      if (sm) {
        const testDetails = sm.tests.map(code => {
          const test = KNOWLEDGE_BASE.tests[code];
          return test ? `${test.name} (₹${test.price})` : code;
        }).join(', ');
        if (lang === 'hi') {
          return `Aapki baat ke liye yeh test sujhaaye gaye hain:\n\n${testDetails}\n\n${sm.note}` + disclaimer + nextStep;
        }
        return `Based on what you said, these tests are recommended:\n\n${testDetails}` + disclaimer + nextStep;
      }
      if (lang === 'hi') {
        return 'Main samajh gaya. Kya aap yeh chahte hain:\n\n📋 Test price jaankari?\n📅 Appointment book karna?\n🔍 Report track karna?\n🩺 Symptom ke hisaab se test?\n🏠 Home collection?\n\nBataayein main kya madad kar sakta hoon?' + disclaimer + nextStep;
      }
      return 'I see. Are you looking for:\n\n📋 Test prices?\n📅 Appointment booking?\n🔍 Report tracking?\n🩺 Symptom-based test suggestions?\n🏠 Home collection info?\n\nLet me know how I can help!' + disclaimer + nextStep;
    }
  }
}

module.exports = {
  detectLanguage,
  detectIntent,
  findTestByQuery,
  findPackageByQuery,
  findSymptomMatch,
  buildSystemPrompt,
  generatePriceResponse,
  generatePrepResponse,
  generatePackageResponse,
  generateLabInfoResponse,
  generateUrgentResponse,
  generateCasualResponse,
  generateGeneralResponse,
  generateResponse
};
