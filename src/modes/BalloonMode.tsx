import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Balloon, balloonColor } from '../components/Balloon';
import { Keyboard } from '../components/Keyboard';
import { HUD } from '../components/HUD';
import { ResultModal } from '../components/ResultModal';
import { Mascot } from '../components/Mascot';
import type { Level } from '../data/levels';
import { useTypingStats, starsFor } from '../hooks/useTypingStats';
import { playError, playKey, playPop, playWordDone, unlockAudio } from '../audio/sfx';

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
  const nextIdRef = useRef(0);
  const { stats, registerHit, registerMiss, reset } = useTypingStats();

  const speed = level.speed ?? 6;

  const pickLetter = useCallback(() => {
    const p = level.pool;
    return p[Math.floor(Math.random() * p.length)];
  }, [level.pool]);

  const spawnBalloon = useCallback(() => {
    const id = ++nextIdRef.current;
    const letter = pickLetter();
    const x = 5 + Math.random() * 85;
    const color = balloonColor(id);
    setBalloons((b) => [...b, { id, letter, x, color, duration: speed }]);
  }, [pickLetter, speed]);

  // spawn periódico (respeitando maxAtOnce)
  useEffect(() => {
    if (finished) return;
    const maxAtOnce = Math.min(5, 2 + Math.floor(level.target / 6));
    const spawnEvery = Math.max(900, (speed * 1000) / maxAtOnce);
    spawnBalloon();
    const id = setInterval(() => {
      setBalloons((b) => {
        const alive = b.filter((x) => !x.popped);
        if (alive.length >= maxAtOnce) return b;
        const nid = ++nextIdRef.current;
        const letter = level.pool[Math.floor(Math.random() * level.pool.length)];
        const x = 5 + Math.random() * 85;
        return [...b, { id: nid, letter, x, color: balloonColor(nid), duration: speed }];
      });
    }, spawnEvery);
    return () => clearInterval(id);
  }, [finished, spawnBalloon, speed, level.target, level.pool]);

  // teclado
  useEffect(() => {
    if (finished) return;
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key.length !== 1) return;
      unlockAudio();
      setLastKey(key);
      setTimeout(() => setLastKey(undefined), 120);
      playKey();
      // procura balão mais antigo que tem essa letra (ainda não estourado)
      const target = balloons.find((b) => !b.popped && b.letter.toLowerCase() === key);
      if (target) {
        playPop();
        registerHit();
        setBalloons((list) => list.map((b) => (b.id === target.id ? { ...b, popped: true } : b)));
        setCleared((c) => {
          const nc = c + 1;
          if (nc >= level.target) {
            const acc = ((stats.correct + 1) / Math.max(stats.total + 1, 1)) * 100;
            const wpm =
              stats.startedAt !== null
                ? ((stats.correct + 1) / 5) /
                  Math.max((Date.now() - stats.startedAt) / 60000, 1 / 60)
                : 0;
            const stars = starsFor(acc);
            playWordDone();
            setFinished({ stars, wpm, accuracy: acc });
          }
          return nc;
        });
        // remover do DOM depois da animação
        setTimeout(() => {
          setBalloons((list) => list.filter((b) => b.id !== target.id));
        }, 350);
      } else {
        playError();
        registerMiss();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [balloons, registerHit, registerMiss, finished, level.target, stats.correct, stats.total, stats.startedAt]);

  const nextTargetLetter = useMemo(() => {
    const alive = balloons.filter((b) => !b.popped);
    return alive[0]?.letter;
  }, [balloons]);

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
      />

      <div className="absolute left-3 bottom-28 hidden md:block">
        <Mascot mood={finished ? 'cheer' : 'happy'} size={100} />
      </div>

      <div className="absolute top-24 right-3 bg-white/70 rounded-2xl px-3 py-2 backdrop-blur shadow-pop text-sm space-y-1">
        <div>🎈 <b>{cleared}</b>/{level.target}</div>
        <div>💨 <b>{missed}</b></div>
        <div>🎯 <b>{Math.round(stats.accuracy)}%</b></div>
      </div>

      {/* Área de balões */}
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

      {/* Teclado */}
      <div className="absolute bottom-3 left-0 right-0 px-2">
        <Keyboard highlight={nextTargetLetter?.toLowerCase()} lastPressed={lastKey} compact />
      </div>

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
    </div>
  );
}

// Dispara o onFinish uma vez quando o modal aparece (grava progresso).
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
