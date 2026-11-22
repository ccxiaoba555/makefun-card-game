// Keyboard and pointer input. One-shot presses (start, end turn, restart,
// play a hand card) are queued as actions and taken once by the loop, so a
// press between two frames is never lost and never counted twice.
export const ACTION_CONFIRM = 1;
export const ACTION_END_TURN = 2;
export const ACTION_RESTART = 4;

export function createInput() {
  let actions = 0;
  let playIndex = -1;

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space' || event.code === 'Enter') actions |= ACTION_CONFIRM;
    else if (event.code === 'KeyE') actions |= ACTION_END_TURN;
    else if (event.code === 'KeyR') actions |= ACTION_RESTART;
    else if (event.code.startsWith('Digit')) {
      const n = Number.parseInt(event.code.slice(5), 10);
      if (n >= 1 && n <= 7) playIndex = n - 1;
    } else return;
    event.preventDefault();
  });

  return {
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takePlayIndex() {
      const taken = playIndex;
      playIndex = -1;
      return taken;
    },
  };
}
