// ============================================================
//  ✏️  TWÓJ PANEL EDYCJI — WSZYSTKIE TEKSTY STRONY W JEDNYM MIEJSCU
// ============================================================
//  Chcesz zmienić imię, ceny, opinie albo link do Fiverr?
//  Edytuj TYLKO ten plik — strona zaktualizuje się sama.
//  Nie musisz dotykać żadnego innego pliku z kodem.
// ============================================================

// --- LINKI (podmień na swoje!) ---
export const linki = {
  fiverr: "https://www.fiverr.com/matthew_maty", // twój profil Fiverr
  email: "twoj@email.com",                     // ← twój adres email
  instagram: "https://instagram.com/twoj-nick",
  behance: "https://behance.net/twoj-nick",
  dribbble: "https://dribbble.com/twoj-nick",
  linkedin: "https://linkedin.com/in/twoj-nick",
};

// --- SEKCJA 1: HERO (góra strony) ---
export const hero = {
  dostepnosc: "Dostępny do nowych projektów",
  // Imię lub nick — wyświetla się bardzo dużą czcionką
  imie: "Mateusz",
  // Druga linijka nagłówka (ta z kolorowym gradientem)
  imieAkcent: "Design & Web",
  // Jedno zdanie o Tobie
  opis:
    "Projektuję strony, marki i interfejsy, które wyglądają premium i sprzedają. Od pomysłu do gotowego projektu — bez kompromisów.",
  przyciskPrace: "Zobacz prace",
  przyciskKontakt: "Napisz do mnie",
  // 🎮 SCENA 3D (Spline) w sekcji hero. Działają DWA rodzaje linków:
  //  a) adres eksportu „...scene.splinecode" (Spline: Export → Code → React)
  //     — najładniejszy, bez ramki;
  //  b) zwykły link do sceny (np. z app.spline.design lub my.spline.design)
  //     — osadzany przez iframe, działa w darmowym planie Spline.
  // 💡 Jeśli zamiast sceny zobaczysz ekran logowania Spline — użyj linku
  //    publicznego: w Spline kliknij „Share" → skopiuj „Public URL"
  //    (my.spline.design/...) i wklej go tutaj.
  scena3d: "https://app.spline.design/ui/78988053-c6cc-4586-89ad-cd3da618cfab",
  // Trzy liczby pod przyciskami — buduj wiarygodność (edytuj śmiało!)
  statystyki: [
    { liczba: "6+", opis: "projektów w portfolio" },
    { liczba: "<24h", opis: "odpowiedź na wiadomości" },
    { liczba: "100%", opis: "terminowych realizacji" },
  ],
};

// --- PASEK PRZEWIJANYCH HASEŁ (marquee, pod sekcją hero) ---
export const marquee = [
  "Strony WWW",
  "Landing Page",
  "Branding",
  "Logo",
  "UI/UX Design",
  "Figma",
  "Next.js",
  "Animacje",
  "Grafika Social Media",
];

// --- SEKCJA 2: USŁUGI (3 karty) ---
export const uslugi = [
  {
    ikona: "monitor", // nie zmieniaj — to nazwa ikony
    tytul: "Strony & Landing Page",
    opis:
      "Nowoczesne, szybkie strony, które robią wrażenie od pierwszej sekundy i zamieniają odwiedzających w klientów.",
    // Co klient dostaje (lista z „ptaszkami")
    zawiera: [
      "Projekt + wdrożenie strony",
      "Pełna responsywność (mobile-first)",
      "Optymalizacja szybkości i SEO",
      "Gotowe do publikacji",
    ],
  },
  {
    ikona: "paleta",
    tytul: "Grafika & Branding",
    opis:
      "Spójna identyfikacja wizualna, dzięki której Twoja marka będzie wyglądać profesjonalnie w każdym miejscu.",
    zawiera: [
      "Logo + księga znaku",
      "Paleta kolorów i typografia",
      "Grafiki social media",
      "Materiały do druku",
    ],
  },
  {
    ikona: "warstwy",
    tytul: "UI/UX Design",
    opis:
      "Interfejsy aplikacji i serwisów zaprojektowane tak, żeby były piękne, intuicyjne i wygodne w użyciu.",
    zawiera: [
      "Makiety i prototypy (Figma)",
      "Projekt całego interfejsu",
      "Design system dla developerów",
      "Testy użyteczności",
    ],
  },
];

// --- PROJEKT WYRÓŻNIONY (prawdziwy klient!) ---
// Wyświetla się jako duża karta NAD siatką portfolio.
// ⭐ Miniaturę podmienisz, wrzucając zrzut ekranu strony
//    do pliku: public/portfolio/justyna.jpg (ta sama nazwa!)
export const projektWyrozniony = {
  odznaka: "Prawdziwy klient",
  tytul: "Justyna Rodziewicz — Nieruchomości Premium",
  podtytul: "Elegancka strona dla biura nieruchomości premium z Olsztyna",
  opis: "Kompletna strona-wizytówka dla licencjonowanej pośredniczki nieruchomości. Minimalistyczny, luksusowy design (paleta beż + czerń), numerowane sekcje, filtrowana baza ofert, formularz sprzedaży nieruchomości i integracja z podcastem. Responsywna, dopracowana, budująca zaufanie i prestiż marki.",
  tagi: ["Web Design", "Real Estate", "Branding"],
  link: "https://www.justynarodziewicz.pl/",
  obraz: "/portfolio/justyna.jpg",
};

// --- SEKCJA 3: PORTFOLIO (6 kart w siatce bento) ---
// „uklad" decyduje o rozmiarze kafelka: "szeroki" = 2 kolumny, "waski" = 1 kolumna
// „obraz"  = plik z folderu public/portfolio/ (kafelek-mockup projektu)
// „link"   = dokąd prowadzi klik (strony-demo leżą w public/prace/)
export const portfolio = [
  {
    tytul: "Flowly — landing SaaS",
    kategoria: "Strona WWW",
    uklad: "szeroki",
    obraz: "/portfolio/flowly.jpg",
    link: "/prace/flowly.html",
  },
  {
    tytul: "Calmo — aplikacja do medytacji",
    kategoria: "UI/UX",
    uklad: "waski",
    obraz: "/portfolio/calmo.jpg",
    link: "/prace/calmo.html",
  },
  {
    tytul: "Palona — identyfikacja kawiarni",
    kategoria: "Branding",
    uklad: "waski",
    obraz: "/portfolio/palona-brand.jpg",
    link: "/prace/palona-brand.html",
  },
  {
    tytul: "PULS Studio — strona fitness",
    kategoria: "Strona WWW",
    uklad: "szeroki",
    obraz: "/portfolio/puls.jpg",
    link: "/prace/puls.html",
  },
  {
    tytul: "NOIA — marka kosmetyków",
    kategoria: "Strona WWW",
    uklad: "szeroki",
    obraz: "/portfolio/noia.jpg",
    link: "/prace/noia.html",
  },
  {
    tytul: "Palona — strona kawiarni",
    kategoria: "Strona WWW",
    uklad: "waski",
    obraz: "/portfolio/palona-www.jpg",
    link: "/prace/palona.html",
  },
];

// --- SEKCJA 4: PROCES (4 kroki współpracy) ---
export const proces = [
  {
    tytul: "Brief",
    opis: "Opowiadasz mi o swoim projekcie, celach i stylu, który Ci się podoba. Zadaję pytania, żeby wszystko dobrze zrozumieć.",
  },
  {
    tytul: "Projekt",
    opis: "Zabieram się do pracy. Dostajesz pierwszą wersję projektu w ustalonym terminie — bez niespodzianek.",
  },
  {
    tytul: "Poprawki",
    opis: "Wspólnie dopracowujemy detale. Twoje uwagi wprowadzam szybko, aż wszystko będzie w punkt.",
  },
  {
    tytul: "Gotowe",
    opis: "Odbierasz finalne pliki gotowe do użycia. Zostaję do dyspozycji, gdybyś czegoś jeszcze potrzebował.",
  },
];

// --- SEKCJA 5: OPINIE (3 karty) ---
export const opinie = [
  {
    imie: "Anna K.",
    rola: "Właścicielka sklepu online",
    tresc:
      "Współpraca na najwyższym poziomie. Strona wygląda lepiej, niż sobie wyobrażałam, a całość była gotowa przed terminem. Polecam każdemu!",
  },
  {
    imie: "Tomasz W.",
    rola: "Founder, startup SaaS",
    tresc:
      "Świetny kontakt i pełen profesjonalizm. Landing page, który dostaliśmy, podwoił naszą konwersję w pierwszym miesiącu.",
  },
  {
    imie: "Karolina M.",
    rola: "Marketing manager",
    tresc:
      "Branding, który w końcu wygląda spójnie. Szybkie poprawki, zero problemów z komunikacją. Na pewno wrócę z kolejnymi projektami.",
  },
];

// --- SEKCJA 6: CENNIK (3 pakiety) ---
export const cennik = [
  {
    nazwa: "Basic",
    cena: "od 500 zł",
    opis: "Idealny na start — pojedynczy projekt graficzny lub prosta strona.",
    wyrozniony: false, // false = zwykła karta
    zawiera: [
      "1 projekt (logo lub landing page)",
      "2 rundy poprawek",
      "Pliki źródłowe",
      "Realizacja do 7 dni",
    ],
  },
  {
    nazwa: "Standard",
    cena: "od 1500 zł",
    opis: "Najczęściej wybierany — kompletna strona lub mini-branding.",
    wyrozniony: true, // true = wyróżniona karta (kolorowa ramka + odznaka)
    zawiera: [
      "Strona do 5 podstron lub branding",
      "4 rundy poprawek",
      "Wersja mobilna + optymalizacja",
      "Pliki źródłowe + instrukcja",
      "Realizacja do 14 dni",
    ],
  },
  {
    nazwa: "Premium",
    cena: "od 3500 zł",
    opis: "Pełen pakiet — strona, branding i wsparcie w jednym.",
    wyrozniony: false,
    zawiera: [
      "Strona + pełna identyfikacja wizualna",
      "Nielimitowane poprawki",
      "Grafiki social media na start",
      "30 dni wsparcia po wdrożeniu",
      "Priorytetowa realizacja",
    ],
  },
];

// --- SEKCJA 7: KONTAKT / CTA ---
export const kontakt = {
  naglowek: "Masz projekt? Zróbmy coś świetnego.",
  opis: "Napisz do mnie na Fiverr lub mailowo — odpowiadam zwykle w ciągu kilku godzin. Pierwsza wycena zawsze za darmo.",
  przycisk: "Napisz na Fiverr",
};

// --- STOPKA ---
export const stopka = {
  nazwa: "Mateusz — Design & Web", // podpis w stopce
};
