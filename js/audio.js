(function () {
  const HB = (window.HB = window.HB || {});

  function midi(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  const SONGS = {
    title: {
      bpm: 96,
      lead: [64, 67, 69, 71, 69, 67, 64, 62, 60, 62, 64, 67, 69, 67, 64, 60],
      bass: [48, 48, 43, 43, 45, 45, 48, 48, 41, 41, 43, 43, 48, 45, 43, 41],
    },
    map: {
      bpm: 110,
      lead: [67, 71, 74, 71, 67, 64, 67, 62, 64, 67, 71, 74, 76, 74, 71, 67],
      bass: [43, 43, 50, 50, 47, 47, 43, 43, 45, 45, 43, 43, 38, 38, 43, 43],
    },
    meadow: {
      bpm: 132,
      lead: [67, 69, 71, 74, 71, 69, 67, 64, 62, 64, 67, 69, 71, 69, 67, 62],
      bass: [55, 55, 50, 50, 53, 53, 55, 43, 50, 50, 53, 53, 55, 50, 55, 43],
    },
    cave: {
      bpm: 96,
      lead: [62, 65, 67, 69, 67, 65, 64, 62, 57, 60, 62, 64, 65, 64, 62, 60],
      bass: [50, 50, 45, 45, 41, 41, 48, 48, 50, 45, 41, 41, 48, 45, 50, 43],
    },
    sky: {
      bpm: 124,
      lead: [72, 76, 79, 76, 81, 79, 76, 74, 72, 74, 76, 79, 76, 74, 72, 69],
      bass: [48, 48, 55, 55, 53, 53, 50, 50, 48, 52, 55, 55, 53, 50, 48, 45],
    },
    castle: {
      bpm: 108,
      lead: [57, 60, 64, 69, 67, 64, 62, 60, 57, 59, 60, 64, 62, 60, 59, 57],
      bass: [45, 45, 40, 40, 41, 41, 36, 36, 45, 43, 41, 41, 38, 38, 45, 40],
    },
    star: {
      bpm: 186,
      lead: [72, 74, 76, 79, 76, 79, 81, 79, 84, 81, 79, 76, 79, 76, 74, 72],
      bass: [48, 55, 48, 55, 50, 57, 50, 57, 53, 60, 53, 60, 55, 48, 55, 48],
    },
  };

  const JINGLES = {
    flag: [67, 72, 76, 79, 76, 72],
    clear: [72, 76, 79, 84],
    win: [64, 67, 72, 76, 79, 84, 88],
    die: [64, 60, 57, 52],
    oneup: [72, 76, 79, 84],
    power: [60, 64, 67, 72],
  };

  let ac = null;
  let muted = false;
  let gen = 0;
  let timer = null;
  let current = null;
  let noiseBuf = null;

  function context() {
    if (ac) return ac;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ac = new Ctor();
    return ac;
  }

  function unlock() {
    const ctx = context();
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  function tone(time, freq, dur, vol, type, slideTo) {
    if (muted) return;
    const ctx = context();
    if (!ctx || !freq) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, time);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), time + dur);
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(time);
    o.stop(time + dur + 0.02);
  }

  function noise(dur, vol) {
    if (muted) return;
    const ctx = context();
    if (!ctx) return;
    const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
    if (!noiseBuf || noiseBuf.length < n) {
      noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.3), ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start(t);
    src.stop(t + dur);
  }

  function stopMusic() {
    gen++;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    current = null;
  }

  function playSong(name) {
    if (!SONGS[name]) return;
    stopMusic();
    if (muted) {
      current = name;
      return;
    }
    const ctx = context();
    if (!ctx) return;
    const song = SONGS[name];
    const id = gen;
    current = name;
    const beat = 60 / song.bpm;
    const step = beat * 0.5;
    let index = 0;
    let next = ctx.currentTime + 0.06;
    timer = setInterval(() => {
      if (id !== gen || muted || !ac) return;
      while (next < ac.currentTime + 0.28) {
        const i = index % song.lead.length;
        const lead = song.lead[i];
        const bass = song.bass[i];
        if (lead) tone(next, midi(lead), step * 0.92, 0.028, "square");
        if (bass) tone(next, midi(bass), step * 0.95, 0.03, "triangle");
        next += step;
        index++;
      }
    }, 60);
  }

  function playNotes(name, stop) {
    const notes = JINGLES[name];
    if (!notes) return;
    if (stop) stopMusic();
    const ctx = context();
    if (!ctx || muted) return;
    let t = ctx.currentTime + 0.02;
    const dur = name === "die" ? 0.18 : 0.12;
    notes.forEach((m, i) => {
      tone(t, midi(m), dur * 1.4, 0.05, i % 2 ? "square" : "triangle");
      t += dur;
    });
  }

  function jingle(name) {
    playNotes(name, true);
  }

  function stinger(name) {
    playNotes(name, false);
  }

  const SFX = {
    jump: () => {
      const ctx = context();
      if (!ctx) return;
      tone(ctx.currentTime, 420, 0.09, 0.05, "square", 720);
    },
    coin: () => {
      const ctx = context();
      if (!ctx) return;
      tone(ctx.currentTime, 988, 0.06, 0.045, "square");
      tone(ctx.currentTime + 0.06, 1312, 0.1, 0.04, "square");
    },
    bump: () => {
      const ctx = context();
      if (!ctx) return;
      tone(ctx.currentTime, 140, 0.06, 0.05, "square", 70);
    },
    break: () => {
      noise(0.12, 0.08);
      const ctx = context();
      if (ctx) tone(ctx.currentTime, 200, 0.08, 0.04, "square", 60);
    },
    stomp: () => {
      const ctx = context();
      if (!ctx) return;
      tone(ctx.currentTime, 220, 0.08, 0.05, "square", 90);
    },
    kick: () => {
      const ctx = context();
      if (!ctx) return;
      tone(ctx.currentTime, 160, 0.1, 0.05, "square", 70);
    },
    hurt: () => {
      const ctx = context();
      if (!ctx) return;
      tone(ctx.currentTime, 320, 0.16, 0.05, "square", 80);
    },
    fire: () => {
      const ctx = context();
      if (!ctx) return;
      tone(ctx.currentTime, 760, 0.07, 0.04, "square", 240);
    },
    check: () => {
      const ctx = context();
      if (!ctx) return;
      tone(ctx.currentTime, 660, 0.07, 0.04, "square");
      tone(ctx.currentTime + 0.07, 880, 0.1, 0.04, "square");
    },
    tick: () => {
      const ctx = context();
      if (!ctx) return;
      tone(ctx.currentTime, 880, 0.03, 0.03, "square");
    },
    pause: () => {
      const ctx = context();
      if (!ctx) return;
      tone(ctx.currentTime, 520, 0.05, 0.03, "square");
    },
  };

  function sfx(name) {
    if (muted) return;
    const fn = SFX[name];
    if (fn) fn();
    if (name === "oneup") stinger("oneup");
    if (name === "power") stinger("power");
    if (name === "die") jingle("die");
  }

  function setMuted(v) {
    muted = !!v;
    if (muted) {
      const keep = current;
      stopMusic();
      current = keep;
    } else if (current) {
      playSong(current);
    }
  }

  HB.audio = {
    unlock,
    sfx,
    music: playSong,
    jingle,
    stinger,
    stop: stopMusic,
    setMuted,
    isMuted: () => muted,
    current: () => current,
  };
})();
