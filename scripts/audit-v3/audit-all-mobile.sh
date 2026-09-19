#!/bin/bash
# Audit all pages at mobile 375px: geometry + screenshots
set -u
BASE="http://localhost:3000"
OUT="/home/z/my-project/scripts/audit-v3"
AUDIT_JS="$(cat $OUT/geom-audit.js)"
PAGES=(
  "/ar|landing"
  "/ar/app/home|home"
  "/ar/app/chat|chat"
  "/ar/app/projects|projects"
  "/ar/app/runs|runs"
  "/ar/app/tools|tools"
  "/ar/app/models|models"
  "/ar/app/knowledge|knowledge"
  "/ar/app/agents|agents"
  "/ar/app/flows|flows"
  "/ar/app/settings|settings"
  "/ar/app/billing|billing"
  "/ar/app/team|team"
  "/ar/app/usage|usage"
)
for entry in "${PAGES[@]}"; do
  route="${entry%%|*}"; name="${entry##*|}"
  echo "=== $route ==="
  agent-browser set viewport 375 812 >/dev/null 2>&1
  agent-browser open "$BASE$route" >/dev/null 2>&1
  agent-browser wait --load networkidle >/dev/null 2>&1 || true
  agent-browser wait 1800 >/dev/null 2>&1 || true
  agent-browser screenshot --full "$OUT/m-$name.png" >/dev/null 2>&1 || echo "  [shot FAILED: $name]"
  agent-browser eval "$AUDIT_JS" > "$OUT/a-$name.json" 2>&1 || echo "  [audit FAILED: $name]"
done
echo "ALL_DONE"
