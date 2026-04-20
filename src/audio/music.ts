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
const TARGET_VOLUME = 0.22;

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
let queue: string[] = [];
const failedUrls = new Set<string>();
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

function playWithGestureRetry(a: HTMLAudioElement) {
  a.play().catch((err) => {
    if (err && err.name === 'NotAllowedError') {
      const retry = () => {
        a.play().catch(() => void 0);
        window.removeEventListener('touchstart', retry);
        window.removeEventListener('pointerdown', retry);
        window.removeEventListener('keydown', retry);
        window.removeEventListener('click', retry);
      };
      window.addEventListener('touchstart', retry, { once: true, passive: true });
      window.addEventListener('pointerdown', retry, { once: true });
      window.addEventListener('keydown', retry, { once: true });
      window.addEventListener('click', retry, { once: true });
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
  next.volume = TARGET_VOLUME;
  // Se só tem 1 arquivo disponível, loop infinito. Com múltiplos, avança no `ended`.
  const poolSize = PLAYLIST.length > 0 ? PLAYLIST.length : 1;
  next.loop = poolSize <= 1;

  next.addEventListener(
    'error',
    () => {
      failedUrls.add(url);
      console.info('[music] falha ao carregar', url);
      if (audio === next) audio = null;
      if (enabled) playNext();
    },
    { once: true }
  );

  if (!next.loop) {
    next.addEventListener('ended', () => {
      if (audio === next && enabled) playNext();
    });
  }

  // Pausa faixa anterior e faz swap imediato — o Audio vai aguardar o buffer
  // e começar a tocar sozinho. Não esperamos `canplaythrough` porque em alguns
  // browsers (Safari/iOS) ele não dispara até haver gesto.
  const old = audio;
  audio = next;
  if (old) {
    try { old.pause(); } catch { /* ignora */ }
  }
  if (enabled) playWithGestureRetry(next);
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

export function setMusicSuppressed(suppress: boolean) {
  if (!audio) return;
  if (suppress) audio.pause();
  else if (enabled) playWithGestureRetry(audio);
}

export function setMusicVolume(v: number) {
  if (audio) audio.volume = Math.max(0, Math.min(1, v));
}

export function skipTrack() {
  if (!enabled) return;
  playNext();
}
