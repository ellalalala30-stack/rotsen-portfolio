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

  /* Load GLB — try local first, fall back to GitHub Pages */
  let mixer = null;
  let charGroup = null;

  function onLoad(gltf) {
    const model = gltf.scene;

    /* Start animation first so skinned mesh bones settle into pose */
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.timeScale = 0.9;
      action.play();
      mixer.update(0.1); // advance one tick so skeleton is in bind pose
    }

    /* Shadows + materials */
    model.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => {
            if (m.roughness !== undefined) m.roughness = Math.min(m.roughness, 0.85);
          });
        }
      }
    });

    /* Bounding box AFTER skeleton is in pose */
    const box3 = new THREE.Box3().setFromObject(model);
    const size   = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box3.getSize(size);
    box3.getCenter(centre);
    const h = size.y;
    const w = size.x;

    /* Shift model so feet sit at Y=0, centred on X/Z */
    model.position.set(-centre.x, -box3.min.y, -centre.z);

    /* Mirror: face left toward hero text */
    charGroup = new THREE.Group();
    charGroup.scale.x = -1;
    charGroup.add(model);
    scene.add(charGroup);

    /* Camera: fit full character in view with a bit of breathing room */
    const fovRad  = camera.fov * (Math.PI / 180);
    const aspect  = camera.aspect;
    const fitH    = (h / 2) / Math.tan(fovRad / 2); // dist to fit height
    const fitW    = (w / 2) / Math.tan((fovRad * aspect) / 2); // dist to fit width
    const dist    = Math.max(fitH, fitW) * 1.15;     // 15% padding
    camera.position.set(0, h * 0.5, dist);
    camera.lookAt(0, h * 0.46, 0);
    camera.updateProjectionMatrix();

    groundDisc.position.y = 0.01;
  }

  /* Try relative path first (works on localhost + GitHub Pages same-origin).
     GitHub Pages absolute URL as fallback for CodePen / cross-origin embeds. */
  const loader = new THREE.GLTFLoader();
  loader.load(
    'character.glb',
    onLoad,
    null,
    () => {
      loader.load(
        'https://ellalalala30-stack.github.io/rotsen-portfolio/character.glb',
        onLoad,
        null,
        err => console.warn('GLB load error:', err)
      );
    }
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

/* Professional tone — light/default mode */
const notePoolPro = [
  { title: 'Design Principle', body: 'Effective design communicates without explanation. If it needs one, reconsider it.' },
  { title: 'Automation Standard', body: 'Every repeated manual task is an unresolved process gap. We resolve it once.' },
  { title: 'Client Insight', body: 'Clients don\'t commission a logo. They invest in perceived authority.' },
  { title: 'Operational Stack', body: 'Make.com · Shopify · Google Workspace — fully integrated, zero manual input.' },
  { title: 'On AI Execution', body: 'AI accelerates output. Judgment still determines quality.' },
  { title: 'Brand Consistency', body: 'Reliable visual language outperforms clever one-offs. Always.' },
  { title: 'Executive Support', body: 'The best executive VA removes friction before it reaches the decision-maker.' },
  { title: 'Systems Design', body: 'A well-architected workflow runs unattended. That\'s the goal.' },
  { title: 'Visual Intent', body: 'Every design element carries a decision. Ensure each one is intentional.' },
  { title: 'Documentation', body: 'If the process isn\'t written down, it doesn\'t exist as a system.' },
  { title: 'Content Strategy', body: 'Publish with a defined objective or defer until one exists.' },
  { title: 'Platform Migration', body: 'Transition planning preserves SEO equity and enrollment continuity.' },
  { title: 'Deliverables', body: 'Outcomes, not activity reports. That\'s what gets measured.' },
  { title: 'Zero-Touch Ops', body: 'Infrastructure built correctly requires no ongoing intervention.' },
];

/* Casual / warm tone — no-fluff / dark mode */
const notePoolCasual = [
  { title: 'real talk', body: 'Good design just feels right. You can\'t always explain it — you just know.' },
  { title: 'automate it', body: 'If you\'re doing it twice, something\'s already broken. Let\'s fix that.' },
  { title: 'client truth', body: 'They don\'t need a pretty logo. They need people to trust them.' },
  { title: 'my setup', body: 'Make.com + Shopify + Workspace = I handle it once and walk away.' },
  { title: 'on AI', body: 'AI is a shortcut, not a replacement. Taste still wins.' },
  { title: 'brand game', body: 'Showing up the same way every time is the whole strategy.' },
  { title: 'VA life', body: 'The best support is invisible. You just notice things running smoother.' },
  { title: 'build it right', body: 'A good system doesn\'t need you checking on it. That\'s the whole point.' },
  { title: 'every pixel', body: 'Nothing should be there by accident. If it\'s there, it\'s a choice.' },
  { title: 'write it down', body: 'No SOP = you\'ll be re-explaining this forever. Document it.' },
  { title: 'post with purpose', body: 'If you don\'t know why you\'re posting it, neither will they.' },
  { title: 'La Union mornings', body: 'Best ideas hit at sunrise by the water. Honestly, no joke.' },
  { title: 'get it done', body: 'Decisions, not decks. Results, not reports.' },
  { title: 'zero touch', body: 'Built it right once. Hasn\'t needed me since. Love that for us.' },
];

function getNotePool() {
  return currentMode === 'dark' ? notePoolCasual : notePoolPro;
}

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
  const pool = getNotePool();
  const data = pool[noteIndex % pool.length];
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
