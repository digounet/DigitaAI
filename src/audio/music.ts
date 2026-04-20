// Música de fundo em modo playlist — toca arquivos aleatoriamente.
//
// Como adicionar músicas:
//   Coloque arquivos MP3 em `public/music/` com nomes no padrão:
//     music1.mp3, music2.mp3, music3.mp3, ...
//   O app descobre automaticamente quais existem (HEAD request). Os que não
//   existirem são ignorados. Suporta também `background.mp3` e `track-N.mp3`.
//
// Por que HEAD request antes: o Vite dev server (e SPAs hospedados) respondem
// a arquivos inexistentes com o index.html (status 200, text/html). Se
// alimentássemos isso direto no <audio>, o browser tentaria decodificar HTML
// como MP3 e travaria. Então filtramos pelo Content-Type: audio/*.

const CANDIDATE_NAMES: string[] = [
  'background.mp3',
  ...Array.from({ length: 30 }, (_, i) => `music${i + 1}.mp3`),
  ...Array.from({ length: 10 }, (_, i) => `track-${i + 1}.mp3`),
];

const BASE = `${import.meta.env.BASE_URL}music/`;
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

/** Descoberta lazy: faz HEAD em cada candidato e filtra pelos audio/*. */
let playlistReady: Promise<string[]> | null = null;
let playlist: string[] = [];

function ensurePlaylist(): Promise<string[]> {
  if (!playlistReady) {
    playlistReady = Promise.all(
      CANDIDATE_NAMES.map(async (name) => {
        const url = BASE + name;
        try {
          const r = await fetch(url, { method: 'HEAD' });
          if (!r.ok) return null;
          const ct = r.headers.get('content-type') ?? '';
          if (ct.startsWith('audio/')) return url;
          return null;
        } catch {
          return null;
        }
      })
    ).then((arr) => {
      playlist = arr.filter((x): x is string => !!x);
      if (playlist.length === 0) {
        console.info('[music] nenhum arquivo encontrado em public/music/');
      } else {
        console.info('[music] playlist:', playlist.map((u) => u.replace(BASE, '')).join(', '));
      }
      return playlist;
    });
  }
  return playlistReady;
}

function nextUrl(): string | null {
  if (playlist.length === 0) return null;
  if (queue.length === 0) queue = shuffled(playlist);
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

function playNext() {
  const url = nextUrl();
  if (!url) return;

  const next = new Audio(url);
  next.preload = 'auto';
  next.volume = TARGET_VOLUME;
  next.loop = false;

  let handled = false;
  next.addEventListener('error', () => {
    if (handled) return;
    handled = true;
    console.info('[music] falha ao tocar', url, next.error);
    if (audio === next) audio = null;
    if (enabled) playNext();
  });

  next.addEventListener('ended', () => {
    if (audio === next && enabled) playNext();
  });

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
    if (audio) {
      playWithGestureRetry(audio);
      return;
    }
    ensurePlaylist().then(() => {
      if (enabled && !audio) playNext();
    });
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

// Inicia a descoberta em paralelo assim que o módulo carrega, pra quando
// `setMusicEnabled(true)` for chamado a lista já esteja pronta.
ensurePlaylist();
