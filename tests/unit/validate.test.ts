import { describe, it, expect } from "vitest";
import {
  validateConfig,
  isValidEmail,
  isValidHexColor,
} from "../../src/data/site";
import { config } from "../../portfolio.config";

// A deep-clone helper so tests can break the config safely.
const clone = () => structuredClone(config) as typeof config;

describe("the shipped portfolio.config.ts", () => {
  it("is valid", () => {
    expect(validateConfig(config)).toEqual([]);
  });
});

describe("validateConfig", () => {
  it("flags an empty name", () => {
    const cfg = clone();
    cfg.identity.name = "  ";
    expect(validateConfig(cfg).join(" ")).toMatch(/identity\.name/);
  });
  it("flags a bad email", () => {
    const cfg = clone();
    cfg.identity.email = "not-an-email";
    expect(validateConfig(cfg).join(" ")).toMatch(/identity\.email/);
  });
  it("flags a missing role", () => {
    const cfg = clone();
    cfg.identity.role = "";
    expect(validateConfig(cfg).join(" ")).toMatch(/identity\.role/);
  });
  it("flags non-hex theme colors", () => {
    const cfg = clone();
    cfg.theme.accent = "vermilion";
    expect(validateConfig(cfg).join(" ")).toMatch(/theme\.accent/);
  });
  it("accepts 3-digit hex colors", () => {
    const cfg = clone();
    cfg.theme.accent = "#f30";
    expect(validateConfig(cfg)).toEqual([]);
  });
  it("flags an unknown font preset", () => {
    const cfg = clone();
    // @ts-expect-error deliberately invalid preset
    cfg.theme.fonts = "comic-sans";
    expect(validateConfig(cfg).join(" ")).toMatch(/theme\.fonts/);
  });
  it("flags empty hero lines", () => {
    const cfg = clone();
    cfg.home.heroLines = [];
    expect(validateConfig(cfg).join(" ")).toMatch(/heroLines/);
  });
  it("flags a hero image outside /images/", () => {
    const cfg = clone();
    cfg.home.heroImage = "https://example.com/x.jpg";
    expect(validateConfig(cfg).join(" ")).toMatch(/heroImage/);
  });
  it("flags empty projects", () => {
    const cfg = clone();
    cfg.projects = [];
    expect(validateConfig(cfg).join(" ")).toMatch(/projects is empty/);
  });
  it("flags a project with no summary", () => {
    const cfg = clone();
    cfg.projects[0].summary = "";
    expect(validateConfig(cfg).join(" ")).toMatch(/summary is empty/);
  });
  it("flags an invalid explicit slug", () => {
    const cfg = clone();
    cfg.projects[0].slug = "Bad Slug!";
    expect(validateConfig(cfg).join(" ")).toMatch(/slug/);
  });
  it("flags duplicate slugs", () => {
    const cfg = clone();
    cfg.projects[1].slug = cfg.projects[0].slug;
    const problems = validateConfig(cfg).join(" ");
    expect(problems).toMatch(/already used/);
  });
  it("flags duplicates created by auto-slugifying equal titles", () => {
    const cfg = clone();
    delete (cfg.projects[1] as { slug?: string }).slug;
    cfg.projects[1].title = cfg.projects[0].title;
    expect(validateConfig(cfg).join(" ")).toMatch(/already used/);
  });
  it("accepts a project with no slug (one is generated)", () => {
    const cfg = clone();
    delete (cfg.projects[0] as { slug?: string }).slug;
    expect(validateConfig(cfg)).toEqual([]);
  });
  it("flags a client with an empty name", () => {
    const cfg = clone();
    cfg.clients[0].name = "";
    expect(validateConfig(cfg).join(" ")).toMatch(/clients #1/);
  });
  it("flags a social with an empty href", () => {
    const cfg = clone();
    cfg.socials[0].href = "";
    expect(validateConfig(cfg).join(" ")).toMatch(/socials #1/);
  });
  it("accumulates multiple problems at once", () => {
    const cfg = clone();
    cfg.identity.email = "nope";
    cfg.theme.band = "grey";
    cfg.projects = [];
    expect(validateConfig(cfg).length).toBeGreaterThanOrEqual(3);
  });
});

describe("isValidEmail", () => {
  it.each([
    ["a@b.co", true],
    ["hello@tessamarlowe.com", true],
    ["plain", false],
    ["a@b", false],
    ["a b@c.com", false],
    ["@c.com", false],
    ["a@", false],
    ["", false],
  ])("%s → %s", (email, ok) => {
    expect(isValidEmail(email)).toBe(ok);
  });
});

describe("isValidHexColor", () => {
  it.each([
    ["#ff2e00", true],
    ["#FF2E00", true],
    ["#f30", true],
    ["ff2e00", false],
    ["#ff2e0", false],
    ["#ff2e000", false],
    ["#gggggg", false],
    ["red", false],
  ])("%s → %s", (hex, ok) => {
    expect(isValidHexColor(hex)).toBe(ok);
  });
});
