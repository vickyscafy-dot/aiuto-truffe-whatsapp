const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askAiAgent(userMessage) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
Sei un assistente anti-truffa integrato in WhatsApp.
Devi aiutare soprattutto persone anziane o poco esperte di tecnologia.

Regole:
- Rispondi sempre in italiano.
- Usa frasi semplici e molto chiare.
- Non essere lungo.
- Dai una valutazione del rischio: BASSO, MEDIO o ALTO.
- Se il messaggio sembra sospetto, consiglia di NON cliccare link, NON pagare, NON dare codici, password o dati personali.
- Se serve, suggerisci di chiedere aiuto a un familiare o a una persona fidata.
- Non dire mai che sei ChatGPT.
          `,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Errore agente AI:", error);

    return "⚠️ Non riesco ad analizzare bene il messaggio in questo momento. Non cliccare link, non inviare soldi e chiedi aiuto a una persona fidata.";
  }
}

module.exports = {
  askAiAgent,
};