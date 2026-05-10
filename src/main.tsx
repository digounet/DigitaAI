import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerPWA } from './pwa'

// Marca este browser como "já entrou no curso". A landing em / lê esse flag
// e redireciona automaticamente pro /jogar/ em visitas seguintes, evitando
// fricção pra quem já conhece o app. Crawlers não executam JS, então
// sempre indexam a landing.
try { localStorage.setItem('digitai_returning', '1') } catch { /* ignore */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerPWA()
