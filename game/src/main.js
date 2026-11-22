// Boot and the one loop: the table is repainted after every action, the
// witch answers on a short delay so her cards are readable, and the game
// moves between four screens: title, play, victory and defeat.
//
// ?seed=N fixes the shuffle. ?shot=title|play|win|loss (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { GAME } from './config.js';
import { createRandom } from './random.js';
import { aiTakeTurn, createGame, playCard, SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, startDuel } from './state.js';
import { render } from './render.js';
import { ACTION_CONFIRM, ACTION_END_TURN, ACTION_RESTART, createInput } from './input.js';
import { stageShot } from './shots.js';
import { sfx } from './audio.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const status = document.getElementById('status');
const state = createGame(createRandom(seed));

function fitStage() {
  const table = document.getElementById('table');
  const scale = Math.min(window.innerWidth / GAME.width, window.innerHeight / GAME.height);
  table.style.transform = `scale(${scale})`;
}

function announce(message) {
  status.textContent = message;
}

function draw() {
  render(state, onPlayCard);
  fitStage();
}

function onPlayCard(index) {
  if (state.screen !== SCREEN_PLAY || !state.playerTurn) return;
  const before = state.foe.hp;
  if (!playCard(state, 'player', index)) return;
  sfx.play();
  if (state.foe.hp < before) sfx.hurt();
  if (state.screen === SCREEN_WIN) { sfx.win(); announce('Victory! The Cinder Witch is extinguished.'); }
  draw();
}

function endPlayerTurn() {
  if (state.screen !== SCREEN_PLAY || !state.playerTurn) return;
  state.playerTurn = false;
  draw();
  window.setTimeout(() => {
    aiTakeTurn(state);
    if (state.screen === SCREEN_LOSS) sfx.loss();
    else sfx.click();
    announce(state.screen === SCREEN_LOSS ? 'Defeat. Your sigil fades.' : `Round ${state.turn} — your turn.`);
    draw();
  }, 650);
}

function restart() {
  const fresh = createGame(createRandom(Math.floor(Math.random() * 4294967296)));
  Object.assign(state, fresh);
  state.screen = SCREEN_TITLE;
  sfx.click();
  announce('Ember Sigil Duel. Press Space or click to start.');
  draw();
}

function runShot(name) {
  stageShot(name, state);
  let painted = 0;
  function paint() {
    draw();
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput();
  document.getElementById('end-turn').addEventListener('click', () => { sfx.click(); endPlayerTurn(); });
  document.getElementById('restart').addEventListener('click', restart);
  document.getElementById('overlay').addEventListener('click', () => {
    if (state.screen === SCREEN_TITLE) { sfx.click(); startDuel(state); draw(); }
  });

  function frame() {
    const actions = input.takeActions();
    const playIndex = input.takePlayIndex();
    if (playIndex >= 0) onPlayCard(playIndex);
    if (actions & ACTION_CONFIRM) {
      if (state.screen === SCREEN_TITLE) { sfx.click(); startDuel(state); draw(); }
      else if (state.screen === SCREEN_WIN || state.screen === SCREEN_LOSS) restart();
    }
    if (actions & ACTION_END_TURN) endPlayerTurn();
    if (actions & ACTION_RESTART) restart();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', fitStage);
  announce('Ember Sigil Duel. Press Space or click to start.');
  draw();
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
