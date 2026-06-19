import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base is '/' for local/Netlify/Vercel. For GitHub Pages project sites,
// set base to '/<repo-name>/' (or via the BASE_PATH env var).
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
})
