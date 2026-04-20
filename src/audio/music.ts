// Música de fundo em modo playlist — toca arquivos aleatoriamente.
//
// Como adicionar músicas:
//   1. Coloque arquivos .mp3/.ogg/.m4a em `src/assets/music/`
//   2. Rebuild (ou o Vite dev reload já pega automaticamente).
//   Os arquivos são descobertos em tempo de build pelo import.meta.glob.
//
// Fallback: se a pasta estiver vazia, tenta `public/music/background.mp3`
// (comportamento antigo). Se nada for encontrado, o app roda sem música.

// Vite resolve esse glob no build: retorna objeto { path: url }.
const globbed = import.meta.glob('../assets/music/*.{mp3,ogg,m4a,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const PLAYLIST: string[] = Object.values(globbed);

const LEGACY_FALLBACK = `${import.meta.env.BASE_URL}music/background.mp3`;

/** Embaralha uma cópia (Fisher-Yates). */
function shuffled<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let audio: HTMLAudioElement | null = null;
let enabled = false;
/** Fila atual (embaralhada). Ao esvaziar, re-embaralhamos. */
let queue: string[] = [];
/** URLs que já deram erro — pulamos em tentativas futuras. */
const failedUrls = new Set<string>();
/** Sentinela: se detectamos queue vazia após filtrar falhas, paramos de tentar. */
let playlistExhausted = false;

function buildQueue(): string[] {
  const pool = PLAYLIST.length > 0 ? PLAYLIST : [LEGACY_FALLBACK];
  const usable = pool.filter((u) => !failedUrls.has(u));
  if (usable.length === 0) {
    playlistExhausted = true;
    return [];
  }
  return shuffled(usable);
}

function nextUrl(): string | null {
  if (queue.length === 0) queue = buildQueue();
  return queue.shift() ?? null;
}

function fadeIn(a: HTMLAudioElement, target = 0.22, durationMs = 400) {
  a.volume = 0;
  const start = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - start) / durationMs);
    a.volume = target * k;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function fadeOutAndPause(a: HTMLAudioElement, durationMs = 300) {
  const startV = a.volume;
  const start = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - start) / durationMs);
    a.volume = startV * (1 - k);
    if (k < 1) requestAnimationFrame(step);
    else a.pause();
  };
  requestAnimationFrame(step);
}

function playWithGestureRetry(a: HTMLAudioElement) {
  a.play().catch((err) => {
    if (err && err.name === 'NotAllowedError') {
      const retry = () => {
        a.play().catch(() => void 0);
        window.removeEventListener('touchstart', retry);
        window.removeEventListener('pointerdown', retry);
        window.removeEventListener('keydown', retry);
      };
      window.addEventListener('touchstart', retry, { once: true, passive: true });
      window.addEventListener('pointerdown', retry, { once: true });
      window.addEventListener('keydown', retry, { once: true });
    }
  });
}

/** Carrega e toca a próxima faixa da fila. Se der erro, pula pra próxima. */
function playNext() {
  if (playlistExhausted) return;
  const url = nextUrl();
  if (!url) return;

  const next = new Audio(url);
  next.preload = 'auto';
  // Loop só se a playlist tiver 1 arquivo — senão, ao acabar, avança.
  const willLoop = (PLAYLIST.length > 0 ? PLAYLIST.length : 1) === 1;
  next.loop = willLoop;

  const onError = () => {
    failedUrls.add(url);
    console.info('[music] falha ao carregar', url);
    // Tenta a próxima
    if (enabled) playNext();
  };
  next.addEventListener('error', onError, { once: true });

  next.addEventListener(
    'canplaythrough',
    () => {
      const old = audio;
      audio = next;
      if (enabled) {
        playWithGestureRetry(next);
        fadeIn(next);
      }
      if (old) fadeOutAndPause(old);
    },
    { once: true }
  );

  if (!willLoop) {
    next.addEventListener('ended', () => {
      if (audio === next && enabled) playNext();
    });
  }
}

export function setMusicEnabled(on: boolean) {
  enabled = on;
  if (on) {
    if (audio) playWithGestureRetry(audio);
    else playNext();
  } else {
    audio?.pause();
  }
}

/** Quando o som geral está mudo, pausa a música (mantém `enabled`). */
export function setMusicSuppressed(suppress: boolean) {
  if (!audio) return;
  if (suppress) audio.pause();
  else if (enabled) playWithGestureRetry(audio);
}

export function setMusicVolume(v: number) {
  if (audio) audio.volume = Math.max(0, Math.min(1, v));
}

/** Avança pra próxima faixa agora (útil pra botão "skip" no futuro). */
export function skipTrack() {
  if (!enabled) return;
  playNext();
}
