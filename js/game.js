(function () {
  const HB = (window.HB = window.HB || {});
  const TILE = 16;
  const VW = 384;
  const VH = 224;
  const GRAV = 1800;
  const MAX_WALK = 90;
  const MAX_RUN = 150;
  const JUMP_V = -520;
  const JUMP_CUT = -300;
  const COYOTE = 0.11;
  const BUFFER = 0.13;
  const MAX_FALL = 520;
  const SAVE_KEY = "hopbound-deluxe-v1";

  const canvas = { current: null };
  let ctx = null;
  let state = "title";
  let clock = 0;
  let score = 0;
  let levelScore = 0;
  let coins = 0;
  let lives = 3;
  let unlocked = 1;
  let best = [0, 0, 0, 0];
  let muted = false;
  let mapSel = 0;
  let tokenX = 54;
  let tokenY = 132;
  let def = null;
  let levelIndex = 0;
  let map = null;
  let mapW = 0;
  let mapH = 0;
  let changes = new Map();
  let collected = new Set();
  let qleft = new Map();
  let entities = [];
  let particles = [];
  let popups = [];
  let bumps = [];
  let screenFx = [];
  let player = null;
  let spawn = { x: 48, feet: 176 };
  let camX = 0;
  let camY = 0;
  let shake = 0;
  let flash = 0;
  let bossBeaten = false;
  let introT = 0;
  let deadT = 0;
  let pauseSel = 0;
  let tallyDelay = 0;
  let tallyDone = 0;
  let tallyFinished = false;
  let frozen = false;
  let fps = 60;
  let fpsAcc = 0;
  let fpsFrames = 0;
  let errorText = "";
  let dustT = 0;

  const NODES = [
    { x: 58, y: 138 },
    { x: 146, y: 84 },
    { x: 236, y: 146 },
    { x: 324, y: 78 },
  ];

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.best)) {
        best = [0, 1, 2, 3].map((i) => data.best[i] | 0);
      }
      unlocked = clamp(data.unlocked | 0 || 1, 1, 4);
      muted = !!data.mute;
      HB.audio.setMuted(muted);
    } catch (err) {
      /* keep defaults */
    }
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ unlocked, best, mute: muted }));
    } catch (err) {
      /* private mode */
    }
  }

  function tile(tx, ty) {
    if (tx < 0 || tx >= mapW) return "#";
    if (ty < 0 || ty >= mapH) return ".";
    return map[ty][tx];
  }

  function isSolid(ch) {
    if (ch === "G") return !bossBeaten;
    return "#=B?MF*LQum(){}[]".includes(ch);
  }

  function solidAt(px, py) {
    return isSolid(tile(Math.floor(px / TILE), Math.floor(py / TILE)));
  }

  function setTile(tx, ty, ch) {
    if (tx < 0 || ty < 0 || tx >= mapW || ty >= mapH) return;
    map[ty][tx] = ch;
    changes.set(tx + "," + ty, ch);
  }

  function tilesIn(x, y, w, h) {
    const list = [];
    const x0 = Math.floor(x / TILE);
    const y0 = Math.floor(y / TILE);
    const x1 = Math.floor((x + w - 0.001) / TILE);
    const y1 = Math.floor((y + h - 0.001) / TILE);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) list.push({ tx, ty, t: tile(tx, ty) });
    }
    return list;
  }

  function overlapsSolid(x, y, w, h) {
    return tilesIn(x, y, w, h).some((hit) => isSolid(hit.t));
  }

  function maxCamX() {
    return Math.max(0, mapW * TILE - VW);
  }
  function maxCamY() {
    return Math.max(0, mapH * TILE - VH);
  }

  function makePlayer(x, feet) {
    return {
      x,
      y: feet - 14,
      w: 12,
      h: 14,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      coyote: COYOTE,
      jumpBuf: 0,
      jumping: false,
      form: "small",
      star: 0,
      invuln: 0,
      pending: null,
      dead: false,
      flag: 0,
      flagT: 0,
      pipe: null,
      skid: false,
      prevBottom: feet,
    };
  }

  function spawnEnemy(ch, tx, ty, id) {
    const feet = (ty + 1) * TILE;
    if (ch === "1") {
      entities.push({ kind: "pacer", x: tx * TILE + 1, y: feet - 14, w: 14, h: 14, vx: -42, vy: 0, facing: -1, spawnId: id });
    } else if (ch === "2") {
      entities.push({
        kind: "shell",
        mode: "walk",
        x: tx * TILE + 1,
        y: feet - 14,
        w: 14,
        h: 14,
        vx: -36,
        vy: 0,
        facing: -1,
        wake: 0,
        combo: 0,
        spawnId: id,
      });
    } else if (ch === "3") {
      entities.push({
        kind: "glider",
        x: tx * TILE,
        y: ty * TILE,
        baseY: ty * TILE,
        w: 16,
        h: 12,
        vx: tx % 2 ? 46 : -46,
        phase: tx * 0.7,
        t: 0,
        spawnId: id,
      });
    } else if (ch === "4") {
      entities.push({
        kind: "boss",
        x: tx * TILE - 8,
        y: feet - 30,
        w: 28,
        h: 30,
        vx: -32,
        vy: 0,
        facing: -1,
        hp: 3,
        hurt: 0,
        shotT: 1.2,
        spawnId: id,
      });
    }
  }

  function spawnPlat(ch, tx, ty) {
    entities.push({
      kind: "plat",
      x: tx * TILE,
      y: ty * TILE,
      w: 32,
      h: 8,
      ox: tx * TILE,
      oy: ty * TILE,
      axis: ch === "v" ? "v" : "h",
      phase: (tx * 0.6) % 6,
      range: ch === "v" ? 42 : 48,
      speed: ch === "v" ? 1.15 : 1.25,
      dx: 0,
      dy: 0,
      theme: def.theme,
    });
  }

  function spawnMarkers() {
    let start = null;
    bossBeaten = false;
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const ch = map[y][x];
        const id = ch + ":" + x + ":" + y;
        if (ch === "@") {
          start = { x: x * TILE, feet: (y + 1) * TILE };
          map[y][x] = ".";
        } else if (ch === "1" || ch === "2" || ch === "3" || ch === "4") {
          map[y][x] = ".";
          if (collected.has(id)) {
            if (ch === "4") bossBeaten = true;
            continue;
          }
          spawnEnemy(ch, x, y, id);
        } else if (ch === ">" || ch === "v") {
          map[y][x] = ".";
          spawnPlat(ch, x, y);
        }
      }
    }
    return start || { x: 48, feet: 176 };
  }

  function rebuildMap() {
    map = def.rows.map((row) => row.split(""));
    mapW = map[0].length;
    mapH = map.length;
    for (const [key, ch] of changes) {
      const [x, y] = key.split(",");
      const tx = +x;
      const ty = +y;
      if (map[ty] && map[ty][tx] !== undefined) map[ty][tx] = ch;
    }
  }

  function goLevel(index) {
    levelIndex = index;
    def = HB.levelDefs[index];
    changes = new Map();
    collected = new Set();
    qleft = new Map();
    entities = [];
    particles = [];
    popups = [];
    bumps = [];
    levelScore = 0;
    timeLeft = def.time;
    rebuildMap();
    const start = spawnMarkers();
    player = makePlayer(start.x, start.feet);
    spawn = { x: player.x, feet: start.feet };
    camX = clamp(player.x - 48, 0, maxCamX());
    camY = clamp(player.y - VH * 0.6, 0, maxCamY());
    state = "intro";
    introT = 1.65;
    shake = 0;
    HB.audio.music(def.music);
  }

  let timeLeft = 300;

  function beginRun() {
    score = 0;
    coins = 0;
    lives = 3;
    levelScore = 0;
    mapSel = clamp(mapSel, 0, unlocked - 1);
    state = "map";
    player = null;
    def = null;
    HB.audio.music("map");
  }

  function respawn() {
    entities = [];
    particles = [];
    popups = [];
    rebuildMap();
    spawnMarkers();
    player = makePlayer(spawn.x, spawn.feet);
    player.invuln = 1.5;
    timeLeft = def.time;
    state = "play";
    camX = clamp(player.x - 48, 0, maxCamX());
    HB.audio.music(def.music);
  }

  function addScore(n) {
    score += n;
    levelScore += n;
  }

  function popup(x, y, text) {
    popups.push({ x, y, text: String(text), life: 0.85, vy: -34 });
  }

  function burst(x, y, color, n, spd) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = spd * (0.35 + Math.random() * 0.75);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 30,
        life: 0.35 + Math.random() * 0.35,
        color,
        size: 2 + (Math.random() * 2) | 0,
        g: 520,
      });
    }
    if (particles.length > 200) particles.splice(0, particles.length - 200);
  }

  function addCoin() {
    coins += 1;
    addScore(200);
    HB.audio.sfx("coin");
    if (coins >= 100) {
      coins -= 100;
      lives = Math.min(99, lives + 1);
      HB.audio.sfx("oneup");
      if (player) popup(player.x, player.y - 12, "1-UP");
    }
  }

  function applyForm(form) {
    const want = form === "small" ? 14 : 28;
    if (want > player.h) {
      const newY = player.y - (want - player.h);
      if (overlapsSolid(player.x, newY, player.w, want)) {
        player.pending = form;
        return false;
      }
      player.y = newY;
    } else if (want < player.h) {
      player.y += player.h - want;
    }
    player.h = want;
    player.form = form;
    player.pending = null;
    return true;
  }

  function pickup(item) {
    if (item === "sprout") {
      if (player.form === "small") applyForm("big");
      addScore(1000);
      popup(player.x, player.y - 10, "SPROUT");
      HB.audio.sfx("power");
    } else if (item === "bloom") {
      if (player.form === "small") applyForm("fire");
      else player.form = "fire";
      addScore(1000);
      popup(player.x, player.y - 10, "BLOOM");
      HB.audio.sfx("power");
    } else if (item === "gleam") {
      player.star = 10.5;
      addScore(1000);
      popup(player.x, player.y - 10, "GLEAM");
      HB.audio.music("star");
      HB.audio.sfx("power");
      flash = 0.18;
    } else if (item === "oneup") {
      lives = Math.min(99, lives + 1);
      addScore(1000);
      popup(player.x, player.y - 10, "1-UP");
      HB.audio.sfx("oneup");
    }
  }

  function hurt() {
    if (!player || player.dead || player.flag || player.pipe || player.star > 0 || player.invuln > 0) return;
    if (player.form !== "small") {
      applyForm("small");
      player.pending = null;
      player.invuln = 1.75;
      player.vy = -200;
      HB.audio.sfx("hurt");
      shake = 5;
      flash = 0.12;
    } else {
      die();
    }
  }

  function die() {
    if (!player || player.dead) return;
    player.dead = true;
    player.flag = 0;
    player.pipe = null;
    player.vx = 0;
    player.vy = -350;
    lives -= 1;
    state = "dead";
    deadT = 0;
    HB.audio.sfx("die");
    shake = 7;
  }

  function killEnemy(e, pts) {
    if (!e || e.dead) return;
    e.dead = true;
    e.life = 0.55;
    e.vy = -230;
    e.vx = player && player.x < e.x ? 70 : -70;
    if (e.spawnId) collected.add(e.spawnId);
    if (pts) {
      addScore(pts);
      popup(e.x, e.y - 6, String(pts));
    }
    HB.audio.sfx("stomp");
    burst(e.x + e.w / 2, e.y + 4, "#f2c14b", 7, 90);
    shake = Math.max(shake, 2.5);
  }

  function damageBoss(e) {
    if (!e || e.dead || e.hurt > 0) return;
    e.hp -= 1;
    e.hurt = 0.65;
    e.vy = -140;
    addScore(500);
    popup(e.x, e.y - 8, "500");
    HB.audio.sfx("stomp");
    shake = 6;
    burst(e.x + e.w / 2, e.y + 8, "#ff8a3d", 10, 120);
    if (e.hp <= 0) {
      e.dead = true;
      e.life = 0.9;
      e.vy = -260;
      bossBeaten = true;
      if (e.spawnId) collected.add(e.spawnId);
      addScore(5000);
      popup(e.x, e.y - 16, "5000");
      shake = 10;
      burst(e.x + 8, e.y + 8, "#ffe08a", 22, 160);
      burst(e.x + 16, e.y + 10, "#ff5a3a", 16, 140);
    }
  }

  function kickShell(e) {
    const dir = player.x + player.w / 2 <= e.x + e.w / 2 ? 1 : -1;
    e.mode = "slide";
    e.vx = dir * 230;
    e.wake = 99;
    e.combo = 0;
    e.grace = 0.18;
    HB.audio.sfx("kick");
  }

  function stomp(e) {
    if (e.kind === "boss") {
      damageBoss(e);
      player.vy = HB.input.held.jump || HB.input.held.up ? -360 : -280;
      return;
    }
    if (e.kind === "shell") {
      if (e.mode === "slide") {
        e.mode = "shell";
        e.vx = 0;
        e.wake = 5.5;
      } else if (e.mode === "shell") {
        kickShell(e);
      } else {
        e.mode = "shell";
        e.vx = 0;
        e.wake = 5.5;
        addScore(100);
        popup(e.x, e.y - 8, "100");
      }
      player.vy = HB.input.held.jump || HB.input.held.up ? -360 : -270;
      HB.audio.sfx("stomp");
      return;
    }
    killEnemy(e, 100);
    player.vy = HB.input.held.jump || HB.input.held.up ? -360 : -270;
  }

  function bumpTile(tx, ty) {
    const ch = tile(tx, ty);
    const interesting = "B?MF*LQum".includes(ch);
    if (!interesting) return;
    bumps.push({ tx, ty, t: 0 });
    if (ch === "B") {
      if (player.form === "small") {
        HB.audio.sfx("bump");
      } else {
        setTile(tx, ty, ".");
        HB.audio.sfx("break");
        addScore(50);
        shake = 3.5;
        burst(tx * TILE + 8, ty * TILE + 8, "#e08a48", 8, 110);
      }
      return;
    }
    if (ch === "u") {
      HB.audio.sfx("bump");
      return;
    }
    if (ch === "?" || ch === "Q") {
      coinPop(tx, ty);
      if (ch === "?") setTile(tx, ty, "u");
      else {
        const key = tx + "," + ty;
        if (!qleft.has(key)) qleft.set(key, 8);
        const left = qleft.get(key) - 1;
        qleft.set(key, left);
        if (left <= 0) setTile(tx, ty, "u");
      }
      HB.audio.sfx("bump");
      return;
    }
    let item = null;
    if (ch === "M" || ch === "m") item = player.form === "small" ? "sprout" : "bloom";
    if (ch === "F") item = "bloom";
    if (ch === "*") item = "gleam";
    if (ch === "L") item = "oneup";
    if (item) {
      entities.push({
        kind: "item",
        item,
        x: tx * TILE + 1,
        y: ty * TILE,
        w: 14,
        h: 14,
        vx: item === "bloom" ? 0 : item === "gleam" ? 78 : 58,
        vy: 0,
        emerge: 0.42,
      });
      setTile(tx, ty, "u");
      HB.audio.sfx("bump");
    }
  }

  function coinPop(tx, ty) {
    addCoin();
    entities.push({
      kind: "popcoin",
      x: tx * TILE + 3,
      y: ty * TILE,
      w: 10,
      h: 12,
      vy: -110,
      life: 0.42,
    });
    burst(tx * TILE + 8, ty * TILE, "#ffd15c", 4, 40);
  }

  function moveAndCollide(e, dt, opt) {
    opt = opt || {};
    const prevY = e.y;
    e.hitWall = false;
    e.bonk = null;
    e.landed = 0;
    if (!opt.noGrav) {
      e.vy += GRAV * dt;
      if (e.vy > MAX_FALL) e.vy = MAX_FALL;
    }
    const dirX = e.vx > 0 ? 1 : e.vx < 0 ? -1 : 0;
    e.x += e.vx * dt;
    if (dirX !== 0) {
      const hits = tilesIn(e.x, e.y + 2, e.w, Math.max(2, e.h - 4)).filter((h) => isSolid(h.t));
      if (hits.length) {
        e.hitWall = true;
        if (dirX > 0) e.x = Math.min.apply(null, hits.map((h) => h.tx)) * TILE - e.w;
        else e.x = (Math.max.apply(null, hits.map((h) => h.tx)) + 1) * TILE;
        e.vx = opt.bounceX ? -e.vx : 0;
      }
    }
    e.y += e.vy * dt;
    e.onGround = false;
    if (e.vy >= 0) {
      const prevBottom = prevY + e.h;
      const hits = tilesIn(e.x + 1, e.y, Math.max(1, e.w - 2), e.h).filter(
        (h) => isSolid(h.t) && h.ty * TILE >= prevBottom - 10
      );
      let top = null;
      if (hits.length) top = Math.min.apply(null, hits.map((h) => h.ty)) * TILE;
      if (opt.oneWay !== false) {
        const feet = tilesIn(e.x + 1, e.y + e.h - 2, Math.max(1, e.w - 2), 4).filter((h) => h.t === "-");
        for (const h of feet) {
          const py = h.ty * TILE;
          if (prevBottom <= py + 5 && e.y + e.h >= py) top = top === null ? py : Math.min(top, py);
        }
      }
      if (top !== null) {
        e.landed = e.vy;
        e.y = top - e.h;
        e.vy = 0;
        e.onGround = true;
      }
    } else {
      const hits = tilesIn(e.x + 1, e.y, Math.max(1, e.w - 2), Math.min(10, e.h)).filter(
        (h) => isSolid(h.t) && (h.ty + 1) * TILE <= prevY + 10
      );
      if (hits.length) {
        const ty = Math.max.apply(null, hits.map((h) => h.ty));
        e.y = (ty + 1) * TILE;
        e.vy = 0;
        const cx = e.x + e.w / 2;
        let best = null;
        let bd = 1e9;
        for (const h of hits) {
          if (h.ty !== ty) continue;
          const d = Math.abs((h.tx + 0.5) * TILE - cx);
          if (d < bd) {
            bd = d;
            best = h;
          }
        }
        e.bonk = best;
      }
    }
  }

  function tryJump() {
    if (player.jumpBuf > 0 && player.coyote > 0) {
      player.vy = JUMP_V;
      player.onGround = false;
      player.coyote = 0;
      player.jumpBuf = 0;
      player.jumping = true;
      HB.audio.sfx("jump");
      burst(player.x + player.w / 2, player.y + player.h, "#ffffff", 3, 30);
    }
  }

  function controlPlayer(dt) {
    const held = HB.input.held;
    const pressed = HB.input.pressed;
    const left = held.left && !held.right;
    const right = held.right && !held.left;
    const dir = right ? 1 : left ? -1 : 0;
    const jumpHeld = held.jump || held.up;
    if (pressed.jump || pressed.up) player.jumpBuf = BUFFER;
    else player.jumpBuf = Math.max(0, player.jumpBuf - dt);
    if (player.onGround) player.coyote = COYOTE;
    else player.coyote = Math.max(0, player.coyote - dt);
    tryJump();
    if (player.jumping && !jumpHeld && player.vy < JUMP_CUT) player.vy = JUMP_CUT;
    const max = held.run ? MAX_RUN : MAX_WALK;
    if (dir !== 0) {
      const turning = player.vx !== 0 && Math.sign(player.vx) !== dir;
      const acc = player.onGround ? (turning ? 1500 : 820) : 520;
      player.vx += dir * acc * dt;
      if (!turning && Math.abs(player.vx) > max) player.vx = dir * max;
      player.facing = dir;
    } else if (player.onGround) {
      const drag = 1100 * dt;
      if (Math.abs(player.vx) <= drag) player.vx = 0;
      else player.vx -= Math.sign(player.vx) * drag;
    }
    if (player.onGround && !held.run && Math.abs(player.vx) > MAX_WALK) {
      const sign = Math.sign(player.vx);
      player.vx = sign * Math.max(MAX_WALK, Math.abs(player.vx) - 260 * dt);
    }
    player.skid = !!(player.onGround && dir && player.vx && Math.sign(player.vx) !== dir && Math.abs(player.vx) > 36);
    if (pressed.run && player.form === "fire") shoot();
    if (pressed.down) tryWarp();
  }

  function shoot() {
    let n = 0;
    for (const e of entities) if (e.kind === "fire") n++;
    if (n >= 2) return;
    entities.push({
      kind: "fire",
      x: player.x + (player.facing > 0 ? player.w - 2 : -6),
      y: player.y + player.h * 0.32,
      w: 8,
      h: 8,
      vx: player.facing * 250,
      vy: -80,
      bounces: 0,
      life: 2.3,
    });
    HB.audio.sfx("fire");
  }

  function tryWarp() {
    if (!player.onGround || player.pipe) return;
    const tx = Math.floor((player.x + player.w / 2) / TILE);
    const ty = Math.floor((player.y + player.h + 2) / TILE);
    const ch = tile(tx, ty);
    const left = ch === "[" ? tx : ch === "]" ? tx - 1 : -1;
    if (left < 0) return;
    const warp = (def.warps || []).find((w) => w.x === left && w.y === ty);
    if (!warp) return;
    player.pipe = { phase: "in", t: 0, warp };
    player.vx = 0;
    player.vy = 0;
  }

  function updatePipe(dt) {
    const pipe = player.pipe;
    pipe.t += dt;
    if (pipe.phase === "in") {
      player.y += 26 * dt;
      if (pipe.t >= 0.42) {
        const feet = (pipe.warp.ty + 1) * TILE;
        player.x = pipe.warp.tx * TILE;
        player.y = feet - player.h;
        pipe.phase = "out";
        pipe.t = 0;
        camX = clamp(player.x + player.w / 2 - VW / 2, 0, maxCamX());
        camY = clamp(player.y + player.h / 2 - VH * 0.55, 0, maxCamY());
      }
    } else {
      player.y -= 20 * dt;
      if (pipe.t >= 0.32) player.pipe = null;
    }
  }

  function startFlag(tx) {
    if (player.flag) return;
    player.flag = 1;
    player.vx = 0;
    player.x = tx * TILE + 2;
    let top = 0;
    let bot = TILE;
    for (let y = 0; y < mapH; y++) {
      if (map[y][tx] === "f") top = y * TILE;
      if (map[y][tx] === "H" || map[y][tx] === "f") bot = (y + 1) * TILE;
    }
    const ratio = clamp(1 - (player.y - top) / Math.max(16, bot - top), 0, 1);
    const bonus = 100 + Math.round(ratio * 49) * 100;
    addScore(bonus);
    popup(player.x - 4, player.y, String(bonus));
    HB.audio.jingle("flag");
    shake = 2;
  }

  function beginTally() {
    state = "tally";
    tallyDelay = 0.25;
    tallyDone = 0;
    tallyFinished = false;
    HB.audio.jingle("clear");
  }

  function sensors() {
    if (player.dead || player.pipe) return;
    const hits = tilesIn(player.x + 1, player.y + 1, player.w - 2, player.h - 2);
    for (const h of hits) {
      if (h.t === "o") {
        setTile(h.tx, h.ty, ".");
        addCoin();
        burst(h.tx * TILE + 8, h.ty * TILE + 8, "#ffd15c", 4, 36);
      } else if (h.t === "K") {
        setTile(h.tx, h.ty, "k");
        spawn = { x: player.x, feet: player.y + player.h };
        HB.audio.sfx("check");
        popup(player.x, player.y - 12, "SAVE");
        burst(player.x, player.y, "#9dffce", 8, 50);
      } else if ((h.t === "H" || h.t === "f") && !player.flag) {
        startFlag(h.tx);
      } else if ((h.t === "^" || h.t === "~") && !player.flag) {
        hurt();
      }
    }
    if (player.y > mapH * TILE + 24) die();
  }

  function updatePlatforms(dt) {
    for (const e of entities) {
      if (e.kind !== "plat") continue;
      e.phase += dt * e.speed;
      const prevx = e.x;
      const prevy = e.y;
      if (e.axis === "h") e.x = e.ox + Math.sin(e.phase) * e.range;
      else e.y = e.oy + Math.sin(e.phase) * e.range;
      e.dx = e.x - prevx;
      e.dy = e.y - prevy;
    }
  }

  function ridePlatforms() {
    if (!player || player.dead || player.pipe || player.vy < 0) return;
    for (const p of entities) {
      if (p.kind !== "plat") continue;
      const prevTop = p.y - p.dy;
      const horiz = player.x + player.w > p.x + 2 && player.x < p.x + p.w - 2;
      const prevBottom = player.prevBottom;
      if (horiz && prevBottom <= prevTop + 6 && player.y + player.h >= p.y && player.y + player.h <= p.y + p.h + 10) {
        player.y = p.y - player.h;
        player.x += p.dx;
        player.vy = 0;
        player.onGround = true;
        return;
      }
    }
  }

  function updateWalker(e, dt, speed, slide) {
    const dir = Math.sign(e.vx) || e.facing || -1;
    moveAndCollide(e, dt, { bounceX: !!slide });
    if (slide) {
      const sign = Math.sign(e.vx) || -dir;
      e.vx = sign * 230;
      e.facing = sign;
      return;
    }
    let next = dir;
    if (e.hitWall) next = -dir;
    else if (e.onGround) {
      const px = e.x + e.w / 2 + dir * (e.w / 2 + 2);
      const py = e.y + e.h + 2;
      if (!solidAt(px, py) && tile(Math.floor(px / TILE), Math.floor(py / TILE)) !== "-") next = -dir;
    }
    e.vx = next * speed;
    e.facing = next;
  }

  function updateEnemies(dt) {
    for (const e of entities) {
      if (e.kind === "pacer") {
        if (e.dead) {
          e.life -= dt;
          e.vy += GRAV * dt;
          e.x += e.vx * dt;
          e.y += e.vy * dt;
          if (e.life <= 0) e.remove = true;
          continue;
        }
        updateWalker(e, dt, 42, false);
        if (e.y > mapH * TILE + 40) e.remove = true;
      } else if (e.kind === "shell") {
        if (e.dead) {
          e.life -= dt;
          e.vy += GRAV * dt;
          e.x += e.vx * dt;
          e.y += e.vy * dt;
          if (e.life <= 0) e.remove = true;
          continue;
        }
        if (e.grace > 0) e.grace -= dt;
        if (e.mode === "shell") {
          e.wake -= dt;
          moveAndCollide(e, dt);
          e.vx = 0;
          if (e.wake <= 0) {
            e.mode = "walk";
            e.vx = -36;
          }
        } else if (e.mode === "slide") {
          updateWalker(e, dt, 230, true);
          for (const other of entities) {
            if (other === e || other.dead) continue;
            if (other.kind !== "pacer" && other.kind !== "shell" && other.kind !== "glider" && other.kind !== "boss") continue;
            if (!aabb(e, other)) continue;
            if (other.kind === "boss") {
              damageBoss(other);
              e.mode = "shell";
              e.vx = 0;
              e.wake = 4;
            } else {
              e.combo = Math.min(8, (e.combo || 0) + 1);
              const pts = 100 * e.combo;
              killEnemy(other, pts);
            }
          }
        } else {
          updateWalker(e, dt, 36, false);
        }
        if (e.y > mapH * TILE + 40) e.remove = true;
      } else if (e.kind === "glider") {
        if (e.dead) {
          e.life -= dt;
          e.vy += GRAV * dt;
          e.y += e.vy * dt;
          if (e.life <= 0) e.remove = true;
          continue;
        }
        e.t += dt;
        e.x += e.vx * dt;
        e.y = e.baseY + Math.sin(e.t * 2.2 + e.phase) * 16;
        if (e.x < 8) e.vx = Math.abs(e.vx);
        if (e.x > mapW * TILE - 20) e.vx = -Math.abs(e.vx);
      } else if (e.kind === "boss") {
        if (e.dead) {
          e.life -= dt;
          e.vy += GRAV * dt;
          e.y += e.vy * dt;
          e.x += e.vx * dt;
          if (e.life <= 0) e.remove = true;
          continue;
        }
        if (e.hurt > 0) e.hurt -= dt;
        const chase = player.x + player.w / 2 < e.x ? -1 : 1;
        if (e.hurt <= 0) e.vx = chase * 36;
        const dir = Math.sign(e.vx) || chase;
        moveAndCollide(e, dt);
        if (e.hitWall) e.vx = -dir * 36;
        else if (e.onGround) {
          const px = e.x + e.w / 2 + dir * (e.w / 2 + 2);
          if (!solidAt(px, e.y + e.h + 2)) e.vx = -dir * 20;
        }
        if (e.onGround && e.hurt <= 0 && Math.random() < dt * 0.55) e.vy = -310;
        e.shotT -= dt;
        if (e.shotT <= 0 && e.hurt <= 0) {
          e.shotT = 1.45;
          const sx = player.x < e.x ? -100 : 100;
          entities.push({
            kind: "shot",
            x: e.x + e.w / 2 - 4,
            y: e.y + 8,
            w: 8,
            h: 8,
            vx: sx,
            vy: -40,
            life: 3.5,
          });
          HB.audio.sfx("fire");
        }
      } else if (e.kind === "shot") {
        e.life -= dt;
        moveAndCollide(e, dt);
        if (e.hitWall || e.life <= 0) e.remove = true;
        if (player && !player.dead && !player.flag && aabb(e, player)) {
          hurt();
          e.remove = true;
        }
      } else if (e.kind === "fire") {
        e.life -= dt;
        moveAndCollide(e, dt);
        if (e.onGround) {
          e.vy = -190;
          e.bounces = (e.bounces || 0) + 1;
          if (e.bounces > 3) e.remove = true;
        }
        if (e.hitWall || e.life <= 0) e.remove = true;
        for (const other of entities) {
          if (other.dead || other === e) continue;
          if (other.kind !== "pacer" && other.kind !== "shell" && other.kind !== "glider" && other.kind !== "boss") continue;
          if (!aabb(e, other)) continue;
          if (other.kind === "boss") damageBoss(other);
          else killEnemy(other, 200);
          burst(e.x, e.y, "#ffb15a", 5, 70);
          e.remove = true;
          break;
        }
      } else if (e.kind === "item") {
        if (e.emerge > 0) {
          e.emerge -= dt;
          e.y -= 34 * dt;
          continue;
        }
        moveAndCollide(e, dt, { bounceX: e.item !== "bloom" });
        if (e.item === "gleam" && e.onGround) e.vy = -270;
        if (e.item === "bloom") e.vx = 0;
        if (player && !player.dead && !player.flag && aabb(e, player)) {
          pickup(e.item);
          e.remove = true;
        }
        if (e.y > mapH * TILE + 20) e.remove = true;
      } else if (e.kind === "popcoin") {
        e.life -= dt;
        e.y += e.vy * dt;
        e.vy += 280 * dt;
        if (e.life <= 0) e.remove = true;
      }
    }
    entities = entities.filter((e) => !e.remove);
  }

  function collidePlayer() {
    if (!player || player.dead || player.flag || player.pipe) return;
    for (const e of entities) {
      if (e.dead) continue;
      if (e.kind !== "pacer" && e.kind !== "shell" && e.kind !== "glider" && e.kind !== "boss") continue;
      if (!aabb(player, e)) continue;
      if (player.star > 0) {
        if (e.kind === "boss") damageBoss(e);
        else killEnemy(e, 200);
        player.vy = Math.min(player.vy, -180);
        continue;
      }
      if (e.grace > 0) continue;
      const stompLine = e.y + e.h * 0.5;
      if (player.vy > 20 && player.prevBottom <= stompLine + 8) {
        stomp(e);
        continue;
      }
      if (e.kind === "shell" && e.mode === "shell") {
        kickShell(e);
        continue;
      }
      hurt();
    }
  }

  function updateCamera(dt) {
    if (!player) return;
    const look = player.flag ? 16 : player.facing * 34;
    const tx = clamp(player.x + player.w / 2 - VW / 2 + look, 0, maxCamX());
    const ty = clamp(player.y + player.h / 2 - VH * 0.58, 0, maxCamY());
    camX += (tx - camX) * Math.min(1, dt * 5.5);
    camY += (ty - camY) * Math.min(1, dt * 5.5);
  }

  function updateFx(dt) {
    for (const b of bumps) b.t += dt * 3.2;
    bumps = bumps.filter((b) => b.t < 1);
    for (const p of particles) {
      p.life -= dt;
      p.vy += (p.g || 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    particles = particles.filter((p) => p.life > 0);
    for (const p of popups) {
      p.life -= dt;
      p.y += p.vy * dt;
    }
    popups = popups.filter((p) => p.life > 0);
    for (const p of screenFx) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 20 * dt;
    }
    screenFx = screenFx.filter((p) => p.life > 0);
    if (shake > 0) {
      shake *= Math.pow(0.84, dt * 60);
      if (shake < 0.25) shake = 0;
    }
    if (flash > 0) flash -= dt;
  }

  function updatePlay(dt) {
    const prevTime = timeLeft;
    if (state === "play" && !player.flag && !player.pipe && !player.dead) {
      timeLeft -= dt;
      if (timeLeft < 50 && Math.floor(prevTime) !== Math.floor(timeLeft) && timeLeft > 0) HB.audio.sfx("tick");
      if (timeLeft <= 0) {
        timeLeft = 0;
        die();
      }
    }
    if (player.star > 0) {
      player.star -= dt;
      if (player.star <= 0) {
        player.star = 0;
        if (state === "play" && !player.flag) HB.audio.music(def.music);
      }
    }
    if (player.invuln > 0) player.invuln -= dt;
    if (player.pending) applyForm(player.pending);
    updatePlatforms(dt);
    player.prevBottom = player.y + player.h;

    if (player.pipe) {
      updatePipe(dt);
      updateCamera(dt);
      updateFx(dt);
      return;
    }
    if (player.dead) {
      player.vy += GRAV * dt;
      player.y += player.vy * dt;
      deadT += dt;
      updateEnemies(dt);
      updateCamera(dt);
      updateFx(dt);
      if (deadT > 1.25) {
        if (lives <= 0) {
          state = "gameover";
          HB.audio.music("title");
        } else respawn();
      }
      return;
    }
    if (player.flag === 1) {
      player.vx = 0;
      player.vy = 110;
      moveAndCollide(player, dt);
      if (player.onGround) {
        player.flag = 2;
        player.flagT = 1.05;
        player.facing = 1;
      }
    } else if (player.flag === 2) {
      player.flagT -= dt;
      player.vx = 74;
      player.facing = 1;
      player.vy += GRAV * dt;
      moveAndCollide(player, dt);
      if (player.flagT <= 0) beginTally();
    } else if (state === "play") {
      const wasGround = player.onGround;
      controlPlayer(dt);
      const fallVy = player.vy;
      moveAndCollide(player, dt);
      if (player.bonk) bumpTile(player.bonk.tx, player.bonk.ty);
      ridePlatforms();
      if (player.onGround) player.coyote = COYOTE;
      if (player.onGround && !player.jumping) tryJump();
      if (player.onGround) player.jumping = false;
      if (!wasGround && player.onGround && fallVy > 220) burst(player.x + 4, player.y + player.h, "#efe6d4", 4, 40);
      if (player.skid) {
        dustT -= dt;
        if (dustT <= 0) {
          dustT = 0.05;
          burst(player.x + player.w / 2, player.y + player.h, "#f0e2c8", 1, 20);
        }
      }
      sensors();
      updateEnemies(dt);
      collidePlayer();
    }
    updateCamera(dt);
    updateFx(dt);
    if (def && particles.filter((p) => p.ambient).length < 14 && Math.random() < dt * 10) {
      const color = def.theme === "castle" ? "#ff9a4a" : def.theme === "cave" ? "#8af0d8" : "#ffffff";
      particles.push({
        ambient: true,
        x: camX + Math.random() * VW,
        y: camY + Math.random() * VH,
        vx: def.theme === "castle" ? 8 : -8,
        vy: def.theme === "castle" ? -16 : 10,
        life: 1.4,
        color,
        size: 2,
        g: 0,
      });
    }
  }

  function updateTally(dt) {
    const pressed = HB.input.pressed;
    const held = HB.input.held;
    const skip = pressed.start || pressed.jump || (tallyDelay <= 0 && (held.start || held.jump));
    if (skip && timeLeft > 0) {
      addScore(Math.ceil(timeLeft) * 50);
      timeLeft = 0;
    }
    tallyDelay -= dt;
    if (tallyDelay > 0) {
      updateFx(dt);
      return;
    }
    if (timeLeft > 0) {
      const chunk = timeLeft > 80 ? 6 : timeLeft > 20 ? 2 : 1;
      const step = Math.min(chunk, timeLeft);
      timeLeft -= step;
      addScore(Math.ceil(step) * 50);
      if (Math.random() < 0.5) HB.audio.sfx("tick");
      updateFx(dt);
      return;
    }
    tallyDone += dt;
    if (!tallyFinished && tallyDone > 0.35) {
      tallyFinished = true;
      if (levelScore > (best[levelIndex] || 0)) best[levelIndex] = levelScore;
      if (levelIndex >= HB.levelDefs.length - 1) {
        unlocked = HB.levelDefs.length;
        saveGame();
        state = "victory";
        HB.audio.jingle("win");
        launchConfetti();
      } else {
        unlocked = Math.max(unlocked, levelIndex + 2);
        saveGame();
        state = "cleared";
      }
    }
    updateFx(dt);
  }

  function launchConfetti() {
    const colors = ["#ffd25a", "#14a090", "#ff7a45", "#7ad7ff", "#fff"];
    for (let i = 0; i < 70; i++) {
      screenFx.push({
        x: Math.random() * VW,
        y: -10 - Math.random() * 40,
        vx: -20 + Math.random() * 40,
        vy: 30 + Math.random() * 50,
        life: 2.4 + Math.random(),
        color: colors[i % colors.length],
        size: 2 + (i % 3),
      });
    }
  }

  function songForState() {
    if (state === "title" || state === "gameover" || state === "victory") return "title";
    if (state === "map" || state === "cleared") return "map";
    if (player && player.star > 0) return "star";
    if (def) return def.music;
    return "title";
  }

  function toggleMute() {
    muted = !muted;
    HB.audio.setMuted(muted);
    if (!muted) HB.audio.music(songForState());
    saveGame();
  }

  function updateMenus(dt) {
    const pressed = HB.input.pressed;
    if (pressed.mute) toggleMute();
    if (state === "title") {
      if (pressed.start || pressed.jump) beginRun();
      else if (HB.input.userOn && !muted && HB.audio.current() !== "title") HB.audio.music("title");
      tokenX += dt * 12;
    } else if (state === "map") {
      if (pressed.right && mapSel < unlocked - 1) {
        mapSel++;
        HB.audio.sfx("tick");
      }
      if (pressed.left && mapSel > 0) {
        mapSel--;
        HB.audio.sfx("tick");
      }
      if (pressed.start || pressed.jump) goLevel(mapSel);
      if (pressed.pause) {
        state = "title";
        HB.audio.music("title");
      }
      const node = NODES[mapSel];
      tokenX += (node.x - tokenX) * Math.min(1, dt * 8);
      tokenY += (node.y - 22 - tokenY) * Math.min(1, dt * 8);
    } else if (state === "gameover" || state === "victory") {
      if (pressed.start || pressed.jump) {
        state = "title";
        HB.audio.music("title");
      }
    } else if (state === "cleared") {
      if (pressed.start || pressed.jump) {
        state = "map";
        HB.audio.music("map");
      }
    }
  }

  function update(dt) {
    clock += dt;
    if (state === "title" || state === "map" || state === "gameover" || state === "victory" || state === "cleared") {
      updateMenus(dt);
      updateFx(dt);
      return;
    }
    if (state === "pause") {
      const pressed = HB.input.pressed;
      if (pressed.mute) toggleMute();
      if (pressed.down) pauseSel = 1;
      if (pressed.up) pauseSel = 0;
      if (pressed.pause) state = "play";
      else if (pressed.start || pressed.jump) {
        if (pauseSel === 0) state = "play";
        else {
          state = "map";
          HB.audio.music("map");
        }
      }
      return;
    }
    if (state === "intro") {
      introT -= dt;
      if (introT <= 0 || HB.input.pressed.start) state = "play";
      updateCamera(dt);
      updateFx(dt);
      if (HB.input.pressed.mute) toggleMute();
      return;
    }
    if (state === "tally") {
      if (HB.input.pressed.mute) toggleMute();
      updateTally(dt);
      return;
    }
    if ((state === "play" || state === "dead") && HB.input.pressed.mute) toggleMute();
    if (state === "play" && HB.input.pressed.pause && !player.flag && !player.pipe && !player.dead) {
      state = "pause";
      pauseSel = 0;
      HB.audio.sfx("pause");
      return;
    }
    updatePlay(dt);
  }

  function text(str, x, y, color, scale) {
    HB.art.text(ctx, str, x, y, color, scale || 1);
  }
  function center(str, y, color, scale) {
    scale = scale || 1;
    const w = HB.art.textWidth(str, scale);
    text(str, Math.round((VW - w) / 2), y, color, scale);
  }

  function renderWorld() {
    HB.art.drawBackground(ctx, def.theme, camX, camY, clock, mapW);
    const sx = shake > 0.3 ? (Math.random() * 2 - 1) * shake : 0;
    const sy = shake > 0.3 ? (Math.random() * 2 - 1) * shake : 0;
    ctx.save();
    ctx.translate(Math.round(-camX + sx), Math.round(-camY + sy));
    const x0 = Math.max(0, Math.floor(camX / TILE) - 1);
    const y0 = Math.max(0, Math.floor(camY / TILE) - 1);
    const x1 = Math.min(mapW - 1, Math.ceil((camX + VW) / TILE) + 1);
    const y1 = Math.min(mapH - 1, Math.ceil((camY + VH) / TILE) + 1);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const ch = map[ty][tx];
        if (ch === "G" && bossBeaten) continue;
        let bump = 0;
        for (const b of bumps) if (b.tx === tx && b.ty === ty) bump = -Math.sin(b.t * Math.PI) * 6;
        const topOpen = !isSolid(tile(tx, ty - 1));
        HB.art.drawTile(ctx, ch, tx * TILE, ty * TILE, def.theme, clock, tx, ty, bump, topOpen);
      }
    }
    for (const e of entities) if (e.kind === "plat") HB.art.drawEntity(ctx, e, clock);
    for (const e of entities) if (e.kind !== "plat") HB.art.drawEntity(ctx, e, clock);
    if (player) {
      HB.art.drawShadow(ctx, player.x + player.w / 2, player.y + player.h, player.form === "small" ? 6 : 7);
      HB.art.drawPlayer(ctx, player, clock);
    }
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life * 2, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x | 0, p.y | 0, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    for (const p of popups) {
      ctx.globalAlpha = clamp(p.life, 0, 1);
      text(p.text, p.x | 0, p.y | 0, "#fff6d0", 1);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function renderHUD() {
    ctx.fillStyle = "rgba(10,12,20,0.45)";
    ctx.fillRect(0, 0, VW, 16);
    text(String(score).padStart(6, "0"), 4, 4, "#fff8e8", 1);
    ctx.drawImage(HB.art.coinSprite(Math.floor(clock * 8) % 4), 78, 2);
    text("X" + String(coins).padStart(2, "0"), 90, 4, "#ffe08a", 1);
    if (def) text(def.world, 168, 4, "#ffffff", 1);
    const timeShown = Math.max(0, Math.ceil(timeLeft));
    text(String(timeShown).padStart(3, "0"), 250, 4, timeShown < 50 ? "#ff8d8d" : "#fff", 1);
    text("X" + String(Math.max(0, lives)), 330, 4, "#fff", 1);
    text(muted ? "MX" : "M", 360, 4, muted ? "#ff8d8d" : "#9dffce", 1);
    const boss = entities.find((e) => e.kind === "boss" && !e.dead);
    if (boss) {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < boss.hp ? "#ff5a3a" : "#3a2428";
        ctx.fillRect(300, 20 + i * 6, 10, 4);
      }
    }
  }

  function renderTitle() {
    HB.art.drawBackground(ctx, "meadow", tokenX, 0, clock, 2000);
    center("HOPBOUND", 36, "#fff8e8", 3);
    center("DELUXE", 66, "#ffd25a", 2);
    if (Math.floor(clock * 2) % 2 === 0) center("PRESS ENTER", 108, "#ffffff", 1);
    const total = best.reduce((a, b) => a + b, 0);
    center("BEST " + String(total).padStart(6, "0"), 132, "#d7ecff", 1);
    ctx.fillStyle = "rgba(12, 28, 44, 0.55)";
    ctx.fillRect(24, 146, 336, 32);
    center("ARROWS MOVE  Z JUMP  X RUN", 150, "#ffffff", 1);
    center("ENTER START  M MUTE  PAD OK", 164, "#ffffff", 1);
    const hero = {
      x: 176,
      y: 86 + Math.sin(clock * 4) * 2,
      w: 12,
      h: 14,
      facing: 1,
      form: "small",
      onGround: true,
      vx: 0,
      star: 0,
      invuln: 0,
    };
    HB.art.drawPlayer(ctx, hero, clock);
  }

  function renderMap() {
    HB.art.drawBackground(ctx, "meadow", 20, 0, clock, 800);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillRect(0, 36, VW, 150);
    text("TRAIL MAP", 8, 8, "#173044", 2);
    ctx.strokeStyle = "#14a090";
    ctx.lineWidth = 4;
    ctx.beginPath();
    NODES.forEach((n, i) => {
      if (i === 0) ctx.moveTo(n.x, n.y);
      else ctx.lineTo(n.x, n.y);
    });
    ctx.stroke();
    HB.levelDefs.forEach((level, i) => {
      const n = NODES[i];
      const open = i < unlocked;
      ctx.fillStyle = open ? "#14a090" : "#8d97a8";
      ctx.fillRect(n.x - 10, n.y - 10, 20, 20);
      ctx.fillStyle = "#fff";
      ctx.fillRect(n.x - 6, n.y - 6, 12, 12);
      text(level.world, n.x - 10, n.y + 16, open ? "#173044" : "#667", 1);
      if (i === mapSel) {
        ctx.strokeStyle = "#ffd25a";
        ctx.lineWidth = 2;
        ctx.strokeRect(n.x - 14, n.y - 14, 28, 28);
      }
    });
    const hero = { x: tokenX - 6, y: tokenY, w: 12, h: 14, facing: 1, form: "small", onGround: true, vx: 30, star: 0, invuln: 0 };
    HB.art.drawPlayer(ctx, hero, clock);
    const selected = HB.levelDefs[mapSel];
    center(selected.name, 196, "#173044", 1);
    center("BEST " + String(best[mapSel] || 0).padStart(6, "0"), 208, "#3d4a3a", 1);
  }

  function renderOverlayCard(title, sub) {
    ctx.fillStyle = "rgba(8,10,18,0.45)";
    ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = "rgba(255,248,232,0.94)";
    ctx.fillRect(56, 70, 272, 84);
    ctx.fillStyle = "#14a090";
    ctx.fillRect(56, 70, 272, 6);
    center(title, 88, "#173044", 2);
    if (sub) center(sub, 116, "#3a4a44", 1);
  }

  function render() {
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    if (state === "title") {
      renderTitle();
    } else if (state === "map") {
      renderMap();
    } else if (state === "gameover") {
      HB.art.drawBackground(ctx, "castle", 0, 0, clock, 400);
      center("GAME OVER", 70, "#fff", 3);
      center("SCORE " + String(score).padStart(6, "0"), 110, "#ffd25a", 1);
      if (Math.floor(clock * 2) % 2 === 0) center("PRESS ENTER", 150, "#fff", 1);
    } else if (state === "victory") {
      HB.art.drawBackground(ctx, "sky", clock * 20, 0, clock, 600);
      center("TRAIL CLEAR", 48, "#173044", 2);
      center("SCORE " + String(score).padStart(6, "0"), 80, "#173044", 1);
      center("YOU LIT EVERY FLAG", 110, "#3a4a44", 1);
      if (Math.floor(clock * 2) % 2 === 0) center("PRESS ENTER", 150, "#173044", 1);
    } else if (def) {
      renderWorld();
      renderHUD();
      if (state === "intro") renderOverlayCard(def.world, def.name);
      if (state === "pause") {
        ctx.fillStyle = "rgba(8,10,18,0.45)";
        ctx.fillRect(0, 0, VW, VH);
        ctx.fillStyle = "rgba(255,248,232,0.94)";
        ctx.fillRect(68, 58, 248, 112);
        ctx.fillStyle = "#14a090";
        ctx.fillRect(68, 58, 248, 6);
        center("PAUSED", 72, "#173044", 2);
        text((pauseSel === 0 ? "> " : "  ") + "CONTINUE", 108, 104, "#173044", 1);
        text((pauseSel === 1 ? "> " : "  ") + "QUIT TO MAP", 108, 120, "#173044", 1);
        center("UP DOWN  ENTER", 150, "#fff", 1);
      }
      if (state === "tally" || state === "cleared") {
        renderOverlayCard(state === "cleared" ? "COURSE CLEAR" : "COURSE CLEAR", "TIME " + String(Math.ceil(timeLeft)).padStart(3, "0"));
        center("SCORE " + String(levelScore).padStart(6, "0"), 128, "#173044", 1);
        if (state === "cleared" && Math.floor(clock * 2) % 2 === 0) center("PRESS ENTER", 168, "#fff", 1);
      }
    }
    for (const p of screenFx) {
      ctx.globalAlpha = clamp(p.life, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x | 0, p.y | 0, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    if (flash > 0) {
      ctx.fillStyle = "rgba(255,255,255," + clamp(flash * 3, 0, 0.7) + ")";
      ctx.fillRect(0, 0, VW, VH);
    }
    if (errorText) {
      ctx.fillStyle = "#401018";
      ctx.fillRect(0, 180, VW, 44);
      text(errorText.slice(0, 42), 4, 188, "#fff", 1);
      text(errorText.slice(42, 84), 4, 198, "#fff", 1);
    }
  }

  function frame(ts) {
    if (!frame.last) frame.last = ts;
    let real = (ts - frame.last) / 1000;
    frame.last = ts;
    if (real > 0.1) real = 0.1;
    fpsAcc += real;
    fpsFrames++;
    if (fpsAcc >= 0.5) {
      fps = fpsFrames / fpsAcc;
      fpsFrames = 0;
      fpsAcc = 0;
    }
    if (!frozen) {
      frame.acc = (frame.acc || 0) + real;
      let guard = 0;
      while (frame.acc >= 1 / 60 && guard++ < 5) {
        HB.input.compose();
        try {
          update(1 / 60);
        } catch (err) {
          errorText = String(err && err.message ? err.message : err);
          console.error(err);
        }
        HB.input.endFrame();
        frame.acc -= 1 / 60;
      }
    }
    render();
    requestAnimationFrame(frame);
  }

  function pointerPos(e) {
    const rect = canvas.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VW,
      y: ((e.clientY - rect.top) / rect.height) * VH,
    };
  }

  function onPointer(x, y) {
    HB.input.userOn = true;
    HB.audio.unlock();
    if (x > VW - 22 && y < 18) {
      toggleMute();
      return;
    }
    if (state === "title" || state === "gameover" || state === "victory" || state === "cleared") {
      HB.input.debug.start = true;
      setTimeout(() => {
        HB.input.debug.start = false;
      }, 40);
      return;
    }
    if (state === "map") {
      NODES.forEach((n, i) => {
        if (i < unlocked && Math.abs(x - n.x) < 18 && Math.abs(y - n.y) < 18) {
          mapSel = i;
          goLevel(i);
        }
      });
    }
  }

  function start(c) {
    canvas.current = c;
    ctx = c.getContext("2d");
    loadSave();
    c.addEventListener("pointerdown", (e) => {
      const p = pointerPos(e);
      onPointer(p.x, p.y);
    });
    requestAnimationFrame(frame);
  }

  function snapshot() {
    return {
      state,
      score,
      levelScore,
      coins,
      lives,
      timeLeft,
      levelIndex,
      unlocked,
      best: best.slice(),
      muted,
      fps,
      errorText,
      bossBeaten,
      camX,
      camY,
      mapW,
      mapH,
      player: player
        ? {
            x: player.x,
            y: player.y,
            vx: player.vx,
            vy: player.vy,
            w: player.w,
            h: player.h,
            onGround: player.onGround,
            coyote: player.coyote,
            form: player.form,
            star: player.star,
            dead: player.dead,
            flag: player.flag,
            facing: player.facing,
          }
        : null,
      entities: entities.map((e) => ({
        kind: e.kind,
        mode: e.mode,
        x: e.x,
        y: e.y,
        hp: e.hp,
        item: e.item,
        dead: !!e.dead,
      })),
    };
  }

  HB.game = { start };

  window.HOP = {
    freeze(v) {
      frozen = !!v;
    },
    tick(n) {
      frozen = true;
      for (let i = 0; i < n; i++) {
        HB.input.compose();
        update(1 / 60);
        HB.input.endFrame();
      }
      render();
    },
    render,
    newRun: beginRun,
    loadLevel(i) {
      if (state === "title") beginRun();
      goLevel(i);
      state = "play";
      introT = 0;
    },
    hold(obj) {
      Object.keys(HB.input.debug).forEach((k) => {
        HB.input.debug[k] = false;
      });
      Object.keys(obj || {}).forEach((k) => {
        HB.input.debug[k] = !!obj[k];
      });
    },
    place(x, y) {
      if (!player) return;
      player.x = x;
      player.y = y;
      player.vx = 0;
      player.vy = 0;
      player.dead = false;
      if (mapW) {
        camX = clamp(player.x + player.w / 2 - VW / 2, 0, maxCamX());
        camY = clamp(player.y + player.h / 2 - VH * 0.55, 0, maxCamY());
      }
    },
    give(form) {
      if (!player) return;
      applyForm(form);
      player.form = form;
      if (form !== "small") player.h = 28;
    },
    killBoss() {
      const boss = entities.find((e) => e.kind === "boss" && !e.dead);
      if (!boss) return;
      boss.hp = 1;
      boss.hurt = 0;
      damageBoss(boss);
    },
    state: snapshot,
    tile(tx, ty) {
      return map ? tile(tx, ty) : ".";
    },
    get fps() {
      return fps;
    },
  };
})();
