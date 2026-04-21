import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BalloonMode } from '../modes/BalloonMode';
import { PieMode } from '../modes/PieMode';
import { TextMode } from '../modes/TextMode';
import { ClimbMode } from '../modes/ClimbMode';
import { LEVELS, getNextLevel } from '../data/levels';
import { useGame } from '../store/gameStore';

export function Play() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { recordLevel } = useGame();

  const level = useMemo(() => LEVELS.find((l) => l.id === levelId), [levelId]);

  const onFinish = useCallback(
    (stars: number, wpm: number, accuracy: number) => {
      if (!level) return;
      recordLevel(level.id, { stars, wpm, accuracy });
    },
    [level, recordLevel]
  );

  const onHome = () => navigate('/');
  const onRetry = () => {
    if (!level) return;
    navigate(`/play/${level.id}`, { replace: true });
  };
  const onNext = level ? (() => {
    const next = getNextLevel(level);
    if (next) navigate(`/play/${next.id}`);
    else navigate('/');
  }) : undefined;

  if (!level) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Nível não encontrado</h2>
        <button className="px-4 py-2 bg-candy text-white rounded-2xl" onClick={onHome}>
          Voltar para o início
        </button>
      </div>
    );
  }

  // force remount quando troca de nível (evita estado residual)
  const key = level.id;

  switch (level.mode) {
    case 'balloons':
      return (
        <BalloonMode
          key={key}
          level={level}
          onFinish={onFinish}
          onHome={onHome}
          onRetry={onRetry}
          onNext={onNext}
        />
      );
    case 'pies':
      return (
        <PieMode
          key={key}
          level={level}
          onFinish={onFinish}
          onHome={onHome}
          onRetry={onRetry}
          onNext={onNext}
        />
      );
    case 'sentence':
      return (
        <TextMode
          key={key}
          level={level}
          onFinish={onFinish}
          onHome={onHome}
          onRetry={onRetry}
          onNext={onNext}
        />
      );
    case 'text':
      return (
        <TextMode
          key={key}
          level={level}
          onFinish={onFinish}
          onHome={onHome}
          onRetry={onRetry}
          onNext={onNext}
          isText
        />
      );
    case 'climb':
      return (
        <ClimbMode
          key={key}
          level={level}
          onFinish={onFinish}
          onHome={onHome}
          onRetry={onRetry}
          onNext={onNext}
        />
      );
  }
}
