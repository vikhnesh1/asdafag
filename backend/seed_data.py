"""Data seeder for UK Wind Actuals (FUELHH) and Forecasts (WINDFOR) from Elexon BMRS.

Fetches data for January 2026, parses the payloads, and inserts them into SQLite.
"""

import json
import logging
import sqlite3
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from pathlib import Path

from config import (
    DATABASE_PATH,
    FUELHH_ENDPOINT,
    WINDFOR_ENDPOINT,
    JANUARY_2026_START,
    JANUARY_2026_END,
    EXPECTED_MONTH_PERIODS,
)
from database import init_db_raw, get_raw_connection

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("seeder")

HEADERS = {
    "Accept": "application/json",
    "User-Agent": "WindForecastDashboard-Seeder/1.0",
}


def fetch_json(url: str, timeout: int = 45) -> list[dict]:
    """Fetch and parse JSON from a URL with timeout and error handling."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
            data = json.loads(raw)
            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and "data" in data and isinstance(data["data"], list):
                return data["data"]
            return []
    except urllib.error.HTTPError as e:
        logger.error(f"HTTP error {e.code} for URL: {url}")
        return []
    except Exception as e:
        logger.error(f"Request error for URL {url}: {e}")
        return []


def seed_actuals(conn: sqlite3.Connection) -> int:
    """Fetch FUELHH actual wind generation for January 2026 and store in DB."""
    logger.info("Fetching FUELHH (Actuals) for 2026-01-01 to 2026-01-31...")
    url = f"{FUELHH_ENDPOINT}?settlementDateFrom={JANUARY_2026_START}&settlementDateTo={JANUARY_2026_END}"
    
    data = fetch_json(url, timeout=60)
    if not data:
        logger.warning("No FUELHH data returned from Elexon stream!")
        return 0

    wind_records = []
    for item in data:
        if item.get("fuelType") == "WIND" and item.get("generation") is not None:
            wind_records.append((
                item["startTime"],
                item.get("settlementDate", item["startTime"][:10]),
                int(item.get("settlementPeriod", 0)),
                float(item["generation"]),
            ))

    logger.info(f"Filtered {len(wind_records)} WIND actual records. Inserting into SQLite...")
    with conn:
        conn.executemany("""
            INSERT OR REPLACE INTO wind_actuals 
            (start_time, settlement_date, settlement_period, generation)
            VALUES (?, ?, ?, ?);
        """, wind_records)

    logger.info(f"✓ Successfully seeded {len(wind_records)} actual records")
    return len(wind_records)


def seed_forecasts(conn: sqlite3.Connection) -> int:
    """Fetch WINDFOR forecasts published for January 2026 delivery in time chunks."""
    logger.info("Fetching WINDFOR (Forecasts) in 5-day publication windows...")
    
    # We query publication times from 2025-12-30 to 2026-02-01
    # to catch all forecasts covering January 2026 delivery periods.
    windows = [
        ("2025-12-30T00:00:00Z", "2026-01-05T23:59:59Z"),
        ("2026-01-06T00:00:00Z", "2026-01-11T23:59:59Z"),
        ("2026-01-12T00:00:00Z", "2026-01-17T23:59:59Z"),
        ("2026-01-18T00:00:00Z", "2026-01-23T23:59:59Z"),
        ("2026-01-24T00:00:00Z", "2026-01-29T23:59:59Z"),
        ("2026-01-30T00:00:00Z", "2026-02-01T23:59:59Z"),
    ]

    total_inserted = 0
    for idx, (win_from, win_to) in enumerate(windows, 1):
        url = f"{WINDFOR_ENDPOINT}?publishDateTimeFrom={win_from}&publishDateTimeTo={win_to}"
        logger.info(f"[{idx}/{len(windows)}] Fetching WINDFOR window: {win_from[:10]} to {win_to[:10]}...")
        data = fetch_json(url, timeout=60)
        
        chunk_records = []
        for item in data:
            st = item.get("startTime")
            pt = item.get("publishTime")
            gen = item.get("generation")
            # Only keep forecasts targeting January 2026
            if st and pt and gen is not None and st.startswith("2026-01"):
                chunk_records.append((st, pt, float(gen)))

        if chunk_records:
            with conn:
                conn.executemany("""
                    INSERT OR REPLACE INTO wind_forecasts
                    (start_time, publish_time, generation)
                    VALUES (?, ?, ?);
                """, chunk_records)
            total_inserted += len(chunk_records)
            logger.info(f"  Inserted {len(chunk_records)} forecasts for January 2026 from window {idx}")
        else:
            logger.info(f"  Window {idx} returned no matching January 2026 forecasts")

        # Brief pause to respect API rate limits
        time.sleep(0.3)

    logger.info(f"✓ Successfully seeded {total_inserted} total forecast records")
    return total_inserted


def run_seeder(force: bool = False):
    """Run data ingestion and verify row counts."""
    init_db_raw()
    conn = get_raw_connection()

    actuals_count = conn.execute("SELECT COUNT(*) FROM wind_actuals;").fetchone()[0]
    forecasts_count = conn.execute("SELECT COUNT(*) FROM wind_forecasts;").fetchone()[0]

    logger.info(f"Current DB state: {actuals_count} actuals, {forecasts_count} forecasts")

    if not force and actuals_count >= EXPECTED_MONTH_PERIODS and forecasts_count > 1000:
        logger.info("Database is already seeded. Use force=True to re-seed.")
        conn.close()
        return

    start_time = time.time()
    seed_actuals(conn)
    seed_forecasts(conn)
    duration = time.time() - start_time

    # Final count verification
    final_actuals = conn.execute("SELECT COUNT(*) FROM wind_actuals;").fetchone()[0]
    final_forecasts = conn.execute("SELECT COUNT(*) FROM wind_forecasts;").fetchone()[0]
    conn.close()

    logger.info("=" * 60)
    logger.info(f"Seeding completed in {duration:.1f}s")
    logger.info(f"Final Count - Actuals:   {final_actuals:,} records")
    logger.info(f"Final Count - Forecasts: {final_forecasts:,} records")
    logger.info("=" * 60)


if __name__ == "__main__":
    force_seed = "--force" in sys.argv
    run_seeder(force=force_seed)
