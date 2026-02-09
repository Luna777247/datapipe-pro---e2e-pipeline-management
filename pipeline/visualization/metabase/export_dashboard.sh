#!/usr/bin/env bash
set -euo pipefail

# Exports a Metabase dashboard to JSON using the API.
# Requires:
# - MB_HOST (default http://localhost:3000)
# - MB_USER / MB_PASS (admin credentials)
# - DASHBOARD_ID

MB_HOST="${MB_HOST:-http://localhost:3000}"
MB_USER="${MB_USER:-admin@example.com}"
MB_PASS="${MB_PASS:-admin}"
DASHBOARD_ID="${DASHBOARD_ID:?Set DASHBOARD_ID to export}"

SESSION_JSON=$(curl -s -X POST "${MB_HOST}/api/session" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"${MB_USER}\",\"password\":\"${MB_PASS}\"}")

TOKEN=$(printf '%s' "${SESSION_JSON}" | python - <<'PY'
import json
import sys
print(json.load(sys.stdin).get('id', ''))
PY
)

if [[ -z "${TOKEN}" ]]; then
  echo "Failed to authenticate with Metabase. Check MB_USER/MB_PASS." >&2
  exit 1
fi

curl -s -X POST "${MB_HOST}/api/dashboard/${DASHBOARD_ID}/export" \
  -H "X-Metabase-Session: ${TOKEN}" \
  -o "pipeline/visualization/metabase/dashboard_export.json"

echo "Exported dashboard to pipeline/visualization/metabase/dashboard_export.json"
