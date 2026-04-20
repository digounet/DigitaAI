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
  const allProgress = useGame((s) => s.allProgress);

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
        useGame.getState().applyRemoteProgress(remote);
        if (remote.playerName && !useGame.getState().playerName) {
          useGame.setState({ playerName: remote.playerName });
        }
      });
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  // Só salva se estiver logado de verdade. Grava allProgress + espelho dos
  // campos legados (slot normal) pra docs lidos por versões antigas do app.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      const { saveUserProgress } = await import('../services/userProgress');
      const normalSlot = allProgress.normal;
      await saveUserProgress({
        playerName,
        allProgress,
        scores: normalSlot.scores,
        diagnosticDone: normalSlot.diagnosticDone,
        recommendedLevelId: normalSlot.recommendedLevelId,
      });
    }, 1500);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [playerName, allProgress, isAuthenticated]);
}
