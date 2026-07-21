// ============================================================
// SILNIK LOTU (eksperyment „ZUI Space Scroll")
//
// Jedna, CIĄGŁA scena kosmiczna na pełnym ekranie. Scroll strony
// steruje pozycją kamery (funkcja ustawPostep 0–1), a kamera leci
// po zaplanowanej trasie: szeroki widok układu → podejście →
// lądowanie na księżycu fioletowej planety.
//
// Skąd „kinowy" wygląd (inspiracja: zdjęcia ISS/NASA):
//  • BLOOM (post-processing) — jasne rzeczy „rozlewają" światło,
//  • LENS FLARE przy słońcu (moduł Three.js),
//  • RIM LIGHT — własny shader Fresnela: świecąca obwódka
//    atmosfery na krawędzi każdej planety,
//  • GĘSTE POLE GWIAZD (dwie warstwy — bliższa daje paralaksę),
//  • filmowe mapowanie tonów ACES + wyższy kontrast.
//
// Ten plik NIE dotyka Reacta — czysty Three.js. Komponent
// LotSekcja.tsx importuje go dynamicznie (tylko desktop).
// ============================================================

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/* ============ MALOWANIE TEKSTUR (canvas 2D — zero plików) ============ */

/* --- POMOCNIK: faliste, ROZMYTE pasmo chmur (okresowe — bez szwu).
   Rysujemy z ctx.filter = blur(...), więc pasma mają miękkie,
   warstwowe przejścia zamiast ostrych, „tanich" krawędzi. --- */
function pasmoChmur(
  ctx: CanvasRenderingContext2D,
  szer: number,
  y: number,
  wys: number,
  kolor: string,
  rozmycie: number,
  cykle: number,
  faza: number,
  amplituda: number
) {
  ctx.save();
  ctx.filter = `blur(${rozmycie}px)`;
  ctx.fillStyle = kolor;
  const fala = (x: number) => Math.sin((x / szer) * Math.PI * 2 * cykle + faza) * amplituda;
  ctx.beginPath();
  for (let x = -40; x <= szer + 40; x += 24) {
    x === -40 ? ctx.moveTo(x, y + fala(x)) : ctx.lineTo(x, y + fala(x));
  }
  for (let x = szer + 40; x >= -40; x -= 24) ctx.lineTo(x, y + wys + fala(x));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* Gazowy olbrzym — żywe fiolety i róże, kilka WARSTW miękkich chmur. */
function namalujPlanete(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 1024;
  const ctx = c.getContext("2d")!;
  // baza: nasycony pionowy gradient pasów
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0.0, "#332075");
  grad.addColorStop(0.16, "#6247e8");
  grad.addColorStop(0.32, "#9b7ffd");
  grad.addColorStop(0.45, "#e07ef2");
  grad.addColorStop(0.57, "#ffa9e2");
  grad.addColorStop(0.68, "#7e63ff");
  grad.addColorStop(0.84, "#46309f");
  grad.addColorStop(1.0, "#271b60");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  // WARSTWA 1: szerokie, mocno rozmyte pasma (duże masy chmur)
  for (let i = 0; i < 9; i++) {
    const y = (i / 9) * 1024 + Math.random() * 60;
    pasmoChmur(
      ctx, 2048, y, 40 + Math.random() * 90,
      i % 2 ? "rgba(255,235,250,0.10)" : "rgba(40,20,90,0.12)",
      26, 2 + (i % 2), i * 2.3, 26
    );
  }
  // WARSTWA 2: średnie smugi (struktura pasów)
  for (let i = 0; i < 22; i++) {
    const y = Math.random() * 1024;
    pasmoChmur(
      ctx, 2048, y, 8 + Math.random() * 26,
      `rgba(255,255,255,${0.05 + Math.random() * 0.07})`,
      10, 2 + (i % 3), i * 1.7, 15
    );
  }
  // WARSTWA 3: cienkie, ledwo rozmyte nitki (detal z bliska — Portfolio)
  for (let i = 0; i < 26; i++) {
    const y = Math.random() * 1024;
    pasmoChmur(
      ctx, 2048, y, 2 + Math.random() * 6,
      `rgba(255,240,252,${0.04 + Math.random() * 0.05})`,
      2.5, 3 + (i % 3), i * 2.9, 9
    );
  }
  // turkusowe burze — owalne, miękkie, owinięte przez szew
  ctx.save();
  ctx.filter = "blur(7px)";
  for (let i = 0; i < 12; i++) {
    const cx = Math.random() * 2048;
    const cy = 240 + Math.random() * 560;
    const rx = 46 + Math.random() * 110;
    const ry = 13 + Math.random() * 22;
    ctx.fillStyle = `rgba(64,224,208,${0.07 + Math.random() * 0.1})`;
    for (const przesun of [-2048, 0, 2048]) {
      ctx.beginPath();
      ctx.ellipse(cx + przesun, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // jaśniejsze „oko" burzy
      ctx.fillStyle = `rgba(210,255,250,${0.05 + Math.random() * 0.05})`;
      ctx.beginPath();
      ctx.ellipse(cx + przesun - rx * 0.2, cy - ry * 0.2, rx * 0.45, ry * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(64,224,208,${0.07 + Math.random() * 0.1})`;
    }
  }
  ctx.restore();
  return c;
}

/* Różowa planeta — żywy róż, warstwowe miękkie pasy (widok z orbity). */
function namalujRozowa(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.0, "#c2337e");
  g.addColorStop(0.28, "#ff64ab");
  g.addColorStop(0.5, "#ffa2d0");
  g.addColorStop(0.64, "#ffc4e2");
  g.addColorStop(0.8, "#f45c9f");
  g.addColorStop(1.0, "#a52c6b");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 7; i++) {
    pasmoChmur(
      ctx, 1024, (i / 7) * 512 + Math.random() * 40, 18 + Math.random() * 44,
      i % 2 ? "rgba(255,240,250,0.14)" : "rgba(150,30,90,0.12)",
      14, 2 + (i % 2), i * 2.1, 12
    );
  }
  for (let i = 0; i < 14; i++) {
    pasmoChmur(
      ctx, 1024, Math.random() * 512, 3 + Math.random() * 9,
      `rgba(255,235,248,${0.06 + Math.random() * 0.08})`,
      3, 2 + (i % 3), i * 1.9, 7
    );
  }
  return c;
}

/* Turkusowa planeta — żywy niebiesko-turkusowy (prośba właściciela). */
function namalujTurkusowa(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.0, "#0a4a6e");
  g.addColorStop(0.25, "#1489b8");
  g.addColorStop(0.45, "#2fc4d8");
  g.addColorStop(0.6, "#63e2ea");
  g.addColorStop(0.75, "#17a3c4");
  g.addColorStop(1.0, "#083d5e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 7; i++) {
    pasmoChmur(
      ctx, 1024, (i / 7) * 512 + Math.random() * 40, 16 + Math.random() * 40,
      i % 2 ? "rgba(230,255,255,0.13)" : "rgba(8,50,90,0.14)",
      14, 2 + (i % 2), i * 2.4, 12
    );
  }
  for (let i = 0; i < 14; i++) {
    pasmoChmur(
      ctx, 1024, Math.random() * 512, 3 + Math.random() * 8,
      `rgba(235,255,255,${0.06 + Math.random() * 0.08})`,
      3, 2 + (i % 3), i * 2.2, 7
    );
  }
  return c;
}

/* Pierścienie — pas 57–100% promienia tekstury (patrz KONTEKST.md). */
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

/* Księżyc STACJA — GŁADKA, prosta tekstura (wzór: małe księżyce ze
   starszej wersji hero). Jasny regolit, miękkie plamy, delikatne
   kratery BEZ ostrych rantów. Zwraca [kolor, mapa nierówności]. */
function namalujKsiezycLadowania(): [HTMLCanvasElement, HTMLCanvasElement] {
  const R = 1024;
  const kolor = document.createElement("canvas");
  kolor.width = R;
  kolor.height = R / 2;
  const kc = kolor.getContext("2d")!;
  const bump = document.createElement("canvas");
  bump.width = R;
  bump.height = R / 2;
  const bc = bump.getContext("2d")!;

  // baza: jasna, chłodna szarość z lekkim fioletem (jak d3cdf2 małych księżyców)
  const g = kc.createLinearGradient(0, 0, 0, R / 2);
  g.addColorStop(0, "#ccc7e0");
  g.addColorStop(0.5, "#bdb8d4");
  g.addColorStop(1, "#aca7c6");
  kc.fillStyle = g;
  kc.fillRect(0, 0, R, R / 2);
  bc.fillStyle = "#808080"; // neutralna wysokość
  bc.fillRect(0, 0, R, R / 2);

  // miękkie, rozmyte plamy — subtelna zmienność powierzchni
  kc.save();
  kc.filter = "blur(9px)";
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * R;
    const y = Math.random() * (R / 2);
    const r = 40 + Math.random() * 130;
    kc.fillStyle = `rgba(96,90,124,${0.05 + Math.random() * 0.06})`;
    for (const dx of [-R, 0, R]) {
      kc.beginPath();
      kc.arc(x + dx, y, r, 0, Math.PI * 2);
      kc.fill();
    }
  }
  kc.restore();

  // delikatne kratery: tylko miękki cień (bez białych obwódek)
  kc.save();
  kc.filter = "blur(4px)";
  bc.save();
  bc.filter = "blur(3px)";
  for (let i = 0; i < 42; i++) {
    const x = Math.random() * R;
    const y = Math.random() * (R / 2);
    const r = 6 + Math.random() * 22;
    for (const dx of [-R, 0, R]) {
      kc.fillStyle = "rgba(70,64,96,0.16)";
      kc.beginPath();
      kc.arc(x + dx, y, r, 0, Math.PI * 2);
      kc.fill();
      bc.fillStyle = "rgba(0,0,0,0.28)";
      bc.beginPath();
      bc.arc(x + dx, y, r, 0, Math.PI * 2);
      bc.fill();
    }
  }
  kc.restore();
  bc.restore();
  return [kolor, bump];
}

/* Mały księżyc na orbicie (drobne kratery). */
function namalujKsiezyc(kolorBazowy: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = kolorBazowy;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 24; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 5 + Math.random() * 16;
    const cien = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
    cien.addColorStop(0, "rgba(50,45,80,0.5)");
    cien.addColorStop(0.75, "rgba(50,45,80,0.18)");
    cien.addColorStop(1, "rgba(50,45,80,0)");
    ctx.fillStyle = cien;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

/* ============ SHADER ATMOSFERY (rim light Fresnela) ============ */
/* Cienka, świecąca obwódka na krawędzi kuli — jak atmosfera Ziemi
   na zdjęciach z orbity. Additive = dodaje światło do tła. */
function atmosfera(promien: number, kolor: THREE.Color, sila = 1.0): THREE.Mesh {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    uniforms: {
      uKolor: { value: kolor },
      uSila: { value: sila },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormalW;
      varying vec3 vPozW;
      void main() {
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vec4 poz = modelMatrix * vec4(position, 1.0);
        vPozW = poz.xyz;
        gl_Position = projectionMatrix * viewMatrix * poz;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uKolor;
      uniform float uSila;
      varying vec3 vNormalW;
      varying vec3 vPozW;
      void main() {
        vec3 doKamery = normalize(cameraPosition - vPozW);
        // 1 na krawędzi kuli, 0 na środku tarczy — wysoki wykładnik
        // ściska poświatę do CIENKIEJ obwódki (bez efektu szklanej bańki)
        float rim = pow(1.0 - abs(dot(doKamery, normalize(vNormalW))), 3.8);
        gl_FragColor = vec4(uKolor, rim * uSila);
      }
    `,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(promien * 1.02, 48, 48), mat);
}

/* Miękki, świecący punkt (sprite gwiazdy i poświat). */
function namalujPoswiate(rgb: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, `rgba(${rgb},0.85)`);
  g.addColorStop(0.35, `rgba(${rgb},0.25)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return c;
}

/* Powierzchnia słońca — gorący żółto-biały rdzeń z miękką granulacją
   (plamy cieplejszego i chłodniejszego złota), żeby tarcza nie była
   płaska. Bloom rozświetli najjaśniejsze punkty. */
function namalujSlonce(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff2cf";
  ctx.fillRect(0, 0, 512, 256);
  ctx.save();
  ctx.filter = "blur(5px)";
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = 5 + Math.random() * 24;
    const goraco = Math.random() < 0.5;
    ctx.fillStyle = goraco
      ? `rgba(255,255,248,${(0.05 + Math.random() * 0.14).toFixed(3)})`
      : `rgba(255,188,86,${(0.05 + Math.random() * 0.16).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return c;
}

/* Korona/łuna słońca — gładki, realistyczny spadek jasności od
   gorącego rdzenia do ciepłego, zanikającego brzegu. */
function namalujKorone(stops: [number, string][]): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  for (const [p, kol] of stops) g.addColorStop(p, kol);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return c;
}

/* ============ POLE GWIAZD ============ */
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
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

/* ============ KSIĘŻYC STACJA (gładka kula, miękki detal) ============ */
/* Bez rzeźbienia wierzchołków — czysty, równy kontur jak małe
   księżyce w starszej wersji hero. Detal robi delikatny bump. */
function zrobKsiezycLadowania(promien: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(promien, 96, 96);
  const [kolor, bump] = namalujKsiezycLadowania();
  const tKolor = new THREE.CanvasTexture(kolor);
  tKolor.colorSpace = THREE.SRGBColorSpace;
  const tBump = new THREE.CanvasTexture(bump);
  const mat = new THREE.MeshStandardMaterial({
    map: tKolor,
    bumpMap: tBump,
    bumpScale: 0.5,
    roughness: 0.95,
    metalness: 0.0,
  });
  return new THREE.Mesh(geo, mat);
}

/* ============ GŁÓWNA FUNKCJA — budowa świata ============ */

export type SilnikLotu = {
  /** Postęp podróży 0–1 (od ScrollTriggera). */
  ustawPostep: (p: number) => void;
  /** Okna postoju przy przystankach (ułamki 0–1 scrolla) — po jednym
      na sekcję: hero, usługi, portfolio, proces, opinie, kontakt. */
  ustawOkna: (nowe: { a: number; b: number }[]) => void;
  /** Ile przystanków ma trasa (do kontroli w LotSekcja). */
  liczbaPrzystankow: number;
  /** Posprzątaj wszystko (unmount). */
  zniszcz: () => void;
};

export function zbudujLot(pojemnik: HTMLDivElement): SilnikLotu {
  /* — renderer + kolor filmowy — */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(pojemnik.clientWidth, pojemnik.clientHeight);
  // BEZ filmowego mapowania tonów — produkcyjna scena hero renderowała
  // kolory liniowo i planety wyglądały żywiej (fiolet zamiast granatu).
  renderer.toneMapping = THREE.NoToneMapping;
  pojemnik.appendChild(renderer.domElement);

  const scena = new THREE.Scene();
  scena.background = new THREE.Color(0x030308); // głęboki kosmos, nie czysta czerń
  const kamera = new THREE.PerspectiveCamera(
    45,
    pojemnik.clientWidth / pojemnik.clientHeight,
    0.02,
    260
  );

  /* — światła: słońce jest głównym źródłem (dramatyzm), ambient tylko
     dopełnia cienie, żeby planety nie były czarne — */
  // Zestaw świateł PRZENIESIONY z produkcyjnej sceny hero (Scena3D) —
  // to on dawał planetom żywy fiolet zamiast granatowych cieni:
  scena.add(new THREE.AmbientLight(0xffffff, 0.5));
  const swiatloGlowne = new THREE.DirectionalLight(0xffffff, 2.2);
  swiatloGlowne.position.set(-4, 2.5, 3);
  scena.add(swiatloGlowne);
  // Słońce w tle zostaje jako ciepły „backlight" (decay 0 = stała jasność)
  const POZ_SLONCA = new THREE.Vector3(-14, 9, -30);
  const swiatloSlonca = new THREE.PointLight(0xfff2d8, 1.2, 0, 0);
  swiatloSlonca.position.copy(POZ_SLONCA);
  scena.add(swiatloSlonca);

  /* — pole gwiazd (daleka kopuła + bliższa warstwa dla paralaksy) — */
  const gwiazdyDaleko = poleGwiazd(6500, 60, 110, 0.62);
  const gwiazdyBlisko = poleGwiazd(700, 18, 45, 0.34);
  scena.add(gwiazdyDaleko, gwiazdyBlisko);

  /* — SŁOŃCE: rozżarzona kula + dwuwarstwowa korona — */
  // BEZ modułu Lensflare (jego test zasłonięcia zostawiał czarny kwadrat
  // na planecie). Realizm robią: gorąca tekstura tarczy, ciasny jasny
  // rdzeń korony, szeroka miękka łuna i bloom.
  const tSlonce = new THREE.CanvasTexture(namalujSlonce());
  tSlonce.colorSpace = THREE.SRGBColorSpace;
  const slonce = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 48, 48),
    new THREE.MeshBasicMaterial({ map: tSlonce, toneMapped: false })
  );
  slonce.position.copy(POZ_SLONCA);
  scena.add(slonce);
  // szeroka, miękka łuna (główny „realistyczny" blask wokół tarczy)
  const koronaLuna = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(
        namalujKorone([
          [0, "rgba(255,248,228,0.75)"],
          [0.08, "rgba(255,240,205,0.5)"],
          [0.2, "rgba(255,222,158,0.24)"],
          [0.42, "rgba(255,196,112,0.09)"],
          [0.7, "rgba(255,178,96,0.025)"],
          [1, "rgba(255,178,96,0)"],
        ])
      ),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  koronaLuna.scale.set(15, 15, 1);
  koronaLuna.position.copy(POZ_SLONCA);
  scena.add(koronaLuna);
  // ciasny, gorący rdzeń tuż przy tarczy (ostry, jasny pierścień światła)
  const koronaRdzen = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(
        namalujKorone([
          [0, "rgba(255,252,244,0.95)"],
          [0.28, "rgba(255,244,214,0.45)"],
          [0.6, "rgba(255,226,168,0.12)"],
          [1, "rgba(255,226,168,0)"],
        ])
      ),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  koronaRdzen.scale.set(4.2, 4.2, 1);
  koronaRdzen.position.copy(POZ_SLONCA);
  scena.add(koronaRdzen);

  /* — FIOLETOWA PLANETA z pierścieniami (serce układu) — */
  const uklad = new THREE.Group();
  uklad.position.set(0, 0.2, 0);
  uklad.rotation.z = 0.16;
  scena.add(uklad);

  const tPlaneta = new THREE.CanvasTexture(namalujPlanete());
  tPlaneta.colorSpace = THREE.SRGBColorSpace;
  const planeta = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 96, 96),
    new THREE.MeshStandardMaterial({ map: tPlaneta, roughness: 0.85, metalness: 0.05 })
  );
  uklad.add(planeta);
  uklad.add(atmosfera(1.35, new THREE.Color(0x8b7cf7), 0.6));

  const tPierscienie = new THREE.CanvasTexture(namalujPierscienie());
  tPierscienie.anisotropy = 8; // ostre pasma pierścieni także pod ostrym kątem
  const pierscienie = new THREE.Mesh(
    new THREE.RingGeometry(1.6, 2.7, 160),
    new THREE.MeshBasicMaterial({
      map: tPierscienie,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const PRZECHYL = -1.18;
  pierscienie.rotation.x = PRZECHYL;
  uklad.add(pierscienie);

  /* — dwa księżyce przy pierścieniach (oba swobodnie orbitują) — */
  const ksiezycStacja = zrobKsiezycLadowania(0.2);
  uklad.add(ksiezycStacja);
  const PROMIEN_STACJI = 1.9505; // promień orbity (przy pierścieniach)
  let katStacja = -0.9; // pozycja startowa — widoczny w kadrze hero
  // drugi księżyc normalnie krąży (życie w kadrze hero)
  const tK2 = new THREE.CanvasTexture(namalujKsiezyc("#d3cdf2"));
  tK2.colorSpace = THREE.SRGBColorSpace;
  const ksiezycMaly2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 28, 28),
    new THREE.MeshStandardMaterial({ map: tK2, roughness: 0.9 })
  );
  uklad.add(ksiezycMaly2);

  /* — RÓŻOWA i TURKUSOWA planeta (dalsze przystanki — na razie tło) — */
  const tRoz = new THREE.CanvasTexture(namalujRozowa());
  tRoz.colorSpace = THREE.SRGBColorSpace;
  const rozowa = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 64, 64),
    new THREE.MeshStandardMaterial({ map: tRoz, roughness: 0.8 })
  );
  // Różowa — w górnym prawym rejonie kadru hero (jak w starszej,
  // czystszej wersji strony). BEZ wielkiej mgławicowej poświaty —
  // tylko cienki rim atmosfery na krawędzi (styl zdjęć z orbity).
  rozowa.position.set(5.8, 2.6, -7);
  scena.add(rozowa);
  const atmoRoz = atmosfera(0.9, new THREE.Color(0xff6fb2), 0.9);
  atmoRoz.position.copy(rozowa.position);
  scena.add(atmoRoz);

  // Turkusowa — MAŁY, ODLEGŁY punkt przy prawej krawędzi kadru hero
  // (daleko za pierścieniami — niczego nie zasłania), z własnym
  // mini-księżycem na orbicie. Też bez mgławicowej aury.
  const tTurk = new THREE.CanvasTexture(namalujTurkusowa());
  tTurk.colorSpace = THREE.SRGBColorSpace;
  const turkusowa = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64),
    new THREE.MeshStandardMaterial({ map: tTurk, roughness: 0.8 })
  );
  turkusowa.position.set(8.2, -0.2, -6.5);
  scena.add(turkusowa);
  const atmoTurk = atmosfera(0.5, new THREE.Color(0x37c8dc), 0.8);
  atmoTurk.position.copy(turkusowa.position);
  scena.add(atmoTurk);
  // mini-księżyc turkusowej (jak w produkcyjnych Ozdobach 3D)
  const tKt = new THREE.CanvasTexture(namalujKsiezyc("#cfe9e4"));
  tKt.colorSpace = THREE.SRGBColorSpace;
  const ksiezycTurkusowej = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 24, 24),
    new THREE.MeshStandardMaterial({ map: tKt, roughness: 0.9 })
  );
  scena.add(ksiezycTurkusowej);

  /* — POST-PROCESSING: bloom (kinowe „rozlewanie" światła) — */
  // WAŻNE dla jakości: własny render target z MSAA (samples: 4).
  // Domyślny target composera NIE ma antyaliasingu — to przez niego
  // krawędzie planet wyglądały na postrzępione.
  const celRenderu = new THREE.WebGLRenderTarget(
    pojemnik.clientWidth,
    pojemnik.clientHeight,
    { samples: 4, type: THREE.HalfFloatType }
  );
  const composer = new EffectComposer(renderer, celRenderu);
  composer.addPass(new RenderPass(scena, kamera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(pojemnik.clientWidth, pojemnik.clientHeight),
    0.6, // siła
    0.5, // promień
    0.88 // próg — świeci tylko to, co naprawdę jasne (słońce, rimy)
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ============ TRASA KAMERY — 6 PRZYSTANKÓW (pełne ZUI) ============ */
  // Każda sekcja strony ma swój przystanek. Kamera STOI w „oknie"
  // przystanku (gdy czytasz sekcję) i LECI między oknami (przerwy
  // między sekcjami). Okna wyznacza LotSekcja z realnego układu strony.
  // KAŻDY przystanek (poza hero) to NURKOWANIE W PLANETĘ: kamera
  // podlatuje tak blisko, że tarcza wypełnia CAŁY kadr (łącznie
  // z rogami) i planeta staje się tłem sekcji. Odległości dobrane
  // z geometrii (d < 1.48·promień przy fov 52), a proste odcinki
  // lotu między przystankami NIE przecinają żadnej kuli.
  const POZY = [
    // 0. HERO — szeroki plan układu (BEZ ZMIAN — otwarty kosmos)
    { poz: new THREE.Vector3(-2.0, 0.9, 8.4), cel: new THREE.Vector3(-1.2, 0.35, 0), fov: 45 },
    // 1. USŁUGI — nurkowanie w fioletową planetę (przednia strona)
    { poz: new THREE.Vector3(0.88, 0.568, 1.467), cel: new THREE.Vector3(0, 0.2, 0), fov: 52 },
    // 2. PORTFOLIO — ta sama planeta, inny wycinek (prawa strona)
    { poz: new THREE.Vector3(1.447, -0.104, 0.838), cel: new THREE.Vector3(0, 0.2, 0), fov: 52 },
    // 3. PROCES — nurkowanie w turkusową
    { poz: new THREE.Vector3(7.861, -0.082, -5.958), cel: new THREE.Vector3(8.2, -0.2, -6.5), fov: 52 },
    // 4. OPINIE — nurkowanie w różową (pozycja boczna — tak, żeby lot
    //    z turkusowej i dalej do słońca omijał kulę planety)
    { poz: new THREE.Vector3(4.983, 1.995, -6.465), cel: new THREE.Vector3(5.8, 2.6, -7), fov: 52 },
    // 5. KONTAKT — finał: wlot w tarczę słońca (jasność wypełnia kadr)
    { poz: new THREE.Vector3(-13.333, 8.767, -28.733), cel: new THREE.Vector3(-14, 9, -30), fov: 52 },
  ];
  // Domyślne okna postoju (nadpisywane przez ustawOkna po zmierzeniu strony)
  let okna: { a: number; b: number }[] = POZY.map((_, i) => ({
    a: i / POZY.length,
    b: (i + 0.6) / POZY.length,
  }));

  const gladkie = (t: number) => t * t * (3 - 2 * t); // smoothstep

  let postep = 0; // cel (od scrolla)
  let postepPlynny = 0; // wygładzony (kamera nie szarpie)
  const mysz = { x: 0, y: 0 }; // parallax kursora
  const myszPlynna = { x: 0, y: 0 };

  function przyRuchuMyszy(e: MouseEvent) {
    mysz.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mysz.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }
  window.addEventListener("mousemove", przyRuchuMyszy);

  const cel = new THREE.Vector3();
  const pozKamery = new THREE.Vector3();

  function ustawKamere(p: number, czas: number) {
    // gdzie jesteśmy: w oknie przystanku (kamera stoi) czy w locie?
    let a = POZY.length - 1;
    let lok = 0; // 0 = jesteśmy w przystanku a; 0–1 = lot do a+1
    for (let i = 0; i < okna.length; i++) {
      if (p <= okna[i].b) {
        if (p >= okna[i].a || i === 0) {
          a = i;
          lok = 0;
        } else {
          a = i - 1;
          lok = gladkie((p - okna[i - 1].b) / (okna[i].a - okna[i - 1].b));
        }
        break;
      }
    }
    const b = Math.min(a + 1, POZY.length - 1);

    pozKamery.lerpVectors(POZY[a].poz, POZY[b].poz, lok);
    cel.lerpVectors(POZY[a].cel, POZY[b].cel, lok);
    kamera.fov = POZY[a].fov + (POZY[b].fov - POZY[a].fov) * lok;

    // delikatny „oddech" + parallax myszy (pełny tylko w hero)
    const luz = a === 0 && lok === 0 ? 1 : 0.35;
    pozKamery.x += Math.sin(czas * 0.23) * 0.045 * luz + myszPlynna.x * 0.09 * luz;
    pozKamery.y += Math.cos(czas * 0.19) * 0.035 * luz - myszPlynna.y * 0.07 * luz;

    kamera.position.copy(pozKamery);
    kamera.lookAt(cel);
    kamera.updateProjectionMatrix();
  }

  /* ============ SPADAJĄCA GWIAZDA (tylko w hero) ============ */
  // Subtelna smuga światła przelatująca cyklicznie przez PUSTĄ część
  // nieba (górny środek kadru) — omija słońce, planety i tekst.
  function namalujSmuge(): HTMLCanvasElement {
    // Styl ze starszej wersji strony: CIENKA, elegancka smużka —
    // zwężający się ogon i mała, jasna główka. Bez wielkiego blasku.
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 64;
    const ctx = c.getContext("2d")!;
    ctx.save();
    ctx.filter = "blur(1.6px)";
    for (let i = 0; i <= 70; i++) {
      const t = i / 70; // 0 = koniec ogona … 1 = głowa
      const x = 20 + t * 452;
      const r = 0.4 + t * t * 3.0;
      ctx.fillStyle = `rgba(255,252,246,${(0.015 + t * t * 0.34).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, 32, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // mała główka — jasny punkt z krótką poświatą
    const gl = ctx.createRadialGradient(472, 32, 0, 472, 32, 14);
    gl.addColorStop(0, "rgba(255,255,255,0.9)");
    gl.addColorStop(0.3, "rgba(255,248,235,0.4)");
    gl.addColorStop(1, "rgba(255,248,235,0)");
    ctx.fillStyle = gl;
    ctx.fillRect(452, 12, 40, 40);
    return c;
  }
  const smugaMat = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(namalujSmuge()),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const smuga = new THREE.Sprite(smugaMat);
  smuga.scale.set(3.0, 0.375, 1); // proporcje tekstury 512:64
  smuga.visible = false;
  scena.add(smuga);
  const gwiazdaStart = new THREE.Vector3();
  const gwiazdaKontrol = new THREE.Vector3(); // punkt łuku (tor zakrzywiony)
  const gwiazdaKoniec = new THREE.Vector3();
  const gwPunkt = new THREE.Vector3();
  const gwPrzod = new THREE.Vector3();
  let gwiazdaZegar = 4; // pierwszy przelot ~4 s po wejściu na stronę
  const GWIAZDA_CO = 9; // kolejne co ~9 s (cyklicznie, ale rzadko)
  const GWIAZDA_TRWA = 1.5;

  function planujGwiazde() {
    // trasa liczona z AKTUALNEJ kamery: od punktu ekranu (42%, 15%)
    // do (66%, 32%) — pusty pas nieba między słońcem a planetami
    const naSwiat = (nx: number, ny: number, out: THREE.Vector3) => {
      out.set(nx, ny, 0.5).unproject(kamera);
      out.sub(kamera.position).normalize().multiplyScalar(28).add(kamera.position);
    };
    naSwiat(-0.16, 0.7, gwiazdaStart);
    naSwiat(0.32, 0.36, gwiazdaKoniec);
    // punkt kontrolny NAD prostą start→koniec → tor LEKKO wygięty
    // (subtelnie — smużka ma zostać elegancka, nie teatralna)
    gwiazdaKontrol
      .addVectors(gwiazdaStart, gwiazdaKoniec)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(0, 0.5, 0));
  }

  /* Pozycja na łuku (krzywa Béziera 2. stopnia) */
  function punktGwiazdy(f: number, out: THREE.Vector3) {
    const a = (1 - f) * (1 - f);
    const b = 2 * f * (1 - f);
    const d = f * f;
    out.set(
      a * gwiazdaStart.x + b * gwiazdaKontrol.x + d * gwiazdaKoniec.x,
      a * gwiazdaStart.y + b * gwiazdaKontrol.y + d * gwiazdaKoniec.y,
      a * gwiazdaStart.z + b * gwiazdaKontrol.z + d * gwiazdaKoniec.z
    );
  }

  /* — pętla renderowania — */
  const zegar = new THREE.Clock();
  let kat2 = Math.random() * Math.PI * 2;
  let kat3 = Math.random() * Math.PI * 2; // mini-księżyc turkusowej
  let klatka = 0;
  let widoczna = true;

  function animuj() {
    klatka = requestAnimationFrame(animuj);
    if (!widoczna) return;
    const dt = Math.min(zegar.getDelta(), 0.05);
    const czas = zegar.elapsedTime;

    // wygładzenie scrolla i myszy (kinowa bezwładność kamery)
    postepPlynny += (postep - postepPlynny) * Math.min(1, dt * 5);
    myszPlynna.x += (mysz.x - myszPlynna.x) * Math.min(1, dt * 3);
    myszPlynna.y += (mysz.y - myszPlynna.y) * Math.min(1, dt * 3);

    // ruch świata
    planeta.rotation.y += dt * 0.05;
    pierscienie.rotation.z += dt * 0.015;
    rozowa.rotation.y += dt * 0.12;
    turkusowa.rotation.y += dt * 0.1;
    gwiazdyDaleko.rotation.y += dt * 0.0035;

    kat2 += dt * 0.17;
    const s2 = Math.sin(kat2);
    ksiezycMaly2.position.set(
      Math.cos(kat2) * 2.35,
      s2 * 2.35 * Math.cos(PRZECHYL),
      s2 * 2.35 * Math.sin(PRZECHYL)
    );

    // drugi księżyc — spokojna orbita tuż przy pierścieniach
    katStacja += dt * 0.11;
    const sS = Math.sin(katStacja);
    ksiezycStacja.position.set(
      Math.cos(katStacja) * PROMIEN_STACJI,
      sS * PROMIEN_STACJI * Math.cos(PRZECHYL),
      sS * PROMIEN_STACJI * Math.sin(PRZECHYL)
    );

    // mini-księżyc turkusowej — mała, pochylona orbita wokół niej
    kat3 += dt * 0.35;
    ksiezycTurkusowej.position.set(
      turkusowa.position.x + Math.cos(kat3) * 0.85,
      turkusowa.position.y + Math.sin(kat3) * 0.28,
      turkusowa.position.z + Math.sin(kat3) * 0.72
    );

    // spadająca gwiazda — pojawia się TYLKO w hero (początek podróży)
    if (postepPlynny < 0.04) {
      gwiazdaZegar -= dt;
      if (gwiazdaZegar <= -GWIAZDA_TRWA) gwiazdaZegar = GWIAZDA_CO; // następny cykl
      if (gwiazdaZegar <= 0) {
        const f = -gwiazdaZegar / GWIAZDA_TRWA; // 0–1 wzdłuż trasy
        if (!smuga.visible) {
          planujGwiazde();
          smuga.visible = true;
        }
        punktGwiazdy(f, smuga.position);
        // obrót smugi wzdłuż STYCZNEJ łuku (na ekranie) — głowa zawsze
        // celuje w kierunek lotu, także na zakrzywieniu
        punktGwiazdy(Math.min(1, f + 0.03), gwPrzod);
        gwPunkt.copy(smuga.position).project(kamera);
        gwPrzod.project(kamera);
        smugaMat.rotation = Math.atan2(
          (gwPrzod.y - gwPunkt.y) * pojemnik.clientHeight,
          (gwPrzod.x - gwPunkt.x) * pojemnik.clientWidth
        );
        smugaMat.opacity = Math.sin(f * Math.PI) * 0.75; // miękkie wejście/zejście
      } else if (smuga.visible) {
        smuga.visible = false;
        smugaMat.opacity = 0;
      }
    } else if (smuga.visible) {
      smuga.visible = false;
      smugaMat.opacity = 0;
    }

    ustawKamere(postepPlynny, czas);
    composer.render();
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
    kamera.aspect = szer / wys;
    kamera.updateProjectionMatrix();
    renderer.setSize(szer, wys);
    composer.setSize(szer, wys);
  });
  obserwator.observe(pojemnik);

  return {
    ustawPostep(p: number) {
      postep = Math.min(1, Math.max(0, p));
    },
    ustawOkna(nowe: { a: number; b: number }[]) {
      if (nowe.length === POZY.length) okna = nowe;
    },
    liczbaPrzystankow: POZY.length,
    zniszcz() {
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
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
