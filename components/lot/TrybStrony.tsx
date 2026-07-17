"use client";
// ============================================================
// PRZEŁĄCZNIK TRYBU STRONY (eksperyment „ZUI Space Scroll")
//
// Decyduje, którą wersję początku strony pokazać:
//  • LOT (podróż kosmiczna scrollem) — tylko komputer z myszką,
//    bez „ograniczenia animacji", z działającym WebGL;
//  • KLASYKA (obecna strona: Hero + Marquee + Usługi) — telefony,
//    tablety, „ograniczone animacje", brak WebGL.
//
// Serwer zawsze renderuje KLASYKĘ (dobre SEO), a przeglądarka na
// desktopie podmienia ją na lot zaraz po wczytaniu.
// ============================================================

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Lot (i GSAP w środku) dociąga się LENIWIE — telefony i klasyczna
// wersja nie płacą ani bajta za kod podróży.
const LotSekcja = dynamic(() => import("./LotSekcja"), { ssr: false });

function czyWebGLDziala(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function TrybStrony({ klasyka }: { klasyka: React.ReactNode }) {
  const [tryb, setTryb] = useState<"klasyka" | "lot">("klasyka");

  useEffect(() => {
    const duzyEkran = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
    const bezAnimacji = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (duzyEkran && !bezAnimacji && czyWebGLDziala()) setTryb("lot");
  }, []);

  return tryb === "lot" ? <LotSekcja /> : <>{klasyka}</>;
}
