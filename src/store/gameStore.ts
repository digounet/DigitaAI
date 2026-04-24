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
 *  >1 = mais lento (mais tempo pra digitar).
 *  O difícil é só um pouco mais rápido que o normal — a ideia é que seja
 *  um pouquinho mais difícil, não brutal. Pra tortas (palavras) existe um
 *  multiplicador próprio (`pieSpeedMultiplier`) ainda mais generoso no hard,
 *  já que cada item tem várias letras e precisa de tempo pra leitura. */
export const DIFFICULTY_SPEED_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1.7,
  normal: 1.35,
  hard: 1.15,
};

/** Multiplicador de velocidade específico pro modo torta (palavras/sequências).
 *  No hard, itens de várias letras precisam de mais tempo pra ler e digitar
 *  do que letras avulsas — senão vira corrida de leitura, não de digitação.
 *  Nos outros níveis segue o multiplicador padrão. */
export function pieSpeedMultiplier(difficulty: Difficulty): number {
  if (difficulty === 'hard') return 1.25;
  return DIFFICULTY_SPEED_MULTIPLIER[difficulty];
}

/** Cap máximo de balões/tortas simultâneos por dificuldade.
 *  - fácil: 1 por vez (sem sobreposição, tempo de sobra pra criança).
 *  - normal: até 2, mas o spawn garante espaçamento horizontal.
 *  - difícil: permite 1 a mais que o nível define (piso 3), pra aumentar a pressão. */
export function effectiveMaxAtOnce(base: number, difficulty: Difficulty): number {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'normal') return Math.min(2, base);
  return Math.max(base + 1, 3);
}

/** Ajusta a meta de PPM dos modos texto/escalada pela dificuldade.
 *  - fácil: cobra 30% menos (mais fácil de tirar estrelas).
 *  - normal: mantém a meta do nível.
 *  - difícil: cobra 15% a mais (um pouquinho mais exigente, sem ser brutal). */
export function effectiveGoalWpm(goalWpm: number | undefined, difficulty: Difficulty): number | undefined {
  if (goalWpm == null) return goalWpm;
  if (difficulty === 'easy') return Math.max(1, Math.round(goalWpm * 0.7));
  if (difficulty === 'hard') return Math.round(goalWpm * 1.15);
  return goalWpm;
}

export type ProgressSlot = {
  scores: Record<string, LevelScore>;
  diagnosticDone: boolean;
  recommendedLevelId: string | null;
  /** Níveis desbloqueados manualmente (por código de admin). Não conta estrela,
   *  só libera o acesso. Persistido por dificuldade. */
  unlockedIds: string[];
};

function emptySlot(): ProgressSlot {
  return { scores: {}, diagnosticDone: false, recommendedLevelId: null, unlockedIds: [] };
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
  /** Libera níveis manualmente no slot da dificuldade informada (via código). */
  applyUnlock: (difficulty: Difficulty, levelIds: string[]) => void;
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
  const unlockedIds = Array.from(new Set([...(a.unlockedIds ?? []), ...(b.unlockedIds ?? [])]));
  return {
    scores: merged,
    diagnosticDone: a.diagnosticDone || (b.diagnosticDone ?? false),
    recommendedLevelId: a.recommendedLevelId ?? b.recommendedLevelId ?? null,
    unlockedIds,
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
        if (slot.unlockedIds?.includes(levelId)) return true;
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
      applyUnlock: (difficulty, levelIds) =>
        set((s) => {
          const target = s.allProgress[difficulty] ?? emptySlot();
          const nextUnlocked = Array.from(new Set([...(target.unlockedIds ?? []), ...levelIds]));
          const nextSlot = { ...target, unlockedIds: nextUnlocked };
          return {
            allProgress: { ...s.allProgress, [difficulty]: nextSlot },
            // Se está desbloqueando na dificuldade ativa, atualiza o espelho
            // pra que a Home reaja sem precisar trocar de dificuldade.
            ...(difficulty === s.difficulty
              ? { scores: nextSlot.scores }
              : {}),
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
      version: 5,
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
            unlockedIds: [],
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
        // v<5: slots não tinham `unlockedIds`. Preenche com lista vazia.
        if (fromVersion < 5) {
          const all = s.allProgress ?? emptyAllProgress();
          for (const key of ['easy', 'normal', 'hard'] as const) {
            const slot = all[key] ?? emptySlot();
            all[key] = { ...emptySlot(), ...slot, unlockedIds: slot.unlockedIds ?? [] };
          }
          return { ...s, allProgress: all } as GameState;
        }
        return s as GameState;
      },
    }
  )
);
