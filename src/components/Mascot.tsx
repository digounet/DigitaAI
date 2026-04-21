import { motion } from 'framer-motion';

type Mood = 'happy' | 'cheer' | 'sad' | 'wave';

type Props = {
  mood?: Mood;
  size?: number;
};

/**
 * Mascote DigitAI: uma corujinha kawaii 🦉💜
 * Estilo "chibi" fofinho — cabeça grande, olhos expressivos, cores pastéis
 * lilás/creme. Renderizada 100% em SVG inline.
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
        style={{ filter: 'drop-shadow(0 6px 10px rgba(168,120,220,0.35))' }}
      >
        <defs>
          <radialGradient id="owl-body" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#e5cdff" />
            <stop offset="60%" stopColor="#c8a8ee" />
            <stop offset="100%" stopColor="#a485d4" />
          </radialGradient>
          <linearGradient id="owl-belly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff5e0" />
            <stop offset="100%" stopColor="#ffe4c4" />
          </linearGradient>
          <radialGradient id="owl-eye" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#4a3060" />
            <stop offset="100%" stopColor="#1a0f28" />
          </radialGradient>
          <radialGradient id="owl-cheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffbcd2" />
            <stop offset="100%" stopColor="#ff9fc2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* tufos arredondados — não pontudos, pra ficar mais meigo */}
        <ellipse cx="28" cy="18" rx="7" ry="8" fill="url(#owl-body)" transform="rotate(-20 28 18)" />
        <ellipse cx="72" cy="18" rx="7" ry="8" fill="url(#owl-body)" transform="rotate(20 72 18)" />

        {/* corpinho — cabeça e corpo integrados em formato de ovo */}
        <ellipse cx="50" cy="54" rx="38" ry="38" fill="url(#owl-body)" />

        {/* barriga creme */}
        <path
          d="M30 58
             Q30 44 42 42
             Q50 41 50 48
             Q50 41 58 42
             Q70 44 70 58
             Q72 78 50 84
             Q28 78 30 58 Z"
          fill="url(#owl-belly)"
        />

        {/* asinhas pequenas e arredondadas */}
        <motion.ellipse
          cx="15"
          cy="58"
          rx="7"
          ry="12"
          fill="url(#owl-body)"
          animate={mood === 'wave' || mood === 'cheer' ? { rotate: [0, -15, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ transformOrigin: '15px 50px' }}
        />
        <motion.ellipse
          cx="85"
          cy="58"
          rx="7"
          ry="12"
          fill="url(#owl-body)"
          animate={mood === 'wave' || mood === 'cheer' ? { rotate: [0, 15, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ transformOrigin: '85px 50px' }}
        />

        {/* bochechas rosadas */}
        <ellipse cx="25" cy="52" rx="9" ry="6" fill="url(#owl-cheek)" />
        <ellipse cx="75" cy="52" rx="9" ry="6" fill="url(#owl-cheek)" />

        {/* olhos */}
        <Eyes mood={mood} />

        {/* biquinho */}
        <Beak mood={mood} />

        {/* patinhas */}
        <g fill="#ffb578">
          <ellipse cx="42" cy="90" rx="5" ry="3" />
          <ellipse cx="58" cy="90" rx="5" ry="3" />
        </g>

        {/* brilho no topo */}
        <ellipse cx="38" cy="28" rx="10" ry="6" fill="#ffffff" opacity="0.25" />
      </svg>
    </motion.div>
  );
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'cheer') {
    return (
      <g stroke="#3a2a52" strokeWidth="2.8" strokeLinecap="round" fill="none">
        <path d="M22 48 Q32 42 42 48" />
        <path d="M58 48 Q68 42 78 48" />
      </g>
    );
  }
  if (mood === 'sad') {
    return (
      <g>
        <g stroke="#3a2a52" strokeWidth="2.8" strokeLinecap="round" fill="none">
          <path d="M22 52 Q32 58 42 52" />
          <path d="M58 52 Q68 58 78 52" />
        </g>
        <path d="M36 56 Q38 62 36 66 Q34 62 36 56 Z" fill="#7fd4ff" />
      </g>
    );
  }
  // happy / wave — olhos grandes kawaii
  return (
    <g>
      <circle cx="32" cy="50" r="11" fill="#ffffff" />
      <circle cx="68" cy="50" r="11" fill="#ffffff" />
      <motion.circle
        cx={32}
        cy={50}
        r={8.5}
        fill="url(#owl-eye)"
        animate={{ ry: [8.5, 8.5, 0.5, 8.5] }}
        transition={{ repeat: Infinity, duration: 5, times: [0, 0.93, 0.96, 1] }}
      />
      <motion.circle
        cx={68}
        cy={50}
        r={8.5}
        fill="url(#owl-eye)"
        animate={{ ry: [8.5, 8.5, 0.5, 8.5] }}
        transition={{ repeat: Infinity, duration: 5, times: [0, 0.93, 0.96, 1] }}
      />
      <circle cx="35" cy="46" r="3" fill="#ffffff" />
      <circle cx="71" cy="46" r="3" fill="#ffffff" />
      <circle cx="29" cy="54" r="1.4" fill="#ffffff" opacity="0.8" />
      <circle cx="65" cy="54" r="1.4" fill="#ffffff" opacity="0.8" />
    </g>
  );
}

function Beak({ mood }: { mood: Mood }) {
  if (mood === 'cheer') {
    return (
      <path
        d="M46 62 Q50 70 54 62 Q54 68 50 69 Q46 68 46 62 Z"
        fill="#ff9e4c"
      />
    );
  }
  if (mood === 'sad') {
    return <path d="M47 66 Q50 62 53 66 Q51 68 49 68 Z" fill="#ff9e4c" />;
  }
  return (
    <path d="M47 62 Q50 60 53 62 Q51 66 50 67 Q49 66 47 62 Z" fill="#ff9e4c" />
  );
}
