#!/bin/bash
# VLM design review of screenshots — batch 1: core surfaces
S=/home/z/my-project/scripts/audit-tmp/shots
OUT=/home/z/my-project/scripts/audit-tmp/vlm
mkdir -p "$OUT"

PROMPT='You are a senior product designer doing a meticulous visual QA pass on an Arabic RTL web app (Minsaj AI platform). Look at this screenshot carefully and report ONLY concrete, visually verifiable issues you can see: (1) misalignments (items that should align on a grid but do not), (2) inconsistent spacing (unequal gaps between similar elements), (3) inconsistent radii/borders/shadows between similar components, (4) typography problems (baseline misalignment, cramped line-height, mixed sizes that look unintentional), (5) color/contrast problems, (6) anything that looks broken, clipped or distorted. For each issue give: location (what element/section), what is wrong, and estimated severity (P1 broken/P2 inconsistent/P3 polish). Be specific and terse. If a category has no issues, skip it. Do NOT invent issues. End with a one-line overall impression. Answer in English.'

for shot in home-1440 chat-1440 learn-1440 research-1440 create-1440; do
  echo "======= $shot =======" >> "$OUT/batch1.txt"
  z-ai vision -p "$PROMPT" -i "$S/$shot.png" -o "$OUT/$shot.json" 2>/dev/null
  python3 -c "
import json
try:
    with open('$OUT/$shot.json') as f: d = json.load(f)
    c = d.get('choices',[{}])[0].get('message',{}).get('content','') or d.get('content','')
    print(c[:2200])
except Exception as e: print('ERR', e)
" >> "$OUT/batch1.txt"
  echo "" >> "$OUT/batch1.txt"
done
echo "BATCH1_DONE"
