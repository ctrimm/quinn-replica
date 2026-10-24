import { describe, it, expect } from "vitest";
import {
  getFontPreset,
  themeCssVars,
  FONT_PRESETS,
  DEFAULT_FONT_PRESET,
  projects,
  projectRoutes,
  nextProject,
  mailto,
  imgSrcset,
} from "../../src/data/site";
import { config } from "../../portfolio.config";

describe("font presets", () => {
  it("returns the default preset for undefined", () => {
    expect(getFontPreset(undefined)).toBe(FONT_PRESETS[DEFAULT_FONT_PRESET]);
  });
  it("returns the default preset for an unknown name", () => {
    expect(getFontPreset("nope")).toBe(FONT_PRESETS[DEFAULT_FONT_PRESET]);
  });
  it("returns each named preset", () => {
    for (const name of Object.keys(FONT_PRESETS)) {
      expect(getFontPreset(name)).toBe(FONT_PRESETS[name]);
    }
  });
  it("every preset has serif/sans stacks and self-hosted font files", () => {
    for (const preset of Object.values(FONT_PRESETS)) {
      expect(preset.serif).toMatch(/serif/);
      expect(preset.sans).toMatch(/sans-serif/);
      expect(preset.serifFile).toMatch(/^\/fonts\/[a-z-]+\.woff2$/);
      expect(preset.sansFile).toMatch(/^\/fonts\/[a-z-]+\.woff2$/);
    }
  });
});

describe("themeCssVars", () => {
  const css = themeCssVars(config.theme);
  it("emits the configured colors", () => {
    expect(css).toContain(`--bg: ${config.theme.background};`);
    expect(css).toContain(`--bg-band: ${config.theme.band};`);
    expect(css).toContain(`--accent: ${config.theme.accent};`);
    expect(css).toContain(`--accent-ink: ${config.theme.accentInk};`);
  });
  it("emits the configured font stacks", () => {
    const preset = getFontPreset(config.theme.fonts);
    expect(css).toContain(`--serif: ${preset.serif};`);
    expect(css).toContain(`--sans: ${preset.sans};`);
  });
  it("is a single :root block", () => {
    expect(css.startsWith(":root {")).toBe(true);
    expect(css.trimEnd().endsWith("}")).toBe(true);
  });
});

describe("project routes", () => {
  it("generates one route per project, in config order", () => {
    const routes = projectRoutes();
    expect(routes).toHaveLength(config.projects.length);
    expect(routes.map((r) => r.params.slug)).toEqual(
      projects.map((p) => p.slug)
    );
  });
  it("every route's next project wraps around", () => {
    const routes = projectRoutes();
    routes.forEach((r, i) => {
      expect(r.props.project).toBe(projects[i]);
      expect(r.props.next).toBe(projects[(i + 1) % projects.length]);
    });
    expect(routes[routes.length - 1].props.next).toBe(projects[0]);
  });
  it("all slugs are unique", () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });
});

describe("nextProject", () => {
  it("returns the following project", () => {
    expect(nextProject(projects[0].slug)).toBe(projects[1]);
  });
  it("wraps from last to first", () => {
    expect(nextProject(projects[projects.length - 1].slug)).toBe(projects[0]);
  });
  it("throws for an unknown slug", () => {
    expect(() => nextProject("no-such-project")).toThrow(/Unknown project slug/);
  });
});

describe("mailto", () => {
  it("prefixes an email address", () => {
    expect(mailto("a@b.co")).toBe("mailto:a@b.co");
  });
});

describe("imgSrcset", () => {
  it("includes existing variants plus the original, sorted by width", () => {
    const srcset = imgSrcset("/images/hero.jpg", [480, 720, 960], 1400);
    expect(srcset).toBe(
      "/images/hero-480.jpg 480w, /images/hero-720.jpg 720w, /images/hero-960.jpg 960w, /images/hero.jpg 1400w"
    );
  });
  it("skips variants that don't exist on disk", () => {
    const srcset = imgSrcset("/images/hero.jpg", [123], 1400);
    expect(srcset).toBeUndefined();
  });
  it("returns undefined for an image with no variants at all", () => {
    expect(imgSrcset("/images/latest.jpg", [999], 1100)).toBeUndefined();
  });
  it("includes the 1600w project variant", () => {
    const srcset = imgSrcset("/images/work-studio.jpg", [480, 1600], 800);
    expect(srcset).toBe(
      "/images/work-studio-480.jpg 480w, /images/work-studio.jpg 800w, /images/work-studio-1600.jpg 1600w"
    );
  });
});
