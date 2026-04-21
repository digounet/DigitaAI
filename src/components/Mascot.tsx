import { motion } from 'framer-motion';

type Mood = 'happy' | 'cheer' | 'sad' | 'wave';

type Props = {
  mood?: Mood;
  size?: number;
};

/**
 * Mascote DigitAI: uma corujinha 🦉 — estilo fofo, mas reconhecível como
 * coruja (disco facial em coração, plumagem em camadas, cores naturais).
 * Renderizado 100% em SVG inline.
 */
export function Mascot({ mood = 'happy', size = 140 }: Props) {
  const bounce =
    mood === 'cheer'
      ? { y: [0, -10, 0], rotate: [-5, 5, -5] }
      : mood === 'wave'
      ? { rotate: [-6, 6, -6] }
      : { y: [0, -4, 0] };

  const duration = mood === 'cheer' ? 0.6 : mood === 'wave' ? 1.4 : 2.4;

  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={bounce}
      transition={{ repeat: Infinity, duration, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ filter: 'drop-shadow(0 5px 8px rgba(92,66,40,0.25))' }}
      >
        <defs>
          <linearGradient id="owl-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d9ad7c" />
            <stop offset="100%" stopColor="#a37249" />
          </linearGradient>
          <linearGradient id="owl-belly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff5df" />
            <stop offset="100%" stopColor="#f3d9a4" />
          </linearGradient>
          <linearGradient id="owl-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffaec" />
            <stop offset="100%" stopColor="#f6e3bf" />
          </linearGradient>
        </defs>

        {/* tufos de orelha de coruja (arredondados, não pontudos) */}
        <path d="M25 22 Q20 10 30 12 Q34 18 32 26 Z" fill="url(#owl-body)" />
        <path d="M75 22 Q80 10 70 12 Q66 18 68 26 Z" fill="url(#owl-body)" />

        {/* corpo (forma de pera suave) */}
        <path
          d="M22 50
             Q22 22 50 22
             Q78 22 78 50
             Q80 84 50 88
             Q20 84 22 50 Z"
          fill="url(#owl-body)"
        />

        {/* PENAS em camadas (dão textura de coruja real) */}
        <path
          d="M26 58 Q30 62 34 58"
          fill="none"
          stroke="#8b5e38"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M38 60 Q42 64 46 60"
          fill="none"
          stroke="#8b5e38"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M54 60 Q58 64 62 60"
          fill="none"
          stroke="#8b5e38"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M66 58 Q70 62 74 58"
          fill="none"
          stroke="#8b5e38"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* disco facial em formato de coração (MARCA REGISTRADA das corujas) */}
        <path
          d="M30 36
             Q30 28 38 28
             Q46 28 50 34
             Q54 28 62 28
             Q70 28 70 36
             Q70 52 50 62
             Q30 52 30 36 Z"
          fill="url(#owl-face)"
          stroke="#a37249"
          strokeWidth="1.2"
        />

        {/* barriga creme com V característico */}
        <path
          d="M38 60 Q50 66 62 60 Q58 78 50 82 Q42 78 38 60 Z"
          fill="url(#owl-belly)"
          opacity="0.9"
        />

        {/* asinhas laterais (menores, mais naturais) */}
        <motion.path
          d="M20 54 Q16 64 20 76 Q26 72 28 62 Z"
          fill="url(#owl-body)"
          animate={mood === 'wave' || mood === 'cheer' ? { rotate: [0, -12, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ transformOrigin: '22px 54px' }}
        />
        <motion.path
          d="M80 54 Q84 64 80 76 Q74 72 72 62 Z"
          fill="url(#owl-body)"
          animate={mood === 'wave' || mood === 'cheer' ? { rotate: [0, 12, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ transformOrigin: '78px 54px' }}
        />

        {/* olhos (medianos, não gigantes) */}
        <Eyes mood={mood} />

        {/* bico */}
        <Beak mood={mood} />

        {/* bochechas suaves */}
        <circle cx="32" cy="48" r="3" fill="#ff9eb4" opacity="0.5" />
        <circle cx="68" cy="48" r="3" fill="#ff9eb4" opacity="0.5" />

        {/* patinhas */}
        <g fill="#e8a04c" stroke="#8b5e38" strokeWidth="1">
          <ellipse cx="42" cy="90" rx="5" ry="2.5" />
          <ellipse cx="58" cy="90" rx="5" ry="2.5" />
          <line x1="39" y1="90" x2="37" y2="93" strokeLinecap="round" />
          <line x1="42" y1="91" x2="42" y2="94" strokeLinecap="round" />
          <line x1="45" y1="90" x2="47" y2="93" strokeLinecap="round" />
          <line x1="55" y1="90" x2="53" y2="93" strokeLinecap="round" />
          <line x1="58" y1="91" x2="58" y2="94" strokeLinecap="round" />
          <line x1="61" y1="90" x2="63" y2="93" strokeLinecap="round" />
        </g>
      </svg>
    </motion.div>
  );
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'cheer') {
    return (
      <g stroke="#3a2412" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M36 42 Q42 38 46 42" />
        <path d="M54 42 Q58 38 64 42" />
      </g>
    );
  }
  if (mood === 'sad') {
    return (
      <g stroke="#3a2412" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M36 44 Q42 48 46 44" />
        <path d="M54 44 Q58 48 64 44" />
      </g>
    );
  }
  // happy / wave — olhos proporcionais (não gigantes), com brilho natural
  return (
    <g>
      <motion.circle
        cx={41}
        cy={42}
        r={4.5}
        fill="#3a2412"
        animate={{ ry: [4.5, 4.5, 0.4, 4.5] }}
        transition={{ repeat: Infinity, duration: 5, times: [0, 0.93, 0.96, 1] }}
      />
      <motion.circle
        cx={59}
        cy={42}
        r={4.5}
        fill="#3a2412"
        animate={{ ry: [4.5, 4.5, 0.4, 4.5] }}
        transition={{ repeat: Infinity, duration: 5, times: [0, 0.93, 0.96, 1] }}
      />
      {/* brilho pequeno, não de anime */}
      <circle cx="42.5" cy="40" r="1.3" fill="#ffffff" />
      <circle cx="60.5" cy="40" r="1.3" fill="#ffffff" />
    </g>
  );
}

function Beak({ mood }: { mood: Mood }) {
  if (mood === 'cheer') {
    // Bico aberto (cantando)
    return (
      <path
        d="M46 48 Q50 56 54 48 Q54 54 50 55 Q46 54 46 48 Z"
        fill="#e8a04c"
        stroke="#8b5e38"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    );
  }
  if (mood === 'sad') {
    return (
      <path
        d="M47 52 L50 48 L53 52 L51 54 L49 54 Z"
        fill="#e8a04c"
        stroke="#8b5e38"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    );
  }
  // happy / wave — bico curto e recurvado, claramente de coruja
  return (
    <path
      d="M47 48 L50 54 L53 48 Q50 50 47 48 Z"
      fill="#e8a04c"
      stroke="#8b5e38"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  );
}
