/* The Bread Bar — single page app with real URLs (/menu/, /locations/ttdi/ ...; routes, head tags and JSON-LD in
   seo.js; the publish step bakes one index.html per route). Content lives in data.js; the owner-editable parts (menu, bakery
   prices, opening hours) are overridden at start from content/*.json, which the owner edits at /admin/ (Sveltia CMS).
   Any content file that fails to load or parse is skipped, so data.js values show instead and the page never stays
   blank. Editor text only reaches the page through esc() / textContent. */
(() => {
  const D = window.TBB;
  // (an older cached data.js has no `opening`: start from the usual hours)
  D.opening = D.opening || { ttdi: { opens: "08:00", closes: "22:00" }, publika: { opens: "08:00", closes: "22:00" }, brunchFrom: "08:00", brunchUntil: "17:00", notice: "" };
  const str = (v) => (typeof v === "string" ? v : v == null || typeof v === "object" ? "" : String(v)).trim();
  const num = (v) => { if (v === "" || v == null || typeof v === "boolean") return null; const n = Number(v); return isFinite(n) && n >= 0 ? n : null; };
  const shown = (x) => x && typeof x === "object" && x.show !== false && str(x.name);
  const list = (v) => (Array.isArray(v) ? v : []);
  const clip = (v) => (/^[\w-]+$/.test(str(v)) ? str(v) : undefined); // video names are fixed files in assets/video
  // add-on lines like ["alternate butter: truffle / kombu", "+ 6.5"]; undefined when there are none
  const extrasIn = (v) => { const e = list(v).filter((x) => x && str(x.text)).map((x) => [str(x.text), num(x.price) == null ? "" : `+ ${num(x.price).toFixed(1)}`]); return e.length ? e : undefined; };
  const itemIn = (x, cat) => {
    const it = { n: str(x.name) };
    if (x.show === false) it.hidden = true;
    if (str(x.description)) it.d = str(x.description);
    if (cat.hc) it.p = [num(x.priceHot), num(x.priceCold)];
    else { const a = num(x.price), b = num(x.pricePublika); it.p = b != null && b !== a ? { ttdi: a, pub: b } : a; }
    if (x.outlets === "ttdi" || x.outlets === "pub") it.only = x.outlets;
    if (x.vegetarian === true) it.v = true;
    if (str(x.photo)) it.img = str(x.photo);
    if (clip(x.video)) it.vid = clip(x.video);
    if (/^#[\w-]+$/.test(str(x.link))) it.link = str(x.link);
    const ex = extrasIn(x.extras); if (ex) it.extras = ex;
    return it;
  };
  const apply = {
    menu(json, cat) {
      const sections = list(json.sections).filter((s) => s && Array.isArray(s.items)).map((s) => {
        const sec = { title: str(s.title), items: s.items.filter((x) => x && typeof x === "object" && str(x.name)).map((x) => itemIn(x, cat)) };
        if (str(s.note)) sec.note = str(s.note);
        const ex = extrasIn(s.extras); if (ex) sec.extras = ex;
        return sec;
      });
      if (!sections.some((s) => s.items.length)) throw new Error("no items");
      cat.sections = sections;
      if (str(json.tab)) cat.name = str(json.tab);
    },
    bakery(json) {
      const loaves = list(json.loaves).filter(shown).map((x) => ({ n: str(x.name), p: num(x.price) ?? "", img: str(x.photo) || "assets/texture-terracotta.jpg",
        g: num(x.weight) ?? "", flour: str(x.flour), notes: str(x.tasting) || undefined, crust: str(x.crust), tang: str(x.tang), crumb: str(x.crumb),
        inc: str(x.inclusions), hyd: Math.min(100, num(x.hydration) ?? 0) }));
      if (loaves.length) D.loaves = loaves;
      if (Array.isArray(json.pastries)) D.pastry = json.pastries.filter(shown).map((x) => [str(x.name), num(x.price), str(x.photo) || undefined, clip(x.video)]);
      if (Array.isArray(json.cakeSlices)) D.cakeSlices = json.cakeSlices.filter(shown).map((x) => [str(x.name), num(x.price) ?? ""]);
      if (Array.isArray(json.wholeCakes)) D.wholeCakes = json.wholeCakes.filter(shown).map((x) => str(x.name));
      const beans = list(json.beans).filter((x) => x && str(x.size)).map((x) => [str(x.size), num(x.price) ?? ""]);
      if (beans.length) D.beans.sizes = beans;
    },
    hours(json) { window.TBBSEO.applyHours(D.opening, json); }, // same rule as the publish-time build (seo.js)
  };
  const files = [["hours", (j) => apply.hours(j)], ["bakery", (j) => apply.bakery(j)],
    ...D.menu.map((cat) => [`menu-${cat.id}`, (j) => apply.menu(j, cat)])];
  // no-cache = the browser re-checks each file (a quick 304 when unchanged), so an edit shows on the next refresh
  const load = ([name]) => fetch(`content/${name}.json`, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  let started = false;
  const start = (results) => {
    if (started) return; started = true;
    (results || []).forEach((json, i) => {
      if (!json || typeof json !== "object") return;
      try { files[i][1](json); } catch (e) { console.warn(`content/${files[i][0]}.json skipped:`, e.message); }
    });
    startSite();
  };
  setTimeout(() => start(null), 4000); // slow network: show data.js content rather than an empty page
  try { Promise.all(files.map(load)).then(start, () => start(null)); } catch (e) { start(null); }
})();

function startSite() {
  const D = window.TBB;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $("#app");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual"; // the router sets scroll itself
  // photo: a bare slug from data.js ("prawn-toast") or a path from the editor ("/assets/uploads/x.webp"); always relative
  // (the review preview lives in a sub-folder) and escaped for use in attributes.
  const photo = (s) => esc(/[/.]/.test(s) ? String(s).replace(/^\/+/, "") : `assets/photos/${s}.jpg`);
  const slugOf = (s) => String(s || "").replace(/^.*\//, "").replace(/\.[a-z0-9]+$/i, "");
  // Reserve / book a table: the outlet's WhatsApp with the preloaded enquiry prompt (D.events.waPrompt, user's text)
  const resWa = (o) => (D.events.waPrompt ? `${o.whatsapp}?text=${encodeURIComponent(D.events.waPrompt)}` : o.whatsapp);
  const money = (n) => (n == null ? "" : Number(n).toFixed(1));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const OUT = D.outlets;
  /* Opening hours: data.js `opening`, overridden by content/hours.json. Every hours text on the site comes from H
     (wording in seo.js, shared with the publish-time build of the per-page head tags + JSON-LD). */
  const SEO = window.TBBSEO;
  const H = SEO.hours(D.opening);
  // Real-URL routing needs the <base href> in index.html: "/" on thebreadbar.my and locally, the sub-folder on the
  // review preview (publish-pages.ps1 writes it per target). Links are written relative to it ("menu/#hearty").
  const pathMode = !!document.querySelector("base[href]") && /^https?:$/.test(location.protocol);
  const SITE = pathMode ? new URL(".", document.baseURI).href : "https://thebreadbar.my/";
  const BASE = new URL(SITE).pathname;
  // an old #token (menu items' `link` in content/*.json, e.g. "#bakery") as a link: "bakery/"
  const hrefOf = (tok) => { const r = SEO.fromToken(tok); return r ? (r.path || "./") + (r.anchor ? "#" + r.anchor : "") : "./"; };
  D.hours = H.daily;
  D.brunchHours = H.brunch;
  D.menu.forEach((c) => c.sections.forEach((s) => { if (/^brunch$/i.test(s.title)) s.note = H.brunchNote; }));
  // the "Open every day" scene runs from the earliest opening to the latest closing; its moments keep their place
  const dayAt = (h) => H.open + ((h - 8) / 14) * (H.close - H.open);
  const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  const countWord = (n) => (words[n] ? words[n][0].toUpperCase() + words[n].slice(1) : String(n));
  // the bean bag's line in the shop follows the bean prices on the Bakery page
  D.shop.items.forEach((x) => { if (x.beansPrices) x.line = D.beans.sizes.map(([s, p]) => `${s} RM ${p}`).join(" · "); });
  const outletKey = (slug) => (slug === "publika" ? "pub" : "ttdi");
  const outletSlug = (key) => (key === "pub" ? "publika" : "ttdi");

  let store = {};
  try { store = JSON.parse(localStorage.getItem("tbb") || "{}"); } catch (e) {}
  const save = () => { try { localStorage.setItem("tbb", JSON.stringify(store)); } catch (e) {} };
  let menuOutlet = store.outlet || "ttdi";

  /* ------------------------------------------------------------------ shared bits */
  // Delivery partners: Beep always; GrabFood once the outlet's official store link is set in data.js.
  const hasGrab = Object.values(OUT).some((o) => o.grab);
  const deliveryLinks = (o, sep = " or ") => `<a href="${o.order}" target="_blank" rel="noopener">Beep</a>` +
    (o.grab ? `${sep}<a href="${o.grab}" target="_blank" rel="noopener">GrabFood</a>` : "");
  const addr = (o) => o.address.map(esc).join("<br>");

  // Outlet as a solid colour block: corner links, condensed name, one centred photo, address under it.
  const locCard = (key) => {
    const o = OUT[key];
    return `
    <article class="loc-block loc-${key} reveal">
      <div class="loc-corners">
        <a href="${resWa(o)}" target="_blank" rel="noopener">Reserve a table</a>
        <a href="${o.maps}" target="_blank" rel="noopener">Directions</a>
      </div>
      <h3 class="loc-name">${esc(o.name)}</h3>
      <p class="loc-sub">${esc(o.since)}</p>
      <a class="loc-photo" href="locations/${outletSlug(key)}/"><img src="${o.photo}" alt="${esc(o.full)}" loading="lazy"></a>
      <address>${addr(o)}</address>
      <p class="loc-meta">${esc(H.outlet(key))} · <span class="nowrap">${esc(o.phone)}</span></p>
      <div class="loc-actions">
        <a class="btn btn-ghost" href="locations/${outletSlug(key)}/">Hours &amp; directions</a>
        ${o.grab ? `<button class="btn" data-chooser="order">Order delivery</button>` : `<a class="btn" href="${o.order}" target="_blank" rel="noopener">Order delivery</a>`}
      </div>
      <p class="cta-note">Delivery or pick-up via Beep${o.grab ? " or GrabFood" : ""}</p>
    </article>`;
  };

  // Simple line drawings for merchandise that has no photos yet (drawn, not copied from any reference).
  const ART = {
    tote: `<path d="M38 52h84l-6 92H44z"/><path d="M58 52c0-22 44-22 44 0"/><ellipse cx="80" cy="82" rx="22" ry="9"/><ellipse cx="80" cy="102" rx="26" ry="9"/><ellipse cx="80" cy="122" rx="22" ry="9"/>`,
    pot: `<path d="M30 80h100l-14 62H44z"/><path d="M52 80c0-26 56-26 56 0"/><path d="M48 98h64"/><circle cx="80" cy="70" r="5"/>`,
    baguette: `<path d="M56 54h48l-4 92H60z"/><path d="M64 54c2-12 6-26 10-34M78 54c0-14 2-28 8-38M92 54c-2-12-2-24 2-34"/><path d="M68 30l4 4M82 24l4 4M92 30l4 4"/>`,
    cover: `<path d="M28 112h104l-10 26H38z"/><path d="M36 112c4-34 84-34 88 0"/><path d="M62 92h36"/><path d="M80 82v10"/>`,
    tee: `<path d="M54 32l-28 18 12 22 12-6v74h60V66l12 6 12-22-28-18c-4 10-14 14-26 14s-22-4-26-14z"/><path d="M64 86h32M60 98h40M66 110h28"/>`,
    kit: `<rect x="34" y="70" width="58" height="66" rx="3"/><path d="M34 86h58"/><path d="M98 112c0-16 28-16 28 0v24H98z"/><path d="M58 52c0-10 10-16 18-12"/><ellipse cx="112" cy="104" rx="16" ry="6"/>`,
    bouquet: `<path d="M50 84l30 62 30-62z"/><path d="M58 84c-6-26-2-52 8-66M74 84c-2-28 2-54 10-70M90 84c2-26 4-50 16-62M102 84c6-20 14-36 24-44"/><path d="M60 110c14 8 26 8 40 0"/>`,
    plate: `<ellipse cx="80" cy="96" rx="58" ry="34"/><ellipse cx="80" cy="96" rx="40" ry="22"/><path d="M60 92c8-6 32-6 40 0M64 100c8 4 24 4 32 0"/>`,
    jam: `<rect x="34" y="70" width="40" height="64" rx="8"/><path d="M34 84h40"/><rect x="38" y="58" width="32" height="12" rx="3"/><path d="M88 112h44v22H88z"/><path d="M92 112c0-14 36-14 36 0"/>`,
    cookies: `<path d="M52 56l8 16 18 2-13 12 4 18-17-9-16 9 3-18-13-12 18-2z"/><circle cx="110" cy="72" r="20"/><circle cx="104" cy="66" r="2"/><circle cx="116" cy="76" r="2"/><path d="M76 118c8 16 30 22 46 10"/><circle cx="62" cy="124" r="14"/>`,
    angpao: `<rect x="40" y="40" width="54" height="86" rx="4"/><path d="M40 62l27 18 27-18"/><circle cx="67" cy="80" r="7"/><circle cx="118" cy="110" r="16"/><circle cx="110" cy="132" r="12"/>`,
    loaf: `<path d="M22 104c0-34 26-56 58-56s58 22 58 56c0 12-8 18-20 18H42c-12 0-20-6-20-18z"/><path d="M48 76c8 4 14 12 16 22M74 66c8 6 12 16 12 28M100 70c6 6 10 14 10 24"/><path d="M28 134h104"/><circle cx="128" cy="40" r="14"/><path d="M128 32v8l6 4"/>`,
    beans: `<path d="M44 52h72v86H44z"/><path d="M44 66h72"/><ellipse cx="72" cy="102" rx="10" ry="15" transform="rotate(-20 72 102)"/><path d="M68 90c6 8 6 16 0 24"/><ellipse cx="94" cy="104" rx="9" ry="13" transform="rotate(18 94 104)"/>`,
  };
  // Looping, muted background clips from the brand deck (GIFs converted to MP4). Poster shows until it plays.
  const vid = (name, small) => `<video class="bgvid" autoplay muted loop playsinline preload="metadata" poster="assets/video/${name}.jpg" aria-hidden="true"><source src="assets/video/${name}${small ? "-sm" : ""}.mp4" type="video/mp4"></video>`;
  const tv = (name) => `
    <div class="tv reveal">
      <div class="tv-screen">${vid(name, true)}<div class="tv-overlay"><img src="assets/logo-light.png" alt=""><span>Celebreadtion</span></div></div>
      <div class="tv-base"><i></i><b></b><b></b></div>
    </div>`;

  // Shop item visual: clip if it has one, else its photo, else the line drawing.
  const shopMedia = (x) => x.vid ? vid(x.vid) : x.img ? `<img src="${photo(x.img)}" alt="${esc(x.n)}" loading="lazy">` : art(x.art, x.n);

  const art = (key, label) => `<svg viewBox="0 0 160 160" role="img" aria-label="${esc(label)}" class="art"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ART[key] || ART.tote}</g></svg>`;

  /* ------------------------------------------------------------------ pages */
  const pages = {};

  // "From flour to counter" (the page's peak): one line per stage of the loaf; the stage on the right follows them.
  // Flour dust for the hero's atmosphere plane: fixed pseudo-random specks (same on every load), no animation.
  const DUST = (() => {
    let s = 7, out = "";
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 70; i++) {
      const d = (0.8 + rnd() * 2.2).toFixed(1);
      out += `<i style="left:${(rnd() * 100).toFixed(1)}%;top:${(rnd() * 60).toFixed(1)}%;width:${d}px;height:${d}px;opacity:${(0.18 + rnd() * 0.5).toFixed(2)}"></i>`;
    }
    return out;
  })();
  const BAKE_STEPS = ["Stone-milled flour.", "Water, salt and a living starter.", "A long, slow prove.", "Into the oven.", "Onto the counter, every morning."];
  // What the stage is showing at each step (caption on the image, synced to the lit step line).
  const BAKE_CAPS = [["Flour", "Sifting stone-milled flour"], ["Dough", "Folding the dough by hand"], ["Prove", "Rising, slow and long"],
    ["Oven", "Baking to a deep crust"], ["Counter", "Out of the oven, onto the counter"]];
  // "Out of the oven" on the home page: which loaves it shows (by photo slug). Focaccia replaced the Brown Butter Oat
  // there at the user's request (25 Oct 2026); the full list on the Bakery page is unchanged.
  const OVEN = ["bread-country-brown", "bread-focaccia-olives", "bread-ancient-grain", "bread-wholemeal-rye"];
  // "Open every day": the day runs 8am > 10pm under the scroll. Real TBB photos and real menu items only.
  // (h = place on the default 8am-10pm day; dayAt() moves it into the real opening hours)
  const DAY = [
    { h: 8, when: "Morning", img: "pastry-counter", cap: "The pastry counter", line: "Coffee and the morning's bakes." },
    { h: 10.5, when: "Brunch", img: "turkish-eggs", cap: "Turkish Eggs", line: `Brunch, served until ${H.brunchUntil}.` },
    { h: 14, when: "Afternoon", img: "spanish-latte", cap: "Spanish Latte", line: "A slow coffee in the afternoon." },
    { h: 17.5, when: "Evening", img: "herb-crusted-seabass", cap: "Herb Crusted Seabass", line: "Hearty plates and pasta into the evening." },
    { h: 20, when: "Night", img: "space-service", cap: "Dinner service", line: `Open until ${H.t(H.close)}, every day.` },
  ].map((m) => ({ ...m, h: dayAt(m.h) }));
  const DAY_ARC = "M20,190 Q500,-150 980,190";
  // the scene's clock face, to the quarter hour: "8:00<small>am</small>"
  const clockAt = (h) => {
    const mins = Math.round(h * 4) * 15, hh = Math.floor(mins / 60) % 24, mm = mins % 60;
    return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")}<small>${hh < 12 ? "am" : "pm"}</small>`;
  };
  // Live state in Malaysia time (UTC+8), whatever the visitor's own clock says.
  const dayStatus = () => {
    const d = new Date(), h = (d.getUTCHours() + 8) % 24 + d.getUTCMinutes() / 60;
    const isOpen = ([a, b]) => (h >= a && h < b) || (h + 24 >= a && h + 24 < b);
    const on = ["ttdi", "pub"].filter((k) => isOpen(H.out[k]));
    if (H.same) return on.length ? `Open now, until ${H.t(H.out.ttdi[1])}` : `Closed now, opens at ${H.t(H.out.ttdi[0])}`;
    if (on.length === 2) return "Open now at both outlets";
    if (on.length === 1) return `Open now at ${OUT[on[0]].name}, until ${H.t(H.out[on[0]][1])}`;
    return `Closed now, opens at ${H.t(H.open)}`;
  };

  // Product tile: photo or drawing on a soft card, name, one line of detail.
  const productCard = (media, name, meta, href, tag) => `
    <a class="product reveal" href="${href}">
      <div class="product-media">${media.startsWith("<svg") ? media : `<img src="${media}" alt="${esc(name)}" loading="lazy">`}${tag ? `<span class="badge">${esc(tag)}</span>` : ""}</div>
      <h3>${esc(name)}</h3>
      <p>${esc(meta)}</p>
    </a>`;

  pages.home = () => {
    const favs = [
      ["tbb-big-breakfast", "TBB Big Breakfast", 48],
      ["salmon-avocado-benedict", "Salmon & Avocado Eggs Benedict", 38],
      ["squid-ink-pasta", "Squid Ink Pasta", 55],
      ["double-cheeseburger", "Signature Double Cheeseburger", 45],
      ["prawn-toast", "Prawn Toast", 26],
    ]
      // price from the menu (TTDI); hidden on the menu = hidden here; not found = the price above
      .map(([img, n, p]) => {
        const it = allItems().find((x) => slugOf(x.img) === img) || allItems().find((x) => x.n.replace(/&/g, "and").toLowerCase() === n.replace(/&/g, "and").toLowerCase());
        if (it && it.hidden) return null;
        const q = it && priceFor(it, "ttdi");
        return [img, n, typeof q === "number" ? q : p];
      }).filter(Boolean);
    return `
    <section class="hs" data-hero>
      <div class="hs-pin">
        <div class="hs-plate" aria-hidden="true"><img src="assets/video/flour-mound.jpg" alt="" fetchpriority="high"></div>
        <h1 class="hs-title">Redefining food</h1>
        <div class="hs-loaf"><img src="assets/cutouts/sourdough.png" alt="A Bread Bar sourdough loaf resting on stone-milled flour" width="600" height="360"></div>
        <div class="hs-dust" aria-hidden="true">${DUST}</div>
        <img class="hs-front" src="assets/cutouts/pain-au-chocolat.png" alt="" aria-hidden="true" width="385" height="600">
        <p class="hs-beat">${countWord(D.loaves.length)} sourdough loaves, every one naturally leavened.</p>
        <div class="hs-copy">
          <p class="hs-lede">Sourdough, pastries, all-day plates and specialty coffee, baked fresh every day in TTDI and Publika.</p>
          <div class="cta-row"><a class="btn" href="menu/">View the menu</a><button class="btn btn-ghost" data-chooser="order">Order delivery</button></div>
        </div>
      </div>
    </section>

    <nav class="bigwords" aria-label="Explore">
      <a href="bakery/#loaves">Sourdough</a><a href="menu/#hearty">Brunch</a><a href="menu/#coffee">Coffee</a><a href="shop/">Shop</a>
    </nav>

    <section class="oval-intro quiet">
      <div class="wrap">
        <p class="eyebrow light">${esc(D.tagline)}</p>
        <h2>The Bread Bar</h2>
        <p class="oval-text">Our loaves are naturally leavened and made with stone-milled flours. They anchor everything on the menu, from the brunch plates and focaccia sandwiches to warm slices with truffle or kombu butter.</p>
        <a class="btn btn-pill" href="about/">Read our story</a>
      </div>
    </section>

    <section class="bake" data-bake>
      <div class="wrap bake-pin">
        <div class="bake-text">
          <h2 class="display-xl">From flour to counter</h2>
          <div class="bake-bar" aria-hidden="true">${BAKE_STEPS.map(() => "<b><i></i></b>").join("")}</div>
          <ol class="bake-steps">${BAKE_STEPS.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
          <nav class="bake-links" aria-label="From the bakery">
            <a class="link-arrow" href="bakery/#loaves">Our sourdough</a><a class="link-arrow" href="bakery/#pastry">Pastries</a><a class="link-arrow" href="about/">Our story</a>
          </nav>
        </div>
        <div class="bake-stage" aria-hidden="true">
          <div class="bk bk-flour">${vid("flour-sift", true)}</div>
          <div class="bk bk-dough">${vid("dough-fold", true)}</div>
          <div class="bk bk-glow"></div>
          <div class="bk bk-loaf"><img class="bk-raw" src="assets/cutouts/sourdough.png" alt="" width="600" height="360"><img class="bk-baked" src="assets/cutouts/sourdough.png" alt="" width="600" height="360"></div>
          <div class="bk bk-counter">${vid("bread-stop-motion")}</div>
          <p class="bk-cap"><b></b><span></span></p>
        </div>
      </div>
    </section>

    <section class="loc-duo" aria-label="Our locations">${locCard("ttdi")}${locCard("pub")}</section>

    <section class="section oven">
      <div class="wrap">
        <div class="section-head reveal">
          <h2 class="display-xl">Out of the oven</h2>
          <a class="link-arrow" href="bakery/#loaves">See all ${D.loaves.length} loaves</a>
        </div>
        <div class="product-grid">
          ${OVEN.map((img) => D.loaves.find((l) => slugOf(l.img) === img)).filter(Boolean).map((l) => productCard(photo(l.img), l.n, `RM ${l.p} · ${l.g}g`, "bakery/#loaves")).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head reveal">
          <h2>House favourites</h2>
          <a class="link-arrow" href="menu/">See the full menu</a>
        </div>
        <div class="fav-grid">
          ${favs.map(([img, n, p]) => `
            <figure class="fav reveal" data-lb="${photo(img)}" data-cap="${esc(n)}">
              <img src="${photo(img)}" alt="${esc(n)}" loading="lazy">
              <figcaption><b>${esc(n)}</b><span>RM ${money(p)}</span></figcaption>
            </figure>`).join("")}
        </div>
      </div>
    </section>

    <section class="split on-blue">
      <div class="split-img">${vid("espresso")}</div>
      <div class="split-copy reveal">
        <h2>${esc(D.beans.name)}</h2>
        <p>${esc(D.beans.blurb)}</p>
        <div class="chips">${D.beans.notes.map((n) => `<span class="chip">${esc(n)}</span>`).join("")}</div>
        <div class="price-row">${D.beans.sizes.map(([s, p]) => `<div><b>RM ${esc(p)}</b><span>${esc(s)}</span></div>`).join("")}</div>
        <p style="font:400 13px var(--mono);letter-spacing:.06em;opacity:.75">Blend: ${D.beans.origins.map(esc).join(" · ")}</p>
        <div class="cta-row"><a class="btn" href="menu/#coffee">See the coffee menu</a><button class="btn btn-ghost" data-chooser="order">Order beans online</button></div>
      </div>
    </section>

    <section class="day" data-day aria-label="Opening hours">
      <div class="day-pin">
        <div class="wrap day-wrap">
          <div class="day-sky" aria-hidden="true">
            <svg class="day-arc" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <defs><clipPath id="day-clip"><rect class="day-clip" x="0" y="-20" width="1000" height="240"></rect></clipPath></defs>
              <path class="arc-base" d="${DAY_ARC}"></path>
              <path class="arc-lit" d="${DAY_ARC}" clip-path="url(#day-clip)"></path>
            </svg>
            <span class="day-orb"><i class="sun"></i><i class="moon"></i></span>
            <span class="day-end day-end-l">${esc(H.t(H.open))}</span><span class="day-end day-end-r">${esc(H.t(H.close))}</span>
          </div>
          <div class="day-grid">
            <div class="day-copy">
              <p class="day-clock" aria-hidden="true">${clockAt(H.open)}</p>
              <p class="day-line" aria-hidden="true">${esc(DAY[0].line)}</p>
              <h2>Open every day,<br>${esc(H.span)}.</h2>
              <p class="day-sub">Brunch until ${esc(H.brunchUntil)}, hearty plates, pasta and coffee all day, and a counter of fresh bakes until they run out.</p>
              <p class="day-status" data-day-status><i></i><span>${dayStatus()}</span></p>
              <div class="day-cta"><button class="btn btn-pill day-reserve" data-chooser="reserve">Reserve a table</button></div>
              <p class="cta-note">Book on WhatsApp with the outlet you’re visiting.</p>
            </div>
            <div class="day-photos">
              ${DAY.map((m, i) => `<figure class="day-shot${i ? "" : " on"}"><img src="${photo(m.img)}" alt="${esc(m.cap)}" loading="lazy"><figcaption><b>${esc(m.when)}</b>${esc(m.cap)}</figcaption></figure>`).join("")}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="celebrate">
      <div class="wrap">
        <div class="celebrate-head reveal">
          <p class="eyebrow light">Events at The Bread Bar</p>
          <h2>Celebreadtion</h2>
          <p>Birthdays, team lunches, launches and private dining. Bring the people, we’ll bring the bread.</p>
        </div>
        <div class="tv-row">${tv("pain-au-chocolat-stack")}${tv("dough-fold")}${tv("dough-smooth")}</div>
        <div class="cta-row" style="justify-content:center"><a class="btn btn-pill" href="events/">Plan your event</a></div>
      </div>
    </section>

    <section class="shop-teaser">
      <div class="wrap">
        <div class="section-head reveal">
          <h2 class="display-xl">The T.B.B shop</h2>
          <a class="link-arrow" href="shop/">Shop tees &amp; totes</a>
        </div>
        <div class="product-grid">
          ${D.shop.items.filter((x) => x.feature).map((x) => productCard(x.img ? photo(x.img) : art(x.art, x.n), x.n, x.line, "shop/", x.tag)).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="duo">
          <a class="duo-card wide reveal" href="events/wholesale/">
            <img src="${photo("bread-country-brown")}" alt="" loading="lazy">
            <div><h3>Wholesale breads &amp; pastries</h3><p>Our sourdough and pastries, baked for your café, hotel or office.</p><span class="link-arrow">Ask about wholesale</span></div>
          </a>
        </div>
      </div>
    </section>

    <section class="section tight on-dark" style="text-align:center">
      <div class="wrap reveal">
        <h2 style="font-size:clamp(34px,5vw,60px)">@thebreadbarmy</h2>
        <p style="opacity:.8;margin:16px auto 26px;max-width:520px">Fresh bakes, new drinks and what’s coming out of the oven next.</p>
        <a class="btn" href="${D.instagram}" target="_blank" rel="noopener">Follow on Instagram</a>
      </div>
    </section>`;
  };

  /* ---------------- menu ---------------- */
  const priceFor = (it, outlet) => (it.p && typeof it.p === "object" && !Array.isArray(it.p) ? it.p[outlet] : it.p);
  const allItems = () => D.menu.flatMap((c) => c.sections.flatMap((s) => s.items));
  const visible = (it, outlet) => !it.hidden && (!it.only || it.only === outlet);

  const renderItem = (it, cat, outlet, i) => {
    const p = priceFor(it, outlet);
    const price = Array.isArray(p)
      ? `<div class="price hc"><span>${money(p[0])}</span><span>${money(p[1])}</span></div>`
      : `<div class="price">${money(p)}</div>`;
    const tag = it.only ? `<span class="tag">${it.only === "ttdi" ? "TTDI only" : "Publika only"}</span>` : "";
    const thumb = it.img ? `<img class="thumb${it.vid ? " has-vid" : ""}" src="${photo(it.img)}" alt="" loading="lazy" data-lb="${photo(it.img)}" data-cap="${esc(it.n)}"${it.vid ? ` data-vid="${it.vid}"` : ""}>` : "";
    const extras = it.extras ? `<ul class="extras">${it.extras.map(([a, b]) => `<li><span>${esc(a)}</span><span>${b}</span></li>`).join("")}</ul>` : "";
    const name = it.link ? `<a href="${esc(hrefOf(it.link))}">${esc(it.n)}</a>` : esc(it.n);
    return `
      <div class="item${it.img ? " has-img" : ""}" style="animation-delay:${Math.min(i, 12) * 35}ms">
        ${thumb}
        <h3>${name}${it.v ? '<span class="v" title="vegetarian">V</span>' : ""}${tag}</h3>
        ${price}
        ${it.d ? `<p>${esc(it.d)}</p>` : ""}
        ${extras}
      </div>`;
  };

  const renderCategory = (cat, outlet) => {
    let n = 0;
    const sec = (s) => {
      const items = s.items.filter((it) => visible(it, outlet));
      if (!items.length) return "";
      const hc = cat.hc ? `<span class="hc"><i>HOT</i><i>COLD</i></span>` : s.note ? `<span>${esc(s.note)}</span>` : "";
      const extras = s.extras ? `<ul class="section-extras">${s.extras.map(([a, b]) => `<li><span>${esc(a)}</span><span>${b}</span></li>`).join("")}</ul>` : "";
      return `
        <section class="menu-section">
          <div class="menu-section-head"><h2>${esc(s.title)}</h2>${hc}</div>
          <div class="items${cat.compact ? " compact" : ""}">${items.map((it) => renderItem(it, cat, outlet, n++)).join("")}</div>
          ${extras}
        </section>`;
    };
    const hero = cat.hero ? `<div class="menu-hero" data-lb="${photo(cat.hero)}" data-cap="Kids menu"><img src="${photo(cat.hero)}" alt="Kids menu plates"></div>` : "";
    const body = cat.compact ? `<div class="compact-grid">${cat.sections.map(sec).join("")}</div>` : cat.sections.map(sec).join("");
    return `${hero}${body}<p class="menu-foot">All prices are stated in Ringgit Malaysia (RM).</p>`;
  };

  pages.menu = (params) => {
    const catId = D.menu.some((c) => c.id === params[0]) ? params[0] : "light";
    return `
    <section class="banner">
      <div class="wrap">
        <p class="eyebrow">${esc(D.hours)}<span class="sep"> · </span><br class="br-sm">${esc(D.brunchHours)}</p>
        <h1>Menu</h1>
        <div class="menu-controls" style="margin-top:26px">
          <div class="seg" role="group" aria-label="Choose outlet">
            <span class="seg-pill"></span>
            <button data-outlet="ttdi" aria-pressed="${menuOutlet === "ttdi"}">TTDI</button>
            <button data-outlet="pub" aria-pressed="${menuOutlet === "pub"}">Publika</button>
          </div>
          <p class="menu-sub" id="menu-sub"></p>
        </div>
      </div>
    </section>
    <div class="tabs-bar">
      <div class="tabs" role="tablist">
        ${D.menu.map((c) => `<button role="tab" data-cat="${c.id}" aria-selected="${c.id === catId}">${esc(c.name)}</button>`).join("")}
        <span class="tab-ink"></span>
      </div>
    </div>
    <div class="wrap"><div class="menu-panel" id="menu-panel" role="tabpanel" data-cat="${catId}">${renderCategory(D.menu.find((c) => c.id === catId), menuOutlet)}</div></div>`;
  };

  const moveInk = (bar, active, ink) => {
    if (!active) return;
    ink.style.width = active.offsetWidth + "px";
    ink.style.transform = `translateX(${active.offsetLeft}px)`;
  };

  const initMenu = () => {
    const panel = $("#menu-panel");
    const tabs = $(".tabs");
    const ink = $(".tab-ink");
    const seg = $(".seg");
    const pill = $(".seg-pill");
    const sub = $("#menu-sub");

    const syncSeg = () => {
      const on = $(`[data-outlet="${menuOutlet}"]`, seg);
      $$("[data-outlet]", seg).forEach((b) => b.setAttribute("aria-pressed", b === on));
      pill.style.width = on.offsetWidth + "px";
      pill.style.transform = `translateX(${on.offsetLeft - 4}px)`;
      const o = OUT[menuOutlet];
      sub.innerHTML = `Showing the ${esc(o.name)} menu · <a href="${o.menuPdf}" target="_blank" rel="noopener">PDF menu</a> · Order on ${deliveryLinks(o)}`;
    };
    const syncInk = () => moveInk(tabs, $('[aria-selected="true"]', tabs), ink);

    const swap = (fn) => {
      panel.classList.remove("swap-in");
      panel.classList.add("swap-out");
      setTimeout(() => {
        fn();
        panel.classList.remove("swap-out");
        void panel.offsetWidth;
        panel.classList.add("swap-in");
      }, 200);
    };
    const show = (catId, push) => {
      const cat = D.menu.find((c) => c.id === catId);
      $$("[data-cat]", tabs).forEach((b) => b.setAttribute("aria-selected", b.dataset.cat === catId));
      syncInk();
      $('[aria-selected="true"]', tabs).scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      swap(() => { panel.dataset.cat = catId; panel.innerHTML = renderCategory(cat, menuOutlet); });
      if (push) go(`menu/#${catId}`, true); // a history entry per tab (back returns to the last tab), no re-render
      const top = $(".tabs-bar").getBoundingClientRect().top + scrollY - $("#header").offsetHeight;
      if (scrollY > top) scrollTo({ top, behavior: "smooth" });
    };

    tabs.addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b && b.getAttribute("aria-selected") !== "true") show(b.dataset.cat, true); });
    tabs.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const list = $$("[data-cat]", tabs); const i = list.findIndex((b) => b.getAttribute("aria-selected") === "true");
      const next = list[(i + (e.key === "ArrowRight" ? 1 : -1) + list.length) % list.length]; next.focus(); show(next.dataset.cat, true);
    });
    seg.addEventListener("click", (e) => {
      const b = e.target.closest("[data-outlet]"); if (!b || b.dataset.outlet === menuOutlet) return;
      menuOutlet = store.outlet = b.dataset.outlet; save(); syncSeg();
      swap(() => { panel.innerHTML = renderCategory(D.menu.find((c) => c.id === panel.dataset.cat), menuOutlet); });
    });
    requestAnimationFrame(() => { syncSeg(); syncInk(); });
    addEventListener("resize", () => { if ($("#menu-panel")) { syncSeg(); syncInk(); } });
    document.fonts && document.fonts.ready.then(() => { if ($("#menu-panel")) { syncSeg(); syncInk(); } });
  };

  /* ---------------- bakery ---------------- */
  pages.bakery = () => `
    <section class="banner img-banner vid-banner">
      ${vid("bread-stop-motion")}
      <div class="wrap">
        <p class="eyebrow light">Baked fresh every morning</p>
        <h1>The Bakery</h1>
        <p>Sourdough loaves, laminated pastries and cakes from our counter, to enjoy in, take away, or pre-order for the weekend.</p>
        <nav class="subnav on-dark" style="background:none">
          <a href="bakery/#loaves" style="color:var(--cream);border-color:rgba(255,251,234,.35)">Sourdough</a>
          <a href="bakery/#sourdough101" style="color:var(--cream);border-color:rgba(255,251,234,.35)">Sourdough 101</a>
          <a href="bakery/#pastry" style="color:var(--cream);border-color:rgba(255,251,234,.35)">Pastry</a>
          <a href="bakery/#cakes" style="color:var(--cream);border-color:rgba(255,251,234,.35)">Cakes</a>
          <a href="bakery/#beans" style="color:var(--cream);border-color:rgba(255,251,234,.35)">Coffee beans</a>
        </nav>
      </div>
    </section>

    <section class="section" id="loaves">
      <div class="wrap">
        <div class="section-head reveal">
          <h2>Sourdough loaves</h2>
          <p style="margin:0;color:var(--muted);max-width:380px">Tap “Bread notes” for flour, crust, tang and hydration on each loaf.</p>
        </div>
        <div class="loaf-grid">
          ${D.loaves.map((l, i) => `
          <article class="loaf-card reveal" style="transition-delay:${(i % 4) * 70}ms">
            <div class="ph"><img src="${photo(l.img)}" alt="${esc(l.n)}" loading="lazy" data-lb="${photo(l.img)}" data-cap="${esc(l.n)}" style="cursor:zoom-in"></div>
            <div class="body">
              <h3>${esc(l.n)}</h3>
              <div class="meta"><span>${l.g} grams</span><b>RM ${l.p}</b></div>
              <button class="spec-toggle" aria-expanded="false">Bread notes <i>+</i></button>
              <div class="spec"><dl>
                <div><dt>Flour</dt><dd>${esc(l.flour)}</dd></div>
                ${l.notes ? `<div><dt>Tasting</dt><dd>${esc(l.notes)}</dd></div>` : ""}
                <div><dt>Crust</dt><dd>${esc(l.crust)}</dd></div>
                <div><dt>Tang</dt><dd>${esc(l.tang)}</dd></div>
                <div><dt>Crumb</dt><dd>${esc(l.crumb)}</dd></div>
                <div><dt>Inclusions</dt><dd>${esc(l.inc)}</dd></div>
                <div><dt>Hydration</dt><dd>${l.hyd}%<div class="hyd"><span style="width:${l.hyd}%"></span></div></dd></div>
              </dl></div>
            </div>
          </article>`).join("")}
        </div>
      </div>
    </section>

    <section class="section sd101" id="sourdough101">
      <div class="wrap">
        <div class="section-head reveal">
          <div><p class="eyebrow">Short videos from our bakers</p><h2 class="display-xl">Sourdough 101</h2></div>
          <p style="margin:0;color:var(--muted);max-width:380px">Got a loaf home? Here’s how to cut it, keep it and bring it back to life. Tap to play, with sound.</p>
        </div>
        <div class="sd-grid">
          ${D.sourdough101.map(([v, t], i) => `
          <figure class="sd reveal">
            <video controls playsinline preload="none" poster="assets/video/${v}.jpg"><source src="assets/video/${v}.mp4" type="video/mp4"></video>
            <figcaption><span>Part ${i + 1}</span>${esc(t)}</figcaption>
          </figure>`).join("")}
        </div>
      </div>
    </section>

    <section class="section on-dark" id="pastry">
      <div class="wrap">
        <div class="section-head reveal"><h2>Pastry</h2><p style="margin:0;opacity:.75">Prices in RM · while the counter lasts</p></div>
        <div class="pastry-grid">
          <div class="pastry-reel reveal">${vid("pastry-reel")}<span>At the counter</span></div>
          ${D.pastry.filter((x) => x[2]).map(([n, p, img, clip]) => `
          <figure class="pastry reveal" data-lb="${photo(img)}" data-cap="${esc(n)}"${clip ? ` data-vid="${clip}"` : ""}>
            <div class="pastry-media">${clip ? vid(clip) : `<img src="${photo(img)}" alt="${esc(n)}" loading="lazy">`}</div>
            <figcaption><span>${esc(n)}</span><b>${money(p)}</b></figcaption>
          </figure>`).join("")}
        </div>
        <p class="eyebrow light" style="margin:clamp(32px,4vw,48px) 0 6px">Also at the counter</p>
        <ul class="price-list reveal" style="--line:rgba(255,251,234,.16)">
          ${D.pastry.filter((x) => !x[2]).map(([n, p]) => `<li><span>${esc(n)}</span><span>${money(p)}</span></li>`).join("")}
        </ul>
      </div>
    </section>

    <section class="section" id="cakes">
      <div class="wrap">
        <div class="section-head reveal"><h2>Cakes</h2></div>
        <div class="cake-grid">
          <div class="panel reveal">
            <img class="panel-img" src="${photo("burnt-cheesecake-matcha")}" alt="Burnt cheesecake with matcha cream" loading="lazy" data-lb="${photo("burnt-cheesecake-matcha")}" data-cap="Burnt Cheesecake with Matcha Cream">
            <h3>By the slice</h3>
            <ul>${D.cakeSlices.map(([n, p]) => `<li><span>${esc(n)}</span><span>RM ${p} / slice</span></li>`).join("")}</ul>
          </div>
          <div class="panel reveal">
            <h3>Whole cakes</h3>
            <p class="eyebrow" style="margin-top:-6px">Pre-order required</p>
            <ul>${D.wholeCakes.map((n) => `<li><span>${esc(n)}</span></li>`).join("")}</ul>
            <button class="btn" data-chooser="preorder">Pre-order a cake</button>
          </div>
        </div>
      </div>
    </section>

    <section class="split on-blue" id="beans">
      <div class="split-img"><img src="${photo("house-blend-beans-bag")}" alt="House blend coffee beans" loading="lazy"></div>
      <div class="split-copy reveal">
        <p class="eyebrow">Brew it at home</p>
        <h2>${esc(D.beans.name)}</h2>
        <p>${esc(D.beans.blurb)}</p>
        <div class="chips">${D.beans.notes.map((n) => `<span class="chip">${esc(n)}</span>`).join("")}</div>
        <div class="price-row">${D.beans.sizes.map(([s, p]) => `<div><b>RM ${esc(p)}</b><span>${esc(s)}</span></div>`).join("")}</div>
        <p style="font:400 13px var(--mono);letter-spacing:.06em;opacity:.75">Blend: ${D.beans.origins.map(esc).join(" · ")}</p>
        <div class="cta-row"><button class="btn" data-chooser="order">Order beans online</button></div>
      </div>
    </section>

    <section class="section tight" style="text-align:center">
      <div class="wrap reveal">
        
        <h2 style="font-size:clamp(32px,4.4vw,52px)">Pre-order loaves &amp; pastries</h2>
        <p style="color:var(--muted);max-width:560px;margin:16px auto 26px">Order through our delivery partner for pick-up or delivery, or message the outlet directly for larger orders.</p>
        <div class="cta-row" style="justify-content:center"><button class="btn" data-chooser="order">Order online</button><button class="btn btn-ghost" data-chooser="preorder">Message an outlet</button></div>
      </div>
    </section>`;

  /* ---------------- locations ---------------- */
  pages.locations = (params) => {
    if (!params[0]) {
      return `
      <section class="banner"><div class="wrap"><p class="eyebrow">${esc(D.hours)}</p><h1>Locations</h1><p>Find us in Taman Tun Dr Ismail and at Publika Shopping Gallery, Solaris Dutamas.</p></div></section>
      <section class="section tight" style="padding-top:0"><div class="wrap"><div class="loc-grid">${locCard("ttdi")}${locCard("pub")}</div></div></section>`;
    }
    const key = outletKey(params[0]);
    const o = OUT[key];
    const other = key === "ttdi" ? "pub" : "ttdi";
    return `
    <section class="banner img-banner">
      <img src="${o.photo}" alt="">
      <div class="wrap">
        <p class="eyebrow light">${esc(o.since)}</p>
        <h1>${esc(o.full)}</h1>
        <p>${o.address.map(esc).join(", ")}</p>
      </div>
    </section>
    <section class="section">
      <div class="wrap loc-detail">
        <div class="reveal">
          <dl class="info-list">
            <div><dt>Hours</dt><dd>${esc(H.outlet(key))}<br><span style="color:var(--muted)">${esc(D.brunchHours)}</span></dd></div>
            <div><dt>Address</dt><dd>${addr(o)}<br><a href="${o.maps}" target="_blank" rel="noopener">Open in Google Maps</a></dd></div>
            <div><dt>Phone</dt><dd><a href="tel:${o.tel}">${esc(o.phone)}</a></dd></div>
            <div><dt>Reservations</dt><dd>Reservations &amp; enquiries by <a href="${resWa(o)}" target="_blank" rel="noopener">WhatsApp</a></dd></div>
            <div><dt>Delivery</dt><dd>Delivery &amp; pre-orders via ${deliveryLinks(o)}</dd></div>
            <div><dt>Menu</dt><dd><a href="menu/" data-set-outlet="${key}">View the ${esc(o.name)} menu</a></dd></div>
          </dl>
          <div class="cta-row" style="margin-top:28px">
            <a class="btn" href="${resWa(o)}" target="_blank" rel="noopener">Reserve on WhatsApp</a>
            <a class="btn btn-ghost" href="${o.order}" target="_blank" rel="noopener">Order on Beep</a>
            ${o.grab ? `<a class="btn btn-ghost" href="${o.grab}" target="_blank" rel="noopener">Order on GrabFood</a>` : ""}
          </div>
        </div>
        <div class="reveal">
          <a class="map-card map-texture" href="${o.maps}" target="_blank" rel="noopener">
            <span><b>${esc(o.full)}</b><small>${o.address.map(esc).join(", ")}</small><em class="link-arrow">Open in Google Maps</em></span>
          </a>
        </div>
      </div>
    </section>
    <section class="section tight on-dark">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap">
        <div><p class="eyebrow">Also visit</p><h2 style="font-size:clamp(32px,4vw,48px)">${esc(OUT[other].full)}</h2><p style="opacity:.75;margin:10px 0 0">${OUT[other].address.map(esc).join(", ")}</p></div>
        <a class="btn" href="locations/${outletSlug(other)}/">View location</a>
      </div>
    </section>`;
  };

  /* ---------------- about ---------------- */
  pages.about = () => `
    <section class="banner img-banner">
      <img src="${photo("sourdough-slices")}" alt="">
      <div class="wrap"><p class="eyebrow light">Our story</p><h1>Redefining food</h1><p>A neighbourhood sourdough bakery that grew into an all-day café.</p></div>
    </section>
    <section class="section">
      <div class="prose reveal">
        <p>The Bread Bar began in Taman Tun Dr Ismail with a simple idea: bake honest sourdough every day, and build a kitchen around it. The loaves still come first (long-fermented, made with stone-milled flours), and the rest of the menu grows out of them: toasted slices with truffle or kombu butter, focaccia sandwiches, brunch plates piled onto sourdough, and a counter full of laminated pastries.</p>
        <p>After nearly four years in TTDI, a second home opened at Publika Shopping Gallery in August 2025. ${esc(H.about)}, serving brunch until ${esc(H.brunchUntil)} and hearty plates, pasta and specialty coffee all day.</p>
      </div>
    </section>
    <section class="moods">
      <div class="wrap">
        <p class="moods-tag reveal">Raw. <em>Earthy.</em> Progressive.</p>
        <div class="mood-grid">
          <div class="mood reveal">${vid("starter", true)}<span>Texture &amp; grains</span></div>
          <div class="mood reveal">${vid("flour-sift", true)}<span>Art &amp; grounded</span></div>
          <div class="mood reveal">${vid("dough-fold", true)}<span>Curated &amp; dynamic</span></div>
        </div>
      </div>
    </section>

    <section class="section tight" style="padding-top:0">
      <div class="wrap photo-row reveal">
        <img src="${photo("bakers-shaping")}" alt="Shaping sourdough by hand" data-lb="${photo("bakers-shaping")}" data-cap="Shaped by hand, every morning" loading="lazy">
        <img src="${photo("baker-loaves")}" alt="A baker with fresh loaves" data-lb="${photo("baker-loaves")}" data-cap="Fresh out of the oven" loading="lazy">
        <img src="${photo("bakers-oven")}" alt="Loading the oven" data-lb="${photo("bakers-oven")}" data-cap="Into the oven" loading="lazy">
      </div>
    </section>
    <section class="section on-blue">
      <div class="wrap">
        <div class="section-head reveal"><h2>Made the slow way</h2></div>
        <div class="pillars">
          <div class="pillar reveal"><h3>Real sourdough</h3><p>${countWord(D.loaves.length)} signature loaves, naturally leavened, from a 400g country brown to a 90%-hydration focaccia.</p></div>
          <div class="pillar reveal"><h3>House-made</h3><p>Brioche buns, English muffins, focaccia, pickles, pestos and sauces, all made in our kitchen.</p></div>
          <div class="pillar reveal"><h3>Our own blend</h3><p>A house espresso blend of Brazilian, Nicaraguan and Ethiopian beans with notes of nuts, butterscotch and caramel.</p></div>
        </div>
      </div>
    </section>
    <section class="section tight space">
      <div class="wrap">
        <div class="section-head reveal"><h2>Our space</h2></div>
        <div class="space-row">
          ${[["space-sign", "The Bread Bar"], ["space-dining", "The dining room"], ["space-service", "Dinner service"]].map(([img, cap]) => `
          <figure class="reveal" data-lb="${photo(img)}" data-cap="${cap}"><img src="${photo(img)}" alt="${cap}" loading="lazy"><figcaption>${cap}</figcaption></figure>`).join("")}
        </div>
      </div>
    </section>
    <section class="section"><div class="wrap"><div class="loc-grid">${locCard("ttdi")}${locCard("pub")}</div></div></section>`;

  /* ---------------- events & wholesale ---------------- */
  pages.events = (params) => `
    <section class="banner img-banner">
      <img src="${photo(params[0] === "wholesale" ? "bakers-oven" : "events-cheers")}" alt="">
      <div class="wrap"><p class="eyebrow light">Work with us</p><h1>${params[0] === "wholesale" ? "Wholesale" : "Events"}</h1>
        <p>Private gatherings at our outlets, and our breads and pastries for your business.</p>
        <nav class="subnav"><a href="events/" style="color:var(--cream);border-color:rgba(255,251,234,.35)">Events</a><a href="events/wholesale/" style="color:var(--cream);border-color:rgba(255,251,234,.35)">Wholesale</a></nav>
      </div>
    </section>
    <section class="split" id="ev">
      <div class="split-img"><img src="${photo("events-feast")}" alt="A long table of shared plates" loading="lazy"></div>
      <div class="split-copy reveal">
        <p class="eyebrow">Events &amp; private dining</p>
        <h2>Celebrate with us</h2>
        <p>Birthdays, baby showers, team brunches or a long table for friends? Tell us your date, outlet and headcount, and our team will get back to you with options.</p>
        <div class="cta-row"><a class="btn" href="${D.events.whatsapp}${D.events.waPrompt ? "?text=" + encodeURIComponent(D.events.waPrompt) : ""}" target="_blank" rel="noopener">Enquire on WhatsApp</a><a class="btn btn-ghost" href="tel:+60176375626">${esc(D.events.phone)}</a></div>
      </div>
    </section>
    <section class="split reverse on-dark" id="wholesale">
      <div class="split-img"><img src="${photo("bread-wholemeal-rye")}" alt="" loading="lazy"></div>
      <div class="split-copy reveal">
        <p class="eyebrow">Wholesale breads &amp; pastries</p>
        <h2>Our bakes, on your counter</h2>
        <p>Supplying cafés, restaurants, hotels and offices with sourdough loaves, focaccia and laminated pastries baked fresh each day.</p>
        <div class="cta-row"><a class="btn" href="${D.events.whatsapp}" target="_blank" rel="noopener">Ask about wholesale</a></div>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="section-head reveal"><h2>Getting in touch</h2></div>
        <ol class="steps reveal">
          <li><h4>Message us</h4><p>WhatsApp ${esc(D.events.phone)} with what you have in mind.</p></li>
          <li><h4>Tell us the details</h4><p>Date, outlet or delivery address, number of guests or quantities needed.</p></li>
          <li><h4>We’ll plan it together</h4><p>Our team comes back with menu options and pricing.</p></li>
        </ol>
      </div>
    </section>`;

  /* ---------------- shop (merch T.B.B sells today) ---------------- */
  pages.shop = () => {
    const S = D.shop;
    const card = (x) => `
      <article class="product shop-item reveal">
        <div class="product-media${x.img ? " photo" : ""}">${shopMedia(x)}${x.tag ? `<span class="badge">${esc(x.tag)}</span>` : ""}</div>
        <h3>${esc(x.n)}</h3>
        <p>${esc(x.line)}</p>
        ${x.available
          ? `<button class="btn btn-pill" data-chooser="order">Order now</button>`
          : x.now
            ? `<button class="btn btn-pill" data-chooser="merchnow" data-item="${esc(x.n)}">Ask on WhatsApp</button>`
            : ""}
      </article>`;
    return `
    <section class="banner img-banner shop-banner">
      <img src="${photo("tote-carried")}" alt="">
      <div class="wrap">
        <p class="eyebrow light">Tees · totes · tumblers · collabs</p>
        <h1>The T.B.B Shop</h1>
        <p>Things we love to wear, carry and give. Available now at our outlets.</p>
      </div>
    </section>
    ${S.collections.length > 1 ? `<nav class="bigwords" aria-label="Shop collections">
      ${S.collections.map(([id, name]) => `<a href="shop/#${id}">${esc(name)}</a>`).join("")}
    </nav>` : ""}
    ${S.collections.map(([id, name, blurb], i) => `
    <section class="section tight shop-col${i % 2 ? " alt" : ""}" id="${id}">
      <div class="wrap">
        <div class="section-head reveal"><div><h2 class="display-xl">${esc(name)}</h2><p class="col-blurb">${esc(blurb)}</p></div></div>
        <div class="product-grid">${S.items.filter((x) => x.c === id).map(card).join("")}</div>
      </div>
    </section>`).join("")}`;
  };

  pages.notfound = () => `<section class="banner"><div class="wrap"><h1>Page not found</h1><p><a class="link-arrow" href="./">Back to home</a></p></div></section>`;

  /* ------------------------------------------------------------------ footer */
  const TICKER = ["Dine in", "Takeaway", hasGrab ? "Delivery via Beep & GrabFood" : "Delivery via Beep","Pre-orders", "Whole cakes", "Events", "Wholesale", ...H.ticker];
  const tickerRun = TICKER.map((t) => `<span>${esc(t)}</span>`).join("");
  $("#footer").innerHTML = `
    <div class="ticker" aria-label="${esc(TICKER.join(", "))}"><div class="ticker-track" aria-hidden="true">${tickerRun}${tickerRun}</div></div>
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <img src="assets/logo-light.png" alt="The Bread Bar" class="foot-logo" width="276" height="195" loading="lazy">
          <p class="foot-tag">${esc(D.tagline)}</p>
          <p>${esc(D.hours)}.<br>Handcrafted sourdough, pastries, all-day plates and specialty coffee.</p>
        </div>
        ${["ttdi", "pub"].map((k) => `
        <div>
          <h4>${esc(OUT[k].name)}</h4>
          <p>${addr(OUT[k])}</p>
          <a href="tel:${OUT[k].tel}">${esc(OUT[k].phone)}</a>
          <a href="${OUT[k].maps}" target="_blank" rel="noopener">Directions</a>
        </div>`).join("")}
        <div>
          <h4>Explore</h4>
          <a href="menu/">Menu</a><a href="bakery/">Bakery</a><a href="shop/">Shop</a><a href="about/">Our Story</a>
          <a href="events/">Events</a><a href="events/wholesale/">Wholesale</a>
          <a href="${D.instagram}" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
      <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${esc(D.company)}</span><span>Prices in RM · subject to change</span></div>
    </div>
    <div class="foot-wordmark" aria-hidden="true"><span>The Bread Bar</span></div>`;

  /* ------------------------------------------------------------------ router with page transitions */
  // Pages have real URLs (since 25 Oct 2026, so search engines index each one): menu/, menu/#hearty (a tab),
  // bakery/#pastry (a section), locations/ttdi/, events/wholesale/ ... under the site's base (see SITE above).
  // Without a <base> (claude.ai artifact, file://) the old #tokens are used instead (#menu-hearty, #locations-ttdi).
  let first = true;
  let lastKey = null;
  // where we are: { path: "menu/" ("" = home), anchor: "hearty" }
  const current = () => {
    if (!pathMode) return SEO.fromToken(location.hash) || { path: location.hash.replace(/^#\/?/, ""), anchor: "" };
    let p = decodeURIComponent(location.pathname);
    p = p.startsWith(BASE) ? p.slice(BASE.length) : p.replace(/^\/+/, "");
    p = p.replace(/(^|\/)index\.html$/, "$1");
    if (p && !p.endsWith("/")) p += "/";
    return { path: p, anchor: decodeURIComponent(location.hash.slice(1)) };
  };
  const keyOf = (c) => `${c.path}#${c.anchor}`;
  // page name + params as the page builders take them (menu: [tab]; locations: [ttdi|publika]; events: [wholesale])
  const parse = () => {
    const c = current(), known = SEO.route(c.path), parts = c.path.split("/").filter(Boolean);
    if (!known) return { name: "notfound", params: [], anchor: "", path: null };
    const name = parts[0] || "home";
    return { name, params: name === "menu" ? [c.anchor] : parts.slice(1), anchor: c.anchor, path: c.path };
  };
  const anchorFor = (r) => (r.name === "events" ? r.params[0] : ["bakery", "shop"].includes(r.name) ? r.anchor : null) || null;
  // old #token links shared before the real URLs (thebreadbar.my/#menu-hearty) land on their page (/menu/#hearty)
  if (pathMode && !current().path && location.hash) {
    const r = SEO.fromToken(location.hash);
    if (r) history.replaceState(null, "", new URL(r.path + location.search + (r.anchor ? "#" + r.anchor : ""), SITE).href);
  }

  // head tags for the page (title, description, canonical, Open Graph, JSON-LD), from the live content values. The
  // published <route>/index.html files carry the same tags baked in at publish time (build-pages.mjs, same seo.js).
  const setHead = (m) => {
    const head = document.head;
    // the tag <name key="k">, made if missing; value null removes it
    const put = (name, key, k, attr, v) => {
      let el = head.querySelector(`${name}[${key}="${k}"]`);
      if (v == null) { if (el) el.remove(); return; }
      if (!el) { el = document.createElement(name); el.setAttribute(key, k); head.appendChild(el); }
      el.setAttribute(attr, v);
    };
    document.title = m.title;
    put("meta", "name", "description", "content", m.desc);
    put("link", "rel", "canonical", "href", m.url);
    for (const [k, v] of [["og:title", m.title], ["og:description", m.desc], ["og:url", m.url], ["og:image", m.image]]) put("meta", "property", k, "content", v);
    for (const [k, v] of [["twitter:title", m.title], ["twitter:description", m.desc], ["twitter:image", m.image]]) put("meta", "name", k, "content", v);
    let ld = document.getElementById("ld");
    if (!m.ld) { if (ld) ld.remove(); return; }
    if (!ld) { ld = document.createElement("script"); ld.type = "application/ld+json"; ld.id = "ld"; head.appendChild(ld); }
    ld.textContent = SEO.ldText(m.ld);
  };

  const render = () => {
    const r = parse();
    const fn = pages[r.name] || pages.notfound;
    app.innerHTML = fn(r.params);
    $$(".nav-link[data-route]").forEach((a) => a.classList.toggle("active", a.dataset.route === r.name));
    setHead(SEO.meta(r.path, D, H, SITE));
    if (r.name === "menu") initMenu();
    // Clips inserted via innerHTML: force muted so autoplay is allowed; still posters only for reduced motion.
    $$("video.bgvid", app).forEach((v) => { v.muted = true; v.removeAttribute("autoplay"); });
    setTimeout(() => { syncScenes(); syncVideos(); }, 150); // after the scroll position below is settled
    // Photo tiles that open the lightbox are plain figures/images: make them keyboard-reachable too.
    $$("[data-lb]:not(a):not(button)", app).forEach((el) => {
      el.tabIndex = 0; el.setAttribute("role", "button");
      if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", `View ${el.dataset.cap || "photo"} larger`);
    });
    observeReveals();
    const anchor = anchorFor(r);
    const target = anchor && document.getElementById(anchor);
    if (target) setTimeout(() => scrollTo({ top: target.getBoundingClientRect().top + scrollY - $("#header").offsetHeight + 1, behavior: first ? "instant" : "smooth" }), first ? 0 : 60);
    else scrollTo({ top: 0, behavior: "instant" }); // "auto" would inherit html{scroll-behavior:smooth}
  };

  const navigate = () => {
    // back/forward between entries that differ only by #anchor fires both popstate and hashchange: render once
    const k = keyOf(current());
    if (k === lastKey) return;
    lastKey = k;
    closeAll();
    if (first) { render(); app.classList.add("entering"); first = false; return; }
    app.classList.remove("entering");
    app.classList.add("leaving");
    setTimeout(() => {
      render();
      app.classList.remove("leaving");
      void app.offsetWidth;
      app.classList.add("entering");
      app.focus({ preventScroll: true });
    }, 220);
  };
  addEventListener("popstate", navigate);
  addEventListener("hashchange", navigate);
  // go("menu/#hearty"): href relative to the site's base. silent = only record the new URL (the menu's tab switch).
  function go(href, silent) {
    if (!pathMode) {
      const i = href.indexOf("#"), tok = "#" + SEO.toToken((i < 0 ? href : href.slice(0, i)).replace(/^\.\//, ""), i < 0 ? "" : href.slice(i + 1));
      if (tok === location.hash) return;
      if (silent) lastKey = keyOf(SEO.fromToken(tok));
      location.hash = tok; // hashchange renders it
      return;
    }
    const u = new URL(href, SITE);
    if (u.href === location.href) return;
    history.pushState(null, "", u.href);
    if (silent) lastKey = keyOf(current()); else navigate();
  }
  // internal links (plain <a href="menu/">) move without a page load; new-tab clicks and other sites are left alone
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target || a.hasAttribute("download")) return;
    const href = a.getAttribute("href");
    if (/^([a-z][\w+.-]*:|\/\/|#)/i.test(href)) return;
    if (pathMode) { const u = new URL(href, SITE); if (u.origin !== location.origin || !u.pathname.startsWith(BASE)) return; }
    e.preventDefault();
    go(href);
  });

  /* ------------------------------------------------------------------ scroll reveal + header state */
  // Plain rect check on scroll (IntersectionObserver can stall in throttled/background tabs)
  let pending = [];
  const checkReveals = () => {
    if (!pending.length) return;
    const limit = innerHeight * 0.94;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top < limit) { el.classList.add("in"); return false; }
      return true;
    });
  };
  const observeReveals = () => { pending = $$(".reveal"); requestAnimationFrame(checkReveals); setTimeout(checkReveals, 300); };
  // Background clips only play while on screen (saves battery/data); never for reduced motion.
  const stillMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let vidTick = 0;
  function syncVideos() {
    vidTick = 0;
    $$("video.bgvid").forEach((v) => {
      const r = v.getBoundingClientRect();
      const show = !stillMotion.matches && r.bottom > -100 && r.top < innerHeight + 100 && r.width > 0;
      if (show && v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else if (!show && !v.paused) v.pause();
    });
  }
  const queueVideos = () => { if (!vidTick) vidTick = setTimeout(syncVideos, 120); };

  // Two pinned scenes on the home page, both driven by scroll (scroll-craft pass, 24 Oct 2026):
  //  - the hero: separate planes (flour plate, headline, loaf cut-out, flour dust, pastry stack) moving at different
  //    rates; the loaf and the plate scale around the same contact point so the loaf stays on its flour.
  //  - "From flour to counter" (the peak): flour clip, dough clip, then the loaf proves, bakes (pale dough browns into
  //    crust) and lands on the counter clip, with the step list following.
  // Reduced motion: no pinning, the static composition (and the finished loaf) only.
  const motionOK = matchMedia("(prefers-reduced-motion: no-preference)");
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const ramp = (a, b, p) => clamp01((p - a) / (b - a));
  const PIN_TOP = 62; // height of the scrolled (compact) sticky header
  const progress = (sec, pin) => {
    const r = sec.getBoundingClientRect();
    return clamp01((PIN_TOP - r.top) / Math.max(1, r.height - pin.offsetHeight));
  };
  const put = (el, tf, op) => { if (!el) return; el.style.transform = tf; if (op != null) el.style.opacity = op.toFixed(3); };
  // "Open every day" (a secondary moment, shorter pin than the bake): the clock runs 8am > 10pm, the sun climbs its arc
  // and sets into a moon, the ground goes cream > afternoon sand > cocoa > night, and the photo follows the time of day.
  const DAY_GROUND = [[8, [255, 250, 241]], [12, [247, 238, 222]], [16, [238, 214, 180]], [18, [176, 112, 72]], [19.5, [74, 58, 43]], [22, [27, 22, 18]]].map(([h, c]) => [dayAt(h), c]);
  const groundAt = (h) => {
    let i = 0; while (i < DAY_GROUND.length - 2 && DAY_GROUND[i + 1][0] <= h) i++;
    const [h0, a] = DAY_GROUND[i], [h1, b] = DAY_GROUND[i + 1], t = clamp01((h - h0) / (h1 - h0));
    return a.map((v, k) => Math.round(v + (b[k] - v) * t));
  };
  const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  function syncDay(live) {
    const day = $("[data-day]");
    if (!day) return;
    const st = $("[data-day-status] span", day), s = dayStatus();
    if (st.textContent !== s) st.textContent = s;
    day.classList.toggle("day-open", s.startsWith("Open"));
    day.classList.toggle("live", live);
    const shots = $$(".day-shot", day);
    if (!live) { day.style.removeProperty("--ground"); day.classList.remove("is-night"); shots.forEach((f) => f.classList.add("on")); return; }
    const p = progress(day, $(".day-pin", day)), h = H.open + (H.close - H.open) * p;
    const g = groundAt(h);
    day.style.setProperty("--ground", `rgb(${g.join(",")})`);
    day.classList.toggle("is-night", lum(g) < 0.42);
    // sun on the quadratic arc (viewBox 1000x200): x is linear in t, so a clip rect up to the sun draws the arc behind it
    const x = 20 + 960 * p, y = (1 - p) * (1 - p) * 190 + 2 * (1 - p) * p * -150 + p * p * 190;
    const orb = $(".day-orb", day);
    orb.style.left = `${(x / 10).toFixed(2)}%`; orb.style.top = `${(y / 2).toFixed(2)}%`;
    $(".day-clip", day).setAttribute("width", x.toFixed(1));
    day.style.setProperty("--moon", ramp(dayAt(18.6), dayAt(19.4), h).toFixed(3));
    const clock = clockAt(h);
    const c = $(".day-clock", day); if (c.innerHTML !== clock) c.innerHTML = clock;
    let at = 0; DAY.forEach((m, i) => { if (h >= m.h) at = i; });
    shots.forEach((f, i) => f.classList.toggle("on", i === at));
    const line = $(".day-line", day); if (line.textContent !== DAY[at].line) line.textContent = DAY[at].line;
    day.dataset.p = p.toFixed(2);
  }
  function syncScenes() {
    const live = motionOK.matches;
    syncDay(live);
    const hero = $("[data-hero]");
    if (hero) {
      hero.classList.toggle("live", live);
      const pin = $(".hs-pin", hero);
      if (live) {
        const p = progress(hero, pin), H = pin.offsetHeight;
        put($(".hs-plate", hero), `translate3d(0,${(-p * 0.05 * H).toFixed(1)}px,0) scale(${(1.04 + 0.1 * p).toFixed(4)})`);
        // the loaf only grows once the headline has faded, so it never climbs into the wording
        const g = ramp(0.45, 1, p);
        put($(".hs-loaf", hero), `translate3d(-50%,${(-g * 0.05 * H).toFixed(1)}px,0) scale(${(1 + 0.32 * g).toFixed(4)})`);
        put($(".hs-title", hero), `translate3d(0,${(-p * 0.03 * H).toFixed(1)}px,0) scale(${(1 - 0.06 * p).toFixed(4)})`, 1 - ramp(0.3, 0.55, p));
        const b = ramp(0.55, 0.78, p);
        put($(".hs-beat", hero), `translate3d(0,${((1 - b) * 18).toFixed(1)}px,0)`, b);
        put($(".hs-front", hero), `translate3d(0,${(-p * 0.62 * H).toFixed(1)}px,0) rotate(${(-8 * p).toFixed(2)}deg)`);
        put($(".hs-dust", hero), `translate3d(0,${(-p * 0.34 * H).toFixed(1)}px,0)`);
        hero.dataset.p = p.toFixed(2);
      } else $$(".hs-pin > *", hero).forEach((el) => { el.style.transform = ""; el.style.opacity = ""; });
    }
    const bake = $("[data-bake]");
    if (bake) {
      bake.classList.toggle("live", live);
      const pin = $(".bake-pin", bake);
      const steps = $$(".bake-steps li", bake);
      if (!live) {
        $$(".bk, .bk-raw, .bk-baked", bake).forEach((el) => { el.style.transform = ""; el.style.opacity = ""; });
        steps.forEach((li) => li.classList.remove("on", "done"));
        return;
      }
      const p = progress(bake, pin);
      const at = Math.min(4, Math.floor(p / 0.2));
      put($(".bk-flour", bake), "none", 1 - ramp(0.17, 0.25, p));
      put($(".bk-dough", bake), "none", ramp(0.15, 0.23, p) * (1 - ramp(0.38, 0.46, p)));
      const prove = ramp(0.42, 0.6, p), baked = ramp(0.6, 0.76, p);
      const sx = 0.8 + 0.12 * prove + 0.08 * baked, sy = 0.58 + 0.32 * prove + 0.1 * baked;
      put($(".bk-loaf", bake), `translate3d(-50%,0,0) scale(${sx.toFixed(4)},${sy.toFixed(4)})`, ramp(0.38, 0.46, p) * (1 - ramp(0.84, 0.92, p)));
      put($(".bk-baked", bake), "none", baked);
      put($(".bk-glow", bake), `scale(${(0.7 + 0.4 * ramp(0.56, 0.74, p)).toFixed(3)})`, ramp(0.56, 0.68, p) * (1 - ramp(0.8, 0.9, p)));
      put($(".bk-counter", bake), "none", ramp(0.82, 0.9, p));
      // segmented bar: one segment per step, each fills while its step is on screen
      $$(".bake-bar i", bake).forEach((el, i) => { el.style.transform = `scaleX(${ramp(i * 0.2, i * 0.2 + 0.2, p).toFixed(3)})`; });
      steps.forEach((li, i) => { li.classList.toggle("on", i === at); li.classList.toggle("done", i < at); });
      const cap = $(".bk-cap", bake);
      if (cap.dataset.at !== String(at)) {
        cap.dataset.at = at;
        $("b", cap).textContent = BAKE_CAPS[at][0]; $("span", cap).textContent = BAKE_CAPS[at][1];
        cap.classList.remove("swap"); void cap.offsetWidth; cap.classList.add("swap");
      }
      bake.dataset.p = p.toFixed(2);
    }
  }
  addEventListener("resize", queueVideos);
  const header = $("#header");
  const onScroll = () => { header.classList.toggle("scrolled", scrollY > 10); checkReveals(); queueVideos(); syncScenes(); };
  addEventListener("resize", syncScenes);
  motionOK.addEventListener && motionOK.addEventListener("change", syncScenes);
  addEventListener("resize", checkReveals);
  addEventListener("scroll", onScroll, { passive: true });

  /* ------------------------------------------------------------------ announcement bar */
  // hours text from H; an owner notice (content/hours.json) goes first and brings a dismissed bar back once
  const annHours = $("[data-hours=short]"); if (annHours) annHours.textContent = H.short;
  $$("[data-hours=drawer]").forEach((el) => { el.textContent = H.drawer; });
  if (H.notice && annHours) {
    const n = document.createElement("span"); n.className = "announce-notice"; n.textContent = H.notice;
    const dot = document.createElement("span"); dot.className = "dot"; dot.textContent = "·";
    annHours.before(n, " ", dot, " ");
    // phones: just the notice and the pre-order link
    const kids = [...annHours.parentNode.children], link = kids.find((el) => el.tagName === "A");
    kids.forEach((el) => { if (el !== n && el !== link && el !== link.previousElementSibling) el.classList.add("hide-sm"); });
  }
  const annKey = H.notice || true;
  if (store.hideAnnounce === annKey) $("#announce").classList.add("gone");
  $("[data-dismiss]").addEventListener("click", () => { $("#announce").classList.add("gone"); store.hideAnnounce = annKey; save(); });

  /* ------------------------------------------------------------------ dropdowns (hover on desktop, click/keyboard too) */
  $$(".dd").forEach((dd) => {
    const btn = $(".dd-btn", dd);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !dd.classList.contains("open");
      $$(".dd.open").forEach((d) => { d.classList.remove("open"); $(".dd-btn", d).setAttribute("aria-expanded", "false"); });
      dd.classList.toggle("open", open); btn.setAttribute("aria-expanded", open);
    });
    dd.addEventListener("mouseleave", () => { dd.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".dd")) $$(".dd.open").forEach((d) => d.classList.remove("open")); });

  /* ------------------------------------------------------------------ drawer */
  const drawer = $("#drawer");
  const burger = $("[data-drawer-open]");
  const setDrawer = (open) => {
    drawer.classList.toggle("open", open); drawer.setAttribute("aria-hidden", !open);
    burger.setAttribute("aria-expanded", open); document.body.classList.toggle("locked", open);
  };
  burger.addEventListener("click", () => setDrawer(true));
  $$("[data-drawer-close]").forEach((el) => el.addEventListener("click", () => setDrawer(false)));
  drawer.addEventListener("click", (e) => { if (e.target.closest("a:not([target])")) setDrawer(false); });

  /* ------------------------------------------------------------------ outlet chooser modal */
  const chooser = $("#chooser");
  const CHOICES = {
    order: { eyebrow: "Delivery & pre-orders", title: "Order from which outlet?", go: "Order on Beep", url: (o) => o.order,
      note: hasGrab ? "Order for delivery or pick-up on Beep or GrabFood." : "Delivery and pick-up are handled by our ordering partner, Beep." },
    reserve: { eyebrow: "Reservations & enquiries", title: "Reserve at which outlet?", go: "WhatsApp to reserve", url: (o) => resWa(o), note: "Reservations are taken over WhatsApp; our team will confirm your booking." },
    preorder: { eyebrow: "Whole cakes & large orders", title: "Pre-order from which outlet?", go: "Message on WhatsApp", url: (o) => o.whatsapp, note: "Whole cakes need to be pre-ordered. Let us know the cake, date and pick-up time." },
    merchnow: { eyebrow: "T.B.B shop", title: "Ask at which outlet?", go: "Message on WhatsApp", url: (o) => o.whatsapp, note: "Message the outlet to check sizes, colours and what’s in stock today." },
  };
  const openChooser = (kind, item) => {
    const c = CHOICES[kind];
    $("#chooser-eyebrow").textContent = item || c.eyebrow;
    $("#chooser-title").textContent = c.title;
    $("#chooser-grid").innerHTML = ["ttdi", "pub"].map((k) => {
      const o = OUT[k];
      if (kind === "order" && o.grab) {
        // Two delivery partners: one card, a link per platform.
        return `<div class="choice">
        <img src="${o.photo}" alt="">
        <div><b>${esc(o.name)}</b><small>${esc(o.address[0])}${k === "pub" ? ", Publika" : ", TTDI"}</small>
          <span class="go-row"><a class="go" href="${o.order}" target="_blank" rel="noopener">Beep →</a><a class="go" href="${o.grab}" target="_blank" rel="noopener">GrabFood →</a></span></div>
      </div>`;
      }
      return `<a class="choice" href="${c.url(o)}" target="_blank" rel="noopener">
        <img src="${o.photo}" alt="">
        <div><b>${esc(o.name)}</b><small>${esc(o.address[0])}${k === "pub" ? ", Publika" : ", TTDI"}</small><span class="go">${c.go} →</span></div>
      </a>`;
    }).join("") + `<p class="chooser-note">${esc(c.note)}</p>`;
    setDrawer(false);
    chooser.classList.add("open"); chooser.setAttribute("aria-hidden", "false"); document.body.classList.add("locked");
    setTimeout(() => $(".modal-x", chooser).focus(), 50);
  };
  const closeChooser = () => { chooser.classList.remove("open"); chooser.setAttribute("aria-hidden", "true"); if (!drawer.classList.contains("open")) document.body.classList.remove("locked"); };
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-chooser]"); if (b) { e.preventDefault(); openChooser(b.dataset.chooser, b.dataset.item); } });
  $$("[data-modal-close]").forEach((el) => el.addEventListener("click", closeChooser));
  chooser.addEventListener("click", (e) => { if (e.target.closest(".choice")) setTimeout(closeChooser, 150); });

  /* ------------------------------------------------------------------ lightbox */
  const lb = $("#lightbox");
  // Lightbox shows the photo, or the item's clip (muted loop) when it has one.
  const lbVid = document.createElement("video");
  Object.assign(lbVid, { muted: true, loop: true, playsInline: true, autoplay: true });
  lbVid.className = "lb-vid";
  $("figure", lb).insertBefore(lbVid, $("figcaption", lb));
  const openLb = (src, cap, clip) => {
    const img = $("img", lb);
    img.hidden = !!clip; lbVid.hidden = !clip;
    if (clip) { lbVid.poster = src; lbVid.src = `assets/video/${clip}.mp4`; const p = lbVid.play(); if (p && p.catch) p.catch(() => {}); }
    else { img.src = src; img.alt = cap || ""; }
    $("figcaption", lb).textContent = cap || "";
    lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.classList.add("locked");
  };
  const closeLb = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.classList.remove("locked"); lbVid.pause(); };
  document.addEventListener("click", (e) => { const t = e.target.closest("[data-lb]"); if (t) openLb(t.dataset.lb, t.dataset.cap, t.dataset.vid); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const t = e.target.closest && e.target.closest('[data-lb][role="button"]');
    if (t) { e.preventDefault(); openLb(t.dataset.lb, t.dataset.cap, t.dataset.vid); }
  });
  $$("[data-lb-close]").forEach((el) => el.addEventListener("click", closeLb));

  /* ------------------------------------------------------------------ misc delegated handlers */
  document.addEventListener("click", (e) => {
    const t = e.target.closest(".spec-toggle");
    if (t) { const card = t.closest(".loaf-card"); const open = card.classList.toggle("open"); t.setAttribute("aria-expanded", open); }
    const so = e.target.closest("[data-set-outlet]");
    if (so) { menuOutlet = store.outlet = so.dataset.setOutlet; save(); }
  });
  function closeAll() { closeChooser(); closeLb(); setDrawer(false); $$(".dd.open").forEach((d) => d.classList.remove("open")); }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

  navigate();
  onScroll();
}
