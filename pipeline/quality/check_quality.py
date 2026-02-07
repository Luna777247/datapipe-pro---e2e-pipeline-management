from __future__ import annotations

from pathlib import Path

import pandas as pd

from pipeline.utils.logging import get_logger

PROCESSED_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"

logger = get_logger("quality.check")


def main() -> None:
    path = PROCESSED_DIR / "metrics_cleaned.parquet"
    if not path.exists():
        raise SystemExit("Quality check failed: metrics_cleaned.parquet not found")

    df = pd.read_parquet(path)
    required_columns = {"id", "source", "metric_value", "metric_time"}
    missing = required_columns.difference(df.columns)
    if missing:
        raise SystemExit(f"Quality check failed: missing columns {sorted(missing)}")

    if df.isna().any().any():
        raise SystemExit("Quality check failed: null values present")

    if (df["metric_value"] < 0).any():
        raise SystemExit("Quality check failed: negative metric_value detected")

    if df.empty or len(df) < 3:
        raise SystemExit("Quality check failed: not enough rows")

    logger.info("Quality checks passed for %s", path)


if __name__ == "__main__":
    main()
