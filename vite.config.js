import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
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