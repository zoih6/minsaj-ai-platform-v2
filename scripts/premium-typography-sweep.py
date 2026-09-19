#!/usr/bin/env python3
"""
premium-typography-sweep.py — Minsaj Home premium pass, step 1+2.

WHAT (root cause fix, not symptom patch):
  Tajawal had ONE real face (500) registered as 600. Result:
  - body 400  -> rendered the 500 file (everything Medium => "AI-heavy")
  - any 700   -> 500 file + browser faux-bold smear (broken letterforms)
  - any 600   -> 500 file (the old hack)
  Hierarchy was a LIE: one weight, smeared.

NOW:
  1. Register REAL Tajawal 400/500/700 (arabic + latin, GF subsets).
  2. Sweep every `font-weight: 600` -> `500` (identical pixels to today,
     honest tomorrow). 700 stays 700 and becomes REAL bold.
  Ladder: 400 body · 500 emphasis/labels/buttons · 700 display only.
"""
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
AR_RANGE = "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC,U+102E0-102FB,U+10E60-10E7E,U+10EC2-10EC4,U+10EFC-10EFF,U+1EE00-1EE03,U+1EE05-1EE1F,U+1EE21-1EE22,U+1EE24,U+1EE27,U+1EE29-1EE32,U+1EE34-1EE37,U+1EE39,U+1EE3B,U+1EE42,U+1EE47,U+1EE49,U+1EE4B,U+1EE4D-1EE4F,U+1EE51-1EE52,U+1EE54,U+1EE57,U+1EE59,U+1EE5B,U+1EE5D,U+1EE5F,U+1EE61-1EE62,U+1EE64,U+1EE67-1EE6A,U+1EE6C-1EE72,U+1EE74-1EE77,U+1EE79-1EE7C,U+1EE7E,U+1EE80-1EE89,U+1EE8B-1EE9B,U+1EEA1-1EEA3,U+1EEA5-1EEA9,U+1EEAB-1EEBB,U+1EEF0-1EEF1"
LAT_RANGE = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"

NEW_FONTFACE = f"""/* ============================================================
   TAJAWAL — real weight ladder (v24 typography law)
   Root-cause fix: Tajawal previously shipped ONE face (500)
   registered as 600, so body-400, emphasis-600 and display-700
   all rendered the same Medium file (700 via faux-bold smear).
   The Arabic UI could never build a true hierarchy -> the "heavy,
   generated" feel flagged in review. NOW: real Google Fonts cuts.
   LADDER (author intent == rendered reality):
     400 body & quiet meta  ·  500 labels/buttons/section titles
     700 display headings ONLY (hero h1, page titles)
   Law: nothing may request 600 (snaps to 700 = loud); write 500.
   ============================================================ */
@font-face {{
  font-family: "Tajawal";
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url("/fonts/tajawal-arabic-400-normal.woff2") format("woff2");
  unicode-range: {AR_RANGE};
}}
@font-face {{
  font-family: "Tajawal";
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url("/fonts/tajawal-latin-400-normal.woff2") format("woff2");
  unicode-range: {LAT_RANGE};
}}
@font-face {{
  font-family: "Tajawal";
  font-style: normal;
  font-display: swap;
  font-weight: 500;
  src: url("/fonts/tajawal-arabic-500-normal.woff2") format("woff2");
  unicode-range: {AR_RANGE};
}}
@font-face {{
  font-family: "Tajawal";
  font-style: normal;
  font-display: swap;
  font-weight: 500;
  src: url("/fonts/tajawal-latin-500-normal.woff2") format("woff2");
  unicode-range: {LAT_RANGE};
}}
@font-face {{
  font-family: "Tajawal";
  font-style: normal;
  font-display: swap;
  font-weight: 700;
  src: url("/fonts/tajawal-arabic-700-normal.woff2") format("woff2");
  unicode-range: {AR_RANGE};
}}
@font-face {{
  font-family: "Tajawal";
  font-style: normal;
  font-display: swap;
  font-weight: 700;
  src: url("/fonts/tajawal-latin-700-normal.woff2") format("woff2");
  unicode-range: {LAT_RANGE};
}}"""

def main() -> None:
    found = ROOT / "src/app/styles/universal/foundations.css"
    css = found.read_text(encoding="utf-8")

    # --- 1. Replace old comment + both hack @font-face blocks ---
    old_block = re.search(
        r"/\* =+\n\s*TAJAWAL 600 — mapped face.*?unicode-range: [^;]+;\n\}",
        css,
        re.DOTALL,
    )
    if not old_block:
        raise SystemExit("FATAL: old Tajawal block not found — abort, no changes.")
    css = css[: old_block.start()] + NEW_FONTFACE + css[old_block.end():]
    found.write_text(css, encoding="utf-8")
    print(f"[font-face] foundations.css rewritten with 6 real faces")

    # --- 2. Sweep font-weight: 600 -> 500 across all CSS ---
    targets = [ROOT / "src/app/globals.css", ROOT / "src/app/universal.css"]
    targets += sorted((ROOT / "src/app/styles/universal").glob("*.css"))
    total = 0
    for f in targets:
        text = f.read_text(encoding="utf-8")
        hits = len(re.findall(r"font-weight:\s*600\b", text))
        if hits:
            text = re.sub(r"(font-weight:\s*)600\b", r"\g<1>500", text)
            f.write_text(text, encoding="utf-8")
            print(f"[sweep 600->500] {f.name}: {hits}")
            total += hits
    print(f"[sweep] total replaced: {total}")

    # --- 3. Audit: no 600 may remain anywhere in src CSS ---
    leftover = []
    for f in targets:
        for i, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            if re.search(r"font-weight:\s*600", line):
                leftover.append(f"{f.name}:{i}")
    print(f"[audit] leftover 600s: {leftover if leftover else 'NONE — clean'}")

if __name__ == "__main__":
    main()
