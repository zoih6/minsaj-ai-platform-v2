#!/usr/bin/env python3
"""MDS v4 audit runner — parses agent-browser double-encoded JSON,
applies shell-chrome exemptions (by-design elements), prints verdict."""
import json, subprocess, sys

BASE = "http://localhost:3000"
AUDIT_JS = open("/home/z/my-project/scripts/rebuild-v4/geom-audit-v4.js").read()

# by-design: off-canvas drawer, fixed chrome bands, hidden a11y helpers
EXEMPT_SEL = [".mj-drawer", ".mj-bottom-nav", ".mj-skip-link", ".mj-overlay", ".mj-dialog", ".mj-cmd", ".mj-drawer-scrim"]

def run(url, w=360, h=780):
    for cmd in (["set", "viewport", str(w), str(h)], ["open", url]):
        subprocess.run(["agent-browser", *cmd], capture_output=True)
    subprocess.run(["agent-browser", "wait", "--load", "networkidle"], capture_output=True)
    subprocess.run(["agent-browser", "wait", "1500"], capture_output=True)
    raw = subprocess.run(["agent-browser", "eval", AUDIT_JS], capture_output=True, text=True).stdout.strip()
    if raw.startswith('"') and raw.endswith('"'):
        raw = json.loads(raw)  # de-stringify
    return json.loads(raw)

def exempt(entry):
    s = json.dumps(entry)
    return any(sel[1:] in s for sel in EXEMPT_SEL)

def audit(url, w=360, h=780, label=""):
    d = run(url, w, h)
    def keep(items):
        return [i for i in items if not any(sel[1:] in json.dumps(i) for sel in EXEMPT_SEL)]
    po = keep(d.get("parentOverflows", []))
    eh = keep(d.get("edgeHuggers", []))
    ov = keep(d.get("overlaps", []))
    ct = keep([c for c in d.get("contrast", []) if not c.get("exempt")])
    hs = d.get("pageOverflowX", 0)
    name = label or url
    ok = not (hs or po or eh or ov or ct)
    print(f"\n== {name} @{w} — {'CLEAN' if ok else 'DEFECTS'}")
    print(f"   hscroll={hs} parentOF={len(po)} edge={len(eh)} overlap={len(ov)} contrast={len(ct)}")
    for i in po[:4]: print("   OF:", json.dumps(i)[:160])
    for i in eh[:4]: print("   EH:", json.dumps(i)[:160])
    for i in ov[:4]: print("   OV:", json.dumps(i)[:200])
    for i in ct[:4]: print("   CT:", json.dumps(i)[:160])
    return ok

if __name__ == "__main__":
    routes = sys.argv[1:] or ["/ar/app/home"]
    widths = [360, 1280]
    all_ok = True
    for r in routes:
        for w in widths:
            all_ok = audit(BASE + r, w, 780 if w < 500 else 800) and all_ok
    sys.exit(0 if all_ok else 1)
