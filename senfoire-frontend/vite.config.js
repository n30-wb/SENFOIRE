import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'hero.png'],
      manifest: {
        name: 'SENFOIRE - Foire Internationale Virtuelle',
        short_name: 'SENFOIRE',
        description: 'Plateforme de marché en ligne multi-vendeurs au Sénégal',
        theme_color: '#1e3a8a',
        background_color: '#0a0f1e',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/produits/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-produits',
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
            },
          },
          {
            urlPattern: /\/api\/mes-commandes/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-commandes',
              expiration: { maxEntries: 20, maxAgeSeconds: 1800 },
            },
          },
          {
            urlPattern: /\/api\/categories/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-categories',
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /\/api\/favoris/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-favoris',
              expiration: { maxEntries: 20, maxAgeSeconds: 1800 },
            },
          },
          {
            urlPattern: /\/storage\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'storage-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
    }),
  ],
})
