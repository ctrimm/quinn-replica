import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
// args: baseUrl outDir name:path,...
const [base, outDir, spec] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PW_CHROME, args: ["--no-sandbox", "--headless=new"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
for (const pair of spec.split(",")) {
  const [name, path] = pair.split(":");
  if (name === "mobile") {
    const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mob.goto(base + path, { waitUntil: "commit", timeout: 60000 });
    await mob.waitForTimeout(2200);
    await mob.screenshot({ path: `${outDir}/raw-mobile.png` });
    await mob.close();
    continue;
  }
  await page.goto(base + path, { waitUntil: "commit", timeout: 60000 });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${outDir}/raw-${name}.png` });
}
await browser.close();
console.log("captured", outDir);
