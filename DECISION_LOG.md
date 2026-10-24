# Decision Log

- 2026-10-24 — Replica approach: match Quinn's layout/type/palette
  (pale grey #E9E9E9, vermilion #FF2E00, Bodoni-style serif display,
  bold grotesque sans) with original copy, per owner's "near exact
  stylistically, not 1:1" direction.
- 2026-10-24 — Stack: Astro ^7.4.2 static + SST ^3 (sst.aws.Astro,
  S3 + CloudFront), matching owner's other SST v3 Astro sites.
  Deploy stays the owner's step (standing rule).
- 2026-10-24 — Demo photos pulled from the public Quinn demo CDN as
  placeholders so layout/scale can be verified 1:1; replace before
  real use (they are Squarespace demo assets).
- 2026-10-24 — Persona replaced: Pia Quinn (Squarespace demo persona)
  removed. New fully fictional persona: Tessa Marlowe, stylist &
  creative director (Savannah-raised, Lisbon/New York), with original
  projects (Palmetto Issue, Atelier Quarterly, Studio Tailoring,
  Concrete Poems) and fictional client list.
- 2026-10-24 — Images: the Squarespace demo CDN photos used as layout
  placeholders were deleted. All 7 site images are now AI-generated
  for this project (persona portraits generated from one anchor image
  for a consistent fictional face; the 4 project photos generated as a
  2x2 editorial sheet and sliced). Originals in source-images/.
  Unsplash was considered; its site fetch was blocked in this sandbox
  and generated images keep provenance clean and the persona consistent.

## 2026-10-24 — Config file, test suites, Lighthouse grading
- Decision: all owner-editable content/theme moved to `portfolio.config.ts` (repo root); `src/data/site.ts` is now plumbing only: validation (build fails with plain-language problem list), slugify, font presets, route helpers, fs-aware srcset builder. Rationale: non-technical fork-and-edit flow; validation turns config typos into guidance instead of a broken site.
- Decision: self-host all fonts (variable woff2 in `public/fonts/`, latin subset) instead of Google Fonts. Evidence: Lighthouse Chrome couldn't reach fonts.googleapis.com (console errors, 780 ms render-blocking, Best Practices < 100); self-hosting also removes a third-party dependency. Google Fonts remains the source of the files (OFL).
- Decision: CSS inlined into HTML (`build.inlineStylesheets: "always"`) — removes the render-blocking stylesheet request.
- Decision: small text uses `accentInk` #b91e00 (5.3:1 on the page ground, 4.7:1 on the works band); display text keeps #ff2e00 (3.1:1, passes for large text only). Evidence: axe/Lighthouse contrast failures at #ff2e00 for nav/body sizes and for the project stack on the #dbdbdb band (2.7:1).
- Decision: reveal-hidden elements use `visibility: hidden`, not just opacity — contrast audits were scoring invisible (opacity 0) text as failures.
- Decision: responsive variants generated next to originals (`-<width>.jpg`), picked up by `imgSrcset()` only when they exist on disk — a swapped photo without variants degrades to the original, never a 404. Note: the helper resolves `public/` from process.cwd() because Vite bundling relocates the module (caught when srcsets silently vanished from dist HTML while unit tests stayed green — the integration suite's build-output assertions are the guard).
- Grading: `scripts/lighthouse.mjs` (mobile, all four categories, reports in `reports/lighthouse/`). Standing: Accessibility/Best Practices/SEO = 100 on all graded pages; Performance 95–99 (LCP under simulated slow 4G; ±3 run variance observed on identical code). Accepted rather than distorting the design (e.g. shrinking the hero type or dropping photography) to chase the last throttled points.
- Tests: 63 unit + 32 integration + 28 e2e, all green (`npm run test:all`).
