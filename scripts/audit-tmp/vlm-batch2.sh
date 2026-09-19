#!/bin/bash
# Batch 2: admin pages VLM + mobile captures
S=/home/z/my-project/scripts/audit-tmp/shots
OUT=/home/z/my-project/scripts/audit-tmp/vlm

PROMPT='You are a senior product designer doing a meticulous visual QA pass on an Arabic RTL web app (Minsaj AI platform). Look at this screenshot carefully and report ONLY concrete, visually verifiable issues: (1) misalignments between grid siblings, (2) inconsistent gaps, (3) inconsistent radii/borders/shadows between similar components, (4) typography problems (baseline, line-height, cramped text), (5) contrast problems, (6) anything broken/clipped/distorted. For each: location, what is wrong, severity (P1/P2/P3). Be specific and terse. Do NOT invent issues. End with a one-line overall impression. English.'

for shot in agents-1440 flows-1440 models-1440 settings-1440 usage-1440 knowledge-1440; do
  echo "======= $shot =======" >> "$OUT/batch2.txt"
  z-ai vision -p "$PROMPT" -i "$S/$shot.png" -o "$OUT/$shot.json" 2>/dev/null
  python3 -c "
import json
try:
    with open('$OUT/$shot.json') as f: d = json.load(f)
    c = d.get('choices',[{}])[0].get('message',{}).get('content','') or d.get('content','')
    print(c[:1800])
except Exception as e: print('ERR', e)
" >> "$OUT/batch2.txt"
  echo "" >> "$OUT/batch2.txt"
done
echo "BATCH2_DONE"

# Mobile pass 390px
agent-browser set viewport 390 844 > /dev/null
for entry in "home|/ar/app/home" "chat|/ar/app/chat" "learn|/ar/app/learn" "create|/ar/app/create" "agents|/ar/app/agents" "settings|/ar/app/settings"; do
  name="${entry%%|*}"; route="${entry##*|}"
  agent-browser open "http://localhost:3000$route" > /dev/null 2>&1
  agent-browser wait --load networkidle > /dev/null 2>&1
  sleep 1.2
  agent-browser screenshot --full "$S/${name}-390.png" > /dev/null 2>&1
  # horizontal overflow check at mobile
  OVF=$(agent-browser eval "document.documentElement.scrollWidth - window.innerWidth" 2>/dev/null | tail -1)
  echo "mobile $name: hOverflow=${OVF}px"
done
echo "MOBILE_DONE"
