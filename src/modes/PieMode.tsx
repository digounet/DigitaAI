import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Pie, pieColor } from '../components/Pie';
import { Keyboard } from '../components/Keyboard';
import { HUD } from '../components/HUD';
import { ResultModal } from '../components/ResultModal';
import { Mascot } from '../components/Mascot';
import type { Level } from '../data/levels';
import { getLessonPosition, getWorldMeta } from '../data/levels';
import { useTypingStats, starsFor } from '../hooks/useTypingStats';
import { playError, playKey, playPop, playWordDone, unlockAudio } from '../audio/sfx';

type PieItem = {
  id: number;
  word: string;
  typed: string;
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

export function PieMode({ level, onFinish, onHome, onRetry, onNext }: Props) {
  const [pies, setPies] = useState<PieItem[]>([]);
  const [cleared, setCleared] = useState(0);
  const [missed, setMissed] = useState(0);
  const [finished, setFinished] = useState<null | { stars: number; wpm: number; accuracy: number }>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [lastKey, setLastKey] = useState<string | undefined>();
  const [nextLetter, setNextLetter] = useState<string | undefined>();
  const nextIdRef = useRef(0);
  const { stats, registerHit, registerMiss, reset } = useTypingStats();

  const piesRef = useRef<PieItem[]>([]);
  const activeIdRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const clearedRef = useRef(0);
  const statsStartedAtRef = useRef<number | null>(null);
  const statsCorrectRef = useRef(0);
  const statsTotalRef = useRef(0);

  piesRef.current = pies;
  activeIdRef.current = activeId;
  finishedRef.current = !!finished;
  clearedRef.current = cleared;
  statsStartedAtRef.current = stats.startedAt;
  statsCorrectRef.current = stats.correct;
  statsTotalRef.current = stats.total;

  const speed = level.speed ?? 10;

  // Calcula próxima letra visível (sem sobrecarregar dependências).
  useEffect(() => {
    const active = pies.find((p) => p.id === activeId && !p.popped);
    if (active) {
      setNextLetter(active.word[active.typed.length]?.toLowerCase());
    } else {
      const alive = pies.find((p) => !p.popped);
      setNextLetter(alive?.word[0]?.toLowerCase());
    }
  }, [pies, activeId]);

  useEffect(() => {
    if (finished) return;
    const maxAtOnce = level.maxAtOnce ?? 2;
    const every = Math.max(2000, (speed * 1000) / Math.max(1, maxAtOnce));
    const doSpawn = () => {
      if (finishedRef.current) return;
      const aliveCount = piesRef.current.filter((x) => !x.popped).length;
      if (aliveCount >= maxAtOnce) return;
      const nid = ++nextIdRef.current;
      const word = level.pool[Math.floor(Math.random() * level.pool.length)];
      const x = 5 + Math.random() * 80;
      setPies((b) => [...b, { id: nid, word, typed: '', x, color: pieColor(nid), duration: speed }]);
    };
    doSpawn();
    const id = setInterval(doSpawn, every);
    return () => clearInterval(id);
  }, [finished, speed, level.pool, level.maxAtOnce]);

  // Listener estável via refs.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (finishedRef.current) return;
      const key = e.key;
      if (key === 'Backspace') {
        const aid = activeIdRef.current;
        if (aid !== null) {
          setPies((list) => list.map((p) => (p.id === aid ? { ...p, typed: p.typed.slice(0, -1) } : p)));
        }
        return;
      }
      if (key.length !== 1) return;
      unlockAudio();
      const lk = key.toLowerCase();
      setLastKey(lk);
      window.setTimeout(() => setLastKey((k) => (k === lk ? undefined : k)), 120);
      playKey();

      let targetId = activeIdRef.current;
      if (targetId === null) {
        const candidate = piesRef.current.find(
          (p) => !p.popped && p.typed === '' && p.word[0].toLowerCase() === lk
        );
        if (candidate) {
          targetId = candidate.id;
          setActiveId(candidate.id);
        } else {
          playError();
          registerMiss();
          return;
        }
      }
      const pie = piesRef.current.find((p) => p.id === targetId);
      if (!pie) return;
      const nextChar = pie.word[pie.typed.length];
      if (!nextChar) return;

      if (lk === nextChar.toLowerCase()) {
        const newTyped = pie.typed + nextChar;
        registerHit();
        if (newTyped.length === pie.word.length) {
          playPop();
          playWordDone();
          setPies((list) => list.map((p) => (p.id === pie.id ? { ...p, typed: newTyped, popped: true } : p)));
          setActiveId(null);
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
            setFinished({ stars: starsFor(acc), wpm, accuracy: acc });
          }
          window.setTimeout(() => setPies((list) => list.filter((p) => p.id !== pie.id)), 400);
        } else {
          setPies((list) => list.map((p) => (p.id === pie.id ? { ...p, typed: newTyped } : p)));
        }
      } else {
        playError();
        registerMiss();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [level.target, registerHit, registerMiss]);

  const handleEscape = useCallback((id: number) => {
    setPies((list) => {
      const p = list.find((x) => x.id === id);
      if (p && !p.popped) {
        playError();
        setMissed((m) => m + 1);
        registerMiss();
        if (activeIdRef.current === id) setActiveId(null);
      }
      return list.filter((x) => x.id !== id);
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
      />

      <div className="absolute left-3 bottom-28 hidden md:block">
        <Mascot mood={finished ? 'cheer' : 'happy'} size={100} />
      </div>

      <div className="absolute top-24 right-3 bg-white/70 rounded-2xl px-3 py-2 backdrop-blur shadow-pop text-sm space-y-1">
        <div>🥧 <b>{cleared}</b>/{level.target}</div>
        <div>💨 <b>{missed}</b></div>
        <div>🎯 <b>{Math.round(stats.accuracy)}%</b></div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {pies.map((p) => (
            <Pie
              key={p.id}
              word={p.word}
              typed={p.typed}
              color={p.color}
              x={p.x}
              duration={p.duration}
              popped={p.popped}
              onEnd={() => handleEscape(p.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-3 left-0 right-0 px-2">
        <Keyboard highlight={nextLetter} lastPressed={lastKey} compact />
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
            setPies([]);
            setActiveId(null);
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
