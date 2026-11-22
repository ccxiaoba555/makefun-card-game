// The deck: 24 original cards in four elements. A card deals its attack as
// damage, gains its shield as armour and restores its heal as life, all at
// once when played. Cost is paid in mana crystals.
export const CARDS = [
  { id: 'ember-imp', name: 'Cinder Imp', el: 'ember', cost: 1, atk: 2, def: 0, heal: 0, text: 'Deal 2 damage.' },
  { id: 'ember-sprite', name: 'Spark Sprite', el: 'ember', cost: 1, atk: 2, def: 0, heal: 0, text: 'Deal 2 damage.' },
  { id: 'ember-lash', name: 'Flame Lash', el: 'ember', cost: 3, atk: 5, def: 0, heal: 0, text: 'Deal 5 damage.' },
  { id: 'ember-wildfire', name: 'Wildfire', el: 'ember', cost: 3, atk: 6, def: 0, heal: 0, text: 'Deal 6 damage.' },
  { id: 'ember-drake', name: 'Pyre Drake', el: 'ember', cost: 4, atk: 7, def: 0, heal: 0, text: 'Deal 7 damage.' },
  { id: 'ember-phoenix', name: 'Ash Phoenix', el: 'ember', cost: 4, atk: 6, def: 0, heal: 2, text: 'Deal 6 damage. Heal 2.' },
  { id: 'leaf-seedling', name: 'Seedling', el: 'leaf', cost: 1, atk: 1, def: 0, heal: 2, text: 'Deal 1 damage. Heal 2.' },
  { id: 'leaf-vine', name: 'Thorn Vine', el: 'leaf', cost: 2, atk: 3, def: 2, heal: 0, text: 'Deal 3 damage. Gain 2 shield.' },
  { id: 'leaf-snare', name: 'Vine Snare', el: 'leaf', cost: 2, atk: 4, def: 0, heal: 0, text: 'Deal 4 damage.' },
  { id: 'leaf-wolf', name: 'Briar Wolf', el: 'leaf', cost: 3, atk: 4, def: 1, heal: 0, text: 'Deal 4 damage. Gain 1 shield.' },
  { id: 'leaf-warden', name: 'Grove Warden', el: 'leaf', cost: 3, atk: 3, def: 4, heal: 0, text: 'Deal 3 damage. Gain 4 shield.' },
  { id: 'leaf-queen', name: 'Thorn Queen', el: 'leaf', cost: 4, atk: 6, def: 1, heal: 0, text: 'Deal 6 damage. Gain 1 shield.' },
  { id: 'tide-eel', name: 'Mist Eel', el: 'tide', cost: 2, atk: 3, def: 0, heal: 0, text: 'Deal 3 damage.' },
  { id: 'tide-bubble', name: 'Bubble Shield', el: 'tide', cost: 2, atk: 0, def: 5, heal: 0, text: 'Gain 5 shield.' },
  { id: 'tide-spring', name: 'Healing Spring', el: 'tide', cost: 2, atk: 0, def: 0, heal: 5, text: 'Heal 5 life.' },
  { id: 'tide-caller', name: 'Wavecaller', el: 'tide', cost: 3, atk: 5, def: 0, heal: 0, text: 'Deal 5 damage.' },
  { id: 'tide-riptide', name: 'Riptide', el: 'tide', cost: 3, atk: 5, def: 0, heal: 1, text: 'Deal 5 damage. Heal 1.' },
  { id: 'tide-kraken', name: 'Deep Kraken', el: 'tide', cost: 4, atk: 7, def: 1, heal: 0, text: 'Deal 7 damage. Gain 1 shield.' },
  { id: 'stone-fox', name: 'Flint Fox', el: 'stone', cost: 1, atk: 2, def: 0, heal: 0, text: 'Deal 2 damage.' },
  { id: 'stone-golem', name: 'Pebble Golem', el: 'stone', cost: 2, atk: 2, def: 3, heal: 0, text: 'Deal 2 damage. Gain 3 shield.' },
  { id: 'stone-guard', name: 'Granite Guard', el: 'stone', cost: 3, atk: 2, def: 5, heal: 0, text: 'Deal 2 damage. Gain 5 shield.' },
  { id: 'stone-fist', name: 'Quake Fist', el: 'stone', cost: 3, atk: 5, def: 0, heal: 0, text: 'Deal 5 damage.' },
  { id: 'stone-sage', name: 'Crystal Sage', el: 'stone', cost: 3, atk: 4, def: 0, heal: 3, text: 'Deal 4 damage. Heal 3.' },
  { id: 'stone-titan', name: 'Mountain Titan', el: 'stone', cost: 4, atk: 6, def: 2, heal: 0, text: 'Deal 6 damage. Gain 2 shield.' },
];

export function cardById(id) {
  return CARDS.find((card) => card.id === id) ?? null;
}

/** A fresh shuffled deck (two copies of every card) from the seeded random. */
export function buildDeck(random) {
  const deck = [];
  for (const card of CARDS) deck.push(card.id, card.id);
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
