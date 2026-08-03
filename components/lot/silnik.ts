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
  /** Podepnij funkcję, która dostanie numer przystanku, przy którym
      właśnie stoi (albo do którego leci) kamera — używa jej pasek
      podróży przy lewej krawędzi ekranu. */
  naPrzystanku: (f: (i: number) => void) => void;
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
     Pozycje dobrane tak, żeby przy kadrze hero (kamera niżej)
     układ wyglądał jak na produkcji: olbrzym z pierścieniami
     w prawej części ekranu, różowa planeta nad nim, słońce
     między tekstem a olbrzymem, turkusowa przy prawej krawędzi.
     ============================================================ */
  const SRODEK_OLBRZYMA = new THREE.Vector3(0.35, 0.1, 0);
  const POZ_ROZOWEJ = new THREE.Vector3(2.55, 1.89, -0.32);
  const POZ_TURKUSOWEJ = new THREE.Vector3(7.34, 0.23, -5.93);
  const POZ_SLONCA = new THREE.Vector3(-1.68, 3.26, -11.26);

  const R_OLBRZYM = 1.35;
  const R_KSIEZYC = 0.14; // duży księżyc — przystanek „Usługi"
  const R_ROZOWA = 0.52;
  const R_TURKUSOWA = 0.34;
  const R_SLONCE = 0.32;

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
  uklad.rotation.z = 0.16;
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
  const PRZECHYL = -1.18; // pochylenie pierścieni (rad)
  pierscienie.rotation.x = PRZECHYL;
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
     Każdy przystanek liczymy z geometrii: bierzemy środek ciała
     niebieskiego i cofamy kamerę wzdłuż wybranego kierunku
     o `mnoznik · promień`. Przy mnożniku ~1,55 tarcza wypełnia
     kadr, a w rogach zostaje skrawek kosmosu na panoramę.
     Kierunek podejścia dobrany tak, żeby kamera patrzyła na
     OŚWIETLONĄ stronę (światło pada z lewej-przedniej strony).
     ============================================================ */
  const STOPIEN = Math.PI / 180;

  type Przystanek = {
    /** środek ciała, na które patrzymy (może się ruszać — księżyc!) */
    srodek: () => THREE.Vector3;
    /** kierunek, z którego podchodzi kamera (znormalizowany) */
    kierunek: () => THREE.Vector3;
    /** odległość kamery od środka (liczona na bieżąco — zależy od
        wielkości, jaką ma mieć tarcza w kadrze, patrz `tarczaNa`) */
    dystans: () => number;
    fov: number;
    /** przechył kadru (roll) w radianach */
    obrot: number;
    /** GDZIE NA EKRANIE ma stanąć planeta — ułamki całego kadru,
        liczone od jego środka:
          x > 0 → planeta idzie w PRAWO,  x < 0 → w lewo,
          y > 0 → planeta idzie w DÓŁ,    y < 0 → do góry.
        Np. { x: 0.19, y: 0.20 } = „lekko w prawo i w dół".
        Dzięki temu treść sekcji ma nad planetą swój ciemny,
        spokojny kawałek kadru na tekst i karty. */
    kadr: { x: number; y: number };
  };

  /* Odległość, przy której tarcza o promieniu R zajmuje `ulamek`
     WYSOKOŚCI kadru. Liczymy z wysokości (a nie z szerokości), więc
     kompozycja wygląda tak samo na laptopie 16:9 i na szerokim
     monitorze 21:9 — na szerokim po prostu więcej kosmosu po bokach. */
  function tarczaNa(R: number, fov: number, ulamek: number) {
    return () => {
      // promień na ekranie = ulamek · wysokość → tangens kąta widzenia
      const kat = Math.atan(2 * ulamek * Math.tan((fov / 2) * STOPIEN));
      return R / Math.sin(kat);
    };
  }

  const staly = (v: THREE.Vector3) => () => v;
  const pomocniczy = new THREE.Vector3();
  const pomocniczy2 = new THREE.Vector3();
  const normalnaPierscieni = new THREE.Vector3();

  /* Kierunek podejścia do KSIĘŻYCA: od zewnątrz jego orbity,
     uniesiony ~38° nad płaszczyznę pierścieni. Dzięki temu kamera
     „skacze" tuż nad pierścieniami, księżyc jest w kadrze, a za nim
     rozciąga się wielka tarcza olbrzyma. */
  function kierunekKsiezyca(): THREE.Vector3 {
    ksiezyc.getWorldPosition(pomocniczy);
    pomocniczy.sub(SRODEK_OLBRZYMA).normalize(); // promieniowo, na zewnątrz
    pierscienie.getWorldDirection(normalnaPierscieni); // normalna pierścieni
    return pomocniczy
      .multiplyScalar(Math.cos(38 * STOPIEN))
      .addScaledVector(normalnaPierscieni, Math.sin(38 * STOPIEN))
      .normalize();
  }
  function srodekKsiezyca(): THREE.Vector3 {
    return ksiezyc.getWorldPosition(pomocniczy2);
  }

  /* Kierunek „od poprzedniego ciała" — lot jest wtedy naturalny:
     wylatujemy zza pleców jednego świata wprost na drugi. */
  const odPunktu = (skad: THREE.Vector3, dokad: THREE.Vector3) => {
    const v = new THREE.Vector3().subVectors(skad, dokad).normalize();
    return () => v;
  };

  const PRZYSTANKI: Przystanek[] = [
    // 0. HERO — szeroki plan całego układu (kadr jak na produkcji).
    //    Kamera patrzy prosto przed siebie, nie na konkretną planetę.
    //    NIC tu nie ruszamy — te liczby odtwarzają zdjęcie z produkcji.
    {
      srodek: staly(new THREE.Vector3(-1.343, 0.683, 0)),
      kierunek: staly(new THREE.Vector3(0, 0, 1)),
      dystans: () => 8.835,
      fov: 42,
      obrot: 0,
      kadr: { x: 0, y: 0 },
    },
    // 1. USŁUGI — duży KSIĘŻYC olbrzyma (+8°).
    //    Kadr: księżyc jak kamień leżący na dole PO PRAWEJ, za nim
    //    ciemne pasy chmur olbrzyma. Trzy karty usług dostają lewą
    //    i górną część kadru — nie zasłaniają kraterów.
    {
      srodek: srodekKsiezyca,
      kierunek: kierunekKsiezyca,
      dystans: tarczaNa(R_KSIEZYC, 52, 0.3),
      fov: 52,
      obrot: 8 * STOPIEN,
      kadr: { x: 0.26, y: 0.26 },
    },
    // 2. PORTFOLIO — OLBRZYM z pierścieniami (−6°).
    //    To NAJDŁUŻSZA sekcja (dużo dużych kart, treść przewija się
    //    przez cały ekran), więc kadr musi być SPOKOJNY i CIEMNY.
    //    Dlatego olbrzym jest tu daleko i nisko po prawej — jak
    //    widok z orbity: planeta w rogu, a przez dolną część kadru
    //    przechodzi łuk pierścieni. Reszta to czysty kosmos, na
    //    którym miniatury projektów wreszcie dobrze widać.
    {
      srodek: staly(SRODEK_OLBRZYMA),
      kierunek: staly(new THREE.Vector3(-0.6, 0.35, 0.72).normalize()),
      dystans: tarczaNa(R_OLBRZYM, 46, 0.3),
      fov: 46,
      obrot: -6 * STOPIEN,
      kadr: { x: 0.3, y: 0.44 },
    },
    // 3. PROCES — TURKUSOWA planeta (+12°).
    //    Kadr: planeta zsunięta tak nisko, że jej brzeg staje się
    //    HORYZONTEM w dolnej 1/3 ekranu. Cztery kroki współpracy
    //    stoją nad nim jak drogowskazy na powierzchni obcego świata.
    {
      srodek: staly(POZ_TURKUSOWEJ),
      kierunek: odPunktu(SRODEK_OLBRZYMA, POZ_TURKUSOWEJ),
      dystans: tarczaNa(R_TURKUSOWA, 52, 0.58),
      fov: 52,
      obrot: 12 * STOPIEN,
      kadr: { x: 0.06, y: 0.7 },
    },
    // 4. OPINIE — RÓŻOWA planeta (−8°).
    //    Kadr: planeta wschodzi z dołu PO LEWEJ jak duża kula.
    //    Karty z opiniami zostają w górnej, ciemnoróżowej części nieba.
    {
      srodek: staly(POZ_ROZOWEJ),
      kierunek: odPunktu(POZ_TURKUSOWEJ, POZ_ROZOWEJ),
      dystans: tarczaNa(R_ROZOWA, 52, 0.46),
      fov: 52,
      obrot: -8 * STOPIEN,
      kadr: { x: -0.24, y: 0.52 },
    },
    // 5. KONTAKT — FINAŁ: WSCHÓD SŁOŃCA (+10°).
    //    Kadr: tarcza słońca nisko na środku, tuż pod kartą CTA —
    //    światło bije spod niej do góry. Góra kadru zostaje ciemna,
    //    więc nagłówek jest czytelny, a scena ma kulminację.
    {
      srodek: staly(POZ_SLONCA),
      kierunek: odPunktu(POZ_ROZOWEJ, POZ_SLONCA),
      dystans: tarczaNa(R_SLONCE, 52, 0.3),
      fov: 52,
      obrot: 10 * STOPIEN,
      kadr: { x: 0.02, y: 0.54 },
    },
  ];

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

  // ŁUKI PRZEJŚĆ — jak mocno trasa wygina się w górę/w bok między
  // przystankami (to daje „zoom out → przelot → zoom in") oraz
  // o ile stopni rozszerza się fov w połowie lotu. Znaki na przemian
  // = każdy odcinek wygląda inaczej, trasa nie jest monotonna.
  const LUKI = [
    { gora: 1.6, bok: 0.9, fov: 12 },   // hero → usługi (księżyc)
    { gora: 3.4, bok: 1.7, fov: 15 },   // usługi → portfolio (olbrzym)
    { gora: 2.4, bok: -1.6, fov: 13 },  // portfolio → proces (turkusowa)
    { gora: -2.0, bok: -2.2, fov: 16 }, // proces → opinie (różowa)
    { gora: 2.6, bok: 1.5, fov: 14 },   // opinie → kontakt (słońce)
  ];

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
    return out.copy(p.srodek()).addScaledVector(p.kierunek(), p.dystans());
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
      pozycjaPrzystanku(a, bufPoz);
      bufCel.copy(PRZYSTANKI[a].srodek());
      kamera.fov = PRZYSTANKI[a].fov;
      przechylKadru = PRZYSTANKI[a].obrot;
      kadrX = PRZYSTANKI[a].kadr.x;
      kadrY = PRZYSTANKI[a].kadr.y;
    } else {
      const t = filmowe(surowe);
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

  /* Przy każdym postoju sekcja podaje na zewnątrz swój numer —
     korzysta z tego pasek podróży (kropki przy lewej krawędzi
     w components/lot/LotSekcja.tsx). Zastąpił on wcześniejsze
     „kule sąsiadów" w rogach kadru: te wyglądały jak brud na
     obiektywie, a pasek mówi to samo — gdzie jesteś w podróży —
     tylko czytelnie i świadomie. */
  let poinformujOPrzystanku: ((i: number) => void) | null = null;
  let ostatnioZgloszony = -1;

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
  // Promienie orbit z produkcji: księżyc zawsze POZA planetą (1.35),
  // drugi krąży dalej i szybciej, żeby się nigdy nie mijały.
  const R_ORBITY = 1.95;
  const R_ORBITY2 = 2.35;

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

    // powiadom pasek podróży, gdy zmieni się przystanek
    if (aktywnyPrzystanek !== ostatnioZgloszony) {
      ostatnioZgloszony = aktywnyPrzystanek;
      poinformujOPrzystanku?.(aktywnyPrzystanek);
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
    naPrzystanku(f: (i: number) => void) {
      poinformujOPrzystanku = f;
      f(aktywnyPrzystanek); // od razu podaj stan na starcie
    },
    zniszcz() {
      poinformujOPrzystanku = null;
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
