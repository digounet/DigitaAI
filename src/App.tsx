import { HashRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Play } from './pages/Play';
import { Diagnostic } from './pages/Diagnostic';
import './App.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Diagnostic />} />
        <Route path="/play/:levelId" element={<Play />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
