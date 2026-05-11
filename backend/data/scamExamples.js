const scamExamples = [
    {
        tipo: "Banca",
        esempio: "Il tuo conto è stato bloccato. Clicca sul link per verificare subito i tuoi dati.",
        rischio: "alto"
    },
    {
        tipo: "Poste",
        esempio: "Il tuo pacco è in attesa. Paga 1,99 euro per sbloccare la spedizione.",
        rischio: "alto"
    },
    {
        tipo: "INPS",
        esempio: "Hai diritto a un rimborso. Inserisci i tuoi dati per ricevere il pagamento.",
        rischio: "alto"
    },
    {
        tipo: "Finto familiare",
        esempio: "Ciao mamma, ho cambiato numero. Mi serve subito un bonifico urgente.",
        rischio: "alto"
    },
    {
        tipo: "Premio falso",
        esempio: "Complimenti, hai vinto un premio. Clicca per confermare la consegna.",
        rischio: "medio"
    }
];

module.exports = scamExamples;