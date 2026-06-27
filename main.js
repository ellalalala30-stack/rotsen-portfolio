/* ============================================================
   ROTSEN PORTFOLIO — MAIN JS v2
   ============================================================ */

/* ============================================================
   THREE.JS — PROCEDURAL WALKING CHARACTER
   ============================================================ */
(function initCharacter() {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 500);

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  /* --- Lights --- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const key = new THREE.DirectionalLight(0xfff5e0, 1.8);
  key.position.set(-60, 180, 140);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const fill = new THREE.PointLight(0xf5a623, 0.8, 500);
  fill.position.set(100, 80, 80);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xaaddff, 0.4);
  rim.position.set(60, 100, -120);
  scene.add(rim);

  /* --- Materials --- */
  const matSkin   = new THREE.MeshStandardMaterial({ color: 0xc8845a, roughness: 0.8 });
  const matCloth  = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.7 });
  const matShoe   = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.6 });
  const matHair   = new THREE.MeshStandardMaterial({ color: 0x1a0a00, roughness: 0.9 });
  const matAccent = new THREE.MeshStandardMaterial({ color: 0xe8a427, roughness: 0.5, metalness: 0.2 });

  function box(w, h, d, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.castShadow = true;
    return m;
  }
  function sphere(r, mat) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), mat);
    m.castShadow = true;
    return m;
  }
  function cyl(rt, rb, h, mat) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 12), mat);
    m.castShadow = true;
    return m;
  }

  /* --- Build character (Y=0 at feet) --- */
  const root = new THREE.Group(); // whole character pivot

  /* Shadow disc */
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(18, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.1 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.5;
  root.add(shadow);

  /* --- Feet / shoes --- */
  const lFoot = box(9, 4, 14, matShoe); lFoot.position.set(0, 2, 3);
  const rFoot = box(9, 4, 14, matShoe); rFoot.position.set(0, 2, 3);

  /* --- Lower legs --- */
  const lLowerLeg = box(7, 22, 7, matCloth);
  lLowerLeg.position.y = -11;
  const rLowerLeg = box(7, 22, 7, matCloth);
  rLowerLeg.position.y = -11;

  /* Knee pivot groups */
  const lKnee = new THREE.Group(); lKnee.position.y = -12;
  lKnee.add(lLowerLeg); lKnee.add(lFoot);
  const rKnee = new THREE.Group(); rKnee.position.y = -12;
  rKnee.add(rLowerLeg); rKnee.add(rFoot);

  /* Upper legs */
  const lUpperLeg = box(8, 24, 8, matCloth); lUpperLeg.position.y = -12;
  const rUpperLeg = box(8, 24, 8, matCloth); rUpperLeg.position.y = -12;

  /* Hip pivot groups */
  const lHip = new THREE.Group(); lHip.position.set(-6, 48, 0);
  lHip.add(lUpperLeg); lHip.add(lKnee);
  const rHip = new THREE.Group(); rHip.position.set(6, 48, 0);
  rHip.add(rUpperLeg); rHip.add(rKnee);

  root.add(lHip); root.add(rHip);

  /* --- Torso --- */
  const torso = box(22, 30, 12, matCloth); torso.position.y = 63;
  root.add(torso);

  /* Belt / accent stripe */
  const belt = box(22.5, 3, 12.5, matAccent); belt.position.y = 49;
  root.add(belt);

  /* --- Arms --- */
  const lForearm = box(5, 18, 5, matSkin); lForearm.position.y = -10;
  const rForearm = box(5, 18, 5, matSkin); rForearm.position.y = -10;

  const lElbow = new THREE.Group(); lElbow.position.y = -12;
  lElbow.add(lForearm);
  const rElbow = new THREE.Group(); rElbow.position.y = -12;
  rElbow.add(rForearm);

  const lUpperArm = box(6, 20, 6, matCloth); lUpperArm.position.y = -10;
  const rUpperArm = box(6, 20, 6, matCloth); rUpperArm.position.y = -10;

  const lShoulder = new THREE.Group(); lShoulder.position.set(-14, 76, 0);
  lShoulder.add(lUpperArm); lShoulder.add(lElbow);
  const rShoulder = new THREE.Group(); rShoulder.position.set(14, 76, 0);
  rShoulder.add(rUpperArm); rShoulder.add(rElbow);

  root.add(lShoulder); root.add(rShoulder);

  /* --- Neck --- */
  const neck = cyl(4, 4, 8, matSkin); neck.position.y = 82;
  root.add(neck);

  /* --- Head --- */
  const headGroup = new THREE.Group(); headGroup.position.y = 92;

  const headMesh = sphere(10, matSkin); headMesh.position.y = 0;
  headGroup.add(headMesh);

  /* Hair */
  const hairTop = sphere(10.2, matHair);
  hairTop.scale.set(1, 0.55, 1);
  hairTop.position.y = 5;
  headGroup.add(hairTop);

  /* Eyes */
  const eyeL = sphere(1.5, new THREE.MeshStandardMaterial({ color: 0x111111 }));
  eyeL.position.set(-3.5, 1, 9.5);
  const eyeR = sphere(1.5, new THREE.MeshStandardMaterial({ color: 0x111111 }));
  eyeR.position.set(3.5, 1, 9.5);
  headGroup.add(eyeL); headGroup.add(eyeR);

  root.add(headGroup);

  /* Face character toward the left (toward hero text) */
  root.rotation.y = Math.PI * 0.15;

  /* Center & position in scene */
  root.position.y = -48;
  scene.add(root);

  camera.position.set(0, 55, 230);
  camera.lookAt(0, 55, 0);

  /* --- Mouse tracking (subtle head turn) --- */
  let tRY = 0, cRY = 0;
  document.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    tRY = nx * 0.25;
  });

  /* --- Walk animation --- */
  const clock = new THREE.Clock();
  const WALK_SPEED = 2.2;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime() * WALK_SPEED;

    /* Hip & knee swing */
    const hipSwing  = Math.sin(t) * 0.55;
    const kneeSwing = Math.max(0, Math.sin(t + 0.6)) * 0.7;

    lHip.rotation.x =  hipSwing;
    rHip.rotation.x = -hipSwing;
    lKnee.rotation.x = Math.max(0, Math.sin(t + Math.PI + 0.6)) * 0.7;
    rKnee.rotation.x = kneeSwing;

    /* Arm swing (opposite to legs) */
    const armSwing = Math.sin(t) * 0.45;
    lShoulder.rotation.x = -armSwing;
    rShoulder.rotation.x =  armSwing;

    /* Elbow slight bend on swing-back */
    lElbow.rotation.x = Math.max(0, Math.sin(t + 0.8)) * 0.4;
    rElbow.rotation.x = Math.max(0, Math.sin(t + Math.PI + 0.8)) * 0.4;

    /* Body bob */
    root.position.y = -48 + Math.abs(Math.sin(t * 2)) * 1.8 - 0.9;

    /* Slight torso sway */
    torso.rotation.z = Math.sin(t) * 0.04;
    headGroup.rotation.z = Math.sin(t) * 0.03;

    /* Smooth mouse-driven rotation */
    cRY += (tRY - cRY) * 0.05;
    root.rotation.y = Math.PI * 0.15 + cRY;

    renderer.render(scene, camera);
  }
  animate();

  /* Dark mode */
  window._setCharacterDark = dark => {
    scene.children.forEach(c => {
      if (c.isAmbientLight) { c.intensity = dark ? 0.45 : 0.7; }
    });
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
   CLICK-TO-SPAWN STICKY NOTES + SVG WIRES
   ============================================================ */
const notesLayer = document.getElementById('notesLayer');
const wireLayer  = document.getElementById('wireLayer');
const hero = document.getElementById('hero');

const notePool = [
  { title: 'Design truth', body: 'Good design is invisible. Bad design is all you see.' },
  { title: 'Automation rule', body: 'If you do it twice, automate it. If you automate it, document it.' },
  { title: 'Client reality', body: 'They don\'t want a logo. They want to be taken seriously.' },
  { title: 'My stack', body: 'Make.com + Wix + Shopify + Workspace = zero-touch ops.' },
  { title: 'On AI', body: 'AI is a tool. Taste is still the rarest skill.' },
  { title: 'Brand tip', body: 'Consistency beats brilliance. Every single time.' },
  { title: 'VA secret', body: 'The best VA is the one you forget is there — because everything just works.' },
  { title: 'Systems > hustle', body: 'Build the system once. Let it run while you sleep.' },
  { title: 'Visual language', body: 'Every pixel is a decision. Make them count.' },
  { title: 'On SOPs', body: 'An SOP is a gift to your future self.' },
  { title: 'Social media', body: 'Post with purpose or don\'t post at all.' },
  { title: 'La Union life', body: 'Best ideas come at sunrise by the sea. No joke.' },
  { title: 'Real deliverable', body: 'Decisions made, not recommendations filed.' },
  { title: 'Zero-touch', body: 'If I built it right, you\'ll forget it exists.' },
];

const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
let noteIndex = 0;
let spawnedNotes = []; // { el, rot, timer }

const NOTE_LIFETIME = 15000; // 15 seconds

function noteCenter(el) {
  const hr = hero.getBoundingClientRect();
  const r  = el.getBoundingClientRect();
  return {
    x: r.left - hr.left + r.width  / 2,
    y: r.top  - hr.top  + r.height / 2
  };
}

function drawWires() {
  wireLayer.innerHTML = '';
  if (spawnedNotes.length < 2) return;

  for (let i = 0; i < spawnedNotes.length - 1; i++) {
    const a = noteCenter(spawnedNotes[i].el);
    const b = noteCenter(spawnedNotes[i + 1].el);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('class', 'wire-line');
    wireLayer.appendChild(line);

    /* Animated dot along the line */
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', 3.5);
    dot.setAttribute('class', 'wire-dot');
    const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
    anim.setAttribute('dur', (2 + Math.random() * 2).toFixed(1) + 's');
    anim.setAttribute('repeatCount', 'indefinite');
    anim.setAttribute('path', `M${a.x},${a.y} L${b.x},${b.y}`);
    dot.appendChild(anim);
    wireLayer.appendChild(dot);

    /* Endpoint dots */
    [a, b].forEach(p => {
      const d = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      d.setAttribute('cx', p.x); d.setAttribute('cy', p.y);
      d.setAttribute('r', 3); d.setAttribute('class', 'wire-dot');
      wireLayer.appendChild(d);
    });
  }
}

function removeNote(entry) {
  clearTimeout(entry.timer);
  entry.el.style.opacity = '0';
  entry.el.style.transition = 'opacity 0.6s';
  setTimeout(() => {
    entry.el.remove();
    spawnedNotes = spawnedNotes.filter(n => n !== entry);
    drawWires();
  }, 600);
}

function spawnNote(x, y) {
  const data = notePool[noteIndex % notePool.length];
  noteIndex++;

  const rot = (Math.random() - 0.5) * 14;
  const color = colors[Math.floor(Math.random() * colors.length)];

  const el = document.createElement('div');
  el.className = `spawned-note ${color}`;
  el.style.setProperty('--rot', rot + 'deg');
  el.style.setProperty('--fi', (Math.random() * 1.5).toFixed(2) + 's');
  el.style.transform = `rotate(${rot}deg)`;
  setTimeout(() => el.classList.add('landed'), 580);

  const hr = hero.getBoundingClientRect();
  const px = x - hr.left - 110;
  const py = y - hr.top  - 70;

  el.style.left = Math.max(8, Math.min(hr.width  - 230, px)) + 'px';
  el.style.top  = Math.max(70, Math.min(hr.height - 180, py)) + 'px';

  el.innerHTML = `
    <div class="note-pin"></div>
    <p class="note-title">${data.title}</p>
    <p>${data.body}</p>
  `;

  notesLayer.appendChild(el);

  const entry = { el, rot };
  entry.timer = setTimeout(() => removeNote(entry), NOTE_LIFETIME);
  spawnedNotes.push(entry);

  drawWires();

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
    drawWires();
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    el.style.zIndex = 10;
    el.style.transform = `rotate(${rot}deg)`;
    drawWires();
  });

  /* Cap at 10 visible notes */
  if (spawnedNotes.length > 10) {
    removeNote(spawnedNotes[0]);
  }
}

/* Listen for clicks on hero */
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
