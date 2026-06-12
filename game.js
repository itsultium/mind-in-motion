// ============================================================
// MIND IN MOTION — game.js (Stage 2: Level System & Cinematic Polish)
// States: STORY (chapter card) -> PLAY -> FADE -> next STORY
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

// ---------- background layers (FIXED EXTENSIONS TO MATCH YOUR FILES) ----------
const bg = {
  sky: new Image(), hills: new Image(), mono: new Image(),
  ruins: new Image(), debris: new Image(), occl: new Image(), shard: new Image(),
  skyOk: false, hillsOk: false, monoOk: false,
  ruinsOk: false, debrisOk: false, occlOk: false, shardOk: false
};
bg.sky.src = 'bg_sky.jpg';         bg.sky.onload = () => bg.skyOk = true;
bg.hills.src = 'bg_hills.jpg';     bg.hills.onload = () => bg.hillsOk = true;
bg.mono.src = 'bg_monoliths.jpg';  bg.mono.onload = () => bg.monoOk = true;
bg.ruins.src = 'bg_ruins.jpg';     bg.ruins.onload = () => bg.ruinsOk = true;
bg.debris.src = 'bg_debris.jpg';   bg.debris.onload = () => bg.debrisOk = true;
bg.occl.src = 'bg_occl_thin.jpg';   bg.occl.onload = () => bg.occlOk = true;
bg.shard.src = 'bg_occl_shard.jpg'; bg.shard.onload = () => bg.shardOk = true;

// ---------- physics ----------
const PHYS = {
  gravity: 2300, moveAccel: 2800, airAccel: 1800, friction: 2200,
  maxSpeed: 380, jumpVel: -800, jumpCut: 0.45,
  coyoteTime: 0.10, jumpBuffer: 0.12, maxFall: 1100
};

// ---------- game state ----------
const game = {
  state: 'STORY',          // STORY | PLAY | FADE | END
  levelIndex: 0,
  level: null,
  checkpoint: null,        // last activated checkpoint {x, y}
  fade: 0,                 // 0 transparent .. 1 black
  storyLine: 0,            // lines revealed on the card
  storyTimer: 0,
  deaths: 0
};

const player = {
  x: 0, y: 0, vx: 0, vy: 0, w: 34, h: 80,
  dir: 1, grounded: false, coyote: 0, buffer: 0,
  animTime: 0, frame: SHEET.idle
};

// ---------- camera & advanced systems ----------
const cam = { 
  x: 0, y: 0, 
  zoom: 1.0, 
  targetZoom: 1.0 
};

const particles = [];
const ambientParticles = [];

// Initialize ambient atmosphere (floating dust motes)
function initAmbientParticles() {
  ambientParticles.length = 0;
  for (let i = 0; i < 45; i++) {
    ambientParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 1 + Math.random() * 2,
      speedX: -10 - Math.random() * 25,
      speedY: -5 - Math.random() * 15,
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
  initAmbientParticles();
  respawn();
}

function respawn() {
  player.x = game.checkpoint.x;
  player.y = game.checkpoint.y;
  player.vx = 0; player.vy = 0;
  cam.x = player.x; cam.y = player.y;
  cam.zoom = 1.0; cam.targetZoom = 1.0;
}

// ---------- input ----------
const keys = { left: false, right: false };
let jumpHeld = false;

// ---------- ambient audio (Web Audio) ----------
let audio = null, muted = false;
function initAudio() {
  if (audio) return;
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const master = ac.createGain();
    master.gain.value = 0.10;
    master.connect(ac.destination);

    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 320;
    lp.connect(master);

    [[55, 'sine', 0.5], [55.6, 'sine', 0.5], [110.4, 'triangle', 0.12]].forEach(([f, type, g]) => {
      const o = ac.createOscillator();
      o.type = type; o.frequency.value = f;
      const og = ac.createGain(); og.gain.value = g;
      o.connect(og); og.connect(lp); o.start();
    });

    const len = ac.sampleRate * 2;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const noise = ac.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 0.6;
    const ng = ac.createGain(); ng.gain.value = 0.05;
    noise.connect(bp); bp.connect(ng); ng.connect(master); noise.start();
    
    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoG = ac.createGain(); lfoG.gain.value = 180;
    lfo.connect(lfoG); lfoG.connect(bp.frequency); lfo.start();

    const swell = ac.createOscillator();
    swell.frequency.value = 0.04;
    const swellG = ac.createGain(); swellG.gain.value = 0.03;
    swell.connect(swellG); swellG.connect(master.gain); swell.start();

    audio = { ac, master };
  } catch (e) { }
}

function toggleMute() {
  if (!audio) return;
  muted = !muted;
  audio.master.gain.value = muted ? 0 : 0.10;
}

function anyKeyAdvance() {
  if (game.state === 'END') {
    game.deaths = 0;
    loadLevel(0);
    return true;
  }
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
  if (down) initAudio();
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
window.addEventListener('keyup',   e => setKey(e.code, false));

function bindBtn(id, code) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('touchstart', e => { setKey(code, true); e.preventDefault(); });
  el.addEventListener('touchend',   e => { setKey(code, false); e.preventDefault(); });
}
bindBtn('btnL', 'ArrowLeft');
bindBtn('btnR', 'ArrowRight');
bindBtn('btnJ', 'Space');
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

// ---------- update ----------
function update(dt) {
  if (game.state === 'STORY') {
    game.storyTimer += dt;
    const due = Math.floor(game.storyTimer / 1.4);
    game.storyLine = Math.min(Math.max(game.storyLine, due), game.level.story.length);
    return;
  }
  if (game.state === 'FADE') {
    game.fade = Math.min(1, game.fade + dt * 1.4);
    if (game.fade >= 1) {
      if (game.levelIndex + 1 >= LEVELS.length) {
        game.state = 'END';
      } else {
        loadLevel(game.levelIndex + 1);
      }
    }
    return;
  }
  if (game.state === 'END') return;

  const L = game.level;
  const accel = player.grounded ? PHYS.moveAccel : PHYS.airAccel;
  let move = 0;
  if (keys.left)  move -= 1;
  if (keys.right) move += 1;

  if (move !== 0) {
    player.vx += move * accel * dt;
    player.dir = move;
  } else if (player.grounded) {
    const f = PHYS.friction * dt;
    if (Math.abs(player.vx) <= f) player.vx = 0;
    else player.vx -= Math.sign(player.vx) * f;
  }
  player.vx = Math.max(-PHYS.maxSpeed, Math.min(PHYS.maxSpeed, player.vx));
  player.vy = Math.min(player.vy + PHYS.gravity * dt, PHYS.maxFall);

  player.coyote = Math.max(0, player.coyote - dt);
  player.buffer = Math.max(0, player.buffer - dt);

  if (player.buffer > 0 && (player.grounded || player.coyote > 0)) {
    player.vy = PHYS.jumpVel;
    player.grounded = false;
    player.coyote = 0; player.buffer = 0;
  }
  if (!jumpHeld && player.vy < 0) {
    player.vy *= 1 - (1 - PHYS.jumpCut) * Math.min(1, dt * 14);
  }

  const wasGrounded = player.grounded;
  player.grounded = false;

  player.x += player.vx * dt;
  for (const [px, py, pw, ph] of L.platforms) {
    if (overlap(player.x, player.y, player.w, player.h, px, py, pw, ph)) {
      if (player.vx > 0) player.x = px - player.w;
      else if (player.vx < 0) player.x = px + pw;
      player.vx = 0;
    }
  }
  player.y += player.vy * dt;
  for (const [px, py, pw, ph] of L.platforms) {
    if (overlap(player.x, player.y, player.w, player.h, px, py, pw, ph)) {
      if (player.vy > 0) {
        player.y = py - player.h;
        player.grounded = true;
        if (!wasGrounded && player.vy > 500) dust(player.x + player.w / 2, player.y + player.h, 8);
        player.vy = 0;
      } else if (player.vy < 0) {
        player.y = py + ph;
        player.vy = 0;
      }
    }
  }
  if (player.grounded) player.coyote = PHYS.coyoteTime;

  for (const cp of L.checkpoints) {
    if (Math.abs(player.x - cp.x) < 30 && Math.abs(player.y - cp.y) < 90 && game.checkpoint.x !== cp.x) {
      game.checkpoint = { ...cp };
      dust(cp.x, cp.y + 80, 14, 80);
    }
  }

  for (const [hx, hy, hw, hh] of (L.hazards || [])) {
    if (overlap(player.x, player.y, player.w, player.h, hx, hy - 6, hw, hh + 6)) {
      game.deaths++;
      dust(player.x + player.w / 2, player.y + player.h / 2, 16, 240);
      respawn();
      return;
    }
  }

  const e = L.exit;
  if (overlap(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
    game.state = 'FADE';
  }

  if (player.y > L.bottom) { game.deaths++; respawn(); }

  // animation matrix
  const speed = Math.abs(player.vx);
  if (!player.grounded) {
    player.frame = player.vy < 0 ? SHEET.jump : SHEET.fall;
  } else if (speed > 20) {
    player.animTime += dt * (8 + 6 * speed / PHYS.maxSpeed);
    player.frame = Math.floor(player.animTime) % SHEET.runFrames;
  } else {
    player.frame = SHEET.idle;
    player.animTime = 0;
  }

  // --- CALCULATE DYNAMIC CINEMATIC ZOOM (THE GRIS FEEL) ---
  // If player is on the wide quiet walkway in Chapter 1, zoom way out to show architectural scale
  if (game.levelIndex === 0 && player.x > 4000 && player.x < 5100) {
    cam.targetZoom = 0.55; 
  } else if (game.levelIndex === 1 && player.y < 350) {
    cam.targetZoom = 0.70; // Zoom out during high precarious platforming jumps
  } else {
    cam.targetZoom = 0.90; // Default operational frame visibility
  }
  cam.zoom += (cam.targetZoom - cam.zoom) * Math.min(1, dt * 2);

  // Smooth camera easing tracking
  const look = player.dir * 70;
  cam.x += ((player.x + player.w / 2 + look) - cam.x) * Math.min(1, dt * 4);
  cam.y += ((player.y + player.h / 2 - 20) - cam.y) * Math.min(1, dt * 3);
  
  // Confines
  cam.x = Math.max((W / 2) / cam.zoom, Math.min(L.width - (W / 2) / cam.zoom, cam.x));
  cam.y = Math.min(L.bottom - (H / 2) / cam.zoom + 100, cam.y);

  // Update gameplay particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.t += dt;
    if (p.t > p.life) { particles.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt;
  }

  // Update atmospheric particles loop
  for (let p of ambientParticles) {
    p.x += p.speedX * dt;
    p.y += p.speedY * dt;
    if (p.x < -20) p.x = W + 20;
    if (p.y < -20) p.y = H + 20;
  }
}

// ---------- render ----------
function render() {
  if (bg.skyOk) {
    const s = Math.max(W / bg.sky.width, H / bg.sky.height);
    const sw = bg.sky.width * s, sh = bg.sky.height * s;
    ctx.drawImage(bg.sky, (W - sw) / 2, (H - sh) / 2, sw, sh);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#16244a'); g.addColorStop(0.55, '#27407a'); g.addColorStop(1, '#3a5fa8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  if (game.state === 'STORY') { renderStory(); return; }
  if (game.state === 'END') { renderEnd(); return; }

  const mood = game.level.mood || { veil: [105,125,148], grade: null, darken: 0 };
  const [vr, vg, vb] = mood.veil;

  // ---- SCIENTIFIC PARALLAX STACK (BOUND TO CAM AXES) ----
  layer(bg.hills, bg.hillsOk, 0.15, 0.60, 1.0);
  ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.25)`; ctx.fillRect(0, 0, W, H);

  layer(bg.mono, bg.monoOk, 0.35, 0.70, 1.0);
  ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.15)`; ctx.fillRect(0, 0, W, H);

  layer(bg.ruins, bg.ruinsOk, 0.55, 0.50, 1.0);
  ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, 0.06)`; ctx.fillRect(0, 0, W, H);

  fogDrift();
  lightShafts();

  // Foreground layers intersecting view line
  layer(bg.shard, bg.shardOk, 0.75, 0.95, 2.8);
  layer(bg.occl, bg.occlOk, 0.85, 1.05, 2.2);
  layer(bg.debris, bg.debrisOk, 1.25, 0.35, 1.5);

  // Render atmospheric dust motes
  ctx.save();
  for (let p of ambientParticles) {
    ctx.fillStyle = `rgba(223, 232, 245, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // --- BEGIN CINEMATIC VIEW TRANSFORM MATRIX ---
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);

  const L = game.level;
  for (const [px, py, pw, ph] of L.platforms) {
    ctx.fillStyle = '#060b17';
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = 'rgba(157,184,224,0.20)';
    ctx.fillRect(px, py, pw, 3);
  }

  for (const [hx, hy, hw, hh] of (L.hazards || [])) {
    ctx.fillStyle = '#03060d';
    ctx.fillRect(hx, hy - 4, hw, hh + 4);
    const n = Math.floor(hw / 6);
    for (let i = 0; i < n; i++) {
      const sx = hx + Math.random() * hw;
      const sy = hy - 4 + Math.random() * (hh + 8);
      ctx.fillStyle = `rgba(210, 220, 235, ${0.2 + Math.random() * 0.55})`;
      ctx.fillRect(sx, sy, 2, 2);
    }
  }

  for (const cp of L.checkpoints) {
    const active = game.checkpoint.x === cp.x;
    ctx.fillStyle = active ? 'rgba(157,184,224,0.85)' : 'rgba(157,184,224,0.25)';
    ctx.fillRect(cp.x - 2, cp.y - 20, 4, 100);
  }

  const e = L.exit;
  const pulse = 0.55 + 0.25 * Math.sin(performance.now() / 400);
  ctx.fillStyle = `rgba(223,232,245,${pulse})`; ctx.fillRect(e.x, e.y, e.w, e.h);

  ctx.fillStyle = '#9db8e0';
  for (const p of particles) {
    ctx.globalAlpha = 1 - p.t / p.life;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;

  drawPlayer();
  ctx.restore();
  // --- END CINEMATIC VIEW MATRIX ---

  const gm = game.level.mood;
  if (gm && gm.grade) { ctx.fillStyle = gm.grade; ctx.fillRect(0, 0, W, H); }
  if (gm && gm.darken) { ctx.fillStyle = `rgba(4, 6, 14, ${gm.darken})`; ctx.fillRect(0, 0, W, H); }

  ctx.fillStyle = 'rgba(157,184,224,0.4)';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${game.level.subtitle} — ${game.level.name}`, 14, H - 16);

  if (game.state === 'FADE' || game.fade > 0) {
    ctx.fillStyle = `rgba(5, 9, 15, ${game.fade})`; ctx.fillRect(0, 0, W, H);
  }
}

function renderEnd() {
  ctx.fillStyle = 'rgba(5, 9, 15, 0.95)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.fillStyle = '#dfe8f5'; ctx.font = '30px Georgia, serif';
  ctx.fillText('TO BE CONTINUED', W / 2, H * 0.4);
  ctx.fillStyle = 'rgba(223,232,245,0.75)'; ctx.font = '15px Georgia, serif';
  const line = game.deaths === 0 ? 'He fell zero times. He suspects this means nothing.' : `He fell ${game.deaths} times. He kept the suit clean anyway.`;
  ctx.fillText(line, W / 2, H * 0.4 + 40);
}

function renderStory() {
  ctx.fillStyle = 'rgba(5, 9, 15, 0.7)'; ctx.fillRect(0, 0, W, H);
  const L = game.level;
  ctx.textAlign = 'center'; ctx.fillStyle = '#9db8e0'; ctx.font = '14px Georgia, serif';
  ctx.fillText(L.subtitle, W / 2, H * 0.32);
  ctx.fillStyle = '#dfe8f5'; ctx.font = '34px Georgia, serif';
  ctx.fillText(L.name, W / 2, H * 0.32 + 44);
  ctx.font = '16px Georgia, serif'; ctx.fillStyle = 'rgba(223,232,245,0.85)';
  for (let i = 0; i < game.storyLine; i++) ctx.fillText(L.story[i], W / 2, H * 0.5 + i * 30);
}

// Fixed Parallax rendering equation taking full camera coordinate systems into calculations
function layer(img, ok, p, hFrac, gap = 1) {
  if (!ok) return;
  const lh = H * hFrac;
  const lw = img.width * (lh / img.height);
  const span = lw * gap;
  
  // Track X offset with a stabilizing loop structure
  let xOffset = -((cam.x * p) % span);
  if (xOffset > 0) xOffset -= span;
  
  // Calculate relative vertical camera shifts so background tracks jumping
  const groundZero = H - lh;
  const targetY = groundZero - (cam.y - 500) * (p * 0.4);

  for (let x = xOffset; x < W; x += span) {
    ctx.drawImage(img, x, targetY, lw, lh);
  }
}

function fogDrift() {
  const t = performance.now() / 1000;
  for (let i = 0; i < 3; i++) {
    const fx = ((t * (8 + i * 5) + i * 700) % (W + 800)) - 400;
    const fy = H * (0.45 + i * 0.16) - (cam.y - 500) * 0.1;
    const r = 260 + i * 90;
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, r);
    g.addColorStop(0, 'rgba(140, 160, 185, 0.06)'); g.addColorStop(1, 'rgba(140, 160, 185, 0)');
    ctx.fillStyle = g; ctx.fillRect(fx - r, fy - r, r * 2, r * 2);
  }
}

function lightShafts() {
  const t = performance.now() / 1000;
  ctx.save();
  for (let i = 0; i < 2; i++) {
    const baseX = W * (0.25 + i * 0.45) - (cam.x * 0.05) % W;
    const a = 0.02 + 0.015 * Math.sin(t * 0.3 + i * 2);
    ctx.fillStyle = `rgba(220, 230, 245, ${Math.max(0, a)})`;
    ctx.beginPath(); ctx.moveTo(baseX, -20); ctx.lineTo(baseX + 130, -20);
    ctx.lineTo(baseX + 280, H); ctx.lineTo(baseX + 60, H); ctx.closePath(); ctx.fill();
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
  ctx.scale(player.dir, 1);
  if (spriteReady) {
    ctx.shadowColor = 'rgba(157, 184, 224, 0.45)';
    ctx.shadowBlur = 12;
    const yOff = drawH * SHEET.feetPad / SHEET.ch;
    ctx.drawImage(sprite, player.frame * SHEET.cw, 0, SHEET.cw, SHEET.ch, -drawW / 2, -drawH + yOff, drawW, drawH);
  } else {
    ctx.fillStyle = '#05090f'; ctx.fillRect(-player.w / 2, -player.h, player.w, player.h);
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

loadLevel(0);
requestAnimationFrame(loop);
