import { motion } from 'framer-motion';

type Props = {
  mood?: 'happy' | 'cheer' | 'sad' | 'wave';
  size?: number;
};

/**
 * Mascote SVG inline — um polvinho simpático cuja expressão muda
 * conforme o humor. Sem dependência de imagens externas.
 */
export function Mascot({ mood = 'happy', size = 140 }: Props) {
  const eye = mood === 'sad' ? '–' : '•';
  const mouth =
    mood === 'cheer'
      ? 'M28 44 Q40 58 52 44'
      : mood === 'sad'
      ? 'M28 50 Q40 40 52 50'
      : 'M28 44 Q40 52 52 44';

  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={
        mood === 'cheer'
          ? { y: [0, -10, 0], rotate: [-4, 4, -4] }
          : mood === 'wave'
          ? { rotate: [-4, 4, -4] }
          : { y: [0, -6, 0] }
      }
      transition={{ repeat: Infinity, duration: mood === 'cheer' ? 0.6 : 2.2 }}
    >
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <defs>
          <radialGradient id="body" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffb8d6" />
            <stop offset="100%" stopColor="#ff6fa5" />
          </radialGradient>
        </defs>
        {/* tentáculos */}
        {Array.from({ length: 6 }).map((_, i) => {
          const x = 14 + i * 10;
          return (
            <path
              key={i}
              d={`M${x} 60 Q${x + 2} 72 ${x + 5} 78`}
              stroke="url(#body)"
              strokeWidth={6}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}
        {/* corpo */}
        <circle cx="40" cy="38" r="28" fill="url(#body)" />
        {/* bochechas */}
        <circle cx="22" cy="44" r="4" fill="#ff4f88" opacity="0.5" />
        <circle cx="58" cy="44" r="4" fill="#ff4f88" opacity="0.5" />
        {/* olhos */}
        <text x="26" y="40" fontSize="18" textAnchor="middle" fill="#222" fontFamily="Fredoka">
          {eye}
        </text>
        <text x="54" y="40" fontSize="18" textAnchor="middle" fill="#222" fontFamily="Fredoka">
          {eye}
        </text>
        {/* boca */}
        <path d={mouth} stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}
