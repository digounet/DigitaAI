import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
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

// Resolve depois do primeiro onAuthStateChanged pra evitar o race de
// `auth.currentUser` ser null durante os primeiros ms da inicialização.
let authInitResolve: ((u: User | null) => void) | null = null;
const authInit = new Promise<User | null>((r) => (authInitResolve = r));
onAuthStateChanged(auth, (u) => {
  authInitResolve?.(u);
  authInitResolve = null;
});

/**
 * Retorna o usuário logado (Google) se houver. Nunca cria sessão anônima —
 * se o usuário nunca clicou em "Entrar com Google", resolve pra `null`.
 */
export function getCurrentUser(): Promise<User | null> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return authInit;
}

/** Login com Google via popup. */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

/** Logout. Nada de recriação anônima — o jogador volta ao estado "visitante". */
export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}
