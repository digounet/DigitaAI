import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, ensureAuth } from '../firebase';
import type { LevelScore } from '../store/gameStore';

export type ProgressDoc = {
  playerName?: string;
  scores?: Record<string, LevelScore>;
  diagnosticDone?: boolean;
  recommendedLevelId?: string | null;
  updatedAt?: unknown;
};

export async function loadUserProgress(): Promise<ProgressDoc | null> {
  try {
    const user = await ensureAuth();
    const snap = await getDoc(doc(db, 'users', user.uid));
    return snap.exists() ? (snap.data() as ProgressDoc) : null;
  } catch (err) {
    console.warn('[userProgress] load falhou:', err);
    return null;
  }
}

export async function saveUserProgress(data: ProgressDoc): Promise<void> {
  try {
    const user = await ensureAuth();
    await setDoc(
      doc(db, 'users', user.uid),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.warn('[userProgress] save falhou:', err);
  }
}
