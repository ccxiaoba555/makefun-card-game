// Drawing only: the duel's state and the current screen in, DOM out. Every
// screen is built from the same pieces — duelist panels with life and mana,
// the played-card rows, the player's hand and the overlay panels — so a
// screenshot of any screen shows the whole game at a glance.
import { DUELISTS, ELEMENTS, GAME } from './config.js';
import { cardById } from './deck.js';
import { SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, score } from './state.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function manaGems(duelist) {
  const wrap = el('div', 'mana');
  for (let i = 0; i < duelist.maxMana; i += 1) {
    wrap.appendChild(el('span', i < duelist.mana ? 'gem' : 'gem empty'));
  }
  wrap.appendChild(el('span', 'label', `${duelist.mana}/${duelist.maxMana} mana`));
  return wrap;
}

function duelistPanel(side, duelist, handCount) {
  const info = DUELISTS[side];
  const panel = el('div', 'side ' + (side === 'foe' ? 'foe-side' : 'player-side'));
  panel.id = `${side}-area`;
  panel.appendChild(el('div', 'portrait', info.glyph));
  const who = el('div', 'duelist');
  who.appendChild(el('div', 'name', info.name));
  who.appendChild(el('div', 'title', info.title));
  const bar = el('div', 'hpbar');
  const fill = el('div', 'fill');
  fill.style.width = `${Math.round((duelist.hp / GAME.maxHp) * 100)}%`;
  bar.appendChild(fill);
  bar.appendChild(el('div', 'hptext', `HP ${duelist.hp} / ${GAME.maxHp}`));
  who.appendChild(bar);
  panel.appendChild(who);
  if (duelist.shield > 0) panel.appendChild(el('div', 'shield-badge', `Shield ${duelist.shield}`));
  if (side === 'foe') {
    const hand = el('div', 'foe-hand');
    for (let i = 0; i < handCount; i += 1) hand.appendChild(el('div', 'mini-card'));
    panel.appendChild(hand);
  } else {
    const pile = el('div', 'deck-pile');
    pile.appendChild(el('div', 'pile'));
    pile.appendChild(el('div', null, `${duelist.deck.length} cards in deck`));
    panel.appendChild(pile);
  }
  panel.appendChild(manaGems(duelist));
  return panel;
}

function cardNode(card, opts = {}) {
  const node = el('div', `card el-${card.el}${opts.played ? ' played' : ''}${opts.unaffordable ? ' unaffordable' : ''}`);
  node.appendChild(el('div', 'cost', String(card.cost)));
  node.appendChild(el('div', 'el', ELEMENTS[card.el].label));
  const art = el('div', 'art', ELEMENTS[card.el].glyph);
  art.setAttribute('aria-hidden', 'true');
  node.appendChild(art);
  node.appendChild(el('div', 'cname', card.name));
  const stats = el('div', 'stats');
  if (card.atk > 0) stats.appendChild(el('span', 'stat atk', `ATK ${card.atk}`));
  if (card.def > 0) stats.appendChild(el('span', 'stat def', `SHD ${card.def}`));
  if (card.heal > 0) stats.appendChild(el('span', 'stat heal', `HEAL ${card.heal}`));
  if (stats.childElementCount === 0) stats.appendChild(el('span', 'stat def', '—'));
  node.appendChild(stats);
  node.appendChild(el('div', 'ctext', card.text));
  if (opts.keyHint) node.appendChild(el('div', 'key-hint', opts.keyHint));
  return node;
}

function playedRow(ids, label) {
  const row = el('div', 'played-row');
  row.appendChild(el('div', 'slot-label', label));
  for (const id of ids) {
    const card = cardById(id);
    if (card !== null) row.appendChild(cardNode(card, { played: true }));
  }
  if (ids.length === 0) row.appendChild(el('div', 'slot-label', ''));
  return row;
}

function overlayPanel(state) {
  const overlay = document.getElementById('overlay');
  overlay.className = '';
  overlay.replaceChildren();
  if (state.screen === SCREEN_TITLE) {
    overlay.classList.add('show');
    const panel = el('div', 'panel');
    panel.appendChild(el('h1', null, 'EMBER SIGIL DUEL'));
    panel.appendChild(el('div', 'sub', 'A turn-based card duel of fire, leaf, tide and stone.'));
    const rules = el('div', 'rules');
    rules.innerHTML =
      '<b>How to play:</b> click a card (or press 1–5) to play it — it costs mana, ' +
      'deals its ATK as damage, gains its SHD as shield and heals its HEAL. ' +
      'Press <b>E</b> or End Turn and the Cinder Witch answers. ' +
      'Mana refills and grows each round. Reduce the witch to <b>0 HP</b> to win — ' +
      'if your own life reaches 0, the duel is lost.';
    panel.appendChild(rules);
    panel.appendChild(el('div', 'prompt', 'Click or press Space to begin'));
    overlay.appendChild(panel);
    return;
  }
  if (state.screen === SCREEN_WIN || state.screen === SCREEN_LOSS) {
    overlay.classList.add('show');
    const win = state.screen === SCREEN_WIN;
    const panel = el('div', 'panel');
    panel.appendChild(el('h1', win ? null : 'lose', win ? 'VICTORY' : 'DEFEAT'));
    panel.appendChild(el('div', 'sub', win
      ? 'The Cinder Witch is extinguished. The sigil is yours.'
      : 'Your sigil fades to ash. The witch keeps the table.'));
    const stats = el('div', 'stats');
    stats.innerHTML =
      `Rounds played: <b>${state.turn}</b><br>` +
      `Cards played: <b>${state.cardsPlayed}</b><br>` +
      `Damage dealt: <b>${state.damageDealt}</b><br>` +
      `Final score: <b>${score(state)}</b>`;
    panel.appendChild(stats);
    panel.appendChild(el('div', 'prompt', 'Press R or click Restart to duel again'));
    overlay.appendChild(panel);
  }
}

/** Repaint the whole table from the state. `onPlayCard` fires on card clicks. */
export function render(state, onPlayCard) {
  const foeArea = document.getElementById('foe-area');
  const playerArea = document.getElementById('player-area');
  foeArea.replaceWith(duelistPanel('foe', state.foe, state.foe.hand.length));
  playerArea.replaceWith(duelistPanel('player', state.player, 0));

  const mid = document.getElementById('mid-area');
  mid.replaceChildren(
    playedRow(state.foePlayed, 'Witch played'),
    (() => {
      const info = el('div');
      info.id = 'mid-info';
      info.appendChild(el('div', null, ''));
      info.firstChild.id = 'turn-banner';
      info.firstChild.textContent = state.screen === SCREEN_PLAY
        ? (state.playerTurn ? `Round ${state.turn} — Your turn` : `Round ${state.turn} — Witch's turn…`)
        : `Round ${state.turn}`;
      const logEl = el('div', null, state.log[state.log.length - 1] ?? '');
      logEl.id = 'log';
      info.appendChild(logEl);
      return info;
    })(),
    playedRow(state.playerPlayed, 'You played'),
  );

  const hand = document.getElementById('hand');
  hand.replaceChildren();
  state.player.hand.forEach((cardId, index) => {
    const card = cardById(cardId);
    if (card === null) return;
    const node = cardNode(card, {
      unaffordable: state.screen !== SCREEN_PLAY || !state.playerTurn || card.cost > state.player.mana,
      keyHint: String(index + 1),
    });
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.addEventListener('click', () => onPlayCard(index));
    hand.appendChild(node);
  });

  const endBtn = document.getElementById('end-turn');
  endBtn.disabled = state.screen !== SCREEN_PLAY || !state.playerTurn;
  overlayPanel(state);
}
