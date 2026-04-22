import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { LEVELS } from '../data/levels';

type Props = {
  onClose: () => void;
};

type AuthState = 'loading' | 'anonymous' | 'ready';

export function RedeemCodeModal({ onClose }: Props) {
  const applyUnlock = useGame((s) => s.applyUnlock);
  const setDifficulty = useGame((s) => s.setDifficulty);

  const [authState, setAuthState] = useState<AuthState>('loading');
  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    count: number;
    difficulty: string;
    firstTitle?: string;
    note?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | null = null;
    (async () => {
      const [{ onAuthStateChanged }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('../firebase'),
      ]);
      if (cancelled) return;
      unsub = onAuthStateChanged(auth, (user) => {
        if (!user || user.isAnonymous) {
          setAuthState('anonymous');
          setEmail(null);
        } else {
          setAuthState('ready');
          setEmail(user.email ?? null);
        }
      });
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleLogin = async () => {
    try {
      const { signInWithGoogle } = await import('../firebase');
      await signInWithGoogle();
    } catch (err) {
      console.error('[redeem] login falhou:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const { redeemUnlockCode } = await import('../services/unlockCodes');
      const result = await redeemUnlockCode(code);
      applyUnlock(result.difficulty, result.levelIds);
      // Foca a dificuldade do código pra criança já ver os níveis liberados.
      setDifficulty(result.difficulty);
      const first = LEVELS.find((l) => l.id === result.levelIds[0]);
      setSuccess({
        count: result.levelIds.length,
        difficulty: result.difficulty,
        firstTitle: first?.title,
        note: result.note,
      });
    } catch (err) {
      setErrorMsg((err as Error).message || 'Não foi possível resgatar este código.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-bubbly p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">
            🎁 <span className="text-candy">Resgatar código</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-lg font-bold">
              {success.count} nível(is) liberados na dificuldade <b>{success.difficulty}</b>!
            </p>
            {success.firstTitle && (
              <p className="text-sm text-gray-600 mt-1">
                Começando em: <b>{success.firstTitle}</b>
              </p>
            )}
            {success.note && (
              <div className="mt-3 bg-sun/20 rounded-xl p-3 text-sm italic">“{success.note}”</div>
            )}
            <button
              onClick={onClose}
              className="mt-4 bg-candy text-white font-bold px-5 py-2.5 rounded-2xl shadow-pop"
            >
              Jogar agora
            </button>
          </div>
        ) : authState === 'loading' ? (
          <p className="text-gray-500">Carregando…</p>
        ) : authState === 'anonymous' ? (
          <div>
            <p className="text-gray-700 mb-3">
              Os códigos são vinculados ao seu email. Entre com a conta Google usada no cadastro do
              código.
            </p>
            <button
              onClick={handleLogin}
              className="w-full bg-candy text-white font-bold px-5 py-3 rounded-2xl shadow-pop"
            >
              Entrar com Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-gray-600 mb-3">
              Logado como <b>{email}</b>. O código só funciona se tiver sido gerado pra este email.
            </p>
            <label className="flex flex-col gap-1 mb-3">
              <span className="text-sm font-bold text-gray-700">Código</span>
              <input
                type="text"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="DGT-XXXX-XXXX"
                className="border-2 border-gray-200 rounded-xl px-3 py-3 font-mono tracking-wider uppercase text-center focus:border-candy outline-none"
              />
            </label>
            {errorMsg && (
              <div className="bg-coral/15 text-coral-700 text-sm rounded-xl px-3 py-2 mb-3">
                {errorMsg}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-grape to-candy text-white font-bold px-5 py-3 rounded-2xl shadow-pop disabled:opacity-60"
            >
              {submitting ? 'Resgatando…' : 'Resgatar'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
