import { useEffect, useRef } from 'react';

type Options = {
  onChar: (ch: string) => void;
  onEscape?: () => void;
  onBackspace?: () => void;
  /**
   * Quando false, o input invisível para de puxar foco (no mount, no tick
   * e no blur). Usado pelos modes pra liberar foco pros modais de pausa
   * e resultado navegarem por teclado.
   */
  enabled?: boolean;
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
  const enabled = opts.enabled ?? true;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  // Flag ativa durante auto-repeat do SO: fica true do 2º keydown em diante
  // até o keyup correspondente. `onInput` descarta eventos enquanto está true.
  // Backup pro `preventDefault` do keydown — que nem sempre bloqueia o input
  // em tempo em alguns browsers, deixando passar repetições indesejadas.
  const repeatingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    inputRef.current?.focus();
  }, [enabled]);

  // Esc como listener global (capture) — independente de onde está o foco.
  // Antes dependíamos de o `<input>` estar focado pra o onKeyDown pegar;
  // se o foco tivesse mudado pra um botão do HUD (via setas), Esc escapava
  // e caía no comportamento default do navegador (podia disparar o click
  // do Link focado, navegando pra /). Agora:
  //  - Capture pra ganhar de qualquer outro handler
  //  - Só age se `enabled` (game rodando, não pausado, não terminado)
  //  - preventDefault + stopPropagation pra garantir que nada mais receba
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (!enabledRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      optsRef.current.onEscape?.();
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  // Refocus se o input perder foco (útil depois de clicar em botões modais).
  // Mas só quando `enabled`: modais querem o foco nos seus botões e o tick
  // roubaria de volta.
  useEffect(() => {
    const tick = () => {
      if (!enabledRef.current) return;
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
        // Durante auto-repeat do SO, o preventDefault do keydown nem sempre
        // bloqueia este input em tempo (Safari especialmente). Descartamos
        // aqui também pra garantir.
        if (repeatingRef.current) {
          e.currentTarget.value = '';
          return;
        }
        drain(e.currentTarget);
      }}
      onCompositionEnd={(e) => {
        if (repeatingRef.current) {
          (e.currentTarget as HTMLInputElement).value = '';
          return;
        }
        drain(e.currentTarget as HTMLInputElement);
      }}
      onKeyDown={(e) => {
        // Auto-repeat do SO: do 2º disparo em diante, `e.repeat` é true.
        // Marcamos a flag e pedimos preventDefault (ainda que onInput tenha
        // um backup).
        if (e.repeat) {
          repeatingRef.current = true;
          e.preventDefault();
          return;
        }
        // Key nova apertada → reset da flag.
        repeatingRef.current = false;
        // Esc é tratado no listener global (useEffect acima). Aqui só Backspace.
        if (e.key === 'Backspace') {
          if ((e.nativeEvent as KeyboardEvent).isComposing) return;
          optsRef.current.onBackspace?.();
          return;
        }
        // Espaço: alguns combos de teclado (IME PT-BR, autocomplete de mobile,
        // corretor) engolem o espaço no pipeline do onInput do input escondido.
        // Tratamos explicitamente no keydown e impedimos o default pra garantir
        // que chegue no onChar. Espaço nunca faz parte de composição dead-key.
        if (e.key === ' ') {
          if ((e.nativeEvent as KeyboardEvent).isComposing) return;
          e.preventDefault();
          // Drena texto pendente (ex: "l" ainda não processado) antes do espaço.
          const el = e.currentTarget;
          if (el.value) {
            for (const ch of el.value) optsRef.current.onChar(ch);
            el.value = '';
          }
          optsRef.current.onChar(' ');
        }
      }}
      onKeyUp={() => {
        // Tecla solta → próximo keydown da mesma tecla não é repeat.
        repeatingRef.current = false;
      }}
      onBlur={() => {
        requestAnimationFrame(() => {
          if (enabledRef.current) inputRef.current?.focus();
        });
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
