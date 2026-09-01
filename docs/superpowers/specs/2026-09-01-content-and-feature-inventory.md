# dosaki.net — Content & Feature Inventory

**Date:** 2026-09-01
**Purpose:** Capture everything the current site says and does, so the upcoming
design overhaul can start from a statement of intent rather than from the old markup.

This is a salvage document. It is deliberately presentation-free: it records *what
exists*, not *how it currently looks*.

---

## 1. Site structure

Four routes, flat, no nesting, no params.

| Path | Page | Purpose |
|---|---|---|
| `/` | Home | Splash / first impression |
| `/about` | About | Biography, social links, language chart |
| `/projects` | Projects | Grid of things built |
| `/talks` | Talks | List of talks, blogs, workshops, podcasts |

Global header on every page: logo (links `/`) plus four nav items — About me,
Stuff I make, Stuff I talk about, and a `mailto:` "Talk to me".

---

## 2. Prose content (currently hardcoded in JSX)

This is the text trapped in components. It is the primary thing being extracted.

### Home splash

> Hi! I'm Tiago and I make things!
>
> *(smaller)* Also I mentor kids with their programming.
>
> *(smallest)* And I talk way too much about containers...

### About — heading and biography

Heading: **Tiago Correia / Dosaki**

Body paragraphs, in order:

1. I'm a software developer from Portugal. Currently living in the UK.
2. I work at [The Keyholding Company](https://keyholding.com/) as the Lead Backend Developer.
3. Before, I worked as the Software Development Manager at [Panintelligence](https://www.panintelligence.com/), where I got to play with data and mentor our devs.
4. Online, I use '**Dosaki**' as my monicker.
5. Building things is my passion and I've been doing it for quite some time. *(aside: "yes that's me", pointing at the photo)*
6. I run the python and javascript sessions for my local Code Club to help kids learn how to program and I mentor a promising group at a [CoderDojo](https://harrogatecoderdojo.github.io/).
7. You'll find I talk mostly about tech, video, board games... and containers. I talk a lot about containers.
8. *(after the chart)* I find myself making things with **various programming languages**. Some of which, I've worked with for **a few years**.

Paragraph 8 contains the toggle: whichever of the two bold phrases is *not* active
renders as a button that switches the chart between "by project" and "by years used".

### Social links

| Icon | Target |
|---|---|
| Envelope | `mailto:tiago.f.a.correia@gmail.com` |
| LinkedIn | https://www.linkedin.com/in/dosaki/ |
| Twitter | https://twitter.com/dosaki |

> **Redesign note:** the Twitter link and bird icon predate the X rebrand.

### Page titles

- Projects: "Stuff I make"
- Talks: "Stuff I talk about"
- Document title: "Dosaki's Lair"
- Meta description: "Personal about website"

---

## 3. Structured content (currently in S3)

Source of truth today is hand-edited JSON at
`https://dosaki-public-dist.s3.eu-west-1.amazonaws.com/dosaki.net/config/`.
Not versioned, not typed, not reviewable.

### `projects.json` — 11 entries

| Field | Notes |
|---|---|
| `name` | Display name |
| `description` | **Contains raw HTML** (`<a href=...>`) — rendered via `dangerouslySetInnerHTML` |
| `icon` | Absolute URL to a remote image (Steam CDN, etc.) |
| `link` | Optional; name becomes a link when present |
| `source` | Optional; renders a corner "source" ribbon |
| `type` | `bot` \| `game` \| `mod` \| `tool` |
| `status` | `active` \| `done` \| `inactive` |
| `tags` | String array; rendered as `#tag`, prefixed by `type` |
| `pixelatedImage` | Boolean; applies nearest-neighbour image rendering |
| `roles` | **Dead field — present in data, rendered nowhere** |

### `talks.json` — 5 entries

| Field | Notes |
|---|---|
| `name` | Display name |
| `description` | **Contains raw HTML** |
| `type` | `talk` \| `blog` \| `workshop` \| `podcast` — each maps to an icon |
| `date` | Year (integer) |
| `link` | Optional |
| `status` | Optional; when `inactive`, shown instead of the date |
| `tags` | String array |
| `roles` | **Dead field — rendered nowhere** |

---

## 4. Features / behaviours

Everything the site actually *does*. This is the checklist the redesign must
consciously keep or consciously drop.

### F1 — Client-side routing
Four routes, deep-linkable. Server returns `index.html` for any path (SPA fallback
configured in both S3 and CloudFront).

### F2 — Active nav highlighting
Current section is highlighted in the header.
**Currently buggy:** state is set only on link click, so browser back/forward
leaves the wrong item highlighted.

### F3 — Project sorting and grouping
Projects render in three status bands: `active` first, then `done`, then everything
else. Within each band, sorted alphabetically by `type`.

### F4 — Talk sorting
Talks sorted by `date`, newest first.

### F5 — Language pie chart (About)
Doughnut chart of programming languages, powered by echarts. Two modes:

- **by project** — value is the number of projects using that language
- **by years used** — value is `endYear - startYear`

Toggled by the inline buttons in About paragraph 8.

### F6 — Live GitHub augmentation
On mount, fetches `api.github.com/users/dosaki/repos`, then fetches the languages
of each non-fork repo, and merges the results into a hardcoded seed map of ten
languages. Extends both project counts and the start/end year range.

**Known fragility:** this is an N+1 request pattern (1 + one per repo) against the
*unauthenticated* GitHub API, which allows 60 requests/hour/IP. Mitigated today only
by a 2-day `localStorage` cache in `src/data/store.js`. The `vue` language is folded
into `javascript`.

### F7 — Seeded language map
Ten languages with hand-maintained project lists and year ranges:
javascript (2008–), groovy (2012–), java (2012–), go (2018–), terraform (2020–),
sql (2009–), python (2012–), shell (2012–), plus `c#` and `lua` with empty data.

### F8 — Client-side cache
`store.js`: `localStorage` with a per-key TTL (used only for the GitHub response,
2-day expiry).

### F9 — Responsive layout
Single breakpoint at **615px**. Below it: chart labels move inside the doughnut and
shrink; layout stacks.

### F10 — Source ribbon
Projects with a `source` URL get a rotated corner ribbon linking to the repository.

### F11 — Inactive/status treatment
Projects and talks with a `status` render it as a subtitle, with the status applied
as a CSS class for visual differentiation.

### F12 — Fixed-attachment splash
Home uses a full-bleed background photo with `background-attachment: fixed`.

---

## 5. Visual vocabulary (for reference only — being replaced)

Recorded so nothing is lost by accident. ~474 lines of CSS across 8 files.

**Palette**

| Colour | Role |
|---|---|
| `#e1aa7d` | Primary accent (most used) |
| `#e28941` | Accent, darker |
| `#2e2836` | Dark background |
| `#454247` / `#535055` | Mid greys |
| `#fffdfb` / `#fff2e7` | Off-whites |
| `#b5777e` | Muted rose |

**Recurring devices:** `trace-under` / `trace-around` (hand-drawn-style borders),
`highlight`, `link-button` (a button styled as an inline link), `pixelated`,
the rotated `ribbon`, and a chart palette of ten brand-ish language colours
(`#f7e018` javascript, `#00acd7` go, etc.).

**Assets in `public/images/`:** `logo.png` (header), `big-logo.jpg` (OG/Twitter
card), `minime.jpg` (About photo — toddler at a computer), `t_snow.jpg` (Home splash).

---

## 6. Recommendations for the overhaul

1. **Get HTML out of content.** `description` fields carrying `<a>` tags force
   `dangerouslySetInnerHTML` and let 2021's markup dictate the new design. Move to
   Markdown or structured `{text, links[]}`.
2. **Drop `roles`.** Dead in both files.
3. **Resolve F6 at build time.** Fetching GitHub per-visitor is fragile and
   rate-limited. Generating the stats during the build removes the runtime
   dependency entirely.
4. **Fix F2 properly.** Derive the active nav item from the URL, not from click handlers.
5. **Revisit the Twitter/X link and icon.**
