import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: '/cellsim3d/',
  resolve: {
    alias: {
      'three/addons': fileURLToPath(
        new URL('./node_modules/three/examples/jsm', import.meta.url)
      )
    }
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 1500
  },
  server: {
    port: 5173,
    open: true
  }
});