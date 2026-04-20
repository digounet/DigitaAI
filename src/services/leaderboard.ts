import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db, ensureAuth } from '../firebase';

export type LeaderboardEntry = {
  uid: string;
  name: string;
  totalStars: number;
  bestWpm: number;
  updatedAt?: Date;
};

/**
 * Cria/atualiza a entrada do jogador atual no ranking.
 * Silencioso em caso de erro (offline, auth falhou etc) — não queremos
 * atrapalhar a brincadeira.
 */
export async function upsertMyScore(params: {
  name: string;
  totalStars: number;
  bestWpm: number;
}): Promise<void> {
  try {
    const user = await ensureAuth();
    const name = (params.name || 'Jogador').trim().slice(0, 20) || 'Jogador';
    const payload = {
      name,
      totalStars: Math.max(0, Math.floor(params.totalStars)),
      bestWpm: Math.max(0, Math.round(params.bestWpm * 10) / 10),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'leaderboard', user.uid), payload, { merge: true });
  } catch (err) {
    console.warn('[leaderboard] upsert falhou (ignorado):', err);
  }
}

/** Busca top N ordenado por estrelas (desc) e depois por bestWpm (desc). */
export async function fetchTop(n = 20): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, 'leaderboard'),
    orderBy('totalStars', 'desc'),
    orderBy('bestWpm', 'desc'),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    const updatedAt = data.updatedAt?.toDate?.() as Date | undefined;
    return {
      uid: d.id,
      name: data.name as string,
      totalStars: data.totalStars as number,
      bestWpm: data.bestWpm as number,
      updatedAt,
    };
  });
}
