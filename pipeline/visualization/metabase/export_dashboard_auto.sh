#!/usr/bin/env bash
set -euo pipefail

# Exports a Metabase dashboard to JSON by dashboard name.
# Requires:
# - MB_HOST (default http://localhost:3000)
# - MB_USER / MB_PASS (admin credentials)
# - DASHBOARD_NAME

MB_HOST="${MB_HOST:-http://localhost:3000}"
MB_USER="${MB_USER:-admin@example.com}"
MB_PASS="${MB_PASS:-admin}"
DASHBOARD_NAME="${DASHBOARD_NAME:?Set DASHBOARD_NAME to export}"

SESSION_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "${MB_HOST}/api/session" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"${MB_USER}\",\"password\":\"${MB_PASS}\"}")
SESSION_BODY=$(printf '%s' "${SESSION_RESPONSE}" | head -n -1)
SESSION_STATUS=$(printf '%s' "${SESSION_RESPONSE}" | tail -n 1)

if [[ "${SESSION_STATUS}" != "200" ]]; then
  echo "Metabase auth failed with status ${SESSION_STATUS}." >&2
  echo "Response: ${SESSION_BODY}" >&2
  exit 1
fi

TOKEN=$(printf '%s' "${SESSION_BODY}" | python -c 'import json,sys
raw = sys.stdin.read()
if not raw:
    print("", end="")
    raise SystemExit(0)
try:
    print(json.loads(raw).get("id", ""))
except json.JSONDecodeError:
    sys.stderr.write("Metabase session response is not JSON:\n")
    sys.stderr.write(raw[:300] + "\n")
    raise SystemExit(1)
')

if [[ -z "${TOKEN}" ]]; then
  echo "Failed to parse session token. Response: ${SESSION_BODY}" >&2
  exit 1
fi

DASHBOARD_RESPONSE=$(curl -sS -w "\n%{http_code}" -H "X-Metabase-Session: ${TOKEN}" "${MB_HOST}/api/dashboard")
DASHBOARD_BODY=$(printf '%s' "${DASHBOARD_RESPONSE}" | head -n -1)
DASHBOARD_STATUS=$(printf '%s' "${DASHBOARD_RESPONSE}" | tail -n 1)

if [[ "${DASHBOARD_STATUS}" != "200" ]]; then
  echo "Metabase dashboard list failed with status ${DASHBOARD_STATUS}." >&2
  echo "Response: ${DASHBOARD_BODY}" >&2
  exit 1
fi

DASHBOARD_ID=$(printf '%s' "${DASHBOARD_BODY}" | DASHBOARD_NAME="${DASHBOARD_NAME}" python -c 'import json,os,sys
name = os.environ.get("DASHBOARD_NAME")
raw = sys.stdin.read()
if not raw:
    print("", end="")
    raise SystemExit(0)
try:
    items = json.loads(raw)
except json.JSONDecodeError:
    sys.stderr.write("Metabase dashboard list is not JSON:\n")
    sys.stderr.write(raw[:300] + "\n")
    raise SystemExit(1)
match = next((item for item in items if item.get("name") == name), None)
print(match.get("id") if match else "")
')

if [[ -z "${DASHBOARD_ID}" ]]; then
  echo "Dashboard '${DASHBOARD_NAME}' not found." >&2
  exit 1
fi

EXPORT_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "${MB_HOST}/api/dashboard/${DASHBOARD_ID}/export" \
  -H "X-Metabase-Session: ${TOKEN}" \
  -o "pipeline/visualization/metabase/dashboard_export.json")
EXPORT_STATUS=$(printf '%s' "${EXPORT_RESPONSE}" | tail -n 1)

if [[ "${EXPORT_STATUS}" == "404" ]]; then
  echo "Export endpoint not available. Falling back to dashboard JSON." >&2
  curl -sS -H "X-Metabase-Session: ${TOKEN}" "${MB_HOST}/api/dashboard/${DASHBOARD_ID}" \
    -o "pipeline/visualization/metabase/dashboard_export.json"
  echo "Saved dashboard JSON to pipeline/visualization/metabase/dashboard_export.json"
  exit 0
fi

if [[ "${EXPORT_STATUS}" != "200" ]]; then
  echo "Metabase export failed with status ${EXPORT_STATUS}." >&2
  echo "Response: $(printf '%s' "${EXPORT_RESPONSE}" | head -n -1)" >&2
  exit 1
fi

echo "Exported dashboard ${DASHBOARD_ID} to pipeline/visualization/metabase/dashboard_export.json"
