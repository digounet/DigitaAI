// Música de fundo usando HTMLAudioElement (arquivo MP3 real).
// Espera um arquivo em `public/music/background.mp3`. Se não existir,
// falha silenciosamente — o app continua funcionando normalmente.

let audio: HTMLAudioElement | null = null;
let enabled = false;
let ready = false;
let failed = false;

const MUSIC_URL = `${import.meta.env.BASE_URL}music/background.mp3`;

function ensureAudio() {
  if (audio || failed) return;
  const a = new Audio(MUSIC_URL);
  a.loop = true;
  a.volume = 0.22;
  a.preload = 'auto';
  a.addEventListener('canplaythrough', () => {
    ready = true;
    if (enabled) a.play().catch(() => void 0);
  });
  a.addEventListener('error', () => {
    failed = true;
    audio = null;
    console.info('[music] arquivo não encontrado em', MUSIC_URL);
  });
  audio = a;
}

/** Ativa/desativa música. Faz play() dentro do mesmo gesto pra passar no iOS. */
export function setMusicEnabled(on: boolean) {
  enabled = on;
  ensureAudio();
  if (!audio) return;
  if (on) {
    audio.play().catch((err) => {
      // Se bloqueou por falta de gesto, reagenda no próximo gesto.
      if (err && err.name === 'NotAllowedError') {
        const retry = () => {
          audio?.play().catch(() => void 0);
          window.removeEventListener('touchstart', retry);
          window.removeEventListener('pointerdown', retry);
          window.removeEventListener('keydown', retry);
        };
        window.addEventListener('touchstart', retry, { once: true, passive: true });
        window.addEventListener('pointerdown', retry, { once: true });
        window.addEventListener('keydown', retry, { once: true });
      }
    });
  } else {
    audio.pause();
  }
}

/** Quando o som geral está mudo, pausa a música também (mas mantém o estado `enabled`). */
export function setMusicSuppressed(suppress: boolean) {
  if (!audio) return;
  if (suppress) audio.pause();
  else if (enabled) audio.play().catch(() => void 0);
}

export function setMusicVolume(v: number) {
  if (audio) audio.volume = Math.max(0, Math.min(1, v));
}

export function isMusicReady() {
  return ready;
}

export function isMusicFailed() {
  return failed;
}
