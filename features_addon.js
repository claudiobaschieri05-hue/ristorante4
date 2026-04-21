/* ================================================================
   GUIDA RISTORANTI D'ITALIA – features_addon.js
   Nuove funzionalità:
   1. ✍️  Sistema Recensioni Live
   2. 📅  Dashboard "Le Mie Prenotazioni"
   3. 🎟️  Programma Fedeltà & Coupon
   4. 📸  Galleria Fotografica Piatti (AI via Unsplash)
   ================================================================ */

// ══════════════════════════════════════════════════════════════
// FEATURE 1 – ✍️ SISTEMA RECENSIONI LIVE
// ══════════════════════════════════════════════════════════════

(function initLiveReviews() {

  // Storage helpers
  function getAllReviews() {
    return JSON.parse(localStorage.getItem('liveReviews') || '{}');
  }
  function saveAllReviews(data) {
    localStorage.setItem('liveReviews', JSON.stringify(data));
  }
  function getRestReviews(restId) {
    return (getAllReviews()[restId] || []);
  }
  function addReview(restId, review) {
    const all = getAllReviews();
    if (!all[restId]) all[restId] = [];
    all[restId].unshift(review);
    saveAllReviews(all);
  }
  function calcAvg(reviews) {
    if (!reviews.length) return null;
    return (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1);
  }

  // Render star input widget
  function starInputHTML(name) {
    return `
      <div class="lr-star-row" data-name="${name}">
        ${[1, 2, 3, 4, 5].map(i =>
      `<span class="lr-star" data-val="${i}" role="button" aria-label="${i} stelle" tabindex="0">★</span>`
    ).join('')}
      </div>`;
  }

  // Build the review form + list HTML
  function buildReviewPanel(restId) {
    const reviews = getRestReviews(restId);
    const avg = calcAvg(reviews);
    const r = RESTAURANTS.find(x => x.id === restId);
    const baseCount = r ? (r.reviewsCount || 0) : 0;
    const totalCount = baseCount + reviews.length;
    const displayRating = avg !== null
      ? ((parseFloat(avg) + parseFloat(r?.rating || avg)) / 2).toFixed(1)
      : (r?.rating || '–');

    const reviewsListHTML = reviews.length
      ? reviews.map(rev => `
          <div class="lr-review-card">
            <div class="lr-rev-avatar">${rev.user.charAt(0).toUpperCase()}</div>
            <div class="lr-rev-body">
              <div class="lr-rev-header">
                <strong>${rev.user}</strong>
                <span class="lr-rev-date">${rev.date}</span>
              </div>
              <div class="lr-rev-stars">${'★'.repeat(rev.stars)}${'☆'.repeat(5 - rev.stars)}</div>
              <div class="lr-rev-text">${rev.text}</div>
              <div class="lr-rev-badge">✅ Recensione verificata</div>
            </div>
          </div>`)
        .join('')
      : `<div class="lr-empty">Nessuna recensione utente ancora. Sii il primo!</div>`;

    return `
      <div class="lr-panel" id="lr-panel-${restId}">
        <div class="lr-summary-bar">
          <div class="lr-avg-big">${displayRating}</div>
          <div class="lr-avg-info">
            <div class="lr-avg-stars">${renderStarsStr(parseFloat(displayRating))}</div>
            <div class="lr-avg-count">Basato su <strong>${totalCount}</strong> recensioni totali</div>
            ${avg !== null ? `<div class="lr-user-avg">🏅 Media utenti: <strong>${avg}/5</strong> (${reviews.length} ${reviews.length === 1 ? 'utente' : 'utenti'})</div>` : ''}
          </div>
        </div>

        <div class="lr-form-wrap">
          <h4>✍️ Lascia la tua Recensione</h4>
          <div class="lr-form" id="lr-form-${restId}">
            <input class="lr-input" id="lr-name-${restId}" type="text" placeholder="Il tuo nome (es. Giulia M.)" maxlength="40" />
            <div class="lr-stars-label">Il tuo voto:</div>
            ${starInputHTML('lr-stars-' + restId)}
            <textarea class="lr-textarea" id="lr-text-${restId}" placeholder="Racconta la tua esperienza..." rows="3" maxlength="500"></textarea>
            <button class="lr-submit-btn" onclick="submitReview(${restId})">📤 Pubblica Recensione</button>
          </div>
        </div>

        <div class="lr-reviews-list" id="lr-list-${restId}">
          ${reviewsListHTML}
        </div>
      </div>`;
  }

  function renderStarsStr(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  // Attach star picker events
  function attachStarPicker(restId) {
    const row = document.querySelector(`.lr-star-row[data-name="lr-stars-${restId}"]`);
    if (!row) return;
    let selected = 0;
    row.querySelectorAll('.lr-star').forEach(star => {
      const val = parseInt(star.dataset.val);
      star.addEventListener('mouseenter', () => highlightStars(row, val));
      star.addEventListener('mouseleave', () => highlightStars(row, selected));
      star.addEventListener('click', () => {
        selected = val;
        row.dataset.selected = val;
        highlightStars(row, val, true);
      });
      star.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          selected = val;
          row.dataset.selected = val;
          highlightStars(row, val, true);
        }
      });
    });
  }

  function highlightStars(row, count, permanent = false) {
    row.querySelectorAll('.lr-star').forEach(star => {
      const val = parseInt(star.dataset.val);
      star.classList.toggle('lit', val <= count);
      if (permanent) star.classList.toggle('selected', val <= count);
    });
  }

  // Submit review
  window.submitReview = function (restId) {
    const nameEl = document.getElementById(`lr-name-${restId}`);
    const textEl = document.getElementById(`lr-text-${restId}`);
    const starsRow = document.querySelector(`.lr-star-row[data-name="lr-stars-${restId}"]`);
    const stars = parseInt(starsRow?.dataset.selected || '0');

    const name = nameEl?.value.trim();
    const text = textEl?.value.trim();

    if (!name) { showToast('Inserisci il tuo nome!', '⚠️'); nameEl?.focus(); return; }
    if (!stars) { showToast('Dai un voto da 1 a 5 stelle!', '⭐'); return; }
    if (!text || text.length < 10) { showToast('Scrivi almeno 10 caratteri di commento!', '✏️'); textEl?.focus(); return; }

    const now = new Date();
    const date = now.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

    const review = { user: name, stars, text, date };
    addReview(restId, review);

    // Re-render the panel
    const panel = document.getElementById(`lr-panel-${restId}`);
    if (panel) {
      panel.outerHTML = buildReviewPanel(restId);
      // Reattach
      setTimeout(() => {
        attachStarPicker(restId);
        trackActivity('review');
      }, 50);
    }

    showToast('Grazie! La tua recensione è stata pubblicata 🎉', '✅');
  };

  // Hook into openModal: inject review panel
  const _origOpenModal = window.openModal;
  window.openModal = function (id) {
    _origOpenModal(id);
    // Wait for modal content to render
    setTimeout(() => {
      const reviewsPanel = document.getElementById('panel-recensioni');
      if (!reviewsPanel) return;

      // Append our live reviews below the existing static ones
      const lrContainer = document.createElement('div');
      lrContainer.innerHTML = buildReviewPanel(id);
      reviewsPanel.appendChild(lrContainer);
      attachStarPicker(id);
    }, 80);
  };

})();


// ══════════════════════════════════════════════════════════════
// FEATURE 2 – 📅 DASHBOARD "LE MIE PRENOTAZIONI"
// ══════════════════════════════════════════════════════════════

(function initBookingDashboard() {

  // Storage
  function getBookings() {
    return JSON.parse(localStorage.getItem('myBookings') || '[]');
  }
  function saveBookings(list) {
    localStorage.setItem('myBookings', JSON.stringify(list));
  }

  // Build dashboard modal HTML
  function buildDashboardHTML() {
    const bookings = getBookings();
    const now = new Date();

    const listHTML = bookings.length === 0
      ? `<div class="bd-empty">
          <div class="bd-empty-icon">📅</div>
          <p>Nessuna prenotazione ancora.</p>
          <p style="font-size:.85rem;color:var(--muted);">Apri il menu di un locale e clicca <strong>"Prenota un Tavolo"</strong>.</p>
        </div>`
      : bookings.map((b, idx) => {
        const dt = new Date(b.datetime);
        const isPast = dt < now;
        const formattedDate = dt.toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
        const formattedTime = dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const statusClass = b.cancelled ? 'bd-status-cancelled' : (isPast ? 'bd-status-past' : 'bd-status-active');
        const statusText = b.cancelled ? '❌ Annullata' : (isPast ? '✔️ Completata' : '🟢 Confermata');

        return `
            <div class="bd-booking-card ${b.cancelled ? 'bd-cancelled' : ''}">
              <div class="bd-booking-emoji">${b.emoji}</div>
              <div class="bd-booking-info">
                <div class="bd-booking-name">${b.restName}</div>
                <div class="bd-booking-meta">
                  📅 ${formattedDate} · 🕐 ${formattedTime}
                </div>
                <div class="bd-booking-meta">
                  👤 ${b.guestName} &nbsp;·&nbsp; 👥 ${b.guests} ${b.guests === 1 ? 'persona' : 'persone'}
                </div>
                <div class="bd-booking-meta">📞 ${b.phone} &nbsp;·&nbsp; ✉️ ${b.email}</div>
                <span class="bd-status ${statusClass}">${statusText}</span>
              </div>
              ${!b.cancelled && !isPast ? `
              <button class="bd-cancel-btn" onclick="cancelBooking(${idx})">
                🗑️ Annulla
              </button>` : ''}
            </div>`;
      }).join('');

    return `
      <div class="bd-dashboard" id="bd-dashboard">
        <div class="bd-header">
          <h2>📅 Le Mie Prenotazioni</h2>
          <p>${bookings.filter(b => !b.cancelled).length} prenotazione/i attiva/e</p>
        </div>
        <div class="bd-list">
          ${listHTML}
        </div>
        ${bookings.length > 0 ? `<button class="bd-clear-btn" onclick="clearAllBookings()">🗑️ Svuota Archivio</button>` : ''}
      </div>`;
  }

  // Create the dashboard modal in DOM
  function ensureDashboardModal() {
    if (document.getElementById('bdModal')) return;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'bdModal';
    modal.style.cssText = 'z-index: 10020;';
    modal.innerHTML = `
      <div class="modal-box bd-modal-box">
        <button class="modal-close" id="bdClose" aria-label="Chiudi">✕</button>
        <div id="bdContent"></div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('bdClose').addEventListener('click', closeDashboard);
    modal.addEventListener('click', e => { if (e.target === modal) closeDashboard(); });
  }

  function openDashboard() {
    ensureDashboardModal();
    document.getElementById('bdContent').innerHTML = buildDashboardHTML();
    document.getElementById('bdModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDashboard() {
    document.getElementById('bdModal')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  window.cancelBooking = function (idx) {
    const bookings = getBookings();
    if (bookings[idx]) {
      bookings[idx].cancelled = true;
      saveBookings(bookings);
      document.getElementById('bdContent').innerHTML = buildDashboardHTML();
      showToast('Prenotazione annullata.', '🗑️');
    }
  };

  window.clearAllBookings = function () {
    if (!confirm('Vuoi eliminare tutto lo storico prenotazioni?')) return;
    saveBookings([]);
    document.getElementById('bdContent').innerHTML = buildDashboardHTML();
    showToast('Archivio prenotazioni svuotato.', '🗑️');
  };

  // Intercept the booking form submission to save to localStorage
  document.addEventListener('DOMContentLoaded', () => {
    const origForm = document.getElementById('bookForm');
    if (!origForm) return;

    // We listen *after* the original submit (which fires first and closes the modal)
    origForm.addEventListener('submit', (e) => {
      // Collect form data before the original handler resets the form
      // We use a slight delay so the original handler runs first
      const restId = window.currentBookingRestId;
      const name = document.getElementById('bookName')?.value || '';
      const phone = document.getElementById('bookPhone')?.value || '';
      const email = document.getElementById('bookEmail')?.value || '';
      const datetime = document.getElementById('bookTime')?.value || '';
      const guests = parseInt(document.getElementById('bookGuests')?.value || '1');
      const r = RESTAURANTS.find(x => x.id === restId);

      if (!r || !datetime) return;

      setTimeout(() => {
        const bookings = getBookings();
        bookings.unshift({
          restId,
          restName: r.name,
          emoji: r.emoji,
          guestName: name,
          phone,
          email,
          datetime,
          guests,
          cancelled: false,
          ts: Date.now()
        });
        saveBookings(bookings);
        // Update FAB badge
        updateBookingFab();
      }, 100);
    });

    // Dashboard FAB button
    const fab = document.createElement('button');
    fab.id = 'bookingDashFab';
    fab.className = 'booking-dash-fab';
    fab.innerHTML = '📅 <span id="bdBadge" class="bd-badge hidden">0</span>';
    fab.title = 'Le mie prenotazioni';
    fab.addEventListener('click', openDashboard);
    document.body.appendChild(fab);

    updateBookingFab();
  });

  function updateBookingFab() {
    const bookings = getBookings();
    const active = bookings.filter(b => !b.cancelled && new Date(b.datetime) >= new Date()).length;
    const badge = document.getElementById('bdBadge');
    if (badge) {
      badge.textContent = active;
      badge.classList.toggle('hidden', active === 0);
    }
  }

  window._updateBookingFab = updateBookingFab;

})();


// ══════════════════════════════════════════════════════════════
// FEATURE 3 – 🎟️ PROGRAMMA FEDELTÀ & COUPON
// ══════════════════════════════════════════════════════════════

(function initLoyaltyProgram() {

  const REWARDS = [
    { id: 'menu3', label: '3 Menu Aperti', threshold: 3, icon: '🍽️', points: 50, coupon: 'GUIDA10', discount: '–10%', desc: 'Sconto del 10% al prossimo locale' },
    { id: 'fav5', label: '5 Preferiti', threshold: 5, icon: '❤️', points: 75, coupon: 'AMICI15', discount: '–15%', desc: 'Frequentatore abituale: –15%' },
    { id: 'review1', label: '1ª Recensione', threshold: 1, icon: '✍️', points: 100, coupon: 'CRITIC20', discount: '–20%', desc: 'Critico gastronomico: –20%' },
    { id: 'fav10', label: '10 Preferiti', threshold: 10, icon: '🏆', points: 200, coupon: 'VIP25', discount: '–25%', desc: 'Buongustaio V.I.P.: –25%' },
    { id: 'menu10', label: '10 Menu Aperti', threshold: 10, icon: '🌟', points: 150, coupon: 'GOURMET20', discount: '–20%', desc: 'Esploratore: –20%' },
    { id: 'review3', label: '3 Recensioni', threshold: 3, icon: '📝', points: 250, coupon: 'MASTER30', discount: '–30%', desc: 'Maestro recensore: –30%' },
  ];

  function getActivity() {
    return JSON.parse(localStorage.getItem('loyaltyActivity') || '{"menus":0,"favs":0,"reviews":0}');
  }
  function getUnlocked() {
    return JSON.parse(localStorage.getItem('loyaltyUnlocked') || '[]');
  }
  function saveUnlocked(list) {
    localStorage.setItem('loyaltyUnlocked', JSON.stringify(list));
  }

  function checkAndUnlock(activity) {
    const unlocked = getUnlocked();
    const favCount = (JSON.parse(localStorage.getItem('favorites') || '[]')).length;
    const reviewCount = Object.values(JSON.parse(localStorage.getItem('liveReviews') || '{}')).reduce((s, arr) => s + arr.length, 0);

    REWARDS.forEach(reward => {
      if (unlocked.includes(reward.id)) return;
      let met = false;
      if (reward.id.startsWith('menu') && activity.menus >= reward.threshold) met = true;
      if (reward.id.startsWith('fav') && favCount >= reward.threshold) met = true;
      if (reward.id.startsWith('review') && reviewCount >= reward.threshold) met = true;

      if (met) {
        unlocked.push(reward.id);
        saveUnlocked(unlocked);
        setTimeout(() => {
          showToast(`🎉 Coupon sbloccato: <strong>${reward.coupon}</strong> ${reward.discount}`, '🎟️');
          showCouponPopup(reward);
        }, 500);
      }
    });
  }

  function showCouponPopup(reward) {
    const popup = document.createElement('div');
    popup.className = 'coupon-popup';
    popup.innerHTML = `
      <div class="coupon-inner">
        <button class="coupon-close" onclick="this.closest('.coupon-popup').remove()">✕</button>
        <div class="coupon-icon">${reward.icon}</div>
        <div class="coupon-title">Traguardo sbloccato!</div>
        <div class="coupon-badge">${reward.label}</div>
        <div class="coupon-code">${reward.coupon}</div>
        <div class="coupon-discount">${reward.discount}</div>
        <div class="coupon-desc">${reward.desc}</div>
        <div class="coupon-hint">Mostra questo codice alla cassa del locale</div>
        <button class="coupon-copy-btn" onclick="navigator.clipboard.writeText('${reward.coupon}');showToast('Codice copiato!','📋')">📋 Copia Codice</button>
      </div>`;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add('visible'), 50);
  }

  // Track activity globally
  window.trackActivity = function (type) {
    const activity = getActivity();
    if (type === 'menu') activity.menus = (activity.menus || 0) + 1;
    if (type === 'review') activity.reviews = (activity.reviews || 0) + 1;
    localStorage.setItem('loyaltyActivity', JSON.stringify(activity));
    checkAndUnlock(activity);
    renderLoyaltyWidget();
  };

  // Hook into openModal to track menu views
  const _origOpenModal2 = window.openModal;
  window.openModal = function (id) {
    _origOpenModal2(id);
    trackActivity('menu');
  };

  // Hook into toggleFavorite to track favs
  const _origToggleFav = window.toggleFavorite;
  window.toggleFavorite = function (event, id) {
    _origToggleFav(event, id);
    const activity = getActivity();
    checkAndUnlock(activity);
    renderLoyaltyWidget();
  };

  // Loyalty Widget Panel
  function buildLoyaltyHTML() {
    const activity = getActivity();
    const unlocked = getUnlocked();
    const favCount = (JSON.parse(localStorage.getItem('favorites') || '[]')).length;
    const reviewCount = Object.values(JSON.parse(localStorage.getItem('liveReviews') || '{}')).reduce((s, arr) => s + arr.length, 0);
    const totalPoints = unlocked.reduce((s, id) => {
      const r = REWARDS.find(x => x.id === id);
      return s + (r ? r.points : 0);
    }, 0);

    const rewardsHTML = REWARDS.map(reward => {
      const isUnlocked = unlocked.includes(reward.id);
      let progress = 0;
      let current = 0;
      if (reward.id.startsWith('menu')) { current = activity.menus || 0; progress = Math.min(100, (current / reward.threshold) * 100); }
      if (reward.id.startsWith('fav')) { current = favCount; progress = Math.min(100, (current / reward.threshold) * 100); }
      if (reward.id.startsWith('review')) { current = reviewCount; progress = Math.min(100, (current / reward.threshold) * 100); }

      return `
        <div class="lw-reward-card ${isUnlocked ? 'lw-unlocked' : ''}">
          <div class="lw-reward-icon">${isUnlocked ? '✅' : reward.icon}</div>
          <div class="lw-reward-info">
            <div class="lw-reward-label">${reward.label}</div>
            <div class="lw-reward-desc">${reward.desc}</div>
            ${isUnlocked
          ? `<div class="lw-reward-coupon">🎟️ Codice: <strong>${reward.coupon}</strong> ${reward.discount} <button class="lw-copy-btn" onclick="navigator.clipboard.writeText('${reward.coupon}');showToast('Copiato!','📋')">📋</button></div>`
          : `<div class="lw-progress-wrap"><div class="lw-progress-bar" style="width:${progress}%"></div></div>
                 <div class="lw-progress-label">${current}/${reward.threshold}</div>`
        }
          </div>
        </div>`;
    }).join('');

    return `
      <div class="lw-panel">
        <div class="lw-header">
          <div class="lw-title">🎟️ Programma Fedeltà</div>
          <div class="lw-points">⭐ <strong>${totalPoints}</strong> punti accumulati</div>
        </div>
        <div class="lw-stats">
          <div class="lw-stat"><strong>${activity.menus || 0}</strong><span>Menu aperti</span></div>
          <div class="lw-stat"><strong>${favCount}</strong><span>Preferiti</span></div>
          <div class="lw-stat"><strong>${reviewCount}</strong><span>Recensioni</span></div>
          <div class="lw-stat"><strong>${unlocked.length}</strong><span>Coupon</span></div>
        </div>
        <div class="lw-rewards">
          ${rewardsHTML}
        </div>
      </div>`;
  }

  function renderLoyaltyWidget() {
    const panel = document.getElementById('lw-modal-content');
    if (panel) panel.innerHTML = buildLoyaltyHTML();
    // Update FAB badge
    const unlocked = getUnlocked();
    const badge = document.getElementById('lwBadge');
    if (badge) {
      badge.textContent = unlocked.length;
      badge.classList.toggle('hidden', unlocked.length === 0);
    }
  }

  function ensureLoyaltyModal() {
    if (document.getElementById('lwModal')) return;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'lwModal';
    modal.style.cssText = 'z-index: 10025;';
    modal.innerHTML = `
      <div class="modal-box lw-modal-box">
        <button class="modal-close" id="lwClose" aria-label="Chiudi">✕</button>
        <div id="lw-modal-content"></div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('lwClose').addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', e => {
      if (e.target === modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
    });
  }

  function openLoyaltyPanel() {
    ensureLoyaltyModal();
    renderLoyaltyWidget();
    document.getElementById('lwModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Loyalty FAB
  document.addEventListener('DOMContentLoaded', () => {
    const fab = document.createElement('button');
    fab.id = 'loyaltyFab';
    fab.className = 'loyalty-fab';
    fab.innerHTML = '🎟️ <span id="lwBadge" class="lw-badge hidden">0</span>';
    fab.title = 'Programma Fedeltà & Coupon';
    fab.addEventListener('click', openLoyaltyPanel);
    document.body.appendChild(fab);
    renderLoyaltyWidget();
  });

})();


// ══════════════════════════════════════════════════════════════
// FEATURE 4 – 📸 GALLERIA FOTOGRAFICA PIATTI (migliorata)
// ══════════════════════════════════════════════════════════════

(function enhanceDishGallery() {

  // Mappa parole-chiave piatti → query Unsplash
  const DISH_PHOTO_MAP = {
    // Primi
    'risotto': 'risotto italian dish',
    'linguine': 'linguine seafood pasta',
    'tortelli': 'tortelli pasta butter sage',
    'spaghett': 'spaghetti italian pasta',
    'pasta e fagioli': 'pasta e fagioli soup',
    'pappardelle': 'pappardelle wild boar pasta',
    'ravioli': 'ravioli ricotta spinaci',
    // Secondi
    'filetto': 'beef fillet steak restaurant',
    'frittura': 'italian fried seafood',
    'tagliata': 'tagliata manzo rucola',
    'branzino': 'sea bass salt crust',
    'trippa': 'tripe italian dish',
    'arrosto': 'italian roast pork',
    'spezzatino': 'italian stew polenta',
    // Pizze
    'margherita': 'pizza margherita napoletana',
    'marinara': 'pizza marinara',
    'diavola': 'pizza diavola salami',
    'capricciosa': 'pizza capricciosa',
    'salsiccia': 'pizza salsiccia friarielli',
    'quattro formaggi': 'pizza quattro formaggi',
    // Dolci
    'tiramisù': 'tiramisu italian dessert',
    'panna cotta': 'panna cotta dessert caramel',
    'millefoglie': 'millefoglie cream dessert',
    'cannolo': 'cannolo siciliano ricotta',
    'babà': 'babà rum italian pastry',
    // Bar & altro
    'spritz': 'spritz aperol cocktail',
    'negroni': 'negroni cocktail italian',
    'cappuccino': 'cappuccino italian coffee',
    'cornetto': 'italian cornetto croissant',
    'toast': 'toast sandwich italian',
    'espresso': 'espresso coffee cup italy',
    'gelato': 'italian gelato scoop',
    'default': 'italian food restaurant gourmet',
  };

  function getDishQuery(dishName) {
    const lower = dishName.toLowerCase();
    for (const [key, val] of Object.entries(DISH_PHOTO_MAP)) {
      if (lower.includes(key)) return val;
    }
    return DISH_PHOTO_MAP.default;
  }

  // Inject photo thumbnails into menu items in the modal
  function injectDishPhotos(restId) {
    const r = RESTAURANTS.find(x => x.id === restId);
    if (!r) return;

    document.querySelectorAll('.menu-item').forEach(item => {
      if (item.querySelector('.dish-photo-thumb')) return; // already done
      const nameEl = item.querySelector('.mi-name');
      if (!nameEl) return;
      const dishName = nameEl.textContent.replace(/[🌿🌾]/g, '').trim();
      const query = encodeURIComponent(getDishQuery(dishName));
      // Use picsum as free reliable source; for food use unsplash source
      const seed = Math.abs(hashCode(dishName));
      const thumbUrl = `https://source.unsplash.com/80x80/?${query}&sig=${seed}`;

      const thumb = document.createElement('img');
      thumb.className = 'dish-photo-thumb';
      thumb.src = thumbUrl;
      thumb.alt = dishName;
      thumb.loading = 'lazy';
      thumb.title = `Foto: ${dishName}`;
      thumb.onerror = () => thumb.remove();

      // Click → open fullscreen
      thumb.style.cursor = 'zoom-in';
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        openDishPhotoLightbox(dishName, thumbUrl.replace('80x80', '800x600'));
      });

      item.prepend(thumb);
    });
  }

  function openDishPhotoLightbox(name, url) {
    let lb = document.getElementById('dishLightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'dishLightbox';
      lb.className = 'dish-lightbox';
      lb.innerHTML = `
        <div class="dl-inner">
          <button class="dl-close" onclick="document.getElementById('dishLightbox').classList.remove('open')">✕</button>
          <img id="dlImg" src="" alt="" />
          <div id="dlName" class="dl-name"></div>
        </div>`;
      lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
      document.body.appendChild(lb);
    }
    document.getElementById('dlImg').src = url;
    document.getElementById('dlName').textContent = name;
    lb.classList.add('open');
  }

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return h;
  }

  // Hook into openModal
  const _origOpenModal3 = window.openModal;
  window.openModal = function (id) {
    _origOpenModal3(id);
    setTimeout(() => injectDishPhotos(id), 120);
  };

  // Re-inject when tabs are switched (tabs hide/show panels)
  document.addEventListener('click', e => {
    if (e.target.classList.contains('menu-tab')) {
      const match = document.querySelector('.modal-overlay.open .menu-panel.active');
      if (match) setTimeout(() => injectDishPhotos(null), 60);
    }
  });

})();


// ══════════════════════════════════════════════════════════════
// STILI CSS DINAMICI (iniettati in <head>)
// ══════════════════════════════════════════════════════════════

(function injectStyles() {
  const css = `

/* ── RECENSIONI LIVE ── */
.lr-panel { padding: 4px 0 16px; }

.lr-summary-bar {
  display: flex; align-items: center; gap: 20px;
  background: linear-gradient(135deg, #fdf6ec, #f5e8d0);
  border: 1px solid #e2c984;
  border-radius: 14px; padding: 18px 20px; margin-bottom: 22px;
}
.lr-avg-big {
  font-size: 3rem; font-weight: 900; color: #c9932e;
  font-family: 'Playfair Display', serif; line-height: 1;
}
.lr-avg-stars { font-size: 1.3rem; color: #c9932e; letter-spacing: 2px; }
.lr-avg-count { font-size: .82rem; color: #8a6a4a; margin-top: 2px; }
.lr-user-avg { font-size: .8rem; color: #5a3a10; margin-top: 4px;
  background: #fff3d0; border-radius: 8px; padding: 3px 8px; display: inline-block; }

.lr-form-wrap {
  background: #fff; border: 1px solid #e8d9b8; border-radius: 14px;
  padding: 20px; margin-bottom: 22px;
}
.lr-form-wrap h4 { font-size: 1rem; color: #2d1a00; margin-bottom: 14px; }
.lr-input, .lr-textarea {
  width: 100%; border: 1.5px solid #ddd; border-radius: 10px;
  padding: 10px 14px; font-size: .9rem; font-family: 'Inter', sans-serif;
  background: #faf8f5; color: #2d1a00; margin-bottom: 10px; transition: border .2s;
}
.lr-input:focus, .lr-textarea:focus { border-color: #c9932e; outline: none; }
.lr-textarea { resize: vertical; min-height: 80px; }
.lr-stars-label { font-size: .85rem; color: #8a6a4a; margin-bottom: 6px; }
.lr-star-row { display: flex; gap: 6px; margin-bottom: 12px; }
.lr-star {
  font-size: 1.6rem; color: #ddd; cursor: pointer; transition: color .15s, transform .15s;
  user-select: none;
}
.lr-star.lit, .lr-star.selected { color: #f0b429; transform: scale(1.15); }
.lr-submit-btn {
  background: linear-gradient(135deg, #c9932e, #a46f14); color: #fff;
  border: none; border-radius: 10px; padding: 11px 22px;
  font-size: .9rem; font-weight: 700; cursor: pointer; transition: opacity .2s;
  width: 100%;
}
.lr-submit-btn:hover { opacity: .88; }

.lr-review-card {
  display: flex; gap: 14px; padding: 14px 0; border-top: 1px solid #f0e8d8;
}
.lr-rev-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #c9932e, #a46f14);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700; flex-shrink: 0;
}
.lr-rev-header { display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 4px; flex-wrap: wrap; gap: 4px; }
.lr-rev-date { font-size: .75rem; color: #aaa; }
.lr-rev-stars { color: #f0b429; font-size: .95rem; letter-spacing: 1px; margin-bottom: 4px; }
.lr-rev-text { font-size: .85rem; color: #4a3318; line-height: 1.5; }
.lr-rev-badge { font-size: .72rem; color: #2d8a39; margin-top: 5px; }
.lr-empty { color: #aaa; text-align: center; padding: 20px 0; font-size: .9rem; }


/* ── BOOKING DASHBOARD ── */
.booking-dash-fab {
  position: fixed; bottom: 350px; right: 24px; z-index: 9999;
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  color: #fff; border: none; border-radius: 50px;
  padding: 13px 18px; font-size: .85rem; font-weight: 700;
  cursor: pointer; box-shadow: 0 6px 20px rgba(26,115,232,.45);
  display: flex; align-items: center; gap: 6px; transition: transform .2s;
}
.booking-dash-fab:hover { transform: scale(1.06); }
.bd-badge {
  background: #ff3b30; color: #fff; border-radius: 50%;
  width: 20px; height: 20px; display: flex; align-items: center;
  justify-content: center; font-size: .72rem; font-weight: 900;
}
.bd-badge.hidden { display: none; }
.bd-modal-box { max-width: 600px; max-height: 85vh; overflow-y: auto; }
.bd-header { margin-bottom: 20px; }
.bd-header h2 { font-size: 1.4rem; font-family: 'Playfair Display', serif; color: #1a1208; }
.bd-header p { font-size: .85rem; color: #8a6a4a; margin-top: 4px; }
.bd-booking-card {
  display: flex; gap: 14px; align-items: flex-start;
  background: #fff; border: 1px solid #e8d9b8; border-radius: 14px;
  padding: 16px; margin-bottom: 12px; position: relative;
}
.bd-cancelled { opacity: .55; }
.bd-booking-emoji { font-size: 2rem; flex-shrink: 0; }
.bd-booking-info { flex: 1; }
.bd-booking-name { font-weight: 700; font-size: 1rem; color: #1a1208; margin-bottom: 4px; }
.bd-booking-meta { font-size: .8rem; color: #8a6a4a; margin-bottom: 2px; }
.bd-status { font-size: .75rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-top: 6px; display: inline-block; }
.bd-status-active { background: #d4f4dd; color: #1b7a2c; }
.bd-status-past { background: #e8e8e8; color: #666; }
.bd-status-cancelled { background: #fde8e8; color: #b00020; }
.bd-cancel-btn {
  position: absolute; top: 12px; right: 12px;
  background: #fff0f0; color: #b00020; border: 1px solid #fbb;
  border-radius: 8px; padding: 5px 10px; font-size: .78rem;
  cursor: pointer; font-weight: 600;
}
.bd-cancel-btn:hover { background: #ffe0e0; }
.bd-empty { text-align: center; padding: 40px 20px; color: #aaa; }
.bd-empty-icon { font-size: 3rem; margin-bottom: 12px; }
.bd-clear-btn {
  width: 100%; margin-top: 10px; background: #fff0f0; color: #b00020;
  border: 1px solid #fbb; border-radius: 10px; padding: 10px;
  font-size: .85rem; cursor: pointer; font-weight: 600;
}
.bd-clear-btn:hover { background: #ffe0e0; }


/* ── LOYALTY PROGRAM ── */
.loyalty-fab {
  position: fixed; bottom: 280px; right: 24px; z-index: 9999;
  background: linear-gradient(135deg, #7b1fa2, #4a0072);
  color: #fff; border: none; border-radius: 50px;
  padding: 13px 18px; font-size: .85rem; font-weight: 700;
  cursor: pointer; box-shadow: 0 6px 20px rgba(123,31,162,.45);
  display: flex; align-items: center; gap: 6px; transition: transform .2s;
}
.loyalty-fab:hover { transform: scale(1.06); }
.lw-badge {
  background: #ff9800; color: #fff; border-radius: 50%;
  width: 20px; height: 20px; display: flex; align-items: center;
  justify-content: center; font-size: .72rem; font-weight: 900;
}
.lw-badge.hidden { display: none; }
.lw-modal-box { max-width: 600px; max-height: 88vh; overflow-y: auto; }
.lw-panel { padding: 4px 0; }
.lw-header { margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.lw-title { font-size: 1.4rem; font-family: 'Playfair Display', serif; color: #1a1208; }
.lw-points { font-size: .9rem; color: #7b1fa2; font-weight: 700; background: #f3e5f5; padding: 6px 14px; border-radius: 20px; }
.lw-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.lw-stat {
  flex: 1; min-width: 70px; background: #fff; border: 1px solid #e8d9b8;
  border-radius: 12px; padding: 12px; text-align: center;
}
.lw-stat strong { display: block; font-size: 1.4rem; color: #c9932e; font-family: 'Playfair Display', serif; }
.lw-stat span { font-size: .72rem; color: #8a6a4a; }
.lw-rewards { display: flex; flex-direction: column; gap: 10px; }
.lw-reward-card {
  display: flex; gap: 14px; align-items: center;
  background: #fff; border: 1px solid #e8d9b8; border-radius: 12px; padding: 14px;
  transition: border-color .2s;
}
.lw-reward-card.lw-unlocked { border-color: #c9932e; background: linear-gradient(135deg, #fff9ec, #fff4da); }
.lw-reward-icon { font-size: 1.8rem; flex-shrink: 0; }
.lw-reward-info { flex: 1; }
.lw-reward-label { font-weight: 700; font-size: .9rem; color: #1a1208; }
.lw-reward-desc { font-size: .8rem; color: #8a6a4a; margin: 2px 0 6px; }
.lw-reward-coupon { font-size: .85rem; color: #2d8a39; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lw-reward-coupon strong { font-size: .95rem; letter-spacing: 1px; }
.lw-copy-btn { background: #e8f5e9; border: none; border-radius: 6px; padding: 3px 8px; cursor: pointer; font-size: .8rem; }
.lw-progress-wrap { background: #f0e8d8; border-radius: 20px; height: 6px; overflow: hidden; margin-bottom: 3px; }
.lw-progress-bar { height: 100%; background: linear-gradient(90deg, #c9932e, #f0b429); border-radius: 20px; transition: width .5s; }
.lw-progress-label { font-size: .75rem; color: #aaa; }

/* Coupon popup */
.coupon-popup {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(.85);
  z-index: 99999; opacity: 0; transition: all .35s cubic-bezier(.34,1.56,.64,1);
  pointer-events: none;
}
.coupon-popup.visible { opacity: 1; transform: translate(-50%, -50%) scale(1); pointer-events: all; }
.coupon-inner {
  background: linear-gradient(135deg, #7b1fa2, #4a0072);
  color: #fff; border-radius: 20px; padding: 36px 32px; text-align: center;
  max-width: 340px; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,.4);
}
.coupon-close {
  position: absolute; top: 12px; right: 16px; background: rgba(255,255,255,.15);
  border: none; color: #fff; font-size: 1rem; border-radius: 50%;
  width: 28px; height: 28px; cursor: pointer;
}
.coupon-icon { font-size: 3rem; margin-bottom: 8px; }
.coupon-title { font-size: .85rem; text-transform: uppercase; letter-spacing: 2px; opacity: .8; margin-bottom: 4px; }
.coupon-badge { font-size: 1.2rem; font-weight: 700; margin-bottom: 16px; }
.coupon-code {
  font-size: 2rem; font-weight: 900; letter-spacing: 4px;
  background: rgba(255,255,255,.15); border-radius: 12px; padding: 10px 20px;
  margin-bottom: 4px; font-family: monospace;
}
.coupon-discount { font-size: 2.5rem; font-weight: 900; color: #ffd700; margin: 8px 0; }
.coupon-desc { font-size: .85rem; opacity: .85; margin-bottom: 12px; }
.coupon-hint { font-size: .75rem; opacity: .6; margin-bottom: 16px; }
.coupon-copy-btn {
  background: #fff; color: #7b1fa2; border: none; border-radius: 10px;
  padding: 10px 22px; font-weight: 700; cursor: pointer; font-size: .9rem;
}


/* ── DISH PHOTO THUMBNAILS ── */
.dish-photo-thumb {
  width: 64px; height: 64px; object-fit: cover;
  border-radius: 10px; flex-shrink: 0;
  border: 2px solid #f0e0c0; margin-right: 10px;
  transition: transform .2s, box-shadow .2s;
}
.dish-photo-thumb:hover { transform: scale(1.08); box-shadow: 0 4px 14px rgba(0,0,0,.2); }

.menu-item { display: flex; align-items: center; }

.dish-lightbox {
  position: fixed; inset: 0; background: rgba(0,0,0,.85);
  z-index: 99990; display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity .3s;
}
.dish-lightbox.open { opacity: 1; pointer-events: all; }
.dl-inner { position: relative; text-align: center; max-width: 90vw; }
.dl-close {
  position: absolute; top: -40px; right: 0; background: rgba(255,255,255,.15);
  color: #fff; border: none; font-size: 1.2rem; border-radius: 50%;
  width: 36px; height: 36px; cursor: pointer;
}
#dlImg { max-width: 90vw; max-height: 80vh; border-radius: 16px; object-fit: cover; }
.dl-name { color: #fff; font-size: 1rem; font-weight: 600; margin-top: 12px; }

/* Dark mode compat */
[data-theme="dark"] .lr-form-wrap { background: #1e1208; border-color: #3a2810; }
[data-theme="dark"] .lr-input, [data-theme="dark"] .lr-textarea { background: #2a1c10; border-color: #4a3320; color: #f5e8d0; }
[data-theme="dark"] .lr-summary-bar { background: linear-gradient(135deg, #1e1208, #2a1a08); }
[data-theme="dark"] .bd-booking-card, [data-theme="dark"] .lw-reward-card, [data-theme="dark"] .lw-stat { background: #1e1208; border-color: #3a2810; }

`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();
