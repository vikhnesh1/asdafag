# UK Wind Forecast & Day-Ahead Trading Dashboard

> An analytics platform and trading decision simulator built for UK electricity utilities procuring wholesale power on the Day-Ahead market (EPEX SPOT / Nord Pool).

---

## 1. Overview & Business Problem

In the UK electricity system, retail energy utilities must balance customer demand with supply. Wind generation offers zero marginal cost power, but its intermittency requires procurement of additional power (thermal plants, peakers, interconnectors) on the wholesale day-ahead market.

### The Day-Ahead Decision Dilemma

- Day-ahead market bids close strictly at **11:00 AM UK time on D-1** (the day prior to delivery).
- Trading desks commit to purchasing power for all 48 half-hour settlement periods of Day D up to **36 hours ahead** based on weather forecast models.
- **Under-forecasting wind**: Leads to over-buying expensive thermal power ("long" position), forcing the utility to spill power at low or negative cashout prices.
- **Over-forecasting wind**: Leads to under-procurement ("short" position), exposing the utility to severe Balancing Mechanism cashout charges (System Buy Price) that can spike to **£500–£2,000+/MWh**.

This dashboard gives trading desks full visibility into:

1. **Latest operational forecasts** versus actual delivery outturn.
2. **Day-Ahead gate closure snapshots** (reconstructing what was visible at 11:00 AM D-1).
3. **Statistical error metrics** (MAE, RMSE, nRMSE, Bias, Max Error) to size reserve margins.

---

## 2. System Architecture

```
[ Browser (React SPA) ]
   ├── Vite + React 18 + React Router
   ├── Ant Design 5 (Light / Dark themes)
   ├── Apache ECharts (interactive time-series, dataZoom, error bands)
   └── TanStack Query v5 (client-side state & caching)
            │
            │ REST API (/api/*) & Static Files
            ▼
[ Backend (FastAPI Web Service) ]
   ├── Python 3.12 + FastAPI + Uvicorn
   ├── SQLAlchemy 2.0 ORM + Pydantic v2 validation
   ├── SQLite Embedded DB (windforecast.db with WAL mode & indexes)
   └── Auto-Seeder (fetches live Elexon BMRS January 2026 data on first boot)
            │
            ▼
[ External: Elexon BMRS Insights API ]
   ├── FUELHH (Half-hourly outturn generation by fuel type: WIND)
   └── WINDFOR (Wind generation forecasts published by National Grid ESO)
```

---

## 3. Data & Metrics Methodology

### Datasets (January 2026 Scope)

- **Actual Outturn (`FUELHH`)**: 1,488 records (31 days × 48 settlement periods). Resolution: 30 minutes.
- **Forecasts (`WINDFOR`)**: 18,104 records published across January 2026 by National Grid ESO. Resolution: Hourly (`:00`), mapped forward to corresponding `:30` half-hour periods.

### Metrics Definitions

- **MAE (Mean Absolute Error)**: $\frac{1}{n}\sum |F_i - A_i|$ (MW) — average volume miss.
- **RMSE (Root Mean Squared Error)**: $\sqrt{\frac{1}{n}\sum (F_i - A_i)^2}$ (MW) — heavily penalizes large forecast outliers.
- **nRMSE (Normalized RMSE)**: $\text{RMSE} / 30,000\text{ MW}$ — normalized against the ~30 GW UK wind fleet.
- **Bias (Mean Error)**: $\frac{1}{n}\sum (F_i - A_i)$ (MW) — indicates systematic over-prediction ($>0$) or under-prediction ($<0$).
- **MAPE is intentionally omitted**: Wind generation drops to near-zero levels during lulls, causing percentage errors ($|F-A|/A$) to explode toward infinity ($>500\%$) and distorting monthly performance.

---

## 4. Quick Start Guide

### Option A: Run with Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/example/wind-forecast-dashboard.git
cd wind-forecast-dashboard

# Start backend, frontend, and automated database seeder
docker-compose up --build
```

- **Frontend**: Open `http://localhost:3001`
- **Backend API & Swagger UI**: Open `http://localhost:8000/docs`

---

### Option B: Local Native Development

#### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run automated seeder (fetches January 2026 data from Elexon)
python3 seed_data.py

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

#### 2. Frontend Setup

```bash
# Navigate to frontend (in a separate terminal)
cd frontend

# Install packages
npm install

# Start Vite dev server with proxy to backend
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 5. API Reference

| Endpoint                      | Method | Description                                                            |
| ----------------------------- | ------ | ---------------------------------------------------------------------- |
| `/api/overview`               | `GET`  | Executive KPIs (MWh generation, MAE, RMSE, bias) and monthly sparkline |
| `/api/actuals`                | `GET`  | Filterable half-hourly wind actual outturn time series                 |
| `/api/forecasts`              | `GET`  | Filterable wind forecasts for delivery target periods                  |
| `/api/forecast-vs-actual`     | `GET`  | Paired time series with signed error and error bands                   |
| `/api/accuracy-metrics`       | `GET`  | Statistical evaluation metrics (MAE, RMSE, nRMSE, Bias, Max Error)     |
| `/api/accuracy-metrics/daily` | `GET`  | Day-by-day error metrics for heatmaps and distribution charts          |
| `/api/day-ahead-view`         | `GET`  | Day-Ahead market view using forecasts published prior to 11:00 D-1     |
| `/api/data-export`            | `GET`  | Stream complete January 2026 paired dataset as CSV download            |
| `/docs`                       | `GET`  | Interactive Swagger UI API documentation                               |
