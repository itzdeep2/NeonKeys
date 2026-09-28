# NeonKeys

A fast-paced neon rhythm typing game built for the Hack Club Tagless challenge.

## Description

NeonKeys is a rhythm web game where notes fall down four neon lanes and you have to hit the matching keys on beat before they pass the target line. The challenge behind this project  rules: I wasn't allowed to use standard HTML elements like `<div>`, `<p>`, `<span>`, `<button>`, or `<h1>`. Instead, everything you see on the screen—the menus, falling notes, particle sparks, health bar, combo text, and starfield—is drawn directly onto an HTML5 `<canvas>` using plain JavaScript. The audio also uses the Web Audio API to create synth bleeps on the fly rather than loading standard audio tags.

### Tech Stack
- HTML5 Canvas (for all graphics and UI)
- Vanilla JavaScript (game logic, physics, state loop)
- Web Audio API (real-time sound synthesis)
- CSS (basic reset and background setup)

### Screenshots

| Main Menu | Playing the Game | Game Over |
| :---: | :---: | :---: |
| ![Main Menu](screenshots/ss1.png) | ![Playing](screenshots/ss2.png) | ![Game Over](screenshots/ss3.png) |

---

## Rule Compliance
This codebase strictly follows the rules of the Hack Club event:
- No prohibited HTML tags were used anywhere in the code.
- Only the 8 allowed shell tags are in `index.html`: `<html>`, `<head>`, `<body>`, `<meta>`, `<title>`, `<style>`, `<script>`, and `<canvas>`.
- All HUD counters, buttons, game screens, and floating text ratings are drawn via canvas methods (`ctx.fillText`, `ctx.fillRect`).

---

## Getting Started

### Dependencies
- Any modern web browser that supports HTML5 Canvas and the Web Audio API (Chrome, Firefox, Safari, Edge, Brave).
- No Node modules, npm packages, or external build tools are required.

### Installing
You can either clone the repo with git:
```bash
git clone [https://github.com/itzdeep2/NeonKeys.git](https://github.com/itzdeep2/NeonKeys.git)
cd NeonKeys
