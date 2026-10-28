// Generador de las páginas (index.html y proposte/*.html).
// Uso, desde la raíz del proyecto:  node recursos/generador/build.mjs .
// OJO: reescribe los .html. Si cambiaste algo a mano en los .html, pasalo también acá antes de correrlo.
// Los SVG del mapa salen de recursos/generador/maps (extraídos de la presentación "Mille chilometri").
// También arma el documento PDF de las propuestas (documento/...pdf): ver "Documento PDF" al final.
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const OUT = process.argv[2];
const GEN = dirname(fileURLToPath(import.meta.url));
const MAPS = join(GEN, 'maps');

const AREE = {
  istituzioni: 'Istituzioni',
  giovani: 'Giovani e formazione',
  agricoltura: 'Agricoltura e innovazione',
};

// Rol de las asociaciones relacionado con cada área (texto de la presentación "Mille chilometri").
const RUOLO = {
  istituzioni: ['Istituzioni', 'Aprire le porte istituzionali verso autorità e organismi locali e nazionali.'],
  giovani: ['Giovani', 'Sostenere iniziative formative e programmi di mobilità per giovani e professionisti, rafforzando il legame identitario e il capitale umano.'],
  agricoltura: ['Economia', 'Favorire rapporti economici e professionali e canali di cooperazione culturale, economica e accademica, con opportunità per imprese e investitori.'],
};

const P = [
  { slug: 'invito-autorita-regione-veneto', area: 'istituzioni', emoji: '🤝',
    titolo: "Invito ufficiale delle Autorità della Regione del Veneto in Argentina",
    sintesi: "Proporre una visita istituzionale delle Autorità regionali in Argentina per incontrare le comunità venete, le associazioni e le istituzioni locali, rafforzando i rapporti tra Veneto e Argentina.",
    // Contenido ampliado (investigado: historia del CAVA en miveneto.it, delegaciones en regione.veneto.it, giunta Stefani en italpress)
    testo: ['La proposta', 'Una visita per ritrovarsi', [
      "In Argentina vive una delle collettività venete più numerose al mondo, organizzata in associazioni da Buenos Aires a Mendoza, da Córdoba a Mar del Plata. Per molte famiglie il Veneto è un'origine viva, ma lontana oltre undicimila chilometri.",
      "Il CAVA propone che il Presidente della Regione e l'Assessore competente per i flussi migratori visitino le comunità venete in Argentina, con un programma costruito insieme alle associazioni.",
      "Negli anni Novanta le visite istituzionali erano frequenti, e nel 2006 la Consulta si è riunita a Mendoza. Una nuova missione darebbe continuità a un rapporto che le associazioni coltivano ogni giorno.",
    ]],
    programma: ['Cosa potrebbe includere la visita', [
      ['🏠', 'Le sedi delle associazioni', 'Incontri con soci, famiglie e anziani nelle sedi della rete del CAVA.'],
      ['🏛️', 'Le istituzioni argentine', 'Province e municipi con forte presenza veneta, per avviare accordi e gemellaggi.'],
      ['📜', 'La rete italiana', "Ambasciata d'Italia, consolati e Comites, per lavorare in modo coordinato."],
      ['🎓', 'Università e scuole', 'Atenei e istituti agrari: le basi per gli scambi delle proposte 4, 6 e 7.'],
      ['🌱', 'I giovani', 'Un incontro con le nuove generazioni di discendenti veneti, il futuro della rete.'],
      ['💼', 'Le imprese', 'Camere di commercio italiane e aziende di origine veneta, per nuove occasioni di interscambio.'],
    ]],
    storia: ['Una storia di incontri', [
      ['1989', 'Alla nascita del CAVA, a Buenos Aires, partecipano due consultori della Regione del Veneto.'],
      ['1993', "A Rosario, l'incontro triveneto latinoamericano INTRIVELA accoglie l'assessore regionale e il presidente della Consulta."],
      ['1998', 'Il Presidente della Regione inaugura a Buenos Aires la mostra dei modelli lignei delle opere di Palladio.'],
      ['1999', 'Il Congresso Giovani Veneti di Santa Fe riceve una delegazione regionale insieme a sindaci veneti.'],
      ['2006', 'La Consulta dei Veneti nel Mondo si riunisce a Mendoza.'],
      ['2024', 'Una delegazione della Provincia di Santa Fe è ricevuta dalla Regione del Veneto.'],
      ['Oggi', 'Il CAVA propone di riprendere il cammino con una nuova visita delle Autorità regionali.'],
    ]] },
  { slug: 'argentina-sede-consulta', area: 'istituzioni', emoji: '🗺️',
    corto: { titolo: "Candidatura dell'Argentina a sede della Consulta", lead: 'Una prossima sessione della Consulta dei Veneti nel Mondo in Argentina, per riconoscere il ruolo storico e il peso della collettività veneta nel Paese.' },
    titolo: "Candidatura dell'Argentina quale futura sede della Consulta dei Veneti nel Mondo",
    sintesi: "Richiedere che venga valutata la possibilità di svolgere una futura sessione della Consulta in Argentina, riconoscendo il ruolo storico e l'importanza della collettività veneta presente nel Paese.",
    ragioni: [
      ['🫶', 'Affinità culturale', "La grande percentuale di discendenti italiani rende l'Argentina un contesto familiare e accogliente."],
      ['🌱', 'Valore identitario', 'I giovani possono riscoprire radici comuni e rafforzare il senso di appartenenza.'],
      ['🌍', 'Diversificazione degli scambi', "Ampliare le opportunità oltre l'UE, aprendo nuove prospettive formative e professionali."],
      ['🏛️', 'Collaborazioni istituzionali', 'Regione, Province e Comuni possono attivare accordi bilaterali con enti argentini.'],
      ['✈️', 'Attrattività reciproca', "L'Argentina diventa meta di soggiorni culturali, mentre il Veneto si apre a giovani argentini."],
    ],
    // Investigado: comunicados de regione.veneto.it (Bento Gonçalves 2025, Belluno 2026, Treviso 2022, Vicenza 2023)
    programma: ['Come potrebbe essere', [
      ['📍', 'Una città della rete', 'Buenos Aires, Córdoba, Rosario o Mendoza: sedi con associazioni attive e collegamenti diretti.'],
      ['🌱', 'Il Meeting dei Giovani', 'Insieme alla Consulta, come in Brasile, con i giovani discendenti veneti di tutta la rete.'],
      ['🎉', 'La Giornata dei Veneti nel mondo', 'Una festa aperta alle famiglie venete argentine, nelle piazze e nelle sedi delle associazioni.'],
      ['🤝', 'Istituzioni e università', 'Incontri con autorità, atenei e camere di commercio, per dare seguito alle altre proposte.'],
      ['🧭', "L'accoglienza del CAVA", "Le associazioni mettono a disposizione sedi, contatti e volontari per l'organizzazione."],
    ]],
    storia: ['La Consulta nel mondo', [
      ['2006', "La Consulta si riunisce a Mendoza: l'ultima volta in Argentina."],
      ['2022', 'A Treviso, la prima sessione in presenza dopo la pandemia.'],
      ['2023', 'Vicenza ospita la Consulta e il Meeting dei Giovani.'],
      ['2025', "In Brasile, a Bento Gonçalves, per i 150 anni dell'emigrazione veneta nel Rio Grande do Sul."],
      ['2026', 'La Consulta torna in Veneto, a Belluno.'],
      ['Domani', "L'Argentina, a vent'anni da Mendoza."],
    ], "Nel 2025 la Regione ha portato la Consulta oltreoceano. Una sessione all'estero si può fare, e ha senso farla dove l'emigrazione veneta ha fatto la storia."] },
  { slug: 'scambio-giovanile', area: 'giovani', emoji: '🎒',
    titolo: 'Ripresa dei programmi di scambio giovanile',
    sintesi: 'Sollecitare la riattivazione dei programmi di mobilità destinati ai giovani discendenti veneti, favorendo soggiorni culturali, linguistici e formativi in Veneto.',
    // Investigado: regione.veneto.it (progetti formativi 18-39, Meeting), Trentino interscambi (ladige.it), LAZOS (trentininelmondo.it), Italea (esteri.it)
    testo: ['La proposta', 'Il Veneto dei nonni, visto da vicino', [
      "Per molti giovani veneto-argentini il Veneto è la terra dei nonni: lo conoscono dai racconti, dai cognomi e dalle ricette di casa, ma non l'hanno mai visto.",
      "Il CAVA chiede di riattivare programmi di mobilità che permettano ai giovani discendenti di trascorrere un periodo in Veneto, per studiare la lingua, conoscere il territorio e ritrovare i paesi d'origine delle proprie famiglie.",
      'Oggi la Regione sostiene progetti formativi per i giovani oriundi tra i 18 e i 39 anni e riunisce ogni anno il Meeting dei Giovani. Un programma di scambio stabile darebbe a molti più ragazzi la possibilità di vivere il Veneto in prima persona.',
    ]],
    programma: ['Come potrebbe funzionare', [
      ['🗓️', 'Due o tre settimane a luglio', "Durante le vacanze invernali argentine, quando l'estate veneta è piena di vita."],
      ['🏡', 'Ospiti delle famiglie', 'Accoglienza presso famiglie venete, per vivere il quotidiano e non solo i monumenti.'],
      ['🗣️', 'Lingua e cultura', 'Corsi di italiano e di cultura veneta con università, scuole e associazioni del territorio.'],
      ['📍', "Il paese d'origine", "Una giornata nel comune degli antenati, con l'incontro con il sindaco e la ricerca negli archivi."],
      ['🔁', 'Uno scambio reciproco', "L'anno dopo, i giovani veneti partono per l'Argentina, ospitati dalle famiglie della rete."],
      ['🧭', 'Le associazioni come ponte', 'Il CAVA e le associazioni raccolgono le candidature e preparano i ragazzi prima della partenza.'],
    ]],
    storia: ['Esperienze da cui ripartire', [
      ['1994', "Il CAVA avvia corsi di formazione annuali con l'Università di Padova e la Regione, in diverse città argentine."],
      ['1999', 'A Santa Fe il Congresso Giovani Veneti riunisce i ragazzi della rete.'],
      ['Dal 1999', 'Il Trentino scambia ogni anno giovani con i discendenti dei suoi emigrati: oltre venti edizioni, con ospitalità reciproca.'],
      ['2015', 'Il Friuli Venezia Giulia avvia LAZOS con Avellaneda (Santa Fe): un mese in famiglia per studenti italiani.'],
      ['2024', "Con l'Anno delle radici italiane e il progetto Italea, lo Stato punta sul ritorno dei discendenti."],
      ['Oggi', 'Il CAVA propone che il Veneto riprenda gli scambi giovanili.'],
    ], 'Il Veneto ha già lavorato con i giovani veneto-argentini, e altre regioni dimostrano che uno scambio stabile funziona.'] },
  { slug: 'formazione-e-stage', area: 'giovani', emoji: '🎓',
    titolo: 'Corsi di perfezionamento, formazione e stage',
    sintesi: "Promuovere percorsi di alta formazione, tirocini e stage presso enti, università, aziende e istituzioni venete, con l'obiettivo di creare opportunità concrete per le nuove generazioni.",
    // Investigado: bandi master 2018-2019 (decretos en inapp.gov.it), DGR 510/2021 y avviso 2025 (regione.veneto.it), Erasmus KA171
    testo: ['La proposta', 'Imparare in Veneto, lavorare nel mondo', [
      'Il Veneto ha università di prestigio, distretti produttivi e imprese conosciute in tutto il mondo. Per un giovane veneto-argentino, un periodo di formazione in Veneto può cambiare la carriera.',
      'Il CAVA propone percorsi di alta formazione, tirocini e stage presso enti, università, aziende e istituzioni venete, pensati per i giovani discendenti laureati o in formazione.',
      "Molti di loro hanno già la cittadinanza italiana: possono studiare e fare esperienza in Veneto con meno ostacoli, e riportare poi in Argentina competenze e contatti.",
    ]],
    programma: ['Cosa si potrebbe offrire', [
      ['🎓', 'Master e perfezionamento', 'Riattivare le borse per i master nelle università venete, già previste dalla legge regionale.'],
      ['🏭', 'Stage in azienda', "Tirocini di alcuni mesi in imprese venete, a partire da quelle che lavorano con l'America Latina."],
      ['🏛️', 'Tirocini nelle istituzioni', 'Esperienze in Regione, nei Comuni, nelle camere di commercio e negli enti culturali.'],
      ['💻', 'Formazione a distanza', 'Corsi online per chi non può partire, come già previsto dagli ultimi avvisi regionali.'],
      ['🔁', "Erasmus+ con l'Argentina", 'Accordi di mobilità tra atenei veneti e argentini, che il programma europeo già consente.'],
      ['🤝', 'Un ritorno per la rete', "Chi rientra porta nell'associazione competenze e contatti, e accompagna chi parte dopo."],
    ]],
    storia: ['Da dove partire', [
      ['2018', "La Regione finanzia master nelle università venete per giovani oriundi tra i 18 e i 39 anni, fino a 10.000 euro a testa."],
      ['2019', 'Nuova edizione dei master, gestita dagli ESU di Padova, Venezia e Verona.'],
      ['2021', 'Nasce una linea di progetti formativi per i giovani oriundi dai 18 ai 39 anni, anche a distanza.'],
      ['2025', "L'avviso annuale della Regione include progetti formativi per i giovani oriundi, in Veneto o a distanza."],
      ['Oggi', 'Il CAVA chiede di farne un programma stabile, con stage in aziende e istituzioni.'],
    ], 'Gli strumenti esistono già, ma sono saltuari e poco conosciuti in Argentina.'] },
  { slug: 'risorse-e-finanziamenti', area: 'giovani', emoji: '💶',
    titolo: 'Ricerca di risorse e finanziamenti',
    sintesi: "Qualora non siano disponibili fondi regionali dedicati, chiedere alla Regione del Veneto di supportare le associazioni nell'individuazione di bandi, finanziamenti europei e internazionali, fondazioni, università e partner privati interessati a sostenere tali iniziative.",
    // Investigado: avvisi L.R. 2/2003 (regione.veneto.it), MAECI missioni di studio, Italea, Erasmus KA171, bandi Cariverona/Cariparo
    testo: ['La proposta', 'Le idee ci sono, servono le risorse', [
      'Scambi, stage e corsi hanno un costo: viaggi, alloggi, docenti. Le associazioni hanno le persone e i contatti, ma raramente i fondi o la struttura per candidarsi ai grandi bandi.',
      'Se i fondi regionali non bastano, il CAVA chiede alla Regione di fare da guida: segnalare i bandi adatti, aiutare a scrivere i progetti e mettere in contatto le associazioni con università, fondazioni e imprese.',
      'Molti bandi richiedono un ente capofila in Italia: con un partner veneto al fianco, i progetti nati in Argentina diventano finanziabili.',
    ]],
    programma: ['Dove cercare', [
      ['🦁', 'Regione del Veneto', 'Gli avvisi annuali della legge 2/2003 per iniziative culturali e progetti formativi, aperti ai circoli registrati.'],
      ['🌐', 'Unione Europea', 'Erasmus+ per la mobilità tra atenei europei e argentini, Horizon Europe per la ricerca.'],
      ['🏛️', 'Stato italiano', 'Farnesina e Italea, il progetto per il turismo delle radici, con contributi per studio e ricerca.'],
      ['🏦', 'Fondazioni', 'Le fondazioni venete che sostengono ricerca e formazione, con un ente veneto come capofila.'],
      ['🎓', 'Università', 'Accordi tra atenei, borse di studio e dottorati in cotutela tra Veneto e Argentina.'],
      ['💼', 'Imprese', 'Aziende venete presenti in Argentina e camere di commercio: borse e stage sponsorizzati.'],
    ]],
    storia: ['Cosa chiede il CAVA alla Regione', [
      ['01', 'Un referente per le associazioni venete all\'estero, a cui chiedere orientamento sui bandi.'],
      ['02', "Una mappa delle opportunità aggiornata ogni anno e diffusa a tutta la rete."],
      ['03', 'Progetti in partenariato, con la Regione o un ente veneto come capofila.'],
      ['04', 'Un corso di progettazione per i circoli, anche online, per imparare a candidarsi.'],
    ]] },
  { slug: 'scuole-agrarie-e-universita', area: 'agricoltura', emoji: '🌾',
    titolo: 'Scambi tra scuole agrarie e università',
    sintesi: "Promuovere accordi di collaborazione tra istituti agrari, università e centri di ricerca del Veneto e dell'Argentina per realizzare programmi di mobilità, formazione e scambio di competenze.",
    // Investigado: Agripolis (unipd.it), Scuola Enologica di Conegliano, INTA; ciudades = localidades de la rete (CITIES)
    testo: ['La proposta', 'Due terre agricole, un sapere comune', [
      'Molti emigrati veneti arrivati in Argentina erano contadini: hanno lavorato la terra nella pampa, nelle colonie di Santa Fe e Córdoba, nelle vigne di Mendoza.',
      'Oggi Veneto e Argentina sono due grandi realtà agroalimentari, con scuole e università di eccellenza. Il CAVA propone accordi tra istituti agrari, università e centri di ricerca per scambiare studenti, docenti e conoscenze.',
      "Le stagioni invertite sono un vantaggio: chi studia viticoltura può vivere la vendemmia in Veneto a settembre e quella argentina a marzo.",
    ]],
    programma: ['Cosa si potrebbe fare', [
      ['📝', 'Gemellaggi tra scuole', 'Accordi tra istituti agrari veneti ed escuelas agrotécnicas argentine.'],
      ['🎒', 'Mobilità degli studenti', 'Periodi di studio e stage in azienda, anche durante la vendemmia e la raccolta.'],
      ['👩‍🏫', 'Scambio di docenti', 'Seminari e corsi brevi tenuti da docenti dei due Paesi, in presenza o online.'],
      ['🔬', 'Ricerca condivisa', "Progetti comuni tra università e centri come l'INTA su clima, acqua e suolo."],
      ['🧀', 'Filiere e tradizioni', 'Vino, formaggi e frutta come laboratorio pratico di competenze tecniche.'],
    ]],
    storia: ['Abbinamenti possibili', [
      ['Vino', "Conegliano, sede della prima scuola enologica d'Italia, e Mendoza, capitale del vino argentino."],
      ['Latte', 'Le scuole agrarie venete e il bacino lattiero di Rafaela e San Francisco.'],
      ['Cereali', "Agripolis, il campus agrario dell'Università di Padova, e la pampa di Pergamino e Marcos Juárez."],
      ['Frutta', "Il Veronese e l'Alto Valle del Río Negro, attorno a Villa Regina."],
    ], 'Ogni area agricola veneta ha un corrispettivo argentino, spesso in una città della rete del CAVA.'] },
  { slug: 'droni-in-agricoltura', area: 'agricoltura', emoji: '🚁',
    titolo: "Formazione sull'utilizzo dei droni in agricoltura",
    sintesi: "Sviluppare corsi, laboratori e attività pratiche sull'impiego dei droni e delle tecnologie di agricoltura di precisione, coinvolgendo studenti, docenti e aziende del settore.",
    // Investigado: master GIScience e SAPR y cursos en Agripolis (unipd.it), encuesta INTA sobre drones, régimen ANAC 2025
    testo: ['La proposta', 'La tecnologia al servizio del campo', [
      "Droni e agricoltura di precisione permettono di monitorare le colture, dosare acqua e fertilizzanti e intervenire solo dove serve: meno costi, meno sprechi, più rispetto per l'ambiente.",
      "In Veneto l'Università di Padova forma da anni sull'uso dei droni in agricoltura, con un master dedicato e prove in campo nell'azienda sperimentale di Legnaro. In Argentina l'INTA studia la diffusione dei droni nel settore agricolo.",
      'Il CAVA propone corsi, laboratori e attività pratiche condivise tra i due Paesi, per studenti, docenti e aziende.',
    ]],
    programma: ['Cosa si potrebbe fare', [
      ['🎓', 'Corsi e laboratori', 'Moduli teorici e prove pratiche di volo, in presenza o a distanza.'],
      ['🛰️', 'Mappe e dati', 'Rilievi con droni e satelliti per leggere lo stato delle colture e decidere meglio.'],
      ['🧪', 'Prove in campo condivise', 'Lo stesso protocollo provato in Veneto e in Argentina, in due stagioni opposte.'],
      ['📜', 'Regole e sicurezza', 'Un confronto tra le norme europee e quelle argentine, aggiornate nel 2025.'],
      ['🏭', 'Le aziende', 'Imprese venete del settore e produttori argentini, per lavorare con tecnologie reali.'],
      ['🌱', 'Giovani tecnici', "Priorità ai giovani della rete, futuri professionisti dell'agricoltura di precisione."],
    ]],
    storia: ['Su cosa costruire', [
      ['Padova', "Un master in GIScience e droni, con un indirizzo dedicato all'agricoltura di precisione."],
      ['Legnaro', "L'azienda agraria sperimentale di Agripolis, dove si svolgono le prove in campo."],
      ['INTA', 'Le stazioni sperimentali di Marcos Juárez, Pergamino e Rafaela, città della rete del CAVA.'],
      ['Oggi', 'Il CAVA propone di mettere in rete queste esperienze con un programma comune.'],
    ]] },
];
P.forEach((p, i) => (p.n = i + 1));

// Textos para la vista previa al compartir (WhatsApp, etc.) y para Google.
// WhatsApp en el celular muestra ~2 líneas de título y ~2 de descripción: título ≤ 50 caracteres, descripción ≤ 100.
const SHARE = {
  'invito-autorita-regione-veneto': ['Le Autorità del Veneto in Argentina', 'Una visita istituzionale per incontrare comunità, associazioni e istituzioni venete in Argentina.'],
  'argentina-sede-consulta': ["L'Argentina sede della Consulta", 'Una futura sessione della Consulta in Argentina, dove vive una grande collettività veneta.'],
  'scambio-giovanile': ['Riprendere gli scambi giovanili', 'Soggiorni culturali, linguistici e formativi in Veneto per i giovani discendenti veneti.'],
  'formazione-e-stage': ['Formazione e stage in Veneto', 'Alta formazione, tirocini e stage in enti, università e aziende venete per i giovani.'],
  'risorse-e-finanziamenti': ['Risorse e finanziamenti', 'Bandi, fondi europei, fondazioni e partner privati per sostenere i progetti delle associazioni.'],
  'scuole-agrarie-e-universita': ['Scuole agrarie e università', "Accordi tra istituti agrari, università e centri di ricerca del Veneto e dell'Argentina."],
  'droni-in-agricoltura': ['Droni in agricoltura', 'Corsi e laboratori pratici su droni e agricoltura di precisione per studenti, docenti e aziende.'],
};
P.forEach((p) => ([p.shareTitolo, p.shareDesc] = SHARE[p.slug]));

// Textos que se repiten en la web y en el PDF
const ABOUT = 'Il CAVA coordina le attività delle associazioni e rappresenta la comunità veneto-argentina presso la Regione Veneto e le autorità consolari italiane e argentine.';
const PERCHE = "Le associazioni di emigrati veneti all'estero si presentano come ambasciatori autentici della Regione Veneto, in grado di rappresentarne valori, tradizioni e capacità innovativa. Sono ponti operativi che collegano il Veneto con i Paesi ospitanti.";
const RUOLI = [
  ['Istituzioni', 'Aprire le porte istituzionali verso autorità e organismi locali e nazionali.'],
  ['Economia', 'Favorire rapporti economici e professionali e canali di cooperazione culturale, economica e accademica, con opportunità per imprese e investitori.'],
  ['Cultura e turismo', 'Promuovere scambi culturali e turistici, incentivando visite e percorsi identitari, anche per chi voglia intraprendere attività in Argentina.'],
  ['Giovani', 'Sostenere iniziative formative e programmi di mobilità per giovani e professionisti, rafforzando il legame identitario e il capitale umano.'],
];
const CITAZIONE = "Le associazioni non sono semplici custodi della tradizione, ma <em>attori strategici di diplomazia culturale ed economica</em>, capaci di aprire le porte dell'Argentina e di generare nuove opportunità di interscambio.";

// Documento PDF con las siete propuestas (lo genera este script al final, con Chrome o Edge)
const PDF_FILE = 'CAVA-Proposte-Consulta-Veneti-nel-Mondo.pdf';
const PDF_PAGES = 6;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// En las etiquetas del <head> también el apóstrofo: algunos lectores de vista previa cortan el texto en "l'Argentina"
const escAttr = (s) => esc(s).replace(/'/g, '&#39;');
const pad = (n) => String(n).padStart(2, '0');

// ---------------- Mapa (SVG de la presentación "Mille chilometri") ----------------
const inner = (f) => readFileSync(join(MAPS, f), 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const province = inner('3.svg')
  .replace('<g fill="#33506C" stroke="#2A425B"', '<g class="prov-off" fill="#33506C" stroke="#2A425B"')
  .replace('<g fill="#E6DAC0" stroke="#B9A880"', '<g class="prov-on" fill="#E6DAC0" stroke="#B9A880"');
const puntini = readFileSync(join(MAPS, '1.svg'), 'utf8').match(/<g fill="none" stroke-linecap="round">[\s\S]*?<\/g>/)[0];
const malvinas = inner('4.svg').replace('<path ', '<path class="malvinas" ');
const italia = inner('8.svg');

// ---------------- Mapa de la rete ----------------
// Proyección del dibujo de la presentación ("Mille chilometri"), calibrada por mínimos cuadrados con las
// 12 ciudades que ya tenían punto: x = 23.2109·lon − 0.6481·lat + 1657.09 ; y = 0.0941·lon − 29.3055·lat − 623.36
const proj = (lat, lon) => [23.2109 * lon - 0.6481 * lat + 1657.0901, 0.09407 * lon - 29.30548 * lat - 623.35541];
const BA = [326.2, 386.1];

// Localidades con asociaciones y distancias desde Buenos Aires (tiempos.txt: km aproximados por ruta y horas de micro).
// xy = posición de la diapositiva; ll = coordenadas reales (se proyectan). main = nombre siempre visible.
// pos = lado de la etiqueta: r derecha, l izquierda, t arriba, b abajo, bl abajo-izquierda.
// it = comparación con un viaje desde Venezia (de la presentación).
const CITIES = [
  { id: 'buenos-aires', n: 'Buenos Aires', prov: 'Città Autonoma di Buenos Aires', xy: BA, hq: true },
  { id: 'la-plata', n: 'La Plata', prov: 'Buenos Aires', xy: [335.8, 395.9], main: true, pos: 'bl', small: true, km: '60', t: '1 h – 1 h 30 min', ts: '1–1½ h' },
  { id: 'mar-del-plata', n: 'Mar del Plata', prov: 'Buenos Aires', xy: [339.1, 485.6], main: true, pos: 'r', km: '410', t: '5 – 6 h', ts: '5–6 h', it: ['Genova', '390'] },
  { id: 'pergamino', n: 'Pergamino', prov: 'Buenos Aires', ll: [-33.8895, -60.5736], pos: 'b', km: '225', t: '3 h – 3 h 30 min', ts: '3–3½ h' },
  { id: 'rosario', n: 'Rosario', prov: 'Santa Fe', xy: [274.1, 335.6], main: true, pos: 'b', km: '300', t: '4 h – 4 h 30 min', ts: '4–4½ h', it: ['Milano', '270'] },
  { id: 'santa-fe', n: 'Santa Fe', prov: 'Santa Fe', xy: [273.9, 297.6], main: true, pos: 'r', km: '475', t: '6 – 7 h', ts: '6–7 h' },
  { id: 'rafaela', n: 'Rafaela', prov: 'Santa Fe', ll: [-31.2503, -61.4867], pos: 't', km: '530', t: '6 h 30 min – 8 h', ts: '6½–8 h' },
  { id: 'parana', n: 'Paraná', prov: 'Entre Ríos', xy: [289, 311], pos: 'b', km: '500', t: '6 – 7 h', ts: '6–7 h' }, // a 25 km de Santa Fe: corrido un poco al este para que se vean los dos
  { id: 'gualeguaychu', n: 'Gualeguaychú', prov: 'Entre Ríos', ll: [-33.0094, -58.5172], pos: 'r', km: '230', t: '3 – 4 h', ts: '3–4 h' },
  { id: 'cordoba', n: 'Córdoba', prov: 'Córdoba', xy: [187.8, 290.1], main: true, pos: 't', km: '700', t: '8 h 30 min – 10 h', ts: '8½–10 h', it: ['Napoli', '725'] },
  { id: 'rio-cuarto', n: 'Río Cuarto', prov: 'Córdoba', xy: [184.0, 339.3], main: true, pos: 'b', km: '600', t: '7 h 30 min – 9 h', ts: '7½–9 h' },
  { id: 'san-francisco', n: 'San Francisco', prov: 'Córdoba', ll: [-31.4278, -62.0828], pos: 'b', km: '575', t: '7 – 8 h', ts: '7–8 h' },
  { id: 'marcos-juarez', n: 'Marcos Juárez', prov: 'Córdoba', ll: [-32.6978, -62.1067], pos: 'b', km: '460', t: '5 h 30 min – 7 h', ts: '5½–7 h' },
  { id: 'tucuman', n: 'Tucumán', prov: 'Tucumán', xy: [160.7, 156.9], main: true, pos: 'r', km: '1.200', t: '14 – 16 h', ts: '14–16 h', it: ['Reggio Calabria', '1.200'] },
  { id: 'catamarca', n: 'Catamarca', prov: 'Catamarca', xy: [147.0, 205.2], main: true, pos: 'r', km: '1.150', t: '14 – 16 h', ts: '14–16 h' },
  { id: 'mendoza', n: 'Mendoza', prov: 'Mendoza', xy: [75.1, 335.5], main: true, pos: 't', km: '1.050', t: '12 – 14 h', ts: '12–14 h', it: ['Catanzaro', '1.113'] },
  { id: 'santa-rosa', n: 'Santa Rosa', prov: 'La Pampa', ll: [-36.6167, -64.2833], pos: 'r', km: '600', t: '8 – 10 h', ts: '8–10 h' },
  { id: 'bariloche', n: 'Bariloche', prov: 'Río Negro', xy: [33.4, 577.3], main: true, pos: 'r', km: '1.580', t: '19 – 22 h', ts: '19–22 h', it: ['Palermo', '1.425'] },
  { id: 'villa-regina', n: 'Villa Regina', prov: 'Río Negro', xy: [123.7, 513.2], main: true, pos: 'r', km: '1.100', t: '13 – 15 h', ts: '13–15 h' },
].map((c) => {
  const xy = c.xy || proj(...c.ll).map((v) => +v.toFixed(1));
  if (c.hq) return { ...c, xy };
  // Arco desde Buenos Aires: curva cuadrática que se arquea hacia el norte
  const [x1, y1] = BA, [x2, y2] = xy;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len, ny = dx / len;
  if (ny > 0) { nx = -nx; ny = -ny; }
  const k = len * 0.22;
  const cx = (x1 + x2) / 2 + nx * k, cy = (y1 + y2) / 2 + ny * k;
  return { ...c, xy, d: `M${x1} ${y1}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}` };
});
const CITY = Object.fromEntries(CITIES.map((c) => [c.id, c]));
// Los 4 destinos destacados en la lista de distancias
const FEATURED = ['mendoza', 'cordoba', 'mar-del-plata', 'rosario'];
const num = (s) => Number(String(s).replace(/\./g, ''));
const pct = ([x, y]) => `left:${(x / 475 * 100).toFixed(2)}%;top:${(y / 986 * 100).toFixed(2)}%`;
const others = CITIES.filter((c) => !c.hq);

const mapSvg = `<svg class="map-svg" viewBox="0 0 475 986" role="img" aria-label="Mappa dell'Argentina: in verde le province con associazioni venete; i punti sono le località con associazioni (${others.map((c) => c.n).join(', ')}). In rosso Buenos Aires, sede del CAVA.">
          ${province}
          ${malvinas}
          <g class="routes-svg" aria-hidden="true">
${others.map((c) => `            <g class="route-svg" data-city="${c.id}"><path class="route-halo" pathLength="1" d="${c.d}"/><path class="route-line" pathLength="1" d="${c.d}"/><circle class="traveler" r="6"><animateMotion dur="1.5s" begin="indefinite" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.22 1 0.36 1" path="${c.d}"/></circle></g>`).join('\n')}
          </g>
          <g class="cities" aria-hidden="true">
${others.map((c, i) => `            <g class="city${c.main ? ' main' : ''}" data-city="${c.id}" style="--i:${i}"><circle class="city-hit" cx="${c.xy[0]}" cy="${c.xy[1]}" r="16"/><circle class="city-dot${c.small ? ' small' : ''}" cx="${c.xy[0]}" cy="${c.xy[1]}" r="${c.small ? 5.5 : c.main ? 7 : 5.5}"/></g>`).join('\n')}
          </g>
          <g class="hq" data-city="buenos-aires" aria-hidden="true"><circle class="hq-ring" cx="${BA[0]}" cy="${BA[1]}" r="9.5"/><circle class="hq-dot" cx="${BA[0]}" cy="${BA[1]}" r="9.5"/></g>
          <g class="italia" aria-hidden="true"><svg x="21" y="379" width="277" height="326" viewBox="0 0 277 326">${italia}</svg></g>
          <g class="scale" aria-hidden="true"><path d="M200 955H460M200 948V962M460 948V962"/><text x="330" y="940" text-anchor="middle">1.000 km</text></g>
        </svg>`;

const mapLabels = others.map((c, i) => `<span class="city-label pos-${c.pos}${c.main ? ' main' : ''}" data-city="${c.id}" style="${pct(c.xy)};--i:${i}">${c.n}<b>${c.km} km · ${c.ts}</b></span>`).join('\n          ');

// Lista agrupada por provincia (en el orden de CITIES)
const LOCALITA = [];
for (const c of CITIES) {
  let g = LOCALITA.find((x) => x[0] === c.prov);
  if (!g) LOCALITA.push((g = [c.prov, []]));
  g[1].push(c);
}

// ---------------- Piezas comunes ----------------
// Dominio donde se publica la web. WhatsApp, Facebook, etc. necesitan URLs completas
// para mostrar la imagen de vista previa. Cambiarlo acá (o buscar y reemplazar en los .html).
const SITE = 'https://consulta.comitatocava.org';

// m = { path, ogTitle, image, imageAlt, seoDesc }
// desc es la descripción corta de la vista previa al compartir; para Google (seoDesc) conviene 120–160 caracteres.
const head = (r, title, desc, m) => `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${escAttr(m.seoDesc || desc)}">
  <link rel="canonical" href="${SITE}/${m.path}">
  <meta name="theme-color" content="#0b1828">

  <!-- Vista previa al compartir (WhatsApp, Facebook, LinkedIn, X) -->
  <meta property="og:type" content="website">
  <meta property="og:locale" content="it_IT">
  <meta property="og:site_name" content="CAVA · Comitato delle Associazioni Venete dell&#39;Argentina">
  <meta property="og:url" content="${SITE}/${m.path}">
  <meta property="og:title" content="${escAttr(m.ogTitle)}">
  <meta property="og:description" content="${escAttr(desc)}">
  <meta property="og:image" content="${SITE}/${m.image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escAttr(m.imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escAttr(m.ogTitle)}">
  <meta name="twitter:description" content="${escAttr(desc)}">
  <meta name="twitter:image" content="${SITE}/${m.image}">

  <!-- Íconos -->
  <link rel="icon" href="${r}favicon.ico" sizes="48x48">
  <link rel="icon" type="image/png" sizes="32x32" href="${r}assets/img/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="${r}assets/img/favicon-16.png">
  <link rel="apple-touch-icon" href="${r}assets/img/apple-touch-icon.png">
  <link rel="manifest" href="${r}site.webmanifest">

  <link rel="preload" href="${r}assets/fonts/ZTNature-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${r}assets/fonts/ZTNature-Bold.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${r}css/style.css">
  <script>document.documentElement.classList.add('js');</script>
</head>`;

const MAIL = 'mailto:federazionecava@gmail.com';

// Barra superior. En las propuestas suma un modo "contexto" (03 / 07 · título, anterior / siguiente,
// progreso de lectura) que aparece al pasar el hero.
const nav = (r, home, p) => {
  const h = home ? '' : `${r}index.html`;
  // En la landing los links siguen el orden de las secciones (las propuestas al final);
  // en las propuestas, "← Proposte" va primero como link de vuelta.
  const L = {
    proposte: `<a href="${h}#proposte" data-spy="proposte">${home ? '' : '← '}Proposte</a>`,
    chi: `<a href="${h}#chi-siamo" data-spy="chi-siamo">Chi siamo</a>`,
    rete: `<a href="${h}#la-rete" data-spy="la-rete">La rete</a>`,
    perche: `<a href="${h}#perche" data-spy="perche">Perché</a>`,
  };
  const [a1, a2, b1, b2] = home ? [L.chi, L.rete, L.perche, L.proposte] : [L.proposte, L.chi, L.rete, L.perche];
  const prev = p && P[p.n - 2];
  const next = p && P[p.n];
  const ctx = p ? `
    <div class="nav-ctx" aria-label="Proposta ${p.n} di 7">
      ${prev ? `<a class="ctx-arrow" href="${prev.slug}.html" aria-label="Proposta precedente: ${esc(prev.titolo)}">←</a>` : `<span class="ctx-arrow is-off" aria-hidden="true">←</span>`}
      <a class="ctx-title" href="#main"><b>${pad(p.n)}</b><span class="ctx-of">/ 07</span><span class="ctx-name">${esc(p.corto ? p.corto.titolo : p.titolo)}</span></a>
      <div class="ctx-end">
        <a class="ctx-all" href="${r}index.html#proposte">Tutte le proposte</a>
        ${next ? `<a class="ctx-arrow" href="${next.slug}.html" aria-label="Proposta successiva: ${esc(next.titolo)}">→</a>` : `<span class="ctx-arrow is-off" aria-hidden="true">→</span>`}
        <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Apri il menu"><span></span><span></span><span></span></button>
      </div>
      <span class="nav-progress" aria-hidden="true"></span>
    </div>` : '';
  return `
  <a class="skip-link" href="#main">Vai al contenuto</a>
  <header class="nav${p ? ' has-ctx' : ''}">
    <div class="nav-main">
      <nav class="nav-links" aria-label="Sezioni">
        ${a1}
        ${a2}
      </nav>
      <a class="brand" href="${r}index.html" aria-label="CAVA · Inizio"><img class="brand-mark" src="${r}assets/img/logo-mark.png" width="166" height="120" alt=""></a>
      <div class="nav-end">
        <nav class="nav-links" aria-label="Altre sezioni">
          ${b1}
          ${b2}
        </nav>
        <a class="nav-cta" href="${MAIL}">Scrivici</a>
        <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Apri il menu"><span></span><span></span><span></span></button>
      </div>
    </div>${ctx}
  </header>

  <div class="menu" id="menu">
    <div class="menu-inner">
      <div class="menu-sec">
        <p class="menu-label">Il CAVA</p>
        <ul>
          <li style="--i:0"><a href="${r}index.html">Inizio</a></li>
          <li style="--i:1"><a href="${r}index.html#chi-siamo">Chi siamo</a></li>
          <li style="--i:2"><a href="${r}index.html#la-rete">La rete</a></li>
          <li style="--i:3"><a href="${r}index.html#perche">Perché vale la pena</a></li>
        </ul>
        <a class="menu-mail" style="--i:4" href="${MAIL}"><small>Scrivici</small>federazionecava@gmail.com</a>
      </div>
      <div>
        <p class="menu-label">Le sette proposte</p>
        <ol class="menu-props">
${P.map((q, i) => `          <li style="--i:${i + 2}"><a class="menu-prop${p && q.n === p.n ? ' is-current' : ''}" data-area="${q.area}" href="${r}proposte/${q.slug}.html"><b>${pad(q.n)}</b><span>${esc(q.titolo)}</span></a></li>`).join('\n')}
        </ol>
      </div>
    </div>
  </div>`;
};
const bg = (r, theme, video) => `
    <div class="bg" data-theme="${theme}" aria-hidden="true">
      <!-- Video de fondo: poné el archivo en ${video} (ver videosabuscar.txt) -->
      <video class="bg-video" data-src="${r}${video}" muted loop playsinline preload="none"></video>
      <div class="bg-shade"></div>
    </div>`;

const footer = (r) => `
  <footer class="footer" id="contatti">
    <div class="footer-map" aria-hidden="true"><svg viewBox="0 0 475 986">${puntini}<circle class="footer-ba" cx="326.2" cy="386.1" r="10"/></svg></div>
    <div class="container">
      <div class="footer-cta">
        <h2 data-reveal>Costruiamolo <span>insieme.</span></h2>
        <div class="footer-contact" data-reveal style="--i:1">
          <p>Per sostenere le proposte o collaborare con il CAVA, scriveteci.</p>
          <a class="footer-mail" href="mailto:federazionecava@gmail.com">
            <span class="footer-mail-text"><small>Scrivici</small>federazionecava@gmail.com</span>
            <span class="footer-mail-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 CAVA · federazionecava</span>
        <span class="credits">Realizzato da <a href="https://www.linkedin.com/in/wurst" target="_blank" rel="noopener">Bruno Wurst</a></span>
        <a class="to-top" href="#main">Torna su ↑</a>
      </div>
    </div>
  </footer>
  <script src="${r}js/main.js" defer></script>
</body>
</html>
`;

const label = (text) => `<p class="label">${text}</p>`;

const card = (r, p, i) => `
          <li>
            <article class="p-card" data-area="${p.area}" data-reveal style="--i:${i % 3}">
              <div class="p-top">
                <span class="p-num">${pad(p.n)}</span>
                <span class="p-emoji" aria-hidden="true" style="view-transition-name:emoji-${p.n}">${p.emoji}</span>
              </div>
              <h3><a href="${r}proposte/${p.slug}.html">${esc(p.titolo)}</a></h3>
              <div class="p-foot">
                <span class="p-area">${AREE[p.area]}</span>
                <span class="p-arrow" aria-hidden="true">Leggi <i>→</i></span>
              </div>
            </article>
          </li>`;

// ---------------- Landing ----------------
const index = `${head('', 'CAVA · Proposte per la Consulta dei Veneti nel Mondo', 'Sette proposte per rafforzare i rapporti tra Veneto e Argentina, su istituzioni, giovani e agricoltura.', { path: '', ogTitle: 'CAVA · Proposte per la Consulta dei Veneti nel Mondo', seoDesc: "Le associazioni venete dell'Argentina (CAVA) presentano sette proposte per rafforzare i rapporti tra Veneto e Argentina, su istituzioni, giovani e agricoltura.", image: 'assets/img/og.jpg?v=2', imageAlt: 'Logo del CAVA su un canale di Venezia: Proposte per la Consulta dei Veneti nel Mondo' })}
<body>${nav('', true)}

  <main id="main">
  <section class="hero">${bg('', 'cava', 'video/landing.mp4')}
    <div class="hero-content">
      <img class="hero-logo fade-in" style="--d:0s" src="assets/img/logo-cava.png" width="720" height="513" alt="CAVA · Comitato delle Associazioni Venete dell'Argentina" fetchpriority="high">
      <p class="eyebrow fade-in" style="--d:.1s">Proposte per la Consulta dei Veneti nel&nbsp;Mondo</p>
      <h1 class="fade-in" style="--d:.2s">Un ponte tra il Veneto e&nbsp;l'Argentina</h1>
      <p class="lead fade-in" style="--d:.35s">Più di venti associazioni in nove province argentine, unite nel CAVA. Chi siamo, dove siamo e cosa proponiamo.</p>
    </div>
    <a class="hero-down fade-in" style="--d:.6s" href="#chi-siamo">Chi siamo <span aria-hidden="true">↓</span></a>
  </section>

  <div class="sheet">
    <section class="container" id="chi-siamo">
      <div class="about">
        <div class="about-head" data-reveal>
          <img class="about-logo" src="assets/img/logo-cava.png" width="720" height="513" alt="" loading="lazy" decoding="async">
          <h2>Una federazione di associazioni venete</h2>
        </div>
        <div class="about-body" data-reveal style="--i:1">
          <p class="big">${ABOUT}</p>
          <p>Senza fini di lucro, iscritto all'Albo della Regione Veneto.</p>
          <dl class="facts">
            <div><dt>1998</dt><dd>fondato a Buenos Aires il 25 luglio</dd></div>
            <div><dt data-count="18">18</dt><dd>località, in 9 province e nella Città Autonoma di Buenos Aires</dd></div>
            <div><dt data-count="20">20<span class="count-plus">+</span></dt><dd>associazioni federate</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section class="section container" id="la-rete">
      <div class="rete">
        <div class="rete-text">
          <div class="rete-head" data-reveal>
            <h2>Mille chilometri per ritrovarci</h2>
            <p class="big">Le associazioni si trovano in 9 province e nella Città Autonoma di Buenos Aires, da Tucumán a Bariloche. Il CAVA ha sede a Buenos Aires: per ritrovarsi, ognuno parte da qui.</p>
          </div>

          <div class="routes-wrap" data-reveal>
          <div class="routes-top">
            <p class="routes-hint">Le distanze da Buenos Aires, a confronto con un viaggio simile in Italia</p>
            <p class="cmp-legend"><span class="ar">In Argentina</span><span class="it">In Italia</span></p>
          </div>
          <ol class="routes">
${FEATURED.map((id) => CITY[id]).map((c) => `            <li><button class="route" type="button" data-city="${c.id}" aria-pressed="false">
              <span class="route-top"><span class="route-city">${c.n}</span><span class="route-time">${c.t} di pullman</span></span>
              <span class="cmp">
                <span class="cmp-row ar" style="--v:${num(c.km)}"><span class="cmp-label">Buenos Aires → ${c.n}</span><span class="cmp-track"><i></i></span><b>${c.km} km</b></span>
                <span class="cmp-row it" style="--v:${num(c.it[1])}"><span class="cmp-label">Venezia → ${c.it[0]}</span><span class="cmp-track"><i></i></span><b>${c.it[1]} km</b></span>
              </span>
            </button></li>`).join('\n')}
          </ol>
          </div>

          <div class="localita" data-reveal>
            <h3>Tutte le sedi</h3>
            <p class="routes-hint"><span class="hint-desk">Tocca una località per vedere il viaggio da Buenos Aires</span><span class="hint-mob">Tocca una provincia per vedere le sue sedi, poi una sede per il viaggio da Buenos Aires</span></p>
            <dl>
${LOCALITA.map(([prov, cs]) => `              <div><dt>${prov}</dt><dd>${cs.map((c) => `<button class="sede" type="button" data-city="${c.id}">${c.n}</button>`).join('')}</dd></div>`).join('\n')}
            </dl>          </div>
        </div>

        <div class="map-col" data-reveal>
          <div class="map-switch" role="group" aria-label="Vista della mappa">
            <button type="button" data-view="rete" aria-pressed="true">La rete</button>
            <button type="button" data-view="italia" aria-pressed="false">Italia alla stessa scala</button>
          </div>
          <figure class="map">
          ${mapSvg}
          ${mapLabels}
          <span class="map-hq" data-city="buenos-aires" style="${pct([342, 386])}">Buenos Aires<b>sede del CAVA</b></span>
          <figcaption class="map-legend"><span class="lg-dot">Località con associazioni</span><span class="lg-prov">Province con associazioni</span></figcaption>
          </figure>
          <p class="map-note"><span class="note-rete">Tocca un punto sulla mappa per vedere il viaggio.</span><span class="note-italia">L'Argentina è circa <strong>nove volte</strong> più grande dell'Italia: 2,8 milioni di km² contro 301 mila. In rosso, il Veneto.</span></p>
        </div>
      </div>
    </section>
  </div>

  <section class="band band-to-sheet" id="perche">${bg('', 'veneto', 'video/associazioni.mp4')}
    <div class="container">
      <div class="sec-head on-dark" data-reveal>
        <h2>Ruolo strategico delle associazioni</h2>
        <p>${PERCHE}</p>
      </div>
      <ol class="roles">
${RUOLI.map(([t, d], i) => `        <li class="role" data-reveal style="--i:${i}"><span class="role-n">${['I', 'II', 'III', 'IV'][i]}</span><h3>${t}</h3><p>${d}</p></li>`).join('\n')}
      </ol>
      <blockquote class="quote" data-reveal>
        <p>${CITAZIONE}</p>
      </blockquote>
    </div>
  </section>

  <div class="sheet">
    <section class="container" id="proposte">
      <div class="sec-head" data-reveal>
        <h2>Sette proposte, tre ambiti</h2>
        <ul class="legend" aria-label="Ambiti">
          <li data-area="istituzioni">Istituzioni</li>
          <li data-area="giovani">Giovani e formazione</li>
          <li data-area="agricoltura">Agricoltura e innovazione</li>
        </ul>
      </div>
      <ol class="proposals">${P.map((p, i) => card('', p, i)).join('')}
      </ol>
      <div class="pdf-wrap" data-reveal>
        <a class="btn btn-pdf" href="documento/${PDF_FILE}" download><span class="btn-arrow" aria-hidden="true">↓</span>Scarica il documento<small>PDF · ${PDF_PAGES} pagine</small></a>
      </div>
    </section>
  </div>
  </main>
${footer('')}`;

writeFileSync(join(OUT, 'index.html'), index);

// ---------------- Páginas de propuesta ----------------
for (const p of P) {
  const r = '../';
  const [ruoloT, ruoloD] = RUOLO[p.area];
  const prev = P[p.n - 2];
  const next = P[p.n];
  const cards = (titolo, items) => `
      <section class="block">
        <div class="sec-head center" data-reveal>
          <h2>${esc(titolo)}</h2>
        </div>
        <ul class="reasons">
${items.map(([e, t, d], i) => `          <li class="reason" data-reveal style="--i:${i}"><span class="reason-emoji" aria-hidden="true">${e}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('\n')}
        </ul>
      </section>`;
  const ragioni = p.ragioni ? cards("Perché puntare sull'Argentina", p.ragioni) : '';
  const programma = p.programma ? cards(...p.programma) : '';
  const testo = p.testo ? `
      <section class="block ruolo testo" data-reveal>
        <div>
          ${label(p.testo[0])}
          <h2>${esc(p.testo[1])}</h2>
        </div>
        <div>
${p.testo[2].map((t, i) => `          <p${i ? '' : ' class="big"'}>${esc(t)}</p>`).join('\n')}
        </div>
      </section>` : '';
  const storia = p.storia ? `
      <section class="block">
        <div class="sec-head" data-reveal>
          <h2>${esc(p.storia[0])}</h2>${p.storia[2] ? `
          <p>${esc(p.storia[2])}</p>` : ''}
        </div>
        <ol class="timeline">
${p.storia[1].map(([a, t], i) => `          <li${a === 'Oggi' || a === 'Domani' ? ' class="is-now"' : ''} data-reveal style="--i:${i}"><b>${esc(a)}</b><p>${esc(t)}</p></li>`).join('\n')}
        </ol>
      </section>` : '';

  const html = `${head(r, `Proposta ${p.n} · ${p.shareTitolo} · CAVA`, p.shareDesc, { path: `proposte/${p.slug}.html`, ogTitle: `Proposta ${p.n} · ${p.shareTitolo}`, seoDesc: `${p.shareDesc} Una proposta del CAVA per la Consulta dei Veneti nel Mondo.`, image: `assets/img/og/${p.slug}.jpg`, imageAlt: `Proposta ${p.n} di 7 del CAVA: ${p.titolo}` })}
<body data-area="${p.area}" data-page="${p.slug}">${nav(r, false, p)}

  <main id="main">
  <section class="hero hero-proposal">${bg(r, p.area, `video/${p.slug}.mp4`)}
    <div class="hero-content">
      <span class="hero-emoji fade-in" style="--d:0s;view-transition-name:emoji-${p.n}" aria-hidden="true"><span class="float">${p.emoji}</span></span>
      <p class="eyebrow fade-in" style="--d:.1s">Proposta ${p.n} di 7</p>
      <h1 class="fade-in" style="--d:.2s">${esc(p.corto ? p.corto.titolo : p.titolo)}</h1>
      <p class="lead fade-in" style="--d:.4s">${esc(p.corto ? p.corto.lead : p.sintesi)}</p>
      <span class="chip fade-in" style="--d:.55s">${AREE[p.area]}</span>
    </div>
  </section>

  <div class="sheet">
    <div class="container">${p.corto ? `
      <section class="block ruolo testo" data-reveal>
        <div>
          ${label('Il testo della proposta')}
          <h2>${esc(p.titolo)}</h2>
        </div>
        <div>
          <p class="big">${esc(p.sintesi)}</p>
        </div>
      </section>` : ''}${testo}${ragioni}${programma}${storia}

      <section class="block ruolo" data-reveal>
        <div>
          ${label('Il ruolo delle associazioni')}
          <h2>${ruoloT}</h2>
        </div>
        <div>
          <p class="big">${esc(ruoloD)}</p>
          <p>Le associazioni di emigrati veneti all'estero sono ponti operativi che collegano il Veneto con i Paesi ospitanti.</p>
          <a class="link" href="${r}index.html#la-rete">La rete del CAVA in Argentina <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <nav class="block pager" aria-label="Altre proposte" data-reveal>
        ${prev ? `<a class="prev" href="${prev.slug}.html" data-area="${prev.area}">
          <small><span aria-hidden="true">←</span> Proposta precedente</small>
          <span class="pg-num">${pad(prev.n)}</span>
          <strong>${esc(prev.titolo)}</strong>
        </a>` : ''}
        ${next ? `<a class="next${prev ? '' : ' only'}" href="${next.slug}.html" data-area="${next.area}">
          <small>Proposta successiva <span aria-hidden="true">→</span></small>
          <span class="pg-num">${pad(next.n)}</span>
          <strong>${esc(next.titolo)}</strong>
        </a>` : ''}
      </nav>

      <div class="back-wrap">
        <a class="btn" href="${r}index.html#proposte"><span class="btn-arrow" aria-hidden="true">←</span>Torna alle proposte</a>
      </div>
    </div>
  </div>
  </main>
${footer(r)}`;
  writeFileSync(join(OUT, 'proposte', `${p.slug}.html`), html);
}
console.log('ok', P.length + 1, 'pages');

// ---------------- Documento PDF ----------------
// Arma recursos/documento/documento.html (A4, estilos en documento.css) y lo imprime a PDF con Chrome o Edge.
// Para verlo antes de imprimir, abrí documento.html en el navegador. El QR (qr.svg) lleva a SITE: si cambia
// el dominio, regeneralo con:  npx qrcode -t svg -e M -q 0 -d "#13263b" -l "#0000" -o recursos/generador/qr.svg "https://nuevo-dominio/"
const D = '../../';
const dots = `<div class="dots" aria-hidden="true"><svg viewBox="0 0 475 986">${puntini}<circle class="ba" cx="326.2" cy="386.1" r="10"/></svg></div>`;
const qr = readFileSync(join(GEN, 'qr.svg'), 'utf8').replace(/^[\s\S]*?(?=<svg)/, '');
const run = (n) => `
    <header class="run"><span class="run-brand"><img src="${D}assets/img/logo-mark.png" alt="">Proposte per la Consulta dei Veneti nel Mondo</span><span><b>${pad(n)}</b> / ${pad(PDF_PAGES)}</span></header>`;
const legend = `<ul class="legend">${Object.entries(AREE).map(([k, v]) => `<li data-area="${k}">${v}</li>`).join('')}</ul>`;

const pcard = (p) => `
        <article class="pc" id="proposta-${pad(p.n)}" data-area="${p.area}">
          <div class="pc-side"><span class="pc-num">${pad(p.n)}</span><span class="pc-emoji emoji">${p.emoji}</span></div>
          <div class="pc-body">
            <span class="pc-area">${AREE[p.area]}</span>
            <h3>${esc(p.titolo)}</h3>
            <p>${esc(p.sintesi)}</p>${p.ragioni ? `
            <div class="reasons">
              <p class="reasons-title">Perché puntare sull'Argentina</p>
${p.ragioni.map(([e, t, d]) => `              <div class="reason"><span class="emoji">${e}</span><div><h4>${esc(t)}</h4><p>${esc(d)}</p></div></div>`).join('\n')}
            </div>` : ''}
            <a class="pc-link" href="${SITE}/proposte/${p.slug}.html">Leggi online <span>→</span></a>
          </div>
        </article>`;

const doc = `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <title>CAVA · Proposte per la Consulta dei Veneti nel Mondo</title>
  <style>
${readFileSync(join(GEN, 'documento.css'), 'utf8')}
  </style>
</head>
<body>
  <section class="page cover">
    <div class="cover-hero">${dots}
      <div class="cover-content">
        <img class="cover-logo" src="${D}assets/img/logo-cava.png" alt="CAVA · Comitato delle Associazioni Venete dell'Argentina">
        <h1>Proposte per la Consulta dei Veneti nel&nbsp;Mondo</h1>
        <p class="lead">Sette proposte per rafforzare i rapporti tra Veneto e Argentina.</p>
      </div>
    </div>
    <div class="cover-sheet">
      <div class="cover-sheet-head"><h2>Le sette proposte</h2>${legend}</div>
      <ol class="toc">
${P.map((p) => `        <li data-area="${p.area}"><a href="#proposta-${pad(p.n)}"><b>${pad(p.n)}</b><span>${esc(p.titolo)}</span><small>${AREE[p.area]}</small></a></li>`).join('\n')}
      </ol>
      <p class="cover-foot"><a href="${SITE}/">${SITE.replace(/^https?:\/\//, '')}</a><a href="${MAIL}">federazionecava@gmail.com</a></p>
    </div>
  </section>

  <section class="page">${run(2)}
    <div class="inner">
      <div class="sec-head">
        <p class="label">Le proposte</p>
        <h2 class="h2">Sette proposte, tre ambiti</h2>
        ${legend}
      </div>
      <div class="props">${P.slice(0, 3).map(pcard).join('')}
      </div>
    </div>
  </section>

  <section class="page">${run(3)}
    <div class="inner">
      <div class="props">${P.slice(3).map(pcard).join('')}
      </div>
    </div>
  </section>

  <section class="page">${run(4)}
    <div class="inner">
      <div class="about">
        <div class="about-head">
          <img class="about-logo" src="${D}assets/img/logo-cava.png" alt="">
          <p class="label">Chi siamo</p>
          <h2 class="h2">Una federazione di associazioni venete</h2>
        </div>
        <div class="about-body">
          <p class="big">${ABOUT}</p>
          <p>Senza fini di lucro, iscritto all'Albo della Regione Veneto.</p>
          <dl class="facts">
            <div><dt>1998</dt><dd>fondato a Buenos Aires il 25 luglio</dd></div>
            <div><dt>18</dt><dd>località, in 9 province e nella Città Autonoma di Buenos Aires</dd></div>
            <div><dt>20<span>+</span></dt><dd>associazioni federate</dd></div>
          </dl>
        </div>
      </div>
    </div>
    <div class="band">${dots}
      <h2>Ruolo strategico delle associazioni</h2>
      <p class="band-lead">${PERCHE}</p>
      <ol class="roles">
${RUOLI.map(([t, d], i) => `        <li class="role"><span class="role-n">${['I', 'II', 'III', 'IV'][i]}</span><h3>${t}</h3><p>${d}</p></li>`).join('\n')}
      </ol>
      <blockquote class="quote"><p>${CITAZIONE}</p></blockquote>
    </div>
  </section>

  <section class="page">${run(5)}
    <div class="inner">
      <div class="rete-head">
        <p class="label">La rete</p>
        <h2 class="h2">Mille chilometri per ritrovarci</h2>
        <p class="big">Le associazioni si trovano in 9 province e nella Città Autonoma di Buenos Aires, da Tucumán a Bariloche. Il CAVA ha sede a Buenos Aires: per ritrovarsi, ognuno parte da qui.</p>
      </div>
      <div class="rete">
        <div>
          <div class="routes-top">
            <p class="routes-hint">Le distanze da Buenos Aires, a confronto con un viaggio simile in Italia</p>
            <p class="cmp-legend"><span class="ar">In Argentina</span><span class="it">In Italia</span></p>
          </div>
          <ol class="routes">
${FEATURED.map((id) => CITY[id]).map((c) => `            <li class="route">
              <span class="route-top"><span class="route-city">${c.n}</span><span class="route-time">${c.t} di pullman</span></span>
              <span class="cmp">
                <span class="cmp-row ar" style="--v:${num(c.km)}"><span class="cmp-label">Buenos Aires → ${c.n}</span><span class="cmp-track"><i></i></span><b>${c.km} km</b></span>
                <span class="cmp-row it" style="--v:${num(c.it[1])}"><span class="cmp-label">Venezia → ${c.it[0]}</span><span class="cmp-track"><i></i></span><b>${c.it[1]} km</b></span>
              </span>
            </li>`).join('\n')}
          </ol>
          <div class="localita">
            <h3>Tutte le sedi</h3>
            <dl>
${LOCALITA.map(([prov, cs]) => `              <div><dt>${prov}</dt><dd>${cs.map((c) => c.n).join(', ')}</dd></div>`).join('\n')}
            </dl>
          </div>
        </div>
        <div class="map-col">
          <figure class="map">
          ${mapSvg}
          ${mapLabels}
          <span class="map-hq" style="${pct([342, 386])}">Buenos Aires<b>sede del CAVA</b></span>
          </figure>
          <p class="map-legend"><span class="lg-hq">Buenos Aires, sede del CAVA</span><span class="lg-dot">Località con associazioni</span><span class="lg-prov">Province con associazioni</span></p>
        </div>
      </div>
    </div>
  </section>

  <section class="page back">${dots}
    <div class="back-content">
      <img class="back-logo" src="${D}assets/img/logo-cava.png" alt="CAVA">
      <h2>Un ponte tra il Veneto <span>e l'Argentina.</span></h2>
      <div class="back-contact">
        <p>Per sostenere le proposte o collaborare con il CAVA, scriveteci.</p>
        <a class="mail" href="${MAIL}"><span class="mail-text"><small>Scrivici</small>federazionecava@gmail.com</span><span class="mail-arrow">→</span></a>
      </div>
      <a class="qr" href="${SITE}/">
        <div class="qr-code">${qr}</div>
        <div class="qr-text">
          <h3>Le proposte online</h3>
          <p>Inquadra il codice con il telefono per aprire il sito, con una pagina per ogni proposta e la mappa della rete.</p>
          <span class="qr-url">${SITE.replace(/^https?:\/\//, '')} <span>→</span></span>
        </div>
      </a>
      <div class="back-bottom"><span>© 2026 CAVA · Comitato delle Associazioni Venete dell'Argentina</span><span>federazionecava@gmail.com</span></div>
    </div>
  </section>
</body>
</html>
`;

const docDir = join(OUT, 'recursos', 'documento');
mkdirSync(docDir, { recursive: true });
const docHtml = join(docDir, 'documento.html');
writeFileSync(docHtml, doc);

// Imprime con el primer Chrome / Edge que encuentre (o el de la variable CHROME)
const BROWSERS = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = BROWSERS.find((b) => existsSync(b));
const pdfDir = join(OUT, 'documento');
mkdirSync(pdfDir, { recursive: true });
if (browser) {
  execFileSync(browser, [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf-no-header',
    `--user-data-dir=${join(tmpdir(), 'cava-pdf')}`, '--virtual-time-budget=5000',
    `--print-to-pdf=${resolve(pdfDir, PDF_FILE)}`, pathToFileURL(resolve(docHtml)).href,
  ], { stdio: 'ignore' });
  console.log('ok documento/' + PDF_FILE);
} else {
  console.log(`No encontré Chrome ni Edge: abrí ${docHtml}, Imprimir > Guardar como PDF (sin márgenes ni encabezados) y guardalo como documento/${PDF_FILE}`);
}
