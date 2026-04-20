import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/gameStore';

/**
 * Sincroniza o progresso com Firestore (leaderboard).
 *
 * Só escreve pra quem fez login de verdade (Google). Usuários anônimos
 * mantêm progresso só no localStorage (via Zustand persist) — não queremos
 * poluir a coleção com sessões efêmeras de visitantes que fecham a aba.
 */
export function useLeaderboardSync() {
  const playerName = useGame((s) => s.playerName);
  // Leaderboard usa só o slot `normal` pra evitar que jogar em fácil infle a
  // pontuação (easy dá estrelinha mais fácil). Ranking segue a progressão base.
  const scores = useGame((s) => s.allProgress.normal.scores);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const timerRef = useRef<number | null>(null);
  const lastSyncedRef = useRef<string>('');

  // Observa estado de auth pra decidir se deve publicar.
  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      const [{ onAuthStateChanged }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('../firebase'),
      ]);
      if (cancelled) return;
      unsub = onAuthStateChanged(auth, (user) => {
        setIsAuthenticated(!!user && !user.isAnonymous);
      });
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const totalStars = Object.values(scores).reduce((a, b) => a + b.stars, 0);
    const bestWpm = Object.values(scores).reduce((a, b) => Math.max(a, b.wpm || 0), 0);
    if (!playerName || totalStars <= 0) return;

    const signature = `${playerName}|${totalStars}|${bestWpm.toFixed(1)}`;
    if (signature === lastSyncedRef.current) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      const { upsertMyScore } = await import('../services/leaderboard');
      await upsertMyScore({ name: playerName, totalStars, bestWpm });
      lastSyncedRef.current = signature;
    }, 800);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [playerName, scores, isAuthenticated]);
}
