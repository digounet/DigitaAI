import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mascot } from '../components/Mascot';
import { fetchTop, type LeaderboardEntry } from '../services/leaderboard';
import { getCurrentUser } from '../firebase';
import { useGame } from '../store/gameStore';
import { AdSlot } from '../components/AdSlot';
import { AuthBadge } from '../components/AuthBadge';

export function Ranking() {
  const { playerName } = useGame();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [myUid, setMyUid] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [top, user] = await Promise.all([fetchTop(20), getCurrentUser()]);
      setEntries(top);
      setMyUid(user?.uid ?? null);
      setIsAnonymous(!user || user.isAnonymous);
    } catch (err) {
      console.error(err);
      setError('Não consegui carregar o ranking. Tente de novo em instantes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`);

  return (
    <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden">
      <div className="absolute inset-0 clouds-bg pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto p-4 md:p-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="h-10 px-4 rounded-full bg-white/85 shadow-pop flex items-center gap-2 hover:scale-105 active:scale-95 transition"
          >
            🏠 <span className="font-bold">Início</span>
          </Link>
          <button
            onClick={load}
            className="h-10 px-4 rounded-full bg-grape text-white shadow-pop flex items-center gap-2 hover:scale-105 active:scale-95 transition font-bold"
            disabled={loading}
          >
            {loading ? '⏳ Atualizando...' : '🔄 Atualizar'}
          </button>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/95 rounded-3xl shadow-bubbly p-5 md:p-7"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mascot mood="cheer" size={80} />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-candy">Ranking 🏆</h1>
              <p className="text-sm text-gray-600">Top 20 digitadores de todos os tempos.</p>
            </div>
          </div>

          {error && (
            <div className="bg-coral/10 text-coral rounded-2xl p-3 mb-3 text-sm">{error}</div>
          )}

          {isAnonymous && (
            <div className="bg-sun/20 rounded-2xl p-4 mb-3 text-sm text-gray-700 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1">
                <b>Você não está no ranking 😊</b>
                <div className="text-xs text-gray-600 mt-0.5">
                  Pra aparecer aqui (e salvar progresso em qualquer aparelho), entre com sua conta Google:
                </div>
              </div>
              <AuthBadge />
            </div>
          )}
          {!isAnonymous && !playerName && (
            <div className="bg-sun/20 rounded-2xl p-3 mb-3 text-sm text-gray-700">
              Escreva seu nome na tela inicial pra aparecer aqui! 😉
            </div>
          )}

          {loading && !entries && (
            <div className="text-center py-10 text-gray-500">Carregando campeões…</div>
          )}

          {entries && entries.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              Ninguém jogou ainda. <br />Seja o primeiro! 🚀
            </div>
          )}

          {entries && entries.length > 0 && (
            <ol className="space-y-2">
              {entries.map((e, i) => {
                const mine = myUid && e.uid === myUid;
                return (
                  <motion.li
                    key={e.uid}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl ${
                      mine ? 'bg-grass/15 ring-2 ring-grass' : i < 3 ? 'bg-sun/15' : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-10 text-center text-lg font-bold">{medal(i)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">
                        {e.name}
                        {mine && <span className="ml-1 text-xs text-grass">(você)</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-sun/80 rounded-full px-2.5 py-0.5 font-bold shadow-pop">
                      ⭐ {e.totalStars}
                    </div>
                    <div className="hidden sm:flex items-center gap-1 bg-sky2 rounded-full px-2.5 py-0.5 font-bold">
                      ⚡ {Math.round(e.bestWpm)}
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          )}

          <p className="text-[11px] text-gray-400 text-center mt-5">
            O placar atualiza sozinho conforme você ganha estrelas. Seu nome aparece só se estiver preenchido na tela inicial.
          </p>
        </motion.div>

        <AdSlot slotId={import.meta.env.VITE_ADSENSE_SLOT_RANKING as string | undefined} />
      </div>
    </div>
  );
}
