#!/usr/bin/env python3
"""Summarize v3 mobile audit JSONs into one report."""
import json, glob, os

OUT = "/home/z/my-project/scripts/audit-v3"
files = sorted(glob.glob(f"{OUT}/a-*.json"))
total_issues = 0
for f in files:
    name = os.path.basename(f)[2:-5]
    try:
        raw = json.load(open(f))
        d = raw.get("result", raw) if isinstance(raw, dict) else json.loads(raw)
        if isinstance(d, str):
            d = json.loads(d)
    except Exception as e:
        print(f"[{name}] PARSE FAIL: {e}")
        continue
    vp = d["viewport"]
    issues = []
    if vp["horizontalScroll"]:
        issues.append(f"H-SCROLL +{vp['pageOverflowX']}px")
    if d["hScrollElements"]:
        issues.append(f"WIDE:{len(d['hScrollElements'])}")
    if d["parentOverflows"]:
        issues.append(f"POVFLOW:{len(d['parentOverflows'])}")
    if d["edgeHuggers"]:
        issues.append(f"EDGE:{len(d['edgeHuggers'])}")
    if d["overlaps"]:
        issues.append(f"OVERLAP:{len(d['overlaps'])}")
    if d["contrast"]:
        issues.append(f"CONTRAST:{len(d['contrast'])}/{d.get('textChecked','?')}")
    total = sum(int(i.split(":")[1].split("/")[0]) for i in issues if ":" in i)
    total_issues += total
    status = "OK" if not issues else " | ".join(issues)
    print(f"[{name:10s}] docW={vp['docW']:>4} fixed={d['fixedCount']} abs={d['absCount']:>3} text={d.get('textChecked',0):>3}  {status}")
    # detail dumps for problem pages
    if d["parentOverflows"]:
        for x in d["parentOverflows"][:4]: print(f"    POVF {x['el']} > {x['parent']} R+{x['overRight']} L+{x['overLeft']}")
    if d["edgeHuggers"]:
        for x in d["edgeHuggers"][:4]: print(f"    EDGE {x['el']} left={x.get('left', x.get('right'))} w={x['w']}")
    if d["overlaps"]:
        for x in d["overlaps"][:4]: print(f"    OVLP {x['a']} × {x['b']} {x['ix']}x{x['iy']} z:{x['za']}/{x['zb']}")
    if d["contrast"]:
        for x in d["contrast"][:4]: print(f"    CONT {x['el']} '{x['text']}' {x['fg']} on {x['bg']} = {x['ratio']} (need {x['need']})")
    if d["hScrollElements"]:
        for x in d["hScrollElements"][:4]: print(f"    WIDE {x['el']} w={x['w']}")
print(f"\nTOTAL ISSUES: {total_issues}")
