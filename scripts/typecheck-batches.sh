#!/usr/bin/env bash
# Batched TypeScript checks — each batch builds a small program (fits in ~3.9GB machine)
# Purpose: catch type errors in recently changed files WITHOUT running the full tsc (OOM on this box)
set -u
cd /home/z/my-project

declare -a BATCHES=(
  "src/components/mj"
  "src/app/[locale]/app/models src/app/[locale]/app/billing src/app/[locale]/app/usage"
  "src/app/[locale]/app/agents src/app/[locale]/app/flows"
  "src/app/[locale]/app/home src/app/[locale]/app/chat src/app/[locale]/app/knowledge src/app/[locale]/app/projects src/app/[locale]/app/runs"
  "src/app/[locale]/app/settings src/app/[locale]/app/skills src/app/[locale]/app/team src/app/[locale]/app/tools src/app/[locale]/(marketing)"
  "src/app/[locale]/layout.tsx src/app/[locale]/loading.tsx src/app/[locale]/app/layout.tsx src/app/[locale]/app/loading.tsx src/lib"
)

TOTAL_ERRORS=0
i=1
for batch in "${BATCHES[@]}"; do
  # Build a narrowed tsconfig for this batch
  python3 - "$batch" <<'PYEOF'
import json, sys, os
batch = sys.argv[1].split()
files = []
for root in batch:
    if os.path.isfile(root):
        files.append(root); continue
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ('node_modules',)]
        for f in filenames:
            if f.endswith(('.ts', '.tsx')):
                files.append(os.path.join(dirpath, f))
cfg = {
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "noEmit": True,
        "incremental": True,
        "tsBuildInfoFile": "./scripts/.tsbuildinfo.batch",
        "types": []
    },
    "include": files,
    "exclude": ["node_modules", "skills", "scripts"]
}
with open('tsconfig.batch.json', 'w') as fh:
    json.dump(cfg, fh, indent=1)
print(f"batch files: {len(files)}")
PYEOF
  OUT=$(npx tsc -p tsconfig.batch.json 2>&1 | grep -E "error TS" | head -25)
  N=$(echo -n "$OUT" | grep -c "error TS" || true)
  TOTAL_ERRORS=$((TOTAL_ERRORS + N))
  echo "== BATCH $i ($N errors) =="
  [ -n "$OUT" ] && echo "$OUT"
  i=$((i + 1))
done

echo ""
if [ "$TOTAL_ERRORS" -eq 0 ]; then
  echo "RESULT: ALL BATCHES CLEAN ✓"
else
  echo "RESULT: $TOTAL_ERRORS TYPE ERRORS FOUND"
fi
rm -f tsconfig.batch.json scripts/.tsbuildinfo.batch
