/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  YOUR PORTFOLIO — EDIT THIS FILE ONLY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  This is the only file you need to touch to make this site yours.
 *  Change the words between the quotes, save, and rebuild / redeploy:
 *
 *      npm run dev        → preview your changes live
 *      npm run deploy     → publish them
 *
 *  Rules of thumb:
 *  • Keep the quotes " " around text.
 *  • Keep commas where you find them.
 *  • Images live in the `public/images/` folder — put your photo there and
 *    write its path below, e.g. "/images/my-photo.jpg".
 *  • `slug` is the web address for a project: "palmetto-issue" becomes
 *    yoursite.com/palmetto-issue. Lowercase letters, numbers and dashes
 *    only. Leave it out and one is made from the title automatically.
 *  • Colors are hex codes like "#ff2e00" — search "hex color picker"
 *    if you want a different palette.
 *
 *  If something here is invalid (a bad email, a missing image, two projects
 *  with the same slug…) the build stops and tells you exactly what to fix.
 */

export const config = {
  // ── Who you are ──────────────────────────────────────────────────────────
  identity: {
    name: "Tessa Marlowe",
    role: "Stylist & Creative Director",
    email: "hello@tessamarlowe.com",
    // Your site's web address once it's live, e.g. "https://tessamarlowe.com".
    // Used for search engines and AI assistants. Leave "" until you have one.
    siteUrl: "",
    // Shown in the footer. Set to "" to hide the credit line.
    credit: "Made with Astro + SST",
  },

  // ── Social / contact links (footer) ──────────────────────────────────────
  socials: [
    { label: "Instagram", href: "#" },
    { label: "Email", href: "mailto:hello@tessamarlowe.com" },
    { label: "Linkedin", href: "#" },
  ],

  // ── Look & feel ──────────────────────────────────────────────────────────
  theme: {
    background: "#e9e9e9", // page background
    band: "#dbdbdb", // slightly darker band behind Select Works
    accent: "#ff2e00", // headlines and big display text
    // Small text (nav, paragraphs, footer) uses this deeper shade of the
    // same color — the bright accent is too light for small text to pass
    // accessibility contrast checks. Keep it in the same color family.
    accentInk: "#b91e00",
    // Pick one: "bodoni" (classic editorial), "playfair" (softer serif),
    // "fraunces" (warm, chunky serif). The matching sans comes built in.
    fonts: "bodoni",
  },

  // ── Home page words ──────────────────────────────────────────────────────
  home: {
    // The giant word in the hero. Two lines, like PORT / FOLIO.
    heroLines: ["Port", "folio"],
    heroImage: "/images/hero.jpg",
    heroImageAlt: "Tessa Marlowe holding a vintage film camera to her face",
    intro: [
      "I'm Tessa — a stylist and creative director working between Lisbon and New York. I started in costume for regional theatre, which is where I learned that clothes are just character you can touch.",
      "Nine years of editorials, campaigns and covers since then: styling, directing, consulting, and shooting film on every set that lets me.",
    ],
    consulting: [
      "Away from set I consult for independent labels across Europe and the US. The travel started a book project, Night Bus — street photography of the best-dressed strangers waiting for the last ride home.",
      "Commercial folio available upon request.",
    ],
    latest: {
      label: "Latest Project",
      image: "/images/latest.jpg",
      imageAlt: "Black and white profile portrait in a dark suit",
      lines: ["Night Bus — street photography,", "launching early next year"],
    },
  },

  // ── Info page words ──────────────────────────────────────────────────────
  info: {
    image: "/images/info-portrait.jpg",
    imageAlt: "Tessa Marlowe in a black blazer outdoors, face turned to the light",
    bio: [
      "Raised in Savannah, trained in costume, and now based between Lisbon and New York. I style and direct editorial work, and I shoot film behind the scenes whenever nobody stops me — it's the clothes, and the people in them, that keep me interested.",
    ],
    availability: "I'm currently available for consulting engagements.",
  },

  // ── Your projects ────────────────────────────────────────────────────────
  // Add, remove or reorder freely — the home page, the Select Works page
  // and each project's own page are all generated from this list.
  projects: [
    {
      slug: "palmetto-issue",
      title: "Palmetto Issue",
      category: "Editorial — Cover Story",
      image: "/images/work-palmetto.jpg",
      summary:
        "A cover story in a single black dress, shot against hot stone and hard shadow — styling stripped back until the silhouette does all the work.",
    },
    {
      slug: "atelier-quarterly",
      title: "Atelier Quarterly",
      category: "Magazine — On Location",
      image: "/images/work-atelier.jpg",
      summary:
        "Unpressed linen, sea air and a jacket worn mid-gesture. A location story styled to look caught, not posed.",
    },
    {
      slug: "studio-tailoring",
      title: "Studio Tailoring",
      category: "Editorial — Studio Series",
      image: "/images/work-studio.jpg",
      summary:
        "One long belted coat, one stool, white seamless. A studio series about proportion, posture and knowing when to stop.",
    },
    {
      slug: "concrete-poems",
      title: "Concrete Poems",
      category: "Street — On Location",
      image: "/images/work-concrete.jpg",
      summary:
        "A grey suit walking away from a brutalist facade — the street series that turned into Tessa's Night Bus book project.",
    },
  ],

  // ── Client list (home + info pages) ──────────────────────────────────────
  clients: [
    { role: "Stylist, 2025", name: "Atelier Quarterly" },
    { role: "Creative Direction, 2024", name: "Hotel Almada" },
    { role: "Stylist, 2023", name: "Palmetto Issue" },
    { role: "Associate Stylist, 2022", name: "Issue No. 9" },
    { role: "Associate Stylist, 2021", name: "Marfa Light" },
  ],
};

export default config;
