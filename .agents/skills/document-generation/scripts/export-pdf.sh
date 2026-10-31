#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  printf 'Usage: bash export-pdf.sh SOURCE.docx OUTPUT.pdf [BREAK-BEFORE-HEADING ...]\n' >&2
  exit 1
fi
source_document=$1
output_pdf=$2
shift 2
skill_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
command -v pandoc >/dev/null
command -v typst >/dev/null
[[ -f "$source_document" ]]
[[ "$output_pdf" == *.pdf ]]
temporary_directory=$(mktemp -d)
trap 'rm -rf "$temporary_directory"' EXIT
export DOC_PAGE_BREAKS
DOC_PAGE_BREAKS=$(printf '%s\n' "$@")
pandoc "$source_document" \
  --pdf-engine=typst \
  --template="$skill_directory/assets/compact.typst" \
  --lua-filter="$skill_directory/scripts/layout.lua" \
  --variable="mainfont:${DOC_FONT:-Arial}" \
  --output="$temporary_directory/output.pdf"
mv "$temporary_directory/output.pdf" "$output_pdf"
printf 'Created %s\n' "$output_pdf"