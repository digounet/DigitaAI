import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard } from '../components/Keyboard';
import { HUD } from '../components/HUD';
import { ResultModal } from '../components/ResultModal';
import { Mascot } from '../components/Mascot';
import { PauseOverlay } from '../components/PauseOverlay';
import { FINGER_COLORS, FINGER_NAMES, fingerFor } from '../data/fingers';
import type { Level } from '../data/levels';
import { getLessonPosition, getWorldMeta } from '../data/levels';
import { useTypingStats, starsFor } from '../hooks/useTypingStats';
import { useTypingInput } from '../hooks/useTypingInput';
import { playError, playKey, playStar, playWordDone, unlockAudio } from '../audio/sfx';

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

export function TextMode({ level, onFinish, onHome, onRetry, onNext, isText }: Props) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [errorsOnWord, setErrorsOnWord] = useState(false);
  const [lastKey, setLastKey] = useState<string | undefined>();
  const [finished, setFinished] = useState<null | { stars: number; wpm: number; accuracy: number }>(null);
  const [paused, setPaused] = useState(false);
  const { stats, registerHit, registerMiss, reset } = useTypingStats();

  const phrase = level.pool[phraseIdx] ?? '';
  const nextChar = phrase[typed.length] ?? '';
  const finger = fingerFor(nextChar);

  // Refs pra handlers estáveis que leem estado atual
  const phraseRef = useRef(phrase);
  const typedRef = useRef(typed);
  const phraseIdxRef = useRef(phraseIdx);
  const finishedRef = useRef(false);
  const pausedRef = useRef(false);
  phraseRef.current = phrase;
  typedRef.current = typed;
  phraseIdxRef.current = phraseIdx;
  finishedRef.current = !!finished;
  pausedRef.current = paused;

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
        setErrorsOnWord(false);
        if (newTyped === phraseRef.current) {
          playWordDone();
          const ni = phraseIdxRef.current + 1;
          if (ni >= level.pool.length) {
            const acc = stats.accuracy;
            const wpm = stats.wpm;
            playStar();
            setFinished({ stars: starsFor(acc, wpm, level.goalWpm), wpm, accuracy: acc });
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
      }
    },
    onBackspace: () => {
      if (finishedRef.current || pausedRef.current) return;
      setTyped((t) => t.slice(0, -1));
    },
    onEscape: () => {
      // Esc só PAUSA (igual ao botão). Saída é só pelos botões do overlay.
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
          <Mascot mood={errorsOnWord ? 'sad' : 'happy'} size={72} />
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
        </div>

        <div
          className={`mt-2 bg-white/90 rounded-3xl shadow-bubbly p-4 md:p-6 ${isText ? 'max-w-3xl' : 'max-w-2xl'} w-full`}
        >
          <p
            className={`font-mono text-xl md:text-2xl leading-relaxed ${isText ? '' : 'text-center'} break-words`}
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

        <div className="mt-3 flex gap-2">
          <Stat label="🎯 Precisão" value={`${Math.round(stats.accuracy)}%`} />
          <Stat label="⚡ PPM" value={Math.round(stats.wpm).toString()} />
          {level.goalWpm && <Stat label="🏁 Meta" value={`${level.goalWpm} PPM`} />}
        </div>
      </div>

      <div className="px-2 pb-3">
        <Keyboard highlight={baseKey(nextChar)} lastPressed={lastKey} />
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
            setTyped('');
            setPhraseIdx(0);
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
