import { motion } from 'framer-motion';

type Props = {
  word: string;
  typed: string;
  color: string;
  x: number;
  duration: number;
  onEnd: () => void;
  popped?: boolean;
};

const PALETTE = ['#ff8c42', '#ffd84d', '#ff6fa5', '#a78bfa', '#7ed957', '#7fd4ff', '#5eead4', '#ff7a7a'];

export function pieColor(i: number) {
  return PALETTE[i % PALETTE.length];
}

export function Pie({ word, typed, color, x, duration, onEnd, popped }: Props) {
  if (popped) {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: `${x}%` }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 2, opacity: 0, rotate: 25 }}
        transition={{ duration: 0.4 }}
      >
        <PieSVG word={word} typed={typed} color={color} done />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute select-none"
      style={{ left: `${x}%` }}
      initial={{ bottom: '-180px' }}
      animate={{ bottom: '110%' }}
      transition={{ duration, ease: 'linear' }}
      onAnimationComplete={onEnd}
    >
      <PieSVG word={word} typed={typed} color={color} />
    </motion.div>
  );
}

function PieSVG({ word, typed, color, done }: { word: string; typed: string; color: string; done?: boolean }) {
  const maxLen = Math.max(word.length, 6);
  const w = Math.max(140, maxLen * 18 + 40);
  return (
    <div style={{ width: w }} className="flex flex-col items-center">
      <svg viewBox="0 0 100 80" width="120" height="96" style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.18))' }}>
        {/* base da tortinha */}
        <ellipse cx="50" cy="68" rx="44" ry="10" fill="#8b5a2b" />
        <path
          d="M6 60 Q50 28 94 60 L90 68 Q50 80 10 68 Z"
          fill={color}
          stroke="#7a3e00"
          strokeWidth="2"
        />
        {/* borda crocante */}
        <path d="M6 60 Q50 54 94 60" stroke="#d2a679" strokeWidth="3" fill="none" />
        {/* creme em cima */}
        <circle cx="50" cy="42" r="10" fill="#fff8e7" />
        <circle cx="50" cy="38" r="5" fill="#ff4f88" />
        {/* cara fofa */}
        <circle cx="38" cy="58" r="2" fill="#333" />
        <circle cx="62" cy="58" r="2" fill="#333" />
        <path d="M44 66 Q50 70 56 66" stroke="#333" strokeWidth="1.5" fill="none" />
        {done && <text x="50" y="30" fontSize="18" textAnchor="middle">💥</text>}
      </svg>
      <div className="mt-1 px-3 py-1.5 rounded-xl bg-white/90 shadow-pop font-bold text-lg flex">
        {word.split('').map((ch, i) => {
          const matched = i < typed.length && typed[i].toLowerCase() === ch.toLowerCase();
          const cursor = i === typed.length;
          return (
            <span
              key={i}
              className={`${matched ? 'text-grass' : 'text-gray-700'} ${cursor ? 'underline decoration-candy decoration-4 underline-offset-2' : ''}`}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
}
