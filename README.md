# quinn-replica

> A Quinn-style portfolio template — [Astro 7](https://astro.build) + SST v3, modeled on Squarespace's **Quinn** template (Popular Designs): same editorial layout, palette and type system, built from scratch with custom components. Not a 1:1 copy.

[![CI](https://github.com/ctrimm/quinn-replica/actions/workflows/ci.yml/badge.svg)](https://github.com/ctrimm/quinn-replica/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/ctrimm/quinn-replica/actions/workflows/deploy.yml/badge.svg)](https://github.com/ctrimm/quinn-replica/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**Live preview: https://ctrimm.github.io/quinn-replica/**

![Tessa Marlowe portfolio — hero](screenshots/final-hero.png)

**Edit one config file, get a portfolio** · **129 automated tests** · **Lighthouse Accessibility / Best Practices / SEO = 100** · **AI-readable (llms.txt, JSON-LD)**

The portfolio persona — **Tessa Marlowe**, stylist & creative director — is
fully fictional, created for this site. All copy is original
(it lives in `portfolio.config.ts`) and all 7 photographs are AI-generated
for this project (originals in `source-images/`); no Squarespace demo
assets remain.

## Stack
- **Astro 7.4** (static output)
- **SST v3** — `sst.aws.Astro` → S3 + CloudFront
- Custom components only; self-hosted variable fonts: Bodoni Moda
  (display serif / italic labels) + Archivo (sans), plus Playfair/Inter and
  Fraunces/Jost presets

## Pages
- `/` — hero (giant serif PORT/FOLIO + overlapping portrait), intro,
  Select Works band, consulting, Latest Project, Client List
- `/info` — bio + large portrait + Client List
- `/selectworks` — four projects, stacked
- `/palmetto-issue`, `/atelier-quarterly`, `/studio-tailoring`, `/concrete-poems` — project pages

## Develop
```bash
npm install
npm run dev
```

## Deploy (owner's step)
```bash
npm run deploy               # dev stage
npm run deploy:production    # production stage
```
Requires your own AWS credentials. This repo is deploy-ready; it has not
been deployed.

## Make it yours
Edit `src/data/site.ts` (name, email, projects, clients) and replace the
demo images in `public/images/`.

## Make it yours (no coding needed)

Everything about the person, the words, the projects and the colors lives
in **one file**: `portfolio.config.ts` at the top of the repo. Open it,
change the text between the quotes, save. It covers:

- your name, job title, email, social links
- the giant hero word(s), intro paragraphs, consulting blurb, "latest project"
- your bio and availability (Info page)
- the project list — add, remove or reorder entries and the home page,
  Select Works page and each project page rebuild themselves
  (leave out a project's `slug` and one is made from its title)
- the client list
- colors and one of three font pairings (`bodoni`, `playfair`, `fraunces`)

Photos go in `public/images/` — replace a file, or point the config at a
new one. Optionally run `python3 scripts/optimize-images.py` afterwards to
regenerate the smaller sizes phones download.

If the config has a mistake (bad email, a color that isn't a hex code, two
projects with the same slug…), the build stops and lists every problem in
plain language instead of publishing a broken site.

Preview with `npm run dev`, publish with `npm run deploy`.

One deliberate design note: the bright vermilion `#ff2e00` is kept for
headlines and the giant hero word. Small text uses `accentInk`, a deeper
shade of the same color — the bright one is too light for small text to
pass accessibility contrast checks. Both are in the config.

## Testing

| Suite | Command | What it covers |
|---|---|---|
| Unit | `npm test` | slug generation, config validation (18 broken-config cases), font presets, theme CSS variables, project routing, responsive-image srcsets — 63 tests |
| Integration | `npm run test:integration` | every config image exists on disk and is a real JPEG, every font file is a real woff2, and a full production build is inspected: all pages, config copy, JSON-LD, llms.txt, sitemap, no leftovers from the original demo — 38 tests |
| End to end | `npm run test:e2e` | Playwright against the real built site: navigation + active states, every page and project, next-project cycling, theme colors applied, all images load, alt text, mobile overflow — 28 tests |
| All of it | `npm run test:all` | unit + integration + e2e |

In a sandbox/CI image with its own Chrome, point Playwright at it:
`PLAYWRIGHT_CHROME_PATH=/path/to/chrome npm run test:e2e`.

## Grading (Lighthouse + AI readiness)

`npm run grade` builds the site, serves it locally, and runs Chrome
Lighthouse (mobile) on the home, info, select-works and a project page.
Full reports land in `reports/lighthouse/`. Current standing:

- **Accessibility 100, Best Practices 100, SEO 100 — every page**
- **Performance 95–99** depending on the run: the remaining points are
  Largest Contentful Paint under Lighthouse's simulated slow-4G throttle,
  on a design whose whole point is a giant type hero + photography. The
  score moves a few points between identical runs; on a real CDN
  connection the pages load near-instantly (total page weight ≈ 300 KB).

For AI assistants, the site ships a generated `/llms.txt` (person,
projects, clients, contact — built from the same config, so it can't
drift), schema.org JSON-LD on every page, a generated `/sitemap.xml`,
and a `robots.txt` that explicitly welcomes AI crawlers. All four are
covered by tests above.

## Deployment

Two targets, one codebase (the same env-driven pattern as ctrimm's other
Astro theme repos):

- **GitHub Pages (preview)** — every push to `main` runs the full test
  suite, then builds with `SITE=https://ctrimm.github.io` and
  `BASE=/quinn-replica` and deploys via `.github/workflows/deploy.yml`.
  Live at https://ctrimm.github.io/quinn-replica/. All internal URLs are
  base-aware (`url()` in `src/data/site.ts`), and an integration suite
  builds in subpath mode and asserts every link, image, font and sitemap
  URL carries the prefix.
- **SST (production)** — `npm run deploy` / `npm run deploy:production`
  builds for the domain root and ships to S3 + CloudFront via
  `sst.config.ts`.

## CI

`.github/workflows/ci.yml` runs on every push and pull request, in the
style of ctrimm/astro-gov-starter: unit + integration tests, Playwright
e2e, and a Lighthouse job that hard-fails below 100 on Accessibility,
Best Practices and SEO and below 90 on Performance (`npm run grade:ci`;
locally, `npm run grade` holds the strict all-100 bar).
