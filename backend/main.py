"""FastAPI entrypoint for Wind Forecast Dashboard."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import init_db
from seed_data import run_seeder
from routers import actuals, comparison, accuracy, day_ahead, export, forecasts, overview

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle hook: initialize database and ensure data is seeded."""
    logger.info("Initializing database schema...")
    init_db()
    logger.info("Verifying seed data...")
    run_seeder(force=False)
    yield
    logger.info("Shutting down Wind Forecast Dashboard application.")


app = FastAPI(
    title="UK Wind Forecast Dashboard API",
    description="Analytics and day-ahead wholesale electricity trading decisions based on Elexon BMRS data.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(overview.router)
app.include_router(actuals.router)
app.include_router(forecasts.router)
app.include_router(comparison.router)
app.include_router(accuracy.router)
app.include_router(day_ahead.router)
app.include_router(export.router)


@app.get("/api/health")
def health_check():
    """Health check endpoint for container probes."""
    return {"status": "ok", "service": "wind-forecast-dashboard"}


# Static files mount for single-container production deployment
frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
