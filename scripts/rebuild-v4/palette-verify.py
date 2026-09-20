#!/usr/bin/env python3
"""MDS v4 palette verification — WCAG math gate BEFORE any CSS is written."""

def lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def lum(rgb):
    r, g, b = (lin(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def ratio(fg, bg):
    l1, l2 = sorted((lum(fg), lum(bg)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)

def hx(s):
    s = s.lstrip('#')
    return tuple(int(s[i:i+2], 16) for i in (0, 2, 4))

def over(fg_hx, alpha, base_hx):
    f, b = (hx(fg_hx) if isinstance(fg_hx, str) else fg_hx), (hx(base_hx) if isinstance(base_hx, str) else base_hx)
    return tuple(round(f[i] * alpha + b[i] * (1 - alpha)) for i in range(3))

D_BG = "#0A1128"
D_SURFACE = "#152040"
L_BG = "#F4F6FB"
L_SURFACE = "#FFFFFF"

checks = [
    ("D ink/canvas",        "#EDF1FD", D_BG, 4.5),
    ("D ink/surface",       "#EDF1FD", D_SURFACE, 4.5),
    ("D secondary/canvas",  "#AAB5D6", D_BG, 4.5),
    ("D secondary/surface", "#AAB5D6", D_SURFACE, 4.5),
    ("D muted/canvas",      "#7C89AF", D_BG, 4.5),
    ("D muted/surface",     "#7C89AF", D_SURFACE, 4.5),
    ("D faint/canvas",      "#5E6B93", D_BG, 3.0),
    ("D accent-text/canvas",   "#A9A6FF", D_BG, 4.5),
    ("D accent-text/surface",  "#A9A6FF", D_SURFACE, 4.5),
    ("D white/accent-fill",    "#FFFFFF", "#6B4DFF", 4.5),
    ("D white/accent-hover",   "#FFFFFF", "#7458FF", 4.5),
    ("D accent-fill edge vs surface", "#6B4DFF", D_SURFACE, 3.0),
    ("D accent-fill edge vs canvas",  "#6B4DFF", D_BG, 3.0),
    ("D success/canvas",    "#4ADE8F", D_BG, 4.5),
    ("D success/surface",   "#4ADE8F", D_SURFACE, 4.5),
    ("D warning/canvas",    "#FBBF54", D_BG, 4.5),
    ("D danger/canvas",     "#FF8B8B", D_BG, 4.5),
    ("D danger/surface",    "#FF8B8B", D_SURFACE, 4.5),
    ("L ink/canvas",        "#141B36", L_BG, 4.5),
    ("L ink/surface",       "#141B36", L_SURFACE, 4.5),
    ("L secondary/canvas",  "#4B567A", L_BG, 4.5),
    ("L secondary/surface", "#4B567A", L_SURFACE, 4.5),
    ("L muted/canvas",      "#5D6890", L_BG, 4.5),
    ("L muted/surface",     "#5D6890", L_SURFACE, 4.5),
    ("L accent-text/canvas",  "#4A2ED8", L_BG, 4.5),
    ("L accent-text/surface", "#4A2ED8", L_SURFACE, 4.5),
    ("L white/accent-fill",   "#FFFFFF", "#4A2ED8", 4.5),
    ("L accent-fill edge/canvas", "#4A2ED8", L_BG, 3.0),
    ("L success/surface",   "#0E7C42", L_SURFACE, 4.5),
    ("L warning/surface",   "#7A5200", L_SURFACE, 4.5),
    ("L warning/canvas-tint", "#7A5200", "#E3E4E6", 4.5),
    ("L danger/surface",    "#C22B2B", L_SURFACE, 4.5),
    ("D focus ring/canvas", "#8F8AFF", D_BG, 3.0),
    ("L focus ring/canvas", "#4A2ED8", L_BG, 3.0),
]

fails = 0
for label, fg, bg, minimum in checks:
    r = ratio(hx(fg), hx(bg))
    ok = r >= minimum
    if not ok:
        fails += 1
    print(f"{'PASS' if ok else 'FAIL'}  {r:6.2f}:1  (min {minimum})  {label}")

print("\n" + ("ALL PAIRS PASS — safe to write CSS" if fails == 0 else f"{fails} PAIRS FAIL — fix before CSS"))
