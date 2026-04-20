import { useEffect, useRef } from 'react';

type Options = {
  onChar: (ch: string) => void;
  onEscape?: () => void;
  onBackspace?: () => void;
};

/**
 * Captura digitação via <input> invisível + evento `input`,
 * suportando caracteres compostos com dead keys (ã, ç, é) em
 * teclados US/US-Internacional onde o usuário pressiona:
 *   - Option+N + A  → ã
 *   - Option+C      → ç
 *   - ' + c         → ç  (US Internacional)
 *
 * IMPORTANTE: durante a composição (dead key até confirmar), o navegador
 * dispara eventos `input` com caracteres intermediários (o próprio acento).
 * Ignoramos enquanto `isComposing` está ativo e processamos o caractere
 * final SOMENTE no `compositionend`. Sem isso, a precisão despenca porque
 * o acento cru é contado como tecla errada.
 */
export function useTypingInput(opts: Options) {
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Refocus se o input perder foco (útil depois de clicar em botões modais).
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

  const drain = (el: HTMLInputElement) => {
    const val = el.value;
    if (val) {
      for (const ch of val) optsRef.current.onChar(ch);
      el.value = '';
    }
  };

  const inputEl = (
    <input
      ref={inputRef}
      onInput={(e) => {
        // InputEvent.isComposing = true durante dead key. Ignoramos nesses
        // instantes — processaremos no compositionend.
        const ie = e.nativeEvent as InputEvent;
        if (ie.isComposing) return;
        drain(e.currentTarget);
      }}
      onCompositionEnd={(e) => {
        // `e.data` traz o caractere final resolvido (ã, ç...). Preferimos
        // `drain(input)` pra ler o value atual — mais robusto entre browsers.
        drain(e.currentTarget as HTMLInputElement);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          optsRef.current.onEscape?.();
        } else if (e.key === 'Backspace') {
          // Também ignoramos backspace dentro de composição — não é "apagar
          // o que já digitou", é o navegador cancelando o dead key.
          if ((e.nativeEvent as KeyboardEvent).isComposing) return;
          optsRef.current.onBackspace?.();
        }
      }}
      onBlur={() => {
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
