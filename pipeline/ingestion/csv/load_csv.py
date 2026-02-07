from __future__ import annotations

from datetime import datetime
from pathlib import Path

from pipeline.utils.logging import get_logger

RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"
logger = get_logger("ingestion.csv")


def copy_csv(source_path: Path) -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    dest = RAW_DIR / f"csv_ingest_{timestamp}.csv"
    dest.write_bytes(source_path.read_bytes())
    return dest


def main() -> None:
    source = Path(__file__).parent / "sample.csv"
    output = copy_csv(source)
    logger.info("Copied CSV to %s", output)


if __name__ == "__main__":
    main()
