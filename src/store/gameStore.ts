import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LEVELS } from '../data/levels';

export type LevelScore = {
  stars: number;   // 0..3
  wpm: number;
  accuracy: number; // 0..100
};

export type Difficulty = 'easy' | 'normal' | 'hard';

/** Multiplica o `speed` (tempo de travessia) nos modos Balloon/Pie.
 *  >1 = mais lento (mais tempo pra digitar). */
export const DIFFICULTY_SPEED_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1.5,
  normal: 1.0,
  hard: 0.85,
};

/** Cap máximo de balões/tortas simultâneos por dificuldade.
 *  - fácil: 1 por vez (sem sobreposição, tempo de sobra pra criança).
 *  - normal: até 2, mas o spawn garante espaçamento horizontal.
 *  - difícil: respeita o `maxAtOnce` do nível (até 3). */
export function effectiveMaxAtOnce(base: number, difficulty: Difficulty): number {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'normal') return Math.min(2, base);
  return base;
}

export type ProgressSlot = {
  scores: Record<string, LevelScore>;
  diagnosticDone: boolean;
  recommendedLevelId: string | null;
};

function emptySlot(): ProgressSlot {
  return { scores: {}, diagnosticDone: false, recommendedLevelId: null };
}

function emptyAllProgress(): Record<Difficulty, ProgressSlot> {
  return { easy: emptySlot(), normal: emptySlot(), hard: emptySlot() };
}

type GameState = {
  playerName: string;
  soundOn: boolean;
  musicOn: boolean;
  difficulty: Difficulty;
  /** Progresso completo por dificuldade (fonte da verdade). */
  allProgress: Record<Difficulty, ProgressSlot>;
  /** Espelho do slot ativo pra compat com consumidores antigos. */
  scores: Record<string, LevelScore>;
  diagnosticDone: boolean;
  recommendedLevelId: string | null;
  setPlayerName: (name: string) => void;
  recordLevel: (levelId: string, score: LevelScore) => void;
  totalStars: () => number;
  isUnlocked: (levelId: string) => boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
  setDifficulty: (d: Difficulty) => void;
  /** Marca o teste inicial como feito e desbloqueia os níveis anteriores ao recomendado. */
  applyDiagnostic: (recommendedLevelId: string, wpm: number, accuracy: number) => void;
  skipDiagnostic: () => void;
  /** Zera só o slot da dificuldade ativa. */
  resetProgress: () => void;
  /** Merge vindo do Firebase: aceita formato novo (allProgress) ou antigo (scores plano = normal). */
  applyRemoteProgress: (remote: {
    scores?: Record<string, LevelScore>;
    diagnosticDone?: boolean;
    recommendedLevelId?: string | null;
    allProgress?: Partial<Record<Difficulty, ProgressSlot>>;
  }) => void;
};

function levelIndex(id: string) {
  return LEVELS.findIndex((l) => l.id === id);
}

function mergeSlot(a: ProgressSlot, b: Partial<ProgressSlot>): ProgressSlot {
  const merged: Record<string, LevelScore> = { ...a.scores };
  for (const [id, r] of Object.entries(b.scores ?? {})) {
    const prev = merged[id];
    merged[id] = prev
      ? {
          stars: Math.max(prev.stars, r.stars),
          wpm: Math.max(prev.wpm, r.wpm),
          accuracy: Math.max(prev.accuracy, r.accuracy),
        }
      : r;
  }
  return {
    scores: merged,
    diagnosticDone: a.diagnosticDone || (b.diagnosticDone ?? false),
    recommendedLevelId: a.recommendedLevelId ?? b.recommendedLevelId ?? null,
  };
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      playerName: '',
      soundOn: true,
      musicOn: true,
      difficulty: 'normal',
      allProgress: emptyAllProgress(),
      scores: {},
      diagnosticDone: false,
      recommendedLevelId: null,
      setPlayerName: (name) => set({ playerName: name }),
      recordLevel: (levelId, score) =>
        set((s) => {
          const slot = s.allProgress[s.difficulty];
          const prev = slot.scores[levelId];
          const best: LevelScore = prev
            ? {
                stars: Math.max(prev.stars, score.stars),
                wpm: Math.max(prev.wpm, score.wpm),
                accuracy: Math.max(prev.accuracy, score.accuracy),
              }
            : score;
          const newScores = { ...slot.scores, [levelId]: best };
          return {
            allProgress: { ...s.allProgress, [s.difficulty]: { ...slot, scores: newScores } },
            scores: newScores,
          };
        }),
      totalStars: () =>
        Object.values(get().allProgress[get().difficulty].scores).reduce((a, b) => a + b.stars, 0),
      /**
       * Um nível está desbloqueado se:
       *  - for o primeiro, ou
       *  - o nível anterior tem ≥1 estrela, ou
       *  - está no caminho liberado pelo diagnóstico (até o recomendado, inclusive).
       * Desbloqueio é por dificuldade — trocar de dificuldade traz o slot correspondente.
       */
      isUnlocked: (levelId) => {
        const idx = levelIndex(levelId);
        if (idx <= 0) return true;
        const prev = LEVELS[idx - 1];
        const slot = get().allProgress[get().difficulty];
        if ((slot.scores[prev.id]?.stars ?? 0) >= 1) return true;
        const recId = slot.recommendedLevelId;
        if (recId) {
          const recIdx = levelIndex(recId);
          if (recIdx >= 0 && idx <= recIdx) return true;
        }
        return false;
      },
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      toggleMusic: () => set((s) => ({ musicOn: !s.musicOn })),
      setDifficulty: (d) =>
        set((s) => {
          const slot = s.allProgress[d] ?? emptySlot();
          return {
            difficulty: d,
            scores: slot.scores,
            diagnosticDone: slot.diagnosticDone,
            recommendedLevelId: slot.recommendedLevelId,
          };
        }),
      applyDiagnostic: (recId) =>
        set((s) => {
          const slot = { ...s.allProgress[s.difficulty], diagnosticDone: true, recommendedLevelId: recId };
          return {
            allProgress: { ...s.allProgress, [s.difficulty]: slot },
            diagnosticDone: true,
            recommendedLevelId: recId,
          };
        }),
      skipDiagnostic: () =>
        set((s) => {
          const slot = { ...s.allProgress[s.difficulty], diagnosticDone: true };
          return {
            allProgress: { ...s.allProgress, [s.difficulty]: slot },
            diagnosticDone: true,
          };
        }),
      resetProgress: () =>
        set((s) => ({
          allProgress: { ...s.allProgress, [s.difficulty]: emptySlot() },
          scores: {},
          diagnosticDone: false,
          recommendedLevelId: null,
        })),
      applyRemoteProgress: (remote) =>
        set((s) => {
          const nextAll = { ...s.allProgress };
          if (remote.allProgress) {
            for (const key of ['easy', 'normal', 'hard'] as const) {
              const rSlot = remote.allProgress[key];
              if (rSlot) nextAll[key] = mergeSlot(nextAll[key], rSlot);
            }
          } else {
            // Formato antigo: scores/diagnostic plano → vai pro slot normal.
            nextAll.normal = mergeSlot(nextAll.normal, {
              scores: remote.scores ?? {},
              diagnosticDone: remote.diagnosticDone ?? false,
              recommendedLevelId: remote.recommendedLevelId ?? null,
            });
          }
          const active = nextAll[s.difficulty];
          return {
            allProgress: nextAll,
            scores: active.scores,
            diagnosticDone: active.diagnosticDone,
            recommendedLevelId: active.recommendedLevelId,
          };
        }),
    }),
    {
      name: 'digitaai:progress',
      version: 4,
      migrate: (persisted, fromVersion) => {
        const s = (persisted ?? {}) as Partial<GameState> & {
          scores?: Record<string, LevelScore>;
          diagnosticDone?: boolean;
          recommendedLevelId?: string | null;
        };
        // v<4: dados eram top-level (um único slot). Preserva como "normal".
        if (fromVersion < 4) {
          const all = emptyAllProgress();
          all.normal = {
            scores: s.scores ?? {},
            diagnosticDone: s.diagnosticDone ?? false,
            recommendedLevelId: s.recommendedLevelId ?? null,
          };
          const difficulty = (s.difficulty ?? 'normal') as Difficulty;
          const active = all[difficulty];
          return {
            ...s,
            difficulty,
            musicOn: s.musicOn ?? true,
            allProgress: all,
            scores: active.scores,
            diagnosticDone: active.diagnosticDone,
            recommendedLevelId: active.recommendedLevelId,
          } as GameState;
        }
        return s as GameState;
      },
    }
  )
);
