
/* ================================================
   LIVE TICKER BAR & TIME WIDGET
   ================================================ */

.live-ticker-bar {
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  border-bottom: 1px solid rgba(201, 147, 58, 0.2);
  height: 38px;
  overflow: hidden;
  z-index: 800;
  position: relative;
}

.live-badge {
  background: #9b1c1c;
  color: #fff;
  padding: 0 16px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  letter-spacing: 0.05em;
  position: relative;
  z-index: 2;
  box-shadow: 4px 0 10px rgba(0,0,0,0.5);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #ff3b30;
  border-radius: 50%;
  animation: livePulse 1.5s infinite;
}

@keyframes livePulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(255, 59, 48, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); }
}

.marquee-wrap {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.marquee-content {
  display: flex;
  gap: 60px;
  white-space: nowrap;
  animation: marqueeScroll 25s linear infinite;
}

.marquee-content span {
  color: #d4b88a;
}

@keyframes marqueeScroll {
  from { transform: translateX(100%); }
  to { transform: translateX(-100%); }
}

.time-widget-card {
  position: relative;
  margin-bottom: 24px;
  align-self: flex-start;
  background: rgba(15, 10, 5, 0.85);
  border: 1px solid rgba(201, 147, 58, 0.5);
  border-left: 4px solid var(--gold);
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 10;
  max-width: 400px;
  transform: translateY(-20px);
  opacity: 0;
  animation: fadeSlideDown 0.8s ease forwards 0.5s;
}

@keyframes fadeSlideDown {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.tw-icon {
  font-size: 2.2rem;
}

.tw-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.tw-info strong {
  color: var(--gold-l);
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
}

.tw-info span {
  color: #c4a87a;
  font-size: 0.78rem;
  line-height: 1.3;
}

.tw-clock {
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  background: rgba(255,255,255,0.1);
  padding: 8px 12px;
  border-radius: 8px;
  letter-spacing: 0.05em;
}

@media (max-width: 768px) {
  .time-widget-card {
    position: relative;
    top: 0;
    left: 0;
    margin-bottom: 20px;
    width: 100%;
  }
}
