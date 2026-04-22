import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reloadForUpdate } from '../pwa';

/**
 * Toasts leves no canto inferior:
 *  - "Pronto pra usar offline" (aparece uma vez, some em 3s)
 *  - "Nova versão disponível — atualizar agora?" (persistente até ação)
 *  - "Você está offline" (enquanto navigator.onLine === false)
 */
export function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    const onUpdate = () => setUpdateAvailable(true);
    const onReady = () => {
      setOfflineReady(true);
      setTimeout(() => setOfflineReady(false), 3000);
    };
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('pwa:update-available', onUpdate);
    window.addEventListener('pwa:offline-ready', onReady);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('pwa:update-available', onUpdate);
      window.removeEventListener('pwa:offline-ready', onReady);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {offline && (
          <motion.div
            key="offline"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-gray-900/90 text-white text-sm px-4 py-2 rounded-full shadow-bubbly flex items-center gap-2 pointer-events-auto"
          >
            <span>📡</span>
            <span>Você está offline — o jogo continua funcionando</span>
          </motion.div>
        )}
        {offlineReady && (
          <motion.div
            key="ready"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-grass text-white font-bold text-sm px-4 py-2 rounded-full shadow-bubbly flex items-center gap-2 pointer-events-auto"
          >
            <span>✅</span>
            <span>Pronto para usar offline</span>
          </motion.div>
        )}
        {updateAvailable && (
          <motion.div
            key="update"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-white rounded-2xl shadow-bubbly p-3 pr-2 flex items-center gap-3 pointer-events-auto"
          >
            <span className="text-2xl">✨</span>
            <div className="text-sm text-gray-800">
              <div className="font-bold">Nova versão disponível</div>
              <div className="text-xs text-gray-500">Atualizar agora?</div>
            </div>
            <button
              onClick={() => reloadForUpdate()}
              className="bg-grape text-white font-bold text-sm px-3 py-2 rounded-full hover:scale-105 active:scale-95 transition"
            >
              Atualizar
            </button>
            <button
              onClick={() => setUpdateAvailable(false)}
              aria-label="Adiar atualização"
              className="text-gray-400 hover:text-gray-600 text-lg px-2"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
