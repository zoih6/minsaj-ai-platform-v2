#!/usr/bin/env bash
# v23 full regression — overflow + letter-spacing law + weight contract + focus ring
set -e
cd /home/z/my-project
mkdir -p scripts/audit-tmp/v23/reg

PAGES_AR=(/ar /ar/app/home /ar/app/learn /ar/app/research /ar/app/create /ar/app/code /ar/app/agents /ar/app/flows /ar/app/projects /ar/app/runs /ar/app/knowledge /ar/app/models /ar/app/settings /ar/app/team /ar/app/billing /ar/app/usage)

echo "═══ 1. Horizontal overflow @1440 (AR) ═══"
agent-browser set --viewport 1440 900 >/dev/null 2>&1 || true
for p in "${PAGES_AR[@]}"; do
  agent-browser open "http://localhost:3000$p" >/dev/null 2>&1
  ov=$(agent-browser eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tail -1 | tr -d '"')
  echo "$p → overflow: ${ov}px"
done

echo ""
echo "═══ 2. Horizontal overflow @390 (AR mobile) ═══"
agent-browser set --viewport 390 844 >/dev/null 2>&1 || true
for p in /ar /ar/app/home /ar/app/learn /ar/app/agents /ar/app/models /ar/app/knowledge; do
  agent-browser open "http://localhost:3000$p" >/dev/null 2>&1
  ov=$(agent-browser eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tail -1 | tr -d '"')
  echo "$p → overflow: ${ov}px"
done

echo ""
echo "═══ 3. Letter-spacing law on AR (sample of tracked classes) ═══"
agent-browser set --viewport 1440 900 >/dev/null 2>&1 || true
agent-browser open "http://localhost:3000/ar" >/dev/null 2>&1
agent-browser eval "
const probes = ['.eyebrow', '.universal-hero__copy h1', '.luma-brand__word'];
const out = probes.map(sel => { const el = document.querySelector(sel); return sel + ': ' + (el ? getComputedStyle(el).letterSpacing : 'n/a'); });
JSON.stringify(out)" 2>/dev/null | tail -1
agent-browser open "http://localhost:3000/ar/app/learn" >/dev/null 2>&1
agent-browser eval "JSON.stringify({eyebrow: getComputedStyle(document.querySelector('[data-testid=\"u2-service-eyebrow\"]')).letterSpacing, h1: getComputedStyle(document.querySelector('.u2-workbench__head h1')).letterSpacing + '/' + getComputedStyle(document.querySelector('.u2-workbench__head h1')).fontWeight})" 2>/dev/null | tail -1

echo ""
echo "═══ 4. EN page tracking PRESERVED (law must not touch lang=en) ═══"
agent-browser open "http://localhost:3000/en" >/dev/null 2>&1
agent-browser eval "
const el = document.querySelector('.eyebrow') || document.querySelector('.universal-hero__copy h1');
JSON.stringify({lang: document.documentElement.lang, el: el ? el.className.slice(0,30) : 'none', ls: el ? getComputedStyle(el).letterSpacing : 'n/a'})" 2>/dev/null | tail -1

echo ""
echo "═══ 5. Focus ring contract (workbench buttons) ═══"
agent-browser open "http://localhost:3000/ar/app/learn" >/dev/null 2>&1
agent-browser eval "
const b = document.querySelector('.u2-learn :is(button, select)') || document.querySelector('button');
b.focus();
const cs = getComputedStyle(b);
JSON.stringify({outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor, offset: cs.outlineOffset})" 2>/dev/null | tail -1

echo ""
echo "═══ 6. Dark theme spot check (theme survives) ═══"
agent-browser open "http://localhost:3000/ar/app/home" >/dev/null 2>&1
agent-browser eval "localStorage.setItem('theme','dark'); 'set'" >/dev/null 2>&1
agent-browser open "http://localhost:3000/ar/app/home" >/dev/null 2>&1
agent-browser eval "JSON.stringify({theme: document.documentElement.getAttribute('data-theme'), bg: getComputedStyle(document.body).backgroundColor})" 2>/dev/null | tail -1
agent-browser eval "localStorage.removeItem('theme'); 'reset'" >/dev/null 2>&1
echo "done"
