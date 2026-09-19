// Rewrites the GitHub-derived fields of every project in src/content/projects.ts:
// `languages` from linguist's per-repo byte counts, and `lastCommit` from the
// newest commit on the default branch.
//
//   node scripts/derive-from-github.mjs
//
// Idempotent: re-running against unchanged repos reproduces the committed
// file exactly, so the script and its output can never quietly disagree.
//
// The language rules below are editorial, not mechanical — GitHub's linguist
// counts bytes, and bytes are a poor proxy for "what is this project written in".
import { readFileSync, writeFileSync } from 'node:fs'

// 5%, not a rounder 15%: Terraform is a small fraction of a game repo by
// bytes (6-32%) while being a real part of how the thing ships. Excluding
// the noise languages outright is what makes so low a floor safe.
const MIN_SHARE = 0.05
const MAX = 3

// HTML and CSS are implied by every web project and so distinguish none of
// them; Dockerfile is packaging. AMPL is not a real result at all — linguist
// reads Stellaris mod data files as AMPL.
const EXCLUDE = new Set(['HTML', 'CSS', 'Dockerfile', 'AMPL'])

// Linguist names the language; the icon set and the reader both know the tool.
const RENAME = { hcl: 'terraform' }

// Strange Homeworlds is a Stellaris mod: game data files, no programming
// language. Linguist splits it AMPL/Shell and both halves are misdetections,
// so excluding AMPL alone would leave a lone, equally wrong Shell icon.
const OVERRIDE = { 'Strange Homeworlds': [] }

const path = 'src/content/projects.ts'
const src = readFileSync(path, 'utf8')
const projects = JSON.parse(src.slice(src.indexOf('= [') + 2))

// Private repos (closed-source projects listed with `repo` but no `source`)
// need a token: GITHUB_TOKEN=$(gh auth token) node scripts/derive-from-github.mjs
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'dosaki.net' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

async function github(route) {
  const res = await fetch(`https://api.github.com/repos/${route}`, { headers })
  if (!res.ok) throw new Error(`${res.status} for ${route}`)
  return res.json()
}

for (const p of projects) {
  const repo = p.repo ?? p.source?.split('/').slice(-2).join('/')
  if (!repo) throw new Error(`${p.name} has neither source nor repo to derive from`)

  // A repo we can't read (private, no token) keeps its committed values rather
  // than failing the whole run, so an unauthenticated run still refreshes the rest.
  if (!p.source) {
    const probe = await fetch(`https://api.github.com/repos/${repo}`, { headers })
    if (!probe.ok) {
      console.warn(`  !! ${p.name}: ${probe.status} for ${repo}; keeping committed values`)
      continue
    }
  }

  if (OVERRIDE[p.name]) {
    p.languages = OVERRIDE[p.name]
  } else {
    const bytes = await github(`${repo}/languages`)
    const total = Object.values(bytes).reduce((a, b) => a + b, 0) || 1
    p.languages = Object.entries(bytes)
      .filter(([lang, n]) => !EXCLUDE.has(lang) && n / total >= MIN_SHARE)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX)
      .map(([lang]) => RENAME[lang.toLowerCase()] ?? lang.toLowerCase())
  }

  // The commits list defaults to the default branch, newest first. The
  // committer date is when the commit landed; the author date can predate a
  // rebase by months and would misorder the page.
  const [head] = await github(`${repo}/commits?per_page=1`)
  p.lastCommit = head.commit.committer.date.slice(0, 10)
}

writeFileSync(
  path,
  `import type { Project } from './types'\n\nexport const projects: Project[] = ${JSON.stringify(projects, null, 2)}\n`,
)
for (const p of projects) {
  console.log(`  ${p.lastCommit}  ${p.name.padEnd(26)} ${p.languages.join(', ') || '(none)'}`)
}
