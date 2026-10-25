// All site content, taken from The Bread Bar's Linktree, its menu PDFs on Google Drive
// (Our Menu TTDI / Publika, Pastry_TBB-Menu, House Blend Coffee Beans, Sourdough Breads Info)
// and the two Google Business listings. Prices in RM, as of the 27 Sept menu.
// `only: "ttdi"|"pub"` = item appears on just that outlet's menu.
// `p` = price, or {ttdi, pub} when the outlets differ, or [hot, cold] for drinks (null = not offered).

window.TBB = {
  outlets: {
    ttdi: {
      name: "TTDI",
      full: "The Bread Bar TTDI",
      since: "Our first home",
      address: ["57, Lorong Rahim Kajai 13", "Taman Tun Dr Ismail", "60000 Kuala Lumpur"],
      phone: "011-1200 5626",
      tel: "+601112005626",
      whatsapp: "https://wa.me/601112005626",
      order: "https://thebreadbar.beepit.com/",
      grab: "https://app.grab.com/s/M295QB3a", // official GrabFood store (user, 18 Oct 2026)
      maps: "https://share.google/Jn0qHPu34NnUkPvrp",
      mapQuery: "The Bread Bar TTDI, 57 Lorong Rahim Kajai 13, Taman Tun Dr Ismail, Kuala Lumpur",
      menuPdf: "https://drive.google.com/drive/folders/1tjQIAn5Hk4STHFU4WDW-EVlAUhQEjC1m",
      photo: "assets/photos/ttdi-storefront.jpg",
    },
    pub: {
      name: "Publika",
      full: "The Bread Bar @ Publika",
      since: "Opened August 2025",
      address: ["Lot 52 & 53, Block B3, Level G2", "Publika Shopping Gallery, 1 Jalan Dutamas 1", "Solaris Dutamas, 50480 Kuala Lumpur"],
      phone: "012-436 5626",
      tel: "+60124365626",
      whatsapp: "https://wa.me/60124365626",
      order: "https://bpit.me/76ivnn3",
      grab: "https://app.grab.com/s/agrCaSFv", // official GrabFood store (user, 18 Oct 2026)
      maps: "https://share.google/i3GjOkWs9iEn0jMtE",
      mapQuery: "The Bread Bar, Publika Shopping Gallery, Solaris Dutamas, Kuala Lumpur",
      menuPdf: "https://drive.google.com/drive/folders/1u732I_s28iRQ5XuAs1v6uhQxtvx0n7PU",
      photo: "assets/photos/salmon-bowl.jpg",
    },
  },
  tagline: "Raw. Earthy. Progressive.",
  hours: "Open daily, 8am to 10pm",
  brunchHours: "Brunch served 8am to 5pm",
  events: { phone: "017-637 5626", whatsapp: "https://wa.me/60176375626",
    // preloaded WhatsApp message for event / bookout enquiries (user's text, 25 Oct 2026); wholesale stays a plain link
    waPrompt: "Hi! Can we get the following details to help us streamline your private event / restaurant bookout inquiry?\n\n\n *Expected Pax* :\n *Event Date* :\n *Event Time* ( _Start Time – End Time_ ) :\n *Estimated Budget Per Pax* :\n\n *Nature of Event :*\n _(e.g. Wedding, Corporate Event, Product Launch, Private Party, Birthday, Workshop, etc.)_\n\n *Event Details \u0026 Flow :*\nPlease briefly describe the event and how you envision the event flowing.*\n _(e.g. guest arrival time, speeches, ceremony/programme, food service timing, activities, etc.)_\n\n *Food Requirements:*\nPlease let us know what type of food you are looking for, any dietary requirements, and any specific dishes or preferences.\n\n *Drink Requirements* :\n _Please let us know your beverage requirements, including coffee, tea and other non-alcoholic beverages._\n\n *Preferred Service Style* :\n _Buffet / Canapés / Sharing Style / Plated Course-by-Course Service_\n\n _You may also select multiple service styles to suit your event flow — for example, canapés during guest arrival followed by a plated dinner._\n\n *Setup / Décor Requirements* :\n _Please let us know if you require any special setup, decorations, additional tables, equipment or changes to the existing restaurant layout._\n\n *Additional Details / Special Requests :*\n _If you have any customisation ideas for your event, do share some examples or references with us so we can see how best to accommodate them._\n\n *Event space reference photos* :\n\nhttps://photos.app.goo.gl/XKsLXgGxtYeR5RRs6" },
  instagram: "https://www.instagram.com/thebreadbarmy/",
  linktree: "https://linktr.ee/thebreadbarmy",
  company: "The Bread Bar Sdn Bhd 202101014085 (1414385-A)",

  // ---------------------------------------------------------------- food menu
  menu: [
    {
      id: "light", name: "Light",
      sections: [
        { title: "Small Plates", note: "available all day", items: [
          { n: "Assorted Slices of Sourdough Bread", d: "toasted & served with salted butter", p: 17, img: "sourdough-slices",
            extras: [["alternate butter: truffle / kombu", "+ 6.5"], ["add-on butter: truffle / kombu", "+ 8.0"]] },
          { n: "Prawn Toast", d: "deep-fried sourdough, tiger prawn mix, crispy millet grains, coriander yoghurt", p: 26, img: "prawn-toast", vid: "prawn-toast" },
          { n: "Truffle Fries", d: "with grana padano, sriracha mayo", p: 24, img: "truffle-fries" },
          { n: "Spiced Cauliflower Tempura", d: "with sriracha mayo", p: 24 },
          { n: "Roasted Broccoli and Cauliflower Salad", d: "served with labneh, rocket, crispy shallots, garlic-infused chilli oil", p: 26.5, img: "broccoli-cauliflower-salad" },
          { n: "Smoked Duck and Pineapple Salsa", d: "with roasted zaalouk sauce, homemade sourdough chips", p: 25, img: "smoked-duck-pineapple", only: "ttdi" },
        ]},
        { title: "Soup", note: "available all day", items: [
          { n: "Prawn Bisque", d: "rich prawn bisque, tiger prawns, leek, croutons", p: 31, img: "prawn-bisque" },
          { n: "Roasted Tomato Soup", d: "served with sourdough", p: 23, img: "roasted-tomato-soup" },
          { n: "Wild Truffle Mushroom Soup", d: "served with sourdough", p: 29 },
        ]},
        { title: "Tartines / Sandwiches", note: "available all day", items: [
          { n: "Smashed Avocado Tartine", d: "with chunky cherry tomato salsa, basil vinaigrette, crumbled feta cheese", p: 25, img: "smashed-avocado-tartine", only: "ttdi",
            extras: [["add-on poached egg", "+ 3.5"]] },
          { n: "Avocado Spiced Chicken Sandwich", d: "roasted spiced chicken, fresh avocado, sun-dried tomato salsa, homemade pickles", p: 34, img: "avocado-spiced-chicken-sandwich", only: "pub" },
          { n: "Signature Grilled Cheese Sandwich", d: "with wholegrain mustard", p: 30, img: "grilled-cheese",
            extras: [["add-on roasted tomato soup", "+ 15.0"]] },
          { n: "Corned Beef Sandwich", d: "with aged cheddar cheese, jalapeño cream, homemade pickles, wholegrain mustard", p: 36, img: "corned-beef-sandwich" },
          { n: "Tuna Melt Sandwich", d: "tuna, capers, dill, aioli, mozzarella cheese, aged cheddar, homemade pickles, wholegrain mustard", p: 31, img: "tuna-melt" },
          { n: "Homemade Focaccia with Beef Prosciutto", d: "pine nut pesto, cream cheese, sun-dried tomatoes, chilli oil, rocket", p: 38, img: "focaccia-beef-prosciutto" },
          { n: "Homemade Focaccia with Chicken Ham", d: "red pepper pesto, melted provolone cheese, sun-dried tomatoes, rocket", p: 36, img: "focaccia-chicken-ham" },
        ]},
      ],
    },
    {
      id: "hearty", name: "Hearty",
      sections: [
        { title: "Brunch", note: "available 8am to 5pm", items: [
          { n: "TBB Big Breakfast", d: "choice of eggs, sweet potato hummus, charred corn salsa, sautéed mushrooms, crispy potatoes, homemade spiced chicken patty, choice of beef bacon / smoked salmon, sourdough", p: 48, img: "tbb-big-breakfast" },
          { n: "Farmer’s Breakfast", v: true, d: "spinach and feta omelette, sourdough toast, half an avocado, French Brie cheese, rocket salad", p: 42, img: "farmers-breakfast",
            extras: [["add-on grilled chicken / smoked salmon / beef bacon", "+ 10.0"]] },
          { n: "Salmon and Avocado Eggs Benedict", d: "flaked seared salmon, smashed avocado, sautéed spinach, house-made English muffin, poached eggs, topped with smoky tobiko hollandaise", p: 38, img: "salmon-avocado-benedict" },
          { n: "Turkish Eggs", d: "yoghurt, herbs, 6-minute eggs, chilli oil spiced minced chicken, sourdough toast", p: { ttdi: 35, pub: 36 }, img: "turkish-eggs" },
          { n: "Spiced Smoked Duck Ragu", d: "served with potato hash, pesto, fried eggs, sourdough", p: 36, img: "smoked-duck-ragu", only: "ttdi" },
          { n: "Sweet Potato Hummus", v: true, d: "served with poached eggs, toasted pine nuts, feta, sourdough", p: 35, img: "sweet-potato-hummus" },
        ]},
        { title: "Mains", note: "available all day", items: [
          { n: "Steak and Eggs", d: "Australian Black Angus striploin, two sunny-side-up eggs, rocket salad, kombu pepper sauce", p: 78, img: "steak-and-eggs",
            extras: [["substitute sunny-side-up eggs for fries", "+ 6.0"]] },
          { n: "Herb Crusted Seabass", d: "crispy potato wedges, roasted cherry tomatoes, lemon caper zaalouk sauce", p: 46, img: "herb-crusted-seabass" },
          { n: "Seared Spiced Chicken", d: "served with creamy polenta, corn, cauliflower florets, sourdough croutons, truffle sourdough sauce", p: 39, img: "seared-spiced-chicken" },
          { n: "Signature Double Cheeseburger", d: "homemade brioche bun, spiced beef patties, melted aged cheddar, provolone cheese, smoked paprika gherkin mayo, fries", p: 45, img: "double-cheeseburger" },
          { n: "Beef Lasagna", d: "layers of slow-cooked beef ragu, bechamel sauce, cheese, marinara, rocket", p: 42, img: "beef-lasagna", only: "ttdi" },
          { n: "Salmon Bowl", d: "seared salmon fillet, kombu butter rice, 6-minute egg, corn, charred purple cabbage, shredded kyuri, seaweed, zaalouk mayo", p: { ttdi: 36, pub: 37 }, img: "salmon-bowl" },
        ]},
        { title: "Pasta", note: "available all day", items: [
          { n: "Chicken Meatball Spaghetti", d: "homemade pomodoro sauce, fried chicken meatballs, grana padano", p: 38, img: "chicken-meatball-spaghetti", only: "pub" },
          { n: "Miso Smoked Duck Spaghetti", d: "sautéed smoked duck, mushrooms, miso butter, herb crumbs, chilli oil, grana padano", p: 37, img: "miso-smoked-duck-spaghetti", only: "pub" },
          { n: "Mushroom Pesto Rigatoni", d: "homemade pine nut pesto, wild mushroom mix, sun-dried tomato, cream, grana padano", p: 44, img: "mushroom-pesto-rigatoni" },
          { n: "Squid Ink Pasta", d: "grilled tiger prawns, seared scallops, spicy miso tomato confit sauce, rocket", p: 55, img: "squid-ink-pasta" },
          { n: "Paccheri with Torched Beef Prosciutto", d: "red pepper pesto, stracciatella, roasted cherry tomatoes, herb crumbs, grana padano", p: 45, img: "paccheri-beef-prosciutto" },
          { n: "Nori Butter Capellini", d: "tiger prawn tartare, tomato salsa, kombu cream, fresh lime", p: 35, img: "nori-butter-capellini", only: "pub" },
        ]},
      ],
    },
    {
      id: "kids", name: "Kids", hero: "kids-menu",
      sections: [
        { title: "Kids", note: "available all day", items: [
          { n: "Big Baby Breakfast", d: "chicken patty, choice of eggs (scrambled / sunny-side-up / poached), mini croissant, side salad with cherry tomatoes", p: 21, img: "big-baby-breakfast" },
          { n: "Chicken Meatball Spaghetti", d: "pomodoro sauce, mini croissant, side salad with cherry tomatoes", p: 22, img: "kids-chicken-meatball-spaghetti" },
          { n: "Fish and Chips", d: "crispy coated seabass, chips, homemade tartar sauce", p: 24, img: "fish-and-chips" },
        ]},
      ],
    },
    {
      id: "dessert", name: "Dessert",
      sections: [
        { title: "The Bread Bar / Dessert", note: "available all day", items: [
          { n: "The Bread Bar", d: "discover our daily spread of freshly baked goods at the counter", link: "#bakery" },
          { n: "French Toast Banana Split", d: "brioche bread, cinnamon, caramelised banana, vanilla ice cream, caramel sauce", p: 28, img: "french-toast-banana" },
          { n: "Classic Homemade Tiramisu", d: "layers of coffee-soaked sponge fingers, mascarpone", p: 25, img: "tiramisu" },
          { n: "Biscoff Affogato", d: "vanilla bean ice cream, Biscoff paste, crumble, espresso shot", p: 23, img: "biscoff-affogato" },
        ]},
      ],
    },
    {
      id: "coffee", name: "Coffee & Matcha", hc: true,
      sections: [
        { title: "Classic Coffee", items: [
          { n: "Double Espresso", p: [8.5, null] },
          { n: "Espresso on the Rocks", p: [null, 9] },
          { n: "Americano", p: [10.5, 11.5], img: "iced-americano" },
          { n: "Latte", p: [13.5, 14.5], img: "hot-latte" },
          { n: "Flat White", p: [13.5, null] },
          { n: "Cappuccino", p: [13.5, null] },
          { n: "Piccolo Latte", p: [12, null] },
          { n: "Mocha", p: [14, 15] },
          { n: "Spanish Latte", p: [15.5, 16.5], img: "spanish-latte" },
          { n: "Tiramisu Latte", p: [null, 18.5], img: "tiramisu-latte" },
          { n: "Black Sunrise", p: [null, 16.5], img: "black-sunrise" },
          { n: "Filter Coffee", d: "enquire about our seasonal bean selection", p: [23, null], img: "filter-coffee", only: "ttdi" },
        ], extras: [["alt milk: oat / seasonal flavour", "+ 2.0"], ["add-on syrup: hazelnut / vanilla", "+ 2.0"]] },
        { title: "Signature Coffee", items: [
          { n: "Salted Caramel Macchiato", d: "homemade salted caramel sauce, Maldon sea salt", p: [16, 17], img: "salted-caramel-macchiato" },
          { n: "Biscoff Hazelnut Macchiato", d: "infused Biscoff milk, hazelnut, espresso", p: [17.5, 18.5], img: "biscoff-hazelnut-macchiato" },
          { n: "Banana Mochaccino", d: "espresso, chocolate, banana", p: [17, 18], img: "banana-mochaccino" },
          { n: "Rose Latte", d: "rose-infused latte, torched marshmallow", p: [15.5, 16.5] },
          { n: "Pistachio Latte", d: "latte, pistachio-flavoured", p: [17.5, 18.5], img: "pistachio-latte" },
          { n: "Coconut Coffee", d: "coffee cream, coconut water", p: [null, 16.5], img: "coconut-coffee" },
        ]},
        { title: "Matcha", items: [
          { n: "Matcha", p: [15.5, 16.5], img: "iced-matcha" },
          { n: "Houjicha", p: [15.5, 16.5], img: "hot-houjicha" },
          { n: "Dirty Matcha", p: [16.5, 17.5] },
          { n: "Dirty Houjicha", p: [16.5, 17.5] },
          { n: "Matcha Strawberry", p: [null, 19.5] },
          { n: "Matcha Pistachio", p: [null, 18], img: "dirty-matcha-pistachio" },
          { n: "Matcha Vanilla Biscoff", p: [null, 18], img: "matcha-vanilla-biscoff" },
          { n: "Matcha Rose Lychee", p: [null, 18] },
        ]},
      ],
    },
    {
      id: "drinks", name: "Drinks", hc: true,
      sections: [
        { title: "Signature Mocktails", items: [
          { n: "Lemon Mousse Long Black", d: "cold brew, sun-dried orange, lemon mousse", p: [null, 18], img: "lemon-mousse-long-black" },
          { n: "Yuzu Osmanthus Chamomile", d: "korean yuzu, osmanthus cold brew", p: [null, 16.5] },
          { n: "Coconut Melon Oolong", d: "with lemon cream", p: [null, 18] },
          { n: "Mango Oolong Sparkling", d: "with lemon cream", p: [null, 18] },
          { n: "Butter Beer", d: "100% non-alcoholic: vanilla soda, homemade butter caramel, light cream", p: [null, 17], img: "butterbeer" },
        ]},
        { title: "Lemonade", items: [
          { n: "Green Apple Assamboi", p: [null, 16.5], img: "green-apple-assamboi" },
          { n: "Wild Jasmine", p: [null, 16.5] },
          { n: "Honey Yuzu", p: [null, 16.5] },
        ]},
        { title: "Kombucha", items: [
          { n: "Apple Peach", p: [null, 13.5], img: "apple-peach-kombucha" },
          { n: "Mango Mojito", p: [null, 13.5] },
        ]},
        { title: "Tea", items: [
          { n: "English Breakfast", p: [12, 13], img: "hot-teas" },
          { n: "French Earl Grey", p: [12, 13] },
          { n: "Chamomile", p: [12, 13] },
          { n: "Peppermint", p: [12, 13] },
          { n: "Fruits of Eden", p: [12, 13] },
        ]},
        { title: "Chocolate", items: [
          { n: "Classic Chocolate", p: [14, 15], img: "hot-chocolate" },
          { n: "Chocolate Hazelnut", p: [16, 17], img: "chocolate-hazelnut" },
          { n: "Tiramisu Chocolate", p: [null, 17.5], img: "tiramisu-chocolate" },
        ]},
        { title: "Others", items: [
          { n: "Babycino", d: "warm / chilled", p: [null, 8.5] },
          { n: "Honey Lemon", p: [10.5, 11.5] },
          { n: "Orange Juice", p: [null, 13.5] },
          { n: "Juice of the Week", d: "enquire with our team", p: [null, 13.5] },
        ]},
        { title: "Water (500ml)", items: [
          { n: "Acqua Panna", d: "mineral", p: [null, 16] },
          { n: "San Pellegrino", d: "sparkling", p: [null, 16] },
        ]},
      ],
    },
    {
      id: "addons", name: "Add-ons", compact: true,
      sections: [
        { title: "Protein Add-Ons", items: [
          { n: "Chicken Patty", p: 7 }, { n: "Grilled Chicken", p: 10 }, { n: "Beef Bacon", p: 11 },
          { n: "Smoked Salmon", p: 11 }, { n: "Beef Prosciutto", p: 13 }, { n: "Tiger Prawns (3pcs)", p: 11 }, { n: "Scallops (3pcs)", p: 13 },
        ]},
        { title: "Egg Add-Ons", items: [
          { n: "Sunny-side-up", p: 3.5 }, { n: "Scrambled", p: 6.5 }, { n: "Poached", p: 3.5 }, { n: "6-Minute", p: 3.5 },
        ]},
        { title: "Sides", items: [
          { n: "Sourdough Slices (4pcs)", p: 5.5 }, { n: "Half Avocado", p: 6.8 }, { n: "French Fries", p: 6 },
          { n: "Sautéed Mushrooms", p: 4.5 }, { n: "Mixed Side Salad", p: 4.5 },
        ]},
        { title: "Cheese", items: [
          { n: "Cheddar Cheese (slice)", p: 3 }, { n: "Provolone Cheese (slice)", p: 3 },
        ]},
      ],
    },
  ],

  // ---------------------------------------------------------------- bakery counter
  // [name, RM, photo slug (from the user's product Drive), optional looping clip]
  pastry: [
    ["Butter Croissant", 8.5, "butter-croissant"], ["Pain Au Chocolat", 9, "pain-au-chocolat"],
    ["Peanut Butter & Banana Pain Au Chocolat", 11.5, "pb-banana-pain-au-chocolat"],
    ["Ham Cheese & Jalapeño Croissant", 14.5, "ham-cheese-jalapeno-croissant"], ["Vanilla Cream & Peach Danish", 14],
    ["Almond Croissant", 12.5, "almond-croissant"], ["Pistachio Kouign-Amann", 16, "pistachio-kouign-amann", "kouign-amann"],
    ["Pecan Tart Financier", 15], ["Crème Brûlée Danish", 15, "creme-brulee-danish"],
    ["Apple Crumble Tart", 13], ["Lemon Yuzu Meringue Tart", 15, "lemon-yuzu-meringue-tart"], ["Korean Honey Butter Toast", 16], ["Mont Blanc Tart", 16],
  ],
  cakeSlices: [["Burnt Cheesecake with Matcha Cream", 17, "burnt-cheesecake-matcha"], ["Carrot & Walnut with Cream Cheese", 17]],
  sourdough101: [
    ["sd101-1-cut", "How to cut sourdough"], ["sd101-2-store", "How to store it"],
    ["sd101-3-how-long", "How long it keeps"], ["sd101-4-reheat", "How to reheat it"],
  ],
  wholeCakes: [
    "Burnt Cheesecake with Matcha Cream",
    "Callebaut Chocolate Ganache Cake with Salted Caramel",
    "Carrot & Walnut Cake",
    "Flourless Chocolate Cake",
  ],
  loaves: [
    { n: "Country Brown Sourdough", p: 16, img: "bread-country-brown", g: 400, flour: "Stone milled: Japanese strong flour", crust: "Medium hard", tang: "Medium", crumb: "Medium soft", inc: "None", hyd: 90 },
    { n: "Brown Butter Oat Sourdough", p: 25, img: "bread-brown-butter-oat", g: 650, flour: "Stone milled strong: wholemeal flour, French T65", crust: "Medium soft", tang: "Medium", crumb: "Soft", inc: "Brown butter, rolled oats", hyd: 75 },
    { n: "Ancient Grain Sourdough", p: 25, img: "bread-ancient-grain", g: 650, flour: "Stone milled: wholemeal flour, French T65, Japanese bread flour", crust: "Medium soft", tang: "Medium", crumb: "Soft", inc: "Cornmeal, flax seed, pumpkin seed, amaranth", hyd: 70 },
    { n: "Wholemeal Rye Sourdough", p: 20, img: "bread-wholemeal-rye", g: 600, flour: "Stone milled: wholemeal flour, dark German rye 15%", crust: "Medium hard", tang: "Medium", crumb: "Medium", inc: "None", hyd: 72 },
    { n: "Toasted Millet Sourdough", p: 24, img: "bread-toasted-millet", g: 600, flour: "Wholemeal flour, Japanese strong flour, French T65", crust: "Medium soft", tang: "Medium light", crumb: "Soft", inc: "Toasted millet grains", hyd: 75 },
    { n: "Sourdough Focaccia with Mixed Olives & Sun-dried Tomatoes", p: 26, img: "bread-focaccia-olives", g: 600, flour: "Stone milled: strong wholemeal flour, French T65", crust: "Medium soft", tang: "Medium", crumb: "Soft", inc: "Mixed olives, sun-dried tomatoes, fresh herbs", hyd: 90 },
    { n: "Sourdough Focaccia with Cheddar Cheese & Sun-dried Tomatoes", p: 27, img: "bread-focaccia-cheddar", g: 600, flour: "Stone milled: strong wholemeal flour, French T65", crust: "Medium soft", tang: "Medium", crumb: "Soft", inc: "Cheddar cheese, sun-dried tomatoes, fresh herbs", hyd: 90 },
    { n: "Brioche Loaf", p: 26, img: "bread-brioche", g: 600, flour: "Stone milled: Japanese bread flour", crust: "Soft", tang: "None", crumb: "Soft", inc: "Milk, eggs, butter, sugar", hyd: 60, notes: "Rich, buttery, fragrant · leavened with dry yeast" },
  ],
  // Shop: only what T.B.B sells today (photos from the user's product Drive, 18 Oct 2026; no prices given, so
  // "Ask about it" opens the outlet WhatsApp). The deck's "coming soon" ideas were removed at the user's request.
  shop: {
    collections: [
      ["now", "Available now", "Wear it, carry it, sip from it. Ask our team at either outlet."],
    ],
    items: [
      { n: "The Breadfast Club Tee", c: "now", line: "Cream tee", img: "tee-breadfast-club", now: true, feature: true },
      { n: "Natural Fermentation Tee", c: "now", line: "Navy tee", img: "tee-natural-fermentation", now: true },
      { n: "The Breadfast Club Tote", c: "now", line: "Canvas tote", img: "tote-breadfast-club", now: true, feature: true },
      { n: "Natural Fermentation Tote", c: "now", line: "Canvas tote", img: "tote-natural-fermentation", now: true },
      { n: "T.B.B Coffee Tumbler", c: "now", line: "Reusable tumbler", img: "coffee-tumbler", now: true, feature: true },
      { n: "TBB x Lilin & Co", c: "now", line: "Candle collaboration", img: "lilin-candle-box", vid: "candle", tag: "Collab", now: true, feature: true },
      { n: "House Blend Coffee Beans", c: "now", line: "250g RM 40 · 500g RM 75 · 1kg RM 140", img: "house-blend-beans-bag", available: true },
    ],
  },
  beans: {
    name: "House Blend Coffee Beans",
    origins: ["Brazil Santa Lucia", "Nicaragua Los Cipreses", "Ethiopia Yirgacheffe"],
    notes: ["Mixed nuts", "Butterscotch", "Caramel"],
    sizes: [["250g", 40], ["500g", 75], ["1kg", 140]],
    blurb: "Espresso-based and best with milk, but just as good black. Experience our signature blend at home.",
  },
};
