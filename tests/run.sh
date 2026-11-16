#!/usr/bin/env bash
# Kjører alle frontend-testene i Chromium via verify-webpage-skillen.
# Bruk:  tests/run.sh                (alle)
#        tests/run.sh import-modes   (én test, uten .mjs)
# VERIFY_WEBPAGE_DIR kan peke på en annen plassering for skillen.
set -euo pipefail
cd "$(dirname "$0")/.."

SKILL_DIR=${VERIFY_WEBPAGE_DIR:-$HOME/.claude/skills/verify-webpage}
[[ -f "$SKILL_DIR/scripts/verify.mjs" ]] || { echo "Fant ikke $SKILL_DIR/scripts/verify.mjs (sett VERIFY_WEBPAGE_DIR)." >&2; exit 2; }

test_args=()
if (( $# > 0 )); then
  for name in "$@"; do test_args+=(--test "tests/${name%.mjs}.mjs"); done
else
  for file in tests/*.mjs; do
    [[ "$file" == tests/helpers.mjs ]] || test_args+=(--test "$file")
  done
fi

mkdir -p .tmp
exec node "$SKILL_DIR/scripts/verify.mjs" --root . --out .tmp/verify-out --viewports desktop "${test_args[@]}"
