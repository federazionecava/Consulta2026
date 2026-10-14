// Generador de las páginas (index.html y proposte/*.html).
// Uso, desde la raíz del proyecto:  node recursos/generador/build.mjs .
// OJO: reescribe los .html. Si cambiaste algo a mano en los .html, pasalo también acá antes de correrlo.
// Los SVG del mapa salen de recursos/generador/maps (extraídos de la presentación "Mille chilometri").
import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = process.argv[2];
const MAPS = join(dirname(fileURLToPath(import.meta.url)), 'maps');

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
    sintesi: "Proporre una visita istituzionale delle Autorità regionali in Argentina per incontrare le comunità venete, le associazioni e le istituzioni locali, rafforzando i rapporti tra Veneto e Argentina." },
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
    ] },
  { slug: 'scambio-giovanile', area: 'giovani', emoji: '🎒',
    titolo: 'Ripresa dei programmi di scambio giovanile',
    sintesi: 'Sollecitare la riattivazione dei programmi di mobilità destinati ai giovani discendenti veneti, favorendo soggiorni culturali, linguistici e formativi in Veneto.' },
  { slug: 'formazione-e-stage', area: 'giovani', emoji: '🎓',
    titolo: 'Corsi di perfezionamento, formazione e stage',
    sintesi: "Promuovere percorsi di alta formazione, tirocini e stage presso enti, università, aziende e istituzioni venete, con l'obiettivo di creare opportunità concrete per le nuove generazioni." },
  { slug: 'risorse-e-finanziamenti', area: 'giovani', emoji: '💶',
    titolo: 'Ricerca di risorse e finanziamenti',
    sintesi: "Qualora non siano disponibili fondi regionali dedicati, chiedere alla Regione del Veneto di supportare le associazioni nell'individuazione di bandi, finanziamenti europei e internazionali, fondazioni, università e partner privati interessati a sostenere tali iniziative." },
  { slug: 'scuole-agrarie-e-universita', area: 'agricoltura', emoji: '🌾',
    titolo: 'Scambi tra scuole agrarie e università',
    sintesi: "Promuovere accordi di collaborazione tra istituti agrari, università e centri di ricerca del Veneto e dell'Argentina per realizzare programmi di mobilità, formazione e scambio di competenze." },
  { slug: 'droni-in-agricoltura', area: 'agricoltura', emoji: '🚁',
    titolo: "Formazione sull'utilizzo dei droni in agricoltura",
    sintesi: "Sviluppare corsi, laboratori e attività pratiche sull'impiego dei droni e delle tecnologie di agricoltura di precisione, coinvolgendo studenti, docenti e aziende del settore." },
];
P.forEach((p, i) => (p.n = i + 1));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
  { id: 'buenos-aires', n: 'Buenos Aires', prov: 'Capitale Federale', xy: BA, hq: true },
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
const SITE = 'https://tu-dominio.com';

// m = { path, ogTitle, image, imageAlt }
const head = (r, title, desc, m) => `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${SITE}/${m.path}">
  <meta name="theme-color" content="#0b1828">

  <!-- Vista previa al compartir (WhatsApp, Facebook, LinkedIn, X) -->
  <meta property="og:type" content="website">
  <meta property="og:locale" content="it_IT">
  <meta property="og:site_name" content="CAVA · Comitato delle Associazioni Venete dell'Argentina">
  <meta property="og:url" content="${SITE}/${m.path}">
  <meta property="og:title" content="${esc(m.ogTitle)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}/${m.image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(m.imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(m.ogTitle)}">
  <meta name="twitter:description" content="${esc(desc)}">
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
        <a href="${h}#proposte" data-spy="proposte">${home ? '' : '← '}Proposte</a>
        <a href="${h}#chi-siamo" data-spy="chi-siamo">Chi siamo</a>
      </nav>
      <a class="brand" href="${r}index.html" aria-label="CAVA · Inizio"><img class="brand-mark" src="${r}assets/img/logo-mark.png" width="166" height="120" alt=""></a>
      <div class="nav-end">
        <nav class="nav-links" aria-label="Altre sezioni">
          <a href="${h}#la-rete" data-spy="la-rete">La rete</a>
          <a href="${h}#perche" data-spy="perche">Perché</a>
        </nav>
        <a class="nav-cta" href="${MAIL}">Scrivici</a>
        <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Apri il menu"><span></span><span></span><span></span></button>
      </div>
    </div>${ctx}
  </header>

  <div class="menu" id="menu">
    <div class="menu-inner">
      <div>
        <p class="menu-label">Le sette proposte</p>
        <ol class="menu-props">
${P.map((q, i) => `          <li style="--i:${i}"><a class="menu-prop${p && q.n === p.n ? ' is-current' : ''}" data-area="${q.area}" href="${r}proposte/${q.slug}.html"><b>${pad(q.n)}</b><span>${esc(q.titolo)}</span></a></li>`).join('\n')}
        </ol>
      </div>
      <div class="menu-sec">
        <p class="menu-label">Il CAVA</p>
        <ul>
          <li style="--i:2"><a href="${r}index.html">Inizio</a></li>
          <li style="--i:3"><a href="${r}index.html#chi-siamo">Chi siamo</a></li>
          <li style="--i:4"><a href="${r}index.html#la-rete">La rete</a></li>
          <li style="--i:5"><a href="${r}index.html#perche">Perché vale la pena</a></li>
        </ul>
        <a class="menu-mail" style="--i:6" href="${MAIL}"><small>Scrivici</small>federazionecava@gmail.com</a>
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
        <h2 data-reveal>Un ponte tra il Veneto <span>e l'Argentina.</span></h2>
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
                <span class="p-arrow" aria-hidden="true">→</span>
              </div>
            </article>
          </li>`;

// ---------------- Landing ----------------
const index = `${head('', 'CAVA · Sette proposte per la Consulta dei Veneti nel Mondo', "11.400 km tra il Veneto e l'Argentina, una sola comunità. Le proposte del CAVA su istituzioni, giovani e agricoltura.", { path: '', ogTitle: 'Da Venezia a Buenos Aires: sette proposte per la Consulta dei Veneti nel Mondo', image: 'assets/img/og.jpg', imageAlt: 'Venezia e Buenos Aires, unite da 11.400 km: le proposte del CAVA per la Consulta dei Veneti nel Mondo' })}
<body>${nav('', true)}

  <main id="main">
  <section class="hero">${bg('', 'cava', 'video/landing.mp4')}
    <div class="hero-content">
      <img class="hero-logo fade-in" style="--d:0s" src="assets/img/logo-cava.png" width="720" height="513" alt="CAVA · Comitato delle Associazioni Venete dell'Argentina" fetchpriority="high">
      <h1 class="fade-in" style="--d:.15s">Proposte per la Consulta dei Veneti nel&nbsp;Mondo</h1>
      <p class="lead fade-in" style="--d:.35s">Sette proposte per rafforzare i rapporti tra Veneto e Argentina.</p>
    </div>
    <a class="hero-down fade-in" style="--d:.6s" href="#proposte">Le proposte <span aria-hidden="true">↓</span></a>
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
    </section>

    <section class="section container" id="chi-siamo">
      <div class="about">
        <div class="about-head" data-reveal>
          <img class="about-logo" src="assets/img/logo-cava.png" width="720" height="513" alt="" loading="lazy" decoding="async">
          <h2>Una federazione di associazioni venete</h2>
        </div>
        <div class="about-body" data-reveal style="--i:1">
          <p class="big">Il CAVA coordina le attività delle associazioni e rappresenta la comunità veneto-argentina davanti alla Regione Veneto e alle autorità consolari italiane e argentine.</p>
          <p>Senza fini di lucro, iscritto all'Albo della Regione Veneto.</p>
          <dl class="facts">
            <div><dt>1998</dt><dd>fondato a Buenos Aires il 25 luglio</dd></div>
            <div><dt>18</dt><dd>località, in 9 province e nella Capitale Federale</dd></div>
            <div><dt>20+</dt><dd>associazioni federate</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section class="section container" id="la-rete">
      <div class="rete">
        <div class="rete-text">
          <div class="rete-head" data-reveal>
            <h2>Mille chilometri per ritrovarci</h2>
            <p class="big">Le associazioni si trovano in 9 province e nella Capitale Federale, da Tucumán a Bariloche. Il CAVA ha sede a Buenos Aires: per ritrovarsi, ognuno parte da qui.</p>
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
            <p class="routes-hint">Tocca una località per vedere il viaggio da Buenos Aires</p>
            <dl>
${LOCALITA.map(([prov, cs]) => `              <div><dt>${prov}</dt><dd>${cs.map((c) => `<button class="sede" type="button" data-city="${c.id}">${c.n}</button>`).join('')}</dd></div>`).join('\n')}
            </dl>
            <p class="note">Km su strada e ore di pullman indicative.</p>
          </div>
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

  <section class="band" id="perche">${bg('', 'veneto', 'video/associazioni.mp4')}
    <div class="container">
      <div class="sec-head on-dark" data-reveal>
        <h2>Ruolo strategico delle associazioni</h2>
        <p>Le associazioni di emigrati veneti all'estero si presentano come ambasciatori autentici della Regione Veneto, in grado di rappresentarne valori, tradizioni e capacità innovativa. Sono ponti operativi che collegano il Veneto con i Paesi ospitanti.</p>
      </div>
      <ol class="roles">
${[
  ['Istituzioni', 'Aprire le porte istituzionali verso autorità e organismi locali e nazionali.'],
  ['Economia', 'Favorire rapporti economici e professionali e canali di cooperazione culturale, economica e accademica, con opportunità per imprese e investitori.'],
  ['Cultura e turismo', 'Promuovere scambi culturali e turistici, incentivando visite e percorsi identitari, anche per chi voglia intraprendere attività in Argentina.'],
  ['Giovani', 'Sostenere iniziative formative e programmi di mobilità per giovani e professionisti, rafforzando il legame identitario e il capitale umano.'],
].map(([t, d], i) => `        <li class="role" data-reveal style="--i:${i}"><span class="role-n">${['I', 'II', 'III', 'IV'][i]}</span><h3>${t}</h3><p>${d}</p></li>`).join('\n')}
      </ol>
      <blockquote class="quote" data-reveal>
        <p>Le associazioni non sono semplici custodi della tradizione, ma <em>attori strategici di diplomazia culturale ed economica</em>, capaci di aprire le porte dell'Argentina e di generare nuove opportunità di interscambio.</p>
      </blockquote>
    </div>
  </section>
  </main>
${footer('')}`;

writeFileSync(join(OUT, 'index.html'), index);

// ---------------- Páginas de propuesta ----------------
for (const p of P) {
  const r = '../';
  const [ruoloT, ruoloD] = RUOLO[p.area];
  const prev = P[p.n - 2];
  const next = P[p.n];
  const ragioni = p.ragioni ? `
      <section class="block">
        <div class="sec-head center" data-reveal>
          <h2>Perché puntare sull'Argentina</h2>
        </div>
        <ul class="reasons">
${p.ragioni.map(([e, t, d], i) => `          <li class="reason" data-reveal style="--i:${i}"><span class="reason-emoji" aria-hidden="true">${e}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('\n')}
        </ul>
      </section>` : '';

  const html = `${head(r, `Proposta ${p.n} · ${p.corto ? p.corto.titolo : p.titolo} · CAVA`, p.sintesi, { path: `proposte/${p.slug}.html`, ogTitle: `Proposta ${p.n} di 7 — ${p.corto ? p.corto.titolo : p.titolo}`, image: `assets/img/og/${p.slug}.jpg`, imageAlt: `Proposta ${p.n} di 7 del CAVA: ${p.titolo}` })}
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
      </section>` : ''}${ragioni}

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
