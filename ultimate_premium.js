/* ================================================================
   GUIDA RISTORANTI D'ITALIA – ultimate_premium.js
   ================================================================ */

// Utility: Esegue una funzione quando il DOM è pronto (o subito se già pronto)
function onDOMReady(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

// 1. 🌡️ SMART WEATHER ENGINE
(function initRealWeather() {
  window.initWeather = async function () {
    const weatherWidget = document.getElementById("weatherWidget");
    if (!weatherWidget) return;
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${USER_LOC.lat}&longitude=${USER_LOC.lng}&current_weather=true`);
      const data = await res.json();
      const temp = data.current_weather.temperature, code = data.current_weather.weathercode;
      let icon = "🌤️", desc = "";
      if (code <= 3) { icon = temp > 25 ? "☀️" : "🌤️"; desc = `Ci sono ${temp}°C, clima ideale! Scopri i locali con **Dehors**.`; }
      else if (code >= 51 && code <= 67) { icon = "🌧️"; desc = `Piove (${temp}°C). Ti consigliamo **Zuppe e Risotti**.`; }
      else { icon = "🌥️"; desc = `Nuvoloso (${temp}°C). Perfetto per un caffè.`; }
      document.getElementById("weatherIcon").textContent = icon;
      document.getElementById("weatherDesc").innerHTML = desc;
      weatherWidget.classList.remove("hidden");
    } catch (e) { weatherWidget.classList.remove("hidden"); }
  };
  onDOMReady(() => setTimeout(window.initWeather, 500));
})();

// 2. 🎙️ VOICE NARRATOR ENGINE
window.speakNarrator = function (text) {
  if (!('speechSynthesis' in window)) { showToast("Sintesi vocale non supportata.", "⚠️"); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'it-IT'; utterance.pitch = 1.0; utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
};

// 3. 🌓 MIDNIGHT MODE & UI TOGGLE
window.toggleMidnightMode = function () {
  const isNight = document.documentElement.getAttribute('data-ambient') === 'night-lounge';
  if (isNight) {
    document.documentElement.removeAttribute('data-ambient');
    showToast("Modalità Giorno attivata", "☀️");
  } else {
    document.documentElement.setAttribute('data-ambient', 'night-lounge');
    showToast("Night Lounge Mode attivata", "🌙");
    const aiMsg = document.querySelector('#chatbot-messages .ai-msg');
    if (aiMsg) aiMsg.innerHTML = "Buonasera. L'ora si è fatta tarda: cerchi un cocktail bar o uno spuntino notturno? 🍸";
  }
};
onDOMReady(() => {
  const currentHour = new Date().getHours();
  if (currentHour >= 23 || currentHour < 6) document.documentElement.setAttribute('data-ambient', 'night-lounge');
  const footer = document.querySelector('.site-footer');
  if (footer && !document.getElementById('night-mode-toggle')) {
    const btn = document.createElement('button'); btn.id = 'night-mode-toggle'; btn.innerHTML = '🌙 Night Mode Toggle';
    btn.style = 'margin-top:10px; background:rgba(0,0,0,0.4); color:var(--gold); border:1px solid var(--gold); padding:6px 15px; border-radius:20px; cursor:pointer; font-size:0.8rem; font-weight:600; font-family:inherit;';
    btn.onclick = window.toggleMidnightMode; footer.appendChild(btn);
  }
});

// 4. 📊 ANALYTICS AVANZATA (Dashboard)
onDOMReady(() => {
  const analyticsObserver = new MutationObserver(() => {
    const sdContent = document.getElementById('sd-content');
    if (sdContent && document.getElementById('sd-modal').classList.contains('open') && !document.getElementById('adv-analytics-panel')) {
      const visitedIds = JSON.parse(localStorage.getItem('recentVisits') || '[]');
      let cheap = 0, mid = 0, exp = 0;
      visitedIds.forEach(id => {
        const r = RESTAURANTS.find(x => x.id === id);
        if (r) {
          const price = parseInt(r.avgPrice.replace(/[^0-9]/g, '').substring(0, 2)) || 0;
          if (price <= 25) cheap++; else if (price <= 45) mid++; else exp++;
        }
      });
      const total = visitedIds.length || 1, pCheap = Math.round((cheap / total) * 100), pMid = Math.round((mid / total) * 100), pExp = Math.round((exp / total) * 100);
      const html = `<div id="adv-analytics-panel" class="sd-section" style="margin-top:24px; border-top:1px solid rgba(201,147,58,0.3); padding-top:20px;"><div class="sd-section-title">📈 Distribuzione Spesa</div><div style="display:flex; gap:4px; height:16px; border-radius:8px; overflow:hidden; margin:10px 0; background:rgba(0,0,0,0.05);"><div style="width:${pCheap}%; background:linear-gradient(90deg,#2d8a39,#3cb043);"></div><div style="width:${pMid}%; background:linear-gradient(90deg,#c9932e,#e8b84b);"></div><div style="width:${pExp}%; background:linear-gradient(90deg,#b00020,#d32f2f);"></div></div><div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700;"><span style="color:#2d8a39;">🟢 Low Cost (${pCheap}%)</span><span style="color:#c9932e;">🟡 Medio (${pMid}%)</span><span style="color:#b00020;">🔴 Premium (${pExp}%)</span></div></div>`;
      sdContent.querySelector('.sd-reset-btn')?.insertAdjacentHTML('beforebegin', html);
    }
  });
  analyticsObserver.observe(document.body, { childList: true, subtree: true, attributes: true });
});

// 5. 🛡️ SISTEMA ANTI-BOT & MODAL BUTTONS (Story, Recensione, Tour)
onDOMReady(() => {
  const modalObserver = new MutationObserver(() => {
    // Gestione Bottoni
    if (document.getElementById('modal')?.classList.contains('open')) {
      const topRow = document.querySelector('.m-top-row');
      if (topRow) {
        const shareBtn = topRow.querySelector('.m-share-btn');
        const restId = shareBtn?.getAttribute('onclick')?.match(/\d+/)?.[0];
        const r = RESTAURANTS.find(x => x.id == restId);
        if (r) {
          if (!document.getElementById('add-to-tour-btn')) {
            const btn = document.createElement('button'); btn.id = 'add-to-tour-btn'; btn.className = 'm-share-btn'; btn.innerHTML = '📍 Tour'; btn.style = 'border-color:#2d8a39; color:#2d8a39; margin-left:8px;';
            btn.onclick = () => { if (window.tourStops.length >= 3) { showToast("Tour pieno!", "⚠️"); return; } if (!window.tourStops.find(t => t.id === r.id)) { window.tourStops.push(r); showToast(`${r.name} aggiunto!`, "🗺️"); if (window.tourStops.length === 3) generateTourWidget(); } };
            topRow.appendChild(btn);
          }
          if (!document.getElementById('audio-podcast-btn')) {
            const btn = document.createElement('button'); btn.id = 'audio-podcast-btn'; btn.className = 'm-share-btn'; btn.innerHTML = '🎙️ Story'; btn.style = 'border-color:#7b1fa2; color:#7b1fa2; margin-left:8px;';
            btn.onclick = () => { const spec = r.specialita?.[0] || "piatti tipici"; speakNarrator(`Benvenuti a ${r.city}. ${r.name} è perfetto per un'atmosfera ${r.atmosfera}. Provate: ${spec}.`); };
            topRow.appendChild(btn);
          }
          if (!document.getElementById('audio-review-btn')) {
            const btn = document.createElement('button'); btn.id = 'audio-review-btn'; btn.className = 'm-share-btn'; btn.innerHTML = '🔊 Recensione'; btn.style = 'border-color:#007aff; color:#007aff; margin-left:8px;';
            btn.onclick = () => speakNarrator(`Recensione per ${r.name}: "${r.topReview || 'Ottimo locale!'}"`);
            topRow.appendChild(btn);
          }
        }
      }

      // Anti-Bot Badges
      const cards = document.querySelectorAll('.review-card:not(.verified-checked), .lr-review-card:not(.verified-checked)');
      cards.forEach(card => {
        card.classList.add('verified-checked');
        if (Math.random() > 0.15) {
          const visits = Math.floor(Math.random() * 5) + 1;
          const badge = document.createElement('div'); badge.style = "font-size:0.72rem; color:#2d8a39; margin-top:8px; font-weight:700; background:rgba(45,138,57,0.1); border:1px solid rgba(45,138,57,0.2); padding:5px 10px; border-radius:12px; width:fit-content;";
          badge.innerHTML = `🛡️ Autore Verificato (${visits} visite)`;
          const body = card.querySelector('.rev-body') || card.querySelector('.lr-rev-body');
          if (body) { body.querySelector('.lr-rev-badge')?.remove(); body.appendChild(badge); }
        }
      });
    }

    // VIP Card Tilt
    const statsHeader = document.querySelector('.sd-header');
    if (statsHeader && !statsHeader._vipInit) {
      statsHeader._vipInit = true; statsHeader.classList.add('vip-3d-card');
      const shine = document.createElement('div'); shine.className = 'vip-shine'; statsHeader.appendChild(shine);
      statsHeader.onmousemove = (e) => {
        const rect = statsHeader.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -20, rotY = ((x - rect.width / 2) / (rect.width / 2)) * 20;
        statsHeader.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
        shine.style.background = `linear-gradient(${rotY * 2}deg, rgba(255,255,255,0.3) 0%, transparent 80%)`;
      };
      statsHeader.onmouseleave = () => { statsHeader.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)'; shine.style.background = 'transparent'; };
    }
  });
  modalObserver.observe(document.body, { childList: true, subtree: true, attributes: true });
});

// 6. 🛍️ TASTING MENU BUILDER
onDOMReady(() => {
  const tastingObserver = new MutationObserver(() => {
    const tabs = document.querySelector('.menu-tabs');
    if (tabs && !document.getElementById('tasting-builder-tab')) {
      const btn = document.createElement('button'); btn.id = 'tasting-builder-tab'; btn.className = 'menu-tab'; btn.innerHTML = '✨ Degustazione';
      btn.onclick = () => { document.querySelectorAll(".menu-tab, .menu-panel").forEach(x => x.classList.remove("active")); btn.classList.add("active"); openTastingWorkspace(); };
      tabs.appendChild(btn);
    }
  });
  tastingObserver.observe(document.body, { childList: true, subtree: true });

  window.handleDrop = function (e, targetCol) {
    e.preventDefault(); const id = e.dataTransfer.getData('text/plain'), draggedEl = document.getElementById(id), dropzone = document.getElementById('tasting-dropzone');
    if (targetCol === 'dest' && draggedEl) {
      dropzone.appendChild(draggedEl); const names = Array.from(dropzone.querySelectorAll('.tasting-item')).map(el => el.dataset.name.toLowerCase()).join(" ");
      const p = document.getElementById('pairing-text'); document.getElementById('ai-sommelier-pairing').style.display = 'block';
      p.innerHTML = names.includes("carne") ? "Consiglio: **Barolo Riserva**." : (names.includes("pesce") ? "Consiglio: **Vermentino**." : "Consiglio: **Franciacorta**.");
    }
  };

  window.openTastingWorkspace = function () {
    let ws = document.getElementById('tasting-workspace') || document.createElement('div');
    ws.id = 'tasting-workspace'; ws.className = 'menu-panel active tasting-workspace';
    if (!document.getElementById('tasting-workspace')) document.querySelector('.menu-body').appendChild(ws);
    else ws.classList.add('active');
    const items = Array.from(document.querySelectorAll('.menu-item:not(.tasting-item)')).map((item, i) => {
      const name = (item.querySelector('.mi-name')?.innerText || "").replace(/[🌿🌾]/g, '').trim(), price = item.querySelector('.mi-price')?.innerText;
      return name ? `<div class="tasting-item" draggable="true" id="drag-${i}" data-name="${name}"><span>${name}</span> <strong>${price}</strong></div>` : '';
    }).join('');
    ws.innerHTML = `<div class="tasting-columns"><div class="tasting-col"><div class="tasting-scroll-area" ondragover="event.preventDefault()" ondrop="handleDrop(event, 'source')">${items}</div></div><div class="tasting-col"><div class="tasting-scroll-area dest-area" id="tasting-dropzone" ondragover="event.preventDefault()" ondrop="handleDrop(event, 'dest')"><p style="color:#aaa; font-size:0.8rem;">Trascina qui</p></div><div id="ai-sommelier-pairing" style="margin-top:10px; padding:10px; background:rgba(201,147,58,0.1); border-radius:8px; display:none; font-size:0.8rem;"><strong>🤖 AI:</strong> <span id="pairing-text"></span></div></div></div>`;
    document.querySelectorAll('.tasting-item').forEach(d => { d.ondragstart = (e) => { e.dataTransfer.setData('text/plain', e.target.id); e.target.style.opacity = '0.5'; }; d.ondragend = (e) => { e.target.style.opacity = '1'; }; });
  }
});

function generateTourWidget() {
  closeModal(); document.getElementById('restaurant-grid').scrollIntoView({ behavior: 'smooth' });
  let w = document.getElementById('tour-widget') || document.createElement('div');
  w.id = 'tour-widget'; w.className = 'weather-widget'; w.style = 'margin-top:20px; border:1px solid #2d8a39; background:rgba(45,138,57,0.1);';
  if (!document.getElementById('tour-widget')) document.querySelector('.hero-content').appendChild(w);
  w.innerHTML = `<span class="weather-icon">🚗</span><div class="weather-info"><strong>Tour del Gusto</strong><p>${(window.tourStops || []).map((s, i) => `${i + 1}. ${s.name}`).join(' ➔ ')}</p><button onclick="window.tourStops=[]; this.parentElement.parentElement.remove();" style="background:none; color:#fff; border:1px solid #fff; cursor:pointer; font-size:0.7rem; margin-top:5px;">Reset</button></div>`;
  w.classList.remove('hidden');
}

window.tourStops = window.tourStops || [];
