import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose server on all network interfaces (0.0.0.0)
    port: 3000,
    // Note: The proxy is optional since we're using axios with auto-detected baseURL
    // But keeping it for development convenience when using localhost
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})


