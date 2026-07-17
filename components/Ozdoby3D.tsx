"use client";
// ============================================================
// OZDOBY HERO — dwa rodzaje dekoracji na tle sceny z planetami:
//
// 1. TRZY chipy z technologiami w rogach ekranu (kiedyś było 16 —
//    robiły chaos na tle kosmosu, zostały najbardziej „oddychające").
//    Chipy odskakują sprężyście od kursora po najechaniu.
// 2. TURKUSOWA MINI-PLANETA z księżycem krążącym po elipsie
//    (lewy dolny róg). Czysty CSS — księżyc w górnej części orbity
//    maleje i przygasa („jest dalej"), w dolnej rośnie („bliżej"),
//    co daje wrażenie prawdziwej orbity 3D. Kolor turkusowy to ten
//    sam odcień, co „burze" na dużym gazowym olbrzymie obok.
// ============================================================

// Trzy „gwiazdy"-chipy: rogi ekranu, z dala od słońca (środek-góra),
// planety z pierścieniami (środek-prawo) i różowej (prawy górny róg).
// s = skala (rozmiar), o = jasność, migocze = czy ma pulsować
const gwiazdy = [
  { nazwa: "⚡ Next.js",       top: "7%",  left: "7%",  s: 0.9,  o: 0.75, migocze: false },
  { nazwa: "🚀 Landing Pages", top: "84%", left: "13%", s: 0.9,  o: 0.7,  migocze: false },
  { nazwa: "🎨 UI/UX",         top: "89%", left: "72%", s: 0.85, o: 0.6,  migocze: true },
];

/* --- Turkusowa mini-planeta z orbitującym księżycem (czysty CSS) --- */
function PlanetkaTurkusowa() {
  return (
    // Prawa krawędź hero, tuż ZA pierścieniami dużej planety (życzenie
    // właściciela). right-[6%] zostawia zapas, żeby elipsa orbity księżyca
    // (±70 px) nie ucinała się na krawędzi ekranu.
    <span className="absolute right-[6%] top-[46%] hidden lg:block">
      {/* delikatna poświata za planetą */}
      <span className="absolute -inset-5 rounded-full bg-teal-400/15 blur-xl" />
      {/* kula planety (56 px) — gradient jak na pozostałych planetkach */}
      <span
        className="relative block h-14 w-14 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #c8f7ee 0%, #4fd1c5 38%, #1f8f92 72%, #0d4a4f 100%)",
        }}
      />
      {/* orbita księżyca: nachylona elipsa wokół środka planety */}
      <span className="absolute left-1/2 top-1/2 block rotate-[-14deg]">
        {/* księżyc — pozycję na elipsie animuje klasa .orbituj (globals.css) */}
        <span className="orbituj block h-2 w-2 rounded-full bg-[#dff7f2] shadow-[0_0_6px_1px_rgba(79,209,197,0.5)]" />
      </span>
    </span>
  );
}

export default function Ozdoby3D() {
  /* Sprężyste odskoczenie chipa od kursora (tylko przy najechaniu) */
  function odskocz(zdarzenie: React.MouseEvent<HTMLSpanElement>) {
    const chip = zdarzenie.currentTarget;
    const r = chip.getBoundingClientRect();
    // wektor OD kursora DO środka chipa → chip ucieka w tę stronę
    const dx = r.left + r.width / 2 - zdarzenie.clientX;
    const dy = r.top + r.height / 2 - zdarzenie.clientY;
    const dlugosc = Math.max(Math.hypot(dx, dy), 1);
    const sila = 26;
    chip.style.transform = `translate(${((dx / dlugosc) * sila).toFixed(1)}px, ${((dy / dlugosc) * sila).toFixed(1)}px) rotate(${dx > 0 ? 5 : -5}deg) scale(1.1)`;
  }
  function wroc(zdarzenie: React.MouseEvent<HTMLSpanElement>) {
    zdarzenie.currentTarget.style.transform = "";
  }

  return (
    // top-20 (80px) = wysokość navbaru — ozdoby zaczynają się POD nim,
    // żeby nic nie nachodziło na menu.
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-20 z-0">
      <PlanetkaTurkusowa />
      {gwiazdy.map((gwiazda) => (
        <span
          key={gwiazda.nazwa}
          onMouseEnter={odskocz}
          onMouseLeave={wroc}
          className={`absolute select-none rounded-full border border-zinc-200/80 bg-white/60 px-3.5 py-1.5 text-[11px] font-semibold text-zinc-600 backdrop-blur-sm [transition:transform_.45s_cubic-bezier(.34,1.56,.64,1)] dark:border-white/10 dark:bg-zinc-800/50 dark:text-zinc-300 ${
            gwiazda.migocze ? "migocze" : ""
          }`}
          style={{
            top: gwiazda.top,
            left: gwiazda.left,
            scale: String(gwiazda.s),
            opacity: gwiazda.o,
          }}
        >
          {gwiazda.nazwa}
        </span>
      ))}
    </div>
  );
}
