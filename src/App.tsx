import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Play } from './pages/Play';
import { MobileWarning } from './components/MobileWarning';
import { useLeaderboardSync } from './hooks/useLeaderboardSync';
import { useUserProgressSync } from './hooks/useUserProgressSync';
import { useGame } from './store/gameStore';
import { setMuted } from './audio/sfx';
import { setMusicEnabled } from './audio/music';
import './App.css';

const Diagnostic = lazy(() => import('./pages/Diagnostic').then((m) => ({ default: m.Diagnostic })));
const Ranking = lazy(() => import('./pages/Ranking').then((m) => ({ default: m.Ranking })));
const Pro = lazy(() => import('./pages/Pro').then((m) => ({ default: m.Pro })));

const Loading = () => (
  <div className="flex-1 flex items-center justify-center text-lg text-gray-500">Carregando…</div>
);

/** Sincroniza os toggles da store com os players de áudio, globalmente.
 *  🔊 soundOn → apenas efeitos sonoros (teclas, pop, fanfarra).
 *  🎵 musicOn → apenas música de fundo. Totalmente independentes. */
function useAudioSync() {
  const soundOn = useGame((s) => s.soundOn);
  const musicOn = useGame((s) => s.musicOn);
  useEffect(() => {
    setMuted(!soundOn);
  }, [soundOn]);
  useEffect(() => {
    setMusicEnabled(musicOn);
  }, [musicOn]);
}

function App() {
  useLeaderboardSync();
  useUserProgressSync();
  useAudioSync();

  return (
    <HashRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Diagnostic />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/pro" element={<Pro />} />
          <Route path="/play/:levelId" element={<Play />} />
        </Routes>
      </Suspense>
      <MobileWarning />
    </HashRouter>
  );
}

export default App;
