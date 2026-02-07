from __future__ import annotations

from datetime import datetime
from pathlib import Path

import requests

from pipeline.utils.logging import get_logger

RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"
logger = get_logger("ingestion.scrape")


def fetch_html(url: str) -> str:
    response = requests.get(url, timeout=20)
    response.raise_for_status()
    return response.text


def write_raw(html: str, name: str) -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    path = RAW_DIR / f"{name}_{timestamp}.html"
    path.write_text(html)
    return path


def main() -> None:
    html = fetch_html("https://example.com/")
    output = write_raw(html, "example_home")
    logger.info("Wrote raw HTML to %s", output)


if __name__ == "__main__":
    main()
