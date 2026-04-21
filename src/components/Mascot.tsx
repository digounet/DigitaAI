import { motion } from 'framer-motion';

type Mood = 'happy' | 'cheer' | 'sad' | 'wave';

type Props = {
  mood?: Mood;
  size?: number;
};

/**
 * Mascote DigitAI: uma corujinha simpática 🦉.
 * Corujas são clássicas em apps educativos e combinam com "aprender".
 * Renderizada 100% em SVG inline — sem assets externos.
 */
export function Mascot({ mood = 'happy', size = 140 }: Props) {
  const bounce =
    mood === 'cheer'
      ? { y: [0, -10, 0], rotate: [-5, 5, -5] }
      : mood === 'wave'
      ? { rotate: [-6, 6, -6] }
      : { y: [0, -5, 0] };

  const duration = mood === 'cheer' ? 0.6 : mood === 'wave' ? 1.4 : 2.4;

  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={bounce}
      transition={{ repeat: Infinity, duration, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.18))' }}>
        <defs>
          <linearGradient id="owl-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9874c" />
            <stop offset="100%" stopColor="#8a5226" />
          </linearGradient>
          <linearGradient id="owl-belly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff1d4" />
            <stop offset="100%" stopColor="#f6d99a" />
          </linearGradient>
          <radialGradient id="owl-eye" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1e9d6" />
          </radialGradient>
        </defs>

        {/* tufos de orelha */}
        <path d="M24 28 L18 12 L32 22 Z" fill="url(#owl-body)" />
        <path d="M76 28 L82 12 L68 22 Z" fill="url(#owl-body)" />

        {/* corpo (forma de pera) */}
        <path
          d="M20 50 Q20 20 50 20 Q80 20 80 50 Q82 82 50 88 Q18 82 20 50 Z"
          fill="url(#owl-body)"
          stroke="#5b3617"
          strokeWidth="1.5"
        />

        {/* barriga creme */}
        <path
          d="M32 54 Q32 42 50 42 Q68 42 68 54 Q70 78 50 82 Q30 78 32 54 Z"
          fill="url(#owl-belly)"
          opacity="0.95"
        />

        {/* asas laterais */}
        <motion.path
          d="M22 52 Q14 62 20 78 Q28 74 30 60 Z"
          fill="url(#owl-body)"
          stroke="#5b3617"
          strokeWidth="1.2"
          animate={mood === 'wave' || mood === 'cheer' ? { rotate: [0, -10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ transformOrigin: '22px 52px' }}
        />
        <motion.path
          d="M78 52 Q86 62 80 78 Q72 74 70 60 Z"
          fill="url(#owl-body)"
          stroke="#5b3617"
          strokeWidth="1.2"
          animate={mood === 'wave' || mood === 'cheer' ? { rotate: [0, 10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ transformOrigin: '78px 52px' }}
        />

        {/* "óculos" ao redor dos olhos — moldura clássica de coruja */}
        <ellipse cx="36" cy="46" rx="15" ry="14" fill="url(#owl-eye)" stroke="#5b3617" strokeWidth="2" />
        <ellipse cx="64" cy="46" rx="15" ry="14" fill="url(#owl-eye)" stroke="#5b3617" strokeWidth="2" />

        {/* olhos — mudam conforme mood */}
        <Eyes mood={mood} />

        {/* bico */}
        <Beak mood={mood} />

        {/* bochechas rosadas */}
        <circle cx="22" cy="60" r="3.5" fill="#ff8faa" opacity="0.65" />
        <circle cx="78" cy="60" r="3.5" fill="#ff8faa" opacity="0.65" />

        {/* patinhas */}
        <path d="M40 88 Q40 94 36 94 M40 88 Q40 94 44 94" stroke="#ff9e2c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M60 88 Q60 94 56 94 M60 88 Q60 94 64 94" stroke="#ff9e2c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    </motion.div>
  );
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'cheer') {
    // Olhos fechados sorridentes ^_^
    return (
      <>
        <path d="M30 46 Q36 40 42 46" stroke="#5b3617" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M58 46 Q64 40 70 46" stroke="#5b3617" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    );
  }
  if (mood === 'sad') {
    // Olhos fechados tristes
    return (
      <>
        <path d="M30 48 Q36 52 42 48" stroke="#5b3617" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M58 48 Q64 52 70 48" stroke="#5b3617" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    );
  }
  // happy / wave — olhos grandes com brilho, piscam ocasionalmente
  return (
    <>
      <motion.circle
        cx={36}
        cy={46}
        r={6}
        fill="#2b2b2b"
        animate={{ ry: [6, 6, 0.5, 6] }}
        transition={{ repeat: Infinity, duration: 4.5, times: [0, 0.93, 0.96, 1] }}
      />
      <motion.circle
        cx={64}
        cy={46}
        r={6}
        fill="#2b2b2b"
        animate={{ ry: [6, 6, 0.5, 6] }}
        transition={{ repeat: Infinity, duration: 4.5, times: [0, 0.93, 0.96, 1] }}
      />
      {/* reflexos brilhantes */}
      <circle cx="38" cy="43.5" r="2" fill="#ffffff" />
      <circle cx="66" cy="43.5" r="2" fill="#ffffff" />
    </>
  );
}

function Beak({ mood }: { mood: Mood }) {
  if (mood === 'cheer') {
    // Bico aberto sorrindo
    return (
      <path
        d="M46 58 Q50 66 54 58 Q54 64 50 66 Q46 64 46 58 Z"
        fill="#ff9e2c"
        stroke="#c96e00"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    );
  }
  if (mood === 'sad') {
    // Bico virado pra baixo
    return (
      <path
        d="M46 60 L50 56 L54 60 L52 64 L48 64 Z"
        fill="#ff9e2c"
        stroke="#c96e00"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    );
  }
  // happy / wave — bico normalzinho
  return (
    <path
      d="M46 58 L50 64 L54 58 Z"
      fill="#ff9e2c"
      stroke="#c96e00"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  );
}
