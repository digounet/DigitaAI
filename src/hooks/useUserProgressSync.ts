import { useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore';

/**
 * Sincroniza o progresso local com Firestore (`users/{uid}`):
 *  - Ao login (mudança de UID), baixa o doc e faz merge (pega o melhor score por nível).
 *  - Ao alterar progresso local, faz upsert com debounce.
 *
 * Firebase SDK é importado dinamicamente pra não entrar no bundle inicial.
 */
export function useUserProgressSync() {
  const playerName = useGame((s) => s.playerName);
  const scores = useGame((s) => s.scores);
  const diagnosticDone = useGame((s) => s.diagnosticDone);
  const recommendedLevelId = useGame((s) => s.recommendedLevelId);

  const saveTimerRef = useRef<number | null>(null);
  const mergedForUidRef = useRef<string | null>(null);

  // Observa auth: quando o UID muda (login/logout), baixa doc e mescla.
  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      const { auth } = await import('../firebase');
      const { loadUserProgress } = await import('../services/userProgress');
      if (cancelled) return;
      unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) return;
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

  // Salva mudanças locais no Firestore (debounce 1500ms).
  useEffect(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      const { saveUserProgress } = await import('../services/userProgress');
      await saveUserProgress({ playerName, scores, diagnosticDone, recommendedLevelId });
    }, 1500);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [playerName, scores, diagnosticDone, recommendedLevelId]);
}
