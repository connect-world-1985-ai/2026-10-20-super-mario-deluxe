(function () {
  const HB = (window.HB = window.HB || {});

  function Grid(w, h) {
    const rows = Array.from({ length: h }, () => Array(w).fill("."));
    return {
      w,
      h,
      rows,
      set(x, y, c) {
        if (x >= 0 && y >= 0 && x < w && y < h) rows[y][x] = c;
      },
      fill(x, y, w2, h2, c) {
        for (let j = 0; j < h2; j++) {
          for (let i = 0; i < w2; i++) this.set(x + i, y + j, c);
        }
      },
      pipe(x, yTop, hgt, warp) {
        for (let i = 0; i < hgt; i++) {
          const y = yTop + i;
          const cap = i === 0;
          this.set(x, y, cap ? (warp ? "[" : "(") : "{");
          this.set(x + 1, y, cap ? (warp ? "]" : ")") : "}");
        }
      },
      pole(x, yTop, yBot) {
        this.set(x, yTop, "f");
        for (let y = yTop + 1; y <= yBot; y++) this.set(x, y, "H");
      },
      arc(x, y, n) {
        for (let i = 0; i < n; i++) {
          const dy = i === 0 || i === n - 1 ? 0 : i === 1 || i === n - 2 ? -1 : -2;
          this.set(x + i, y + dy, "o");
        }
      },
      text() {
        return this.rows.map((r) => r.join(""));
      },
    };
  }

  function meadow() {
    const g = Grid(188, 28);
    g.fill(0, 12, 188, 2, "#");
    g.fill(28, 12, 3, 2, ".");
    g.fill(46, 12, 3, 2, ".");
    g.fill(78, 12, 5, 2, ".");
    g.fill(118, 12, 3, 2, ".");
    g.fill(150, 12, 3, 2, ".");
    g.set(4, 11, "@");
    g.set(12, 8, "?");
    g.set(13, 8, "B");
    g.set(14, 8, "M");
    g.set(15, 8, "B");
    g.set(16, 8, "?");
    g.arc(12, 6, 5);
    g.set(20, 11, "1");
    g.set(24, 11, "1");
    g.set(36, 11, "2");
    g.pipe(40, 10, 2, false);
    g.set(52, 8, "B");
    g.set(53, 8, "Q");
    g.set(54, 8, "?");
    g.set(55, 8, "B");
    g.set(58, 7, "*");
    g.set(60, 11, "1");
    g.set(70, 11, "o");
    g.set(71, 11, "o");
    g.set(72, 11, "o");
    g.set(79, 9, ">");
    g.set(86, 11, "1");
    g.set(92, 11, "K");
    for (let i = 0; i < 4; i++) {
      for (let k = 0; k <= i; k++) g.set(98 + i, 11 - k, "B");
    }
    for (let i = 0; i < 4; i++) {
      for (let k = 0; k <= i; k++) g.set(108 - i, 11 - k, "B");
    }
    g.arc(102, 7, 4);
    g.pipe(112, 9, 3, true);
    g.set(124, 6, "3");
    g.set(130, 11, "2");
    g.set(136, 7, "m");
    g.set(140, 8, "F");
    g.set(141, 8, "B");
    g.set(142, 8, "B");
    g.set(143, 8, "L");
    g.pipe(156, 10, 2, false);
    g.set(164, 11, "1");
    g.set(168, 11, "1");
    g.pole(178, 4, 11);
    g.set(184, 10, "=");
    g.set(185, 10, "=");
    g.set(184, 9, "=");
    g.set(185, 9, "=");
    g.set(184, 8, "=");

    g.fill(2, 18, 40, 1, "=");
    g.fill(2, 26, 40, 2, "#");
    g.fill(2, 19, 1, 7, "#");
    g.fill(41, 19, 1, 7, "#");
    g.pipe(6, 24, 2, true);
    for (let i = 0; i < 12; i++) g.set(12 + (i % 6), 21 + Math.floor(i / 6), "o");
    for (let i = 0; i < 8; i++) g.set(20 + i, 23, "o");
    g.set(30, 21, "*");
    g.set(34, 21, "L");
    g.set(24, 25, "2");

    return {
      name: "MEADOW MILE",
      world: "1-1",
      theme: "meadow",
      music: "meadow",
      time: 320,
      rows: g.text(),
      warps: [
        { x: 112, y: 9, tx: 14, ty: 25 },
        { x: 6, y: 24, tx: 112, ty: 8 },
      ],
    };
  }

  function caves() {
    const g = Grid(160, 14);
    g.fill(0, 12, 160, 2, "#");
    g.fill(0, 0, 160, 1, "=");
    g.fill(36, 12, 4, 2, ".");
    g.fill(72, 12, 4, 2, ".");
    g.fill(112, 12, 6, 2, ".");
    g.set(3, 11, "@");
    for (let i = 0; i < 8; i++) g.set(8 + i, 10, "o");
    for (let i = 0; i < 6; i++) g.set(16 + i, 8, "o");
    for (let i = 0; i < 5; i++) g.set(22 + i, 6, "o");
    g.set(18, 11, "2");
    g.set(28, 11, "1");
    g.fill(40, 1, 28, 2, "=");
    g.fill(42, 6, 20, 1, "=");
    g.set(46, 10, "o");
    g.set(48, 10, "o");
    g.set(50, 9, "*");
    g.set(44, 11, "2");
    g.set(58, 11, "2");
    g.set(64, 8, "B");
    g.set(65, 8, "B");
    g.set(66, 8, "?");
    g.set(73, 8, "v");
    g.set(82, 11, "K");
    g.set(88, 8, "B");
    g.set(89, 8, "F");
    g.set(90, 8, "B");
    g.set(91, 8, "?");
    g.set(96, 11, "1");
    g.set(104, 11, "2");
    g.set(108, 5, "3");
    g.set(113, 9, ">");
    g.set(122, 11, "2");
    g.set(130, 8, "Q");
    g.set(134, 8, "M");
    g.set(140, 11, "1");
    g.pipe(146, 10, 2, false);
    g.pole(154, 3, 11);
    return {
      name: "GLOW CAVES",
      world: "1-2",
      theme: "cave",
      music: "cave",
      time: 300,
      rows: g.text(),
      warps: [],
    };
  }

  function sky() {
    const g = Grid(180, 14);
    const solid = (x, y, w) => {
      g.fill(x, y, w, 1, "=");
      if (y < 13) g.fill(x, y + 1, w, 1, "#");
    };
    const cloud = (x, y, w) => g.fill(x, y, w, 1, "-");
    solid(0, 12, 14);
    g.set(4, 11, "@");
    g.set(8, 8, "?");
    g.set(9, 8, "M");
    g.set(10, 8, "?");
    g.arc(7, 6, 5);
    cloud(18, 10, 5);
    g.set(19, 8, "o");
    g.set(20, 8, "o");
    g.set(21, 8, "o");
    solid(27, 9, 5);
    g.set(29, 6, "3");
    cloud(36, 11, 5);
    g.set(42, 8, ">");
    solid(50, 10, 7);
    g.set(52, 7, "F");
    g.set(54, 7, "o");
    g.set(55, 7, "o");
    g.set(56, 7, "o");
    cloud(61, 8, 5);
    g.set(68, 5, "3");
    solid(70, 9, 6);
    cloud(78, 10, 5);
    g.set(84, 8, "v");
    solid(90, 7, 8);
    g.set(91, 4, "*");
    g.set(93, 5, "o");
    g.set(94, 5, "o");
    solid(100, 12, 10);
    g.set(104, 11, "K");
    cloud(114, 9, 5);
    g.set(122, 6, "3");
    g.set(124, 8, ">");
    solid(132, 10, 6);
    g.set(134, 8, "o");
    g.set(135, 8, "o");
    solid(142, 8, 6);
    g.set(148, 5, "3");
    solid(152, 10, 24);
    g.set(156, 6, "L");
    g.pole(168, 3, 9);
    return {
      name: "CLOUD COAST",
      world: "1-3",
      theme: "sky",
      music: "sky",
      time: 300,
      rows: g.text(),
      warps: [],
    };
  }

  function castle() {
    const g = Grid(180, 14);
    g.fill(0, 0, 180, 2, "=");
    g.fill(0, 12, 180, 2, "#");
    g.fill(24, 12, 5, 2, "~");
    g.fill(48, 12, 8, 2, "~");
    g.fill(80, 12, 4, 2, "~");
    g.fill(116, 12, 10, 2, "~");
    g.set(3, 11, "@");
    g.set(10, 8, "?");
    g.set(11, 8, "B");
    g.set(12, 8, "M");
    g.set(13, 8, "B");
    g.set(16, 11, "2");
    g.set(20, 11, "1");
    g.set(25, 9, ">");
    g.set(34, 8, "B");
    g.set(35, 8, "F");
    g.set(36, 8, "B");
    g.set(40, 11, "2");
    g.fill(42, 7, 5, 1, "=");
    g.set(44, 6, "^");
    g.set(50, 8, ">");
    g.set(56, 10, "v");
    g.set(66, 11, "K");
    g.set(72, 11, "2");
    g.set(76, 8, "Q");
    g.set(84, 11, "1");
    g.set(90, 8, "B");
    g.set(91, 8, "B");
    g.set(92, 8, "*");
    g.set(93, 8, "B");
    g.set(100, 11, "2");
    g.set(108, 11, "1");
    g.set(118, 9, ">");
    g.set(124, 7, ">");
    g.set(136, 11, "2");
    g.set(146, 11, "4");
    for (let y = 2; y <= 11; y++) {
      g.set(160, y, "G");
      g.set(161, y, "G");
    }
    g.pole(170, 4, 11);
    g.set(174, 10, "=");
    g.set(175, 10, "=");
    g.set(174, 9, "=");
    g.set(175, 9, "=");
    g.set(174, 8, "=");
    return {
      name: "EMBER KEEP",
      world: "1-4",
      theme: "castle",
      music: "castle",
      time: 400,
      rows: g.text(),
      warps: [],
      boss: true,
    };
  }

  const defs = [meadow(), caves(), sky(), castle()];
  defs.forEach((def) => {
    const w = def.rows[0].length;
    if (!def.rows.every((r) => r.length === w)) throw new Error("Uneven rows in " + def.name);
    if (!def.rows.some((r) => r.includes("@"))) throw new Error("Missing start in " + def.name);
    if (!def.rows.some((r) => r.includes("f"))) throw new Error("Missing flag in " + def.name);
  });

  HB.levelDefs = defs;
})();
