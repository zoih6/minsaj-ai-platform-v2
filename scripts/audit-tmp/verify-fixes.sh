#!/bin/bash
# Post-fix regression: all footer types + overflow on all pages + stage rails
echo "=== FOOTER GEOMETRY ACROSS ALL CARD TYPES (1440) ==="
agent-browser set viewport 1440 900 > /dev/null
check_footer() {
  local route="$1" sel="$2" name="$3"
  agent-browser open "http://localhost:3000$route" > /dev/null 2>&1
  agent-browser wait --load networkidle > /dev/null 2>&1
  sleep 0.8
  R=$(agent-browser eval "(() => {
    const card = document.querySelector('$sel');
    if (!card) return 'SKIP';
    const footer = card.querySelector('.agent-card__actions, .flow-card__footer, .project-library-card__link, :scope > a.catalog, :scope > a');
    if (!footer) return 'NO-FOOTER';
    const cr = card.getBoundingClientRect();
    const fr = footer.getBoundingClientRect();
    const bR = Math.round(cr.right - fr.right), bB = Math.round(cr.bottom - fr.bottom), bL = Math.round(fr.left - cr.left);
    return JSON.stringify({name: '$name', bleedR: bR, bleedB: bB, bleedL: bL, ok: bR >= 0 && bB >= 0 && bR <= 2 && bB <= 2 && bL >= 0 && bL <= 2});
  })()" 2>&1 | tail -1)
  echo "$name: $R"
}
check_footer "/ar/app/agents" ".agent-card" "agents"
check_footer "/ar/app/flows" ".flow-card" "flows"
check_footer "/ar/app/projects" ".project-library-card" "projects"
check_footer "/ar/app/knowledge" ".knowledge-collection-card" "knowledge"
check_footer "/ar/app/models" ".catalog-model-card" "models"

echo ""
echo "=== STAGE RAILS (1440) ==="
for svc in learn research create; do
  agent-browser open "http://localhost:3000/ar/app/$svc" > /dev/null 2>&1
  agent-browser wait --load networkidle > /dev/null 2>&1
  sleep 1
  R=$(agent-browser eval '(() => {
    const items = [...document.querySelectorAll(".u2-stages li")];
    if (!items.length) return "no-rail";
    const hs = items.map(li => Math.round(li.querySelector("button").getBoundingClientRect().height));
    const liHs = items.map(li => Math.round(li.getBoundingClientRect().height));
    return JSON.stringify({btnHeights: [...new Set(hs)], liHeights: [...new Set(liHs)], uniform: new Set(hs).size === 1});
  })()' 2>&1 | tail -1)
  echo "$svc: $R"
done

echo ""
echo "=== OVERFLOW REGRESSION (390) ==="
agent-browser set viewport 390 844 > /dev/null
for route in home chat learn research create agents flows projects runs knowledge models settings team billing usage; do
  agent-browser open "http://localhost:3000/ar/app/$route" > /dev/null 2>&1
  agent-browser wait --load networkidle > /dev/null 2>&1
  sleep 0.5
  OVF=$(agent-browser eval "document.documentElement.scrollWidth - window.innerWidth" 2>/dev/null | tail -1)
  echo "$route: ${OVF}px"
done
agent-browser set viewport 1440 900 > /dev/null
echo "DONE"
