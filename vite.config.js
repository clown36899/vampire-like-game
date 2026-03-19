import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    port: 7777
  },
  build: {
    outDir: 'dist'
  }
})
