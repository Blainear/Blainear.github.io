document.addEventListener('DOMContentLoaded', () => {
  // Set glitch data-text from element text so pseudo-elements render correctly
  document.querySelectorAll('.glitch').forEach((el) => {
    const text = el.textContent || '';
    el.setAttribute('data-text', text);
  });
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  // Chaos setup
  document.body.classList.add('chaos');
  const adventuresList = document.getElementById('adventuresList');
  const chaosMeter = document.getElementById('chaosMeter');
  let chaosLevel = 0;

  function setChaosLevel(next) {
    chaosLevel = Math.max(0, Math.min(100, next));
    if (chaosMeter) chaosMeter.style.setProperty('--chaos-fill', chaosLevel + '%');
    document.body.classList.toggle('chaos-high', chaosLevel >= 70);
  }

  const places = ['Fiordland', 'Aoraki', 'Taranaki', 'Rotorua', 'Milford Sound', 'Kaikōura', 'Taupō', 'Piha'];
  const verbs = ['herded', 'debated', 'outran', 'juggled', 'whispered to', 'teleported through', 'reversed', 'moonwalked across'];
  const nouns = ['glowworms', 'geysers', 'keas', 'pōhutukawa trees', 'ferns', 'waka', 'lighthouses', 'clouds'];
  const twists = [
    'while brewing a flat white with seawater',
    'in perfect Morse code nobody asked for',
    'as the Southern Cross applauded',
    'during a spontaneous haka by dolphins',
    'because time went sideways',
    'on a Tuesday that lasted five minutes',
    'until the stars negotiated a lunch break',
  ];

  function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function generateAdventure() {
    return `Jesse Mcgay ${randomItem(verbs)} ${randomItem(nouns)} at ${randomItem(places)} ${randomItem(twists)}.`;
  }
  function addAdventure() {
    if (!adventuresList) return;
    const li = document.createElement('li');
    li.textContent = generateAdventure();
    li.style.setProperty('--tilt', (Math.random() * 6 - 3).toFixed(2) + 'deg');
    adventuresList.prepend(li);
  }

  const btn = document.getElementById('demoBtn');
  if (btn) btn.addEventListener('click', (e) => {
    setChaosLevel(chaosLevel + 8 + Math.floor(Math.random() * 15));
    addAdventure();
    if (typeof window.kickParticles === 'function') window.kickParticles(1 + Math.random() * 1.5);
  });

  // Scroll reveal effect using IntersectionObserver
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: show immediately
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Particle canvas
  const particleCanvas = document.getElementById('fxParticles');
  if (particleCanvas && particleCanvas.getContext) {
    const ctx = particleCanvas.getContext('2d');
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let width = 0, height = 0;
    let particles = [];
    const particleCount = 120;
    const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      width = particleCanvas.clientWidth = window.innerWidth;
      height = particleCanvas.clientHeight = window.innerHeight;
      particleCanvas.width = Math.floor(width * DPR);
      particleCanvas.height = Math.floor(height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function initParticles() {
      particles = Array.from({ length: particleCount }, () => ({
        x: rand(0, width), y: rand(0, height),
        vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3),
        r: rand(0.6, 2.2), hue: Math.random() < 0.5 ? 215 : 350, // blue or red
      }));
    }
    function step() {
      ctx.clearRect(0, 0, width, height);
      // draw links
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) {
            const alpha = 1 - Math.sqrt(d2) / 120;
            ctx.strokeStyle = `rgba(138,160,255,${alpha * 0.25})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // draw particles
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, 0.85)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (motionOK) requestAnimationFrame(step);
    }
    // Expose a simple burst function to kick particle velocities
    window.kickParticles = (magnitude = 1) => {
      for (const p of particles) {
        p.vx += (Math.random() - 0.5) * 0.9 * magnitude;
        p.vy += (Math.random() - 0.5) * 0.9 * magnitude;
        if (Math.random() < 0.2) p.hue = Math.random() < 0.5 ? 215 : 350;
      }
    };
    resize(); initParticles(); step();
    window.addEventListener('resize', () => { resize(); initParticles(); });
  }

  // Magnetic button effect
  const magnetic = document.querySelector('.magnetic');
  if (magnetic) {
    const strength = 24;
    magnetic.addEventListener('mousemove', (e) => {
      const rect = magnetic.getBoundingClientRect();
      const mx = e.clientX - rect.left - rect.width / 2;
      const my = e.clientY - rect.top - rect.height / 2;
      magnetic.style.transform = `translate(${mx / strength}px, ${my / strength}px)`;
    });
    magnetic.addEventListener('mouseleave', () => {
      magnetic.style.transform = 'translate(0, 0)';
    });
  }
});


