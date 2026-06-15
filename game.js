// ============================================================
// MIND IN MOTION — game.js
// States: MENU → INTRO → STORY → PLAY → FADE → STORY → END
// Enemy types: patrol | stalker | sentinel | charger | floater
// ============================================================

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// ---------- sprite sheet ----------
const SHEET = { cols: 11, runFrames: 8, idle: 8, jump: 9, fall: 10, cw: 260, ch: 360, feetPad: 8 };
const sprite = new Image();
sprite.src = 'bruder_run_sheet.png';
let spriteReady = false;
sprite.onload = () => spriteReady = true;

// ---------- original world backgrounds ----------
const bg = {
  sky: new Image(), hills: new Image(), mono: new Image(),
  ruins: new Image(), debris: new Image(), occl: new Image(), shard: new Image(),
  skyOk: false, hillsOk: false, monoOk: false,
  ruinsOk: false, debrisOk: false, occlOk: false, shardOk: false
};
bg.sky.src = 'bg_sky.jpg';             bg.sky.onload   = () => bg.skyOk   = true;
bg.hills.src = 'bg_hills.png';         bg.hills.onload = () => bg.hillsOk = true;
bg.mono.src = 'bg_monoliths.png';      bg.mono.onload  = () => bg.monoOk  = true;
bg.ruins.src = 'bg_ruins.png';         bg.ruins.onload = () => bg.ruinsOk = true;
bg.debris.src = 'bg_debris.png';       bg.debris.onload = () => bg.debrisOk = true;
bg.occl.src = 'bg_occl_thin.png';      bg.occl.onload  = () => bg.occlOk  = true;
bg.shard.src = 'bg_occl_shard.png';    bg.shard.onload = () => bg.shardOk = true;

// ---------- beyond world backgrounds (Cloudinary) ----------
const bgB = {
  sky: new Image(), hills: new Image(), mono: new Image(), ruins: new Image(),
  skyOk: false, hillsOk: false, monoOk: false, ruinsOk: false
};
bgB.sky.src   = 'https://res.cloudinary.com/dcjst7sod/image/upload/v1781468294/deep_space_night_sky__dark_b3ssyj.jpg';
bgB.sky.onload   = () => bgB.skyOk   = true;
bgB.hills.src = 'bg_hills_ch7.jpg';
bgB.hills.onload = () => bgB.hillsOk = true;
bgB.mono.src  = 'https://res.cloudinary.com/dcjst7sod/image/upload/v1781542147/Level_7_vfrroz.jpg';
bgB.mono.onload  = () => bgB.monoOk  = true;
bgB.ruins.src = 'bg_ruins_ch7.jpg';
bgB.ruins.onload = () => bgB.ruinsOk = true;

// ---------- chapter card illustrations ----------
const cardImages = [];
const cardImagesOk = Array(20).fill(false);
for (let i = 0; i < 20; i++) {
  cardImages[i] = new Image();
  cardImages[i].src = `chapter_${i}.jpg`;
  cardImages[i].onload = () => { cardImagesOk[i] = true; };
}

// ---------- physics ----------
const PHYS = {
  gravity: 2150, moveAccel: 3000, airAccel: 2700, friction: 2200,
  maxSpeed: 470, jumpVel: -930, jumpCut: 0.45,
  coyoteTime: 0.12, jumpBuffer: 0.15, maxFall: 1100
};

// ---------- game state ----------
const game = {
  state: 'MENU',
  levelIndex: 0, level: null, checkpoint: null,
  fade: 0, storyLine: 0, storyTimer: 0,
  deaths: 0, audioDamp: 1.0,
  bloom: 0.0, targetBloom: 0.0, phaseTimer: 0.0,
  screenShake: 0.0
};

const player = {
  x: 0, y: 0, vx: 0, vy: 0, w: 34, h: 80,
  dir: 1, grounded: false, coyote: 0, buffer: 0,
  animTime: 0, frame: SHEET.idle,
  jumpsLeft: 2, stepTimer: 0,
  isDying: false, deathTimer: 0,
  squashX: 1, squashY: 1
};

const cam = { x: 0, y: 0, zoom: 1.0, targetZoom: 1.0 };
const particles = [];
const ambientParticles = [];
const enemies = [];
const sentinelBullets = [];

// ---------- asteroid system (ch1–6 background only) ----------
const asteroids = [];
const ASTEROID_CFG = [
  { density: 0.4, speedMin: 180, speedMax: 260, sizeMin: 2, sizeMax: 4,  alpha: 0.25 },
  { density: 0.7, speedMin: 200, speedMax: 300, sizeMin: 2, sizeMax: 5,  alpha: 0.35 },
  { density: 1.2, speedMin: 240, speedMax: 360, sizeMin: 3, sizeMax: 6,  alpha: 0.45 },
  { density: 1.8, speedMin: 280, speedMax: 420, sizeMin: 3, sizeMax: 8,  alpha: 0.55 },
  { density: 0.5, speedMin: 160, speedMax: 240, sizeMin: 2, sizeMax: 4,  alpha: 0.20 },
  { density: 2.8, speedMin: 340, speedMax: 520, sizeMin: 4, sizeMax: 10, alpha: 0.70 },
];
let asteroidTimer = 0;

function spawnAsteroid() {
  if (game.levelIndex >= 6) return;
  const c = ASTEROID_CFG[game.levelIndex];
  const speed = c.speedMin + Math.random() * (c.speedMax - c.speedMin);
  const size  = c.sizeMin  + Math.random() * (c.sizeMax  - c.sizeMin);
  const angle = 0.45 + Math.random() * 0.25;
  asteroids.push({
    x: Math.random() * W * 1.4, y: -20 - Math.random() * 80,
    vx: -Math.cos(angle) * speed * (0.4 + Math.random() * 0.3),
    vy: Math.sin(angle) * speed, size,
    alpha: c.alpha * (0.6 + Math.random() * 0.4), trail: []
  });
}

// ---------- audio ----------
const audioChannels = {
  ctx: null,
  nature: new Audio('nature.mp3'),
  music: new Audio('https://res.cloudinary.com/dcjst7sod/video/upload/v1781299773/Background_music_of_gameplay_uutorc.mp3'),
  menuMusic: new Audio('https://res.cloudinary.com/dcjst7sod/video/upload/v1781467127/Main_Menu_Audio_ovq3r9.mp3'),
  initialized: false, muted: false
};

function startAudio() {
  if (audioChannels.initialized) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  audioChannels.ctx = new AudioCtx();
  audioChannels.nature.loop = true; audioChannels.nature.volume = 0.55; audioChannels.nature.play().catch(() => {});
  audioChannels.music.loop = true; audioChannels.music.volume = 0.0; audioChannels.music.play().catch(() => {});
  audioChannels.menuMusic.loop = true; audioChannels.menuMusic.volume = 0.0; audioChannels.menuMusic.play().catch(() => {});
  audioChannels.initialized = true;
}

function synthSFX(type) {
  if (!audioChannels.initialized || audioChannels.muted || !audioChannels.ctx) return;
  const ac = audioChannels.ctx; const now = ac.currentTime;
  if (type === 'jump') {
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(280, now); o.frequency.exponentialRampToValueAtTime(520, now + 0.12);
    g.gain.setValueAtTime(0.25, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + 0.41);
  } else if (type === 'step') {
    const o = ac.createOscillator(); const g = ac.createGain(); const f = ac.createBiquadFilter();
    o.type = 'triangle'; o.frequency.setValueAtTime(75, now); f.type = 'lowpass'; f.frequency.setValueAtTime(120, now);
    g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    o.connect(f); f.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + 0.09);
  } else if (type === 'spring') {
    const o1 = ac.createOscillator(); const o2 = ac.createOscillator(); const g = ac.createGain();
    o1.type = 'sine'; o1.frequency.setValueAtTime(180, now); o1.frequency.exponentialRampToValueAtTime(650, now + 0.3);
    o2.type = 'triangle'; o2.frequency.setValueAtTime(220, now); o2.frequency.exponentialRampToValueAtTime(880, now + 0.25);
    g.gain.setValueAtTime(0.35, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    o1.connect(g); o2.connect(g); g.connect(ac.destination); o1.start(now); o2.start(now); o1.stop(now + 0.6); o2.stop(now + 0.6);
  } else if (type === 'checkpoint') {
    const o1 = ac.createOscillator(); const o2 = ac.createOscillator(); const g = ac.createGain();
    o1.type = 'sine'; o1.frequency.setValueAtTime(580, now); o1.frequency.exponentialRampToValueAtTime(880, now + 0.2);
    o2.type = 'sine'; o2.frequency.setValueAtTime(700, now); o2.frequency.exponentialRampToValueAtTime(1150, now + 0.35);
    g.gain.setValueAtTime(0.25, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    o1.connect(g); o2.connect(g); g.connect(ac.destination); o1.start(now); o2.start(now); o1.stop(now + 0.5); o2.stop(now + 0.5);
  } else if (type === 'shoot') {
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(620, now); o.frequency.exponentialRampToValueAtTime(180, now + 0.18);
    g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + 0.22);
  } else if (type === 'death') {
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(440, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.5);
    g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + 0.6);
  }
}

function updateAudioMixing(dt) {
  if (!audioChannels.initialized || audioChannels.muted) return;
  let targetGame = 0.0, targetMenu = 0.0;
  if (game.state === 'PLAY') { targetGame = game.levelIndex >= 6 ? 0.75 : 0.55; }
  else if (game.state === 'STORY') { targetGame = 0.25; }
  else if (game.state === 'MENU' || game.state === 'PAUSE') { targetMenu = 0.65; }
  const spd = 0.5;
  let gv = audioChannels.music.volume;
  gv = gv < targetGame ? Math.min(targetGame, gv + spd * dt) : Math.max(targetGame, gv - spd * dt);
  let mv = audioChannels.menuMusic.volume;
  mv = mv < targetMenu ? Math.min(targetMenu, mv + spd * dt) : Math.max(targetMenu, mv - spd * dt);
  if (game.audioDamp < 1.0) game.audioDamp = Math.min(1.0, game.audioDamp + 1.8 * dt);
  audioChannels.music.volume = gv * game.audioDamp;
  audioChannels.menuMusic.volume = mv * game.audioDamp;
}

function toggleMute() {
  audioChannels.muted = !audioChannels.muted;
  const m = audioChannels.muted ? 0 : 1;
  audioChannels.nature.volume = 0.35 * m;
  audioChannels.music.volume = (game.state === 'PLAY' ? 0.55 : 0.0) * m;
  audioChannels.menuMusic.volume = ((game.state === 'MENU' || game.state === 'PAUSE') ? 0.65 : 0.0) * m;
}

// ---------- UI elements ----------
const gatekeeper    = document.getElementById('gatekeeper');
const videoElement  = document.getElementById('intro-video');
const menuVideoBg   = document.getElementById('menu-video-bg');
const introContainer = document.getElementById('intro-container');
const newJourneyBtn = document.getElementById('menu-new-btn');
const continueBtn   = document.getElementById('menu-cont-btn');
const quitBtn       = document.getElementById('menu-quit-btn');
const levelSelectPanel = document.getElementById('level-select-panel');
const nodesContainer   = document.getElementById('nodes-container');
const menuTitleText    = document.getElementById('menu-title-text');
const menuSubtitleText = document.getElementById('menu-subtitle-text');

const RN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];

let videoFrameAvailable = false;
if (menuVideoBg) {
  menuVideoBg.addEventListener('ended', () => { menuVideoBg.currentTime = 0; menuVideoBg.play().catch(() => {}); });
  menuVideoBg.addEventListener('play', () => { videoFrameAvailable = true; });
  menuVideoBg.addEventListener('loadeddata', () => { videoFrameAvailable = true; });
  window.addEventListener('focus', () => { if (game.state === 'MENU' || game.state === 'PAUSE') menuVideoBg.play().catch(() => {}); });
}

function setupSaveMenu() {
  const highestUnlocked = parseInt(localStorage.getItem('mim_unlocked') || "0");
  const lastSaved = parseInt(localStorage.getItem('mim_chapter') || "0");
  if (game.state === 'PAUSE') {
    menuTitleText.innerText = "PAUSED";
    menuSubtitleText.innerText = `${LEVELS[game.levelIndex].subtitle} — ${LEVELS[game.levelIndex].name}`;
    newJourneyBtn.innerText = "RESTART LEVEL";
    continueBtn.innerText = "RESUME"; continueBtn.style.display = "block";
    quitBtn.style.display = "block";
    levelSelectPanel.style.opacity = "0"; levelSelectPanel.style.pointerEvents = "none";
  } else {
    menuTitleText.innerText = "MIND IN MOTION";
    menuSubtitleText.innerText = "An Atmospheric Odyssey";
    newJourneyBtn.innerText = "NEW JOURNEY";
    quitBtn.style.display = "none";
    levelSelectPanel.style.pointerEvents = "auto";
    if (lastSaved > 0) { continueBtn.innerText = "CONTINUE"; continueBtn.style.display = "block"; }
    else { continueBtn.style.display = "none"; }
    if (highestUnlocked > 0) {
      levelSelectPanel.style.opacity = "1"; nodesContainer.innerHTML = "";
      for (let i = 0; i <= Math.min(highestUnlocked, LEVELS.length - 1); i++) {
        const btn = document.createElement('button'); btn.className = "node-btn"; btn.innerHTML = RN[i];
        btn.addEventListener('click', () => bootIntoSystem(i, false));
        nodesContainer.appendChild(btn);
      }
    } else { levelSelectPanel.style.opacity = "0"; }
  }
}

newJourneyBtn.addEventListener('click', () => {
  if (game.state === 'PAUSE') { gatekeeper.classList.add('hidden'); loadLevel(game.levelIndex); }
  else { bootIntoSystem(0, true); }
});
continueBtn.addEventListener('click', () => {
  if (game.state === 'PAUSE') { gatekeeper.classList.add('hidden'); game.state = 'PLAY'; }
  else { bootIntoSystem(parseInt(localStorage.getItem('mim_chapter') || "0"), false); }
});
quitBtn.addEventListener('click', () => { game.state = 'MENU'; setupSaveMenu(); });

function bootIntoSystem(idx, playIntro) {
  gatekeeper.classList.add('hidden'); startAudio();
  if (playIntro && videoElement && introContainer) {
    game.state = 'INTRO'; introContainer.classList.add('active');
    videoElement.play().catch(() => { videoElement.muted = true; videoElement.play().catch(() => {}); });
  } else {
    if (introContainer) introContainer.classList.remove('active');
    loadLevel(idx);
  }
}
if (videoElement) {
  videoElement.addEventListener('ended', () => {
    if (introContainer) introContainer.style.opacity = '0';
    setTimeout(() => { if (introContainer) introContainer.remove(); loadLevel(0); }, 1200);
  });
}
function skipVideo() {
  if (game.state !== 'INTRO') return;
  if (introContainer) introContainer.style.opacity = '0';
  setTimeout(() => { if (introContainer) introContainer.remove(); loadLevel(0); }, 1200);
}

// ---------- level loading ----------
function initEnemies() {
  enemies.length = 0;
  const L = game.level; if (!L || !L.enemies) return;
  for (const e of L.enemies) {
    enemies.push({
      ...e,
      isAggro: false,
      shootTimer: 1.0 + Math.random() * 1.5, // sentinel: time until first shot
      shootWarn: 0,                            // sentinel: warning flash timer
      chargeSpeed: 0,                          // charger: current sprint speed
      chargeTimer: 0,                          // charger: cooldown
      chargeActive: false
    });
  }
}

function initAmbientParticles() {
  ambientParticles.length = 0;
  for (let i = 0; i < 40; i++) {
    ambientParticles.push({
      x: Math.random() * W, y: Math.random() * H,
      size: 1 + Math.random() * 2,
      speedX: -10 - Math.random() * 20, speedY: -4 - Math.random() * 12,
      alpha: 0.1 + Math.random() * 0.4
    });
  }
}

function loadLevel(i) {
  game.levelIndex = i; game.level = LEVELS[i];
  game.checkpoint = { ...game.level.spawn };
  game.state = 'STORY'; game.storyLine = 0; game.storyTimer = 0;
  game.fade = 0; game.bloom = 0.0; game.targetBloom = 0.0; game.phaseTimer = 0.0;
  localStorage.setItem('mim_chapter', i);
  localStorage.setItem('mim_unlocked', Math.max(parseInt(localStorage.getItem('mim_unlocked') || "0"), i));
  sentinelBullets.length = 0;
  initAmbientParticles(); initEnemies(); respawn();
}

function respawn() {
  player.isDying = false;
  player.x = game.checkpoint.x; player.y = game.checkpoint.y;
  player.vx = 0; player.vy = 0; player.jumpsLeft = 2;
  cam.x = player.x; cam.y = player.y; cam.zoom = 1.0; cam.targetZoom = 1.0;
  sentinelBullets.length = 0;
  initEnemies();
  keys.left = false; keys.right = false; jumpHeld = false; player.buffer = 0;
}

function triggerDeath() {
  if (player.isDying) return;
  player.isDying = true; player.deathTimer = 0.75;
  game.deaths++; game.audioDamp = 0.15;
  game.screenShake = 0.3;
  synthSFX('death');
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: player.x + Math.random() * player.w,
      y: player.y + Math.random() * player.h,
      vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.6) * 190,
      life: 0.4 + Math.random() * 0.3, t: 0, isStatic: true
    });
  }
}

function dust(x, y, n, spread = 160) {
  for (let i = 0; i < n; i++) {
    particles.push({ x, y, vx: (Math.random() - 0.5) * spread, vy: -Math.random() * 90, life: 0.4 + Math.random() * 0.3, t: 0, isStatic: false });
  }
}

function overlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ---------- input ----------
const keys = { left: false, right: false }; let jumpHeld = false;

function anyKeyAdvance() {
  if (game.state === 'INTRO') { skipVideo(); return true; }
  if (game.state === 'END') { game.deaths = 0; loadLevel(0); return true; }
  if (game.state === 'STORY') {
    if (game.storyLine < game.level.story.length) { game.storyLine = game.level.story.length; }
    else { game.state = 'PLAY'; keys.left = false; keys.right = false; jumpHeld = false; player.buffer = 0; }
    return true;
  }
  return false;
}

function setKey(code, down) {
  if (!down) {
    if (code === 'ArrowLeft'  || code === 'KeyA') keys.left  = false;
    if (code === 'ArrowRight' || code === 'KeyD') keys.right = false;
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') jumpHeld = false;
    return;
  }
  if ((code === 'Escape' || code === 'KeyP') && (game.state === 'PLAY' || game.state === 'PAUSE')) {
    if (game.state === 'PLAY') { game.state = 'PAUSE'; setupSaveMenu(); gatekeeper.classList.remove('hidden'); }
    else { game.state = 'PLAY'; gatekeeper.classList.add('hidden'); }
    return;
  }
  if (game.state === 'MENU' || game.state === 'PAUSE' || player.isDying) return;
  if (anyKeyAdvance()) return;
  if (code === 'KeyM') { toggleMute(); return; }
  if (code === 'ArrowLeft'  || code === 'KeyA') keys.left  = true;
  if (code === 'ArrowRight' || code === 'KeyD') keys.right = true;
  if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') { if (!jumpHeld) player.buffer = PHYS.jumpBuffer; jumpHeld = true; }
  if (code === 'KeyR' && game.state === 'PLAY') triggerDeath();
}

window.addEventListener('keydown', e => { setKey(e.code, true); e.preventDefault(); });
window.addEventListener('keyup',   e => setKey(e.code, false));
function bindBtn(id, code) {
  const el = document.getElementById(id); if (!el) return;
  el.addEventListener('touchstart', e => { setKey(code, true);  e.preventDefault(); }, { passive: false });
  el.addEventListener('touchend',   e => { setKey(code, false); e.preventDefault(); }, { passive: false });
}
bindBtn('btnL', 'ArrowLeft'); bindBtn('btnR', 'ArrowRight'); bindBtn('btnJ', 'Space');
canvas.addEventListener('touchstart', () => anyKeyAdvance());
if (introContainer) introContainer.addEventListener('touchstart', () => anyKeyAdvance());

// ============================================================
// UPDATE
// ============================================================
function update(dt) {
  updateAudioMixing(dt);
  if (game.state === 'MENU' || game.state === 'INTRO' || game.state === 'PAUSE') return;
  if (game.state === 'STORY') {
    game.storyTimer += dt;
    game.storyLine = Math.min(Math.max(game.storyLine, Math.floor(game.storyTimer / 1.4)), game.level.story.length);
    return;
  }
  if (game.state === 'FADE') {
    game.fade = Math.min(1, game.fade + dt * 1.4);
    if (game.fade >= 1) {
      if (game.levelIndex + 1 >= LEVELS.length) game.state = 'END';
      else loadLevel(game.levelIndex + 1);
    }
    return;
  }
  if (game.state === 'END') return;

  game.screenShake = Math.max(0, game.screenShake - dt * 4);
  player.squashX += (1 - player.squashX) * 10 * dt;
  player.squashY += (1 - player.squashY) * 10 * dt;

  if (player.isDying) {
    player.deathTimer -= dt;
    if (player.deathTimer <= 0) respawn();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.t += dt;
      if (p.t > p.life) { particles.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    return;
  }

  game.phaseTimer += dt;
  if (player.x > 550) game.targetBloom = 1.0;
  game.bloom += (game.targetBloom - game.bloom) * 1.8 * dt;

  // ---------- asteroids (ch1–6) ----------
  if (game.levelIndex < 6) {
    asteroidTimer += dt;
    const interval = 1.2 / ASTEROID_CFG[game.levelIndex].density;
    if (asteroidTimer > interval) { spawnAsteroid(); asteroidTimer = 0; }
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const a = asteroids[i];
      a.trail.push({ x: a.x, y: a.y });
      if (a.trail.length > 18) a.trail.shift();
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.y > H + 60 || a.x < -200) asteroids.splice(i, 1);
    }
  } else { asteroids.length = 0; }

  const L = game.level;
  const isBeyond = L.mood && L.mood.isBeyond;
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  // ---------- springs ----------
  for (const [sx, sy, sw, sh, sp] of (L.springs || [])) {
    if (overlap(player.x, player.y, player.w, player.h, sx, sy, sw, sh)) {
      player.vy = -sp; player.grounded = false; player.jumpsLeft = 2;
      synthSFX('spring'); dust(player.x + player.w / 2, player.y + player.h, 24, 280);
      player.squashX = 0.75; player.squashY = 1.35;
    }
  }

  // ---------- enemy AI ----------
  for (let e of enemies) {
    const ex = e.x + e.w / 2;
    const ey = e.y + e.h / 2;
    const distX = px - ex;
    const distAbs = Math.abs(distX);

    if (e.type === 'patrol') {
      e.x += e.speed * e.dir * dt;
      if (e.x < e.minX) { e.x = e.minX; e.dir = 1; }
      if (e.x > e.maxX) { e.x = e.maxX; e.dir = -1; }

    } else if (e.type === 'stalker') {
      e.isAggro = distAbs < 320;
      const spd = e.isAggro ? e.speed * 2.2 : e.speed;
      e.x += Math.sign(distX) * (e.isAggro ? spd : e.speed) * dt;
      if (!e.isAggro) {
        if (e.x < e.minX) { e.x = e.minX; e.dir = 1; }
        if (e.x > e.maxX) { e.x = e.maxX; e.dir = -1; }
      }
      e.dir = Math.sign(distX) || 1;

    } else if (e.type === 'sentinel') {
      // Stands still, fires aimed shots at player
      e.dir = distX > 0 ? 1 : -1;
      e.shootTimer -= dt;
      if (e.shootWarn > 0) {
        e.shootWarn -= dt;
        e.isAggro = true;
        if (e.shootWarn <= 0) {
          // Fire
          const angle = Math.atan2(py - ey, px - ex);
          const bulletSpeed = 380 + game.levelIndex * 12;
          sentinelBullets.push({
            x: e.x + e.w / 2, y: e.y + e.h / 2,
            vx: Math.cos(angle) * bulletSpeed,
            vy: Math.sin(angle) * bulletSpeed,
            life: 2.2, t: 0, r: 6
          });
          synthSFX('shoot');
          e.shootTimer = 1.8 + Math.random() * 1.2 - game.levelIndex * 0.04;
          e.shootTimer = Math.max(0.8, e.shootTimer);
        }
      } else if (e.shootTimer <= 0) {
        e.shootWarn = 0.35; // warning flash before firing
        e.isAggro = true;
      } else {
        e.isAggro = false;
      }

    } else if (e.type === 'charger') {
      // Patrols slowly, charges when player in range
      e.chargeTimer = Math.max(0, e.chargeTimer - dt);
      if (e.chargeActive) {
        e.x += e.chargeSpeed * dt;
        e.chargeSpeed *= (1 - dt * 2.5);
        if (Math.abs(e.chargeSpeed) < 30 || e.x < e.minX || e.x > e.maxX) {
          e.chargeActive = false; e.chargeTimer = 1.4; e.chargeSpeed = 0;
          if (e.x < e.minX) { e.x = e.minX; e.dir = 1; }
          if (e.x > e.maxX) { e.x = e.maxX; e.dir = -1; }
        }
        e.isAggro = true;
      } else {
        e.isAggro = false;
        if (distAbs < 350 && e.chargeTimer <= 0) {
          // Begin charge
          e.chargeActive = true;
          e.chargeSpeed = Math.sign(distX) * (500 + game.levelIndex * 15);
          e.dir = Math.sign(distX) || 1;
          e.isAggro = true;
        } else {
          // Normal patrol
          e.x += e.speed * e.dir * dt;
          if (e.x < e.minX) { e.x = e.minX; e.dir = 1; }
          if (e.x > e.maxX) { e.x = e.maxX; e.dir = -1; }
        }
      }
    }

    // All enemy types kill on touch
    if (overlap(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
      triggerDeath(); return;
    }
  }

  // ---------- sentinel bullets ----------
  for (let i = sentinelBullets.length - 1; i >= 0; i--) {
    const b = sentinelBullets[i];
    b.x += b.vx * dt; b.y += b.vy * dt; b.t += dt;
    if (b.t > b.life) { sentinelBullets.splice(i, 1); continue; }
    // Slight gravity on bullets
    b.vy += 200 * dt;
    if (overlap(player.x, player.y, player.w, player.h, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2)) {
      triggerDeath(); return;
    }
  }

  // ---------- player physics ----------
  const accel = player.grounded ? PHYS.moveAccel : PHYS.airAccel;
  let move = 0;
  if (keys.left)  move -= 1;
  if (keys.right) move += 1;
  if (move !== 0) { player.vx += move * accel * dt; player.dir = move; }
  else if (player.grounded) {
    const f = PHYS.friction * dt;
    if (Math.abs(player.vx) <= f) player.vx = 0; else player.vx -= Math.sign(player.vx) * f;
  }
  player.vx = Math.max(-PHYS.maxSpeed, Math.min(PHYS.maxSpeed, player.vx));
  player.vy = Math.min(player.vy + PHYS.gravity * dt, PHYS.maxFall);

  player.coyote = Math.max(0, player.coyote - dt);
  player.buffer = Math.max(0, player.buffer - dt);
  if (player.buffer > 0) {
    if (player.grounded || player.coyote > 0) {
      player.vy = PHYS.jumpVel; player.grounded = false; player.coyote = 0;
      player.buffer = 0; player.jumpsLeft = 1;
      synthSFX('jump'); dust(player.x + player.w / 2, player.y + player.h, 8);
      player.squashX = 0.82; player.squashY = 1.25;
    } else if (player.jumpsLeft > 0) {
      player.vy = PHYS.jumpVel * 0.95; player.buffer = 0; player.jumpsLeft = 0;
      synthSFX('jump'); dust(player.x + player.w / 2, player.y + player.h / 2, 14, 220);
      player.squashX = 0.85; player.squashY = 1.20;
    }
  }
  if (!jumpHeld && player.vy < 0) player.vy *= 1 - (1 - PHYS.jumpCut) * Math.min(1, dt * 14);

  const wasGrounded = player.grounded; const preVy = player.vy;
  player.grounded = false;
  player.x += player.vx * dt;
  for (const [plx, ply, plw, plh] of L.platforms) {
    if (overlap(player.x, player.y, player.w, player.h, plx, ply, plw, plh)) {
      if (player.vx > 0) player.x = plx - player.w;
      else if (player.vx < 0) player.x = plx + plw;
      player.vx = 0;
    }
  }
  player.y += player.vy * dt;
  for (const [plx, ply, plw, plh] of L.platforms) {
    if (overlap(player.x, player.y, player.w, player.h, plx, ply, plw, plh)) {
      if (player.vy > 0) {
        player.y = ply - player.h; player.grounded = true; player.jumpsLeft = 2;
        if (!wasGrounded && preVy > 450) {
          dust(player.x + player.w / 2, player.y + player.h, 10);
          player.squashX = Math.min(1.4, 1.0 + (preVy - 450) * 0.0007);
          player.squashY = 2.0 - player.squashX;
        }
        player.vy = 0;
      } else if (player.vy < 0) { player.y = ply + plh; player.vy = 0; }
    }
  }
  if (player.grounded) player.coyote = PHYS.coyoteTime;

  // ---------- checkpoints ----------
  for (const cp of L.checkpoints) {
    if (Math.abs(player.x - cp.x) < 30 && Math.abs(player.y - cp.y) < 90 && game.checkpoint.x !== cp.x) {
      game.checkpoint = { ...cp }; dust(cp.x, cp.y + 80, 14, 80); synthSFX('checkpoint');
    }
  }

  // ---------- hazards ----------
  for (const [hx, hy, hw, hh] of (L.hazards || [])) {
    if (overlap(player.x, player.y, player.w, player.h, hx, hy - 6, hw, hh + 6)) { triggerDeath(); return; }
  }

  // ---------- exit (generous detection — touch within 60px of door) ----------
  const ex = L.exit; 
  if (overlap(player.x - 20, player.y, player.w + 40, player.h, ex.x, ex.y - 20, ex.w, ex.h + 40)) game.state = 'FADE';

  // ---------- fall death ----------
  if (player.y > L.bottom) { triggerDeath(); return; }

  // ---------- animation ----------
  const spd = Math.abs(player.vx);
  if (player.grounded && spd > 30) {
    player.stepTimer += dt * (spd / PHYS.maxSpeed);
    if (player.stepTimer > 0.34) { synthSFX('step'); player.stepTimer = 0; }
  }
  if (!player.grounded) { player.frame = player.vy < 0 ? SHEET.jump : SHEET.fall; }
  else if (spd > 20) { player.animTime += dt * (8 + 6 * spd / PHYS.maxSpeed); player.frame = Math.floor(player.animTime) % SHEET.runFrames; }
  else { player.frame = SHEET.idle; player.animTime = 0; }

  // ---------- camera ----------
  const zoomTarget = game.levelIndex >= 6 ? 0.65 : (game.levelIndex === 0 && player.x > 4000 && player.x < 5100 ? 0.55 : 0.85);
  cam.targetZoom = zoomTarget;
  cam.zoom += (cam.targetZoom - cam.zoom) * Math.min(1, dt * 2.5);
  cam.x += ((player.x + player.w / 2 + player.dir * 70) - cam.x) * Math.min(1, dt * 4);
  cam.y += ((player.y + player.h / 2 - 20) - cam.y) * Math.min(1, dt * 3);
  cam.x = Math.max((W / 2) / cam.zoom, Math.min(L.width - (W / 2) / cam.zoom, cam.x));
  cam.y = Math.min(L.bottom - (H / 2) / cam.zoom + 100, cam.y);

  // ---------- particles ----------
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.t += dt;
    if (p.t > p.life) { particles.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (!p.isStatic) p.vy += 300 * dt;
  }
  for (let p of ambientParticles) {
    const f = 1.0 + 0.5 * Math.abs(Math.sin(performance.now() / 380));
    p.x += p.speedX * f * dt; p.y += p.speedY * dt;
    if (p.x < -20) p.x = W + 20;
    if (p.y < -20) p.y = H + 20;
  }
}

// Bioluminescent grass drawn on platform tops in the Beyond world
function drawBeyondGrass(px, py, pw, seed) {
  ctx.save();
  // Clip to platform width
  ctx.beginPath(); ctx.rect(px, py - 18, pw, 20); ctx.clip();

  const bladeCount = Math.max(4, Math.floor(pw / 14));
  for (let i = 0; i < bladeCount; i++) {
    // Seeded pseudo-random per blade so it doesn't change every frame
    const r1 = ((seed * 7 + i * 13) * 2654435761 >>> 0) / 4294967296;
    const r2 = ((seed * 3 + i * 17) * 2246822519 >>> 0) / 4294967296;
    const r3 = ((seed * 11 + i * 5) * 3266489917 >>> 0) / 4294967296;

    const bx = px + (i / bladeCount) * pw + r1 * 10 - 5;
    const baseY = py;
    const height = 6 + r2 * 10;
    const lean = (r3 - 0.5) * 8;
    const thick = 1 + r1 * 1.5;

    // Blade glow
    const glowA = 0.3 + r2 * 0.4;
    ctx.shadowColor = `rgba(0, 220, 200, ${glowA})`;
    ctx.shadowBlur = 4;
    ctx.strokeStyle = `rgba(0, ${180 + Math.floor(r3 * 60)}, ${160 + Math.floor(r1 * 60)}, ${0.6 + r2 * 0.35})`;
    ctx.lineWidth = thick;
    ctx.beginPath();
    ctx.moveTo(bx, baseY);
    ctx.quadraticCurveTo(bx + lean * 0.5, baseY - height * 0.6, bx + lean, baseY - height);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ============================================================
// RENDER
// ============================================================
function layer(img, ok, p, hFrac, gap = 1) {
  if (!ok) return;
  const lh = H * hFrac; const lw = img.width * (lh / img.height);
  const span = lw * gap; let x = -((cam.x * p) % span);
  if (x > 0) x -= span;
  for (; x < W; x += span) ctx.drawImage(img, x, H - lh, lw, lh);
}

function fogDrift() {
  const t = performance.now() / 1000;
  for (let i = 0; i < 3; i++) {
    const fx = ((t * (8 + i * 5) + i * 700) % (W + 800)) - 400;
    const fy = H * (0.45 + i * 0.16); const r = 260 + i * 90;
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, r);
    g.addColorStop(0, 'rgba(140, 160, 185, 0.07)'); g.addColorStop(1, 'rgba(140, 160, 185, 0)');
    ctx.fillStyle = g; ctx.fillRect(fx - r, fy - r, r * 2, r * 2);
  }
}

function lightShafts() {
  const t = performance.now() / 1000; ctx.save();
  for (let i = 0; i < 2; i++) {
    const bx = W * (0.25 + i * 0.45) - (cam.x * 0.1) % W;
    const a = 0.025 + 0.02 * Math.sin(t * 0.3 + i * 2);
    ctx.fillStyle = `rgba(220, 230, 245, ${Math.max(0, a)})`;
    ctx.beginPath(); ctx.moveTo(bx, -20); ctx.lineTo(bx + 130, -20);
    ctx.lineTo(bx + 330, H); ctx.lineTo(bx + 110, H); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function beyondFogDrift() {
  const t = performance.now() / 1000;
  for (let i = 0; i < 4; i++) {
    const fx = ((t * (5 + i * 3) + i * 900) % (W + 1000)) - 500;
    const fy = H * (0.4 + i * 0.15); const r = 300 + i * 100;
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, r);
    g.addColorStop(0, 'rgba(0, 200, 200, 0.06)'); g.addColorStop(1, 'rgba(0, 150, 180, 0)');
    ctx.fillStyle = g; ctx.fillRect(fx - r, fy - r, r * 2, r * 2);
  }
}

function beyondLightShafts() {
  const t = performance.now() / 1000; ctx.save();
  for (let i = 0; i < 3; i++) {
    const bx = W * (0.2 + i * 0.3) - (cam.x * 0.08) % W;
    const a = 0.018 + 0.015 * Math.sin(t * 0.25 + i * 2.1);
    ctx.fillStyle = `rgba(0, 230, 230, ${Math.max(0, a)})`;
    ctx.beginPath(); ctx.moveTo(bx, -20); ctx.lineTo(bx + 100, -20);
    ctx.lineTo(bx + 280, H); ctx.lineTo(bx + 90, H); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawPlayer() {
  const drawH = 100; const drawW = drawH * SHEET.cw / SHEET.ch;
  const cx = player.x + player.w / 2; const feetY = player.y + player.h;
  ctx.save(); ctx.translate(cx, feetY); ctx.scale(player.dir * player.squashX, player.squashY);
  const isBeyond = game.level && game.level.mood && game.level.mood.isBeyond;
  if (spriteReady) {
    ctx.shadowColor = isBeyond ? 'rgba(0, 220, 220, 0.7)' : 'rgba(157, 184, 224, 0.6)';
    ctx.shadowBlur = isBeyond ? 18 : 14;
    ctx.drawImage(sprite, player.frame * SHEET.cw, 0, SHEET.cw, SHEET.ch, -drawW / 2, -drawH + (drawH * SHEET.feetPad / SHEET.ch), drawW, drawH);
  } else {
    ctx.fillStyle = '#05090f'; ctx.fillRect(-player.w / 2, -player.h, player.w, player.h);
  }
  ctx.restore();
}

function render() {
  // ---------- menu / pause ----------
  if (game.state === 'MENU' || game.state === 'PAUSE') {
    ctx.fillStyle = '#05090f'; ctx.fillRect(0, 0, W, H);
    if (videoFrameAvailable && menuVideoBg) {
      ctx.save(); ctx.globalAlpha = 0.85;
      const s = Math.max(W / menuVideoBg.videoWidth, H / menuVideoBg.videoHeight);
      ctx.drawImage(menuVideoBg, (W - menuVideoBg.videoWidth * s) / 2, (H - menuVideoBg.videoHeight * s) / 2, menuVideoBg.videoWidth * s, menuVideoBg.videoHeight * s);
      ctx.restore();
    }
    return;
  }
  if (game.state === 'INTRO') return;
  if (game.state === 'STORY') { renderStory(); return; }
  if (game.state === 'END')   { renderEnd();   return; }

  const isBeyond = game.level.mood && game.level.mood.isBeyond;
  const isFinale = game.level.mood && game.level.mood.isFinale;
  const mood = game.level.mood || {};

  // ---------- screen shake ----------
  const shakeX = game.screenShake > 0 ? (Math.random() - 0.5) * game.screenShake * 14 : 0;
  const shakeY = game.screenShake > 0 ? (Math.random() - 0.5) * game.screenShake * 14 : 0;
  if (game.screenShake > 0) ctx.save(), ctx.translate(shakeX, shakeY);

  // ---------- sky (cover full canvas, no gaps) ----------
  if (isBeyond) {
    ctx.fillStyle = '#030d18'; ctx.fillRect(0, 0, W, H);
    if (bgB.skyOk) {
      const s = Math.max(W / bgB.sky.width, H / bgB.sky.height);
      ctx.drawImage(bgB.sky, (W - bgB.sky.width * s) / 2, (H - bgB.sky.height * s) / 2, bgB.sky.width * s, bgB.sky.height * s);
    }
  } else {
    ctx.fillStyle = '#07101e'; ctx.fillRect(0, 0, W, H);
    if (bg.skyOk) {
      const s = Math.max(W / bg.sky.width, H / bg.sky.height);
      ctx.drawImage(bg.sky, (W - bg.sky.width * s) / 2, (H - bg.sky.height * s) / 2, bg.sky.width * s, bg.sky.height * s);
    }
  }

  // ---------- parallax layers ----------
  if (isBeyond) {
    layer(bgB.hills, bgB.hillsOk, 0.15, 0.62, 1.0);
    ctx.fillStyle = 'rgba(0, 160, 160, 0.10)'; ctx.fillRect(0, 0, W, H);
    layer(bgB.mono, bgB.monoOk, 0.35, 0.72, 1.0);
    ctx.fillStyle = 'rgba(0, 130, 150, 0.07)'; ctx.fillRect(0, 0, W, H);
    layer(bgB.ruins, bgB.ruinsOk, 0.55, 0.52, 1.0);
    ctx.fillStyle = 'rgba(0, 100, 120, 0.05)'; ctx.fillRect(0, 0, W, H);
    beyondFogDrift(); beyondLightShafts();
  } else {
    const [vr, vg, vb] = mood.veil || [105, 125, 148];
    layer(bg.hills, bg.hillsOk, 0.15, 0.60, 1.0);
    ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.25)`; ctx.fillRect(0, 0, W, H);
    layer(bg.mono, bg.monoOk, 0.35, 0.70, 1.0);
    ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.15)`; ctx.fillRect(0, 0, W, H);
    layer(bg.ruins, bg.ruinsOk, 0.55, 0.50, 1.0);
    ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.06)`; ctx.fillRect(0, 0, W, H);
    fogDrift(); lightShafts();
    layer(bg.shard, bg.shardOk, 0.75, 0.95, 2.8);
    layer(bg.occl,  bg.occlOk,  0.85, 1.05, 2.2);
    layer(bg.debris, bg.debrisOk, 1.25, 0.35, 1.5);
  }

  // ---------- asteroids (ch1–6) ----------
  if (asteroids.length > 0) {
    ctx.save();
    for (const a of asteroids) {
      if (a.trail.length < 2) continue;
      for (let t = 0; t < a.trail.length - 1; t++) {
        const frac = t / a.trail.length;
        ctx.beginPath(); ctx.moveTo(a.trail[t].x, a.trail[t].y); ctx.lineTo(a.trail[t+1].x, a.trail[t+1].y);
        ctx.strokeStyle = `rgba(255, ${140 + Math.floor(frac * 80)}, 40, ${a.alpha * frac * 0.7})`;
        ctx.lineWidth = a.size * frac * 0.9; ctx.stroke();
      }
      const grd = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.size * 2.5);
      grd.addColorStop(0, `rgba(255, 240, 180, ${a.alpha})`);
      grd.addColorStop(0.4, `rgba(255, 140, 30, ${a.alpha * 0.7})`);
      grd.addColorStop(1, 'rgba(255, 80, 0, 0)');
      ctx.beginPath(); ctx.arc(a.x, a.y, a.size * 2.5, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill();
    }
    ctx.restore();
  }

  // ---------- ambient particles ----------
  ctx.save();
  const pulse = 1.0 + 0.4 * Math.abs(Math.sin(performance.now() / 380));
  for (const p of ambientParticles) {
    ctx.fillStyle = isBeyond
      ? `rgba(0, 210, 210, ${p.alpha * 0.5})`
      : (game.bloom < 1.0 ? `rgba(140, 155, 180, ${p.alpha * 0.4})` : `rgba(223, 232, 245, ${p.alpha})`);
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // ---------- world space ----------
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.x, -cam.y);

  const L = game.level;

  // ---------- platforms ----------
  for (let i = 0; i < L.platforms.length; i++) {
    const [plx, ply, plw, plh] = L.platforms[i];

    if (isBeyond) {
      // Semi-transparent dark fill so background shows through
      ctx.fillStyle = 'rgba(2, 10, 22, 0.72)';
      ctx.fillRect(plx, ply, plw, plh);
      // Cyan top edge
      ctx.fillStyle = 'rgba(0, 210, 210, 0.55)';
      ctx.fillRect(plx, ply, plw, 2);
      // Subtle side glow
      ctx.fillStyle = 'rgba(0, 180, 180, 0.08)';
      ctx.fillRect(plx, ply, 2, plh);
      ctx.fillRect(plx + plw - 2, ply, 2, plh);
      // Bioluminescent grass on top
      drawBeyondGrass(plx, ply, plw, i);
    } else {
      ctx.fillStyle = 'rgba(6, 11, 23, 0.88)';
      ctx.fillRect(plx, ply, plw, plh);
      ctx.fillStyle = 'rgba(157, 184, 224, 0.22)';
      ctx.fillRect(plx, ply, plw, 2);
    }
  }

  // springs
  for (const [sx, sy, sw, sh] of (L.springs || [])) {
    ctx.fillStyle = isBeyond ? '#001a20' : '#15243f';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.fillStyle = isBeyond ? 'rgba(0, 230, 230, 0.8)' : 'rgba(223, 232, 245, 0.6)';
    ctx.fillRect(sx, sy, sw, 2);
    // Coil lines
    ctx.strokeStyle = isBeyond ? 'rgba(0, 200, 200, 0.5)' : 'rgba(157, 184, 224, 0.4)';
    ctx.lineWidth = 1;
    for (let j = sy + 4; j < sy + sh; j += 3) {
      ctx.beginPath(); ctx.moveTo(sx, j); ctx.lineTo(sx + sw, j); ctx.stroke();
    }
  }

  // hazards
  for (const [hx, hy, hw, hh] of (L.hazards || [])) {
    const t = performance.now() / 1000;
    const flicker = 0.5 + 0.4 * Math.sin(t * 8 + hx * 0.01);
    ctx.fillStyle = isBeyond
      ? `rgba(0, 200, 200, ${0.15 * flicker})`
      : `rgba(157, 184, 224, ${0.08 * flicker})`;
    ctx.fillRect(hx, hy - 8, hw, hh + 8);
    ctx.fillStyle = isBeyond
      ? `rgba(0, 240, 240, ${0.9 * flicker})`
      : `rgba(200, 210, 230, ${0.8 * flicker})`;
    ctx.fillRect(hx, hy, hw, hh);
  }

  // checkpoints
  for (const cp of L.checkpoints) {
    const active = game.checkpoint.x === cp.x;
    const t = performance.now() / 1000;
    const glow = 0.4 + 0.35 * Math.sin(t * 3);
    ctx.fillStyle = active
      ? (isBeyond ? `rgba(0, 230, 230, ${0.7 + 0.2 * glow})` : `rgba(157, 184, 224, 0.85)`)
      : (isBeyond ? `rgba(0, 180, 180, 0.25)` : `rgba(157, 184, 224, 0.25)`);
    ctx.fillRect(cp.x - 2, cp.y - 20, 4, 100);
    if (active && isBeyond) {
      ctx.shadowColor = 'rgba(0, 230, 230, 0.8)';
      ctx.shadowBlur = 12;
      ctx.fillRect(cp.x - 2, cp.y - 20, 4, 100);
      ctx.shadowBlur = 0;
    }
  }

  // exit door
  const t = performance.now();
  const exitPulse = 0.55 + 0.25 * Math.sin(t / 400);
  ctx.fillStyle = isBeyond
    ? `rgba(0, 230, 230, ${exitPulse})`
    : `rgba(223, 232, 245, ${exitPulse})`;
  if (isBeyond) { ctx.shadowColor = 'rgba(0, 230, 230, 0.9)'; ctx.shadowBlur = 20; }
  ctx.fillRect(L.exit.x, L.exit.y, L.exit.w, L.exit.h);
  ctx.shadowBlur = 0;

  // dust particles
  for (const p of particles) {
    ctx.save(); ctx.globalAlpha = 1 - p.t / p.life;
    ctx.fillStyle = p.isStatic
      ? (isBeyond ? 'rgba(0, 220, 220, 0.9)' : 'rgba(157, 184, 224, 0.85)')
      : '#9db8e0';
    ctx.fillRect(p.x - 2, p.y - 2, p.isStatic ? 5 : 4, p.isStatic ? 5 : 4);
    ctx.restore();
  }

  // ---------- sentinel bullets ----------
  for (const b of sentinelBullets) {
    const age = b.t / b.life;
    ctx.save();
    ctx.globalAlpha = 1 - age * 0.4;
    const bg2 = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2);
    bg2.addColorStop(0, 'rgba(0, 255, 220, 1)');
    bg2.addColorStop(0.5, 'rgba(0, 200, 180, 0.6)');
    bg2.addColorStop(1, 'rgba(0, 180, 160, 0)');
    ctx.fillStyle = bg2;
    ctx.shadowColor = 'rgba(0, 255, 220, 0.9)'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 2, 0, Math.PI * 2); ctx.fill();
    // Core
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ---------- enemies ----------
  for (const e of enemies) {
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h);
    const aggro = e.isAggro;
    const isSentinel = e.type === 'sentinel';
    const isCharger  = e.type === 'charger';

    // Aggro glow
    if (aggro) {
      let glowColor = isBeyond ? 'rgba(0, 220, 220, 0.22)' : 'rgba(235, 95, 95, 0.22)';
      if (isSentinel && e.shootWarn > 0) glowColor = 'rgba(0, 255, 150, 0.35)'; // green flash before shot
      ctx.fillStyle = glowColor;
      ctx.beginPath(); ctx.arc(0, -e.h / 2, e.h * 0.9, 0, Math.PI * 2); ctx.fill();
    }

    // Body
    ctx.fillStyle = isSentinel ? '#001418' : (isCharger ? '#140010' : (e.type === 'stalker' ? '#08040f' : '#030712'));
    ctx.fillRect(-e.w / 2, -e.h, e.w, e.h);

    // Eye
    let eyeColor = aggro
      ? (isBeyond ? 'rgba(0, 230, 230, 0.95)' : 'rgba(235, 95, 95, 0.9)')
      : 'rgba(157, 184, 224, 0.45)';
    if (isSentinel && e.shootWarn > 0) eyeColor = 'rgba(0, 255, 150, 1.0)';
    if (isCharger && e.chargeActive) eyeColor = 'rgba(255, 100, 0, 1.0)';
    ctx.fillStyle = eyeColor;
    ctx.fillRect(e.dir >= 0 ? e.w * 0.08 : -e.w * 0.32, -e.h * 0.78, 5, 5);

    // Sentinel charge indicator bar
    if (isSentinel) {
      const barW = e.w;
      const fill = 1 - Math.max(0, e.shootTimer) / 2.5;
      ctx.fillStyle = 'rgba(0, 40, 40, 0.6)';
      ctx.fillRect(-e.w / 2, -e.h - 8, barW, 3);
      ctx.fillStyle = e.shootWarn > 0 ? 'rgba(0, 255, 150, 0.9)' : 'rgba(0, 200, 200, 0.7)';
      ctx.fillRect(-e.w / 2, -e.h - 8, barW * Math.min(1, fill), 3);
    }

    ctx.restore();
  }

  // player
  if (!player.isDying) drawPlayer();
  ctx.restore();

  // ---------- screen shake restore ----------
  if (game.screenShake > 0) ctx.restore();

  // ---------- HUD ----------
  if (game.state === 'PLAY') {
    ctx.save();
    const hudX = 24, hudY = 24, barW = 180, barH = 8;
    ctx.fillStyle = 'rgba(5, 12, 22, 0.55)';
    ctx.fillRect(hudX, hudY, barW, barH);
    ctx.strokeStyle = isBeyond ? 'rgba(0, 200, 200, 0.3)' : 'rgba(157, 184, 224, 0.25)';
    ctx.strokeRect(hudX, hudY, barW, barH);
    // Health bar based on deaths (soft, no hard wipe)
    const ratio = Math.max(0, 1 - game.deaths / 10);
    ctx.fillStyle = isBeyond ? 'rgba(0, 220, 220, 0.85)' : 'rgba(157, 184, 224, 0.85)';
    if (isBeyond) { ctx.shadowColor = 'rgba(0, 220, 220, 0.6)'; ctx.shadowBlur = 8; }
    ctx.fillRect(hudX, hudY, barW * ratio, barH);
    ctx.shadowBlur = 0;

    // Chapter label
    ctx.fillStyle = isBeyond ? 'rgba(0, 200, 200, 0.55)' : 'rgba(157, 184, 224, 0.5)';
    ctx.font = '12px Georgia, serif'; ctx.textAlign = 'left';
    ctx.fillText(`${L.subtitle} — ${L.name}`, hudX, H - 16);
    ctx.restore();
  }

  // color grade
  if (mood.grade) { ctx.fillStyle = mood.grade; ctx.fillRect(0, 0, W, H); }
  if (mood.darken) { ctx.fillStyle = `rgba(4, 6, 14, ${mood.darken})`; ctx.fillRect(0, 0, W, H); }
  if (isBeyond && !isFinale) {
    ctx.fillStyle = 'rgba(0, 8, 18, 0.12)'; ctx.fillRect(0, 0, W, H);
  }

  // fade
  if (game.state === 'FADE' || game.fade > 0) {
    ctx.fillStyle = `rgba(5, 9, 15, ${game.fade})`; ctx.fillRect(0, 0, W, H);
  }
}

function renderStory() {
  ctx.save(); ctx.fillStyle = '#05090f'; ctx.fillRect(0, 0, W, H);
  if (cardImagesOk[game.levelIndex]) {
    ctx.save(); ctx.globalAlpha = 0.22;
    const img = cardImages[game.levelIndex];
    const s = Math.max(W / img.width, H / img.height);
    ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
    ctx.restore();
  }
  const L = game.level; ctx.textAlign = 'center';
  const isBeyond = L.mood && L.mood.isBeyond;
  ctx.fillStyle = isBeyond ? 'rgba(0, 200, 200, 0.7)' : '#9db8e0';
  ctx.font = '14px Georgia, serif'; ctx.fillText(L.subtitle, W / 2, H * 0.32);
  ctx.fillStyle = '#dfe8f5'; ctx.font = '34px Georgia, serif'; ctx.fillText(L.name, W / 2, H * 0.32 + 44);
  ctx.font = '16px Georgia, serif'; ctx.fillStyle = 'rgba(223,232,245,0.85)';
  for (let i = 0; i < game.storyLine; i++) ctx.fillText(L.story[i], W / 2, H * 0.5 + i * 30);
  if (game.storyLine >= L.story.length) {
    ctx.fillStyle = `rgba(157,184,224,${0.4 + 0.3 * Math.sin(performance.now() / 500)})`;
    ctx.font = '13px Georgia, serif'; ctx.fillText('press any key', W / 2, H * 0.78);
  }
  ctx.restore();
}

function renderEnd() {
  ctx.fillStyle = 'rgba(5, 9, 15, 0.94)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#dfe8f5'; ctx.font = '30px Georgia, serif';
  ctx.fillText('HE CROSSED INTO THE BEYOND', W / 2, H * 0.38);
  ctx.fillStyle = 'rgba(223,232,245,0.75)'; ctx.font = '15px Georgia, serif';
  ctx.fillText(
    game.deaths === 0 ? 'He fell zero times. He suspects this means nothing.' : `He fell ${game.deaths} time${game.deaths === 1 ? '' : 's'}. He kept the suit clean anyway.`,
    W / 2, H * 0.38 + 40
  );
  ctx.fillStyle = 'rgba(157,184,224,0.4)'; ctx.font = '11px Georgia, serif';
  ctx.fillText('BRUDER MOTION', W / 2, H * 0.55);
  ctx.fillStyle = `rgba(223,232,245,${0.45 + 0.3 * Math.sin(performance.now() / 500)})`;
  ctx.font = '13px Georgia, serif'; ctx.fillText('press any key to run again', W / 2, H * 0.72);
}

// ---------- main loop ----------
let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now; update(dt); render();
  requestAnimationFrame(loop);
}
setupSaveMenu(); requestAnimationFrame(loop);
