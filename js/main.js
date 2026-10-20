(function () {
  const HB = window.HB;
  const canvas = document.getElementById("game");
  const stage = document.getElementById("stage");
  HB.input.attach();

  function fit() {
    const s = Math.max(1, Math.floor(Math.min(stage.clientWidth / 384, stage.clientHeight / 224)));
    canvas.style.width = 384 * s + "px";
    canvas.style.height = 224 * s + "px";
  }

  fit();
  window.addEventListener("resize", fit);
  HB.game.start(canvas);
})();
