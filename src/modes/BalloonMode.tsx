import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Balloon, balloonColor } from '../components/Balloon';
import { Keyboard } from '../components/Keyboard';
import { HUD } from '../components/HUD';
import { ResultModal } from '../components/ResultModal';
import { Mascot } from '../components/Mascot';
import { PauseOverlay } from '../components/PauseOverlay';
import type { Level } from '../data/levels';
import { getLessonPosition, getWorldMeta } from '../data/levels';
import { useTypingStats, starsFor } from '../hooks/useTypingStats';
import { useTypingInput } from '../hooks/useTypingInput';
import { playError, playKey, playPop, playWordDone, unlockAudio } from '../audio/sfx';

/** Normaliza para exibição no teclado virtual (ã → a). */
function baseKey(ch: string): string {
  return ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

type BalloonItem = {
  id: number;
  letter: string;
  x: number;
  color: string;
  duration: number;
  popped?: boolean;
};

type Props = {
  level: Level;
  onFinish: (stars: number, wpm: number, accuracy: number) => void;
  onHome: () => void;
  onRetry: () => void;
  onNext?: () => void;
};

export function BalloonMode({ level, onFinish, onHome, onRetry, onNext }: Props) {
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [cleared, setCleared] = useState(0);
  const [missed, setMissed] = useState(0);
  const [finished, setFinished] = useState<null | { stars: number; wpm: number; accuracy: number }>(null);
  const [lastKey, setLastKey] = useState<string | undefined>();
  const [nextTargetLetter, setNextTargetLetter] = useState<string | undefined>();
  const [paused, setPaused] = useState(false);
  const nextIdRef = useRef(0);
  const { stats, registerHit, registerMiss, reset } = useTypingStats();

  const balloonsRef = useRef<BalloonItem[]>([]);
  const finishedRef = useRef(false);
  const clearedRef = useRef(0);
  const pausedRef = useRef(false);
  const statsStartedAtRef = useRef<number | null>(null);
  const statsCorrectRef = useRef(0);
  const statsTotalRef = useRef(0);

  balloonsRef.current = balloons;
  finishedRef.current = !!finished;
  clearedRef.current = cleared;
  pausedRef.current = paused;
  statsStartedAtRef.current = stats.startedAt;
  statsCorrectRef.current = stats.correct;
  statsTotalRef.current = stats.total;

  const speed = level.speed ?? 6;

  // Atualiza a "próxima letra-alvo" apenas quando a lista muda (não afeta listener).
  useEffect(() => {
    const alive = balloons.find((b) => !b.popped);
    setNextTargetLetter(alive?.letter);
  }, [balloons]);

  // spawn periódico — depende só do nível, não de balloons state (usa ref).
  useEffect(() => {
    if (finished || paused) return;
    const maxAtOnce = level.maxAtOnce ?? Math.min(3, 1 + Math.floor(level.target / 8));
    // Checa spawn a cada 500ms; a guarda `aliveCount >= maxAtOnce` controla a densidade.
    // Sem isso, com maxAtOnce=1 o jogo ficava esperando `speed` segundos ociosos entre balões.
    const spawnEvery = 500;

    const doSpawn = () => {
      if (finishedRef.current || pausedRef.current) return;
      const aliveCount = balloonsRef.current.filter((x) => !x.popped).length;
      if (aliveCount >= maxAtOnce) return;
      const nid = ++nextIdRef.current;
      const letter = level.pool[Math.floor(Math.random() * level.pool.length)];
      const x = 5 + Math.random() * 85;
      setBalloons((b) => [...b, { id: nid, letter, x, color: balloonColor(nid), duration: speed }]);
    };

    doSpawn();
    const id = setInterval(doSpawn, spawnEvery);
    return () => clearInterval(id);
  }, [finished, paused, speed, level.target, level.pool, level.maxAtOnce]);

  // Ao pausar, limpa balões pendentes pra não continuarem subindo "atrás" do overlay.
  useEffect(() => {
    if (paused) setBalloons([]);
  }, [paused]);

  const { inputEl } = useTypingInput({
    onChar: (ch) => {
      if (finishedRef.current || pausedRef.current) return;
      unlockAudio();
      const key = ch.toLowerCase();
      setLastKey(baseKey(ch));
      window.setTimeout(() => setLastKey((k) => (k === baseKey(ch) ? undefined : k)), 120);
      playKey();

      const target = balloonsRef.current.find((b) => !b.popped && b.letter.toLowerCase() === key);
      if (target) {
        playPop();
        registerHit();
        setBalloons((list) => list.map((b) => (b.id === target.id ? { ...b, popped: true } : b)));
        const nc = clearedRef.current + 1;
        clearedRef.current = nc;
        setCleared(nc);
        if (nc >= level.target) {
          const correct = statsCorrectRef.current + 1;
          const total = statsTotalRef.current + 1;
          const startedAt = statsStartedAtRef.current ?? Date.now();
          const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
          const wpm = correct / 5 / minutes;
          const acc = total === 0 ? 100 : (correct / total) * 100;
          playWordDone();
          setFinished({ stars: starsFor(acc), wpm, accuracy: acc });
        }
        window.setTimeout(() => {
          setBalloons((list) => list.filter((b) => b.id !== target.id));
        }, 350);
      } else {
        playError();
        registerMiss();
      }
    },
    onEscape: () => {
      if (!finishedRef.current) setPaused((p) => !p);
    },
  });

  const handleBalloonEscape = useCallback((id: number) => {
    setBalloons((list) => {
      const item = list.find((b) => b.id === id);
      if (item && !item.popped) {
        playError();
        setMissed((m) => m + 1);
        registerMiss();
      }
      return list.filter((b) => b.id !== id);
    });
  }, [registerMiss]);

  return (
    <div className="relative flex-1 w-full overflow-hidden">
      <div className="absolute inset-0 clouds-bg" />
      <div className="absolute bottom-0 left-0 right-0 h-24 grass-bg" />

      <HUD
        title={`${level.emoji} ${level.title}`}
        subtitle={level.subtitle}
        progress={cleared / level.target}
        worldEmoji={getWorldMeta(level.world)?.emoji}
        worldLabel={`Mundo ${level.world} · ${getWorldMeta(level.world)?.title ?? ''}`}
        lessonLabel={(() => {
          const p = getLessonPosition(level);
          return `Lição ${p.index}/${p.total}`;
        })()}
        onPause={finished ? undefined : () => setPaused(true)}
      />

      <div className="absolute left-3 bottom-28 hidden md:block">
        <Mascot mood={finished ? 'cheer' : 'happy'} size={100} />
      </div>

      <div className="absolute top-24 right-3 bg-white/70 rounded-2xl px-3 py-2 backdrop-blur shadow-pop text-sm space-y-1">
        <div>🎈 <b>{cleared}</b>/{level.target}</div>
        <div>💨 <b>{missed}</b></div>
        <div>🎯 <b>{Math.round(stats.accuracy)}%</b></div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {balloons.map((b) => (
            <Balloon
              key={b.id}
              letter={b.letter}
              color={b.color}
              x={b.x}
              duration={b.duration}
              popped={b.popped}
              glow={b.letter === nextTargetLetter && !b.popped}
              onEnd={() => handleBalloonEscape(b.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-3 left-0 right-0 px-2">
        <Keyboard highlight={nextTargetLetter ? baseKey(nextTargetLetter) : undefined} lastPressed={lastKey} compact />
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
            setCleared(0);
            setMissed(0);
            setBalloons([]);
            setFinished(null);
            onRetry();
          }}
          onNext={onNext && finished.stars > 0 ? () => {
            onFinish(finished.stars, finished.wpm, finished.accuracy);
            onNext();
          } : undefined}
        />
      )}

      {finished && (
        <FinishTrigger onFinish={() => onFinish(finished.stars, finished.wpm, finished.accuracy)} />
      )}

      {paused && !finished && (
        <PauseOverlay
          onResume={() => setPaused(false)}
          onHome={onHome}
          onRestart={() => {
            reset();
            setCleared(0);
            setMissed(0);
            setBalloons([]);
            setPaused(false);
            onRetry();
          }}
        />
      )}
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
