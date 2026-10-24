import type { APIRoute } from "astro";
import { site, projects, clients, url as withBase } from "../data/site";

/**
 * /llms.txt — a plain-language map of this site for AI assistants,
 * following the llms.txt convention. Generated from portfolio.config.ts
 * so it can never drift out of sync with the site itself.
 */
export const GET: APIRoute = () => {
  const base = site.siteUrl;
  const url = (path: string) => (base ? `${base}${withBase(path)}` : withBase(path));
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.name} is a ${site.role.toLowerCase()}. This site is their portfolio: selected works, a client list, and contact details.`,
    "",
    "## Pages",
    "",
    `- [Home](${url("/")}): Hero, introduction, selected works, consulting, latest project and client list.`,
    `- [Info](${url("/info")}): Biography, availability for consulting engagements, and client list.`,
    `- [Select Works](${url("/selectworks")}): All projects.`,
    "",
    "## Projects",
    "",
    ...projects.map(
      (p) => `- [${p.title}](${url("/" + p.slug)}): ${p.category}. ${p.summary}`
    ),
    "",
    "## Clients",
    "",
    ...clients.map((c) => `- ${c.name} — ${c.role}`),
    "",
    "## Contact",
    "",
    `- Email: ${site.email}`,
    ...site.socials.map((s) => `- ${s.label}: ${s.href}`),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
