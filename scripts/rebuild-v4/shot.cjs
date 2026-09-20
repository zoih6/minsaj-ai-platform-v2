// Screenshot tool — MDS v4 QA (mobile 360 + desktop 1280)
const { chromium } = require("playwright");
const path = require("path");

const pages = process.argv.slice(2);
if (!pages.length) { console.log("usage: node shot.cjs <url> [<url>...]"); process.exit(1); }

(async () => {
  const browser = await chromium.launch();
  for (const url of pages) {
    const slug = url.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(-60);
    for (const [name, vp] of [["m360", { width: 360, height: 780 }], ["d1280", { width: 1280, height: 800 }]]) {
      const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
      const page = await ctx.newPage();
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
        await page.waitForTimeout(1200); // settle
        const file = path.join("/home/z/my-project/qa-v4", `${slug}-${name}.png`);
        await page.screenshot({ path: file, fullPage: false });
        console.log("shot:", file);
      } catch (e) {
        console.error("FAIL:", url, name, e.message.slice(0, 120));
      }
      await ctx.close();
    }
  }
  await browser.close();
})();
