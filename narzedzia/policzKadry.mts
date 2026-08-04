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
  pozycjaKsiezyca,
  srodekPrzystanku,
  kierunekPrzystanku,
  dystansPrzystanku,
} from "../components/lot/kadry.ts";

const SZER = Number(process.argv[2] ?? 1536);
const WYS = Number(process.argv[3] ?? 864);
const ASPECT = SZER / WYS;

/* Kąt księżyca na orbicie jest LOSOWY przy każdym wejściu na stronę.
   Kamera podchodzi do niego promieniowo, więc sam księżyc i tak
   zawsze ląduje w tym samym miejscu ekranu — losowy jest tylko
   fragment olbrzyma za jego plecami. Do liczenia bierzemy więc
   dowolny, ustalony kąt. */
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
function ustawKamere(i: number): THREE.PerspectiveCamera {
  const p = PRZYSTANKI[i];
  const kamera = new THREE.PerspectiveCamera(p.fov, ASPECT, 0.02, 260);

  const srodek = srodekPrzystanku(p, KAT_KSIEZYCA);
  const kierunek = kierunekPrzystanku(p, KAT_KSIEZYCA);
  kamera.position.copy(srodek).addScaledVector(kierunek, dystansPrzystanku(p));

  kamera.up.set(0, 1, 0);
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
  const punkt = new THREE.Vector3();
  for (let i = 0; i < 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    punkt
      .copy(srodekSylwetki)
      .addScaledVector(os1, Math.cos(a) * rSylwetki)
      .addScaledVector(os2, Math.sin(a) * rSylwetki)
      .project(kamera);
    const x = (punkt.x + 1) / 2;      // NDC → ułamek szerokości
    const y = (1 - punkt.y) / 2;      // y liczone OD GÓRY ekranu
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const s = srodekSylwetki.clone().project(kamera);
  return {
    x: (s.x + 1) / 2,
    y: (1 - s.y) / 2,
    lewo: minX, prawo: maxX, gora: minY, dol: maxY,
    wys: maxY - minY,
    zaPlecami: s.z > 1,
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
  console.log("");
}
