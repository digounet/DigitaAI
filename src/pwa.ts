import { registerSW } from 'virtual:pwa-register';

/**
 * Registra o Service Worker e expõe dois eventos via CustomEvent no window:
 *  - 'pwa:update-available' — há versão nova; UI pode perguntar "atualizar?"
 *  - 'pwa:offline-ready' — instalação concluída, app pronto para uso offline
 *
 * A UI (ver `UpdatePrompt.tsx`) escuta esses eventos e chama `reloadForUpdate`
 * quando o usuário confirma. Não forçamos reload automático porque a criança
 * pode estar no meio de uma lição.
 */
let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;

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
}

export async function reloadForUpdate(): Promise<void> {
  await updateSW?.(true);
}
