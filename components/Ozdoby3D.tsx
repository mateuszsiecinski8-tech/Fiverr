"use client";
// ============================================================
// OZDOBY HERO — dekoracja na tle sceny z planetami:
// STONOWANA TURKUSOWA MINI-PLANETA z księżycem krążącym po elipsie
// (prawa krawędź, wysokość środka — za pierścieniami dużej planety).
// Czysty CSS —
// księżyc w górnej części orbity maleje i przygasa („jest dalej"),
// w dolnej rośnie („bliżej"), co daje wrażenie prawdziwej orbity 3D.
// Krąży w PRZECIWNĄ stronę niż księżyce dużej fioletowej planety.
//
// (Latające chipy z technologiami zostały usunięte na życzenie
// właściciela — zostaje tylko czysta scena kosmiczna.)
// ============================================================

/* --- Spadająca gwiazda — co ~13 s przelatuje ukosem przez niebo hero.
       Animacja .spadajaca-gwiazda (globals.css) jest zapętlona, więc
       gwiazda wraca cyklicznie, nie tylko raz po wczytaniu strony. --- */
function SpadajacaGwiazda() {
  return (
    <span className="spadajaca-gwiazda absolute left-[30%] top-[10%] hidden lg:block">
      {/* smuga pod kątem lotu (~32°) — jaśniejsza „głowa" z przodu */}
      <span className="relative block h-px w-28 rotate-[32deg] bg-gradient-to-l from-white/90 via-white/40 to-transparent">
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.6)]" />
      </span>
    </span>
  );
}

/* --- Turkusowa mini-planeta z orbitującym księżycem (czysty CSS) --- */
function PlanetkaTurkusowa() {
  return (
    // Prawa krawędź hero, na wysokości środka — tuż ZA pierścieniami dużej
    // planety (życzenie właściciela). right-[6%] zostawia zapas, żeby elipsa
    // orbity księżyca nie ucinała się na krawędzi ekranu.
    <span className="absolute right-[6%] top-[46%] hidden lg:block">
      {/* delikatna, stonowana poświata za planetą */}
      <span className="absolute -inset-5 rounded-full bg-teal-600/10 blur-xl" />
      {/* Kula planety (56 px). Kolor STONOWANY (mniej neonowy turkus), żeby
          spokojnie współgrał z fioletową i różową planetą obok. */}
      <span
        className="relative block h-14 w-14 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #a6ccc8 0%, #5f9a95 42%, #3a6d69 74%, #183e40 100%)",
        }}
      />
      {/* orbita księżyca: nachylona elipsa wokół środka planety */}
      <span className="absolute left-1/2 top-1/2 block rotate-[-14deg]">
        {/* Księżyc — pozycję na elipsie animuje klasa .orbituj (globals.css).
            animationDirection: "reverse" = krąży w PRZECIWNĄ stronę niż
            księżyce dużej fioletowej planety (życzenie właściciela).
            Tło to baza + 3 delikatne ciemniejsze plamy = mini-"kratery". */}
        <span
          className="orbituj block h-2 w-2 rounded-full shadow-[0_0_6px_1px_rgba(95,154,149,0.45)]"
          style={{
            animationDirection: "reverse",
            background:
              "radial-gradient(circle at 30% 28%, rgba(15,60,58,0.5) 0%, transparent 42%), radial-gradient(circle at 68% 60%, rgba(15,60,58,0.38) 0%, transparent 38%), radial-gradient(circle at 48% 80%, rgba(15,60,58,0.3) 0%, transparent 34%), #d7e8e5",
          }}
        />
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
      <SpadajacaGwiazda />
    </div>
  );
}
