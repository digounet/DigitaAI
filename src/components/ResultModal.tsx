import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { playLevelUp, playStar } from '../audio/sfx';
import { Mascot } from './Mascot';
import { useModalKeyboardNav } from '../hooks/useModalKeyboardNav';

type Props = {
  stars: number;       // 0..3
  accuracy: number;    // 0..100
  wpm: number;
  /** Meta de PPM do nível; ausente em modos sem alvo de velocidade (balões/tortas). */
  goalWpm?: number;
  onRetry: () => void;
  onNext?: () => void;
  onHome: () => void;
};

type MetricStatus = 'ok' | 'near' | 'low';

// Thresholds espelham starsFor() em useTypingStats.ts.
function accuracyStatus(acc: number, hasGoal: boolean): MetricStatus {
  if (acc >= 95) return 'ok';
  if (acc >= (hasGoal ? 85 : 80)) return 'near';
  return 'low';
}

function wpmStatus(wpm: number, goalWpm: number): MetricStatus {
  if (wpm >= goalWpm) return 'ok';
  if (wpm >= goalWpm * 0.7) return 'near';
  return 'low';
}

const STATUS_ICON: Record<MetricStatus, string> = { ok: '✅', near: '⚠️', low: '❌' };

function feedbackTip(
  stars: number,
  accSt: MetricStatus,
  wpmSt: MetricStatus | null,
  goalWpm?: number,
): string | null {
  if (stars === 3) return 'Perfeito! Precisão e velocidade nota 10! 🎯';
  if (goalWpm !== undefined && wpmSt) {
    const accOk = accSt === 'ok';
    const wpmOk = wpmSt === 'ok';
    if (accOk && !wpmOk)
      return `Você foi super preciso! Pra ganhar a 3ª ⭐ tente digitar um pouquinho mais rápido (meta: ${goalWpm} PPM).`;
    if (!accOk && wpmOk)
      return 'Você foi rápido! Agora tente errar menos letrinhas (meta: 95% de precisão).';
    return 'Dá pra melhorar os dois! Respira fundo e tenta de novo, com calma. 💪';
  }
  return 'Tente errar menos letrinhas pra ganhar mais estrelas (meta: 95% de precisão).';
}

export function ResultModal({ stars, accuracy, wpm, goalWpm, onRetry, onNext, onHome }: Props) {
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

  const accSt = accuracyStatus(accuracy, goalWpm !== undefined);
  const wpmSt = goalWpm !== undefined ? wpmStatus(wpm, goalWpm) : null;
  const tip = feedbackTip(stars, accSt, wpmSt, goalWpm);

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
        <div className="grid grid-cols-2 gap-3 mt-6 mb-3">
          <div className="bg-sky2 rounded-2xl p-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Precisão</span>
              <span aria-label={`status precisão: ${accSt}`}>{STATUS_ICON[accSt]}</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
            <div className="text-[11px] text-gray-500 mt-0.5">meta 95%</div>
          </div>
          <div className="bg-mint/70 rounded-2xl p-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Velocidade</span>
              {wpmSt && <span aria-label={`status velocidade: ${wpmSt}`}>{STATUS_ICON[wpmSt]}</span>}
            </div>
            <div className="text-2xl font-bold">{Math.round(wpm)} PPM</div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {goalWpm !== undefined ? `meta ${goalWpm} PPM` : 'sem meta'}
            </div>
          </div>
        </div>
        {tip && (
          <div className="bg-sun/30 border border-sun/60 rounded-2xl p-3 mb-5 text-sm text-gray-700">
            {tip}
          </div>
        )}
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
