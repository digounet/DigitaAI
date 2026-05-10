import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

// Publicado em https://digitai.app.br/ (domínio próprio no GitHub Pages).
// base '/' gera paths absolutos — necessário pro BrowserRouter, já que
// rotas profundas (ex.: /jogar/play/abc) são servidas pelo 404.html do
// GitHub Pages e precisam carregar assets a partir da raiz.
//
// Build multi-page:
//   /          ← landing estática (raiz do projeto: index.html)
//   /jogar/    ← SPA React (jogar/index.html)
// Os artigos e páginas legais ficam em public/, copiados como estão.
export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'jogar/index.html'),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null, // registramos manualmente em main.tsx para controlar o prompt
      includeAssets: [
        'favicon.svg',
        'logo-square.svg',
        'logo.svg',
        'apple-touch-icon.png',
      ],
      manifest: {
        name: 'DigitAI — Aprender a digitar brincando',
        short_name: 'DigitAI',
        description: 'Curso de digitação infantil com balões, tortinhas e textos. Grátis, em português.',
        lang: 'pt-BR',
        // O SPA vive em /jogar/. A landing estática em / é o destino canônico
        // dos crawlers; PWA instalado pula direto pro curso.
        start_url: '/jogar/',
        scope: '/jogar/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#bde7ff',
        theme_color: '#7fd4ff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache só do app shell — MP3s ficam fora pra não pesar a instalação.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webp,ico}'],
        navigateFallback: '/jogar/index.html',
        // AdSense, analytics e afins NUNCA são interceptados pelo SW — exigido
        // pelas políticas do AdSense e evita servir anúncios obsoletos.
        // Páginas estáticas (institucional + blog) também ficam fora do
        // fallback: cada uma é um .html real servido pelo GitHub Pages, e
        // jogar o SPA shell por cima quebraria o conteúdo indexável.
        navigateFallbackDenylist: [
          /^\/pagead/,
          /googlesyndication\.com/,
          /doubleclick\.net/,
          /google-analytics\.com/,
          /googletagmanager\.com/,
          /^\/sobre(\/.*)?$/,
          /^\/contato(\/.*)?$/,
          /^\/privacidade(\/.*)?$/,
          /^\/termos(\/.*)?$/,
          /^\/artigos(\/.*)?$/,
          /^\/sitemap\.xml$/,
          /^\/robots\.txt$/,
        ],
        runtimeCaching: [
          // Músicas: CacheFirst — primeira audição baixa, depois fica offline.
          {
            urlPattern: /\/music\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'digitai-music',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 dias
              },
              rangeRequests: true, // importante pra áudio com seek
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // AdSense e família — passa reto, nunca cacheia.
          {
            urlPattern: /^https:\/\/(pagead2|tpc|ep1|ep2)\.googlesyndication\.com\/.*/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*\.doubleclick\.net\/.*/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*\.google-analytics\.com\/.*/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*\.googletagmanager\.com\/.*/,
            handler: 'NetworkOnly',
          },
          // Firebase/Firestore — NetworkFirst com fallback curto, pra quando
          // offline a UI resolve rápido em vez de travar esperando timeout.
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/identitytoolkit\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        enabled: false, // ative manualmente pra testar SW em dev
      },
    }),
  ],
});
