// ============================================================
// MIND IN MOTION — game.js (Performance & Controls Restored)
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
  stepTimer: 0             
};

const cam = { x: 0, y: 0, zoom: 1.0, targetZoom: 1.0 };
const particles = [];
const ambientParticles = [];
const enemies = [];        

// ---------- programmatic web audio system ----------
const audioChannels = {
  ctx: null,
  nature: new Audio('nature.mp3'),
  music: new Audio('https://res.cloudinary.com/dcjst7sod/video/upload/v1781299773/Background_music_of_gameplay_uutorc.mp3'),
  initialized: false,
  muted: false,
  currentMusicTarget: 0.0
};

function startAudio() {
  if (audioChannels.initialized) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  audioChannels.ctx = new AudioCtx();

  audioChannels.nature.loop = true;
  audioChannels.nature.volume = 0.15;
  audioChannels.nature.play().catch(() => {});

  audioChannels.music.loop = true;
  audioChannels.music.volume = 0.0;
  audioChannels.music.play().catch(() => {});

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
    gain.gain.setValueAtTime(0.12, now);
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
    gain.gain.setValueAtTime(0.05, now);
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
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain); osc2.connect(gain); gain.connect(ctxNode.destination);
    osc1.start(now); osc2.start(now); osc1.stop(now + 0.6); osc2.stop(now + 0.6);
  }
}

function updateAudioMixing(dt) {
  if (!audioChannels.initialized || audioChannels.muted) return;
  if (game.state === 'PLAY') {
    audioChannels.currentMusicTarget = 0.25;
  } else if (game.state === 'STORY') {
    audioChannels.currentMusicTarget = 0.02; 
  } else {
    audioChannels.currentMusicTarget = 0.0;
  }
  const fadeSpeed = 0.4; 
  let v = audioChannels.music.volume;
  if (v < audioChannels.currentMusicTarget) v = Math.min(audioChannels.currentMusicTarget, v + fadeSpeed * dt);
  else if (v > audioChannels.currentMusicTarget) v = Math.max(audioChannels.currentMusicTarget, v - fadeSpeed * dt);
  if (game.audioDamp < 1.0) game.audioDamp = Math.min(1.0, game.audioDamp + 1.8 * dt);
  audioChannels.music.volume = v * game.audioDamp;
}

function toggleMute() {
  audioChannels.muted = !audioChannels.muted;
  const masterSwitch = audioChannels.muted ? 0 : 1;
  audioChannels.nature.volume = 0.15 * masterSwitch;
  audioChannels.music.volume = (game.state === 'PLAY' ? 0.25 : 0.02) * masterSwitch;
}

// ---------- interactive menu select & cache save system ----------
const gatekeeper = document.getElementById('gatekeeper');
const videoElement = document.getElementById('intro-video');
const newJourneyBtn = document.getElementById('menu-new-btn');
const continueBtn = document.getElementById('menu-cont-btn');
const levelSelectPanel = document.getElementById('level-select-panel');
const nodesContainer = document.getElementById('nodes-container');

const RomanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];

function setupSaveMenu() {
  const highestUnlocked = parseInt(localStorage.getItem('mim_unlocked_stage') || "0");
  const lastSavedLevel = parseInt(localStorage.getItem('mim_saved_stage') || "0");

  if (lastSavedLevel > 0) {
    continueBtn.style.display = "block";
    continueBtn.addEventListener('click', () => bootIntoSystem(lastSavedLevel, false));
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
  }

  newJourneyBtn.addEventListener('click', () => bootIntoSystem(0, true));
}

function bootIntoSystem(targetIndex, playIntroVideo) {
  gatekeeper.style.opacity = '0';
  setTimeout(() => gatekeeper.remove(), 600);
  startAudio();

  if (playIntroVideo && videoElement) {
    game.state = 'INTRO';
    videoElement.style.opacity = '1';
    videoElement.play().catch(e => {
      videoElement.muted = true;
      videoElement.play().catch(err => console.log(err));
    });
  } else {
    if (videoElement) videoElement.remove();
    loadLevel(targetIndex);
  }
}

if (videoElement) {
  videoElement.addEventListener('ended', () => {
    videoElement.style.opacity = '0';
    setTimeout(() => {
      if (videoElement) videoElement.remove();
      loadLevel(0);
    }, 1200);
  });
}

function skipVideo() {
  if (game.state === 'INTRO') {
    if (videoElement) videoElement.style.opacity = '0';
    setTimeout(() => {
      if (videoElement) videoElement.remove();
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
  player.x = game.checkpoint.x;
  player.y = game.checkpoint.y;
  player.vx = 0; player.vy = 0;
  player.jumpsLeft = 2; 
  cam.x = player.x; cam.y = player.y;
  cam.zoom = 1.0; cam.targetZoom = 1.0;
  initLevelEnemies(); 
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
    }
    return true;
  }
  return false;
}

function setKey(code, down) {
  if (game.state === 'MENU') return;
  if (down && anyKeyAdvance()) return;
  if (code === 'KeyM' && down) { toggleMute(); return; }
  if (code === 'ArrowLeft' || code === 'KeyA') keys.left = down;
  if (code === 'ArrowRight' || code === 'KeyD') keys.right = down;
  if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
    if (down && !jumpHeld) player.buffer = PHYS.jumpBuffer;
    jumpHeld = down;
  }
  if (code === 'KeyR' && down && game.state === 'PLAY') { game.deaths++; respawn(); }
}

window.addEventListener('keydown', e => { setKey(e.code, true); e.preventDefault(); });
window.addEventListener('keyup',   e => setKey(e.code, false)); // FIXED: Changed "code" to "e.code"

function bindBtn(id, code) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('touchstart', e => { setKey(code, true); e.preventDefault(); });
  el.addEventListener('touchend',   e => { setKey(code, false); e.preventDefault(); });
}
bindBtn('btnL', 'ArrowLeft'); bindBtn('btnR', 'ArrowRight'); bindBtn('btnJ', 'Space');
canvas.addEventListener('touchstart', () => anyKeyAdvance());

function dust(x, y, n, spread = 160) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * spread,
      vy: -Math.random() * 90,
      life: 0.4 + Math.random() * 0.3, t: 0
    });
  }
}

function overlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function update(dt) {
  updateAudioMixing(dt);
  if (game.state === 'MENU' || game.state === 'INTRO') return;
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

  game.phaseTimer += dt;
  if (player.x > 550) game.targetBloom = 1.0;
  game.bloom += (game.targetBloom - game.bloom) * 1.8 * dt;

  const L = game.level;

  for (const [sx, sy, sw, sh, spower] of (L.springs || [])) {
    if (overlap(player.x, player.y, player.w, player.h, sx, sy, sw, sh)) {
      player.vy = -spower; player.grounded = false; player.jumpsLeft = 2; 
      synthSFX('spring'); dust(player.x + player.w / 2, player.y + player.h, 24, 280);
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
      game.deaths++; game.audioDamp = 0.15; dust(player.x + player.w / 2, player.y + player.h / 2, 20, 260);
      respawn(); return;
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
    } else if (player.jumpsLeft > 0) {
      player.vy = PHYS.jumpVel * 0.95; player.buffer = 0; player.jumpsLeft = 0; 
      synthSFX('jump'); dust(player.x + player.w / 2, player.y + player.h / 2, 14, 220);
    }
  }
  
  if (!jumpHeld && player.vy < 0) {
    player.vy *= 1 - (1 - PHYS.jumpCut) * Math.min(1, dt * 14);
  }

  const wasGrounded = player.grounded;
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
        if (!wasGrounded && player.vy > 500) dust(player.x + player.w / 2, player.y + player.h, 8);
        player.vy = 0;
      } else if (player.vy < 0) {
        player.y = py + ph; player.vy = 0;
      }
    }
  }
  if (player.grounded) player.coyote = PHYS.coyoteTime;

  for (const cp of L.checkpoints) {
    if (Math.abs(player.x - cp.x) < 30 && Math.abs(player.y - cp.y) < 90 && game.checkpoint.x !== cp.x) {
      game.checkpoint = { ...cp }; dust(cp.x, cp.y + 80, 14, 80);
    }
  }

  for (const [hx, hy, hw, hh] of (L.hazards || [])) {
    if (overlap(player.x, player.y, player.w, player.h, hx, hy - 6, hw, hh + 6)) {
      game.deaths++; game.audioDamp = 0.15; dust(player.x + player.w / 2, player.y + player.h / 2, 16, 240);
      respawn(); return;
    }
  }

  if (overlap(player.x, player.y, player.w, player.h, L.exit.x, L.exit.y, L.exit.w, L.exit.h)) game.state = 'FADE';
  if (player.y > L.bottom) { game.deaths++; game.audioDamp = 0.15; respawn(); }

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
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt;
  }

  for (let p of ambientParticles) {
    const beatVelocityFactor = 1.0 + 0.5 * Math.abs(Math.sin(performance.now() / 380));
    p.x += p.speedX * beatVelocityFactor * dt; p.y += p.speedY * dt;
    if (p.x < -20) p.x = W + 20; if (p.y < -20) p.y = H + 20;
  }
}

function render() {
  if (game.state === 'MENU' || game.state === 'INTRO') return;

  if (bg.skyOk) {
    const s = Math.max(W / bg.sky.width, H / bg.sky.height);
    ctx.drawImage(bg.sky, (W - bg.sky.width * s) / 2, (H - bg.sky.height * s) / 2, bg.sky.width * s, bg.sky.height * s);
  } else {
    ctx.fillStyle = '#0a1228'; ctx.fillRect(0, 0, W, H);
  }

  if (game.state === 'STORY') { renderStory(); return; }
  if (game.state === 'END') { renderEnd(); return; }

  const mood = game.level.mood || { veil: [105,125,148], grade: null, darken: 0 };
  const [vr, vg, vb] = mood.veil;

  layer(bg.hills, bg.hillsOk, 0.15, 0.60, 1.0);
  ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.25)`; ctx.fillRect(0, 0, W, H);
  layer(bg.mono, bg.monoOk, 0.35, 0.70, 1.0);
  ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.15)`; ctx.fillRect(0, 0, W, H);
  layer(bg.ruins, bg.ruinsOk, 0.55, 0.50, 1.0);
  ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.06)`; ctx.fillRect(0, 0, W, H);

  fogDrift();
  lightShafts();

  layer(bg.shard, bg.shardOk, 0.75, 0.95, 2.8);
  layer(bg.occl, bg.occlOk, 0.85, 1.05, 2.2);
  layer(bg.debris, bg.debrisOk, 1.25, 0.35, 1.5);

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

  ctx.fillStyle = '#9db8e0';
  for (const p of particles) {
    ctx.globalAlpha = 1 - p.t / p.life; ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;

  // ---------- enemies ----------
  for (let e of enemies) {
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h);
    if (e.isAggro) {
      ctx.fillStyle = 'rgba(235, 95, 95, 0.22)';
      ctx.beginPath();
      ctx.arc(0, -e.h / 2, e.h * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = e.type === 'stalker' ? '#08040f' : '#030712';
    ctx.fillRect(-e.w / 2, -e.h, e.w, e.h);
    ctx.fillStyle = e.isAggro ? 'rgba(235, 95, 95, 0.9)' : 'rgba(157, 184, 224, 0.45)';
    ctx.fillRect(e.dir >= 0 ? e.w * 0.08 : -e.w * 0.32, -e.h * 0.78, 5, 5);
    ctx.restore();
  }

  drawPlayer();
  ctx.restore();

  // ---------- per-chapter color grade ----------
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

// ---------- overlay screens ----------
function renderStory() {
  ctx.fillStyle = 'rgba(5, 9, 15, 0.55)';
  ctx.fillRect(0, 0, W, H);
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
}

function renderEnd() {
  ctx.fillStyle = 'rgba(5, 9, 15, 0.92)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#dfe8f5';
  ctx.font = '30px Georgia, serif';
  ctx.fillText('THE SKY HAS OPENED UP', W / 2, H * 0.4);
  ctx.fillStyle = 'rgba(223,232,245,0.75)';
  ctx.font = '15px Georgia, serif';
  const line = game.deaths === 0
    ? 'He fell zero times. He suspects this means nothing.'
    : `He fell ${game.deaths} time${game.deaths === 1 ? '' : 's'}. He kept the suit clean anyway.`;
  ctx.fillText(line, W / 2, H * 0.4 + 40);
  ctx.fillStyle = `rgba(157,184,224,${0.4 + 0.3 * Math.sin(performance.now() / 500)})`;
  ctx.font = '13px Georgia, serif';
  ctx.fillText('press any key to run again', W / 2, H * 0.72);
}

// ---------- background helpers ----------
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

// ---------- player ----------
function drawPlayer() {
  const drawH = 100;
  const drawW = drawH * SHEET.cw / SHEET.ch;
  const cx = player.x + player.w / 2;
  const feetY = player.y + player.h;

  ctx.save();
  ctx.translate(cx, feetY);
  ctx.scale(player.dir, 1);
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

// ---------- main loop ----------
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
