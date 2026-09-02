// @vitest-environment node
//
// This file only reads a source file from disk; it needs no DOM. Forcing the
// node environment (rather than the project-wide jsdom default) matters here
// for a real reason: under jsdom, `new URL(relative, import.meta.url)`
// resolves against jsdom's synthetic `http://localhost:3000/` location
// instead of the file: base, so `readFileSync(new URL(...))` never finds
// LanguageChart.tsx. Running this file in node keeps
// `new URL('../LanguageChart.tsx', import.meta.url)` resolving to a real
// file: URL, exactly as intended.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

describe('LanguageChart echarts import', () => {
  it('imports the ESM core build, not the CJS one', () => {
    // echarts-for-react/lib/core is CommonJS; Vite's interop hands React an
    // object instead of a component and /about crashes at runtime. The esm/
    // build has a real default export. jsdom cannot catch this — it never
    // mounts the chart (no canvas) and Vitest's transform honours the
    // __esModule flag the CJS build sets — so this guards the specifier
    // itself rather than pretending to test behaviour.
    const src = readFileSync(new URL('../LanguageChart.tsx', import.meta.url), 'utf8')
    expect(src).toMatch(/from 'echarts-for-react\/esm\/core'/)
    expect(src).not.toMatch(/from 'echarts-for-react\/lib\/core'/)
    expect(src).not.toMatch(/from 'echarts-for-react'/)
  })
})
