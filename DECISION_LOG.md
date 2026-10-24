# Decision Log

- 2026-10-24 — Design language: pale warm grey #E9E9E9 ground, single
  vermilion #FF2E00 accent, Bodoni-style serif display type with a bold
  grotesque sans, fluid editorial layout with overlapping unframed
  images. All copy original to this project.
- 2026-10-24 — Stack: Astro ^7.4.2 static + SST ^3 (sst.aws.Astro,
  S3 + CloudFront), matching owner's other SST v3 Astro sites.
  Deploy stays the owner's step (standing rule).
- 2026-10-24 — Persona: fully fictional — Tessa Marlowe, stylist &
  creative director (Savannah-raised, Lisbon/New York), with original
  projects (Palmetto Issue, Atelier Quarterly, Studio Tailoring,
  Concrete Poems) and a fictional client list.
- 2026-10-24 — Images: all 7 site images are AI-generated for this
  project (persona portraits generated from one anchor image for a
  consistent fictional face; the 4 project photos generated as a
  2x2 editorial sheet and sliced). Originals in source-images/.
  Stock photography was considered; generated images keep provenance
  clean and the persona consistent.

## 2026-10-24 — Config file, test suites, Lighthouse grading
- Decision: all owner-editable content/theme moved to `portfolio.config.ts` (repo root); `src/data/site.ts` is now plumbing only: validation (build fails with plain-language problem list), slugify, font presets, route helpers, fs-aware srcset builder. Rationale: non-technical fork-and-edit flow; validation turns config typos into guidance instead of a broken site.
- Decision: self-host all fonts (variable woff2 in `public/fonts/`, latin subset) instead of Google Fonts. Evidence: Lighthouse Chrome couldn't reach fonts.googleapis.com (console errors, 780 ms render-blocking, Best Practices < 100); self-hosting also removes a third-party dependency. Google Fonts remains the source of the files (OFL).
- Decision: CSS inlined into HTML (`build.inlineStylesheets: "always"`) — removes the render-blocking stylesheet request.
- Decision: small text uses `accentInk` #b91e00 (5.3:1 on the page ground, 4.7:1 on the works band); display text keeps #ff2e00 (3.1:1, passes for large text only). Evidence: axe/Lighthouse contrast failures at #ff2e00 for nav/body sizes and for the project stack on the #dbdbdb band (2.7:1).
- Decision: reveal-hidden elements use `visibility: hidden`, not just opacity — contrast audits were scoring invisible (opacity 0) text as failures.
- Decision: responsive variants generated next to originals (`-<width>.jpg`), picked up by `imgSrcset()` only when they exist on disk — a swapped photo without variants degrades to the original, never a 404. Note: the helper resolves `public/` from process.cwd() because Vite bundling relocates the module (caught when srcsets silently vanished from dist HTML while unit tests stayed green — the integration suite's build-output assertions are the guard).
- Grading: `scripts/lighthouse.mjs` (mobile, all four categories, reports in `reports/lighthouse/`). Standing: Accessibility/Best Practices/SEO = 100 on all graded pages; Performance 95–99 (LCP under simulated slow 4G; ±3 run variance observed on identical code). Accepted rather than distorting the design (e.g. shrinking the hero type or dropping photography) to chase the last throttled points.
- Tests: 63 unit + 32 integration + 28 e2e, all green (`npm run test:all`).

## 2026-10-24 — GitHub repo, CI/CD, Pages preview (modeled on ctrimm's Astro theme repos)
- Pattern taken from ctrimm/astro-skeuomorphism-theme + astro-genai-startup-theme (deploy.yml shape, MIT LICENSE, badges, site/base) and ctrimm/astro-gov-starter (multi-job ci.yml, exact Node pin, lighthouserc assertion stance).
- astro.config: SITE/BASE from env — root for local/SST, /vermilion-folio subpath for Pages. All internal URLs go through url() in site.ts (links, images, srcsets, fonts, favicon, sitemap, llms.txt); an integration suite builds in subpath mode and asserts the prefixes. Note: that suite spawns its build with a deliberately clean env — an inherited test-runner variable made Vite silently drop site/base (empirically verified, mechanism unknown).
- CI failure #1: Astro 7.4.2 requires Node >= 22.23.4 and hard-fails; setup-node "22" resolved to 22.23.3 on the runner. Pinned NODE_VERSION=22.23.4 in both workflows.
- CI failure #2: Lighthouse a11y 95 on home in CI only — axe snapshot caught reveal text mid-opacity-fade (blended colors #d1a299 ≈ 1.62:1). Fix: reveal is rise-only (transform), hidden state is visibility:hidden; no blended state exists at any moment. (An earlier attempt at this fix silently didn't land — the CSS pattern didn't match; verified in the file this time.)
- CI perf: home scored 79 on the shared runner vs 95-99 locally; TBT 730 ms vs 10 ms on identical code. Decision (gov-starter stance): CI hard-gates a11y/BP/SEO at 100, performance is report-only in CI; strict all-100 remains the local `npm run grade` bar.
- Pages enabled via API (build_type=workflow) — no manual Settings step needed with the current token.
