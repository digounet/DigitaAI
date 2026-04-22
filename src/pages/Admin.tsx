import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { LEVELS, WORLDS, getLevelsByWorld } from '../data/levels';
import type { Difficulty } from '../store/gameStore';

type AuthState = 'loading' | 'anonymous' | 'non-admin' | 'admin';

type IssuedCode = {
  code: string;
  email: string;
  difficulty: Difficulty;
  levelIds: string[];
  note?: string;
  createdByEmail: string;
  createdAt: unknown;
  usedAt?: unknown;
  usedByEmail?: string;
};

function fmtDate(ts: unknown): string {
  if (!ts || typeof ts !== 'object') return '—';
  const d = ts as { toDate?: () => Date };
  try {
    return d.toDate ? d.toDate().toLocaleString('pt-BR') : '—';
  } catch {
    return '—';
  }
}

export function Admin() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form
  const [email, setEmail] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [mode, setMode] = useState<'upTo' | 'specific'>('upTo');
  const [upToLevelId, setUpToLevelId] = useState<string>(LEVELS[0]?.id ?? '');
  const [specificIds, setSpecificIds] = useState<Set<string>>(new Set());
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Listagem
  const [codes, setCodes] = useState<IssuedCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);

  const refreshCodes = async () => {
    setLoadingCodes(true);
    try {
      const { listUnlockCodes } = await import('../services/unlockCodes');
      const list = await listUnlockCodes();
      setCodes(list);
    } catch (err) {
      console.warn('[admin] listar falhou:', err);
    } finally {
      setLoadingCodes(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | null = null;
    (async () => {
      const [{ onAuthStateChanged }, { auth }, { isAdmin, trySelfBootstrapAdmin }] =
        await Promise.all([
          import('firebase/auth'),
          import('../firebase'),
          import('../services/admin'),
        ]);
      if (cancelled) return;
      unsub = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (!user || user.isAnonymous) {
          setAuthState('anonymous');
          return;
        }
        let ok = await isAdmin(user);
        // Bootstrap silencioso: usuários comuns são bloqueados pelas regras
        // do Firestore; só quem as regras autorizarem consegue criar o doc.
        if (!ok) {
          const promoted = await trySelfBootstrapAdmin(user);
          if (promoted) ok = await isAdmin(user);
        }
        if (cancelled) return;
        setAuthState(ok ? 'admin' : 'non-admin');
        if (ok) await refreshCodes();
      });
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const finalLevelIds = useMemo(() => {
    if (mode === 'upTo') {
      const idx = LEVELS.findIndex((l) => l.id === upToLevelId);
      if (idx < 0) return [] as string[];
      return LEVELS.slice(0, idx + 1).map((l) => l.id);
    }
    return LEVELS.filter((l) => specificIds.has(l.id)).map((l) => l.id);
  }, [mode, upToLevelId, specificIds]);

  const handleLogin = async () => {
    const { signInWithGoogle } = await import('../firebase');
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('[admin] login falhou:', err);
    }
  };

  const toggleSpecific = (id: string) => {
    setSpecificIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setGeneratedCode(null);
    if (!email.includes('@')) {
      setErrorMsg('Informe um email válido.');
      return;
    }
    if (finalLevelIds.length === 0) {
      setErrorMsg('Escolha pelo menos um nível para desbloquear.');
      return;
    }
    setSubmitting(true);
    try {
      const { createUnlockCode } = await import('../services/unlockCodes');
      const code = await createUnlockCode({
        email,
        difficulty,
        levelIds: finalLevelIds,
        note,
      });
      setGeneratedCode(code);
      setEmail('');
      setNote('');
      setSpecificIds(new Set());
      await refreshCodes();
    } catch (err) {
      setErrorMsg((err as Error).message || 'Erro ao gerar código.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
    } catch {
      /* ignore */
    }
  };

  if (authState === 'loading') {
    return <Gate>Carregando…</Gate>;
  }
  if (authState === 'anonymous') {
    return (
      <Gate>
        <p className="mb-4">Faça login com sua conta Google para acessar o painel.</p>
        <button
          onClick={handleLogin}
          className="bg-candy text-white font-bold px-5 py-3 rounded-2xl shadow-pop hover:scale-105 transition"
        >
          Entrar com Google
        </button>
      </Gate>
    );
  }
  if (authState === 'non-admin') {
    return (
      <Gate>
        <p className="mb-2">Sua conta ({currentUser?.email}) não tem permissão de administrador.</p>
        <Link to="/" className="text-candy font-bold underline">
          Voltar pro início
        </Link>
      </Gate>
    );
  }

  return (
    <div className="relative flex-1 w-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            <span className="text-candy">Admin</span> · Códigos
          </h1>
          <Link
            to="/"
            className="bg-white/85 rounded-full px-4 py-2 shadow-pop hover:scale-105 transition text-sm"
          >
            ← Início
          </Link>
        </div>

        <section className="bg-white rounded-3xl shadow-bubbly p-5 mb-6">
          <h2 className="text-xl font-bold mb-3">Gerar novo código</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold text-gray-700">Email do beneficiário</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amigo@exemplo.com"
                className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-candy outline-none"
              />
            </label>

            <div>
              <div className="text-sm font-bold text-gray-700 mb-1">Dificuldade</div>
              <div role="radiogroup" className="flex bg-gray-100 rounded-full p-1 gap-1">
                {([
                  { key: 'easy', emoji: '🐢', label: 'Fácil' },
                  { key: 'normal', emoji: '🐰', label: 'Normal' },
                  { key: 'hard', emoji: '🚀', label: 'Rápido' },
                ] as const).map((opt) => {
                  const active = difficulty === opt.key;
                  return (
                    <button
                      type="button"
                      key={opt.key}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setDifficulty(opt.key)}
                      className={`flex-1 px-3 py-2 rounded-full text-sm font-bold transition ${
                        active ? 'bg-candy text-white shadow-pop' : 'text-gray-600 hover:bg-white'
                      }`}
                    >
                      <span className="mr-1">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-gray-700 mb-1">O que desbloquear</div>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setMode('upTo')}
                  className={`flex-1 px-3 py-2 rounded-full text-sm font-bold transition ${
                    mode === 'upTo' ? 'bg-grape text-white shadow-pop' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Até o nível X
                </button>
                <button
                  type="button"
                  onClick={() => setMode('specific')}
                  className={`flex-1 px-3 py-2 rounded-full text-sm font-bold transition ${
                    mode === 'specific' ? 'bg-grape text-white shadow-pop' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Níveis específicos
                </button>
              </div>

              {mode === 'upTo' ? (
                <select
                  value={upToLevelId}
                  onChange={(e) => setUpToLevelId(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-grape outline-none"
                >
                  {LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      Mundo {l.world} · {l.title} ({l.id})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="max-h-72 overflow-y-auto border-2 border-gray-200 rounded-xl p-2">
                  {WORLDS.map((w) => (
                    <div key={w.id} className="mb-3">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                        {w.emoji} Mundo {w.id} — {w.title}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {getLevelsByWorld(w.id).map((lv) => {
                          const checked = specificIds.has(lv.id);
                          return (
                            <label
                              key={lv.id}
                              className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm cursor-pointer ${
                                checked ? 'bg-grape/10' : 'hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSpecific(lv.id)}
                              />
                              <span className="truncate">
                                {lv.emoji} {lv.title}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {finalLevelIds.length} nível(is) serão liberados na dificuldade{' '}
                <b>{difficulty}</b>.
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold text-gray-700">Nota (opcional)</span>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex.: obrigado pelo Pix 💙"
                maxLength={120}
                className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-candy outline-none"
              />
            </label>

            {errorMsg && (
              <div className="bg-coral/15 text-coral-700 text-sm rounded-xl px-3 py-2">{errorMsg}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-grape to-candy text-white font-bold px-5 py-3 rounded-2xl shadow-pop hover:scale-[1.02] active:scale-95 transition disabled:opacity-60"
            >
              {submitting ? 'Gerando…' : 'Gerar código'}
            </button>
          </form>

          {generatedCode && (
            <div className="mt-4 bg-mint/30 border-2 border-mint rounded-2xl p-4 text-center">
              <div className="text-xs font-bold text-gray-700 uppercase mb-1">Código gerado</div>
              <div className="font-mono text-2xl font-bold tracking-wider break-all">
                {generatedCode}
              </div>
              <button
                onClick={handleCopy}
                className="mt-2 bg-white text-gray-800 font-bold px-4 py-1.5 rounded-full shadow-pop text-sm hover:scale-105 transition"
              >
                📋 Copiar
              </button>
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl shadow-bubbly p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Códigos emitidos</h2>
            <button
              onClick={refreshCodes}
              className="text-sm font-bold text-candy hover:underline"
            >
              {loadingCodes ? 'Atualizando…' : 'Atualizar'}
            </button>
          </div>
          {codes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum código emitido ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500 border-b">
                    <th className="py-2 pr-3">Código</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Dif.</th>
                    <th className="py-2 pr-3">Níveis</th>
                    <th className="py-2 pr-3">Criado</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => (
                    <tr key={c.code} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-mono">{c.code}</td>
                      <td className="py-2 pr-3 truncate max-w-[180px]">{c.email}</td>
                      <td className="py-2 pr-3">{c.difficulty}</td>
                      <td className="py-2 pr-3">{c.levelIds.length}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                      <td className="py-2 pr-3">
                        {c.usedAt ? (
                          <span className="text-grass font-bold">
                            usado · {fmtDate(c.usedAt)}
                          </span>
                        ) : (
                          <span className="text-gray-500">pendente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-bubbly p-6 text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Admin</h1>
        <div className="text-gray-700">{children}</div>
      </div>
    </div>
  );
}
