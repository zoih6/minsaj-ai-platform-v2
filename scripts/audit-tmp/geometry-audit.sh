#!/bin/bash
# Geometry audit: overflow + layout sanity per page
ROUTES=(
  "home|/ar/app/home"
  "chat|/ar/app/chat"
  "agents|/ar/app/agents"
  "flows|/ar/app/flows"
  "models|/ar/app/models"
  "settings|/ar/app/settings"
  "usage|/ar/app/usage"
  "learn|/ar/app/learn"
)

AUDIT_JS='(() => {
  const vw = window.innerWidth;
  const issues = [];
  // 1. horizontal overflow + offenders
  const docOverflow = document.documentElement.scrollWidth - vw;
  const over = [];
  document.querySelectorAll("body *").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 1 && (r.right > vw + 1 || r.left < -1) && !el.closest("[aria-hidden]")) {
      const cs = getComputedStyle(el);
      if (cs.position === "fixed") return;
      if (over.length < 8) over.push({tag: el.tagName, cls: (el.className.baseVal||el.className||"").toString().slice(0,60), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width)});
    }
  });
  // 2. tap targets < 40px among interactive
  const small = [];
  document.querySelectorAll("button, a[href], [role=button]").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && (r.height < 40 || r.width < 40)) {
      if (small.length < 8) small.push({tag: el.tagName, txt: (el.textContent||"").trim().slice(0,25), h: Math.round(r.height), w: Math.round(r.width)});
    }
  });
  return JSON.stringify({vw, docOverflow, over, small}, null, 0);
})()'

for entry in "${ROUTES[@]}"; do
  name="${entry%%|*}"; route="${entry##*|}"
  agent-browser open "http://localhost:3000$route" > /dev/null 2>&1
  agent-browser wait --load networkidle > /dev/null 2>&1
  sleep 1
  echo "=== $name ==="
  agent-browser eval "$AUDIT_JS" 2>&1 | head -3
done
