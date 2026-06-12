// ============================================================
// MIND IN MOTION — levels.js (The Complete 5-Chapter Arc)
// Platforms: [x, y, width, height] · Hazards: [x, y, width, height]
// Hazards are fields of frozen static. Touch = back to checkpoint.
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
      { x: 3200, y: 500 }
    ],
    exit: { x: 7350, y: 440, w: 40, h: 120 },
    platforms: [
      [0,    600, 1400, 300],
      [1650, 560, 280, 30],
      [2150, 500, 350, 30],
      [2700, 600, 1800, 300],   
      [4800, 480, 250, 30],
      [5350, 540, 2100, 360],   // Extended platform bounds to encompass the exit coordinate
      [7450, 0, 40, 900]        // Shifted boundary wall cleanly behind the portal path
    ],
    hazards: [
      [700,  592, 500, 8],
      [3400, 592, 600, 8]
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
      { x: 4400, y: 800 }
    ],
    exit: { x: 8500, y: 700, w: 40, h: 120 }, // Shifted back away from the wall plane to prevent overlapping
    platforms: [
      [0,    800, 900, 400],
      [1300, 900, 500, 40],
      [2100, 850, 120, 400],
      [2650, 750, 120, 500],
      [3100, 650, 2200, 600],   
      [5700, 800, 700, 40],
      [6750, 900, 1900, 300],
      [8650, 0, 40, 1200]
    ],
    hazards: [
      [3500, 642, 900, 8],
      [7100, 892, 700, 8]
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
    checkpoints: [],                        
    exit: { x: 4850, y: 380, w: 40, h: 120 },
    platforms: [
      [0,    600, 1200, 300],
      [1450, 540, 350, 30],
      [2000, 480, 350, 30],
      [2550, 420, 900, 500],
      [3650, 450, 350, 30],
      [4200, 500, 1000, 400]
    ],
    hazards: []                             
  }
];
