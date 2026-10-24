import { describe, it, expect } from "vitest";
import { slugify, isValidSlug } from "../../src/data/site";

describe("slugify", () => {
  it("lowercases and dashes spaces", () => {
    expect(slugify("Palmetto Issue")).toBe("palmetto-issue");
  });
  it("handles all caps", () => {
    expect(slugify("SQSP MAGAZINE")).toBe("sqsp-magazine");
  });
  it("keeps numbers", () => {
    expect(slugify("203 Issue")).toBe("203-issue");
  });
  it("collapses punctuation runs into one dash", () => {
    expect(slugify("Studio — Tailoring!")).toBe("studio-tailoring");
    expect(slugify("a  &  b")).toBe("a-b");
  });
  it("trims leading and trailing dashes", () => {
    expect(slugify("  --Concrete Poems-- ")).toBe("concrete-poems");
  });
  it("strips apostrophes instead of dashing them", () => {
    expect(slugify("Tessa's Book")).toBe("tessas-book");
  });
  it("removes diacritics", () => {
    expect(slugify("Café Étude")).toBe("cafe-etude");
  });
  it("returns empty string for punctuation-only input", () => {
    expect(slugify("!!!")).toBe("");
  });
  it("is idempotent", () => {
    const once = slugify("Atelier Quarterly No. 9");
    expect(slugify(once)).toBe(once);
  });
});

describe("isValidSlug", () => {
  it("accepts simple slugs", () => {
    expect(isValidSlug("palmetto-issue")).toBe(true);
    expect(isValidSlug("a1")).toBe(true);
    expect(isValidSlug("203")).toBe(true);
  });
  it("rejects uppercase, spaces, underscores and edge dashes", () => {
    expect(isValidSlug("Palmetto")).toBe(false);
    expect(isValidSlug("two words")).toBe(false);
    expect(isValidSlug("two_words")).toBe(false);
    expect(isValidSlug("-lead")).toBe(false);
    expect(isValidSlug("trail-")).toBe(false);
    expect(isValidSlug("double--dash")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });
});
