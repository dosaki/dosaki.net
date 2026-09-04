# Project Language Icons — Design

**Date:** 2026-09-04
**Branch:** `rebuild/tanstack-foundation`
**Supersedes:** the language chart described in
`2026-09-01-content-and-feature-inventory.md` (F5, F6, F7)

## Goal

Replace the echarts doughnut chart on `/about` with per-language marks on each
project card in `/projects`.

The chart answered "which languages does he use, weighted how?" — a question
nobody asked, using 66% of the site's JavaScript to do it. The cards answer
"what is this thing built with?", which is the question a reader actually has
while looking at a project.

## What is removed

| File | Why |
|---|---|
| `src/components/LanguageChart.tsx` | The chart |
| `src/components/__tests__/LanguageChart.test.tsx` | Its tests |
| `src/content/languages.generated.ts` | Its data |
| `src/content/languages.seed.json` | Its hand-maintained seed |
| `scripts/generate-languages.mjs` | Its build-time generator |
| `chartValue()` in `src/content/ordering.ts` | Slice sizing |
| `LanguageStat` / `LanguageMap` in `types.ts` | Only the chart used them |
| `site.about.languagesIntro` | Prose wrapping the chart's mode toggle |
| `?by=projects|years` on the `/about` route | The chart's only interaction |
| The canvas stub in `src/test/setup.ts` | Existed so jsdom survived the chart |
| `echarts`, `echarts-for-react` | 170,907 bytes gzipped |
| `GH_TOKEN` in both workflows | Only the language generator called the API |

Historical spec and plan documents are left as written. They record what was
built at the time and are not maintained as current-state documentation.

## Deriving the data

`scripts/derive-languages.mjs` rewrites the `languages` field of every project
in `projects.ts` from GitHub's per-repo byte counts. It is run by hand
(`npm run languages`), not during the build — see *Build determinism* below.

Byte counts are a poor proxy for "what is this written in", so the script
applies editorial rules:

- **Threshold 5%, at most 3 languages.** Low, because Terraform is a small
  share of a game repo by bytes (6–32%) while being a real part of how the
  thing ships. Excluding the noise languages outright is what makes so low a
  floor safe.
- **Excluded: HTML, CSS, Dockerfile.** Implied by every web project, so they
  distinguish none of them.
- **Excluded: AMPL.** Not a real result — GitHub's linguist reads Stellaris
  mod data files as AMPL.
- **`HCL` is renamed `terraform`.** Linguist names the language; the reader
  and the icon set both know the tool.
- **Strange Homeworlds is overridden to `[]`.** It is a Stellaris mod: game
  data, no programming language. Linguist splits it AMPL/Shell and both halves
  are misdetections, so excluding AMPL alone would leave a lone, equally wrong
  Shell icon. An empty list is the honest answer, and the card renders no row.

The script is idempotent: re-running it against unchanged repos reproduces the
committed file byte for byte, so the generator and its output cannot quietly
disagree.

**The script proposes; a human decides.** These rules encode judgement calls
that were reviewed once. A future repo may need a new override rather than a
new rule.

## Rendering

`scripts/generate-language-icons.mjs` vendors Simple Icons path data for
exactly the languages `projects.ts` uses, into `src/icons/languages.generated.ts`.
Simple Icons is CC0; the marks remain the languages' own trademarks, used to
identify what a project is written in.

Two decisions worth recording:

**Monochrome, at `--color-text-muted`.** Each language's real brand colour
would be more recognisable, but ten hard-coded hexes outside `tokens.css` is
exactly the drift the token system exists to prevent, and a row of saturated
logos would out-shout the card's own title.

**Each mark gets a viewBox cropped tight to its glyph, and is sized by
height.** Simple Icons draws into a 24×24 box but does not scale glyphs to fill
it: Go's logo is a short, wide wordmark occupying about half the box's height,
so in a square viewport beside JavaScript's full-bleed square it rendered at
half the size and read as a bug. The generator measures each path — bounding
curves by their control points and arcs by their endpoints grown by the radii,
both conservative — and emits a tight box. The stylesheet then sizes by height,
so a wordmark renders wider rather than shrinking.

The marks sit in the card footer, left of the tags, in a row pinned to the
card's bottom edge. A project with no languages renders no `<ul>` at all,
rather than an empty one that would occupy the row and knock the card out of
line with its neighbours.

Each mark carries a `<title>`, giving it one accessible name and a hover
tooltip from the same markup. Not everyone can name a language from its logo.

## Build determinism

The old generator ran on every `npm run build`, so builds hit the GitHub API
and their output depended on the network and on a token. Deriving by hand
instead makes the build deterministic, offline-capable, and one dependency
lighter in CI.

## Result

`/about`'s JavaScript chunk falls from ~171 KB gzipped to 0.68 KB. Total site
JavaScript falls from ~269 KB gzipped to ~99 KB.
