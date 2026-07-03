// ============================================================
// GŁÓWNA STRONA — składa wszystkie sekcje w jedną całość.
// Kolejność sekcji poniżej = kolejność na stronie.
// Chcesz ukryć sekcję? Po prostu usuń (lub zakomentuj) jej linijkę.
// ============================================================

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Strona() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />          {/* 1. Duże imię + przyciski */}
        <Services />      {/* 2. Trzy karty usług */}
        <Portfolio />     {/* 3. Siatka bento z projektami */}
        <Process />       {/* 4. Cztery kroki współpracy */}
        <Testimonials />  {/* 5. Opinie klientów */}
        <Pricing />       {/* 6. Trzy pakiety cenowe */}
        <Contact />       {/* 7. Wezwanie do działania */}
      </main>
      <Footer />          {/* 8. Stopka z social media */}
    </>
  );
}
