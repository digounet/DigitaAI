import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard } from '../components/Keyboard';
import { HUD } from '../components/HUD';
import { ResultModal } from '../components/ResultModal';
import { Mascot } from '../components/Mascot';
import { PauseOverlay } from '../components/PauseOverlay';
import { FINGER_COLORS, FINGER_NAMES, fingerFor } from '../data/fingers';
import type { Level } from '../data/levels';
import { getLessonPosition, getWorldMeta, levelHasDigits } from '../data/levels';
import { useTypingStats, starsFor } from '../hooks/useTypingStats';
import { useTypingInput } from '../hooks/useTypingInput';
import { playError, playKey, playPop, playStar, playWordDone, unlockAudio } from '../audio/sfx';
import { useGame, effectiveGoalWpm } from '../store/gameStore';

type Props = {
  level: Level;
  onFinish: (stars: number, wpm: number, accuracy: number) => void;
  onHome: () => void;
  onRetry: () => void;
  onNext?: () => void;
  isText?: boolean;
};

/** Normaliza para exibição no teclado virtual (ã → a). */
function baseKey(ch: string): string {
  return ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

type Burst = { id: number; x: number; emoji: string };

export function TextMode({ level, onFinish, onHome, onRetry, onNext, isText }: Props) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [errorsOnWord, setErrorsOnWord] = useState(false);
  const [lastKey, setLastKey] = useState<string | undefined>();
  const [finished, setFinished] = useState<null | { stars: number; wpm: number; accuracy: number }>(null);
  const [paused, setPaused] = useState(false);
  /** Palavras seguidas completadas SEM erro. Reseta ao errar. */
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  /** Bursts de partícula ativos (estrelas voando quando completa palavra). */
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstIdRef = useRef(0);
  const { stats, registerHit, registerMiss, reset } = useTypingStats();
  const difficulty = useGame((s) => s.difficulty);
  const goalWpm = effectiveGoalWpm(level.goalWpm, difficulty);

  const phrase = level.pool[phraseIdx] ?? '';
  const nextChar = phrase[typed.length] ?? '';
  const finger = fingerFor(nextChar);

  // Progresso da frase atual (0..1) — controla a posição do foguete na trilha.
  const phraseProgress = phrase.length === 0 ? 0 : typed.length / phrase.length;

  // Nudge pós-mount (mesmo tratamento dos outros modos).
  useEffect(() => {
    window.scrollTo(0, 0);
    const id = window.requestAnimationFrame(() => {
      setPhraseIdx((v) => v);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Refs pra handlers estáveis que leem estado atual
  const phraseRef = useRef(phrase);
  const typedRef = useRef(typed);
  const phraseIdxRef = useRef(phraseIdx);
  const finishedRef = useRef(false);
  const pausedRef = useRef(false);
  const errorOnCurrentWordRef = useRef(false);
  phraseRef.current = phrase;
  typedRef.current = typed;
  phraseIdxRef.current = phraseIdx;
  finishedRef.current = !!finished;
  pausedRef.current = paused;
  errorOnCurrentWordRef.current = errorsOnWord;

  const spawnBurst = (emoji: string) => {
    const id = ++burstIdRef.current;
    const x = 20 + Math.random() * 60;
    setBursts((list) => [...list, { id, emoji, x }]);
    window.setTimeout(() => {
      setBursts((list) => list.filter((b) => b.id !== id));
    }, 900);
  };

  const { inputEl } = useTypingInput({
    enabled: !paused && !finished,
    onChar: (ch) => {
      if (finishedRef.current || pausedRef.current) return;
      unlockAudio();
      setLastKey(baseKey(ch));
      window.setTimeout(() => setLastKey((k) => (k === baseKey(ch) ? undefined : k)), 120);

      const expected = phraseRef.current[typedRef.current.length];
      if (!expected) return;

      if (ch === expected || ch.toLowerCase() === expected.toLowerCase()) {
        playKey();
        registerHit();
        const newTyped = typedRef.current + expected;
        setTyped(newTyped);

        // Fim de palavra: acabou de digitar espaço OU chegou ao final da frase.
        const endedWord =
          (expected === ' ' && typedRef.current.length > 0 && typedRef.current[typedRef.current.length - 1] !== ' ') ||
          newTyped.length === phraseRef.current.length;
        if (endedWord) {
          playPop();
          if (!errorOnCurrentWordRef.current) {
            setStreak((prev) => {
              const nxt = prev + 1;
              setBestStreak((bs) => Math.max(bs, nxt));
              // A cada 3 palavras seguidas, celebração extra.
              if (nxt > 0 && nxt % 3 === 0) spawnBurst('🔥');
              else spawnBurst('⭐');
              return nxt;
            });
          } else {
            spawnBurst('✨');
          }
          setErrorsOnWord(false);
        }

        if (newTyped === phraseRef.current) {
          playWordDone();
          const ni = phraseIdxRef.current + 1;
          if (ni >= level.pool.length) {
            const acc = stats.accuracy;
            const wpm = stats.wpm;
            playStar();
            setFinished({ stars: starsFor(acc, wpm, goalWpm), wpm, accuracy: acc });
          } else {
            window.setTimeout(() => {
              setPhraseIdx(ni);
              setTyped('');
            }, 600);
          }
        }
      } else {
        playError();
        registerMiss();
        setErrorsOnWord(true);
        // Errou durante a palavra: quebra streak.
        setStreak(0);
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

  const progress = useMemo(() => {
    const totalChars = level.pool.reduce((a, b) => a + b.length, 0);
    const done = level.pool.slice(0, phraseIdx).reduce((a, b) => a + b.length, 0) + typed.length;
    return totalChars === 0 ? 0 : done / totalChars;
  }, [level.pool, phraseIdx, typed.length]);

  return (
    <div className="relative flex-1 w-full overflow-hidden flex flex-col">
      <div className="absolute inset-0 clouds-bg pointer-events-none" />
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

      <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4 pb-2 overflow-y-auto">
        <div className="mb-2 flex items-center gap-3 text-sm text-gray-700">
          <Mascot mood={errorsOnWord ? 'sad' : streak >= 3 ? 'cheer' : 'happy'} size={72} />
          <div className="bg-white/80 rounded-2xl px-4 py-2 shadow-pop">
            {finger ? (
              <>
                <span>Use o </span>
                <span className={`${FINGER_COLORS[finger]} px-2 py-0.5 rounded-full font-bold`}>
                  {FINGER_NAMES[finger]}
                </span>
              </>
            ) : (
              <span>Digite a próxima letra 🎯</span>
            )}
          </div>
          <StreakBadge value={streak} best={bestStreak} />
        </div>

        <div
          className={`relative mt-2 bg-white/90 rounded-3xl shadow-bubbly p-4 md:p-6 ${isText ? 'max-w-3xl' : 'max-w-2xl'} w-full`}
        >
          {/* Trilha do foguete: mostra o avanço na frase atual */}
          <RocketTrack progress={phraseProgress} errorsOnWord={errorsOnWord} />

          {/* Bursts de partícula flutuando sobre o card (palavra completada) */}
          <div className="pointer-events-none absolute inset-0 overflow-visible">
            <AnimatePresence>
              {bursts.map((b) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -60, scale: [0.6, 1.3, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                  className="absolute text-3xl select-none"
                  style={{ left: `${b.x}%`, top: '40%' }}
                >
                  {b.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <p
            className={`font-mono text-xl md:text-2xl leading-relaxed ${isText ? '' : 'text-center'} break-words mt-3`}
          >
            {phrase.split('').map((ch, i) => {
              const status =
                i < typed.length
                  ? typed[i].toLowerCase() === ch.toLowerCase()
                    ? 'text-grass'
                    : 'text-coral underline decoration-wavy'
                  : i === typed.length
                  ? 'text-gray-900 bg-yellow-200 rounded-sm'
                  : 'text-gray-400';
              return (
                <span key={i} className={status}>
                  {ch === ' ' && i === typed.length ? '␣' : ch}
                </span>
              );
            })}
          </p>
          {level.pool.length > 1 && (
            <div className="text-xs text-gray-500 text-center mt-3">
              Frase {phraseIdx + 1} de {level.pool.length}
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2 flex-wrap justify-center">
          <Stat label="🎯 Precisão" value={`${Math.round(stats.displayAccuracy)}%`} />
          <Stat label="⚡ PPM" value={Math.round(stats.wpm).toString()} />
          {goalWpm && <Stat label="🏁 Meta" value={`${goalWpm} PPM`} />}
        </div>
      </div>

      <div className="px-2 pb-3">
        <Keyboard highlight={baseKey(nextChar)} lastPressed={lastKey} showNumbers={levelHasDigits(level)} />
      </div>

      {inputEl}

      {finished && (
        <ResultModal
          stars={finished.stars}
          accuracy={finished.accuracy}
          wpm={finished.wpm}
          goalWpm={goalWpm}
          onHome={onHome}
          onRetry={() => {
            reset();
            setTyped('');
            setPhraseIdx(0);
            setStreak(0);
            setBestStreak(0);
            setBursts([]);
            setFinished(null);
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
            setTyped('');
            setPhraseIdx(0);
            setStreak(0);
            setBestStreak(0);
            setBursts([]);
            setPaused(false);
            onRetry();
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/80 rounded-2xl px-3 py-1.5 shadow-pop text-sm">
      <span className="text-gray-500 mr-1">{label}</span>
      <b>{value}</b>
    </div>
  );
}

/** Contador de palavras certas seguidas — some quando streak=0, destaca >=3. */
function StreakBadge({ value, best }: { value: number; best: number }) {
  if (value === 0 && best === 0) return null;
  const hot = value >= 3;
  return (
    <motion.div
      key={value}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className={`rounded-2xl px-3 py-2 shadow-pop text-sm font-bold ${
        hot ? 'bg-gradient-to-r from-coral to-sun text-white' : 'bg-white/80 text-gray-700'
      }`}
    >
      <span className="mr-1">{hot ? '🔥' : '✨'}</span>
      <span>Combo {value}</span>
      {best > value && <span className="ml-2 text-xs opacity-80">(melhor {best})</span>}
    </motion.div>
  );
}

/** Trilha visual do foguete: mostra o progresso dentro da frase atual. */
function RocketTrack({ progress, errorsOnWord }: { progress: number; errorsOnWord: boolean }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div className="relative h-10 mb-1">
      {/* trilho pontilhado */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-mint to-grass transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* bandeira de chegada */}
      <div className="absolute right-0 top-0 text-xl">🏁</div>
      {/* foguete */}
      <motion.div
        className="absolute top-0 text-2xl"
        style={{ left: `calc(${pct}% - 14px)` }}
        animate={errorsOnWord ? { rotate: [-10, 10, -10] } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        🚀
      </motion.div>
    </div>
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
