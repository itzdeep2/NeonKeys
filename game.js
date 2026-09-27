const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  updateLanePositions();
});

const LANES = [
  { key: "D", x: 0, color: "#00f0ff" },
  { key: "F", x: 0, color: "#ff007f" },
  { key: "J", x: 0, color: "#ffe600" },
  { key: "K", x: 0, color: "#00ff66" },
];

function updateLanePositions() {
  const laneWidth = 90;
  const startX = width / 2 - (LANES.length * laneWidth) / 2;
  LANES.forEach((lane, i) => {
    lane.x = startX + i * laneWidth;
    lane.width = laneWidth;
  });
}
updateLanePositions();

let notes = [];
let score = 0;
let combo = 0;
let lastSpawn = 0;
const SPEED = 6;
const HIT_TOLERANCE = 50;

function spawnNote() {
  const laneIdx = Math.floor(Math.random() * LANES.length);
  notes.push({ lane: laneIdx, y: -20, speed: SPEED });
}

window.addEventListener("keydown", (e) => {
  const key = e.key.toUpperCase();
  const laneIdx = LANES.findIndex((l) => l.key === key);
  if (laneIdx === -1) return;

  const hitZoneY = height - 100;
  let hitIndex = -1;

  for (let i = 0; i < notes.length; i++) {
    if (notes[i].lane === laneIdx) {
      const dist = Math.abs(notes[i].y - hitZoneY);
      if (dist < HIT_TOLERANCE) {
        hitIndex = i;
        break;
      }
    }
  }

  if (hitIndex !== -1) {
    notes.splice(hitIndex, 1);
    combo++;
    score += 100 * Math.min(combo, 8);
  } else {
    combo = 0; // miss penalty
  }
});

function update() {
  const now = performance.now();
  if (now - lastSpawn > 550) {
    spawnNote();
    lastSpawn = now;
  }

  const hitZoneY = height - 100;
  for (let i = notes.length - 1; i >= 0; i--) {
    notes[i].y += notes[i].speed;
    if (notes[i].y > hitZoneY + HIT_TOLERANCE) {
      notes.splice(i, 1);
      combo = 0;
    }
  }
}

function render() {
  update();

  ctx.fillStyle = "#0c0d14";
  ctx.fillRect(0, 0, width, height);

  const hitZoneY = height - 100;
  ctx.fillStyle = "#202538";
  ctx.fillRect(LANES[0].x, hitZoneY, LANES.length * 90, 8);

  LANES.forEach((l) => {
    ctx.strokeStyle = "#1b1f30";
    ctx.strokeRect(l.x, 0, l.width, height);
    ctx.fillStyle = "#8a99ad";
    ctx.font = "bold 22px monospace";
    ctx.fillText(l.key, l.x + 36, height - 40);
  });

  notes.forEach((n) => {
    const lane = LANES[n.lane];
    ctx.fillStyle = lane.color;
    ctx.fillRect(lane.x + 8, n.y, lane.width - 16, 18);
  });

  // Score stats
  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.fillText(`Score: ${score}`, 40, 60);
  ctx.fillStyle = combo > 4 ? "#ffe600" : "#8a99ad";
  ctx.fillText(`Combo: ${combo}x`, 40, 90);

  requestAnimationFrame(render);
}

render();