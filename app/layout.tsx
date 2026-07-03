// ============================================================
// SZKIELET CAŁEJ STRONY (layout)
// Tu podpinamy font, style globalne, meta-dane (SEO)
// i skrypt, który zapamiętuje wybrany motyw (jasny/ciemny).
// ============================================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Font Inter z Google Fonts — Next.js pobiera go przy budowaniu,
// więc strona nie „mruga" przy wczytywaniu.
const inter = Inter({
  subsets: ["latin", "latin-ext"], // latin-ext = polskie znaki (ą, ę, ś...)
  variable: "--font-inter",
  display: "swap",
});

// Meta-dane strony — to widzą Google i podgląd linku na social media.
// ✏️ Podmień tytuł i opis na swoje!
export const metadata: Metadata = {
  title: "Mateusz — Design & Web | Strony, Branding, UI/UX",
  description:
    "Freelancer: projektowanie stron i landing page, grafika i branding, UI/UX design. Projekty klasy premium, które sprzedają.",
};

// Malutki skrypt uruchamiany PRZED wyświetleniem strony.
// Sprawdza zapisany motyw (albo ustawienie systemu) i od razu
// włącza tryb ciemny — dzięki temu strona nie błyska bielą.
const skryptMotywu = `
(function () {
  try {
    var zapisany = localStorage.getItem("motyw");
    var systemCiemny = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (zapisany === "ciemny" || (!zapisany && systemCiemny)) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning — potrzebne, bo klasę "dark" dodaje skrypt,
    // a React nie powinien się tym przejmować.
    <html lang="pl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: skryptMotywu }} />
      </head>
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
