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
// Rozmieszczone nieregularnie; omijają blok tekstu (lewy środek)
// i sam środek planety (prawa strona, centrum).
// s = skala (rozmiar), o = jasność, migocze = czy ma pulsować
const gwiazdy = [
  { top: "8%",  left: "5%",  s: 1,    o: 0.9,  migocze: false, mobil: true },
  { top: "16%", left: "22%", s: 0.85, o: 0.55, migocze: true,  mobil: false },
  { top: "6%",  left: "38%", s: 0.8,  o: 0.45, migocze: true,  mobil: false },
  { top: "12%", left: "56%", s: 0.95, o: 0.8,  migocze: false, mobil: true },
  { top: "5%",  left: "74%", s: 0.8,  o: 0.5,  migocze: true,  mobil: false },
  { top: "14%", left: "90%", s: 1,    o: 0.85, migocze: false, mobil: true },
  { top: "34%", left: "50%", s: 0.85, o: 0.6,  migocze: true,  mobil: false },
  { top: "33%", left: "90%", s: 0.8,  o: 0.5,  migocze: true,  mobil: false },
  { top: "58%", left: "48%", s: 0.9,  o: 0.65, migocze: false, mobil: false },
  { top: "62%", left: "89%", s: 0.85, o: 0.55, migocze: true,  mobil: false },
  { top: "78%", left: "55%", s: 1,    o: 0.85, migocze: false, mobil: true },
  { top: "88%", left: "72%", s: 0.9,  o: 0.6,  migocze: true,  mobil: false },
  { top: "82%", left: "87%", s: 0.95, o: 0.75, migocze: false, mobil: false },
  { top: "88%", left: "10%", s: 0.85, o: 0.55, migocze: true,  mobil: false },
  { top: "90%", left: "34%", s: 0.9,  o: 0.65, migocze: false, mobil: true },
  { top: "84%", left: "45%", s: 0.75, o: 0.4,  migocze: true,  mobil: false },
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
