const prisma = require('../prisma');

const startTelegramBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not configured. Telegram bot listener is disabled.");
    return;
  }

  let offset = 0;
  console.log("Starting Telegram Bot updates polling loop...");

  const poll = async () => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`);
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.result.length > 0) {
          for (const update of data.result) {
            offset = update.update_id + 1;
            const message = update.message;
            if (message && message.text) {
              const text = message.text.trim();
              const chatId = String(message.chat.id);
              
              if (text.startsWith('/start')) {
                const welcomeText = `Welcome to Sana Pathology Lab Report Delivery Bot! 🔔\n\nTo link your account and receive your reports here, please reply with the 6-digit linking code shown on your registration screen or receipt.`;
                await sendTextMessage(chatId, welcomeText);
                continue;
              }

              // Check if it's a 6-digit code
              if (/^\d{6}$/.test(text)) {
                const patient = await prisma.patient.findFirst({
                  where: { telegramCode: text }
                });

                if (patient) {
                  await prisma.patient.update({
                    where: { id: patient.id },
                    data: { telegramChatId: chatId }
                  });

                  const successText = `✅ Account linked successfully!\n\nPatient Name: ${patient.fullName}\nPatient ID: ${patient.patientId}\n\nYour reports and AI-generated summaries will be sent to this chat automatically as soon as they are ready.`;
                  await sendTextMessage(chatId, successText);
                } else {
                  await sendTextMessage(chatId, `❌ Invalid linking code. Please check the 6-digit code shown at the lab or on your receipt and try again.`);
                }
              } else {
                await sendTextMessage(chatId, `Please send your 6-digit linking code to connect your account to Sana Pathology Lab.`);
              }
            }
          }
        }
      }
    } catch (err) {
      if (!err.message.includes('fetch failed')) {
        console.error("Error in Telegram bot polling loop:", err.message);
      }
    }
    setTimeout(poll, 10000); // Wait 10 seconds before retrying to prevent spam
  };

  const sendTextMessage = async (chatId, text) => {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text
        })
      });
    } catch (err) {
      console.error(`Failed to send message to chat ${chatId}:`, err.message);
    }
  };

  poll();
};

const sendReportToTelegram = async (chatId, pdfBuffer, reportNumber, summaryText) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('document', blob, `${reportNumber}.pdf`);
    formData.append('caption', summaryText || `Your report ${reportNumber} is ready.`);
    
    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Failed to send report document to chat ${chatId}:`, errText);
    } else {
      console.log(`Report ${reportNumber} sent to Telegram chat ${chatId}`);
    }
  } catch (err) {
    console.error(`Error sending report to Telegram chat ${chatId}:`, err.message);
  }
};

const generateReportSummary = async (report) => {
  try {
    const patientName = report.patient?.fullName || 'Patient';
    const results = report.results || [];
    
    // Compile results list
    const resultsSummary = results
      .map(r => `- ${r.parameterName}: ${r.resultValue} ${r.unit || ''} (Ref: ${r.referenceRange || 'N/A'})${r.flag ? ` [FLAG: ${r.flag}]` : ''}`)
      .join('\n');

    const prompt = `You are a medical AI assistant at Sana Pathology Lab. Analyze the following lab results for patient "${patientName}" and write a short, friendly, and reassuring 2-3 sentence summary.
If there are any out-of-range/abnormal values (flagged as HIGH or LOW), briefly point them out and suggest consulting their doctor for professional advice. If all values are normal, confirm that the results look normal.
Do not give direct medical diagnosis or treatment, keep the tone professional but warm.

Patient Name: ${patientName}
Results:
${resultsSummary}

Summary:`;

    // Retrieve settings for API key
    const rows = await prisma.settings.findMany();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    const apiKey = settings.aiApiKey || '';

    let text = '';
    if (apiKey && apiKey.startsWith('gsk_')) {
      const groqModels = ['llama-3.3-70b-versatile', 'llama-3-8b-8192'];
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
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.5,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            text = data.choices?.[0]?.message?.content;
            if (text) break;
          }
        } catch (e) {
          console.warn(`Groq failed for summary:`, e.message);
        }
      }
    }

    if (!text) {
      // Fallback to Pollinations AI
      const models = ['openai', 'mistral', 'qwen-coder'];
      for (const model of models) {
        try {
          const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=${model}`;
          const headers = {};
          if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
          }
          const response = await fetch(url, { headers });
          if (response.ok) {
            text = await response.text();
            if (text) break;
          }
        } catch (e) {
          console.warn(`Pollinations failed for summary:`, e.message);
        }
      }
    }

    return text || `Hello ${patientName}, your report ${report.reportNumber} is ready. Please find the attached PDF report.`;
  } catch (err) {
    console.error('Error generating AI report summary:', err.message);
    return `Hello ${report.patient?.fullName || 'Patient'}, your report ${report.reportNumber} is ready. Please find the attached PDF report.`;
  }
};

module.exports = { startTelegramBot, sendReportToTelegram, generateReportSummary };
