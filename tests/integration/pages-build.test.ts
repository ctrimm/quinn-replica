import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

// The GitHub Pages preview is served from a subpath (/vermilion-folio).
// This suite builds exactly the way the deploy workflow does and checks
// that every internal URL carries the prefix — the class of bug that
// makes a Pages preview look fine on the home page and broken everywhere
// else (unstyled fonts, dead links, 404 images).
const OUT = "/tmp/vermilion-pages-build";
const read = (p: string) => readFileSync(join(OUT, p), "utf-8");

beforeAll(() => {
  rmSync(OUT, { recursive: true, force: true });
  execSync(`npx astro build --outDir ${OUT}`, {
    stdio: "pipe",
    timeout: 180_000,
    // Deliberately a clean environment, not a spread of process.env:
    // a variable inherited from the test-runner process makes Vite
    // silently drop the site/base config (verified empirically — with a
    // spread env the same command emits an unprefixed root build).
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      SITE: "https://ctrimm.github.io",
      BASE: "/vermilion-folio",
    },
  });
}, 200_000);

describe("GitHub Pages build (subpath mode)", () => {
  it("prefixes navigation and project links", () => {
    const html = read("index.html");
    expect(html).toContain('href="/vermilion-folio/info"');
    expect(html).toContain('href="/vermilion-folio/selectworks"');
    expect(html).toContain('href="/vermilion-folio/palmetto-issue"');
  });
  it("prefixes image sources and srcsets", () => {
    const html = read("index.html");
    expect(html).toContain('src="/vermilion-folio/images/hero.jpg"');
    expect(html).toContain("/vermilion-folio/images/hero-480.jpg 480w");
    expect(html).not.toContain('src="/images/');
  });
  it("prefixes the self-hosted font URLs in the generated @font-face CSS", () => {
    expect(read("index.html")).toContain(
      'url("/vermilion-folio/fonts/bodoni-moda-normal.woff2")'
    );
  });
  it("prefixes favicon and font preloads", () => {
    const html = read("index.html");
    expect(html).toContain('href="/vermilion-folio/favicon.svg"');
    expect(html).toContain('href="/vermilion-folio/fonts/archivo-normal.woff2"');
  });
  it("sitemap URLs carry the full Pages address", () => {
    const xml = read("sitemap.xml");
    expect(xml).toContain("https://ctrimm.github.io/vermilion-folio/info</loc>");
    expect(xml).toContain(
      "https://ctrimm.github.io/vermilion-folio/concrete-poems</loc>"
    );
  });
  it("project pages prefix the next-project link", () => {
    const html = read("palmetto-issue/index.html");
    expect(html).toContain('href="/vermilion-folio/atelier-quarterly"');
  });
});
