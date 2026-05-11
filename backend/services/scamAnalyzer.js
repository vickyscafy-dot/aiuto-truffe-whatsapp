const suspiciousWords = require('../data/suspiciousWords');

function normalizeText(text) {
  return String(text || '').toLowerCase().trim();
}

function analyzeMessage(text) {
  const originalText = String(text || '').trim();
  const normalized = normalizeText(originalText);

  const foundWords = suspiciousWords.filter((word) =>
    normalized.includes(String(word).toLowerCase())
  );

  let score = foundWords.length;

  if (normalized.includes('http://') || normalized.includes('https://') || normalized.includes('www.')) {
    score += 2;
  }

  if (normalized.includes('password') || normalized.includes('codice') || normalized.includes('pin') || normalized.includes('otp')) {
    score += 2;
  }

  if (normalized.includes('subito') || normalized.includes('urgente') || normalized.includes('bloccato')) {
    score += 1;
  }

  let riskLevel = 'basso';
  if (score >= 6) riskLevel = 'alto';
  else if (score >= 3) riskLevel = 'medio';

  let advice = 'Non ci sono segnali evidenti di truffa, ma resta prudente.';

  if (riskLevel === 'medio') {
    advice = 'Fai attenzione. Non cliccare link strani, non inserire codici o password e verifica usando solo canali ufficiali.';
  }

  if (riskLevel === 'alto') {
    advice = 'Non cliccare su nessun link. Non inserire password, codici o dati della carta. Non fare pagamenti. Chiama un familiare oppure contatta banca, Poste o ente usando solo numeri ufficiali.';
  }

  return {
    originalText,
    riskLevel,
    score,
    foundWords,
    advice
  };
}

function buildWhatsAppReply(result) {
  if (result.riskLevel === 'alto') {
    return `🚨 ATTENZIONE: POTREBBE ESSERE UNA TRUFFA\n\n${result.advice}\n\nParole sospette trovate: ${result.foundWords.join(', ') || 'nessuna'}`;
  }

  if (result.riskLevel === 'medio') {
    return `⚠️ ATTENZIONE: MESSAGGIO SOSPETTO\n\n${result.advice}\n\nParole sospette trovate: ${result.foundWords.join(', ') || 'nessuna'}`;
  }

  return `✅ RISCHIO BASSO\n\n${result.advice}`;
}

module.exports = {
  analyzeMessage,
  buildWhatsAppReply
};
