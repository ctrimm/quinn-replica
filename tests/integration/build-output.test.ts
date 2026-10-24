import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "../../portfolio.config";
import { projects } from "../../src/data/site";

const DIST = join(process.cwd(), "dist");
const read = (p: string) => readFileSync(join(DIST, p), "utf-8");

// This suite runs a real production build once, then inspects dist/.
// It is the "does the whole machine fit together" layer.
beforeAll(() => {
  execSync("npm run build", { stdio: "pipe", timeout: 180_000 });
}, 200_000);

describe("build output: pages", () => {
  it("builds home, info and select works", () => {
    for (const p of ["index.html", "info/index.html", "selectworks/index.html"]) {
      expect(existsSync(join(DIST, p)), p).toBe(true);
    }
  });
  it.each(projects.map((p) => [p.title, p.slug] as const))(
    "builds a page for project %s",
    (_title, slug) => {
      expect(existsSync(join(DIST, slug, "index.html"))).toBe(true);
    }
  );
  it("builds llms.txt, sitemap.xml and serves robots.txt", () => {
    expect(existsSync(join(DIST, "llms.txt"))).toBe(true);
    expect(existsSync(join(DIST, "sitemap.xml"))).toBe(true);
    expect(existsSync(join(DIST, "robots.txt"))).toBe(true);
  });
});

describe("build output: home page content", () => {
  const html = () => read("index.html");
  it("shows the configured name, role and email", () => {
    expect(html()).toContain(config.identity.name);
    expect(html()).toContain(config.identity.role);
    expect(html()).toContain(`mailto:${config.identity.email}`);
  });
  it("renders every config intro and consulting paragraph", () => {
    // Astro HTML-escapes apostrophes/ampersands — normalise before comparing.
    const text = html().replace(/&#39;/g, "'").replace(/&amp;/g, "&");
    for (const p of [...config.home.intro, ...config.home.consulting]) {
      expect(text).toContain(p.slice(0, 40));
    }
  });
  it("renders every project title and links to every project page", () => {
    for (const p of projects) {
      expect(html()).toContain(p.title);
      expect(html()).toContain(`href="/${p.slug}"`);
    }
  });
  it("renders the full client list", () => {
    for (const c of config.clients) {
      expect(html()).toContain(c.name);
      expect(html()).toContain(c.role);
    }
  });
  it("injects the configured theme as CSS variables", () => {
    expect(html()).toContain(`--accent: ${config.theme.accent};`);
    expect(html()).toContain(`--bg: ${config.theme.background};`);
  });
  it("has exactly one h1", () => {
    expect(html().match(/<h1[\s>]/g)).toHaveLength(1);
  });
});

describe("build output: structured data for AI agents and search", () => {
  it("includes parseable JSON-LD naming the person", () => {
    const m = read("index.html").match(
      /<script type="application\/ld\+json">(.+?)<\/script>/s
    );
    expect(m, "JSON-LD block should exist").toBeTruthy();
    const data = JSON.parse(m![1]);
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe(config.identity.name);
    expect(data.email).toBe(config.identity.email);
    expect(data.jobTitle).toBe(config.identity.role);
  });
  it("llms.txt summarises the person, every project and the contact email", () => {
    const txt = read("llms.txt");
    expect(txt).toContain(`# ${config.identity.name}`);
    expect(txt).toContain(config.identity.email);
    for (const p of projects) expect(txt).toContain(p.title);
    for (const c of config.clients) expect(txt).toContain(c.name);
  });
  it("sitemap lists home, info, works and every project", () => {
    const xml = read("sitemap.xml");
    for (const path of ["/", "/info", "/selectworks", ...projects.map((p) => `/${p.slug}`)]) {
      expect(xml).toContain(`${path}</loc>`);
    }
  });
  it("every page carries a meta description", () => {
    for (const p of ["index.html", "info/index.html", "selectworks/index.html"]) {
      expect(read(p)).toMatch(/<meta name="description" content="[^"]{20,}"/);
    }
  });
});

describe("build output: no placeholder content ships", () => {
  const allHtml = () =>
    ["index.html", "info/index.html", "selectworks/index.html"]
      .map(read)
      .join("\n");
  it("contains no lorem ipsum, TODO or example-domain filler", () => {
    expect(allHtml()).not.toMatch(/lorem|TODO|example\.(com|org|net)/i);
  });
  it("loads every image locally — no hotlinked or CDN placeholder photos", () => {
    expect(allHtml()).not.toMatch(/<img[^>]+src="https?:/);
  });
});
