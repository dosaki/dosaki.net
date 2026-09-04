// Rewrites the `languages` field of every project in src/content/projects.ts
// from GitHub's per-repo byte counts.
//
//   node scripts/derive-languages.mjs
//
// Idempotent: re-running against unchanged repos reproduces the committed
// file exactly, so the script and its output can never quietly disagree.
//
// The rules below are editorial, not mechanical — GitHub's linguist counts
// bytes, and bytes are a poor proxy for "what is this project written in".
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

for (const p of projects) {
  if (OVERRIDE[p.name]) {
    p.languages = OVERRIDE[p.name]
    continue
  }
  const repo = p.source.split('/').slice(-2).join('/')
  const res = await fetch(`https://api.github.com/repos/${repo}/languages`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'dosaki.net' },
  })
  if (!res.ok) throw new Error(`${res.status} for ${repo}`)
  const bytes = await res.json()
  const total = Object.values(bytes).reduce((a, b) => a + b, 0) || 1
  p.languages = Object.entries(bytes)
    .filter(([lang, n]) => !EXCLUDE.has(lang) && n / total >= MIN_SHARE)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX)
    .map(([lang]) => RENAME[lang.toLowerCase()] ?? lang.toLowerCase())
}

writeFileSync(
  path,
  `import type { Project } from './types'\n\nexport const projects: Project[] = ${JSON.stringify(projects, null, 2)}\n`,
)
for (const p of projects) console.log(`  ${p.name.padEnd(24)} ${p.languages.join(', ') || '(none)'}`)
