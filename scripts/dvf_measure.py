#!/usr/bin/env python3
"""Measure the VLM-discovered claims: container widths at 2560, chat column width,
landing bottom space, contrast of faint elements, knowledge hydration context."""
import json, os
from playwright.sync_api import sync_playwright

BASE = "https://minsaj-ai-platform-v2.vercel.app"

MEASURE = """
() => {
  const out = {};
  // find the widest meaningful containers
  const vw = window.innerWidth;
  out.vw = vw;
  // main content containers
  const candidates = [];
  document.querySelectorAll('main, [class*="mj-main"], [class*="mj-page"], [class*="mj-shell"], [class*="mj-wrap"], [class*="mj-container"]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 200) candidates.push({cls: String(el.className).slice(0,70), w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right)});
  });
  out.containers = candidates.slice(0, 8);
  // chat bubbles / messages
  const bubbles = [];
  document.querySelectorAll('[class*="bubble"], [class*="message"], [class*="msg"], [class*="chat-turn"]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 100) bubbles.push({cls: String(el.className).slice(0,60), w: Math.round(r.width)});
  });
  out.bubbles = bubbles.slice(0, 6);
  // faint text contrast — landing header icons + trust line
  const faint = [];
  document.querySelectorAll('a, button, p, span').forEach(el => {
    const txt = (el.textContent || '').trim();
    const r = el.getBoundingClientRect();
    if (!txt || r.width === 0) return;
    const cs = getComputedStyle(el);
    const c = cs.color;
    const bg = cs.backgroundColor;
    faint.push({txt: txt.slice(0, 30), color: c, size: cs.fontSize});
  });
  out.textSample = faint.slice(0, 3);
  // page height vs last content bottom (dead space below)
  const all = [...document.querySelectorAll('body *')];
  let maxBottom = 0;
  all.forEach(el => { const r = el.getBoundingClientRect(); if (r.height > 0 && r.bottom > maxBottom && r.bottom < doc_h()) maxBottom = r.bottom; });
  function doc_h() { return document.documentElement.scrollHeight; }
  out.scrollHeight = document.documentElement.scrollHeight;
  out.maxContentBottom = Math.round(maxBottom);
  return out;
}
"""

def run():
    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for w, h, key in [(2560, 1080, "w2560"), (1440, 900, "d1440"), (390, 844, "m390")]:
            ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
            pg = ctx.new_page()
            for name, path in [("landing", "/ar"), ("home", "/ar/app/home"), ("chat", "/ar/app/chat")]:
                pg.goto(BASE + path, wait_until="load", timeout=40000)
                pg.wait_for_timeout(800)
                try:
                    m = pg.evaluate(MEASURE)
                except Exception as e:
                    m = {"err": str(e)[:120]}
                results[f"{key}__{name}"] = m
                # print digest
                conts = m.get("containers", [])
                bub = m.get("bubbles", [])
                print(f"--- {key} {name} (vw={m.get('vw')}) scrollH={m.get('scrollHeight')} contentBottom={m.get('maxContentBottom')}")
                for c in conts[:4]:
                    pct = round(100 * c["w"] / w)
                    print(f"    container {c['w']}px ({pct}% of vw) [{c['cls'][:50]}]")
                for b in bub[:3]:
                    pct = round(100 * b["w"] / w)
                    print(f"    bubble {b['w']}px ({pct}%) [{b['cls'][:40]}]")
            ctx.close()
        browser.close()
    with open("/home/z/my-project/verification/measurements.json", "w") as f:
        json.dump(results, f, indent=1, ensure_ascii=False)
    print("\nsaved verification/measurements.json")

run()
