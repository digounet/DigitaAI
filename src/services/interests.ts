import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, ensureAuth } from '../firebase';

/**
 * Registra interesse por premium (captura de leads antes de ter produto pago).
 * Grava em `interests/{auto}` com email + timestamp. Uma pessoa pode registrar
 * várias vezes — simples e barato; dedup depois se virar problema.
 */
export async function registerInterest(email: string, note?: string): Promise<void> {
  await ensureAuth();
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes('@')) throw new Error('Email inválido');
  await addDoc(collection(db, 'interests'), {
    email: clean.slice(0, 100),
    note: (note ?? '').slice(0, 300),
    createdAt: serverTimestamp(),
  });
}
