/* ================================================================
   GUIDA RISTORANTI D'ITALIA – premium_effects.js
   Funzionalità Premium:
   1. 🃏  3D Tilt Cards con riflesso dinamico
   2. 🎬  Scroll Reveal Animations (Intersection Observer)
   3. ✨  Background Bokeh immersivo con particelle animate
   4. 💀  Skeleton Screens per caricamenti fluidi
   5. 🔊  Voice Sommelier (sintesi vocale del chatbot AI)
   ================================================================ */

/* ══════════════════════════════════════════════════════════════
   1. 🃏 3D TILT CARDS — Inclinazione prospettica + riflesso luce
   ══════════════════════════════════════════════════════════════ */

(function init3DTiltCards() {

  // Configurazione tilt
  const TILT_MAX  = 15;   // gradi massimi di inclinazione
  const SHINE_OP  = 0.18; // opacità massima del riflesso

  function applyTilt(card) {
    // Evita doppia inizializzazione
    if (card._tiltInit) return;
    card._tiltInit = true;

    // Layer riflesso (shine)
    const shine = document.createElement('div');
    shine.className = 'tilt-shine';
    card.appendChild(shine);

    card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange = 'transform';

    function onMove(e) {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;

      // Posizione cursore relativa al centro carta
      let clientX, clientY;
      if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const dx = (clientX - cx) / (rect.width  / 2);
      const dy = (clientY - cy) / (rect.height / 2);

      const rotX = -dy * TILT_MAX;
      const rotY =  dx * TILT_MAX;

      card.style.transform =
        `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`;
      card.style.boxShadow =
        `${-rotY * 1.2}px ${rotX * 1.2}px 40px rgba(0,0,0,0.22), 0 8px 32px rgba(0,0,0,0.14)`;

      // Shine: angolo opposto al cursore
      const angle   = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      const dist    = Math.min(Math.sqrt(dx * dx + dy * dy), 1);
      shine.style.opacity  = dist * SHINE_OP;
      shine.style.transform = `rotate(${angle}deg)`;
    }

    function onLeave() {
      card.style.transition  = 'transform 0.5s cubic-bezier(.23,1,.32,1), box-shadow 0.5s ease';
      card.style.transform   = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      card.style.boxShadow   = '';
      shine.style.opacity    = '0';
    }

    card.addEventListener('mousemove',  onMove);
    card.addEventListener('touchmove',  onMove, { passive: true });
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('touchend',   onLeave);
  }

  // Applica alle card esistenti e future (MutationObserver)
  function attachToCards() {
    document.querySelectorAll('.card').forEach(applyTilt);
  }

  // Observer per nuove card iniettate dinamicamente
  const gridObs = new MutationObserver(attachToCards);
  const grid = document.getElementById('cardsGrid');
  if (grid) gridObs.observe(grid, { childList: true });

  // Primo attach dopo DOM pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachToCards);
  } else {
    attachToCards();
    // Anche dopo render iniziale (renderCards è asincrono)
    setTimeout(attachToCards, 600);
  }

  // CSS inline per lo shine layer
  const css = `
    .card { position: relative; overflow: hidden; }
    .tilt-shine {
      position: absolute; inset: -50%;
      background: linear-gradient(
        105deg,
        rgba(255,255,255,0) 40%,
        rgba(255,255,255,0.85) 50%,
        rgba(255,255,255,0) 60%
      );
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      z-index: 10;
      border-radius: inherit;
      transform-origin: center;
    }
  `;
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);

})();


/* ══════════════════════════════════════════════════════════════
   2. 🎬 SCROLL REVEAL ANIMATIONS
   ══════════════════════════════════════════════════════════════ */

(function initScrollReveal() {

  const CSS = `
    .sr-hidden {
      opacity: 0;
      transform: translateY(40px) scale(0.97);
      transition: opacity 0.65s cubic-bezier(.23,1,.32,1),
                  transform 0.65s cubic-bezier(.23,1,.32,1);
    }
    .sr-visible {
      opacity: 1 !important;
      transform: none !important;
    }
    .sr-from-left  { transform: translateX(-50px) scale(0.97); }
    .sr-from-right { transform: translateX(50px)  scale(0.97); }
    .sr-zoom       { transform: scale(0.85); }
  `;
  const s = document.createElement('style');
  s.textContent = CSS;
  document.head.appendChild(s);

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('sr-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function revealEl(el, delay = 0, variant = '') {
    if (el._srInit) return;
    el._srInit = true;
    el.classList.add('sr-hidden');
    if (variant) el.classList.add(variant);
    el.style.transitionDelay = delay + 'ms';
    io.observe(el);
  }

  // Applica agli elementi statici della pagina
  function revealStatic() {
    // Hero elements
    document.querySelectorAll('.hero-content > *').forEach((el, i) => revealEl(el, i * 80));
    document.querySelectorAll('.hero-stats .stat').forEach((el, i) => revealEl(el, 200 + i * 80, 'sr-zoom'));
    document.querySelectorAll('.hero-map-card').forEach(el => revealEl(el, 300, 'sr-from-right'));
    // Section header
    document.querySelectorAll('.section-head > *').forEach((el, i) => revealEl(el, i * 80));
    // Footer
    document.querySelectorAll('.site-footer > *').forEach((el, i) => revealEl(el, i * 60));
  }

  // Applica alle card dinamiche
  function revealCards() {
    document.querySelectorAll('.card:not(._srInit)').forEach((el, i) => {
      const delay = (i % 4) * 90; // stagger per riga
      const variant = (i % 3 === 1) ? 'sr-from-left' : (i % 3 === 2) ? 'sr-from-right' : '';
      revealEl(el, delay, variant);
    });
  }

  // Observer sulle card
  const cardObs = new MutationObserver(revealCards);
  const grid = document.getElementById('cardsGrid');
  if (grid) cardObs.observe(grid, { childList: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { revealStatic(); setTimeout(revealCards, 300); });
  } else {
    revealStatic();
    setTimeout(revealCards, 400);
  }

})();


/* ══════════════════════════════════════════════════════════════
   3. ✨ BACKGROUND BOKEH IMMERSIVO
   ══════════════════════════════════════════════════════════════ */

(function initBokehBackground() {

  const canvas = document.createElement('canvas');
  canvas.id = 'bokeh-canvas';
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: -1;
    opacity: 0.55;
  `;
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');

  // Colori bokeh ispirati alla palette del sito (caldi, italiani)
  const COLORS = [
    'rgba(201,147,58,',   // oro
    'rgba(155,28,28,',    // rosso
    'rgba(240,180,41,',   // ambra
    'rgba(120,80,30,',    // marrone caldo
    'rgba(250,220,150,',  // giallo panna
    'rgba(200,100,50,',   // terracotta
  ];

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles(n = 38) {
    particles = Array.from({ length: n }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  30 + Math.random() * 90,        // raggio grande = bokeh realistico
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.04 + Math.random() * 0.10,
      pulse: Math.random() * Math.PI * 2, // fase per pulsazione
    }));
  }

  function drawParticle(p) {
    p.pulse += 0.008;
    const r = p.r + Math.sin(p.pulse) * 10; // lieve pulsazione
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    grd.addColorStop(0,   p.color + (p.alpha * 1.4).toFixed(3) + ')');
    grd.addColorStop(0.4, p.color + p.alpha.toFixed(3) + ')');
    grd.addColorStop(1,   p.color + '0)');
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      // Rimbalzo morbido ai bordi
      if (p.x < -p.r)    p.x = W + p.r;
      if (p.x > W + p.r) p.x = -p.r;
      if (p.y < -p.r)    p.y = H + p.r;
      if (p.y > H + p.r) p.y = -p.r;
      drawParticle(p);
    });
    requestAnimationFrame(tick);
  }

  resize();
  createParticles();
  tick();
  window.addEventListener('resize', () => { resize(); createParticles(); });

  // Reattività al mouse: le particelle si allontanano delicatamente
  window.addEventListener('mousemove', e => {
    const mx = e.clientX, my = e.clientY;
    particles.forEach(p => {
      const dist = Math.hypot(p.x - mx, p.y - my);
      if (dist < 150) {
        const angle = Math.atan2(p.y - my, p.x - mx);
        p.dx += Math.cos(angle) * 0.04;
        p.dy += Math.sin(angle) * 0.04;
        // Limita velocità
        p.dx = Math.max(-0.8, Math.min(0.8, p.dx));
        p.dy = Math.max(-0.8, Math.min(0.8, p.dy));
      }
    });
  });

})();


/* ══════════════════════════════════════════════════════════════
   4. 💀 SKELETON SCREENS
   ══════════════════════════════════════════════════════════════ */

(function initSkeletonScreens() {

  const SKELETON_CSS = `
    @keyframes sk-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    .sk-base {
      background: linear-gradient(90deg, #f0e8d8 25%, #fdf3e3 50%, #f0e8d8 75%);
      background-size: 1200px 100%;
      animation: sk-shimmer 1.5s infinite linear;
      border-radius: 8px;
    }
    .skeleton-card {
      background: #fffaf2;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 4px 18px rgba(0,0,0,0.07);
      min-height: 380px;
    }
    .sk-img  { height: 180px; width: 100%; }
    .sk-body { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
    .sk-tag  { height: 14px; width: 60px; }
    .sk-name { height: 20px; width: 85%; }
    .sk-city { height: 13px; width: 45%; }
    .sk-desc { height: 13px; width: 100%; }
    .sk-desc2{ height: 13px; width: 70%; }
    .sk-btn  { height: 38px; width: 110px; border-radius: 10px; margin-top: 8px; }
  `;
  const st = document.createElement('style');
  st.textContent = SKELETON_CSS;
  document.head.appendChild(st);

  function skeletonCardHTML() {
    return `
      <div class="skeleton-card">
        <div class="sk-img  sk-base"></div>
        <div class="sk-body">
          <div class="sk-tag  sk-base"></div>
          <div class="sk-name sk-base"></div>
          <div class="sk-city sk-base"></div>
          <div class="sk-desc sk-base"></div>
          <div class="sk-desc2 sk-base"></div>
          <div class="sk-btn  sk-base"></div>
        </div>
      </div>`;
  }

  function showSkeletons(n = 8) {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return;
    grid.innerHTML = Array(n).fill(skeletonCardHTML()).join('');
  }

  function hideSkeletons() {
    // chiamato implicitamente da renderCards (sovrascrive innerHTML)
  }

  // Patch renderCards: mostra skeleton prima del render reale
  const _origRenderCards = window.renderCards;
  if (typeof _origRenderCards === 'function') {
    window.renderCards = function(list) {
      showSkeletons(Math.min(list.length, 8));
      // Piccolo delay per far vedere l'animazione
      setTimeout(() => _origRenderCards(list), 420);
    };
  }

  // Skeleton anche al primo caricamento
  showSkeletons(8);

})();


/* ══════════════════════════════════════════════════════════════
   5. 🔊 VOICE SOMMELIER — Sintesi vocale del chatbot AI
   ══════════════════════════════════════════════════════════════ */

(function initVoiceSommelier() {

  const synth = window.speechSynthesis;
  if (!synth) return; // browser non supportato

  // ── Configurazione voce ──
  let voice     = null;
  let isSpeaking = false;
  let voiceEnabled = true; // ON di default

  function pickItalianVoice() {
    const voices = synth.getVoices();
    // Preferenza: italiano → español (simile) → qualsiasi
    return voices.find(v => v.lang.startsWith('it')) ||
           voices.find(v => v.lang.startsWith('es')) ||
           voices[0] || null;
  }

  function loadVoices() {
    voice = pickItalianVoice();
  }
  synth.addEventListener('voiceschanged', loadVoices);
  loadVoices();

  // ── Funzione speak ──
  window.sommelierSpeak = function(text) {
    if (!voiceEnabled || !synth) return;
    synth.cancel(); // interrompe eventuale lettura precedente

    // Pulizia testo (rimuove emoji, HTML, markdown)
    const clean = text
      .replace(/<[^>]+>/g, '')
      .replace(/[🍝🍷🍕☕🥐🤖🌟💸🚗⭐🥩🍸🍴❤️📍🎉✅⚠️📤]/gu, '')
      .replace(/\\*\\*/g, '')
      .replace(/\\s+/g, ' ')
      .trim()
      .substring(0, 280); // max 280 caratteri per fluidità

    const utter = new SpeechSynthesisUtterance(clean);
    if (voice) utter.voice = voice;
    utter.lang  = 'it-IT';
    utter.rate  = 0.95;
    utter.pitch = 1.05;
    utter.volume = 0.9;

    utter.onstart = () => {
      isSpeaking = true;
      updateVoiceUI(true);
    };
    utter.onend = utter.onerror = () => {
      isSpeaking = false;
      updateVoiceUI(false);
    };

    synth.speak(utter);
  };

  // ── UI: pulsante ON/OFF voce nella header chatbot ──
  function injectVoiceToggle() {
    const header = document.querySelector('.chatbot-header .chat-header-info');
    if (!header || document.getElementById('voice-toggle-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'voice-toggle-btn';
    btn.title = 'Attiva/Disattiva voce';
    btn.innerHTML = '🔊';
    btn.style.cssText = `
      background: rgba(201,147,58,0.18); border: none; border-radius: 8px;
      padding: 5px 9px; cursor: pointer; font-size: 1.1rem;
      transition: background .2s, transform .15s; margin-left: 8px;
    `;
    btn.onclick = () => {
      voiceEnabled = !voiceEnabled;
      if (!voiceEnabled) synth.cancel();
      btn.innerHTML = voiceEnabled ? '🔊' : '🔇';
      btn.style.background = voiceEnabled
        ? 'rgba(201,147,58,0.18)'
        : 'rgba(180,0,0,0.12)';
      showToast(voiceEnabled ? 'Voce Sommelier attivata 🔊' : 'Voce disattivata 🔇', voiceEnabled ? '🔊' : '🔇');
    };

    // Inserisce dopo le info avatar
    header.appendChild(btn);
  }

  // ── Indicatore "sta parlando" (onda animata) ──
  function updateVoiceUI(speaking) {
    const btn = document.getElementById('voice-toggle-btn');
    if (!btn) return;
    btn.style.transform = speaking ? 'scale(1.2)' : 'scale(1)';
    btn.style.background = speaking
      ? 'rgba(201,147,58,0.4)'
      : (voiceEnabled ? 'rgba(201,147,58,0.18)' : 'rgba(180,0,0,0.12)');
  }

  // ── Patch appendAIMessage: fa parlare ogni risposta AI ──
  // Attende che features_addon.js definisca appendAIMessage
  function patchAppendAIMessage() {
    const _orig = window.appendAIMessage;
    if (typeof _orig !== 'function') {
      // Riprova tra poco
      setTimeout(patchAppendAIMessage, 200);
      return;
    }
    window.appendAIMessage = function(text) {
      _orig(text);
      sommelierSpeak(text);
    };
  }
  patchAppendAIMessage();

  // ── Pulsante microfono: Speech-to-Text (Web Speech API) ──
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById('chat-mic-btn');

  if (SpeechRecognition && micBtn) {
    const recog = new SpeechRecognition();
    recog.lang = 'it-IT';
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    let isListening = false;

    recog.onresult = e => {
      const transcript = e.results[0][0].transcript;
      const input = document.getElementById('chat-input-text');
      if (input) {
        input.value = transcript;
        // Simula invio automatico
        document.getElementById('chat-send-btn')?.click();
      }
    };

    recog.onstart = () => {
      isListening = true;
      micBtn.style.background = 'rgba(155,28,28,0.85)';
      micBtn.style.color = '#fff';
      showToast('Parla pure… ti ascolto!', '🎙️');
    };

    recog.onend = () => {
      isListening = false;
      micBtn.style.background = '';
      micBtn.style.color = '';
    };

    recog.onerror = () => {
      isListening = false;
      micBtn.style.background = '';
      showToast('Microfono non disponibile', '⚠️');
    };

    micBtn.addEventListener('click', () => {
      if (isListening) {
        recog.stop();
      } else {
        synth.cancel(); // stoppa voce prima di ascoltare
        recog.start();
      }
    });

  } else if (micBtn) {
    // Browser non supporta il riconoscimento vocale
    micBtn.title = 'Riconoscimento vocale non disponibile in questo browser';
    micBtn.style.opacity = '0.4';
    micBtn.style.cursor = 'not-allowed';
  }

  // ── Inietta il toggle voce quando il chatbot viene aperto ──
  const chatBtn = document.getElementById('chatbot-fab');
  if (chatBtn) {
    chatBtn.addEventListener('click', () => {
      setTimeout(injectVoiceToggle, 150);
    });
  }

  // Tentativo anticipato (se finestra già aperta)
  setTimeout(injectVoiceToggle, 800);

  // ── CSS aggiuntivo per il microfono ──
  const css = \`
    .chat-mic-btn {
      background: rgba(201,147,58,0.15);
      border: 1.5px solid rgba(201,147,58,0.4);
      border-radius: 10px; padding: 0 10px;
      cursor: pointer; color: #9b1c1c;
      transition: background .2s, transform .15s;
      display: flex; align-items: center;
    }
    .chat-mic-btn:hover { background: rgba(155,28,28,0.15); transform: scale(1.08); }
    .chat-mic-btn .material-icons-round { font-size: 1.2rem; }

    /* Animazione onda speaking */
    @keyframes voice-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(201,147,58,0.5); }
      50%       { box-shadow: 0 0 0 8px rgba(201,147,58,0); }
    }
    #voice-toggle-btn.speaking { animation: voice-pulse 0.8s infinite; }
  \`;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

})();
