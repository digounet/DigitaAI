import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithPopup,
  linkWithPopup,
  signOut as fbSignOut,
  GoogleAuthProvider,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA06SswgQWTwZPBoUnmXD19VTrQstMvGGk',
  authDomain: 'digitai-bd63e.firebaseapp.com',
  projectId: 'digitai-bd63e',
  storageBucket: 'digitai-bd63e.firebasestorage.app',
  messagingSenderId: '688574457308',
  appId: '1:688574457308:web:da92dc3f888a56c5849b19',
  measurementId: 'G-2F76Y3XSM5',
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

/** Garante que exista um User autenticado. Faz login anônimo se necessário. */
export function ensureAuth(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub();
        resolve(user);
      }
    });
    signInAnonymously(auth).catch((err) => {
      unsub();
      reject(err);
    });
  });
}

/**
 * Login com Google. Se o usuário atual é anônimo, tenta *linkar* a conta
 * (preserva UID e progresso). Se o Google já estava linkado a outro UID,
 * cai de volta pro `signInWithPopup` (troca de conta).
 */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const current = auth.currentUser;
  if (current && current.isAnonymous) {
    try {
      const cred = await linkWithPopup(current, provider);
      return cred.user;
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/credential-already-in-use' || code === 'auth/email-already-in-use') {
        // Já existe conta Google com esse e-mail — só fazer signIn normal.
        await fbSignOut(auth);
        const cred = await signInWithPopup(auth, provider);
        return cred.user;
      }
      throw err;
    }
  }
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

/** Faz logout e imediatamente cria uma nova sessão anônima pra o jogo continuar. */
export async function signOut(): Promise<void> {
  await fbSignOut(auth);
  await signInAnonymously(auth);
}
