import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

/**
 * Mostra um badge com estado de login + ações.
 *  - Anônimo: botão "Entrar com Google"
 *  - Autenticado: avatar, nome, botão "Sair"
 *
 * Lazy-loads o SDK do Firebase só quando é montado/usado.
 */
export function AuthBadge() {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      const [{ onAuthStateChanged }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('../firebase'),
      ]);
      if (cancelled) return;
      unsub = onAuthStateChanged(auth, (u) => setUser(u));
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const handleLogin = async () => {
    setBusy(true);
    setError(null);
    try {
      const { signInWithGoogle } = await import('../firebase');
      await signInWithGoogle();
    } catch (err) {
      console.error('[auth] login falhou:', err);
      const e = err as { code?: string; message?: string };
      const code = e.code ?? '';
      const friendly =
        code === 'auth/popup-blocked'
          ? 'O navegador bloqueou o popup. Permita popups para este site.'
          : code === 'auth/popup-closed-by-user'
          ? 'Você fechou a janela antes de confirmar. Tente de novo.'
          : code === 'auth/cancelled-popup-request'
          ? 'Outra tela de login foi aberta. Tente novamente.'
          : code === 'auth/unauthorized-domain'
          ? 'Domínio não autorizado no Firebase. Adicione-o em Auth → Settings → Authorized domains.'
          : code === 'auth/operation-not-allowed'
          ? 'Google Sign-In não está habilitado. Ative em Firebase → Authentication → Sign-in method → Google.'
          : code === 'auth/network-request-failed'
          ? 'Falha de rede. Verifique sua conexão.'
          : code === 'auth/internal-error'
          ? 'Erro interno do Firebase. Verifique restrições da API Key no GCP.'
          : `${code || 'erro'} — ${e.message ?? 'tente novamente'}`;
      setError(friendly);
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      const { signOut } = await import('../firebase');
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  const isAnonymous = !user || user.isAnonymous;

  if (isAnonymous) {
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleLogin}
          disabled={busy}
          className="bg-white rounded-full px-4 py-2 shadow-pop hover:scale-105 active:scale-95 transition text-sm flex items-center gap-2 border border-gray-200 disabled:opacity-60"
        >
          <GoogleIcon />
          {busy ? 'Entrando...' : 'Entrar com Google'}
        </button>
        {error && <div className="text-xs text-coral max-w-[260px] text-center leading-tight">{error}</div>}
      </div>
    );
  }

  return (
    <div className="bg-white/90 rounded-full pl-1 pr-3 py-1 shadow-pop flex items-center gap-2 text-sm">
      {user.photoURL ? (
        <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-grape text-white flex items-center justify-center font-bold">
          {(user.displayName || 'U').slice(0, 1)}
        </div>
      )}
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-gray-800 max-w-[120px] truncate">{user.displayName ?? 'Jogador'}</span>
        <button
          onClick={handleLogout}
          disabled={busy}
          className="text-[11px] text-gray-500 hover:text-coral text-left"
        >
          sair
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.5 6.8 28.9 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19c10.5 0 19-8.5 19-19 0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.8 15 19 12 24 12c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.5 6.8 28.9 5 24 5 16.3 5 9.7 9.3 6.3 14.1z" />
      <path fill="#4CAF50" d="M24 43c4.8 0 9.3-1.8 12.6-4.9l-5.8-4.9C28.9 34.9 26.6 36 24 36c-5.4 0-9.9-3.5-11.5-8.3l-6.6 5.1C9.5 38.6 16.1 43 24 43z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l5.8 4.9c-.4.4 6.9-5 6.9-14.4 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
