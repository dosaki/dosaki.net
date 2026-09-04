import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { substituteHtmlMeta } from './src/content/htmlMeta'

/**
 * Fills index.html's %SITE_*% placeholders from site.meta, so the document
 * title and description have one source. They must stay in the static HTML —
 * social scrapers do not run JavaScript — but they need not be written twice.
 */
const siteMeta = {
  name: 'site-meta',
  transformIndexHtml: { order: 'pre' as const, handler: substituteHtmlMeta },
}

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      // Tests live beside the routes they exercise; keep the plugin from
      // treating them as route files.
      routeFileIgnorePattern: '.*\\.test\\.tsx?$',
    }),
    react(),
    siteMeta,
  ],
  build: {
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
