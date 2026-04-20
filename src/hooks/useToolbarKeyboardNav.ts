import { useEffect, useRef, useState } from 'react';

/**
 * Navegação por setas ← → pra botões da toolbar (HUD).
 *
 * Diferenças vs `useModalKeyboardNav`:
 *   1. Não rouba foco do DOM — mantém só um índice visual (`focused`).
 *      Isso evita conflito com o input invisível do `useTypingInput` que
 *      fica refocando em loop durante o jogo.
 *   2. Usa bubble phase (sem capture). Modais com capture+stopPropagation
 *      bloqueiam a toolbar quando abertos.
 *   3. Começa com `focused = -1` (nada destacado). Só aparece ring depois
 *      que a criança pressiona uma seta pela primeira vez.
 *   4. Enter/Space aciona o botão focado via `.click()` (sem precisar de
 *      foco DOM real).
 */
type Opts = {
  /** "Pulo grande" pra ↑/↓ (ex: tamanho de linha num grid). Default = 1. */
  verticalStep?: number;
  /** Rola o elemento focado pra viewport quando muda. Default = false. */
  scrollIntoView?: boolean;
};

export function useToolbarKeyboardNav(count: number, opts: Opts = {}) {
  const [focused, setFocused] = useState(-1);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const focusedRef = useRef(focused);
  focusedRef.current = focused;
  const countRef = useRef(count);
  countRef.current = count;
  const stepRef = useRef(opts.verticalStep ?? 1);
  stepRef.current = opts.verticalStep ?? 1;
  const scrollRef = useRef(opts.scrollIntoView ?? false);
  scrollRef.current = opts.scrollIntoView ?? false;

  useEffect(() => {
    if (focused < 0 || !scrollRef.current) return;
    refs.current[focused]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focused]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const n = countRef.current;
      if (n === 0) return;
      const step = stepRef.current;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocused((i) => (i <= 0 ? n - 1 : i - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocused((i) => (i < 0 ? 0 : (i + 1) % n));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocused((i) => {
            if (i < 0) return 0;
            return Math.max(0, i - step);
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocused((i) => {
            if (i < 0) return 0;
            return Math.min(n - 1, i + step);
          });
          break;
        case 'Enter':
        case ' ':
          if (focusedRef.current >= 0) {
            e.preventDefault();
            const target = refs.current[focusedRef.current];
            // Deferimos o click pro próximo tick pra deixar o evento keydown
            // terminar antes de disparar navegação. Sem isso, .click() síncrono
            // rodava React Router pra navegar no meio do dispatch e a nova
            // página montava com efeitos iniciais que ficavam "engolidos"
            // pelo ciclo de evento ainda rolando.
            setTimeout(() => target?.click(), 0);
          }
          break;
        // Esc é tratado pelo mode/pausa — o hook não intercepta.
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const btnRef = (i: number) => (el: HTMLElement | null) => {
    refs.current[i] = el;
  };

  return { btnRef, focused, setFocused };
}
