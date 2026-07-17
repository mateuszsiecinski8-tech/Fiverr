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
import { Lensflare, LensflareElement } from "three/addons/objects/Lensflare.js";

/* ============ MALOWANIE TEKSTUR (canvas 2D — zero plików) ============ */

/* Gazowy olbrzym — pasy fiolet→róż, okresowe chmury (bez szwu), burze. */
function namalujPlanete(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 1024;
  const ctx = c.getContext("2d")!;
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

  for (let i = 0; i < 40; i++) {
    const y = Math.random() * 1024;
    const wys = 5 + Math.random() * 26;
    const cykle = 2 + (i % 3); // pełne cykle → tekstura domyka się na szwie
    const faza = i * 2.1;
    const fala = (x: number) => Math.sin((x / 2048) * Math.PI * 2 * cykle + faza) * 13;
    ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.06})`;
    ctx.beginPath();
    for (let x = 0; x <= 2048; x += 24) {
      x === 0 ? ctx.moveTo(x, y + fala(x)) : ctx.lineTo(x, y + fala(x));
    }
    for (let x = 2048; x >= 0; x -= 24) ctx.lineTo(x, y + wys + fala(x));
    ctx.fill();
  }
  for (let i = 0; i < 14; i++) {
    const cx = Math.random() * 2048;
    const cy = 240 + Math.random() * 560;
    const rx = 50 + Math.random() * 120;
    const ry = 14 + Math.random() * 24;
    ctx.fillStyle = `rgba(79,209,197,${0.05 + Math.random() * 0.1})`;
    for (const przesun of [-2048, 0, 2048]) {
      ctx.beginPath();
      ctx.ellipse(cx + przesun, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return c;
}

/* Różowa planeta — miękkie pasy. */
function namalujRozowa(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, "#b0407e");
  g.addColorStop(0.4, "#f06fae");
  g.addColorStop(0.62, "#ffa6cf");
  g.addColorStop(0.8, "#e86ba6");
  g.addColorStop(1.0, "#9c3a72");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = `rgba(255,224,240,${0.1 + Math.random() * 0.14})`;
    ctx.fillRect(0, Math.random() * 256, 512, 3 + Math.random() * 8);
  }
  return c;
}

/* Turkusowa planeta (stonowana — jak w wersji produkcyjnej). */
function namalujTurkusowa(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, "#183e40");
  g.addColorStop(0.35, "#3a6d69");
  g.addColorStop(0.6, "#5f9a95");
  g.addColorStop(0.82, "#3d7370");
  g.addColorStop(1.0, "#14383a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgba(210,240,235,${0.06 + Math.random() * 0.08})`;
    ctx.fillRect(0, Math.random() * 256, 512, 2 + Math.random() * 7);
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

/* Księżyc LĄDOWANIA — duża tekstura: szary regolit + sporo kraterów.
   Zwraca [kolor, mapa nierówności] (bump z tych samych kraterów). */
function namalujKsiezycLadowania(): [HTMLCanvasElement, HTMLCanvasElement] {
  const R = 2048;
  const kolor = document.createElement("canvas");
  kolor.width = R;
  kolor.height = R / 2;
  const kc = kolor.getContext("2d")!;
  const bump = document.createElement("canvas");
  bump.width = R;
  bump.height = R / 2;
  const bc = bump.getContext("2d")!;

  // baza: chłodna szarość z fioletowym podbiciem (światło sceny doda resztę)
  const g = kc.createLinearGradient(0, 0, 0, R / 2);
  g.addColorStop(0, "#9a95b8");
  g.addColorStop(0.5, "#b5b0cc");
  g.addColorStop(1, "#8d88ab");
  kc.fillStyle = g;
  kc.fillRect(0, 0, R, R / 2);
  bc.fillStyle = "#808080"; // neutralna wysokość
  bc.fillRect(0, 0, R, R / 2);

  // plamy „mórz" (ciemniejsze rejony jak na prawdziwym Księżycu)
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * R;
    const y = Math.random() * (R / 2);
    const r = 60 + Math.random() * 220;
    const m = kc.createRadialGradient(x, y, 0, x, y, r);
    m.addColorStop(0, "rgba(70,66,96,0.16)");
    m.addColorStop(1, "rgba(70,66,96,0)");
    kc.fillStyle = m;
    for (const dx of [-R, 0, R]) {
      kc.beginPath();
      kc.arc(x + dx, y, r, 0, Math.PI * 2);
      kc.fill();
    }
  }

  // kratery: kolor (cień + jasny rant) i bump (dołek + wał)
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * R;
    const y = Math.random() * (R / 2);
    const r = 6 + Math.random() * (Math.random() < 0.12 ? 70 : 26);
    for (const dx of [-R, 0, R]) {
      // kolor: wnętrze w cieniu (delikatnie — rzeźbę i tak robi bump)
      const cien = kc.createRadialGradient(x + dx, y, r * 0.1, x + dx, y, r);
      cien.addColorStop(0, "rgba(45,42,70,0.3)");
      cien.addColorStop(0.72, "rgba(45,42,70,0.12)");
      cien.addColorStop(1, "rgba(45,42,70,0)");
      kc.fillStyle = cien;
      kc.beginPath();
      kc.arc(x + dx, y, r, 0, Math.PI * 2);
      kc.fill();
      kc.strokeStyle = "rgba(255,255,255,0.20)";
      kc.lineWidth = Math.max(1, r * 0.1);
      kc.beginPath();
      kc.arc(x + dx, y, r * 0.92, Math.PI * 0.65, Math.PI * 1.55);
      kc.stroke();
      // bump: środek nisko (ciemno), wał wysoko (jasno)
      const dol = bc.createRadialGradient(x + dx, y, 0, x + dx, y, r * 0.85);
      dol.addColorStop(0, "rgba(0,0,0,0.55)");
      dol.addColorStop(1, "rgba(0,0,0,0)");
      bc.fillStyle = dol;
      bc.beginPath();
      bc.arc(x + dx, y, r * 0.85, 0, Math.PI * 2);
      bc.fill();
      bc.strokeStyle = "rgba(255,255,255,0.35)";
      bc.lineWidth = Math.max(1.5, r * 0.16);
      bc.beginPath();
      bc.arc(x + dx, y, r * 0.9, 0, Math.PI * 2);
      bc.stroke();
    }
  }
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

/* Tekstury lens flare: główny blask + „duszki" (kółka przy flarze). */
function namalujFlare(): [THREE.Texture, THREE.Texture] {
  const a = document.createElement("canvas");
  a.width = 256;
  a.height = 256;
  const ac = a.getContext("2d")!;
  const g1 = ac.createRadialGradient(128, 128, 0, 128, 128, 128);
  g1.addColorStop(0, "rgba(255,250,235,1)");
  g1.addColorStop(0.15, "rgba(255,240,200,0.55)");
  g1.addColorStop(0.4, "rgba(255,220,160,0.14)");
  g1.addColorStop(1, "rgba(255,220,160,0)");
  ac.fillStyle = g1;
  ac.fillRect(0, 0, 256, 256);
  // poziome „rozciągnięcie" blasku (jak smuga na obiektywie)
  const g2 = ac.createLinearGradient(0, 118, 256, 138);
  ac.globalCompositeOperation = "lighter";
  g2.addColorStop(0, "rgba(255,245,220,0)");
  g2.addColorStop(0.5, "rgba(255,245,220,0.5)");
  g2.addColorStop(1, "rgba(255,245,220,0)");
  ac.fillStyle = g2;
  ac.fillRect(0, 118, 256, 20);

  const b = document.createElement("canvas");
  b.width = 128;
  b.height = 128;
  const bc = b.getContext("2d")!;
  const g3 = bc.createRadialGradient(64, 64, 30, 64, 64, 62);
  g3.addColorStop(0, "rgba(180,200,255,0)");
  g3.addColorStop(0.8, "rgba(180,200,255,0.22)");
  g3.addColorStop(1, "rgba(180,200,255,0)");
  bc.fillStyle = g3;
  bc.beginPath();
  bc.arc(64, 64, 62, 0, Math.PI * 2);
  bc.fill();

  const ta = new THREE.CanvasTexture(a);
  const tb = new THREE.CanvasTexture(b);
  ta.colorSpace = THREE.SRGBColorSpace;
  tb.colorSpace = THREE.SRGBColorSpace;
  return [ta, tb];
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

/* ============ KSIĘŻYC LĄDOWANIA (prawdziwa rzeźba kraterów) ============ */
/* Geometria kuli z wgniecionymi kraterami — z bliska widać prawdziwy
   relief na horyzoncie, nie płaski obrazek. */
function zrobKsiezycLadowania(promien: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(promien, 196, 196);
  const poz = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  // ~48 kraterów: kierunek na sferze + promień kątowy + głębokość
  const kratery: { dir: THREE.Vector3; r: number; g: number }[] = [];
  for (let i = 0; i < 48; i++) {
    kratery.push({
      dir: new THREE.Vector3().randomDirection(),
      r: 0.05 + Math.random() * 0.16, // promień kątowy (rad)
      g: 0.004 + Math.random() * 0.012, // głębokość (j. świata)
    });
  }
  for (let i = 0; i < poz.count; i++) {
    v.fromBufferAttribute(poz, i);
    const kier = v.clone().normalize();
    let delta = 0;
    for (const kr of kratery) {
      const kat = kier.angleTo(kr.dir);
      if (kat < kr.r) {
        const t = kat / kr.r; // 0 środek … 1 brzeg
        // profil misy: dołek w środku, wał tuż za brzegiem
        const misa = Math.cos(t * Math.PI) * -1; // -1 środek → 1 brzeg
        delta += misa * kr.g;
        if (t > 0.8) delta += (t - 0.8) * 5 * kr.g * 0.9; // wał
      }
    }
    v.copy(kier).multiplyScalar(promien + delta);
    poz.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();

  const [kolor, bump] = namalujKsiezycLadowania();
  const tKolor = new THREE.CanvasTexture(kolor);
  tKolor.colorSpace = THREE.SRGBColorSpace;
  const tBump = new THREE.CanvasTexture(bump);
  const mat = new THREE.MeshStandardMaterial({
    map: tKolor,
    bumpMap: tBump,
    bumpScale: 1.6,
    roughness: 0.95,
    metalness: 0.0,
  });
  return new THREE.Mesh(geo, mat);
}

/* ============ GŁÓWNA FUNKCJA — budowa świata ============ */

export type SilnikLotu = {
  /** Postęp podróży 0–1 (od ScrollTriggera). */
  ustawPostep: (p: number) => void;
  /** Posprzątaj wszystko (unmount). */
  zniszcz: () => void;
};

export function zbudujLot(pojemnik: HTMLDivElement): SilnikLotu {
  /* — renderer + kolor filmowy — */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(pojemnik.clientWidth, pojemnik.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
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
  scena.add(new THREE.AmbientLight(0x9a92ff, 0.34));
  const POZ_SLONCA = new THREE.Vector3(-14, 9, -30);
  // decay 0 = stała jasność niezależnie od odległości (scena jest umowna,
  // fizyczny spadek światła robił z planet granatowe cienie)
  const swiatloSlonca = new THREE.PointLight(0xfff2d8, 2.6, 0, 0);
  swiatloSlonca.position.copy(POZ_SLONCA);
  scena.add(swiatloSlonca);
  // Światło WYPEŁNIAJĄCE od strony kamery — filmowy trik: słońce świeci
  // zza planet (dramatyczny kontrast), a delikatny fiolet „od widza"
  // wydobywa kolory z oglądanej strony planet, żeby nie były czarne.
  const wypelnienie = new THREE.DirectionalLight(0xb9aeff, 1.15);
  wypelnienie.position.set(6, 3, 10);
  scena.add(wypelnienie);

  /* — pole gwiazd (daleka kopuła + bliższa warstwa dla paralaksy) — */
  const gwiazdyDaleko = poleGwiazd(6500, 60, 110, 0.62);
  const gwiazdyBlisko = poleGwiazd(700, 18, 45, 0.34);
  scena.add(gwiazdyDaleko, gwiazdyBlisko);

  /* — SŁOŃCE: świecąca kula + lens flare — */
  const slonce = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xfffbf0, toneMapped: false })
  );
  slonce.position.copy(POZ_SLONCA);
  scena.add(slonce);
  const [flaraGlowna, flaraDuszek] = namalujFlare();
  const flara = new Lensflare();
  flara.addElement(new LensflareElement(flaraGlowna, 640, 0));
  flara.addElement(new LensflareElement(flaraDuszek, 90, 0.35));
  flara.addElement(new LensflareElement(flaraDuszek, 140, 0.55));
  flara.addElement(new LensflareElement(flaraDuszek, 70, 0.85));
  swiatloSlonca.add(flara);

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

  /* — dwa małe księżyce na orbitach (jak na produkcji) — */
  const tK1 = new THREE.CanvasTexture(namalujKsiezyc("#e8e4ff"));
  tK1.colorSpace = THREE.SRGBColorSpace;
  const ksiezycMaly1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 32, 32),
    new THREE.MeshStandardMaterial({ map: tK1, roughness: 0.9 })
  );
  uklad.add(ksiezycMaly1);
  const tK2 = new THREE.CanvasTexture(namalujKsiezyc("#d3cdf2"));
  tK2.colorSpace = THREE.SRGBColorSpace;
  const ksiezycMaly2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 28, 28),
    new THREE.MeshStandardMaterial({ map: tK2, roughness: 0.9 })
  );
  uklad.add(ksiezycMaly2);

  /* — KSIĘŻYC LĄDOWANIA (przystanek 1 — Usługi) — */
  // Nie krąży (kamera na nim „staje"); wisi z boku układu, po prawej.
  const POZ_LADOWANIA = new THREE.Vector3(2.6, -0.55, 2.2);
  const R_LADOWANIA = 0.42;
  const ksiezycLadowania = zrobKsiezycLadowania(R_LADOWANIA);
  ksiezycLadowania.position.copy(POZ_LADOWANIA);
  scena.add(ksiezycLadowania);
  const atmoKsiezyca = atmosfera(R_LADOWANIA, new THREE.Color(0xbfc4ff), 0.5);
  atmoKsiezyca.position.copy(POZ_LADOWANIA);
  scena.add(atmoKsiezyca);

  /* — RÓŻOWA i TURKUSOWA planeta (dalsze przystanki — na razie tło) — */
  const tRoz = new THREE.CanvasTexture(namalujRozowa());
  tRoz.colorSpace = THREE.SRGBColorSpace;
  const rozowa = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 64, 64),
    new THREE.MeshStandardMaterial({ map: tRoz, roughness: 0.8 })
  );
  rozowa.position.set(7.5, 4.0, -7);
  scena.add(rozowa);
  const atmoRoz = atmosfera(0.9, new THREE.Color(0xf06fae), 0.8);
  atmoRoz.position.copy(rozowa.position);
  scena.add(atmoRoz);

  const tTurk = new THREE.CanvasTexture(namalujTurkusowa());
  tTurk.colorSpace = THREE.SRGBColorSpace;
  const turkusowa = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 56, 56),
    new THREE.MeshStandardMaterial({ map: tTurk, roughness: 0.85 })
  );
  turkusowa.position.set(-7, -2.6, -9);
  scena.add(turkusowa);
  const atmoTurk = atmosfera(0.7, new THREE.Color(0x5f9a95), 0.7);
  atmoTurk.position.copy(turkusowa.position);
  scena.add(atmoTurk);

  /* — POST-PROCESSING: bloom (kinowe „rozlewanie" światła) — */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scena, kamera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(pojemnik.clientWidth, pojemnik.clientHeight),
    0.6, // siła
    0.5, // promień
    0.88 // próg — świeci tylko to, co naprawdę jasne (słońce, rimy)
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ============ TRASA KAMERY (przystanki podróży) ============ */
  // Prototyp: hero (szeroki plan) → podejście → lądowanie na księżycu.
  // Hero: celujemy W LEWO od planety → planeta ląduje w prawych 2/3 ekranu,
  // z dala od tekstu. Lądowanie: kamera ~0.05 nad gruntem księżyca, patrzy
  // niemal WZDŁUŻ horyzontu — grunt wypełnia dół kadru, planeta wisi na niebie.
  const TRASA = [
    { poz: new THREE.Vector3(-2.0, 0.9, 8.4), cel: new THREE.Vector3(-1.2, 0.35, 0), fov: 45 },
    { poz: new THREE.Vector3(0.5, 0.1, 5.4), cel: new THREE.Vector3(2.3, -0.45, 2.0), fov: 50 },
    { poz: new THREE.Vector3(2.74, -0.06, 2.32), cel: new THREE.Vector3(0, 0.55, 0), fov: 58 },
  ];
  const krzywa = new THREE.CatmullRomCurve3(
    TRASA.map((t) => t.poz),
    false,
    "centripetal"
  );

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
    // która część trasy: 0–0.55 = segment 1, 0.55–1 = segment 2
    const granica = 0.55;
    let t: number; // 0–2 wzdłuż całej krzywej (3 punkty)
    let a: number, b: number, lok: number;
    if (p < granica) {
      a = 0;
      b = 1;
      lok = gladkie(p / granica);
    } else {
      a = 1;
      b = 2;
      lok = gladkie((p - granica) / (1 - granica));
    }
    t = (a + lok) / 2; // krzywa parametryzowana 0–1 na 2 segmenty
    krzywa.getPoint(t, pozKamery);

    // cel patrzenia i FOV: płynna mieszanka między przystankami
    cel.lerpVectors(TRASA[a].cel, TRASA[b].cel, lok);
    kamera.fov = TRASA[a].fov + (TRASA[b].fov - TRASA[a].fov) * lok;

    // delikatny „oddech" + parallax myszy (mniejszy przy lądowaniu)
    const luz = 1 - p * 0.7;
    pozKamery.x += Math.sin(czas * 0.23) * 0.045 * luz + myszPlynna.x * 0.09 * luz;
    pozKamery.y += Math.cos(czas * 0.19) * 0.035 * luz - myszPlynna.y * 0.07 * luz;

    kamera.position.copy(pozKamery);
    kamera.lookAt(cel);
    kamera.updateProjectionMatrix();
  }

  /* — pętla renderowania — */
  const zegar = new THREE.Clock();
  let kat1 = Math.random() * Math.PI * 2;
  let kat2 = Math.random() * Math.PI * 2;
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
    ksiezycLadowania.rotation.y += dt * 0.008; // ledwo zauważalny dryf gruntu
    gwiazdyDaleko.rotation.y += dt * 0.0035;

    kat1 += dt * 0.12;
    const s1 = Math.sin(kat1);
    ksiezycMaly1.position.set(
      Math.cos(kat1) * 1.95,
      s1 * 1.95 * Math.cos(PRZECHYL),
      s1 * 1.95 * Math.sin(PRZECHYL)
    );
    kat2 += dt * 0.17;
    const s2 = Math.sin(kat2);
    ksiezycMaly2.position.set(
      Math.cos(kat2) * 2.35,
      s2 * 2.35 * Math.cos(PRZECHYL),
      s2 * 2.35 * Math.sin(PRZECHYL)
    );

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
