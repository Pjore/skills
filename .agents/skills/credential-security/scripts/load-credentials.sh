#!/usr/bin/env bash
# load-credentials.sh — Source environment variables from .env
# Usage: source .agents/skills/credential-security/scripts/load-credentials.sh
#
# NOTE: Do NOT use `set -euo pipefail` here. This script is designed to be
# sourced into the caller's shell. Any `set` options applied here would
# persistently modify the caller's shell, causing it to exit on any
# subsequent error (including running other scripts that return non-zero).

ENV_FILE="${1:-.env}"

if [[ ! -f "${ENV_FILE}" ]]; then
  # In CI/runner environments credentials are injected as environment variables
  # from GitHub Actions secrets — .env is not cloned (it is gitignored).
  # If any variable already looks set, treat this as a no-op success.
  if [[ -n "$(env | grep -E '^[A-Z0-9_]+=' | head -1)" ]]; then
    echo "✓ Credentials already present in environment (runner/CI mode — .env not required)"
    return 0 2>/dev/null || exit 0
  fi
  echo "✗ ${ENV_FILE} not found. Copy .env.example to .env and fill in values."
  return 1 2>/dev/null || exit 1
fi

BEFORE_VARS=$(env | cut -d= -f1 | sort)

set -a
source "${ENV_FILE}"
set +a

AFTER_VARS=$(env | cut -d= -f1 | sort)
LOADED_KEYS=$(comm -13 <(echo "$BEFORE_VARS") <(echo "$AFTER_VARS"))

echo "✓ Credentials loaded from ${ENV_FILE}"
if [[ -n "$LOADED_KEYS" ]]; then
  echo "  Keys: ${LOADED_KEYS//$'\n'/, }"
fi
