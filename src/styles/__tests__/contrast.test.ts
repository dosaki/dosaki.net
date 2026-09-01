// @vitest-environment node
//
// This file only reads a CSS file from disk; it needs no DOM. Forcing the
// node environment (rather than the project-wide jsdom default) matters here
// for a real reason: under jsdom, `new URL(relative, import.meta.url)`
// resolves against jsdom's synthetic `http://localhost:3000/` location
// instead of the file: base, so `readFileSync(new URL(...))` never finds
// tokens.css. Running this file in node keeps `new URL('../tokens.css',
// import.meta.url)` resolving to a real file: URL, exactly as intended.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

/** Relative luminance per WCAG 2.1. */
function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const channels = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** Every `--name: #hex;` declared in tokens.css. */
function readTokens(): Record<string, string> {
  // package.json sets "type": "module", so __dirname does not exist here.
  const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8')
  const tokens: Record<string, string> = {}
  for (const [, name, value] of css.matchAll(
    /--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g,
  )) {
    tokens[name] = value
  }
  return tokens
}

describe('brand tokens meet WCAG AA', () => {
  const t = readTokens()

  it('declares every colour token', () => {
    for (const name of [
      'color-bg', 'color-surface', 'color-border', 'color-text',
      'color-text-muted', 'color-accent', 'color-link',
      'color-badge-bg', 'color-badge-text',
    ]) {
      expect(t[name], `missing --${name}`).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it.each([
    ['body text on page', 'color-text', 'color-bg'],
    ['body text on card', 'color-text', 'color-surface'],
    ['muted text on page', 'color-text-muted', 'color-bg'],
    ['muted text on card', 'color-text-muted', 'color-surface'],
    ['link on page', 'color-link', 'color-bg'],
    ['link on card', 'color-link', 'color-surface'],
    ['accent on page', 'color-accent', 'color-bg'],
    ['badge text on badge', 'color-badge-text', 'color-badge-bg'],
  ])('%s reaches 4.5:1', (_label, fg, bg) => {
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5)
  })

  it('the focus ring reaches 3:1 against the page', () => {
    expect(contrast(t['color-accent'], t['color-bg'])).toBeGreaterThanOrEqual(3)
  })

  it('rejects Arcane Blue as a text colour on navy', () => {
    // The brand board says "use Arcane Blue for links", but it measures 3.45:1
    // on Deep Navy. This test documents why the spec overrides the board.
    expect(contrast('#2563EB', t['color-bg'])).toBeLessThan(4.5)
  })
})
