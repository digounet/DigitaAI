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
export function useToolbarKeyboardNav(count: number) {
  const [focused, setFocused] = useState(-1);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const focusedRef = useRef(focused);
  focusedRef.current = focused;
  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const n = countRef.current;
      if (n === 0) return;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocused((i) => (i <= 0 ? n - 1 : i - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocused((i) => (i < 0 ? 0 : (i + 1) % n));
          break;
        case 'Enter':
        case ' ':
          if (focusedRef.current >= 0) {
            e.preventDefault();
            refs.current[focusedRef.current]?.click();
          }
          break;
        case 'Escape':
          // Some visual do ring quando aperta Esc (sem perder a ação de pausa
          // que o mode já trata).
          setFocused(-1);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const btnRef = (i: number) => (el: HTMLElement | null) => {
    refs.current[i] = el;
  };

  return { btnRef, focused };
}
