import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { playLevelUp, playStar } from '../audio/sfx';
import { Mascot } from './Mascot';
import { useModalKeyboardNav } from '../hooks/useModalKeyboardNav';

type Props = {
  stars: number;       // 0..3
  accuracy: number;    // 0..100
  wpm: number;
  onRetry: () => void;
  onNext?: () => void;
  onHome: () => void;
};

export function ResultModal({ stars, accuracy, wpm, onRetry, onNext, onHome }: Props) {
  useEffect(() => {
    playLevelUp();
    const ids: number[] = [];
    for (let i = 0; i < stars; i++) {
      ids.push(window.setTimeout(() => playStar(), 400 + i * 350));
    }
    return () => ids.forEach(clearTimeout);
  }, [stars]);

  // Ordem lógica de navegação: [Voltar, De novo, Próximo?].
  // Default: Próximo quando o nível avança (fluxo mais comum — criança passou
  // e quer continuar); caso contrário "De novo".
  const hasNext = !!onNext;
  const count = hasNext ? 3 : 2;
  const defaultIndex = hasNext ? 2 : 1;
  const { btnRef, focused } = useModalKeyboardNav(count, { defaultIndex });

  const msg =
    stars === 3 ? 'Incrível!' : stars === 2 ? 'Muito bem!' : stars === 1 ? 'Boa!' : 'Quase lá!';

  const ring = (i: number) =>
    focused === i ? 'ring-4 ring-grape/60 outline-none' : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="bg-white rounded-3xl shadow-bubbly max-w-md w-full p-6 md:p-8 text-center"
      >
        <div className="flex justify-center mb-2">
          <Mascot mood="cheer" size={110} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-candy">{msg}</h2>
        <div className="mt-4 flex justify-center gap-2 text-5xl">
          {[1, 2, 3].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -90 }}
              animate={i <= stars ? { scale: 1, rotate: 0 } : { scale: 0.7, rotate: 0, opacity: 0.3 }}
              transition={{ delay: 0.25 + i * 0.2, type: 'spring', stiffness: 300 }}
            >
              {i <= stars ? '⭐' : '☆'}
            </motion.span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="bg-sky2 rounded-2xl p-3">
            <div className="text-xs text-gray-600">Precisão</div>
            <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
          </div>
          <div className="bg-mint/70 rounded-2xl p-3">
            <div className="text-xs text-gray-600">Velocidade</div>
            <div className="text-2xl font-bold">{Math.round(wpm)} PPM</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            ref={btnRef(0)}
            onClick={onHome}
            className={`py-3 rounded-2xl bg-grass text-white font-bold text-lg hover:scale-[1.02] transition ${ring(0)}`}
          >
            🏠 Voltar ao mapa
          </button>
          <div className="flex gap-2">
            <button
              ref={btnRef(1)}
              onClick={onRetry}
              className={`flex-1 py-3 rounded-2xl bg-sun font-bold hover:scale-[1.02] transition ${ring(1)}`}
            >
              🔁 De novo
            </button>
            {onNext && (
              <button
                ref={btnRef(2)}
                onClick={onNext}
                className={`flex-1 py-3 rounded-2xl bg-white border-2 border-grape text-grape font-bold hover:bg-grape hover:text-white transition ${ring(2)}`}
              >
                Próximo ➡️
              </button>
            )}
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          use <kbd className="bg-gray-100 px-1 py-0.5 rounded">←→</kbd> pra escolher,{' '}
          <kbd className="bg-gray-100 px-1 py-0.5 rounded">Enter</kbd> pra confirmar
        </p>
      </motion.div>
    </div>
  );
}
