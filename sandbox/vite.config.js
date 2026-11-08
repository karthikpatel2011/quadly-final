import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Practice sandbox — a third, fully separate app (frontend=5173, backend=4000; sandbox=5174).
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
})
