/* ================================================
   app.js – Guida Ristoranti d'Italia
   ================================================ */

// ── SUPABASE INITIALIZATION ──
const supabaseUrl = 'https://ibcyazqkxypllcjcjnoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliY3lhenFreHlwbGxjamNqbm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODYyNjQsImV4cCI6MjA5MjM2MjI2NH0.aYOo_Sn73Tbr0dHzcGHVeqe0NETdyD_G_5nP2BoVh8o';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ── GLOBALS & PREMIUM FEATURES ──
const USER_LOC = { lat: 44.6989, lng: 10.6297 }; // Reggio Emilia
let heroMap, markerLayer;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

function toggleFavorite(event, id) {
  event.stopPropagation();
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
    event.currentTarget.classList.remove('active');
    showToast("Rimosso dai preferiti", "💔");
  } else {
    favorites.push(id);
    event.currentTarget.classList.add('active');
    showToast("Aggiunto ai preferiti!", "❤️");
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  if (document.querySelector(".filter-btn.active")?.dataset.cat === "preferiti") applyFilters();
}

// ── TOAST NOTIFICATIONS ──
function showToast(message, icon = "🔔") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ── SHARE ──
function shareRestaurant(id) {
  const r = RESTAURANTS.find(x => x.id === id);
  if (!r) return;
  const dist = getDistance(USER_LOC.lat, USER_LOC.lng, r.lat, r.lng);
  const text = `Scopri ${r.emoji} ${r.name} a ${r.city} (${dist} km di distanza)! Rating: ${r.rating}⭐.`;
  if (navigator.share) {
    navigator.share({ title: r.name, text: text, url: window.location.href }).catch(console.error);
  } else {
    navigator.clipboard.writeText(text);
    showToast("Testo copiato negli appunti!", "📋");
  }
}

// ── TAB LABELS ──
const TAB_LABELS = {
  antipasti: "🥗 Antipasti",
  pizze: "🍕 Pizze",
  colazione: "☕ Colazione",
  cicchetti: "🍢 Cicchetti",
  panini: "🥖 Panini",
  aperitivo: "🍸 Aperitivo",
  gelati: "🍦 Gelati",
  granite: "🧊 Granite",
  cioccolato: "🍫 Cioccolato",
  primi: "🍝 Primi",
  secondi: "🍖 Secondi",
  dolci: "🍰 Dolci",
  bevande: "🥤 Bevande",
  vini: "🍷 Vini",
  birre: "🍺 Birre",
  bibite: "🥤 Bibite & Caffè",
};

// ── DRINK CLASSES ──
const DRINK_CLASSES = { vini: "drink-wine", birre: "drink-beer", bibite: "drink-soft", bevande: "drink-soft" };

// ── RECENT VISITS ──
let recentVisits = JSON.parse(localStorage.getItem('recentVisits')) || [];

function addRecentVisit(id) {
  if (recentVisits.includes(id)) {
    recentVisits = recentVisits.filter(v => v !== id);
  }
  recentVisits.unshift(id);
  if (recentVisits.length > 5) recentVisits.pop();
  localStorage.setItem('recentVisits', JSON.stringify(recentVisits));
  renderRecentVisits();
}

function renderRecentVisits() {
  const container = document.getElementById("recentContainer");
  const grid = document.getElementById("recentGrid");
  if (!container || !grid) return;
  if (recentVisits.length === 0) {
    container.classList.add("hidden");
    return;
  }
  container.classList.remove("hidden");
  grid.innerHTML = "";
  recentVisits.forEach(id => {
    const r = RESTAURANTS.find(x => x.id === id);
    if (!r) return;
    const item = document.createElement("div");
    item.className = "recent-item";
    item.innerHTML = `<span class="ri-emoji">${r.emoji}</span> <div class="ri-info"><strong>${r.name}</strong><span>${r.city}</span></div>`;
    item.onclick = () => {
      document.getElementById('restaurant-grid')?.scrollIntoView({ behavior: 'smooth' });
      openModal(r.id);
    };
    grid.appendChild(item);
  });
}

// ── RENDER CARDS ──
function renderCards(list) {
  const grid = document.getElementById("cardsGrid");
  grid.innerHTML = "";
  list.forEach(r => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-id", r.id);
    card.setAttribute("data-cat", r.cat);
    // Novità: Distanza e Occupanza
    const distance = getDistance(USER_LOC.lat, USER_LOC.lng, r.lat, r.lng);
    const isFav = favorites.includes(r.id) ? 'active' : '';
    let occClass = r.occupancy < 40 ? 'occ-low' : (r.occupancy < 75 ? 'occ-med' : 'occ-high');
    let occText = r.occupancy < 40 ? 'Tranquillo' : (r.occupancy < 75 ? 'Normale' : 'Affollato');

    card.innerHTML = `
      <div class="card-img" style="background-image: url('${r.image}')">
        <div class="card-top-badges">
          <div class="card-dist">🚗 ${distance} km</div>
          <button class="card-fav-btn ${isFav}" onclick="toggleFavorite(event, ${r.id})">❤️</button>
        </div>
        ${r.emoji}
        ${r._matchedDish ? `<div class="card-badge-ribbon" style="background:#4caf50;">🔍 Trovato: ${r._matchedDish}</div>` : (r.badge ? `<div class="card-badge-ribbon">${r.badge}</div>` : '')}
      </div>
      <div class="card-body">
        <span class="card-cat">${r.cat}</span>
        <div class="card-name">${r.name}</div>
        <div class="card-city">📍 ${r.city}</div>
        <div class="card-tags">
          ${r.atmosfera ? `<span class="card-tag atmo-tag">${r.atmosfera}</span>` : ''}
          ${r.veganFriendly ? '<span class="card-tag vegan-tag">🌿 Vegan Friendly</span>' : ''}
          ${r.glutenFree ? '<span class="card-tag gf-tag">🌾 Senza Glutine</span>' : ''}
        </div>
        <div class="card-desc">${r.desc}</div>
        <div class="occ-container">
          <div class="occ-label"><span>Live Occupancy</span> <span>${occText} (${r.occupancy}%)</span></div>
          <div class="occ-bar-bg">
            <div class="occ-bar-fill ${occClass}" style="width: ${r.occupancy}%"></div>
          </div>
        </div>
        <div class="card-servizi">
          ${r.servizi?.dehor ? '<span class="serv-icon" title="Tavoli all\'aperto">🌤️</span>' : ''}
          ${r.servizi?.parcheggio ? '<span class="serv-icon" title="Parcheggio">🅿️</span>' : ''}
          ${r.servizi?.wiFi ? '<span class="serv-icon" title="WiFi gratuito">📶</span>' : ''}
          ${r.servizi?.accessibileDisabili ? '<span class="serv-icon" title="Accessibile disabili">♿</span>' : ''}
          ${r.servizi?.animaliAmmessi ? '<span class="serv-icon" title="Animali ammessi">🐾</span>' : ''}
        </div>
        <div class="card-footer">
          <div>
            <div class="card-stars">${r.stars}</div>
            <div class="card-price">Medio: <strong>${r.avgPrice}</strong></div>
            ${r.form_available ? (r.postiDisponibili > 0 ? `<div class="card-availability av-green">🟢 ${r.postiDisponibili} Posti disponibili</div>` : `<div class="card-availability av-red">🔴 Completo</div>`) : ''}
          </div>
          <button class="card-btn" onclick="openModal(${r.id})">Vedi Menu →</button>
        </div>
        ${r.website ? `<a href="${r.website}" target="_blank" class="card-website-btn">🌐 Visita sito web</a>` : ''}
      </div>`;
    grid.appendChild(card);
  });
}

// ── OPEN MODAL ──
function openModal(id) {
  const r = RESTAURANTS.find(x => x.id === id);
  if (!r) return;

  addRecentVisit(r.id);

  const tabs = Object.keys(r.menu);
  const tabsHTML = tabs.map((k, i) =>
    `<button class="menu-tab ${i === 0 ? "active" : ""}" data-tab="${k}" onclick="switchTab('${k}',this)">${TAB_LABELS[k] || k}</button>`
  ).join("") + `<button class="menu-tab" data-tab="recensioni" onclick="switchTab('recensioni',this)">⭐ Recensioni</button>`;

  const panelsHTML = tabs.map((k, i) => {
    const dClass = DRINK_CLASSES[k] || "";
    const items = r.menu[k].map(item => {
      const isV = item.isVegan ? 'is-vegan' : '';
      const isGF = item.isGF ? 'is-gf' : '';
      const tagV = item.isVegan ? '<span style="font-size:0.75rem" title="Vegan Friendly">🌿</span>' : '';
      const tagGF = item.isGF ? '<span style="font-size:0.75rem" title="Senza Glutine">🌾</span>' : '';
      return `
      <div class="menu-item ${dClass} ${isV} ${isGF}">
        <div class="mi-info">
          <div class="mi-name">${item.name} ${tagV} ${tagGF}</div>
          ${item.desc ? `<div class="mi-desc">${item.desc}</div>` : ""}
        </div>
        <div class="mi-price">${item.price}</div>
      </div>`;
    }).join("");
    return `<div class="menu-panel ${i === 0 ? "active" : ""}" id="panel-${k}">${items}</div>`;
  }).join("");

  // Costruzione Pannello Recensioni
  const reviewsHTML = r.reviewsList ? r.reviewsList.map(rev => `
    <div class="review-card">
      <div class="rev-avatar">👤</div>
      <div class="rev-body">
        <div class="rev-header">
          <strong>${rev.user}</strong>
          <span class="rev-date">${rev.date}</span>
        </div>
        <div class="rev-stars">${rev.stars}</div>
        <div class="rev-text">"${rev.text}"</div>
      </div>
    </div>
  `).join("") : "";

  document.getElementById("modalContent").innerHTML = `
    <div class="m-header">
      <div class="m-top-row">
        <div class="m-cat">${r.cat.toUpperCase()}</div>
        ${r.badge ? `<div class="m-badge">${r.badge}</div>` : ''}
        <button class="m-share-btn" onclick="shareRestaurant(${r.id})">📤 Condividi</button>
      </div>
      <div class="m-name">${r.emoji} ${r.name}</div>
      <div class="m-meta">
        <span class="m-meta-item">📍 ${r.address}</span>
        <span class="m-meta-item">📞 ${r.phone}</span>
        <span class="m-meta-item">✉️ ${r.email}</span>
        <span class="m-meta-item">🕐 ${r.orari}</span>
        <span class="m-meta-item">${r.stars}</span>
        <span class="m-meta-item">💶 ${r.avgPrice}</span>
        ${r.website ? `<a href="${r.website}" target="_blank" class="m-meta-item website-link">🌐 SITO UFFICIALE</a>` : ''}
        
        ${r.form_available ?
      `<button class="m-book-action" onclick="openBooking(${r.id})" ${r.postiDisponibili <= 0 ? 'disabled' : ''}>
             ${r.postiDisponibili > 0 ? '📅 PRENOTA UN TAVOLO' : '❌ ESAURITO'}
           </button>`
      : ''}

      </div>
      <div class="m-desc">${r.desc}</div>
      ${r.specialita && r.specialita.length ? `
      <div class="m-specialita">
        <div class="m-spec-label">🏅 Piatti Firma del Locale</div>
        ${r.specialita.map(s => `<div class="m-spec-item">✦ ${s}</div>`).join('')}
      </div>` : ''}
      <div class="m-servizi-row">
        ${r.atmosfera ? `<span class="m-tag m-atmo">${r.atmosfera}</span>` : ''}
        ${r.veganFriendly ? '<span class="m-tag m-vegan">🌿 Vegan Friendly</span>' : ''}
        ${r.glutenFree ? '<span class="m-tag m-gf">🌾 Senza Glutine</span>' : ''}
        ${r.servizi?.dehor ? '<span class="m-tag m-serv">🌤️ Dehors</span>' : ''}
        ${r.servizi?.parcheggio ? '<span class="m-tag m-serv">🅿️ Parcheggio</span>' : ''}
        ${r.servizi?.wiFi ? '<span class="m-tag m-serv">📶 WiFi Gratuito</span>' : ''}
        ${r.servizi?.accessibileDisabili ? '<span class="m-tag m-serv">♿ Accessibile</span>' : ''}
        ${r.servizi?.animaliAmmessi ? '<span class="m-tag m-serv">🐾 Pet Friendly</span>' : ''}
      </div>
      <div class="m-map-embed">
        <iframe width="100%" height="280" style="border:0; border-radius:12px; margin-top:20px;" loading="lazy" allowfullscreen 
          src="https://maps.google.com/maps?q=${r.lat},${r.lng}+(${encodeURIComponent(r.name)})&t=&z=16&ie=UTF8&iwloc=B&output=embed">
        </iframe>
      </div>
    </div>
    <div class="dietary-toggles">
      <label class="dt-label"><input type="checkbox" id="dtVegan" onchange="toggleDietary()"> 🌿 Focus Vegan</label>
      <label class="dt-label"><input type="checkbox" id="dtGF" onchange="toggleDietary()"> 🌾 Focus Senza Glutine</label>
    </div>
    <div class="menu-tabs">${tabsHTML}</div>
    <div class="menu-body">
      ${panelsHTML}
      <div class="menu-panel" id="panel-recensioni">
        <div class="reviews-summary">
          ⭐ <strong>${r.rating} / 5</strong> - Basato su ${r.reviewsCount} recensioni TripAdvisor
        </div>
        ${reviewsHTML}
      </div>
    </div>`;

  const overlay = document.getElementById("modal");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

window.toggleDietary = function () {
  const vChecked = document.getElementById("dtVegan").checked;
  const gfChecked = document.getElementById("dtGF").checked;
  document.querySelectorAll(".menu-item").forEach(item => {
    let show = true;
    if (vChecked && !item.classList.contains("is-vegan")) show = false;
    if (gfChecked && !item.classList.contains("is-gf")) show = false;
    item.style.display = show ? "flex" : "none";
  });
}

function switchTab(key, btn) {
  document.querySelectorAll(".menu-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".menu-panel").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  const panel = document.getElementById("panel-" + key);
  if (panel) panel.classList.add("active");
}

// ── CLOSE MODAL ──
function closeModal() {
  document.getElementById("modal").classList.remove("open");
  document.body.style.overflow = "";
}
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ── FILTERS ──
function applyFilters() {
  const cat = document.querySelector(".filter-btn.active")?.dataset.cat || "all";
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const sort = document.getElementById("sortSelect")?.value || "default";

  let filtered = RESTAURANTS.filter(r => {
    const matchCat = cat === "all" || (cat === "preferiti" ? favorites.includes(r.id) : r.cat === cat);
    let matchQ = !q || r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);

    r._matchedDish = null;
    if (!matchQ && q) {
      for (const k in r.menu) {
        for (const item of r.menu[k]) {
          if (item.name.toLowerCase().includes(q) || (item.desc && item.desc.toLowerCase().includes(q))) {
            matchQ = true;
            r._matchedDish = item.name;
            break;
          }
        }
        if (matchQ) break;
      }
    }
    return matchCat && matchQ;
  });

  if (sort === "dist_asc") {
    filtered.sort((a, b) => getDistance(USER_LOC.lat, USER_LOC.lng, a.lat, a.lng) - getDistance(USER_LOC.lat, USER_LOC.lng, b.lat, b.lng));
  } else if (sort === "price_asc") {
    const getP = str => parseInt(str.replace(/[^0-9]/g, '')) || 0;
    filtered.sort((a, b) => getP(a.avgPrice) - getP(b.avgPrice));
  } else if (sort === "rating_desc") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  renderCards(filtered);
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
  });
});

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("sortSelect")?.addEventListener("change", applyFilters);

// ── INIT ──
function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  themeToggle?.addEventListener("click", () => {
    if (document.documentElement.getAttribute("data-theme") === "dark") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  });
}

function initWeather() {
  const weatherTypes = [
    { icon: "🌤️", desc: "Oggi c'è il sole! Scopri i locali con Dehors all'aperto." },
    { icon: "🌧️", desc: "Giornata uggiosa. Rifugiati in un locale accogliente e caldo." },
    { icon: "🌥️", desc: "Nuvoloso ma piacevole! Ottimo per una passeggiata in centro." }
  ];
  const w = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
  document.getElementById("weatherIcon").textContent = w.icon;
  document.getElementById("weatherDesc").textContent = w.desc;
  document.getElementById("weatherWidget").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initWeather();
  setTimeout(() => showToast("Database sincronizzato con Supabase", "🔄"), 800);
  
  // Caricamento iniziale (es. Reggio Emilia)
  caricaLocali("Reggio Emilia");

  renderRecentVisits();

  // Setta la data di oggi per simulare l'aggiornamento
  const oggi = new Date().toLocaleDateString("it-IT");
  document.getElementById("last-update-bar").innerHTML = `🔄 Ultimo aggior. server: <strong>${oggi} 00:00</strong>`;

  // ── HAMBURGER MENU ──
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileNavOverlay = document.getElementById("mobileNavOverlay");
  const mobileNavClose = document.getElementById("mobileNavClose");
  const searchInputMobile = document.getElementById("searchInputMobile");
  const sortSelectMobile = document.getElementById("sortSelectMobile");

  function openMobileNav() {
    mobileNavOverlay.classList.add("open");
    mobileNavOverlay.setAttribute("aria-hidden", "false");
    hamburgerBtn.classList.add("open");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMobileNav() {
    mobileNavOverlay.classList.remove("open");
    mobileNavOverlay.setAttribute("aria-hidden", "true");
    hamburgerBtn.classList.remove("open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  hamburgerBtn?.addEventListener("click", openMobileNav);
  mobileNavClose?.addEventListener("click", closeMobileNav);
  mobileNavOverlay?.addEventListener("click", (e) => {
    if (e.target === mobileNavOverlay) closeMobileNav();
  });

  // Sync mobile search → desktop search
  searchInputMobile?.addEventListener("input", () => {
    const desktopInput = document.getElementById("searchInput");
    if (desktopInput) desktopInput.value = searchInputMobile.value;
    applyFilters();
  });

  // Sync mobile sort → desktop sort
  sortSelectMobile?.addEventListener("change", () => {
    const desktopSort = document.getElementById("sortSelect");
    if (desktopSort) desktopSort.value = sortSelectMobile.value;
    applyFilters();
  });

  // Mobile filter buttons
  document.querySelectorAll(".mobile-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mobile-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Sync desktop filter buttons
      const cat = btn.dataset.cat;
      document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.cat === cat);
      });

      applyFilters();
      closeMobileNav();
    });
  });
});


// ── MAPPA HERO – Leaflet + OpenStreetMap (gratuito, nessuna API key) ──
// ── MAPPA HERO – Leaflet + OpenStreetMap ──
function initHeroMap() {
  const mapEl = document.getElementById("heroMap");
  if (!mapEl || typeof L === "undefined") return;

  const center = [44.6989, 10.6297];
  heroMap = L.map("heroMap", {
    center: center,
    zoom: 12,
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: true,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(heroMap);

  markerLayer = L.layerGroup().addTo(heroMap);

  const youIcon = L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;background:#007aff;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 6px rgba(0,122,255,0.25);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
  let userMarker = L.marker(center, { icon: youIcon, zIndexOffset: 1000 })
    .addTo(heroMap)
    .bindPopup("<strong style='font-family:Plus Jakarta Sans;'>📍 Tu sei qui</strong>");

  heroMap.on('click', (e) => {
    USER_LOC = { lat: e.latlng.lat, lng: e.latlng.lng };
    userMarker.setLatLng(e.latlng);
    userMarker.bindPopup("<strong style='font-family:Plus Jakarta Sans;'>📍 Tu sei qui</strong><br><span style='font-size:0.8rem;'>Posizione personalizzata</span>").openPopup();
    heroMap.panTo(e.latlng);
    showToast("Posizione aggiornata! Distanze ricalcolate.", "📍");
    applyFilters();
  });

  const vicinoAMeBtn = document.getElementById("vicinoAMeBtn");
  if (vicinoAMeBtn) {
    vicinoAMeBtn.addEventListener("click", () => {
      if (navigator.geolocation) {
        vicinoAMeBtn.innerHTML = "⏳ Ricerca...";
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            heroMap.setView([lat, lng], 14);
            userMarker.setLatLng([lat, lng]);
            userMarker.openPopup();
            vicinoAMeBtn.innerHTML = "📍 Posizione trovata";
            setTimeout(() => vicinoAMeBtn.innerHTML = "📍 Vicino a me", 3000);
          },
          (err) => {
            alert("Permesso posizione negato o errore.");
            vicinoAMeBtn.innerHTML = "📍 Vicino a me";
          }
        );
      } else {
        alert("Geolocalizzazione non supportata.");
      }
    });
  }

  updateMapMarkers(RESTAURANTS);

  mapEl.addEventListener("click", () => heroMap.scrollWheelZoom.enable());
  mapEl.addEventListener("mouseleave", () => heroMap.scrollWheelZoom.disable());
}

function updateMapMarkers(data) {
  if (!markerLayer) return;
  markerLayer.clearLayers();

  const catColors = {
    ristorante: "#c9932e",
    osteria: "#c0392b",
    pizzeria: "#e65100",
    pasticceria: "#ad1457",
    bar: "#00897b",
  };

  data.forEach(r => {
    if (!r.lat || !r.lng) return;
    const color = catColors[r.cat] || "#c9932e";
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:36px;height:36px;background:${color};border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 12px rgba(0,0,0,0.5);cursor:pointer;transition:transform .2s;">${r.emoji || "🍽"}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20],
    });

    const popup = L.popup({ maxWidth: 230, className: "leaflet-custom-popup" }).setContent(`
      <div style="font-family:'Inter',sans-serif;padding:4px;">
        <div style="font-size:1.05rem;font-weight:700;color:#1a1208;margin-bottom:4px;">${r.emoji} ${r.name}</div>
        <div style="font-size:0.8rem;color:#6a4a2a;margin-bottom:2px;">📍 ${r.city}</div>
        <div style="font-size:0.8rem;color:#6a4a2a;margin-bottom:8px;letter-spacing:1px;">${r.stars} &nbsp;·&nbsp; 💶 ${r.avgPrice}</div>
        <button onclick="openModal(${r.id})" style="background:#c9932e;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:0.82rem;font-weight:700;cursor:pointer;width:100%;font-family:'Inter',sans-serif;">🍴 Vedi Menu</button>
      </div>
    `);

    L.marker([r.lat, r.lng], { icon }).addTo(markerLayer).bindPopup(popup);
  });
}

// ── SUPABASE FETCHING ──
async function caricaLocali(cittaSelezionata) {
  showToast(`Caricamento locali di ${cittaSelezionata}...`, "⏳");
  
  let { data: supabaseData, error } = await _supabase
    .from('ristoranti')
    .select('*')
    .eq('citta', cittaSelezionata);

  if (error) {
    console.error("Errore nel caricamento:", error);
    showToast("Errore database. Uso dati locali.", "⚠️");
    // Fallback: usa i dati locali filtrati per città
    const locali = RESTAURANTS.filter(r =>
      r.city && r.city.toLowerCase().includes(cittaSelezionata.toLowerCase())
    );
    disegnaMappa(locali.length > 0 ? locali : RESTAURANTS);
    return;
  }

  // Supabase usa "nome" e "citta" → incrocia con i dati locali generati
  // per ottenere tutte le proprietà (menu, emoji, cat, stars, ecc.)
  const nomiDaSupabase = supabaseData.map(r => (r.nome || r.name || "").toLowerCase().trim());

  // Cerca corrispondenze nei dati locali già generati
  let trovati = RESTAURANTS.filter(r =>
    nomiDaSupabase.includes((r.name || "").toLowerCase().trim())
  );

  // Se non trova corrispondenze per nome, filtra per città
  if (trovati.length === 0) {
    trovati = RESTAURANTS.filter(r =>
      r.city && r.city.toLowerCase().includes(cittaSelezionata.toLowerCase())
    );
  }

  // Se ancora niente, costruisce oggetti minimi dai dati Supabase
  if (trovati.length === 0) {
    trovati = supabaseData.map((r, i) => ({
      id: r.id || (9000 + i),
      name: r.nome || r.name || "Locale",
      city: r.citta || r.city || cittaSelezionata,
      lat: r.lat,
      lng: r.lng,
      cat: r.cat || "ristorante",
      emoji: r.emoji || "🍽️",
      stars: "★★★★☆",
      avgPrice: "€25–45",
      address: r.indirizzo || "Indirizzo non disponibile",
      phone: "N/D",
      email: "N/D",
      orari: "12:00–15:00 · 19:00–23:30",
      desc: "Locale disponibile su Supabase.",
      rating: 4.0,
      reviewsCount: 0,
      reviewsList: [],
      specialita: [],
      badge: null,
      atmosfera: "Informale",
      veganFriendly: false,
      glutenFree: false,
      servizi: { dehor: false, parcheggio: false, wiFi: false, animaliAmmessi: false },
      image: "ristorante_bg.png",
      occupancy: 50,
      menu: { primi: [{ name: "Menu in aggiornamento", price: "—" }] },
      form_available: false,
      postiDisponibili: 0,
      topReview: "",
      website: "",
    }));
  }

  RESTAURANTS = trovati;
  disegnaMappa(trovati);
  showToast(`${trovati.length} locali caricati da Supabase`, "✅");
}

function disegnaMappa(ristoranti) {
  // Svuota e ri-renderizza la griglia
  renderCards(ristoranti);
  // Aggiorna i puntini sulla mappa
  updateMapMarkers(ristoranti);
  // Centra la mappa se ci sono locali
  if (ristoranti.length > 0 && heroMap) {
    const group = L.featureGroup(ristoranti.map(r => L.marker([r.lat, r.lng])));
    heroMap.fitBounds(group.getBounds().pad(0.1));
  }
  const countEl = document.getElementById("countRest");
  if (countEl) countEl.textContent = ristoranti.length;
}

// Avvia la mappa quando il DOM è pronto
document.addEventListener("DOMContentLoaded", initHeroMap);

// ── AI CHATBOT VIRTUAL SOMMELIER ──
const chatFab = document.getElementById("chatbot-fab");
const chatWindow = document.getElementById("chatbot-window");
const chatClose = document.getElementById("chatbot-close");
const chatInput = document.getElementById("chat-input-text");
const chatSend = document.getElementById("chat-send-btn");
const chatMsgs = document.getElementById("chatbot-messages");
const chatTyping = document.getElementById("chat-typing");
const chatOverlay = document.getElementById("chatbot-overlay");

function openChat() {
  chatOverlay.classList.remove("hidden");
  chatWindow.classList.remove("hidden");
  chatInput.focus();
}

function closeChat() {
  chatOverlay.classList.add("hidden");
  chatWindow.classList.add("hidden");
}

chatFab.addEventListener("click", openChat);
chatClose.addEventListener("click", closeChat);
chatOverlay.addEventListener("click", closeChat);

// Used by the Quick Reply buttons in HTML
window.sendQuickReply = function (text) {
  chatInput.value = text;
  processChat();
};

function scrollToBottom() {
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function addChatMsg(text, isUser, suggestionIds = null) {
  const row = document.createElement("div");
  row.className = `msg-row ${isUser ? 'user-row' : 'ai-row'}`;

  const avatarHtml = isUser ? `<div class="msg-avatar">👤</div>` : `<div class="msg-avatar">🤖</div>`;

  let msgContent = `<div class="msg ${isUser ? 'user-msg' : 'ai-msg'}">${text}</div>`;

  if (isUser) {
    row.innerHTML = msgContent + avatarHtml;
  } else {
    row.innerHTML = avatarHtml + msgContent;
  }

  const msgDiv = row.querySelector('.msg');

  if (suggestionIds && !isUser) {
    // Se è un array di id (Multi-card)
    let ids = Array.isArray(suggestionIds) ? suggestionIds : [suggestionIds];

    ids.forEach(id => {
      const r = RESTAURANTS.find(x => x.id === id);
      if (r) {
        const card = document.createElement("div");
        card.className = "chat-sugg-card";
        card.onclick = () => { openModal(r.id); chatWindow.classList.add("hidden"); };

        const ratingColor = parseFloat(r.rating) >= 4.5 ? '#2d8a39' : '#c9933a';

        card.innerHTML = `
          <div class="chat-sugg-icon">${r.emoji}</div>
          <div class="chat-sugg-info">
            <div class="chat-sugg-title">${r.name}</div>
            <div class="chat-sugg-meta">
              📍 ${r.city} • 💶 ${r.avgPrice}<br>
              <span style="color:${ratingColor};font-weight:700;">${r.rating}/5</span> su ${r.reviewsCount} recensioni
            </div>
          </div>
        `;
        msgDiv.appendChild(card);
      }
    });
  }

  chatMsgs.appendChild(row);
  scrollToBottom();
}

function handleAiResponse(query) {
  chatTyping.classList.add("hidden");

  const q = query.toLowerCase().trim();

  // 0. Controllo Off-Topic
  const offTopicKeywords = ["macchina", "calcio", "meteo", "ripara", "computer", "politica", "soldi", "scuola", "compiti", "film", "tv", "sport", "telefono"];
  if (offTopicKeywords.some(k => q.includes(k))) {
    addChatMsg("Scusa, non ho capito. Sono il Sommelier Virtuale e posso aiutarti solo a trovare il miglior ristorante, pizzeria o locale per le tue esigenze. Dimmi cosa vorresti mangiare o in quale città ti trovi!", false);
    return;
  }

  const isVago = q.length < 5 || q === "ciao" || q.includes("ho fame") || q.includes("consigli") || q.includes("aiuto") || q.includes("come stai");

  // Specific match: controlliamo se il nome base (es. "Sorbillo" ignorando "Napoli") è nella query
  const specificMatch = RESTAURANTS.find(r => {
    let baseName = r.name.toLowerCase().split(' ')[0];
    return baseName.length > 3 && q.includes(baseName);
  });

  // 1. Dettagli Specifici (TripAdvisor) su Ristorante
  if (specificMatch && (q.includes("info") || q.includes("recension") || q.includes("vota") || q.includes("voto") || q.includes("tripadvisor") || q.includes("dati") || q.includes("dimmi"))) {
    addChatMsg(`Certamente! Ecco i dati TripAdvisor per <strong>${specificMatch.name}</strong> a ${specificMatch.city}.<br><br>🌟 <strong>${specificMatch.rating}/5</strong> (su ${specificMatch.reviewsCount} recensioni)<br><br>💬 Dicono di loro: <br><em>"${specificMatch.topReview}"</em><br><br>Clicca la scheda per prenotare.`, false, [specificMatch.id]);
    return;
  }

  // 2. Query Vaga -> Tre scelte random spettacolari
  if (isVago) {
    const misti = [...RESTAURANTS].sort(() => 0.5 - Math.random()).slice(0, 3).map(r => r.id);
    addChatMsg("Sembri indeciso! Ecco **3 tra i nostri locali meglio recensiti** su TripAdvisor per ispirarti:", false, misti);
    return;
  }

  // 3. MOTORE DI RICERCA SEMANTICA STRICT
  let matches = RESTAURANTS;
  let hasFoodOrCatFilter = false;

  // A) Filtri Categoria Assoluti (Singolari e Plurali)
  if (q.includes("pizza") || q.includes("pizzeria") || q.includes("pizzerie") || q.includes("margherita")) {
    matches = matches.filter(r => r.cat === "pizzeria");
    hasFoodOrCatFilter = true;
  } else if (q.includes("dolce") || q.includes("pasticceria") || q.includes("pasticcerie") || q.includes("gelato") || q.includes("cornetto")) {
    matches = matches.filter(r => r.cat === "pasticceria");
    hasFoodOrCatFilter = true;
  } else if (q.includes("bar") || q.includes("aperitivo") || q.includes("cocktail") || q.includes("spritz") || q.includes("tapas")) {
    matches = matches.filter(r => r.cat === "bar");
    hasFoodOrCatFilter = true;
  } else if (q.includes("osteria") || q.includes("osterie") || q.includes("trattoria") || q.includes("trattorie") || q.includes("nonna")) {
    matches = matches.filter(r => r.cat === "osteria");
    hasFoodOrCatFilter = true;
  } else if (q.includes("ristorante") || q.includes("ristoranti") || q.includes("gourmet")) {
    matches = matches.filter(r => r.cat === "ristorante");
    hasFoodOrCatFilter = true;
  }

  // B) Filtri Cibo Specifico e Lifestyle (se non ha matchato la categoria pura)
  if (!hasFoodOrCatFilter) {
    if (q.includes("pesce") || q.includes("mare") || q.includes("sushi")) {
      matches = matches.filter(r => JSON.stringify(r.menu).toLowerCase().includes("pesce") || r.desc.toLowerCase().includes("mare") || JSON.stringify(r.menu).toLowerCase().includes("gamber"));
      hasFoodOrCatFilter = true;
    } else if (q.includes("carne") || q.includes("bistecca") || q.includes("grigliata")) {
      matches = matches.filter(r => JSON.stringify(r.menu).toLowerCase().includes("bistecca") || JSON.stringify(r.menu).toLowerCase().includes("carne") || r.desc.toLowerCase().includes("carne"));
      hasFoodOrCatFilter = true;
    } else if (q.includes("vegano") || q.includes("vegan") || q.includes("vegetariano")) {
      matches = matches.filter(r => r.veganFriendly);
      hasFoodOrCatFilter = true;
    } else if (q.includes("celiaco") || q.includes("glutine") || q.includes("senza glutine")) {
      matches = matches.filter(r => r.glutenFree);
      hasFoodOrCatFilter = true;
    }
  }

  // C) Ricerca Testuale (Solo se non c'è già un filtro Categoria/Cibo forte)
  if (!hasFoodOrCatFilter) {
    matches = matches.filter(r => r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q));
  }

  // D) Modificatori Addizionali (applicati cumulativamente)
  if (q.includes("economico") || q.includes("studenti")) {
    matches = matches.filter(r => parseInt(r.avgPrice.replace(/[^0-9]/g, '').substring(0, 2)) <= 20 || r.cat === 'pizzeria' || r.cat === 'bar');
  }
  if (q.includes("romantica") || q.includes("elegante") || q.includes("lusso") || q.includes("anniversario")) {
    matches = matches.filter(r => r.stars === '★★★★★' || r.stars === '★★★★☆');
  }
  if (q.includes("dehor") || q.includes("terrazza") || q.includes("esterno") || q.includes("all'aperto") || q.includes("aria aperta")) {
    matches = matches.filter(r => r.servizi?.dehor);
  }
  if (q.includes("parcheggio") || q.includes("posteggio")) {
    matches = matches.filter(r => r.servizi?.parcheggio);
  }
  if (q.includes("wifi") || q.includes("wi-fi") || q.includes("smartwork") || q.includes("smart work")) {
    matches = matches.filter(r => r.servizi?.wiFi);
  }
  if (q.includes("animali") || q.includes("cane") || q.includes("pet friendly") || q.includes("portare il cane")) {
    matches = matches.filter(r => r.servizi?.animaliAmmessi);
  }
  if (q.includes("michelin") || q.includes("stella michelin")) {
    matches = matches.filter(r => r.badge && r.badge.toLowerCase().includes("michelin"));
  }
  if (q.includes("gambero rosso")) {
    matches = matches.filter(r => r.badge && r.badge.toLowerCase().includes("gambero"));
  }

  // E) Estrazione automatica CITTÀ (Forza il match della città)
  const allCities = [...new Set(RESTAURANTS.map(r => r.city.toLowerCase()))];
  for (let c of allCities) {
    if (q.includes(c)) {
      matches = matches.filter(r => r.city.toLowerCase() === c);
      break; // fermati alla prima città trovata
    }
  }

  // 4. ELABORAZIONE FINALE DELLA RISPOSTA
  if (matches.length > 0) {
    if (matches.length === 1) {
      const top = matches[0];
      addChatMsg(`Perfetto, ho una scelta miratissima per te! Ecco <strong>${top.name}</strong> a ${top.city}.`, false, [top.id]);
    } else {
      // Prendi fino a 3 migliori (Ordinati per r.rating discendente simulato e presi a caso tra i top)
      const scelti = matches.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 3);
      const ids = scelti.map(r => r.id);
      addChatMsg(`Assolutamente! Ho trovato ${matches.length} locali fantastici. Ecco la mia <strong>Top ${ids.length}</strong> in base a quello che cerchi:`, false, ids);
    }
  } else {
    // Non ha trovato nulla
    addChatMsg(`Non ho capito bene la tua richiesta, oppure non ho trovato nessun locale con queste caratteristiche. Prova a chiedermi una tipologia di piatto (es. "Pizza"), un'atmosfera o una città!`, false);
  }
}

function processChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  addChatMsg(text, true);
  chatInput.value = "";

  // Show typing indicator
  chatMsgs.appendChild(chatTyping); // move it to the bottom
  chatTyping.classList.remove("hidden");
  scrollToBottom();

  // Fake thinking delay for realism
  const thinkingTime = Math.random() * 800 + 800; // 800-1600ms
  setTimeout(() => handleAiResponse(text), thinkingTime);
}

chatSend.addEventListener("click", processChat);
chatInput.addEventListener("keydown", (e) => { if (e.key === "Enter") processChat(); });

// ── SISTEMA PRENOTAZIONI ──
const bookModal = document.getElementById("bookModal");
const bookClose = document.getElementById("bookClose");
const bookForm = document.getElementById("bookForm");
const bookRestName = document.getElementById("bookRestName");
let currentBookingRestId = null;

window.openBooking = function (id) {
  const r = RESTAURANTS.find(x => x.id === id);
  if (!r) return;
  currentBookingRestId = r.id;
  bookRestName.innerHTML = `Prenota da <strong>${r.name}</strong>`;
  bookForm.reset();
  bookModal.classList.add("open");
};

bookClose.addEventListener("click", () => bookModal.classList.remove("open"));

bookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const guests = parseInt(document.getElementById("bookGuests").value, 10);

  const r = RESTAURANTS.find(x => x.id === currentBookingRestId);
  if (!r) return;

  if (guests > r.postiDisponibili) {
    showToast(`Spiacenti, il locale ha a disposizione solo ${r.postiDisponibili} posti in questo orario.`, "⚠️");
    return;
  }

  // Conferma
  r.postiDisponibili -= guests;
  showToast(`La richiesta per ${guests} persone è stata inviata a ${r.name}.`, "✔️");
  bookModal.classList.remove("open");

  // Ricarica la vista modal e le cards per mostrare i posti scalati
  openModal(r.id);
  applyFilters();
});

// ══════════════════════════════════════════════
// FEATURE 1 – 🎤 VOICE INPUT (Rimosso, gestito in premium_effects.js)
// ══════════════════════════════════════════════


// ══════════════════════════════════════════════
// FEATURE 2 – 🧾 CART / ORDER SIMULATOR
// ══════════════════════════════════════════════
let cart = []; // { id, name, price, qty, restId }

function cartTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const countEl = document.getElementById("cartCount");
  const fab = document.getElementById("cartFab");
  if (!itemsEl) return;

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  if (countEl) countEl.textContent = totalItems;
  if (fab) fab.classList.toggle("hidden", totalItems === 0);

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Nessun piatto aggiunto.<br>Clicca su un piatto del menu per aggiungerlo!</p>';
  } else {
    itemsEl.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="ci-name">${item.name}</div>
        <div class="ci-qty">
          <button onclick="changeQty(${idx}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${idx}, 1)">+</button>
        </div>
        <div class="ci-price">€ ${(item.price * item.qty).toFixed(2)}</div>
      </div>
    `).join("");
  }

  if (totalEl) totalEl.textContent = "€ " + cartTotal().toFixed(2).replace(".", ",");
}

window.changeQty = function(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
};

window.addToCart = function(name, priceStr) {
  const price = parseFloat(priceStr.replace("€", "").replace(",", ".").trim());
  if (isNaN(price)) return;
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  renderCart();
  showToast(`"${name}" aggiunto al conto!`, "🛒");

  // Show sidebar
  const sidebar = document.getElementById("cartSidebar");
  if (sidebar) {
    sidebar.classList.remove("hidden");
    document.body.classList.add("cart-open");
  }
};

window.checkoutCart = function() {
  if (cart.length === 0) { showToast("Nessun piatto nel carrello!", "⚠️"); return; }
  const total = cartTotal().toFixed(2);
  showToast(`Ordine inviato! Totale: €${total}. Il locale ti contatterà a breve.`, "✅");
  cart = [];
  renderCart();
  document.getElementById("cartSidebar")?.classList.add("hidden");
  document.body.classList.remove("cart-open");
};

// Cart FAB toggle
document.getElementById("cartFab")?.addEventListener("click", () => {
  document.getElementById("cartSidebar")?.classList.toggle("hidden");
  document.body.classList.toggle("cart-open");
});
document.getElementById("cartClose")?.addEventListener("click", () => {
  document.getElementById("cartSidebar")?.classList.add("hidden");
  document.body.classList.remove("cart-open");
});

// Patch openModal to inject add-to-cart buttons in menu items
const _origOpenModal = window.openModal || openModal;
// Override: add "+" button to each menu item after modal renders
const _origRenderModal = openModal;
// We override the panelsHTML generation by patching renderMenuItems in openModal
// via MutationObserver on modalContent
const cartObserver = new MutationObserver(() => {
  document.querySelectorAll(".menu-item").forEach(el => {
    if (el.querySelector(".mi-add-btn")) return; // already has button
    const nameEl = el.querySelector(".mi-name");
    const priceEl = el.querySelector(".mi-price");
    if (!nameEl || !priceEl) return;
    const name = nameEl.textContent.replace(/[🌿🌾]/g, "").trim();
    const price = priceEl.textContent.trim();
    if (!price.includes("€")) return; // skip items without price

    const btn = document.createElement("button");
    btn.className = "mi-add-btn";
    btn.textContent = "+ Aggiungi";
    btn.onclick = (e) => {
      e.stopPropagation();
      addToCart(name, price);
      btn.classList.add("added");
      btn.textContent = "✓ Aggiunto";
      setTimeout(() => { btn.classList.remove("added"); btn.textContent = "+ Aggiungi"; }, 1800);
    };
    // Insert button after price
    priceEl.parentElement.insertBefore(btn, priceEl.nextSibling);
  });
});
const modalContent = document.getElementById("modalContent");
if (modalContent) cartObserver.observe(modalContent, { childList: true, subtree: true });

// ══════════════════════════════════════════════
// FEATURE 3 – 🖼️ PREMIUM GALLERY (Rimosso come da richiesta)
// ══════════════════════════════════════════════

// ── TIME WIDGET (Orario Dinamico) ──
function updateTimeWidget() {
  const twClock = document.getElementById('twClock');
  const twIcon = document.getElementById('twIcon');
  const twTitle = document.getElementById('twTitle');
  const twSubtitle = document.getElementById('twSubtitle');
  if (!twClock || !twIcon || !twTitle || !twSubtitle) return;

  const now = new Date();
  twClock.textContent = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const hour = now.getHours();

  if (hour >= 6 && hour < 11) {
    twIcon.textContent = '☕';
    twTitle.textContent = "È l'ora della Colazione!";
    twSubtitle.textContent = "Inizia la giornata con un buon caffè e cornetto";
  } else if (hour >= 11 && hour < 15) {
    twIcon.textContent = '🍝';
    twTitle.textContent = "È l'ora del Pranzo!";
    twSubtitle.textContent = "Pausa pranzo perfetta tra ristoranti e trattorie";
  } else if (hour >= 15 && hour < 18) {
    twIcon.textContent = '🍰';
    twTitle.textContent = "Pausa Merenda!";
    twSubtitle.textContent = "Un dolcetto o un caffè per ricaricarsi";
  } else if (hour >= 18 && hour < 21) {
    twIcon.textContent = '🍸';
    twTitle.textContent = "È l'ora dell'Aperitivo!";
    twSubtitle.textContent = "Orario magico — aperitivi, tapas e cocktail in città";
  } else if (hour >= 21 || hour < 3) {
    twIcon.textContent = '🍷';
    twTitle.textContent = "È l'ora della Cena!";
    twSubtitle.textContent = "Atmosfera serale per cene indimenticabili";
  } else {
    twIcon.textContent = '🌙';
    twTitle.textContent = "Spuntino Notturno!";
    twSubtitle.textContent = "I locali aperti fino a tardi per i nottambuli";
  }
}
setInterval(updateTimeWidget, 1000);
document.addEventListener("DOMContentLoaded", updateTimeWidget);
// ── LIVE PULSE NOTIFICATIONS ──
function initLivePulse() {
  const pulseContainer = document.createElement('div');
  pulseContainer.id = 'live-pulse-container';
  Object.assign(pulseContainer.style, {
    position: 'fixed', bottom: '20px', left: '20px',
    display: 'flex', flexDirection: 'column', gap: '10px',
    zIndex: '10000', pointerEvents: 'none'
  });
  document.body.appendChild(pulseContainer);

  const events = [
    { type: 'review', icon: '⭐', text: "ha ricevuto una nuova recensione 5 stelle" },
    { type: 'booking', icon: '📅', text: "ha appena ricevuto una prenotazione" },
    { type: 'view', icon: '👀', text: "è molto richiesto proprio ora" }
  ];

  function spawnPulse() {
    if(!window.RESTAURANTS || RESTAURANTS.length === 0) return;
    const r = RESTAURANTS[Math.floor(Math.random() * RESTAURANTS.length)];
    const ev = events[Math.floor(Math.random() * events.length)];

    const toast = document.createElement('div');
    Object.assign(toast.style, {
      background: 'rgba(20, 13, 7, 0.95)',
      color: '#fff', padding: '12px 18px', borderRadius: '12px',
      border: '1px solid rgba(201, 147, 58, 0.3)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: '0.85rem', width: '280px',
      transform: 'translateX(-120%)', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: '0'
    });
    toast.innerHTML = `<div style="font-size:0.75rem; color:#aaa; margin-bottom:4px;">Proprio ora</div>
      <div>${ev.icon} <strong>${r.name}</strong> ${ev.text}</div>`;
    
    pulseContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    }, 100);

    // Animate out
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 4000);

    // Schedule next
    setTimeout(spawnPulse, Math.random() * 8000 + 4000);
  }

  // Start after a delay
  setTimeout(spawnPulse, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initLivePulse, 1000);
});
