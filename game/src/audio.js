// Tiny synthesized sounds: no audio files, just the Web Audio oscillator.
// Everything is guarded, so a browser with sound off still plays fine.
let context = null;

function ac() {
  if (context === null) {
    try {
      const Ctor = window.AudioContext ?? window.webkitAudioContext;
      if (!Ctor) return null;
      context = new Ctor();
    } catch {
      return null;
    }
  }
  if (context.state === 'suspended') context.resume().catch(() => {});
  return context;
}

function tone(freq, at, dur, type = 'sine', gain = 0.08) {
  const ctx = ac();
  if (ctx === null) return;
  try {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, ctx.currentTime + at);
    amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + dur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(ctx.currentTime + at);
    osc.stop(ctx.currentTime + at + dur);
  } catch {
    // Sound is decoration; never let it break the game.
  }
}

export const sfx = {
  click() { tone(660, 0, 0.08, 'triangle'); },
  play() { tone(392, 0, 0.12, 'triangle'); tone(523, 0.08, 0.14, 'triangle'); },
  hurt() { tone(180, 0, 0.2, 'sawtooth', 0.05); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.22, 'triangle')); },
  loss() { [330, 262, 196].forEach((f, i) => tone(f, i * 0.16, 0.28, 'sine')); },
};
