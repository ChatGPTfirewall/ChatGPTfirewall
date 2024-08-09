import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    watch: {
      usePolling: true,
      interval: 1000
    },
    host: true,
    strictPort: true,
    port: 5173,
    proxy: {
      '/api': 'http://backend:8000/'
    }
  }
});
