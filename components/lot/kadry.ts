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

/** Kierunek RUCHU księżyca po orbicie (styczna do orbity), w świecie.
    Razem z „promieniowo na zewnątrz" i normalną pierścieni tworzy
    lokalny układ współrzędnych orbity — i to w NIM opisujemy kadr
    sekcji Usługi. Dzięki temu kompozycja nie zależy od tego, w którym
    miejscu orbity księżyc akurat jest (patrz `kierunekPrzystanku`). */
export function stycznaOrbity(kat: number, out = new THREE.Vector3()) {
  const n = normalnaPierscieni();
  out.copy(pozycjaKsiezyca(kat, R_ORBITY)).sub(SRODEK_OLBRZYMA).normalize();
  return out.crossVectors(n, out).normalize();
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
  /** podejście do księżyca, opisane w LOKALNYM UKŁADZIE ORBITY:
        `unies`  — ile stopni NAD płaszczyzną pierścieni (0 = dokładnie
                   w płaszczyźnie, czyli pierścienie widziane z boku
                   jako cienka kreska),
        `wzdluz` — ile stopni w bok, licząc od „promieniowo na zewnątrz"
                   w stronę ruchu księżyca po orbicie. 0° = olbrzym
                   dokładnie za plecami księżyca (ściana!), 90° = patrzymy
                   WZDŁUŻ pierścieni, a olbrzym odchodzi w bok kadru.
      Ten opis jest niezależny od tego, gdzie księżyc akurat jest na
      orbicie — dlatego kadr wygląda tak samo przy każdym wejściu. */
  | { typ: "ksiezyc"; unies: number; wzdluz?: number };

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
  /** CO JEST GÓRĄ KADRU.
      Domyślnie pion świata — tak jak w każdej normalnej scenie.
      "pierscienie" znaczy: górą jest oś pierścieni olbrzyma. Wtedy
      pierścienie zawsze kładą się na ekranie POZIOMO, niezależnie od
      fazy orbity — a bez tego ich nachylenie kręciło się razem
      z księżycem i kompozycja była inna przy każdym wejściu. */
  pion?: "swiat" | "pierscienie";
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

  /* 1. USŁUGI — duży KSIĘŻYC olbrzyma na linii pierścieni (runda v4).
     ⭐ Co było nie tak wcześniej: kamera podchodziła promieniowo
     (`wzdluz` = 0) i uniesiona aż o 46° nad pierścienie, a górą kadru
     był pion świata. Skutek: pierścienie przechylały się na ekranie
     inaczej przy każdym wejściu na stronę, bo księżyc startował
     w LOSOWYM miejscu orbity. Kompozycja tej sceny była loterią.

     Teraz kadr jest opisany w układzie orbity i wygląda tak samo
     zawsze:
       `wzdluz` 62°  — patrzymy prawie WZDŁUŻ pierścieni, więc olbrzym
                       nie stoi już jasną ścianą za księżycem, tylko
                       odchodzi w bok, a pasma pierścieni uciekają
                       w głąb kadru,
       `unies`  -13° — kamera tuż pod płaszczyzną pierścieni, więc
                       widać je niemal z boku: cienka smuga zamiast
                       rozwartej elipsy,
       `pion` = pierścienie — górą kadru jest oś pierścieni, więc ta
                       smuga kładzie się POZIOMO. Księżyc krąży
                       w tej samej płaszczyźnie (orbita 1,95 wypada
                       między 1,6 a 2,7 pierścieni), więc siedzi
                       dokładnie NA niej. Stąd „jedna linia".
     Lewa połowa kadru zostaje czystym kosmosem pod tekst — tak jak
     wymagało tego usunięcie zaciemnień w rundzie v2. */
  {
    nazwa: "uslugi",
    cel: { typ: "ksiezyc" },
    kierunek: { typ: "ksiezyc", unies: -31, wzdluz: 69 },
    promien: R_KSIEZYC,
    ulamek: 0.22,
    fov: 52,
    obrot: 6,
    kadr: { x: 0.24, y: 0.02 },
    pion: "pierscienie",
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
    ulamek: 0.4,
    fov: 46,
    obrot: -5,
    // odsunięte bardziej w prawo niż w pozostałych scenach: mozaika
    // projektów jest szeroka, a jasny brzeg olbrzyma nie powinien
    // świecić dokładnie pod kafelkami
    kadr: { x: 0.31, y: -0.04 },
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

  /* 5. KONTAKT — FINAŁ: SŁOŃCE JAKO PODŁOGA (runda v3).
     Wcześniej słońce było odległą tarczą nisko w kadrze. Teraz
     kamera podchodzi tak blisko, że gwiazda przestaje być kulą,
     a staje się ŚWIECĄCĄ POWIERZCHNIĄ zamykającą dół kadru —
     jak horyzont planety, nad którym wisi tekst.

     Dwie liczby robią całą robotę:
       `ulamek` 0.22 → 0.62  — tarcza rośnie prawie trzykrotnie,
       `kadr.y` 0.42 → 0.66  — i schodzi tak nisko, że widać już
                               tylko jej górną część.
     Efekt: nagłówek i przyciski wiszą tuż nad jasną powierzchnią,
     jak satelita na niskiej orbicie. */
  {
    nazwa: "kontakt",
    cel: { typ: "punkt", v: POZ_SLONCA },
    kierunek: { typ: "odPunktu", skad: POZ_ROZOWEJ },
    promien: R_SLONCE,
    ulamek: 0.62,
    fov: 52,
    obrot: 4, // mniejszy przechył — horyzont ma być spokojny, nie krzywy
    kadr: { x: 0.0, y: 0.74 },
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
  /* KSIĘŻYC — kadr budujemy w lokalnym układzie orbity:
       r = promieniowo na zewnątrz, t = wzdłuż ruchu, n = oś pierścieni.
     Najpierw obracamy się o `wzdluz` w płaszczyźnie pierścieni
     (to odsuwa olbrzyma w bok), potem podnosimy o `unies` nad nią. */
  const r = pozycjaKsiezyca(katKsiezyca, R_ORBITY, out).sub(SRODEK_OLBRZYMA).normalize();
  const n = normalnaPierscieni();
  const t = stycznaOrbity(katKsiezyca);
  const a = (p.kierunek.wzdluz ?? 0) * STOPIEN;
  const e = p.kierunek.unies * STOPIEN;
  return r
    .multiplyScalar(Math.cos(a) * Math.cos(e))
    .addScaledVector(t, Math.sin(a) * Math.cos(e))
    .addScaledVector(n, Math.sin(e))
    .normalize();
}

/** Który kierunek jest GÓRĄ KADRU na danym przystanku. */
export function pionPrzystanku(p: Przystanek, out = new THREE.Vector3()): THREE.Vector3 {
  if (p.pion === "pierscienie") return normalnaPierscieni(out);
  return out.set(0, 1, 0);
}

/** Odległość kamery od środka ciała. */
export function dystansPrzystanku(p: Przystanek): number {
  return p.dystansNaSztywno ?? tarczaNa(p.promien, p.fov, p.ulamek);
}

/* ============================================================
   GDZIE NA EKRANIE WYLĄDUJE PLANETA
   ============================================================
   Poniższe dwie funkcje są WSPÓLNE dla strony i dla narzędzia
   narzedzia/policzKadry.mts. To celowe: gdyby każde liczyło po
   swojemu, prędzej czy później rozjechałyby się i „zmierzone"
   położenie planety przestałoby odpowiadać temu, co widać.
   ============================================================ */

/** Kamera ustawiona dokładnie tak, jak robi to silnik na postoju.
    Kolejność MA ZNACZENIE (patrz KONTEKST.md, pułapka 4):
    najpierw patrzenie na cel, potem przechył, na końcu przesunięcie
    kadru („odwrócenie głowy"). */
export function kameraPrzystanku(
  p: Przystanek,
  aspect: number,
  katKsiezyca = 0.7
): THREE.PerspectiveCamera {
  const kamera = new THREE.PerspectiveCamera(p.fov, aspect, 0.02, 260);
  const srodek = srodekPrzystanku(p, katKsiezyca);
  const kierunek = kierunekPrzystanku(p, katKsiezyca);
  kamera.position.copy(srodek).addScaledVector(kierunek, dystansPrzystanku(p));
  kamera.up.copy(pionPrzystanku(p));
  kamera.lookAt(srodek);
  kamera.rotateZ(p.obrot * STOPIEN);
  if (p.kadr.x !== 0 || p.kadr.y !== 0) {
    const polKadru = Math.tan((p.fov / 2) * STOPIEN);
    kamera.rotateY(Math.atan(2 * p.kadr.x * polKadru * aspect));
    kamera.rotateX(Math.atan(2 * p.kadr.y * polKadru));
  }
  kamera.updateMatrixWorld(true);
  kamera.updateProjectionMatrix();
  return kamera;
}

/** Rzutuj SYLWETKĘ kuli na ekran i zwróć jej prostokąt w ułamkach
    ekranu (0 = lewa/górna krawędź, 1 = prawa/dolna).

    Uwaga 1: sylwetka to NIE okrąg przechodzący przez środek kuli —
    leży bliżej kamery i jest odrobinę mniejsza.
    Uwaga 2: punkty ZA obiektywem trzeba wyrzucić ręcznie, bo
    rzutowanie perspektywiczne daje dla nich liczby rzędu „23 000%
    szerokości" — poprawne matematycznie, bez sensu jako kadr. */
export function sylwetkaNaEkranie(
  kamera: THREE.PerspectiveCamera,
  srodekKuli: THREE.Vector3,
  promien: number
) {
  const doKamery = new THREE.Vector3().subVectors(kamera.position, srodekKuli);
  const d = doKamery.length();
  if (d <= promien) return null; // kamera w środku kuli
  const u = doKamery.clone().normalize();
  const srodekSylwetki = srodekKuli.clone().addScaledVector(u, (promien * promien) / d);
  const rSylwetki = promien * Math.sqrt(1 - (promien * promien) / (d * d));

  const os1 = new THREE.Vector3(0, 1, 0).cross(u);
  if (os1.lengthSq() < 1e-6) os1.set(1, 0, 0).cross(u);
  os1.normalize();
  const os2 = new THREE.Vector3().crossVectors(u, os1).normalize();

  let lewo = 1e9, prawo = -1e9, gora = 1e9, dol = -1e9, obciete = 0;
  const punkt = new THREE.Vector3();
  for (let i = 0; i < 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    punkt
      .copy(srodekSylwetki)
      .addScaledVector(os1, Math.cos(a) * rSylwetki)
      .addScaledVector(os2, Math.sin(a) * rSylwetki);
    if (punkt.clone().applyMatrix4(kamera.matrixWorldInverse).z > -0.02) {
      obciete++;
      continue;
    }
    punkt.project(kamera);
    const x = (punkt.x + 1) / 2;
    const y = (1 - punkt.y) / 2; // y liczone OD GÓRY ekranu
    lewo = Math.min(lewo, x); prawo = Math.max(prawo, x);
    gora = Math.min(gora, y); dol = Math.max(dol, y);
  }
  if (obciete === 128) return null; // cała kula za plecami
  const s = srodekSylwetki.clone().project(kamera);
  return {
    x: (s.x + 1) / 2,
    y: (1 - s.y) / 2,
    lewo, prawo, gora, dol,
    wys: dol - gora,
    obciete,
    zaPlecami: srodekSylwetki.clone().applyMatrix4(kamera.matrixWorldInverse).z > 0,
  };
}

/** ⭐ SZEROKOŚĆ PASA NA KAFELKI w sekcji Portfolio, w ułamku ekranu.

    Olbrzym ma zostać po prawej SAM — żaden kafelek nie może na niego
    wejść. Zamiast wpisywać na sztywno „kafelki do 52%" (co rozjechałoby
    się na innych proporcjach ekranu), liczymy, gdzie NAPRAWDĘ zaczyna
    się tarcza planety, i zostawiamy przed nią margines oddechu.
    Wynik trafia do CSS jako zmienna `--pole-kafelkow`. */
export function polePodKafelki(szer: number, wys: number, margines = 0.035): number {
  const p = PRZYSTANKI.find((x) => x.nazwa === "portfolio");
  if (!p) return 0.52;
  const s = sylwetkaNaEkranie(kameraPrzystanku(p, szer / wys), SRODEK_OLBRZYMA, R_OLBRZYM);
  if (!s) return 0.52;
  // klamry bezpieczeństwa: na bardzo wąskim ekranie pas nie może
  // zrobić się mikroskopijny, na bardzo szerokim — zjeść całego kadru
  return Math.min(0.66, Math.max(0.4, s.lewo - margines));
}
