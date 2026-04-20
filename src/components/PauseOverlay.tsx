import { motion } from 'framer-motion';
import { Mascot } from './Mascot';
import { useModalKeyboardNav } from '../hooks/useModalKeyboardNav';

type Props = {
  onResume: () => void;
  onHome: () => void;
  onRestart: () => void;
};

export function PauseOverlay({ onResume, onHome, onRestart }: Props) {
  // Sem onEscape: Esc no overlay de pausa NÃO resume. Saída só pelos botões.
  const { btnRef, focused } = useModalKeyboardNav(3, { defaultIndex: 0 });

  const ring = (i: number) =>
    focused === i ? 'ring-4 ring-grape/60 outline-none' : '';

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="bg-white rounded-3xl shadow-bubbly max-w-md w-full p-6 md:p-8 text-center"
      >
        <div className="flex justify-center mb-2">
          <Mascot mood="wave" size={110} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-grape">Pausado</h2>
        <p className="mt-2 text-gray-600">Descanse um pouquinho e volte quando quiser 💪</p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            ref={btnRef(0)}
            onClick={onResume}
            className={`py-3 rounded-2xl bg-grass text-white font-bold text-lg hover:scale-[1.02] transition ${ring(0)}`}
          >
            ▶️ Continuar
          </button>
          <button
            ref={btnRef(1)}
            onClick={onRestart}
            className={`py-3 rounded-2xl bg-sun font-bold hover:scale-[1.02] transition ${ring(1)}`}
          >
            🔁 Recomeçar lição
          </button>
          <button
            ref={btnRef(2)}
            onClick={onHome}
            className={`py-3 rounded-2xl bg-gray-200 font-bold hover:bg-gray-300 transition ${ring(2)}`}
          >
            🏠 Ir pro início
          </button>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          use <kbd className="bg-gray-100 px-1 py-0.5 rounded">↑↓</kbd> pra escolher,{' '}
          <kbd className="bg-gray-100 px-1 py-0.5 rounded">Enter</kbd> pra confirmar
        </p>
      </motion.div>
    </div>
  );
}
