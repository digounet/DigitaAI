import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Registra interesse no Pro. Não exige login — qualquer visitante pode
 * deixar o email. A regra do Firestore valida tamanho do email e impede
 * leitura/alteração (só o dono do projeto lê via console).
 */
export async function registerInterest(email: string, note?: string): Promise<void> {
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes('@')) throw new Error('Email inválido');
  await addDoc(collection(db, 'interests'), {
    email: clean.slice(0, 100),
    note: (note ?? '').slice(0, 300),
    createdAt: serverTimestamp(),
  });
}
