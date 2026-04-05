/**
 * particles.js — Canvas-based particle and effect system
 * Exposes window.Particles with burst, lightning, comboText, flash, and clear.
 */
(function () {
  'use strict';

  // Respect prefers-reduced-motion
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let canvas = null;
  let ctx = null;

  // Effect pools
  let particles = [];
  let lightnings = [];
  let texts = [];
  let flashAlpha = 0;

  let running = false;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function getColors() {
    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue('--particle-primary').trim() || '#ffffff';
    const secondary = style.getPropertyValue('--particle-secondary').trim() || '#ffdd00';
    return { primary, secondary };
  }

  function hasActiveEffects() {
    return (
      particles.length > 0 ||
      lightnings.length > 0 ||
      texts.length > 0 ||
      flashAlpha >= 0.001
    );
  }

  function ensureRunning() {
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  // ── Animation loop ───────────────────────────────────────────────────────────

  function tick() {
    if (!canvas || !ctx) {
      running = false;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateAndDrawParticles();
    updateAndDrawLightnings();
    updateAndDrawTexts();
    updateAndDrawFlash();

    if (hasActiveEffects()) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  }

  // ── Particles ────────────────────────────────────────────────────────────────

  function updateAndDrawParticles() {
    const alive = [];
    for (const p of particles) {
      p.life -= p.decay;
      if (p.life <= 0) continue;

      p.vx *= 0.96;
      p.vy *= 0.96;
      p.x += p.vx;
      p.y += p.vy;

      const currentSize = p.size * p.life;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, currentSize), 0, Math.PI * 2);
      ctx.fill();

      alive.push(p);
    }
    ctx.globalAlpha = 1;
    particles = alive;
  }

  // ── Lightnings ───────────────────────────────────────────────────────────────

  function updateAndDrawLightnings() {
    const alive = [];
    for (const l of lightnings) {
      l.life -= l.decay;
      if (l.life <= 0) continue;

      const jitter = 4 * l.life;
      ctx.globalAlpha = l.life;
      ctx.strokeStyle = l.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = l.color;
      ctx.shadowBlur = 12 * l.life;

      ctx.beginPath();
      for (let i = 0; i < l.points.length; i++) {
        const px = l.points[i].x + (Math.random() - 0.5) * 2 * jitter;
        const py = l.points[i].y + (Math.random() - 0.5) * 2 * jitter;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      alive.push(l);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    lightnings = alive;
  }

  // ── Floating texts ───────────────────────────────────────────────────────────

  function updateAndDrawTexts() {
    const alive = [];
    for (const t of texts) {
      t.life -= t.decay;
      if (t.life <= 0) continue;

      t.y -= 0.8;
      // scale lerp from 0.5 → 1.2 as life goes 1 → 0 (rising effect starts small, peaks)
      const progress = 1 - t.life;
      const scale = 0.5 + progress * 0.7; // 0.5 at start, 1.2 at end

      ctx.globalAlpha = t.life;
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(scale, scale);
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);
      ctx.restore();

      alive.push(t);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    texts = alive;
  }

  // ── Flash ────────────────────────────────────────────────────────────────────

  function updateAndDrawFlash() {
    if (flashAlpha < 0.001) return;
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    flashAlpha *= 0.85;
    if (flashAlpha < 0.001) flashAlpha = 0;
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  const Particles = {
    /**
     * Store canvas reference, get 2d context, set up resize listener.
     * @param {HTMLCanvasElement} canvasEl
     */
    init(canvasEl) {
      canvas = canvasEl;
      ctx = canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    },

    /**
     * Match canvas size to its parent element.
     */
    resize() {
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    },

    /**
     * Create a particle burst at (x, y).
     * @param {number} x
     * @param {number} y
     * @param {number} [count=15]
     * @param {number} [spread=80]
     */
    burst(x, y, count = 15, spread = 80) {
      if (reducedMotion) return;
      const { primary, secondary } = getColors();
      const colors = [primary, secondary];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * spread) / 20; // scale spread to a per-frame velocity
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.02 + Math.random() * 0.02,
          size: 3 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      ensureRunning();
    },

    /**
     * Draw glowing lightning connecting an array of {x, y} points.
     * @param {Array<{x: number, y: number}>} points
     */
    lightning(points) {
      if (reducedMotion || !points || points.length < 2) return;
      const { primary } = getColors();
      lightnings.push({
        points,
        life: 1,
        decay: 0.04,
        color: primary,
      });
      ensureRunning();
    },

    /**
     * Show floating combo text that rises and fades.
     * @param {number} x
     * @param {number} y
     * @param {string} text
     */
    comboText(x, y, text) {
      if (reducedMotion) return;
      const { secondary } = getColors();
      texts.push({
        x,
        y,
        text,
        life: 1,
        decay: 0.012,
        color: secondary,
      });
      ensureRunning();
    },

    /**
     * Brief white flash overlay.
     */
    flash() {
      if (reducedMotion) return;
      flashAlpha = 0.1;
      ensureRunning();
    },

    /**
     * Remove all active effects immediately.
     */
    clear() {
      particles = [];
      lightnings = [];
      texts = [];
      flashAlpha = 0;
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
  };

  window.Particles = Particles;
})();
