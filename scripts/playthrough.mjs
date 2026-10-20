let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  ({ chromium } = await import("/tmp/node_modules/playwright/index.mjs"));
}
import fs from "fs";

const OUT = "/opt/cursor/artifacts";
fs.mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch({
  executablePath: "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--use-gl=swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 720 } });
page.on("pageerror", (err) => errors.push("pageerror: " + err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push("console: " + msg.text());
});

await page.goto("http://127.0.0.1:8765/index.html", { waitUntil: "load" });
await page.waitForTimeout(400);
await page.screenshot({ path: OUT + "/01-title.png" });

const blank = await page.evaluate(() => {
  const c = document.getElementById("game");
  const ctx = c.getContext("2d");
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  let colored = 0;
  for (let i = 0; i < data.length; i += 16) {
    if (data[i] + data[i + 1] + data[i + 2] > 30) colored++;
  }
  return colored;
});

await page.keyboard.press("Enter");
await page.waitForTimeout(250);
await page.screenshot({ path: OUT + "/02-world-map.png" });

async function shot(name) {
  await page.evaluate(() => window.HOP.render());
  await page.screenshot({ path: OUT + "/" + name });
}

const report = await page.evaluate(async () => {
  const H = window.HOP;
  const problems = [];
  const notes = {};
  const assert = (cond, msg) => {
    if (!cond) problems.push(msg);
  };
  H.freeze(true);

  function settle(level) {
    H.loadLevel(level);
    H.hold({});
    H.tick(25);
  }

  settle(0);
  let s = H.state();
  assert(s.player && s.player.onGround, "meadow start not grounded");
  const groundY = s.player.y;

  H.hold({ jump: true });
  let peak = groundY;
  for (let i = 0; i < 40; i++) {
    H.tick(1);
    peak = Math.min(peak, H.state().player.y);
  }
  const fullHeight = groundY - peak;
  notes.fullHeight = Math.round(fullHeight);
  assert(fullHeight > 55, "full jump too low " + fullHeight);

  settle(0);
  const yShort0 = H.state().player.y;
  H.hold({ jump: true });
  H.tick(1);
  H.hold({});
  peak = yShort0;
  for (let i = 0; i < 40; i++) {
    H.tick(1);
    peak = Math.min(peak, H.state().player.y);
  }
  const shortHeight = yShort0 - peak;
  notes.shortHeight = Math.round(shortHeight);
  assert(shortHeight > 12, "short hop too low " + shortHeight);
  assert(fullHeight > shortHeight + 20, "variable jump weak " + fullHeight + " vs " + shortHeight);

  settle(0);
  const runStart = H.state().player.x;
  H.hold({ right: true, run: true });
  H.tick(45);
  notes.runSpeed = Math.round((H.state().player.x - runStart) / (45 / 60));
  assert(notes.runSpeed > 120, "run speed low " + notes.runSpeed);
  H.hold({ right: true });
  const walkMark = H.state().player.x;
  H.tick(40);
  notes.walkSpeed = Math.round((H.state().player.x - walkMark) / (40 / 60));
  assert(notes.walkSpeed > 60 && notes.walkSpeed < notes.runSpeed, "walk speed " + notes.walkSpeed);

  settle(0);
  H.place(26 * 16, 12 * 16 - 14);
  H.tick(8);
  assert(H.state().player.onGround, "not grounded before coyote");
  H.hold({ right: true, run: true });
  let armed = false;
  let coyote = false;
  for (let i = 0; i < 70; i++) {
    const before = H.state().player;
    H.tick(1);
    const now = H.state().player;
    if (!armed && before.onGround && now && !now.onGround) {
      armed = true;
      H.hold({ right: true, run: true, jump: true });
      H.tick(2);
      coyote = H.state().player.vy < -80;
      break;
    }
    if (now && now.dead) break;
  }
  notes.coyote = coyote;
  assert(coyote, "coyote time failed");

  settle(0);
  H.place(8 * 16, 6 * 16);
  H.hold({ jump: true });
  let buffered = false;
  let leftGround = false;
  for (let i = 0; i < 80; i++) {
    const before = H.state().player;
    H.tick(1);
    const now = H.state().player;
    if (before && !before.onGround) leftGround = true;
    if (leftGround && now && now.onGround && now.vy < -80) buffered = true;
    if (leftGround && now && now.vy < -150) buffered = true;
    if (now && now.dead) break;
  }
  notes.buffered = buffered;
  assert(buffered, "jump buffer failed");

  settle(0);
  const beforeCoins = H.state().coins;
  H.place(12 * 16, 6 * 16 - 2);
  H.hold({});
  H.tick(4);
  notes.coins = H.state().coins;
  assert(H.state().coins > beforeCoins, "coin not collected");

  settle(0);
  H.place(20 * 16, 8 * 16);
  H.hold({});
  let stomped = false;
  for (let i = 0; i < 60; i++) {
    H.tick(1);
    const st = H.state();
    if (st.score >= 100 && st.player && st.player.vy < 0) stomped = true;
    if (st.player && st.player.dead) break;
  }
  notes.stompScore = H.state().score;
  notes.stomped = stomped;
  assert(stomped, "pacer stomp failed, score " + H.state().score);

  settle(0);
  H.give("fire");
  H.hold({ run: true });
  H.tick(1);
  H.hold({});
  H.tick(8);
  const fires = H.state().entities.filter((e) => e.kind === "fire").length;
  notes.fires = fires;
  assert(fires >= 1, "fireball missing");
  assert(H.state().player.form === "fire", "form not fire");

  const levels = [];
  for (let i = 0; i < 4; i++) {
    settle(i);
    const st = H.state();
    levels.push({
      i,
      state: st.state,
      ground: !!(st.player && st.player.onGround),
      entities: st.entities.length,
      err: st.errorText,
      y: st.player && Math.round(st.player.y),
    });
    assert(!st.errorText, "level " + i + " error " + st.errorText);
    assert(st.player && !st.player.dead && st.player.onGround, "level " + i + " not safe at start");
  }
  notes.levels = levels;

  settle(0);
  let fx = 0;
  let fy = 0;
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 188; x++) {
      if (H.tile(x, y) === "f") {
        fx = x;
        fy = y;
      }
    }
  }
  H.place(fx * 16 + 2, (fy + 4) * 16);
  H.hold({});
  for (let i = 0; i < 90; i++) {
    H.tick(1);
    if (H.state().state === "tally") break;
  }
  notes.afterFlag = H.state().state;
  assert(H.state().state === "tally", "flag did not tally, state " + H.state().state);
  H.hold({ start: true });
  for (let i = 0; i < 40; i++) H.tick(1);
  notes.afterTally = H.state().state;
  notes.unlocked = H.state().unlocked;
  assert(H.state().state === "cleared", "course clear missing " + H.state().state);
  assert(H.state().unlocked >= 2, "progress not saved in state");

  settle(3);
  H.killBoss();
  notes.bossBeaten = H.state().bossBeaten;
  assert(H.state().bossBeaten, "boss did not fall");
  fx = 0;
  fy = 0;
  for (let y = 0; y < 14; y++) {
    for (let x = 0; x < 180; x++) {
      if (H.tile(x, y) === "f") {
        fx = x;
        fy = y;
      }
    }
  }
  H.place(fx * 16 + 2, (fy + 4) * 16);
  H.hold({});
  for (let i = 0; i < 100; i++) {
    H.tick(1);
    if (H.state().state === "tally") break;
  }
  assert(H.state().state === "tally", "castle flag failed " + H.state().state + " dead " + H.state().player?.dead);
  H.hold({ start: true });
  for (let i = 0; i < 50; i++) H.tick(1);
  notes.ending = H.state().state;
  assert(H.state().state === "victory", "victory missing " + H.state().state);

  settle(1);
  H.hold({ pause: true });
  H.tick(2);
  H.hold({});
  notes.pause = H.state().state;
  assert(H.state().state === "pause", "pause failed");

  settle(2);
  for (let n = 0; n < 3; n++) {
    H.place(40, 4000);
    H.tick(8);
    for (let i = 0; i < 90 && H.state().state === "dead"; i++) H.tick(1);
  }
  notes.afterDeaths = H.state().state;
  assert(H.state().state === "gameover", "game over missing " + H.state().state + " lives " + H.state().lives);

  return { problems, notes };
});

await shot("03-game-over.png");

const view = await browser.newPage({ viewport: { width: 1100, height: 720 } });
await view.goto("http://127.0.0.1:8765/index.html", { waitUntil: "load" });
await view.waitForTimeout(250);
await view.screenshot({ path: OUT + "/01-title.png" });
await view.keyboard.press("Enter");
await view.waitForTimeout(200);
await view.screenshot({ path: OUT + "/02-world-map.png" });
async function look(fn, name) {
  await view.evaluate(fn);
  await view.screenshot({ path: OUT + "/" + name });
}

await look(() => {
  window.HOP.freeze(true);
  window.HOP.loadLevel(0);
  window.HOP.hold({ right: true, run: true });
  window.HOP.tick(50);
}, "04-meadow.png");

await look(() => {
  window.HOP.loadLevel(0);
  window.HOP.tick(5);
  window.HOP.place(40 * 16, 10 * 16 - 20);
  window.HOP.hold({});
  window.HOP.tick(8);
}, "05-meadow-pipe.png");

await look(() => {
  window.HOP.loadLevel(1);
  window.HOP.hold({});
  window.HOP.tick(20);
}, "06-caves.png");

await look(() => {
  window.HOP.loadLevel(2);
  window.HOP.hold({});
  window.HOP.tick(20);
  window.HOP.place(52 * 16, 8 * 16);
  window.HOP.tick(8);
}, "07-sky.png");

await look(() => {
  window.HOP.loadLevel(3);
  window.HOP.hold({});
  window.HOP.tick(10);
  window.HOP.place(140 * 16, 12 * 16 - 48);
  window.HOP.tick(20);
}, "08-castle-boss.png");

await look(() => {
  window.HOP.hold({ pause: true });
  window.HOP.tick(2);
  window.HOP.hold({});
}, "09-pause.png");

await look(() => {
  window.HOP.loadLevel(3);
  window.HOP.tick(5);
  window.HOP.killBoss();
  let fx = 170;
  for (let y = 0; y < 14; y++) {
    for (let x = 0; x < 180; x++) if (window.HOP.tile(x, y) === "f") fx = x;
  }
  window.HOP.place(fx * 16, 9 * 16);
  window.HOP.hold({});
  for (let i = 0; i < 90 && window.HOP.state().state !== "tally"; i++) window.HOP.tick(1);
  window.HOP.hold({ start: true });
  for (let i = 0; i < 80 && window.HOP.state().state !== "victory"; i++) window.HOP.tick(1);
  window.HOP.hold({});
  window.HOP.tick(8);
}, "10-victory.png");

const fps = await page.evaluate(async () => {
  window.HOP.freeze(false);
  window.HOP.loadLevel(0);
  await new Promise((r) => setTimeout(r, 1200));
  return window.HOP.fps;
});

const mobile = await browser.newPage({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true });
await mobile.goto("http://127.0.0.1:8765/index.html", { waitUntil: "load" });
await mobile.waitForTimeout(300);
await mobile.screenshot({ path: OUT + "/11-mobile-title.png" });
const touchVisible = await mobile.evaluate(() => {
  const el = document.getElementById("touch");
  return getComputedStyle(el).display !== "none";
});
await mobile.keyboard.press("Enter");
await mobile.waitForTimeout(200);
await mobile.screenshot({ path: OUT + "/12-mobile-map.png" });

await browser.close();

const summary = {
  blankPixels: blank,
  fps,
  touchVisible,
  problems: report.problems,
  notes: report.notes,
  errors,
};
fs.writeFileSync(OUT + "/playthrough-report.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (report.problems.length || errors.length) process.exit(1);
