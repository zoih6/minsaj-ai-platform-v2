#!/bin/bash
# Precise DOM measurements for VLM-flagged issues
measure() {
  local route="$1"; local js="$2"; local label="$3"
  agent-browser open "http://localhost:3000$route" > /dev/null 2>&1
  agent-browser wait --load networkidle > /dev/null 2>&1
  sleep 0.8
  echo "### $label"
  agent-browser eval "$js" 2>&1 | tail -1
  echo ""
}

# 1. Stats row geometry (flows page)
measure "/ar/app/flows" '(() => {
  const cards = [...document.querySelectorAll(".ops-stats > div")];
  return JSON.stringify(cards.map(c => {
    const r = c.getBoundingClientRect();
    const cs = getComputedStyle(c);
    const dd = c.querySelector("dd");
    const ddTop = dd ? dd.getBoundingClientRect().top - r.top : null;
    return {h: Math.round(r.height), bg: cs.backgroundColor.slice(0,30), pad: cs.padding, ddTop: Math.round(ddTop||0)};
  }));
})()' "FLOWS-STATS"

# 2. Stats row geometry (knowledge page)
measure "/ar/app/knowledge" '(() => {
  const cards = [...document.querySelectorAll(".ops-stats > div")];
  return JSON.stringify(cards.map(c => {
    const r = c.getBoundingClientRect();
    return {h: Math.round(r.height), bg: getComputedStyle(c).backgroundColor.slice(0,30)};
  }));
})()' "KNOWLEDGE-STATS"

# 3. Search bar vertical centering (any app page topbar)
measure "/ar/app/home" '(() => {
  const s = document.querySelector(".universal-shell-search");
  if (!s) return "NO SEARCH";
  const r = s.getBoundingClientRect();
  const span = s.querySelector("span");
  const svg = s.querySelector("svg");
  const sr = span ? span.getBoundingClientRect() : null;
  const vr = svg ? svg.getBoundingClientRect() : null;
  return JSON.stringify({
    barH: Math.round(r.height),
    textCenterOffset: sr ? Math.round((sr.top + sr.height/2) - (r.top + r.height/2)) : null,
    iconCenterOffset: vr ? Math.round((vr.top + vr.height/2) - (r.top + r.height/2)) : null,
    textH: sr ? Math.round(sr.height) : null, iconH: vr ? Math.round(vr.height) : null
  });
})()' "SEARCH-CENTERING"

# 4. Sidebar nav item: icon vs text centering
measure "/ar/app/home" '(() => {
  const links = [...document.querySelectorAll(".universal-shell-link")].slice(0,5);
  return JSON.stringify(links.map(l => {
    const lr = l.getBoundingClientRect();
    const span = l.querySelector("span");
    const b = l.querySelector("b");
    const sr = span ? span.getBoundingClientRect() : null;
    const br = b ? b.getBoundingClientRect() : null;
    return {
      itemH: Math.round(lr.height),
      iconCenterOff: sr ? Math.round((sr.top + sr.height/2) - (lr.top + lr.height/2)) : null,
      textCenterOff: br ? Math.round((br.top + br.height/2) - (lr.top + lr.height/2)) : null,
      iconH: sr ? Math.round(sr.height) : null,
      textH: br ? Math.round(br.height) : null
    };
  }));
})()' "SIDEBAR-ICON-VS-TEXT"

# 5. Agents grid gaps
measure "/ar/app/agents" '(() => {
  const grid = document.querySelector(".mj-grid, .agent-grid, [class*=grid]");
  const cards = [...document.querySelectorAll("main a, main .card")].slice(0,6);
  const rs = cards.map(c => { const r = c.getBoundingClientRect(); return {t: Math.round(r.top), l: Math.round(r.left), r: Math.round(r.right), b: Math.round(r.bottom)}; });
  return JSON.stringify(rs.slice(0,4));
})()' "AGENTS-GRID"
