// ============================================================
// KADRY — gdzie stoi kamera na każdym przystanku podróży
//
// Ten plik to SCENARIUSZ ZDJĘCIOWY całej strony. Nie ma tu ani
// jednej linijki rysowania — same liczby i czysta matematyka:
// gdzie leżą planety, jak duże mają być w kadrze i w którym
// miejscu ekranu mają stanąć.
//
// Dlaczego osobny plik? Z dwóch powodów:
//
//  1. To JEDYNE miejsce, w którym dobiera się kompozycję. Chcesz
//     przesunąć planetę? Zmieniasz tutaj jedną liczbę, a nie
//     szukasz jej w tysiącu linijek silnika.
//
//  2. Ten plik da się uruchomić w Node (nie dotyka przeglądarki),
//     więc kadry można POLICZYĆ, zamiast zgadywać na oko.
//     Skrypt liczy, w którym punkcie ekranu wyląduje tarcza
//     planety i jak będzie duża — zanim cokolwiek zobaczymy.
//     Bez tego dobieranie kadru to strzelanie na ślepo
//     (patrz KONTEKST.md, pułapka nr 8).
//
// Układ współrzędnych ekranu w polu `kadr`:
//   x > 0 → planeta idzie w PRAWO,  x < 0 → w lewo
//   y > 0 → planeta idzie w DÓŁ,    y < 0 → do góry
//   Wartości to ułamki CAŁEGO kadru, liczone od jego środka.
// ============================================================

import * as THREE from "three";

export const STOPIEN = Math.PI / 180;

/* ============ GDZIE LEŻĄ CIAŁA NIEBIESKIE ============
   Pozycje 1:1 z produkcyjnej sceny hero (components/Scena3D.tsx) —
   dzięki temu początek podróży wygląda dokładnie jak na produkcji. */
export const SRODEK_OLBRZYMA = new THREE.Vector3(0.35, 0.1, 0);
export const POZ_ROZOWEJ = new THREE.Vector3(2.55, 1.89, -0.32);
export const POZ_TURKUSOWEJ = new THREE.Vector3(7.34, 0.23, -5.93);
export const POZ_SLONCA = new THREE.Vector3(-1.68, 3.26, -11.26);

export const R_OLBRZYM = 1.35;
export const R_KSIEZYC = 0.14; // duży księżyc — przystanek „Usługi"
export const R_ROZOWA = 0.52;
export const R_TURKUSOWA = 0.34;
export const R_SLONCE = 0.32;

/** Przechylenie całego układu olbrzyma (obrót wokół osi Z). */
export const OBROT_UKLADU = 0.16;
/** Pochylenie pierścieni (obrót wokół osi X, w radianach). */
export const PRZECHYL = -1.18;
/** Promienie orbit księżyców — główny ZAWSZE poza planetą (1.35). */
export const R_ORBITY = 1.95;
export const R_ORBITY2 = 2.35;

/* ============ NARZĘDZIA GEOMETRYCZNE ============ */

const OS_X = new THREE.Vector3(1, 0, 0);
const OS_Z = new THREE.Vector3(0, 0, 1);

/** Gdzie w ŚWIECIE jest księżyc przy zadanym kącie orbity.
    Orbita leży w płaszczyźnie pierścieni, a cały układ jest
    dodatkowo przechylony o OBROT_UKLADU — dlatego pozycję
    lokalną trzeba jeszcze obrócić i przesunąć. */
export function pozycjaKsiezyca(kat: number, promien = R_ORBITY, out = new THREE.Vector3()) {
  const s = Math.sin(kat);
  out.set(Math.cos(kat) * promien, s * promien * Math.cos(PRZECHYL), s * promien * Math.sin(PRZECHYL));
  out.applyAxisAngle(OS_Z, OBROT_UKLADU); // przechył całego układu
  return out.add(SRODEK_OLBRZYMA);
}

/** Normalna (prostopadła) do płaszczyzny pierścieni, w świecie. */
export function normalnaPierscieni(out = new THREE.Vector3()) {
  out.set(0, 0, 1);
  out.applyAxisAngle(OS_X, PRZECHYL);
  return out.applyAxisAngle(OS_Z, OBROT_UKLADU);
}

/** Jak daleko odsunąć kamerę, żeby tarcza o promieniu R zajęła
    `ulamek` WYSOKOŚCI kadru.

    Liczymy z wysokości, a nie z szerokości — dzięki temu
    kompozycja wygląda tak samo na laptopie 16:9 i na szerokim
    monitorze 21:9. Na szerokim jest po prostu więcej kosmosu
    po bokach, a planeta zostaje tej samej wielkości. */
export function tarczaNa(R: number, fov: number, ulamek: number): number {
  const kat = Math.atan(2 * ulamek * Math.tan((fov / 2) * STOPIEN));
  return R / Math.sin(kat);
}

/* ============ SCENARIUSZ: SZEŚĆ PRZYSTANKÓW ============ */

/** Skąd podchodzi kamera. */
export type Kierunek =
  /** stały wektor w świecie (kamera patrzy zawsze tak samo) */
  | { typ: "staly"; v: [number, number, number] }
  /** „od poprzedniego ciała" — lot wygląda wtedy naturalnie:
      wylatujemy zza pleców jednego świata wprost na drugi */
  | { typ: "odPunktu"; skad: THREE.Vector3 }
  /** podejście do księżyca: promieniowo na zewnątrz jego orbity,
      uniesione o `unies` stopni nad płaszczyznę pierścieni —
      kamera „skacze" tuż nad pierścieniami, a za księżycem
      rozciąga się wielka tarcza olbrzyma */
  | { typ: "ksiezyc"; unies: number };

/** Na co patrzy kamera. */
export type Cel =
  | { typ: "punkt"; v: THREE.Vector3 }
  | { typ: "ksiezyc" };

export type Przystanek = {
  /** nazwa (tylko dla czytelności logów) */
  nazwa: string;
  cel: Cel;
  kierunek: Kierunek;
  /** promień ciała — potrzebny do policzenia odległości */
  promien: number;
  /** jaki UŁAMEK WYSOKOŚCI kadru ma zająć średnica tarczy */
  ulamek: number;
  fov: number;
  /** przechył kadru (roll) w stopniach */
  obrot: number;
  /** gdzie na ekranie ma stanąć środek tarczy (ułamki od środka) */
  kadr: { x: number; y: number };
  /** stała odległość — używane TYLKO w hero, gdzie kadr jest
      odtworzeniem zdjęcia z produkcji i nie wolno go ruszać */
  dystansNaSztywno?: number;
};

export const PRZYSTANKI: Przystanek[] = [
  /* 0. HERO — szeroki plan całego układu.
     ⛔ NIE RUSZAĆ. Te liczby odtwarzają kadr z produkcji
     (components/Scena3D.tsx). Zmiana = inna strona główna. */
  {
    nazwa: "hero",
    cel: { typ: "punkt", v: new THREE.Vector3(-1.343, 0.683, 0) },
    kierunek: { typ: "staly", v: [0, 0, 1] },
    promien: 1,
    ulamek: 0,
    dystansNaSztywno: 8.835,
    fov: 42,
    obrot: 0,
    kadr: { x: 0, y: 0 },
  },

  /* 1. USŁUGI — duży KSIĘŻYC olbrzyma.
     Kompozycja: księżyc to PEŁNA, nieprzycięta kula w prawej
     części kadru, na wysokości środka ekranu. Wcześniej leżał
     na dole po prawej i był ucięty z dwóch stron.
     `unies` podniesione z 38° na 56°: kamera patrzy na księżyc
     bardziej z góry, więc olbrzym przestaje być jasną ścianą
     pod tekstem i schodzi w prawy dolny róg. Lewa połowa kadru
     robi się czystym kosmosem — i dopiero dzięki temu można było
     wyrzucić zaciemnienie tła. */
  {
    nazwa: "uslugi",
    cel: { typ: "ksiezyc" },
    kierunek: { typ: "ksiezyc", unies: -46 },
    promien: R_KSIEZYC,
    ulamek: 0.22,
    fov: 52,
    obrot: 6,
    kadr: { x: 0.24, y: -0.09 },
  },

  /* 2. PORTFOLIO — OLBRZYM z pierścieniami.
     Tu treść jest WYSOKA (mozaika projektów przewija się przez
     kilka ekranów), więc planeta nie może zabrać połowy szerokości.
     Rozwiązanie: olbrzym jest OGROMNY i stoi po prawej, a kafelki
     projektów to nieprzezroczyste obrazy — mogą spokojnie leżeć
     na jego chmurach, bo i tak są w pełni czytelne. Czystego
     kosmosu potrzebuje tylko nagłówek, więc jest w lewym górnym
     rogu, poza tarczą. */
  {
    nazwa: "portfolio",
    cel: { typ: "punkt", v: SRODEK_OLBRZYMA },
    kierunek: { typ: "staly", v: [-0.6, 0.35, 0.72] },
    promien: R_OLBRZYM,
    ulamek: 0.46,
    fov: 46,
    obrot: -5,
    kadr: { x: 0.22, y: -0.06 },
  },

  /* 3. PROCES — TURKUSOWA planeta.
     Wielka kula wschodząca z dołu, na środku kadru: górny brzeg
     mniej więcej w połowie ekranu. Cztery kroki współpracy stoją
     nad nią, na czystym niebie. Wcześniej planeta była zsunięta
     tak nisko, że z 202% wysokości widać było tylko skrawek. */
  {
    nazwa: "proces",
    cel: { typ: "punkt", v: POZ_TURKUSOWEJ },
    kierunek: { typ: "odPunktu", skad: SRODEK_OLBRZYMA },
    promien: R_TURKUSOWA,
    ulamek: 0.3,
    fov: 52,
    obrot: 10,
    kadr: { x: 0.05, y: 0.42 },
  },

  /* 4. OPINIE — RÓŻOWA planeta.
     Kula w lewej dolnej ćwiartce, ale już NIE ucięta przy lewej
     krawędzi. Opinie stoją w kolumnie po prawej. */
  {
    nazwa: "opinie",
    cel: { typ: "punkt", v: POZ_ROZOWEJ },
    kierunek: { typ: "odPunktu", skad: POZ_TURKUSOWEJ },
    promien: R_ROZOWA,
    ulamek: 0.24,
    fov: 52,
    obrot: -7,
    kadr: { x: -0.22, y: 0.28 },
  },

  /* 5. KONTAKT — FINAŁ: WSCHÓD SŁOŃCA.
     Tarcza na środku, górny brzeg mniej więcej w 55% wysokości.
     Nad nią zostaje ciemne niebo na nagłówek i przyciski —
     bez ciężkiej, ciemnej karty, która wcześniej zasłaniała
     całe słońce. */
  {
    nazwa: "kontakt",
    cel: { typ: "punkt", v: POZ_SLONCA },
    kierunek: { typ: "odPunktu", skad: POZ_ROZOWEJ },
    promien: R_SLONCE,
    ulamek: 0.22,
    fov: 52,
    obrot: 8,
    kadr: { x: 0.0, y: 0.42 },
  },
];

/** Łuki przejść — jak mocno trasa wygina się w górę/w bok między
    przystankami (to daje „zoom out → przelot → zoom in") oraz
    o ile stopni rozszerza się fov w połowie lotu. Znaki na
    przemian = każdy odcinek wygląda inaczej, trasa nie nudzi. */
export const LUKI = [
  { gora: 1.6, bok: 0.9, fov: 12 }, // hero → usługi (księżyc)
  { gora: 3.4, bok: 1.7, fov: 15 }, // usługi → portfolio (olbrzym)
  { gora: 2.4, bok: -1.6, fov: 13 }, // portfolio → proces (turkusowa)
  { gora: -2.0, bok: -2.2, fov: 16 }, // proces → opinie (różowa)
  { gora: 2.6, bok: 1.5, fov: 14 }, // opinie → kontakt (słońce)
];

/* ============ ROZWIĄZYWANIE SCENARIUSZA NA KONKRET ============
   Poniższe funkcje zamieniają opis („podejdź do księżyca od
   zewnątrz, unieś o 38°") na prawdziwe wektory. Korzysta z nich
   i silnik w przeglądarce, i skrypt liczący kadry w Node. */

/** Środek ciała, na które patrzy kamera. `katKsiezyca` podajemy,
    bo księżyc krąży — w Node bierzemy dowolny, ustalony kąt. */
export function srodekPrzystanku(
  p: Przystanek,
  katKsiezyca: number,
  out = new THREE.Vector3()
): THREE.Vector3 {
  if (p.cel.typ === "ksiezyc") return pozycjaKsiezyca(katKsiezyca, R_ORBITY, out);
  return out.copy(p.cel.v);
}

/** Kierunek, z którego podchodzi kamera (wektor jednostkowy). */
export function kierunekPrzystanku(
  p: Przystanek,
  katKsiezyca: number,
  out = new THREE.Vector3()
): THREE.Vector3 {
  if (p.kierunek.typ === "staly") {
    return out.set(...p.kierunek.v).normalize();
  }
  if (p.kierunek.typ === "odPunktu") {
    srodekPrzystanku(p, katKsiezyca, out);
    return out.subVectors(p.kierunek.skad, out).normalize();
  }
  // księżyc: promieniowo na zewnątrz orbity + uniesienie nad pierścienie
  pozycjaKsiezyca(katKsiezyca, R_ORBITY, out).sub(SRODEK_OLBRZYMA).normalize();
  const n = normalnaPierscieni();
  const kat = p.kierunek.unies * STOPIEN;
  return out.multiplyScalar(Math.cos(kat)).addScaledVector(n, Math.sin(kat)).normalize();
}

/** Odległość kamery od środka ciała. */
export function dystansPrzystanku(p: Przystanek): number {
  return p.dystansNaSztywno ?? tarczaNa(p.promien, p.fov, p.ulamek);
}
