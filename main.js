/* ============================================================
   ROTSEN PORTFOLIO — MAIN JS v2
   ============================================================ */

/* ============================================================
   THREE.JS — GLB CHARACTER (walk in place, mirrored)
   ============================================================ */
(function initCharacter() {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 500);

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
  const ambient = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff5e0, 1.6);
  key.position.set(-80, 200, 140);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const fill = new THREE.PointLight(0xf5a623, 0.7, 600);
  fill.position.set(120, 100, 80);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x88ccff, 0.4);
  rim.position.set(80, 120, -100);
  scene.add(rim);

  /* Shadow disc on ground */
  const groundDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.35, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 })
  );
  groundDisc.rotation.x = -Math.PI / 2;
  scene.add(groundDisc);

  /* Load GLB */
  let mixer = null;
  let charGroup = null;
  let baseY = 0;

  const loader = new THREE.GLTFLoader();
  loader.load(
    'https://ellalalala30-stack.github.io/rotsen-portfolio/character.glb',
    gltf => {
      const model = gltf.scene;

      /* Auto-centre at feet */
      const box3 = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const centre = new THREE.Vector3();
      box3.getSize(size);
      box3.getCenter(centre);
      const h = size.y;

      model.position.set(-centre.x, -box3.min.y, -centre.z);

      /* Mirror: face left toward hero text */
      charGroup = new THREE.Group();
      charGroup.scale.x = -1; // mirror on X axis
      charGroup.add(model);
      scene.add(charGroup);

      /* Camera: frame full body */
      camera.position.set(0, h * 0.52, h * 1.5);
      camera.lookAt(0, h * 0.48, 0);
      groundDisc.position.y = 0.01;

      baseY = 0;

      /* Shadows */
      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => { m.roughness = Math.min(m.roughness ?? 0.8, 0.85); });
          }
        }
      });

      /* Play walk animation */
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(gltf.animations[0]);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.timeScale = 0.9;
        action.play();
      }
    },
    null,
    err => console.warn('GLB load error:', err)
  );

  /* Mouse tracking */
  let tRY = 0, cRY = 0;
  document.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    tRY = nx * 0.3;
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    cRY += (tRY - cRY) * 0.05;
    if (charGroup) charGroup.rotation.y = cRY;
    renderer.render(scene, camera);
  }
  animate();

  window._setCharacterDark = dark => {
    ambient.intensity = dark ? 0.45 : 0.75;
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

const NOTE_LIFETIME = 5000; // 5 seconds

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
  entry.el.classList.remove('landed');
  entry.el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  entry.el.style.opacity = '0';
  entry.el.style.transform = `rotate(${entry.rot}deg) translateY(-12px) scale(0.88)`;
  setTimeout(() => {
    entry.el.remove();
    spawnedNotes = spawnedNotes.filter(n => n !== entry);
    drawWires();
  }, 700);
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
