"use client";
// ============================================================
// OZDOBY HERO — dekoracja na tle sceny z planetami:
// TURKUSOWA MINI-PLANETA z księżycem krążącym po elipsie
// (lewy dolny róg). Czysty CSS — księżyc w górnej części orbity
// maleje i przygasa („jest dalej"), w dolnej rośnie („bliżej"),
// co daje wrażenie prawdziwej orbity 3D. Kolor turkusowy to ten
// sam odcień, co „burze" na dużym gazowym olbrzymie obok.
//
// (Latające chipy z technologiami zostały usunięte na życzenie
// właściciela — zostaje tylko czysta scena kosmiczna.)
// ============================================================

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
  return (
    // top-20 (80px) = wysokość navbaru — ozdoby zaczynają się POD nim,
    // żeby nic nie nachodziło na menu.
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-20 z-0">
      <PlanetkaTurkusowa />
    </div>
  );
}
