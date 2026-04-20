import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Pie, pieColor } from '../components/Pie';
import { Keyboard } from '../components/Keyboard';
import { HUD } from '../components/HUD';
import { ResultModal } from '../components/ResultModal';
import { Mascot } from '../components/Mascot';
import { PauseOverlay } from '../components/PauseOverlay';
import type { Level } from '../data/levels';
import { getLessonPosition, getWorldMeta, levelHasDigits } from '../data/levels';
import { useTypingStats, starsFor } from '../hooks/useTypingStats';
import { useTypingInput } from '../hooks/useTypingInput';
import { playError, playKey, playPop, playWordDone, unlockAudio } from '../audio/sfx';
import { useGame, DIFFICULTY_SPEED_MULTIPLIER, effectiveMaxAtOnce } from '../store/gameStore';
import { pickSpawnX } from '../utils/spawnX';

function baseKey(ch: string): string {
  return ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

type PieItem = {
  id: number;
  word: string;
  typed: string;
  x: number;
  color: string;
  duration: number;
  popped?: boolean;
  /** Instante em que a torta entra na área visível (anti-dica-antecipada). */
  visibleAfter: number;
};

/** Fração do `speed` até a palavra da torta ser visível acima do teclado.
 *  O card branco da palavra fica no topo do SVG, acima da cara fofinha —
 *  aparece antes da torta inteira. */
const VISIBLE_GRACE_FRACTION = 0.3;

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
  const [paused, setPaused] = useState(false);
  const nextIdRef = useRef(0);
  const { stats, registerHit, registerMiss, reset } = useTypingStats();

  const piesRef = useRef<PieItem[]>([]);
  const activeIdRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const clearedRef = useRef(0);
  const pausedRef = useRef(false);
  const statsStartedAtRef = useRef<number | null>(null);
  const statsCorrectRef = useRef(0);
  const statsTotalRef = useRef(0);

  piesRef.current = pies;
  activeIdRef.current = activeId;
  finishedRef.current = !!finished;
  clearedRef.current = cleared;
  pausedRef.current = paused;
  statsStartedAtRef.current = stats.startedAt;
  statsCorrectRef.current = stats.correct;
  statsTotalRef.current = stats.total;

  const difficulty = useGame((s) => s.difficulty);
  const speed = (level.speed ?? 10) * DIFFICULTY_SPEED_MULTIPLIER[difficulty];

  // Nudge de render depois do mount — mesma mitigação do BalloonMode pra
  // quando a navegação é por Enter e o keydown ainda está propagando.
  useEffect(() => {
    window.scrollTo(0, 0);
    const id = window.requestAnimationFrame(() => {
      setCleared((c) => c);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Ticker: só dá dica quando a torta já entrou na área visível.
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const aid = activeIdRef.current;
      const active = aid !== null ? piesRef.current.find((p) => p.id === aid && !p.popped) : undefined;
      if (active) {
        const ch = active.word[active.typed.length]?.toLowerCase();
        setNextLetter((prev) => (prev === ch ? prev : ch));
        return;
      }
      const alive = piesRef.current.find((p) => !p.popped && now >= p.visibleAfter);
      const ch = alive?.word[0]?.toLowerCase();
      setNextLetter((prev) => (prev === ch ? prev : ch));
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (finished || paused) return;
    const baseMax = level.maxAtOnce ?? 2;
    const maxAtOnce = effectiveMaxAtOnce(baseMax, difficulty);
    // Checa spawn rápido (700ms); aliveCount controla densidade.
    const every = 700;
    // Tortas são mais largas que balões: exige mais espaçamento horizontal.
    const MIN_DIST = 38;
    const doSpawn = () => {
      if (finishedRef.current || pausedRef.current) return;
      const alive = piesRef.current.filter((x) => !x.popped);
      if (alive.length >= maxAtOnce) return;
      const nid = ++nextIdRef.current;
      const word = level.pool[Math.floor(Math.random() * level.pool.length)];
      const x = pickSpawnX(alive.map((p) => p.x), { minDist: MIN_DIST, range: [5, 85] });
      setPies((b) => [
        ...b,
        {
          id: nid,
          word,
          typed: '',
          x,
          color: pieColor(nid),
          duration: speed,
          visibleAfter: Date.now() + speed * 1000 * VISIBLE_GRACE_FRACTION,
        },
      ]);
    };
    doSpawn();
    const id = setInterval(doSpawn, every);
    return () => clearInterval(id);
  }, [finished, paused, speed, level.pool, level.maxAtOnce, difficulty]);

  useEffect(() => {
    // Limpa tortinhas na pausa OU no final da lição.
    if (paused || finished) {
      setPies([]);
      setActiveId(null);
    }
  }, [paused, finished]);

  const { inputEl } = useTypingInput({
    enabled: !paused && !finished,
    onChar: (ch) => {
      if (finishedRef.current || pausedRef.current) return;
      unlockAudio();
      const lk = ch.toLowerCase();
      setLastKey(baseKey(ch));
      window.setTimeout(() => setLastKey((k) => (k === baseKey(ch) ? undefined : k)), 120);
      playKey();

      let targetId = activeIdRef.current;
      if (targetId === null) {
        // Só considera tortas que já passaram pela janela de graça.
        const now = Date.now();
        const candidate = piesRef.current.find(
          (p) => !p.popped && p.typed === '' && now >= p.visibleAfter && p.word[0].toLowerCase() === lk
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
    },
    onBackspace: () => {
      if (finishedRef.current || pausedRef.current) return;
      const aid = activeIdRef.current;
      if (aid !== null) {
        setPies((list) => list.map((p) => (p.id === aid ? { ...p, typed: p.typed.slice(0, -1) } : p)));
      }
    },
    onEscape: () => {
      // Esc só PAUSA (igual ao botão). Saída é só pelos botões do overlay.
      if (!finishedRef.current) setPaused(true);
    },
  });

  const handleEscape = useCallback((id: number) => {
    setPies((list) => {
      const p = list.find((x) => x.id === id);
      // Não conta erro se a lição já acabou ou está pausada.
      if (p && !p.popped && !finishedRef.current && !pausedRef.current) {
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
        onPause={finished ? undefined : () => setPaused(true)}
      />

      <div className="absolute left-3 bottom-28 hidden md:block">
        <Mascot mood={finished ? 'cheer' : 'happy'} size={100} />
      </div>

      <div className="absolute top-36 md:top-28 right-3 bg-white/70 rounded-2xl px-3 py-2 backdrop-blur shadow-pop text-sm space-y-1">
        <div>🥧 <b>{cleared}</b>/{level.target}</div>
        <div>💨 <b>{missed}</b></div>
        <div>🎯 <b>{Math.round(stats.displayAccuracy)}%</b></div>
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
        <Keyboard highlight={nextLetter ? baseKey(nextLetter) : undefined} lastPressed={lastKey} compact showNumbers={levelHasDigits(level)} />
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

      {paused && !finished && (
        <PauseOverlay
          onResume={() => setPaused(false)}
          onHome={onHome}
          onRestart={() => {
            reset();
            setCleared(0);
            setMissed(0);
            setPies([]);
            setActiveId(null);
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
