import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/gameStore';

/**
 * Sincroniza progresso com `users/{uid}` no Firestore.
 *
 * IMPORTANTE: só escreve para usuários logados com conta real (Google).
 * Sessões anônimas ficam 100% locais (Zustand persist → localStorage).
 * Motivo: anônimos criam UIDs únicos por dispositivo/navegador/aba privada
 * — se salvássemos, a coleção users cresceria indefinidamente com docs
 * que nunca mais serão acessados.
 */
export function useUserProgressSync() {
  const playerName = useGame((s) => s.playerName);
  const scores = useGame((s) => s.scores);
  const diagnosticDone = useGame((s) => s.diagnosticDone);
  const recommendedLevelId = useGame((s) => s.recommendedLevelId);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const saveTimerRef = useRef<number | null>(null);
  const mergedForUidRef = useRef<string | null>(null);

  // Observa auth: só depois que o usuário é NÃO-anônimo é que fazemos merge
  // e começamos a sincronizar.
  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      const { auth } = await import('../firebase');
      const { loadUserProgress } = await import('../services/userProgress');
      if (cancelled) return;
      unsub = onAuthStateChanged(auth, async (user) => {
        const loggedIn = !!user && !user.isAnonymous;
        setIsAuthenticated(loggedIn);
        if (!loggedIn || !user) {
          mergedForUidRef.current = null;
          return;
        }
        if (mergedForUidRef.current === user.uid) return;
        mergedForUidRef.current = user.uid;
        const remote = await loadUserProgress();
        if (!remote) return;
        useGame.setState((s) => {
          const merged = { ...s.scores };
          for (const [id, r] of Object.entries(remote.scores ?? {})) {
            const l = merged[id];
            if (!l || r.stars > l.stars) merged[id] = r;
            else if (r.stars === l.stars) {
              merged[id] = {
                stars: l.stars,
                wpm: Math.max(l.wpm, r.wpm),
                accuracy: Math.max(l.accuracy, r.accuracy),
              };
            }
          }
          return {
            scores: merged,
            playerName: s.playerName || remote.playerName || '',
            diagnosticDone: s.diagnosticDone || remote.diagnosticDone || false,
            recommendedLevelId: s.recommendedLevelId ?? remote.recommendedLevelId ?? null,
          };
        });
      });
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  // Só salva se estiver logado de verdade.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      const { saveUserProgress } = await import('../services/userProgress');
      await saveUserProgress({ playerName, scores, diagnosticDone, recommendedLevelId });
    }, 1500);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [playerName, scores, diagnosticDone, recommendedLevelId, isAuthenticated]);
}
