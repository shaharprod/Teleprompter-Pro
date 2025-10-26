import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Teleprompter-Pro/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Teleprompter Pro',
        short_name: 'Teleprompter',
        description: 'A professional teleprompter application.',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        scope: '.',
        start_url: '.',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
    })
  ],
  define: {
    'process.env': process.env
  }
})
