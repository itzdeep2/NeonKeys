const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  updateLanePositions();
});

const STATES = { MENU: 0, PLAYING: 1, GAMEOVER: 2 };
let gameState = STATES.MENU;

const LANES = [
  { key: "D", x: 0, color: "#00f0ff", pressed: false },
  { key: "F", x: 0, color: "#ff007f", pressed: false },
  { key: "J", x: 0, color: "#ffe600", pressed: false },
  { key: "K", x: 0, color: "#00ff66", pressed: false },
];

function updateLanePositions() {
  const laneWidth = 92;
  const startX = width / 2 - (LANES.length * laneWidth) / 2;
  LANES.forEach((lane, i) => {
    lane.x = startX + i * laneWidth;
    lane.width = laneWidth;
  });
}
updateLanePositions();

let notes = [];
let particles = [];
let floatingTexts = [];
let score = 0;
let highScore = localStorage.getItem("neonKeysHighScore") || 0; // Load saved score
let combo = 0;
let maxCombo = 0;
let health = 100;
let bpm = 130;
let beatInterval = (60 / bpm) * 1000;
let lastBeat = 0;
const SPEED = 6.5;
const HIT_TOLERANCE = 55;

function resetGame() {
  notes = [];
  particles = [];
  floatingTexts = [];
  score = 0;
  combo = 0;
  maxCombo = 0;
  health = 100;
  bpm = 130;
  beatInterval = (60 / bpm) * 1000;
  gameState = STATES.PLAYING;
}

function checkHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("neonKeysHighScore", highScore);
  }
}

function spawnNote() {
  const laneIdx = Math.floor(Math.random() * LANES.length);
  notes.push({ lane: laneIdx, y: -20, speed: SPEED });
}

function spawnParticles(x, y, color) {
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      color,
    });
  }
}

function addJudgement(text, color) {
  floatingTexts.push({ text, color, y: height - 160, alpha: 1.0 });
}

window.addEventListener("keydown", (e) => {
  if (typeof initAudio === "function") initAudio();
  
  if (gameState === STATES.MENU || gameState === STATES.GAMEOVER) {
    if (e.code === "Space") resetGame();
    return;
  }

  if (e.repeat) return;
  const key = e.key.toUpperCase();
  const lane = LANES.find((l) => l.key === key);
  if (!lane) return;

  lane.pressed = true;
  const laneIdx = LANES.indexOf(lane);
  const hitZoneY = height - 110;

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
    if (combo > maxCombo) maxCombo = combo;
    health = Math.min(100, health + 4);

    if (minDist < 20) {
      score += 300;
      addJudgement("PERFECT", "#00f0ff");
    } else {
      score += 150;
      addJudgement("GOOD", "#ffe600");
    }

    if (typeof playHit === "function") playHit(laneIdx);
    spawnParticles(lane.x + lane.width / 2, hitZoneY, lane.color);
  } else {
    combo = 0;
    health -= 8;
    addJudgement("MISS", "#ff0055");
    if (typeof playMiss === "function") playMiss();
    if (health <= 0) {
      checkHighScore();
      gameState = STATES.GAMEOVER;
    }
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toUpperCase();
  const lane = LANES.find((l) => l.key === key);
  if (lane) lane.pressed = false;
});

function update(now) {
  if (gameState !== STATES.PLAYING) return;

  if (now - lastBeat >= beatInterval) {
    lastBeat = now;
    spawnNote();
    if (bpm < 185) {
      bpm += 0.08;
      beatInterval = (60 / bpm) * 1000;
    }
  }

  const hitZoneY = height - 110;
  for (let i = notes.length - 1; i >= 0; i--) {
    notes[i].y += notes[i].speed;
    if (notes[i].y > hitZoneY + HIT_TOLERANCE) {
      notes.splice(i, 1);
      combo = 0;
      health -= 6;
      addJudgement("MISS", "#ff0055");
      if (typeof playMiss === "function") playMiss();
      if (health <= 0) {
        checkHighScore();
        gameState = STATES.GAMEOVER;
      }
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.035;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 0.9;
    ft.alpha -= 0.025;
    if (ft.alpha <= 0) floatingTexts.splice(i, 1);
  }
}

function render(now) {
  update(now);

  ctx.fillStyle = "#08090f";
  ctx.fillRect(0, 0, width, height);

  if (gameState === STATES.MENU) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 56px monospace";
    ctx.fillText("NEONKEYS", width / 2, height / 2 - 60);

    ctx.fillStyle = "#ffffff";
    ctx.font = "20px monospace";
    ctx.fillText("A Tagless Rhythm Typing Game", width / 2, height / 2 - 10);

    ctx.fillStyle = "#ffe600";
    ctx.font = "18px monospace";
    ctx.fillText(`HIGH SCORE: ${highScore}`, width / 2, height / 2 + 25);

    ctx.fillStyle = "#ff007f";
    ctx.font = "bold 22px monospace";
    ctx.fillText("PRESS [SPACE] TO START", width / 2, height / 2 + 70);

    ctx.fillStyle = "#636e85";
    ctx.font = "16px monospace";
    ctx.fillText("Controls: [D] [F] [J] [K]", width / 2, height / 2 + 110);
    requestAnimationFrame(render);
    return;
  }

  if (gameState === STATES.GAMEOVER) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#ff0055";
    ctx.font = "bold 54px monospace";
    ctx.fillText("GAME OVER", width / 2, height / 2 - 60);

    ctx.fillStyle = "#fff";
    ctx.font = "22px monospace";
    ctx.fillText(`Final Score: ${score}`, width / 2, height / 2 - 10);
    ctx.fillText(`Max Combo: ${maxCombo}x`, width / 2, height / 2 + 25);
    
    ctx.fillStyle = "#ffe600";
    ctx.font = "18px monospace";
    ctx.fillText(`High Score: ${highScore}`, width / 2, height / 2 + 55);

    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 20px monospace";
    ctx.fillText("PRESS [SPACE] TO RETRY", width / 2, height / 2 + 110);
    requestAnimationFrame(render);
    return;
  }

  const hitZoneY = height - 110;

  LANES.forEach((l) => {
    if (l.pressed) {
      ctx.fillStyle = `${l.color}22`;
      ctx.fillRect(l.x, 0, l.width, height);
    }
    ctx.strokeStyle = l.pressed ? l.color : "#171a29";
    ctx.lineWidth = l.pressed ? 2 : 1;
    ctx.strokeRect(l.x, 0, l.width, height);
    ctx.fillStyle = l.pressed ? l.color : "#5c6982";
    ctx.textAlign = "center";
    ctx.font = "bold 22px monospace";
    ctx.fillText(l.key, l.x + l.width / 2, height - 40);
  });

  ctx.fillStyle = "#2c354f";
  ctx.fillRect(LANES[0].x, hitZoneY, LANES.length * LANES[0].width, 6);

  notes.forEach((n) => {
    const lane = LANES[n.lane];
    ctx.fillStyle = lane.color;
    ctx.shadowColor = lane.color;
    ctx.shadowBlur = 12;
    ctx.fillRect(lane.x + 8, n.y, lane.width - 16, 20);
  });
  ctx.shadowBlur = 0;

  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillRect(p.x, p.y, 4, 4);
  });
  ctx.globalAlpha = 1.0;

  floatingTexts.forEach((ft) => {
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText(ft.text, width / 2, ft.y);
  });
  ctx.globalAlpha = 1.0;

  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px monospace";
  ctx.fillText(`SCORE: ${score}`, 40, 50);

  ctx.fillStyle = combo > 5 ? "#ffe600" : "#5c6982";
  ctx.fillText(`COMBO: ${combo}x`, 40, 80);

  ctx.fillStyle = "#1e2233";
  ctx.fillRect(40, 105, 160, 12);
  ctx.fillStyle = health > 30 ? "#00ff66" : "#ff0055";
  ctx.fillRect(40, 105, (160 * health) / 100, 12);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);