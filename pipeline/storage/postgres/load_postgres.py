from __future__ import annotations

import os
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine, text

from pipeline.utils.logging import get_logger

CURATED_DIR = Path(__file__).resolve().parents[2] / "data" / "curated"
logger = get_logger("storage.postgres")


def main() -> None:
    user = os.getenv("PIPELINE_PG_USER", "datapipe")
    password = os.getenv("PIPELINE_PG_PASSWORD", "datapipe")
    host = os.getenv("PIPELINE_PG_HOST", "warehouse-db")
    port = os.getenv("PIPELINE_PG_PORT", "5432")
    database = os.getenv("PIPELINE_PG_DB", "datapipe")
    engine = create_engine(f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}")
    df = pd.read_parquet(CURATED_DIR / "metrics_curated.parquet")
    if "avg_metric_value" in df.columns:
        df = df.rename(columns={"avg_metric_value": "metric_value"})

    run_time = pd.Timestamp.utcnow()
    with engine.begin() as connection:
        time_row = {
            "event_time": run_time.to_pydatetime(),
            "event_date": run_time.date(),
            "event_hour": run_time.hour,
        }
        result = connection.execute(
            text(
                "INSERT INTO dim_time (event_time, event_date, event_hour) "
                "VALUES (:event_time, :event_date, :event_hour) "
                "RETURNING time_id"
            ),
            time_row,
        )
        time_id = result.scalar_one()

        source_ids = {}
        for source in sorted(df["source"].unique()):
            existing = connection.execute(
                text("SELECT source_id FROM dim_sources WHERE source_name = :source"),
                {"source": source},
            ).scalar()
            if existing:
                source_ids[source] = existing
                continue

            inserted = connection.execute(
                text(
                    "INSERT INTO dim_sources (source_name, source_type, endpoint_url, frequency) "
                    "VALUES (:source_name, :source_type, :endpoint_url, :frequency) "
                    "RETURNING source_id"
                ),
                {
                    "source_name": source,
                    "source_type": source,
                    "endpoint_url": None,
                    "frequency": "daily",
                },
            )
            source_ids[source] = inserted.scalar_one()

        facts = []
        for _, row in df.iterrows():
            facts.append(
                {
                    "source_id": source_ids[row["source"]],
                    "time_id": time_id,
                    "metric_value": float(row["metric_value"]),
                    "metric_status": "ok",
                }
            )

        connection.execute(
            text(
                "INSERT INTO fact_metrics (source_id, time_id, metric_value, metric_status) "
                "VALUES (:source_id, :time_id, :metric_value, :metric_status)"
            ),
            facts,
        )

    logger.info("Loaded curated metrics into Postgres star schema")


if __name__ == "__main__":
    main()
