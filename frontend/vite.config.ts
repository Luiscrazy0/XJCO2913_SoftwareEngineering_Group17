import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import { visualizer } from "rollup-plugin-visualizer"

const plugins = [
  react(),
  tailwindcss(),
]

if (process.env.ANALYZE) {
  plugins.push(visualizer({
    open: false,
    filename: 'dist/stats.html',
    gzipSize: true,
    brotliSize: true,
  }))
}

// https://vite.dev/config/
export default defineConfig({
  // Load env from repo root (../.env) so monorepo-level VITE_* vars work
  envDir: '..',
  plugins,
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
