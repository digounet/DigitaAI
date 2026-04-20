import { useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore';

/**
 * Sincroniza progresso com o Firestore, carregando o SDK do Firebase
 * dinamicamente (não entra no bundle inicial).
 *
 * Dispara upsert quando:
 *  - o nome mudou, ou
 *  - o total de estrelas mudou, ou
 *  - o melhor WPM mudou.
 * Com debounce de 800ms e assinatura pra evitar writes repetidos.
 */
export function useLeaderboardSync() {
  const playerName = useGame((s) => s.playerName);
  const scores = useGame((s) => s.scores);

  const timerRef = useRef<number | null>(null);
  const lastSyncedRef = useRef<string>('');

  useEffect(() => {
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
  }, [playerName, scores]);
}
