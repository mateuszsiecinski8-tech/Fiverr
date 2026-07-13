"use client";
// ============================================================
// GWIAZDOZBIÓR CHIPÓW — nazwy technologii rozrzucone po całym
// ekranie hero jak gwiazdy na niebie (tło dla planety 3D).
//
// • Każdy chip ma inną pozycję, rozmiar i jasność — jak prawdziwe
//   gwiazdy; niektóre delikatnie „migoczą" (sama przezroczystość,
//   bez ruchu).
// • Chipy poruszają się TYLKO, gdy najedziesz na nie myszką:
//   sprężyście odskakują od kursora i wracają na miejsce.
// • Listę nazw edytujesz w lib/dane.ts (lista „technologie").
// • Na telefonach pokazujemy tylko kilka najjaśniejszych (bez tłoku).
// ============================================================

import { technologie } from "@/lib/dane";

// Pozycje „gwiazd" na ekranie hero (w % szerokości/wysokości sekcji).
// Chipy trzymają się GÓRNEGO i DOLNEGO pasa hero (tam jest pusto),
// żeby nie nachodzić ani na tekst (lewy środek), ani na planety (prawa
// strona) — jak gwiazdy oprawiające scenę.
// s = skala (rozmiar), o = jasność, migocze = czy ma pulsować
const gwiazdy = [
  // — górny pas (poniżej navbara, nad treścią) —
  { top: "13%", left: "6%",  s: 0.9,  o: 0.7,  migocze: false, mobil: true },
  { top: "11%", left: "22%", s: 0.8,  o: 0.5,  migocze: true,  mobil: false },
  { top: "15%", left: "40%", s: 0.85, o: 0.6,  migocze: false, mobil: false },
  { top: "12%", left: "55%", s: 0.8,  o: 0.5,  migocze: true,  mobil: true },
  { top: "15%", left: "68%", s: 0.9,  o: 0.65, migocze: false, mobil: false },
  // — dolny pas (pod treścią) —
  { top: "92%", left: "8%",  s: 0.85, o: 0.6,  migocze: true,  mobil: false },
  { top: "90%", left: "22%", s: 0.95, o: 0.8,  migocze: false, mobil: true },
  { top: "94%", left: "37%", s: 0.8,  o: 0.5,  migocze: true,  mobil: false },
  { top: "91%", left: "52%", s: 0.85, o: 0.65, migocze: false, mobil: false },
  { top: "94%", left: "67%", s: 0.8,  o: 0.5,  migocze: true,  mobil: true },
  { top: "90%", left: "80%", s: 0.9,  o: 0.7,  migocze: false, mobil: false },
  { top: "93%", left: "91%", s: 0.8,  o: 0.55, migocze: true,  mobil: false },
];

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
    <div aria-hidden="true" className="absolute inset-0 z-0">
      {gwiazdy.map((gwiazda, i) => {
        const nazwa = technologie[i % technologie.length];
        return (
          <span
            key={`${nazwa}-${i}`}
            onMouseEnter={odskocz}
            onMouseLeave={wroc}
            className={`absolute select-none rounded-full border border-zinc-200/80 bg-white/60 px-3.5 py-1.5 text-[11px] font-semibold text-zinc-600 backdrop-blur-sm [transition:transform_.45s_cubic-bezier(.34,1.56,.64,1)] dark:border-white/10 dark:bg-zinc-800/50 dark:text-zinc-300 ${
              gwiazda.migocze ? "migocze" : ""
            } ${gwiazda.mobil ? "" : "hidden lg:inline-block"}`}
            style={{
              top: gwiazda.top,
              left: gwiazda.left,
              scale: String(gwiazda.s),
              opacity: gwiazda.o,
            }}
          >
            {nazwa}
          </span>
        );
      })}
    </div>
  );
}
