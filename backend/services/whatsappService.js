const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v20.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function sendWhatsAppMessage(to, text) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.log('⚠️ WhatsApp non configurato: mancano WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID nel file .env');
    return { skipped: true, reason: 'missing_whatsapp_env' };
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: text
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Errore invio WhatsApp:', data);
    throw new Error(data?.error?.message || 'Errore invio messaggio WhatsApp');
  }

  return data;
}

function extractIncomingMessages(body) {
  const entries = body?.entry || [];
  const messages = [];

  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value;
      const incoming = value?.messages || [];

      for (const message of incoming) {
        const from = message.from;
        let text = '';

        if (message.type === 'text') {
          text = message.text?.body || '';
        }

        if (message.type === 'button') {
          text = message.button?.text || '';
        }

        if (message.type === 'interactive') {
          text = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
        }

        if (from && text.trim()) {
          messages.push({ from, text });
        }
      }
    }
  }

  return messages;
}

module.exports = {
  sendWhatsAppMessage,
  extractIncomingMessages
};
