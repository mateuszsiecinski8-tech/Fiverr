// ============================================================
// GŁÓWNA STRONA — składa wszystkie sekcje w jedną całość.
// Kolejność sekcji poniżej = kolejność na stronie.
// Chcesz ukryć sekcję? Po prostu usuń (lub zakomentuj) jej linijkę.
// ============================================================

import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Services from "@/components/Services";
// EKSPERYMENT „ZUI Space Scroll": na desktopie hero+usługi zastępuje
// kosmiczna podróż scrollem; na mobile/reduced-motion zostaje klasyka.
import TrybStrony from "@/components/lot/TrybStrony";
import Portfolio from "@/components/Portfolio";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
// Cennik jest CHWILOWO wyłączony (plik components/Pricing.tsx czeka
// w projekcie) — żeby go przywrócić, odkomentuj import i linijkę niżej.
// import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Strona() {
  return (
    <>
      <ScrollProgress />  {/* Kolorowy pasek postępu na górze ekranu */}
      <Navbar />
      <main>
        {/* EKSPERYMENT „ZUI Space Scroll": na komputerze CAŁA strona to
            podróż kosmiczna (kamera leci między sekcjami-planetami).
            Na telefonie / przy „ograniczeniu animacji" — klasyczna
            wersja poniżej (pełna lista sekcji, bez zmian). */}
        <TrybStrony
          klasyka={
            <>
              <Hero />
              <Marquee />
              <Services />
              <Portfolio />     {/* 3. Siatka bento z projektami */}
              <Process />       {/* 4. Cztery kroki współpracy */}
              <Testimonials />  {/* 5. Opinie klientów */}
              {/* <Pricing /> — cennik chwilowo ukryty */}
              <Contact />       {/* 6. Wezwanie do działania */}
            </>
          }
        />
      </main>
      <Footer />          {/* 8. Stopka z social media */}
    </>
  );
}
