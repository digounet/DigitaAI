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
import { canInstall, isStandalone, promptInstall } from '../pwa';

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  // Botão "Instalar app" — só aparece se o browser já disparou
  // `beforeinstallprompt` (via pwa.ts) e o app ainda não está em
  // modo standalone. Escutar os eventos permite reagir mesmo que
  // o prompt chegue depois do Home ter montado.
  const [installable, setInstallable] = useState<boolean>(canInstall() && !isStandalone());
  useEffect(() => {
    if (isStandalone()) return;
    const refresh = () => setInstallable(canInstall() && !isStandalone());
    window.addEventListener('pwa:installable', refresh);
    window.addEventListener('pwa:installed', refresh);
    return () => {
      window.removeEventListener('pwa:installable', refresh);
      window.removeEventListener('pwa:installed', refresh);
    };
  }, []);
  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome !== 'unavailable') setInstallable(false);
  };

  // Fecha o popover de ajustes ao clicar fora ou pressionar Esc.
  useEffect(() => {
    if (!settingsOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [settingsOpen]);

  const recommendedLevel = recommendedLevelId ? LEVELS.find((l) => l.id === recommendedLevelId) : null;

  /**
   * Próxima lição a jogar ("Continuar aqui"):
   *  - Se já jogou algo: pega o último nível registrado e, se ele ainda não
   *    tem estrela, volta pra ele; senão, avança pro próximo desbloqueado
   *    sem estrela DEPOIS dele.
   *  - Se nunca jogou mas fez o diagnóstico: aponta pro recomendado.
   *  - Caso contrário: começo absoluto.
   * Antes era "primeiro desbloqueado sem estrela", o que mandava a criança
   * de volta pro w1-l1 depois do diagnóstico ter desbloqueado vários níveis.
   */
  const nextUpId = useMemo(() => {
    let lastPlayedIdx = -1;
    for (let i = 0; i < LEVELS.length; i++) {
      if (scores[LEVELS[i].id]) lastPlayedIdx = i;
    }
    if (lastPlayedIdx >= 0) {
      const last = LEVELS[lastPlayedIdx];
      if ((scores[last.id]?.stars ?? 0) < 1) return last.id;
      for (let i = lastPlayedIdx + 1; i < LEVELS.length; i++) {
        if (!isUnlocked(LEVELS[i].id)) continue;
        if ((scores[LEVELS[i].id]?.stars ?? 0) < 1) return LEVELS[i].id;
      }
      return null;
    }
    if (recommendedLevelId) return recommendedLevelId;
    return LEVELS[0]?.id ?? null;
  }, [scores, isUnlocked, recommendedLevelId]);

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
        {/* Canto superior esquerdo — Ajustes (popover) */}
        <div ref={settingsRef} className="absolute top-4 left-4 z-20">
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            aria-label="Ajustes"
            title="Ajustes"
            className="h-10 w-10 rounded-full bg-white/85 shadow-pop flex items-center justify-center text-lg hover:scale-105 active:scale-95 transition"
          >
            ⚙️
          </button>
          {settingsOpen && (
            <motion.div
              role="dialog"
              aria-label="Ajustes"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.12 }}
              className="absolute top-12 left-0 z-30 bg-white rounded-2xl shadow-bubbly p-4 w-64 text-left"
            >
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1.5 px-1 uppercase tracking-wide">
                  Dificuldade
                </div>
                <div
                  role="radiogroup"
                  aria-label="Dificuldade"
                  className="flex bg-gray-100 rounded-full p-1 gap-1"
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
                        className={`flex-1 px-2 py-1.5 rounded-full text-xs font-bold transition ${
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

              <div className="mt-4">
                <div className="text-xs font-bold text-gray-500 mb-1.5 px-1 uppercase tracking-wide">
                  Áudio
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleMusic}
                    aria-pressed={musicOn}
                    className={`flex-1 rounded-full py-2 text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                      musicOn ? 'bg-mint' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    🎵 <span>{musicOn ? 'Música on' : 'Música off'}</span>
                  </button>
                  <button
                    onClick={toggleSound}
                    aria-pressed={soundOn}
                    className={`flex-1 rounded-full py-2 text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                      soundOn ? 'bg-sun' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {soundOn ? '🔊' : '🔇'} <span>{soundOn ? 'Som on' : 'Som off'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Canto superior direito — Conta */}
        <div className="absolute top-4 right-4 z-20">
          <AuthBadge />
        </div>

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

        {/* Linha 1 — Progresso */}
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
        </div>

        {/* Linha 2 — Nome do jogador */}
        <div className="mt-3 flex items-center justify-center">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 14))}
            placeholder="Seu nome"
            className="bg-white/85 rounded-full px-4 py-2 shadow-pop outline-none focus:ring-4 focus:ring-candy/40 text-center"
          />
        </div>

        {/* Linha 3 — Navegação principal.
            "Teste" só aparece aqui depois do diagnóstico; enquanto não foi
            feito, o banner logo abaixo já cumpre essa CTA com muito mais
            destaque. */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          {diagnosticDone && (
            <Link
              to="/test"
              className="bg-white/85 rounded-full px-4 py-2 shadow-pop hover:scale-105 active:scale-95 transition text-sm"
            >
              🎯 Refazer teste
            </Link>
          )}
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
          {installable && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleInstall}
              className="bg-mint text-gray-900 rounded-full px-4 py-2 shadow-pop hover:scale-105 active:scale-95 transition text-sm font-bold"
            >
              📲 Instalar app
            </motion.button>
          )}
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
        <div className="h-16 grass-bg relative">
          <div className="absolute inset-x-0 bottom-1 text-center text-[11px] text-white/90 font-semibold drop-shadow">
            © {new Date().getFullYear()} DigitAI · Pablo Rodrigo · Aprender a digitar brincando
          </div>
        </div>
      </footer>

      {donationOpen && <DonationModal onClose={() => setDonationOpen(false)} />}
    </div>
  );
}
