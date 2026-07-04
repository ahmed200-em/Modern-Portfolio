/* =========================================================
   Ahmed Elmakrini — Portfolio
   Particle Background System
   Lightweight canvas-based particle network
   ========================================================= */

(function () {
  'use strict';

  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  let rafId = null;
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  // Configuration
  const config = {
    count: 70,
    maxDistance: 140,
    baseColor: '139, 92, 246',
    accentColor: '99, 102, 241',
    particleSize: 1.6,
    speed: 0.35,
  };

  function setSize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  function createParticles() {
    const { w, h } = setSize();
    const count = Math.min(config.count, Math.floor((w * h) / 14000));
    particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        size: Math.random() * config.particleSize + 0.6,
        color: Math.random() > 0.5 ? config.baseColor : config.accentColor,
      });
    }
  }

  function draw() {
    const { w, h } = setSize();
    ctx.clearRect(0, 0, w, h);

    // Update + draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // Mouse interaction (gentle repulsion)
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        p.x += (dx / dist) * force * 0.8;
        p.y += (dy / dist) * force * 0.8;
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color}, ${0.5 + Math.random() * 0.3})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.maxDistance) {
          const opacity = 1 - dist / config.maxDistance;
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.25})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  // Throttled resize handler
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(createParticles, 200);
  }

  // Mouse handler
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function onMouseLeave() {
    mouse.x = -1000;
    mouse.y = -1000;
  }

  // Public init
  function init() {
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    createParticles();
    draw();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
  }

  // Respect reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMouseMove);
  });
})();
