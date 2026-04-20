import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, getCurrentUser } from '../firebase';
import type { Difficulty, LevelScore, ProgressSlot } from '../store/gameStore';

export type ProgressDoc = {
  playerName?: string;
  /** Progresso completo por dificuldade (formato atual). */
  allProgress?: Partial<Record<Difficulty, ProgressSlot>>;
  /** Campos legados — mantidos pra compat com docs antigos; espelham o slot `normal`. */
  scores?: Record<string, LevelScore>;
  diagnosticDone?: boolean;
  recommendedLevelId?: string | null;
  updatedAt?: unknown;
};

export async function loadUserProgress(): Promise<ProgressDoc | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.isAnonymous) return null;
    const snap = await getDoc(doc(db, 'users', user.uid));
    return snap.exists() ? (snap.data() as ProgressDoc) : null;
  } catch (err) {
    console.warn('[userProgress] load falhou:', err);
    return null;
  }
}

export async function saveUserProgress(data: ProgressDoc): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user || user.isAnonymous) return;
    await setDoc(
      doc(db, 'users', user.uid),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.warn('[userProgress] save falhou:', err);
  }
}
