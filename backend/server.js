require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");

const { analyzeMessage, buildWhatsAppReply } = require("./services/scamAnalyzer");
const { sendWhatsAppMessage, extractIncomingMessages } = require("./services/whatsappService");
const { askAiAgent } = require("./services/aiAgentService");

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "aiuto_truffe_token";

function mandaFile(res, percorsoFile, tipo) {
    fs.readFile(percorsoFile, (errore, contenuto) => {
        if (errore) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("File non trovato");
            return;
        }

        res.writeHead(200, { "Content-Type": tipo });
        res.end(contenuto);
    });
}

function leggiBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            resolve(body);
        });

        req.on("error", errore => {
            reject(errore);
        });
    });
}

function getQueryParams(url) {
    const fullUrl = new URL(url, "http://localhost:" + PORT);
    return fullUrl.searchParams;
}

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // PAGINA PRINCIPALE
    if (req.method === "GET" && req.url === "/") {
        const filePath = path.join(__dirname, "../frontend/index.html");
        mandaFile(res, filePath, "text/html");
        return;
    }

    // PAGINA WHATSAPP FINTA
    if (req.method === "GET" && req.url === "/whatsapp") {
        const filePath = path.join(__dirname, "../frontend/whatsapp.html");
        mandaFile(res, filePath, "text/html");
        return;
    }

    // CSS
    if (req.method === "GET" && req.url === "/css/style.css") {
        const filePath = path.join(__dirname, "../frontend/css/style.css");
        mandaFile(res, filePath, "text/css");
        return;
    }

    // JAVASCRIPT APP NORMALE
    if (req.method === "GET" && req.url === "/js/app.js") {
        const filePath = path.join(__dirname, "../frontend/js/app.js");
        mandaFile(res, filePath, "application/javascript");
        return;
    }

    // VERIFICA WEBHOOK META / WHATSAPP
    if (req.method === "GET" && req.url.startsWith("/webhook")) {
        const params = getQueryParams(req.url);

        const mode = params.get("hub.mode");
        const token = params.get("hub.verify_token");
        const challenge = params.get("hub.challenge");

        console.log("Richiesta verifica webhook ricevuta");

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("Webhook verificato correttamente");
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(challenge);
            return;
        }

        console.log("Verifica webhook fallita");
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Token non valido");
        return;
    }

    // RICEZIONE MESSAGGI WHATSAPP
    if (req.method === "POST" && req.url === "/webhook") {
        try {
            const body = await leggiBody(req);
            const data = JSON.parse(body);

            console.log("Webhook WhatsApp ricevuto:");
            console.log(JSON.stringify(data, null, 2));

            const messaggi = extractIncomingMessages(data);

            for (const messaggio of messaggi) {
                const testoUtente = messaggio.text;
                const numeroUtente = messaggio.from;

                console.log("Messaggio da:", numeroUtente);
                console.log("Testo:", testoUtente);

                const risposta = await askAiAgent(testoUtente);

                await sendWhatsAppMessage(numeroUtente, risposta);
            }

            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("EVENT_RECEIVED");
            return;

        } catch (errore) {
            console.error("Errore nel webhook:", errore);

            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("EVENT_RECEIVED");
            return;
        }
    }

    // ANALISI MESSAGGIO DAL BROWSER
    if (req.method === "POST" && req.url === "/analyze") {
        try {
            const body = await leggiBody(req);
            const data = JSON.parse(body);
            const text = data.text;

            if (!text) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    error: "Nessun testo ricevuto"
                }));
                return;
            }

            const result = analyzeMessage(text);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
            return;

        } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                error: "Errore durante l'analisi"
            }));
            return;
        }
    }

    // SE NON TROVA NULLA
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
        error: "Percorso non trovato"
    }));
});

server.listen(PORT, () => {
    console.log("Server avviato su http://localhost:" + PORT);
    console.log("Webhook disponibile su /webhook");
});