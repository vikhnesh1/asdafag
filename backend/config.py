"""Application configuration and constants."""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_PATH = os.getenv("DATABASE_PATH", str(DATA_DIR / "windforecast.db"))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_PATH}")
ASYNC_DATABASE_URL = os.getenv("ASYNC_DATABASE_URL", f"sqlite+aiosqlite:///{DATABASE_PATH}")

# Elexon API Endpoints
ELEXON_BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"
FUELHH_ENDPOINT = f"{ELEXON_BASE_URL}/FUELHH/stream"
WINDFOR_ENDPOINT = f"{ELEXON_BASE_URL}/WINDFOR/stream"

# Domain Constants
UK_INSTALLED_WIND_CAPACITY_MW = 30000.0  # ~30 GW reference for nRMSE
DAY_AHEAD_GATE_CLOSURE_HOUR = 11  # 11:00 UK time (D-1)
JANUARY_2026_START = "2026-01-01"
JANUARY_2026_END = "2026-01-31"
EXPECTED_MONTH_PERIODS = 1488  # 31 days * 48 half-hours
