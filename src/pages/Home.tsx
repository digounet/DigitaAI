import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mascot } from '../components/Mascot';
import { WORLDS, getLevelsByWorld, getPrevLevelId } from '../data/levels';
import { useGame } from '../store/gameStore';
import { useEffect } from 'react';
import { unlockAudio } from '../audio/sfx';

export function Home() {
  const { totalStars, scores, playerName, setPlayerName } = useGame();

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

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
          <span className="text-candy">Digita</span>
          <span className="text-grape">Aí!</span>
          <span className="ml-2">🎈</span>
        </motion.h1>
        <p className="mt-1 text-gray-700 text-lg">Aprender a digitar brincando</p>

        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
          <div className="bg-white/85 rounded-full px-4 py-2 shadow-pop flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <b className="text-xl">{totalStars()}</b>
            <span className="text-gray-500 text-sm">estrelinhas</span>
          </div>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 14))}
            placeholder="Seu nome"
            className="bg-white/85 rounded-full px-4 py-2 shadow-pop outline-none focus:ring-4 focus:ring-candy/40 text-center"
          />
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-3 md:px-6 py-6 pb-40">
        {WORLDS.map((world) => {
          const levels = getLevelsByWorld(world.id);
          return (
            <section key={world.id} className="mb-8">
              <div className={`rounded-3xl p-4 md:p-5 bg-gradient-to-br ${world.color} shadow-bubbly text-white`}>
                <div className="flex items-center gap-3">
                  <div className="text-4xl md:text-5xl">{world.emoji}</div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">Mundo {world.id} — {world.title}</h2>
                    <p className="text-sm opacity-90">{world.desc}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3">
                {levels.map((lv) => {
                  const prev = getPrevLevelId(lv);
                  const unlocked = !prev || (scores[prev]?.stars ?? 0) >= 1;
                  const score = scores[lv.id];
                  return (
                    <Link
                      key={lv.id}
                      to={unlocked ? `/play/${lv.id}` : '#'}
                      onClick={(e) => !unlocked && e.preventDefault()}
                      aria-disabled={!unlocked}
                      className={`group relative rounded-3xl p-3 md:p-4 text-center transition shadow-bubbly ${
                        unlocked
                          ? 'bg-white hover:-translate-y-1 hover:shadow-xl cursor-pointer'
                          : 'bg-white/50 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-3xl md:text-4xl mb-1">{lv.emoji}</div>
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
      </main>

      <div className="fixed bottom-3 right-3 z-20">
        <Mascot mood="wave" size={100} />
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="h-16 grass-bg" />
      </footer>
    </div>
  );
}
