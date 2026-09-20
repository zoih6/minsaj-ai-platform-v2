#!/bin/bash
# MDS v4 QA sweep — geometry audit + screenshots at 360 / 390 / 414 / 1280
# Usage: audit.sh [name] [routes-file]
set -u
BASE="http://localhost:3000"
OUT="/home/z/my-project/qa-v4"
NAME="${1:-run}"
mkdir -p "$OUT"
AUDIT_JS="$(cat /home/z/my-project/scripts/audit-v3/geom-audit.js)"

ROUTES=(
  "/ar|landing"
  "/ar/app/home|home"
  "/ar/app/chat|chat"
  "/ar/app/projects|projects"
  "/ar/app/runs|runs"
  "/ar/app/agents|agents"
  "/ar/app/flows|flows"
  "/ar/app/models|models"
  "/ar/app/knowledge|knowledge"
  "/ar/app/tools|tools"
  "/ar/app/skills|skills"
  "/ar/app/usage|usage"
  "/ar/app/team|team"
  "/ar/app/billing|billing"
  "/ar/app/settings|settings"
  "/en|landing-en"
  "/en/app/home|home-en"
)

declare -a FAILS=()
for entry in "${ROUTES[@]}"; do
  route="${entry%%|*}"; slug="${entry##*|}"
  for W in 360 1280; do
    H=$(( W < 500 ? 780 : 800 ))
    agent-browser set viewport "$W" "$H" >/dev/null 2>&1
    agent-browser open "$BASE$route" >/dev/null 2>&1
    agent-browser wait --load networkidle >/dev/null 2>&1 || true
    agent-browser wait 1500 >/dev/null 2>&1 || true
    JSON="$(agent-browser eval "$AUDIT_JS" 2>/dev/null)"
    echo "$JSON" > "$OUT/$NAME-$W-$slug.json"
    # verdict
    VERDICT="$(echo "$JSON" | python3 -c "
import json,sys
try:
  d=json.load(sys.stdin)
  bad = d['hScrollElements'][:3] if d.get('hScrollElements') else []
  po = d.get('parentOverflows',[])[:3]
  ov = d.get('overlaps',[])[:3]
  eh = d.get('edgeHuggers',[])[:3]
  ct = [c for c in d.get('contrast',[]) if not c.get('exempt')][:3]
  hs = d.get('pageOverflowX',0)
  print(f\"hscroll={hs} parentOF={len(d.get('parentOverflows',[]))} edge={len(d.get('edgeHuggers',[]))} overlap={len(d.get('overlaps',[]))} contrastF={len([c for c in d.get('contrast',[]) if not c.get('exempt')])}\")
except Exception as e:
  print('PARSE-FAIL', e)
" 2>&1)"
    echo "[$NAME $W $slug] $VERDICT"
    agent-browser screenshot "$OUT/$NAME-$W-$slug.png" >/dev/null 2>&1 || echo "  shot-fail: $slug"
  done
done
echo "DONE — results in $OUT"