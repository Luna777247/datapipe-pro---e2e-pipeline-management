from __future__ import annotations

from pathlib import Path

import pandas as pd

from pipeline.utils.logging import get_logger

RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"
PROCESSED_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"
logger = get_logger("processing.pandas")


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    csv_files = sorted(RAW_DIR.glob("*.csv"))
    if not csv_files:
        raise SystemExit("No CSV files found in raw data")

    frames = [pd.read_csv(path) for path in csv_files]
    merged = pd.concat(frames, ignore_index=True)
    merged["metric_time"] = pd.to_datetime(merged["metric_time"], utc=True)
    merged = merged.dropna()

    output = PROCESSED_DIR / "metrics_cleaned.parquet"
    merged.to_parquet(output, index=False)
    logger.info("Wrote cleaned dataset to %s", output)


if __name__ == "__main__":
    main()
