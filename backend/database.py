"""Database engine and session management for SQLite."""

import sqlite3
from typing import AsyncGenerator
from config import DATABASE_PATH, DATABASE_URL

# Direct sqlite3 connection helper (useful for scripts & lightweight seeder)
def get_raw_connection() -> sqlite3.Connection:
    """Get a raw sqlite3 connection with row_factory set to Row."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    return conn


def init_db_raw():
    """Initialize SQLite tables directly via raw SQL if SQLAlchemy is not loaded."""
    conn = get_raw_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS wind_actuals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                start_time TEXT UNIQUE NOT NULL,
                settlement_date TEXT NOT NULL,
                settlement_period INTEGER NOT NULL,
                generation REAL NOT NULL
            );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_actuals_start_time ON wind_actuals(start_time);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_actuals_settlement ON wind_actuals(settlement_date, settlement_period);")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS wind_forecasts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                start_time TEXT NOT NULL,
                publish_time TEXT NOT NULL,
                generation REAL NOT NULL,
                UNIQUE(start_time, publish_time)
            );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_forecasts_start_time ON wind_forecasts(start_time);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_forecasts_publish_time ON wind_forecasts(publish_time);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_forecasts_lookup ON wind_forecasts(start_time, publish_time);")
    conn.close()


# SQLAlchemy setup (loaded when sqlalchemy is present)
try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker, Session
    from models import Base

    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def init_db():
        """Create database tables using SQLAlchemy models."""
        Base.metadata.create_all(bind=engine)

    def get_db():
        """FastAPI dependency for sync DB sessions."""
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

except ImportError:
    init_db = init_db_raw
    SessionLocal = None
    engine = None
