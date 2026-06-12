// ============================================================
// MIND IN MOTION — levels.js
// Platforms: [x, y, width, height] · Hazards: [x, y, width, height]
// Hazards are fields of frozen static. Touch = back to checkpoint.
// ============================================================

const LEVELS = [
  {
    name: "STATIC",
    subtitle: "CHAPTER I",
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
      [0,    640, 1100, 260],   // long open start — learn to run
      [1240, 640, 500, 260],    // first gap
      [1900, 640, 420, 260],    // wider gap
      [2320, 560, 180, 26],     // first climb
      [2560, 470, 180, 26],
      [2840, 640, 700, 260],    // ground + checkpoint
      [3640, 560, 160, 26],     // ascent to the walkway
      [3900, 470, 160, 26],
      [4160, 400, 900, 26],     // high walkway — the quiet view
      [5160, 640, 800, 260],    // descent into static fields
      [6080, 640, 1120, 260],   // final stretch + checkpoint + exit
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
      [0,    640, 520, 260],    // last solid ground
      [640,  580, 130, 22],
      [860,  520, 130, 22],
      [1080, 580, 130, 22],
      [1300, 500, 130, 22],
      [1520, 560, 200, 22],     // checkpoint ledge
      [1840, 480, 130, 22],
      [2060, 420, 130, 22],
      [2280, 480, 130, 22],
      [2500, 540, 130, 22],
      [2720, 480, 220, 22],     // checkpoint ledge
      [3060, 420, 130, 22],
      [3280, 360, 130, 22],
      [3500, 420, 130, 22],
      [3720, 480, 130, 22],
      [3940, 420, 240, 22],     // checkpoint ledge
      [4300, 360, 130, 22],
      [4520, 300, 130, 22],
      [4740, 360, 130, 22],
      [4960, 300, 400, 22],     // rest ledge with a doubt-field
      [5480, 360, 130, 22],
      [5700, 300, 130, 22],
      [5920, 240, 130, 22],
      [6140, 300, 130, 22],
      [6360, 240, 460, 22],     // checkpoint ledge
      [6940, 300, 130, 22],
      [7160, 240, 130, 22],
      [7380, 180, 130, 22],
      [7600, 240, 800, 22],     // final approach
      [-40,  200, 40, 640],
      [8400, 0, 40, 840]
    ],
    hazards: [
      [2300, 472, 90, 8],
      [5080, 292, 120, 8],
      [6600, 232, 100, 8]
    ]
  }
];
