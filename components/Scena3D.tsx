"use client";
// ============================================================
// PLANETA 3D — główna atrakcja sekcji hero.
//
// Kolorowa, wymyślona planeta z pierścieniami, zbudowana w całości
// kodem przy użyciu silnika Three.js (biblioteka 3D, standard w branży):
// • powierzchnia planety to „namalowana" na żywo tekstura (pasy w barwach
//   strony: fiolet → róż → turkus) — planeta powoli się obraca,
// • pierścienie z półprzezroczystymi pasmami, lekko pochylone,
// • mały księżyc krążący po orbicie,
// • miękka poświata za planetą.
//
// Wydajność i bezpieczeństwo:
// • silnik ładuje się LENIWIE i tylko na komputerach — strona startuje
//   tak szybko jak wcześniej; na telefonie jest lekki fallback CSS,
// • przy „ograniczeniu animacji" lub gdy przeglądarka nie umie w 3D
//   (brak WebGL) — również pokazuje się fallback,
// • po wyjściu ze strony sprzątamy po sobie (dispose), zero wycieków.
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
        Ładowanie planety…
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

/* --- „Malowanie" tekstury planety na ukrytym płótnie ---
       (pasy kolorów + delikatne smugi, jak na gazowym olbrzymie) --- */
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

  // faliste, półprzezroczyste smugi — dodają „życia" powierzchni
  for (let i = 0; i < 26; i++) {
    const y = Math.random() * 512;
    const wys = 3 + Math.random() * 14;
    ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.07})`;
    ctx.beginPath();
    for (let x = 0; x <= 1024; x += 16) {
      const fala = Math.sin(x / 90 + i * 2.1) * 7;
      x === 0 ? ctx.moveTo(x, y + fala) : ctx.lineTo(x, y + fala);
    }
    for (let x = 1024; x >= 0; x -= 16) {
      const fala = Math.sin(x / 90 + i * 2.1) * 7;
      ctx.lineTo(x, y + wys + fala);
    }
    ctx.fill();
  }
  // turkusowe „burze"
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = `rgba(79,209,197,${0.05 + Math.random() * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * 1024, 120 + Math.random() * 280, 26 + Math.random() * 60, 7 + Math.random() * 12, 0, 0, Math.PI * 2);
    ctx.fill();
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
  // Rysujemy współśrodkowe okręgi o różnej przezroczystości.
  // WAŻNE: pierścień 3D „czyta" z tekstury obszar między ~57% a 100%
  // odległości od środka — dlatego malujemy promienie 150–254 px.
  for (let r = 150; r < 254; r++) {
    const pasmo =
      Math.sin(r * 0.32) * 0.5 + Math.sin(r * 0.09) * 0.5; // nieregularność
    const alfa = Math.max(0, 0.16 + pasmo * 0.18);
    const kolor = r % 26 < 13 ? "201,191,255" : "209,124,232";
    ctx.strokeStyle = `rgba(${kolor},${alfa.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(srodek, srodek, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  return c;
}

/* --- Poświata za planetą (miękkie kółko światła) --- */
function namalujPoswiate(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(139,124,247,0.55)");
  g.addColorStop(0.5, "rgba(139,124,247,0.18)");
  g.addColorStop(1, "rgba(139,124,247,0)");
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
        // Silnik Three.js dociąga się dopiero tutaj (leniwie)
        const THREE = await import("three");
        const el = pojemnik.current;
        if (zatrzymana || !el) return;

        /* — podstawa sceny — */
        const scena = new THREE.Scene();
        const kamera = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, 0.1, 50);
        kamera.position.set(0, 0.4, 6.2);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.domElement.style.pointerEvents = "none"; // gwiazdy pod spodem mają działać
        el.appendChild(renderer.domElement);

        /* — światła (słońce + delikatne wypełnienie) — */
        scena.add(new THREE.AmbientLight(0xffffff, 0.55));
        const slonce = new THREE.DirectionalLight(0xffffff, 2.4);
        slonce.position.set(-4, 2.5, 3);
        scena.add(slonce);

        /* — grupa planety (żeby wszystko przechylać razem) — */
        const uklad = new THREE.Group();
        uklad.rotation.z = 0.16; // lekki, elegancki przechył całości
        scena.add(uklad);

        /* — planeta — */
        const teksturaPlanety = new THREE.CanvasTexture(namalujPlanete());
        teksturaPlanety.colorSpace = THREE.SRGBColorSpace;
        const planeta = new THREE.Mesh(
          new THREE.SphereGeometry(1.35, 64, 64),
          new THREE.MeshStandardMaterial({ map: teksturaPlanety, roughness: 0.9 })
        );
        uklad.add(planeta);

        /* — pierścienie — */
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
        pierscienie.rotation.x = -1.18; // pochylenie pierścieni
        uklad.add(pierscienie);

        /* — księżyc na orbicie — */
        const ksiezyc = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 32, 32),
          new THREE.MeshStandardMaterial({ color: 0xcfc8ff, roughness: 0.7 })
        );
        uklad.add(ksiezyc);

        /* — poświata za planetą — */
        const poswiata = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(namalujPoswiate()),
            transparent: true,
            depthWrite: false,
          })
        );
        poswiata.scale.set(5.6, 5.6, 1);
        poswiata.position.z = -1.5;
        scena.add(poswiata);

        /* — pętla animacji — */
        const zegar = new THREE.Clock();
        let katKsiezyca = Math.random() * Math.PI * 2;
        function animuj() {
          const dt = zegar.getDelta();
          planeta.rotation.y += dt * 0.22;        // obrót planety
          pierscienie.rotation.z += dt * 0.02;    // leniwy dryf pierścieni
          katKsiezyca += dt * 0.35;               // orbita księżyca
          ksiezyc.position.set(
            Math.cos(katKsiezyca) * 2.4,
            Math.sin(katKsiezyca) * 0.5,          // orbita lekko nachylona
            Math.sin(katKsiezyca) * 1.1
          );
          renderer.render(scena, kamera);
          klatka = requestAnimationFrame(animuj);
        }
        animuj();
        setGotowa(true);

        /* — dopasowanie do rozmiaru okna — */
        const obserwator = new ResizeObserver(() => {
          kamera.aspect = el.clientWidth / el.clientHeight;
          kamera.updateProjectionMatrix();
          renderer.setSize(el.clientWidth, el.clientHeight);
        });
        obserwator.observe(el);

        /* — sprzątanie przy wyjściu — */
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
        // brak WebGL albo inny problem → elegancki fallback
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
