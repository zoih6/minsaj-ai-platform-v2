#!/usr/bin/env python3
"""Light-theme variant of the v4 audit (wave A QA): pins next-themes to
light via localStorage before navigation, then runs the same geometry +
contrast audit (geom-audit-v4.js, shared exemptions)."""
import json, subprocess, sys

BASE = "http://localhost:3000"
AUDIT_JS = open("/home/z/my-project/scripts/rebuild-v4/geom-audit-v4.js").read()
EXEMPT_SEL = [".mj-drawer", ".mj-bottom-nav", ".mj-skip-link", ".mj-overlay", ".mj-dialog", ".mj-cmd", ".mj-drawer-scrim"]

def run(url, w=360, h=780):
    subprocess.run(["agent-browser", "set", "viewport", str(w), str(h)], capture_output=True)
    # seed same-origin origin first so the localStorage write is allowed
    subprocess.run(["agent-browser", "open", BASE + "/ar/app/home"], capture_output=True)
    subprocess.run(["agent-browser", "wait", "--load", "networkidle"], capture_output=True)
    subprocess.run(["agent-browser", "eval", "localStorage.setItem('theme','light'); 'ok'"], capture_output=True)
    subprocess.run(["agent-browser", "open", url], capture_output=True)
    subprocess.run(["agent-browser", "wait", "--load", "networkidle"], capture_output=True)
    subprocess.run(["agent-browser", "wait", "1500"], capture_output=True)
    raw = subprocess.run(["agent-browser", "eval", AUDIT_JS], capture_output=True, text=True).stdout.strip()
    if raw.startswith('"') and raw.endswith('"'):
        raw = json.loads(raw)
    return json.loads(raw)

def keep(items):
    return [i for i in items if not any(sel[1:] in json.dumps(i) for sel in EXEMPT_SEL)]

def audit(url, w=360, h=780):
    d = run(url, w, h)
    theme = subprocess.run(["agent-browser", "eval", "document.documentElement.dataset.theme"], capture_output=True, text=True).stdout.strip().strip('"')
    po, eh, ov, ct = keep(d.get("parentOverflows", [])), keep(d.get("edgeHuggers", [])), keep(d.get("overlaps", [])), keep([c for c in d.get("contrast", []) if not c.get("exempt")])
    hs = d.get("pageOverflowX", 0)
    ok = not (hs or po or eh or ov or ct)
    print(f"\n== {url} @{w} [light:{theme}] — {'CLEAN' if ok else 'DEFECTS'}")
    print(f"   hscroll={hs} parentOF={len(po)} edge={len(eh)} overlap={len(ov)} contrast={len(ct)}")
    for i in po[:4]: print("   OF:", json.dumps(i)[:160])
    for i in eh[:4]: print("   EH:", json.dumps(i)[:160])
    for i in ov[:4]: print("   OV:", json.dumps(i)[:200])
    for i in ct[:4]: print("   CT:", json.dumps(i)[:200])
    return ok

if __name__ == "__main__":
    all_ok = True
    for r in sys.argv[1:]:
        for w in (360, 1280):
            all_ok = audit(BASE + r, w, 780 if w < 500 else 800) and all_ok
    sys.exit(0 if all_ok else 1)
