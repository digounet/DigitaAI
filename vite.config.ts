import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Publicado em https://digitai.app.br/ (domínio próprio no GitHub Pages).
// base './' gera paths relativos, funcionando tanto na URL padrão
// (digounet.github.io/DigitaAI/) quanto no domínio custom.
export default defineConfig({
  base: './',
  plugins: [react()],
});
