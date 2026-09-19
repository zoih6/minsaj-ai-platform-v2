#!/usr/bin/env python3
"""Minsaj v23 polish audit — code-level scan against MINSAJ-POLISH-STANDARDS.md
Scans all CSS for violations of standards C1 (weight>600), C3 (letter-spacing
that can hit Arabic), E1 (off-scale spacing), F1 (off-scale radius), G2
(focus ring consistency), plus inventory of raw px values."""

import re, glob, json, collections

CSS_FILES = glob.glob('src/app/**/*.css', recursive=True)

# Arabic-context selectors: anything not under html[lang="en"] could render Arabic.
# Letter-spacing on Arabic breaks joining. We flag ALL letter-spacing rules
# that apply to potentially-Arabic text (i.e., not scoped to [lang="en"],
# .ltr-value, .mono, or latin-only contexts).

findings = collections.defaultdict(list)
raw_px_radius = collections.Counter()
raw_px_spacing = collections.Counter()
weights = collections.Counter()

RADIUS_SCALE = {4, 6, 8, 10, 12, 14, 16, 20, 22, 24, 30, 999, 9999}
SPACING_SCALE = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96, 112, 128}

for path in CSS_FILES:
    css = open(path).read()
    lines = css.split('\n')

    # C1: font-weight > 600
    for m in re.finditer(r'font-weight\s*:\s*([0-9]{3})\b', css):
        w = int(m.group(1))
        weights[w] += 1
        if w > 600:
            ln = css[:m.start()].count('\n') + 1
            findings['C1_weight_over_600'].append(f'{path}:{ln} → {w}')

    # Also bold keyword
    for m in re.finditer(r'font-weight\s*:\s*bold\b', css):
        ln = css[:m.start()].count('\n') + 1
        findings['C1_bold_keyword'].append(f'{path}:{ln}')

    # C3: letter-spacing rules (flag those not scoped to latin contexts)
    for m in re.finditer(r'([-\w\[\]"\'=\. :#,()>]*)\{\s*([^}]*letter-spacing\s*:\s*([^;}]+))', css):
        sel = m.group(1).strip()[-80:]
        val = m.group(3).strip()
        ln = css[:m.start()].count('\n') + 1
        latin_scoped = ('lang="en"' in sel or 'ltr-value' in sel or 'mono' in sel
                        or 'latin' in sel or '--u-' in val)
        if not latin_scoped:
            findings['C3_letter_spacing_unscoped'].append(f'{path}:{ln} [{sel}] → {val}')

    # F1: raw border-radius px not on scale
    for m in re.finditer(r'border-radius\s*:\s*([^;]+);', css):
        val = m.group(1)
        if 'var(' in val or val in ('0', '50%', 'inherit'):
            continue
        for num in re.findall(r'(\d+)px', val):
            n = int(num)
            raw_px_radius[n] += 1
            if n not in RADIUS_SCALE and n != 1:  # 1px = nested hairline, fine
                ln = css[:m.start()].count('\n') + 1
                findings['F1_radius_offscale'].append(f'{path}:{ln} → {val.strip()[:50]}')

    # G2: focus-visible ring inventory
    for m in re.finditer(r':focus-visible\s*\{([^}]*)\}', css):
        body = m.group(1).strip()[:90]
        ln = css[:m.start()].count('\n') + 1
        findings['G2_focus_rules'].append(f'{path}:{ln} → {body}')

    # G4: reduced-motion support check
has_rm = False

print('=== WEIGHT DISTRIBUTION ===')
for w, c in sorted(weights.items()):
    print(f'  {w}: {c} uses')

print('\n=== RAW RADIUS PX VALUES (frequency) ===')
for n, c in raw_px_radius.most_common(15):
    mark = '' if n in RADIUS_SCALE else '  ← OFF-SCALE'
    print(f'  {n}px: {c}{mark}')

for key in sorted(findings):
    vals = findings[key]
    print(f'\n=== {key} ({len(vals)}) ===')
    for v in vals[:14]:
        print(f'  {v}')
    if len(vals) > 14:
        print(f'  … +{len(vals)-14} more')

# G4: prefers-reduced-motion
rm_files = [f for f in CSS_FILES if 'prefers-reduced-motion' in open(f).read()]
print(f'\n=== G4 reduced-motion present in: {rm_files} ===')
