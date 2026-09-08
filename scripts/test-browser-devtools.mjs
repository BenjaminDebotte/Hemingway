import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3334;
const CDP_PORT = 9223;
const SITE_DIR = path.resolve('site');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// 1. Démarrer le serveur HTTP local
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(SITE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

await new Promise((resolve) => server.listen(PORT, resolve));
console.log(`[TEST-DEVTOOLS] Serveur HTTP actif sur http://localhost:${PORT}`);

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (e) {}
  }
  return null;
}

const chromePath = findChrome();
if (!chromePath) {
  console.warn('[TEST-DEVTOOLS] Aucun binaire Chrome/Edge détecté. Test ignoré.');
  server.close();
  process.exit(0);
}

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check'
]);

// Attendre que le port de debug soit prêt
let wsUrl = null;
for (let i = 0; i < 20; i++) {
  await new Promise(r => setTimeout(r, 200));
  try {
    const res = await fetch(`http://localhost:${CDP_PORT}/json/version`);
    const data = await res.json();
    if (data.webSocketDebuggerUrl) {
      wsUrl = data.webSocketDebuggerUrl;
      break;
    }
  } catch (e) {}
}

if (!wsUrl) {
  console.error('[TEST-DEVTOOLS] Échec de connexion CDP Chrome');
  chrome.kill();
  server.close();
  process.exit(1);
}

// Créer une nouvelle page
const newPageRes = await fetch(`http://localhost:${CDP_PORT}/json/new?http://localhost:${PORT}/index.html`, { method: 'PUT' });
const pageData = await newPageRes.json();
const pageWsUrl = pageData.webSocketDebuggerUrl;

// 3. Client CDP minimal via WebSocket
class CdpClient {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.callbacks = new Map();
    this.events = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        } else if (data.method) {
          this.events.push(data);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression: `(() => { return (${expression}); })()`,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.text} (${expression})`);
    }
    return res.result?.value;
  }
}

const cdp = new CdpClient(pageWsUrl);
await cdp.connect();
console.log('[TEST-DEVTOOLS] Connecté au protocole CDP de la page.');

// Activer les domaines CDP
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('DOM.enable');

// Attendre que la page et les données soient complètement chargées
for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 200));
  try {
    const count = await cdp.evaluate('window.SPECIES_DATA ? window.SPECIES_DATA.length : 0');
    const cards = await cdp.evaluate('document.querySelectorAll(".duo-card-shell").length');
    if (count === 32 && cards === 32) {
      break;
    }
  } catch (e) {}
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
  }
}

console.log('\n--- AXE 1 : VÉRIFICATION RUNTIME & CONSOLE JS ---');
const consoleErrors = cdp.events.filter(e => e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error');
const exceptions = cdp.events.filter(e => e.method === 'Runtime.exceptionThrown');
assert(consoleErrors.length === 0, `0 erreur console détectée (trouvées: ${consoleErrors.length})`);
assert(exceptions.length === 0, `0 exception non rattrapée (trouvées: ${exceptions.length})`);

console.log('\n--- AXE 2 : CHARGEMENT DU DOM & DONNÉES HALIEUTIQUES ---');
const speciesCount = await cdp.evaluate('window.SPECIES_DATA ? window.SPECIES_DATA.length : 0');
assert(speciesCount === 32, `Les 32 espèces sont chargées dans window.SPECIES_DATA (${speciesCount})`);

const renderedCards = await cdp.evaluate('document.querySelectorAll(".duo-card-shell").length');
assert(renderedCards === 32, `32 cartes duo sont rendues dans le DOM (${renderedCards})`);

const statsText = await cdp.evaluate('document.getElementById("view-stats").textContent');
assert(statsText.includes('32 espèces'), `Le compteur de statistiques affiche "32 espèces" (${statsText})`);

console.log('\n--- AXE 3 : ACCESSIBILITÉ ARIA DU SÉLECTEUR DE THÈMES ---');
const triggerHasPopup = await cdp.evaluate('document.getElementById("btn-theme-trigger").getAttribute("aria-haspopup")');
assert(triggerHasPopup === 'dialog', `btn-theme-trigger a aria-haspopup="dialog" (${triggerHasPopup})`);

const triggerExpandedInit = await cdp.evaluate('document.getElementById("btn-theme-trigger").getAttribute("aria-expanded")');
assert(triggerExpandedInit === 'false', `btn-theme-trigger a aria-expanded="false" initialement`);

const popoverHiddenInit = await cdp.evaluate('document.getElementById("theme-popover").hasAttribute("hidden")');
assert(popoverHiddenInit === true, `theme-popover est masqué par défaut`);

const initialTheme = await cdp.evaluate('document.documentElement.getAttribute("data-theme")');
assert(initialTheme === 'staal', `Thème par défaut initial appliqué au chargement: '${initialTheme}' (attendu: 'staal')`);

const initialLabel = await cdp.evaluate('document.getElementById("theme-trigger-label").textContent.trim()');
assert(initialLabel === 'Acier', `Label initial du déclencheur: '${initialLabel}' (attendu: 'Acier')`);

// Clic sur le déclencheur
await cdp.evaluate('document.getElementById("btn-theme-trigger").click()');
const triggerExpandedAfter = await cdp.evaluate('document.getElementById("btn-theme-trigger").getAttribute("aria-expanded")');
const popoverHiddenAfter = await cdp.evaluate('document.getElementById("theme-popover").hasAttribute("hidden")');
assert(triggerExpandedAfter === 'true' && popoverHiddenAfter === false, 'Le popover s\'ouvre au clic (aria-expanded="true" et sans hidden)');

// Fermeture par touche Escape
await cdp.evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))');
const popoverHiddenAfterEsc = await cdp.evaluate('document.getElementById("theme-popover").hasAttribute("hidden")');
assert(popoverHiddenAfterEsc === true, 'Le popover se referme avec la touche Échap');

console.log('\n--- AXE 4 : MATRICE MULTI-THÈMES (11 NUANCES GRAPHISTES × JOUR/NUIT) ---');
const themes = ['archief', 'estran', 'epaves', 'dune', 'carbon', 'shom', 'beton', 'krant', 'kraft', 'asfalt', 'staal'];
for (const th of themes) {
  await cdp.evaluate(`
    (() => {
      document.querySelector('.theme-opt-btn[data-theme-val="${th}"]').click();
      document.querySelector('.mode-switch-btn[data-mode-val="light"]').click();
      return true;
    })()
  `);
  await new Promise(r => setTimeout(r, 50));
  const htmlTheme = await cdp.evaluate('document.documentElement.getAttribute("data-theme")');
  const htmlMode = await cdp.evaluate('document.documentElement.getAttribute("data-mode")');
  const bg = await cdp.evaluate('getComputedStyle(document.body).backgroundColor');
  assert(htmlTheme === th && htmlMode === 'light', `Thème '${th}' (Jour) appliqué, body background: ${bg}`);

  // Test mode Nuit
  await cdp.evaluate(`
    (() => {
      document.querySelector('.mode-switch-btn[data-mode-val="dark"]').click();
      return true;
    })()
  `);
  await new Promise(r => setTimeout(r, 50));
  const htmlModeDark = await cdp.evaluate('document.documentElement.getAttribute("data-mode")');
  const bgDark = await cdp.evaluate('getComputedStyle(document.body).backgroundColor');
  assert(htmlModeDark === 'dark', `Thème '${th}' (Nuit) appliqué, body background: ${bgDark}`);
}

console.log('\n--- AXE 5 : MODES D\'AFFICHAGE (DUO, FLIP, PRINT) ---');
// Bascule vers le mode Flip (fiches 3D)
await cdp.evaluate('document.querySelector(\'.mode-btn[data-mode="flip"]\').click()');
await new Promise(r => setTimeout(r, 100));
const flipCardsCount = await cdp.evaluate('document.querySelectorAll(".interactive-card").length');
assert(flipCardsCount === 32, `Mode Flip : 32 cartes interactives 3D affichées (${flipCardsCount})`);

// Test de retournement 3D
await cdp.evaluate('window.toggleCardFlip("bar-commun")');
const isFlipped = await cdp.evaluate('document.getElementById("card-bar-commun").classList.contains("flipped")');
assert(isFlipped === true, 'La carte du Bar commun se retourne (classe .flipped ajoutée)');

// Bascule vers le mode Planches A4 Duplex
await cdp.evaluate('document.querySelector(\'.mode-btn[data-mode="print"]\').click()');
await new Promise(r => setTimeout(r, 100));
const a4SheetsCount = await cdp.evaluate('document.querySelectorAll(".a4-sheet-preview").length');
assert(a4SheetsCount === 32, `Mode Print : 32 planches A4 (16 paires Recto/Verso pour 32 poissons) (${a4SheetsCount})`);

// Retour au mode Déplié
await cdp.evaluate('document.querySelector(\'.mode-btn[data-mode="duo"]\').click()');

console.log('\n--- AXE 6 : FILTRES & RECHERCHE HALIEUTIQUE ---');
// Filtre biotope Canal
await cdp.evaluate(`
  (() => {
    const sel = document.getElementById("biotope-select");
    sel.value = "canal";
    sel.dispatchEvent(new Event("change"));
  })()
`);
await new Promise(r => setTimeout(r, 100));
const canalCount = await cdp.evaluate('document.querySelectorAll(".duo-card-shell").length');
assert(canalCount === 29, `Filtre Canal de Caen : 29 espèces présentes (${canalCount})`);

// Filtre biotope Bateau
await cdp.evaluate(`
  (() => {
    const sel = document.getElementById("biotope-select");
    sel.value = "bateau";
    sel.dispatchEvent(new Event("change"));
  })()
`);
await new Promise(r => setTimeout(r, 100));
const bateauCount = await cdp.evaluate('document.querySelectorAll(".duo-card-shell").length');
assert(bateauCount === 21, `Filtre Côte de Nacre en bateau : 21 espèces présentes (${bateauCount})`);

// Réinitialisation biotope et test recherche texte
await cdp.evaluate(`
  (() => {
    const sel = document.getElementById("biotope-select");
    sel.value = "all";
    sel.dispatchEvent(new Event("change"));
    const input = document.getElementById("search-input");
    input.value = "sandre";
    input.dispatchEvent(new Event("input"));
  })()
`);
await new Promise(r => setTimeout(r, 100));
const searchCount = await cdp.evaluate('document.querySelectorAll(".duo-card-shell").length');
const firstFishTitle = await cdp.evaluate('document.querySelector(".species-title")?.textContent');
assert(searchCount === 1 && firstFishTitle === 'Sandre', `Recherche "sandre" : exactement 1 résultat (${firstFishTitle})`);

// Réinitialisation recherche
await cdp.evaluate(`
  (() => {
    const input = document.getElementById("search-input");
    input.value = "";
    input.dispatchEvent(new Event("input"));
  })()
`);

console.log('\n--- AXE 7 : RESPONSIVE & LAYOUT SANS DÉBORDEMENT ---');
const viewports = [
  { name: 'Mobile (iPhone/Pixel)', width: 375, height: 667 },
  { name: 'Tablet (iPad)', width: 768, height: 1024 },
  { name: 'Desktop (Full HD)', width: 1440, height: 900 }
];

for (const vp of viewports) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 1,
    mobile: vp.width < 768
  });
  await new Promise(r => setTimeout(r, 100));
  const hasHorizontalScroll = await cdp.evaluate('document.documentElement.scrollWidth > window.innerWidth');
  assert(!hasHorizontalScroll, `${vp.name} (${vp.width}x${vp.height}) : Zéro débordement horizontal`);
}

console.log('\n--- AXE 8 : ÉMULATION IMPRESSION (@media print) ---');
await cdp.send('Emulation.setEmulatedMedia', { media: 'print' });
await new Promise(r => setTimeout(r, 100));
const cardFaceBgInPrint = await cdp.evaluate(`
  (() => {
    const el = document.querySelector(".card-face");
    return getComputedStyle(el).backgroundColor;
  })()
`);
assert(
  cardFaceBgInPrint === 'rgb(255, 255, 255)' || cardFaceBgInPrint === '#ffffff',
  `Fond de carte en mode print forcé à blanc papier (${cardFaceBgInPrint})`
);

console.log('\n--- AXE 9 : TYPOGRAPHIE & BASE FONT (BASIS GROTESQUE PRO MEDIUM) ---');
await cdp.send('Emulation.setEmulatedMedia', { media: '' });
await new Promise(r => setTimeout(r, 100));
const bodyFontFamily = await cdp.evaluate('getComputedStyle(document.body).fontFamily');
assert(
  bodyFontFamily.includes('Basis Grotesque Pro Medium'),
  `Font-family du body inclut "Basis Grotesque Pro Medium" (${bodyFontFamily})`
);
const bodyFontWeight = await cdp.evaluate('getComputedStyle(document.body).fontWeight');
assert(
  bodyFontWeight === '500',
  `Font-weight du body calibré sur Medium (500) (${bodyFontWeight})`
);
const fontFacesLoaded = await cdp.evaluate(`
  document.fonts.check('500 16px "Basis Grotesque Pro Medium"')
`);
assert(
  fontFacesLoaded === true,
  'Police "Basis Grotesque Pro Medium" chargée et validée dans document.fonts'
);

console.log('\n--- AXE 10 : VÉRIFICATION DU MODE PLANCHES A4 (11 THÈMES × JOUR / NUIT) ---');
await cdp.evaluate('document.querySelector(\'.mode-btn[data-mode="print"]\').click()');
await new Promise(r => setTimeout(r, 120));

for (const th of themes) {
  // Test Mode Jour
  await cdp.evaluate(`
    (() => {
      document.querySelector('.theme-opt-btn[data-theme-val="${th}"]').click();
      document.querySelector('.mode-switch-btn[data-mode-val="light"]').click();
      return true;
    })()
  `);
  await new Promise(r => setTimeout(r, 60));

  const lightStyles = await cdp.evaluate(`
    (() => {
      const card = document.querySelector('.a4-sheet-preview .card-face');
      const title = document.querySelector('.a4-sheet-preview .species-title');
      const sheet = document.querySelector('.a4-sheet-preview');
      return {
        cardBg: getComputedStyle(card).backgroundColor,
        textColor: getComputedStyle(card).color,
        titleColor: getComputedStyle(title).color,
        sheetBg: getComputedStyle(sheet).backgroundColor
      };
    })()
  `);

  const isLightValid = await cdp.evaluate(`
    (() => {
      const parseRgb = str => (str.match(/\\d+/g) || []).map(Number);
      const lum = rgb => (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
      const cardLum = lum(parseRgb('${lightStyles.cardBg}'));
      const textLum = lum(parseRgb('${lightStyles.textColor}'));
      return cardLum > 0.6 && textLum < 0.4 && cardLum > textLum;
    })()
  `);
  assert(isLightValid, `Mode A4 / '${th}' (Jour) : Lisibilité et contraste validés (carte: ${lightStyles.cardBg}, texte: ${lightStyles.textColor})`);

  // Test Mode Nuit
  await cdp.evaluate(`
    (() => {
      document.querySelector('.mode-switch-btn[data-mode-val="dark"]').click();
      return true;
    })()
  `);
  await new Promise(r => setTimeout(r, 60));

  const darkStyles = await cdp.evaluate(`
    (() => {
      const card = document.querySelector('.a4-sheet-preview .card-face');
      const title = document.querySelector('.a4-sheet-preview .species-title');
      const sheet = document.querySelector('.a4-sheet-preview');
      return {
        cardBg: getComputedStyle(card).backgroundColor,
        textColor: getComputedStyle(card).color,
        titleColor: getComputedStyle(title).color,
        sheetBg: getComputedStyle(sheet).backgroundColor
      };
    })()
  `);

  const isDarkValid = await cdp.evaluate(`
    (() => {
      const parseRgb = str => (str.match(/\\d+/g) || []).map(Number);
      const lum = rgb => (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
      const cardLum = lum(parseRgb('${darkStyles.cardBg}'));
      const textLum = lum(parseRgb('${darkStyles.textColor}'));
      return cardLum < 0.35 && textLum > 0.65 && textLum > cardLum;
    })()
  `);
  assert(isDarkValid, `Mode A4 / '${th}' (Nuit) : Lisibilité nocturne validée (carte: ${darkStyles.cardBg}, texte: ${darkStyles.textColor})`);
}

console.log('\n--- AXE 11 : OCCUPATION OPTIMALE DE L\'ESPACE DISPONIBLE EN MODE A4 ---');
const spaceOccupancy = await cdp.evaluate(`
  (() => {
    // 1. Analyse Face A (Recto)
    const rectoCard = document.querySelector('.print-sheet-recto .card-face');
    const rectoWidth = rectoCard.offsetWidth;
    const rectoHeight = rectoCard.offsetHeight;
    const notesBox = rectoCard.querySelector('.notes-box');
    const notesBoxH = notesBox ? notesBox.offsetHeight : 0;
    const notesLines = notesBox ? Array.from(notesBox.querySelectorAll('.notes-line')).map(l => l.offsetHeight) : [];

    // Vérifier largeur des éléments Recto
    const recognitionBox = rectoCard.querySelector('.recognition-box');
    const regsBlock = rectoCard.querySelector('.regs-block');
    const bioSection = rectoCard.querySelector('.biology-section');
    const calBlock = rectoCard.querySelector('.calendar-block');

    const rectoFullWidth = [recognitionBox, regsBlock, bioSection, calBlock, notesBox].every(el => {
      return el ? el.offsetWidth >= rectoWidth * 0.9 : false;
    });

    // 2. Analyse Face B Dual-Biotope (Bar commun dans la première feuille Verso)
    const versoSheets = Array.from(document.querySelectorAll('.print-sheet-verso'));
    const dualCard = versoSheets[0]?.querySelectorAll('.card-face')[1]; // Bar commun est à droite sur verso
    const dualCanalSec = dualCard?.querySelector('.section-canal');
    const dualBateauSec = dualCard?.querySelector('.section-bateau');

    // 3. Analyse Face B Mono-Biotope (Brochet ou Sandre)
    const allVersoCards = Array.from(document.querySelectorAll('.print-sheet-verso .card-face'));
    const monoCard = allVersoCards.find(c => {
      const t = c.querySelector('.verso-title')?.textContent || '';
      return t.includes('Brochet') || t.includes('Sandre') || t.includes('Silure');
    });
    const monoSection = monoCard?.querySelector('.verso-header + .biotope-section:last-child') || monoCard?.querySelector('.biotope-section');

    return {
      rectoWidth,
      rectoHeight,
      rectoScrollHeight: rectoCard.scrollHeight,
      rectoFullWidth,
      notesBoxH,
      notesLines,
      dualCanalH: dualCanalSec ? dualCanalSec.offsetHeight : 0,
      dualBateauH: dualBateauSec ? dualBateauSec.offsetHeight : 0,
      monoSectionH: monoSection ? monoSection.offsetHeight : 0,
      monoCardH: monoCard ? monoCard.offsetHeight : 0
    };
  })()
`);

assert(spaceOccupancy.rectoFullWidth, `Face A (Recto) : Tous les blocs occupent la pleine largeur utile (largeur: ${spaceOccupancy.rectoWidth}px)`);
assert(spaceOccupancy.notesBoxH >= 60, `Face A (Recto) : Le bloc de notes manuscrites s'étire pour combler l'espace bas (${spaceOccupancy.notesBoxH}px)`);
assert(spaceOccupancy.notesLines.every(h => h >= 14), `Face A (Recto) : Les 3 lignes de notes manuscrites prennent toute la hauteur (${spaceOccupancy.notesLines.join(', ')}px)`);
assert(spaceOccupancy.rectoScrollHeight <= spaceOccupancy.rectoHeight + 2, `Face A (Recto) : Zéro débordement vertical (scrollH: ${spaceOccupancy.rectoScrollHeight}px <= h: ${spaceOccupancy.rectoHeight}px)`);

assert(spaceOccupancy.dualCanalH >= 250 && spaceOccupancy.dualBateauH >= 250, `Face B Dual : Les volets Canal (${spaceOccupancy.dualCanalH}px) et Mer (${spaceOccupancy.dualBateauH}px) occupent tout l'espace disponible équitablement`);
assert(spaceOccupancy.monoSectionH >= 550, `Face B Mono : L'unique volet biotope s'étire en plein format (${spaceOccupancy.monoSectionH}px sur ${spaceOccupancy.monoCardH}px)`);

// Rétablir le mode Déplié
await cdp.evaluate('document.querySelector(\'.mode-btn[data-mode="duo"]\').click()');

console.log(`\n============================================================`);
console.log(`BILAN DEVTOOLS : ${passedTests}/${totalTests} tests réussis`);
console.log(`============================================================\n`);

// Nettoyage
chrome.kill();
server.close();
process.exit(passedTests === totalTests ? 0 : 1);
