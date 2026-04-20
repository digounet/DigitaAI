import { useEffect, useRef } from 'react';

type Options = {
  onChar: (ch: string) => void;
  onEscape?: () => void;
  onBackspace?: () => void;
};

/**
 * Captura digitação via <input> invisível + evento `input`,
 * suportando caracteres compostos com dead keys (ã, ñ, é) em
 * teclados US onde o usuário pressiona Option+N + A, Option+E + A etc.
 *
 * Esses caracteres NÃO vêm no `keydown` (que só vê a última tecla base),
 * então qualquer jogo que fica ouvindo `window.addEventListener('keydown')`
 * precisa migrar pra essa abordagem pra aceitar acentuação correta.
 */
export function useTypingInput(opts: Options) {
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Garante que o input recupera o foco se for perdido (ex: depois de clicar
  // num botão do overlay). Polling leve — simples e robusto.
  useEffect(() => {
    const tick = () => {
      const el = inputRef.current;
      if (!el) return;
      if (document.activeElement === document.body || document.activeElement === null) {
        el.focus();
      }
    };
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, []);

  const inputEl = (
    <input
      ref={inputRef}
      onInput={(e) => {
        const target = e.currentTarget;
        const val = target.value;
        if (val) {
          for (const ch of val) optsRef.current.onChar(ch);
          target.value = '';
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          optsRef.current.onEscape?.();
        } else if (e.key === 'Backspace') {
          optsRef.current.onBackspace?.();
        }
      }}
      onBlur={() => {
        // Refoca no próximo frame — depois do click handler do botão.
        requestAnimationFrame(() => inputRef.current?.focus());
      }}
      className="fixed -left-[9999px] top-0 w-0 h-0 opacity-0 pointer-events-none"
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      spellCheck={false}
      aria-hidden="true"
      tabIndex={-1}
      inputMode="text"
    />
  );

  return { inputEl };
}
