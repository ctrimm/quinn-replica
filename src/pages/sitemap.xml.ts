import type { APIRoute } from "astro";
import { site, projects, BASE_PATH } from "../data/site";

/** /sitemap.xml — generated from the config's project list. */
export const GET: APIRoute = ({ url }) => {
  const base = (site.siteUrl || url.origin) + BASE_PATH;
  const paths = ["/", "/info", "/selectworks", ...projects.map((p) => `/${p.slug}`)];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((p) => `  <url><loc>${base}${p}</loc></url>`).join("\n") +
    `\n</urlset>\n`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
