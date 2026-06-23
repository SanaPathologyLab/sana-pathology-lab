import { CATALOGUE_MAP } from './aiKnowledge';

let sessionId = null;
let patientName = null;
let patientMobile = null;

export async function sendChatMessage(message, language) {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sessionId,
        language,
        patientInfo: {
          name: patientName,
          mobile: patientMobile
        }
      })
    });
    const data = await res.json();
    sessionId = data.sessionId;
    if (data.patientName) patientName = data.patientName;
    if (data.patientMobile) patientMobile = data.patientMobile;
    return {
      response: data.response,
      intent: data.intent,
      language: data.language,
      patientName: data.patientName,
      patientMobile: data.patientMobile,
      actions: data.actions || []
    };
  } catch (err) {
    console.error('AI chat error:', err);
    const fallback = localAnswer(message);
    return {
      response: fallback || 'Connection issue. WhatsApp: wa.me/916396786939',
      intent: 'general',
      language: 'en',
      actions: [{ type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }]
    };
  }
}

export function resetSession() {
  sessionId = null;
  patientName = null;
  patientMobile = null;
  fetch('/api/ai/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  }).catch(() => {});
}

export function setPatientInfo(name, mobile) {
  patientName = name;
  patientMobile = mobile;
}

export function searchTests(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  const catalogue = CATALOGUE_MAP || {};
  const results = [];
  for (const [code, entry] of Object.entries(catalogue)) {
    const nameLower = (entry.name || '').toLowerCase();
    const codeLower = (entry.testCode || code || '').toLowerCase();
    if (nameLower.includes(q) || codeLower.includes(q) || q.includes(codeLower)) {
      results.push({ ...entry, code: entry.testCode || code });
    }
  }
  if (results.length === 0) {
    for (const [code, entry] of Object.entries(catalogue)) {
      const nameLower = (entry.name || '').toLowerCase();
      const keywords = nameLower.split(/\s+/);
      const queryKeywords = q.split(/\s+/);
      if (queryKeywords.some(k => keywords.some(kw => kw.includes(k) || k.includes(kw)))) {
        results.push({ ...entry, code: entry.testCode || code });
      }
    }
  }
  return results;
}

export function localAnswer(prompt) {
  if (!prompt) return null;
  const q = prompt.toLowerCase().trim();

  if (q.includes('cbc') && (q.includes('price') || q.includes('kitna') || q.includes('cost'))) {
    return 'CBC test sirf ₹200 mein hota hai. Koi fasting nahi chahiye, ghar se free collection hai. Kya aap abhi book karna chahenge?';
  }
  if (q.includes('thyroid') && (q.includes('price') || q.includes('kitna') || q.includes('cost'))) {
    return 'Thyroid Profile (T3, T4, TSH) ₹450 mein hota hai. Koi fasting nahi chahiye. Book karein?';
  }
  if (q.includes('lipid') && (q.includes('price') || q.includes('kitna') || q.includes('cost'))) {
    return 'Lipid Profile ₹600 mein hota hai. 10-12 ghante ki fasting chahiye. Book karein?';
  }
  if (q.includes('sugar') && (q.includes('price') || q.includes('kitna') || q.includes('cost'))) {
    return 'Blood Sugar Fasting ₹80 aur HbA1c ₹400 mein hota hai. Kya book karein?';
  }
  if (q.includes('vitamin b12') || q.includes('b12') && (q.includes('price') || q.includes('kitna'))) {
    return 'Vitamin B12 ₹700 mein hota hai. Koi fasting nahi chahiye. Book karein?';
  }
  if (q.includes('vitamin d') && (q.includes('price') || q.includes('kitna') || q.includes('cost'))) {
    return 'Vitamin D ₹800 mein hota hai. Koi fasting nahi chahiye. Book karein?';
  }
  if (q.includes('lft') && (q.includes('price') || q.includes('kitna') || q.includes('cost'))) {
    return 'Liver Function Test (LFT) ₹500 mein hota hai. Koi strict fasting nahi chahiye. Book karein?';
  }
  if (q.includes('kft') && (q.includes('price') || q.includes('kitna') || q.includes('cost'))) {
    return 'Kidney Function Test (KFT) ₹500 mein hota hai. Koi fasting nahi chahiye. Book karein?';
  }
  if (q.includes('dengue') && (q.includes('price') || q.includes('kitna') || q.includes('cost'))) {
    return 'Dengue Profile ₹1,200 aur Dengue NS1 ₹500 mein hota hai. Book karein?';
  }
  if (q.includes('full body') && (q.includes('price') || q.includes('kitna') || q.includes('cost'))) {
    return 'Full Body Checkup ₹1,800 mein hota hai — CBC, LFT, KFT, Lipid, Thyroid, Sugar, Urine sab shamil hai. Book karein?';
  }
  if (q.includes('how are you') || q.includes('kaise ho') || q.includes('kya haal')) {
    return 'Main bilkul theek hoon, shukriya! Aap sunao — kaunsa test karwana hai ya koi sawaal hai?';
  }
  if (q.includes('namaste') || q.includes('hello') || q.includes('hi')) {
    return 'Namaste! Main Sana AI hoon, aapka lab assistant. Bataayein — test price, booking, report, ya koi aur madad?';
  }
  if (q.includes('thanks') || q.includes('thank you') || q.includes('shukriya')) {
    return 'Aapka swagat hai! Kya aur kuch madad chahiye?';
  }
  if (q.includes('thakan') || q.includes('thak') || q.includes('weakness') || q.includes('kamjori')) {
    return 'Thakan ke liye CBC (₹200), Vitamin B12 (₹700), aur Thyroid (₹450) best hain. Sab ek saath karwa sakte hain — total ₹1,350. Book karein?';
  }
  if (q.includes('bukhar') || q.includes('fever') || q.includes('bimari')) {
    return 'Bukhar ke liye CBC (₹200) aur CRP (₹150) basic tests hain. 3 din se zyada bukhar hai to Fever Profile (₹800) best rahega. Book karein?';
  }
  if (q.includes('timing') || q.includes('time') || q.includes('kab khulti')) {
    return 'Lab timings: Mon-Sat 7:00 AM - 8:00 PM, Sunday 7:00 AM - 2:00 PM. Hasanpur, Amroha mein hai. Aur kuch batayein?';
  }
  if (q.includes('address') || q.includes('pata') || q.includes('kahan hai')) {
    return 'Near Jain Temple, Mohalla Shahjahanabad, Main Road, Hasanpur, Amroha, UP 244241. Phone: +91 6396786939.';
  }
  if (q.includes('booking') || q.includes('book')) {
    return 'Booking ke liye naam, mobile number aur test bataayein. Ya seedha WhatsApp karein: wa.me/916396786939';
  }
  if (q.includes('fasting') || q.includes('khali pet') || q.includes('upwas')) {
    return 'Sirf Blood Sugar Fasting (8-10 hrs) aur Lipid Profile (10-12 hrs) ke liye fasting chahiye. Baaki sab tests bina fasting ke ho sakte hain.';
  }
  if (q.includes('home collection') || q.includes('ghar collection') || q.includes('ghar aana')) {
    return 'Haan! Ghar se free sample collection available hai. Lab ka technician aapke ghar aayega. Book karein?';
  }
  if (q.includes('nabl') || q.includes('accredit')) {
    return 'Sana Pathology NABL-accredited lab hai, jo highest quality standards ensure karti hai.';
  }
  if (q.includes('payment') || q.includes('pay') || q.includes('card') || q.includes('upi')) {
    return 'Cash, UPI (GPay, PhonePe, Paytm), aur Credit/Debit cards accept karte hain.';
  }
  if (q.includes('discount') || q.includes('coupon') || q.includes('offer')) {
    return 'Coupon codes: FIRST50 (₹50 off), FAMILY20 (20% off), HEALTH100 (₹100 off). Booking ke time apply karein. Aur kuch batayein?';
  }
  if (q.includes('sgot') || q.includes('sgpt') || q.includes('liver enzyme')) {
    return 'SGOT aur SGPT (Liver Enzymes) ₹250 mein dono milte hain. Koi fasting nahi chahiye. Book karein?';
  }

  return null;
}

export async function generateAI(prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('/api/public/ai-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      return text;
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    const answer = localAnswer(prompt);
    if (answer) return answer;
    return 'Connection issue. WhatsApp: wa.me/916396786939, Call: +91 6396786939';
  }
}
