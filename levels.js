// ============================================================
// MIND IN MOTION — levels.js (Complete 16-Chapter Campaign Matrix)
// Platforms: [x, y, width, height] · Hazards: [x, y, width, height]
// Springs: [x, y, width, height, velocityBoost]
// Enemies: { x, y, minX, maxX, speed, dir, w, h, type: 'patrol'|'stalker' }
// Spawners: { x, y, vx, vy, rate } (Ninja Star Projectile Launchers)
// ============================================================

const LEVELS = [
  {
    name: "STATIC", subtitle: "CHAPTER I",
    mood: { veil: [105, 125, 148], grade: "rgba(120, 135, 155, 0.05)", darken: 0 },
    story: ["He woke up in a suit he didn't remember buying.", "Nothing moved here. Not even his doubts.", "So he did the only reasonable thing. He ran."],
    width: 7200, bottom: 900, spawn: { x: 140, y: 540 },
    checkpoints: [{ x: 2950, y: 560 }, { x: 6150, y: 560 }],
    exit: { x: 7060, y: 520, w: 40, h: 120 }, springs: [],
    enemies: [
      { x: 3100, y: 590, minX: 2900, maxX: 3400, speed: 90, dir: 1, w: 26, h: 50, type: 'patrol' },
      { x: 6400, y: 590, minX: 6150, maxX: 6800, speed: 100, dir: 1, w: 26, h: 50, type: 'patrol' }
    ],
    platforms: [
      [0, 640, 1100, 260], [1240, 640, 500, 260], [1900, 640, 420, 260], [2320, 560, 180, 26], [2560, 470, 180, 26],
      [2840, 640, 700, 260], [3640, 560, 160, 26], [3900, 470, 160, 26], [4160, 400, 900, 26], [5160, 640, 800, 260],
      [6080, 640, 1120, 260], [-40, 200, 40, 640], [7200, 0, 40, 840]
    ],
    hazards: [[5300, 632, 140, 8], [5560, 632, 160, 8], [6240, 632, 180, 8], [6560, 632, 140, 8]]
  },
  {
    name: "DOUBT", subtitle: "CHAPTER II",
    mood: { veil: [88, 92, 130], grade: "rgba(60, 55, 110, 0.12)", darken: 0.10 },
    story: ["The ground felt less certain here.", "Every platform asked him: are you sure?", "He wasn't. He jumped anyway."],
    width: 8400, bottom: 900, spawn: { x: 110, y: 540 },
    checkpoints: [{ x: 1600, y: 480 }, { x: 2820, y: 400 }, { x: 4050, y: 340 }, { x: 6500, y: 160 }],
    exit: { x: 8240, y: 120, w: 40, h: 120 }, springs: [],
    enemies: [
      { x: 4960, y: 250, minX: 4960, maxX: 5300, speed: 85, dir: 1, w: 26, h: 50, type: 'patrol' },
      { x: 7700, y: 190, minX: 7620, maxX: 8100, speed: 120, dir: -1, w: 26, h: 50, type: 'patrol' }
    ],
    platforms: [
      [0, 640, 520, 260], [640, 580, 130, 22], [860, 520, 130, 22], [1080, 580, 130, 22], [1300, 500, 130, 22],
      [1520, 560, 200, 22], [1840, 480, 130, 22], [2060, 420, 130, 22], [2280, 480, 130, 22], [2500, 540, 130, 22],
      [2720, 480, 220, 22], [3060, 420, 130, 22], [3280, 360, 130, 22], [3500, 420, 130, 22], [3720, 480, 130, 22],
      [3940, 420, 240, 22], [4300, 360, 130, 22], [4520, 300, 130, 22], [4740, 360, 130, 22], [4960, 300, 400, 22],
      [5480, 360, 130, 22], [5700, 300, 130, 22], [5920, 240, 130, 22], [6140, 300, 130, 22], [6360, 240, 460, 22],
      [6940, 300, 130, 22], [7160, 240, 130, 22], [7380, 180, 130, 22], [7600, 240, 800, 22], [-40, 200, 40, 640], [8400, 0, 40, 840]
    ],
    hazards: [[2300, 472, 90, 8], [5080, 292, 120, 8], [6600, 232, 100, 8]]
  },
  {
    name: "MOMENTUM", subtitle: "CHAPTER III",
    mood: { veil: [165, 85, 85], grade: "rgba(185, 65, 65, 0.07)", darken: 0.05 },
    story: ["Anger is a curious engine.", "It provides weight where there was only emptiness.", "He stopped calculating the distance. He accelerated."],
    width: 7800, bottom: 900, spawn: { x: 150, y: 500 },
    checkpoints: [{ x: 3200, y: 500 }, { x: 5600, y: 440 }],
    exit: { x: 7350, y: 440, w: 40, h: 120 }, springs: [],
    enemies: [
      { x: 3300, y: 550, minX: 2900, maxX: 4100, speed: 140, dir: 1, w: 26, h: 50, type: 'stalker' },
      { x: 6200, y: 490, minX: 5800, maxX: 6900, speed: 160, dir: -1, w: 26, h: 50, type: 'patrol' }
    ],
    platforms: [
      [0, 600, 1400, 300], [1650, 560, 280, 30], [2150, 500, 350, 30],
      [2700, 600, 1800, 300], [4800, 480, 250, 30], [5350, 540, 2100, 360], [7450, 0, 40, 900]        
    ],
    hazards: [[700, 592, 260, 8], [3400, 592, 280, 8], [5700, 532, 240, 8], [6600, 532, 220, 8]]
  },
  {
    name: "ISOLATION", subtitle: "CHAPTER IV",
    mood: { veil: [55, 90, 90], grade: "rgba(35, 95, 95, 0.12)", darken: 0.25 },
    story: ["The architecture grew massive, cold, and quiet.", "The sky pulled back.", "He was entirely alone. He became very small."],
    width: 8800, bottom: 1200, spawn: { x: 150, y: 700 },
    checkpoints: [{ x: 3250, y: 560 }, { x: 6900, y: 810 }],
    exit: { x: 8500, y: 700, w: 40, h: 120 },
    springs: [[2120, 846, 80, 6, 1250], [5750, 796, 80, 6, 1200]],
    enemies: [
      { x: 4700, y: 600, minX: 4450, maxX: 5100, speed: 110, dir: 1, w: 26, h: 50, type: 'patrol' },
      { x: 7400, y: 850, minX: 6900, maxX: 8200, speed: 150, dir: 1, w: 26, h: 50, type: 'stalker' }
    ],
    platforms: [
      [0, 800, 900, 400], [1300, 900, 500, 40], [2100, 850, 120, 400],
      [2650, 750, 120, 500], [3100, 650, 2200, 600], [5700, 800, 700, 40],
      [6750, 900, 1900, 300], [8650, 0, 40, 1200]
    ],
    hazards: [[3450, 642, 220, 8], [4100, 642, 220, 8], [7100, 892, 200, 8], [7600, 892, 200, 8]]
  },
  {
    name: "CLARITY", subtitle: "CHAPTER V",
    mood: { veil: [220, 230, 240], grade: "rgba(245, 225, 225, 0.15)", darken: 0 },
    story: ["The static cleared from the air.", "There was nothing left to escape.", "He stepped out of the cage of his own head."],
    width: 5200, bottom: 900, spawn: { x: 200, y: 500 },
    checkpoints: [{ x: 200, y: 500 }, { x: 2550, y: 320 }],
    exit: { x: 4850, y: 380, w: 40, h: 120 }, springs: [], enemies: [],                             
    platforms: [
      [0, 600, 1200, 300], [1450, 540, 350, 30], [2000, 480, 350, 30],
      [2550, 420, 900, 500], [3650, 450, 350, 30], [4200, 500, 1000, 400]
    ],
    hazards: []                             
  },
  {
    name: "RESILIENCE", subtitle: "CHAPTER VI",
    mood: { veil: [140, 110, 170], grade: "rgba(140, 90, 180, 0.10)", darken: 0.12 },
    story: ["Acceptance didn't mean the shadows vanished.", "It meant he learned how to glide past them.", "The walls were tall. He bounced higher."],
    width: 7600, bottom: 1000, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 2700, y: 540 }, { x: 5200, y: 640 }],
    exit: { x: 7300, y: 500, w: 40, h: 120 },
    springs: [[1400, 796, 60, 6, 1150], [2200, 796, 60, 6, 1200], [4800, 696, 60, 6, 1300]],
    enemies: [
      { x: 3600, y: 550, minX: 3200, maxX: 4000, speed: 150, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 5500, y: 650, minX: 5200, maxX: 6200, speed: 130, dir: 1, w: 26, h: 50, type: 'stalker' }
    ],
    platforms: [
      [0, 700, 1200, 300], [1400, 800, 60, 200], [1800, 650, 300, 40],
      [2200, 800, 60, 200], [2600, 600, 1400, 400], [4300, 750, 300, 40],
      [4800, 700, 60, 300], [5100, 700, 2200, 300], [7500, 0, 40, 1000]
    ],
    hazards: [[400, 692, 260, 8], [2800, 592, 280, 8], [5400, 692, 240, 8], [6060, 692, 240, 8]]
  },

  // ============================================================
  // BRAND NEW ARC — THE COSMIC OVERGROWTH DIMENSION
  // ============================================================
  {
    name: "THE CRYSTAL SECTOR", subtitle: "CHAPTER VII",
    mood: { isCosmic: true },
    story: ["He stepped across a threshold of pure geometry.", "The sky behind him dissolved into infinite space.", "Something fast and mechanical hummed in the shadows."],
    width: 7600, bottom: 950, spawn: { x: 150, y: 550 },
    checkpoints: [{ x: 3400, y: 550 }], exit: { x: 7350, y: 400, w: 40, h: 120 },
    springs: [[2400, 750, 80, 8, 1250]], enemies: [],
    spawners: [
      { x: 2200, y: 350, vx: -420, vy: 0, rate: 2.1 },
      { x: 4800, y: 250, vx: -380, vy: 80, rate: 1.8 }
    ],
    platforms: [
      [0, 650, 1300, 300], [1500, 700, 700, 250], [2400, 754, 80, 100],
      [2700, 600, 500, 350], [3400, 650, 900, 300], [4600, 500, 800, 450], [5800, 550, 1500, 400]
    ],
    hazards: [[1300, 940, 200, 10], [3700, 642, 300, 8]]
  },
  {
    name: "SHATTERED STARFIELD", subtitle: "CHAPTER VIII",
    mood: { isCosmic: true },
    story: ["The platforms floated without gravity or stone anchors.", "Ancient towers hung inverted over empty space.", "The stars generated cross-currents of velocity."],
    width: 8200, bottom: 1000, spawn: { x: 160, y: 450 },
    checkpoints: [{ x: 2900, y: 400 }], exit: { x: 7950, y: 300, w: 40, h: 120 },
    springs: [[4200, 650, 70, 6, 1350]], enemies: [],
    spawners: [
      { x: 3500, y: 200, vx: -400, vy: 100, rate: 1.5 },
      { x: 6000, y: 150, vx: -500, vy: 0, rate: 1.2 }
    ],
    platforms: [
      [0, 550, 1000, 450], [1200, 650, 400, 50], [1800, 500, 300, 500],
      [2300, 450, 500, 550], [2900, 500, 1000, 500], [4100, 700, 300, 50],
      [5000, 450, 2400, 550]
    ],
    hazards: [[1000, 990, 200, 10], [5700, 442, 350, 8]]
  },
  {
    name: "RUNED THICKETS", subtitle: "CHAPTER IX",
    mood: { isCosmic: true },
    story: ["Glowing matrices carved safe paths across the abyss.", "The silhouette character timed his strides perfectly.", "One mistep meant interception by kinetic arrays."],
    width: 7800, bottom: 900, spawn: { x: 120, y: 500 },
    checkpoints: [{ x: 5100, y: 400 }], exit: { x: 7550, y: 350, w: 40, h: 120 },
    springs: [], enemies: [],
    spawners: [
      { x: 1800, y: 300, vx: -350, vy: 50, rate: 2.0 },
      { x: 4000, y: 200, vx: -450, vy: 0, rate: 1.4 },
      { x: 6800, y: 250, vx: -400, vy: -50, rate: 1.7 }
    ],
    platforms: [
      [0, 600, 900, 300], [1050, 600, 800, 300], [2000, 520, 450, 380],
      [2600, 550, 1800, 350], [4700, 500, 1200, 400], [6200, 450, 1500, 450]
    ],
    hazards: [[900, 890, 150, 10], [4900, 492, 500, 8]]
  },
  {
    name: "ECLIPSE OF MONOLITHS", subtitle: "CHAPTER X",
    mood: { isCosmic: true },
    story: ["Giant vertical shards hummed with geometric power.", "The overgrowth was alive, neon, and defensive.", "He accelerated beneath cross-firing streams."],
    width: 8400, bottom: 950, spawn: { x: 150, y: 550 },
    checkpoints: [{ x: 3000, y: 500 }], exit: { x: 8150, y: 400, w: 40, h: 120 },
    springs: [[2100, 700, 60, 6, 1400]], enemies: [],
    spawners: [
      { x: 2800, y: 250, vx: -460, vy: 0, rate: 1.3 },
      { x: 5500, y: 150, vx: -400, vy: 120, rate: 1.6 }
    ],
    platforms: [
      [0, 660, 1200, 290], [1350, 600, 250, 40], [1700, 540, 250, 40],
      [2100, 706, 60, 100], [2300, 480, 500, 470], [2900, 600, 2500, 350],
      [5800, 550, 2600, 400]
    ],
    hazards: [[1200, 940, 150, 10], [6200, 542, 500, 8]]
  },
  {
    name: "COSMIC GAUNTLET", subtitle: "CHAPTER XI",
    mood: { isCosmic: true },
    story: ["The density of weapon fire increased exponentially.", "Velocity vectors overlapped from multiple coordinates.", "Keep moving forward. Do not look down."],
    width: 7400, bottom: 900, spawn: { x: 140, y: 500 },
    checkpoints: [{ x: 2800, y: 400 }], exit: { x: 7100, y: 350, w: 40, h: 120 },
    springs: [], enemies: [],
    spawners: [
      { x: 2000, y: 100, vx: -380, vy: 150, rate: 1.1 },
      { x: 3500, y: 150, vx: -450, vy: 0, rate: 0.9 },
      { x: 5000, y: 200, vx: -400, vy: -50, rate: 1.2 }
    ],
    platforms: [
      [0, 600, 1100, 300], [1250, 520, 200, 30], [1600, 440, 200, 30],
      [1950, 550, 2500, 350], [4700, 500, 2700, 400]
    ],
    hazards: [[1100, 890, 150, 10], [5000, 492, 600, 8]]
  },
  {
    name: "SHURIKEN GAUNTLET", subtitle: "CHAPTER XII",
    mood: { isCosmic: true },
    story: ["A vertical grid of launchers blocked the horizon.", "The kinetic stars spun at high angular frequency.", "Slide under the apex of the curve."],
    width: 8000, bottom: 950, spawn: { x: 150, y: 550 },
    checkpoints: [{ x: 3100, y: 500 }], exit: { x: 7750, y: 350, w: 40, h: 120 },
    springs: [[2200, 700, 80, 8, 1300]], enemies: [],
    spawners: [
      { x: 2500, y: 300, vx: -480, vy: 0, rate: 0.85 },
      { x: 4500, y: 200, vx: -400, vy: 100, rate: 1.1 },
      { x: 6500, y: 150, vx: -520, vy: 0, rate: 0.75 }
    ],
    platforms: [
      [0, 650, 1300, 300], [1450, 600, 300, 40], [1900, 520, 250, 40],
      [2200, 706, 80, 100], [2450, 480, 2000, 470], [4800, 420, 3200, 530]
    ],
    hazards: [[1300, 940, 150, 10], [5600, 492, 400, 8]]
  },
  {
    name: "HORIZON VECTOR", subtitle: "CHAPTER XIII",
    mood: { isCosmic: true },
    story: ["The architecture dissolved cleanly into stardust.", "Only gravity anchors and floating pathways remained.", "Rhythm is your weapon against the grid."],
    width: 7600, bottom: 900, spawn: { x: 130, y: 500 },
    checkpoints: [{ x: 2900, y: 400 }], exit: { x: 7350, y: 350, w: 40, h: 120 },
    springs: [[1500, 650, 70, 6, 1380]], enemies: [],
    spawners: [
      { x: 3000, y: 200, vx: -430, vy: 80, rate: 1.2 },
      { x: 5200, y: 100, vx: -480, vy: 0, rate: 0.95 }
    ],
    platforms: [
      [0, 600, 1000, 300], [1150, 650, 200, 40], [1500, 656, 70, 50],
      [1750, 500, 2500, 400], [4500, 606, 3100, 450]
    ],
    hazards: [[1000, 890, 150, 10], [5100, 442, 600, 8]]
  },
  {
    name: "GRAVITY VOID", subtitle: "CHAPTER XIV",
    mood: { isCosmic: true },
    story: ["The atmospheric pressure hummed like a generator chord.", "Multiple vertical cascades intersecting without friction.", "The final approach to the core landscape."],
    width: 8600, bottom: 950, spawn: { x: 150, y: 550 },
    checkpoints: [{ x: 3200, y: 450 }], exit: { x: 8350, y: 350, w: 40, h: 120 },
    springs: [[2200, 700, 80, 8, 1420]], enemies: [],
    spawners: [
      { x: 2800, y: 150, vx: -550, vy: 50, rate: 0.7 },
      { x: 5500, y: 250, vx: -460, vy: -50, rate: 0.8 }
    ],
    platforms: [
      [0, 650, 1200, 300], [1350, 580, 300, 40], [1800, 500, 250, 40],
      [2200, 706, 80, 100], [2450, 450, 3500, 500], [6000, 500, 2600, 450]
    ],
    hazards: [[1200, 940, 150, 10], [6200, 492, 700, 8]]
  },
  {
    name: "ABYSSAL CHREOD", subtitle: "CHAPTER XV",
    mood: { isCosmic: true },
    story: ["Every spatial vector converged into one point.", "A firing patterns tracking perfectly with his movements.", "Dodge, leap, and transcend the matrix structure."],
    width: 7400, bottom: 900, spawn: { x: 140, y: 500 },
    checkpoints: [{ x: 3000, y: 400 }], exit: { x: 7100, y: 350, w: 40, h: 120 },
    springs: [], enemies: [],
    spawners: [
      { x: 2000, y: 150, vx: -400, vy: 100, rate: 0.65 },
      { x: 4000, y: 100, vx: -500, vy: 0, rate: 0.55 },
      { x: 6000, y: 200, vx: -450, vy: -100, rate: 0.6 }
    ],
    platforms: [
      [0, 600, 2000, 300], [2400, 500, 2000, 400], [4800, 450, 2600, 450]
    ],
    hazards: [[2000, 890, 400, 10]]
  },
  {
    name: "TRANSCENDENCE", subtitle: "CHAPTER XVI",
    mood: { isCosmic: true, isFinale: true },
    story: ["The artillery fell completely silent as he reached the core.", "The starfield opened up into absolute, perfect clarity.", "He kept the suit clean anyway. He crossed over."],
    width: 4800, bottom: 900, spawn: { x: 200, y: 500 },
    checkpoints: [], exit: { x: 4450, y: 380, w: 40, h: 120 },
    springs: [], enemies: [], spawners: [],
    platforms: [
      [0, 600, 1500, 300], [1750, 540, 400, 30], [2350, 480, 400, 30], [2950, 420, 1900, 480]
    ],
    hazards: []
  }
];
