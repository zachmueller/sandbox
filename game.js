// 8-Bit Platformer Game
(function () {
  // Constants
  var W = 800, H = 480, TILE = 32;
  var GRAV = 0.6, FRIC = 0.82, PSPD = 3.5, PJMP = -11, ESPD = 1;

  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;

  var overlay = document.getElementById("overlay");
  var scoreEl = document.getElementById("score");
  var livesEl = document.getElementById("lives");

  var state = "title"; // title | playing | dead | win | gameover
  var score = 0, lives = 3;
  var cam = { x: 0 };
  var deathTimer = 0, winTimer = 0;
  var particles = [];

  // Level data
  // . = empty, 1 = ground, 2 = brick, 4 = coin
  // 5 = walker enemy, 6 = jumper enemy, 7 = player start, 8 = flag, 9 = spike
  var ROWS = 15;
  var level = [
    "................................................................",
    "................................................................",
    "................................................................",
    "...........................44..........4........................",
    "..........................2222............................44....",
    ".......................4...........222.....................22....",
    "....44................222....................................8..",
    "...2222.......44.............4.......44....22..........222.111..",
    "..........4..2222...44......222....2222..........44.......111..",
    ".....4...222.......2222......................4..2222...4...111..",
    "....222..............................................222...111..",
    "..................................................9...9...111..",
    ".7.......5......5.........6..........5...6.......999.99...111..",
    "1111111111111111111..111111111111.1111111111..1111111111111111..",
    "1111111111111111111..111111111111.1111111111..1111111111111111.."
  ];
  var COLS = level[0].length;

  // Tile helpers
  function tileAt(c, r) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return 0;
    var ch = level[r][c];
    if (ch === "1") return 1;
    if (ch === "2") return 2;
    if (ch === "9") return 9;
    return 0;
  }
  function solid(t) { return t === 1 || t === 2; }

  function solidNear(e) {
    var out = [];
    var l = Math.floor(e.x / TILE) - 1;
    var r = Math.floor((e.x + e.w) / TILE) + 1;
    var t = Math.floor(e.y / TILE) - 1;
    var b = Math.floor((e.y + e.h) / TILE) + 1;
    for (var row = t; row <= b; row++)
      for (var col = l; col <= r; col++)
        if (solid(tileAt(col, row)))
          out.push({ x: col * TILE, y: row * TILE, w: TILE, h: TILE });
    return out;
  }

  function spikeNear(e) {
    var out = [];
    var l = Math.floor(e.x / TILE) - 1;
    var r = Math.floor((e.x + e.w) / TILE) + 1;
    var t = Math.floor(e.y / TILE) - 1;
    var b = Math.floor((e.y + e.h) / TILE) + 1;
    for (var row = t; row <= b; row++)
      for (var col = l; col <= r; col++)
        if (tileAt(col, row) === 9)
          out.push({ x: col * TILE, y: row * TILE, w: TILE, h: TILE });
    return out;
  }

  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Particles
  function spawnPart(x, y, color, n) {
    for (var i = 0; i < n; i++)
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 1) * 5,
        life: 30 + Math.random() * 20,
        color: color, size: 2 + Math.random() * 4
      });
  }

  // Player
  var P = { x: 0, y: 0, w: 24, h: 28, vx: 0, vy: 0, ground: false, face: 1, anim: 0, inv: 0, alive: true };

  function pUpdate() {
    if (!P.alive) return;
    if (keys.left) { P.vx -= PSPD * 0.35; P.face = -1; }
    if (keys.right) { P.vx += PSPD * 0.35; P.face = 1; }
    if (keys.jp && P.ground) { P.vy = PJMP; P.ground = false; keys.jp = false; }
    P.vx *= FRIC;
    if (Math.abs(P.vx) > PSPD) P.vx = PSPD * Math.sign(P.vx);
    if (Math.abs(P.vx) < 0.1) P.vx = 0;
    P.vy += GRAV;
    if (P.vy > 12) P.vy = 12;
    P.x += P.vx; pColX();
    P.y += P.vy; pColY();
    P.anim = Math.abs(P.vx) > 0.5 ? P.anim + 0.15 : 0;
    if (P.inv > 0) P.inv--;
    if (P.y > H + 50) pDie();
    if (P.inv <= 0) {
      var sp = spikeNear(P);
      for (var i = 0; i < sp.length; i++)
        if (overlap(P, sp[i])) { pDie(); break; }
    }
  }

  function pColX() {
    var ts = solidNear(P);
    for (var i = 0; i < ts.length; i++) {
      var t = ts[i];
      if (overlap(P, t)) {
        if (P.vx > 0) { P.x = t.x - P.w; P.vx = 0; }
        else if (P.vx < 0) { P.x = t.x + TILE; P.vx = 0; }
      }
    }
  }

  function pColY() {
    P.ground = false;
    var ts = solidNear(P);
    for (var i = 0; i < ts.length; i++) {
      var t = ts[i];
      if (overlap(P, t)) {
        if (P.vy > 0) { P.y = t.y - P.h; P.vy = 0; P.ground = true; }
        else if (P.vy < 0) { P.y = t.y + TILE; P.vy = 0; }
      }
    }
  }

  function pDie() {
    if (!P.alive) return;
    P.alive = false; lives--;
    spawnPart(P.x + P.w / 2, P.y + P.h / 2, "#4488ff", 12);
  }

  function pDraw() {
    if (!P.alive) return;
    if (P.inv > 0 && Math.floor(P.inv / 3) % 2 === 0) return;
    var sx = Math.floor(P.x - cam.x), sy = Math.floor(P.y);
    ctx.fillStyle = "#4488ff"; ctx.fillRect(sx + 2, sy + 8, 20, 20);
    ctx.fillStyle = "#ffcc88"; ctx.fillRect(sx + 4, sy, 16, 12);
    ctx.fillStyle = "#000";
    if (P.face > 0) ctx.fillRect(sx + 14, sy + 3, 3, 3);
    else ctx.fillRect(sx + 7, sy + 3, 3, 3);
    ctx.fillStyle = "#2255aa";
    ctx.fillRect(sx + 4, sy + 26, 6, 4);
    ctx.fillRect(sx + 14, sy + 26, 6, 4);
    var ao = P.ground ? 0 : -4;
    ctx.fillStyle = "#4488ff";
    ctx.fillRect(sx - 2, sy + 12 + ao, 4, 8);
    ctx.fillRect(sx + 22, sy + 12 + ao, 4, 8);
  }

  // Enemies
  var enemies = [];
  function mkEnemy(x, y, type) {
    return { x: x, y: y, w: 28, h: 28, vx: -ESPD, vy: 0, type: type, alive: true, ground: false, anim: 0, jt: 0 };
  }

  function eUpdate(e) {
    if (!e.alive) return;
    e.vy += GRAV; if (e.vy > 12) e.vy = 12;
    e.x += e.vx; eColX(e);
    e.y += e.vy; eColY(e);
    if (e.type === "j" && e.ground) { e.jt++; if (e.jt > 60) { e.vy = -9; e.ground = false; e.jt = 0; } }
    e.anim += 0.1;
    if (e.y > H + 100) e.alive = false;
  }

  function eColX(e) {
    var ts = solidNear(e);
    for (var i = 0; i < ts.length; i++) {
      var t = ts[i];
      if (overlap(e, t)) {
        if (e.vx > 0) { e.x = t.x - e.w; e.vx = -ESPD; }
        else if (e.vx < 0) { e.x = t.x + TILE; e.vx = ESPD; }
      }
    }
    if (e.type === "w" && e.ground) {
      var cx = e.vx > 0 ? e.x + e.w + 2 : e.x - 2;
      var cy = e.y + e.h + 4;
      var col = Math.floor(cx / TILE), row = Math.floor(cy / TILE);
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        if (!solid(tileAt(col, row))) e.vx = -e.vx;
      }
    }
  }

  function eColY(e) {
    e.ground = false;
    var ts = solidNear(e);
    for (var i = 0; i < ts.length; i++) {
      var t = ts[i];
      if (overlap(e, t)) {
        if (e.vy > 0) { e.y = t.y - e.h; e.vy = 0; e.ground = true; }
        else if (e.vy < 0) { e.y = t.y + TILE; e.vy = 0; }
      }
    }
  }

  function eKill(e) {
    e.alive = false; score += 100;
    spawnPart(e.x + e.w / 2, e.y + e.h / 2, e.type === "w" ? "#ff4444" : "#aa44ff", 8);
  }

  function eDraw(e) {
    if (!e.alive) return;
    var sx = Math.floor(e.x - cam.x), sy = Math.floor(e.y);
    if (e.type === "w") {
      ctx.fillStyle = "#ff4444"; ctx.fillRect(sx + 2, sy + 2, 24, 24);
      ctx.fillStyle = "#fff";
      ctx.fillRect(sx + 6, sy + 8, 5, 5); ctx.fillRect(sx + 17, sy + 8, 5, 5);
      ctx.fillStyle = "#000";
      ctx.fillRect(sx + 8, sy + 10, 3, 3); ctx.fillRect(sx + 19, sy + 10, 3, 3);
      ctx.fillRect(sx + 5, sy + 6, 6, 2); ctx.fillRect(sx + 17, sy + 6, 6, 2);
      ctx.fillStyle = "#cc2222";
      ctx.fillRect(sx + 3, sy + 25, 8, 4); ctx.fillRect(sx + 17, sy + 25, 8, 4);
    } else {
      ctx.fillStyle = "#aa44ff";
      ctx.fillRect(sx + 4, sy + 6, 20, 22); ctx.fillRect(sx + 8, sy + 2, 12, 6);
      ctx.fillStyle = "#fff";
      ctx.fillRect(sx + 8, sy + 10, 5, 5); ctx.fillRect(sx + 17, sy + 10, 5, 5);
      ctx.fillStyle = "#000";
      ctx.fillRect(sx + 10, sy + 12, 3, 3); ctx.fillRect(sx + 19, sy + 12, 3, 3);
      ctx.fillStyle = "#7722cc";
      var sp = e.ground ? 0 : -3;
      ctx.fillRect(sx + 6, sy + 26 + sp, 6, 4); ctx.fillRect(sx + 18, sy + 26 + sp, 6, 4);
    }
  }

  // Coins
  var coins = [];
  function mkCoin(x, y) { return { x: x, y: y, w: 16, h: 16, got: false, a: Math.random() * 6.28 }; }
  function cDraw(c) {
    if (c.got) return;
    c.a += 0.08;
    var sx = Math.floor(c.x - cam.x), sy = Math.floor(c.y + Math.sin(c.a) * 3);
    ctx.fillStyle = "#ffdd00"; ctx.fillRect(sx + 2, sy + 1, 12, 14);
    ctx.fillStyle = "#ffaa00"; ctx.fillRect(sx + 5, sy + 3, 6, 10);
    ctx.fillStyle = "#ffee66"; ctx.fillRect(sx + 4, sy + 2, 2, 4);
  }

  // Flag
  var flag = null, flagA = 0;
  function fDraw() {
    if (!flag) return;
    flagA += 0.06;
    var sx = Math.floor(flag.x - cam.x), sy = Math.floor(flag.y);
    ctx.fillStyle = "#ccc"; ctx.fillRect(sx + 14, sy - 32, 4, 64);
    var wv = Math.sin(flagA) * 2;
    ctx.fillStyle = "#44ff44"; ctx.fillRect(sx + 18, sy - 28 + wv, 16, 12);
    ctx.fillStyle = "#22cc22"; ctx.fillRect(sx + 18, sy - 24 + wv, 16, 4);
  }

  // Init
  function initLevel() {
    enemies = []; coins = []; flag = null; particles = [];
    lives = 3; score = 0;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var ch = level[r][c], px = c * TILE, py = r * TILE;
        if (ch === "7") { P.x = px + 4; P.y = py; P.vx = 0; P.vy = 0; P.alive = true; P.inv = 0; P.ground = false; }
        else if (ch === "5") enemies.push(mkEnemy(px + 2, py + 4, "w"));
        else if (ch === "6") enemies.push(mkEnemy(px + 2, py + 4, "j"));
        else if (ch === "4") coins.push(mkCoin(px + 8, py + 8));
        else if (ch === "8") flag = { x: px, y: py };
      }
    }
    cam.x = 0;
  }

  function resetP() {
    for (var r = 0; r < ROWS; r++)
      for (var c = 0; c < COLS; c++)
        if (level[r][c] === "7") {
          P.x = c * TILE + 4; P.y = r * TILE; P.vx = 0; P.vy = 0;
          P.alive = true; P.inv = 90; P.ground = false;
          return;
        }
  }

  // Input
  var keys = { left: false, right: false, jump: false, jp: false };
  window.addEventListener("keydown", function (e) {
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
      if (!keys.jump) keys.jp = true;
      keys.jump = true; e.preventDefault();
    }
  });
  window.addEventListener("keyup", function (e) {
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") { keys.jump = false; keys.jp = false; }
  });

  // Background
  function drawBg() {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#1a1a3e"); g.addColorStop(0.5, "#2a2a5e"); g.addColorStop(1, "#3a2a4e");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Stars
    ctx.fillStyle = "#ffffff33";
    var sd = [23, 67, 134, 189, 245, 312, 378, 423, 489, 534, 590, 645, 710, 756, 823, 880, 934, 989];
    for (var i = 0; i < sd.length; i++) {
      var sx = ((sd[i] * 3 + i * 47 - cam.x * 0.1) % (W + 100) + W + 100) % (W + 100) - 20;
      var sy = (sd[i] * 2 + i * 31) % (H * 0.6);
      var sz = (i % 3 === 0) ? 3 : 2;
      ctx.fillRect(sx, sy, sz, sz);
    }
    // Mountains
    ctx.fillStyle = "#2a1a3e";
    for (var i = 0; i < 10; i++) {
      var mx = ((i * 200 - cam.x * 0.15) % 2000 + 2000) % 2000 - 200;
      tri(mx, H - 60, 180, 80 + (i * 37 % 60));
    }
    ctx.fillStyle = "#3a2a4e";
    for (var i = 0; i < 15; i++) {
      var mx = ((i * 140 - cam.x * 0.3) % 2100 + 2100) % 2100 - 140;
      tri(mx, H - 30, 120, 40 + (i * 23 % 40));
    }
  }

  function tri(x, base, w, h) {
    ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x + w / 2, base - h); ctx.lineTo(x + w, base); ctx.closePath(); ctx.fill();
  }

  // Tiles
  function drawTiles() {
    var sc = Math.max(0, Math.floor(cam.x / TILE) - 1);
    var ec = Math.min(COLS - 1, sc + Math.ceil(W / TILE) + 2);
    for (var r = 0; r < ROWS; r++) {
      for (var c = sc; c <= ec; c++) {
        var t = tileAt(c, r); if (!t) continue;
        var sx = c * TILE - Math.floor(cam.x), sy = r * TILE;
        if (t === 1) {
          ctx.fillStyle = "#5a3a1e"; ctx.fillRect(sx, sy, TILE, TILE);
          ctx.fillStyle = "#6a4a2e";
          ctx.fillRect(sx + 4, sy + 8, 4, 4); ctx.fillRect(sx + 20, sy + 16, 4, 4); ctx.fillRect(sx + 12, sy + 24, 4, 4);
          if (!solid(tileAt(c, r - 1))) {
            ctx.fillStyle = "#44aa44"; ctx.fillRect(sx, sy, TILE, 5);
            ctx.fillStyle = "#55cc55";
            ctx.fillRect(sx + 2, sy, 4, 2); ctx.fillRect(sx + 14, sy, 6, 2); ctx.fillRect(sx + 26, sy, 4, 2);
          }
        } else if (t === 2) {
          ctx.fillStyle = "#c84b31"; ctx.fillRect(sx, sy, TILE, TILE);
          ctx.fillStyle = "#a83b21";
          ctx.fillRect(sx, sy + 7, TILE, 2); ctx.fillRect(sx, sy + 16, TILE, 2); ctx.fillRect(sx, sy + 25, TILE, 2);
          ctx.fillRect(sx + 15, sy, 2, 8); ctx.fillRect(sx + 7, sy + 9, 2, 7); ctx.fillRect(sx + 23, sy + 9, 2, 7);
          ctx.fillStyle = "#d85b41"; ctx.fillRect(sx + 1, sy + 1, 6, 5);
        } else if (t === 9) {
          ctx.fillStyle = "#cc3333";
          for (var s = 0; s < 4; s++) {
            var tx = sx + s * 8;
            ctx.beginPath(); ctx.moveTo(tx, sy + TILE); ctx.lineTo(tx + 4, sy + 12); ctx.lineTo(tx + 8, sy + TILE); ctx.closePath(); ctx.fill();
          }
          ctx.fillStyle = "#ff6666";
          for (var s = 0; s < 4; s++) ctx.fillRect(sx + s * 8 + 3, sy + 14, 2, 4);
        }
      }
    }
  }

  // Particles update/draw
  function updPart() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }
  function drawPart() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = Math.max(0, p.life / 50);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x - cam.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function updCam() {
    var tx = P.x - W / 3;
    cam.x += (tx - cam.x) * 0.1;
    if (cam.x < 0) cam.x = 0;
    var mx = COLS * TILE - W;
    if (cam.x > mx) cam.x = mx;
  }

  function updUI() {
    scoreEl.textContent = "SCORE: " + score;
    var h = "";
    for (var i = 0; i < lives; i++) h += "\u2665";
    livesEl.textContent = "LIVES: " + h;
  }

  // Main loop
  function update() {
    if (state === "playing") {
      pUpdate();

      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        eUpdate(e);
        if (e.alive && P.alive && P.inv <= 0) {
          if (overlap(P, e)) {
            // Stomp from above
            if (P.vy > 0 && P.y + P.h - e.y < 14) {
              eKill(e);
              P.vy = -8;
            } else {
              pDie();
            }
          }
        }
      }

      // Coin collection
      for (var i = 0; i < coins.length; i++) {
        var c = coins[i];
        if (!c.got && overlap(P, c)) {
          c.got = true; score += 50;
          spawnPart(c.x + 8, c.y + 8, "#ffdd00", 6);
        }
      }

      // Flag check
      if (flag && P.alive) {
        var fd = { x: flag.x, y: flag.y - 32, w: TILE, h: 64 };
        if (overlap(P, fd)) {
          state = "win"; winTimer = 180;
          spawnPart(P.x + P.w / 2, P.y + P.h / 2, "#44ff44", 20);
          spawnPart(flag.x + 16, flag.y, "#ffdd00", 15);
        }
      }

      updCam();

      // Death handling
      if (!P.alive) {
        deathTimer++;
        if (deathTimer > 60) {
          deathTimer = 0;
          if (lives <= 0) {
            state = "gameover";
          } else {
            resetP();
          }
        }
      }
    } else if (state === "win") {
      winTimer--;
      if (winTimer <= 0) {
        // Show win overlay
      }
    }

    updPart();
    updUI();
  }

  function draw() {
    drawBg();
    drawTiles();
    for (var i = 0; i < coins.length; i++) cDraw(coins[i]);
    fDraw();
    for (var i = 0; i < enemies.length; i++) eDraw(enemies[i]);
    pDraw();
    drawPart();

    // Win text
    if (state === "win") {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#44ff44";
      ctx.font = "bold 48px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("LEVEL COMPLETE!", W / 2, H / 2 - 20);
      ctx.fillStyle = "#ffdd00";
      ctx.font = "24px 'Courier New', monospace";
      ctx.fillText("SCORE: " + score, W / 2, H / 2 + 20);
      ctx.fillStyle = "#aaa";
      ctx.font = "16px 'Courier New', monospace";
      ctx.fillText("Press SPACE to play again", W / 2, H / 2 + 60);
      ctx.textAlign = "start";
    }

    // Game over text
    if (state === "gameover") {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#e94560";
      ctx.font = "bold 48px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", W / 2, H / 2 - 20);
      ctx.fillStyle = "#fff";
      ctx.font = "24px 'Courier New', monospace";
      ctx.fillText("SCORE: " + score, W / 2, H / 2 + 20);
      ctx.fillStyle = "#aaa";
      ctx.font = "16px 'Courier New', monospace";
      ctx.fillText("Press SPACE to try again", W / 2, H / 2 + 60);
      ctx.textAlign = "start";
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // State transitions via space
  window.addEventListener("keydown", function (e) {
    if (e.code !== "Space") return;
    if (state === "title") {
      overlay.classList.add("hidden");
      initLevel();
      state = "playing";
    } else if (state === "win" || state === "gameover") {
      initLevel();
      state = "playing";
    }
  });

  // Start
  initLevel();
  loop();
})();