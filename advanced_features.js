/* ================================================================
   GUIDA RISTORANTI D'ITALIA – advanced_features.js
   ================================================================
   1. 🗺️  Mappa Avanzata "Esplora Vicino a Me"
      - Clustering marker (cerchio con numero)
      - Filtro categoria sulla mappa
      - Raggio di ricerca trascinabile
   2. 🔍  Ricerca Semantica Intelligente
      - Query tipo "romantico con vino sotto 30€"
      - Ricerca nei tag atmosfera, piatti, fascia prezzo
   3. 📊  Dashboard Statistiche Personali
      - Categorie visitate, città preferita, spesa media
   4. 🎨  Tema Stagionale Automatico
      - Palette autunno/inverno/primavera/estate
   ================================================================ */

/* ══════════════════════════════════════════════════════════════
   FEATURE 4 – 🎨 TEMA STAGIONALE AUTOMATICO
   (Va prima perché non dipende dal DOM)
══════════════════════════════════════════════════════════════ */
(function initSeasonalTheme() {
  const month = new Date().getMonth(); // 0-11

  const seasons = {
    // Inverno: Dic(11), Gen(0), Feb(1) — blu profondo, ghiaccio
    winter: {
      months: [11, 0, 1],
      label: 'Inverno ❄️',
      vars: {
        '--season-primary': '#1a3a5c',
        '--season-accent': '#5b9bd5',
        '--season-accent2': '#a8d4f5',
        '--season-warm': '#2a5280',
        '--season-bg-tint': 'rgba(26,58,92,0.04)',
        '--season-card-border': '#b8d4ea',
        '--season-hero-from': '#1a2e45',
        '--season-hero-to': '#2a4a70',
        '--season-badge': '#5b9bd5',
        '--season-badge-text': '#fff',
        '--season-filter-from': '#0f1f35',
        '--season-filter-to': '#1a3a5c',
      }
    },
    // Primavera: Mar(2), Apr(3), Mag(4) — rosa, verde tenero
    spring: {
      months: [2, 3, 4],
      label: 'Primavera 🌸',
      vars: {
        '--season-primary': '#b5467a',
        '--season-accent': '#e8729a',
        '--season-accent2': '#f9c6d8',
        '--season-warm': '#c1587a',
        '--season-bg-tint': 'rgba(181,70,122,0.04)',
        '--season-card-border': '#f0c0d8',
        '--season-hero-from': '#6b1a3a',
        '--season-hero-to': '#b5467a',
        '--season-badge': '#e8729a',
        '--season-badge-text': '#fff',
        '--season-filter-from': '#4a0f28',
        '--season-filter-to': '#9a3060',
      }
    },
    // Estate: Giu(5), Lug(6), Ago(7) — verde fresco, azzurro
    summer: {
      months: [5, 6, 7],
      label: 'Estate ☀️',
      vars: {
        '--season-primary': '#1a7a4a',
        '--season-accent': '#2ea868',
        '--season-accent2': '#a8e6c8',
        '--season-warm': '#1e8c50',
        '--season-bg-tint': 'rgba(26,122,74,0.04)',
        '--season-card-border': '#b0e0c8',
        '--season-hero-from': '#0f3d25',
        '--season-hero-to': '#1a6a40',
        '--season-badge': '#2ea868',
        '--season-badge-text': '#fff',
        '--season-filter-from': '#082816',
        '--season-filter-to': '#145c34',
      }
    },
    // Autunno: Set(8), Ott(9), Nov(10) — arancio caldo, terracotta
    autumn: {
      months: [8, 9, 10],
      label: 'Autunno 🍂',
      vars: {
        '--season-primary': '#c9632e',
        '--season-accent': '#e07840',
        '--season-accent2': '#f5c8a8',
        '--season-warm': '#b85828',
        '--season-bg-tint': 'rgba(201,99,46,0.05)',
        '--season-card-border': '#f0c8a0',
        '--season-hero-from': '#5c2a10',
        '--season-hero-to': '#9a4820',
        '--season-badge': '#e07840',
        '--season-badge-text': '#fff',
        '--season-filter-from': '#3a1808',
        '--season-filter-to': '#7a3818',
      }
    }
  };

  // Trova stagione corrente
  const currentSeason = Object.values(seasons).find(s => s.months.includes(month)) || seasons.autumn;

  // Applica CSS vars a :root
  const root = document.documentElement;
  Object.entries(currentSeason.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });

  // CSS stagionale
  const css = `
    /* ── SEASONAL THEME ENGINE ── */
    :root {
      --season-transition: all 0.4s ease;
    }

    /* Override accenti principali con stagione */
    .hero {
      background: linear-gradient(135deg, var(--season-hero-from, #2d1a08) 0%, var(--season-hero-to, #7a3a0e) 100%) !important;
    }
    .site-header {
      background: linear-gradient(135deg, var(--season-filter-from, #1a1208) 0%, var(--season-filter-to, #3a2008) 100%) !important;
    }
    .cta-btn {
      background: var(--season-accent, #c9932e) !important;
    }
    .cta-btn:hover {
      background: var(--season-primary, #a46f14) !important;
    }
    .filter-btn.active, .mobile-filter-btn.active {
      background: var(--season-accent, #c9932e) !important;
      border-color: var(--season-accent, #c9932e) !important;
    }
    .card-btn {
      background: var(--season-accent, #c9932e) !important;
    }
    .card-btn:hover {
      background: var(--season-primary, #a46f14) !important;
    }
    .menu-tab.active {
      background: var(--season-accent, #c9932e) !important;
    }

    /* Badge stagione in hero */
    .season-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.25);
      color: #fff;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      animation: seasonFadeIn 0.8s ease forwards;
    }
    @keyframes seasonFadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Seasonal subtle top border on cards */
    .card {
      border-top: 3px solid var(--season-card-border, #f0e0c0) !important;
    }
    .card:hover {
      border-top-color: var(--season-accent, #c9932e) !important;
    }

    /* Top credit bar seasonal tint */
    .top-credit-bar {
      background: var(--season-filter-from, #1a1208) !important;
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Inserisce badge stagione nella hero
  document.addEventListener('DOMContentLoaded', () => {
    const heroTag = document.querySelector('.hero-tag');
    if (heroTag) {
      const badge = document.createElement('div');
      badge.className = 'season-badge';
      badge.textContent = currentSeason.label;
      heroTag.parentNode.insertBefore(badge, heroTag);
    }
  });
})();


/* ══════════════════════════════════════════════════════════════
   FEATURE 2 – 🔍 RICERCA SEMANTICA INTELLIGENTE
   Comprende query tipo "romantico con vino rosso sotto 30€"
══════════════════════════════════════════════════════════════ */
(function initSemanticSearch() {
  // Dizionari semantici
  const SEMANTIC_MAP = {
    // Atmosfera
    atmosfera: {
      romantico: ['romantico', 'romantica', 'romantico', 'coppia', 'anniversario', 'amore', 'serata speciale', 'candele'],
      familiare: ['famiglia', 'familiare', 'bambini', 'kids', 'bimbi', 'familiari'],
      informale: ['informale', 'casual', 'rilassato', 'senza pretese', 'semplice'],
      lusso: ['lusso', 'esclusivo', 'elegante', 'raffinato', 'gourmet', 'stella', 'stellato'],
      locale: ['tipico', 'tradizionale', 'autentico', 'locale', 'rustico', 'contadino'],
      moderno: ['moderno', 'contemporaneo', 'trendy', 'fusion', 'creativo', 'innovativo'],
      economico: ['economico', 'a buon prezzo', 'conveniente', 'low cost', 'budget', 'studenti', 'poco', 'cheap'],
    },
    // Piatti / ingredienti chiave
    piatti: {
      carne: ['bistecca', 'filetto', 'tagliata', 'carne', 'manzo', 'maiale', 'agnello', 'cinghiale', 'trippa'],
      pesce: ['pesce', 'frutti di mare', 'scoglio', 'astice', 'branzino', 'orata', 'polpo', 'frittura'],
      pasta: ['pasta', 'tagliatelle', 'pappardelle', 'spaghetti', 'linguine', 'rigatoni', 'tortelli', 'ravioli', 'carbonara', 'amatriciana'],
      pizza: ['pizza', 'margherita', 'diavola', 'capricciosa', 'bufalina', 'napoletana'],
      dolci: ['dolce', 'tiramisù', 'cannolo', 'gelato', 'millefoglie', 'dessert', 'pasticcini'],
      vino: ['vino', 'cantina', 'enoteca', 'calice', 'rosso', 'bianco', 'bollicine', 'prosecco', 'chianti', 'barolo'],
      aperitivo: ['aperitivo', 'spritz', 'negroni', 'cocktail', 'aperitif', 'drink'],
      vegetariano: ['vegan', 'vegetariano', 'vegano', 'senza carne', 'piante', 'verdure'],
    },
    // Prezzo
    prezzo: {
      cheap: { keywords: ['economico', 'poco', 'budget', 'studenti', 'low cost', 'conveniente', 'cheap', 'sotto 20', 'meno di 20'], max: 20 },
      medium: { keywords: ['medio', 'normale', 'ragionevole', 'sotto 40', 'sotto 35', 'sotto 30', 'meno di 30', 'meno di 40'], max: 40 },
      expensive: { keywords: ['lusso', 'gourmet', 'stellato', 'esclusivo', 'raffinato', 'fine dining', 'sopra 50'], min: 50 },
    },
    // Servizi
    servizi: {
      dehors: ['aperto', 'all\'aperto', 'dehors', 'terrazza', 'giardino', 'esterno', 'sole'],
      wifi: ['wifi', 'internet', 'wi-fi', 'lavoro', 'laptop'],
      parcheggio: ['parcheggio', 'macchina', 'auto', 'posteggio'],
      animali: ['cane', 'cani', 'animali', 'pet', 'pets', 'animale'],
    }
  };

  // Estrae il prezzo minimo dall'avgPrice string (es. "€25–80" → 25)
  function getMinPrice(avgPrice) {
    const m = avgPrice.replace(/[^0-9–\-]/g, '').split(/[–\-]/);
    return parseInt(m[0]) || 0;
  }

  // Score semantico per un ristorante rispetto alla query
  function semanticScore(r, q) {
    let score = 0;
    let matches = [];

    // 1. Match atmosfera
    for (const [atmoKey, keywords] of Object.entries(SEMANTIC_MAP.atmosfera)) {
      if (keywords.some(kw => q.includes(kw))) {
        if (r.atmosfera && r.atmosfera.toLowerCase().includes(atmoKey)) {
          score += 30;
          matches.push(`atmosfera: ${atmoKey}`);
        }
        // Categoria proxy
        if (atmoKey === 'economico' && ['bar', 'pizzeria', 'osteria'].includes(r.cat)) {
          score += 15;
        }
        if (atmoKey === 'lusso' && r.cat === 'ristorante') {
          score += 15;
        }
      }
    }

    // 2. Match piatti nel menu
    for (const [dishKey, keywords] of Object.entries(SEMANTIC_MAP.piatti)) {
      const matchedKw = keywords.find(kw => q.includes(kw));
      if (matchedKw) {
        // Cerca in menu
        let found = false;
        for (const section of Object.values(r.menu)) {
          for (const item of section) {
            const nameDesc = (item.name + ' ' + (item.desc || '')).toLowerCase();
            if (keywords.some(kw => nameDesc.includes(kw))) {
              score += 25;
              if (!found) {
                matches.push(`piatto: ${item.name}`);
                r._semanticMatch = item.name;
                found = true;
              }
            }
          }
        }
        // Bonus categoria
        if (dishKey === 'pizza' && r.cat === 'pizzeria') score += 20;
        if (dishKey === 'dolci' && r.cat === 'pasticceria') score += 20;
        if (dishKey === 'aperitivo' && r.cat === 'bar') score += 20;
        if (dishKey === 'vino' && ['ristorante', 'osteria'].includes(r.cat)) score += 10;
      }
    }

    // 3. Filtro prezzo
    for (const [priceKey, config] of Object.entries(SEMANTIC_MAP.prezzo)) {
      if (config.keywords.some(kw => q.includes(kw))) {
        const minP = getMinPrice(r.avgPrice);
        if (config.max !== undefined && minP <= config.max) {
          score += 20;
          matches.push(`prezzo: ≤€${config.max}`);
        }
        if (config.min !== undefined && minP >= config.min) {
          score += 20;
          matches.push(`prezzo: ≥€${config.min}`);
        }
      }
    }

    // 4. Servizi
    for (const [srvKey, keywords] of Object.entries(SEMANTIC_MAP.servizi)) {
      if (keywords.some(kw => q.includes(kw))) {
        if (r.servizi && r.servizi[srvKey === 'dehors' ? 'dehor' : srvKey === 'animali' ? 'animaliAmmessi' : srvKey === 'wifi' ? 'wiFi' : srvKey]) {
          score += 15;
          matches.push(`servizio: ${srvKey}`);
        }
      }
    }

    // 5. Bonus desc e nome
    const descName = (r.name + ' ' + r.desc).toLowerCase();
    const qWords = q.split(/\\s+/).filter(w => w.length > 3);
    qWords.forEach(w => {
      if (descName.includes(w)) score += 5;
    });

    return { score, matches };
  }

  // Detect se una query è "semantica" (contiene parole chiave multi-concetto)
  function isSemanticQuery(q) {
    const allKeywords = [
      ...Object.values(SEMANTIC_MAP.atmosfera).flat(),
      ...Object.values(SEMANTIC_MAP.piatti).flat(),
      ...Object.values(SEMANTIC_MAP.prezzo).flatMap(c => c.keywords),
      ...Object.values(SEMANTIC_MAP.servizi).flat()
    ];
    const words = q.split(/\\s+/);
    const hits = allKeywords.filter(kw => q.includes(kw));
    return hits.length >= 2 || (hits.length === 1 && words.length >= 3);
  }

  // Patch applyFilters per supporto semantico
  const _origApplyFilters = window.applyFilters;
  window.applyFilters = function () {
    const q = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();

    if (q.length >= 3 && isSemanticQuery(q)) {
      // Applica ricerca semantica
      const cat = document.querySelector(".filter-btn.active")?.dataset.cat || "all";

      let pool = RESTAURANTS.filter(r =>
        cat === "all" || (cat === "preferiti" ? (window.favorites || []).includes(r.id) : r.cat === cat)
      );

      // Calcola score per tutti
      pool.forEach(r => {
        r._semanticMatch = null;
        const { score, matches } = semanticScore(r, q);
        r._semanticScore = score;
        r._semanticMatches = matches;
      });

      // Filtra quelli con score > 0 e ordina
      let results = pool.filter(r => r._semanticScore > 0)
        .sort((a, b) => b._semanticScore - a._semanticScore);

      // Se troppo pochi risultati, mostra tutti con score anche 0
      if (results.length < 3) {
        results = pool.sort((a, b) => b._semanticScore - a._semanticScore).slice(0, 8);
      }

      // Aggiorna badge _matchedDish per UI card
      results.forEach(r => {
        if (r._semanticMatch) r._matchedDish = r._semanticMatch;
      });

      // Mostra banner semantico
      showSemanticBanner(q, results.length);

      if (typeof renderCards === 'function') renderCards(results);
      return;
    }

    // Nasconde banner se non semantica
    hideSemanticBanner();
    if (_origApplyFilters) _origApplyFilters();
  };

  // Banner UI per ricerca semantica
  function showSemanticBanner(q, count) {
    let banner = document.getElementById('semantic-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'semantic-banner';
      banner.className = 'semantic-banner';
      const grid = document.getElementById('cardsGrid');
      grid?.parentNode?.insertBefore(banner, grid);
    }
    banner.innerHTML = `
      <div class="sb-icon">🧠</div>
      <div class="sb-text">
        <strong>Ricerca intelligente</strong>: trovati <span class="sb-count">${count}</span> locali per
        <em>"${q}"</em>
      </div>
      <button class="sb-clear" onclick="document.getElementById('searchInput').value=''; hideSemanticBanner(); applyFilters();">✕ Cancella</button>
    `;
    banner.classList.remove('hidden');
  }

  window.hideSemanticBanner = function () {
    document.getElementById('semantic-banner')?.classList.add('hidden');
  };

  // CSS Banner
  const css = `
    .semantic-banner {
      display: flex; align-items: center; gap: 12px;
      background: linear-gradient(135deg, #1a3a20, #2a5a30);
      color: #c8f0d0; border-radius: 12px; padding: 12px 18px;
      margin-bottom: 18px; font-size: 0.88rem;
      border: 1px solid rgba(80,180,100,0.3);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      animation: bannerSlideIn 0.35s ease;
    }
    .semantic-banner.hidden { display: none; }
    @keyframes bannerSlideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .sb-icon { font-size: 1.4rem; flex-shrink: 0; }
    .sb-text { flex: 1; line-height: 1.5; }
    .sb-text strong { color: #7ff0a0; }
    .sb-text em { color: #fff; font-style: normal; background: rgba(255,255,255,0.1); padding: 1px 6px; border-radius: 4px; }
    .sb-count { font-weight: 800; color: #7ff0a0; font-size: 1rem; }
    .sb-clear { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #c8f0d0; border-radius: 8px; padding: 5px 10px; cursor: pointer; font-size: 0.8rem; flex-shrink: 0; transition: 0.2s; }
    .sb-clear:hover { background: rgba(255,255,255,0.2); }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

})();


/* ══════════════════════════════════════════════════════════════
   FEATURE 3 – 📊 DASHBOARD STATISTICHE PERSONALI
══════════════════════════════════════════════════════════════ */
(function initStatsDashboard() {

  function getStats() {
    const visited = JSON.parse(localStorage.getItem('recentVisits') || '[]');
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const reviews = JSON.parse(localStorage.getItem('liveReviews') || '{}');
    const activity = JSON.parse(localStorage.getItem('userActivity') || '{"views":0,"reviews":0,"orders":0}');

    // Categorie visitate
    const catCount = {};
    visited.forEach(id => {
      const r = RESTAURANTS.find(x => x.id === id);
      if (r) catCount[r.cat] = (catCount[r.cat] || 0) + 1;
    });

    // Città preferita
    const cityCount = {};
    visited.forEach(id => {
      const r = RESTAURANTS.find(x => x.id === id);
      if (r) cityCount[r.city] = (cityCount[r.city] || 0) + 1;
    });
    const favCity = Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0];

    // Fascia prezzo preferita dai visitati
    let priceSum = 0, priceCount = 0;
    visited.forEach(id => {
      const r = RESTAURANTS.find(x => x.id === id);
      if (r) {
        const m = r.avgPrice.replace(/[^0-9–\-]/g, '').split(/[–\-]/);
        const avg = (parseInt(m[0] || 0) + parseInt(m[1] || m[0] || 0)) / 2;
        if (!isNaN(avg) && avg > 0) { priceSum += avg; priceCount++; }
      }
    });
    const avgSpend = priceCount > 0 ? Math.round(priceSum / priceCount) : 0;

    // Profilo gusto
    const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];
    const catEmojis = { ristorante: '🍝', osteria: '🍷', pizzeria: '🍕', bar: '☕', pasticceria: '🥐' };

    // Recensioni lasciate
    const myReviewsCount = Object.values(reviews).reduce((s, arr) => s + arr.length, 0);

    // Badge livello
    const totalActions = (activity.views || 0) + (activity.reviews || 0) * 3 + (activity.orders || 0) * 2;
    let level, levelIcon, nextLevel;
    if (totalActions < 5) { level = 'Nuovo Ospite'; levelIcon = '🥄'; nextLevel = 5; }
    else if (totalActions < 15) { level = 'Buongustaio'; levelIcon = '🍴'; nextLevel = 15; }
    else if (totalActions < 30) { level = 'Intenditore'; levelIcon = '🍷'; nextLevel = 30; }
    else if (totalActions < 60) { level = 'Gourmet'; levelIcon = '👨🍳'; nextLevel = 60; }
    else { level = 'Maestro del Gusto'; levelIcon = '⭐'; nextLevel = null; }

    const levelPct = nextLevel ? Math.min(100, Math.round((totalActions / nextLevel) * 100)) : 100;

    return { visited, favs, catCount, cityCount, favCity, avgSpend, topCat, catEmojis, myReviewsCount, bookings, level, levelIcon, levelPct, nextLevel, totalActions };
  }

  function renderDashboard() {
    const s = getStats();

    const catBars = Object.entries(s.catCount)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => {
        const max = Math.max(...Object.values(s.catCount));
        const pct = Math.round((count / max) * 100);
        return `
          <div class="sd-cat-row">
            <div class="sd-cat-label">${s.catEmojis[cat] || '🍽'} ${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
            <div class="sd-cat-bar-wrap">
              <div class="sd-cat-bar" style="width:${pct}%"></div>
            </div>
            <div class="sd-cat-num">${count}</div>
          </div>`;
      }).join('') || '<p class="sd-empty">Nessun locale visitato ancora.</p>';

    const cityList = Object.entries(s.cityCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([city, count], i) => `
        <div class="sd-city-row">
          <span class="sd-city-rank">${['🥇', '🥈', '🥉', '4°', '5°'][i]}</span>
          <span class="sd-city-name">${city}</span>
          <span class="sd-city-count">${count} ${count === 1 ? 'visita' : 'visite'}</span>
        </div>`).join('') || '<p class="sd-empty">Nessuna città esplorata ancora.</p>';

    const favsList = s.favs.slice(0, 3).map(id => {
      const r = RESTAURANTS.find(x => x.id === id);
      if (!r) return '';
      return `<div class="sd-fav-chip" onclick="openModal(${r.id})">${r.emoji} ${r.name}</div>`;
    }).join('') || '<span class="sd-empty-inline">Ancora nessun preferito ❤️</span>';

    return `
      <div class="sd-panel">

        <!-- Header con livello -->
        <div class="sd-header">
          <div class="sd-level-icon">${s.levelIcon}</div>
          <div class="sd-level-info">
            <div class="sd-level-name">${s.level}</div>
            <div class="sd-level-points">${s.totalActions} punti esperienza</div>
            <div class="sd-level-bar-wrap">
              <div class="sd-level-bar" style="width:${s.levelPct}%"></div>
            </div>
            ${s.nextLevel ? `<div class="sd-level-next">→ Prossimo livello a ${s.nextLevel} pt</div>` : '<div class="sd-level-next">🏆 Livello massimo raggiunto!</div>'}
          </div>
        </div>

        <!-- KPI Numerici -->
        <div class="sd-kpis">
          <div class="sd-kpi">
            <div class="sd-kpi-val">${s.visited.length}</div>
            <div class="sd-kpi-label">🏠 Locali visitati</div>
          </div>
          <div class="sd-kpi">
            <div class="sd-kpi-val">${s.favs.length}</div>
            <div class="sd-kpi-label">❤️ Preferiti</div>
          </div>
          <div class="sd-kpi">
            <div class="sd-kpi-val">${s.myReviewsCount}</div>
            <div class="sd-kpi-label">✍️ Recensioni</div>
          </div>
          <div class="sd-kpi">
            <div class="sd-kpi-val">${s.avgSpend > 0 ? '€' + s.avgSpend : '—'}</div>
            <div class="sd-kpi-label">💶 Spesa media</div>
          </div>
        </div>

        <!-- Categorie visitate -->
        <div class="sd-section">
          <div class="sd-section-title">📊 Le tue categorie preferite</div>
          <div class="sd-cat-chart">${catBars}</div>
        </div>

        <!-- Città -->
        <div class="sd-section">
          <div class="sd-section-title">🗺️ Le tue città</div>
          <div class="sd-city-list">${cityList}</div>
        </div>

        <!-- Preferiti -->
        <div class="sd-section">
          <div class="sd-section-title">❤️ I tuoi preferiti recenti</div>
          <div class="sd-favs-row">${favsList}</div>
        </div>

        <!-- Profilo Gusto -->
        ${s.topCat ? `
        <div class="sd-taste-card">
          <div class="sd-taste-icon">${s.catEmojis[s.topCat[0]] || '🍽'}</div>
          <div class="sd-taste-text">
            <strong>Il tuo profilo:</strong> Ami le <em>${s.topCat[0]}e/i</em>!<br>
            ${s.favCity ? `La tua città del cuore è <strong>${s.favCity[0]}</strong>.` : ''}
          </div>
        </div>` : ''}

        <button class="sd-reset-btn" onclick="resetStatsData()">🗑️ Azzera dati personali</button>
      </div>
    `;
  }

  window.resetStatsData = function () {
    if (!confirm('Sei sicuro di voler cancellare tutti i tuoi dati personali?')) return;
    ['recentVisits', 'favorites', 'bookings', 'liveReviews', 'userActivity'].forEach(k => localStorage.removeItem(k));
    document.getElementById('sd-modal').classList.remove('open');
    showToast('Dati personali azzerati.', '🗑️');
  };

  // Bottone FAB stats
  function createStatsFab() {
    const fab = document.createElement('button');
    fab.id = 'stats-fab';
    fab.className = 'stats-fab';
    fab.innerHTML = '📊';
    fab.title = 'I tuoi gusti';
    fab.setAttribute('aria-label', 'Statistiche personali');
    document.body.appendChild(fab);

    // Modal
    const modal = document.createElement('div');
    modal.id = 'sd-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '10020';
    modal.innerHTML = `
      <div class="modal-box sd-modal-box">
        <button class="modal-close" id="sd-modal-close" aria-label="Chiudi statistiche">✕</button>
        <div id="sd-content"></div>
      </div>
    `;
    document.body.appendChild(modal);

    fab.addEventListener('click', () => {
      document.getElementById('sd-content').innerHTML = renderDashboard();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    document.getElementById('sd-modal-close').addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });

    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', createStatsFab);

  // Traccia attività (views)
  window.trackActivity = window.trackActivity || function (type) {
    const a = JSON.parse(localStorage.getItem('userActivity') || '{"views":0,"reviews":0,"orders":0}');
    a[type] = (a[type] || 0) + 1;
    localStorage.setItem('userActivity', JSON.stringify(a));
  };

  // Patch openModal per tracciare views
  const _orig = window.openModal;
  window.openModal = function (id) {
    trackActivity('views');
    if (_orig) _orig(id);
  };

  // CSS Dashboard
  const css = `
    /* ── FAB STATISTICHE ── */
    .stats-fab {
      position: fixed; bottom: 420px; right: 24px; z-index: 9999;
      background: linear-gradient(135deg, #2a4a8a, #1a2f60);
      color: #fff; border: none; border-radius: 50px;
      width: 48px; height: 48px; font-size: 1.3rem;
      cursor: pointer; box-shadow: 0 6px 20px rgba(26,47,96,.5);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
    }
    .stats-fab:hover { transform: scale(1.1); box-shadow: 0 8px 28px rgba(26,47,96,.7); }

    /* ── MODAL BOX ── */
    .sd-modal-box { max-width: 560px; max-height: 88vh; overflow-y: auto; }

    /* ── PANEL LAYOUT ── */
    .sd-panel { padding: 4px 0; }

    /* Header Livello */
    .sd-header {
      display: flex; gap: 16px; align-items: center;
      background: linear-gradient(135deg, #1a2f60, #2a4a8a);
      border-radius: 16px; padding: 18px 20px; margin-bottom: 20px;
    }
    .sd-level-icon { font-size: 2.8rem; flex-shrink: 0; }
    .sd-level-info { flex: 1; }
    .sd-level-name { font-size: 1.15rem; font-weight: 800; color: #fff; font-family: 'Playfair Display', serif; }
    .sd-level-points { font-size: .78rem; color: rgba(255,255,255,.7); margin: 2px 0 8px; }
    .sd-level-bar-wrap { background: rgba(255,255,255,.2); border-radius: 20px; height: 6px; overflow: hidden; margin-bottom: 4px; }
    .sd-level-bar { height: 100%; background: linear-gradient(90deg, #7aaeff, #a0c4ff); border-radius: 20px; transition: width .8s ease; }
    .sd-level-next { font-size: .72rem; color: rgba(255,255,255,.55); }

    /* KPI numerici */
    .sd-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 22px; }
    .sd-kpi { background: #fff; border: 1px solid #e8d9b8; border-radius: 12px; padding: 14px 8px; text-align: center; }
    .sd-kpi-val { font-size: 1.5rem; font-weight: 900; color: #c9932e; font-family: 'Playfair Display', serif; }
    .sd-kpi-label { font-size: .68rem; color: #8a6a4a; margin-top: 4px; line-height: 1.3; }

    /* Sezioni */
    .sd-section { margin-bottom: 20px; }
    .sd-section-title { font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #a48c68; margin-bottom: 10px; }

    /* Cat bars */
    .sd-cat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .sd-cat-label { font-size: .82rem; color: #4a3318; width: 100px; flex-shrink: 0; }
    .sd-cat-bar-wrap { flex: 1; background: #f0e8d8; border-radius: 20px; height: 10px; overflow: hidden; }
    .sd-cat-bar { height: 100%; background: linear-gradient(90deg, #c9932e, #f0b429); border-radius: 20px; transition: width .6s ease; }
    .sd-cat-num { font-size: .8rem; font-weight: 700; color: #c9932e; width: 20px; text-align: right; }

    /* Città */
    .sd-city-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0e8d8; }
    .sd-city-row:last-child { border-bottom: none; }
    .sd-city-rank { font-size: 1rem; flex-shrink: 0; }
    .sd-city-name { flex: 1; font-size: .88rem; color: #2d1a08; font-weight: 600; }
    .sd-city-count { font-size: .78rem; color: #8a6a4a; }

    /* Preferiti chips */
    .sd-favs-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .sd-fav-chip {
      background: #fff5e8; border: 1px solid #e8c890; color: #8a5a10;
      border-radius: 20px; padding: 6px 14px; font-size: .82rem; cursor: pointer;
      transition: 0.2s; font-weight: 600;
    }
    .sd-fav-chip:hover { background: #c9932e; color: #fff; border-color: #c9932e; }

    /* Taste card */
    .sd-taste-card {
      display: flex; gap: 14px; align-items: center;
      background: linear-gradient(135deg, #fff9ec, #fff3d8);
      border: 1px solid #f0c870; border-radius: 14px; padding: 16px;
      margin-bottom: 16px;
    }
    .sd-taste-icon { font-size: 2.2rem; flex-shrink: 0; }
    .sd-taste-text { font-size: .88rem; color: #4a3318; line-height: 1.6; }
    .sd-taste-text em { font-style: normal; font-weight: 700; color: #c9932e; }

    /* Reset */
    .sd-reset-btn {
      width: 100%; background: #fff0f0; color: #b00020; border: 1px solid #fbb;
      border-radius: 10px; padding: 10px; font-size: .85rem; cursor: pointer; font-weight: 600; margin-top: 4px;
    }
    .sd-reset-btn:hover { background: #ffe0e0; }

    .sd-empty { color: #aaa; text-align: center; padding: 10px; font-size: .85rem; }
    .sd-empty-inline { color: #aaa; font-size: .85rem; }

    /* Dark mode */
    [data-theme="dark"] .sd-kpi, [data-theme="dark"] .sd-taste-card { background: #1e1208; border-color: #3a2810; }
    [data-theme="dark"] .sd-taste-card { background: linear-gradient(135deg, #1e1208, #2a1a08); }
    [data-theme="dark"] .sd-kpi-label, [data-theme="dark"] .sd-city-name { color: #d0b080; }

    @media (max-width: 480px) {
      .sd-kpis { grid-template-columns: repeat(2, 1fr); }
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

})();


/* ══════════════════════════════════════════════════════════════
   FEATURE 1 – 🗺️ MAPPA AVANZATA "ESPLORA VICINO A ME"
   Clustering marker + filtro categoria + raggio trascinabile
══════════════════════════════════════════════════════════════ */
(function initAdvancedMap() {
  return;
  // ── Mini clustering engine (senza librerie extra) ──
  function clusterMarkers(restaurants, zoomLevel) {
    const clusterRadius = zoomLevel >= 13 ? 0.03 : zoomLevel >= 11 ? 0.08 : zoomLevel >= 9 ? 0.20 : 0.50;
    const clusters = [];
    const used = new Set();

    restaurants.forEach((r, idx) => {
      if (used.has(idx)) return;
      const cluster = { items: [r], lat: r.lat, lng: r.lng };
      used.add(idx);

      restaurants.forEach((r2, idx2) => {
        if (used.has(idx2)) return;
        const dlat = Math.abs(r.lat - r2.lat);
        const dlng = Math.abs(r.lng - r2.lng);
        if (dlat < clusterRadius && dlng < clusterRadius) {
          cluster.items.push(r2);
          used.add(idx2);
          // Update center
          cluster.lat = cluster.items.reduce((s, x) => s + x.lat, 0) / cluster.items.length;
          cluster.lng = cluster.items.reduce((s, x) => s + x.lng, 0) / cluster.items.length;
        }
      });

      clusters.push(cluster);
    });

    return clusters;
  }

  // Crea overlay "Esplora vicino a me"
  function createExplorePanel(map, userLatLng) {
    // La mappa hero già esiste; aggiungiamo il pannello avanzato separato
    const heroMapWrap = document.querySelector('.hero-map-wrap');
    if (!heroMapWrap) return;

    // Bottone per aprire il pannello avanzato
    const openBtn = document.createElement('button');
    openBtn.id = 'explore-map-btn';
    openBtn.className = 'explore-map-btn';
    openBtn.innerHTML = '🗺️ Esplora Vicino a Me';
    heroMapWrap.appendChild(openBtn);

    // Overlay mappa avanzata
    const overlay = document.createElement('div');
    overlay.id = 'explore-map-overlay';
    overlay.className = 'explore-map-overlay hidden';
    overlay.innerHTML = `
      <div class="em-panel">
        <div class="em-header">
          <h3>🗺️ Esplora Vicino a Me</h3>
          <button id="em-close" class="em-close">✕</button>
        </div>
        
        <!-- Controlli -->
        <div class="em-controls">
          <div class="em-control-group">
            <label class="em-label">📍 Raggio di ricerca</label>
            <div class="em-radius-row">
              <input type="range" id="em-radius" min="1" max="300" value="50" step="5" class="em-slider">
              <span id="em-radius-val" class="em-radius-display">50 km</span>
            </div>
          </div>
          <div class="em-control-group">
            <label class="em-label">🍽 Categoria</label>
            <div class="em-cat-filters">
              <button class="em-cat-btn active" data-cat="all">Tutti</button>
              <button class="em-cat-btn" data-cat="ristorante">🍴</button>
              <button class="em-cat-btn" data-cat="osteria">🍷</button>
              <button class="em-cat-btn" data-cat="pizzeria">🍕</button>
              <button class="em-cat-btn" data-cat="bar">☕</button>
              <button class="em-cat-btn" data-cat="pasticceria">🥐</button>
            </div>
          </div>
          <div class="em-results-count" id="em-count">— locali nel raggio</div>
        </div>
        
        <!-- Mappa -->
        <div id="em-map" class="em-map"></div>
        
        <!-- Lista risultati -->
        <div id="em-list" class="em-list"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    let emMap = null;
    let emMarkers = [];
    let emCircle = null;
    let currentCat = 'all';
    let currentRadius = 50;

    openBtn.addEventListener('click', () => {
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      if (!emMap) {
        setTimeout(() => {
          initExploreMap();
        }, 100);
      }
    });

    document.getElementById('em-close').addEventListener('click', () => {
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
    });

    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });

    function initExploreMap() {
      const center = [USER_LOC.lat, USER_LOC.lng];

      emMap = L.map('em-map', {
        center: center,
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '© OpenStreetMap, © CARTO',
        maxZoom: 19,
      }).addTo(emMap);

      // Marker "Tu sei qui"
      const youIcon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;background:#007aff;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 6px rgba(0,122,255,0.2);"></div>`,
        iconSize: [18, 18], iconAnchor: [9, 9],
      });
      L.marker(center, { icon: youIcon, zIndexOffset: 2000 }).addTo(emMap)
        .bindPopup('<strong>📍 Tu sei qui</strong>');

      // Radius slider
      const radiusSlider = document.getElementById('em-radius');
      radiusSlider.addEventListener('input', () => {
        currentRadius = parseInt(radiusSlider.value);
        document.getElementById('em-radius-val').textContent = currentRadius + ' km';
        updateExploreMap();
      });

      // Category filter
      document.querySelectorAll('.em-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.em-cat-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentCat = btn.dataset.cat;
          updateExploreMap();
        });
      });

      // Map zoom → recompute clusters
      emMap.on('zoomend', updateExploreMap);

      // Cerchio raggio
      emCircle = L.circle(center, {
        color: '#007aff',
        fillColor: '#007aff',
        fillOpacity: 0.06,
        weight: 2,
        dashArray: '6 4',
        radius: currentRadius * 1000,
      }).addTo(emMap);

      updateExploreMap();
    }

    function updateExploreMap() {
      if (!emMap) return;

      // Filtra ristoranti per categoria e raggio
      const filtered = RESTAURANTS.filter(r => {
        if (currentCat !== 'all' && r.cat !== currentCat) return false;
        const dist = parseFloat(getDistance(USER_LOC.lat, USER_LOC.lng, r.lat, r.lng));
        return dist <= currentRadius;
      });

      // Aggiorna cerchio
      if (emCircle) emCircle.setRadius(currentRadius * 1000);

      // Fit map to circle
      try {
        emMap.fitBounds([
          [USER_LOC.lat - currentRadius / 111, USER_LOC.lng - currentRadius / 88],
          [USER_LOC.lat + currentRadius / 111, USER_LOC.lng + currentRadius / 88]
        ], { padding: [20, 20] });
      } catch (e) { }

      // Rimuovi vecchi marker
      emMarkers.forEach(m => emMap.removeLayer(m));
      emMarkers = [];

      // Raggruppa in cluster
      const zl = emMap.getZoom();
      const clusters = clusterMarkers(filtered, zl);

      const catColors = {
        ristorante: '#c9932e', osteria: '#c0392b',
        pizzeria: '#e65100', pasticceria: '#ad1457', bar: '#00897b',
      };

      clusters.forEach(cl => {
        if (cl.items.length === 1) {
          // Marker singolo
          const r = cl.items[0];
          const color = catColors[r.cat] || '#c9932e';
          const icon = L.divIcon({
            className: '',
            html: `<div style="width:34px;height:34px;background:${color};border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 3px 10px rgba(0,0,0,0.4);cursor:pointer;">${r.emoji}</div>`,
            iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -20],
          });
          const m = L.marker([r.lat, r.lng], { icon })
            .bindPopup(`
              <div style="font-family:'Inter',sans-serif;padding:4px;min-width:190px;">
                <div style="font-weight:700;font-size:.95rem;margin-bottom:3px;">${r.emoji} ${r.name}</div>
                <div style="font-size:.78rem;color:#888;margin-bottom:6px;">📍 ${r.city} · 🚗 ${getDistance(USER_LOC.lat, USER_LOC.lng, r.lat, r.lng)} km</div>
                <div style="font-size:.78rem;margin-bottom:8px;">${r.stars} · ${r.avgPrice}</div>
                <button onclick="openModal(${r.id})" style="background:#c9932e;color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:.8rem;cursor:pointer;width:100%;font-family:'Inter',sans-serif;">Vedi Menu →</button>
              </div>`)
            .addTo(emMap);
          emMarkers.push(m);
        } else {
          // Cluster
          const count = cl.items.length;
          const size = count > 30 ? 52 : count > 10 ? 44 : 36;
          const bg = count > 20 ? '#e65100' : count > 8 ? '#c9932e' : '#2a8a60';
          const icon = L.divIcon({
            className: '',
            html: `<div style="width:${size}px;height:${size}px;background:${bg};border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:${count > 99 ? '12px' : '14px'};box-shadow:0 4px 14px rgba(0,0,0,0.35);cursor:pointer;">${count}</div>`,
            iconSize: [size, size], iconAnchor: [size / 2, size / 2],
          });

          const m = L.marker([cl.lat, cl.lng], { icon })
            .on('click', () => {
              emMap.setView([cl.lat, cl.lng], emMap.getZoom() + 2);
            })
            .addTo(emMap);
          emMarkers.push(m);
        }
      });

      // Aggiorna contatore e lista
      document.getElementById('em-count').textContent = `${filtered.length} locali nel raggio di ${currentRadius} km`;

      // Lista top 6 più vicini
      const sorted = [...filtered].sort((a, b) =>
        parseFloat(getDistance(USER_LOC.lat, USER_LOC.lng, a.lat, a.lng)) -
        parseFloat(getDistance(USER_LOC.lat, USER_LOC.lng, b.lat, b.lng))
      ).slice(0, 6);

      const listEl = document.getElementById('em-list');
      if (listEl) {
        if (sorted.length === 0) {
          listEl.innerHTML = '<p class="em-no-results">Nessun locale trovato nel raggio selezionato.<br>Prova ad aumentare il raggio!</p>';
        } else {
          listEl.innerHTML = sorted.map(r => `
            <div class="em-list-item" onclick="overlay.classList.add('hidden'); document.body.style.overflow=''; openModal(${r.id})">
              <div class="em-li-icon">${r.emoji}</div>
              <div class="em-li-info">
                <div class="em-li-name">${r.name}</div>
                <div class="em-li-meta">📍 ${r.city} · 🚗 ${getDistance(USER_LOC.lat, USER_LOC.lng, r.lat, r.lng)} km · ${r.avgPrice}</div>
              </div>
              <div class="em-li-stars">${r.stars}</div>
            </div>
          `).join('');
        }
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Aspetta che Leaflet sia disponibile
    const tryInit = () => {
      if (typeof L !== 'undefined' && typeof USER_LOC !== 'undefined') {
        createExplorePanel(null, USER_LOC);
      } else {
        setTimeout(tryInit, 200);
      }
    };
    tryInit();
  });

  // CSS Mappa avanzata
  const css = `
    /* ── EXPLORE MAP BUTTON ── */
    .explore-map-btn {
      display: block; width: 100%; margin-top: 10px;
      background: linear-gradient(135deg, #1a3a5c, #2a5a8c);
      color: #fff; border: none; border-radius: 10px;
      padding: 11px 16px; font-size: .88rem; font-weight: 700;
      cursor: pointer; transition: 0.2s; letter-spacing: 0.3px;
    }
    .explore-map-btn:hover { background: linear-gradient(135deg, #0f2540, #1a4070); transform: translateY(-1px); }

    /* ── OVERLAY ── */
    .explore-map-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7);
      z-index: 10015; display: flex; align-items: center; justify-content: center;
      padding: 16px;
    }
    .explore-map-overlay.hidden { display: none; }

    .em-panel {
      background: #fff; border-radius: 20px; width: 100%; max-width: 780px;
      max-height: 92vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      display: flex; flex-direction: column;
    }

    /* Header */
    .em-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px 22px 14px; border-bottom: 1px solid #f0e8d8;
      position: sticky; top: 0; background: #fff; border-radius: 20px 20px 0 0; z-index: 10;
    }
    .em-header h3 { font-family: 'Playfair Display', serif; color: #1a1208; font-size: 1.2rem; margin: 0; }
    .em-close {
      background: #f5f0e8; border: none; border-radius: 50%; width: 32px; height: 32px;
      font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: #8a6a4a; flex-shrink: 0;
    }
    .em-close:hover { background: #e8d9b8; }

    /* Controlli */
    .em-controls { padding: 16px 22px; border-bottom: 1px solid #f0e8d8; }
    .em-control-group { margin-bottom: 12px; }
    .em-control-group:last-child { margin-bottom: 4px; }
    .em-label { font-size: .78rem; font-weight: 700; color: #a48c68; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 7px; }

    .em-radius-row { display: flex; align-items: center; gap: 14px; }
    .em-slider {
      flex: 1; -webkit-appearance: none; appearance: none;
      height: 6px; border-radius: 3px; outline: none;
      background: linear-gradient(90deg, #c9932e var(--pct, 16%), #f0e8d8 var(--pct, 16%));
      cursor: pointer;
    }
    .em-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 20px; height: 20px;
      border-radius: 50%; background: #c9932e; border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2); cursor: pointer;
    }
    .em-radius-display { font-size: .9rem; font-weight: 700; color: #c9932e; min-width: 60px; text-align: right; }

    .em-cat-filters { display: flex; gap: 6px; flex-wrap: wrap; }
    .em-cat-btn {
      background: #f5f0e8; border: 1px solid #e8d9b8; border-radius: 20px;
      padding: 5px 13px; font-size: .82rem; cursor: pointer; transition: 0.2s; color: #5a3a18;
    }
    .em-cat-btn.active { background: #c9932e; border-color: #c9932e; color: #fff; font-weight: 700; }
    .em-cat-btn:hover:not(.active) { background: #e8d8b8; }

    .em-results-count { font-size: .8rem; color: #8a6a4a; font-weight: 600; margin-top: 8px; }

    /* Mappa */
    .em-map { height: 340px; flex-shrink: 0; }

    /* Lista risultati */
    .em-list { padding: 12px 22px 16px; }
    .em-list-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 12px; cursor: pointer; transition: 0.2s;
      border-bottom: 1px solid #f0e8d8;
    }
    .em-list-item:last-child { border-bottom: none; }
    .em-list-item:hover { background: #fdf6ec; }
    .em-li-icon { font-size: 1.5rem; flex-shrink: 0; }
    .em-li-info { flex: 1; min-width: 0; }
    .em-li-name { font-weight: 700; font-size: .9rem; color: #1a1208; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .em-li-meta { font-size: .75rem; color: #8a6a4a; margin-top: 2px; }
    .em-li-stars { font-size: .85rem; color: #f0b429; flex-shrink: 0; }
    .em-no-results { text-align: center; color: #aaa; padding: 20px; font-size: .9rem; }

    /* Dark mode */
    [data-theme="dark"] .em-panel { background: #1e1208; }
    [data-theme="dark"] .em-header { background: #1e1208; border-color: #3a2810; }
    [data-theme="dark"] .em-header h3, [data-theme="dark"] .em-li-name { color: #f5e8d0; }
    [data-theme="dark"] .em-controls { border-color: #3a2810; }
    [data-theme="dark"] .em-cat-btn { background: #2a1c10; border-color: #4a3320; color: #d0a878; }
    [data-theme="dark"] .em-list-item:hover { background: #2a1a08; }
    [data-theme="dark"] .em-list-item { border-color: #3a2810; }
    [data-theme="dark"] .em-close { background: #2a1c10; color: #d0a878; }

    @media (max-width: 600px) {
      .em-map { height: 260px; }
      .em-panel { max-height: 95vh; }
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

})();
