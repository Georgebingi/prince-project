import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
  // Allow ngrok/public hosts to access the Vite dev server during demos.
  // Use `true` to allow all hosts (typed-safe). For safety, replace with an array of exact hostnames, e.g.:
  // allowedHosts: ['737162775447.ngrok-free.app']
  allowedHosts: true,
  proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

})
