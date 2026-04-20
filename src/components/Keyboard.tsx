import { motion } from 'framer-motion';
import { FINGER_COLORS, KEY_FINGER, KEY_ROWS } from '../data/fingers';

type Props = {
  highlight?: string;     // tecla que o aluno deve pressionar
  lastPressed?: string;   // animar brevemente ao pressionar
  showFingers?: boolean;  // cores por dedo
  compact?: boolean;      // versão menor
};

/**
 * Teclado virtual responsivo. Destaca a próxima tecla (highlight)
 * e colore cada tecla com a cor do dedo responsável quando showFingers=true.
 */
export function Keyboard({ highlight, lastPressed, showFingers = true, compact = false }: Props) {
  const target = highlight?.toLowerCase();
  const pressed = lastPressed?.toLowerCase();

  const keySize = compact ? 'h-9 text-sm min-w-[2rem]' : 'h-11 md:h-14 text-base md:text-lg min-w-[2.25rem] md:min-w-[2.75rem]';
  const offsets = ['', 'ml-4', 'ml-10'];

  return (
    <div className="select-none w-full max-w-3xl mx-auto p-2 md:p-4 rounded-3xl bg-white/60 backdrop-blur shadow-bubbly">
      {KEY_ROWS.map((row, ri) => (
        <div key={ri} className={`flex justify-center gap-1 md:gap-1.5 my-1 ${offsets[ri]}`}>
          {row.map((k) => {
            const isTarget = target === k;
            const isPressed = pressed === k;
            const finger = KEY_FINGER[k];
            const color = showFingers && finger ? FINGER_COLORS[finger] : 'bg-white text-gray-700';
            return (
              <motion.div
                key={k}
                animate={isPressed ? { scale: 0.85, y: 4 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className={`flex-1 ${keySize} rounded-xl ${color} ${
                  isTarget ? 'ring-4 ring-yellow-400 animate-wiggle' : 'shadow-pop'
                } flex items-center justify-center font-bold uppercase`}
              >
                {k}
              </motion.div>
            );
          })}
        </div>
      ))}
      {/* Barra de espaço */}
      <div className="flex justify-center mt-2">
        <motion.div
          animate={pressed === ' ' ? { scale: 0.97, y: 3 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={`h-9 md:h-10 w-2/3 rounded-xl bg-gray-200 shadow-pop flex items-center justify-center text-gray-700 text-xs md:text-sm ${
            target === ' ' ? 'ring-4 ring-yellow-400' : ''
          }`}
        >
          espaço
        </motion.div>
      </div>
    </div>
  );
}
