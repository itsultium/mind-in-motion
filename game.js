// ============================================================
// MIND IN MOTION — game.js (Stage 2: level system)
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
sprite.src = 'assets/bruder_run_sheet.png';
let spriteReady = false;
sprite.onload = () => spriteReady = true;

// ---------- background layers ----------
const bg = {
  sky: new Image(), hills: new Image(), mono: new Image(),
  ruins: new Image(), debris: new Image(), occl: new Image(),
  skyOk: false, hillsOk: false, monoOk: false,
  ruinsOk: false, debrisOk: false, occlOk: false
};
bg.sky.src = 'assets/bg_sky.jpg';      bg.sky.onload = () => bg.skyOk = true;
bg.hills.src = 'assets/bg_hills.png';  bg.hills.onload = () => bg.hillsOk = true;
bg.mono.src = 'assets/bg_monoliths.png'; bg.mono.onload = () => bg.monoOk = true;
bg.ruins.src = 'assets/bg_ruins.png';  bg.ruins.onload = () => bg.ruinsOk = true;
bg.debris.src = 'assets/bg_debris.png'; bg.debris.onload = () => bg.debrisOk = true;
bg.occl.src = 'assets/bg_occl_thin.png'; bg.occl.onload = () => bg.occlOk = true;
bg.shard = new Image(); bg.shardOk = false;
bg.shard.src = 'assets/bg_occl_shard.png'; bg.shard.onload = () => bg.shardOk = true;

// ---------- physics ----------
const PHYS = {
  gravity: 2300, moveAccel: 2800, airAccel: 1800, friction: 2200,
  maxSpeed: 380, jumpVel: -800, jumpCut: 0.45,
  coyoteTime: 0.10, jumpBuffer: 0.12, maxFall: 1100
};

// ---------- game state ----------
const game = {
  state: 'STORY',          // STORY | PLAY | FADE
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

function loadLevel(i) {
  game.levelIndex = i;
  game.level = LEVELS[i];
  game.checkpoint = { ...game.level.spawn };
  game.state = 'STORY';
  game.storyLine = 0;
  game.storyTimer = 0;
  game.fade = 0;
  respawn();
}

function respawn() {
  player.x = game.checkpoint.x;
  player.y = game.checkpoint.y;
  player.vx = 0; player.vy = 0;
  cam.x = player.x; cam.y = player.y;
}

// ---------- input ----------
const keys = { left: false, right: false };
let jumpHeld = false;

// ---------- ambient audio (Web Audio, no files) ----------
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

    // two detuned low drones + a soft fifth above
    [[55, 'sine', 0.5], [55.6, 'sine', 0.5], [110.4, 'triangle', 0.12]].forEach(([f, type, g]) => {
      const o = ac.createOscillator();
      o.type = type; o.frequency.value = f;
      const og = ac.createGain(); og.gain.value = g;
      o.connect(og); og.connect(lp); o.start();
    });

    // wind: looped noise through a wandering bandpass
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

    // very slow swell on the whole bed
    const swell = ac.createOscillator();
    swell.frequency.value = 0.04;
    const swellG = ac.createGain(); swellG.gain.value = 0.03;
    swell.connect(swellG); swellG.connect(master.gain); swell.start();

    audio = { ac, master };
  } catch (e) { /* audio unsupported: stay silent */ }
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
  // story card: any input moves on
  if (game.state === 'STORY') {
    if (game.storyLine < game.level.story.length) {
      game.storyLine = game.level.story.length;   // reveal all
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
  el.addEventListener('touchstart', e => { setKey(code, true); e.preventDefault(); });
  el.addEventListener('touchend',   e => { setKey(code, false); e.preventDefault(); });
}
bindBtn('btnL', 'ArrowLeft');
bindBtn('btnR', 'ArrowRight');
bindBtn('btnJ', 'Space');
canvas.addEventListener('touchstart', () => anyKeyAdvance());

// ---------- camera & particles ----------
const cam = { x: 0, y: 0 };
const particles = [];
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
    const due = Math.floor(game.storyTimer / 1.4);   // one line per 1.4s
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

  // checkpoints: activate on proximity
  for (const cp of L.checkpoints) {
    if (Math.abs(player.x - cp.x) < 30 && Math.abs(player.y - cp.y) < 90 && game.checkpoint.x !== cp.x) {
      game.checkpoint = { ...cp };
      dust(cp.x, cp.y + 80, 14, 80);
    }
  }

  // hazards: fields of frozen static
  for (const [hx, hy, hw, hh] of (L.hazards || [])) {
    if (overlap(player.x, player.y, player.w, player.h, hx, hy - 6, hw, hh + 6)) {
      game.deaths++;
      dust(player.x + player.w / 2, player.y + player.h / 2, 16, 240);
      respawn();
      return;
    }
  }

  // exit
  const e = L.exit;
  if (overlap(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
    game.state = 'FADE';
  }

  // death by falling
  if (player.y > L.bottom) { game.deaths++; respawn(); }

  // animation
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

  // camera
  const look = player.dir * 60;
  cam.x += ((player.x + player.w / 2 + look) - cam.x) * Math.min(1, dt * 5);
  cam.y += ((player.y + player.h / 2 - 40) - cam.y) * Math.min(1, dt * 3.5);
  cam.x = Math.max(W / 2, Math.min(L.width - W / 2, cam.x));
  cam.y = Math.min(L.bottom - H / 2 + 100, cam.y);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.t += dt;
    if (p.t > p.life) { particles.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt;
  }
}

// ---------- render ----------
function render() {
  // sky layer (image cover, gradient fallback)
  if (bg.skyOk) {
    const s = Math.max(W / bg.sky.width, H / bg.sky.height);
    const sw = bg.sky.width * s, sh = bg.sky.height * s;
    ctx.drawImage(bg.sky, (W - sw) / 2, (H - sh) / 2, sw, sh);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#16244a');
    g.addColorStop(0.55, '#27407a');
    g.addColorStop(1, '#3a5fa8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  if (game.state === 'STORY') { renderStory(); return; }
  if (game.state === 'END') { renderEnd(); return; }

  // ---- depth stack: far to near, fog veil between each ----
  layer(bg.hills, bg.hillsOk, 0.18, 0.58);
  ctx.fillStyle = 'rgba(105, 125, 148, 0.24)';
  ctx.fillRect(0, 0, W, H);
  layer(bg.ruins, bg.ruinsOk, 0.30, 0.34);
  ctx.fillStyle = 'rgba(98, 118, 140, 0.16)';
  ctx.fillRect(0, 0, W, H);
  layer(bg.mono, bg.monoOk, 0.45, 0.66);
  ctx.fillStyle = 'rgba(90, 110, 132, 0.07)';
  ctx.fillRect(0, 0, W, H);
  fogDrift();
  lightShafts();
  layer(bg.debris, bg.debrisOk, 0.70, 0.20);
  // the big shard: dramatic near-background, behind all gameplay
  layer(bg.shard, bg.shardOk, 0.85, 0.92, 2.6);
  // thin spikes: nearest background, still behind every platform
  layer(bg.occl, bg.occlOk, 0.92, 1.04, 2.2);
  if (!bg.hillsOk) { hill(0.3, '#16294f', 0.85, 240); hill(0.55, '#101e3c', 0.95, 160); }

  ctx.save();
  ctx.translate(W / 2 - cam.x, H / 2 - cam.y);

  const L = game.level;
  for (const [px, py, pw, ph] of L.platforms) {
    ctx.fillStyle = '#070d1c';
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = 'rgba(157,184,224,0.25)';
    ctx.fillRect(px, py, pw, 3);
  }

  // hazards: flickering static
  for (const [hx, hy, hw, hh] of (L.hazards || [])) {
    ctx.fillStyle = '#05080f';
    ctx.fillRect(hx, hy - 4, hw, hh + 4);
    const n = Math.floor(hw / 7);
    for (let i = 0; i < n; i++) {
      const sx = hx + Math.random() * hw;
      const sy = hy - 4 + Math.random() * (hh + 8);
      const a = 0.25 + Math.random() * 0.55;
      ctx.fillStyle = `rgba(210, 220, 235, ${a})`;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.fillStyle = 'rgba(210, 220, 235, 0.05)';
    ctx.fillRect(hx, hy - 22, hw, 22);
  }

  // checkpoints: thin standing light
  for (const cp of L.checkpoints) {
    const active = game.checkpoint.x === cp.x;
    ctx.fillStyle = active ? 'rgba(157,184,224,0.9)' : 'rgba(157,184,224,0.3)';
    ctx.fillRect(cp.x - 2, cp.y - 20, 4, 100);
    if (active) {
      ctx.fillStyle = 'rgba(157,184,224,0.15)';
      ctx.beginPath();
      ctx.arc(cp.x, cp.y + 30, 26, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // exit: doorway of light
  const e = L.exit;
  const pulse = 0.55 + 0.25 * Math.sin(performance.now() / 400);
  ctx.fillStyle = `rgba(223,232,245,${pulse})`;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = 'rgba(223,232,245,0.12)';
  ctx.fillRect(e.x - 14, e.y - 14, e.w + 28, e.h + 28);

  ctx.fillStyle = '#9db8e0';
  for (const p of particles) {
    ctx.globalAlpha = 1 - p.t / p.life;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;

  drawPlayer();
  ctx.restore();

  // level name, small, top corner
  ctx.fillStyle = 'rgba(157,184,224,0.5)';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${game.level.subtitle} — ${game.level.name}`, 14, H - 16);

  if (game.state === 'FADE' || game.fade > 0) {
    ctx.fillStyle = `rgba(5, 9, 15, ${game.fade})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function renderEnd() {
  ctx.fillStyle = 'rgba(5, 9, 15, 0.92)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#dfe8f5';
  ctx.font = '30px Georgia, serif';
  ctx.fillText('TO BE CONTINUED', W / 2, H * 0.4);
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

// draw an image layer tiled horizontally with parallax, anchored to screen bottom
// p = parallax factor, hFrac = height as fraction of screen, gap = tile spacing multiplier
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

// soft fog patches drifting slowly, independent of camera
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

// faint diagonal light from above, breathing slowly
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

function hill(speed, color, alpha, height) {
  const shift = (cam.x * speed) % 600;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-600 - shift, H);
  for (let x = -600; x <= W + 600; x += 300) {
    const px = x - shift;
    ctx.quadraticCurveTo(px + 150, H - height - 40 * Math.sin(x * 0.01), px + 300, H - height + 50);
  }
  ctx.lineTo(W + 600, H);
  ctx.closePath();
  ctx.fill();
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

loadLevel(0);
requestAnimationFrame(loop);
