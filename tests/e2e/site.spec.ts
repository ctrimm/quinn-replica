import { test, expect } from "@playwright/test";
import { config } from "../../portfolio.config";

const projects = config.projects.map((p) => ({
  ...p,
  slug: p.slug!, // shipped config sets every slug explicitly
}));
const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("title is the person's name in caps", async ({ page }) => {
    await expect(page).toHaveTitle(config.identity.name.toUpperCase());
  });

  test("hero shows the giant word and the email", async ({ page }) => {
    const h1 = page.locator("h1.hero-word");
    await expect(h1).toBeVisible();
    for (const line of config.home.heroLines) {
      await expect(h1).toContainText(line);
    }
    await expect(page.locator(".hero-email")).toHaveText(config.identity.email);
  });

  test("hero image actually loads", async ({ page }) => {
    const ok = await page
      .locator(".hero-photo img")
      .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(ok).toBe(true);
  });

  test("theme colors from the config are applied", async ({ page }) => {
    const h1Color = await page
      .locator("h1.hero-word")
      .evaluate((el) => getComputedStyle(el).color);
    expect(h1Color).toBe(hexToRgb(config.theme.accent));
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe(hexToRgb(config.theme.background));
    const ink = await page
      .locator(".site-title")
      .evaluate((el) => getComputedStyle(el).color);
    expect(ink).toBe(hexToRgb(config.theme.accentInk!));
  });

  test("intro, consulting and latest sections render the config copy", async ({ page }) => {
    for (const p of config.home.intro) {
      await expect(page.locator(".intro-copy")).toContainText(p.slice(0, 30));
    }
    for (const p of config.home.consulting) {
      await expect(page.locator(".consulting-copy")).toContainText(p.slice(0, 30));
    }
    await expect(page.locator(".latest-meta")).toContainText(config.home.latest.label);
  });

  test("client list renders every configured client", async ({ page }) => {
    await expect(page.locator(".client-row")).toHaveCount(config.clients.length);
    for (const c of config.clients) {
      await expect(page.locator(".client-list")).toContainText(c.name);
    }
  });

  test("works band has one thumbnail and one stacked title per project", async ({ page }) => {
    await expect(page.locator(".thumb-row a")).toHaveCount(projects.length);
    await expect(page.locator(".project-stack a")).toHaveCount(projects.length);
  });

  test("every image on the page loads (after scrolling them into view)", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .filter((img) => !(img as HTMLImageElement).naturalWidth)
        .map((img) => img.getAttribute("src"))
    );
    expect(broken).toEqual([]);
  });

  test("every image has non-empty alt text", async ({ page }) => {
    const missing = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .filter((img) => !img.getAttribute("alt")?.trim())
        .map((img) => img.getAttribute("src"))
    );
    expect(missing).toEqual([]);
  });

  test("exactly one h1", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
  });
});

test.describe("navigation", () => {
  test("header links reach Info and Select Works, with active state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Info", exact: true }).click();
    await expect(page).toHaveURL(/\/info\/?$/);
    await expect(page.locator('.site-nav a[href="/info"]')).toHaveClass(/active/);
    await expect(page.locator('.site-nav a[href="/info"]')).toHaveAttribute("aria-current", "page");

    await page.getByRole("link", { name: "Select Works" }).first().click();
    await expect(page).toHaveURL(/\/selectworks\/?$/);
    await expect(page.locator('.site-nav a[href="/selectworks"]')).toHaveClass(/active/);
  });

  test("site title links back home", async ({ page }) => {
    await page.goto("/info");
    await page.locator(".site-title").click();
    await expect(page).toHaveURL(/127\.0\.0\.1:4173\/?$/);
  });

  test("footer shows the email as a mailto link and all socials", async ({ page }) => {
    await page.goto("/");
    const email = page.locator(".footer-email");
    await expect(email).toHaveAttribute("href", `mailto:${config.identity.email}`);
    await expect(page.locator(".footer-socials a")).toHaveCount(config.socials.length);
  });
});

test.describe("info page", () => {
  test("shows role heading, bio, availability and portrait", async ({ page }) => {
    await page.goto("/info");
    await expect(page.locator("h1")).toHaveText(config.identity.role);
    for (const p of config.info.bio) {
      await expect(page.locator(".info-copy")).toContainText(p.slice(0, 30));
    }
    await expect(page.locator(".info-copy")).toContainText(config.info.availability);
    await expect(page.locator(".client-row")).toHaveCount(config.clients.length);
    const ok = await page
      .locator(".info-photo img")
      .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(ok).toBe(true);
  });
});

test.describe("select works and project pages", () => {
  test("lists every project with a working View project link", async ({ page }) => {
    await page.goto("/selectworks");
    await expect(page.locator(".work-entry")).toHaveCount(projects.length);
    for (const p of projects) {
      const entry = page.locator(".work-entry", { hasText: p.title });
      await expect(entry.locator(`a[href="/${p.slug}"]`).first()).toBeVisible();
    }
  });

  test("clicking a project opens its page", async ({ page }) => {
    await page.goto("/selectworks");
    const first = projects[0];
    await page
      .locator(".work-entry", { hasText: first.title })
      .locator(`a.view[href="/${first.slug}"]`)
      .click();
    await expect(page).toHaveURL(new RegExp(`/${first.slug}/?$`));
    await expect(page.locator("h1")).toHaveText(first.title);
    await expect(page.locator(".project-hero .label-serif")).toHaveText(first.category);
    await expect(page.locator(".project-body p")).toContainText(first.summary.slice(0, 30));
  });

  for (const p of projects) {
    test(`project page loads directly: ${p.title}`, async ({ page }) => {
      await page.goto(`/${p.slug}`);
      await expect(page.locator("h1")).toHaveText(p.title);
      await expect(page.locator("h1")).toHaveCount(1);
      const ok = await page
        .locator(".project-body img")
        .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
      expect(ok).toBe(true);
    });
  }

  test("next-project link cycles through all projects and wraps", async ({ page }) => {
    await page.goto(`/${projects[0].slug}`);
    for (let i = 1; i <= projects.length; i++) {
      await page.locator(".project-next a").click();
      const expected = projects[i % projects.length];
      await expect(page).toHaveURL(new RegExp(`/${expected.slug}/?$`));
      await expect(page.locator("h1")).toHaveText(expected.title);
    }
  });

  test("home thumbnails lead to the matching project", async ({ page }) => {
    await page.goto("/");
    const last = projects[projects.length - 1];
    await page.locator(`.thumb-row a[href="/${last.slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${last.slug}/?$`));
  });
});

test.describe("machine-readable surfaces (AI agents & crawlers)", () => {
  test("llms.txt describes the person and every project", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.ok()).toBe(true);
    const body = await res.text();
    expect(body).toContain(`# ${config.identity.name}`);
    expect(body).toContain(config.identity.email);
    for (const p of projects) expect(body).toContain(p.title);
  });

  test("sitemap.xml lists every route", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBe(true);
    const body = await res.text();
    for (const p of projects) expect(body).toContain(`/${p.slug}</loc>`);
    expect(body).toContain("/info</loc>");
  });

  test("robots.txt allows crawling", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBe(true);
    expect(await res.text()).toContain("Allow: /");
  });

  test("home page carries JSON-LD for the person", async ({ page }) => {
    await page.goto("/");
    const data = await page.evaluate(() => {
      const el = document.querySelector('script[type="application/ld+json"]');
      return el ? JSON.parse(el.textContent!) : null;
    });
    expect(data?.["@type"]).toBe("Person");
    expect(data?.name).toBe(config.identity.name);
    expect(data?.email).toBe(config.identity.email);
  });
});

test.describe("mobile layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("home has no horizontal overflow on a phone", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("select works stacks without overflow", async ({ page }) => {
    await page.goto("/selectworks");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.locator(".work-entry")).toHaveCount(projects.length);
  });
});
