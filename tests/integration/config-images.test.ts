import { describe, it, expect } from "vitest";
import { existsSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "../../portfolio.config";

const PUBLIC = join(process.cwd(), "public");

function expectRealJpeg(publicPath: string) {
  const file = join(PUBLIC, publicPath);
  expect(existsSync(file), `${publicPath} should exist in public/`).toBe(true);
  expect(statSync(file).size, `${publicPath} should not be empty`).toBeGreaterThan(1000);
  const head = readFileSync(file).subarray(0, 3);
  // JPEG magic bytes FF D8 FF
  expect([...head], `${publicPath} should be a real JPEG`).toEqual([0xff, 0xd8, 0xff]);
}

describe("config ↔ images on disk", () => {
  it("hero image exists and is a JPEG", () => {
    expectRealJpeg(config.home.heroImage);
  });
  it("latest-project image exists and is a JPEG", () => {
    expectRealJpeg(config.home.latest.image);
  });
  it("info portrait exists and is a JPEG", () => {
    expectRealJpeg(config.info.image);
  });
  it.each(config.projects.map((p) => [p.title, p.image] as const))(
    "project image exists: %s",
    (_title, image) => {
      expectRealJpeg(image);
    }
  );
  it("no two projects share an image", () => {
    const images = config.projects.map((p) => p.image);
    expect(new Set(images).size).toBe(images.length);
  });
  it("every font preset's self-hosted woff2 files exist", async () => {
    const { FONT_PRESETS } = await import("../../src/data/site");
    for (const preset of Object.values(FONT_PRESETS)) {
      for (const file of [preset.serifFile, preset.sansFile]) {
        const path = join(PUBLIC, file);
        expect(existsSync(path), file).toBe(true);
        const head = readFileSync(path).subarray(0, 4).toString("ascii");
        expect(head, `${file} should be a woff2`).toBe("wOF2");
      }
    }
  });
  it("favicon and robots.txt ship in public/", () => {
    expect(existsSync(join(PUBLIC, "favicon.svg"))).toBe(true);
    const robots = readFileSync(join(PUBLIC, "robots.txt"), "utf-8");
    expect(robots).toMatch(/User-agent: \*/);
    expect(robots).toMatch(/Allow: \//);
  });
});

describe("config completeness for the templates", () => {
  it("every image has alt text configured where the templates need it", () => {
    expect(config.home.heroImageAlt.trim().length).toBeGreaterThan(10);
    expect(config.home.latest.imageAlt.trim().length).toBeGreaterThan(10);
    expect(config.info.imageAlt.trim().length).toBeGreaterThan(10);
  });
  it("hero has exactly the lines the design expects (1-3)", () => {
    expect(config.home.heroLines.length).toBeGreaterThanOrEqual(1);
    expect(config.home.heroLines.length).toBeLessThanOrEqual(3);
  });
  it("social links labelled Email point at the identity email", () => {
    const emailSocial = config.socials.find((s) => s.label === "Email");
    if (emailSocial) {
      expect(emailSocial.href).toBe(`mailto:${config.identity.email}`);
    }
  });
});
