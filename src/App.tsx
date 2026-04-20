import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Play } from './pages/Play';
import { useLeaderboardSync } from './hooks/useLeaderboardSync';
import './App.css';

// Code-split: Diagnostic e Ranking não são críticos na primeira tela.
const Diagnostic = lazy(() => import('./pages/Diagnostic').then((m) => ({ default: m.Diagnostic })));
const Ranking = lazy(() => import('./pages/Ranking').then((m) => ({ default: m.Ranking })));

const Loading = () => (
  <div className="flex-1 flex items-center justify-center text-lg text-gray-500">Carregando…</div>
);

function App() {
  useLeaderboardSync();

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
