from __future__ import annotations

import os
from typing import Iterable

import requests

from pipeline.utils.logging import get_logger

logger = get_logger("metabase.refresh")


def get_session(host: str, user: str, password: str) -> str:
    response = requests.post(
        f"{host}/api/session",
        json={"username": user, "password": password},
        timeout=20,
    )
    response.raise_for_status()
    return response.json().get("id", "")


def get_dashboard_id(host: str, token: str, name: str | None, dashboard_id: str | None) -> int:
    if dashboard_id:
        return int(dashboard_id)

    if not name:
        raise ValueError("DASHBOARD_NAME or DASHBOARD_ID must be set")

    response = requests.get(
        f"{host}/api/dashboard",
        headers={"X-Metabase-Session": token},
        timeout=20,
    )
    response.raise_for_status()
    for item in response.json():
        if item.get("name") == name:
            return int(item.get("id"))

    raise ValueError(f"Dashboard '{name}' not found")


def get_card_ids(host: str, token: str, dashboard_id: int) -> Iterable[int]:
    response = requests.get(
        f"{host}/api/dashboard/{dashboard_id}",
        headers={"X-Metabase-Session": token},
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    for card in payload.get("ordered_cards", []):
        card_id = card.get("card_id") or card.get("card", {}).get("id")
        if card_id:
            yield int(card_id)


def refresh_card(host: str, token: str, card_id: int) -> None:
    response = requests.post(
        f"{host}/api/card/{card_id}/query/json",
        headers={"X-Metabase-Session": token},
        timeout=60,
    )
    response.raise_for_status()


def main() -> None:
    host = os.getenv("MB_HOST", "http://metabase:3000")
    user = os.getenv("MB_USER")
    password = os.getenv("MB_PASS")
    dashboard_name = os.getenv("DASHBOARD_NAME")
    dashboard_id = os.getenv("DASHBOARD_ID")

    if not user or not password:
        logger.warning("MB_USER/MB_PASS not set. Skipping dashboard refresh.")
        return

    token = get_session(host, user, password)
    if not token:
        raise SystemExit("Metabase auth failed: missing session token")

    dash_id = get_dashboard_id(host, token, dashboard_name, dashboard_id)
    card_ids = list(get_card_ids(host, token, dash_id))
    if not card_ids:
        logger.warning("No cards found for dashboard %s", dash_id)
        return

    logger.info("Refreshing %s cards for dashboard %s", len(card_ids), dash_id)
    for card_id in card_ids:
        refresh_card(host, token, card_id)

    logger.info("Metabase refresh complete")


if __name__ == "__main__":
    main()
