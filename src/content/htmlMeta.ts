import { projects } from './projects'
import { site } from './site'

// index.html carries placeholders that are filled at build time, because
// social scrapers and link-preview bots do not run JavaScript.

export interface PageMeta {
  title: string
  description: string
  image: string
}

export const PLACEHOLDERS: Record<string, keyof PageMeta> = {
  '%SITE_TITLE%': 'title',
  '%SITE_DESCRIPTION%': 'description',
  '%SITE_IMAGE%': 'image',
}

const absolute = (url: string) => new URL(url, site.url).href
const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const siteMeta: PageMeta = {
  title: site.meta.title,
  description: site.meta.description,
  image: absolute(site.meta.image),
}

// Projects that are pages on this site get their own HTML file, so a shared
// link previews with the project's name, blurb and image.
export const pageMeta: Record<string, PageMeta> = Object.fromEntries(
  projects
    .filter((p) => p.link?.startsWith('/'))
    .map((p) => [
      p.link,
      {
        title: `${p.name} · ${site.brand.name}`,
        description: p.description.replace(/<[^>]+>/g, ''),
        image: absolute(p.icon),
      },
    ]),
)

export function substituteHtmlMeta(html: string, meta: PageMeta = siteMeta): string {
  return Object.entries(PLACEHOLDERS).reduce(
    (acc, [token, key]) => acc.replaceAll(token, escape(meta[key])),
    html,
  )
}
