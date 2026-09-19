#!/bin/bash
# Mobile captures at 390px + overflow check
S=/home/z/my-project/scripts/audit-tmp/shots
agent-browser set viewport 390 844 > /dev/null
for entry in "home|/ar/app/home" "chat|/ar/app/chat" "learn|/ar/app/learn" "research|/ar/app/research" "create|/ar/app/create" "agents|/ar/app/agents" "flows|/ar/app/flows" "models|/ar/app/models" "settings|/ar/app/settings" "usage|/ar/app/usage" "knowledge|/ar/app/knowledge" "team|/ar/app/team"; do
  name="${entry%%|*}"; route="${entry##*|}"
  agent-browser open "http://localhost:3000$route" > /dev/null 2>&1
  agent-browser wait --load networkidle > /dev/null 2>&1
  sleep 1
  agent-browser screenshot --full "$S/${name}-390.png" > /dev/null 2>&1
  OVF=$(agent-browser eval "document.documentElement.scrollWidth - window.innerWidth" 2>/dev/null | tail -1)
  echo "mobile $name: hOverflow=${OVF}px"
done
echo "MOBILE_DONE"
# back to desktop
agent-browser set viewport 1440 900 > /dev/null
