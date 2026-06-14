// ============================================================
// MIND IN MOTION — game.js (Polished Atmospheric Release Engine)
// States: MENU -> INTRO -> STORY -> PLAY -> FADE -> next STORY
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

// ---------- background layers ----------
const bg = {
  sky: new Image(), hills: new Image(), mono: new Image(),
  ruins: new Image(), debris: new Image(), occl: new Image(), shard: new Image(),
  skyOk: false, hillsOk: false, monoOk: false,
  ruinsOk: false, debrisOk: false, occlOk: false, shardOk: false
};
bg.sky.src = 'bg_sky.jpg';         bg.sky.onload = () => bg.skyOk = true;
bg.hills.src = 'bg_hills.png';     bg.hills.onload = () => bg.hillsOk = true;
bg.mono.src = 'bg_monoliths.png';  bg.mono.onload = () => bg.monoOk = true;
bg.ruins.src = 'bg_ruins.png';     bg.ruins.onload = () => bg.ruinsOk = true;
bg.debris.src = 'bg_debris.png';   bg.debris.onload = () => bg.debrisOk = true;
bg.occl.src = 'bg_occl_thin.png';   bg.occl.onload = () => bg.occlOk = true;
bg.shard.src = 'bg_occl_shard.png'; bg.shard.onload = () => bg.shardOk = true;

// ---------- chapter VII beyond world backgrounds ----------
const bgCh7 = {
  sky: new Image(), hills: new Image(), mono: new Image(), ruins: new Image(),
  skyOk: false, hillsOk: false, monoOk: false, ruinsOk: false
};
bgCh7.sky.src   = 'bg_sky_ch7.jpg';   bgCh7.sky.onload   = () => bgCh7.skyOk   = true;
bgCh7.hills.src = 'bg_hills_ch7.png'; bgCh7.hills.onload = () => bgCh7.hillsOk = true;
bgCh7.mono.src  = 'bg_mono_ch7.png';  bgCh7.mono.onload  = () => bgCh7.monoOk  = true;
bgCh7.ruins.src = 'bg_ruins_ch7.png'; bgCh7.ruins.onload = () => bgCh7.ruinsOk = true;

// ---------- chapter illustration preloader ----------
const cardImages = [];
const cardImagesOk = Array(7).fill(false);
for (let i = 0; i < 7; i++) {
  cardImages[i] = new Image();
  cardImages[i].src = `chapter_${i}.jpg`;
  cardImages[i].onload = () => { cardImagesOk[i] = true; };
}

// ---------- mechanics matrix ----------
const PHYS = {
  gravity: 2150, moveAccel: 3000, airAccel: 2700, friction: 2200,
  maxSpeed: 470, jumpVel: -930, jumpCut: 0.45,
  coyoteTime: 0.12, jumpBuffer: 0.15, maxFall: 1100
};

// ---------- global state architecture ----------
const game = {
  state: 'MENU',          
  levelIndex: 0,
  level: null,
  checkpoint: null,
  fade: 0,
  storyLine: 0,
  storyTimer: 0,
  deaths: 0,
  audioDamp: 1.0,
  bloom: 0.0,             
  targetBloom: 0.0,       
  phaseTimer: 0.0         
};

const player = {
  x: 0, y: 0, vx: 0, vy: 0, w: 34, h: 80,
  dir: 1, grounded: false, coyote: 0, buffer: 0,
  animTime: 0, frame: SHEET.idle,
  jumpsLeft: 2,        
  stepTimer: 0,
  isDying: false,
  deathTimer: 0,
  squashX: 1,
  squashY: 1
};

const cam = { x: 0, y: 0, zoom: 1.0, targetZoom: 1.0 };
const particles = [];
const ambientParticles = [];
const enemies = [];

// ---------- asteroid system (chapters 1-6, dimension collapse) ----------
const asteroids = [];
const ASTEROID_CONFIG = [
  { density: 0.4, speedMin: 180, speedMax: 260, sizeMin: 2, sizeMax: 4,  alpha: 0.25 }, 
  { density: 0.7, speedMin: 200, speedMax: 300, sizeMin: 2, sizeMax: 5,  alpha: 0.35 }, 
  { density: 1.2, speedMin: 240, speedMax: 360, sizeMin: 3, sizeMax: 6,  alpha: 0.45 }, 
  { density: 1.8, speedMin: 280, speedMax: 420, sizeMin: 3, sizeMax: 8,  alpha: 0.55 }, 
  { density: 0.5, speedMin: 160, speedMax: 240, sizeMin: 2, sizeMax: 4,  alpha: 0.20 }, 
  { density: 2.8, speedMin: 340, speedMax: 520, sizeMin: 4, sizeMax: 10, alpha: 0.70 }, 
];

function spawnAsteroid() {
  if (game.levelIndex >= 6) return; 
  const cfg = ASTEROID_CONFIG[game.levelIndex];
  const speed = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);
  const size  = cfg.sizeMin  + Math.random() * (cfg.sizeMax  - cfg.sizeMin);
  const angle = (0.45 + Math.random() * 0.25); 
  asteroids.push({
    x: Math.random() * W * 1.4,
    y: -20 - Math.random() * 80,
    vx: -Math.cos(angle) * speed * (0.4 + Math.random() * 0.3),
    vy:  Math.sin(angle) * speed,
    size,
    alpha: cfg.alpha * (0.6 + Math.random() * 0.4),
    trail: [],
    dead: false
  });
}

let asteroidSpawnTimer = 0;

// ---------- programmatic web audio system ----------
const audioChannels = {
  ctx: null,
  nature: new Audio('nature.mp3'),
  music: new Audio('https://res.cloudinary.com/dcjst7sod/video/upload/v1781299773/Background_music_of_gameplay_uutorc.mp3'),
  // Dedicated channels array for your brand new main menu theme destination
  menuMusic: new Audio('https://res.cloudinary.com/dcjst7sod/video/upload/v1781467127/Main_Menu_Audio_ovq3r9.mp3'),
  initialized: false,
  muted: false
};

function startAudio() {
  if (audioChannels.initialized) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  audioChannels.ctx = new AudioCtx();

  audioChannels.nature.loop = true;
  audioChannels.nature.volume = 0.55; 
  audioChannels.nature.play().catch(() => {});

  audioChannels.music.loop = true;
  audioChannels.music.volume = 0.0;
  audioChannels.music.play().catch(() => {});

  audioChannels.menuMusic.loop = true;
  audioChannels.menuMusic.volume = 0.0;
  audioChannels.menuMusic.play().catch(() => {});

  audioChannels.initialized = true;
}

function synthSFX(type) {
  if (!audioChannels.initialized || audioChannels.muted || !audioChannels.ctx) return;
  const ctxNode = audioChannels.ctx;
  const now = ctxNode.currentTime;

  if (type === 'jump') {
    const osc = ctxNode.createOscillator();
    const gain = ctxNode.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
    gain.gain.setValueAtTime(0.25, now); 
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain); gain.connect(ctxNode.destination);
    osc.start(now); osc.stop(now + 0.41);
  }
  if (type === 'step') {
    const osc = ctxNode.createOscillator();
    const gain = ctxNode.createGain();
    const filter = ctxNode.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(75, now);
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(120, now);
    gain.gain.setValueAtTime(0.15, now); 
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(filter); filter.connect(gain); gain.connect(ctxNode.destination);
    osc.start(now); osc.stop(now + 0.09);
  }
  if (type === 'spring') {
    const osc1 = ctxNode.createOscillator();
    const osc2 = ctxNode.createOscillator();
    const gain = ctxNode.createGain();
    osc1.type = 'sine'; osc1.frequency.setValueAtTime(180, now);
    osc1.frequency.exponentialRampToValueAtTime(650, now + 0.3);
    osc2.type = 'triangle'; osc2.frequency.setValueAtTime(220, now);
    osc2.frequency.exponentialRampToValueAtTime(880, now + 0.25);
    gain.gain.setValueAtTime(0.35, now); 
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain); osc2.connect(gain); gain.connect(ctxNode.destination);
    osc1.start(now); osc2.start(now); osc1.stop(now + 0.6); osc2.stop(now + 0.6);
  }
  if (type === 'checkpoint') {
    const osc1 = ctxNode.createOscillator();
    const osc2 = ctxNode.createOscillator();
    const gain = ctxNode.createGain();
    osc1.type = 'sine'; osc1.frequency.setValueAtTime(580, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.2);
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(700, now);
    osc2.frequency.exponentialRampToValueAtTime(1150, now + 0.35);
    gain.gain.setValueAtTime(0.25, now); 
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain); osc2.connect(gain); gain.connect(ctxNode.destination);
    osc1.start(now); osc2.start(now); osc1.stop(now + 0.5); osc2.stop(now + 0.5);
  }
}

function updateAudioMixing(dt) {
  if (!audioChannels.initialized || audioChannels.muted) return;
  
  let targetGameplay = 0.0;
  let targetMenu = 0.0;
  
  if (game.state === 'PLAY') {
    targetGameplay = (game.levelIndex === 6 && player.x > 4200) ? 0.75 : 0.55;
    targetMenu = 0.0;
  } else if (game.state === 'STORY') {
    targetGameplay = 0.25;
    targetMenu = 0.0;
  } else if (game.state === 'MENU' || game.state === 'PAUSE') {
    targetGameplay = 0.0;
    targetMenu = 0.65; // Boosted baseline mix for menu screen
  }

  const fadeSpeed = 0.5;
  
  // Interpolates tracking mixing matrix volumes smoothly
  let gVol = audioChannels.music.volume;
  if (gVol < targetGameplay) gVol = Math.min(targetGameplay, gVol + fadeSpeed * dt);
  else if (gVol > targetGameplay) gVol = Math.max(targetGameplay, gVol - fadeSpeed * dt);
  
  let mVol = audioChannels.menuMusic.volume;
  if (mVol < targetMenu) mVol = Math.min(targetMenu, mVol + fadeSpeed * dt);
  else if (mVol > targetMenu) mVol = Math.max(targetMenu, mVol - fadeSpeed * dt);

  if (game.audioDamp < 1.0) game.audioDamp = Math.min(1.0, game.audioDamp + 1.8 * dt);
  
  audioChannels.music.volume = gVol * game.audioDamp;
  audioChannels.menuMusic.volume = mVol * game.audioDamp;
}

function toggleMute() {
  audioChannels.muted = !audioChannels.muted;
  const masterSwitch = audioChannels.muted ? 0 : 1;
  audioChannels.nature.volume = 0.35 * masterSwitch;
  audioChannels.music.volume = (game.state === 'PLAY' ? 0.55 : 0.0) * masterSwitch;
  audioChannels.menuMusic.volume = ((game.state === 'MENU' || game.state === 'PAUSE') ? 0.65 : 0.0) * masterSwitch;
}

// ---------- interactive menu select & cache save system ----------
const gatekeeper = document.getElementById('gatekeeper');
const videoElement = document.getElementById('intro-video');
const menuVideoBg = document.getElementById('menu-video-bg');
const introContainer = document.getElementById('intro-container');
const newJourneyBtn = document.getElementById('menu-new-btn');
const continueBtn = document.getElementById('menu-cont-btn');
const quitBtn = document.getElementById('menu-quit-btn');
const levelSelectPanel = document.getElementById('level-select-panel');
const nodesContainer = document.getElementById('nodes-container');
const menuTitleText = document.getElementById('menu-title-text');
const menuSubtitleText = document.getElementById('menu-subtitle-text');

const RomanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];

// Throttled frame pipeline synchronization listener to avoid lag on 8GB machines
let videoFrameAvailable = false;
if (menuVideoBg) {
  const forceLoopVideo = () => {
    menuVideoBg.currentTime = 0;
    menuVideoBg.play().catch(() => {});
  };
  menuVideoBg.addEventListener('ended', forceLoopVideo);
  menuVideoBg.addEventListener('play', () => { videoFrameAvailable = true; });
  menuVideoBg.addEventListener('loadeddata', () => { videoFrameAvailable = true; });
  
  window.addEventListener('focus', () => {
    if (game.state === 'MENU' || game.state === 'PAUSE') {
      menuVideoBg.play().catch(() => {});
    }
  });
}

function setupSaveMenu() {
  const highestUnlocked = parseInt(localStorage.getItem('mim_unlocked_stage') || "0");
  const lastSavedLevel = parseInt(localStorage.getItem('mim_saved_stage') || "0");

  if (game.state === 'PAUSE') {
    menuTitleText.innerText = "GAME PAUSED";
    menuSubtitleText.innerText = `${LEVELS[game.levelIndex].subtitle} — ${LEVELS[game.levelIndex].name}`;
    newJourneyBtn.innerText = "RESTART LEVEL";
    continueBtn.innerText = "RESUME GAME";
    continueBtn.style.display = "block";
    quitBtn.style.display = "block";
    levelSelectPanel.style.opacity = "0";
    levelSelectPanel.style.pointerEvents = "none";
  } else {
    menuTitleText.innerText = "MIND IN MOTION";
    menuSubtitleText.innerText = "An Atmospheric Odyssey";
    newJourneyBtn.innerText = "NEW JOURNEY";
    quitBtn.style.display = "none";
    levelSelectPanel.style.pointerEvents = "auto";
    
    if (lastSavedLevel > 0) {
      continueBtn.innerText = "CONTINUE";
      continueBtn.style.display = "block";
    } else {
      continueBtn.style.display = "none";
    }

    if (highestUnlocked > 0) {
      levelSelectPanel.style.opacity = "1";
      nodesContainer.innerHTML = "";
      for (let i = 0; i <= Math.min(highestUnlocked, 6); i++) {
        if (i >= LEVELS.length) break;
        const btn = document.createElement('button');
        btn.className = "node-btn";
        btn.innerHTML = RomanNumerals[i];
        btn.addEventListener('click', () => bootIntoSystem(i, false));
        nodesContainer.appendChild(btn);
      }
    } else {
      levelSelectPanel.style.opacity = "0";
    }
  }
}

newJourneyBtn.addEventListener('click', () => {
  if (game.state === 'PAUSE') {
    gatekeeper.classList.add('hidden');
    loadLevel(game.levelIndex);
  } else {
    bootIntoSystem(0, true);
  }
});

continueBtn.addEventListener('click', () => {
  if (game.state === 'PAUSE') {
    gatekeeper.classList.add('hidden');
    game.state = 'PLAY';
  } else {
    const lastSavedLevel = parseInt(localStorage.getItem('mim_saved_stage') || "0");
    bootIntoSystem(lastSavedLevel, false);
  }
});

quitBtn.addEventListener('click', () => {
  game.state = 'MENU';
  setupSaveMenu();
});

function bootIntoSystem(targetIndex, playIntroVideo) {
  gatekeeper.classList.add('hidden');
  startAudio();

  if (playIntroVideo && videoElement && introContainer) {
    game.state = 'INTRO';
    introContainer.classList.add('active');
    videoElement.play().catch(e => {
      videoElement.muted = true;
      videoElement.play().catch(err => console.log(err));
    });
  } else {
    if (introContainer) introContainer.classList.remove('active');
    loadLevel(targetIndex);
  }
}

if (videoElement) {
  videoElement.addEventListener('ended', () => {
    if (introContainer) introContainer.style.opacity = '0';
    setTimeout(() => {
      if (introContainer) introContainer.remove();
      loadLevel(0);
    }, 1200);
  });
}

function skipVideo() {
  if (game.state === 'INTRO') {
    if (introContainer) introContainer.style.opacity = '0';
    setTimeout(() => {
      if (introContainer) introContainer.remove();
      loadLevel(0);
    }, 1200);
  }
}

function initLevelEnemies() {
  enemies.length = 0;
  const L = game.level;
  if (!L || !L.enemies) return;
  for (const e of L.enemies) {
    enemies.push({ ...e });
  }
}

function initAmbientParticles() {
  ambientParticles.length = 0;
  for (let i = 0; i < 40; i++) {
    ambientParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 1 + Math.random() * 2,
      speedX: -10 - Math.random() * 20,
      speedY: -4 - Math.random() * 12,
      alpha: 0.1 + Math.random() * 0.4
    });
  }
}

function loadLevel(i) {
  game.levelIndex = i;
  game.level = LEVELS[i];
  game.checkpoint = { ...game.level.spawn };
  game.state = 'STORY';
  game.storyLine = 0;
  game.storyTimer = 0;
  game.fade = 0;
  game.bloom = 0.0;       
  game.targetBloom = 0.0;
  game.phaseTimer = 0.0;

  localStorage.setItem('mim_saved_stage', i);
  const reachedMax = Math.max(parseInt(localStorage.getItem('mim_unlocked_stage') || "0"), i);
  localStorage.setItem('mim_unlocked_stage', reachedMax);

  initAmbientParticles();
  initLevelEnemies();
  respawn();
}

function respawn() {
  player.isDying = false;
  player.x = game.checkpoint.x;
  player.y = game.checkpoint.y;
  player.vx = 0; player.vy = 0;
  player.jumpsLeft = 2; 
  cam.x = player.x; cam.y = player.y;
  cam.zoom = 1.0; cam.targetZoom = 1.0;
  initLevelEnemies(); 

  keys.left = false;
  keys.right = false;
  jumpHeld = false;
  player.buffer = 0;
}

function triggerDeath() {
  if (player.isDying) return;
  player.isDying = true;
  player.deathTimer = 0.75; 
  game.deaths++;
  game.audioDamp = 0.15;
  
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: player.x + Math.random() * player.w,
      y: player.y + Math.random() * player.h,
      vx: (Math.random() - 0.5) * 220,
      vy: (Math.random() - 0.6) * 190,
      life: 0.4 + Math.random() * 0.3,
      t: 0,
      isStatic: true
    });
  }
}

const keys = { left: false, right: false };
let jumpHeld = false;

function anyKeyAdvance() {
  if (game.state === 'INTRO') { skipVideo(); return true; }
  if (game.state === 'END') { game.deaths = 0; loadLevel(0); return true; }
  if (game.state === 'STORY') {
    if (game.storyLine < game.level.story.length) {
      game.storyLine = game.level.story.length;
    } else {
      game.state = 'PLAY';
      keys.left = false;
      keys.right = false;
      jumpHeld = false;
      player.buffer = 0;
    }
    return true;
  }
  return false;
}

function setKey(code, down) {
  if (!down) {
    if (code === 'ArrowLeft' || code === 'KeyA') keys.left = false;
    if (code === 'ArrowRight' || code === 'KeyD') keys.right = false;
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') jumpHeld = false;
    return;
  }

  if ((code === 'Escape' || code === 'KeyP') && (game.state === 'PLAY' || game.state === 'PAUSE')) {
    if (game.state === 'PLAY') {
      game.state = 'PAUSE';
      setupSaveMenu();
      gatekeeper.classList.remove('hidden');
    } else {
      game.state = 'PLAY';
      gatekeeper.classList.add('hidden');
    }
    return;
  }

  if (game.state === 'MENU' || game.state === 'PAUSE' || player.isDying) return;
  if (anyKeyAdvance()) return;
  if (code === 'KeyM') { toggleMute(); return; }

  if (code === 'ArrowLeft' || code === 'KeyA') keys.left = true;
  if (code === 'ArrowRight' || code === 'KeyD') keys.right = true;
  if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
    if (!jumpHeld) player.buffer = PHYS.jumpBuffer;
    jumpHeld = true;
  }
  if (code === 'KeyR' && game.state === 'PLAY') { triggerDeath(); }
}

window.addEventListener('keydown', e => { setKey(e.code, true); e.preventDefault(); });
window.addEventListener('keyup',   e => setKey(e.code, false));

function bindBtn(id, code) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('touchstart', e => { setKey(code, true); e.preventDefault(); }, { passive: false });
  el.addEventListener('touchend',   e => { setKey(code, false); e.preventDefault(); }, { passive: false });
}
bindBtn('btnL', 'ArrowLeft'); bindBtn('btnR', 'ArrowRight'); bindBtn('btnJ', 'Space');
canvas.addEventListener('touchstart', () => anyKeyAdvance());
if (introContainer) {
  introContainer.addEventListener('touchstart', () => anyKeyAdvance());
}

function dust(x, y, n, spread = 160) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * spread,
      vy: -Math.random() * 90,
      life: 0.4 + Math.random() * 0.3, t: 0,
      isStatic: false
    });
  }
}

function overlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function update(dt) {
  updateAudioMixing(dt);
  if (game.state === 'MENU' || game.state === 'INTRO' || game.state === 'PAUSE') return;
  if (game.state === 'STORY') {
    game.storyTimer += dt;
    const due = Math.floor(game.storyTimer / 1.4);
    game.storyLine = Math.min(Math.max(game.storyLine, due), game.level.story.length);
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

  if (game.levelIndex < 6) {
    const cfg = ASTEROID_CONFIG[game.levelIndex];
    asteroidSpawnTimer += dt;
    const spawnInterval = 1.2 / cfg.density;
    if (asteroidSpawnTimer > spawnInterval) {
      spawnAsteroid();
      asteroidSpawnTimer = 0;
    }
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const a = asteroids[i];
      a.trail.push({ x: a.x, y: a.y });
      if (a.trail.length > 18) a.trail.shift();
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      if (a.y > H + 60 || a.x < -200) { asteroids.splice(i, 1); }
    }
  } else {
    asteroids.length = 0;
  }

  const L = game.level;

  for (const [sx, sy, sw, sh, spower] of (L.springs || [])) {
    if (overlap(player.x, player.y, player.w, player.h, sx, sy, sw, sh)) {
      player.vy = -spower; player.grounded = false; player.jumpsLeft = 2; 
      synthSFX('spring'); dust(player.x + player.w / 2, player.y + player.h, 24, 280);
      player.squashX = 0.75; player.squashY = 1.35;
    }
  }

  for (let e of enemies) {
    if (e.type === 'stalker') {
      const xDist = player.x - e.x;
      const yDist = Math.abs(player.y - e.y);
      if (Math.abs(xDist) < 550 && yDist < 160) {
        e.dir = Math.sign(xDist); e.x += e.speed * 1.8 * e.dir * dt; e.isAggro = true;
      } else {
        e.isAggro = false; e.x += e.speed * e.dir * dt;
        if (e.x < e.minX) { e.x = e.minX; e.dir = 1; }
        if (e.x > e.maxX) { e.x = e.maxX; e.dir = -1; }
      }
    } else {
      e.x += e.speed * e.dir * dt;
      if (e.x < e.minX) { e.x = e.minX; e.dir = 1; }
      if (e.x > e.maxX) { e.x = e.maxX; e.dir = -1; }
    }
    if (overlap(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
      triggerDeath(); return;
    }
  }

  const accel = player.grounded ? PHYS.moveAccel : PHYS.airAccel;
  let move = 0;
  if (keys.left) move -= 1;
  if (keys.right) move += 1;

  if (move !== 0) {
    player.vx += move * accel * dt; player.dir = move;
  } else if (player.grounded) {
    const f = PHYS.friction * dt;
    if (Math.abs(player.vx) <= f) player.vx = 0; else player.vx -= Math.sign(player.vx) * f;
  }
  player.vx = Math.max(-PHYS.maxSpeed, Math.min(PHYS.maxSpeed, player.vx));
  player.vy = Math.min(player.vy + PHYS.gravity * dt, PHYS.maxFall);

  player.coyote = Math.max(0, player.coyote - dt);
  player.buffer = Math.max(0, player.buffer - dt);

  if (player.buffer > 0) {
    if (player.grounded || player.coyote > 0) {
      player.vy = PHYS.jumpVel; player.grounded = false; player.coyote = 0; player.buffer = 0; player.jumpsLeft = 1; 
      synthSFX('jump'); dust(player.x + player.w / 2, player.y + player.h, 8);
      player.squashX = 0.82; player.squashY = 1.25;
    } else if (player.jumpsLeft > 0) {
      player.vy = PHYS.jumpVel * 0.95; player.buffer = 0; player.jumpsLeft = 0; 
      synthSFX('jump'); dust(player.x + player.w / 2, player.y + player.h / 2, 14, 220);
      player.squashX = 0.85; player.squashY = 1.20;
    }
  }
  
  if (!jumpHeld && player.vy < 0) {
    player.vy *= 1 - (1 - PHYS.jumpCut) * Math.min(1, dt * 14);
  }

  const wasGrounded = player.grounded;
  const preCollisionVy = player.vy; 
  player.grounded = false;

  player.x += player.vx * dt;
  for (let i = 0; i < L.platforms.length; i++) {
    const [px, py, pw, ph] = L.platforms[i];
    const isPhasing = (game.levelIndex === 2 || game.levelIndex === 3 || game.levelIndex === 5) && (i % 2 === 1) && pw <= 400 && ph <= 60;
    if (isPhasing && (game.phaseTimer % 4 >= 2.5)) continue; 

    if (overlap(player.x, player.y, player.w, player.h, px, py, pw, ph)) {
      if (player.vx > 0) player.x = px - player.w; else if (player.vx < 0) player.x = px + pw;
      player.vx = 0;
    }
  }

  player.y += player.vy * dt;
  for (let i = 0; i < L.platforms.length; i++) {
    const [px, py, pw, ph] = L.platforms[i];
    const isPhasing = (game.levelIndex === 2 || game.levelIndex === 3 || game.levelIndex === 5) && (i % 2 === 1) && pw <= 400 && ph <= 60;
    if (isPhasing && (game.phaseTimer % 4 >= 2.5)) continue;

    if (overlap(player.x, player.y, player.w, player.h, px, py, pw, ph)) {
      if (player.vy > 0) {
        player.y = py - player.h; player.grounded = true; player.jumpsLeft = 2; 
        
        if (!wasGrounded && preCollisionVy > 450) { 
          dust(player.x + player.w / 2, player.y + player.h, 10);
          const landingForce = Math.min(1.4, 1.0 + (preCollisionVy - 450) * 0.0007);
          player.squashX = landingForce;
          player.squashY = 2.0 - landingForce; 
        }
        player.vy = 0;
      } else if (player.vy < 0) {
        player.y = py + ph; player.vy = 0;
      }
    }
  }
  if (player.grounded) player.coyote = PHYS.coyoteTime;

  for (const cp of L.checkpoints) {
    if (Math.abs(player.x - cp.x) < 30 && Math.abs(player.y - cp.y) < 90 && game.checkpoint.x !== cp.x) {
      game.checkpoint = { ...cp }; 
      dust(cp.x, cp.y + 80, 14, 80);
      synthSFX('checkpoint');
    }
  }

  for (const [hx, hy, hw, hh] of (L.hazards || [])) {
    if (overlap(player.x, player.y, player.w, player.h, hx, hy - 6, hw, hh + 6)) {
      triggerDeath(); return;
    }
  }

  if (overlap(player.x, player.y, player.w, player.h, L.exit.x, L.exit.y, L.exit.w, L.exit.h)) game.state = 'FADE';
  if (player.y > L.bottom) { triggerDeath(); return; }

  const speed = Math.abs(player.vx);
  if (player.grounded && speed > 30) {
    player.stepTimer += dt * (speed / PHYS.maxSpeed);
    if (player.stepTimer > 0.34) { synthSFX('step'); player.stepTimer = 0; }
  }

  if (!player.grounded) {
    player.frame = player.vy < 0 ? SHEET.jump : SHEET.fall;
  } else if (speed > 20) {
    player.animTime += dt * (8 + 6 * speed / PHYS.maxSpeed);
    player.frame = Math.floor(player.animTime) % SHEET.runFrames;
  } else {
    player.frame = SHEET.idle; player.animTime = 0;
  }

  if (game.levelIndex === 0 && player.x > 4000 && player.x < 5100) cam.targetZoom = 0.55; 
  else if (game.levelIndex === 3 || game.levelIndex === 5) cam.targetZoom = 0.50; 
  else if (game.levelIndex === 6 && player.x > 4000) cam.targetZoom = 0.45;
  else cam.targetZoom = 0.85;
  
  cam.zoom += (cam.targetZoom - cam.zoom) * Math.min(1, dt * 2.5);

  const look = player.dir * 70;
  cam.x += ((player.x + player.w / 2 + look) - cam.x) * Math.min(1, dt * 4);
  cam.y += ((player.y + player.h / 2 - 20) - cam.y) * Math.min(1, dt * 3);
  cam.x = Math.max((W / 2) / cam.zoom, Math.min(L.width - (W / 2) / cam.zoom, cam.x));
  cam.y = Math.min(L.bottom - (H / 2) / cam.zoom + 100, cam.y);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.t += dt;
    if (p.t > p.life) { particles.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; 
    if (!p.isStatic) p.vy += 300 * dt; 
  }

  for (let p of ambientParticles) {
    const beatVelocityFactor = 1.0 + 0.5 * Math.abs(Math.sin(performance.now() / 380));
    p.x += p.speedX * beatVelocityFactor * dt; p.y += p.speedY * dt;
    if (p.x < -20) p.x = W + 20; if (p.y < -20) p.y = H + 20;
  }
}

function render() {
  // Canvas-driven hardware optimization logic draws menu frames smoothly on 8GB tabs
  if (game.state === 'MENU' || game.state === 'PAUSE') {
    ctx.fillStyle = '#05090f';
    ctx.fillRect(0, 0, W, H);
    if (videoFrameAvailable && menuVideoBg) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      const vWidth = menuVideoBg.videoWidth || W;
      const vHeight = menuVideoBg.videoHeight || H;
      const scale = Math.max(W / vWidth, H / vHeight);
      const xOff = (W - vWidth * scale) / 2;
      const yOff = (H - vHeight * scale) / 2;
      ctx.drawImage(menuVideoBg, xOff, yOff, vWidth * scale, vHeight * scale);
      ctx.restore();
    }
    return; 
  }

  if (game.state === 'INTRO') return;
  if (game.state === 'STORY') { renderStory(); return; }
  if (game.state === 'END') { renderEnd(); return; }

  const isBeyond = game.levelIndex === 6;

  if (isBeyond) {
    if (bgCh7.skyOk) {
      const s = Math.max(W / bgCh7.sky.width, H / bgCh7.sky.height);
      ctx.drawImage(bgCh7.sky, (W - bgCh7.sky.width * s) / 2, (H - bgCh7.sky.height * s) / 2, bgCh7.sky.width * s, bgCh7.sky.height * s);
    } else {
      ctx.fillStyle = '#020d14'; ctx.fillRect(0, 0, W, H);
    }
  } else {
    if (bg.skyOk) {
      const s = Math.max(W / bg.sky.width, H / bg.sky.height);
      ctx.drawImage(bg.sky, (W - bg.sky.width * s) / 2, (H - bg.sky.height * s) / 2, bg.sky.width * s, bg.sky.height * s);
    } else {
      ctx.fillStyle = '#0a1228'; ctx.fillRect(0, 0, W, H);
    }
  }

  const mood = game.level.mood || { veil: [105,125,148], grade: null, darken: 0 };
  const [vr, vg, vb] = mood.veil;

  if (isBeyond) {
    layer(bgCh7.hills, bgCh7.hillsOk, 0.15, 0.62, 1.0);
    ctx.fillStyle = `rgba(0, 160, 160, 0.12)`; ctx.fillRect(0, 0, W, H);
    layer(bgCh7.mono,  bgCh7.monoOk,  0.35, 0.72, 1.0);
    ctx.fillStyle = `rgba(0, 140, 150, 0.08)`; ctx.fillRect(0, 0, W, H);
    layer(bgCh7.ruins, bgCh7.ruinsOk, 0.55, 0.52, 1.0);
    ctx.fillStyle = `rgba(0, 100, 120, 0.05)`; ctx.fillRect(0, 0, W, H);
  } else {
    layer(bg.hills, bg.hillsOk, 0.15, 0.60, 1.0);
    ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.25)`; ctx.fillRect(0, 0, W, H);
    layer(bg.mono, bg.monoOk, 0.35, 0.70, 1.0);
    ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.15)`; ctx.fillRect(0, 0, W, H);
    layer(bg.ruins, bg.ruinsOk, 0.55, 0.50, 1.0);
    ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.06)`; ctx.fillRect(0, 0, W, H);
  }

  fogDrift();
  lightShafts();

  layer(bg.shard, bg.shardOk, 0.75, 0.95, 2.8);
  layer(bg.occl,  bg.occlOk,  0.85, 1.05, 2.2);
  layer(bg.debris, bg.debrisOk, 1.25, 0.35, 1.5);

  if (asteroids.length > 0) {
    ctx.save();
    for (const a of asteroids) {
      if (a.trail.length < 2) continue;
      for (let t = 0; t < a.trail.length - 1; t++) {
        const frac = t / a.trail.length;
        ctx.beginPath();
        ctx.moveTo(a.trail[t].x, a.trail[t].y);
        ctx.lineTo(a.trail[t + 1].x, a.trail[t + 1].y);
        ctx.strokeStyle = `rgba(255, ${140 + Math.floor(frac * 80)}, 40, ${a.alpha * frac * 0.7})`;
        ctx.lineWidth = a.size * frac * 0.9;
        ctx.stroke();
      }
      const grd = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.size * 2.5);
      grd.addColorStop(0, `rgba(255, 240, 180, ${a.alpha})`);
      grd.addColorStop(0.4, `rgba(255, 140, 30, ${a.alpha * 0.7})`);
      grd.addColorStop(1, `rgba(255, 80, 0, 0)`);
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.save();
  const pulseScale = 1.0 + 0.4 * Math.abs(Math.sin(performance.now() / 380));
  for (let p of ambientParticles) {
    if (game.bloom < 1.0) {
      ctx.fillStyle = `rgba(140, 155, 180, ${p.alpha * 0.4})`;
    } else {
      ctx.fillStyle = `rgba(223, 232, 245, ${p.alpha})`;
    }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * pulseScale, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.x, -cam.y);

  if (game.levelIndex === 6) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 8, 18, 0.88)';
    ctx.shadowColor = 'rgba(0, 210, 210, 0.18)';
    ctx.shadowBlur = 80;
    
    ctx.beginPath();
    ctx.arc(6200, -30, 240, 0, Math.PI * 2);
    ctx.arc(6380, 10, 210, 0, Math.PI * 2);
    ctx.arc(6040, 30, 180, 0, Math.PI * 2);
    ctx.arc(6220, 150, 150, 0, Math.PI * 2); 
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(6150, 150);
    ctx.quadraticCurveTo(6130, 290, 6000, 380);
    ctx.lineTo(6300, 380);
    ctx.quadraticCurveTo(6220, 270, 6250, 150);
    ctx.fill();

    ctx.shadowColor = 'rgba(0, 230, 230, 0.35)';
    ctx.shadowBlur = 40;
    ctx.strokeStyle = 'rgba(0, 200, 200, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(6200, -30, 242, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const L = game.level;
  for (let i = 0; i < L.platforms.length; i++) {
    const [px, py, pw, ph] = L.platforms[i];
    const isPhasing = (game.levelIndex === 2 || game.levelIndex === 3 || game.levelIndex === 5) && (i % 2 === 1) && pw <= 400 && ph <= 60;
    
    ctx.save();
    if (isPhasing) {
      const cycle = game.phaseTimer % 4;
      if (cycle < 2.0) ctx.globalAlpha = 1.0;
      else if (cycle < 2.5) ctx.globalAlpha = 0.35 + 0.15 * Math.sin(performance.now() / 40); 
      else ctx.globalAlpha = 0.08; 
    }
    ctx.fillStyle = '#060b17'; ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = 'rgba(157,184,224,0.20)'; ctx.fillRect(px, py, pw, 3);
    ctx.restore();
  }

  for (const [sx, sy, sw, sh] of (L.springs || [])) {
    ctx.fillStyle = '#15243f'; ctx.fillRect(sx, sy, sw, sh);
    ctx.fillStyle = 'rgba(223, 232, 245, 0.6)'; ctx.fillRect(sx, sy, sw, 2);
  }

  for (const [hx, hy, hw, hh] of (L.hazards || [])) {
    ctx.fillStyle = '#060b17'; 
    ctx.fillRect(hx, hy - 4, hw, hh + 4);
    
    ctx.fillStyle = 'rgba(24, 38, 68, 0.4)';
    const slowScroll = (performance.now() * 0.03) % (hw - 40);
    ctx.fillRect(hx + slowScroll, hy - 2, 35, 2);
    ctx.fillRect(hx + hw - slowScroll - 35, hy + 2, 35, 2);
  }

  for (const cp of L.checkpoints) {
    const active = game.checkpoint.x === cp.x;
    ctx.fillStyle = active ? 'rgba(157,184,224,0.85)' : 'rgba(157,184,224,0.25)';
    ctx.fillRect(cp.x - 2, cp.y - 20, 4, 100);
  }

  const pulse = 0.55 + 0.25 * Math.sin(performance.now() / 400);
  ctx.fillStyle = `rgba(223,232,245,${pulse})`; ctx.fillRect(L.exit.x, L.exit.y, L.exit.w, L.exit.h);

  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = 1 - p.t / p.life; 
    if (p.isStatic) {
      ctx.fillStyle = 'rgba(157, 184, 224, 0.85)';
      ctx.fillRect(p.x - 3, p.y - 3, 5, 5);
    } else {
      ctx.fillStyle = '#9db8e0';
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.restore();
  }

  for (let e of enemies) {
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h);
    const beyondChapter = game.levelIndex === 6;
    if (e.isAggro) {
      ctx.fillStyle = beyondChapter ? 'rgba(0, 220, 220, 0.22)' : 'rgba(235, 95, 95, 0.22)';
      ctx.beginPath();
      ctx.arc(0, -e.h / 2, e.h * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = e.type === 'stalker' ? '#08040f' : '#030712';
    ctx.fillRect(-e.w / 2, -e.h, e.w, e.h);
    ctx.fillStyle = e.isAggro
      ? (beyondChapter ? 'rgba(0, 230, 230, 0.95)' : 'rgba(235, 95, 95, 0.9)')
      : 'rgba(157, 184, 224, 0.45)';
    ctx.fillRect(e.dir >= 0 ? e.w * 0.08 : -e.w * 0.32, -e.h * 0.78, 5, 5);
    ctx.restore();
  }

  if (!player.isDying) drawPlayer();
  ctx.restore();

  const gm = game.level.mood;
  if (gm && gm.grade) { ctx.fillStyle = gm.grade; ctx.fillRect(0, 0, W, H); }
  if (gm && gm.darken) { ctx.fillStyle = `rgba(4, 6, 14, ${gm.darken})`; ctx.fillRect(0, 0, W, H); }

  ctx.fillStyle = 'rgba(157,184,224,0.5)';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${game.level.subtitle} — ${game.level.name}`, 14, H - 16);

  if (game.state === 'FADE' || game.fade > 0) {
    ctx.fillStyle = `rgba(5, 9, 15, ${game.fade})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function renderStory() {
  ctx.save();
  ctx.fillStyle = '#05090f';
  ctx.fillRect(0, 0, W, H);

  if (cardImagesOk[game.levelIndex]) {
    ctx.save();
    ctx.globalAlpha = 0.22; 
    const img = cardImages[game.levelIndex];
    const s = Math.max(W / img.width, H / img.height);
    ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
    ctx.restore();
  }

  const L = game.level;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9db8e0';
  ctx.font = '14px Georgia, serif';
  ctx.fillText(L.subtitle, W / 2, H * 0.32);
  ctx.fillStyle = '#dfe8f5';
  ctx.font = '34px Georgia, serif';
  ctx.fillText(L.name, W / 2, H * 0.32 + 44);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = 'rgba(223,232,245,0.85)';
  for (let i = 0; i < game.storyLine; i++) {
    ctx.fillText(L.story[i], W / 2, H * 0.5 + i * 30);
  }
  if (game.storyLine >= L.story.length) {
    ctx.fillStyle = `rgba(157,184,224,${0.4 + 0.3 * Math.sin(performance.now() / 500)})`;
    ctx.font = '13px Georgia, serif';
    ctx.fillText('press any key', W / 2, H * 0.78);
  }
  ctx.restore();
}

function renderEnd() {
  ctx.fillStyle = 'rgba(5, 9, 15, 0.94)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#dfe8f5';
  ctx.font = '30px Georgia, serif';
  ctx.fillText('HE CROSSED INTO THE BEYOND', W / 2, H * 0.38);
  ctx.fillStyle = 'rgba(223,232,245,0.75)';
  ctx.font = '15px Georgia, serif';
  const line = game.deaths === 0
    ? 'He fell zero times. He suspects this means nothing.'
    : `He fell ${game.deaths} time${game.deaths === 1 ? '' : 's'}. He kept the suit clean anyway.`;
  ctx.fillText(line, W / 2, H * 0.38 + 40);
  
  ctx.fillStyle = 'rgba(157,184,224,0.4)';
  ctx.font = '11px Georgia, serif';
  ctx.fillText('BRUDER MOTION PORTFOLIO PIECE', W / 2, H * 0.55);

  ctx.fillStyle = `rgba(223,232,245,${0.45 + 0.3 * Math.sin(performance.now() / 500)})`;
  ctx.font = '13px Georgia, serif';
  ctx.fillText('press any key to run again', W / 2, H * 0.72);
}

function layer(img, ok, p, hFrac, gap = 1) {
  if (!ok) return;
  const lh = H * hFrac;
  const lw = img.width * (lh / img.height);
  const span = lw * gap;
  let x = -((cam.x * p) % span);
  if (x > 0) x -= span;
  for (; x < W; x += span) {
    ctx.drawImage(img, x, H - lh, lw, lh);
  }
}

function fogDrift() {
  const t = performance.now() / 1000;
  for (let i = 0; i < 3; i++) {
    const fx = ((t * (8 + i * 5) + i * 700) % (W + 800)) - 400;
    const fy = H * (0.45 + i * 0.16);
    const r = 260 + i * 90;
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, r);
    g.addColorStop(0, 'rgba(140, 160, 185, 0.07)');
    g.addColorStop(1, 'rgba(140, 160, 185, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(fx - r, fy - r, r * 2, r * 2);
  }
}

function lightShafts() {
  const t = performance.now() / 1000;
  ctx.save();
  for (let i = 0; i < 2; i++) {
    const baseX = W * (0.25 + i * 0.45) - (cam.x * 0.1) % W;
    const a = 0.025 + 0.02 * Math.sin(t * 0.3 + i * 2);
    ctx.fillStyle = `rgba(220, 230, 245, ${Math.max(0, a)})`;
    ctx.beginPath();
    ctx.moveTo(baseX, -20);
    ctx.lineTo(baseX + 130, -20);
    ctx.lineTo(baseX + 330, H);
    ctx.lineTo(baseX + 110, H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawPlayer() {
  const drawH = 100;
  const drawW = drawH * SHEET.cw / SHEET.ch;
  const cx = player.x + player.w / 2;
  const feetY = player.y + player.h;

  ctx.save();
  ctx.translate(cx, feetY);
  ctx.scale(player.dir * player.squashX, player.squashY);
  if (spriteReady) {
    ctx.shadowColor = 'rgba(157, 184, 224, 0.6)';
    ctx.shadowBlur = 14;
    const yOff = drawH * SHEET.feetPad / SHEET.ch;
    ctx.drawImage(sprite, player.frame * SHEET.cw, 0, SHEET.cw, SHEET.ch,
      -drawW / 2, -drawH + yOff, drawW, drawH);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#05090f';
    ctx.fillRect(-player.w / 2, -player.h, player.w, player.h);
  }
  ctx.restore();
}

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

setupSaveMenu();
requestAnimationFrame(loop);
