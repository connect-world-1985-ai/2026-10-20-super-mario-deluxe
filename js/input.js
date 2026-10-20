(function () {
  const HB = (window.HB = window.HB || {});
  const ACTS = ["left", "right", "up", "down", "jump", "run", "start", "pause", "mute"];

  const kb = {};
  const touch = {};
  const debug = {};
  const held = {};
  const prev = {};
  const pressed = {};
  const released = {};
  ACTS.forEach((k) => {
    kb[k] = false;
    touch[k] = false;
    debug[k] = false;
    held[k] = false;
    prev[k] = false;
  });

  let userOn = false;
  const codeMap = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowDown: "down",
    ArrowUp: "up",
    KeyA: "left",
    KeyD: "right",
    KeyS: "down",
    KeyW: "up",
    Space: "jump",
    KeyZ: "jump",
    KeyJ: "jump",
    KeyX: "run",
    KeyK: "run",
    ShiftLeft: "run",
    ShiftRight: "run",
    Enter: "start",
    Escape: "pause",
    KeyP: "pause",
    KeyM: "mute",
  };

  function markUser() {
    userOn = true;
    if (HB.audio) HB.audio.unlock();
  }

  function setCode(code, down) {
    const act = codeMap[code];
    if (!act) return;
    kb[act] = down;
    if (down) markUser();
  }

  function compose() {
    const gp = readPad();
    for (const k of ACTS) {
      held[k] = !!(kb[k] || touch[k] || debug[k] || gp[k]);
      pressed[k] = held[k] && !prev[k];
      released[k] = !held[k] && prev[k];
      prev[k] = held[k];
    }
  }

  function readPad() {
    const out = {};
    const pads = navigator.getGamepads ? navigator.getGamepads() : null;
    if (!pads) return out;
    for (const pad of pads) {
      if (!pad) continue;
      const ax = pad.axes || [];
      const b = pad.buttons || [];
      const lx = ax[0] || 0;
      const ly = ax[1] || 0;
      const on = (i) => !!(b[i] && b[i].pressed);
      if (lx < -0.35 || on(14)) out.left = true;
      if (lx > 0.35 || on(15)) out.right = true;
      if (ly > 0.45 || on(13)) out.down = true;
      if (ly < -0.45 || on(12)) out.up = true;
      if (on(0) || on(1)) out.jump = true;
      if (on(2) || on(5) || on(7)) out.run = true;
      if (on(9)) out.start = true;
      if (on(8)) out.pause = true;
      if (out.left || out.right || out.jump || out.start) markUser();
    }
    return out;
  }

  function attach() {
    window.addEventListener("keydown", (e) => {
      if (codeMap[e.code]) {
        e.preventDefault();
        setCode(e.code, true);
      }
    });
    window.addEventListener("keyup", (e) => {
      if (codeMap[e.code]) {
        e.preventDefault();
        setCode(e.code, false);
      }
    });
    window.addEventListener("blur", () => {
      ACTS.forEach((k) => {
        kb[k] = false;
      });
    });

    document.querySelectorAll("#touch button").forEach((btn) => {
      const act = btn.getAttribute("data-act");
      const down = (e) => {
        e.preventDefault();
        btn.setPointerCapture?.(e.pointerId);
        if (act === "pause" || act === "mute") {
          debugPulse(act);
        } else {
          touch[act] = true;
          btn.classList.add("held");
        }
        markUser();
      };
      const up = (e) => {
        e.preventDefault();
        if (act !== "pause" && act !== "mute") {
          touch[act] = false;
          btn.classList.remove("held");
        }
      };
      btn.addEventListener("pointerdown", down);
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointercancel", up);
      btn.addEventListener("pointerleave", (e) => {
        if (e.buttons === 0) up(e);
      });
    });

    const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820;
    if (coarse) document.body.classList.add("show-touch");
  }

  const pulses = { pause: 0, mute: 0 };
  function debugPulse(act) {
    pulses[act] = 2;
  }

  function endFrame() {
    if (pulses.pause > 0) {
      pulses.pause--;
      if (pulses.pause === 1) {
        touch.pause = true;
      } else if (pulses.pause === 0) {
        touch.pause = false;
      }
    }
    if (pulses.mute > 0) {
      pulses.mute--;
      if (pulses.mute === 1) {
        touch.mute = true;
      } else if (pulses.mute === 0) {
        touch.mute = false;
      }
    }
  }

  HB.input = {
    attach,
    compose,
    endFrame,
    held,
    pressed,
    released,
    debug,
    get userOn() {
      return userOn;
    },
    set userOn(v) {
      userOn = v;
    },
  };
})();
