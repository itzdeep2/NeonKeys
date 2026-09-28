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
  { key: "D", x: 0, color: "#00f0ff", pressed: false },
  { key: "F", x: 0, color: "#ff007f", pressed: false },
  { key: "J", x: 0, color: "#ffe600", pressed: false },
  { key: "K", x: 0, color: "#00ff66", pressed: false },
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
const HIT_TOLERANCE = 55;

function spawnNote() {
  const laneIdx = Math.floor(Math.random() * LANES.length);
  notes.push({ lane: laneIdx, y: -20, speed: SPEED });
}

window.addEventListener("keydown", (e) => {
  // unlock Web Audio context on the first user interaction
  if (typeof initAudio === "function") {
    initAudio();
  }

  if (e.repeat) return;
  const key = e.key.toUpperCase();
  const lane = LANES.find((l) => l.key === key);
  if (!lane) return;

  lane.pressed = true;
  const laneIdx = LANES.indexOf(lane);
  const hitZoneY = height - 100;

  let closestIdx = -1;
  let minDist = Infinity;

  for (let i = 0; i < notes.length; i++) {
    if (notes[i].lane === laneIdx) {
      const dist = Math.abs(notes[i].y - hitZoneY);
      if (dist < HIT_TOLERANCE && dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }
  }

  if (closestIdx !== -1) {
    notes.splice(closestIdx, 1);
    combo++;
    score += 100 * Math.min(combo, 10);
    if (typeof playHit === "function") {
      playHit(laneIdx);
    }
  } else {
    combo = 0;
    if (typeof playMiss === "function") {
      playMiss();
    }
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toUpperCase();
  const lane = LANES.find((l) => l.key === key);
  if (lane) lane.pressed = false;
});

function update() {
  const now = performance.now();
  if (now - lastSpawn > 500) {
    spawnNote();
    lastSpawn = now;
  }

  const hitZoneY = height - 100;
  for (let i = notes.length - 1; i >= 0; i--) {
    notes[i].y += notes[i].speed;
    if (notes[i].y > hitZoneY + HIT_TOLERANCE) {
      notes.splice(i, 1);
      combo = 0;
      if (typeof playMiss === "function") {
        playMiss();
      }
    }
  }
}

function render() {
  update();

  ctx.fillStyle = "#0c0d14";
  ctx.fillRect(0, 0, width, height);

  const hitZoneY = height - 100;

  // Draw lanes and pressed glows
  LANES.forEach((l) => {
    if (l.pressed) {
      ctx.fillStyle = `${l.color}22`;
      ctx.fillRect(l.x, 0, l.width, height);
    }

    ctx.strokeStyle = l.pressed ? l.color : "#1c2033";
    ctx.lineWidth = l.pressed ? 2 : 1;
    ctx.strokeRect(l.x, 0, l.width, height);

    ctx.fillStyle = l.pressed ? l.color : "#8a99ad";
    ctx.font = "bold 22px monospace";
    ctx.fillText(l.key, l.x + 36, height - 40);
  });

  // Target baseline
  ctx.fillStyle = "#333d59";
  ctx.fillRect(LANES[0].x, hitZoneY, LANES.length * 90, 6);

  // Draw falling notes
  notes.forEach((n) => {
    const lane = LANES[n.lane];
    ctx.fillStyle = lane.color;
    ctx.fillRect(lane.x + 8, n.y, lane.width - 16, 18);
  });

  // Stats
  ctx.fillStyle = "#ffffff";
  ctx.font = "18px monospace";
  ctx.fillText(`Score: ${score}`, 40, 50);

  ctx.fillStyle = combo > 4 ? "#ffe600" : "#6c7a91";
  ctx.fillText(`Combo: ${combo}x`, 40, 80);

  requestAnimationFrame(render);
}

render();
// Add particle pool
let particles = [];

function spawnParticles(x, y, color) {
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      color: color,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.04;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function renderParticles() {
  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillRect(p.x, p.y, 4, 4);
  });
  ctx.globalAlpha = 1.0;
}

let floatingTexts = [];

function addJudgement(text, color) {
  floatingTexts.push({
    text: text,
    color: color,
    y: height - 150,
    alpha: 1.0,
  });
}

// In hit detection:
if (closestIdx !== -1) {
  const dist = minDist;
  notes.splice(closestIdx, 1);
  combo++;

  if (dist < 18) {
    score += 250;
    addJudgement("PERFECT", "#00ffcc");
  } else {
    score += 100;
    addJudgement("GOOD", "#ffe600");
  }

  playHit(laneIdx);
  spawnParticles(lane.x + lane.width / 2, hitZoneY, lane.color);
} else {
  combo = 0;
  addJudgement("MISS", "#ff3366");
  playMiss();
}