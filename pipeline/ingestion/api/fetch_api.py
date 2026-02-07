from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

import requests

from pipeline.utils.logging import get_logger

RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"
logger = get_logger("ingestion.api")


def fetch_api(url: str) -> dict:
    response = requests.get(url, timeout=20)
    response.raise_for_status()
    return response.json()


def write_raw(payload: dict, name: str) -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    path = RAW_DIR / f"{name}_{timestamp}.json"
    path.write_text(json.dumps(payload, indent=2))
    return path


def main() -> None:
    payload = fetch_api("https://api.worldbank.org/v2/region?format=json")
    output = write_raw(payload, "worldbank_regions")
    logger.info("Wrote raw API payload to %s", output)


if __name__ == "__main__":
    main()
