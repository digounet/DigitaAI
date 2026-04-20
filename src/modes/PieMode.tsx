import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Pie, pieColor } from '../components/Pie';
import { Keyboard } from '../components/Keyboard';
import { HUD } from '../components/HUD';
import { ResultModal } from '../components/ResultModal';
import { Mascot } from '../components/Mascot';
import type { Level } from '../data/levels';
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
  const nextIdRef = useRef(0);
  const { stats, registerHit, registerMiss, reset } = useTypingStats();

  const speed = level.speed ?? 10;

  const pickWord = useCallback(() => {
    const p = level.pool;
    return p[Math.floor(Math.random() * p.length)];
  }, [level.pool]);

  const spawn = useCallback(() => {
    const id = ++nextIdRef.current;
    const word = pickWord();
    const x = 5 + Math.random() * 80;
    setPies((b) => [...b, { id, word, typed: '', x, color: pieColor(id), duration: speed }]);
  }, [pickWord, speed]);

  useEffect(() => {
    if (finished) return;
    const maxAtOnce = 3;
    const every = Math.max(1400, (speed * 1000) / maxAtOnce);
    spawn();
    const id = setInterval(() => {
      setPies((b) => {
        const alive = b.filter((x) => !x.popped);
        if (alive.length >= maxAtOnce) return b;
        const nid = ++nextIdRef.current;
        const word = level.pool[Math.floor(Math.random() * level.pool.length)];
        const x = 5 + Math.random() * 80;
        return [...b, { id: nid, word, typed: '', x, color: pieColor(nid), duration: speed }];
      });
    }, every);
    return () => clearInterval(id);
  }, [finished, spawn, speed, level.pool]);

  const active = useMemo(() => pies.find((p) => p.id === activeId && !p.popped), [pies, activeId]);

  // Seleciona tortinha ativa automaticamente: primeira que combina com a tecla pressionada
  useEffect(() => {
    if (finished) return;
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      if (key === 'Backspace') {
        setPies((list) =>
          list.map((p) => (p.id === activeId ? { ...p, typed: p.typed.slice(0, -1) } : p))
        );
        return;
      }
      if (key.length !== 1) return;
      unlockAudio();
      setLastKey(key.toLowerCase());
      setTimeout(() => setLastKey(undefined), 120);
      playKey();

      // se não tem pie ativa, escolhe a que começa com a letra
      let targetId = activeId;
      if (targetId === null) {
        const candidate = pies.find(
          (p) => !p.popped && p.typed === '' && p.word[0].toLowerCase() === key.toLowerCase()
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

      const pie = pies.find((p) => p.id === targetId);
      if (!pie) return;
      const nextChar = pie.word[pie.typed.length];
      if (!nextChar) return;

      if (key.toLowerCase() === nextChar.toLowerCase()) {
        const newTyped = pie.typed + nextChar;
        registerHit();
        if (newTyped.length === pie.word.length) {
          playPop();
          playWordDone();
          setPies((list) => list.map((p) => (p.id === pie.id ? { ...p, typed: newTyped, popped: true } : p)));
          setActiveId(null);
          setCleared((c) => {
            const nc = c + 1;
            if (nc >= level.target) {
              const acc = (stats.correct + 1) / Math.max(stats.total + 1, 1) * 100;
              const wpm = stats.startedAt !== null
                ? ((stats.correct + 1) / 5) / Math.max((Date.now() - stats.startedAt) / 60000, 1 / 60)
                : 0;
              setFinished({ stars: starsFor(acc), wpm, accuracy: acc });
            }
            return nc;
          });
          setTimeout(() => setPies((list) => list.filter((p) => p.id !== pie.id)), 400);
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
  }, [pies, activeId, registerHit, registerMiss, finished, level.target, stats.correct, stats.total, stats.startedAt]);

  const nextLetter = useMemo(() => {
    if (active) return active.word[active.typed.length]?.toLowerCase();
    // sugere a primeira letra da tortinha mais baixa (mais urgente)
    const alive = pies.filter((p) => !p.popped);
    return alive[0]?.word[0]?.toLowerCase();
  }, [pies, active]);

  const handleEscape = useCallback((id: number) => {
    setPies((list) => {
      const p = list.find((x) => x.id === id);
      if (p && !p.popped) {
        playError();
        setMissed((m) => m + 1);
        registerMiss();
        if (activeId === id) setActiveId(null);
      }
      return list.filter((x) => x.id !== id);
    });
  }, [registerMiss, activeId]);

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
