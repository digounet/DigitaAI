import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LEVELS } from '../data/levels';

export type LevelScore = {
  stars: number;   // 0..3
  wpm: number;
  accuracy: number; // 0..100
};

type GameState = {
  playerName: string;
  scores: Record<string, LevelScore>;
  soundOn: boolean;
  musicOn: boolean;
  diagnosticDone: boolean;
  recommendedLevelId: string | null;
  setPlayerName: (name: string) => void;
  recordLevel: (levelId: string, score: LevelScore) => void;
  totalStars: () => number;
  isUnlocked: (levelId: string) => boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
  /** Marca o teste inicial como feito e desbloqueia os níveis anteriores ao recomendado. */
  applyDiagnostic: (recommendedLevelId: string, wpm: number, accuracy: number) => void;
  skipDiagnostic: () => void;
  resetProgress: () => void;
};

function levelIndex(id: string) {
  return LEVELS.findIndex((l) => l.id === id);
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      playerName: '',
      scores: {},
      soundOn: true,
      musicOn: true,
      diagnosticDone: false,
      recommendedLevelId: null,
      setPlayerName: (name) => set({ playerName: name }),
      recordLevel: (levelId, score) =>
        set((s) => {
          const prev = s.scores[levelId];
          const best: LevelScore = prev
            ? {
                stars: Math.max(prev.stars, score.stars),
                wpm: Math.max(prev.wpm, score.wpm),
                accuracy: Math.max(prev.accuracy, score.accuracy),
              }
            : score;
          return { scores: { ...s.scores, [levelId]: best } };
        }),
      totalStars: () => Object.values(get().scores).reduce((a, b) => a + b.stars, 0),
      /**
       * Um nível está desbloqueado se:
       *  - for o primeiro, ou
       *  - o nível anterior tem ≥1 estrela, ou
       *  - está no caminho liberado pelo diagnóstico (até o recomendado, inclusive).
       */
      isUnlocked: (levelId) => {
        const idx = levelIndex(levelId);
        if (idx <= 0) return true;
        const prev = LEVELS[idx - 1];
        const scores = get().scores;
        if ((scores[prev.id]?.stars ?? 0) >= 1) return true;
        const recId = get().recommendedLevelId;
        if (recId) {
          const recIdx = levelIndex(recId);
          if (recIdx >= 0 && idx <= recIdx) return true;
        }
        return false;
      },
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      toggleMusic: () => set((s) => ({ musicOn: !s.musicOn })),
      applyDiagnostic: (recId) => set({ diagnosticDone: true, recommendedLevelId: recId }),
      skipDiagnostic: () => set({ diagnosticDone: true }),
      resetProgress: () => set({ scores: {}, diagnosticDone: false, recommendedLevelId: null }),
    }),
    {
      name: 'digitaai:progress',
      version: 2,
      migrate: (persisted, fromVersion) => {
        // v0/v1 → v2: adicionar campos do diagnóstico.
        const s = (persisted ?? {}) as Partial<GameState>;
        if (fromVersion < 2) {
          return {
            ...s,
            diagnosticDone: s.diagnosticDone ?? false,
            recommendedLevelId: s.recommendedLevelId ?? null,
            musicOn: s.musicOn ?? true,
          } as GameState;
        }
        return s as GameState;
      },
    }
  )
);
