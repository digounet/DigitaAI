import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../firebase';

export type AdminDoc = {
  email: string;
  addedBy: string;
  addedAt: unknown;
};

/** Verifica se o usuário é admin consultando `admins/{uid}`. A lista de
 *  admins é mantida SÓ no Firestore (e, por baixo, protegida por regras);
 *  o cliente não conhece nenhum email privilegiado.
 */
export async function isAdmin(user: User | null | undefined): Promise<boolean> {
  if (!user || user.isAnonymous) return false;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch {
    return false;
  }
}

/**
 * Tenta criar um doc de admin pro próprio usuário. Usado no bootstrap: quem
 * tem permissão (definida nas regras do Firestore) consegue; os demais são
 * bloqueados pelo Firestore e este método resolve como `false`. Nenhum dado
 * sensível volta pro cliente se a permissão não existir.
 */
export async function trySelfBootstrapAdmin(user: User): Promise<boolean> {
  try {
    await setDoc(doc(db, 'admins', user.uid), {
      email: user.email ?? '',
      addedBy: 'self-bootstrap',
      addedAt: serverTimestamp(),
    } satisfies AdminDoc);
    return true;
  } catch {
    return false;
  }
}

export async function listAdmins(): Promise<Array<{ uid: string } & AdminDoc>> {
  const snap = await getDocs(collection(db, 'admins'));
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as AdminDoc) }));
}

export async function addAdmin(uid: string, email: string, addedBy: string): Promise<void> {
  await setDoc(doc(db, 'admins', uid), {
    email,
    addedBy,
    addedAt: serverTimestamp(),
  } satisfies AdminDoc);
}

export async function removeAdmin(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'admins', uid));
}
