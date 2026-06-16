// ============================================================
// MIND IN MOTION — levels.js (Complete 40-Chapter Matrix)
// Platforms: [x, y, width, height]
// Hazards: [x, y, width, height]
// Springs: [x, y, width, height, velocityBoost]
// Enemies: { x, y, minX, maxX, speed, dir, w, h, type }
//   types: 'patrol' | 'stalker' | 'sentinel' | 'charger' | 'ninja'
// ============================================================

const LEVELS = [

  // ============================================================
  // CHAPTERS I–VI — THE ORIGINAL WORLD
  // ============================================================
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
      [0, 640, 1100, 260], [1240, 640, 500, 260], [1900, 640, 420, 260],
      [2320, 560, 180, 26], [2560, 470, 180, 26], [2840, 640, 700, 260],
      [3640, 560, 160, 26], [3900, 470, 160, 26], [4160, 400, 900, 26],
      [5160, 640, 800, 260], [6080, 640, 1120, 260],
      [-40, 200, 40, 640], [7200, 0, 40, 840]
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
      [0, 640, 520, 260], [640, 580, 130, 22], [860, 520, 130, 22], [1080, 580, 130, 22],
      [1300, 500, 130, 22], [1520, 560, 200, 22], [1840, 480, 130, 22], [2060, 420, 130, 22],
      [2280, 480, 130, 22], [2500, 540, 130, 22], [2720, 480, 220, 22], [3060, 420, 130, 22],
      [3280, 360, 130, 22], [3500, 420, 130, 22], [3720, 480, 130, 22], [3940, 420, 240, 22],
      [4300, 360, 130, 22], [4520, 300, 130, 22], [4740, 360, 130, 22], [4960, 300, 400, 22],
      [5480, 360, 130, 22], [5700, 300, 130, 22], [5920, 240, 130, 22], [6140, 300, 130, 22],
      [6360, 240, 460, 22], [6940, 300, 130, 22], [7160, 240, 130, 22], [7380, 180, 130, 22],
      [7600, 240, 800, 22], [-40, 200, 40, 640], [8400, 0, 40, 840]
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
      [2700, 600, 1800, 300], [4800, 480, 250, 30], [5350, 540, 2100, 360],
      [7450, 0, 40, 900]
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
    checkpoints: [{ x: 2550, y: 380 }],
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
  // CHAPTERS VII–XIX — THE BEYOND (Bioluminescent Dimension)
  // ============================================================
  {
    name: "THRESHOLD", subtitle: "CHAPTER VII",
    mood: { isBeyond: true },
    story: ["The world he knew collapsed behind him.", "Something ancient and alive waited on the other side.", "He didn't understand it. He ran toward it anyway."],
    width: 7400, bottom: 1000, spawn: { x: 160, y: 620 },
    checkpoints: [{ x: 3200, y: 560 }],
    exit: { x: 6880, y: 440, w: 40, h: 120 },
    springs: [[2000, 796, 70, 6, 1200]],
    enemies: [
      { x: 1800, y: 650, minX: 1400, maxX: 2400, speed: 110, dir: 1, w: 26, h: 50, type: 'patrol' },
      { x: 4200, y: 570, minX: 3800, maxX: 4800, speed: 90, dir: -1, w: 26, h: 50, type: 'patrol' },
      { x: 5800, y: 500, minX: 5400, maxX: 6200, speed: 100, dir: 1, w: 26, h: 50, type: 'patrol' }
    ],
    platforms: [
      [0, 700, 1000, 300], [1200, 660, 400, 30], [1800, 800, 70, 200],
      [2200, 620, 600, 30], [3000, 600, 800, 350], [4100, 540, 300, 30],
      [4600, 480, 300, 30], [5200, 520, 1800, 420], [7350, 0, 40, 1000]
    ],
    hazards: [[1300, 652, 160, 8], [4700, 472, 180, 8], [5800, 512, 200, 8]]
  },

  {
    name: "FIRST LIGHT", subtitle: "CHAPTER VIII",
    mood: { isBeyond: true },
    story: ["The ruins here glowed from within.", "He had never seen darkness that breathed.", "He kept moving. The light followed."],
    width: 7800, bottom: 1000, spawn: { x: 140, y: 600 },
    checkpoints: [{ x: 2800, y: 520 }, { x: 5600, y: 460 }],
    exit: { x: 7340, y: 380, w: 40, h: 120 },
    springs: [[1600, 746, 70, 6, 1180], [4200, 696, 70, 6, 1220]],
    enemies: [
      { x: 1400, y: 640, minX: 1000, maxX: 2000, speed: 120, dir: 1, w: 26, h: 50, type: 'patrol' },
      { x: 3600, y: 560, minX: 3200, maxX: 4000, speed: 140, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 6200, y: 490, minX: 5800, maxX: 6800, speed: 130, dir: 1, w: 26, h: 50, type: 'patrol' }
    ],
    platforms: [
      [0, 680, 900, 320], [1100, 640, 350, 30], [1600, 750, 70, 250],
      [2100, 580, 500, 30], [2700, 560, 600, 380], [3500, 520, 280, 30],
      [4000, 460, 280, 30], [4200, 700, 70, 300], [4700, 480, 500, 30],
      [5400, 500, 2000, 440], [7600, 0, 40, 1000]
    ],
    hazards: [[1200, 632, 180, 8], [3600, 512, 200, 8], [6000, 492, 220, 8]]
  },

  {
    name: "SENTINELS", subtitle: "CHAPTER IX",
    mood: { isBeyond: true },
    story: ["They stood perfectly still.", "Until he moved.", "Then the air became dangerous."],
    width: 8000, bottom: 1000, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 3400, y: 540 }, { x: 6000, y: 480 }],
    exit: { x: 7440, y: 360, w: 40, h: 120 },
    springs: [[2800, 746, 70, 6, 1200]],
    enemies: [
      { x: 1600, y: 630, minX: 1400, maxX: 1800, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 3200, y: 570, minX: 3000, maxX: 3400, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' },
      { x: 4800, y: 580, minX: 4600, maxX: 5200, speed: 110, dir: 1, w: 26, h: 50, type: 'patrol' },
      { x: 6400, y: 500, minX: 6000, maxX: 6800, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' }
    ],
    platforms: [
      [0, 680, 1000, 320], [1200, 640, 400, 30], [1800, 580, 300, 30],
      [2400, 520, 300, 30], [2800, 750, 70, 250], [3200, 560, 800, 380],
      [4300, 500, 260, 30], [4900, 560, 800, 380], [5900, 480, 1600, 460],
      [7750, 0, 40, 1000]
    ],
    hazards: [[1300, 632, 180, 8], [4000, 512, 200, 8], [6200, 472, 220, 8]]
  },

  {
    name: "THE HUNT", subtitle: "CHAPTER X",
    mood: { isBeyond: true },
    story: ["Something faster appeared in the shadows.", "It didn't patrol. It charged.", "He learned to listen for the sound of acceleration."],
    width: 8200, bottom: 1000, spawn: { x: 150, y: 580 },
    checkpoints: [{ x: 3600, y: 520 }, { x: 6200, y: 460 }],
    exit: { x: 7740, y: 360, w: 40, h: 120 },
    springs: [[1800, 696, 70, 6, 1200], [5000, 646, 70, 6, 1250]],
    enemies: [
      { x: 1400, y: 610, minX: 800, maxX: 2200, speed: 80, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 3200, y: 550, minX: 2600, maxX: 3800, speed: 85, dir: -1, w: 26, h: 50, type: 'charger' },
      { x: 4600, y: 580, minX: 4200, maxX: 5200, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 6400, y: 490, minX: 5800, maxX: 7000, speed: 90, dir: 1, w: 26, h: 50, type: 'charger' }
    ],
    platforms: [
      [0, 660, 1000, 300], [1100, 620, 600, 30], [1800, 700, 70, 300],
      [2400, 560, 500, 30], [3000, 540, 900, 400], [4200, 500, 260, 30],
      [5000, 650, 70, 350], [5300, 480, 600, 30], [6000, 480, 1800, 460],
      [8100, 0, 40, 1000]
    ],
    hazards: [[1200, 612, 200, 8], [3800, 532, 220, 8], [6500, 472, 200, 8]]
  },

  {
    name: "ASCENT", subtitle: "CHAPTER XI",
    mood: { isBeyond: true },
    story: ["The architecture grew vertical.", "He learned what it meant to fall with intent.", "Up was the only direction that mattered."],
    width: 7600, bottom: 1100, spawn: { x: 150, y: 700 },
    checkpoints: [{ x: 2800, y: 560 }, { x: 5200, y: 380 }],
    exit: { x: 6440, y: 240, w: 40, h: 120 },
    springs: [[1400, 846, 70, 6, 1300], [3600, 696, 70, 6, 1350], [5600, 496, 70, 6, 1400]],
    enemies: [
      { x: 2000, y: 620, minX: 1600, maxX: 2600, speed: 130, dir: 1, w: 26, h: 50, type: 'stalker' },
      { x: 3200, y: 580, minX: 2800, maxX: 3800, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' },
      { x: 5000, y: 420, minX: 4600, maxX: 5600, speed: 140, dir: 1, w: 26, h: 50, type: 'stalker' },
      { x: 6600, y: 260, minX: 6200, maxX: 7000, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' }
    ],
    platforms: [
      [0, 780, 1000, 320], [1200, 720, 300, 30], [1400, 850, 70, 300],
      [1900, 660, 280, 30], [2400, 600, 280, 30], [2800, 520, 700, 30],
      [3600, 700, 70, 400], [3900, 460, 280, 30], [4400, 380, 280, 30],
      [4900, 440, 500, 30], [5600, 500, 70, 500], [5900, 360, 600, 30],
      [6700, 260, 700, 780], [7500, 0, 40, 1100]
    ],
    hazards: [[1300, 712, 180, 8], [3500, 452, 200, 8], [5800, 352, 220, 8]]
  },

  {
    name: "OVERGROWTH", subtitle: "CHAPTER XII",
    mood: { isBeyond: true },
    story: ["The forest was alive and hostile.", "Every shadow contained something waiting.", "He stopped counting them. He just kept running."],
    width: 8400, bottom: 1000, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 3000, y: 540 }, { x: 6000, y: 480 }],
    exit: { x: 8040, y: 340, w: 40, h: 120 },
    springs: [[2200, 746, 70, 6, 1220], [5400, 696, 70, 6, 1280]],
    enemies: [
      { x: 1200, y: 630, minX: 800, maxX: 1600, speed: 120, dir: 1, w: 26, h: 50, type: 'patrol' },
      { x: 2600, y: 570, minX: 2200, maxX: 3200, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 4000, y: 550, minX: 3400, maxX: 4600, speed: 90, dir: -1, w: 26, h: 50, type: 'charger' },
      { x: 5200, y: 590, minX: 4800, maxX: 5800, speed: 140, dir: 1, w: 26, h: 50, type: 'stalker' },
      { x: 6800, y: 500, minX: 6400, maxX: 7400, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' }
    ],
    platforms: [
      [0, 680, 900, 320], [1100, 640, 380, 30], [1700, 580, 320, 30],
      [2200, 750, 70, 250], [2600, 560, 700, 380], [3700, 520, 260, 30],
      [4200, 460, 260, 30], [4800, 500, 800, 440], [5400, 700, 70, 300],
      [5800, 480, 600, 30], [6600, 460, 1500, 480], [8350, 0, 40, 1000]
    ],
    hazards: [[1200, 632, 200, 8], [3800, 452, 220, 8], [5000, 492, 200, 8], [7000, 452, 220, 8]]
  },

  {
    name: "DEEP SIGNAL", subtitle: "CHAPTER XIII",
    mood: { isBeyond: true },
    story: ["The monoliths pulsed with something like language.", "He couldn't read it. He felt it.", "The dimension was watching him back."],
    width: 8600, bottom: 1100, spawn: { x: 150, y: 650 },
    checkpoints: [{ x: 3400, y: 560 }, { x: 6400, y: 480 }],
    exit: { x: 8200, y: 340, w: 40, h: 120 },
    springs: [[2600, 796, 70, 6, 1280], [5800, 696, 70, 6, 1350]],
    enemies: [
      { x: 1400, y: 660, minX: 900, maxX: 1900, speed: 90, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 2800, y: 590, minX: 2400, maxX: 3400, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 4200, y: 570, minX: 3800, maxX: 4800, speed: 150, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 5600, y: 510, minX: 5000, maxX: 6200, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 7200, y: 470, minX: 6800, maxX: 7800, speed: 100, dir: 1, w: 26, h: 50, type: 'charger' }
    ],
    platforms: [
      [0, 720, 900, 380], [1100, 680, 380, 30], [1800, 620, 320, 30],
      [2400, 560, 300, 30], [2600, 800, 70, 300], [3100, 580, 900, 460],
      [4300, 540, 260, 30], [4900, 500, 280, 30], [5800, 700, 70, 400],
      [6100, 480, 700, 30], [6900, 460, 1450, 580], [8550, 0, 40, 1100]
    ],
    hazards: [[1200, 672, 200, 8], [3900, 572, 220, 8], [5300, 492, 200, 8], [7400, 452, 220, 8]]
  },

  {
    name: "FRACTURE", subtitle: "CHAPTER XIV",
    mood: { isBeyond: true },
    story: ["The ground began to crack beneath his feet.", "Not metaphorically. Literally.", "He ran faster. The dimension cracked wider."],
    width: 8800, bottom: 1100, spawn: { x: 150, y: 660 },
    checkpoints: [{ x: 3600, y: 560 }, { x: 6600, y: 480 }],
    exit: { x: 8420, y: 340, w: 40, h: 120 },
    springs: [[1600, 796, 70, 6, 1250], [4000, 746, 70, 6, 1300], [6600, 646, 70, 6, 1380]],
    enemies: [
      { x: 1200, y: 660, minX: 700, maxX: 1700, speed: 100, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 2800, y: 600, minX: 2400, maxX: 3400, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 4200, y: 580, minX: 3800, maxX: 4800, speed: 160, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 5600, y: 530, minX: 5000, maxX: 6200, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' },
      { x: 7200, y: 490, minX: 6800, maxX: 7800, speed: 110, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 8000, y: 470, minX: 7600, maxX: 8400, speed: 170, dir: -1, w: 26, h: 50, type: 'stalker' }
    ],
    platforms: [
      [0, 730, 800, 370], [1000, 690, 360, 30], [1600, 800, 70, 300],
      [2100, 640, 300, 30], [2600, 580, 300, 30], [3000, 580, 1000, 460],
      [4200, 540, 280, 30], [4600, 480, 280, 30], [5000, 500, 900, 540],
      [6200, 460, 260, 30], [6600, 650, 70, 450], [6900, 440, 1500, 600],
      [8700, 0, 40, 1100]
    ],
    hazards: [
      [1100, 682, 200, 8], [3400, 572, 220, 8], [5200, 492, 200, 8],
      [5700, 472, 200, 8], [7600, 432, 240, 8]
    ]
  },

  {
    name: "RUIN STORM", subtitle: "CHAPTER XV",
    mood: { isBeyond: true },
    story: ["The sky began falling in pieces.", "He had seen asteroids before. Not this close.", "Every shadow above him was a question mark."],
    width: 9000, bottom: 1100, spawn: { x: 150, y: 650 },
    checkpoints: [{ x: 3000, y: 560 }, { x: 6000, y: 500 }, { x: 7800, y: 460 }],
    exit: { x: 8560, y: 320, w: 40, h: 120 },
    springs: [[2000, 796, 70, 6, 1300], [4800, 746, 70, 6, 1350], [7200, 646, 70, 6, 1400]],
    enemies: [
      { x: 1200, y: 650, minX: 700, maxX: 1800, speed: 110, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 2600, y: 590, minX: 2200, maxX: 3200, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 3800, y: 570, minX: 3400, maxX: 4400, speed: 170, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 5200, y: 530, minX: 4800, maxX: 5800, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 6400, y: 510, minX: 6000, maxX: 7000, speed: 120, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 7600, y: 480, minX: 7200, maxX: 8200, speed: 180, dir: -1, w: 26, h: 50, type: 'stalker' }
    ],
    platforms: [
      [0, 720, 800, 380], [1000, 680, 360, 30], [1600, 640, 300, 30],
      [2000, 800, 70, 300], [2500, 600, 800, 440], [3600, 560, 260, 30],
      [4100, 500, 280, 30], [4800, 750, 70, 350], [5100, 520, 700, 520],
      [6100, 480, 280, 30], [6700, 460, 300, 30], [7200, 650, 70, 450],
      [7600, 440, 1100, 600], [8900, 0, 40, 1100]
    ],
    hazards: [
      [1100, 672, 200, 8], [3200, 552, 220, 8], [4900, 492, 200, 8],
      [6600, 452, 240, 8], [8000, 432, 220, 8]
    ]
  },

  {
    name: "COLLAPSE", subtitle: "CHAPTER XVI",
    mood: { isBeyond: true },
    story: ["The dimension was coming apart.", "He was the reason. Or maybe the solution.", "He kept running because stopping felt worse."],
    width: 9200, bottom: 1200, spawn: { x: 150, y: 700 },
    checkpoints: [{ x: 3200, y: 600 }, { x: 6400, y: 520 }, { x: 8200, y: 460 }],
    exit: { x: 8780, y: 340, w: 40, h: 120 },
    springs: [[1800, 846, 70, 6, 1320], [4400, 796, 70, 6, 1380], [7000, 696, 70, 6, 1420]],
    enemies: [
      { x: 1200, y: 700, minX: 600, maxX: 1800, speed: 120, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 2400, y: 640, minX: 2000, maxX: 3000, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 3600, y: 620, minX: 3200, maxX: 4200, speed: 180, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 5000, y: 570, minX: 4400, maxX: 5600, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 6200, y: 540, minX: 5600, maxX: 6800, speed: 130, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 7400, y: 500, minX: 7000, maxX: 8000, speed: 190, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 8400, y: 480, minX: 8000, maxX: 8800, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' }
    ],
    platforms: [
      [0, 780, 800, 420], [1000, 730, 360, 30], [1600, 680, 300, 30],
      [1800, 850, 70, 350], [2400, 640, 1000, 500], [3700, 600, 260, 30],
      [4200, 540, 280, 30], [4400, 800, 70, 400], [4900, 560, 900, 580],
      [6100, 520, 280, 30], [6700, 480, 280, 30], [7000, 700, 70, 500],
      [7400, 460, 1500, 680], [9150, 0, 40, 1200]
    ],
    hazards: [
      [1100, 722, 200, 8], [3100, 592, 240, 8], [5300, 552, 220, 8],
      [6500, 472, 240, 8], [7800, 452, 260, 8], [8600, 432, 240, 8]
    ]
  },

  {
    name: "THE CORE", subtitle: "CHAPTER XVII",
    mood: { isBeyond: true },
    story: ["He reached the center of the dimension.", "Everything glowed too bright. Everything moved too fast.", "He had been here before. In his head."],
    width: 8800, bottom: 1100, spawn: { x: 150, y: 660 },
    checkpoints: [{ x: 3000, y: 560 }, { x: 5800, y: 480 }, { x: 7600, y: 440 }],
    exit: { x: 8380, y: 320, w: 40, h: 120 },
    springs: [[1600, 796, 70, 6, 1350], [4000, 746, 70, 6, 1400], [6400, 646, 70, 6, 1450]],
    enemies: [
      { x: 1000, y: 660, minX: 500, maxX: 1600, speed: 130, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 2200, y: 600, minX: 1800, maxX: 2800, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 3400, y: 580, minX: 3000, maxX: 4000, speed: 190, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 4600, y: 540, minX: 4200, maxX: 5200, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 5800, y: 500, minX: 5200, maxX: 6400, speed: 140, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 6800, y: 470, minX: 6400, maxX: 7400, speed: 200, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 7800, y: 440, minX: 7400, maxX: 8200, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' }
    ],
    platforms: [
      [0, 730, 800, 370], [1000, 690, 340, 30], [1600, 800, 70, 300],
      [2000, 620, 1200, 440], [3400, 570, 260, 30], [4000, 750, 70, 350],
      [4300, 520, 700, 520], [5200, 480, 280, 30], [5800, 460, 280, 30],
      [6400, 650, 70, 450], [6700, 440, 1600, 600], [8700, 0, 40, 1100]
    ],
    hazards: [
      [1100, 682, 220, 8], [3200, 562, 240, 8], [5400, 472, 220, 8],
      [6600, 432, 260, 8], [8000, 412, 240, 8]
    ]
  },

  {
    name: "SINGULARITY", subtitle: "CHAPTER XVIII",
    mood: { isBeyond: true },
    story: ["Everything converged.", "The enemies knew where he was going before he did.", "He stopped thinking. He became pure motion."],
    width: 9400, bottom: 1200, spawn: { x: 150, y: 700 },
    checkpoints: [{ x: 2800, y: 600 }, { x: 5600, y: 520 }, { x: 8000, y: 440 }],
    exit: { x: 8980, y: 340, w: 40, h: 120 },
    springs: [[2000, 846, 70, 6, 1380], [4800, 796, 70, 6, 1420], [7200, 696, 70, 6, 1460]],
    enemies: [
      { x: 1000, y: 700, minX: 400, maxX: 1600, speed: 140, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 2200, y: 640, minX: 1800, maxX: 2800, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 3400, y: 610, minX: 2800, maxX: 4000, speed: 200, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 4600, y: 570, minX: 4000, maxX: 5200, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 5800, y: 540, minX: 5200, maxX: 6400, speed: 150, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 7800, y: 480, minX: 7400, maxX: 8600, speed: 210, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 8800, y: 460, minX: 8400, maxX: 9100, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' }
    ],
    platforms: [
      [0, 780, 800, 420], [1000, 740, 360, 30], [1600, 700, 300, 30],
      [2000, 850, 70, 350], [2600, 640, 1100, 500], [3900, 600, 280, 30],
      [4500, 540, 300, 30], [4800, 800, 70, 400], [5300, 560, 1000, 580],
      [6500, 500, 340, 30], [7000, 460, 340, 30],
      [7200, 700, 70, 500], [7500, 440, 1700, 700], [9350, 0, 40, 1200]
    ],
    hazards: [
      [1100, 732, 220, 8], [3100, 592, 260, 8], [5000, 532, 240, 8],
      [6200, 492, 200, 8], [8200, 432, 260, 8]
    ]
  },

  {
    name: "LAST STAND", subtitle: "CHAPTER XIX",
    mood: { isBeyond: true },
    story: ["Every single one of them came.", "He never learned their names. They never learned his.", "The suit was still clean. Somehow."],
    width: 9600, bottom: 1200, spawn: { x: 150, y: 700 },
    checkpoints: [{ x: 2600, y: 600 }, { x: 5200, y: 520 }, { x: 7800, y: 460 }],
    exit: { x: 9200, y: 330, w: 40, h: 120 },
    springs: [[1800, 846, 70, 6, 1400], [4400, 796, 70, 6, 1440], [7000, 696, 70, 6, 1480]],
    enemies: [
      { x: 800, y: 700, minX: 300, maxX: 1400, speed: 150, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 1800, y: 640, minX: 1400, maxX: 2400, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 2800, y: 610, minX: 2400, maxX: 3400, speed: 210, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 4000, y: 580, minX: 3400, maxX: 4600, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 5000, y: 550, minX: 4400, maxX: 5600, speed: 160, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 6200, y: 520, minX: 5600, maxX: 6800, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' },
      { x: 7200, y: 490, minX: 6600, maxX: 7800, speed: 220, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 8400, y: 460, minX: 8000, maxX: 9000, speed: 170, dir: 1, w: 26, h: 50, type: 'charger' }
    ],
    platforms: [
      [0, 780, 800, 420], [1000, 730, 340, 30], [1600, 680, 300, 30],
      [1800, 850, 70, 350], [2400, 630, 1000, 510], [3700, 580, 280, 30],
      [4300, 520, 300, 30], [4400, 800, 70, 400], [5000, 550, 1000, 590],
      [6200, 510, 300, 30], [6900, 470, 300, 30], [7000, 700, 70, 500],
      [7500, 450, 1700, 700], [9550, 0, 40, 1200]
    ],
    hazards: [
      [1100, 722, 220, 8], [2900, 572, 260, 8], [4800, 512, 240, 8],
      [6000, 492, 260, 8], [7200, 442, 280, 8], [8600, 422, 280, 8]
    ]
  },

  // ============================================================
  // CHAPTER XX — TRANSCENDENCE (Earned Finale Pattern)
  // ============================================================
  {
    name: "TRANSCENDENCE", subtitle: "CHAPTER XX",
    mood: { isBeyond: true, isFinale: true },
    story: ["The enemies were gone.", "The dimension was silent for the first time.", "He walked. Just walked. The sky had finally opened."],
    width: 5600, bottom: 1000, spawn: { x: 200, y: 600 },
    checkpoints: [],
    exit: { x: 5180, y: 120, w: 40, h: 120 },
    springs: [
      [1200, 746, 80, 6, 1350], [2600, 596, 80, 6, 1400], [4000, 446, 80, 6, 1450]
    ],
    enemies: [],
    platforms: [
      [0, 700, 1300, 300], [1200, 750, 80, 250], [1700, 520, 400, 30],
      [2400, 400, 300, 30], [2600, 600, 80, 400], [3100, 320, 400, 30],
      [3700, 260, 300, 30], [4000, 450, 80, 550], [4400, 240, 1200, 700]
    ],
    hazards: []
  },

  // ============================================================
  // CHAPTERS XXI–XXX — THE ASSAULT ARC (Gun Combat & Ninja Enemies)
  // ============================================================
  {
    name: "THE ASSAULT", subtitle: "CHAPTER XXI",
    mood: { isBeyond: true },
    story: ["He didn't want to fight.", "But the dimension adapted to his pacifism.", "He adapted back. Left click to aim and fire."],
    width: 8000, bottom: 1200, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 3500, y: 500 }],
    exit: { x: 7600, y: 380, w: 40, h: 120 },
    enemies: [
      { x: 1800, y: 550, minX: 1400, maxX: 2200, speed: 180, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 3000, y: 500, minX: 2800, maxX: 3400, speed: 190, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 4200, y: 450, minX: 3800, maxX: 4600, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 5500, y: 400, minX: 5000, maxX: 6000, speed: 200, dir: -1, w: 26, h: 50, type: 'ninja' }
    ],
    platforms: [
      [0, 700, 1200, 300], [1400, 600, 600, 30], [2200, 550, 800, 300],
      [3200, 500, 400, 30], [3800, 480, 1200, 400], [5200, 440, 1000, 30],
      [6400, 450, 1400, 500]
    ],
    hazards: [[1200, 692, 200, 8], [3600, 492, 200, 8]]
  },
  {
    name: "INFILTRATION", subtitle: "CHAPTER XXII",
    mood: { isBeyond: true },
    story: ["The architecture tightened.", "Flanking shadows moved parallel to his path.", "Hesitation meant a blade from above."],
    width: 8200, bottom: 1200, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 4000, y: 550 }],
    exit: { x: 7800, y: 350, w: 40, h: 120 },
    enemies: [
      { x: 2200, y: 500, minX: 1800, maxX: 2500, speed: 210, dir: 1, w: 26, h: 50, type: 'ninja' },
      { x: 4500, y: 500, minX: 4100, maxX: 5000, speed: 220, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 6000, y: 400, minX: 5600, maxX: 6500, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' }
    ],
    platforms: [
      [0, 680, 1600, 300], [1900, 580, 800, 400], [3000, 640, 400, 30],
      [3700, 610, 1500, 400], [5500, 500, 600, 30], [6400, 450, 1500, 400]
    ],
    hazards: [[1600, 672, 300, 8]]
  },
  {
    name: "RETRIBUTION", subtitle: "CHAPTER XXIII",
    mood: { isBeyond: true },
    story: ["They coordinated their strikes.", "Brute speed combined with precise aerial entry.", "Keep moving or get pinned down."],
    width: 8400, bottom: 1200, spawn: { x: 150, y: 500 },
    checkpoints: [{ x: 3800, y: 500 }],
    exit: { x: 8000, y: 400, w: 40, h: 120 },
    enemies: [
      { x: 1500, y: 500, minX: 1200, maxX: 2200, speed: 90, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 2800, y: 400, minX: 2400, maxX: 3200, speed: 200, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 5000, y: 450, minX: 4500, maxX: 5500, speed: 210, dir: 1, w: 26, h: 50, type: 'ninja' },
      { x: 6800, y: 400, minX: 6200, maxX: 7400, speed: 100, dir: -1, w: 26, h: 50, type: 'charger' }
    ],
    platforms: [
      [0, 600, 1200, 300], [1400, 560, 900, 40], [2500, 500, 1000, 300],
      [3800, 560, 1400, 400], [5500, 500, 800, 40], [6600, 480, 1500, 400]
    ],
    hazards: [[1200, 592, 200, 8], [3500, 492, 300, 8]]
  },
  {
    name: "VANGUARD", subtitle: "CHAPTER XXIV",
    mood: { isBeyond: true },
    story: ["Ledges became narrow fragments.", "Ninjas dropped directly into his blind spots.", "Shoot upwards to clear a passage."],
    width: 8500, bottom: 1300, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 4200, y: 450 }],
    exit: { x: 8100, y: 300, w: 40, h: 120 },
    enemies: [
      { x: 2000, y: 450, minX: 1700, maxX: 2400, speed: 230, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 3500, y: 400, minX: 3200, maxX: 3900, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 5800, y: 350, minX: 5400, maxX: 6200, speed: 240, dir: 1, w: 26, h: 50, type: 'ninja' }
    ],
    platforms: [
      [0, 700, 1000, 300], [1200, 600, 300, 30], [1700, 520, 800, 400],
      [2800, 500, 300, 30], [3300, 450, 1200, 500], [4800, 400, 400, 30],
      [5400, 380, 1100, 600], [6800, 350, 1400, 30]
    ],
    hazards: [[1000, 692, 200, 8], [2500, 512, 300, 8]]
  },
  {
    name: "AMBUSH", subtitle: "CHAPTER XXV",
    mood: { isBeyond: true },
    story: ["A crossfire matrix locked down the path.", "Static defenses anchored by relentless executioners.", "Break their balance before they lock their tracking."],
    width: 8800, bottom: 1200, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 4400, y: 500 }],
    exit: { x: 8400, y: 350, w: 40, h: 120 },
    enemies: [
      { x: 1800, y: 550, minX: 1600, maxX: 2000, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 2800, y: 500, minX: 2400, maxX: 3200, speed: 220, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 5000, y: 450, minX: 4700, maxX: 5300, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' },
      { x: 6500, y: 400, minX: 6000, maxX: 7000, speed: 230, dir: 1, w: 26, h: 50, type: 'ninja' }
    ],
    platforms: [
      [0, 660, 1200, 300], [1400, 600, 500, 30], [2100, 540, 1100, 400],
      [3400, 500, 400, 30], [4000, 480, 1400, 500], [5700, 420, 400, 30],
      [6300, 400, 1800, 600]
    ],
    hazards: [[1200, 652, 200, 8], [3500, 492, 500, 8]]
  },
  {
    name: "ESCALATION", subtitle: "CHAPTER XXVI",
    mood: { isBeyond: true },
    story: ["No safe ground remained.", "Every vertical layer layout contained a dynamic threat.", "Trust the gun's structural weight. Clear the path."],
    width: 9000, bottom: 1200, spawn: { x: 150, y: 500 },
    checkpoints: [{ x: 4500, y: 450 }],
    exit: { x: 8600, y: 350, w: 40, h: 120 },
    enemies: [
      { x: 1600, y: 450, minX: 1200, maxX: 2000, speed: 240, dir: 1, w: 26, h: 50, type: 'ninja' },
      { x: 3200, y: 400, minX: 2800, maxX: 3600, speed: 110, dir: -1, w: 26, h: 50, type: 'charger' },
      { x: 5200, y: 420, minX: 4800, maxX: 5600, speed: 250, dir: 1, w: 26, h: 50, type: 'ninja' },
      { x: 7000, y: 350, minX: 6600, maxX: 7400, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' }
    ],
    platforms: [
      [0, 600, 1000, 300], [1200, 540, 900, 40], [2300, 500, 300, 30],
      [2800, 460, 1100, 400], [4100, 420, 400, 30], [4700, 440, 1200, 400],
      [6200, 380, 2100, 500]
    ],
    hazards: [[1000, 592, 200, 8], [4100, 412, 400, 8]]
  },
  {
    name: "FORTRESS", subtitle: "CHAPTER XXVII",
    mood: { isBeyond: true },
    story: ["A heavy architectural gauntlet blocked the horizon.", "Ninjas locked inside vertical grid layouts.", "Pre-fire before dropping into lower zones."],
    width: 9200, bottom: 1300, spawn: { x: 150, y: 650 },
    checkpoints: [{ x: 4600, y: 550 }],
    exit: { x: 8800, y: 400, w: 40, h: 120 },
    enemies: [
      { x: 2200, y: 550, minX: 1900, maxX: 2500, speed: 220, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 3800, y: 500, minX: 3500, maxX: 4200, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 5800, y: 520, minX: 5200, maxX: 6200, speed: 230, dir: 1, w: 26, h: 50, type: 'ninja' },
      { x: 7400, y: 450, minX: 7000, maxX: 7800, speed: 120, dir: -1, w: 26, h: 50, type: 'charger' }
    ],
    platforms: [
      [0, 720, 1400, 300], [1600, 640, 300, 30], [2100, 580, 1200, 400],
      [3500, 520, 1000, 30], [4700, 540, 1100, 500], [6000, 480, 400, 30],
      [6600, 460, 2200, 600]
    ],
    hazards: [[1400, 712, 200, 8], [3500, 512, 300, 8]]
  },
  {
    name: "THE GRID", subtitle: "CHAPTER XXVIII",
    mood: { isBeyond: true },
    story: ["Perfect alignment was demanded.", "Spikes coated the underbelly of every platform edge.", "Leap and shoot simultaneously to neutralize threats."],
    width: 9400, bottom: 1200, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 4800, y: 480 }],
    exit: { x: 9000, y: 350, w: 40, h: 120 },
    enemies: [
      { x: 2000, y: 500, minX: 1600, maxX: 2400, speed: 250, dir: 1, w: 26, h: 50, type: 'ninja' },
      { x: 4000, y: 440, minX: 3600, maxX: 4400, speed: 240, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 6800, y: 380, minX: 6400, maxX: 7200, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' }
    ],
    platforms: [
      [0, 660, 1200, 300], [1400, 580, 800, 30], [2400, 520, 1400, 400],
      [4000, 460, 800, 30], [5000, 440, 1500, 500], [6800, 380, 2200, 600]
    ],
    hazards: [[1200, 652, 200, 8], [3800, 452, 200, 8]]
  },
  {
    name: "BREAKOUT", subtitle: "CHAPTER XXIX",
    mood: { isBeyond: true },
    story: ["The containment architecture shattered.", "An unmitigated hunting party emerged from the gaps.", "Maintain forward speed. Do not cycle backward."],
    width: 9600, bottom: 1200, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 5000, y: 500 }],
    exit: { x: 9200, y: 380, w: 40, h: 120 },
    enemies: [
      { x: 1400, y: 550, minX: 1000, maxX: 1800, speed: 130, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 2800, y: 500, minX: 2400, maxX: 3200, speed: 260, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 4500, y: 480, minX: 4000, maxX: 5000, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 6200, y: 450, minX: 5600, maxX: 6800, speed: 250, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 7800, y: 400, minX: 7200, maxX: 8400, speed: 140, dir: 1, w: 26, h: 50, type: 'charger' }
    ],
    platforms: [
      [0, 680, 1000, 300], [1200, 600, 1200, 40], [2600, 540, 1200, 400],
      [4000, 480, 1200, 40], [5400, 460, 1600, 500], [7200, 420, 2000, 600]
    ],
    hazards: [[1000, 672, 200, 8], [3800, 472, 200, 8]]
  },
  {
    name: "APEX AREA", subtitle: "CHAPTER XXX",
    mood: { isBeyond: true },
    story: ["The final defense perimeter of the ground world.", "A concentrated execution matrix.", "Purge the platform layers to earn transcendence."],
    width: 7000, bottom: 1100, spawn: { x: 150, y: 600 },
    checkpoints: [],
    exit: { x: 6500, y: 350, w: 40, h: 120 },
    enemies: [
      { x: 1200, y: 600, minX: 800, maxX: 1600, speed: 260, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 2400, y: 500, minX: 2000, maxX: 2800, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 3800, y: 450, minX: 3400, maxX: 4400, speed: 270, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 5000, y: 400, minX: 4600, maxX: 5600, speed: 280, dir: 1, w: 26, h: 50, type: 'ninja' }
    ],
    platforms: [
      [0, 680, 1000, 300], [1200, 580, 1000, 400], [2400, 500, 1000, 40],
      [3600, 460, 1200, 500], [5000, 400, 1600, 600]
    ],
    hazards: []
  },

  // ============================================================
  // CHAPTERS XXXI–XL — THE ASCENSION ARC (Vertical Flight Prep)
  // ============================================================
  {
    name: "SKYBOUND", subtitle: "CHAPTER XXXI",
    mood: { isBeyond: true },
    story: ["The atmosphere began to thin out.", "Platforms scaled upwards toward the cosmic belt.", "Jump momentum carries further here."],
    width: 8000, bottom: 1200, spawn: { x: 150, y: 650 },
    checkpoints: [{ x: 4000, y: 500 }],
    exit: { x: 7600, y: 250, w: 40, h: 120 },
    enemies: [
      { x: 2000, y: 520, minX: 1600, maxX: 2400, speed: 220, dir: 1, w: 26, h: 50, type: 'ninja' },
      { x: 5000, y: 400, minX: 4500, maxX: 5500, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' }
    ],
    platforms: [
      [0, 740, 1200, 300], [1400, 620, 600, 30], [2200, 540, 800, 400],
      [3200, 480, 400, 30], [3800, 420, 1400, 500], [5400, 350, 400, 30],
      [6000, 300, 1600, 600]
    ],
    hazards: [[1200, 732, 200, 8]]
  },
  {
    name: "STRATOSPHERE", subtitle: "CHAPTER XXXII",
    mood: { isBeyond: true },
    story: ["Gravity was losing its hold.", "Ninjas catch massive air on their counter-leaps.", "Track them cleanly before they reach their apex."],
    width: 8400, bottom: 1200, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 4200, y: 450 }],
    exit: { x: 8000, y: 200, w: 40, h: 120 },
    enemies: [
      { x: 2400, y: 480, minX: 2000, maxX: 2800, speed: 250, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 6000, y: 350, minX: 5500, maxX: 6500, speed: 260, dir: 1, w: 26, h: 50, type: 'ninja' }
    ],
    platforms: [
      [0, 680, 1400, 300], [1600, 560, 400, 30], [2200, 480, 1200, 400],
      [3600, 420, 400, 30], [4200, 360, 1500, 500], [5900, 300, 400, 30],
      [6500, 240, 1600, 600]
    ],
    hazards: [[1600, 552, 400, 8]]
  },
  {
    name: "VERTICAL LIMIT", subtitle: "CHAPTER XXXIII",
    mood: { isBeyond: true },
    story: ["High-impulse mechanical launch systems detected.", "Coil lines hum with violent energy.", "Bounce and clear airborne targets instantly."],
    width: 8600, bottom: 1300, spawn: { x: 150, y: 700 },
    checkpoints: [{ x: 4400, y: 500 }],
    exit: { x: 8200, y: 250, w: 40, h: 120 },
    springs: [[1400, 846, 70, 6, 1350], [5000, 646, 70, 6, 1400]],
    enemies: [
      { x: 2800, y: 500, minX: 2400, maxX: 3200, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 6400, y: 400, minX: 6000, maxX: 6800, speed: 240, dir: -1, w: 26, h: 50, type: 'ninja' }
    ],
    platforms: [
      [0, 780, 1000, 320], [1400, 850, 70, 300], [1800, 620, 800, 30],
      [2800, 540, 1400, 400], [4400, 460, 400, 30], [5000, 650, 70, 400],
      [5400, 420, 2400, 500]
    ],
    hazards: [[1800, 612, 800, 8]]
  },
  {
    name: "CLOUD RAIN", subtitle: "CHAPTER XXXIV",
    mood: { isBeyond: true },
    story: ["Liquid static dropped from the black layer.", "Ledges were coated and extremely narrow.", "Keep horizontal momentum absolute."],
    width: 8800, bottom: 1200, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 4500, y: 400 }],
    exit: { x: 8400, y: 200, w: 40, h: 120 },
    enemies: [
      { x: 2000, y: 440, minX: 1600, maxX: 2400, speed: 260, dir: 1, w: 26, h: 50, type: 'ninja' },
      { x: 6800, y: 320, minX: 6200, maxX: 7200, speed: 270, dir: -1, w: 26, h: 50, type: 'ninja' }
    ],
    platforms: [
      [0, 660, 1200, 300], [1400, 540, 600, 30], [2200, 460, 1400, 400],
      [3800, 380, 500, 30], [4500, 340, 1600, 500], [6300, 280, 2200, 600]
    ],
    hazards: [[1400, 532, 600, 8], [3800, 372, 500, 8]]
  },
  {
    name: "THE REACH", subtitle: "CHAPTER XXXV",
    mood: { isBeyond: true },
    story: ["Massive gaps isolated the architecture blocks.", "Use the gun's firing recoil pressure to extend jumps.", "Precision vectors only."],
    width: 9000, bottom: 1200, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 4600, y: 450 }],
    exit: { x: 8600, y: 250, w: 40, h: 120 },
    enemies: [
      { x: 3000, y: 450, minX: 2600, maxX: 3400, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' },
      { x: 7200, y: 350, minX: 6600, maxX: 7600, speed: 250, dir: 1, w: 26, h: 50, type: 'ninja' }
    ],
    platforms: [
      [0, 680, 1600, 300], [2200, 540, 1400, 400], [4000, 440, 400, 30],
      [4600, 420, 1800, 500], [6800, 340, 1900, 600]
    ],
    hazards: [[1600, 672, 600, 8], [3600, 532, 400, 8]]
  },
  {
    name: "GRAVITY WELL", subtitle: "CHAPTER XXXVI",
    mood: { isBeyond: true },
    story: ["The center of gravity shattered.", "Dynamic objects drop continuously from the sky grid.", "Look up. Keep the weapon cycling."],
    width: 9200, bottom: 1300, spawn: { x: 150, y: 650 },
    checkpoints: [{ x: 4600, y: 500 }],
    exit: { x: 8800, y: 300, w: 40, h: 120 },
    enemies: [
      { x: 2000, y: 520, minX: 1500, maxX: 2400, speed: 280, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 5500, y: 420, minX: 5000, maxX: 6000, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 7400, y: 380, minX: 7000, maxX: 7800, speed: 290, dir: 1, w: 26, h: 50, type: 'ninja' }
    ],
    platforms: [
      [0, 720, 1200, 300], [1400, 600, 800, 30], [2400, 540, 1400, 400],
      [4000, 460, 1000, 30], [5200, 440, 1600, 500], [7000, 360, 1900, 600]
    ],
    hazards: [[1400, 592, 800, 8]]
  },
  {
    name: "STORM FRONT", subtitle: "CHAPTER XXXVII",
    mood: { isBeyond: true },
    story: ["A wall of sentinels blocked the upward path.", "Synchronized bullet fire grids.", "Time your jumps inside the reload gaps."],
    width: 9400, bottom: 1200, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 4800, y: 450 }],
    exit: { x: 9000, y: 250, w: 40, h: 120 },
    enemies: [
      { x: 1800, y: 500, minX: 1600, maxX: 2000, speed: 0, dir: 1, w: 26, h: 50, type: 'sentinel' },
      { x: 3200, y: 440, minX: 3000, maxX: 3400, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' },
      { x: 5800, y: 380, minX: 5400, maxX: 6200, speed: 280, dir: 1, w: 26, h: 50, type: 'ninja' },
      { x: 7200, y: 340, minX: 6800, maxX: 7600, speed: 0, dir: -1, w: 26, h: 50, type: 'sentinel' }
    ],
    platforms: [
      [0, 660, 1400, 300], [1600, 540, 1200, 400], [3000, 460, 400, 30],
      [3600, 420, 1600, 500], [5400, 360, 1200, 30], [6800, 320, 2200, 600]
    ],
    hazards: [[3000, 452, 400, 8]]
  },
  {
    name: "THE EDGE", subtitle: "CHAPTER XXXVIII",
    mood: { isBeyond: true },
    story: ["The final solid platform layer was approaching.", "Ninjas attack from structural blind spots.", "Keep your fire continuous while moving forward."],
    width: 9600, bottom: 1200, spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 5000, y: 450 }],
    exit: { x: 9200, y: 250, w: 40, h: 120 },
    enemies: [
      { x: 2200, y: 480, minX: 1800, maxX: 2600, speed: 290, dir: -1, w: 26, h: 50, type: 'ninja' },
      { x: 4500, y: 400, minX: 4100, maxX: 4900, speed: 130, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 7000, y: 320, minX: 6500, maxX: 7500, speed: 300, dir: 1, w: 26, h: 50, type: 'ninja' }
    ],
    platforms: [
      [0, 680, 1600, 300], [1800, 540, 800, 30], [2800, 460, 1600, 400],
      [4600, 380, 800, 30], [5600, 340, 1200, 500], [7000, 300, 2300, 600]
    ],
    hazards: [[1800, 532, 800, 8]]
  },
  {
    name: "TAKEOFF STRIP", subtitle: "CHAPTER XXXIX",
    mood: { isBeyond: true },
    story: ["A long, uninterrupted horizontal runway.", "The static hummed at maximum capacity.", "Accelerate to structural escape velocity."],
    width: 7500, bottom: 1100, spawn: { x: 150, y: 600 },
    checkpoints: [],
    exit: { x: 7100, y: 400, w: 40, h: 120 },
    enemies: [
      { x: 2000, y: 600, minX: 1500, maxX: 3000, speed: 150, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 4000, y: 600, minX: 3500, maxX: 5000, speed: 160, dir: 1, w: 26, h: 50, type: 'charger' },
      { x: 6000, y: 600, minX: 5500, maxX: 6800, speed: 300, dir: -1, w: 26, h: 50, type: 'ninja' }
    ],
    platforms: [
      [0, 680, 7500, 420]
    ],
    hazards: []
  },

  // ============================================================
  // EXPANSION: CHAPTER XL (AIRSPACE - First Flight Level)
  // ============================================================
  {
    name: "AIRSPACE", subtitle: "CHAPTER XL",
    mood: { isBeyond: true },
    isPlane: true, // TRIGGERS ZERO-DRIFT FLIGHT PHYSICS
    story: ["The ground stopped entirely.", "The suit evolved to cut through the static space.", "W,A,S,D to navigate. Mouse to clear the airspace."],
    width: 12000, bottom: 1800, spawn: { x: 300, y: 800 },
    exit: { x: 11500, y: 800, w: 100, h: 200 },
    enemies: [
      { x: 2000, y: 600, minX: 1800, maxX: 2200, speed: 0, dir: -1, w: 40, h: 40, type: 'sentinel' },
      { x: 3500, y: 400, minX: 3000, maxX: 4000, speed: 250, dir: -1, w: 30, h: 30, type: 'stalker' },
      { x: 3500, y: 900, minX: 3000, maxX: 4000, speed: 250, dir: -1, w: 30, h: 30, type: 'stalker' },
      { x: 6000, y: 700, minX: 5800, maxX: 6200, speed: 0, dir: -1, w: 40, h: 40, type: 'sentinel' },
      { x: 8000, y: 300, minX: 7000, maxX: 9000, speed: 300, dir: -1, w: 30, h: 30, type: 'stalker' },
      { x: 8000, y: 1100, minX: 7000, maxX: 9000, speed: 300, dir: -1, w: 30, h: 30, type: 'stalker' }
    ],
    platforms: [
      [2500, 0, 300, 600], [2500, 1000, 300, 800],
      [5000, 400, 400, 800], 
      [7500, 0, 300, 400], [7500, 700, 300, 400], [7500, 1400, 300, 400]
    ],
    hazards: []
  }
];
