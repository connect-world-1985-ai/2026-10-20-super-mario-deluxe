# Hopbound Deluxe

An original four-course platformer that runs in the browser. It is built with HTML5 Canvas and vanilla JavaScript, so GitHub Pages can host it with no build step and no server.

All sprites are drawn in code. Sound effects and the looping songs are synthesized with the Web Audio API. Nothing in the game is taken from Nintendo.

**Play it:** https://connect-world-1985-ai.github.io/2026-10-20-super-mario-deluxe/

After Pages is enabled for this repo (branch `main`, folder `/`), that URL serves `index.html` from the repository root.

## Courses

The trail map unlocks the next course when you touch the flag. Best scores are kept in `localStorage`.

| Course | Name | What changes |
| --- | --- | --- |
| 1-1 | Meadow Mile | Hills, pipes, a warp into a coin cellar, brick stairs |
| 1-2 | Glow Caves | Low ceilings, shell enemies, moving platforms |
| 1-3 | Cloud Coast | Floating islands, one-way clouds, flyers |
| 1-4 | Ember Keep | Lava gaps, a gate, and the Ember Warden |

## Play

- Run with acceleration. Hold the run button to go faster.
- Jump height depends on how long you hold the button.
- You can still jump for a few frames after leaving a ledge, and a jump pressed just before landing is remembered.
- Question blocks hide coins, a sprout (grow), a bloom (fire shots), a gleam (brief invincibility), or an extra life.
- Bricks break once you are grown. Pipes, one-way clouds, and moving platforms are solid from the sides or the top as appropriate.
- Stomp a shell enemy to stop it, then kick the shell. A sliding shell clears other enemies.
- Checkpoints remember where you return after a fall. The flag scores by height, then leftover time is added to the score.
- One hundred coins grant an extra life. The run ends at zero lives.

## Controls

| Action | Keyboard | Gamepad | Touch |
| --- | --- | --- | --- |
| Move | Arrow keys or A / D | Stick or D-pad | On-screen arrows |
| Jump | Z, J, Space, W, or Up | A or B | Jump |
| Run / shoot | X, K, or Shift | X or a shoulder button | Run |
| Enter a pipe | Down or S, while standing on it | D-pad down | Down |
| Pause | Enter, Esc, or P | Start | II |
| Mute | M | — | Speaker button |
| Confirm / start | Enter or jump | Start or A | Tap the screen |

Touch controls appear on phones and narrow windows. Mute is remembered with your scores.

## Project layout

```
index.html          page, canvas, touch buttons
css/style.css       crisp pixel scaling
js/main.js          bootstrap and integer scaling
js/game.js          physics, courses, screens, save data
js/levels.js        four hand-built courses
js/sprites.js       procedural pixel art and bitmap font
js/audio.js         synthesized effects and songs
js/input.js         keyboard, gamepad, and touch
scripts/playthrough.mjs   headless playthrough (needs Playwright)
```

Open `index.html` directly, or from this folder:

```bash
python3 -m http.server 8765
```

The headless script drives a real canvas, checks jump height, coyote time, jump buffering, coins, stomps, fire shots, every course, the flag, the boss, pause, and game over, and writes screenshots.

## License

This is an original fan-style platformer and is not affiliated with Nintendo.
