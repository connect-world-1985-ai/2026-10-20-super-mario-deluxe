(function () {
  const HB = (window.HB = window.HB || {});

  const THEMES = {
    meadow: {
      sky: ["#7ed0ff", "#dff6ff"],
      hill: "#6fbf62",
      hillDark: "#3d8e45",
      bush: "#2f7a38",
      cloud: "#ffffff",
      sun: "#ffe28a",
      ground: "#d4894a",
      groundDark: "#8a4e2c",
      grass: "#62c84c",
      grassDark: "#2f8f34",
      brick: "#e08a48",
      brickDark: "#a85b30",
      mortar: "#f2c9a0",
      pipe: "#3aaa52",
      pipeDark: "#1d7434",
      pipeHi: "#c6f5b4",
      rock: "#d7c4a2",
      rockDark: "#8d7a58",
      wood: "#c48848",
      accent: "#ffd25a",
    },
    cave: {
      sky: ["#1a2140", "#2c3560"],
      hill: "#323c6e",
      hillDark: "#222848",
      bush: "#24344c",
      cloud: "#3d4c78",
      sun: "#7ee0c8",
      ground: "#6d543c",
      groundDark: "#3e2c22",
      grass: "#3d6e58",
      grassDark: "#234838",
      brick: "#8d6248",
      brickDark: "#5a3a2c",
      mortar: "#c4a07a",
      pipe: "#2f8f8a",
      pipeDark: "#145854",
      pipeHi: "#b7fff4",
      rock: "#6e7898",
      rockDark: "#3c4460",
      wood: "#a57a48",
      accent: "#7ee0c8",
    },
    sky: {
      sky: ["#8ecbff", "#d7f3ff"],
      hill: "#f7fbff",
      hillDark: "#d5e4f5",
      bush: "#c5d8ee",
      cloud: "#ffffff",
      sun: "#ffe08a",
      ground: "#f4fbff",
      groundDark: "#b7cbe2",
      grass: "#ffffff",
      grassDark: "#d5e6f8",
      brick: "#f0d7a4",
      brickDark: "#c49a62",
      mortar: "#fff6e4",
      pipe: "#d7ecff",
      pipeDark: "#8eb4d6",
      pipeHi: "#ffffff",
      rock: "#f7fbff",
      rockDark: "#c5d7ea",
      wood: "#e7c48a",
      accent: "#8fd0ff",
    },
    castle: {
      sky: ["#2a1c28", "#4a3038"],
      hill: "#3a2a32",
      hillDark: "#241820",
      bush: "#4a2c28",
      cloud: "#5a4048",
      sun: "#ff7a3a",
      ground: "#6a4a44",
      groundDark: "#3a2428",
      grass: "#8a5848",
      grassDark: "#4a2c30",
      brick: "#7a4038",
      brickDark: "#4a2424",
      mortar: "#c48a78",
      pipe: "#8a9098",
      pipeDark: "#4a5058",
      pipeHi: "#e4e8ee",
      rock: "#6a5558",
      rockDark: "#3a2c30",
      wood: "#a06048",
      accent: "#ffb15a",
    },
  };

  const FONT = {
    A: [14, 17, 17, 31, 17, 17, 17],
    B: [30, 17, 17, 30, 17, 17, 30],
    C: [14, 17, 16, 16, 16, 17, 14],
    D: [30, 17, 17, 17, 17, 17, 30],
    E: [31, 16, 16, 30, 16, 16, 31],
    F: [31, 16, 16, 30, 16, 16, 16],
    G: [14, 17, 16, 23, 17, 17, 14],
    H: [17, 17, 17, 31, 17, 17, 17],
    I: [31, 4, 4, 4, 4, 4, 31],
    J: [31, 2, 2, 2, 2, 18, 12],
    K: [17, 18, 20, 24, 20, 18, 17],
    L: [16, 16, 16, 16, 16, 16, 31],
    M: [17, 27, 21, 21, 17, 17, 17],
    N: [17, 25, 21, 19, 17, 17, 17],
    O: [14, 17, 17, 17, 17, 17, 14],
    P: [30, 17, 17, 30, 16, 16, 16],
    Q: [14, 17, 17, 17, 21, 18, 13],
    R: [30, 17, 17, 30, 20, 18, 17],
    S: [15, 16, 16, 14, 1, 1, 30],
    T: [31, 4, 4, 4, 4, 4, 4],
    U: [17, 17, 17, 17, 17, 17, 14],
    V: [17, 17, 17, 17, 17, 10, 4],
    W: [17, 17, 17, 21, 21, 27, 17],
    X: [17, 17, 10, 4, 10, 17, 17],
    Y: [17, 17, 10, 4, 4, 4, 4],
    Z: [31, 1, 2, 4, 8, 16, 31],
    0: [14, 17, 19, 21, 25, 17, 14],
    1: [4, 12, 4, 4, 4, 4, 14],
    2: [14, 17, 1, 2, 4, 8, 31],
    3: [30, 1, 1, 14, 1, 1, 30],
    4: [2, 6, 10, 18, 31, 2, 2],
    5: [31, 16, 30, 1, 1, 17, 14],
    6: [6, 8, 16, 30, 17, 17, 14],
    7: [31, 1, 2, 4, 8, 8, 8],
    8: [14, 17, 17, 14, 17, 17, 14],
    9: [14, 17, 17, 15, 1, 2, 12],
    " ": [0, 0, 0, 0, 0, 0, 0],
    "-": [0, 0, 0, 31, 0, 0, 0],
    ".": [0, 0, 0, 0, 0, 4, 4],
    "!": [4, 4, 4, 4, 4, 0, 4],
    "?": [14, 17, 1, 2, 4, 0, 4],
    ">": [1, 2, 4, 4, 2, 1, 0],
    ":": [0, 4, 4, 0, 4, 4, 0],
    "'": [4, 4, 8, 0, 0, 0, 0],
    x: [0, 17, 10, 4, 10, 17, 0],
  };

  function textWidth(str, scale) {
    return str.length * 6 * scale;
  }

  function drawText(ctx, str, x, y, color, scale) {
    scale = scale || 1;
    const s = String(str).toUpperCase();
    ctx.fillStyle = "#17202a";
    blitText(ctx, s, x + scale, y + scale, scale);
    ctx.fillStyle = color;
    blitText(ctx, s, x, y, scale);
  }

  function blitText(ctx, str, x, y, scale) {
    let cx = x;
    for (const ch of str) {
      const g = FONT[ch] || FONT[" "];
      for (let row = 0; row < 7; row++) {
        const bits = g[row];
        for (let col = 0; col < 5; col++) {
          if (bits & (1 << (4 - col))) ctx.fillRect(cx + col * scale, y + row * scale, scale, scale);
        }
      }
      cx += 6 * scale;
    }
  }

  function canvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  function box(g, x, y, w, h, fill, line) {
    if (line) {
      g.fillStyle = line;
      g.fillRect(x - 1, y - 1, w + 2, h + 2);
    }
    g.fillStyle = fill;
    g.fillRect(x, y, w, h);
  }

  const cache = {};
  function cached(key, w, h, draw) {
    if (!cache[key]) {
      const c = canvas(w, h);
      draw(c.getContext("2d"));
      cache[key] = c;
    }
    return cache[key];
  }

  const LINE = "#17202a";

  function paintHero(g, pose, form) {
    const pal =
      form === "fire"
        ? { cap: "#e24b3b", badge: "#fff1a8", skin: "#ffd2b8", shirt: "#ffd59a", overall: "#8a2e2a", pocket: "#c45432", shoe: "#3e2824" }
        : { cap: "#14a090", badge: "#ffd25a", skin: "#ffd2b8", shirt: "#fff3dc", overall: "#243e68", pocket: "#3d5c8a", shoe: "#4e382e" };
    const big = form !== "small";
    const y0 = big ? 8 : 0;
    if (pose === "walk1") {
      box(g, 3, y0 + 13, 3, 3, pal.shoe, LINE);
      box(g, 9, y0 + 12, 3, 3, pal.shoe, LINE);
    } else if (pose === "walk2") {
      box(g, 4, y0 + 12, 3, 3, pal.shoe, LINE);
      box(g, 8, y0 + 13, 4, 3, pal.shoe, LINE);
    } else if (pose === "jump") {
      box(g, 2, y0 + 12, 3, 3, pal.shoe, LINE);
      box(g, 10, y0 + 12, 3, 3, pal.shoe, LINE);
    } else if (pose === "skid") {
      box(g, 5, y0 + 13, 6, 3, pal.shoe, LINE);
    } else {
      box(g, 4, y0 + 13, 3, 3, pal.shoe, LINE);
      box(g, 9, y0 + 13, 3, 3, pal.shoe, LINE);
    }
    const bodyH = big ? 10 : 6;
    const bodyY = big ? y0 + 3 : 7;
    box(g, 4, bodyY, 8, bodyH, pal.overall, LINE);
    g.fillStyle = pal.shirt;
    g.fillRect(5, bodyY + 1, 6, 2);
    g.fillStyle = pal.pocket;
    g.fillRect(8, bodyY + 4, 3, big ? 3 : 2);
    if (big) {
      g.fillStyle = pal.shirt;
      g.fillRect(5, bodyY + 6, 2, 2);
    }
    box(g, 4, y0 + 2, 8, 6, pal.skin, LINE);
    g.fillStyle = LINE;
    g.fillRect(3, y0 + 1, 10, 4);
    g.fillStyle = pal.cap;
    g.fillRect(4, y0 + 1, 8, 3);
    g.fillRect(3, y0 + 3, 10, 1);
    g.fillStyle = "#8fd9c8";
    if (form === "fire") g.fillStyle = "#ffb15a";
    g.fillRect(11, y0 + 1, 2, 2);
    g.fillStyle = pal.badge;
    g.fillRect(7, y0 + 1, 3, 2);
    g.fillStyle = LINE;
    g.fillRect(8, y0 + 1, 1, 1);
    g.fillStyle = "#17202a";
    g.fillRect(5, y0 + 4, 1, 2);
    g.fillRect(9, y0 + 4, 1, 2);
    g.fillStyle = "#fff";
    g.fillRect(5, y0 + 4, 1, 1);
    g.fillRect(9, y0 + 4, 1, 1);
  }

  function heroSprite(pose, form) {
    const big = form !== "small";
    return cached("hero-" + form + "-" + pose, 16, big ? 32 : 16, (g) => paintHero(g, pose, form));
  }

  function pacerSprite(frame) {
    return cached("pacer-" + frame, 16, 16, (g) => {
      g.fillStyle = LINE;
      g.fillRect(3, 4, 10, 8);
      g.fillStyle = "#e07a3d";
      g.fillRect(4, 5, 8, 6);
      g.fillStyle = "#f2c14b";
      g.fillRect(5, 8, 6, 3);
      g.fillStyle = "#fff";
      g.fillRect(5, 6, 2, 2);
      g.fillRect(9, 6, 2, 2);
      g.fillStyle = LINE;
      g.fillRect(6, 7, 1, 1);
      g.fillRect(10, 7, 1, 1);
      g.fillStyle = "#f2c14b";
      g.fillRect(6, 2, 1, 3);
      g.fillRect(9, 2, 1, 3);
      const foot = frame ? 1 : 0;
      g.fillStyle = LINE;
      g.fillRect(3, 12, 3, 2 + foot);
      g.fillRect(10, 12 - foot, 3, 2 + foot);
    });
  }

  function shellSprite(mode, frame) {
    return cached("shell-" + mode + "-" + frame, 16, 16, (g) => {
      g.fillStyle = LINE;
      g.fillRect(2, 5, 12, 8);
      g.fillStyle = "#6d4ea3";
      g.fillRect(3, 6, 10, 6);
      g.fillStyle = "#f2e6c9";
      g.fillRect(5, 6, 2, 6);
      g.fillRect(9, 6, 2, 6);
      g.fillStyle = "#d8c6ff";
      g.fillRect(3, 6, 10, 2);
      if (mode !== "shell" && mode !== "slide") {
        g.fillStyle = LINE;
        g.fillRect(2, 10, 4, 4);
        g.fillStyle = "#e8b896";
        g.fillRect(3, 11, 3, 2);
        g.fillStyle = LINE;
        g.fillRect(4, 11, 1, 1);
        const f = frame ? 1 : 0;
        g.fillStyle = "#3a2a22";
        g.fillRect(3, 14, 3, 1 + f);
        g.fillRect(9, 14 - f, 3, 1);
      } else {
        g.fillStyle = "#3a2a22";
        g.fillRect(3, 13, 3, 2);
        g.fillRect(10, 13, 3, 2);
      }
    });
  }

  function drifterSprite(frame) {
    return cached("drift-" + frame, 18, 14, (g) => {
      g.fillStyle = "#ffffff";
      if (frame) {
        g.fillRect(0, 2, 5, 3);
        g.fillRect(13, 2, 5, 3);
      } else {
        g.fillRect(0, 6, 5, 3);
        g.fillRect(13, 6, 5, 3);
      }
      g.fillStyle = LINE;
      g.fillRect(5, 3, 8, 8);
      g.fillStyle = "#7fd3ff";
      g.fillRect(6, 4, 6, 6);
      g.fillStyle = "#fff";
      g.fillRect(7, 5, 2, 2);
      g.fillStyle = LINE;
      g.fillRect(8, 6, 1, 1);
      g.fillStyle = "#ffd25a";
      g.fillRect(8, 9, 2, 2);
    });
  }

  function bossSprite(hurt) {
    return cached("boss-" + (hurt ? 1 : 0), 32, 32, (g) => {
      const armor = hurt ? "#f2f2f2" : "#5c2c34";
      const belly = hurt ? "#ffd0c8" : "#d24a3a";
      g.fillStyle = "#ff8a3d";
      g.fillRect(8, 0, 4, 4);
      g.fillRect(18, 0, 4, 5);
      g.fillRect(13, 1, 5, 3);
      g.fillStyle = LINE;
      g.fillRect(6, 4, 20, 22);
      g.fillStyle = armor;
      g.fillRect(7, 5, 18, 20);
      g.fillStyle = belly;
      g.fillRect(11, 12, 10, 10);
      g.fillStyle = "#ffd56a";
      g.fillRect(10, 8, 4, 4);
      g.fillRect(18, 8, 4, 4);
      g.fillStyle = LINE;
      g.fillRect(11, 9, 2, 2);
      g.fillRect(19, 9, 2, 2);
      g.fillStyle = "#2a1c18";
      g.fillRect(8, 26, 6, 4);
      g.fillRect(18, 26, 6, 4);
      g.fillStyle = "#ffb15a";
      g.fillRect(4, 10, 3, 6);
      g.fillRect(25, 10, 3, 6);
    });
  }

  function itemSprite(type, frame) {
    return cached("item-" + type + "-" + frame, 16, 16, (g) => {
      if (type === "sprout" || type === "oneup") {
        const cap = type === "oneup" ? "#7bdff2" : "#3cb7a0";
        g.fillStyle = LINE;
        g.fillRect(3, 3, 10, 7);
        g.fillStyle = cap;
        g.fillRect(4, 4, 8, 5);
        g.fillStyle = "#f3fff8";
        g.fillRect(6, 5, 2, 2);
        g.fillRect(9, 7, 2, 2);
        g.fillStyle = "#f2d7a2";
        g.fillRect(6, 10, 4, 4);
        g.fillStyle = LINE;
        g.fillRect(7, 10, 2, 1);
      } else if (type === "bloom") {
        g.fillStyle = "#ff7a45";
        g.fillRect(2, 4, 4, 4);
        g.fillRect(10, 4, 4, 4);
        g.fillRect(6, 1, 4, 4);
        g.fillRect(6, 9, 4, 4);
        g.fillStyle = LINE;
        g.fillRect(6, 5, 4, 4);
        g.fillStyle = "#ffe08a";
        g.fillRect(7, 6, 2, 2);
        g.fillStyle = "#3c8f45";
        g.fillRect(7, 12, 2, 3);
      } else {
        const y = frame ? 1 : 0;
        g.fillStyle = LINE;
        g.fillRect(4, 3 + y, 8, 8);
        g.fillStyle = "#ffe56b";
        g.fillRect(5, 4 + y, 6, 6);
        g.fillStyle = "#fff";
        g.fillRect(6, 5 + y, 2, 2);
        g.fillStyle = "#e2a52a";
        g.fillRect(7, 2 + y, 2, 2);
        g.fillRect(7, 11 + y, 2, 2);
        g.fillRect(2, 6 + y, 2, 2);
        g.fillRect(12, 6 + y, 2, 2);
      }
    });
  }

  function coinSprite(frame) {
    const widths = [8, 6, 3, 6];
    const w = widths[frame % 4];
    return cached("coin-" + (frame % 4), 10, 14, (g) => {
      const x = Math.floor((10 - w) / 2);
      g.fillStyle = "#a86a12";
      g.fillRect(x, 2, w, 10);
      g.fillStyle = "#ffd15c";
      g.fillRect(x, 3, Math.max(1, w - 1), 8);
      if (w > 4) {
        g.fillStyle = "#fff2b0";
        g.fillRect(x + 1, 4, 2, 6);
      }
    });
  }

  function fireSprite() {
    return cached("fire", 8, 8, (g) => {
      g.fillStyle = "#ff8a3d";
      g.fillRect(1, 1, 6, 6);
      g.fillStyle = "#ffe08a";
      g.fillRect(2, 2, 3, 3);
      g.fillStyle = "#fff";
      g.fillRect(3, 2, 1, 1);
    });
  }

  function shotSprite() {
    return cached("shot", 8, 8, (g) => {
      g.fillStyle = "#ff5a3a";
      g.fillRect(1, 1, 6, 6);
      g.fillStyle = "#ffd0a0";
      g.fillRect(3, 2, 2, 2);
    });
  }

  function poseFor(p, time) {
    if (p.flag === 1) return "jump";
    if (!p.onGround) return "jump";
    if (p.skid) return "skid";
    if (Math.abs(p.vx) > 14) {
      const rate = 8 + Math.min(10, Math.abs(p.vx) / 18);
      return Math.floor(time * rate) % 2 === 0 ? "walk1" : "walk2";
    }
    return "stand";
  }

  const tintCanvas = canvas(16, 32);

  function drawPlayer(ctx, p, time) {
    if (p.invuln > 0 && Math.floor(time * 16) % 2 === 0) return;
    const form = p.form || "small";
    const pose = poseFor(p, time);
    const spr = heroSprite(pose, form);
    const big = form !== "small";
    const dw = 16;
    const dh = big ? 32 : 16;
    const dx = Math.round(p.x + p.w / 2 - 8);
    const dy = Math.round(p.y + p.h - dh);
    ctx.save();
    if (p.facing < 0) {
      const cx = Math.round(p.x + p.w / 2);
      ctx.translate(cx, 0);
      ctx.scale(-1, 1);
      ctx.translate(-cx, 0);
    }
    if (p.star > 0) {
      const colors = ["#ff5d6c", "#ffd15c", "#7dffb3", "#7ad7ff", "#e0b0ff"];
      const tint = colors[Math.floor(time * 14) % colors.length];
      const g = tintCanvas.getContext("2d");
      g.clearRect(0, 0, 16, 32);
      g.drawImage(spr, 0, 0);
      g.globalCompositeOperation = "source-atop";
      g.fillStyle = tint;
      g.globalAlpha = 0.72;
      g.fillRect(0, 0, 16, 32);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
      ctx.drawImage(tintCanvas, 0, 0, dw, dh, dx, dy, dw, dh);
    } else {
      ctx.drawImage(spr, dx, dy);
    }
    ctx.restore();
  }

  function drawEntity(ctx, e, time) {
    if (e.kind === "pacer") {
      const spr = pacerSprite(Math.floor(time * 6) % 2);
      ctx.save();
      const dx = Math.round(e.x + e.w / 2);
      const dy = Math.round(e.y + e.h - 16);
      if (e.vx > 0) {
        ctx.translate(dx, 0);
        ctx.scale(-1, 1);
        ctx.translate(-dx, 0);
      }
      ctx.drawImage(spr, Math.round(e.x + e.w / 2 - 8), dy);
      ctx.restore();
    } else if (e.kind === "shell") {
      const frame = Math.floor(time * (e.mode === "slide" ? 16 : 6)) % 2;
      const spr = shellSprite(e.mode, frame);
      ctx.drawImage(spr, Math.round(e.x + e.w / 2 - 8), Math.round(e.y + e.h - 16));
    } else if (e.kind === "glider") {
      const spr = drifterSprite(Math.floor(time * 8) % 2);
      ctx.save();
      if (e.vx > 0) {
        const cx = Math.round(e.x + e.w / 2);
        ctx.translate(cx, 0);
        ctx.scale(-1, 1);
        ctx.translate(-cx, 0);
      }
      ctx.drawImage(spr, Math.round(e.x + e.w / 2 - 9), Math.round(e.y + e.h / 2 - 7));
      ctx.restore();
    } else if (e.kind === "boss") {
      const spr = bossSprite(e.hurt > 0 && Math.floor(time * 20) % 2 === 0);
      ctx.drawImage(spr, Math.round(e.x + e.w / 2 - 16), Math.round(e.y + e.h - 32));
    } else if (e.kind === "item") {
      const bob = e.item === "bloom" ? Math.sin(time * 6) * 1 : 0;
      const spr = itemSprite(e.item, Math.floor(time * 8) % 2);
      ctx.drawImage(spr, Math.round(e.x + e.w / 2 - 8), Math.round(e.y + bob + e.h - 16));
    } else if (e.kind === "popcoin") {
      const spr = coinSprite(Math.floor(time * 16) % 4);
      ctx.drawImage(spr, Math.round(e.x), Math.round(e.y));
    } else if (e.kind === "fire") {
      ctx.drawImage(fireSprite(), Math.round(e.x), Math.round(e.y));
    } else if (e.kind === "shot") {
      ctx.drawImage(shotSprite(), Math.round(e.x), Math.round(e.y));
    } else if (e.kind === "plat") {
      const theme = THEMES[e.theme] || THEMES.meadow;
      ctx.fillStyle = LINE;
      ctx.fillRect(Math.round(e.x), Math.round(e.y), e.w, e.h);
      ctx.fillStyle = theme.wood;
      ctx.fillRect(Math.round(e.x) + 1, Math.round(e.y) + 1, e.w - 2, e.h - 2);
      ctx.fillStyle = theme.accent;
      ctx.fillRect(Math.round(e.x) + 2, Math.round(e.y) + 2, e.w - 4, 2);
    }
  }

  function hash(tx, ty) {
    return Math.abs((tx * 73856093) ^ (ty * 19349663)) % 997;
  }

  function drawTile(ctx, ch, x, y, themeName, time, tx, ty, bump, topOpen) {
    if (ch === "." || ch === "@" || ch === "1" || ch === "2" || ch === "3" || ch === "4" || ch === ">" || ch === "v" || ch === "m") return;
    const theme = THEMES[themeName] || THEMES.meadow;
    const by = y + (bump || 0);
    const hsh = hash(tx, ty);
    if ((ch === "#" || ch === "=") && themeName === "sky") {
      ctx.fillStyle = "#c5d7ea";
      ctx.fillRect(x, by + 5, 16, 11);
      ctx.fillStyle = "#f4fbff";
      ctx.fillRect(x, by, 16, 8);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 2, by + 1, 5, 3);
      ctx.fillStyle = "#e7f2fb";
      ctx.fillRect(x, by + 7, 16, 2);
      return;
    }
    if (ch === "#") {
      ctx.fillStyle = theme.groundDark;
      ctx.fillRect(x, by, 16, 16);
      ctx.fillStyle = theme.ground;
      ctx.fillRect(x, by, 16, 14);
      if (topOpen) {
        ctx.fillStyle = theme.grass;
        ctx.fillRect(x, by, 16, 4);
        ctx.fillStyle = theme.grassDark;
        ctx.fillRect(x, by + 3, 16, 2);
        if (hsh % 3 === 0) {
          ctx.fillStyle = theme.grassDark;
          ctx.fillRect(x + 3, by, 2, 2);
          ctx.fillRect(x + 10, by + 1, 2, 2);
        }
      } else {
        ctx.fillStyle = theme.groundDark;
        ctx.fillRect(x, by, 16, 3);
      }
      ctx.fillStyle = theme.groundDark;
      ctx.fillRect(x + (hsh % 8), by + 8, 3, 2);
      return;
    }
    if (ch === "=" || ch === "u") {
      ctx.fillStyle = theme.rockDark;
      ctx.fillRect(x, by, 16, 16);
      ctx.fillStyle = ch === "u" ? "#cbbfa6" : theme.rock;
      ctx.fillRect(x + 1, by + 1, 14, 14);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(x + 2, by + 2, 12, 2);
      return;
    }
    if (ch === "B") {
      ctx.fillStyle = theme.brickDark;
      ctx.fillRect(x, by, 16, 16);
      ctx.fillStyle = theme.brick;
      ctx.fillRect(x, by, 16, 7);
      ctx.fillRect(x, by + 8, 16, 7);
      ctx.fillStyle = theme.mortar;
      ctx.fillRect(x, by + 7, 16, 1);
      ctx.fillRect(x + 7, by, 1, 7);
      ctx.fillRect(x, by + 15, 16, 1);
      ctx.fillRect(x + 3, by + 8, 1, 7);
      ctx.fillRect(x + 12, by + 8, 1, 7);
      return;
    }
    if ("?MF*LQ".includes(ch)) {
      const shine = Math.floor(time * 6 + tx) % 4;
      ctx.fillStyle = "#a86a12";
      ctx.fillRect(x, by, 16, 16);
      ctx.fillStyle = shine === 0 ? "#ffe08a" : "#f0b429";
      ctx.fillRect(x + 1, by + 1, 14, 14);
      ctx.fillStyle = "#fff6cc";
      ctx.fillRect(x + 2, by + 2, 4, 2);
      ctx.fillStyle = "#7a4a08";
      ctx.fillRect(x + 6, by + 3, 4, 2);
      ctx.fillRect(x + 8, by + 5, 2, 2);
      ctx.fillRect(x + 6, by + 7, 4, 2);
      ctx.fillRect(x + 7, by + 11, 2, 2);
      return;
    }
    if ("(){}[]".includes(ch)) {
      const lip = ch === "(" || ch === ")" || ch === "[" || ch === "]";
      ctx.fillStyle = theme.pipeDark;
      ctx.fillRect(x, by, 16, 16);
      ctx.fillStyle = theme.pipe;
      ctx.fillRect(x + 1, by + (lip ? 2 : 0), 14, lip ? 14 : 16);
      ctx.fillStyle = theme.pipeHi;
      ctx.fillRect(x + 3, by + (lip ? 3 : 0), 3, lip ? 12 : 16);
      if (lip) {
        ctx.fillStyle = theme.pipeDark;
        ctx.fillRect(x, by, 16, 3);
        ctx.fillStyle = theme.pipe;
        ctx.fillRect(x + 1, by + 1, 14, 2);
      }
      return;
    }
    if (ch === "-") {
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fillRect(x, y, 16, 6);
      ctx.fillStyle = "#d5e6f8";
      ctx.fillRect(x, y + 4, 16, 3);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 2, y + 1, 4, 2);
      return;
    }
    if (ch === "o") {
      const spr = coinSprite(Math.floor(time * 8 + tx) % 4);
      ctx.drawImage(spr, x + 3, y + 1);
      return;
    }
    if (ch === "H" || ch === "f") {
      ctx.fillStyle = "#d7d2c8";
      ctx.fillRect(x + 6, y, 4, 16);
      ctx.fillStyle = "#8d8a82";
      ctx.fillRect(x + 6, y, 1, 16);
      if (ch === "f") {
        const wave = Math.sin(time * 8 + ty) * 2;
        ctx.fillStyle = "#14a090";
        ctx.fillRect(x + 10, y + 2, 10, 8);
        ctx.fillStyle = "#ffd25a";
        ctx.fillRect(x + 12, y + 4 + wave * 0.2, 5, 3);
      }
      return;
    }
    if (ch === "K" || ch === "k") {
      ctx.fillStyle = "#8a5a32";
      ctx.fillRect(x + 7, y, 3, 16);
      ctx.fillStyle = ch === "k" ? "#7dffb3" : "#ffd25a";
      ctx.beginPath();
      ctx.arc(x + 8, y + 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = LINE;
      ctx.fillRect(x + 7, y + 3, 2, 2);
      return;
    }
    if (ch === "^") {
      ctx.fillStyle = "#d7dde8";
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 16);
      ctx.lineTo(x + 8, y + 4);
      ctx.lineTo(x + 14, y + 16);
      ctx.fill();
      ctx.fillStyle = "#8aa0b8";
      ctx.fillRect(x + 7, y + 8, 2, 8);
      return;
    }
    if (ch === "~") {
      const shift = Math.floor(time * 8) % 8;
      ctx.fillStyle = "#c2410c";
      ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = "#fb923c";
      ctx.fillRect(x, y + ((shift + tx) % 6), 16, 4);
      ctx.fillStyle = "#fde68a";
      ctx.fillRect(x + (hsh % 10), y + 4, 4, 2);
      return;
    }
    if (ch === "G") {
      ctx.fillStyle = "#1b1418";
      ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = "#6a5648";
      ctx.fillRect(x + 2, y, 3, 16);
      ctx.fillRect(x + 11, y, 3, 16);
      ctx.fillStyle = "#d2a15a";
      ctx.fillRect(x, y, 16, 3);
      return;
    }
  }

  function drawBackground(ctx, themeName, camX, camY, time, mapW) {
    const theme = THEMES[themeName] || THEMES.meadow;
    const W = 384;
    const H = 224;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, theme.sky[0]);
    g.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    if (themeName !== "cave" && themeName !== "castle") {
      ctx.fillStyle = theme.sun;
      ctx.beginPath();
      ctx.arc(300, 42, 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (themeName === "cave") {
      ctx.fillStyle = theme.sun;
      for (let i = 0; i < 18; i++) {
        const px = ((i * 97 - camX * 0.15) % (W + 40)) + 10;
        const py = 20 + ((i * 53) % 90);
        ctx.globalAlpha = 0.35 + (i % 3) * 0.15;
        ctx.fillRect(px, py, 2, 2);
      }
      ctx.globalAlpha = 1;
    }

    for (let i = 0; i < 7; i++) {
      const base = i * 220;
      const x = base - (camX * (themeName === "cave" ? 0.2 : 0.28)) % 220;
      const y = 28 + (i % 3) * 14;
      ctx.fillStyle = theme.cloud;
      ctx.globalAlpha = themeName === "cave" || themeName === "castle" ? 0.35 : 0.9;
      ctx.fillRect(x, y, 36, 10);
      ctx.fillRect(x + 8, y - 6, 18, 8);
      ctx.globalAlpha = 1;
    }

    const hillPar = themeName === "sky" ? 0.25 : 0.38;
    for (let i = 0; i < 8; i++) {
      const x = i * 160 - (camX * hillPar) % 160 - 40;
      ctx.fillStyle = theme.hillDark;
      ctx.beginPath();
      ctx.arc(x + 50, 188 - camY * 0.15, 58, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = theme.hill;
      ctx.beginPath();
      ctx.arc(x + 10, 198 - camY * 0.15, 46, Math.PI, 0);
      ctx.fill();
    }

    if (themeName === "meadow" || themeName === "sky") {
      for (let i = 0; i < 10; i++) {
        const x = i * 120 - (camX * 0.55) % 120;
        ctx.fillStyle = theme.bush;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(x + 20, 176, 14, 0, Math.PI * 2);
        ctx.arc(x + 34, 178, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    if (themeName === "castle") {
      ctx.fillStyle = "rgba(255,120,50,0.18)";
      ctx.fillRect(0, 170, W, 54);
    }
  }

  function drawShadow(ctx, x, y, w) {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(x, y, w, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  HB.art = {
    THEMES,
    text: drawText,
    textWidth,
    drawPlayer,
    drawEntity,
    drawTile,
    drawBackground,
    drawShadow,
    coinSprite,
  };
})();
