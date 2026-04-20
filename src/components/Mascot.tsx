import { motion } from 'framer-motion';

type Mood = 'happy' | 'cheer' | 'sad' | 'wave';

type Props = {
  mood?: Mood;
  size?: number;
};

/**
 * Mascote DigitAI: um robozinho amigável (combina com o "AI" do nome).
 * Renderizado 100% em SVG inline — sem assets externos.
 *
 * Moods:
 *  - happy: expressão padrão
 *  - cheer: olhos em estrela e sorriso largo (comemoração)
 *  - sad:  olhos fechados e boca para baixo
 *  - wave: igual ao happy, mas a animação externa faz ele balançar
 */
export function Mascot({ mood = 'happy', size = 140 }: Props) {
  const bounce =
    mood === 'cheer'
      ? { y: [0, -10, 0], rotate: [-5, 5, -5] }
      : mood === 'wave'
      ? { rotate: [-6, 6, -6] }
      : { y: [0, -5, 0] };

  const bounceDuration = mood === 'cheer' ? 0.6 : mood === 'wave' ? 1.4 : 2.2;

  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={bounce}
      transition={{ repeat: Infinity, duration: bounceDuration, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.18))' }}>
        <defs>
          <linearGradient id="mascot-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9ee5ff" />
            <stop offset="100%" stopColor="#5a8cff" />
          </linearGradient>
          <radialGradient id="mascot-screen" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#2d3466" />
            <stop offset="100%" stopColor="#121636" />
          </radialGradient>
          <radialGradient id="mascot-antenna" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffe877" />
            <stop offset="100%" stopColor="#ff9e2c" />
          </radialGradient>
        </defs>

        {/* antena pulsante */}
        <motion.g
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 8px' }}
        >
          <line x1="50" y1="12" x2="50" y2="22" stroke="#4a7ae0" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="8" r="4.5" fill="url(#mascot-antenna)" />
          <circle cx="48.5" cy="6.5" r="1.2" fill="#fff8c2" />
        </motion.g>

        {/* orelhas laterais (antenas de áudio) */}
        <rect x="8" y="42" width="8" height="18" rx="3" ry="3" fill="#4a7ae0" />
        <rect x="84" y="42" width="8" height="18" rx="3" ry="3" fill="#4a7ae0" />

        {/* cabeça */}
        <rect
          x="16"
          y="22"
          width="68"
          height="60"
          rx="16"
          ry="16"
          fill="url(#mascot-body)"
          stroke="#3b68d2"
          strokeWidth="1.5"
        />

        {/* visor (tela) */}
        <rect x="22" y="30" width="56" height="34" rx="10" ry="10" fill="url(#mascot-screen)" />
        {/* reflexo no visor */}
        <path d="M26 34 Q33 30 42 32 L40 40 Q32 38 26 42 Z" fill="#ffffff" opacity="0.15" />

        {/* olhos — mudam de forma conforme o mood */}
        <Eyes mood={mood} />

        {/* bochechas */}
        <circle cx="20" cy="68" r="4.5" fill="#ff6fa5" opacity="0.7" />
        <circle cx="80" cy="68" r="4.5" fill="#ff6fa5" opacity="0.7" />

        {/* boca */}
        <Mouth mood={mood} />

        {/* parafusos decorativos */}
        <circle cx="22" cy="28" r="1.4" fill="#3b68d2" />
        <circle cx="78" cy="28" r="1.4" fill="#3b68d2" />
        <circle cx="22" cy="76" r="1.4" fill="#3b68d2" />
        <circle cx="78" cy="76" r="1.4" fill="#3b68d2" />
      </svg>
    </motion.div>
  );
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'cheer') {
    // Olhos em estrela (^_^)
    return (
      <>
        <Star cx={36} cy={47} r={6} />
        <Star cx={64} cy={47} r={6} />
      </>
    );
  }
  if (mood === 'sad') {
    // Olhos fechados / tristes
    return (
      <>
        <path d="M30 47 Q36 44 42 47" stroke="#9ee5ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M58 47 Q64 44 70 47" stroke="#9ee5ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    );
  }
  // happy / wave — olhos redondos com brilho
  return (
    <>
      <motion.circle
        cx={36}
        cy={47}
        r={6}
        fill="#9ee5ff"
        animate={{ r: [6, 6, 1.2, 6] }}
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.92, 0.96, 1], ease: 'easeInOut' }}
      />
      <motion.circle
        cx={64}
        cy={47}
        r={6}
        fill="#9ee5ff"
        animate={{ r: [6, 6, 1.2, 6] }}
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.92, 0.96, 1], ease: 'easeInOut' }}
      />
      <circle cx="37.8" cy="45" r="1.8" fill="#ffffff" />
      <circle cx="65.8" cy="45" r="1.8" fill="#ffffff" />
    </>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  if (mood === 'cheer') {
    return (
      <path
        d="M36 70 Q50 82 64 70 Q50 76 36 70 Z"
        fill="#ff6fa5"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    );
  }
  if (mood === 'sad') {
    return (
      <path
        d="M38 76 Q50 70 62 76"
        stroke="#ffffff"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  // happy / wave
  return (
    <path
      d="M38 70 Q50 78 62 70"
      stroke="#ffffff"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
  );
}

/** Estrela de 4 pontas usada nos olhos do mood cheer. */
function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const d = `
    M${cx} ${cy - r}
    Q${cx + r * 0.3} ${cy - r * 0.3} ${cx + r} ${cy}
    Q${cx + r * 0.3} ${cy + r * 0.3} ${cx} ${cy + r}
    Q${cx - r * 0.3} ${cy + r * 0.3} ${cx - r} ${cy}
    Q${cx - r * 0.3} ${cy - r * 0.3} ${cx} ${cy - r} Z
  `;
  return <path d={d} fill="#ffe877" stroke="#ffffff" strokeWidth="1" />;
}
