// ============================================================
// GENERATOR MINIATUR PORTFOLIO
//
// Robi to, co kiedyś robiły skrypty zgubione razem z sesją
// (patrz KONTEKST.md, etap 10). Dlatego tym razem leży w repo.
//
// Co robi, krok po kroku:
//   1. otwiera stronę-demo w niewidocznej przeglądarce i robi
//      zrzut w wersji na komputer (1280×800),
//   2. to samo w wersji na telefon (390×844),
//   3. skleja oba w MOCKUP: okno przeglądarki z paskiem zakładek
//      + nachodzący telefon, na kosmicznym gradiencie marki,
//   4. zapisuje gotowy plik do public/portfolio/.
//
// Wymaga tylko Chrome'a (jest na każdym Windowsie z Chrome).
// Zero bibliotek — Node 24 ma wbudowany WebSocket, więc rozmawiamy
// z przeglądarką wprost po protokole DevTools.
//
// Uruchomienie (dev serwer musi działać na :3000):
//   node narzedzia/miniatury.mjs aurelio northfield elena-voss kano
//   node narzedzia/miniatury.mjs --wszystkie
// ============================================================

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;
const ADRES = "http://localhost:3000";
const KATALOG = path.join(process.cwd(), "public", "portfolio");

/* Które projekty i w jakim formacie kafelka.
   „szeroki" = kafelek na 2 kolumny siatki, „waski" = na 1. */
const PROJEKTY = {
  aurelio: { plik: "aurelio.jpg", uklad: "szeroki" },
  northfield: { plik: "northfield.jpg", uklad: "waski" },
  "elena-voss": { plik: "elena-voss.jpg", uklad: "szeroki" },
  kano: { plik: "kano.jpg", uklad: "waski" },
};

/* Wymiary miniatury dobrane pod proporcje kafelka w siatce. */
const WYMIARY = { szeroki: [1680, 760], waski: [1000, 900] };

/* ---------- minimalny klient DevTools ---------- */
async function zyje() {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`, {
      signal: AbortSignal.timeout(700),
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function uruchomChrome() {
  if (await zyje()) return;
  const p = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${process.env.TEMP}\\claude-miniatury`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--enable-unsafe-swiftshader",
      "about:blank",
    ],
    { detached: true, stdio: "ignore" }
  );
  p.unref();
  for (let i = 0; i < 60; i++) {
    if (await zyje()) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Chrome nie wstał");
}

class Karta {
  constructor(ws, id) {
    this.ws = ws;
    this.id = id;
    this.nr = 0;
    this.czekaja = new Map();
    ws.addEventListener("message", (e) => {
      const w = JSON.parse(e.data);
      const c = this.czekaja.get(w.id);
      if (!c) return;
      this.czekaja.delete(w.id);
      w.error ? c.zle(new Error(JSON.stringify(w.error))) : c.ok(w.result);
    });
  }
  static async otworz() {
    const cel = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
      method: "PUT",
    }).then((r) => r.json());
    const ws = new WebSocket(cel.webSocketDebuggerUrl);
    await new Promise((ok, zle) => {
      ws.addEventListener("open", ok, { once: true });
      ws.addEventListener("error", zle, { once: true });
    });
    return new Karta(ws, cel.id);
  }
  wyslij(method, params = {}) {
    const id = ++this.nr;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((ok, zle) => this.czekaja.set(id, { ok, zle }));
  }
  async zamknij() {
    this.ws.close();
    await fetch(`http://127.0.0.1:${PORT}/json/close/${this.id}`).catch(() => {});
  }
}

/** Wejdź na adres, poczekaj, zrób zrzut. Zwraca base64 (PNG albo JPEG). */
async function zrzut(url, szer, wys, { format = "png", jakosc, czekaj = 1400 } = {}) {
  const k = await Karta.otworz();
  await k.wyslij("Page.enable");
  await k.wyslij("Emulation.setDeviceMetricsOverride", {
    width: szer,
    height: wys,
    deviceScaleFactor: 1,
    mobile: szer < 600,
  });
  await k.wyslij("Page.navigate", { url });
  await new Promise((r) => setTimeout(r, czekaj));
  const opcje = { format, captureBeyondViewport: false };
  if (jakosc) opcje.quality = jakosc;
  const { data } = await k.wyslij("Page.captureScreenshot", opcje);
  await k.zamknij();
  return data;
}

/* ---------- szablon mockupu ---------- */
function szablon(desktopB64, mobileB64, tytul) {
  return `<!doctype html><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:100vw;height:100vh;overflow:hidden;font-family:system-ui,sans-serif;
    background:
      radial-gradient(70% 80% at 78% 12%, rgba(139,124,247,.42), transparent 62%),
      radial-gradient(60% 70% at 10% 96%, rgba(240,111,174,.30), transparent 66%),
      linear-gradient(150deg,#161231,#0b0819 62%,#120b23);
    display:grid;place-items:center}
  .scena{position:relative;width:88%;height:82%}
  /* okno przeglądarki */
  .okno{position:absolute;inset:0 12% 8% 0;background:#1b1730;border-radius:14px;
    overflow:hidden;box-shadow:0 60px 120px -40px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.09)}
  .pasek{height:38px;background:#221d3c;display:flex;align-items:center;gap:8px;padding:0 14px;
    border-bottom:1px solid rgba(255,255,255,.07)}
  .kropki{display:flex;gap:6px}
  .kropki i{width:11px;height:11px;border-radius:50%;display:block}
  .adres{flex:1;height:22px;background:rgba(255,255,255,.08);border-radius:6px;margin-left:10px;
    display:flex;align-items:center;padding:0 12px;font-size:11px;color:rgba(255,255,255,.5)}
  .okno img{display:block;width:100%}
  /* telefon */
  .tel{position:absolute;right:0;bottom:0;width:19%;aspect-ratio:390/844;background:#0d0a18;
    border-radius:26px;padding:7px;box-shadow:0 50px 100px -30px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.12)}
  .tel div{width:100%;height:100%;border-radius:20px;overflow:hidden;background:#fff}
  .tel img{display:block;width:100%}
  </style>
  <div class="scena">
    <div class="okno">
      <div class="pasek">
        <div class="kropki"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div>
        <div class="adres">${tytul}</div>
      </div>
      <img src="data:image/png;base64,${desktopB64}">
    </div>
    <div class="tel"><div><img src="data:image/png;base64,${mobileB64}"></div></div>
  </div>`;
}

/* ---------- główny przebieg ---------- */
const wybrane = process.argv.slice(2);
const lista =
  wybrane.length === 0 || wybrane[0] === "--wszystkie"
    ? Object.keys(PROJEKTY)
    : wybrane;

await uruchomChrome();
fs.mkdirSync(KATALOG, { recursive: true });
const tmp = path.join(process.env.TEMP, "claude-miniatury-tmp");
fs.mkdirSync(tmp, { recursive: true });

for (const nazwa of lista) {
  const cfg = PROJEKTY[nazwa];
  if (!cfg) {
    console.log(`pomijam „${nazwa}" — nie ma go w liście PROJEKTY`);
    continue;
  }
  const url = `${ADRES}/prace/${nazwa}.html`;
  process.stdout.write(`${nazwa}: zrzut desktop… `);
  const desktop = await zrzut(url, 1280, 800);
  process.stdout.write("mobile… ");
  const mobile = await zrzut(url, 390, 844);

  process.stdout.write("mockup… ");
  const [szer, wys] = WYMIARY[cfg.uklad];
  const plikSzablonu = path.join(tmp, `${nazwa}.html`);
  fs.writeFileSync(plikSzablonu, szablon(desktop, mobile, `${nazwa}.com`), "utf8");
  const gotowa = await zrzut(
    "file:///" + plikSzablonu.replace(/\\/g, "/"),
    szer,
    wys,
    { format: "jpeg", jakosc: 88, czekaj: 900 }
  );

  const wyjscie = path.join(KATALOG, cfg.plik);
  fs.writeFileSync(wyjscie, Buffer.from(gotowa, "base64"));
  console.log(`gotowe → public/portfolio/${cfg.plik} (${Math.round(fs.statSync(wyjscie).size / 1024)} kB)`);
}

// zamknij przeglądarkę
await fetch(`http://127.0.0.1:${PORT}/json/version`)
  .then((r) => r.json())
  .then(async (v) => {
    const ws = new WebSocket(v.webSocketDebuggerUrl);
    await new Promise((ok) => ws.addEventListener("open", ok, { once: true }));
    ws.send(JSON.stringify({ id: 1, method: "Browser.close" }));
    await new Promise((r) => setTimeout(r, 400));
  })
  .catch(() => {});
console.log("\nGotowe.");
