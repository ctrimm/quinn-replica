/**
 * Site plumbing — do not edit for content.
 *
 * Everything a site owner changes lives in `portfolio.config.ts` at the
 * repo root. This module imports that config, validates it (failing the
 * build with plain-language problems when something is wrong), and exposes
 * the processed values + small pure helpers the pages and tests use.
 */
import { config } from "../../portfolio.config";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProjectInput {
  slug?: string;
  title: string;
  category: string;
  image: string;
  summary: string;
}

export interface Project extends Required<ProjectInput> {}

export interface FontPreset {
  serif: string;
  sans: string;
  /** Self-hosted woff2 files (public/fonts/) used by this preset. */
  serifFile: string;
  sansFile: string;
}

// ── Font presets ───────────────────────────────────────────────────────────

export const FONT_PRESETS: Record<string, FontPreset> = {
  bodoni: {
    serif: '"Bodoni Moda", "Didot", serif',
    sans: '"Archivo", "Helvetica Neue", Arial, sans-serif',
    serifFile: "/fonts/bodoni-moda-normal.woff2",
    sansFile: "/fonts/archivo-normal.woff2",
  },
  playfair: {
    serif: '"Playfair Display", Georgia, serif',
    sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
    serifFile: "/fonts/playfair-display-normal.woff2",
    sansFile: "/fonts/inter-normal.woff2",
  },
  fraunces: {
    serif: '"Fraunces", Georgia, serif',
    sans: '"Jost", "Helvetica Neue", Arial, sans-serif',
    serifFile: "/fonts/fraunces-normal.woff2",
    sansFile: "/fonts/jost-normal.woff2",
  },
};

export const DEFAULT_FONT_PRESET = "bodoni";

export function getFontPreset(name: string | undefined): FontPreset {
  if (name && name in FONT_PRESETS) return FONT_PRESETS[name];
  return FONT_PRESETS[DEFAULT_FONT_PRESET];
}

/** Inline :root overrides generated from the theme config. */
export function themeCssVars(theme: typeof config.theme): string {
  const fonts = getFontPreset(theme.fonts);
  return [
    `:root {`,
    `  --bg: ${theme.background};`,
    `  --bg-band: ${theme.band};`,
    `  --accent: ${theme.accent};`,
    `  --accent-ink: ${theme.accentInk ?? theme.accent};`,
    `  --serif: ${fonts.serif};`,
    `  --sans: ${fonts.sans};`,
    `}`,
  ].join("\n");
}

// ── Slugs ──────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2018\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// ── Validation ─────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export function isValidHexColor(value: string): boolean {
  return HEX_RE.test(value);
}

/**
 * Returns a list of plain-language problems with a config object.
 * An empty list means the config is good. Pure — safe to unit test.
 */
export function validateConfig(cfg: typeof config): string[] {
  const problems: string[] = [];
  const need = (ok: boolean, msg: string) => {
    if (!ok) problems.push(msg);
  };

  need(!!cfg.identity?.name?.trim(), "identity.name is empty — add your name.");
  need(
    isValidEmail(cfg.identity?.email ?? ""),
    `identity.email "${cfg.identity?.email}" doesn't look like an email address.`
  );
  need(!!cfg.identity?.role?.trim(), "identity.role is empty — add your job title.");

  for (const key of ["background", "band", "accent", "accentInk"] as const) {
    if (key === "accentInk" && !cfg.theme?.accentInk) continue;
    need(
      isValidHexColor(cfg.theme?.[key] ?? ""),
      `theme.${key} "${cfg.theme?.[key]}" is not a hex color like "#ff2e00".`
    );
  }
  need(
    !cfg.theme?.fonts || cfg.theme.fonts in FONT_PRESETS,
    `theme.fonts "${cfg.theme?.fonts}" is not one of: ${Object.keys(FONT_PRESETS).join(", ")}.`
  );

  need(
    Array.isArray(cfg.home?.heroLines) && cfg.home.heroLines.length > 0,
    "home.heroLines needs at least one line for the giant hero word."
  );
  need(
    !!cfg.home?.heroImage?.startsWith("/images/"),
    'home.heroImage should be a path like "/images/hero.jpg".'
  );
  need(
    (cfg.home?.intro?.length ?? 0) > 0,
    "home.intro needs at least one paragraph."
  );
  need(
    !!cfg.info?.image?.startsWith("/images/"),
    'info.image should be a path like "/images/info-portrait.jpg".'
  );

  need(
    Array.isArray(cfg.projects) && cfg.projects.length > 0,
    "projects is empty — add at least one project."
  );
  const seenSlugs = new Map<string, string>();
  (cfg.projects ?? []).forEach((p, i) => {
    const label = p.title ? `project "${p.title}"` : `project #${i + 1}`;
    need(!!p.title?.trim(), `${label}: title is empty.`);
    need(!!p.category?.trim(), `${label}: category is empty.`);
    need(!!p.summary?.trim(), `${label}: summary is empty.`);
    need(
      !!p.image?.startsWith("/images/"),
      `${label}: image should be a path like "/images/work.jpg".`
    );
    const slug = p.slug ?? (p.title ? slugify(p.title) : "");
    need(isValidSlug(slug), `${label}: slug "${slug}" must be lowercase letters, numbers and dashes only.`);
    if (seenSlugs.has(slug)) {
      problems.push(
        `${label}: slug "${slug}" is already used by "${seenSlugs.get(slug)}" — slugs must be unique.`
      );
    } else {
      seenSlugs.set(slug, p.title);
    }
  });

  (cfg.clients ?? []).forEach((c, i) => {
    need(!!c.role?.trim(), `clients #${i + 1}: role is empty (e.g. "Stylist, 2025").`);
    need(!!c.name?.trim(), `clients #${i + 1}: name is empty.`);
  });

  (cfg.socials ?? []).forEach((s, i) => {
    need(!!s.label?.trim(), `socials #${i + 1}: label is empty.`);
    need(!!s.href?.trim(), `socials #${i + 1} ("${s.label}"): href is empty.`);
  });

  return problems;
}

const problems = validateConfig(config);
if (problems.length > 0) {
  throw new Error(
    "Your portfolio.config.ts has problems:\n" +
      problems.map((p) => `  • ${p}`).join("\n")
  );
}

// ── Processed exports used by the pages ────────────────────────────────────

export const site = {
  name: config.identity.name,
  siteUrl: config.identity.siteUrl.replace(/\/+$/, ""),
  role: config.identity.role,
  email: config.identity.email,
  credit: config.identity.credit,
  socials: config.socials,
  theme: config.theme,
  fonts: getFontPreset(config.theme.fonts),
  home: config.home,
  info: config.info,
};

export const projects: Project[] = config.projects.map((p) => ({
  ...p,
  slug: p.slug ?? slugify(p.title),
}));

export const clients = config.clients;

/** Astro getStaticPaths payload for the [slug] project pages. */
export function projectRoutes() {
  return projects.map((project, i) => ({
    params: { slug: project.slug },
    props: { project, next: projects[(i + 1) % projects.length] },
  }));
}

export function nextProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) throw new Error(`Unknown project slug: ${slug}`);
  return projects[(i + 1) % projects.length];
}

export function mailto(email: string): string {
  return `mailto:${email}`;
}

// ── Base path (GitHub Pages subpath support) ───────────────────────────────

/**
 * The site is normally served from a domain root (SST/CloudFront), but the
 * GitHub Pages preview lives under a subpath (/quinn-replica). Astro
 * exposes that as import.meta.env.BASE_URL; url() prefixes internal paths
 * with it. In root mode BASE_URL is "/" and url() returns paths unchanged.
 */
export const BASE_PATH = (import.meta.env?.BASE_URL ?? "/").replace(/\/+$/, "");

export function url(path: string): string {
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  return BASE_PATH + (path.startsWith("/") ? path : `/${path}`);
}

// ── Self-hosted font faces ─────────────────────────────────────────────────

const FONT_FACES: Array<[family: string, file: string, weight: string, style: string]> = [
  ["Bodoni Moda", "bodoni-moda-normal", "400 900", "normal"],
  ["Bodoni Moda", "bodoni-moda-italic", "400 900", "italic"],
  ["Archivo", "archivo-normal", "100 900", "normal"],
  ["Archivo", "archivo-italic", "100 900", "italic"],
  ["Playfair Display", "playfair-display-normal", "400 900", "normal"],
  ["Playfair Display", "playfair-display-italic", "400 900", "italic"],
  ["Inter", "inter-normal", "100 900", "normal"],
  ["Inter", "inter-italic", "100 900", "italic"],
  ["Fraunces", "fraunces-normal", "100 900", "normal"],
  ["Fraunces", "fraunces-italic", "100 900", "italic"],
  ["Jost", "jost-normal", "100 900", "normal"],
  ["Jost", "jost-italic", "100 900", "italic"],
];

/** @font-face rules with base-aware URLs — generated into the page head
 *  because the inlined stylesheet can't know the deployment subpath. */
export function fontFaceCss(): string {
  return FONT_FACES.map(
    ([family, file, weight, style]) =>
      `@font-face { font-family: "${family}"; src: url("${url(`/fonts/${file}.woff2`)}") format("woff2"); font-weight: ${weight}; font-style: ${style}; font-display: swap; }`
  ).join("\n");
}

// ── Responsive images ──────────────────────────────────────────────────────

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Astro/Vite bundling moves this module at build time, so import.meta.url
// does not point at the source tree — resolve public/ from the project
// root (where builds and tests run), with the source-relative path as a
// fallback for unbundled execution.
import { join } from "node:path";
const PUBLIC_DIR = [
  join(process.cwd(), "public") + "/",
  fileURLToPath(new URL("../../public/", import.meta.url)),
].find((dir) => existsSync(dir))!;

/**
 * Builds a srcset for an image from the resized variants sitting next to
 * it in public/ (e.g. hero.jpg + hero-480.jpg + hero-960.jpg).
 * `variantWidths` are widths to look for as `-<width>` files; `fullWidth`
 * is the original file's own width. Variants that don't exist are skipped,
 * and if none exist the result is undefined — a swapped-in photo without
 * generated variants simply serves the original, never a broken link.
 * (Regenerate variants with: python3 scripts/optimize-images.py)
 */
export function imgSrcset(
  src: string,
  variantWidths: number[],
  fullWidth: number
): string | undefined {
  const parts: Array<[number, string]> = [[fullWidth, src]];
  for (const w of variantWidths) {
    const variant = src.replace(/(\.[a-z0-9]+)$/i, `-${w}$1`);
    if (existsSync(PUBLIC_DIR + variant.replace(/^\//, ""))) {
      parts.push([w, variant]);
    }
  }
  if (parts.length === 1) return undefined;
  return parts
    .sort((a, b) => a[0] - b[0])
    .map(([w, p]) => `${url(p)} ${w}w`)
    .join(", ");
}
