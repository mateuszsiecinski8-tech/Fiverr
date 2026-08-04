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

/* Księżyc: baza + delikatne kratery (ciemniejsze kółka z cienkim
   jasnym rantem od strony światła, żeby wyglądały na wklęsłe).
   Rozdzielczość 512 — przy „lądowaniu" w sekcji Usługi księżyc
   wypełnia większość kadru, więc potrzebuje więcej detalu. */
function namalujKsiezyc(kolorBazowy: string, ileKraterow = 46): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = kolorBazowy;
  ctx.fillRect(0, 0, 512, 512);
  // miękkie plamy — subtelna zmienność powierzchni
  ctx.save();
  ctx.filter = "blur(14px)";
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(120,112,150,${(0.05 + Math.random() * 0.07).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 30 + Math.random() * 90, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  for (let i = 0; i < ileKraterow; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 8 + Math.random() * 30;
    const cien = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
    cien.addColorStop(0, "rgba(50,45,80,0.5)");
    cien.addColorStop(0.75, "rgba(50,45,80,0.18)");
    cien.addColorStop(1, "rgba(50,45,80,0)");
    ctx.fillStyle = cien;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // cienki jasny rant (górna-lewa krawędź krateru „łapie" światło)
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = Math.max(1, r * 0.1);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.94, Math.PI * 0.65, Math.PI * 1.55);
    ctx.stroke();
  }
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

  // księżyc GŁÓWNY (jaśniejszy) — to na nim „ląduje" sekcja Usługi
  const plotnoKsiezyca = namalujKsiezyc("#e8e4ff");
  const ksiezyc = new THREE.Mesh(
    new THREE.SphereGeometry(R_KSIEZYC, 64, 64),
    new THREE.MeshStandardMaterial({
      map: tekstura(plotnoKsiezyca),
      roughness: 0.6,
      emissive: 0x2a2540,
    })
  );
  uklad.add(ksiezyc);

  // drugi, MNIEJSZY księżyc — ta sama płaszczyzna orbity, własny
  // promień i tempo, żeby księżyce nigdy się nie mijały
  const ksiezyc2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 32, 32),
    new THREE.MeshStandardMaterial({
      map: tekstura(namalujKsiezyc("#d3cdf2", 24)),
      roughness: 0.6,
      emissive: 0x241f3a,
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
  const ksiezycTurkusowej = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 24, 24),
    new THREE.MeshStandardMaterial({
      map: tekstura(namalujKsiezyc("#d7e8e5", 14)),
      roughness: 0.7,
      emissive: 0x1d3a38,
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
    new THREE.SphereGeometry(R_SLONCE, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xfffdf2 })
  );
  slonce.position.copy(POZ_SLONCA);
  scena.add(slonce);
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
  halo.scale.set(5.2, 5.2, 1);
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
