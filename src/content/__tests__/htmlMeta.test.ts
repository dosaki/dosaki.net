// @vitest-environment node
//
// Reads index.html from disk, so it needs the node environment: under jsdom,
// `new URL(relative, import.meta.url)` resolves against jsdom's synthetic
// origin rather than a file: URL. Same reason as contrast.test.ts.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { PLACEHOLDERS, substituteHtmlMeta } from '../htmlMeta'
import { site } from '../site'

const indexHtml = () =>
  readFileSync(new URL('../../../index.html', import.meta.url), 'utf8')

describe('index.html metadata substitution', () => {
  it('fills every placeholder from site.meta', () => {
    const out = substituteHtmlMeta('<title>%SITE_TITLE%</title>')
    expect(out).toBe(`<title>${site.meta.title}</title>`)
  })

  it('leaves no placeholder unsubstituted in the real index.html', () => {
    const out = substituteHtmlMeta(indexHtml())
    // Catches both directions: a placeholder added to the HTML without a
    // matching entry here, and an entry renamed out from under the HTML.
    expect(out).not.toMatch(/%[A-Z_]+%/)
  })

  it('actually puts the site title and description into index.html', () => {
    const out = substituteHtmlMeta(indexHtml())
    expect(out).toContain(`<title>${site.meta.title}</title>`)
    expect(out).toContain(site.meta.description)
  })

  it('index.html still carries a placeholder for each key, so none is dead', () => {
    const html = indexHtml()
    for (const token of Object.keys(PLACEHOLDERS)) {
      expect(html, `${token} is declared but unused in index.html`).toContain(token)
    }
  })
})
