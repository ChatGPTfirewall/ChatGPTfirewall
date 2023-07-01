import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "../backend/static",
        emptyOutDir: true,
        sourcemap: true
    },
    server: {
        proxy: {
            "/api/context": "http://127.0.0.1:5000",
            '/upload': {
                target: "http://127.0.0.1:5000", // Geben Sie hier die URL Ihres Backend-Servers an
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/upload/, ''),
              },    
        }
    }
});
