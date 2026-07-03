# 🎨 Portfolio Freelancera — Design & Web

Profesjonalna, jednostronicowa strona-portfolio zbudowana w **Next.js** i **Tailwind CSS**.
W pełni responsywna, z trybem jasnym/ciemnym i płynnymi animacjami przy scrollu.

---

## ✏️ Jak edytować treści (najważniejsze!)

**Wszystkie teksty strony są w JEDNYM pliku:** [`lib/dane.ts`](lib/dane.ts)

Tam zmienisz:
- swoje imię i opis (sekcja `hero`),
- **link do profilu Fiverr i email** (sekcja `linki` — koniecznie podmień!),
- usługi, ceny, opinie, tytuły projektów w portfolio.

Zapisujesz plik → strona aktualizuje się sama. Nie musisz dotykać żadnego innego kodu.

Chcesz zmienić **kolor akcentu** (fiolet)? Otwórz [`app/globals.css`](app/globals.css)
i zmień dwie wartości w sekcji `@theme` na górze pliku.

---

## 🚀 Jak uruchomić stronę na swoim komputerze

### Krok 1: Zainstaluj Node.js

Jeśli jeszcze nie masz — pobierz Node.js (wersja 18 lub nowsza) ze strony
[nodejs.org](https://nodejs.org/) i zainstaluj (klikasz „dalej, dalej, dalej").

### Krok 2: Zainstaluj zależności projektu

Otwórz terminal (na Windows: wpisz `cmd` w menu Start) w folderze projektu i wpisz:

```bash
npm install
```

Poczekaj chwilę — pobiorą się wszystkie potrzebne biblioteki.

### Krok 3: Uruchom stronę

```bash
npm run dev
```

Otwórz przeglądarkę i wejdź na adres: **http://localhost:3000**

Gotowe! 🎉 Każda zmiana w plikach od razu pokaże się w przeglądarce.

---

## ☁️ Jak wrzucić stronę na Vercel (za darmo)

Vercel to firma, która stworzyła Next.js — hosting jest darmowy i banalnie prosty.

### Sposób 1: Przez GitHub (polecany)

1. Wrzuć projekt na swoje konto **GitHub** (jeśli czytasz to na GitHubie — już to masz ✅).
2. Wejdź na [vercel.com](https://vercel.com) i zaloguj się kontem GitHub.
3. Kliknij **„Add New… → Project"**.
4. Wybierz z listy to repozytorium i kliknij **„Import"**.
5. Niczego nie zmieniaj (Vercel sam wykryje Next.js) i kliknij **„Deploy"**.
6. Po ~1 minucie dostaniesz link do swojej strony, np. `twoja-strona.vercel.app`.

**Bonus:** od teraz każda zmiana wypchnięta na GitHub automatycznie
aktualizuje stronę online. Zero dodatkowej roboty.

### Sposób 2: Z terminala

```bash
npm install -g vercel
vercel
```

I odpowiadasz na kilka pytań (wszędzie możesz nacisnąć Enter).

---

## 📁 Struktura projektu (co gdzie jest)

```
├── app/
│   ├── layout.tsx        → szkielet strony: font, motyw, SEO (tytuł strony!)
│   ├── page.tsx          → składa sekcje w całość (tu zmienisz ich kolejność)
│   └── globals.css       → kolory, animacje, styl globalny
├── components/           → poszczególne sekcje strony
│   ├── Navbar.tsx        → górne menu + wersja mobilna
│   ├── Hero.tsx          → sekcja powitalna
│   ├── Services.tsx      → usługi
│   ├── Portfolio.tsx     → siatka bento z projektami
│   ├── Process.tsx       → 4 kroki współpracy
│   ├── Testimonials.tsx  → opinie
│   ├── Pricing.tsx       → cennik
│   ├── Contact.tsx       → wezwanie do kontaktu
│   ├── Footer.tsx        → stopka
│   ├── Reveal.tsx        → animacja przy scrollu (pomocnik)
│   ├── ThemeToggle.tsx   → przełącznik jasny/ciemny
│   └── Ikony.tsx         → wszystkie ikonki SVG
├── lib/
│   └── dane.ts           → ⭐ WSZYSTKIE TEKSTY STRONY — edytuj śmiało!
└── README.md             → ten plik
```

---

## 🖼️ Portfolio i projekty pokazowe (spec work)

Portfolio jest wypełnione **6 projektami pokazowymi** — fikcyjnymi, ale
zrobionymi jak płatne zlecenia. Kliknięcie kafelka otwiera **żywe demo**:

| Projekt | Demo | Kafelek |
|---|---|---|
| Flowly — landing SaaS | `public/prace/flowly.html` | `public/portfolio/flowly.jpg` |
| Calmo — aplikacja do medytacji (UI/UX) | `public/prace/calmo.html` | `public/portfolio/calmo.jpg` |
| Palona — branding kawiarni | `public/prace/palona-brand.html` | `public/portfolio/palona-brand.jpg` |
| PULS Studio — strona fitness | `public/prace/puls.html` | `public/portfolio/puls.jpg` |
| NOIA — marka kosmetyków | `public/prace/noia.html` | `public/portfolio/noia.jpg` |
| Palona — strona kawiarni | `public/prace/palona.html` | `public/portfolio/palona-www.jpg` |

**Jak podmienić na prawdziwe projekty?** Wrzuć obrazek do
`public/portfolio/` i zmień pola `obraz` + `link` przy danym wpisie
w `lib/dane.ts`. Nic więcej.

**Zdjęcia AI (opcjonalny bajer):** strony kawiarni i kosmetyków mają
przygotowane miejsce na zdjęcia. Jeśli wrzucisz pliki
`public/prace/img/kawa.png` oraz `public/prace/img/kosmetyki.png`,
strony automatycznie pokażą je zamiast ilustracji CSS.

## ❓ Częste pytania

**Strona nie startuje po `npm run dev`?**
Upewnij się, że najpierw uruchomiłeś `npm install` i masz Node.js ≥ 18
(sprawdzisz przez `node -v`).

**Jak zmienić tytuł strony widoczny w Google?**
W pliku `app/layout.tsx`, sekcja `metadata` (pola `title` i `description`).
