import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { mkdirSync, writeFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { pageMeta, substituteHtmlMeta } from './src/content/htmlMeta'

// Fills index.html's %SITE_*% placeholders, and writes a copy per in-site
// project page (e.g. build/projects/quaternion-cube/index.html) with that
// page's title, description and preview image.
let template = ''
const siteMeta: Plugin = {
  name: 'site-meta',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      template = html
      return substituteHtmlMeta(html)
    },
  },
  writeBundle({ dir }) {
    for (const [path, meta] of Object.entries(pageMeta)) {
      mkdirSync(`${dir}${path}`, { recursive: true })
      writeFileSync(`${dir}${path}/index.html`, substituteHtmlMeta(template, meta))
    }
  },
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
