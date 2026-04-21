import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

const COUNTER_DOC = 'stats/proInterest';

/**
 * Registra interesse no Pro. Não exige login — qualquer visitante pode
 * deixar o email. A regra do Firestore valida tamanho do email e impede
 * leitura/alteração (só o dono do projeto lê via console).
 *
 * Também incrementa um contador público em `stats/proInterest` usado na
 * página Pro como prova social. O contador é best-effort: se falhar, o
 * cadastro do email ainda sucede.
 */
export async function registerInterest(email: string, note?: string): Promise<void> {
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes('@')) throw new Error('Email inválido');
  await addDoc(collection(db, 'interests'), {
    email: clean.slice(0, 100),
    note: (note ?? '').slice(0, 300),
    createdAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, COUNTER_DOC), { count: increment(1) }, { merge: true });
  } catch (err) {
    console.warn('[interests] falha ao incrementar contador', err);
  }
}

/**
 * Lê o contador público de interessados no Pro. Retorna 0 se o documento
 * não existir ou a leitura falhar (ex.: offline).
 */
export async function getInterestCount(): Promise<number> {
  try {
    const snap = await getDoc(doc(db, COUNTER_DOC));
    const n = snap.data()?.count;
    return typeof n === 'number' ? n : 0;
  } catch {
    return 0;
  }
}
