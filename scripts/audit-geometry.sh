#!/usr/bin/env bash
# Minsaj — Phase 22 visual-polish DOM geometry audit.
# Measures (never guesses): overflow, clipped elements, sub-floor text,
# distorted images, touch-target violations — per route × viewport × theme.
# Usage: bash scripts/audit-geometry.sh [quick]
#   quick = reduced matrix (representative routes only)

set -uo pipefail
cd "$(dirname "$0")/.."

BASE="http://localhost:3000"
OUT="scripts/audit-tmp"
mkdir -p "$OUT"

if [ "${1:-}" = "quick" ]; then
  ROUTES=(
    "ar/app/home" "ar/app/library" "ar/app/models" "ar/app/learn"
    "ar/app/team" "ar/app/billing" "ar/app/flows" "ar/app/knowledge"
  )
  VPS=("375x812" "1440x900")
else
  ROUTES=(
    "ar" "ar/en" "ar/app/home" "ar/app/chat" "ar/app/projects" "ar/app/runs" "ar/app/library"
    "ar/app/learn" "ar/app/research" "ar/app/create" "ar/app/code" "ar/app/analyze" "ar/app/explore"
    "ar/app/agents" "ar/app/flows" "ar/app/knowledge" "ar/app/models" "ar/app/models/routing"
    "ar/app/skills" "ar/app/tools" "ar/app/settings" "ar/app/team" "ar/app/billing" "ar/app/usage"
    "ar/app/agents/new" "ar/app/flows/new" "ar/app/runs/run_weekly_watch"
    "ar/app/projects/prj_saudi_launch" "ar/app/knowledge/col_launch" "ar/app/models/mdl_clarity"
  )
  VPS=("375x812" "768x1024" "1440x900")
fi
THEMES=("light" "dark")

# The audit payload: one JS expression returning a JSON string.
read -r -d '' AUDIT_JS <<'EOF' || true
(() => {
  const vw = window.innerWidth, vh = window.innerHeight;
  const res = { vw, vh, path: location.pathname };
  const de = document.documentElement;
  res.scrollW = de.scrollWidth; res.overflowX = de.scrollWidth > vw + 1;
  const clipped = [];
  for (const el of document.querySelectorAll('body *')) {
    if (clipped.length >= 14) break;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.position === 'sticky') continue;
    if (el.closest('[data-mj-audit-skip], .mj-scroll-x, [class*="scroll"], pre, code')) continue;
    if (r.left < -2 || r.right > vw + 2) {
      clipped.push({ sel: (el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]).slice(0, 48), l: Math.round(r.left), r: Math.round(r.right) });
    }
  }
  res.clipped = clipped;
  const smallText = []; const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode()) && smallText.length < 16) {
    const t = n.textContent.trim();
    if (t.length < 2) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    if (el.closest('.sr-only, [class*="preview-"]')) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const fs = parseFloat(cs.fontSize);
    if (fs < 11.4) smallText.push({ sel: String(el.className).split(' ')[0].slice(0, 40) || el.tagName, fs: +fs.toFixed(1), t: t.slice(0, 20) });
  }
  res.smallText = smallText;
  const distorted = [];
  document.querySelectorAll('img').forEach(img => {
    const r = img.getBoundingClientRect();
    if (r.width < 12 || r.height < 12) return;
    const na = (img.naturalWidth || 0) / (img.naturalHeight || 0);
    const ra = r.width / r.height;
    if (na > 0 && Math.abs(na - ra) / na > 0.06) distorted.push({ src: img.currentSrc.split('/').pop().slice(0, 36), na: +na.toFixed(2), ra: +ra.toFixed(2) });
  });
  res.distorted = distorted;
  if (vw < 768) {
    const smallTouch = [];
    for (const el of document.querySelectorAll('button, a[href], [role="button"], label:has(input), select')) {
      if (smallTouch.length >= 24) break;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (el.closest('.mj-chip, [class*="toolbar"], [class*="control-bar"]') && (r.width >= 42 && r.height >= 42)) continue;
      const label = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 16);
      if ((r.width < 40 || r.height < 40)) smallTouch.push({ sel: String(el.className).split(' ')[0].slice(0, 40) || el.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height), label });
    }
    res.smallTouch = smallTouch;
  }
  return JSON.stringify(res);
})()
EOF

pass=0
for route in "${ROUTES[@]}"; do
  for vp in "${VPS[@]}"; do
    W="${vp%x*}"; H="${vp#*x}"
    for theme in "${THEMES[@]}"; do
      agent-browser set viewport "$W" "$H" >/dev/null 2>&1
      agent-browser open "$BASE/$route" >/dev/null 2>&1
      agent-browser eval "localStorage.setItem('theme','$theme')" >/dev/null 2>&1
      agent-browser open "$BASE/$route" >/dev/null 2>&1
      agent-browser wait --load networkidle >/dev/null 2>&1
      agent-browser wait 500 >/dev/null 2>&1
      name="${route//\//_}-${W}-${theme}"
      raw=$(agent-browser eval "$AUDIT_JS" 2>/dev/null)
      echo "$raw" > "$OUT/${name}.json"
      # screenshot every combo (cheap, one per)
      agent-browser screenshot "$OUT/${name}.png" >/dev/null 2>&1
      pass=$((pass+1))
      ov=$(echo "$raw" | python3 -c "import json,sys; d=json.loads(json.loads(sys.stdin.read())); print('OVERFLOW' if d.get('overflowX') else 'ok', len(d.get('clipped',[])), len(d.get('smallText',[])), len(d.get('distorted',[])))" 2>/dev/null || echo parse-err)
      echo "[$name] $ov"
    done
  done
done
echo "==== $pass combinations audited — JSON + PNG in $OUT ===="
