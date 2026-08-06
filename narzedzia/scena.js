// ============================================================
// SCENA.JS — sterowanie przeglądarką po protokole DevTools (CDP)
//
// Po co: panel podglądu w edytorze nie renderuje klatek przy
// schowanym oknie (rAF stoi), a zwykły `chrome --screenshot`
// nie umie przewinąć strony. Tutaj mamy pełną kontrolę:
// wejdź na stronę → poczekaj na scenę 3D → przewiń → poczekaj,
// aż kamera dojedzie → zrób zrzut / zmierz FPS / odczytaj DOM.
//
// Zero zależności — Node 24 ma wbudowany WebSocket.
//
// Użycie:
//   node scena.js zrzut  <url> <scrollY> <plik.png> [czekajMs]
//   node scena.js ocen   <url> <scrollY> <wyrazenieJS> [czekajMs]
//   node scena.js fps    <url> <scrollY>
//   node scena.js stop
// ============================================================

const { spawn } = require("node:child_process");
const fs = require("node:fs");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const PROFIL = `${process.env.TEMP}\\claude-cdp-profil`;

/* --- 1. Uruchom (albo znajdź już działającą) przeglądarkę --- */
async function czyZyje() {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`, {
      signal: AbortSignal.timeout(800),
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function dajPrzegladarke(szer, wys) {
  if (await czyZyje()) return;
  const p = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${PROFIL}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${szer},${wys}`,
      "--enable-unsafe-swiftshader", // WebGL programowo (bez karty graficznej)
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "about:blank",
    ],
    { detached: true, stdio: "ignore" }
  );
  p.unref();
  for (let i = 0; i < 60; i++) {
    if (await czyZyje()) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Chrome nie wstał na porcie " + PORT);
}

/* --- 2. Cienki klient CDP --- */
class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nr = 0;
    this.czekajacy = new Map();
    ws.addEventListener("message", (e) => {
      const w = JSON.parse(e.data);
      if (w.id && this.czekajacy.has(w.id)) {
        const { ok, zle } = this.czekajacy.get(w.id);
        this.czekajacy.delete(w.id);
        w.error ? zle(new Error(JSON.stringify(w.error))) : ok(w.result);
      }
    });
  }
  static async polacz(url) {
    const ws = new WebSocket(url);
    await new Promise((ok, zle) => {
      ws.addEventListener("open", ok, { once: true });
      ws.addEventListener("error", zle, { once: true });
    });
    return new Cdp(ws);
  }
  wyslij(method, params = {}) {
    const id = ++this.nr;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((ok, zle) => this.czekajacy.set(id, { ok, zle }));
  }
  /** Uruchom wyrażenie JS na stronie i zwróć wynik (przez JSON). */
  async ocen(wyrazenie) {
    const r = await this.wyslij("Runtime.evaluate", {
      expression: `(async () => { return (${wyrazenie}); })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  }
  zamknij() {
    this.ws.close();
  }
}

/* --- 3. Otwórz kartę i doprowadź stronę do zadanego stanu --- */
async function przygotuj(url, scrollY, czekajMs, szer, wys) {
  await dajPrzegladarke(szer, wys);
  const cel = await fetch(
    `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent("about:blank")}`,
    { method: "PUT" }
  ).then((r) => r.json());
  const cdp = await Cdp.polacz(cel.webSocketDebuggerUrl);

  await cdp.wyslij("Page.enable");
  await cdp.wyslij("Runtime.enable");
  /* Obserwator wstrzyknięty PRZED skryptami strony: zapisuje czas
     w chwili, gdy scena melduje gotowość. Bez tego pomiar łapie
     dopiero moment, w którym wątek główny się zwolni — a jeśli
     zaraz po gotowości rusza ciężka praca w tle, wynik jest
     zawyżony o jej czas. */
  await cdp.wyslij("Page.addScriptToEvaluateOnNewDocument", {
    source: `(() => {
      const obs = new MutationObserver(() => {
        if (document.querySelector('.tryb-lot.lot-gotowy')) {
          window.__gotowe = Math.round(performance.now());
          obs.disconnect();
        }
      });
      document.addEventListener('DOMContentLoaded', () =>
        obs.observe(document.documentElement, { subtree: true, attributes: true, childList: true })
      );
    })()`,
  });
  await cdp.wyslij("Emulation.setDeviceMetricsOverride", {
    width: szer,
    height: wys,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp.wyslij("Page.navigate", { url });

  /* Czekaj, aż scena 3D się zbuduje (klasa „lot-gotowy").
     Limit jest HOJNY (45 s), bo serwer deweloperski potrafi
     kompilować kilkanaście sekund, a obciążona maszyna jeszcze
     dłużej. Gdy limit minie za wcześnie, dzieje się rzecz myląca:
     ekran startowy blokuje przewijanie, więc `scrollTo` nic nie robi
     i zrzut wychodzi z HERO zamiast z zamówionej sekcji — wygląda
     to jak błąd kadru, a jest zwykłym wyścigiem.
     GOTOWOSC_MS=... zmienia limit, NIE_CZEKAJ=1 wyłącza czekanie
     (do zrzutów samego ekranu startowego). */
  const limitGotowosci = Number(process.env.GOTOWOSC_MS || 45000);
  if (!process.env.NIE_CZEKAJ) {
    const gotowa = await cdp.ocen(`new Promise((ok) => {
      const start = Date.now();
      const sprawdz = () => {
        const g = document.querySelector('.tryb-lot.lot-gotowy');
        if (g || Date.now() - start > ${limitGotowosci}) ok(!!g);
        else setTimeout(sprawdz, 120);
      };
      sprawdz();
    })`);
    if (!gotowa) console.error("UWAGA: scena nie zdążyła się zbudować — zrzut może być z hero");
  }

  /* Poczekaj, aż strona osiągnie OSTATECZNĄ WYSOKOŚĆ.
     Bez tego przeglądarka przycina scroll do aktualnej wysokości
     dokumentu — a dopóki nie doładują się miniatury portfolio,
     strona jest krótsza i zrzut ląduje w zupełnie innej sekcji. */
  await cdp.ocen(`new Promise((ok) => {
    const gotowe = () => setTimeout(ok, 700);
    document.readyState === 'complete' ? gotowe() : addEventListener('load', gotowe);
  })`);

  // przewiń i daj kamerze dolecieć (silnik wygładza scroll ~1 s).
  // scrollY = "brak" → nie ruszaj scrolla (test wejścia z kotwicy)
  if (scrollY !== "brak") {
    await cdp.ocen(`(() => { window.scrollTo(0, ${Number(scrollY) || 0}); return true; })()`);
  }
  await cdp.ocen(`new Promise((ok) => setTimeout(() => ok(true), ${czekajMs}))`);
  return { cdp, cel };
}

async function zamknijKarte(cel) {
  await fetch(`http://127.0.0.1:${PORT}/json/close/${cel.id}`).catch(() => {});
}

/* --- 4. Polecenia --- */
async function main() {
  const [tryb, ...reszta] = process.argv.slice(2);

  if (tryb === "stop") {
    await fetch(`http://127.0.0.1:${PORT}/json/version`)
      .then((r) => r.json())
      .then(async (v) => {
        const cdp = await Cdp.polacz(v.webSocketDebuggerUrl);
        await cdp.wyslij("Browser.close").catch(() => {});
      })
      .catch(() => {});
    console.log("przegladarka zamknieta");
    return;
  }

  const szer = Number(process.env.SZER || 1536);
  const wys = Number(process.env.WYS || 864);

  if (tryb === "zrzut") {
    const [url, scrollY, plik, czekaj = "2600", wycinek] = reszta;
    const { cdp, cel } = await przygotuj(url, scrollY, Number(czekaj), szer, wys);
    // opcjonalny wycinek w formacie "x,y,szer,wys,skala" — do oglądania
    // detali (np. liter w kafelku menu) w powiększeniu
    const opcje = { format: "png", captureBeyondViewport: false };
    if (wycinek) {
      const [x, y, w, h, s = "3"] = wycinek.split(",").map(Number);
      opcje.clip = { x, y, width: w, height: h, scale: s };
    }
    const { data } = await cdp.wyslij("Page.captureScreenshot", opcje);
    fs.writeFileSync(plik, Buffer.from(data, "base64"));
    cdp.zamknij();
    await zamknijKarte(cel);
    console.log(`OK ${plik} (${Math.round(fs.statSync(plik).size / 1024)} KB)`);
    return;
  }

  if (tryb === "ocen") {
    const [url, scrollY, wyrazenie, czekaj = "2600"] = reszta;
    const { cdp, cel } = await przygotuj(url, scrollY, Number(czekaj), szer, wys);
    console.log(JSON.stringify(await cdp.ocen(wyrazenie), null, 2));
    cdp.zamknij();
    await zamknijKarte(cel);
    return;
  }

  if (tryb === "fps") {
    const [url, scrollY, czekaj = "2600"] = reszta;
    const { cdp, cel } = await przygotuj(url, scrollY, Number(czekaj), szer, wys);
    const wynik = await cdp.ocen(`new Promise((ok) => {
      let n = 0; const t0 = performance.now();
      const licz = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(licz);
        else ok({ klatki: n, sekundy: +((performance.now()-t0)/1000).toFixed(2),
                  fps: +(n / ((performance.now()-t0)/1000)).toFixed(1) }); };
      requestAnimationFrame(licz);
    })`);
    console.log(JSON.stringify(wynik));
    cdp.zamknij();
    await zamknijKarte(cel);
    return;
  }

  console.log("uzycie: zrzut|ocen|fps|stop — patrz naglowek pliku");
}

main().catch((e) => {
  console.error("BLAD:", e.message);
  process.exit(1);
});
