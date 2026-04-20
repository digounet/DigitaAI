import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mascot } from '../components/Mascot';
import { Keyboard } from '../components/Keyboard';
import { FINGER_COLORS, FINGER_NAMES, fingerFor } from '../data/fingers';
import { LEVELS, recommendLevelId } from '../data/levels';
import { useGame } from '../store/gameStore';
import { playError, playKey, playLevelUp, unlockAudio } from '../audio/sfx';

// Frase curta que exercita várias linhas do teclado.
const TEST_PHRASE = 'o sol brilha no ceu azul enquanto o gato pula no muro';
const TEST_DURATION_SEC = 45;

type Phase = 'intro' | 'typing' | 'done';

export function Diagnostic() {
  const navigate = useNavigate();
  const { applyDiagnostic, skipDiagnostic } = useGame();
  const [phase, setPhase] = useState<Phase>('intro');
  const [typed, setTyped] = useState('');
  const [errors, setErrors] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [lastKey, setLastKey] = useState<string>();
  const timerRef = useRef<number | null>(null);

  // timer
  useEffect(() => {
    if (phase !== 'typing' || !startedAt) return;
    timerRef.current = window.setInterval(() => {
      const e = (Date.now() - startedAt) / 1000;
      setElapsed(e);
      if (e >= TEST_DURATION_SEC) finish();
    }, 200);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, startedAt]);

  const nextChar = TEST_PHRASE[typed.length] ?? '';
  const finger = fingerFor(nextChar);

  // teclado
  useEffect(() => {
    if (phase !== 'typing') return;
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === 'Backspace') {
        setTyped((t) => t.slice(0, -1));
        return;
      }
      if (k.length !== 1) return;
      unlockAudio();
      setLastKey(k.toLowerCase());
      setTimeout(() => setLastKey(undefined), 120);
      const expected = TEST_PHRASE[typed.length];
      if (!expected) return;
      if (k.toLowerCase() === expected.toLowerCase()) {
        playKey();
        const nt = typed + expected;
        setTyped(nt);
        if (nt === TEST_PHRASE) finish();
      } else {
        playError();
        setErrors((n) => n + 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, typed]);

  const start = () => {
    unlockAudio();
    setTyped('');
    setErrors(0);
    setElapsed(0);
    setStartedAt(Date.now());
    setPhase('typing');
  };

  const finish = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setPhase('done');
    playLevelUp();
  };

  const result = useMemo(() => {
    if (phase !== 'done' || !startedAt) return null;
    const secs = Math.max(1, (Date.now() - startedAt) / 1000);
    const minutes = secs / 60;
    const correctChars = typed.length;
    const wpm = correctChars / 5 / minutes;
    const total = correctChars + errors;
    const accuracy = total === 0 ? 0 : (correctChars / total) * 100;
    const recId = recommendLevelId(wpm, accuracy);
    const rec = LEVELS.find((l) => l.id === recId)!;
    return { wpm, accuracy, correctChars, errors, recId, rec };
  }, [phase, startedAt, typed, errors]);

  const applyAndGo = () => {
    if (!result) return;
    applyDiagnostic(result.recId, result.wpm, result.accuracy);
    navigate(`/play/${result.recId}`);
  };

  const remaining = Math.max(0, TEST_DURATION_SEC - Math.floor(elapsed));

  return (
    <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden">
      <div className="absolute inset-0 clouds-bg pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="h-10 px-4 rounded-full bg-white/85 shadow-pop flex items-center gap-2 hover:scale-105 active:scale-95 transition"
          >
            🏠 <span className="font-bold">Início</span>
          </Link>
          {phase === 'intro' && (
            <button
              onClick={() => {
                skipDiagnostic();
                navigate('/');
              }}
              className="text-sm text-gray-600 hover:underline"
            >
              Pular e começar do zero
            </button>
          )}
        </div>

        {phase === 'intro' && (
          <div className="bg-white/90 rounded-3xl shadow-bubbly p-6 md:p-8 text-center">
            <div className="flex justify-center mb-2">
              <Mascot mood="wave" size={120} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-candy">Teste rapidinho!</h1>
            <p className="mt-3 text-gray-700 md:text-lg">
              Vou pedir pra você digitar uma frase curta. Não precisa ser rápido — digite do jeito que conseguir.
              Com o resultado, eu mostro o <b>nível certo</b> pra você começar.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <InfoPill emoji="⏱️" title={`${TEST_DURATION_SEC}s`} desc="duração máxima" />
              <InfoPill emoji="📝" title={`${TEST_PHRASE.split(' ').length} palavras`} desc="frase curtinha" />
              <InfoPill emoji="💪" title="sem estresse" desc="o que importa é tentar" />
            </div>
            <button
              onClick={start}
              className="mt-6 bg-grass text-white font-bold px-8 py-4 rounded-2xl shadow-pop hover:scale-105 active:scale-95 transition text-lg"
            >
              Começar teste ✨
            </button>
          </div>
        )}

        {phase === 'typing' && (
          <div>
            <div className="flex items-center justify-between bg-white/90 rounded-3xl shadow-bubbly p-3 md:p-4 mb-3">
              <div className="text-sm text-gray-700">
                {finger ? (
                  <>
                    Use o{' '}
                    <span className={`${FINGER_COLORS[finger]} px-2 py-0.5 rounded-full font-bold`}>
                      {FINGER_NAMES[finger]}
                    </span>
                  </>
                ) : (
                  'Digite a próxima letra 🎯'
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-sun/90 rounded-full px-3 py-1.5 font-bold shadow-pop">⏱️ {remaining}s</div>
                <button
                  onClick={finish}
                  className="text-xs bg-coral/80 text-white rounded-full px-3 py-1.5 shadow-pop hover:scale-105 transition"
                >
                  Encerrar agora
                </button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 rounded-3xl shadow-bubbly p-4 md:p-6"
            >
              <p className="font-mono text-xl md:text-2xl leading-relaxed break-words text-center">
                {TEST_PHRASE.split('').map((ch, i) => {
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
            </motion.div>

            <div className="mt-3">
              <Keyboard highlight={nextChar.toLowerCase()} lastPressed={lastKey} />
            </div>
          </div>
        )}

        {phase === 'done' && result && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 rounded-3xl shadow-bubbly p-6 md:p-8 text-center"
          >
            <div className="flex justify-center mb-2">
              <Mascot mood="cheer" size={120} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-candy">Prontinho!</h2>
            <div className="grid grid-cols-2 gap-3 my-6 max-w-md mx-auto">
              <ResultPill label="⚡ Velocidade" value={`${Math.round(result.wpm)} PPM`} />
              <ResultPill label="🎯 Precisão" value={`${Math.round(result.accuracy)}%`} />
            </div>
            <p className="text-gray-700 mb-4 md:text-lg">
              Seu ponto de partida é:{' '}
              <span className="font-bold">
                {result.rec.emoji} {result.rec.title}
              </span>
              <br />
              <span className="text-sm text-gray-500">{result.rec.subtitle}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => setPhase('intro')}
                className="py-3 px-5 rounded-2xl bg-gray-200 font-bold hover:bg-gray-300 transition"
              >
                🔁 Refazer teste
              </button>
              <button
                onClick={applyAndGo}
                className="py-3 px-5 rounded-2xl bg-grass text-white font-bold hover:scale-[1.02] transition"
              >
                Começar aqui ➡️
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function InfoPill({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="bg-sky2 rounded-2xl p-3">
      <div className="text-2xl">{emoji}</div>
      <div className="font-bold">{title}</div>
      <div className="text-xs text-gray-600">{desc}</div>
    </div>
  );
}

function ResultPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-sky2 rounded-2xl p-4">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
