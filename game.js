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
let lastSpawn = 0;
const SPEED = 5;

function spawnNote() {
  const laneIdx = Math.floor(Math.random() * LANES.length);
  notes.push({
    lane: laneIdx,
    y: -30,
    speed: SPEED,
  });
}

function update() {
  const now = performance.now();
  if (now - lastSpawn > 600) {
    spawnNote();
    lastSpawn = now;
  }

  for (let i = notes.length - 1; i >= 0; i--) {
    notes[i].y += notes[i].speed;
    // off screen clean up
    if (notes[i].y > height) {
      notes.splice(i, 1);
    }
  }
}

function render() {
  update();

  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(0, 0, width, height);

  // hit target bar
  const hitZoneY = height - 100;
  ctx.fillStyle = "#22263a";
  ctx.fillRect(LANES[0].x, hitZoneY, LANES.length * 90, 8);

  // lanes
  LANES.forEach((l) => {
    ctx.strokeStyle = "#1b1e2e";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(l.x, 0, l.width, height);

    ctx.fillStyle = "#8a99ad";
    ctx.font = "bold 22px monospace";
    ctx.fillText(l.key, l.x + 36, height - 40);
  });

  // notes
  notes.forEach((n) => {
    const lane = LANES[n.lane];
    ctx.fillStyle = lane.color;
    ctx.fillRect(lane.x + 8, n.y, lane.width - 16, 20);
  });

  requestAnimationFrame(render);
}

render();