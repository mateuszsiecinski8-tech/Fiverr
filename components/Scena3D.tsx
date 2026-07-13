"use client";
// ============================================================
// SCENA 3D (Three.js) — główna atrakcja sekcji hero.
//
// Zawiera:
//  • dużą planetę z PIERŚCIENIAMI i wymyślonymi KONTYNENTAMI
//    (tekstura „malowana" kodem: ocean + lądy + czapy polarne),
//    powoli obracającą się wokół własnej osi,
//  • KSIĘŻYC krążący po prawdziwej orbicie (w płaszczyźnie pierścieni,
//    poza nimi — nigdy nie przelatuje przez planetę),
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
        Ładowanie sceny 3D…
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

/* --- Rysuje „kleks" (blobby, nieregularny kształt) — używane do
       kontynentów i wysp. Zwraca ścieżkę zamkniętą w kontekście. --- */
function ladPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  ziarno: number
) {
  const pkt = 26;
  ctx.beginPath();
  for (let i = 0; i <= pkt; i++) {
    const a = (i / pkt) * Math.PI * 2;
    // trzy nakładające się fale = nieregularny, „organiczny" brzeg
    const n =
      0.6 +
      0.2 * Math.sin(a * 3 + ziarno) +
      0.12 * Math.sin(a * 5 + ziarno * 2.3) +
      0.09 * Math.sin(a * 8 + ziarno * 1.7);
    const r = R * n;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.82; // lekko spłaszczone
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/* --- Tekstura planety głównej: ocean + kontynenty + czapy polarne --- */
function namalujPlanete(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  const W = 1024,
    H = 512;
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // OCEAN — pionowy gradient (bieguny ciemniejsze, równik jaśniejszy)
  const ocean = ctx.createLinearGradient(0, 0, 0, H);
  ocean.addColorStop(0.0, "#1d1550");
  ocean.addColorStop(0.5, "#4334b8");
  ocean.addColorStop(1.0, "#1d1550");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, W, H);

  // KONTYNENTY — kilka dużych lądów w barwach strony.
  // Rysujemy też „owinięcia" przy krawędziach (mapa zawija się w poziomie).
  const kontynenty = [
    { x: 180, y: 210, R: 120, ziarno: 1.3 },
    { x: 470, y: 300, R: 95, ziarno: 3.7 },
    { x: 700, y: 180, R: 130, ziarno: 5.1 },
    { x: 900, y: 330, R: 100, ziarno: 2.2 },
    { x: 360, y: 380, R: 70, ziarno: 4.4 },
  ];
  for (const k of kontynenty) {
    for (const dx of [-W, 0, W]) {
      // ląd: gradient od jaśniejszego środka do ciemniejszego brzegu
      const g = ctx.createRadialGradient(k.x + dx, k.y, 10, k.x + dx, k.y, k.R);
      g.addColorStop(0, "#a98bff");
      g.addColorStop(0.55, "#8b7cf7");
      g.addColorStop(1, "#6d5dfc");
      ladPath(ctx, k.x + dx, k.y, k.R, k.ziarno);
      ctx.fillStyle = g;
      ctx.fill();
      // rozświetlony brzeg (linia brzegowa)
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(224,196,255,0.5)";
      ctx.stroke();
    }
  }

  // WYSPY — kilka małych lądów dla urozmaicenia
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * W;
    const y = 90 + Math.random() * 330;
    ladPath(ctx, x, y, 10 + Math.random() * 20, Math.random() * 6);
    ctx.fillStyle = "#9a86ff";
    ctx.fill();
  }

  // CZAPY POLARNE — jaśniejsze „lody" przy górnej i dolnej krawędzi
  const gora = ctx.createLinearGradient(0, 0, 0, 70);
  gora.addColorStop(0, "rgba(233,228,255,0.85)");
  gora.addColorStop(1, "rgba(233,228,255,0)");
  ctx.fillStyle = gora;
  ctx.fillRect(0, 0, W, 70);
  const dol = ctx.createLinearGradient(0, H - 70, 0, H);
  dol.addColorStop(0, "rgba(233,228,255,0)");
  dol.addColorStop(1, "rgba(233,228,255,0.85)");
  ctx.fillStyle = dol;
  ctx.fillRect(0, H - 70, W, 70);

  // delikatna mgiełka atmosfery (turkusowe smugi nad oceanem)
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgba(79,209,197,${0.04 + Math.random() * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * W, 150 + Math.random() * 220, 60 + Math.random() * 90, 8 + Math.random() * 10, 0, 0, Math.PI * 2);
    ctx.fill();
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
        const uklad = new THREE.Group();
        uklad.position.set(-0.1, -0.35, 0); // lekko w dół, robi miejsce różowej
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

        // księżyc (jaśniejszy, żeby wyraźnie odcinał się od planety)
        const ksiezyc = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 32, 32),
          new THREE.MeshStandardMaterial({ color: 0xe8e4ff, roughness: 0.6, emissive: 0x2a2540 })
        );
        uklad.add(ksiezyc);

        // poświata za planetą
        const poswiata = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(namalujPoswiate("139,124,247")), transparent: true, depthWrite: false })
        );
        poswiata.scale.set(5.6, 5.6, 1);
        poswiata.position.set(-0.3, -0.35, -1.6);
        scena.add(poswiata);

        /* ========== RÓŻOWA PLANETA (prawy górny róg, bez pierścieni) ========== */
        const teksturaRozowej = new THREE.CanvasTexture(namalujRozowa());
        teksturaRozowej.colorSpace = THREE.SRGBColorSpace;
        const rozowa = new THREE.Mesh(
          new THREE.SphereGeometry(0.52, 48, 48),
          new THREE.MeshStandardMaterial({ map: teksturaRozowej, roughness: 0.8 })
        );
        rozowa.position.set(2.25, 1.75, -0.4);
        scena.add(rozowa);
        // subtelna różowa poświata
        const poswiataRoz = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(namalujPoswiate("240,111,174")), transparent: true, depthWrite: false })
        );
        poswiataRoz.scale.set(2.1, 2.1, 1);
        poswiataRoz.position.set(2.25, 1.75, -0.6);
        scena.add(poswiataRoz);

        /* ========== SŁOŃCE W ODDALI (prawie biała kula + żółta poświata) ========== */
        const slonce = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 32, 32),
          new THREE.MeshBasicMaterial({ color: 0xfffdf2 })
        );
        slonce.position.set(-2.6, 2.15, -7);
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
        // Promień dobrany tak, by księżyc mieścił się w kadrze także na
        // wąskich kanwach, a jednocześnie był wyraźnie POZA planetą (1.35).
        const R_KSIEZYCA = 1.95;
        function animuj() {
          const dt = zegar.getDelta();
          planeta.rotation.y += dt * 0.2;
          pierscienie.rotation.z += dt * 0.02;
          rozowa.rotation.y += dt * 0.4; // różowa obraca się szybciej

          // Księżyc: prawdziwa orbita w PŁASZCZYŹNIE pierścieni.
          // Odległość od środka jest zawsze = R_KSIEZYCA, więc księżyc
          // nigdy nie przechodzi przez planetę (poprawka błędu).
          kat += dt * 0.4;
          const s = Math.sin(kat);
          ksiezyc.position.set(
            Math.cos(kat) * R_KSIEZYCA,
            s * R_KSIEZYCA * Math.cos(PRZECHYL),
            s * R_KSIEZYCA * Math.sin(PRZECHYL)
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
