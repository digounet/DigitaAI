import { motion } from 'framer-motion';

type Props = {
  letter: string;
  color: string;
  x: number;              // 0..100 % da largura
  duration: number;       // tempo para subir
  onEnd: () => void;
  popped?: boolean;
  glow?: boolean;         // destacar o próximo alvo
};

const BALLOON_PALETTE = [
  '#ff7a7a', '#ff8c42', '#ffd84d', '#7ed957',
  '#5eead4', '#7fd4ff', '#a78bfa', '#ff6fa5',
];

export function balloonColor(i: number) {
  return BALLOON_PALETTE[i % BALLOON_PALETTE.length];
}

export function Balloon({ letter, color, x, duration, onEnd, popped, glow }: Props) {
  if (popped) {
    return (
      <motion.div
        className="absolute pointer-events-none select-none"
        style={{ left: `${x}%` }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <BalloonSVG letter={letter} color={color} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute select-none"
      style={{ left: `${x}%` }}
      initial={{ bottom: '-160px' }}
      animate={{ bottom: '110%' }}
      transition={{ duration, ease: 'linear' }}
      onAnimationComplete={onEnd}
    >
      <div className={glow ? 'drop-shadow-[0_0_18px_rgba(255,255,255,0.9)] animate-float' : 'animate-float'}>
        <BalloonSVG letter={letter} color={color} />
      </div>
    </motion.div>
  );
}

function BalloonSVG({ letter, color }: { letter: string; color: string }) {
  return (
    <svg width="96" height="128" viewBox="0 0 96 128" style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.15))' }}>
      <defs>
        <radialGradient id={`g-${color}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffffcc" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      {/* Balão */}
      <path
        d="M48 4 C22 4 8 26 8 48 C8 74 30 90 44 92 L44 98 L52 98 L52 92 C66 90 88 74 88 48 C88 26 74 4 48 4 Z"
        fill={`url(#g-${color})`}
      />
      {/* Nozinho */}
      <path d="M44 98 L52 98 L50 106 L46 106 Z" fill="#00000055" />
      {/* Barbante */}
      <path d="M48 106 Q40 118 52 128" stroke="#ffffffaa" strokeWidth="1.5" fill="none" />
      {/* Letra */}
      <text
        x="48"
        y="58"
        textAnchor="middle"
        fontSize="34"
        fontWeight="700"
        fill="#fff"
        fontFamily="Fredoka"
        style={{ textTransform: 'uppercase' }}
      >
        {letter}
      </text>
    </svg>
  );
}
