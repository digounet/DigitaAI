import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db, getCurrentUser } from '../firebase';
import type { Difficulty } from '../store/gameStore';

export type UnlockCodeDoc = {
  email: string;
  difficulty: Difficulty;
  levelIds: string[];
  note?: string;
  createdBy: string;
  createdByEmail: string;
  createdAt: unknown;
  usedAt?: unknown;
  usedByUid?: string;
  usedByEmail?: string;
};

/** Alfabeto sem caracteres ambíguos (0/O, 1/I). */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomChunk(len: number): string {
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[arr[i] % ALPHABET.length];
  return out;
}

export function generateCode(): string {
  return `DGT-${randomChunk(4)}-${randomChunk(4)}`;
}

/** Cria o código no Firestore. Garante unicidade tentando novos códigos se
 *  colidir — improvável com 32^8 combinações, mas é barato. */
export async function createUnlockCode(input: {
  email: string;
  difficulty: Difficulty;
  levelIds: string[];
  note?: string;
}): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Faça login para criar códigos.');

  const payload: UnlockCodeDoc = {
    email: input.email.trim().toLowerCase(),
    difficulty: input.difficulty,
    levelIds: input.levelIds,
    note: input.note?.trim() || undefined,
    createdBy: user.uid,
    createdByEmail: user.email ?? '',
    createdAt: serverTimestamp(),
  };

  for (let tries = 0; tries < 5; tries++) {
    const code = generateCode();
    const ref = doc(db, 'unlockCodes', code);
    const existing = await getDoc(ref);
    if (existing.exists()) continue;
    await setDoc(ref, payload);
    return code;
  }
  throw new Error('Falha ao gerar código único. Tente novamente.');
}

export async function listUnlockCodes(): Promise<Array<{ code: string } & UnlockCodeDoc>> {
  const q = query(collection(db, 'unlockCodes'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ code: d.id, ...(d.data() as UnlockCodeDoc) }));
}

export type RedeemResult = {
  difficulty: Difficulty;
  levelIds: string[];
  note?: string;
};

/** Resgata o código. Transaciona pra garantir uso único e valida o email
 *  contra o usuário logado. Lança erro amigável em caso de falha. */
export async function redeemUnlockCode(rawCode: string): Promise<RedeemResult> {
  const user = await getCurrentUser();
  if (!user || !user.email) {
    throw new Error('Entre com sua conta Google antes de resgatar.');
  }
  const code = rawCode.trim().toUpperCase();
  if (!code) throw new Error('Digite o código.');

  const ref = doc(db, 'unlockCodes', code);

  return await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Código não encontrado.');
    const data = snap.data() as UnlockCodeDoc;
    if (data.usedAt) throw new Error('Este código já foi usado.');
    if (data.email.toLowerCase() !== user.email!.toLowerCase()) {
      throw new Error('Este código é de outro email. Entre com a conta correta.');
    }
    tx.update(ref, {
      usedAt: serverTimestamp(),
      usedByUid: user.uid,
      usedByEmail: user.email!,
    });
    return {
      difficulty: data.difficulty,
      levelIds: data.levelIds,
      note: data.note,
    };
  });
}
