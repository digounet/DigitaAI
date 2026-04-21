import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { useGame } from '../store/gameStore';
import type { LevelScore } from '../store/gameStore';

/**
 * Sincroniza o progresso com Firestore (leaderboard).
 *
 * Só escreve pra quem fez login de verdade (Google). Usuários anônimos
 * mantêm progresso só no localStorage (via Zustand persist) — não queremos
 * poluir a coleção com sessões efêmeras de visitantes que fecham a aba.
 *
 * Regra de ranking: agrega progresso das 3 dificuldades pegando o MELHOR
 * resultado por lição. Assim, quem joga em fácil, normal ou difícil entra
 * no ranking sem ser penalizado, e não é possível farmar estrelinhas
 * jogando a mesma lição em várias dificuldades (pega sempre o max).
 */
export function useLeaderboardSync() {
  const playerName = useGame((s) => s.playerName);
  const allProgress = useGame((s) => s.allProgress);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastSyncedRef = useRef<string>('');

  // Observa estado de auth pra decidir se deve publicar e pegar displayName.
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
        setAuthUser(user);
      });
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const isAuthenticated = !!authUser && !authUser.isAnonymous;

  const { totalStars, bestWpm } = useMemo(() => {
    const levelIds = new Set<string>();
    for (const slot of Object.values(allProgress)) {
      for (const id of Object.keys(slot.scores)) levelIds.add(id);
    }
    let stars = 0;
    let wpm = 0;
    for (const id of levelIds) {
      let maxStars = 0;
      for (const slot of Object.values(allProgress)) {
        const s: LevelScore | undefined = slot.scores[id];
        if (!s) continue;
        if (s.stars > maxStars) maxStars = s.stars;
        if (s.wpm > wpm) wpm = s.wpm;
      }
      stars += maxStars;
    }
    return { totalStars: stars, bestWpm: wpm };
  }, [allProgress]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (totalStars <= 0) return;

    // Se o nome no store estiver vazio, cai no displayName do Google.
    // Isso resolve casos de usuários logados que nunca preencheram o nome
    // e por isso não apareciam no ranking.
    const displayName = (playerName || authUser?.displayName || 'Jogador').trim();

    const signature = `${displayName}|${totalStars}|${bestWpm.toFixed(1)}`;
    if (signature === lastSyncedRef.current) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      const { upsertMyScore } = await import('../services/leaderboard');
      await upsertMyScore({ name: displayName, totalStars, bestWpm });
      lastSyncedRef.current = signature;
    }, 800);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [playerName, authUser, totalStars, bestWpm, isAuthenticated]);
}
