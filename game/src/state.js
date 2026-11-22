// The duel's rules and state, with no drawing and no browser in it: two
// duelists with life, shield and mana, hands drawn from a shuffled deck, and
// the turns that play cards until one life total reaches zero.
import { GAME } from './config.js';
import { buildDeck, cardById } from './deck.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSS = 'loss';

function makeDuelist(deck) {
  return { hp: GAME.maxHp, shield: 0, mana: GAME.startMana, maxMana: GAME.startMana, deck, hand: [], discard: [] };
}

export function createGame(random) {
  const state = {
    screen: SCREEN_TITLE,
    turn: 1,
    playerTurn: true,
    player: makeDuelist(buildDeck(random)),
    foe: makeDuelist(buildDeck(random)),
    playerPlayed: [],
    foePlayed: [],
    log: ['The sigils are lit. The duel begins.'],
    damageDealt: 0,
    cardsPlayed: 0,
    winner: null,
  };
  drawCards(state.player, GAME.handSize);
  drawCards(state.foe, GAME.handSize);
  return state;
}

export function drawCards(duelist, count) {
  for (let i = 0; i < count; i += 1) {
    if (duelist.hand.length >= GAME.maxHand) return;
    if (duelist.deck.length === 0) {
      duelist.deck = [...duelist.discard];
      duelist.discard = [];
      if (duelist.deck.length === 0) return;
    }
    duelist.hand.push(duelist.deck.pop());
  }
}

function log(state, line) {
  state.log.push(line);
  if (state.log.length > 3) state.log.shift();
}

/** Shield absorbs damage first; the rest hits life. */
function dealDamage(target, amount) {
  const absorbed = Math.min(target.shield, amount);
  target.shield -= absorbed;
  target.hp = Math.max(0, target.hp - (amount - absorbed));
  return amount - absorbed;
}

function heal(duelist, amount) {
  duelist.hp = Math.min(GAME.maxHp, duelist.hp + amount);
}

/**
 * Play the card at `handIndex` from `side` against the other side.
 * Returns false when the card cannot be played (not enough mana).
 */
export function playCard(state, side, handIndex) {
  const me = state[side];
  const other = state[side === 'player' ? 'foe' : 'player'];
  const cardId = me.hand[handIndex];
  if (cardId === undefined) return false;
  const card = cardById(cardId);
  if (card === null || me.mana < card.cost) return false;
  me.mana -= card.cost;
  me.hand.splice(handIndex, 1);
  me.discard.push(cardId);
  const dealt = card.atk > 0 ? dealDamage(other, card.atk) : 0;
  if (card.def > 0) me.shield += card.def;
  if (card.heal > 0) heal(me, card.heal);
  if (side === 'player') state.damageDealt += dealt;
  state.cardsPlayed += 1;
  const played = state[side === 'player' ? 'playerPlayed' : 'foePlayed'];
  played.push(cardId);
  if (played.length > 3) played.shift();
  const who = side === 'player' ? 'You play' : 'Cinder Witch plays';
  const bits = [];
  if (card.atk > 0) bits.push(`${dealt} damage`);
  if (card.def > 0) bits.push(`+${card.def} shield`);
  if (card.heal > 0) bits.push(`+${card.heal} life`);
  log(state, `${who} ${card.name} — ${bits.join(', ')}.`);
  checkEnd(state);
  return true;
}

/** The witch plays her best affordable cards, then the turn passes back. */
export function aiTakeTurn(state) {
  let plays = 0;
  while (plays < GAME.aiPlaysPerTurn) {
    let best = -1;
    let bestScore = -1;
    for (let i = 0; i < state.foe.hand.length; i += 1) {
      const card = cardById(state.foe.hand[i]);
      if (card === null || card.cost > state.foe.mana) continue;
      const score = card.atk * 2 + card.def + card.heal - card.cost;
      if (score > bestScore) { bestScore = score; best = i; }
    }
    if (best < 0) break;
    playCard(state, 'foe', best);
    plays += 1;
    if (state.screen !== SCREEN_PLAY) return;
  }
  endTurn(state);
}

/** End the foe's turn: new round, mana refills, both sides draw. */
export function endTurn(state) {
  state.turn += 1;
  state.player.maxMana = Math.min(GAME.maxMana, GAME.startMana + state.turn - 1);
  state.player.mana = state.player.maxMana;
  state.foe.maxMana = Math.min(GAME.maxMana, GAME.startMana + state.turn - 1);
  state.foe.mana = state.foe.maxMana;
  drawCards(state.player, 2);
  drawCards(state.foe, 2);
  state.playerTurn = true;
  log(state, `Round ${state.turn} — your turn. Mana refilled to ${state.player.mana}.`);
}

export function startDuel(state) {
  state.screen = SCREEN_PLAY;
  state.playerTurn = true;
  log(state, 'Your turn — play a card, then End Turn.');
}

export function checkEnd(state) {
  if (state.foe.hp <= 0) {
    state.screen = SCREEN_WIN;
    state.winner = 'player';
    log(state, 'The Cinder Witch is extinguished. You win!');
  } else if (state.player.hp <= 0) {
    state.screen = SCREEN_LOSS;
    state.winner = 'foe';
    log(state, 'Your sigil fades. The witch wins.');
  }
}

export function score(state) {
  return state.damageDealt * 10 + state.cardsPlayed * 5 + Math.max(0, state.player.hp) * 2;
}
