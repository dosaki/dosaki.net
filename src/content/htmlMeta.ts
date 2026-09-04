import { site } from './site'

/**
 * Build-time substitution for `index.html`.
 *
 * The document title and description have to live in the static HTML: social
 * scrapers and link-preview bots do not run JavaScript, so anything the router
 * sets on the client is invisible to them. But writing them as literals means
 * a second home for the site's positioning, which is exactly how the title
 * came to say "Architect, Engineer, Strategist" long after the header stopped.
 *
 * So `index.html` carries placeholders and Vite fills them from `site.meta` at
 * build time — one source, still fully static output.
 */
export const PLACEHOLDERS: Record<string, string> = {
  '%SITE_TITLE%': site.meta.title,
  '%SITE_DESCRIPTION%': site.meta.description,
}

export function substituteHtmlMeta(html: string): string {
  return Object.entries(PLACEHOLDERS).reduce(
    (acc, [token, value]) => acc.replaceAll(token, value),
    html,
  )
}
