import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- FIX: SPA Fallback Routing Configuration ---
  server: {
    // Ensures history mode routing falls back to index.html during development.
    historyApiFallback: true, 
  },
  preview: {
    // Ensures the same fix is applied for local preview command
    historyApiFallback: true,
  }
  // ---
})