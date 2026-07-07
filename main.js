/* =============================================================
   NI.Studio — interactions
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNav();
  initReveal();
  initHeroCanvas();
});

/* ---------- Light / dark theme toggle ---------- */
function initThemeToggle(){
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const saved = localStorage.getItem('ni-theme');
  if (saved === 'light'){
    root.setAttribute('data-theme', 'light');
    toggle.setAttribute('aria-label', 'Switch to dark theme');
  }

  toggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';

    if (isLight){
      root.removeAttribute('data-theme');
      localStorage.setItem('ni-theme', 'dark');
      toggle.setAttribute('aria-label', 'Switch to light theme');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('ni-theme', 'light');
      toggle.setAttribute('aria-label', 'Switch to dark theme');
    }
  });
}

/* ---------- Sticky nav + mobile toggle ---------- */
function initNav(){
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  });

  if (toggle && links){
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-open');
      links.classList.toggle('is-open');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('is-open');
        links.classList.remove('is-open');
      });
    });
  }
}

/* ---------- Scroll-triggered reveal animation ---------- */
function initReveal(){
  const targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!('IntersectionObserver' in window)){
    targets.forEach(t => t.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(t => observer.observe(t));
}

/* ---------- Hero background: animated "video-like" motion ----------
   A soft field of drifting lines/particles in the brand colours,
   giving the header a living, motion-graphics feel instead of a
   static image. Respects prefers-reduced-motion. */
function initHeroCanvas(){
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let w, h, particles, raf;

  const colors = ['#6c63ff', '#ff7a45', '#59d9b3'];

  function resize(){
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }

  function makeParticles(){
    const count = Math.max(24, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 26000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.6 + 0.6) * devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.35 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.35 * devicePixelRatio,
      c: colors[Math.floor(Math.random() * colors.length)],
      a: Math.random() * 0.5 + 0.15
    }));
  }

  function step(){
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(p.c, p.a);
      ctx.fill();

      // connect nearby particles with a faint line, like a moving constellation
      for (let j = i + 1; j < particles.length; j++){
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 130 * devicePixelRatio;
        if (dist < maxDist){
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = hexToRgba(p.c, (1 - dist / maxDist) * 0.12);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    raf = requestAnimationFrame(step);
  }

  function hexToRgba(hex, alpha){
    const v = parseInt(hex.slice(1), 16);
    const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  resize();
  makeParticles();

  if (!reduceMotion){
    step();
  } else {
    // Draw a single still frame instead of animating
    step();
    cancelAnimationFrame(raf);
  }

  window.addEventListener('resize', () => {
    resize();
    makeParticles();
  });
}