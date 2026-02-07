<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1hykAmJ8s3wbBot7feAyqab5AKEzVsu2T

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run the End-to-End Pipeline (Prefect + Postgres + Metabase)

**Prerequisites:** Docker, Docker Compose

1. Start services:
   `docker compose up -d --build`
2. Open Prefect UI:
   http://localhost:4200
3. The deployment is applied automatically and scheduled daily (UTC).
4. Run the flow once manually (optional):
   `docker compose exec -T prefect-worker python /opt/pipeline/orchestration/prefect/flow.py`
5. Open Metabase:
   http://localhost:3001

### Notes
- Pipeline scripts live under [pipeline](pipeline).
- Postgres warehouse uses `datapipe/datapipe` credentials and runs on port 5432.
- Orchestration runs on Prefect (open-source self-hosted).
- Prefect worker image includes Java for PySpark.

### Metabase Dashboard Export
Use the export helper once the dashboard is created in Metabase:
`MB_USER=admin@example.com MB_PASS=admin DASHBOARD_ID=2 ./pipeline/visualization/metabase/export_dashboard.sh`

Current dashboard id for `DataPipe Pro - Time Series`: 2

You can also export by dashboard name:
`DASHBOARD_NAME="DataPipe Pro - Time Series" MB_USER=admin@example.com MB_PASS=admin ./pipeline/visualization/metabase/export_dashboard_auto.sh`

### Metabase Refresh (auto)
Set these environment variables on the Prefect worker to enable automatic dashboard refresh (see `docker-compose.yml`):
- `MB_USER`
- `MB_PASS`
- `DASHBOARD_NAME` or `DASHBOARD_ID`

Tip: set them via `docker compose --env-file .env up -d` and add values to `.env`.

The refresh task warms the card cache after each successful load.
