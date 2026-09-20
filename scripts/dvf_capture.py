#!/usr/bin/env python3
"""design-visual-frontend — Visual Verification Matrix
Baseline capture per skill protocol: real viewport API, deviceScaleFactor 1,
wait for fonts/network, capture raw screenshots + quantitative DOM measurements
(overflow, tap targets, overlaps, console errors).
"""
import json, os, sys, time
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:3000")
OUT = os.environ.get("OUT_DIR", "/home/z/my-project/verification/baseline")
VIEWPORTS = [
    ("m390", 390, 844),    # mobile
    ("t768", 768, 1024),   # tablet
    ("d1440", 1440, 900),  # desktop
    ("d1920", 1920, 1080), # wide desktop
    ("d2560", 2560, 1080), # ultra-wide
]
PAGES = [
    ("landing", "/ar"),
    ("home", "/ar/app/home"),
    ("chat", "/ar/app/chat"),
    ("projects", "/ar/app/projects"),
    ("runs", "/ar/app/runs"),
    ("tools", "/ar/app/tools"),
    ("models", "/ar/app/models"),
    ("knowledge", "/ar/app/knowledge"),
]

MEASURE_JS = """
() => {
  const doc = document.documentElement;
  const vw = window.innerWidth;
  const issues = { overflowX: doc.scrollWidth > vw + 1, scrollWidth: doc.scrollWidth, vw };
  // tiny tap targets (interactive elements < 40px in both dims, visible)
  const tiny = [];
  document.querySelectorAll('a,button,[role="button"],[role="tab"],input,select,textarea').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.width < 40 && r.height < 40) {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') return;
      tiny.push({tag: el.tagName, text: (el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,24), w: Math.round(r.width), h: Math.round(r.height)});
    }
  });
  issues.tinyTargets = tiny.slice(0, 12);
  // horizontal overflowers (elements extending past viewport)
  const overflowers = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > vw + 2 || r.left < -2)) {
      overflowers.push({tag: el.tagName, cls: String(el.className).slice(0,60), left: Math.round(r.left), right: Math.round(r.right)});
    }
  });
  issues.overflowers = overflowers.slice(0, 10);
  issues.overflowCount = overflowers.length;
  // page scroll height
  issues.scrollHeight = doc.scrollHeight;
  return issues;
}
"""

def main():
    os.makedirs(OUT, exist_ok=True)
    report = {"base": BASE, "captured_at": time.strftime("%Y-%m-%d %H:%M:%S"), "entries": []}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for vp_name, w, h in VIEWPORTS:
            ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
            page = ctx.new_page()
            console_errs = []
            page.on("console", lambda m: console_errs.append(m.text[:160]) if m.type == "error" else None)
            page.on("pageerror", lambda e: console_errs.append(f"PAGEERROR: {str(e)[:140]}"))
            for pg_name, path in PAGES:
                url = BASE + path
                try:
                    page.goto(url, wait_until="load", timeout=35000)
                except Exception:
                    try:
                        page.goto(url, wait_until="domcontentloaded", timeout=45000)
                        page.wait_for_timeout(2500)
                    except Exception as e:
                        report["entries"].append({"vp": vp_name, "page": pg_name, "error": str(e)[:200]})
                        continue
                page.wait_for_timeout(600)  # fonts & settle
                try:
                    page.evaluate("document.fonts.ready")
                except Exception:
                    pass
                page.wait_for_timeout(200)
                shot = os.path.join(OUT, f"{vp_name}__{pg_name}.png")
                page.screenshot(path=shot)
                try:
                    m = page.evaluate(MEASURE_JS)
                except Exception as e:
                    m = {"measure_error": str(e)[:120]}
                m["consoleErrors"] = console_errs[:6]
                entry = {"vp": f"{w}x{h}", "page": pg_name, "path": path, **m}
                report["entries"].append(entry)
                flag = "⚠ OVERFLOW" if m.get("overflowX") else "✓"
                print(f"[{vp_name}] {pg_name}: {flag} scrollW={m.get('scrollWidth')}/{w} tiny={len(m.get('tinyTargets',[]))} ofl-els={m.get('overflowCount','-')} errs={len(m.get('consoleErrors',[]))}")
            ctx.close()
        browser.close()
    with open(os.path.join(OUT, "report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=1)
    print(f"\nSaved: {OUT}/report.json + {len(report['entries'])} screenshots")

if __name__ == "__main__":
    main()
