# DataPipe Pro - End-to-End Pipeline Management

DataPipe Pro is a small, end-to-end data pipeline demo with a React UI and a runnable backend stack. It includes ingestion, processing, quality checks, orchestration, storage, and visualization artifacts to show a realistic pipeline lifecycle.

## Key Features

- React + Vite UI for pipeline management.
- Ingestion samples for API, CSV, and web scraping.
- Processing examples in Pandas and PySpark.
- Quality checks and a star schema for analytics.
- Prefect orchestration with Postgres warehouse and Metabase dashboards.

## Run the UI Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
3. Start the dev server:
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
   http://localhost:3000

## Notes

- Pipeline scripts live under [pipeline](pipeline).
- Postgres warehouse uses `datapipe/datapipe` credentials and runs on port 5432.
- Orchestration runs on Prefect (open-source self-hosted).
- Prefect worker image includes Java for PySpark.

## Metabase Dashboard Export

Use the export helper once the dashboard is created in Metabase:
`MB_USER=admin@example.com MB_PASS=admin DASHBOARD_ID=2 ./pipeline/visualization/metabase/export_dashboard.sh`

Current dashboard id for `DataPipe Pro - Time Series`: 2

You can also export by dashboard name:
`DASHBOARD_NAME="DataPipe Pro - Time Series" MB_USER=admin@example.com MB_PASS=admin ./pipeline/visualization/metabase/export_dashboard_auto.sh`

## Metabase Refresh (Auto)

Set these environment variables on the Prefect worker to enable automatic dashboard refresh (see `docker-compose.yml`):
- `MB_USER`
- `MB_PASS`
- `DASHBOARD_NAME` or `DASHBOARD_ID`

Tip: set them via `docker compose --env-file .env up -d` and add values to `.env`.

The refresh task warms the card cache after each successful load.
