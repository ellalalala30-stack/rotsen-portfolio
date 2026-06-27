/* ============================================================
   ROTSEN PORTFOLIO — MAIN JS v2
   ============================================================ */

/* ============================================================
   THREE.JS — 3D CHARACTER (right side)
   ============================================================ */
(function initThree() {
  const canvas = document.getElementById('threeCanvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 1.2, 4.5);

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  /* Lights */
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.DirectionalLight(0xfff5e0, 1.4);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const fill = new THREE.PointLight(0xf5a623, 0.8, 12);
  fill.position.set(3, 2, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x88ccff, 0.4);
  rim.position.set(2, 3, -3);
  scene.add(rim);

  /* Helpers */
  function box(w, h, d, mat, x, y, z, rx=0, ry=0, rz=0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    return m;
  }
  function sphere(r, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 20), mat);
    m.position.set(x, y, z); return m;
  }
  function cyl(rt, rb, h, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 14), mat);
    m.position.set(x, y, z); return m;
  }

  /* Materials */
  const SKIN  = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 });
  const SHIRT = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.6 });
  const PANTS = new THREE.MeshStandardMaterial({ color: 0x16213e, roughness: 0.8 });
  const SHOE  = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.1 });
  const HAIR  = new THREE.MeshStandardMaterial({ color: 0x1a0a00, roughness: 0.9 });
  const GOLD  = new THREE.MeshStandardMaterial({ color: 0xf5a623, roughness: 0.3, metalness: 0.5 });
  const GLASS = new THREE.MeshStandardMaterial({ color: 0x88aacc, roughness: 0.1, transparent: true, opacity: 0.55 });
  const LAPMAT = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.7 });
  const SCREEN = new THREE.MeshStandardMaterial({ color: 0x001133, emissive: 0x0033aa, emissiveIntensity: 0.9 });

  const group = new THREE.Group();
  scene.add(group);

  /* Torso */
  group.add(box(0.7, 0.9, 0.42, SHIRT, 0, 0, 0));
  group.add(box(0.72, 0.08, 0.44, GOLD, 0, -0.38, 0)); // belt
  group.add(box(0.12, 0.1, 0.02, GOLD, -0.22, 0.12, 0.22)); // pocket

  /* Neck */
  group.add(cyl(0.1, 0.1, 0.16, SKIN, 0, 0.52, 0));

  /* Head group */
  const head = new THREE.Group();
  head.position.set(0, 0.62, 0);
  group.add(head);

  head.add(sphere(0.31, SKIN, 0, 0, 0));

  /* Hair dome */
  const hairDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 20, 20, 0, Math.PI*2, 0, Math.PI*0.52),
    HAIR
  );
  hairDome.position.y = 0.03;
  head.add(hairDome);
  head.add(box(0.16, 0.09, 0.1, HAIR, 0, 0.26, 0.24, -0.28));

  /* Eyes */
  const EW = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const EP = new THREE.MeshStandardMaterial({ color: 0x0a0500 });
  const eyeWL = sphere(0.062, EW, -0.105, 0.04, 0.27);
  const eyeWR = sphere(0.062, EW,  0.105, 0.04, 0.27);
  const pupilL = sphere(0.038, EP, -0.105, 0.04, 0.295);
  const pupilR = sphere(0.038, EP,  0.105, 0.04, 0.295);
  head.add(eyeWL, eyeWR, pupilL, pupilR);

  /* Glasses */
  const glassL = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.011, 8, 18), GLASS);
  glassL.position.set(-0.105, 0.04, 0.28);
  const glassR = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.011, 8, 18), GLASS);
  glassR.position.set(0.105, 0.04, 0.28);
  head.add(glassL, glassR);
  head.add(box(0.05, 0.01, 0.01, GLASS, 0, 0.04, 0.29));

  /* Brows */
  head.add(box(0.09, 0.018, 0.018, HAIR, -0.105, 0.15, 0.29, 0, 0, 0.1));
  head.add(box(0.09, 0.018, 0.018, HAIR,  0.105, 0.15, 0.29, 0, 0, -0.1));

  /* Nose & mouth */
  head.add(sphere(0.036, SKIN, 0, -0.02, 0.305));
  const mg = new THREE.TorusGeometry(0.055, 0.013, 8, 10, Math.PI);
  const mouthM = new THREE.Mesh(mg, new THREE.MeshStandardMaterial({ color: 0x7a2f2f }));
  mouthM.position.set(0, -0.1, 0.295);
  mouthM.rotation.z = Math.PI;
  head.add(mouthM);

  /* Ears */
  head.add(sphere(0.065, SKIN, -0.31, 0, 0));
  head.add(sphere(0.065, SKIN,  0.31, 0, 0));

  /* Arms */
  const armL = new THREE.Group();
  armL.position.set(-0.45, 0.26, 0);
  group.add(armL);
  armL.add(box(0.2, 0.62, 0.22, SHIRT, 0, -0.27, 0));
  armL.add(sphere(0.12, SKIN, 0, -0.62, 0));

  const armR = new THREE.Group();
  armR.position.set(0.45, 0.26, 0);
  group.add(armR);
  armR.add(box(0.2, 0.62, 0.22, SHIRT, 0, -0.27, 0));
  armR.add(sphere(0.12, SKIN, 0, -0.62, 0));

  /* Laptop */
  const lap = new THREE.Group();
  lap.position.set(0.42, -0.38, 0.28);
  lap.rotation.x = 0.28;
  group.add(lap);
  lap.add(box(0.34, 0.24, 0.02, LAPMAT, 0, 0, 0));
  const scr = box(0.3, 0.2, 0.005, SCREEN, 0, 0, 0.014);
  lap.add(scr);
  lap.add(box(0.18, 0.011, 0.004, new THREE.MeshStandardMaterial({ color: 0xf5a623, emissive: 0xf5a623, emissiveIntensity: 1 }), -0.02, 0.04, 0.02));
  lap.add(box(0.13, 0.011, 0.004, new THREE.MeshStandardMaterial({ color: 0x44ccff, emissive: 0x44ccff, emissiveIntensity: 1 }), -0.04, -0.01, 0.02));
  lap.add(box(0.15, 0.011, 0.004, new THREE.MeshStandardMaterial({ color: 0x44ccff, emissive: 0x44ccff, emissiveIntensity: 1 }), -0.03, -0.06, 0.02));

  /* Legs */
  const legL = new THREE.Group(); legL.position.set(-0.18, -0.44, 0); group.add(legL);
  legL.add(box(0.27, 0.64, 0.27, PANTS, 0, -0.32, 0));
  legL.add(box(0.25, 0.13, 0.35, SHOE, 0, -0.67, 0.05));

  const legR = new THREE.Group(); legR.position.set(0.18, -0.44, 0); group.add(legR);
  legR.add(box(0.27, 0.64, 0.27, PANTS, 0, -0.32, 0));
  legR.add(box(0.25, 0.13, 0.35, SHOE, 0, -0.67, 0.05));

  group.position.set(0, -0.25, 0);

  /* Mouse tracking */
  let tRY = 0, tRX = 0, cRY = 0, cRX = 0;

  document.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    tRY = nx * 0.3;
    tRX = -ny * 0.15;
    head.rotation.y = nx * 0.45;
    head.rotation.x = -ny * 0.3;
    pupilL.position.set(-0.105 + nx*0.018, 0.04 - ny*0.01, 0.295);
    pupilR.position.set( 0.105 + nx*0.018, 0.04 - ny*0.01, 0.295);
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;
    cRY += (tRY - cRY) * 0.06;
    cRX += (tRX - cRX) * 0.06;
    group.rotation.y = cRY;
    group.rotation.x = cRX;
    group.position.y = -0.25 + Math.sin(t * 1.1) * 0.055;
    armL.rotation.z =  0.1 + Math.sin(t * 0.85) * 0.035;
    armR.rotation.z = -0.1 + Math.sin(t * 0.85 + 0.4) * 0.035;
    scr.material.emissiveIntensity = 0.6 + Math.sin(t * 1.8) * 0.3;
    renderer.render(scene, camera);
  }
  animate();

  /* Dark mode: change ambient light colour */
  window._setCharacterDark = (dark) => {
    scene.children[0].color.set(dark ? 0x334466 : 0xffffff);
  };
})();

/* ============================================================
   MODE TOGGLE
   ============================================================ */
const html = document.documentElement;
const modeBtn = document.getElementById('modeToggle');
const modeIcon = modeBtn.querySelector('.mode-icon');
const modeLabel = modeBtn.querySelector('.mode-label');

const modeData = {
  light: {
    icon: '🔥',
    label: 'NO-FLUFF MODE',
    status: 'AVAILABLE FOR FREELANCE',
    h1: ['Bold visuals.', 'Zero waste.', 'Real results.'],
    sub: 'I design things that look sharp<br>and build systems that actually work.',
    chips: ['Graphic Design', 'Automation', 'Executive VA']
  },
  dark: {
    icon: '💼',
    label: 'CREATIVE MODE',
    status: 'OPEN TO OPPORTUNITIES',
    h1: ['Your brand deserves', 'better systems.', "Let's build them."],
    sub: 'Backend infrastructure that runs itself.<br>Creative direction that actually converts.',
    chips: ['Make.com', 'Shopify', 'AI Creative']
  }
};

let currentMode = 'light';

function applyMode(mode) {
  currentMode = mode;
  const d = modeData[mode];
  html.setAttribute('data-mode', mode);

  modeIcon.textContent = d.icon;
  modeLabel.textContent = d.label;
  document.getElementById('heroStatus').textContent = d.status;

  const lines = document.querySelectorAll('.hero-headline .line');
  lines.forEach((l, i) => {
    l.style.opacity = '0';
    setTimeout(() => {
      l.textContent = d.h1[i] || '';
      l.style.opacity = '1';
      l.style.transition = 'opacity 0.4s';
    }, 150 + i * 80);
  });

  const sub = document.getElementById('heroSub');
  sub.style.opacity = '0';
  setTimeout(() => {
    sub.innerHTML = d.sub;
    sub.style.opacity = '1';
    sub.style.transition = 'opacity 0.4s';
  }, 200);

  const chipsEl = document.getElementById('heroChips');
  chipsEl.innerHTML = d.chips.map(c => `<span class="chip">${c}</span>`).join('');

  if (window._setCharacterDark) window._setCharacterDark(mode === 'dark');
}

modeBtn.addEventListener('click', () => applyMode(currentMode === 'light' ? 'dark' : 'light'));

/* ============================================================
   ROLE TOGGLE
   ============================================================ */
const roleBtns  = document.querySelectorAll('.role-btn');
const roleSects = document.querySelectorAll('.role-section');
const skillBlocks = document.querySelectorAll('.skill-block');

let activeRole = 'designer';

function setRole(role) {
  activeRole = role;
  roleBtns.forEach(b => b.classList.toggle('active', b.dataset.role === role));
  roleSects.forEach(s => {
    s.classList.toggle('visible', s.dataset.roles === role);
  });
  skillBlocks.forEach(b => {
    const roles = b.dataset.roles ? b.dataset.roles.split(' ') : [];
    b.classList.toggle('dimmed', !roles.includes(role));
  });
}

roleBtns.forEach(b => b.addEventListener('click', () => setRole(b.dataset.role)));
setRole('designer');

/* ============================================================
   CLICK-TO-SPAWN STICKY NOTES
   ============================================================ */
const notesLayer = document.getElementById('notesLayer');
const hero = document.getElementById('hero');

const notePool = [
  { title: 'Design truth', body: 'Good design is invisible. Bad design is all you see.' },
  { title: 'Automation rule', body: 'If you do it twice, automate it. If you automate it, document it.' },
  { title: 'Client reality', body: 'They don\'t want a logo. They want to be taken seriously.' },
  { title: 'My stack', body: 'Make.com + Wix + Shopify + Google Workspace = zero-touch ops.' },
  { title: 'On AI', body: 'AI is a tool. Taste is still the rarest skill.' },
  { title: 'Brand tip', body: 'Consistency beats brilliance. Every single time.' },
  { title: 'VA secret', body: 'The best VA is the one you forget is there — because everything just works.' },
  { title: 'Systems > hustle', body: 'Build the system once. Let it run while you sleep.' },
  { title: 'Visual language', body: 'Every pixel is a decision. Make them count.' },
  { title: 'On SOPs', body: 'An SOP is a gift to your future self.' },
  { title: 'Social media', body: 'Post with purpose or don\'t post at all.' },
  { title: 'La Union life', body: 'Best ideas come at sunrise by the sea. No joke.' },
];

const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
let noteIndex = 0;
let spawnedNotes = [];

function spawnNote(x, y) {
  const data = notePool[noteIndex % notePool.length];
  noteIndex++;

  const rot = (Math.random() - 0.5) * 12;
  const color = colors[Math.floor(Math.random() * colors.length)];

  const el = document.createElement('div');
  el.className = `spawned-note ${color}`;
  el.style.setProperty('--rot', rot + 'deg');
  el.style.transform = `rotate(${rot}deg)`;

  const hr = hero.getBoundingClientRect();
  const px = x - hr.left - 87;
  const py = y - hr.top  - 60;

  el.style.left = Math.max(8, Math.min(hr.width  - 185, px)) + 'px';
  el.style.top  = Math.max(70, Math.min(hr.height - 160, py)) + 'px';

  el.innerHTML = `
    <div class="note-pin"></div>
    <p class="note-title">${data.title}</p>
    <p>${data.body}</p>
  `;

  notesLayer.appendChild(el);
  spawnedNotes.push(el);

  /* Drag */
  let dragging = false, ox = 0, oy = 0;
  el.addEventListener('mousedown', e => {
    dragging = true;
    ox = e.clientX - el.getBoundingClientRect().left;
    oy = e.clientY - el.getBoundingClientRect().top;
    el.style.zIndex = 99;
    el.style.transform = `rotate(${rot}deg) scale(1.04)`;
    e.stopPropagation();
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const hr = hero.getBoundingClientRect();
    el.style.left = (e.clientX - hr.left - ox) + 'px';
    el.style.top  = (e.clientY - hr.top  - oy) + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    el.style.zIndex = 10;
    el.style.transform = `rotate(${rot}deg)`;
  });

  /* Remove oldest if too many */
  if (spawnedNotes.length > 12) {
    const old = spawnedNotes.shift();
    old.style.opacity = '0';
    old.style.transition = 'opacity 0.3s';
    setTimeout(() => old.remove(), 300);
  }
}

/* Listen for clicks on hero (not on buttons/links/notes) */
hero.addEventListener('click', e => {
  if (e.target.closest('button') || e.target.closest('a') ||
      e.target.closest('.spawned-note') || e.target.closest('.profile-note') ||
      e.target.closest('#threeCanvas')) return;
  spawnNote(e.clientX, e.clientY);
  countClick();
});

/* ============================================================
   PROFILE NOTE → EXPANDED CARD
   ============================================================ */
const profileNote = document.getElementById('profileNote');
const profileCard = document.getElementById('profileCard');

/* Backdrop */
const backdrop = document.createElement('div');
backdrop.className = 'card-backdrop hidden';
document.body.appendChild(backdrop);

profileNote.addEventListener('click', e => {
  e.stopPropagation();
  profileCard.classList.remove('hidden');
  backdrop.classList.remove('hidden');
});

profileCard.addEventListener('click', () => {
  profileCard.classList.add('hidden');
  backdrop.classList.add('hidden');
});
backdrop.addEventListener('click', () => {
  profileCard.classList.add('hidden');
  backdrop.classList.add('hidden');
});

/* ============================================================
   EASTER EGG — 10 CLICKS
   ============================================================ */
let clicks = 0;
const egg = document.getElementById('easterEgg');

function countClick() {
  clicks++;
  if (clicks >= 10) {
    clicks = 0;
    egg.classList.remove('hidden');
    egg.classList.add('visible');
  }
}

document.getElementById('eggClose').addEventListener('click', () => {
  egg.classList.remove('visible');
  egg.classList.add('hidden');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    egg.classList.remove('visible');
    egg.classList.add('hidden');
    profileCard.classList.add('hidden');
    backdrop.classList.add('hidden');
  }
});

/* ============================================================
   SCROLL FADE-IN
   ============================================================ */
document.querySelectorAll('.exp-item, .skill-block, .contact-inner').forEach(el => {
  el.classList.add('fade-in');
});
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
