#!/bin/bash
# Robust retry: per-image timeout, sequential, resumable
S=/home/z/my-project/scripts/audit-tmp/shots
OUT=/home/z/my-project/scripts/audit-tmp/vlm

PROMPT='You are a senior product designer doing a meticulous visual QA pass on an Arabic RTL web app (Minsaj AI platform). Report ONLY concrete, visually verifiable issues: (1) misalignments between grid siblings, (2) inconsistent gaps, (3) inconsistent radii/borders/shadows between similar components, (4) typography problems, (5) contrast problems, (6) anything broken/clipped/distorted. For each: location, what is wrong, severity (P1/P2/P3). Terse. Do NOT invent issues. One-line overall impression at end. English.'

analyze() {
  local shot="$1"
  [ -f "$OUT/$shot.json" ] && grep -q "======= $shot" "$OUT/batch2.txt" 2>/dev/null && return
  echo "======= $shot =======" >> "$OUT/batch2.txt"
  timeout 100 z-ai vision -p "$PROMPT" -i "$S/$shot.png" -o "$OUT/$shot.json" > /dev/null 2>&1
  python3 -c "
import json
try:
    with open('$OUT/$shot.json') as f: d = json.load(f)
    c = d.get('choices',[{}])[0].get('message',{}).get('content','') or d.get('content','')
    print(c[:1600])
except Exception as e: print('ERR', e)
" >> "$OUT/batch2.txt"
  echo "" >> "$OUT/batch2.txt"
}

for shot in agents-1440 flows-1440 models-1440 settings-1440 usage-1440 knowledge-1440 team-1440 runs-1440 projects-1440 billing-1440; do
  analyze "$shot"
  echo "done: $shot"
done
echo "BATCH2_RETRY_DONE"
