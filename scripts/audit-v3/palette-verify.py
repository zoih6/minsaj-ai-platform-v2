#!/usr/bin/env python3
"""MIDS v3 palette verification — every text token must mathematically pass
WCAG AA (4.5:1 normal, 3:1 large/bold) on its declared surface.
This script COMPUTES the palette; mids.css only ships verified pairs."""
import itertools

def hex2rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def lum(h):
    r, g, b = [v/255 for v in hex2rgb(h)]
    def f(c): return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b)

def ratio(fg, bg):
    l1, l2 = lum(fg), lum(bg)
    if l1 < l2: l1, l2 = l2, l1
    return (l1+0.05)/(l2+0.05)

# ---- Surfaces (light theme / dark theme) ----
SURFACES = {
    # light theme
    'canvas-l': '#F7F8FB', 'surface-l': '#FFFFFF', 'tint-l': '#EEF2FF', 'subtle-l': '#F3F4F9',
    # dark theme
    'canvas-d': '#0B0D12', 'surface-d': '#11141B', 'raised-d': '#171B24', 'tint-d': '#1C2030',
}

CANDIDATES = {
    # text
    'ink-d': '#F2F4F8', 'ink2-d': '#C3C9D6', 'ink3-d': '#98A1B3',
    'ink-l': '#141824', 'ink2-l': '#3D4454', 'ink3-l': '#5B6373',
    # brand violet
    'violet-300': '#B4AAFF', 'violet-400': '#9A8FFF', 'violet-500': '#8B7FFF', 'violet-600': '#6F5BF0',
    # status two-tier
    'green-l': '#047857', 'green-d': '#3DDC97',
    'amber-l': '#92610A', 'amber-d': '#FBBF24',
    'red-l': '#B3261E', 'red-d': '#F87171',
}

print("=== TEXT TOKENS vs SURFACES (need 4.5:1) ===")
pairs = [
    ('ink-d','canvas-d'), ('ink-d','surface-d'), ('ink2-d','canvas-d'), ('ink2-d','surface-d'),
    ('ink2-d','raised-d'), ('ink3-d','canvas-d'), ('ink3-d','surface-d'), ('ink3-d','tint-d'),
    ('ink-l','canvas-l'), ('ink-l','surface-l'), ('ink2-l','canvas-l'), ('ink2-l','surface-l'),
    ('ink2-l','tint-l'), ('ink3-l','canvas-l'), ('ink3-l','surface-l'), ('ink3-l','subtle-l'),
]
for fg, bg in pairs:
    r = ratio(CANDIDATES[fg], SURFACES[bg])
    print(f"{fg:10s} on {bg:10s} = {r:5.2f}  {'PASS' if r>=4.5 else 'FAIL'}")

print("\n=== BRAND/STATUS as text (need 4.5 normal / 3.0 large>=19px bold) ===")
accent_pairs = [
    ('violet-300','canvas-d'), ('violet-300','surface-d'), ('violet-300','tint-d'),
    ('violet-400','canvas-d'), ('violet-400','surface-d'),
    ('violet-600','canvas-l'), ('violet-600','surface-l'), ('violet-600','tint-l'),
    ('green-l','surface-l'), ('green-l','canvas-l'), ('green-l','tint-l'),
    ('green-d','canvas-d'), ('green-d','surface-d'), ('green-d','tint-d'),
    ('amber-l','surface-l'), ('amber-d','canvas-d'), ('amber-d','surface-d'),
    ('red-l','surface-l'), ('red-d','canvas-d'), ('red-d','surface-d'),
]
for fg, bg in accent_pairs:
    r = ratio(CANDIDATES[fg], SURFACES[bg])
    tag = 'PASS-text' if r >= 4.5 else ('PASS-large' if r >= 3.0 else 'FAIL')
    print(f"{fg:11s} on {bg:10s} = {r:5.2f}  {tag}")

print("\n=== NON-TEXT UI (icons, borders meaningful) need 3:1 ===")
ui_pairs = [
    ('violet-400','canvas-d'), ('violet-500','surface-l'), ('green-d','canvas-d'),
    ('ink3-d','canvas-d'), ('ink3-l','surface-l'), ('violet-600','surface-l'),
]
for fg, bg in ui_pairs:
    r = ratio(CANDIDATES[fg], SURFACES[bg])
    print(f"{fg:11s} on {bg:10s} = {r:5.2f}  {'PASS' if r>=3.0 else 'FAIL'}")
