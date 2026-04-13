import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  base: '/static/vue/',
  build: {
    outDir: '../IALocalProject/static/vue',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/models': 'http://localhost:5000',
      '/ask': 'http://localhost:5000',
      '/history': 'http://localhost:5000',
      '/clear_history': 'http://localhost:5000',
      '/prompts': 'http://localhost:5000',
    },
  },
})
