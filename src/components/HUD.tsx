import { Link } from 'react-router-dom';
import { useGame } from '../store/gameStore';
import { setMuted } from '../audio/sfx';
import { useEffect } from 'react';

type Props = {
  title?: string;
  subtitle?: string;
  progress?: number; // 0..1
  /** "Mundo 1 · Ilha das Letras" */
  worldLabel?: string;
  /** "Lição 3 de 13" */
  lessonLabel?: string;
  /** Emoji do mundo, exibido no crachá */
  worldEmoji?: string;
  right?: React.ReactNode;
  /** Se fornecido, mostra botão de pausar. */
  onPause?: () => void;
};

export function HUD({ title, subtitle, progress, worldLabel, lessonLabel, worldEmoji, right, onPause }: Props) {
  const { soundOn, toggleSound, totalStars } = useGame();

  useEffect(() => {
    setMuted(!soundOn);
  }, [soundOn]);

  return (
    <div className="fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center gap-3 px-3 md:px-6 py-3 bg-white/75 backdrop-blur shadow-bubbly rounded-b-3xl">
        <Link
          to="/"
          aria-label="Voltar para o início"
          className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-candy text-white flex items-center justify-center text-xl shadow-pop hover:scale-105 active:scale-95 transition"
        >
          🏠
        </Link>
        <div className="flex-1 min-w-0">
          {(worldLabel || lessonLabel) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5 text-[11px] md:text-xs">
              {worldLabel && (
                <span className="bg-grape/15 text-grape font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  {worldEmoji && <span>{worldEmoji}</span>}
                  <span className="truncate max-w-[16ch] md:max-w-none">{worldLabel}</span>
                </span>
              )}
              {lessonLabel && (
                <span className="bg-candy/15 text-candy font-bold px-2 py-0.5 rounded-full">
                  {lessonLabel}
                </span>
              )}
            </div>
          )}
          {title && <div className="font-bold text-lg md:text-xl truncate">{title}</div>}
          {subtitle && <div className="text-xs md:text-sm text-gray-600 truncate">{subtitle}</div>}
          {typeof progress === 'number' && (
            <div className="mt-1 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-grass to-mint transition-all duration-300"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-sun/90 flex items-center gap-1 shadow-pop">
            <span className="text-lg leading-none">⭐</span>
            <span className="font-bold">{totalStars()}</span>
          </div>
          {onPause && (
            <button
              onClick={onPause}
              aria-label="Pausar jogo"
              title="Pausar (Esc)"
              className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-grape text-white shadow-pop flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition"
            >
              ⏸️
            </button>
          )}
          <button
            onClick={toggleSound}
            aria-label={soundOn ? 'Desligar som' : 'Ligar som'}
            className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-white shadow-pop flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
          {right}
        </div>
      </div>
    </div>
  );
}
