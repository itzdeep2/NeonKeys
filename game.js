const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// basic loop test
function draw() {
  ctx.fillStyle = "#0d0f18";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff007f";
  ctx.font = "24px monospace";
  ctx.fillText("NeonKeys - Press Any Key", 50, 100);

  requestAnimationFrame(draw);
}

draw();