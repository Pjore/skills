#!/usr/bin/env bash
# redact-filter.sh — Replace secret values in text files with [REDACTED:<VARNAME>].
#
# Usage:
#   .agents/skills/credential-security/scripts/redact-filter.sh <file> <VAR1> [<VAR2> ...]
#
# Loads credential values by sourcing load-credentials.sh (this skill's scripts/ dir),
# then rewrites every occurrence of each variable's value in <file> with the placeholder
# [REDACTED:<VARNAME>]. The file is modified in place. Secret values are never echoed
# or logged.
#
# Supports text files only (JSON logs, YAML, plain text). For screenshots (binary PNG/JPEG),
# do not capture the screen during credential-entry steps rather than running this script —
# binary image redaction is out of scope.
#
# Example:
#   source .agents/skills/credential-security/scripts/load-credentials.sh
#   .agents/skills/credential-security/scripts/redact-filter.sh \
#       references/network-log-book-invoice.json \
#       DOOER_EMAIL DOOER_PASSWORD

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CREDS_SCRIPT="${SCRIPT_DIR}/load-credentials.sh"

if [[ ! -f "${CREDS_SCRIPT}" ]]; then
    echo "ERROR: credentials loader not found at ${CREDS_SCRIPT}" >&2
    exit 1
fi

# Source credentials silently — never print values. Pass an explicit ".env" so
# the loader doesn't fall back to this script's own $1 (the target file) as its
# ENV_FILE — `source` does not create new positional parameters on its own.
# shellcheck source=/dev/null
source "${CREDS_SCRIPT}" .env > /dev/null 2>&1

FILE="${1:?Usage: redact-filter.sh <file> <VAR1> [VAR2 ...]}"
shift

if [[ ! -f "${FILE}" ]]; then
    echo "ERROR: file not found: ${FILE}" >&2
    exit 1
fi

TMPFILE="$(mktemp)"
cp "${FILE}" "${TMPFILE}"

REDACTED_COUNT=0

for VAR in "$@"; do
    VALUE="${!VAR:-}"
    if [[ -z "${VALUE}" ]]; then
        echo "WARNING: ${VAR} is empty or unset — no redaction applied for this variable" >&2
        continue
    fi

    # Delegate string replacement to Python:
    #   - No regex escaping needed (plain string replace)
    #   - No shell injection risk from secret values
    #   - Handles special characters, multi-line values, and Unicode safely
    # The secret value is read from the environment inside Python, not passed as a CLI arg.
    python3 - "${TMPFILE}" "${VAR}" <<'PYEOF'
import sys, os

filepath = sys.argv[1]
varname  = sys.argv[2]
secret   = os.environ.get(varname, "")

if not secret:
    sys.exit(0)

with open(filepath, "r", encoding="utf-8", errors="replace") as fh:
    content = fh.read()

replaced = content.replace(secret, f"[REDACTED:{varname}]")

with open(filepath, "w", encoding="utf-8") as fh:
    fh.write(replaced)
PYEOF

    REDACTED_COUNT=$((REDACTED_COUNT + 1))
done

mv "${TMPFILE}" "${FILE}"
echo "Redaction complete: ${FILE} (${REDACTED_COUNT} variable(s) processed)"
