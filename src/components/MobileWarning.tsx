import { useEffect, useState } from 'react';

const DISMISS_KEY = 'digitaai:mobile-warning-dismissed';

/**
 * Avisa que o app precisa de teclado físico quando detecta dispositivo
 * touch-only (celular/tablet sem teclado). Se o usuário tiver teclado
 * externo conectado, o aviso some automaticamente no primeiro keydown
 * físico. Também oferece um botão "continuar" manual — a escolha fica
 * persistida em localStorage.
 */
export function MobileWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    // `hover: none` + `pointer: coarse` ≈ touch-only (não-laptop, não-desktop).
    // Chromebook touchscreen tipicamente tem `hover: hover` (mouse/trackpad).
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    if (mq.matches) setShow(true);
  }, []);

  // Se o usuário usar teclado físico (qualquer keydown com `code`), some.
  // Teclado virtual do iOS/Android geralmente dispara keydown com `code=""`.
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code && e.code.length > 0) {
        localStorage.setItem(DISMISS_KEY, '1');
        setShow(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show]);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-bubbly p-6 md:p-8 max-w-md text-center">
        <div className="text-6xl mb-3">⌨️</div>
        <h2 className="text-2xl md:text-3xl font-bold text-candy mb-3">
          Precisamos de um teclado!
        </h2>
        <p className="text-gray-700 mb-3 md:text-lg">
          O <b>DigitAI</b> é pra aprender a digitar de verdade — com os dez dedos
          num teclado de computador.
        </p>
        <p className="text-sm text-gray-500 mb-5">
          No celular ou tablet sem teclado não dá pra praticar direito.
          Se você tiver um <b>teclado externo</b> conectado, pode continuar
          normalmente (é só começar a digitar).
        </p>
        <button
          onClick={dismiss}
          className="bg-grass text-white font-bold px-6 py-3 rounded-2xl shadow-pop hover:scale-105 active:scale-95 transition text-lg"
        >
          Tenho teclado, continuar ▶
        </button>
      </div>
    </div>
  );
}
