// ============================================================
// SILNIK LOTU (eksperyment „ZUI Space Scroll")
//
// JEDNA scena 3D na całą stronę — dokładnie ta sama kompozycja,
// co w produkcyjnym hero (components/Scena3D.tsx):
//
//   • fioletowy GAZOWY OLBRZYM z pierścieniami i DWOMA księżycami,
//   • RÓŻOWA planeta (prawa górna część kadru),
//   • TURKUSOWA mini-planeta z księżycem (prawa krawędź),
//   • SŁOŃCE w oddali: prawie biała kula + żółte halo.
//
// Te same tekstury, te same materiały, to samo światło — kanwa
// jest tylko rozciągnięta na CAŁY ekran i przypięta pod stroną,
// a kadr hero jest tak dobrany, żeby układ wyglądał jak na
// produkcji (tekst po lewej, planety po prawej).
//
// ŻADNYCH nowych ciał niebieskich — scroll po prostu WOZI KAMERĘ
// po tej jednej scenie. Każda sekcja ma swój przystanek:
//
//   0. HERO       — szeroki plan całego układu (jak na produkcji)
//   1. USŁUGI     — duży KSIĘŻYC olbrzyma (lądowanie tuż nad
//                   pierścieniami, olbrzym wypełnia tło)
//   2. PORTFOLIO  — sam OLBRZYM (fioletowe pasy chmur w kadrze)
//   3. PROCES     — TURKUSOWA planeta
//   4. OPINIE     — RÓŻOWA planeta
//   5. KONTAKT    — SŁOŃCE (finał podróży)
//
// EFEKT „PREZI" — przejścia to nie prosty lot, tylko:
//   zoom out po ŁUKU (krzywa Béziera) → przesunięcie (pan) →
//   PRZECHYŁ kadru (roll, inny dla każdego odcinka: +8°, −6°,
//   +12°, −8°, +10°) → zoom in do następnego ciała.
//   FOV dodatkowo „oddycha" (szerzej w środku lotu), a easing
//   jest filmowy (odpowiednik power2.inOut).
//
// KADROWANIE — każdy przystanek ma pole `kadr`, czyli miejsce
// na EKRANIE, w którym ma wylądować planeta (np. „na dole po
// prawej"). Dzięki temu teksty i karty sekcji NIE leżą na
// najładniejszym fragmencie planety — mają swój własny, ciemny
// kawałek kadru. To odpowiednik ustawienia modela w studiu:
// najpierw wiemy, gdzie stanie, potem stawiamy światło i tekst.
//
// Ten plik NIE dotyka Reacta — czysty Three.js. Komponent
// LotSekcja.tsx importuje go dynamicznie (tylko desktop).
// ============================================================

import * as THREE from "three";
/* Scenariusz zdjęciowy — gdzie stoją planety i gdzie staje kamera.
   Wszystkie liczby kompozycji siedzą w components/lot/kadry.ts,
   żeby dało się je policzyć w Node, zamiast zgadywać na oko. */
import {
  STOPIEN,
  SRODEK_OLBRZYMA,
  POZ_ROZOWEJ,
  POZ_TURKUSOWEJ,
  POZ_SLONCA,
  R_OLBRZYM,
  R_KSIEZYC,
  R_ROZOWA,
  R_TURKUSOWA,
  R_SLONCE,
  OBROT_UKLADU,
  PRZECHYL,
  R_ORBITY,
  R_ORBITY2,
  LUKI,
  PRZYSTANKI as SCENARIUSZ,
  dystansPrzystanku,
} from "./kadry";

/* ============ TEKSTURY — 1:1 z produkcyjnej sceny hero ============ */

/* Planeta główna: gazowy olbrzym (pasy kolorów + smugi „chmur"
   + turkusowe burze). Rozdzielczość podniesiona 2× względem hero,
   bo w trybie lotu kamera podchodzi do planety bardzo blisko. */
function namalujPlanete(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 1024;
  const ctx = c.getContext("2d")!;

  // pionowy gradient pasów (od bieguna do bieguna) — kolory z produkcji
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0.0, "#2a1e63");
  grad.addColorStop(0.18, "#5b47d6");
  grad.addColorStop(0.34, "#8b7cf7");
  grad.addColorStop(0.46, "#d17ce8");
  grad.addColorStop(0.58, "#f0a6d8");
  grad.addColorStop(0.7, "#6d5dfc");
  grad.addColorStop(0.85, "#3b2f8f");
  grad.addColorStop(1.0, "#221a52");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Faliste, półprzezroczyste smugi chmur.
  // WAŻNE: fala musi być OKRESOWA na szerokości płótna, żeby lewa
  // i prawa krawędź tekstury się zgadzały — inaczej na kuli widać
  // pionowy „szew". Dlatego liczymy pełne cykle (2*PI*k*x/szer).
  const smuga = (ile: number, wysMin: number, wysZakres: number, alfa: number, rozmycie: number) => {
    for (let i = 0; i < ile; i++) {
      const y = Math.random() * 1024;
      const wys = wysMin + Math.random() * wysZakres;
      const cykle = 2 + (i % 2); // zawsze się domyka na obwodzie
      const faza = i * 2.1;
      const fala = (x: number) => Math.sin((x / 2048) * Math.PI * 2 * cykle + faza) * 14;
      ctx.save();
      ctx.filter = `blur(${rozmycie}px)`;
      ctx.fillStyle = `rgba(255,255,255,${(0.03 + Math.random() * alfa).toFixed(3)})`;
      ctx.beginPath();
      for (let x = 0; x <= 2048; x += 16) {
        x === 0 ? ctx.moveTo(x, y + fala(x)) : ctx.lineTo(x, y + fala(x));
      }
      for (let x = 2048; x >= 0; x -= 16) ctx.lineTo(x, y + wys + fala(x));
      ctx.fill();
      ctx.restore();
    }
  };
  smuga(26, 6, 28, 0.07, 3); // pasy jak na produkcji
  smuga(22, 2, 8, 0.05, 1.2); // dodatkowy drobny detal (widoczny z bliska)

  // Turkusowe „burze" — każdą rysujemy też w kopii przesuniętej
  // o ±szerokość, żeby te przy krawędzi płynnie owijały się przez szew.
  for (let i = 0; i < 12; i++) {
    const cx = Math.random() * 2048;
    const cy = 240 + Math.random() * 560;
    const rx = 52 + Math.random() * 120;
    const ry = 14 + Math.random() * 24;
    ctx.save();
    ctx.filter = "blur(4px)";
    ctx.fillStyle = `rgba(79,209,197,${(0.05 + Math.random() * 0.1).toFixed(3)})`;
    for (const przesun of [-2048, 0, 2048]) {
      ctx.beginPath();
      ctx.ellipse(cx + przesun, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  return c;
}

/* Różowa planeta (bez lądów, miękkie pasy) — jak na produkcji. */
function namalujRozowa(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.0, "#b0407e");
  g.addColorStop(0.4, "#f06fae");
  g.addColorStop(0.62, "#ffa6cf");
  g.addColorStop(0.8, "#e86ba6");
  g.addColorStop(1.0, "#9c3a72");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);
  // miękkie jaśniejsze pasma
  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.filter = "blur(3px)";
    ctx.fillStyle = `rgba(255,224,240,${(0.1 + Math.random() * 0.14).toFixed(3)})`;
    ctx.fillRect(0, Math.random() * 512, 1024, 4 + Math.random() * 14);
    ctx.restore();
  }
  return c;
}

/* Turkusowa mini-planeta — te same kolory, co jej wersja CSS
   w components/Ozdoby3D.tsx (stonowany, nie neonowy turkus). */
function namalujTurkusowa(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.0, "#183e40");
  g.addColorStop(0.22, "#3a6d69");
  g.addColorStop(0.45, "#5f9a95");
  g.addColorStop(0.6, "#a6ccc8");
  g.addColorStop(0.78, "#4b8580");
  g.addColorStop(1.0, "#16383a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 14; i++) {
    ctx.save();
    ctx.filter = "blur(4px)";
    ctx.fillStyle = `rgba(214,238,235,${(0.05 + Math.random() * 0.1).toFixed(3)})`;
    ctx.fillRect(0, Math.random() * 512, 1024, 3 + Math.random() * 12);
    ctx.restore();
  }
  return c;
}

/* Pierścienie: przezroczyste i jaśniejsze pasma.
   UWAGA (patrz KONTEKST.md): pierścień 3D czyta z tekstury pas
   57–100% promienia → malujemy promienie 300–508 px na płótnie 1024. */
function namalujPierscienie(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext("2d")!;
  const srodek = 512;
  for (let r = 300; r < 508; r++) {
    const pasmo = Math.sin(r * 0.16) * 0.5 + Math.sin(r * 0.045) * 0.5;
    const alfa = Math.max(0, 0.16 + pasmo * 0.18);
    const kolor = r % 52 < 26 ? "201,191,255" : "209,124,232";
    ctx.strokeStyle = `rgba(${kolor},${alfa.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(srodek, srodek, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  return c;
}

/* ============================================================
   KSIĘŻYC — PRAWDZIWY RELIEF, NIE NAKLEJKA
   ============================================================
   Stara wersja malowała kratery jako gotowe obrazki: ciemne kółko
   plus jasny łuk „od strony światła". Wyglądało to jak naklejki,
   bo nimi było — światło sceny nic o tych kraterach nie wiedziało,
   więc przy obrocie księżyca cienie zostawały w miejscu.

   Teraz kolejność jest odwrócona, tak jak w prawdziwej grafice 3D:

     1. Najpierw powstaje MAPA WYSOKOŚCI — prawdziwy teren.
        Każdy krater ma pełną budowę: misę, WAŁ (podniesiona
        krawędź), warstwę WYRZUCONEGO MATERIAŁU dookoła, a te
        największe — CENTRALNY SZCZYT (skała odbita po uderzeniu).
     2. Z tej mapy liczymy DWIE tekstury naraz:
          • kolor (jasne świeże wały, ciemne „morza", promienie),
          • MAPĘ NORMALNYCH — czyli informację, w którą stronę
            „patrzy" powierzchnia w każdym punkcie.

   To ta druga robi całą robotę. Dzięki niej silnik oświetla każdy
   wał osobno, cienie same wpadają w misy, a przy obrocie księżyca
   wszystko się zmienia — bo teren naprawdę istnieje.

   Wszystko liczone kodem, zero plików graficznych.
   ============================================================ */

type PowierzchniaKsiezyca = {
  kolor: HTMLCanvasElement;
  normalna: HTMLCanvasElement;
};

/* --- POWTARZALNA LOSOWOŚĆ ---
   Zwykłe Math.random() daje za każdym razem inny księżyc. Zwykle
   to zaleta, ale tutaj byłaby katastrofą: tekstura powstaje DWA
   RAZY — najpierw szybka wersja 512 px, żeby scena ruszyła od
   razu, a potem pełna 2048 px w tle (patrz niżej). Gdyby obie
   losowały niezależnie, w trakcie oglądania księżyc zmieniłby się
   w INNY księżyc. Przy tym samym ziarnie generator zawsze rysuje
   ten sam świat, więc podmiany nie widać.
   (Algorytm: mulberry32 — cztery linijki, bardzo dobra jakość.) */
function losowanie(ziarno: number): () => number {
  let a = ziarno >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* --- szum „wartościowy" z zawijaniem w poziomie ---
   Zawijanie jest konieczne, bo tekstura owija się wokół kuli:
   lewa krawędź musi pasować do prawej, inaczej widać pionowy szew. */
function siatkaSzumu(w: number, h: number, rnd: () => number): Float32Array {
  const a = new Float32Array(w * h);
  for (let i = 0; i < a.length; i++) a[i] = rnd();
  return a;
}
function probkuj(siatka: Float32Array, w: number, h: number, u: number, v: number): number {
  const x = u * w;
  const y = Math.min(v, 0.9999) * h;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const gx0 = ((x0 % w) + w) % w;
  const gx1 = (gx0 + 1) % w;
  const gy0 = Math.min(Math.max(y0, 0), h - 1);
  const gy1 = Math.min(gy0 + 1, h - 1);
  const g = (t: number) => t * t * (3 - 2 * t); // wygładzenie krawędzi
  const sx = g(fx);
  const sy = g(fy);
  const a = siatka[gy0 * w + gx0];
  const b = siatka[gy0 * w + gx1];
  const c = siatka[gy1 * w + gx0];
  const d = siatka[gy1 * w + gx1];
  return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
}

/** PROFIL KRATERU — przekrój przez krater, od środka na zewnątrz.
    `r` to odległość od środka podzielona przez promień krateru
    (r = 1 to sama krawędź). Zwraca wysokość w umownych jednostkach. */
function profilKrateru(r: number): number {
  if (r > 2.6) return 0;
  let h = 0;
  // MISA — zagłębienie, najgłębsze w środku
  if (r < 0.92) h -= Math.pow(1 - (r / 0.92) * (r / 0.92), 0.75);
  // WAŁ — podniesiona obwódka tuż za krawędzią misy.
  //       To on „łapie" światło i sprawia, że krater wygląda
  //       na wklęsły, a nie na plamę.
  h += 0.6 * Math.exp(-(((r - 1.0) / 0.1) * ((r - 1.0) / 0.1)));
  // EJECTA — materiał wyrzucony przy uderzeniu, opada z odległością.
  // `zanik` doprowadza warstwę DOKŁADNIE do zera na granicy r = 2.6.
  // Bez tego zostawał tam mikroskopijny uskok — a mapa normalnych
  // wzmacnia każdy uskok i na kuli pojawiał się cienki okrąg,
  // jakby ktoś obrysował krater cyrklem.
  if (r > 1.0) {
    const zanik = 1 - (r - 1.0) / 1.6;
    h += 0.17 * Math.exp(-(r - 1.0) / 0.5) * zanik * zanik;
  }
  return h;
}

function zbudujKsiezyc(opcje: {
  szer: number; // szerokość tekstury (wysokość = połowa)
  bazowy: [number, number, number]; // kolor regolitu
  duze: number; // ile dużych kraterów
  srednie: number;
  male: number;
  morza: number; // ile ciemnych „mórz" (zastygła lawa)
  relief: number; // siła rzeźby (0 = płasko)
  /** ziarno losowości — ten sam numer = ten sam księżyc */
  ziarno: number;
}): PowierzchniaKsiezyca {
  const rnd = losowanie(opcje.ziarno);
  const W = opcje.szer;
  const H = W / 2;
  const wysokosc = new Float32Array(W * H); // mapa wysokości
  const swiezosc = new Float32Array(W * H); // jak „świeży" jest materiał
  const morze = new Float32Array(W * H); // 1 = ciemne morze
  const jasnosc = new Float32Array(W * H); // promienie od młodych kraterów

  /* --- 1. PODKŁAD: pofalowany, stary teren --- */
  const oktawy = [
    { siatka: siatkaSzumu(24, 12, rnd), w: 24, h: 12, waga: 1.0 },
    { siatka: siatkaSzumu(64, 32, rnd), w: 64, h: 32, waga: 0.45 },
    { siatka: siatkaSzumu(180, 90, rnd), w: 180, h: 90, waga: 0.18 },
    { siatka: siatkaSzumu(420, 210, rnd), w: 420, h: 210, waga: 0.07 },
    /* Najdrobniejsza warstwa — ledwie widoczna gołym okiem, ale to
       ona decyduje, czy powierzchnia wygląda jak PYŁ, czy jak
       wypolerowany plastik. Bez niej duże kratery robią się
       gładkie i „galaretowate". */
    { siatka: siatkaSzumu(1100, 550, rnd), w: 1100, h: 550, waga: 0.022 },
  ];
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      let s = 0;
      for (const o of oktawy) s += (probkuj(o.siatka, o.w, o.h, u, v) - 0.5) * o.waga;
      wysokosc[y * W + x] = s * 0.6;
    }
  }

  /* --- 2. MORZA — wielkie, gładkie niziny z zastygłej lawy.
         Są ciemniejsze i prawie pozbawione małych kraterów, bo
         powstały później i „zalały" starszy teren. --- */
  for (let i = 0; i < opcje.morza; i++) {
    // punkt równomiernie na kuli (inaczej morza tłoczą się przy biegunach)
    const theta = Math.acos(rnd() * 1.4 - 0.7);
    const cx = rnd() * W;
    const cy = (theta / Math.PI) * H;
    const promien = (0.1 + rnd() * 0.13) * W;
    const nieregularnosc = siatkaSzumu(16, 8, rnd);
    const zasieg = Math.ceil(promien * 1.6);
    for (let dy = -zasieg; dy <= zasieg; dy++) {
      const y = Math.round(cy) + dy;
      if (y < 0 || y >= H) continue;
      const sin = Math.max(Math.sin((y / H) * Math.PI), 0.2);
      for (let dx = -Math.ceil(zasieg / sin); dx <= Math.ceil(zasieg / sin); dx++) {
        const x = ((Math.round(cx) + dx) % W + W) % W;
        const odl = Math.hypot(dx * sin, dy) / promien;
        // brzeg morza ma być poszarpany, nie idealnie okrągły
        const brzeg = 0.75 + probkuj(nieregularnosc, 16, 8, x / W, y / H) * 0.5;
        if (odl > brzeg) continue;
        // łagodne przejście na brzegu morza — przy ostrym było
        // widać cienką, nienaturalną kreskę na powierzchni
        const sila = Math.min(1, (brzeg - odl) / 0.38);
        const i2 = y * W + x;
        morze[i2] = Math.max(morze[i2], sila);
        wysokosc[i2] -= sila * 0.5; // morze leży niżej
        wysokosc[i2] *= 1 - sila * 0.6; // …i jest znacznie gładsze
      }
    }
  }

  /* --- 3. KRATERY w trzech skalach --- */
  function wbijKrater(promienTeksela: number, mlody: boolean) {
    // środek równomiernie na kuli
    const theta = Math.acos(rnd() * 2 - 1);
    const cy = (theta / Math.PI) * H;
    const cx = rnd() * W;
    const sin = Math.max(Math.sin(theta), 0.16); // przy biegunach nie rozciągamy w nieskończoność
    // Jasne promienie przy biegunie rozciągają się w wachlarz smug
    // zbiegających się w jednym punkcie — brzydki artefakt mapy
    // prostokątnej. Młode (promieniste) kratery robimy więc tylko
    // z dala od biegunów.
    if (sin < 0.5) mlody = false;
    // duże kratery są względnie PŁYTSZE niż małe (tak jest naprawdę)
    const amplituda = opcje.relief * Math.pow(promienTeksela, 0.55) * 0.55;
    const szczyt = promienTeksela > W * 0.028 ? 0.45 : 0; // centralny szczyt tylko w dużych
    const zasieg = Math.ceil(promienTeksela * 2.6);
    // promienie: losowy wzór „szprych" wokół młodego krateru
    const faza = rnd() * Math.PI * 2;
    const ileSzprych = 5 + Math.floor(rnd() * 7);

    for (let dy = -zasieg; dy <= zasieg; dy++) {
      const y = Math.round(cy) + dy;
      if (y < 0 || y >= H) continue;
      const rozciag = Math.ceil(zasieg / sin);
      for (let dx = -rozciag; dx <= rozciag; dx++) {
        const x = ((Math.round(cx) + dx) % W + W) % W;
        const odlX = dx * sin; // przeliczenie na odległość NA KULI
        const r = Math.hypot(odlX, dy) / promienTeksela;
        if (r > 2.6) continue;
        const i2 = y * W + x;

        let h = profilKrateru(r);
        if (szczyt > 0 && r < 0.5) h += szczyt * Math.exp(-((r / 0.2) * (r / 0.2)));
        wysokosc[i2] += h * amplituda;

        // świeży materiał (wał + ejecta) jest jaśniejszy od otoczenia
        if (r > 0.75 && r < 1.9) {
          swiezosc[i2] = Math.min(1, swiezosc[i2] + (mlody ? 0.55 : 0.22) * Math.exp(-(r - 1) * 2));
        }
        // JASNE PROMIENIE — smugi pyłu ciągnące się daleko poza krater.
        // To one sprawiają, że młody krater widać z drugiego końca tarczy.
        if (mlody && r > 1.1) {
          const kat = Math.atan2(dy, odlX);
          // wykładnik 3 (a nie 8) — smugi mają być miękkie i nieregularne,
          // przy ostrym wykładniku wychodził wykres kołowy, nie pył
          const szprycha = Math.pow(Math.abs(Math.cos((kat - faza) * ileSzprych * 0.5)), 3);
          jasnosc[i2] = Math.min(1, jasnosc[i2] + szprycha * Math.exp(-(r - 1.1) / 1.4) * 0.7);
        }
      }
    }
  }

  for (let i = 0; i < opcje.duze; i++) wbijKrater(W * (0.018 + rnd() * 0.028), rnd() < 0.3);
  for (let i = 0; i < opcje.srednie; i++) wbijKrater(W * (0.006 + rnd() * 0.012), rnd() < 0.18);
  for (let i = 0; i < opcje.male; i++) wbijKrater(W * (0.0018 + rnd() * 0.0042), false);

  /* --- 4. KOLOR --- */
  const plotnoKoloru = document.createElement("canvas");
  plotnoKoloru.width = W;
  plotnoKoloru.height = H;
  const ctxK = plotnoKoloru.getContext("2d")!;
  const obrazK = ctxK.createImageData(W, H);
  const drobnySzum = siatkaSzumu(W / 2, H / 2, rnd);
  const [br, bg, bb] = opcje.bazowy;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i2 = y * W + x;
      // ziarno regolitu — bez niego powierzchnia wygląda plastikowo
      const ziarno = (probkuj(drobnySzum, W / 2, H / 2, x / W, y / H) - 0.5) * 0.12;
      let t = 1 + ziarno;
      t *= 1 - morze[i2] * 0.42; // morza wyraźnie ciemniejsze
      t *= 1 + swiezosc[i2] * 0.22; // świeże wały jaśniejsze
      t += jasnosc[i2] * 0.24; // promienie
      t += Math.max(-0.12, Math.min(0.12, wysokosc[i2] * 0.16)); // wyżej = jaśniej
      const p = i2 * 4;
      obrazK.data[p] = Math.max(0, Math.min(255, br * t));
      obrazK.data[p + 1] = Math.max(0, Math.min(255, bg * t));
      obrazK.data[p + 2] = Math.max(0, Math.min(255, bb * t));
      obrazK.data[p + 3] = 255;
    }
  }
  ctxK.putImageData(obrazK, 0, 0);

  /* --- 5. MAPA NORMALNYCH ---
     Liczymy nachylenie terenu w poziomie i w pionie (różnica
     wysokości sąsiednich punktów) i zapisujemy jako kolor.
     UWAGA na zniekształcenie mapy: przy biegunach te same teksele
     odpowiadają dużo mniejszemu kawałkowi powierzchni, więc
     nachylenie w poziomie trzeba podzielić przez sin(szerokości)
     — inaczej bieguny wyglądałyby jak zmięta folia. */
  const plotnoN = document.createElement("canvas");
  plotnoN.width = W;
  plotnoN.height = H;
  const ctxN = plotnoN.getContext("2d")!;
  const obrazN = ctxN.createImageData(W, H);
  const SILA = 15;
  for (let y = 0; y < H; y++) {
    const sinSurowy = Math.sin(((y + 0.5) / H) * Math.PI);
    const sin = Math.max(sinSurowy, 0.3);
    /* WYGASZANIE PRZY BIEGUNACH. Mapa prostokątna ma przy biegunach
       osobliwość: wszystkie kolumny tekseli zbiegają się w jeden
       punkt. Rzeźba robi się tam „ściągnięta" jak zaciśnięty worek
       i widać gwiazdę promieni. Nie da się tego usunąć — da się
       ukryć: przy biegunach stopniowo zerujemy siłę rzeźby. */
    const wygasz = Math.min(1, sinSurowy / 0.55);
    const yg = Math.max(y - 1, 0);
    const yd = Math.min(y + 1, H - 1);
    for (let x = 0; x < W; x++) {
      const xl = (x - 1 + W) % W;
      const xp = (x + 1) % W;
      const dx = ((wysokosc[y * W + xp] - wysokosc[y * W + xl]) * 0.5 * SILA * wygasz) / sin;
      const dy = (wysokosc[yd * W + x] - wysokosc[yg * W + x]) * 0.5 * SILA * wygasz;
      const dl = Math.hypot(dx, dy, 1);
      const p = (y * W + x) * 4;
      obrazN.data[p] = ((-dx / dl) * 0.5 + 0.5) * 255;
      /* ⚠️ PUŁAPKA, która kosztowała jeden obieg poprawek:
         zielony kanał ma tu ZNAK DODATNI, choć „na logikę" powinien
         być ujemny jak czerwony. Powód: CanvasTexture domyślnie
         ODWRACA obraz w pionie (flipY), bo w WebGL pionowa
         współrzędna tekstury rośnie do góry, a na płótnie w dół.
         Nachylenie liczymy w układzie płótna, więc trzeba je z
         powrotem odwrócić. Bez tego światło oświetla kratery od
         złej strony i wszystkie wyglądają jak WYPUKŁE kulki
         zamiast wklęsłych dziur. */
      obrazN.data[p + 1] = ((dy / dl) * 0.5 + 0.5) * 255;
      obrazN.data[p + 2] = (1 / dl) * 0.5 * 255 + 127.5;
      obrazN.data[p + 3] = 255;
    }
  }
  ctxN.putImageData(obrazN, 0, 0);

  return { kolor: plotnoKoloru, normalna: plotnoN };
}

/* ============ SŁOŃCE — FINAŁ PODRÓŻY ============
   Dawniej była to gładka biała kula i już. Z daleka (w hero)
   wyglądała dobrze, ale w sekcji Kontakt kamera podchodzi blisko
   i biała kula robiła się po prostu białym kółkiem z ostrą
   krawędzią — jak naklejone koło z papieru.

   Powierzchnia: GRANULACJA, czyli komórki konwekcyjne. To one
   sprawiają, że gwiazda wygląda na wrzącą, a nie na wyciętą. */
function namalujSlonce(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fffdf2";
  ctx.fillRect(0, 0, 1024, 512);
  ctx.save();
  ctx.filter = "blur(2px)";
  // Komórki są DROBNE i mało kontrastowe. Przy większych i mocniejszych
  // słońce wygląda jak piłka golfowa, a nie jak wrząca gwiazda —
  // granulacja ma być wyczuwalna, nie widoczna.
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const r = 1.5 + Math.random() * 4;
    ctx.fillStyle =
      Math.random() < 0.5 ? "rgba(255,235,180,0.16)" : "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return c;
}

/* PROMIENIE SŁOŃCA — wachlarz miękkich smug.
   Kiedyś rysował je CSS (`repeating-conic-gradient`) doczepiony do
   karty CTA i wycentrowany „na oko" na sztywnej wysokości. Skutek
   był nieunikniony: przy innej wysokości okna wachlarz świecił obok
   słońca. Teraz to zwykły obrazek naklejony NA TARCZĘ w scenie 3D —
   jedzie z nią wszędzie, bo jest jej częścią.
   Smugi mają losową szerokość i długość; równe wyglądałyby jak
   wykres kołowy, a nie jak światło. */
function namalujPromienie(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext("2d")!;
  ctx.translate(512, 512);
  ctx.filter = "blur(5px)";
  const ile = 64;
  for (let i = 0; i < ile; i++) {
    const kat = (i / ile) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
    const szer = (0.004 + Math.random() * 0.016) * Math.PI;
    const dl = 300 + Math.random() * 190;
    const moc = 0.05 + Math.random() * 0.11;
    const g = ctx.createRadialGradient(0, 0, 60, 0, 0, dl);
    g.addColorStop(0, `rgba(255,238,196,${moc.toFixed(3)})`);
    g.addColorStop(0.45, `rgba(255,214,140,${(moc * 0.45).toFixed(3)})`);
    g.addColorStop(1, "rgba(255,200,110,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, dl, kat - szer, kat + szer);
    ctx.closePath();
    ctx.fill();
  }
  // wycinamy środek (żeby smugi nie leżały na samej tarczy)
  // i wygaszamy je na zewnątrz — inaczej widać krawędź obrazka
  ctx.filter = "none";
  ctx.globalCompositeOperation = "destination-in";
  const maska = ctx.createRadialGradient(0, 0, 0, 0, 0, 512);
  maska.addColorStop(0, "rgba(0,0,0,0)");
  maska.addColorStop(0.17, "rgba(0,0,0,0)");
  maska.addColorStop(0.36, "rgba(0,0,0,1)");
  maska.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = maska;
  ctx.fillRect(-512, -512, 1024, 1024);
  return c;
}

/* Miękka, okrągła poświata (parametr: kolor rgb) — jak na produkcji. */
function namalujPoswiate(rgb: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, `rgba(${rgb},0.6)`);
  g.addColorStop(0.5, `rgba(${rgb},0.18)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return c;
}

/* ============ POLE GWIAZD ============ */
/* W hero gwiazd NIE widać (kadr wygląda dokładnie jak na produkcji) —
   rozjaśniają się dopiero, gdy ruszasz w podróż. Wtedy dają poczucie
   ruchu i głębi podczas przelotów. */
function poleGwiazd(ile: number, minR: number, maxR: number, rozmiar: number): THREE.Points {
  const pozycje = new Float32Array(ile * 3);
  const kolory = new Float32Array(ile * 3);
  const k = new THREE.Color();
  for (let i = 0; i < ile; i++) {
    // losowy punkt na sferycznej powłoce (równomiernie)
    const u = Math.random() * 2 - 1;
    const fi = Math.random() * Math.PI * 2;
    const r = minR + Math.random() * (maxR - minR);
    const s = Math.sqrt(1 - u * u);
    pozycje[i * 3] = s * Math.cos(fi) * r;
    pozycje[i * 3 + 1] = u * r;
    pozycje[i * 3 + 2] = s * Math.sin(fi) * r;
    // paleta: biel, chłodny błękit, ciepła kość — różna jasność
    const typ = Math.random();
    if (typ < 0.7) k.setRGB(1, 1, 1);
    else if (typ < 0.88) k.setRGB(0.72, 0.82, 1);
    else k.setRGB(1, 0.9, 0.75);
    const jasnosc = 0.25 + Math.random() * 0.75;
    kolory[i * 3] = k.r * jasnosc;
    kolory[i * 3 + 1] = k.g * jasnosc;
    kolory[i * 3 + 2] = k.b * jasnosc;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pozycje, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(kolory, 3));
  const mat = new THREE.PointsMaterial({
    size: rozmiar,
    map: new THREE.CanvasTexture(namalujPoswiate("255,255,255")),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

/* ============ GŁÓWNA FUNKCJA — budowa świata ============ */

export type SilnikLotu = {
  /** Okna postoju przy przystankach — po jednym na sekcję (hero,
      usługi, portfolio, proces, opinie, kontakt), podane w PIKSELACH
      scrolla: od `a` do `b` kamera stoi przy danym ciele, a między
      `b` jednego a `a` następnego leci.

      Dlaczego w pikselach, a nie w ułamkach 0–1? Bo silnik sam czyta
      `window.scrollY` w swojej pętli. Gdyby pozycję podawał ktoś inny
      (np. ScrollTrigger, znormalizowaną do zapamiętanego zakresu),
      obie miary rozjeżdżałyby się przy każdej zmianie wysokości
      strony — a wtedy kamera stoi przy złej planecie. */
  ustawOkna: (nowe: { a: number; b: number }[]) => void;
  /** Ile przystanków ma trasa (do kontroli w LotSekcja). */
  liczbaPrzystankow: number;
  /** Podepnij funkcję, która przy KAŻDEJ klatce dostanie pozycję
      kamery na trasie — jako UŁAMEK, nie numer przystanku:
        2     = stoimy przy przystanku 2,
        2.37  = jesteśmy w 37% drogi z przystanku 2 do 3.
      Dzięki ułamkowi kafelek w navbarze może płynnie przejeżdżać
      między pozycjami menu, zamiast przeskakiwać. */
  naPozycji: (f: (pozycja: number) => void) => void;
  /** Posprzątaj wszystko (unmount). */
  zniszcz: () => void;
};

export function zbudujLot(pojemnik: HTMLDivElement): SilnikLotu {
  /* — renderer: dokładnie taki jak w produkcyjnej scenie hero
       (alpha = przezroczyste tło, więc widać ciemne tło strony
       i dryfujące poświaty hero; ZERO post-processingu, żeby
       planety wyglądały 1:1 jak na produkcji) — */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(pojemnik.clientWidth, pojemnik.clientHeight);
  renderer.domElement.style.pointerEvents = "none";
  pojemnik.appendChild(renderer.domElement);

  const scena = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(
    42,
    pojemnik.clientWidth / pojemnik.clientHeight,
    0.02,
    260
  );
  // kamera MUSI być w scenie, żeby jej „dzieci" (panorama sąsiadów)
  // w ogóle się renderowały
  scena.add(kamera);

  // wszystkie tekstury w jednym worku — łatwe sprzątanie
  const tekstury: THREE.Texture[] = [];
  function tekstura(plotno: HTMLCanvasElement, sRGB = true): THREE.CanvasTexture {
    const t = new THREE.CanvasTexture(plotno);
    if (sRGB) t.colorSpace = THREE.SRGBColorSpace;
    tekstury.push(t);
    return t;
  }

  /* ============================================================
     KOMPOZYCJA UKŁADU
     Pozycje i promienie ciał niebieskich siedzą w kadry.ts —
     tam też dobiera się cały scenariusz zdjęciowy. Tutaj tylko
     z nich korzystamy.
     ============================================================ */

  /* — światła: 1:1 z produkcyjnej sceny hero — */
  scena.add(new THREE.AmbientLight(0xffffff, 0.5));
  const swiatloGlowne = new THREE.DirectionalLight(0xffffff, 2.2);
  swiatloGlowne.position.set(-4, 2.5, 3);
  scena.add(swiatloGlowne);
  // ciepłe światło „od słońca"
  const swiatloSlonca = new THREE.PointLight(0xfff4d0, 1.4, 0, 0);
  swiatloSlonca.position.copy(POZ_SLONCA);
  scena.add(swiatloSlonca);

  /* — gwiazdy (niewidoczne w hero, rozjaśniają się w podróży) — */
  const gwiazdyDaleko = poleGwiazd(4200, 60, 110, 0.42);
  const gwiazdyBlisko = poleGwiazd(600, 20, 45, 0.24);
  scena.add(gwiazdyDaleko, gwiazdyBlisko);

  /* ========== PLANETA GŁÓWNA (z pierścieniami i księżycami) ========== */
  const uklad = new THREE.Group();
  uklad.position.copy(SRODEK_OLBRZYMA);
  uklad.rotation.z = OBROT_UKLADU;
  scena.add(uklad);

  const plotnoOlbrzyma = namalujPlanete();
  const planeta = new THREE.Mesh(
    new THREE.SphereGeometry(R_OLBRZYM, 96, 96),
    new THREE.MeshStandardMaterial({
      map: tekstura(plotnoOlbrzyma),
      roughness: 0.85,
      metalness: 0.05,
    })
  );
  uklad.add(planeta);

  const tPierscieni = tekstura(namalujPierscienie(), false);
  tPierscieni.anisotropy = 8; // ostre pasma także pod ostrym kątem
  const pierscienie = new THREE.Mesh(
    new THREE.RingGeometry(1.6, 2.7, 160),
    new THREE.MeshBasicMaterial({
      map: tPierscieni,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  pierscienie.rotation.x = PRZECHYL; // pochylenie pierścieni (z kadry.ts)
  uklad.add(pierscienie);

  /* księżyc GŁÓWNY — to na nim „ląduje" sekcja Usługi, czyli to
     NAJDOKŁADNIEJ oglądana powierzchnia na całej stronie. Dlatego
     dostaje pełną rozdzielczość, mapę normalnych i gęstą siatkę
     wierzchołków (96×96 zamiast 64×64 — inaczej krawędź kuli
     widocznej z bliska robi się kanciasta). */
  /* Kolor bazowy jest CIEMNIEJSZY niż dawniej (dawniej #e8e4ff,
     czyli prawie biel). Powód: skoro powierzchnia ma teraz
     prawdziwą rzeźbę, to światło samo robi jasne wały i ciemne
     misy. Startując od bieli nie zostaje miejsca na rozjaśnienie
     — wszystko zlewa się w białą plamę. Prawdziwy Księżyc też
     jest ciemnoszary; jasny wydaje się tylko na tle czerni. */
  const USTAWIENIA_KSIEZYCA = {
    bazowy: [163, 158, 186] as [number, number, number],
    duze: 15,
    srednie: 64,
    male: 340,
    morza: 3,
    relief: 1,
    ziarno: Math.floor(Math.random() * 1e9), // losowy świat, ale JEDEN
  };

  /* ⭐ DWA ETAPY ŁADOWANIA — najważniejsza optymalizacja startu.
     Tekstura 2048×1024 z mapą wysokości i mapą normalnych to ponad
     dwa miliony punktów do policzenia. A w hero księżyc zajmuje…
     4% wysokości ekranu. Liczenie tam pełnego detalu to czysta
     strata — i przez nią strona stała kilka sekund, zanim pokazała
     kosmos.
     Dlatego: najpierw wersja 512 px (scena rusza natychmiast),
     a pełna dobudowuje się w tle, kiedy przeglądarka nie ma nic
     pilnego — na długo zanim scroll dowiezie kogokolwiek do sekcji
     Usługi. Wspólne ziarno sprawia, że to ten sam księżyc, więc
     podmiany nie widać. */
  const powKsiezyca = zbudujKsiezyc({ szer: 512, ...USTAWIENIA_KSIEZYCA });
  const materialKsiezyca = new THREE.MeshStandardMaterial({
      map: tekstura(powKsiezyca.kolor),
      // mapa normalnych NIE jest obrazkiem do oglądania, tylko
      // zapisem kierunków — nie wolno jej przepuszczać przez
      // korekcję sRGB, bo zafałszuje kąty (stąd `false`)
      normalMap: tekstura(powKsiezyca.normalna, false),
      normalScale: new THREE.Vector2(1, 1),
      roughness: 0.98, // regolit jest matowy jak popiół — zero połysku
      metalness: 0,
      // emisja mocno ściszona: wcześniej rozjaśniała cienie tak,
      // że rzeźba i tak by ich nie pokazała
      emissive: 0x14111f,
  });
  const ksiezyc = new THREE.Mesh(
    new THREE.SphereGeometry(R_KSIEZYC, 96, 96),
    materialKsiezyca
  );
  /* Przechylenie osi księżyca. Tekstura prostokątna ma przy
     biegunach nieusuwalną osobliwość (wszystkie kolumny zbiegają
     się w punkt). Kamera w sekcji Usługi patrzy na księżyc lekko
     od dołu, więc bez tego obrotu biegun wypadałby dokładnie na
     środku widocznej tarczy. Obracamy go poza kadr — najstarsza
     sztuczka w grafice: czego nie da się naprawić, to się odwraca. */
  ksiezyc.rotation.set(1.15, 0.6, 0.35);
  uklad.add(ksiezyc);

  /* — dobudowanie pełnej tekstury księżyca (patrz komentarz wyżej).
       `requestIdleCallback` znaczy „zrób to, gdy nie masz nic
       lepszego do roboty". Limit 5 s na wypadek sprzętu, na którym
       chwila bezczynności nigdy nie nadejdzie. — */
  let zniszczony = false;
  let dopieszczanie: number | null = null;
  function dopiescKsiezyc() {
    if (zniszczony) return;
    const pelny = zbudujKsiezyc({ szer: 2048, ...USTAWIENIA_KSIEZYCA });
    const stareKolor = materialKsiezyca.map;
    const stareNorm = materialKsiezyca.normalMap;
    materialKsiezyca.map = tekstura(pelny.kolor);
    materialKsiezyca.normalMap = tekstura(pelny.normalna, false);
    materialKsiezyca.needsUpdate = true;
    stareKolor?.dispose(); // zwalniamy pamięć karty graficznej
    stareNorm?.dispose();
  }
  const bezczynnosc = (
    window as Window & {
      requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number;
    }
  ).requestIdleCallback;
  dopieszczanie = bezczynnosc
    ? bezczynnosc(dopiescKsiezyc, { timeout: 5000 })
    : (setTimeout(dopiescKsiezyc, 1200) as unknown as number);

  // drugi, MNIEJSZY księżyc — ta sama płaszczyzna orbity, własny
  // promień i tempo, żeby księżyce nigdy się nie mijały
  // Ten księżyc oglądamy tylko z daleka, więc tekstura jest
  // czterokrotnie mniejsza — po co liczyć detal, którego nie widać.
  const powKsiezyca2 = zbudujKsiezyc({
    szer: 512,
    bazowy: [211, 205, 242],
    duze: 6,
    srednie: 22,
    male: 60,
    morza: 1,
    relief: 1,
     ziarno: Math.floor(Math.random() * 1e9),
  });
  const ksiezyc2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 32, 32),
    new THREE.MeshStandardMaterial({
      map: tekstura(powKsiezyca2.kolor),
      normalMap: tekstura(powKsiezyca2.normalna, false),
      roughness: 0.9,
      emissive: 0x18142a,
      transparent: true, // patrz „NIE ZASŁANIAJ KADRU" niżej
    })
  );
  uklad.add(ksiezyc2);

  // poświata za planetą
  const poswiata = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tekstura(namalujPoswiate("139,124,247"), false),
      transparent: true,
      depthWrite: false,
    })
  );
  poswiata.scale.set(5.6, 5.6, 1);
  poswiata.position.set(SRODEK_OLBRZYMA.x, SRODEK_OLBRZYMA.y, -1.6);
  scena.add(poswiata);

  /* ========== RÓŻOWA PLANETA ========== */
  const plotnoRozowej = namalujRozowa();
  const rozowa = new THREE.Mesh(
    new THREE.SphereGeometry(R_ROZOWA, 72, 72),
    new THREE.MeshStandardMaterial({ map: tekstura(plotnoRozowej), roughness: 0.8 })
  );
  rozowa.position.copy(POZ_ROZOWEJ);
  scena.add(rozowa);
  const poswiataRoz = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tekstura(namalujPoswiate("240,111,174"), false),
      transparent: true,
      depthWrite: false,
    })
  );
  poswiataRoz.scale.set(2.1, 2.1, 1);
  poswiataRoz.position.copy(POZ_ROZOWEJ).setZ(POZ_ROZOWEJ.z - 0.2);
  scena.add(poswiataRoz);

  /* ========== TURKUSOWA MINI-PLANETA (z księżycem) ========== */
  // W klasycznej wersji strony jest to ozdoba CSS (Ozdoby3D.tsx);
  // tu musi być prawdziwą kulą, bo kamera do niej podlatuje.
  const plotnoTurkusowej = namalujTurkusowa();
  const turkusowa = new THREE.Mesh(
    new THREE.SphereGeometry(R_TURKUSOWA, 64, 64),
    new THREE.MeshStandardMaterial({ map: tekstura(plotnoTurkusowej), roughness: 0.8 })
  );
  turkusowa.position.copy(POZ_TURKUSOWEJ);
  scena.add(turkusowa);
  const poswiataTurk = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tekstura(namalujPoswiate("95,154,149"), false),
      transparent: true,
      depthWrite: false,
    })
  );
  poswiataTurk.scale.set(1.5, 1.5, 1);
  poswiataTurk.position.copy(POZ_TURKUSOWEJ).setZ(POZ_TURKUSOWEJ.z - 0.2);
  scena.add(poswiataTurk);
  // jej mały księżyc (na produkcji krąży w PRZECIWNĄ stronę niż
  // księżyce olbrzyma — zachowujemy ten szczegół)
  const powKsiezycaT = zbudujKsiezyc({
    szer: 512,
    bazowy: [215, 232, 229],
    duze: 4,
    srednie: 16,
    male: 40,
    morza: 0,
    relief: 1,
     ziarno: Math.floor(Math.random() * 1e9),
  });
  const ksiezycTurkusowej = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 24, 24),
    new THREE.MeshStandardMaterial({
      map: tekstura(powKsiezycaT.kolor),
      normalMap: tekstura(powKsiezycaT.normalna, false),
      roughness: 0.85,
      emissive: 0x142826,
      transparent: true, // patrz „NIE ZASŁANIAJ KADRU" niżej
    })
  );
  scena.add(ksiezycTurkusowej);

  /* ========== SŁOŃCE (prawie biała kula + żółte halo) ==========
     DOKŁADNIE jak na produkcji: gładka, prawie biała kula
     (MeshBasicMaterial — świeci własnym kolorem, nie reaguje na
     światła) + żółte halo w trybie additive. Bez tekstury i bez
     post-processingu, żeby wyglądało 1:1 jak w hero. */
  const slonce = new THREE.Mesh(
    new THREE.SphereGeometry(R_SLONCE, 64, 64),
    new THREE.MeshBasicMaterial({ map: tekstura(namalujSlonce()) })
  );
  slonce.position.copy(POZ_SLONCA);
  scena.add(slonce);

  /* OTOCZKA — wąska, jasna obwódka tuż przy tarczy. Jej jedyne
     zadanie: rozmyć ostrą krawędź kuli. Bez niej słońce z bliska
     wygląda jak wycięte nożyczkami koło. */
  const otoczka = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tekstura(namalujPoswiate("255,246,214"), false),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.85,
    })
  );
  otoczka.scale.set(1.15, 1.15, 1);
  otoczka.position.copy(POZ_SLONCA).setZ(POZ_SLONCA.z - 0.02);
  scena.add(otoczka);

  /* PROMIENIE — obracają się bardzo powoli (pełny obrót ~5 minut).
     Ruch ma być na granicy zauważalności: ma sprawiać wrażenie,
     że gwiazda żyje, a nie kręcić się jak wiatraczek. */
  const promienie = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tekstura(namalujPromienie(), false),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.9,
    })
  );
  promienie.scale.set(7.4, 7.4, 1);
  promienie.position.copy(POZ_SLONCA).setZ(POZ_SLONCA.z - 0.04);
  scena.add(promienie);
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tekstura(namalujPoswiate("255,236,150"), false),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  // skala przeliczona z produkcji (3.4 przy odległości ~13) na
  // nową odległość słońca, żeby halo wyglądało tak samo
  halo.scale.set(4.4, 4.4, 1);
  halo.position.copy(POZ_SLONCA).setZ(POZ_SLONCA.z - 0.1);
  scena.add(halo);

  /* ============================================================
     TRASA KAMERY — 6 PRZYSTANKÓW PO TEJ SAMEJ SCENIE
     ============================================================
     Sam SCENARIUSZ (gdzie stanąć, jak duża ma być tarcza, w którym
     miejscu ekranu ma wylądować) siedzi w components/lot/kadry.ts.
     Tutaj tylko zamieniamy go na gotowe wektory.

     Dlaczego księżyc ma osobne traktowanie? Bo KRĄŻY. Jego środek
     i kierunek podejścia trzeba liczyć w każdej klatce z aktualnej
     pozycji, a nie raz na starcie. Reszta ciał stoi w miejscu, więc
     ich wektory liczymy raz i zapamiętujemy.
     ============================================================ */
  const staly = (v: THREE.Vector3) => () => v;
  const pomocniczy = new THREE.Vector3();
  const pomocniczy2 = new THREE.Vector3();
  const bufNormalnej = new THREE.Vector3();

  function srodekKsiezyca(): THREE.Vector3 {
    return ksiezyc.getWorldPosition(pomocniczy2);
  }

  /* Kierunek podejścia do KSIĘŻYCA: od zewnątrz jego orbity,
     uniesiony nad płaszczyznę pierścieni. Dzięki temu kamera
     „skacze" tuż nad pierścieniami, księżyc jest w kadrze, a za nim
     rozciąga się wielka tarcza olbrzyma. */
  function kierunekKsiezyca(unies: number): THREE.Vector3 {
    ksiezyc.getWorldPosition(pomocniczy);
    pomocniczy.sub(SRODEK_OLBRZYMA).normalize(); // promieniowo, na zewnątrz
    pierscienie.getWorldDirection(bufNormalnej); // normalna pierścieni
    return pomocniczy
      .multiplyScalar(Math.cos(unies * STOPIEN))
      .addScaledVector(bufNormalnej, Math.sin(unies * STOPIEN))
      .normalize();
  }

  type Przystanek = {
    srodek: () => THREE.Vector3;
    kierunek: () => THREE.Vector3;
    dystans: number;
    fov: number;
    /** przechył kadru (roll) w RADIANACH (w scenariuszu są stopnie) */
    obrot: number;
    kadr: { x: number; y: number };
  };

  const PRZYSTANKI: Przystanek[] = SCENARIUSZ.map((p) => {
    const srodek =
      p.cel.typ === "ksiezyc" ? srodekKsiezyca : staly(p.cel.v.clone());

    let kierunek: () => THREE.Vector3;
    if (p.kierunek.typ === "ksiezyc") {
      const unies = p.kierunek.unies;
      kierunek = () => kierunekKsiezyca(unies);
    } else if (p.kierunek.typ === "staly") {
      kierunek = staly(new THREE.Vector3(...p.kierunek.v).normalize());
    } else {
      // „od poprzedniego ciała" — cel stoi w miejscu, więc liczymy raz
      const v = new THREE.Vector3()
        .subVectors(p.kierunek.skad, (p.cel as { v: THREE.Vector3 }).v)
        .normalize();
      kierunek = staly(v);
    }

    return {
      srodek,
      kierunek,
      dystans: dystansPrzystanku(p),
      fov: p.fov,
      obrot: p.obrot * STOPIEN,
      kadr: p.kadr,
    };
  });

  /* ============ OMIJANIE CIAŁ NIEBIESKICH ============
     Łuk przelotu bywa krótszy niż droga naokoło planety — bez tego
     kamera potrafiłaby przelecieć przez ŚRODEK olbrzyma. Dlatego
     każdy punkt trasy wypychamy na zewnątrz, jeśli wszedłby bliżej
     niż 14% ponad powierzchnię kuli. Efekt: zamiast przenikać przez
     planetę, kamera efektownie ślizga się tuż nad jej chmurami.
     (1,14·R jest zawsze mniejsze od dystansu postoju, więc kadry
     przy sekcjach zostają nietknięte.) */
  const OTULINA = 1.14;
  const KULE: { srodek: () => THREE.Vector3; promien: number }[] = [
    { srodek: staly(SRODEK_OLBRZYMA), promien: R_OLBRZYM },
    { srodek: staly(POZ_ROZOWEJ), promien: R_ROZOWA },
    { srodek: staly(POZ_TURKUSOWEJ), promien: R_TURKUSOWA },
    { srodek: staly(POZ_SLONCA), promien: R_SLONCE },
    { srodek: srodekKsiezyca, promien: R_KSIEZYC },
  ];
  const bufOmin = new THREE.Vector3();
  function omijajKule(punkt: THREE.Vector3) {
    for (const kula of KULE) {
      const srodek = kula.srodek();
      const bezpieczny = kula.promien * OTULINA;
      const d = punkt.distanceTo(srodek);
      if (d < bezpieczny && d > 1e-4) {
        bufOmin.subVectors(punkt, srodek).normalize();
        punkt.addScaledVector(bufOmin, bezpieczny - d);
      }
    }
  }

  // Okna postoju w pikselach scrolla — ustawia je LotSekcja po
  // zmierzeniu układu strony. Do tego czasu stoimy w hero.
  let okna: { a: number; b: number }[] = [];

  /* Easing filmowy — odpowiednik GSAP-owego „power2.inOut":
     ruszamy miękko, w środku lecimy szybko, hamujemy miękko. */
  const filmowe = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  /* Pozycja kamery na przystanku: środek ciała + kierunek · dystans. */
  const bufPoz = new THREE.Vector3();
  const bufCel = new THREE.Vector3();
  function pozycjaPrzystanku(i: number, out: THREE.Vector3): THREE.Vector3 {
    const p = PRZYSTANKI[i];
    return out.copy(p.srodek()).addScaledVector(p.kierunek(), p.dystans);
  }

  /* Punkt kontrolny łuku między przystankami a→b: środek odcinka
     odsunięty w bok i w górę (prostopadle do kierunku lotu). */
  const bufA = new THREE.Vector3();
  const bufB = new THREE.Vector3();
  const bufKier = new THREE.Vector3();
  const bufBok = new THREE.Vector3();
  const bufGora = new THREE.Vector3();
  const PION = new THREE.Vector3(0, 1, 0);
  function punktKontrolny(i: number, out: THREE.Vector3): THREE.Vector3 {
    pozycjaPrzystanku(i, bufA);
    pozycjaPrzystanku(i + 1, bufB);
    bufKier.subVectors(bufB, bufA);
    bufBok.crossVectors(bufKier, PION).normalize();
    bufGora.crossVectors(bufBok, bufKier).normalize();
    return out
      .addVectors(bufA, bufB)
      .multiplyScalar(0.5)
      .addScaledVector(bufGora, LUKI[i].gora)
      .addScaledVector(bufBok, LUKI[i].bok);
  }

  /* Punkt na kwadratowej krzywej Béziera (a → kontrola → b). */
  function punktLuku(
    a: THREE.Vector3,
    k: THREE.Vector3,
    b: THREE.Vector3,
    t: number,
    out: THREE.Vector3
  ) {
    const u = 1 - t;
    out.set(
      u * u * a.x + 2 * u * t * k.x + t * t * b.x,
      u * u * a.y + 2 * u * t * k.y + t * t * b.y,
      u * u * a.z + 2 * u * t * k.z + t * t * b.z
    );
  }

  let scrollPlynny = window.scrollY; // wygładzona pozycja (kamera nie szarpie)
  let wPostoju = true; // czy stoimy przy ciele niebieskim (a nie lecimy)
  let aktywnyPrzystanek = 0;
  /* Pozycja na trasie jako UŁAMEK (2.37 = 37% drogi z przystanku 2
     do 3). Czyta ją navbar, żeby płynnie przesuwać swój kafelek. */
  let pozycjaPodrozy = 0;
  const mysz = { x: 0, y: 0 }; // parallax kursora
  const myszPlynna = { x: 0, y: 0 };

  function przyRuchuMyszy(e: MouseEvent) {
    mysz.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mysz.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }
  window.addEventListener("mousemove", przyRuchuMyszy);

  const kontrola = new THREE.Vector3();
  const pozB = new THREE.Vector3();
  const celB = new THREE.Vector3();

  function ustawKamere(y: number, czas: number) {
    // gdzie jesteśmy: w oknie przystanku (kamera stoi) czy w locie?
    // `y` to pozycja scrolla w pikselach (wygładzona).
    let a = Math.max(0, okna.length - 1);
    let surowe = 0; // 0 = postój; 0–1 = lot do a+1
    for (let i = 0; i < okna.length; i++) {
      if (y <= okna[i].b) {
        if (y >= okna[i].a || i === 0) {
          a = i;
          surowe = 0;
        } else {
          a = i - 1;
          const dl = Math.max(1, okna[i].a - okna[i - 1].b);
          surowe = Math.min(1, Math.max(0, (y - okna[i - 1].b) / dl));
        }
        break;
      }
    }
    const b = Math.min(a + 1, PRZYSTANKI.length - 1);
    wPostoju = surowe <= 0 || a === b;
    aktywnyPrzystanek = a;

    let przechylKadru: number;
    let kadrX: number;
    let kadrY: number;
    if (wPostoju) {
      pozycjaPodrozy = a;
      pozycjaPrzystanku(a, bufPoz);
      bufCel.copy(PRZYSTANKI[a].srodek());
      kamera.fov = PRZYSTANKI[a].fov;
      przechylKadru = PRZYSTANKI[a].obrot;
      kadrX = PRZYSTANKI[a].kadr.x;
      kadrY = PRZYSTANKI[a].kadr.y;
    } else {
      const t = filmowe(surowe);
      // navbar dostaje TĘ SAMĄ, wygładzoną wartość co kamera —
      // dzięki temu kafelek jedzie dokładnie w rytm przelotu,
      // a nie własnym, liniowym tempem obok
      pozycjaPodrozy = a + t;
      pozycjaPrzystanku(a, bufA);
      pozycjaPrzystanku(b, pozB);
      punktKontrolny(a, kontrola);
      // 1) POZYCJA po łuku — kamera odlatuje, przesuwa się w bok
      //    i dolatuje do następnego ciała (zoom out → pan → zoom in)
      punktLuku(bufA, kontrola, pozB, t, bufPoz);
      omijajKule(bufPoz); // …ale nigdy NIE przez środek planety
      // 2) CEL patrzenia płynnie wędruje na następne ciało
      celB.copy(PRZYSTANKI[b].srodek());
      bufCel.copy(PRZYSTANKI[a].srodek()).lerp(celB, t);
      // 3) FOV „oddycha" — w połowie lotu szerzej (mocniejszy zoom out)
      kamera.fov =
        PRZYSTANKI[a].fov +
        (PRZYSTANKI[b].fov - PRZYSTANKI[a].fov) * t +
        Math.sin(Math.PI * t) * LUKI[a].fov;
      // 4) PRZECHYŁ kadru — obraca się w drodze do nowego świata
      przechylKadru =
        PRZYSTANKI[a].obrot + (PRZYSTANKI[b].obrot - PRZYSTANKI[a].obrot) * t;
      // 5) KADR — planeta płynnie wjeżdża na swoje miejsce na ekranie
      kadrX = PRZYSTANKI[a].kadr.x + (PRZYSTANKI[b].kadr.x - PRZYSTANKI[a].kadr.x) * t;
      kadrY = PRZYSTANKI[a].kadr.y + (PRZYSTANKI[b].kadr.y - PRZYSTANKI[a].kadr.y) * t;
    }

    // delikatny „oddech" + parallax myszy (pełny tylko w hero)
    const luz = a === 0 && wPostoju ? 1 : 0.35;
    bufPoz.x += Math.sin(czas * 0.23) * 0.045 * luz + myszPlynna.x * 0.09 * luz;
    bufPoz.y += Math.cos(czas * 0.19) * 0.035 * luz - myszPlynna.y * 0.07 * luz;

    kamera.position.copy(bufPoz);
    kamera.up.set(0, 1, 0); // lookAt liczy obrót od pionu — resetujemy
    kamera.lookAt(bufCel);
    kamera.rotateZ(przechylKadru); // ← PRZECHYŁ KADRU (efekt „Prezi")

    /* — PRZESUNIĘCIE KADRU —
       Kamera stoi w miejscu, tylko lekko ODWRACA GŁOWĘ. Robimy to
       PO przechyle, w jej własnych osiach, czyli dokładnie w osiach
       tego, co widać na ekranie:
         obrót w lewo (rotateY)  → planeta ucieka w PRAWO,
         obrót w górę (rotateX)  → planeta zjeżdża w DÓŁ.
       Kąt dobieramy tak, żeby przesunięcie wyszło równo tyle, ile
       zamawia pole `kadr`. Mnożnik 2, bo „pół kadru" to połowa
       ekranu, a `kadr` liczymy od jego ŚRODKA. */
    if (kadrX !== 0 || kadrY !== 0) {
      const polKadru = Math.tan((kamera.fov / 2) * STOPIEN);
      kamera.rotateY(Math.atan(2 * kadrX * polKadru * kamera.aspect));
      kamera.rotateX(Math.atan(2 * kadrY * polKadru));
    }
    kamera.updateProjectionMatrix();
  }

  /* Silnik przy każdej klatce melduje na zewnątrz, gdzie jest
     kamera. Korzysta z tego KAFELEK W GÓRNYM MENU — przejeżdża
     między pozycjami i zmienia kolor razem ze sceną.

     Kiedyś stał tu pasek kropek przy lewej krawędzi ekranu.
     Wyleciał: mówił dokładnie to samo, co potrafi powiedzieć samo
     menu, a przy okazji zaśmiecał kadr. Jeden komunikat, jedno
     miejsce — mniej rzeczy walczy o uwagę. */
  let poinformujOPozycji: ((pozycja: number) => void) | null = null;
  let ostatnioZgloszona = -1;

  /* ============ NIE ZASŁANIAJ KADRU ============
     Przy postojach kamera stoi bardzo blisko planet, więc krążący
     obok MAŁY księżyc potrafi wjechać dosłownie pod obiektyw —
     i zamiast ozdoby robi się wielka szara plama na środku tekstu.
     Zasada jest prosta jak na planie zdjęciowym: kto wchodzi
     w kadr operatorowi, ten znika. Poniżej ~0,55 jednostki od
     kamery księżyc płynnie się rozpływa. Z daleka (np. w hero)
     nic się nie zmienia — tam odległości są wielokrotnie większe. */
  const bufBlisko = new THREE.Vector3();
  function schowajGdyPodObiektywem(obiekt: THREE.Mesh) {
    const mat = obiekt.material as THREE.MeshStandardMaterial;
    const d = obiekt.getWorldPosition(bufBlisko).distanceTo(kamera.position);
    mat.opacity = Math.min(1, Math.max(0, (d - 0.55) / 0.45));
    obiekt.visible = mat.opacity > 0.02;
  }

  /* — pętla renderowania — */
  const zegar = new THREE.Clock();
  let kat = Math.random() * Math.PI * 2;
  let kat2 = Math.random() * Math.PI * 2;
  let kat3 = Math.random() * Math.PI * 2;
  let klatka = 0;
  let widoczna = true;
  let krycieGwiazd = 0;

  function animuj() {
    klatka = requestAnimationFrame(animuj);
    const dt = Math.min(zegar.getDelta(), 0.05);
    // Pozycję scrolla czytamy SAMI, wprost z przeglądarki — działa tak
    // samo dla kółka myszy, klawiatury, paska i animowanego przewijania
    // z menu (nie zależymy od żadnej biblioteki).
    scrollPlynny += (window.scrollY - scrollPlynny) * Math.min(1, dt * 5);
    if (!widoczna) return;
    const czas = zegar.elapsedTime;

    myszPlynna.x += (mysz.x - myszPlynna.x) * Math.min(1, dt * 3);
    myszPlynna.y += (mysz.y - myszPlynna.y) * Math.min(1, dt * 3);

    // ruch świata (tempo z produkcji, tylko olbrzym wolniej —
    // z bliska szybki obrót powierzchni męczyłby oko)
    planeta.rotation.y += dt * 0.06;
    // promienie słońca: pełny obrót w ok. 5 minut
    (promienie.material as THREE.SpriteMaterial).rotation += dt * 0.021;
    pierscienie.rotation.z += dt * 0.02;
    rozowa.rotation.y += dt * 0.18;
    turkusowa.rotation.y += dt * 0.14;

    // Oba księżyce olbrzyma: prawdziwa orbita w PŁASZCZYŹNIE
    // pierścieni, w tę samą stronę. Główny krąży wolno, bo to na nim
    // „stoi" kamera w sekcji Usługi (szybka orbita = zawroty głowy).
    kat += dt * 0.12;
    const s = Math.sin(kat);
    ksiezyc.position.set(
      Math.cos(kat) * R_ORBITY,
      s * R_ORBITY * Math.cos(PRZECHYL),
      s * R_ORBITY * Math.sin(PRZECHYL)
    );
    kat2 += dt * 0.4;
    const s2 = Math.sin(kat2);
    ksiezyc2.position.set(
      Math.cos(kat2) * R_ORBITY2,
      s2 * R_ORBITY2 * Math.cos(PRZECHYL),
      s2 * R_ORBITY2 * Math.sin(PRZECHYL)
    );

    // księżyc turkusowej — w PRZECIWNĄ stronę (szczegół z produkcji)
    kat3 -= dt * 0.5;
    ksiezycTurkusowej.position.set(
      POZ_TURKUSOWEJ.x + Math.cos(kat3) * 0.62,
      POZ_TURKUSOWEJ.y + Math.sin(kat3) * 0.17,
      POZ_TURKUSOWEJ.z + Math.sin(kat3) * 0.5
    );

    ustawKamere(scrollPlynny, czas);
    schowajGdyPodObiektywem(ksiezyc2);
    schowajGdyPodObiektywem(ksiezycTurkusowej);

    // powiadom navbar o pozycji na trasie (tylko gdy naprawdę się
    // zmieniła — przy nieruchomej stronie nie ma po co nikogo budzić)
    if (pozycjaPodrozy !== ostatnioZgloszona) {
      ostatnioZgloszona = pozycjaPodrozy;
      poinformujOPozycji?.(pozycjaPodrozy);
    }

    // gwiazdy: niewidoczne w hero (kadr 1:1 z produkcją), rozjaśniają
    // się dopiero w podróży. Jadą razem z kamerą — daleka warstwa jak
    // kopuła nieba, bliska z opóźnieniem (paralaksa w locie).
    const celGwiazd = aktywnyPrzystanek > 0 || !wPostoju ? 1 : 0;
    krycieGwiazd += (celGwiazd - krycieGwiazd) * Math.min(1, dt * 1.6);
    (gwiazdyDaleko.material as THREE.PointsMaterial).opacity = krycieGwiazd * 0.9;
    (gwiazdyBlisko.material as THREE.PointsMaterial).opacity = krycieGwiazd * 0.7;
    gwiazdyDaleko.position.copy(kamera.position);
    gwiazdyDaleko.rotation.y += dt * 0.0035;
    gwiazdyBlisko.position.copy(kamera.position).multiplyScalar(0.88);

    renderer.render(scena, kamera);
  }
  animuj();

  /* — pauza, gdy karta przeglądarki nieaktywna (oszczędzanie baterii) — */
  function przyWidocznosci() {
    widoczna = document.visibilityState === "visible";
    if (widoczna) zegar.getDelta(); // zresetuj dt po pauzie
  }
  document.addEventListener("visibilitychange", przyWidocznosci);

  /* — dopasowanie rozmiaru — */
  const obserwator = new ResizeObserver(() => {
    const szer = pojemnik.clientWidth;
    const wys = pojemnik.clientHeight;
    if (!szer || !wys) return;
    kamera.aspect = szer / wys;
    kamera.updateProjectionMatrix();
    renderer.setSize(szer, wys);
  });
  obserwator.observe(pojemnik);

  return {
    ustawOkna(nowe: { a: number; b: number }[]) {
      if (nowe.length === PRZYSTANKI.length) okna = nowe;
    },
    liczbaPrzystankow: PRZYSTANKI.length,
    naPozycji(f: (pozycja: number) => void) {
      poinformujOPozycji = f;
      f(pozycjaPodrozy); // od razu podaj stan na starcie
    },
    zniszcz() {
      zniszczony = true;
      // jeśli pełna tekstura jeszcze się nie policzyła — odwołujemy
      // zlecenie, żeby nie liczyła się „w próżnię"
      if (dopieszczanie !== null) {
        const anuluj = (window as Window & { cancelIdleCallback?: (id: number) => void })
          .cancelIdleCallback;
        anuluj ? anuluj(dopieszczanie) : clearTimeout(dopieszczanie);
      }
      poinformujOPozycji = null;
      cancelAnimationFrame(klatka);
      obserwator.disconnect();
      document.removeEventListener("visibilitychange", przyWidocznosci);
      window.removeEventListener("mousemove", przyRuchuMyszy);
      scena.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
      tekstury.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
