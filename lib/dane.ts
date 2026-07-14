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
  email: "mateuszsiecinski8@gmail.com",                     // ← twój adres email
  instagram: "https://instagram.com/twoj-nick",
  behance: "https://behance.net/twoj-nick",
  dribbble: "https://dribbble.com/twoj-nick",
  linkedin: "https://linkedin.com/in/twoj-nick",
};

// --- SEKCJA 1: HERO (góra strony) ---
// Strona jest PO ANGIELSKU (klienci z Fiverr) — teksty edytuj po angielsku.
export const hero = {
  dostepnosc: "Available for new projects",
  // Imię lub nick — wyświetla się bardzo dużą czcionką
  imie: "Maty",
  // Druga linijka nagłówka (ta z kolorowym gradientem)
  imieAkcent: "Web Design",
  // Jedno zdanie o Tobie
  opis:
    "I design websites, brands and interfaces that look premium and sell. From idea to finished product — no compromises.",
  przyciskPrace: "View my work",
  przyciskKontakt: "Get in touch",
  // Trzy liczby pod przyciskami — buduj wiarygodność (edytuj śmiało!)
  statystyki: [
    { liczba: "6+", opis: "projects in portfolio" },
    { liczba: "<24h", opis: "response time" },
    { liczba: "100%", opis: "on-time delivery" },
  ],
};

// --- „GWIAZDY" W HERO — nazwy technologii unoszące się wokół planety ---
// (pozycje na ekranie ustawia components/Ozdoby3D.tsx)
export const technologie = [
  "⚡ Next.js",
  "⚛ React",
  "🎨 UI/UX",
  "✦ Figma",
  "🌊 Tailwind CSS",
  "◉ Three.js · 3D",
  "🧠 TypeScript",
  "✏️ Branding",
  "🔍 SEO",
  "✨ Animations",
  "🚀 Landing Pages",
  "🛍️ E-commerce",
  "🖌️ Photoshop",
  "📐 Illustrator",
  "📱 Mobile-first",
  "🧩 Design Systems",
];

// --- PASEK PRZEWIJANYCH HASEŁ (marquee, pod sekcją hero) ---
export const marquee = [
  "Websites",
  "Landing Pages",
  "Branding",
  "Logo Design",
  "UI/UX Design",
  "Figma",
  "Next.js",
  "Animations",
  "Social Media Graphics",
];

// --- SEKCJA 2: USŁUGI (3 karty) ---
export const uslugi = [
  {
    ikona: "monitor", // nie zmieniaj — to nazwa ikony
    tytul: "Websites & Landing Pages",
    opis:
      "Modern, fast websites that impress from the first second and turn visitors into customers.",
    // Co klient dostaje (lista z „ptaszkami")
    zawiera: [
      "Design + development",
      "Fully responsive (mobile-first)",
      "Speed & SEO optimization",
      "Ready to publish",
    ],
  },
  {
    ikona: "paleta",
    tytul: "Graphics & Branding",
    opis:
      "A consistent visual identity that makes your brand look professional everywhere it appears.",
    zawiera: [
      "Logo + brand guidelines",
      "Color palette & typography",
      "Social media graphics",
      "Print-ready materials",
    ],
  },
  {
    ikona: "warstwy",
    tytul: "UI/UX Design",
    opis:
      "App and website interfaces designed to be beautiful, intuitive and a pleasure to use.",
    zawiera: [
      "Wireframes & prototypes (Figma)",
      "Full interface design",
      "Design system for developers",
      "Usability testing",
    ],
  },
];

// --- PROJEKT WYRÓŻNIONY (prawdziwy klient!) ---
// Wyświetla się jako duża karta NAD siatką portfolio.
// ⭐ Miniaturę podmienisz, wrzucając zrzut ekranu strony
//    do pliku: public/portfolio/justyna.jpg (ta sama nazwa!)
export const projektWyrozniony = {
  odznaka: "Real client",
  tytul: "Justyna Rodziewicz — Premium Real Estate",
  podtytul: "An elegant website for a premium real estate agency from Poland",
  opis: "A complete brand website for a licensed real estate agent. Minimalist, luxurious design (beige + black palette), numbered sections, a filterable property listing, a property-selling form and podcast integration. Responsive, polished, built to inspire trust and prestige.",
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
    tytul: "Flowly — SaaS landing page",
    kategoria: "Website",
    uklad: "szeroki",
    obraz: "/portfolio/flowly.jpg",
    link: "/prace/flowly.html",
  },
  {
    tytul: "Calmo — meditation app",
    kategoria: "UI/UX",
    uklad: "waski",
    obraz: "/portfolio/calmo.jpg",
    link: "/prace/calmo.html",
  },
  {
    tytul: "Palona — café brand identity",
    kategoria: "Branding",
    uklad: "waski",
    obraz: "/portfolio/palona-brand.jpg",
    link: "/prace/palona-brand.html",
  },
  {
    tytul: "PULS Studio — fitness website",
    kategoria: "Website",
    uklad: "szeroki",
    obraz: "/portfolio/puls.jpg",
    link: "/prace/puls.html",
  },
  {
    tytul: "NOIA — cosmetics brand",
    kategoria: "Website",
    uklad: "szeroki",
    obraz: "/portfolio/noia.jpg",
    link: "/prace/noia.html",
  },
  {
    tytul: "Palona — café website",
    kategoria: "Website",
    uklad: "waski",
    obraz: "/portfolio/palona-www.jpg",
    link: "/prace/palona.html",
  },
];

// --- SEKCJA 4: PROCES (4 kroki współpracy) ---
export const proces = [
  {
    tytul: "Brief",
    opis: "You tell me about your project, your goals and the style you love. I ask questions to understand everything perfectly.",
  },
  {
    tytul: "Design",
    opis: "I get to work. You receive the first version of the design on the agreed date — no surprises.",
  },
  {
    tytul: "Revisions",
    opis: "Together we polish the details. I apply your feedback quickly, until everything feels just right.",
  },
  {
    tytul: "Delivery",
    opis: "You receive the final, ready-to-use files. And I stay around in case you need anything else.",
  },
];

// --- SEKCJA 5: OPINIE (3 karty) ---
export const opinie = [
  {
    imie: "Anna K.",
    rola: "Online store owner",
    tresc:
      "Top-level collaboration. The website looks better than I imagined, and everything was ready ahead of schedule. I recommend him to everyone!",
  },
  {
    imie: "Thomas W.",
    rola: "Founder, SaaS startup",
    tresc:
      "Great communication and full professionalism. The landing page we received doubled our conversion rate in the first month.",
  },
  {
    imie: "Caroline M.",
    rola: "Marketing manager",
    tresc:
      "Branding that finally looks consistent. Fast revisions, zero communication problems. I'll definitely be back with more projects.",
  },
];

// --- SEKCJA 6: CENNIK (3 pakiety) ---
export const cennik = [
  {
    nazwa: "Basic",
    cena: "from $120",
    opis: "Perfect to start — a single graphic design or a simple landing page.",
    wyrozniony: false, // false = zwykła karta
    zawiera: [
      "1 design (logo or landing page)",
      "2 revision rounds",
      "Source files",
      "Delivery within 7 days",
    ],
  },
  {
    nazwa: "Standard",
    cena: "from $350",
    opis: "Most popular — a complete website or a mini brand identity.",
    wyrozniony: true, // true = wyróżniona karta (kolorowa ramka + odznaka)
    zawiera: [
      "Website up to 5 pages or branding",
      "4 revision rounds",
      "Mobile version + optimization",
      "Source files + handover guide",
      "Delivery within 14 days",
    ],
  },
  {
    nazwa: "Premium",
    cena: "from $800",
    opis: "The full package — website, branding and support in one.",
    wyrozniony: false,
    zawiera: [
      "Website + full brand identity",
      "Unlimited revisions",
      "Social media graphics starter pack",
      "30 days of post-launch support",
      "Priority delivery",
    ],
  },
];

// --- SEKCJA 7: KONTAKT / CTA ---
export const kontakt = {
  naglowek: "Got a project? Let's make something great.",
  opis: "Message me on Fiverr or by email — I usually reply within a few hours. The first quote is always free.",
  przycisk: "Message me on Fiverr",
};

// --- STOPKA ---
export const stopka = {
  nazwa: "Maty — Web Design", // podpis w stopce
};
