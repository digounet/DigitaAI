import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mascot } from '../components/Mascot';
import { AuthBadge } from '../components/AuthBadge';
import { AdSlot } from '../components/AdSlot';
import { DonationModal } from '../components/DonationModal';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WORLDS, getLevelsByWorld, LEVELS } from '../data/levels';
import { useGame } from '../store/gameStore';
import { unlockAudio } from '../audio/sfx';
import { useToolbarKeyboardNav } from '../hooks/useToolbarKeyboardNav';

export function Home() {
  const {
    totalStars,
    scores,
    playerName,
    setPlayerName,
    diagnosticDone,
    recommendedLevelId,
    isUnlocked,
    soundOn,
    musicOn,
    toggleSound,
    toggleMusic,
    difficulty,
    setDifficulty,
  } = useGame();

  useEffect(() => {
    const unlock = () => unlockAudio();
    // iOS exige touchstart. Adicionamos em várias camadas pra garantir
    // que o primeiro gesto (qualquer ele) destrave o áudio.
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('click', unlock, { once: true });
    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('click', unlock);
    };
  }, []);

  const [donationOpen, setDonationOpen] = useState(false);

  const recommendedLevel = recommendedLevelId ? LEVELS.find((l) => l.id === recommendedLevelId) : null;

  /**
   * Próxima lição a jogar = primeira desbloqueada sem ≥1 estrela.
   * É o "Continuar aqui".
   */
  const nextUpId = useMemo(() => {
    for (const lv of LEVELS) {
      if (!isUnlocked(lv.id)) continue;
      if ((scores[lv.id]?.stars ?? 0) < 1) return lv.id;
    }
    return null;
  }, [scores, isUnlocked]);

  const nextUpLevel = nextUpId ? LEVELS.find((l) => l.id === nextUpId) : null;

  /** Rola até o card do próximo nível ao carregar. */
  const nextRef = useRef<HTMLAnchorElement | null>(null);
  useEffect(() => {
    if (nextRef.current) {
      nextRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [nextUpId]);

  const globalStats = useMemo(() => {
    const completed = LEVELS.filter((l) => (scores[l.id]?.stars ?? 0) >= 1).length;
    return { completed, total: LEVELS.length };
  }, [scores]);

  // ---- Navegação por teclado nos cards de lição ----
  // Só considera níveis desbloqueados (lock não é interativo).
  const unlockedIds = useMemo(() => LEVELS.filter((l) => isUnlocked(l.id)).map((l) => l.id), [isUnlocked]);
  const cardIndexById = useMemo(() => {
    const m = new Map<string, number>();
    unlockedIds.forEach((id, i) => m.set(id, i));
    return m;
  }, [unlockedIds]);
  // Pulo vertical = tamanho médio do mundo. Aproximado em 5 (média das colunas
  // no desktop). No mobile a coluna muda mas ↑↓ continua movendo "bastante".
  const { btnRef: cardRef, focused: focusedCard, setFocused: setFocusedCard } = useToolbarKeyboardNav(
    unlockedIds.length,
    { verticalStep: 5, scrollIntoView: true }
  );

  // Ao carregar a Home, já destaca o card "continuar" pra dar contexto.
  useEffect(() => {
    if (!nextUpId) return;
    const idx = cardIndexById.get(nextUpId);
    if (idx !== undefined) setFocusedCard(idx);
  }, [nextUpId, cardIndexById, setFocusedCard]);

  return (
    <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden">
      <div className="absolute inset-0 clouds-bg pointer-events-none" />

      <header className="relative z-10 pt-6 pb-2 px-4 text-center">
        <motion.h1
          initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: -2 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="inline-block text-5xl md:text-7xl font-bold"
        >
          <span className="text-candy">Digit</span>
          <span className="text-grape">AI</span>
          <span className="ml-2">🎈</span>
        </motion.h1>
        <p className="mt-1 text-gray-700 text-lg">Aprender a digitar brincando</p>

        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
          <div className="bg-white/85 rounded-full px-4 py-2 shadow-pop flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <b className="text-xl">{totalStars()}</b>
            <span className="text-gray-500 text-sm">estrelinhas</span>
          </div>
          <div className="bg-white/85 rounded-full px-4 py-2 shadow-pop flex items-center gap-2">
            <span className="text-xl">📊</span>
            <b className="text-lg">{globalStats.completed}</b>
            <span className="text-gray-500 text-sm">/{globalStats.total} lições</span>
          </div>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 14))}
            placeholder="Seu nome"
            className="bg-white/85 rounded-full px-4 py-2 shadow-pop outline-none focus:ring-4 focus:ring-candy/40 text-center"
          />
          <Link
            to="/test"
            className="bg-white/85 rounded-full px-4 py-2 shadow-pop hover:scale-105 active:scale-95 transition text-sm"
          >
            🎯 Teste de nivelamento
          </Link>
          <Link
            to="/ranking"
            className="bg-white/85 rounded-full px-4 py-2 shadow-pop hover:scale-105 active:scale-95 transition text-sm"
          >
            🏆 Ranking
          </Link>
          <Link
            to="/pro"
            className="bg-gradient-to-r from-grape to-candy text-white rounded-full px-4 py-2 shadow-pop hover:scale-105 active:scale-95 transition text-sm font-bold"
          >
            ✨ Pro
          </Link>
          <button
            onClick={() => setDonationOpen(true)}
            className="bg-coral/90 text-white rounded-full px-4 py-2 shadow-pop hover:scale-105 active:scale-95 transition text-sm"
          >
            ❤️ Apoiar
          </button>
          <div
            role="radiogroup"
            aria-label="Dificuldade"
            title="Velocidade dos desafios"
            className="bg-white/85 rounded-full shadow-pop flex items-center p-1 gap-1"
          >
            {([
              { key: 'easy', emoji: '🐢', label: 'Fácil' },
              { key: 'normal', emoji: '🐰', label: 'Normal' },
              { key: 'hard', emoji: '🚀', label: 'Rápido' },
            ] as const).map((opt) => {
              const active = difficulty === opt.key;
              return (
                <button
                  key={opt.key}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDifficulty(opt.key)}
                  title={`${opt.label} — ${opt.key === 'easy' ? 'mais tempo pra digitar' : opt.key === 'hard' ? 'menos tempo, mais desafio' : 'velocidade padrão'}`}
                  className={`px-3 py-1 rounded-full text-sm font-bold transition ${
                    active ? 'bg-candy text-white shadow-pop' : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  <span className="mr-1">{opt.emoji}</span>
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={toggleMusic}
            title="Música"
            aria-label={musicOn ? 'Desligar música' : 'Ligar música'}
            className={`h-10 w-10 rounded-full shadow-pop flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition ${
              musicOn ? 'bg-mint' : 'bg-white text-gray-400'
            }`}
          >
            🎵
          </button>
          <button
            onClick={toggleSound}
            title="Efeitos sonoros"
            aria-label={soundOn ? 'Desligar som' : 'Ligar som'}
            className="h-10 w-10 rounded-full bg-white shadow-pop flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
          <AuthBadge />
        </div>

        {!diagnosticDone && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 mx-auto max-w-xl bg-white/90 rounded-3xl shadow-bubbly p-4 md:p-5 flex flex-col md:flex-row items-center gap-3"
          >
            <div className="text-5xl">🎯</div>
            <div className="text-left flex-1">
              <div className="font-bold text-lg">Nunca digitou antes? Ou já manja?</div>
              <div className="text-sm text-gray-600">
                Faça o teste rapidinho e eu te mando pro nível certo.
              </div>
            </div>
            <Link
              to="/test"
              className="bg-candy text-white font-bold px-5 py-3 rounded-2xl shadow-pop hover:scale-105 transition whitespace-nowrap"
            >
              Fazer o teste
            </Link>
          </motion.div>
        )}

        {nextUpLevel && (
          <div className="mt-4 mx-auto max-w-xl bg-gradient-to-r from-grass/90 to-mint/90 text-white rounded-3xl shadow-bubbly p-4 md:p-5 flex items-center gap-3">
            <div className="text-5xl">{nextUpLevel.emoji}</div>
            <div className="text-left flex-1">
              <div className="text-xs opacity-90">Continuar de onde parou</div>
              <div className="font-bold text-lg truncate">
                Mundo {nextUpLevel.world} · {nextUpLevel.title}
              </div>
            </div>
            <Link
              to={`/play/${nextUpLevel.id}`}
              className="bg-white text-grass font-bold px-5 py-3 rounded-2xl shadow-pop hover:scale-105 transition whitespace-nowrap"
            >
              Jogar ▶
            </Link>
          </div>
        )}

        {recommendedLevel && !nextUpLevel && (
          <div className="mt-3 text-sm text-gray-700">
            ✨ Recomendado pra você: <b>{recommendedLevel.emoji} {recommendedLevel.title}</b>
          </div>
        )}
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-3 md:px-6 py-6 pb-40">
        {WORLDS.map((world) => {
          const levels = getLevelsByWorld(world.id);
          const doneInWorld = levels.filter((l) => (scores[l.id]?.stars ?? 0) >= 1).length;
          const worldProgress = levels.length === 0 ? 0 : doneInWorld / levels.length;
          return (
            <section key={world.id} className="mb-8">
              <div className={`rounded-3xl p-4 md:p-5 bg-gradient-to-br ${world.color} shadow-bubbly text-white`}>
                <div className="flex items-center gap-3">
                  <div className="text-4xl md:text-5xl">{world.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-2xl font-bold">Mundo {world.id} — {world.title}</h2>
                    <p className="text-sm opacity-90">{world.desc}</p>
                  </div>
                  <div className="bg-white/25 rounded-2xl px-3 py-1.5 text-sm font-bold whitespace-nowrap">
                    {doneInWorld}/{levels.length}
                  </div>
                </div>
                <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${worldProgress * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3">
                {levels.map((lv, idx) => {
                  const unlocked = isUnlocked(lv.id);
                  const score = scores[lv.id];
                  const recommended = lv.id === recommendedLevelId;
                  const isNext = lv.id === nextUpId;
                  const cardIdx = cardIndexById.get(lv.id);
                  const isFocused = cardIdx !== undefined && cardIdx === focusedCard;
                  // Prioridade do ring: foco > começar aqui > continuar.
                  const ringCls = isFocused
                    ? 'ring-4 ring-grape'
                    : recommended
                    ? 'ring-4 ring-sun'
                    : isNext
                    ? 'ring-4 ring-grass'
                    : '';
                  return (
                    <Link
                      key={lv.id}
                      ref={(el) => {
                        if (isNext) nextRef.current = el;
                        if (unlocked && cardIdx !== undefined) cardRef(cardIdx)(el);
                      }}
                      to={unlocked ? `/play/${lv.id}` : '#'}
                      onClick={(e) => !unlocked && e.preventDefault()}
                      aria-disabled={!unlocked}
                      className={`group relative rounded-3xl p-3 md:p-4 text-center transition shadow-bubbly ${
                        unlocked
                          ? 'bg-white hover:-translate-y-1 hover:shadow-xl cursor-pointer'
                          : 'bg-white/50 cursor-not-allowed'
                      } ${ringCls}`}
                    >
                      {recommended && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sun text-gray-900 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-pop whitespace-nowrap">
                          ✨ começar aqui
                        </div>
                      )}
                      {isNext && !recommended && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-grass text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-pop whitespace-nowrap">
                          ▶ continuar
                        </div>
                      )}
                      <div className="text-[10px] text-gray-400 font-semibold">
                        {idx + 1}/{levels.length}
                      </div>
                      <div className="text-3xl md:text-4xl">{lv.emoji}</div>
                      <div className="font-bold text-sm md:text-base leading-tight">{lv.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{lv.subtitle}</div>
                      <div className="mt-2 text-base md:text-lg">
                        {[1, 2, 3].map((i) => (
                          <span key={i}>{(score?.stars ?? 0) >= i ? '⭐' : '☆'}</span>
                        ))}
                      </div>
                      {!unlocked && (
                        <div className="absolute inset-0 rounded-3xl flex items-center justify-center bg-black/10 text-3xl">
                          🔒
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        <AdSlot slotId={import.meta.env.VITE_ADSENSE_SLOT_HOME as string | undefined} />
      </main>

      <div className="fixed bottom-3 right-3 z-20">
        <Mascot mood="wave" size={100} />
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="h-16 grass-bg" />
      </footer>

      {donationOpen && <DonationModal onClose={() => setDonationOpen(false)} />}
    </div>
  );
}
