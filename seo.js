/* The Bread Bar: the site's routes, their search titles + descriptions, the opening-hours wording and the structured
   data (JSON-LD) for Google. One file, used in two places so they can never disagree:
   - the browser (loaded before app.js): app.js renders by route and refreshes the head tags on every navigation,
     with the live content/*.json values (hours, menu prices);
   - build-pages.mjs at publish time (run by ..\publish-pages.ps1): bakes each route's tags into <route>/index.html.
   Plain browser script, no DOM use; sets window.TBBSEO (and module.exports for Node). No em dashes in any copy. */
(function (root) {
  // path = real URL under the site's base ("" = home). crumb = breadcrumb name. desc(D, H) may use the hours (H).
  const ROUTES = [
    { path: "", name: "home", crumb: "Home",
      title: () => "The Bread Bar · Sourdough Bakery & Café in TTDI & Publika, KL",
      desc: (D, H) => `Handcrafted sourdough, pastries, all-day brunch and specialty coffee in TTDI and Publika, Kuala Lumpur. ${H.same ? H.short : "Open daily: " + H.short}.` },
    { path: "menu/", name: "menu", crumb: "Menu",
      title: () => "Menu: Brunch, Pasta & Coffee · The Bread Bar TTDI & Publika",
      desc: () => "The Bread Bar menu for TTDI and Publika, KL: brunch plates on sourdough, small plates, pasta, kids' meals, desserts, coffee, matcha and drinks. Prices in RM." },
    { path: "bakery/", name: "bakery", crumb: "Bakery",
      title: () => "Bakery: Sourdough Loaves, Pastries & Cakes · The Bread Bar KL",
      desc: () => "Naturally leavened sourdough loaves, laminated pastries, cakes by the slice, whole cakes to pre-order and house blend coffee beans, baked fresh every morning." },
    { path: "shop/", name: "shop", crumb: "Shop",
      title: () => "The T.B.B Shop: Tees, Totes & Tumblers · The Bread Bar",
      desc: () => "The Breadfast Club and Natural Fermentation tees and totes, a T.B.B coffee tumbler, house blend beans and the TBB x Lilin & Co candle, at our KL outlets." },
    { path: "locations/", name: "locations", crumb: "Locations",
      title: () => "Locations & Opening Hours · The Bread Bar TTDI & Publika, KL",
      desc: (D, H) => `Find The Bread Bar in Taman Tun Dr Ismail (TTDI) and at Publika, Solaris Dutamas, Kuala Lumpur. ${H.daily}. Addresses, phones and directions.` },
    { path: "locations/ttdi/", name: "locations", outlet: "ttdi", crumb: "TTDI",
      title: () => "The Bread Bar TTDI · Sourdough Bakery & Café, Taman Tun Dr Ismail",
      desc: (D, H) => `${D.outlets.ttdi.full}, ${D.outlets.ttdi.address.join(", ").replace(/^(\d+),/, "$1")}. ${H.outlet("ttdi")}. Brunch, sourdough and coffee.` },
    { path: "locations/publika/", name: "locations", outlet: "pub", crumb: "Publika",
      title: () => "The Bread Bar @ Publika · Sourdough Bakery & Café, Solaris Dutamas",
      desc: (D, H) => `${D.outlets.pub.full}, Level G2, Publika Shopping Gallery, Solaris Dutamas, Kuala Lumpur. ${H.outlet("pub")}. Brunch, sourdough and coffee.` },
    { path: "about/", name: "about", crumb: "Our Story",
      title: () => "Our Story · The Bread Bar, Sourdough Bakery in Kuala Lumpur",
      desc: () => "How a neighbourhood sourdough bakery in Taman Tun Dr Ismail grew into an all-day café, now also at Publika. Long-fermented loaves and stone-milled flours." },
    { path: "events/", name: "events", crumb: "Events",
      title: () => "Events & Private Dining · The Bread Bar TTDI & Publika, KL",
      desc: () => "Birthdays, baby showers, team brunches and private dining at The Bread Bar in TTDI and Publika, KL. Tell us your date, outlet and headcount on WhatsApp." },
    { path: "events/wholesale/", name: "events", crumb: "Wholesale",
      title: () => "Wholesale Sourdough & Pastries · The Bread Bar KL",
      desc: () => "Sourdough loaves, focaccia and laminated pastries from The Bread Bar, baked fresh each day for cafés, restaurants, hotels and offices in Kuala Lumpur." },
  ];
  const NOT_FOUND = { title: "Page not found · The Bread Bar" };
  const route = (path) => ROUTES.find((r) => r.path === path);

  // Old hash links (#menu-hearty, #locations-ttdi, #bakery-loaves, #events-wholesale ...) as {path, anchor}.
  // null = not one of the site's old route tokens.
  const NAMES = ["home", "menu", "bakery", "shop", "locations", "about", "events"];
  const fromToken = (tok) => {
    const parts = String(tok || "").replace(/^#\/?/, "").split(/[-/]/).filter(Boolean);
    const name = parts[0] || "home", sub = parts[1] || "";
    if (!NAMES.includes(name)) return null;
    if (name === "home") return { path: "", anchor: "" };
    if (name === "locations") return { path: sub === "ttdi" || sub === "publika" ? `locations/${sub}/` : "locations/", anchor: "" };
    if (name === "events") return { path: sub === "wholesale" ? "events/wholesale/" : "events/", anchor: "" };
    if (name === "about") return { path: "about/", anchor: "" };
    return { path: name + "/", anchor: sub }; // menu tab, bakery / shop section
  };
  // ...and back (for the claude.ai artifact, which can only use #tokens)
  const toToken = (path, anchor) => {
    const p = String(path || "").replace(/\/+$/, "");
    if (!p) return "home";
    return (anchor && ["menu", "bakery", "shop"].includes(p) ? `${p}-${anchor}` : p.replace(/\//g, "-"));
  };

  /* Opening hours wording. `opening` = data.js `opening` with content/hours.json applied (applyHours). Every hours
     text on the site comes from here (announcement bar, drawer, outlet blocks, menu + location pages, footer, ticker,
     About, "Open every day" scene, meta descriptions, the Brunch menu note, JSON-LD). Equal hours at both outlets read
     "Open daily, 8am to 10pm". */
  const hours = (o) => {
    const dec = (s) => { const [h, m] = String(s).split(":").map(Number); return h + m / 60; };
    const span = (x) => { const a = dec(x.opens); let b = dec(x.closes); if (b <= a) b += 24; return [a, b]; }; // past midnight
    const t = (h) => {
      h = ((h % 24) + 24) % 24;
      const hh = Math.floor(h + 1e-6), mm = Math.round((h - hh) * 60);
      if (!hh && !mm) return "midnight";
      return `${((hh + 11) % 12) + 1}${mm ? ":" + String(mm).padStart(2, "0") : ""}${hh < 12 ? "am" : "pm"}`;
    };
    const out = { ttdi: span(o.ttdi), pub: span(o.publika) };
    const range = (k) => `${t(out[k][0])} to ${t(out[k][1])}`;
    const same = range("ttdi") === range("pub");
    const each = `TTDI ${range("ttdi")} · Publika ${range("pub")}`;
    const brunch = `${t(dec(o.brunchFrom))} to ${t(dec(o.brunchUntil))}`;
    const open = Math.min(out.ttdi[0], out.pub[0]), close = Math.max(out.ttdi[1], out.pub[1]);
    return {
      t, out, same, open, close, notice: String(o.notice || "").trim(),
      daily: same ? `Open daily, ${range("ttdi")}` : `Open daily: ${each}`,
      short: same ? `Open daily ${range("ttdi")}` : each,
      drawer: same ? `Open daily · ${range("ttdi")}` : each,
      ticker: same ? [`Open daily ${range("ttdi")}`] : [`TTDI ${range("ttdi")}`, `Publika ${range("pub")}`],
      outlet: (k) => `Open daily, ${range(k)}`,
      brunch: `Brunch served ${brunch}`, brunchNote: `available ${brunch}`, brunchUntil: t(dec(o.brunchUntil)),
      about: same ? `Both outlets are open daily from ${range("ttdi")}` : `TTDI is open daily from ${range("ttdi")} and Publika from ${range("pub")}`,
      span: `${t(open)} to ${t(close)}`,
    };
  };
  // content/hours.json over data.js `opening` (bad values keep the data.js ones). Used by app.js and the build.
  const applyHours = (o, json) => {
    const str = (v) => (typeof v === "string" ? v.trim() : "");
    const t = (v, d) => (/^([01]\d|2[0-4]):[0-5]\d$/.test(str(v)) ? str(v) : d);
    for (const k of ["ttdi", "publika"]) if (json[k] && typeof json[k] === "object") o[k] = { opens: t(json[k].opens, o[k].opens), closes: t(json[k].closes, o[k].closes) };
    o.brunchFrom = t(json.brunchFrom, o.brunchFrom); o.brunchUntil = t(json.brunchUntil, o.brunchUntil);
    if (typeof json.notice === "string") o.notice = json.notice.trim();
  };

  // "RM 8.50-78": cheapest to dearest item on the menu (add-ons left out), from the same prices the menu shows.
  // prices = numbers; null when there are none.
  const priceRange = (prices) => {
    const n = prices.filter((x) => typeof x === "number" && isFinite(x) && x > 0);
    if (!n.length) return null;
    const f = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(2));
    const lo = Math.min(...n), hi = Math.max(...n);
    return lo === hi ? `RM ${f(lo)}` : `RM ${f(lo)}-${f(hi)}`;
  };
  // the browser's menu (data.js shape after content/*.json: p = number | {ttdi, pub} | [hot, cold]; hidden items out)
  const menuPrices = (menu) => menu.filter((c) => c.id !== "addons").flatMap((c) => c.sections.flatMap((s) => s.items))
    .filter((it) => !it.hidden).flatMap((it) => (it.p && typeof it.p === "object" ? Object.values(it.p) : [it.p]));

  /* Structured data: the brand (Organization) + the website on every page; each outlet as a Bakery + café on home,
     Locations and its own page; a breadcrumb trail on every other page. Only values the site already shows (no
     invented coordinates, ratings or prices). site = absolute URL of the site's base, ending in "/". */
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const postal = (o) => {
    const lines = o.address.slice(), last = lines.pop() || "";
    const m = last.match(/^(.*?),?\s*(\d{5})\s+(.+)$/);
    const street = (m && m[1] ? [...lines, m[1]] : m ? lines : [...lines, last]).join(", ");
    const a = { "@type": "PostalAddress", streetAddress: street };
    if (m) { a.postalCode = m[2]; a.addressLocality = m[3]; }
    a.addressRegion = "Kuala Lumpur";
    a.addressCountry = "MY";
    return a;
  };
  const graph = (path, D, site, prices) => {
    const r = route(path);
    if (!r) return null;
    const abs = (p) => (/^https?:/.test(p) ? p : site + String(p).replace(/^\/+/, ""));
    const org = site + "#organization";
    const sameAs = [D.instagram, D.facebook, D.linktree].filter((u) => typeof u === "string" && /^https:\/\//.test(u));
    const items = [
      { "@type": "Organization", "@id": org, name: "The Bread Bar", legalName: String(D.company || "").replace(/ Sdn Bhd.*$/, " Sdn Bhd") || undefined,
        url: site, logo: abs("assets/logo-dark.png"), image: abs("assets/share.jpg"), sameAs },
      { "@type": "WebSite", "@id": site + "#website", name: "The Bread Bar", url: site, inLanguage: "en-MY", publisher: { "@id": org } },
    ];
    const range = priceRange(prices || menuPrices(D.menu));
    const opening = D.opening;
    const place = (key) => {
      const o = D.outlets[key], h = opening[key === "pub" ? "publika" : "ttdi"], slug = key === "pub" ? "publika" : "ttdi";
      const close = h.closes === "24:00" ? "23:59" : h.closes;
      const p = { "@type": ["Bakery", "CafeOrCoffeeShop"], "@id": `${site}locations/${slug}/#place`, name: o.full, url: `${site}locations/${slug}/`,
        image: [abs(o.photo)], telephone: o.tel, address: postal(o),
        openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: DAYS, opens: h.opens, closes: close }],
        servesCuisine: ["Bakery", "Brunch", "Coffee"], menu: site + "menu/", acceptsReservations: true, hasMap: o.maps,
        parentOrganization: { "@id": org } };
      if (range) p.priceRange = range;
      return p;
    };
    if (!path || path === "locations/") items.push(place("ttdi"), place("pub"));
    if (r.outlet) items.push(place(r.outlet));
    if (path) {
      const trail = [route("")];
      const parts = path.split("/").filter(Boolean);
      for (let i = 1; i <= parts.length; i++) { const x = route(parts.slice(0, i).join("/") + "/"); if (x) trail.push(x); }
      items.push({ "@type": "BreadcrumbList", itemListElement: trail.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.crumb, item: site + x.path })) });
    }
    return { "@context": "https://schema.org", "@graph": items };
  };

  // Everything the head needs for one route. path = route path ("" home) or null for "not found".
  const meta = (path, D, H, site, prices) => {
    const r = path == null ? null : route(path);
    if (!r) return { title: NOT_FOUND.title, desc: route("").desc(D, H), url: null, image: site + "assets/share.jpg", ld: null };
    return { title: r.title(), desc: r.desc(D, H), url: site + r.path, image: site + "assets/share.jpg", ld: graph(r.path, D, site, prices) };
  };
  const IMAGE_ALT = "Sourdough loaves from The Bread Bar, TTDI and Publika, Kuala Lumpur";
  const escA = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // JSON inside <script>: "<" escaped so no value can close the tag
  const ldText = (ld) => JSON.stringify(ld).replace(/</g, "\\u003c");
  // the head block build-pages.mjs writes between <!-- seo --> and <!-- /seo --> (app.js updates the same tags)
  const headTags = (m) => [
    `<title>${escA(m.title)}</title>`,
    `<meta name="description" content="${escA(m.desc)}">`,
    m.url ? `<link rel="canonical" href="${escA(m.url)}">` : "",
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="The Bread Bar">`,
    `<meta property="og:locale" content="en_MY">`,
    `<meta property="og:title" content="${escA(m.title)}">`,
    `<meta property="og:description" content="${escA(m.desc)}">`,
    m.url ? `<meta property="og:url" content="${escA(m.url)}">` : "",
    `<meta property="og:image" content="${escA(m.image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${escA(IMAGE_ALT)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escA(m.title)}">`,
    `<meta name="twitter:description" content="${escA(m.desc)}">`,
    `<meta name="twitter:image" content="${escA(m.image)}">`,
    m.ld ? `<script type="application/ld+json" id="ld">${ldText(m.ld)}</script>` : "",
  ].filter(Boolean).join("\n");

  const api = { ROUTES, NOT_FOUND, route, fromToken, toToken, hours, applyHours, priceRange, menuPrices, graph, meta, headTags, ldText, IMAGE_ALT };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.TBBSEO = api;
})(typeof window !== "undefined" ? window : globalThis);
