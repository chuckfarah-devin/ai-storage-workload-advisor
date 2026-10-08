import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Production builds are served from GitHub Pages under the repo name;
  // the dev server (and Playwright e2e) stay at /.
  base: command === 'build' ? '/ai-storage-workload-advisor/' : '/',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
}))
