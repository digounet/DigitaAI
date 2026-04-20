// Inicialização do Firebase: app, auth (anônimo), Firestore.
// As chaves Web do Firebase são públicas por design — a segurança
// vem das Security Rules do Firestore + Authorized Domains.
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
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

/** Garante que temos um UID anônimo. Resolve para o User autenticado. */
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
