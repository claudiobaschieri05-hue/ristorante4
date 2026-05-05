// translations.js
const TRANSLATIONS = {
  it: {
    // HEADER
    "nav_title": "Guida Ristoranti d'Italia",
    "nav_subtitle": "Menu interattivi · Prezzi reali · Oltre 30 locali",
    "search_placeholder": "Cerca ristorante o città...",
    "filter_all": "Tutti",
    "filter_favs": "❤️ Preferiti",
    "btn_login": "👤 Accedi",
    "btn_logout": "🚪 Esci",

    // TICKER
    "ticker_1": "🏆 Osteria Francescana è nella Top 10 di Modena questa settimana!",
    "ticker_2": "🔥 35 utenti stanno guardando le pizzerie a Napoli.",
    "ticker_3": "🍕 Nuovi locali aggiunti a Roma!",

    // HERO
    "hero_tag": "🇮🇹 La vera cucina italiana",
    "hero_title_big": "Scopri i Sapori<br><em>d'Italia</em>",
    "hero_desc": "Sfoglia i menu completi con antipasti, primi, secondi, dolci, vini, birre e bibite. Prezzi trasparenti, qualità garantita.",
    "stats_rest": "Ristoranti",
    "stats_cities": "15 Città",
    "stats_menus": "Menu Reali",
    "btn_browse": "Sfoglia i Locali ↓",
    "btn_near_me": "📍 Vicino a me",
    "btn_push": "🔔 Abilita Notifiche",
    "map_title": "📍 Ristoranti nella tua zona",
    "map_hint": "Clicca su un segnaposto per aprire il menu del locale",

    // GRID
    "grid_title": "I Nostri Ristoranti",
    "grid_subtitle": "Clicca su un locale per aprire il menu completo",
    "recent_title": "🕒 Visti di recente",

    // CART
    "cart_title": "🧾 Il Tuo Conto",
    "cart_empty": "Nessun piatto aggiunto.<br>Clicca su un piatto del menu per aggiungerlo!",
    "cart_total_label": "Totale",
    "cart_order": "📲 Invia Ordine",

    // MODAL RISTORANTE
    "modal_share": "📤 Condividi",
    "modal_book": "📅 PRENOTA UN TAVOLO",
    "modal_full": "❌ ESAURITO",
    "modal_signature": "🏅 Piatti Firma del Locale",
    "tab_reviews": "⭐ Recensioni",
    "review_write": "✍️ Scrivi una recensione",
    "review_login_prompt": "Fai il Login per scrivere una recensione.",

    // FOOTER
    "footer_credits": "Questo sito è stato creato da",
    "footer_legal": "Tutti i prezzi sono indicativi e soggetti a variazioni stagionali.",

    // AUTH
    "auth_login_title": "Accedi al tuo account",
    "auth_email": "Email",
    "auth_password": "Password",
    "auth_submit_login": "Accedi",
    "auth_submit_register": "Registrati",
    "auth_toggle_register": "Non hai un account? Registrati",
    "auth_toggle_login": "Hai già un account? Accedi",
    "credits_bar": "Questo sito è stato creato da <strong>Claudio Baschieri</strong>",
    "cart_total_label": "Totale stimato"
  },
  en: {
    // HEADER
    "nav_title": "Italian Restaurants Guide",
    "nav_subtitle": "Interactive Menus · Real Prices · 30+ Venues",
    "search_placeholder": "Search restaurant or city...",
    "filter_all": "All",
    "filter_favs": "❤️ Favorites",
    "btn_login": "👤 Login",
    "btn_logout": "🚪 Logout",

    // TICKER
    "ticker_1": "🏆 Osteria Francescana is in the Top 10 of Modena this week!",
    "ticker_2": "🔥 35 users are currently browsing pizzerias in Naples.",
    "ticker_3": "🍕 New venues added in Rome!",

    // HERO
    "hero_tag": "🇮🇹 Authentic Italian Cuisine",
    "hero_title_big": "Discover the Tastes<br><em>of Italy</em>",
    "hero_desc": "Browse full menus with starters, pasta, mains, desserts, wines, beers and drinks. Transparent prices, guaranteed quality.",
    "stats_rest": "Restaurants",
    "stats_cities": "15 Cities",
    "stats_menus": "Real Menus",
    "btn_browse": "Browse Venues ↓",
    "btn_near_me": "📍 Near me",
    "btn_push": "🔔 Enable Notifications",
    "map_title": "📍 Restaurants in your area",
    "map_hint": "Click a marker to open the venue's menu",

    // GRID
    "grid_title": "Our Restaurants",
    "grid_subtitle": "Click a venue to open the full menu",
    "recent_title": "🕒 Recently viewed",

    // CART
    "cart_title": "🧾 Your Order",
    "cart_empty": "No items added.<br>Click a menu item to add it!",
    "cart_total_label": "Total",
    "cart_order": "📲 Send Order",

    // MODAL RISTORANTE
    "modal_share": "📤 Share",
    "modal_book": "📅 BOOK A TABLE",
    "modal_full": "❌ FULLY BOOKED",
    "modal_signature": "🏅 Signature Dishes",
    "tab_reviews": "⭐ Reviews",
    "review_write": "✍️ Write a review",
    "review_login_prompt": "Login to write a review.",

    // FOOTER
    "footer_credits": "This site was created by",
    "footer_legal": "All prices are indicative and subject to seasonal variations.",

    // AUTH
    "auth_login_title": "Login to your account",
    "auth_email": "Email",
    "auth_password": "Password",
    "auth_submit_login": "Login",
    "auth_submit_register": "Register",
    "auth_toggle_register": "Don't have an account? Register",
    "auth_toggle_login": "Already have an account? Login",
    "credits_bar": "This site was created by <strong>Claudio Baschieri</strong>",
    "cart_total_label": "Estimated total"
  }
};

let currentLang = localStorage.getItem("lang") || "it";

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const t = TRANSLATIONS[currentLang];
    if (!t || !t[key]) return;

    if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
      el.placeholder = t[key];
    } else {
      el.innerHTML = t[key];
    }
  });

  // Aggiorna il tasto lingua con stile bandiera
  const langToggle = document.getElementById("langToggleBtn");
  if (langToggle) {
    langToggle.innerHTML = currentLang === "it"
      ? "<span class='lang-flag'>🇬🇧</span><span class='lang-label'>EN</span>"
      : "<span class='lang-flag'>🇮🇹</span><span class='lang-label'>IT</span>";
  }

  document.documentElement.lang = currentLang;
}

window.toggleLanguage = function() {
  currentLang = currentLang === "it" ? "en" : "it";
  localStorage.setItem("lang", currentLang);
  applyTranslations();
};

document.addEventListener("DOMContentLoaded", applyTranslations);
