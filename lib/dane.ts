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

// --- PROJEKTY WYRÓŻNIONE (prawdziwi klienci!) ---
// Wyświetlają się jako duże karty NAD siatką portfolio (jedna pod drugą,
// co druga ma odbity układ — obraz po lewej).
// ⭐ Miniatury podmienisz, wrzucając zrzut ekranu strony do pliku
//    z folderu public/portfolio/ (ta sama nazwa co w polu „obraz"!)
export const projektyWyroznione = [
  {
    odznaka: "Real client",
    tytul: "Justyna Rodziewicz — Premium Real Estate",
    podtytul: "An elegant website for a premium real estate agency from Poland",
    opis: "A complete brand website for a licensed real estate agent. Minimalist, luxurious design (beige + black palette), numbered sections, a filterable property listing, a property-selling form and podcast integration. Responsive, polished, built to inspire trust and prestige.",
    tagi: ["Web Design", "Real Estate", "Branding"],
    link: "https://www.justynarodziewicz.pl/",
    obraz: "/portfolio/justyna.jpg",
    slug: "justyna", // → podstrona /case/justyna
  },
  {
    odznaka: "Real client",
    tytul: "Marcin Sieciński — Law Firm",
    podtytul: "A dignified website for an attorney with 30 years of experience",
    opis: "A complete online presence for an established law office from Poland. Dark, elegant palette with gold accents and classic serif typography, six clearly presented practice areas, animated achievement counters, client testimonials and a contact form. Every detail designed to communicate professionalism and build the trust a law practice depends on.",
    tagi: ["Web Design", "Legal", "Branding"],
    link: "https://www.kancelaria-adwokacka-marcin-siecinski.pl/",
    obraz: "/portfolio/kancelaria.jpg",
    slug: "kancelaria", // → podstrona /case/kancelaria
  },
];

// --- SEKCJA 3: PORTFOLIO (6 kart w siatce bento) ---
// „uklad" decyduje o rozmiarze kafelka: "szeroki" = 2 kolumny, "waski" = 1 kolumna
// „obraz"  = plik z folderu public/portfolio/ (kafelek-mockup projektu)
// „link"   = dokąd prowadzi klik (strony-demo leżą w public/prace/)
// ⭐ POLE „slug" (dopisane w ZUI v2) — to adres podstrony z opisem
//    projektu: /case/flowly, /case/aurelio itd. Taki link możesz
//    wkleić klientowi na czacie Fiverr. Treść tych podstron leży
//    niżej, w `studiaPrzypadku`.
export const portfolio = [
  {
    tytul: "Flowly — SaaS landing page",
    kategoria: "Website",
    uklad: "szeroki",
    obraz: "/portfolio/flowly.jpg",
    link: "/prace/flowly.html",
    slug: "flowly",
  },
  {
    tytul: "Calmo — meditation app",
    kategoria: "UI/UX",
    uklad: "waski",
    obraz: "/portfolio/calmo.jpg",
    link: "/prace/calmo.html",
    slug: "calmo",
  },
  {
    tytul: "Palona — café brand identity",
    kategoria: "Branding",
    uklad: "waski",
    obraz: "/portfolio/palona-brand.jpg",
    link: "/prace/palona-brand.html",
    slug: "palona-brand",
  },
  {
    tytul: "PULS Studio — fitness website",
    kategoria: "Website",
    uklad: "szeroki",
    obraz: "/portfolio/puls.jpg",
    link: "/prace/puls.html",
    slug: "puls",
  },
  {
    tytul: "NOIA — cosmetics brand",
    kategoria: "Website",
    uklad: "szeroki",
    obraz: "/portfolio/noia.jpg",
    link: "/prace/noia.html",
    slug: "noia",
  },
  {
    tytul: "Palona — café website",
    kategoria: "Website",
    uklad: "waski",
    obraz: "/portfolio/palona-www.jpg",
    link: "/prace/palona.html",
    slug: "palona",
  },
  // --- NOWE PROJEKTY POKAZOWE (ZUI v2) ---
  {
    tytul: "Aurelio — fine dining restaurant",
    kategoria: "Website",
    uklad: "szeroki",
    obraz: "/portfolio/aurelio.jpg",
    link: "/prace/aurelio.html",
    slug: "aurelio",
  },
  {
    tytul: "Northfield Dental — clinic",
    kategoria: "Website",
    uklad: "waski",
    obraz: "/portfolio/northfield.jpg",
    link: "/prace/northfield.html",
    slug: "northfield",
  },
  {
    tytul: "Elena Voss — photography portfolio",
    kategoria: "Website",
    uklad: "szeroki",
    obraz: "/portfolio/elena-voss.jpg",
    link: "/prace/elena-voss.html",
    slug: "elena-voss",
  },
  {
    tytul: "KANO — clothing store",
    kategoria: "E-commerce",
    uklad: "waski",
    obraz: "/portfolio/kano.jpg",
    link: "/prace/kano.html",
    slug: "kano",
  },
];

// ============================================================
// STUDIA PRZYPADKU — podstrony /case/<slug>
// ============================================================
// Każdy projekt ma własny adres z opisem: jakie było zadanie,
// jakie zapadły decyzje projektowe i na co patrzeć. Taki link
// robi na kliencie DUŻO lepsze wrażenie niż sam zrzut ekranu —
// i możesz go wysłać na czacie Fiverr.
//
// ⚠️ UCZCIWOŚĆ: projekty pokazowe to WYMYŚLONE marki, więc nie
// ma tu żadnych „podnieśliśmy sprzedaż o 40%". Takie liczby
// przy fikcyjnej firmie każdy doświadczony klient wyczuje —
// i przestanie wierzyć w całą resztę portfolio. Dlatego dema
// mają typ „Concept project" i opisują DECYZJE PROJEKTOWE,
// a twarde fakty są tylko przy prawdziwych klientach.
export type StudiumPrzypadku = {
  slug: string;
  typ: "Concept project" | "Client project";
  branza: string;
  rok: string;
  /** jedno zdanie — pokazuje się pod tytułem */
  zajawka: string;
  /** czego dotyczyło zadanie */
  brief: string;
  /** co robiłem w tym projekcie */
  rola: string[];
  /** 3 decyzje projektowe — to jest mięso case study */
  decyzje: { tytul: string; opis: string }[];
  /** na co zwrócić uwagę, wchodząc na demo */
  patrz: string[];
  /** paleta — kolory pokazują się jako próbki */
  paleta: string[];
  /** krój pisma użyty w projekcie */
  typografia: string;
};

export const studiaPrzypadku: StudiumPrzypadku[] = [
  {
    slug: "aurelio",
    typ: "Concept project",
    branza: "Fine dining restaurant",
    rok: "2026",
    zajawka: "A two-star restaurant that changes its menu weekly — so the website had to stop pretending it doesn't.",
    brief: "Most fine-dining websites open with a slideshow of plated food and hide the menu three clicks deep. I set myself the opposite brief: build a site where a guest can decide, in fifteen seconds, whether tonight is worth €145 — and book without emailing anyone.",
    rola: ["Art direction", "Web design", "Front-end build"],
    decyzje: [
      {
        tytul: "The menu is the hero, not the photography",
        opis: "The whole page is built around a menu that visibly changes. Courses are numbered rather than priced, because the price is fixed — putting a number next to each dish would have made an eight-course tasting read like an à la carte bill.",
      },
      {
        tytul: "Gold used once, never twice",
        opis: "One accent colour, reserved for three things only: the logo's centre letter, the primary button, and the course numbers. The moment a second gold element appears on screen, none of them feel special any more.",
      },
      {
        tytul: "Booking asks for less than it wants",
        opis: "Five fields, one of them optional. Every extra field on a reservation form costs bookings, and a restaurant can always phone back for details — it cannot phone back someone who gave up.",
      },
    ],
    patrz: [
      "The fixed bar under the hero: hours, seat count, price and address answer the four questions every guest asks before anything else.",
      "The room gallery uses no photographs at all — the images are built from CSS gradients, so the page weighs almost nothing.",
    ],
    paleta: ["#0e0d0b", "#c9a227", "#e8cf7a", "#f3efe6"],
    typografia: "Cormorant Garamond + Jost",
  },
  {
    slug: "northfield",
    typ: "Concept project",
    branza: "Dental clinic",
    rok: "2026",
    zajawka: "Designed for the patient who has been avoiding the dentist for nine years.",
    brief: "Dental websites tend to sell to people already looking for a dentist. The harder, more valuable audience is the one avoiding it — usually because of cost anxiety or fear. The whole design is aimed at that person.",
    rola: ["UX design", "Web design", "Copy direction", "Front-end build"],
    decyzje: [
      {
        tytul: "Prices on the homepage, not behind a form",
        opis: "Every treatment card ends with a real starting price. Hiding prices is the single biggest reason nervous patients never call — they assume the worst and never find out they were wrong.",
      },
      {
        tytul: "Soft shapes, and not one clinical photograph",
        opis: "Rounded corners, a mint-and-sand palette and serif headlines. Stock photos of dental instruments trigger exactly the anxiety this site exists to defuse, so there are none.",
      },
      {
        tytul: "The testimonial does the persuading",
        opis: "The one review on the page is specifically from a patient who avoided dentistry for nine years. A five-star average convinces nobody; one story that matches the reader's own does.",
      },
    ],
    patrz: [
      "The four-step ‘Your first visit' section — it removes uncertainty, which is what actually blocks the booking.",
      "The trust row under the hero mixes a rating, a length of service and an availability promise, rather than three vanity numbers.",
    ],
    paleta: ["#0f2a33", "#0e9c8a", "#7fd6c4", "#fdf3e7"],
    typografia: "Fraunces + Outfit",
  },
  {
    slug: "elena-voss",
    typ: "Concept project",
    branza: "Photography portfolio",
    rok: "2026",
    zajawka: "A portfolio where the design gets out of the way completely.",
    brief: "A documentary photographer's site has one job: make the work look like the most important thing on the screen. Every design flourish competes with the photographs, so the brief was to remove as much as possible and still have a site with personality.",
    rola: ["Art direction", "Web design", "Front-end build"],
    decyzje: [
      {
        tytul: "Almost no colour, and enormous type",
        opis: "The palette is off-white and near-black. The only saturated colour on the page comes from the images themselves — which means even a muted photograph reads as vivid.",
      },
      {
        tytul: "An asymmetric grid, so nothing reads as a template",
        opis: "Work is laid out on a twelve-column grid with pieces spanning seven and five columns in alternating rhythm. A uniform three-across grid makes every project look interchangeable.",
      },
      {
        tytul: "The navigation inverts against whatever is behind it",
        opis: "The menu uses blend mode rather than a background bar, so it stays legible over both a dark hero image and the pale page below without ever drawing a box around itself.",
      },
    ],
    patrz: [
      "The awards list is a plain table, not badges — for this audience, restraint is the credential.",
      "Captions sit under images in small caps, the way a print monograph would set them.",
    ],
    paleta: ["#111111", "#8a8a8a", "#e4e4e0", "#fafaf8"],
    typografia: "Instrument Serif + Inter",
  },
  {
    slug: "kano",
    typ: "Concept project",
    branza: "Clothing e-commerce",
    rok: "2026",
    zajawka: "A shop that competes on trust instead of discounts.",
    brief: "A small clothing brand cannot out-discount a giant retailer. The brief was to design a storefront where the reason to buy is confidence — in the materials, the price and what happens if something goes wrong.",
    rola: ["E-commerce UX", "Web design", "Front-end build"],
    decyzje: [
      {
        tytul: "The guarantees sit above the products",
        opis: "Free delivery, sixty-day returns, free repairs forever, and where it is made — placed directly under the hero, before a single product is shown. These four facts answer the objections that stop first-time buyers.",
      },
      {
        tytul: "Product cards carry colour swatches, not just a photo",
        opis: "Showing available colours on the card stops the most common dead end in small shops: clicking into a product, discovering the one colour you wanted is missing, and leaving.",
      },
      {
        tytul: "Sale badges are rationed",
        opis: "Only three of the eight products carry a badge. When every tile shouts, the eye stops registering any of them — scarcity is what makes a badge work.",
      },
    ],
    patrz: [
      "The brand story block publishes production numbers, including how many garments were repaired for free — a claim a competitor cannot copy cheaply.",
      "Reviews include a four-star one. A wall of five stars reads as filtered; one honest complaint makes the rest believable.",
    ],
    paleta: ["#1a1a17", "#3f5940", "#c2542f", "#f6f4ef"],
    typografia: "Archivo",
  },
  {
    slug: "flowly",
    typ: "Concept project",
    branza: "SaaS",
    rok: "2025",
    zajawka: "A project-management landing page that shows the product instead of describing it.",
    brief: "SaaS landing pages usually lead with a slogan and a screenshot nobody can read. The brief was to put a legible, working-looking interface above the fold, so a visitor understands the product before reading a word.",
    rola: ["Web design", "UI design", "Front-end build"],
    decyzje: [
      {
        tytul: "The app mock-up is built in CSS, not pasted in",
        opis: "The dashboard under the headline is real markup — sidebar, KPI cards, a chart and a task list. It stays sharp on any screen and loads instantly, unlike a screenshot.",
      },
      {
        tytul: "The interface is cropped by the fold on purpose",
        opis: "The panel runs off the bottom edge rather than sitting in a neat frame. A cut-off interface reads as ‘there is more', which is exactly the impression a product page wants.",
      },
      {
        tytul: "One violet, applied only to what should be clicked",
        opis: "Every accent-coloured element on the page is either a button or an active state. Nothing decorative borrows the accent.",
      },
    ],
    patrz: [
      "The logo strip immediately under the hero — social proof placed where doubt first appears.",
      "Feature cards use numbers rather than icons, which keeps the page from looking like every other SaaS template.",
    ],
    paleta: ["#101014", "#6d5dfc", "#9b7bff", "#fbfbfd"],
    typografia: "Space Grotesk + Inter",
  },
  {
    slug: "puls",
    typ: "Concept project",
    branza: "Fitness studio",
    rok: "2025",
    zajawka: "A gym site built around the timetable, because that is what people actually come for.",
    brief: "People visiting a gym website want two things: what classes run when, and what it costs. Everything else is decoration. The brief was to get both above the fold and still look like a premium studio.",
    rola: ["Web design", "Front-end build"],
    decyzje: [
      {
        tytul: "Dark palette with a single hot accent",
        opis: "A near-black background makes the accent colour behave like gym lighting. It also lets class cards read as physical objects rather than boxes on a page.",
      },
      {
        tytul: "The timetable is a first-class section, not a PDF",
        opis: "Most studio sites bury the schedule in a downloadable file. Putting it on the page removes the single biggest reason people bounce.",
      },
      {
        tytul: "Pricing shown as three clear commitments",
        opis: "Drop-in, monthly and annual — with the middle option visually favoured. Three options is the most a visitor will compare without leaving.",
      },
    ],
    patrz: [
      "Type is set tight and heavy — the typography itself is doing the ‘effort' the brand sells.",
      "Trainer cards keep bios to two lines; nobody reads a paragraph about a stranger.",
    ],
    paleta: ["#0b0b0d", "#e8fe5a", "#1b1b20", "#f4f4f5"],
    typografia: "Bebas Neue + Inter",
  },
  {
    slug: "noia",
    typ: "Concept project",
    branza: "Cosmetics brand",
    rok: "2025",
    zajawka: "A skincare brand that looks expensive without saying it is.",
    brief: "Premium cosmetics sell on restraint. The brief was to build a brand page where the product feels costly because of the spacing and typography, not because of a price tag or the word ‘luxury'.",
    rola: ["Branding", "Web design", "Front-end build"],
    decyzje: [
      {
        tytul: "Generous whitespace as the main material",
        opis: "The layout gives each element far more room than it needs. Density reads as cheap; air reads as expensive — it is the single most reliable trick in premium retail design.",
      },
      {
        tytul: "An elegant serif for the name, a quiet sans for everything else",
        opis: "The contrast between the two carries the whole identity, so the page needs almost no other decoration.",
      },
      {
        tytul: "Ingredients written as a list, not a paragraph",
        opis: "Skincare buyers scan for specific actives. A list is scannable; a marketing paragraph gets skipped and taken as evasion.",
      },
    ],
    patrz: [
      "The product section keeps one photograph per screen — crowding would undo the whole positioning.",
      "Buttons are outlined rather than filled, so nothing on the page shouts.",
    ],
    paleta: ["#1c1a18", "#c9a68a", "#f2ede7", "#ffffff"],
    typografia: "Playfair Display + Inter",
  },
  {
    slug: "palona",
    typ: "Concept project",
    branza: "Café",
    rok: "2025",
    zajawka: "A neighbourhood café site that gets you to the door, not onto a mailing list.",
    brief: "A café website has a very small job: address, hours, what the coffee is like, and a reason to walk in. The brief was to resist everything else.",
    rola: ["Web design", "Front-end build"],
    decyzje: [
      {
        tytul: "Address and hours are visible without scrolling",
        opis: "For a local business, this is the entire conversion. Everything else on the page is there to make you want to use that address.",
      },
      {
        tytul: "Warm palette taken from the product",
        opis: "Roasted browns and cream, pulled straight from coffee itself. A café site in cool greys fights its own subject matter.",
      },
      {
        tytul: "Menu prices shown in full",
        opis: "Hiding café prices creates a suspicion problem for the sake of nothing — there is no negotiation on a flat white.",
      },
    ],
    patrz: [
      "The brand identity for the same café is a separate piece in this portfolio — the two were designed as one system.",
    ],
    paleta: ["#2a1d15", "#c67b3f", "#e8d9c5", "#fbf7f2"],
    typografia: "Fraunces + Inter",
  },
  {
    slug: "palona-brand",
    typ: "Concept project",
    branza: "Brand identity",
    rok: "2025",
    zajawka: "The identity system behind the Palona café site — logo, palette, packaging, signage.",
    brief: "Design a small-business identity that survives contact with reality: a cup, a paper bag, a shop sign and a phone screen. Most identity concepts look great on a presentation board and fall apart the moment they are printed on a cup.",
    rola: ["Branding", "Logo design", "Design system"],
    decyzje: [
      {
        tytul: "A wordmark that still works at 12 mm",
        opis: "The logo is drawn to stay legible embossed on a takeaway cup lid. Every curve was tested at the smallest size it would ever be used, not the largest.",
      },
      {
        tytul: "Two-colour printing as a constraint, not a compromise",
        opis: "The whole system is designed to print in two inks. For a café ordering bags and cups in small runs, this is the difference between affordable and not.",
      },
      {
        tytul: "One rule for photography, written down",
        opis: "Warm light, no people, always shot from above. A one-line rule is the only kind a small business will actually follow after the designer leaves.",
      },
    ],
    patrz: [
      "The board shows applications, not just the logo — that is what tells a client whether an identity will hold together.",
    ],
    paleta: ["#2a1d15", "#c67b3f", "#e8d9c5", "#ffffff"],
    typografia: "Fraunces + Inter",
  },
  {
    slug: "calmo",
    typ: "Concept project",
    branza: "Mobile app · UI/UX",
    rok: "2025",
    zajawka: "Three screens from a meditation app, designed for someone using it at 2 a.m.",
    brief: "Meditation apps are mostly used in the dark, by people who are tired or anxious. The brief was to design the core screens for that exact moment rather than for a bright App Store screenshot.",
    rola: ["UI design", "UX design", "Prototyping"],
    decyzje: [
      {
        tytul: "Dark mode as the default, not an option",
        opis: "The entire interface is designed for a dim room. A light theme would be the compromise here, which is the reverse of how most apps are built.",
      },
      {
        tytul: "One action per screen",
        opis: "Each screen offers a single obvious next step. Choice paralysis is a real problem for an anxious user — a grid of twelve options is the opposite of calming.",
      },
      {
        tytul: "Progress shown gently, never as a streak",
        opis: "No streak counters, no red badges. Guilt mechanics increase installs and destroy retention in exactly this category.",
      },
    ],
    patrz: [
      "Touch targets are oversized throughout — the app is used lying down, one-handed.",
      "Type contrast is deliberately kept below maximum; pure white on black is harsh in a dark room.",
    ],
    paleta: ["#0d1220", "#8ea8ff", "#1b2338", "#e8ecf7"],
    typografia: "Inter",
  },
  {
    slug: "justyna",
    typ: "Client project",
    branza: "Premium real estate",
    rok: "2025",
    zajawka: "A complete brand website for a licensed real estate agent in Poland.",
    brief: "A premium estate agent competes against large portals with far bigger budgets. The only winning ground is personal trust, so the site had to feel like an individual's practice rather than a listing site.",
    rola: ["Web design", "Branding", "Front-end build"],
    decyzje: [
      {
        tytul: "Beige and black instead of the usual property-portal blue",
        opis: "The palette was chosen to look closer to an interiors magazine than to a listings site — that is the company the client wants to be judged against.",
      },
      {
        tytul: "Numbered sections to slow the page down",
        opis: "Large section numbers give a long page a rhythm and make it feel edited rather than assembled. On a trust-driven site, feeling considered is the message.",
      },
      {
        tytul: "A separate path for sellers",
        opis: "Buyers browse; sellers are the revenue. The property-valuation form is given its own prominent route rather than being buried in a general contact page.",
      },
    ],
    patrz: [
      "Filterable property listing, seller enquiry form and podcast integration are all live on the real site.",
      "The site is fully responsive and was built to be updated by the client without a developer.",
    ],
    paleta: ["#12100e", "#c9b28c", "#efe9df", "#ffffff"],
    typografia: "Serif display + humanist sans",
  },
  {
    slug: "kancelaria",
    typ: "Client project",
    branza: "Law firm",
    rok: "2025",
    zajawka: "A dignified website for an attorney with thirty years of practice.",
    brief: "An established law office needed an online presence that matched its standing. The audience arrives worried, so the site's job is to communicate competence quickly and calmly.",
    rola: ["Web design", "Branding", "Front-end build"],
    decyzje: [
      {
        tytul: "Dark palette with gold, and a classic serif",
        opis: "Legal clients read seriousness in typography before they read a word of copy. The typeface choice is doing more persuasive work here than any headline.",
      },
      {
        tytul: "Six practice areas, presented equally",
        opis: "A worried visitor needs to find their own situation in under five seconds. Six clear, equally weighted areas beat a long list with a hierarchy only the firm understands.",
      },
      {
        tytul: "Achievements as animated counters",
        opis: "Thirty years of practice is the strongest asset the firm has. Counting it up on screen makes a number people would otherwise skim actually register.",
      },
    ],
    patrz: [
      "Client testimonials and a contact form are live on the real site.",
      "Every detail was chosen to build the trust a legal practice depends on.",
    ],
    paleta: ["#0f0e0c", "#b99a5b", "#e9e4da", "#ffffff"],
    typografia: "Classic serif + Inter",
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
