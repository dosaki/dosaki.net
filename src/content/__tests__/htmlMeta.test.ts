// @vitest-environment node
//
// Reads index.html from disk, so it needs the node environment: under jsdom,
// `new URL(relative, import.meta.url)` resolves against jsdom's synthetic
// origin rather than a file: URL. Same reason as contrast.test.ts.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { PLACEHOLDERS, pageMeta, siteMeta, substituteHtmlMeta } from '../htmlMeta'
import { site } from '../site'

const indexHtml = () =>
  readFileSync(new URL('../../../index.html', import.meta.url), 'utf8')

describe('index.html metadata substitution', () => {
  it('fills every placeholder from site.meta', () => {
    const out = substituteHtmlMeta('<title>%SITE_TITLE%</title>')
    expect(out).toBe(`<title>${site.meta.title}</title>`)
  })

  it('leaves no placeholder unsubstituted in the real index.html', () => {
    expect(substituteHtmlMeta(indexHtml())).not.toMatch(/%[A-Z_]+%/)
  })

  it('puts the site title, description and preview image into index.html', () => {
    const out = substituteHtmlMeta(indexHtml())
    expect(out).toContain(`<title>${site.meta.title}</title>`)
    expect(out).toContain(site.meta.description)
    expect(out).toContain(`<meta property="og:image" content="${site.url}/images/og-image.png" />`)
  })

  it('index.html still carries a placeholder for each key, so none is dead', () => {
    const html = indexHtml()
    for (const token of Object.keys(PLACEHOLDERS)) {
      expect(html, `${token} is declared but unused in index.html`).toContain(token)
    }
  })

  it('escapes values so they cannot break out of an attribute', () => {
    const out = substituteHtmlMeta('content="%SITE_DESCRIPTION%"', {
      ...siteMeta,
      description: 'say "hi" & <b>bye</b>',
    })
    expect(out).toBe('content="say &quot;hi&quot; &amp; &lt;b&gt;bye&lt;/b&gt;"')
  })
})

describe('in-site project pages', () => {
  it('get their own title and use the project image for previews', () => {
    expect(pageMeta['/projects/quaternion-cube']).toEqual({
      title: `Quaternion Cube · ${site.brand.name}`,
      description: expect.stringContaining('understand quaternions'),
      image: `${site.url}/images/quaternion-cube.png`,
    })
  })

  it('only covers projects that live on this site', () => {
    for (const path of Object.keys(pageMeta)) expect(path).toMatch(/^\//)
  })
})
