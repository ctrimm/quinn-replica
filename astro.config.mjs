// @ts-check
import { defineConfig } from "astro/config";

// Static output — SST v3's sst.aws.Astro serves dist/ from S3 + CloudFront.
// Stylesheets are inlined into the HTML: one less request, nothing
// render-blocking, which helps the pages hold 100 on Lighthouse.
//
// SITE/BASE come from the environment (same pattern as ctrimm's other
// Astro theme repos): local dev, tests and the SST deploy build for the
// domain root, while the GitHub Pages workflow builds with
//   SITE=https://ctrimm.github.io  BASE=/quinn-replica
// so the preview works from its project subpath.
const site = process.env.SITE || undefined;
const base = process.env.BASE || undefined;

export default defineConfig({
  output: "static",
  site,
  base,
  build: { inlineStylesheets: "always" },
});
