// Sons sintéticos gerados via Web Audio API — sem assets externos.
// Cada função cria oscillators/noise curtos com envelope para sons responsivos.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

let unlocked = false;

/**
 * Desbloqueia o AudioContext no iOS/Safari.
 * Deve ser chamado dentro do callback de um gesto do usuário
 * (touchstart/pointerdown/keydown). Além de resumir o contexto,
 * toca um buffer silencioso — o iOS só "acredita" que o som está
 * liberado depois que um nó de áudio real é iniciado.
 */
export function unlockAudio() {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') {
    void c.resume();
  }
  if (unlocked) return;
  try {
    const buffer = c.createBuffer(1, 1, 22050);
    const source = c.createBufferSource();
    source.buffer = buffer;
    source.connect(c.destination);
    source.start(0);
    unlocked = true;
  } catch {
    /* ignore */
  }
}

export function setMuted(v: boolean) {
  muted = v;
  if (masterGain) masterGain.gain.value = v ? 0 : 0.5;
}

export function isMuted() {
  return muted;
}

function env(gain: GainNode, peak: number, attack: number, release: number, start: number) {
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + release);
}

function noiseBuffer(c: AudioContext, duration = 0.4): AudioBuffer {
  const len = Math.floor(c.sampleRate * duration);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** Clique suave de tecla (acerto parcial). */
export function playKey() {
  const c = getCtx();
  if (!c || !masterGain || muted) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(720 + Math.random() * 120, now);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.05);
  env(g, 0.12, 0.002, 0.07, now);
  osc.connect(g).connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.1);
}

/** Balão estourando: burst de ruído filtrado + pitch curtinho. */
export function playPop() {
  const c = getCtx();
  if (!c || !masterGain || muted) return;
  const now = c.currentTime;
  // burst
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.15);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1400;
  bp.Q.value = 1.5;
  const gn = c.createGain();
  env(gn, 0.45, 0.003, 0.1, now);
  src.connect(bp).connect(gn).connect(masterGain);
  src.start(now);
  src.stop(now + 0.2);
  // little squeak
  const osc = c.createOscillator();
  const og = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
  env(og, 0.25, 0.002, 0.12, now);
  osc.connect(og).connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.15);
}

/** Erro — tom baixo curto. */
export function playError() {
  const c = getCtx();
  if (!c || !masterGain || muted) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
  env(g, 0.18, 0.002, 0.2, now);
  osc.connect(g).connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.22);
}

/** Palavra concluída — arpeggio curtinho. */
export function playWordDone() {
  const c = getCtx();
  if (!c || !masterGain || muted) return;
  const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
  const now = c.currentTime;
  notes.forEach((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = f;
    const t = now + i * 0.07;
    env(g, 0.22, 0.003, 0.12, t);
    osc.connect(g).connect(masterGain!);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

/** Nível concluído — fanfarra alegre. */
export function playLevelUp() {
  const c = getCtx();
  if (!c || !masterGain || muted) return;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  const now = c.currentTime;
  notes.forEach((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = f;
    const t = now + i * 0.09;
    env(g, 0.28, 0.003, 0.18, t);
    osc.connect(g).connect(masterGain!);
    osc.start(t);
    osc.stop(t + 0.3);
  });
  // brilho
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1760, now + 0.4);
  osc.frequency.exponentialRampToValueAtTime(2637, now + 0.7);
  env(g, 0.18, 0.02, 0.5, now + 0.4);
  osc.connect(g).connect(masterGain);
  osc.start(now + 0.4);
  osc.stop(now + 1);
}

/** Estrela ganha. */
export function playStar() {
  const c = getCtx();
  if (!c || !masterGain || muted) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
  env(g, 0.25, 0.005, 0.25, now);
  osc.connect(g).connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.3);
}
