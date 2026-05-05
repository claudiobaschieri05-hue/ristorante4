// translations.js
const TRANSLATIONS = {
  it: {
    "nav_title": "Guida Ristoranti d'Italia",
    "nav_subtitle": "Menu interattivi · Prezzi reali · Oltre 30 locali",
    "search_placeholder": "Cerca ristorante o città...",
    "btn_near_me": "📍 Vicino a me",
    "btn_push": "🔔 Abilita Notifiche",
    "btn_login": "👤 Accedi",
    "btn_logout": "🚪 Esci",
    "filter_all": "Tutti",
    "filter_favs": "❤️ Preferiti",
    "filter_rec": "🌟 Consigliati",
    "hero_title": "Scopri i Sapori d'Italia",
    "hero_subtitle": "Trova i migliori ristoranti, sfoglia i menu con i prezzi aggiornati e prenota il tuo tavolo in pochi secondi.",
    "stats_rest": "Ristoranti",
    "stats_cities": "Città",
    "stats_menus": "Menu Reali",
    "btn_browse": "Sfoglia i Locali ↓",
    "map_title": "📍 Ristoranti nella tua zona",
    "map_hint": "Clicca su un segnaposto per aprire il menu del locale",
    "grid_title": "I Nostri Ristoranti",
    "grid_subtitle": "Clicca su un locale per aprire il menu completo",
    "recent_title": "🕒 Visti di recente",
    "cart_empty": "Nessun piatto aggiunto.<br>Clicca su un piatto del menu per aggiungerlo!",
    "cart_order": "📲 Invia Ordine",
    "modal_share": "📤 Condividi",
    "modal_book": "📅 PRENOTA UN TAVOLO",
    "modal_full": "❌ ESAURITO",
    "modal_signature": "🏅 Piatti Firma del Locale",
    "tab_reviews": "⭐ Recensioni",
    "review_write": "✍️ Scrivi una recensione",
    "review_login_prompt": "Fai il Login per scrivere una recensione.",
    "footer_credits": "Questo sito è stato creato da",
    "auth_login_title": "Accedi al tuo account",
    "auth_email": "Email",
    "auth_password": "Password",
    "auth_submit_login": "Accedi",
    "auth_submit_register": "Registrati",
    "auth_toggle_register": "Non hai un account? Registrati",
    "auth_toggle_login": "Hai già un account? Accedi"
  },
  en: {
    "nav_title": "Italian Restaurants Guide",
    "nav_subtitle": "Interactive Menus · Real Prices · 30+ Venues",
    "search_placeholder": "Search restaurant or city...",
    "btn_near_me": "📍 Near me",
    "btn_push": "🔔 Enable Push",
    "btn_login": "👤 Login",
    "btn_logout": "🚪 Logout",
    "filter_all": "All",
    "filter_favs": "❤️ Favorites",
    "filter_rec": "🌟 Recommended",
    "hero_title": "Discover the Tastes of Italy",
    "hero_subtitle": "Find the best restaurants, browse menus with updated prices and book your table in seconds.",
    "stats_rest": "Restaurants",
    "stats_cities": "Cities",
    "stats_menus": "Real Menus",
    "btn_browse": "Browse Venues ↓",
    "map_title": "📍 Restaurants in your area",
    "map_hint": "Click a marker to open the venue's menu",
    "grid_title": "Our Restaurants",
    "grid_subtitle": "Click a venue to open the full menu",
    "recent_title": "🕒 Recently viewed",
    "cart_empty": "No items added.<br>Click a menu item to add it!",
    "cart_order": "📲 Send Order",
    "modal_share": "📤 Share",
    "modal_book": "📅 BOOK A TABLE",
    "modal_full": "❌ FULLY BOOKED",
    "modal_signature": "🏅 Signature Dishes",
    "tab_reviews": "⭐ Reviews",
    "review_write": "✍️ Write a review",
    "review_login_prompt": "Login to write a review.",
    "footer_credits": "This site was created by",
    "auth_login_title": "Login to your account",
    "auth_email": "Email",
    "auth_password": "Password",
    "auth_submit_login": "Login",
    "auth_submit_register": "Register",
    "auth_toggle_register": "Don't have an account? Register",
    "auth_toggle_login": "Already have an account? Login"
  }
};

let currentLang = localStorage.getItem("lang") || "it";

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) {
      if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
        el.placeholder = TRANSLATIONS[currentLang][key];
      } else {
        el.innerHTML = TRANSLATIONS[currentLang][key];
      }
    }
  });
  
  // Update toggle button text if exists
  const langToggle = document.getElementById("langToggleBtn");
  if (langToggle) {
    langToggle.textContent = currentLang === "it" ? "🇬🇧 EN" : "🇮🇹 IT";
  }
  
  document.documentElement.lang = currentLang;
}

window.toggleLanguage = function() {
  currentLang = currentLang === "it" ? "en" : "it";
  localStorage.setItem("lang", currentLang);
  applyTranslations();
};

document.addEventListener("DOMContentLoaded", applyTranslations);
