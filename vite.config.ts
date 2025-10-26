import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Teleprompter-Pro/',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
