import { doc, getDoc, serverTimestamp, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../firebase';

/** Email que é admin por padrão, sem precisar de doc em `admins/*`. Útil pro
 *  bootstrap: quem não tem nenhum admin cadastrado começa por este. */
export const ROOT_ADMIN_EMAIL = 'digounet@gmail.com';

export type AdminDoc = {
  email: string;
  addedBy: string;
  addedAt: unknown;
};

/** Verifica se o usuário é admin. ROOT_ADMIN_EMAIL vale sempre; os demais
 *  precisam ter um doc em `admins/{uid}`. */
export async function isAdmin(user: User | null | undefined): Promise<boolean> {
  if (!user || user.isAnonymous) return false;
  if (user.email?.toLowerCase() === ROOT_ADMIN_EMAIL) return true;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
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
