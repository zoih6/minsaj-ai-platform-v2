#!/usr/bin/env python3
"""MIDS v3 §1b — split primary into two tiers.
background: var(--u-primary)  →  background: var(--u-primary-solid)
(FILL tier: white text rides on it) — text/border usages keep --u-primary
(TEXT tier: light in dark mode so primary-on-soft passes AA).
Exact-boundary replacement only; count and report every file."""
import re, glob

FILES = glob.glob('/home/z/my-project/src/app/styles/universal/*.css') + ['/home/z/my-project/src/app/globals.css']
total = 0
for f in FILES:
    src = open(f).read()
    # only background fills (bg / background), not color/border
    new, n1 = re.subn(r'(?<=background:) var\(--u-primary\)', ' var(--u-primary-solid)', src)
    new, n2 = re.subn(r'(?<=background-color:) var\(--u-primary\)', ' var(--u-primary-solid)', new)
    # gradients embedded in background shorthand lists: var(--u-primary) inside linear-gradient
    new, n3 = re.subn(r'(gradient\([^;]*?)var\(--u-primary\)', r'\1var(--u-primary-solid)', new)
    if n1 + n2 + n3:
        open(f, 'w').write(new)
        print(f'{f.split("/")[-1]}: bg={n1} bgcolor={n2} grad={n3}')
        total += n1 + n2 + n3
print(f'TOTAL replaced: {total}')
