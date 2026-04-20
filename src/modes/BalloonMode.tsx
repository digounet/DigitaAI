import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Balloon, balloonColor } from '../components/Balloon';
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
  /** Momento em que o balão já está visível na tela (após o delay de entrada). */
  visibleAfter: number;
};

/**
 * Fração do `speed` (tempo total de travessia) que a LETRA do balão leva
 * pra ficar visível acima do teclado virtual. A letra é desenhada no alto
 * do SVG do balão (y=58 de 128, ~45% do topo), por isso aparece antes do
 * balão estar inteiro acima do teclado.
 *
 * 25% = momento em que a letra está emergindo pra cima do teclado.
 * Escala com o speed (7s → 1.75s, 10s → 2.5s).
 */
const VISIBLE_GRACE_FRACTION = 0.25;

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

  const difficulty = useGame((s) => s.difficulty);
  const speed = (level.speed ?? 6) * DIFFICULTY_SPEED_MULTIPLIER[difficulty];

  // Reset de scroll e "nudge" de render: depois do mount inicial, forçamos
  // um update num próximo frame pra garantir que layout + AnimatePresence +
  // spawn se reestabelecem mesmo quando a navegação foi disparada via Enter
  // (onde o keydown ainda estava propagando durante o mount).
  useEffect(() => {
    window.scrollTo(0, 0);
    const id = window.requestAnimationFrame(() => {
      // noop — só força um commit extra. O próprio RAF já garante que o
      // React reconcilie uma vez depois do layout inicial.
      setCleared((c) => c);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Atualiza "próxima letra-alvo" com ticker — precisa ser periódico porque
  // a visibilidade depende do tempo (visibleAfter), não só do state.
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const visible = balloonsRef.current.find((b) => !b.popped && now >= b.visibleAfter);
      setNextTargetLetter((prev) => (prev === visible?.letter ? prev : visible?.letter));
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, []);

  // spawn periódico — depende só do nível, não de balloons state (usa ref).
  useEffect(() => {
    if (finished || paused) return;
    const baseMax = level.maxAtOnce ?? Math.min(3, 1 + Math.floor(level.target / 8));
    const maxAtOnce = effectiveMaxAtOnce(baseMax, difficulty);
    // Checa spawn a cada 500ms; a guarda `aliveCount >= maxAtOnce` controla a densidade.
    // Sem isso, com maxAtOnce=1 o jogo ficava esperando `speed` segundos ociosos entre balões.
    const spawnEvery = 500;
    // Balões são mais finos que tortas: espaçamento menor que o do PieMode.
    const MIN_DIST = 28;

    const doSpawn = () => {
      if (finishedRef.current || pausedRef.current) return;
      const alive = balloonsRef.current.filter((x) => !x.popped);
      if (alive.length >= maxAtOnce) return;
      const nid = ++nextIdRef.current;
      // Lições "Descubra X" usam `sequence` pra alternar tecla-guia ↔ letra
      // nova em ordem (F, T, F, T...) em vez de sortear aleatoriamente. O
      // contador é `nid`, que incrementa a cada spawn.
      const letter = level.sequence
        ? level.pool[(nid - 1) % level.pool.length]
        : level.pool[Math.floor(Math.random() * level.pool.length)];
      const x = pickSpawnX(alive.map((b) => b.x), { minDist: MIN_DIST, range: [5, 90] });
      setBalloons((b) => [
        ...b,
        {
          id: nid,
          letter,
          x,
          color: balloonColor(nid),
          duration: speed,
          visibleAfter: Date.now() + speed * 1000 * VISIBLE_GRACE_FRACTION,
        },
      ]);
    };

    doSpawn();
    const id = setInterval(doSpawn, spawnEvery);
    return () => clearInterval(id);
  }, [finished, paused, speed, level.target, level.pool, level.maxAtOnce, level.sequence, difficulty]);

  // Ao pausar ou finalizar, limpa balões pendentes pra não continuarem subindo
  // atrás do overlay/modal (e evita que eles contem como erro na métrica final).
  useEffect(() => {
    if (paused || finished) setBalloons([]);
  }, [paused, finished]);

  const { inputEl } = useTypingInput({
    enabled: !paused && !finished,
    onChar: (ch) => {
      if (finishedRef.current || pausedRef.current) return;
      unlockAudio();
      const key = ch.toLowerCase();
      setLastKey(baseKey(ch));
      window.setTimeout(() => setLastKey((k) => (k === baseKey(ch) ? undefined : k)), 120);
      playKey();

      const now = Date.now();
      const target = balloonsRef.current.find(
        (b) => !b.popped && now >= b.visibleAfter && b.letter.toLowerCase() === key
      );
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
      // Esc = mesma ação do botão ⏸️: só PAUSA. Saída da pausa só
      // pelos botões do overlay (evita fechar sem querer).
      if (!finishedRef.current) setPaused(true);
    },
  });

  const handleBalloonEscape = useCallback((id: number) => {
    setBalloons((list) => {
      const item = list.find((b) => b.id === id);
      // Não conta como erro quando a lição já terminou ou está pausada —
      // balão escapando depois do resultado não deve mexer na pontuação.
      if (item && !item.popped && !finishedRef.current && !pausedRef.current) {
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

      <div className="absolute top-36 md:top-28 right-3 bg-white/70 rounded-2xl px-3 py-2 backdrop-blur shadow-pop text-sm space-y-1">
        <div>🎈 <b>{cleared}</b>/{level.target}</div>
        <div>💨 <b>{missed}</b></div>
        <div>🎯 <b>{Math.round(stats.displayAccuracy)}%</b></div>
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
        <Keyboard highlight={nextTargetLetter ? baseKey(nextTargetLetter) : undefined} lastPressed={lastKey} compact showNumbers={levelHasDigits(level)} />
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
