const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function askAiAgent(testoUtente) {
    const response = await client.responses.create({
        model: "gpt-5.4-mini",
        input: [
            {
                role: "system",
                content: `
Sei un agente AI anti-truffa integrato in un bot WhatsApp.

Il tuo compito è aiutare persone comuni, soprattutto anziani o persone poco esperte di tecnologia, a capire se un messaggio può essere una truffa.

Devi rispondere SEMPRE in italiano.
Devi essere semplice, diretto e prudente.
Non usare spiegazioni troppo tecniche.
Non dire mai di cliccare link sospetti.
Se il messaggio sembra pericoloso, consiglia di non cliccare, non pagare, non inviare codici e chiedere aiuto a una persona fidata.

Formato risposta:
1. Livello di rischio: BASSO, MEDIO o ALTO
2. Spiegazione breve
3. Cosa fare adesso
`
            },
            {
                role: "user",
                content: testoUtente
            }
        ]
    });

    return response.output_text;
}

module.exports = {
    askAiAgent
};