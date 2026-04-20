import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LevelScore = {
  stars: number;   // 0..3
  wpm: number;
  accuracy: number; // 0..100
};

type GameState = {
  playerName: string;
  scores: Record<string, LevelScore>; // levelId -> best score
  soundOn: boolean;
  setPlayerName: (name: string) => void;
  recordLevel: (levelId: string, score: LevelScore) => void;
  totalStars: () => number;
  isUnlocked: (levelId: string, prevId?: string) => boolean;
  toggleSound: () => void;
};

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      playerName: '',
      scores: {},
      soundOn: true,
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
      totalStars: () =>
        Object.values(get().scores).reduce((a, b) => a + b.stars, 0),
      isUnlocked: (_levelId, prevId) => {
        if (!prevId) return true;
        return (get().scores[prevId]?.stars ?? 0) >= 1;
      },
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
    }),
    { name: 'digitaai:progress' }
  )
);
