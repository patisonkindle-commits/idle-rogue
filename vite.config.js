import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/phaser')) return 'phaser'
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8084
  }
})