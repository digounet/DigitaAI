import { useCallback, useRef, useState } from 'react';

export type Stats = {
  correct: number;
  total: number;
  errors: number;
  wpm: number;
  accuracy: number;
  startedAt: number | null;
};

/**
 * Hook que mantém estatísticas de digitação: acertos, erros, WPM (palavras/min)
 * e precisão. WPM é calculado com a convenção padrão: 5 caracteres = 1 palavra.
 */
export function useTypingStats() {
  const [stats, setStats] = useState<Stats>({
    correct: 0,
    total: 0,
    errors: 0,
    wpm: 0,
    accuracy: 100,
    startedAt: null,
  });
  const startedAtRef = useRef<number | null>(null);

  const registerHit = useCallback(() => {
    setStats((s) => {
      const startedAt = startedAtRef.current ?? Date.now();
      if (!startedAtRef.current) startedAtRef.current = startedAt;
      const correct = s.correct + 1;
      const total = s.total + 1;
      const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
      const wpm = correct / 5 / minutes;
      const accuracy = total === 0 ? 100 : (correct / total) * 100;
      return { ...s, correct, total, wpm, accuracy, startedAt };
    });
  }, []);

  const registerMiss = useCallback(() => {
    setStats((s) => {
      const total = s.total + 1;
      const errors = s.errors + 1;
      const accuracy = total === 0 ? 100 : (s.correct / total) * 100;
      return { ...s, total, errors, accuracy };
    });
  }, []);

  const reset = useCallback(() => {
    startedAtRef.current = null;
    setStats({ correct: 0, total: 0, errors: 0, wpm: 0, accuracy: 100, startedAt: null });
  }, []);

  return { stats, registerHit, registerMiss, reset };
}

/** Calcula estrelas a partir de precisão + opcionalmente WPM. */
export function starsFor(accuracy: number, wpm?: number, goalWpm?: number): number {
  if (goalWpm && wpm !== undefined) {
    if (accuracy >= 95 && wpm >= goalWpm) return 3;
    if (accuracy >= 85 && wpm >= goalWpm * 0.7) return 2;
    if (accuracy >= 70) return 1;
    return 0;
  }
  if (accuracy >= 95) return 3;
  if (accuracy >= 80) return 2;
  if (accuracy >= 60) return 1;
  return 0;
}
