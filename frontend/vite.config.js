import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'FinanceAI',
        short_name: 'FinanceAI',
        description: 'Seu copiloto financeiro pessoal',
        theme_color: '#10b981',
        background_color: '#f8fafc',
        display: 'fullscreen',
        orientation: 'portrait',
        scope: '/',
        start_url: '/dashboard',
        lang: 'pt-BR',
        categories: ['finance', 'productivity'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/back\.financeai\.orderup\.com\.br\/.*/,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /\/auth\/.*/,
            handler: 'NetworkOnly'
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\//]
      }
    })
  ],
  server: {
    port: 5173
  }
});
