// The screenshot scenes behind ?shot=title|play|win|loss. Each one stages a
// real duel state from the seeded deck — a fresh title table, a mid-game
// table with both hands and played cards, or a finished duel — so the frame
// is what the game really looks like and the same seed always gives it.
import { SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, playCard } from './state.js';

function stageMidGame(state) {
  state.screen = SCREEN_PLAY;
  state.turn = 4;
  state.player.maxMana = 6;
  state.player.mana = 4;
  state.foe.maxMana = 6;
  state.foe.mana = 2;
  state.player.hp = 24;
  state.foe.hp = 18;
  state.player.shield = 3;
  state.foe.shield = 0;
  state.damageDealt = 12;
  state.cardsPlayed = 5;
  // Play two real cards onto the table, one per side.
  const myCard = state.player.hand.findIndex((id) => id.startsWith('ember'));
  if (myCard >= 0) playCard(state, 'player', myCard);
  const foeCard = state.foe.hand.findIndex((id) => id.startsWith('stone'));
  if (foeCard >= 0) playCard(state, 'foe', foeCard);
  state.screen = SCREEN_PLAY;
  state.playerTurn = true;
  state.log = [
    'Round 4 — your turn.',
    `Mana ${state.player.mana}/${state.player.maxMana}. Play a card, then End Turn.`,
  ];
}

/** Set `state` to the named scene and return the screen to draw. */
export function stageShot(name, state) {
  if (name === 'play') {
    stageMidGame(state);
    return SCREEN_PLAY;
  }
  if (name === 'win') {
    stageMidGame(state);
    state.foe.hp = 0;
    state.screen = SCREEN_WIN;
    state.winner = 'player';
    state.log = ['The Cinder Witch is extinguished. You win!'];
    return SCREEN_WIN;
  }
  if (name === 'loss') {
    stageMidGame(state);
    state.player.hp = 0;
    state.screen = SCREEN_LOSS;
    state.winner = 'foe';
    state.log = ['Your sigil fades. The witch wins.'];
    return SCREEN_LOSS;
  }
  state.screen = SCREEN_TITLE;
  return SCREEN_TITLE;
}
