const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const LANES = [
  { key: "D", x: 0 },
  { key: "F", x: 0 },
  { key: "J", x: 0 },
  { key: "K", x: 0 },
];

function updateLanePositions() {
  const laneWidth = 100;
  const startX = width / 2 - (LANES.length * laneWidth) / 2;
  LANES.forEach((lane, i) => {
    lane.x = startX + i * laneWidth;
    lane.width = laneWidth;
  });
}

updateLanePositions();

function render() {
  ctx.fillStyle = "#0b0c16";
  ctx.fillRect(0, 0, width, height);

  // draw lanes
  LANES.forEach((l) => {
    ctx.strokeStyle = "#1f2438";
    ctx.strokeRect(l.x, 0, l.width, height);

    ctx.fillStyle = "#6b7280";
    ctx.font = "20px monospace";
    ctx.fillText(l.key, l.x + 40, height - 50);
  });

  requestAnimationFrame(render);
}

render();