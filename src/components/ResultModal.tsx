import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { playLevelUp, playStar } from '../audio/sfx';
import { Mascot } from './Mascot';

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

  const msg =
    stars === 3 ? 'Incrível!' : stars === 2 ? 'Muito bem!' : stars === 1 ? 'Boa!' : 'Quase lá!';

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
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={onHome}
            className="flex-1 py-3 rounded-2xl bg-gray-200 font-bold hover:bg-gray-300 transition"
          >
            🏠 Início
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-2xl bg-sun font-bold hover:scale-[1.02] transition"
          >
            🔁 De novo
          </button>
          {onNext && (
            <button
              onClick={onNext}
              className="flex-1 py-3 rounded-2xl bg-grass text-white font-bold hover:scale-[1.02] transition"
            >
              Próximo ➡️
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
