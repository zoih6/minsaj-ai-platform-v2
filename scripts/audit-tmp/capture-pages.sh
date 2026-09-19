#!/bin/bash
# Systematic page capture + geometry audit for Minsaj frontend
S=/home/z/my-project/scripts/audit-tmp/shots
mkdir -p "$S"

# All app routes (locale-prefixed, ar = primary RTL)
ROUTES=(
  "home|/ar/app/home"
  "chat|/ar/app/chat"
  "learn|/ar/app/learn"
  "research|/ar/app/research"
  "create|/ar/app/create"
  "agents|/ar/app/agents"
  "flows|/ar/app/flows"
  "projects|/ar/app/projects"
  "runs|/ar/app/runs"
  "knowledge|/ar/app/knowledge"
  "models|/ar/app/models"
  "settings|/ar/app/settings"
  "team|/ar/app/team"
  "billing|/ar/app/billing"
  "usage|/ar/app/usage"
)

# Desktop capture pass
agent-browser set viewport 1440 900 > /dev/null
for entry in "${ROUTES[@]}"; do
  name="${entry%%|*}"; route="${entry##*|}"
  agent-browser open "http://localhost:3000$route" > /dev/null 2>&1
  agent-browser wait --load networkidle > /dev/null 2>&1
  sleep 1.2
  agent-browser screenshot --full "$S/${name}-1440.png" > /dev/null 2>&1
  echo "captured $name @1440"
done
echo "DESKTOP_DONE"
