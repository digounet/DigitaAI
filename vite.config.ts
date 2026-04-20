import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serve em https://digounet.github.io/DigitaAI/
// Em dev (npm run dev) usamos '/'; no build para produção, '/DigitaAI/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/DigitaAI/' : '/',
  plugins: [react()],
}));
