import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard } from '../components/Keyboard';
import { HUD } from '../components/HUD';
import { ResultModal } from '../components/ResultModal';
import { Mascot } from '../components/Mascot';
import { PauseOverlay } from '../components/PauseOverlay';
import type { Level } from '../data/levels';
import { getLessonPosition, getWorldMeta, levelHasDigits } from '../data/levels';
import { useTypingStats, starsFor } from '../hooks/useTypingStats';
import { useTypingInput } from '../hooks/useTypingInput';
import { playError, playKey, playPop, playStar, playWordDone, unlockAudio } from '../audio/sfx';

type Props = {
  level: Level;
  onFinish: (stars: number, wpm: number, accuracy: number) => void;
  onHome: () => void;
  onRetry: () => void;
  onNext?: () => void;
};

function baseKey(ch: string): string {
  return ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

type Burst = { id: number; emoji: string };

/**
 * ClimbMode — subir uma "montanha de nuvens":
 *  - Cada palavra digitada sem erro = sobe 1 nuvem.
 *  - Palavra com erro = desce 1 (mínimo 0).
 *  - Chegar no topo (posição >= target) = vitória.
 *
 * As nuvens são desenhadas em zig-zag e o robozinho pula entre elas.
 */
export function ClimbMode({ level, onFinish, onHome, onRetry, onNext }: Props) {
  const totalClouds = Math.max(5, level.target);

  const pickWord = () => level.pool[Math.floor(Math.random() * level.pool.length)];

  const [position, setPosition] = useState(0);
  const [word, setWord] = useState<string>(() => pickWord());
  const [typed, setTyped] = useState('');
  const [errorsOnWord, setErrorsOnWord] = useState(false);
  const [lastKey, setLastKey] = useState<string | undefined>();
  const [finished, setFinished] = useState<null | { stars: number; wpm: number; accuracy: number }>(null);
  const [paused, setPaused] = useState(false);
  const [moveDir, setMoveDir] = useState<'up' | 'down' | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstIdRef = useRef(0);
  const { stats, registerHit, registerMiss, reset } = useTypingStats();

  const finishedRef = useRef(false);
  const pausedRef = useRef(false);
  const wordRef = useRef(word);
  const typedRef = useRef(typed);
  const positionRef = useRef(position);
  const errorsOnWordRef = useRef(false);
  finishedRef.current = !!finished;
  pausedRef.current = paused;
  wordRef.current = word;
  typedRef.current = typed;
  positionRef.current = position;
  errorsOnWordRef.current = errorsOnWord;

  // Nudge pós-mount, como nos outros modes.
  useEffect(() => {
    window.scrollTo(0, 0);
    const id = window.requestAnimationFrame(() => setPosition((p) => p));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const spawnBurst = (emoji: string) => {
    const id = ++burstIdRef.current;
    setBursts((list) => [...list, { id, emoji }]);
    window.setTimeout(() => setBursts((list) => list.filter((b) => b.id !== id)), 900);
  };

  const { inputEl } = useTypingInput({
    enabled: !paused && !finished,
    onChar: (ch) => {
      if (finishedRef.current || pausedRef.current) return;
      unlockAudio();
      setLastKey(baseKey(ch));
      window.setTimeout(() => setLastKey((k) => (k === baseKey(ch) ? undefined : k)), 120);

      const expected = wordRef.current[typedRef.current.length];
      if (!expected) return;

      if (ch === expected || ch.toLowerCase() === expected.toLowerCase()) {
        playKey();
        registerHit();
        const nt = typedRef.current + expected;
        setTyped(nt);

        if (nt.length === wordRef.current.length) {
          // Palavra completa — decide sobe ou desce.
          const perfect = !errorsOnWordRef.current;
          if (perfect) {
            playPop();
            playWordDone();
            spawnBurst('⭐');
            setMoveDir('up');
            const newPos = Math.min(totalClouds, positionRef.current + 1);
            setPosition(newPos);
            if (newPos >= totalClouds) {
              // Venceu!
              playStar();
              const acc = stats.accuracy;
              const wpm = stats.wpm;
              window.setTimeout(() => {
                setFinished({ stars: starsFor(acc, wpm, level.goalWpm), wpm, accuracy: acc });
              }, 500);
              return;
            }
          } else {
            playError();
            spawnBurst('💨');
            setMoveDir('down');
            const newPos = Math.max(0, positionRef.current - 1);
            setPosition(newPos);
          }
          // Próxima palavra
          window.setTimeout(() => {
            setWord(pickWord());
            setTyped('');
            setErrorsOnWord(false);
            setMoveDir(null);
          }, 450);
        }
      } else {
        playError();
        registerMiss();
        setErrorsOnWord(true);
      }
    },
    onBackspace: () => {
      if (finishedRef.current || pausedRef.current) return;
      setTyped((t) => t.slice(0, -1));
    },
    onEscape: () => {
      if (!finishedRef.current) setPaused(true);
    },
  });

  /** Cada nuvem tem X fixo em zig-zag. Y é computado dinamicamente — o mundo
   *  rola verticalmente conforme a coruja sobe (estilo Doodle Jump/parallax).
   *  Só ~4 nuvens ficam visíveis por vez; as já passadas descem e somem, as
   *  próximas entram por cima. */
  const SPACING_Y = 22;       // % de distância vertical entre nuvens
  const ROBOT_SCREEN_Y = 38;  // % do bottom do container onde a coruja fica

  const cloudLayout = useMemo(() => {
    const xPattern = [28, 50, 72, 50];
    return Array.from({ length: totalClouds }, (_, i) => ({ x: xPattern[i % xPattern.length] }));
  }, [totalClouds]);

  /** Posição Y visual (%) de uma nuvem dada a posição atual da coruja. */
  const cloudScreenY = (i: number) => ROBOT_SCREEN_Y + (i - position) * SPACING_Y;

  const robotCloud = cloudLayout[Math.min(position, totalClouds - 1)];
  const nextChar = word[typed.length];
  const progress = position / totalClouds;

  return (
    <div className="relative flex-1 w-full overflow-hidden flex flex-col">
      <div className="absolute inset-0 clouds-bg pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-24 grass-bg pointer-events-none" />

      <HUD
        title={`${level.emoji} ${level.title}`}
        subtitle={level.subtitle}
        progress={progress}
        worldEmoji={getWorldMeta(level.world)?.emoji}
        worldLabel={`Mundo ${level.world} · ${getWorldMeta(level.world)?.title ?? ''}`}
        lessonLabel={(() => {
          const p = getLessonPosition(level);
          return `Lição ${p.index}/${p.total}`;
        })()}
        onPause={finished ? undefined : () => setPaused(true)}
      />

      {/* Área do "mundo" — nuvens rolam verticalmente conforme a coruja sobe. */}
      <div className="absolute inset-x-0 top-32 bottom-56 pointer-events-none overflow-hidden">
        {/* Bandeira de chegada — entra em cena quando a coruja chega perto do topo. */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 text-5xl"
          animate={{ bottom: `${cloudScreenY(totalClouds - 1) + 18}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
          🏁
        </motion.div>

        {/* Estrelinhas decorativas — parallax mais lento que as nuvens (efeito de profundidade) */}
        {[
          { x: 10, y: 30, d: 0 },
          { x: 88, y: 50, d: 0.5 },
          { x: 12, y: 66, d: 1 },
          { x: 90, y: 72, d: 1.5 },
          { x: 8, y: 18, d: 0.8 },
          { x: 92, y: 28, d: 0.3 },
        ].map((s, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-lg opacity-60"
            style={{ left: `${s.x}%` }}
            // Parallax 40% do scroll das nuvens — nuvens rolam mais rápido.
            animate={{
              bottom: `${s.y - position * SPACING_Y * 0.4}%`,
              opacity: [0.35, 0.75, 0.35],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              bottom: { type: 'spring', stiffness: 180, damping: 22 },
              opacity: { repeat: Infinity, duration: 2.5, delay: s.d },
              scale: { repeat: Infinity, duration: 2.5, delay: s.d },
            }}
          >
            ✨
          </motion.div>
        ))}

        {/* Plataformas de nuvem — só as próximas ~4 ficam visíveis; as passadas caem pra baixo e somem. */}
        {cloudLayout.map((c, i) => {
          const screenY = cloudScreenY(i);
          // Fora do viewport (com folga pra animação). Desmonta pra economizar.
          if (screenY < -20 || screenY > 120) return null;
          const reached = i <= position;
          return (
            <motion.div
              key={i}
              className="absolute -translate-x-1/2"
              initial={false}
              animate={{ left: `${c.x}%`, bottom: `${screenY}%`, opacity: screenY < 0 ? 0 : 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            >
              <CloudSVG lit={reached} />
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-700 font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-pop">
                {i + 1}
              </div>
            </motion.div>
          );
        })}

        {/* Coruja — fica ancorada perto do centro vertical, acompanhando o X da nuvem atual. */}
        <motion.div
          className="absolute -translate-x-1/2"
          animate={{ left: `${robotCloud.x}%`, bottom: `calc(${ROBOT_SCREEN_Y}% + 14px)` }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <Mascot
            mood={finished ? 'cheer' : moveDir === 'down' ? 'sad' : moveDir === 'up' ? 'cheer' : 'happy'}
            size={56}
          />
        </motion.div>

        {/* Partículas ao lado da coruja */}
        <div className="absolute inset-0">
          <AnimatePresence>
            {bursts.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 0, scale: 0.7 }}
                animate={{ opacity: [0, 1, 1, 0], y: -50, scale: [0.7, 1.3, 1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
                className="absolute text-3xl select-none"
                style={{ left: `${robotCloud.x}%`, bottom: `${ROBOT_SCREEN_Y + 8}%`, transform: 'translate(-50%, 0)' }}
              >
                {b.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Card da palavra — fixo no centro horizontal, acima do teclado e das nuvens. */}
      <div className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none" style={{ top: '42%' }}>
        <motion.div
          key={word}
          initial={{ scale: 0.8, opacity: 0, y: -8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white/95 rounded-3xl shadow-bubbly px-6 py-4 font-mono text-2xl md:text-3xl font-bold whitespace-nowrap"
        >
          {word.split('').map((ch, i) => {
            const matched = i < typed.length && typed[i].toLowerCase() === ch.toLowerCase();
            const cursor = i === typed.length;
            const isSpace = ch === ' ';
            const display = isSpace ? (cursor ? '␣' : '·') : ch;
            const color = matched
              ? 'text-grass'
              : isSpace
              ? cursor
                ? 'text-gray-900'
                : 'text-gray-400'
              : 'text-gray-700';
            return (
              <span
                key={i}
                className={`${color} ${isSpace ? 'px-1' : ''} ${cursor ? 'underline decoration-candy decoration-4 underline-offset-2' : ''}`}
              >
                {display}
              </span>
            );
          })}
        </motion.div>
      </div>

      <div className="absolute top-36 md:top-28 right-3 bg-white/70 rounded-2xl px-3 py-2 backdrop-blur shadow-pop text-sm space-y-1 z-20">
        <div>☁️ <b>{position}</b>/{totalClouds}</div>
        <div>🎯 <b>{Math.round(stats.displayAccuracy)}%</b></div>
      </div>

      <div className="absolute bottom-3 left-0 right-0 px-2 z-20">
        <Keyboard highlight={nextChar ? baseKey(nextChar) : undefined} lastPressed={lastKey} compact showNumbers={levelHasDigits(level)} />
      </div>

      {inputEl}

      {finished && (
        <ResultModal
          stars={finished.stars}
          accuracy={finished.accuracy}
          wpm={finished.wpm}
          onHome={onHome}
          onRetry={() => {
            reset();
            setPosition(0);
            setWord(pickWord());
            setTyped('');
            setErrorsOnWord(false);
            setFinished(null);
            setBursts([]);
            onRetry();
          }}
          onNext={
            onNext && finished.stars > 0
              ? () => {
                  onFinish(finished.stars, finished.wpm, finished.accuracy);
                  onNext();
                }
              : undefined
          }
        />
      )}
      {finished && <FinishTrigger onFinish={() => onFinish(finished.stars, finished.wpm, finished.accuracy)} />}

      {paused && !finished && (
        <PauseOverlay
          onResume={() => setPaused(false)}
          onHome={onHome}
          onRestart={() => {
            reset();
            setPosition(0);
            setWord(pickWord());
            setTyped('');
            setErrorsOnWord(false);
            setBursts([]);
            setPaused(false);
            onRetry();
          }}
        />
      )}
    </div>
  );
}

function CloudSVG({ lit }: { lit: boolean }) {
  // Plataforma larga e baixa (estilo Doodle Jump) com borda/sombra embaixo.
  return (
    <svg
      viewBox="0 0 140 36"
      width="120"
      height="32"
      style={{
        filter: lit
          ? 'drop-shadow(0 0 10px rgba(255,216,77,0.75))'
          : 'drop-shadow(0 3px 4px rgba(0,0,0,0.18))',
      }}
    >
      {/* sombra inferior (dá sensação de plataforma sólida) */}
      <ellipse cx="70" cy="30" rx="52" ry="4" fill="#000000" opacity="0.12" />
      {/* corpo da nuvem — forma bulbosa horizontal */}
      <path
        d="M20 24
           Q8 24 8 18
           Q8 10 18 10
           Q22 2 34 4
           Q42 -2 54 4
           Q64 0 74 4
           Q84 -2 96 4
           Q108 2 116 10
           Q132 10 132 18
           Q132 26 120 26
           Q100 30 70 28
           Q40 30 20 24 Z"
        fill={lit ? '#fffbe0' : '#ffffff'}
      />
      {/* borda inferior mais saturada — dá "peso" à plataforma */}
      <path
        d="M20 24 Q40 30 70 28 Q100 30 120 26"
        fill="none"
        stroke={lit ? '#ffd84d' : '#c2cbd9'}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FinishTrigger({ onFinish }: { onFinish: () => void }) {
  const fired = useRef(false);
  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      onFinish();
    }
  }, [onFinish]);
  return null;
}
