const messaggioInput = document.getElementById("messaggio");
const risultatoBox = document.getElementById("risultato");
const btnAnalizza = document.getElementById("btnAnalizza");
const btnVocale = document.getElementById("btnVocale");

btnAnalizza.addEventListener("click", analizzaMessaggio);
btnVocale.addEventListener("click", avviaVocale);

async function analizzaMessaggio() {
    const messaggio = messaggioInput.value.trim();

    if (messaggio === "") {
        alert("Scrivi o detta un messaggio prima di controllarlo.");
        return;
    }

    mostraCaricamento();

    try {
        const risposta = await fetch("http://localhost:3000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: messaggio
            })
        });

        const risultato = await risposta.json();

        mostraRisultato(risultato);

    } catch (errore) {
        mostraErrore();
    }
}

function mostraCaricamento() {
    risultatoBox.style.display = "block";
    risultatoBox.className = "rischio-medio";
    risultatoBox.innerHTML = `
        ⏳ <strong>Analisi in corso...</strong><br><br>
        Sto controllando il messaggio.
    `;
}

function mostraRisultato(risultato) {
    risultatoBox.style.display = "block";

    if (risultato.riskLevel === "alto") {
        risultatoBox.className = "rischio-alto";
        risultatoBox.innerHTML = `
            🚨 <strong>ATTENZIONE: POTREBBE ESSERE UNA TRUFFA</strong><br><br>
            Non cliccare su nessun link.<br>
            Non inserire password, codici o dati della carta.<br>
            Non fare pagamenti.<br><br>
            <strong>Cosa fare adesso:</strong><br>
            Chiama un familiare oppure contatta la banca, Poste o l'ente usando solo numeri ufficiali.
        `;
    } else if (risultato.riskLevel === "medio") {
        risultatoBox.className = "rischio-medio";
        risultatoBox.innerHTML = `
            ⚠️ <strong>MESSAGGIO SOSPETTO</strong><br><br>
            Prima di fare qualsiasi cosa, fermati.<br>
            Non cliccare subito e non dare dati personali.<br><br>
            <strong>Cosa fare adesso:</strong><br>
            Chiedi conferma a un familiare o controlla dall'app ufficiale.
        `;
    } else {
        risultatoBox.className = "rischio-basso";
        risultatoBox.innerHTML = `
            ✅ <strong>NESSUN PERICOLO EVIDENTE</strong><br><br>
            Il messaggio non sembra contenere segnali forti di truffa.<br><br>
            Resta comunque prudente se ti chiedono soldi, codici, password o dati personali.
        `;
    }
}

function mostraErrore() {
    risultatoBox.style.display = "block";
    risultatoBox.className = "rischio-alto";
    risultatoBox.innerHTML = `
        ❌ <strong>ERRORE DI COLLEGAMENTO</strong><br><br>
        Il sistema di analisi non sta rispondendo.<br><br>
        Controlla che il backend sia acceso nel terminale.
    `;
}

function avviaVocale() {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Il riconoscimento vocale non è supportato da questo browser. Usa Google Chrome.");
        return;
    }

    const riconoscimento = new webkitSpeechRecognition();

    riconoscimento.lang = "it-IT";
    riconoscimento.continuous = false;
    riconoscimento.interimResults = false;

    riconoscimento.start();

    riconoscimento.onresult = function(event) {
        const testo = event.results[0][0].transcript;
        messaggioInput.value = testo;
    };

    riconoscimento.onerror = function() {
        alert("Non sono riuscito a capire il vocale. Riprova parlando lentamente.");
    };
}