from __future__ import annotations

from pathlib import Path

import pandas as pd
from pyspark.sql import SparkSession

from pipeline.utils.logging import get_logger

PROCESSED_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"
CURATED_DIR = Path(__file__).resolve().parents[2] / "data" / "curated"
logger = get_logger("processing.spark")


def main() -> None:
    CURATED_DIR.mkdir(parents=True, exist_ok=True)
    input_path = PROCESSED_DIR / "metrics_cleaned.parquet"
    output_path = CURATED_DIR / "metrics_curated.parquet"

    try:
        spark = SparkSession.builder.appName("datapipe-pro").getOrCreate()
        df = spark.read.parquet(str(input_path))
        curated = (
            df.groupBy("source")
            .agg({"metric_value": "avg"})
            .withColumnRenamed("avg(metric_value)", "avg_metric_value")
        )
        curated.write.mode("overwrite").parquet(str(output_path))
        logger.info("Wrote curated dataset to %s using Spark", output_path)
        spark.stop()
    except Exception as exc:
        logger.warning("Spark unavailable, falling back to pandas: %s", exc)
        df = pd.read_parquet(input_path)
        curated = df.groupby("source", as_index=False)["metric_value"].mean()
        curated = curated.rename(columns={"metric_value": "avg_metric_value"})
        curated.to_parquet(output_path, index=False)
        logger.info("Wrote curated dataset to %s using pandas", output_path)


if __name__ == "__main__":
    main()
