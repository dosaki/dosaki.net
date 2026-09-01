# Design: TanStack Router foundation + content extraction

**Date:** 2026-09-01
**Status:** Awaiting review
**Companion:** [`2026-09-01-content-and-feature-inventory.md`](./2026-09-01-content-and-feature-inventory.md)

---

## 1. Context

dosaki.net is a four-page personal site on Create React App 4 (webpack 4, React 17,
react-router-dom 5), deployed as a static SPA to S3 behind CloudFront, applied by
Terraform from GitHub Actions on every push to `master`.

A **full content and design overhaul is planned as the next piece of work.** That
reframes this one. The goal here is *not* to modernise the existing site — it is to
build the foundation the overhaul will be built on, and to salvage the content and
behaviours so nothing is lost when the presentation is thrown away.

Deliberately **not** in scope: visual design. The interim styling is a placeholder
and is expected to be replaced wholesale.

**"Minimal styling" means, concretely:** a single global stylesheet providing a CSS
reset, readable typography, a max-width content column, and the existing palette
applied to text/background/links. Nothing more — no layout systems, no cards, no
animations, no responsive work beyond what falls out of normal flow. The eight
existing CSS files are deleted, not ported; they remain recoverable from git history
at `master` if the overhaul wants to reference them.

---

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Fresh scaffold, port content across | Cleaner than incrementally unpicking CRA |
| D2 | TypeScript | Type-safe routing is the reason to choose TanStack Router |
| D3 | File-based routing | Generated route tree, typed links |
| D4 | Content moves into the repo, typed | Versioned, reviewable, type-checked, atomic deploys |
| D5 | Vitest + smoke tests | No tests exist today; a migration needs a safety net |
| D6 | Drop FontAwesome for inline SVG | Presentation is being replaced anyway; removes a runtime and a private-registry coupling |
| D7 | Build on a branch, ship with the redesign | Live site stays on the old build; no throwaway CSS work |
| D8 | Minimal interim styling | Any CSS written now is discarded by the overhaul |

### Versions (verified against npm on 2026-09-01)

| Package | Version |
|---|---|
| `vite` | 8.2.2 |
| `@tanstack/react-router` | 1.170.32 |
| `@tanstack/router-plugin` | 1.168.35 |
| `react` / `react-dom` | 19.2.8 |
| `typescript` | 7.0.2 |
| `vitest` | 4.1.11 |
| `echarts` | 6.1.0 |
| `echarts-for-react` | 3.0.6 |

**Removed:** `react-scripts`, `react-router-dom`, `axios`, `uuid`, `web-vitals`,
all four `@fortawesome/*` packages.

`NODE_OPTIONS=--openssl-legacy-provider` disappears — it existed solely for
webpack 4's MD4 hashing under OpenSSL 3.

---

## 3. Prerequisite: fix the local npm registry override

`~/.npmrc` redirects the entire `@fortawesome` scope to `npm.fontawesome.com` with an
expired token, so `npm install` fails locally with `E401`. CI has no such file and
resolves from public npm, which is why this has stayed hidden — `node_modules/` on
the dev machine is a fossil from Aug 2024.

D6 removes the FontAwesome dependency, so this stops mattering for *this* repo, but
the two offending lines should still be removed from `~/.npmrc`. **This is a change
to the developer's machine, not to the repository.**

---

## 4. Target structure

```
index.html                 (moves to root; Vite convention)
vite.config.ts
tsconfig.json
src/
  main.tsx                 entry
  routeTree.gen.ts         generated, git-ignored
  routes/
    __root.tsx             header + nav + <Outlet/>
    index.tsx              Home
    about.tsx              About
    projects.tsx           Projects
    talks.tsx              Talks
  content/
    home.ts                splash copy
    about.ts               bio paragraphs, social links
    projects.ts            11 entries, typed
    talks.ts               5 entries, typed
    types.ts               Project, Talk, SocialLink
    languages.ts           seeded language map (F7)
  components/
    ProjectCard.tsx
    TalkCard.tsx
    LanguageChart.tsx
    icons/                 7 inline SVG components
public/
  images/, favicon.*, manifest.json, robots.txt   (unchanged)
```

**Deleted with no replacement:** `src/data/store.js` (see §5),
`src/contexts/LanguageContext.js` (data now arrives as props/loader data),
`src/reportWebVitals.js` (called with no callback — it did nothing).

---

## 5. Data: a correction to the earlier plan

An earlier draft of this design said route loaders would replace `store.js`. Once
D4 moved content into the repo, that stopped being right, and it is worth stating
plainly:

- **Projects and talks no longer need loaders at all.** They become typed module
  imports, resolved at build time. No fetch, no loading state, no failure mode.
- **One runtime fetch survives:** the GitHub API call behind the language chart (F6).
- **Dropping `store.js` for a router loader would be a regression.** The router's
  loader cache is in-memory and dies on refresh; `store.js` was a 2-day
  `localStorage` cache. Since F6 is an N+1 request pattern (1 + one per repo, ~30
  repos) against the *unauthenticated* GitHub API at 60 requests/hour/IP, losing the
  persistent cache could exhaust the rate limit in two hard refreshes.

**Recommendation: resolve F6 at build time.** A small script fetches the GitHub data
during `npm run build` and writes `src/content/languages.generated.ts`. This removes
the runtime dependency, the rate limit, the N+1, *and* `store.js` — legitimately this
time.

**Trade-off:** language stats become as fresh as the last deploy rather than live.
For a personal site that redeploys on every push, that is acceptable and arguably
more reliable. **This is a behaviour change and needs explicit sign-off.** If
rejected, the fallback is a route loader plus a persistent cache, keeping `store.js`
in some form.

---

## 6. Routing

`@tanstack/router-plugin/vite` generates the route tree from `src/routes/`.

`__root.tsx` holds the header and nav. Active highlighting uses `Link`'s
`activeProps`, which derives state from the URL — **fixing F2's back/forward bug**
by removing the `selectedTab` state machine entirely.

The About chart toggle (F5) becomes a **typed search param**, `/about?by=years`,
validated by the route. It is bookmarkable and shareable, and it is the clearest
demonstration of the type-safety D2 buys. **This is the second intentional behaviour
change and needs sign-off.**

---

## 7. Deployment

**Terraform is not touched.** Vite is configured with `build.outDir: 'build'`, so
output lands exactly where CRA put it. The existing SPA fallback is already correct
in both places — S3's `error_document → index.html` and CloudFront's
`custom_error_response` 404→200→`/index.html` — which is precisely what a
client-routed SPA needs, so deep links work unchanged.

**CI changes** (`.github/workflows/build-deployment.yml`):

1. Remove `NODE_OPTIONS: --openssl-legacy-provider`.
2. Bump Node `20` → `22` (Vite 8 requires ≥20.19).
3. Add `tsc --noEmit` and `npm test` before the build step.

The deploy job already triggers only on push to `master`, so **the branch cannot
deploy** and the live site is safe by default. A separate build-and-test job should be
added, triggered on `pull_request` **and** on pushes to any branch other than
`master`, so the work is verified without deploying whether or not a PR is open.

---

## 8. Testing

Vitest + Testing Library + jsdom. Roughly five smoke tests:

- each of the four routes renders its heading
- nav links resolve to real routes
- project status banding and talk date sorting (F3, F4) hold against a fixture
- content modules satisfy their types

`tsc --noEmit` carries most of the weight: with a type-safe router, a broken link is
a compile error, which is a stronger guarantee than a test.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| TypeScript 7 is the young native rewrite | Fall back to TS 5.x and say so if any dependency's types misbehave |
| echarts 5 → 6 major bump | `echarts-for-react@3.0.6` declares echarts 6 + React 19 support; chart config is a plain pie. Verify visually. |
| Bundle is 428 KB gzipped, dominated by echarts | Confirm `echarts-for-react` is not defeating the tree-shaken `echarts/core` import. Real win lives here, not in icons. |
| Branch drift while the redesign is built | Branch touches files the overhaul replaces anyway; `master` is expected to stay quiet |
| Content HTML in `description` fields | Carried across as-is for now; flagged in the inventory as the thing to fix during the overhaul |

---

## 10. Sequence

1. Fix `~/.npmrc` (developer machine).
2. Scaffold Vite + React 19 + TS + TanStack Router; confirm it builds to `build/`.
3. Extract content into `src/content/` as typed modules.
4. Port routes and components with minimal styling; inline SVG icons.
5. Build-time GitHub language generation (pending §5 sign-off).
6. Vitest smoke tests.
7. Update CI.
8. Verify the built SPA locally, including deep links.

Implementation plan to follow via the writing-plans skill once this is approved.
