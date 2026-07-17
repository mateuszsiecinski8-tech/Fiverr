"use client";
// ============================================================
// SCENA 3D (Three.js) — główna atrakcja sekcji hero.
//
// Zawiera:
//  • dużą planetę z PIERŚCIENIAMI i wymyślonymi KONTYNENTAMI
//    (tekstura „malowana" kodem: ocean + lądy + czapy polarne),
//    powoli obracającą się wokół własnej osi,
//  • DWA KSIĘŻYCE (jeden mniejszy) krążące po prawdziwej orbicie
//    (w płaszczyźnie pierścieni — nigdy nie przelatują przez planetę),
//    z teksturą delikatnych kraterów,
//  • drugą, mniejszą RÓŻOWĄ planetę bez pierścieni (prawy górny róg),
//    też się obraca,
//  • jasne SŁOŃCE w oddali — prawie biała kula z żółtą poświatą.
//
// Wydajność i bezpieczeństwo:
//  • silnik Three.js ładuje się LENIWIE i tylko na komputerach,
//  • na telefonie / przy „ograniczeniu animacji" / bez WebGL — fallback CSS,
//  • po wyjściu ze strony sprzątamy zasoby (dispose), zero wycieków.
// ============================================================

import { useEffect, useRef, useState } from "react";
// import „type" = tylko podpowiedzi typów, nie dokłada ani bajta do strony
import type { Material, Mesh } from "three";

/* --- Spinner pokazywany podczas ładowania silnika 3D --- */
function Spinner() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-akcent/20 border-t-akcent" />
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
        Loading 3D scene…
      </p>
    </div>
  );
}

/* --- Statyczny fallback (telefony / brak WebGL): kula CSS --- */
function Fallback() {
  return (
    <div aria-hidden="true" className="relative flex h-full w-full items-center justify-center">
      <div className="absolute h-56 w-56 rounded-full bg-akcent/25 blur-[70px]" />
      <div
        className="plywa2 relative h-44 w-44 rounded-full shadow-2xl shadow-akcent/30 md:h-56 md:w-56"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #c9bfff 0%, #8b7cf7 35%, #5b47d6 70%, #37277f 100%)",
        }}
      >
        <div className="absolute left-7 top-6 h-8 w-12 -rotate-[24deg] rounded-full bg-white/50 blur-md" />
      </div>
      <div className="absolute h-64 w-64 rounded-full border border-akcent/25 md:h-80 md:w-80" />
      <div className="absolute h-64 w-64 rotate-[65deg] scale-y-[0.35] rounded-full border border-akcent/40 md:h-80 md:w-80" />
    </div>
  );
}

/* --- Tekstura planety głównej: gazowy olbrzym (pasy kolorów + smugi
       „chmur" + turkusowe burze) — wygląd, który podobał się najbardziej --- */
function namalujPlanete(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;

  // pionowy gradient pasów (od bieguna do bieguna)
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, "#2a1e63");
  grad.addColorStop(0.18, "#5b47d6");
  grad.addColorStop(0.34, "#8b7cf7");
  grad.addColorStop(0.46, "#d17ce8");
  grad.addColorStop(0.58, "#f0a6d8");
  grad.addColorStop(0.7, "#6d5dfc");
  grad.addColorStop(0.85, "#3b2f8f");
  grad.addColorStop(1.0, "#221a52");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Faliste, półprzezroczyste smugi chmur — dodają „życia" powierzchni.
  // WAŻNE: fala musi być OKRESOWA na szerokości 1024 px, żeby lewa i prawa
  // krawędź tekstury się zgadzały — inaczej na kuli widać pionowy „szew".
  // Dlatego zamiast x/90 używamy pełnych cykli (2*PI*k*x/1024).
  for (let i = 0; i < 26; i++) {
    const y = Math.random() * 512;
    const wys = 3 + Math.random() * 14;
    const cykle = 2 + (i % 2); // 2 lub 3 pełne fale na obwód — zawsze się domykają
    const faza = i * 2.1;
    const fala = (x: number) => Math.sin((x / 1024) * Math.PI * 2 * cykle + faza) * 7;
    ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.07})`;
    ctx.beginPath();
    for (let x = 0; x <= 1024; x += 16) {
      x === 0 ? ctx.moveTo(x, y + fala(x)) : ctx.lineTo(x, y + fala(x));
    }
    for (let x = 1024; x >= 0; x -= 16) {
      ctx.lineTo(x, y + wys + fala(x));
    }
    ctx.fill();
  }
  // Turkusowe „burze" — każdą rysujemy też w kopii przesuniętej o ±1024 px,
  // żeby te przy krawędzi płynnie „owijały się" przez szew (bez ucięcia).
  for (let i = 0; i < 10; i++) {
    const cx = Math.random() * 1024;
    const cy = 120 + Math.random() * 280;
    const rx = 26 + Math.random() * 60;
    const ry = 7 + Math.random() * 12;
    ctx.fillStyle = `rgba(79,209,197,${0.05 + Math.random() * 0.1})`;
    for (const przesun of [-1024, 0, 1024]) {
      ctx.beginPath();
      ctx.ellipse(cx + przesun, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return c;
}

/* --- Tekstura różowej planety (bez lądów, miękkie pasy) --- */
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
  // miękkie jaśniejsze pasma
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = `rgba(255,224,240,${0.1 + Math.random() * 0.14})`;
    const y = Math.random() * 256;
    ctx.fillRect(0, y, 512, 3 + Math.random() * 8);
  }
  return c;
}

/* --- Tekstura pierścieni: przezroczyste i jaśniejsze pasma --- */
function namalujPierscienie(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const srodek = 256;
  // Pierścień 3D „czyta" z tekstury pas 57–100% promienia → malujemy 150–254 px
  for (let r = 150; r < 254; r++) {
    const pasmo = Math.sin(r * 0.32) * 0.5 + Math.sin(r * 0.09) * 0.5;
    const alfa = Math.max(0, 0.16 + pasmo * 0.18);
    const kolor = r % 26 < 13 ? "201,191,255" : "209,124,232";
    ctx.strokeStyle = `rgba(${kolor},${alfa.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(srodek, srodek, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  return c;
}

/* --- Tekstura księżyca: baza + delikatne kratery (ciemniejsze kółka
       z cienkim jasnym rantem od strony światła, żeby wyglądały na wklęsłe) --- */
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
    // cienki jasny rant (górna-lewa krawędź krateru „łapie" światło)
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = Math.max(1, r * 0.1);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.94, Math.PI * 0.65, Math.PI * 1.55);
    ctx.stroke();
  }
  return c;
}

/* --- Miękka, okrągła poświata (parametr: kolor rgb) --- */
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

export default function Scena3D() {
  const pojemnik = useRef<HTMLDivElement>(null);
  const [tryb, setTryb] = useState<"czekam" | "3d" | "fallback">("czekam");
  const [gotowa, setGotowa] = useState(false);

  useEffect(() => {
    const duzyEkran = window.matchMedia("(min-width: 1024px)").matches;
    const bezAnimacji = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTryb(duzyEkran && !bezAnimacji ? "3d" : "fallback");
  }, []);

  // Budowa i animacja sceny 3D
  useEffect(() => {
    if (tryb !== "3d" || !pojemnik.current) return;
    let zatrzymana = false;
    let klatka = 0;
    let sprzatanie = () => {};

    (async () => {
      try {
        const THREE = await import("three");
        const el = pojemnik.current;
        if (zatrzymana || !el) return;

        /* — podstawa sceny — */
        const scena = new THREE.Scene();
        const kamera = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, 0.1, 60);
        kamera.position.set(0, 0.4, 6.2);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.domElement.style.pointerEvents = "none"; // gwiazdy pod spodem mają działać
        el.appendChild(renderer.domElement);

        /* — światła — */
        scena.add(new THREE.AmbientLight(0xffffff, 0.5));
        const swiatloGlowne = new THREE.DirectionalLight(0xffffff, 2.2);
        swiatloGlowne.position.set(-4, 2.5, 3);
        scena.add(swiatloGlowne);
        // ciepłe światło „od słońca" (górny lewy róg)
        const swiatloSlonca = new THREE.PointLight(0xfff4d0, 1.4, 40);
        swiatloSlonca.position.set(-5, 4, -3);
        scena.add(swiatloSlonca);

        /* ========== PLANETA GŁÓWNA (z pierścieniami) ========== */
        // Pozycja: lekko w górę i w prawo — pierścienie mieszczą się W CAŁOŚCI
        const uklad = new THREE.Group();
        uklad.position.set(0.35, 0.1, 0);
        uklad.rotation.z = 0.16;
        scena.add(uklad);

        const teksturaPlanety = new THREE.CanvasTexture(namalujPlanete());
        teksturaPlanety.colorSpace = THREE.SRGBColorSpace;
        const planeta = new THREE.Mesh(
          new THREE.SphereGeometry(1.35, 64, 64),
          new THREE.MeshStandardMaterial({ map: teksturaPlanety, roughness: 0.85, metalness: 0.05 })
        );
        uklad.add(planeta);

        const teksturaPierscieni = new THREE.CanvasTexture(namalujPierscienie());
        const pierscienie = new THREE.Mesh(
          new THREE.RingGeometry(1.6, 2.7, 128),
          new THREE.MeshBasicMaterial({
            map: teksturaPierscieni,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        );
        const PRZECHYL = -1.18; // pochylenie pierścieni (rad)
        pierscienie.rotation.x = PRZECHYL;
        uklad.add(pierscienie);

        // księżyc (jaśniejszy, żeby wyraźnie odcinał się od planety) —
        // z teksturą delikatnych kraterów
        const teksturaKsiezyca = new THREE.CanvasTexture(namalujKsiezyc("#e8e4ff"));
        teksturaKsiezyca.colorSpace = THREE.SRGBColorSpace;
        const ksiezyc = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 32, 32),
          new THREE.MeshStandardMaterial({ map: teksturaKsiezyca, roughness: 0.6, emissive: 0x2a2540 })
        );
        uklad.add(ksiezyc);

        // drugi, MNIEJSZY księżyc (życzenie właściciela) — ta sama płaszczyzna
        // orbity co pierwszy, ale własny promień i tempo, żeby się nigdy nie mijały
        const teksturaKsiezyca2 = new THREE.CanvasTexture(namalujKsiezyc("#d3cdf2"));
        teksturaKsiezyca2.colorSpace = THREE.SRGBColorSpace;
        const ksiezyc2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.085, 28, 28),
          new THREE.MeshStandardMaterial({ map: teksturaKsiezyca2, roughness: 0.6, emissive: 0x241f3a })
        );
        uklad.add(ksiezyc2);

        // poświata za planetą
        const poswiata = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(namalujPoswiate("139,124,247")), transparent: true, depthWrite: false })
        );
        poswiata.scale.set(5.6, 5.6, 1);
        poswiata.position.set(0.35, 0.1, -1.6);
        scena.add(poswiata);

        /* ========== RÓŻOWA PLANETA (prawy górny róg, bez pierścieni) ========== */
        const teksturaRozowej = new THREE.CanvasTexture(namalujRozowa());
        teksturaRozowej.colorSpace = THREE.SRGBColorSpace;
        const rozowa = new THREE.Mesh(
          new THREE.SphereGeometry(0.52, 48, 48),
          new THREE.MeshStandardMaterial({ map: teksturaRozowej, roughness: 0.8 })
        );
        rozowa.position.set(2.7, 2.0, -0.6); // prawy górny róg sceny
        scena.add(rozowa);
        // subtelna różowa poświata
        const poswiataRoz = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(namalujPoswiate("240,111,174")), transparent: true, depthWrite: false })
        );
        poswiataRoz.scale.set(2.1, 2.1, 1);
        poswiataRoz.position.set(2.7, 2.0, -0.8);
        scena.add(poswiataRoz);

        /* ========== SŁOŃCE W ODDALI (prawie biała kula + żółta poświata) ========== */
        // Pozycja: wysoko w górnym-lewym rogu sceny (z dala od planet);
        // dobrana tak, żeby poświata nie ucinała się na węższych ekranach.
        const slonce = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 32, 32),
          new THREE.MeshBasicMaterial({ color: 0xfffdf2 })
        );
        slonce.position.set(-4.6, 3.4, -7);
        scena.add(slonce);
        const halo = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(namalujPoswiate("255,236,150")), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
        );
        halo.scale.set(3.4, 3.4, 1);
        halo.position.copy(slonce.position);
        halo.position.z -= 0.1;
        scena.add(halo);

        /* — pętla animacji — */
        const zegar = new THREE.Clock();
        let kat = Math.random() * Math.PI * 2;
        let kat2 = Math.random() * Math.PI * 2;
        // Promień dobrany tak, by księżyc mieścił się w kadrze także na
        // wąskich kanwach, a jednocześnie był wyraźnie POZA planetą (1.35).
        const R_KSIEZYCA = 1.95;
        const R_KSIEZYCA2 = 2.35; // drugi księżyc krąży dalej — nigdy nie mija się z pierwszym
        function animuj() {
          const dt = zegar.getDelta();
          planeta.rotation.y += dt * 0.2;
          pierscienie.rotation.z += dt * 0.02;
          rozowa.rotation.y += dt * 0.4; // różowa obraca się szybciej

          // Oba księżyce: prawdziwa orbita w PŁASZCZYŹNIE pierścieni, w TĘ
          // SAMĄ stronę (kat i kat2 rosną) — a więc PRZECIWNIE do księżyca
          // małej turkusowej planety w Ozdoby3D.tsx (tam animacja jest
          // odwrócona). Różne promienie i tempo, żeby się nie mijały.
          kat += dt * 0.4;
          const s = Math.sin(kat);
          ksiezyc.position.set(
            Math.cos(kat) * R_KSIEZYCA,
            s * R_KSIEZYCA * Math.cos(PRZECHYL),
            s * R_KSIEZYCA * Math.sin(PRZECHYL)
          );

          kat2 += dt * 0.55;
          const s2 = Math.sin(kat2);
          ksiezyc2.position.set(
            Math.cos(kat2) * R_KSIEZYCA2,
            s2 * R_KSIEZYCA2 * Math.cos(PRZECHYL),
            s2 * R_KSIEZYCA2 * Math.sin(PRZECHYL)
          );

          renderer.render(scena, kamera);
          klatka = requestAnimationFrame(animuj);
        }
        animuj();
        setGotowa(true);

        /* — dopasowanie do rozmiaru — */
        const obserwator = new ResizeObserver(() => {
          kamera.aspect = el.clientWidth / el.clientHeight;
          kamera.updateProjectionMatrix();
          renderer.setSize(el.clientWidth, el.clientHeight);
        });
        obserwator.observe(el);

        /* — sprzątanie — */
        sprzatanie = () => {
          cancelAnimationFrame(klatka);
          obserwator.disconnect();
          renderer.dispose();
          scena.traverse((obiekt) => {
            const m = obiekt as Mesh;
            m.geometry?.dispose?.();
            (m.material as Material | undefined)?.dispose?.();
          });
          renderer.domElement.remove();
        };
      } catch {
        if (!zatrzymana) setTryb("fallback");
      }
    })();

    return () => {
      zatrzymana = true;
      sprzatanie();
    };
  }, [tryb]);

  return (
    <div className="relative h-72 w-full md:h-96 lg:h-[600px]">
      {tryb === "fallback" && <Fallback />}
      {tryb === "3d" && (
        <>
          {!gotowa && <Spinner />}
          <div
            ref={pojemnik}
            className={`h-full w-full transition-opacity duration-1000 ${
              gotowa ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      )}
    </div>
  );
}
