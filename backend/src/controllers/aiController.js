const prisma = require('../prisma');
const { KNOWLEDGE_BASE } = require('../utils/aiKnowledgeBase');
const {
  detectLanguage,
  detectIntent,
  generateResponse,
  generatePriceResponse,
  generatePrepResponse,
  generatePackageResponse,
  generateLabInfoResponse,
  generateUrgentResponse,
  generateCasualResponse,
  findTestByQuery,
  findSymptomMatch,
  buildSystemPrompt
} = require('../utils/aiResponseEngine');
const { logActivity } = require('../utils/activityLogger');

let anthropic = null;
try {
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = require('@anthropic-ai/sdk');
    anthropic = new anthropic.Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
} catch (e) {
  console.log('Anthropic SDK not available. Using template-based responses only.');
}

// Fallback AI using Groq API via Database Settings
async function callGroqAI(systemPrompt, historyMsgs, currentMsg) {
  try {
    const rows = await prisma.settings.findMany();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    const apiKey = settings.aiApiKey || process.env.GROQ_API_KEY || '';

    if (!apiKey.startsWith('gsk_')) {
      console.warn('No Groq API key found in settings or it is invalid. Cannot use Groq fallback.');
      return null;
    }

    const groqModels = ['llama-3.3-70b-versatile', 'llama-3-8b-8192', 'mixtral-8x7b-32768'];
    const messages = [
      { role: 'system', content: systemPrompt },
      ...historyMsgs.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.message })),
      { role: 'user', content: currentMsg }
    ];

    for (const model of groqModels) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.5,
            max_tokens: 512
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) return text;
        } else {
          console.warn(`Groq model ${model} returned status ${response.status}`);
        }
      } catch (e) {
        console.warn(`Groq model ${model} failed in chat fallback, trying next.`, e.message);
      }
    }
    return null;
  } catch (err) {
    console.error('Error in Groq fallback:', err.message);
    return null;
  }
}

const sessions = new Map();
const SESSION_TTL = 30 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActive > SESSION_TTL) {
      sessions.delete(id);
    }
  }
}, 5 * 60 * 1000);

function getOrCreateSession(sessionId) {
  if (!sessionId) {
    sessionId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  }
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      history: [],
      patientName: null,
      patientMobile: null,
      patientAge: null,
      patientGender: null,
      selectedTests: [],
      lastIntent: null,
      lastTestQuery: null,
      conversationStep: null,
      bookingInfo: {},
      messageCount: 0,
      createdAt: Date.now(),
      lastActive: Date.now()
    });
  }
  const session = sessions.get(sessionId);
  session.lastActive = Date.now();
  return session;
}

exports.chat = async (req, res) => {
  try {
    const { message, sessionId, language, patientInfo } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const session = getOrCreateSession(sessionId);
    session.messageCount++;

    if (patientInfo) {
      if (patientInfo.name) session.patientName = patientInfo.name;
      if (patientInfo.mobile) session.patientMobile = patientInfo.mobile;
      if (patientInfo.age) session.patientAge = patientInfo.age;
      if (patientInfo.gender) session.patientGender = patientInfo.gender;
    }

    const lang = language || detectLanguage(message);
    const cleanMessage = message.trim();

    let intent = detectIntent(cleanMessage, lang);

    const isCasual = intent === 'casual' && session.lastIntent && session.lastIntent !== 'casual';
    if (isCasual) {
      intent = session.lastIntent;
    }

    if (intent === 'booking' || session.conversationStep === 'awaiting_booking_details') {
      session.conversationStep = 'awaiting_booking_details';
    }

    session.history.push({ role: 'user', message: cleanMessage, intent, timestamp: new Date() });
    session.lastIntent = intent;

    let response = '';
    let actions = [];

    if (intent === 'booking' && session.conversationStep === 'awaiting_booking_details') {
      const mobileMatch = cleanMessage.match(/\d{10}/);
      if (mobileMatch && !session.patientMobile) {
        session.patientMobile = mobileMatch[0];
      }
      if (!session.patientName && cleanMessage.length < 20) {
        session.patientName = cleanMessage.replace(/\d/g, '').trim();
      }

      const name = session.patientName || 'N/A';
      const mobile = session.patientMobile || 'N/A';

      if (lang === 'hi') {
        response = `Booking info mil gayi:\n\nNaam: ${name}\nMobile: ${mobile}\n\nKya aap ghar se collection chahenge ya lab aayenge? Ya call karein: +91 6396786939`;
      } else {
        response = `Booking info received:\n\nName: ${name}\nMobile: ${mobile}\n\nWould you like home collection or lab visit? Or call: +91 6396786939`;
      }
      session.conversationStep = null;
      actions = [
        { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' },
        { type: 'call', label: lang === 'hi' ? 'Call karein' : 'Call Now', url: 'tel:+916396786939', icon: 'phone' }
      ];
    } else if (intent === 'booking') {
      session.conversationStep = 'awaiting_booking_details';
      response = generateResponse(cleanMessage, lang, intent, session);
      actions = [
        { type: 'deeplink', label: lang === 'hi' ? 'Book karein' : 'Book Now', url: 'sanapathology://book', icon: 'calendar' },
        { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }
      ];
    } else if (intent === 'report') {
      const mobileMatch = cleanMessage.match(/\d{10}/);
      const reportMatch = cleanMessage.match(/RPT[-\s]?(\d+)/i);
      const refMatch = cleanMessage.match(/SPL[-\s]?APT[-\s]?(\d+)/i);

      if (mobileMatch || reportMatch || refMatch) {
        try {
          if (reportMatch) {
            const lookup = await prisma.report.findUnique({
              where: { reportNumber: `RPT-${reportMatch[1].padStart(6, '0')}` },
              include: { patient: true, doctor: true }
            });
            if (lookup) {
              const pName = lookup.patient?.fullName || 'N/A';
              if (lang === 'hi') {
                response = `Report mil gayi:\n\nReport: ${lookup.reportNumber}\nPatient: ${pName}\nDate: ${lookup.reportDate?.toISOString().split('T')[0]}\nStatus: ${lookup.status === 'COMPLETED' ? 'Taiyar' : 'Processing'}`;
              } else {
                response = `Report found:\n\nReport: ${lookup.reportNumber}\nPatient: ${pName}\nDate: ${lookup.reportDate?.toISOString().split('T')[0]}\nStatus: ${lookup.status === 'COMPLETED' ? 'Ready' : 'Processing'}`;
              }
              response += '\n\n' + (lang === 'hi' ? 'Aur kuch madad?' : 'Anything else?');
              session.history.push({ role: 'assistant', message: response, timestamp: new Date() });
              actions = [
                { type: 'deeplink', label: lang === 'hi' ? 'Report dekhein' : 'View Report', url: `sanapathology://report/${lookup.reportNumber}`, icon: 'file-text' },
                { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }
              ];
              return res.json({ response, sessionId: session.id, intent, language: lang, patientName: session.patientName, patientMobile: session.patientMobile, actions });
            }
          } else if (refMatch) {
            const aptId = parseInt(refMatch[1], 10);
            const lookup = await prisma.appointment.findUnique({
              where: { id: aptId },
              include: { patient: true }
            });
            if (lookup) {
              const statusLabel = {
                SCHEDULED: lang === 'hi' ? 'Pending' : 'Pending',
                CONFIRMED: lang === 'hi' ? 'Confirm' : 'Confirmed',
                COMPLETED: lang === 'hi' ? 'Sample liya gaya' : 'Sample Collected',
                CANCELLED: lang === 'hi' ? 'Cancel' : 'Cancelled'
              };
              if (lang === 'hi') {
                response = `Appointment:\n\nRef: SPL-APT-${aptId.toString().padStart(6, '0')}\nPatient: ${lookup.patient?.fullName || 'N/A'}\nDate: ${lookup.date?.toISOString().split('T')[0]}\nTime: ${lookup.time}\nStatus: ${statusLabel[lookup.status] || lookup.status}`;
              } else {
                response = `Your Appointment:\n\nRef: SPL-APT-${aptId.toString().padStart(6, '0')}\nPatient: ${lookup.patient?.fullName || 'N/A'}\nDate: ${lookup.date?.toISOString().split('T')[0]}\nTime: ${lookup.time}\nStatus: ${statusLabel[lookup.status] || lookup.status}`;
              }
              response += '\n\n' + (lang === 'hi' ? 'Aur kuch madad?' : 'Anything else?');
              session.history.push({ role: 'assistant', message: response, timestamp: new Date() });
              actions = [
                { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }
              ];
              return res.json({ response, sessionId: session.id, intent, language: lang, patientName: session.patientName, patientMobile: session.patientMobile, actions });
            }
          } else if (mobileMatch) {
            const patient = await prisma.patient.findFirst({
              where: { mobileNumber: mobileMatch[0] }
            });
            if (patient) {
              const reports = await prisma.report.findMany({
                where: { patientId: patient.id },
                include: { patient: true, doctor: true },
                orderBy: { reportDate: 'desc' },
                take: 5
              });
              if (reports.length > 0) {
                if (lang === 'hi') {
                  response = 'Aapki reports:\n';
                  reports.forEach(r => {
                    response += `\n• ${r.reportNumber} — ${r.reportDate?.toISOString().split('T')[0]} — ${r.status === 'COMPLETED' ? 'Taiyar' : 'Processing'}`;
                  });
                  response += '\n\nApp mein "My Reports" dekhein.';
                } else {
                  response = 'Your Reports:\n';
                  reports.forEach(r => {
                    response += `\n• ${r.reportNumber} — ${r.reportDate?.toISOString().split('T')[0]} — ${r.status === 'COMPLETED' ? 'Ready' : 'Processing'}`;
                  });
                  response += '\n\nCheck "My Reports" in the app.';
                }
              } else {
                response = lang === 'hi' ? 'Koi report nahi mili.' : 'No reports found.';
              }
            } else {
              response = lang === 'hi' ? 'Is mobile number se koi patient nahi mila.' : 'No patient found with this mobile number.';
            }
          }
        } catch (err) {
          console.error('Report lookup error:', err.message);
          response = lang === 'hi'
            ? 'Report check karne mein error. WhatsApp karein: wa.me/916396786939'
            : 'Error checking reports. WhatsApp: wa.me/916396786939';
        }
      } else {
        response = generateResponse(cleanMessage, lang, intent, session);
      }
      if (!actions.length) {
        actions = [
          { type: 'deeplink', label: lang === 'hi' ? 'Report dekhein' : 'View Reports', url: 'sanapathology://reports', icon: 'file-text' },
          { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }
        ];
      }
    } else if (intent === 'privacy') {
      if (lang === 'hi') {
        response = 'Patient data privacy humari priority hai. Main kisi aur ki report share nahi kar sakta. Kripya apna mobile number confirm karein taaki main aapki report check kar sakun.';
      } else {
        response = 'Patient data privacy is our priority. I cannot share another person\'s report. Please confirm your own mobile number so I can check your report.';
      }
      actions = [
        { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }
      ];
    } else if (intent === 'contact' || intent === 'labInfo') {
      response = generateLabInfoResponse(cleanMessage, lang);
      actions = [
        { type: 'call', label: lang === 'hi' ? 'Call karein' : 'Call', url: 'tel:+916396786939', icon: 'phone' },
        { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }
      ];
    } else if (intent === 'urgent') {
      response = generateUrgentResponse(lang);
      actions = [
        { type: 'whatsapp', label: lang === 'hi' ? 'WhatsApp karein' : 'WhatsApp Now', url: 'https://wa.me/916396786939?text=Urgent%20collection%20needed', icon: 'message-circle' },
        { type: 'call', label: lang === 'hi' ? 'Call karein' : 'Call Now', url: 'tel:+916396786939', icon: 'phone' }
      ];
    } else if (intent === 'discount') {
      if (lang === 'hi') {
        response = 'Coupons:\n';
        for (const [code, c] of Object.entries(KNOWLEDGE_BASE.coupons)) {
          response += `\n• ${code}: ${c.description.hi}`;
        }
        response += '\n\nBooking ke time apply karein.';
      } else {
        response = 'Available Coupons:\n';
        for (const [code, c] of Object.entries(KNOWLEDGE_BASE.coupons)) {
          response += `\n• ${code}: ${c.description.en}`;
        }
        response += '\n\nApply at booking.';
      }
      response += '\n\n' + (lang === 'hi' ? 'Kya book karein?' : 'Would you like to book?');
      actions = [
        { type: 'deeplink', label: lang === 'hi' ? 'Book karein' : 'Book Tests', url: 'sanapathology://book', icon: 'shopping-cart' },
        { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }
      ];
    } else if (intent === 'package') {
      response = generatePackageResponse(cleanMessage, lang);
      actions = [
        { type: 'deeplink', label: lang === 'hi' ? 'Book karein' : 'Book Package', url: 'sanapathology://packages', icon: 'shopping-cart' },
        { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }
      ];
    } else if (intent === 'symptom') {
      const sm = findSymptomMatch(cleanMessage);
      if (sm) {
        const testDetails = sm.tests.map(code => {
          const test = KNOWLEDGE_BASE.tests[code];
          return test ? `${test.name} (₹${test.price})` : code;
        }).join(', ');
        if (lang === 'hi') {
          response = `Aapke symptoms ke liye yeh test sujhaaye gaye:\n\n${testDetails}\n\n${sm.note}\n\nYeh sirf guidance hai, doctor se zaroor milein.`;
        } else {
          response = `Based on your symptoms, these tests are recommended:\n\n${testDetails}\n\nThis is for guidance only, please consult your doctor.`;
        }
        response += '\n\n' + (lang === 'hi' ? 'Kya inmein se koi test book karein?' : 'Would you like to book any of these tests?');
      } else if (anthropic) {
        try {
          const systemPrompt = buildSystemPrompt(lang, session);
          const claudeResp = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 512,
            system: systemPrompt,
            messages: [
              ...session.history.filter(m => m.role === 'user').slice(-5).map(m => ({ role: 'user', content: m.message })),
              { role: 'user', content: cleanMessage }
            ],
            temperature: 0.3
          });
          response = claudeResp.content[0].text;
        } catch (err) {
          console.error('Claude error:', err.message);
          response = generateResponse(cleanMessage, lang, intent, session);
        }
      } else {
        const systemPrompt = buildSystemPrompt(lang, session);
        const historyMsgs = session.history.filter(m => m.role === 'user').slice(-5);
        const aiResp = await callGroqAI(systemPrompt, historyMsgs, cleanMessage);
        response = aiResp || generateResponse(cleanMessage, lang, intent, session);
      }
      actions = [
        { type: 'deeplink', label: lang === 'hi' ? 'Book karein' : 'Book Tests', url: 'sanapathology://book', icon: 'shopping-cart' },
        { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }
      ];
    } else {
      if (anthropic && session.messageCount % 3 === 0) {
        try {
          const systemPrompt = buildSystemPrompt(lang, session);
          const historyMsgs = session.history.filter(m => m.role === 'user').slice(-5);
          const claudeResp = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 512,
            system: systemPrompt,
            messages: [
              ...historyMsgs.map(m => ({ role: 'user', content: m.message })),
              { role: 'user', content: cleanMessage }
            ],
            temperature: 0.3
          });
          response = claudeResp.content[0].text;
        } catch (err) {
          console.error('Claude error:', err.message);
          response = generateResponse(cleanMessage, lang, intent, session);
        }
      } else if (!anthropic && intent === 'general') {
        const systemPrompt = buildSystemPrompt(lang, session);
        const historyMsgs = session.history.filter(m => m.role === 'user').slice(-5);
        const aiResp = await callGroqAI(systemPrompt, historyMsgs, cleanMessage);
        response = aiResp || generateResponse(cleanMessage, lang, intent, session);
      } else {
        response = generateResponse(cleanMessage, lang, intent, session);
      }
      if (!actions.length) {
        actions = [
          { type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }
        ];
      }
    }

    session.history.push({ role: 'assistant', message: response, timestamp: new Date() });

    if (session.history.length > 50) {
      session.history = session.history.slice(-50);
    }

    logActivity({
      userId: null,
      action: 'AI_CHAT',
      entity: 'AI',
      entityId: session.id,
      description: `Intent: ${intent}, Lang: ${lang}, Msg: ${cleanMessage.substring(0, 100)}`,
      req,
    }).catch(() => {});

    res.json({
      response,
      sessionId: session.id,
      intent,
      language: lang,
      patientName: session.patientName,
      patientMobile: session.patientMobile,
      actions
    });

  } catch (err) {
    console.error('AI chat error:', err.message);
    const lang = req.body?.language || 'en';
    res.json({
      response: lang === 'hi'
        ? 'Maaf kijiye, error ho gaya. WhatsApp karein: wa.me/916396786939'
        : 'Sorry, an error occurred. WhatsApp us: wa.me/916396786939',
      sessionId: req.body?.sessionId || null,
      intent: 'error',
      language: lang,
      actions: [{ type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/916396786939', icon: 'message-circle' }]
    });
  }
};

exports.reset = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId);
    }
    res.json({ success: true, message: 'Session reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.status = async (req, res) => {
  res.json({
    activeSessions: sessions.size,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().heapUsed,
    claudeAvailable: !!anthropic
  });
};
