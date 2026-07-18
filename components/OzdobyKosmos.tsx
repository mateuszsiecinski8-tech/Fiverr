// ============================================================
// KOSMICZNE OZDOBY SEKCJI — subtelne „smaczki" nawiązujące do
// sceny 3D z góry strony: mała planetka z pierścieniem, kometa,
// półksiężyc, migoczące gwiazdki i powoli DRYFUJĄCE chipy
// z technologiami (te same, co „gwiazdy" w hero — tylko tutaj latają).
//
// • Czysty CSS — zero JavaScriptu, strona nie robi się cięższa.
// • Wszystko jest dekoracją: aria-hidden + pointer-events-none,
//   czyli nie przeszkadza czytnikom ekranu ani myszce.
// • Każda sekcja ma swój zestaw (prop „wariant"), żeby ozdoby
//   się nie powtarzały jak tapeta.
// • Większość ozdób widać tylko na komputerach (lg:) — na telefonie
//   sekcje zostają czyste.
// • Animacje wyłączają się przy „ograniczeniu animacji" (dostępność).
// ============================================================

/* --- Mała planetka z pierścieniem (jak planeta z hero, w miniaturze) --- */
function Planetka({ rozmiar = 52, odcien = "fiolet" }: { rozmiar?: number; odcien?: "fiolet" | "roz" }) {
  const gradient =
    odcien === "fiolet"
      ? "radial-gradient(circle at 32% 28%, #c9bfff 0%, #8b7cf7 40%, #5b47d6 75%, #37277f 100%)"
      : "radial-gradient(circle at 32% 28%, #ffd7ea 0%, #f06fae 45%, #b0407e 80%, #7c2b58 100%)";
  return (
    <span className="relative block" style={{ width: rozmiar, height: rozmiar }}>
      {/* kula */}
      <span className="absolute inset-0 rounded-full" style={{ background: gradient }} />
      {/* pierścień — spłaszczona elipsa pod kątem */}
      <span
        className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] scale-y-[0.32] rounded-full border border-white/30"
        style={{ width: rozmiar * 1.7, height: rozmiar * 1.7 }}
      />
    </span>
  );
}

/* --- Półksiężyc (kółko z „wygryzionym" cieniem) --- */
function Ksiezycek({ rozmiar = 26 }: { rozmiar?: number }) {
  return (
    <span
      className="block rounded-full"
      style={{
        width: rozmiar,
        height: rozmiar,
        // cień wewnętrzny „zjada" część tarczy → sierp księżyca
        boxShadow: `inset ${rozmiar * 0.28}px ${-rozmiar * 0.1}px 0 0 rgba(226,222,255,0.55)`,
      }}
    />
  );
}

/* --- Kometa — co kilkanaście sekund przelatuje krótka smuga --- */
function Kometa({ opoznienie = 0 }: { opoznienie?: number }) {
  return (
    <span className="kometa block" style={{ animationDelay: `${opoznienie}s` }}>
      {/* smuga ustawiona pod kątem lotu (ok. 32°) */}
      <span className="relative block h-px w-24 rotate-[32deg] bg-gradient-to-l from-white/80 via-white/35 to-transparent">
        {/* głowa komety — jasny punkt z poświatą */}
        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.55)]" />
      </span>
    </span>
  );
}

/* --- Migocząca gwiazdka (kropka) --- */
function Gwiazdka({ opoznienie = 0, jasnosc = 0.5 }: { opoznienie?: number; jasnosc?: number }) {
  return (
    <span
      className="migocze block h-1 w-1 rounded-full bg-white"
      style={{ opacity: jasnosc, animationDelay: `${opoznienie}s` }}
    />
  );
}

/* Pomocnik: pozycjonowanie w rogu sekcji */
function Punkt({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`absolute ${className}`}>{children}</span>;
}

// ------------------------------------------------------------
// GŁÓWNY KOMPONENT — wybiera zestaw ozdób dla danej sekcji
// ------------------------------------------------------------
export default function OzdobyKosmos({
  wariant,
}: {
  wariant: "uslugi" | "portfolio" | "proces" | "opinie" | "kontakt";
}) {
  return (
    // klasa „ozdoby-kosmos": w trybie lotu (ZUI) te ozdoby są chowane,
    // bo w tle jest wtedy prawdziwy kosmos 3D — patrz app/globals.css
    <div aria-hidden="true" className="ozdoby-kosmos pointer-events-none absolute inset-0 overflow-hidden">
      {wariant === "uslugi" && (
        <>
          <Punkt className="right-[6%] top-16 hidden opacity-70 lg:block"><Planetka rozmiar={46} odcien="roz" /></Punkt>
          <Punkt className="left-[16%] top-14"><Gwiazdka jasnosc={0.5} /></Punkt>
          <Punkt className="left-[38%] top-24"><Gwiazdka opoznienie={1.4} jasnosc={0.35} /></Punkt>
          <Punkt className="right-[28%] top-[30%]"><Gwiazdka opoznienie={2.6} jasnosc={0.45} /></Punkt>
          <Punkt className="left-[8%] top-[26%] hidden lg:block"><Kometa /></Punkt>
        </>
      )}

      {wariant === "portfolio" && (
        <>
          <Punkt className="left-[5%] top-24 hidden opacity-60 lg:block"><Ksiezycek rozmiar={30} /></Punkt>
          <Punkt className="right-[18%] top-16"><Gwiazdka jasnosc={0.4} /></Punkt>
          <Punkt className="right-[9%] bottom-24"><Gwiazdka opoznienie={2} jasnosc={0.5} /></Punkt>
          <Punkt className="left-[30%] top-12"><Gwiazdka opoznienie={3.2} jasnosc={0.3} /></Punkt>
          <Punkt className="right-[12%] top-[12%] hidden lg:block"><Kometa opoznienie={6} /></Punkt>
        </>
      )}

      {wariant === "proces" && (
        <>
          <Punkt className="right-[5%] top-20 hidden opacity-70 lg:block"><Planetka rozmiar={56} /></Punkt>
          <Punkt className="left-[42%] top-16"><Gwiazdka jasnosc={0.45} /></Punkt>
          <Punkt className="right-[26%] bottom-16"><Gwiazdka opoznienie={1.8} jasnosc={0.35} /></Punkt>
          <Punkt className="left-[10%] top-16 hidden lg:block"><Kometa opoznienie={3} /></Punkt>
        </>
      )}

      {wariant === "opinie" && (
        <>
          <Punkt className="left-[4%] top-[30%] hidden opacity-60 lg:block"><Planetka rozmiar={38} odcien="roz" /></Punkt>
          {/* (był tu drugi półksiężyc — usunięty: siedział za blisko tego
              z sekcji Kontakt tuż niżej i razem wyglądały źle) */}
          <Punkt className="left-[24%] top-14"><Gwiazdka opoznienie={0.8} jasnosc={0.4} /></Punkt>
          <Punkt className="right-[32%] top-20"><Gwiazdka opoznienie={2.4} jasnosc={0.5} /></Punkt>
          <Punkt className="left-[12%] bottom-20"><Gwiazdka opoznienie={3.6} jasnosc={0.3} /></Punkt>
        </>
      )}

      {wariant === "kontakt" && (
        <>
          {/* Kontakt ma w środku ciemną kartę — ozdoby siedzą na marginesach */}
          <Punkt className="right-[3%] top-[24%] hidden opacity-70 lg:block"><Ksiezycek rozmiar={26} /></Punkt>
          <Punkt className="right-[6%] bottom-[30%]"><Gwiazdka opoznienie={1.2} jasnosc={0.45} /></Punkt>
          <Punkt className="left-[8%] top-[18%]"><Gwiazdka opoznienie={2.8} jasnosc={0.35} /></Punkt>
        </>
      )}
    </div>
  );
}
