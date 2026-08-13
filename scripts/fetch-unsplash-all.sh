#!/usr/bin/env bash
# Works through the whole imagery brief, respecting Unsplash's hourly cap.
#
#   bash scripts/fetch-unsplash-all.sh
#
# A demo Unsplash app allows 50 API requests/hour. Each topic costs one search
# plus one download-registration per image (registration is required by the API
# terms, and it counts), so roughly 4 requests per topic — about 12 topics an
# hour. The full brief is ~37 topics, so this takes a few hours wall-clock.
#
# Parallelism cannot help here: the cap is per application, not per process.
# Running ten workers would just burn the same 50 requests faster and then all
# fail together. So this is deliberately serial, and leans on the fetch script
# already being resume-safe — it skips files that exist and stops cleanly when
# it is rate limited, which makes "run again later" the whole recovery strategy.
set -uo pipefail

cd "$(dirname "$0")/.."

MAX_ROUNDS=${MAX_ROUNDS:-8}
# 65 minutes: the window is rolling, so a little margin beats guessing.
WAIT=${WAIT:-3900}

for round in $(seq 1 "$MAX_ROUNDS"); do
  echo ""
  echo "=== round $round/$MAX_ROUNDS · $(date '+%H:%M:%S') ==="
  out=$(node scripts/fetch-unsplash.mjs 2>&1)
  echo "$out" | tail -25

  if echo "$out" | grep -q "0 failed"; then
    echo ""
    echo "✓ brief complete — nothing left to fetch."
    exit 0
  fi

  if ! echo "$out" | grep -qi "rate limited"; then
    # Failures that are not the rate limit will not fix themselves by waiting;
    # they mean a query returned too few results and needs rewording.
    echo ""
    echo "! stopped with non-rate-limit failures. Reword the reported queries in"
    echo "  scripts/imagery-topics.mjs, then re-run."
    exit 1
  fi

  if [ "$round" -lt "$MAX_ROUNDS" ]; then
    echo "  rate limited — sleeping $((WAIT / 60))m before the next round"
    sleep "$WAIT"
  fi
done

echo "! hit MAX_ROUNDS. Re-run to continue; completed topics are skipped."
exit 1
