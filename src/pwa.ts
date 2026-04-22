import { registerSW } from 'virtual:pwa-register';

/**
 * Registra o Service Worker e expõe eventos via CustomEvent no window:
 *  - 'pwa:update-available' — há versão nova; UI pode perguntar "atualizar?"
 *  - 'pwa:offline-ready' — instalação concluída, app pronto para uso offline
 *  - 'pwa:installable' — o browser disparou beforeinstallprompt; podemos
 *    mostrar um botão "Instalar app" (ver useInstallPrompt abaixo).
 *
 * A UI (ver `UpdatePrompt.tsx`) escuta esses eventos e chama `reloadForUpdate`
 * quando o usuário confirma. Não forçamos reload automático porque a criança
 * pode estar no meio de uma lição.
 */
let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;

// BeforeInstallPromptEvent não tem tipo oficial no lib.dom.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

export function registerPWA(): void {
  if (import.meta.env.DEV) return;
  updateSW = registerSW({
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent('pwa:update-available'));
    },
    onOfflineReady() {
      window.dispatchEvent(new CustomEvent('pwa:offline-ready'));
    },
  });
  schedulePrefetchFirstMusic();
  listenForInstallPrompt();
}

export async function reloadForUpdate(): Promise<void> {
  await updateSW?.(true);
}

/**
 * Pré-cacheia a 1ª faixa de música no próximo momento ocioso do browser.
 * Passa pelo SW (estratégia CacheFirst em `/music/*.mp3`), então popula o
 * cache `digitai-music`. Assim, quem instalar o app e abrir offline já
 * tem música disponível no primeiro uso, sem ter ouvido nada antes.
 *
 * Só tenta uma vez. Falhas são silenciosas (offline, 404, etc.).
 */
function schedulePrefetchFirstMusic(): void {
  if (typeof navigator === 'undefined' || !navigator.onLine) return;
  const url = `${import.meta.env.BASE_URL}music/music1.mp3`;
  const run = () => {
    fetch(url, { credentials: 'omit' }).catch(() => undefined);
  };
  const ric = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
  }).requestIdleCallback;
  if (typeof ric === 'function') {
    ric(run, { timeout: 5000 });
  } else {
    setTimeout(run, 2500);
  }
}

/**
 * Escuta o evento `beforeinstallprompt` do Chrome/Edge. Guarda a referência
 * pra disparar mais tarde sob gesto do usuário. Quando o app já foi
 * instalado (`appinstalled`), limpa a referência.
 */
function listenForInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa:installable'));
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa:installed'));
  });
}

/** Retorna true se há prompt nativo pendente (Chrome/Edge Android/Desktop). */
export function canInstall(): boolean {
  return deferredInstallPrompt !== null;
}

/**
 * Dispara o prompt nativo de instalação. Precisa ser chamado a partir de
 * um gesto do usuário (click/tap). Retorna se foi aceito.
 * Consumido uma vez: após `prompt()`, o browser descarta o evento.
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const ev = deferredInstallPrompt;
  if (!ev) return 'unavailable';
  deferredInstallPrompt = null;
  try {
    await ev.prompt();
    const choice = await ev.userChoice;
    return choice.outcome;
  } catch {
    return 'dismissed';
  }
}

/**
 * Detecta se o app já está rodando como PWA (standalone). Usado para
 * esconder o botão de instalação quando ele não faz mais sentido.
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // iOS Safari expõe `standalone` no navigator
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
  return iosStandalone === true;
}
