from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from prefect import flow, task

BASE_DIR = Path(__file__).resolve().parents[2]


def run_script(script_path: Path) -> None:
    subprocess.run([sys.executable, str(script_path)], check=True)


@task(retries=2, retry_delay_seconds=30)
def ingest_api() -> None:
    run_script(BASE_DIR / "ingestion/api/fetch_api.py")


@task(retries=2, retry_delay_seconds=30)
def ingest_web_scraping() -> None:
    run_script(BASE_DIR / "ingestion/web_scraping/scrape_site.py")


@task(retries=2, retry_delay_seconds=30)
def ingest_csv() -> None:
    run_script(BASE_DIR / "ingestion/csv/load_csv.py")


@task(retries=2, retry_delay_seconds=30)
def process_pandas() -> None:
    run_script(BASE_DIR / "processing/pandas/clean_merge.py")


@task(retries=2, retry_delay_seconds=30)
def quality_check() -> None:
    run_script(BASE_DIR / "quality/check_quality.py")


@task(retries=2, retry_delay_seconds=30)
def process_pyspark() -> None:
    run_script(BASE_DIR / "processing/pyspark/spark_transform.py")


@task(retries=2, retry_delay_seconds=30)
def load_postgres() -> None:
    run_script(BASE_DIR / "storage/postgres/load_postgres.py")


@task(retries=2, retry_delay_seconds=30)
def refresh_dashboard() -> None:
    run_script(BASE_DIR / "visualization/metabase/refresh_dashboard.py")


@flow(name="e2e_data_pipeline_daily")
def e2e_data_pipeline_daily() -> None:
    api = ingest_api.submit()
    scrape = ingest_web_scraping.submit()
    csv = ingest_csv.submit()

    pandas_task = process_pandas.submit(wait_for=[api, scrape, csv])
    quality_task = quality_check.submit(wait_for=[pandas_task])
    pyspark_task = process_pyspark.submit(wait_for=[quality_task])
    load_task = load_postgres.submit(wait_for=[pyspark_task])
    refresh_dashboard.submit(wait_for=[load_task])


if __name__ == "__main__":
    e2e_data_pipeline_daily()
