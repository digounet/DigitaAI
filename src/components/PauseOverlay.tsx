import { motion } from 'framer-motion';
import { Mascot } from './Mascot';

type Props = {
  onResume: () => void;
  onHome: () => void;
  onRestart: () => void;
};

export function PauseOverlay({ onResume, onHome, onRestart }: Props) {
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
            onClick={onResume}
            className="py-3 rounded-2xl bg-grass text-white font-bold text-lg hover:scale-[1.02] transition"
          >
            ▶️ Continuar
          </button>
          <button
            onClick={onRestart}
            className="py-3 rounded-2xl bg-sun font-bold hover:scale-[1.02] transition"
          >
            🔁 Recomeçar lição
          </button>
          <button
            onClick={onHome}
            className="py-3 rounded-2xl bg-gray-200 font-bold hover:bg-gray-300 transition"
          >
            🏠 Ir pro início
          </button>
        </div>
        <p className="mt-4 text-xs text-gray-400">dica: pressione <kbd className="bg-gray-100 px-1 py-0.5 rounded">Esc</kbd> pra pausar ou continuar</p>
      </motion.div>
    </div>
  );
}
