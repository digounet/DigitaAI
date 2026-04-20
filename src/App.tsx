import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Play } from './pages/Play';
import { useLeaderboardSync } from './hooks/useLeaderboardSync';
import { useGame } from './store/gameStore';
import { setMuted } from './audio/sfx';
import { setMusicEnabled, setMusicSuppressed } from './audio/music';
import './App.css';

const Diagnostic = lazy(() => import('./pages/Diagnostic').then((m) => ({ default: m.Diagnostic })));
const Ranking = lazy(() => import('./pages/Ranking').then((m) => ({ default: m.Ranking })));

const Loading = () => (
  <div className="flex-1 flex items-center justify-center text-lg text-gray-500">Carregando…</div>
);

/** Sincroniza os toggles da store com os players de áudio, globalmente. */
function useAudioSync() {
  const soundOn = useGame((s) => s.soundOn);
  const musicOn = useGame((s) => s.musicOn);
  useEffect(() => {
    setMuted(!soundOn);
    setMusicSuppressed(!soundOn);
  }, [soundOn]);
  useEffect(() => {
    setMusicEnabled(musicOn && soundOn);
  }, [musicOn, soundOn]);
}

function App() {
  useLeaderboardSync();
  useAudioSync();

  return (
    <HashRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Diagnostic />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/play/:levelId" element={<Play />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
