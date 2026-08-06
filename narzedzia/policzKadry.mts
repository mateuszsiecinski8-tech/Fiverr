// ============================================================
// POLICZ KADRY — gdzie DOKŁADNIE wyląduje każda planeta na ekranie
//
// Po co to jest? Bo dobieranie kadru „na oko" w kosmicznej scenie
// 3D to strzelanie na ślepo — przesuwasz jedną liczbę, planeta
// ucieka w drugą stronę, a żeby to zobaczyć, trzeba przeładować
// stronę i zrobić zrzut. Ten skrypt liczy to samo w ułamek sekundy
// i wypisuje w procentach ekranu.
//
// Importuje TEN SAM plik, z którego korzysta strona
// (components/lot/kadry.ts) — więc nie ma szans, żeby wyliczenia
// rozjechały się z tym, co naprawdę widać.
//
// Uruchomienie (z katalogu projektu):
//   node narzedzia/policzKadry.mts            → laptop 1536x864
//   node narzedzia/policzKadry.mts 2560 1080  → szeroki monitor
// ============================================================

import * as THREE from "three";
import {
  PRZYSTANKI,
  STOPIEN,
  SRODEK_OLBRZYMA,
  POZ_ROZOWEJ,
  POZ_TURKUSOWEJ,
  POZ_SLONCA,
  R_OLBRZYM,
  R_KSIEZYC,
  R_ROZOWA,
  R_TURKUSOWA,
  R_SLONCE,
  R_ORBITY,
  PRZECHYL,
  OBROT_UKLADU,
  pozycjaKsiezyca,
  srodekPrzystanku,
  kierunekPrzystanku,
  dystansPrzystanku,
  pionPrzystanku,
} from "../components/lot/kadry.ts";

const SZER = Number(process.argv[2] ?? 1536);
const WYS = Number(process.argv[3] ?? 864);
const ASPECT = SZER / WYS;

/* Kąt księżyca na orbicie zmienia się w czasie (księżyc krąży).
   Od rundy v4 kadr sekcji Usługi jest opisany w LOKALNYM UKŁADZIE
   ORBITY, więc kompozycja nie powinna od tego kąta zależeć w ogóle.
   Skrypt to SPRAWDZA: przelicza scenę dla kilku różnych kątów
   i porównuje wyniki (patrz „TEST DETERMINIZMU" na dole). */
const KAT_KSIEZYCA = 0.7;

type Kula = { nazwa: string; srodek: THREE.Vector3; promien: number };
const KULE: Kula[] = [
  { nazwa: "olbrzym", srodek: SRODEK_OLBRZYMA, promien: R_OLBRZYM },
  { nazwa: "ksiezyc", srodek: pozycjaKsiezyca(KAT_KSIEZYCA, R_ORBITY), promien: R_KSIEZYC },
  { nazwa: "rozowa", srodek: POZ_ROZOWEJ, promien: R_ROZOWA },
  { nazwa: "turkusowa", srodek: POZ_TURKUSOWEJ, promien: R_TURKUSOWA },
  { nazwa: "slonce", srodek: POZ_SLONCA, promien: R_SLONCE },
];

/** Ustaw kamerę dokładnie tak, jak robi to silnik na postoju.
    Kolejność MA ZNACZENIE: najpierw patrzenie na cel, potem
    przechył kadru, a dopiero na końcu „odwrócenie głowy" —
    w tej kolejności robi to silnik (patrz KONTEKST.md, pułapka 4). */
function ustawKamere(i: number, kat = KAT_KSIEZYCA): THREE.PerspectiveCamera {
  const p = PRZYSTANKI[i];
  const kamera = new THREE.PerspectiveCamera(p.fov, ASPECT, 0.02, 260);

  const srodek = srodekPrzystanku(p, kat);
  const kierunek = kierunekPrzystanku(p, kat);
  kamera.position.copy(srodek).addScaledVector(kierunek, dystansPrzystanku(p));

  kamera.up.copy(pionPrzystanku(p));
  kamera.lookAt(srodek);
  kamera.rotateZ(p.obrot * STOPIEN);

  if (p.kadr.x !== 0 || p.kadr.y !== 0) {
    const polKadru = Math.tan((p.fov / 2) * STOPIEN);
    kamera.rotateY(Math.atan(2 * p.kadr.x * polKadru * ASPECT));
    kamera.rotateX(Math.atan(2 * p.kadr.y * polKadru));
  }
  kamera.updateMatrixWorld(true);
  kamera.updateProjectionMatrix();
  return kamera;
}

/** Rzutuj SYLWETKĘ kuli (czyli to, co naprawdę widać) na ekran.
    Uwaga: sylwetka to NIE jest okrąg przechodzący przez środek
    kuli — leży bliżej kamery i jest odrobinę mniejsza. Przy
    planecie wypełniającej pół ekranu ta różnica to kilka procent,
    więc liczymy porządnie. */
function rzutujKule(kamera: THREE.PerspectiveCamera, kula: Kula) {
  const doKamery = new THREE.Vector3().subVectors(kamera.position, kula.srodek);
  const d = doKamery.length();
  if (d <= kula.promien) return null; // kamera wewnątrz kuli
  const u = doKamery.clone().normalize();
  const srodekSylwetki = kula.srodek
    .clone()
    .addScaledVector(u, (kula.promien * kula.promien) / d);
  const rSylwetki = kula.promien * Math.sqrt(1 - (kula.promien * kula.promien) / (d * d));

  const os1 = new THREE.Vector3(0, 1, 0).cross(u);
  if (os1.lengthSq() < 1e-6) os1.set(1, 0, 0).cross(u);
  os1.normalize();
  const os2 = new THREE.Vector3().crossVectors(u, os1).normalize();

  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  let obciete = 0; // ile punktów sylwetki wypadło ZA obiektywem
  const punkt = new THREE.Vector3();
  for (let i = 0; i < 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    punkt
      .copy(srodekSylwetki)
      .addScaledVector(os1, Math.cos(a) * rSylwetki)
      .addScaledVector(os2, Math.sin(a) * rSylwetki);
    /* ⚠️ Punkty ZA kamerą trzeba wyrzucić RĘCZNIE. Rzutowanie
       perspektywiczne dzieli przez głębokość, więc dla czegoś, co jest
       za plecami, wychodzą liczby w rodzaju „23 000% szerokości" —
       matematycznie poprawne, kompletnie bez sensu jako kadr.
       Przy planetach oglądanych z bliska (Usługi, Kontakt) to nie
       teoria: tam pół sylwetki naprawdę jest za obiektywem. */
    if (punkt.clone().applyMatrix4(kamera.matrixWorldInverse).z > -0.02) {
      obciete++;
      continue;
    }
    punkt.project(kamera);
    const x = (punkt.x + 1) / 2;      // NDC → ułamek szerokości
    const y = (1 - punkt.y) / 2;      // y liczone OD GÓRY ekranu
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  if (obciete === 128) return null; // cała kula za plecami
  const s = srodekSylwetki.clone().project(kamera);
  return {
    x: (s.x + 1) / 2,
    y: (1 - s.y) / 2,
    lewo: minX, prawo: maxX, gora: minY, dol: maxY,
    wys: maxY - minY,
    obciete,
    zaPlecami: srodekSylwetki.clone().applyMatrix4(kamera.matrixWorldInverse).z > 0,
  };
}

/** Rzutuj PIERŚCIENIE olbrzyma (obręcz od 1,6 do 2,7 w płaszczyźnie
    przechylonej o PRZECHYL) i powiedz, jaką smugą kładą się na ekranie.
    `nachylenie` to kąt tej smugi w stopniach: 0° = idealnie pozioma
    kreska przez kadr, 90° = pionowa. To JEST liczba, o którą chodzi
    w prośbie „księżyc i pierścienie w jednej linii". */
function rzutujPierscienie(kamera: THREE.PerspectiveCamera) {
  const pkt: THREE.Vector3[] = [];
  for (const R of [1.6, 2.7]) {
    for (let i = 0; i < 240; i++) {
      const a = (i / 240) * Math.PI * 2;
      pkt.push(
        new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0)
          .applyAxisAngle(new THREE.Vector3(1, 0, 0), PRZECHYL)
          .applyAxisAngle(new THREE.Vector3(0, 0, 1), OBROT_UKLADU)
          .add(SRODEK_OLBRZYMA)
      );
    }
  }
  // tylko to, co naprawdę jest przed obiektywem (patrz ostrzeżenie
  // o punktach za kamerą w `rzutujKule` wyżej)
  const ekran = pkt
    .filter((p) => p.clone().applyMatrix4(kamera.matrixWorldInverse).z < -0.02)
    .map((p) => p.clone().project(kamera))
    .map((p) => ({ x: (p.x + 1) / 2, y: (1 - p.y) / 2 }));
  if (ekran.length < 8) return null;

  // kierunek najdłuższej osi smugi = główna składowa (PCA na piechotę),
  // liczona w PIKSELACH, żeby proporcje ekranu nie fałszowały kąta
  const sx = ekran.reduce((s, p) => s + p.x, 0) / ekran.length;
  const sy = ekran.reduce((s, p) => s + p.y, 0) / ekran.length;
  let xx = 0, yy = 0, xy = 0;
  for (const p of ekran) {
    const dx = (p.x - sx) * SZER;
    const dy = (p.y - sy) * WYS;
    xx += dx * dx; yy += dy * dy; xy += dx * dy;
  }
  const kat = 0.5 * Math.atan2(2 * xy, xx - yy); // radiany, od poziomu
  return {
    nachylenie: (kat * 180) / Math.PI,
    gora: Math.min(...ekran.map((p) => p.y)),
    dol: Math.max(...ekran.map((p) => p.y)),
    lewo: Math.min(...ekran.map((p) => p.x)),
    prawo: Math.max(...ekran.map((p) => p.x)),
  };
}

const pr = (v: number) => (v * 100).toFixed(1).padStart(6) + "%";

console.log(`\n=== KADRY przy ${SZER}x${WYS} (proporcje ${ASPECT.toFixed(2)}) ===`);
console.log(`Wszystko w % ekranu. Oś y liczona OD GÓRY (0% = góra, 100% = dół).\n`);

for (let i = 0; i < PRZYSTANKI.length; i++) {
  const p = PRZYSTANKI[i];
  const kamera = ustawKamere(i);
  console.log(
    `— ${i}. ${p.nazwa.toUpperCase()}  ` +
    `(fov ${p.fov}°, przechył ${p.obrot}°, kadr x=${p.kadr.x} y=${p.kadr.y}, ` +
    `dystans ${dystansPrzystanku(p).toFixed(2)})`
  );
  for (const kula of KULE) {
    const r = rzutujKule(kamera, kula);
    if (!r || r.zaPlecami) continue;
    if (r.prawo < -0.2 || r.lewo > 1.2 || r.dol < -0.2 || r.gora > 1.2) continue; // poza kadrem
    const cel =
      (p.cel.typ === "ksiezyc" && kula.nazwa === "ksiezyc") ||
      (p.cel.typ === "punkt" && p.cel.v === kula.srodek)
        ? "  ★ CEL"
        : "";
    console.log(
      `     ${kula.nazwa.padEnd(10)} środek x=${pr(r.x)} y=${pr(r.y)} │ ` +
      `x od ${pr(r.lewo)} do ${pr(r.prawo)} │ y od ${pr(r.gora)} do ${pr(r.dol)} │ ` +
      `wysokość ${(r.wys * 100).toFixed(0)}%${cel}`
    );
  }
  const p2 = rzutujPierscienie(kamera);
  if (p2 && p2.prawo > -0.2 && p2.lewo < 1.2 && p2.dol > -0.2 && p2.gora < 1.2) {
    console.log(
      `     ${"PIERŚCIENIE".padEnd(10)} nachylenie ${p2.nachylenie.toFixed(1).padStart(6)}° │ ` +
      `x od ${pr(p2.lewo)} do ${pr(p2.prawo)} │ y od ${pr(p2.gora)} do ${pr(p2.dol)}`
    );
  }
  console.log("");
}

/* ============ TEST DETERMINIZMU ============
   Przystanek „Usługi" stoi na KRĄŻĄCYM księżycu. Kompozycja nie może
   zależeć od tego, w którym miejscu orbity księżyc akurat jest —
   inaczej każde wejście na stronę daje inny kadr. Sprawdzamy to
   wprost: liczymy scenę dla ośmiu punktów orbity i patrzymy, czy
   cokolwiek się rusza. */
const nrUslug = PRZYSTANKI.findIndex((p) => p.nazwa === "uslugi");
if (nrUslug >= 0) {
  console.log("=== TEST DETERMINIZMU — przystanek USŁUGI na 8 punktach orbity ===");
  const wiersze: string[] = [];
  const nachylenia: number[] = [];
  const srodkiX: number[] = [];
  for (let k = 0; k < 8; k++) {
    const kat = (k / 8) * Math.PI * 2;
    const kamera = ustawKamere(nrUslug, kat);
    const ksiezyc = rzutujKule(kamera, {
      nazwa: "ksiezyc",
      srodek: pozycjaKsiezyca(kat, R_ORBITY),
      promien: R_KSIEZYC,
    });
    const olbrzym = rzutujKule(kamera, {
      nazwa: "olbrzym",
      srodek: SRODEK_OLBRZYMA,
      promien: R_OLBRZYM,
    });
    const ring = rzutujPierscienie(kamera);
    if (!ksiezyc || !ring) continue;
    nachylenia.push(ring.nachylenie);
    srodkiX.push(ksiezyc.x);
    wiersze.push(
      `  orbita ${((kat * 180) / Math.PI).toFixed(0).padStart(3)}° │ ` +
      `księżyc x=${pr(ksiezyc.x)} y=${pr(ksiezyc.y)} │ ` +
      `pierścienie ${ring.nachylenie.toFixed(1).padStart(6)}° │ ` +
      `olbrzym ${olbrzym ? `x=${pr(olbrzym.x)} wys ${(olbrzym.wys * 100).toFixed(0)}%` : "poza kadrem"}`
    );
  }
  console.log(wiersze.join("\n"));
  const rozrzut = (t: number[]) => Math.max(...t) - Math.min(...t);
  console.log(
    `\n  rozrzut nachylenia pierścieni: ${rozrzut(nachylenia).toFixed(2)}°  ` +
    `(ma być ~0 — inaczej kadr to loteria)`
  );
  console.log(
    `  rozrzut pozycji księżyca:      ${(rozrzut(srodkiX) * 100).toFixed(2)}% szerokości\n`
  );
}
