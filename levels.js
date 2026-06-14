// ============================================================
// MIND IN MOTION — levels.js (The Extended 7-Chapter Roadmap)
// Platforms: [x, y, width, height] · Hazards: [x, y, width, height]
// Springs: [x, y, width, height, velocityBoost]
// Enemies: { x, y, minX, maxX, speed, dir, w, h, type: 'patrol'|'stalker' }
// ============================================================

const LEVELS = [
  {
    name: "STATIC",
    subtitle: "CHAPTER I",
    mood: {
      veil: [105, 125, 148],               
      grade: "rgba(120, 135, 155, 0.05)",   
      darken: 0
    },
    story: [
      "He woke up in a suit he didn't remember buying.",
      "Nothing moved here. Not even his doubts.",
      "So he did the only reasonable thing. He ran."
    ],
    width: 7200,
    bottom: 900,
    spawn: { x: 140, y: 540 },
    checkpoints: [
      { x: 2950, y: 560 },
      { x: 6150, y: 560 }
    ],
    exit: { x: 7060, y: 520, w: 40, h: 120 },
    springs: [], 
    enemies: [
      { x: 3100, y: 590, minX: 2900, maxX: 3400, speed: 90, dir: 1, w: 26, h: 50, type: 'patrol' },
      { x: 6400, y: 590, minX: 6150, maxX: 6800, speed: 100, dir: 1, w: 26, h: 50, type: 'patrol' }
    ],
    platforms: [
      [0,    640, 1100, 260],   
      [1240, 640, 500, 260],    
      [1900, 640, 420, 260],    
      [2320, 560, 180, 26],     
      [2560, 470, 180, 26],
      [2840, 640, 700, 260],    
      [3640, 560, 160, 26],     
      [3900, 470, 160, 26],
      [4160, 400, 900, 26],     
      [5160, 640, 800, 260],    
      [6080, 640, 1120, 260],   
      [-40,  200, 40, 640],
      [7200, 0, 40, 840]
    ],
    hazards: [
      [5300, 632, 140, 8],
      [5560, 632, 160, 8],
      [6240, 632, 180, 8],
      [6560, 632, 140, 8]
    ]
  },
  {
    name: "DOUBT",
    subtitle: "CHAPTER II",
    mood: {
      veil: [88, 92, 130],                 
      grade: "rgba(60, 55, 110, 0.12)",     
      darken: 0.10
    },
    story: [
      "The ground felt less certain here.",
      "Every platform asked him: are you sure?",
      "He wasn't. He jumped anyway."
    ],
    width: 8400,
    bottom: 900,
    spawn: { x: 110, y: 540 },
    checkpoints: [
      { x: 1600, y: 480 },
      { x: 2820, y: 400 },
      { x: 4050, y: 340 },
      { x: 6500, y: 160 }
    ],
    exit: { x: 8240, y: 120, w: 40, h: 120 },
    springs: [],
    enemies: [
      { x: 4960, y: 250, minX: 4960, maxX: 5300, speed: 85, dir: 1, w: 26, h: 50, type: 'patrol' },
      { x: 7700, y: 190, minX: 7620, maxX: 8100, speed: 120, dir: -1, w: 26, h: 50, type: 'patrol' }
    ],
    platforms: [
      [0,    640, 520, 260],    
      [640,  580, 130, 22],
      [860,  520, 130, 22],
      [1080, 580, 130, 22],
      [1300, 500, 130, 22],
      [1520, 560, 200, 22],     
      [1840, 480, 130, 22],
      [2060, 420, 130, 22],
      [2280, 480, 130, 22],
      [2500, 540, 130, 22],
      [2720, 480, 220, 22],     
      [3060, 420, 130, 22],
      [3280, 360, 130, 22],
      [3500, 420, 130, 22],
      [3720, 480, 130, 22],
      [3940, 420, 240, 22],     
      [4300, 360, 130, 22],
      [4520, 300, 130, 22],
      [4740, 360, 130, 22],
      [4960, 300, 400, 22],     
      [5480, 360, 130, 22],
      [5700, 300, 130, 22],
      [5920, 240, 130, 22],
      [6140, 300, 130, 22],
      [6360, 240, 460, 22],     
      [6940, 300, 130, 22],
      [7160, 240, 130, 22],
      [7380, 180, 130, 22],
      [7600, 240, 800, 22],     
      [-40,  200, 40, 640],
      [8400, 0, 40, 840]
    ],
    hazards: [
      [2300, 472, 90, 8],
      [5080, 292, 120, 8],
      [6600, 232, 100, 8]
    ]
  },
  {
    name: "MOMENTUM",
    subtitle: "CHAPTER III",
    mood: { 
      veil: [165, 85, 85],                 
      grade: "rgba(185, 65, 65, 0.07)", 
      darken: 0.05 
    },
    story: [
      "Anger is a curious engine.",
      "It provides weight where there was only emptiness.",
      "He stopped calculating the distance. He accelerated."
    ],
    width: 7800,
    bottom: 900,
    spawn: { x: 150, y: 500 },
    checkpoints: [
      { x: 3200, y: 500 },
      { x: 5600, y: 440 }
    ],
    exit: { x: 7350, y: 440, w: 40, h: 120 },
    springs: [],
    enemies: [
      { x: 3300, y: 550, minX: 2900, maxX: 4100, speed: 140, dir: 1, w: 26, h: 50, type: 'stalker' },
      { x: 6200, y: 490, minX: 5800, maxX: 6900, speed: 160, dir: -1, w: 26, h: 50, type: 'patrol' }
    ],
    platforms: [
      [0,    600, 1400, 300], [1650, 560, 280, 30], [2150, 500, 350, 30],
      [2700, 600, 1800, 300], [4800, 480, 250, 30], [5350, 540, 2100, 360], [7450, 0, 40, 900]        
    ],
    hazards: [
      [700,  592, 260, 8],
      [3400, 592, 280, 8],
      [5700, 532, 240, 8],
      [6600, 532, 220, 8]
    ]
  },
  {
    name: "ISOLATION",
    subtitle: "CHAPTER IV",
    mood: { 
      veil: [55, 90, 90],                   
      grade: "rgba(35, 95, 95, 0.12)", 
      darken: 0.25                          
    },
    story: [
      "The architecture grew massive, cold, and quiet.",
      "The sky pulled back.",
      "He was entirely alone. He became very small."
    ],
    width: 8800,
    bottom: 1200,
    spawn: { x: 150, y: 700 },
    checkpoints: [
      { x: 3250, y: 560 },
      { x: 6900, y: 810 }
    ],
    exit: { x: 8500, y: 700, w: 40, h: 120 }, 
    springs: [
      [2120, 846, 80, 6, 1250],
      [5750, 796, 80, 6, 1200]
    ],
    enemies: [
      { x: 4700, y: 600, minX: 4450, maxX: 5100, speed: 110, dir: 1, w: 26, h: 50, type: 'patrol' },
      { x: 7400, y: 850, minX: 6900, maxX: 8200, speed: 150, dir: 1, w: 26, h: 50, type: 'stalker' }
    ],
    platforms: [
      [0,    800, 900, 400], [1300, 900, 500, 40], [2100, 850, 120, 400],
      [2650, 750, 120, 500], [3100, 650, 2200, 600], [5700, 800, 700, 40],
      [6750, 900, 1900, 300], [8650, 0, 40, 1200]
    ],
    hazards: [
      [3450, 642, 220, 8], 
      [4100, 642, 220, 8], 
      [7100, 892, 200, 8], 
      [7600, 892, 200, 8]
    ]
  },
  {
    name: "CLARITY",
    subtitle: "CHAPTER V",
    mood: { 
      veil: [220, 230, 240],                
      grade: "rgba(245, 225, 225, 0.15)", 
      darken: 0 
    },
    story: [
      "The static cleared from the air.",
      "There was nothing left to escape.",
      "He stepped out of the cage of his own head."
    ],
    width: 5200,
    bottom: 900,
    spawn: { x: 200, y: 500 },
    checkpoints: [{ x: 200, y: 500 }, { x: 2550, y: 320 }], // Catch-fall safety metrics matrix added
    exit: { x: 4850, y: 380, w: 40, h: 120 },
    springs: [], 
    enemies: [],                             
    platforms: [
      [0,    600, 1200, 300], [1450, 540, 350, 30], [2000, 480, 350, 30],
      [2550, 420, 900, 500], [3650, 450, 350, 30], [4200, 500, 1000, 400]
    ],
    hazards: []                             
  },
  {
    name: "RESILIENCE",
    subtitle: "CHAPTER VI",
    mood: { 
      veil: [140, 110, 170], 
      grade: "rgba(140, 90, 180, 0.10)", 
      darken: 0.12 
    },
    story: [
      "Acceptance didn't mean the shadows vanished.",
      "It meant he learned how to glide past them.",
      "The walls were tall. He bounced higher."
    ],
    width: 7600, 
    bottom: 1000, 
    spawn: { x: 150, y: 600 },
    checkpoints: [{ x: 2700, y: 540 }, { x: 5200, y: 640 }],
    exit: { x: 7300, y: 500, w: 40, h: 120 },
    springs: [
      [1400, 796, 60, 6, 1150],
      [2200, 796, 60, 6, 1200],
      [4800, 696, 60, 6, 1300]
    ],
    enemies: [
      { x: 3600, y: 550, minX: 3200, maxX: 4000, speed: 150, dir: -1, w: 26, h: 50, type: 'stalker' },
      { x: 5500, y: 650, minX: 5200, maxX: 6200, speed: 130, dir: 1, w: 26, h: 50, type: 'stalker' }
    ],
    platforms: [
      [0, 700, 1200, 300], [1400, 800, 60, 200], [1800, 650, 300, 40],
      [2200, 800, 60, 200], [2600, 600, 1400, 400], [4300, 750, 300, 40],
      [4800, 700, 60, 300], [5100, 700, 2200, 300], [7500, 0, 40, 1000]
    ],
    hazards: [
      [400, 692, 260, 8],
      [2800, 592, 280, 8],
      [5400, 692, 240, 8],
      [6060, 692, 240, 8]
    ]
  },
  {
    name: "BEYOND",
    subtitle: "CHAPTER VII",
    mood: { 
      veil: [0, 180, 180], 
      grade: "rgba(0, 40, 60, 0.18)", 
      darken: 0.08,
      isBeyond: true
    },
    story: [
      "The world he knew collapsed behind him.",
      "Something ancient and alive waited on the other side.",
      "He didn't understand it. He ran toward it anyway."
    ],
    width: 7200, 
    bottom: 1000, 
    spawn: { x: 160, y: 600 },
    checkpoints: [
      { x: 3000, y: 540 }
    ], 
    exit: { x: 6900, y: 200, w: 40, h: 120 },
    springs: [
      [1800, 746, 70, 6, 1300],
      [3600, 596, 70, 6, 1380],
      [5200, 446, 70, 6, 1450]
    ],
    enemies: [
      { x: 2200, y: 590, minX: 1900, maxX: 2700, speed: 130, dir: 1, w: 26, h: 50, type: 'stalker' },
      { x: 4800, y: 490, minX: 4400, maxX: 5500, speed: 150, dir: -1, w: 26, h: 50, type: 'stalker' }
    ], 
    platforms: [
      [0,    700, 1200, 300],
      [1400, 640, 280, 30],
      [1800, 750, 70,  200],
      [2200, 640, 600, 30],
      [3000, 580, 500, 300],
      [3600, 600, 70,  200],
      [4100, 520, 260, 30],
      [4600, 460, 260, 30],
      [5200, 450, 70,  200],
      [5600, 380, 340, 30],
      [6100, 280, 260, 30],
      [6500, 260, 700, 740]
    ],
    hazards: [
      [1500, 632, 220, 8],
      [4200, 512, 200, 8],
      [5700, 372, 180, 8]
    ]
  }
];
