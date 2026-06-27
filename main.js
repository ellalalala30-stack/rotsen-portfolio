/* ============================================================
   ROTSEN PORTFOLIO — MAIN JS
   ============================================================ */

/* ---- CURSOR GLOW ---- */
const glow = document.createElement('div');
glow.className = 'cursor-glow';
document.body.appendChild(glow);
let mx = 0, my = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  glow.style.left = mx + 'px';
  glow.style.top  = my + 'px';
});

/* ============================================================
   THREE.JS — 3D CHARACTER
   ============================================================ */
(function initThree() {
  const canvas = document.getElementById('threeCanvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.5, 5);

  /* Resize */
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
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
  sun.position.set(3, 5, 5);
  sun.castShadow = true;
  scene.add(sun);
  const fillLight = new THREE.PointLight(0xf5a623, 1.5, 12);
  fillLight.position.set(-3, 2, 3);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xf5a623, 0.6);
  rimLight.position.set(-2, 3, -3);
  scene.add(rimLight);

  /* ---- Build character from primitives ---- */
  const group = new THREE.Group();
  scene.add(group);

  const MAT_SKIN   = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 });
  const MAT_SHIRT  = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.6 });
  const MAT_PANTS  = new THREE.MeshStandardMaterial({ color: 0x16213e, roughness: 0.8 });
  const MAT_SHOES  = new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.5, metalness: 0.1 });
  const MAT_HAIR   = new THREE.MeshStandardMaterial({ color: 0x1a0a00, roughness: 0.9 });
  const MAT_ACCENT = new THREE.MeshStandardMaterial({ color: 0xf5a623, roughness: 0.3, metalness: 0.4 });
  const MAT_GLASS  = new THREE.MeshStandardMaterial({ color: 0x88aacc, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.6 });

  function box(w, h, d, mat, x, y, z, rx=0, ry=0, rz=0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    return m;
  }
  function sphere(r, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    return m;
  }
  function cyl(rt, rb, h, mat, x, y, z, rx=0) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 16), mat);
    m.position.set(x, y, z);
    m.rotation.x = rx;
    m.castShadow = true;
    return m;
  }

  /* Body */
  const torso = box(0.7, 0.9, 0.4, MAT_SHIRT, 0, 0, 0);
  group.add(torso);

  /* Belt accent */
  const belt = box(0.72, 0.08, 0.42, MAT_ACCENT, 0, -0.38, 0);
  group.add(belt);

  /* Neck */
  const neck = cyl(0.1, 0.1, 0.18, MAT_SKIN, 0, 0.54, 0);
  group.add(neck);

  /* Head */
  const head = new THREE.Group();
  head.position.set(0, 0.63, 0);
  group.add(head);

  const skull = sphere(0.32, MAT_SKIN, 0, 0, 0);
  head.add(skull);

  /* Hair */
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.33, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5),
    MAT_HAIR
  );
  hair.position.y = 0.04;
  head.add(hair);

  /* Hair tuft front */
  const tuft = box(0.18, 0.1, 0.12, MAT_HAIR, 0, 0.28, 0.25, -0.3);
  head.add(tuft);

  /* Eyes */
  const eyeWhiteL = sphere(0.065, new THREE.MeshStandardMaterial({ color: 0xffffff }), -0.11, 0.05, 0.28);
  const eyeWhiteR = sphere(0.065, new THREE.MeshStandardMaterial({ color: 0xffffff }), 0.11, 0.05, 0.28);
  const pupilL = sphere(0.04, new THREE.MeshStandardMaterial({ color: 0x1a0a00 }), -0.11, 0.05, 0.31);
  const pupilR = sphere(0.04, new THREE.MeshStandardMaterial({ color: 0x1a0a00 }), 0.11, 0.05, 0.31);
  head.add(eyeWhiteL, eyeWhiteR, pupilL, pupilR);

  /* Glasses */
  const glassL = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 20), MAT_GLASS);
  glassL.position.set(-0.11, 0.05, 0.29);
  const glassR = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 20), MAT_GLASS);
  glassR.position.set(0.11, 0.05, 0.29);
  const glassBridge = box(0.06, 0.012, 0.012, MAT_GLASS, 0, 0.05, 0.3);
  head.add(glassL, glassR, glassBridge);

  /* Eyebrows */
  head.add(box(0.1, 0.02, 0.02, MAT_HAIR, -0.11, 0.16, 0.3, 0, 0, 0.1));
  head.add(box(0.1, 0.02, 0.02, MAT_HAIR, 0.11, 0.16, 0.3, 0, 0, -0.1));

  /* Nose */
  const nose = sphere(0.04, MAT_SKIN, 0, -0.02, 0.31);
  head.add(nose);

  /* Mouth */
  const mouthGeo = new THREE.TorusGeometry(0.06, 0.015, 8, 12, Math.PI);
  const mouth = new THREE.Mesh(mouthGeo, new THREE.MeshStandardMaterial({ color: 0x8b3a3a }));
  mouth.position.set(0, -0.1, 0.3);
  mouth.rotation.z = Math.PI;
  head.add(mouth);

  /* Ears */
  head.add(sphere(0.07, MAT_SKIN, -0.32, 0, 0));
  head.add(sphere(0.07, MAT_SKIN, 0.32, 0, 0));

  /* Arms */
  const armL = new THREE.Group();
  armL.position.set(-0.45, 0.28, 0);
  group.add(armL);
  armL.add(box(0.2, 0.65, 0.22, MAT_SHIRT, 0, -0.28, 0));
  armL.add(sphere(0.13, MAT_SKIN, 0, -0.65, 0));

  const armR = new THREE.Group();
  armR.position.set(0.45, 0.28, 0);
  group.add(armR);
  armR.add(box(0.2, 0.65, 0.22, MAT_SHIRT, 0, -0.28, 0));
  armR.add(sphere(0.13, MAT_SKIN, 0, -0.65, 0));

  /* Laptop in right hand */
  const laptop = new THREE.Group();
  laptop.position.set(0.45, -0.35, 0.3);
  laptop.rotation.x = 0.3;
  group.add(laptop);
  laptop.add(box(0.35, 0.25, 0.02, new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.6 }), 0, 0, 0));
  const screen = box(0.31, 0.21, 0.005, new THREE.MeshStandardMaterial({ color: 0x0a0a1a, emissive: 0x001133, emissiveIntensity: 0.8 }), 0, 0, 0.015);
  laptop.add(screen);
  /* Glowing lines on screen */
  const line1 = box(0.2, 0.012, 0.005, new THREE.MeshStandardMaterial({ color: 0xf5a623, emissive: 0xf5a623, emissiveIntensity: 1 }), -0.02, 0.04, 0.022);
  const line2 = box(0.14, 0.012, 0.005, new THREE.MeshStandardMaterial({ color: 0x44ccff, emissive: 0x44ccff, emissiveIntensity: 1 }), -0.05, -0.01, 0.022);
  const line3 = box(0.16, 0.012, 0.005, new THREE.MeshStandardMaterial({ color: 0x44ccff, emissive: 0x44ccff, emissiveIntensity: 1 }), -0.04, -0.06, 0.022);
  laptop.add(line1, line2, line3);

  /* Legs */
  const legL = new THREE.Group();
  legL.position.set(-0.18, -0.45, 0);
  group.add(legL);
  legL.add(box(0.28, 0.65, 0.28, MAT_PANTS, 0, -0.32, 0));
  legL.add(box(0.26, 0.14, 0.36, MAT_SHOES, 0, -0.68, 0.06));

  const legR = new THREE.Group();
  legR.position.set(0.18, -0.45, 0);
  group.add(legR);
  legR.add(box(0.28, 0.65, 0.28, MAT_PANTS, 0, -0.32, 0));
  legR.add(box(0.26, 0.14, 0.36, MAT_SHOES, 0, -0.68, 0.06));

  /* Shirt collar & pocket accent */
  const collarL = box(0.14, 0.2, 0.05, MAT_SHIRT, -0.1, 0.35, 0.2, 0, 0, 0.3);
  const collarR = box(0.14, 0.2, 0.05, MAT_SHIRT, 0.1, 0.35, 0.2, 0, 0, -0.3);
  group.add(collarL, collarR);
  const pocket = box(0.12, 0.1, 0.02, MAT_ACCENT, -0.22, 0.12, 0.22);
  group.add(pocket);

  /* Position whole character */
  group.position.set(2.5, -0.3, 0);

  /* Ground shadow plane */
  const shadowPlane = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.set(2.5, -1.7, 0);
  scene.add(shadowPlane);

  /* Particle field */
  const particleCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    pPositions[i] = (Math.random() - 0.5) * 14;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0xf5a623, size: 0.03, transparent: true, opacity: 0.5 })
  );
  scene.add(particles);

  /* ---- Mouse tracking ---- */
  let targetRotY = 0, targetRotX = 0;
  let currentRotY = 0, currentRotX = 0;

  document.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    targetRotY = nx * 0.35;
    targetRotX = -ny * 0.18;
    /* Head tracks more */
    head.rotation.y = nx * 0.4;
    head.rotation.x = -ny * 0.25;
    /* Eyes/pupils follow */
    pupilL.position.set(-0.11 + nx * 0.02, 0.05 - ny * 0.01, 0.31);
    pupilR.position.set( 0.11 + nx * 0.02, 0.05 - ny * 0.01, 0.31);
  });

  /* ---- Hover bob ---- */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;

    /* Smooth body rotation */
    currentRotY += (targetRotY - currentRotY) * 0.06;
    currentRotX += (targetRotX - currentRotX) * 0.06;
    group.rotation.y = currentRotY;
    group.rotation.x = currentRotX;

    /* Idle bob */
    group.position.y = -0.3 + Math.sin(t * 1.2) * 0.06;

    /* Arm gentle swing */
    armL.rotation.z =  0.12 + Math.sin(t * 0.9) * 0.04;
    armR.rotation.z = -0.12 + Math.sin(t * 0.9 + 0.5) * 0.04;

    /* Laptop glow pulse */
    screen.material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3;

    /* Particles drift */
    particles.rotation.y = t * 0.04;

    renderer.render(scene, camera);
  }
  animate();
})();

/* ============================================================
   ROLE TOGGLE
   ============================================================ */
const roleBtns   = document.querySelectorAll('.role-btn');
const roleSects  = document.querySelectorAll('.role-section');
const skillBlocks = document.querySelectorAll('.skill-block');

const heroData = {
  designer: {
    tag: 'Graphic Designer · Digital Branding',
    sub: 'Bold ideas. Clean execution.\nI make things look sharp and perform even better.'
  },
  automation: {
    tag: 'Systems Architect · Automation Engineer',
    sub: 'Zero-touch workflows. Zero manual errors.\nConnecting platforms so you can focus on what matters.'
  },
  va: {
    tag: 'Executive VA · Social Media Manager',
    sub: 'Long-term embedded support.\nI run the ops, manage the brand, and keep things moving.'
  }
};

let activeRole = 'designer';

function setRole(role) {
  activeRole = role;

  /* Update nav buttons */
  roleBtns.forEach(b => b.classList.toggle('active', b.dataset.role === role));

  /* Update hero copy */
  const d = heroData[role];
  const tagEl = document.getElementById('heroTag');
  const subEl = document.getElementById('heroSub');
  tagEl.style.opacity = '0';
  subEl.style.opacity = '0';
  setTimeout(() => {
    tagEl.textContent = d.tag;
    subEl.innerHTML = d.sub.replace('\n', '<br>');
    tagEl.style.opacity = '1';
    subEl.style.opacity = '1';
  }, 250);

  /* Show/hide experience sections */
  roleSects.forEach(s => {
    const roles = s.dataset.roles ? s.dataset.roles.split(' ') : [];
    s.classList.toggle('visible', roles.includes(role));
  });

  /* Dim skill blocks that don't apply */
  skillBlocks.forEach(b => {
    const roles = b.dataset.roles ? b.dataset.roles.split(' ') : [];
    b.classList.toggle('dimmed', !roles.includes(role));
  });

  /* Update wire colours */
  drawWires();
}

roleBtns.forEach(btn => btn.addEventListener('click', () => setRole(btn.dataset.role)));

/* Init */
setRole('designer');

/* ============================================================
   STICKY NOTES DRAG + SVG WIRES
   ============================================================ */
const notes = document.querySelectorAll('.note');
const svg   = document.getElementById('wires');

function noteCenter(el) {
  const stage = document.getElementById('notesStage').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return {
    x: r.left - stage.left + r.width  / 2,
    y: r.top  - stage.top  + r.height / 2
  };
}

function drawWires() {
  svg.innerHTML = '';
  const colors = { designer: '#f5a623', automation: '#44ccff', va: '#caffbf' };
  const color = colors[activeRole] || '#f5a623';

  notes.forEach(note => {
    const targetId = note.dataset.connect;
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;

    const a = noteCenter(note);
    const b = noteCenter(target);
    const cp1x = a.x + (b.x - a.x) * 0.3;
    const cp1y = a.y + 40;
    const cp2x = a.x + (b.x - a.x) * 0.7;
    const cp2y = b.y + 40;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${a.x},${a.y} C${cp1x},${cp1y} ${cp2x},${cp2y} ${b.x},${b.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-dasharray', '6 4');
    path.setAttribute('opacity', '0.7');
    svg.appendChild(path);
  });
}

/* Drag */
notes.forEach(note => {
  let dragging = false, ox = 0, oy = 0;
  const stage = document.getElementById('notesStage');

  note.addEventListener('mousedown', e => {
    dragging = true;
    const sr = stage.getBoundingClientRect();
    const nr = note.getBoundingClientRect();
    ox = e.clientX - nr.left;
    oy = e.clientY - nr.top;
    note.style.zIndex = 50;
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const sr = stage.getBoundingClientRect();
    const x = e.clientX - sr.left - ox;
    const y = e.clientY - sr.top  - oy;
    note.style.left = Math.max(0, Math.min(sr.width  - note.offsetWidth,  x)) + 'px';
    note.style.top  = Math.max(0, Math.min(sr.height - note.offsetHeight, y)) + 'px';
    drawWires();
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    note.style.zIndex = 10;
    drawWires();
  });

  /* Touch support */
  note.addEventListener('touchstart', e => {
    const t = e.touches[0];
    dragging = true;
    const sr = stage.getBoundingClientRect();
    const nr = note.getBoundingClientRect();
    ox = t.clientX - nr.left;
    oy = t.clientY - nr.top;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const t = e.touches[0];
    const sr = stage.getBoundingClientRect();
    const x = t.clientX - sr.left - ox;
    const y = t.clientY - sr.top  - oy;
    note.style.left = Math.max(0, Math.min(sr.width  - note.offsetWidth,  x)) + 'px';
    note.style.top  = Math.max(0, Math.min(sr.height - note.offsetHeight, y)) + 'px';
    drawWires();
  }, { passive: true });

  document.addEventListener('touchend', () => { dragging = false; });
});

/* Initial wire draw after layout */
window.addEventListener('load', () => setTimeout(drawWires, 200));
window.addEventListener('resize', drawWires);

/* ============================================================
   SCROLL FADE-IN
   ============================================================ */
const fadeEls = document.querySelectorAll('.exp-item, .skill-block, .contact-inner');
fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
fadeEls.forEach(el => observer.observe(el));

/* ============================================================
   CLICK COUNTER EASTER EGG
   ============================================================ */
let clicks = 0;
const egg   = document.getElementById('easterEgg');
const eggCount = document.getElementById('eggCount');

document.getElementById('clickTarget').addEventListener('click', () => {
  clicks++;
  if (clicks >= 10) {
    eggCount.textContent = `${clicks} clicks!`;
    egg.classList.remove('hidden');
    egg.classList.add('visible');
    clicks = 0;
  }
});

/* Also count any click anywhere on body (excluding nav links/buttons) */
document.body.addEventListener('click', e => {
  if (e.target.closest('a') || e.target.closest('button')) return;
  clicks++;
  if (clicks >= 10) {
    eggCount.textContent = `${clicks} clicks!`;
    egg.classList.remove('hidden');
    egg.classList.add('visible');
    clicks = 0;
  }
});

document.getElementById('eggClose').addEventListener('click', () => {
  egg.classList.remove('visible');
  egg.classList.add('hidden');
  clicks = 0;
});

egg.addEventListener('click', e => {
  if (e.target === egg) {
    egg.classList.remove('visible');
    egg.classList.add('hidden');
  }
});
