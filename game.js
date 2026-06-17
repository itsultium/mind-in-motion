// ============================================================
// MIND IN MOTION — game.js
// States: MENU → INTRO → STORY → PLAY → FADE → STORY → END
// Enemy types: patrol | stalker | sentinel | charger | ninja
// Mechanics: Standard Platforming, Aim/Shoot, Strict Plane Flight
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

// ---------- world backgrounds ----------
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

const bgB = {
  sky: new Image(), mono: new Image(),
  skyOk: false, monoOk: false
};
bgB.sky.src  = 'https://res.cloudinary.com/dcjst7sod/image/upload/v1781468294/deep_space_night_sky__dark_b3ssyj.jpg';
bgB.sky.onload  = () => bgB.skyOk  = true;
bgB.mono.src = 'https://res.cloudinary.com/dcjst7sod/image/upload/v1781542147/Level_7_vfrroz.jpg';
bgB.mono.onload = () => bgB.monoOk = true;

// ---------- physics ----------
const PHYS = {
  gravity: 2150, moveAccel: 3000, airAccel: 2700, friction: 2200,
  maxSpeed: 470, jumpVel: -930, jumpCut: 0.45,
  coyoteTime: 0.12, jumpBuffer: 0.15, maxFall: 1100,
  planeSpeed: 600 // Strict speed for flight
};

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
const playerBullets = [];
const asteroids = [];
let asteroidTimer = 0;

// ---------- audio ----------
const audioChannels = {
  ctx: null,
  nature: null,
  music: new Audio('https://res.cloudinary.com/dcjst7sod/video/upload/v1781299773/Background_music_of_gameplay_uutorc.mp3'),
  menuMusic: new Audio('https://res.cloudinary.com/dcjst7sod/video/upload/v1781467127/Main_Menu_Audio_ovq3r9.mp3'),
  initialized: false, muted: false
};

function startAudio() {
  if (audioChannels.initialized) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioChannels.ctx = new AudioCtx();
  } catch(e) {}
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
  if (game.state === 'PLAY') targetGame = game.levelIndex >= 6 ? 0.75 : 0.55;
  else if (game.state === 'STORY') targetGame = 0.25;
  else if (game.state === 'MENU' || game.state === 'PAUSE') targetMenu = 0.65;
  const spd = 0.5;
  let gv = audioChannels.music.volume;
  gv = gv < targetGame ? Math.min(targetGame, gv + spd * dt) : Math.max(targetGame, gv - spd * dt);
  let mv = audioChannels.menuMusic.volume;
  mv = mv < targetMenu ? Math.min(targetMenu, mv + spd * dt) : Math.max(targetMenu, mv - spd * dt);
  audioChannels.music.volume = gv * game.audioDamp;
  audioChannels.menuMusic.volume = mv * game.audioDamp;
}

// ---------- Input & Aiming ----------
const keys = { left: false, right: false, up: false, down: false }; 
let jumpHeld = false;
const mouse = { x: W/2, y: H/2, down: false };

window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mousedown', e => { 
  if (game.state === 'PLAY' && game.levelIndex >= 20) fireWeapon(); 
});

function fireWeapon() {
  if (player.isDying) return;
  const px = player.x + player.w / 2; const py = player.y + player.h / 2;
  const worldX = mouse.x / cam.zoom + cam.x - (W / 2) / cam.zoom;
  const worldY = mouse.y / cam.zoom + cam.y - (H / 2) / cam.zoom;
  const angle = Math.atan2(worldY - py, worldX - px);
  
  playerBullets.push({
    x: px, y: py,
    vx: Math.cos(angle) * 1400, vy: Math.sin(angle) * 1400,
    life: 1.2, t: 0, r: 4
  });
  synthSFX('shoot');
  player.squashX = 0.9; player.squashY = 1.1; // Recoil feel
}

function setKey(code, down) {
  if (code === 'ArrowLeft'  || code === 'KeyA') keys.left  = down;
  if (code === 'ArrowRight' || code === 'KeyD') keys.right = down;
  if (code === 'ArrowUp'    || code === 'KeyW') keys.up    = down;
  if (code === 'ArrowDown'  || code === 'KeyS') keys.down  = down;

  if (down) {
    if ((code === 'Escape' || code === 'KeyP') && (game.state === 'PLAY' || game.state === 'PAUSE')) {
      if (game.state === 'PLAY') { game.state = 'PAUSE'; setupSaveMenu(); document.getElementById('gatekeeper').classList.remove('hidden'); }
      else { game.state = 'PLAY'; document.getElementById('gatekeeper').classList.add('hidden'); }
    }
    if ((code === 'Space' || code === 'ArrowUp' || code === 'KeyW') && game.state === 'PLAY') {
      if (!jumpHeld) player.buffer = PHYS.jumpBuffer;
      jumpHeld = true;
    }
    if (code === 'KeyR' && game.state === 'PLAY') triggerDeath();
    if (code === 'KeyM') toggleMute();
    if (game.state === 'INTRO' || game.state === 'STORY' || game.state === 'END') anyKeyAdvance();
  } else {
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') jumpHeld = false;
  }
}
window.addEventListener('keydown', e => {
  const blocked = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyW','KeyA','KeyS','KeyD'];
  if (blocked.includes(e.code)) e.preventDefault();
  setKey(e.code, true);
});
window.addEventListener('keyup', e => setKey(e.code, false));

function anyKeyAdvance() {
  if (game.state === 'STORY') {
    if (game.storyLine < game.level.story.length) game.storyLine = game.level.story.length;
    else { game.state = 'PLAY'; keys.left = false; keys.right = false; jumpHeld = false; }
  } else if (game.state === 'END') { loadLevel(0); }
}

// ---------- level loading ----------
function initEnemies() {
  enemies.length = 0;
  if (!game.level.enemies) return;
  for (const e of game.level.enemies) {
    enemies.push({ ...e, isAggro: false, shootTimer: 1.5, shootWarn: 0, chargeTimer: 0, chargeActive: false, hp: e.type === 'ninja' ? 2 : 1 });
  }
}

function initAmbientParticles() {
  ambientParticles.length = 0;
  for (let i = 0; i < 40; i++) {
    ambientParticles.push({
      x: Math.random() * W, y: Math.random() * H,
      size: 1 + Math.random() * 2, speedX: -10 - Math.random() * 20, speedY: -4 - Math.random() * 12, alpha: 0.1 + Math.random() * 0.4
    });
  }
}

function loadLevel(i) {
  game.levelIndex = i; game.level = LEVELS[i];
  game.checkpoint = { ...game.level.spawn };
  game.state = 'STORY'; game.storyLine = 0; game.storyTimer = 0;
  game.fade = 0; game.bloom = 0.0;
  sentinelBullets.length = 0; playerBullets.length = 0;
  initAmbientParticles(); initEnemies(); respawn();
}

function respawn() {
  player.isDying = false; player.x = game.checkpoint.x; player.y = game.checkpoint.y;
  player.vx = 0; player.vy = 0; player.jumpsLeft = 2;
  cam.x = player.x; cam.y = player.y; cam.zoom = 1.0;
  sentinelBullets.length = 0; playerBullets.length = 0;
  initEnemies();
}

function triggerDeath() {
  if (player.isDying) return;
  player.isDying = true; player.deathTimer = 0.75; game.deaths++; game.screenShake = 0.3;
  synthSFX('death');
  for (let i = 0; i < 40; i++) particles.push({ x: player.x + 15, y: player.y + 40, vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.6) * 190, life: 0.5, t: 0, isStatic: true });
}

function overlap(ax, ay, aw, ah, bx, by, bw, bh) { return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by; }

function toggleMute() {
  audioChannels.muted = !audioChannels.muted;
  audioChannels.music.volume     = audioChannels.muted ? 0 : audioChannels.music.volume;
  audioChannels.menuMusic.volume = audioChannels.muted ? 0 : audioChannels.menuMusic.volume;
}

function playIntro() {
  const intro = document.getElementById('intro-container');
  const vid   = document.getElementById('intro-video');
  if (!vid || !vid.src) { document.getElementById('gatekeeper').classList.add('hidden'); loadLevel(0); return; }
  intro.classList.add('active');
  vid.play().catch(() => {});
  const skip = () => {
    vid.pause(); intro.classList.remove('active');
    document.getElementById('gatekeeper').classList.add('hidden');
    loadLevel(0); intro.removeEventListener('click', skip);
  };
  intro.addEventListener('click', skip); vid.onended = skip;
}

// ============================================================
// UPDATE
// ============================================================
function update(dt) {
  updateAudioMixing(dt);
  if (game.state !== 'PLAY' && game.state !== 'FADE') {
    if (game.state === 'STORY') game.storyTimer += dt, game.storyLine = Math.min(Math.floor(game.storyTimer / 1.4), game.level.story.length);
    return;
  }
  
  if (game.state === 'FADE') {
    game.fade = Math.min(1, game.fade + dt * 1.4);
    if (game.fade >= 1) {
      if (game.levelIndex + 1 >= LEVELS.length) { game.state = 'END'; }
      else { loadLevel(game.levelIndex + 1); }
    }
    return;
  }

  game.screenShake = Math.max(0, game.screenShake - dt * 4);
  player.squashX += (1 - player.squashX) * 10 * dt; player.squashY += (1 - player.squashY) * 10 * dt;

  if (player.isDying) {
    player.deathTimer -= dt; if (player.deathTimer <= 0) respawn();
    for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.t += dt; if (p.t > p.life) particles.splice(i, 1); else { p.x += p.vx * dt; p.y += p.vy * dt; } }
    return;
  }

  const L = game.level;
  const px = player.x + player.w / 2; const py = player.y + player.h / 2;

  // ---------- Player Bullets ----------
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    const b = playerBullets[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.t += dt;
    if (b.t > b.life) { playerBullets.splice(i, 1); continue; }
    
    // Check enemy hits
    let hit = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (overlap(b.x - b.r, b.y - b.r, b.r*2, b.r*2, e.x, e.y, e.w, e.h)) {
        e.hp--; hit = true;
        for (let k=0; k<8; k++) particles.push({ x: b.x, y: b.y, vx: (Math.random()-0.5)*150, vy: (Math.random()-0.5)*150, life: 0.3, t: 0, isStatic: false });
        if (e.hp <= 0) { game.screenShake = 0.1; enemies.splice(j, 1); }
        break;
      }
    }
    if (hit) playerBullets.splice(i, 1);
  }

  // ---------- Enemy AI ----------
  for (let e of enemies) {
    const ex = e.x + e.w / 2; const ey = e.y + e.h / 2; const distX = px - ex; const distAbs = Math.abs(distX);
    
    if (e.type === 'ninja') {
      e.isAggro = distAbs < 600;
      if (e.isAggro) {
        e.dir = Math.sign(distX) || 1;
        if (e.grounded && Math.random() < 0.03 && distAbs > 50) { e.vy = -750; e.vx = e.dir * 450; e.grounded = false; }
        else if (e.grounded) { e.vx = e.dir * e.speed; }
      } else { e.vx = 0; }
      
      e.vy += PHYS.gravity * dt; e.x += e.vx * dt;
      // Ninja basic collision
      e.grounded = false; e.y += e.vy * dt;
      for (const [plx, ply, plw, plh] of L.platforms) {
        if (overlap(e.x, e.y, e.w, e.h, plx, ply, plw, plh) && e.vy > 0) {
          e.y = ply - e.h; e.grounded = true; e.vy = 0;
        }
      }
    } else if (e.type === 'patrol' || e.type === 'stalker') {
      e.isAggro = e.type === 'stalker' && distAbs < 320;
      e.x += Math.sign(distX) * (e.isAggro ? e.speed * 2 : e.speed) * dt;
      if (!e.isAggro) { if (e.x < e.minX) { e.x = e.minX; e.dir = 1; } if (e.x > e.maxX) { e.x = e.maxX; e.dir = -1; } }
      e.dir = Math.sign(distX) || 1;
    } else if (e.type === 'sentinel') {
      e.dir = distX > 0 ? 1 : -1; e.shootTimer -= dt;
      if (e.shootWarn > 0) {
        e.shootWarn -= dt; e.isAggro = true;
        if (e.shootWarn <= 0) {
          const angle = Math.atan2(py - ey, px - ex);
          sentinelBullets.push({ x: ex, y: ey, vx: Math.cos(angle)*450, vy: Math.sin(angle)*450, life: 2.2, t: 0, r: 6 });
          synthSFX('shoot'); e.shootTimer = 1.5;
        }
      } else if (e.shootTimer <= 0) { e.shootWarn = 0.35; e.isAggro = true; } else e.isAggro = false;
    }

    if (overlap(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) { triggerDeath(); return; }
  }

  for (let i = sentinelBullets.length - 1; i >= 0; i--) {
    const b = sentinelBullets[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 200 * dt; b.t += dt;
    if (b.t > b.life) { sentinelBullets.splice(i, 1); continue; }
    if (overlap(player.x, player.y, player.w, player.h, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2)) { triggerDeath(); return; }
  }

  // ---------- Player Physics (Strict Mode vs Gravity Mode) ----------
  if (L.isPlane) {
    // ZERO DRIFT, STRICT FLIGHT MOVEMENT
    if (keys.up) player.vy = -PHYS.planeSpeed; else if (keys.down) player.vy = PHYS.planeSpeed; else player.vy = 0;
    if (keys.left) player.vx = -PHYS.planeSpeed; else if (keys.right) player.vx = PHYS.planeSpeed; else player.vx = 0;
    
    if (keys.left) player.dir = -1; else if (keys.right) player.dir = 1;
    player.x += player.vx * dt; player.y += player.vy * dt;
    
    // Bounds keeping
    player.x = Math.max(0, Math.min(L.width - player.w, player.x));
    player.y = Math.max(0, Math.min(L.bottom - player.h, player.y));
    
    // Minimalist exhaust (matte, no glow)
    if (player.vx !== 0 || player.vy !== 0) {
      particles.push({ x: player.x + player.w/2, y: player.y + player.h, vx: -player.vx*0.2, vy: -player.vy*0.2 + 50, life: 0.2, t: 0, isStatic: true });
    }
    
  } else {
    // STANDARD PLATFORMING
    const accel = player.grounded ? PHYS.moveAccel : PHYS.airAccel;
    let move = 0; if (keys.left) move -= 1; if (keys.right) move += 1;
    if (move !== 0) { player.vx += move * accel * dt; player.dir = move; }
    else if (player.grounded) { const f = PHYS.friction * dt; player.vx = Math.abs(player.vx) <= f ? 0 : player.vx - Math.sign(player.vx) * f; }
    
    player.vx = Math.max(-PHYS.maxSpeed, Math.min(PHYS.maxSpeed, player.vx));
    player.vy = Math.min(player.vy + PHYS.gravity * dt, PHYS.maxFall);

    player.buffer = Math.max(0, player.buffer - dt);
    player.coyote = Math.max(0, (player.coyote || 0) - dt);
    if (player.buffer > 0 && (player.grounded || player.coyote > 0)) {
      player.vy = PHYS.jumpVel; player.grounded = false;
      player.coyote = 0; player.buffer = 0; synthSFX('jump');
    }
    if (!jumpHeld && player.vy < 0) player.vy *= 1 - (1 - PHYS.jumpCut) * Math.min(1, dt * 14);

    player.grounded = false; player.x += player.vx * dt;
    for (const [plx, ply, plw, plh] of L.platforms) {
      if (overlap(player.x, player.y, player.w, player.h, plx, ply, plw, plh)) {
        if (player.vx > 0) player.x = plx - player.w; else if (player.vx < 0) player.x = plx + plw;
        player.vx = 0;
      }
    }
    player.y += player.vy * dt;
    for (const [plx, ply, plw, plh] of L.platforms) {
      if (overlap(player.x, player.y, player.w, player.h, plx, ply, plw, plh)) {
        if (player.vy > 0) { player.y = ply - player.h; player.grounded = true; player.vy = 0; player.coyote = PHYS.coyoteTime; } 
        else if (player.vy < 0) { player.y = ply + plh; player.vy = 0; }
      }
    }
  }

  // Hazards & Exit
  for (const [hx, hy, hw, hh] of (L.hazards || [])) if (overlap(player.x, player.y, player.w, player.h, hx, hy - 6, hw, hh + 6)) { triggerDeath(); return; }
  if (player.y > L.bottom) { triggerDeath(); return; }
  const ex = L.exit; if (overlap(player.x - 20, player.y, player.w + 40, player.h, ex.x, ex.y - 20, ex.w, ex.h + 40)) game.state = 'FADE';

  // Animation
  if (!L.isPlane) {
    const spd = Math.abs(player.vx);
    if (!player.grounded) player.frame = player.vy < 0 ? SHEET.jump : SHEET.fall;
    else if (spd > 20) { player.animTime += dt * 12; player.frame = Math.floor(player.animTime) % SHEET.runFrames; }
    else player.frame = SHEET.idle;
  }

  // Camera
  cam.targetZoom = L.isPlane ? 0.55 : 0.65;
  cam.zoom += (cam.targetZoom - cam.zoom) * dt * 2.5;
  cam.x += ((player.x + player.w / 2) - cam.x) * dt * 4;
  cam.y += ((player.y + player.h / 2) - cam.y) * dt * 3;
  const halfW = (W/2)/cam.zoom; const halfH = (H/2)/cam.zoom;
  cam.x = Math.max(halfW, Math.min(L.width - halfW, cam.x));
  cam.y = Math.max(halfH, Math.min(L.bottom - halfH, cam.y));
  
  // Particles
  for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.t += dt; if (p.t > p.life) particles.splice(i, 1); else { p.x += p.vx * dt; p.y += p.vy * dt; } }
}

// ============================================================
// RENDER
// ============================================================
function layer(img, ok, p, hFrac, gap = 1) {
  if (!ok) return;
  const lh = H * hFrac; const lw = img.width * (lh / img.height); const span = lw * gap;
  let x = -((cam.x * p) % span); if (x > 0) x -= span;
  for (; x < W; x += span) ctx.drawImage(img, x, H - lh, lw, lh);
}

function render() {
  if (game.state === 'MENU' || game.state === 'INTRO') { ctx.fillStyle = '#05090f'; ctx.fillRect(0, 0, W, H); return; }

  if (game.state === 'STORY') {
    ctx.fillStyle = '#05090f'; ctx.fillRect(0, 0, W, H);
    const L2 = game.level; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(157,184,224,0.7)'; ctx.font = '13px Georgia, serif';
    ctx.fillText(L2.subtitle, W/2, H*0.32);
    ctx.fillStyle = '#dfe8f5'; ctx.font = '34px Georgia, serif';
    ctx.fillText(L2.name, W/2, H*0.32+44);
    ctx.font = '16px Georgia, serif'; ctx.fillStyle = 'rgba(223,232,245,0.85)';
    for (let i = 0; i < game.storyLine; i++) ctx.fillText(L2.story[i], W/2, H*0.5+i*30);
    if (game.storyLine >= L2.story.length) {
      ctx.fillStyle = `rgba(157,184,224,${0.4+0.3*Math.sin(performance.now()/500)})`; ctx.font = '12px Georgia, serif';
      ctx.fillText('press any key', W/2, H*0.78);
    }
    ctx.textAlign = 'left'; return;
  }

  if (game.state === 'END') {
    ctx.fillStyle = 'rgba(5,9,15,0.94)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.fillStyle = '#dfe8f5'; ctx.font = '30px Georgia, serif';
    ctx.fillText('THE SKY HAS OPENED UP', W/2, H*0.4);
    ctx.fillStyle = 'rgba(223,232,245,0.75)'; ctx.font = '15px Georgia, serif';
    ctx.fillText(game.deaths === 0 ? 'He fell zero times. He suspects this means nothing.' : `He fell ${game.deaths} time${game.deaths===1?'':'s'}. He kept the suit clean anyway.`, W/2, H*0.4+40);
    ctx.fillStyle = `rgba(157,184,224,${0.4+0.3*Math.sin(performance.now()/500)})`; ctx.font = '12px Georgia, serif';
    ctx.fillText('press any key to run again', W/2, H*0.72);
    ctx.textAlign = 'left'; return;
  }

  const isBeyond = game.level.mood && game.level.mood.isBeyond;
  
  ctx.fillStyle = isBeyond ? '#030d18' : '#07101e'; ctx.fillRect(0, 0, W, H);

  // Background Parallax with Level 7 Height Fix (1.0 instead of 0.72)
  if (isBeyond) {
    if (bgB.skyOk) { const s = Math.max(W/bgB.sky.width, H/bgB.sky.height); ctx.drawImage(bgB.sky, (W-bgB.sky.width*s)/2, (H-bgB.sky.height*s)/2, bgB.sky.width*s, bgB.sky.height*s); }
    layer(bgB.mono, bgB.monoOk, 0.35, 1.0, 1.0);
  } else {
    layer(bg.hills, bg.hillsOk, 0.15, 0.60, 1.0);
    layer(bg.mono, bg.monoOk, 0.35, 0.70, 1.0);
  }

  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.x, -cam.y);
  const L = game.level;

  // Platforms
  for (const [plx, ply, plw, plh] of L.platforms) {
    ctx.fillStyle = isBeyond ? 'rgba(2, 10, 22, 0.8)' : 'rgba(6, 11, 23, 0.9)'; ctx.fillRect(plx, ply, plw, plh);
    ctx.fillStyle = isBeyond ? 'rgba(0, 210, 210, 0.55)' : 'rgba(157, 184, 224, 0.22)'; ctx.fillRect(plx, ply, plw, 2);
  }

  // Player Bullets (Matte, No Bloom to preserve silhouette style)
  for (const b of playerBullets) {
    ctx.fillStyle = isBeyond ? 'rgba(0, 220, 220, 0.8)' : 'rgba(157, 184, 224, 0.8)';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
  }

  // Enemies
  for (const e of enemies) {
    ctx.save(); ctx.translate(e.x + e.w / 2, e.y + e.h);
    ctx.fillStyle = e.type === 'ninja' ? '#1a0000' : '#030712'; // Ninjas are darker red-black silhouette
    ctx.fillRect(-e.w / 2, -e.h, e.w, e.h);
    
    // Aggro Eye
    if (e.isAggro) {
      ctx.fillStyle = e.type === 'ninja' ? 'rgba(255, 50, 50, 0.9)' : 'rgba(0, 230, 230, 0.9)';
      ctx.fillRect(e.dir >= 0 ? e.w * 0.08 : -e.w * 0.32, -e.h * 0.78, 5, 5);
    }
    ctx.restore();
  }

  // Player / Plane
  if (!player.isDying) {
    ctx.save(); ctx.translate(player.x + player.w / 2, player.y + player.h); ctx.scale(player.dir * player.squashX, player.squashY);
    
    if (L.isPlane) {
      // Minimalist silhouette wing wrapping the character
      ctx.fillStyle = '#020408'; 
      ctx.beginPath(); ctx.moveTo(-40, -10); ctx.lineTo(50, -20); ctx.lineTo(-40, -40); ctx.fill();
    }
    
    if (spriteReady) {
      const drawH = 100; const drawW = drawH * SHEET.cw / SHEET.ch;
      // Bright glow pass first
      ctx.shadowColor = 'rgba(157, 224, 255, 0.95)';
      ctx.shadowBlur = 24;
      ctx.drawImage(sprite, player.frame * SHEET.cw, 0, SHEET.cw, SHEET.ch, -drawW / 2, -drawH + 8, drawW, drawH);
      ctx.shadowBlur = 0;
    } else {
      // Bright fallback so always visible
      ctx.fillStyle = '#c8ddf5'; ctx.fillRect(-player.w / 2, -player.h, player.w, player.h);
    }
    ctx.restore();
  }

  // Matte particles
  for (const p of particles) {
    ctx.globalAlpha = 1 - p.t / p.life;
    ctx.fillStyle = isBeyond ? 'rgba(0, 200, 200, 0.7)' : 'rgba(100, 120, 140, 0.6)';
    ctx.fillRect(p.x, p.y, 4, 4);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Crosshair
  if (game.levelIndex >= 20) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mouse.x - 10, mouse.y); ctx.lineTo(mouse.x + 10, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - 10); ctx.lineTo(mouse.x, mouse.y + 10); ctx.stroke();
  }

  if (game.state === 'FADE') { ctx.fillStyle = `rgba(5, 9, 15, ${game.fade})`; ctx.fillRect(0, 0, W, H); }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now; update(dt); render();
  requestAnimationFrame(loop);
}
setupSaveMenu(); requestAnimationFrame(loop);

function setupSaveMenu() {
  const unlocked = parseInt(localStorage.getItem('mim_unlocked') || '0');
  const saved    = parseInt(localStorage.getItem('mim_chapter')  || '0');
  const newBtn   = document.getElementById('menu-new-btn');
  const contBtn  = document.getElementById('menu-cont-btn');
  const quitBtn  = document.getElementById('menu-quit-btn');
  const panel    = document.getElementById('level-select-panel');
  const nodes    = document.getElementById('nodes-container');

  if (unlocked > 0 && contBtn) contBtn.style.display = 'block';
  if (quitBtn) quitBtn.style.display = (game.state === 'PLAY' || game.state === 'PAUSE') ? 'block' : 'none';

  if (newBtn) newBtn.onclick = () => { startAudio(); localStorage.removeItem('mim_unlocked'); localStorage.removeItem('mim_chapter'); playIntro(); };
  if (contBtn) contBtn.onclick = () => { startAudio(); document.getElementById('gatekeeper').classList.add('hidden'); loadLevel(saved); };
  if (quitBtn) quitBtn.onclick = () => { game.state = 'MENU'; document.getElementById('gatekeeper').classList.remove('hidden'); setupSaveMenu(); };

  if (nodes) {
    nodes.innerHTML = '';
    for (let i = 0; i <= unlocked && i < LEVELS.length; i++) {
      const btn = document.createElement('button'); btn.className = 'node-btn';
      btn.textContent = LEVELS[i].subtitle;
      btn.onclick = () => { startAudio(); document.getElementById('gatekeeper').classList.add('hidden'); loadLevel(i); };
      nodes.appendChild(btn);
    }
  }
  if (unlocked > 0 && panel) { panel.style.opacity = '1'; panel.style.pointerEvents = 'auto'; }
}

// ============================================================
// END OF FILE
// ============================================================
