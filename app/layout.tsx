// ============================================================
// SZKIELET CAŁEJ STRONY (layout)
// Tu podpinamy font, style globalne i meta-dane (SEO).
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
  title: "Maty — Web Design | Websites, Branding, UI/UX",
  description:
    "Freelance designer & developer: websites and landing pages, graphics and branding, UI/UX design. Premium-class projects that sell.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Strona ma JEDEN motyw: ciemny, kosmiczny (klasa "dark" na stałe).
    // Jasny motyw usunęliśmy — nocne niebo z planetami to tożsamość strony.
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
