import { useEffect, useRef, useState } from 'react';

/**
 * Navegação por setas + Enter pros modais do jogo (pausa, resultado).
 * O jogo é todo por teclado — os modais não podem exigir mouse.
 *
 * Retorna:
 *   - btnRef(i): ref callback pra cada botão; chame como `ref={btnRef(0)}`.
 *   - focused: índice do botão focado.
 *   - onEscape opcional: fecha/continua quando usuário aperta Esc.
 *
 * As setas ↑↓←→ ciclam entre os botões. Enter/Space aciona o focado.
 * O handler é registrado no window e usa `capture:true` — modais cobrem
 * tudo e qualquer foco restante (input invisível, botões do HUD) não deve
 * interceptar as setas.
 */
export function useModalKeyboardNav(count: number, opts?: {
  defaultIndex?: number;
  onEscape?: () => void;
}) {
  const [focused, setFocused] = useState(opts?.defaultIndex ?? 0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusedRef = useRef(focused);
  focusedRef.current = focused;
  const countRef = useRef(count);
  countRef.current = count;
  const onEscapeRef = useRef(opts?.onEscape);
  onEscapeRef.current = opts?.onEscape;

  // Ao montar (ou quando muda o default), foca no botão certo.
  useEffect(() => {
    const id = window.setTimeout(() => {
      refs.current[focusedRef.current]?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Setas e Enter. Usa capture pra ganhar de qualquer listener interno.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const n = countRef.current;
      if (n === 0) return;
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          setFocused((i) => {
            const next = (i - 1 + n) % n;
            refs.current[next]?.focus();
            return next;
          });
          break;
        case 'ArrowDown':
        case 'ArrowRight':
        case 'Tab':
          e.preventDefault();
          e.stopPropagation();
          setFocused((i) => {
            const next = (i + 1) % n;
            refs.current[next]?.focus();
            return next;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          refs.current[focusedRef.current]?.click();
          break;
        case 'Escape':
          if (onEscapeRef.current) {
            e.preventDefault();
            e.stopPropagation();
            onEscapeRef.current();
          }
          break;
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  const btnRef = (i: number) => (el: HTMLButtonElement | null) => {
    refs.current[i] = el;
  };

  return { btnRef, focused };
}
